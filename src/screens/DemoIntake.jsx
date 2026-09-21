import { useState } from 'react'
import { MIN_LOAN_AMOUNT } from '../utils/loanCalculations'
import './DemoIntake.css'

const TENORS = [6, 12, 24, 36]
const INCOME_SOURCES = ['Salary Income', 'Business Income', 'Rental Income']

export default function DemoIntake({ settings, onNext }) {
  const maxLoan = settings.maxLoanLimit
  const [loanAmount, setLoanAmount] = useState(Math.round((maxLoan + MIN_LOAN_AMOUNT) / 2 / 10) * 10)
  const [tenor, setTenor] = useState(36)
  const [sourceOfIncome, setSourceOfIncome] = useState(INCOME_SOURCES[0])

  const sliderPct = ((loanAmount - MIN_LOAN_AMOUNT) / Math.max(maxLoan - MIN_LOAN_AMOUNT, 1)) * 100

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
          <div className="demo-intake__field-label">Loan amount</div>
          <div className="num demo-intake__amount">${loanAmount.toLocaleString()}</div>
          <input
            type="range"
            className="range-input"
            min={MIN_LOAN_AMOUNT}
            max={maxLoan}
            step={10}
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            style={{ '--fill': `${sliderPct}%` }}
          />
          <div className="demo-intake__range-labels">
            <span className="num">${MIN_LOAN_AMOUNT.toLocaleString()}</span>
            <span className="num">${maxLoan.toLocaleString()}</span>
          </div>
        </div>

        <div className="card demo-intake__field">
          <div className="demo-intake__field-label">Loan tenor</div>
          <div className="demo-intake__tenors">
            {TENORS.map((months) => (
              <button
                key={months}
                type="button"
                className={`demo-intake__tenor ${tenor === months ? 'is-selected' : ''}`}
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
            onChange={(e) => setSourceOfIncome(e.target.value)}
          >
            {INCOME_SOURCES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="demo-intake__cta">
        <button type="button" className="btn btn-primary" onClick={() => onNext({ loanAmount, tenor, sourceOfIncome })}>
          Next
        </button>
      </div>
    </>
  )
}
