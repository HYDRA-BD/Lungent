import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getClinicalPatientProfileAction } from '@/modules/clinical/actions'
import { ClinicalReviewClient } from './clinical-review-client'

export const instant = false

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const res = await getClinicalPatientProfileAction(id)
  if (!res.success || !res.data) {
    return { title: 'Clinical Review | Lungent' }
  }
  return {
    title: `Clinical Review: ${res.data.identity.patient.fullName} | Lungent`,
    description: `Structured clinical review and observation documentation for ${res.data.identity.patient.fullName}.`,
  }
}

export default async function ClinicalReviewPage({ params }: PageProps) {
  const { id } = await params
  const result = await getClinicalPatientProfileAction(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return <ClinicalReviewClient profile={result.data} />
}

