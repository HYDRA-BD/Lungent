import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FacilityDetailClient } from './facility-detail-client'
import { FacilityService } from '@/modules/facilities/service'

export const instant = false

interface FacilityPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: FacilityPageProps): Promise<Metadata> {
  const { id } = await params
  const facility = await FacilityService.getFacilityById(id)
  return {
    title: facility
      ? `${facility.name} (${facility.facilityId}) | Lungent System Administration`
      : 'Healthcare Facility Profile | Lungent System Administration',
    description: 'Detailed operational profile, services, staff memberships, and accreditation governance.',
  }
}

export default async function FacilityDetailPage({ params }: FacilityPageProps) {
  const { id } = await params
  const facility = await FacilityService.getFacilityById(id)

  if (!facility) {
    notFound()
  }

  const [services, staff, history, auditTrail] = await Promise.all([
    FacilityService.getFacilityServices(facility.id),
    FacilityService.getFacilityStaff(facility.id),
    FacilityService.getFacilityStatusHistory(facility.id),
    FacilityService.getFacilityAuditTrail(facility.id),
  ])

  return (
    <FacilityDetailClient
      initialFacility={facility}
      initialServices={services}
      initialStaff={staff}
      initialHistory={history}
      initialAuditTrail={auditTrail}
    />
  )
}
