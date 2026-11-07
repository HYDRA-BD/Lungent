'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ClipboardList,
  Code2,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  FileCheck,
  FileText,
  Layers,
  Lock,
  Network,
  Scale,
  SearchCheck,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  Wind,
} from 'lucide-react'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'
import { SectionContainer } from '@/components/layouts/section-container'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'

type TabKey = 'overview' | 'ai-architecture' | 'guidelines' | 'mcp' | 'governance' | 'api'

export function DocsClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  return (
    <div className="relative flex min-h-screen flex-col bg-background selection:bg-primary/20">
      {/* Ambient Respiration & Floating Glow (Pulmonary AI Aesthetic) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[680px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-teal-400/15 dark:bg-teal-500/10 blur-3xl animate-lung-breathe" />
        <div
          className="absolute top-28 right-1/4 w-80 h-80 rounded-full bg-sky-400/15 dark:bg-sky-500/10 blur-3xl animate-lung-breathe"
          style={{ animationDelay: '3.5s' }}
        />
      </div>

      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <SectionContainer size="lg">
          {/* Top Breadcrumb & Title */}
          <div className="space-y-6 mb-10">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="size-3.5" /> Back to Platform Overview
              </Link>
            </motion.div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-border/80 pb-8">
              <div className="space-y-3 max-w-3xl">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="inline-flex items-center gap-2"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary border border-primary/20">
                    <Layers className="size-3.5" />
                    System Architecture & Clinical Scope
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">Version 2.0</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 }}
                  className="text-4xl sm:text-5xl lg:text-5xl font-black tracking-tight text-foreground font-sans leading-[1.14]"
                >
                  Lungent Platform <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-primary via-teal-600 to-sky-600 bg-clip-text text-transparent">
                    Overview & Documentation
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.16 }}
                  className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl"
                >
                  Accessible clinical risk assessment, explainable AI pre-screening, evidence-based guideline retrieval, and secure health integrations.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex flex-wrap items-center gap-3 shrink-0"
              >
                <Link
                  href="/ai-assessment"
                  className={buttonVariants({ variant: 'default', size: 'default', className: 'rounded-xl font-bold shadow-sm hover:scale-105 active:scale-98 transition-all' })}
                >
                  <Activity className="size-4 mr-2" />
                  Try Live Assessment
                </Link>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: 'outline', size: 'default', className: 'rounded-xl font-semibold hover:border-primary/50 transition-all' })}
                >
                  <Terminal className="size-4 mr-2 text-primary" />
                  API Documentation
                  <ExternalLink className="size-3.5 ml-1.5 opacity-60" />
                </a>
              </motion.div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-border/80 mb-10 scrollbar-none">
            {[
              { id: 'overview', label: 'Platform Overview', icon: Brain },
              { id: 'ai-architecture', label: 'AI Pre-Screening Engine', icon: Layers },
              { id: 'guidelines', label: 'Clinical Guidelines', icon: Database },
              { id: 'mcp', label: 'Model Context Protocol (MCP)', icon: Network },
              { id: 'governance', label: 'Safety & Governance', icon: Scale },
              { id: 'api', label: 'API Reference', icon: Code2 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabKey)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === id
                    ? 'bg-primary text-primary-foreground shadow-xs scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:scale-[1.01]'
                }`}
              >
                <Icon className="size-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Animated Tab Contents */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: Activity, color: 'bg-primary/10 text-primary', title: 'The Access Challenge', body: 'Over 70% of high-risk rural individuals never receive Low-Dose CT (LDCT) scans due to geographic, financial, or specialist shortages. Pre-screening helps prioritize who needs immediate referral.' },
                    { icon: Brain, color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', title: 'Non-Invasive Triage', body: 'Evaluates non-invasive clinical profiles, ambient environmental data, and demographic risk factors to stratify patients into actionable clinical pathways (Refer, Review, Rule-Out).' },
                    { icon: ShieldCheck, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', title: 'Privacy-First Design', body: 'Transient processing where patient inputs are held only in memory during the session. Designed with strict zero-disk persistence for patient biometrics and support for local offline execution.' },
                  ].map((card, idx) => {
                    const CardIcon = card.icon
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.45, delay: idx * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-3 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                      >
                        <div className={`size-11 rounded-2xl ${card.color} flex items-center justify-center mb-3 shadow-2xs`}>
                          <CardIcon className="size-5" />
                        </div>
                        <h3 className="text-base font-bold text-foreground">{card.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {card.body}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>

                {/* End-to-End Clinical Flow */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45 }}
                  className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 space-y-8 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
                    <div>
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                          <Layers className="size-5" />
                        </span>
                        End-to-End Clinical Flow
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        From community health intake to explainable ML stratification and clinical referral.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 self-start sm:self-auto">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      6-Stage Decision Pipeline
                    </div>
                  </div>

                  {/* Flowchart Steps */}
                  <div className="relative space-y-6 before:absolute before:left-5 before:top-6 before:bottom-6 before:w-0.5 before:bg-gradient-to-b before:from-primary/40 before:via-sky-400/30 before:to-emerald-400/30 dark:before:from-primary/30 dark:before:via-sky-400/20 dark:before:to-emerald-400/20 md:before:left-6">
                    {/* Step 1: Patient Intake */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{ duration: 0.4, delay: 0.05 }}
                      className="relative pl-12 md:pl-16 group"
                    >
                      <div className="absolute left-2.5 md:left-3.5 -translate-x-1/2 top-4 size-9 rounded-full bg-white dark:bg-slate-900 border-2 border-primary text-primary flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-110 transition-transform">
                        <ClipboardList className="size-4" />
                      </div>
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-primary">Step 1</span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">Intake & Stratification Input</span>
                        </div>
                        <h4 className="text-base font-bold text-foreground">Patient Intake</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          Demographics, Age, Tobacco History, Comorbidities.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">Demographics & Age</span>
                          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">Tobacco Pack-Years</span>
                          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">Pulmonary Comorbidities</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Step 2: Environmental Context */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="relative pl-12 md:pl-16 group"
                    >
                      <div className="absolute left-2.5 md:left-3.5 -translate-x-1/2 top-4 size-9 rounded-full bg-white dark:bg-slate-900 border-2 border-sky-500 text-sky-500 flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-110 transition-transform">
                        <Wind className="size-4" />
                      </div>
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">Step 2</span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">Ambient Exposure Mapping</span>
                        </div>
                        <h4 className="text-base font-bold text-foreground">Environmental Context</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          Ambient Inhalation Context (Longitudinal PM2.5 / Air Quality Data).
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <span className="text-xs px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-medium">Longitudinal PM2.5 Exposure</span>
                          <span className="text-xs px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-medium">Geospatial Air Quality (AQI)</span>
                          <span className="text-xs px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-medium">Particulate Burden Scoring</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Step 3: ML Risk Stratification */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{ duration: 0.4, delay: 0.15 }}
                      className="relative pl-12 md:pl-16 group"
                    >
                      <div className="absolute left-2.5 md:left-3.5 -translate-x-1/2 top-4 size-9 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 text-indigo-500 flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-110 transition-transform">
                        <Brain className="size-4" />
                      </div>
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Step 3</span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">Core Pre-Screening Engine</span>
                        </div>
                        <h4 className="text-base font-bold text-foreground">ML Risk Stratification</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          Ensemble Gradient-Boosted Classifiers + Probability Calibration.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium">XGBoost & CatBoost Ensembles</span>
                          <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium">Platt & Isotonic Calibration</span>
                          <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium">Class-Imbalance Calibrated</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Step 4: Triage Gate */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="relative pl-12 md:pl-16 group"
                    >
                      <div className="absolute left-2.5 md:left-3.5 -translate-x-1/2 top-4 size-9 rounded-full bg-white dark:bg-slate-900 border-2 border-amber-500 text-amber-500 flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-110 transition-transform">
                        <ShieldAlert className="size-4" />
                      </div>
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Step 4</span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">Safety Protocol Gate</span>
                        </div>
                        <h4 className="text-base font-bold text-foreground">Triage Gate</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          Clinical Safety & Access Triage Gate.
                        </p>

                        {/* 3-tier policy visually with distinct colored badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          {/* Rule-Out (Green) */}
                          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/40 space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-emerald-500" />
                              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Rule-Out</span>
                              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 ml-auto">Green</span>
                            </div>
                            <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-snug">
                              Low Risk: Routine annual monitoring & community primary prevention.
                            </p>
                          </div>

                          {/* Review (Yellow) */}
                          <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/40 space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-amber-500" />
                              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Review</span>
                              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 ml-auto">Yellow</span>
                            </div>
                            <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-snug">
                              Moderate / Borderline Risk: Shared decision-making & clinical reassessment.
                            </p>
                          </div>

                          {/* Refer (Red) */}
                          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/70 dark:bg-rose-950/40 space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-rose-500" />
                              <span className="text-xs font-bold text-rose-800 dark:text-rose-300">Refer</span>
                              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 ml-auto">Red</span>
                            </div>
                            <p className="text-xs text-rose-900/80 dark:text-rose-200/80 leading-snug">
                              High Risk: Fast-track prioritization for Low-Dose CT (LDCT) workup.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Step 5: Explainability & Guidelines */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{ duration: 0.4, delay: 0.25 }}
                      className="relative pl-12 md:pl-16 group"
                    >
                      <div className="absolute left-2.5 md:left-3.5 -translate-x-1/2 top-4 size-9 rounded-full bg-white dark:bg-slate-900 border-2 border-teal-500 text-teal-500 flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-110 transition-transform">
                        <SearchCheck className="size-4" />
                      </div>
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Step 5</span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">Interpretability & Evidence</span>
                        </div>
                        <h4 className="text-base font-bold text-foreground">Explainability & Guidelines</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          XAI Attribution & Evidence-Based Guideline Matching.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                              <Brain className="size-3.5 text-teal-600 dark:text-teal-400" />
                              XAI Attribution
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              SHAP factor contributions explaining individual risk elevations.
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                              <BookOpen className="size-3.5 text-teal-600 dark:text-teal-400" />
                              Guideline Matching
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              RAG retrieval against USPSTF, NCCN, and WHO clinical protocols.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Step 6: Output */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="relative pl-12 md:pl-16 group"
                    >
                      <div className="absolute left-2.5 md:left-3.5 -translate-x-1/2 top-4 size-9 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-110 transition-transform">
                        <FileCheck className="size-4" />
                      </div>
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Step 6</span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">Final Output & Workup</span>
                        </div>
                        <h4 className="text-base font-bold text-foreground">Output</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          Clinical Referral Summary & Signed PDF Report.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">Clinical Referral Summary</span>
                          <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">Digitally Signed PDF Report</span>
                          <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">EHR-Ready FHIR Package</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Tab 2: AI Pre-Screening Engine */}
            {activeTab === 'ai-architecture' && (
              <motion.div
                key="ai-architecture"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="space-y-8"
              >
                {/* Header Card */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                          <Brain className="size-6" />
                        </span>
                        Machine Learning Risk Stratification Engine
                      </h3>
                      <p className="text-base text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-3xl">
                        Lungent employs a multi-algorithm ensemble of calibrated gradient-boosted decision trees trained on multi-decade longitudinal health surveillance datasets. Built specifically to tackle severe epidemiological class imbalance in community cancer screening.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 self-start sm:self-auto shrink-0">
                      <Cpu className="size-3.5" />
                      Ensemble ML Stack
                    </span>
                  </div>

                  {/* 4 Architecture Pillars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2 hover:border-primary/50 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-2 font-bold text-lg text-foreground">
                        <Cpu className="size-5 text-primary" />
                        <h4>Multi-Algorithm Ensemble</h4>
                      </div>
                      <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        Combines XGBoost, LightGBM, and CatBoost models. Blends shallow and deep decision trees to capture non-linear interactions across tobacco smoke duration, pack-years, occupational hazards, and regional AQI.
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -4 }}
                      className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2 hover:border-primary/50 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-2 font-bold text-lg text-sky-500" />
                      <div className="flex items-center gap-2 font-bold text-lg text-foreground">
                        <Activity className="size-5 text-sky-500" />
                        <h4>Probability Calibration</h4>
                      </div>
                      <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        Applies post-hoc Platt sigmoid scaling and isotonic regression. This ensures predicted risk probabilities map accurately to true epidemiological event rates, preventing probability distortion common in raw boosted trees.
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -4 }}
                      className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2 hover:border-primary/50 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-2 font-bold text-lg text-foreground">
                        <SearchCheck className="size-5 text-teal-500" />
                        <h4>Explainable AI (Tree-SHAP)</h4>
                      </div>
                      <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        Computes local feature importance using Shapley Additive Explanations (Tree-SHAP). Every patient report highlights the exact top clinical factors (e.g. smoking history +42%, PM2.5 exposure +18%) driving elevation.
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -4 }}
                      className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2 hover:border-primary/50 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-2 font-bold text-lg text-foreground">
                        <Scale className="size-5 text-indigo-500" />
                        <h4>Class-Imbalance Optimization</h4>
                      </div>
                      <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        Employs focal loss weighting and threshold optimization to address population class rarity (&lt; 2% base incidence). Tuned to ensure high sensitivity (≥ 92%), minimizing high-risk false negatives.
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* Performance Benchmarks Card */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4 shadow-xs">
                  <h4 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" /> Validated Model Performance Metrics
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-center space-y-1">
                      <p className="text-3xl font-black text-primary">0.88</p>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">AUC-ROC Score</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">Discriminative power across cross-validation folds</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-center space-y-1">
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">92.4%</p>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sensitivity Floor</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">High-risk detection in underserved populations</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-center space-y-1">
                      <p className="text-3xl font-black text-sky-600 dark:text-sky-400">&lt; 0.04</p>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Brier Score</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">Strict probability calibration goodness-of-fit</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-center space-y-1">
                      <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">&lt; 45ms</p>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Inference Latency</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">P99 response time for edge/offline execution</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 3: Guidelines */}
            {activeTab === 'guidelines' && (
              <motion.div
                key="guidelines"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="space-y-8"
              >
                {/* Header Card */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                          <Database className="size-6" />
                        </span>
                        Evidence-Based Clinical Guidelines
                      </h3>
                      <p className="text-base text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-3xl">
                        Lungent benchmarks each patient evaluation against recognized clinical screening guidelines—including the USPSTF 2021 recommendations, NCCN screening guidelines, and validated predictive risk models (such as PLCOm2012).
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 self-start sm:self-auto shrink-0">
                      <CheckCircle2 className="size-3.5" />
                      USPSTF 2021 & NCCN Aligned
                    </span>
                  </div>

                  {/* 3 Guideline Tiers with Left Border Accents */}
                  <div className="space-y-4 pt-2">
                    {/* Rule-Out */}
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2 shadow-xs transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <span className="size-2 rounded-full bg-emerald-500" />
                          Rule-Out Protocol — Low Risk Cohort
                        </h4>
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                          Routine Annual Follow-up
                        </span>
                      </div>
                      <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        Patients whose calibrated risk falls below clinical screening thresholds and who exhibit no acute alarm symptoms. Recommended clinical intervention focuses on primary prevention, smoking cessation counseling, environmental protection, and annual community surveillance.
                      </p>
                    </motion.div>

                    {/* Review */}
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500 bg-amber-50/40 dark:bg-amber-950/20 space-y-2 shadow-xs transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <span className="size-2 rounded-full bg-amber-500" />
                          Review Protocol — Moderate / Borderline Cohort
                        </h4>
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                          Shared Decision-Making
                        </span>
                      </div>
                      <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        Patients presenting with intermediate risk or substantial cumulative exposure (e.g. 15–20 pack-years combined with high PM2.5 occupational exposure). Protocol triggers a formal clinician review, shared decision-making consultation, spirometry assessment, and 6-month interval re-evaluation.
                      </p>
                    </motion.div>

                    {/* Refer */}
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-rose-500 bg-rose-50/40 dark:bg-rose-950/20 space-y-2 shadow-xs transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <span className="size-2 rounded-full bg-rose-500" />
                          Refer Protocol — High Risk LDCT Workup
                        </h4>
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                          Priority Imaging (LDCT)
                        </span>
                      </div>
                      <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        Patients exceeding high-risk cutoff scores or meeting standard USPSTF LDCT eligibility criteria. Triggers immediate expedited referral to regional pulmonology and low-dose computed tomography (LDCT) diagnostic centers within 14 calendar days.
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* Evidence Frameworks (2 Cols) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-2 font-bold text-lg text-foreground">
                      <BookOpen className="size-5 text-primary" />
                      <h4>USPSTF 2021 Screening Criteria</h4>
                    </div>
                    <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                      Evaluates formal eligibility: adults aged 50 to 80 with a 20 pack-year smoking history who currently smoke or have quit within the past 15 years.
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -4 }}
                    className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-2 font-bold text-lg text-sky-500">
                      <Brain className="size-5" />
                      <h4>Semantic Guideline Retrieval (RAG)</h4>
                    </div>
                    <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                      Vector embeddings match patient-specific risk profiles with pertinent recommendations, explaining rationale directly to reviewing physicians with exact guideline citations.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Tab 4: MCP */}
            {activeTab === 'mcp' && (
              <motion.div
                key="mcp"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="space-y-8"
              >
                {/* Header Card */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                          <Network className="size-6" />
                        </span>
                        Model Context Protocol (MCP) Server
                      </h3>
                      <p className="text-base text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-3xl">
                        Lungent provides an open, read-only Model Context Protocol server exposing clinical decision-support tools directly to authorized AI agents, clinical copilot environments, and EHR integration engines.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 self-start sm:self-auto shrink-0">
                      <Server className="size-3.5" />
                      MCP 1.0 Compliant
                    </span>
                  </div>

                  {/* 3 Exposed MCP Tools */}
                  <div className="space-y-4 pt-2">
                    {[
                      {
                        name: 'evaluate_patient_risk',
                        badge: 'Core ML Stratification',
                        desc: 'Executes calibrated ensemble risk stratification and returns triage tier, probability percentage, and individual SHAP factor contributions.',
                        params: 'age: int, smoking_pack_years: float, comorbidities: list, regional_pm25: float',
                        returns: '{ risk_tier: "refer" | "review" | "rule_out", probability: float, shap_factors: dict }',
                      },
                      {
                        name: 'query_clinical_guidelines',
                        badge: 'Vector Knowledge Search',
                        desc: 'Performs semantic vector search over clinical screening literature, USPSTF 2021 protocols, and NCCN guideline recommendations.',
                        params: 'query: string, risk_tier?: string, k: int = 3',
                        returns: '{ guidelines: list[{ title: string, recommendation: string, confidence: float }] }',
                      },
                      {
                        name: 'generate_clinical_summary',
                        badge: 'Clinical Narrative Synthesis',
                        desc: 'Synthesizes clinical decision-support summaries suitable for EHR documentation, patient communication, and formal physician referral letters.',
                        params: 'patient_profile: dict, evaluation_result: dict, clinician_notes?: string',
                        returns: '{ summary_text: string, action_items: list[string], signed_dossier_hash: string }',
                      },
                    ].map((tool, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -3 }}
                        className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3 shadow-xs transition-all"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-base font-bold text-primary">{tool.name}</span>
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                            {tool.badge}
                          </span>
                        </div>
                        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                          {tool.desc}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-400 mb-1">Parameters</p>
                            <span className="text-slate-800 dark:text-slate-200">{tool.params}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-400 mb-1">Returns</p>
                            <span className="text-slate-800 dark:text-slate-200">{tool.returns}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* MCP Client Configuration Code Card */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4 shadow-xs">
                  <h4 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Terminal className="size-5 text-primary" /> MCP Agent Configuration
                  </h4>
                  <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    Add Lungent to your agent configuration file (<code className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">claude_desktop_config.json</code> or Antigravity):
                  </p>
                  <div className="p-5 rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 font-mono text-sm text-slate-100 overflow-x-auto">
                    <pre className="leading-relaxed">{`{
  "mcpServers": {
    "lungent": {
      "command": "python",
      "args": ["backend/mcp_server.py"],
      "env": {
        "DISABLE_RAG": "0"
      }
    }
  }
}`}</pre>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 5: Safety & Governance */}
            {activeTab === 'governance' && (
              <motion.div
                key="governance"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="space-y-8"
              >
                {/* Header Card */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                          <Scale className="size-6" />
                        </span>
                        Safety Boundaries & Clinical Governance
                      </h3>
                      <p className="text-base text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-3xl">
                        Lungent is explicitly engineered as a clinical decision-support pre-screening tool (CDSS), not an autonomous diagnostic medical device. It enforces strict clinical invariants, cryptographic auditability, and data minimization.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 self-start sm:self-auto shrink-0">
                      <ShieldCheck className="size-3.5" />
                      HIPAA & SaMD Aligned
                    </span>
                  </div>

                  {/* 4 Governance Pillars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2 hover:border-emerald-500/60 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-2 font-bold text-lg text-emerald-800 dark:text-emerald-300">
                        <Scale className="size-5" />
                        <h4>Equity-Aware Sensitivity Floor</h4>
                      </div>
                      <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        Guarantees high sensitivity (≥ 92%) across vulnerable subgroups (low-access, high-exposure communities) to systematically avoid false-negative exclusions for individuals who require diagnostic Low-Dose CT imaging.
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -4 }}
                      className="p-6 rounded-2xl border border-teal-500/30 bg-teal-50/40 dark:bg-teal-950/20 space-y-2 hover:border-teal-500/60 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-2 font-bold text-lg text-teal-800 dark:text-teal-300">
                        <ShieldCheck className="size-5" />
                        <h4>Immutable Audit Telemetry</h4>
                      </div>
                      <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        All generated reports are sealed with SHA-256 cryptographic signatures. Audit records capture inputs, algorithm version, timestamp, and factor attributions to assure downstream clinical teams of absolute data integrity.
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -4 }}
                      className="p-6 rounded-2xl border border-sky-500/30 bg-sky-50/40 dark:bg-sky-950/20 space-y-2 hover:border-sky-500/60 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-2 font-bold text-lg text-sky-800 dark:text-sky-300">
                        <Lock className="size-5" />
                        <h4>Zero-Persistence Biometrics</h4>
                      </div>
                      <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        Transient processing architecture: patient inputs are held only in volatile memory during the active session. The system supports full local execution without transmitting raw patient identifiers to cloud servers.
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -4 }}
                      className="p-6 rounded-2xl border border-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2 hover:border-indigo-500/60 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-2 font-bold text-lg text-indigo-800 dark:text-indigo-300">
                        <Users className="size-5" />
                        <h4>Human-in-the-Loop CDSS Boundary</h4>
                      </div>
                      <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        The platform enforces a strict non-diagnostic boundary. All risk classifications and triage recommendations are advisory; formal medical diagnosis and imaging orders require confirmation by a licensed physician.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 6: API Reference */}
            {activeTab === 'api' && (
              <motion.div
                key="api"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="space-y-8"
              >
                {/* Header Card */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                          <Code2 className="size-6" />
                        </span>
                        RESTful Clinical API Endpoints
                      </h3>
                      <p className="text-base text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-3xl">
                        The Lungent backend provides a high-throughput, standardized FastAPI service with OpenAPI 3.1 specifications, automated schema validation, and interactive Swagger documentation.
                      </p>
                    </div>
                    <a
                      href="http://localhost:8000/docs"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all self-start sm:self-auto shrink-0 shadow-xs hover:scale-105"
                    >
                      <Terminal className="size-3.5" />
                      <span>Live Swagger Docs</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>

                  {/* Modern API Endpoint Cards */}
                  <div className="space-y-4 pt-2">
                    {[
                      {
                        method: 'GET',
                        methodColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
                        endpoint: '/api/health',
                        title: 'Health & ML Readiness Check',
                        desc: 'Returns system telemetry, loaded machine learning models, and ChromaDB vector store readiness status.',
                      },
                      {
                        method: 'POST',
                        methodColor: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-800',
                        endpoint: '/api/predict',
                        title: 'Risk Stratification & Factor Attribution',
                        desc: 'Processes patient questionnaire responses, calculates calibrated probability, assigns triage tier (Refer/Review/Rule-Out), and computes top SHAP feature weights.',
                      },
                      {
                        method: 'POST',
                        methodColor: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-800',
                        endpoint: '/api/analyze',
                        title: 'Comprehensive End-to-End Evaluation',
                        desc: 'Full evaluation pipeline combining ML prediction, guideline matching via RAG, and automated clinical summary generation with Groq/Ollama LLM fallback.',
                      },
                      {
                        method: 'POST',
                        methodColor: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-800',
                        endpoint: '/api/report',
                        title: 'Signed Clinical PDF Dossier Generation',
                        desc: 'Generates in-memory signed clinical PDF reports containing hospital letterheads, risk meters, SHAP breakdown charts, and digital verification signatures.',
                      },
                      {
                        method: 'GET',
                        methodColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
                        endpoint: '/api/states',
                        title: 'Regional Environmental Reference Data',
                        desc: 'Provides ambient environmental PM2.5 and AQI data arrays for regional exposure enrichment.',
                      },
                    ].map((api, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -3 }}
                        className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5 shadow-xs transition-all"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${api.methodColor}`}>
                            {api.method}
                          </span>
                          <span className="font-mono text-sm sm:text-base font-bold text-foreground">
                            {api.endpoint}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-auto hidden sm:inline">
                            {api.title}
                          </span>
                        </div>
                        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                          {api.desc}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SectionContainer>
      </main>

      <Footer />
    </div>
  )
}
