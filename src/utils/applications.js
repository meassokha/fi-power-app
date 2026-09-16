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
