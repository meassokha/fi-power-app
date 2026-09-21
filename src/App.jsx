import { useEffect, useMemo, useState } from 'react'
import './App.css'
import './styles/shared.css'
import WhitelistPage from './pages/WhitelistPage'
import LmsPage from './pages/LmsPage'
import DemoPage from './pages/DemoPage'
import PhoneShell from './components/PhoneShell'
import SettingsPanel from './components/SettingsPanel'
import CustomerJourney from './components/CustomerJourney'
import { GearIcon } from './components/icons'
import { defaultSelectedCustomerId, initialCustomers } from './data/customers'
import { initialUsers } from './data/users'
import { nextCustomerId } from './utils/customerRules'
import { nextUserId } from './utils/users'
import { DEFAULT_SETTINGS } from './utils/settings'
import { nextApplicationId } from './utils/applications'
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
  const [settings, setSettings] = useState(loadStoredSettings)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [applications, setApplications] = useState([])
  const [users, setUsers] = useState(initialUsers)
  const [customProducts, setCustomProducts] = useState([])

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // Ignore write failures (private browsing, storage disabled, etc.) —
      // the settings still work for the rest of this session.
    }
  }, [settings])

  const selectedCustomerRaw = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) ?? customers[0],
    [customers, selectedCustomerId],
  )

  function handleSelectCustomer(id) {
    setSelectedCustomerId(id)
  }

  function handleAddCustomer(fields) {
    const id = nextCustomerId(customers)
    setCustomers((prev) => [...prev, { id, ...fields, uploadDate: todayIsoDate() }])
    setSelectedCustomerId(id)
  }

  function handleCreateDemoCustomer(fields) {
    const id = nextCustomerId(customers)
    const customer = { id, ...fields, uploadDate: todayIsoDate() }
    setCustomers((prev) => [...prev, customer])
    return customer
  }

  function handleApply(customerId, customerName, type, fields) {
    const application = {
      id: nextApplicationId(applications),
      customerId,
      customerName,
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

  function handleCloseApplication(applicationId) {
    setApplications((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status: 'closed' } : a)))
  }

  function handleAddUser(fields) {
    const id = nextUserId(users)
    setUsers((prev) => [...prev, { id, ...fields, status: 'active' }])
  }

  function handleToggleUserStatus(id) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u)),
    )
  }

  function handleCreateProduct(product) {
    setCustomProducts((prev) => [...prev, product])
  }

  return (
    <div className="app-shell">
      <header className="app-shell__nav">
        <span className="app-shell__brand">Financial Power</span>
        <div className="app-shell__nav-actions">
          <button
            type="button"
            className={`app-shell__nav-tab ${page === 'lms' ? 'is-active' : ''}`}
            onClick={() => setPage((p) => (p === 'lms' ? 'main' : 'lms'))}
          >
            LMS
          </button>
          <button
            type="button"
            className={`app-shell__nav-tab ${page === 'demo' ? 'is-active' : ''}`}
            onClick={() => setPage((p) => (p === 'demo' ? 'main' : 'demo'))}
          >
            {page === 'demo' ? 'HOME' : 'DEMO'}
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
        {page === 'lms' && (
          <LmsPage
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={handleSelectCustomer}
            onAddCustomer={handleAddCustomer}
            applications={applications}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
            users={users}
            onAddUser={handleAddUser}
            onToggleUserStatus={handleToggleUserStatus}
            settings={settings}
            onChangeSettings={setSettings}
            customProducts={customProducts}
            onCreateProduct={handleCreateProduct}
          />
        )}

        {page === 'demo' && (
          <DemoPage
            applications={applications}
            settings={settings}
            onCreateDemoCustomer={handleCreateDemoCustomer}
            onApply={handleApply}
            onCloseApplication={handleCloseApplication}
          />
        )}

        {page === 'main' && (
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
                <CustomerJourney
                  key={selectedCustomerRaw.id}
                  customerRaw={selectedCustomerRaw}
                  applications={applications}
                  settings={settings}
                  onApply={(type, fields) => handleApply(selectedCustomerRaw.id, selectedCustomerRaw.name, type, fields)}
                  onCloseApplication={handleCloseApplication}
                />
              </PhoneShell>
            </div>
          </main>
        )}
      </div>
    </div>
  )
}

export default App
