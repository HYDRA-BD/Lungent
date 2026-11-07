'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PlatformPerformanceSummary } from '../types'
import { useLanguage } from '@/i18n'
import { Activity, Server, ShieldCheck } from 'lucide-react'

export interface PlatformPerformanceCardProps {
  performance: PlatformPerformanceSummary
}

export function PlatformPerformanceCard({
  performance,
}: PlatformPerformanceCardProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <CardTitle className="text-base">
              {isBn ? 'সিস্টেম সক্ষমতা ও কারিগরি টেলিমেট্রি' : 'Platform Reliability & Technical Telemetry'}
            </CardTitle>
          </div>
          <Badge variant="success" size="sm" className="flex items-center gap-1">
            <Server className="size-3" />
            {performance.uptimePercent}% {isBn ? 'আপটাইম' : 'Uptime'}
          </Badge>
        </div>
        <CardDescription>
          {isBn
            ? 'সার্ভারলেস এপিআই কার্যকারিতা, লেটেন্সি এবং ত্রুটি পর্যবেক্ষণ (কোনো ব্যক্তিগত বা সংবেদনশীল ডেটা ব্যতিরেকে)।'
            : 'Operational telemetry monitoring API latencies, server error rates, and delivery health without capturing PHI.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 rounded border border-border bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">
              {isBn ? 'এপিআই ভলিউম' : 'API Volume'}
            </span>
            <span className="text-xl font-bold text-foreground">
              {performance.apiRequestVolume}
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              {isBn ? 'মোট কল' : 'invocations'}
            </span>
          </div>

          <div className="p-2.5 rounded border border-border bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">
              {isBn ? 'সার্ভার ত্রুটির হার' : 'Error Rate'}
            </span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {performance.apiErrorRatePercent}%
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
              HTTP 5xx &lt; 0.1%
            </span>
          </div>

          <div className="p-2.5 rounded border border-border bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">
              {isBn ? 'গড় রেসপন্স সময়' : 'Avg Latency'}
            </span>
            <span className="text-xl font-bold text-primary">
              {performance.avgResponseTimeMs}ms
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              {isBn ? 'এজ এক্সিকিউশন' : 'edge runtime'}
            </span>
          </div>

          <div className="p-2.5 rounded border border-border bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">
              {isBn ? 'নোটিফিকেশন সাফল্য' : 'Dispatch Rate'}
            </span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {performance.notificationDeliverySuccessRate}%
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              SMS/Email
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded border border-border bg-muted/30 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {isBn ? 'অনুমোদন ও লগইন ব্যর্থতা:' : 'Authentication / Authorization Failures:'}
          </span>
          <span className="font-semibold text-foreground">
            {performance.authFailuresCount}
          </span>
        </div>

        <div className="flex items-start gap-2 p-2.5 rounded border border-border bg-muted/30 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <span>
            {isBn
              ? 'নিরাপত্তা নিশ্চয়তা: প্ল্যাটফর্ম টেলিমেট্রিতে পাসওয়ার্ড, টোকেন বা কোনো স্বাস্থ্য সংক্রান্ত তথ্য সংরক্ষণ করা হয় না।'
              : 'Security Assurance: Telemetry streams strictly exclude passwords, tokens, API credentials, and patient identifiers.'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
