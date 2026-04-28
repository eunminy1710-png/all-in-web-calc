import Decimal from 'decimal.js'

export interface NutritionBreakdown {
  carb: number
  protein: number
  fat: number
  total: number
}

export function calcNutritionBreakdown(
  totalGrams: number,
  carbRatio: number,
  proteinRatio: number,
  fatRatio: number
): NutritionBreakdown {
  const total = new Decimal(totalGrams)
  const carb = total.mul(new Decimal(carbRatio).div(100)).toDecimalPlaces(1).toNumber()
  const protein = total.mul(new Decimal(proteinRatio).div(100)).toDecimalPlaces(1).toNumber()
  const fat = total.mul(new Decimal(fatRatio).div(100)).toDecimalPlaces(1).toNumber()
  return { carb, protein, fat, total: totalGrams }
}
