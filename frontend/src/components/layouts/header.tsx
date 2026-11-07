'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/shared/logo'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { buttonVariants } from '@/components/ui/button'
import { useLanguage } from '@/i18n'
import {
  Menu,
  X,
  ArrowRight,
  LogIn,
  ChevronDown,
  HeartPulse,
  Building2,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()
  const { dict, t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false)
  const portalsRef = useRef<HTMLDivElement>(null)
  const [prevPathname, setPrevPathname] = useState(pathname)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (portalsRef.current && !portalsRef.current.contains(e.target as Node)) {
        setPortalsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile drawer on route change during render
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setMobileMenuOpen(false)
    setPortalsDropdownOpen(false)
  }

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        setPortalsDropdownOpen(false)
      }
    }
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const portalLinks = [
    {
      href: '/portal/patient',
      label: 'Patient Portal',
      desc: 'Personal risk & health record',
      icon: <HeartPulse className="size-4" />,
      iconBg: 'bg-primary/10 text-primary',
      badge: 'Demo',
    },
    {
      href: '/portal/community',
      label: 'Health Worker Portal',
      desc: 'Field screening intake demo',
      icon: <Building2 className="size-4" />,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      badge: 'Demo',
    },
    {
      href: '/portal/clinician',
      label: 'Clinician Portal',
      desc: 'Interpretable ML & 3-tier policy',
      icon: <Stethoscope className="size-4" />,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      badge: 'Demo',
    },
    {
      href: '/portal/admin',
      label: 'Admin Portal',
      desc: 'Multi-facility oversight & audit',
      icon: <ShieldCheck className="size-4" />,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      badge: 'Demo',
    },
  ]

  const isPortalsActive =
    pathname.startsWith('/portal') ||
    pathname.startsWith('/patient') ||
    pathname.startsWith('/clinical') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/healthcare-worker')

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/ai-assessment', label: 'AI Risk Assessment' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/about', label: 'About' },
    { href: '/docs', label: 'Docs' },
    { href: '/library', label: 'Health Library' },
    { href: '/faqs', label: 'FAQs' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-all shadow-xs">
      <div className="container mx-auto flex h-18 sm:h-20 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Logo size="md" variant="compact" href="/" />

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1.5 xl:gap-2.5">
          {/* Home */}
          <Link
            href="/"
            className={cn(
              'relative px-3.5 py-2 rounded-xl transition-all duration-200 text-[15px] xl:text-base font-medium',
              pathname === '/'
                ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/25'
                : 'text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:scale-[1.02]'
            )}
            aria-current={pathname === '/' ? 'page' : undefined}
          >
            Home
          </Link>

          {/* AI Risk Assessment */}
          <Link
            href="/ai-assessment"
            className={cn(
              'relative px-3.5 py-2 rounded-xl transition-all duration-200 text-[15px] xl:text-base font-medium',
              pathname.startsWith('/ai-assessment')
                ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/25'
                : 'text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:scale-[1.02]'
            )}
            aria-current={pathname.startsWith('/ai-assessment') ? 'page' : undefined}
          >
            AI Risk Assessment
          </Link>

          {/* Portals Dropdown */}
          <div
            ref={portalsRef}
            className="relative"
            onMouseEnter={() => setPortalsDropdownOpen(true)}
            onMouseLeave={() => setPortalsDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setPortalsDropdownOpen(!portalsDropdownOpen)}
              className={cn(
                'relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all duration-200 text-[15px] xl:text-base font-medium cursor-pointer',
                isPortalsActive
                  ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/25'
                  : 'text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:scale-[1.02]'
              )}
              aria-expanded={portalsDropdownOpen}
              aria-haspopup="true"
            >
              <span>Portals</span>
              <ChevronDown
                className={cn('size-4 transition-transform duration-200', portalsDropdownOpen && 'rotate-180')}
              />
            </button>

            {portalsDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-80 rounded-2xl border border-gray-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 mb-1">
                  Select Workspace or Demo
                </div>
                {portalLinks.map((portal) => (
                  <Link
                    key={portal.href}
                    href={portal.href}
                    onClick={() => setPortalsDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/15 transition-all group"
                  >
                    <div className={cn('size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-2xs', portal.iconBg)}>
                      {portal.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {portal.label}
                        </span>
                        <span
                          className={cn(
                            'text-[10px] font-semibold px-2 py-0.2 rounded-full border',
                            portal.badge === 'Live'
                              ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                              : 'border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40'
                          )}
                        >
                          {portal.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{portal.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Remaining Links */}
          {navLinks.slice(2).map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-3.5 py-2 rounded-xl transition-all duration-200 text-[15px] xl:text-base font-medium',
                  active
                    ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/25'
                    : 'text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:scale-[1.02]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop CTAs & Theme Toggle */}
        <div className="hidden lg:flex items-center gap-2.5 xl:gap-3.5">
          <ThemeToggle />

          <Link
            href="/login"
            className={buttonVariants({ variant: 'ghost', size: 'default', className: 'text-[15px] font-semibold text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary' })}
          >
            <LogIn className="size-4 mr-1.5" />
            <span>Sign In</span>
          </Link>

          <Link
            href="/register"
            className={buttonVariants({ variant: 'default', size: 'default', className: 'text-[15px] font-bold shadow-sm hover:scale-105 active:scale-98 transition-all duration-200 hover:shadow-md hover:shadow-primary/25' })}
          >
            <span>Get Started</span>
            <ArrowRight className="size-4 ml-1.5" />
          </Link>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={t('nav.toggleMenu')}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring cursor-pointer transition-transform active:scale-95"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          className="fixed inset-x-0 top-18 sm:top-20 bottom-0 z-50 bg-background/98 backdrop-blur-md border-b border-border p-6 overflow-y-auto lg:hidden animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col justify-between"
        >
          <nav aria-label="Mobile Navigation" className="space-y-4">
            {/* Standard Nav Links */}
            <div className="space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-colors',
                  pathname === '/' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-muted'
                )}
              >
                <span>Home</span>
              </Link>
              <Link
                href="/ai-assessment"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-colors',
                  pathname.startsWith('/ai-assessment')
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <span>AI Risk Assessment</span>
              </Link>
            </div>

            {/* Portals Showcase in Mobile Drawer */}
            <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800 bg-muted/30 p-3 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 block">
                Portals & Demos
              </span>
              <div className="space-y-1">
                {portalLinks.map((portal) => (
                  <Link
                    key={portal.href}
                    href={portal.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/15 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn('size-7 rounded-lg flex items-center justify-center shrink-0', portal.iconBg)}>
                        {portal.icon}
                      </div>
                      <span className="text-sm font-semibold text-foreground">{portal.label}</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40">
                      {portal.badge}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Remaining standard links */}
            <div className="space-y-1">
              {navLinks.slice(2).map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors',
                      active ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-muted'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span>{link.label}</span>
                    {active && <div className="size-2 rounded-full bg-primary" />}
                  </Link>
                )
              })}
            </div>
          </nav>

          <div className="pt-6 border-t border-border/80 space-y-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className={buttonVariants({ variant: 'outline', size: 'lg', className: 'w-full justify-center text-base font-semibold' })}
            >
              <LogIn className="size-4 mr-2" />
              <span>Sign In</span>
            </Link>

            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className={buttonVariants({ variant: 'default', size: 'lg', className: 'w-full justify-center text-base font-bold shadow-md' })}
            >
              <span>Get Started</span>
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
