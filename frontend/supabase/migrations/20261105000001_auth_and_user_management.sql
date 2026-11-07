-- ==============================================================================
-- Lungent Platform Migration: Authentication, RBAC & User Management Foundation
-- Milestone: Phase 1.3
-- ==============================================================================

-- 1. Roles Definition Table
CREATE TABLE IF NOT EXISTS public.roles (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.roles IS 'Core Lungent system roles (patient, healthcare_worker, clinician, administrator)';

-- 2. Granular Permissions Table
CREATE TABLE IF NOT EXISTS public.permissions (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    module text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.permissions IS 'Granular application capabilities assigned to roles';

-- 3. Role-Permission Cross Matrix
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id text NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id text NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

-- 4. User Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid NOT NULL UNIQUE,
    full_name text NOT NULL,
    email text NOT NULL,
    phone_number text,
    preferred_language text NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'bn')),
    profile_image_url text,
    status text NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'active', 'suspended', 'deactivated')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON public.user_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);

COMMENT ON TABLE public.user_profiles IS 'Application user profiles linked to Supabase Auth identities';

-- 5. User Roles Mapping Table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role_id text NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_by uuid REFERENCES public.user_profiles(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);

-- 6. User Facility Memberships (Scope / Organizational Access)
CREATE TABLE IF NOT EXISTS public.user_facility_memberships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    facility_id text NOT NULL,
    facility_role text NOT NULL DEFAULT 'member',
    is_primary boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, facility_id)
);

CREATE INDEX IF NOT EXISTS idx_user_facility_user_id ON public.user_facility_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_facility_facility_id ON public.user_facility_memberships(facility_id);

-- 7. Security & Authentication Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    action text NOT NULL,
    target_user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    details jsonb NOT NULL DEFAULT '{}'::jsonb,
    ip_address text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user_id ON public.audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- Seed Baseline Roles and Permissions
-- ==============================================================================

INSERT INTO public.roles (id, name, description) VALUES
    ('patient', 'Patient / Individual', 'Self-service health survey, personal assessments, screening guidance'),
    ('healthcare_worker', 'Community Healthcare Worker', 'Field intake surveys, patient registration, localized clinic referral coordination'),
    ('clinician', 'Healthcare Professional / Clinician', 'Clinical decision support, red-flag symptom triage, review of screening eligibility'),
    ('administrator', 'System Administrator', 'Platform governance, facility directory management, audit inspection, role access management')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.permissions (id, name, description, module) VALUES
    -- Profile
    ('profile.read', 'View Profile', 'View own profile and demographic information', 'profile'),
    ('profile.update', 'Update Profile', 'Update own demographic details, phone number, language', 'profile'),
    -- Patients
    ('patient.create', 'Register Patient', 'Register patient for community or clinical screening', 'patients'),
    ('patient.read', 'Read Patient Records', 'View patient demographic and contact records within scope', 'patients'),
    ('patient.update', 'Update Patient Records', 'Modify authorized patient profile records', 'patients'),
    -- Assessments & Screening
    ('assessment.create', 'Create Assessment', 'Initiate lung cancer risk intake assessment', 'assessments'),
    ('assessment.read', 'Read Assessments', 'View submitted assessment questionnaires and historical scores', 'assessments'),
    ('assessment.review', 'Review Clinical Triage', 'Review and sign off on clinical triage and risk estimations', 'assessments'),
    ('clinical.notes.create', 'Add Clinical Notes', 'Document diagnostic and clinical impression notes', 'clinical'),
    ('referral.create', 'Create Referral', 'Generate referral to tertiary cancer center or diagnostic CT hub', 'referrals'),
    -- Administration & Governance
    ('user.manage', 'Manage User Accounts', 'Activate, suspend, or update platform user accounts', 'governance'),
    ('role.assign', 'Assign Privileged Roles', 'Grant or revoke healthcare worker, clinician, or admin roles', 'governance'),
    ('facility.manage', 'Manage Facilities', 'Register and update partner hospital and clinic directories', 'facilities'),
    ('audit.read', 'Inspect Audit Trail', 'Review immutable security and access event records', 'governance')
ON CONFLICT (id) DO NOTHING;

-- Map Patient Permissions
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    ('patient', 'profile.read'),
    ('patient', 'profile.update'),
    ('patient', 'assessment.create'),
    ('patient', 'assessment.read')
ON CONFLICT DO NOTHING;

-- Map Healthcare Worker Permissions
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    ('healthcare_worker', 'profile.read'),
    ('healthcare_worker', 'profile.update'),
    ('healthcare_worker', 'patient.create'),
    ('healthcare_worker', 'patient.read'),
    ('healthcare_worker', 'patient.update'),
    ('healthcare_worker', 'assessment.create'),
    ('healthcare_worker', 'assessment.read'),
    ('healthcare_worker', 'referral.create')
ON CONFLICT DO NOTHING;

-- Map Clinician Permissions
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    ('clinician', 'profile.read'),
    ('clinician', 'profile.update'),
    ('clinician', 'patient.read'),
    ('clinician', 'assessment.read'),
    ('clinician', 'assessment.review'),
    ('clinician', 'clinical.notes.create'),
    ('clinician', 'referral.create')
ON CONFLICT DO NOTHING;

-- Map Administrator Permissions
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    ('administrator', 'profile.read'),
    ('administrator', 'profile.update'),
    ('administrator', 'user.manage'),
    ('administrator', 'role.assign'),
    ('administrator', 'facility.manage'),
    ('administrator', 'audit.read')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_facility_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS evaluation
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid AS $$
    SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.user_profiles up ON ur.user_id = up.id
        WHERE up.auth_user_id = auth.uid() AND ur.role_id = 'administrator'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Roles & Permissions: Read-only for authenticated, writable only by Admin
CREATE POLICY "Allow authenticated users to read roles"
    ON public.roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read permissions"
    ON public.permissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read role permissions"
    ON public.role_permissions FOR SELECT TO authenticated USING (true);

-- User Profiles RLS
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT TO authenticated
    USING (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own permitted profile fields"
    ON public.user_profiles FOR UPDATE TO authenticated
    USING (auth_user_id = auth.uid() OR public.is_admin())
    WITH CHECK (auth_user_id = auth.uid() OR public.is_admin());

-- User Roles RLS
CREATE POLICY "Users can view own assigned roles or admin can view all"
    ON public.user_roles FOR SELECT TO authenticated
    USING (user_id = public.current_profile_id() OR public.is_admin());

CREATE POLICY "Only administrators can assign or remove roles"
    ON public.user_roles FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Facility Memberships RLS
CREATE POLICY "Users can view own facility memberships or admin can view all"
    ON public.user_facility_memberships FOR SELECT TO authenticated
    USING (user_id = public.current_profile_id() OR public.is_admin());

CREATE POLICY "Only administrators can manage facility memberships"
    ON public.user_facility_memberships FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Audit Logs RLS: Append-only, viewable only by admins
CREATE POLICY "System and users can insert audit logs"
    ON public.audit_logs FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Only users with audit permission can view audit logs"
    ON public.audit_logs FOR SELECT TO authenticated
    USING (public.is_admin());

-- Prohibit UPDATE or DELETE on audit logs (immutable security requirement)
-- No update or delete policies defined ensures PostgreSQL RLS blocks all modifications.
