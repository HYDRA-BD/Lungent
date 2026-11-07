-- Lungent pgTAP Foundation & Phase 1.3 Authentication Test Suite
-- Executes with `supabase test db`

BEGIN;
SELECT plan(22);

-- 1 & 2: Required PostgreSQL extensions
SELECT has_extension('uuid-ossp', 'Extension uuid-ossp should be enabled');
SELECT has_extension('pgcrypto', 'Extension pgcrypto should be enabled');

-- 3 to 9: Schema table existence verification
SELECT has_table('roles', 'Table public.roles should exist');
SELECT has_table('permissions', 'Table public.permissions should exist');
SELECT has_table('role_permissions', 'Table public.role_permissions should exist');
SELECT has_table('user_profiles', 'Table public.user_profiles should exist');
SELECT has_table('user_roles', 'Table public.user_roles should exist');
SELECT has_table('user_facility_memberships', 'Table public.user_facility_memberships should exist');
SELECT has_table('audit_logs', 'Table public.audit_logs should exist');

-- 10 to 16: Row Level Security (RLS) enforcement verification
SELECT table_privs_are('public', 'roles', 'authenticated', ARRAY['SELECT'], 'Roles table should permit SELECT to authenticated users');
SELECT results_eq('SELECT rowsecurity FROM pg_tables WHERE schemaname = ''public'' AND tablename = ''roles''', ARRAY[true], 'RLS must be enabled on roles');
SELECT results_eq('SELECT rowsecurity FROM pg_tables WHERE schemaname = ''public'' AND tablename = ''permissions''', ARRAY[true], 'RLS must be enabled on permissions');
SELECT results_eq('SELECT rowsecurity FROM pg_tables WHERE schemaname = ''public'' AND tablename = ''role_permissions''', ARRAY[true], 'RLS must be enabled on role_permissions');
SELECT results_eq('SELECT rowsecurity FROM pg_tables WHERE schemaname = ''public'' AND tablename = ''user_profiles''', ARRAY[true], 'RLS must be enabled on user_profiles');
SELECT results_eq('SELECT rowsecurity FROM pg_tables WHERE schemaname = ''public'' AND tablename = ''user_roles''', ARRAY[true], 'RLS must be enabled on user_roles');
SELECT results_eq('SELECT rowsecurity FROM pg_tables WHERE schemaname = ''public'' AND tablename = ''audit_logs''', ARRAY[true], 'RLS must be enabled on audit_logs');

-- 17 & 18: Baseline seeds verification
SELECT results_eq('SELECT count(*)::integer FROM public.roles', ARRAY[4], 'Should have 4 seeded baseline roles (patient, healthcare_worker, clinician, administrator)');
SELECT results_eq('SELECT count(*)::integer FROM public.permissions', ARRAY[14], 'Should have 14 seeded granular application permissions');

-- 19 & 20: Security helper functions
SELECT has_function('current_profile_id', 'Helper function current_profile_id() must exist');
SELECT has_function('is_admin', 'Helper function is_admin() must exist');

-- 21 & 22: Enums
SELECT has_type('user_role', 'Enum type user_role must exist');
SELECT has_type('account_status', 'Enum type account_status must exist');

SELECT * FROM finish();
ROLLBACK;
