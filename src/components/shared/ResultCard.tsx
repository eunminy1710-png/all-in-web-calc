interface ResultCardProps {
  label: string
  value: string
  unit?: string
  emphasis?: 'profit' | 'loss' | 'neutral'
  subText?: string
}

export default function ResultCard({
  label,
  value,
  unit,
  emphasis = 'neutral',
  subText,
}: ResultCardProps) {
  const emphasisClass =
    emphasis === 'profit'
      ? 'text-[var(--profit)]'
      : emphasis === 'loss'
      ? 'text-[var(--loss)]'
      : 'text-[var(--foreground)]'

  return (
    <div className="bg-white rounded-lg border border-[var(--border)] p-4">
      <p className="text-xs text-[var(--muted-foreground)] mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${emphasisClass}`}>
        {value}
        {unit && (
          <span className="text-sm font-normal ml-1 text-[var(--muted-foreground)]">{unit}</span>
        )}
      </p>
      {subText && <p className="text-xs text-[var(--muted-foreground)] mt-1">{subText}</p>}
    </div>
  )
}
