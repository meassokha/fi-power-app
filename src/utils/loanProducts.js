// Maps a customer's verified source of income to the admin-managed product
// (from Product Configuration) that prices their loan. 'Wing Payroll' isn't
// listed because it falls through to the settings-driven Consumer Loan.
export const SOURCE_TO_PRODUCT_ID = {
  Valida: 'non-wing-payroll',
  'Wing Bank Merchant': 'wing-bank-merchant',
  'Other Bank Merchant': 'other-bank-merchant',
}

export const CONSUMER_LOAN_NAME = 'Consumer Loan'

// The named loan product a customer's income source routes them to — the
// settings-driven Consumer Loan for Wing Payroll customers, or whichever
// admin-managed product (from `products`) matches otherwise.
export function resolveLoanProduct(sourceOfIncome, products) {
  const matched = products.find((p) => p.id === SOURCE_TO_PRODUCT_ID[sourceOfIncome])
  return matched ?? null
}

export function resolveLoanProductName(sourceOfIncome, products) {
  return resolveLoanProduct(sourceOfIncome, products)?.name ?? CONSUMER_LOAN_NAME
}
