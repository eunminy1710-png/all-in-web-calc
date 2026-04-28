'use client'

import { useRef } from 'react'
import { useCalcStore } from '@/store/useCalcStore'
import dayjs from 'dayjs'
import { exportToJson, readJsonFile } from '@/lib/backup'
import type { ReportItem, Memo } from '@/types'

function isValidReportItem(x: unknown): boolean {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.value === 'number' &&
    typeof o.summary === 'string' &&
    typeof o.savedAt === 'string'
  )
}

function isValidMemo(x: unknown): boolean {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  return typeof o.id === 'string' && typeof o.content === 'string'
}

export default function ReportPage() {
  const { reportItems, memos, deleteReportItem, importStore } = useCalcStore()
  const fileRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    exportToJson(
      { reportItems, memos },
      `all-in-web-calc-backup-${dayjs().format('YYYYMMDD-HHmm')}.json`
    )
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await readJsonFile(file) as { reportItems?: unknown; memos?: unknown }
      importStore({
        reportItems: Array.isArray(data.reportItems)
          ? (data.reportItems as unknown[]).filter(isValidReportItem) as ReportItem[]
          : undefined,
        memos: Array.isArray(data.memos)
          ? (data.memos as unknown[]).filter(isValidMemo) as Memo[]
          : undefined,
      })
    } catch {
      alert('백업 파일을 읽을 수 없습니다.')
    }
    e.target.value = ''
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">인사이트 리포트</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            각 계산기에서 저장한 결과를 모아볼 수 있습니다.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-md hover:bg-[var(--muted)] transition-colors"
          >
            백업 내보내기
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-md hover:bg-[var(--muted)] transition-colors"
          >
            백업 가져오기
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>
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
