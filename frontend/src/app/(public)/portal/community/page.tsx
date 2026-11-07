import type { Metadata } from 'next'
import { CommunityDemoClient } from './community-demo-client'

export const metadata: Metadata = {
  title: 'Community Health Worker Demo | Lungent',
  description: 'Interactive product pitch and field intake demonstration for community healthcare workers.',
}

export default function CommunityDemoPage() {
  return <CommunityDemoClient />
}

