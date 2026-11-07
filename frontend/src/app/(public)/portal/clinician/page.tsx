import type { Metadata } from 'next'
import { ClinicianDemoClient } from './clinician-demo-client'

export const metadata: Metadata = {
  title: 'Clinician & Specialist Demo | Lungent',
  description: 'Interactive demonstration of interpretable ML risk review, SHAP explanations, and 3-tier clinical policy triage.',
}

export default function ClinicianDemoPage() {
  return <ClinicianDemoClient />
}

