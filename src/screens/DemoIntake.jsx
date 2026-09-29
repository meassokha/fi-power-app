import { useState } from 'react'
import TermsModal from '../components/TermsModal'
import {
  MIN_LOAN_AMOUNT,
  cashOnHandForLoanAmount,
  loanAmountForCashOnHand,
  roundDownToHundred,
} from '../utils/loanCalculations'
import './DemoIntake.css'

const TENORS = [6, 12, 24, 36]
const INCOME_SOURCES = [
  'Wing Bank Payroll',
  'Other Bank Payroll',
  'Wing Bank Merchant',
  'Other Bank Merchant',
  'Rental',
  'No income',
]
const SELF_DECLARED_SOURCE = 'Other Bank Merchant'

export default function DemoIntake({ settings, checking, onSubmit }) {
  const maxLoan = settings.maxLoanLimit
  const feeRate = settings.processingFeeWithoutPpi
  const minCashOnHand = roundDownToHundred(cashOnHandForLoanAmount(MIN_LOAN_AMOUNT, feeRate))
  const maxCashOnHand = roundDownToHundred(cashOnHandForLoanAmount(maxLoan, feeRate))

  const [cashOnHand, setCashOnHand] = useState(roundDownToHundred((maxCashOnHand + minCashOnHand) / 2))
  const [tenor, setTenor] = useState(36)
  const [sourceOfIncome, setSourceOfIncome] = useState(INCOME_SOURCES[0])
  const [selfDeclaredIncome, setSelfDeclaredIncome] = useState('')
  const [termsAgreed, setTermsAgreed] = useState(true)
  const [showTerms, setShowTerms] = useState(false)

  const loanAmount = Math.round(loanAmountForCashOnHand(cashOnHand, feeRate))
  const sliderPct = ((cashOnHand - minCashOnHand) / Math.max(maxCashOnHand - minCashOnHand, 1)) * 100
  const needsSelfDeclaredIncome = sourceOfIncome === SELF_DECLARED_SOURCE
  const selfDeclaredIncomeValid = Number(selfDeclaredIncome) > 0

  return (
    <>
      <div className="demo-intake__header">
        <div className="demo-intake__eyebrow">Wing Bank</div>
        <h1 className="demo-intake__title">Apply for a Consumer Loan</h1>
        <p className="demo-intake__subtitle">
          Tell us a bit about what you need &mdash; we&apos;ll check your Financial Power next.
        </p>
      </div>

      <div className="demo-intake__body">
        <div className="card demo-intake__field">
          <div className="demo-intake__field-label">Request Amount - Cash on hand</div>
          <div className="num demo-intake__amount">${cashOnHand.toLocaleString()}</div>
          <input
            type="range"
            className="range-input"
            min={minCashOnHand}
            max={maxCashOnHand}
            step={100}
            value={cashOnHand}
            disabled={checking}
            onChange={(e) => setCashOnHand(Number(e.target.value))}
            style={{ '--fill': `${sliderPct}%` }}
          />
          <div className="demo-intake__range-labels">
            <span className="num">${minCashOnHand.toLocaleString()}</span>
            <span className="num">${maxCashOnHand.toLocaleString()}</span>
          </div>
          <div className="demo-intake__derived-caption">Loan amount ${loanAmount.toLocaleString()}</div>
        </div>

        <div className="card demo-intake__field">
          <div className="demo-intake__field-label">Loan tenor</div>
          <div className="demo-intake__tenors">
            {TENORS.map((months) => (
              <button
                key={months}
                type="button"
                className={`demo-intake__tenor ${tenor === months ? 'is-selected' : ''}`}
                disabled={checking}
                onClick={() => setTenor(months)}
              >
                {months} mo
              </button>
            ))}
          </div>
        </div>

        <div className="card demo-intake__field">
          <div className="demo-intake__field-label">Source of income</div>
          <select
            className="demo-intake__select"
            value={sourceOfIncome}
            disabled={checking}
            onChange={(e) => setSourceOfIncome(e.target.value)}
          >
            {INCOME_SOURCES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          {needsSelfDeclaredIncome && (
            <div className="demo-intake__self-declared">
              <label htmlFor="demo-intake-self-income">Self-declared monthly income ($)</label>
              <input
                id="demo-intake-self-income"
                type="number"
                inputMode="numeric"
                min="0"
                disabled={checking}
                value={selfDeclaredIncome}
                onChange={(e) => setSelfDeclaredIncome(e.target.value)}
                placeholder="e.g. 1200"
              />
            </div>
          )}
        </div>
      </div>

      <div className="demo-intake__cta">
        <label className="demo-intake__terms">
          <input
            type="checkbox"
            checked={termsAgreed}
            disabled={checking}
            onChange={(e) => setTermsAgreed(e.target.checked)}
          />
          <span>
            I agree on the{' '}
            <button type="button" className="demo-intake__terms-link" onClick={() => setShowTerms(true)}>
              T&amp;C
            </button>{' '}
            of Wing Bank
          </span>
        </label>

        <button
          type="button"
          className="btn btn-primary"
          disabled={checking || !termsAgreed || (needsSelfDeclaredIncome && !selfDeclaredIncomeValid)}
          onClick={() => onSubmit({ loanAmount, tenor, sourceOfIncome, selfDeclaredIncome: Number(selfDeclaredIncome) || 0 })}
        >
          {checking ? 'Checking…' : 'Check my eligibility'}
        </button>
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </>
  )
}
