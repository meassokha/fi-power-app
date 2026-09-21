import { todayIsoDate } from '../utils/dates'

export const SOURCE_OF_INCOME_OPTIONS = ['Wing Payroll', 'Valida']

// Seed customers are treated as uploaded the moment the app loads, so their
// expiry date (upload date + 30 days) is always valid rather than a stale
// hardcoded date.
const seedUploadDate = todayIsoDate()

export const initialCustomers = [
  {
    id: 'WB-10231',
    name: 'Sok Dara',
    monthlyIncome: 850,
    obligationWingBank: 120,
    obligationOtherBanks: 80,
    sourceOfIncome: 'Wing Payroll',
    uploadDate: seedUploadDate,
  },
  {
    id: 'WB-10456',
    name: 'Chan Sopheak',
    monthlyIncome: 1200,
    obligationWingBank: 200,
    obligationOtherBanks: 150,
    sourceOfIncome: 'Wing Payroll',
    uploadDate: seedUploadDate,
  },
  {
    id: 'WB-10789',
    name: 'Ly Chenda',
    monthlyIncome: 600,
    obligationWingBank: 50,
    obligationOtherBanks: 0,
    sourceOfIncome: 'Valida',
    uploadDate: seedUploadDate,
  },
  {
    id: 'WB-11024',
    name: 'Heng Vibol',
    monthlyIncome: 2500,
    obligationWingBank: 400,
    obligationOtherBanks: 300,
    sourceOfIncome: 'Valida',
    uploadDate: seedUploadDate,
  },
  {
    id: 'WB-11390',
    name: 'Pich Sreymom',
    monthlyIncome: 950,
    obligationWingBank: 0,
    obligationOtherBanks: 120,
    sourceOfIncome: 'Wing Payroll',
    uploadDate: seedUploadDate,
  },
  {
    id: 'WB-11587',
    name: 'Ros Pisey',
    monthlyIncome: 1800,
    obligationWingBank: 300,
    obligationOtherBanks: 250,
    sourceOfIncome: 'Wing Payroll',
    uploadDate: seedUploadDate,
  },
  {
    id: 'WB-11802',
    name: 'Keo Sovannak',
    monthlyIncome: 1100,
    obligationWingBank: 180,
    obligationOtherBanks: 90,
    sourceOfIncome: 'Valida',
    uploadDate: seedUploadDate,
  },
  {
    id: 'WB-12015',
    name: 'Meas Kunthea',
    monthlyIncome: 3000,
    obligationWingBank: 500,
    obligationOtherBanks: 400,
    sourceOfIncome: 'Valida',
    uploadDate: seedUploadDate,
  },
]

// Selected in the mobile Financial Power preview when the app first loads.
export const defaultSelectedCustomerId = 'WB-10456'
