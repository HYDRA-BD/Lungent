import type { Metadata } from 'next'
import { getClinicalFollowUpsAction } from '@/modules/clinical/actions'
import { ClinicalFollowUpsClient } from './clinical-follow-ups-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Clinical Follow-Up Planning | Lungent',
  description: 'Manage longitudinal patient follow-up intervals, imaging review schedules, and surveillance plans.',
}

export default async function ClinicalFollowUpsPage() {
  const result = await getClinicalFollowUpsAction()

  const initialFollowUps = result.success && result.data ? result.data : []

  return <ClinicalFollowUpsClient initialFollowUps={initialFollowUps} />
}

