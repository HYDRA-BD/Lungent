import type { Metadata } from 'next'
import { LibraryClient } from './library-client'

export const metadata: Metadata = {
  title: 'Lung Health Information Library — Evidence-Based Pulmonary Guides',
  description:
    'Reliable educational guides on lung cancer risks, tobacco smoking pack-years, biomass fuel smoke, ambient PM2.5 pollution, red-flag symptoms, and Low-Dose CT (LDCT) screening.',
  openGraph: {
    title: 'Lung Health Information Library — Lungent',
    description: 'Evidence-based pulmonary health literacy for patients, families, and clinicians.',
    url: 'https://lungent.org/library',
  },
}

export default function LibraryPage() {
  return <LibraryClient />
}
