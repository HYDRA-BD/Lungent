import type { Metadata } from 'next'
import { getAssessmentReviewSummariesAction } from '@/modules/clinical/actions'
import { ClinicalAssessmentsClient } from './clinical-assessments-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Assessment Reviews | Lungent Clinical Workspace',
  description: 'Examine automated assessment submissions, verify input parameters, and formulate clinician determinations.',
}

export default async function ClinicalAssessmentsPage() {
  const result = await getAssessmentReviewSummariesAction()

  const initialAssessments = result.success && result.data ? result.data : []

  return <ClinicalAssessmentsClient initialAssessments={initialAssessments} />
}

