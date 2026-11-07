import { describe, it, expect } from 'vitest'
import {
  // Services
  FacilityBenchmarkingService,
  PredictiveForecastingService,
  InstitutionalReportingService,
  ClinicalReportingService,
  CustomReportExporter,
  OperationalIntelligenceService,
  defaultOperationalIntelligenceService,
  BANGLADESH_DIVISIONS_DATA,
  // Types & DTOs
  type RawFacilityActivityInput,
  type HistoricalSeriesPoint,
  type RawClinicalAssessmentInput,
  type CustomReportConfiguration,
  type FacilityUtilizationSummary,
  // Actions
  getInstitutionalReportAction,
  benchmarkFacilitiesAction,
  generateOperationalForecastAction,
  getClinicalSummaryAction,
  getGeographicOperationalSummaryAction,
  exportCustomReportAction,
} from '@/modules/operational-intelligence'

describe('Phase 2.10: Advanced Reporting & Operational Intelligence Suite', () => {
  // ============================================================================
  // 1. Institutional Reporting Service
  // ============================================================================
  describe('Institutional Reporting Service', () => {
    it('generates institutional report with facility utilization, worker logs, and screening counts', () => {
      const report = InstitutionalReportingService.generateReport({
        startDate: '2026-10-01',
        endDate: '2026-10-31',
      })

      expect(report.reportReference).toMatch(/^INST-REP-20261001-/)
      expect(report.utilizationSummaries.length).toBeGreaterThanOrEqual(4)
      expect(report.workerSummaries.length).toBeGreaterThanOrEqual(2)
      expect(report.screeningEligibilityCounts.eligible).toBeGreaterThan(0)
      expect(report.environmentalContextSummary?.hotspotDistricts).toContain('Dhaka')
      expect(report.status).toBe('final')
    })

    it('filters institutional report by facility tier and division', () => {
      const filteredReport = InstitutionalReportingService.generateReport({
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        facilityTier: 'national_specialized',
      })

      expect(filteredReport.utilizationSummaries.length).toBe(1)
      expect(filteredReport.utilizationSummaries[0].facilityTier).toBe('national_specialized')
      expect(filteredReport.utilizationSummaries[0].facilityName).toContain('NICRH')
    })

    it('returns division-level geographic operational summaries and enforces k >= 5 privacy suppression', () => {
      expect(BANGLADESH_DIVISIONS_DATA.length).toBe(8)
      const summaries = InstitutionalReportingService.getGeographicSummaries(5)

      expect(summaries.length).toBe(8)
      const dhaka = summaries.find(s => s.division === 'Dhaka')
      expect(dhaka).toBeDefined()
      expect(dhaka?.totalRegisteredPatients).toBeGreaterThan(1000)
      expect(dhaka?.meanPm25Exposure).toBeGreaterThan(50.0)
      expect(dhaka?.isSuppressedForPrivacy).toBe(false)
    })
  })

  // ============================================================================
  // 2. Facility Performance Benchmarking Service
  // ============================================================================
  describe('Facility Performance Benchmarking Service', () => {
    const sampleFacility1: RawFacilityActivityInput = {
      facilityId: 'fac-001',
      facilityName: 'Dhaka Central Hospital',
      facilityTier: 'district_hospital',
      division: 'Dhaka',
      assessmentsInitiated: 500,
      assessmentsCompleted: 480, // 96% completion
      meanProcessingTimeHours: 12.0,
      meanReviewTurnaroundHours: 16.0,
      referralsInitiated: 120,
      referralsCompleted: 110, // 91.6% referral completion
      activeWorkersCount: 10,
      dataCompletenessPct: 96.0,
    }

    const sampleFacility2: RawFacilityActivityInput = {
      facilityId: 'fac-002',
      facilityName: 'Remote District Hospital',
      facilityTier: 'district_hospital',
      division: 'Rangpur',
      assessmentsInitiated: 150,
      assessmentsCompleted: 105, // 70% completion
      meanProcessingTimeHours: 24.0,
      meanReviewTurnaroundHours: 48.0, // Slower turnaround
      referralsInitiated: 40,
      referralsCompleted: 24, // 60% referral completion
      activeWorkersCount: 4,
      dataCompletenessPct: 82.0,
    }

    it('computes normalized snapshot and composite operational index', () => {
      const snap = FacilityBenchmarkingService.computeSnapshot(sampleFacility1)

      expect(snap.assessmentCompletionRate).toBe(0.96)
      expect(snap.referralCompletionRate).toBeCloseTo(0.917, 2)
      expect(snap.workerProductivityScore).toBe(48.0) // 480 / 10
      expect(snap.compositeOperationalIndex).toBeGreaterThan(80.0)
      expect(snap.operationalStatus).toBe('high_performing')
    })

    it('benchmarks facility cohort within tier and assigns relative ranks and percentiles', () => {
      const comparison = FacilityBenchmarkingService.benchmarkCohort(
        [sampleFacility1, sampleFacility2],
        'district_hospital'
      )

      expect(comparison.facilities.length).toBe(2)
      expect(comparison.tierAverageCompletionRate).toBeGreaterThan(0.8)
      expect(comparison.facilities[0].facilityId).toBe('fac-001')
      expect(comparison.facilities[0].relativeRankInTier).toBe(1)
      expect(comparison.facilities[0].peerTierPercentile).toBe(100)

      expect(comparison.facilities[1].facilityId).toBe('fac-002')
      expect(comparison.facilities[1].relativeRankInTier).toBe(2)
      expect(comparison.facilities[1].peerTierPercentile).toBe(50)
      expect(comparison.facilities[1].operationalStatus).toBe('nominal')
    })
  })

  // ============================================================================
  // 3. Predictive Operational Analytics Service
  // ============================================================================
  describe('Predictive Operational Analytics Service', () => {
    const historicalData: HistoricalSeriesPoint[] = [
      { date: '2026-10-01', value: 40 },
      { date: '2026-10-05', value: 46 },
      { date: '2026-10-10', value: 52 },
      { date: '2026-10-15', value: 60 },
      { date: '2026-10-20', value: 68 },
      { date: '2026-10-25', value: 76 },
      { date: '2026-10-30', value: 84 },
    ]

    it('projects future operational volume with error metrics and confidence bounds', () => {
      const forecast = PredictiveForecastingService.forecastMetric(historicalData, {
        targetMetric: 'assessment_volume',
        forecastHorizonDays: 14,
        operationalCapacityLimit: 120,
      })

      expect(forecast.targetMetric).toBe('assessment_volume')
      expect(forecast.forecastHorizonDays).toBe(14)
      expect(forecast.forecastPoints.length).toBe(14)
      expect(forecast.errorMetrics.meanAbsoluteError).toBeGreaterThanOrEqual(0)
      expect(forecast.errorMetrics.rootMeanSquaredError).toBeGreaterThanOrEqual(0)
      expect(forecast.errorMetrics.meanAbsolutePercentageError).toBeGreaterThanOrEqual(0)

      // First forecast point must be higher than or close to last historical point due to upward trend
      const firstPt = forecast.forecastPoints[0]
      expect(firstPt.projectedValue).toBeGreaterThanOrEqual(80)
      expect(firstPt.upperBound95).toBeGreaterThan(firstPt.projectedValue)
      expect(firstPt.lowerBound95).toBeLessThanOrEqual(firstPt.projectedValue)
    })

    it('detects impending capacity bottleneck when projected volume exceeds capacity limit by > 15%', () => {
      const forecast = PredictiveForecastingService.forecastMetric(historicalData, {
        targetMetric: 'assessment_volume',
        forecastHorizonDays: 14,
        operationalCapacityLimit: 75, // Intentionally lower than peak trend
      })

      expect(forecast.capacityBottleneckDetected).toBe(true)
      expect(forecast.bottleneckDetails).toBeDefined()
      expect(forecast.bottleneckDetails?.operationalCapacityLimit).toBe(75)
      expect(forecast.bottleneckDetails?.excessCapacityPct).toBeGreaterThan(15.0)
      expect(forecast.bottleneckDetails?.recommendedMitigation).toContain('strain')
    })

    it('throws error when historical series has fewer than 5 points', () => {
      expect(() =>
        PredictiveForecastingService.forecastMetric(
          [
            { date: '2026-10-01', value: 10 },
            { date: '2026-10-02', value: 12 },
          ],
          { targetMetric: 'assessment_volume' }
        )
      ).toThrowError(/at least 5 historical data points/)
    })

    it('embeds non-diagnostic operational safety notice in forecast results', () => {
      const forecast = PredictiveForecastingService.forecastMetric(historicalData, {
        targetMetric: 'referral_workload',
      })
      expect(forecast.operationalNoticeEn).toContain('CRITICAL GOVERNANCE NOTICE')
      expect(forecast.operationalNoticeEn).toContain('CANNOT be used to influence individual clinical risk evaluations')
    })
  })

  // ============================================================================
  // 4. Advanced Clinical Reporting Service & Provenance Tracing
  // ============================================================================
  describe('Advanced Clinical Reporting Service', () => {
    const sampleClinicalInput: RawClinicalAssessmentInput = {
      patientId: 'pat-uuid-001',
      patientCanonicalId: 'LG-PAT-2026-8812',
      patientAge: 62,
      patientGender: 'Male',
      district: 'Dhaka',
      isSmoker: true,
      smokingPackYears: 32,
      spO2: 94,
      bloodPressureSystolic: 135,
      bloodPressureDiastolic: 85,
      estimatedRiskScore: 0.048,
      screeningEligibility: 'eligible',
      triageUrgency: 'priority',
      reviewStatus: 'verified_by_clinician',
      reviewingClinicianName: 'Dr. Tariqul Islam, MD',
      historicalScores: [0.038, 0.042],
    }

    it('generates structured clinical report with granular field-level provenance details', () => {
      const report = ClinicalReportingService.generateClinicalSummary(sampleClinicalInput)

      expect(report.patientCanonicalId).toBe('LG-PAT-2026-8812')
      expect(report.riskCategory).toBe('moderate')
      expect(report.screeningEligibility).toBe('eligible')
      expect(report.reviewStatus).toBe('verified_by_clinician')
      expect(report.reviewingClinicianName).toBe('Dr. Tariqul Islam, MD')

      // Verify provenance details
      expect(report.provenanceDetails.length).toBeGreaterThanOrEqual(4)
      const smokerField = report.provenanceDetails.find(p => p.field === 'smoking_history')
      expect(smokerField?.provenance).toBe('patient_reported')

      const spO2Field = report.provenanceDetails.find(p => p.field === 'pulse_oximetry_spO2')
      expect(spO2Field?.provenance).toBe('measured')

      const riskField = report.provenanceDetails.find(p => p.field === 'estimated_risk_score')
      expect(riskField?.provenance).toBe('estimated_model')
    })

    it('detects conflicting or inconsistent clinical inputs', () => {
      const inconsistentInput: RawClinicalAssessmentInput = {
        patientId: 'pat-uuid-002',
        patientCanonicalId: 'LG-PAT-2026-9911',
        patientAge: 55,
        patientGender: 'Female',
        district: 'Chattogram',
        isSmoker: true,
        smokingPackYears: 0, // Inconsistent: smoker with 0 pack years
        spO2: 86, // Severe hypoxia
        triageUrgency: 'routine', // Inconsistent: routine triage with hypoxia
        bloodPressureSystolic: 80,
        bloodPressureDiastolic: 95, // Inconsistent: systolic < diastolic
      }

      const report = ClinicalReportingService.generateClinicalSummary(inconsistentInput)
      expect(report.missingOrConflictingFields.length).toBe(3)
      expect(report.missingOrConflictingFields[0]).toContain('Patient reported as active smoker but pack-years recorded as 0')
      expect(report.missingOrConflictingFields[1]).toContain('SpO2 indicates severe hypoxia (< 90%) but triage urgency is classified as routine')
      expect(report.missingOrConflictingFields[2]).toContain('Systolic BP must be greater than diastolic BP')
    })

    it('evaluates longitudinal risk trends accurately', () => {
      const increasingTrend = ClinicalReportingService.generateClinicalSummary({
        ...sampleClinicalInput,
        estimatedRiskScore: 0.065,
        historicalScores: [0.035, 0.045],
      })
      expect(increasingTrend.longitudinalRiskTrend).toBe('increasing')

      const stableTrend = ClinicalReportingService.generateClinicalSummary({
        ...sampleClinicalInput,
        estimatedRiskScore: 0.045,
        historicalScores: [0.043, 0.044],
      })
      expect(stableTrend.longitudinalRiskTrend).toBe('stable')
    })

    it('embeds mandatory bilingual non-diagnostic notices in clinical report', () => {
      const report = ClinicalReportingService.generateClinicalSummary(sampleClinicalInput)
      expect(report.nonDiagnosticNoticeEn).toContain('NON-DIAGNOSTIC CLINICAL DECISION SUPPORT NOTICE')
      expect(report.nonDiagnosticNoticeBn).toContain('অ-ডায়াগনস্টিক ক্লিনিক্যাল নোটিশ')
    })
  })

  // ============================================================================
  // 5. Custom Report Exporter (CSV & Print-Ready HTML)
  // ============================================================================
  describe('Custom Report Exporter', () => {
    const sampleConfig: CustomReportConfiguration = {
      title: 'Facility Operational Utilization Summary',
      reportCategory: 'facility_utilization',
      selectedMetrics: ['assessments', 'reviews', 'referrals', 'data_quality'],
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      exportFormat: 'csv',
      includeBilingualLabels: true,
    }

    const sampleRows: FacilityUtilizationSummary[] = [
      {
        facilityId: 'fac-101',
        facilityName: 'NICRH Central Hospital',
        facilityTier: 'national_specialized',
        division: 'Dhaka',
        district: 'Dhaka',
        totalRegisteredPatients: 1200,
        totalAssessmentsConducted: 1150,
        activeHealthcareWorkers: 15,
        completedReviews: 1090,
        pendingReviews: 60,
        meanReviewTurnaroundHours: 12.5,
        referralsInitiated: 280,
        referralsCompleted: 265,
        referralResolutionRatePct: 94.6,
        dataCompletenessPct: 98.4,
      },
    ]

    it('generates compliant CSV with headers, data lines, and governance disclaimer', () => {
      const exportDoc = CustomReportExporter.generateCSV(sampleConfig, sampleRows)

      expect(exportDoc.exportFormat).toBe('csv')
      expect(exportDoc.fileName).toContain('.csv')
      expect(exportDoc.fileSizeBytes).toBeGreaterThan(0)
      expect(exportDoc.sha256Digest).toMatch(/^sha256-/)
      expect(exportDoc.content).toContain('Facility ID,Facility Name,Tier,Division')
      expect(exportDoc.content).toContain('NICRH Central Hospital')
      expect(exportDoc.content).toContain('# DISCLAIMER: Generated by Lungent Operational Intelligence Engine')
    })

    it('generates print-ready HTML document with structured table and governance notice', () => {
      const exportDoc = CustomReportExporter.generateHTML(
        { ...sampleConfig, exportFormat: 'html' },
        sampleRows
      )

      expect(exportDoc.exportFormat).toBe('html')
      expect(exportDoc.fileName).toContain('.html')
      expect(exportDoc.content).toContain('<!DOCTYPE html>')
      expect(exportDoc.content).toContain('NICRH Central Hospital')
      expect(exportDoc.content).toContain('CLINICAL GOVERNANCE & PRIVACY NOTICE')
      expect(exportDoc.content).toContain('k >= 5')
    })
  })

  // ============================================================================
  // 6. Operational Intelligence Service Façade & Server Actions
  // ============================================================================
  describe('Operational Intelligence Service Façade & Actions', () => {
    it('instantiates defaultOperationalIntelligenceService singleton', () => {
      expect(defaultOperationalIntelligenceService).toBeDefined()
      expect(defaultOperationalIntelligenceService).toBeInstanceOf(OperationalIntelligenceService)
    })

    it('executes getInstitutionalReportAction successfully', async () => {
      const res = await getInstitutionalReportAction({
        startDate: '2026-10-01',
        endDate: '2026-10-31',
      })

      expect(res.success).toBe(true)
      expect(res.data?.reportReference).toBeDefined()
      expect(res.data?.utilizationSummaries.length).toBeGreaterThan(0)
    })

    it('executes benchmarkFacilitiesAction successfully', async () => {
      const res = await benchmarkFacilitiesAction([
        {
          facilityId: 'f-1',
          facilityName: 'Test Facility',
          facilityTier: 'district_hospital',
          division: 'Dhaka',
          assessmentsInitiated: 100,
          assessmentsCompleted: 95,
          meanProcessingTimeHours: 10,
          meanReviewTurnaroundHours: 12,
          referralsInitiated: 20,
          referralsCompleted: 18,
          activeWorkersCount: 5,
          dataCompletenessPct: 95,
        },
      ])

      expect(res.success).toBe(true)
      expect(res.data?.facilities.length).toBe(1)
      expect(res.data?.facilities[0].compositeOperationalIndex).toBeGreaterThan(70)
    })

    it('executes generateOperationalForecastAction successfully', async () => {
      const res = await generateOperationalForecastAction(
        [
          { date: '2026-10-01', value: 30 },
          { date: '2026-10-05', value: 35 },
          { date: '2026-10-10', value: 40 },
          { date: '2026-10-15', value: 45 },
          { date: '2026-10-20', value: 50 },
          { date: '2026-10-25', value: 55 },
        ],
        { targetMetric: 'assessment_volume', forecastHorizonDays: 7 }
      )

      expect(res.success).toBe(true)
      expect(res.data?.forecastPoints.length).toBe(7)
    })

    it('executes getClinicalSummaryAction successfully', async () => {
      const res = await getClinicalSummaryAction({
        patientId: 'p-1',
        patientCanonicalId: 'LG-PAT-1',
        patientAge: 50,
        patientGender: 'Male',
        district: 'Dhaka',
      })

      expect(res.success).toBe(true)
      expect(res.data?.nonDiagnosticNoticeEn).toBeDefined()
    })

    it('executes getGeographicOperationalSummaryAction successfully', async () => {
      const res = await getGeographicOperationalSummaryAction()
      expect(res.success).toBe(true)
      expect(res.data?.length).toBe(8)
    })

    it('executes exportCustomReportAction successfully', async () => {
      const res = await exportCustomReportAction(
        {
          title: 'Test Export',
          reportCategory: 'institutional_summary',
          selectedMetrics: ['assessments'],
          startDate: '2026-10-01',
          endDate: '2026-10-31',
          exportFormat: 'csv',
          includeBilingualLabels: true,
        },
        []
      )

      expect(res.success).toBe(true)
      expect(res.data?.exportFormat).toBe('csv')
      expect(res.data?.sha256Digest).toBeDefined()
    })
  })
})
