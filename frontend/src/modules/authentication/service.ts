'use server'

import { createClient as createServerClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileUpdateSchema,
  type RegisterInput,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type ProfileUpdateInput,
} from './validation'
import { logAuditEvent } from './audit'
import { ROLE_PERMISSIONS_MAP } from '@/lib/security/permissions'
import type { UserWithRoles, UserRole } from '@/types'

export type AuthResult<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code?: string; isSuspended?: boolean }

const STATIC_FALLBACK_TIMESTAMP = '2026-01-01T00:00:00.000Z'

function createFallbackUser(id: string, email: string, fullName?: string): UserWithRoles {
  return {
    id,
    auth_user_id: id,
    full_name: fullName || email.split('@')[0].replace(/[._-]/g, ' ') || 'Patient User',
    email,
    phone_number: null,
    profile_image_url: null,
    status: 'active',
    preferred_language: 'en',
    created_at: STATIC_FALLBACK_TIMESTAMP,
    updated_at: STATIC_FALLBACK_TIMESTAMP,
    roles: ['patient'],
    permissions: [...(ROLE_PERMISSIONS_MAP['patient'] || [])],
    facilities: [],
  }
}

/**
 * Registers a new user account with default 'patient' privileges.
 * Privileged roles (clinician, healthcare worker, administrator) can NEVER be selected via registration.
 */
export async function register(input: RegisterInput): Promise<AuthResult<{ userId: string; requiresVerification: boolean }>> {
  const validation = registerSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid registration information',
    }
  }

  const { email, password, fullName, phoneNumber, preferredLanguage } = validation.data

  // If Supabase environment is not configured, supply immediate mock registration
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: {
        userId: 'demo-patient-' + Math.random().toString(36).substring(2, 9),
        requiresVerification: false,
      },
      message: 'Account registered successfully (Demo Mode).',
    }
  }

  try {
    const supabase = await createServerClient()

    // Base URL for email confirmation callback
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const emailRedirectTo = `${siteUrl}/auth/callback?type=signup`

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber || null,
          preferred_language: preferredLanguage,
        },
        emailRedirectTo,
      },
    })

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered')) {
        return {
          success: false,
          error: 'An account with this email address already exists. Please sign in instead.',
          code: 'USER_ALREADY_EXISTS',
        }
      }
      return {
        success: false,
        error: authError.message || 'Unable to complete registration. Please try again.',
        code: authError.code,
      }
    }

    const authUser = authData.user
    if (!authUser) {
      return {
        success: false,
        error: 'Account creation failed unexpectedly. Please try again.',
      }
    }

    // Fallback profile creation if database trigger has not yet executed or is not enabled
    try {
      const admin = createAdminClient()
      const { data: existingProfile } = await admin
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', authUser.id)
        .maybeSingle()

      if (!existingProfile) {
        const { data: newProfile, error: profileErr } = await admin
          .from('user_profiles')
          .insert({
            auth_user_id: authUser.id,
            full_name: fullName,
            email,
            phone_number: phoneNumber || null,
            preferred_language: preferredLanguage as 'en' | 'bn',
            status: authUser.email_confirmed_at ? 'active' : 'pending_verification',
          })
          .select('id')
          .single()

        if (!profileErr && newProfile) {
          await admin.from('user_roles').insert({
            user_id: newProfile.id,
            role_id: 'patient',
          })
        }
      }
    } catch (err) {
      console.warn('[Registration Profile Synchronization Notice]', err)
    }

    await logAuditEvent({
      action: 'user.registered',
      details: { email, preferredLanguage },
    })

    const requiresVerification = !authUser.email_confirmed_at

    return {
      success: true,
      data: {
        userId: authUser.id,
        requiresVerification,
      },
      message: requiresVerification
        ? 'Account created successfully. Please check your email to verify your account.'
        : 'Account created successfully.',
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration service connection error'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Authenticates user credentials and checks account activation status.
 */
export async function login(input: LoginInput): Promise<AuthResult<{ user: UserWithRoles; defaultWorkspace: string }>> {
  const validation = loginSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Please enter a valid email address and password.',
    }
  }

  const { email, password } = validation.data

  // If Supabase environment is not configured, supply immediate mock authenticated session
  if (!isSupabaseConfigured()) {
    const mockUser = createFallbackUser('demo-patient-1', email)
    return {
      success: true,
      data: {
        user: mockUser,
        defaultWorkspace: '/portal/patient',
      },
      message: 'Signed in successfully in demo mode.',
    }
  }

  try {
    const supabase = await createServerClient()

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || 'Invalid email address or password.',
        code: authError?.code || 'INVALID_CREDENTIALS',
      }
    }

    // Fetch application profile & role assignments
    const profileWithRoles = (await getCurrentUserWithRoles()) || createFallbackUser(authData.user.id, email, authData.user.user_metadata?.full_name)

    // Enforce account lifecycle state
    if (profileWithRoles.status === 'suspended') {
      await supabase.auth.signOut()
      await logAuditEvent({
        action: 'user.suspended',
        actorId: profileWithRoles.id,
        details: { reason: 'Login rejected due to suspended account status' },
      })
      return {
        success: false,
        isSuspended: true,
        error: 'Your account has been suspended. Please contact platform administration.',
        code: 'ACCOUNT_SUSPENDED',
      }
    }

    if (profileWithRoles.status === 'deactivated') {
      await supabase.auth.signOut()
      return {
        success: false,
        error: 'This account has been deactivated. Please contact support.',
        code: 'ACCOUNT_DEACTIVATED',
      }
    }

    await logAuditEvent({
      action: 'user.login',
      actorId: profileWithRoles.id,
      targetUserId: profileWithRoles.id,
      details: { email },
    })

    // Determine default workspace landing path based on role hierarchy
    let defaultWorkspace = '/portal/patient'
    if (profileWithRoles.roles.includes('administrator')) {
      defaultWorkspace = '/admin'
    } else if (profileWithRoles.roles.includes('clinician')) {
      defaultWorkspace = '/clinical'
    } else if (profileWithRoles.roles.includes('healthcare_worker')) {
      defaultWorkspace = '/healthcare-worker'
    }

    return {
      success: true,
      data: {
        user: profileWithRoles,
        defaultWorkspace,
      },
      message: 'Login successful.',
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication service error'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Terminates user session securely.
 */
export async function logout(): Promise<AuthResult<void>> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await logAuditEvent({
      action: 'user.logout',
      details: { auth_user_id: user.id },
    })
  }

  await supabase.auth.signOut()
  return { success: true, data: undefined }
}

/**
 * Initiates password recovery workflow.
 * Always returns a generic success message to prevent user enumeration.
 */
export async function requestPasswordReset(input: ForgotPasswordInput): Promise<AuthResult<void>> {
  const validation = forgotPasswordSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: 'Please enter a valid email address.',
    }
  }

  const { email } = validation.data
  const supabase = await createServerClient()

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectTo = `${siteUrl}/reset-password`

  try {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })
    await logAuditEvent({
      action: 'user.password_reset_request',
      details: { email },
    })
  } catch (err) {
    console.warn('[Password Recovery Error]', err)
  }

  return {
    success: true,
    data: undefined,
    message: 'If an account exists for this email, you will receive password reset instructions shortly.',
  }
}

/**
 * Completes password reset with new validated credentials.
 */
export async function resetPassword(input: ResetPasswordInput): Promise<AuthResult<void>> {
  const validation = resetPasswordSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid password format.',
    }
  }

  const { password } = validation.data
  const supabase = await createServerClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return {
      success: false,
      error: error.message || 'Unable to update password. Recovery link may have expired.',
    }
  }

  await logAuditEvent({
    action: 'user.password_reset_completed',
    details: {},
  })

  return {
    success: true,
    data: undefined,
    message: 'Your password has been successfully reset. You may now sign in.',
  }
}

/**
 * Resends email verification confirmation link.
 */
export async function resendVerification(email: string): Promise<AuthResult<void>> {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed || !trimmed.includes('@')) {
    return { success: false, error: 'Please provide a valid email address.' }
  }

  const supabase = await createServerClient()
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: trimmed,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?type=signup`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    data: undefined,
    message: 'Verification email resent successfully. Please check your inbox.',
  }
}

/**
 * Retrieves the currently authenticated user with their profile, assigned roles,
 * aggregated permissions, and facility memberships.
 */
export async function getCurrentUserWithRoles(): Promise<UserWithRoles | null> {
  if (!isSupabaseConfigured()) {
    return createFallbackUser('demo-patient-1', 'patient@lungent.org', 'Demo Patient')
  }

  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Query profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!profile) {
      return createFallbackUser(user.id, user.email || '', user.user_metadata?.full_name)
    }

    // Query user roles
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', profile.id)

    const roles: UserRole[] = (rolesData || []).map((r) => r.role_id as UserRole)
    if (roles.length === 0) {
      roles.push('patient') // default fallback
    }

    // Aggregate permissions from roles
    const permissionSet = new Set<string>()
    for (const role of roles) {
      const perms = ROLE_PERMISSIONS_MAP[role] || []
      perms.forEach((p) => permissionSet.add(p))
    }

    // Query facility memberships
    const { data: facilitiesData } = await supabase
      .from('user_facility_memberships')
      .select('facility_id, facility_role, is_primary')
      .eq('user_id', profile.id)

    return {
      ...profile,
      roles,
      permissions: Array.from(permissionSet),
      facilities: facilitiesData || [],
    }
  } catch {
    return null
  }
}

/**
 * Updates permitted user profile fields (cannot modify status, auth_user_id, or roles).
 */
export async function updateProfile(input: ProfileUpdateInput): Promise<AuthResult<void>> {
  const validation = profileUpdateSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid profile information.',
    }
  }

  const currentUser = await getCurrentUserWithRoles()
  if (!currentUser) {
    return { success: false, error: 'Unauthorized.' }
  }

  const { fullName, phoneNumber, preferredLanguage } = validation.data
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('user_profiles')
    .update({
      full_name: fullName,
      phone_number: phoneNumber || null,
      preferred_language: preferredLanguage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', currentUser.id)

  if (error) {
    return { success: false, error: error.message }
  }

  await logAuditEvent({
    action: 'user.profile_updated',
    actorId: currentUser.id,
    targetUserId: currentUser.id,
    details: { fullName, preferredLanguage },
  })

  return {
    success: true,
    data: undefined,
    message: 'Profile updated successfully.',
  }
}
