'use client'

/**
 * Phase 1.22: Report History & Archive Table Component
 *
 * Filterable, responsive table for browsing, previewing, and downloading
 * patient and clinical assessment reports across all Lungent workspaces.
 */

import React, { useState, useMemo } from 'react'
import {
  Search,
  FileText,
  Eye,
  Download,
  Languages,
  FilePlus,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/i18n'
import type { GeneratedReportRecord, ReportType } from '../types'
import { ReportViewerModal } from './report-viewer-modal'
import { preserveCanonicalIdentifier, formatDate } from '@/i18n/formatters'

interface ReportHistoryTableProps {
  reports: GeneratedReportRecord[]
  allowGeneration?: boolean
  onGenerateClick?: () => void
  patientIdFilter?: string
}

export function ReportHistoryTable({
  reports,
  allowGeneration = false,
  onGenerateClick,
  patientIdFilter,
}: ReportHistoryTableProps) {
  const { locale } = useLanguage()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [selectedReport, setSelectedReport] = useState<GeneratedReportRecord | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (patientIdFilter && r.patientId !== patientIdFilter) return false

      if (selectedType !== 'all' && r.reportType !== selectedType) return false
      if (selectedLanguage !== 'all' && r.language !== selectedLanguage) return false

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesRef = r.reportReference.toLowerCase().includes(query)
        const matchesTitle = r.title.toLowerCase().includes(query)
        const matchesPatient = r.patientName.toLowerCase().includes(query)
        const matchesCanonical = r.patientCanonicalId.toLowerCase().includes(query)
        if (!matchesRef && !matchesTitle && !matchesPatient && !matchesCanonical) return false
      }

      return true
    })
  }, [reports, patientIdFilter, selectedType, selectedLanguage, searchQuery])

  const handlePreview = (report: GeneratedReportRecord) => {
    setSelectedReport(report)
    setIsViewerOpen(true)
  }

  const getTypeBadge = (type: ReportType) => {
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

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/20 p-3 rounded-lg border border-border">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              locale === 'bn'
                ? 'আইডি বা নাম দিয়ে অনুসন্ধান...'
                : 'Search by report ID or patient...'
            }
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">{locale === 'bn' ? 'সকল ধরন' : 'All Types'}</option>
            <option value="patient_assessment">{locale === 'bn' ? 'রোগী মূল্যায়ন' : 'Patient Assessment'}</option>
            <option value="clinical_assessment">{locale === 'bn' ? 'ক্লিনিক্যাল মূল্যায়ন' : 'Clinical Assessment'}</option>
            <option value="risk_estimation">{locale === 'bn' ? 'ঝুঁকি প্রাক্কলন' : 'Risk Estimation'}</option>
            <option value="screening_eligibility">{locale === 'bn' ? 'স্ক্রীনিং যোগ্যতা' : 'Screening Eligibility'}</option>
            <option value="symptom_triage">{locale === 'bn' ? 'লক্ষণ ট্রায়াজ' : 'Symptom Triage'}</option>
            <option value="referral_followup">{locale === 'bn' ? 'রেফারেল ও ফলো-আপ' : 'Referral Follow-up'}</option>
          </select>

          {/* Language Filter */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">{locale === 'bn' ? 'সকল ভাষা' : 'All Languages'}</option>
            <option value="en">English</option>
            <option value="bn">বাংলা (Bangla)</option>
          </select>

          {allowGeneration && (
            <Button
              size="sm"
              onClick={onGenerateClick}
              className="text-xs h-8 gap-1.5 bg-teal-700 hover:bg-teal-800 text-white"
            >
              <FilePlus className="h-3.5 w-3.5" />
              {locale === 'bn' ? 'নতুন প্রতিবেদন' : 'New Report'}
            </Button>
          )}
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center space-y-3">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
            <h4 className="text-sm font-semibold text-foreground">
              {locale === 'bn' ? 'কোনো প্রতিবেদন পাওয়া যায়নি' : 'No Reports Found'}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {locale === 'bn'
                ? 'অনুসন্ধানের মানদণ্ড পরিবর্তন করুন অথবা নতুন প্রতিবেদন তৈরি করুন।'
                : 'Adjust your search filters or generate a new assessment report.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">{locale === 'bn' ? 'কোড ও শিরোনাম' : 'Reference & Title'}</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">{locale === 'bn' ? 'রোগী' : 'Patient'}</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">{locale === 'bn' ? 'ধরন' : 'Type'}</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">{locale === 'bn' ? 'ভাষা' : 'Language'}</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">{locale === 'bn' ? 'তারিখ' : 'Date'}</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px] text-right">{locale === 'bn' ? 'পদক্ষেপ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-medium text-teal-700">
                        {preserveCanonicalIdentifier(report.reportReference)}
                      </div>
                      <div className="font-semibold text-foreground text-xs line-clamp-1 max-w-xs">
                        {report.title}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-foreground">{report.patientName}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {preserveCanonicalIdentifier(report.patientCanonicalId)}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      {getTypeBadge(report.reportType)}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="secondary" className="text-[10px] gap-1 font-normal">
                        <Languages className="h-2.5 w-2.5" />
                        {report.language === 'bn' ? 'বাংলা' : 'EN'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(report.createdAt, locale)}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(report)}
                          className="h-7 px-2 text-xs gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          {locale === 'bn' ? 'প্রিভিউ' : 'View'}
                        </Button>
                        <a
                          href={`/api/reports/${report.id}/download?format=pdf`}
                          download={`${report.reportReference}-${report.reportType}.pdf`}
                          className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 px-2 text-xs gap-1 transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          {locale === 'bn' ? 'পিডিএফ' : 'PDF'}
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Viewer Modal */}
      <ReportViewerModal
        open={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        report={selectedReport}
      />
    </div>
  )
}
