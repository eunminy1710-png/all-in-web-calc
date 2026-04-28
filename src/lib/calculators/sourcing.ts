import Decimal from 'decimal.js'

export interface SourcingMarginResult {
  costKrw: number
  feeKrw: number
  totalCostKrw: number
  marginKrw: number
  marginRate: number
}

export function calcSourcingMargin(
  costForeign: number,
  exchangeRate: number,
  shippingKrw: number,
  feeRate: number,
  sellPriceKrw: number
): SourcingMarginResult {
  const costKrw = new Decimal(costForeign).mul(exchangeRate).toNumber()
  const feeKrw = new Decimal(sellPriceKrw).mul(new Decimal(feeRate).div(100)).toNumber()
  const totalCostKrw = new Decimal(costKrw).plus(shippingKrw).plus(feeKrw).toNumber()
  const marginKrw = new Decimal(sellPriceKrw).minus(totalCostKrw).toNumber()
  const marginRate = new Decimal(marginKrw).div(sellPriceKrw).mul(100).toNumber()
  return { costKrw, feeKrw, totalCostKrw, marginKrw, marginRate }
}

/**
 * 목표 마진율 달성을 위한 판매가 역산
 * P = fixedCostKrw / (1 - feeRate/100 - targetMarginRate/100)
 */
export function calcTargetSellPrice(
  fixedCostKrw: number,
  feeRate: number,
  targetMarginRate: number
): number {
  const divisor = new Decimal(1)
    .minus(new Decimal(feeRate).div(100))
    .minus(new Decimal(targetMarginRate).div(100))
  return new Decimal(fixedCostKrw).div(divisor).toNumber()
}
