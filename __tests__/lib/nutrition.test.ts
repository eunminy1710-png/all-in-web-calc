import { describe, it, expect } from 'vitest'
import { calcNutritionBreakdown } from '@/lib/calculators/nutrition'

describe('calcNutritionBreakdown', () => {
  it('영양소별 목표 무게를 배분한다', () => {
    const result = calcNutritionBreakdown(200, 50, 30, 20)
    expect(result.carb).toBe(100)
    expect(result.protein).toBe(60)
    expect(result.fat).toBe(40)
    expect(result.total).toBe(200)
  })

  it('비율 합 기준으로 무게 배분', () => {
    const result = calcNutritionBreakdown(100, 60, 30, 10)
    expect(result.carb + result.protein + result.fat).toBeCloseTo(100, 1)
  })
})
