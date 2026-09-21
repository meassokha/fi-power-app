import { addMonthsToDate, startOfToday } from './dates'

export const MIN_LOAN_AMOUNT = 530

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
