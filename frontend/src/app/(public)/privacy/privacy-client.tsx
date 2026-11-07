'use client'

import React from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'
import { SectionContainer } from '@/components/layouts/section-container'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/i18n'

export function PrivacyClient() {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 space-y-12 py-10 sm:py-16">
        <SectionContainer size="md">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-6"
          >
            <ArrowLeft className="size-3.5" />
            <span>{dict.common.backToHome}</span>
          </Link>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="warning">{dict.privacy.noticeBadge}</Badge>
              <span className="text-xs text-muted-foreground">{dict.privacy.effectiveDate}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
              {dict.privacy.title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {dict.privacy.subtitle}
            </p>
          </div>

          {/* Legal Review Callout */}
          <div className="mt-8 rounded-2xl border border-warning/30 bg-warning/5 p-4 sm:p-5 flex items-start gap-3.5 text-xs">
            <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed text-muted-foreground">
              <p className="font-semibold text-foreground">
                {isBn ? 'আইনগত পর্যালোচনা সাপেক্ষ খসড়া বিজ্ঞপ্তি' : 'Legal & Regulatory Advisory Notice'}
              </p>
              <p>
                {isBn
                  ? 'এই নথিটি প্রাথমিক পাইলট পর্বের একটি কাঠামোগত খসড়া। পূর্ণাঙ্গ বাণিজ্যিক বা বৃহৎ পরিসরের ক্লিনিক্যাল স্থাপনার পূর্বে এটি সংশ্লিষ্ট স্বাস্থ্য মন্ত্রণালয় এবং তথ্য সুরক্ষা আইনজীবীদের দ্বারা আনুষ্ঠানিকভাবে যাচাই ও সংশোধিত হবে।'
                  : 'This document represents an initial administrative governance draft prepared for pilot testing. Prior to commercial deployment or wide clinical operations, it will undergo formal review by medical ethics boards and healthcare legal counsel.'}
              </p>
            </div>
          </div>

          {/* Policy Articles */}
          <div className="mt-10 space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {dict.privacy.introTitle}
              </h2>
              <p>{dict.privacy.introBody}</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {dict.privacy.collectionTitle}
              </h2>
              <p>{dict.privacy.collectionBody}</p>
              <ul className="list-disc list-inside space-y-1 text-xs pt-1">
                <li>{isBn ? 'পাবলিক পোর্টালে ভিজিটরদের কোনো কুকিজ দ্বারা ট্র্যাক বা ব্যক্তিগত তথ্য সংগ্রহ করা হয় না।' : 'No patient identifiable records are stored from public browsing.'}</li>
                <li>{isBn ? 'নিবন্ধিত রোগীদের শুধুমাত্র নির্বাচিত তথ্য (নাম, ইমেইল, পছন্দের ভাষা) ডাটাবেজে থাকে।' : 'Registered profiles store user-provided name, contact details, and locale preference.'}</li>
                <li>{isBn ? 'নিরাপত্তা নিশ্চিত করতে অপরিবর্তনীয় অডিট লগ সংরক্ষণ করা হয়।' : 'Tamper-evident audit logs record security and authentication events.'}</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {dict.privacy.securityTitle}
              </h2>
              <p>{dict.privacy.securityBody}</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {dict.privacy.rightsTitle}
              </h2>
              <p>{dict.privacy.rightsBody}</p>
            </section>

            <section className="space-y-2 border-t border-border/80 pt-6">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {isBn ? 'যোগাযোগ ও তথ্য সুরক্ষা কর্মকর্তা' : 'Data Governance Contact'}
              </h2>
              <p>
                {isBn
                  ? 'তথ্যের গোপনীয়তা বা অধিকার সংক্রান্ত যেকোনো প্রশ্নের জন্য আমাদের প্রাতিষ্ঠানিক টিমে যোগাযোগ করুন:'
                  : 'For privacy inquiries, audit records, or data protection questions, contact:'}
              </p>
              <p className="font-semibold text-primary">
                governance@lungent.org
              </p>
            </section>
          </div>
        </SectionContainer>
      </main>

      <Footer />
    </div>
  )
}
