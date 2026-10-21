import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

// Stateless JWT (HS256) auth — no database. Credentials live in environment
// variables (see .env.example): AUTH_SECRET and AUTH_USERS ("username:password,...").
const COOKIE = 'fp_session'
const TTL_SECONDS = 60 * 60 * 8
const SALT = randomBytes(16)

let SECRET = ''
let USERS = []
let SECURE = ''

export function configure(env) {
  if (!env.AUTH_SECRET || !env.AUTH_USERS) {
    throw new Error('Missing AUTH_SECRET or AUTH_USERS. Copy .env.example to .env and set them.')
  }
  SECRET = env.AUTH_SECRET
  SECURE = env.VERCEL ? '; Secure' : ''
  USERS = env.AUTH_USERS.split(',').map((entry) => {
    const idx = entry.indexOf(':')
    const email = entry.slice(0, idx).trim().toLowerCase()
    return { email, hash: scryptSync(entry.slice(idx + 1), SALT, 32) }
  })
}

const b64 = (input) => Buffer.from(input).toString('base64url')
const sign = (data) => createHmac('sha256', SECRET).update(data).digest('base64url')

function issueToken(email) {
  const now = Math.floor(Date.now() / 1000)
  const head = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64(JSON.stringify({ sub: email, iat: now, exp: now + TTL_SECONDS }))
  return `${head}.${body}.${sign(`${head}.${body}`)}`
}

function verifyToken(token) {
  const parts = String(token || '').split('.')
  if (parts.length !== 3) return null
  const expected = Buffer.from(sign(`${parts[0]}.${parts[1]}`))
  const actual = Buffer.from(parts[2])
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
    return payload.exp > Math.floor(Date.now() / 1000) ? payload : null
  } catch {
    return null
  }
}

function readCookie(cookieHeader) {
  const match = (cookieHeader || '').match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`))
  return match ? match[1] : null
}

export function login({ email = '', password = '' }) {
  const user = USERS.find((u) => u.email === String(email).trim().toLowerCase())
  // Always hash before comparing so response time doesn't reveal valid usernames.
  const candidate = scryptSync(String(password), SALT, 32)
  if (!user || !timingSafeEqual(user.hash, candidate)) {
    return { status: 401, body: { error: 'Invalid email or password.' } }
  }
  const cookie = `${COOKIE}=${issueToken(user.email)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${TTL_SECONDS}${SECURE}`
  return { status: 200, body: { email: user.email }, cookie }
}

export function me(cookieHeader) {
  const payload = verifyToken(readCookie(cookieHeader))
  return payload
    ? { status: 200, body: { email: payload.sub } }
    : { status: 401, body: { error: 'Unauthenticated' } }
}

export function logout() {
  return { status: 200, body: { ok: true }, cookie: `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${SECURE}` }
}
