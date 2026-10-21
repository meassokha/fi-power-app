import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { fetchSession, logout } from './api'
import LoginPage from './LoginPage'

function AuthGate({ children }) {
  // undefined = checking the cookie, null = signed out, object = signed in
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    fetchSession()
      .then(setSession)
      .catch(() => setSession(null))
  }, [])

  async function handleLogout() {
    await logout().catch(() => {})
    setSession(null)
  }

  if (session === undefined) return null

  return (
    <AnimatePresence mode="wait">
      {session ? (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children({ session, onLogout: handleLogout })}
        </motion.div>
      ) : (
        <LoginPage key="login" onAuthenticated={setSession} />
      )}
    </AnimatePresence>
  )
}

export default AuthGate
