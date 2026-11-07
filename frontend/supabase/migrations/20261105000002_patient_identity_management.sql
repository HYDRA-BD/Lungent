-- ==============================================================================
-- Lungent Platform Migration: Centralized Patient Identity & Management
-- Milestone: Phase 1.6
-- ==============================================================================

-- 1. Helper function for Lungent Patient ID Generation
-- Format: LGT-YYYY-XXXXXX (e.g. LGT-2026-7K8M9P)
-- Safe, collision-resistant, non-sequential alphanumeric string
CREATE OR REPLACE FUNCTION public.generate_lungent_patient_id()
RETURNS text AS $$
DECLARE
    v_year text := to_char(CURRENT_DATE, 'YYYY');
    v_chars text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; -- excludes 0, O, 1, I to prevent visual confusion
    v_random text := '';
    v_candidate text;
    v_exists boolean;
    v_i integer;
BEGIN
    LOOP
        v_random := '';
        FOR v_i IN 1..6 LOOP
            v_random := v_random || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
        END LOOP;

        v_candidate := 'LGT-' || v_year || '-' || v_random;

        SELECT EXISTS (
            SELECT 1 FROM public.patients WHERE patient_id = v_candidate
        ) INTO v_exists;

        EXIT WHEN NOT v_exists;
    END LOOP;

    RETURN v_candidate;
END;
$$ LANGUAGE plpgsql VOLATILE;

COMMENT ON FUNCTION public.generate_lungent_patient_id() IS 'Generates unique collision-resistant Lungent Patient IDs (LGT-YYYY-XXXXXX)';

-- 2. Core Centralized Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id text NOT NULL UNIQUE DEFAULT public.generate_lungent_patient_id(),
    full_name text NOT NULL,
    date_of_birth date,
    approximate_age integer,
    gender text NOT NULL CHECK (gender IN ('female', 'male', 'other', 'unspecified')),
    phone_number text,
    phone_number_normalized text,
    email text,
    nid_number text, -- optional masked or protected national ID
    nid_hash text,   -- cryptographic SHA-256 hash for duplicate matching
    address_division text,
    address_district text,
    address_upazila text,
    address_details text,
    emergency_contact_name text,
    emergency_contact_phone text,
    emergency_contact_relation text,
    preferred_language text NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'bn')),
    verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'partially_verified', 'verified')),
    verified_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verified_at timestamptz,
    verification_source text DEFAULT 'community_intake' CHECK (verification_source IN ('community_intake', 'clinical_registration', 'national_id_card', 'self_reported')),
    account_association_status text NOT NULL DEFAULT 'unlinked' CHECK (account_association_status IN ('unlinked', 'pending_verification', 'linked')),
    associated_user_profile_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL UNIQUE,
    associated_at timestamptz,
    created_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    primary_facility_id text NOT NULL DEFAULT 'facility-dhaka-central',
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'merged', 'deceased')),
    merged_into_patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_full_name ON public.patients(lower(full_name));
CREATE INDEX IF NOT EXISTS idx_patients_phone_normalized ON public.patients(phone_number_normalized);
CREATE INDEX IF NOT EXISTS idx_patients_nid_hash ON public.patients(nid_hash);
CREATE INDEX IF NOT EXISTS idx_patients_associated_user ON public.patients(associated_user_profile_id);
CREATE INDEX IF NOT EXISTS idx_patients_primary_facility ON public.patients(primary_facility_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status);

COMMENT ON TABLE public.patients IS 'Centralized patient identity records across healthcare facilities';

-- 3. Patient Facility Access (Multi-facility relationships)
CREATE TABLE IF NOT EXISTS public.patient_facility_access (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    facility_id text NOT NULL,
    relationship_type text NOT NULL DEFAULT 'care_site' CHECK (relationship_type IN ('primary_registration', 'care_site', 'referral_destination', 'temporary_intake')),
    established_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    consent_status text NOT NULL DEFAULT 'consented' CHECK (consent_status IN ('consented', 'implied_care', 'revoked')),
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (patient_id, facility_id)
);

CREATE INDEX IF NOT EXISTS idx_patient_facility_patient_id ON public.patient_facility_access(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_facility_facility_id ON public.patient_facility_access(facility_id);

COMMENT ON TABLE public.patient_facility_access IS 'Records patient registration and care access across multiple facilities';

-- 4. Potential Duplicate Candidates Table
CREATE TABLE IF NOT EXISTS public.patient_duplicate_candidates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    candidate_patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    match_score integer NOT NULL CHECK (match_score BETWEEN 0 AND 100),
    match_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
    match_type text NOT NULL CHECK (match_type IN ('exact', 'high_probability', 'moderate_probability')),
    status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'dismissed_distinct_patients', 'confirmed_duplicate', 'merged')),
    detected_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK (primary_patient_id != candidate_patient_id),
    UNIQUE (primary_patient_id, candidate_patient_id)
);

CREATE INDEX IF NOT EXISTS idx_duplicate_candidates_primary ON public.patient_duplicate_candidates(primary_patient_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_candidates_candidate ON public.patient_duplicate_candidates(candidate_patient_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_candidates_status ON public.patient_duplicate_candidates(status);

COMMENT ON TABLE public.patient_duplicate_candidates IS 'Algorithmic and user-flagged potential duplicate patient identity records';

-- 5. Duplicate Reviews Table
CREATE TABLE IF NOT EXISTS public.patient_duplicate_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id uuid NOT NULL REFERENCES public.patient_duplicate_candidates(id) ON DELETE CASCADE,
    reviewer_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    decision text NOT NULL CHECK (decision IN ('dismissed_distinct', 'confirmed_duplicate', 'approved_for_merge', 'merge_executed')),
    justification text NOT NULL,
    reviewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_duplicate_reviews_candidate ON public.patient_duplicate_reviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_reviews_reviewer ON public.patient_duplicate_reviews(reviewer_id);

COMMENT ON TABLE public.patient_duplicate_reviews IS 'Audit review decisions for suspected duplicate records';

-- 6. Record Merges Table (Controlled, Auditable, Non-destructive)
CREATE TABLE IF NOT EXISTS public.patient_record_merges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    surviving_patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    retired_patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    surviving_patient_identifier text NOT NULL,
    retired_patient_identifier text NOT NULL,
    authorized_by uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    executed_by uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    reason text NOT NULL,
    snapshot_before_merge jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK (surviving_patient_id != retired_patient_id)
);

CREATE INDEX IF NOT EXISTS idx_record_merges_surviving ON public.patient_record_merges(surviving_patient_id);
CREATE INDEX IF NOT EXISTS idx_record_merges_retired ON public.patient_record_merges(retired_patient_id);

COMMENT ON TABLE public.patient_record_merges IS 'Historical trace of merged duplicate patient records';

-- 7. Patient Identity Audit Events Table
CREATE TABLE IF NOT EXISTS public.patient_audit_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_identifier text NOT NULL,
    actor_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    actor_role text,
    action text NOT NULL,
    facility_id text,
    details jsonb NOT NULL DEFAULT '{}'::jsonb,
    ip_address text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_audit_patient_id ON public.patient_audit_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_audit_action ON public.patient_audit_events(action);
CREATE INDEX IF NOT EXISTS idx_patient_audit_actor ON public.patient_audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_patient_audit_created_at ON public.patient_audit_events(created_at DESC);

COMMENT ON TABLE public.patient_audit_events IS 'Immutable identity event log for tracking creation, updates, verifications, and merges';

-- ==============================================================================
-- Extended Permissions for Patient Identity Management
-- ==============================================================================

INSERT INTO public.permissions (id, name, description, module) VALUES
    ('patient.search', 'Search Patients', 'Perform patient directory lookup across facilities', 'patients'),
    ('patient.verify', 'Verify Patient Identity', 'Verify demographic identity with official documents', 'patients'),
    ('patient.merge', 'Merge Patient Records', 'Authorize and execute duplicate record merge', 'patients')
ON CONFLICT (id) DO NOTHING;

-- Grant permissions to roles
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    ('healthcare_worker', 'patient.search'),
    ('clinician', 'patient.search'),
    ('clinician', 'patient.verify'),
    ('administrator', 'patient.search'),
    ('administrator', 'patient.verify'),
    ('administrator', 'patient.merge')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_facility_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_duplicate_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_duplicate_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_record_merges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_audit_events ENABLE ROW LEVEL SECURITY;

-- Helper function: checks if user has access to a patient via facility or ownership
CREATE OR REPLACE FUNCTION public.can_access_patient(p_patient_id uuid)
RETURNS boolean AS $$
    SELECT EXISTS (
        -- 1. Admin has access
        SELECT 1 WHERE public.is_admin()
        UNION ALL
        -- 2. Patient owns the record
        SELECT 1 FROM public.patients p
        WHERE p.id = p_patient_id AND p.associated_user_profile_id = public.current_profile_id()
        UNION ALL
        -- 3. Healthcare worker / Clinician has membership in the patient's facilities
        SELECT 1 FROM public.patient_facility_access pfa
        JOIN public.user_facility_memberships ufm ON pfa.facility_id = ufm.facility_id
        WHERE pfa.patient_id = p_patient_id AND ufm.user_id = public.current_profile_id()
        UNION ALL
        -- 4. Healthcare worker / Clinician has Statewide/Central permission
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = public.current_profile_id()
          AND ur.role_id IN ('healthcare_worker', 'clinician', 'administrator')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Patients RLS
CREATE POLICY "Patients can view own record, clinicians/workers can view authorized records"
    ON public.patients FOR SELECT TO authenticated
    USING (public.can_access_patient(id));

CREATE POLICY "Healthcare workers, clinicians, and admins can insert patients"
    ON public.patients FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = public.current_profile_id()
              AND ur.role_id IN ('healthcare_worker', 'clinician', 'administrator')
        )
        OR public.is_admin()
    );

CREATE POLICY "Authorized healthcare staff and admins can update patients"
    ON public.patients FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = public.current_profile_id()
              AND ur.role_id IN ('healthcare_worker', 'clinician', 'administrator')
        )
        OR public.is_admin()
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = public.current_profile_id()
              AND ur.role_id IN ('healthcare_worker', 'clinician', 'administrator')
        )
        OR public.is_admin()
    );

-- Patient Facility Access RLS
CREATE POLICY "Authorized users can view patient facility relationships"
    ON public.patient_facility_access FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

CREATE POLICY "Authorized staff can manage patient facility relationships"
    ON public.patient_facility_access FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = public.current_profile_id()
              AND ur.role_id IN ('healthcare_worker', 'clinician', 'administrator')
        )
        OR public.is_admin()
    );

-- Duplicate Candidates RLS
CREATE POLICY "Staff can view duplicate candidates"
    ON public.patient_duplicate_candidates FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = public.current_profile_id()
              AND ur.role_id IN ('healthcare_worker', 'clinician', 'administrator')
        )
        OR public.is_admin()
    );

CREATE POLICY "Staff can flag duplicate candidates"
    ON public.patient_duplicate_candidates FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = public.current_profile_id()
              AND ur.role_id IN ('healthcare_worker', 'clinician', 'administrator')
        )
        OR public.is_admin()
    );

CREATE POLICY "Staff can update duplicate candidate status"
    ON public.patient_duplicate_candidates FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = public.current_profile_id()
              AND ur.role_id IN ('healthcare_worker', 'clinician', 'administrator')
        )
        OR public.is_admin()
    );

-- Duplicate Reviews RLS
CREATE POLICY "Staff can view duplicate reviews"
    ON public.patient_duplicate_reviews FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = public.current_profile_id()
              AND ur.role_id IN ('healthcare_worker', 'clinician', 'administrator')
        )
        OR public.is_admin()
    );

CREATE POLICY "Staff can record duplicate reviews"
    ON public.patient_duplicate_reviews FOR INSERT TO authenticated
    WITH CHECK (
        reviewer_id = public.current_profile_id()
        OR public.is_admin()
    );

-- Record Merges RLS (Restricted strictly to administrators and designated officers)
CREATE POLICY "Staff can view record merges"
    ON public.patient_record_merges FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = public.current_profile_id()
              AND ur.role_id IN ('clinician', 'administrator')
        )
        OR public.is_admin()
    );

CREATE POLICY "Only administrators can execute record merges"
    ON public.patient_record_merges FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

-- Patient Audit Events RLS (Append-only by staff, read by authorized staff)
CREATE POLICY "Staff can view patient audit events"
    ON public.patient_audit_events FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

CREATE POLICY "System and staff can insert patient audit events"
    ON public.patient_audit_events FOR INSERT TO authenticated
    WITH CHECK (true);

