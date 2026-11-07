-- ==============================================================================
-- Migration: 20261105000024_advanced_healthcare_integrations.sql
-- Description: Phase 2.9 Advanced Healthcare Integrations Framework
-- Author: Lungent Architecture Team
-- ==============================================================================

-- 1. Create Enums for Healthcare Interoperability
DO $$ BEGIN
    CREATE TYPE public.healthcare_system_type AS ENUM (
        'ehr',
        'lis',
        'pacs_ris',
        'facility_registry',
        'identity_service',
        'health_information_exchange'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.interoperability_standard_type AS ENUM (
        'hl7_fhir_r4',
        'hl7_v2',
        'dicom_bridge',
        'rest_json',
        'smart_on_fhir'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.integration_connection_status AS ENUM (
        'active',
        'degraded',
        'disconnected',
        'sandbox_mock',
        'maintenance'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.imported_diagnostic_review_status AS ENUM (
        'pending_review',
        'verified',
        'reconciled',
        'rejected',
        'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Healthcare Integration Systems Registry Table
CREATE TABLE IF NOT EXISTS public.healthcare_integration_systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_code VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    system_type public.healthcare_system_type NOT NULL,
    interoperability_standard public.interoperability_standard_type NOT NULL DEFAULT 'hl7_fhir_r4',
    endpoint_url TEXT,
    auth_method VARCHAR(50) NOT NULL DEFAULT 'oauth2_smart_fhir',
    status public.integration_connection_status NOT NULL DEFAULT 'sandbox_mock',
    last_sync_at TIMESTAMPTZ,
    sync_interval_minutes INT NOT NULL DEFAULT 60,
    circuit_breaker_failures INT NOT NULL DEFAULT 0,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    jurisdiction VARCHAR(100) NOT NULL DEFAULT 'Bangladesh',
    attribution_text TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_int_sys_code ON public.healthcare_integration_systems(system_code);
CREATE INDEX IF NOT EXISTS idx_int_sys_type ON public.healthcare_integration_systems(system_type);
CREATE INDEX IF NOT EXISTS idx_int_sys_status ON public.healthcare_integration_systems(status);

-- 3. Patient External Identifiers Table (Isolates External IDs from Internal UUID)
CREATE TABLE IF NOT EXISTS public.patient_external_identifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    system_id UUID NOT NULL REFERENCES public.healthcare_integration_systems(id) ON DELETE CASCADE,
    identifier_system_uri VARCHAR(255) NOT NULL,
    identifier_type VARCHAR(50) NOT NULL DEFAULT 'mrn',
    external_id_value VARCHAR(255) NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'verified',
    is_primary_for_system BOOLEAN NOT NULL DEFAULT true,
    matched_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_patient_sys_external_id UNIQUE (system_id, external_id_value)
);

CREATE INDEX IF NOT EXISTS idx_patient_ext_id_patient ON public.patient_external_identifiers(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_ext_id_val ON public.patient_external_identifiers(external_id_value);

-- 4. Healthcare Data Exchange Transactions Log Table
CREATE TABLE IF NOT EXISTS public.healthcare_data_exchange_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_id UUID NOT NULL REFERENCES public.healthcare_integration_systems(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL,
    standard public.interoperability_standard_type NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    payload_hash VARCHAR(128) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'success',
    error_message TEXT,
    latency_ms INT NOT NULL DEFAULT 0,
    consent_verified BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_hdx_tx_system ON public.healthcare_data_exchange_transactions(system_id);
CREATE INDEX IF NOT EXISTS idx_hdx_tx_patient ON public.healthcare_data_exchange_transactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_hdx_tx_created ON public.healthcare_data_exchange_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_hdx_tx_hash ON public.healthcare_data_exchange_transactions(payload_hash);

-- 5. Imported Diagnostic & Laboratory Records Staging Table
CREATE TABLE IF NOT EXISTS public.imported_diagnostic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    system_id UUID NOT NULL REFERENCES public.healthcare_integration_systems(id) ON DELETE CASCADE,
    external_record_id VARCHAR(255) NOT NULL,
    record_type VARCHAR(60) NOT NULL,
    test_or_exam_code VARCHAR(100),
    test_or_exam_name VARCHAR(255) NOT NULL,
    modality VARCHAR(50),
    specimen_type VARCHAR(100),
    result_value TEXT,
    result_unit VARCHAR(50),
    reference_range TEXT,
    status_in_source VARCHAR(50) NOT NULL DEFAULT 'final',
    clinical_impression TEXT,
    performed_at TIMESTAMPTZ,
    reported_at TIMESTAMPTZ NOT NULL,
    clinician_review_status public.imported_diagnostic_review_status NOT NULL DEFAULT 'pending_review',
    reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    clinician_action_notes TEXT,
    reconciliation_decision VARCHAR(50) NOT NULL DEFAULT 'unreviewed',
    is_suppressed_or_archived BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_imp_diag_patient ON public.imported_diagnostic_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_imp_diag_system ON public.imported_diagnostic_records(system_id);
CREATE INDEX IF NOT EXISTS idx_imp_diag_status ON public.imported_diagnostic_records(clinician_review_status);
CREATE INDEX IF NOT EXISTS idx_imp_diag_ext_id ON public.imported_diagnostic_records(external_record_id);

-- 6. Integration Reconciliation Events Audit Table
CREATE TABLE IF NOT EXISTS public.integration_reconciliation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    system_id UUID NOT NULL REFERENCES public.healthcare_integration_systems(id) ON DELETE CASCADE,
    conflicting_field VARCHAR(100) NOT NULL,
    authoritative_value JSONB NOT NULL,
    external_value JSONB NOT NULL,
    decision VARCHAR(50) NOT NULL,
    justification TEXT NOT NULL,
    reconciled_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_int_recon_patient ON public.integration_reconciliation_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_int_recon_field ON public.integration_reconciliation_events(conflicting_field);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.healthcare_integration_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_external_identifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_data_exchange_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imported_diagnostic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_reconciliation_events ENABLE ROW LEVEL SECURITY;

-- 8. Row Level Security Policies

-- Healthcare Integration Systems: Viewable by authenticated staff, managed by admin
CREATE POLICY "Integration systems viewable by staff"
    ON public.healthcare_integration_systems FOR SELECT TO authenticated
    USING (
        is_enabled = true OR
        public.has_role('admin') OR
        public.has_role('clinician')
    );

CREATE POLICY "Admin manage integration systems"
    ON public.healthcare_integration_systems FOR ALL TO authenticated
    USING (public.has_role('admin'));

-- Patient External Identifiers: Viewable by self, clinician, healthcare worker, and admin
CREATE POLICY "Patients view own external identifiers"
    ON public.patient_external_identifiers FOR SELECT TO authenticated
    USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Staff manage patient external identifiers"
    ON public.patient_external_identifiers FOR ALL TO authenticated
    USING (
        public.has_role('clinician') OR
        public.has_role('healthcare_worker') OR
        public.has_role('admin')
    );

-- Healthcare Data Exchange Transactions: Viewable by clinicians and admin
CREATE POLICY "Staff view data exchange transactions"
    ON public.healthcare_data_exchange_transactions FOR SELECT TO authenticated
    USING (
        public.has_role('admin') OR
        public.has_role('clinician')
    );

CREATE POLICY "Staff insert data exchange transactions"
    ON public.healthcare_data_exchange_transactions FOR INSERT TO authenticated
    WITH CHECK (
        public.has_role('admin') OR
        public.has_role('clinician') OR
        public.has_role('healthcare_worker')
    );

-- Imported Diagnostic Records: Viewable by self (patient after review), clinician, admin
CREATE POLICY "Patients view approved imported records"
    ON public.imported_diagnostic_records FOR SELECT TO authenticated
    USING (
        (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()) AND
         clinician_review_status IN ('verified', 'reconciled'))
    );

CREATE POLICY "Staff manage imported diagnostic records"
    ON public.imported_diagnostic_records FOR ALL TO authenticated
    USING (
        public.has_role('clinician') OR
        public.has_role('healthcare_worker') OR
        public.has_role('admin')
    );

-- Integration Reconciliation Events: Viewable by clinician and admin
CREATE POLICY "Staff view reconciliation events"
    ON public.integration_reconciliation_events FOR SELECT TO authenticated
    USING (
        public.has_role('admin') OR
        public.has_role('clinician')
    );

CREATE POLICY "Staff insert reconciliation events"
    ON public.integration_reconciliation_events FOR INSERT TO authenticated
    WITH CHECK (
        public.has_role('admin') OR
        public.has_role('clinician')
    );

-- Service Role Full Access
CREATE POLICY "Service role full access on integration systems"
    ON public.healthcare_integration_systems FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on patient external IDs"
    ON public.patient_external_identifiers FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on data exchange transactions"
    ON public.healthcare_data_exchange_transactions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on imported diagnostic records"
    ON public.imported_diagnostic_records FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on reconciliation events"
    ON public.integration_reconciliation_events FOR ALL TO service_role USING (true) WITH CHECK (true);

