'use client'

import { useState } from 'react'
import InvestmentCalc from '@/components/calculators/InvestmentCalc'
import CompareView from '@/components/shared/CompareView'
import { useCalcStore } from '@/store/useCalcStore'
import { calcCompoundGrowth, calcLiquidationPrice } from '@/lib/calculators/investment'

function fmt(n: number) {
  return Math.round(n).toLocaleString()
}

export default function InvestmentPage() {
  const [compareMode, setCompareMode] = useState(false)
  const { investment } = useCalcStore()

  const a = investment['A']
  const b = investment['B']
  const finalA = calcCompoundGrowth(a.principal * 10000, a.annualReturn, a.years)
  const finalB = calcCompoundGrowth(b.principal * 10000, b.annualReturn, b.years)
  const liqA = calcLiquidationPrice(a.entryPrice, a.leverage, 'long')
  const liqB = calcLiquidationPrice(b.entryPrice, b.leverage, 'long')

  const compareRows = [
    { label: '원금', a: fmt(a.principal), b: fmt(b.principal), unit: '만원' },
    { label: '연 수익률', a: String(a.annualReturn), b: String(b.annualReturn), unit: '%' },
    { label: '투자 기간', a: String(a.years), b: String(b.years), unit: '년' },
    { label: '복리 최종 금액', a: fmt(finalA), b: fmt(finalB), unit: '원' },
    { label: '롱 청산가', a: fmt(liqA), b: fmt(liqB), unit: '원' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">투자 / 가상자산</h1>
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
      {compareMode ? <CompareView labelA="A" labelB="B" rows={compareRows} /> : <InvestmentCalc />}
    </div>
  )
}
