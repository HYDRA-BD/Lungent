-- ==============================================================================
-- Migration: 20261105000007_clinical_workspace.sql
-- Description: Phase 1.11 Clinical Decision Support & Provider Workspace
-- Author: Lungent Architecture Team
-- ==============================================================================

-- 1. Clinical Review Workflow Records
CREATE TABLE IF NOT EXISTS public.clinical_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    facility_id UUID NOT NULL REFERENCES public.healthcare_facilities(id) ON DELETE RESTRICT,
    clinician_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    assessment_id UUID REFERENCES public.patient_assessments(id) ON DELETE SET NULL,
    review_status VARCHAR(50) NOT NULL DEFAULT 'pending_review',
    review_type VARCHAR(50) NOT NULL DEFAULT 'comprehensive_intake',
    summary TEXT NOT NULL,
    missing_information_notes TEXT,
    conflicting_information_notes TEXT,
    verified_information_notes TEXT,
    requested_information TEXT,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_clinical_review_status CHECK (
        review_status IN ('pending_review', 'under_review', 'info_required', 'reviewed', 'closed')
    ),
    CONSTRAINT chk_clinical_review_type CHECK (
        review_type IN ('comprehensive_intake', 'risk_evaluation', 'screening_eligibility', 'symptom_triage', 'follow_up')
    )
);

CREATE INDEX IF NOT EXISTS idx_clinical_reviews_patient ON public.clinical_reviews(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_reviews_facility ON public.clinical_reviews(facility_id);
CREATE INDEX IF NOT EXISTS idx_clinical_reviews_clinician ON public.clinical_reviews(clinician_id);
CREATE INDEX IF NOT EXISTS idx_clinical_reviews_status ON public.clinical_reviews(review_status);

-- 2. Clinical Observations
CREATE TABLE IF NOT EXISTS public.clinical_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_review_id UUID NOT NULL REFERENCES public.clinical_reviews(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    clinician_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    category VARCHAR(50) NOT NULL,
    observation_text TEXT NOT NULL,
    clinical_interpretation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_clinical_observation_category CHECK (
        category IN ('pulmonary_vitals', 'symptom_severity', 'exposure_risk', 'radiology_finding', 'general')
    )
);

CREATE INDEX IF NOT EXISTS idx_clinical_obs_review ON public.clinical_observations(clinical_review_id);
CREATE INDEX IF NOT EXISTS idx_clinical_obs_patient ON public.clinical_observations(patient_id);

-- 3. Clinical Decisions & Attributions
CREATE TABLE IF NOT EXISTS public.clinical_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_review_id UUID NOT NULL REFERENCES public.clinical_reviews(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    clinician_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    decision_type VARCHAR(60) NOT NULL,
    rationale TEXT NOT NULL,
    disagreement_with_automated_output BOOLEAN NOT NULL DEFAULT false,
    disagreement_reason TEXT,
    recommended_next_steps TEXT NOT NULL,
    referral_target TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'finalized',
    finalized_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_clinical_decision_type CHECK (
        decision_type IN (
            'screening_recommended',
            'diagnostic_workup_needed',
            'urgent_specialist_referral',
            'routine_follow_up',
            'no_immediate_intervention'
        )
    ),
    CONSTRAINT chk_clinical_decision_status CHECK (
        status IN ('draft', 'finalized', 'amended')
    )
);

CREATE INDEX IF NOT EXISTS idx_clinical_decisions_review ON public.clinical_decisions(clinical_review_id);
CREATE INDEX IF NOT EXISTS idx_clinical_decisions_patient ON public.clinical_decisions(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_decisions_clinician ON public.clinical_decisions(clinician_id);

-- 4. Clinical Decision Amendments (Immutable Audit Log)
CREATE TABLE IF NOT EXISTS public.clinical_decision_amendments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_decision_id UUID NOT NULL REFERENCES public.clinical_decisions(id) ON DELETE RESTRICT,
    clinician_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    amendment_reason TEXT NOT NULL,
    previous_content JSONB NOT NULL,
    amended_content JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_decision_amendments_decision ON public.clinical_decision_amendments(clinical_decision_id);

-- 5. Clinical Alerts & Red-Flag Escalations
CREATE TABLE IF NOT EXISTS public.clinical_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    facility_id UUID NOT NULL REFERENCES public.healthcare_facilities(id) ON DELETE RESTRICT,
    assessment_id UUID REFERENCES public.patient_assessments(id) ON DELETE SET NULL,
    alert_type VARCHAR(60) NOT NULL,
    severity VARCHAR(30) NOT NULL DEFAULT 'moderate',
    title TEXT NOT NULL,
    title_bn TEXT,
    description TEXT NOT NULL,
    description_bn TEXT,
    source VARCHAR(60) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    acknowledged_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolution_notes TEXT,
    resolved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_clinical_alert_type CHECK (
        alert_type IN (
            'red_flag_symptom',
            'assessment_warning',
            'missing_critical_info',
            'conflicting_data',
            'overdue_follow_up',
            'urgent_triage'
        )
    ),
    CONSTRAINT chk_clinical_alert_severity CHECK (
        severity IN ('critical', 'high', 'moderate', 'low')
    ),
    CONSTRAINT chk_clinical_alert_status CHECK (
        status IN ('active', 'acknowledged', 'resolved', 'dismissed')
    )
);

CREATE INDEX IF NOT EXISTS idx_clinical_alerts_patient ON public.clinical_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_alerts_facility ON public.clinical_alerts(facility_id);
CREATE INDEX IF NOT EXISTS idx_clinical_alerts_status ON public.clinical_alerts(status);
CREATE INDEX IF NOT EXISTS idx_clinical_alerts_severity ON public.clinical_alerts(severity);

-- 6. Follow-up Planning Records
CREATE TABLE IF NOT EXISTS public.clinical_follow_up_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    facility_id UUID NOT NULL REFERENCES public.healthcare_facilities(id) ON DELETE RESTRICT,
    clinician_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    clinical_review_id UUID REFERENCES public.clinical_reviews(id) ON DELETE SET NULL,
    instructions TEXT NOT NULL,
    recommended_review_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'planned',
    notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_clinical_follow_up_status CHECK (
        status IN ('planned', 'pending', 'completed', 'cancelled', 'overdue')
    )
);

CREATE INDEX IF NOT EXISTS idx_clinical_followup_patient ON public.clinical_follow_up_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_followup_facility ON public.clinical_follow_up_plans(facility_id);
CREATE INDEX IF NOT EXISTS idx_clinical_followup_date ON public.clinical_follow_up_plans(recommended_review_date);
CREATE INDEX IF NOT EXISTS idx_clinical_followup_status ON public.clinical_follow_up_plans(status);

-- 7. Clinical Audit Activity History
CREATE TABLE IF NOT EXISTS public.clinical_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinician_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    patient_id UUID REFERENCES public.patients(id) ON DELETE RESTRICT,
    facility_id UUID NOT NULL REFERENCES public.healthcare_facilities(id) ON DELETE RESTRICT,
    activity_type VARCHAR(60) NOT NULL,
    summary TEXT NOT NULL,
    summary_bn TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_clinical_activity_type CHECK (
        activity_type IN (
            'patient_record_reviewed',
            'assessment_reviewed',
            'observation_recorded',
            'decision_documented',
            'decision_amended',
            'alert_acknowledged',
            'alert_resolved',
            'followup_created',
            'followup_updated',
            'info_requested'
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_clinical_act_clinician ON public.clinical_activities(clinician_id);
CREATE INDEX IF NOT EXISTS idx_clinical_act_patient ON public.clinical_activities(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_act_facility ON public.clinical_activities(facility_id);
CREATE INDEX IF NOT EXISTS idx_clinical_act_created ON public.clinical_activities(created_at DESC);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.clinical_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_decision_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_follow_up_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_activities ENABLE ROW LEVEL SECURITY;

-- 1. clinical_reviews RLS
CREATE POLICY p_clinical_reviews_select ON public.clinical_reviews
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.facility_staff_memberships fsm
            WHERE fsm.user_id = auth.uid()
              AND fsm.facility_id = clinical_reviews.facility_id
              AND fsm.status = 'active'
        )
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
              AND r.name IN ('administrator', 'clinician')
        )
    );

CREATE POLICY p_clinical_reviews_insert ON public.clinical_reviews
    FOR INSERT TO authenticated
    WITH CHECK (
        clinician_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
              AND r.name IN ('administrator', 'clinician')
        )
    );

CREATE POLICY p_clinical_reviews_update ON public.clinical_reviews
    FOR UPDATE TO authenticated
    USING (
        clinician_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
              AND r.name = 'administrator'
        )
    );

-- 2. clinical_observations RLS
CREATE POLICY p_clinical_observations_select ON public.clinical_observations
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
              AND r.name IN ('administrator', 'clinician')
        )
    );

CREATE POLICY p_clinical_observations_insert ON public.clinical_observations
    FOR INSERT TO authenticated
    WITH CHECK (
        clinician_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
              AND r.name IN ('administrator', 'clinician')
        )
    );

-- 3. clinical_decisions RLS
CREATE POLICY p_clinical_decisions_select ON public.clinical_decisions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
              AND r.name IN ('administrator', 'clinician')
        )
    );

CREATE POLICY p_clinical_decisions_insert ON public.clinical_decisions
    FOR INSERT TO authenticated
    WITH CHECK (
        clinician_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
              AND r.name IN ('administrator', 'clinician')
        )
    );

-- 4. clinical_decision_amendments RLS (Insert only, immutable)
CREATE POLICY p_decision_amendments_select ON public.clinical_decision_amendments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
              AND r.name IN ('administrator', 'clinician')
        )
    );

CREATE POLICY p_decision_amendments_insert ON public.clinical_decision_amendments
    FOR INSERT TO authenticated
    WITH CHECK (
        clinician_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
              AND r.name IN ('administrator', 'clinician')
        )
    );

-- 5. clinical_alerts RLS
CREATE POLICY p_clinical_alerts_select ON public.clinical_alerts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.facility_staff_memberships fsm
            WHERE fsm.user_id = auth.uid()
              AND fsm.facility_id = clinical_alerts.facility_id
              AND fsm.status = 'active'
        )
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
              AND r.name IN ('administrator', 'clinician', 'healthcare_worker')
        )
    );

CREATE POLICY p_clinical_alerts_update ON public.clinical_alerts
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
              AND r.name IN ('administrator', 'clinician')
        )
    );

-- 6. clinical_follow_up_plans RLS
CREATE POLICY p_clinical_followup_select ON public.clinical_follow_up_plans
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.facility_staff_memberships fsm
            WHERE fsm.user_id = auth.uid()
              AND fsm.facility_id = clinical_follow_up_plans.facility_id
              AND fsm.status = 'active'
        )
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
              AND r.name IN ('administrator', 'clinician', 'healthcare_worker')
        )
    );

CREATE POLICY p_clinical_followup_insert ON public.clinical_follow_up_plans
    FOR INSERT TO authenticated
    WITH CHECK (
        clinician_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
              AND r.name IN ('administrator', 'clinician')
        )
    );

CREATE POLICY p_clinical_followup_update ON public.clinical_follow_up_plans
    FOR UPDATE TO authenticated
    USING (
        clinician_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
              AND r.name IN ('administrator', 'clinician')
        )
    );

-- 7. clinical_activities RLS
CREATE POLICY p_clinical_activities_select ON public.clinical_activities
    FOR SELECT TO authenticated
    USING (
        clinician_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
              AND r.name = 'administrator'
        )
    );

CREATE POLICY p_clinical_activities_insert ON public.clinical_activities
    FOR INSERT TO authenticated
    WITH CHECK (
        clinician_id = auth.uid()
    );

