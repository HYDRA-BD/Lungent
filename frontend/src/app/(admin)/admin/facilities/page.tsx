import type { Metadata } from 'next'
import { FacilitiesDirectoryClient } from './facilities-directory-client'

export const metadata: Metadata = {
  title: 'Healthcare Facility Registry | Lungent System Administration',
  description:
    'Centralized registry of participating hospitals, clinics, diagnostic centers, and community health networks in Bangladesh.',
}

export default function FacilitiesDirectoryPage() {
  return <FacilitiesDirectoryClient />
}
