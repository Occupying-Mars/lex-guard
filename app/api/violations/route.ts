import { NextResponse } from 'next/server'
import { getEsClient } from '@/lib/elasticsearch'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const severity = searchParams.get('severity')
  const status = searchParams.get('status')
  const esUrl = request.headers.get('x-es-url') || undefined
  const esKey = request.headers.get('x-es-key') || undefined

  const must: any[] = []
  if (severity) must.push({ term: { severity } })
  if (status) must.push({ term: { status } })

  const es = getEsClient({ url: esUrl, apiKey: esKey })
  try {
    const res = await es.search({
      index: 'violations',
      size: 100,
      query: must.length ? { bool: { must } } : { match_all: {} },
      sort: [{ detected_at: 'desc' }]
    })

    return NextResponse.json({ items: res.hits.hits.map((hit) => hit._source) })
  } catch (err: any) {
    if (err?.meta?.body?.error?.type === 'index_not_found_exception') {
      return NextResponse.json({ items: [] })
    }
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 })
  }
}
