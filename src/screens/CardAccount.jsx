import { useState } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import CardVisual from '../components/CardVisual'
import { CheckIcon } from '../components/icons'
import { addMonthsToDate } from '../utils/dates'
import './CardAccount.css'

const CARD_TYPE = 'Visa'
const EXPIRY_YEARS = 5

export default function CardAccount({ application, customer, onBack, onClose }) {
  const [closed, setClosed] = useState(false)

  const expiryDate = application.disbursementDate
    ? addMonthsToDate(application.disbursementDate, EXPIRY_YEARS * 12)
    : null
  const expiryLabel = expiryDate ? `${expiryDate.slice(5, 7)}/${expiryDate.slice(2, 4)}` : '—'

  function handleClose() {
    onClose(application.id)
    setClosed(true)
  }

  if (closed) {
    return (
      <>
        <ScreenHeader title="Dream Card" onBack={onBack} />
        <div className="card-account__body card-account__body--centered">
          <div className="card-account__success">
            <span className="card-account__success-icon">
              <CheckIcon width={20} height={20} />
            </span>
            <div className="card-account__success-title">Card closed</div>
            <p className="card-account__success-copy">
              Your Dream Card with a ${application.amount.toLocaleString()} limit is now closed.
            </p>
          </div>
        </div>
        <div className="card-account__cta">
          <button type="button" className="btn btn-primary" onClick={onBack}>
            Done
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <ScreenHeader title="Dream Card" subtitle="Account summary" onBack={onBack} />

      <div className="card-account__body">
        <CardVisual cardholderName={customer.name} expiry={expiryLabel} />

        <div className="card card-account__summary">
          <div className="card-account__summary-row">
            <span>Card limit</span>
            <span className="num card-account__summary-highlight">${application.amount.toLocaleString()}</span>
          </div>
          <div className="card-account__summary-row">
            <span>Card type</span>
            <span className="num">{CARD_TYPE}</span>
          </div>
          <div className="card-account__divider" />
          <div className="card-account__summary-row">
            <span>Applied on</span>
            <span className="num">{application.disbursementDate ?? '—'}</span>
          </div>
          <div className="card-account__summary-row">
            <span>Expiry date</span>
            <span className="num">{expiryDate ?? '—'}</span>
          </div>
        </div>
      </div>

      <div className="card-account__cta">
        <button type="button" className="btn btn-secondary" onClick={handleClose}>
          Close Card
        </button>
      </div>
    </>
  )
}
