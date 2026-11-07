'use client'

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Logo } from "@/components/shared/logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AuthLayoutProps {
  title: string
  subtitle?: string
  badge?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function AuthLayout({
  title,
  subtitle,
  badge,
  children,
  footer,
  className,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background selection:bg-primary/20 overflow-hidden">
      {/* Ambient Respiration & Floating Glow (Pulmonary AI Aesthetic) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[680px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-8 left-1/4 w-96 h-96 rounded-full bg-teal-400/15 dark:bg-teal-500/10 blur-3xl animate-lung-breathe" />
        <div
          className="absolute top-24 right-1/4 w-80 h-80 rounded-full bg-sky-400/15 dark:bg-sky-500/10 blur-3xl animate-lung-breathe"
          style={{ animationDelay: '3.5s' }}
        />
      </div>

      {/* Top Navbar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Logo size="md" variant="full" href="/" />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-muted/40"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Home</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Centered Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className={cn(
            "w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-8 sm:p-10 shadow-xl backdrop-blur-md space-y-6 transition-all",
            className
          )}
        >
          {badge && (
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <ShieldCheck className="size-3.5" />
                <span>{badge}</span>
              </span>
            </div>
          )}

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-foreground font-sans">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
                {subtitle}
              </p>
            )}
          </div>

          <div>{children}</div>

          {footer && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-600 dark:text-slate-400">
              {footer}
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="text-center text-xs text-slate-500 dark:text-slate-400 py-4 px-4 z-10">
        <p>© 2026 Lungent. Evidence-Based Pulmonary Decision Support.</p>
      </footer>
    </div>
  )
}
