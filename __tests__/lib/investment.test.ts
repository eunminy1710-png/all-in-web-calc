import { describe, it, expect } from 'vitest'
import {
  calcCompoundGrowth,
  calcLiquidationPrice,
  calcCompoundSchedule,
} from '@/lib/calculators/investment'

describe('calcCompoundGrowth', () => {
  it('복리 최종 금액을 계산한다', () => {
    const result = calcCompoundGrowth(10000000, 8, 10)
    expect(result).toBeCloseTo(21589250, -3)
  })
})

describe('calcLiquidationPrice', () => {
  it('롱 포지션 청산가를 계산한다', () => {
    const result = calcLiquidationPrice(100, 5, 'long')
    expect(result).toBeCloseTo(80, 1)
  })

  it('숏 포지션 청산가를 계산한다', () => {
    const result = calcLiquidationPrice(100, 5, 'short')
    expect(result).toBeCloseTo(120, 1)
  })
})

describe('calcCompoundSchedule', () => {
  it('5년치 복리 스케줄을 반환한다', () => {
    const schedule = calcCompoundSchedule(10000000, 8, 5)
    expect(schedule).toHaveLength(5)
    expect(schedule[0].year).toBe(1)
    expect(schedule[4].year).toBe(5)
    expect(schedule[4].total).toBeGreaterThan(10000000)
  })
})
