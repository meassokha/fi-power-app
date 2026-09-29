import { useMemo, useState } from 'react'
import DashboardPage from './DashboardPage'
import WhitelistPage from './WhitelistPage'
import ApplicationsTable from './ApplicationsTable'
import UserManagementPage from './UserManagementPage'
import ProductConfigurationPage from './ProductConfigurationPage'
import { ChevronDownIcon } from '../components/icons'
import './LmsPage.css'

const MENU = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'whitelist', label: 'Whitelist' },
  {
    key: 'loan-management',
    label: 'Loan Management',
    children: [
      { key: 'loan-applications', label: 'Loan Application' },
      { key: 'card-applications', label: 'Card Application' },
      { key: 'loan-pending', label: 'Loan Pending' },
      { key: 'loan-write-off', label: 'Loan Write-off' },
      { key: 'loan-overdue', label: 'Loan Overdue' },
    ],
  },
  { key: 'users', label: 'User Management' },
  { key: 'products', label: 'Product Configuration' },
]

export default function LmsPage({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onAddCustomer,
  applications,
  onUpdateApplicationStatus,
  users,
  onAddUser,
  onToggleUserStatus,
  settings,
  onChangeSettings,
  products,
  onCreateProduct,
  onUpdateProduct,
}) {
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [expandedMenu, setExpandedMenu] = useState('loan-management')

  const loanApplications = useMemo(() => applications.filter((a) => a.type === 'loan'), [applications])
  const cardApplications = useMemo(() => applications.filter((a) => a.type === 'card'), [applications])

  function isGroupActive(item) {
    return item.children?.some((c) => c.key === activeMenu) ?? false
  }

  function handleSelect(key) {
    setActiveMenu(key)
  }

  function toggleGroup(key) {
    setExpandedMenu((current) => (current === key ? null : key))
  }

  return (
    <div className="lms-page">
      <aside className="lms-page__menu">
        {MENU.map((item) =>
          item.children ? (
            <div key={item.key} className="lms-page__menu-group">
              <button
                type="button"
                className={`lms-page__menu-item lms-page__menu-item--parent ${isGroupActive(item) ? 'is-active' : ''}`}
                onClick={() => toggleGroup(item.key)}
              >
                <span>{item.label}</span>
                <ChevronDownIcon
                  className={`lms-page__menu-chevron ${expandedMenu === item.key ? 'is-open' : ''}`}
                />
              </button>
              {expandedMenu === item.key && (
                <div className="lms-page__submenu">
                  {item.children.map((child) => (
                    <button
                      key={child.key}
                      type="button"
                      className={`lms-page__menu-item lms-page__menu-item--sub ${activeMenu === child.key ? 'is-active' : ''}`}
                      onClick={() => handleSelect(child.key)}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              key={item.key}
              type="button"
              className={`lms-page__menu-item ${activeMenu === item.key ? 'is-active' : ''}`}
              onClick={() => handleSelect(item.key)}
            >
              {item.label}
            </button>
          ),
        )}
      </aside>

      <div className="lms-page__content">
        {activeMenu === 'dashboard' && (
          <DashboardPage customers={customers} applications={applications} products={products} settings={settings} />
        )}
        {activeMenu === 'whitelist' && (
          <WhitelistPage
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelect={onSelectCustomer}
            onAddCustomer={onAddCustomer}
          />
        )}
        {activeMenu === 'loan-applications' && (
          <ApplicationsTable
            applications={loanApplications}
            type="loan"
            title="Loan Applications"
            subtitle="Every consumer loan application, across every status. Search by Loan ID, CIF, Account, or customer name."
            defaultStatus="all"
            onUpdateStatus={onUpdateApplicationStatus}
          />
        )}
        {activeMenu === 'card-applications' && (
          <ApplicationsTable
            applications={cardApplications}
            type="card"
            title="Card Applications"
            subtitle="Every Dream Card application, across every status. Search by Card ID, CIF, Account, or customer name."
            defaultStatus="all"
            onUpdateStatus={onUpdateApplicationStatus}
          />
        )}
        {activeMenu === 'loan-pending' && (
          <ApplicationsTable
            applications={loanApplications}
            type="loan"
            title="Loan Pending"
            subtitle="Loans awaiting approval before they disburse and start counting against Financial Power."
            defaultStatus="pending"
            onUpdateStatus={onUpdateApplicationStatus}
          />
        )}
        {activeMenu === 'loan-write-off' && (
          <ApplicationsTable
            applications={loanApplications}
            type="loan"
            title="Loan Write-off"
            subtitle="Loans written off as bad debt — excluded from a customer's outstanding exposure."
            defaultStatus="written-off"
            onUpdateStatus={onUpdateApplicationStatus}
          />
        )}
        {activeMenu === 'loan-overdue' && (
          <ApplicationsTable
            applications={loanApplications}
            type="loan"
            title="Loan Overdue"
            subtitle="Active loans behind on payment — still counted as outstanding against the customer's caps."
            defaultStatus="overdue"
            onUpdateStatus={onUpdateApplicationStatus}
          />
        )}
        {activeMenu === 'users' && (
          <UserManagementPage users={users} onAddUser={onAddUser} onToggleStatus={onToggleUserStatus} />
        )}
        {activeMenu === 'products' && (
          <ProductConfigurationPage
            settings={settings}
            onChangeSettings={onChangeSettings}
            products={products}
            onCreateProduct={onCreateProduct}
            onUpdateProduct={onUpdateProduct}
          />
        )}
      </div>
    </div>
  )
}
