'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/components/layouts/auth-layout'
import { FormField } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { registerSchema, type RegisterInput } from '@/modules/authentication/validation'
import { register } from '@/modules/authentication/service'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/i18n'

export default function RegisterPage() {
  const router = useRouter()
  const { dict } = useLanguage()
  const auth = dict.auth

  const [serverError, setServerError] = useState<string | null>(null)
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
      preferredLanguage: 'en',
      acceptTerms: false,
    },
  })

  const acceptTermsValue = useWatch({ control, name: 'acceptTerms' })

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const result = await register(data)

      if (!result.success) {
        setServerError(result.error)
        setIsSubmitting(false)
        return
      }

      if (result.data.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
      } else {
        router.push('/patient')
      }
    } catch {
      setServerError('An unexpected connection error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title={auth.registerTitle}
      subtitle={auth.registerSubtitle}
      footer={
        <p>
          {auth.alreadyHaveAccount}{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            {auth.signInButton}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <Alert variant="destructive">
            <AlertTitle>Registration Error</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <FormField
          label="Full Name"
          required
          error={errors.fullName?.message}
          helperText="As it appears on official medical or identity records."
        >
          <Input
            placeholder="e.g. Ayesha Rahman"
            autoComplete="name"
            {...formRegister('fullName')}
          />
        </FormField>

        <FormField
          label="Email Address"
          required
          error={errors.email?.message}
        >
          <Input
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            {...formRegister('email')}
          />
        </FormField>

        <FormField
          label="Phone Number (Optional)"
          error={errors.phoneNumber?.message}
          helperText="Used for SMS screening reminders in Bangladesh (+8801XXXXXXXXX)"
        >
          <Input
            type="tel"
            placeholder="+8801700000000"
            autoComplete="tel"
            {...formRegister('phoneNumber')}
          />
        </FormField>

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
              {...formRegister('confirmPassword')}
            />
          </FormField>
        </div>

        <div className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg space-y-1">
          <span className="font-semibold text-foreground flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-primary" /> Password Requirements:
          </span>
          <p>Minimum 8 characters with at least one uppercase letter, one number, and one special character.</p>
        </div>

        <FormField label="Preferred Language">
          <Select
            options={[
              { value: 'en', label: 'English' },
              { value: 'bn', label: 'বাংলা (Bengali)' },
            ]}
            {...formRegister('preferredLanguage')}
          />
        </FormField>

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

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isSubmitting}
          rightIcon={<ArrowRight className="size-4" />}
        >
          Create Account
        </Button>
      </form>
    </AuthLayout>
  )
}
