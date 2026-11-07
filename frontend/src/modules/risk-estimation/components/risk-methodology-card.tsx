'use client'

import React from 'react'
import type { RiskMethodologyItem } from '../types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/i18n'

interface RiskMethodologyCardProps {
  methodology: RiskMethodologyItem
  isSelected?: boolean
  onSelect?: (methodology: RiskMethodologyItem) => void
}

export function RiskMethodologyCard({
  methodology,
  isSelected = false,
  onSelect,
}: RiskMethodologyCardProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.riskEstimation

  const statusVariantMap: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
    approved_for_clinical_use: 'default',
    awaiting_clinical_approval: 'secondary',
    under_validation: 'outline',
    research_only: 'outline',
    suspended: 'destructive',
    deprecated: 'destructive',
  }

  const statusTextMap: Record<string, string> = {
    approved_for_clinical_use: t.status.approved_for_clinical_use,
    awaiting_clinical_approval: t.status.awaiting_clinical_approval,
    under_validation: t.status.under_validation,
    research_only: t.status.research_only,
    suspended: t.status.suspended,
    deprecated: t.status.deprecated,
  }

  return (
    <Card
      className={`transition-all duration-200 ${
        isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'hover:border-border/80'
      } ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={() => onSelect?.(methodology)}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
              {methodology.code}
            </span>
            <Badge variant={statusVariantMap[methodology.lifecycleStatus] || 'outline'}>
              {statusTextMap[methodology.lifecycleStatus] || methodology.lifecycleStatus}
            </Badge>
          </div>
          {methodology.approvedForBangladesh ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t.badges.clinicalApproved}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {t.badges.unapproved}
            </span>
          )}
        </div>
        <CardTitle className="text-base mt-2">{methodology.name}</CardTitle>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {methodology.outputDefinition}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 text-xs">
        <div className="grid grid-cols-2 gap-2 p-2 rounded-md bg-muted/40">
          <div>
            <span className="text-muted-foreground block">{isBn ? 'গণনার ধরণ' : 'Calculation Type'}</span>
            <span className="font-medium text-foreground capitalize">{methodology.calculationType}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">{isBn ? 'উদ্দিষ্ট জনসংখ্যা' : 'Target Cohort'}</span>
            <span className="font-medium text-foreground truncate block" title={methodology.intendedPopulation}>
              {methodology.intendedPopulation}
            </span>
          </div>
        </div>

        {methodology.publicationReference && (
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground block">{isBn ? 'সূত্র প্রকাশনা:' : 'Citation:'}</span>
            <p className="italic text-[11px] truncate">{methodology.publicationReference}</p>
          </div>
        )}

        {methodology.knownLimitations && (
          <div className="p-2 rounded bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200">
            <span className="font-semibold block mb-0.5">{t.results.assumptionsAndLimitations}:</span>
            <p className="line-clamp-2">{methodology.knownLimitations}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
