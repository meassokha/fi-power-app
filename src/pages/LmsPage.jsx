import { useState } from 'react'
import WhitelistPage from './WhitelistPage'
import ApplicationsPanel from './ApplicationsPanel'
import UserManagementPage from './UserManagementPage'
import ProductConfigurationPage from './ProductConfigurationPage'
import './LmsPage.css'

const MENU = [
  { key: 'whitelist', label: 'Whitelist' },
  { key: 'applications', label: 'Loan / Card Application' },
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
  customProducts,
  onCreateProduct,
}) {
  const [activeMenu, setActiveMenu] = useState('applications')

  return (
    <div className="lms-page">
      <aside className="lms-page__menu">
        {MENU.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`lms-page__menu-item ${activeMenu === item.key ? 'is-active' : ''}`}
            onClick={() => setActiveMenu(item.key)}
          >
            {item.label}
          </button>
        ))}
      </aside>

      <div className="lms-page__content">
        {activeMenu === 'whitelist' && (
          <WhitelistPage
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelect={onSelectCustomer}
            onAddCustomer={onAddCustomer}
          />
        )}
        {activeMenu === 'applications' && (
          <ApplicationsPanel applications={applications} onUpdateStatus={onUpdateApplicationStatus} />
        )}
        {activeMenu === 'users' && (
          <UserManagementPage users={users} onAddUser={onAddUser} onToggleStatus={onToggleUserStatus} />
        )}
        {activeMenu === 'products' && (
          <ProductConfigurationPage
            settings={settings}
            onChangeSettings={onChangeSettings}
            customProducts={customProducts}
            onCreateProduct={onCreateProduct}
          />
        )}
      </div>
    </div>
  )
}
