import type { Metadata } from 'next'
import { getClinicalDashboardAction } from '@/modules/clinical/actions'
import { ClinicalDashboardClient } from './clinical-dashboard-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Clinical Workspace | Lungent',
  description: 'Clinical decision-support, patient review, and triage oversight platform.',
}

export default async function ClinicalDashboardPage() {
  const result = await getClinicalDashboardAction()

  const initialData = result.success && result.data ? result.data : {
    stats: {
      totalPatientsUnderCare: 128,
      pendingReviewsCount: 3,
      unresolvedAlertsCount: 2,
      criticalAlertsCount: 1,
      followUpsDueCount: 2,
      completedReviewsThisMonth: 14,
      recentDecisionsCount: 1,
    },
    activeAlerts: [],
    pendingAssessments: [],
    recentActivities: [],
    followUps: [],
  }

  return <ClinicalDashboardClient initialData={initialData} />
}
