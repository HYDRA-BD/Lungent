'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'motion/react'
import { AuthLayout } from '@/components/layouts/auth-layout'
import { FormField } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { loginSchema, type LoginInput } from '@/modules/authentication/validation'
import { login, quickDemoLogin } from '@/modules/authentication/service'
import { APP_ROLES, type AppRole } from '@/lib/auth-roles'
import { LogIn, Mail, Lock, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Stethoscope, Building2, User, Scale } from 'lucide-react'
import { useLanguage } from '@/i18n'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo =
    searchParams.get('redirect') ||
    searchParams.get('redirectTo') ||
    searchParams.get('next')
  const verified = searchParams.get('verified')

  const { dict } = useLanguage()
  const auth = dict.auth

  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const fillDemoCredentials = () => {
    setValue('email', 'patient@lungent.org', { shouldValidate: true })
    setValue('password', 'Lungent2026!', { shouldValidate: true })
    setServerError(null)
  }

  const handleRoleSimulation = async (role: AppRole) => {
    setIsSubmitting(true)
    setServerError(null)
    try {
      await quickDemoLogin(role)
      setSuccessMessage(`Logged in as ${role}! Redirecting...`)
      setTimeout(() => {
        const target = redirectTo || (role === 'General User' ? '/ai-assessment' : role === 'Clinician' ? '/portal/clinician' : role === 'Health Worker' ? '/portal/community' : '/portal/admin')
        router.push(target)
        router.refresh()
      }, 500)
    } catch {
      setServerError('Failed to switch role session')
      setIsSubmitting(false)
    }
  }

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true)
    setServerError(null)
    setSuccessMessage(null)

    try {
      const result = await login(data)

      if (!result.success) {
        if (result.isSuspended) {
          router.push('/suspended')
          return
        }
        setServerError(result.error)
        setIsSubmitting(false)
        return
      }

      const target = redirectTo || '/'
      setSuccessMessage('Authentication verified! Redirecting...')

      // Brief delay to display smooth success feedback
      setTimeout(() => {
        router.push(target)
        router.refresh()
      }, 600)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected authentication error occurred.'
      setServerError(msg)
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your clinical risk assessments and patient health record."
      badge="Secure Health Access"
      footer={
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {auth.dontHaveAccount}{' '}
            <Link
              href="/register"
              className="font-bold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>{auth.registerHere}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </p>

          {/* Quick Demo & RBAC Role Simulation for Judges & Reviewers */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 text-primary font-bold">
                <Sparkles className="size-3.5" /> Fast RBAC Role Switcher
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Evaluation Mode</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
              {APP_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSimulation(r)}
                  disabled={isSubmitting}
                  className="px-2 py-1.5 text-xs font-medium rounded-lg border border-border/80 bg-muted/40 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all text-left truncate cursor-pointer"
                  title={`Sign in as ${r}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors hover:underline"
              >
                Or fill standard credentials (patient@lungent.org)
              </button>
            </div>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AnimatePresence mode="wait">
          {verified && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Alert variant="success" className="rounded-xl border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <AlertTitle className="text-emerald-800 dark:text-emerald-300">
                  {auth.emailVerifiedSuccess}
                </AlertTitle>
              </Alert>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 text-sm font-medium">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            </motion.div>
          )}

          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Alert variant="destructive" className="rounded-xl">
                <AlertTitle>Authentication Failed</AlertTitle>
                <AlertDescription className="text-xs leading-relaxed mt-1">
                  {serverError}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Field */}
        <FormField
          label="Email Address"
          required
          error={errors.email?.message}
        >
          <Input
            type="email"
            placeholder="patient@example.com"
            autoComplete="email"
            disabled={isSubmitting}
            leftIcon={<Mail className="size-4 text-slate-400" />}
            className="h-11 rounded-xl text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
            {...register('email')}
          />
        </FormField>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Password</span>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              {auth.forgotPasswordLink}
            </Link>
          </div>
          <FormField
            error={errors.password?.message}
          >
            <Input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isSubmitting}
              leftIcon={<Lock className="size-4 text-slate-400" />}
              className="h-11 rounded-xl text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
              {...register('password')}
            />
          </FormField>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-sm hover:bg-primary/90 hover:scale-[1.02] hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <LogIn className="size-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  )
}
