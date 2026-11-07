import type { Metadata } from 'next'
import { HomeClient } from './home-client'

export const metadata: Metadata = {
  title: 'Lungent — Intelligent Lung Health Assessment & Clinical Decision Support',
  description:
    'Web-based pulmonary risk assessment, screening eligibility evaluation, symptom triage, and clinical decision support platform for Bangladesh and international healthcare systems.',
  openGraph: {
    title: 'Lungent — Intelligent Lung Health Assessment',
    description: 'Understand risk. Reveal insights. Guide decisions.',
    url: 'https://lungent.org',
    siteName: 'Lungent',
    locale: 'en_US',
    type: 'website',
  },
}

export default function HomePage() {
  return <HomeClient />
}
