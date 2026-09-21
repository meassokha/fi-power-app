export const CREDIT_CARD_INTEREST_RATE = 0.18 // 18% p.a., i.e. 1.5%/month
export const MIN_MONTHLY_REPAYMENT_RATE = 0.1
export const MIN_CREDIT_LIMIT = 200

// The max card limit is the smallest of three independent ceilings: what
// remaining Financial Power supports (assuming a 10% minimum monthly
// repayment, i.e. financialPower x 10), whatever headroom is left under the
// card cap once their OTHER active cards are counted against it, and
// whatever headroom is left under the combined master cap once every
// active product (loans + cards) is counted.
export function computeCardEligibility({ remainingFinancialPower, existingCardExposure, existingTotalExposure, settings }) {
  const candidates = [
    { value: remainingFinancialPower / MIN_MONTHLY_REPAYMENT_RATE, label: 'your Financial Power' },
    { value: Math.max(settings.maxCardLimit - existingCardExposure, 0), label: 'the max card limit' },
    { value: Math.max(settings.masterCappedLimit - existingTotalExposure, 0), label: 'the master capped limit' },
  ]
  const binding = candidates.reduce((min, c) => (c.value < min.value ? c : min))
  const limit = Math.max(Math.round(binding.value), 0)

  return { eligible: limit >= MIN_CREDIT_LIMIT, limit, cappedBy: binding.label }
}
