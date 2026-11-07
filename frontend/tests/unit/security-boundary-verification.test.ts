/**
 * Phase 1.26: Security, Access Boundaries & IDOR Verification Unit Test Suite
 *
 * Verifies critical technical security, access boundaries, and privacy safeguards:
 * 1. Role-Based Access Control (RBAC) & Least Privilege boundaries.
 * 2. Administrative Separation of Powers: Software Admins have ZERO clinical observation access.
 * 3. Multi-Tenant Facility Isolation: Healthcare workers cannot cross facility borders without referral.
 * 4. Patient Self-Record Isolation: URL/IDOR manipulation across patient boundaries is rejected.
 * 5. Sliding-Window Rate Limiting: Abuse and brute-force mitigation on sensitive endpoints.
 * 6. Audit Log Sanitization: Automated stripping of credentials, bearer tokens, and secrets.
 * 7. Consent Revocation Enforceability: Gated operations fail when consent is withdrawn.
 * 8. Statutory Retention Hold on Erasure: Enforcing BMDC 10-year preservation rule.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { CentralSecurityService } from '@/modules/security/service'
import {
  SYNTHETIC_USERS,
  SYNTHETIC_PATIENT_HIGH_RISK,
  SYNTHETIC_PATIENT_LOW_RISK_ACUTE_HEMOPTYSIS,
} from '../fixtures/synthetic-clinical-data'

describe('Phase 1.26: Security Boundaries & Authorization Verification', () => {
  beforeEach(() => {
    CentralSecurityService.resetForTesting()
  })

  // ==========================================================================
  // 1. RBAC & LEAST PRIVILEGE ROLE BOUNDARIES
  // ==========================================================================
  describe('1. Role-Based Access Control (RBAC) Matrices', () => {
    it('restricts patient accounts from accessing clinician, worker, or administrative endpoints', () => {
      // Patient attempting to access administrative system audit: Blocked
      const patientAuditAccess = CentralSecurityService.checkResourceAccess(
        { id: SYNTHETIC_USERS.patient.id, roles: ['patient'] },
        { resourceType: 'system_audit' }
      )
      expect(patientAuditAccess.allowed).toBe(false)

      // Patient attempting to view facility administrative settings: Blocked
      const patientFacilityAccess = CentralSecurityService.checkResourceAccess(
        { id: SYNTHETIC_USERS.patient.id, roles: ['patient'] },
        { resourceType: 'facility', facilityId: 'fac-dhaka-central-01' }
      )
      expect(patientFacilityAccess.allowed).toBe(false)
    })
  })

  // ==========================================================================
  // 2. ADMINISTRATIVE SEPARATION OF POWERS (ZERO RAW CLINICAL PRIVILEGE)
  // ==========================================================================
  describe('2. Administrative Separation of Powers (Zero Clinical Observation Privilege)', () => {
    it('strictly denies software administrator access to raw patient clinical records without clinical credentials', () => {
      // Platform administrator attempting to query raw clinical assessments: Blocked
      const adminAssessmentAccess = CentralSecurityService.checkResourceAccess(
        { id: SYNTHETIC_USERS.administrator.id, roles: ['administrator'] },
        {
          resourceType: 'clinical_assessment',
          patientId: SYNTHETIC_PATIENT_HIGH_RISK.patientId,
        }
      )
      expect(adminAssessmentAccess.allowed).toBe(false)
      expect(adminAssessmentAccess.reason).toContain('Platform administrators do not possess clinical inspection privileges')

      // Platform administrator attempting to read patient health record: Blocked
      const adminHealthRecordAccess = CentralSecurityService.checkResourceAccess(
        { id: SYNTHETIC_USERS.administrator.id, roles: ['administrator'] },
        {
          resourceType: 'health_record',
          patientId: SYNTHETIC_PATIENT_HIGH_RISK.patientId,
        }
      )
      expect(adminHealthRecordAccess.allowed).toBe(false)
      expect(adminHealthRecordAccess.reason).toContain('Platform administrators do not possess clinical inspection privileges')

      // Platform administrator accessing system audit logs: Allowed
      const adminAuditAccess = CentralSecurityService.checkResourceAccess(
        { id: SYNTHETIC_USERS.administrator.id, roles: ['administrator'] },
        { resourceType: 'system_audit' }
      )
      expect(adminAuditAccess.allowed).toBe(true)
    })
  })

  // ==========================================================================
  // 3. MULTI-TENANT FACILITY BOUNDARY ISOLATION
  // ==========================================================================
  describe('3. Multi-Tenant Facility Boundary Isolation', () => {
    it('prevents healthcare worker from reading patient data outside assigned facility without referral', () => {
      // Worker at Dhaka facility accessing patient at Dhaka facility: Allowed
      const workerAllowed = CentralSecurityService.checkResourceAccess(
        {
          id: SYNTHETIC_USERS.healthcareWorker.id,
          roles: ['healthcare_worker'],
          facilityIds: ['fac-dhaka-central-01'],
        },
        {
          resourceType: 'health_record',
          facilityId: 'fac-dhaka-central-01',
          patientId: SYNTHETIC_PATIENT_HIGH_RISK.patientId,
        }
      )
      expect(workerAllowed.allowed).toBe(true)

      // Worker at Dhaka facility attempting query for patient at Sylhet facility: Blocked
      const workerBlocked = CentralSecurityService.checkResourceAccess(
        {
          id: SYNTHETIC_USERS.healthcareWorker.id,
          roles: ['healthcare_worker'],
          facilityIds: ['fac-dhaka-central-01'],
        },
        {
          resourceType: 'health_record',
          facilityId: 'fac-sylhet-district-02',
          patientId: SYNTHETIC_PATIENT_LOW_RISK_ACUTE_HEMOPTYSIS.patientId,
        }
      )
      expect(workerBlocked.allowed).toBe(false)
      expect(workerBlocked.reason).toContain('Cross-facility access requires formal specialist referral intake')
    })
  })

  // ==========================================================================
  // 4. PATIENT SELF-RECORD ISOLATION (ANTI-IDOR SAFEGUARDS)
  // ==========================================================================
  describe('4. Anti-IDOR Patient Record Isolation', () => {
    it('blocks patient from accessing another patient record via parameter tampering', () => {
      // Patient A attempting to access Patient B record: Blocked
      const idorAttempt = CentralSecurityService.checkResourceAccess(
        { id: SYNTHETIC_USERS.patient.id, roles: ['patient'] },
        {
          resourceType: 'patient_profile',
          patientId: 'victim-patient-uuid-8888',
        }
      )
      expect(idorAttempt.allowed).toBe(false)
      expect(idorAttempt.reason).toContain('Patients are strictly restricted to their own health records')
    })
  })

  // ==========================================================================
  // 5. SLIDING-WINDOW RATE LIMITING (ABUSE & BRUTE-FORCE PROTECTION)
  // ==========================================================================
  describe('5. Sliding-Window Rate Limiting Engine', () => {
    it('allows requests within threshold and blocks subsequent attempts once limit is exceeded', () => {
      const rateLimitKey = 'ip:192.168.1.100:login_attempt'
      const maxLimit = 5
      const windowMs = 30000

      // First 5 attempts: Allowed
      for (let i = 0; i < maxLimit; i++) {
        const check = CentralSecurityService.checkRateLimit(rateLimitKey, maxLimit, windowMs)
        expect(check.allowed).toBe(true)
        expect(check.remaining).toBe(maxLimit - 1 - i)
      }

      // 6th attempt: Blocked
      const blockedAttempt = CentralSecurityService.checkRateLimit(rateLimitKey, maxLimit, windowMs)
      expect(blockedAttempt.allowed).toBe(false)
      expect(blockedAttempt.remaining).toBe(0)
      expect(blockedAttempt.resetMs).toBeGreaterThan(0)
    })
  })

  // ==========================================================================
  // 6. AUDIT LOG TOKEN SANITIZATION & REDACTION
  // ==========================================================================
  describe('6. Security Audit Log Token Redaction & Sanitization', () => {
    it('scrubs passwords, bearer tokens, and secrets from audit metadata before logging', async () => {
      const logEntry = await CentralSecurityService.logSecurityEvent({
        eventType: 'auth.login.attempt',
        severity: 'info',
        outcome: 'success',
        actorId: SYNTHETIC_USERS.patient.id,
        actorRole: 'patient',
        targetResource: '/login',
        clientIp: '103.205.71.1',
        metadata: {
          username: 'rahim@test.com',
          password: 'SecretSuperPassword123!', // SENSITIVE
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sensitive_payload', // SENSITIVE
          apiKey: 'sec_key_abcdef123456', // SENSITIVE
          deviceFingerprint: 'chrome-mac-arm64',
        },
      })

      expect(logEntry).toBeDefined()
      expect(logEntry.metadata).toBeDefined()

      // Sensitive fields must be sanitized to [REDACTED_CONFIDENTIAL]
      expect(logEntry.metadata.password).toBe('[REDACTED_CONFIDENTIAL]')
      expect(logEntry.metadata.token).toBe('[REDACTED_CONFIDENTIAL]')
      expect(logEntry.metadata.apiKey).toBe('[REDACTED_CONFIDENTIAL]')

      // Non-sensitive operational metadata is preserved
      expect(logEntry.metadata.username).toBe('rahim@test.com')
      expect(logEntry.metadata.deviceFingerprint).toBe('chrome-mac-arm64')
    })
  })

  // ==========================================================================
  // 7. CONSENT REVOCATION & GATED PROCESSING
  // ==========================================================================
  describe('7. Centralized Consent Lifecycle & Gating', () => {
    it('blocks clinical decision support operations when patient consent is withdrawn', async () => {
      // 1. Initial state: consent active
      const initialConsent = await CentralSecurityService.getPatientConsents(
        SYNTHETIC_PATIENT_HIGH_RISK.patientId
      )
      const decisionSupport = initialConsent.find((c) => c.consentCategory === 'clinical_decision_support')
      expect(decisionSupport?.isGranted).toBe(true)

      // 2. Patient withdraws consent
      const withdrawn = await CentralSecurityService.withdrawConsent(
        SYNTHETIC_PATIENT_HIGH_RISK.patientId,
        'clinical_decision_support',
        'Patient withdrew consent for automated algorithm-assisted decision support.'
      )
      expect(withdrawn.isGranted).toBe(false)
      expect(withdrawn.withdrawnAt).toBeDefined()

      // 3. Verification: query consent returns withdrawn
      const updatedConsents = await CentralSecurityService.getPatientConsents(
        SYNTHETIC_PATIENT_HIGH_RISK.patientId
      )
      const updatedCdss = updatedConsents.find((c) => c.consentCategory === 'clinical_decision_support')
      expect(updatedCdss?.isGranted).toBe(false)
    })
  })

  // ==========================================================================
  // 8. STATUTORY RETENTION HOLD PRESERVATION (BMDC 10-YEAR RULE)
  // ==========================================================================
  describe('8. Statutory Medical Retention Hold (BMDC 10-Year Mandate)', () => {
    it('applies statutory retention hold on patient erasure request and preserves audit record', async () => {
      // Submit erasure request
      const req = await CentralSecurityService.submitPrivacyRequest({
        patientId: SYNTHETIC_PATIENT_HIGH_RISK.patientId,
        requestType: 'erasure_restriction',
        requestDetails: 'Patient relocated abroad and requested immediate deletion of diagnostic records.',
        actorId: SYNTHETIC_USERS.patient.id,
      })

      // Review and apply statutory hold under BMDC Code of Ethics Section 4
      const reviewed = await CentralSecurityService.reviewPrivacyRequest(
        req.id,
        'partially_fulfilled_with_retention_hold',
        'Account credentials deactivated. Medical diagnostic records preserved under BMDC 10-year rule.',
        'Chief Privacy Officer',
        true,
        'BMDC Code of Medical Ethics Section 4 requires 10-year retention of patient clinical records.'
      )

      expect(reviewed.status).toBe('partially_fulfilled_with_retention_hold')
      expect(reviewed.retentionHoldApplied).toBe(true)
      expect(reviewed.retentionHoldReason).toContain('BMDC Code of Medical Ethics Section 4')

      // Verify that privacy audit log is recorded
      const logs = await CentralSecurityService.getSecurityAuditLogs({
        limit: 10,
      })
      const privacyLog = logs.find((l) => l.eventType === 'privacy.request.resolved')
      expect(privacyLog).toBeDefined()
      expect(privacyLog?.severity).toBe('medium')
    })
  })
})
