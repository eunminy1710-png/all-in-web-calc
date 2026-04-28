'use client'

import { useCalcStore } from '@/store/useCalcStore'
import dayjs from 'dayjs'

export default function ReportPage() {
  const { reportItems, deleteReportItem } = useCalcStore()

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold">인사이트 리포트</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          각 계산기에서 저장한 결과를 모아볼 수 있습니다.
        </p>
      </div>

      {reportItems.length === 0 ? (
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-sm text-[var(--muted-foreground)]">
          저장된 리포트 항목이 없습니다.
          <br />
          각 계산기에서 결과를 리포트에 저장해보세요.
        </div>
      ) : (
        <div className="space-y-3">
          {reportItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-[var(--border)] p-4 flex items-start justify-between gap-4"
            >
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {item.calculatorLabel} · 시나리오 {item.scenarioKey}
                </p>
                <p className="text-sm font-medium mt-0.5">{item.summary}</p>
                <p className="text-lg font-bold tabular-nums mt-1">
                  {item.value.toLocaleString()}
                  <span className="text-sm font-normal ml-1 text-[var(--muted-foreground)]">
                    {item.unit}
                  </span>
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {dayjs(item.savedAt).format('YYYY-MM-DD HH:mm')}
                </p>
              </div>
              <button
                onClick={() => deleteReportItem(item.id)}
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--loss)] shrink-0"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
