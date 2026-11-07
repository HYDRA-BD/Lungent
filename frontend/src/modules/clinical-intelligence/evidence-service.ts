/**
 * Phase 2.6: Clinical Evidence Retrieval & Knowledge Service
 *
 * Implements structured searching, filtering, evidence attribution,
 * guideline lifecycle tracking, and knowledge article access.
 */

import {
  BASELINE_EVIDENCE_SOURCES,
  BASELINE_KNOWLEDGE_ARTICLES,
} from './evidence-catalog'
import type {
  ClinicalEvidenceFilter,
  ClinicalEvidenceSource,
  ClinicalKnowledgeArticle,
  GuidelineApprovalStatus,
} from './types'

export class ClinicalEvidenceService {
  private static inMemoryEvidence: Map<string, ClinicalEvidenceSource> = new Map()
  private static inMemoryArticles: Map<string, ClinicalKnowledgeArticle> = new Map()

  private static ensureInitialized(): void {
    if (this.inMemoryEvidence.size === 0) {
      for (const e of BASELINE_EVIDENCE_SOURCES) {
        this.inMemoryEvidence.set(e.id, { ...e })
      }
    }
    if (this.inMemoryArticles.size === 0) {
      for (const a of BASELINE_KNOWLEDGE_ARTICLES) {
        this.inMemoryArticles.set(a.id, { ...a })
      }
    }
  }

  public static resetForTesting(): void {
    this.inMemoryEvidence.clear()
    this.inMemoryArticles.clear()
    this.ensureInitialized()
  }

  // ==========================================================================
  // EVIDENCE SOURCE QUERIES & SEARCH
  // ==========================================================================

  public static async getAllEvidenceSources(): Promise<ClinicalEvidenceSource[]> {
    this.ensureInitialized()
    return Array.from(this.inMemoryEvidence.values())
  }

  public static async getEvidenceById(id: string): Promise<ClinicalEvidenceSource | null> {
    this.ensureInitialized()
    return this.inMemoryEvidence.get(id) ?? null
  }

  public static async getEvidenceByCode(code: string): Promise<ClinicalEvidenceSource | null> {
    this.ensureInitialized()
    for (const e of this.inMemoryEvidence.values()) {
      if (e.code.toLowerCase() === code.toLowerCase()) {
        return e
      }
    }
    return null
  }

  public static async searchEvidence(
    filter?: ClinicalEvidenceFilter
  ): Promise<ClinicalEvidenceSource[]> {
    this.ensureInitialized()
    let results = Array.from(this.inMemoryEvidence.values())

    if (!filter) return results

    if (filter.topic) {
      results = results.filter((e) => e.primaryTopic === filter.topic)
    }
    if (filter.sourceType) {
      results = results.filter((e) => e.sourceType === filter.sourceType)
    }
    if (filter.evidenceTier) {
      results = results.filter((e) => e.evidenceTier === filter.evidenceTier)
    }
    if (filter.jurisdiction) {
      results = results.filter((e) => e.jurisdiction === filter.jurisdiction)
    }
    if (filter.approvalStatus) {
      results = results.filter((e) => e.approvalStatus === filter.approvalStatus)
    }
    if (filter.approvedForBangladeshOnly) {
      results = results.filter((e) => e.approvedForBangladesh === true)
    }
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase().trim()
      results = results.filter(
        (e) =>
          e.titleEn.toLowerCase().includes(q) ||
          e.titleBn.toLowerCase().includes(q) ||
          e.issuingOrganization.toLowerCase().includes(q) ||
          e.summaryEn.toLowerCase().includes(q) ||
          e.summaryBn.toLowerCase().includes(q) ||
          e.publicationReference.toLowerCase().includes(q) ||
          (e.doi && e.doi.toLowerCase().includes(q))
      )
    }

    return results
  }

  // ==========================================================================
  // KNOWLEDGE ARTICLES QUERIES
  // ==========================================================================

  public static async getAllKnowledgeArticles(): Promise<ClinicalKnowledgeArticle[]> {
    this.ensureInitialized()
    return Array.from(this.inMemoryArticles.values())
  }

  public static async getArticleBySlug(slug: string): Promise<ClinicalKnowledgeArticle | null> {
    this.ensureInitialized()
    for (const a of this.inMemoryArticles.values()) {
      if (a.slug.toLowerCase() === slug.toLowerCase()) {
        return a
      }
    }
    return null
  }

  public static async getArticlesByTopic(topic: string): Promise<ClinicalKnowledgeArticle[]> {
    this.ensureInitialized()
    return Array.from(this.inMemoryArticles.values()).filter(
      (a) => a.topic.toLowerCase() === topic.toLowerCase()
    )
  }

  // ==========================================================================
  // GOVERNANCE & APPROVAL WORKFLOW
  // ==========================================================================

  public static async updateGuidelineApprovalStatus(
    evidenceId: string,
    newStatus: GuidelineApprovalStatus,
    reviewerId: string,
    notes?: string
  ): Promise<ClinicalEvidenceSource> {
    this.ensureInitialized()
    const item = this.inMemoryEvidence.get(evidenceId)
    if (!item) {
      throw new Error(`Clinical evidence source with ID "${evidenceId}" not found.`)
    }

    item.approvalStatus = newStatus
    item.lastReviewedDate = new Date().toISOString().split('T')[0]
    item.updatedAt = new Date().toISOString()
    if (notes) {
      item.metadata = {
        ...(item.metadata ?? {}),
        lastReviewerId: reviewerId,
        reviewNotes: notes,
      }
    }

    this.inMemoryEvidence.set(item.id, item)
    return item
  }
}

