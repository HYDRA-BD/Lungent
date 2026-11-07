import React from 'react'
import Link from 'next/link'
import { AuthLayout } from '@/components/layouts/auth-layout'
import { buttonVariants } from '@/components/ui/button'
import { AlertTriangle, Mail, ArrowLeft } from 'lucide-react'

export default function SuspendedAccountPage() {
  return (
    <AuthLayout
      title="Account Temporarily Suspended"
      subtitle="Access to this Lungent account has been restricted pending administrative review."
      footer={
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
          <ArrowLeft className="size-3.5" />
          Return to Platform Home
        </Link>
      }
    >
      <div className="space-y-4 text-center">
        <div className="size-14 mx-auto rounded-full bg-rose-50 text-destructive flex items-center justify-center border border-rose-200">
          <AlertTriangle className="size-7" aria-hidden="true" />
        </div>

        <div className="space-y-2 text-xs text-muted-foreground leading-relaxed text-left bg-muted/40 p-4 rounded-xl border border-border/60">
          <p className="font-semibold text-foreground text-sm">
            Data Retention & Patient Safety Guarantee:
          </p>
          <p>
            Account suspension does not delete your historical health assessments, patient intake files,
            or clinical consult records. All data remains securely stored and encrypted under clinical
            governance compliance regulations.
          </p>
          <p>
            If you believe this suspension is in error or require expedited clinical access, please
            contact the governance administrator.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <a href="mailto:support@lungent.org" className={buttonVariants({ variant: 'outline', className: 'w-full' })}>
            <Mail className="size-4 mr-2" />
            Contact Governance Support
          </a>

          <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Sign In with a Different Account
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
