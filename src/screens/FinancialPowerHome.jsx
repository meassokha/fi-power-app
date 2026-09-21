import { useState } from 'react'
import BottomNav from '../components/BottomNav'
import { BellIcon, ClockIcon, GridIcon, InfoIcon } from '../components/icons'
import { MIN_LOAN_AMOUNT, computeEmi, computeLoanEligibility } from '../utils/loanCalculations'
import { MIN_CREDIT_LIMIT, computeCardEligibility } from '../utils/creditCardCalculations'
import './FinancialPowerHome.css'

const PREVIEW_TENOR = 36

function loanEmiFor(amount, annualRate) {
  return amount > 0 ? computeEmi(amount, annualRate, PREVIEW_TENOR) : 0
}

function cardMinPaymentFor(amount) {
  return amount * 0.1
}

export default function FinancialPowerHome({
  customer,
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
  const [loanOverride, setLoanOverride] = useState(null)
  const [cardOverride, setCardOverride] = useState(null)

  const initials = customer.name
    .split(' ')
    .map((part) => part[0])
    .join('')

  // The slider's fixed scale — each product's ceiling on its OWN, ignoring
  // the other. This never changes just because the other bar moves, so an
  // untouched (or already-valid) slider's thumb never drifts on its own;
  // only an actual drag, or a real forced clamp, ever moves it.
  const loanOwn = computeLoanEligibility({
    remainingFinancialPower,
    annualRate: customer.interestRate,
    months: PREVIEW_TENOR,
    existingLoanExposure,
    existingTotalExposure,
    settings,
  })
  const cardOwn = computeCardEligibility({
    remainingFinancialPower,
    existingCardExposure,
    existingTotalExposure,
    settings,
  })

  // What's actually committed right now — 0 until the customer touches that
  // bar, so an untouched bar doesn't eat into the other's headroom.
  const loanCommitment = loanOverride ?? 0
  const cardCommitment = cardOverride ?? 0

  // The REAL ceiling right now, with the other bar's current commitment
  // counted against the shared EMI capacity and the shared master cap.
  const loanLive = computeLoanEligibility({
    remainingFinancialPower: Math.max(remainingFinancialPower - cardMinPaymentFor(cardCommitment), 0),
    annualRate: customer.interestRate,
    months: PREVIEW_TENOR,
    existingLoanExposure,
    existingTotalExposure: existingTotalExposure + cardCommitment,
    settings,
  })
  const cardLive = computeCardEligibility({
    remainingFinancialPower: Math.max(remainingFinancialPower - loanEmiFor(loanCommitment, customer.interestRate), 0),
    existingCardExposure,
    existingTotalExposure: existingTotalExposure + loanCommitment,
    settings,
  })

  // Both start at 0 (nothing committed yet) rather than defaulting to their
  // max — defaulting both to max would show two amounts that can't actually
  // be taken at the same time, since they share the same capacity.
  const loanAmount = loanLive.eligible ? Math.min(loanOverride ?? 0, loanLive.maxLoan) : 0
  const cardAmount = cardLive.eligible ? Math.min(cardOverride ?? 0, cardLive.limit) : 0

  // Live preview: how much of the remaining Financial Power the currently
  // dragged loan/card amounts would use together, so the "Available" bar
  // reacts as the customer drags either slider.
  const previewUsed = loanEmiFor(loanAmount, customer.interestRate) + cardMinPaymentFor(cardAmount)
  const previewRemaining = Math.max(Math.floor(remainingFinancialPower - previewUsed), 0)
  const previewPct = customer.financialPower > 0 ? Math.min((previewRemaining / customer.financialPower) * 100, 100) : 0

  // Fill and "blocked" width, both measured against the FIXED own-scale —
  // never against the live (shrinkable) ceiling — so the bar only ever
  // moves when its own value actually changes.
  const loanSliderPct = loanOwn.eligible ? (loanAmount / Math.max(loanOwn.maxLoan, 1)) * 100 : 0
  const cardSliderPct = cardOwn.eligible ? (cardAmount / Math.max(cardOwn.limit, 1)) * 100 : 0
  const loanBlockedPct = loanOwn.eligible
    ? Math.max(0, Math.min(100, ((loanOwn.maxLoan - loanLive.maxLoan) / Math.max(loanOwn.maxLoan, 1)) * 100))
    : 0
  const cardBlockedPct = cardOwn.eligible
    ? Math.max(0, Math.min(100, ((cardOwn.limit - cardLive.limit) / Math.max(cardOwn.limit, 1)) * 100))
    : 0

  const loanBelowMin = loanAmount > 0 && loanAmount < MIN_LOAN_AMOUNT
  const cardBelowMin = cardAmount > 0 && cardAmount < MIN_CREDIT_LIMIT

  function handleNavigate(target) {
    if (target === 'loan') return onGoToLoan(loanAmount)
    if (target === 'card') return onGoToCard(cardAmount)
    onNavigate(target)
  }

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
          <button
            type="button"
            className="fp-home__hero-info"
            onClick={() => onNavigate('breakdown')}
            aria-label="How this is calculated"
          >
            <InfoIcon width={14} height={14} />
          </button>
          <span className="fp-home__hero-label">Your Financial Power</span>
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
              <div className="fp-home__hero-usage-fill" style={{ width: `${previewPct}%` }} />
            </div>
          </div>

          <div className="fp-home__hero-updated">
            <ClockIcon />
            <span>Updated today</span>
          </div>
        </div>

        <div className="card fp-home__product">
          <div className="fp-home__product-header">
            <span className="fp-home__product-name">Consumer Loan</span>
            <span className="num fp-home__product-amount">${loanAmount.toLocaleString()}</span>
          </div>
          {loanOwn.eligible ? (
            <>
              <div className="fp-home__slider-wrap">
                <input
                  type="range"
                  className="range-input"
                  min={0}
                  max={loanOwn.maxLoan}
                  step={10}
                  value={loanAmount}
                  onChange={(e) => setLoanOverride(Math.min(Number(e.target.value), loanLive.maxLoan))}
                  style={{ '--fill': `${loanSliderPct}%` }}
                />
                {loanBlockedPct > 0 && (
                  <div className="fp-home__slider-blocked" style={{ width: `${loanBlockedPct}%` }} />
                )}
              </div>
              <div className="fp-home__product-footer">
                <span className="fp-home__product-caption">
                  {loanBelowMin ? `Drag to at least $${MIN_LOAN_AMOUNT.toLocaleString()} to apply` : `Up to $${loanLive.maxLoan.toLocaleString()}`}
                </span>
                <button
                  type="button"
                  className="fp-home__product-apply"
                  disabled={loanAmount < MIN_LOAN_AMOUNT}
                  onClick={() => handleNavigate('loan')}
                >
                  Apply
                </button>
              </div>
            </>
          ) : (
            <p className="fp-home__product-ineligible">Not eligible for a loan right now</p>
          )}
        </div>

        <div className="card fp-home__product">
          <div className="fp-home__product-header">
            <span className="fp-home__product-name">Dream Card</span>
            <span className="num fp-home__product-amount">${cardAmount.toLocaleString()}</span>
          </div>
          {cardOwn.eligible ? (
            <>
              <div className="fp-home__slider-wrap">
                <input
                  type="range"
                  className="range-input"
                  min={0}
                  max={cardOwn.limit}
                  step={10}
                  value={cardAmount}
                  onChange={(e) => setCardOverride(Math.min(Number(e.target.value), cardLive.limit))}
                  style={{ '--fill': `${cardSliderPct}%` }}
                />
                {cardBlockedPct > 0 && (
                  <div className="fp-home__slider-blocked" style={{ width: `${cardBlockedPct}%` }} />
                )}
              </div>
              <div className="fp-home__product-footer">
                <span className="fp-home__product-caption">
                  {cardBelowMin ? `Drag to at least $${MIN_CREDIT_LIMIT.toLocaleString()} to apply` : `Up to $${cardLive.limit.toLocaleString()}`}
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
      </div>

      <BottomNav active="home" onNavigate={handleNavigate} />
    </>
  )
}
