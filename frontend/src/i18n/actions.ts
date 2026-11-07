'use server'

import { cookies } from 'next/headers'
import { getCurrentUserWithRoles, updateProfile } from '@/modules/authentication/service'
import type { SupportedLocale } from './config'
import { isSupportedLocale, DEFAULT_LOCALE } from './config'

export async function setLocalePreferenceAction(locale: SupportedLocale) {
  if (!isSupportedLocale(locale)) {
    return { success: false, error: 'Unsupported locale' }
  }

  const cookieStore = await cookies()
  cookieStore.set('lungent_locale', locale, {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax',
  })

  // Synchronize authenticated user profile if logged in
  try {
    const user = await getCurrentUserWithRoles()
    if (user && user.full_name) {
      await updateProfile({
        fullName: user.full_name,
        phoneNumber: user.phone_number || undefined,
        preferredLanguage: locale,
      })
    }
  } catch {
    // Guest / unauthenticated context: cookie persistence is sufficient
  }

  return { success: true, locale }
}

export async function getServerLocale(): Promise<SupportedLocale> {
  try {
    const cookieStore = await cookies()
    const val = cookieStore.get('lungent_locale')?.value
    if (val && isSupportedLocale(val)) {
      return val
    }
  } catch {
    // Prerender or static generation context fallback
  }
  return DEFAULT_LOCALE
}
