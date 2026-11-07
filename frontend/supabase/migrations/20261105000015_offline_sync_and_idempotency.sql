-- ==============================================================================
-- Lungent Platform Migration: Offline Sync and Idempotency Architecture
-- Milestone: Phase 1.21 — Limited Offline Functionality
-- ==============================================================================

-- 1. Extend patient_assessments for Idempotency and Optimistic Concurrency Control
DO $$ BEGIN
    ALTER TABLE public.patient_assessments
        ADD COLUMN IF NOT EXISTS client_operation_id text UNIQUE,
        ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_patient_assessments_client_op ON public.patient_assessments(client_operation_id);

-- 2. Offline Sync Operations & Conflict Tracking Table
CREATE TABLE IF NOT EXISTS public.assessment_sync_operations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_operation_id text UNIQUE NOT NULL,
    draft_id text NOT NULL,
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
    assessment_type text NOT NULL CHECK (assessment_type IN ('lung_cancer_risk', 'screening_eligibility', 'symptom_triage', 'comprehensive_intake', 'self_check')),
    form_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'conflict')),
    server_assessment_id uuid REFERENCES public.patient_assessments(id) ON DELETE SET NULL,
    base_version integer NOT NULL DEFAULT 1,
    server_version integer NOT NULL DEFAULT 1,
    conflict_details jsonb DEFAULT NULL,
    resolved_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    resolution_notes text,
    client_created_at timestamptz NOT NULL,
    client_updated_at timestamptz NOT NULL,
    synced_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for efficient sync lookups and audit trails
CREATE INDEX IF NOT EXISTS idx_sync_client_op_id ON public.assessment_sync_operations(client_operation_id);
CREATE INDEX IF NOT EXISTS idx_sync_draft_id ON public.assessment_sync_operations(draft_id);
CREATE INDEX IF NOT EXISTS idx_sync_patient_id ON public.assessment_sync_operations(patient_id);
CREATE INDEX IF NOT EXISTS idx_sync_user_id ON public.assessment_sync_operations(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_status ON public.assessment_sync_operations(status);
CREATE INDEX IF NOT EXISTS idx_sync_created_at ON public.assessment_sync_operations(created_at);

-- 3. Row Level Security (RLS) Configuration
ALTER TABLE public.assessment_sync_operations ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins full access on assessment_sync_operations"
    ON public.assessment_sync_operations
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Healthcare Workers and Clinicians can insert and view sync operations they originated
CREATE POLICY "Clinicians and Workers manage their sync operations"
    ON public.assessment_sync_operations
    FOR ALL
    TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('clinician', 'healthcare_worker')
        )
    )
    WITH CHECK (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('clinician', 'healthcare_worker')
        )
    );

-- Patients can view and create sync operations matching their own patient profile
CREATE POLICY "Patients manage their own assessment sync operations"
    ON public.assessment_sync_operations
    FOR ALL
    TO authenticated
    USING (
        user_id = auth.uid()
        OR patient_id IN (
            SELECT id FROM public.patients WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        user_id = auth.uid()
        OR patient_id IN (
            SELECT id FROM public.patients WHERE user_id = auth.uid()
        )
    );

