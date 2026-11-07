import type { Metadata } from 'next'
import { ReferralService, FollowUpService } from '@/modules/referrals/service'
import { WorkerReferralsClient } from './worker-referrals-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Field Referrals & Follow-Up Tracking | Lungent Healthcare Worker Workspace',
  description: 'Track community patient referrals, appointment compliance, and outreach follow-ups.',
}

export default async function WorkerReferralsPage() {
  const referrals = await ReferralService.getReferrals()
  const followUps = await FollowUpService.getFollowUps()

  return (
    <WorkerReferralsClient
      initialReferrals={referrals}
      initialFollowUps={followUps}
    />
  )
}
