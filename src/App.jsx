import { useEffect, useMemo, useState } from 'react'
import './App.css'
import './styles/shared.css'
import WhitelistPage from './pages/WhitelistPage'
import LmsPage from './pages/LmsPage'
import PhoneShell from './components/PhoneShell'
import SettingsPanel from './components/SettingsPanel'
import { GearIcon } from './components/icons'
import FinancialPowerHome from './screens/FinancialPowerHome'
import FinancialPowerBreakdown from './screens/FinancialPowerBreakdown'
import LoanApplication from './screens/LoanApplication'
import CreditCardApplication from './screens/CreditCardApplication'
import LoanAccount from './screens/LoanAccount'
import CardAccount from './screens/CardAccount'
import ActiveProducts from './screens/ActiveProducts'
import { defaultSelectedCustomerId, initialCustomers } from './data/customers'
import { nextCustomerId, withDerivedFields } from './utils/customerRules'
import { DEFAULT_SETTINGS } from './utils/settings'
import { exposureByType, monthlyCommitment, nextApplicationId, totalExposure } from './utils/applications'
import { todayIsoDate } from './utils/dates'

const SETTINGS_STORAGE_KEY = 'financePower.settings'

function loadStoredSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

function App() {
  const [page, setPage] = useState('main')
  const [customers, setCustomers] = useState(initialCustomers)
  const [selectedCustomerId, setSelectedCustomerId] = useState(defaultSelectedCustomerId)
  const [screen, setScreen] = useState('home')
  const [settings, setSettings] = useState(loadStoredSettings)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [applications, setApplications] = useState([])
  const [viewingLoanApplicationId, setViewingLoanApplicationId] = useState(null)
  const [viewingCardApplicationId, setViewingCardApplicationId] = useState(null)
  const [pendingLoanAmount, setPendingLoanAmount] = useState(null)
  const [pendingCardAmount, setPendingCardAmount] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // Ignore write failures (private browsing, storage disabled, etc.) —
      // the settings still work for the rest of this session.
    }
  }, [settings])

  const selectedCustomer = useMemo(() => {
    const raw = customers.find((c) => c.id === selectedCustomerId) ?? customers[0]
    return withDerivedFields(raw)
  }, [customers, selectedCustomerId])

  const activeApplications = useMemo(
    () => applications.filter((a) => a.customerId === selectedCustomer.id && a.status === 'active'),
    [applications, selectedCustomer.id],
  )

  // What's actually left to underwrite a NEW application against: monthly
  // capacity (EMI-based) minus what active products already commit, plus
  // the dollar exposure (principal/limit) those same products already hold —
  // tracked per product type (against that product's own cap) and combined
  // (against the master cap).
  const remainingFinancialPower = Math.max(
    Math.floor(selectedCustomer.financialPower - activeApplications.reduce((sum, app) => sum + monthlyCommitment(app), 0)),
    0,
  )
  const existingLoanExposure = exposureByType(applications, selectedCustomer.id, 'loan')
  const existingCardExposure = exposureByType(applications, selectedCustomer.id, 'card')
  const existingTotalExposure = totalExposure(applications, selectedCustomer.id)

  const viewingLoanApplication = applications.find((a) => a.id === viewingLoanApplicationId) ?? null
  const viewingCardApplication = applications.find((a) => a.id === viewingCardApplicationId) ?? null

  function goHome() {
    setPendingLoanAmount(null)
    setPendingCardAmount(null)
    setScreen('home')
  }

  function handleSelectCustomer(id) {
    setSelectedCustomerId(id)
    goHome()
  }

  function handleAddCustomer(fields) {
    const id = nextCustomerId(customers)
    setCustomers((prev) => [...prev, { id, ...fields }])
    setSelectedCustomerId(id)
    goHome()
  }

  function handleGoToLoan(amount) {
    setPendingLoanAmount(amount)
    setScreen('loan')
  }

  function handleGoToCard(amount) {
    setPendingCardAmount(amount)
    setScreen('card')
  }

  function handleApply(type, fields) {
    const application = {
      id: nextApplicationId(applications),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      type,
      status: 'active',
      disbursementDate: todayIsoDate(),
      ...fields,
    }
    setApplications((prev) => [...prev, application])
  }

  function handleUpdateApplicationStatus(id, status) {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status, disbursementDate: status === 'active' ? a.disbursementDate ?? todayIsoDate() : a.disbursementDate }
          : a,
      ),
    )
  }

  function handleViewLoan(app) {
    setViewingLoanApplicationId(app.id)
    setScreen('loan-account')
  }

  function handleViewCard(app) {
    setViewingCardApplicationId(app.id)
    setScreen('card-account')
  }

  function handleCloseApplication(applicationId) {
    setApplications((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status: 'closed' } : a)))
  }

  return (
    <div className="app-shell">
      <header className="app-shell__nav">
        <span className="app-shell__brand">Financial Power</span>
        <div className="app-shell__nav-actions">
          <button
            type="button"
            className="app-shell__lms-btn"
            onClick={() => setPage((p) => (p === 'main' ? 'lms' : 'main'))}
          >
            {page === 'main' ? 'LMS' : '← Back to App'}
          </button>
          <button
            type="button"
            className="app-shell__settings-btn"
            onClick={() => setIsSettingsOpen((v) => !v)}
            aria-label="Loan settings"
          >
            <GearIcon />
          </button>
          {isSettingsOpen && (
            <SettingsPanel
              settings={settings}
              onChange={setSettings}
              onClose={() => setIsSettingsOpen(false)}
            />
          )}
        </div>
      </header>

      <div className="app-shell__content">
        {page === 'lms' ? (
          <LmsPage
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={handleSelectCustomer}
            onAddCustomer={handleAddCustomer}
            applications={applications}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
          />
        ) : (
          <main className="app-shell__workspace">
            <section className="app-shell__panel">
              <WhitelistPage
                customers={customers}
                selectedCustomerId={selectedCustomerId}
                onSelect={handleSelectCustomer}
                onAddCustomer={handleAddCustomer}
              />
            </section>

            <div className="app-shell__preview">
              <PhoneShell>
                {screen === 'home' && (
                  <FinancialPowerHome
                    customer={selectedCustomer}
                    remainingFinancialPower={remainingFinancialPower}
                    existingLoanExposure={existingLoanExposure}
                    existingCardExposure={existingCardExposure}
                    existingTotalExposure={existingTotalExposure}
                    settings={settings}
                    activeApplications={activeApplications}
                    onNavigate={setScreen}
                    onGoToLoan={handleGoToLoan}
                    onGoToCard={handleGoToCard}
                  />
                )}
                {screen === 'active-products' && (
                  <ActiveProducts
                    activeApplications={activeApplications}
                    onBack={goHome}
                    onViewLoan={handleViewLoan}
                    onViewCard={handleViewCard}
                  />
                )}
                {screen === 'breakdown' && (
                  <FinancialPowerBreakdown
                    customer={selectedCustomer}
                    remainingFinancialPower={remainingFinancialPower}
                    existingLoanExposure={existingLoanExposure}
                    existingCardExposure={existingCardExposure}
                    existingTotalExposure={existingTotalExposure}
                    settings={settings}
                    onBack={goHome}
                    onNavigate={setScreen}
                  />
                )}
                {screen === 'loan' && (
                  <LoanApplication
                    customer={selectedCustomer}
                    remainingFinancialPower={remainingFinancialPower}
                    existingLoanExposure={existingLoanExposure}
                    existingTotalExposure={existingTotalExposure}
                    settings={settings}
                    initialAmount={pendingLoanAmount}
                    onBack={goHome}
                    onApply={(fields) => handleApply('loan', fields)}
                  />
                )}
                {screen === 'card' && (
                  <CreditCardApplication
                    customer={selectedCustomer}
                    remainingFinancialPower={remainingFinancialPower}
                    existingCardExposure={existingCardExposure}
                    existingTotalExposure={existingTotalExposure}
                    settings={settings}
                    initialAmount={pendingCardAmount}
                    onBack={goHome}
                    onApply={(fields) => handleApply('card', fields)}
                  />
                )}
                {screen === 'loan-account' && viewingLoanApplication && (
                  <LoanAccount
                    application={viewingLoanApplication}
                    customer={selectedCustomer}
                    onBack={goHome}
                    onPayoff={handleCloseApplication}
                  />
                )}
                {screen === 'card-account' && viewingCardApplication && (
                  <CardAccount
                    application={viewingCardApplication}
                    customer={selectedCustomer}
                    onBack={goHome}
                    onClose={handleCloseApplication}
                  />
                )}
              </PhoneShell>
            </div>
          </main>
        )}
      </div>
    </div>
  )
}

export default App
