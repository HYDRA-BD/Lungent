-- ==============================================================================
-- Migration: 20261105000021_advanced_clinical_intelligence.sql
-- Phase 2.6: Advanced Clinical Intelligence Architecture,
-- Clinical Evidence Retrieval, Knowledge Articles, Decision-Support Insights,
-- Traceable Recommendation Assistance & Row Level Security
-- ==============================================================================

-- 1. Authoritative Clinical Evidence Sources Table
CREATE TABLE IF NOT EXISTS public.clinical_evidence_sources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    title_en text NOT NULL,
    title_bn text NOT NULL,
    issuing_organization text NOT NULL,
    source_type text NOT NULL CHECK (
        source_type IN (
            'guideline',
            'systematic_review',
            'randomized_trial',
            'observational_study',
            'national_protocol',
            'expert_consensus'
        )
    ),
    evidence_tier text NOT NULL CHECK (
        evidence_tier IN (
            'Level 1a',
            'Level 1b',
            'Level 2a',
            'Level 2b',
            'Level 3',
            'Grade A',
            'Grade B',
            'Grade C',
            'Consensus'
        )
    ),
    primary_topic text NOT NULL CHECK (
        primary_topic IN (
            'risk_factors',
            'tobacco_exposure',
            'environmental_exposure',
            'screening_guidance',
            'symptom_triage',
            'diagnostic_pathways',
            'referral_criteria',
            'patient_education'
        )
    ),
    jurisdiction text NOT NULL CHECK (
        jurisdiction IN (
            'Bangladesh',
            'International',
            'United States',
            'United Kingdom',
            'WHO'
        )
    ),
    publication_reference text NOT NULL,
    official_url text,
    doi text,
    publication_date date NOT NULL,
    last_reviewed_date date,
    version_tag text NOT NULL DEFAULT '1.0.0',
    approval_status text NOT NULL DEFAULT 'approved' CHECK (
        approval_status IN (
            'draft',
            'under_review',
            'approved',
            'active',
            'superseded',
            'withdrawn'
        )
    ),
    approved_for_bangladesh boolean NOT NULL DEFAULT false,
    bangladesh_adaptation_notes text,
    summary_en text NOT NULL,
    summary_bn text NOT NULL,
    key_recommendations_en jsonb NOT NULL DEFAULT '[]'::jsonb,
    key_recommendations_bn jsonb NOT NULL DEFAULT '[]'::jsonb,
    clinical_limitations text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_code ON public.clinical_evidence_sources(code);
CREATE INDEX IF NOT EXISTS idx_evidence_topic ON public.clinical_evidence_sources(primary_topic);
CREATE INDEX IF NOT EXISTS idx_evidence_tier ON public.clinical_evidence_sources(evidence_tier);
CREATE INDEX IF NOT EXISTS idx_evidence_jurisdiction ON public.clinical_evidence_sources(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_evidence_status ON public.clinical_evidence_sources(approval_status);

-- 2. Structured Clinical Knowledge Articles Table
CREATE TABLE IF NOT EXISTS public.clinical_knowledge_articles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    topic text NOT NULL,
    title_en text NOT NULL,
    title_bn text NOT NULL,
    content_en text NOT NULL,
    content_bn text NOT NULL,
    target_audience text NOT NULL CHECK (
        target_audience IN ('clinician', 'healthcare_worker', 'patient', 'public')
    ),
    primary_evidence_source_id uuid REFERENCES public.clinical_evidence_sources(id) ON DELETE SET NULL,
    evidence_grade text,
    is_published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kb_slug ON public.clinical_knowledge_articles(slug);
CREATE INDEX IF NOT EXISTS idx_kb_topic ON public.clinical_knowledge_articles(topic);
CREATE INDEX IF NOT EXISTS idx_kb_audience ON public.clinical_knowledge_articles(target_audience);

-- 3. Patient Clinical Decision-Support Insights Table
CREATE TABLE IF NOT EXISTS public.clinical_decision_support_insights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id text NOT NULL,
    assessment_id text NOT NULL,
    facility_id text,
    insight_category text NOT NULL CHECK (
        insight_category IN (
            'risk_factor_alert',
            'screening_consideration',
            'symptom_warning',
            'environmental_hazard',
            'data_incompleteness',
            'referral_prompt'
        )
    ),
    title_en text NOT NULL,
    title_bn text NOT NULL,
    explanation_en text NOT NULL,
    explanation_bn text NOT NULL,
    clinical_justification text NOT NULL,
    provenance_type text NOT NULL CHECK (
        provenance_type IN (
            'patient_reported',
            'healthcare_worker_entered',
            'retrieved_evidence',
            'system_generated_decision_support'
        )
    ),
    trigger_attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
    supporting_evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
    confidence_tier text NOT NULL CHECK (
        confidence_tier IN ('high', 'moderate', 'low', 'provisional')
    ),
    clinician_action_status text NOT NULL DEFAULT 'pending' CHECK (
        clinician_action_status IN (
            'pending',
            'accepted',
            'modified',
            'dismissed',
            'overridden'
        )
    ),
    clinician_action_notes text,
    acted_by text,
    acted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cds_patient ON public.clinical_decision_support_insights(patient_id);
CREATE INDEX IF NOT EXISTS idx_cds_assessment ON public.clinical_decision_support_insights(assessment_id);
CREATE INDEX IF NOT EXISTS idx_cds_category ON public.clinical_decision_support_insights(insight_category);
CREATE INDEX IF NOT EXISTS idx_cds_status ON public.clinical_decision_support_insights(clinician_action_status);

-- 4. Evidence-Based Recommendation Assistance Table
CREATE TABLE IF NOT EXISTS public.clinical_recommendation_assistance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id text NOT NULL,
    assessment_id text NOT NULL,
    insight_id uuid REFERENCES public.clinical_decision_support_insights(id) ON DELETE CASCADE,
    recommendation_category text NOT NULL CHECK (
        recommendation_category IN (
            'screening',
            'diagnostic_workup',
            'urgent_referral',
            'smoking_cessation',
            'environmental_mitigation',
            'routine_followup'
        )
    ),
    recommendation_code text NOT NULL,
    statement_en text NOT NULL,
    statement_bn text NOT NULL,
    evidence_source_id uuid REFERENCES public.clinical_evidence_sources(id) ON DELETE SET NULL,
    evidence_strength text NOT NULL,
    applicability_conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
    contraindications jsonb NOT NULL DEFAULT '[]'::jsonb,
    action_status text NOT NULL DEFAULT 'pending' CHECK (
        action_status IN ('pending', 'accepted', 'modified', 'dismissed', 'overridden')
    ),
    clinician_rationale text,
    clinician_id text,
    documented_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rec_assist_patient ON public.clinical_recommendation_assistance(patient_id);
CREATE INDEX IF NOT EXISTS idx_rec_assist_assessment ON public.clinical_recommendation_assistance(assessment_id);
CREATE INDEX IF NOT EXISTS idx_rec_assist_code ON public.clinical_recommendation_assistance(recommendation_code);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.clinical_evidence_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_decision_support_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_recommendation_assistance ENABLE ROW LEVEL SECURITY;

-- Evidence sources viewable by authenticated users
CREATE POLICY "Authenticated users view approved evidence sources"
    ON public.clinical_evidence_sources
    FOR SELECT
    TO authenticated
    USING (approval_status IN ('approved', 'active', 'superseded'));

-- Knowledge articles viewable by authenticated users
CREATE POLICY "Authenticated users view published knowledge articles"
    ON public.clinical_knowledge_articles
    FOR SELECT
    TO authenticated
    USING (is_published = true);

-- Decision support insights viewable by clinicians, healthcare workers, administrators
CREATE POLICY "Clinical staff view patient decision support insights"
    ON public.clinical_decision_support_insights
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Clinicians update decision support insights"
    ON public.clinical_decision_support_insights
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Recommendations viewable and actionable by clinicians
CREATE POLICY "Clinical staff view and update recommendations"
    ON public.clinical_recommendation_assistance
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Service role bypass
CREATE POLICY "Service role full access on evidence sources"
    ON public.clinical_evidence_sources FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on knowledge articles"
    ON public.clinical_knowledge_articles FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on decision support insights"
    ON public.clinical_decision_support_insights FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on recommendation assistance"
    ON public.clinical_recommendation_assistance FOR ALL TO service_role USING (true) WITH CHECK (true);

