type ScanProgressProps = {
  step: string
  status: 'idle' | 'running' | 'done' | 'error'
}

export default function ScanProgress({ step, status }: ScanProgressProps) {
  const color =
    status === 'done'
      ? 'text-teal'
      : status === 'error'
        ? 'text-red-600'
        : status === 'running'
          ? 'text-copper'
          : 'text-ink/50'

  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white/80 px-4 py-3">
      <span className={`text-xs font-semibold uppercase ${color}`}>{status}</span>
      <span className="text-sm text-ink/80">{step}</span>
    </div>
  )
}
