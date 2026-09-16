import BottomNav from '../components/BottomNav'
import { BellIcon, CardsIcon, ChevronRightIcon, ClockIcon, InfoIcon, LoanIcon } from '../components/icons'
import { monthlyCommitment } from '../utils/applications'
import './FinancialPowerHome.css'

export default function FinancialPowerHome({ customer, activeApplications, onNavigate, onViewLoan }) {
  const initials = customer.name
    .split(' ')
    .map((part) => part[0])
    .join('')

  const usedAmount = activeApplications.reduce((sum, app) => sum + monthlyCommitment(app), 0)
  const remainingAmount = Math.max(customer.financialPower - usedAmount, 0)
  const remainingPct = customer.financialPower > 0 ? Math.min((remainingAmount / customer.financialPower) * 100, 100) : 0

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
        <button type="button" className="fp-home__bell" aria-label="Notifications">
          <BellIcon />
        </button>
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
            <span className="num">${customer.financialPower.toLocaleString()}</span>
            <span className="fp-home__hero-unit">/ month</span>
          </div>
          <p className="fp-home__hero-copy">
            Available capacity for a new Consumer Loan or Dream Card, based on your income and
            current obligations.
          </p>

          <div className="fp-home__hero-usage">
            <div className="fp-home__hero-usage-row">
              <span>Available</span>
              <span className="num">
                ${remainingAmount.toFixed(0)} of ${customer.financialPower}
              </span>
            </div>
            <div className="fp-home__hero-usage-track">
              <div className="fp-home__hero-usage-fill" style={{ width: `${remainingPct}%` }} />
            </div>
          </div>

          <div className="fp-home__hero-updated">
            <ClockIcon />
            <span>Updated today</span>
          </div>
        </div>

        {activeApplications.length > 0 && (
          <div className="fp-home__active">
            <div className="fp-home__active-title">Your active products</div>
            {activeApplications.map((app) => (
              <button
                key={app.id}
                type="button"
                className="fp-home__active-item"
                onClick={() => (app.type === 'loan' ? onViewLoan(app) : onNavigate(app.type))}
              >
                <span className="icon-badge">
                  {app.type === 'loan' ? <LoanIcon width={16} height={16} /> : <CardsIcon width={16} height={16} />}
                </span>
                <div className="fp-home__active-info">
                  <div className="fp-home__active-name">
                    {app.type === 'loan' ? 'Consumer Loan' : 'Dream Card'}
                  </div>
                  <div className="fp-home__active-meta">
                    ${app.amount.toLocaleString()}
                    {app.type === 'loan' ? ` · ${app.tenor} mo` : ' limit'} · since{' '}
                    {app.disbursementDate}
                  </div>
                </div>
                <ChevronRightIcon />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="fp-home__ctas">
        <button type="button" className="btn btn-primary" onClick={() => onNavigate('loan')}>
          Apply for Consumer Loan
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onNavigate('card')}>
          Apply for Dream Card
        </button>
      </div>

      <BottomNav active="home" onNavigate={onNavigate} />
    </>
  )
}
