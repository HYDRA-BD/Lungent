'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { ReferralFollowUpSummary } from '../types'
import { useLanguage } from '@/i18n'
import { GitPullRequest, CalendarClock, AlertOctagon } from 'lucide-react'

export interface ReferralFollowUpFunnelCardProps {
  referrals: ReferralFollowUpSummary
}

export function ReferralFollowUpFunnelCard({
  referrals,
}: ReferralFollowUpFunnelCardProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const totalReferrals = referrals.referralsTotal || 1
  const totalFollowUps = referrals.followUpsTotal || 1

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Specialist Referral Pipeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitPullRequest className="size-4 text-primary" />
              <CardTitle className="text-base">
                {isBn ? 'বিশেষায়িত রেফারেল ব্যবস্থাপনা পাইপলাইন' : 'Specialist Referral Progression'}
              </CardTitle>
            </div>
            <Badge variant="outline" size="sm">
              {referrals.referralsTotal} {isBn ? 'মোট' : 'Total'}
            </Badge>
          </div>
          <CardDescription>
            {isBn
              ? 'টার্শিয়ারি হাসপাতাল এবং পালমোনোলজি সেন্টারে প্রেরিত রেফারেলের স্থিতি অগ্রগতি।'
              : 'End-to-end lifecycle progression for specialist referrals to tertiary pulmonary hubs.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded border border-border bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">
                {isBn ? 'অপেক্ষমাণ' : 'Pending'}
              </span>
              <span className="text-lg font-bold text-foreground">
                {referrals.referralsByStatus.pending}
              </span>
            </div>
            <div className="p-2.5 rounded border border-border bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">
                {isBn ? 'গৃহীত' : 'Accepted'}
              </span>
              <span className="text-lg font-bold text-primary">
                {referrals.referralsByStatus.accepted}
              </span>
            </div>
            <div className="p-2.5 rounded border border-border bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">
                {isBn ? 'নির্ধারিত' : 'Scheduled'}
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {referrals.referralsByStatus.scheduled}
              </span>
            </div>
            <div className="p-2.5 rounded border border-border bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">
                {isBn ? 'সম্পন্ন' : 'Completed'}
              </span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {referrals.referralsByStatus.completed}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {isBn ? 'গড় রেফারেল প্রক্রিয়াকরণ সময়' : 'Average Processing Turnaround'}
              </span>
              <span className="font-semibold text-foreground">
                {referrals.turnaroundDaysAvg} {isBn ? 'দিন' : 'days'}
              </span>
            </div>
            <Progress
              value={Math.round((referrals.referralsByStatus.completed / totalReferrals) * 100)}
              className="h-1.5"
            />
          </div>

          <div className="p-2.5 rounded border border-border bg-muted/30 text-xs text-muted-foreground">
            {isBn
              ? 'রেফারেল গ্রহণ মানেই রোগী সেবা পেয়েছেন তা নিশ্চিত নয়; সম্পন্ন স্থিতি হাসপাতালের চূড়ান্ত ডকুমেন্টের ওপর নির্ভরশীল।'
              : 'Referral acceptance does not imply completed care; completed status requires documented clinical outcome.'}
          </div>
        </CardContent>
      </Card>

      {/* 2. Longitudinal Follow-Up Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="size-4 text-primary" />
              <CardTitle className="text-base">
                {isBn ? 'ফলো-আপ ও অ্যাপয়েন্টমেন্ট ট্র্যাকিং' : 'Follow-up Schedule & Overdue Tracking'}
              </CardTitle>
            </div>
            <Badge variant="outline" size="sm">
              {referrals.followUpsTotal} {isBn ? 'নির্ধারিত' : 'Scheduled'}
            </Badge>
          </div>
          <CardDescription>
            {isBn
              ? 'সিটি স্ক্যান পর্যালোচনা, চিকিৎসা পর্যবেক্ষণ এবং সময়মতো উপস্থিতি যাচাই।'
              : 'Tracking upcoming, completed, and overdue follow-up appointments.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded border border-border bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">
                {isBn ? 'আসন্ন' : 'Upcoming'}
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {referrals.upcomingFollowUps}
              </span>
            </div>
            <div className="p-2.5 rounded border border-border bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">
                {isBn ? 'সম্পন্ন' : 'Completed'}
              </span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {referrals.completedFollowUps}
              </span>
            </div>
            <div className="p-2.5 rounded border border-border bg-rose-500/5 text-rose-600 dark:text-rose-400">
              <span className="text-[11px] block">
                {isBn ? 'বিলম্বে থাকা' : 'Overdue'}
              </span>
              <span className="text-lg font-bold">
                {referrals.overdueFollowUps}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {isBn ? 'সময়মতো উপস্থিতি হার' : 'On-Time Completion Rate'}
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {Math.round((referrals.completedFollowUps / totalFollowUps) * 100)}%
              </span>
            </div>
            <Progress
              value={Math.round((referrals.completedFollowUps / totalFollowUps) * 100)}
              className="h-1.5"
            />
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300 text-xs">
            <AlertOctagon className="size-4 shrink-0 mt-0.5" />
            <span>
              {isBn
                ? 'বিলম্বে থাকা ফলো-আপ অ্যাপয়েন্টমেন্টসমূহের জন্য সংশ্লিষ্ট স্বাস্থ্যকর্মীকে রোগী আউটরিচের নোটিফিকেশন পাঠানো হয়।'
                : 'Overdue follow-ups automatically notify the assigned care coordinator for community outreach.'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
