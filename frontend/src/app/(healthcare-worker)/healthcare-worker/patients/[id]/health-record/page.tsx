import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PatientService } from '@/modules/patients/service'
import { HealthRecordService } from '@/modules/health-records/service'
import { HealthRecordClient } from './health-record-client'
import type { Patient } from '@/modules/patients/types'

// Demo patients fallback for mock/preview states
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

  const name = patient?.fullName || 'Patient Health Record'
  const patientId = patient?.patientId || id

  return {
    title: `Health Record — ${name} (${patientId}) | Lungent`,
    description: `Comprehensive longitudinal health information ledger, clinical measurements, exposures, and verification records for ${patientId}.`,
  }
}

export default async function PatientHealthRecordPage({ params }: PageProps) {
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

  const healthRecord = await HealthRecordService.getComprehensiveHealthRecord(patient.id)

  return (
    <HealthRecordClient
      patient={patient}
      initialRecord={healthRecord}
    />
  )
}

