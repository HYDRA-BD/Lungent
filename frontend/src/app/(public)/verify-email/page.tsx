'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AuthLayout } from '@/components/layouts/auth-layout'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { resendVerification } from '@/modules/authentication/service'
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/i18n'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const { dict } = useLanguage()
  const auth = dict.auth

  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<{ success: boolean; message: string } | null>(null)

  const handleResend = async () => {
    if (!email) return
    setIsResending(true)
    setResendStatus(null)

    try {
      const result = await resendVerification(email)
      if (result.success) {
        setResendStatus({
          success: true,
          message: auth.verificationSentNotice,
        })
      } else {
        setResendStatus({
          success: false,
          message: result.error || 'Unable to resend verification email at this time.',
        })
      }
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout
      title={auth.verifyEmailTitle}
      subtitle={auth.verifyEmailSubtitle}
      footer={
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
          <ArrowLeft className="size-3.5" />
          {auth.backToSignIn}
        </Link>
      }
    >
      <div className="space-y-5 text-center">
        <div className="size-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Mail className="size-7" aria-hidden="true" />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Sent to: <span className="font-semibold text-primary">{email || 'your registered email'}</span>
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Click the link in the message to activate your profile. If you don&apos;t see it within a few
            minutes, please check your spam or junk folder.
          </p>
        </div>

        {resendStatus && (
          <Alert variant={resendStatus.success ? 'success' : 'destructive'}>
            <AlertTitle>{resendStatus.success ? 'Email Dispatched' : 'Error'}</AlertTitle>
            <AlertDescription>{resendStatus.message}</AlertDescription>
          </Alert>
        )}

        {email && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              loading={isResending}
              leftIcon={<RefreshCw className="size-3.5" />}
            >
              Resend Verification Link
            </Button>
          </div>
        )}

        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
          <p>
            Already verified on another device?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in now
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/20" />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
