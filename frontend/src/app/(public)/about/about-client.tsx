'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  Target,
  Eye,
  Stethoscope,
  ShieldAlert,
  HeartPulse,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Activity,
  Layers,
} from 'lucide-react'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'
import { SectionContainer } from '@/components/layouts/section-container'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/i18n'

export function AboutClient() {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'

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
              <Activity className="size-4 text-primary animate-pulse" aria-hidden="true" />
              <span>{isBn ? 'প্ল্যাটফর্মের পরিচিতি ও দর্শন' : 'Mission & Institutional Framework'}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground font-sans leading-[1.12]"
            >
              <span>{isBn ? 'লানজেন্ট' : 'About'}</span>{' '}
              <span className="bg-gradient-to-r from-primary via-teal-600 to-sky-600 bg-clip-text text-transparent inline-block">
                {isBn ? 'সম্পর্কে' : 'Lungent'}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto"
            >
              {dict.about.subtitle}
            </motion.p>
          </div>
        </SectionContainer>

        {/* Mission and Vision Grid */}
        <SectionContainer size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.05 }}
              whileHover={{ y: -6 }}
            >
              <Card className="rounded-2xl border-primary/25 bg-primary/5 hover:border-primary/50 transition-all duration-300 shadow-xs hover:shadow-xl hover:shadow-primary/5 h-full flex flex-col justify-between">
                <CardHeader className="space-y-3.5 pb-4">
                  <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-2xs">
                    <Target className="size-6" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{dict.about.missionTitle}</CardTitle>
                </CardHeader>
                <CardContent className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {dict.about.missionBody}
                </CardContent>
              </Card>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.15 }}
              whileHover={{ y: -6 }}
            >
              <Card className="rounded-2xl border-border/80 bg-muted/40 hover:border-teal-500/50 transition-all duration-300 shadow-xs hover:shadow-xl hover:shadow-teal-500/5 h-full flex flex-col justify-between">
                <CardHeader className="space-y-3.5 pb-4">
                  <div className="size-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-2xs">
                    <Eye className="size-6" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{dict.about.visionTitle}</CardTitle>
                </CardHeader>
                <CardContent className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {dict.about.visionBody}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </SectionContainer>

        {/* Crucial Clinical Distinction Section (Fade-in Warning Box) */}
        <SectionContainer size="lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55 }}
            className="rounded-3xl border border-destructive/30 bg-destructive/5 p-7 sm:p-11 space-y-7 shadow-xs"
          >
            <div className="flex items-center gap-2.5 text-destructive font-bold text-base sm:text-lg">
              <ShieldAlert className="size-6 shrink-0" />
              <span>{dict.about.boundariesTitle}</span>
            </div>

            <p className="text-base sm:text-lg text-foreground leading-relaxed font-semibold">
              {dict.about.boundariesP1}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 space-y-3.5 shadow-2xs hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                  <CheckCircle2 className="size-4.5" />
                  <span>{isBn ? 'লানজেন্ট যা প্রদান করে' : 'Clinical Decision Support (Scope)'}</span>
                </div>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {dict.about.boundariesD1}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 space-y-3.5 shadow-2xs hover:border-destructive/50 transition-all duration-300"
              >
                <div className="flex items-center gap-2 text-destructive font-bold text-sm uppercase tracking-wider">
                  <AlertTriangle className="size-4.5" />
                  <span>{isBn ? 'লানজেন্ট যা প্রদান করে না' : 'Medical Diagnosis (Exclusion)'}</span>
                </div>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {dict.about.boundariesD2}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </SectionContainer>

        {/* Our Approach */}
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
                {dict.about.approachTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {isBn
                  ? 'আন্তর্জাতিক বৈজ্ঞানিক গবেষণা এবং বাংলাদেশের বাস্তবতার মেলবন্ধন।'
                  : 'Bridging international evidence-based oncology guidelines with localized epidemiological realities.'}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { num: '01', title: dict.about.approachItem1Title, body: dict.about.approachItem1Body, color: 'text-primary' },
                { num: '02', title: dict.about.approachItem2Title, body: dict.about.approachItem2Body, color: 'text-teal-600 dark:text-teal-400' },
                { num: '03', title: dict.about.approachItem3Title, body: dict.about.approachItem3Body, color: 'text-sky-600 dark:text-sky-400' },
              ].map((item, idx) => (
                <motion.div
                  key={item.num}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: idx * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 space-y-3.5 shadow-xs hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className={`size-11 rounded-2xl bg-muted flex items-center justify-center font-black text-base ${item.color}`}>
                    {item.num}
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </SectionContainer>

        {/* Target Stakeholder Ecosystem */}
        <SectionContainer size="lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-border/80 bg-muted/30 p-8 sm:p-12 space-y-9 shadow-xs"
          >
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
                {isBn ? 'স্বাস্থ্যসেবা ব্যবস্থার স্টেকহোল্ডার' : 'Empowering Healthcare Stakeholders'}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {isBn
                  ? 'তৃণমূল থেকে শুরু করে জাতীয় ক্যান্সার রেফারেল হাসপাতাল পর্যন্ত একটি সংযুক্ত নেটওয়ার্ক।'
                  : 'Connecting primary community triage to tertiary pulmonary oncology centers.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: HeartPulse, color: 'text-primary', title: isBn ? 'রোগী ও পরিবার' : 'Patients & Individuals', desc: isBn ? 'ব্যক্তিগত গোপনীয়তার সাথে নিজের ঝুঁকি সচেতনতা বৃদ্ধি ও লক্ষণ ট্র্যাকিং।' : 'Confidential self-assessment of individual risk factors and symptom history.' },
                { icon: Users, color: 'text-teal-600 dark:text-teal-400', title: isBn ? 'স্বাস্থ্যকর্মী' : 'Community Health Workers', desc: isBn ? 'গ্রামীণ এলাকায় মাঠপর্যায়ে স্ক্রীনিং ডেটা সংগ্রহ ও ঝুঁকিপূর্ণদের চিহ্নিতকরণ।' : 'Standardized screening questionnaires at regional clinics and health camps.' },
                { icon: Stethoscope, color: 'text-sky-600 dark:text-sky-400', title: isBn ? 'চিকিৎসক ও বিশেষজ্ঞ' : 'Clinicians & Pulmonologists', desc: isBn ? 'কাঠামোগত ট্রায়াজ, সিটি স্ক্রীনিং পরামর্শ এবং রেফারেল সিদ্ধান্ত গ্রহণ।' : 'Actionable triage summaries, smoking history metrics, and LDCT recommendations.' },
                { icon: Building2, color: 'text-indigo-600 dark:text-indigo-400', title: isBn ? 'স্বাস্থ্য প্রশাসন' : 'Health Administrators', desc: isBn ? 'হাসপাতাল ভিত্তিক অডিট লগ, তথ্যের নিরাপত্তা ও নীতিমালার বাস্তবায়ন।' : 'Institutional oversight, audit verification, and compliance monitoring.' },
              ].map((stakeholder, idx) => {
                const IconComp = stakeholder.icon
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.45, delay: idx * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="bg-card p-5 sm:p-6 rounded-2xl border border-border/80 space-y-2.5 text-xs hover:border-primary/50 hover:shadow-md transition-all duration-300"
                  >
                    <IconComp className={`size-6 ${stakeholder.color}`} />
                    <h4 className="font-bold text-foreground text-sm">{stakeholder.title}</h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                      {stakeholder.desc}
                    </p>
                  </motion.div>
                )
              })}
            </div>

            <div className="text-center pt-2">
              <Link
                href="/how-it-works"
                className={buttonVariants({
                  variant: 'default',
                  size: 'lg',
                  className: 'rounded-xl font-bold shadow-md hover:scale-105 active:scale-98 transition-all',
                })}
              >
                <span>{isBn ? 'প্ল্যাটফর্মের কার্যপ্রণালী জানুন' : 'Explore Platform Workflow'}</span>
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </div>
          </motion.div>
        </SectionContainer>
      </main>

      <Footer />
    </div>
  )
}
