-- Migration: 20261105000009_screening_eligibility_engine.sql
-- Description: Phase 1.13 - Lung Cancer Screening Eligibility Engine & Clinical Guidelines Registry

-- 1. Enums for Screening Eligibility Module
DO $$ BEGIN
  CREATE TYPE public.screening_execution_status AS ENUM (
    'completed',
    'guideline_not_approved',
    'insufficient_information',
    'criteria_unmet',
    'criteria_met',
    'excluded'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.screening_eligibility_outcome AS ENUM (
    'eligible',
    'not_eligible',
    'cannot_be_determined',
    'additional_info_required',
    'evaluation_unavailable',
    'guideline_not_approved'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.criterion_evaluation_status AS ENUM (
    'met',
    'unmet',
    'missing',
    'not_applicable',
    'indeterminate'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Screening Guidelines Registry Table
CREATE TABLE IF NOT EXISTS public.screening_guidelines (
  id TEXT PRIMARY KEY,
  guideline_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  official_source_url TEXT,
  publication_reference TEXT,
  jurisdiction TEXT NOT NULL DEFAULT 'United States',
  intended_population TEXT NOT NULL,
  publication_date DATE NOT NULL,
  last_updated_date DATE,
  screening_interval_months INTEGER NOT NULL DEFAULT 12,
  recommended_modality TEXT NOT NULL DEFAULT 'low_dose_computed_tomography',
  lifecycle_status public.methodology_lifecycle_status NOT NULL DEFAULT 'awaiting_clinical_approval',
  approval_authority TEXT,
  approved_for_bangladesh BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMPTZ,
  review_date TIMESTAMPTZ,
  known_limitations TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Screening Guideline Versions Table
CREATE TABLE IF NOT EXISTS public.screening_guideline_versions (
  id TEXT PRIMARY KEY,
  guideline_id TEXT NOT NULL REFERENCES public.screening_guidelines(id) ON DELETE CASCADE,
  version_tag TEXT NOT NULL,
  specification_reference TEXT NOT NULL,
  min_age INTEGER NOT NULL DEFAULT 50,
  max_age INTEGER NOT NULL DEFAULT 80,
  min_pack_years NUMERIC(5,2) NOT NULL DEFAULT 20.0,
  max_quit_years INTEGER DEFAULT 15,
  requires_asymptomatic BOOLEAN NOT NULL DEFAULT true,
  exclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
  criteria_definitions JSONB NOT NULL DEFAULT '[]'::jsonb,
  lifecycle_status public.methodology_lifecycle_status NOT NULL DEFAULT 'awaiting_clinical_approval',
  effective_date TIMESTAMPTZ NOT NULL,
  changelog TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(guideline_id, version_tag)
);

-- 4. Screening Eligibility Records Table
CREATE TABLE IF NOT EXISTS public.screening_eligibility_records (
  id TEXT PRIMARY KEY,
  assessment_id TEXT REFERENCES public.patient_assessments(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_canonical_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  facility_id TEXT NOT NULL REFERENCES public.healthcare_facilities(id) ON DELETE RESTRICT,
  guideline_id TEXT NOT NULL REFERENCES public.screening_guidelines(id) ON DELETE RESTRICT,
  guideline_code TEXT NOT NULL,
  guideline_name TEXT NOT NULL,
  guideline_version TEXT NOT NULL,
  execution_mode public.risk_execution_mode NOT NULL DEFAULT 'clinical_production',
  execution_status public.screening_execution_status NOT NULL,
  eligibility_outcome public.screening_eligibility_outcome NOT NULL,
  is_clinically_approved BOOLEAN NOT NULL DEFAULT false,
  is_research_execution BOOLEAN NOT NULL DEFAULT false,
  has_missing_required_inputs BOOLEAN NOT NULL DEFAULT false,
  missing_inputs_list TEXT[] NOT NULL DEFAULT '{}',
  inconsistent_inputs_list TEXT[] NOT NULL DEFAULT '{}',
  recommended_interval_months INTEGER DEFAULT 12,
  recommended_modality TEXT DEFAULT 'low_dose_computed_tomography',
  next_recommended_screening_date DATE,
  governance_notice TEXT NOT NULL,
  clinical_summary TEXT NOT NULL,
  input_snapshot_hash TEXT NOT NULL,
  executed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  executed_by_name TEXT,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Screening Input Snapshots Table
CREATE TABLE IF NOT EXISTS public.screening_input_snapshots (
  id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES public.screening_eligibility_records(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  snapshot_hash TEXT NOT NULL,
  raw_inputs JSONB NOT NULL,
  derived_variables JSONB NOT NULL,
  provenance_map JSONB NOT NULL,
  validation_issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Screening Criterion Evaluations Table
CREATE TABLE IF NOT EXISTS public.screening_criterion_evaluations (
  id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES public.screening_eligibility_records(id) ON DELETE CASCADE,
  criterion_key TEXT NOT NULL,
  criterion_label TEXT NOT NULL,
  criterion_rule_description TEXT NOT NULL,
  required_value_expression TEXT NOT NULL,
  patient_actual_value TEXT NOT NULL,
  status public.criterion_evaluation_status NOT NULL,
  is_blocking_exclusion BOOLEAN NOT NULL DEFAULT false,
  clinical_explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_screening_guidelines_status ON public.screening_guidelines(lifecycle_status, approved_for_bangladesh);
CREATE INDEX IF NOT EXISTS idx_screening_records_patient ON public.screening_eligibility_records(patient_id, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_screening_records_facility ON public.screening_eligibility_records(facility_id);
CREATE INDEX IF NOT EXISTS idx_screening_records_guideline ON public.screening_eligibility_records(guideline_id);
CREATE INDEX IF NOT EXISTS idx_screening_snapshots_record ON public.screening_input_snapshots(record_id);
CREATE INDEX IF NOT EXISTS idx_screening_evaluations_record ON public.screening_criterion_evaluations(record_id);

-- 8. Row Level Security (RLS)
ALTER TABLE public.screening_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screening_guideline_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screening_eligibility_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screening_input_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screening_criterion_evaluations ENABLE ROW LEVEL SECURITY;

-- Guidelines are readable by authenticated users and clinicians
CREATE POLICY "Guidelines readable by authenticated users"
  ON public.screening_guidelines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Guideline versions readable by authenticated users"
  ON public.screening_guideline_versions FOR SELECT
  TO authenticated
  USING (true);

-- Eligibility records read access (patient, assigned clinician, facility worker)
CREATE POLICY "Users can view own screening records or authorized patients"
  ON public.screening_eligibility_records FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE associated_user_profile_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_facility_assignments
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Authorized staff can insert screening records"
  ON public.screening_eligibility_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_facility_assignments
      WHERE user_id = auth.uid() AND is_active = true
    ) OR
    patient_id IN (
      SELECT id FROM public.patients WHERE associated_user_profile_id = auth.uid()
    )
  );

CREATE POLICY "Screening snapshots readable by authorized users"
  ON public.screening_input_snapshots FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE associated_user_profile_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_facility_assignments
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Screening evaluations readable by authorized users"
  ON public.screening_criterion_evaluations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.screening_eligibility_records r
      WHERE r.id = record_id AND (
        r.patient_id IN (SELECT id FROM public.patients WHERE associated_user_profile_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.user_facility_assignments WHERE user_id = auth.uid() AND is_active = true)
      )
    )
  );

