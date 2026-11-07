import type { Metadata } from 'next'
import { searchClinicalPatientsAction } from '@/modules/clinical/actions'
import { ClinicalPatientsClient } from './clinical-patients-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Clinical Patient Directory | Lungent',
  description: 'Search and manage patients requiring clinical review, decision-support, or surveillance.',
}

export default async function ClinicalPatientsPage() {
  const result = await searchClinicalPatientsAction({ limit: 50 })

  const initialData = result.success && result.data ? result.data : {
    patients: [],
    total: 0,
    page: 1,
    limit: 50,
  }

  return <ClinicalPatientsClient initialData={initialData} />
}

