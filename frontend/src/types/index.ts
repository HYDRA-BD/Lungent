export type UserRole =
  | 'patient'
  | 'healthcare_worker'
  | 'clinician'
  | 'administrator'

export type AccountStatus =
  | 'pending_verification'
  | 'active'
  | 'suspended'
  | 'deactivated'

export type SupportedLocale = 'en' | 'bn'

export interface AppConfig {
  name: string
  version: string
  description: string
  defaultLocale: SupportedLocale
  supportedLocales: readonly SupportedLocale[]
}

export interface UserProfile {
  id: string
  auth_user_id: string
  full_name: string
  email: string
  phone_number: string | null
  preferred_language: SupportedLocale
  profile_image_url: string | null
  status: AccountStatus
  created_at: string
  updated_at: string
}

export interface UserWithRoles extends UserProfile {
  roles: UserRole[]
  permissions: string[]
  facilities: {
    facility_id: string
    facility_role: string
    is_primary: boolean
  }[]
}

export * from './database'
