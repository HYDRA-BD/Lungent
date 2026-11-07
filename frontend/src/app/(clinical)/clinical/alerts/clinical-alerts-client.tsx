'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/i18n'
import { getClinicalNav } from '@/modules/clinical/components/clinical-navigation'
import { AcknowledgeAlertModal } from '@/modules/clinical/components/acknowledge-alert-modal'
import type { ClinicalAlertItem } from '@/modules/clinical/types'

interface ClinicalAlertsClientProps {
  initialAlerts: ClinicalAlertItem[]
}

export function ClinicalAlertsClient({ initialAlerts }: ClinicalAlertsClientProps) {
  const { locale, dict } = useLanguage()
  const isBn = locale === 'bn'
  const alT = dict.clinicalWorkspace.alerts

  const [alerts, setAlerts] = useState<ClinicalAlertItem[]>(initialAlerts)
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedAlertForAction, setSelectedAlertForAction] = useState<ClinicalAlertItem | null>(null)

  const navItems = getClinicalNav(isBn, {
    alerts: alerts.filter((a) => a.status === 'active' || a.status === 'acknowledged').length,
  })

  const filteredAlerts = alerts.filter((a) => {
    if (selectedSeverity !== 'all' && a.severity !== selectedSeverity) return false
    if (selectedStatus !== 'all' && a.status !== selectedStatus) return false
    return true
  })

  const handleAlertUpdated = (updated: ClinicalAlertItem) => {
    setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
  }

  const getSeverityBadgeVariant = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'warning'
      case 'moderate':
        return 'default'
      default:
        return 'outline'
    }
  }

  return (
    <DashboardLayout
      workspaceName={isBn ? 'ক্লিনিক্যাল সিদ্ধান্ত সহায়তা ওয়ার্কস্পেস' : 'Clinical Decision Support Workspace'}
      workspaceBadge={
        <Badge variant="default" size="sm">
          {isBn ? 'পালমোনোলজি ও অনকোলজি প্যানেল' : 'Pulmonology & Oncology Panel'}
        </Badge>
      }
      userName="Prof. Dr. Farhana Ahmed"
      userRole={isBn ? 'সিনিয়র কনসালটেন্ট পালমোনোলজিস্ট' : 'Senior Consultant Pulmonologist'}
      navItems={navItems}
    >
      <div className="space-y-6">
        <PageHeader
          title={alT.title}
          description={alT.subtitle}
        />

        {/* Safety Rule Banner: Low Risk Never Suppresses Red-Flag Alerts */}
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive dark:bg-destructive/15">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold">
              {isBn ? 'অপরিহার্য সুরক্ষা নিয়ম: ' : 'CRITICAL CLINICAL SAFETY RULE: '}
            </span>
            {isBn
              ? 'কোনো নিম্ন-ঝুঁকি (Low Risk) স্বয়ংক্রিয় অ্যাসেসমেন্ট ফলাফল কখনোই রেড-ফ্ল্যাগ উপসর্গকে অবদমিত করতে পারবে না! যদি রোগীর কফের সাথে রক্ত (হেমোপটিসিস) বা অনিয়ন্ত্রিত ওজন হ্রাসের মতো রেড-ফ্ল্যাগ উপসর্গ থাকে, তবে এটি সর্বদাই সক্রিয় থাকবে এবং চিকিৎসকের সরাসরি মূল্যায়ন দাবি করবে।'
              : 'Low-risk automated assessment outputs MUST NEVER suppress red-flag alerts! Even if an algorithmic calculation indicates low risk, red-flag symptoms such as hemoptysis or unexplained weight loss mandate persistent clinical escalation.'}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  {isBn ? 'তীব্রতা' : 'Severity'}:
                </span>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">{alT.filterAllSeverities}</option>
                  <option value="critical">{alT.severities.critical}</option>
                  <option value="high">{alT.severities.high}</option>
                  <option value="moderate">{alT.severities.moderate}</option>
                  <option value="low">{alT.severities.low}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  {isBn ? 'অবস্থা' : 'Status'}:
                </span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">{alT.filterAllStatuses}</option>
                  <option value="active">Active (Unresolved)</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                {alT.noAlerts}
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alt) => (
              <Card
                key={alt.id}
                className={
                  alt.severity === 'critical' && alt.status === 'active'
                    ? 'border-destructive/40 bg-destructive/5 shadow-xs'
                    : ''
                }
              >
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getSeverityBadgeVariant(alt.severity)} className="font-bold text-xs uppercase">
                          {alt.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {alt.alertType.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">
                          {alt.createdAt.slice(0, 10)}
                        </span>
                        {alt.status === 'resolved' ? (
                          <Badge variant="success" className="text-xs gap-1">
                            <CheckCircle2 className="size-3" />
                            Resolved
                          </Badge>
                        ) : alt.status === 'acknowledged' ? (
                          <Badge variant="warning" className="text-xs">
                            Acknowledged
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-foreground">
                        {isBn && alt.titleBn ? alt.titleBn : alt.title}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        {isBn && alt.descriptionBn ? alt.descriptionBn : alt.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                        <span>
                          {isBn ? 'রোগী: ' : 'Patient: '}
                          <strong className="text-foreground">{alt.patientName}</strong> ({alt.patientCanonicalId})
                        </span>
                        <span>•</span>
                        <span>
                          {isBn ? 'উৎস: ' : 'Source: '}
                          <span className="font-mono">{alt.source}</span>
                        </span>
                      </div>

                      {alt.resolutionNotes && (
                        <div className="mt-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-foreground">
                          <span className="font-semibold">{isBn ? 'নিষ্পত্তির মন্তব্য: ' : 'Clinician Resolution Notes: '}</span>
                          <span>{alt.resolutionNotes}</span>
                          {alt.resolvedByName && (
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              — {alt.resolvedByName} ({alt.resolvedAt ? alt.resolvedAt.slice(0, 10) : ''})
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center gap-2 shrink-0">
                      <Link href={`/clinical/patients/${alt.patientId}`}>
                        <Button size="sm" variant="outline" className="h-8 gap-1 text-xs w-full">
                          {isBn ? 'প্রোফাইল' : 'Profile'}
                          <ExternalLink className="size-3" />
                        </Button>
                      </Link>

                      {alt.status !== 'resolved' && (
                        <Button
                          size="sm"
                          variant={alt.severity === 'critical' ? 'destructive' : 'default'}
                          className="h-8 gap-1 text-xs w-full whitespace-nowrap"
                          onClick={() => setSelectedAlertForAction(alt)}
                        >
                          <ShieldCheck className="size-3.5" />
                          {alt.status === 'active' ? alT.acknowledgeBtn : alT.resolveBtn}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Acknowledge Alert Modal */}
      {selectedAlertForAction && (
        <AcknowledgeAlertModal
          isOpen={!!selectedAlertForAction}
          onClose={() => setSelectedAlertForAction(null)}
          alert={selectedAlertForAction}
          onSuccess={handleAlertUpdated}
        />
      )}
    </DashboardLayout>
  )
}
