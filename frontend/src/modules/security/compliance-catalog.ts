import {
  ComplianceControl,
  DataRetentionPolicy,
  BackupVerification,
  SecurityIncident,
  PrivacySubjectRequest,
} from './types'

export const BASELINE_COMPLIANCE_CONTROLS: ComplianceControl[] = [
  {
    id: 'ctrl-bd-csa-01',
    controlId: 'BD-CSA-SEC26',
    framework: 'BD_CYBER_SECURITY_ACT_2023',
    jurisdiction: 'Bangladesh',
    category: 'Information Security & Unauthorized Access',
    controlName: 'Prohibition of Unauthorized System Access & Identity Theft',
    description:
      'Enforces strict cryptographic authentication, session expiration, and role-based access control preventing unauthorized entry into critical healthcare software systems.',
    implementationStatus: 'implemented',
    evidenceSummary:
      'Supabase JWT authentication, server-side route guards, proxy middleware, and tamper-resistant audit logging.',
    responsibleOwner: 'Platform Security Officer',
    lastAuditedAt: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'ctrl-bd-dpa-01',
    controlId: 'BD-DPA-CONSENT',
    framework: 'BD_DRAFT_DATA_PROTECTION_ACT',
    jurisdiction: 'Bangladesh',
    category: 'Consent & Lawful Processing',
    controlName: 'Informed Consent Primacy & Purpose Limitation',
    description:
      'Requires explicit patient consent prior to collecting personal lung health data, restricts use exclusively to authorized assessment purposes, and supports withdrawal workflows.',
    implementationStatus: 'implemented',
    evidenceSummary:
      'Centralized patient consent registry, mandatory service consent gating, and non-destructive withdrawal with legal retention holds.',
    responsibleOwner: 'Data Protection Officer',
    lastAuditedAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'ctrl-bmdc-01',
    controlId: 'BMDC-CONF-SEC4',
    framework: 'BMDC_CODE_OF_ETHICS',
    jurisdiction: 'Bangladesh',
    category: 'Medical Confidentiality',
    controlName: 'Physician-Patient Privilege & Clinical Record Retention',
    description:
      'Upholds strict medical confidentiality in accordance with Bangladesh Medical & Dental Council regulations. Preserves historical clinical records for at least 10 years without premature erasure.',
    implementationStatus: 'implemented',
    evidenceSummary:
      'Non-destructive clinician override architecture, 10-year clinical retention policy, and facility boundary isolation.',
    responsibleOwner: 'Clinical Advisory Board Chair',
    lastAuditedAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'ctrl-dghs-01',
    controlId: 'DGHS-EHR-ACCESS',
    framework: 'DGHS_DIGITAL_HEALTH_GUIDELINES',
    jurisdiction: 'Bangladesh',
    category: 'Health System Interoperability',
    controlName: 'Facility-Scoped Access Isolation for Community Workers',
    description:
      'Ensures community healthcare workers access patient information solely within their assigned sub-district/upazila healthcare facility boundaries.',
    implementationStatus: 'implemented',
    evidenceSummary:
      'HealthcareFacilityService facility-membership scoping and requireFacilityAccess() server enforcement.',
    responsibleOwner: 'Health Informatics Lead',
    lastAuditedAt: '2026-01-20T00:00:00.000Z',
  },
  {
    id: 'ctrl-iso-01',
    controlId: 'ISO-27001-A9',
    framework: 'ISO_27001_READINESS',
    jurisdiction: 'International',
    category: 'Access Control',
    controlName: 'Least Privilege & Separation of Administrative Duties',
    description:
      'Technical administrators are strictly segregated from clinical decision-making authority and cannot inspect raw clinical observations without clinical assignment.',
    implementationStatus: 'implemented',
    evidenceSummary:
      'RBAC hierarchy, separate clinical governance role definitions, and administrative-only analytics aggregation.',
    responsibleOwner: 'Information Security Lead',
    lastAuditedAt: '2026-01-25T00:00:00.000Z',
  },
  {
    id: 'ctrl-hipaa-01',
    controlId: 'HIPAA-TECH-164-312',
    framework: 'HIPAA_SECURITY_READINESS',
    jurisdiction: 'International',
    category: 'Technical Safeguards',
    controlName: 'Audit Controls & Transmission Security',
    description:
      'Implements hardware, software, and procedural mechanisms that record and examine activity in information systems containing or using electronic protected health information.',
    implementationStatus: 'implemented',
    evidenceSummary:
      'Append-only security audit log, TLS 1.3 in transit, HSTS 2-year preloading, and CSP directives.',
    responsibleOwner: 'Infrastructure & Security Architect',
    lastAuditedAt: '2026-01-30T00:00:00.000Z',
  },
  {
    id: 'ctrl-gdpr-01',
    controlId: 'GDPR-ART17-RETENTION',
    framework: 'GDPR_READINESS',
    jurisdiction: 'International',
    category: 'Data Subject Rights',
    controlName: 'Right to Erasure with Statutory Health Record Exemption',
    description:
      'Accommodates patient erasure requests while legally preserving health data necessary for preventative healthcare, medical diagnosis, and provision of treatment.',
    implementationStatus: 'implemented',
    evidenceSummary:
      'PrivacySubjectRequest workflow with explicit retention_hold_applied flag and documented legal retention reason.',
    responsibleOwner: 'Privacy Counsel & Compliance Officer',
    lastAuditedAt: '2026-02-05T00:00:00.000Z',
  },
]

export const BASELINE_RETENTION_POLICIES: DataRetentionPolicy[] = [
  {
    id: 'ret-clinical-01',
    dataCategory: 'clinical_records',
    retentionPeriodDays: 3650, // 10 Years
    legalBasis: 'BMDC Medical Code of Ethics / Hospital Management Record Mandate',
    deletionMethod: 'Clinical board review required before archival or anonymization',
    isImmutable: true,
    reviewStatus: 'active',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'ret-audit-02',
    dataCategory: 'security_audit_logs',
    retentionPeriodDays: 1825, // 5 Years
    legalBasis: 'Cyber Security Act 2023 / Security Audit Accountability',
    deletionMethod: 'Automated cold-storage archiving into write-once storage',
    isImmutable: true,
    reviewStatus: 'active',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'ret-telemetry-03',
    dataCategory: 'platform_telemetry',
    retentionPeriodDays: 90, // 90 Days
    legalBasis: 'Operational Telemetry & Performance Monitoring Policy',
    deletionMethod: 'Automated database partition purging of non-PHI telemetry',
    isImmutable: false,
    reviewStatus: 'active',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'ret-drafts-04',
    dataCategory: 'temporary_assessment_drafts',
    retentionPeriodDays: 30, // 30 Days
    legalBasis: 'Data Minimization & Incomplete Form Preservation Policy',
    deletionMethod: 'Automated cleanup of unsubmitted local/synced drafts',
    isImmutable: false,
    reviewStatus: 'active',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'ret-notifications-05',
    dataCategory: 'notifications_history',
    retentionPeriodDays: 180, // 180 Days
    legalBasis: 'Communications Delivery & Acknowledgment Audit Trail',
    deletionMethod: 'Purged after delivery verification and operational period',
    isImmutable: false,
    reviewStatus: 'active',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

export const BASELINE_BACKUP_VERIFICATIONS: BackupVerification[] = [
  {
    id: 'bkp-seed-01',
    backupType: 'automated_daily_snapshot',
    targetSystem: 'Supabase PostgreSQL Production Database',
    snapshotTimestamp: '2026-11-05T03:00:00.000Z',
    verificationStatus: 'verified_successful',
    verifiedBy: 'Security Automation / Backup Sentinel',
    verificationNotes: 'Automated snapshot checksum matched; test restoration to staging sandpit completed in 4.2 minutes.',
    recoveryDrillDate: '2026-10-15',
    createdAt: '2026-11-05T03:30:00.000Z',
  },
  {
    id: 'bkp-seed-02',
    backupType: 'point_in_time_wal',
    targetSystem: 'Continuous WAL Archival (RPO < 5 minutes)',
    snapshotTimestamp: '2026-11-05T23:00:00.000Z',
    verificationStatus: 'verified_successful',
    verifiedBy: 'DevOps & Reliability Engineer',
    verificationNotes: 'Continuous replication verified across secondary availability zone.',
    recoveryDrillDate: '2026-10-15',
    createdAt: '2026-11-05T23:15:00.000Z',
  },
]

export const BASELINE_SECURITY_INCIDENTS: SecurityIncident[] = [
  {
    id: 'inc-seed-01',
    incidentNumber: 'INC-2026-001',
    title: 'Repeated Invalid Password Attempts on Healthcare Worker Portal',
    category: 'brute_force_attack',
    severity: 'medium',
    status: 'contained',
    affectedSystems: ['Authentication Subsystem', 'Healthcare Worker API'],
    reporterId: 'sys-intrusion-detection',
    reporterName: 'Automated Rate Limiter Sentinel',
    assigneeId: 'usr-sec-officer-01',
    containmentNotes: 'IP range 103.205.x.x automatically blocked for 60 minutes after 15 consecutive failed login attempts.',
    resolutionSummary: 'No accounts compromised. IP block upheld and added to monitored watch list.',
    reportedAt: '2026-01-18T14:20:00.000Z',
    resolvedAt: '2026-01-18T15:45:00.000Z',
  },
  {
    id: 'inc-seed-02',
    incidentNumber: 'INC-2026-002',
    title: 'Cross-Facility Patient Record Access Request Anomaly',
    category: 'cross_facility_violation',
    severity: 'low',
    status: 'resolved',
    affectedSystems: ['Patient Registry', 'Facility Boundary Middleware'],
    reporterId: 'sys-audit-monitor',
    reporterName: 'Security Audit Sentinel',
    assigneeId: 'usr-sec-officer-01',
    containmentNotes: 'Healthcare worker from Sylhet center attempted query for patient registered at Dhaka Central without active specialist referral.',
    resolutionSummary: 'System correctly blocked access with 403 Forbidden. Contacted worker to clarify referral intake procedure.',
    reportedAt: '2026-01-22T09:10:00.000Z',
    resolvedAt: '2026-01-22T11:00:00.000Z',
  },
]

export const BASELINE_PRIVACY_REQUESTS: PrivacySubjectRequest[] = [
  {
    id: 'req-seed-01',
    requestNumber: 'DSR-2026-001',
    patientId: '11111111-1111-4111-a111-111111111111',
    requestType: 'access_export',
    status: 'approved_fulfilled',
    requestDetails: 'Patient requested full export of clinical assessments, health records, and referral letters for second medical opinion.',
    reviewNotes: 'Identity verified via registered mobile OTP and national ID match. Encrypted export archive generated and securely delivered to patient portal.',
    reviewedBy: 'Privacy Compliance Officer',
    retentionHoldApplied: false,
    retentionHoldReason: null,
    createdAt: '2026-01-12T10:00:00.000Z',
    resolvedAt: '2026-01-12T16:30:00.000Z',
  },
  {
    id: 'req-seed-02',
    requestNumber: 'DSR-2026-002',
    patientId: '22222222-2222-4222-a222-222222222222',
    requestType: 'erasure_restriction',
    status: 'partially_fulfilled_with_retention_hold',
    requestDetails: 'Patient requested deletion of all medical records following relocation.',
    reviewNotes: 'Account deactivated and marketing/SMS permissions revoked. However, BMDC statutory 10-year retention hold applied to historical diagnostic findings and risk calculations.',
    reviewedBy: 'Data Protection Officer',
    retentionHoldApplied: true,
    retentionHoldReason: 'Statutory medical record retention required under BMDC Code of Ethics Section 4 and hospital malpractice defense laws.',
    createdAt: '2026-01-24T11:15:00.000Z',
    resolvedAt: '2026-01-25T14:00:00.000Z',
  },
]

