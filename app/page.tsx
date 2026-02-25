const highlights = [
  {
    title: 'contract intake',
    body: 'upload pdfs or paste raw text. we extract key fields + clauses and index into elastic.'
  },
  {
    title: 'compliance scans',
    body: 'agent builder compares contracts to regulations and writes violations with severity + fixes.'
  },
  {
    title: 'violation ops',
    body: 'triage issues, filter by severity, and export evidence for audit reviews.'
  }
]

const kpis = [
  { label: 'contracts', value: '4', hint: 'demo data' },
  { label: 'open violations', value: '9', hint: 'severity mixed' },
  { label: 'high risk', value: '3', hint: 'critical + high' },
  { label: 'expiring soon', value: '1', hint: 'next 90 days' }
]

export default function HomePage() {
  return (
    <main className="flex flex-col gap-8">
      <section className="card p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-ink/50">overview</p>
        <h1 className="mt-4 text-4xl font-semibold text-ink md:text-5xl">
          lexguard keeps contracts compliant and audit-ready.
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-ink/70">
          ingest agreements, run elastic agent builder scans, and ship clean compliance evidence in minutes.
          openrouter keys never leave the browser.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a className="rounded-full bg-ink px-6 py-2 text-sm font-semibold text-paper" href="/upload">
            upload contracts
          </a>
          <a className="rounded-full border border-ink/20 px-6 py-2 text-sm font-semibold text-ink" href="/scan">
            run demo scan
          </a>
          <a className="rounded-full border border-ink/20 px-6 py-2 text-sm font-semibold text-ink" href="/settings">
            add api key
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">{kpi.label}</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{kpi.value}</p>
            <p className="mt-2 text-xs text-ink/50">{kpi.hint}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <div key={item.title} className="card p-6">
            <h3 className="h-serif text-xl font-semibold text-ink">{item.title}</h3>
            <p className="mt-3 text-sm text-ink/70">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">quick actions</p>
            <p className="mt-2 text-lg font-semibold text-ink">get to a decision faster</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a className="rounded-full bg-copper px-5 py-2 text-xs font-semibold uppercase text-paper" href="/violations">
              review violations
            </a>
            <a className="rounded-full border border-ink/20 px-5 py-2 text-xs font-semibold uppercase text-ink" href="/contracts">
              view contracts
            </a>
            <a className="rounded-full border border-ink/20 px-5 py-2 text-xs font-semibold uppercase text-ink" href="/upload">
              add new
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
