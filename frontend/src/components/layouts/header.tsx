'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Logo } from '@/components/shared/logo'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { buttonVariants } from '@/components/ui/button'
import { useLanguage } from '@/i18n'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/modules/authentication/service'
import {
  type AppRole,
  normalizeAppRole,
  canAccessDocs,
  canSeePortalsDropdown,
  getAllowedPortalLinks,
  ROLE_DESCRIPTIONS,
} from '@/lib/auth-roles'
import {
  Menu,
  X,
  ArrowRight,
  LogIn,
  LogOut,
  ChevronDown,
  HeartPulse,
  Building2,
  Stethoscope,
  ShieldCheck,
  Scale,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { dict, t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false)
  const portalsRef = useRef<HTMLDivElement>(null)
  const [prevPathname, setPrevPathname] = useState(pathname)

  // Strict RBAC Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<AppRole | null>(null)

  useEffect(() => {
    let mounted = true

    function checkAuthCookies() {
      if (typeof document === 'undefined') return
      const cookies = document.cookie.split(';').map((c) => c.trim())
      const demoCookie = cookies.find((c) => c.startsWith('lungent_auth_demo='))?.split('=')[1]
      const roleCookie = cookies.find((c) => c.startsWith('lungent_role='))?.split('=')[1]

      if (demoCookie === 'true' || roleCookie) {
        if (mounted) {
          setIsAuthenticated(true)
          setUserRole(normalizeAppRole(decodeURIComponent(roleCookie || 'General User')))
        }
      }
    }

    checkAuthCookies()

    const supabase = createClient()
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        if (!mounted) return
        if (user) {
          setIsAuthenticated(true)
          setUserRole(normalizeAppRole(user.user_metadata?.role))
        } else {
          const cookies = document.cookie.split(';').map((c) => c.trim())
          const demoCookie = cookies.find((c) => c.startsWith('lungent_auth_demo='))?.split('=')[1]
          if (demoCookie !== 'true') {
            setIsAuthenticated(false)
            setUserRole(null)
          }
        }
      })
      .catch(() => {})

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session?.user) {
        setIsAuthenticated(true)
        setUserRole(normalizeAppRole(session.user.user_metadata?.role))
      } else {
        const cookies = document.cookie.split(';').map((c) => c.trim())
        const demoCookie = cookies.find((c) => c.startsWith('lungent_auth_demo='))?.split('=')[1]
        if (demoCookie !== 'true') {
          setIsAuthenticated(false)
          setUserRole(null)
        }
      }
    })

    return () => {
      mounted = false
      authListener?.subscription?.unsubscribe()
    }
  }, [pathname])

  const handleLogout = async () => {
    await logout()
    setIsAuthenticated(false)
    setUserRole(null)
    router.push('/')
    router.refresh()
  }

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

  // Strict 6-Role Portal & Docs Access Boundaries
  const portalLinks = getAllowedPortalLinks(userRole)
  const showPortals = canSeePortalsDropdown(userRole) && portalLinks.length > 0
  const showDocs = canAccessDocs(userRole)

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
    ...(showDocs ? [{ href: '/docs', label: 'Docs' }] : []),
    { href: '/library', label: 'Health Library' },
    { href: '/faqs', label: 'FAQs' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const getPortalIcon = (iconType: string) => {
    switch (iconType) {
      case 'clinician':
        return <Stethoscope className="size-4" />
      case 'chw':
        return <Building2 className="size-4" />
      case 'governance':
        return <Scale className="size-4" />
      case 'admin':
        return <ShieldCheck className="size-4" />
      case 'patient':
      default:
        return <HeartPulse className="size-4" />
    }
  }

  return (
    <header className="sticky top-0 z-[100] relative overflow-visible w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-xs">
      <div className="container mx-auto flex h-[72px] sm:h-20 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Logo size="md" variant="compact" href="/" />

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1.5 xl:gap-2">
          {/* Home */}
          <Link
            href="/"
            className={cn(
              'relative px-3 py-2 rounded-xl transition-all duration-200 text-sm xl:text-[15px] font-medium',
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
              'relative px-3 py-2 rounded-xl transition-all duration-200 text-sm xl:text-[15px] font-medium',
              pathname.startsWith('/ai-assessment')
                ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/25'
                : 'text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:scale-[1.02]'
            )}
            aria-current={pathname.startsWith('/ai-assessment') ? 'page' : undefined}
          >
            AI Risk Assessment
          </Link>

          {/* Portals Dropdown — Strictly controlled by RBAC Matrix */}
          {showPortals && (
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
                  'relative flex items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 text-sm xl:text-[15px] font-medium cursor-pointer',
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
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 mb-1 flex items-center justify-between">
                    <span>Authorized Portals</span>
                    <span className="text-[10px] font-semibold text-primary">{userRole}</span>
                  </div>
                  {portalLinks.map((portal) => (
                    <Link
                      key={portal.href + portal.label}
                      href={portal.href}
                      onClick={() => setPortalsDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/15 transition-all group"
                    >
                      <div className={cn('size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-2xs', portal.iconBg)}>
                        {getPortalIcon(portal.iconType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {portal.label}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full border border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40">
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
          )}

          {/* Remaining Links: How it Works, About, Docs (conditional), Library, FAQs */}
          {navLinks.slice(2).map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-3 py-2 rounded-xl transition-all duration-200 text-sm xl:text-[15px] font-medium',
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
        <div className="hidden lg:flex items-center gap-2 xl:gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {/* User Role Badge */}
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold tracking-tight',
                  userRole ? ROLE_DESCRIPTIONS[userRole]?.badgeColor : 'border-border text-foreground bg-muted'
                )}
                title={`Active Role: ${userRole}`}
              >
                <User className="size-3.5" />
                <span>{userRole || 'Signed In'}</span>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'sm',
                  className: 'text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-destructive cursor-pointer',
                })}
              >
                <LogOut className="size-3.5 mr-1" />
                <span>Sign Out</span>
              </button>

              <Link
                href="/ai-assessment"
                className={buttonVariants({
                  variant: 'default',
                  size: 'default',
                  className: 'text-sm font-bold shadow-sm hover:scale-105 active:scale-98 transition-all duration-200 hover:shadow-md hover:shadow-primary/25',
                })}
              >
                <span>AI Assessment</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'default',
                  className: 'text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary',
                })}
              >
                <LogIn className="size-4 mr-1.5" />
                <span>Sign In</span>
              </Link>

              <Link
                href="/ai-assessment"
                className={buttonVariants({
                  variant: 'default',
                  size: 'default',
                  className: 'text-sm font-bold shadow-sm hover:scale-105 active:scale-98 transition-all duration-200 hover:shadow-md hover:shadow-primary/25',
                })}
              >
                <span>Get Started</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </>
          )}
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

      {/* Mobile Dropdown Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full left-0 w-full z-[100] bg-white dark:bg-slate-950 shadow-lg border-b border-slate-200 dark:border-slate-800 flex flex-col p-6 gap-4 max-h-[calc(100vh-80px)] overflow-y-auto"
          >
            <nav aria-label="Mobile Navigation" className="flex flex-col gap-3">
              {/* Authenticated Role Status Banner in Mobile */}
              {isAuthenticated && (
                <div className="flex items-center justify-between p-3 rounded-xl border border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">Designation:</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary">
                    {userRole}
                  </span>
                </div>
              )}

              {/* Primary Links: Home & AI Risk Assessment */}
              <div className="flex flex-col gap-1.5">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all',
                    pathname === '/'
                      ? 'bg-primary/10 text-primary font-bold border border-primary/25 shadow-xs'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                  )}
                  aria-current={pathname === '/' ? 'page' : undefined}
                >
                  <span>Home</span>
                  {pathname === '/' && <div className="size-2 rounded-full bg-primary" />}
                </Link>

                <Link
                  href="/ai-assessment"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all',
                    pathname.startsWith('/ai-assessment')
                      ? 'bg-primary/10 text-primary font-bold border border-primary/25 shadow-xs'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                  )}
                  aria-current={pathname.startsWith('/ai-assessment') ? 'page' : undefined}
                >
                  <span>AI Risk Assessment</span>
                  {pathname.startsWith('/ai-assessment') && <div className="size-2 rounded-full bg-primary" />}
                </Link>
              </div>

              {/* Portals Showcase in Mobile Dropdown — RBAC Gated */}
              {showPortals && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/80 p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Authorized Portals
                    </span>
                    <span className="text-[11px] font-semibold text-primary">{userRole}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {portalLinks.map((portal) => (
                      <Link
                        key={portal.href + portal.label}
                        href={portal.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/15 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn('size-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs', portal.iconBg)}>
                            {getPortalIcon(portal.iconType)}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-foreground block">{portal.label}</span>
                            <span className="text-[11px] text-muted-foreground block line-clamp-1">{portal.desc}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40">
                          {portal.badge}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Secondary Navigation Links */}
              <div className="flex flex-col gap-1.5">
                {navLinks.slice(2).map((link) => {
                  const active = isActive(link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all',
                        active
                          ? 'bg-primary/10 text-primary font-bold border border-primary/25 shadow-xs'
                          : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
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

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className={buttonVariants({
                      variant: 'outline',
                      size: 'lg',
                      className: 'w-full justify-center text-base font-semibold rounded-xl text-destructive hover:bg-destructive/10 cursor-pointer',
                    })}
                  >
                    <LogOut className="size-4 mr-2" />
                    <span>Sign Out ({userRole})</span>
                  </button>

                  <Link
                    href="/ai-assessment"
                    onClick={() => setMobileMenuOpen(false)}
                    className={buttonVariants({
                      variant: 'default',
                      size: 'lg',
                      className: 'w-full justify-center text-base font-bold shadow-md rounded-xl',
                    })}
                  >
                    <span>AI Risk Assessment</span>
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className={buttonVariants({
                      variant: 'outline',
                      size: 'lg',
                      className: 'w-full justify-center text-base font-semibold rounded-xl',
                    })}
                  >
                    <LogIn className="size-4 mr-2" />
                    <span>Sign In</span>
                  </Link>

                  <Link
                    href="/ai-assessment"
                    onClick={() => setMobileMenuOpen(false)}
                    className={buttonVariants({
                      variant: 'default',
                      size: 'lg',
                      className: 'w-full justify-center text-base font-bold shadow-md rounded-xl',
                    })}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
