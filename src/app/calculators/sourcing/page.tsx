'use client'

import { useState } from 'react'
import SourcingCalc from '@/components/calculators/SourcingCalc'
import CompareView from '@/components/shared/CompareView'
import { useCalcStore } from '@/store/useCalcStore'
import { calcSourcingMargin } from '@/lib/calculators/sourcing'

function fmt(n: number) {
  return Math.round(n).toLocaleString()
}

export default function SourcingPage() {
  const [compareMode, setCompareMode] = useState(false)
  const { sourcing } = useCalcStore()

  const a = sourcing['A']
  const b = sourcing['B']
  const resA = calcSourcingMargin(a.costForeign, a.exchangeRate, a.shippingKrw, a.feeRate, a.sellPriceKrw)
  const resB = calcSourcingMargin(b.costForeign, b.exchangeRate, b.shippingKrw, b.feeRate, b.sellPriceKrw)

  const compareRows = [
    { label: '원가(외화)', a: String(a.costForeign), b: String(b.costForeign) },
    { label: '환율', a: fmt(a.exchangeRate), b: fmt(b.exchangeRate), unit: '원' },
    { label: '판매가', a: fmt(a.sellPriceKrw), b: fmt(b.sellPriceKrw), unit: '원' },
    { label: '마진액', a: fmt(resA.marginKrw), b: fmt(resB.marginKrw), unit: '원' },
    { label: '마진율', a: resA.marginRate.toFixed(1), b: resB.marginRate.toFixed(1), unit: '%' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">글로벌 소싱</h1>
        <button
          onClick={() => setCompareMode((v) => !v)}
          className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
            compareMode
              ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
              : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          {compareMode ? '비교 모드 ON' : 'A/B 비교'}
        </button>
      </div>
      {compareMode ? <CompareView labelA="A" labelB="B" rows={compareRows} /> : <SourcingCalc />}
    </div>
  )
}
