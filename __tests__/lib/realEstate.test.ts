import { describe, it, expect } from 'vitest'
import {
  calcMonthlyPayment,
  calcAmortizationSchedule,
  calcNewDeposit,
} from '@/lib/calculators/realEstate'

describe('calcMonthlyPayment', () => {
  it('원리금 균등 상환 월 납입금을 계산한다', () => {
    const result = calcMonthlyPayment(300000000, 4.5, 360)
    expect(result).toBeCloseTo(1520060, -2)
  })

  it('이율이 0이면 원금/기간 반환', () => {
    const result = calcMonthlyPayment(12000000, 0, 12)
    expect(result).toBeCloseTo(1000000, 0)
  })
})

describe('calcAmortizationSchedule', () => {
  it('12개월 상환 스케줄을 반환한다', () => {
    const schedule = calcAmortizationSchedule(12000000, 12, 12)
    expect(schedule).toHaveLength(12)
    expect(schedule[0].month).toBe(1)
    expect(schedule[0].principal).toBeGreaterThan(0)
    expect(schedule[0].interest).toBeGreaterThan(0)
    expect(schedule[11].remainingBalance).toBeCloseTo(0, 0)
  })
})

describe('calcNewDeposit', () => {
  it('보증금 인상 후 금액을 계산한다', () => {
    const result = calcNewDeposit(50000, 5)
    expect(result).toBe(52500)
  })
})
