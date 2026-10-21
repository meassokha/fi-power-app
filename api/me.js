import { configure, me } from '../server/authCore.js'

export default function handler(req, res) {
  configure(process.env)
  const { status, body } = me(req.headers.cookie)
  res.status(status).json(body)
}
