import { useState } from 'react'
import BottomNav from '../components/BottomNav'
import { BellIcon, CardsIcon, ClockIcon, GridIcon, InfoIcon, LoanIcon } from '../components/icons'
import { MIN_CREDIT_LIMIT, computeCardEligibility } from '../utils/creditCardCalculations'
import { MIN_LOAN_AMOUNT, computeLoanEligibility, computeLoanOffer } from '../utils/loanCalculations'
import './FinancialPowerHome.css'

const TENORS = [6, 12, 24, 36]
const CARD_VALIDITY_YEARS = 5
const OFFER_EXPIRY_DAYS = 30

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
  const [tenor, setTenor] = useState(36)
  const [loanOverride, setLoanOverride] = useState(null)
  const [cardOverride, setCardOverride] = useState(null)

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

  const loanAmount = loanEligibility.eligible
    ? Math.min(loanOverride ?? loanEligibility.maxLoan, loanEligibility.maxLoan)
    : 0
  const loanSliderPct = loanEligibility.eligible
    ? ((loanAmount - MIN_LOAN_AMOUNT) / Math.max(loanEligibility.maxLoan - MIN_LOAN_AMOUNT, 1)) * 100
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

  const availablePct = customer.financialPower > 0 ? Math.min((remainingFinancialPower / customer.financialPower) * 100, 100) : 0

  function handleNavigate(target) {
    if (target === 'loan') return onGoToLoan(loanAmount, tenor)
    if (target === 'card') return onGoToCard(cardAmount)
    onNavigate(target)
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
                ${remainingFinancialPower.toLocaleString()} of ${customer.financialPower}
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

        <div className="fp-home__product fp-home__product--loan">
          <div className="fp-home__product-glow" />
          <span className="fp-home__product-expiry">Expires in {OFFER_EXPIRY_DAYS} days</span>
          <div className="fp-home__product-header">
            <span className="fp-home__product-icon">
              <LoanIcon width={16} height={16} />
            </span>
            <span className="fp-home__product-name">Consumer Loan</span>
          </div>

          {loanEligibility.eligible ? (
            <>
              <div className="num fp-home__product-amount">${loanAmount.toLocaleString()}</div>
              <input
                type="range"
                className="range-input fp-home__product-range"
                min={MIN_LOAN_AMOUNT}
                max={loanEligibility.maxLoan}
                step={10}
                value={loanAmount}
                onChange={(e) => setLoanOverride(Number(e.target.value))}
                style={{ '--fill': `${loanSliderPct}%` }}
              />
              {tenorPicker}
              <div className="fp-home__product-footer">
                <span className="fp-home__product-caption">
                  Cash on hand ${Math.round(loanOffer.cashOnHand).toLocaleString()}
                </span>
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
                Free annual fee &middot; Card validity: {CARD_VALIDITY_YEARS} years
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

        <button type="button" className="fp-home__product-tip-link" onClick={() => {}}>
          Get a higher loan with an extra income source
        </button>
      </div>

      <BottomNav active="home" onNavigate={handleNavigate} />
    </>
  )
}
