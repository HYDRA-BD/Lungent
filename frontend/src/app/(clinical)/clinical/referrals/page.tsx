import type { Metadata } from 'next'
import { ReferralService, FollowUpService } from '@/modules/referrals/service'
import { ClinicalReferralsClient } from './clinical-referrals-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Specialist Referrals & Follow-Up Management | Lungent Clinical Workspace',
  description: 'Manage specialist referral destinations, urgent 2-week-wait tracks, and longitudinal follow-up planning.',
}

export default async function ClinicalReferralsPage() {
  const referrals = await ReferralService.getReferrals()
  const followUps = await FollowUpService.getFollowUps()

  return (
    <ClinicalReferralsClient
      initialReferrals={referrals}
      initialFollowUps={followUps}
    />
  )
}
