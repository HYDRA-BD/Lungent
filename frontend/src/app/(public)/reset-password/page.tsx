'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/components/layouts/auth-layout'
import { FormField } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { resetPasswordSchema, type ResetPasswordInput } from '@/modules/authentication/validation'
import { resetPassword } from '@/modules/authentication/service'
import { KeyRound } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const result = await resetPassword(data)
      if (!result.success) {
        setServerError(result.error)
        setIsSubmitting(false)
        return
      }

      setIsSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2500)
    } catch {
      setServerError('An unexpected error occurred while resetting your password.')
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Your recovery link has been verified. Choose a strong new password for your account."
      footer={
        <p>
          Remember your credentials?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </p>
      }
    >
      {isSuccess ? (
        <div className="space-y-4 text-center">
          <Alert variant="success">
            <AlertTitle>Password Successfully Reset</AlertTitle>
            <AlertDescription>
              Your account password has been updated. Redirecting you to sign in...
            </AlertDescription>
          </Alert>

          <Link href="/login" className={buttonVariants({ variant: 'default', className: 'w-full' })}>
            Proceed to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <Alert variant="destructive">
              <AlertTitle>Password Update Error</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <FormField
            label="New Password"
            required
            error={errors.password?.message}
            helperText="Minimum 8 characters with upper, lower, number, and special character."
          >
            <Input
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('password')}
            />
          </FormField>

          <FormField
            label="Confirm New Password"
            required
            error={errors.confirmPassword?.message}
          >
            <Input
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
          </FormField>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isSubmitting}
            rightIcon={<KeyRound className="size-4" />}
          >
            Set New Password
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
