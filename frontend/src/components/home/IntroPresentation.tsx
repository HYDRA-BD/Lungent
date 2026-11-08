'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import {
  ChevronDown,
  FastForward,
  Activity,
  ArrowRight,
  LogIn,
  UserPlus,
  ShieldAlert,
  Compass,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { cn } from '@/lib/utils'

export interface IntroPresentationProps {
  /**
   * Callback fired to dismiss the presentation and show the main site.
   */
  onDismiss: () => void
  /**
   * Duration in milliseconds each slide is displayed before auto-advancing.
   * Default: 4000ms (4 seconds).
   */
  slideDurationMs?: number
}

interface SlideData {
  tag: string
  render: () => React.ReactNode
}

export function IntroPresentation({
  onDismiss,
  slideDurationMs = 4000,
}: IntroPresentationProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef<number>(0)
  const [progress, setProgress] = useState(0)

  const totalSlides = 5

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

  // Auto-advance timer (slides 0 through 3 advance automatically; slide 4 stays on CTA)
  useEffect(() => {
    if (isPaused || currentSlide >= totalSlides - 1) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      return
    }

    startTimeRef.current = Date.now()
    setProgress(0)

    // Progress bar tick
    const progressInterval = setInterval(() => {
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

  // Scroll / Wheel detection to dismiss intro
  useEffect(() => {
    let touchStartY = 0

    const handleWheel = (e: WheelEvent) => {
      // Significant wheel scroll dismisses intro
      if (Math.abs(e.deltaY) > 20) {
        onDismiss()
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) {
        touchStartY = e.touches[0].clientY
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        const delta = Math.abs(e.touches[0].clientY - touchStartY)
        if (delta > 40) {
          onDismiss()
        }
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss()
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextSlide()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevSlide()
      } else if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
        if (currentSlide < totalSlides - 1) {
          goToNextSlide()
        } else {
          onDismiss()
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onDismiss, currentSlide, totalSlides, goToNextSlide, goToPrevSlide])

  // Slide definitions matching the story
  const slides: SlideData[] = [
    // Slide 1: The Problem
    {
      tag: '01 / 05 · THE GLOBAL CRISIS',
      render: () => (
        <div className="space-y-6 sm:space-y-8">
          <p className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.12]">
            Lung cancer is the{' '}
            <span className="text-teal-400 drop-shadow-[0_0_30px_rgba(45,212,191,0.45)]">
              leading cause
            </span>{' '}
            of cancer death.
          </p>
          <p className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-300 leading-[1.2]">
            Yet,{' '}
            <span className="text-teal-300 underline decoration-teal-400/50 decoration-wavy underline-offset-8">
              70% of rural patients
            </span>{' '}
            never get screened.
          </p>
        </div>
      ),
    },

    // Slide 2: The Barrier
    {
      tag: '02 / 05 · THE HEALTHCARE BARRIER',
      render: () => (
        <div className="space-y-6 sm:space-y-8">
          <p className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15]">
            It’s not because they are{' '}
            <span className="text-slate-400 italic font-medium">low-risk</span>.
          </p>
          <p className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-200 leading-[1.2]">
            It’s because the{' '}
            <span className="text-teal-400 drop-shadow-[0_0_30px_rgba(45,212,191,0.45)]">
              CT scanner is 3 hours away
            </span>
            , and the{' '}
            <span className="text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.35)]">
              radiation risk is real
            </span>
            .
          </p>
        </div>
      ),
    },

    // Slide 3: The Solution
    {
      tag: '03 / 05 · THE PARADIGM SHIFT',
      render: () => (
        <div className="space-y-6 sm:space-y-8">
          <p className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.12]">
            <span className="bg-gradient-to-r from-teal-300 via-teal-400 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(45,212,191,0.5)]">
              Lungent
            </span>{' '}
            flips the funnel.
          </p>
          <p className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-100 leading-[1.2]">
            <span className="text-teal-400">AI-powered</span>,{' '}
            <span className="text-sky-400">non-imaging</span> risk
            stratification.
          </p>
        </div>
      ),
    },

    // Slide 4: The Core Mission
    {
      tag: '04 / 05 · CLINICAL RIGOR',
      render: () => (
        <div className="space-y-6 sm:space-y-8">
          <p className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.14]">
            Engineered to{' '}
            <span className="text-teal-400 drop-shadow-[0_0_35px_rgba(45,212,191,0.45)]">
              minimize false negatives
            </span>
            .
          </p>
          <p className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-300 leading-[1.2]">
            Detecting risk{' '}
            <span className="text-teal-300 underline decoration-teal-400/60 underline-offset-8">
              before the CT scan
            </span>
            .
          </p>
        </div>
      ),
    },

    // Slide 5: Call to Action & Brand Reveal
    {
      tag: '05 / 05 · ENTER LUNGENT',
      render: () => (
        <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-4xl mx-auto">
          {/* Brand Logo & Aura */}
          <div className="relative group cursor-pointer" onClick={onDismiss}>
            <div className="absolute -inset-6 bg-teal-500/20 rounded-full blur-2xl group-hover:bg-teal-500/35 transition-all duration-500" />
            <div className="relative flex items-center justify-center gap-4 bg-slate-900/90 border border-teal-500/40 rounded-3xl px-7 py-4.5 shadow-2xl shadow-teal-500/10">
              <Logo size="lg" variant="full" />
            </div>
          </div>

          {/* Subtitle / Mission */}
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Intelligent Pulmonary Decision Support
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Empowering individuals, community health workers, and pulmonologists
              with evidence-based clinical risk stratification.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full max-w-lg">
            {/* Primary Dismiss / Enter */}
            <button
              type="button"
              onClick={onDismiss}
              className="w-full sm:w-auto flex-1 py-4 px-8 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-base sm:text-lg shadow-xl shadow-teal-500/30 hover:scale-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="size-5" />
              <span>Explore Platform</span>
              <ArrowRight className="size-5" />
            </button>

            {/* Sign In / Register */}
            <Link
              href="/login"
              className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-base border border-slate-700/80 hover:border-teal-500/50 shadow-md hover:scale-105 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="size-4.5 text-teal-400" />
              <span>Sign In / Register</span>
            </Link>
          </div>

          {/* Rapid assessment direct route */}
          <div className="pt-1">
            <Link
              href="/ai-assessment"
              className="inline-flex items-center gap-2 text-sm text-teal-300/90 hover:text-teal-200 transition-colors border-b border-teal-500/30 pb-0.5"
            >
              <Activity className="size-4 text-teal-400 animate-pulse" />
              <span>Direct Link: Launch AI Risk Stratification Model &rarr;</span>
            </Link>
          </div>
        </div>
      ),
    },
  ]

  return (
    <motion.aside
      aria-label="Lungent Cinematic Story Introduction"
      tabIndex={0}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.02,
        filter: 'blur(10px)',
        transition: { duration: 0.75, ease: 'easeInOut' },
      }}
      className="fixed inset-0 z-[999] flex flex-col justify-between bg-slate-950 text-white overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient Pulmonary Respiration Gradients & Aesthetic Lighting */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />

        {/* Breathing glowing teal orb */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full bg-teal-500/15 blur-[140px] animate-pulse" />

        {/* Cyan/Sky ambient depth orb */}
        <div
          className="absolute -bottom-32 right-1/4 w-[600px] h-[600px] rounded-full bg-sky-500/10 blur-[150px] animate-pulse"
          style={{ animationDuration: '6s', animationDelay: '2s' }}
        />

        {/* Soft center vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/60 to-slate-950 pointer-events-none" />
      </div>

      {/* Top Header Bar: Segmented Progress & Skip Intro Button */}
      <header className="relative z-20 w-full px-6 py-6 sm:px-10 sm:py-8 flex items-center justify-between gap-6">
        {/* Segmented Slide Indicators */}
        <div className="flex items-center gap-2 sm:gap-3 max-w-xs sm:max-w-md w-full">
          {slides.map((_, idx) => {
            const isActive = idx === currentSlide
            const isCompleted = idx < currentSlide

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Jump to slide ${idx + 1}`}
                className="flex-1 h-1.5 sm:h-2 rounded-full overflow-hidden bg-white/15 hover:bg-white/30 transition-all cursor-pointer relative"
              >
                {isCompleted && (
                  <div className="h-full w-full bg-teal-400 rounded-full" />
                )}
                {isActive && (
                  <div
                    className="h-full bg-teal-400 rounded-full transition-all duration-75"
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

        {/* Skip Intro Button */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Skip Introduction"
          className="group inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 backdrop-blur-md text-xs sm:text-sm font-semibold text-white/90 hover:text-white transition-all hover:scale-105 active:scale-95 hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-500/10 cursor-pointer"
        >
          <span>Skip Intro</span>
          <FastForward className="size-3.5 sm:size-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
          <kbd className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60 ml-1">
            Esc
          </kbd>
        </button>
      </header>

      {/* Center Stage: Animated Slides */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 sm:px-12 text-center max-w-6xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 32, scale: 0.97, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -24, scale: 1.02, filter: 'blur(6px)' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center"
          >
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-mono tracking-widest uppercase border border-teal-500/30 bg-teal-500/10 text-teal-300 mb-6 sm:mb-8 shadow-xs">
              <span className="size-1.5 rounded-full bg-teal-400 animate-ping" />
              <span>{slides[currentSlide].tag}</span>
            </div>

            {/* Slide Body */}
            {slides[currentSlide].render()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Footer: Scroll Prompt & Navigation Hint */}
      <footer className="relative z-20 w-full px-6 py-6 sm:py-8 flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={onDismiss}
          className="group flex flex-col items-center gap-2 text-white/50 hover:text-white transition-colors cursor-pointer focus:outline-none"
          aria-label="Scroll or click to enter website"
        >
          <span className="text-xs sm:text-sm font-medium tracking-wide">
            Scroll down or click to enter
          </span>
          <div className="size-8 rounded-full border border-white/20 bg-white/5 group-hover:border-teal-400 group-hover:bg-teal-500/10 flex items-center justify-center transition-all group-hover:scale-110">
            <ChevronDown className="size-4.5 text-teal-400 animate-bounce" />
          </div>
        </button>
      </footer>
    </motion.aside>
  )
}

export default IntroPresentation

