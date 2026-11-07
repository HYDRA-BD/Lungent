import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FacilityEditClient } from './facility-edit-client'
import { FacilityService } from '@/modules/facilities/service'

export const instant = false

interface FacilityEditPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: FacilityEditPageProps): Promise<Metadata> {
  const { id } = await params
  const facility = await FacilityService.getFacilityById(id)
  return {
    title: facility
      ? `Edit ${facility.name} (${facility.facilityId}) | Lungent System Administration`
      : 'Edit Healthcare Facility | Lungent System Administration',
    description: 'Update facility operational profile, contacts, geographic details, and capacity.',
  }
}

export default async function FacilityEditPage({ params }: FacilityEditPageProps) {
  const { id } = await params
  const facility = await FacilityService.getFacilityById(id)

  if (!facility) {
    notFound()
  }

  return <FacilityEditClient facility={facility} />
}
