'use client'

/**
 * Phase 1.22: Patient Portal - Documents & Reports Client
 *
 * Provides patients with direct access to view, preview, and download their
 * authorized clinical assessment reports and specialist documents in English or Bangla.
 */

import React, { useState } from 'react'
import {
  FileText,
  Download,
  FileCheck,
  Calendar,
  Lock,
} from 'lucide-react'
import { useLanguage } from '@/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import type { PatientDocumentItem } from '@/modules/patient-portal/types'
import type { GeneratedReportRecord } from '@/modules/reporting/types'
import { ReportCard } from '@/modules/reporting/components/report-card'
import { ReportViewerModal } from '@/modules/reporting/components/report-viewer-modal'
import { formatDate } from '@/i18n/formatters'

interface PatientDocumentsClientProps {
  documents: PatientDocumentItem[]
  reports?: GeneratedReportRecord[]
}

export function PatientDocumentsClient({ documents, reports = [] }: PatientDocumentsClientProps) {
  const { dict, locale } = useLanguage()
  const pt = dict.patientPortal
  const rptDict = dict.reports

  const [selectedReport, setSelectedReport] = useState<GeneratedReportRecord | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const handlePreviewReport = (report: GeneratedReportRecord) => {
    setSelectedReport(report)
    setIsViewerOpen(true)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getDocTypeBadge = (docType: string) => {
    switch (docType) {
      case 'clinical_summary':
        return <Badge variant="outline" className="border-teal-500/40 text-teal-700 bg-teal-50/50">Clinical Summary</Badge>
      case 'referral_letter':
        return <Badge variant="outline" className="border-teal-500/40 text-teal-700 bg-teal-50/50">Referral Letter</Badge>
      case 'screening_report':
        return <Badge variant="outline" className="border-indigo-500/40 text-indigo-700 bg-indigo-50/50">Screening Report</Badge>
      default:
        return <Badge variant="secondary">{docType.replace(/_/g, ' ')}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {pt.documents.title}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm max-w-3xl">
          {pt.documents.subtitle}
        </p>
      </div>

      {/* Security & Non-Diagnostic Banner */}
      <Alert className="bg-teal-50/50 border-teal-200">
        <Lock className="h-4 w-4 text-teal-700" />
        <AlertTitle className="font-semibold text-teal-900 text-xs sm:text-sm">
          Protected Health Document Vault
        </AlertTitle>
        <AlertDescription className="text-xs mt-1 text-teal-800/90 leading-relaxed">
          {pt.documents.securityNotice} {rptDict.nonDiagnosticNotice}
        </AlertDescription>
      </Alert>

      {/* Section 1: Generated Clinical Assessment Reports */}
      {reports.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {locale === 'bn' ? 'ক্লিনিক্যাল মূল্যায়ন প্রতিবেদনসমূহ' : 'Assessment Reports & CDSS Summaries'}
            </h2>
            <Badge variant="secondary" className="text-xs">
              {reports.length} {locale === 'bn' ? 'প্রতিবেদন' : 'Reports'}
            </Badge>
          </div>

          <div className="space-y-3">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onPreview={handlePreviewReport}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Document Vault Archive */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {locale === 'bn' ? 'সংরক্ষিত নথিপত্র ভল্ট' : 'Document Vault & Official Records'}
          </h2>
          <Badge variant="secondary" className="text-xs">
            {documents.length} {locale === 'bn' ? 'নথি' : 'Documents'}
          </Badge>
        </div>

        {documents.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-12 text-center space-y-3">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="text-base font-semibold text-foreground">
                {pt.documents.noDocuments}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {locale === 'bn'
                  ? 'সংরক্ষিত ক্লিনিক্যাল রেকর্ডসমূহ এখানে সংরক্ষিত থাকবে।'
                  : 'Generated clinical summary reports, specialist letters, and diagnostic records will be securely archived here once finalized.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="border-border hover:border-teal-500/30 transition-all">
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-700 mt-0.5 shrink-0">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-foreground text-sm">
                          {doc.title}
                        </h4>
                        {getDocTypeBadge(doc.documentType)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(doc.createdAt, locale)}
                        </span>
                        <span>Size: {formatFileSize(doc.fileSizeBytes)}</span>
                        <span className="font-mono text-[10px]">ID: {doc.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 gap-1.5"
                      onClick={() => window.print()}
                    >
                      <Download className="h-3.5 w-3.5" />
                      {pt.documents.downloadBtn}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Viewer Modal */}
      <ReportViewerModal
        open={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        report={selectedReport}
      />
    </div>
  )
}
