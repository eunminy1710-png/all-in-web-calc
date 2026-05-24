import Decimal from 'decimal.js'

export interface AmortizationRow {
  month: number
  payment: number
  principal: number
  interest: number
  remainingBalance: number
}

export type RepaymentMethod = 'annuity' | 'equalPrincipal' | 'graduated' | 'bullet'

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
  if (termMonths <= 0) return 0
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
  if (termMonths <= 0) return []
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

/**
 * 원금균등상환: 매월 동일한 원금 상환, 이자는 잔금에 비례해 감소
 */
export function calcEqualPrincipalSchedule(
  principal: number,
  annualRate: number,
  termMonths: number
): AmortizationRow[] {
  if (termMonths <= 0) return []
  const r = new Decimal(annualRate).div(100).div(12)
  const monthlyPrincipal = new Decimal(principal).div(termMonths)
  let balance = new Decimal(principal)
  const rows: AmortizationRow[] = []

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance.mul(r)
    const payment = monthlyPrincipal.plus(interest)
    balance = balance.minus(monthlyPrincipal)
    if (balance.lessThan(0)) balance = new Decimal(0)
    rows.push({
      month,
      payment: payment.toNumber(),
      principal: monthlyPrincipal.toNumber(),
      interest: interest.toNumber(),
      remainingBalance: balance.toNumber(),
    })
  }
  return rows
}

/**
 * 체증식상환: 납입금이 매년 annualIncreaseRate%씩 증가
 * 이분법으로 첫 달 납입금(P1) 산출
 */
export function calcGraduatedSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  annualIncreaseRate: number = 5
): AmortizationRow[] {
  if (termMonths <= 0) return []
  const monthlyRate = new Decimal(annualRate).div(100).div(12)
  const g = new Decimal(annualIncreaseRate).div(100)

  const simulate = (p1: number): number => {
    let balance = new Decimal(principal)
    for (let month = 1; month <= termMonths; month++) {
      const year = Math.ceil(month / 12)
      const payment = new Decimal(p1).mul(g.plus(1).pow(year - 1))
      const interest = balance.mul(monthlyRate)
      balance = balance.minus(payment.minus(interest))
    }
    return balance.toNumber()
  }

  // 이분법: simulate(lo) > 0, simulate(hi) <= 0 을 만족하는 P1 탐색
  let lo = new Decimal(principal).mul(monthlyRate).toNumber()
  let hi = calcMonthlyPayment(principal, annualRate, termMonths) * 2
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (simulate(mid) > 0) lo = mid
    else hi = mid
  }
  const p1 = (lo + hi) / 2

  let balance = new Decimal(principal)
  const rows: AmortizationRow[] = []
  for (let month = 1; month <= termMonths; month++) {
    const year = Math.ceil(month / 12)
    const payment = new Decimal(p1).mul(g.plus(1).pow(year - 1))
    const interest = balance.mul(monthlyRate)
    const principalPaid = payment.minus(interest)
    balance = balance.minus(principalPaid)
    if (balance.lessThan(0)) balance = new Decimal(0)
    rows.push({
      month,
      payment: payment.toNumber(),
      principal: principalPaid.toNumber(),
      interest: interest.toNumber(),
      remainingBalance: balance.toNumber(),
    })
  }
  return rows
}

/**
 * 만기일시상환: 매월 이자만 납입, 만기에 원금 전액 상환
 */
export function calcBulletSchedule(
  principal: number,
  annualRate: number,
  termMonths: number
): AmortizationRow[] {
  if (termMonths <= 0) return []
  const monthlyInterest = new Decimal(principal).mul(new Decimal(annualRate).div(100).div(12))
  const rows: AmortizationRow[] = []

  for (let month = 1; month <= termMonths; month++) {
    const isLast = month === termMonths
    rows.push({
      month,
      payment: isLast ? monthlyInterest.plus(principal).toNumber() : monthlyInterest.toNumber(),
      principal: isLast ? principal : 0,
      interest: monthlyInterest.toNumber(),
      remainingBalance: isLast ? 0 : principal,
    })
  }
  return rows
}
