import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const STAR_COLORS = ['255,255,255', '200,220,255', '255,230,200', '210,190,255']

const gaussian = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5

// Soft elongated blob; drawn additively so overlapping blobs build up a glowing band.
function blob(ctx, x, y, rx, ry, rgb, alpha, mode) {
  ctx.save()
  ctx.globalCompositeOperation = mode
  ctx.translate(x, y)
  ctx.scale(1, ry / rx)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx)
  g.addColorStop(0, `rgba(${rgb},${alpha})`)
  g.addColorStop(1, `rgba(${rgb},0)`)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(0, 0, rx, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

// Pre-render the Milky Way band once: warm bulge in the middle, cool arms, dark dust lanes.
function renderBand(length, thickness) {
  const c = document.createElement('canvas')
  c.width = length
  c.height = thickness
  const ctx = c.getContext('2d')
  const mid = thickness / 2
  const spread = thickness * 0.13

  for (let i = 0; i < 160; i++) {
    const u = (Math.random() - 0.5) * length * 0.95
    const v = mid + gaussian() * spread
    const nearCore = 1 - Math.min(Math.abs(u) / (length * 0.32), 1)
    const rgb = nearCore > 0.45 ? '255,214,170' : Math.random() < 0.5 ? '150,170,255' : '190,150,255'
    const rx = thickness * (0.12 + Math.random() * 0.2)
    blob(ctx, length / 2 + u, v, rx, rx * 0.55, rgb, 0.035 + nearCore * 0.06, 'lighter')
  }
  // bright galactic core
  blob(ctx, length / 2, mid, thickness * 0.34, thickness * 0.14, '255,236,205', 0.18, 'lighter')
  // dust lanes cut out of the glow
  for (let i = 0; i < 40; i++) {
    const u = (Math.random() - 0.5) * length * 0.8
    const v = mid + gaussian() * spread * 0.45
    blob(ctx, length / 2 + u, v, thickness * (0.1 + Math.random() * 0.14), thickness * 0.03, '0,0,0', 0.16, 'destination-out')
  }
  return c
}

// Slowly rotating nebula clouds, a tilted Milky Way band and a drifting, twinkling star field.
function GalaxyBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let stars = []
    let bandStars = []
    let band = null
    let bandLength = 0
    let bandThickness = 0
    let shooting = null
    let nextShot = 4000
    let frame = 0
    let last = performance.now()
    let angle = 0

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const radius = Math.hypot(width, height) / 2
      const count = Math.round((width * height) / 6500)
      stars = Array.from({ length: count }, () => {
        // sqrt spreads stars evenly across the disc; depth drives size, speed and brightness
        const depth = Math.random()
        return {
          r: Math.sqrt(Math.random()) * radius,
          theta: Math.random() * Math.PI * 2,
          size: 0.4 + depth * 1.4,
          speed: 0.4 + depth * 0.9,
          phase: Math.random() * Math.PI * 2,
          twinkle: 0.4 + Math.random() * 0.9,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        }
      })

      bandLength = radius * 2.3
      bandThickness = Math.max(height * 0.75, 380)
      band = renderBand(Math.round(bandLength), Math.round(bandThickness))
      // dense, tiny stars packed along the band
      bandStars = Array.from({ length: Math.round(count * 1.6) }, () => ({
        u: (Math.random() - 0.5) * bandLength * 0.9,
        v: gaussian() * bandThickness * 0.1,
        size: 0.3 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.4 + Math.random() * 0.9,
        warm: Math.random() < 0.35,
      }))
    }

    function draw(now) {
      const dt = Math.min(now - last, 50)
      last = now
      angle += dt * 0.000012
      nextShot -= dt
      ctx.clearRect(0, 0, width, height)
      const cx = width / 2
      const cy = height / 2

      // Milky Way: slow sway around a diagonal tilt
      const tilt = -0.5 + 0.1 * Math.sin(now * 0.00004)
      const cos = Math.cos(tilt)
      const sin = Math.sin(tilt)
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(tilt)
      ctx.globalAlpha = 0.85 + 0.15 * Math.sin(now * 0.00025)
      ctx.drawImage(band, -bandLength / 2, -bandThickness / 2)
      ctx.restore()

      for (const s of bandStars) {
        const x = cx + s.u * cos - s.v * sin
        const y = cy + s.u * sin + s.v * cos
        if (x < -5 || x > width + 5 || y < -5 || y > height + 5) continue
        const alpha = 0.25 + 0.6 * (0.5 + 0.5 * Math.sin(now * 0.001 * s.twinkle + s.phase))
        ctx.fillStyle = `rgba(${s.warm ? '255,225,190' : '215,225,255'},${alpha.toFixed(3)})`
        ctx.fillRect(x, y, s.size, s.size)
      }

      for (const s of stars) {
        const a = s.theta + angle * s.speed
        const x = cx + Math.cos(a) * s.r
        const y = cy + Math.sin(a) * s.r
        if (x < -5 || x > width + 5 || y < -5 || y > height + 5) continue
        const alpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(now * 0.001 * s.twinkle + s.phase))
        ctx.fillStyle = `rgba(${s.color},${alpha.toFixed(3)})`
        ctx.beginPath()
        ctx.arc(x, y, s.size, 0, Math.PI * 2)
        ctx.fill()
      }

      if (!shooting && nextShot <= 0) {
        shooting = {
          x: Math.random() * width * 0.7,
          y: Math.random() * height * 0.4,
          life: 0,
        }
        nextShot = 7000 + Math.random() * 8000
      }
      if (shooting) {
        shooting.life += dt / 1100
        const t = shooting.life
        const hx = shooting.x + t * 380
        const hy = shooting.y + t * 190
        const fade = Math.sin(Math.min(t, 1) * Math.PI)
        const grad = ctx.createLinearGradient(hx, hy, hx - 90, hy - 45)
        grad.addColorStop(0, `rgba(255,255,255,${0.9 * fade})`)
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(hx, hy)
        ctx.lineTo(hx - 90, hy - 45)
        ctx.stroke()
        if (t >= 1) shooting = null
      }

      frame = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    if (reduceMotion) {
      // One static frame, no loop.
      draw(performance.now())
      cancelAnimationFrame(frame)
    } else {
      frame = requestAnimationFrame(draw)
    }

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="galaxy" aria-hidden="true">
      <motion.div
        className="galaxy__nebula galaxy__nebula--core"
        animate={{ rotate: 360 }}
        transition={{ duration: 240, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="galaxy__nebula galaxy__nebula--arm"
        animate={{ rotate: -360 }}
        transition={{ duration: 360, repeat: Infinity, ease: 'linear' }}
      />
      <canvas ref={canvasRef} className="galaxy__stars" />
    </div>
  )
}

export default GalaxyBackground
