'use client'

import Link from 'next/link'
import { useCalcStore } from '@/store/useCalcStore'
import dayjs from 'dayjs'

const CALC_CARDS = [
  {
    label: '부동산 / 대출',
    description: '월 상환액, 이자 총액, 보증금 갱신 계산',
    href: '/calculators/real-estate',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    label: '투자 / 가상자산',
    description: '복리 시뮬레이션, 선물 청산가 계산',
    href: '/calculators/investment',
    color: 'bg-green-50 border-green-200',
  },
  {
    label: '글로벌 소싱',
    description: '환율 반영 마진율, 목표 판매가 역산',
    href: '/calculators/sourcing',
    color: 'bg-orange-50 border-orange-200',
  },
  {
    label: '육아 영양',
    description: '이유식 영양소 비율 및 식재료 계량 계산',
    href: '/calculators/nutrition',
    color: 'bg-purple-50 border-purple-200',
  },
]

export default function DashboardPage() {
  const { reportItems, memos } = useCalcStore()
  const recent = [...reportItems].reverse().slice(0, 3)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">대시보드</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">계산기를 선택하세요</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-[var(--border)] p-4 text-center">
          <p className="text-2xl font-bold tabular-nums">{reportItems.length}</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">저장된 리포트</p>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-4 text-center">
          <p className="text-2xl font-bold tabular-nums">{memos.length}</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">메모</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CALC_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`block rounded-xl border p-5 transition-shadow hover:shadow-md ${card.color}`}
          >
            <p className="font-semibold text-sm text-[var(--foreground)]">{card.label}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{card.description}</p>
          </Link>
        ))}
      </div>

      {recent.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--foreground)]">최근 저장 항목</p>
          {recent.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-[var(--border)] px-4 py-3 flex justify-between items-center"
            >
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {item.calculatorLabel} · 시나리오 {item.scenarioKey}
                </p>
                <p className="text-sm font-medium">{item.summary}</p>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] shrink-0">
                {dayjs(item.savedAt).format('MM-DD HH:mm')}
              </p>
            </div>
          ))}
          <div className="text-center">
            <Link href="/report" className="text-sm text-[var(--primary)] hover:underline">
              전체 리포트 보기 →
            </Link>
          </div>
        </div>
      )}

      {recent.length === 0 && (
        <div className="text-center">
          <Link href="/report" className="text-sm text-[var(--primary)] hover:underline">
            인사이트 리포트 보기 →
          </Link>
        </div>
      )}
    </div>
  )
}
