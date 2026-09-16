import { useMemo, useState } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import { CheckIcon } from '../components/icons'
import {
  MAX_LOAN_AMOUNT,
  MIN_LOAN_AMOUNT,
  computeLoanOffer,
  computeMaxPrincipalForEmi,
} from '../utils/loanCalculations'
import './LoanApplication.css'

const TENORS = [6, 12, 24, 36]

export default function LoanApplication({ customer, settings, onBack, onApply }) {
  const [tenor, setTenor] = useState(36)
  const [ppiSelected, setPpiSelected] = useState(false)
  const [amountOverride, setAmountOverride] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const maxLoan = useMemo(() => {
    const raw = computeMaxPrincipalForEmi(customer.financialPower, customer.interestRate, tenor)
    return Math.min(Math.floor(raw / 10) * 10, MAX_LOAN_AMOUNT)
  }, [customer.financialPower, customer.interestRate, tenor])

  const eligible = maxLoan >= MIN_LOAN_AMOUNT
  const loanAmount = Math.min(amountOverride ?? maxLoan, maxLoan)

  const offer = useMemo(() => {
    if (!eligible) return null
    return computeLoanOffer({
      financialPower: customer.financialPower,
      annualRate: customer.interestRate,
      months: tenor,
      ppiSelected,
      settings,
      loanAmount,
    })
  }, [eligible, loanAmount, customer.financialPower, customer.interestRate, tenor, ppiSelected, settings])

  const sliderPct = eligible ? ((loanAmount - MIN_LOAN_AMOUNT) / Math.max(maxLoan - MIN_LOAN_AMOUNT, 1)) * 100 : 0
  const capacityUsedPct = offer ? Math.min((offer.monthlyInstallment / customer.financialPower) * 100, 100) : 0

  function handleApply() {
    onApply({ amount: loanAmount, tenor, monthlyInstallment: offer.monthlyInstallment })
    setSubmitted(true)
  }

  const tenorPicker = (
    <div>
      <div className="loan-apply__section-title">Repayment tenor</div>
      <div className="loan-apply__tenors">
        {TENORS.map((months) => (
          <button
            key={months}
            type="button"
            className={`loan-apply__tenor ${months === tenor ? 'is-selected' : ''}`}
            onClick={() => setTenor(months)}
          >
            {months} mo
          </button>
        ))}
      </div>
    </div>
  )

  if (submitted) {
    return (
      <>
        <ScreenHeader title="Consumer Loan" onBack={onBack} />
        <div className="loan-apply__body loan-apply__body--centered">
          <div className="loan-apply__success">
            <span className="loan-apply__success-icon">
              <CheckIcon width={20} height={20} />
            </span>
            <div className="loan-apply__success-title">Loan disbursed</div>
            <p className="loan-apply__success-copy">
              Your ${loanAmount.toLocaleString()} loan over {tenor} months is active. Manage it
              any time from your home screen.
            </p>
          </div>
        </div>
        <div className="loan-apply__cta">
          <button type="button" className="btn btn-primary" onClick={onBack}>
            Done
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <ScreenHeader title="Consumer Loan" onBack={onBack} />

      {!eligible ? (
        <div className="loan-apply__body">
          <div className="loan-apply__ineligible-card">
            <div className="loan-apply__ineligible-title">You are not eligible for the loan</div>
            <p className="loan-apply__ineligible-copy">
              Your Financial Power of ${customer.financialPower}/mo doesn&apos;t reach the minimum
              loan amount (${MIN_LOAN_AMOUNT}) at a {tenor}-month tenor. Try a longer tenor below.
            </p>
          </div>
          {tenorPicker}
        </div>
      ) : (
        <>
          <div className="loan-apply__body">
            <div className="loan-apply__amount">
              <div className="loan-apply__amount-label">Loan amount</div>
              <div className="num loan-apply__amount-value">${loanAmount.toLocaleString()}</div>
            </div>

            <div className="loan-apply__slider">
              <input
                type="range"
                className="range-input"
                min={MIN_LOAN_AMOUNT}
                max={maxLoan}
                step={10}
                value={loanAmount}
                onChange={(e) => setAmountOverride(Number(e.target.value))}
                style={{ '--fill': `${sliderPct}%` }}
              />
              <div className="loan-apply__slider-labels">
                <span className="num">${MIN_LOAN_AMOUNT.toLocaleString()}</span>
                <span className="num">${maxLoan.toLocaleString()} max</span>
              </div>
              <div className="loan-apply__slider-caption">Capped by your Financial Power</div>
            </div>

            {tenorPicker}

            <button
              type="button"
              className={`loan-apply__ppi ${ppiSelected ? 'is-selected' : ''}`}
              onClick={() => setPpiSelected((v) => !v)}
            >
              <div className="loan-apply__ppi-info">
                <div className="loan-apply__ppi-title">Payment Protection Insurance</div>
                <div className="loan-apply__ppi-copy">
                  {(settings.ppiRate * 100).toFixed(2)}%/mo on declining balance, charged upfront
                </div>
              </div>
              <span className={`loan-apply__switch ${ppiSelected ? 'is-on' : ''}`}>
                <span className="loan-apply__switch-knob" />
              </span>
            </button>

            {ppiSelected && (
              <div className="loan-apply__ppi-total">
                Total insurance fee for {tenor} months:{' '}
                <strong className="num">${offer.ppiTotal.toFixed(2)}</strong>
              </div>
            )}

            <div className="card loan-apply__summary">
              <div className="loan-apply__summary-row">
                <span>Monthly installment</span>
                <span className="num loan-apply__summary-highlight">
                  ${offer.monthlyInstallment.toFixed(2)} / mo
                </span>
              </div>
              <div className="loan-apply__summary-row">
                <span>Interest rate</span>
                <span className="num">{(customer.interestRate * 100).toFixed(0)}% APR</span>
              </div>
              <div className="loan-apply__summary-row">
                <span>Total repayable</span>
                <span className="num">${offer.totalRepayable.toFixed(2)}</span>
              </div>
              <div className="loan-apply__summary-row">
                <span>Processing fee ({(offer.processingFeeRate * 100).toFixed(0)}%)</span>
                <span className="num">&minus;${offer.processingFee.toFixed(2)}</span>
              </div>
              {ppiSelected && (
                <div className="loan-apply__summary-row">
                  <span>PPI premium (upfront)</span>
                  <span className="num">&minus;${offer.ppiTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="loan-apply__divider" />
              <div className="loan-apply__summary-row loan-apply__cash-row">
                <span>Cash on hand</span>
                <span className="num">${offer.cashOnHand.toFixed(2)}</span>
              </div>
              <div className="loan-apply__divider" />
              <div>
                <div className="loan-apply__capacity-row">
                  <span>Financial Power used</span>
                  <span className="num">
                    ${offer.monthlyInstallment.toFixed(0)} of ${customer.financialPower}
                  </span>
                </div>
                <div className="loan-apply__capacity-track">
                  <div className="loan-apply__capacity-fill" style={{ width: `${capacityUsedPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="loan-apply__cta">
            <button type="button" className="btn btn-primary" onClick={handleApply}>
              Apply Now
            </button>
            <div className="loan-apply__disclaimer">Indicative only. Subject to final approval.</div>
          </div>
        </>
      )}
    </>
  )
}
