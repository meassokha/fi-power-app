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

export default function SettingsPanel({ settings, onChange, onClose }) {
  return (
    <div className="settings-panel">
      <div className="settings-panel__header">
        <span>Loan Settings</span>
        <button type="button" className="settings-panel__close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
      </div>

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
