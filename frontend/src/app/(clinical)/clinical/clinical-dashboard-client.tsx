'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Activity,
  AlertTriangle,
  CalendarCheck,
  ArrowRight,
  ShieldAlert,
  Search,
  ExternalLink,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { useLanguage } from '@/i18n'
import { getClinicalNav } from '@/modules/clinical/components/clinical-navigation'
import { AcknowledgeAlertModal } from '@/modules/clinical/components/acknowledge-alert-modal'
import type {
  ClinicalDashboardStats,
  ClinicalAlertItem,
  AssessmentReviewSummary,
  ClinicalActivityItem,
  ClinicalFollowUpPlanItem,
} from '@/modules/clinical/types'

interface ClinicalDashboardClientProps {
  initialData: {
    stats: ClinicalDashboardStats
    activeAlerts: ClinicalAlertItem[]
    pendingAssessments: AssessmentReviewSummary[]
    recentActivities: ClinicalActivityItem[]
    followUps: ClinicalFollowUpPlanItem[]
  }
}

export function ClinicalDashboardClient({ initialData }: ClinicalDashboardClientProps) {
  const { locale, dict } = useLanguage()
  const isBn = locale === 'bn'
  const cT = dict.clinicalWorkspace.dashboard

  const [stats] = useState(initialData.stats)
  const [activeAlerts, setActiveAlerts] = useState(initialData.activeAlerts)
  const [pendingAssessments] = useState(initialData.pendingAssessments)
  const [recentActivities] = useState(initialData.recentActivities)
  const [followUps] = useState(initialData.followUps)
  const [selectedAlertForAction, setSelectedAlertForAction] = useState<ClinicalAlertItem | null>(null)

  const navItems = getClinicalNav(isBn, {
    alerts: stats.unresolvedAlertsCount,
    pendingReviews: stats.pendingReviewsCount,
    followUps: stats.followUpsDueCount,
  })

  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical')

  const handleAlertUpdated = (updated: ClinicalAlertItem) => {
    setActiveAlerts((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a)).filter((a) => a.status !== 'resolved')
    )
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
          title={cT.title}
          description={cT.subtitle}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/clinical/patients">
                <Button variant="outline" size="sm" className="gap-2">
                  <Search className="size-4" />
                  {isBn ? 'রোগী খুঁজুন' : 'Find Patients'}
                </Button>
              </Link>
              <Link href="/clinical/alerts">
                <Button
                  variant={criticalAlerts.length > 0 ? 'destructive' : 'default'}
                  size="sm"
                  className="gap-2"
                >
                  <AlertTriangle className="size-4" />
                  {cT.viewAlerts} ({activeAlerts.length})
                </Button>
              </Link>
            </div>
          }
        />

        {/* Critical Red-Flag Symptom Alert Banner */}
        {criticalAlerts.length > 0 && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 sm:p-5 text-destructive dark:bg-destructive/15">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive text-white">
                  <ShieldAlert className="size-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground sm:text-base">
                    {cT.criticalAlertBannerTitle} ({criticalAlerts.length})
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                    {cT.criticalAlertBannerDesc}
                  </p>
                </div>
              </div>
              <Link href="/clinical/alerts">
                <Button variant="destructive" size="sm" className="whitespace-nowrap gap-1 self-start sm:self-auto">
                  {cT.viewAlerts}
                  <ChevronRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Clinical Overview Stat Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title={cT.patientsUnderCare}
            value={stats.totalPatientsUnderCare}
            icon={<Users className="size-5 text-primary" />}
            trend={{ direction: 'neutral', value: isBn ? 'অনুমোদিত কেন্দ্র' : 'Across Facilities' }}
          />
          <StatCard
            title={cT.criticalAlerts}
            value={stats.criticalAlertsCount}
            icon={<AlertTriangle className="size-5 text-destructive" />}
            trend={{ direction: 'up', value: isBn ? 'জরুরি রেড ফ্ল্যাগ' : 'Red-Flag Cases' }}
          />
          <StatCard
            title={cT.pendingReviews}
            value={stats.pendingReviewsCount}
            icon={<Activity className="size-5 text-amber-500" />}
            trend={{ direction: 'neutral', value: isBn ? 'অপেক্ষমাণ' : 'Pending Review' }}
          />
          <StatCard
            title={cT.followUpsDue}
            value={stats.followUpsDueCount}
            icon={<CalendarCheck className="size-5 text-teal-600" />}
            trend={{ direction: 'neutral', value: isBn ? 'আসন্ন মাস' : 'This Month' }}
          />
        </div>

        {/* Two-Column Layout: Pending Assessments & Follow-Ups */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Column: Pending Assessment Reviews */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {cT.pendingAssessmentQueue}
                  </CardTitle>
                  <CardDescription>
                    {isBn
                      ? 'অ্যালগরিদমিক ফলাফল ও রোগীর তথ্য ক্রস-যাচাই করে চিকিৎসকের সিদ্ধান্ত গ্রহণ করুন।'
                      : 'Cross-verify automated scores with collected clinical factors and formulate decisions.'}
                  </CardDescription>
                </div>
                <Link href="/clinical/assessments">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    {isBn ? 'সব দেখুন' : 'View All'}
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isBn ? 'রোগী' : 'Patient'}</TableHead>
                      <TableHead>{isBn ? 'অ্যাসেসমেন্ট' : 'Assessment'}</TableHead>
                      <TableHead>{isBn ? 'স্বয়ংক্রিয় আউটপুট' : 'Automated Output'}</TableHead>
                      <TableHead className="text-right">{isBn ? 'পদক্ষেপ' : 'Action'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingAssessments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-muted-foreground text-sm">
                          {isBn ? 'কোনো অপেক্ষমাণ অ্যাসেসমেন্ট নেই।' : 'No pending assessments awaiting review.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingAssessments.map((asm) => (
                        <TableRow key={asm.id}>
                          <TableCell>
                            <div className="font-medium text-foreground">{asm.patientName}</div>
                            <div className="font-mono text-xs text-muted-foreground">
                              {asm.patientCanonicalId}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {asm.assessmentType.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-foreground">
                              {asm.algorithmicCategory}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {asm.riskSummary}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/clinical/patients/${asm.patientId}`}>
                              <Button size="sm" variant="outline" className="gap-1 text-xs">
                                {isBn ? 'পর্যালোচনা' : 'Review'}
                                <ExternalLink className="size-3" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Follow-up Planning Preview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {isBn ? 'আসন্ন ক্লিনিক্যাল ফলো-আপ' : 'Upcoming Clinical Follow-Ups'}
                  </CardTitle>
                  <CardDescription>
                    {isBn
                      ? 'নির্ধারিত নজরদারি ও পোস্ট-ইমেজিং ফলো-আপ সময়সূচী।'
                      : 'Scheduled surveillance evaluations and post-imaging clinical consultations.'}
                  </CardDescription>
                </div>
                <Link href="/clinical/follow-ups">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    {isBn ? 'সব দেখুন' : 'View All'}
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isBn ? 'রোগী' : 'Patient'}</TableHead>
                      <TableHead>{isBn ? 'তারিখ' : 'Date'}</TableHead>
                      <TableHead>{isBn ? 'নির্দেশনা' : 'Instructions'}</TableHead>
                      <TableHead className="text-right">{isBn ? 'অবস্থা' : 'Status'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {followUps.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-muted-foreground text-sm">
                          {isBn ? 'কোনো আসন্ন ফলো-আপ নির্ধারিত নেই।' : 'No upcoming follow-ups scheduled.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      followUps.map((fp) => (
                        <TableRow key={fp.id}>
                          <TableCell>
                            <div className="font-medium text-foreground">{fp.patientName}</div>
                            <div className="font-mono text-xs text-muted-foreground">
                              {fp.patientCanonicalId}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">
                            {fp.recommendedReviewDate}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                            {fp.instructions}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={fp.status === 'completed' ? 'success' : 'default'} className="text-xs">
                              {fp.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Active Red-Flag Alerts & Recent Activity */}
          <div className="space-y-6">
            {/* Active Alerts Box */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-destructive" />
                  <CardTitle className="text-base font-semibold">
                    {isBn ? 'সক্রিয় সতর্কতা' : 'Active Alerts'}
                  </CardTitle>
                </div>
                <Link href="/clinical/alerts">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    {isBn ? 'সব' : 'All'}
                    <ArrowRight className="size-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeAlerts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    {isBn ? 'কোনো সক্রিয় সতর্কতা নেই।' : 'No active alerts.'}
                  </div>
                ) : (
                  activeAlerts.map((alt) => (
                    <div
                      key={alt.id}
                      className="rounded-lg border border-border bg-card p-3 shadow-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={alt.severity === 'critical' ? 'destructive' : 'warning'}
                          className="text-[10px] uppercase font-bold"
                        >
                          {alt.severity}
                        </Badge>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {alt.patientCanonicalId}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-foreground leading-snug">
                        {isBn && alt.titleBn ? alt.titleBn : alt.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {isBn && alt.descriptionBn ? alt.descriptionBn : alt.description}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-border">
                        <span className="text-[10px] text-muted-foreground">
                          {alt.patientName}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[10px] px-2 text-primary"
                          onClick={() => setSelectedAlertForAction(alt)}
                        >
                          {isBn ? 'পদক্ষেপ নিন' : 'Take Action'}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Audit Activity Stream */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <CardTitle className="text-base font-semibold">
                    {cT.recentClinicalActivity}
                  </CardTitle>
                </div>
                <Link href="/clinical/activity">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    {isBn ? 'সব' : 'All'}
                    <ArrowRight className="size-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivities.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    {cT.recentClinicalActivity}
                  </div>
                ) : (
                  recentActivities.map((act) => (
                    <div key={act.id} className="flex gap-2.5 text-xs">
                      <div className="mt-1 size-2 rounded-full bg-primary shrink-0" />
                      <div className="space-y-0.5">
                        <div className="font-medium text-foreground">
                          {isBn && act.summaryBn ? act.summaryBn : act.summary}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {act.patientName ? `${act.patientName} • ` : ''}
                          {new Date(act.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Alert Acknowledgment Modal */}
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
