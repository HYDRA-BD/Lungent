'use client'

/**
 * Phase 1.22: Interactive Report Viewer Modal
 *
 * Provides a responsive modal for previewing rendered clinical reports,
 * switching between preview languages, printing, and downloading binary PDFs.
 */

import React, { useRef, useState } from 'react'
import {
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/i18n'
import type { GeneratedReportRecord } from '../types'
import { logReportAccessAction } from '../actions'

interface ReportViewerModalProps {
  open: boolean
  onClose: () => void
  report: GeneratedReportRecord | null
}

export function ReportViewerModal({ open, onClose, report }: ReportViewerModalProps) {
  const { locale } = useLanguage()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [copied, setCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  if (!report) return null

  const handleCopyId = () => {
    navigator.clipboard.writeText(report.reportReference)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      logReportAccessAction(report.id, 'print')
      iframeRef.current.contentWindow.focus()
      iframeRef.current.contentWindow.print()
    }
  }

  const handleDownloadPdf = async () => {
    setIsDownloading(true)
    try {
      await logReportAccessAction(report.id, 'download_pdf')
      const link = document.createElement('a')
      link.href = `/api/reports/${report.id}/download?format=pdf`
      link.download = `${report.reportReference}-${report.reportType}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setIsDownloading(false)
    }
  }

  const isBn = report.language === 'bn'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={report.title}
      description={`${isBn ? 'রিপোর্ট কোড' : 'Reference'}: ${report.reportReference} | ${isBn ? 'ভাষা' : 'Language'}: ${isBn ? 'বাংলা' : 'English'}`}
      size="xl"
      className="max-h-[92vh] flex flex-col"
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyId}
              className="text-xs h-8 gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-teal-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? (locale === 'bn' ? 'কপি হয়েছে' : 'Copied!') : (locale === 'bn' ? 'কোড কপি' : 'Copy ID')}
            </Button>
            <a
              href={`/api/reports/${report.id}/preview`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-xs h-8 px-3 gap-1.5 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {locale === 'bn' ? 'নতুন ট্যাবে খুলুন' : 'Open in Tab'}
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs h-8 gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              {locale === 'bn' ? 'প্রিন্ট' : 'Print'}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="text-xs h-8 gap-1.5 bg-teal-700 hover:bg-teal-800 text-white"
            >
              <Download className="h-3.5 w-3.5" />
              {isDownloading
                ? (locale === 'bn' ? 'ডাউনলোড হচ্ছে...' : 'Downloading...')
                : (locale === 'bn' ? 'পিডিএফ ডাউনলোড' : 'Download PDF')}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-[65vh]">
        {/* Security & Verification Banner */}
        <div className="bg-muted/40 border border-border rounded-lg p-2.5 mb-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="text-muted-foreground">
              {locale === 'bn'
                ? 'অনুমোদিত ক্লিনিক্যাল প্রোটোকল ও ক্রিপ্টোগ্রাফিক স্ন্যাপশট দ্বারা সুরক্ষিত'
                : 'Verified Clinical Document with Immutable Cryptographic Snapshot'}
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase font-mono">
            {report.reportType.replace(/_/g, ' ')}
          </Badge>
        </div>

        {/* Embedded Document Frame */}
        <div className="flex-1 border border-border rounded-lg overflow-hidden bg-white shadow-inner">
          <iframe
            ref={iframeRef}
            srcDoc={report.contentHtml}
            title={report.title}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </Dialog>
  )
}
