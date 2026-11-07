import type { Metadata } from 'next'
import { HowItWorksClient } from './how-it-works-client'

export const metadata: Metadata = {
  title: 'How It Works — Lungent Clinical Decision Support Workflow',
  description:
    'Explore Lungent evidence-based workflow: clinical intake, risk stratification, red-flag triage detection, and multi-disciplinary pathways for patients, healthcare workers, and clinicians.',
  openGraph: {
    title: 'How Lungent Works — Multi-Disciplinary Pulmonary Workflow',
    description: 'Structured clinical pathways from risk assessment to specialist referral.',
    url: 'https://lungent.org/how-it-works',
  },
}

export default function HowItWorksPage() {
  return <HowItWorksClient />
}
