import { NextResponse } from 'next/server'
import { getEsClient } from '@/lib/elasticsearch'
import { parsePdf } from '@/lib/pdf-parser'
import { extractContractFields } from '@/lib/contract-extractor'
import crypto from 'crypto'

export async function POST(request: Request) {
  const openrouterKey = request.headers.get('x-openrouter-key')
  const openrouterModel = request.headers.get('x-openrouter-model') || 'anthropic/claude-3-haiku'
  const esUrl = request.headers.get('x-es-url') || undefined
  const esKey = request.headers.get('x-es-key') || undefined
  if (!openrouterKey) {
    return NextResponse.json({ error: 'missing openrouter api key' }, { status: 401 })
  }

  const form = await request.formData()
  const file = form.get('file') as File | null
  const rawText = (form.get('raw_text') as string | null) || ''

  let text = rawText
  let filename = ''

  if (file) {
    filename = file.name
    const buffer = Buffer.from(await file.arrayBuffer())
    try {
      text = await parsePdf(buffer)
    } catch (err) {
      if (!rawText.trim()) {
        return NextResponse.json({ error: 'could not extract text from pdf' }, { status: 422 })
      }
    }
  }

  if (!text.trim()) {
    return NextResponse.json({ error: 'no contract text found' }, { status: 400 })
  }

  let extracted
  try {
    extracted = await extractContractFields(text, openrouterKey, openrouterModel)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'openrouter extraction failed' }, { status: 502 })
  }
  const contractId = crypto.randomUUID()

  const es = getEsClient({ url: esUrl, apiKey: esKey })
  await es.index({
    index: 'contracts',
    id: contractId,
    document: {
      contract_id: contractId,
      filename,
      vendor_name: extracted.vendor_name,
      contract_type: extracted.contract_type,
      effective_date: extracted.effective_date,
      expiry_date: extracted.expiry_date,
      jurisdiction: extracted.jurisdiction,
      notice_period_days: extracted.notice_period_days,
      liability_cap_usd: extracted.liability_cap_usd,
      data_residency: extracted.data_residency,
      auto_renewal: extracted.auto_renewal,
      full_text: text,
      clauses: extracted.clauses || [],
      uploaded_at: new Date().toISOString(),
      status: 'active'
    }
  })

  return NextResponse.json({ contract_id: contractId, extracted })
}
