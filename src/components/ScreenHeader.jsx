import { BackIcon } from './icons'
import './ScreenHeader.css'

export default function ScreenHeader({ title, subtitle, onBack }) {
  return (
    <div className="screen-header">
      <button type="button" className="screen-header__back" onClick={onBack} aria-label="Back">
        <BackIcon />
      </button>
      <div>
        <div className="screen-header__title">{title}</div>
        {subtitle && <div className="screen-header__subtitle">{subtitle}</div>}
      </div>
    </div>
  )
}
