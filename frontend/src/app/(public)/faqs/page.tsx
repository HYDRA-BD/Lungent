import type { Metadata } from 'next'
import { FAQsClient } from './faqs-client'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQs) — Lungent',
  description:
    'Find clear answers to common questions about Lungent, risk estimation vs medical diagnosis, Low-Dose CT (LDCT) screening eligibility, and data privacy.',
  openGraph: {
    title: 'Lungent FAQs — Risk Assessment & Clinical Scope',
    description: 'Clear answers on lung cancer screening, risk calculation, and platform access.',
    url: 'https://lungent.org/faqs',
  },
}

export default function FAQsPage() {
  return <FAQsClient />
}
