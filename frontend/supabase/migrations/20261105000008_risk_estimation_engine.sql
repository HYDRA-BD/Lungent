-- ==============================================================================
-- Migration: 20261105000008_risk_estimation_engine.sql
-- Description: Phase 1.12 Lung Cancer Risk Estimation Engine & Governance Architecture
-- Author: Lungent Architecture & Clinical Systems Team
-- ==============================================================================

-- 1. Methodology Registry Table
CREATE TABLE IF NOT EXISTS public.risk_methodologies (
    id VARCHAR(80) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    authoritative_source TEXT NOT NULL,
    publication_reference TEXT,
    intended_population TEXT NOT NULL,
    calculation_type VARCHAR(60) NOT NULL,
    output_definition TEXT NOT NULL,
    time_horizon_years INTEGER DEFAULT 6,
    lifecycle_status VARCHAR(50) NOT NULL DEFAULT 'awaiting_clinical_approval',
    approval_authority VARCHAR(255),
    approved_for_bangladesh BOOLEAN NOT NULL DEFAULT false,
    approved_at TIMESTAMPTZ,
    review_date TIMESTAMPTZ,
    known_limitations TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_methodology_lifecycle CHECK (
        lifecycle_status IN (
            'research_only',
            'under_validation',
            'awaiting_clinical_approval',
            'approved_for_clinical_use',
            'suspended',
            'deprecated'
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_risk_methodologies_status ON public.risk_methodologies(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_risk_methodologies_active ON public.risk_methodologies(is_active);

-- 2. Methodology Versions Table
CREATE TABLE IF NOT EXISTS public.risk_methodology_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    methodology_id VARCHAR(80) NOT NULL REFERENCES public.risk_methodologies(id) ON DELETE CASCADE,
    version_tag VARCHAR(50) NOT NULL,
    specification_reference TEXT NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    lifecycle_status VARCHAR(50) NOT NULL DEFAULT 'awaiting_clinical_approval',
    effective_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    changelog TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT uq_methodology_version UNIQUE (methodology_id, version_tag)
);

CREATE INDEX IF NOT EXISTS idx_risk_methodology_versions_meth ON public.risk_methodology_versions(methodology_id);

-- 3. Risk Estimation Records (Detailed Assessment Execution Records)
CREATE TABLE IF NOT EXISTS public.risk_estimation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES public.patient_assessments(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    facility_id VARCHAR(100) NOT NULL DEFAULT 'facility-dhaka-central',
    methodology_id VARCHAR(80) NOT NULL REFERENCES public.risk_methodologies(id) ON DELETE RESTRICT,
    methodology_version VARCHAR(50) NOT NULL,
    execution_mode VARCHAR(40) NOT NULL DEFAULT 'clinical_production',
    execution_status VARCHAR(50) NOT NULL DEFAULT 'processing',
    estimated_risk_percentage NUMERIC(6, 3),
    risk_category VARCHAR(50),
    time_horizon_years INTEGER,
    is_clinically_approved BOOLEAN NOT NULL DEFAULT false,
    is_research_execution BOOLEAN NOT NULL DEFAULT false,
    has_missing_required_inputs BOOLEAN NOT NULL DEFAULT false,
    missing_inputs_list TEXT[] DEFAULT '{}',
    inconsistent_inputs_list TEXT[] DEFAULT '{}',
    uncertainty_range JSONB,
    clinical_disclaimer TEXT NOT NULL,
    executed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_risk_record_execution_mode CHECK (
        execution_mode IN ('clinical_production', 'research_simulation', 'validation_audit')
    ),
    CONSTRAINT chk_risk_record_execution_status CHECK (
        execution_status IN (
            'draft',
            'awaiting_information',
            'ready_for_calculation',
            'processing',
            'completed',
            'failed',
            'methodology_unavailable',
            'methodology_not_approved'
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_risk_records_patient ON public.risk_estimation_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_risk_records_assessment ON public.risk_estimation_records(assessment_id);
CREATE INDEX IF NOT EXISTS idx_risk_records_methodology ON public.risk_estimation_records(methodology_id);
CREATE INDEX IF NOT EXISTS idx_risk_records_status ON public.risk_estimation_records(execution_status);

-- 4. Immutable Assessment Input Snapshots
CREATE TABLE IF NOT EXISTS public.risk_assessment_input_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_record_id UUID NOT NULL REFERENCES public.risk_estimation_records(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    demographics_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    smoking_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    medical_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    exposure_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    derived_variables JSONB NOT NULL DEFAULT '{}'::jsonb,
    input_provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
    snapshot_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_risk_snapshots_record ON public.risk_assessment_input_snapshots(risk_record_id);
CREATE INDEX IF NOT EXISTS idx_risk_snapshots_patient ON public.risk_assessment_input_snapshots(patient_id);

-- 5. Risk Assessment Explanations & Factor Attributions
CREATE TABLE IF NOT EXISTS public.risk_assessment_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_record_id UUID NOT NULL REFERENCES public.risk_estimation_records(id) ON DELETE CASCADE,
    contributing_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
    missing_factors_impact TEXT,
    assumptions_applied TEXT[] DEFAULT '{}',
    interpretation_summary TEXT NOT NULL,
    limitations TEXT NOT NULL,
    what_this_means TEXT NOT NULL,
    what_this_does_not_mean TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_risk_explanations_record ON public.risk_assessment_explanations(risk_record_id);

-- 6. Experimental Research Model Registry (Strict Clinical Segregation)
CREATE TABLE IF NOT EXISTS public.experimental_model_registry (
    id VARCHAR(100) PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,
    dataset_provenance TEXT NOT NULL,
    dataset_limitations TEXT NOT NULL,
    model_architecture VARCHAR(100) NOT NULL,
    training_date TIMESTAMPTZ,
    is_experimental_only BOOLEAN NOT NULL DEFAULT true,
    can_influence_clinical_pipeline BOOLEAN NOT NULL DEFAULT false,
    audit_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Row-Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.risk_methodologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_methodology_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_estimation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessment_input_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessment_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experimental_model_registry ENABLE ROW LEVEL SECURITY;

-- Methodologies and Versions are readable by authenticated users
CREATE POLICY "Authenticated users can read methodologies"
    ON public.risk_methodologies FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read methodology versions"
    ON public.risk_methodology_versions FOR SELECT TO authenticated
    USING (true);

-- Risk estimation records permissions
CREATE POLICY "Users can view authorized risk estimation records"
    ON public.risk_estimation_records FOR SELECT TO authenticated
    USING (
        patient_id IN (
            SELECT p.id FROM public.patients p
            WHERE p.associated_user_profile_id = public.current_profile_id()
        )
        OR public.has_role('clinician')
        OR public.has_role('healthcare_worker')
        OR public.has_role('admin')
    );

CREATE POLICY "Clinicians and workers can execute risk estimations"
    ON public.risk_estimation_records FOR INSERT TO authenticated
    WITH CHECK (
        public.has_role('clinician')
        OR public.has_role('healthcare_worker')
        OR public.has_role('admin')
    );

-- Snapshots and explanations readable by authorized users
CREATE POLICY "Users can view authorized input snapshots"
    ON public.risk_assessment_input_snapshots FOR SELECT TO authenticated
    USING (
        patient_id IN (
            SELECT p.id FROM public.patients p
            WHERE p.associated_user_profile_id = public.current_profile_id()
        )
        OR public.has_role('clinician')
        OR public.has_role('healthcare_worker')
        OR public.has_role('admin')
    );

CREATE POLICY "Users can view authorized risk explanations"
    ON public.risk_assessment_explanations FOR SELECT TO authenticated
    USING (
        risk_record_id IN (
            SELECT r.id FROM public.risk_estimation_records r
            WHERE r.patient_id IN (
                SELECT p.id FROM public.patients p
                WHERE p.associated_user_profile_id = public.current_profile_id()
            )
            OR public.has_role('clinician')
            OR public.has_role('healthcare_worker')
            OR public.has_role('admin')
        )
    );

-- Experimental model registry readable by clinicians and admins only
CREATE POLICY "Clinicians and admins can view experimental models"
    ON public.experimental_model_registry FOR SELECT TO authenticated
    USING (public.has_role('clinician') OR public.has_role('admin'));

