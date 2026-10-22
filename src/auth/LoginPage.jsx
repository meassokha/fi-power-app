import { useState } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { login } from './api'
import Lamp from './Lamp'
import './LoginPage.css'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.7 } },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90, damping: 16 } },
}

function LoginPage({ onAuthenticated }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isOn, setIsOn] = useState(false)
  const controls = useAnimationControls()

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return
    setError('')
    setIsSubmitting(true)
    try {
      const session = await login(email, password)
      setIsSuccess(true)
      await controls.start({
        clipPath: 'polygon(0% 0%, 50% 50%, 100% 100%, 50% 50%)',
        rotate: -4,
        scale: 0.96,
        transition: { duration: 0.55, ease: 'easeInOut' },
      })
      await controls.start({
        clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
        rotate: -8,
        scale: 0.7,
        opacity: 0,
        transition: { duration: 0.4, ease: 'easeIn' },
      })
      onAuthenticated(session)
    } catch (err) {
      setError(err.message)
      setIsSubmitting(false)
      controls.start({ x: [0, -16, 14, -10, 8, -4, 0], transition: { duration: 0.5, ease: 'easeOut' } })
    }
  }

  return (
    <div className="login">
      <motion.div
        className="login__ambient"
        initial={false}
        animate={{ opacity: isOn ? 1 : 0 }}
        transition={{ duration: 1.2 }}
      />

      <div className="login__lamp">
        <Lamp isOn={isOn} onToggle={() => setIsOn((v) => !v)} />
      </div>

      <div className="login__stage">
        <AnimatePresence>
          {!isOn && (
            <motion.p
              key="hint"
              className="login__hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ delay: 0.4 }}
            >
              Pull the cord to turn on the light
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOn && (
            <motion.div
              key="card"
              className="login__enter"
              initial={{ opacity: 0, y: 48, scale: 0.92, filter: 'blur(14px)' }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                transition: { type: 'spring', stiffness: 70, damping: 16, delay: 0.35 },
              }}
              exit={{ opacity: 0, y: 48, scale: 0.92, filter: 'blur(14px)', transition: { duration: 0.35 } }}
            >
              <motion.div animate={controls} style={{ transformOrigin: '50% 50%' }}>
                <motion.form
                  className="login__card"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  onSubmit={handleSubmit}
                  noValidate
                >
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
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    className="login__submit"
                    variants={item}
                    whileHover={isSubmitting ? undefined : { scale: 1.03 }}
                    whileTap={isSubmitting ? undefined : { scale: 0.97 }}
                    disabled={isSubmitting || isSuccess || !email || !password}
                  >
                    {isSubmitting ? (
                      <motion.span
                        className="login__spinner"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : (
                      <span>Sign in</span>
                    )}
                  </motion.button>
                </motion.form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default LoginPage
