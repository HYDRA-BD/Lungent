-- ==============================================================================
-- Migration: 20261105000026_regional_and_nationwide_expansion.sql
-- Phase 2.11: Regional & Nationwide Expansion, Healthcare Networks & Centralized Monitoring
-- ==============================================================================

-- 1. Regional Healthcare Networks Table
CREATE TABLE IF NOT EXISTS public.regional_healthcare_networks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    network_code text NOT NULL UNIQUE,
    network_name text NOT NULL,
    network_name_bn text NOT NULL,
    lead_hub_facility_id uuid REFERENCES public.healthcare_facilities(id) ON DELETE SET NULL,
    division text NOT NULL,
    coverage_districts text[] NOT NULL DEFAULT '{}',
    tier text NOT NULL CHECK (tier IN ('national_network', 'divisional_network', 'district_consortium')),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'provisional', 'inactive')),
    operational_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reg_net_code ON public.regional_healthcare_networks(network_code);
CREATE INDEX IF NOT EXISTS idx_reg_net_division ON public.regional_healthcare_networks(division);
CREATE INDEX IF NOT EXISTS idx_reg_net_status ON public.regional_healthcare_networks(status);

-- 2. Facility Network Memberships Table
CREATE TABLE IF NOT EXISTS public.facility_network_memberships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    network_id uuid NOT NULL REFERENCES public.regional_healthcare_networks(id) ON DELETE CASCADE,
    facility_id uuid NOT NULL REFERENCES public.healthcare_facilities(id) ON DELETE CASCADE,
    member_role text NOT NULL CHECK (
        member_role IN ('hub_lead', 'specialty_referral_center', 'primary_intake_spoke', 'community_clinic_node')
    ),
    cross_facility_sharing_enabled boolean NOT NULL DEFAULT true,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_onboarding', 'suspended')),
    joined_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_network_facility_membership UNIQUE (network_id, facility_id)
);

CREATE INDEX IF NOT EXISTS idx_fac_net_network_id ON public.facility_network_memberships(network_id);
CREATE INDEX IF NOT EXISTS idx_fac_net_facility_id ON public.facility_network_memberships(facility_id);
CREATE INDEX IF NOT EXISTS idx_fac_net_status ON public.facility_network_memberships(status);

-- 3. Regional Facility Onboarding Records Table
CREATE TABLE IF NOT EXISTS public.regional_facility_onboarding_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id uuid NOT NULL REFERENCES public.healthcare_facilities(id) ON DELETE CASCADE,
    dghs_facility_code text NOT NULL UNIQUE,
    division text NOT NULL,
    district text NOT NULL,
    upazila text NOT NULL,
    facility_tier text NOT NULL CHECK (
        facility_tier IN ('national_specialized', 'tertiary_medical_college', 'district_hospital', 'upazila_health_complex', 'community_clinic')
    ),
    onboarding_status text NOT NULL DEFAULT 'draft' CHECK (
        onboarding_status IN ('draft', 'pending_verification', 'verified', 'active', 'suspended', 'deactivated')
    ),
    readiness_score integer NOT NULL DEFAULT 0 CHECK (readiness_score BETWEEN 0 AND 100),
    checklist_items jsonb NOT NULL DEFAULT '{}'::jsonb,
    primary_admin_user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verified_by_user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verified_at timestamptz,
    activated_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fac_onboard_facility_id ON public.regional_facility_onboarding_records(facility_id);
CREATE INDEX IF NOT EXISTS idx_fac_onboard_dghs_code ON public.regional_facility_onboarding_records(dghs_facility_code);
CREATE INDEX IF NOT EXISTS idx_fac_onboard_status ON public.regional_facility_onboarding_records(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_fac_onboard_division ON public.regional_facility_onboarding_records(division);

-- 4. Network Cross-Facility Access Logs Table
CREATE TABLE IF NOT EXISTS public.network_cross_facility_access_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requesting_facility_id uuid NOT NULL REFERENCES public.healthcare_facilities(id) ON DELETE CASCADE,
    originating_facility_id uuid NOT NULL REFERENCES public.healthcare_facilities(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    accessor_user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    accessor_role text NOT NULL,
    access_purpose text NOT NULL CHECK (
        access_purpose IN ('referral_consultation', 'diagnostic_review', 'emergency_care', 'clinical_audit')
    ),
    consent_code_verified text NOT NULL DEFAULT 'CONSENT-NETWORK-SHARING-2026',
    is_authorized boolean NOT NULL DEFAULT true,
    accessed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cross_acc_patient_id ON public.network_cross_facility_access_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_cross_acc_req_facility ON public.network_cross_facility_access_logs(requesting_facility_id);
CREATE INDEX IF NOT EXISTS idx_cross_acc_orig_facility ON public.network_cross_facility_access_logs(originating_facility_id);
CREATE INDEX IF NOT EXISTS idx_cross_acc_accessed_at ON public.network_cross_facility_access_logs(accessed_at DESC);

-- 5. Nationwide Service Health Incidents Table (Zero-PHI monitoring)
CREATE TABLE IF NOT EXISTS public.nationwide_service_health_incidents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subsystem text NOT NULL CHECK (
        subsystem IN ('database', 'api_gateway', 'auth_service', 'fhir_gateway', 'dicom_pacs_bridge', 'environmental_feed', 'notification_gateway')
    ),
    region_or_facility text NOT NULL DEFAULT 'nationwide',
    health_status text NOT NULL CHECK (
        health_status IN ('healthy', 'degraded', 'unavailable', 'not_configured', 'unknown')
    ),
    incident_description text NOT NULL,
    latency_ms integer NOT NULL DEFAULT 0,
    is_resolved boolean NOT NULL DEFAULT false,
    resolved_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_subsystem ON public.nationwide_service_health_incidents(subsystem);
CREATE INDEX IF NOT EXISTS idx_health_status ON public.nationwide_service_health_incidents(health_status);
CREATE INDEX IF NOT EXISTS idx_health_created_at ON public.nationwide_service_health_incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_resolved ON public.nationwide_service_health_incidents(is_resolved);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.regional_healthcare_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_network_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_facility_onboarding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_cross_facility_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nationwide_service_health_incidents ENABLE ROW LEVEL SECURITY;

-- Regional Healthcare Networks Policies
CREATE POLICY "Authorized users can view healthcare networks"
    ON public.regional_healthcare_networks
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'clinician', 'healthcare_worker')
        )
    );

CREATE POLICY "Admins can manage healthcare networks"
    ON public.regional_healthcare_networks
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

-- Facility Network Memberships Policies
CREATE POLICY "Authorized users can view network memberships"
    ON public.facility_network_memberships
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'clinician', 'healthcare_worker')
        )
    );

CREATE POLICY "Admins can manage network memberships"
    ON public.facility_network_memberships
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

-- Regional Facility Onboarding Policies
CREATE POLICY "Authorized users can view onboarding records"
    ON public.regional_facility_onboarding_records
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'clinician', 'healthcare_worker')
        )
    );

CREATE POLICY "Admins can manage onboarding records"
    ON public.regional_facility_onboarding_records
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

-- Network Cross-Facility Access Logs Policies
CREATE POLICY "Authorized users can view their facility cross-access logs"
    ON public.network_cross_facility_access_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'clinician')
        )
    );

CREATE POLICY "System and clinicians can record cross-access logs"
    ON public.network_cross_facility_access_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Nationwide Service Health Incidents Policies (Zero-PHI)
CREATE POLICY "Authorized staff can view health incidents"
    ON public.nationwide_service_health_incidents
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'clinician', 'healthcare_worker')
        )
    );

CREATE POLICY "Admins can manage health incidents"
    ON public.nationwide_service_health_incidents
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

-- Service Role Full Access Policies
CREATE POLICY "Service role full access on regional healthcare networks"
    ON public.regional_healthcare_networks FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on facility network memberships"
    ON public.facility_network_memberships FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on regional facility onboarding"
    ON public.regional_facility_onboarding_records FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on network cross-facility access logs"
    ON public.network_cross_facility_access_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on nationwide service health incidents"
    ON public.nationwide_service_health_incidents FOR ALL TO service_role USING (true) WITH CHECK (true);

