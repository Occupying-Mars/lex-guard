import { NextResponse } from 'next/server'
import { getEsClient } from '@/lib/elasticsearch'
import crypto from 'crypto'

function normalizeToolArgs(payload: any) {
  const toolCall = payload?.choices?.[0]?.message?.tool_calls?.[0]
  const args = toolCall?.function?.arguments
  if (typeof args === 'string') return args
  if (typeof args === 'object') return JSON.stringify(args)
  return null
}

function stripCodeFences(text: string) {
  return text.replace(/```json\\n?/gi, '').replace(/```/g, '').trim()
}

function parseJsonFromText(text: string) {
  const cleaned = stripCodeFences(text)
  const first = cleaned.indexOf('{')
  const last = cleaned.lastIndexOf('}')
  const slice = first === -1 || last === -1 ? cleaned : cleaned.slice(first, last + 1)
  return JSON.parse(slice)
}

const violationTool = {
  type: 'function',
  function: {
    name: 'emit_violations',
    description: 'return compliance violations found in the contract',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        violations: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              regulation_id: { type: ['string', 'null'] },
              severity: { type: 'string' },
              violation_type: { type: 'string' },
              description: { type: 'string' },
              affected_clause: { type: 'string' },
              suggested_fix: { type: 'string' }
            },
            required: [
              'regulation_id',
              'severity',
              'violation_type',
              'description',
              'affected_clause',
              'suggested_fix'
            ]
          }
        }
      },
      required: ['violations']
    }
  }
}

export async function POST(request: Request) {
  const openrouterKey = request.headers.get('x-openrouter-key')
  const openrouterModel = request.headers.get('x-openrouter-model') || 'anthropic/claude-3-haiku'
  const esUrl = request.headers.get('x-es-url') || undefined
  const esKey = request.headers.get('x-es-key') || undefined

  if (!openrouterKey) {
    return NextResponse.json({ error: 'missing openrouter api key' }, { status: 401 })
  }

  const body = await request.json()
  const contractId = body.contract_id as string
  const categories = (body.regulation_categories as string[]) || []

  if (!contractId) {
    return NextResponse.json({ error: 'missing contract_id' }, { status: 400 })
  }

  const es = getEsClient({ url: esUrl, apiKey: esKey })
  const contractRes = await es.get({ index: 'contracts', id: contractId })
  const contract = contractRes._source as any

  const regQuery =
    categories.length > 0
      ? { terms: { category: categories } }
      : contract?.jurisdiction
        ? { term: { jurisdiction: contract.jurisdiction } }
        : { match_all: {} }

  let regulations: any[] = []
  try {
    const regsRes = await es.search({
      index: 'regulations',
      size: 50,
      query: regQuery
    })
    regulations = regsRes.hits.hits.map((hit) => hit._source)
  } catch (err: any) {
    if (err?.meta?.body?.error?.type === 'index_not_found_exception') {
      return NextResponse.json(
        { error: 'regulations index missing. run /api/setup then /api/regulations/seed.' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: err?.message || 'regulations query failed' }, { status: 500 })
  }

  const prompt = `you are a contract compliance analyst. compare the contract against the regulations and return violations.\n\ncontract id: ${contractId}\ncontract text:\n${contract?.full_text || ''}\n\ncontract clauses:\n${JSON.stringify(contract?.clauses || [])}\n\nregulations:\n${JSON.stringify(regulations)}\n\nrequirements:\n- only flag violations supported by contract text and regulation text\n- include affected clause and suggested fix\n- severity must be one of: critical, high, medium, low\n- respond using the emit_violations tool`

  const llm = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openrouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://lexguard.vercel.app',
      'X-Title': 'LexGuard Contract Scanner'
    },
    body: JSON.stringify({
      model: openrouterModel,
      messages: [{ role: 'user', content: prompt }],
      tools: [violationTool],
      tool_choice: { type: 'function', function: { name: 'emit_violations' } },
      max_tokens: 2000
    })
  })

  if (!llm.ok) {
    const errText = await llm.text()
    return NextResponse.json({ error: errText || 'openrouter scan failed' }, { status: 502 })
  }

  const payload = await llm.json()
  const toolArgs = normalizeToolArgs(payload)
  const content = toolArgs || payload?.choices?.[0]?.message?.content || ''
  const parsed = parseJsonFromText(typeof content === 'string' ? content : JSON.stringify(content))
  const violations = parsed?.violations || []

  const created = []
  for (const violation of violations) {
    const id = crypto.randomUUID()
    const doc = {
      violation_id: id,
      contract_id: contractId,
      regulation_id: violation.regulation_id || null,
      severity: violation.severity || 'medium',
      violation_type: violation.violation_type || 'policy',
      description: violation.description || '',
      affected_clause: violation.affected_clause || '',
      suggested_fix: violation.suggested_fix || '',
      detected_at: new Date().toISOString(),
      status: 'open'
    }
    try {
      await es.index({ index: 'violations', id, document: doc })
    } catch (err: any) {
      if (err?.meta?.body?.error?.type === 'index_not_found_exception') {
        await es.indices.create({ index: 'violations' }, { ignore: [400] })
        await es.index({ index: 'violations', id, document: doc })
      } else {
        throw err
      }
    }
    created.push(doc)
  }

  return NextResponse.json({ violations: created })
}
