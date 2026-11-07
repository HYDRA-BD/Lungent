'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'motion/react'
import {
  Activity,
  HeartPulse,
  Building2,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  Flame,
  Wind,
  Cigarette,
  ChevronRight,
} from 'lucide-react'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'
import { SectionContainer } from '@/components/layouts/section-container'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Hero3DPeople } from '@/components/hero/hero-3d-people'
import { Hero3DLungs } from '@/components/hero/hero-3d-lungs'
import { useLanguage } from '@/i18n'

export function HomeClient() {
  const { dict } = useLanguage()

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  // Left 3D Parallax: drifts down with scroll and fades out past hero
  const leftY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const leftOpacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0.6, 0])

  // Right 3D Parallax: drifts down at a slightly different speed (organic depth) and fades out
  const rightY = useTransform(scrollYProgress, [0, 1], [0, 105])
  const rightOpacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0.6, 0])

  const workspaceCards = [
    {
      title: dict.home.patientCardTitle,
      desc: dict.home.patientCardDesc,
      icon: HeartPulse,
      iconColor: 'bg-primary/10 text-primary',
      href: '/portal/patient',
      btnLabel: 'View Demo',
      isDemo: true,
      badge: 'Demo',
    },
    {
      title: dict.home.chwCardTitle,
      desc: dict.home.chwCardDesc,
      icon: Building2,
      iconColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      href: '/portal/community',
      btnLabel: 'View Demo',
      isDemo: true,
      badge: 'Demo',
    },
    {
      title: dict.home.clinicianCardTitle,
      desc: dict.home.clinicianCardDesc,
      icon: Stethoscope,
      iconColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      href: '/portal/clinician',
      btnLabel: 'View Demo',
      isDemo: true,
      badge: 'Demo',
    },
    {
      title: dict.home.governanceCardTitle,
      desc: dict.home.governanceCardDesc,
      icon: ShieldCheck,
      iconColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      href: '/portal/admin',
      btnLabel: 'View Demo',
      isDemo: true,
      badge: 'Demo',
    },
  ]

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

      <main className="flex-1 space-y-16 sm:space-y-24 py-6 sm:py-12">
        {/* 1. Hero Section with 3D Side Elements & Scroll Parallax */}
        <section className="mx-auto w-full max-w-[1536px] px-4 md:px-8 lg:px-12 pt-8 sm:pt-12">
          <div
            ref={heroRef}
            className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_1fr] gap-8 xl:gap-16 items-center py-4 sm:py-8"
          >
            {/* Left Column: 3D People (Worried Patient / Consultation) - Desktop Only */}
            <div className="hidden lg:flex justify-end items-center">
              <Hero3DPeople parallaxY={leftY} parallaxOpacity={leftOpacity} />
            </div>

            {/* Center Column: Main Headline, Subtitle & Action CTAs - Full Width on Mobile */}
            <div className="w-full text-center space-y-6 sm:space-y-7 mx-auto flex flex-col items-center">
              {/* Clinical Evidence Badge */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4.5 py-1.5 text-sm sm:text-[15px] font-semibold text-primary border border-primary/20 shadow-xs hover:border-primary/40 transition-colors"
              >
                <Activity className="size-4 text-primary animate-pulse" aria-hidden="true" />
                <span>{dict.home.heroBadge}</span>
              </motion.div>

              {/* Main Wordmark Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
                className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight text-foreground font-sans leading-[1.14] text-center max-w-4xl"
              >
                <span>{dict.home.heroTitlePrefix}</span>{' '}
                <span className="bg-gradient-to-r from-primary via-teal-600 to-sky-600 bg-clip-text text-transparent inline-block">
                  {dict.home.heroTitleHighlight}
                </span>{' '}
                <span className="inline-block">{dict.home.heroTitleSuffix}</span>
              </motion.h1>

              {/* Description / Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.22, ease: 'easeOut' }}
                className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal"
              >
                {dict.home.heroDescription}
              </motion.p>

              {/* Action CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.35, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full"
              >
                <Link
                  href="/ai-assessment"
                  className={buttonVariants({
                    variant: 'default',
                    size: 'xl',
                    className:
                      'w-full sm:w-auto shrink-0 shadow-md text-base sm:text-lg font-bold bg-primary hover:bg-primary/95 hover:scale-105 active:scale-98 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 h-14 px-8 whitespace-nowrap',
                  })}
                >
                  <Activity className="size-5 mr-2 shrink-0" />
                  <span>Run AI Risk Assessment</span>
                  <ArrowRight className="size-5 ml-2 shrink-0" />
                </Link>
                <Link
                  href="/how-it-works"
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'xl',
                    className:
                      'w-full sm:w-auto shrink-0 text-base sm:text-lg font-semibold hover:border-primary/40 hover:bg-muted/70 dark:hover:bg-slate-800 transition-all duration-200 h-14 px-7 whitespace-nowrap',
                  })}
                >
                  <span>{dict.home.heroCtaPrimary}</span>
                  <ChevronRight className="size-4 ml-1 shrink-0" />
                </Link>
              </motion.div>
            </div>

            {/* Right Column: 3D Lungs Image (Respiratory Focus) - Desktop Only */}
            <div className="hidden lg:flex justify-start items-center">
              <Hero3DLungs parallaxY={rightY} parallaxOpacity={rightOpacity} />
            </div>
          </div>
        </section>

        {/* 2. Mandatory Non-Diagnostic Clinical Safety Banner */}
        <SectionContainer size="lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-primary/30 dark:border-primary/40 bg-primary/5 dark:bg-primary/10 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-primary/50 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="size-6" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Clinical Decision Support — Not Medical Diagnosis
                </h2>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
                  {dict.common.clinicalNoticeBody}
                </p>
              </div>
            </div>

            <Link
              href="/about"
              className={buttonVariants({
                variant: 'outline',
                size: 'default',
                className:
                  'shrink-0 text-sm sm:text-base font-semibold hover:scale-105 active:scale-98 transition-all hover:border-primary/40 dark:hover:bg-slate-800',
              })}
            >
              <span>Clinical Scope</span>
              <ChevronRight className="size-4 ml-1" />
            </Link>
          </motion.div>
        </SectionContainer>

        {/* 3. Multi-Disciplinary Workspaces & Pathways */}
        <SectionContainer size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12 space-y-3"
          >
            <Badge variant="outline" className="mb-1 text-sm font-semibold px-3.5 py-1">
              Ecosystem Architecture
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {dict.home.capabilitiesTitle}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {dict.home.capabilitiesSubtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workspaceCards.map((card, idx) => {
              const IconComp = card.icon
              return (
                <motion.div
                  key={card.href}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: idx * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="flex"
                >
                  <Card className="hover:border-primary/50 transition-all flex flex-col justify-between w-full shadow-xs hover:shadow-xl hover:shadow-primary/5 rounded-2xl relative overflow-hidden group bg-card dark:bg-slate-900 border-border/80 dark:border-slate-800">
                    <CardHeader className="space-y-3.5 pb-4">
                      <div className="flex items-center justify-between">
                        <div className={`size-12 rounded-2xl ${card.iconColor} flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xs`}>
                          <IconComp className="size-6" />
                        </div>
                        {card.badge && (
                          <Badge
                            variant={card.isDemo ? "outline" : "default"}
                            className={cn(
                              "text-xs px-2.5 py-0.5 rounded-full font-semibold",
                              card.isDemo
                                ? "border-teal-500/40 text-teal-700 dark:text-teal-300 bg-teal-50/60 dark:bg-teal-950/40"
                                : "bg-primary text-primary-foreground"
                            )}
                          >
                            {card.badge}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl font-bold">{card.title}</CardTitle>
                      <CardDescription className="text-sm sm:text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                        {card.desc}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2">
                      <Link
                        href={card.href}
                        className={buttonVariants({
                          variant: card.isDemo ? 'outline' : 'default',
                          size: 'default',
                          className: cn(
                            'w-full text-sm sm:text-base font-semibold justify-between rounded-xl transition-all duration-200 group-hover:translate-y-[-2px] shadow-xs cursor-pointer',
                            card.isDemo
                              ? 'hover:border-primary/60 hover:bg-primary/10 hover:text-primary hover:shadow-md dark:border-slate-800 dark:hover:bg-slate-800'
                              : 'hover:bg-primary/95 hover:shadow-md'
                          ),
                        })}
                      >
                        <span>{card.btnLabel}</span>
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </SectionContainer>

        {/* 4. Why Early Detection & Risk Awareness Matter */}
        <section className="bg-muted/30 dark:bg-slate-900/40 py-20 border-y border-border/80 dark:border-slate-800/80">
          <SectionContainer size="lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4 }}
              className="text-center mb-14 space-y-3 max-w-3xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {dict.home.whyEarlyDetectionTitle}
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {dict.home.whyEarlyDetectionSubtitle}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Stat 1 */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.1 }}
                whileHover={{ y: -4 }}
                className="rounded-3xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-8 shadow-xs space-y-4 text-center hover:border-destructive/40 transition-all hover:shadow-lg"
              >
                <span className="text-5xl sm:text-6xl font-black text-destructive tracking-tight block">
                  {dict.home.stat1Value}
                </span>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {dict.home.stat1Label}
                </p>
              </motion.div>

              {/* Stat 2 */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.2 }}
                whileHover={{ y: -4 }}
                className="rounded-3xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-8 shadow-xs space-y-4 text-center hover:border-primary/40 transition-all hover:shadow-lg"
              >
                <span className="text-5xl sm:text-6xl font-black text-primary tracking-tight block">
                  {dict.home.stat2Value}
                </span>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {dict.home.stat2Label}
                </p>
              </motion.div>

              {/* Stat 3 */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.3 }}
                whileHover={{ y: -4 }}
                className="rounded-3xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-8 shadow-xs space-y-4 text-center hover:border-warning/40 transition-all hover:shadow-lg"
              >
                <span className="text-5xl sm:text-6xl font-black text-warning tracking-tight block">
                  {dict.home.stat3Value}
                </span>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {dict.home.stat3Label}
                </p>
              </motion.div>
            </div>
          </SectionContainer>
        </section>

        {/* 5. Regional Environmental & Exposure Intelligence Section */}
        <SectionContainer size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <Badge variant="default" className="text-sm font-semibold px-3.5 py-1">
                Regional Context Factor Engine
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {dict.home.triageSectionTitle}
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {dict.home.triageSectionBody}
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4 p-4 rounded-2xl border border-border/80 dark:border-slate-800 bg-card dark:bg-slate-900 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-xs">
                  <div className="size-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-destructive flex items-center justify-center shrink-0">
                    <Cigarette className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-base text-foreground">
                      Tobacco & Bidi Smoking (Pack-Years)
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Quantifying cumulative carcinogenic exposure and active cessation duration.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl border border-border/80 dark:border-slate-800 bg-card dark:bg-slate-900 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-xs">
                  <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Flame className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-base text-foreground">
                      Biomass Cooking Fuel Smoke
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Decades of solid fuel combustion exposure in non-ventilated domestic settings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl border border-border/80 dark:border-slate-800 bg-card dark:bg-slate-900 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-xs">
                  <div className="size-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Wind className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-base text-foreground">
                      Ambient Particulate Matter (PM2.5)
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Urban ambient air pollution and occupational industrial dust hazards.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Diagnostic Distinction Highlight Box */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-border/80 dark:border-slate-800 bg-card dark:bg-slate-900 p-7 md:p-9 space-y-6 shadow-xs hover:shadow-md transition-all duration-300"
            >
              <div className="inline-flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider">
                <AlertTriangle className="size-4 text-warning" />
                <span>Clinical Governance Principles</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                Understanding Clinical Boundaries
              </h3>
              <ul className="space-y-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />
                  <span>
                    <strong className="text-foreground">Risk Assessment:</strong>{' '}
                    Analyzes exposure factors to calculate statistical probabilities and guide clinical consultations.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />
                  <span>
                    <strong className="text-foreground">Screening Eligibility:</strong>{' '}
                    Determines whether an asymptomatic person qualifies for Low-Dose CT imaging based on validated guidelines.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />
                  <span>
                    <strong className="text-foreground">Definitive Diagnosis:</strong>{' '}
                    Always requires physician examination, radiological cross-sections, and biopsy confirmation.
                  </span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href="/faqs"
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'default',
                    className:
                      'w-full justify-center text-sm sm:text-base font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all dark:border-slate-800 dark:hover:bg-slate-800',
                  })}
                >
                  <HelpCircle className="size-4 mr-2 text-primary" />
                  <span>Explore Platform FAQs</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </SectionContainer>

        {/* 6. Call to Action Banner */}
        <SectionContainer size="lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-primary/30 dark:border-primary/40 bg-gradient-to-r from-primary/15 via-primary/5 to-background dark:from-primary/20 dark:via-primary/10 dark:to-slate-950 p-8 sm:p-14 text-center space-y-7 shadow-xs"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight max-w-2xl mx-auto">
              {dict.home.ctaBannerTitle}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {dict.home.ctaBannerBody}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <Link
                href="/ai-assessment"
                className={buttonVariants({
                  variant: 'default',
                  size: 'xl',
                  className:
                    'w-full sm:w-auto shadow-md hover:scale-105 active:scale-98 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 h-13 px-8 text-base sm:text-lg font-bold',
                })}
              >
                <Activity className="size-5 mr-2" />
                <span>Start AI Risk Assessment</span>
                <ArrowRight className="size-5 ml-2" />
              </Link>
              <Link
                href="/contact"
                className={buttonVariants({
                  variant: 'outline',
                  size: 'xl',
                  className:
                    'w-full sm:w-auto h-13 px-7 text-base sm:text-lg font-semibold hover:scale-105 active:scale-98 transition-all dark:border-slate-800 dark:hover:bg-slate-800',
                })}
              >
                <span>Contact Support</span>
              </Link>
            </div>
          </motion.div>
        </SectionContainer>
      </main>

      <Footer />
    </div>
  )
}
