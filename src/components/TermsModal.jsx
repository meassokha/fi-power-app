import { CloseIcon } from './icons'
import './TermsModal.css'

export default function TermsModal({ onClose }) {
  return (
    <div className="terms-modal__overlay" onClick={onClose}>
      <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
        <div className="terms-modal__header">
          <span>Terms &amp; Conditions</span>
          <button type="button" className="terms-modal__close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="terms-modal__body">
          <p className="terms-modal__disclaimer">
            Sample terms for this demo only — not a real Wing Bank agreement.
          </p>

          <h3>1. Eligibility &amp; Credit Check</h3>
          <p>
            By continuing, you authorize Wing Bank to review the income and identity details you
            provide and to check them against your existing accounts to estimate your Financial
            Power.
          </p>

          <h3>2. Indicative Results</h3>
          <p>
            The Financial Power, loan limit, and card limit shown are indicative only, calculated
            from the information you provided. Final approval may differ after full verification.
          </p>

          <h3>3. Interest &amp; Fees</h3>
          <p>
            Interest rates, processing fees, and optional Payment Protection Insurance premiums
            are disclosed before you confirm any application and may change based on your
            approved terms.
          </p>

          <h3>4. Repayment Obligations</h3>
          <p>
            Any loan or card you activate must be repaid according to the schedule shown at
            application. Missed payments may affect your future Financial Power.
          </p>

          <h3>5. Data &amp; Privacy</h3>
          <p>
            Information you submit is used only to assess this application and manage your
            account, in line with Wing Bank&apos;s privacy policy.
          </p>

          <h3>6. Right to Decline</h3>
          <p>
            Wing Bank may decline or adjust any application at its discretion, even where an
            indicative limit was previously shown.
          </p>
        </div>
      </div>
    </div>
  )
}
