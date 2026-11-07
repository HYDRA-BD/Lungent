-- ==============================================================================
-- Migration: 20261105000010_symptom_based_triage_engine.sql
-- Description: Phase 1.14 Symptom-Based Clinical Triage Engine & Protocol Registry
-- Author: Lungent Clinical Architecture Team
-- ==============================================================================

-- 1. Create Enums for Symptom Triage Engine
DO $$ BEGIN
    CREATE TYPE public.triage_execution_status AS ENUM (
        'completed',
        'protocol_not_approved',
        'insufficient_information',
        'criteria_unmet',
        'criteria_met',
        'emergency_detected',
        'escalation_required'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.triage_urgency_level AS ENUM (
        'emergency_escalation',
        'urgent_assessment',
        'prompt_review',
        'routine_review',
        'additional_info_required',
        'protocol_not_approved',
        'triage_incomplete'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.symptom_presence_status AS ENUM (
        'present',
        'absent',
        'unknown',
        'not_reported',
        'unable_to_assess'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.symptom_data_provenance AS ENUM (
        'patient_reported',
        'worker_assisted',
        'clinician_verified',
        'imported'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.triage_criterion_status AS ENUM (
        'met',
        'unmet',
        'missing',
        'not_applicable',
        'indeterminate'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.escalation_status AS ENUM (
        'pending_escalation',
        'escalated',
        'acknowledged',
        'under_clinical_review',
        'action_documented',
        'resolved',
        'unable_to_complete'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Symptom Triage Protocol Catalog
CREATE TABLE IF NOT EXISTS public.symptom_triage_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_code VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255) NOT NULL,
    official_source_url TEXT,
    publication_reference TEXT NOT NULL,
    jurisdiction VARCHAR(100) NOT NULL,
    intended_population TEXT NOT NULL,
    publication_date DATE NOT NULL,
    last_updated_date DATE NOT NULL,
    lifecycle_status public.methodology_lifecycle_status NOT NULL DEFAULT 'under_validation',
    approval_authority VARCHAR(255) NOT NULL,
    approved_for_bangladesh BOOLEAN NOT NULL DEFAULT false,
    approved_at TIMESTAMPTZ,
    review_date TIMESTAMPTZ,
    known_limitations TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_symptom_protocols_code ON public.symptom_triage_protocols(protocol_code);
CREATE INDEX IF NOT EXISTS idx_symptom_protocols_status ON public.symptom_triage_protocols(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_symptom_protocols_bd_approved ON public.symptom_triage_protocols(approved_for_bangladesh);

-- 3. Symptom Triage Protocol Versions & Specification Definitions
CREATE TABLE IF NOT EXISTS public.symptom_triage_protocol_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID NOT NULL REFERENCES public.symptom_triage_protocols(id) ON DELETE CASCADE,
    version_tag VARCHAR(50) NOT NULL,
    specification_reference TEXT NOT NULL,
    emergency_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
    urgent_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
    prompt_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
    routine_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
    contextual_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
    lifecycle_status public.methodology_lifecycle_status NOT NULL DEFAULT 'under_validation',
    effective_date TIMESTAMPTZ NOT NULL,
    changelog TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT uq_symptom_protocol_version UNIQUE (protocol_id, version_tag)
);

CREATE INDEX IF NOT EXISTS idx_symptom_protocol_versions_protocol ON public.symptom_triage_protocol_versions(protocol_id);

-- 4. Symptom Assessment Records (Questionnaire Submissions)
CREATE TABLE IF NOT EXISTS public.symptom_assessment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    facility_id UUID REFERENCES public.healthcare_facilities(id) ON DELETE SET NULL,
    assessment_id UUID REFERENCES public.patient_assessments(id) ON DELETE SET NULL,
    provenance public.symptom_data_provenance NOT NULL DEFAULT 'patient_reported',
    collected_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    is_complete BOOLEAN NOT NULL DEFAULT true,
    symptoms_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    clinical_context JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_symptom_assessments_patient ON public.symptom_assessment_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_symptom_assessments_facility ON public.symptom_assessment_records(facility_id);

-- 5. Cryptographic Symptom Input Snapshots (Tamper-Evident Audit)
CREATE TABLE IF NOT EXISTS public.symptom_input_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symptom_assessment_id UUID NOT NULL REFERENCES public.symptom_assessment_records(id) ON DELETE CASCADE,
    snapshot_hash VARCHAR(64) NOT NULL,
    canonical_payload JSONB NOT NULL,
    derived_variables JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT uq_symptom_input_snapshot UNIQUE (symptom_assessment_id)
);

CREATE INDEX IF NOT EXISTS idx_symptom_input_snapshots_hash ON public.symptom_input_snapshots(snapshot_hash);

-- 6. Symptom Triage Determinations
CREATE TABLE IF NOT EXISTS public.symptom_triage_determinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    facility_id UUID REFERENCES public.healthcare_facilities(id) ON DELETE SET NULL,
    symptom_assessment_id UUID NOT NULL REFERENCES public.symptom_assessment_records(id) ON DELETE RESTRICT,
    protocol_id UUID NOT NULL REFERENCES public.symptom_triage_protocols(id) ON DELETE RESTRICT,
    protocol_version_id UUID NOT NULL REFERENCES public.symptom_triage_protocol_versions(id) ON DELETE RESTRICT,
    evaluated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    execution_mode VARCHAR(30) NOT NULL DEFAULT 'clinical_production',
    execution_status public.triage_execution_status NOT NULL,
    urgency_level public.triage_urgency_level NOT NULL,
    recommended_escalation_pathway TEXT,
    recommended_timeframe_days INT,
    clinical_alert_id UUID REFERENCES public.clinical_alerts(id) ON DELETE SET NULL,
    governance_notice TEXT,
    clinical_explanation JSONB NOT NULL,
    disclaimers TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_symptom_triage_exec_mode CHECK (
        execution_mode IN ('clinical_production', 'research_simulation', 'validation_audit')
    )
);

CREATE INDEX IF NOT EXISTS idx_symptom_triage_patient ON public.symptom_triage_determinations(patient_id);
CREATE INDEX IF NOT EXISTS idx_symptom_triage_facility ON public.symptom_triage_determinations(facility_id);
CREATE INDEX IF NOT EXISTS idx_symptom_triage_assessment ON public.symptom_triage_determinations(symptom_assessment_id);
CREATE INDEX IF NOT EXISTS idx_symptom_triage_urgency ON public.symptom_triage_determinations(urgency_level);

-- 7. Evaluated Criteria Breakdown
CREATE TABLE IF NOT EXISTS public.symptom_criterion_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    determination_id UUID NOT NULL REFERENCES public.symptom_triage_determinations(id) ON DELETE CASCADE,
    criterion_key VARCHAR(100) NOT NULL,
    criterion_label VARCHAR(255) NOT NULL,
    criterion_rule_description TEXT NOT NULL,
    patient_actual_value TEXT NOT NULL,
    status public.triage_criterion_status NOT NULL,
    is_red_flag BOOLEAN NOT NULL DEFAULT false,
    clinical_explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_symptom_crit_eval_determination ON public.symptom_criterion_evaluations(determination_id);
CREATE INDEX IF NOT EXISTS idx_symptom_crit_eval_key ON public.symptom_criterion_evaluations(criterion_key);

-- 8. Symptom Escalation Records
CREATE TABLE IF NOT EXISTS public.symptom_escalation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    determination_id UUID NOT NULL REFERENCES public.symptom_triage_determinations(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    facility_id UUID NOT NULL REFERENCES public.healthcare_facilities(id) ON DELETE RESTRICT,
    clinical_alert_id UUID REFERENCES public.clinical_alerts(id) ON DELETE SET NULL,
    urgency_level public.triage_urgency_level NOT NULL,
    escalation_reason TEXT NOT NULL,
    escalated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    assigned_to_role VARCHAR(50) NOT NULL DEFAULT 'clinician',
    assigned_clinician_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    status public.escalation_status NOT NULL DEFAULT 'escalated',
    acknowledged_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    action_documented_at TIMESTAMPTZ,
    action_notes TEXT,
    resolved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_symptom_escalation_det ON public.symptom_escalation_records(determination_id);
CREATE INDEX IF NOT EXISTS idx_symptom_escalation_patient ON public.symptom_escalation_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_symptom_escalation_facility ON public.symptom_escalation_records(facility_id);
CREATE INDEX IF NOT EXISTS idx_symptom_escalation_status ON public.symptom_escalation_records(status);

-- 9. Row Level Security Policies
ALTER TABLE public.symptom_triage_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_triage_protocol_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_assessment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_input_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_triage_determinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_criterion_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_escalation_records ENABLE ROW LEVEL SECURITY;

-- Protocols & Versions: Read-only for authenticated users
CREATE POLICY "Protocols are viewable by authenticated users"
    ON public.symptom_triage_protocols FOR SELECT TO authenticated
    USING (is_active = true OR public.has_role('admin') OR public.has_role('clinician'));

CREATE POLICY "Protocol versions are viewable by authenticated users"
    ON public.symptom_triage_protocol_versions FOR SELECT TO authenticated
    USING (true);

-- Assessment Records: Accessible by patient themselves, healthcare workers, clinicians, admins
CREATE POLICY "Patients view own symptom assessments"
    ON public.symptom_assessment_records FOR SELECT TO authenticated
    USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Healthcare staff view assigned symptom assessments"
    ON public.symptom_assessment_records FOR SELECT TO authenticated
    USING (
        public.has_role('clinician') OR
        public.has_role('healthcare_worker') OR
        public.has_role('admin')
    );

CREATE POLICY "Authorized users insert symptom assessments"
    ON public.symptom_assessment_records FOR INSERT TO authenticated
    WITH CHECK (
        patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()) OR
        public.has_role('clinician') OR
        public.has_role('healthcare_worker') OR
        public.has_role('admin')
    );

-- Triage Determinations: Accessible by authorized clinicians, healthcare workers, and patients
CREATE POLICY "Users view authorized triage determinations"
    ON public.symptom_triage_determinations FOR SELECT TO authenticated
    USING (
        patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()) OR
        public.has_role('clinician') OR
        public.has_role('healthcare_worker') OR
        public.has_role('admin')
    );

CREATE POLICY "Clinicians and workers insert triage determinations"
    ON public.symptom_triage_determinations FOR INSERT TO authenticated
    WITH CHECK (
        public.has_role('clinician') OR
        public.has_role('healthcare_worker') OR
        public.has_role('admin')
    );

-- Criterion evaluations & snapshots: viewable with determination
CREATE POLICY "Users view authorized criterion evaluations"
    ON public.symptom_criterion_evaluations FOR SELECT TO authenticated
    USING (
        determination_id IN (
            SELECT id FROM public.symptom_triage_determinations
            WHERE patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
               OR public.has_role('clinician')
               OR public.has_role('healthcare_worker')
               OR public.has_role('admin')
        )
    );

CREATE POLICY "Users view authorized symptom snapshots"
    ON public.symptom_input_snapshots FOR SELECT TO authenticated
    USING (
        symptom_assessment_id IN (
            SELECT id FROM public.symptom_assessment_records
            WHERE patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
               OR public.has_role('clinician')
               OR public.has_role('healthcare_worker')
               OR public.has_role('admin')
        )
    );

-- Escalation Records: Viewable and updatable by clinicians, healthcare workers, admins
CREATE POLICY "Clinical staff view and manage escalation records"
    ON public.symptom_escalation_records FOR ALL TO authenticated
    USING (
        public.has_role('clinician') OR
        public.has_role('healthcare_worker') OR
        public.has_role('admin')
    );
