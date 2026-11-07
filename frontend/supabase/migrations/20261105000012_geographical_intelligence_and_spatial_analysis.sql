-- ==============================================================================
-- Migration: 20261105000012_geographical_intelligence_and_spatial_analysis.sql
-- Description: Phase 1.17 Geographical Intelligence and Spatial Analysis
-- Author: Lungent Architecture Team
-- ==============================================================================

-- 1. Create Spatial Indexes for Fast Proximity Queries
CREATE INDEX IF NOT EXISTS idx_facilities_coords 
    ON public.healthcare_facilities(latitude, longitude) 
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_facilities_admin_area 
    ON public.healthcare_facilities(division, district, upazila);

CREATE INDEX IF NOT EXISTS idx_geo_entities_coords 
    ON public.geographic_entities(centroid_latitude, centroid_longitude) 
    WHERE centroid_latitude IS NOT NULL AND centroid_longitude IS NOT NULL;

-- 2. PostgreSQL Haversine Distance Calculation Function (Spherical Great-Circle)
-- Computes straight-line distance in kilometers between two WGS84 coordinate pairs
CREATE OR REPLACE FUNCTION public.calculate_haversine_distance_km(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
    earth_radius_km CONSTANT DOUBLE PRECISION := 6371.0088;
    phi1 DOUBLE PRECISION;
    phi2 DOUBLE PRECISION;
    delta_phi DOUBLE PRECISION;
    delta_lambda DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
        RETURN NULL;
    END IF;

    -- Convert degrees to radians
    phi1 := radians(lat1);
    phi2 := radians(lat2);
    delta_phi := radians(lat2 - lat1);
    delta_lambda := radians(lon2 - lon1);

    -- Haversine formula
    a := sin(delta_phi / 2.0) * sin(delta_phi / 2.0) +
         cos(phi1) * cos(phi2) *
         sin(delta_lambda / 2.0) * sin(delta_lambda / 2.0);
    
    -- Safeguard for domain of asin/sqrt
    IF a > 1.0 THEN
        a := 1.0;
    END IF;

    c := 2.0 * asin(sqrt(a));

    RETURN round((earth_radius_km * c)::numeric, 2)::DOUBLE PRECISION;
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE;

-- 3. Diagnostic Coverage Snapshot Tracking Table
-- Stores period analysis of district-level diagnostic availability and coverage gaps
CREATE TABLE IF NOT EXISTS public.district_coverage_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(10) NOT NULL DEFAULT 'BD',
    division VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    total_registered_facilities INT NOT NULL DEFAULT 0,
    total_verified_facilities INT NOT NULL DEFAULT 0,
    has_ldct_screening BOOLEAN NOT NULL DEFAULT false,
    ldct_facility_count INT NOT NULL DEFAULT 0,
    has_genexpert_tb BOOLEAN NOT NULL DEFAULT false,
    genexpert_facility_count INT NOT NULL DEFAULT 0,
    has_diagnostic_ct BOOLEAN NOT NULL DEFAULT false,
    has_spirometry BOOLEAN NOT NULL DEFAULT false,
    has_thoracic_surgery BOOLEAN NOT NULL DEFAULT false,
    nearest_ldct_distance_km NUMERIC(6,2),
    nearest_ldct_facility_id UUID REFERENCES public.healthcare_facilities(id) ON DELETE SET NULL,
    nearest_genexpert_distance_km NUMERIC(6,2),
    nearest_genexpert_facility_id UUID REFERENCES public.healthcare_facilities(id) ON DELETE SET NULL,
    coverage_tier VARCHAR(50) NOT NULL DEFAULT 'data_pending',
    coverage_notes TEXT,
    snapshot_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_district_cov_div_dist ON public.district_coverage_snapshots(division, district);
CREATE INDEX IF NOT EXISTS idx_district_cov_tier ON public.district_coverage_snapshots(coverage_tier);

-- 4. Row Level Security Policies
ALTER TABLE public.district_coverage_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "District coverage snapshots viewable by authenticated"
    ON public.district_coverage_snapshots FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Admin manage district coverage snapshots"
    ON public.district_coverage_snapshots FOR ALL TO authenticated
    USING (public.has_role('admin'));
