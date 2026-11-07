import type { Metadata } from 'next'
import { SpatialMapClient } from './spatial-map-client'

export const metadata: Metadata = {
  title: 'Geographical Intelligence & Facility Map | Lungent Administration',
  description:
    'Interactive spatial visualization, healthcare facility discovery, diagnostic coverage gaps, and environmental intelligence for Bangladesh.',
}

export default function FacilitySpatialMapPage() {
  return <SpatialMapClient />
}
