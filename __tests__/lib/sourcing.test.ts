import { describe, it, expect } from 'vitest'
import { calcSourcingMargin, calcTargetSellPrice } from '@/lib/calculators/sourcing'

describe('calcSourcingMargin', () => {
  it('마진액과 마진율을 계산한다', () => {
    const result = calcSourcingMargin(20, 1350, 3000, 10, 45000)
    expect(result.marginKrw).toBe(10500)
    expect(result.marginRate).toBeCloseTo(23.33, 1)
    expect(result.costKrw).toBe(27000)
    expect(result.feeKrw).toBe(4500)
  })
})

describe('calcTargetSellPrice', () => {
  it('목표 마진율을 위한 판매가를 역산한다', () => {
    const result = calcTargetSellPrice(30000, 10, 30)
    expect(result).toBeCloseTo(50000, 0)
  })
})
