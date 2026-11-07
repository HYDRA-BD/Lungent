'use client'

import React from 'react'
import {
  Building2,
  Users,
  FileText,
  Settings,
  Server,
  Activity,
  Plus,
  ShieldCheck,
  Bell,
  BarChart3,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { useLanguage } from '@/i18n'

export default function AdminPortalPage() {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const adm = dict.adminWorkspace

  const adminNav = [
    { label: adm.nav.overview, href: '/admin', icon: <Server className="size-4" /> },
    { label: isBn ? 'অপারেশনাল অ্যানালিটিক্স' : 'Operational Analytics', href: '/admin/analytics', icon: <BarChart3 className="size-4" /> },
    { label: isBn ? 'ক্লিনিক্যাল গভর্ন্যান্স' : 'Clinical Governance', href: '/clinical/governance', icon: <ShieldCheck className="size-4" /> },
    { label: adm.nav.facilities, href: '/admin/facilities', icon: <Building2 className="size-4" /> },
    { label: adm.nav.notifications, href: '/admin/notifications', icon: <Bell className="size-4" /> },
    { label: isBn ? 'রিপোর্ট অডিট' : 'Report Oversight', href: '/admin/reports', icon: <FileText className="size-4" /> },
    { label: adm.nav.users, href: '/admin/users', icon: <Users className="size-4" /> },
    { label: adm.nav.audit, href: '/admin/audit', icon: <FileText className="size-4" /> },
    { label: adm.nav.security, href: '/admin/security', icon: <Settings className="size-4" /> },
  ]

  const facilities = [
    { id: 'FAC-01', name: isBn ? 'জাতীয় ক্যান্সার গবেষণা ইনস্টিটিউট ও হাসপাতাল' : 'National Institute of Cancer Research & Hospital', city: isBn ? 'ঢাকা' : 'Dhaka', tier: isBn ? 'টার্শিয়ারি হাসপাতাল' : 'Tertiary Hospital', scanners: isBn ? '২টি এলডিসিটি স্ক্যানার' : '2 LDCT Scanners', status: isBn ? 'সক্রিয়' : 'Active' },
    { id: 'FAC-02', name: isBn ? 'চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল' : 'Chittagong Medical College Hospital', city: isBn ? 'চট্টগ্রাম' : 'Chattogram', tier: isBn ? 'টার্শিয়ারি হাসপাতাল' : 'Tertiary Hospital', scanners: isBn ? '১টি এলডিসিটি স্ক্যানার' : '1 LDCT Scanner', status: isBn ? 'সক্রিয়' : 'Active' },
    { id: 'FAC-03', name: isBn ? 'সিলেট এম এ জি ওসমানী মেডিকেল কলেজ' : 'Sylhet MAG Osmani Medical College', city: isBn ? 'সিলেট' : 'Sylhet', tier: isBn ? 'সেকেন্ডারি সেন্টার' : 'Secondary Center', scanners: isBn ? '১টি সিটি স্ক্যানার' : '1 CT Scanner', status: isBn ? 'সক্রিয়' : 'Active' },
    { id: 'FAC-04', name: isBn ? 'মিরপুর কমিউনিটি হেলথ ক্লিনিক' : 'Mirpur Community Health Clinic', city: isBn ? 'ঢাকা' : 'Dhaka', tier: isBn ? 'তৃণমূল স্বাস্থ্য কেন্দ্র' : 'Grassroots Hub', scanners: isBn ? 'ইনটেক ও স্পাইরোমেট্রি' : 'Intake & Spirometry', status: isBn ? 'সক্রিয়' : 'Active' },
  ]

  return (
    <DashboardLayout
      workspaceName={isBn ? 'সিস্টেম অ্যাডমিনিস্ট্রেশন ও গভর্নেন্স' : adm.title}
      workspaceBadge={<Badge variant="outline" size="sm">{adm.superAdminTier}</Badge>}
      userName={isBn ? 'সিস্টেম অ্যাডমিনিস্ট্রেটর' : 'System Administrator'}
      userRole={adm.governanceLead}
      navItems={adminNav}
    >
      <div className="space-y-6">
        <PageHeader
          title={adm.title}
          description={adm.subtitle}
          actions={
            <Button variant="default" size="sm" leftIcon={<Plus className="size-4" />}>
              {isBn ? 'নতুন স্বাস্থ্যকেন্দ্র নিবন্ধন' : 'Register Partner Facility'}
            </Button>
          }
        />

        {/* Administration Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard
            title={adm.kpi.totalFacilities}
            value={isBn ? '২৮' : '28'}
            description={adm.kpi.totalFacilitiesDesc}
            icon={<Building2 className="size-4" />}
          />
          <StatCard
            title={adm.kpi.activeClinicians}
            value={isBn ? '১৪৬' : '146'}
            trend={{ value: isBn ? '১২' : '12', direction: 'up', label: isBn ? 'এই মাসে' : 'this month' }}
            icon={<Users className="size-4" />}
          />
          <StatCard
            title={isBn ? 'অডিট ট্রেইল সততা' : 'Audit Trail Integrity'}
            value={isBn ? '১০০%' : '100%'}
            badge={<Badge variant="success" size="sm">{isBn ? 'যাচাইকৃত' : 'Verified'}</Badge>}
            icon={<ShieldCheck className="size-4" />}
          />
          <StatCard
            title={adm.kpi.systemStatus}
            value={isBn ? 'সক্রিয়' : 'Operational'}
            badge={<Badge variant="success" size="sm" dot>HTTP 200 OK</Badge>}
            icon={<Activity className="size-4" />}
          />
        </div>

        {/* Facility Directory Management Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              {adm.facilitiesTable.title}
            </h3>
            <span className="text-xs text-muted-foreground">
              {isBn ? '৪টি প্রদর্শনী কেন্দ্র' : '4 demonstration centers'}
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{adm.facilitiesTable.id}</TableHead>
                <TableHead>{adm.facilitiesTable.name}</TableHead>
                <TableHead>{adm.facilitiesTable.city}</TableHead>
                <TableHead>{adm.facilitiesTable.tier}</TableHead>
                <TableHead>{adm.facilitiesTable.scanners}</TableHead>
                <TableHead>{adm.facilitiesTable.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilities.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-mono text-xs font-semibold text-primary">
                    {f.id}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {f.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {f.city}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" size="sm">
                      {f.tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {f.scanners}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm" dot>
                      {f.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}
