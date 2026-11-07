import { describe, it, expect } from 'vitest'
import { LIBRARY_ARTICLES } from '@/lib/data/library-content'
import { FAQS_DATA } from '@/lib/data/faq-content'

describe('Public Content & Information Library Data Models', () => {
  describe('Lung Health Information Library', () => {
    it('contains all 5 essential clinical categories', () => {
      const categories = new Set(LIBRARY_ARTICLES.map((a) => a.category))
      expect(categories.has('basics')).toBe(true)
      expect(categories.has('risks')).toBe(true)
      expect(categories.has('symptoms')).toBe(true)
      expect(categories.has('screening')).toBe(true)
      expect(categories.has('prevention')).toBe(true)
    })

    it('ensures each article has bilingual titles, summaries, content, and key takeaways', () => {
      expect(LIBRARY_ARTICLES.length).toBeGreaterThanOrEqual(6)

      for (const article of LIBRARY_ARTICLES) {
        expect(article.id).toBeDefined()
        expect(article.titleEn.length).toBeGreaterThan(5)
        expect(article.titleBn.length).toBeGreaterThan(5)
        expect(article.summaryEn.length).toBeGreaterThan(15)
        expect(article.summaryBn.length).toBeGreaterThan(15)
        expect(article.contentEn.length).toBeGreaterThanOrEqual(2)
        expect(article.contentBn.length).toBeGreaterThanOrEqual(2)
        expect(article.keyTakeawayEn.length).toBeGreaterThan(10)
        expect(article.keyTakeawayBn.length).toBeGreaterThan(10)
        expect(article.tags.length).toBeGreaterThanOrEqual(2)
      }
    })

    it('specifically covers regional Bangladesh environmental exposures (biomass and PM2.5)', () => {
      const biomassArticle = LIBRARY_ARTICLES.find((a) => a.id === 'biomass-and-indoor-air-pollution')
      expect(biomassArticle).toBeDefined()
      expect(biomassArticle?.contentEn.join(' ')).toMatch(/chula/i)

      const airPollutionArticle = LIBRARY_ARTICLES.find((a) => a.id === 'ambient-pm25-air-pollution')
      expect(airPollutionArticle).toBeDefined()
      expect(airPollutionArticle?.contentEn.join(' ')).toMatch(/PM2.5/i)
    })
  })

  describe('Frequently Asked Questions (FAQs)', () => {
    it('contains categorized questions across clinical, screening, privacy, and account domains', () => {
      const categories = new Set(FAQS_DATA.map((f) => f.category))
      expect(categories.has('general')).toBe(true)
      expect(categories.has('clinical')).toBe(true)
      expect(categories.has('screening')).toBe(true)
      expect(categories.has('privacy')).toBe(true)
      expect(categories.has('account')).toBe(true)
    })

    it('ensures all FAQs have robust bilingual answers and clear non-diagnostic boundaries', () => {
      expect(FAQS_DATA.length).toBeGreaterThanOrEqual(8)

      for (const faq of FAQS_DATA) {
        expect(faq.questionEn.endsWith('?')).toBe(true)
        expect(faq.questionBn.endsWith('?')).toBe(true)
        expect(faq.answerEn.length).toBeGreaterThan(30)
        expect(faq.answerBn.length).toBeGreaterThan(30)
      }

      const diagnosisFaq = FAQS_DATA.find((f) => f.id === 'does-lungent-diagnose-cancer')
      expect(diagnosisFaq).toBeDefined()
      expect(diagnosisFaq?.answerEn).toMatch(/not a diagnostic medical device/i)
      expect(diagnosisFaq?.answerBn).toMatch(/কোনো রোগ নির্ণয় করে না/i)
    })
  })
})
