-- ==============================================================================
-- Migration: 20261105000013_referral_and_followup_management.sql
-- Description: Phase 1.18 Healthcare Referral and Follow-up Management
-- Author: Lungent Architecture Team
-- ==============================================================================

-- 1. Create Enums for Referral and Follow-up Lifecycle
DO $$ BEGIN
    CREATE TYPE public.referral_priority_tier AS ENUM (
        'urgent_2ww',    -- 2-Week Wait urgent suspected malignancy / red flag
        'priority',      -- Fast-track clinical review (<= 14 days)
        'routine',       -- Standard outpatient specialist review
        'elective'       -- Elective screening follow-up / lifestyle consultation
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.referral_lifecycle_status AS ENUM (
        'draft',
        'submitted',
        'accepted',
        'rejected',
        'scheduled',
        'in_progress',
        'completed',
        'cancelled',
        'closed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.patient_followup_status AS ENUM (
        'scheduled',
        'completed',
        'overdue',
        'rescheduled',
        'cancelled',
        'missed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.followup_purpose_type AS ENUM (
        'post_imaging_review',
        'treatment_monitoring',
        'symptom_reassessment',
        'specialist_consultation',
        'smoking_cessation',
        'routine_check'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Enhanced Patient Referrals Table
-- Links referring facility/clinician with destination facility, priority, and clinical indication
CREATE TABLE IF NOT EXISTS public.patient_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id VARCHAR(30) NOT NULL UNIQUE, -- Canonical REF-YYYY-XXXXXX
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_canonical_id VARCHAR(30) NOT NULL,
    referring_facility_id UUID REFERENCES public.healthcare_facilities(id) ON DELETE RESTRICT,
    referring_facility_name VARCHAR(255) NOT NULL,
    referring_provider_id UUID REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    referring_provider_name VARCHAR(255) NOT NULL,
    referring_provider_role VARCHAR(60) NOT NULL DEFAULT 'clinician',
    destination_facility_id UUID REFERENCES public.healthcare_facilities(id) ON DELETE RESTRICT,
    destination_facility_name VARCHAR(255) NOT NULL,
    destination_department VARCHAR(150),
    assigned_clinician_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    assigned_clinician_name VARCHAR(255),
    reason TEXT NOT NULL,
    clinical_summary TEXT,
    priority public.referral_priority_tier NOT NULL DEFAULT 'routine',
    status public.referral_lifecycle_status NOT NULL DEFAULT 'submitted',
    rejection_reason TEXT,
    cancellation_reason TEXT,
    closure_notes TEXT,
    referral_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    appointment_date TIMESTAMPTZ,
    appointment_location TEXT,
    instructions TEXT,
    contact_phone VARCHAR(50),
    linked_assessment_id UUID,
    linked_assessment_type VARCHAR(60),
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_referrals_patient ON public.patient_referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.patient_referrals(referral_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referring_fac ON public.patient_referrals(referring_facility_id);
CREATE INDEX IF NOT EXISTS idx_referrals_dest_fac ON public.patient_referrals(destination_facility_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.patient_referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_priority ON public.patient_referrals(priority);

-- 3. Referral Status History (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS public.referral_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.patient_referrals(id) ON DELETE CASCADE,
    from_status public.referral_lifecycle_status NOT NULL,
    to_status public.referral_lifecycle_status NOT NULL,
    reason TEXT,
    notes TEXT,
    changed_by UUID REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    changed_by_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_referral_history_ref ON public.referral_status_history(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_history_time ON public.referral_status_history(created_at);

-- 4. Unified Patient Follow-Ups Table
-- Connects patient care activities, clinical reviews, and referrals to scheduled consultations
CREATE TABLE IF NOT EXISTS public.patient_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_canonical_id VARCHAR(30) NOT NULL,
    referral_id UUID REFERENCES public.patient_referrals(id) ON DELETE SET NULL,
    facility_id UUID REFERENCES public.healthcare_facilities(id) ON DELETE RESTRICT,
    facility_name VARCHAR(255) NOT NULL,
    responsible_provider_id UUID REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    responsible_provider_name VARCHAR(255) NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time VARCHAR(20),
    purpose public.followup_purpose_type NOT NULL DEFAULT 'routine_check',
    instructions TEXT NOT NULL,
    status public.patient_followup_status NOT NULL DEFAULT 'scheduled',
    outcome_notes TEXT,
    rescheduled_from_date DATE,
    rescheduled_reason TEXT,
    cancellation_reason TEXT,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_followups_patient ON public.patient_followups(patient_id);
CREATE INDEX IF NOT EXISTS idx_followups_referral ON public.patient_followups(referral_id);
CREATE INDEX IF NOT EXISTS idx_followups_facility ON public.patient_followups(facility_id);
CREATE INDEX IF NOT EXISTS idx_followups_date ON public.patient_followups(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_followups_status ON public.patient_followups(status);

-- 5. Follow-Up Status History (Immutable Log)
CREATE TABLE IF NOT EXISTS public.followup_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    followup_id UUID NOT NULL REFERENCES public.patient_followups(id) ON DELETE CASCADE,
    from_status public.patient_followup_status NOT NULL,
    to_status public.patient_followup_status NOT NULL,
    reason TEXT,
    notes TEXT,
    changed_by UUID REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    changed_by_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_followup_hist_id ON public.followup_status_history(followup_id);

-- 6. Notification Queue Integration Points
CREATE TABLE IF NOT EXISTS public.referral_followup_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(60) NOT NULL, -- 'referral_assigned', 'referral_status_changed', 'followup_reminder', 'followup_overdue'
    reference_id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    recipient_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    channel VARCHAR(30) NOT NULL DEFAULT 'in_app', -- 'in_app', 'sms', 'email'
    title VARCHAR(200) NOT NULL,
    title_bn VARCHAR(200),
    body TEXT NOT NULL,
    body_bn TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'queued', -- 'queued', 'sent', 'failed', 'delivered'
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ref_notifications_ref ON public.referral_followup_notifications(reference_id);
CREATE INDEX IF NOT EXISTS idx_ref_notifications_status ON public.referral_followup_notifications(status);

-- 7. Row Level Security Policies
ALTER TABLE public.patient_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_followup_notifications ENABLE ROW LEVEL SECURITY;

-- Referrals: Patients can view own referrals
CREATE POLICY "Patients view own referrals"
    ON public.patient_referrals FOR SELECT TO authenticated
    USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- Staff (Clinician, Healthcare Worker, Admin) can view and manage referrals
CREATE POLICY "Staff manage referrals"
    ON public.patient_referrals FOR ALL TO authenticated
    USING (
        public.has_role('clinician') OR
        public.has_role('healthcare_worker') OR
        public.has_role('admin')
    );

CREATE POLICY "Staff view referral status history"
    ON public.referral_status_history FOR SELECT TO authenticated
    USING (
        public.has_role('clinician') OR
        public.has_role('healthcare_worker') OR
        public.has_role('admin')
    );

CREATE POLICY "Patients view own followups"
    ON public.patient_followups FOR SELECT TO authenticated
    USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Staff manage followups"
    ON public.patient_followups FOR ALL TO authenticated
    USING (
        public.has_role('clinician') OR
        public.has_role('healthcare_worker') OR
        public.has_role('admin')
    );

CREATE POLICY "Staff view followup history"
    ON public.followup_status_history FOR SELECT TO authenticated
    USING (
        public.has_role('clinician') OR
        public.has_role('healthcare_worker') OR
        public.has_role('admin')
    );

CREATE POLICY "Users view own notifications"
    ON public.referral_followup_notifications FOR SELECT TO authenticated
    USING (
        recipient_user_id = auth.uid() OR
        patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()) OR
        public.has_role('admin')
    );

