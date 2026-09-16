import './ApplicationsPanel.css'

const STATUS_OPTIONS = ['pending', 'active', 'closed']
const COLUMNS = '100px minmax(130px, 1.3fr) 76px minmax(90px, 1fr) 90px 120px 110px 130px'
const CARD_MIN_PAYMENT_LABEL = '10%'

function typeLabel(type) {
  return type === 'loan' ? 'Loan' : 'Card'
}

export default function ApplicationsPanel({
  applications,
  onUpdateStatus,
  selectedApplicationId,
  onSelectApplication,
}) {
  const selectable = typeof onSelectApplication === 'function'

  return (
    <div className="applications">
      <div className="applications__intro">
        <h2 className="applications__title">Loan &amp; Card Applications</h2>
        <p className="applications__subtitle">
          Created and set Active automatically when a customer applies from the mobile preview.
          Change status here to manage its lifecycle, e.g. mark Closed once paid off.
        </p>
      </div>

      {applications.length === 0 ? (
        <p className="applications__empty">
          No applications yet &mdash; apply for a loan or card from the mobile preview to see it
          here.
        </p>
      ) : (
        <div className="applications__table-wrap">
          <div className="applications__table" role="table">
            <div className="data-row data-row--head" role="row" style={{ gridTemplateColumns: COLUMNS }}>
              <span role="columnheader">Customer ID</span>
              <span role="columnheader">Customer Name</span>
              <span role="columnheader" className="center-col">Type</span>
              <span role="columnheader" className="num-col">Amount / Limit</span>
              <span role="columnheader" className="center-col">Tenor</span>
              <span role="columnheader" className="num-col">Monthly Installment</span>
              <span role="columnheader" className="center-col">Status</span>
              <span role="columnheader">Disbursement Date</span>
            </div>

            <div role="rowgroup">
              {applications.map((app) => (
                <div
                  key={app.id}
                  role="row"
                  className={`data-row data-row--body ${selectable ? 'applications__row' : ''} ${
                    selectable && app.id === selectedApplicationId ? 'is-selected' : ''
                  }`}
                  style={{ gridTemplateColumns: COLUMNS }}
                  onClick={selectable ? () => onSelectApplication(app.id) : undefined}
                >
                  <span role="cell" className="num">{app.customerId}</span>
                  <span role="cell">{app.customerName}</span>
                  <span role="cell" className="center-col">
                    <span className={`pill ${app.type === 'loan' ? 'pill-primary' : 'pill-success'}`}>
                      {typeLabel(app.type)}
                    </span>
                  </span>
                  <span role="cell" className="num num-col">${app.amount.toLocaleString()}</span>
                  <span role="cell" className="num center-col">
                    {app.type === 'loan' ? `${app.tenor} mo` : 'Revolving'}
                  </span>
                  <span role="cell" className="num num-col">
                    {app.type === 'loan' ? `$${app.monthlyInstallment.toFixed(2)}` : CARD_MIN_PAYMENT_LABEL}
                  </span>
                  <span role="cell" className="center-col" onClick={(e) => e.stopPropagation()}>
                    <select
                      className={`applications__status applications__status--${app.status}`}
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status[0].toUpperCase() + status.slice(1)}
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
