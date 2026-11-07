import { describe, it, expect } from 'vitest'
import { PatientPortalService } from '@/modules/patient-portal/service'
import {
  updatePatientProfileSchema,
  startAssessmentSchema,
  correctionRequestSchema,
  linkAnonymousSelfCheckSchema,
  updateConsentSchema,
} from '@/modules/patient-portal/validation'

const DEMO_PATIENT_ID = '11111111-1111-4111-a111-111111111111'

describe('Patient Portal Unit Tests', () => {
  describe('PatientPortalService - Dashboard & Profile', () => {
    it('retrieves comprehensive dashboard summary for demo patient', async () => {
      const summary = await PatientPortalService.getDashboardSummary(DEMO_PATIENT_ID)

      expect(summary).toBeDefined()
      expect(summary.patient).toBeDefined()
      expect(summary.patient.patientId).toBe('LGT-2026-8K2M7P')
      expect(summary.profileCompletionPercentage).toBeGreaterThanOrEqual(0)
      expect(summary.profileCompletionPercentage).toBeLessThanOrEqual(100)
      expect(Array.isArray(summary.pendingActions)).toBe(true)
      expect(Array.isArray(summary.upcomingFollowups)).toBe(true)
      expect(typeof summary.activeReferralsCount).toBe('number')
      expect(typeof summary.unreadNotificationsCount).toBe('number')
    })

    it('generates referral follow-up pending action if active referrals exist', async () => {
      const summary = await PatientPortalService.getDashboardSummary(DEMO_PATIENT_ID)

      if (summary.activeReferralsCount > 0) {
        const referralAction = summary.pendingActions.find((a) => a.id === 'act-referral')
        expect(referralAction).toBeDefined()
        expect(referralAction?.actionUrl).toBe('/patient/referrals')
        expect(referralAction?.urgency).toBe('high')
      }
    })

    it('retrieves patient profile by ID', async () => {
      const profile = await PatientPortalService.getPatientProfile(DEMO_PATIENT_ID)

      expect(profile).toBeDefined()
      expect(profile.id).toBe(DEMO_PATIENT_ID)
      expect(profile.patientId).toBe('LGT-2026-8K2M7P')
      expect(profile.fullName).toBe('Md. Rafiqul Islam')
    })

    it('updates permitted profile fields while preserving protected patient ID', async () => {
      const updated = await PatientPortalService.updatePatientProfile(DEMO_PATIENT_ID, {
        phoneNumber: '+880 1711-999888',
        emergencyContactName: 'Fatima Islam',
        emergencyContactRelation: 'Spouse',
      })

      expect(updated).toBeDefined()
      expect(updated.patientId).toBe('LGT-2026-8K2M7P') // Protected ID must never change
      expect(updated.phoneNumber).toBe('+880 1711-999888')
      expect(updated.emergencyContactName).toBe('Fatima Islam')
    })
  })

  describe('PatientPortalService - Assessments & Clinical Safety', () => {
    it('retrieves chronological assessments for patient', async () => {
      const assessments = await PatientPortalService.getAssessments(DEMO_PATIENT_ID)

      expect(Array.isArray(assessments)).toBe(true)
      expect(assessments.length).toBeGreaterThan(0)
      const first = assessments[0]
      expect(first.patientId).toBe(DEMO_PATIENT_ID)
      expect(first.status).toBeDefined()
      expect(first.summary).toBeDefined()
      expect(first.results).toBeDefined()
    })

    it('retrieves a single assessment by ID with limitations and next steps', async () => {
      const assessments = await PatientPortalService.getAssessments(DEMO_PATIENT_ID)
      const targetId = assessments[0].id

      const assessment = await PatientPortalService.getAssessmentById(DEMO_PATIENT_ID, targetId)
      expect(assessment).toBeDefined()
      expect(assessment?.id).toBe(targetId)
      expect(assessment?.limitations).toBeDefined()
      expect(assessment?.nextSteps).toBeDefined()
    })

    it('initiates a new assessment session in progress', async () => {
      const newAsmt = await PatientPortalService.startAssessment(DEMO_PATIENT_ID, {
        assessmentType: 'screening_eligibility',
      })

      expect(newAsmt).toBeDefined()
      expect(newAsmt.id).toMatch(/^asmt-/)
      expect(newAsmt.assessmentType).toBe('screening_eligibility')
      expect(newAsmt.status).toBe('in_progress')
      expect(newAsmt.isReviewedByClinician).toBe(false)
      expect(newAsmt.methodologyVersion).toContain('USPSTF')
    })
  })

  describe('PatientPortalService - Referrals & Documents', () => {
    it('retrieves referrals with destination and clinical guidance', async () => {
      const referrals = await PatientPortalService.getReferrals(DEMO_PATIENT_ID)

      expect(Array.isArray(referrals)).toBe(true)
      expect(referrals.length).toBeGreaterThan(0)
      const ref = referrals[0]
      expect(ref.destinationFacility).toContain('National Institute')
      expect(ref.status).toBe('in_progress')
      expect(ref.instructions).toBeDefined()
    })

    it('retrieves authorized clinical documents and reports', async () => {
      const docs = await PatientPortalService.getDocuments(DEMO_PATIENT_ID)

      expect(Array.isArray(docs)).toBe(true)
      expect(docs.length).toBeGreaterThan(0)
      const doc = docs[0]
      expect(doc.title).toBeDefined()
      expect(doc.documentType).toBe('clinical_summary')
      expect(doc.fileSizeBytes).toBeGreaterThan(0)
    })
  })

  describe('PatientPortalService - Notifications & Read State', () => {
    it('retrieves notifications and toggles read state', async () => {
      const notifs = await PatientPortalService.getNotifications(DEMO_PATIENT_ID)
      expect(Array.isArray(notifs)).toBe(true)
      expect(notifs.length).toBeGreaterThan(0)

      const unread = notifs.find((n) => !n.isRead)
      if (unread) {
        await PatientPortalService.markNotificationRead(DEMO_PATIENT_ID, unread.id)
        const updatedList = await PatientPortalService.getNotifications(DEMO_PATIENT_ID)
        const updated = updatedList.find((n) => n.id === unread.id)
        expect(updated?.isRead).toBe(true)
      }
    })
  })

  describe('PatientPortalService - Consent & Privacy', () => {
    it('retrieves consent history for patient', async () => {
      const consents = await PatientPortalService.getConsents(DEMO_PATIENT_ID)

      expect(Array.isArray(consents)).toBe(true)
      expect(consents.length).toBeGreaterThan(0)

      const mandatory = consents.find((c) => !c.canWithdraw)
      expect(mandatory).toBeDefined()
      expect(mandatory?.isGranted).toBe(true)
    })

    it('prevents withdrawal of mandatory service consent', async () => {
      await expect(
        PatientPortalService.updateConsent(DEMO_PATIENT_ID, 'assessment_terms', false)
      ).rejects.toThrow('Mandatory service consent cannot be withdrawn')
    })

    it('allows toggling optional permissions with audit trail update', async () => {
      const updated = await PatientPortalService.updateConsent(
        DEMO_PATIENT_ID,
        'sms_notifications',
        true
      )

      expect(updated.isGranted).toBe(true)
      expect(updated.consentType).toBe('sms_notifications')
    })

    it('links prior anonymous self-check session with consented provenance', async () => {
      const result = await PatientPortalService.linkAnonymousSelfCheck(
        DEMO_PATIENT_ID,
        'SC-8K2M7P'
      )

      expect(result.success).toBe(true)
      expect(result.assessmentId).toBeDefined()
      expect(result.message).toContain('successfully associated')
    })

    it('rejects empty anonymous session code', async () => {
      const result = await PatientPortalService.linkAnonymousSelfCheck(DEMO_PATIENT_ID, '')
      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid session code')
    })
  })

  describe('Patient Portal Validation Schemas', () => {
    it('validates updatePatientProfileSchema correctly', () => {
      const valid = updatePatientProfileSchema.safeParse({
        fullName: 'Abdur Rahim',
        phoneNumber: '+880 1819-123456',
        email: 'abdur@example.com',
        preferredLanguage: 'bn',
        addressDivision: 'Dhaka',
        addressDistrict: 'Gazipur',
      })
      expect(valid.success).toBe(true)

      const invalidEmail = updatePatientProfileSchema.safeParse({
        email: 'not-an-email',
      })
      expect(invalidEmail.success).toBe(false)
    })

    it('validates startAssessmentSchema correctly', () => {
      const valid = startAssessmentSchema.safeParse({
        assessmentType: 'screening_eligibility',
        consentGiven: true,
      })
      expect(valid.success).toBe(true)

      const invalid = startAssessmentSchema.safeParse({
        assessmentType: 'unsupported_type',
        consentGiven: true,
      })
      expect(invalid.success).toBe(false)

      const noConsent = startAssessmentSchema.safeParse({
        assessmentType: 'screening_eligibility',
        consentGiven: false,
      })
      expect(noConsent.success).toBe(false)
    })

    it('validates correctionRequestSchema correctly', () => {
      const valid = correctionRequestSchema.safeParse({
        category: 'medical_conditions',
        fieldName: 'tuberculosis_history',
        currentValue: 'unconfirmed',
        requestedCorrection: 'Confirmed pulmonary TB in 2018, completed DOTS course',
        justification: 'Hospital discharge certificate provided to clinic',
      })
      expect(valid.success).toBe(true)

      const missingField = correctionRequestSchema.safeParse({
        category: 'allergies',
        requestedCorrection: '',
      })
      expect(missingField.success).toBe(false)
    })

    it('validates linkAnonymousSelfCheckSchema correctly', () => {
      const valid = linkAnonymousSelfCheckSchema.safeParse({
        sessionCode: 'SC-ABC123',
        consentConfirmed: true,
      })
      expect(valid.success).toBe(true)

      const noConsent = linkAnonymousSelfCheckSchema.safeParse({
        sessionCode: 'SC-ABC123',
        consentConfirmed: false,
      })
      expect(noConsent.success).toBe(false)
    })

    it('validates updateConsentSchema correctly', () => {
      const valid = updateConsentSchema.safeParse({
        consentType: 'care_team_sharing',
        isGranted: false,
      })
      expect(valid.success).toBe(true)
    })
  })
})
