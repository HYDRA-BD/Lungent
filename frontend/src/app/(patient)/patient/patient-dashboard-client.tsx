'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  Copy,
  FileDown,
  Flame,
  Heart,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  User,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { getPatientNav } from '@/components/layouts/patient-nav'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useLanguage } from '@/i18n'
import type { PatientDashboardSummary } from '@/modules/patient-portal/types'

interface PatientDashboardClientProps {
  summary: PatientDashboardSummary
}

export function PatientDashboardClient({ summary }: PatientDashboardClientProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.patientPortal
  const patient = summary.patient

  const [copiedId, setCopiedId] = useState(false)

  const handleCopyId = () => {
    navigator.clipboard.writeText(patient.patientId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const patientNav = getPatientNav(dict, '/patient', summary.unreadNotificationsCount)

  return (
    <DashboardLayout
      workspaceName={isBn ? 'রোগী স্বাস্থ্য পোর্টাল' : 'Patient Health Portal'}
      workspaceBadge={
        <Badge variant="outline" className="text-primary border-primary/30 text-xs">
          {patient.patientId}
        </Badge>
      }
      userName={patient.fullName}
      userRole={isBn ? 'নিবন্ধিত রোগী' : 'Registered Patient'}
      navItems={patientNav}
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Welcome Header */}
        <PageHeader
          title={t.dashboard.welcome.replace('{name}', patient.fullName.split(' ')[0] || patient.fullName)}
          description={t.dashboard.welcomeSubtitle}
          actions={
            <Link
              href="/patient/assessments"
              className={buttonVariants({ variant: 'default', size: 'sm', className: 'font-semibold text-xs' })}
            >
              <ClipboardList className="size-3.5 mr-1.5" />
              <span>{t.dashboard.startAssessmentBtn}</span>
            </Link>
          }
        />

        {/* 1. Permanent Lungent Patient ID Card */}
        <Card className="rounded-2xl border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-xs">
          <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  {t.dashboard.permanentIdNotice}
                </span>
                {patient.verificationStatus === 'verified' ? (
                  <Badge variant="default" size="sm" className="bg-emerald-600 text-white flex items-center gap-1 text-[11px] rounded-full">
                    <ShieldCheck className="size-3" />
                    <span>{t.profile.verified}</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" size="sm" className="text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/40 text-[11px] rounded-full">
                    <Clock className="size-3 mr-1" />
                    <span>{t.profile.unverified}</span>
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl sm:text-3xl font-black tracking-wider text-foreground">
                  {patient.patientId}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs rounded-xl bg-background hover:bg-muted"
                  onClick={handleCopyId}
                >
                  {copiedId ? (
                    <>
                      <Check className="size-3 text-emerald-600 mr-1" />
                      <span>{t.dashboard.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3 mr-1" />
                      <span>{t.dashboard.copyId}</span>
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                <Building2 className="size-3.5 text-primary shrink-0" />
                <span>
                  {isBn ? 'প্রাথমিক স্বাস্থ্যকেন্দ্র' : 'Primary Registration Facility'}:{' '}
                  <strong className="text-foreground">{patient.primaryFacilityId === 'facility-dhaka-central' ? 'Dhaka Central Pulmonary Institute' : (patient.primaryFacilityId || 'Dhaka Central Pulmonary Institute')}</strong>
                </span>
              </div>
            </div>

            {/* Profile Completion Bar */}
            <div className="sm:text-right space-y-1.5 min-w-[200px]">
              <div className="flex justify-between sm:justify-end gap-2 text-xs font-semibold">
                <span className="text-muted-foreground">{t.dashboard.profileCompletion}:</span>
                <span className="text-foreground">{summary.profileCompletionPercentage}%</span>
              </div>
              <Progress value={summary.profileCompletionPercentage} className="h-2 w-full rounded-full" />
              <Link
                href="/patient/profile"
                className="inline-flex items-center text-[11px] text-primary hover:underline font-medium"
              >
                <span>{isBn ? 'প্রোফাইল তথ্য আপডেট করুন' : 'Update Profile Details'}</span>
                <ArrowRight className="size-3 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Safety Disclaimer */}
        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 flex items-start gap-3.5 text-xs text-muted-foreground leading-relaxed shadow-2xs">
          <ShieldAlert className="size-4 text-primary shrink-0 mt-0.5" />
          <p>{t.dashboard.safetyNotice}</p>
        </div>

        {/* Quick Health Summary Grid */}
        {summary.healthSummaryPreview && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="rounded-2xl border-gray-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold">{isBn ? 'প্যাক-বছর' : 'Pack-Years'}</span>
                <Flame className="size-3.5 text-amber-500" />
              </div>
              <p className="text-lg font-black text-foreground">
                {summary.healthSummaryPreview.packYears !== null && summary.healthSummaryPreview.packYears !== undefined
                  ? `${summary.healthSummaryPreview.packYears}`
                  : '0.0'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {summary.healthSummaryPreview.packYears ? 'Evaluated tobacco history' : 'No heavy tobacco reported'}
              </p>
            </Card>

            <Card className="rounded-2xl border-gray-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold">BMI</span>
                <Scale className="size-3.5 text-blue-500" />
              </div>
              <p className="text-lg font-black text-foreground">
                {summary.healthSummaryPreview.bmi ? `${summary.healthSummaryPreview.bmi} kg/m²` : '—'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {summary.healthSummaryPreview.bmi ? 'Calculated metric' : 'Height/Weight required'}
              </p>
            </Card>

            <Card className="rounded-2xl border-gray-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold">{isBn ? 'সক্রিয় রোগসমূহ' : 'Active Conditions'}</span>
                <Stethoscope className="size-3.5 text-indigo-500" />
              </div>
              <p className="text-lg font-black text-foreground">
                {summary.healthSummaryPreview.activeConditionsCount}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isBn ? 'লিপিবদ্ধ স্বাস্থ্য তথ্য' : 'Documented history'}
              </p>
            </Card>

            <Card className="rounded-2xl border-gray-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold">{isBn ? 'এলার্জি' : 'Allergies'}</span>
                <Heart className="size-3.5 text-rose-500" />
              </div>
              <p className="text-lg font-black text-foreground">
                {summary.healthSummaryPreview.allergiesCount}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isBn ? 'সংবেদনশীলতার সতর্কতা' : 'Active alerts'}
              </p>
            </Card>
          </div>
        )}

        {/* 2-Column Grid: Latest Assessment & Pending Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Latest Assessment Summary */}
          <Card className="rounded-2xl border-gray-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <ClipboardList className="size-4 text-primary" />
                  {t.dashboard.latestAssessment}
                </CardTitle>
                <Link
                  href="/patient/assessments/history"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  {isBn ? 'সকল ইতিহাস' : 'View History'}
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col justify-between text-xs">
              {summary.latestAssessment ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-foreground capitalize">
                      {summary.latestAssessment.assessmentType.replace(/_/g, ' ')}
                    </span>
                    <Badge variant={summary.latestAssessment.status === 'reviewed' ? 'default' : 'secondary'} className="text-[10px] capitalize">
                      {summary.latestAssessment.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground leading-relaxed line-clamp-2">
                    {summary.latestAssessment.summary}
                  </p>

                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1 text-[11px] text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{t.assessments.methodology}:</span>
                      <span className="font-mono text-foreground">{summary.latestAssessment.methodologyVersion || 'v1.0'}</span>
                    </div>
                    {summary.latestAssessment.reviewingClinicianName && (
                      <div className="flex justify-between">
                        <span>{t.assessments.reviewingClinician}:</span>
                        <span className="text-foreground">{summary.latestAssessment.reviewingClinicianName}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/patient/assessments/${summary.latestAssessment.id}`}
                      className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-full text-xs' })}
                    >
                      <span>{t.assessments.viewResult}</span>
                      <ArrowRight className="size-3 ml-1" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <p className="text-muted-foreground italic">{t.dashboard.noAssessments}</p>
                  <Link
                    href="/patient/assessments"
                    className={buttonVariants({ variant: 'default', size: 'sm', className: 'text-xs' })}
                  >
                    {t.dashboard.startAssessmentBtn}
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Actions & Upcoming Follow-ups */}
          <Card className="rounded-2xl border-gray-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Clock className="size-4 text-primary" />
                {t.dashboard.pendingActions}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 text-xs">
              {summary.pendingActions.length > 0 ? (
                summary.pendingActions.map((action) => (
                  <div
                    key={action.id}
                    className="p-3.5 rounded-2xl border border-gray-200/70 dark:border-slate-800/70 bg-card hover:bg-muted/40 transition-colors flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{action.title}</span>
                        <Badge
                          variant={action.urgency === 'high' ? 'destructive' : action.urgency === 'moderate' ? 'outline' : 'secondary'}
                          className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                        >
                          {action.urgency}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    <Link
                      href={action.actionUrl}
                      className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'shrink-0 text-primary hover:text-primary text-xs h-7 rounded-xl' })}
                    >
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground italic">
                  <CheckCircle2 className="size-6 text-emerald-500 mx-auto mb-1" />
                  <p>{t.dashboard.noPendingActions}</p>
                </div>
              )}

              {/* Upcoming Followups Mini Card */}
              {summary.upcomingFollowups.length > 0 && (
                <div className="pt-2 border-t border-border/60 space-y-2">
                  <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-primary" />
                    {t.dashboard.upcomingFollowups}
                  </span>
                  {summary.upcomingFollowups.slice(0, 1).map((ref) => (
                    <div key={ref.id} className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">{ref.destinationFacility}</span>
                        <Badge variant="outline" className="text-[10px] rounded-full capitalize">
                          {ref.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{ref.reason}</p>
                      {ref.recommendedFollowupDate && (
                        <p className="text-[10px] text-primary font-semibold">
                          Target Date: {ref.recommendedFollowupDate}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 3. Quick Links Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            {t.dashboard.quickLinks}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 text-xs">
            <Link
              href="/patient/profile"
              className="p-4 rounded-2xl border border-gray-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 hover:border-primary/40 hover:bg-primary/5 hover:shadow-xs transition-all flex flex-col items-center text-center gap-2.5 group"
            >
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <User className="size-4" />
              </div>
              <span className="font-semibold text-foreground">{t.nav.profile}</span>
            </Link>

            <Link
              href="/patient/health-record"
              className="p-4 rounded-2xl border border-gray-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 hover:border-primary/40 hover:bg-primary/5 hover:shadow-xs transition-all flex flex-col items-center text-center gap-2.5 group"
            >
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <Stethoscope className="size-4" />
              </div>
              <span className="font-semibold text-foreground">{t.nav.healthRecord}</span>
            </Link>

            <Link
              href="/patient/screening"
              className="p-4 rounded-2xl border border-gray-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 hover:border-primary/40 hover:bg-primary/5 hover:shadow-xs transition-all flex flex-col items-center text-center gap-2.5 group"
            >
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="size-4" />
              </div>
              <span className="font-semibold text-foreground">{t.nav.screening}</span>
            </Link>

            <Link
              href="/patient/referrals"
              className="p-4 rounded-2xl border border-gray-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 hover:border-primary/40 hover:bg-primary/5 hover:shadow-xs transition-all flex flex-col items-center text-center gap-2.5 group"
            >
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="size-4" />
              </div>
              <span className="font-semibold text-foreground">{t.nav.referrals}</span>
            </Link>

            <Link
              href="/patient/documents"
              className="p-4 rounded-2xl border border-gray-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 hover:border-primary/40 hover:bg-primary/5 hover:shadow-xs transition-all flex flex-col items-center text-center gap-2.5 group"
            >
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileDown className="size-4" />
              </div>
              <span className="font-semibold text-foreground">{t.nav.documents}</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
