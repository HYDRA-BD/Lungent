import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createBrowserClient } from '@/lib/supabase'
import { clientEnvSchema, serverEnvSchema } from '@/lib/validation/env'

describe('Supabase Client Scaffolding & Validation', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('throws descriptive error if NEXT_PUBLIC_SUPABASE_URL is missing in browser client', () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    expect(() => createBrowserClient()).toThrow(/Missing required Supabase environment variables/)

    if (originalUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    if (originalKey) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
  })

  it('validates client environment schema correctly with Zod', () => {
    const valid = clientEnvSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    })
    expect(valid.success).toBe(true)

    const invalid = clientEnvSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: 'invalid-url-format',
    })
    expect(invalid.success).toBe(false)
  })

  it('validates server environment schema correctly with Zod', () => {
    const valid = serverEnvSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      NODE_ENV: 'test',
    })
    expect(valid.success).toBe(true)
  })
})
