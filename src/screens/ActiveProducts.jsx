import ScreenHeader from '../components/ScreenHeader'
import { CardsIcon, ChevronRightIcon, LoanIcon } from '../components/icons'
import './ActiveProducts.css'

export default function ActiveProducts({ activeApplications, onBack, onViewLoan, onViewCard }) {
  return (
    <>
      <ScreenHeader title="Active Products" onBack={onBack} />

      <div className="active-products__body">
        {activeApplications.length === 0 ? (
          <p className="active-products__empty">You don&apos;t have any active loans or cards yet.</p>
        ) : (
          activeApplications.map((app) => (
            <button
              key={app.id}
              type="button"
              className="active-products__item"
              onClick={() => (app.type === 'loan' ? onViewLoan(app) : onViewCard(app))}
            >
              <span className="icon-badge">
                {app.type === 'loan' ? <LoanIcon width={16} height={16} /> : <CardsIcon width={16} height={16} />}
              </span>
              <div className="active-products__info">
                <div className="active-products__name">{app.type === 'loan' ? 'Consumer Loan' : 'Dream Card'}</div>
                <div className="active-products__meta">
                  ${app.amount.toLocaleString()}
                  {app.type === 'loan' ? ` · ${app.tenor} mo` : ' limit'} · since {app.disbursementDate}
                </div>
              </div>
              <ChevronRightIcon />
            </button>
          ))
        )}
      </div>
    </>
  )
}
