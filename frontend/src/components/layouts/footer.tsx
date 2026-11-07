'use client'

import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/shared/logo'
import { useLanguage } from '@/i18n'
import { ShieldAlert, AlertTriangle } from 'lucide-react'

export function Footer() {
  const { dict } = useLanguage()

  return (
    <footer className="border-t border-border/80 bg-muted/30 py-12 text-sm text-muted-foreground transition-colors">
      <div className="container mx-auto px-4 sm:px-6 space-y-10">
        {/* Prominent Emergency and Clinical Disclaimer Banner */}
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 text-sm text-foreground">
          <div className="size-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-1.5 leading-relaxed">
            <p className="font-bold text-destructive text-sm sm:text-base">
              {dict.common.clinicalNoticeTitle}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {dict.common.clinicalNoticeBody}
            </p>
            <p className="font-semibold text-destructive/90 text-xs sm:text-sm pt-0.5">
              {dict.common.emergencyNotice}
            </p>
          </div>
        </div>

        {/* Multi-Column Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 sm:col-span-2 md:col-span-1">
            <Logo size="md" variant="compact" href="/" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {dict.common.tagline}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed pt-1">
              Engineered for healthcare systems in Bangladesh and international expansion.
            </p>
          </div>

          {/* Public Portal Navigation */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Explore Platform
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  {dict.nav.home}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  {dict.nav.about}
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-primary transition-colors">
                  {dict.nav.howItWorks}
                </Link>
              </li>
              <li>
                <Link href="/library" className="hover:text-primary transition-colors">
                  {dict.nav.library}
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-primary transition-colors">
                  {dict.nav.faqs}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  {dict.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Dedicated Workspaces */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Workspaces & Portals
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/patient" className="hover:text-primary transition-colors">
                  {dict.nav.patientPortal}
                </Link>
              </li>
              <li>
                <Link href="/healthcare-worker" className="hover:text-primary transition-colors">
                  {dict.nav.communityHealth}
                </Link>
              </li>
              <li>
                <Link href="/clinical" className="hover:text-primary transition-colors">
                  {dict.nav.clinicalPortal}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  {dict.nav.adminPortal}
                </Link>
              </li>
              <li>
                <Link href="/design-system" className="hover:text-primary transition-colors">
                  Design System Showcase
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Legal & Transparency
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy (Draft)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Use (Draft)
                </Link>
              </li>
              <li>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <ShieldAlert className="size-4 text-primary" />
                  <span>Non-Diagnostic Platform</span>
                </div>
              </li>
              <li>
                <span className="text-xs text-muted-foreground/80">
                  Subject to Clinical Advisory Review
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
          <p>© 2026 Lungent. {dict.common.tagline}</p>
          <p className="text-xs text-muted-foreground/80">
            Next.js App Router • TypeScript • Tailwind CSS v4 • Supabase
          </p>
        </div>
      </div>
    </footer>
  )
}
