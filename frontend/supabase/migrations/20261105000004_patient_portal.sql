-- ==============================================================================
-- Lungent Platform Migration: Patient Portal Architecture
-- Milestone: Phase 1.8
-- ==============================================================================

-- 1. Patient Assessments Table
CREATE TABLE IF NOT EXISTS public.patient_assessments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    assessment_type text NOT NULL CHECK (assessment_type IN ('lung_cancer_risk', 'screening_eligibility', 'symptom_triage', 'comprehensive_intake')),
    status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'awaiting_clinical_review', 'reviewed', 'completed', 'requires_additional_information')),
    initiated_at timestamptz NOT NULL DEFAULT now(),
    submitted_at timestamptz,
    completed_at timestamptz,
    reviewing_clinician_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    facility_id text DEFAULT 'facility-dhaka-central',
    methodology_version text DEFAULT 'USPSTF-2021 / PLCOm2012-v1',
    summary text NOT NULL,
    results jsonb DEFAULT '{}'::jsonb,
    limitations text,
    next_steps text,
    is_reviewed_by_clinician boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessments_patient_id ON public.patient_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.patient_assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_type ON public.patient_assessments(assessment_type);

-- 2. Patient Referrals and Follow-ups Table
CREATE TABLE IF NOT EXISTS public.patient_referrals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    referral_date timestamptz NOT NULL DEFAULT now(),
    referring_facility text NOT NULL DEFAULT 'Dhaka Central Pulmonary Institute',
    referring_clinician text,
    destination_facility text NOT NULL,
    reason text NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    recommended_followup_date text,
    instructions text,
    contact_phone text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_patient_id ON public.patient_referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.patient_referrals(status);

-- 3. Patient Reports and Documents Table
CREATE TABLE IF NOT EXISTS public.patient_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    title text NOT NULL,
    document_type text NOT NULL CHECK (document_type IN ('assessment_report', 'clinical_summary', 'health_summary', 'referral_letter', 'other')),
    file_size_bytes bigint DEFAULT 204800,
    storage_path text,
    is_available boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_patient_id ON public.patient_documents(patient_id);

-- 4. Patient Notifications Table
CREATE TABLE IF NOT EXISTS public.patient_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    category text NOT NULL CHECK (category IN ('assessment', 'clinical_review', 'referral', 'followup_reminder', 'account_privacy', 'system')),
    is_read boolean NOT NULL DEFAULT false,
    link_url text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_patient_id ON public.patient_notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.patient_notifications(is_read);

-- 5. Patient Consents Table
CREATE TABLE IF NOT EXISTS public.patient_consents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    consent_type text NOT NULL CHECK (consent_type IN ('assessment_terms', 'health_data_collection', 'anonymous_self_check_link', 'care_team_sharing', 'sms_notifications')),
    is_granted boolean NOT NULL DEFAULT true,
    purpose text NOT NULL,
    version text NOT NULL DEFAULT '1.0',
    can_withdraw boolean NOT NULL DEFAULT true,
    granted_at timestamptz NOT NULL DEFAULT now(),
    revoked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_patient_consent_type UNIQUE (patient_id, consent_type)
);

CREATE INDEX IF NOT EXISTS idx_consents_patient_id ON public.patient_consents(patient_id);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.patient_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_consents ENABLE ROW LEVEL SECURITY;

-- 1. Patient Assessments RLS
CREATE POLICY "Authorized users can view patient assessments"
    ON public.patient_assessments FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

CREATE POLICY "Patients and staff can record assessments"
    ON public.patient_assessments FOR INSERT TO authenticated
    WITH CHECK (public.can_access_patient(patient_id));

CREATE POLICY "Authorized clinicians and admins can update assessments"
    ON public.patient_assessments FOR UPDATE TO authenticated
    USING (public.can_access_patient(patient_id));

-- 2. Patient Referrals RLS
CREATE POLICY "Authorized users can view patient referrals"
    ON public.patient_referrals FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

CREATE POLICY "Authorized clinicians can manage patient referrals"
    ON public.patient_referrals FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = public.current_profile_id()
              AND ur.role_id IN ('clinician', 'administrator')
        )
        OR public.is_admin()
    );

-- 3. Patient Documents RLS
CREATE POLICY "Authorized users can view patient documents"
    ON public.patient_documents FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

-- 4. Patient Notifications RLS
CREATE POLICY "Authorized users can view patient notifications"
    ON public.patient_notifications FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

CREATE POLICY "Patients can mark notifications read"
    ON public.patient_notifications FOR UPDATE TO authenticated
    USING (public.can_access_patient(patient_id));

-- 5. Patient Consents RLS
CREATE POLICY "Authorized users can view patient consents"
    ON public.patient_consents FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

CREATE POLICY "Patients and staff can update consents"
    ON public.patient_consents FOR ALL TO authenticated
    USING (public.can_access_patient(patient_id));

