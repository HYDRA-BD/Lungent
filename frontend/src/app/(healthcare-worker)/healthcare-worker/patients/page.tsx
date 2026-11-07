import type { Metadata } from 'next'
import { PatientsClient } from './patients-client'

export const metadata: Metadata = {
  title: 'Patient Directory & Registry | Lungent',
  description:
    'Centralized patient identity registry, directory search, and multi-facility patient management for healthcare professionals.',
}

export default function PatientsRegistryPage() {
  return <PatientsClient />
}

