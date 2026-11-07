'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Home,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  Workflow,
  Building2,
  BarChart3,
  CheckCircle2,
  Server,
  Lock,
  Database,
  Users,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AdminDemoClient() {
  const [selectedFacility, setSelectedFacility] = useState<number>(0)

  const facilities = [
    {
      id: 'FAC-DHK-01',
      name: 'National Institute of Cancer Research & Hospital (NICRH)',
      city: 'Dhaka',
      tier: 'Tertiary Referral Center',
      screened: '1,420 Patients',
      concordance: '97.2%',
      referralRate: '18.4%',
      ldctCapacity: '2 Scanners (84% Utilized)',
      status: 'Active & Audited',
    },
    {
      id: 'FAC-CTG-02',
      name: 'Chittagong Medical College Hospital (CMCH)',
      city: 'Chattogram',
      tier: 'Tertiary Referral Center',
      screened: '890 Patients',
      concordance: '96.5%',
      referralRate: '15.8%',
      ldctCapacity: '1 Scanner (92% Utilized)',
      status: 'Active & Audited',
    },
    {
      id: 'FAC-RNG-03',
      name: 'Rangpur Medical College Hospital (RMCH)',
      city: 'Rangpur',
      tier: 'Regional Referral Center',
      screened: '640 Patients',
      concordance: '98.1%',
      referralRate: '21.3%',
      ldctCapacity: '1 Scanner (76% Utilized)',
      status: 'Active & Audited',
    },
  ]

  const activeFac = facilities[selectedFacility]

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col selection:bg-primary/20">
      {/* Top Portal Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-100/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md shadow-xs">
        <div className="container mx-auto flex h-16 sm:h-18 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="compact" href="/" />
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border/80">
              <span className="text-sm font-semibold text-foreground">Governance & Administration Portal</span>
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
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="size-3.5" />
            <span>Algorithmic Governance & Population Health</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Multi-Center Oversight <br />
            <span className="bg-gradient-to-r from-indigo-600 via-primary to-teal-600 bg-clip-text text-transparent">
              With Immutable Audit Telemetry
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Providing health ministries and hospital administrators with population-level epidemiological intelligence, algorithm concordance metrics, and scanner capacity tracking.
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
                Fragmented Health Silos & Blind Spots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Public health officials have zero consolidated visibility into which upazilas suffer the highest burden of tobacco exposure, chronic obstructive disorders, and biomass fuel smoke.
              </p>
              <p>
                Without centralized audit trails, healthcare systems cannot verify whether clinical guidelines for lung cancer screening eligibility are adhered to or if bias exists across demographics.
              </p>
            </CardContent>
            <CardFooter className="pt-2 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 border-t border-border/40">
              <span>Uncoordinated screening resources</span>
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
                Algorithmic Audit & Governance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                An enterprise-grade governance platform that aggregates anonymized non-imaging BRFSS assessment metrics from every registered center in real-time.
              </p>
              <p>
                Measures model concordance (how often clinicians agree with the 3-Tier Policy), detects potential demographic disparities, and tracks LDCT scanner slot saturation.
              </p>
            </CardContent>
            <CardFooter className="pt-2 text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 border-t border-border/40">
              <span>Accountable, data-driven stewardship</span>
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
                National Governance Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="font-bold text-foreground shrink-0">Step 1:</span>
                <span><strong>District Aggregation:</strong> Visualizes regional risk density maps and intake rates.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-foreground shrink-0">Step 2:</span>
                <span><strong>Concordance Auditing:</strong> Flags discrepancies between AI suggestions and clinician actions.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-foreground shrink-0">Step 3:</span>
                <span><strong>Capacity Steering:</strong> Reallocates screening quotas and referral pathways to eliminate queues.</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 border-t border-border/40">
              <span>System-wide healthcare optimization</span>
            </CardFooter>
          </Card>
        </div>

        {/* Interactive Facility Governance Matrix */}
        <div className="rounded-3xl border border-gray-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                <span>Multi-Facility Network Telemetry</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Select a facility node to inspect its algorithmic concordance, screening volume, and scanner capacity.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {facilities.map((f, idx) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFacility(idx)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                    selectedFacility === idx
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/60 text-muted-foreground border-border/60 hover:bg-muted'
                  )}
                >
                  {f.city} Center
                </button>
              ))}
            </div>
          </div>

          {/* Selected Facility Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div>
                <Badge variant="outline" className="mb-1 text-[11px] font-mono text-primary border-primary/30">
                  {activeFac.id}
                </Badge>
                <h3 className="text-lg font-bold text-foreground">{activeFac.name}</h3>
                <p className="text-xs text-muted-foreground">{activeFac.tier} • {activeFac.city}, Bangladesh</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[11px] text-muted-foreground block">Screening Volume</span>
                  <span className="text-lg font-black text-foreground">{activeFac.screened}</span>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[11px] text-muted-foreground block">AI-Clinician Concordance</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{activeFac.concordance}</span>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[11px] text-muted-foreground block">High-Risk Referral Rate</span>
                  <span className="text-lg font-black text-foreground">{activeFac.referralRate}</span>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[11px] text-muted-foreground block">LDCT Utilization</span>
                  <span className="text-lg font-black text-foreground">{activeFac.ldctCapacity}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Governance Integrity Status
                </span>
                <Badge variant="default" className="text-xs font-bold px-3 py-1 bg-emerald-600 text-white rounded-full">
                  {activeFac.status}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                All BRFSS non-imaging survey predictions, override logs, and patient referral outcomes are hashed and audit-logged in accordance with national health governance policies.
              </p>

              <div className="pt-2">
                <Link
                  href="/admin"
                  className={buttonVariants({
                    variant: 'default',
                    size: 'sm',
                    className: 'w-full font-semibold text-xs rounded-xl shadow-xs justify-between',
                  })}
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5" />
                    <span>Open Full Admin & Governance Workspace</span>
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
              href="/portal/patient"
              className={buttonVariants({
                variant: 'default',
                size: 'default',
                className: 'rounded-xl font-semibold text-sm shadow-xs',
              })}
            >
              <span>View Patient Demo</span>
              <ArrowRight className="size-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

