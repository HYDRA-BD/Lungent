-- ==============================================================================
-- Migration: 20261105000017_operational_analytics.sql
-- Phase 1.23: Centralized Operational Analytics, Telemetry & Data Quality Monitoring
-- ==============================================================================

-- 1. Platform Telemetry Events Table (Non-PHI operational monitoring)
CREATE TABLE IF NOT EXISTS public.platform_telemetry_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subsystem text NOT NULL CHECK (
        subsystem IN (
            'api',
            'auth',
            'assessments',
            'referrals',
            'notifications',
            'reporting',
            'environmental',
            'offline_sync',
            'general'
        )
    ),
    event_type text NOT NULL,
    status_code integer DEFAULT 200,
    duration_ms integer DEFAULT 0,
    error_category text CHECK (
        error_category IS NULL OR error_category IN (
            'network',
            'validation',
            'permission',
            'timeout',
            'upstream_service',
            'internal'
        )
    ),
    facility_id uuid REFERENCES public.healthcare_facilities(id) ON DELETE SET NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for telemetry performance
CREATE INDEX IF NOT EXISTS idx_platform_telemetry_subsystem ON public.platform_telemetry_events(subsystem);
CREATE INDEX IF NOT EXISTS idx_platform_telemetry_created_at ON public.platform_telemetry_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_telemetry_status_code ON public.platform_telemetry_events(status_code);
CREATE INDEX IF NOT EXISTS idx_platform_telemetry_facility_id ON public.platform_telemetry_events(facility_id);

-- 2. Daily Operational Metrics Rollup Table
CREATE TABLE IF NOT EXISTS public.operational_metrics_daily (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date date NOT NULL,
    facility_id uuid REFERENCES public.healthcare_facilities(id) ON DELETE CASCADE,
    division text,
    metric_category text NOT NULL CHECK (
        metric_category IN (
            'patient',
            'assessment',
            'facility',
            'worker',
            'workflow',
            'referral',
            'environmental',
            'data_quality',
            'performance'
        )
    ),
    metric_key text NOT NULL,
    metric_value numeric NOT NULL DEFAULT 0,
    dimensions jsonb NOT NULL DEFAULT '{}'::jsonb,
    calculated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_daily_metric UNIQUE (metric_date, metric_key, facility_id, division)
);

-- Indexes for fast rollup lookups
CREATE INDEX IF NOT EXISTS idx_op_metrics_date ON public.operational_metrics_daily(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_op_metrics_key ON public.operational_metrics_daily(metric_key);
CREATE INDEX IF NOT EXISTS idx_op_metrics_facility ON public.operational_metrics_daily(facility_id);
CREATE INDEX IF NOT EXISTS idx_op_metrics_category ON public.operational_metrics_daily(metric_category);

-- 3. Analytics Access Audit Log Table
CREATE TABLE IF NOT EXISTS public.analytics_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    user_role text NOT NULL DEFAULT 'admin',
    dashboard_view text NOT NULL CHECK (
        dashboard_view IN (
            'admin_overview',
            'facility_operational',
            'clinical_workflow',
            'worker_activity',
            'export_summary'
        )
    ),
    facility_id uuid REFERENCES public.healthcare_facilities(id) ON DELETE SET NULL,
    filters_applied jsonb NOT NULL DEFAULT '{}'::jsonb,
    ip_address text DEFAULT '127.0.0.1',
    user_agent text DEFAULT 'Lungent-Web',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_audit_created_at ON public.analytics_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_audit_user_id ON public.analytics_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_audit_facility ON public.analytics_audit_logs(facility_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.platform_telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_audit_logs ENABLE ROW LEVEL SECURITY;

-- Telemetry Policies: Admins can view all telemetry; authenticated services can insert
CREATE POLICY "Admins can view platform telemetry"
    ON public.platform_telemetry_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Authenticated users and staff can insert telemetry"
    ON public.platform_telemetry_events
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Daily Metrics Policies: Admins can view all, clinicians/workers can view for their assigned facility
CREATE POLICY "Admins can view all daily metrics"
    ON public.operational_metrics_daily
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Facility staff can view their facility daily metrics"
    ON public.operational_metrics_daily
    FOR SELECT
    USING (
        facility_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.facility_staff
            WHERE facility_staff.user_id = auth.uid()
            AND facility_staff.facility_id = operational_metrics_daily.facility_id
            AND facility_staff.is_active = true
        )
    );

-- Audit Log Policies: Admins can view all analytics audit logs
CREATE POLICY "Admins can view analytics audit logs"
    ON public.analytics_audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "System and staff can record analytics audit logs"
    ON public.analytics_audit_logs
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

