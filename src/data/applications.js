import { accountNumberFor } from '../utils/applications'
import { addDaysToDate, todayIsoDate } from '../utils/dates'

function daysAgo(n) {
  return addDaysToDate(todayIsoDate(), -n)
}

// Spread across statuses and disbursement dates so the LMS (tables, filters,
// search, dashboard trend charts) isn't empty on first load. Amounts/EMIs
// are pre-checked against each seed customer's real eligibility ceiling
// (see utils/loanCalculations computeLoanEligibility) so they stay
// internally consistent with the app's own underwriting math.
const RAW_APPLICATIONS = [
  {
    id: 'APP-0001',
    customerId: 'WB-11024',
    customerName: 'Heng Vibol',
    type: 'loan',
    status: 'active',
    amount: 6000,
    tenor: 36,
    monthlyInstallment: 210.94,
    disbursementDate: daysAgo(5),
  },
  {
    id: 'APP-0002',
    customerId: 'WB-11587',
    customerName: 'Ros Pisey',
    type: 'card',
    status: 'active',
    amount: 1500,
    disbursementDate: daysAgo(12),
  },
  {
    id: 'APP-0003',
    customerId: 'WB-12015',
    customerName: 'Meas Kunthea',
    type: 'loan',
    status: 'closed',
    amount: 5000,
    tenor: 24,
    monthlyInstallment: 244.82,
    disbursementDate: daysAgo(60),
  },
  {
    id: 'APP-0004',
    customerId: 'WB-11802',
    customerName: 'Keo Sovannak',
    type: 'card',
    status: 'active',
    amount: 1000,
    disbursementDate: daysAgo(3),
  },
  {
    id: 'APP-0005',
    customerId: 'WB-10231',
    customerName: 'Sok Dara',
    type: 'loan',
    status: 'pending',
    amount: 1000,
    tenor: 12,
    monthlyInstallment: 91.2,
    disbursementDate: null,
  },
  {
    id: 'APP-0006',
    customerId: 'WB-11390',
    customerName: 'Pich Sreymom',
    type: 'loan',
    status: 'overdue',
    amount: 4000,
    tenor: 36,
    monthlyInstallment: 142.61,
    disbursementDate: daysAgo(45),
  },
  {
    id: 'APP-0007',
    customerId: 'WB-10789',
    customerName: 'Ly Chenda',
    type: 'loan',
    status: 'written-off',
    amount: 3000,
    tenor: 24,
    monthlyInstallment: 148.33,
    disbursementDate: daysAgo(90),
  },
  {
    id: 'APP-0008',
    customerId: 'WB-10456',
    customerName: 'Chan Sopheak',
    type: 'card',
    status: 'closed',
    amount: 600,
    disbursementDate: daysAgo(30),
  },
]

export const initialApplications = RAW_APPLICATIONS.map((a) => ({
  ...a,
  accountNumber: accountNumberFor(a.type, a.id),
}))
