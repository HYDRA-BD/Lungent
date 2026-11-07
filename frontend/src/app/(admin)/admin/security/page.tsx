import type { Metadata } from 'next'
import { CentralSecurityService } from '@/modules/security/service'
import { SecurityWorkspaceClient } from './security-workspace-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Security, Privacy & Compliance | Administration | Lungent',
  description:
    'Centralized oversight of technical access controls, append-only security auditing, data subject rights, incident response, data retention, and compliance readiness.',
}

export default async function AdminSecurityPage() {
  const [
    summary,
    auditLogs,
    privacyRequests,
    incidents,
    retentionPolicies,
    complianceControls,
    backupVerifications,
  ] = await Promise.all([
    CentralSecurityService.getSecurityDashboardSummary(),
    CentralSecurityService.getSecurityAuditLogs({ limit: 50 }),
    CentralSecurityService.getPrivacyRequests(),
    CentralSecurityService.getIncidents(),
    CentralSecurityService.getRetentionPolicies(),
    CentralSecurityService.getComplianceControls(),
    CentralSecurityService.getBackupVerifications(),
  ])

  const initialData = {
    summary,
    auditLogs,
    privacyRequests,
    incidents,
    retentionPolicies,
    complianceControls,
    backupVerifications,
  }

  return <SecurityWorkspaceClient initialData={initialData} />
}

