'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/components/layouts/auth-layout'
import { FormField } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/modules/authentication/validation'
import { requestPasswordReset } from '@/modules/authentication/service'
import { ArrowLeft, Mail } from 'lucide-react'
import { useLanguage } from '@/i18n'

export default function ForgotPasswordPage() {
  const { dict } = useLanguage()
  const auth = dict.auth

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverMessage, setServerMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsSubmitting(true)
    try {
      const result = await requestPasswordReset(data)
      setIsSubmitted(true)
      if (result.success && result.message) {
        setServerMessage(result.message)
      } else if (!result.success) {
        setServerMessage(result.error)
      } else {
        setServerMessage('If an account exists for this email, password reset instructions have been sent.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title={auth.forgotPasswordTitle}
      subtitle={auth.forgotPasswordSubtitle}
      footer={
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
          <ArrowLeft className="size-3.5" />
          {auth.backToSignIn}
        </Link>
      }
    >
      {isSubmitted ? (
        <div className="space-y-4">
          <Alert variant="info">
            <AlertTitle>Check Your Email</AlertTitle>
            <AlertDescription>{serverMessage}</AlertDescription>
          </Alert>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Please check your inbox (and spam folder) for a secure link. The recovery link will expire
            after 1 hour for your security.
          </p>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsSubmitted(false)}
          >
            Send Another Request
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            label="Email Address"
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

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isSubmitting}
            rightIcon={<Mail className="size-4" />}
          >
            Send Recovery Link
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
