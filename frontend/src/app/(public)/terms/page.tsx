import type { Metadata } from 'next'
import { TermsClient } from './terms-client'

export const metadata: Metadata = {
  title: 'Terms of Use (Draft) — Lungent',
  description:
    'Lungent Terms of Use draft outlining platform scope, non-diagnostic disclaimers, authorized user requirements, and limitation of liability.',
  openGraph: {
    title: 'Terms of Use — Lungent Clinical Decision Support',
    description: 'Platform terms, clinical boundaries, and authorized usage guidelines.',
    url: 'https://lungent.org/terms',
  },
}

export default function TermsPage() {
  return <TermsClient />
}
