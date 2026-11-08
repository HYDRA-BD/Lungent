'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Activity,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Layers,
  Lightbulb,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

const STEPS = [
  {
    id: 1,
    title: 'Validating clinical inputs and biometric ranges...',
    desc: 'Verifying age, pack-years, BMI cachexia bounds, and respiratory comorbidities.',
    icon: Database,
  },
  {
    id: 2,
    title: 'Computing SHAP feature attributions...',
    desc: 'Extracting marginal local game-theoretic risk & protective factor weights.',
    icon: Cpu,
  },
  {
    id: 3,
    title: 'Running 9-model ensemble stratification (XGBoost, LightGBM, CatBoost)...',
    desc: 'Querying Case (SPW=60), Balanced (SPW=30), and Control (SPW=1) specialist variants.',
    icon: Layers,
  },
  {
    id: 4,
    title: 'Cross-referencing USPSTF 2021 screening guidelines...',
    desc: 'Querying ChromaDB vector embeddings for evidence-based clinical recommendations.',
    icon: Activity,
  },
  {
    id: 5,
    title: 'Applying equity floor safeguards and finalizing triage tier...',
    desc: 'Enforcing 85% subgroup sensitivity floor and Platt-calibrated decision boundary.',
    icon: ShieldCheck,
  },
]

const FACTS = [
  {
    id: 1,
    fact: 'Lung cancer is the leading cause of cancer death worldwide, but early detection saves lives.',
    tag: 'Global Oncology',
  },
  {
    id: 2,
    fact: 'Lungent uses non-imaging data (CDC BRFSS) to make screening accessible to rural populations.',
    tag: 'Healthcare Equity',
  },
  {
    id: 3,
    fact: 'Our model uses an 85% sensitivity equity floor to ensure marginalized groups are not missed.',
    tag: 'Algorithmic Fairness',
  },
  {
    id: 4,
    fact: 'A 5-year history of ambient PM2.5 air quality is integrated into every risk calculation.',
    tag: 'Environmental Risk',
  },
]

export function AILoadingSequence() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const [progress, setProgress] = useState(12)
  const [secondsElapsed, setSecondsElapsed] = useState(0)

  // Step advancement timer (every 5 seconds advances step until step 5)
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev))
    }, 5200)
    return () => clearInterval(stepInterval)
  }, [])

  // Did You Know? facts rotator (every 6 seconds)
  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % FACTS.length)
    }, 6000)
    return () => clearInterval(factInterval)
  }, [])

  // Non-linear progress bar timer: creeps to 90% over ~40s, then stalls at 99%
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1)
      setProgress((old) => {
        if (old < 45) return old + 2.5
        if (old < 75) return old + 1.2
        if (old < 90) return old + 0.6
        if (old < 98) return old + 0.2
        return 99
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const currentFact = FACTS[currentFactIndex]

  return (
    <div className="w-full rounded-3xl border border-primary/25 bg-card/95 dark:bg-slate-900/95 backdrop-blur-xl p-6 sm:p-9 shadow-xl relative overflow-hidden transition-all">
      {/* Background Animated Pulmonary Aura */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none -z-10 animate-lung-breathe" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none -z-10 animate-lung-breathe" />

      {/* Header with Live Status & Elapsed Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="size-10 sm:size-11 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0 shadow-inner">
            <Loader2 className="size-5 sm:size-6 animate-spin text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Inference Engine Active
              </span>
              <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-sans">
              Running AI Stratification Models
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto bg-muted/60 dark:bg-slate-800/60 px-3.5 py-1.5 rounded-xl border border-border/50 text-xs text-muted-foreground">
          <Clock className="size-3.5 text-primary" />
          <span>Elapsed: <strong className="text-foreground font-mono">{secondsElapsed}s</strong></span>
        </div>
      </div>

      {/* Animated Sequential Clinical Pipeline Steps */}
      <div className="py-6 space-y-3 sm:space-y-3.5">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex
          const isCurrent = idx === currentStepIndex
          const Icon = step.icon

          return (
            <motion.div
              key={step.id}
              initial={false}
              animate={{
                opacity: isCurrent ? 1 : isDone ? 0.75 : 0.35,
                scale: isCurrent ? 1.01 : 1,
              }}
              transition={{ duration: 0.35 }}
              className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all ${
                isCurrent
                  ? 'bg-primary/5 dark:bg-primary/10 border-primary/40 shadow-xs'
                  : isDone
                  ? 'bg-muted/30 border-border/40'
                  : 'bg-transparent border-transparent'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                ) : isCurrent ? (
                  <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <div className="size-5 rounded-full border border-border/80 flex items-center justify-center text-[10px] text-muted-foreground font-mono">
                    {step.id}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4
                    className={`text-sm sm:text-[15px] font-bold transition-colors ${
                      isCurrent
                        ? 'text-foreground'
                        : isDone
                        ? 'text-foreground/80 line-through decoration-border'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </h4>
                </div>
                {isCurrent && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs text-muted-foreground mt-1 leading-relaxed"
                  >
                    {step.desc}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Dynamic Continuous Progress Bar */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3 text-primary animate-pulse" />
            <span className="font-sans font-semibold text-foreground text-[11px] sm:text-xs">
              {progress < 90 ? 'Ensemble Ingestion' : 'Calibrating Meta-Learner Decision Boundary'}
            </span>
          </span>
          <span className="font-bold text-primary">{Math.round(progress)}%</span>
        </div>

        <div className="h-2.5 w-full bg-muted dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-border/40">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-teal-500 to-sky-500 rounded-full relative"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.4 }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </motion.div>
        </div>
      </div>

      {/* Did You Know? Rotating Clinical Distraction Banner */}
      <div className="mt-5 p-4 rounded-2xl bg-primary/5 dark:bg-slate-800/50 border border-primary/15 relative overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="size-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Did You Know?
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                {currentFact.tag}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={currentFact.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans"
              >
                &ldquo;{currentFact.fact}&rdquo;
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Render Cold-Start Reassurance Footer */}
      <p className="text-center text-[11px] sm:text-xs text-muted-foreground/80 mt-4 leading-relaxed">
        <span className="font-semibold text-primary/90">Note:</span> Free tier backend instances enter sleep when idle and may take 30–60s to boot on initial request. Please keep this tab open.
      </p>
    </div>
  )
}

