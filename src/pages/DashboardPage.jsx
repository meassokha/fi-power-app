import { useMemo, useState } from 'react'
import { withDerivedFields } from '../utils/customerRules'
import { resolveLoanProductName } from '../utils/loanProducts'
import { isOutstanding } from '../utils/applications'
import { addDaysToDate, todayIsoDate } from '../utils/dates'
import './DashboardPage.css'

const RANGE_OPTIONS = [
  { key: 7, label: '7 days' },
  { key: 30, label: '30 days' },
  { key: 90, label: '90 days' },
]

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatShortDate(isoDate) {
  const [, m, d] = isoDate.split('-').map(Number)
  return `${SHORT_MONTHS[m - 1]} ${d}`
}

function formatCount(n) {
  return n.toLocaleString()
}

function formatMoney(n) {
  return `$${Math.round(n).toLocaleString()}`
}

// One bucket per calendar day across the whole range (not just days that had
// activity), so the chart's x-axis is continuous even in a quiet session.
function buildDailyBuckets(applications, type, rangeDays, valueFn) {
  const today = todayIsoDate()
  const buckets = []
  for (let i = rangeDays - 1; i >= 0; i -= 1) {
    buckets.push({ date: addDaysToDate(today, -i), value: 0 })
  }
  const byDate = new Map(buckets.map((b) => [b.date, b]))
  applications
    .filter((a) => a.type === type)
    .forEach((a) => {
      const bucket = byDate.get(a.disbursementDate)
      if (bucket) bucket.value += valueFn(a)
    })
  return buckets
}

function topCustomersByExposure(applications, customers, limit) {
  const byCustomer = new Map()
  applications
    .filter((a) => isOutstanding(a.status))
    .forEach((a) => byCustomer.set(a.customerId, (byCustomer.get(a.customerId) ?? 0) + a.amount))

  return [...byCustomer.entries()]
    .map(([customerId, value]) => ({
      label: customers.find((c) => c.id === customerId)?.name ?? customerId,
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

function applicationsByProduct(applications, customers, products) {
  const counts = new Map()
  applications
    .filter((a) => a.type === 'loan')
    .forEach((a) => {
      const customer = customers.find((c) => c.id === a.customerId)
      const name = resolveLoanProductName(customer?.sourceOfIncome, products)
      counts.set(name, (counts.get(name) ?? 0) + 1)
    })
  return [...counts.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}

function TrendChart({ title, points, formatValue, emptyMax = 1 }) {
  const width = 520
  const height = 180
  const padding = { top: 16, right: 12, bottom: 26, left: 52 }
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom

  const maxValue = Math.max(...points.map((p) => p.value), emptyMax)
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0
  const coords = points.map((p, i) => ({
    ...p,
    x: padding.left + i * stepX,
    y: padding.top + innerH - (p.value / maxValue) * innerH,
  }))

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
  const baseline = padding.top + innerH
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${baseline} L ${coords[0].x.toFixed(1)} ${baseline} Z`

  // Round to whole units so a quiet chart (maxValue's fallback of 1) can't
  // produce duplicate tick values, e.g. [0, 0.5, 1] rounding to [0, 1, 1].
  const yTicks = [...new Set([0, 0.5, 1].map((f) => Math.round(maxValue * f)))]
  const last = coords[coords.length - 1]
  const xLabelIdx = [0, Math.floor((coords.length - 1) / 2), coords.length - 1]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="dash-chart__svg" role="img" aria-label={title}>
      {yTicks.map((t, i) => {
        const y = padding.top + innerH - (t / maxValue) * innerH
        return (
          <g key={i}>
            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="dash-chart__grid" />
            <text x={padding.left - 8} y={y} className="dash-chart__axis-label" textAnchor="end" dominantBaseline="middle">
              {formatValue(t)}
            </text>
          </g>
        )
      })}

      <path d={areaPath} className="dash-chart__area" />
      <path d={linePath} className="dash-chart__line" />

      {coords.map((c, i) => (
        <circle key={c.date} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 4.5 : 3} className="dash-chart__dot">
          <title>{`${c.date}: ${formatValue(c.value)}`}</title>
        </circle>
      ))}

      <text x={last.x} y={Math.max(last.y - 10, 10)} className="dash-chart__end-label" textAnchor="end">
        {formatValue(last.value)}
      </text>

      {xLabelIdx.map((idx, i) => (
        <text
          key={idx}
          x={coords[idx].x}
          y={height - 6}
          className="dash-chart__axis-label"
          textAnchor={i === 0 ? 'start' : i === xLabelIdx.length - 1 ? 'end' : 'middle'}
        >
          {formatShortDate(coords[idx].date)}
        </text>
      ))}
    </svg>
  )
}

function RankedBars({ rows, formatValue, emptyLabel }) {
  if (rows.length === 0) {
    return <p className="dash-bars__empty">{emptyLabel}</p>
  }
  const maxValue = Math.max(...rows.map((r) => r.value), 1)
  return (
    <div className="dash-bars">
      {rows.map((r) => (
        <div key={r.label} className="dash-bars__row">
          <span className="dash-bars__label">{r.label}</span>
          <div className="dash-bars__track">
            <div className="dash-bars__fill" style={{ width: `${Math.max((r.value / maxValue) * 100, 3)}%` }} />
          </div>
          <span className="num dash-bars__value">{formatValue(r.value)}</span>
        </div>
      ))}
    </div>
  )
}

function LiveBadge() {
  return (
    <span className="dash-live">
      <span className="dash-live__dot" />
      Live
    </span>
  )
}

export default function DashboardPage({ customers, applications, products, settings }) {
  const [rangeDays, setRangeDays] = useState(30)

  const derivedCustomers = useMemo(() => customers.map((c) => withDerivedFields(c)), [customers])

  const loanApps = useMemo(() => applications.filter((a) => a.type === 'loan'), [applications])
  const cardApps = useMemo(() => applications.filter((a) => a.type === 'card'), [applications])
  // "Active" here means outstanding — overdue loans are still active, just
  // behind on payment, and still count as real exposure (see isOutstanding).
  const activeLoanApps = loanApps.filter((a) => isOutstanding(a.status))
  const closedLoanApps = loanApps.filter((a) => a.status === 'closed')
  const activeCardApps = cardApps.filter((a) => isOutstanding(a.status))

  const rangeStart = addDaysToDate(todayIsoDate(), -(rangeDays - 1))
  const newLoans = loanApps.filter((a) => a.disbursementDate >= rangeStart).length
  const newCards = cardApps.filter((a) => a.disbursementDate >= rangeStart).length

  // "Disbursed"/"Issued" means money actually went out — excludes pending
  // applications, which haven't disbursed yet (disbursementDate is null).
  const totalDisbursed = loanApps.filter((a) => a.status !== 'pending').reduce((sum, a) => sum + a.amount, 0)
  const totalCardLimitIssued = cardApps.filter((a) => a.status !== 'pending').reduce((sum, a) => sum + a.amount, 0)
  const totalActiveExposure = applications.filter((a) => isOutstanding(a.status)).reduce((sum, a) => sum + a.amount, 0)
  const loansRepaidValue = closedLoanApps.reduce((sum, a) => sum + a.amount, 0)
  const zeroFinancialPowerCount = derivedCustomers.filter((c) => c.financialPower <= 0).length
  const activeCreditProducts =
    (settings.loanActive ? 1 : 0) + (settings.cardActive ? 1 : 0) + products.filter((p) => p.active).length

  const stats = [
    { label: 'New Loans', value: formatCount(newLoans) },
    { label: 'Active Loans', value: formatCount(activeLoanApps.length) },
    { label: 'Closed Loans', value: formatCount(closedLoanApps.length) },
    { label: 'Total Disbursed', value: formatMoney(totalDisbursed) },
    { label: 'New Cards', value: formatCount(newCards) },
    { label: 'Active Cards', value: formatCount(activeCardApps.length) },
    { label: 'Total Card Limit Issued', value: formatMoney(totalCardLimitIssued) },
    { label: 'Total Active Exposure', value: formatMoney(totalActiveExposure) },
    { label: 'Whitelisted Customers', value: formatCount(customers.length) },
    { label: '$0 Financial Power Customers', value: formatCount(zeroFinancialPowerCount) },
    { label: 'Loans Repaid (Value)', value: formatMoney(loansRepaidValue) },
    { label: 'Active Credit Products', value: formatCount(activeCreditProducts) },
  ]

  const newLoansTrend = buildDailyBuckets(applications, 'loan', rangeDays, () => 1)
  const disbursementTrend = buildDailyBuckets(applications, 'loan', rangeDays, (a) => a.amount)
  const topCustomers = topCustomersByExposure(applications, customers, 6)
  const byProduct = applicationsByProduct(applications, customers, products)

  return (
    <div className="dashboard">
      <div className="dashboard__intro">
        <h1 className="dashboard__title">Dashboard</h1>
        <p className="dashboard__subtitle">
          A live snapshot of loans, cards, and the whitelist, recalculated from this session&apos;s data.
        </p>
      </div>

      <div className="dashboard__stats">
        {stats.map((s) => (
          <div key={s.label} className="dash-stat">
            <div className="dash-stat__label">{s.label}</div>
            <div className="num dash-stat__value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="dashboard__range">
        <span className="dashboard__range-label">Trend range:</span>
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className={`dashboard__range-btn ${rangeDays === opt.key ? 'is-selected' : ''}`}
            onClick={() => setRangeDays(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="dashboard__grid">
        <div className="card dash-panel">
          <div className="dash-panel__header">
            <span className="dash-panel__title">New Loans</span>
            <LiveBadge />
          </div>
          <TrendChart title="New Loans" points={newLoansTrend} formatValue={formatCount} emptyMax={5} />
        </div>

        <div className="card dash-panel">
          <div className="dash-panel__header">
            <span className="dash-panel__title">Loan Disbursements</span>
            <LiveBadge />
          </div>
          <TrendChart title="Loan Disbursements" points={disbursementTrend} formatValue={formatMoney} emptyMax={1000} />
        </div>

        <div className="card dash-panel">
          <div className="dash-panel__header">
            <span className="dash-panel__title">Top Customers by Exposure</span>
            <LiveBadge />
          </div>
          <RankedBars rows={topCustomers} formatValue={formatMoney} emptyLabel="No active loans or cards yet." />
        </div>

        <div className="card dash-panel">
          <div className="dash-panel__header">
            <span className="dash-panel__title">Loan Applications by Product</span>
            <LiveBadge />
          </div>
          <RankedBars rows={byProduct} formatValue={formatCount} emptyLabel="No loan applications yet." />
        </div>
      </div>
    </div>
  )
}
