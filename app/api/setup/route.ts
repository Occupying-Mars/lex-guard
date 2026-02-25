import { NextResponse } from 'next/server'
import { getEsClient } from '@/lib/elasticsearch'

const contractsMapping = {
  mappings: {
    properties: {
      contract_id: { type: 'keyword' },
      filename: { type: 'keyword' },
      vendor_name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
      contract_type: { type: 'keyword' },
      effective_date: { type: 'date' },
      expiry_date: { type: 'date' },
      jurisdiction: { type: 'keyword' },
      notice_period_days: { type: 'integer' },
      liability_cap_usd: { type: 'float' },
      data_residency: { type: 'keyword' },
      auto_renewal: { type: 'boolean' },
      full_text: {
        type: 'text',
        fields: {
          semantic: {
            type: 'semantic_text',
            inference_id: 'elser-inference'
          }
        }
      },
      clauses: {
        type: 'nested',
        properties: {
          clause_type: { type: 'keyword' },
          clause_text: { type: 'text' },
          page_number: { type: 'integer' }
        }
      },
      uploaded_at: { type: 'date' },
      status: { type: 'keyword' }
    }
  }
}

const regulationsMapping = {
  mappings: {
    properties: {
      regulation_id: { type: 'keyword' },
      name: { type: 'keyword' },
      jurisdiction: { type: 'keyword' },
      effective_date: { type: 'date' },
      description: {
        type: 'text',
        fields: { semantic: { type: 'semantic_text', inference_id: 'elser-inference' } }
      },
      rule_text: { type: 'text' },
      category: { type: 'keyword' },
      severity: { type: 'keyword' }
    }
  }
}

const violationsMapping = {
  mappings: {
    properties: {
      violation_id: { type: 'keyword' },
      contract_id: { type: 'keyword' },
      regulation_id: { type: 'keyword' },
      severity: { type: 'keyword' },
      violation_type: { type: 'keyword' },
      description: { type: 'text' },
      affected_clause: { type: 'text' },
      suggested_fix: { type: 'text' },
      detected_at: { type: 'date' },
      status: { type: 'keyword' }
    }
  }
}

export async function POST(request: Request) {
  const esUrl = request.headers.get('x-es-url') || undefined
  const esKey = request.headers.get('x-es-key') || undefined
  const es = getEsClient({ url: esUrl, apiKey: esKey })

  await es.indices.create({ index: 'contracts', ...contractsMapping }, { ignore: [400] })
  await es.indices.create({ index: 'regulations', ...regulationsMapping }, { ignore: [400] })
  await es.indices.create({ index: 'violations', ...violationsMapping }, { ignore: [400] })

  return NextResponse.json({ ok: true })
}

export async function GET(request: Request) {
  return POST(request)
}
