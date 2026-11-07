'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  HeartPulse,
  Home,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  Workflow,
  ShieldCheck,
  CheckCircle2,
  FileText,
  UserCheck,
  Sparkles,
  Stethoscope,
  Info,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { cn } from '@/lib/utils'

export function PatientDemoClient() {
  const [selectedCase, setSelectedCase] = useState<number>(0)

  const patientCases = [
    {
      id: 1,
      persona: 'Rahim Uddin',
      age: 61,
      location: 'Kurigram, Rangpur',
      tobacco: '32 Pack-Years (Active Bidi Smoker)',
      exposure: 'Biomass Chula Cooking & Agricultural Dust',
      riskTier: 'REFER',
      riskColor: 'bg-destructive/15 text-destructive border-destructive/30',
      action: 'Priority Clinical Referral: Recommended for prompt evaluation at a district hospital pulmonary outpatient clinic.',
      guidance: 'Your assessment indicates significant cumulative tobacco and environmental exposure. A formal clinical review with a specialist is strongly advised to discuss comprehensive evaluation.',
      factors: ['Heavy Smoking History (>30 Pack-Years)', 'Age Over 55', 'Household Biomass Smoke Exposure'],
    },
    {
      id: 2,
      persona: 'Farida Parveen',
      age: 52,
      location: 'Manikganj, Dhaka',
      tobacco: '12 Pack-Years (Quit 8 years ago)',
      exposure: 'Indoor Wood Cooking & Ambient Particulates',
      riskTier: 'REVIEW',
      riskColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
      action: 'Scheduled Clinical Review: Recommended routine follow-up with a local healthcare provider within 3–6 months.',
      guidance: 'Your risk score is intermediate. Because you successfully ceased smoking, your overall trajectory is improving, but past exposure warrants periodic checkups.',
      factors: ['Moderate Past Tobacco Use', 'Indoor Biomass Smoke Exposure', 'Smoking Cessation >5 Years (Protective)'],
    },
    {
      id: 3,
      persona: 'Anik Roy',
      age: 34,
      location: 'Dhanmondi, Dhaka',
      tobacco: 'Non-Smoker (<100 lifetime cigarettes)',
      exposure: 'Urban Traffic & Ambient Dust',
      riskTier: 'RULE-OUT',
      riskColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      action: 'Low Risk Reassurance: No immediate clinical screening or diagnostic imaging recommended.',
      guidance: 'Your assessment reflects a low empirical risk profile. Continue routine health maintenance, stay physically active, and remain completely tobacco-free.',
      factors: ['Zero Sustained Tobacco Exposure', 'Age Under 40 (Protective)', 'No Chronic Respiratory Diagnoses'],
    },
  ]

  const activeCase = patientCases[selectedCase]

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col selection:bg-primary/20">
      {/* Top Portal Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-100/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md shadow-xs">
        <div className="container mx-auto flex h-16 sm:h-18 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="compact" href="/" />
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border/80">
              <span className="text-sm font-semibold text-foreground">Patient Health Portal</span>
              <Badge variant="outline" className="border-teal-500/40 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 text-[11px]">
                Demo
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Interactive Pitch View</span>
            <LanguageSwitcher variant="compact" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-6xl space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 border border-teal-500/20">
            <HeartPulse className="size-3.5" />
            <span>Patient Empowerment</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Accessible Risk Awareness <br />
            <span className="bg-gradient-to-r from-teal-600 via-primary to-emerald-600 bg-clip-text text-transparent">
              Without the Imaging Barrier
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Bridging the gap between advanced AI research and accessible healthcare for underserved communities.
          </p>
        </div>

        {/* 3 Core Structural Cards: Problem, Solution, Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Section 1: The Problem & Why It Is Serious */}
          <Card className="rounded-2xl border-rose-200/80 dark:border-rose-950/60 bg-white/80 dark:bg-slate-900/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3 pb-3">
              <div className="size-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-2xs">
                <AlertTriangle className="size-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                1. The Problem & Why It Is Serious
              </span>
              <CardTitle className="text-xl font-bold text-foreground">
                The Screening Gap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Lung cancer often goes undetected until late stages because traditional Low-Dose CT (LDCT) screening requires expensive infrastructure and specialist access.
              </p>
              <p>
                For rural and underserved populations, these barriers lead to delayed diagnoses and significantly worse survival rates. Many individuals simply do not realize they are at risk.
              </p>
            </CardContent>
            <CardFooter className="pt-2 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 border-t border-border/40">
              <span>Severe infrastructure & access barriers</span>
            </CardFooter>
          </Card>

          {/* Section 2: The Lungent Solution */}
          <Card className="rounded-2xl border-teal-200/80 dark:border-teal-950/60 bg-white/80 dark:bg-slate-900/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3 pb-3">
              <div className="size-11 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-2xs">
                <Lightbulb className="size-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                2. The Lungent Solution
              </span>
              <CardTitle className="text-xl font-bold text-foreground">
                Non-Imaging, Interpretable AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Lungent changes this by utilizing a low-cost, non-imaging approach.
              </p>
              <p>
                By analyzing easily accessible demographic, behavioral, and clinical survey data (like the CDC BRFSS dataset), our interpretable machine learning model can estimate preliminary lung cancer risk without a single X-ray or scan.
              </p>
            </CardContent>
            <CardFooter className="pt-2 text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 border-t border-border/40">
              <span>CDC BRFSS validated survey model</span>
            </CardFooter>
          </Card>

          {/* Section 3: How It Solves the Problem */}
          <Card className="rounded-2xl border-indigo-200/80 dark:border-indigo-950/60 bg-white/80 dark:bg-slate-900/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3 pb-3">
              <div className="size-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
                <Workflow className="size-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                3. How It Solves the Problem
              </span>
              <CardTitle className="text-xl font-bold text-foreground">
                Actionable Clinical Guidance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                The portal translates complex risk models into a simple, 3-tier decision policy: <strong>RULE-OUT</strong>, <strong>REVIEW</strong>, or <strong>REFER</strong>.
              </p>
              <p>
                This empowers individuals to understand their risk and provides clear guidance on whether they should seek further professional medical evaluation, ultimately facilitating earlier clinical intervention.
              </p>
            </CardContent>
            <CardFooter className="pt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 border-t border-border/40">
              <span>Empowers timely clinical intervention</span>
            </CardFooter>
          </Card>
        </div>

        {/* Interactive Case Simulator */}
        <div className="rounded-3xl border border-gray-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <UserCheck className="size-5 text-primary" />
                <span>Simulated Patient Assessment Preview</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Select a simulated patient profile to observe how non-imaging data generates clear, compassionate clinical guidance.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {patientCases.map((c, index) => (
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
                  Persona #{c.id}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Case Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{activeCase.persona}</h3>
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
                  <span className="text-muted-foreground">Triage Recommendation:</span>
                  <span className="font-medium text-foreground">{activeCase.action}</span>
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
                <Sparkles className="size-5 text-teal-600 dark:text-teal-400" />
                <h4 className="text-sm font-bold text-foreground">Compassionate Patient Guidance</h4>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {activeCase.guidance}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/ai-assessment"
                  className={buttonVariants({
                    variant: 'default',
                    size: 'sm',
                    className: 'font-semibold text-xs rounded-xl shadow-xs',
                  })}
                >
                  <HeartPulse className="size-3.5 mr-1.5" />
                  <span>Run Live AI Risk Assessment</span>
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
              href="/portal/community"
              className={buttonVariants({
                variant: 'outline',
                size: 'default',
                className: 'rounded-xl font-semibold text-sm hover:border-primary/40',
              })}
            >
              <span>Next: View Health Worker Demo</span>
              <ChevronRight className="size-4 ml-1" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

