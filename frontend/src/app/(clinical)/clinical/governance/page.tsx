import type { Metadata } from 'next'
import { ClinicalGovernanceService } from '@/modules/governance/service'
import { ClinicalGovernanceClient } from './governance-workspace-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Clinical Governance & CAB Registry | Lungent',
  description:
    'Independent clinical governance, Clinical Advisory Board management, versioned decision rules, clinician overrides, and periodic review workflows.',
}

export default async function ClinicalGovernancePage() {
  const [
    summary,
    methodologies,
    members,
    meetings,
    overrides,
    reviewSchedule,
    auditEvents,
  ] = await Promise.all([
    ClinicalGovernanceService.getDashboardSummary(),
    ClinicalGovernanceService.getMethodologies(),
    ClinicalGovernanceService.getMembers(),
    ClinicalGovernanceService.getMeetings(),
    ClinicalGovernanceService.getClinicianOverrides(),
    ClinicalGovernanceService.getPeriodicReviewSchedule(),
    ClinicalGovernanceService.getAuditEvents(),
  ])

  const initialData = {
    summary,
    methodologies,
    members,
    meetings,
    overrides,
    reviewSchedule,
    auditEvents,
  }

  return <ClinicalGovernanceClient initialData={initialData} />
}

