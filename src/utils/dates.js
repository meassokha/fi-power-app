// Local-calendar-date helpers. Deliberately avoid Date#toISOString() here —
// it converts to UTC, which silently shifts the date backward for anyone in
// a positive UTC offset (e.g. Asia/Bangkok, UTC+7) during local early-morning
// hours or when constructing a date from a "YYYY-MM-DD" string at midnight.
export function toLocalIsoDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayIsoDate() {
  return toLocalIsoDate(new Date())
}

export function addMonthsToDate(isoDate, months) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setMonth(date.getMonth() + months)
  return toLocalIsoDate(date)
}

export function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
