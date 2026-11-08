import { describe, it, expect, beforeEach } from 'vitest'
import { register, login } from '@/modules/authentication/service'
import { ACTIVE_ACCESS_ROLES } from '@/modules/authentication/validation'

describe('Strict Role-Based Authentication & Manual Sign-In Verification', () => {
  it('exposes exactly 3 active access roles', () => {
    expect(ACTIVE_ACCESS_ROLES).toHaveLength(3)
    expect(ACTIVE_ACCESS_ROLES).toEqual(['General User', 'AI Builders Congress', 'Admin'])
    expect(ACTIVE_ACCESS_ROLES).not.toContain('Clinician')
    expect(ACTIVE_ACCESS_ROLES).not.toContain('Health Worker')
    expect(ACTIVE_ACCESS_ROLES).not.toContain('Governance')
  })

  describe('Task 1: Enforce manual sign-in after registration', () => {
    it('successfully registers an account and returns prompt to sign in manually', async () => {
      const email = `newpatient-${Date.now()}@example.com`
      const res = await register({
        fullName: 'Jane Doe',
        email,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'General User',
        preferredLanguage: 'en',
        acceptTerms: true,
      })

      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.message).toBe('Account created successfully. Please sign in.')
        expect(res.data.role).toBe('General User')
      }
    })
  })

  describe('Task 4 & 5: Role mismatch prevention and enforcement', () => {
    it('allows login when selected role matches registered account role', async () => {
      const email = `matched-user-${Date.now()}@example.com`
      // 1. Register as General User
      const regRes = await register({
        fullName: 'John Match',
        email,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'General User',
        preferredLanguage: 'en',
        acceptTerms: true,
      })
      expect(regRes.success).toBe(true)

      // 2. Login selecting General User
      const loginRes = await login({
        email,
        password: 'Password123!',
        role: 'General User',
      })

      expect(loginRes.success).toBe(true)
      if (loginRes.success) {
        expect(loginRes.data.role).toBe('General User')
        expect(loginRes.data.defaultWorkspace).toBe('/ai-assessment')
      }
    })

    it('rejects login when user selects Admin but account is General User', async () => {
      const email = `mismatch-user-${Date.now()}@example.com`
      // 1. Register as General User
      await register({
        fullName: 'Alice Patient',
        email,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'General User',
        preferredLanguage: 'en',
        acceptTerms: true,
      })

      // 2. Attempt login selecting Admin
      const loginRes = await login({
        email,
        password: 'Password123!',
        role: 'Admin',
      })

      expect(loginRes.success).toBe(false)
      if (!loginRes.success) {
        expect(loginRes.error).toBe('Selected role does not match account permissions.')
        expect(loginRes.code).toBe('ROLE_MISMATCH')
      }
    })

    it('rejects login when user selects General User for an Admin account', async () => {
      const loginRes = await login({
        email: 'admin@lungent.org',
        password: 'AdminPassword123!',
        role: 'General User',
      })

      expect(loginRes.success).toBe(false)
      if (!loginRes.success) {
        expect(loginRes.error).toBe('Selected role does not match account permissions.')
        expect(loginRes.code).toBe('ROLE_MISMATCH')
      }
    })

    it('allows Admin login when Admin role is selected', async () => {
      const loginRes = await login({
        email: 'admin@lungent.org',
        password: 'AdminPassword123!',
        role: 'Admin',
      })

      expect(loginRes.success).toBe(true)
      if (loginRes.success) {
        expect(loginRes.data.role).toBe('Admin')
        expect(loginRes.data.defaultWorkspace).toBe('/portal/admin')
      }
    })

    it('allows AI Builders Congress login when correct role is selected', async () => {
      const loginRes = await login({
        email: 'congress@lungent.org',
        password: 'CongressPassword123!',
        role: 'AI Builders Congress',
      })

      expect(loginRes.success).toBe(true)
      if (loginRes.success) {
        expect(loginRes.data.role).toBe('AI Builders Congress')
        expect(loginRes.data.defaultWorkspace).toBe('/portal/admin')
      }
    })
  })
})
