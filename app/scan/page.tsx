'use client'

import { useState } from 'react'
import ApiKeyPrompt from '@/components/ApiKeyPrompt'

export default function ScanPage() {
  const [contractId, setContractId] = useState('')
  const [categories, setCategories] = useState('GDPR, Data Privacy')
  const [status, setStatus] = useState('')
  const [result, setResult] = useState<any>(null)

  async function run() {
    const key = window.localStorage.getItem('openrouter_api_key')
    const model = window.localStorage.getItem('openrouter_model') || 'anthropic/claude-3-haiku'
    const esUrl = window.localStorage.getItem('es_url') || ''
    const esKey = window.localStorage.getItem('es_key') || ''
    if (!key) {
      setStatus('missing openrouter key')
      return
    }

    setStatus('running scan...')
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-openrouter-key': key,
        'x-openrouter-model': model,
        ...(esUrl ? { 'x-es-url': esUrl } : {}),
        ...(esKey ? { 'x-es-key': esKey } : {})
      },
      body: JSON.stringify({
        contract_id: contractId,
        regulation_categories: categories.split(',').map((c) => c.trim()).filter(Boolean)
      })
    })

    const raw = await res.text()
    let json: any = null
    try {
      json = raw ? JSON.parse(raw) : null
    } catch {
      json = { error: raw || 'scan failed' }
    }
    if (!res.ok) {
      setStatus(json?.error || 'scan failed')
      return
    }

    setResult(json)
    setStatus('done')
  }

  return (
    <main className="flex flex-col gap-6">
      <ApiKeyPrompt />
      <section className="card p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/50">compliance</p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">run a compliance scan</h1>
        <p className="mt-2 text-sm text-ink/70">
          use this for quick scans when you already have a contract id.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <input
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              placeholder="contract id"
              className="w-full rounded-2xl border border-ink/10 bg-white p-4 text-sm"
            />
            <input
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder="regulation categories (comma separated)"
              className="w-full rounded-2xl border border-ink/10 bg-white p-4 text-sm"
            />
            <button onClick={run} className="rounded-full bg-ink px-6 py-2 text-sm font-semibold text-paper">
              run scan
            </button>
            {status ? <p className="text-sm text-ink/70">{status}</p> : null}
          </div>
          <div className="rounded-2xl border border-ink/10 bg-white/80 p-5 text-sm text-ink/70">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">tips</p>
            <p className="mt-3">use `logicore-msa` or `techflow-saas` after seeding demo data.</p>
            <p className="mt-3">scans write violations to elastic with status `open`.</p>
          </div>
        </div>
      </section>

      {result ? (
        <section className="card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/50">raw response</p>
          <pre className="mt-4 whitespace-pre-wrap text-xs text-ink/70">
            {JSON.stringify(result, null, 2)}
          </pre>
        </section>
      ) : null}
    </main>
  )
}
