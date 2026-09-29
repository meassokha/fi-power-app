import './DemoRejected.css'

export default function DemoRejected({ onRestart }) {
  return (
    <div className="demo-rejected">
      <div className="demo-rejected__icon">!</div>
      <h1 className="demo-rejected__title">Not eligible right now</h1>
      <p className="demo-rejected__message">
        Sorry, you are not eligible to apply for the loan. Please come back later.
      </p>
      <button type="button" className="btn btn-secondary demo-rejected__restart" onClick={onRestart}>
        Start Over
      </button>
    </div>
  )
}
