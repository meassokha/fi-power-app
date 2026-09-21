import './BackendLog.css'

export default function BackendLog({ steps, visibleCount, completed, onAdvance, onAnswer }) {
  const activeStep = steps[visibleCount - 1]
  const isLastStep = visibleCount >= steps.length
  const isQuestion = !completed && Boolean(activeStep?.question)

  return (
    <div className="backend-log">
      <div className="backend-log__header">
        <span className="backend-log__dot" />
        <span>Backend Activity</span>
      </div>

      <ol className="backend-log__list">
        {steps.slice(0, visibleCount).map((step, i) => {
          const isLastVisible = i === visibleCount - 1
          const isActive = isLastVisible && !completed
          const isDone = i < visibleCount - 1 || (isLastVisible && completed)
          return (
            <li key={step.id} className={`backend-log__item ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''}`}>
              {step.label}
            </li>
          )
        })}
      </ol>

      {completed ? (
        <div className="backend-log__complete">All checks complete</div>
      ) : isQuestion ? (
        <div className="backend-log__answer">
          <button type="button" className="backend-log__answer-btn is-yes" onClick={() => onAnswer(true)}>
            Yes
          </button>
          <button type="button" className="backend-log__answer-btn is-no" onClick={() => onAnswer(false)}>
            No
          </button>
        </div>
      ) : (
        <button type="button" className="backend-log__next" onClick={onAdvance}>
          {isLastStep ? 'View Financial Power' : 'Continue'}
        </button>
      )}
    </div>
  )
}
