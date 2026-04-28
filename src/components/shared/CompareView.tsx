'use client'

interface CompareViewProps {
  labelA: string
  labelB: string
  rows: { label: string; a: string; b: string; unit?: string }[]
}

export default function CompareView({ labelA, labelB, rows }: CompareViewProps) {
  return (
    <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
      <div className="grid grid-cols-[1fr_auto_1fr] text-sm font-semibold bg-[var(--muted)]">
        <div className="px-4 py-2 text-center text-blue-600">시나리오 {labelA}</div>
        <div className="px-2 py-2 text-center text-[var(--muted-foreground)]">항목</div>
        <div className="px-4 py-2 text-center text-purple-600">시나리오 {labelB}</div>
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_auto_1fr] text-sm border-t border-[var(--border)]"
        >
          <div className="px-4 py-3 text-right tabular-nums font-medium">
            {row.a}
            {row.unit && (
              <span className="text-xs text-[var(--muted-foreground)] ml-1">{row.unit}</span>
            )}
          </div>
          <div className="px-2 py-3 text-center text-xs text-[var(--muted-foreground)] whitespace-nowrap">
            {row.label}
          </div>
          <div className="px-4 py-3 text-left tabular-nums font-medium">
            {row.b}
            {row.unit && (
              <span className="text-xs text-[var(--muted-foreground)] ml-1">{row.unit}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
