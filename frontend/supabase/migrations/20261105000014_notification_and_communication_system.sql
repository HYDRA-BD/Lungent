-- ====================================================================
-- Phase 1.19: Notification and Communication System Schema Migration
-- ====================================================================

-- 1. Notification Categories
DO $$ BEGIN
    CREATE TYPE public.notification_category AS ENUM (
        'account',
        'assessment',
        'clinical_review',
        'referral',
        'follow_up',
        'healthcare_worker',
        'urgent_workflow'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Notification Channels
DO $$ BEGIN
    CREATE TYPE public.notification_channel AS ENUM (
        'in_app',
        'sms',
        'email'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Notification Priority
DO $$ BEGIN
    CREATE TYPE public.notification_priority AS ENUM (
        'urgent',
        'high',
        'normal',
        'low'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Notification Lifecycle Status
DO $$ BEGIN
    CREATE TYPE public.notification_lifecycle_status AS ENUM (
        'pending',
        'processing',
        'processed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Channel Delivery Lifecycle Status
DO $$ BEGIN
    CREATE TYPE public.delivery_lifecycle_status AS ENUM (
        'queued',
        'sent_to_provider',
        'delivered',
        'failed',
        'bounced',
        'rejected',
        'unknown'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Centralized App Notifications Table
CREATE TABLE IF NOT EXISTS public.app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key VARCHAR(120) UNIQUE,
    recipient_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    category public.notification_category NOT NULL,
    priority public.notification_priority NOT NULL DEFAULT 'normal',
    title VARCHAR(255) NOT NULL,
    title_bn VARCHAR(255),
    body TEXT NOT NULL,
    body_bn TEXT,
    action_url VARCHAR(500),
    source_module VARCHAR(60) NOT NULL,
    source_reference_id VARCHAR(100),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    requires_acknowledgement BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    lifecycle_status public.notification_lifecycle_status NOT NULL DEFAULT 'pending',
    scheduled_for TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.app_notifications(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_patient ON public.app_notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON public.app_notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.app_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON public.app_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notifications_idempotency ON public.app_notifications(idempotency_key);

-- 7. Channel Delivery Tracking Table
CREATE TABLE IF NOT EXISTS public.notification_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES public.app_notifications(id) ON DELETE CASCADE,
    channel public.notification_channel NOT NULL,
    recipient_target VARCHAR(255) NOT NULL, -- normalized phone (+880...), email, or user id
    delivery_status public.delivery_lifecycle_status NOT NULL DEFAULT 'queued',
    provider_name VARCHAR(60),
    provider_message_id VARCHAR(255),
    attempts_count INT NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    error_message TEXT,
    error_code VARCHAR(60),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_deliveries_notification ON public.notification_deliveries(notification_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.notification_deliveries(delivery_status);
CREATE INDEX IF NOT EXISTS idx_deliveries_channel ON public.notification_deliveries(channel);
CREATE INDEX IF NOT EXISTS idx_deliveries_next_retry ON public.notification_deliveries(next_retry_at);

-- 8. User Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    assessment_updates BOOLEAN NOT NULL DEFAULT TRUE,
    referral_updates BOOLEAN NOT NULL DEFAULT TRUE,
    followup_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    urgent_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    preferred_language VARCHAR(5) NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_notif_prefs_user ON public.user_notification_preferences(user_id);

-- 9. Delivery Attempts Audit Trail
CREATE TABLE IF NOT EXISTS public.notification_delivery_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES public.notification_deliveries(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL,
    provider_response_code VARCHAR(60),
    is_successful BOOLEAN NOT NULL,
    error_details TEXT,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_attempts_delivery_id ON public.notification_delivery_attempts(delivery_id);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_attempts ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies

-- Notifications: Users can view notifications sent to their user profile or their patient record
CREATE POLICY "Users view own notifications"
    ON public.app_notifications FOR SELECT TO authenticated
    USING (
        recipient_user_id = auth.uid() OR
        patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()) OR
        public.has_role('admin') OR
        public.has_role('clinician') OR
        public.has_role('healthcare_worker')
    );

-- Notifications: Authorized clinicians & staff can insert or update notifications
CREATE POLICY "Authorized staff manage notifications"
    ON public.app_notifications FOR ALL TO authenticated
    USING (
        public.has_role('admin') OR
        public.has_role('clinician') OR
        public.has_role('healthcare_worker')
    );

-- Deliveries: Administrators and staff can view delivery records
CREATE POLICY "Staff view deliveries"
    ON public.notification_deliveries FOR SELECT TO authenticated
    USING (
        public.has_role('admin') OR
        public.has_role('clinician') OR
        public.has_role('healthcare_worker')
    );

-- Preferences: Users can manage their own preferences
CREATE POLICY "Users manage own notification preferences"
    ON public.user_notification_preferences FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Delivery Attempts: Admins can view audit logs
CREATE POLICY "Admins view delivery attempts"
    ON public.notification_delivery_attempts FOR SELECT TO authenticated
    USING (public.has_role('admin'));
