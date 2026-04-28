import Decimal from 'decimal.js'

export interface AmortizationRow {
  month: number
  payment: number
  principal: number
  interest: number
  remainingBalance: number
}

/**
 * 원리금 균등 상환 월 납입금
 * @param principal 원금 (원)
 * @param annualRate 연이율 (%)
 * @param termMonths 기간 (개월)
 */
export function calcMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (annualRate === 0) {
    return new Decimal(principal).div(termMonths).toNumber()
  }
  const r = new Decimal(annualRate).div(100).div(12)
  const factor = r.plus(1).pow(termMonths)
  const monthly = new Decimal(principal).mul(r).mul(factor).div(factor.minus(1))
  return monthly.toNumber()
}

/**
 * 전체 상환 스케줄 생성
 */
export function calcAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number
): AmortizationRow[] {
  const monthlyPayment = calcMonthlyPayment(principal, annualRate, termMonths)
  const r = new Decimal(annualRate).div(100).div(12)
  let balance = new Decimal(principal)
  const rows: AmortizationRow[] = []

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance.mul(r)
    const principalPaid = new Decimal(monthlyPayment).minus(interest)
    balance = balance.minus(principalPaid)
    if (balance.lessThan(0)) balance = new Decimal(0)

    rows.push({
      month,
      payment: monthlyPayment,
      principal: principalPaid.toNumber(),
      interest: interest.toNumber(),
      remainingBalance: balance.toNumber(),
    })
  }
  return rows
}

/**
 * 보증금 갱신 후 금액 계산 (만원 단위)
 */
export function calcNewDeposit(deposit: number, increaseRate: number): number {
  return new Decimal(deposit)
    .mul(new Decimal(1).plus(new Decimal(increaseRate).div(100)))
    .toNumber()
}
