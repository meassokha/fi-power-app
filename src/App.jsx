import { useMemo, useState } from 'react'
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
import { defaultSelectedCustomerId, initialCustomers } from './data/customers'
import { nextCustomerId, withDerivedFields } from './utils/customerRules'
import { DEFAULT_LOAN_SETTINGS } from './utils/loanCalculations'
import { nextApplicationId } from './utils/applications'
import { todayIsoDate } from './utils/dates'

function App() {
  const [page, setPage] = useState('main')
  const [customers, setCustomers] = useState(initialCustomers)
  const [selectedCustomerId, setSelectedCustomerId] = useState(defaultSelectedCustomerId)
  const [screen, setScreen] = useState('home')
  const [loanSettings, setLoanSettings] = useState(DEFAULT_LOAN_SETTINGS)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [applications, setApplications] = useState([])
  const [viewingLoanApplicationId, setViewingLoanApplicationId] = useState(null)

  const selectedCustomer = useMemo(() => {
    const raw = customers.find((c) => c.id === selectedCustomerId) ?? customers[0]
    return withDerivedFields(raw)
  }, [customers, selectedCustomerId])

  const activeApplications = useMemo(
    () => applications.filter((a) => a.customerId === selectedCustomer.id && a.status === 'active'),
    [applications, selectedCustomer.id],
  )

  const viewingLoanApplication = applications.find((a) => a.id === viewingLoanApplicationId) ?? null

  function handleSelectCustomer(id) {
    setSelectedCustomerId(id)
    setScreen('home')
  }

  function handleAddCustomer(fields) {
    const id = nextCustomerId(customers)
    setCustomers((prev) => [...prev, { id, ...fields }])
    setSelectedCustomerId(id)
    setScreen('home')
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

  function handlePayoffLoan(applicationId) {
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
              settings={loanSettings}
              onChange={setLoanSettings}
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
                    activeApplications={activeApplications}
                    onNavigate={setScreen}
                    onViewLoan={handleViewLoan}
                  />
                )}
                {screen === 'breakdown' && (
                  <FinancialPowerBreakdown
                    customer={selectedCustomer}
                    onBack={() => setScreen('home')}
                    onNavigate={setScreen}
                  />
                )}
                {screen === 'loan' && (
                  <LoanApplication
                    customer={selectedCustomer}
                    settings={loanSettings}
                    onBack={() => setScreen('home')}
                    onApply={(fields) => handleApply('loan', fields)}
                  />
                )}
                {screen === 'card' && (
                  <CreditCardApplication
                    customer={selectedCustomer}
                    onBack={() => setScreen('home')}
                    onApply={(fields) => handleApply('card', fields)}
                  />
                )}
                {screen === 'loan-account' && viewingLoanApplication && (
                  <LoanAccount
                    application={viewingLoanApplication}
                    customer={selectedCustomer}
                    onBack={() => setScreen('home')}
                    onPayoff={handlePayoffLoan}
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
