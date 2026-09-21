import { useState } from 'react'
import PhoneShell from '../components/PhoneShell'
import CustomerJourney from '../components/CustomerJourney'
import BackendLog from '../components/BackendLog'
import BackendResults from '../components/BackendResults'
import DemoIntake from '../screens/DemoIntake'
import DemoCheck from '../screens/DemoCheck'
import './DemoPage.css'

const DEMO_NAMES = ['Vann Bopha', 'Heng Sokha', 'Ly Ratana', 'Meas Sovanna', 'Chhay Dalin', 'Pov Reaksmey']

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// A believable, random monthly income spanning all three segments (Mass,
// Upper Mass, Premium) so the demo shows different outcomes each time.
function randomMonthlyIncome() {
  return randomInt(30, 320) * 10
}

// Roughly half of demo customers come in with no existing obligation at
// that bank; the rest carry a modest one.
function randomObligation() {
  return Math.random() < 0.5 ? 0 : randomInt(2, 30) * 10
}

function randomName() {
  return DEMO_NAMES[randomInt(0, DEMO_NAMES.length - 1)]
}

function buildFirstStep() {
  return [{ id: 'payroll', label: 'Checking if customer is a Wing Bank Payroll customer?', question: true }]
}

function buildRemainingSteps(isWingPayroll) {
  return [
    isWingPayroll
      ? { id: 'wing-salary', label: 'Wing Payroll customer — verifying average salary over the last 6 months…' }
      : {
          id: 'valida-salary',
          label: 'Not a Wing Payroll customer — checking Valida for average salary over the last 6 months…',
        },
    { id: 'wing-obligation', label: 'Checking Wing Bank monthly installment obligations…' },
    { id: 'cbc', label: "Checking CBC for other banks' monthly installment obligations…" },
    { id: 'calculating', label: 'Calculating Financial Power…' },
  ]
}

export default function DemoPage({ applications, settings, onCreateDemoCustomer, onApply, onCloseApplication }) {
  const [step, setStep] = useState('intake') // 'intake' | 'check' | 'result'
  const [intake, setIntake] = useState(null)
  const [demoCustomer, setDemoCustomer] = useState(null)
  const [checking, setChecking] = useState(false)
  const [backendSteps, setBackendSteps] = useState([])
  const [visibleCount, setVisibleCount] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [profile, setProfile] = useState(null)
  const [isWingPayroll, setIsWingPayroll] = useState(null)

  function handleIntakeNext(fields) {
    setIntake(fields)
    setStep('check')
  }

  function handleCheckClick() {
    // Decided up front so the backend log's later steps are just revealing
    // (in order) facts that were already "found", not re-rolling them.
    setProfile({
      monthlyIncome: randomMonthlyIncome(),
      obligationWingBank: randomObligation(),
      obligationOtherBanks: randomObligation(),
    })
    setIsWingPayroll(null)
    setBackendSteps(buildFirstStep())
    setVisibleCount(1)
    setCompleted(false)
    setChecking(true)
  }

  // The first check is a real Yes/No decision the operator makes — the rest
  // of the backend steps depend on it, so they're only built once answered.
  function handleAnswerPayroll(answer) {
    setIsWingPayroll(answer)
    setBackendSteps((prev) => [...prev, ...buildRemainingSteps(answer)])
    setVisibleCount(2)
  }

  // Each backend step waits for the operator to click through it — the
  // customer's phone just shows "Checking…" the whole time.
  function handleAdvanceBackend() {
    if (visibleCount < backendSteps.length) {
      setVisibleCount((c) => c + 1)
      return
    }

    setCompleted(true)
    const customer = onCreateDemoCustomer({
      name: randomName(),
      monthlyIncome: profile.monthlyIncome,
      obligationWingBank: profile.obligationWingBank,
      obligationOtherBanks: profile.obligationOtherBanks,
      sourceOfIncome: intake?.sourceOfIncome ?? 'Salary Income',
    })
    setDemoCustomer(customer)
    setStep('result')
  }

  // One result unlocks per completed step: the Yes/No answer, then salary,
  // then each obligation, then the full calculation once everything's done.
  const revealedCount = completed ? 5 : Math.max(visibleCount - 1, 0)

  return (
    <div className="demo-page">
      <div className="demo-page__phone">
        <PhoneShell>
          {step === 'intake' && <DemoIntake settings={settings} onNext={handleIntakeNext} />}
          {step === 'check' && <DemoCheck checking={checking} onCheck={handleCheckClick} />}
          {step === 'result' && demoCustomer && (
            <CustomerJourney
              customerRaw={demoCustomer}
              applications={applications}
              settings={settings}
              onApply={(type, fields) => onApply(demoCustomer.id, demoCustomer.name, type, fields)}
              onCloseApplication={onCloseApplication}
            />
          )}
        </PhoneShell>
      </div>

      {checking && (
        <BackendLog
          steps={backendSteps}
          visibleCount={visibleCount}
          completed={completed}
          onAdvance={handleAdvanceBackend}
          onAnswer={handleAnswerPayroll}
        />
      )}

      {checking && <BackendResults profile={profile} isWingPayroll={isWingPayroll} revealedCount={revealedCount} />}
    </div>
  )
}
