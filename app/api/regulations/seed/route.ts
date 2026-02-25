import { NextResponse } from 'next/server'
import { getEsClient } from '@/lib/elasticsearch'

const regulations = [
  {
    regulation_id: 'GDPR-ART28',
    name: 'GDPR Article 28 - Data Processor Requirements',
    jurisdiction: 'EU',
    category: 'Data Privacy',
    severity: 'critical',
    rule_text:
      'Processing by a processor shall be governed by a contract or other legal act. The contract shall stipulate that the processor processes personal data only on documented instructions from the controller.',
    description: 'Requires a formal Data Processing Agreement (DPA) between controller and processor'
  },
  {
    regulation_id: 'GDPR-ART5',
    name: 'GDPR Article 5 - Data Retention Limitation',
    jurisdiction: 'EU',
    category: 'Data Privacy',
    severity: 'high',
    rule_text:
      'Personal data shall be kept in a form which permits identification of data subjects for no longer than is necessary for the purposes for which the personal data are processed.',
    description: 'Personal data cannot be retained indefinitely; must have defined retention periods'
  },
  {
    regulation_id: 'GDPR-ART33',
    name: 'GDPR Article 33 - Breach Notification',
    jurisdiction: 'EU',
    category: 'Data Privacy',
    severity: 'critical',
    rule_text:
      'In the case of a personal data breach, the controller shall notify the supervisory authority within 72 hours of becoming aware of it.',
    description: 'Contracts must include breach notification obligations within 72 hours'
  },
  {
    regulation_id: 'EU-DATA-RESIDENCY',
    name: 'EU Data Residency Requirement',
    jurisdiction: 'EU',
    category: 'Data Residency',
    severity: 'high',
    rule_text:
      'Personal data of EU citizens must be stored and processed within the EU or in countries with adequate data protection decisions.',
    description: 'Data of EU residents cannot be stored in jurisdictions without adequacy decision'
  },
  {
    regulation_id: 'GDPR-CONSENT',
    name: 'GDPR Article 6 - Lawful Processing and Consent',
    jurisdiction: 'EU',
    category: 'Data Privacy',
    severity: 'high',
    rule_text:
      'Processing shall be lawful only if the data subject has given consent or other lawful basis exists. Third party sharing requires explicit consent.',
    description: 'Sharing customer data with third parties requires explicit consent mechanism'
  },
  {
    regulation_id: 'CCPA-DISCLOSURE',
    name: 'CCPA - Third Party Disclosure',
    jurisdiction: 'US',
    category: 'Data Privacy',
    severity: 'medium',
    rule_text:
      'Businesses must disclose in their contracts the categories of personal information to be collected and the purposes for which it will be used.',
    description: 'US contracts must disclose data collection categories and purposes'
  }
]

export async function POST(request: Request) {
  const esUrl = request.headers.get('x-es-url') || undefined
  const esKey = request.headers.get('x-es-key') || undefined
  const es = getEsClient({ url: esUrl, apiKey: esKey })
  const ops = regulations.flatMap((reg) => [
    { index: { _index: 'regulations', _id: reg.regulation_id } },
    { ...reg, effective_date: '2024-01-01' }
  ])

  await es.bulk({ refresh: true, operations: ops })
  return NextResponse.json({ ok: true, count: regulations.length })
}

export async function GET(request: Request) {
  return POST(request)
}
