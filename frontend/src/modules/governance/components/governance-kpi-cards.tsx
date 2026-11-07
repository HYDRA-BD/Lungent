'use client'

import React from 'react'
import {
  ShieldCheck,
  BookOpen,
  Users,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { useLanguage } from '@/i18n'
import type { GovernanceDashboardSummary } from '../types'

interface GovernanceKpiCardsProps {
  summary: GovernanceDashboardSummary
}

export function GovernanceKpiCards({ summary }: GovernanceKpiCardsProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.clinicalGovernance

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title={t.activeMethodologies}
        value={summary.activeMethodologies}
        description={
          isBn
            ? `${summary.totalMethodologies}টি পদ্ধতির মধ্যে সক্রিয়`
            : `${summary.activeMethodologies} of ${summary.totalMethodologies} registered active`
        }
        icon={<BookOpen className="size-5 text-emerald-600" />}
      />

      <StatCard
        title={t.verifiedMembers}
        value={`${summary.verifiedMembers}/${summary.totalBoardMembers}`}
        description={
          isBn
            ? 'বিএমডিসি ও প্রাতিষ্ঠানিক সনদ যাচাইকৃত'
            : 'BMDC credentials verified by executive'
        }
        icon={<Users className="size-5 text-blue-600" />}
      />

      <StatCard
        title={t.recordedOverrides}
        value={summary.totalOverridesRecorded}
        description={
          isBn
            ? 'বাধ্যতামূলক ক্লিনিক্যাল যৌক্তিকতাসহ নথিভুক্ত'
            : 'Documented with mandatory clinical rationale'
        }
        icon={<ShieldCheck className="size-5 text-indigo-600" />}
      />

      <StatCard
        title={t.overdueReviews}
        value={summary.overdueReviewsCount}
        description={
          summary.overdueReviewsCount > 0
            ? isBn
              ? 'অবিলম্বে সিএবি মূল্যায়ন প্রয়োজন'
              : 'Immediate CAB reassessment required'
            : isBn
              ? 'সকল পর্যালোচনা সময়সূচী অনুযায়ী হালনাগাদ'
              : 'All methodology reviews up-to-date'
        }
        icon={
          summary.overdueReviewsCount > 0 ? (
            <AlertCircle className="size-5 text-amber-600" />
          ) : (
            <Clock className="size-5 text-emerald-600" />
          )
        }
      />
    </div>
  )
}
