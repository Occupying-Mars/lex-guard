import { NextResponse } from 'next/server'
import { getEsClient } from '@/lib/elasticsearch'

export async function GET(request: Request) {
  const esUrl = request.headers.get('x-es-url') || undefined
  const esKey = request.headers.get('x-es-key') || undefined
  const es = getEsClient({ url: esUrl, apiKey: esKey })
  const res = await es.search({
    index: 'contracts',
    size: 100,
    sort: [{ uploaded_at: 'desc' }]
  })

  const items = res.hits.hits.map((hit) => hit._source)
  return NextResponse.json({ items })
}
