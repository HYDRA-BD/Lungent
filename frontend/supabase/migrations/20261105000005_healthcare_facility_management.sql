-- ==============================================================================
-- Lungent — Phase 1.9: Healthcare Facility Management Migration
-- ==============================================================================

-- 1. Facility Types Reference Table
CREATE TABLE IF NOT EXISTS public.facility_types (
    id text PRIMARY KEY,
    name text NOT NULL,
    name_bn text NOT NULL,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.facility_types IS 'Configurable healthcare facility types (hospitals, clinics, community outreach)';

-- 2. Facility Ownership / Management Categories Reference Table
CREATE TABLE IF NOT EXISTS public.facility_ownership_categories (
    id text PRIMARY KEY,
    name text NOT NULL,
    name_bn text NOT NULL,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.facility_ownership_categories IS 'Configurable ownership categories (government, private, NGO, academic)';

-- 3. Facility Clinical & Diagnostic Services Catalog
CREATE TABLE IF NOT EXISTS public.facility_services (
    id text PRIMARY KEY,
    name text NOT NULL,
    name_bn text NOT NULL,
    category text NOT NULL CHECK (category IN ('respiratory_specialty', 'radiology_imaging', 'laboratory_pathology', 'screening_prevention', 'general_care', 'community_outreach')),
    description text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.facility_services IS 'Clinical services catalog available for facility capabilities and referral routing';

-- 4. Facility Organizational Groups & Networks
CREATE TABLE IF NOT EXISTS public.facility_groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    name_bn text NOT NULL,
    group_type text NOT NULL CHECK (group_type IN ('national_network', 'regional_directorate', 'hospital_consortium', 'ngo_alliance', 'community_programme')),
    parent_group_id uuid REFERENCES public.facility_groups(id) ON DELETE SET NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_facility_groups_code ON public.facility_groups(code);
CREATE INDEX IF NOT EXISTS idx_facility_groups_parent ON public.facility_groups(parent_group_id);

COMMENT ON TABLE public.facility_groups IS 'Organizational groupings, hospital networks, and regional oversight bodies';

-- 5. Healthcare Facilities Central Registry Table
CREATE TABLE IF NOT EXISTS public.healthcare_facilities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id text NOT NULL UNIQUE, -- Canonical Lungent Facility ID: FAC-YYYY-XXXXXX
    name text NOT NULL,
    name_bn text NOT NULL,
    facility_type_id text NOT NULL REFERENCES public.facility_types(id),
    ownership_category_id text NOT NULL REFERENCES public.facility_ownership_categories(id),
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'active', 'suspended', 'inactive', 'rejected')),
    status_reason text,
    group_id uuid REFERENCES public.facility_groups(id) ON DELETE SET NULL,
    
    -- Geographic & Administrative Structure
    country_code text NOT NULL DEFAULT 'BD',
    division text NOT NULL,
    district text NOT NULL,
    upazila text NOT NULL,
    union_municipality text,
    ward text,
    address_line text NOT NULL,
    latitude numeric(10, 7),
    longitude numeric(10, 7),
    
    -- Contact & Administrative Point of Contact
    contact_phone text,
    contact_email text,
    contact_person_name text,
    contact_person_role text,
    website_url text,
    
    -- Verification Information
    verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'rejected')),
    verification_source text,
    verified_at timestamptz,
    verified_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verification_notes text,
    
    -- Operational Capacity
    operational_capacity jsonb NOT NULL DEFAULT '{}'::jsonb,
    
    -- Audit Metadata
    registered_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    approved_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    approved_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_healthcare_facilities_fid ON public.healthcare_facilities(facility_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_facilities_name ON public.healthcare_facilities(name);
CREATE INDEX IF NOT EXISTS idx_healthcare_facilities_type ON public.healthcare_facilities(facility_type_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_facilities_ownership ON public.healthcare_facilities(ownership_category_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_facilities_status ON public.healthcare_facilities(status);
CREATE INDEX IF NOT EXISTS idx_healthcare_facilities_division ON public.healthcare_facilities(division);
CREATE INDEX IF NOT EXISTS idx_healthcare_facilities_district ON public.healthcare_facilities(district);
CREATE INDEX IF NOT EXISTS idx_healthcare_facilities_upazila ON public.healthcare_facilities(upazila);

COMMENT ON TABLE public.healthcare_facilities IS 'Centralized registry of participating healthcare facilities across Bangladesh';

-- 6. Facility Clinical Services Mapping Table
CREATE TABLE IF NOT EXISTS public.healthcare_facility_services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id uuid NOT NULL REFERENCES public.healthcare_facilities(id) ON DELETE CASCADE,
    service_id text NOT NULL REFERENCES public.facility_services(id) ON DELETE CASCADE,
    availability_status text NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'temporarily_unavailable', 'planned')),
    is_verified boolean NOT NULL DEFAULT false,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (facility_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_facility_services_fid ON public.healthcare_facility_services(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_services_sid ON public.healthcare_facility_services(service_id);

COMMENT ON TABLE public.healthcare_facility_services IS 'Mapping of verified clinical and imaging capabilities offered by each facility';

-- 7. Facility Staff Memberships Table
CREATE TABLE IF NOT EXISTS public.facility_staff_memberships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    facility_id uuid NOT NULL REFERENCES public.healthcare_facilities(id) ON DELETE CASCADE,
    facility_role text NOT NULL CHECK (facility_role IN ('facility_admin', 'clinician', 'healthcare_worker', 'nurse', 'data_entry_clerk', 'support_staff')),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended', 'revoked')),
    is_primary boolean NOT NULL DEFAULT false,
    department text,
    joined_at timestamptz NOT NULL DEFAULT now(),
    left_at timestamptz,
    approved_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    approval_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, facility_id, facility_role)
);

CREATE INDEX IF NOT EXISTS idx_staff_memberships_user ON public.facility_staff_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_memberships_facility ON public.facility_staff_memberships(facility_id);
CREATE INDEX IF NOT EXISTS idx_staff_memberships_status ON public.facility_staff_memberships(status);
CREATE INDEX IF NOT EXISTS idx_staff_memberships_role ON public.facility_staff_memberships(facility_role);

COMMENT ON TABLE public.facility_staff_memberships IS 'Association of healthcare professionals and workers with specific facilities';

-- 8. Facility Status Transition History Table
CREATE TABLE IF NOT EXISTS public.facility_status_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id uuid NOT NULL REFERENCES public.healthcare_facilities(id) ON DELETE CASCADE,
    from_status text NOT NULL,
    to_status text NOT NULL,
    reason text,
    changed_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_facility_status_history_fid ON public.facility_status_history(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_status_history_created ON public.facility_status_history(created_at DESC);

COMMENT ON TABLE public.facility_status_history IS 'Audit trail of facility lifecycle status transitions (approval, activation, suspension)';

-- 9. Facility Security & Governance Audit Events Table
CREATE TABLE IF NOT EXISTS public.facility_audit_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id uuid NOT NULL REFERENCES public.healthcare_facilities(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    actor_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    details jsonb NOT NULL DEFAULT '{}'::jsonb,
    ip_address text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_facility_audit_events_fid ON public.facility_audit_events(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_audit_events_type ON public.facility_audit_events(event_type);
CREATE INDEX IF NOT EXISTS idx_facility_audit_events_created ON public.facility_audit_events(created_at DESC);

COMMENT ON TABLE public.facility_audit_events IS 'Comprehensive audit logs of facility administrative modifications';

-- ==============================================================================
-- Seed Reference Data: Types, Ownership, Services, Groups, & Benchmark Facilities
-- ==============================================================================

INSERT INTO public.facility_types (id, name, name_bn, description)
VALUES
    ('specialized_hospital', 'Specialized Hospital', 'বিশেষায়িত হাসপাতাল', 'Tertiary and referral hospitals specialized in pulmonary, oncology, or chest diseases'),
    ('public_hospital', 'Public / Government Hospital', 'সরকারি হাসপাতাল', 'General public district hospitals and medical college hospitals'),
    ('private_hospital', 'Private Hospital', 'বেসরকারি হাসপাতাল', 'Private multi-disciplinary healthcare institutions and medical centers'),
    ('specialized_clinic', 'Specialized Clinic', 'বিশেষায়িত ক্লিনিক', 'Dedicated pulmonary, diagnostic, or oncology outpatient clinics'),
    ('general_clinic', 'General Clinic', 'সাধারণ ক্লিনিক', 'General medical clinics providing outpatient consultations and diagnostic support'),
    ('primary_healthcare', 'Primary Healthcare Facility', 'প্রাথমিক স্বাস্থ্যকেন্দ্র', 'Upazila Health Complexes and primary care delivery units'),
    ('community_clinic', 'Community Clinic', 'কমিউনিটি ক্লিনিক', 'Grassroots rural and ward-level healthcare intake centers'),
    ('community_programme', 'Community Health Programme', 'কমিউনিটি স্বাস্থ্য কার্যক্রম', 'Outreach and field screening operations organized by NGOs and public initiatives'),
    ('other', 'Other Healthcare Organization', 'অন্যান্য স্বাস্থ্য সংস্থা', 'Other authorized medical institutions')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    name_bn = EXCLUDED.name_bn,
    description = EXCLUDED.description;

INSERT INTO public.facility_ownership_categories (id, name, name_bn, description)
VALUES
    ('government', 'Government / Public', 'সরকারি', 'Managed and funded by the Ministry of Health & Family Welfare / DGHS'),
    ('private', 'Private Enterprise', 'বেসরকারি', 'Privately owned and commercially operated healthcare provider'),
    ('ngo', 'Non-Governmental Organization (NGO)', 'এনজিও', 'Operated by registered non-profit health organizations'),
    ('academic_research', 'Academic & Research Institution', 'শিক্ষা ও গবেষণা প্রতিষ্ঠান', 'University medical centers and autonomous research bodies'),
    ('community_based', 'Community-Based Organization', 'কমিউনিটি ভিত্তিক সংস্থা', 'Locally governed and community-driven healthcare initiatives'),
    ('other', 'Other Ownership Model', 'অন্যান্য মালিকানা', 'Alternative legal and organizational ownership classifications')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    name_bn = EXCLUDED.name_bn,
    description = EXCLUDED.description;

INSERT INTO public.facility_services (id, name, name_bn, category, description)
VALUES
    ('respiratory_care', 'Respiratory Care Services', 'শ্বাসযন্ত্রের চিকিৎসা সেবা', 'respiratory_specialty', 'Assessment and management of acute and chronic respiratory disorders'),
    ('pulmonology', 'Pulmonology Specialist Consultation', 'পালমোনোলজি বিশেষজ্ঞ পরামর্শ', 'respiratory_specialty', 'Board-certified chest and lung specialist clinical evaluations'),
    ('ldct_screening', 'Low-Dose CT (LDCT) Lung Screening', 'লো-ডোজ সিটি (LDCT) ফুসফুস স্ক্রিনিং', 'radiology_imaging', 'Evidence-based preventative imaging for early nodule detection in high-risk individuals'),
    ('radiology_imaging', 'General Radiology & Chest Imaging', 'সাধারণ রেডিওলজি ও বুকের এক্স-রে', 'radiology_imaging', 'Digital chest radiography, standard CT, and ultrasonography facilities'),
    ('spirometry_pft', 'Spirometry & Pulmonary Function Testing', 'স্পাইরোমেট্রি ও ফুসফুসের কার্যকারিতা পরীক্ষা', 'diagnostics', 'PFT diagnostics measuring forced expiratory volume (FEV1, FVC)'),
    ('oncology', 'Medical & Surgical Oncology', 'মেডিকেল ও সার্জিক্যাল অনকোলজি', 'respiratory_specialty', 'Cancer staging, oncology consultations, and multidisciplinary tumor board review'),
    ('pathology_lab', 'Pathology & Diagnostic Laboratory', 'প্যাথলজি ও ডায়াগনস্টিক ল্যাব', 'laboratory_pathology', 'Sputum cytology, histopathology, molecular analysis, and blood counts'),
    ('general_healthcare', 'General Healthcare & Triage', 'সাধারণ চিকিৎসা সেবা ও ট্রায়াজ', 'general_care', 'Outpatient evaluation, vital signs screening, and baseline general health triage'),
    ('community_outreach', 'Community Outreach & Field Screening', 'কমিউনিটি আউটরিচ ও ফিল্ড স্ক্রিনিং', 'community_outreach', 'Community healthcare worker camps and mobile early detection campaigns'),
    ('smoking_cessation', 'Tobacco & Smoking Cessation Counseling', 'ধূমপান ত্যাগ পরামর্শ সেবা', 'screening_prevention', 'Structured behavioral support and nicotine replacement guidance')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    name_bn = EXCLUDED.name_bn,
    category = EXCLUDED.category,
    description = EXCLUDED.description;

-- Seed Benchmark Facility Groups
INSERT INTO public.facility_groups (id, code, name, name_bn, group_type, description)
VALUES
    ('11111111-2222-3333-4444-555555555551', 'GRP-DGHS-NAT', 'Directorate General of Health Services (DGHS)', 'স্বাস্থ্য অধিদপ্তর (ডিজিএইচএস)', 'national_network', 'National apex body for public hospital oversight across Bangladesh'),
    ('11111111-2222-3333-4444-555555555552', 'GRP-NIDCH-NET', 'NIDCH National Pulmonology Network', 'এনআইডিসিএইচ জাতীয় পালমোনোলজি নেটওয়ার্ক', 'national_network', 'Specialized referral network centered around the National Institute of Diseases of the Chest and Hospital'),
    ('11111111-2222-3333-4444-555555555553', 'GRP-COMM-DHAKA', 'Dhaka Division Community Health Alliance', 'ঢাকা বিভাগ কমিউনিটি হেলথ অ্যালায়েন্স', 'community_programme', 'Coordinated regional primary care and community outreach consortium')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    name_bn = EXCLUDED.name_bn,
    group_type = EXCLUDED.group_type,
    description = EXCLUDED.description;

-- Seed Initial Benchmark Facilities
INSERT INTO public.healthcare_facilities (
    id,
    facility_id,
    name,
    name_bn,
    facility_type_id,
    ownership_category_id,
    status,
    group_id,
    country_code,
    division,
    district,
    upazila,
    address_line,
    latitude,
    longitude,
    contact_phone,
    contact_email,
    contact_person_name,
    contact_person_role,
    website_url,
    verification_status,
    verification_source,
    operational_capacity
)
VALUES
    (
        '22222222-1111-4111-a111-111111111111',
        'FAC-2026-DHK001',
        'Dhaka Central Pulmonary Institute',
        'ঢাকা সেন্ট্রাল পালমোনারি ইনস্টিটিউট',
        'specialized_hospital',
        'government',
        'active',
        '11111111-2222-3333-4444-555555555552',
        'BD',
        'Dhaka',
        'Dhaka',
        'Mirpur',
        'Section 10, Mirpur, Dhaka-1216',
        23.8067,
        90.3687,
        '+880 2-9882233',
        'info@dcpi-health.gov.bd',
        'Dr. Rafiqul Islam',
        'Chief Medical Officer',
        'https://dcpi-health.gov.bd',
        'verified',
        'dghs_registry',
        '{"totalBeds": 250, "icuBeds": 24, "ldctScanners": 2, "spirometryStations": 4}'::jsonb
    ),
    (
        '22222222-1111-4111-a111-222222222222',
        'FAC-2026-NID002',
        'National Institute of Diseases of the Chest and Hospital (NIDCH)',
        'জাতীয় বক্ষব্যাধি ইনস্টিটিউট ও হাসপাতাল (এনআইডিসিএইচ)',
        'specialized_hospital',
        'government',
        'active',
        '11111111-2222-3333-4444-555555555552',
        'BD',
        'Dhaka',
        'Dhaka',
        'Mohakhali',
        'TB Gate, Mohakhali, Dhaka-1212',
        23.7778,
        90.4056,
        '+880 2-8822244',
        'director@nidch.gov.bd',
        'Prof. Dr. M. A. Karim',
        'Director & Professor of Pulmonology',
        'https://nidch.gov.bd',
        'verified',
        'dghs_registry',
        '{"totalBeds": 650, "icuBeds": 40, "ldctScanners": 4, "spirometryStations": 8}'::jsonb
    ),
    (
        '22222222-1111-4111-a111-333333333333',
        'FAC-2026-MIR003',
        'Mirpur Grassroots Community Health Hub',
        'মিরপুর তৃণমূল কমিউনিটি স্বাস্থ্য কেন্দ্র',
        'community_clinic',
        'ngo',
        'active',
        '11111111-2222-3333-4444-555555555553',
        'BD',
        'Dhaka',
        'Dhaka',
        'Mirpur',
        'Ward 12, Mirpur Community Complex, Dhaka-1216',
        23.8122,
        90.3621,
        '+880 1711-223388',
        'intake@mirpur-community.org',
        'Nasreen Akter',
        'Senior Community Outreach Coordinator',
        'https://mirpur-community.org',
        'verified',
        'onsite_inspection',
        '{"totalBeds": 15, "chwWorkers": 18, "mobileSpirometers": 2}'::jsonb
    )
ON CONFLICT (facility_id) DO UPDATE SET
    name = EXCLUDED.name,
    name_bn = EXCLUDED.name_bn,
    status = EXCLUDED.status,
    contact_phone = EXCLUDED.contact_phone;

-- ==============================================================================
-- Row-Level Security (RLS) & Access Control Policies
-- ==============================================================================

ALTER TABLE public.facility_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_ownership_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_facility_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_staff_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_audit_events ENABLE ROW LEVEL SECURITY;

-- 1. Reference tables: readable by all authenticated users
CREATE POLICY p_facility_types_read ON public.facility_types
    FOR SELECT TO authenticated USING (true);

CREATE POLICY p_facility_ownership_read ON public.facility_ownership_categories
    FOR SELECT TO authenticated USING (true);

CREATE POLICY p_facility_services_read ON public.facility_services
    FOR SELECT TO authenticated USING (true);

CREATE POLICY p_facility_groups_read ON public.facility_groups
    FOR SELECT TO authenticated USING (true);

-- 2. Healthcare facilities access control function
CREATE OR REPLACE FUNCTION public.can_manage_facilities()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = public.current_profile_id()
          AND ur.role_id = 'administrator'
    );
$$;

CREATE OR REPLACE FUNCTION public.can_access_facility(facility_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT (
        -- 1. System administrators have full access
        public.can_manage_facilities()
        OR
        -- 2. Staff members with active membership in the target facility
        EXISTS (
            SELECT 1 FROM public.facility_staff_memberships fsm
            WHERE fsm.facility_id = facility_uuid
              AND fsm.user_id = public.current_profile_id()
              AND fsm.status = 'active'
        )
        OR
        -- 3. Active facilities are discoverable by verified healthcare staff
        EXISTS (
            SELECT 1 FROM public.healthcare_facilities hf
            WHERE hf.id = facility_uuid
              AND hf.status = 'active'
        )
    );
$$;

-- 3. Facilities table policies
CREATE POLICY p_facilities_select ON public.healthcare_facilities
    FOR SELECT TO authenticated
    USING (public.can_access_facility(id));

CREATE POLICY p_facilities_insert ON public.healthcare_facilities
    FOR INSERT TO authenticated
    WITH CHECK (public.can_manage_facilities());

CREATE POLICY p_facilities_update ON public.healthcare_facilities
    FOR UPDATE TO authenticated
    USING (public.can_manage_facilities())
    WITH CHECK (public.can_manage_facilities());

CREATE POLICY p_facilities_delete ON public.healthcare_facilities
    FOR DELETE TO authenticated
    USING (public.can_manage_facilities());

-- 4. Facility services mapping policies
CREATE POLICY p_facility_services_select ON public.healthcare_facility_services
    FOR SELECT TO authenticated
    USING (public.can_access_facility(facility_id));

CREATE POLICY p_facility_services_modify ON public.healthcare_facility_services
    FOR ALL TO authenticated
    USING (public.can_manage_facilities())
    WITH CHECK (public.can_manage_facilities());

-- 5. Staff memberships policies
CREATE POLICY p_staff_memberships_select ON public.facility_staff_memberships
    FOR SELECT TO authenticated
    USING (
        public.can_manage_facilities()
        OR user_id = public.current_profile_id()
        OR public.can_access_facility(facility_id)
    );

CREATE POLICY p_staff_memberships_modify ON public.facility_staff_memberships
    FOR ALL TO authenticated
    USING (public.can_manage_facilities())
    WITH CHECK (public.can_manage_facilities());

-- 6. Audit logs & status history policies (strictly read-only for admins)
CREATE POLICY p_facility_status_history_select ON public.facility_status_history
    FOR SELECT TO authenticated
    USING (public.can_manage_facilities() OR public.can_access_facility(facility_id));

CREATE POLICY p_facility_status_history_insert ON public.facility_status_history
    FOR INSERT TO authenticated
    WITH CHECK (public.can_manage_facilities());

CREATE POLICY p_facility_audit_events_select ON public.facility_audit_events
    FOR SELECT TO authenticated
    USING (public.can_manage_facilities());

CREATE POLICY p_facility_audit_events_insert ON public.facility_audit_events
    FOR INSERT TO authenticated
    WITH CHECK (true);
