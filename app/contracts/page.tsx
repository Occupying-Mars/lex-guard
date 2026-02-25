'use client'

import { useEffect, useState } from 'react'
import ContractCard from '@/components/ContractCard'

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    async function load() {
      const esUrl = window.localStorage.getItem('es_url') || ''
      const esKey = window.localStorage.getItem('es_key') || ''
      const res = await fetch('/api/contracts/list', {
        headers: {
          ...(esUrl ? { 'x-es-url': esUrl } : {}),
          ...(esKey ? { 'x-es-key': esKey } : {})
        }
      })
      const json = await res.json()
      if (!res.ok) {
        setStatus(json?.error || 'failed')
        return
      }
      setContracts(json.items || [])
      setStatus('')
    }

    load()
  }, [])

  return (
    <main className="flex flex-col gap-6">
      <section className="card p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/50">portfolio</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink">contracts</h1>
            <p className="mt-2 text-sm text-ink/70">indexed agreements ready for scans and renewal tracking.</p>
          </div>
          <a className="rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase text-paper" href="/upload">
            add contract
          </a>
        </div>
        {status ? <p className="mt-4 text-sm text-ink/60">{status}</p> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {contracts.map((contract) => (
          <ContractCard
            key={contract.contract_id}
            id={contract.contract_id}
            vendor={contract.vendor_name || 'unknown vendor'}
            type={contract.contract_type || 'unknown'}
            jurisdiction={contract.jurisdiction || 'n/a'}
            expiry={contract.expiry_date}
            status={contract.status}
          />
        ))}
      </section>

      <section className="card p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/50">how to use</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-ink/10 bg-white p-4 text-sm text-ink/70">
            open a contract to see metadata, expiry warnings, and the scan trigger.
          </div>
          <div className="rounded-2xl border border-ink/10 bg-white p-4 text-sm text-ink/70">
            run a compliance scan to generate violations linked to clauses.
          </div>
          <div className="rounded-2xl border border-ink/10 bg-white p-4 text-sm text-ink/70">
            track status on the violations page for audit readiness.
          </div>
        </div>
      </section>
    </main>
  )
}
