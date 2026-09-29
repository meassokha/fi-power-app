import { useState } from 'react'
import PhoneShell from '../components/PhoneShell'
import CustomerJourney from '../components/CustomerJourney'
import BackendLog from '../components/BackendLog'
import BackendResults from '../components/BackendResults'
import DemoIntake from '../screens/DemoIntake'
import DemoRejected from '../screens/DemoRejected'
import { deriveMinDscr, deriveSegment, withDerivedFields } from '../utils/customerRules'
import './DemoPage.css'

const DEMO_NAMES = ['Vann Bopha', 'Heng Sokha', 'Ly Ratana', 'Meas Sovanna', 'Chhay Dalin', 'Pov Reaksmey']
const NO_INCOME = 'No income'
const SELF_DECLARED_SOURCE = 'Other Bank Merchant'

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Roughly half of demo customers come in with no existing obligation at
// that bank; the rest carry a modest one.
function randomObligation() {
  return Math.random() < 0.5 ? 0 : randomInt(2, 30) * 10
}

function randomSmallObligation() {
  return Math.random() < 0.5 ? 0 : randomInt(1, 2) * 10
}

function randomName() {
  return DEMO_NAMES[randomInt(0, DEMO_NAMES.length - 1)]
}

// A believable, random monthly income spanning all three segments (Mass,
// Upper Mass, Premium) so the demo shows different outcomes each time —
// "ineligible" can land in any segment too, since it's the obligations
// (below) that decide it, not the income level.
function incomeForType(customerType) {
  if (customerType === 'high') return randomInt(200, 500) * 10
  if (customerType === 'low') return randomInt(20, 45) * 10
  return randomInt(30, 320) * 10
}

function obligationsForType(customerType, monthlyIncome) {
  if (customerType === 'ineligible') {
    const minDscr = deriveMinDscr(deriveSegment(monthlyIncome))
    const maxAllowedObligation = monthlyIncome / minDscr
    return {
      obligationWingBank: Math.round(maxAllowedObligation * 0.7),
      obligationOtherBanks: Math.round(maxAllowedObligation * 0.7),
    }
  }
  if (customerType === 'low') {
    return { obligationWingBank: randomSmallObligation(), obligationOtherBanks: randomSmallObligation() }
  }
  return { obligationWingBank: randomObligation(), obligationOtherBanks: randomObligation() }
}

// Other Bank Merchant customers only ever get an Other Banks obligation
// (Wing Bank's own obligation check is skipped entirely for them — see
// buildStepsFor) — so "ineligible" has to load all of the excess into that
// single number instead of splitting it across both banks.
function otherBanksOnlyObligationForType(customerType, monthlyIncome) {
  if (customerType === 'ineligible') {
    const minDscr = deriveMinDscr(deriveSegment(monthlyIncome))
    const maxAllowedObligation = monthlyIncome / minDscr
    return Math.round(maxAllowedObligation * 1.4)
  }
  if (customerType === 'low') return randomSmallObligation()
  return randomObligation()
}

function buildProfile(customerType) {
  const monthlyIncome = incomeForType(customerType)
  return { monthlyIncome, ...obligationsForType(customerType, monthlyIncome) }
}

function buildSelfDeclaredProfile(customerType, selfDeclaredIncome) {
  const monthlyIncome = Math.max(Math.round(Number(selfDeclaredIncome) || 0), 0)
  return {
    monthlyIncome,
    obligationWingBank: 0,
    obligationOtherBanks: otherBanksOnlyObligationForType(customerType, monthlyIncome),
  }
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

// Which backend steps run depends on the source of income — Wing/Other Bank
// Payroll (and Rental) still start with a real Yes/No the operator answers;
// merchant sources skip straight to what Wing Bank can actually check for
// them, per the underwriting rules for each.
function buildStepsFor(sourceOfIncome) {
  if (sourceOfIncome === 'Wing Bank Merchant') {
    return [
      { id: 'transaction', label: 'Checking average last 6 months transaction volume…' },
      { id: 'wing-obligation', label: 'Checking Wing Bank monthly installment obligations…' },
      { id: 'cbc', label: "Checking CBC for other banks' monthly installment obligations…" },
      { id: 'calculating', label: 'Calculating Financial Power…' },
    ]
  }
  if (sourceOfIncome === SELF_DECLARED_SOURCE) {
    return [
      { id: 'cbc', label: "Checking CBC for other banks' monthly installment obligations…" },
      { id: 'calculating', label: 'Calculating Financial Power…' },
    ]
  }
  return buildFirstStep()
}

// The results panel mirrors whichever steps actually ran (minus the final
// "calculating" step, which triggers the full calculation block instead).
function buildResultItems(sourceOfIncome, profile, isWingPayroll) {
  if (!profile) return []
  if (sourceOfIncome === 'Wing Bank Merchant') {
    return [
      `Last 6-month average transaction: $${profile.monthlyIncome.toLocaleString()}`,
      `Wing Bank monthly installment obligation: $${profile.obligationWingBank.toLocaleString()}`,
      `Other Bank monthly installment obligation: $${profile.obligationOtherBanks.toLocaleString()}`,
    ]
  }
  if (sourceOfIncome === SELF_DECLARED_SOURCE) {
    return [`Other Bank monthly installment obligation: $${profile.obligationOtherBanks.toLocaleString()}`]
  }
  return [
    isWingPayroll ? 'Customer is a Wing Bank Payroll Customer' : 'Customer is not a Wing Bank Payroll Customer',
    `Last 6-month average salary: $${profile.monthlyIncome.toLocaleString()}`,
    `Wing Bank monthly installment obligation: $${profile.obligationWingBank.toLocaleString()}`,
    `Other Bank monthly installment obligation: $${profile.obligationOtherBanks.toLocaleString()}`,
  ]
}

// Merchant sources are self-explanatory (no verification question to
// second-guess); Wing/Other Payroll still defer to the operator's own
// Yes/No answer over whatever the customer picked in the intake form.
function resolveSourceOfIncome(intakeSourceOfIncome, isWingPayroll) {
  if (intakeSourceOfIncome === 'Wing Bank Merchant') return 'Wing Bank Merchant'
  if (intakeSourceOfIncome === SELF_DECLARED_SOURCE) return SELF_DECLARED_SOURCE
  return isWingPayroll ? 'Wing Payroll' : 'Valida'
}

export default function DemoPage({ customerType, applications, settings, products, onCreateDemoCustomer, onApply, onCloseApplication }) {
  const [step, setStep] = useState('intake') // 'intake' | 'result' | 'rejected'
  const [intakeSourceOfIncome, setIntakeSourceOfIncome] = useState(null)
  const [demoCustomer, setDemoCustomer] = useState(null)
  const [checking, setChecking] = useState(false)
  const [backendSteps, setBackendSteps] = useState([])
  const [visibleCount, setVisibleCount] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [profile, setProfile] = useState(null)
  const [isWingPayroll, setIsWingPayroll] = useState(null)

  function handleIntakeSubmit(fields) {
    if (fields.sourceOfIncome === NO_INCOME) {
      setStep('rejected')
      return
    }

    setIntakeSourceOfIncome(fields.sourceOfIncome)

    // Decided up front so the backend log's later steps are just revealing
    // (in order) facts that were already "found", not re-rolling them.
    setProfile(
      fields.sourceOfIncome === SELF_DECLARED_SOURCE
        ? buildSelfDeclaredProfile(customerType, fields.selfDeclaredIncome)
        : buildProfile(customerType),
    )
    setIsWingPayroll(null)
    setBackendSteps(buildStepsFor(fields.sourceOfIncome))
    setVisibleCount(1)
    setCompleted(false)
    setChecking(true)
  }

  // The first check is a real Yes/No decision the operator makes — the rest
  // of the backend steps depend on it, so they're only built once answered.
  // (Only reached for sources whose first step is actually the question.)
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

    if (!withDerivedFields(profile).isEligible) {
      setStep('rejected')
      return
    }

    const customer = onCreateDemoCustomer({
      name: randomName(),
      monthlyIncome: profile.monthlyIncome,
      obligationWingBank: profile.obligationWingBank,
      obligationOtherBanks: profile.obligationOtherBanks,
      sourceOfIncome: resolveSourceOfIncome(intakeSourceOfIncome, isWingPayroll),
    })
    setDemoCustomer(customer)
    setStep('result')
  }

  function handleRestart() {
    setStep('intake')
    setIntakeSourceOfIncome(null)
    setDemoCustomer(null)
    setChecking(false)
    setBackendSteps([])
    setVisibleCount(0)
    setCompleted(false)
    setProfile(null)
    setIsWingPayroll(null)
  }

  const resultItems = buildResultItems(intakeSourceOfIncome, profile, isWingPayroll)
  // One result unlocks per completed step (minus the final "calculating"
  // step, which reveals the full calculation block instead).
  const revealedCount = completed ? resultItems.length : Math.max(visibleCount - 1, 0)

  return (
    <div className="demo-page">
      <div className="demo-page__row">
        <div className="demo-page__phone">
          <PhoneShell>
            {step === 'intake' && <DemoIntake settings={settings} checking={checking} onSubmit={handleIntakeSubmit} />}
            {step === 'rejected' && <DemoRejected onRestart={handleRestart} />}
            {step === 'result' && demoCustomer && (
              <CustomerJourney
                customerRaw={demoCustomer}
                applications={applications}
                settings={settings}
                products={products}
                onApply={(type, fields) => onApply(demoCustomer.id, demoCustomer.name, type, fields)}
                onCloseApplication={onCloseApplication}
              />
            )}
          </PhoneShell>
        </div>

        <div className="demo-page__backend-slot">
          {checking && (
            <BackendLog
              steps={backendSteps}
              visibleCount={visibleCount}
              completed={completed}
              onAdvance={handleAdvanceBackend}
              onAnswer={handleAnswerPayroll}
            />
          )}
        </div>

        <div className="demo-page__backend-slot">
          {checking && <BackendResults profile={profile} items={resultItems} revealedCount={revealedCount} completed={completed} />}
        </div>
      </div>
    </div>
  )
}
