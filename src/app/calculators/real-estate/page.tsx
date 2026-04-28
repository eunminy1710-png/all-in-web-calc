'use client'

import { useState } from 'react'
import RealEstateCalc from '@/components/calculators/RealEstateCalc'
import CompareView from '@/components/shared/CompareView'
import { useCalcStore } from '@/store/useCalcStore'
import { calcMonthlyPayment, calcNewDeposit } from '@/lib/calculators/realEstate'

function fmt(n: number) {
  return Math.round(n).toLocaleString()
}

export default function RealEstatePage() {
  const [compareMode, setCompareMode] = useState(false)
  const { realEstate } = useCalcStore()

  const a = realEstate['A']
  const b = realEstate['B']
  const monthlyA = calcMonthlyPayment(a.principal * 10000, a.annualRate, a.termMonths)
  const monthlyB = calcMonthlyPayment(b.principal * 10000, b.annualRate, b.termMonths)
  const depositA = calcNewDeposit(a.deposit, a.depositIncreaseRate)
  const depositB = calcNewDeposit(b.deposit, b.depositIncreaseRate)

  const compareRows = [
    { label: '대출 원금', a: fmt(a.principal), b: fmt(b.principal), unit: '만원' },
    { label: '연이율', a: String(a.annualRate), b: String(b.annualRate), unit: '%' },
    { label: '상환 기간', a: String(a.termMonths), b: String(b.termMonths), unit: '개월' },
    { label: '월 상환금', a: fmt(monthlyA), b: fmt(monthlyB), unit: '원' },
    { label: '갱신 후 보증금', a: fmt(depositA), b: fmt(depositB), unit: '만원' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">부동산 / 대출</h1>
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
      {compareMode ? <CompareView labelA="A" labelB="B" rows={compareRows} /> : <RealEstateCalc />}
    </div>
  )
}
