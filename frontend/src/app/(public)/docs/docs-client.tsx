'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import {
  Activity,
  ArrowLeft,
  Brain,
  Code2,
  Database,
  ExternalLink,
  Layers,
  Network,
  Scale,
  ShieldCheck,
  Terminal,
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

                {/* High-level system flow without exposing internal research algorithms */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45 }}
                  className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 space-y-5 shadow-xs"
                >
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Layers className="size-5 text-primary" /> End-to-End Clinical Flow
                  </h3>

                  <div className="p-5 rounded-2xl bg-muted/40 font-mono text-xs text-slate-700 dark:text-slate-300 overflow-x-auto border border-border/60">
                    <pre className="leading-relaxed">
{`[Patient Intake / Questionnaire]
        │ (Age, Tobacco History, Comorbidities, Region)
        ▼
[Ambient Environmental Inhalation Context]
        │ (Longitudinal PM2.5 / Air Quality Data)
        ▼
[Machine Learning Risk Stratification Engine]
        │ (Ensemble Gradient-Boosted Classifiers + Probability Calibration)
        ▼
[Clinical Safety & Access Triage Gate]
        ├── Rule-Out (Low Risk, Routine Annual Monitoring)
        ├── Review   (Moderate / Borderline Risk, Shared Decision-Making)
        └── Refer    (High Risk, Fast-Track for Low-Dose CT Diagnostic Workup)
        │
   ┌────┴─────────────────────────────┐
   ▼                                   ▼
[Explainability (XAI Attribution)] [Evidence-Based Guideline Matching]
   │                                   │
   └─────────────┬─────────────────────┘
                 ▼
[Clinical Referral Summary & Signed PDF Report]`}</pre>
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
                className="space-y-6"
              >
                <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-4 shadow-xs">
                  <h3 className="text-xl font-bold text-foreground">Machine Learning Risk Stratification</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Lungent employs a multi-model ensemble of calibrated gradient-boosted decision models trained on comprehensive public health surveillance datasets. The system addresses the extreme class rarity typical in preventive population screening.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                    <motion.div whileHover={{ y: -4 }} className="p-5 rounded-2xl border border-border/80 bg-muted/30 space-y-2 hover:border-primary/50 transition-all">
                      <p className="text-sm font-bold text-foreground">Multi-Algorithm Ensemble</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Combines multiple tree-based model architectures to capture complex non-linear interactions across smoking history and pulmonary conditions.</p>
                    </motion.div>

                    <motion.div whileHover={{ y: -4 }} className="p-5 rounded-2xl border border-border/80 bg-muted/30 space-y-2 hover:border-primary/50 transition-all">
                      <p className="text-sm font-bold text-foreground">Probability Calibration</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Uses post-hoc calibration to ensure predicted probabilities correspond accurately to real-world epidemiological risk tiers.</p>
                    </motion.div>

                    <motion.div whileHover={{ y: -4 }} className="p-5 rounded-2xl border border-border/80 bg-muted/30 space-y-2 hover:border-primary/50 transition-all">
                      <p className="text-sm font-bold text-foreground">Feature Attribution (XAI)</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Provides clinician-interpretable factor weights showing which risk components contributed most to the overall assessment.</p>
                    </motion.div>
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
                className="space-y-6"
              >
                <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-4 shadow-xs">
                  <h3 className="text-xl font-bold text-foreground">Evidence-Based Clinical Guidelines</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Lungent benchmarks risk evaluations against recognized clinical screening guidelines, including USPSTF 2021 recommendations and validated predictive risk models (such as PLCOm2012).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <motion.div whileHover={{ y: -4 }} className="p-5 rounded-2xl border border-border/80 bg-muted/30 space-y-2 hover:border-primary/50 transition-all">
                      <p className="text-sm font-bold text-foreground">USPSTF 2021 Criteria Matching</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Evaluates eligibility criteria: adults aged 50 to 80 with a 20 pack-year smoking history who currently smoke or have quit within the past 15 years.</p>
                    </motion.div>

                    <motion.div whileHover={{ y: -4 }} className="p-5 rounded-2xl border border-border/80 bg-muted/30 space-y-2 hover:border-primary/50 transition-all">
                      <p className="text-sm font-bold text-foreground">Guideline Retrieval (RAG)</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Semantic retrieval matches patient-specific risk profiles with pertinent recommendations, explaining rationale directly to reviewing physicians.</p>
                    </motion.div>
                  </div>
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
                className="space-y-6"
              >
                <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-4 shadow-xs">
                  <h3 className="text-xl font-bold text-foreground">Model Context Protocol (MCP) Integration</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Lungent provides an open, read-only Model Context Protocol server exposing clinical evaluation tools to authorized AI agents and electronic health record (EHR) environments.
                  </p>

                  <div className="space-y-3 pt-2">
                    {[
                      { name: 'evaluate_patient_risk', desc: 'Executes calibrated ensemble risk stratification and returns tier, probability, and factor weights.' },
                      { name: 'query_clinical_guidelines', desc: 'Performs semantic vector search over clinical screening literature and guideline recommendations.' },
                      { name: 'generate_clinical_summary', desc: 'Synthesizes clinical decision-support summaries suitable for inclusion in EHR referral documentation.' },
                    ].map((tool, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-border/80 bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{tool.name}</span>
                        <span className="text-xs text-slate-600 dark:text-slate-300">{tool.desc}</span>
                      </div>
                    ))}
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
                className="space-y-6"
              >
                <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-4 shadow-xs">
                  <h3 className="text-xl font-bold text-foreground">Safety Boundaries & Clinical Governance</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Lungent is explicitly engineered as a clinical decision-support pre-screening tool, not a diagnostic medical device. It enforces strict clinical invariants.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-1.5">
                      <p className="text-sm font-bold text-foreground">Equity-Aware Sensitivity Floor</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Guarantees high sensitivity across vulnerable subgroups (low-access, high-exposure communities) to avoid missed high-risk cases.</p>
                    </div>

                    <div className="p-5 rounded-2xl border border-teal-500/20 bg-teal-50/40 dark:bg-teal-950/20 space-y-1.5">
                      <p className="text-sm font-bold text-foreground">Immutable Audit Telemetry</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">All generated reports are sealed with SHA-256 cryptographic signatures to assure downstream clinical teams of data integrity.</p>
                    </div>
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
                className="space-y-6"
              >
                <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-4 shadow-xs">
                  <h3 className="text-xl font-bold text-foreground">REST API Endpoints</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    The backend provides a standardized FastAPI service with comprehensive OpenAPI / Swagger documentation.
                  </p>

                  <div className="overflow-x-auto rounded-2xl border border-border/80">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/60 text-foreground font-semibold border-b border-border">
                        <tr>
                          <th className="p-3.5">Method</th>
                          <th className="p-3.5">Endpoint</th>
                          <th className="p-3.5">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-slate-600 dark:text-slate-300 font-mono">
                        <tr>
                          <td className="p-3.5 text-emerald-600 font-bold">GET</td>
                          <td className="p-3.5">/health</td>
                          <td className="p-3.5 font-sans">Service health and readiness check</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 text-blue-600 font-bold">POST</td>
                          <td className="p-3.5">/api/predict</td>
                          <td className="p-3.5 font-sans">Patient risk stratification and factor attribution</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 text-blue-600 font-bold">POST</td>
                          <td className="p-3.5">/api/analyze</td>
                          <td className="p-3.5 font-sans">End-to-end evaluation including clinical summary</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 text-blue-600 font-bold">POST</td>
                          <td className="p-3.5">/api/report</td>
                          <td className="p-3.5 font-sans">Generates in-memory clinical report PDF</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 text-emerald-600 font-bold">GET</td>
                          <td className="p-3.5">/api/states</td>
                          <td className="p-3.5 font-sans">Regional air quality reference data</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2">
                    <a
                      href="http://localhost:8000/docs"
                      target="_blank"
                      rel="noreferrer"
                      className={buttonVariants({ variant: 'outline', size: 'sm', className: 'text-xs rounded-xl hover:border-primary/50' })}
                    >
                      <ExternalLink className="size-3.5 mr-1.5" />
                      Open Interactive Swagger API
                    </a>
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
