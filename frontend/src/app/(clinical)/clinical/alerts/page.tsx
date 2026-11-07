import type { Metadata } from 'next'
import { getClinicalAlertsAction } from '@/modules/clinical/actions'
import { ClinicalAlertsClient } from './clinical-alerts-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Clinical Alerts & Red Flags | Lungent',
  description: 'Prioritize and resolve red-flag symptoms, urgent triage flags, and diagnostic discrepancies.',
}

export default async function ClinicalAlertsPage() {
  const result = await getClinicalAlertsAction()

  const initialAlerts = result.success && result.data ? result.data : []

  return <ClinicalAlertsClient initialAlerts={initialAlerts} />
}

