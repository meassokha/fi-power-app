import { useState } from 'react'
import TermsModal from '../components/TermsModal'
import './DemoCheck.css'

export default function DemoCheck({ checking, onCheck }) {
  const [showTerms, setShowTerms] = useState(false)

  return (
    <div className="demo-check">
      <div className="demo-check__top">
        <h1 className="demo-check__title">Let&apos;s check my financial power</h1>
      </div>

      <div className="demo-check__center">
        <button type="button" className="demo-check__button" onClick={onCheck} disabled={checking}>
          {checking ? 'Checking…' : 'Check'}
        </button>
      </div>

      {!checking && (
        <div className="demo-check__footer">
          By clicking Check, you agree to the{' '}
          <button type="button" className="demo-check__terms-link" onClick={() => setShowTerms(true)}>
            T&amp;C
          </button>{' '}
          of Wing Bank.
        </div>
      )}

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  )
}
