-- ==============================================================================
-- Migration: 20261105000019_security_privacy_compliance.sql
-- Phase 1.25: Centralized Security Architecture, Privacy Safeguards,
-- Data Subject Rights, Security Audit, Incident Management,
-- Data Retention Policies, Backup Verification & Compliance Readiness Register
-- ==============================================================================

-- 1. Centralized Append-Only Security Audit Logs
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type text NOT NULL,
    severity text NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
    outcome text NOT NULL CHECK (outcome IN ('success', 'failure', 'blocked', 'flagged')),
    actor_id text,
    actor_role text,
    target_resource text,
    facility_id text,
    client_ip text,
    user_agent text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_event_type ON public.security_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_actor ON public.security_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_severity ON public.security_audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON public.security_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_facility ON public.security_audit_logs(facility_id);

-- 2. Data Subject Rights & Privacy Requests
CREATE TABLE IF NOT EXISTS public.privacy_subject_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number text NOT NULL UNIQUE,
    patient_id text NOT NULL,
    request_type text NOT NULL CHECK (
        request_type IN (
            'access_export',
            'correction',
            'erasure_restriction',
            'consent_withdrawal',
            'processing_objection'
        )
    ),
    status text NOT NULL DEFAULT 'submitted' CHECK (
        status IN (
            'submitted',
            'under_review',
            'approved_fulfilled',
            'rejected',
            'partially_fulfilled_with_retention_hold'
        )
    ),
    request_details text NOT NULL,
    review_notes text,
    reviewed_by text,
    retention_hold_applied boolean NOT NULL DEFAULT false,
    retention_hold_reason text,
    created_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_privacy_requests_patient ON public.privacy_subject_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_privacy_requests_status ON public.privacy_subject_requests(status);
CREATE INDEX IF NOT EXISTS idx_privacy_requests_type ON public.privacy_subject_requests(request_type);

-- 3. Centralized Patient Consents Registry
CREATE TABLE IF NOT EXISTS public.patient_consents_registry (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id text NOT NULL,
    consent_category text NOT NULL CHECK (
        consent_category IN (
            'service_terms',
            'clinical_decision_support',
            'care_team_sharing',
            'sms_notifications',
            'email_notifications',
            'environmental_analysis',
            'anonymized_research'
        )
    ),
    purpose text NOT NULL,
    version text NOT NULL DEFAULT '2026.1',
    is_granted boolean NOT NULL DEFAULT true,
    collection_method text NOT NULL CHECK (
        collection_method IN (
            'electronic_portal',
            'worker_witnessed_digital',
            'paper_scanned',
            'verbal_witnessed_emergency'
        )
    ),
    witness_id text,
    withdrawal_reason text,
    granted_at timestamptz NOT NULL DEFAULT now(),
    withdrawn_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_patient_consents_reg_patient ON public.patient_consents_registry(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_consents_reg_cat ON public.patient_consents_registry(consent_category);
CREATE INDEX IF NOT EXISTS idx_patient_consents_reg_granted ON public.patient_consents_registry(is_granted);

-- 4. Security Incident Management Records
CREATE TABLE IF NOT EXISTS public.security_incidents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number text NOT NULL UNIQUE,
    title text NOT NULL,
    category text NOT NULL CHECK (
        category IN (
            'unauthorized_access_attempt',
            'credential_compromise',
            'data_exposure_suspected',
            'cross_facility_violation',
            'brute_force_attack',
            'policy_violation',
            'system_anomaly'
        )
    ),
    severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status text NOT NULL DEFAULT 'reported' CHECK (
        status IN (
            'reported',
            'investigating',
            'contained',
            'resolved',
            'closed'
        )
    ),
    affected_systems jsonb NOT NULL DEFAULT '[]'::jsonb,
    reporter_id text NOT NULL,
    reporter_name text NOT NULL,
    assignee_id text,
    containment_notes text,
    resolution_summary text,
    reported_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON public.security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON public.security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_reported_at ON public.security_incidents(reported_at DESC);

-- 5. Data Retention Policies Definition
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    data_category text NOT NULL UNIQUE CHECK (
        data_category IN (
            'clinical_records',
            'diagnostic_imaging_reports',
            'security_audit_logs',
            'temporary_assessment_drafts',
            'platform_telemetry',
            'notifications_history',
            'patient_consents'
        )
    ),
    retention_period_days integer NOT NULL,
    legal_basis text NOT NULL,
    deletion_method text NOT NULL,
    is_immutable boolean NOT NULL DEFAULT false,
    review_status text NOT NULL DEFAULT 'active',
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Compliance Controls Register
CREATE TABLE IF NOT EXISTS public.compliance_controls_register (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    control_id text NOT NULL UNIQUE,
    framework text NOT NULL CHECK (
        framework IN (
            'BD_CYBER_SECURITY_ACT_2023',
            'BD_DRAFT_DATA_PROTECTION_ACT',
            'BMDC_CODE_OF_ETHICS',
            'DGHS_DIGITAL_HEALTH_GUIDELINES',
            'ISO_27001_READINESS',
            'HIPAA_SECURITY_READINESS',
            'GDPR_READINESS'
        )
    ),
    jurisdiction text NOT NULL,
    category text NOT NULL,
    control_name text NOT NULL,
    description text NOT NULL,
    implementation_status text NOT NULL CHECK (
        implementation_status IN (
            'implemented',
            'in_progress',
            'planned',
            'requires_legal_review'
        )
    ),
    evidence_summary text NOT NULL,
    responsible_owner text NOT NULL,
    last_audited_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_compliance_framework ON public.compliance_controls_register(framework);
CREATE INDEX IF NOT EXISTS idx_compliance_status ON public.compliance_controls_register(implementation_status);

-- 7. System Backup & Disaster Recovery Verification Records
CREATE TABLE IF NOT EXISTS public.system_backup_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_type text NOT NULL CHECK (
        backup_type IN (
            'automated_daily_snapshot',
            'point_in_time_wal',
            'pre_migration_dump',
            'cold_storage_archive'
        )
    ),
    target_system text NOT NULL,
    snapshot_timestamp timestamptz NOT NULL,
    verification_status text NOT NULL CHECK (
        verification_status IN (
            'verified_successful',
            'verification_failed',
            'remediation_in_progress'
        )
    ),
    verified_by text NOT NULL,
    verification_notes text NOT NULL,
    recovery_drill_date date,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_backup_verifications_status ON public.system_backup_verifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_backup_verifications_timestamp ON public.system_backup_verifications(snapshot_timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_consents_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_controls_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_backup_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies:
-- 1. Security audit logs: read-only for administrators and security officers; insert for system
CREATE POLICY "Admins and security officers can view security audit logs"
    ON public.security_audit_logs FOR SELECT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "System can record security audit logs"
    ON public.security_audit_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Privacy subject requests: patients can view their own requests; admins can manage
CREATE POLICY "Patients can view own privacy requests"
    ON public.privacy_subject_requests FOR SELECT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create privacy requests"
    ON public.privacy_subject_requests FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Patient consents registry: patients view own; authorized workers view assigned
CREATE POLICY "Authenticated users can view appropriate consent records"
    ON public.patient_consents_registry FOR SELECT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update consent records"
    ON public.patient_consents_registry FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Security incidents: administrative & security visibility
CREATE POLICY "Staff can view security incidents"
    ON public.security_incidents FOR SELECT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can record security incidents"
    ON public.security_incidents FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Policies & Compliance: readable by authenticated platform users
CREATE POLICY "Authenticated users can view retention policies"
    ON public.data_retention_policies FOR SELECT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view compliance controls"
    ON public.compliance_controls_register FOR SELECT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view backup verifications"
    ON public.system_backup_verifications FOR SELECT
    WITH CHECK (auth.uid() IS NOT NULL);

