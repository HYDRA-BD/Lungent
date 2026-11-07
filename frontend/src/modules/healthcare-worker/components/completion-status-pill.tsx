'use client'

import React from 'react'
import Link from 'next/link'
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/i18n'
import type { CompletionLevel } from '../types'

interface CompletionStatusPillProps {
  score: number
  status: CompletionLevel
  patientId?: string
  clickable?: boolean
}

export function CompletionStatusPill({
  score,
  status,
  patientId,
  clickable = true,
}: CompletionStatusPillProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const getVariant = () => {
    switch (status) {
      case 'complete':
        return 'success'
      case 'partially_complete':
        return 'warning'
      case 'incomplete':
      default:
        return 'destructive'
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
      case 'partially_complete':
        return <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400" />
      case 'incomplete':
      default:
        return <AlertCircle className="size-3 text-destructive" />
    }
  }

  const getLabel = () => {
    switch (status) {
      case 'complete':
        return isBn ? 'সম্পূর্ণ রেকর্ড' : 'Complete Record'
      case 'partially_complete':
        return isBn ? 'আংশিক তথ্য' : 'Partially Complete'
      case 'incomplete':
      default:
        return isBn ? 'অসম্পূর্ণ' : 'Incomplete Record'
    }
  }

  const badgeContent = (
    <div className="inline-flex items-center gap-1.5 font-medium">
      {getIcon()}
      <span>
        {score}% • {getLabel()}
      </span>
    </div>
  )

  if (clickable && patientId && status !== 'complete') {
    return (
      <Link
        href={`/healthcare-worker/patients/${patientId}/health-record`}
        className="inline-block transition-transform hover:scale-105"
        title={isBn ? 'স্বাস্থ্য তথ্য সম্পূর্ণ করতে ক্লিক করুন' : 'Click to complete missing health record'}
      >
        <Badge variant={getVariant()} size="sm">
          {badgeContent}
        </Badge>
      </Link>
    )
  }

  return (
    <Badge variant={getVariant()} size="sm">
      {badgeContent}
    </Badge>
  )
}
