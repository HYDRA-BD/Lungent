'use server'

/**
 * Phase 2.6: Server Actions for Clinical Evidence & Decision Support
 */

import { ClinicalEvidenceService } from './evidence-service'
import { ClinicalDecisionSupportEngine } from './decision-support-engine'
import type {
  ClinicalDecisionSupportInsight,
  ClinicalEvidenceFilter,
  ClinicalEvidenceSource,
  ClinicalKnowledgeArticle,
  ClinicalRecommendationAssistance,
  ClinicianActionStatus,
  GuidelineApprovalStatus,
  PatientCDSContextInput,
} from './types'

export async function searchClinicalEvidenceAction(
  filter?: ClinicalEvidenceFilter
): Promise<{
  success: boolean
  data?: ClinicalEvidenceSource[]
  error?: string
}> {
  try {
    const data = await ClinicalEvidenceService.searchEvidence(filter)
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to search evidence'
    return { success: false, error: message }
  }
}

export async function fetchEvidenceByIdAction(id: string): Promise<{
  success: boolean
  data?: ClinicalEvidenceSource | null
  error?: string
}> {
  try {
    const data = await ClinicalEvidenceService.getEvidenceById(id)
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch evidence source'
    return { success: false, error: message }
  }
}

export async function fetchEvidenceByCodeAction(code: string): Promise<{
  success: boolean
  data?: ClinicalEvidenceSource | null
  error?: string
}> {
  try {
    const data = await ClinicalEvidenceService.getEvidenceByCode(code)
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch evidence source'
    return { success: false, error: message }
  }
}

export async function fetchKnowledgeArticlesAction(topic?: string): Promise<{
  success: boolean
  data?: ClinicalKnowledgeArticle[]
  error?: string
}> {
  try {
    const data = topic
      ? await ClinicalEvidenceService.getArticlesByTopic(topic)
      : await ClinicalEvidenceService.getAllKnowledgeArticles()
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch knowledge articles'
    return { success: false, error: message }
  }
}

export async function fetchArticleBySlugAction(slug: string): Promise<{
  success: boolean
  data?: ClinicalKnowledgeArticle | null
  error?: string
}> {
  try {
    const data = await ClinicalEvidenceService.getArticleBySlug(slug)
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch article'
    return { success: false, error: message }
  }
}

export async function generatePatientCDSAction(input: PatientCDSContextInput): Promise<{
  success: boolean
  data?: {
    insights: ClinicalDecisionSupportInsight[]
    recommendations: ClinicalRecommendationAssistance[]
  }
  error?: string
}> {
  try {
    const data = await ClinicalDecisionSupportEngine.generatePatientCDS(input)
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate CDS'
    return { success: false, error: message }
  }
}

export async function recordClinicianInsightAction(
  insightId: string,
  actionStatus: ClinicianActionStatus,
  clinicianId: string,
  notes?: string
): Promise<{
  success: boolean
  data?: ClinicalDecisionSupportInsight
  error?: string
}> {
  try {
    const data = await ClinicalDecisionSupportEngine.recordClinicianActionOnInsight(
      insightId,
      actionStatus,
      clinicianId,
      notes
    )
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to record clinician action'
    return { success: false, error: message }
  }
}

export async function recordClinicianRecommendationAction(
  recommendationId: string,
  actionStatus: ClinicianActionStatus,
  clinicianId: string,
  rationale?: string
): Promise<{
  success: boolean
  data?: ClinicalRecommendationAssistance
  error?: string
}> {
  try {
    const data = await ClinicalDecisionSupportEngine.recordClinicianActionOnRecommendation(
      recommendationId,
      actionStatus,
      clinicianId,
      rationale
    )
    return { success: true, data }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to record recommendation action'
    return { success: false, error: message }
  }
}

export async function updateGuidelineApprovalStatusAction(
  evidenceId: string,
  newStatus: GuidelineApprovalStatus,
  reviewerId: string,
  notes?: string
): Promise<{
  success: boolean
  data?: ClinicalEvidenceSource
  error?: string
}> {
  try {
    const data = await ClinicalEvidenceService.updateGuidelineApprovalStatus(
      evidenceId,
      newStatus,
      reviewerId,
      notes
    )
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update approval status'
    return { success: false, error: message }
  }
}

