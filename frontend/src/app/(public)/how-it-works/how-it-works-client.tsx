'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  ClipboardList,
  Cpu,
  AlertCircle,
  FileCheck2,
  HeartPulse,
  Building2,
  Stethoscope,
  Info,
  ArrowRight,
  Activity,
  Layers,
  Workflow,
} from 'lucide-react'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'
import { SectionContainer } from '@/components/layouts/section-container'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/i18n'

export function HowItWorksClient() {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'

  const steps = [
    {
      num: '01',
      icon: ClipboardList,
      title: dict.howItWorks.step1Title,
      desc: dict.howItWorks.step1Desc,
      details: isBn
        ? 'বয়স, ধূমপানের সময়কাল (প্যাক-বছর), রান্নার চুলার ধোঁয়ায় সংস্পর্শ, এবং স্থায়ী কাশির তীব্রতা মূল্যায়ন।'
        : 'Capturing validated age, smoking pack-years, solid biomass smoke exposure, and active respiratory complaints.',
    },
    {
      num: '02',
      icon: Cpu,
      title: dict.howItWorks.step2Title,
      desc: dict.howItWorks.step2Desc,
      details: isBn
        ? 'আন্তর্জাতিক নির্দেশিকা ও দক্ষিণ এশীয় আঞ্চলিক ঝুঁকির অ্যালগরিদম ভিত্তিক পরিসংখ্যানগত বিশ্লেষণ।'
        : 'Analyzing multivariate factors against validated models (USPSTF, PLCOm2012) adapted for regional exposures.',
    },
    {
      num: '03',
      icon: AlertCircle,
      title: dict.howItWorks.step3Title,
      desc: dict.howItWorks.step3Desc,
      details: isBn
        ? 'কাশির সাথে রক্ত, অকারণে ওজন হ্রাস এবং তিন সপ্তাহের বেশি কাশির মতো জরুরি লক্ষণ চিহ্নিতকরণ।'
        : 'Immediate highlighting of hemoptysis, chronic cough >3 weeks, dysphonia, and unexpected weight loss.',
    },
    {
      num: '04',
      icon: FileCheck2,
      title: dict.howItWorks.step4Title,
      desc: dict.howItWorks.step4Desc,
      details: isBn
        ? 'রোগীর জন্য সহজবোধ্য সারসংক্ষেপ এবং চিকিৎসকের জন্য স্ট্যান্ডার্ড রেফারেল নোট তৈরি।'
        : 'Actionable clinical summaries formatted for primary healthcare centers and pulmonary specialists.',
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

      <main className="flex-1 space-y-16 sm:space-y-24 py-12 sm:py-20">
        {/* Page Hero with Staggered Entrance */}
        <SectionContainer size="lg">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4.5 py-1.5 text-sm sm:text-[15px] font-semibold text-primary border border-primary/20 shadow-xs hover:border-primary/40 transition-colors"
            >
              <Workflow className="size-4 text-primary animate-pulse" aria-hidden="true" />
              <span>{isBn ? 'ওয়ার্কফ্লো ও প্ল্যাটফর্ম স্থাপত্য' : 'Platform Workflow Architecture'}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground font-sans leading-[1.12]"
            >
              <span>{isBn ? 'লানজেন্ট যেভাবে' : 'How Lungent'}</span>{' '}
              <span className="bg-gradient-to-r from-primary via-teal-600 to-sky-600 bg-clip-text text-transparent inline-block">
                {isBn ? 'কাজ করে' : 'Works'}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto"
            >
              {dict.howItWorks.subtitle}
            </motion.p>
          </div>
        </SectionContainer>

        {/* 4-Step Process Section */}
        <SectionContainer size="lg">
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45 }}
              className="text-center space-y-3 max-w-2xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
                {dict.howItWorks.workflowTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {isBn
                  ? 'একটি কাঠামোগত ৪-ধাপের প্রক্রিয়া যা বিজ্ঞান ও প্রযুক্তিকে রোগীর উপকারে কাজে লাগায়।'
                  : 'A 4-stage evidence-based pathway translating clinical variables into structured decision guidance.'}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, idx) => {
                const IconComponent = step.icon
                return (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.45, delay: idx * 0.1 }}
                    whileHover={{ y: -6 }}
                    className="relative rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-black text-primary/30 group-hover:text-primary/60 font-mono transition-colors">
                          {step.num}
                        </span>
                        <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xs">
                          <IconComponent className="size-5" />
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>

                      <p className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    <div className="pt-3.5 border-t border-border/60 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {step.details}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </SectionContainer>

        {/* Stakeholder Workflows */}
        <SectionContainer size="lg">
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45 }}
              className="text-center space-y-3 max-w-2xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
                {dict.howItWorks.stakeholderTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {isBn
                  ? 'প্রতিটি ভূমিকার জন্য আলাদা কিন্তু সমন্বিত ইন্টারফেস।'
                  : 'Tailored workflows designed for specific clinical competencies and end-user contexts.'}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Patient */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: 0.05 }}
                whileHover={{ y: -6 }}
              >
                <Card className="rounded-2xl border-border/80 hover:border-primary/50 transition-all duration-300 shadow-xs hover:shadow-xl hover:shadow-primary/5 h-full flex flex-col justify-between">
                  <CardHeader className="space-y-3 pb-3">
                    <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-2xs">
                      <HeartPulse className="size-6" />
                    </div>
                    <CardTitle className="text-xl font-bold">{dict.howItWorks.patientRoleTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
                    <p>{dict.howItWorks.patientRoleDesc}</p>
                    <ul className="space-y-1.5 text-xs list-disc list-inside text-foreground/80 font-medium">
                      <li>{isBn ? 'কোনো পূর্ব অভিজ্ঞতার প্রয়োজন নেই' : 'No clinical medical knowledge required'}</li>
                      <li>{isBn ? 'বাংলা ও ইংরেজি ভাষায় সম্পূর্ণ তথ্য' : 'Available in Bangla & English'}</li>
                      <li>{isBn ? 'ডাক্তারের সাথে আলোচনার জন্য চেকলিস্ট' : 'Actionable discussion points for doctor visits'}</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* CHW */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: 0.15 }}
                whileHover={{ y: -6 }}
              >
                <Card className="rounded-2xl border-border/80 hover:border-emerald-500/50 transition-all duration-300 shadow-xs hover:shadow-xl hover:shadow-emerald-500/5 h-full flex flex-col justify-between">
                  <CardHeader className="space-y-3 pb-3">
                    <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
                      <Building2 className="size-6" />
                    </div>
                    <CardTitle className="text-xl font-bold">{dict.howItWorks.chwRoleTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
                    <p>{dict.howItWorks.chwRoleDesc}</p>
                    <ul className="space-y-1.5 text-xs list-disc list-inside text-foreground/80 font-medium">
                      <li>{isBn ? 'মাঠপর্যায়ে দ্রুত স্ক্রীনিং ফরম্যাট' : 'Rapid field screening intake formats'}</li>
                      <li>{isBn ? 'কম নেটওয়ার্কেও সহজে ব্যবহারযোগ্য' : 'Optimized for low-bandwidth mobile devices'}</li>
                      <li>{isBn ? 'ঝুঁকিপূর্ণদের দ্রুত উপজেলা স্বাস্থ্যকেন্দ্রে রেফার' : 'Expedites village-to-clinic referrals'}</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Clinician */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: 0.25 }}
                whileHover={{ y: -6 }}
              >
                <Card className="rounded-2xl border-border/80 hover:border-sky-500/50 transition-all duration-300 shadow-xs hover:shadow-xl hover:shadow-sky-500/5 h-full flex flex-col justify-between">
                  <CardHeader className="space-y-3 pb-3">
                    <div className="size-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-2xs">
                      <Stethoscope className="size-6" />
                    </div>
                    <CardTitle className="text-xl font-bold">{dict.howItWorks.clinicianRoleTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
                    <p>{dict.howItWorks.clinicianRoleDesc}</p>
                    <ul className="space-y-1.5 text-xs list-disc list-inside text-foreground/80 font-medium">
                      <li>{isBn ? 'আন্তর্জাতিক এলডিসিটি নির্দেশিকা সমন্বয়' : 'USPSTF/NCCN LDCT criteria matching'}</li>
                      <li>{isBn ? 'রেড-ফ্ল্যাগ উপসর্গের অ্যালগরিদমিক সারসংক্ষেপ' : 'Algorithmic red-flag symptom timelines'}</li>
                      <li>{isBn ? 'রেফারেল ও ফলোআপ ব্যবস্থাপনার সুবিধা' : 'Standardized specialist referral notes'}</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </SectionContainer>

        {/* Development Transparency & Phased Roadmap Notice */}
        <SectionContainer size="lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-primary/20 bg-muted/40 p-7 md:p-9 flex flex-col md:flex-row items-start gap-5 shadow-xs"
          >
            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Info className="size-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-foreground">
                {dict.howItWorks.transparencyNoticeTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {dict.howItWorks.transparencyNoticeBody}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="border-teal-500/40 text-teal-700 dark:text-teal-300 bg-teal-50/60 dark:bg-teal-950/40 font-semibold">Phase 1.1 Foundation Active</Badge>
                <Badge variant="outline" className="border-teal-500/40 text-teal-700 dark:text-teal-300 bg-teal-50/60 dark:bg-teal-950/40 font-semibold">Phase 1.2 Design System Active</Badge>
                <Badge variant="outline" className="border-teal-500/40 text-teal-700 dark:text-teal-300 bg-teal-50/60 dark:bg-teal-950/40 font-semibold">Phase 1.3 Auth & RBAC Active</Badge>
                <Badge variant="outline" className="border-teal-500/40 text-teal-700 dark:text-teal-300 bg-teal-50/60 dark:bg-teal-950/40 font-semibold">Phase 1.4 Public Portal Active</Badge>
                <Badge variant="outline" className="border-teal-500/40 text-teal-700 dark:text-teal-300 bg-teal-50/60 dark:bg-teal-950/40 font-semibold">Phase 1.5 AI Clinical Models Active</Badge>
              </div>
            </div>
          </motion.div>
        </SectionContainer>

        {/* Final CTA */}
        <SectionContainer size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/15 via-primary/5 to-background p-8 sm:p-12 text-center space-y-6 shadow-xs max-w-3xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              {isBn ? 'ফুসফুস স্বাস্থ্য তথ্যভাণ্ডার ঘুরে দেখুন' : 'Explore the Lung Health Library'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
              {isBn
                ? 'ঝুঁকির কারণ, স্ক্রীনিং প্রটোকল এবং প্রতিরোধ ব্যবস্থা সম্পর্কে বিস্তারিত তথ্য জানুন।'
                : 'Browse evidence-based guides on tobacco smoking, biomass exposure, symptoms, and LDCT screening.'}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/library"
                className={buttonVariants({
                  variant: 'default',
                  size: 'lg',
                  className: 'rounded-xl font-bold shadow-md hover:scale-105 active:scale-98 transition-all',
                })}
              >
                <span>{isBn ? 'স্বাস্থ্য তথ্যভাণ্ডার পড়ুন' : 'Browse Information Library'}</span>
                <ArrowRight className="size-4 ml-2" />
              </Link>
              <Link
                href="/ai-assessment"
                className={buttonVariants({
                  variant: 'outline',
                  size: 'lg',
                  className: 'rounded-xl font-semibold hover:scale-105 active:scale-98 transition-all',
                })}
              >
                <span>{isBn ? 'এআই ঝুঁকি মূল্যায়ন' : 'AI Risk Assessment'}</span>
              </Link>
            </div>
          </motion.div>
        </SectionContainer>
      </main>

      <Footer />
    </div>
  )
}
