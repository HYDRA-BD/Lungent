'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import {
  FastForward,
  ArrowRight,
  LogIn,
  X,
  Compass,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { ThemeToggle } from '@/components/shared/theme-toggle'

export interface IntroPresentationProps {
  /**
   * Presentation display mode:
   * - 'entry': Single cinematic sequence concluding with the "Enter Lungent" CTA.
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

  // Current Scene Index: 0 to 4 (5 Scenes)
  const [currentScene, setCurrentScene] = useState(0)
  const sceneDurationMs = 6000 // 6 seconds per scene for comfortable reading

  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTransitionTimeRef = useRef<number>(0)

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

  // Advance to next scene immediately with 1000ms throttle and timer reset
  const nextScene = useCallback(() => {
    if (isIdle) return

    const now = Date.now()
    if (now - lastTransitionTimeRef.current < 1000) {
      return // Throttled: ignore rapid clicks/scrolls within 1s
    }
    lastTransitionTimeRef.current = now

    // Clear any existing automatic timer
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current)
      autoTimerRef.current = null
    }

    setCurrentScene((prev) => (prev < 4 ? prev + 1 : 4))
  }, [isIdle])

  // Automatic Scene Transition Timer (restarts fresh 6s on every scene change)
  useEffect(() => {
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current)
      autoTimerRef.current = null
    }

    // In entry mode, if reached final scene (index 4), hold on Scene 5 + CTA
    if (isEntry && currentScene === 4) {
      return
    }

    autoTimerRef.current = setTimeout(() => {
      lastTransitionTimeRef.current = Date.now()
      setCurrentScene((prev) => {
        if (isEntry) {
          return prev < 4 ? prev + 1 : 4
        }
        return (prev + 1) % 5
      })
    }, sceneDurationMs)

    return () => {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current)
        autoTimerRef.current = null
      }
    }
  }, [currentScene, isEntry, sceneDurationMs])

  // In idle mode, any user interaction instantly dismisses the presentation entirely
  useEffect(() => {
    if (!isIdle) return

    const handleDismissOnActivity = () => {
      if (onDismiss) {
        onDismiss()
      }
    }

    const activityEvents = [
      'mousemove',
      'mousedown',
      'click',
      'keydown',
      'touchstart',
      'touchmove',
      'wheel',
    ]
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleDismissOnActivity, { passive: true })
    })

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleDismissOnActivity)
      })
    }
  }, [isIdle, onDismiss])

  // In entry mode, manual user triggers (Click, Wheel scroll, Touch, Keys) advance the scene
  useEffect(() => {
    if (isIdle) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (target && target.closest('button, a, input')) {
        return // Let interactive buttons and links handle their own clicks
      }
      nextScene()
    }

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 15 || Math.abs(e.deltaX) > 15) {
        nextScene()
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null
      if (target && target.closest('button, a, input')) {
        return
      }
      nextScene()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleAuthRedirect()
      } else if (
        e.key === 'ArrowRight' ||
        e.key === 'ArrowDown' ||
        e.key === ' ' ||
        e.key === 'Enter' ||
        e.key === 'PageDown'
      ) {
        const target = e.target as HTMLElement | null
        if (target && target.closest('button, a, input')) {
          return
        }
        nextScene()
      }
    }

    window.addEventListener('click', handleClick)
    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isIdle, nextScene, handleAuthRedirect])

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
      const particleCount = width < 768 ? 90 : 150

      for (let i = 0; i < particleCount; i++) {
        let type: Particle['type'] = 'left-lung'
        let normX = 0
        let normY = 0

        const rand = Math.random()
        if (rand < 0.16) {
          // Central Trachea / Airway stem
          type = 'trachea'
          normX = (Math.random() - 0.5) * 0.05
          normY = -0.32 + Math.random() * 0.22
        } else if (rand < 0.58) {
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
    let currentHue = 195 // Cool Teal

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1)
      lastTime = time

      ctx.clearRect(0, 0, width, height)

      const minDim = Math.min(width, height)
      const cx = width / 2
      const cy = height / 2

      // Respiration cycle: slow 4-second rhythmic breathing
      const breath = 1 + 0.065 * Math.sin(time * 0.0016)

      // Target color shift based on scene:
      // Scene 0: Cool Teal (195)
      // Scene 1: Cool Teal (195)
      // Scene 2: Warm Amber (35) - "distant, expensive, radiation risks"
      // Scene 3: Vibrant Teal (180) - "LUNGENT"
      // Scene 4: Vibrant Teal (180) - "Minimizing false negatives"
      let targetHue = 195
      if (currentScene === 2) {
        targetHue = 35 // Warm Amber
      } else if (currentScene === 3 || currentScene === 4) {
        targetHue = 180 // Radiant Teal
      }

      // Smoothly interpolate hue
      currentHue += (targetHue - currentHue) * 0.04

      const maxConnDist = width < 768 ? 60 : 85

      // 1. Update and drift particles
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i]

        pt.phase += dt * 0.8
        const organicWobbleX = Math.cos(pt.phase) * 5
        const organicWobbleY = Math.sin(pt.phase) * 5

        const targetX = cx + pt.baseX * minDim * breath + organicWobbleX
        const targetY = cy + pt.baseY * minDim * breath + organicWobbleY

        pt.x += (targetX - pt.x) * 0.08
        pt.y += (targetY - pt.y) * 0.08
      }

      // 2. Draw glowing interconnected neural lines
      ctx.lineWidth = 1.1
      ctx.shadowBlur = 7
      ctx.shadowColor = `hsla(${currentHue}, 85%, 55%, 0.6)`

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < maxConnDist) {
            const alpha = (1 - dist / maxConnDist) * 0.38
            ctx.strokeStyle = `hsla(${currentHue}, 85%, 55%, ${alpha})`
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
        ctx.shadowColor = `hsla(${currentHue}, 90%, 65%, 0.8)`
        ctx.fillStyle = `hsla(${currentHue}, 95%, 75%, 0.85)`

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
  }, [currentScene])

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
            {isIdle ? 'Autonomous Ambient Display' : 'Clinical Motion Stream'}
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
      {/* CINEMATIC TEXT OVERLAY (SMOOTH MORPHING SLIDE & BLUR)    */}
      {/* mode="popLayout": Old text slides UP & blurs out,        */}
      {/* while new text slides in from BELOW & unblurs!          */}
      {/* ======================================================== */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full max-w-5xl mx-auto px-6 sm:px-12 text-center pointer-events-none">
        <AnimatePresence mode="popLayout">
          {/* Scene 1: "Lung cancer is the leading cause of cancer mortality globally." */}
          {currentScene === 0 && (
            <motion.div
              key="scene-1"
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: 'transform, opacity, filter' }}
              className="w-full flex flex-col items-center justify-center text-center space-y-4 will-change-[transform,opacity,filter]"
            >
              <p className="font-serif italic text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-light tracking-tight leading-[1.12] drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]">
                Lung cancer is the{' '}
                <span className="text-teal-300 not-italic font-sans font-bold drop-shadow-[0_0_25px_rgba(45,212,191,0.5)]">
                  leading cause
                </span>{' '}
                of cancer mortality globally.
              </p>
            </motion.div>
          )}

          {/* Scene 2: "Yet 70% of rural patients never get screened." */}
          {currentScene === 1 && (
            <motion.div
              key="scene-2"
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: 'transform, opacity, filter' }}
              className="w-full flex flex-col items-center justify-center text-center space-y-4 will-change-[transform,opacity,filter]"
            >
              <p className="font-serif italic text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-light tracking-tight leading-[1.12] drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]">
                Yet{' '}
                <span className="text-amber-400 not-italic font-sans font-bold drop-shadow-[0_0_25px_rgba(251,191,36,0.5)]">
                  70% of rural patients
                </span>{' '}
                never get screened.
              </p>
            </motion.div>
          )}

          {/* Scene 3: "Not because they are low-risk. But because CT scanners are distant, expensive, and carry radiation risks." */}
          {currentScene === 2 && (
            <motion.div
              key="scene-3"
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: 'transform, opacity, filter' }}
              className="w-full flex flex-col items-center justify-center text-center space-y-4 will-change-[transform,opacity,filter]"
            >
              <p className="font-serif italic text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-light tracking-tight leading-[1.18] drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)] max-w-4xl">
                Not because they are low-risk. But because CT scanners are{' '}
                <span className="text-amber-400 not-italic font-sans font-medium">distant</span>,{' '}
                <span className="text-amber-400 not-italic font-sans font-medium">expensive</span>, and carry{' '}
                <span className="text-rose-400 not-italic font-sans font-semibold drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                  radiation risks
                </span>
                .
              </p>
            </motion.div>
          )}

          {/* Scene 4: "LUNGENT. Non-imaging AI risk stratification." */}
          {currentScene === 3 && (
            <motion.div
              key="scene-4"
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: 'transform, opacity, filter' }}
              className="w-full flex flex-col items-center justify-center text-center space-y-4 will-change-[transform,opacity,filter]"
            >
              <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-widest text-teal-400 drop-shadow-[0_0_45px_rgba(45,212,191,0.7)] font-sans">
                LUNGENT.
              </h1>
              <p className="font-serif italic text-3xl sm:text-5xl md:text-6xl text-slate-100 font-light tracking-tight drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]">
                Non-imaging AI risk stratification.
              </p>
            </motion.div>
          )}

          {/* Scene 5: "Engineered to minimize false negatives. Detecting risk before the scan." */}
          {currentScene === 4 && (
            <motion.div
              key="scene-5"
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: 'transform, opacity, filter' }}
              className="w-full flex flex-col items-center justify-center text-center space-y-8 will-change-[transform,opacity,filter]"
            >
              <div className="space-y-4 max-w-4xl">
                <p className="font-serif italic text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-light tracking-tight leading-[1.15] drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]">
                  Engineered to{' '}
                  <span className="text-teal-400 not-italic font-sans font-bold drop-shadow-[0_0_30px_rgba(45,212,191,0.6)]">
                    minimize false negatives
                  </span>
                  .
                </p>
                <p className="text-2xl sm:text-4xl md:text-5xl font-light tracking-tight text-slate-200 drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)] font-sans">
                  Detecting risk{' '}
                  <span className="text-teal-300 font-serif italic underline decoration-teal-400/60 underline-offset-8">
                    before the scan
                  </span>
                  .
                </p>
              </div>

              {/* Prominent "Enter Lungent" Button (Entry mode only) */}
              {isEntry && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
                  className="pt-2 flex flex-col items-center justify-center space-y-4 pointer-events-auto w-full max-w-sm"
                >
                  <button
                    type="button"
                    onClick={handleAuthRedirect}
                    className="group relative w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 font-bold text-lg sm:text-xl shadow-[0_0_40px_rgba(45,212,191,0.45)] hover:shadow-[0_0_60px_rgba(45,212,191,0.7)] hover:scale-105 active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer"
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
          )}
        </AnimatePresence>
      </main>
    </aside>
  )
}

export default IntroPresentation
