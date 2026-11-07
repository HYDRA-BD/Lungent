'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { DataQualitySummary } from '../types'
import { useLanguage } from '@/i18n'
import { ShieldCheck } from 'lucide-react'

export interface DataQualityMonitorCardProps {
  dataQuality: DataQualitySummary
}

export function DataQualityMonitorCard({
  dataQuality,
}: DataQualityMonitorCardProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <CardTitle className="text-base">
              {isBn ? 'তথ্যের মান, সম্পূর্ণতা ও নির্ভরযোগ্যতা' : 'Data Quality, Completeness & Reliability'}
            </CardTitle>
          </div>
          <Badge
            variant={dataQuality.overallQualityScorePercent >= 90 ? 'success' : 'warning'}
            size="sm"
          >
            {dataQuality.overallQualityScorePercent}% {isBn ? 'সততা সূচক' : 'Integrity'}
          </Badge>
        </div>
        <CardDescription>
          {isBn
            ? 'রোগী প্রোফাইল এবং ক্লিনিকাল ইনপুটের সম্পূর্ণতা মূল্যায়ন (বৈধ ঐচ্ছিক তথ্য ঘাটতি ত্রুটি হিসেবে গণ্য নয়)।'
            : 'Evaluation of essential profile completeness, input gaps, and sync consistency across records.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-foreground">
              {isBn ? 'সামগ্রিক ডেটা কোয়ালিটি স্কোর' : 'Overall Record Quality Index'}
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {dataQuality.overallQualityScorePercent}%
            </span>
          </div>
          <Progress value={dataQuality.overallQualityScorePercent} className="h-2" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center pt-1">
          <div className="p-2.5 rounded border border-border bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">
              {isBn ? 'অসম্পূর্ণ প্রোফাইল' : 'Incomplete Profiles'}
            </span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {dataQuality.incompletePatientProfilesCount}
            </span>
          </div>

          <div className="p-2.5 rounded border border-border bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">
              {isBn ? 'ধূমপান তথ্য বাকি' : 'Missing Smoking Data'}
            </span>
            <span className="text-lg font-bold text-foreground">
              {dataQuality.missingCriticalSmokingCount}
            </span>
          </div>

          <div className="p-2.5 rounded border border-border bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">
              {isBn ? 'ভৌগোলিক ঘাটতি' : 'Missing Geography'}
            </span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {dataQuality.missingGeographicInfoCount}
            </span>
          </div>

          <div className="p-2.5 rounded border border-border bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">
              {isBn ? 'সমন্বয় ব্যর্থতা' : 'Sync Conflicts'}
            </span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {dataQuality.syncFailuresCount}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded border border-border bg-muted/30 text-xs text-muted-foreground">
          {isBn
            ? 'পদ্ধতিগত সীমানা: তথ্যের মান যাচাইয়ের ভিত্তিতে স্বয়ংক্রিয়ভাবে কোনো রোগীর ক্লিনিকাল রেকর্ড পরিবর্তন করা হয় না।'
            : 'Operational Boundary: Patient records are never automatically altered based on data quality analytics.'}
        </div>
      </CardContent>
    </Card>
  )
}
