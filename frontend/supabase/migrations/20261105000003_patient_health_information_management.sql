-- ==============================================================================
-- Lungent Platform Migration: Patient Health Information Management
-- Milestone: Phase 1.7
-- ==============================================================================

-- 1. Patient Medical History Table
CREATE TABLE IF NOT EXISTS public.patient_medical_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    condition_name text NOT NULL,
    condition_code text, -- e.g. ICD-10 or clinical slug: copd, asthma, tb_residual, lung_cancer
    condition_category text NOT NULL DEFAULT 'respiratory' CHECK (condition_category IN ('respiratory', 'oncological', 'cardiovascular', 'surgical', 'infectious', 'other')),
    clinical_status text NOT NULL DEFAULT 'active' CHECK (clinical_status IN ('active', 'resolved', 'in_remission', 'unknown')),
    onset_date text, -- e.g. YYYY-MM-DD or approx year '2018'
    approximate_onset_age integer,
    is_primary_respiratory boolean NOT NULL DEFAULT false,
    treatment_summary text,
    hospitalization_history text,
    notes text,
    -- Data Provenance
    data_source text NOT NULL DEFAULT 'healthcare_worker_entered' CHECK (data_source IN ('patient_reported', 'healthcare_worker_entered', 'clinician_verified', 'imported_external', 'derived_calculated')),
    verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'rejected', 'disputed')),
    verified_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verified_at timestamptz,
    recorded_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    facility_id text DEFAULT 'facility-dhaka-central',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_med_history_patient_id ON public.patient_medical_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_med_history_category ON public.patient_medical_history(condition_category);
CREATE INDEX IF NOT EXISTS idx_med_history_status ON public.patient_medical_history(clinical_status);

-- 2. Patient Medications & Treatments Table
CREATE TABLE IF NOT EXISTS public.patient_medications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    medication_name text NOT NULL,
    medication_type text NOT NULL DEFAULT 'other' CHECK (medication_type IN ('respiratory_inhaler', 'bronchodilator', 'oral_steroid', 'cancer_therapy', 'cardiovascular', 'antibiotic', 'tuberculosis_regimen', 'other')),
    dosage_instructions text,
    prescribing_source text,
    start_date text,
    end_date text,
    is_current boolean NOT NULL DEFAULT true,
    notes text,
    -- Data Provenance
    data_source text NOT NULL DEFAULT 'healthcare_worker_entered' CHECK (data_source IN ('patient_reported', 'healthcare_worker_entered', 'clinician_verified', 'imported_external', 'derived_calculated')),
    verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'rejected', 'disputed')),
    verified_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verified_at timestamptz,
    recorded_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    facility_id text DEFAULT 'facility-dhaka-central',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON public.patient_medications(patient_id);

-- 3. Patient Allergies Table
CREATE TABLE IF NOT EXISTS public.patient_allergies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    allergen_type text NOT NULL CHECK (allergen_type IN ('medication', 'environmental', 'food', 'other', 'no_known_allergies')),
    allergen_name text NOT NULL,
    reaction_description text,
    severity text NOT NULL DEFAULT 'unknown' CHECK (severity IN ('mild', 'moderate', 'severe', 'anaphylaxis', 'unknown')),
    is_active boolean NOT NULL DEFAULT true,
    notes text,
    -- Data Provenance
    data_source text NOT NULL DEFAULT 'healthcare_worker_entered' CHECK (data_source IN ('patient_reported', 'healthcare_worker_entered', 'clinician_verified', 'imported_external', 'derived_calculated')),
    verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'rejected', 'disputed')),
    verified_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verified_at timestamptz,
    recorded_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    facility_id text DEFAULT 'facility-dhaka-central',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_allergies_patient_id ON public.patient_allergies(patient_id);

-- 4. Patient Smoking and Tobacco History Table
CREATE TABLE IF NOT EXISTS public.patient_smoking_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    smoking_status text NOT NULL CHECK (smoking_status IN ('never', 'current', 'former', 'unknown_unreported')),
    tobacco_type text NOT NULL DEFAULT 'cigarettes' CHECK (tobacco_type IN ('cigarettes', 'bidi', 'hookah', 'smokeless_zarda_gul', 'mixed', 'none')),
    cigarettes_per_day numeric,
    bidis_per_day numeric,
    years_smoked numeric,
    age_started integer,
    age_quit integer,
    quit_date text,
    calculated_pack_years numeric,
    pack_years_calculation_method text,
    secondhand_smoke_exposure boolean NOT NULL DEFAULT false,
    secondhand_smoke_context text DEFAULT 'none' CHECK (secondhand_smoke_context IN ('household', 'workplace', 'both', 'none', 'unknown')),
    other_tobacco_details text,
    notes text,
    -- Data Provenance
    data_source text NOT NULL DEFAULT 'healthcare_worker_entered' CHECK (data_source IN ('patient_reported', 'healthcare_worker_entered', 'clinician_verified', 'imported_external', 'derived_calculated')),
    verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'rejected', 'disputed')),
    verified_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verified_at timestamptz,
    recorded_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    facility_id text DEFAULT 'facility-dhaka-central',
    is_current boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smoking_patient_id ON public.patient_smoking_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_smoking_status ON public.patient_smoking_history(smoking_status);

-- 5. Patient Environmental and Occupational Exposures Table
CREATE TABLE IF NOT EXISTS public.patient_environmental_exposures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    exposure_category text NOT NULL CHECK (exposure_category IN ('occupational', 'indoor_biomass', 'outdoor_air_pollution', 'secondhand_smoke', 'other')),
    exposure_type text NOT NULL, -- e.g. biomass_chula, asbestos, silica_dust, shipbreaking_welding, textile_dyes, pesticides
    cooking_fuel_type text CHECK (cooking_fuel_type IN ('clean_lpg_electric', 'biomass_wood_dung', 'kerosene', 'coal', 'mixed')),
    duration_years numeric,
    intensity text NOT NULL DEFAULT 'moderate' CHECK (intensity IN ('low', 'moderate', 'high', 'unknown')),
    is_current boolean NOT NULL DEFAULT false,
    start_year integer,
    end_year integer,
    context_details text,
    notes text,
    -- Data Provenance
    data_source text NOT NULL DEFAULT 'healthcare_worker_entered' CHECK (data_source IN ('patient_reported', 'healthcare_worker_entered', 'clinician_verified', 'imported_external', 'derived_calculated')),
    verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'rejected', 'disputed')),
    verified_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verified_at timestamptz,
    recorded_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    facility_id text DEFAULT 'facility-dhaka-central',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exposures_patient_id ON public.patient_environmental_exposures(patient_id);
CREATE INDEX IF NOT EXISTS idx_exposures_category ON public.patient_environmental_exposures(exposure_category);

-- 6. Patient Family Medical History Table
CREATE TABLE IF NOT EXISTS public.patient_family_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    relationship text NOT NULL CHECK (relationship IN ('parent', 'sibling', 'child', 'grandparent', 'uncle_aunt', 'other')),
    condition_type text NOT NULL CHECK (condition_type IN ('lung_cancer', 'other_cancer', 'copd_respiratory', 'cardiovascular', 'other')),
    specific_cancer_type text,
    age_at_diagnosis integer,
    notes text,
    -- Data Provenance
    data_source text NOT NULL DEFAULT 'healthcare_worker_entered' CHECK (data_source IN ('patient_reported', 'healthcare_worker_entered', 'clinician_verified', 'imported_external', 'derived_calculated')),
    verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'rejected', 'disputed')),
    verified_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verified_at timestamptz,
    recorded_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    facility_id text DEFAULT 'facility-dhaka-central',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_family_history_patient_id ON public.patient_family_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_family_history_condition ON public.patient_family_history(condition_type);

-- 7. Patient Lifestyle Information Table
CREATE TABLE IF NOT EXISTS public.patient_lifestyle (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    physical_activity_level text NOT NULL DEFAULT 'unknown' CHECK (physical_activity_level IN ('sedentary', 'light', 'moderate', 'active', 'unknown')),
    dietary_notes text,
    alcohol_consumption_status text NOT NULL DEFAULT 'unknown' CHECK (alcohol_consumption_status IN ('never', 'former', 'occasional', 'moderate', 'heavy', 'unknown')),
    household_smokers_count integer DEFAULT 0,
    notes text,
    -- Data Provenance
    data_source text NOT NULL DEFAULT 'healthcare_worker_entered' CHECK (data_source IN ('patient_reported', 'healthcare_worker_entered', 'clinician_verified', 'imported_external', 'derived_calculated')),
    verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'rejected', 'disputed')),
    verified_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verified_at timestamptz,
    recorded_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    facility_id text DEFAULT 'facility-dhaka-central',
    is_current boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lifestyle_patient_id ON public.patient_lifestyle(patient_id);

-- 8. Patient Health Measurements Table (Vitals, Height, Weight, BMI)
CREATE TABLE IF NOT EXISTS public.patient_health_measurements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    measurement_type text NOT NULL CHECK (measurement_type IN ('height', 'weight', 'bmi', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'blood_pressure_combined', 'heart_rate', 'oxygen_saturation', 'respiratory_rate')),
    numeric_value numeric NOT NULL,
    unit text NOT NULL,
    secondary_value numeric, -- e.g. diastolic value when combined BP is recorded
    is_calculated boolean NOT NULL DEFAULT false,
    calculation_formula text,
    measured_at timestamptz NOT NULL DEFAULT now(),
    measurement_context text DEFAULT 'clinic_intake' CHECK (measurement_context IN ('clinic_intake', 'community_camp', 'hospital_bedside', 'self_reported')),
    notes text,
    -- Data Provenance
    data_source text NOT NULL DEFAULT 'healthcare_worker_entered' CHECK (data_source IN ('patient_reported', 'healthcare_worker_entered', 'clinician_verified', 'imported_external', 'derived_calculated')),
    verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'rejected', 'disputed')),
    verified_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verified_at timestamptz,
    recorded_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    facility_id text DEFAULT 'facility-dhaka-central',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_measurements_patient_id ON public.patient_health_measurements(patient_id);
CREATE INDEX IF NOT EXISTS idx_measurements_type ON public.patient_health_measurements(measurement_type);

-- 9. Patient Symptoms & Respiratory Complaints Table
CREATE TABLE IF NOT EXISTS public.patient_symptom_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    symptom_name text NOT NULL CHECK (symptom_name IN ('cough', 'cough_with_hemoptysis', 'dyspnea_breathlessness', 'chest_pain', 'unexplained_weight_loss', 'persistent_hoarseness', 'fatigue', 'wheezing', 'fever_night_sweats', 'other')),
    is_present boolean NOT NULL DEFAULT true,
    onset_date text,
    duration_weeks numeric,
    progression text NOT NULL DEFAULT 'stable' CHECK (progression IN ('improving', 'stable', 'worsening', 'fluctuating', 'unknown')),
    severity text NOT NULL DEFAULT 'moderate' CHECK (severity IN ('mild', 'moderate', 'severe', 'acute_critical')),
    clinical_observation_type text NOT NULL DEFAULT 'healthcare_worker_entered' CHECK (clinical_observation_type IN ('patient_reported', 'healthcare_worker_entered', 'clinician_documented')),
    is_active boolean NOT NULL DEFAULT true,
    notes text,
    -- Data Provenance
    data_source text NOT NULL DEFAULT 'healthcare_worker_entered' CHECK (data_source IN ('patient_reported', 'healthcare_worker_entered', 'clinician_verified', 'imported_external', 'derived_calculated')),
    verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'rejected', 'disputed')),
    verified_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verified_at timestamptz,
    recorded_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    facility_id text DEFAULT 'facility-dhaka-central',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_symptoms_patient_id ON public.patient_symptom_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_symptoms_name ON public.patient_symptom_history(symptom_name);

-- 10. Patient Health Reviews & Clinician Verification Ledger
CREATE TABLE IF NOT EXISTS public.patient_health_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    category_reviewed text NOT NULL CHECK (category_reviewed IN ('all', 'medical_history', 'medications', 'allergies', 'smoking_history', 'environmental_exposures', 'family_history', 'measurements', 'symptoms', 'other')),
    target_record_id uuid, -- optional pointer to specific item reviewed
    reviewer_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    review_decision text NOT NULL CHECK (review_decision IN ('verified', 'amended_verified', 'rejected_unreliable', 'requires_followup')),
    clinical_rationale text NOT NULL,
    facility_id text DEFAULT 'facility-dhaka-central',
    reviewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_reviews_patient_id ON public.patient_health_reviews(patient_id);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.patient_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_smoking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_environmental_exposures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_family_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_lifestyle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_health_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_symptom_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_health_reviews ENABLE ROW LEVEL SECURITY;

-- 1. Patient Medical History RLS
CREATE POLICY "Authorized users can view patient medical history"
    ON public.patient_medical_history FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

CREATE POLICY "Authorized staff and patients can insert medical history"
    ON public.patient_medical_history FOR INSERT TO authenticated
    WITH CHECK (public.can_access_patient(patient_id));

CREATE POLICY "Authorized staff can update medical history"
    ON public.patient_medical_history FOR UPDATE TO authenticated
    USING (public.can_access_patient(patient_id));

-- 2. Patient Medications RLS
CREATE POLICY "Authorized users can view patient medications"
    ON public.patient_medications FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

CREATE POLICY "Authorized users can manage patient medications"
    ON public.patient_medications FOR ALL TO authenticated
    USING (public.can_access_patient(patient_id));

-- 3. Patient Allergies RLS
CREATE POLICY "Authorized users can view patient allergies"
    ON public.patient_allergies FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

CREATE POLICY "Authorized users can manage patient allergies"
    ON public.patient_allergies FOR ALL TO authenticated
    USING (public.can_access_patient(patient_id));

-- 4. Patient Smoking History RLS
CREATE POLICY "Authorized users can view patient smoking history"
    ON public.patient_smoking_history FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

CREATE POLICY "Authorized users can manage patient smoking history"
    ON public.patient_smoking_history FOR ALL TO authenticated
    USING (public.can_access_patient(patient_id));

-- 5. Patient Environmental Exposures RLS
CREATE POLICY "Authorized users can view environmental exposures"
    ON public.patient_environmental_exposures FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

CREATE POLICY "Authorized users can manage environmental exposures"
    ON public.patient_environmental_exposures FOR ALL TO authenticated
    USING (public.can_access_patient(patient_id));

-- 6. Patient Family History RLS
CREATE POLICY "Authorized users can view family history"
    ON public.patient_family_history FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

CREATE POLICY "Authorized users can manage family history"
    ON public.patient_family_history FOR ALL TO authenticated
    USING (public.can_access_patient(patient_id));

-- 7. Patient Lifestyle RLS
CREATE POLICY "Authorized users can view patient lifestyle"
    ON public.patient_lifestyle FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

CREATE POLICY "Authorized users can manage patient lifestyle"
    ON public.patient_lifestyle FOR ALL TO authenticated
    USING (public.can_access_patient(patient_id));

-- 8. Patient Health Measurements RLS
CREATE POLICY "Authorized users can view health measurements"
    ON public.patient_health_measurements FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

CREATE POLICY "Authorized users can record health measurements"
    ON public.patient_health_measurements FOR INSERT TO authenticated
    WITH CHECK (public.can_access_patient(patient_id));

-- 9. Patient Symptom History RLS
CREATE POLICY "Authorized users can view patient symptoms"
    ON public.patient_symptom_history FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

CREATE POLICY "Authorized users can manage patient symptoms"
    ON public.patient_symptom_history FOR ALL TO authenticated
    USING (public.can_access_patient(patient_id));

-- 10. Patient Health Reviews RLS
CREATE POLICY "Authorized staff can view health reviews"
    ON public.patient_health_reviews FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

CREATE POLICY "Clinicians and admins can record health reviews"
    ON public.patient_health_reviews FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = public.current_profile_id()
              AND ur.role_id IN ('clinician', 'administrator')
        )
        OR public.is_admin()
    );

