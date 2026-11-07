import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { getClinicalPatientProfileAction } from '@/modules/clinical/actions'
import { EnvironmentalIntelligenceService } from '@/modules/environmental'
import { ClinicalPatientProfileClient } from './clinical-patient-profile-client'

export const instant = false

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const res = await getClinicalPatientProfileAction(id)
  if (!res.success || !res.data) {
    return { title: 'Patient Profile | Lungent' }
  }
  return {
    title: `${res.data.identity.patient.fullName} - Clinical Profile | Lungent`,
    description: `Consolidated 5-part clinical profile and assessment history for ${res.data.identity.patient.fullName}.`,
  }
}

export default async function ClinicalPatientDetailPage({ params }: PageProps) {
  await connection()
  const { id } = await params
  const result = await getClinicalPatientProfileAction(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const patient = result.data.identity.patient
  const division = patient.addressDivision || 'Dhaka'
  const district = patient.addressDistrict || 'Dhaka'
  const upazila = patient.addressUpazila || undefined

  const [envSummary, facilityAccessibility] = await Promise.all([
    EnvironmentalIntelligenceService.getEnvironmentalSummary({ division, district, upazila }),
    EnvironmentalIntelligenceService.getFacilityAccessibilityContext({ division, district, upazila }),
  ])

  return (
    <ClinicalPatientProfileClient
      profile={result.data}
      envSummary={envSummary}
      facilityAccessibility={facilityAccessibility}
    />
  )
}


