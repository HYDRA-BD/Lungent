'use client'

import React from 'react'
import Link from 'next/link'
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
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 space-y-14 sm:space-y-20 py-10 sm:py-16">
        {/* Page Hero */}
        <SectionContainer size="lg">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="default" className="text-xs">
              {isBn ? 'প্ল্যাটফর্মের পরিচিতি ও দর্শন' : 'Mission & Institutional Framework'}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
              {dict.about.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {dict.about.subtitle}
            </p>
          </div>
        </SectionContainer>

        {/* Mission and Vision Grid */}
        <SectionContainer size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="space-y-3">
                <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Target className="size-6" />
                </div>
                <CardTitle className="text-xl">{dict.about.missionTitle}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {dict.about.missionBody}
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="border-secondary/30 bg-muted/30">
              <CardHeader className="space-y-3">
                <div className="size-11 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center">
                  <Eye className="size-6" />
                </div>
                <CardTitle className="text-xl">{dict.about.visionTitle}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {dict.about.visionBody}
              </CardContent>
            </Card>
          </div>
        </SectionContainer>

        {/* Crucial Clinical Distinction Section */}
        <SectionContainer size="lg">
          <div className="rounded-3xl border border-destructive/25 bg-destructive/5 p-6 sm:p-10 space-y-6">
            <div className="flex items-center gap-2.5 text-destructive font-semibold text-sm">
              <ShieldAlert className="size-5" />
              <span>{dict.about.boundariesTitle}</span>
            </div>

            <p className="text-sm sm:text-base text-foreground leading-relaxed font-medium">
              {dict.about.boundariesP1}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                  <CheckCircle2 className="size-4" />
                  <span>{isBn ? 'লানজেন্ট যা প্রদান করে' : 'Clinical Decision Support (Scope)'}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {dict.about.boundariesD1}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-destructive font-bold text-sm uppercase tracking-wider">
                  <AlertTriangle className="size-4" />
                  <span>{isBn ? 'লানজেন্ট যা প্রদান করে না' : 'Medical Diagnosis (Exclusion)'}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {dict.about.boundariesD2}
                </p>
              </div>
            </div>
          </div>
        </SectionContainer>

        {/* Our Approach */}
        <SectionContainer size="lg">
          <div className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {dict.about.approachTitle}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isBn
                  ? 'আন্তর্জাতিক বৈজ্ঞানিক গবেষণা এবং বাংলাদেশের বাস্তবতার মেলবন্ধন।'
                  : 'Bridging international evidence-based oncology guidelines with localized epidemiological realities.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-xs">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  01
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {dict.about.approachItem1Title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {dict.about.approachItem1Body}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-xs">
                <div className="size-10 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                  02
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {dict.about.approachItem2Title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {dict.about.approachItem2Body}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-xs">
                <div className="size-10 rounded-xl bg-info/10 text-info flex items-center justify-center font-bold text-sm">
                  03
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {dict.about.approachItem3Title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {dict.about.approachItem3Body}
                </p>
              </div>
            </div>
          </div>
        </SectionContainer>

        {/* Target Stakeholder Ecosystem */}
        <SectionContainer size="lg">
          <div className="rounded-3xl border border-border bg-muted/20 p-8 sm:p-12 space-y-8">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {isBn ? 'স্বাস্থ্যসেবা ব্যবস্থার স্টেকহোল্ডার' : 'Empowering Healthcare Stakeholders'}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isBn
                  ? 'তৃণমূল থেকে শুরু করে জাতীয় ক্যান্সার রেফারেল হাসপাতাল পর্যন্ত একটি সংযুক্ত নেটওয়ার্ক।'
                  : 'Connecting primary community triage to tertiary pulmonary oncology centers.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-card p-5 rounded-2xl border border-border space-y-2 text-xs">
                <HeartPulse className="size-5 text-primary" />
                <h4 className="font-semibold text-foreground text-sm">{isBn ? 'রোগী ও পরিবার' : 'Patients & Individuals'}</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {isBn ? 'ব্যক্তিগত গোপনীয়তার সাথে নিজের ঝুঁকি সচেতনতা বৃদ্ধি ও লক্ষণ ট্র্যাকিং।' : 'Confidential self-assessment of individual risk factors and symptom history.'}
                </p>
              </div>

              <div className="bg-card p-5 rounded-2xl border border-border space-y-2 text-xs">
                <Users className="size-5 text-secondary-foreground" />
                <h4 className="font-semibold text-foreground text-sm">{isBn ? 'স্বাস্থ্যকর্মী' : 'Community Health Workers'}</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {isBn ? 'গ্রামীণ এলাকায় মাঠপর্যায়ে স্ক্রীনিং ডেটা সংগ্রহ ও ঝুঁকিপূর্ণদের চিহ্নিতকরণ।' : 'Standardized screening questionnaires at regional clinics and health camps.'}
                </p>
              </div>

              <div className="bg-card p-5 rounded-2xl border border-border space-y-2 text-xs">
                <Stethoscope className="size-5 text-info" />
                <h4 className="font-semibold text-foreground text-sm">{isBn ? 'চিকিৎসক ও বিশেষজ্ঞ' : 'Clinicians & Pulmonologists'}</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {isBn ? 'কাঠামোগত ট্রায়াজ, সিটি স্ক্রীনিং পরামর্শ এবং রেফারেল সিদ্ধান্ত গ্রহণ।' : 'Actionable triage summaries, smoking history metrics, and LDCT recommendations.'}
                </p>
              </div>

              <div className="bg-card p-5 rounded-2xl border border-border space-y-2 text-xs">
                <Building2 className="size-5 text-foreground" />
                <h4 className="font-semibold text-foreground text-sm">{isBn ? 'স্বাস্থ্য প্রশাসন' : 'Health Administrators'}</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {isBn ? 'হাসপাতাল ভিত্তিক অডিট লগ, তথ্যের নিরাপত্তা ও নীতিমালার বাস্তবায়ন।' : 'Institutional oversight, audit verification, and compliance monitoring.'}
                </p>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/how-it-works"
                className={buttonVariants({ variant: 'default', size: 'lg' })}
              >
                <span>{isBn ? 'প্ল্যাটফর্মের কার্যপ্রণালী জানুন' : 'Explore Platform Workflow'}</span>
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
