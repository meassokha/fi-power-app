import { useState } from 'react'
import WhitelistPage from './WhitelistPage'
import ApplicationsPanel from './ApplicationsPanel'
import './LmsPage.css'

const MENU = [
  { key: 'whitelist', label: 'Whitelist' },
  { key: 'applications', label: 'Loan / Card Application' },
]

export default function LmsPage({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onAddCustomer,
  applications,
  onUpdateApplicationStatus,
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
        {activeMenu === 'whitelist' ? (
          <WhitelistPage
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelect={onSelectCustomer}
            onAddCustomer={onAddCustomer}
          />
        ) : (
          <ApplicationsPanel applications={applications} onUpdateStatus={onUpdateApplicationStatus} />
        )}
      </div>
    </div>
  )
}
