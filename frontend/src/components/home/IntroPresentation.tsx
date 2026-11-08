'use client'

import React, { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useAnimationControls } from 'motion/react'
import {
  FastForward,
  Activity,
  ArrowRight,
  LogIn,
  Radiation,
  ShieldAlert,
  BrainCircuit,
  Cpu,
  ShieldCheck,
  Lock,
  RotateCcw,
  Sparkles,
  ChevronDown,
  X,
  Compass,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { cn } from '@/lib/utils'

export interface IntroPresentationProps {
  /**
   * Presentation display mode:
   * - 'entry': Runs once through the 5 slides, ending with the CTA sign-in button.
   * - 'idle': Loops continuously in the background. No sign-in button. Disappears on interaction.
   */
  mode?: 'entry' | 'idle'
  /**
   * Callback fired to proceed to authentication (/login).
   */
  onProceedToAuth?: () => void
  /**
   * Callback fired to dismiss the presentation (used in idle mode).
   */
  onDismiss?: () => void
}

export function IntroPresentation({
  mode = 'entry',
  onProceedToAuth,
  onDismiss,
}: IntroPresentationProps) {
  const router = useRouter()
  const controls = useAnimationControls()
  const isIdle = mode === 'idle'
  const isEntry = mode === 'entry'

  // Mandatory Body Scroll Lock (Task 2)
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Universal handler to route to /login
  const handleAuthRedirect = useCallback(() => {
    if (onProceedToAuth) {
      onProceedToAuth()
    } else {
      router.push('/login')
    }
  }, [onProceedToAuth, router])

  // In idle mode, any interaction dismisses the presentation immediately
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

  // Keyboard navigation for entry mode
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

  // Continuous auto-scroll animation
  useEffect(() => {
    if (isEntry) {
      // 5 sections (0vh to 500vh). Scroll from 0% to -80% over 28s and rest on slide 5
      controls.start({
        y: ['0%', '-80%'],
        transition: {
          duration: 28,
          ease: [0.25, 0.1, 0.25, 1],
        },
      })
    } else {
      // 8 sections (2 copies of 4 slides). Scroll from 0% to -50% with infinite seamless repeat
      controls.start({
        y: ['0%', '-50%'],
        transition: {
          duration: 32,
          ease: 'linear',
          repeat: Infinity,
        },
      })
    }
  }, [isEntry, isIdle, controls])

  // Jump to specific slide in entry mode
  const jumpToSlide = (slideIndex: number) => {
    if (!isEntry) return
    const targetY = -(slideIndex * 20)
    controls.start({
      y: `${targetY}%`,
      transition: { duration: 0.8, ease: 'easeOut' },
    })
  }

  return (
    <aside
      aria-label="Lungent Presentation Display"
      tabIndex={0}
      className="fixed inset-0 z-[999] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden select-none"
    >
      {/* Background Ambient Respiration Mesh */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Subtle dot matrix grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-35 dark:opacity-40" />

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

      {/* Fixed Top Bar Header */}
      <header className="fixed top-0 inset-x-0 z-50 px-5 py-4 sm:px-10 sm:py-5 flex items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md bg-white/60 dark:bg-slate-950/60">
        {/* Left: Brand Identity & Mode Tag */}
        <div className="flex items-center gap-3">
          <Logo size="sm" variant="compact" />
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-semibold">
            <span className="size-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-ping" />
            <span>{isIdle ? 'Idle Ambient Loop' : 'Clinical Story Marquee'}</span>
          </div>
        </div>

        {/* Center: Slide Jump Pills (Entry mode only) */}
        {isEntry && (
          <nav aria-label="Presentation Jump Points" className="hidden md:flex items-center gap-2">
            {[
              { label: 'Problem', idx: 0 },
              { label: 'Barrier', idx: 1 },
              { label: 'Solution', idx: 2 },
              { label: 'Mission', idx: 3 },
              { label: 'Auth', idx: 4 },
            ].map((item) => (
              <button
                key={item.idx}
                type="button"
                onClick={() => jumpToSlide(item.idx)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {/* Right Action Tools: Theme Toggle & Skip/Exit Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />

          {isEntry ? (
            <button
              type="button"
              onClick={handleAuthRedirect}
              aria-label="Skip to Sign In"
              className="group inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4.5 sm:py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-500/50 shadow-xs hover:shadow-md transition-all active:scale-95 text-xs sm:text-sm font-semibold cursor-pointer"
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
      </header>

      {/* Continuous Vertical Marquee Container */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <motion.div animate={controls} className="w-full flex flex-col">
          {/* SLIDE 1: The Problem */}
          <section className="h-screen w-full flex items-center justify-center px-6 sm:px-12 lg:px-20 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full max-w-7xl mx-auto">
              {/* Left Column: Premium Abstract Lungs Visual */}
              <div className="flex items-center justify-center order-2 lg:order-1">
                <div className="relative size-72 sm:size-84 lg:size-96 flex items-center justify-center">
                  {/* Subtle ambient cyan/teal background bloom */}
                  <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-teal-500/20 via-cyan-500/15 to-transparent blur-3xl animate-pulse" />

                  {/* Layered Abstract Lungs Container */}
                  <motion.div
                    animate={{ scale: [1, 1.045, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-10 p-8 rounded-3xl bg-white/70 dark:bg-slate-900/80 border border-teal-500/30 dark:border-teal-500/40 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center"
                  >
                    <svg
                      viewBox="0 0 240 240"
                      className="size-52 sm:size-60 lg:size-64 drop-shadow-[0_0_25px_rgba(45,212,191,0.35)]"
                    >
                      {/* Trachea with gradient stroke */}
                      <path
                        d="M120 20 V80"
                        className="stroke-teal-600 dark:stroke-teal-400"
                        strokeWidth="10"
                        strokeLinecap="round"
                      />
                      {/* Primary Bronchi Left & Right */}
                      <path
                        d="M120 80 Q100 95 80 115"
                        className="stroke-teal-600 dark:stroke-teal-400"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M120 80 Q140 95 160 115"
                        className="stroke-teal-600 dark:stroke-teal-400"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      {/* Secondary Bronchial Branching Left */}
                      <path
                        d="M80 115 Q60 135 50 165"
                        className="stroke-teal-500/80 dark:stroke-teal-400/80"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M80 115 Q90 140 85 175"
                        className="stroke-teal-500/80 dark:stroke-teal-400/80"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                      {/* Secondary Bronchial Branching Right */}
                      <path
                        d="M160 115 Q180 135 190 165"
                        className="stroke-teal-500/80 dark:stroke-teal-400/80"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M160 115 Q150 140 155 175"
                        className="stroke-teal-500/80 dark:stroke-teal-400/80"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />

                      {/* Left Pulmonary Lobe Volume */}
                      <path
                        d="M80 100 C50 100 35 130 35 165 C35 195 60 210 90 210 C108 210 115 190 115 165 C115 135 105 100 80 100 Z"
                        className="stroke-teal-600 dark:stroke-teal-400 fill-teal-500/15 dark:fill-teal-500/20"
                        strokeWidth="4"
                        strokeLinejoin="round"
                      />
                      {/* Right Pulmonary Lobe Volume */}
                      <path
                        d="M160 100 C190 100 205 130 205 165 C205 195 180 210 150 210 C132 210 125 190 125 165 C125 135 135 100 160 100 Z"
                        className="stroke-teal-600 dark:stroke-teal-400 fill-teal-500/15 dark:fill-teal-500/20"
                        strokeWidth="4"
                        strokeLinejoin="round"
                      />

                      {/* Terminal Alveoli Cluster Nodes */}
                      <circle cx="50" cy="165" r="4.5" className="fill-teal-500 animate-pulse" />
                      <circle cx="85" cy="175" r="4.5" className="fill-teal-400 animate-pulse" />
                      <circle cx="190" cy="165" r="4.5" className="fill-teal-500 animate-pulse" />
                      <circle cx="155" cy="175" r="4.5" className="fill-teal-400 animate-pulse" />
                    </svg>

                    {/* Status Badge */}
                    <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-semibold border border-teal-500/30">
                      <Activity className="size-3.5 text-teal-600 dark:text-teal-400 animate-pulse" />
                      <span>Early Pulmonary Screening Gap</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Right Column: Slide Text */}
              <div className="space-y-6 text-left order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs sm:text-sm font-mono tracking-widest uppercase border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300">
                  <span className="size-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-ping" />
                  <span>01 / 04 · THE GLOBAL CRISIS</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.12]">
                  Lung cancer is the{' '}
                  <span className="text-teal-600 dark:text-teal-400 drop-shadow-[0_0_30px_rgba(45,212,191,0.4)]">
                    leading cause
                  </span>{' '}
                  of cancer death.
                </h1>

                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-700 dark:text-slate-300 leading-snug">
                  Yet,{' '}
                  <span className="text-rose-600 dark:text-rose-400 underline decoration-rose-500/50 underline-offset-8">
                    70% of rural patients
                  </span>{' '}
                  never get screened.
                </p>
              </div>
            </div>
          </section>

          {/* SLIDE 2: The Barrier */}
          <section className="h-screen w-full flex items-center justify-center px-6 sm:px-12 lg:px-20 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full max-w-7xl mx-auto">
              {/* Left Column: Stylized Radar / Scanner Visual */}
              <div className="flex items-center justify-center order-2 lg:order-1">
                <div className="relative size-72 sm:size-84 lg:size-96 flex items-center justify-center">
                  {/* Concentric Distance Radar Rings */}
                  <div className="absolute inset-0 rounded-full border border-amber-500/20 dark:border-amber-400/20" />
                  <div className="absolute inset-8 rounded-full border border-amber-500/25 dark:border-amber-400/25" />
                  <div className="absolute inset-16 rounded-full border border-amber-500/30 dark:border-amber-400/30" />

                  {/* Rotating Radar Sweep Arm */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(245,158,11,0.25)_60deg,transparent_70deg)] pointer-events-none"
                  />

                  {/* Warning Core Card */}
                  <div className="relative z-10 flex flex-col items-center justify-center p-8 rounded-3xl bg-white/70 dark:bg-slate-900/80 border border-amber-500/40 dark:border-amber-500/50 shadow-2xl backdrop-blur-xl space-y-4">
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="size-20 sm:size-24 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-rose-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg"
                    >
                      <Radiation className="size-12 sm:size-14 text-amber-600 dark:text-amber-400 animate-spin" style={{ animationDuration: '12s' }} />
                    </motion.div>

                    <div className="text-center space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-500/30">
                        <ShieldAlert className="size-3.5" />
                        <span>Infrastructure Deficit</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                        Distance: 120km · Ionizing Radiation Scarcity
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Slide Text */}
              <div className="space-y-6 text-left order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs sm:text-sm font-mono tracking-widest uppercase border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>02 / 04 · THE INFRASTRUCTURE BARRIER</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.12]">
                  It’s not because they are{' '}
                  <span className="text-slate-500 dark:text-slate-400 italic">low-risk</span>.
                </h1>

                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-700 dark:text-slate-300 leading-snug">
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
            </div>
          </section>

          {/* SLIDE 3: The Solution */}
          <section className="h-screen w-full flex items-center justify-center px-6 sm:px-12 lg:px-20 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full max-w-7xl mx-auto">
              {/* Left Column: Interconnected Neural Node Graph Visual */}
              <div className="flex items-center justify-center order-2 lg:order-1">
                <div className="relative size-72 sm:size-84 lg:size-96 flex items-center justify-center">
                  {/* Orbiting Satellite Data Nodes */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-[11px] font-mono text-teal-700 dark:text-teal-300 font-bold shadow-md">
                      Pack-Years History
                    </div>
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-[11px] font-mono text-sky-700 dark:text-sky-300 font-bold shadow-md">
                      Biomass Cooking Smoke
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-mono text-emerald-700 dark:text-emerald-300 font-bold shadow-md">
                      Symptom Timeline
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[11px] font-mono text-indigo-700 dark:text-indigo-300 font-bold shadow-md">
                      Occupational Dust
                    </div>
                  </motion.div>

                  {/* Central Neural Matrix Core */}
                  <div className="relative z-10 flex flex-col items-center justify-center p-8 rounded-3xl bg-white/70 dark:bg-slate-900/80 border border-teal-500/40 dark:border-teal-500/50 shadow-2xl backdrop-blur-xl space-y-4">
                    <div className="relative size-20 sm:size-24 rounded-2xl bg-gradient-to-br from-teal-500/25 via-sky-500/25 to-indigo-500/25 text-teal-600 dark:text-teal-400 border border-teal-500/40 flex items-center justify-center shadow-lg">
                      <BrainCircuit className="size-12 sm:size-14 animate-pulse text-teal-600 dark:text-teal-400" />
                    </div>

                    <div className="text-center space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-500/30">
                        <Cpu className="size-3.5" />
                        <span>Non-Imaging AI Pipeline</span>
                      </div>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        Gradient Boosting · ROC-AUC: 0.890
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Slide Text */}
              <div className="space-y-6 text-left order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs sm:text-sm font-mono tracking-widest uppercase border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300">
                  <span className="size-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-ping" />
                  <span>03 / 04 · THE PARADIGM SHIFT</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.12]">
                  <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-sky-600 dark:from-teal-300 dark:via-teal-400 dark:to-sky-400 bg-clip-text text-transparent">
                    Lungent
                  </span>{' '}
                  flips the funnel.
                </h1>

                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-700 dark:text-slate-300 leading-snug">
                  <span className="text-teal-600 dark:text-teal-400">AI-powered</span>,{' '}
                  <span className="text-sky-600 dark:text-sky-400">non-imaging</span> risk
                  stratification.
                </p>
              </div>
            </div>
          </section>

          {/* SLIDE 4: The Mission */}
          <section className="h-screen w-full flex items-center justify-center px-6 sm:px-12 lg:px-20 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full max-w-7xl mx-auto">
              {/* Left Column: Concentric Glowing Protective Shield Visual */}
              <div className="flex items-center justify-center order-2 lg:order-1">
                <div className="relative size-72 sm:size-84 lg:size-96 flex items-center justify-center">
                  {/* Concentric Protection Ripples */}
                  <motion.div
                    className="absolute inset-4 rounded-full border border-teal-500/35 dark:border-teal-400/40"
                    animate={{ scale: [1, 1.25, 1.45], opacity: [0.8, 0.3, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="absolute inset-10 rounded-full border border-emerald-500/30 dark:border-emerald-400/35"
                    animate={{ scale: [1, 1.3, 1.55], opacity: [0.7, 0.25, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, delay: 1, ease: 'easeOut' }}
                  />

                  {/* Shield Container */}
                  <div className="relative z-10 flex flex-col items-center justify-center p-8 rounded-3xl bg-white/70 dark:bg-slate-900/80 border border-teal-500/40 dark:border-teal-500/50 shadow-2xl backdrop-blur-xl space-y-4">
                    <motion.div
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="size-20 sm:size-24 rounded-2xl bg-gradient-to-br from-teal-500/30 via-emerald-500/25 to-sky-500/25 text-teal-600 dark:text-teal-400 border border-teal-500/40 flex items-center justify-center shadow-lg"
                    >
                      <ShieldCheck className="size-12 sm:size-14 text-teal-600 dark:text-teal-400" />
                    </motion.div>

                    <div className="text-center space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-500/30">
                        <Sparkles className="size-3.5" />
                        <span>94.43% High-Risk Case Capture</span>
                      </div>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        Sensitivity: 0.850 · Equity Floor Certified
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Slide Text */}
              <div className="space-y-6 text-left order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs sm:text-sm font-mono tracking-widest uppercase border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300">
                  <span className="size-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-ping" />
                  <span>04 / 04 · CLINICAL INTEGRITY</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.12]">
                  Engineered to{' '}
                  <span className="text-teal-600 dark:text-teal-400">
                    minimize false negatives
                  </span>
                  .
                </h1>

                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-700 dark:text-slate-300 leading-snug">
                  Detecting risk{' '}
                  <span className="text-teal-700 dark:text-teal-300 underline decoration-teal-500/50 underline-offset-8">
                    before the CT scan
                  </span>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* SLIDE 5: Final CTA (Entry Mode Only) */}
          {isEntry && (
            <section className="h-screen w-full flex items-center justify-center px-6 sm:px-12 lg:px-20 relative">
              <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-3xl mx-auto w-full">
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
                    className="w-full py-4 px-8 rounded-2xl bg-teal-600 hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 font-bold text-base sm:text-lg shadow-xl shadow-teal-500/25 hover:scale-105 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <LogIn className="size-5" />
                    <span>Proceed to Sign In / Register</span>
                    <ArrowRight className="size-5" />
                  </button>
                </div>

                {/* Auxiliary links */}
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
                    onClick={() => jumpToSlide(0)}
                    className="inline-flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Replay Presentation</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* DUPLICATE COPY FOR INFINITE SEAMLESS LOOPING (Idle Mode Only) */}
          {isIdle && (
            <>
              {/* Duplicate Slide 1 */}
              <section className="h-screen w-full flex items-center justify-center px-6 sm:px-12 lg:px-20 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full max-w-7xl mx-auto">
                  <div className="flex items-center justify-center order-2 lg:order-1">
                    <div className="relative size-72 sm:size-84 lg:size-96 flex items-center justify-center">
                      <div className="relative z-10 p-8 rounded-3xl bg-white/70 dark:bg-slate-900/80 border border-teal-500/30 dark:border-teal-500/40 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center">
                        <Activity className="size-24 text-teal-600 dark:text-teal-400 animate-pulse" />
                        <span className="mt-3 text-xs font-semibold text-teal-700 dark:text-teal-300">
                          Pulmonary Risk Stratification
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6 text-left order-1 lg:order-2">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
                      Lung cancer is the{' '}
                      <span className="text-teal-600 dark:text-teal-400">leading cause</span> of cancer death.
                    </h1>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-700 dark:text-slate-300 leading-snug">
                      70% of rural patients never get screened.
                    </p>
                  </div>
                </div>
              </section>

              {/* Duplicate Slide 2 */}
              <section className="h-screen w-full flex items-center justify-center px-6 sm:px-12 lg:px-20 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full max-w-7xl mx-auto">
                  <div className="flex items-center justify-center order-2 lg:order-1">
                    <div className="relative size-72 sm:size-84 lg:size-96 flex items-center justify-center">
                      <div className="relative z-10 p-8 rounded-3xl bg-white/70 dark:bg-slate-900/80 border border-amber-500/40 dark:border-amber-500/50 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center">
                        <Radiation className="size-24 text-amber-600 dark:text-amber-400 animate-spin" style={{ animationDuration: '12s' }} />
                        <span className="mt-3 text-xs font-semibold text-amber-700 dark:text-amber-300">
                          CT Scanner Scarcity
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6 text-left order-1 lg:order-2">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
                      It’s not because they are <span className="text-slate-500 italic">low-risk</span>.
                    </h1>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-700 dark:text-slate-300 leading-snug">
                      The CT scanner is 3 hours away, and radiation risk is real.
                    </p>
                  </div>
                </div>
              </section>

              {/* Duplicate Slide 3 */}
              <section className="h-screen w-full flex items-center justify-center px-6 sm:px-12 lg:px-20 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full max-w-7xl mx-auto">
                  <div className="flex items-center justify-center order-2 lg:order-1">
                    <div className="relative size-72 sm:size-84 lg:size-96 flex items-center justify-center">
                      <div className="relative z-10 p-8 rounded-3xl bg-white/70 dark:bg-slate-900/80 border border-teal-500/40 dark:border-teal-500/50 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center">
                        <BrainCircuit className="size-24 text-teal-600 dark:text-teal-400 animate-pulse" />
                        <span className="mt-3 text-xs font-semibold text-teal-700 dark:text-teal-300">
                          Non-Imaging AI Core
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6 text-left order-1 lg:order-2">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
                      <span className="text-teal-600 dark:text-teal-400">Lungent</span> flips the funnel.
                    </h1>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-700 dark:text-slate-300 leading-snug">
                      AI-powered, non-imaging risk stratification.
                    </p>
                  </div>
                </div>
              </section>

              {/* Duplicate Slide 4 */}
              <section className="h-screen w-full flex items-center justify-center px-6 sm:px-12 lg:px-20 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full max-w-7xl mx-auto">
                  <div className="flex items-center justify-center order-2 lg:order-1">
                    <div className="relative size-72 sm:size-84 lg:size-96 flex items-center justify-center">
                      <div className="relative z-10 p-8 rounded-3xl bg-white/70 dark:bg-slate-900/80 border border-teal-500/40 dark:border-teal-500/50 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center">
                        <ShieldCheck className="size-24 text-teal-600 dark:text-teal-400" />
                        <span className="mt-3 text-xs font-semibold text-teal-700 dark:text-teal-300">
                          94.43% Case Capture
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6 text-left order-1 lg:order-2">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
                      Engineered to <span className="text-teal-600 dark:text-teal-400">minimize false negatives</span>.
                    </h1>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-700 dark:text-slate-300 leading-snug">
                      Detecting risk before the CT scan.
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}
        </motion.div>
      </div>
    </aside>
  )
}

export default IntroPresentation
