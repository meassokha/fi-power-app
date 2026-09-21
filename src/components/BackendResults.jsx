import { CheckIcon } from './icons'
import { withDerivedFields } from '../utils/customerRules'
import './BackendResults.css'

export default function BackendResults({ profile, isWingPayroll, revealedCount }) {
  if (!profile) return null

  const derived = withDerivedFields(profile)
  const dscrPillClass = derived.minDscr <= 2.5 ? 'pill-success' : 'pill-primary'

  const items = [
    { id: 'payroll', label: isWingPayroll ? 'Customer is a Wing Bank Payroll Customer' : 'Customer is not a Wing Bank Payroll Customer' },
    { id: 'salary', label: `Last 6-month average salary: $${profile.monthlyIncome.toLocaleString()}` },
    { id: 'wing-obligation', label: `Wing Bank monthly installment obligation: $${profile.obligationWingBank.toLocaleString()}` },
    { id: 'other-obligation', label: `Other Bank monthly installment obligation: $${profile.obligationOtherBanks.toLocaleString()}` },
  ].slice(0, revealedCount)

  const showCalculation = revealedCount >= 5

  return (
    <div className="backend-results">
      <div className="backend-results__header">
        <span className="backend-results__dot" />
        <span>Results</span>
      </div>

      {items.length === 0 ? (
        <p className="backend-results__empty">Results will appear here as each check completes.</p>
      ) : (
        <ul className="backend-results__list">
          {items.map((item) => (
            <li key={item.id} className="backend-results__item">
              <CheckIcon width={13} height={13} />
              <span>{item.label}</span>
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
