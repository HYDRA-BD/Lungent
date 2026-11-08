import { z } from 'zod'

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+=\-[\]{}|;:,.<>])[A-Za-z\d@$!%*?&^#()_+=\-[\]{}|;:,.<>]{8,72}$/

export const ACTIVE_ACCESS_ROLES = [
  'General User',
  'AI Builders Congress',
  'Admin',
] as const

export type ActiveAccessRole = (typeof ACTIVE_ACCESS_ROLES)[number]

export const registerSchema = z
  .object({
    role: z.enum(ACTIVE_ACCESS_ROLES),
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address'),
    phoneNumber: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || /^(\+?8801|01)[3-9]\d{8}$/.test(val) || /^\+?[1-9]\d{7,14}$/.test(val),
        'Please enter a valid phone number (e.g. +88017XXXXXXXX)'
      ),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(72, 'Password cannot exceed 72 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    preferredLanguage: z.enum(['en', 'bn']),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms of service and privacy information',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  role: z.enum(ACTIVE_ACCESS_ROLES),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(72, 'Password cannot exceed 72 characters')
      .regex(
        PASSWORD_REGEX,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^(\+?8801|01)[3-9]\d{8}$/.test(val) || /^\+?[1-9]\d{7,14}$/.test(val),
      'Please enter a valid phone number'
    ),
  preferredLanguage: z.enum(['en', 'bn']),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
