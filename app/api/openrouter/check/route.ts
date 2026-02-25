import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const openrouterKey = request.headers.get('x-openrouter-key')
  const openrouterModel = request.headers.get('x-openrouter-model') || 'anthropic/claude-3-haiku'

  if (!openrouterKey) {
    return NextResponse.json({ error: 'missing openrouter api key' }, { status: 401 })
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openrouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://lexguard.vercel.app',
      'X-Title': 'LexGuard Contract Scanner'
    },
    body: JSON.stringify({
      model: openrouterModel,
      messages: [{ role: 'user', content: 'respond with ok' }],
      tools: [
        {
          type: 'function',
          function: {
            name: 'ping',
            description: 'returns ok',
            parameters: { type: 'object', properties: { ok: { type: 'string' } }, required: ['ok'] }
          }
        }
      ],
      tool_choice: { type: 'function', function: { name: 'ping' } },
      max_tokens: 20
    })
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: text || 'openrouter check failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, model: openrouterModel })
}
