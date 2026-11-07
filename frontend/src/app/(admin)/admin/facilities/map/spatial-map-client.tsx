'use client'

import React from 'react'
import Link from 'next/link'
import {
  Server,
  Building2,
  Users,
  FileText,
  Settings,
  ArrowLeft,
  MapPin,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/i18n'
import { SpatialIntelligenceDashboard } from '@/modules/spatial/components'

const adminNav = [
  { label: 'System Overview', href: '/admin', icon: <Server className="size-4" /> },
  { label: 'Facility Registry', href: '/admin/facilities', icon: <Building2 className="size-4" /> },
  { label: 'Facility Map', href: '/admin/facilities/map', icon: <MapPin className="size-4 text-primary" /> },
  { label: 'User & Role Access', href: '/admin/users', icon: <Users className="size-4" /> },
  { label: 'Audit & Governance Logs', href: '/admin/audit', icon: <FileText className="size-4" /> },
  { label: 'Security & Parameters', href: '/admin/security', icon: <Settings className="size-4" /> },
]

export function SpatialMapClient() {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  return (
    <DashboardLayout
      workspaceName={isBn ? 'সিস্টেম অ্যাডমিনিস্ট্রেশন ও গভর্নেন্স' : 'System Administration & Governance'}
      workspaceBadge={<Badge variant="outline" size="sm">SuperAdmin Tier</Badge>}
      userName="System Administrator"
      userRole="Platform Governance Lead"
      navItems={adminNav}
    >
      <div className="space-y-6">
        <PageHeader
          title={isBn ? 'ভৌগোলিক বিশ্লেষণ ও স্বাস্থ্যসেবা মানচিত্র' : 'Geographical Intelligence & Spatial Analysis'}
          description={
            isBn
              ? 'ইন্টারেক্টিভ মানচিত্র, স্বাস্থ্যসেবা কেন্দ্রের বিস্তার, ডায়াগনস্টিক কভারেজ শূন্যতা এবং বায়ুমণ্ডলীয় পরিবেশের সমন্বিত বিশ্লেষণ।'
              : 'Interactive spatial visualization, healthcare facility distribution, diagnostic coverage analysis, and environmental intelligence.'
          }
          actions={
            <Link
              href="/admin/facilities"
              className={buttonVariants({ variant: 'outline', size: 'sm', className: 'gap-2' })}
              data-testid="back-to-facilities-btn"
            >
              <ArrowLeft className="size-4" />
              {isBn ? 'ডিরেক্টরি তালিকায় ফিরুন' : 'Back to Directory'}
            </Link>
          }
        />

        <SpatialIntelligenceDashboard isBn={isBn} />
      </div>
    </DashboardLayout>
  )
}
