import { useState } from 'react'
import { PlusIcon } from '../components/icons'
import { SOURCE_OF_INCOME_OPTIONS } from '../data/customers'
import { withDerivedFields } from '../utils/customerRules'
import './WhitelistPage.css'

function dscrPillClass(minDscr) {
  return minDscr <= 2.5 ? 'pill-success' : 'pill-primary'
}

const emptyForm = {
  name: '',
  monthlyIncome: '',
  obligationWingBank: '',
  obligationOtherBanks: '',
  sourceOfIncome: SOURCE_OF_INCOME_OPTIONS[0],
}

const COLUMNS =
  '100px minmax(140px, 1.4fr) 65px minmax(150px, 1.2fr) 140px 140px 150px 90px 80px 105px 105px'

export default function WhitelistPage({ customers, selectedCustomerId, onSelect, onAddCustomer }) {
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const previewIncome = Number(form.monthlyIncome) || 0
  const previewWb = Number(form.obligationWingBank) || 0
  const previewOther = Number(form.obligationOtherBanks) || 0
  const preview = withDerivedFields({
    monthlyIncome: previewIncome,
    obligationWingBank: previewWb,
    obligationOtherBanks: previewOther,
  })

  const canSubmit = form.name.trim().length > 0 && previewIncome > 0

  function updateField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    onAddCustomer({
      name: form.name.trim(),
      monthlyIncome: previewIncome,
      obligationWingBank: previewWb,
      obligationOtherBanks: previewOther,
      sourceOfIncome: form.sourceOfIncome,
    })
    setForm(emptyForm)
    setIsAdding(false)
  }

  function handleCancel() {
    setForm(emptyForm)
    setIsAdding(false)
  }

  return (
    <div className="whitelist">
      <div className="whitelist__intro">
        <div className="whitelist__eyebrow">
          <span className="whitelist__dot" />
          <span>Admin &middot; Backend Data Source</span>
        </div>
        <h1 className="whitelist__title">Customer Whitelist</h1>
        <p className="whitelist__subtitle">
          Click a customer to load their numbers into the Financial Power preview. Min DSCR and
          interest rate are generated automatically from monthly income.
        </p>
      </div>

      <div className="whitelist__legend">
        <span className="whitelist__legend-title">Min DSCR key:</span>
        <span className="whitelist__legend-item">
          <span className="whitelist__legend-dot pill-success-dot" />
          2.5x &mdash; Salary Premium
        </span>
        <span className="whitelist__legend-item">
          <span className="whitelist__legend-dot pill-primary-dot" />
          2.8x &mdash; Mass / Upper Mass
        </span>
      </div>

      <div className="whitelist__table-wrap">
        <div className="whitelist__table" role="table">
          <div className="data-row data-row--head" role="row" style={{ gridTemplateColumns: COLUMNS }}>
            <span role="columnheader">Customer ID</span>
            <span role="columnheader">Customer Name</span>
            <span role="columnheader" className="num-col">Income</span>
            <span role="columnheader">Source of Income</span>
            <span role="columnheader" className="num-col">Obligation &middot; Wing Bank</span>
            <span role="columnheader" className="num-col">Obligation &middot; Other Banks</span>
            <span role="columnheader" className="num-col">Total Monthly Installment</span>
            <span role="columnheader" className="center-col">Min DSCR</span>
            <span role="columnheader" className="num-col">Rate</span>
            <span role="columnheader">Upload Date</span>
            <span role="columnheader">Expiry Date</span>
          </div>

          <div role="rowgroup">
            {customers.map((raw) => {
              const customer = withDerivedFields(raw)
              const isSelected = customer.id === selectedCustomerId
              return (
                <div
                  key={customer.id}
                  role="row"
                  tabIndex={0}
                  className={`data-row data-row--body whitelist__row ${isSelected ? 'is-selected' : ''}`}
                  style={{ gridTemplateColumns: COLUMNS }}
                  onClick={() => onSelect(customer.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(customer.id)}
                >
                  <span role="cell" className="num">{customer.id}</span>
                  <span role="cell" className="whitelist__name-cell">
                    {customer.name}
                    {isSelected && <span className="whitelist__shown-badge">viewing &rarr;</span>}
                  </span>
                  <span role="cell" className="num num-col">${customer.monthlyIncome.toLocaleString()}</span>
                  <span role="cell" className="whitelist__segment-cell">{customer.sourceOfIncome}</span>
                  <span role="cell" className="num num-col whitelist__muted">
                    ${customer.obligationWingBank.toLocaleString()}
                  </span>
                  <span role="cell" className="num num-col whitelist__muted">
                    ${customer.obligationOtherBanks.toLocaleString()}
                  </span>
                  <span role="cell" className="num num-col whitelist__strong">
                    ${customer.totalObligation.toLocaleString()}
                  </span>
                  <span role="cell" className="center-col">
                    <span className={`pill num ${dscrPillClass(customer.minDscr)}`}>
                      {customer.minDscr.toFixed(1)}x
                    </span>
                  </span>
                  <span role="cell" className="num num-col">{(customer.interestRate * 100).toFixed(0)}%</span>
                  <span role="cell" className="num">{customer.uploadDate}</span>
                  <span role="cell" className="num">{customer.expiryDate}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {isAdding ? (
        <form className="admin-add-form" onSubmit={handleSubmit}>
          <div className="admin-add-grid">
            <label className="admin-field">
              <span>Customer name</span>
              <input
                type="text"
                value={form.name}
                onChange={updateField('name')}
                placeholder="e.g. Vann Bopha"
                autoFocus
              />
            </label>
            <label className="admin-field">
              <span>Monthly income ($)</span>
              <input
                type="number"
                min="0"
                value={form.monthlyIncome}
                onChange={updateField('monthlyIncome')}
                placeholder="e.g. 1000"
              />
            </label>
            <label className="admin-field">
              <span>Obligation &middot; Wing Bank ($)</span>
              <input
                type="number"
                min="0"
                value={form.obligationWingBank}
                onChange={updateField('obligationWingBank')}
                placeholder="0"
              />
            </label>
            <label className="admin-field">
              <span>Obligation &middot; Other Banks ($)</span>
              <input
                type="number"
                min="0"
                value={form.obligationOtherBanks}
                onChange={updateField('obligationOtherBanks')}
                placeholder="0"
              />
            </label>
            <label className="admin-field">
              <span>Source of income</span>
              <select value={form.sourceOfIncome} onChange={updateField('sourceOfIncome')}>
                {SOURCE_OF_INCOME_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="whitelist__add-preview">
            <span className="whitelist__add-preview-label">Auto-generated:</span>
            <span className={`pill num ${dscrPillClass(preview.minDscr)}`}>
              Min DSCR {preview.minDscr.toFixed(1)}x
            </span>
            <span className="pill pill-primary num">
              Rate {(preview.interestRate * 100).toFixed(0)}%
            </span>
            <span className="whitelist__add-preview-total">
              Total obligation <strong className="num">${preview.totalObligation.toLocaleString()}</strong>
            </span>
          </div>

          <div className="admin-add-actions">
            <button type="button" className="admin-cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="admin-submit-btn" disabled={!canSubmit}>
              Add Customer
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className="admin-add-trigger" onClick={() => setIsAdding(true)}>
          <PlusIcon />
          <span>Add new customer</span>
        </button>
      )}
    </div>
  )
}
