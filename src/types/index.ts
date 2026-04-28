export type ScenarioKey = 'A' | 'B'

export interface Memo {
  id: string
  calculatorId: string
  scenarioKey: ScenarioKey
  content: string
  createdAt: string
}

export interface ReportItem {
  id: string
  calculatorId: string
  calculatorLabel: string
  scenarioKey: ScenarioKey
  summary: string
  value: number
  unit: string
  savedAt: string
}

export interface RealEstateInputs {
  principal: number
  annualRate: number
  termMonths: number
  deposit: number
  depositIncreaseRate: number
}

export interface InvestmentInputs {
  principal: number
  annualReturn: number
  years: number
  entryPrice: number
  leverage: number
}

export interface SourcingInputs {
  costForeign: number
  exchangeRate: number
  shippingKrw: number
  feeRate: number
  sellPriceKrw: number
}

export interface NutritionInputs {
  totalGrams: number
  carbRatio: number
  proteinRatio: number
  fatRatio: number
}
