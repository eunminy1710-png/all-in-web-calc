import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ScenarioKey,
  Memo,
  ReportItem,
  RealEstateInputs,
  InvestmentInputs,
  SourcingInputs,
  NutritionInputs,
} from '@/types'

interface CalcState {
  activeScenario: ScenarioKey
  realEstate: Record<ScenarioKey, RealEstateInputs>
  investment: Record<ScenarioKey, InvestmentInputs>
  sourcing: Record<ScenarioKey, SourcingInputs>
  nutrition: Record<ScenarioKey, NutritionInputs>
  memos: Memo[]
  reportItems: ReportItem[]

  setActiveScenario: (key: ScenarioKey) => void
  setRealEstate: (key: ScenarioKey, inputs: Partial<RealEstateInputs>) => void
  setInvestment: (key: ScenarioKey, inputs: Partial<InvestmentInputs>) => void
  setSourcing: (key: ScenarioKey, inputs: Partial<SourcingInputs>) => void
  setNutrition: (key: ScenarioKey, inputs: Partial<NutritionInputs>) => void
  addMemo: (memo: Omit<Memo, 'id' | 'createdAt'>) => void
  deleteMemo: (id: string) => void
  saveReportItem: (item: Omit<ReportItem, 'id' | 'savedAt'>) => void
  deleteReportItem: (id: string) => void
  importStore: (data: Partial<Pick<CalcState, 'reportItems' | 'memos'>>) => void
}

const defaultRealEstate: RealEstateInputs = {
  principal: 30000,
  annualRate: 4.5,
  termMonths: 360,
  deposit: 50000,
  depositIncreaseRate: 5,
}

const defaultInvestment: InvestmentInputs = {
  principal: 1000,
  annualReturn: 8,
  years: 10,
  entryPrice: 100000000,
  leverage: 5,
}

const defaultSourcing: SourcingInputs = {
  costForeign: 20,
  exchangeRate: 1350,
  shippingKrw: 3000,
  feeRate: 10,
  sellPriceKrw: 45000,
}

const defaultNutrition: NutritionInputs = {
  totalGrams: 200,
  carbRatio: 50,
  proteinRatio: 30,
  fatRatio: 20,
}

export const useCalcStore = create<CalcState>()(
  persist(
    (set) => ({
      activeScenario: 'A',
      realEstate: { A: { ...defaultRealEstate }, B: { ...defaultRealEstate } },
      investment: { A: { ...defaultInvestment }, B: { ...defaultInvestment } },
      sourcing: { A: { ...defaultSourcing }, B: { ...defaultSourcing } },
      nutrition: { A: { ...defaultNutrition }, B: { ...defaultNutrition } },
      memos: [],
      reportItems: [],

      setActiveScenario: (key) => set({ activeScenario: key }),

      setRealEstate: (key, inputs) =>
        set((s) => ({
          realEstate: { ...s.realEstate, [key]: { ...s.realEstate[key], ...inputs } },
        })),

      setInvestment: (key, inputs) =>
        set((s) => ({
          investment: { ...s.investment, [key]: { ...s.investment[key], ...inputs } },
        })),

      setSourcing: (key, inputs) =>
        set((s) => ({
          sourcing: { ...s.sourcing, [key]: { ...s.sourcing[key], ...inputs } },
        })),

      setNutrition: (key, inputs) =>
        set((s) => ({
          nutrition: { ...s.nutrition, [key]: { ...s.nutrition[key], ...inputs } },
        })),

      addMemo: (memo) =>
        set((s) => ({
          memos: [
            ...s.memos,
            { ...memo, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),

      deleteMemo: (id) =>
        set((s) => ({ memos: s.memos.filter((m) => m.id !== id) })),

      saveReportItem: (item) =>
        set((s) => ({
          reportItems: [
            ...s.reportItems,
            { ...item, id: crypto.randomUUID(), savedAt: new Date().toISOString() },
          ],
        })),

      deleteReportItem: (id) =>
        set((s) => ({ reportItems: s.reportItems.filter((r) => r.id !== id) })),

      importStore: (data) =>
        set((s) => ({
          reportItems: data.reportItems ?? s.reportItems,
          memos: data.memos ?? s.memos,
        })),
    }),
    { name: 'all-in-web-calc-store' }
  )
)
