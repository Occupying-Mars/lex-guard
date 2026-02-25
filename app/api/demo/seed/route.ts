import { NextResponse } from 'next/server'
import { getEsClient } from '@/lib/elasticsearch'

const contracts = [
  {
    contract_id: 'techflow-saas',
    vendor_name: 'TechFlow Inc.',
    contract_type: 'SaaS',
    effective_date: '2023-01-15',
    expiry_date: '2026-03-01',
    jurisdiction: 'US',
    notice_period_days: 7,
    liability_cap_usd: 5000,
    data_residency: 'US',
    auto_renewal: true,
    full_text:
      'This agreement between TechFlow Inc. and Customer grants access to SaaS platform. Data may be stored in any jurisdiction. Liability is capped at $5,000. Auto-renewal occurs unless cancelled 7 days prior. Customer data may be shared with third-party analytics providers for product improvement without explicit consent notification. Termination notice period is 7 days. Governing law: State of Delaware.'
  },
  {
    contract_id: 'datavault-nda',
    vendor_name: 'DataVault GmbH',
    contract_type: 'NDA',
    effective_date: '2024-06-01',
    expiry_date: '2025-12-31',
    jurisdiction: 'DE',
    notice_period_days: 30,
    liability_cap_usd: 100000,
    data_residency: 'EU',
    auto_renewal: false,
    full_text:
      'Confidential information shall be protected for 5 years. Data residency maintained within EU. Both parties agree to 30-day termination notice. Confidential information definition excludes publicly available information. No third-party disclosure without written consent. However, breach remedies limited to monetary compensation only, excluding injunctive relief.'
  },
  {
    contract_id: 'logicore-msa',
    vendor_name: 'LogiCore Solutions',
    contract_type: 'MSA',
    effective_date: '2024-01-01',
    expiry_date: '2026-12-31',
    jurisdiction: 'GB',
    notice_period_days: 90,
    liability_cap_usd: 500000,
    data_residency: 'ANY',
    auto_renewal: false,
    full_text:
      'Master services agreement for logistics software. Provider may process personal data in any country without restriction. No data processing agreement included. Customer personal data may be retained indefinitely after contract termination. Provider not obligated to notify of data breaches within any specific timeframe.'
  },
  {
    contract_id: 'cloudbase-saas',
    vendor_name: 'CloudBase Ltd',
    contract_type: 'SaaS',
    effective_date: '2023-02-01',
    expiry_date: '2026-03-15',
    jurisdiction: 'EU',
    notice_period_days: 60,
    liability_cap_usd: 250000,
    data_residency: 'EU',
    auto_renewal: false,
    full_text: ''
  }
]

export async function POST(request: Request) {
  const esUrl = request.headers.get('x-es-url') || undefined
  const esKey = request.headers.get('x-es-key') || undefined
  const es = getEsClient({ url: esUrl, apiKey: esKey })
  const ops = contracts.flatMap((contract) => [
    { index: { _index: 'contracts', _id: contract.contract_id } },
    {
      ...contract,
      filename: 'seed',
      clauses: [],
      uploaded_at: new Date().toISOString(),
      status: 'active'
    }
  ])

  await es.bulk({ refresh: true, operations: ops })
  return NextResponse.json({ ok: true, count: contracts.length })
}
