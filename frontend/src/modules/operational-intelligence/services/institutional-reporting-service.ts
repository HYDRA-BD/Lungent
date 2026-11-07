/**
 * Phase 2.10: Institutional Reporting Service
 * Consolidates facility-level service utilization, screening eligibility distributions,
 * worker productivity logs, and geographic operational summaries with k-anonymity privacy safeguards.
 */

import type {
  InstitutionalReportRecord,
  InstitutionalReportFilter,
  FacilityUtilizationSummary,
  WorkerActivityReportItem,
  GeographicOperationalSummary,
} from '../types'

export const BANGLADESH_DIVISIONS_DATA: Array<{
  division: string
  divisionBn: string
  districtCount: number
  basePatients: number
  baseAssessments: number
  baseFacilities: number
  meanPm25: number
}> = [
  { division: 'Dhaka', divisionBn: 'ঢাকা', districtCount: 13, basePatients: 4200, baseAssessments: 3890, baseFacilities: 24, meanPm25: 78.4 },
  { division: 'Chattogram', divisionBn: 'চট্টগ্রাম', districtCount: 11, basePatients: 2950, baseAssessments: 2710, baseFacilities: 18, meanPm25: 64.2 },
  { division: 'Rajshahi', divisionBn: 'রাজশাহী', districtCount: 8, basePatients: 1850, baseAssessments: 1690, baseFacilities: 12, meanPm25: 58.6 },
  { division: 'Khulna', divisionBn: 'খুলনা', districtCount: 10, basePatients: 1620, baseAssessments: 1480, baseFacilities: 10, meanPm25: 52.1 },
  { division: 'Rangpur', divisionBn: 'রংপুর', districtCount: 8, basePatients: 1340, baseAssessments: 1210, baseFacilities: 8, meanPm25: 48.9 },
  { division: 'Sylhet', divisionBn: 'সিলেট', districtCount: 4, basePatients: 1120, baseAssessments: 1040, baseFacilities: 7, meanPm25: 44.3 },
  { division: 'Barishal', divisionBn: 'বরিশাল', districtCount: 6, basePatients: 890, baseAssessments: 810, baseFacilities: 6, meanPm25: 41.5 },
  { division: 'Mymensingh', divisionBn: 'ময়মনসিংহ', districtCount: 4, basePatients: 960, baseAssessments: 880, baseFacilities: 6, meanPm25: 54.7 },
]

export class InstitutionalReportingService {
  /**
   * Generates a comprehensive institutional operational report record
   */
  public static generateReport(filter: InstitutionalReportFilter): InstitutionalReportRecord {
    const reportRef = `INST-REP-${filter.startDate.replace(/[^0-9]/g, '')}-${Math.floor(Math.random() * 9000 + 1000)}`

    // Mock/Configured institutional facilities for demonstration and testing
    const defaultFacilities: FacilityUtilizationSummary[] = [
      {
        facilityId: 'fac-nicrh-dhaka',
        facilityName: 'National Institute of Cancer Research & Hospital (NICRH)',
        facilityTier: 'national_specialized',
        division: 'Dhaka',
        district: 'Dhaka',
        totalRegisteredPatients: 1850,
        totalAssessmentsConducted: 1720,
        activeHealthcareWorkers: 18,
        completedReviews: 1640,
        pendingReviews: 80,
        meanReviewTurnaroundHours: 14.5,
        referralsInitiated: 420,
        referralsCompleted: 395,
        referralResolutionRatePct: 94.0,
        dataCompletenessPct: 98.2,
      },
      {
        facilityId: 'fac-dmch-dhaka',
        facilityName: 'Dhaka Medical College Hospital (DMCH)',
        facilityTier: 'tertiary_medical_college',
        division: 'Dhaka',
        district: 'Dhaka',
        totalRegisteredPatients: 1420,
        totalAssessmentsConducted: 1310,
        activeHealthcareWorkers: 14,
        completedReviews: 1205,
        pendingReviews: 105,
        meanReviewTurnaroundHours: 19.8,
        referralsInitiated: 310,
        referralsCompleted: 282,
        referralResolutionRatePct: 91.0,
        dataCompletenessPct: 95.6,
      },
      {
        facilityId: 'fac-narayanganj-dh',
        facilityName: 'Narayanganj 300 Bed General Hospital',
        facilityTier: 'district_hospital',
        division: 'Dhaka',
        district: 'Narayanganj',
        totalRegisteredPatients: 840,
        totalAssessmentsConducted: 790,
        activeHealthcareWorkers: 8,
        completedReviews: 710,
        pendingReviews: 80,
        meanReviewTurnaroundHours: 26.4,
        referralsInitiated: 180,
        referralsCompleted: 154,
        referralResolutionRatePct: 85.6,
        dataCompletenessPct: 92.4,
      },
      {
        facilityId: 'fac-shibganj-uhc',
        facilityName: 'Shibganj Upazila Health Complex',
        facilityTier: 'upazila_health_complex',
        division: 'Rajshahi',
        district: 'Bogura',
        totalRegisteredPatients: 410,
        totalAssessmentsConducted: 395,
        activeHealthcareWorkers: 5,
        completedReviews: 360,
        pendingReviews: 35,
        meanReviewTurnaroundHours: 32.1,
        referralsInitiated: 95,
        referralsCompleted: 78,
        referralResolutionRatePct: 82.1,
        dataCompletenessPct: 89.5,
      },
    ]

    // Filter facilities if specified
    let filteredFacilities = defaultFacilities
    if (filter.facilityId) {
      filteredFacilities = filteredFacilities.filter(f => f.facilityId === filter.facilityId)
    }
    if (filter.facilityTier) {
      filteredFacilities = filteredFacilities.filter(f => f.facilityTier === filter.facilityTier)
    }
    if (filter.division) {
      filteredFacilities = filteredFacilities.filter(f => f.division.toLowerCase() === filter.division?.toLowerCase())
    }

    const workerSummaries: WorkerActivityReportItem[] = [
      {
        workerId: 'chw-001',
        workerName: 'Nasrin Akter (CHW)',
        facilityId: 'fac-nicrh-dhaka',
        facilityName: 'NICRH',
        assessmentsConducted: 142,
        patientsRegistered: 165,
        referralsAssisted: 38,
        lastActiveTimestamp: new Date().toISOString(),
        averageAssessmentDurationMinutes: 14.2,
      },
      {
        workerId: 'chw-002',
        workerName: 'Md. Tareq Aziz (Community Health Worker)',
        facilityId: 'fac-narayanganj-dh',
        facilityName: 'Narayanganj 300 Bed Hospital',
        assessmentsConducted: 98,
        patientsRegistered: 112,
        referralsAssisted: 24,
        lastActiveTimestamp: new Date().toISOString(),
        averageAssessmentDurationMinutes: 16.5,
      },
    ]

    return {
      id: `rep-${Date.now()}`,
      reportReference: reportRef,
      facilityId: filter.facilityId || null,
      reportingPeriodStart: filter.startDate,
      reportingPeriodEnd: filter.endDate,
      reportCategory: filter.category || 'institutional_summary',
      title: `Institutional Operational Intelligence Report (${filter.startDate} to ${filter.endDate})`,
      utilizationSummaries: filteredFacilities,
      workerSummaries,
      screeningEligibilityCounts: {
        eligible: 642,
        ineligible: 1890,
        requiresClinicalReview: 318,
      },
      environmentalContextSummary: {
        meanPm25: 68.5,
        hotspotDistricts: ['Dhaka', 'Narayanganj', 'Gazipur'],
      },
      generatedAt: new Date().toISOString(),
      status: 'final',
    }
  }

  /**
   * Generates geographic intelligence summaries across Bangladesh divisions with privacy protection (k >= 5)
   */
  public static getGeographicSummaries(kThreshold = 5): GeographicOperationalSummary[] {
    return BANGLADESH_DIVISIONS_DATA.map(d => {
      const isSuppressed = d.baseAssessments > 0 && d.baseAssessments < kThreshold

      return {
        division: d.division,
        divisionBn: d.divisionBn,
        districtCount: d.districtCount,
        totalRegisteredPatients: isSuppressed ? 0 : d.basePatients,
        totalAssessments: isSuppressed ? 0 : d.baseAssessments,
        activeFacilities: d.baseFacilities,
        meanPm25Exposure: d.meanPm25,
        screeningEligibilityRatePct: 22.4,
        referralResolutionRatePct: 88.6,
        isSuppressedForPrivacy: isSuppressed,
      }
    })
  }
}

