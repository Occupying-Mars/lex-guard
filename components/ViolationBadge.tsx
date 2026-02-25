type ViolationBadgeProps = {
  severity: 'critical' | 'high' | 'medium' | 'low'
}

const colors: Record<ViolationBadgeProps['severity'], string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-400 text-ink',
  low: 'bg-blue-500 text-white'
}

export default function ViolationBadge({ severity }: ViolationBadgeProps) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${colors[severity]}`}>
      {severity}
    </span>
  )
}
