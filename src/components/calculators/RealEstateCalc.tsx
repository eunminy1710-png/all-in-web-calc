'use client'

import { useMemo, useState } from 'react'
import { useCalcStore } from '@/store/useCalcStore'
import {
  calcAmortizationSchedule,
  calcEqualPrincipalSchedule,
  calcGraduatedSchedule,
  calcBulletSchedule,
  calcNewDeposit,
  type RepaymentMethod,
} from '@/lib/calculators/realEstate'
import ScenarioTabs from '@/components/shared/ScenarioTabs'
import ResultCard from '@/components/shared/ResultCard'
import MemoInput from '@/components/shared/MemoInput'
import CalcChart from '@/components/shared/CalcChart'
import NumberInput from '@/components/shared/NumberInput'

function fmt(n: number) {
  return Math.round(n).toLocaleString()
}

const METHODS: RepaymentMethod[] = ['annuity', 'equalPrincipal', 'graduated', 'bullet']

const METHOD_LABELS: Record<RepaymentMethod, string> = {
  annuity: '원리금균등',
  equalPrincipal: '원금균등',
  graduated: '체증식',
  bullet: '만기일시',
}

const METHOD_DESCRIPTIONS: Record<RepaymentMethod, string> = {
  annuity: '매월 동일한 금액 납입. 예측 가능한 납입 계획으로 가장 일반적인 방식.',
  equalPrincipal: '매월 동일한 원금 상환. 초기 납입금이 높지만 이자 총액이 원리금균등보다 적음.',
  graduated: '납입금이 매년 일정 비율씩 증가. 초기 부담이 낮고 소득 성장이 예상될 때 유리.',
  bullet: '매월 이자만 납입, 만기에 원금 전액 상환. 월 부담은 가장 낮지만 이자 총액이 가장 많음.',
}

const inputClass =
  'border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] tabular-nums'

export default function RealEstateCalc() {
  const { activeScenario, realEstate, setRealEstate, saveReportItem } = useCalcStore()
  const inputs = realEstate[activeScenario]
  const [selectedMethod, setSelectedMethod] = useState<RepaymentMethod>('annuity')
  const [graduatedRate, setGraduatedRate] = useState(5)

  const principal = inputs.principal * 10000
  const { annualRate, termMonths } = inputs

  const schedules = useMemo(
    () => ({
      annuity: calcAmortizationSchedule(principal, annualRate, termMonths),
      equalPrincipal: calcEqualPrincipalSchedule(principal, annualRate, termMonths),
      graduated: calcGraduatedSchedule(principal, annualRate, termMonths, graduatedRate),
      bullet: calcBulletSchedule(principal, annualRate, termMonths),
    }),
    [principal, annualRate, termMonths, graduatedRate]
  )

  const activeSchedule = schedules[selectedMethod]
  const firstPayment = activeSchedule[0]?.payment ?? 0
  const lastPayment = activeSchedule[activeSchedule.length - 1]?.payment ?? 0
  const totalInterest = useMemo(
    () => activeSchedule.reduce((acc, r) => acc + r.interest, 0),
    [activeSchedule]
  )

  const newDeposit = useMemo(
    () => calcNewDeposit(inputs.deposit, inputs.depositIncreaseRate),
    [inputs.deposit, inputs.depositIncreaseRate]
  )

  const comparisonData = useMemo(() => {
    const years = Math.ceil(termMonths / 12)
    return Array.from({ length: years }, (_, i) => {
      const idx = Math.min((i + 1) * 12 - 1, termMonths - 1)
      return {
        year: `${i + 1}년`,
        원리금균등: Math.round(schedules.annuity[idx]?.remainingBalance ?? 0),
        원금균등: Math.round(schedules.equalPrincipal[idx]?.remainingBalance ?? 0),
        체증식: Math.round(schedules.graduated[idx]?.remainingBalance ?? 0),
        만기일시: Math.round(schedules.bullet[idx]?.remainingBalance ?? 0),
      }
    })
  }, [schedules, termMonths])

  const summaryRows = useMemo(
    () =>
      METHODS.map((m) => {
        const s = schedules[m]
        return {
          method: m,
          label: METHOD_LABELS[m],
          first: s[0]?.payment ?? 0,
          last: s[s.length - 1]?.payment ?? 0,
          totalInterest: s.reduce((acc, r) => acc + r.interest, 0),
        }
      }),
    [schedules]
  )

  return (
    <div className="space-y-5">
      <ScenarioTabs />

      <div className="bg-white rounded-lg border border-[var(--border)] p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">대출 원금 (만원)</span>
          <NumberInput
            value={inputs.principal}
            onChange={(v) => setRealEstate(activeScenario, { principal: v })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">연이율 (%)</span>
          <NumberInput
            value={inputs.annualRate}
            onChange={(v) => setRealEstate(activeScenario, { annualRate: v })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">상환 기간 (개월)</span>
          <NumberInput
            value={inputs.termMonths}
            onChange={(v) => setRealEstate(activeScenario, { termMonths: v })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">보증금 (만원)</span>
          <NumberInput
            value={inputs.deposit}
            onChange={(v) => setRealEstate(activeScenario, { deposit: v })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted-foreground)] text-xs">보증금 인상률 (%)</span>
          <NumberInput
            value={inputs.depositIncreaseRate}
            onChange={(v) => setRealEstate(activeScenario, { depositIncreaseRate: v })}
            className={inputClass}
          />
        </label>
        {selectedMethod === 'graduated' && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted-foreground)] text-xs">체증 비율 (%/년)</span>
            <NumberInput
              value={graduatedRate}
              onChange={setGraduatedRate}
              className={inputClass}
            />
          </label>
        )}
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <p className="text-sm font-medium mb-3">상환 방식 선택</p>
        <div className="flex gap-2 flex-wrap mb-2">
          {METHODS.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMethod(m)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedMethod === m
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]'
              }`}
            >
              {METHOD_LABELS[m]}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">{METHOD_DESCRIPTIONS[selectedMethod]}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ResultCard label="첫 달 납입금" value={fmt(firstPayment)} unit="원" />
        <ResultCard label="마지막 납입금" value={fmt(lastPayment)} unit="원" />
        <ResultCard label="이자 총액" value={fmt(totalInterest)} unit="원" emphasis="loss" />
        <ResultCard label="갱신 후 보증금" value={fmt(newDeposit)} unit="만원" />
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <p className="text-sm font-medium mb-3">상환 방식별 대출 잔금 비교</p>
        <CalcChart
          type="line"
          data={comparisonData}
          xKey="year"
          lines={[
            { key: '원리금균등', label: '원리금균등', color: 'var(--primary)' },
            { key: '원금균등', label: '원금균등', color: '#22c55e' },
            { key: '체증식', label: '체증식', color: '#f59e0b' },
            { key: '만기일시', label: '만기일시', color: '#ef4444' },
          ]}
        />
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4 overflow-x-auto">
        <p className="text-sm font-medium mb-3">상환 방식 비교 요약</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--muted-foreground)] text-xs border-b border-[var(--border)]">
              <th className="pb-2 font-medium">방식</th>
              <th className="pb-2 font-medium text-right">첫 납입금</th>
              <th className="pb-2 font-medium text-right">마지막 납입금</th>
              <th className="pb-2 font-medium text-right">이자 총액</th>
            </tr>
          </thead>
          <tbody>
            {summaryRows.map(({ method, label, first, last, totalInterest: ti }) => (
              <tr
                key={method}
                onClick={() => setSelectedMethod(method)}
                className={`border-b border-[var(--border)] last:border-0 cursor-pointer transition-colors ${
                  selectedMethod === method ? 'bg-blue-50' : 'hover:bg-[var(--muted)]'
                }`}
              >
                <td className="py-2.5 font-medium">{label}</td>
                <td className="py-2.5 text-right tabular-nums">{fmt(first)}원</td>
                <td className="py-2.5 text-right tabular-nums">{fmt(last)}원</td>
                <td className="py-2.5 text-right tabular-nums text-red-600">{fmt(ti)}원</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() =>
            saveReportItem({
              calculatorId: 'real-estate',
              calculatorLabel: '부동산 / 대출',
              scenarioKey: activeScenario,
              summary: `[${METHOD_LABELS[selectedMethod]}] 첫 납입금 ${fmt(firstPayment)}원`,
              value: Math.round(firstPayment),
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
