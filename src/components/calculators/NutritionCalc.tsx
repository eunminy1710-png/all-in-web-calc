'use client'

import { useMemo } from 'react'
import { useCalcStore } from '@/store/useCalcStore'
import { calcNutritionBreakdown } from '@/lib/calculators/nutrition'
import ScenarioTabs from '@/components/shared/ScenarioTabs'
import ResultCard from '@/components/shared/ResultCard'
import MemoInput from '@/components/shared/MemoInput'
import CalcChart from '@/components/shared/CalcChart'

export default function NutritionCalc() {
  const { activeScenario, nutrition, setNutrition, saveReportItem } = useCalcStore()
  const inputs = nutrition[activeScenario]

  const breakdown = useMemo(
    () =>
      calcNutritionBreakdown(
        inputs.totalGrams,
        inputs.carbRatio,
        inputs.proteinRatio,
        inputs.fatRatio
      ),
    [inputs]
  )

  const totalRatio = inputs.carbRatio + inputs.proteinRatio + inputs.fatRatio

  const pieData = [
    { name: '탄수화물', value: breakdown.carb, color: '#3b82f6' },
    { name: '단백질', value: breakdown.protein, color: '#22c55e' },
    { name: '지방', value: breakdown.fat, color: '#f59e0b' },
  ]

  return (
    <div className="space-y-5">
      <ScenarioTabs />

      {totalRatio !== 100 && (
        <div className="bg-orange-50 border border-orange-200 rounded-md px-4 py-2 text-sm text-orange-700">
          탄단지 비율 합계가 {totalRatio}%입니다. 합계가 100%가 되도록 조정하세요.
        </div>
      )}

      <div className="bg-white rounded-lg border border-[var(--border)] p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">목표 식사량 (g)</span>
          <input
            type="number"
            value={inputs.totalGrams}
            onChange={(e) => setNutrition(activeScenario, { totalGrams: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">탄수화물 (%)</span>
          <input
            type="number"
            value={inputs.carbRatio}
            onChange={(e) => setNutrition(activeScenario, { carbRatio: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">단백질 (%)</span>
          <input
            type="number"
            value={inputs.proteinRatio}
            onChange={(e) => setNutrition(activeScenario, { proteinRatio: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">지방 (%)</span>
          <input
            type="number"
            value={inputs.fatRatio}
            onChange={(e) => setNutrition(activeScenario, { fatRatio: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ResultCard label="탄수화물" value={String(breakdown.carb)} unit="g" />
        <ResultCard label="단백질" value={String(breakdown.protein)} unit="g" emphasis="profit" />
        <ResultCard label="지방" value={String(breakdown.fat)} unit="g" />
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <p className="text-sm font-medium mb-3">영양소 비율</p>
        <CalcChart type="pie" data={pieData} />
      </div>

      <div className="flex justify-end">
        <button
          onClick={() =>
            saveReportItem({
              calculatorId: 'nutrition',
              calculatorLabel: '육아 영양',
              scenarioKey: activeScenario,
              summary: `탄:단:지 = ${inputs.carbRatio}:${inputs.proteinRatio}:${inputs.fatRatio}`,
              value: inputs.totalGrams,
              unit: 'g',
            })
          }
          className="px-4 py-2 text-sm bg-[var(--primary)] text-white rounded-md hover:opacity-90 transition-opacity"
        >
          리포트에 저장
        </button>
      </div>

      <MemoInput calculatorId="nutrition" scenarioKey={activeScenario} />
    </div>
  )
}
