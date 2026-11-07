/**
 * Phase 2.12: Country Onboarding & International Readiness Management Service
 * Implements the 12-step phased international expansion rollout framework,
 * readiness scoring across 5 operational categories, and deployment gating.
 */

import type {
  CountryReadinessStep,
  CountryReadinessScorecard,
  ReadinessStepCategory,
} from '../types'

export const DEFAULT_12_STEP_ROLLOUT_FRAMEWORK: CountryReadinessStep[] = [
  { stepNumber: 1, stepName: 'Target Country Selection & Feasibility Analysis', category: 'governance', isCompleted: false },
  { stepNumber: 2, stepName: 'National Healthcare Architecture & Jurisdiction Assessment', category: 'governance', isCompleted: false },
  { stepNumber: 3, stepName: 'Country Profile & Geographic Hierarchy Configuration', category: 'technical', isCompleted: false },
  { stepNumber: 4, stepName: 'National Lung Cancer Clinical Practice Guidelines Retrieval', category: 'clinical', isCompleted: false },
  { stepNumber: 5, stepName: 'Clinical Advisory Board (CAB) Review & Methodology Approval', category: 'clinical', isCompleted: false },
  { stepNumber: 6, stepName: 'Multi-Language Localization & Certified Medical Translation', category: 'technical', isCompleted: false },
  { stepNumber: 7, stepName: 'Environmental Provider & Health Data Interoperability Setup', category: 'technical', isCompleted: false },
  { stepNumber: 8, stepName: 'Regulatory, Privacy & Data Residency Safeguards Sign-Off', category: 'regulatory', isCompleted: false },
  { stepNumber: 9, stepName: 'Local Healthcare Facility Directory & Administrator Onboarding', category: 'operational', isCompleted: false },
  { stepNumber: 10, stepName: 'Controlled Multi-Center Sandbox & Integration Testing', category: 'technical', isCompleted: false },
  { stepNumber: 11, stepName: 'Operational Safety Audit & Pilot Review', category: 'operational', isCompleted: false },
  { stepNumber: 12, stepName: 'Formal Ministry/Health Authority Launch Authorization', category: 'governance', isCompleted: false },
]

export class CountryOnboardingReadinessService {
  private static countrySteps: Map<string, CountryReadinessStep[]> = new Map([
    // Bangladesh: 12 of 12 steps completed (fully active & authorized)
    ['BD', DEFAULT_12_STEP_ROLLOUT_FRAMEWORK.map(s => ({
      ...s,
      isCompleted: true,
      verifiedBy: 'DGHS-CAB-Technical-Lead',
      verifiedAt: '2026-11-06T00:00:00.000Z',
      verificationNotes: 'Fully authorized for national deployment across Bangladesh',
    }))],
    // Malaysia Synthetic Example: 4 of 12 steps completed (feasibility, profile, draft guidelines, technical config)
    ['MY', DEFAULT_12_STEP_ROLLOUT_FRAMEWORK.map(s => ({
      ...s,
      isCompleted: [1, 2, 3, 4].includes(s.stepNumber),
      verifiedBy: [1, 2, 3, 4].includes(s.stepNumber) ? 'Technical-Reviewer-Synthetic' : undefined,
      verificationNotes: [1, 2, 3, 4].includes(s.stepNumber) ? 'Synthetic test configuration completed' : 'Awaiting local regulatory & CAB approvals',
    }))],
  ])

  /**
   * Retrieves readiness steps for a specific country
   */
  public static getReadinessSteps(countryCode: string): CountryReadinessStep[] {
    const normalized = countryCode.trim().toUpperCase()
    if (!this.countrySteps.has(normalized)) {
      // Default to initial uncompleted 12-step template
      return DEFAULT_12_STEP_ROLLOUT_FRAMEWORK.map(s => ({ ...s }))
    }
    return this.countrySteps.get(normalized)!.map(s => ({ ...s }))
  }

  /**
   * Evaluates comprehensive international readiness scorecard
   */
  public static evaluateReadinessScorecard(
    countryCode: string,
    countryName: string,
    steps?: CountryReadinessStep[]
  ): CountryReadinessScorecard {
    const activeSteps = steps || this.getReadinessSteps(countryCode)
    const totalSteps = activeSteps.length
    const completedSteps = activeSteps.filter(s => s.isCompleted).length
    const readinessScorePct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

    // Evaluate categories
    const categories: ReadinessStepCategory[] = ['governance', 'clinical', 'technical', 'regulatory', 'operational']
    const categoryScores: Record<ReadinessStepCategory, { completed: number; total: number; scorePct: number }> = {
      governance: { completed: 0, total: 0, scorePct: 0 },
      clinical: { completed: 0, total: 0, scorePct: 0 },
      technical: { completed: 0, total: 0, scorePct: 0 },
      regulatory: { completed: 0, total: 0, scorePct: 0 },
      operational: { completed: 0, total: 0, scorePct: 0 },
    }

    const unfulfilledPrerequisites: string[] = []

    for (const cat of categories) {
      const catSteps = activeSteps.filter(s => s.category === cat)
      const catCompleted = catSteps.filter(s => s.isCompleted).length
      const catTotal = catSteps.length
      const catPct = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0
      categoryScores[cat] = { completed: catCompleted, total: catTotal, scorePct: catPct }

      for (const s of catSteps) {
        if (!s.isCompleted) {
          unfulfilledPrerequisites.push(`[${cat.toUpperCase()}] Step ${s.stepNumber}: ${s.stepName}`)
        }
      }
    }

    // Invariant: Nationwide/International live deployment is authorized ONLY if 100% of steps are completed
    const isDeploymentAuthorized = completedSteps === totalSteps && unfulfilledPrerequisites.length === 0

    return {
      countryCode: countryCode.toUpperCase(),
      countryName,
      totalSteps,
      completedSteps,
      readinessScorePct,
      isDeploymentAuthorized,
      categoryScores,
      unfulfilledPrerequisites,
    }
  }

  /**
   * Updates an individual readiness step status
   */
  public static updateStepStatus(
    countryCode: string,
    stepNumber: number,
    isCompleted: boolean,
    notes?: string,
    verifiedBy?: string
  ): CountryReadinessStep {
    const normalized = countryCode.trim().toUpperCase()
    const steps = this.getReadinessSteps(normalized)
    const step = steps.find(s => s.stepNumber === stepNumber)
    if (!step) {
      throw new Error(`Step number ${stepNumber} not found in framework`)
    }

    step.isCompleted = isCompleted
    step.verificationNotes = notes
    step.verifiedBy = verifiedBy
    step.verifiedAt = isCompleted ? new Date().toISOString() : undefined

    this.countrySteps.set(normalized, steps)
    return step
  }
}

