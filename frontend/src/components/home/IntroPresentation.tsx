'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import {
  FastForward,
  Activity,
  ArrowRight,
  LogIn,
  UserPlus,
  Radiation,
  ShieldAlert,
  BrainCircuit,
  Cpu,
  ShieldCheck,
  Lock,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { cn } from '@/lib/utils'

export interface IntroPresentationProps {
  /**
   * Callback fired to proceed to authentication (/login).
   */
  onProceedToAuth?: () => void
  /**
   * Optional dismiss handler (used when authenticated and replaying on idle).
   */
  onDismiss?: () => void
  /**
   * Whether the user is currently authenticated.
   * Defaults to false (locked mode).
   */
  isAuthenticated?: boolean
  /**
   * Slide duration in milliseconds. Defaults to 4500ms.
   */
  slideDurationMs?: number
}

export function IntroPresentation({
  onProceedToAuth,
  onDismiss,
  isAuthenticated = false,
  slideDurationMs = 4500,
}: IntroPresentationProps) {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef<number>(0)
  const [progress, setProgress] = useState(0)

  // 0: Problem, 1: Barrier, 2: Solution, 3: Mission, 4: Final Auth CTA
  const totalSlides = 5

  // Mandatory Body Scroll Lock (Task 2)
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
    } else if (onDismiss && isAuthenticated) {
      onDismiss()
    } else {
      router.push('/login')
    }
  }, [onProceedToAuth, onDismiss, isAuthenticated, router])

  // Navigation handlers
  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      if (prev < totalSlides - 1) {
        return prev + 1
      }
      return prev
    })
  }, [totalSlides])

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : 0))
  }, [])

  // Auto-advance timer (slides 0 through 3 auto-advance; slide 4 is the final CTA screen)
  useEffect(() => {
    if (isPaused || currentSlide >= totalSlides - 1) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      return
    }

    startTimeRef.current = Date.now()
    setProgress(0)

    const progressInterval = setInterval(() => {
      if (startTimeRef.current === 0) return
      const elapsed = Date.now() - startTimeRef.current
      const pct = Math.min(100, (elapsed / slideDurationMs) * 100)
      setProgress(pct)
    }, 40)

    timerRef.current = setTimeout(() => {
      goToNextSlide()
    }, slideDurationMs)

    return () => {
      clearInterval(progressInterval)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [currentSlide, isPaused, slideDurationMs, goToNextSlide, totalSlides])

  // Keyboard navigation (Strictly NO scroll/wheel dismissal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleAuthRedirect()
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextSlide()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevSlide()
      } else if (e.key === 'Enter') {
        if (currentSlide === totalSlides - 1) {
          handleAuthRedirect()
        } else {
          goToNextSlide()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleAuthRedirect, currentSlide, totalSlides, goToNextSlide, goToPrevSlide])

  return (
    <aside
      aria-label="Lungent Cinematic Introduction"
      tabIndex={0}
      className="fixed inset-0 z-[999] flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Ambient Respiration & Lighting Mesh (Theme Adaptive) */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Subtle dot matrix grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-30 dark:opacity-40" />

        {/* Breathing glowing teal orb */}
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] rounded-full bg-teal-500/10 dark:bg-teal-500/15 blur-[120px] sm:blur-[160px] animate-pulse" />

        {/* Depth accent orb */}
        <div
          className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] rounded-full bg-sky-500/10 dark:bg-sky-500/15 blur-[120px] sm:blur-[160px] animate-pulse"
          style={{ animationDuration: '6s', animationDelay: '2s' }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-50/40 dark:via-slate-950/50 to-slate-50/90 dark:to-slate-950/90 pointer-events-none" />
      </div>

      {/* Top Header Bar: Progress Pills, Theme Toggle, and Skip Intro Button */}
      <header className="relative z-30 w-full px-5 py-4 sm:px-10 sm:py-6 flex items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md bg-white/40 dark:bg-slate-950/40">
        {/* Segmented Slide Indicators */}
        <div className="flex items-center gap-2 sm:gap-2.5 max-w-xs sm:max-w-sm w-full">
          {Array.from({ length: totalSlides }).map((_, idx) => {
            const isActive = idx === currentSlide
            const isCompleted = idx < currentSlide

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Jump to slide ${idx + 1}`}
                className="flex-1 h-1.5 sm:h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer relative"
              >
                {isCompleted && (
                  <div className="h-full w-full bg-teal-600 dark:bg-teal-400 rounded-full" />
                )}
                {isActive && (
                  <div
                    className="h-full bg-teal-600 dark:bg-teal-400 rounded-full transition-all duration-75"
                    style={{
                      width:
                        currentSlide === totalSlides - 1
                          ? '100%'
                          : `${progress}%`,
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Right Action Tools: Theme Toggle + Skip Intro Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />

          <button
            type="button"
            onClick={handleAuthRedirect}
            aria-label="Skip to Sign In"
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4.5 sm:py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-500/50 shadow-xs hover:shadow-md transition-all active:scale-95 text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <span>Skip Intro</span>
            <FastForward className="size-3.5 sm:size-4 text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform" />
            <kbd className="hidden md:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              Esc
            </kbd>
          </button>
        </div>
      </header>

      {/* Main Center Stage: Animated Slides */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 lg:px-12 py-6 w-full max-w-7xl mx-auto overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* SLIDE 1: The Problem */}
          {currentSlide === 0 && (
            <motion.div
              key="slide-1"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 1.02 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center w-full"
            >
              {/* Left Column: Animated Visual (Pulsing Lungs + Smoke Particles) */}
              <div className="flex items-center justify-center order-2 lg:order-1">
                <div className="relative size-64 sm:size-80 lg:size-96 flex items-center justify-center">
                  {/* Floating smoke particles */}
                  <motion.div
                    className="absolute size-3.5 rounded-full bg-slate-400/30 dark:bg-slate-500/40 blur-xs"
                    animate={{ y: [-10, -70, -120], x: [0, 15, -10], opacity: [0, 0.8, 0], scale: [0.8, 1.4, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="absolute size-5 rounded-full bg-slate-400/25 dark:bg-slate-500/30 blur-xs"
                    animate={{ y: [-5, -60, -110], x: [-10, -25, 5], opacity: [0, 0.7, 0], scale: [1, 1.6, 0.7] }}
                    transition={{ duration: 3.6, repeat: Infinity, delay: 1, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="absolute size-4 rounded-full bg-teal-500/20 blur-xs"
                    animate={{ y: [0, -80, -130], x: [10, -15, 20], opacity: [0, 0.6, 0], scale: [0.9, 1.3, 0.6] }}
                    transition={{ duration: 4.2, repeat: Infinity, delay: 1.8, ease: 'easeOut' }}
                  />

                  {/* Pulsing Lungs Glow Background */}
                  <div className="absolute inset-4 rounded-full bg-teal-500/10 dark:bg-teal-500/20 blur-2xl animate-pulse" />

                  {/* Anatomical Lung SVG Illustration */}
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.92, 1, 0.92] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-10 p-6 rounded-3xl bg-white/70 dark:bg-slate-900/80 border border-teal-500/30 dark:border-teal-500/40 shadow-xl dark:shadow-teal-500/5 backdrop-blur-md"
                  >
                    <svg
                      viewBox="0 0 200 200"
                      className="size-48 sm:size-56 lg:size-64 text-teal-600 dark:text-teal-400 fill-none"
                    >
                      {/* Trachea */}
                      <path
                        d="M100 25 V75"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeLinecap="round"
                      />
                      {/* Left Bronchus */}
                      <path
                        d="M100 75 Q85 85 70 100"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      {/* Right Bronchus */}
                      <path
                        d="M100 75 Q115 85 130 100"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      {/* Left Lung Lobe */}
                      <path
                        d="M70 95 C45 95 30 120 30 150 C30 175 50 185 75 185 C90 185 95 170 95 150 C95 125 90 95 70 95 Z"
                        className="stroke-teal-600 dark:stroke-teal-400 fill-teal-500/15 dark:fill-teal-500/25"
                        strokeWidth="5"
                        strokeLinejoin="round"
                      />
                      {/* Right Lung Lobe */}
                      <path
                        d="M130 95 C155 95 170 120 170 150 C170 175 150 185 125 185 C110 185 105 170 105 150 C105 125 110 95 130 95 Z"
                        className="stroke-teal-600 dark:stroke-teal-400 fill-teal-500/15 dark:fill-teal-500/25"
                        strokeWidth="5"
                        strokeLinejoin="round"
                      />
                    </svg>

                    {/* Central Rhythm Badge */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-semibold border border-teal-500/30">
                      <Activity className="size-3.5 animate-pulse text-teal-600 dark:text-teal-400" />
                      <span>Early Pulmonary Screening Gap</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Right Column: Slide Text */}
              <div className="space-y-5 text-left order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs sm:text-sm font-mono tracking-widest uppercase border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300">
                  <span className="size-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-ping" />
                  <span>01 / 04 · THE GLOBAL CRISIS</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.12]">
                  Lung cancer is the{' '}
                  <span className="text-teal-600 dark:text-teal-400 drop-shadow-[0_0_25px_rgba(45,212,191,0.35)]">
                    leading cause
                  </span>{' '}
                  of cancer death.
                </h1>

                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-700 dark:text-slate-300 leading-snug">
                  Yet,{' '}
                  <span className="text-rose-600 dark:text-rose-400 underline decoration-rose-500/50 underline-offset-6">
                    70% of rural patients
                  </span>{' '}
                  never get screened.
                </p>
              </div>
            </motion.div>
          )}

          {/* SLIDE 2: The Barrier */}
          {currentSlide === 1 && (
            <motion.div
              key="slide-2"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 1.02 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center w-full"
            >
              {/* Left Column: Animated Visual (CT Scanner / Radiation Warning Shield) */}
              <div className="flex items-center justify-center order-2 lg:order-1">
                <div className="relative size-64 sm:size-80 lg:size-96 flex items-center justify-center">
                  {/* Rotating CT Gantry Ring */}
                  <motion.div
                    className="absolute inset-2 sm:inset-4 rounded-full border-2 border-dashed border-amber-500/40 dark:border-amber-400/40"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  />

                  {/* Pulsing Radiation Wave Aura */}
                  <motion.div
                    className="absolute inset-8 rounded-full border border-rose-500/30 dark:border-rose-500/40"
                    animate={{ scale: [1, 1.25, 1.45], opacity: [0.7, 0.3, 0] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
                  />

                  {/* Warning Core Card */}
                  <div className="relative z-10 flex flex-col items-center justify-center p-8 rounded-3xl bg-white/70 dark:bg-slate-900/80 border border-amber-500/40 dark:border-amber-500/50 shadow-2xl backdrop-blur-md space-y-4">
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="size-20 sm:size-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg"
                    >
                      <Radiation className="size-12 sm:size-14 animate-spin text-amber-600 dark:text-amber-400" style={{ animationDuration: '10s' }} />
                    </motion.div>

                    <div className="text-center space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-500/30">
                        <ShieldAlert className="size-3.5" />
                        <span>Infrastructure Deficit</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                        Low-Dose CT (LDCT) Radiation &amp; Cost
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Slide Text */}
              <div className="space-y-5 text-left order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs sm:text-sm font-mono tracking-widest uppercase border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>02 / 04 · THE INFRASTRUCTURE BARRIER</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.12]">
                  It’s not because they are{' '}
                  <span className="text-slate-500 dark:text-slate-400 italic">low-risk</span>.
                </h1>

                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-700 dark:text-slate-300 leading-snug">
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
              </div>
            </motion.div>
          )}

          {/* SLIDE 3: The Solution */}
          {currentSlide === 2 && (
            <motion.div
              key="slide-3"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 1.02 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center w-full"
            >
              {/* Left Column: Animated Visual (Neural Matrix & Non-imaging Data Nodes) */}
              <div className="flex items-center justify-center order-2 lg:order-1">
                <div className="relative size-64 sm:size-80 lg:size-96 flex items-center justify-center">
                  {/* Outer Orbiting Data Nodes */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-[10px] font-mono text-teal-700 dark:text-teal-300 font-semibold shadow-xs">
                      Smoking Pack-Years
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-[10px] font-mono text-sky-700 dark:text-sky-300 font-semibold shadow-xs">
                      Biomass Exposure
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs">
                      Symptom Timeline
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-mono text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs">
                      Occupational Dust
                    </div>
                  </motion.div>

                  {/* Central Neural Brain Core */}
                  <div className="relative z-10 flex flex-col items-center justify-center p-8 rounded-3xl bg-white/70 dark:bg-slate-900/80 border border-teal-500/40 dark:border-teal-500/50 shadow-2xl backdrop-blur-md space-y-3">
                    <div className="relative size-20 sm:size-24 rounded-2xl bg-gradient-to-br from-teal-500/20 via-sky-500/20 to-indigo-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/40 flex items-center justify-center shadow-lg">
                      <BrainCircuit className="size-12 sm:size-14 animate-pulse text-teal-600 dark:text-teal-400" />
                    </div>

                    <div className="text-center space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-500/30">
                        <Cpu className="size-3.5" />
                        <span>Non-Imaging AI Core</span>
                      </div>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        Gradient Boosting · ROC-AUC 0.890
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Slide Text */}
              <div className="space-y-5 text-left order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs sm:text-sm font-mono tracking-widest uppercase border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300">
                  <span className="size-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-ping" />
                  <span>03 / 04 · THE PARADIGM SHIFT</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.12]">
                  <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-sky-600 dark:from-teal-300 dark:via-teal-400 dark:to-sky-400 bg-clip-text text-transparent">
                    Lungent
                  </span>{' '}
                  flips the funnel.
                </h1>

                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-700 dark:text-slate-300 leading-snug">
                  <span className="text-teal-600 dark:text-teal-400">AI-powered</span>,{' '}
                  <span className="text-sky-600 dark:text-sky-400">non-imaging</span> risk
                  stratification.
                </p>
              </div>
            </motion.div>
          )}

          {/* SLIDE 4: The Mission */}
          {currentSlide === 3 && (
            <motion.div
              key="slide-4"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 1.02 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center w-full"
            >
              {/* Left Column: Animated Visual (Protective Shield + Case Capture) */}
              <div className="flex items-center justify-center order-2 lg:order-1">
                <div className="relative size-64 sm:size-80 lg:size-96 flex items-center justify-center">
                  {/* Concentric Protection Ripples */}
                  <motion.div
                    className="absolute inset-4 rounded-full border border-teal-500/30 dark:border-teal-400/40"
                    animate={{ scale: [1, 1.25, 1.4], opacity: [0.8, 0.35, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="absolute inset-8 rounded-full border border-emerald-500/25 dark:border-emerald-400/35"
                    animate={{ scale: [1, 1.3, 1.5], opacity: [0.7, 0.25, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1, ease: 'easeOut' }}
                  />

                  {/* Shield Container */}
                  <div className="relative z-10 flex flex-col items-center justify-center p-8 rounded-3xl bg-white/70 dark:bg-slate-900/80 border border-teal-500/40 dark:border-teal-500/50 shadow-2xl backdrop-blur-md space-y-4">
                    <motion.div
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="size-20 sm:size-24 rounded-2xl bg-gradient-to-br from-teal-500/25 to-emerald-500/25 text-teal-600 dark:text-teal-400 border border-teal-500/40 flex items-center justify-center shadow-lg"
                    >
                      <ShieldCheck className="size-12 sm:size-14 text-teal-600 dark:text-teal-400" />
                    </motion.div>

                    <div className="text-center space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-500/30">
                        <Sparkles className="size-3.5" />
                        <span>94.43% High-Risk Case Capture</span>
                      </div>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        Sensitivity: 0.850 · Equity Floor Safe
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Slide Text */}
              <div className="space-y-5 text-left order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs sm:text-sm font-mono tracking-widest uppercase border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300">
                  <span className="size-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-ping" />
                  <span>04 / 04 · CLINICAL INTEGRITY</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.12]">
                  Engineered to{' '}
                  <span className="text-teal-600 dark:text-teal-400">
                    minimize false negatives
                  </span>
                  .
                </h1>

                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-700 dark:text-slate-300 leading-snug">
                  Detecting risk{' '}
                  <span className="text-teal-700 dark:text-teal-300 underline decoration-teal-500/50 underline-offset-6">
                    before the CT scan
                  </span>
                  .
                </p>
              </div>
            </motion.div>
          )}

          {/* SLIDE 5: The Final Call-To-Action (Task 4) */}
          {currentSlide === 4 && (
            <motion.div
              key="slide-5"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 1.02 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center space-y-8 text-center max-w-3xl mx-auto w-full"
            >
              {/* Brand Logo & Lock Indicator */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-teal-500/20 dark:bg-teal-500/30 rounded-full blur-2xl group-hover:bg-teal-500/40 transition-all duration-500" />
                <div className="relative flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-teal-500/40 rounded-3xl px-8 py-5 shadow-2xl">
                  <Logo size="lg" variant="full" />
                </div>
              </div>

              {/* Guard Notice & Headline */}
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-bold border border-amber-500/30">
                  <Lock className="size-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Verified Access Required</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  To enter the platform, please authenticate.
                </h2>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  Lungent is an intelligent pulmonary risk assessment and clinical decision-support system.
                  Please sign in or create an account to access clinical workspaces, risk tools, and screening records.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md pt-2">
                <button
                  type="button"
                  onClick={handleAuthRedirect}
                  className="w-full py-4 px-8 rounded-2xl bg-teal-600 hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 font-bold text-base sm:text-lg shadow-xl shadow-teal-500/20 hover:scale-105 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <LogIn className="size-5" />
                  <span>Proceed to Sign In / Register</span>
                  <ArrowRight className="size-5" />
                </button>
              </div>

              {/* Auxiliary actions */}
              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 pt-2">
                <Link
                  href="/register"
                  className="hover:text-teal-600 dark:hover:text-teal-400 underline underline-offset-4 transition-colors font-semibold"
                >
                  Create New Account
                </Link>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setCurrentSlide(0)}
                  className="inline-flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Replay Presentation</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Footer Bar: Manual Slide Navigation Arrows */}
      <footer className="relative z-30 w-full px-5 py-4 sm:px-10 sm:py-5 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md bg-white/40 dark:bg-slate-950/40 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
        {/* Previous Button */}
        <button
          type="button"
          onClick={goToPrevSlide}
          disabled={currentSlide === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronLeft className="size-4" />
          <span>Previous</span>
        </button>

        {/* Slide Counter */}
        <span className="font-mono text-xs">
          {currentSlide + 1} of {totalSlides}
        </span>

        {/* Next / Proceed Button */}
        {currentSlide < totalSlides - 1 ? (
          <button
            type="button"
            onClick={goToNextSlide}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-500/30 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-all font-semibold cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAuthRedirect}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-950 font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="size-4" />
          </button>
        )}
      </footer>
    </aside>
  )
}

export default IntroPresentation
