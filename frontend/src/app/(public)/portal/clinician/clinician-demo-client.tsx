'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Stethoscope,
  Home,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  Workflow,
  ShieldCheck,
  Activity,
  Layers,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  BrainCircuit,
  Eye,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ClinicianDemoClient() {
  const [selectedPatient, setSelectedPatient] = useState<number>(0)

  const clinicalCases = [
    {
      id: 'LGT-2026-9K1X4',
      name: 'Abul Hashem',
      age: 64,
      sex: 'Male',
      score: '0.78',
      tier: 'REFER',
      tierColor: 'bg-destructive/15 text-destructive border-destructive/30',
      decision: 'Immediate LDCT Diagnostic Protocol & Thoracic Multidisciplinary Review',
      shapFactors: [
        { name: 'Smoking Pack-Years (38 yrs)', impact: '+0.34', type: 'risk' },
        { name: 'Age (64 years)', impact: '+0.21', type: 'risk' },
        { name: 'Reported Chronic Bronchitis', impact: '+0.15', type: 'risk' },
        { name: 'Family History of Malignancy', impact: '+0.11', type: 'risk' },
        { name: 'Daily Physical Activity (>30 min)', impact: '-0.03', type: 'protective' },
      ],
      clinicalGuidance:
        'Patient satisfies high-risk criteria under BRFSS calibrated ensemble. Fast-track thoracic referral warranted within 14 working days.',
    },
    {
      id: 'LGT-2026-4P8M2',
      name: 'Salma Khatun',
      age: 58,
      sex: 'Female',
      score: '0.42',
      tier: 'REVIEW',
      tierColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
      decision: 'Secondary Outpatient Pulmonary Consultation & Spirometric Follow-up',
      shapFactors: [
        { name: 'Secondary Biomass Smoke (25 yrs)', impact: '+0.19', type: 'risk' },
        { name: 'Past Smoking History (12 yrs)', impact: '+0.14', type: 'risk' },
        { name: 'Age (58 years)', impact: '+0.12', type: 'risk' },
        { name: 'Cessation Duration (>7 yrs ago)', impact: '-0.08', type: 'protective' },
        { name: 'BMI within Normal Bounds (22.4)', impact: '-0.05', type: 'protective' },
      ],
      clinicalGuidance:
        'Intermediate score falling in REVIEW window. Rule-out active symptoms; schedule in-person clinical review in 3–6 months.',
    },
    {
      id: 'LGT-2026-1C7V9',
      name: 'Tanvir Ahmed',
      age: 41,
      sex: 'Male',
      score: '0.08',
      tier: 'RULE-OUT',
      tierColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      decision: 'Annual Routine Health Maintenance & Tobacco Abstinence Reinforcement',
      shapFactors: [
        { name: 'Zero Tobacco Consumption History', impact: '-0.38', type: 'protective' },
        { name: 'Age < 50', impact: '-0.22', type: 'protective' },
        { name: 'Absence of Chronic Respiratory Comorbidities', impact: '-0.14', type: 'protective' },
        { name: 'Urban Air Pollution Exposure Index', impact: '+0.04', type: 'risk' },
      ],
      clinicalGuidance:
        'Low risk baseline. Routine LDCT screening strictly not recommended; avoid unnecessary radiation and false-positive biopsies.',
    },
  ]

  const active = clinicalCases[selectedPatient]

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col selection:bg-primary/20">
      {/* Top Portal Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-100/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md shadow-xs">
        <div className="container mx-auto flex h-16 sm:h-18 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="compact" href="/" />
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border/80">
              <span className="text-sm font-semibold text-foreground">Clinicians & Specialists Portal</span>
              <Badge variant="outline" className="border-teal-500/40 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 text-[11px]">
                Demo
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Interactive Pitch View</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-6xl space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-400 border border-sky-500/20">
            <Stethoscope className="size-3.5" />
            <span>Interpretable Machine Learning & Clinical Oversight</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Explainable AI Oversight <br />
            <span className="bg-gradient-to-r from-sky-600 via-primary to-teal-600 bg-clip-text text-transparent">
              With 3-Tier Clinical Policies
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Replacing opaque "black-box" predictions with transparent SHAP feature attributions, enabling pulmonologists to make defensible, evidence-backed referral decisions.
          </p>
        </div>

        {/* 3 Core Structural Cards: Problem, Solution, Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* 1. The Prevailing Problem */}
          <Card className="rounded-2xl border-rose-200/80 dark:border-rose-950/60 bg-white/80 dark:bg-slate-900/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3 pb-3">
              <div className="size-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-2xs">
                <AlertTriangle className="size-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                1. The Prevailing Problem
              </span>
              <CardTitle className="text-xl font-bold text-foreground">
                Black-Box Models & Bottlenecks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Specialists distrust complex neural networks that spit out raw risk percentages without clinical rationale. Without explanation, doctors cannot defend the diagnosis medico-legally.
              </p>
              <p>
                Meanwhile, unstratified patient backlogs overwhelm hospital imaging departments with false-positive inquiries, crowding out true high-risk cases.
              </p>
            </CardContent>
            <CardFooter className="pt-2 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 border-t border-border/40">
              <span>Erosion of clinical confidence</span>
            </CardFooter>
          </Card>

          {/* 2. The Solution */}
          <Card className="rounded-2xl border-teal-200/80 dark:border-teal-950/60 bg-white/80 dark:bg-slate-900/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3 pb-3">
              <div className="size-11 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-2xs">
                <Lightbulb className="size-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                2. The Solution
              </span>
              <CardTitle className="text-xl font-bold text-foreground">
                SHAP Interpretability & 3-Tier Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Lungent uses an interpretable ensemble (XGBoost, LightGBM, CatBoost) coupled with exact SHAP game-theoretic value calculations.
              </p>
              <p>
                Every prediction is accompanied by a transparent factor waterfall, mapped directly to an actionable 3-tier policy: <strong>RULE-OUT, REVIEW, or REFER</strong>.
              </p>
            </CardContent>
            <CardFooter className="pt-2 text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 border-t border-border/40">
              <span>Auditable, calibrated decision support</span>
            </CardFooter>
          </Card>

          {/* 3. How It Solves It */}
          <Card className="rounded-2xl border-indigo-200/80 dark:border-indigo-950/60 bg-white/80 dark:bg-slate-900/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3 pb-3">
              <div className="size-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
                <Workflow className="size-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                3. How It Solves It
              </span>
              <CardTitle className="text-xl font-bold text-foreground">
                Specialist Review Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="font-bold text-foreground shrink-0">Step 1:</span>
                <span><strong>Queue Ingestion:</strong> Ingests triaged community referrals pre-sorted by empirical risk probability.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-foreground shrink-0">Step 2:</span>
                <span><strong>SHAP Diagnostics:</strong> Clinician audits positive risk factors (e.g. tobacco duration) vs protective factors.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-foreground shrink-0">Step 3:</span>
                <span><strong>Action Sign-Off:</strong> Clinician confirms tier, schedules LDCT scanner time, or adjusts the follow-up interval.</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 border-t border-border/40">
              <span>Clinician-in-the-loop safety</span>
            </CardFooter>
          </Card>
        </div>

        {/* Interactive Case Inspector with SHAP Factors */}
        <div className="rounded-3xl border border-gray-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <BrainCircuit className="size-5 text-primary" />
                <span>Interpretable ML Feature Attribution (SHAP Inspector)</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Select a clinical case below to inspect feature contribution weights and decision policy recommendations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {clinicalCases.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedPatient(idx)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                    selectedPatient === idx
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/60 text-muted-foreground border-border/60 hover:bg-muted'
                  )}
                >
                  {c.name.split(' ')[0]} ({c.tier})
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Factor Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Patient & SHAP Bar Visualizer */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{active.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">Patient ID: {active.id} • {active.sex}, Age {active.age}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground block font-medium">Model Probability</span>
                  <span className="text-2xl font-mono font-black text-foreground">{active.score}</span>
                </div>
              </div>

              {/* SHAP Factors */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Eye className="size-3.5 text-primary" />
                  <span>Feature Contribution Weights (&Delta; Probability)</span>
                </span>

                <div className="space-y-2">
                  {active.shapFactors.map((f, i) => (
                    <div key={i} className="p-3 rounded-xl border border-border/60 bg-muted/30 flex items-center justify-between gap-4">
                      <span className="text-xs sm:text-sm font-medium text-foreground">{f.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={cn(
                            'font-mono text-xs font-bold px-2.5 py-0.5 rounded-md',
                            f.type === 'risk'
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          )}
                        >
                          {f.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: 3-Tier Policy Recommendation */}
            <div className="lg:col-span-5 rounded-2xl border border-sky-500/20 bg-sky-50/40 dark:bg-sky-950/30 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  3-Tier Policy Recommendation
                </span>
                <Badge variant="outline" className={cn('text-xs font-bold px-3 py-1 rounded-full border', active.tierColor)}>
                  {active.tier}
                </Badge>
              </div>

              <h4 className="text-base font-bold text-foreground">
                {active.decision}
              </h4>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-sky-200/60 dark:border-sky-900/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {active.clinicalGuidance}
              </div>

              <div className="pt-2">
                <Link
                  href="/clinical"
                  className={buttonVariants({
                    variant: 'default',
                    size: 'sm',
                    className: 'w-full font-semibold text-xs rounded-xl shadow-xs justify-between',
                  })}
                >
                  <span className="flex items-center gap-1.5">
                    <Stethoscope className="size-3.5" />
                    <span>Open Full Clinical Workspace</span>
                  </span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
          <Link
            href="/"
            className={buttonVariants({
              variant: 'outline',
              size: 'default',
              className: 'rounded-xl font-semibold text-sm',
            })}
          >
            <Home className="size-4 mr-2" />
            <span>Back to Lungent Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/admin"
              className={buttonVariants({
                variant: 'outline',
                size: 'default',
                className: 'rounded-xl font-semibold text-sm hover:border-primary/40',
              })}
            >
              <span>Next: View Admin Demo</span>
              <ChevronRight className="size-4 ml-1" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

