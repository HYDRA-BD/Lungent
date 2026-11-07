import { describe, it, expect } from 'vitest'
import {
  generateCanonicalReferralId,
  isValidReferralId,
} from '@/modules/referrals/referral-id'
import {
  ReferralService,
  FollowUpService,
  DEFAULT_DESTINATION_FACILITY_ID,
  DEFAULT_DESTINATION_FACILITY_NAME,
} from '@/modules/referrals/service'
import {
  createReferralSchema,
  updateReferralStatusSchema,
  rescheduleFollowUpSchema,
} from '@/modules/referrals/validation'

describe('Phase 1.18 — Healthcare Referral and Follow-up Management', () => {
  const mockActorClinician = {
    id: 'usr-clinician-unit-01',
    name: 'Prof. Dr. Farhana Ahmed',
    role: 'clinician',
  }

  const mockActorWorker = {
    id: 'usr-worker-unit-01',
    name: 'Amina Khatun (CHW)',
    role: 'healthcare_worker',
  }

  describe('1. Canonical Referral Identifier Generator', () => {
    it('generates IDs adhering to REF-YYYY-XXXXXX format', () => {
      const id = generateCanonicalReferralId()
      const currentYear = new Date().getFullYear()

      expect(id).toMatch(new RegExp(`^REF-${currentYear}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$`))
      expect(isValidReferralId(id)).toBe(true)
    })

    it('generates distinct IDs on successive calls', () => {
      const id1 = generateCanonicalReferralId()
      const id2 = generateCanonicalReferralId()
      const id3 = generateCanonicalReferralId()

      expect(id1).not.toBe(id2)
      expect(id2).not.toBe(id3)
    })

    it('validates canonical referral IDs correctly and rejects invalid formats', () => {
      expect(isValidReferralId('REF-2026-9K2L4P')).toBe(true)
      expect(isValidReferralId('REF-2026-ABCDEF')).toBe(true)
      expect(isValidReferralId('REF-202-9K2L4P')).toBe(false) // 3-digit year
      expect(isValidReferralId('LGT-2026-9K2L4P')).toBe(false) // wrong prefix
      expect(isValidReferralId('REF-2026-0O1I88')).toBe(false) // contains ambiguous chars (0, O, 1, I)
      expect(isValidReferralId('')).toBe(false)
    })
  })

  describe('2. Zod Validation Schemas', () => {
    it('validates correct referral creation input', () => {
      const valid = createReferralSchema.safeParse({
        patientId: '11111111-1111-4111-a111-111111111111',
        patientCanonicalId: 'LGT-2026-8K2M7P',
        patientName: 'Md. Rafiqul Islam',
        destinationFacilityName: 'National Institute of Diseases of the Chest and Hospital (NIDCH)',
        reason: 'Urgent referral for hemoptysis evaluation lasting 3 weeks',
        priority: 'urgent_2ww',
      })
      expect(valid.success).toBe(true)
    })

    it('rejects referral creation if reason is shorter than 5 characters', () => {
      const invalid = createReferralSchema.safeParse({
        patientId: '11111111-1111-4111-a111-111111111111',
        patientCanonicalId: 'LGT-2026-8K2M7P',
        patientName: 'Md. Rafiqul Islam',
        destinationFacilityName: 'NIDCH',
        reason: 'Flu', // too short (<5)
      })
      expect(invalid.success).toBe(false)
    })

    it('mandates justification reason when rejecting a referral', () => {
      const withoutReason = updateReferralStatusSchema.safeParse({
        referralId: 'ref-001',
        status: 'rejected',
      })
      expect(withoutReason.success).toBe(false)

      const withReason = updateReferralStatusSchema.safeParse({
        referralId: 'ref-001',
        status: 'rejected',
        reason: 'Patient does not meet clinical diagnostic criteria for tertiary intake.',
      })
      expect(withReason.success).toBe(true)
    })

    it('mandates justification reason when rescheduling a follow-up', () => {
      const invalid = rescheduleFollowUpSchema.safeParse({
        followUpId: 'fu-001',
        newDate: '2026-12-10',
        reason: 'No', // <5 chars
      })
      expect(invalid.success).toBe(false)

      const valid = rescheduleFollowUpSchema.safeParse({
        followUpId: 'fu-001',
        newDate: '2026-12-10',
        reason: 'Patient was hospitalized for unrelated glycemic emergency.',
      })
      expect(valid.success).toBe(true)
    })
  })

  describe('3. Referral Lifecycle Management', () => {
    it('creates a new referral with canonical ID and initial submitted status', async () => {
      const referral = await ReferralService.createReferral(
        {
          patientId: '11111111-1111-4111-a111-111111111111',
          patientCanonicalId: 'LGT-2026-8K2M7P',
          patientName: 'Md. Rafiqul Islam',
          destinationFacilityId: DEFAULT_DESTINATION_FACILITY_ID,
          destinationFacilityName: DEFAULT_DESTINATION_FACILITY_NAME,
          destinationDepartment: 'Department of Thoracic Surgery',
          reason: 'Severe hemoptysis with 35 pack-years history requiring urgent bronchoscopy.',
          priority: 'urgent_2ww',
          instructions: 'NPO after midnight for bronchoscopy evaluation.',
        },
        mockActorClinician
      )

      expect(referral).toBeDefined()
      expect(referral.referralId).toMatch(/^REF-\d{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/)
      expect(referral.status).toBe('submitted')
      expect(referral.priority).toBe('urgent_2ww')
      expect(referral.referringProviderId).toBe(mockActorClinician.id)
      expect(referral.statusHistory).toBeDefined()
      expect(referral.statusHistory!.length).toBeGreaterThanOrEqual(1)
      expect(referral.statusHistory![0].toStatus).toBe('submitted')
    })

    it('transitions referral to scheduled with appointment details', async () => {
      const created = await ReferralService.createReferral(
        {
          patientId: '22222222-2222-4222-a222-222222222222',
          patientCanonicalId: 'LGT-2026-3N9P4X',
          patientName: 'Nasima Begum',
          destinationFacilityName: 'National Institute of Cancer Research & Hospital',
          reason: 'Suspected parenchymal lesion on preliminary chest radiograph.',
          priority: 'priority',
        },
        mockActorClinician
      )

      const updated = await ReferralService.updateReferralStatus(
        {
          referralId: created.id,
          status: 'scheduled',
          notes: 'Consultation slot confirmed with thoracic oncology intake desk.',
          appointmentDate: '2026-11-25T10:00:00Z',
          appointmentLocation: 'Outpatient Clinic Room 102',
          instructions: 'Bring all previous sputum smear and radiography films.',
        },
        mockActorClinician
      )

      expect(updated.status).toBe('scheduled')
      expect(updated.appointmentLocation).toBe('Outpatient Clinic Room 102')
      expect(updated.instructions).toBe('Bring all previous sputum smear and radiography films.')

      // Check status history
      const history = updated.statusHistory || []
      const lastHistory = history[history.length - 1]
      expect(lastHistory.fromStatus).toBe('submitted')
      expect(lastHistory.toStatus).toBe('scheduled')
    })

    it('allows assigning a destination clinician to an active referral', async () => {
      const created = await ReferralService.createReferral(
        {
          patientId: '33333333-3333-4333-a333-333333333333',
          patientCanonicalId: 'LGT-2026-7V4Y9Q',
          patientName: 'Kamal Hossain',
          destinationFacilityName: 'BSMMU Respiratory Department',
          reason: 'Assessment of persistent dry cough with significant biomass exposure.',
          priority: 'routine',
        },
        mockActorClinician
      )

      const assigned = await ReferralService.assignReferral(
        {
          referralId: created.id,
          assignedClinicianId: 'usr-bsmmu-dr-rahman',
          assignedClinicianName: 'Dr. Tariqul Rahman',
          appointmentDate: '2026-12-01T11:00:00Z',
        },
        mockActorClinician
      )

      expect(assigned.assignedClinicianId).toBe('usr-bsmmu-dr-rahman')
      expect(assigned.assignedClinicianName).toBe('Dr. Tariqul Rahman')
      expect(assigned.status).toBe('scheduled')
    })

    it('filters referrals by patientId, priority, and text search', async () => {
      const resultsByPatient = await ReferralService.getReferrals({
        patientId: '11111111-1111-4111-a111-111111111111',
      })
      expect(resultsByPatient.length).toBeGreaterThanOrEqual(1)
      expect(resultsByPatient[0].patientId).toBe('11111111-1111-4111-a111-111111111111')

      const urgentResults = await ReferralService.getReferrals({
        priority: 'urgent_2ww',
      })
      expect(urgentResults.every((r) => r.priority === 'urgent_2ww')).toBe(true)

      const searchResults = await ReferralService.getReferrals({
        search: 'Rafiqul',
      })
      expect(searchResults.some((r) => r.patientName.includes('Rafiqul'))).toBe(true)
    })
  })

  describe('4. Follow-up Planning & Execution', () => {
    it('schedules a patient follow-up linked to referral', async () => {
      const followUp = await FollowUpService.scheduleFollowUp(
        {
          patientId: '11111111-1111-4111-a111-111111111111',
          patientCanonicalId: 'LGT-2026-8K2M7P',
          patientName: 'Md. Rafiqul Islam',
          referralId: 'ref-001-uuid',
          referralCanonicalId: 'REF-2026-9K2L4P',
          scheduledDate: '2026-12-15',
          scheduledTime: '10:30 AM',
          purpose: 'post_imaging_review',
          instructions: 'Review low-dose CT results and evaluate persistent dyspnea.',
        },
        mockActorClinician
      )

      expect(followUp).toBeDefined()
      expect(followUp.status).toBe('scheduled')
      expect(followUp.purpose).toBe('post_imaging_review')
      expect(followUp.referralCanonicalId).toBe('REF-2026-9K2L4P')
    })

    it('reschedules a follow-up with mandatory reason and documents history', async () => {
      const created = await FollowUpService.scheduleFollowUp(
        {
          patientId: '22222222-2222-4222-a222-222222222222',
          patientCanonicalId: 'LGT-2026-3N9P4X',
          patientName: 'Nasima Begum',
          scheduledDate: '2026-11-20',
          purpose: 'symptom_reassessment',
        },
        mockActorWorker
      )

      const rescheduled = await FollowUpService.rescheduleFollowUp(
        {
          followUpId: created.id,
          newDate: '2026-12-05',
          newTime: '02:00 PM',
          reason: 'Patient requested postponement due to village agricultural harvest obligations.',
        },
        mockActorWorker
      )

      expect(rescheduled.status).toBe('rescheduled')
      expect(rescheduled.scheduledDate).toBe('2026-12-05')
      expect(rescheduled.rescheduledFromDate).toBe('2026-11-20')
      expect(rescheduled.rescheduledReason).toContain('agricultural harvest')
    })

    it('records follow-up outcome and marks appointment completed', async () => {
      const created = await FollowUpService.scheduleFollowUp(
        {
          patientId: '33333333-3333-4333-a333-333333333333',
          patientCanonicalId: 'LGT-2026-7V4Y9Q',
          patientName: 'Kamal Hossain',
          scheduledDate: '2026-11-18',
          purpose: 'smoking_cessation',
        },
        mockActorClinician
      )

      const completed = await FollowUpService.recordFollowUpOutcome(
        {
          followUpId: created.id,
          status: 'completed',
          outcomeNotes: 'Patient completed 4-week nicotine replacement therapy session; daily cigarettes reduced by 70%.',
        },
        mockActorClinician
      )

      expect(completed.status).toBe('completed')
      expect(completed.completedAt).toBeDefined()
      expect(completed.outcomeNotes).toContain('nicotine replacement')
    })
  })

  describe('5. Privacy Protection & Notification Hooks', () => {
    it('enqueues notification hooks with reference IDs and never raw patient clinical data', async () => {
      await ReferralService.createReferral(
        {
          patientId: '11111111-1111-4111-a111-111111111111',
          patientCanonicalId: 'LGT-2026-8K2M7P',
          patientName: 'Md. Rafiqul Islam',
          destinationFacilityName: 'National Institute of Diseases of the Chest and Hospital (NIDCH)',
          reason: 'Urgent referral for hemoptysis evaluation',
          priority: 'urgent_2ww',
        },
        mockActorClinician
      )

      const queue = ReferralService.getQueuedNotifications()
      expect(queue.length).toBeGreaterThanOrEqual(1)

      const lastNotification = queue[queue.length - 1]
      expect(lastNotification.eventType).toBe('referral_assigned')
      expect(lastNotification.referenceId).toBeDefined()
      // Privacy rule check: message content does not expose diagnostic conclusions
      expect(lastNotification.body).not.toContain('cancer')
      expect(lastNotification.body).not.toContain('malignancy')
    })
  })
})
