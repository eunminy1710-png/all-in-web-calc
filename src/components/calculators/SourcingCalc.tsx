'use client'

import { useMemo } from 'react'
import { useCalcStore } from '@/store/useCalcStore'
import { calcSourcingMargin, calcTargetSellPrice } from '@/lib/calculators/sourcing'
import ScenarioTabs from '@/components/shared/ScenarioTabs'
import ResultCard from '@/components/shared/ResultCard'
import MemoInput from '@/components/shared/MemoInput'
import CalcChart from '@/components/shared/CalcChart'
import NumberInput from '@/components/shared/NumberInput'

function fmt(n: number) {
  return Math.round(n).toLocaleString()
}

export default function SourcingCalc() {
  const { activeScenario, sourcing, setSourcing, saveReportItem } = useCalcStore()
  const inputs = sourcing[activeScenario]

  const result = useMemo(
    () =>
      calcSourcingMargin(
        inputs.costForeign,
        inputs.exchangeRate,
        inputs.shippingKrw,
        inputs.feeRate,
        inputs.sellPriceKrw
      ),
    [inputs]
  )

  const targetPrice30 = useMemo(
    () => calcTargetSellPrice(result.costKrw + inputs.shippingKrw, inputs.feeRate, 30),
    [result.costKrw, inputs.shippingKrw, inputs.feeRate]
  )

  const pieData = [
    { name: '원가', value: result.costKrw, color: '#3b82f6' },
    { name: '배송비', value: inputs.shippingKrw, color: '#8b5cf6' },
    { name: '수수료', value: result.feeKrw, color: '#f59e0b' },
    { name: '마진', value: Math.max(result.marginKrw, 0), color: '#22c55e' },
  ]

  return (
    <div className="space-y-5">
      <ScenarioTabs />

      <div className="bg-white rounded-lg border border-[var(--border)] p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">원가 (외화)</span>
          <NumberInput
            value={inputs.costForeign}
            onChange={(v) => setSourcing(activeScenario, { costForeign: v })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">환율 (원/외화)</span>
          <NumberInput
            value={inputs.exchangeRate}
            onChange={(v) => setSourcing(activeScenario, { exchangeRate: v })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">배송비 (원)</span>
          <NumberInput
            value={inputs.shippingKrw}
            onChange={(v) => setSourcing(activeScenario, { shippingKrw: v })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">수수료율 (%)</span>
          <NumberInput
            value={inputs.feeRate}
            onChange={(v) => setSourcing(activeScenario, { feeRate: v })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">판매가 (원)</span>
          <NumberInput
            value={inputs.sellPriceKrw}
            onChange={(v) => setSourcing(activeScenario, { sellPriceKrw: v })}
            className="border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ResultCard
          label="마진액"
          value={fmt(result.marginKrw)}
          unit="원"
          emphasis={result.marginKrw >= 0 ? 'profit' : 'loss'}
        />
        <ResultCard
          label="마진율"
          value={result.marginRate.toFixed(1)}
          unit="%"
          emphasis={result.marginRate >= 0 ? 'profit' : 'loss'}
        />
        <ResultCard label="원가 (KRW)" value={fmt(result.costKrw)} unit="원" />
        <ResultCard
          label="마진율 30% 목표 판매가"
          value={fmt(targetPrice30)}
          unit="원"
          subText="역산"
        />
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <p className="text-sm font-medium mb-3">비용 구조</p>
        <CalcChart type="pie" data={pieData} />
      </div>

      <div className="flex justify-end">
        <button
          onClick={() =>
            saveReportItem({
              calculatorId: 'sourcing',
              calculatorLabel: '글로벌 소싱',
              scenarioKey: activeScenario,
              summary: `마진율 ${result.marginRate.toFixed(1)}%`,
              value: result.marginKrw,
              unit: '원',
            })
          }
          className="px-4 py-2 text-sm bg-[var(--primary)] text-white rounded-md hover:opacity-90 transition-opacity"
        >
          리포트에 저장
        </button>
      </div>

      <MemoInput calculatorId="sourcing" scenarioKey={activeScenario} />
    </div>
  )
}
