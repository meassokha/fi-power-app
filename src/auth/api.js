async function request(path, options) {
  const res = await fetch(path, { credentials: 'same-origin', ...options })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
  return data
}

export const fetchSession = () => request('/api/me')

export const login = (email, password) =>
  request('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

export const logout = () => request('/api/logout', { method: 'POST' })
