import type { Metadata } from 'next'
import { AdminDemoClient } from './admin-demo-client'

export const metadata: Metadata = {
  title: 'Governance & Administration Demo | Lungent',
  description: 'Interactive demonstration of multi-facility oversight, algorithmic governance, and population health screening metrics.',
}

export default function AdminDemoPage() {
  return <AdminDemoClient />
}

