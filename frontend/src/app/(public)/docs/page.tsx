import type { Metadata } from 'next'
import { DocsClient } from './docs-client'

export const metadata: Metadata = {
  title: 'Clinical & Technical Documentation | Lungent',
  description:
    'Comprehensive technical whitepaper, architecture overview, 9-model ensemble details, and clinical safety governance documentation for Lungent.',
}

export default function DocsPage() {
  return <DocsClient />
}

