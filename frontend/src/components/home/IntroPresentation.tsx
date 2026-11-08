'use client'

import React, { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import {
  FastForward,
  Activity,
  ArrowRight,
  LogIn,
  Radiation,
  BrainCircuit,
  Cpu,
  ShieldCheck,
  Lock,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { ThemeToggle } from '@/components/shared/theme-toggle'

export interface IntroPresentationProps {
  /**
   * Mode:
   * - 'entry': Single continuous playthrough that concludes with the authentication CTA.
   * - 'idle': Infinitely looping screensaver. No auth CTA. Dismisses on mouse/key interaction.
   */
  mode?: 'entry' | 'idle'
  onProceedToAuth?: () => void
  onDismiss?: () => void
}

export function IntroPresentation({
  mode = 'entry',
  onProceedToAuth,
  onDismiss,
}: IntroPresentationProps) {
  const router = useRouter()
  const isIdle = mode === 'idle'
  const isEntry = mode === 'entry'

  // Master timeline progress (0.00 to 1.00)
  const progress = useMotionValue(0)

  // Top progress bar width
  const progressWidth = useTransform(progress, (p) => `${Math.min(100, Math.max(0, p * 100))}%`)

  // Lock body scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Universal handler to proceed to /login
  const handleAuthRedirect = useCallback(() => {
    if (onProceedToAuth) {
      onProceedToAuth()
    } else {
      router.push('/login')
    }
  }, [onProceedToAuth, router])

  // In idle mode, any mouse, keyboard, or touch event dismisses the presentation immediately
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

  // Esc key in entry mode
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

  // Continuous linear animation driver
  useEffect(() => {
    let animationControls: ReturnType<typeof animate>

    if (isEntry) {
      // Smooth continuous playback over 26 seconds, settling at 1.0
      progress.set(0)
      animationControls = animate(progress, 1, {
        duration: 26,
        ease: 'linear',
      })
    } else {
      // Seamless infinite loop over 28 seconds
      progress.set(0)
      animationControls = animate(progress, 1, {
        duration: 28,
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

  // Replay animation in entry mode
  const replayAnimation = () => {
    if (!isEntry) return
    progress.set(0)
    animate(progress, 1, {
      duration: 26,
      ease: 'linear',
    })
  }

  // ==========================================
  // PARALLAX BACKGROUND TRANSFORMS
  // ==========================================
  // Background Visual 1: Glowing Abstract Lungs (0.00 -> 0.30)
  const bg1Opacity = useTransform(progress, [0.0, 0.05, 0.22, 0.30], [0, 0.35, 0.35, 0])
  const bg1Y = useTransform(progress, [0.0, 0.30], [40, -40])
  const bg1Scale = useTransform(progress, [0.0, 0.30], [0.95, 1.05])

  // Background Visual 2: Scanner Radar (0.24 -> 0.54)
  const bg2Opacity = useTransform(progress, [0.24, 0.30, 0.46, 0.54], [0, 0.32, 0.32, 0])
  const bg2Y = useTransform(progress, [0.24, 0.54], [50, -50])
  const bg2Scale = useTransform(progress, [0.24, 0.54], [0.95, 1.06])

  // Background Visual 3: Neural AI Constellation (0.48 -> 0.78)
  const bg3Opacity = useTransform(progress, [0.48, 0.54, 0.70, 0.78], [0, 0.35, 0.35, 0])
  const bg3Y = useTransform(progress, [0.48, 0.78], [50, -50])
  const bg3Scale = useTransform(progress, [0.48, 0.78], [0.95, 1.05])

  // Background Visual 4: Clinical Shield (0.72 -> 1.00)
  const bg4Opacity = useTransform(
    progress,
    isIdle ? [0.72, 0.78, 0.94, 1.0] : [0.72, 0.80, 0.95, 1.0],
    isIdle ? [0, 0.38, 0.38, 0] : [0, 0.38, 0.38, 0.38]
  )
  const bg4Y = useTransform(progress, [0.72, 1.0], [50, -20])
  const bg4Scale = useTransform(progress, [0.72, 1.0], [0.95, 1.05])

  // ==========================================
  // FOREGROUND TEXT TRANSFORMS (Continuous Cross-Fade)
  // ==========================================
  // Phase 1: Problem (0.00 -> 0.28)
  const p1Opacity = useTransform(progress, [0.0, 0.05, 0.20, 0.28], [0, 1, 1, 0])
  const p1Y = useTransform(progress, [0.0, 0.06, 0.20, 0.28], [60, 0, 0, -60])
  const p1Scale = useTransform(progress, [0.0, 0.06, 0.20, 0.28], [1.05, 1, 1, 0.95])

  // Phase 2: Barrier (0.24 -> 0.52)
  const p2Opacity = useTransform(progress, [0.24, 0.30, 0.44, 0.52], [0, 1, 1, 0])
  const p2Y = useTransform(progress, [0.24, 0.30, 0.44, 0.52], [60, 0, 0, -60])
  const p2Scale = useTransform(progress, [0.24, 0.30, 0.44, 0.52], [1.05, 1, 1, 0.95])

  // Phase 3: Solution (0.48 -> 0.76)
  const p3Opacity = useTransform(progress, [0.48, 0.54, 0.68, 0.76], [0, 1, 1, 0])
  const p3Y = useTransform(progress, [0.48, 0.54, 0.68, 0.76], [60, 0, 0, -60])
  const p3Scale = useTransform(progress, [0.48, 0.54, 0.68, 0.76], [1.05, 1, 1, 0.95])

  // Phase 4: Mission (0.72 -> 1.00)
  const p4Opacity = useTransform(
    progress,
    isIdle ? [0.72, 0.78, 0.92, 1.0] : [0.72, 0.80, 0.92, 1.0],
    isIdle ? [0, 1, 1, 0] : [0, 1, 1, 1]
  )
  const p4Y = useTransform(
    progress,
    isIdle ? [0.72, 0.78, 0.92, 1.0] : [0.72, 0.80, 0.88, 1.0],
    isIdle ? [60, 0, 0, -60] : [60, 0, -35, -45]
  )
  const p4Scale = useTransform(progress, [0.72, 0.80, 0.92, 1.0], [1.05, 1, 1, 1])

  // CTA Block (Entry mode only: 0.85 -> 1.00)
  const ctaOpacity = useTransform(progress, [0.85, 0.94, 1.0], [0, 1, 1])
  const ctaY = useTransform(progress, [0.85, 0.94, 1.0], [40, 0, 0])
  const ctaScale = useTransform(progress, [0.85, 0.94, 1.0], [0.92, 1, 1])

  return (
    <aside
      aria-label="Lungent Cinematic Continuous Motion"
      tabIndex={0}
      className="fixed inset-0 z-[999] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden select-none"
    >
      {/* Dynamic Ambient Background Mesh */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-30 dark:opacity-40" />

        {/* Breathing glowing teal orb */}
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-teal-500/10 dark:bg-teal-500/15 blur-[160px] animate-pulse" />

        {/* Cyan/Sky depth orb */}
        <div
          className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] rounded-full bg-sky-500/10 dark:bg-sky-500/15 blur-[160px] animate-pulse"
          style={{ animationDuration: '6s', animationDelay: '2s' }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-50/40 dark:via-slate-950/50 to-slate-50/90 dark:to-slate-950/90" />
      </div>

      {/* Persistent Cinematic Top Bar */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-4 sm:px-12 sm:py-6 flex items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md bg-white/50 dark:bg-slate-950/50">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <Logo size="sm" variant="compact" />
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-semibold">
            <span className="size-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-ping" />
            <span>{isIdle ? 'Ambient Idle Stream' : 'Cinematic Vision Stream'}</span>
          </div>
        </div>

        {/* Right Tools: Theme Toggle & Skip/Exit Action */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isEntry ? (
            <button
              type="button"
              onClick={handleAuthRedirect}
              aria-label="Skip to Sign In"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-500/50 shadow-xs hover:shadow-md transition-all active:scale-95 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <span>Skip Intro</span>
              <FastForward className="size-3.5 sm:size-4 text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform" />
              <kbd className="hidden lg:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Esc
              </kbd>
            </button>
          ) : (
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium cursor-pointer"
            >
              <X className="size-3.5" />
              <span>Resume Work</span>
            </button>
          )}
        </div>

        {/* Continuous Linear Film Progress Line across top */}
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-slate-200/50 dark:bg-slate-800/50 overflow-hidden">
          <motion.div
            style={{ width: progressWidth }}
            className="h-full bg-gradient-to-r from-teal-500 via-teal-400 to-sky-400"
          />
        </div>
      </header>

      {/* ======================================================== */}
      {/* CONTINUOUS PARALLAX BACKGROUND VISUALS                   */}
      {/* ======================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {/* Visual 1: Abstract Glowing Lungs (Faint background, rotates slowly) */}
        <motion.div
          style={{ opacity: bg1Opacity, y: bg1Y, scale: bg1Scale }}
          className="absolute flex items-center justify-center pointer-events-none"
        >
          <div className="relative size-[440px] sm:size-[560px] lg:size-[680px] flex items-center justify-center">
            <div className="absolute inset-8 rounded-full bg-teal-500/20 blur-3xl" />
            <motion.svg
              viewBox="0 0 240 240"
              animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="size-full stroke-teal-500/50 dark:stroke-teal-400/40 fill-none drop-shadow-[0_0_35px_rgba(45,212,191,0.25)]"
            >
              <path d="M120 20 V80" strokeWidth="8" strokeLinecap="round" />
              <path d="M120 80 Q100 95 80 115" strokeWidth="6" strokeLinecap="round" />
              <path d="M120 80 Q140 95 160 115" strokeWidth="6" strokeLinecap="round" />
              <path d="M80 115 Q60 135 50 165" strokeWidth="4" strokeLinecap="round" />
              <path d="M80 115 Q90 140 85 175" strokeWidth="4" strokeLinecap="round" />
              <path d="M160 115 Q180 135 190 165" strokeWidth="4" strokeLinecap="round" />
              <path d="M160 115 Q150 140 155 175" strokeWidth="4" strokeLinecap="round" />
              <path
                d="M80 100 C50 100 35 130 35 165 C35 195 60 210 90 210 C108 210 115 190 115 165 C115 135 105 100 80 100 Z"
                className="fill-teal-500/10 dark:fill-teal-500/15"
                strokeWidth="3"
              />
              <path
                d="M160 100 C190 100 205 130 205 165 C205 195 180 210 150 210 C132 210 125 190 125 165 C125 135 135 100 160 100 Z"
                className="fill-teal-500/10 dark:fill-teal-500/15"
                strokeWidth="3"
              />
              <circle cx="50" cy="165" r="4" className="fill-teal-400" />
              <circle cx="85" cy="175" r="4" className="fill-teal-400" />
              <circle cx="190" cy="165" r="4" className="fill-teal-400" />
              <circle cx="155" cy="175" r="4" className="fill-teal-400" />
            </motion.svg>
          </div>
        </motion.div>

        {/* Visual 2: Scanner Radar Rings (Faint background, rotates continuously) */}
        <motion.div
          style={{ opacity: bg2Opacity, y: bg2Y, scale: bg2Scale }}
          className="absolute flex items-center justify-center pointer-events-none"
        >
          <div className="relative size-[440px] sm:size-[560px] lg:size-[680px] flex items-center justify-center">
            <div className="absolute inset-8 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="absolute inset-4 rounded-full border border-amber-500/20" />
            <div className="absolute inset-16 rounded-full border border-amber-500/25" />
            <div className="absolute inset-28 rounded-full border border-amber-500/30" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(245,158,11,0.2)_60deg,transparent_75deg)]"
            />
            <Radiation className="size-32 text-amber-500/40 animate-spin" style={{ animationDuration: '14s' }} />
          </div>
        </motion.div>

        {/* Visual 3: Neural Network Graph (Faint background) */}
        <motion.div
          style={{ opacity: bg3Opacity, y: bg3Y, scale: bg3Scale }}
          className="absolute flex items-center justify-center pointer-events-none"
        >
          <div className="relative size-[440px] sm:size-[560px] lg:size-[680px] flex items-center justify-center">
            <div className="absolute inset-8 rounded-full bg-teal-500/15 blur-3xl" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <div className="absolute top-4 left-1/2 -translate-x-1/2 size-4 rounded-full bg-teal-400 shadow-md shadow-teal-400" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 size-4 rounded-full bg-sky-400 shadow-md shadow-sky-400" />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 size-4 rounded-full bg-emerald-400 shadow-md shadow-emerald-400" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 size-4 rounded-full bg-indigo-400 shadow-md shadow-indigo-400" />
            </motion.div>
            <BrainCircuit className="size-36 text-teal-400/40 animate-pulse" />
          </div>
        </motion.div>

        {/* Visual 4: Clinical Shield & Concentric Energy Rings */}
        <motion.div
          style={{ opacity: bg4Opacity, y: bg4Y, scale: bg4Scale }}
          className="absolute flex items-center justify-center pointer-events-none"
        >
          <div className="relative size-[440px] sm:size-[560px] lg:size-[680px] flex items-center justify-center">
            <div className="absolute inset-8 rounded-full bg-teal-500/20 blur-3xl" />
            <motion.div
              animate={{ scale: [1, 1.25, 1.45], opacity: [0.7, 0.3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-8 rounded-full border border-teal-500/40"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1.55], opacity: [0.6, 0.25, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1, ease: 'easeOut' }}
              className="absolute inset-16 rounded-full border border-emerald-500/35"
            />
            <ShieldCheck className="size-36 text-teal-400/45" />
          </div>
        </motion.div>
      </div>

      {/* ======================================================== */}
      {/* FOREGROUND NARRATIVE TEXT (Seamless Continuous Cross-Fade) */}
      {/* ======================================================== */}
      <main className="relative z-20 flex-1 flex items-center justify-center w-full max-w-6xl mx-auto px-6 sm:px-12 pointer-events-none">
        {/* Phase 1: The Problem */}
        <motion.div
          style={{ opacity: p1Opacity, y: p1Y, scale: p1Scale }}
          className="absolute inset-x-6 sm:inset-x-12 flex flex-col items-center justify-center text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-mono tracking-widest uppercase border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300">
            <span className="size-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-ping" />
            <span>THE GLOBAL CRISIS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white max-w-5xl">
            Lung cancer is the{' '}
            <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-sky-600 dark:from-teal-300 dark:via-teal-400 dark:to-sky-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(45,212,191,0.35)]">
              leading cause
            </span>{' '}
            of cancer death.
          </h1>

          <p className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-700 dark:text-slate-300 max-w-4xl leading-tight">
            Yet,{' '}
            <span className="text-rose-600 dark:text-rose-400 underline decoration-rose-500/60 underline-offset-8">
              70% of rural patients
            </span>{' '}
            never get screened.
          </p>
        </motion.div>

        {/* Phase 2: The Barrier */}
        <motion.div
          style={{ opacity: p2Opacity, y: p2Y, scale: p2Scale }}
          className="absolute inset-x-6 sm:inset-x-12 flex flex-col items-center justify-center text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-mono tracking-widest uppercase border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <span className="size-1.5 rounded-full bg-amber-500 animate-ping" />
            <span>THE INFRASTRUCTURE DEFICIT</span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white max-w-5xl">
            It’s not because they are{' '}
            <span className="text-slate-500 dark:text-slate-400 italic">low-risk</span>.
          </h2>

          <p className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-700 dark:text-slate-300 max-w-4xl leading-tight">
            It’s because the{' '}
            <span className="text-amber-600 dark:text-amber-400">
              CT scanner is 3 hours away
            </span>
            , and the{' '}
            <span className="text-rose-600 dark:text-rose-400">
              radiation risk is real
            </span>
            .
          </p>
        </motion.div>

        {/* Phase 3: The Solution */}
        <motion.div
          style={{ opacity: p3Opacity, y: p3Y, scale: p3Scale }}
          className="absolute inset-x-6 sm:inset-x-12 flex flex-col items-center justify-center text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-mono tracking-widest uppercase border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300">
            <span className="size-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-ping" />
            <span>THE PARADIGM SHIFT</span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white max-w-5xl">
            <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-sky-600 dark:from-teal-300 dark:via-teal-400 dark:to-sky-400 bg-clip-text text-transparent">
              Lungent
            </span>{' '}
            flips the funnel.
          </h2>

          <p className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-700 dark:text-slate-300 max-w-4xl leading-tight">
            <span className="text-teal-600 dark:text-teal-400">AI-powered</span>,{' '}
            <span className="text-sky-600 dark:text-sky-400">non-imaging</span> risk
            stratification.
          </p>
        </motion.div>

        {/* Phase 4: The Mission & Final Authentication Climax */}
        <motion.div
          style={{ opacity: p4Opacity, y: p4Y, scale: p4Scale }}
          className="absolute inset-x-6 sm:inset-x-12 flex flex-col items-center justify-center text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-mono tracking-widest uppercase border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300">
            <Sparkles className="size-3.5 text-teal-600 dark:text-teal-400" />
            <span>CLINICAL INTEGRITY</span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white max-w-5xl">
            Engineered to{' '}
            <span className="text-teal-600 dark:text-teal-400">
              minimize false negatives
            </span>
            .
          </h2>

          <p className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-700 dark:text-slate-300 max-w-4xl leading-tight">
            Detecting risk{' '}
            <span className="text-teal-700 dark:text-teal-300 underline decoration-teal-500/60 underline-offset-8">
              before the CT scan
            </span>
            .
          </p>

          {/* Final CTA Block (Entry Mode Only - Smoothly appears at the conclusion of Phase 4) */}
          {isEntry && (
            <motion.div
              style={{ opacity: ctaOpacity, y: ctaY, scale: ctaScale }}
              className="pt-6 flex flex-col items-center justify-center space-y-5 pointer-events-auto w-full max-w-md"
            >
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={handleAuthRedirect}
                  className="w-full py-4 px-8 rounded-2xl bg-teal-600 hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 font-bold text-base sm:text-lg shadow-xl shadow-teal-500/25 hover:scale-105 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <LogIn className="size-5" />
                  <span>Proceed to Sign In / Register</span>
                  <ArrowRight className="size-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <Link
                  href="/register"
                  className="hover:text-teal-600 dark:hover:text-teal-400 underline underline-offset-4 transition-colors font-semibold"
                >
                  Create New Account
                </Link>
                <span>·</span>
                <button
                  type="button"
                  onClick={replayAnimation}
                  className="inline-flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Replay Film</span>
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </aside>
  )
}

export default IntroPresentation
