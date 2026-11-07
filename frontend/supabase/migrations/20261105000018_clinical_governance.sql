-- ==============================================================================
-- Migration: 20261105000018_clinical_governance.sql
-- Phase 1.24: Clinical Governance Framework, CAB, Methodology Registry,
-- Versioning, Approvals, Clinician Overrides & Audit Trail
-- ==============================================================================

-- 1. Clinical Governance Bodies (Clinical Advisory Board - CAB)
CREATE TABLE IF NOT EXISTS public.clinical_governance_bodies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    jurisdiction text NOT NULL DEFAULT 'Bangladesh',
    charter_summary text NOT NULL,
    established_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'dissolved')),
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clinical_gov_bodies_status ON public.clinical_governance_bodies(status);

-- 2. Clinical Governance Members (Credentials, Roles, Conflicts)
CREATE TABLE IF NOT EXISTS public.clinical_governance_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    body_id uuid NOT NULL REFERENCES public.clinical_governance_bodies(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name text NOT NULL,
    role text NOT NULL CHECK (
        role IN (
            'chair',
            'vice_chair',
            'clinical_reviewer',
            'methodology_author',
            'biostatistician',
            'secretary',
            'observer'
        )
    ),
    specialization text NOT NULL,
    medical_registration_number text,
    credentials_verified boolean NOT NULL DEFAULT false,
    verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at timestamptz,
    institutional_affiliation text NOT NULL,
    term_start_date date NOT NULL,
    term_end_date date,
    conflict_of_interest_declaration text,
    has_active_conflict boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'emeritus', 'resigned', 'terminated')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clinical_gov_members_body ON public.clinical_governance_members(body_id);
CREATE INDEX IF NOT EXISTS idx_clinical_gov_members_role ON public.clinical_governance_members(role);
CREATE INDEX IF NOT EXISTS idx_clinical_gov_members_status ON public.clinical_governance_members(status);
CREATE INDEX IF NOT EXISTS idx_clinical_gov_members_verified ON public.clinical_governance_members(credentials_verified);

-- 3. Governance Meetings (Agendas, Minutes, Resolutions)
CREATE TABLE IF NOT EXISTS public.governance_meetings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    body_id uuid NOT NULL REFERENCES public.clinical_governance_bodies(id) ON DELETE CASCADE,
    meeting_number text NOT NULL,
    title text NOT NULL,
    scheduled_at timestamptz NOT NULL,
    held_at timestamptz,
    chair_id uuid REFERENCES public.clinical_governance_members(id) ON DELETE SET NULL,
    quorum_present boolean NOT NULL DEFAULT false,
    agenda text NOT NULL,
    minutes text,
    resolutions text,
    status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    attendees jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_governance_meetings_body ON public.governance_meetings(body_id);
CREATE INDEX IF NOT EXISTS idx_governance_meetings_status ON public.governance_meetings(status);
CREATE INDEX IF NOT EXISTS idx_governance_meetings_scheduled_at ON public.governance_meetings(scheduled_at DESC);

-- 4. Clinical Methodologies (Master Registry)
CREATE TABLE IF NOT EXISTS public.clinical_methodologies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    type text NOT NULL CHECK (
        type IN (
            'risk_prediction',
            'screening_eligibility',
            'symptom_triage',
            'combined_protocol'
        )
    ),
    name text NOT NULL,
    description text NOT NULL,
    issuing_organization text NOT NULL,
    primary_reference text NOT NULL,
    target_population text NOT NULL,
    clinical_limitations text NOT NULL,
    evidence_grade text NOT NULL DEFAULT 'Level 1a' CHECK (
        evidence_grade IN (
            'Level 1a',
            'Level 1b',
            'Level 2a',
            'Level 2b',
            'Level 3',
            'Expert Consensus'
        )
    ),
    active_version_id uuid,
    governance_status text NOT NULL DEFAULT 'active' CHECK (
        governance_status IN (
            'draft',
            'under_review',
            'active',
            'suspended',
            'deprecated'
        )
    ),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clinical_methodologies_type ON public.clinical_methodologies(type);
CREATE INDEX IF NOT EXISTS idx_clinical_methodologies_status ON public.clinical_methodologies(governance_status);

-- 5. Clinical Methodology Versions (Lifecycle, Rules & Periodic Review Dates)
CREATE TABLE IF NOT EXISTS public.clinical_methodology_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    methodology_id uuid NOT NULL REFERENCES public.clinical_methodologies(id) ON DELETE CASCADE,
    version_string text NOT NULL,
    semver text NOT NULL,
    status text NOT NULL DEFAULT 'draft' CHECK (
        status IN (
            'draft',
            'submitted_for_review',
            'under_clinical_review',
            'revisions_requested',
            'awaiting_formal_approval',
            'approved',
            'active',
            'suspended',
            'deprecated',
            'rejected'
        )
    ),
    changelog text NOT NULL,
    rule_definitions jsonb NOT NULL DEFAULT '{}'::jsonb,
    approved_by_member_id uuid REFERENCES public.clinical_governance_members(id) ON DELETE SET NULL,
    approved_at timestamptz,
    meeting_id uuid REFERENCES public.governance_meetings(id) ON DELETE SET NULL,
    approval_notes text,
    review_cycle_months integer NOT NULL DEFAULT 12,
    next_review_due_date date NOT NULL,
    last_reviewed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT unq_methodology_version UNIQUE (methodology_id, version_string)
);

CREATE INDEX IF NOT EXISTS idx_methodology_versions_methodology ON public.clinical_methodology_versions(methodology_id);
CREATE INDEX IF NOT EXISTS idx_methodology_versions_status ON public.clinical_methodology_versions(status);
CREATE INDEX IF NOT EXISTS idx_methodology_versions_review_date ON public.clinical_methodology_versions(next_review_due_date);

-- Link active_version_id foreign key back to clinical_methodologies
ALTER TABLE public.clinical_methodologies
    ADD CONSTRAINT fk_methodology_active_version
    FOREIGN KEY (active_version_id)
    REFERENCES public.clinical_methodology_versions(id)
    ON DELETE SET NULL;

-- 6. Granular Clinical Rule Versions
CREATE TABLE IF NOT EXISTS public.clinical_rule_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    methodology_version_id uuid NOT NULL REFERENCES public.clinical_methodology_versions(id) ON DELETE CASCADE,
    rule_identifier text NOT NULL,
    rule_name text NOT NULL,
    parameter_thresholds jsonb NOT NULL DEFAULT '{}'::jsonb,
    logic_description text NOT NULL,
    is_mandatory_safety_rule boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clinical_rule_versions_mv ON public.clinical_rule_versions(methodology_version_id);
CREATE INDEX IF NOT EXISTS idx_clinical_rule_versions_ident ON public.clinical_rule_versions(rule_identifier);

-- 7. Clinical Recommendation Registry
CREATE TABLE IF NOT EXISTS public.clinical_recommendation_registry (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    methodology_id uuid NOT NULL REFERENCES public.clinical_methodologies(id) ON DELETE CASCADE,
    code text NOT NULL UNIQUE,
    category text NOT NULL CHECK (
        category IN (
            'screening',
            'referral',
            'urgent_action',
            'follow_up',
            'lifestyle_counseling'
        )
    ),
    title_en text NOT NULL,
    title_bn text NOT NULL,
    description_en text NOT NULL,
    description_bn text NOT NULL,
    clinical_rationale text NOT NULL,
    evidence_strength text NOT NULL DEFAULT 'Strong',
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'suspended')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recommendation_reg_methodology ON public.clinical_recommendation_registry(methodology_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_reg_status ON public.clinical_recommendation_registry(status);

-- 8. Clinician Overrides (Audit Records with Non-Destructive Preservation)
CREATE TABLE IF NOT EXISTS public.clinician_overrides (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id text NOT NULL,
    patient_id text NOT NULL,
    clinician_id text NOT NULL,
    clinician_name text NOT NULL,
    facility_id text,
    engine_subsystem text NOT NULL CHECK (
        engine_subsystem IN (
            'risk_estimation',
            'screening_eligibility',
            'symptom_triage',
            'clinical_decision_support'
        )
    ),
    methodology_version_id uuid REFERENCES public.clinical_methodology_versions(id) ON DELETE SET NULL,
    automated_result jsonb NOT NULL,
    overridden_result jsonb NOT NULL,
    override_reason_category text NOT NULL CHECK (
        override_reason_category IN (
            'clinical_contraindication',
            'patient_preference',
            'comorbidity_precaution',
            'diagnostic_discordance',
            'expert_judgment',
            'other'
        )
    ),
    override_rationale text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clinician_overrides_assessment ON public.clinician_overrides(assessment_id);
CREATE INDEX IF NOT EXISTS idx_clinician_overrides_patient ON public.clinician_overrides(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinician_overrides_subsystem ON public.clinician_overrides(engine_subsystem);
CREATE INDEX IF NOT EXISTS idx_clinician_overrides_created_at ON public.clinician_overrides(created_at DESC);

-- 9. Append-Only Governance Audit Events Log
CREATE TABLE IF NOT EXISTS public.governance_audit_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type text NOT NULL CHECK (
        entity_type IN (
            'board',
            'member',
            'meeting',
            'methodology',
            'version',
            'rule',
            'recommendation',
            'override_review'
        )
    ),
    entity_id text NOT NULL,
    action text NOT NULL CHECK (
        action IN (
            'created',
            'status_changed',
            'approved',
            'activated',
            'suspended',
            'deprecated',
            'rejected',
            'reviewed',
            'credential_verified'
        )
    ),
    previous_state jsonb,
    new_state jsonb NOT NULL,
    actor_id text NOT NULL,
    actor_name text NOT NULL,
    actor_role text NOT NULL,
    justification text NOT NULL,
    meeting_reference text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gov_audit_entity ON public.governance_audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_gov_audit_action ON public.governance_audit_events(action);
CREATE INDEX IF NOT EXISTS idx_gov_audit_created_at ON public.governance_audit_events(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.clinical_governance_bodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_governance_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_methodologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_methodology_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_rule_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_recommendation_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinician_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_audit_events ENABLE ROW LEVEL SECURITY;

-- Policies: Authenticated users can view governance data
CREATE POLICY "Authenticated users can view clinical governance bodies"
    ON public.clinical_governance_bodies FOR SELECT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view clinical governance members"
    ON public.clinical_governance_members FOR SELECT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view governance meetings"
    ON public.governance_meetings FOR SELECT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view clinical methodologies"
    ON public.clinical_methodologies FOR SELECT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view clinical methodology versions"
    ON public.clinical_methodology_versions FOR SELECT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view clinical rule versions"
    ON public.clinical_rule_versions FOR SELECT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view clinical recommendations"
    ON public.clinical_recommendation_registry FOR SELECT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated clinical staff can view clinician overrides"
    ON public.clinician_overrides FOR SELECT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated staff can record clinician overrides"
    ON public.clinician_overrides FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view governance audit events"
    ON public.governance_audit_events FOR SELECT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated governance users can record audit events"
    ON public.governance_audit_events FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

