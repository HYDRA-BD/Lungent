'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { EnvironmentalAvailabilitySummary } from '../types'
import { useLanguage } from '@/i18n'
import { Cloud, Wifi, AlertTriangle } from 'lucide-react'

export interface EnvironmentalAvailabilityCardProps {
  environmental: EnvironmentalAvailabilitySummary
}

export function EnvironmentalAvailabilityCard({
  environmental,
}: EnvironmentalAvailabilityCardProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="size-4 text-primary" />
            <CardTitle className="text-base">
              {isBn ? 'পরিবেশগত এপিআই প্রাপ্যতা ও ডেটা সতেজতা' : 'Environmental API Availability & Coverage'}
            </CardTitle>
          </div>
          <Badge
            variant={environmental.isOperational ? 'success' : 'destructive'}
            size="sm"
            className="flex items-center gap-1"
          >
            <Wifi className="size-3" />
            {environmental.isOperational ? (isBn ? 'সক্রিয়' : 'Operational') : (isBn ? 'বিঘ্নিত' : 'Degraded')}
          </Badge>
        </div>
        <CardDescription>
          {isBn
            ? `${environmental.providerName} সংযোগের আপটাইম, ক্যাশ পারফরম্যান্স এবং ডেটা সংগ্রহের পর্যবেক্ষণ।`
            : `Uptime, cache performance, and observation freshness for ${environmental.providerName}.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 rounded border border-border bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">
              {isBn ? 'এপিআই প্রাপ্যতা' : 'Service Availability'}
            </span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {environmental.availabilityPercent}%
            </span>
          </div>

          <div className="p-2.5 rounded border border-border bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">
              {isBn ? 'ক্যাশ হিট রেশিও' : 'Cache Hit Ratio'}
            </span>
            <span className="text-xl font-bold text-primary">
              {environmental.cacheHitRatioPercent}%
            </span>
          </div>

          <div className="p-2.5 rounded border border-border bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">
              {isBn ? 'ডেটা সতেজতা' : 'Observation Age'}
            </span>
            <span className="text-xl font-bold text-foreground">
              {environmental.freshnessMinutes}m
            </span>
          </div>

          <div className="p-2.5 rounded border border-border bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">
              {isBn ? 'তথ্য ঘাটতি' : 'Missing Observations'}
            </span>
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {environmental.dataGapsCount}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {isBn ? 'সফল অনুরোধের শতকরা হার' : 'Successful Request Ratio'}
            </span>
            <span className="font-semibold text-foreground">
              {environmental.successfulRequests} / {environmental.totalRequests}
            </span>
          </div>
          <Progress value={environmental.availabilityPercent} className="h-1.5" />
        </div>

        {/* Clinical Safety Non-Diagnostic Disclaimer */}
        <div className="flex items-start gap-2 p-2.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300 text-xs">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <span>
            {isBn
              ? 'ক্লিনিকাল নন-ডায়াগনস্টিক সতর্কতা: তথ্যের অনুপস্থিতি বা শূন্য রেকর্ড কোনো অবস্থাতেই শূন্য বায়ু দূষণ নির্দেশ করে না। বর্তমান একিউআই দীর্ঘমেয়াদী এক্সপোজারের বিকল্প নয়।'
              : 'Clinical Governance Rule: Missing observation data must NEVER be interpreted as zero pollution. Current AQI does not represent lifetime cumulative exposure.'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
