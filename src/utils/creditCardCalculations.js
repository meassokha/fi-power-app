export const CREDIT_CARD_INTEREST_RATE = 0.18 // 18% p.a., i.e. 1.5%/month
export const MIN_MONTHLY_REPAYMENT_RATE = 0.1
export const MIN_CREDIT_LIMIT = 200
export const MAX_CREDIT_LIMIT = 10000

// A customer's minimum monthly card repayment is assumed to be 10% of their
// limit, so the limit their Financial Power (EMI capacity) supports is
// financialPower / minMonthlyRepaymentRate, i.e. financialPower x 10 —
// capped at MAX_CREDIT_LIMIT.
export function computeCreditLimit(financialPower) {
  const raw = financialPower / MIN_MONTHLY_REPAYMENT_RATE
  return Math.min(Math.max(Math.round(raw), 0), MAX_CREDIT_LIMIT)
}
