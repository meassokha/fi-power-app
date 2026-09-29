import { CheckIcon } from './icons'
import { withDerivedFields } from '../utils/customerRules'
import './BackendResults.css'

export default function BackendResults({ profile, items, revealedCount, completed }) {
  if (!profile) return null

  const derived = withDerivedFields(profile)
  const dscrPillClass = derived.minDscr <= 2.5 ? 'pill-success' : 'pill-primary'

  const visibleItems = items.slice(0, revealedCount)
  const showCalculation = completed

  return (
    <div className="backend-results">
      <div className="backend-results__header">
        <span className="backend-results__dot" />
        <span>Results</span>
      </div>

      {visibleItems.length === 0 ? (
        <p className="backend-results__empty">Results will appear here as each check completes.</p>
      ) : (
        <ul className="backend-results__list">
          {visibleItems.map((label, i) => (
            <li key={i} className="backend-results__item">
              <CheckIcon width={13} height={13} />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      )}

      {showCalculation && (
        <div className="backend-results__calc">
          <div className="backend-results__calc-title">Financial Power calculation</div>

          <div className="backend-results__calc-row">
            <span>Segment</span>
            <span className={`pill ${dscrPillClass}`}>{derived.segment}</span>
          </div>
          <div className="backend-results__calc-row">
            <span>Min DSCR</span>
            <span className="num">{derived.minDscr.toFixed(1)}x</span>
          </div>
          <div className="backend-results__calc-row">
            <span>Customer DSCR</span>
            <span className={`num ${derived.isEligible ? '' : 'backend-results__calc-value--danger'}`}>
              {Number.isFinite(derived.customerDscr) ? `${derived.customerDscr.toFixed(1)}x` : '∞'}
            </span>
          </div>
          <div className="backend-results__calc-row">
            <span>Interest rate</span>
            <span className="num">{(derived.interestRate * 100).toFixed(0)}%</span>
          </div>

          <div className="backend-results__divider" />

          <div className="backend-results__formula">
            <div>
              ${profile.monthlyIncome.toLocaleString()} income &divide; {derived.minDscr.toFixed(1)}x DSCR = $
              {derived.maxAllowedObligation.toLocaleString()} max obligation
            </div>
            <div>&minus; ${derived.totalObligation.toLocaleString()} existing obligations</div>
            <div className="backend-results__formula-result">
              = ${derived.financialPower.toLocaleString()}/mo Financial Power
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
