'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'motion/react'
import { AuthLayout } from '@/components/layouts/auth-layout'
import { FormField } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { registerSchema, type RegisterInput } from '@/modules/authentication/validation'
import { register } from '@/modules/authentication/service'
import { APP_ROLES, type AppRole, ROLE_DESCRIPTIONS } from '@/lib/auth-roles'
import { ArrowRight, ShieldCheck, User, Mail, Lock, CheckCircle2, UserCheck, Stethoscope, Sparkles, Building2, Shield, Scale } from 'lucide-react'
import { useLanguage } from '@/i18n'

export default function RegisterPage() {
  const router = useRouter()
  const { dict } = useLanguage()
  const auth = dict.auth

  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register: formRegister,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      role: 'General User',
      preferredLanguage: 'en',
      acceptTerms: false,
    },
  })

  const acceptTermsValue = useWatch({ control, name: 'acceptTerms' })
  const selectedRole = useWatch({ control, name: 'role' })

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true)
    setServerError(null)
    setSuccessMessage(null)

    try {
      const result = await register(data)

      if (!result.success) {
        setServerError(result.error)
        setIsSubmitting(false)
        return
      }

      setSuccessMessage(`Account registered successfully as ${data.role}! Redirecting...`)

      setTimeout(() => {
        if (result.data.requiresVerification) {
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
        } else {
          switch (data.role) {
            case 'General User':
              router.push('/ai-assessment')
              break
            case 'Clinician':
              router.push('/portal/clinician')
              break
            case 'Health Worker':
              router.push('/portal/community')
              break
            case 'Governance':
              router.push('/portal/admin')
              break
            case 'Admin':
            case 'AI Builders Congress':
              router.push('/portal/admin')
              break
            default:
              router.push('/ai-assessment')
          }
          router.refresh()
        }
      }, 700)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected registration error occurred.'
      setServerError(msg)
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Join Lungent for clinical AI pre-screening, risk stratification, and RBAC workspace access."
      badge="Secure Registration"
      footer={
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {auth.alreadyHaveAccount}{' '}
          <Link
            href="/login"
            className="font-bold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>{auth.signInButton}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AnimatePresence mode="wait">
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
                <AlertTitle>Registration Error</AlertTitle>
                <AlertDescription className="text-xs leading-relaxed mt-1">
                  {serverError}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. Role Selection (Top of Form as required) */}
        <FormField
          label="Select Account Role"
          required
          error={errors.role?.message}
          helperText={
            selectedRole && ROLE_DESCRIPTIONS[selectedRole]
              ? `${selectedRole}: ${ROLE_DESCRIPTIONS[selectedRole].description}`
              : 'Select your operational designation to configure role-based permissions.'
          }
        >
          <div className="relative">
            <select
              disabled={isSubmitting}
              className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm sm:text-base font-semibold text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary cursor-pointer shadow-2xs"
              {...formRegister('role')}
            >
              {APP_ROLES.map((r) => (
                <option key={r} value={r} className="py-1.5 text-foreground bg-background">
                  {r} — {ROLE_DESCRIPTIONS[r].title}
                </option>
              ))}
            </select>
          </div>
        </FormField>

        {/* 2. Full Name */}
        <FormField
          label="Full Name"
          required
          error={errors.fullName?.message}
        >
          <Input
            placeholder="e.g. Dr. Sarah Jenkins"
            autoComplete="name"
            disabled={isSubmitting}
            leftIcon={<User className="size-4 text-slate-400" />}
            className="h-11 rounded-xl text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
            {...formRegister('fullName')}
          />
        </FormField>

        {/* 3. Email Address */}
        <FormField
          label="Email Address"
          required
          error={errors.email?.message}
        >
          <Input
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            disabled={isSubmitting}
            leftIcon={<Mail className="size-4 text-slate-400" />}
            className="h-11 rounded-xl text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
            {...formRegister('email')}
          />
        </FormField>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            label="Password"
            required
            error={errors.password?.message}
          >
            <Input
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isSubmitting}
              leftIcon={<Lock className="size-4 text-slate-400" />}
              className="h-11 rounded-xl text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
              {...formRegister('password')}
            />
          </FormField>

          <FormField
            label="Confirm Password"
            required
            error={errors.confirmPassword?.message}
          >
            <Input
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isSubmitting}
              leftIcon={<Lock className="size-4 text-slate-400" />}
              className="h-11 rounded-xl text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
              {...formRegister('confirmPassword')}
            />
          </FormField>
        </div>

        {/* Security / Password Note */}
        <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-primary" /> Password Guidelines:
          </span>
          <p>Must be at least 8 characters. All passwords are salted & cryptographically hashed.</p>
        </div>

        {/* Terms of Service Checkbox */}
        <div className="space-y-1 pt-1">
          <Checkbox
            id="acceptTerms"
            checked={acceptTermsValue}
            onChange={(e) => setValue('acceptTerms', e.target.checked, { shouldValidate: true })}
            label="I accept the Terms of Service & Privacy Notice"
            description="Your personal health assessment records are encrypted and protected under healthcare confidentiality regulations."
          />
          {errors.acceptTerms && (
            <p className="text-xs text-destructive font-medium pt-1">
              {errors.acceptTerms.message}
            </p>
          )}
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account / Sign In</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}
