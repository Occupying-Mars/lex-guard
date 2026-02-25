type KibanaConfig = {
  kibanaUrl: string
  kibanaApiKey: string
}

function getKibanaConfig(): KibanaConfig {
  const kibanaUrl = process.env.KIBANA_URL
  const kibanaApiKey = process.env.KIBANA_API_KEY

  if (!kibanaUrl || !kibanaApiKey) {
    throw new Error('missing kibana env vars')
  }

  return { kibanaUrl, kibanaApiKey }
}

export async function kibanaRequest(path: string, body: unknown) {
  const { kibanaUrl, kibanaApiKey } = getKibanaConfig()
  const res = await fetch(`${kibanaUrl}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `ApiKey ${kibanaApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`kibana request failed: ${res.status} ${text}`)
  }

  return res.json()
}

export async function createTool(payload: unknown) {
  return kibanaRequest('/api/agent_builder/tools', payload)
}

export async function createAgent(payload: unknown) {
  return kibanaRequest('/api/agent_builder/agents', payload)
}

export async function converseAgent(payload: unknown, openrouterKey?: string) {
  const { kibanaUrl, kibanaApiKey } = getKibanaConfig()
  const res = await fetch(`${kibanaUrl}/api/agent_builder/converse`, {
    method: 'POST',
    headers: {
      Authorization: `ApiKey ${kibanaApiKey}`,
      'Content-Type': 'application/json',
      ...(openrouterKey ? { 'x-openrouter-key': openrouterKey } : {})
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`agent converse failed: ${res.status} ${text}`)
  }

  return res.json()
}
