import { describe, it, expect, beforeEach } from 'vitest'
import { evaluatePatientRecordCompleteness } from '@/modules/healthcare-worker/completion-evaluator'
import { HealthcareWorkerService } from '@/modules/healthcare-worker/service'
import {
  initiateAssessmentSchema,
  createWorkerTaskSchema,
  updateWorkerTaskStatusSchema,
  switchActiveFacilitySchema,
} from '@/modules/healthcare-worker/validation'
import type { Patient } from '@/modules/patients/types'
import type { ComprehensivePatientHealthRecord } from '@/modules/health-records/types'

describe('Healthcare Worker Workspace - Completion Evaluator', () => {
  const mockMinimalPatient: Patient = {
    id: 'pat-test-001',
    patientId: 'LGT-2026-TEST01',
    fullName: 'Test Patient',
    dateOfBirth: null,
    approximateAge: null,
    gender: 'unspecified',
    phoneNumber: null,
    phoneNumberNormalized: null,
    email: null,
    nidNumber: null,
    nidHash: null,
    addressDivision: null,
    addressDistrict: null,
    addressUpazila: null,
    addressDetails: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    emergencyContactRelation: null,
    preferredLanguage: 'en',
    verificationStatus: 'unverified',
    verifiedBy: null,
    verifiedAt: null,
    verificationSource: null,
    accountAssociationStatus: 'unlinked',
    associatedUserProfileId: null,
    associatedAt: null,
    createdBy: 'staff-chw-01',
    primaryFacilityId: 'facility-dhaka-central',
    status: 'active',
    mergedIntoPatientId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  it('evaluates completely empty patient record as incomplete (< 50%)', () => {
    const status = evaluatePatientRecordCompleteness(mockMinimalPatient, null)
    expect(status.completionScore).toBe(0)
    expect(status.status).toBe('incomplete')
    expect(status.missingSections.length).toBeGreaterThan(0)

    const criticalItems = status.missingSections.filter((s) => s.isCritical)
    expect(criticalItems.some((s) => s.key === 'missing_age')).toBe(true)
    expect(criticalItems.some((s) => s.key === 'missing_smoking_status')).toBe(true)
    expect(criticalItems.some((s) => s.key === 'missing_symptoms')).toBe(true)
  })

  it('rewards full 25% smoking weight for confirmed never-smokers', () => {
    const patientWithAge: Patient = {
      ...mockMinimalPatient,
      approximateAge: 45,
      gender: 'male',
      phoneNumber: '01711223344',
    }
    const recordWithNeverSmoker: ComprehensivePatientHealthRecord = {
      patientId: patientWithAge.id,
      medicalConditions: [],
      medications: [],
      allergies: [],
      smokingHistory: {
        id: 'smk-01',
        patientId: patientWithAge.id,
        smokingStatus: 'never',
        tobaccoType: 'cigarettes',
        secondhandSmokeExposure: false,
        isCurrent: false,
        dataSource: 'healthcare_worker_entered',
        verificationStatus: 'unverified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      environmentalExposures: [],
      familyHistory: [],
      lifestyle: null,
      measurements: [],
      symptoms: [],
      reviews: [],
      lastUpdated: new Date().toISOString(),
    }

    const res = evaluatePatientRecordCompleteness(patientWithAge, recordWithNeverSmoker)
    // 20% (demographics) + 25% (never smoker) = 45%
    expect(res.completionScore).toBe(45)
    expect(res.status).toBe('incomplete')
    expect(res.missingSections.some((s) => s.key === 'missing_smoking_status')).toBe(false)
  })

  it('achieves complete status (>= 80%) when required clinical factors are present', () => {
    const fullPatient: Patient = {
      ...mockMinimalPatient,
      dateOfBirth: '1975-01-01',
      approximateAge: 51,
      gender: 'female',
      phoneNumber: '01711223344',
    }

    const fullRecord: ComprehensivePatientHealthRecord = {
      patientId: fullPatient.id,
      medicalConditions: [
        {
          id: 'c-1',
          patientId: fullPatient.id,
          conditionName: 'Asthma',
          conditionCategory: 'respiratory',
          clinicalStatus: 'active',
          isPrimaryRespiratory: true,
          isActive: true,
          dataSource: 'healthcare_worker_entered',
          verificationStatus: 'unverified',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      medications: [],
      allergies: [],
      smokingHistory: {
        id: 'smk-02',
        patientId: fullPatient.id,
        smokingStatus: 'current',
        tobaccoType: 'bidi',
        calculatedPackYears: 20,
        yearsSmoked: 20,
        secondhandSmokeExposure: true,
        isCurrent: true,
        dataSource: 'healthcare_worker_entered',
        verificationStatus: 'unverified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      measurements: [
        {
          id: 'm-1',
          patientId: fullPatient.id,
          measurementType: 'height',
          numericValue: 165,
          unit: 'cm',
          isCalculated: false,
          measuredAt: new Date().toISOString(),
          dataSource: 'healthcare_worker_entered',
          verificationStatus: 'unverified',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'm-2',
          patientId: fullPatient.id,
          measurementType: 'weight',
          numericValue: 62,
          unit: 'kg',
          isCalculated: false,
          measuredAt: new Date().toISOString(),
          dataSource: 'healthcare_worker_entered',
          verificationStatus: 'unverified',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'm-3',
          patientId: fullPatient.id,
          measurementType: 'blood_pressure_combined',
          numericValue: 120,
          unit: 'mmHg',
          secondaryValue: 80,
          isCalculated: false,
          measuredAt: new Date().toISOString(),
          dataSource: 'healthcare_worker_entered',
          verificationStatus: 'unverified',
          createdAt: new Date().toISOString(),
        },
      ],
      symptoms: [
        {
          id: 'sym-1',
          patientId: fullPatient.id,
          symptomName: 'cough',
          isPresent: true,
          progression: 'worsening',
          severity: 'moderate',
          clinicalObservationType: 'reported',
          isActive: true,
          dataSource: 'healthcare_worker_entered',
          verificationStatus: 'unverified',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      environmentalExposures: [
        {
          id: 'exp-1',
          patientId: fullPatient.id,
          exposureCategory: 'indoor_biomass',
          exposureType: 'Wood smoke cooking',
          intensity: 'high',
          isCurrent: true,
          dataSource: 'healthcare_worker_entered',
          verificationStatus: 'unverified',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      familyHistory: [
        {
          id: 'fam-1',
          patientId: fullPatient.id,
          relationship: 'parent',
          conditionType: 'lung_cancer',
          dataSource: 'healthcare_worker_entered',
          verificationStatus: 'unverified',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      lifestyle: null,
      reviews: [],
      lastUpdated: new Date().toISOString(),
    }

    const res = evaluatePatientRecordCompleteness(fullPatient, fullRecord)
    expect(res.completionScore).toBe(100)
    expect(res.status).toBe('complete')
    expect(res.missingSections).toHaveLength(0)
  })
})

describe('Healthcare Worker Workspace - HealthcareWorkerService', () => {
  beforeEach(async () => {
    // Reset facility preference to default
    await HealthcareWorkerService.setActiveFacilityPreference(
      'staff-chw-01',
      'facility-dhaka-central'
    )
  })

  it('manages active facility preferences accurately', async () => {
    const pref1 = await HealthcareWorkerService.getActiveFacilityPreference('staff-chw-01')
    expect(pref1).toBe('facility-dhaka-central')

    await HealthcareWorkerService.setActiveFacilityPreference(
      'staff-chw-01',
      'facility-chittagong-metro'
    )
    const pref2 = await HealthcareWorkerService.getActiveFacilityPreference('staff-chw-01')
    expect(pref2).toBe('facility-chittagong-metro')
  })

  it('retrieves operational dashboard summary metrics', async () => {
    const summary = await HealthcareWorkerService.getDashboardSummary(
      'staff-chw-01',
      'facility-dhaka-central'
    )

    expect(summary.totalAssignedPatients).toBeGreaterThanOrEqual(1)
    expect(summary.assignedPatientsCount).toBe(summary.totalAssignedPatients)
    expect(summary.activeAssessmentsCount).toBeGreaterThanOrEqual(0)
    expect(summary.pendingTasksCount).toBeGreaterThanOrEqual(0)
  })

  it('initiates assessment workflow with safety status and notes without clinical rules', async () => {
    const item = await HealthcareWorkerService.initiateAssessmentWorkflow(
      '11111111-1111-4111-a111-111111111111',
      {
        assessmentType: 'lung_cancer_risk',
        priority: 'urgent',
        facilityId: 'facility-dhaka-central',
        preliminaryNotes: 'Patient has 30 pack-year smoking history and reports persistent hemoptysis.',
      },
      'staff-chw-01',
      'facility-dhaka-central'
    )

    expect(item.id).toBeDefined()
    expect(item.status).toBe('in_progress')
    expect(item.assessmentType).toBe('lung_cancer_risk')
    expect(item.isReviewedByClinician).toBe(false)
    expect(item.summary).toContain('hemoptysis')

    // Confirm it appears in worker assessments queue
    const assessments = await HealthcareWorkerService.getWorkerAssessments('facility-dhaka-central')
    expect(assessments.some((a) => a.id === item.id)).toBe(true)
  })

  it('creates and toggles operational task statuses', async () => {
    const newTask = await HealthcareWorkerService.createWorkerTask(
      {
        title: 'Verify tobacco consumption pack-years',
        taskType: 'intake_completion',
        priority: 'high',
        facilityId: 'facility-dhaka-central',
        patientId: '11111111-1111-4111-a111-111111111111',
        description: 'Call patient to verify bidi count per day.',
      },
      'staff-chw-01'
    )

    expect(newTask.id).toBeDefined()
    expect(newTask.status).toBe('pending')

    const updated = await HealthcareWorkerService.updateWorkerTaskStatus(
      newTask.id,
      'completed',
      'staff-chw-01'
    )
    expect(updated.status).toBe('completed')
    expect(updated.completedAt).toBeDefined()
  })

  it('filters incomplete patient profiles queue (< 80%)', async () => {
    const queue = await HealthcareWorkerService.getIncompletePatientsQueue('facility-dhaka-central')
    expect(queue.patients.length).toBeGreaterThanOrEqual(1)

    for (const patient of queue.patients) {
      expect(patient.completionScore).toBeLessThan(80)
      expect(patient.completionStatus).not.toBe('complete')
    }
  })

  it('logs and retrieves recent worker activities', async () => {
    const activities = await HealthcareWorkerService.getWorkerRecentActivities(
      'staff-chw-01',
      'facility-dhaka-central',
      10
    )
    expect(activities.length).toBeGreaterThanOrEqual(1)
    expect(activities[0].createdAt).toBeDefined()
    expect(activities[0].summary).toBeDefined()
  })
})

describe('Healthcare Worker Workspace - Validation Schemas', () => {
  it('validates initiateAssessmentSchema', () => {
    const valid = initiateAssessmentSchema.safeParse({
      assessmentType: 'lung_cancer_risk',
      priority: 'routine',
      facilityId: 'facility-dhaka-central',
      preliminaryNotes: 'Valid notes',
    })
    expect(valid.success).toBe(true)

    const invalidType = initiateAssessmentSchema.safeParse({
      assessmentType: 'invalid_risk_type',
    })
    expect(invalidType.success).toBe(false)
  })

  it('validates createWorkerTaskSchema', () => {
    const valid = createWorkerTaskSchema.safeParse({
      title: 'Follow up on sputum sample',
      taskType: 'followup_call',
      priority: 'urgent',
      facilityId: 'facility-dhaka-central',
    })
    expect(valid.success).toBe(true)

    const emptyTitle = createWorkerTaskSchema.safeParse({
      title: '   ',
      taskType: 'followup_call',
      priority: 'normal',
      facilityId: 'facility-dhaka-central',
    })
    expect(emptyTitle.success).toBe(false)
  })

  it('validates updateWorkerTaskStatusSchema', () => {
    expect(updateWorkerTaskStatusSchema.safeParse({ status: 'completed' }).success).toBe(true)
    expect(updateWorkerTaskStatusSchema.safeParse({ status: 'in_progress' }).success).toBe(true)
    expect(updateWorkerTaskStatusSchema.safeParse({ status: 'unknown_status' }).success).toBe(false)
  })

  it('validates switchActiveFacilitySchema', () => {
    expect(switchActiveFacilitySchema.safeParse({ facilityId: 'fac-123' }).success).toBe(true)
    expect(switchActiveFacilitySchema.safeParse({ facilityId: '' }).success).toBe(false)
  })
})
