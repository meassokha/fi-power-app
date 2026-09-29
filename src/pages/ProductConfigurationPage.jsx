import { useState } from 'react'
import { PlusIcon } from '../components/icons'
import './ProductConfigurationPage.css'

// The two real products the customer app actually offers. Their editable
// parameters live in the shared `settings` object (the same one the gear
// icon edits) because that's what LoanApplication/CreditCardApplication and
// the Home screen tiles read from.
const BUILT_IN_PRODUCTS = [
  {
    id: 'consumer-loan',
    name: 'Consumer Loan',
    category: 'Loan',
    description: 'DSCR-based installment loan sized from a customer’s remaining Financial Power.',
    activeKey: 'loanActive',
    fields: [
      { key: 'maxLoanLimit', label: 'Max loan limit', type: 'amount', hint: 'Per-loan cap, before the master limit' },
      { key: 'ppiRate', label: 'PPI premium rate', type: 'percent', step: 0.01, hint: 'Monthly, applied to declining balance' },
      { key: 'processingFeeWithPpi', label: 'Processing fee — with PPI', type: 'percent' },
      { key: 'processingFeeWithoutPpi', label: 'Processing fee — without PPI', type: 'percent' },
    ],
  },
  {
    id: 'dream-card',
    name: 'Dream Card',
    category: 'Credit Card',
    description: 'Revolving credit limit sized from a customer’s remaining Financial Power.',
    activeKey: 'cardActive',
    fields: [
      { key: 'maxCardLimit', label: 'Max card limit', type: 'amount', hint: 'Per-card cap, before the master limit' },
      { key: 'cardInterestRate', label: 'Interest rate', type: 'percent', step: 1, hint: 'Annual percentage rate' },
      { key: 'cardAnnualFee', label: 'Annual fee', type: 'amount', hint: '$0 shows to customers as “No annual fee”' },
    ],
  },
]

// Mirrors CustomerJourney's SOURCE_TO_PRODUCT_ID routing, just for the
// explanatory note below — kept here rather than imported so this page
// doesn't need to know about the customer-journey component at all.
const ROUTING_NOTES = {
  'non-wing-payroll': 'Shown automatically to customers the backend verifies through Valida (not a Wing Bank payroll customer) — see the Demo page.',
  'wing-bank-merchant': 'Shown automatically to customers whose source of income is Wing Bank Merchant — see the Demo page.',
  'other-bank-merchant': 'Shown automatically to customers whose source of income is Other Bank Merchant — see the Demo page.',
}

const CATEGORY_OPTIONS = ['Loan', 'Credit Card']

const emptyForm = {
  name: '',
  category: CATEGORY_OPTIONS[0],
  description: '',
  maxLimit: '',
  interestRate: '',
  ppiRate: '',
  processingFeeWithPpi: '',
  processingFeeWithoutPpi: '',
  annualFee: '',
}

// Field set for admin-managed products (the built-in "Non-Wing Payroll" plus
// anything created here) — same shape for every one of them, per category.
function managedFieldsFor(category) {
  return category === 'Loan'
    ? [
        { key: 'maxLimit', label: 'Max loan limit', type: 'amount' },
        { key: 'interestRate', label: 'Interest rate', type: 'percent', step: 1, hint: 'Annual percentage rate' },
        { key: 'ppiRate', label: 'PPI premium rate', type: 'percent', step: 0.01, hint: 'Monthly, applied to declining balance' },
        { key: 'processingFeeWithPpi', label: 'Processing fee — with PPI', type: 'percent' },
        { key: 'processingFeeWithoutPpi', label: 'Processing fee — without PPI', type: 'percent' },
      ]
    : [
        { key: 'maxLimit', label: 'Max card limit', type: 'amount' },
        { key: 'interestRate', label: 'Interest rate', type: 'percent', step: 1, hint: 'Annual percentage rate' },
        { key: 'annualFee', label: 'Annual fee', type: 'amount', hint: '$0 shows to customers as “No annual fee”' },
      ]
}

function FieldInput({ field, value, onChange }) {
  return (
    <label className="admin-field product-config__field">
      <span>{field.label}</span>
      <div className="product-config__field-input">
        {field.type === 'amount' && <span>$</span>}
        <input
          type="number"
          min="0"
          step={field.type === 'amount' ? 100 : field.step ?? 0.1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
        {field.type === 'percent' && <span>%</span>}
      </div>
      {field.hint && <span className="product-config__field-hint">{field.hint}</span>}
    </label>
  )
}

function ToggleSwitch({ active, onToggle }) {
  return (
    <button
      type="button"
      className={`product-config__toggle ${active ? 'is-on' : ''}`}
      onClick={onToggle}
      aria-pressed={active}
    >
      <span className="product-config__toggle-knob" />
    </button>
  )
}

export default function ProductConfigurationPage({ settings, onChangeSettings, products, onCreateProduct, onUpdateProduct }) {
  const [selectedId, setSelectedId] = useState(BUILT_IN_PRODUCTS[0].id)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const settingsProducts = BUILT_IN_PRODUCTS.map((p) => ({
    ...p,
    isCustom: false,
    isManaged: false,
    isActive: settings[p.activeKey],
  }))
  const managedProducts = products.map((p) => ({
    ...p,
    isCustom: !p.isBuiltIn,
    isManaged: true,
    isActive: p.active,
  }))
  const allProducts = [...settingsProducts, ...managedProducts]
  const selected = allProducts.find((p) => p.id === selectedId) ?? null
  const canSubmit = form.name.trim().length > 0

  function updateField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleSelect(id) {
    setSelectedId(id)
    setIsCreating(false)
  }

  function handleOpenCreate() {
    setIsCreating(true)
    setSelectedId(null)
  }

  function handleCreateSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    const product = {
      id: `custom-${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim() || 'Custom credit product.',
      maxLimit: Number(form.maxLimit) || 0,
      interestRate: (Number(form.interestRate) || 0) / 100,
      ppiRate: form.category === 'Loan' ? (Number(form.ppiRate) || 0) / 100 : 0,
      processingFeeWithPpi: form.category === 'Loan' ? (Number(form.processingFeeWithPpi) || 0) / 100 : 0,
      processingFeeWithoutPpi: form.category === 'Loan' ? (Number(form.processingFeeWithoutPpi) || 0) / 100 : 0,
      annualFee: form.category === 'Credit Card' ? Number(form.annualFee) || 0 : 0,
      active: true,
      isBuiltIn: false,
    }
    onCreateProduct(product)
    setForm(emptyForm)
    setIsCreating(false)
    setSelectedId(product.id)
  }

  function handleCreateCancel() {
    setForm(emptyForm)
    setIsCreating(false)
    setSelectedId(BUILT_IN_PRODUCTS[0].id)
  }

  function handleToggleActive() {
    if (!selected) return
    if (selected.isManaged) {
      onUpdateProduct(selected.id, { active: !selected.active })
    } else {
      onChangeSettings({ ...settings, [selected.activeKey]: !settings[selected.activeKey] })
    }
  }

  function getFieldRawValue(field) {
    return selected.isManaged ? selected[field.key] : settings[field.key]
  }

  function handleFieldChange(field, rawValue) {
    const value = field.type === 'percent' ? rawValue / 100 : rawValue
    if (selected.isManaged) {
      onUpdateProduct(selected.id, { [field.key]: value })
    } else {
      onChangeSettings({ ...settings, [field.key]: value })
    }
  }

  const selectedFields = selected ? (selected.isManaged ? managedFieldsFor(selected.category) : selected.fields) : []

  return (
    <div className="product-config">
      <div className="product-config__intro">
        <h1 className="product-config__title">Product Configuration</h1>
        <p className="product-config__subtitle">
          Select a credit product to adjust its parameters or turn it on/off, or create a new one.
        </p>
      </div>

      <div className="product-config__layout">
        <div className="product-config__list">
          {allProducts.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`product-config__list-item ${p.id === selectedId ? 'is-active' : ''}`}
              onClick={() => handleSelect(p.id)}
            >
              <div className="product-config__list-item-head">
                <span className="product-config__list-item-name">{p.name}</span>
                <div className="product-config__list-item-pills">
                  <span className={`pill ${p.isCustom ? 'pill-warning' : 'pill-primary'}`}>
                    {p.isCustom ? 'Custom' : 'Built-in'}
                  </span>
                  <span className={`pill ${p.isActive ? 'pill-success' : 'pill-neutral'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <span className="product-config__list-item-category">{p.category}</span>
            </button>
          ))}

          <button type="button" className="admin-add-trigger" onClick={handleOpenCreate}>
            <PlusIcon />
            <span>Create new credit product</span>
          </button>
        </div>

        <div className="product-config__detail">
          {isCreating ? (
            <form className="admin-add-form" onSubmit={handleCreateSubmit}>
              <div className="admin-add-grid">
                <label className="admin-field">
                  <span>Product name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={updateField('name')}
                    placeholder="e.g. Study Now Loan"
                    autoFocus
                  />
                </label>
                <label className="admin-field">
                  <span>Category</span>
                  <select value={form.category} onChange={updateField('category')}>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">
                  <span>{form.category === 'Loan' ? 'Max loan limit ($)' : 'Max card limit ($)'}</span>
                  <input
                    type="number"
                    min="0"
                    value={form.maxLimit}
                    onChange={updateField('maxLimit')}
                    placeholder="e.g. 5000"
                  />
                </label>
                <label className="admin-field">
                  <span>Interest rate (% p.a.)</span>
                  <input
                    type="number"
                    min="0"
                    value={form.interestRate}
                    onChange={updateField('interestRate')}
                    placeholder="e.g. 18"
                  />
                </label>
                {form.category === 'Loan' ? (
                  <>
                    <label className="admin-field">
                      <span>PPI premium rate (%/mo)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.ppiRate}
                        onChange={updateField('ppiRate')}
                        placeholder="e.g. 0.2"
                      />
                    </label>
                    <label className="admin-field">
                      <span>Processing fee — with PPI (%)</span>
                      <input
                        type="number"
                        min="0"
                        value={form.processingFeeWithPpi}
                        onChange={updateField('processingFeeWithPpi')}
                        placeholder="e.g. 3"
                      />
                    </label>
                    <label className="admin-field">
                      <span>Processing fee — without PPI (%)</span>
                      <input
                        type="number"
                        min="0"
                        value={form.processingFeeWithoutPpi}
                        onChange={updateField('processingFeeWithoutPpi')}
                        placeholder="e.g. 6"
                      />
                    </label>
                  </>
                ) : (
                  <label className="admin-field">
                    <span>Annual fee ($)</span>
                    <input
                      type="number"
                      min="0"
                      value={form.annualFee}
                      onChange={updateField('annualFee')}
                      placeholder="e.g. 0"
                    />
                  </label>
                )}
                <label className="admin-field product-config__field-wide">
                  <span>Description</span>
                  <input
                    type="text"
                    value={form.description}
                    onChange={updateField('description')}
                    placeholder="Short description shown in the product list"
                  />
                </label>
              </div>
              <div className="admin-add-actions">
                <button type="button" className="admin-cancel-btn" onClick={handleCreateCancel}>
                  Cancel
                </button>
                <button type="submit" className="admin-submit-btn" disabled={!canSubmit}>
                  Create Product
                </button>
              </div>
            </form>
          ) : selected ? (
            <div className="product-config__panel">
              <div className="product-config__panel-head">
                <div>
                  <h2 className="product-config__panel-title">{selected.name}</h2>
                  <p className="product-config__panel-desc">{selected.description}</p>
                </div>
                <span className={`pill ${selected.isCustom ? 'pill-warning' : 'pill-primary'}`}>
                  {selected.isCustom ? 'Custom' : 'Built-in'}
                </span>
              </div>

              <div className="product-config__status-row">
                <span className={selected.isActive ? 'product-config__status-on' : 'product-config__status-off'}>
                  {selected.isActive ? 'Active — offered to customers' : 'Inactive — hidden from customers'}
                </span>
                <ToggleSwitch active={selected.isActive} onToggle={handleToggleActive} />
              </div>

              <div className="product-config__fields">
                {selectedFields.map((field) => (
                  <FieldInput
                    key={field.key}
                    field={field}
                    value={
                      field.type === 'percent' ? getFieldRawValue(field) * 100 : getFieldRawValue(field)
                    }
                    onChange={(v) => handleFieldChange(field, v)}
                  />
                ))}
              </div>

              {selected.isManaged ? (
                <p className="product-config__note">
                  {ROUTING_NOTES[selected.id] ??
                    'This product is a configuration record — it is not yet wired into the live customer app (Home screen, application flow).'}
                </p>
              ) : (
                <p className="product-config__note">
                  Shared across all products: master capped limit is $
                  {settings.masterCappedLimit.toLocaleString()} (edit via the settings icon in the
                  header).
                </p>
              )}
            </div>
          ) : (
            <div className="product-config__empty">Select a product to view its parameters.</div>
          )}
        </div>
      </div>
    </div>
  )
}
