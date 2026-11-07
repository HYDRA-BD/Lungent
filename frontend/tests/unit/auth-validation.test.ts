import { describe, it, expect } from 'vitest'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileUpdateSchema,
  PASSWORD_REGEX,
} from '@/modules/authentication/validation'

describe('Authentication Zod Validation Schemas', () => {
  describe('Password Complexity Regex', () => {
    it('accepts compliant passwords with uppercase, lowercase, digits, and special characters', () => {
      expect(PASSWORD_REGEX.test('Lungent@2026!')).toBe(true)
      expect(PASSWORD_REGEX.test('Str0ngP@ssword#')).toBe(true)
      expect(PASSWORD_REGEX.test('Clin1cal$Safe')).toBe(true)
    })

    it('rejects passwords failing complexity rules', () => {
      expect(PASSWORD_REGEX.test('lowercaseonly1!')).toBe(false) // Missing uppercase
      expect(PASSWORD_REGEX.test('UPPERCASEONLY1!')).toBe(false) // Missing lowercase
      expect(PASSWORD_REGEX.test('NoDigitsHere!@#')).toBe(false)  // Missing number
      expect(PASSWORD_REGEX.test('NoSymbols123456')).toBe(false)  // Missing special char
      expect(PASSWORD_REGEX.test('Short1!')).toBe(false)          // Less than 8 chars
    })
  })

  describe('User Registration Schema (registerSchema)', () => {
    const validRegistration = {
      fullName: 'Dr. Rafiqul Islam',
      email: 'rafiqul.islam@hospital.org.bd',
      phoneNumber: '+8801712345678',
      password: 'SafePassword123!',
      confirmPassword: 'SafePassword123!',
      preferredLanguage: 'bn' as const,
      acceptTerms: true,
    }

    it('accepts valid registration data with Bangladeshi phone number', () => {
      const result = registerSchema.safeParse(validRegistration)
      expect(result.success).toBe(true)
    })

    it('accepts valid registration without optional phone number', () => {
      const { phoneNumber, ...withoutPhone } = validRegistration
      void phoneNumber
      const result = registerSchema.safeParse(withoutPhone)
      expect(result.success).toBe(true)
    })

    it('rejects registration when password and confirmPassword mismatch', () => {
      const result = registerSchema.safeParse({
        ...validRegistration,
        confirmPassword: 'DifferentPassword123!',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/passwords do not match/i)
      }
    })

    it('rejects registration without terms acceptance', () => {
      const result = registerSchema.safeParse({
        ...validRegistration,
        acceptTerms: false,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/accept the terms/i)
      }
    })

    it('rejects registration with invalid email format', () => {
      const result = registerSchema.safeParse({
        ...validRegistration,
        email: 'invalid-email-format',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/valid email/i)
      }
    })

    it('rejects invalid Bangladeshi phone formats', () => {
      const result = registerSchema.safeParse({
        ...validRegistration,
        phoneNumber: '12345',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/valid phone number/i)
      }
    })
  })

  describe('User Login Schema (loginSchema)', () => {
    it('accepts valid login credentials', () => {
      const result = loginSchema.safeParse({
        email: 'user@lungent.org',
        password: 'UserSecret123!',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty password', () => {
      const result = loginSchema.safeParse({
        email: 'user@lungent.org',
        password: '',
      })
      expect(result.success).toBe(false)
    })

    it('normalizes email to lowercase', () => {
      const result = loginSchema.safeParse({
        email: 'USER@LUNGENT.ORG',
        password: 'Password123!',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('user@lungent.org')
      }
    })
  })

  describe('Password Recovery Schemas', () => {
    it('validates forgot password request', () => {
      expect(forgotPasswordSchema.safeParse({ email: 'valid@example.com' }).success).toBe(true)
      expect(forgotPasswordSchema.safeParse({ email: 'not-an-email' }).success).toBe(false)
    })

    it('validates password reset with matching confirmation', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'NewStrongPassword1!',
        confirmPassword: 'NewStrongPassword1!',
      })
      expect(result.success).toBe(true)
    })

    it('rejects password reset with mismatched confirmation', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'NewStrongPassword1!',
        confirmPassword: 'MismatchPassword1!',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('Profile Update Schema (profileUpdateSchema)', () => {
    it('validates permitted profile fields update', () => {
      const result = profileUpdateSchema.safeParse({
        fullName: 'Prof. Anisul Haque',
        phoneNumber: '+8801812345678',
        preferredLanguage: 'bn',
      })
      expect(result.success).toBe(true)
    })

    it('rejects names with fewer than 2 characters', () => {
      const result = profileUpdateSchema.safeParse({
        fullName: 'A',
        preferredLanguage: 'en',
      })
      expect(result.success).toBe(false)
    })
  })
})
