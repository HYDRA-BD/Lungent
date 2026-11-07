import type { Metadata } from 'next'
import { PrivacyClient } from './privacy-client'

export const metadata: Metadata = {
  title: 'Privacy Policy (Draft) — Lungent',
  description:
    'Lungent Privacy Policy draft covering data collection principles, encryption protocols, PostgreSQL Row Level Security safeguards, and patient rights.',
  openGraph: {
    title: 'Privacy Policy — Lungent Clinical Decision Support',
    description: 'Patient confidentiality and clinical data governance standards.',
    url: 'https://lungent.org/privacy',
  },
}

export default function PrivacyPage() {
  return <PrivacyClient />
}
