import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { login } from './api'
import './LoginPage.css'

const ease = [0.22, 1, 0.36, 1]

const card = {
  hidden: { opacity: 0, y: 40, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease, staggerChildren: 0.09, delayChildren: 0.25 },
  },
  exit: { opacity: 0, y: -30, scale: 1.04, filter: 'blur(8px)', transition: { duration: 0.6, delay: 2.1, ease } },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
  // Keep children visible while the card waits out its exit delay (shows the check).
  exit: { opacity: 1, y: 0 },
}

const orbs = [
  { className: 'login__orb--blue', x: [0, 60, -30, 0], y: [0, -50, 40, 0], duration: 18 },
  { className: 'login__orb--teal', x: [0, -70, 30, 0], y: [0, 60, -40, 0], duration: 22 },
  { className: 'login__orb--violet', x: [0, 40, -60, 0], y: [0, 70, -20, 0], duration: 26 },
]

function LoginPage({ onAuthenticated }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return
    setError('')
    setIsSubmitting(true)
    try {
      const session = await login(email, password)
      setIsSuccess(true)
      setTimeout(() => onAuthenticated(session), 2800)
    } catch (err) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login">
      {orbs.map((orb) => (
        <motion.div
          key={orb.className}
          className={`login__orb ${orb.className}`}
          animate={{ x: orb.x, y: orb.y }}
          transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <motion.form
        className="login__card"
        variants={card}
        initial="hidden"
        animate={isSuccess ? 'exit' : 'show'}
        onSubmit={handleSubmit}
        noValidate
      >
        <motion.div className="login__logo" variants={item}>
          <AnimatePresence mode="wait" initial={false}>
            {isSuccess ? (
              <motion.span
                key="check"
                className="login__logo-mark is-success"
                initial={{ scale: 0.4, rotate: -90, opacity: 0 }}
                animate={{ scale: [0.4, 1.15, 1], rotate: 0, opacity: 1 }}
                transition={{ duration: 0.9, ease }}
              >
                <motion.span
                  className="login__ring"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.7, opacity: 0 }}
                  transition={{ duration: 1.4, delay: 0.8, ease: 'easeOut' }}
                />
                <svg className="login__check" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <motion.path
                    d="M5.5 12.8l4.2 4.2L18.5 7.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.7, ease }}
                  />
                </svg>
              </motion.span>
            ) : (
              <motion.span
                key="logo"
                className="login__logo-mark"
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.2 } }}
              >
                FP
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.h1 className="login__title" variants={item}>Welcome back</motion.h1>
        <motion.p className="login__subtitle" variants={item}>Sign in to Financial Power</motion.p>

        <motion.label className="login__field" variants={item}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="username"
            required
          />
        </motion.label>

        <motion.label className="login__field" variants={item}>
          <span>Password</span>
          <div className="login__password">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="login__toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </motion.label>

        <AnimatePresence initial={false}>
          {error && (
            <motion.div
              key={error}
              className="login__error"
              role="alert"
              initial={{ opacity: 0, height: 0, x: 0 }}
              animate={{ opacity: 1, height: 'auto', x: [0, -8, 8, -6, 6, 0] }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          className={`login__submit ${isSuccess ? 'is-success' : ''}`}
          variants={item}
          whileHover={isSuccess ? undefined : { scale: 1.03 }}
          whileTap={isSuccess ? undefined : { scale: 0.97 }}
          disabled={isSubmitting || !email || !password}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isSuccess ? (
              <motion.span key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                Welcome
              </motion.span>
            ) : isSubmitting ? (
              <motion.span
                key="spin"
                className="login__spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Sign in</motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.form>
    </div>
  )
}

export default LoginPage
