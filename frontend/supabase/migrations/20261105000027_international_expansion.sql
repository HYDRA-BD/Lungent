-- Migration: 20261105000027_international_expansion.sql
-- Phase 2.12: International Expansion
-- Establishes centralized multi-country configuration, clinical guideline governance,
-- regulatory/privacy profiles, generalized geographic hierarchies, international readiness scoring,
-- and cross-border audit logging.

-- 1. International Countries Registry
CREATE TABLE IF NOT EXISTS public.international_countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(2) NOT NULL UNIQUE, -- ISO 3166-1 alpha-2 (e.g., 'BD', 'MY')
    iso_alpha3 VARCHAR(3) NOT NULL UNIQUE,   -- ISO 3166-1 alpha-3 (e.g., 'BGD', 'MYS')
    numeric_code VARCHAR(3) NOT NULL UNIQUE, -- ISO 3166-1 numeric (e.g., '050', '458')
    name_en VARCHAR(255) NOT NULL,
    name_native VARCHAR(255) NOT NULL,
    official_languages JSONB NOT NULL DEFAULT '[]'::jsonb,
    supported_locales JSONB NOT NULL DEFAULT '["en"]'::jsonb,
    default_locale VARCHAR(10) NOT NULL DEFAULT 'en',
    time_zones JSONB NOT NULL DEFAULT '["UTC"]'::jsonb,
    date_format VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
    time_format VARCHAR(10) NOT NULL DEFAULT '24h',
    measurement_system VARCHAR(20) NOT NULL DEFAULT 'metric', -- metric, imperial
    currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
    currency_symbol VARCHAR(10) NOT NULL DEFAULT '$',
    geographic_hierarchy_levels JSONB NOT NULL DEFAULT '[]'::jsonb,
    environmental_provider VARCHAR(50) NOT NULL DEFAULT 'open_meteo',
    status VARCHAR(30) NOT NULL DEFAULT 'synthetic_example', -- active, provisional, disabled, synthetic_example
    is_default BOOLEAN NOT NULL DEFAULT false,
    regulatory_framework VARCHAR(100) NOT NULL DEFAULT 'standard_health_privacy',
    data_residency_required BOOLEAN NOT NULL DEFAULT false,
    data_residency_region VARCHAR(50) DEFAULT 'local',
    clinical_execution_enabled BOOLEAN NOT NULL DEFAULT false,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Country-Specific Clinical Guidelines
CREATE TABLE IF NOT EXISTS public.country_clinical_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(2) NOT NULL REFERENCES public.international_countries(country_code) ON DELETE CASCADE,
    guideline_key VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    title_native VARCHAR(255) NOT NULL,
    source_organization VARCHAR(255) NOT NULL,
    publication_year INTEGER NOT NULL,
    effective_date DATE NOT NULL,
    review_cycle_months INTEGER NOT NULL DEFAULT 24,
    intended_population VARCHAR(255) NOT NULL,
    clinical_scope JSONB NOT NULL DEFAULT '["screening_eligibility", "symptom_triage"]'::jsonb,
    approval_status VARCHAR(50) NOT NULL DEFAULT 'pending_clinical_advisory_board', -- approved, pending_clinical_advisory_board, under_review, retired, synthetic_draft
    approved_by_board_at TIMESTAMPTZ,
    approved_by_board_reference VARCHAR(100),
    risk_estimation_model_allowed BOOLEAN NOT NULL DEFAULT false,
    screening_eligibility_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    referral_pathway_specification JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Country-Specific Regulatory & Privacy Profiles
CREATE TABLE IF NOT EXISTS public.country_regulatory_privacy_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(2) NOT NULL UNIQUE REFERENCES public.international_countries(country_code) ON DELETE CASCADE,
    data_protection_act_name VARCHAR(255) NOT NULL,
    legal_verification_status VARCHAR(50) NOT NULL DEFAULT 'pending_legal_review', -- verified, pending_legal_review, unverified_synthetic
    consent_model VARCHAR(50) NOT NULL DEFAULT 'explicit_opt_in', -- explicit_opt_in, opt_out, delegated_care_team
    patient_data_retention_years INTEGER NOT NULL DEFAULT 10,
    cross_border_transfer_allowed BOOLEAN NOT NULL DEFAULT false,
    cross_border_safeguards TEXT,
    patient_export_rights_supported BOOLEAN NOT NULL DEFAULT true,
    patient_deletion_rights_supported BOOLEAN NOT NULL DEFAULT true,
    breach_notification_window_hours INTEGER NOT NULL DEFAULT 72,
    privacy_officer_contact VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Generalized Geographic Administrative Nodes
CREATE TABLE IF NOT EXISTS public.country_geographic_administrative_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(2) NOT NULL REFERENCES public.international_countries(country_code) ON DELETE CASCADE,
    node_code VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(255) NOT NULL,
    name_native VARCHAR(255) NOT NULL,
    level INTEGER NOT NULL, -- 1: Top (State/Division), 2: District/County, 3: Upazila/City/Municipality
    parent_node_code VARCHAR(100) REFERENCES public.country_geographic_administrative_nodes(node_code) ON DELETE CASCADE,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Country Onboarding & Readiness Profiles (12-Step Framework)
CREATE TABLE IF NOT EXISTS public.country_onboarding_readiness_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(2) NOT NULL REFERENCES public.international_countries(country_code) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- governance, clinical, technical, regulatory, operational
    is_completed BOOLEAN NOT NULL DEFAULT false,
    verification_notes TEXT,
    verified_by VARCHAR(100),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_country_step UNIQUE (country_code, step_number)
);

-- 6. Cross-Border Access Audit Logs
CREATE TABLE IF NOT EXISTS public.cross_border_access_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requesting_country VARCHAR(2) NOT NULL,
    target_patient_country VARCHAR(2) NOT NULL,
    patient_id VARCHAR(100) NOT NULL,
    accessor_user_id VARCHAR(100) NOT NULL,
    accessor_role VARCHAR(100) NOT NULL,
    jurisdiction_legal_basis VARCHAR(255) NOT NULL,
    is_authorized BOOLEAN NOT NULL,
    denial_reason TEXT,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_international_countries_code ON public.international_countries(country_code);
CREATE INDEX IF NOT EXISTS idx_international_countries_status ON public.international_countries(status);
CREATE INDEX IF NOT EXISTS idx_country_guidelines_country ON public.country_clinical_guidelines(country_code);
CREATE INDEX IF NOT EXISTS idx_country_guidelines_status ON public.country_clinical_guidelines(approval_status);
CREATE INDEX IF NOT EXISTS idx_country_geo_nodes_country_level ON public.country_geographic_administrative_nodes(country_code, level);
CREATE INDEX IF NOT EXISTS idx_country_onboarding_country ON public.country_onboarding_readiness_profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_cross_border_logs_patient ON public.cross_border_access_audit_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_cross_border_logs_country_pair ON public.cross_border_access_audit_logs(requesting_country, target_patient_country);

-- Row-Level Security
ALTER TABLE public.international_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_clinical_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_regulatory_privacy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_geographic_administrative_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_onboarding_readiness_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_border_access_audit_logs ENABLE ROW LEVEL SECURITY;

-- Read Policies: Authenticated users can view countries, guidelines, and geographic nodes
CREATE POLICY "Authenticated users view active countries"
    ON public.international_countries FOR SELECT TO authenticated
    USING (status IN ('active', 'provisional', 'synthetic_example'));

CREATE POLICY "Authenticated users view approved country clinical guidelines"
    ON public.country_clinical_guidelines FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Authenticated users view country privacy profiles"
    ON public.country_regulatory_privacy_profiles FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Authenticated users view geographic administrative nodes"
    ON public.country_geographic_administrative_nodes FOR SELECT TO authenticated
    USING (is_active = true);

CREATE POLICY "Authenticated users view country readiness profiles"
    ON public.country_onboarding_readiness_profiles FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Admins view cross-border access audit logs"
    ON public.cross_border_access_audit_logs FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('administrator', 'clinical_lead')
        )
    );

-- Service Role Full Access Policies
CREATE POLICY "Service role full access on international_countries"
    ON public.international_countries FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on country_clinical_guidelines"
    ON public.country_clinical_guidelines FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on country_regulatory_privacy_profiles"
    ON public.country_regulatory_privacy_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on country_geographic_administrative_nodes"
    ON public.country_geographic_administrative_nodes FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on country_onboarding_readiness_profiles"
    ON public.country_onboarding_readiness_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on cross_border_access_audit_logs"
    ON public.cross_border_access_audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed Baseline Bangladesh Configuration & Representative Synthetic Example (Malaysia)
INSERT INTO public.international_countries (
    country_code, iso_alpha3, numeric_code, name_en, name_native,
    official_languages, supported_locales, default_locale, time_zones,
    date_format, time_format, measurement_system, currency_code, currency_symbol,
    geographic_hierarchy_levels, environmental_provider, status, is_default,
    regulatory_framework, data_residency_required, data_residency_region, clinical_execution_enabled, version
) VALUES 
(
    'BD', 'BGD', '050', 'Bangladesh', 'বাংলাদেশ',
    '["bn"]'::jsonb, '["en", "bn"]'::jsonb, 'bn', '["Asia/Dhaka"]'::jsonb,
    'DD/MM/YYYY', '12h', 'metric', 'BDT', '৳',
    '[{"level": 1, "nameEn": "Division", "nameNative": "বিভাগ"}, {"level": 2, "nameEn": "District", "nameNative": "জেলা"}, {"level": 3, "nameEn": "Upazila", "nameNative": "উপজেলা"}]'::jsonb,
    'open_meteo', 'active', true,
    'DGHS_National_Health_Data_Guidelines', false, 'local', true, 1
),
(
    'MY', 'MYS', '458', 'Malaysia (Synthetic Example)', 'Malaysia',
    '["ms", "en"]'::jsonb, '["en", "ms"]'::jsonb, 'en', '["Asia/Kuala_Lumpur"]'::jsonb,
    'DD/MM/YYYY', '24h', 'metric', 'MYR', 'RM',
    '[{"level": 1, "nameEn": "State", "nameNative": "Negeri"}, {"level": 2, "nameEn": "District", "nameNative": "Daerah"}, {"level": 3, "nameEn": "Municipality", "nameNative": "Pihak Berkuasa Tempatan"}]'::jsonb,
    'open_meteo', 'synthetic_example', false,
    'PDPA_2010_Malaysia_Pending_Legal_Review', true, 'ap-southeast-1', false, 1
)
ON CONFLICT (country_code) DO NOTHING;

