import { useState } from 'react'
import { PlusIcon } from '../components/icons'
import './ProductConfigurationPage.css'

const BUILT_IN_PRODUCTS = [
  {
    id: 'consumer-loan',
    name: 'Unsecured Consumer Loan',
    category: 'Loan',
    description: 'DSCR-based installment loan sized from a customer’s remaining Financial Power.',
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
    fields: [
      { key: 'maxCardLimit', label: 'Max card limit', type: 'amount', hint: 'Per-card cap, before the master limit' },
      { key: 'cardInterestRate', label: 'Interest rate', type: 'percent', step: 1, hint: 'Annual percentage rate' },
    ],
  },
]

const CATEGORY_OPTIONS = ['Loan', 'Credit Card']

const emptyForm = { name: '', category: CATEGORY_OPTIONS[0], description: '', maxLimit: '', interestRate: '' }

function FieldInput({ field, value, onChange }) {
  return (
    <label className="admin-field product-config__field">
      <span>{field.label}</span>
      {field.hint && <span className="product-config__field-hint">{field.hint}</span>}
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
    </label>
  )
}

export default function ProductConfigurationPage({ settings, onChangeSettings, customProducts, onCreateProduct }) {
  const [selectedId, setSelectedId] = useState(BUILT_IN_PRODUCTS[0].id)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const allProducts = [
    ...BUILT_IN_PRODUCTS.map((p) => ({ ...p, isCustom: false })),
    ...customProducts.map((p) => ({ ...p, isCustom: true })),
  ]
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

  return (
    <div className="product-config">
      <div className="product-config__intro">
        <h1 className="product-config__title">Product Configuration</h1>
        <p className="product-config__subtitle">
          Select a credit product to adjust its parameters, or create a new one.
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
                <span className={`pill ${p.isCustom ? 'pill-warning' : 'pill-primary'}`}>
                  {p.isCustom ? 'Custom' : 'Built-in'}
                </span>
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
                  <span>Max limit ($)</span>
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

              {selected.isCustom ? (
                <div className="product-config__custom-fields">
                  <div className="product-config__stat">
                    <span>Max limit</span>
                    <strong className="num">${selected.maxLimit.toLocaleString()}</strong>
                  </div>
                  <div className="product-config__stat">
                    <span>Interest rate</span>
                    <strong className="num">{(selected.interestRate * 100).toFixed(1)}% p.a.</strong>
                  </div>
                  <p className="product-config__note">
                    Custom products are administrative records for now — they are not yet wired
                    into the customer-facing app (home screen, application flow).
                  </p>
                </div>
              ) : (
                <div className="product-config__fields">
                  {selected.fields.map((field) => (
                    <FieldInput
                      key={field.key}
                      field={field}
                      value={field.type === 'percent' ? settings[field.key] * 100 : settings[field.key]}
                      onChange={(v) =>
                        onChangeSettings({
                          ...settings,
                          [field.key]: field.type === 'percent' ? v / 100 : v,
                        })
                      }
                    />
                  ))}
                  <p className="product-config__note">
                    Shared across all products: master capped limit is $
                    {settings.masterCappedLimit.toLocaleString()} (edit via the settings icon in the
                    header).
                  </p>
                </div>
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
