'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/components/layouts/auth-layout'
import { FormField } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { loginSchema, type LoginInput } from '@/modules/authentication/validation'
import { login } from '@/modules/authentication/service'
import { LogIn } from 'lucide-react'
import { useLanguage } from '@/i18n'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  const verified = searchParams.get('verified')

  const { dict } = useLanguage()
  const auth = dict.auth

  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true)
    setServerError(null)

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

      // Successful login -> route to requested target or role's default workspace
      const target = redirectTo || result.data.defaultWorkspace
      router.push(target)
      router.refresh()
    } catch {
      setServerError('An unexpected authentication error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title={auth.signInTitle}
      subtitle={auth.signInSubtitle}
      footer={
        <p>
          {auth.dontHaveAccount}{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            {auth.registerHere}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {verified && (
          <Alert variant="success">
            <AlertTitle>{auth.emailVerifiedSuccess}</AlertTitle>
          </Alert>
        )}

        {serverError && (
          <Alert variant="destructive">
            <AlertTitle>Authentication Failed</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <FormField
          label={auth.emailLabel}
          required
          error={errors.email?.message}
        >
          <Input
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            {...register('email')}
          />
        </FormField>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{auth.passwordLabel}</span>
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
              {...register('password')}
            />
          </FormField>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isSubmitting}
          rightIcon={<LogIn className="size-4" />}
        >
          {auth.signInButton}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/20" />}>
      <LoginForm />
    </Suspense>
  )
}
