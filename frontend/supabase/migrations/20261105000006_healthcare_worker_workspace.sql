-- ==============================================================================
-- Lungent Platform Migration: Healthcare Worker Workspace & Field Operations
-- Milestone: Phase 1.10
-- ==============================================================================

-- 1. Healthcare Worker Workspace Preferences Table
CREATE TABLE IF NOT EXISTS public.worker_workspace_preferences (
    user_id uuid PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    active_facility_id text NOT NULL DEFAULT 'facility-dhaka-central',
    dashboard_view text NOT NULL DEFAULT 'standard' CHECK (dashboard_view IN ('standard', 'compact', 'field_triage')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Patient to Healthcare Worker Assignments Table
CREATE TABLE IF NOT EXISTS public.worker_patient_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    facility_id text NOT NULL,
    assignment_role text NOT NULL DEFAULT 'primary_chw' CHECK (assignment_role IN ('primary_chw', 'case_worker', 'intake_specialist', 'care_coordinator')),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred', 'completed')),
    notes text,
    assigned_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_worker_patient_facility UNIQUE (worker_id, patient_id, facility_id)
);

CREATE INDEX IF NOT EXISTS idx_worker_assignments_worker ON public.worker_patient_assignments(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_assignments_patient ON public.worker_patient_assignments(patient_id);
CREATE INDEX IF NOT EXISTS idx_worker_assignments_facility ON public.worker_patient_assignments(facility_id);

-- 3. Patient Information Completion Tracking Table
CREATE TABLE IF NOT EXISTS public.patient_completion_status (
    patient_id uuid PRIMARY KEY REFERENCES public.patients(id) ON DELETE CASCADE,
    completion_score integer NOT NULL DEFAULT 0 CHECK (completion_score >= 0 AND completion_score <= 100),
    missing_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
    status text NOT NULL DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'partially_complete', 'complete')),
    last_calculated_at timestamptz NOT NULL DEFAULT now(),
    evaluated_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_completion_score ON public.patient_completion_status(completion_score);
CREATE INDEX IF NOT EXISTS idx_patient_completion_status ON public.patient_completion_status(status);

-- 4. Healthcare Worker Operational Tasks Table
CREATE TABLE IF NOT EXISTS public.worker_operational_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
    facility_id text NOT NULL,
    task_type text NOT NULL CHECK (task_type IN ('intake_completion', 'assessment_initiation', 'measurement_recording', 'contact_verification', 'followup_call')),
    priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
    title text NOT NULL,
    title_bn text,
    description text,
    due_date date,
    completed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_worker_tasks_worker ON public.worker_operational_tasks(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_tasks_patient ON public.worker_operational_tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_worker_tasks_status ON public.worker_operational_tasks(status);
CREATE INDEX IF NOT EXISTS idx_worker_tasks_priority ON public.worker_operational_tasks(priority);

-- 5. Healthcare Worker Recent Activities Table
CREATE TABLE IF NOT EXISTS public.worker_recent_activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    facility_id text NOT NULL,
    patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
    activity_type text NOT NULL CHECK (activity_type IN ('patient_registered', 'health_record_updated', 'assessment_initiated', 'task_completed', 'patient_viewed')),
    summary text NOT NULL,
    summary_bn text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_worker_activities_worker ON public.worker_recent_activities(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_activities_patient ON public.worker_recent_activities(patient_id);
CREATE INDEX IF NOT EXISTS idx_worker_activities_created ON public.worker_recent_activities(created_at DESC);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.worker_workspace_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_patient_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_completion_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_operational_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_recent_activities ENABLE ROW LEVEL SECURITY;

-- 1. Worker Workspace Preferences RLS
CREATE POLICY "Users can manage own workspace preferences"
    ON public.worker_workspace_preferences FOR ALL TO authenticated
    USING (user_id = public.current_profile_id())
    WITH CHECK (user_id = public.current_profile_id());

-- 2. Worker Patient Assignments RLS
CREATE POLICY "Workers and clinicians can view patient assignments"
    ON public.worker_patient_assignments FOR SELECT TO authenticated
    USING (
        worker_id = public.current_profile_id()
        OR public.can_access_patient(patient_id)
        OR public.is_admin()
    );

CREATE POLICY "Authorized staff can manage patient assignments"
    ON public.worker_patient_assignments FOR ALL TO authenticated
    USING (
        public.is_admin()
        OR public.user_has_permission('patient.write'::text)
    );

-- 3. Patient Completion Status RLS
CREATE POLICY "Authorized staff can view patient completion status"
    ON public.patient_completion_status FOR SELECT TO authenticated
    USING (public.can_access_patient(patient_id));

CREATE POLICY "Authorized staff can update patient completion status"
    ON public.patient_completion_status FOR ALL TO authenticated
    USING (public.can_access_patient(patient_id))
    WITH CHECK (public.can_access_patient(patient_id));

-- 4. Worker Operational Tasks RLS
CREATE POLICY "Workers can view assigned operational tasks"
    ON public.worker_operational_tasks FOR SELECT TO authenticated
    USING (
        worker_id = public.current_profile_id()
        OR (patient_id IS NOT NULL AND public.can_access_patient(patient_id))
        OR public.is_admin()
    );

CREATE POLICY "Workers and staff can manage operational tasks"
    ON public.worker_operational_tasks FOR ALL TO authenticated
    USING (
        worker_id = public.current_profile_id()
        OR public.is_admin()
    );

-- 5. Worker Recent Activities RLS
CREATE POLICY "Workers can view own operational activities"
    ON public.worker_recent_activities FOR SELECT TO authenticated
    USING (
        worker_id = public.current_profile_id()
        OR public.is_admin()
    );

CREATE POLICY "Workers can record operational activities"
    ON public.worker_recent_activities FOR INSERT TO authenticated
    WITH CHECK (worker_id = public.current_profile_id());
