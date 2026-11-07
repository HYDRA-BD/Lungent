-- ==============================================================================
-- Migration: 20261105000022_advanced_environmental_intelligence.sql
-- Description: Phase 2.7 Advanced Environmental Intelligence Framework
-- Author: Lungent Architecture Team
-- ==============================================================================

-- 1. Create Enums for Advanced Environmental Intelligence
DO $$ BEGIN
    CREATE TYPE public.environmental_provider_classification AS ENUM (
        'direct_ground_station',
        'satellite_reanalysis',
        'atmospheric_model',
        'sensor_network_crowdsourced',
        'governmental_reference',
        'benchmark_composite'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.environmental_aggregation_period AS ENUM (
        'daily',
        'weekly',
        'monthly',
        'seasonal',
        'annual',
        'multi_year'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.bangladesh_climatic_season AS ENUM (
        'winter_dry',      -- November to February (Highest air pollution / thermal inversion)
        'pre_monsoon',     -- March to May (Hot & dusty, transition period)
        'monsoon',         -- June to October (Heavy rain, atmospheric washout)
        'all_season'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.spatial_modeling_method AS ENUM (
        'ground_station_direct',
        'idw_interpolation',
        'satellite_reanalysis_grid',
        'hybrid_calibrated_model',
        'regional_centroid_benchmark'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Environmental Provider Registry Table
CREATE TABLE IF NOT EXISTS public.environmental_provider_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_code VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    provider_type VARCHAR(60) NOT NULL,
    classification public.environmental_provider_classification NOT NULL DEFAULT 'atmospheric_model',
    official_url TEXT,
    coverage_jurisdiction VARCHAR(100) NOT NULL DEFAULT 'Bangladesh',
    update_frequency_minutes INT NOT NULL DEFAULT 60,
    reliability_tier VARCHAR(30) NOT NULL DEFAULT 'standard',
    attribution_text TEXT NOT NULL,
    api_endpoint TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_env_provider_code ON public.environmental_provider_registry(provider_code);
CREATE INDEX IF NOT EXISTS idx_env_provider_active ON public.environmental_provider_registry(is_active);

-- 3. Historical Environmental Snapshots Table
CREATE TABLE IF NOT EXISTS public.historical_environmental_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    geographic_entity_id UUID REFERENCES public.geographic_entities(id) ON DELETE CASCADE,
    division VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    upazila VARCHAR(100),
    aggregation_period public.environmental_aggregation_period NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    season public.bangladesh_climatic_season NOT NULL DEFAULT 'all_season',
    avg_us_aqi NUMERIC(6,2),
    avg_pm25 NUMERIC(6,2) NOT NULL,
    avg_pm10 NUMERIC(6,2),
    avg_no2 NUMERIC(6,2),
    avg_so2 NUMERIC(6,2),
    avg_co NUMERIC(6,2),
    avg_o3 NUMERIC(6,2),
    max_pm25 NUMERIC(6,2),
    min_pm25 NUMERIC(6,2),
    elevated_days_count INT NOT NULL DEFAULT 0,
    total_observation_hours INT NOT NULL DEFAULT 0,
    data_completeness_ratio NUMERIC(4,3) NOT NULL DEFAULT 1.000,
    primary_provider_code VARCHAR(60) NOT NULL,
    is_modelled BOOLEAN NOT NULL DEFAULT false,
    confidence_score NUMERIC(3,2) NOT NULL DEFAULT 0.90,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_hist_env_snap_geo ON public.historical_environmental_snapshots(geographic_entity_id);
CREATE INDEX IF NOT EXISTS idx_hist_env_snap_district ON public.historical_environmental_snapshots(district);
CREATE INDEX IF NOT EXISTS idx_hist_env_snap_period ON public.historical_environmental_snapshots(aggregation_period, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_hist_env_snap_season ON public.historical_environmental_snapshots(season);

-- 4. Geographic Environmental Models Table
CREATE TABLE IF NOT EXISTS public.geographic_environmental_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_code VARCHAR(60) NOT NULL UNIQUE,
    model_name VARCHAR(255) NOT NULL,
    administrative_level public.geographic_administrative_level NOT NULL,
    spatial_method public.spatial_modeling_method NOT NULL,
    grid_resolution_km NUMERIC(5,2),
    hotspot_threshold_pm25 NUMERIC(6,2) NOT NULL DEFAULT 150.00,
    active_features JSONB NOT NULL DEFAULT '{}'::jsonb,
    calibration_status VARCHAR(50) NOT NULL DEFAULT 'calibrated',
    last_calibrated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_geo_env_model_code ON public.geographic_environmental_models(model_code);

-- 5. Environmental Risk Factor Profiles Table
CREATE TABLE IF NOT EXISTS public.environmental_risk_factor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_code VARCHAR(60) NOT NULL UNIQUE,
    title_en VARCHAR(255) NOT NULL,
    title_bn VARCHAR(255) NOT NULL,
    risk_factor_category VARCHAR(60) NOT NULL,
    iarc_classification VARCHAR(60) NOT NULL DEFAULT 'Group 1',
    scientific_reference TEXT NOT NULL,
    measurement_methodology TEXT NOT NULL,
    clinical_disclaimer TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_env_risk_profile_code ON public.environmental_risk_factor_profiles(profile_code);
CREATE INDEX IF NOT EXISTS idx_env_risk_profile_cat ON public.environmental_risk_factor_profiles(risk_factor_category);

-- 6. Patient Environmental Exposure Contextual Assessments Table
CREATE TABLE IF NOT EXISTS public.patient_environmental_exposure_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    evaluation_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    residential_history_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
    estimated_cumulative_ambient_pm25_years NUMERIC(8,2),
    indoor_biomass_exposure_years NUMERIC(4,1) NOT NULL DEFAULT 0.0,
    occupational_dust_exposure_years NUMERIC(4,1) NOT NULL DEFAULT 0.0,
    data_confidence_score NUMERIC(3,2) NOT NULL DEFAULT 0.85,
    clinical_review_status VARCHAR(50) NOT NULL DEFAULT 'contextual_only',
    clinician_notes TEXT,
    reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    clinical_safety_acknowledgment BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_patient_env_assess_patient ON public.patient_environmental_exposure_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_env_assess_date ON public.patient_environmental_exposure_assessments(evaluation_date);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.environmental_provider_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_environmental_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geographic_environmental_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_risk_factor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_environmental_exposure_assessments ENABLE ROW LEVEL SECURITY;

-- 8. Row Level Security Policies

-- Environmental Provider Registry: Publicly readable for authenticated users, managed by admin
CREATE POLICY "Environmental provider registry viewable by all authenticated"
    ON public.environmental_provider_registry FOR SELECT TO authenticated
    USING (is_active = true OR public.has_role('admin'));

CREATE POLICY "Admin manage environmental provider registry"
    ON public.environmental_provider_registry FOR ALL TO authenticated
    USING (public.has_role('admin'));

-- Historical Environmental Snapshots: Viewable by all authenticated users
CREATE POLICY "Historical environmental snapshots viewable by authenticated"
    ON public.historical_environmental_snapshots FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Admin and staff manage historical snapshots"
    ON public.historical_environmental_snapshots FOR ALL TO authenticated
    USING (public.has_role('admin') OR public.has_role('clinician'));

-- Geographic Environmental Models: Viewable by all authenticated users
CREATE POLICY "Geographic models viewable by authenticated"
    ON public.geographic_environmental_models FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Admin manage geographic models"
    ON public.geographic_environmental_models FOR ALL TO authenticated
    USING (public.has_role('admin'));

-- Environmental Risk Factor Profiles: Viewable by all authenticated users
CREATE POLICY "Environmental risk profiles viewable by authenticated"
    ON public.environmental_risk_factor_profiles FOR SELECT TO authenticated
    USING (is_active = true OR public.has_role('admin'));

CREATE POLICY "Admin manage environmental risk profiles"
    ON public.environmental_risk_factor_profiles FOR ALL TO authenticated
    USING (public.has_role('admin'));

-- Patient Environmental Exposure Assessments:
-- Viewable by self (patient), clinician, healthcare worker, and admin
CREATE POLICY "Patients view own environmental exposure assessments"
    ON public.patient_environmental_exposure_assessments FOR SELECT TO authenticated
    USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Staff manage patient environmental exposure assessments"
    ON public.patient_environmental_exposure_assessments FOR ALL TO authenticated
    USING (
        public.has_role('clinician') OR
        public.has_role('healthcare_worker') OR
        public.has_role('admin')
    );

-- Service Role Full Access
CREATE POLICY "Service role full access on environmental providers"
    ON public.environmental_provider_registry FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on historical snapshots"
    ON public.historical_environmental_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on geographic models"
    ON public.geographic_environmental_models FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on environmental risk profiles"
    ON public.environmental_risk_factor_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on patient environmental assessments"
    ON public.patient_environmental_exposure_assessments FOR ALL TO service_role USING (true) WITH CHECK (true);

