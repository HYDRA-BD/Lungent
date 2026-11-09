'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  Sparkles,
} from 'lucide-react'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'
import { SectionContainer } from '@/components/layouts/section-container'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/i18n'
import { createClient } from '@/lib/supabase/client'

// Dynamic imports to optimize initial bundle size & defer client rendering
const Hero3DPeople = dynamic(
  () => import('@/components/hero/hero-3d-people').then((mod) => mod.Hero3DPeople),
  {
    ssr: false,
    loading: () => (
      <div className="w-[320px] xl:w-[380px] h-[360px] rounded-3xl bg-muted/20 animate-pulse border border-border/40" />
    ),
  }
)

const Hero3DLungs = dynamic(
  () => import('@/components/hero/hero-3d-lungs').then((mod) => mod.Hero3DLungs),
  {
    ssr: false,
    loading: () => (
      <div className="w-[320px] xl:w-[380px] h-[360px] rounded-3xl bg-muted/20 animate-pulse border border-border/40" />
    ),
  }
)

const ModelPerformanceSection = dynamic(
  () =>
    import('@/components/home/model-performance-section').then(
      (mod) => mod.ModelPerformanceSection
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 rounded-3xl bg-muted/20 animate-pulse my-12" />
    ),
  }
)

export function HomeClient() {
  const router = useRouter()
  const { dict } = useLanguage()

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // Verify authentication session
  useEffect(() => {
    let mounted = true

    function checkAuth() {
      if (typeof document === 'undefined') return
      const cookies = document.cookie.split(';').map((c) => c.trim())
      const demoCookie = cookies.find((c) => c.startsWith('lungent_auth_demo='))?.split('=')[1]
      const roleCookie = cookies.find((c) => c.startsWith('lungent_role='))?.split('=')[1]

      if (demoCookie === 'true' || roleCookie) {
        if (mounted) setIsAuthenticated(true)
      } else {
        if (mounted) setIsAuthenticated(false)
      }
    }

    checkAuth()

    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        if (session?.user) {
          setIsAuthenticated(true)
        } else if (
          typeof document !== 'undefined' &&
          document.cookie.indexOf('lungent_auth_demo=true') === -1 &&
          document.cookie.indexOf('lungent_role=') === -1
        ) {
          setIsAuthenticated(false)
        }
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        const hasCookies =
          typeof document !== 'undefined' &&
          (document.cookie.indexOf('lungent_auth_demo=true') !== -1 ||
            document.cookie.indexOf('lungent_role=') !== -1)
        setIsAuthenticated(!!session?.user || hasCookies)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

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
                <div className="mt-2.5 pt-2 border-t border-primary/20 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-semibold text-primary">Screening Reality:</span> While Low-Dose CT (LDCT) is the reliable gold standard for lung cancer detection, it carries radiation risks and is not available in every rural or underserved hospital. Lungent bridges this preliminary gap at community level.
                </div>
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

        {/* 3. Why Early Detection & Risk Awareness Matter */}
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

        {/* 4. NEW: CancerDePulmo Model Performance Section */}
        <ModelPerformanceSection />

        {/* 5. Ecosystem Architecture (Upcoming Mega Update · Coming Soon Roadmap) */}
        <section className="pt-10 sm:pt-12 pb-16 sm:pb-20 border-t border-border/80 dark:border-slate-800/80 bg-muted/20 dark:bg-slate-950/40">
          <SectionContainer size="lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4 }}
              className="text-center mb-10 space-y-3"
            >
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 shadow-xs mb-1">
                <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400" />
                <span>Upcoming Mega Update · Phase 2 &amp; Phase 3 Roadmap</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Ecosystem Architecture &amp; Unified Workspaces
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Future-proof multi-disciplinary care pathways currently in active roadmap development. <strong>Phase 3 Roadmap:</strong> Integrating future EHR and Imaging models to further <strong>minimize false positives</strong> and refine diagnostic accuracy.
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
                    <Card className="hover:border-primary/50 transition-all flex flex-col justify-between w-full shadow-xs hover:shadow-xl hover:shadow-primary/5 rounded-2xl relative overflow-hidden group bg-card dark:bg-slate-900 border-border/80 dark:border-slate-800 border-dashed">
                      {/* Top Roadmap Indicator Ribbon */}
                      <div className="bg-amber-500/15 dark:bg-amber-500/10 px-4 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between border-b border-amber-500/20">
                        <span>Roadmap Pilot</span>
                        <span className="font-mono text-[10px]">Target: Q2 2026</span>
                      </div>

                      <CardHeader className="space-y-3.5 pb-4">
                        <div className="flex items-center justify-between">
                          <div className={`size-12 rounded-2xl ${card.iconColor} flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xs`}>
                            <IconComp className="size-6" />
                          </div>
                          <Badge
                            variant="outline"
                            className="border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/40 text-xs px-2.5 py-0.5 rounded-full font-semibold"
                          >
                            Coming Soon
                          </Badge>
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
                            variant: 'outline',
                            size: 'default',
                            className:
                              'w-full text-sm sm:text-base font-semibold justify-between rounded-xl transition-all duration-200 group-hover:translate-y-[-2px] shadow-xs cursor-pointer hover:border-primary/60 hover:bg-primary/10 hover:text-primary hover:shadow-md dark:border-slate-800 dark:hover:bg-slate-800',
                          })}
                        >
                          <span>Preview Demo</span>
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </SectionContainer>
        </section>
      </main>

      <Footer />
    </div>
  )
}
