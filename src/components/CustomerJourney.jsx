import { useMemo, useState } from 'react'
import FinancialPowerHome from '../screens/FinancialPowerHome'
import FinancialPowerBreakdown from '../screens/FinancialPowerBreakdown'
import LoanApplication from '../screens/LoanApplication'
import CreditCardApplication from '../screens/CreditCardApplication'
import LoanAccount from '../screens/LoanAccount'
import CardAccount from '../screens/CardAccount'
import ActiveProducts from '../screens/ActiveProducts'
import { withDerivedFields } from '../utils/customerRules'
import { exposureByType, isOutstanding, monthlyCommitment, totalExposure } from '../utils/applications'
import { resolveLoanProduct } from '../utils/loanProducts'

// The full Financial Power screen flow (Home -> Breakdown / Loan / Card /
// their account views / active products) for ONE customer. Reused by the
// main admin preview (a customer picked from the Whitelist) and by the
// self-service Demo flow (a customer generated from a random profile) —
// both just hand it a raw customer record plus the shared applications/
// settings/products state.
export default function CustomerJourney({ customerRaw, applications, settings, products, onApply, onCloseApplication }) {
  const [screen, setScreen] = useState('home')
  const [viewingLoanApplicationId, setViewingLoanApplicationId] = useState(null)
  const [viewingCardApplicationId, setViewingCardApplicationId] = useState(null)
  const [pendingLoanAmount, setPendingLoanAmount] = useState(null)
  const [pendingLoanTenor, setPendingLoanTenor] = useState(null)
  const [pendingCardAmount, setPendingCardAmount] = useState(null)

  const customer = useMemo(() => withDerivedFields(customerRaw), [customerRaw])

  // Which loan product a customer sees is driven by their verified income
  // source, not a fixed product — a Wing Bank payroll customer gets the
  // standard, settings-driven Consumer Loan; everyone else gets whichever
  // admin-managed product matches how their income was verified.
  const matchedProduct = resolveLoanProduct(customer.sourceOfIncome, products)
  const loanProductName = matchedProduct?.name ?? 'Consumer Loan'

  const loanCustomer = useMemo(() => {
    if (!matchedProduct) return customer
    return { ...customer, interestRate: matchedProduct.interestRate }
  }, [customer, matchedProduct])

  const loanSettings = useMemo(() => {
    if (!matchedProduct) return settings
    return {
      ...settings,
      maxLoanLimit: matchedProduct.maxLimit,
      ppiRate: matchedProduct.ppiRate,
      processingFeeWithPpi: matchedProduct.processingFeeWithPpi,
      processingFeeWithoutPpi: matchedProduct.processingFeeWithoutPpi,
    }
  }, [settings, matchedProduct])

  // "Active" here means outstanding — active or overdue both still carry
  // real principal against the customer's Financial Power and caps.
  const activeApplications = useMemo(
    () => applications.filter((a) => a.customerId === customer.id && isOutstanding(a.status)),
    [applications, customer.id],
  )

  const remainingFinancialPower = Math.max(
    Math.floor(customer.financialPower - activeApplications.reduce((sum, app) => sum + monthlyCommitment(app), 0)),
    0,
  )
  const existingLoanExposure = exposureByType(applications, customer.id, 'loan')
  const existingCardExposure = exposureByType(applications, customer.id, 'card')
  const existingTotalExposure = totalExposure(applications, customer.id)

  const viewingLoanApplication = applications.find((a) => a.id === viewingLoanApplicationId) ?? null
  const viewingCardApplication = applications.find((a) => a.id === viewingCardApplicationId) ?? null

  function goHome() {
    setPendingLoanAmount(null)
    setPendingLoanTenor(null)
    setPendingCardAmount(null)
    setScreen('home')
  }

  function handleGoToLoan(amount, tenor) {
    setPendingLoanAmount(amount)
    setPendingLoanTenor(tenor)
    setScreen('loan')
  }

  function handleGoToCard(amount) {
    setPendingCardAmount(amount)
    setScreen('card')
  }

  function handleViewLoan(app) {
    setViewingLoanApplicationId(app.id)
    setScreen('loan-account')
  }

  function handleViewCard(app) {
    setViewingCardApplicationId(app.id)
    setScreen('card-account')
  }

  return (
    <>
      {screen === 'home' && (
        <FinancialPowerHome
          customer={loanCustomer}
          loanProductName={loanProductName}
          remainingFinancialPower={remainingFinancialPower}
          existingLoanExposure={existingLoanExposure}
          existingCardExposure={existingCardExposure}
          existingTotalExposure={existingTotalExposure}
          settings={loanSettings}
          activeApplications={activeApplications}
          onNavigate={setScreen}
          onGoToLoan={handleGoToLoan}
          onGoToCard={handleGoToCard}
        />
      )}
      {screen === 'active-products' && (
        <ActiveProducts
          activeApplications={activeApplications}
          loanProductName={loanProductName}
          onBack={goHome}
          onViewLoan={handleViewLoan}
          onViewCard={handleViewCard}
        />
      )}
      {screen === 'breakdown' && (
        <FinancialPowerBreakdown
          customer={loanCustomer}
          remainingFinancialPower={remainingFinancialPower}
          existingLoanExposure={existingLoanExposure}
          existingCardExposure={existingCardExposure}
          existingTotalExposure={existingTotalExposure}
          settings={loanSettings}
          onBack={goHome}
          onNavigate={setScreen}
        />
      )}
      {screen === 'loan' && (
        <LoanApplication
          customer={loanCustomer}
          productName={loanProductName}
          remainingFinancialPower={remainingFinancialPower}
          existingLoanExposure={existingLoanExposure}
          existingTotalExposure={existingTotalExposure}
          settings={loanSettings}
          initialAmount={pendingLoanAmount}
          initialTenor={pendingLoanTenor}
          onBack={goHome}
          onApply={(fields) => onApply('loan', fields)}
        />
      )}
      {screen === 'card' && (
        <CreditCardApplication
          customer={customer}
          remainingFinancialPower={remainingFinancialPower}
          existingCardExposure={existingCardExposure}
          existingTotalExposure={existingTotalExposure}
          settings={settings}
          initialAmount={pendingCardAmount}
          onBack={goHome}
          onApply={(fields) => onApply('card', fields)}
        />
      )}
      {screen === 'loan-account' && viewingLoanApplication && (
        <LoanAccount
          application={viewingLoanApplication}
          customer={loanCustomer}
          productName={loanProductName}
          onBack={goHome}
          onPayoff={onCloseApplication}
        />
      )}
      {screen === 'card-account' && viewingCardApplication && (
        <CardAccount
          application={viewingCardApplication}
          customer={customer}
          onBack={goHome}
          onClose={onCloseApplication}
        />
      )}
    </>
  )
}
