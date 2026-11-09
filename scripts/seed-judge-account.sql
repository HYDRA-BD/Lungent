-- ==============================================================================
-- Lungent Platform: Provisioning SQL Snippet for AI Builders Congress Judge
-- Paste and run this script directly inside your Supabase Dashboard -> SQL Editor
-- ==============================================================================

DO $$
DECLARE
  target_email text := 'aibuilderscongress@aibc.com';
  target_pass  text := '!A1i9n7k1';
  target_role  text := 'AI Builders Congress';
  user_id      uuid;
  profile_id   uuid;
BEGIN
  -- 1. Check if user already exists in auth.users
  SELECT id INTO user_id FROM auth.users WHERE email = target_email;

  IF user_id IS NULL THEN
    user_id := gen_random_uuid();

    -- Insert confirmed user into auth.users with cryptographically hashed password
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token
    ) VALUES (
      user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      target_email,
      crypt(target_pass, gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      jsonb_build_object(
        'role', target_role,
        'full_name', 'AI Builders Congress Judge',
        'is_verified', true
      ),
      now(),
      now(),
      ''
    );

    RAISE NOTICE 'Created auth.users record for % (UUID: %)', target_email, user_id;
  ELSE
    -- Update existing user metadata and password
    UPDATE auth.users
    SET 
      encrypted_password = crypt(target_pass, gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
        'role', target_role,
        'full_name', 'AI Builders Congress Judge',
        'is_verified', true
      ),
      updated_at = now()
    WHERE id = user_id;

    RAISE NOTICE 'Updated existing auth.users record for % (UUID: %)', target_email, user_id;
  END IF;

  -- 2. Ensure record exists in user_profiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    SELECT id INTO profile_id FROM public.user_profiles WHERE auth_user_id = user_id;
    
    IF profile_id IS NULL THEN
      INSERT INTO public.user_profiles (
        auth_user_id,
        full_name,
        email,
        status,
        preferred_language
      ) VALUES (
        user_id,
        'AI Builders Congress Judge',
        target_email,
        'active',
        'en'
      ) RETURNING id INTO profile_id;
    END IF;

    -- 3. Ensure role mapping in user_roles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
      INSERT INTO public.user_roles (user_id, role_id)
      VALUES (profile_id, 'administrator')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

END $$;

-- Verify creation:
SELECT id, email, raw_user_meta_data->>'role' as role, email_confirmed_at
FROM auth.users
WHERE email = 'aibuilderscongress@aibc.com';
