export function nextApplicationId(applications) {
  const numbers = applications
    .map((a) => parseInt(a.id.split('-')[1], 10))
    .filter((n) => !Number.isNaN(n))
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1
  return `APP-${String(next).padStart(4, '0')}`
}

// A customer-facing account reference, distinct from the internal APP-xxxx
// application id — searchable in the LMS the way a real account number
// would be.
export function accountNumberFor(type, applicationId) {
  const seq = parseInt(applicationId.split('-')[1], 10) || 0
  return `${type === 'loan' ? 'LN' : 'CC'}${String(seq).padStart(8, '0')}`
}

// Every status an application can carry, and which of those represent real
// outstanding principal (still owed, still counted against a customer's
// caps) vs. not (never disbursed, or no longer owed).
export const APPLICATION_STATUSES = ['pending', 'active', 'overdue', 'written-off', 'closed']
const OUTSTANDING_STATUSES = new Set(['active', 'overdue'])

export function isOutstanding(status) {
  return OUTSTANDING_STATUSES.has(status)
}

// The recurring monthly obligation an application adds against a customer's
// Financial Power: the fixed installment for a loan, or the assumed 10%
// minimum payment for a revolving card.
export function monthlyCommitment(application) {
  return application.type === 'loan' ? application.monthlyInstallment : application.amount * 0.1
}

// Dollar exposure (principal or limit) a customer already carries in
// outstanding products of one type — what that product's own capped limit
// is measured against (e.g. total loan principal still owed vs. the loan
// cap). Overdue counts the same as active: the principal is still owed,
// just behind on payment.
export function exposureByType(applications, customerId, type) {
  return applications
    .filter((a) => a.customerId === customerId && isOutstanding(a.status) && a.type === type)
    .reduce((sum, a) => sum + a.amount, 0)
}

// Combined dollar exposure (loan principal + card limit) a customer already
// carries across every outstanding product — what the master capped limit
// is measured against.
export function totalExposure(applications, customerId) {
  return applications
    .filter((a) => a.customerId === customerId && isOutstanding(a.status))
    .reduce((sum, a) => sum + a.amount, 0)
}
