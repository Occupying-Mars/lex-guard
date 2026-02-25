import { NextResponse } from 'next/server'
import { getEsClient } from '@/lib/elasticsearch'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const esUrl = request.headers.get('x-es-url') || undefined
  const esKey = request.headers.get('x-es-key') || undefined
  try {
    const es = getEsClient({ url: esUrl, apiKey: esKey })
    const contractRes = await es.get({ index: 'contracts', id: params.id })
    let violations: any[] = []
    try {
      const violationsRes = await es.search({
        index: 'violations',
        size: 100,
        query: { term: { contract_id: params.id } },
        sort: [{ detected_at: 'desc' }]
      })
      violations = violationsRes.hits.hits.map((hit) => hit._source)
    } catch (err: any) {
      if (err?.meta?.body?.error?.type !== 'index_not_found_exception') {
        throw err
      }
    }

    return NextResponse.json({
      contract: contractRes._source,
      violations
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed to load contract' }, { status: 500 })
  }
}
