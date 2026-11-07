-- ==============================================================================
-- Migration: 20261105000016_reporting_system.sql
-- Phase 1.22: Centralized Reporting System & Audit Logging
-- ==============================================================================

-- 1. Generated Reports Table
CREATE TABLE IF NOT EXISTS public.generated_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_reference text NOT NULL UNIQUE,
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    report_type text NOT NULL CHECK (
        report_type IN (
            'patient_assessment',
            'clinical_assessment',
            'risk_estimation',
            'screening_eligibility',
            'symptom_triage',
            'referral_followup',
            'consolidated_history'
        )
    ),
    title text NOT NULL,
    summary text,
    language text NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'bn')),
    template_version text NOT NULL DEFAULT '1.22.0',
    source_assessment_id uuid REFERENCES public.patient_assessments(id) ON DELETE SET NULL,
    source_referral_id uuid REFERENCES public.patient_referrals(id) ON DELETE SET NULL,
    source_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    content_html text NOT NULL,
    file_size_bytes integer DEFAULT 0,
    storage_path text,
    generated_by_user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    generated_by_role text NOT NULL DEFAULT 'clinician' CHECK (
        generated_by_role IN ('patient', 'clinician', 'healthcare_worker', 'admin', 'system')
    ),
    facility_id uuid REFERENCES public.healthcare_facilities(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'final' CHECK (
        status IN ('draft', 'final', 'archived', 'revoked')
    ),
    is_patient_accessible boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance and reporting queries
CREATE INDEX IF NOT EXISTS idx_generated_reports_patient_id ON public.generated_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_report_ref ON public.generated_reports(report_reference);
CREATE INDEX IF NOT EXISTS idx_generated_reports_type ON public.generated_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_generated_reports_created_at ON public.generated_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_reports_assessment_id ON public.generated_reports(source_assessment_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_facility_id ON public.generated_reports(facility_id);

-- 2. Report Access Audit Table
CREATE TABLE IF NOT EXISTS public.report_access_audit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id uuid NOT NULL REFERENCES public.generated_reports(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    user_role text NOT NULL DEFAULT 'patient',
    access_type text NOT NULL CHECK (
        access_type IN ('view', 'download_pdf', 'download_html', 'print')
    ),
    ip_address text,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_access_audit_report_id ON public.report_access_audit(report_id);
CREATE INDEX IF NOT EXISTS idx_report_access_audit_user_id ON public.report_access_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_report_access_audit_created_at ON public.report_access_audit(created_at DESC);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_access_audit ENABLE ROW LEVEL SECURITY;

-- Generated Reports Policies

-- Clinicians and healthcare workers can view reports for patients in their facility or across workspace
CREATE POLICY "Clinicians and workers can view authorized reports"
    ON public.generated_reports
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('clinician', 'healthcare_worker', 'admin')
        )
    );

-- Clinicians and workers can create reports
CREATE POLICY "Clinicians and workers can insert reports"
    ON public.generated_reports
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('clinician', 'healthcare_worker', 'admin', 'patient')
        )
    );

-- Patients can only view final reports specifically accessible to them for their patient ID
CREATE POLICY "Patients can view their accessible reports"
    ON public.generated_reports
    FOR SELECT
    TO authenticated
    USING (
        is_patient_accessible = true
        AND status = 'final'
        AND patient_id IN (
            SELECT id FROM public.patients WHERE user_id = auth.uid()
        )
    );

-- Report Access Audit Policies

-- Authenticated users can insert audit records for their actions
CREATE POLICY "Users can log their report access"
    ON public.report_access_audit
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Admins and clinicians can view report access audit logs
CREATE POLICY "Staff can view audit records"
    ON public.report_access_audit
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'clinician')
        )
    );
