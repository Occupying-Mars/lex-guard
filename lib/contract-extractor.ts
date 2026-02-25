export type ExtractedContract = {
  vendor_name: string | null
  contract_type: 'SaaS' | 'NDA' | 'MSA' | 'Employment' | 'Other' | null
  effective_date: string | null
  expiry_date: string | null
  jurisdiction: string | null
  notice_period_days: number | null
  liability_cap_usd: number | null
  data_residency: string | null
  auto_renewal: boolean | null
  clauses: Array<{ clause_type: string; clause_text: string; page_number: number }>
}

const extractionPrompt = (text: string) => `Extract the following fields from this contract text as JSON. If a field is not found, use null.
Fields: vendor_name, contract_type (SaaS/NDA/MSA/Employment/Other), effective_date (ISO), expiry_date (ISO), jurisdiction (country code), notice_period_days (integer), liability_cap_usd (number or null), data_residency (country/region or null), auto_renewal (boolean).
Also extract all distinct clauses as an array: [{clause_type: string, clause_text: string, page_number: number}].
Return ONLY valid JSON, no preamble.

CONTRACT TEXT:
${text}`

function normalizeContent(payload: any) {
  const choice = payload?.choices?.[0]
  if (!choice) return null
  const message = choice.message
  if (typeof message?.content === 'string') return message.content
  if (Array.isArray(message?.content) && message.content[0]?.text) return message.content[0].text
  if (typeof choice.text === 'string') return choice.text
  return null
}

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

function sanitizeJson(text: string) {
  return text
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\\s+$/g, '')
    .replace(/,\\s*}/g, '}')
    .replace(/,\\s*]/g, ']')
}

function parseJsonFromText(text: string) {
  const cleaned = sanitizeJson(stripCodeFences(text))
  try {
    return JSON.parse(cleaned)
  } catch {
    const first = cleaned.indexOf('{')
    const last = cleaned.lastIndexOf('}')
    if (first === -1 || last === -1) throw new Error('no json object found')
    const slice = sanitizeJson(cleaned.slice(first, last + 1))
    return JSON.parse(slice)
  }
}

const extractionTool = {
  type: 'function',
  function: {
    name: 'extract_contract',
    description:
      'extract structured contract fields and clauses from raw contract text. return json only.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        vendor_name: { type: ['string', 'null'] },
        contract_type: { type: ['string', 'null'] },
        effective_date: { type: ['string', 'null'] },
        expiry_date: { type: ['string', 'null'] },
        jurisdiction: { type: ['string', 'null'] },
        notice_period_days: { type: ['number', 'null'] },
        liability_cap_usd: { type: ['number', 'null'] },
        data_residency: { type: ['string', 'null'] },
        auto_renewal: { type: ['boolean', 'null'] },
        clauses: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              clause_type: { type: 'string' },
              clause_text: { type: 'string' },
              page_number: { type: 'number' }
            },
            required: ['clause_type', 'clause_text', 'page_number']
          }
        }
      },
      required: [
        'vendor_name',
        'contract_type',
        'effective_date',
        'expiry_date',
        'jurisdiction',
        'notice_period_days',
        'liability_cap_usd',
        'data_residency',
        'auto_renewal',
        'clauses'
      ]
    }
  }
}

export async function extractContractFields(
  text: string,
  openrouterKey: string,
  model = 'anthropic/claude-3-haiku'
) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openrouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://lexguard.vercel.app',
      'X-Title': 'LexGuard Contract Scanner'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: extractionPrompt(text) }],
      tools: [extractionTool],
      tool_choice: { type: 'function', function: { name: 'extract_contract' } },
      max_tokens: 2000
    })
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`openrouter error: ${res.status} ${body}`)
  }

  const json = await res.json()
  if (json?.error) {
    throw new Error(`openrouter error: ${JSON.stringify(json.error)}`)
  }

  const toolArgs = normalizeToolArgs(json)
  const content = toolArgs || normalizeContent(json)
  if (!content) throw new Error(`openrouter response missing content: ${JSON.stringify(json)}`)

  try {
    return parseJsonFromText(content) as ExtractedContract
  } catch (err: any) {
    const snippet = content.slice(0, 400)
    throw new Error(`openrouter returned invalid json. snippet: ${snippet}`)
  }
}
