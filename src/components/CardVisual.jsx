import './CardVisual.css'

export default function CardVisual({ cardholderName, tierLabel = 'Dream Card', last4 = '4821', expiry }) {
  return (
    <div className="card-visual">
      <div className="card-visual__glow" />
      <div className="card-visual__top">
        <span className="card-visual__wordmark">WING</span>
        <span className="pill card-visual__tier-pill">{tierLabel}</span>
      </div>
      <div className="num card-visual__number">
        &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; {last4}
      </div>
      <div className="card-visual__bottom">
        <span>{cardholderName.toUpperCase()}</span>
        <span className="num">{expiry}</span>
      </div>
    </div>
  )
}
