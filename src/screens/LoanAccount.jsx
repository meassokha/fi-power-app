import { useState } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import { CheckIcon } from '../components/icons'
import {
  computeAmortizationSchedule,
  computeEmi,
  computeLoanScheduleDates,
} from '../utils/loanCalculations'
import './LoanAccount.css'

const SCHEDULE_COLUMNS = '40px 1fr 1fr 1fr 1fr'

export default function LoanAccount({ application, customer, onBack, onPayoff }) {
  const [paidOff, setPaidOff] = useState(false)

  const monthlyInstallment = computeEmi(application.amount, customer.interestRate, application.tenor)
  const totalRepayable = monthlyInstallment * application.tenor
  const schedule = computeAmortizationSchedule(application.amount, customer.interestRate, application.tenor)
  const payoffAmount = application.amount
  const { maturityDate, nextPaymentDate, nextPaymentAmount } = application.disbursementDate
    ? computeLoanScheduleDates(application.disbursementDate, application.tenor, monthlyInstallment)
    : { maturityDate: null, nextPaymentDate: null, nextPaymentAmount: 0 }

  function handlePayoff() {
    onPayoff(application.id)
    setPaidOff(true)
  }

  if (paidOff) {
    return (
      <>
        <ScreenHeader title="Consumer Loan" onBack={onBack} />
        <div className="loan-account__body loan-account__body--centered">
          <div className="loan-account__success">
            <span className="loan-account__success-icon">
              <CheckIcon width={20} height={20} />
            </span>
            <div className="loan-account__success-title">Loan paid off</div>
            <p className="loan-account__success-copy">
              Your ${payoffAmount.toLocaleString()} loan is now closed. Thanks for banking with
              Wing.
            </p>
          </div>
        </div>
        <div className="loan-account__cta">
          <button type="button" className="btn btn-primary" onClick={onBack}>
            Done
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <ScreenHeader title="Consumer Loan" subtitle="Account summary" onBack={onBack} />

      <div className="loan-account__body">
        <div className="card loan-account__summary">
          <div className="loan-account__summary-row">
            <span>Loan amount</span>
            <span className="num loan-account__summary-highlight">${application.amount.toLocaleString()}</span>
          </div>
          <div className="loan-account__summary-row">
            <span>Tenor</span>
            <span className="num">{application.tenor} months</span>
          </div>
          <div className="loan-account__summary-row">
            <span>Monthly installment</span>
            <span className="num">${monthlyInstallment.toFixed(2)}</span>
          </div>
          <div className="loan-account__summary-row">
            <span>Interest rate</span>
            <span className="num">{(customer.interestRate * 100).toFixed(0)}% APR</span>
          </div>
          <div className="loan-account__summary-row">
            <span>Total repayable</span>
            <span className="num">${totalRepayable.toFixed(2)}</span>
          </div>
          <div className="loan-account__divider" />
          <div className="loan-account__summary-row">
            <span>Disbursed on</span>
            <span className="num">{application.disbursementDate ?? '—'}</span>
          </div>
          <div className="loan-account__summary-row">
            <span>Maturity date</span>
            <span className="num">{maturityDate ?? '—'}</span>
          </div>
          <div className="loan-account__divider" />
          <div className="loan-account__summary-row">
            <span>Next payment date</span>
            <span className={`num ${nextPaymentDate ? 'loan-account__next-date' : ''}`}>
              {nextPaymentDate ?? 'Fully repaid'}
            </span>
          </div>
          <div className="loan-account__summary-row">
            <span>Next payment amount</span>
            <span className={`num ${nextPaymentDate ? 'loan-account__next-amount' : 'loan-account__summary-highlight'}`}>
              {nextPaymentDate ? `$${nextPaymentAmount.toFixed(2)}` : '—'}
            </span>
          </div>
        </div>

        <div>
          <div className="loan-account__section-title">Repayment schedule</div>
          <div className="loan-account__schedule">
            <div
              className="data-row data-row--head loan-account__schedule-row"
              style={{ gridTemplateColumns: SCHEDULE_COLUMNS }}
            >
              <span>Mo</span>
              <span className="num-col">Payment</span>
              <span className="num-col">Interest</span>
              <span className="num-col">Principal</span>
              <span className="num-col">Balance</span>
            </div>
            <div className="loan-account__schedule-body">
              {schedule.map((row) => (
                <div
                  key={row.month}
                  className="data-row data-row--body loan-account__schedule-row"
                  style={{ gridTemplateColumns: SCHEDULE_COLUMNS }}
                >
                  <span className="num">{row.month}</span>
                  <span className="num num-col">${monthlyInstallment.toFixed(0)}</span>
                  <span className="num num-col">${row.interest.toFixed(0)}</span>
                  <span className="num num-col">${row.principalPortion.toFixed(0)}</span>
                  <span className="num num-col">${row.closingBalance.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="loan-account__cta">
        <button type="button" className="btn btn-primary" onClick={handlePayoff}>
          Pay Off Loan &mdash; ${payoffAmount.toLocaleString()}
        </button>
      </div>
    </>
  )
}
