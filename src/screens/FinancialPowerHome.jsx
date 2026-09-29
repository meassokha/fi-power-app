import { useEffect, useRef, useState } from 'react'
import BottomNav from '../components/BottomNav'
import { BellIcon, CardsIcon, ClockIcon, EditIcon, GridIcon, InfoIcon, LoanIcon } from '../components/icons'
import { MIN_CREDIT_LIMIT, computeCardEligibility } from '../utils/creditCardCalculations'
import {
  MIN_LOAN_AMOUNT,
  cashOnHandForLoanAmount,
  computeLoanEligibility,
  computeLoanOffer,
  loanAmountForCashOnHand,
  roundDownToHundred,
} from '../utils/loanCalculations'
import './FinancialPowerHome.css'

const TENORS = [6, 12, 24, 36]
const CARD_VALIDITY_YEARS = 5
const OFFER_EXPIRY_DAYS = 30

export default function FinancialPowerHome({
  customer,
  loanProductName,
  remainingFinancialPower,
  existingLoanExposure,
  existingCardExposure,
  existingTotalExposure,
  settings,
  activeApplications,
  onNavigate,
  onGoToLoan,
  onGoToCard,
}) {
  const [tenor, setTenor] = useState(36)
  const [cashOnHandOverride, setCashOnHandOverride] = useState(null)
  const [cardOverride, setCardOverride] = useState(null)
  const [isEditingCash, setIsEditingCash] = useState(false)
  const [cashInput, setCashInput] = useState('')
  const cashInputRef = useRef(null)

  const initials = customer.name
    .split(' ')
    .map((part) => part[0])
    .join('')

  // Loan and card are independent — each is checked purely against the
  // customer's own remaining Financial Power and exposure, with no
  // cross-product coupling. Both tiles keep a slider defaulting to their
  // own max, re-clamped whenever the tenor (loan) changes its ceiling.
  const loanEligibility = computeLoanEligibility({
    remainingFinancialPower,
    annualRate: customer.interestRate,
    months: tenor,
    existingLoanExposure,
    existingTotalExposure,
    settings,
  })
  const cardEligibility = computeCardEligibility({
    remainingFinancialPower,
    existingCardExposure,
    existingTotalExposure,
    settings,
  })

  // Customers pick how much cash they want in hand; the loan amount (what
  // they'll actually owe) is the larger figure once the processing fee is
  // added back on top — no PPI is offered on this quick-pick tile.
  const feeRate = settings.processingFeeWithoutPpi
  const minCashOnHand = roundDownToHundred(cashOnHandForLoanAmount(MIN_LOAN_AMOUNT, feeRate))
  const maxCashOnHand = roundDownToHundred(cashOnHandForLoanAmount(loanEligibility.maxLoan, feeRate))

  const cashOnHand = loanEligibility.eligible
    ? Math.min(cashOnHandOverride ?? maxCashOnHand, maxCashOnHand)
    : 0
  const loanAmount = loanEligibility.eligible ? Math.round(loanAmountForCashOnHand(cashOnHand, feeRate)) : 0
  const loanSliderPct = loanEligibility.eligible
    ? ((cashOnHand - minCashOnHand) / Math.max(maxCashOnHand - minCashOnHand, 1)) * 100
    : 0

  const loanOffer = loanEligibility.eligible
    ? computeLoanOffer({
        annualRate: customer.interestRate,
        months: tenor,
        ppiSelected: false,
        settings,
        loanAmount,
      })
    : null

  const cardAmount = cardEligibility.eligible
    ? Math.min(cardOverride ?? cardEligibility.limit, cardEligibility.limit)
    : 0
  const cardSliderPct = cardEligibility.eligible ? (cardAmount / Math.max(cardEligibility.limit, 1)) * 100 : 0
  const cardBelowMin = cardAmount > 0 && cardAmount < MIN_CREDIT_LIMIT

  // Live preview: as the customer drags the cash-on-hand amount, show how
  // much of their Financial Power this specific loan would use up. This
  // never feeds back into the eligibility math above, which always keys off
  // the real remainingFinancialPower — otherwise the ceiling could shrink
  // in on itself as the preview dropped.
  const previewRemaining = loanEligibility.eligible
    ? Math.max(Math.floor(remainingFinancialPower - loanOffer.monthlyInstallment), 0)
    : remainingFinancialPower
  const availablePct =
    customer.financialPower > 0 ? Math.min((previewRemaining / customer.financialPower) * 100, 100) : 0

  useEffect(() => {
    if (isEditingCash) {
      cashInputRef.current?.focus()
      cashInputRef.current?.select()
    }
  }, [isEditingCash])

  function handleNavigate(target) {
    if (target === 'loan') return onGoToLoan(loanAmount, tenor)
    if (target === 'card') return onGoToCard(cardAmount)
    onNavigate(target)
  }

  function openCashEditor() {
    setCashInput(String(cashOnHand))
    setIsEditingCash(true)
  }

  function commitCashInput() {
    const parsed = Number(cashInput)
    const clamped =
      Number.isFinite(parsed) && cashInput.trim() !== ''
        ? Math.min(Math.max(roundDownToHundred(Math.round(parsed)), minCashOnHand), maxCashOnHand)
        : cashOnHand
    setCashOnHandOverride(clamped)
    setIsEditingCash(false)
  }

  const tenorPicker = (
    <div className="fp-home__product-tenors">
      {TENORS.map((months) => (
        <button
          key={months}
          type="button"
          className={`fp-home__tenor-pill ${months === tenor ? 'is-selected' : ''}`}
          onClick={() => setTenor(months)}
        >
          {months} mo
        </button>
      ))}
    </div>
  )

  return (
    <>
      <div className="fp-home__header">
        <div className="fp-home__identity">
          <div className="fp-home__avatar">{initials}</div>
          <div>
            <div className="fp-home__greeting">Good afternoon</div>
            <div className="fp-home__name">{customer.name}</div>
          </div>
        </div>
        <div className="fp-home__header-actions">
          <button
            type="button"
            className="fp-home__icon-btn"
            onClick={() => onNavigate('active-products')}
            aria-label="Active products"
          >
            <GridIcon width={18} height={18} />
            {activeApplications.length > 0 && <span className="fp-home__badge">{activeApplications.length}</span>}
          </button>
          <button type="button" className="fp-home__icon-btn" aria-label="Notifications">
            <BellIcon />
          </button>
        </div>
      </div>

      <div className="fp-home__body">
        <div className="fp-home__hero">
          <div className="fp-home__hero-label-row">
            <span className="fp-home__hero-label">Your Financial Power</span>
            <button
              type="button"
              className="fp-home__hero-info"
              onClick={() => onNavigate('breakdown')}
              aria-label="How this is calculated"
            >
              <InfoIcon width={13} height={13} />
            </button>
          </div>
          <div className="fp-home__hero-amount">
            <span className="num">${remainingFinancialPower.toLocaleString()}</span>
            <span className="fp-home__hero-unit">/ month</span>
          </div>

          <div className="fp-home__hero-usage">
            <div className="fp-home__hero-usage-row">
              <span>Available</span>
              <span className="num">
                ${previewRemaining.toLocaleString()} of ${customer.financialPower}
              </span>
            </div>
            <div className="fp-home__hero-usage-track">
              <div className="fp-home__hero-usage-fill" style={{ width: `${availablePct}%` }} />
            </div>
          </div>

          <div className="fp-home__hero-updated">
            <ClockIcon />
            <span>Updated today</span>
          </div>
        </div>

        {settings.loanActive && (
        <div className="fp-home__product fp-home__product--loan">
          <div className="fp-home__product-glow" />
          <span className="fp-home__product-expiry">Expires in {OFFER_EXPIRY_DAYS} days</span>
          <div className="fp-home__product-header">
            <span className="fp-home__product-icon">
              <LoanIcon width={16} height={16} />
            </span>
            <span className="fp-home__product-name">{loanProductName}</span>
          </div>

          {loanEligibility.eligible ? (
            <>
              {isEditingCash ? (
                <div className="fp-home__product-amount-edit">
                  <span>$</span>
                  <input
                    ref={cashInputRef}
                    type="number"
                    inputMode="numeric"
                    min={minCashOnHand}
                    max={maxCashOnHand}
                    step={100}
                    className="num fp-home__product-amount-input"
                    value={cashInput}
                    onChange={(e) => setCashInput(e.target.value)}
                    onBlur={commitCashInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitCashInput()
                      if (e.key === 'Escape') setIsEditingCash(false)
                    }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className="num fp-home__product-amount fp-home__product-amount--editable"
                  onClick={openCashEditor}
                >
                  ${cashOnHand.toLocaleString()}
                  <EditIcon className="fp-home__product-amount-edit-icon" />
                </button>
              )}
              <input
                type="range"
                className="range-input fp-home__product-range"
                min={minCashOnHand}
                max={maxCashOnHand}
                step={100}
                value={cashOnHand}
                onChange={(e) => setCashOnHandOverride(Number(e.target.value))}
                style={{ '--fill': `${loanSliderPct}%` }}
              />
              {tenorPicker}
              <div className="fp-home__product-footer">
                <span className="fp-home__product-caption">Loan amount ${loanAmount.toLocaleString()}</span>
                <button type="button" className="fp-home__product-apply" onClick={() => handleNavigate('loan')}>
                  Apply
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="fp-home__product-ineligible">Not eligible for a loan at {tenor} months</p>
              {tenorPicker}
            </>
          )}
        </div>
        )}

        {settings.cardActive && (
        <div className="fp-home__product fp-home__product--card">
          <div className="fp-home__product-glow" />
          <span className="fp-home__product-expiry">Expires in {OFFER_EXPIRY_DAYS} days</span>
          <div className="fp-home__product-header">
            <span className="fp-home__product-icon">
              <CardsIcon width={16} height={16} />
            </span>
            <span className="fp-home__product-name">Dream Card</span>
          </div>

          {cardEligibility.eligible ? (
            <>
              <div className="num fp-home__product-amount">${cardAmount.toLocaleString()}</div>
              <input
                type="range"
                className="range-input fp-home__product-range"
                min={0}
                max={cardEligibility.limit}
                step={10}
                value={cardAmount}
                onChange={(e) => setCardOverride(Number(e.target.value))}
                style={{ '--fill': `${cardSliderPct}%` }}
              />
              <div className="fp-home__product-validity">
                {settings.cardAnnualFee > 0 ? `$${settings.cardAnnualFee.toLocaleString()} annual fee` : 'Free annual fee'} &middot; Card validity: {CARD_VALIDITY_YEARS} years
              </div>
              <div className="fp-home__product-footer">
                <span className="fp-home__product-caption">
                  {cardBelowMin ? `Drag to at least $${MIN_CREDIT_LIMIT.toLocaleString()} to apply` : ''}
                </span>
                <button
                  type="button"
                  className="fp-home__product-apply"
                  disabled={cardAmount < MIN_CREDIT_LIMIT}
                  onClick={() => handleNavigate('card')}
                >
                  Apply
                </button>
              </div>
            </>
          ) : (
            <p className="fp-home__product-ineligible">Not eligible for a card right now</p>
          )}
        </div>
        )}

        <button type="button" className="fp-home__product-tip-link" onClick={() => {}}>
          Get a higher loan with an extra income source
        </button>
      </div>

      <BottomNav active="home" onNavigate={handleNavigate} />
    </>
  )
}
