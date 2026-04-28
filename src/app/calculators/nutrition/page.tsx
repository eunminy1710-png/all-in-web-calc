'use client'

import { useMemo, useState } from 'react'
import NutritionCalc from '@/components/calculators/NutritionCalc'
import CompareView from '@/components/shared/CompareView'
import { useCalcStore } from '@/store/useCalcStore'
import { calcNutritionBreakdown } from '@/lib/calculators/nutrition'

export default function NutritionPage() {
  const [compareMode, setCompareMode] = useState(false)
  const { nutrition } = useCalcStore()

  const a = nutrition['A']
  const b = nutrition['B']

  const compareRows = useMemo(() => {
    const resA = calcNutritionBreakdown(a.totalGrams, a.carbRatio, a.proteinRatio, a.fatRatio)
    const resB = calcNutritionBreakdown(b.totalGrams, b.carbRatio, b.proteinRatio, b.fatRatio)
    return [
      { label: '목표 식사량', a: String(a.totalGrams), b: String(b.totalGrams), unit: 'g' },
      { label: '탄:단:지', a: `${a.carbRatio}:${a.proteinRatio}:${a.fatRatio}`, b: `${b.carbRatio}:${b.proteinRatio}:${b.fatRatio}` },
      { label: '탄수화물', a: String(resA.carb), b: String(resB.carb), unit: 'g' },
      { label: '단백질', a: String(resA.protein), b: String(resB.protein), unit: 'g' },
      { label: '지방', a: String(resA.fat), b: String(resB.fat), unit: 'g' },
    ]
  }, [a, b])

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">육아 영양</h1>
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
      {compareMode ? <CompareView labelA="A" labelB="B" rows={compareRows} /> : <NutritionCalc />}
    </div>
  )
}
