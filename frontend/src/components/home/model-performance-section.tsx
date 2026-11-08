'use client'

import React from 'react'
import { motion } from 'motion/react'
import {
  Activity,
  ShieldCheck,
  Target,
  Users,
  CheckCircle2,
  TrendingUp,
  Scale,
  Sparkles,
  Layers,
  ChevronRight,
  Database,
  BarChart3,
} from 'lucide-react'
import { SectionContainer } from '@/components/layouts/section-container'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function ModelPerformanceSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-background via-teal-500/[0.02] to-background">
      {/* Pulmonary Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-teal-500/5 dark:bg-teal-400/5 blur-3xl rounded-full pointer-events-none -z-10" />

      <SectionContainer size="lg">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto space-y-4 mb-16"
        >
          {/* Strictly Research-Grade Validation Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300 shadow-xs">
            <Sparkles className="size-3.5 text-teal-600 dark:text-teal-400" />
            <span>Research-Grade Validation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground font-sans">
            CancerDePulmo Validation Metrics
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Rigorous retrospective external validation and internal cross-validation demonstrate high
            discriminative ability and clinical safety for preliminary risk stratification.
          </p>
        </motion.div>

        {/* Side-by-Side Comparison: Internal vs. External Validation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* CARD 1: Internal Cross-Validation (Training) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-card dark:bg-slate-900/90 p-7 sm:p-9 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/60 via-teal-500 to-primary/40" />

            <div className="space-y-6">
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between gap-3">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                  <Layers className="size-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold border border-primary/25 bg-primary/5 text-primary">
                  Model Training Benchmark
                </span>
              </div>

              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground block mb-1">
                  Baseline Stability
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  Internal Ensemble (5-Seed CV)
                </h3>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Metric: ROC-AUC */}
                <div className="p-5 rounded-2xl border border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-950/40 space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    ROC-AUC Score
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-primary tracking-tight">
                    0.89
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block pt-1">
                    Discrimination capacity across 5 stratified folds
                  </span>
                </div>

                {/* Metric: Sensitivity */}
                <div className="p-5 rounded-2xl border border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-950/40 space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Ensemble Sensitivity
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-primary tracking-tight">
                    92.5%
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block pt-1">
                    True positive capture rate in primary cohort
                  </span>
                </div>
              </div>

              {/* Descriptive Callout */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-3">
                <CheckCircle2 className="size-4.5 text-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-foreground">Cohort Governance:</strong> Evaluated on the primary BRFSS cohort using strict leakage-control logic.
                </p>
              </div>
            </div>

            {/* Micro Benchmark Footer */}
            <div className="pt-6 mt-6 border-t border-border/60 text-xs text-muted-foreground flex items-center justify-between">
              <span>9-Model Stacking Ensemble</span>
              <span className="font-semibold text-primary">5-Fold Stratified Split</span>
            </div>
          </motion.div>

          {/* CARD 2: External Validation (LLCP2023) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55, delay: 0.22, ease: 'easeOut' }}
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-teal-500/30 dark:border-teal-500/30 bg-card dark:bg-slate-900/90 p-7 sm:p-9 shadow-sm hover:shadow-2xl hover:border-teal-500/60 transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            {/* Top Accent Strip (Teal to Emerald) */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400" />

            <div className="space-y-6">
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between gap-3">
                <div className="size-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                  <Target className="size-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold border border-teal-500/30 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                  <TrendingUp className="size-3.5" />
                  Generalization Gold Standard
                </span>
              </div>

              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-teal-600 dark:text-teal-400 block mb-1">
                  Unseen Population Generalization
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  External Validation (LLCP2023)
                </h3>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Metric: External ROC-AUC */}
                <div className="p-5 rounded-2xl border border-teal-500/20 bg-teal-50/40 dark:bg-teal-950/20 space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    ROC-AUC Score
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-teal-600 dark:text-teal-400 tracking-tight">
                    0.8503
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block pt-1">
                    Robust discrimination on entirely held-out external cohort
                  </span>
                </div>

                {/* Metric: REVIEW + REFER Sensitivity */}
                <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Combined Sensitivity
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    94.43%
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block pt-1">
                    Triage tiers (REVIEW + REFER) safety envelope
                  </span>
                </div>
              </div>

              {/* Secondary Metrics Row: PR-AUC & Cohort Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl border border-border/80 dark:border-slate-800 bg-muted/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                      PR-AUC (Rare-Event Precision)
                    </span>
                    <span className="text-lg font-black text-foreground font-mono">0.008933</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300">
                    Rare-Event
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-border/80 dark:border-slate-800 bg-muted/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                      External Cohort Size
                    </span>
                    <span className="text-lg font-black text-foreground font-mono">433,323</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    395 Confirmed Cases
                  </span>
                </div>
              </div>

              {/* Descriptive Callout */}
              <div className="rounded-2xl border border-teal-500/25 bg-teal-50/60 dark:bg-teal-950/30 p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-3">
                <ShieldCheck className="size-4.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-foreground">Unseen Population Proof:</strong> Identified 373 out of 395 actual cases, proving robust generalization to unseen populations.
                </p>
              </div>
            </div>

            {/* Micro Benchmark Footer */}
            <div className="pt-6 mt-6 border-t border-border/60 text-xs text-muted-foreground flex items-center justify-between">
              <span>CDC LLCP2023 Cohort</span>
              <span className="font-semibold text-teal-600 dark:text-teal-400">Zero Data Contamination</span>
            </div>
          </motion.div>
        </div>

        {/* Clinical Context & Safety Safeguards (Explanatory Text Below Metrics) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-12 rounded-3xl border border-border/80 dark:border-slate-800 bg-card/60 dark:bg-slate-900/60 p-7 sm:p-10 shadow-xs backdrop-blur-sm"
        >
          <div className="flex items-center gap-2.5 mb-6">
            <div className="size-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ShieldCheck className="size-4.5" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-foreground">
              Clinical Context &amp; Algorithmic Safety Rationale
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {/* Context Item 1 */}
            <div className="space-y-2 p-4 rounded-2xl bg-background/80 dark:bg-slate-950/50 border border-border/60">
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-base">
                <CheckCircle2 className="size-4.5 shrink-0" />
                <span>High Sensitivity (94.43%)</span>
              </div>
              <p className="text-xs sm:text-sm">
                By combining the REVIEW and REFER tiers, the model safely captures over 94% of actual lung
                cancer cases, ensuring high-risk patients are fast-tracked while minimizing false negatives.
              </p>
            </div>

            {/* Context Item 2 */}
            <div className="space-y-2 p-4 rounded-2xl bg-background/80 dark:bg-slate-950/50 border border-border/60">
              <div className="flex items-center gap-2 text-primary font-bold text-base">
                <Target className="size-4.5 shrink-0" />
                <span>PR-AUC Focus</span>
              </div>
              <p className="text-xs sm:text-sm">
                Because lung cancer is rare, we prioritize Precision-Recall AUC and sensitivity over simple
                accuracy to ensure we don&apos;t miss high-risk patients.
              </p>
            </div>

            {/* Context Item 3 */}
            <div className="space-y-2 p-4 rounded-2xl bg-background/80 dark:bg-slate-950/50 border border-border/60">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                <Scale className="size-4.5 shrink-0" />
                <span>Equity Safeguards</span>
              </div>
              <p className="text-xs sm:text-sm">
                The system uses an 85% sensitivity equity floor to prevent demographic bias across rural,
                socioeconomically vulnerable, and under-represented demographic groups.
              </p>
            </div>
          </div>
        </motion.div>
      </SectionContainer>
    </section>
  )
}

