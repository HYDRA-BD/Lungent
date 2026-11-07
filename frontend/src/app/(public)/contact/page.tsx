import type { Metadata } from 'next'
import { ContactClient } from './contact-client'

export const metadata: Metadata = {
  title: 'Contact & Platform Support — Lungent',
  description:
    'Contact the Lungent platform governance and technical support teams. Inquire about clinical pilot deployments, data protection standards, and institutional partnerships.',
  openGraph: {
    title: 'Contact Lungent — Governance & Support',
    description: 'Reach our clinical governance and technical support teams.',
    url: 'https://lungent.org/contact',
  },
}

export default function ContactPage() {
  return <ContactClient />
}
