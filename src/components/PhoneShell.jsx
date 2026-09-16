import './PhoneShell.css'

export default function PhoneShell({ children }) {
  return (
    <div className="phone-frame">
      <div className="phone-frame__notch" />
      <div className="phone-frame__button phone-frame__button--action" />
      <div className="phone-frame__button phone-frame__button--volume-up" />
      <div className="phone-frame__button phone-frame__button--volume-down" />
      <div className="phone-frame__button phone-frame__button--power" />

      <div className="phone-shell">
        <div className="phone-shell__safe-top" />
        {children}
        <div className="phone-shell__home-indicator" />
      </div>
    </div>
  )
}
