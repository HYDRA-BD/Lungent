export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AccountStatus =
  | 'pending_verification'
  | 'active'
  | 'suspended'
  | 'deactivated'

export type UserRole =
  | 'patient'
  | 'healthcare_worker'
  | 'clinician'
  | 'administrator'

export type PatientVerificationStatus =
  | 'unverified'
  | 'partially_verified'
  | 'verified'

export type PatientAccountAssociationStatus =
  | 'unlinked'
  | 'pending_verification'
  | 'linked'

export type PatientGender = 'female' | 'male' | 'other' | 'unspecified'

export type PatientRecordStatus = 'active' | 'inactive' | 'merged' | 'deceased'

export type PatientFacilityRelationshipType =
  | 'primary_registration'
  | 'care_site'
  | 'referral_destination'
  | 'temporary_intake'

export type DuplicateCandidateStatus =
  | 'pending_review'
  | 'dismissed_distinct_patients'
  | 'confirmed_duplicate'
  | 'merged'

export type DuplicateMatchType = 'exact' | 'high_probability' | 'moderate_probability'

export type HealthRecordDataSource =
  | 'patient_reported'
  | 'healthcare_worker_entered'
  | 'clinician_verified'
  | 'imported_external'
  | 'derived_calculated'

export type HealthRecordVerificationStatus =
  | 'unverified'
  | 'pending_verification'
  | 'verified'
  | 'rejected'
  | 'disputed'

export type ConditionCategory =
  | 'respiratory'
  | 'oncological'
  | 'cardiovascular'
  | 'surgical'
  | 'infectious'
  | 'other'

export type ConditionClinicalStatus = 'active' | 'resolved' | 'in_remission' | 'unknown'

export type MedicationType =
  | 'respiratory_inhaler'
  | 'bronchodilator'
  | 'oral_steroid'
  | 'cancer_therapy'
  | 'cardiovascular'
  | 'antibiotic'
  | 'tuberculosis_regimen'
  | 'other'

export type AllergenType =
  | 'medication'
  | 'environmental'
  | 'food'
  | 'other'
  | 'no_known_allergies'

export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'anaphylaxis' | 'unknown'

export type SmokingStatus = 'never' | 'current' | 'former' | 'unknown_unreported'

export type TobaccoType =
  | 'cigarettes'
  | 'bidi'
  | 'hookah'
  | 'smokeless_zarda_gul'
  | 'mixed'
  | 'none'

export type SecondhandSmokeContext = 'household' | 'workplace' | 'both' | 'none' | 'unknown'

export type ExposureCategory =
  | 'occupational'
  | 'indoor_biomass'
  | 'outdoor_air_pollution'
  | 'secondhand_smoke'
  | 'other'

export type CookingFuelType =
  | 'clean_lpg_electric'
  | 'biomass_wood_dung'
  | 'kerosene'
  | 'coal'
  | 'mixed'

export type ExposureIntensity = 'low' | 'moderate' | 'high' | 'unknown'

export type FamilyRelationship =
  | 'parent'
  | 'sibling'
  | 'child'
  | 'grandparent'
  | 'uncle_aunt'
  | 'other'

export type FamilyConditionType =
  | 'lung_cancer'
  | 'other_cancer'
  | 'copd_respiratory'
  | 'cardiovascular'
  | 'other'

export type PhysicalActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'unknown'

export type AlcoholConsumptionStatus =
  | 'never'
  | 'former'
  | 'occasional'
  | 'moderate'
  | 'heavy'
  | 'unknown'

export type MeasurementType =
  | 'height'
  | 'weight'
  | 'bmi'
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic'
  | 'blood_pressure_combined'
  | 'heart_rate'
  | 'oxygen_saturation'
  | 'respiratory_rate'

export type MeasurementContext =
  | 'clinic_intake'
  | 'community_camp'
  | 'hospital_bedside'
  | 'self_reported'

export type SymptomName =
  | 'cough'
  | 'cough_with_hemoptysis'
  | 'dyspnea_breathlessness'
  | 'chest_pain'
  | 'unexplained_weight_loss'
  | 'persistent_hoarseness'
  | 'fatigue'
  | 'wheezing'
  | 'fever_night_sweats'
  | 'other'

export type SymptomProgression = 'improving' | 'stable' | 'worsening' | 'fluctuating' | 'unknown'

export type SymptomSeverity = 'mild' | 'moderate' | 'severe' | 'acute_critical'

export type HealthReviewDecision =
  | 'verified'
  | 'amended_verified'
  | 'rejected_unreliable'
  | 'requires_followup'

export type AssessmentType =
  | 'lung_cancer_risk'
  | 'screening_eligibility'
  | 'symptom_triage'
  | 'comprehensive_intake'

export type AssessmentStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'awaiting_clinical_review'
  | 'reviewed'
  | 'completed'
  | 'requires_additional_information'

export type ReferralStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export type PatientDocumentType =
  | 'assessment_report'
  | 'clinical_summary'
  | 'health_summary'
  | 'referral_letter'
  | 'other'

export type NotificationCategory =
  | 'assessment'
  | 'clinical_review'
  | 'referral'
  | 'followup_reminder'
  | 'account_privacy'
  | 'system'

export type ConsentType =
  | 'assessment_terms'
  | 'health_data_collection'
  | 'anonymous_self_check_link'
  | 'care_team_sharing'
  | 'sms_notifications'

export type FacilityStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'active'
  | 'suspended'
  | 'inactive'
  | 'rejected'

export type FacilityVerificationStatus =
  | 'unverified'
  | 'pending_verification'
  | 'verified'
  | 'rejected'

export type FacilityRole =
  | 'facility_admin'
  | 'clinician'
  | 'healthcare_worker'
  | 'nurse'
  | 'data_entry_clerk'
  | 'support_staff'

export type StaffMembershipStatus =
  | 'active'
  | 'pending'
  | 'suspended'
  | 'revoked'

export type ServiceAvailabilityStatus =
  | 'available'
  | 'temporarily_unavailable'
  | 'planned'

export type FacilityGroupType =
  | 'national_network'
  | 'regional_directorate'
  | 'hospital_consortium'
  | 'ngo_alliance'
  | 'community_programme'

export type ClinicalReviewStatus =
  | 'pending_review'
  | 'under_review'
  | 'info_required'
  | 'reviewed'
  | 'closed'

export type ClinicalReviewType =
  | 'comprehensive_intake'
  | 'risk_evaluation'
  | 'screening_eligibility'
  | 'symptom_triage'
  | 'follow_up'

export type ClinicalObservationCategory =
  | 'pulmonary_vitals'
  | 'symptom_severity'
  | 'exposure_risk'
  | 'radiology_finding'
  | 'general'

export type ClinicalDecisionType =
  | 'screening_recommended'
  | 'diagnostic_workup_needed'
  | 'urgent_specialist_referral'
  | 'routine_follow_up'
  | 'no_immediate_intervention'

export type ClinicalDecisionStatus = 'draft' | 'finalized' | 'amended'

export type ClinicalAlertType =
  | 'red_flag_symptom'
  | 'assessment_warning'
  | 'missing_critical_info'
  | 'conflicting_data'
  | 'overdue_follow_up'
  | 'urgent_triage'

export type ClinicalAlertSeverity = 'critical' | 'high' | 'moderate' | 'low'

export type ClinicalAlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed'

export type ClinicalFollowUpStatus =
  | 'planned'
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'overdue'

export type ClinicalActivityType =
  | 'patient_record_reviewed'
  | 'assessment_reviewed'
  | 'observation_recorded'
  | 'decision_documented'
  | 'decision_amended'
  | 'alert_acknowledged'
  | 'alert_resolved'
  | 'followup_created'
  | 'followup_updated'
  | 'info_requested'

export type MethodologyLifecycleStatus =
  | 'research_only'
  | 'under_validation'
  | 'awaiting_clinical_approval'
  | 'approved_for_clinical_use'
  | 'suspended'
  | 'deprecated'

export type RiskCalculationType =
  | 'logistic_regression'
  | 'cox_proportional_hazards'
  | 'expert_rule_system'
  | 'experimental_ml'

export type RiskExecutionMode =
  | 'clinical_production'
  | 'research_simulation'
  | 'validation_audit'

export type RiskExecutionStatus =
  | 'draft'
  | 'awaiting_information'
  | 'ready_for_calculation'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'methodology_unavailable'
  | 'methodology_not_approved'

export type ScreeningExecutionStatus =
  | 'completed'
  | 'guideline_not_approved'
  | 'insufficient_information'
  | 'criteria_unmet'
  | 'criteria_met'
  | 'excluded'

export type ScreeningEligibilityOutcome =
  | 'eligible'
  | 'not_eligible'
  | 'cannot_be_determined'
  | 'additional_info_required'
  | 'evaluation_unavailable'
  | 'guideline_not_approved'

export type CriterionEvaluationStatus =
  | 'met'
  | 'unmet'
  | 'missing'
  | 'not_applicable'
  | 'indeterminate'

export type TriageExecutionStatus =
  | 'completed'
  | 'protocol_not_approved'
  | 'insufficient_information'
  | 'criteria_unmet'
  | 'criteria_met'
  | 'emergency_detected'
  | 'escalation_required'

export type TriageUrgencyLevel =
  | 'emergency_escalation'
  | 'urgent_assessment'
  | 'prompt_review'
  | 'routine_review'
  | 'additional_info_required'
  | 'protocol_not_approved'
  | 'triage_incomplete'

export type SymptomPresenceStatus =
  | 'present'
  | 'absent'
  | 'unknown'
  | 'not_reported'
  | 'unable_to_assess'

export type SymptomDataProvenance =
  | 'patient_reported'
  | 'worker_assisted'
  | 'clinician_verified'
  | 'imported'

export type TriageCriterionStatus =
  | 'met'
  | 'unmet'
  | 'missing'
  | 'not_applicable'
  | 'indeterminate'

export type EscalationStatus =
  | 'pending_escalation'
  | 'escalated'
  | 'acknowledged'
  | 'under_clinical_review'
  | 'action_documented'
  | 'resolved'
  | 'unable_to_complete'

export type GeographicAdministrativeLevel =
  | 'country'
  | 'division'
  | 'district'
  | 'upazila'
  | 'union_municipality'
  | 'ward'
  | 'neighborhood'

export type LocationVerificationStatus =
  | 'verified'
  | 'patient_reported'
  | 'worker_entered'
  | 'estimated'
  | 'unverified'

export type EnvironmentalDataStatus =
  | 'measured'
  | 'estimated'
  | 'forecast'
  | 'derived'
  | 'unavailable'

export type EnvironmentalParameterType =
  | 'aqi_us'
  | 'pm2_5'
  | 'pm10'
  | 'nitrogen_dioxide'
  | 'sulfur_dioxide'
  | 'carbon_monoxide'
  | 'ozone'

export type ExposureSettingType =
  | 'residential'
  | 'occupational'
  | 'transit'
  | 'recreational'

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: UserRole
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id: UserRole
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: UserRole
          name?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          id: string
          name: string
          description: string | null
          module: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          module: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          module?: string
          created_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          role_id: UserRole
          permission_id: string
          created_at: string
        }
        Insert: {
          role_id: UserRole
          permission_id: string
          created_at?: string
        }
        Update: {
          role_id?: UserRole
          permission_id?: string
          created_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          auth_user_id: string
          full_name: string
          email: string
          phone_number: string | null
          preferred_language: 'en' | 'bn'
          profile_image_url: string | null
          status: AccountStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          full_name: string
          email: string
          phone_number?: string | null
          preferred_language?: 'en' | 'bn'
          profile_image_url?: string | null
          status?: AccountStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          full_name?: string
          email?: string
          phone_number?: string | null
          preferred_language?: 'en' | 'bn'
          profile_image_url?: string | null
          status?: AccountStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: UserRole
          assigned_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role_id: UserRole
          assigned_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role_id?: UserRole
          assigned_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_facility_memberships: {
        Row: {
          id: string
          user_id: string
          facility_id: string
          facility_role: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          facility_id: string
          facility_role?: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          facility_id?: string
          facility_role?: string
          is_primary?: boolean
          created_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          target_user_id: string | null
          details: Record<string, Json>
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          target_user_id?: string | null
          details?: Record<string, Json>
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          action?: string
          target_user_id?: string | null
          details?: Record<string, Json>
          ip_address?: string | null
          created_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          id: string
          patient_id: string
          full_name: string
          date_of_birth: string | null
          approximate_age: number | null
          gender: PatientGender
          phone_number: string | null
          phone_number_normalized: string | null
          email: string | null
          nid_number: string | null
          nid_hash: string | null
          address_division: string | null
          address_district: string | null
          address_upazila: string | null
          address_details: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          preferred_language: 'en' | 'bn'
          verification_status: PatientVerificationStatus
          verified_by: string | null
          verified_at: string | null
          verification_source: string | null
          account_association_status: PatientAccountAssociationStatus
          associated_user_profile_id: string | null
          associated_at: string | null
          created_by: string | null
          primary_facility_id: string
          status: PatientRecordStatus
          merged_into_patient_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id?: string
          full_name: string
          date_of_birth?: string | null
          approximate_age?: number | null
          gender: PatientGender
          phone_number?: string | null
          phone_number_normalized?: string | null
          email?: string | null
          nid_number?: string | null
          nid_hash?: string | null
          address_division?: string | null
          address_district?: string | null
          address_upazila?: string | null
          address_details?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          preferred_language?: 'en' | 'bn'
          verification_status?: PatientVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          verification_source?: string | null
          account_association_status?: PatientAccountAssociationStatus
          associated_user_profile_id?: string | null
          associated_at?: string | null
          created_by?: string | null
          primary_facility_id?: string
          status?: PatientRecordStatus
          merged_into_patient_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          full_name?: string
          date_of_birth?: string | null
          approximate_age?: number | null
          gender?: PatientGender
          phone_number?: string | null
          phone_number_normalized?: string | null
          email?: string | null
          nid_number?: string | null
          nid_hash?: string | null
          address_division?: string | null
          address_district?: string | null
          address_upazila?: string | null
          address_details?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          preferred_language?: 'en' | 'bn'
          verification_status?: PatientVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          verification_source?: string | null
          account_association_status?: PatientAccountAssociationStatus
          associated_user_profile_id?: string | null
          associated_at?: string | null
          created_by?: string | null
          primary_facility_id?: string
          status?: PatientRecordStatus
          merged_into_patient_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_facility_access: {
        Row: {
          id: string
          patient_id: string
          facility_id: string
          relationship_type: PatientFacilityRelationshipType
          established_by: string | null
          consent_status: 'consented' | 'implied_care' | 'revoked'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          facility_id: string
          relationship_type?: PatientFacilityRelationshipType
          established_by?: string | null
          consent_status?: 'consented' | 'implied_care' | 'revoked'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          facility_id?: string
          relationship_type?: PatientFacilityRelationshipType
          established_by?: string | null
          consent_status?: 'consented' | 'implied_care' | 'revoked'
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      patient_duplicate_candidates: {
        Row: {
          id: string
          primary_patient_id: string
          candidate_patient_id: string
          match_score: number
          match_reasons: Json
          match_type: DuplicateMatchType
          status: DuplicateCandidateStatus
          detected_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          primary_patient_id: string
          candidate_patient_id: string
          match_score: number
          match_reasons?: Json
          match_type: DuplicateMatchType
          status?: DuplicateCandidateStatus
          detected_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          primary_patient_id?: string
          candidate_patient_id?: string
          match_score?: number
          match_reasons?: Json
          match_type?: DuplicateMatchType
          status?: DuplicateCandidateStatus
          detected_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      patient_duplicate_reviews: {
        Row: {
          id: string
          candidate_id: string
          reviewer_id: string
          decision: 'dismissed_distinct' | 'confirmed_duplicate' | 'approved_for_merge' | 'merge_executed'
          justification: string
          reviewed_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          reviewer_id: string
          decision: 'dismissed_distinct' | 'confirmed_duplicate' | 'approved_for_merge' | 'merge_executed'
          justification: string
          reviewed_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          reviewer_id?: string
          decision?: 'dismissed_distinct' | 'confirmed_duplicate' | 'approved_for_merge' | 'merge_executed'
          justification?: string
          reviewed_at?: string
        }
        Relationships: []
      }
      patient_record_merges: {
        Row: {
          id: string
          surviving_patient_id: string
          retired_patient_id: string
          surviving_patient_identifier: string
          retired_patient_identifier: string
          authorized_by: string
          executed_by: string
          reason: string
          snapshot_before_merge: Json
          created_at: string
        }
        Insert: {
          id?: string
          surviving_patient_id: string
          retired_patient_id: string
          surviving_patient_identifier: string
          retired_patient_identifier: string
          authorized_by: string
          executed_by: string
          reason: string
          snapshot_before_merge: Json
          created_at?: string
        }
        Update: {
          id?: string
          surviving_patient_id?: string
          retired_patient_id?: string
          surviving_patient_identifier?: string
          retired_patient_identifier?: string
          authorized_by?: string
          executed_by?: string
          reason?: string
          snapshot_before_merge?: Json
          created_at?: string
        }
        Relationships: []
      }
      patient_audit_events: {
        Row: {
          id: string
          patient_id: string
          patient_identifier: string
          actor_id: string | null
          actor_role: string | null
          action: string
          facility_id: string | null
          details: Json
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          patient_identifier: string
          actor_id?: string | null
          actor_role?: string | null
          action: string
          facility_id?: string | null
          details?: Json
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          patient_identifier?: string
          actor_id?: string | null
          actor_role?: string | null
          action?: string
          facility_id?: string | null
          details?: Json
          ip_address?: string | null
          created_at?: string
        }
        Relationships: []
      }
      patient_medical_history: {
        Row: {
          id: string
          patient_id: string
          condition_name: string
          condition_code: string | null
          condition_category: ConditionCategory
          clinical_status: ConditionClinicalStatus
          onset_date: string | null
          approximate_onset_age: number | null
          is_primary_respiratory: boolean
          treatment_summary: string | null
          hospitalization_history: string | null
          notes: string | null
          data_source: HealthRecordDataSource
          verification_status: HealthRecordVerificationStatus
          verified_by: string | null
          verified_at: string | null
          recorded_by: string | null
          facility_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          condition_name: string
          condition_code?: string | null
          condition_category?: ConditionCategory
          clinical_status?: ConditionClinicalStatus
          onset_date?: string | null
          approximate_onset_age?: number | null
          is_primary_respiratory?: boolean
          treatment_summary?: string | null
          hospitalization_history?: string | null
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          condition_name?: string
          condition_code?: string | null
          condition_category?: ConditionCategory
          clinical_status?: ConditionClinicalStatus
          onset_date?: string | null
          approximate_onset_age?: number | null
          is_primary_respiratory?: boolean
          treatment_summary?: string | null
          hospitalization_history?: string | null
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_medications: {
        Row: {
          id: string
          patient_id: string
          medication_name: string
          medication_type: MedicationType
          dosage_instructions: string | null
          prescribing_source: string | null
          start_date: string | null
          end_date: string | null
          is_current: boolean
          notes: string | null
          data_source: HealthRecordDataSource
          verification_status: HealthRecordVerificationStatus
          verified_by: string | null
          verified_at: string | null
          recorded_by: string | null
          facility_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          medication_name: string
          medication_type?: MedicationType
          dosage_instructions?: string | null
          prescribing_source?: string | null
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          medication_name?: string
          medication_type?: MedicationType
          dosage_instructions?: string | null
          prescribing_source?: string | null
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_allergies: {
        Row: {
          id: string
          patient_id: string
          allergen_type: AllergenType
          allergen_name: string
          reaction_description: string | null
          severity: AllergySeverity
          is_active: boolean
          notes: string | null
          data_source: HealthRecordDataSource
          verification_status: HealthRecordVerificationStatus
          verified_by: string | null
          verified_at: string | null
          recorded_by: string | null
          facility_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          allergen_type: AllergenType
          allergen_name: string
          reaction_description?: string | null
          severity?: AllergySeverity
          is_active?: boolean
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          allergen_type?: AllergenType
          allergen_name?: string
          reaction_description?: string | null
          severity?: AllergySeverity
          is_active?: boolean
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_smoking_history: {
        Row: {
          id: string
          patient_id: string
          smoking_status: SmokingStatus
          tobacco_type: TobaccoType
          cigarettes_per_day: number | null
          bidis_per_day: number | null
          years_smoked: number | null
          age_started: number | null
          age_quit: number | null
          quit_date: string | null
          calculated_pack_years: number | null
          pack_years_calculation_method: string | null
          secondhand_smoke_exposure: boolean
          secondhand_smoke_context: SecondhandSmokeContext | null
          other_tobacco_details: string | null
          notes: string | null
          data_source: HealthRecordDataSource
          verification_status: HealthRecordVerificationStatus
          verified_by: string | null
          verified_at: string | null
          recorded_by: string | null
          facility_id: string | null
          is_current: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          smoking_status: SmokingStatus
          tobacco_type?: TobaccoType
          cigarettes_per_day?: number | null
          bidis_per_day?: number | null
          years_smoked?: number | null
          age_started?: number | null
          age_quit?: number | null
          quit_date?: string | null
          calculated_pack_years?: number | null
          pack_years_calculation_method?: string | null
          secondhand_smoke_exposure?: boolean
          secondhand_smoke_context?: SecondhandSmokeContext | null
          other_tobacco_details?: string | null
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          smoking_status?: SmokingStatus
          tobacco_type?: TobaccoType
          cigarettes_per_day?: number | null
          bidis_per_day?: number | null
          years_smoked?: number | null
          age_started?: number | null
          age_quit?: number | null
          quit_date?: string | null
          calculated_pack_years?: number | null
          pack_years_calculation_method?: string | null
          secondhand_smoke_exposure?: boolean
          secondhand_smoke_context?: SecondhandSmokeContext | null
          other_tobacco_details?: string | null
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_environmental_exposures: {
        Row: {
          id: string
          patient_id: string
          geographic_entity_id: string | null
          exposure_category: ExposureCategory
          exposure_type: string
          cooking_fuel_type: CookingFuelType | null
          duration_years: number | null
          hours_per_day: number | null
          intensity: ExposureIntensity
          is_current: boolean
          start_year: number | null
          end_year: number | null
          context_details: string | null
          notes: string | null
          data_source: HealthRecordDataSource
          verification_status: HealthRecordVerificationStatus
          verified_by: string | null
          verified_at: string | null
          recorded_by: string | null
          facility_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          geographic_entity_id?: string | null
          exposure_category: ExposureCategory
          exposure_type: string
          cooking_fuel_type?: CookingFuelType | null
          duration_years?: number | null
          hours_per_day?: number | null
          intensity?: ExposureIntensity
          is_current?: boolean
          start_year?: number | null
          end_year?: number | null
          context_details?: string | null
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          geographic_entity_id?: string | null
          exposure_category?: ExposureCategory
          exposure_type?: string
          cooking_fuel_type?: CookingFuelType | null
          duration_years?: number | null
          hours_per_day?: number | null
          intensity?: ExposureIntensity
          is_current?: boolean
          start_year?: number | null
          end_year?: number | null
          context_details?: string | null
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_family_history: {
        Row: {
          id: string
          patient_id: string
          relationship: FamilyRelationship
          condition_type: FamilyConditionType
          specific_cancer_type: string | null
          age_at_diagnosis: number | null
          notes: string | null
          data_source: HealthRecordDataSource
          verification_status: HealthRecordVerificationStatus
          verified_by: string | null
          verified_at: string | null
          recorded_by: string | null
          facility_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          relationship: FamilyRelationship
          condition_type: FamilyConditionType
          specific_cancer_type?: string | null
          age_at_diagnosis?: number | null
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          relationship?: FamilyRelationship
          condition_type?: FamilyConditionType
          specific_cancer_type?: string | null
          age_at_diagnosis?: number | null
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_lifestyle: {
        Row: {
          id: string
          patient_id: string
          physical_activity_level: PhysicalActivityLevel
          dietary_notes: string | null
          alcohol_consumption_status: AlcoholConsumptionStatus
          household_smokers_count: number | null
          notes: string | null
          data_source: HealthRecordDataSource
          verification_status: HealthRecordVerificationStatus
          verified_by: string | null
          verified_at: string | null
          recorded_by: string | null
          facility_id: string | null
          is_current: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          physical_activity_level?: PhysicalActivityLevel
          dietary_notes?: string | null
          alcohol_consumption_status?: AlcoholConsumptionStatus
          household_smokers_count?: number | null
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          physical_activity_level?: PhysicalActivityLevel
          dietary_notes?: string | null
          alcohol_consumption_status?: AlcoholConsumptionStatus
          household_smokers_count?: number | null
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_health_measurements: {
        Row: {
          id: string
          patient_id: string
          measurement_type: MeasurementType
          numeric_value: number
          unit: string
          secondary_value: number | null
          is_calculated: boolean
          calculation_formula: string | null
          measured_at: string
          measurement_context: MeasurementContext | null
          notes: string | null
          data_source: HealthRecordDataSource
          verification_status: HealthRecordVerificationStatus
          verified_by: string | null
          verified_at: string | null
          recorded_by: string | null
          facility_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          measurement_type: MeasurementType
          numeric_value: number
          unit: string
          secondary_value?: number | null
          is_calculated?: boolean
          calculation_formula?: string | null
          measured_at?: string
          measurement_context?: MeasurementContext | null
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          measurement_type?: MeasurementType
          numeric_value?: number
          unit?: string
          secondary_value?: number | null
          is_calculated?: boolean
          calculation_formula?: string | null
          measured_at?: string
          measurement_context?: MeasurementContext | null
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      patient_symptom_history: {
        Row: {
          id: string
          patient_id: string
          symptom_name: SymptomName
          is_present: boolean
          onset_date: string | null
          duration_weeks: number | null
          progression: SymptomProgression
          severity: SymptomSeverity
          clinical_observation_type: string
          is_active: boolean
          notes: string | null
          data_source: HealthRecordDataSource
          verification_status: HealthRecordVerificationStatus
          verified_by: string | null
          verified_at: string | null
          recorded_by: string | null
          facility_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          symptom_name: SymptomName
          is_present?: boolean
          onset_date?: string | null
          duration_weeks?: number | null
          progression?: SymptomProgression
          severity?: SymptomSeverity
          clinical_observation_type?: string
          is_active?: boolean
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          symptom_name?: SymptomName
          is_present?: boolean
          onset_date?: string | null
          duration_weeks?: number | null
          progression?: SymptomProgression
          severity?: SymptomSeverity
          clinical_observation_type?: string
          is_active?: boolean
          notes?: string | null
          data_source?: HealthRecordDataSource
          verification_status?: HealthRecordVerificationStatus
          verified_by?: string | null
          verified_at?: string | null
          recorded_by?: string | null
          facility_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_health_reviews: {
        Row: {
          id: string
          patient_id: string
          category_reviewed: string
          target_record_id: string | null
          reviewer_id: string
          review_decision: HealthReviewDecision
          clinical_rationale: string
          facility_id: string | null
          reviewed_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          category_reviewed: string
          target_record_id?: string | null
          reviewer_id: string
          review_decision: HealthReviewDecision
          clinical_rationale: string
          facility_id?: string | null
          reviewed_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          category_reviewed?: string
          target_record_id?: string | null
          reviewer_id?: string
          review_decision?: HealthReviewDecision
          clinical_rationale?: string
          facility_id?: string | null
          reviewed_at?: string
        }
        Relationships: []
      }
      patient_assessments: {
        Row: {
          id: string
          patient_id: string
          assessment_type: AssessmentType
          status: AssessmentStatus
          initiated_at: string
          submitted_at: string | null
          completed_at: string | null
          reviewing_clinician_id: string | null
          facility_id: string | null
          methodology_version: string | null
          summary: string
          results: Json
          limitations: string | null
          next_steps: string | null
          is_reviewed_by_clinician: boolean
          client_operation_id: string | null
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          assessment_type: AssessmentType
          status?: AssessmentStatus
          initiated_at?: string
          submitted_at?: string | null
          completed_at?: string | null
          reviewing_clinician_id?: string | null
          facility_id?: string | null
          methodology_version?: string | null
          summary: string
          results?: Json
          limitations?: string | null
          next_steps?: string | null
          is_reviewed_by_clinician?: boolean
          client_operation_id?: string | null
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          assessment_type?: AssessmentType
          status?: AssessmentStatus
          initiated_at?: string
          submitted_at?: string | null
          completed_at?: string | null
          reviewing_clinician_id?: string | null
          facility_id?: string | null
          methodology_version?: string | null
          summary?: string
          results?: Json
          limitations?: string | null
          next_steps?: string | null
          is_reviewed_by_clinician?: boolean
          client_operation_id?: string | null
          version?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_sync_operations: {
        Row: {
          id: string
          client_operation_id: string
          draft_id: string
          user_id: string | null
          patient_id: string
          assessment_type: string
          form_data: Json
          status: 'pending' | 'completed' | 'failed' | 'conflict'
          server_assessment_id: string | null
          base_version: number
          server_version: number
          conflict_details: Json | null
          resolved_by: string | null
          resolution_notes: string | null
          client_created_at: string
          client_updated_at: string
          synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_operation_id: string
          draft_id: string
          user_id?: string | null
          patient_id: string
          assessment_type: string
          form_data?: Json
          status?: 'pending' | 'completed' | 'failed' | 'conflict'
          server_assessment_id?: string | null
          base_version?: number
          server_version?: number
          conflict_details?: Json | null
          resolved_by?: string | null
          resolution_notes?: string | null
          client_created_at: string
          client_updated_at: string
          synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_operation_id?: string
          draft_id?: string
          user_id?: string | null
          patient_id?: string
          assessment_type?: string
          form_data?: Json
          status?: 'pending' | 'completed' | 'failed' | 'conflict'
          server_assessment_id?: string | null
          base_version?: number
          server_version?: number
          conflict_details?: Json | null
          resolved_by?: string | null
          resolution_notes?: string | null
          client_created_at?: string
          client_updated_at?: string
          synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      generated_reports: {
        Row: {
          id: string
          report_reference: string
          patient_id: string
          report_type:
            | 'patient_assessment'
            | 'clinical_assessment'
            | 'risk_estimation'
            | 'screening_eligibility'
            | 'symptom_triage'
            | 'referral_followup'
            | 'consolidated_history'
          title: string
          summary: string | null
          language: 'en' | 'bn'
          template_version: string
          source_assessment_id: string | null
          source_referral_id: string | null
          source_metadata: Json
          content_html: string
          file_size_bytes: number
          storage_path: string | null
          generated_by_user_id: string | null
          generated_by_role: string
          facility_id: string | null
          status: 'draft' | 'final' | 'archived' | 'revoked'
          is_patient_accessible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          report_reference: string
          patient_id: string
          report_type:
            | 'patient_assessment'
            | 'clinical_assessment'
            | 'risk_estimation'
            | 'screening_eligibility'
            | 'symptom_triage'
            | 'referral_followup'
            | 'consolidated_history'
          title: string
          summary?: string | null
          language?: 'en' | 'bn'
          template_version?: string
          source_assessment_id?: string | null
          source_referral_id?: string | null
          source_metadata?: Json
          content_html: string
          file_size_bytes?: number
          storage_path?: string | null
          generated_by_user_id?: string | null
          generated_by_role?: string
          facility_id?: string | null
          status?: 'draft' | 'final' | 'archived' | 'revoked'
          is_patient_accessible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          report_reference?: string
          patient_id?: string
          report_type?:
            | 'patient_assessment'
            | 'clinical_assessment'
            | 'risk_estimation'
            | 'screening_eligibility'
            | 'symptom_triage'
            | 'referral_followup'
            | 'consolidated_history'
          title?: string
          summary?: string | null
          language?: 'en' | 'bn'
          template_version?: string
          source_assessment_id?: string | null
          source_referral_id?: string | null
          source_metadata?: Json
          content_html?: string
          file_size_bytes?: number
          storage_path?: string | null
          generated_by_user_id?: string | null
          generated_by_role?: string
          facility_id?: string | null
          status?: 'draft' | 'final' | 'archived' | 'revoked'
          is_patient_accessible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      report_access_audit: {
        Row: {
          id: string
          report_id: string
          user_id: string | null
          user_role: string
          access_type: 'view' | 'download_pdf' | 'download_html' | 'print'
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          user_id?: string | null
          user_role?: string
          access_type: 'view' | 'download_pdf' | 'download_html' | 'print'
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          user_id?: string | null
          user_role?: string
          access_type?: 'view' | 'download_pdf' | 'download_html' | 'print'
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
      platform_telemetry_events: {
        Row: {
          id: string
          subsystem:
            | 'api'
            | 'auth'
            | 'assessments'
            | 'referrals'
            | 'notifications'
            | 'reporting'
            | 'environmental'
            | 'offline_sync'
            | 'general'
          event_type: string
          status_code: number | null
          duration_ms: number | null
          error_category:
            | 'network'
            | 'validation'
            | 'permission'
            | 'timeout'
            | 'upstream_service'
            | 'internal'
            | null
          facility_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          subsystem:
            | 'api'
            | 'auth'
            | 'assessments'
            | 'referrals'
            | 'notifications'
            | 'reporting'
            | 'environmental'
            | 'offline_sync'
            | 'general'
          event_type: string
          status_code?: number | null
          duration_ms?: number | null
          error_category?:
            | 'network'
            | 'validation'
            | 'permission'
            | 'timeout'
            | 'upstream_service'
            | 'internal'
            | null
          facility_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          subsystem?:
            | 'api'
            | 'auth'
            | 'assessments'
            | 'referrals'
            | 'notifications'
            | 'reporting'
            | 'environmental'
            | 'offline_sync'
            | 'general'
          event_type?: string
          status_code?: number | null
          duration_ms?: number | null
          error_category?:
            | 'network'
            | 'validation'
            | 'permission'
            | 'timeout'
            | 'upstream_service'
            | 'internal'
            | null
          facility_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      operational_metrics_daily: {
        Row: {
          id: string
          metric_date: string
          facility_id: string | null
          division: string | null
          metric_category:
            | 'patient'
            | 'assessment'
            | 'facility'
            | 'worker'
            | 'workflow'
            | 'referral'
            | 'environmental'
            | 'data_quality'
            | 'performance'
          metric_key: string
          metric_value: number
          dimensions: Json
          calculated_at: string
        }
        Insert: {
          id?: string
          metric_date: string
          facility_id?: string | null
          division?: string | null
          metric_category:
            | 'patient'
            | 'assessment'
            | 'facility'
            | 'worker'
            | 'workflow'
            | 'referral'
            | 'environmental'
            | 'data_quality'
            | 'performance'
          metric_key: string
          metric_value?: number
          dimensions?: Json
          calculated_at?: string
        }
        Update: {
          id?: string
          metric_date?: string
          facility_id?: string | null
          division?: string | null
          metric_category?:
            | 'patient'
            | 'assessment'
            | 'facility'
            | 'worker'
            | 'workflow'
            | 'referral'
            | 'environmental'
            | 'data_quality'
            | 'performance'
          metric_key?: string
          metric_value?: number
          dimensions?: Json
          calculated_at?: string
        }
        Relationships: []
      }
      analytics_audit_logs: {
        Row: {
          id: string
          user_id: string | null
          user_role: string
          dashboard_view:
            | 'admin_overview'
            | 'facility_operational'
            | 'clinical_workflow'
            | 'worker_activity'
            | 'export_summary'
          facility_id: string | null
          filters_applied: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_role?: string
          dashboard_view:
            | 'admin_overview'
            | 'facility_operational'
            | 'clinical_workflow'
            | 'worker_activity'
            | 'export_summary'
          facility_id?: string | null
          filters_applied?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          user_role?: string
          dashboard_view?:
            | 'admin_overview'
            | 'facility_operational'
            | 'clinical_workflow'
            | 'worker_activity'
            | 'export_summary'
          facility_id?: string | null
          filters_applied?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
      patient_referrals: {
        Row: {
          id: string
          patient_id: string
          referral_date: string
          referring_facility: string
          referring_clinician: string | null
          destination_facility: string
          reason: string
          status: ReferralStatus
          recommended_followup_date: string | null
          instructions: string | null
          contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          referral_date?: string
          referring_facility?: string
          referring_clinician?: string | null
          destination_facility: string
          reason: string
          status?: ReferralStatus
          recommended_followup_date?: string | null
          instructions?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          referral_date?: string
          referring_facility?: string
          referring_clinician?: string | null
          destination_facility?: string
          reason?: string
          status?: ReferralStatus
          recommended_followup_date?: string | null
          instructions?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_documents: {
        Row: {
          id: string
          patient_id: string
          title: string
          document_type: PatientDocumentType
          file_size_bytes: number | null
          storage_path: string | null
          is_available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          title: string
          document_type: PatientDocumentType
          file_size_bytes?: number | null
          storage_path?: string | null
          is_available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          title?: string
          document_type?: PatientDocumentType
          file_size_bytes?: number | null
          storage_path?: string | null
          is_available?: boolean
          created_at?: string
        }
        Relationships: []
      }
      patient_notifications: {
        Row: {
          id: string
          patient_id: string
          title: string
          message: string
          category: NotificationCategory
          is_read: boolean
          link_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          title: string
          message: string
          category: NotificationCategory
          is_read?: boolean
          link_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          title?: string
          message?: string
          category?: NotificationCategory
          is_read?: boolean
          link_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      patient_consents: {
        Row: {
          id: string
          patient_id: string
          consent_type: ConsentType
          is_granted: boolean
          purpose: string
          version: string
          can_withdraw: boolean
          granted_at: string
          revoked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          consent_type: ConsentType
          is_granted?: boolean
          purpose: string
          version?: string
          can_withdraw?: boolean
          granted_at?: string
          revoked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          consent_type?: ConsentType
          is_granted?: boolean
          purpose?: string
          version?: string
          can_withdraw?: boolean
          granted_at?: string
          revoked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      facility_types: {
        Row: {
          id: string
          name: string
          name_bn: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          name_bn: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_bn?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      facility_ownership_categories: {
        Row: {
          id: string
          name: string
          name_bn: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          name_bn: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_bn?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      facility_services: {
        Row: {
          id: string
          name: string
          name_bn: string
          category: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          name_bn: string
          category: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_bn?: string
          category?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      facility_groups: {
        Row: {
          id: string
          code: string
          name: string
          name_bn: string
          group_type: FacilityGroupType
          parent_group_id: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          name_bn: string
          group_type: FacilityGroupType
          parent_group_id?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          name_bn?: string
          group_type?: FacilityGroupType
          parent_group_id?: string | null
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      healthcare_facilities: {
        Row: {
          id: string
          facility_id: string
          name: string
          name_bn: string
          facility_type_id: string
          ownership_category_id: string
          status: FacilityStatus
          status_reason: string | null
          group_id: string | null
          country_code: string
          division: string
          district: string
          upazila: string
          union_municipality: string | null
          ward: string | null
          address_line: string
          latitude: number | null
          longitude: number | null
          contact_phone: string | null
          contact_email: string | null
          contact_person_name: string | null
          contact_person_role: string | null
          website_url: string | null
          verification_status: FacilityVerificationStatus
          verification_source: string | null
          verified_at: string | null
          verified_by: string | null
          verification_notes: string | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          operational_capacity: Record<string, any>
          registered_by: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          name: string
          name_bn: string
          facility_type_id: string
          ownership_category_id: string
          status?: FacilityStatus
          status_reason?: string | null
          group_id?: string | null
          country_code?: string
          division: string
          district: string
          upazila: string
          union_municipality?: string | null
          ward?: string | null
          address_line: string
          latitude?: number | null
          longitude?: number | null
          contact_phone?: string | null
          contact_email?: string | null
          contact_person_name?: string | null
          contact_person_role?: string | null
          website_url?: string | null
          verification_status?: FacilityVerificationStatus
          verification_source?: string | null
          verified_at?: string | null
          verified_by?: string | null
          verification_notes?: string | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          operational_capacity?: Record<string, any>
          registered_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          name?: string
          name_bn?: string
          facility_type_id?: string
          ownership_category_id?: string
          status?: FacilityStatus
          status_reason?: string | null
          group_id?: string | null
          country_code?: string
          division?: string
          district?: string
          upazila?: string
          union_municipality?: string | null
          ward?: string | null
          address_line?: string
          latitude?: number | null
          longitude?: number | null
          contact_phone?: string | null
          contact_email?: string | null
          contact_person_name?: string | null
          contact_person_role?: string | null
          website_url?: string | null
          verification_status?: FacilityVerificationStatus
          verification_source?: string | null
          verified_at?: string | null
          verified_by?: string | null
          verification_notes?: string | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          operational_capacity?: Record<string, any>
          registered_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      healthcare_facility_services: {
        Row: {
          id: string
          facility_id: string
          service_id: string
          availability_status: ServiceAvailabilityStatus
          is_verified: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          service_id: string
          availability_status?: ServiceAvailabilityStatus
          is_verified?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          service_id?: string
          availability_status?: ServiceAvailabilityStatus
          is_verified?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      facility_staff_memberships: {
        Row: {
          id: string
          user_id: string
          facility_id: string
          facility_role: FacilityRole
          status: StaffMembershipStatus
          is_primary: boolean
          department: string | null
          joined_at: string
          left_at: string | null
          approved_by: string | null
          approval_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          facility_id: string
          facility_role: FacilityRole
          status?: StaffMembershipStatus
          is_primary?: boolean
          department?: string | null
          joined_at?: string
          left_at?: string | null
          approved_by?: string | null
          approval_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          facility_id?: string
          facility_role?: FacilityRole
          status?: StaffMembershipStatus
          is_primary?: boolean
          department?: string | null
          joined_at?: string
          left_at?: string | null
          approved_by?: string | null
          approval_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      facility_status_history: {
        Row: {
          id: string
          facility_id: string
          from_status: string
          to_status: string
          reason: string | null
          changed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          from_status: string
          to_status: string
          reason?: string | null
          changed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          from_status?: string
          to_status?: string
          reason?: string | null
          changed_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      facility_audit_events: {
        Row: {
          id: string
          facility_id: string
          event_type: string
          actor_id: string | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          details: Record<string, any>
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          event_type: string
          actor_id?: string | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          details?: Record<string, any>
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          event_type?: string
          actor_id?: string | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          details?: Record<string, any>
          ip_address?: string | null
          created_at?: string
        }
        Relationships: []
      }
      worker_workspace_preferences: {
        Row: {
          user_id: string
          active_facility_id: string
          dashboard_view: 'standard' | 'compact' | 'field_triage'
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          active_facility_id?: string
          dashboard_view?: 'standard' | 'compact' | 'field_triage'
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          active_facility_id?: string
          dashboard_view?: 'standard' | 'compact' | 'field_triage'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      worker_patient_assignments: {
        Row: {
          id: string
          worker_id: string
          patient_id: string
          facility_id: string
          assignment_role: 'primary_chw' | 'case_worker' | 'intake_specialist' | 'care_coordinator'
          status: 'active' | 'inactive' | 'transferred' | 'completed'
          notes: string | null
          assigned_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          patient_id: string
          facility_id: string
          assignment_role?: 'primary_chw' | 'case_worker' | 'intake_specialist' | 'care_coordinator'
          status?: 'active' | 'inactive' | 'transferred' | 'completed'
          notes?: string | null
          assigned_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          worker_id?: string
          patient_id?: string
          facility_id?: string
          assignment_role?: 'primary_chw' | 'case_worker' | 'intake_specialist' | 'care_coordinator'
          status?: 'active' | 'inactive' | 'transferred' | 'completed'
          notes?: string | null
          assigned_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_completion_status: {
        Row: {
          patient_id: string
          completion_score: number
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          missing_sections: any
          status: 'incomplete' | 'partially_complete' | 'complete'
          last_calculated_at: string
          evaluated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          patient_id: string
          completion_score?: number
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          missing_sections?: any
          status?: 'incomplete' | 'partially_complete' | 'complete'
          last_calculated_at?: string
          evaluated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          patient_id?: string
          completion_score?: number
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          missing_sections?: any
          status?: 'incomplete' | 'partially_complete' | 'complete'
          last_calculated_at?: string
          evaluated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      worker_operational_tasks: {
        Row: {
          id: string
          worker_id: string
          patient_id: string | null
          facility_id: string
          task_type: 'intake_completion' | 'assessment_initiation' | 'measurement_recording' | 'contact_verification' | 'followup_call'
          priority: 'urgent' | 'high' | 'normal' | 'low'
          status: 'pending' | 'in_progress' | 'completed' | 'dismissed'
          title: string
          title_bn: string | null
          description: string | null
          due_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          patient_id?: string | null
          facility_id: string
          task_type: 'intake_completion' | 'assessment_initiation' | 'measurement_recording' | 'contact_verification' | 'followup_call'
          priority?: 'urgent' | 'high' | 'normal' | 'low'
          status?: 'pending' | 'in_progress' | 'completed' | 'dismissed'
          title: string
          title_bn?: string | null
          description?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          worker_id?: string
          patient_id?: string | null
          facility_id?: string
          task_type?: 'intake_completion' | 'assessment_initiation' | 'measurement_recording' | 'contact_verification' | 'followup_call'
          priority?: 'urgent' | 'high' | 'normal' | 'low'
          status?: 'pending' | 'in_progress' | 'completed' | 'dismissed'
          title?: string
          title_bn?: string | null
          description?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      worker_recent_activities: {
        Row: {
          id: string
          worker_id: string
          facility_id: string
          patient_id: string | null
          activity_type: 'patient_registered' | 'health_record_updated' | 'assessment_initiated' | 'task_completed' | 'patient_viewed'
          summary: string
          summary_bn: string | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          metadata: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          facility_id: string
          patient_id?: string | null
          activity_type: 'patient_registered' | 'health_record_updated' | 'assessment_initiated' | 'task_completed' | 'patient_viewed'
          summary: string
          summary_bn?: string | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          metadata?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          worker_id?: string
          facility_id?: string
          patient_id?: string | null
          activity_type?: 'patient_registered' | 'health_record_updated' | 'assessment_initiated' | 'task_completed' | 'patient_viewed'
          summary?: string
          summary_bn?: string | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          metadata?: Record<string, any>
          created_at?: string
        }
        Relationships: []
      }
      clinical_reviews: {
        Row: {
          id: string
          patient_id: string
          facility_id: string
          clinician_id: string
          assessment_id: string | null
          review_status: ClinicalReviewStatus
          review_type: ClinicalReviewType
          summary: string
          missing_information_notes: string | null
          conflicting_information_notes: string | null
          verified_information_notes: string | null
          requested_information: string | null
          closed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          facility_id: string
          clinician_id: string
          assessment_id?: string | null
          review_status?: ClinicalReviewStatus
          review_type?: ClinicalReviewType
          summary: string
          missing_information_notes?: string | null
          conflicting_information_notes?: string | null
          verified_information_notes?: string | null
          requested_information?: string | null
          closed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          facility_id?: string
          clinician_id?: string
          assessment_id?: string | null
          review_status?: ClinicalReviewStatus
          review_type?: ClinicalReviewType
          summary?: string
          missing_information_notes?: string | null
          conflicting_information_notes?: string | null
          verified_information_notes?: string | null
          requested_information?: string | null
          closed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinical_observations: {
        Row: {
          id: string
          clinical_review_id: string
          patient_id: string
          clinician_id: string
          category: ClinicalObservationCategory
          observation_text: string
          clinical_interpretation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          clinical_review_id: string
          patient_id: string
          clinician_id: string
          category: ClinicalObservationCategory
          observation_text: string
          clinical_interpretation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          clinical_review_id?: string
          patient_id?: string
          clinician_id?: string
          category?: ClinicalObservationCategory
          observation_text?: string
          clinical_interpretation?: string | null
          created_at?: string
        }
        Relationships: []
      }
      clinical_decisions: {
        Row: {
          id: string
          clinical_review_id: string
          patient_id: string
          clinician_id: string
          decision_type: ClinicalDecisionType
          rationale: string
          disagreement_with_automated_output: boolean
          disagreement_reason: string | null
          recommended_next_steps: string
          referral_target: string | null
          status: ClinicalDecisionStatus
          finalized_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinical_review_id: string
          patient_id: string
          clinician_id: string
          decision_type: ClinicalDecisionType
          rationale: string
          disagreement_with_automated_output?: boolean
          disagreement_reason?: string | null
          recommended_next_steps: string
          referral_target?: string | null
          status?: ClinicalDecisionStatus
          finalized_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinical_review_id?: string
          patient_id?: string
          clinician_id?: string
          decision_type?: ClinicalDecisionType
          rationale?: string
          disagreement_with_automated_output?: boolean
          disagreement_reason?: string | null
          recommended_next_steps?: string
          referral_target?: string | null
          status?: ClinicalDecisionStatus
          finalized_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinical_decision_amendments: {
        Row: {
          id: string
          clinical_decision_id: string
          clinician_id: string
          amendment_reason: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          previous_content: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          amended_content: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          clinical_decision_id: string
          clinician_id: string
          amendment_reason: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          previous_content: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          amended_content: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          clinical_decision_id?: string
          clinician_id?: string
          amendment_reason?: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          previous_content?: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          amended_content?: Record<string, any>
          created_at?: string
        }
        Relationships: []
      }
      clinical_alerts: {
        Row: {
          id: string
          patient_id: string
          facility_id: string
          assessment_id: string | null
          alert_type: ClinicalAlertType
          severity: ClinicalAlertSeverity
          title: string
          title_bn: string | null
          description: string
          description_bn: string | null
          source: string
          status: ClinicalAlertStatus
          acknowledged_by: string | null
          acknowledged_at: string | null
          resolution_notes: string | null
          resolved_by: string | null
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          facility_id: string
          assessment_id?: string | null
          alert_type: ClinicalAlertType
          severity?: ClinicalAlertSeverity
          title: string
          title_bn?: string | null
          description: string
          description_bn?: string | null
          source: string
          status?: ClinicalAlertStatus
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          resolution_notes?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          facility_id?: string
          assessment_id?: string | null
          alert_type?: ClinicalAlertType
          severity?: ClinicalAlertSeverity
          title?: string
          title_bn?: string | null
          description?: string
          description_bn?: string | null
          source?: string
          status?: ClinicalAlertStatus
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          resolution_notes?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      clinical_follow_up_plans: {
        Row: {
          id: string
          patient_id: string
          facility_id: string
          clinician_id: string
          clinical_review_id: string | null
          instructions: string
          recommended_review_date: string
          status: ClinicalFollowUpStatus
          notes: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          facility_id: string
          clinician_id: string
          clinical_review_id?: string | null
          instructions: string
          recommended_review_date: string
          status?: ClinicalFollowUpStatus
          notes?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          facility_id?: string
          clinician_id?: string
          clinical_review_id?: string | null
          instructions?: string
          recommended_review_date?: string
          status?: ClinicalFollowUpStatus
          notes?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinical_activities: {
        Row: {
          id: string
          clinician_id: string
          patient_id: string | null
          facility_id: string
          activity_type: ClinicalActivityType
          summary: string
          summary_bn: string | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          metadata: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          clinician_id: string
          patient_id?: string | null
          facility_id: string
          activity_type: ClinicalActivityType
          summary: string
          summary_bn?: string | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          metadata?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          clinician_id?: string
          patient_id?: string | null
          facility_id?: string
          activity_type?: ClinicalActivityType
          summary?: string
          summary_bn?: string | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          metadata?: Record<string, any> | null
          created_at?: string
        }
        Relationships: []
      }
      risk_methodologies: {
        Row: {
          id: string
          name: string
          code: string
          authoritative_source: string
          publication_reference: string | null
          intended_population: string
          calculation_type: RiskCalculationType
          output_definition: string
          time_horizon_years: number | null
          lifecycle_status: MethodologyLifecycleStatus
          approval_authority: string | null
          approved_for_bangladesh: boolean
          approved_at: string | null
          review_date: string | null
          known_limitations: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          code: string
          authoritative_source: string
          publication_reference?: string | null
          intended_population: string
          calculation_type: RiskCalculationType
          output_definition: string
          time_horizon_years?: number | null
          lifecycle_status?: MethodologyLifecycleStatus
          approval_authority?: string | null
          approved_for_bangladesh?: boolean
          approved_at?: string | null
          review_date?: string | null
          known_limitations: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          authoritative_source?: string
          publication_reference?: string | null
          intended_population?: string
          calculation_type?: RiskCalculationType
          output_definition?: string
          time_horizon_years?: number | null
          lifecycle_status?: MethodologyLifecycleStatus
          approval_authority?: string | null
          approved_for_bangladesh?: boolean
          approved_at?: string | null
          review_date?: string | null
          known_limitations?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      risk_methodology_versions: {
        Row: {
          id: string
          methodology_id: string
          version_tag: string
          specification_reference: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          parameters: Record<string, any>
          lifecycle_status: MethodologyLifecycleStatus
          effective_date: string
          changelog: string | null
          created_at: string
        }
        Insert: {
          id?: string
          methodology_id: string
          version_tag: string
          specification_reference: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          parameters?: Record<string, any>
          lifecycle_status?: MethodologyLifecycleStatus
          effective_date?: string
          changelog?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          methodology_id?: string
          version_tag?: string
          specification_reference?: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          parameters?: Record<string, any>
          lifecycle_status?: MethodologyLifecycleStatus
          effective_date?: string
          changelog?: string | null
          created_at?: string
        }
        Relationships: []
      }
      risk_estimation_records: {
        Row: {
          id: string
          assessment_id: string | null
          patient_id: string
          facility_id: string
          methodology_id: string
          methodology_version: string
          execution_mode: RiskExecutionMode
          execution_status: RiskExecutionStatus
          estimated_risk_percentage: number | null
          risk_category: string | null
          time_horizon_years: number | null
          is_clinically_approved: boolean
          is_research_execution: boolean
          has_missing_required_inputs: boolean
          missing_inputs_list: string[] | null
          inconsistent_inputs_list: string[] | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          uncertainty_range: Record<string, any> | null
          clinical_disclaimer: string
          executed_by: string | null
          executed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id?: string | null
          patient_id: string
          facility_id?: string
          methodology_id: string
          methodology_version: string
          execution_mode?: RiskExecutionMode
          execution_status?: RiskExecutionStatus
          estimated_risk_percentage?: number | null
          risk_category?: string | null
          time_horizon_years?: number | null
          is_clinically_approved?: boolean
          is_research_execution?: boolean
          has_missing_required_inputs?: boolean
          missing_inputs_list?: string[] | null
          inconsistent_inputs_list?: string[] | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          uncertainty_range?: Record<string, any> | null
          clinical_disclaimer: string
          executed_by?: string | null
          executed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string | null
          patient_id?: string
          facility_id?: string
          methodology_id?: string
          methodology_version?: string
          execution_mode?: RiskExecutionMode
          execution_status?: RiskExecutionStatus
          estimated_risk_percentage?: number | null
          risk_category?: string | null
          time_horizon_years?: number | null
          is_clinically_approved?: boolean
          is_research_execution?: boolean
          has_missing_required_inputs?: boolean
          missing_inputs_list?: string[] | null
          inconsistent_inputs_list?: string[] | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          uncertainty_range?: Record<string, any> | null
          clinical_disclaimer?: string
          executed_by?: string | null
          executed_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      risk_assessment_input_snapshots: {
        Row: {
          id: string
          risk_record_id: string
          patient_id: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          demographics_snapshot: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          smoking_snapshot: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          medical_snapshot: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          exposure_snapshot: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          derived_variables: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          input_provenance: Record<string, any>
          snapshot_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          risk_record_id: string
          patient_id: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          demographics_snapshot?: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          smoking_snapshot?: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          medical_snapshot?: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          exposure_snapshot?: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          derived_variables?: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          input_provenance?: Record<string, any>
          snapshot_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          risk_record_id?: string
          patient_id?: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          demographics_snapshot?: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          smoking_snapshot?: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          medical_snapshot?: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          exposure_snapshot?: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          derived_variables?: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          input_provenance?: Record<string, any>
          snapshot_hash?: string
          created_at?: string
        }
        Relationships: []
      }
      risk_assessment_explanations: {
        Row: {
          id: string
          risk_record_id: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          contributing_factors: any[]
          missing_factors_impact: string | null
          assumptions_applied: string[] | null
          interpretation_summary: string
          limitations: string
          what_this_means: string
          what_this_does_not_mean: string
          created_at: string
        }
        Insert: {
          id?: string
          risk_record_id: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          contributing_factors?: any[]
          missing_factors_impact?: string | null
          assumptions_applied?: string[] | null
          interpretation_summary: string
          limitations: string
          what_this_means: string
          what_this_does_not_mean: string
          created_at?: string
        }
        Update: {
          id?: string
          risk_record_id?: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          contributing_factors?: any[]
          missing_factors_impact?: string | null
          assumptions_applied?: string[] | null
          interpretation_summary?: string
          limitations?: string
          what_this_means?: string
          what_this_does_not_mean?: string
          created_at?: string
        }
        Relationships: []
      }
      experimental_model_registry: {
        Row: {
          id: string
          model_name: string
          dataset_provenance: string
          dataset_limitations: string
          model_architecture: string
          training_date: string | null
          is_experimental_only: boolean
          can_influence_clinical_pipeline: boolean
          audit_notes: string | null
          created_at: string
        }
        Insert: {
          id: string
          model_name: string
          dataset_provenance: string
          dataset_limitations: string
          model_architecture: string
          training_date?: string | null
          is_experimental_only?: boolean
          can_influence_clinical_pipeline?: boolean
          audit_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          model_name?: string
          dataset_provenance?: string
          dataset_limitations?: string
          model_architecture?: string
          training_date?: string | null
          is_experimental_only?: boolean
          can_influence_clinical_pipeline?: boolean
          audit_notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      screening_guidelines: {
        Row: {
          id: string
          guideline_code: string
          name: string
          issuing_organization: string
          official_source_url: string | null
          publication_reference: string | null
          jurisdiction: string
          intended_population: string
          publication_date: string
          last_updated_date: string | null
          screening_interval_months: number
          recommended_modality: string
          lifecycle_status: MethodologyLifecycleStatus
          approval_authority: string | null
          approved_for_bangladesh: boolean
          approved_at: string | null
          review_date: string | null
          known_limitations: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          guideline_code: string
          name: string
          issuing_organization: string
          official_source_url?: string | null
          publication_reference?: string | null
          jurisdiction?: string
          intended_population: string
          publication_date: string
          last_updated_date?: string | null
          screening_interval_months?: number
          recommended_modality?: string
          lifecycle_status?: MethodologyLifecycleStatus
          approval_authority?: string | null
          approved_for_bangladesh?: boolean
          approved_at?: string | null
          review_date?: string | null
          known_limitations: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          guideline_code?: string
          name?: string
          issuing_organization?: string
          official_source_url?: string | null
          publication_reference?: string | null
          jurisdiction?: string
          intended_population?: string
          publication_date?: string
          last_updated_date?: string | null
          screening_interval_months?: number
          recommended_modality?: string
          lifecycle_status?: MethodologyLifecycleStatus
          approval_authority?: string | null
          approved_for_bangladesh?: boolean
          approved_at?: string | null
          review_date?: string | null
          known_limitations?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      screening_guideline_versions: {
        Row: {
          id: string
          guideline_id: string
          version_tag: string
          specification_reference: string
          min_age: number
          max_age: number
          min_pack_years: number
          max_quit_years: number | null
          requires_asymptomatic: boolean
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          exclusions: any[]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          criteria_definitions: any[]
          lifecycle_status: MethodologyLifecycleStatus
          effective_date: string
          changelog: string | null
          created_at: string
        }
        Insert: {
          id?: string
          guideline_id: string
          version_tag: string
          specification_reference: string
          min_age?: number
          max_age?: number
          min_pack_years?: number
          max_quit_years?: number | null
          requires_asymptomatic?: boolean
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          exclusions?: any[]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          criteria_definitions?: any[]
          lifecycle_status?: MethodologyLifecycleStatus
          effective_date: string
          changelog?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          guideline_id?: string
          version_tag?: string
          specification_reference?: string
          min_age?: number
          max_age?: number
          min_pack_years?: number
          max_quit_years?: number | null
          requires_asymptomatic?: boolean
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          exclusions?: any[]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          criteria_definitions?: any[]
          lifecycle_status?: MethodologyLifecycleStatus
          effective_date?: string
          changelog?: string | null
          created_at?: string
        }
        Relationships: []
      }
      screening_eligibility_records: {
        Row: {
          id: string
          assessment_id: string | null
          patient_id: string
          patient_canonical_id: string
          patient_name: string
          facility_id: string
          guideline_id: string
          guideline_code: string
          guideline_name: string
          guideline_version: string
          execution_mode: RiskExecutionMode
          execution_status: ScreeningExecutionStatus
          eligibility_outcome: ScreeningEligibilityOutcome
          is_clinically_approved: boolean
          is_research_execution: boolean
          has_missing_required_inputs: boolean
          missing_inputs_list: string[]
          inconsistent_inputs_list: string[]
          recommended_interval_months: number | null
          recommended_modality: string | null
          next_recommended_screening_date: string | null
          governance_notice: string
          clinical_summary: string
          input_snapshot_hash: string
          executed_by: string | null
          executed_by_name: string | null
          executed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id?: string | null
          patient_id: string
          patient_canonical_id: string
          patient_name: string
          facility_id: string
          guideline_id: string
          guideline_code: string
          guideline_name: string
          guideline_version: string
          execution_mode?: RiskExecutionMode
          execution_status: ScreeningExecutionStatus
          eligibility_outcome: ScreeningEligibilityOutcome
          is_clinically_approved?: boolean
          is_research_execution?: boolean
          has_missing_required_inputs?: boolean
          missing_inputs_list?: string[]
          inconsistent_inputs_list?: string[]
          recommended_interval_months?: number | null
          recommended_modality?: string | null
          next_recommended_screening_date?: string | null
          governance_notice: string
          clinical_summary: string
          input_snapshot_hash: string
          executed_by?: string | null
          executed_by_name?: string | null
          executed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string | null
          patient_id?: string
          patient_canonical_id?: string
          patient_name?: string
          facility_id?: string
          guideline_id?: string
          guideline_code?: string
          guideline_name?: string
          guideline_version?: string
          execution_mode?: RiskExecutionMode
          execution_status?: ScreeningExecutionStatus
          eligibility_outcome?: ScreeningEligibilityOutcome
          is_clinically_approved?: boolean
          is_research_execution?: boolean
          has_missing_required_inputs?: boolean
          missing_inputs_list?: string[]
          inconsistent_inputs_list?: string[]
          recommended_interval_months?: number | null
          recommended_modality?: string | null
          next_recommended_screening_date?: string | null
          governance_notice?: string
          clinical_summary?: string
          input_snapshot_hash?: string
          executed_by?: string | null
          executed_by_name?: string | null
          executed_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      screening_input_snapshots: {
        Row: {
          id: string
          record_id: string
          patient_id: string
          snapshot_hash: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          raw_inputs: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          derived_variables: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          provenance_map: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          validation_issues: any[]
          created_at: string
        }
        Insert: {
          id?: string
          record_id: string
          patient_id: string
          snapshot_hash: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          raw_inputs: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          derived_variables: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          provenance_map: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          validation_issues?: any[]
          created_at?: string
        }
        Update: {
          id?: string
          record_id?: string
          patient_id?: string
          snapshot_hash?: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          raw_inputs?: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          derived_variables?: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          provenance_map?: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          validation_issues?: any[]
          created_at?: string
        }
        Relationships: []
      }
      screening_criterion_evaluations: {
        Row: {
          id: string
          record_id: string
          criterion_key: string
          criterion_label: string
          criterion_rule_description: string
          required_value_expression: string
          patient_actual_value: string
          status: CriterionEvaluationStatus
          is_blocking_exclusion: boolean
          clinical_explanation: string
          created_at: string
        }
        Insert: {
          id?: string
          record_id: string
          criterion_key: string
          criterion_label: string
          criterion_rule_description: string
          required_value_expression: string
          patient_actual_value: string
          status: CriterionEvaluationStatus
          is_blocking_exclusion?: boolean
          clinical_explanation: string
          created_at?: string
        }
        Update: {
          id?: string
          record_id?: string
          criterion_key?: string
          criterion_label?: string
          criterion_rule_description?: string
          required_value_expression?: string
          patient_actual_value?: string
          status?: CriterionEvaluationStatus
          is_blocking_exclusion?: boolean
          clinical_explanation?: string
          created_at?: string
        }
        Relationships: []
      }
      symptom_triage_protocols: {
        Row: {
          id: string
          protocol_code: string
          name: string
          issuing_organization: string
          official_source_url: string | null
          publication_reference: string
          jurisdiction: string
          intended_population: string
          publication_date: string
          last_updated_date: string
          lifecycle_status: MethodologyLifecycleStatus
          approval_authority: string
          approved_for_bangladesh: boolean
          approved_at: string | null
          review_date: string | null
          known_limitations: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          protocol_code: string
          name: string
          issuing_organization: string
          official_source_url?: string | null
          publication_reference: string
          jurisdiction: string
          intended_population: string
          publication_date: string
          last_updated_date: string
          lifecycle_status?: MethodologyLifecycleStatus
          approval_authority: string
          approved_for_bangladesh?: boolean
          approved_at?: string | null
          review_date?: string | null
          known_limitations: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          protocol_code?: string
          name?: string
          issuing_organization?: string
          official_source_url?: string | null
          publication_reference?: string
          jurisdiction?: string
          intended_population?: string
          publication_date?: string
          last_updated_date?: string
          lifecycle_status?: MethodologyLifecycleStatus
          approval_authority?: string
          approved_for_bangladesh?: boolean
          approved_at?: string | null
          review_date?: string | null
          known_limitations?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      symptom_triage_protocol_versions: {
        Row: {
          id: string
          protocol_id: string
          version_tag: string
          specification_reference: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          emergency_criteria: any[]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          urgent_criteria: any[]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          prompt_criteria: any[]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          routine_criteria: any[]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          contextual_rules: any[]
          lifecycle_status: MethodologyLifecycleStatus
          effective_date: string
          changelog: string
          created_at: string
        }
        Insert: {
          id?: string
          protocol_id: string
          version_tag: string
          specification_reference: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          emergency_criteria?: any[]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          urgent_criteria?: any[]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          prompt_criteria?: any[]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          routine_criteria?: any[]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          contextual_rules?: any[]
          lifecycle_status?: MethodologyLifecycleStatus
          effective_date: string
          changelog: string
          created_at?: string
        }
        Update: {
          id?: string
          protocol_id?: string
          version_tag?: string
          specification_reference?: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          emergency_criteria?: any[]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          urgent_criteria?: any[]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          prompt_criteria?: any[]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          routine_criteria?: any[]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          contextual_rules?: any[]
          lifecycle_status?: MethodologyLifecycleStatus
          effective_date?: string
          changelog?: string
          created_at?: string
        }
        Relationships: []
      }
      symptom_assessment_records: {
        Row: {
          id: string
          patient_id: string
          facility_id: string | null
          assessment_id: string | null
          provenance: SymptomDataProvenance
          collected_by: string | null
          is_complete: boolean
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          symptoms_payload: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          clinical_context: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          facility_id?: string | null
          assessment_id?: string | null
          provenance?: SymptomDataProvenance
          collected_by?: string | null
          is_complete?: boolean
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          symptoms_payload?: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          clinical_context?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          facility_id?: string | null
          assessment_id?: string | null
          provenance?: SymptomDataProvenance
          collected_by?: string | null
          is_complete?: boolean
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          symptoms_payload?: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          clinical_context?: Record<string, any>
          created_at?: string
        }
        Relationships: []
      }
      symptom_input_snapshots: {
        Row: {
          id: string
          symptom_assessment_id: string
          snapshot_hash: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          canonical_payload: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          derived_variables: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          symptom_assessment_id: string
          snapshot_hash: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          canonical_payload: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          derived_variables: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          symptom_assessment_id?: string
          snapshot_hash?: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          canonical_payload?: Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          derived_variables?: Record<string, any>
          created_at?: string
        }
        Relationships: []
      }
      symptom_triage_determinations: {
        Row: {
          id: string
          patient_id: string
          facility_id: string | null
          symptom_assessment_id: string
          protocol_id: string
          protocol_version_id: string
          evaluated_by: string | null
          execution_mode: string
          execution_status: TriageExecutionStatus
          urgency_level: TriageUrgencyLevel
          recommended_escalation_pathway: string | null
          recommended_timeframe_days: number | null
          clinical_alert_id: string | null
          governance_notice: string | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          clinical_explanation: Record<string, any>
          disclaimers: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          facility_id?: string | null
          symptom_assessment_id: string
          protocol_id: string
          protocol_version_id: string
          evaluated_by?: string | null
          execution_mode?: string
          execution_status: TriageExecutionStatus
          urgency_level: TriageUrgencyLevel
          recommended_escalation_pathway?: string | null
          recommended_timeframe_days?: number | null
          clinical_alert_id?: string | null
          governance_notice?: string | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          clinical_explanation?: Record<string, any>
          disclaimers: string
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          facility_id?: string | null
          symptom_assessment_id?: string
          protocol_id?: string
          protocol_version_id?: string
          evaluated_by?: string | null
          execution_mode?: string
          execution_status?: TriageExecutionStatus
          urgency_level?: TriageUrgencyLevel
          recommended_escalation_pathway?: string | null
          recommended_timeframe_days?: number | null
          clinical_alert_id?: string | null
          governance_notice?: string | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          clinical_explanation?: Record<string, any>
          disclaimers?: string
          created_at?: string
        }
        Relationships: []
      }
      symptom_criterion_evaluations: {
        Row: {
          id: string
          determination_id: string
          criterion_key: string
          criterion_label: string
          criterion_rule_description: string
          patient_actual_value: string
          status: TriageCriterionStatus
          is_red_flag: boolean
          clinical_explanation: string
          created_at: string
        }
        Insert: {
          id?: string
          determination_id: string
          criterion_key: string
          criterion_label: string
          criterion_rule_description: string
          patient_actual_value: string
          status: TriageCriterionStatus
          is_red_flag?: boolean
          clinical_explanation: string
          created_at?: string
        }
        Update: {
          id?: string
          determination_id?: string
          criterion_key?: string
          criterion_label?: string
          criterion_rule_description?: string
          patient_actual_value?: string
          status?: TriageCriterionStatus
          is_red_flag?: boolean
          clinical_explanation?: string
          created_at?: string
        }
        Relationships: []
      }
      symptom_escalation_records: {
        Row: {
          id: string
          determination_id: string
          patient_id: string
          facility_id: string
          clinical_alert_id: string | null
          urgency_level: TriageUrgencyLevel
          escalation_reason: string
          escalated_by: string | null
          assigned_to_role: string
          assigned_clinician_id: string | null
          status: EscalationStatus
          acknowledged_by: string | null
          acknowledged_at: string | null
          action_documented_at: string | null
          action_notes: string | null
          resolved_by: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          determination_id: string
          patient_id: string
          facility_id: string
          clinical_alert_id?: string | null
          urgency_level: TriageUrgencyLevel
          escalation_reason: string
          escalated_by?: string | null
          assigned_to_role?: string
          assigned_clinician_id?: string | null
          status?: EscalationStatus
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          action_documented_at?: string | null
          action_notes?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          determination_id?: string
          patient_id?: string
          facility_id?: string
          clinical_alert_id?: string | null
          urgency_level?: TriageUrgencyLevel
          escalation_reason?: string
          escalated_by?: string | null
          assigned_to_role?: string
          assigned_clinician_id?: string | null
          status?: EscalationStatus
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          action_documented_at?: string | null
          action_notes?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      geographic_entities: {
        Row: {
          id: string
          country_code: string
          administrative_level: GeographicAdministrativeLevel
          name: string
          name_bn: string | null
          code: string
          parent_id: string | null
          centroid_latitude: number | null
          centroid_longitude: number | null
          is_active: boolean
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          country_code?: string
          administrative_level: GeographicAdministrativeLevel
          name: string
          name_bn?: string | null
          code: string
          parent_id?: string | null
          centroid_latitude?: number | null
          centroid_longitude?: number | null
          is_active?: boolean
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          country_code?: string
          administrative_level?: GeographicAdministrativeLevel
          name?: string
          name_bn?: string | null
          code?: string
          parent_id?: string | null
          centroid_latitude?: number | null
          centroid_longitude?: number | null
          is_active?: boolean
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_geographic_histories: {
        Row: {
          id: string
          patient_id: string
          geographic_entity_id: string | null
          country_code: string
          division: string
          district: string
          upazila: string | null
          union_or_ward: string | null
          address_line: string | null
          duration_years: number | null
          verification_status: LocationVerificationStatus
          valid_from: string
          valid_to: string | null
          is_current: boolean
          recorded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          geographic_entity_id?: string | null
          country_code?: string
          division: string
          district: string
          upazila?: string | null
          union_or_ward?: string | null
          address_line?: string | null
          duration_years?: number | null
          verification_status?: LocationVerificationStatus
          valid_from?: string
          valid_to?: string | null
          is_current?: boolean
          recorded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          geographic_entity_id?: string | null
          country_code?: string
          division?: string
          district?: string
          upazila?: string | null
          union_or_ward?: string | null
          address_line?: string | null
          duration_years?: number | null
          verification_status?: LocationVerificationStatus
          valid_from?: string
          valid_to?: string | null
          is_current?: boolean
          recorded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      environmental_data_sources: {
        Row: {
          id: string
          source_code: string
          name: string
          provider_type: string
          official_url: string | null
          coverage_jurisdiction: string
          update_frequency_minutes: number
          reliability_tier: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source_code: string
          name: string
          provider_type?: string
          official_url?: string | null
          coverage_jurisdiction?: string
          update_frequency_minutes?: number
          reliability_tier?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          source_code?: string
          name?: string
          provider_type?: string
          official_url?: string | null
          coverage_jurisdiction?: string
          update_frequency_minutes?: number
          reliability_tier?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      environmental_readings: {
        Row: {
          id: string
          source_id: string
          geographic_entity_id: string | null
          parameter: EnvironmentalParameterType
          value: number
          unit: string
          reading_status: EnvironmentalDataStatus
          observation_timestamp: string
          retrieval_timestamp: string
          confidence_score: number | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          provenance_metadata: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          source_id: string
          geographic_entity_id?: string | null
          parameter: EnvironmentalParameterType
          value: number
          unit: string
          reading_status?: EnvironmentalDataStatus
          observation_timestamp: string
          retrieval_timestamp?: string
          confidence_score?: number | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          provenance_metadata?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          source_id?: string
          geographic_entity_id?: string | null
          parameter?: EnvironmentalParameterType
          value?: number
          unit?: string
          reading_status?: EnvironmentalDataStatus
          observation_timestamp?: string
          retrieval_timestamp?: string
          confidence_score?: number | null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          provenance_metadata?: Record<string, any>
          created_at?: string
        }
        Relationships: []
      }
      clinical_governance_bodies: {
        Row: {
          id: string
          name: string
          jurisdiction: string
          charter_summary: string
          established_at: string
          status: 'active' | 'inactive' | 'dissolved'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          jurisdiction?: string
          charter_summary: string
          established_at?: string
          status?: 'active' | 'inactive' | 'dissolved'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          jurisdiction?: string
          charter_summary?: string
          established_at?: string
          status?: 'active' | 'inactive' | 'dissolved'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinical_governance_members: {
        Row: {
          id: string
          body_id: string
          user_id: string | null
          full_name: string
          role: 'chair' | 'vice_chair' | 'clinical_reviewer' | 'methodology_author' | 'biostatistician' | 'secretary' | 'observer'
          specialization: string
          medical_registration_number: string | null
          credentials_verified: boolean
          verified_by: string | null
          verified_at: string | null
          institutional_affiliation: string
          term_start_date: string
          term_end_date: string | null
          conflict_of_interest_declaration: string | null
          has_active_conflict: boolean
          status: 'active' | 'on_leave' | 'emeritus' | 'resigned' | 'terminated'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          body_id: string
          user_id?: string | null
          full_name: string
          role: 'chair' | 'vice_chair' | 'clinical_reviewer' | 'methodology_author' | 'biostatistician' | 'secretary' | 'observer'
          specialization: string
          medical_registration_number?: string | null
          credentials_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          institutional_affiliation: string
          term_start_date: string
          term_end_date?: string | null
          conflict_of_interest_declaration?: string | null
          has_active_conflict?: boolean
          status?: 'active' | 'on_leave' | 'emeritus' | 'resigned' | 'terminated'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          body_id?: string
          user_id?: string | null
          full_name?: string
          role?: 'chair' | 'vice_chair' | 'clinical_reviewer' | 'methodology_author' | 'biostatistician' | 'secretary' | 'observer'
          specialization?: string
          medical_registration_number?: string | null
          credentials_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          institutional_affiliation?: string
          term_start_date?: string
          term_end_date?: string | null
          conflict_of_interest_declaration?: string | null
          has_active_conflict?: boolean
          status?: 'active' | 'on_leave' | 'emeritus' | 'resigned' | 'terminated'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      governance_meetings: {
        Row: {
          id: string
          body_id: string
          meeting_number: string
          title: string
          scheduled_at: string
          held_at: string | null
          chair_id: string | null
          quorum_present: boolean
          agenda: string
          minutes: string | null
          resolutions: string | null
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          attendees: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          body_id: string
          meeting_number: string
          title: string
          scheduled_at: string
          held_at?: string | null
          chair_id?: string | null
          quorum_present?: boolean
          agenda: string
          minutes?: string | null
          resolutions?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          attendees?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          body_id?: string
          meeting_number?: string
          title?: string
          scheduled_at?: string
          held_at?: string | null
          chair_id?: string | null
          quorum_present?: boolean
          agenda?: string
          minutes?: string | null
          resolutions?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          attendees?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinical_methodologies: {
        Row: {
          id: string
          code: string
          type: 'risk_prediction' | 'screening_eligibility' | 'symptom_triage' | 'combined_protocol'
          name: string
          description: string
          issuing_organization: string
          primary_reference: string
          target_population: string
          clinical_limitations: string
          evidence_grade: 'Level 1a' | 'Level 1b' | 'Level 2a' | 'Level 2b' | 'Level 3' | 'Expert Consensus'
          active_version_id: string | null
          governance_status: 'draft' | 'under_review' | 'active' | 'suspended' | 'deprecated'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          type: 'risk_prediction' | 'screening_eligibility' | 'symptom_triage' | 'combined_protocol'
          name: string
          description: string
          issuing_organization: string
          primary_reference: string
          target_population: string
          clinical_limitations: string
          evidence_grade?: 'Level 1a' | 'Level 1b' | 'Level 2a' | 'Level 2b' | 'Level 3' | 'Expert Consensus'
          active_version_id?: string | null
          governance_status?: 'draft' | 'under_review' | 'active' | 'suspended' | 'deprecated'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          type?: 'risk_prediction' | 'screening_eligibility' | 'symptom_triage' | 'combined_protocol'
          name?: string
          description?: string
          issuing_organization?: string
          primary_reference?: string
          target_population?: string
          clinical_limitations?: string
          evidence_grade?: 'Level 1a' | 'Level 1b' | 'Level 2a' | 'Level 2b' | 'Level 3' | 'Expert Consensus'
          active_version_id?: string | null
          governance_status?: 'draft' | 'under_review' | 'active' | 'suspended' | 'deprecated'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinical_methodology_versions: {
        Row: {
          id: string
          methodology_id: string
          version_string: string
          semver: string
          status: 'draft' | 'submitted_for_review' | 'under_clinical_review' | 'revisions_requested' | 'awaiting_formal_approval' | 'approved' | 'active' | 'suspended' | 'deprecated' | 'rejected'
          changelog: string
          rule_definitions: Json
          approved_by_member_id: string | null
          approved_at: string | null
          meeting_id: string | null
          approval_notes: string | null
          review_cycle_months: number
          next_review_due_date: string
          last_reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          methodology_id: string
          version_string: string
          semver: string
          status?: 'draft' | 'submitted_for_review' | 'under_clinical_review' | 'revisions_requested' | 'awaiting_formal_approval' | 'approved' | 'active' | 'suspended' | 'deprecated' | 'rejected'
          changelog: string
          rule_definitions?: Json
          approved_by_member_id?: string | null
          approved_at?: string | null
          meeting_id?: string | null
          approval_notes?: string | null
          review_cycle_months?: number
          next_review_due_date: string
          last_reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          methodology_id?: string
          version_string?: string
          semver?: string
          status?: 'draft' | 'submitted_for_review' | 'under_clinical_review' | 'revisions_requested' | 'awaiting_formal_approval' | 'approved' | 'active' | 'suspended' | 'deprecated' | 'rejected'
          changelog?: string
          rule_definitions?: Json
          approved_by_member_id?: string | null
          approved_at?: string | null
          meeting_id?: string | null
          approval_notes?: string | null
          review_cycle_months?: number
          next_review_due_date?: string
          last_reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinical_rule_versions: {
        Row: {
          id: string
          methodology_version_id: string
          rule_identifier: string
          rule_name: string
          parameter_thresholds: Json
          logic_description: string
          is_mandatory_safety_rule: boolean
          created_at: string
        }
        Insert: {
          id?: string
          methodology_version_id: string
          rule_identifier: string
          rule_name: string
          parameter_thresholds?: Json
          logic_description: string
          is_mandatory_safety_rule?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          methodology_version_id?: string
          rule_identifier?: string
          rule_name?: string
          parameter_thresholds?: Json
          logic_description?: string
          is_mandatory_safety_rule?: boolean
          created_at?: string
        }
        Relationships: []
      }
      clinical_recommendation_registry: {
        Row: {
          id: string
          methodology_id: string
          code: string
          category: 'screening' | 'referral' | 'urgent_action' | 'follow_up' | 'lifestyle_counseling'
          title_en: string
          title_bn: string
          description_en: string
          description_bn: string
          clinical_rationale: string
          evidence_strength: string
          status: 'active' | 'deprecated' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          methodology_id: string
          code: string
          category: 'screening' | 'referral' | 'urgent_action' | 'follow_up' | 'lifestyle_counseling'
          title_en: string
          title_bn: string
          description_en: string
          description_bn: string
          clinical_rationale: string
          evidence_strength?: string
          status?: 'active' | 'deprecated' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          methodology_id?: string
          code?: string
          category?: 'screening' | 'referral' | 'urgent_action' | 'follow_up' | 'lifestyle_counseling'
          title_en?: string
          title_bn?: string
          description_en?: string
          description_bn?: string
          clinical_rationale?: string
          evidence_strength?: string
          status?: 'active' | 'deprecated' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinician_overrides: {
        Row: {
          id: string
          assessment_id: string
          patient_id: string
          clinician_id: string
          clinician_name: string
          facility_id: string | null
          engine_subsystem: 'risk_estimation' | 'screening_eligibility' | 'symptom_triage' | 'clinical_decision_support'
          methodology_version_id: string | null
          automated_result: Json
          overridden_result: Json
          override_reason_category: 'clinical_contraindication' | 'patient_preference' | 'comorbidity_precaution' | 'diagnostic_discordance' | 'expert_judgment' | 'other'
          override_rationale: string
          created_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          patient_id: string
          clinician_id: string
          clinician_name: string
          facility_id?: string | null
          engine_subsystem: 'risk_estimation' | 'screening_eligibility' | 'symptom_triage' | 'clinical_decision_support'
          methodology_version_id?: string | null
          automated_result: Json
          overridden_result: Json
          override_reason_category: 'clinical_contraindication' | 'patient_preference' | 'comorbidity_precaution' | 'diagnostic_discordance' | 'expert_judgment' | 'other'
          override_rationale: string
          created_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          patient_id?: string
          clinician_id?: string
          clinician_name?: string
          facility_id?: string | null
          engine_subsystem?: 'risk_estimation' | 'screening_eligibility' | 'symptom_triage' | 'clinical_decision_support'
          methodology_version_id?: string | null
          automated_result?: Json
          overridden_result?: Json
          override_reason_category?: 'clinical_contraindication' | 'patient_preference' | 'comorbidity_precaution' | 'diagnostic_discordance' | 'expert_judgment' | 'other'
          override_rationale?: string
          created_at?: string
        }
        Relationships: []
      }
      governance_audit_events: {
        Row: {
          id: string
          entity_type: 'board' | 'member' | 'meeting' | 'methodology' | 'version' | 'rule' | 'recommendation' | 'override_review'
          entity_id: string
          action: 'created' | 'status_changed' | 'approved' | 'activated' | 'suspended' | 'deprecated' | 'rejected' | 'reviewed' | 'credential_verified'
          previous_state: Json | null
          new_state: Json
          actor_id: string
          actor_name: string
          actor_role: string
          justification: string
          meeting_reference: string | null
          created_at: string
        }
        Insert: {
          id?: string
          entity_type: 'board' | 'member' | 'meeting' | 'methodology' | 'version' | 'rule' | 'recommendation' | 'override_review'
          entity_id: string
          action: 'created' | 'status_changed' | 'approved' | 'activated' | 'suspended' | 'deprecated' | 'rejected' | 'reviewed' | 'credential_verified'
          previous_state?: Json | null
          new_state: Json
          actor_id: string
          actor_name: string
          actor_role: string
          justification: string
          meeting_reference?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          entity_type?: 'board' | 'member' | 'meeting' | 'methodology' | 'version' | 'rule' | 'recommendation' | 'override_review'
          entity_id?: string
          action?: 'created' | 'status_changed' | 'approved' | 'activated' | 'suspended' | 'deprecated' | 'rejected' | 'reviewed' | 'credential_verified'
          previous_state?: Json | null
          new_state?: Json
          actor_id?: string
          actor_name?: string
          actor_role?: string
          justification?: string
          meeting_reference?: string | null
          created_at?: string
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          id: string
          event_type: string
          severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
          outcome: 'success' | 'failure' | 'blocked' | 'flagged'
          actor_id: string | null
          actor_role: string | null
          target_resource: string | null
          facility_id: string | null
          client_ip: string | null
          user_agent: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
          outcome: 'success' | 'failure' | 'blocked' | 'flagged'
          actor_id?: string | null
          actor_role?: string | null
          target_resource?: string | null
          facility_id?: string | null
          client_ip?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          severity?: 'info' | 'low' | 'medium' | 'high' | 'critical'
          outcome?: 'success' | 'failure' | 'blocked' | 'flagged'
          actor_id?: string | null
          actor_role?: string | null
          target_resource?: string | null
          facility_id?: string | null
          client_ip?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      privacy_subject_requests: {
        Row: {
          id: string
          request_number: string
          patient_id: string
          request_type: 'access_export' | 'correction' | 'erasure_restriction' | 'consent_withdrawal' | 'processing_objection'
          status: 'submitted' | 'under_review' | 'approved_fulfilled' | 'rejected' | 'partially_fulfilled_with_retention_hold'
          request_details: string
          review_notes: string | null
          reviewed_by: string | null
          retention_hold_applied: boolean
          retention_hold_reason: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          request_number: string
          patient_id: string
          request_type: 'access_export' | 'correction' | 'erasure_restriction' | 'consent_withdrawal' | 'processing_objection'
          status?: 'submitted' | 'under_review' | 'approved_fulfilled' | 'rejected' | 'partially_fulfilled_with_retention_hold'
          request_details: string
          review_notes?: string | null
          reviewed_by?: string | null
          retention_hold_applied?: boolean
          retention_hold_reason?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          request_number?: string
          patient_id?: string
          request_type?: 'access_export' | 'correction' | 'erasure_restriction' | 'consent_withdrawal' | 'processing_objection'
          status?: 'submitted' | 'under_review' | 'approved_fulfilled' | 'rejected' | 'partially_fulfilled_with_retention_hold'
          request_details?: string
          review_notes?: string | null
          reviewed_by?: string | null
          retention_hold_applied?: boolean
          retention_hold_reason?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Relationships: []
      }
      patient_consents_registry: {
        Row: {
          id: string
          patient_id: string
          consent_category: 'service_terms' | 'clinical_decision_support' | 'care_team_sharing' | 'sms_notifications' | 'email_notifications' | 'environmental_analysis' | 'anonymized_research'
          purpose: string
          version: string
          is_granted: boolean
          collection_method: 'electronic_portal' | 'worker_witnessed_digital' | 'paper_scanned' | 'verbal_witnessed_emergency'
          witness_id: string | null
          withdrawal_reason: string | null
          granted_at: string
          withdrawn_at: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          consent_category: 'service_terms' | 'clinical_decision_support' | 'care_team_sharing' | 'sms_notifications' | 'email_notifications' | 'environmental_analysis' | 'anonymized_research'
          purpose: string
          version?: string
          is_granted?: boolean
          collection_method: 'electronic_portal' | 'worker_witnessed_digital' | 'paper_scanned' | 'verbal_witnessed_emergency'
          witness_id?: string | null
          withdrawal_reason?: string | null
          granted_at?: string
          withdrawn_at?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          consent_category?: 'service_terms' | 'clinical_decision_support' | 'care_team_sharing' | 'sms_notifications' | 'email_notifications' | 'environmental_analysis' | 'anonymized_research'
          purpose?: string
          version?: string
          is_granted?: boolean
          collection_method?: 'electronic_portal' | 'worker_witnessed_digital' | 'paper_scanned' | 'verbal_witnessed_emergency'
          witness_id?: string | null
          withdrawal_reason?: string | null
          granted_at?: string
          withdrawn_at?: string | null
        }
        Relationships: []
      }
      security_incidents: {
        Row: {
          id: string
          incident_number: string
          title: string
          category: 'unauthorized_access_attempt' | 'credential_compromise' | 'data_exposure_suspected' | 'cross_facility_violation' | 'brute_force_attack' | 'policy_violation' | 'system_anomaly'
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: 'reported' | 'investigating' | 'contained' | 'resolved' | 'closed'
          affected_systems: Json
          reporter_id: string
          reporter_name: string
          assignee_id: string | null
          containment_notes: string | null
          resolution_summary: string | null
          reported_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          incident_number: string
          title: string
          category: 'unauthorized_access_attempt' | 'credential_compromise' | 'data_exposure_suspected' | 'cross_facility_violation' | 'brute_force_attack' | 'policy_violation' | 'system_anomaly'
          severity: 'low' | 'medium' | 'high' | 'critical'
          status?: 'reported' | 'investigating' | 'contained' | 'resolved' | 'closed'
          affected_systems?: Json
          reporter_id: string
          reporter_name: string
          assignee_id?: string | null
          containment_notes?: string | null
          resolution_summary?: string | null
          reported_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          incident_number?: string
          title?: string
          category?: 'unauthorized_access_attempt' | 'credential_compromise' | 'data_exposure_suspected' | 'cross_facility_violation' | 'brute_force_attack' | 'policy_violation' | 'system_anomaly'
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'reported' | 'investigating' | 'contained' | 'resolved' | 'closed'
          affected_systems?: Json
          reporter_id?: string
          reporter_name?: string
          assignee_id?: string | null
          containment_notes?: string | null
          resolution_summary?: string | null
          reported_at?: string
          resolved_at?: string | null
        }
        Relationships: []
      }
      data_retention_policies: {
        Row: {
          id: string
          data_category: 'clinical_records' | 'diagnostic_imaging_reports' | 'security_audit_logs' | 'temporary_assessment_drafts' | 'platform_telemetry' | 'notifications_history' | 'patient_consents'
          retention_period_days: number
          legal_basis: string
          deletion_method: string
          is_immutable: boolean
          review_status: string
          updated_at: string
        }
        Insert: {
          id?: string
          data_category: 'clinical_records' | 'diagnostic_imaging_reports' | 'security_audit_logs' | 'temporary_assessment_drafts' | 'platform_telemetry' | 'notifications_history' | 'patient_consents'
          retention_period_days: number
          legal_basis: string
          deletion_method: string
          is_immutable?: boolean
          review_status?: string
          updated_at?: string
        }
        Update: {
          id?: string
          data_category?: 'clinical_records' | 'diagnostic_imaging_reports' | 'security_audit_logs' | 'temporary_assessment_drafts' | 'platform_telemetry' | 'notifications_history' | 'patient_consents'
          retention_period_days?: number
          legal_basis?: string
          deletion_method?: string
          is_immutable?: boolean
          review_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      compliance_controls_register: {
        Row: {
          id: string
          control_id: string
          framework: 'BD_CYBER_SECURITY_ACT_2023' | 'BD_DRAFT_DATA_PROTECTION_ACT' | 'BMDC_CODE_OF_ETHICS' | 'DGHS_DIGITAL_HEALTH_GUIDELINES' | 'ISO_27001_READINESS' | 'HIPAA_SECURITY_READINESS' | 'GDPR_READINESS'
          jurisdiction: string
          category: string
          control_name: string
          description: string
          implementation_status: 'implemented' | 'in_progress' | 'planned' | 'requires_legal_review'
          evidence_summary: string
          responsible_owner: string
          last_audited_at: string
        }
        Insert: {
          id?: string
          control_id: string
          framework: 'BD_CYBER_SECURITY_ACT_2023' | 'BD_DRAFT_DATA_PROTECTION_ACT' | 'BMDC_CODE_OF_ETHICS' | 'DGHS_DIGITAL_HEALTH_GUIDELINES' | 'ISO_27001_READINESS' | 'HIPAA_SECURITY_READINESS' | 'GDPR_READINESS'
          jurisdiction: string
          category: string
          control_name: string
          description: string
          implementation_status: 'implemented' | 'in_progress' | 'planned' | 'requires_legal_review'
          evidence_summary: string
          responsible_owner: string
          last_audited_at?: string
        }
        Update: {
          id?: string
          control_id?: string
          framework?: 'BD_CYBER_SECURITY_ACT_2023' | 'BD_DRAFT_DATA_PROTECTION_ACT' | 'BMDC_CODE_OF_ETHICS' | 'DGHS_DIGITAL_HEALTH_GUIDELINES' | 'ISO_27001_READINESS' | 'HIPAA_SECURITY_READINESS' | 'GDPR_READINESS'
          jurisdiction?: string
          category?: string
          control_name?: string
          description?: string
          implementation_status?: 'implemented' | 'in_progress' | 'planned' | 'requires_legal_review'
          evidence_summary?: string
          responsible_owner?: string
          last_audited_at?: string
        }
        Relationships: []
      }
      system_backup_verifications: {
        Row: {
          id: string
          backup_type: 'automated_daily_snapshot' | 'point_in_time_wal' | 'pre_migration_dump' | 'cold_storage_archive'
          target_system: string
          snapshot_timestamp: string
          verification_status: 'verified_successful' | 'verification_failed' | 'remediation_in_progress'
          verified_by: string
          verification_notes: string
          recovery_drill_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          backup_type: 'automated_daily_snapshot' | 'point_in_time_wal' | 'pre_migration_dump' | 'cold_storage_archive'
          target_system: string
          snapshot_timestamp: string
          verification_status: 'verified_successful' | 'verification_failed' | 'remediation_in_progress'
          verified_by: string
          verification_notes: string
          recovery_drill_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          backup_type?: 'automated_daily_snapshot' | 'point_in_time_wal' | 'pre_migration_dump' | 'cold_storage_archive'
          target_system?: string
          snapshot_timestamp?: string
          verification_status?: 'verified_successful' | 'verification_failed' | 'remediation_in_progress'
          verified_by?: string
          verification_notes?: string
          recovery_drill_date?: string | null
          created_at?: string
        }
        Relationships: []
      }
      anomaly_records: {
        Row: {
          id: string
          anomaly_number: string
          category: 'patient_data' | 'assessment_inconsistency' | 'data_quality' | 'environmental' | 'operational'
          subtype: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: 'detected' | 'pending_review' | 'under_review' | 'confirmed' | 'dismissed' | 'resolved' | 'escalated'
          entity_type: string
          entity_id: string
          facility_id: string | null
          title_en: string
          title_bn: string
          description_en: string
          description_bn: string
          detection_methodology: 'deterministic_rule' | 'statistical_mad' | 'statistical_iqr' | 'rolling_zscore' | 'multivariate_isolation'
          rule_id: string | null
          rule_version: string
          triggering_fields: Json
          observed_value: Json
          expected_reference: Json
          context_metadata: Json
          assigned_role: 'clinician' | 'healthcare_worker' | 'administrator' | null
          assigned_to: string | null
          resolution_outcome: 'data_corrected' | 'false_positive_clinical_variation' | 'sensor_recalibrated' | 'system_bug_logged' | 'acknowledged_acceptable_deviation' | null
          resolution_notes: string | null
          resolved_by: string | null
          resolved_at: string | null
          detected_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          anomaly_number: string
          category: 'patient_data' | 'assessment_inconsistency' | 'data_quality' | 'environmental' | 'operational'
          subtype: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          status?: 'detected' | 'pending_review' | 'under_review' | 'confirmed' | 'dismissed' | 'resolved' | 'escalated'
          entity_type: string
          entity_id: string
          facility_id?: string | null
          title_en: string
          title_bn: string
          description_en: string
          description_bn: string
          detection_methodology: 'deterministic_rule' | 'statistical_mad' | 'statistical_iqr' | 'rolling_zscore' | 'multivariate_isolation'
          rule_id?: string | null
          rule_version?: string
          triggering_fields?: Json
          observed_value?: Json
          expected_reference?: Json
          context_metadata?: Json
          assigned_role?: 'clinician' | 'healthcare_worker' | 'administrator' | null
          assigned_to?: string | null
          resolution_outcome?: 'data_corrected' | 'false_positive_clinical_variation' | 'sensor_recalibrated' | 'system_bug_logged' | 'acknowledged_acceptable_deviation' | null
          resolution_notes?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          detected_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          anomaly_number?: string
          category?: 'patient_data' | 'assessment_inconsistency' | 'data_quality' | 'environmental' | 'operational'
          subtype?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'detected' | 'pending_review' | 'under_review' | 'confirmed' | 'dismissed' | 'resolved' | 'escalated'
          entity_type?: string
          entity_id?: string
          facility_id?: string | null
          title_en?: string
          title_bn?: string
          description_en?: string
          description_bn?: string
          detection_methodology?: 'deterministic_rule' | 'statistical_mad' | 'statistical_iqr' | 'rolling_zscore' | 'multivariate_isolation'
          rule_id?: string | null
          rule_version?: string
          triggering_fields?: Json
          observed_value?: Json
          expected_reference?: Json
          context_metadata?: Json
          assigned_role?: 'clinician' | 'healthcare_worker' | 'administrator' | null
          assigned_to?: string | null
          resolution_outcome?: 'data_corrected' | 'false_positive_clinical_variation' | 'sensor_recalibrated' | 'system_bug_logged' | 'acknowledged_acceptable_deviation' | null
          resolution_notes?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          detected_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      anomaly_review_events: {
        Row: {
          id: string
          anomaly_id: string
          previous_status: string
          new_status: string
          actor_id: string
          actor_role: string
          action: 'detect' | 'assign' | 'start_review' | 'confirm' | 'dismiss' | 'resolve' | 'escalate' | 'reopen'
          notes: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          anomaly_id: string
          previous_status: string
          new_status: string
          actor_id: string
          actor_role: string
          action: 'detect' | 'assign' | 'start_review' | 'confirm' | 'dismiss' | 'resolve' | 'escalate' | 'reopen'
          notes?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          anomaly_id?: string
          previous_status?: string
          new_status?: string
          actor_id?: string
          actor_role?: string
          action?: 'detect' | 'assign' | 'start_review' | 'confirm' | 'dismiss' | 'resolve' | 'escalate' | 'reopen'
          notes?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anomaly_review_events_anomaly_id_fkey"
            columns: ["anomaly_id"]
            isOneToOne: false
            referencedRelation: "anomaly_records"
            referencedColumns: ["id"]
          }
        ]
      }
      data_quality_metrics_snapshots: {
        Row: {
          id: string
          snapshot_date: string
          facility_id: string | null
          domain: 'patients' | 'assessments' | 'environmental' | 'operational' | 'overall'
          total_records: number
          missing_count: number
          invalid_count: number
          inconsistent_count: number
          stale_count: number
          confirmed_count: number
          quality_score: number
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          snapshot_date: string
          facility_id?: string | null
          domain: 'patients' | 'assessments' | 'environmental' | 'operational' | 'overall'
          total_records?: number
          missing_count?: number
          invalid_count?: number
          inconsistent_count?: number
          stale_count?: number
          confirmed_count?: number
          quality_score?: number
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          snapshot_date?: string
          facility_id?: string | null
          domain?: 'patients' | 'assessments' | 'environmental' | 'operational' | 'overall'
          total_records?: number
          missing_count?: number
          invalid_count?: number
          inconsistent_count?: number
          stale_count?: number
          confirmed_count?: number
          quality_score?: number
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      clinical_evidence_sources: {
        Row: {
          id: string
          code: string
          title_en: string
          title_bn: string
          issuing_organization: string
          source_type: 'guideline' | 'systematic_review' | 'randomized_trial' | 'observational_study' | 'national_protocol' | 'expert_consensus'
          evidence_tier: 'Level 1a' | 'Level 1b' | 'Level 2a' | 'Level 2b' | 'Level 3' | 'Grade A' | 'Grade B' | 'Grade C' | 'Consensus'
          primary_topic: 'risk_factors' | 'tobacco_exposure' | 'environmental_exposure' | 'screening_guidance' | 'symptom_triage' | 'diagnostic_pathways' | 'referral_criteria' | 'patient_education'
          jurisdiction: 'Bangladesh' | 'International' | 'United States' | 'United Kingdom' | 'WHO'
          publication_reference: string
          official_url: string | null
          doi: string | null
          publication_date: string
          last_reviewed_date: string | null
          version_tag: string
          approval_status: 'draft' | 'under_review' | 'approved' | 'active' | 'superseded' | 'withdrawn'
          approved_for_bangladesh: boolean
          bangladesh_adaptation_notes: string | null
          summary_en: string
          summary_bn: string
          key_recommendations_en: Json
          key_recommendations_bn: Json
          clinical_limitations: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          title_en: string
          title_bn: string
          issuing_organization: string
          source_type: 'guideline' | 'systematic_review' | 'randomized_trial' | 'observational_study' | 'national_protocol' | 'expert_consensus'
          evidence_tier: 'Level 1a' | 'Level 1b' | 'Level 2a' | 'Level 2b' | 'Level 3' | 'Grade A' | 'Grade B' | 'Grade C' | 'Consensus'
          primary_topic: 'risk_factors' | 'tobacco_exposure' | 'environmental_exposure' | 'screening_guidance' | 'symptom_triage' | 'diagnostic_pathways' | 'referral_criteria' | 'patient_education'
          jurisdiction: 'Bangladesh' | 'International' | 'United States' | 'United Kingdom' | 'WHO'
          publication_reference: string
          official_url?: string | null
          doi?: string | null
          publication_date: string
          last_reviewed_date?: string | null
          version_tag?: string
          approval_status?: 'draft' | 'under_review' | 'approved' | 'active' | 'superseded' | 'withdrawn'
          approved_for_bangladesh?: boolean
          bangladesh_adaptation_notes?: string | null
          summary_en: string
          summary_bn: string
          key_recommendations_en?: Json
          key_recommendations_bn?: Json
          clinical_limitations?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          title_en?: string
          title_bn?: string
          issuing_organization?: string
          source_type?: 'guideline' | 'systematic_review' | 'randomized_trial' | 'observational_study' | 'national_protocol' | 'expert_consensus'
          evidence_tier?: 'Level 1a' | 'Level 1b' | 'Level 2a' | 'Level 2b' | 'Level 3' | 'Grade A' | 'Grade B' | 'Grade C' | 'Consensus'
          primary_topic?: 'risk_factors' | 'tobacco_exposure' | 'environmental_exposure' | 'screening_guidance' | 'symptom_triage' | 'diagnostic_pathways' | 'referral_criteria' | 'patient_education'
          jurisdiction?: 'Bangladesh' | 'International' | 'United States' | 'United Kingdom' | 'WHO'
          publication_reference?: string
          official_url?: string | null
          doi?: string | null
          publication_date?: string
          last_reviewed_date?: string | null
          version_tag?: string
          approval_status?: 'draft' | 'under_review' | 'approved' | 'active' | 'superseded' | 'withdrawn'
          approved_for_bangladesh?: boolean
          bangladesh_adaptation_notes?: string | null
          summary_en?: string
          summary_bn?: string
          key_recommendations_en?: Json
          key_recommendations_bn?: Json
          clinical_limitations?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinical_knowledge_articles: {
        Row: {
          id: string
          slug: string
          topic: string
          title_en: string
          title_bn: string
          content_en: string
          content_bn: string
          target_audience: 'clinician' | 'healthcare_worker' | 'patient' | 'public'
          primary_evidence_source_id: string | null
          evidence_grade: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          topic: string
          title_en: string
          title_bn: string
          content_en: string
          content_bn: string
          target_audience: 'clinician' | 'healthcare_worker' | 'patient' | 'public'
          primary_evidence_source_id?: string | null
          evidence_grade?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          topic?: string
          title_en?: string
          title_bn?: string
          content_en?: string
          content_bn?: string
          target_audience?: 'clinician' | 'healthcare_worker' | 'patient' | 'public'
          primary_evidence_source_id?: string | null
          evidence_grade?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_knowledge_articles_primary_evidence_source_id_fkey"
            columns: ["primary_evidence_source_id"]
            isOneToOne: false
            referencedRelation: "clinical_evidence_sources"
            referencedColumns: ["id"]
          }
        ]
      }
      clinical_decision_support_insights: {
        Row: {
          id: string
          patient_id: string
          assessment_id: string
          facility_id: string | null
          insight_category: 'risk_factor_alert' | 'screening_consideration' | 'symptom_warning' | 'environmental_hazard' | 'data_incompleteness' | 'referral_prompt'
          title_en: string
          title_bn: string
          explanation_en: string
          explanation_bn: string
          clinical_justification: string
          provenance_type: 'patient_reported' | 'healthcare_worker_entered' | 'retrieved_evidence' | 'system_generated_decision_support'
          trigger_attributes: Json
          supporting_evidence_ids: Json
          confidence_tier: 'high' | 'moderate' | 'low' | 'provisional'
          clinician_action_status: 'pending' | 'accepted' | 'modified' | 'dismissed' | 'overridden'
          clinician_action_notes: string | null
          acted_by: string | null
          acted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          assessment_id: string
          facility_id?: string | null
          insight_category: 'risk_factor_alert' | 'screening_consideration' | 'symptom_warning' | 'environmental_hazard' | 'data_incompleteness' | 'referral_prompt'
          title_en: string
          title_bn: string
          explanation_en: string
          explanation_bn: string
          clinical_justification: string
          provenance_type: 'patient_reported' | 'healthcare_worker_entered' | 'retrieved_evidence' | 'system_generated_decision_support'
          trigger_attributes?: Json
          supporting_evidence_ids?: Json
          confidence_tier: 'high' | 'moderate' | 'low' | 'provisional'
          clinician_action_status?: 'pending' | 'accepted' | 'modified' | 'dismissed' | 'overridden'
          clinician_action_notes?: string | null
          acted_by?: string | null
          acted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          assessment_id?: string
          facility_id?: string | null
          insight_category?: 'risk_factor_alert' | 'screening_consideration' | 'symptom_warning' | 'environmental_hazard' | 'data_incompleteness' | 'referral_prompt'
          title_en?: string
          title_bn?: string
          explanation_en?: string
          explanation_bn?: string
          clinical_justification?: string
          provenance_type?: 'patient_reported' | 'healthcare_worker_entered' | 'retrieved_evidence' | 'system_generated_decision_support'
          trigger_attributes?: Json
          supporting_evidence_ids?: Json
          confidence_tier?: 'high' | 'moderate' | 'low' | 'provisional'
          clinician_action_status?: 'pending' | 'accepted' | 'modified' | 'dismissed' | 'overridden'
          clinician_action_notes?: string | null
          acted_by?: string | null
          acted_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      clinical_recommendation_assistance: {
        Row: {
          id: string
          patient_id: string
          assessment_id: string
          insight_id: string | null
          recommendation_category: 'screening' | 'diagnostic_workup' | 'urgent_referral' | 'smoking_cessation' | 'environmental_mitigation' | 'routine_followup'
          recommendation_code: string
          statement_en: string
          statement_bn: string
          evidence_source_id: string | null
          evidence_strength: string
          applicability_conditions: Json
          contraindications: Json
          action_status: 'pending' | 'accepted' | 'modified' | 'dismissed' | 'overridden'
          clinician_rationale: string | null
          clinician_id: string | null
          documented_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          assessment_id: string
          insight_id?: string | null
          recommendation_category: 'screening' | 'diagnostic_workup' | 'urgent_referral' | 'smoking_cessation' | 'environmental_mitigation' | 'routine_followup'
          recommendation_code: string
          statement_en: string
          statement_bn: string
          evidence_source_id?: string | null
          evidence_strength: string
          applicability_conditions?: Json
          contraindications?: Json
          action_status?: 'pending' | 'accepted' | 'modified' | 'dismissed' | 'overridden'
          clinician_rationale?: string | null
          clinician_id?: string | null
          documented_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          assessment_id?: string
          insight_id?: string | null
          recommendation_category?: 'screening' | 'diagnostic_workup' | 'urgent_referral' | 'smoking_cessation' | 'environmental_mitigation' | 'routine_followup'
          recommendation_code?: string
          statement_en?: string
          statement_bn?: string
          evidence_source_id?: string | null
          evidence_strength?: string
          applicability_conditions?: Json
          contraindications?: Json
          action_status?: 'pending' | 'accepted' | 'modified' | 'dismissed' | 'overridden'
          clinician_rationale?: string | null
          clinician_id?: string | null
          documented_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_recommendation_assistance_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "clinical_decision_support_insights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_recommendation_assistance_evidence_source_id_fkey"
            columns: ["evidence_source_id"]
            isOneToOne: false
            referencedRelation: "clinical_evidence_sources"
            referencedColumns: ["id"]
          }
        ]
      }
      environmental_provider_registry: {
        Row: {
          id: string
          provider_code: string
          name: string
          provider_type: string
          classification: 'direct_ground_station' | 'satellite_reanalysis' | 'atmospheric_model' | 'sensor_network_crowdsourced' | 'governmental_reference' | 'benchmark_composite'
          official_url: string | null
          coverage_jurisdiction: string
          update_frequency_minutes: number
          reliability_tier: string
          attribution_text: string
          api_endpoint: string | null
          is_active: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_code: string
          name: string
          provider_type: string
          classification?: 'direct_ground_station' | 'satellite_reanalysis' | 'atmospheric_model' | 'sensor_network_crowdsourced' | 'governmental_reference' | 'benchmark_composite'
          official_url?: string | null
          coverage_jurisdiction?: string
          update_frequency_minutes?: number
          reliability_tier?: string
          attribution_text: string
          api_endpoint?: string | null
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider_code?: string
          name?: string
          provider_type?: string
          classification?: 'direct_ground_station' | 'satellite_reanalysis' | 'atmospheric_model' | 'sensor_network_crowdsourced' | 'governmental_reference' | 'benchmark_composite'
          official_url?: string | null
          coverage_jurisdiction?: string
          update_frequency_minutes?: number
          reliability_tier?: string
          attribution_text?: string
          api_endpoint?: string | null
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      historical_environmental_snapshots: {
        Row: {
          id: string
          geographic_entity_id: string | null
          division: string
          district: string
          upazila: string | null
          aggregation_period: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'annual' | 'multi_year'
          period_start: string
          period_end: string
          season: 'winter_dry' | 'pre_monsoon' | 'monsoon' | 'all_season'
          avg_us_aqi: number | null
          avg_pm25: number
          avg_pm10: number | null
          avg_no2: number | null
          avg_so2: number | null
          avg_co: number | null
          avg_o3: number | null
          max_pm25: number | null
          min_pm25: number | null
          elevated_days_count: number
          total_observation_hours: number
          data_completeness_ratio: number
          primary_provider_code: string
          is_modelled: boolean
          confidence_score: number
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          geographic_entity_id?: string | null
          division: string
          district: string
          upazila?: string | null
          aggregation_period: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'annual' | 'multi_year'
          period_start: string
          period_end: string
          season?: 'winter_dry' | 'pre_monsoon' | 'monsoon' | 'all_season'
          avg_us_aqi?: number | null
          avg_pm25: number
          avg_pm10?: number | null
          avg_no2?: number | null
          avg_so2?: number | null
          avg_co?: number | null
          avg_o3?: number | null
          max_pm25?: number | null
          min_pm25?: number | null
          elevated_days_count?: number
          total_observation_hours?: number
          data_completeness_ratio?: number
          primary_provider_code: string
          is_modelled?: boolean
          confidence_score?: number
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          geographic_entity_id?: string | null
          division?: string
          district?: string
          upazila?: string | null
          aggregation_period?: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'annual' | 'multi_year'
          period_start?: string
          period_end?: string
          season?: 'winter_dry' | 'pre_monsoon' | 'monsoon' | 'all_season'
          avg_us_aqi?: number | null
          avg_pm25?: number
          avg_pm10?: number | null
          avg_no2?: number | null
          avg_so2?: number | null
          avg_co?: number | null
          avg_o3?: number | null
          max_pm25?: number | null
          min_pm25?: number | null
          elevated_days_count?: number
          total_observation_hours?: number
          data_completeness_ratio?: number
          primary_provider_code?: string
          is_modelled?: boolean
          confidence_score?: number
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "historical_environmental_snapshots_geographic_entity_id_fkey"
            columns: ["geographic_entity_id"]
            isOneToOne: false
            referencedRelation: "geographic_entities"
            referencedColumns: ["id"]
          }
        ]
      }
      geographic_environmental_models: {
        Row: {
          id: string
          model_code: string
          model_name: string
          administrative_level: 'country' | 'division' | 'district' | 'upazila' | 'union_municipality' | 'ward' | 'neighborhood'
          spatial_method: 'ground_station_direct' | 'idw_interpolation' | 'satellite_reanalysis_grid' | 'hybrid_calibrated_model' | 'regional_centroid_benchmark'
          grid_resolution_km: number | null
          hotspot_threshold_pm25: number
          active_features: Json
          calibration_status: string
          last_calibrated_at: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          model_code: string
          model_name: string
          administrative_level: 'country' | 'division' | 'district' | 'upazila' | 'union_municipality' | 'ward' | 'neighborhood'
          spatial_method: 'ground_station_direct' | 'idw_interpolation' | 'satellite_reanalysis_grid' | 'hybrid_calibrated_model' | 'regional_centroid_benchmark'
          grid_resolution_km?: number | null
          hotspot_threshold_pm25?: number
          active_features?: Json
          calibration_status?: string
          last_calibrated_at?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          model_code?: string
          model_name?: string
          administrative_level?: 'country' | 'division' | 'district' | 'upazila' | 'union_municipality' | 'ward' | 'neighborhood'
          spatial_method?: 'ground_station_direct' | 'idw_interpolation' | 'satellite_reanalysis_grid' | 'hybrid_calibrated_model' | 'regional_centroid_benchmark'
          grid_resolution_km?: number | null
          hotspot_threshold_pm25?: number
          active_features?: Json
          calibration_status?: string
          last_calibrated_at?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      environmental_risk_factor_profiles: {
        Row: {
          id: string
          profile_code: string
          title_en: string
          title_bn: string
          risk_factor_category: string
          iarc_classification: string
          scientific_reference: string
          measurement_methodology: string
          clinical_disclaimer: string
          is_active: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_code: string
          title_en: string
          title_bn: string
          risk_factor_category: string
          iarc_classification?: string
          scientific_reference: string
          measurement_methodology: string
          clinical_disclaimer: string
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_code?: string
          title_en?: string
          title_bn?: string
          risk_factor_category?: string
          iarc_classification?: string
          scientific_reference?: string
          measurement_methodology?: string
          clinical_disclaimer?: string
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_environmental_exposure_assessments: {
        Row: {
          id: string
          patient_id: string
          evaluation_date: string
          residential_history_summary: Json
          estimated_cumulative_ambient_pm25_years: number | null
          indoor_biomass_exposure_years: number
          occupational_dust_exposure_years: number
          data_confidence_score: number
          clinical_review_status: string
          clinician_notes: string | null
          reviewed_by: string | null
          clinical_safety_acknowledgment: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          evaluation_date?: string
          residential_history_summary?: Json
          estimated_cumulative_ambient_pm25_years?: number | null
          indoor_biomass_exposure_years?: number
          occupational_dust_exposure_years?: number
          data_confidence_score?: number
          clinical_review_status?: string
          clinician_notes?: string | null
          reviewed_by?: string | null
          clinical_safety_acknowledgment?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          evaluation_date?: string
          residential_history_summary?: Json
          estimated_cumulative_ambient_pm25_years?: number | null
          indoor_biomass_exposure_years?: number
          occupational_dust_exposure_years?: number
          data_confidence_score?: number
          clinical_review_status?: string
          clinician_notes?: string | null
          reviewed_by?: string | null
          clinical_safety_acknowledgment?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_environmental_exposure_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_environmental_exposure_assessments_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      population_cohort_definitions: {
        Row: {
          id: string
          cohort_code: string
          name_en: string
          name_bn: string
          description: string
          inclusion_criteria: Json
          exclusion_criteria: Json
          sampling_methodology: 'clinical_convenience_sample' | 'stratified_sentinel_surveillance' | 'community_screening_pilot' | 'demographic_health_survey_benchmark'
          observation_period_start: string
          observation_period_end: string
          total_cohort_size: number
          is_active: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cohort_code: string
          name_en: string
          name_bn: string
          description: string
          inclusion_criteria?: Json
          exclusion_criteria?: Json
          sampling_methodology?: 'clinical_convenience_sample' | 'stratified_sentinel_surveillance' | 'community_screening_pilot' | 'demographic_health_survey_benchmark'
          observation_period_start: string
          observation_period_end: string
          total_cohort_size?: number
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cohort_code?: string
          name_en?: string
          name_bn?: string
          description?: string
          inclusion_criteria?: Json
          exclusion_criteria?: Json
          sampling_methodology?: 'clinical_convenience_sample' | 'stratified_sentinel_surveillance' | 'community_screening_pilot' | 'demographic_health_survey_benchmark'
          observation_period_start?: string
          observation_period_end?: string
          total_cohort_size?: number
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      population_aggregate_snapshots: {
        Row: {
          id: string
          cohort_id: string | null
          snapshot_date: string
          aggregation_level: 'national' | 'division' | 'district' | 'upazila'
          geographic_entity_id: string | null
          division: string | null
          district: string | null
          upazila: string | null
          total_assessed_individuals: number
          male_count: number | null
          female_count: number | null
          age_distribution: Json
          current_smoker_count: number | null
          bidi_smoker_count: number | null
          biomass_cooking_count: number | null
          occupational_dust_count: number | null
          copd_history_count: number | null
          prior_tb_count: number | null
          elevated_pm25_exposure_count: number | null
          screening_eligible_count: number | null
          urgent_referral_flagged_count: number | null
          privacy_k_threshold: number
          is_privacy_suppressed: boolean
          provenance_hash: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          cohort_id?: string | null
          snapshot_date: string
          aggregation_level?: 'national' | 'division' | 'district' | 'upazila'
          geographic_entity_id?: string | null
          division?: string | null
          district?: string | null
          upazila?: string | null
          total_assessed_individuals?: number
          male_count?: number | null
          female_count?: number | null
          age_distribution?: Json
          current_smoker_count?: number | null
          bidi_smoker_count?: number | null
          biomass_cooking_count?: number | null
          occupational_dust_count?: number | null
          copd_history_count?: number | null
          prior_tb_count?: number | null
          elevated_pm25_exposure_count?: number | null
          screening_eligible_count?: number | null
          urgent_referral_flagged_count?: number | null
          privacy_k_threshold?: number
          is_privacy_suppressed?: boolean
          provenance_hash: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          cohort_id?: string | null
          snapshot_date?: string
          aggregation_level?: 'national' | 'division' | 'district' | 'upazila'
          geographic_entity_id?: string | null
          division?: string | null
          district?: string | null
          upazila?: string | null
          total_assessed_individuals?: number
          male_count?: number | null
          female_count?: number | null
          age_distribution?: Json
          current_smoker_count?: number | null
          bidi_smoker_count?: number | null
          biomass_cooking_count?: number | null
          occupational_dust_count?: number | null
          copd_history_count?: number | null
          prior_tb_count?: number | null
          elevated_pm25_exposure_count?: number | null
          screening_eligible_count?: number | null
          urgent_referral_flagged_count?: number | null
          privacy_k_threshold?: number
          is_privacy_suppressed?: boolean
          provenance_hash?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "population_aggregate_snapshots_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "population_cohort_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "population_aggregate_snapshots_geographic_entity_id_fkey"
            columns: ["geographic_entity_id"]
            isOneToOne: false
            referencedRelation: "geographic_entities"
            referencedColumns: ["id"]
          }
        ]
      }
      population_geographic_metrics: {
        Row: {
          id: string
          snapshot_id: string | null
          division: string
          district: string
          assessment_density_per_100k: number | null
          smoking_prevalence_pct: number | null
          biomass_prevalence_pct: number | null
          ambient_pm25_annual_avg: number | null
          screening_eligibility_pct: number | null
          symptom_alert_pct: number | null
          sample_size: number
          sample_coverage_tier: string
          is_suppressed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          snapshot_id?: string | null
          division: string
          district: string
          assessment_density_per_100k?: number | null
          smoking_prevalence_pct?: number | null
          biomass_prevalence_pct?: number | null
          ambient_pm25_annual_avg?: number | null
          screening_eligibility_pct?: number | null
          symptom_alert_pct?: number | null
          sample_size: number
          sample_coverage_tier?: string
          is_suppressed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          snapshot_id?: string | null
          division?: string
          district?: string
          assessment_density_per_100k?: number | null
          smoking_prevalence_pct?: number | null
          biomass_prevalence_pct?: number | null
          ambient_pm25_annual_avg?: number | null
          screening_eligibility_pct?: number | null
          symptom_alert_pct?: number | null
          sample_size?: number
          sample_coverage_tier?: string
          is_suppressed?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "population_geographic_metrics_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "population_aggregate_snapshots"
            referencedColumns: ["id"]
          }
        ]
      }
      population_research_queries: {
        Row: {
          id: string
          query_code: string
          title_en: string
          title_bn: string
          query_parameters: Json
          executed_by: string | null
          execution_timestamp: string
          records_analyzed_count: number
          results_summary: Json
          privacy_audit_hash: string
          non_causal_acknowledgment: boolean
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          query_code: string
          title_en: string
          title_bn: string
          query_parameters: Json
          executed_by?: string | null
          execution_timestamp?: string
          records_analyzed_count: number
          results_summary: Json
          privacy_audit_hash: string
          non_causal_acknowledgment?: boolean
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          query_code?: string
          title_en?: string
          title_bn?: string
          query_parameters?: Json
          executed_by?: string | null
          execution_timestamp?: string
          records_analyzed_count?: number
          results_summary?: Json
          privacy_audit_hash?: string
          non_causal_acknowledgment?: boolean
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "population_research_queries_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      healthcare_integration_systems: {
        Row: {
          id: string
          system_code: string
          name: string
          system_type: 'ehr' | 'lis' | 'pacs_ris' | 'facility_registry' | 'identity_service' | 'health_information_exchange'
          interoperability_standard: 'hl7_fhir_r4' | 'hl7_v2' | 'dicom_bridge' | 'rest_json' | 'smart_on_fhir'
          endpoint_url: string | null
          auth_method: string
          status: 'active' | 'degraded' | 'disconnected' | 'sandbox_mock' | 'maintenance'
          last_sync_at: string | null
          sync_interval_minutes: number
          circuit_breaker_failures: number
          is_enabled: boolean
          jurisdiction: string
          attribution_text: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          system_code: string
          name: string
          system_type: 'ehr' | 'lis' | 'pacs_ris' | 'facility_registry' | 'identity_service' | 'health_information_exchange'
          interoperability_standard?: 'hl7_fhir_r4' | 'hl7_v2' | 'dicom_bridge' | 'rest_json' | 'smart_on_fhir'
          endpoint_url?: string | null
          auth_method?: string
          status?: 'active' | 'degraded' | 'disconnected' | 'sandbox_mock' | 'maintenance'
          last_sync_at?: string | null
          sync_interval_minutes?: number
          circuit_breaker_failures?: number
          is_enabled?: boolean
          jurisdiction?: string
          attribution_text: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          system_code?: string
          name?: string
          system_type?: 'ehr' | 'lis' | 'pacs_ris' | 'facility_registry' | 'identity_service' | 'health_information_exchange'
          interoperability_standard?: 'hl7_fhir_r4' | 'hl7_v2' | 'dicom_bridge' | 'rest_json' | 'smart_on_fhir'
          endpoint_url?: string | null
          auth_method?: string
          status?: 'active' | 'degraded' | 'disconnected' | 'sandbox_mock' | 'maintenance'
          last_sync_at?: string | null
          sync_interval_minutes?: number
          circuit_breaker_failures?: number
          is_enabled?: boolean
          jurisdiction?: string
          attribution_text?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_external_identifiers: {
        Row: {
          id: string
          patient_id: string
          system_id: string
          identifier_system_uri: string
          identifier_type: string
          external_id_value: string
          verification_status: string
          is_primary_for_system: boolean
          matched_at: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          system_id: string
          identifier_system_uri: string
          identifier_type?: string
          external_id_value: string
          verification_status?: string
          is_primary_for_system?: boolean
          matched_at?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          system_id?: string
          identifier_system_uri?: string
          identifier_type?: string
          external_id_value?: string
          verification_status?: string
          is_primary_for_system?: boolean
          matched_at?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_external_identifiers_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_external_identifiers_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "healthcare_integration_systems"
            referencedColumns: ["id"]
          }
        ]
      }
      healthcare_data_exchange_transactions: {
        Row: {
          id: string
          system_id: string
          patient_id: string | null
          transaction_type: string
          standard: 'hl7_fhir_r4' | 'hl7_v2' | 'dicom_bridge' | 'rest_json' | 'smart_on_fhir'
          resource_type: string
          payload_hash: string
          status: string
          error_message: string | null
          latency_ms: number
          consent_verified: boolean
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          system_id: string
          patient_id?: string | null
          transaction_type: string
          standard: 'hl7_fhir_r4' | 'hl7_v2' | 'dicom_bridge' | 'rest_json' | 'smart_on_fhir'
          resource_type: string
          payload_hash: string
          status?: string
          error_message?: string | null
          latency_ms?: number
          consent_verified?: boolean
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          system_id?: string
          patient_id?: string | null
          transaction_type?: string
          standard?: 'hl7_fhir_r4' | 'hl7_v2' | 'dicom_bridge' | 'rest_json' | 'smart_on_fhir'
          resource_type?: string
          payload_hash?: string
          status?: string
          error_message?: string | null
          latency_ms?: number
          consent_verified?: boolean
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "healthcare_data_exchange_transactions_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "healthcare_integration_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "healthcare_data_exchange_transactions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
      }
      imported_diagnostic_records: {
        Row: {
          id: string
          patient_id: string
          system_id: string
          external_record_id: string
          record_type: string
          test_or_exam_code: string | null
          test_or_exam_name: string
          modality: string | null
          specimen_type: string | null
          result_value: string | null
          result_unit: string | null
          reference_range: string | null
          status_in_source: string
          clinical_impression: string | null
          performed_at: string | null
          reported_at: string
          clinician_review_status: 'pending_review' | 'verified' | 'reconciled' | 'rejected' | 'archived'
          reviewed_by: string | null
          reviewed_at: string | null
          clinician_action_notes: string | null
          reconciliation_decision: string
          is_suppressed_or_archived: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          system_id: string
          external_record_id: string
          record_type: string
          test_or_exam_code?: string | null
          test_or_exam_name: string
          modality?: string | null
          specimen_type?: string | null
          result_value?: string | null
          result_unit?: string | null
          reference_range?: string | null
          status_in_source?: string
          clinical_impression?: string | null
          performed_at?: string | null
          reported_at: string
          clinician_review_status?: 'pending_review' | 'verified' | 'reconciled' | 'rejected' | 'archived'
          reviewed_by?: string | null
          reviewed_at?: string | null
          clinician_action_notes?: string | null
          reconciliation_decision?: string
          is_suppressed_or_archived?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          system_id?: string
          external_record_id?: string
          record_type?: string
          test_or_exam_code?: string | null
          test_or_exam_name?: string
          modality?: string | null
          specimen_type?: string | null
          result_value?: string | null
          result_unit?: string | null
          reference_range?: string | null
          status_in_source?: string
          clinical_impression?: string | null
          performed_at?: string | null
          reported_at?: string
          clinician_review_status?: 'pending_review' | 'verified' | 'reconciled' | 'rejected' | 'archived'
          reviewed_by?: string | null
          reviewed_at?: string | null
          clinician_action_notes?: string | null
          reconciliation_decision?: string
          is_suppressed_or_archived?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "imported_diagnostic_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_diagnostic_records_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "healthcare_integration_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_diagnostic_records_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      integration_reconciliation_events: {
        Row: {
          id: string
          patient_id: string
          system_id: string
          conflicting_field: string
          authoritative_value: Json
          external_value: Json
          decision: string
          justification: string
          reconciled_by: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          system_id: string
          conflicting_field: string
          authoritative_value: Json
          external_value: Json
          decision: string
          justification: string
          reconciled_by?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          system_id?: string
          conflicting_field?: string
          authoritative_value?: Json
          external_value?: Json
          decision?: string
          justification?: string
          reconciled_by?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_reconciliation_events_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_reconciliation_events_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "healthcare_integration_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_reconciliation_events_reconciled_by_fkey"
            columns: ["reconciled_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      institutional_operational_reports: {
        Row: {
          id: string
          report_reference: string
          facility_id: string | null
          reporting_period_start: string
          reporting_period_end: string
          report_category: string
          title: string
          report_data: Json
          generated_by_user_id: string | null
          user_role: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          report_reference: string
          facility_id?: string | null
          reporting_period_start: string
          reporting_period_end: string
          report_category: string
          title: string
          report_data?: Json
          generated_by_user_id?: string | null
          user_role?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          report_reference?: string
          facility_id?: string | null
          reporting_period_start?: string
          reporting_period_end?: string
          report_category?: string
          title?: string
          report_data?: Json
          generated_by_user_id?: string | null
          user_role?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institutional_operational_reports_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "healthcare_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institutional_operational_reports_generated_by_user_id_fkey"
            columns: ["generated_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      facility_performance_benchmarks: {
        Row: {
          id: string
          facility_id: string
          benchmark_date: string
          facility_tier: string
          patient_registration_volume: number
          assessments_initiated: number
          assessments_completed: number
          assessment_completion_rate: number
          mean_processing_time_hours: number
          mean_review_turnaround_hours: number
          referrals_initiated: number
          referrals_completed: number
          referral_completion_rate: number
          active_workers_count: number
          data_completeness_pct: number
          composite_operational_index: number
          benchmarked_against: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          benchmark_date: string
          facility_tier: string
          patient_registration_volume?: number
          assessments_initiated?: number
          assessments_completed?: number
          assessment_completion_rate?: number
          mean_processing_time_hours?: number
          mean_review_turnaround_hours?: number
          referrals_initiated?: number
          referrals_completed?: number
          referral_completion_rate?: number
          active_workers_count?: number
          data_completeness_pct?: number
          composite_operational_index?: number
          benchmarked_against?: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          benchmark_date?: string
          facility_tier?: string
          patient_registration_volume?: number
          assessments_initiated?: number
          assessments_completed?: number
          assessment_completion_rate?: number
          mean_processing_time_hours?: number
          mean_review_turnaround_hours?: number
          referrals_initiated?: number
          referrals_completed?: number
          referral_completion_rate?: number
          active_workers_count?: number
          data_completeness_pct?: number
          composite_operational_index?: number
          benchmarked_against?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_performance_benchmarks_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "healthcare_facilities"
            referencedColumns: ["id"]
          }
        ]
      }
      operational_forecasting_records: {
        Row: {
          id: string
          facility_id: string | null
          forecast_generated_at: string
          target_metric: string
          forecast_horizon_days: number
          historical_window_days: number
          forecast_points: Json
          model_type: string
          mean_absolute_error: number
          root_mean_squared_error: number
          mean_absolute_percentage_error: number
          capacity_bottleneck_detected: boolean
          bottleneck_details: Json
          created_at: string
        }
        Insert: {
          id?: string
          facility_id?: string | null
          forecast_generated_at?: string
          target_metric: string
          forecast_horizon_days?: number
          historical_window_days?: number
          forecast_points?: Json
          model_type: string
          mean_absolute_error?: number
          root_mean_squared_error?: number
          mean_absolute_percentage_error?: number
          capacity_bottleneck_detected?: boolean
          bottleneck_details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string | null
          forecast_generated_at?: string
          target_metric?: string
          forecast_horizon_days?: number
          historical_window_days?: number
          forecast_points?: Json
          model_type?: string
          mean_absolute_error?: number
          root_mean_squared_error?: number
          mean_absolute_percentage_error?: number
          capacity_bottleneck_detected?: boolean
          bottleneck_details?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operational_forecasting_records_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "healthcare_facilities"
            referencedColumns: ["id"]
          }
        ]
      }
      custom_report_templates: {
        Row: {
          id: string
          template_name: string
          category: string
          configuration: Json
          created_by_user_id: string | null
          facility_id: string | null
          is_institutional_shared: boolean
          created_at: string
        }
        Insert: {
          id?: string
          template_name: string
          category: string
          configuration?: Json
          created_by_user_id?: string | null
          facility_id?: string | null
          is_institutional_shared?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          template_name?: string
          category?: string
          configuration?: Json
          created_by_user_id?: string | null
          facility_id?: string | null
          is_institutional_shared?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_report_templates_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_report_templates_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "healthcare_facilities"
            referencedColumns: ["id"]
          }
        ]
      }
      regional_healthcare_networks: {
        Row: {
          id: string
          network_code: string
          network_name: string
          network_name_bn: string
          lead_hub_facility_id: string | null
          division: string
          coverage_districts: string[]
          tier: string
          status: string
          operational_settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          network_code: string
          network_name: string
          network_name_bn: string
          lead_hub_facility_id?: string | null
          division: string
          coverage_districts?: string[]
          tier: string
          status?: string
          operational_settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          network_code?: string
          network_name?: string
          network_name_bn?: string
          lead_hub_facility_id?: string | null
          division?: string
          coverage_districts?: string[]
          tier?: string
          status?: string
          operational_settings?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regional_healthcare_networks_lead_hub_facility_id_fkey"
            columns: ["lead_hub_facility_id"]
            isOneToOne: false
            referencedRelation: "healthcare_facilities"
            referencedColumns: ["id"]
          }
        ]
      }
      facility_network_memberships: {
        Row: {
          id: string
          network_id: string
          facility_id: string
          member_role: string
          cross_facility_sharing_enabled: boolean
          status: string
          joined_at: string
        }
        Insert: {
          id?: string
          network_id: string
          facility_id: string
          member_role: string
          cross_facility_sharing_enabled?: boolean
          status?: string
          joined_at?: string
        }
        Update: {
          id?: string
          network_id?: string
          facility_id?: string
          member_role?: string
          cross_facility_sharing_enabled?: boolean
          status?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_network_memberships_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "regional_healthcare_networks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_network_memberships_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "healthcare_facilities"
            referencedColumns: ["id"]
          }
        ]
      }
      regional_facility_onboarding_records: {
        Row: {
          id: string
          facility_id: string
          dghs_facility_code: string
          division: string
          district: string
          upazila: string
          facility_tier: string
          onboarding_status: string
          readiness_score: number
          checklist_items: Json
          primary_admin_user_id: string | null
          verified_by_user_id: string | null
          verified_at: string | null
          activated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          dghs_facility_code: string
          division: string
          district: string
          upazila: string
          facility_tier: string
          onboarding_status?: string
          readiness_score?: number
          checklist_items?: Json
          primary_admin_user_id?: string | null
          verified_by_user_id?: string | null
          verified_at?: string | null
          activated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          dghs_facility_code?: string
          division?: string
          district?: string
          upazila?: string
          facility_tier?: string
          onboarding_status?: string
          readiness_score?: number
          checklist_items?: Json
          primary_admin_user_id?: string | null
          verified_by_user_id?: string | null
          verified_at?: string | null
          activated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regional_facility_onboarding_records_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "healthcare_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regional_facility_onboarding_records_primary_admin_user_id_fkey"
            columns: ["primary_admin_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regional_facility_onboarding_records_verified_by_user_id_fkey"
            columns: ["verified_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      network_cross_facility_access_logs: {
        Row: {
          id: string
          requesting_facility_id: string
          originating_facility_id: string
          patient_id: string
          accessor_user_id: string
          accessor_role: string
          access_purpose: string
          consent_code_verified: string
          is_authorized: boolean
          accessed_at: string
        }
        Insert: {
          id?: string
          requesting_facility_id: string
          originating_facility_id: string
          patient_id: string
          accessor_user_id: string
          accessor_role: string
          access_purpose: string
          consent_code_verified?: string
          is_authorized?: boolean
          accessed_at?: string
        }
        Update: {
          id?: string
          requesting_facility_id?: string
          originating_facility_id?: string
          patient_id?: string
          accessor_user_id?: string
          accessor_role?: string
          access_purpose?: string
          consent_code_verified?: string
          is_authorized?: boolean
          accessed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "network_cross_facility_access_logs_requesting_facility_id_fkey"
            columns: ["requesting_facility_id"]
            isOneToOne: false
            referencedRelation: "healthcare_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_cross_facility_access_logs_originating_facility_id_fkey"
            columns: ["originating_facility_id"]
            isOneToOne: false
            referencedRelation: "healthcare_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_cross_facility_access_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_cross_facility_access_logs_accessor_user_id_fkey"
            columns: ["accessor_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      nationwide_service_health_incidents: {
        Row: {
          id: string
          subsystem: string
          region_or_facility: string
          health_status: string
          incident_description: string
          latency_ms: number
          is_resolved: boolean
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subsystem: string
          region_or_facility?: string
          health_status: string
          incident_description: string
          latency_ms?: number
          is_resolved?: boolean
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          subsystem?: string
          region_or_facility?: string
          health_status?: string
          incident_description?: string
          latency_ms?: number
          is_resolved?: boolean
          resolved_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      international_countries: {
        Row: {
          id: string
          country_code: string
          iso_alpha3: string
          numeric_code: string
          name_en: string
          name_native: string
          official_languages: string[]
          supported_locales: string[]
          default_locale: string
          time_zones: string[]
          date_format: string
          time_format: string
          measurement_system: string
          currency_code: string
          currency_symbol: string
          geographic_hierarchy_levels: Record<string, unknown>[]
          environmental_provider: string
          status: string
          is_default: boolean
          regulatory_framework: string
          data_residency_required: boolean
          data_residency_region: string | null
          clinical_execution_enabled: boolean
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          country_code: string
          iso_alpha3: string
          numeric_code: string
          name_en: string
          name_native: string
          official_languages?: string[]
          supported_locales?: string[]
          default_locale?: string
          time_zones?: string[]
          date_format?: string
          time_format?: string
          measurement_system?: string
          currency_code?: string
          currency_symbol?: string
          geographic_hierarchy_levels?: Record<string, unknown>[]
          environmental_provider?: string
          status?: string
          is_default?: boolean
          regulatory_framework?: string
          data_residency_required?: boolean
          data_residency_region?: string | null
          clinical_execution_enabled?: boolean
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          country_code?: string
          iso_alpha3?: string
          numeric_code?: string
          name_en?: string
          name_native?: string
          official_languages?: string[]
          supported_locales?: string[]
          default_locale?: string
          time_zones?: string[]
          date_format?: string
          time_format?: string
          measurement_system?: string
          currency_code?: string
          currency_symbol?: string
          geographic_hierarchy_levels?: Record<string, unknown>[]
          environmental_provider?: string
          status?: string
          is_default?: boolean
          regulatory_framework?: string
          data_residency_required?: boolean
          data_residency_region?: string | null
          clinical_execution_enabled?: boolean
          version?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      country_clinical_guidelines: {
        Row: {
          id: string
          country_code: string
          guideline_key: string
          title: string
          title_native: string
          source_organization: string
          publication_year: number
          effective_date: string
          review_cycle_months: number
          intended_population: string
          clinical_scope: string[]
          approval_status: string
          approved_by_board_at: string | null
          approved_by_board_reference: string | null
          risk_estimation_model_allowed: boolean
          screening_eligibility_criteria: Record<string, unknown>
          referral_pathway_specification: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          country_code: string
          guideline_key: string
          title: string
          title_native: string
          source_organization: string
          publication_year: number
          effective_date: string
          review_cycle_months?: number
          intended_population: string
          clinical_scope?: string[]
          approval_status?: string
          approved_by_board_at?: string | null
          approved_by_board_reference?: string | null
          risk_estimation_model_allowed?: boolean
          screening_eligibility_criteria?: Record<string, unknown>
          referral_pathway_specification?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          country_code?: string
          guideline_key?: string
          title?: string
          title_native?: string
          source_organization?: string
          publication_year?: number
          effective_date?: string
          review_cycle_months?: number
          intended_population?: string
          clinical_scope?: string[]
          approval_status?: string
          approved_by_board_at?: string | null
          approved_by_board_reference?: string | null
          risk_estimation_model_allowed?: boolean
          screening_eligibility_criteria?: Record<string, unknown>
          referral_pathway_specification?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      country_regulatory_privacy_profiles: {
        Row: {
          id: string
          country_code: string
          data_protection_act_name: string
          legal_verification_status: string
          consent_model: string
          patient_data_retention_years: number
          cross_border_transfer_allowed: boolean
          cross_border_safeguards: string | null
          patient_export_rights_supported: boolean
          patient_deletion_rights_supported: boolean
          breach_notification_window_hours: number
          privacy_officer_contact: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          country_code: string
          data_protection_act_name: string
          legal_verification_status?: string
          consent_model?: string
          patient_data_retention_years?: number
          cross_border_transfer_allowed?: boolean
          cross_border_safeguards?: string | null
          patient_export_rights_supported?: boolean
          patient_deletion_rights_supported?: boolean
          breach_notification_window_hours?: number
          privacy_officer_contact?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          country_code?: string
          data_protection_act_name?: string
          legal_verification_status?: string
          consent_model?: string
          patient_data_retention_years?: number
          cross_border_transfer_allowed?: boolean
          cross_border_safeguards?: string | null
          patient_export_rights_supported?: boolean
          patient_deletion_rights_supported?: boolean
          breach_notification_window_hours?: number
          privacy_officer_contact?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      country_geographic_administrative_nodes: {
        Row: {
          id: string
          country_code: string
          node_code: string
          name_en: string
          name_native: string
          level: number
          parent_node_code: string | null
          latitude: number | null
          longitude: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          country_code: string
          node_code: string
          name_en: string
          name_native: string
          level: number
          parent_node_code?: string | null
          latitude?: number | null
          longitude?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          country_code?: string
          node_code?: string
          name_en?: string
          name_native?: string
          level?: number
          parent_node_code?: string | null
          latitude?: number | null
          longitude?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      country_onboarding_readiness_profiles: {
        Row: {
          id: string
          country_code: string
          step_number: number
          step_name: string
          category: string
          is_completed: boolean
          verification_notes: string | null
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          country_code: string
          step_number: number
          step_name: string
          category: string
          is_completed?: boolean
          verification_notes?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          country_code?: string
          step_number?: number
          step_name?: string
          category?: string
          is_completed?: boolean
          verification_notes?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cross_border_access_audit_logs: {
        Row: {
          id: string
          requesting_country: string
          target_patient_country: string
          patient_id: string
          accessor_user_id: string
          accessor_role: string
          jurisdiction_legal_basis: string
          is_authorized: boolean
          denial_reason: string | null
          logged_at: string
        }
        Insert: {
          id?: string
          requesting_country: string
          target_patient_country: string
          patient_id: string
          accessor_user_id: string
          accessor_role: string
          jurisdiction_legal_basis: string
          is_authorized: boolean
          denial_reason?: string | null
          logged_at?: string
        }
        Update: {
          id?: string
          requesting_country?: string
          target_patient_country?: string
          patient_id?: string
          accessor_user_id?: string
          accessor_role?: string
          jurisdiction_legal_basis?: string
          is_authorized?: boolean
          denial_reason?: string | null
          logged_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      current_profile_id: {
        Args: Record<string, never>
        Returns: string
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      account_status: AccountStatus
      user_role: UserRole
    }
    CompositeTypes: Record<string, never>
  }
}
