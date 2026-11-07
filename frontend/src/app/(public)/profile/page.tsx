import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUserWithRoles } from '@/modules/authentication/service'
import { ProfileClient } from './profile-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User Profile & Settings | Lungent',
  description: 'Manage your personal profile, preferred language, role permissions, and facility affiliations.',
}

async function ProfileDataLoader() {
  const user = await getCurrentUserWithRoles()

  if (!user) {
    redirect('/login?redirectTo=/profile')
  }

  if (user.status === 'suspended') {
    redirect('/suspended')
  }

  return <ProfileClient initialUser={user} />
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-5xl px-4 py-12">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="h-64 bg-muted animate-pulse rounded-xl" />
            <div className="h-96 lg:col-span-2 bg-muted animate-pulse rounded-xl" />
          </div>
        </div>
      }
    >
      <ProfileDataLoader />
    </Suspense>
  )
}
