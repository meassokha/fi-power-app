export function nextUserId(users) {
  const numbers = users
    .map((u) => parseInt(u.id.split('-')[1], 10))
    .filter((n) => !Number.isNaN(n))
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1
  return `USR-${String(next).padStart(3, '0')}`
}
