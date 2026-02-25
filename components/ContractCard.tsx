type ContractCardProps = {
  id: string
  vendor: string
  type: string
  jurisdiction: string
  expiry?: string | null
  status?: string | null
}

export default function ContractCard({ id, vendor, type, jurisdiction, expiry, status }: ContractCardProps) {
  return (
    <a
      href={`/contracts/${id}`}
      className="rounded-2xl border border-ink/10 bg-white/80 p-5 transition hover:-translate-y-1"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.2em] text-ink/50">{type}</p>
        {status ? (
          <span className="rounded-full border border-ink/10 px-2 py-1 text-xs text-ink/60">{status}</span>
        ) : null}
      </div>
      <h3 className="mt-3 text-lg font-semibold text-ink">{vendor}</h3>
      <p className="mt-2 text-sm text-ink/70">{jurisdiction}</p>
      {expiry ? <p className="mt-4 text-xs text-ink/60">expires {expiry}</p> : null}
    </a>
  )
}
