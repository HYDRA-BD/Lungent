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
import { loginSchema, type LoginInput, ACTIVE_ACCESS_ROLES } from '@/modules/authentication/validation'
import { login } from '@/modules/authentication/service'
import { LogIn, Mail, Lock, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '@/i18n'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo =
    searchParams.get('redirect') ||
    searchParams.get('redirectTo') ||
    searchParams.get('next')
  const verified = searchParams.get('verified')
  const registered = searchParams.get('registered')
  const adminPending = searchParams.get('admin_pending')

  const { dict } = useLanguage()
  const auth = dict.auth

  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'General User',
      email: '',
      password: '',
    },
  })

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

      setSuccessMessage('Authentication verified! Redirecting to home...')

      // Brief delay to display smooth success feedback
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 500)
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
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AnimatePresence mode="wait">
          {adminPending && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Alert className="rounded-xl border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                <CheckCircle2 className="size-4 text-amber-600 shrink-0" />
                <AlertTitle className="text-amber-800 dark:text-amber-300 font-semibold leading-relaxed">
                  Registration successful. An administrator must verify your account before you can log in.
                </AlertTitle>
              </Alert>
            </motion.div>
          )}

          {registered && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Alert variant="success" className="rounded-xl border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <AlertTitle className="text-emerald-800 dark:text-emerald-300 font-semibold">
                  Account created successfully. Please sign in.
                </AlertTitle>
              </Alert>
            </motion.div>
          )}

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

        {/* Access Role Selection (Top of Form) */}
        <FormField
          label="Access Role"
          required
          error={errors.role?.message}
        >
          <div className="relative">
            <select
              disabled={isSubmitting}
              className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm sm:text-base font-semibold text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary cursor-pointer shadow-2xs"
              {...register('role')}
            >
              {ACTIVE_ACCESS_ROLES.map((r) => (
                <option key={r} value={r} className="py-1.5 text-foreground bg-background">
                  {r}
                </option>
              ))}
            </select>
          </div>
        </FormField>

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
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isSubmitting}
              leftIcon={<Lock className="size-4 text-slate-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
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
