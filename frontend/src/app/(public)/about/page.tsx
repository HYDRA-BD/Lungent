import type { Metadata } from 'next'
import { AboutClient } from './about-client'

export const metadata: Metadata = {
  title: 'About Lungent — Mission, Clinical Scope & Approach',
  description:
    'Learn about Lungent mission to transform pulmonary risk awareness and clinical decision support in Bangladesh through evidence-based triage and early screening protocols.',
  openGraph: {
    title: 'About Lungent — Clinical Decision Support & Pulmonary Risk',
    description: 'Transforming lung health awareness and evidence-based decision support.',
    url: 'https://lungent.org/about',
  },
}

export default function AboutPage() {
  return <AboutClient />
}
