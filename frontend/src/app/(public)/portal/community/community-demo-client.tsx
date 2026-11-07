'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  Building2,
  Home,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  Workflow,
  ShieldCheck,
  ClipboardList,
  CheckCircle2,
  Users,
  Flame,
  PhoneCall,
  Activity,
  FileText,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CommunityDemoClient() {
  const [selectedCase, setSelectedCase] = useState<number>(0)

  const sampleCases = [
    {
      id: 1,
      patient: 'Md. Abdul Karim',
      age: 62,
      location: 'Pirgachha, Rangpur',
      tobacco: '34 Pack-Years (Current Smoker)',
      exposure: 'Biomass Cooking & Agricultural Dust',
      riskTier: 'REFER',
      riskColor: 'bg-destructive/15 text-destructive border-destructive/30',
      action: 'Priority referral ticket issued for regional thoracic consultation at Rangpur Medical College.',
      factors: ['Heavy Smoking (>30 Pack-Years)', 'Age >55', 'Prolonged Biomass Smoke Exposure'],
    },
    {
      id: 2,
      patient: 'Nasreen Begum',
      age: 54,
      location: 'Sreepur, Gazipur',
      tobacco: '14 Pack-Years (Quit 6 years ago)',
      exposure: 'Textile Factory Ambient Particulates',
      riskTier: 'REVIEW',
      riskColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
      action: 'Scheduled 6-month community health worker follow-up and smoking cessation counseling.',
      factors: ['Moderate Past Smoking', 'Occupational Particulate History'],
    },
    {
      id: 3,
      patient: 'Sohag Hossain',
      age: 38,
      location: 'Keraniganj, Dhaka',
      tobacco: 'Non-Smoker (<100 lifetime cigarettes)',
      exposure: 'Urban Ambient Air',
      riskTier: 'RULE-OUT',
      riskColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      action: 'Reassurance provided. Primary lifestyle prevention guidance recorded.',
      factors: ['Zero Heavy Tobacco Exposure', 'No Chronic Respiratory Comorbidities'],
    },
  ]

  const activeCase = sampleCases[selectedCase]

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col selection:bg-primary/20">
      {/* Top Portal Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-100/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md shadow-xs">
        <div className="container mx-auto flex h-16 sm:h-18 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="compact" href="/" />
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border/80">
              <span className="text-sm font-semibold text-foreground">Community Health Worker Portal</span>
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
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Building2 className="size-3.5" />
            <span>Product Pitch & Interactive Demonstration</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Frontline Community Intake <br />
            <span className="bg-gradient-to-r from-teal-600 via-primary to-emerald-600 bg-clip-text text-transparent">
              Without Radiographic Scanners
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Empowering rural and community health workers (CHWs) across Bangladesh to conduct rapid, survey-based lung cancer risk pre-screening in under 3 minutes.
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
                Zero CT Scanners in Rural Upazilas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                In underserved populations, low-dose CT scanners are non-existent. Patients must travel hundreds of kilometers to divisional medical colleges, leading to delayed presentation.
              </p>
              <p>
                Crucial tobacco exposure histories, biomass smoke exposure, and chronic pulmonary comorbidities are rarely recorded systematically, resulting in late-stage (Stage III/IV) detection.
              </p>
            </CardContent>
            <CardFooter className="pt-2 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 border-t border-border/40">
              <span>Severe diagnostic disparity</span>
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
                Survey-Based Non-Imaging ML
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                A mobile-responsive, low-bandwidth web intake tool utilizing validated non-imaging epidemiological variables from the BRFSS research cohort.
              </p>
              <p>
                Frontline workers with low digital literacy can input basic demographics, pack-years, and occupational history to generate an objective 3-Tier Policy determination: <strong>Rule-Out, Review, or Refer</strong>.
              </p>
            </CardContent>
            <CardFooter className="pt-2 text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 border-t border-border/40">
              <span>Evidence-based empirical triage</span>
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
                3-Step Frontline Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="font-bold text-foreground shrink-0">Step 1:</span>
                <span><strong>Field Intake:</strong> Guided 12-question interview on age, smoking history, and respiratory symptoms.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-foreground shrink-0">Step 2:</span>
                <span><strong>Ensemble Model:</strong> XGBoost + LightGBM + CatBoost computes risk score locally in milliseconds.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-foreground shrink-0">Step 3:</span>
                <span><strong>Direct Referral:</strong> Generates a printable/SMS digital referral ticket for district hospitals.</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 border-t border-border/40">
              <span>Seamless continuum of care</span>
            </CardFooter>
          </Card>
        </div>

        {/* Interactive Case Simulator */}
        <div className="rounded-3xl border border-gray-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <ClipboardList className="size-5 text-primary" />
                <span>Simulated Field Intake Queue</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Select a simulated field patient case to evaluate the real-time 3-Tier Policy determination.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {sampleCases.map((c, index) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCase(index)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                    selectedCase === index
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/60 text-muted-foreground border-border/60 hover:bg-muted'
                  )}
                >
                  Case #{c.id}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Case Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{activeCase.patient}</h3>
                  <p className="text-xs text-muted-foreground">{activeCase.location} • Age {activeCase.age}</p>
                </div>
                <Badge variant="outline" className={cn('text-xs font-bold px-3 py-1 rounded-full border', activeCase.riskColor)}>
                  Decision: {activeCase.riskTier}
                </Badge>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Smoking History:</span>
                  <span className="font-semibold text-foreground">{activeCase.tobacco}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Environmental Exposure:</span>
                  <span className="font-semibold text-foreground">{activeCase.exposure}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Empirical Risk Model:</span>
                  <span className="font-mono text-foreground">XGBoost-BRFSS Ensemble v1.0</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground block">Key Contributory Factors:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeCase.factors.map((f, i) => (
                    <span key={i} className="text-[11px] font-medium bg-muted px-2.5 py-0.5 rounded-full text-foreground/80">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-teal-500/20 bg-teal-50/40 dark:bg-teal-950/30 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-teal-600 dark:text-teal-400" />
                <h4 className="text-sm font-bold text-foreground">Recommended Frontline Action</h4>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {activeCase.action}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/healthcare-worker"
                  className={buttonVariants({
                    variant: 'default',
                    size: 'sm',
                    className: 'font-semibold text-xs rounded-xl shadow-xs',
                  })}
                >
                  <Building2 className="size-3.5 mr-1.5" />
                  <span>Open Full Operational CHW Dashboard</span>
                  <ArrowRight className="size-3.5 ml-1" />
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
              href="/portal/clinician"
              className={buttonVariants({
                variant: 'outline',
                size: 'default',
                className: 'rounded-xl font-semibold text-sm hover:border-primary/40',
              })}
            >
              <span>Next: View Clinician Demo</span>
              <ChevronRight className="size-4 ml-1" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

