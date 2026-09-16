import { useState } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import { CheckIcon } from '../components/icons'
import {
  CREDIT_CARD_INTEREST_RATE,
  MIN_CREDIT_LIMIT,
  computeCreditLimit,
} from '../utils/creditCardCalculations'
import './CreditCardApplication.css'

export default function CreditCardApplication({ customer, onBack, onApply }) {
  const creditLimit = computeCreditLimit(customer.financialPower)
  const eligible = creditLimit >= MIN_CREDIT_LIMIT
  const sliderMin = MIN_CREDIT_LIMIT

  const [amountOverride, setAmountOverride] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const selectedLimit = Math.min(amountOverride ?? creditLimit, creditLimit)
  const sliderPct = eligible
    ? ((selectedLimit - sliderMin) / Math.max(creditLimit - sliderMin, 1)) * 100
    : 0
  const estMinPayment = selectedLimit * 0.1

  function handleApply() {
    onApply({ amount: selectedLimit })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <>
        <ScreenHeader title="Dream Card" onBack={onBack} />
        <div className="card-apply__body card-apply__body--centered">
          <div className="card-apply__success">
            <span className="card-apply__success-icon">
              <CheckIcon width={20} height={20} />
            </span>
            <div className="card-apply__success-title">Dream Card activated</div>
            <p className="card-apply__success-copy">
              Your Dream Card with a ${selectedLimit.toLocaleString()} limit is active. Manage it
              any time from your home screen.
            </p>
          </div>
        </div>
        <div className="card-apply__cta">
          <button type="button" className="btn btn-primary" onClick={onBack}>
            Done
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <ScreenHeader title="Dream Card" onBack={onBack} />

      <div className="card-apply__body">
        <div className="card-apply__card">
          <div className="card-apply__card-glow" />
          <div className="card-apply__card-top">
            <span className="card-apply__wordmark">WING</span>
            <span className="pill card-apply__tier-pill">Dream Card</span>
          </div>
          <div className="num card-apply__card-number">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4821</div>
          <div className="card-apply__card-bottom">
            <span>{customer.name.toUpperCase()}</span>
            <span className="num">08/29</span>
          </div>
        </div>

        {!eligible ? (
          <div className="card-apply__ineligible-card">
            <div className="card-apply__ineligible-title">You are not eligible for a card</div>
            <p className="card-apply__ineligible-copy">
              Your Financial Power doesn&apos;t reach the minimum card limit (${MIN_CREDIT_LIMIT}
              ) yet.
            </p>
          </div>
        ) : (
          <>
            <div className="card-apply__amount">
              <div className="card-apply__amount-label">Card limit</div>
              <div className="num card-apply__amount-value">${selectedLimit.toLocaleString()}</div>
            </div>

            <div className="card-apply__slider">
              <input
                type="range"
                className="range-input"
                min={sliderMin}
                max={creditLimit}
                step={10}
                value={selectedLimit}
                onChange={(e) => setAmountOverride(Number(e.target.value))}
                style={{ '--fill': `${sliderPct}%` }}
              />
              <div className="card-apply__slider-labels">
                <span className="num">${sliderMin.toLocaleString()}</span>
                <span className="num">${creditLimit.toLocaleString()} max</span>
              </div>
              <div className="card-apply__slider-caption">
                Recommended limit, based on your Financial Power
              </div>
            </div>

            <div className="card card-apply__summary">
              <div className="card-apply__summary-row">
                <span>Interest rate</span>
                <span className="num">
                  {(CREDIT_CARD_INTEREST_RATE * 100).toFixed(0)}% p.a. ({(CREDIT_CARD_INTEREST_RATE * 100 / 12).toFixed(1)}%/mo)
                </span>
              </div>
              <div className="card-apply__summary-row">
                <span>Est. minimum monthly payment (10%)</span>
                <span className="num">${estMinPayment.toFixed(2)}</span>
              </div>
            </div>

            <ul className="card-apply__benefits">
              <li>
                <CheckIcon />
                <span>No annual fee</span>
              </li>
              <li>
                <CheckIcon />
                <span>1.5% cashback on everyday spend</span>
              </li>
            </ul>
          </>
        )}
      </div>

      <div className="card-apply__cta">
        <button type="button" className="btn btn-primary" disabled={!eligible} onClick={handleApply}>
          Apply Now
        </button>
      </div>
    </>
  )
}
