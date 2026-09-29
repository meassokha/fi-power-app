import { useEffect, useMemo, useRef, useState } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import { CheckIcon, EditIcon } from '../components/icons'
import {
  MIN_LOAN_AMOUNT,
  computeLoanEligibility,
  computeLoanOffer,
  loanAmountForTargetCashOnHand,
  roundDownToHundred,
} from '../utils/loanCalculations'
import './LoanApplication.css'

const TENORS = [6, 12, 24, 36]

export default function LoanApplication({
  customer,
  productName = 'Consumer Loan',
  remainingFinancialPower,
  existingLoanExposure,
  existingTotalExposure,
  settings,
  initialAmount,
  initialTenor,
  onBack,
  onApply,
}) {
  const [tenor, setTenor] = useState(initialTenor ?? 36)
  const [ppiSelected, setPpiSelected] = useState(false)
  // initialAmount arrives as a loan amount (carried over from the Home
  // tile's own slider) — convert it once to its cash-on-hand equivalent so
  // the two screens feel continuous despite tracking different quantities.
  const [cashOnHandOverride, setCashOnHandOverride] = useState(() => {
    if (initialAmount == null) return null
    const cash = computeLoanOffer({
      annualRate: customer.interestRate,
      months: initialTenor ?? 36,
      ppiSelected: false,
      settings,
      loanAmount: initialAmount,
    }).cashOnHand
    return roundDownToHundred(Math.round(cash))
  })
  const [submitted, setSubmitted] = useState(false)
  const [isEditingAmount, setIsEditingAmount] = useState(false)
  const [amountInput, setAmountInput] = useState('')
  const amountInputRef = useRef(null)

  const { eligible, maxLoan, cappedBy } = useMemo(
    () =>
      computeLoanEligibility({
        remainingFinancialPower,
        annualRate: customer.interestRate,
        months: tenor,
        existingLoanExposure,
        existingTotalExposure,
        settings,
      }),
    [remainingFinancialPower, customer.interestRate, tenor, existingLoanExposure, existingTotalExposure, settings],
  )

  // Customers pick how much cash they want in hand; the loan amount (what
  // they'll actually owe) is solved for numerically, since PPI's premium
  // isn't a flat percentage of the loan (see loanAmountForTargetCashOnHand).
  const cashOnHandFor = (amount) =>
    eligible ? computeLoanOffer({ annualRate: customer.interestRate, months: tenor, ppiSelected, settings, loanAmount: amount }).cashOnHand : 0

  const minCashOnHand = eligible ? roundDownToHundred(cashOnHandFor(MIN_LOAN_AMOUNT)) : 0
  const maxCashOnHand = eligible ? roundDownToHundred(cashOnHandFor(maxLoan)) : 0

  const cashOnHand = eligible ? Math.min(cashOnHandOverride ?? maxCashOnHand, maxCashOnHand) : 0

  const loanAmount = useMemo(() => {
    if (!eligible) return 0
    return Math.round(
      loanAmountForTargetCashOnHand({
        targetCashOnHand: cashOnHand,
        annualRate: customer.interestRate,
        months: tenor,
        ppiSelected,
        settings,
      }),
    )
  }, [eligible, cashOnHand, customer.interestRate, tenor, ppiSelected, settings])

  const offer = useMemo(() => {
    if (!eligible) return null
    return computeLoanOffer({ annualRate: customer.interestRate, months: tenor, ppiSelected, settings, loanAmount })
  }, [eligible, loanAmount, customer.interestRate, tenor, ppiSelected, settings])

  const sliderPct = eligible ? ((cashOnHand - minCashOnHand) / Math.max(maxCashOnHand - minCashOnHand, 1)) * 100 : 0
  const capacityUsedPct = offer ? Math.min((offer.monthlyInstallment / remainingFinancialPower) * 100, 100) : 0

  useEffect(() => {
    if (isEditingAmount) {
      amountInputRef.current?.focus()
      amountInputRef.current?.select()
    }
  }, [isEditingAmount])

  function handleApply() {
    onApply({ amount: loanAmount, tenor, monthlyInstallment: offer.monthlyInstallment })
    setSubmitted(true)
  }

  function openAmountEditor() {
    setAmountInput(String(cashOnHand))
    setIsEditingAmount(true)
  }

  function commitAmountInput() {
    const parsed = Number(amountInput)
    const clamped = Number.isFinite(parsed) && amountInput.trim() !== ''
      ? Math.min(Math.max(roundDownToHundred(Math.round(parsed)), minCashOnHand), maxCashOnHand)
      : cashOnHand
    setCashOnHandOverride(clamped)
    setIsEditingAmount(false)
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
        <ScreenHeader title={productName} onBack={onBack} />
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
      <ScreenHeader title={productName} onBack={onBack} />

      {!eligible ? (
        <div className="loan-apply__body">
          <div className="loan-apply__ineligible-card">
            <div className="loan-apply__ineligible-title">You are not eligible for the loan</div>
            <p className="loan-apply__ineligible-copy">
              Your remaining Financial Power of ${remainingFinancialPower}/mo doesn&apos;t reach
              the minimum loan amount (${MIN_LOAN_AMOUNT}) at a {tenor}-month tenor. Try a longer
              tenor below.
            </p>
          </div>
          {tenorPicker}
        </div>
      ) : (
        <>
          <div className="loan-apply__body">
            <div className="loan-apply__amount">
              <div className="loan-apply__amount-label">Cash on hand</div>
              {isEditingAmount ? (
                <div className="loan-apply__amount-edit">
                  <span className="loan-apply__amount-edit-prefix">$</span>
                  <input
                    ref={amountInputRef}
                    type="number"
                    inputMode="numeric"
                    min={minCashOnHand}
                    max={maxCashOnHand}
                    className="num loan-apply__amount-input"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    onBlur={commitAmountInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitAmountInput()
                      if (e.key === 'Escape') setIsEditingAmount(false)
                    }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className="num loan-apply__amount-value loan-apply__amount-value--editable"
                  onClick={openAmountEditor}
                >
                  ${cashOnHand.toLocaleString()}
                  <EditIcon className="loan-apply__amount-edit-icon" />
                </button>
              )}
            </div>

            <div className="loan-apply__slider">
              <input
                type="range"
                className="range-input"
                min={minCashOnHand}
                max={maxCashOnHand}
                step={100}
                value={cashOnHand}
                onChange={(e) => setCashOnHandOverride(Number(e.target.value))}
                style={{ '--fill': `${sliderPct}%` }}
              />
              <div className="loan-apply__slider-labels">
                <span className="num">${minCashOnHand.toLocaleString()}</span>
                <span className="num">${maxCashOnHand.toLocaleString()} max</span>
              </div>
              <div className="loan-apply__slider-caption">Capped by {cappedBy}</div>
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
                <span>Loan amount</span>
                <span className="num">${loanAmount.toLocaleString()}</span>
              </div>
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
                <span className="num">${cashOnHand.toLocaleString()}</span>
              </div>
              <div className="loan-apply__divider" />
              <div>
                <div className="loan-apply__capacity-row">
                  <span>Remaining capacity used</span>
                  <span className="num">
                    ${offer.monthlyInstallment.toFixed(0)} of ${remainingFinancialPower}
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
