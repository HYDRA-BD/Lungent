'use client'

import React from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, ShieldAlert } from 'lucide-react'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'
import { SectionContainer } from '@/components/layouts/section-container'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/i18n'

export function TermsClient() {
  const { dict } = useLanguage()

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
              <Badge variant="warning">{dict.terms.noticeBadge}</Badge>
              <span className="text-xs text-muted-foreground">{dict.terms.effectiveDate}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
              {dict.terms.title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {dict.terms.subtitle}
            </p>
          </div>

          {/* Legal Review Callout */}
          <div className="mt-8 rounded-2xl border border-warning/30 bg-warning/5 p-4 sm:p-5 flex items-start gap-3.5 text-xs">
            <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed text-muted-foreground">
              <p className="font-semibold text-foreground">
                Legal & Regulatory Advisory Notice
              </p>
              <p>
                These Terms of Use represent an administrative draft for pilot evaluation. Prior to general production, terms will be finalized with certified healthcare legal practitioners.
              </p>
            </div>
          </div>

          {/* Core Non-Diagnostic Callout */}
          <div className="mt-6 rounded-2xl border border-destructive/25 bg-destructive/5 p-4 sm:p-5 flex items-start gap-3.5 text-xs">
            <ShieldAlert className="size-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed text-muted-foreground">
              <p className="font-semibold text-destructive">
                Critical Medical Non-Diagnosis Warning
              </p>
              <p>
                {dict.terms.disclaimerBody}
              </p>
            </div>
          </div>

          {/* Terms Articles */}
          <div className="mt-10 space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {dict.terms.acceptanceTitle}
              </h2>
              <p>{dict.terms.acceptanceBody}</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {dict.terms.disclaimerTitle}
              </h2>
              <p>{dict.terms.disclaimerBody}</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {dict.terms.permittedUseTitle}
              </h2>
              <p>{dict.terms.permittedUseBody}</p>
              <ul className="list-disc list-inside space-y-1 text-xs pt-1">
                <li>Prohibited from attempting to circumvent access control or security guards.</li>
                <li>Misrepresenting clinical credentials or impersonating medical personnel is strictly prohibited.</li>
                <li>Automated scraping or unauthorized mass data extraction is forbidden.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {dict.terms.liabilityTitle}
              </h2>
              <p>{dict.terms.liabilityBody}</p>
            </section>

            <section className="space-y-2 border-t border-border/80 pt-6">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Inquiries & Feedback
              </h2>
              <p>
                For questions regarding these terms, reach our governance department at:
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
