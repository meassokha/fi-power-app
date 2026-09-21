import { CloseIcon } from './icons'
import './SettingsPanel.css'

function PercentField({ label, hint, value, onChange, step = 0.1 }) {
  return (
    <label className="settings-panel__field">
      <span className="settings-panel__field-label">{label}</span>
      {hint && <span className="settings-panel__field-hint">{hint}</span>}
      <div className="settings-panel__field-input">
        <input
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
        <span>%</span>
      </div>
    </label>
  )
}

function AmountField({ label, hint, value, onChange, step = 100 }) {
  return (
    <label className="settings-panel__field">
      <span className="settings-panel__field-label">{label}</span>
      {hint && <span className="settings-panel__field-hint">{hint}</span>}
      <div className="settings-panel__field-input">
        <span>$</span>
        <input
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
      </div>
    </label>
  )
}

export default function SettingsPanel({ settings, onChange, onClose }) {
  return (
    <div className="settings-panel">
      <div className="settings-panel__header">
        <span>Product Settings</span>
        <button type="button" className="settings-panel__close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
      </div>

      <AmountField
        label="Max loan limit"
        hint="Per-loan cap, before the master limit"
        value={settings.maxLoanLimit}
        onChange={(v) => onChange({ ...settings, maxLoanLimit: v })}
      />
      <AmountField
        label="Max card limit"
        hint="Per-card cap, before the master limit"
        value={settings.maxCardLimit}
        onChange={(v) => onChange({ ...settings, maxCardLimit: v })}
      />
      <PercentField
        label="Dream Card interest rate"
        hint="Annual percentage rate"
        step={1}
        value={settings.cardInterestRate * 100}
        onChange={(v) => onChange({ ...settings, cardInterestRate: v / 100 })}
      />
      <AmountField
        label="Master capped limit"
        hint="Combined ceiling across all active loans + cards"
        step={1000}
        value={settings.masterCappedLimit}
        onChange={(v) => onChange({ ...settings, masterCappedLimit: v })}
      />

      <div className="settings-panel__divider" />

      <PercentField
        label="PPI premium rate"
        hint="Monthly, applied to declining balance"
        step={0.01}
        value={settings.ppiRate * 100}
        onChange={(v) => onChange({ ...settings, ppiRate: v / 100 })}
      />
      <PercentField
        label="Processing fee — with PPI"
        value={settings.processingFeeWithPpi * 100}
        onChange={(v) => onChange({ ...settings, processingFeeWithPpi: v / 100 })}
      />
      <PercentField
        label="Processing fee — without PPI"
        value={settings.processingFeeWithoutPpi * 100}
        onChange={(v) => onChange({ ...settings, processingFeeWithoutPpi: v / 100 })}
      />
    </div>
  )
}

