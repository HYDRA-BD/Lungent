import type { Metadata } from 'next'
import { ReferralService, FollowUpService } from '@/modules/referrals/service'
import { PatientReferralsClient } from './patient-referrals-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Referrals & Follow-ups | Lungent Patient Portal',
  description: 'Track specialist consultations, imaging appointments, and referral progress.',
}

const DEFAULT_PATIENT_ID = '11111111-1111-4111-a111-111111111111'

export default async function PatientReferralsPage() {
  const patientId = DEFAULT_PATIENT_ID

  const referrals = await ReferralService.getReferrals({ patientId })
  const followUps = await FollowUpService.getFollowUps({ patientId })

  return <PatientReferralsClient referrals={referrals} followUps={followUps} />
}
