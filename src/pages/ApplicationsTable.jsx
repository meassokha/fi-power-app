import { useMemo, useState } from 'react'
import { APPLICATION_STATUSES } from '../utils/applications'
import './ApplicationsTable.css'

const STATUS_LABELS = {
  pending: 'Pending',
  active: 'Active',
  overdue: 'Overdue',
  'written-off': 'Written Off',
  closed: 'Closed',
}

const LOAN_COLUMNS = '110px 130px 100px minmax(130px, 1.3fr) 110px 90px 130px 120px 130px'
const CARD_COLUMNS = '110px 130px 100px minmax(130px, 1.3fr) 110px 130px 130px'

function matchesSearch(app, query) {
  if (!query) return true
  const q = query.trim().toLowerCase()
  return (
    app.id.toLowerCase().includes(q) ||
    app.accountNumber.toLowerCase().includes(q) ||
    app.customerId.toLowerCase().includes(q) ||
    app.customerName.toLowerCase().includes(q)
  )
}

export default function ApplicationsTable({
  applications,
  type,
  title,
  subtitle,
  defaultStatus = 'all',
  onUpdateStatus,
}) {
  const [statusFilter, setStatusFilter] = useState(defaultStatus)
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () =>
      applications
        .filter((a) => (statusFilter === 'all' ? true : a.status === statusFilter))
        .filter((a) => matchesSearch(a, search)),
    [applications, statusFilter, search],
  )

  const columns = type === 'loan' ? LOAN_COLUMNS : CARD_COLUMNS

  return (
    <div className="app-table">
      <div className="app-table__intro">
        <h2 className="app-table__title">{title}</h2>
        <p className="app-table__subtitle">{subtitle}</p>
      </div>

      <div className="app-table__toolbar">
        <input
          type="search"
          className="app-table__search"
          placeholder={`Search by ${type === 'loan' ? 'Loan' : 'Card'} ID, CIF, Account, or Customer name`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="app-table__status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="app-table__empty">
          {applications.length === 0
            ? 'No applications yet — apply from the mobile preview to see one here.'
            : 'No applications match this filter or search.'}
        </p>
      ) : (
        <div className="app-table__wrap">
          <div className="app-table__table" role="table">
            <div className="data-row data-row--head" role="row" style={{ gridTemplateColumns: columns }}>
              <span role="columnheader">{type === 'loan' ? 'Loan ID' : 'Card ID'}</span>
              <span role="columnheader">Account</span>
              <span role="columnheader">CIF</span>
              <span role="columnheader">Customer Name</span>
              <span role="columnheader" className="num-col">{type === 'loan' ? 'Amount' : 'Limit'}</span>
              {type === 'loan' && <span role="columnheader" className="center-col">Tenor</span>}
              {type === 'loan' && <span role="columnheader" className="num-col">Monthly Installment</span>}
              <span role="columnheader" className="center-col">Status</span>
              <span role="columnheader">Disbursement Date</span>
            </div>

            <div role="rowgroup">
              {filtered.map((app) => (
                <div key={app.id} role="row" className="data-row data-row--body" style={{ gridTemplateColumns: columns }}>
                  <span role="cell" className="num">{app.id}</span>
                  <span role="cell" className="num">{app.accountNumber}</span>
                  <span role="cell" className="num">{app.customerId}</span>
                  <span role="cell">{app.customerName}</span>
                  <span role="cell" className="num num-col">${app.amount.toLocaleString()}</span>
                  {type === 'loan' && <span role="cell" className="num center-col">{app.tenor} mo</span>}
                  {type === 'loan' && (
                    <span role="cell" className="num num-col">${app.monthlyInstallment.toFixed(2)}</span>
                  )}
                  <span role="cell" className="center-col" onClick={(e) => e.stopPropagation()}>
                    <select
                      className={`app-table__status app-table__status--${app.status}`}
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                    >
                      {APPLICATION_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </span>
                  <span role="cell" className="num">{app.disbursementDate ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
