'use client'

/**
 * Phase 1.22: Healthcare Worker Reports Management Client
 *
 * Allows frontline healthcare workers to view, generate, preview,
 * and download patient assessment summaries and referral consultation letters.
 */

import React, { useState } from 'react'
import {
  FilePlus,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useLanguage } from '@/i18n'
import type { GeneratedReportRecord } from '@/modules/reporting/types'
import { ReportHistoryTable } from '@/modules/reporting/components/report-history-table'
import { GenerateReportDialog } from '@/modules/reporting/components/generate-report-dialog'

interface WorkerReportsClientProps {
  initialReports: GeneratedReportRecord[]
}

export function WorkerReportsClient({ initialReports }: WorkerReportsClientProps) {
  const { dict, locale } = useLanguage()
  const rptDict = dict.reports

  const [reports, setReports] = useState<GeneratedReportRecord[]>(initialReports)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)

  const handleReportGenerated = (newReport: GeneratedReportRecord) => {
    setReports(prev => [newReport, ...prev])
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {locale === 'bn' ? 'কমিউনিটি ও ফিল্ড রিপোর্টস' : 'Field Reports & Patient Summaries'}
            </h1>
            <Badge variant="outline" className="border-teal-500/40 text-teal-700 bg-teal-50/50">
              {locale === 'bn' ? 'স্বাস্থ্যকর্মী পোর্টাল' : 'Worker Portal'}
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-3xl">
            {locale === 'bn'
              ? 'কমিউনিটি আউটরিচে সংগৃহীত তথ্যের ভিত্তিতে রোগীর মূল্যায়ন রিপোর্ট ও রেফারেল চিঠি সংগ্রহ ও প্রিন্ট করুন।'
              : 'Access printable assessment summaries and specialist consultation referral letters for community patients.'}
          </p>
        </div>

        <Button
          onClick={() => setIsGenerateOpen(true)}
          className="bg-teal-700 hover:bg-teal-800 text-white gap-1.5 self-start sm:self-auto text-xs"
        >
          <FilePlus className="h-4 w-4" />
          {locale === 'bn' ? 'নতুন সারসংক্ষেপ' : 'Generate Summary'}
        </Button>
      </div>

      {/* Safety Notice */}
      <Alert className="bg-teal-50/50 border-teal-200">
        <AlertCircle className="h-4 w-4 text-teal-700" />
        <AlertTitle className="text-xs sm:text-sm font-semibold text-teal-900">
          {locale === 'bn' ? 'কমিউনিটি স্বাস্থ্যকর্মীদের জন্য নির্দেশনা' : 'Field Worker Governance Guidance'}
        </AlertTitle>
        <AlertDescription className="text-xs mt-1 text-teal-800/90 leading-relaxed">
          {rptDict.nonDiagnosticNotice} {rptDict.safetyRuleNotice}
        </AlertDescription>
      </Alert>

      {/* Reports Archive */}
      <ReportHistoryTable
        reports={reports}
        allowGeneration={true}
        onGenerateClick={() => setIsGenerateOpen(true)}
      />

      {/* Generate Dialog */}
      <GenerateReportDialog
        open={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        patientId="11111111-1111-4111-a111-111111111111"
        patientName="Rafiqul Islam"
        onReportGenerated={handleReportGenerated}
      />
    </div>
  )
}
