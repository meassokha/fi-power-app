import { configure, login } from '../server/authCore.js'

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  configure(process.env)
  const { status, body, cookie } = login(req.body || {})
  if (cookie) res.setHeader('Set-Cookie', cookie)
  res.status(status).json(body)
}
