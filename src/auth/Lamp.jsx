import { useRef } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'

const CORD_LENGTH = 92
const TUG = 26
const fade = { transition: 'fill 0.5s, stroke 0.5s, stroke-opacity 0.5s, fill-opacity 0.5s' }

function Lamp({ isOn, onToggle }) {
  const svgRef = useRef(null)
  const drag = useRef(null)
  const handleX = useMotionValue(0)
  const handleY = useMotionValue(0)

  const cordPath = useTransform([handleX, handleY], ([x, y]) => {
    const endY = CORD_LENGTH + y
    const slack = Math.max(0, 1 - y / 70) * 6
    return `M 0 0 C 0 ${endY * 0.45 + slack} ${x} ${endY * 0.55 - slack} ${x} ${endY}`
  })

  function stopAnimations() {
    handleX.stop()
    handleY.stop()
  }

  function bounceBack() {
    animate(handleY, 0, { type: 'spring', stiffness: 260, damping: 5.5, velocity: handleY.getVelocity() })
    animate(handleX, 0, { type: 'spring', stiffness: 140, damping: 4, velocity: handleX.getVelocity() })
  }

  function tug() {
    animate(handleY, TUG, { type: 'spring', stiffness: 500, damping: 30 })
  }

  function onPointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId)
    stopAnimations()
    const width = svgRef.current.getBoundingClientRect().width
    drag.current = { startX: e.clientX, startY: e.clientY, k: 240 / width }
    tug()
  }

  function onPointerMove(e) {
    const d = drag.current
    if (!d) return
    stopAnimations()
    const dy = (e.clientY - d.startY) * d.k + TUG
    const dx = (e.clientX - d.startX) * d.k
    handleY.set(dy >= 0 ? 70 * Math.tanh(dy / 70) : -14 * Math.tanh(-dy / 14))
    handleX.set(36 * Math.tanh(dx / 36))
  }

  function onPointerUp(e) {
    if (!drag.current) return
    drag.current = null
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    bounceBack()
    if (e.type === 'pointerup') onToggle()
  }

  function onKeyDown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    stopAnimations()
    animate(handleY, TUG, { type: 'spring', stiffness: 500, damping: 30 }).then(() => {
      bounceBack()
      onToggle()
    })
  }

  const shade = isOn ? '#fde9b0' : '#0d0f16'
  const pole = isOn ? '#2a2f3d' : '#0b0d13'
  const base = isOn ? '#262b38' : '#0b0d13'
  const cord = isOn ? '#d9c79a' : '#3a3f4d'
  const handle = isOn ? '#f3dc9c' : '#1b1e29'
  const rim = isOn ? 0.5 : 0.18

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 240 640"
      className="h-full w-auto max-w-full select-none overflow-visible lamp"
      aria-hidden={false}
    >
      <defs>
        <linearGradient id="lamp-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffcf6b" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lamp-halo">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffcf6b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lamp-pool">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffcf6b" stopOpacity="0" />
        </radialGradient>
        <filter id="lamp-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      <motion.g
        initial={false}
        animate={{ opacity: isOn ? [0, 0.9, 0.25, 1, 0.55, 1] : 0 }}
        transition={isOn ? { duration: 0.9, times: [0, 0.2, 0.4, 0.6, 0.8, 1] } : { duration: 0.35 }}
      >
        <polygon points="52,150 188,150 262,600 -22,600" fill="url(#lamp-cone)" filter="url(#lamp-blur)" />
        <ellipse cx="120" cy="602" rx="150" ry="22" fill="url(#lamp-pool)" />
      </motion.g>

      <rect x="117" y="150" width="6" height="440" rx="3" fill={pole} stroke="#fff" strokeOpacity={rim} strokeWidth="0.6" style={fade} />
      <ellipse cx="120" cy="596" rx="52" ry="10" fill={base} stroke="#fff" strokeOpacity={rim} strokeWidth="0.8" style={fade} />

      <polygon points="92,56 148,56 192,150 48,150" fill={shade} stroke="#fff" strokeOpacity={rim} strokeWidth="1" strokeLinejoin="round" style={fade} />

      <g style={{ ...fade, opacity: 1 }}>
        <motion.circle
          cx="120"
          cy="160"
          r="40"
          fill="url(#lamp-halo)"
          initial={false}
          animate={isOn ? { opacity: 1, scale: [1, 1.06, 1] } : { opacity: 0, scale: 1 }}
          transition={isOn ? { opacity: { duration: 0.5 }, scale: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } } : { duration: 0.35 }}
          style={{ transformOrigin: '120px 160px', transformBox: 'view-box' }}
        />
        <circle cx="120" cy="158" r="9" fill={isOn ? '#fffaf0' : '#14161f'} style={fade} />
      </g>

      <g transform="translate(180 150)">
        <motion.path d={cordPath} fill="none" stroke={cord} strokeWidth="2" strokeLinecap="round" style={fade} />
        <motion.g
          style={{ x: handleX, y: handleY, touchAction: 'none', cursor: 'grab' }}
          whileHover={{ scale: 1.08 }}
          role="button"
          tabIndex={0}
          aria-pressed={isOn}
          aria-label={`Pull to turn the lamp ${isOn ? 'off' : 'on'}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          <rect x="-22" y={CORD_LENGTH - 8} width="44" height="64" fill="transparent" />
          <circle cx="0" cy={CORD_LENGTH + 8} r="8" fill={handle} stroke="#fff" strokeOpacity={rim} strokeWidth="0.8" style={fade} />
        </motion.g>
      </g>
    </svg>
  )
}

export default Lamp
