-- ==============================================================================
-- Migration: 20261105000023_population_intelligence.sql
-- Description: Phase 2.8 Population-Level Intelligence Framework
-- Author: Lungent Architecture Team
-- ==============================================================================

-- 1. Create Enums for Population-Level Intelligence
DO $$ BEGIN
    CREATE TYPE public.population_sampling_methodology AS ENUM (
        'clinical_convenience_sample',
        'stratified_sentinel_surveillance',
        'community_screening_pilot',
        'demographic_health_survey_benchmark'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.population_aggregation_level AS ENUM (
        'national',
        'division',
        'district',
        'upazila'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Population Cohort Definitions Table
CREATE TABLE IF NOT EXISTS public.population_cohort_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_code VARCHAR(60) NOT NULL UNIQUE,
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    inclusion_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    exclusion_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    sampling_methodology public.population_sampling_methodology NOT NULL DEFAULT 'clinical_convenience_sample',
    observation_period_start DATE NOT NULL,
    observation_period_end DATE NOT NULL,
    total_cohort_size INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_pop_cohort_code ON public.population_cohort_definitions(cohort_code);
CREATE INDEX IF NOT EXISTS idx_pop_cohort_active ON public.population_cohort_definitions(is_active);

-- 3. Population Aggregate Snapshots Table (With k-Anonymity Cell Protection)
CREATE TABLE IF NOT EXISTS public.population_aggregate_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_id UUID REFERENCES public.population_cohort_definitions(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    aggregation_level public.population_aggregation_level NOT NULL DEFAULT 'national',
    geographic_entity_id UUID REFERENCES public.geographic_entities(id) ON DELETE SET NULL,
    division VARCHAR(100),
    district VARCHAR(100),
    upazila VARCHAR(100),
    total_assessed_individuals INT NOT NULL DEFAULT 0,
    male_count INT,
    female_count INT,
    age_distribution JSONB NOT NULL DEFAULT '{}'::jsonb,
    current_smoker_count INT,
    bidi_smoker_count INT,
    biomass_cooking_count INT,
    occupational_dust_count INT,
    copd_history_count INT,
    prior_tb_count INT,
    elevated_pm25_exposure_count INT,
    screening_eligible_count INT,
    urgent_referral_flagged_count INT,
    privacy_k_threshold INT NOT NULL DEFAULT 5,
    is_privacy_suppressed BOOLEAN NOT NULL DEFAULT false,
    provenance_hash VARCHAR(128) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_pop_snap_cohort ON public.population_aggregate_snapshots(cohort_id);
CREATE INDEX IF NOT EXISTS idx_pop_snap_date ON public.population_aggregate_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_pop_snap_level ON public.population_aggregate_snapshots(aggregation_level);
CREATE INDEX IF NOT EXISTS idx_pop_snap_geo ON public.population_aggregate_snapshots(division, district);

-- 4. Population Geographic Metrics Table
CREATE TABLE IF NOT EXISTS public.population_geographic_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID REFERENCES public.population_aggregate_snapshots(id) ON DELETE CASCADE,
    division VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    assessment_density_per_100k NUMERIC(8,2),
    smoking_prevalence_pct NUMERIC(5,2),
    biomass_prevalence_pct NUMERIC(5,2),
    ambient_pm25_annual_avg NUMERIC(6,2),
    screening_eligibility_pct NUMERIC(5,2),
    symptom_alert_pct NUMERIC(5,2),
    sample_size INT NOT NULL,
    sample_coverage_tier VARCHAR(30) NOT NULL DEFAULT 'moderate',
    is_suppressed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_pop_geo_district ON public.population_geographic_metrics(district);
CREATE INDEX IF NOT EXISTS idx_pop_geo_division ON public.population_geographic_metrics(division);

-- 5. Population Research Queries & Audit Log Table
CREATE TABLE IF NOT EXISTS public.population_research_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_code VARCHAR(60) NOT NULL UNIQUE,
    title_en VARCHAR(255) NOT NULL,
    title_bn VARCHAR(255) NOT NULL,
    query_parameters JSONB NOT NULL,
    executed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    execution_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    records_analyzed_count INT NOT NULL,
    results_summary JSONB NOT NULL,
    privacy_audit_hash VARCHAR(128) NOT NULL,
    non_causal_acknowledgment BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_pop_research_code ON public.population_research_queries(query_code);
CREATE INDEX IF NOT EXISTS idx_pop_research_exec ON public.population_research_queries(executed_by);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.population_cohort_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.population_aggregate_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.population_geographic_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.population_research_queries ENABLE ROW LEVEL SECURITY;

-- 7. Row Level Security Policies

-- Population Cohort Definitions: Viewable by authorized staff, managed by admin
CREATE POLICY "Cohorts viewable by authenticated staff"
    ON public.population_cohort_definitions FOR SELECT TO authenticated
    USING (
        is_active = true OR
        public.has_role('admin') OR
        public.has_role('clinician')
    );

CREATE POLICY "Admin manage cohorts"
    ON public.population_cohort_definitions FOR ALL TO authenticated
    USING (public.has_role('admin'));

-- Population Aggregate Snapshots: Viewable by authenticated clinical and public health staff
CREATE POLICY "Snapshots viewable by authenticated staff"
    ON public.population_aggregate_snapshots FOR SELECT TO authenticated
    USING (
        public.has_role('admin') OR
        public.has_role('clinician') OR
        public.has_role('healthcare_worker')
    );

CREATE POLICY "Admin and clinician manage snapshots"
    ON public.population_aggregate_snapshots FOR ALL TO authenticated
    USING (public.has_role('admin') OR public.has_role('clinician'));

-- Population Geographic Metrics: Viewable by authenticated staff
CREATE POLICY "Geographic metrics viewable by authenticated staff"
    ON public.population_geographic_metrics FOR SELECT TO authenticated
    USING (
        public.has_role('admin') OR
        public.has_role('clinician') OR
        public.has_role('healthcare_worker')
    );

CREATE POLICY "Admin and clinician manage geographic metrics"
    ON public.population_geographic_metrics FOR ALL TO authenticated
    USING (public.has_role('admin') OR public.has_role('clinician'));

-- Population Research Queries:
-- Researchers, clinicians, and admins can view and record research queries
CREATE POLICY "Research queries viewable by staff"
    ON public.population_research_queries FOR SELECT TO authenticated
    USING (
        executed_by = auth.uid() OR
        public.has_role('admin') OR
        public.has_role('clinician')
    );

CREATE POLICY "Staff insert research queries"
    ON public.population_research_queries FOR INSERT TO authenticated
    WITH CHECK (
        public.has_role('admin') OR
        public.has_role('clinician') OR
        public.has_role('healthcare_worker')
    );

-- Service Role Full Access
CREATE POLICY "Service role full access on population cohorts"
    ON public.population_cohort_definitions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on population snapshots"
    ON public.population_aggregate_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on population geographic metrics"
    ON public.population_geographic_metrics FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on population research queries"
    ON public.population_research_queries FOR ALL TO service_role USING (true) WITH CHECK (true);

