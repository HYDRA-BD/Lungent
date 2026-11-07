-- ==============================================================================
-- Migration: 20261105000011_environmental_and_geographic_foundation.sql
-- Description: Phase 1.15 Environmental & Geographic Intelligence Foundation
-- Author: Lungent Architecture Team
-- ==============================================================================

-- 1. Create Enums for Geographic and Environmental Foundation
DO $$ BEGIN
    CREATE TYPE public.geographic_administrative_level AS ENUM (
        'country',
        'division',
        'district',
        'upazila',
        'union_municipality',
        'ward',
        'neighborhood'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.location_verification_status AS ENUM (
        'verified',
        'patient_reported',
        'worker_entered',
        'estimated',
        'unverified'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.environmental_data_status AS ENUM (
        'measured',
        'estimated',
        'forecast',
        'derived',
        'unavailable'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.environmental_parameter_type AS ENUM (
        'aqi_us',
        'pm2_5',
        'pm10',
        'nitrogen_dioxide',
        'sulfur_dioxide',
        'carbon_monoxide',
        'ozone'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.exposure_setting_type AS ENUM (
        'residential',
        'occupational',
        'transit',
        'recreational'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Configurable Geographic Entities Master Table
CREATE TABLE IF NOT EXISTS public.geographic_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(10) NOT NULL DEFAULT 'BD',
    administrative_level public.geographic_administrative_level NOT NULL,
    name VARCHAR(150) NOT NULL,
    name_bn VARCHAR(150),
    code VARCHAR(60) NOT NULL UNIQUE,
    parent_id UUID REFERENCES public.geographic_entities(id) ON DELETE RESTRICT,
    centroid_latitude NUMERIC(9,6),
    centroid_longitude NUMERIC(9,6),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_geo_entities_country ON public.geographic_entities(country_code);
CREATE INDEX IF NOT EXISTS idx_geo_entities_level ON public.geographic_entities(administrative_level);
CREATE INDEX IF NOT EXISTS idx_geo_entities_parent ON public.geographic_entities(parent_id);
CREATE INDEX IF NOT EXISTS idx_geo_entities_code ON public.geographic_entities(code);

-- 3. Patient Geographic Residential History (Tamper-Evident Movement Trail)
CREATE TABLE IF NOT EXISTS public.patient_geographic_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    geographic_entity_id UUID REFERENCES public.geographic_entities(id) ON DELETE SET NULL,
    country_code VARCHAR(10) NOT NULL DEFAULT 'BD',
    division VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    upazila VARCHAR(100),
    union_or_ward VARCHAR(100),
    address_line TEXT,
    duration_years NUMERIC(4,1),
    verification_status public.location_verification_status NOT NULL DEFAULT 'patient_reported',
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_to DATE,
    is_current BOOLEAN NOT NULL DEFAULT true,
    recorded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_patient_geo_hist_patient ON public.patient_geographic_histories(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_geo_hist_entity ON public.patient_geographic_histories(geographic_entity_id);
CREATE INDEX IF NOT EXISTS idx_patient_geo_hist_current ON public.patient_geographic_histories(is_current);

-- 4. Environmental Data Sources / Provider Registry
CREATE TABLE IF NOT EXISTS public.environmental_data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_code VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    provider_type VARCHAR(60) NOT NULL DEFAULT 'governmental',
    official_url TEXT,
    coverage_jurisdiction VARCHAR(100) NOT NULL DEFAULT 'Bangladesh',
    update_frequency_minutes INT NOT NULL DEFAULT 60,
    reliability_tier VARCHAR(30) NOT NULL DEFAULT 'standard',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_env_sources_code ON public.environmental_data_sources(source_code);

-- 5. Environmental Parameter Observations & Readings
CREATE TABLE IF NOT EXISTS public.environmental_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.environmental_data_sources(id) ON DELETE CASCADE,
    geographic_entity_id UUID REFERENCES public.geographic_entities(id) ON DELETE SET NULL,
    parameter public.environmental_parameter_type NOT NULL,
    value NUMERIC(10,2) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    reading_status public.environmental_data_status NOT NULL DEFAULT 'measured',
    observation_timestamp TIMESTAMPTZ NOT NULL,
    retrieval_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    confidence_score NUMERIC(3,2) DEFAULT 0.95,
    provenance_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_env_readings_source ON public.environmental_readings(source_id);
CREATE INDEX IF NOT EXISTS idx_env_readings_geo ON public.environmental_readings(geographic_entity_id);
CREATE INDEX IF NOT EXISTS idx_env_readings_param ON public.environmental_readings(parameter);
CREATE INDEX IF NOT EXISTS idx_env_readings_obs_time ON public.environmental_readings(observation_timestamp);

-- 6. Extend Patient Environmental & Occupational Exposure Context with geographic reference and daily hours
ALTER TABLE public.patient_environmental_exposures 
    ADD COLUMN IF NOT EXISTS geographic_entity_id UUID REFERENCES public.geographic_entities(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS hours_per_day NUMERIC(3,1) DEFAULT 4.0;

CREATE INDEX IF NOT EXISTS idx_patient_env_exp_geo ON public.patient_environmental_exposures(geographic_entity_id);

-- 7. Row Level Security Policies
ALTER TABLE public.geographic_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_geographic_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_readings ENABLE ROW LEVEL SECURITY;

-- Geographic Entities: viewable by all authenticated users and anon for public address selection
CREATE POLICY "Geographic entities viewable by all"
    ON public.geographic_entities FOR SELECT TO authenticated
    USING (is_active = true OR public.has_role('admin'));

CREATE POLICY "Admin manage geographic entities"
    ON public.geographic_entities FOR ALL TO authenticated
    USING (public.has_role('admin'));

-- Patient Geographic Histories: Viewable by self, clinician, healthcare worker, admin
CREATE POLICY "Patients view own geographic history"
    ON public.patient_geographic_histories FOR SELECT TO authenticated
    USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Staff view patient geographic history"
    ON public.patient_geographic_histories FOR ALL TO authenticated
    USING (
        public.has_role('clinician') OR
        public.has_role('healthcare_worker') OR
        public.has_role('admin')
    );

-- Environmental Data Sources & Readings: Viewable by all authenticated users
CREATE POLICY "Environmental sources viewable by all"
    ON public.environmental_data_sources FOR SELECT TO authenticated
    USING (is_active = true);

CREATE POLICY "Environmental readings viewable by all"
    ON public.environmental_readings FOR SELECT TO authenticated
    USING (true);
