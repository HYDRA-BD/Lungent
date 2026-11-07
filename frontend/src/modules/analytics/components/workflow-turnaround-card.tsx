'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { WorkflowReviewSummary } from '../types'
import { useLanguage } from '@/i18n'
import { Clock, ShieldCheck } from 'lucide-react'

export interface WorkflowTurnaroundCardProps {
  workflows: WorkflowReviewSummary
}

export function WorkflowTurnaroundCard({ workflows }: WorkflowTurnaroundCardProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const totalPending =
    workflows.pendingAgeDistribution.under24Hours +
    workflows.pendingAgeDistribution.oneToThreeDays +
    workflows.pendingAgeDistribution.fourToSevenDays +
    workflows.pendingAgeDistribution.overSevenDays || 1

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <CardTitle className="text-base">
              {isBn ? 'ক্লিনিকাল পর্যালোচনা ও ওয়ার্কফ্লো অগ্রগতি' : 'Clinical Review Turnaround & Queue Aging'}
            </CardTitle>
          </div>
          <Badge variant="outline" size="sm">
            {workflows.awaitingClinicalReview} {isBn ? 'পর্যালোচনা অপেক্ষমাণ' : 'Awaiting Review'}
          </Badge>
        </div>
        <CardDescription>
          {isBn
            ? 'জমা দেওয়া মূল্যায়নের চিকিৎসকের অনুমোদন ও সই হওয়ার সময়কাল এবং অপেক্ষমাণ সারির বয়স।'
            : 'Turnaround duration from assessment submission to clinical review sign-off, and pending queue age.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border border-border bg-muted/20">
            <span className="text-xs text-muted-foreground block">
              {isBn ? 'গড় পর্যালোচনা সময়' : 'Avg Turnaround Time'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-foreground">
                {workflows.reviewTurnaroundHoursAvg}
              </span>
              <span className="text-xs text-muted-foreground">
                {isBn ? 'ঘণ্টা' : 'hours'}
              </span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-1">
              {isBn ? 'স্বাভাবিক রেঞ্জে' : 'Within normal range'}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/20">
            <span className="text-xs text-muted-foreground block">
              {isBn ? 'সম্পন্ন পর্যালোচনা' : 'Reviewed Assessments'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {workflows.reviewed}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground block mt-1">
              {isBn ? 'চিকিৎসক অনুমোদিত' : 'clinician sign-offs'}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/20">
            <span className="text-xs text-muted-foreground block">
              {isBn ? 'অমীমাংসিত তথ্য চাহিদা' : 'Unresolved Information'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {workflows.unresolvedInfoCount}
              </span>
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 block mt-1">
              {isBn ? 'অতিরিক্ত তথ্য আবশ্যক' : 'Requires clarification'}
            </span>
          </div>
        </div>

        {/* Pending Queue Aging Breakdown */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            {isBn ? 'অপেক্ষমাণ পর্যালোচনার বয়স বিন্যাস' : 'Pending Review Queue Age Distribution'}
          </span>

          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {isBn ? '< ২৪ ঘণ্টা' : '< 24 Hours'}
                </span>
                <span className="font-semibold text-foreground">
                  {workflows.pendingAgeDistribution.under24Hours}
                </span>
              </div>
              <Progress
                value={Math.round((workflows.pendingAgeDistribution.under24Hours / totalPending) * 100)}
                className="h-1.5"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {isBn ? '১ - ৩ দিন' : '1 - 3 Days'}
                </span>
                <span className="font-semibold text-foreground">
                  {workflows.pendingAgeDistribution.oneToThreeDays}
                </span>
              </div>
              <Progress
                value={Math.round((workflows.pendingAgeDistribution.oneToThreeDays / totalPending) * 100)}
                className="h-1.5"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {isBn ? '৪ - ৭ দিন' : '4 - 7 Days'}
                </span>
                <span className="font-semibold text-foreground">
                  {workflows.pendingAgeDistribution.fourToSevenDays}
                </span>
              </div>
              <Progress
                value={Math.round((workflows.pendingAgeDistribution.fourToSevenDays / totalPending) * 100)}
                className="h-1.5"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-rose-600 dark:text-rose-400 font-medium">
                  {isBn ? '> ৭ দিন (বিলম্বিত)' : '> 7 Days (Overdue)'}
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {workflows.pendingAgeDistribution.overSevenDays}
                </span>
              </div>
              <Progress
                value={Math.round((workflows.pendingAgeDistribution.overSevenDays / totalPending) * 100)}
                className="h-1.5"
              />
            </div>
          </div>
        </div>

        {/* Clinical Safety Protocol Notice */}
        <div className="flex items-start gap-2 p-2.5 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 text-xs">
          <ShieldCheck className="size-4 shrink-0 mt-0.5" />
          <span>
            {isBn
              ? 'ক্লিনিকাল গভর্নেন্স নীতি: জরুরি লক্ষণযুক্ত (যেমন রক্তকাশি) রোগীদের জন্য পর্যালোচনার সারির বিলম্ব প্রযোজ্য নয়; তাৎক্ষণিক জরুরি সতর্কবার্তা প্রদর্শিত হয়।'
              : 'Clinical Governance Rule: Urgent red-flag symptoms bypass routine queue aging and trigger immediate clinical alerts.'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
