'use client'

/**
 * Phase 1.22: Report Card Component
 *
 * Displays report metadata, type badges, status pills,
 * and quick action triggers (Preview, PDF Download).
 */

import React from 'react'
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Languages,
  Lock,
  Globe,
  HardDrive,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/i18n'
import type { GeneratedReportRecord } from '../types'
import { preserveCanonicalIdentifier, formatDate } from '@/i18n/formatters'

interface ReportCardProps {
  report: GeneratedReportRecord
  onPreview: (report: GeneratedReportRecord) => void
}

export function ReportCard({ report, onPreview }: ReportCardProps) {
  const { locale } = useLanguage()

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'patient_assessment':
        return <Badge variant="outline" className="border-teal-500/40 text-teal-700 bg-teal-50/50">Patient Assessment</Badge>
      case 'clinical_assessment':
        return <Badge variant="outline" className="border-indigo-500/40 text-indigo-700 bg-indigo-50/50">Clinical CDSS</Badge>
      case 'risk_estimation':
        return <Badge variant="outline" className="border-amber-500/40 text-amber-700 bg-amber-50/50">Risk Estimation</Badge>
      case 'screening_eligibility':
        return <Badge variant="outline" className="border-blue-500/40 text-blue-700 bg-blue-50/50">Screening Eligibility</Badge>
      case 'symptom_triage':
        return <Badge variant="outline" className="border-rose-500/40 text-rose-700 bg-rose-50/50">Symptom Triage</Badge>
      case 'referral_followup':
        return <Badge variant="outline" className="border-purple-500/40 text-purple-700 bg-purple-50/50">Referral Follow-up</Badge>
      default:
        return <Badge variant="secondary">{type.replace(/_/g, ' ')}</Badge>
    }
  }

  const isBn = report.language === 'bn'

  return (
    <Card className="border-border hover:border-teal-500/40 transition-all shadow-sm">
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-700 mt-0.5 shrink-0">
            <FileText className="h-5 w-5" />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-foreground text-sm sm:text-base">
                {report.title}
              </h4>
              {getTypeBadge(report.reportType)}
              <Badge variant="secondary" className="text-[11px] font-normal flex items-center gap-1">
                <Languages className="h-3 w-3" />
                {isBn ? 'বাংলা' : 'English'}
              </Badge>
            </div>

            {report.summary && (
              <p className="text-xs text-muted-foreground line-clamp-2 max-w-2xl">
                {report.summary}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-muted-foreground pt-1">
              <span className="font-mono font-medium text-teal-700">
                {preserveCanonicalIdentifier(report.reportReference)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(report.createdAt, locale)}
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="h-3 w-3" />
                {formatFileSize(report.fileSizeBytes)}
              </span>
              {report.isPatientAccessible ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <Globe className="h-3 w-3" />
                  {locale === 'bn' ? 'রোগী অ্যাক্সেসযোগ্য' : 'Patient-Accessible'}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  {locale === 'bn' ? 'শুধুমাত্র চিকিৎসক' : 'Clinician-Only'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(report)}
            className="text-xs h-8 gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            {locale === 'bn' ? 'প্রিভিউ' : 'Preview'}
          </Button>

          <a
            href={`/api/reports/${report.id}/download?format=pdf`}
            download={`${report.reportReference}-${report.reportType}.pdf`}
            className="inline-flex items-center justify-center rounded-md text-xs font-medium h-8 px-3 gap-1.5 bg-teal-700 hover:bg-teal-800 text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            {locale === 'bn' ? 'পিডিএফ' : 'PDF'}
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
