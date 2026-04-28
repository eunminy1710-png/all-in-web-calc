import Decimal from 'decimal.js'

export interface CompoundRow {
  year: number
  total: number
  gain: number
}

/**
 * 복리 최종 금액 = P * (1 + r)^n
 */
export function calcCompoundGrowth(
  principal: number,
  annualReturn: number,
  years: number
): number {
  const r = new Decimal(annualReturn).div(100)
  return new Decimal(principal).mul(r.plus(1).pow(years)).toNumber()
}

/**
 * 연도별 복리 성장 스케줄
 */
export function calcCompoundSchedule(
  principal: number,
  annualReturn: number,
  years: number
): CompoundRow[] {
  return Array.from({ length: years }, (_, i) => {
    const year = i + 1
    const total = calcCompoundGrowth(principal, annualReturn, year)
    return { year, total, gain: total - principal }
  })
}

/**
 * 선물 청산가 계산
 * long:  청산가 = 진입가 * (1 - 1/leverage)
 * short: 청산가 = 진입가 * (1 + 1/leverage)
 */
export function calcLiquidationPrice(
  entryPrice: number,
  leverage: number,
  direction: 'long' | 'short'
): number {
  const e = new Decimal(entryPrice)
  const l = new Decimal(leverage)
  if (direction === 'long') {
    return e.mul(new Decimal(1).minus(new Decimal(1).div(l))).toNumber()
  }
  return e.mul(new Decimal(1).plus(new Decimal(1).div(l))).toNumber()
}
