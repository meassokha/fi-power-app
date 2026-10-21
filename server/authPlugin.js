import { configure, login, logout, me } from './authCore.js'

// Dev/preview adapter: serves the same handlers Vercel runs from /api.
function send(res, { status, body, cookie }) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  if (cookie) res.setHeader('Set-Cookie', cookie)
  res.end(JSON.stringify(body))
}

function readJson(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 10_000) req.destroy()
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw))
      } catch {
        resolve({})
      }
    })
  })
}

async function handler(req, res, next) {
  const url = (req.url || '').split('?')[0]
  if (!url.startsWith('/api/')) return next()

  if (url === '/api/login' && req.method === 'POST') return send(res, login(await readJson(req)))
  if (url === '/api/me' && req.method === 'GET') return send(res, me(req.headers.cookie))
  if (url === '/api/logout' && req.method === 'POST') return send(res, logout())
  return send(res, { status: 404, body: { error: 'Not found' } })
}

export default function authPlugin(env) {
  configure(env)
  return {
    name: 'finance-power-auth',
    // Braces matter: a returned function would be run by Vite as a post hook.
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}
