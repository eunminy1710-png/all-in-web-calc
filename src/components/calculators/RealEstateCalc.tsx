'use client'

import { useMemo } from 'react'
import { useCalcStore } from '@/store/useCalcStore'
import {
  calcMonthlyPayment,
  calcAmortizationSchedule,
  calcNewDeposit,
} from '@/lib/calculators/realEstate'
import ScenarioTabs from '@/components/shared/ScenarioTabs'
import ResultCard from '@/components/shared/ResultCard'
import MemoInput from '@/components/shared/MemoInput'
import CalcChart from '@/components/shared/CalcChart'

function fmt(n: number) {
  return Math.round(n).toLocaleString()
}

export default function RealEstateCalc() {
  const { activeScenario, realEstate, setRealEstate, saveReportItem } = useCalcStore()
  const inputs = realEstate[activeScenario]

  const monthly = useMemo(
    () => calcMonthlyPayment(inputs.principal * 10000, inputs.annualRate, inputs.termMonths),
    [inputs.principal, inputs.annualRate, inputs.termMonths]
  )

  const schedule = useMemo(
    () => calcAmortizationSchedule(inputs.principal * 10000, inputs.annualRate, inputs.termMonths),
    [inputs.principal, inputs.annualRate, inputs.termMonths]
  )

  const totalInterest = useMemo(
    () => schedule.reduce((acc, r) => acc + r.interest, 0),
    [schedule]
  )

  const newDeposit = useMemo(
    () => calcNewDeposit(inputs.deposit, inputs.depositIncreaseRate),
    [inputs.deposit, inputs.depositIncreaseRate]
  )

  const chartData = schedule
    .filter((_, i) => i % 12 === 11)
    .map((r) => ({ year: `${Math.round(r.month / 12)}년`, 잔금: Math.round(r.remainingBalance) }))

  return (
    <div className="space-y-5">
      <ScenarioTabs />

      <div className="bg-white rounded-lg border border-[var(--border)] p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">대출 원금 (만원)</span>
          <input
            type="number"
            value={inputs.principal}
            onChange={(e) => setRealEstate(activeScenario, { principal: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">연이율 (%)</span>
          <input
            type="number"
            step="0.1"
            value={inputs.annualRate}
            onChange={(e) => setRealEstate(activeScenario, { annualRate: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">상환 기간 (개월)</span>
          <input
            type="number"
            value={inputs.termMonths}
            onChange={(e) => setRealEstate(activeScenario, { termMonths: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">보증금 (만원)</span>
          <input
            type="number"
            value={inputs.deposit}
            onChange={(e) => setRealEstate(activeScenario, { deposit: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">보증금 인상률 (%)</span>
          <input
            type="number"
            step="0.1"
            value={inputs.depositIncreaseRate}
            onChange={(e) =>
              setRealEstate(activeScenario, { depositIncreaseRate: Number(e.target.value) })
            }
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ResultCard label="월 상환금" value={fmt(monthly)} unit="원" />
        <ResultCard label="이자 총액" value={fmt(totalInterest)} unit="원" emphasis="loss" />
        <ResultCard label="갱신 후 보증금" value={fmt(newDeposit)} unit="만원" />
        <ResultCard
          label="상환 기간"
          value={String(Math.round(inputs.termMonths / 12))}
          unit="년"
        />
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <p className="text-sm font-medium mb-3">연도별 대출 잔금 추이</p>
        <CalcChart
          type="line"
          data={chartData}
          xKey="year"
          lines={[{ key: '잔금', label: '잔금', color: 'var(--primary)' }]}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={() =>
            saveReportItem({
              calculatorId: 'real-estate',
              calculatorLabel: '부동산 / 대출',
              scenarioKey: activeScenario,
              summary: `월 상환금 ${fmt(monthly)}원`,
              value: Math.round(monthly),
              unit: '원/월',
            })
          }
          className="px-4 py-2 text-sm bg-[var(--primary)] text-white rounded-md hover:opacity-90 transition-opacity"
        >
          리포트에 저장
        </button>
      </div>

      <MemoInput calculatorId="real-estate" scenarioKey={activeScenario} />
    </div>
  )
}
