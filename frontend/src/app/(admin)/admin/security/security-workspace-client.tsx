'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  History,
  UserCheck,
  AlertTriangle,
  Clock,
  FileCheck,
  Lock,
  Server,
  Building2,
  Bell,
  FileText,
  Users,
  Settings,
  BarChart3,
  CheckCircle2,
  KeyRound,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Badge } from '@/components/ui/badge'
import { Tabs, type TabItem } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useLanguage } from '@/i18n'
import type {
  SecurityDashboardSummary,
  SecurityAuditEvent,
  PrivacySubjectRequest,
  SecurityIncident,
  DataRetentionPolicy,
  ComplianceControl,
  BackupVerification,
} from '@/modules/security/types'
import { SecurityKpiCards } from '@/modules/security/components/security-kpi-cards'
import { SecurityAuditTable } from '@/modules/security/components/security-audit-table'
import { PrivacyRequestsTable } from '@/modules/security/components/privacy-requests-table'
import { SecurityIncidentsTable } from '@/modules/security/components/security-incidents-table'
import { DataRetentionBackupCard } from '@/modules/security/components/data-retention-backup-card'
import { ComplianceRegisterTable } from '@/modules/security/components/compliance-register-table'
import { getSecurityDashboardDataAction } from '@/modules/security/actions'

interface SecurityWorkspaceClientProps {
  initialData: {
    summary: SecurityDashboardSummary
    auditLogs: SecurityAuditEvent[]
    privacyRequests: PrivacySubjectRequest[]
    incidents: SecurityIncident[]
    retentionPolicies: DataRetentionPolicy[]
    complianceControls: ComplianceControl[]
    backupVerifications: BackupVerification[]
  }
}

export function SecurityWorkspaceClient({ initialData }: SecurityWorkspaceClientProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.securityCompliance
  const adm = dict.adminWorkspace

  const [data, setData] = useState(initialData)
  const [activeTab, setActiveTab] = useState<string>('overview')

  const refreshData = async () => {
    const res = await getSecurityDashboardDataAction()
    if (res.success && res.data) {
      setData(res.data)
    }
  }

  const adminNav = [
    { label: adm.nav.overview, href: '/admin', icon: <Server className="size-4" /> },
    { label: isBn ? 'অপারেশনাল অ্যানালিটিক্স' : 'Operational Analytics', href: '/admin/analytics', icon: <BarChart3 className="size-4" /> },
    { label: isBn ? 'ক্লিনিক্যাল গভর্ন্যান্স' : 'Clinical Governance', href: '/clinical/governance', icon: <ShieldCheck className="size-4" /> },
    { label: adm.nav.facilities, href: '/admin/facilities', icon: <Building2 className="size-4" /> },
    { label: adm.nav.notifications, href: '/admin/notifications', icon: <Bell className="size-4" /> },
    { label: isBn ? 'রিপোর্ট অডিট' : 'Report Oversight', href: '/admin/reports', icon: <FileText className="size-4" /> },
    { label: adm.nav.users, href: '/admin/users', icon: <Users className="size-4" /> },
    { label: isBn ? 'নিরাপত্তা ও কমপ্লায়েন্স' : 'Security & Compliance', href: '/admin/security', icon: <Settings className="size-4" /> },
  ]

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: t.tabs.overview,
      icon: <ShieldCheck className="size-4" />,
    },
    {
      id: 'audit',
      label: t.tabs.audit,
      icon: <History className="size-4" />,
      badge: <Badge variant="secondary" size="sm">{data.auditLogs.length}</Badge>,
    },
    {
      id: 'privacy',
      label: t.tabs.privacy,
      icon: <UserCheck className="size-4" />,
      badge: (
        <Badge
          variant={data.summary.pendingPrivacyRequestsCount > 0 ? 'warning' : 'secondary'}
          size="sm"
        >
          {data.privacyRequests.length}
        </Badge>
      ),
    },
    {
      id: 'incidents',
      label: t.tabs.incidents,
      icon: <AlertTriangle className="size-4" />,
      badge: (
        <Badge
          variant={data.summary.openIncidentsCount > 0 ? 'destructive' : 'secondary'}
          size="sm"
        >
          {data.incidents.length}
        </Badge>
      ),
    },
    {
      id: 'retention',
      label: t.tabs.retention,
      icon: <Clock className="size-4" />,
      badge: <Badge variant="secondary" size="sm">{data.retentionPolicies.length}</Badge>,
    },
    {
      id: 'compliance',
      label: t.tabs.compliance,
      icon: <FileCheck className="size-4" />,
      badge: (
        <Badge variant="success" size="sm">
          {data.summary.complianceImplementedCount}/{data.complianceControls.length}
        </Badge>
      ),
    },
  ]

  return (
    <DashboardLayout
      workspaceName={isBn ? 'সিস্টেম অ্যাডমিনিস্ট্রেশন ও গভর্ন্যান্স' : adm.title}
      workspaceBadge={<Badge variant="outline" size="sm">{adm.superAdminTier}</Badge>}
      userName={isBn ? 'প্রধান নিরাপত্তা কর্মকর্তা' : 'Chief Security & Compliance Officer'}
      userRole={isBn ? 'প্ল্যাটফর্ম নিরাপত্তা প্রশাসন' : 'Platform Security Administration'}
      navItems={adminNav}
    >
      <div className="space-y-6">
        <PageHeader
          title={t.title}
          description={t.subtitle}
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="success" size="lg" className="gap-1.5 py-1 px-3">
                <CheckCircle2 className="size-4" />
                {isBn ? 'সার্ভার-সাইড অনুমোদন সক্রিয়' : 'Server-Side Access Enforced'}
              </Badge>
            </div>
          }
        />

        {/* Security KPI Metrics */}
        <SecurityKpiCards summary={data.summary} />

        {/* Tab Navigation */}
        <div className="space-y-4">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="pills"
          />

          {/* Tab 1: Overview & Active Controls */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lock className="size-4 text-emerald-600" />
                      {isBn ? 'সার্ভার-সাইড অ্যাক্সেস নিয়ন্ত্রণ' : 'Server-Side Least Privilege'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {isBn
                        ? 'ভূমিকা পৃথকীকরণ ও আন্তঃহাসপাতাল ডেটা বিচ্ছিন্নতা।'
                        : 'Role boundaries and cross-facility isolation active.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{isBn ? 'প্রবেশাধিকার স্তর:' : 'Privilege Model:'}</span>
                      <span className="font-semibold text-foreground">Least-Privilege RBAC</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{isBn ? 'অ্যাডমিন ক্লিনিক্যাল সীমাবদ্ধতা:' : 'Admin Clinical Barrier:'}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Strictly Enforced</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{isBn ? 'আরএলএস স্ট্যাটাস:' : 'Row Level Security:'}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Enabled on All 28 Tables</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <KeyRound className="size-4 text-indigo-600" />
                      {isBn ? 'প্রমাণীকরণ ও সেশন সুরক্ষা' : 'Authentication & Session Integrity'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {isBn
                        ? 'জেডাব্লিউটি টোকেন মেয়াদ ও ব্রুট-ফোর্স প্রটেকশন।'
                        : 'JWT token rotation and anti-brute force throttling.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{isBn ? 'টোকেন টাইপ:' : 'Token Type:'}</span>
                      <span className="font-mono text-foreground">Supabase RS256 JWT</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{isBn ? 'সেশন মেয়াদ:' : 'Session Expiration:'}</span>
                      <span className="font-semibold text-foreground">60 mins (Auto Refresh)</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{isBn ? 'রেট লিমিটিং:' : 'Rate Limiting:'}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Sliding Window Active</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShieldCheck className="size-4 text-purple-600" />
                      {isBn ? 'এইচটিটিপি নিরাপত্তা হেডার' : 'HTTP Security Headers'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {isBn
                        ? 'ব্রাউজার স্তরের সুরক্ষা ও সিএসপি প্রটেকশন।'
                        : 'Next.js response headers and clickjacking barriers.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>HSTS:</span>
                      <span className="font-mono text-foreground">max-age=63072000; preload</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>X-Frame-Options:</span>
                      <span className="font-mono text-foreground">DENY</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>X-Content-Type:</span>
                      <span className="font-mono text-foreground">nosniff</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Administrative Least Privilege Policy Notice */}
              <Alert variant="warning">
                <AlertTriangle className="size-4" />
                <AlertTitle className="font-semibold text-xs">
                  {isBn ? 'প্রশাসনিক প্রবেশাধিকার সীমাবদ্ধতা নীতি' : 'Administrative Least Privilege Policy'}
                </AlertTitle>
                <AlertDescription className="text-xs leading-relaxed mt-1">
                  {t.leastPrivilegeNotice}
                </AlertDescription>
              </Alert>

              {/* Security Audit Table Preview */}
              <SecurityAuditTable logs={data.auditLogs.slice(0, 10)} />
            </div>
          )}

          {/* Tab 2: Security Audit Table */}
          {activeTab === 'audit' && <SecurityAuditTable logs={data.auditLogs} />}

          {/* Tab 3: Privacy & Data Subject Requests */}
          {activeTab === 'privacy' && (
            <PrivacyRequestsTable
              requests={data.privacyRequests}
              onRefresh={refreshData}
            />
          )}

          {/* Tab 4: Security Incidents */}
          {activeTab === 'incidents' && (
            <SecurityIncidentsTable
              incidents={data.incidents}
              onRefresh={refreshData}
            />
          )}

          {/* Tab 5: Data Retention & Backups */}
          {activeTab === 'retention' && (
            <DataRetentionBackupCard
              policies={data.retentionPolicies}
              backups={data.backupVerifications}
            />
          )}

          {/* Tab 6: Compliance Register */}
          {activeTab === 'compliance' && (
            <ComplianceRegisterTable controls={data.complianceControls} />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

