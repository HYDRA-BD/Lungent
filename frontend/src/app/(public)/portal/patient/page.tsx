import type { Metadata } from 'next'
import { PatientDemoClient } from './patient-demo-client'

export const metadata: Metadata = {
  title: 'Patient Health Portal Demo | Lungent',
  description: 'Personalized non-imaging lung cancer risk assessment and empowerment demo for patients and families.',
}

export default function PatientDemoPage() {
  return <PatientDemoClient />
}

