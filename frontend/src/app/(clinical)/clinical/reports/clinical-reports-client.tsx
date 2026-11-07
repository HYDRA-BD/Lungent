'use client'

/**
 * Phase 1.22: Clinical Reports Management Workspace Client
 *
 * Provides clinicians with a centralized interface to browse, generate,
 * preview, and download structured clinical assessment reports across all pathways.
 */

import React, { useState } from 'react'
import {
  FileText,
  FilePlus,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Stethoscope,
  Info,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useLanguage } from '@/i18n'
import type { GeneratedReportRecord } from '@/modules/reporting/types'
import { ReportHistoryTable } from '@/modules/reporting/components/report-history-table'
import { GenerateReportDialog } from '@/modules/reporting/components/generate-report-dialog'

interface ClinicalReportsClientProps {
  initialReports: GeneratedReportRecord[]
}

export function ClinicalReportsClient({ initialReports }: ClinicalReportsClientProps) {
  const { dict, locale } = useLanguage()
  const rptDict = dict.reports

  const [reports, setReports] = useState<GeneratedReportRecord[]>(initialReports)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)

  // Metrics
  const totalCount = reports.length
  const clinicalCount = reports.filter(r => r.reportType === 'clinical_assessment').length
  const riskCount = reports.filter(r => r.reportType === 'risk_estimation').length
  const screeningCount = reports.filter(r => r.reportType === 'screening_eligibility').length
  const triageCount = reports.filter(r => r.reportType === 'symptom_triage').length

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
              {rptDict.title}
            </h1>
            <Badge variant="outline" className="border-teal-500/40 text-teal-700 bg-teal-50/50">
              {locale === 'bn' ? 'ক্লিনিক্যাল অডিট সক্রিয়' : 'Audited CDSS'}
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-3xl">
            {rptDict.subtitle}
          </p>
        </div>

        <Button
          onClick={() => setIsGenerateOpen(true)}
          className="bg-teal-700 hover:bg-teal-800 text-white gap-1.5 self-start sm:self-auto text-xs"
        >
          <FilePlus className="h-4 w-4" />
          {rptDict.newReport}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-border">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase">{locale === 'bn' ? 'মোট রিপোর্ট' : 'Total Reports'}</div>
              <div className="text-xl font-bold text-foreground mt-0.5">{totalCount}</div>
            </div>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-700">
              <FileText className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase">{locale === 'bn' ? 'ক্লিনিক্যাল CDSS' : 'Clinical CDSS'}</div>
              <div className="text-xl font-bold text-indigo-700 mt-0.5">{clinicalCount}</div>
            </div>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-700">
              <Stethoscope className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase">{locale === 'bn' ? 'ঝুঁকি প্রাক্কলন' : 'Risk Estimation'}</div>
              <div className="text-xl font-bold text-amber-700 mt-0.5">{riskCount}</div>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700">
              <Activity className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase">{locale === 'bn' ? 'স্ক্রীনিং যোগ্যতা' : 'Screening'}</div>
              <div className="text-xl font-bold text-blue-700 mt-0.5">{screeningCount}</div>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border col-span-2 sm:col-span-1">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase">{locale === 'bn' ? 'লক্ষণ ট্রায়াজ' : 'Triage Alerts'}</div>
              <div className="text-xl font-bold text-rose-700 mt-0.5">{triageCount}</div>
            </div>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Governance & Safety Alert */}
      <Alert className="bg-amber-50/60 border-amber-200 text-amber-900">
        <Info className="h-4 w-4 text-amber-700" />
        <AlertTitle className="text-xs sm:text-sm font-semibold">
          {locale === 'bn' ? 'ক্লিনিক্যাল গভর্নেন্স ও সিদ্ধান্ত নীতিমালা' : 'Clinical Governance & Provenance Rule'}
        </AlertTitle>
        <AlertDescription className="text-xs mt-1 text-amber-800/90 leading-relaxed">
          {rptDict.safetyRuleNotice} {rptDict.nonDiagnosticNotice}
        </AlertDescription>
      </Alert>

      {/* Reports Archive Table */}
      <ReportHistoryTable
        reports={reports}
        allowGeneration={true}
        onGenerateClick={() => setIsGenerateOpen(true)}
      />

      {/* Generate Report Dialog */}
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
