import { Client } from '@elastic/elasticsearch'

const clientCache = new Map<string, Client>()

export function getEsClient(override?: { url?: string; apiKey?: string }) {
  const url = override?.url || process.env.ELASTICSEARCH_URL
  const apiKey = override?.apiKey || process.env.ELASTICSEARCH_API_KEY

  if (!url || !apiKey) {
    throw new Error('missing elasticsearch creds')
  }

  const cacheKey = `${url}:${apiKey.slice(0, 8)}`
  const cached = clientCache.get(cacheKey)
  if (cached) return cached

  const client = new Client({
    node: url,
    auth: { apiKey }
  })
  clientCache.set(cacheKey, client)
  return client
}
