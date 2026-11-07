-- ==============================================================================
-- Migration: 20261105000025_advanced_reporting_and_operational_intelligence.sql
-- Phase 2.10: Advanced Reporting, Facility Benchmarking & Predictive Operational Analytics
-- ==============================================================================

-- 1. Institutional Operational Reports Table
CREATE TABLE IF NOT EXISTS public.institutional_operational_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_reference text NOT NULL UNIQUE,
    facility_id uuid REFERENCES public.healthcare_facilities(id) ON DELETE SET NULL,
    reporting_period_start timestamptz NOT NULL,
    reporting_period_end timestamptz NOT NULL,
    report_category text NOT NULL CHECK (
        report_category IN (
            'institutional_summary',
            'facility_utilization',
            'worker_activity',
            'clinical_workflow',
            'referral_followup',
            'population_research',
            'geographic_intelligence'
        )
    ),
    title text NOT NULL,
    report_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    generated_by_user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    user_role text NOT NULL DEFAULT 'admin',
    status text NOT NULL DEFAULT 'final' CHECK (
        status IN ('draft', 'final', 'archived')
    ),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inst_reports_facility_id ON public.institutional_operational_reports(facility_id);
CREATE INDEX IF NOT EXISTS idx_inst_reports_category ON public.institutional_operational_reports(report_category);
CREATE INDEX IF NOT EXISTS idx_inst_reports_created_at ON public.institutional_operational_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inst_reports_period ON public.institutional_operational_reports(reporting_period_start, reporting_period_end);

-- 2. Facility Performance Benchmarks Table
CREATE TABLE IF NOT EXISTS public.facility_performance_benchmarks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id uuid NOT NULL REFERENCES public.healthcare_facilities(id) ON DELETE CASCADE,
    benchmark_date date NOT NULL,
    facility_tier text NOT NULL CHECK (
        facility_tier IN (
            'national_specialized',
            'tertiary_medical_college',
            'district_hospital',
            'upazila_health_complex',
            'community_clinic'
        )
    ),
    patient_registration_volume integer NOT NULL DEFAULT 0,
    assessments_initiated integer NOT NULL DEFAULT 0,
    assessments_completed integer NOT NULL DEFAULT 0,
    assessment_completion_rate numeric NOT NULL DEFAULT 0.0,
    mean_processing_time_hours numeric NOT NULL DEFAULT 0.0,
    mean_review_turnaround_hours numeric NOT NULL DEFAULT 0.0,
    referrals_initiated integer NOT NULL DEFAULT 0,
    referrals_completed integer NOT NULL DEFAULT 0,
    referral_completion_rate numeric NOT NULL DEFAULT 0.0,
    active_workers_count integer NOT NULL DEFAULT 0,
    data_completeness_pct numeric NOT NULL DEFAULT 0.0,
    composite_operational_index numeric NOT NULL DEFAULT 0.0,
    benchmarked_against text NOT NULL DEFAULT 'national_tier_peers',
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_facility_benchmark UNIQUE (facility_id, benchmark_date)
);

CREATE INDEX IF NOT EXISTS idx_facility_benchmarks_date ON public.facility_performance_benchmarks(benchmark_date DESC);
CREATE INDEX IF NOT EXISTS idx_facility_benchmarks_facility ON public.facility_performance_benchmarks(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_benchmarks_tier ON public.facility_performance_benchmarks(facility_tier);
CREATE INDEX IF NOT EXISTS idx_facility_benchmarks_composite ON public.facility_performance_benchmarks(composite_operational_index DESC);

-- 3. Operational Forecasting Records Table
CREATE TABLE IF NOT EXISTS public.operational_forecasting_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id uuid REFERENCES public.healthcare_facilities(id) ON DELETE CASCADE,
    forecast_generated_at timestamptz NOT NULL DEFAULT now(),
    target_metric text NOT NULL CHECK (
        target_metric IN (
            'assessment_volume',
            'referral_workload',
            'clinical_review_queue',
            'facility_capacity_strain'
        )
    ),
    forecast_horizon_days integer NOT NULL DEFAULT 14,
    historical_window_days integer NOT NULL DEFAULT 60,
    forecast_points jsonb NOT NULL DEFAULT '[]'::jsonb,
    model_type text NOT NULL CHECK (
        model_type IN (
            'holt_winters_exponential_smoothing',
            'moving_average_baseline',
            'trend_seasonal_decomposition'
        )
    ),
    mean_absolute_error numeric NOT NULL DEFAULT 0.0,
    root_mean_squared_error numeric NOT NULL DEFAULT 0.0,
    mean_absolute_percentage_error numeric NOT NULL DEFAULT 0.0,
    capacity_bottleneck_detected boolean NOT NULL DEFAULT false,
    bottleneck_details jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_op_forecast_facility ON public.operational_forecasting_records(facility_id);
CREATE INDEX IF NOT EXISTS idx_op_forecast_metric ON public.operational_forecasting_records(target_metric);
CREATE INDEX IF NOT EXISTS idx_op_forecast_generated ON public.operational_forecasting_records(forecast_generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_op_forecast_bottleneck ON public.operational_forecasting_records(capacity_bottleneck_detected);

-- 4. Custom Report Templates Table
CREATE TABLE IF NOT EXISTS public.custom_report_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name text NOT NULL,
    category text NOT NULL CHECK (
        category IN (
            'operational',
            'clinical',
            'geographic',
            'population_research',
            'benchmarking'
        )
    ),
    configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_by_user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    facility_id uuid REFERENCES public.healthcare_facilities(id) ON DELETE SET NULL,
    is_institutional_shared boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_templates_category ON public.custom_report_templates(category);
CREATE INDEX IF NOT EXISTS idx_report_templates_user ON public.custom_report_templates(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_facility ON public.custom_report_templates(facility_id);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.institutional_operational_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_performance_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_forecasting_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_report_templates ENABLE ROW LEVEL SECURITY;

-- Institutional Reports RLS
CREATE POLICY "Authorized staff can read institutional operational reports"
    ON public.institutional_operational_reports
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'clinician', 'healthcare_worker')
        )
    );

CREATE POLICY "Admins can insert and manage institutional operational reports"
    ON public.institutional_operational_reports
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'clinician')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'clinician')
        )
    );

-- Facility Benchmarks RLS
CREATE POLICY "Authorized users can read facility performance benchmarks"
    ON public.facility_performance_benchmarks
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'clinician', 'healthcare_worker')
        )
    );

CREATE POLICY "Admins can insert facility performance benchmarks"
    ON public.facility_performance_benchmarks
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Operational Forecasting RLS
CREATE POLICY "Authorized users can read operational forecasting records"
    ON public.operational_forecasting_records
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'clinician')
        )
    );

CREATE POLICY "Admins can manage operational forecasting records"
    ON public.operational_forecasting_records
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Custom Report Templates RLS
CREATE POLICY "Users can read own and shared custom report templates"
    ON public.custom_report_templates
    FOR SELECT
    TO authenticated
    USING (
        created_by_user_id = auth.uid()
        OR is_institutional_shared = true
        OR EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can create custom report templates"
    ON public.custom_report_templates
    FOR INSERT
    TO authenticated
    WITH CHECK (
        created_by_user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'clinician')
        )
    );

-- Service Role Full Access
CREATE POLICY "Service role full access on institutional reports"
    ON public.institutional_operational_reports FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on facility benchmarks"
    ON public.facility_performance_benchmarks FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on operational forecasting"
    ON public.operational_forecasting_records FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on custom report templates"
    ON public.custom_report_templates FOR ALL TO service_role USING (true) WITH CHECK (true);

