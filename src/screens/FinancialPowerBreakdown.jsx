import ScreenHeader from '../components/ScreenHeader'
import { ChevronDownIcon, InfoIcon } from '../components/icons'
import { computeLoanEligibility } from '../utils/loanCalculations'
import { computeCardEligibility } from '../utils/creditCardCalculations'
import './FinancialPowerBreakdown.css'

const REFERENCE_TENOR = 36

export default function FinancialPowerBreakdown({
  customer,
  remainingFinancialPower,
  existingLoanExposure,
  existingCardExposure,
  existingTotalExposure,
  settings,
  onBack,
  onNavigate,
}) {
  const { eligible: loanEligible, maxLoan } = computeLoanEligibility({
    remainingFinancialPower,
    annualRate: customer.interestRate,
    months: REFERENCE_TENOR,
    existingLoanExposure,
    existingTotalExposure,
    settings,
  })
  const { eligible: cardEligible, limit: maxCardLimit } = computeCardEligibility({
    remainingFinancialPower,
    existingCardExposure,
    existingTotalExposure,
    settings,
  })

  return (
    <>
      <ScreenHeader
        title="Your Financial Power"
        subtitle="How we calculated it"
        onBack={onBack}
      />

      <div className="fp-breakdown__body">
        <div className="card fp-breakdown__row">
          <div>
            <div className="fp-breakdown__label">Monthly income</div>
            <div className="num fp-breakdown__value">${customer.monthlyIncome.toLocaleString()}</div>
          </div>
        </div>

        <ChevronDownIcon className="fp-breakdown__arrow" />

        <div className="card fp-breakdown__row">
          <div>
            <div className="fp-breakdown__label">&divide; Min DSCR threshold &rarr; max allowed obligation</div>
            <div className="num fp-breakdown__value">${customer.maxAllowedObligation.toLocaleString()}</div>
          </div>
          <span className={`pill num ${customer.minDscr <= 2.5 ? 'pill-success' : 'pill-primary'}`}>
            {customer.minDscr.toFixed(1)}x DSCR
          </span>
        </div>

        <ChevronDownIcon className="fp-breakdown__arrow" />

        <div className="card fp-breakdown__obligations">
          <div className="fp-breakdown__label">&minus; Existing monthly obligations</div>
          <div className="fp-breakdown__obligation-row">
            <span>Wing Bank</span>
            <span className="num">${customer.obligationWingBank.toLocaleString()}</span>
          </div>
          <div className="fp-breakdown__obligation-row">
            <span>Other banks</span>
            <span className="num">${customer.obligationOtherBanks.toLocaleString()}</span>
          </div>
        </div>

        <div className="fp-breakdown__result">
          <span>= Your Financial Power</span>
          <span className="num">${customer.financialPower.toLocaleString()}/mo</span>
        </div>

        <div className="fp-breakdown__note">
          <InfoIcon width={14} height={14} />
          <span>
            Indicative rate of <strong>{(customer.interestRate * 100).toFixed(1)}% APR</strong> is
            used below to translate this into a maximum loan amount or credit limit.
          </span>
        </div>

        <div className="fp-breakdown__estimates">
          <div className="card fp-breakdown__estimate-card">
            <div className="fp-breakdown__estimate-label">Est. max loan</div>
            <div className="num fp-breakdown__estimate-value">
              {loanEligible ? `$${maxLoan.toLocaleString()}` : 'Not eligible'}
            </div>
            <div className="fp-breakdown__estimate-caption">over {REFERENCE_TENOR} months</div>
            <button
              type="button"
              className="btn btn-primary fp-breakdown__estimate-apply"
              disabled={!loanEligible}
              onClick={() => onNavigate('loan')}
            >
              Apply Loan
            </button>
          </div>
          <div className="card fp-breakdown__estimate-card">
            <div className="fp-breakdown__estimate-label">Est. credit limit</div>
            <div className="num fp-breakdown__estimate-value">
              {cardEligible ? `$${maxCardLimit.toLocaleString()}` : 'Not eligible'}
            </div>
            <div className="fp-breakdown__estimate-caption">revolving</div>
            <button
              type="button"
              className="btn btn-primary fp-breakdown__estimate-apply"
              disabled={!cardEligible}
              onClick={() => onNavigate('card')}
            >
              Apply Card
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
