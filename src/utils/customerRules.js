export const SEGMENTS = {
  MASS: 'Salary Mass',
  UPPER_MASS: 'Salary Upper Mass',
  PREMIUM: 'Salary Premium',
}

export function deriveSegment(monthlyIncome) {
  if (monthlyIncome < 500) return SEGMENTS.MASS
  if (monthlyIncome <= 1500) return SEGMENTS.UPPER_MASS
  return SEGMENTS.PREMIUM
}

export function deriveMinDscr(segment) {
  return segment === SEGMENTS.PREMIUM ? 2.5 : 2.8
}

export function deriveInterestRate(segment) {
  if (segment === SEGMENTS.MASS) return 0.18
  if (segment === SEGMENTS.UPPER_MASS) return 0.17
  return 0.16
}

// Adds every field the underwriting rules derive from a customer's raw
// inputs (name, income, existing obligations): segment, min DSCR, interest
// rate, total obligation, and the resulting Financial Power.
export function withDerivedFields(customer) {
  const segment = deriveSegment(customer.monthlyIncome)
  const minDscr = deriveMinDscr(segment)
  const interestRate = deriveInterestRate(segment)
  const totalObligation = customer.obligationWingBank + customer.obligationOtherBanks
  const maxAllowedObligation = customer.monthlyIncome / minDscr
  const financialPower = Math.max(Math.round(maxAllowedObligation - totalObligation), 0)

  return {
    ...customer,
    segment,
    minDscr,
    interestRate,
    totalObligation,
    maxAllowedObligation: Math.round(maxAllowedObligation),
    financialPower,
  }
}

export function nextCustomerId(customers) {
  const numbers = customers
    .map((c) => parseInt(c.id.split('-')[1], 10))
    .filter((n) => !Number.isNaN(n))
  const next = (numbers.length ? Math.max(...numbers) : 10000) + 1
  return `WB-${next}`
}
