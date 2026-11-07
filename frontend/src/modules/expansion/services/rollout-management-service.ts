/**
 * Phase 2.11: Regional Rollout & Deployment Management Service
 * Implements the 8-step phased rollout framework, facility readiness scoring,
 * and deployment gate verification prior to regional or nationwide expansion.
 */

import type { RolloutMilestone, FacilityOnboardingRecord } from '../types'

export const PHASED_ROLLOUT_FRAMEWORK_STEPS: RolloutMilestone[] = [
  {
    stepNumber: 1,
    code: 'STEP-01-PILOT-SIGN-OFF',
    titleEn: 'Pilot Review & Critical Finding Remediation',
    titleBn: 'পাইলট পর্যালোচনা ও জরুরি সমস্যা সমাধান',
    isCompleted: true,
    completedAt: '2026-10-15T00:00:00.000Z',
    responsibleAuthority: 'Clinical Advisory Board & Technical Leads',
    verificationRequirements: ['100% Phase 1.27 pilot findings addressed', 'Safety invariants verified in staging'],
  },
  {
    stepNumber: 2,
    code: 'STEP-02-SITE-SELECTION',
    titleEn: 'Regional Site Selection & Environmental Audit',
    titleBn: 'আঞ্চলিক কেন্দ্র নির্বাচন ও পরিবেশগত নিরীক্ষা',
    isCompleted: true,
    completedAt: '2026-10-22T00:00:00.000Z',
    responsibleAuthority: 'DGHS Planning Directorate',
    verificationRequirements: ['Division-level facility directory mapped', 'Ambient air PM2.5 hotspots identified'],
  },
  {
    stepNumber: 3,
    code: 'STEP-03-ADMIN-ONBOARDING',
    titleEn: 'Facility Profile & Administrative Provisioning',
    titleBn: 'কেন্দ্রের বিবরণ ও প্রশাসনিক প্রস্তুতি',
    isCompleted: true,
    completedAt: '2026-10-30T00:00:00.000Z',
    responsibleAuthority: 'Regional Health Administrators',
    verificationRequirements: ['Facility Admin accounts verified', 'CHW intake credentials provisioned'],
  },
  {
    stepNumber: 4,
    code: 'STEP-04-INTEGRATION-VALIDATION',
    titleEn: 'Sandbox FHIR, DICOM & Interop Verification',
    titleBn: 'স্যান্ডবক্স ফায়ার, ডাইকম ও আন্তঃসংযোগ যাচাই',
    isCompleted: true,
    completedAt: '2026-11-05T00:00:00.000Z',
    responsibleAuthority: 'Health Informatics & Interoperability Team',
    verificationRequirements: ['NICRH LIS HL7 ping verified', 'DGHS PACS CT bridge latency < 50ms'],
  },
  {
    stepNumber: 5,
    code: 'STEP-05-CONTROLLED-REGIONAL',
    titleEn: 'Controlled Regional Pilot Intake (Dhaka Division)',
    titleBn: 'নিয়ন্ত্রিত আঞ্চলিক পাইলট গ্রহণ (ঢাকা বিভাগ)',
    isCompleted: true,
    completedAt: '2026-11-06T00:00:00.000Z',
    responsibleAuthority: 'Dhaka Regional Health Consortium',
    verificationRequirements: ['First 500 regional assessments monitored', 'Zero unauthorized PHI disclosure'],
  },
  {
    stepNumber: 6,
    code: 'STEP-06-SAFETY-MONITORING',
    titleEn: 'Operational & Clinical Safety Review',
    titleBn: 'কার্যক্রম ও ক্লিনিক্যাল নিরাপত্তা পর্যালোচনা',
    isCompleted: false,
    responsibleAuthority: 'DGHS Clinical Safety Committee',
    verificationRequirements: ['Turnaround efficiency < 24h across hubs', '0.0% unreviewed risk alteration leakage'],
  },
  {
    stepNumber: 7,
    code: 'STEP-07-RETROSPECTIVE',
    titleEn: 'Divisional Performance & Governance Review',
    titleBn: 'বিভাগীয় পারফরম্যান্স ও প্রশাসনিক মূল্যায়ন',
    isCompleted: false,
    responsibleAuthority: 'MOHFW Directorate General of Health Services',
    verificationRequirements: ['Regional benchmark scorecards reviewed', 'Capacity bottlenecks resolved'],
  },
  {
    stepNumber: 8,
    code: 'STEP-08-NATIONWIDE-AUTHORIZATION',
    titleEn: 'DGHS Nationwide Phase Expansion Authorization',
    titleBn: 'ডিজিএইচএস দেশব্যাপী সম্প্রসারণ অনুমোদন',
    isCompleted: false,
    responsibleAuthority: 'Ministry of Health & Family Welfare (MOHFW)',
    verificationRequirements: ['Formal executive authorization granted', 'Nationwide scale verification certified'],
  },
]

export class RolloutManagementService {
  /**
   * Retrieves all phased rollout framework milestones
   */
  public static getRolloutMilestones(): RolloutMilestone[] {
    return PHASED_ROLLOUT_FRAMEWORK_STEPS
  }

  /**
   * Evaluates overall expansion readiness scorecard across onboarded facilities
   */
  public static evaluateExpansionReadiness(
    facilities: FacilityOnboardingRecord[]
  ): {
    totalFacilities: number
    activeFacilities: number
    pendingVerificationFacilities: number
    meanReadinessScore: number
    completedMilestonesCount: number
    totalMilestonesCount: number
    isNationwideRolloutAuthorized: boolean
    readinessStatusEn: string
    readinessStatusBn: string
  } {
    const totalFacilities = facilities.length
    const activeFacilities = facilities.filter(f => f.onboardingStatus === 'active').length
    const pendingVerificationFacilities = facilities.filter(
      f => f.onboardingStatus === 'pending_verification'
    ).length

    const sumReadiness = facilities.reduce((acc, f) => acc + f.readinessScore, 0)
    const meanReadinessScore = totalFacilities > 0 ? Math.round(sumReadiness / totalFacilities) : 0

    const completedMilestones = PHASED_ROLLOUT_FRAMEWORK_STEPS.filter(m => m.isCompleted).length
    const totalMilestones = PHASED_ROLLOUT_FRAMEWORK_STEPS.length

    // Nationwide expansion requires all 8 steps completed and mean readiness >= 80%
    const isNationwideRolloutAuthorized =
      completedMilestones === totalMilestones && meanReadinessScore >= 80

    return {
      totalFacilities,
      activeFacilities,
      pendingVerificationFacilities,
      meanReadinessScore,
      completedMilestonesCount: completedMilestones,
      totalMilestonesCount: totalMilestones,
      isNationwideRolloutAuthorized,
      readinessStatusEn: isNationwideRolloutAuthorized
        ? 'Nationwide Expansion Fully Authorized by DGHS'
        : `Controlled Regional Expansion Active (${completedMilestones} of ${totalMilestones} Milestones Completed)`,
      readinessStatusBn: isNationwideRolloutAuthorized
        ? 'ডিজিএইচএস কর্তৃক দেশব্যাপী সম্প্রসারণ সম্পূর্ণরূপে অনুমোদিত'
        : `নিয়ন্ত্রিত আঞ্চলিক সম্প্রসারণ চলমান (${totalMilestones} টির মধ্যে ${completedMilestones} টি ধাপ সম্পন্ন)`,
    }
  }
}

