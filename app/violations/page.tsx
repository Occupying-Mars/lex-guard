'use client'

import { useEffect, useState } from 'react'
import SeverityChart from '@/components/SeverityChart'

export default function ViolationsPage() {
  const [items, setItems] = useState<any[]>([])
  const [severity, setSeverity] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams()
      if (severity) params.set('severity', severity)
      if (status) params.set('status', status)
      const esUrl = window.localStorage.getItem('es_url') || ''
      const esKey = window.localStorage.getItem('es_key') || ''
      const res = await fetch(`/api/violations?${params.toString()}`, {
        headers: {
          ...(esUrl ? { 'x-es-url': esUrl } : {}),
          ...(esKey ? { 'x-es-key': esKey } : {})
        }
      })
      const json = await res.json()
      if (!res.ok) return
      setItems(json.items || [])
    }

    load()
  }, [severity, status])

  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.severity] = (acc[item.severity] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }))

  return (
    <main className="flex flex-col gap-6">
      <section className="card p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/50">triage</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink">violations desk</h1>
            <p className="mt-2 text-sm text-ink/70">
              filter issues, assess severity, and prep evidence for audit trails.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase"
            >
              <option value="">all severities</option>
              <option value="critical">critical</option>
              <option value="high">high</option>
              <option value="medium">medium</option>
              <option value="low">low</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase"
            >
              <option value="">all statuses</option>
              <option value="open">open</option>
              <option value="resolved">resolved</option>
              <option value="ignored">ignored</option>
            </select>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[1fr,2fr]">
        <div className="card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/50">severity mix</p>
          <SeverityChart data={chartData} />
        </div>
        <div className="card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/50">issue queue</p>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.violation_id} className="rounded-xl border border-ink/10 bg-white px-4 py-3">
                <p className="text-sm font-semibold text-ink">{item.violation_type}</p>
                <p className="text-xs text-ink/60">
                  {item.contract_id} · {item.severity} · {item.status}
                </p>
              </div>
            ))}
            {!items.length ? <p className="text-sm text-ink/60">no violations found.</p> : null}
          </div>
        </div>
      </section>
    </main>
  )
}
