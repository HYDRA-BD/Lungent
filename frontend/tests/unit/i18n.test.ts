import { describe, it, expect } from 'vitest'
import { en } from '@/i18n/translations/en'
import { bn } from '@/i18n/translations/bn'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale } from '@/i18n/config'

describe('Internationalization (i18n) Framework', () => {
  it('supports English (en) and Bangla (bn) locales', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'bn'])
    expect(DEFAULT_LOCALE).toBe('en')
    expect(isSupportedLocale('en')).toBe(true)
    expect(isSupportedLocale('bn')).toBe(true)
    expect(isSupportedLocale('fr')).toBe(false)
  })

  it('contains complete top-level sections in both English and Bangla', () => {
    const requiredSections = [
      'nav',
      'common',
      'home',
      'about',
      'howItWorks',
      'library',
      'faqs',
      'contact',
      'privacy',
      'terms',
    ]

    for (const section of requiredSections) {
      expect(en).toHaveProperty(section)
      expect(bn).toHaveProperty(section)
    }
  })

  it('has non-empty navigation keys matching between English and Bangla', () => {
    const enNavKeys = Object.keys(en.nav)
    const bnNavKeys = Object.keys(bn.nav)

    expect(bnNavKeys).toEqual(enNavKeys)

    for (const key of enNavKeys) {
      const enVal = en.nav[key as keyof typeof en.nav]
      const bnVal = bn.nav[key as keyof typeof bn.nav]

      expect(typeof enVal).toBe('string')
      expect(typeof bnVal).toBe('string')
      expect(enVal.length).toBeGreaterThan(0)
      expect(bnVal.length).toBeGreaterThan(0)
    }
  })

  it('contains explicit non-diagnostic medical disclaimers in both languages', () => {
    expect(en.common.clinicalNoticeBody).toMatch(/does not provide medical diagnosis/i)
    expect(bn.common.clinicalNoticeBody).toMatch(/রোগ নির্ণয়/i)

    expect(en.common.emergencyNotice).toMatch(/emergency/i)
    expect(bn.common.emergencyNotice).toMatch(/জরুরি/i)
  })

  it('provides verified communication channels without fake details in both languages', () => {
    expect(en.contact.supportEmail).toBe('support@lungent.org')
    expect(bn.contact.supportEmail).toBe('support@lungent.org')

    expect(en.contact.governanceEmail).toBe('governance@lungent.org')
    expect(bn.contact.governanceEmail).toBe('governance@lungent.org')
  })
})
