import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PatientService } from '@/modules/patients/service'
import { EditPatientClient } from './edit-client'
import type { Patient } from '@/modules/patients/types'

// Demo patients fallback for preview and offline mock states
const DEMO_PATIENTS: Record<string, Patient> = {
  '11111111-1111-4111-a111-111111111111': {
    id: '11111111-1111-4111-a111-111111111111',
    patientId: 'LGT-2026-8K2M7P',
    fullName: 'Md. Rafiqul Islam',
    dateOfBirth: '1968-04-12',
    approximateAge: 58,
    gender: 'male',
    phoneNumber: '01712345678',
    phoneNumberNormalized: '01712345678',
    email: 'rafiqul.islam@example.com',
    nidNumber: '•••• •••• 5678',
    nidHash: null,
    addressDivision: 'Dhaka',
    addressDistrict: 'Dhaka',
    addressUpazila: 'Mirpur',
    addressDetails: 'Section 10, Block C',
    emergencyContactName: 'Fatema Islam',
    emergencyContactPhone: '01799887766',
    emergencyContactRelation: 'Spouse',
    preferredLanguage: 'bn',
    verificationStatus: 'verified',
    verifiedBy: 'Dr. Farhana Ahmed',
    verifiedAt: '2026-11-01T10:00:00Z',
    verificationSource: 'national_id_card',
    accountAssociationStatus: 'linked',
    associatedUserProfileId: 'user-rafiqul',
    associatedAt: '2026-11-01T10:05:00Z',
    createdBy: 'staff-chw-01',
    primaryFacilityId: 'facility-dhaka-central',
    status: 'active',
    mergedIntoPatientId: null,
    createdAt: '2026-11-01T09:30:00Z',
    updatedAt: '2026-11-01T10:05:00Z',
  },
  '22222222-2222-4222-a222-222222222222': {
    id: '22222222-2222-4222-a222-222222222222',
    patientId: 'LGT-2026-3N9P4X',
    fullName: 'Nasima Begum',
    dateOfBirth: null,
    approximateAge: 49,
    gender: 'female',
    phoneNumber: '01898765432',
    phoneNumberNormalized: '01898765432',
    email: null,
    nidNumber: null,
    nidHash: null,
    addressDivision: 'Chattogram',
    addressDistrict: 'Chattogram',
    addressUpazila: 'Hathazari',
    addressDetails: 'Village: Mirzapur',
    emergencyContactName: 'Anwar Hossain',
    emergencyContactPhone: '01811223344',
    emergencyContactRelation: 'Brother',
    preferredLanguage: 'bn',
    verificationStatus: 'partially_verified',
    verifiedBy: null,
    verifiedAt: null,
    verificationSource: 'community_intake',
    accountAssociationStatus: 'unlinked',
    associatedUserProfileId: null,
    associatedAt: null,
    createdBy: 'staff-chw-02',
    primaryFacilityId: 'facility-chattogram-gen',
    status: 'active',
    mergedIntoPatientId: null,
    createdAt: '2026-11-02T11:15:00Z',
    updatedAt: '2026-11-02T11:15:00Z',
  },
}

export const instant = false

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  let patient: Patient | null = null

  try {
    patient = await PatientService.getPatientById(id)
    if (!patient) patient = await PatientService.getPatientByPatientId(id)
  } catch {
    patient = DEMO_PATIENTS[id] || null
  }

  const name = patient?.fullName || 'Patient'
  const patientId = patient?.patientId || id

  return {
    title: `Edit Identity: ${name} (${patientId}) | Lungent`,
    description: `Update identity, contact details, and location for patient ${patientId}. Permanent ID protected.`,
  }
}

export default async function EditPatientPage({ params }: PageProps) {
  const { id } = await params
  let patient: Patient | null = null

  try {
    patient = await PatientService.getPatientById(id)
    if (!patient) patient = await PatientService.getPatientByPatientId(id)
  } catch {
    patient = null
  }

  if (!patient) {
    patient = DEMO_PATIENTS[id] || null
  }

  if (!patient) {
    notFound()
  }

  return <EditPatientClient initialPatient={patient} />
}
