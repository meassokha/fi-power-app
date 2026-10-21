import { configure, logout } from '../server/authCore.js'

export default function handler(req, res) {
  configure(process.env)
  const { status, body, cookie } = logout()
  res.setHeader('Set-Cookie', cookie)
  res.status(status).json(body)
}
