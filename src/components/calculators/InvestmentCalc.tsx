'use client'

import { useMemo, useState } from 'react'
import { useCalcStore } from '@/store/useCalcStore'
import {
  calcCompoundGrowth,
  calcLiquidationPrice,
  calcCompoundSchedule,
} from '@/lib/calculators/investment'
import ScenarioTabs from '@/components/shared/ScenarioTabs'
import ResultCard from '@/components/shared/ResultCard'
import MemoInput from '@/components/shared/MemoInput'
import CalcChart from '@/components/shared/CalcChart'

function fmt(n: number) {
  return Math.round(n).toLocaleString()
}

export default function InvestmentCalc() {
  const { activeScenario, investment, setInvestment, saveReportItem } = useCalcStore()
  const inputs = investment[activeScenario]
  const [direction, setDirection] = useState<'long' | 'short'>('long')

  const finalAmount = useMemo(
    () => calcCompoundGrowth(inputs.principal * 10000, inputs.annualReturn, inputs.years),
    [inputs.principal, inputs.annualReturn, inputs.years]
  )

  const gain = finalAmount - inputs.principal * 10000

  const liqPrice = useMemo(
    () => calcLiquidationPrice(inputs.entryPrice, inputs.leverage, direction),
    [inputs.entryPrice, inputs.leverage, direction]
  )

  const schedule = useMemo(
    () => calcCompoundSchedule(inputs.principal * 10000, inputs.annualReturn, inputs.years),
    [inputs.principal, inputs.annualReturn, inputs.years]
  )

  const chartData = schedule.map((r) => ({ year: `${r.year}년`, 금액: Math.round(r.total) }))

  return (
    <div className="space-y-5">
      <ScenarioTabs />

      <div className="bg-white rounded-lg border border-[var(--border)] p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">원금 (만원)</span>
          <input
            type="number"
            value={inputs.principal}
            onChange={(e) => setInvestment(activeScenario, { principal: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">연 수익률 (%)</span>
          <input
            type="number"
            step="0.1"
            value={inputs.annualReturn}
            onChange={(e) => setInvestment(activeScenario, { annualReturn: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">투자 기간 (년)</span>
          <input
            type="number"
            value={inputs.years}
            onChange={(e) => setInvestment(activeScenario, { years: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">진입가 (원)</span>
          <input
            type="number"
            value={inputs.entryPrice}
            onChange={(e) => setInvestment(activeScenario, { entryPrice: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">레버리지 (배)</span>
          <input
            type="number"
            step="1"
            min="1"
            value={inputs.leverage}
            onChange={(e) => setInvestment(activeScenario, { leverage: Number(e.target.value) })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">방향</span>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as 'long' | 'short')}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="long">롱 (매수)</option>
            <option value="short">숏 (매도)</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ResultCard label="복리 최종 금액" value={fmt(finalAmount)} unit="원" emphasis="profit" />
        <ResultCard
          label="수익금"
          value={fmt(gain)}
          unit="원"
          emphasis={gain >= 0 ? 'profit' : 'loss'}
        />
        <ResultCard label="청산가" value={fmt(liqPrice)} unit="원" emphasis="loss" />
        <ResultCard label="레버리지" value={String(inputs.leverage)} unit="배" />
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <p className="text-sm font-medium mb-3">복리 성장 그래프</p>
        <CalcChart
          type="line"
          data={chartData}
          xKey="year"
          lines={[{ key: '금액', label: '금액', color: '#22c55e' }]}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={() =>
            saveReportItem({
              calculatorId: 'investment',
              calculatorLabel: '투자 / 가상자산',
              scenarioKey: activeScenario,
              summary: `${inputs.years}년 복리 최종 ${fmt(finalAmount)}원`,
              value: Math.round(finalAmount),
              unit: '원',
            })
          }
          className="px-4 py-2 text-sm bg-[var(--primary)] text-white rounded-md hover:opacity-90 transition-opacity"
        >
          리포트에 저장
        </button>
      </div>

      <MemoInput calculatorId="investment" scenarioKey={activeScenario} />
    </div>
  )
}
