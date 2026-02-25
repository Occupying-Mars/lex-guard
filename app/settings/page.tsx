'use client'

import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const [key, setKey] = useState('')
  const [model, setModel] = useState('anthropic/claude-3-haiku')
  const [esUrl, setEsUrl] = useState('')
  const [esKey, setEsKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [checkStatus, setCheckStatus] = useState('')

  useEffect(() => {
    const stored = window.localStorage.getItem('openrouter_api_key')
    const storedModel = window.localStorage.getItem('openrouter_model')
    const storedEsUrl = window.localStorage.getItem('es_url')
    const storedEsKey = window.localStorage.getItem('es_key')
    if (stored) setKey(stored)
    if (storedModel) setModel(storedModel)
    if (storedEsUrl) setEsUrl(storedEsUrl)
    if (storedEsKey) setEsKey(storedEsKey)
  }, [])

  function saveKey() {
    window.localStorage.setItem('openrouter_api_key', key)
    window.localStorage.setItem('openrouter_model', model)
    window.localStorage.setItem('es_url', esUrl)
    window.localStorage.setItem('es_key', esKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  async function runCheck() {
    setCheckStatus('checking...')
    const res = await fetch('/api/openrouter/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-openrouter-key': key,
        'x-openrouter-model': model
      }
    })
    const text = await res.text()
    try {
      const json = text ? JSON.parse(text) : null
      if (!res.ok) {
        setCheckStatus(json?.error || 'check failed')
        return
      }
      setCheckStatus('ok')
    } catch {
      setCheckStatus(res.ok ? 'ok' : text || 'check failed')
    }
  }

  const masked = key ? `${key.slice(0, 4)}...${key.slice(-4)}` : ''

  return (
    <main className="flex flex-col gap-6">
      <section className="card p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/50">settings</p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">api keys</h1>
        <p className="mt-2 text-sm text-ink/70">
          openrouter is required for extraction + agent scanning. keys never touch the server and stay in
          localstorage.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">
              openrouter api key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="openrouter api key"
              className="w-full rounded-2xl border border-ink/10 bg-white p-4 text-sm"
            />
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">
              openrouter model
            </label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="anthropic/claude-3-haiku"
              className="w-full rounded-2xl border border-ink/10 bg-white p-4 text-sm"
            />
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">
              elasticsearch url
            </label>
            <input
              value={esUrl}
              onChange={(e) => setEsUrl(e.target.value)}
              placeholder="https://your-deployment.es.io:443"
              className="w-full rounded-2xl border border-ink/10 bg-white p-4 text-sm"
            />
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">
              elasticsearch api key
            </label>
            <input
              type="password"
              value={esKey}
              onChange={(e) => setEsKey(e.target.value)}
              placeholder="api key"
              className="w-full rounded-2xl border border-ink/10 bg-white p-4 text-sm"
            />
            <button onClick={saveKey} className="rounded-full bg-ink px-6 py-2 text-sm font-semibold text-paper">
              save key
            </button>
            <button
              onClick={runCheck}
              className="rounded-full border border-ink/20 px-6 py-2 text-sm font-semibold text-ink"
            >
              test key + model
            </button>
            {masked ? <p className="text-xs text-ink/60">saved: {masked}</p> : null}
            {saved ? <p className="text-xs text-teal">saved</p> : null}
            {checkStatus ? <p className="text-xs text-ink/70">check: {checkStatus}</p> : null}
            <a className="text-xs text-copper underline" href="https://openrouter.ai">
              get a key at openrouter.ai
            </a>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white/80 p-5 text-sm text-ink/70">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">how it works</p>
            <ul className="mt-3 space-y-2">
              <li>key stored in localstorage only.</li>
              <li>client sends key to `/api/*` routes via `x-openrouter-key`.</li>
              <li>server forwards to openrouter and discards.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/50">notes</p>
        <p className="mt-3 text-sm text-ink/70">
          if elasticsearch url/key are empty, the server will fall back to `.env.local`.
        </p>
      </section>
    </main>
  )
}
