'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import {
  FastForward,
  ArrowRight,
  LogIn,
  X,
  Sparkles,
  Compass,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { ThemeToggle } from '@/components/shared/theme-toggle'

export interface IntroPresentationProps {
  /**
   * Presentation display mode:
   * - 'entry': Single cinematic playthrough concluding with the "Enter Lungent" CTA.
   * - 'idle': Infinitely looping ambient sequence. No CTA button. Dissolves upon any interaction.
   */
  mode?: 'entry' | 'idle'
  onProceedToAuth?: () => void
  onDismiss?: () => void
}

interface Particle {
  baseX: number
  baseY: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  phase: number
  type: 'trachea' | 'left-lung' | 'right-lung'
}

export function IntroPresentation({
  mode = 'entry',
  onProceedToAuth,
  onDismiss,
}: IntroPresentationProps) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isIdle = mode === 'idle'
  const isEntry = mode === 'entry'

  // Master Timeline Progress (0.00 to 1.00)
  const progress = useMotionValue(0)

  // Lock body scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Universal handler to proceed to authentication
  const handleAuthRedirect = useCallback(() => {
    if (onProceedToAuth) {
      onProceedToAuth()
    } else {
      router.push('/login')
    }
  }, [onProceedToAuth, router])

  // In idle mode, any user interaction instantly dismisses the presentation
  useEffect(() => {
    if (!isIdle) return

    const handleDismissOnActivity = () => {
      if (onDismiss) {
        onDismiss()
      }
    }

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel']
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleDismissOnActivity, { passive: true })
    })

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleDismissOnActivity)
      })
    }
  }, [isIdle, onDismiss])

  // Escape key in entry mode routes to /login
  useEffect(() => {
    if (isIdle) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleAuthRedirect()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isIdle, handleAuthRedirect])

  // Continuous linear animation driver (~21 seconds total)
  useEffect(() => {
    let animationControls: ReturnType<typeof animate>

    if (isEntry) {
      progress.set(0)
      animationControls = animate(progress, 1, {
        duration: 21,
        ease: 'linear',
      })
    } else {
      progress.set(0)
      animationControls = animate(progress, 1, {
        duration: 24,
        ease: 'linear',
        repeat: Infinity,
      })
    }

    return () => {
      if (animationControls) {
        animationControls.stop()
      }
    }
  }, [isEntry, isIdle, progress])

  // ========================================================
  // NATIVE CANVAS PARTICLE SYSTEM (ABSTRACT NEURAL LUNGS)
  // ========================================================
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = 0
    let height = 0
    let particles: Particle[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initParticles()
    }

    // Initialize particles clustered into a neural bronchial tree / lung shape
    const initParticles = () => {
      particles = []
      const particleCount = width < 768 ? 100 : 160

      for (let i = 0; i < particleCount; i++) {
        let type: Particle['type'] = 'left-lung'
        let normX = 0
        let normY = 0

        const rand = Math.random()
        if (rand < 0.15) {
          // Central Trachea / Airway stem
          type = 'trachea'
          normX = (Math.random() - 0.5) * 0.05
          normY = -0.32 + Math.random() * 0.22
        } else if (rand < 0.575) {
          // Left Lung Lobe (elliptical distribution)
          type = 'left-lung'
          const angle = Math.random() * Math.PI * 2
          const rad = Math.sqrt(Math.random())
          normX = -0.17 + Math.cos(angle) * 0.14 * rad
          normY = 0.05 + Math.sin(angle) * 0.24 * rad
        } else {
          // Right Lung Lobe (elliptical distribution)
          type = 'right-lung'
          const angle = Math.random() * Math.PI * 2
          const rad = Math.sqrt(Math.random())
          normX = 0.17 + Math.cos(angle) * 0.14 * rad
          normY = 0.05 + Math.sin(angle) * 0.24 * rad
        }

        particles.push({
          baseX: normX,
          baseY: normY,
          x: width / 2 + normX * Math.min(width, height),
          y: height / 2 + normY * Math.min(width, height),
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: 1.5 + Math.random() * 2.2,
          phase: Math.random() * Math.PI * 2,
          type,
        })
      }
    }

    resize()
    window.addEventListener('resize', resize)

    let lastTime = performance.now()

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1)
      lastTime = time

      ctx.clearRect(0, 0, width, height)

      const pVal = progress.get()
      const minDim = Math.min(width, height)
      const cx = width / 2
      const cy = height / 2

      // Respiration cycle: slow 4-second rhythmic breathing
      const breath = 1 + 0.065 * Math.sin(time * 0.0016)

      // Color shift: cool teal transitioning toward subtle amber in scene 2 & 3, returning to vibrant teal in 4 & 5
      let lineHue = 195 // Teal-Cyan (hsl 195)
      let lineSat = 85
      let lineLit = 55

      if (pVal >= 0.22 && pVal <= 0.65) {
        // Shift toward warm amber during threat & barrier scenes
        const factor = Math.sin(((pVal - 0.22) / 0.43) * Math.PI)
        lineHue = 195 - factor * 165 // Shifts from 195 to ~30 (warm amber/orange)
        lineSat = 90
        lineLit = 55 + factor * 5
      }

      const maxConnDist = width < 768 ? 60 : 85

      // 1. Update and drift particles
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i]

        // Drift slowly
        pt.phase += dt * 0.8
        const organicWobbleX = Math.cos(pt.phase) * 6
        const organicWobbleY = Math.sin(pt.phase) * 6

        // Target respiratory position
        const targetX = cx + pt.baseX * minDim * breath + organicWobbleX
        const targetY = cy + pt.baseY * minDim * breath + organicWobbleY

        // Smooth spring towards respiratory target
        pt.x += (targetX - pt.x) * 0.08
        pt.y += (targetY - pt.y) * 0.08
      }

      // 2. Draw glowing interconnected neural lines
      ctx.lineWidth = 1.1
      ctx.shadowBlur = 7
      ctx.shadowColor = `hsla(${lineHue}, ${lineSat}%, ${lineLit}%, 0.6)`

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < maxConnDist) {
            const alpha = (1 - dist / maxConnDist) * 0.38
            ctx.strokeStyle = `hsla(${lineHue}, ${lineSat}%, ${lineLit}%, ${alpha})`
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      // 3. Draw glowing particle nodes
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i]
        const pulse = 1 + 0.25 * Math.sin(time * 0.003 + pt.phase)

        ctx.shadowBlur = 10
        ctx.shadowColor = `hsla(${lineHue}, 90%, 65%, 0.8)`
        ctx.fillStyle = `hsla(${lineHue}, 95%, 75%, 0.85)`

        ctx.beginPath()
        ctx.arc(pt.x, pt.y, pt.radius * pulse, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
    }
  }, [progress])

  // ========================================================
  // SCENE TRANSFORMS (FLAWLESS CONTINUOUS OVERLAP)
  // No blank screens: each scene overlaps with the next
  // ========================================================
  // Scene 1: "Every breath is a quiet act of trust." (0.00 -> 0.24)
  const s1Opacity = useTransform(progress, [0.0, 0.06, 0.17, 0.24], [0, 1, 1, 0])
  const s1Y = useTransform(progress, [0.0, 0.06, 0.17, 0.24], [25, 0, 0, -25])
  const s1Scale = useTransform(progress, [0.0, 0.06, 0.17, 0.24], [1.04, 1, 1, 0.96])

  // Scene 2: "But for millions, that trust is broken by an invisible threat." (0.20 -> 0.44)
  // Overlaps with Scene 1 between 0.20 and 0.24
  const s2Opacity = useTransform(progress, [0.20, 0.26, 0.38, 0.44], [0, 1, 1, 0])
  const s2Y = useTransform(progress, [0.20, 0.26, 0.38, 0.44], [25, 0, 0, -25])
  const s2Scale = useTransform(progress, [0.20, 0.26, 0.38, 0.44], [1.04, 1, 1, 0.96])

  // Scene 3: "It's not risk. It's distance. It's the radiation of the CT scanner." (0.40 -> 0.65)
  // Overlaps with Scene 2 between 0.40 and 0.44
  const s3Opacity = useTransform(progress, [0.40, 0.46, 0.58, 0.65], [0, 1, 1, 0])
  const s3Y = useTransform(progress, [0.40, 0.46, 0.58, 0.65], [25, 0, 0, -25])
  const s3Scale = useTransform(progress, [0.40, 0.46, 0.58, 0.65], [1.04, 1, 1, 0.96])

  // Scene 4: "LUNGENT. The intelligence of early breath." (0.61 -> 0.84)
  // Overlaps with Scene 3 between 0.61 and 0.65
  const s4Opacity = useTransform(progress, [0.61, 0.67, 0.77, 0.84], [0, 1, 1, 0])
  const s4Y = useTransform(progress, [0.61, 0.67, 0.77, 0.84], [25, 0, 0, -25])
  const s4Scale = useTransform(progress, [0.61, 0.67, 0.77, 0.84], [1.04, 1, 1, 0.96])

  // Scene 5: "AI risk stratification. Minimizing false negatives before the scan." (0.80 -> 1.00)
  // Overlaps with Scene 4 between 0.80 and 0.84
  const s5Opacity = useTransform(
    progress,
    isIdle ? [0.80, 0.86, 0.94, 1.0] : [0.80, 0.86, 0.94, 1.0],
    isIdle ? [0, 1, 1, 0] : [0, 1, 1, 1]
  )
  const s5Y = useTransform(
    progress,
    isIdle ? [0.80, 0.86, 0.94, 1.0] : [0.80, 0.86, 0.92, 1.0],
    isIdle ? [25, 0, 0, -25] : [25, 0, -20, -25]
  )
  const s5Scale = useTransform(progress, [0.80, 0.86, 0.94, 1.0], [1.04, 1, 1, 1])

  // Final "Enter Lungent" Button (Entry mode: 0.90 -> 1.00)
  const enterBtnOpacity = useTransform(progress, [0.90, 0.97, 1.0], [0, 1, 1])
  const enterBtnY = useTransform(progress, [0.90, 0.97, 1.0], [30, 0, 0])

  return (
    <aside
      aria-label="Lungent Cinematic Motion Graphics"
      tabIndex={0}
      className="fixed inset-0 z-[999] flex flex-col bg-[#050505] text-white overflow-hidden select-none"
    >
      {/* Slow camera zoom on background canvas layer */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </motion.div>

      {/* Atmospheric depth vignette and glows */}
      <div className="absolute inset-0 z-1 pointer-events-none bg-radial-gradient from-transparent via-[#050505]/40 to-[#050505]/95" />

      {/* Fixed Minimal Top Header Bar */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-5 sm:px-12 sm:py-6 flex items-center justify-between gap-4 border-b border-white/10 backdrop-blur-md bg-[#050505]/40">
        <div className="flex items-center gap-3">
          <Logo size="sm" variant="compact" />
          <span className="hidden sm:inline-block text-[11px] font-mono tracking-widest uppercase text-teal-400/80">
            {isIdle ? 'Autonomous Ambient Display' : 'Clinical Motion Experience'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isEntry ? (
            <button
              type="button"
              onClick={handleAuthRedirect}
              aria-label="Skip to Sign In"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-white/90 hover:text-white backdrop-blur-md text-xs sm:text-sm font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
            >
              <span>Skip Intro</span>
              <FastForward className="size-3.5 sm:size-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
              <kbd className="hidden lg:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                Esc
              </kbd>
            </button>
          ) : (
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/5 text-xs text-white/80 hover:text-white hover:bg-white/15 font-medium transition-all cursor-pointer"
            >
              <X className="size-3.5" />
              <span>Resume Work</span>
            </button>
          )}
        </div>
      </header>

      {/* ======================================================== */}
      {/* CINEMATIC TEXT OVERLAY (SEAMLESS FLUID OVERLAPS)          */}
      {/* ======================================================== */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full max-w-5xl mx-auto px-6 sm:px-12 text-center pointer-events-none">
        {/* Scene 1: "Every breath is a quiet act of trust." */}
        <motion.div
          style={{ opacity: s1Opacity, y: s1Y, scale: s1Scale }}
          className="absolute inset-x-6 sm:inset-x-12 flex flex-col items-center justify-center text-center space-y-4"
        >
          <p className="font-serif italic text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-light tracking-tight leading-[1.12] drop-shadow-[0_0_35px_rgba(255,255,255,0.4)]">
            Every breath is a quiet act of trust.
          </p>
        </motion.div>

        {/* Scene 2: "But for millions, that trust is broken by an invisible threat." */}
        <motion.div
          style={{ opacity: s2Opacity, y: s2Y, scale: s2Scale }}
          className="absolute inset-x-6 sm:inset-x-12 flex flex-col items-center justify-center text-center space-y-4"
        >
          <p className="font-serif italic text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-light tracking-tight leading-[1.12] drop-shadow-[0_0_35px_rgba(255,255,255,0.4)]">
            But for millions, that trust is broken by an{' '}
            <span className="text-amber-400 not-italic font-sans font-semibold drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
              invisible threat
            </span>
            .
          </p>
        </motion.div>

        {/* Scene 3: "It's not risk. It's distance. It's the radiation of the CT scanner." */}
        <motion.div
          style={{ opacity: s3Opacity, y: s3Y, scale: s3Scale }}
          className="absolute inset-x-6 sm:inset-x-12 flex flex-col items-center justify-center text-center space-y-4"
        >
          <p className="font-serif italic text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-light tracking-tight leading-[1.18] drop-shadow-[0_0_35px_rgba(255,255,255,0.4)] max-w-4xl">
            It’s not risk. It’s{' '}
            <span className="text-amber-400 not-italic font-sans font-medium">distance</span>.
            It’s the{' '}
            <span className="text-rose-400 not-italic font-sans font-medium">
              radiation of the CT scanner
            </span>
            .
          </p>
        </motion.div>

        {/* Scene 4: "LUNGENT. The intelligence of early breath." */}
        <motion.div
          style={{ opacity: s4Opacity, y: s4Y, scale: s4Scale }}
          className="absolute inset-x-6 sm:inset-x-12 flex flex-col items-center justify-center text-center space-y-4"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-widest text-teal-400 drop-shadow-[0_0_45px_rgba(45,212,191,0.65)] font-sans">
            LUNGENT.
          </h1>
          <p className="font-serif italic text-2xl sm:text-4xl md:text-5xl text-slate-200 font-light tracking-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.35)]">
            The intelligence of early breath.
          </p>
        </motion.div>

        {/* Scene 5: "AI risk stratification. Minimizing false negatives before the scan." */}
        <motion.div
          style={{ opacity: s5Opacity, y: s5Y, scale: s5Scale }}
          className="absolute inset-x-6 sm:inset-x-12 flex flex-col items-center justify-center text-center space-y-8"
        >
          <div className="space-y-4 max-w-4xl">
            <p className="font-serif italic text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-light tracking-tight leading-[1.15] drop-shadow-[0_0_35px_rgba(255,255,255,0.4)]">
              AI risk stratification.
            </p>
            <p className="text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight text-teal-300 drop-shadow-[0_0_35px_rgba(45,212,191,0.5)] font-sans">
              Minimizing false negatives{' '}
              <span className="text-white underline decoration-teal-400/60 underline-offset-8 font-light italic font-serif">
                before the scan
              </span>
              .
            </p>
          </div>

          {/* Prominent "Enter Lungent" Button (Entry mode only) */}
          {isEntry && (
            <motion.div
              style={{ opacity: enterBtnOpacity, y: enterBtnY }}
              className="pt-2 flex flex-col items-center justify-center space-y-4 pointer-events-auto w-full max-w-sm"
            >
              <button
                type="button"
                onClick={handleAuthRedirect}
                className="group relative w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 font-bold text-lg sm:text-xl shadow-[0_0_40px_rgba(45,212,191,0.4)] hover:shadow-[0_0_60px_rgba(45,212,191,0.6)] hover:scale-105 active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Compass className="size-6 text-slate-950 group-hover:rotate-45 transition-transform" />
                <span>Enter Lungent</span>
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <Link
                  href="/register"
                  className="hover:text-teal-300 underline underline-offset-4 transition-colors font-medium"
                >
                  Create Account
                </Link>
                <span>·</span>
                <Link
                  href="/login"
                  className="hover:text-teal-300 underline underline-offset-4 transition-colors font-medium"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </aside>
  )
}

export default IntroPresentation
