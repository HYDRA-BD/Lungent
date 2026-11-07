import type { Metadata } from 'next'
import { FacilityRegisterClient } from './facility-register-client'

export const metadata: Metadata = {
  title: 'Register Healthcare Facility | Lungent Platform Administration',
  description:
    'Register a hospital, clinic, diagnostic imaging center, or community health unit into the centralized Lungent network.',
}

export default function RegisterFacilityPage() {
  return <FacilityRegisterClient />
}
