import type { Metadata } from 'next'
import { getClinicalActivitiesAction } from '@/modules/clinical/actions'
import { ClinicalActivityClient } from './clinical-activity-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Clinical Audit & Activity Stream | Lungent',
  description: 'Chronological tamper-evident audit history of clinical determinations and reviews.',
}

export default async function ClinicalActivityPage() {
  const result = await getClinicalActivitiesAction({ limit: 100 })

  const initialActivities = result.success && result.data ? result.data : []

  return <ClinicalActivityClient initialActivities={initialActivities} />
}

