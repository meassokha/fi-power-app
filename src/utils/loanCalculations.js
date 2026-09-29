import { addMonthsToDate, startOfToday } from './dates'

export const MIN_LOAN_AMOUNT = 530

export function roundDownToHundred(value) {
  return Math.floor(value / 100) * 100
}

// Customers pick how much cash they want in hand; the loan amount (what
// they'll actually owe) is the larger figure once the processing fee is
// added back on top. With no PPI selected, computeLoanOffer's cashOnHand is
// just loanAmount * (1 - processingFeeRate), so these two are its inverse.
export function cashOnHandForLoanAmount(loanAmount, processingFeeRate) {
  return loanAmount * (1 - processingFeeRate)
}

export function loanAmountForCashOnHand(cashOnHand, processingFeeRate) {
  const cashFactor = 1 - processingFeeRate
  return cashFactor > 0 ? cashOnHand / cashFactor : 0
}

// Numerically inverts computeLoanOffer's cashOnHand for a target cash
// amount. Needed wherever PPI can be selected: its premium comes from an
// amortization schedule, not a flat percentage, so cashOnHand isn't a simple
// fraction of loanAmount the way it is with PPI off — bisection stays exact
// (and correct) either way by reusing computeLoanOffer itself as the model,
// rather than re-deriving a parallel closed-form formula that could drift.
export function loanAmountForTargetCashOnHand({ targetCashOnHand, annualRate, months, ppiSelected, settings }) {
  if (targetCashOnHand <= 0) return 0
  let lo = 0
  let hi = Math.max(targetCashOnHand * 2, 1000)
  while (
    computeLoanOffer({ annualRate, months, ppiSelected, settings, loanAmount: hi }).cashOnHand < targetCashOnHand &&
    hi < 1e9
  ) {
    hi *= 2
  }
  for (let i = 0; i < 40; i += 1) {
    const mid = (lo + hi) / 2
    const cash = computeLoanOffer({ annualRate, months, ppiSelected, settings, loanAmount: mid }).cashOnHand
    if (cash < targetCashOnHand) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return (lo + hi) / 2
}

// Monthly installment for a given principal (standard reducing-balance EMI).
export function computeEmi(principal, annualRate, months) {
  const r = annualRate / 12
  if (principal <= 0 || months <= 0) return 0
  if (r === 0) return principal / months
  const factor = (1 + r) ** months
  return (principal * r * factor) / (factor - 1)
}

// Reverses the EMI formula: the largest principal repayable at `emiCapacity`/month.
export function computeMaxPrincipalForEmi(emiCapacity, annualRate, months) {
  const r = annualRate / 12
  if (emiCapacity <= 0 || months <= 0) return 0
  if (r === 0) return emiCapacity * months
  const factor = (1 + r) ** months
  return (emiCapacity * (factor - 1)) / (r * factor)
}

// Month-by-month declining-balance schedule for a loan.
export function computeAmortizationSchedule(principal, annualRate, months) {
  const r = annualRate / 12
  const emi = computeEmi(principal, annualRate, months)
  const schedule = []
  let balance = principal
  for (let month = 1; month <= months; month += 1) {
    const openingBalance = balance
    const interest = openingBalance * r
    const principalPortion = Math.min(emi - interest, openingBalance)
    balance = Math.max(openingBalance - principalPortion, 0)
    schedule.push({ month, openingBalance, interest, principalPortion, closingBalance: balance })
  }
  return schedule
}

// PPI is priced monthly on the declining balance but collected as a single
// upfront premium, so it's the sum of every month's would-be charge.
export function computeTotalPpi(principal, annualRate, months, ppiMonthlyRate) {
  const schedule = computeAmortizationSchedule(principal, annualRate, months)
  return schedule.reduce((sum, row) => sum + row.openingBalance * ppiMonthlyRate, 0)
}

// Maturity date, and the next unpaid installment's due date/amount relative
// to today — this demo doesn't track individual payments made, so "next
// payment" is simply the first monthly due date that hasn't passed yet.
export function computeLoanScheduleDates(disbursementDate, tenor, monthlyInstallment) {
  const maturityDate = addMonthsToDate(disbursementDate, tenor)
  const today = startOfToday()

  for (let month = 1; month <= tenor; month += 1) {
    const dueDate = addMonthsToDate(disbursementDate, month)
    const [y, m, d] = dueDate.split('-').map(Number)
    if (new Date(y, m - 1, d) >= today) {
      return { maturityDate, nextPaymentDate: dueDate, nextPaymentAmount: monthlyInstallment }
    }
  }

  return { maturityDate, nextPaymentDate: null, nextPaymentAmount: 0 }
}

// The max a customer can borrow is the smallest of three independent
// ceilings: what their remaining Financial Power can service (EMI-based),
// whatever headroom is left under the loan cap once their OTHER active
// loans are counted against it, and whatever headroom is left under the
// combined master cap once every active product (loans + cards) is counted.
export function computeLoanEligibility({
  remainingFinancialPower,
  annualRate,
  months,
  existingLoanExposure,
  existingTotalExposure,
  settings,
}) {
  const candidates = [
    { value: computeMaxPrincipalForEmi(remainingFinancialPower, annualRate, months), label: 'your Financial Power' },
    { value: Math.max(settings.maxLoanLimit - existingLoanExposure, 0), label: 'the max loan limit' },
    { value: Math.max(settings.masterCappedLimit - existingTotalExposure, 0), label: 'the master capped limit' },
  ]
  const binding = candidates.reduce((min, c) => (c.value < min.value ? c : min))
  const maxLoan = Math.max(Math.floor(binding.value / 10) * 10, 0)

  return { eligible: maxLoan >= MIN_LOAN_AMOUNT, maxLoan, cappedBy: binding.label }
}

// Pricing for a specific loan amount already clamped to an eligible range —
// call computeLoanEligibility first to know that range.
export function computeLoanOffer({ annualRate, months, ppiSelected, settings, loanAmount }) {
  const monthlyInstallment = computeEmi(loanAmount, annualRate, months)
  const totalRepayable = monthlyInstallment * months
  const processingFeeRate = ppiSelected ? settings.processingFeeWithPpi : settings.processingFeeWithoutPpi
  const processingFee = loanAmount * processingFeeRate
  const ppiTotal = ppiSelected ? computeTotalPpi(loanAmount, annualRate, months, settings.ppiRate) : 0
  const cashOnHand = loanAmount - processingFee - ppiTotal

  return { amount: loanAmount, monthlyInstallment, totalRepayable, processingFeeRate, processingFee, ppiTotal, cashOnHand }
}
