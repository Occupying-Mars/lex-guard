'use client'

import { useEffect, useState } from 'react'
import ViolationBadge from '@/components/ViolationBadge'
import ApiKeyPrompt from '@/components/ApiKeyPrompt'

const REG_CATEGORIES = ['Data Privacy', 'Data Residency', 'GDPR', 'CCPA']

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const [contract, setContract] = useState<any>(null)
  const [violations, setViolations] = useState<any[]>([])
  const [status, setStatus] = useState('loading')
  const [selected, setSelected] = useState<string[]>(['GDPR'])

  useEffect(() => {
    async function load() {
      const esUrl = window.localStorage.getItem('es_url') || ''
      const esKey = window.localStorage.getItem('es_key') || ''
      const res = await fetch(`/api/contracts/${params.id}`, {
        headers: {
          ...(esUrl ? { 'x-es-url': esUrl } : {}),
          ...(esKey ? { 'x-es-key': esKey } : {})
        }
      })
      const raw = await res.text()
      let json: any = null
      try {
        json = raw ? JSON.parse(raw) : null
      } catch {
        json = { error: raw || 'failed' }
      }
      if (!res.ok) {
        setStatus(json?.error || 'failed')
        return
      }
      setContract(json.contract)
      setViolations(json.violations || [])
      setStatus('')
    }

    load()
  }, [params.id])

  async function runScan() {
    const key = window.localStorage.getItem('openrouter_api_key')
    const model = window.localStorage.getItem('openrouter_model') || 'anthropic/claude-3-haiku'
    const esUrl = window.localStorage.getItem('es_url') || ''
    const esKey = window.localStorage.getItem('es_key') || ''
    if (!key) {
      setStatus('missing openrouter key')
      return
    }
    setStatus('scanning...')
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-openrouter-key': key,
        'x-openrouter-model': model,
        ...(esUrl ? { 'x-es-url': esUrl } : {}),
        ...(esKey ? { 'x-es-key': esKey } : {})
      },
      body: JSON.stringify({ contract_id: params.id, regulation_categories: selected })
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
    setViolations(json.violations || [])
    setStatus('scan complete')
  }

  const expiringSoon = contract?.expiry_date
    ? new Date(contract.expiry_date).getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000
    : false

  return (
    <main className="flex flex-col gap-6">
      <ApiKeyPrompt />
      <section className="card p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">contract profile</p>
            <h1 className="mt-3 text-3xl font-semibold text-ink">{contract?.vendor_name || 'contract'}</h1>
            <p className="mt-2 text-sm text-ink/70">
              {contract?.contract_type} · {contract?.jurisdiction} · effective {contract?.effective_date}
            </p>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-white p-4 text-xs text-ink/60">
            id: {params.id}
          </div>
        </div>
        {expiringSoon ? (
          <div className="mt-4 rounded-2xl border border-yellow-400/50 bg-yellow-100 p-4 text-sm text-ink">
            expiry warning: contract ends within 90 days.
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/50">scan scope</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {REG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setSelected((prev) =>
                    prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                  )
                }
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                  selected.includes(cat) ? 'border-ink bg-ink text-paper' : 'border-ink/20 text-ink/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={runScan}
            className="mt-5 rounded-full bg-copper px-5 py-2 text-xs font-semibold uppercase text-paper"
          >
            run compliance scan
          </button>
          {status ? <p className="mt-3 text-sm text-ink/70">{status}</p> : null}
        </div>

        <div className="card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/50">what the scan does</p>
          <ul className="mt-4 space-y-2 text-sm text-ink/70">
            <li>pulls the contract text + clauses from elastic.</li>
            <li>matches regulations in your chosen categories.</li>
            <li>flags violations with severity + fixes.</li>
          </ul>
        </div>
      </section>

      <section className="card p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/50">violations</p>
        <div className="mt-4 space-y-4">
          {violations.length === 0 ? (
            <p className="text-sm text-ink/60">no violations yet. run a scan to populate.</p>
          ) : null}
          {violations.map((violation) => (
            <div key={violation.violation_id} className="rounded-2xl border border-ink/10 bg-white p-6">
              <div className="flex items-center justify-between">
                <ViolationBadge severity={violation.severity} />
                <span className="text-xs uppercase text-ink/40">{violation.status}</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-ink">{violation.violation_type}</h3>
              <p className="mt-2 text-sm text-ink/70">{violation.description}</p>
              <details className="mt-4 text-sm text-ink/70">
                <summary className="cursor-pointer">affected clause</summary>
                <p className="mt-2 whitespace-pre-wrap">{violation.affected_clause}</p>
              </details>
              <details className="mt-3 text-sm text-ink/70">
                <summary className="cursor-pointer">suggested fix</summary>
                <p className="mt-2 whitespace-pre-wrap">{violation.suggested_fix}</p>
              </details>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
