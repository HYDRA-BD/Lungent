'use client'

import React from 'react'
import Link from 'next/link'
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
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 space-y-16 sm:space-y-24 py-10 sm:py-16">
        {/* Page Hero */}
        <SectionContainer size="lg">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="default" className="text-xs">
              {isBn ? 'ওয়ার্কফ্লো ও প্ল্যাটফর্ম স্থাপত্য' : 'Platform Workflow Architecture'}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
              {dict.howItWorks.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {dict.howItWorks.subtitle}
            </p>
          </div>
        </SectionContainer>

        {/* 4-Step Process Section */}
        <SectionContainer size="lg">
          <div className="space-y-10">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {dict.howItWorks.workflowTitle}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isBn
                  ? 'একটি কাঠামোগত ৪-ধাপের প্রক্রিয়া যা বিজ্ঞান ও প্রযুক্তিকে রোগীর উপকারে কাজে লাগায়।'
                  : 'A 4-stage evidence-based pathway translating clinical variables into structured decision guidance.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step) => {
                const IconComponent = step.icon
                return (
                  <div
                    key={step.num}
                    className="relative rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-extrabold text-primary/30 font-mono">
                          {step.num}
                        </span>
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <IconComponent className="size-5" />
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-foreground tracking-tight">
                        {step.title}
                      </h3>

                      <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/60 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {step.details}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </SectionContainer>

        {/* Stakeholder Workflows */}
        <SectionContainer size="lg">
          <div className="space-y-10">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {dict.howItWorks.stakeholderTitle}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isBn
                  ? 'প্রতিটি ভূমিকার জন্য আলাদা কিন্তু সমন্বিত ইন্টারফেস।'
                  : 'Tailored workflows designed for specific clinical competencies and end-user contexts.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Patient */}
              <Card>
                <CardHeader className="space-y-3 pb-3">
                  <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <HeartPulse className="size-6" />
                  </div>
                  <CardTitle className="text-lg">{dict.howItWorks.patientRoleTitle}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-3">
                  <p>{dict.howItWorks.patientRoleDesc}</p>
                  <ul className="space-y-1.5 text-[11px] list-disc list-inside text-foreground/80">
                    <li>{isBn ? 'কোনো পূর্ব অভিজ্ঞতার প্রয়োজন নেই' : 'No clinical medical knowledge required'}</li>
                    <li>{isBn ? 'বাংলা ও ইংরেজি ভাষায় সম্পূর্ণ তথ্য' : 'Available in Bangla & English'}</li>
                    <li>{isBn ? 'ডাক্তারের সাথে আলোচনার জন্য চেকলিস্ট' : 'Actionable discussion points for doctor visits'}</li>
                  </ul>
                </CardContent>
              </Card>

              {/* CHW */}
              <Card>
                <CardHeader className="space-y-3 pb-3">
                  <div className="size-11 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center">
                    <Building2 className="size-6" />
                  </div>
                  <CardTitle className="text-lg">{dict.howItWorks.chwRoleTitle}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-3">
                  <p>{dict.howItWorks.chwRoleDesc}</p>
                  <ul className="space-y-1.5 text-[11px] list-disc list-inside text-foreground/80">
                    <li>{isBn ? 'মাঠপর্যায়ে দ্রুত স্ক্রীনিং ফরম্যাট' : 'Rapid field screening intake formats'}</li>
                    <li>{isBn ? 'কম নেটওয়ার্কেও সহজে ব্যবহারযোগ্য' : 'Optimized for low-bandwidth mobile devices'}</li>
                    <li>{isBn ? 'ঝুঁকিপূর্ণদের দ্রুত উপজেলা স্বাস্থ্যকেন্দ্রে রেফার' : 'Expedites village-to-clinic referrals'}</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Clinician */}
              <Card>
                <CardHeader className="space-y-3 pb-3">
                  <div className="size-11 rounded-xl bg-info/10 text-info flex items-center justify-center">
                    <Stethoscope className="size-6" />
                  </div>
                  <CardTitle className="text-lg">{dict.howItWorks.clinicianRoleTitle}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-3">
                  <p>{dict.howItWorks.clinicianRoleDesc}</p>
                  <ul className="space-y-1.5 text-[11px] list-disc list-inside text-foreground/80">
                    <li>{isBn ? 'আন্তর্জাতিক এলডিসিটি নির্দেশিকা সমন্বয়' : 'USPSTF/NCCN LDCT criteria matching'}</li>
                    <li>{isBn ? 'রেড-ফ্ল্যাগ উপসর্গের অ্যালগরিদমিক সারসংক্ষেপ' : 'Algorithmic red-flag symptom timelines'}</li>
                    <li>{isBn ? 'রেফারেল ও ফলোআপ ব্যবস্থাপনার সুবিধা' : 'Standardized specialist referral notes'}</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </SectionContainer>

        {/* Development Transparency & Phased Roadmap Notice */}
        <SectionContainer size="lg">
          <div className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8 flex flex-col md:flex-row items-start gap-4">
            <div className="size-10 rounded-xl bg-muted text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Info className="size-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-foreground">
                {dict.howItWorks.transparencyNoticeTitle}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {dict.howItWorks.transparencyNoticeBody}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <Badge variant="success">Phase 1.1 Foundation Active</Badge>
                <Badge variant="success">Phase 1.2 Design System Active</Badge>
                <Badge variant="success">Phase 1.3 Auth & RBAC Active</Badge>
                <Badge variant="success">Phase 1.4 Public Portal Active</Badge>
                <Badge variant="success">Phase 1.5 AI Clinical Models Active</Badge>
              </div>
            </div>
          </div>
        </SectionContainer>

        {/* Final CTA */}
        <SectionContainer size="lg">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground">
              {isBn ? 'ফুসফুস স্বাস্থ্য তথ্যভাণ্ডার ঘুরে দেখুন' : 'Explore the Lung Health Library'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isBn
                ? 'ঝুঁকির কারণ, স্ক্রীনিং প্রটোকল এবং প্রতিরোধ ব্যবস্থা সম্পর্কে বিস্তারিত তথ্য জানুন।'
                : 'Browse evidence-based guides on tobacco smoking, biomass exposure, symptoms, and LDCT screening.'}
            </p>
            <div className="pt-2">
              <Link
                href="/library"
                className={buttonVariants({ variant: 'default', size: 'lg' })}
              >
                <span>{isBn ? 'স্বাস্থ্য তথ্যভাণ্ডার পড়ুন' : 'Browse Information Library'}</span>
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </div>
          </div>
        </SectionContainer>
      </main>

      <Footer />
    </div>
  )
}
