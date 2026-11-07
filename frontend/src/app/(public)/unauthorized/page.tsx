import React from 'react'
import Link from 'next/link'
import { AuthLayout } from '@/components/layouts/auth-layout'
import { buttonVariants } from '@/components/ui/button'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <AuthLayout
      title="Access Restricted"
      subtitle="You do not possess the required clinical authorization or role permissions to view this resource."
      footer={
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
          <ArrowLeft className="size-3.5" />
          Back to Overview
        </Link>
      }
    >
      <div className="space-y-4 text-center">
        <div className="size-14 mx-auto rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
          <ShieldAlert className="size-7" aria-hidden="true" />
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Lungent implements strict multi-disciplinary role boundaries. Patient records and clinical
          decision-support dashboards are restricted to certified medical personnel and assigned community health workers.
        </p>

        <div className="pt-2 flex flex-col gap-2">
          <Link href="/patient" className={buttonVariants({ variant: 'default', className: 'w-full' })}>
            Go to Patient Portal
          </Link>

          <Link href="/" className={buttonVariants({ variant: 'outline', size: 'sm', className: 'inline-flex items-center gap-1.5' })}>
            <Home className="size-3.5" />
            Platform Home
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
