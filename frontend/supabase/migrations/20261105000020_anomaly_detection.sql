-- ==============================================================================
-- Migration: 20261105000020_anomaly_detection.sql
-- Phase 2.5: Anomaly Detection Architecture, Multi-Domain Detectors,
-- Data Quality Metrics, Review Workflow, Audit Logs & RLS
-- ==============================================================================

-- 1. Central Anomaly Records Table
CREATE TABLE IF NOT EXISTS public.anomaly_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    anomaly_number text NOT NULL UNIQUE,
    category text NOT NULL CHECK (
        category IN (
            'patient_data',
            'assessment_inconsistency',
            'data_quality',
            'environmental',
            'operational'
        )
    ),
    subtype text NOT NULL,
    severity text NOT NULL CHECK (
        severity IN ('low', 'medium', 'high', 'critical')
    ),
    status text NOT NULL DEFAULT 'detected' CHECK (
        status IN (
            'detected',
            'pending_review',
            'under_review',
            'confirmed',
            'dismissed',
            'resolved',
            'escalated'
        )
    ),
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    facility_id text,
    title_en text NOT NULL,
    title_bn text NOT NULL,
    description_en text NOT NULL,
    description_bn text NOT NULL,
    detection_methodology text NOT NULL CHECK (
        detection_methodology IN (
            'deterministic_rule',
            'statistical_mad',
            'statistical_iqr',
            'rolling_zscore',
            'multivariate_isolation'
        )
    ),
    rule_id text,
    rule_version text NOT NULL DEFAULT '1.0.0',
    triggering_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
    observed_value jsonb NOT NULL DEFAULT '{}'::jsonb,
    expected_reference jsonb NOT NULL DEFAULT '{}'::jsonb,
    context_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    assigned_role text CHECK (
        assigned_role IN ('clinician', 'healthcare_worker', 'administrator')
    ),
    assigned_to text,
    resolution_outcome text CHECK (
        resolution_outcome IN (
            'data_corrected',
            'false_positive_clinical_variation',
            'sensor_recalibrated',
            'system_bug_logged',
            'acknowledged_acceptable_deviation'
        )
    ),
    resolution_notes text,
    resolved_by text,
    resolved_at timestamptz,
    detected_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_anomaly_category ON public.anomaly_records(category);
CREATE INDEX IF NOT EXISTS idx_anomaly_subtype ON public.anomaly_records(subtype);
CREATE INDEX IF NOT EXISTS idx_anomaly_severity ON public.anomaly_records(severity);
CREATE INDEX IF NOT EXISTS idx_anomaly_status ON public.anomaly_records(status);
CREATE INDEX IF NOT EXISTS idx_anomaly_entity ON public.anomaly_records(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_facility ON public.anomaly_records(facility_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_detected_at ON public.anomaly_records(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomaly_rule_id ON public.anomaly_records(rule_id);

-- 2. Anomaly Review & Workflow Transition Audit Table
CREATE TABLE IF NOT EXISTS public.anomaly_review_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    anomaly_id uuid NOT NULL REFERENCES public.anomaly_records(id) ON DELETE CASCADE,
    previous_status text NOT NULL,
    new_status text NOT NULL,
    actor_id text NOT NULL,
    actor_role text NOT NULL,
    action text NOT NULL CHECK (
        action IN (
            'detect',
            'assign',
            'start_review',
            'confirm',
            'dismiss',
            'resolve',
            'escalate',
            'reopen'
        )
    ),
    notes text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_anomaly_events_anomaly_id ON public.anomaly_review_events(anomaly_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_events_created_at ON public.anomaly_review_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomaly_events_actor ON public.anomaly_review_events(actor_id);

-- 3. Data Quality Metrics Snapshots Table
CREATE TABLE IF NOT EXISTS public.data_quality_metrics_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date date NOT NULL,
    facility_id text,
    domain text NOT NULL CHECK (
        domain IN ('patients', 'assessments', 'environmental', 'operational', 'overall')
    ),
    total_records integer NOT NULL DEFAULT 0,
    missing_count integer NOT NULL DEFAULT 0,
    invalid_count integer NOT NULL DEFAULT 0,
    inconsistent_count integer NOT NULL DEFAULT 0,
    stale_count integer NOT NULL DEFAULT 0,
    confirmed_count integer NOT NULL DEFAULT 0,
    quality_score numeric(5, 2) NOT NULL DEFAULT 100.00 CHECK (quality_score >= 0 AND quality_score <= 100),
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dq_snapshots_date ON public.data_quality_metrics_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_dq_snapshots_facility ON public.data_quality_metrics_snapshots(facility_id);
CREATE INDEX IF NOT EXISTS idx_dq_snapshots_domain ON public.data_quality_metrics_snapshots(domain);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.anomaly_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomaly_review_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_quality_metrics_snapshots ENABLE ROW LEVEL SECURITY;

-- Anomaly Records Policies
-- Clinicians and healthcare workers can view clinical/assessment/patient anomalies
CREATE POLICY "Authorized clinicians and workers view relevant anomalies"
    ON public.anomaly_records
    FOR SELECT
    TO authenticated
    USING (
        category IN ('patient_data', 'assessment_inconsistency')
        OR (
            EXISTS (
                SELECT 1 FROM public.user_roles ur
                JOIN public.roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid()
                AND r.name IN ('administrator', 'clinical_director')
            )
        )
    );

-- Administrators can view all anomalies
CREATE POLICY "Administrators full view on anomaly records"
    ON public.anomaly_records
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('administrator', 'system_admin')
        )
    );

-- Service role bypass for backend processing
CREATE POLICY "Service role full access on anomaly records"
    ON public.anomaly_records
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Anomaly Review Events Policies
CREATE POLICY "Authorized staff view anomaly review events"
    ON public.anomaly_review_events
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authorized staff create anomaly review events"
    ON public.anomaly_review_events
    FOR INSERT
    TO authenticated
    WITH CHECK (actor_id = auth.uid()::text);

CREATE POLICY "Service role full access on review events"
    ON public.anomaly_review_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Data Quality Snapshots Policies
CREATE POLICY "Authenticated staff view data quality snapshots"
    ON public.data_quality_metrics_snapshots
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role full access on data quality snapshots"
    ON public.data_quality_metrics_snapshots
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

