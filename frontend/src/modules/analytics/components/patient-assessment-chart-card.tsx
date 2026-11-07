'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { PatientStatisticsSummary, AssessmentStatisticsSummary } from '../types'
import { useLanguage } from '@/i18n'
import { Users, FileCheck2 } from 'lucide-react'

export interface PatientAssessmentChartCardProps {
  patients: PatientStatisticsSummary
  assessments: AssessmentStatisticsSummary
}

export function PatientAssessmentChartCard({
  patients,
  assessments,
}: PatientAssessmentChartCardProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const totalEvaluated = assessments.totalSubmitted || 1

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Patient Registrations vs Anonymous Self-Checks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <CardTitle className="text-base">
                {isBn ? 'রোগী নিবন্ধন ও স্ব-মূল্যায়ন বিভাজন' : 'Patient Registrations & Self-Check Activity'}
              </CardTitle>
            </div>
            <Badge variant="outline" size="sm">
              {isBn ? 'সার্ভার ডেটা' : 'Authoritative'}
            </Badge>
          </div>
          <CardDescription>
            {isBn
              ? 'নিবন্ধিত রোগী এবং বেনামী সাধারণ স্ব-মূল্যায়নকারীদের সম্পূর্ণ আলাদা গণনা।'
              : 'Strict separation between registered patient identities and anonymous public self-checks.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-border bg-muted/20">
              <span className="text-xs text-muted-foreground block">
                {isBn ? 'নিবন্ধিত রোগী' : 'Registered Patients'}
              </span>
              <span className="text-2xl font-bold text-foreground">
                {patients.totalRegistered}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 block mt-1">
                {patients.activeRecords} {isBn ? 'সক্রিয় রেকর্ড' : 'active records'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20">
              <span className="text-xs text-muted-foreground block">
                {isBn ? 'বেনামী স্ব-মূল্যায়ন' : 'Anonymous Self-Checks'}
              </span>
              <span className="text-2xl font-bold text-foreground">
                {patients.anonymousSelfChecks}
              </span>
              <span className="text-xs text-muted-foreground block mt-1">
                {isBn ? 'অনিবন্ধিত সেশন' : 'unauthenticated sessions'}
              </span>
            </div>
          </div>

          {/* Profile Completeness Meter */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-foreground">
                {isBn ? 'গড় স্বাস্থ্য রেকর্ড সম্পূর্ণতার হার' : 'Average Profile Completeness'}
              </span>
              <span className="font-bold text-primary">
                {patients.averageProfileCompleteness}%
              </span>
            </div>
            <Progress value={patients.averageProfileCompleteness} className="h-2" />
            <span className="text-xs text-muted-foreground block">
              {isBn
                ? 'বয়স, ধূমপান ইতিহাস এবং লিঙ্গ তথ্যের উপস্থিতির ওপর ভিত্তি করে নির্ধারিত।'
                : 'Evaluated from essential age, smoking history, and demographic inputs.'}
            </span>
          </div>

          {/* Time Series Trend Bars */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              {isBn ? 'দৈনিক নিবন্ধন ধারা (বিগত ৭ দিন)' : 'Daily Registration Activity (Last 7 Days)'}
            </span>
            <div className="flex items-end gap-2 h-20 pt-2">
              {patients.registrationsOverTime.map((pt) => {
                const heightPercent = Math.min(Math.max((pt.value / 4) * 100, 15), 100)
                return (
                  <div key={pt.date} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-primary/80 hover:bg-primary rounded-t transition-all"
                      title={`${pt.label}: ${pt.value}`}
                    />
                    <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                      {pt.label.split(',')[0]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Assessment Volume & Breakdown by Clinical Pathway */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="size-4 text-primary" />
              <CardTitle className="text-base">
                {isBn ? 'ক্লিনিকাল মূল্যায়ন বণ্টন ও অগ্রগতি' : 'Assessment Volume & Pathway Breakdown'}
              </CardTitle>
            </div>
            <Badge variant="secondary" size="sm">
              {assessments.totalSubmitted} {isBn ? 'দাখিলকৃত' : 'Submitted'}
            </Badge>
          </div>
          <CardDescription>
            {isBn
              ? 'লুঞ্জেন্টের ৩টি অনুমোদিত ক্লিনিকাল মডিউলের মাধ্যমে সম্পন্ন অ্যাসেসমেন্ট।'
              : 'Assessment distribution across PLCOm2012 risk, USPSTF screening, and NICE NG12 triage.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pathway Breakdown */}
          <div className="space-y-2.5">
            {assessments.distributionByType.map((item) => {
              const pct = Math.round((item.count / totalEvaluated) * 100)
              return (
                <div key={item.type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {isBn ? item.labelBn : item.labelEn}
                    </span>
                    <span className="font-semibold text-muted-foreground">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              )
            })}
          </div>

          {/* Assessment Lifecycle Summary */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center">
            <div className="p-2.5 rounded border border-border bg-muted/10">
              <span className="text-[11px] text-muted-foreground block">
                {isBn ? 'সম্পন্ন' : 'Completed'}
              </span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {assessments.completed}
              </span>
            </div>
            <div className="p-2.5 rounded border border-border bg-muted/10">
              <span className="text-[11px] text-muted-foreground block">
                {isBn ? 'অসম্পূর্ণ' : 'Incomplete'}
              </span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {assessments.incomplete}
              </span>
            </div>
            <div className="p-2.5 rounded border border-border bg-muted/10">
              <span className="text-[11px] text-muted-foreground block">
                {isBn ? 'বাতিল' : 'Cancelled'}
              </span>
              <span className="text-lg font-bold text-muted-foreground">
                {assessments.cancelled}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded border border-blue-500/20 bg-blue-500/5 text-blue-800 dark:text-blue-300 text-xs">
            {isBn
              ? 'সার্ভারে জমা দেওয়া এবং চিকিৎসকের স্বাক্ষরিত মূল্যায়নই শুধুমাত্র চূড়ান্ত হিসেবে গণ্য।'
              : 'Only server-submitted and clinically evaluated records are counted as completed.'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
