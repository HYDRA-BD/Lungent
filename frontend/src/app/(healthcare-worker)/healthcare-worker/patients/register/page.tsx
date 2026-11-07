import type { Metadata } from 'next'
import { RegisterClient } from './register-client'

export const metadata: Metadata = {
  title: 'Register New Patient | Lungent',
  description:
    'Mandatory search verification and centralized patient identity registration assigning a permanent Lungent Patient ID.',
}

export default function RegisterPatientPage() {
  return <RegisterClient />
}

