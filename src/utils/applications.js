export function nextApplicationId(applications) {
  const numbers = applications
    .map((a) => parseInt(a.id.split('-')[1], 10))
    .filter((n) => !Number.isNaN(n))
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1
  return `APP-${String(next).padStart(4, '0')}`
}

// The recurring monthly obligation an application adds against a customer's
// Financial Power: the fixed installment for a loan, or the assumed 10%
// minimum payment for a revolving card.
export function monthlyCommitment(application) {
  return application.type === 'loan' ? application.monthlyInstallment : application.amount * 0.1
}

// Dollar exposure (principal or limit) a customer already carries in active
// products of one type — what that product's own capped limit is measured
// against (e.g. total active loan principal vs. the loan cap).
export function exposureByType(applications, customerId, type) {
  return applications
    .filter((a) => a.customerId === customerId && a.status === 'active' && a.type === type)
    .reduce((sum, a) => sum + a.amount, 0)
}

// Combined dollar exposure (loan principal + card limit) a customer already
// carries across every active product — what the master capped limit is
// measured against.
export function totalExposure(applications, customerId) {
  return applications
    .filter((a) => a.customerId === customerId && a.status === 'active')
    .reduce((sum, a) => sum + a.amount, 0)
}
