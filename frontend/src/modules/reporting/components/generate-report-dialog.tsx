'use client'

/**
 * Phase 1.22: On-Demand Report Generation Dialog
 *
 * Allows clinicians and authorized healthcare workers to generate structured
 * bilingual clinical reports directly from patient records and assessment engines.
 */

import React, { useState } from 'react'
import { FilePlus2, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/i18n'
import type { ReportType, ReportLanguage, GeneratedReportRecord } from '../types'
import { generateReportAction } from '../actions'

interface GenerateReportDialogProps {
  open: boolean
  onClose: () => void
  patientId: string
  patientName?: string
  onReportGenerated?: (report: GeneratedReportRecord) => void
}

export function GenerateReportDialog({
  open,
  onClose,
  patientId,
  patientName = 'Patient',
  onReportGenerated,
}: GenerateReportDialogProps) {
  const { locale } = useLanguage()

  const [reportType, setReportType] = useState<ReportType>('clinical_assessment')
  const [reportLanguage, setReportLanguage] = useState<ReportLanguage>(locale === 'bn' ? 'bn' : 'en')
  const [customNotes, setCustomNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await generateReportAction({
        patientId,
        reportType,
        language: reportLanguage,
        customNotes: customNotes.trim() || undefined,
      })

      if (res.success && res.data) {
        onReportGenerated?.(res.data)
        onClose()
      } else {
        setErrorMessage(res.error || 'Failed to generate report.')
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const reportTypes = [
    {
      value: 'patient_assessment' as const,
      labelEn: 'Patient Assessment Summary',
      labelBn: 'রোগীর ফুসফুস স্বাস্থ্য মূল্যায়ন সারসংক্ষেপ',
      descEn: 'Patient-friendly summary distinguishing self-reported vs verified metrics.',
      descBn: 'রোগী ও পরিবারের সহজে বোঝার উপযোগী বিশদ সারসংক্ষেপ।',
    },
    {
      value: 'clinical_assessment' as const,
      labelEn: 'Consolidated Clinical CDSS Report',
      labelBn: 'সমন্বিত ক্লিনিক্যাল সিদ্ধান্ত সহায়তা প্রতিবেদন',
      descEn: 'Consolidates Risk, Screening, and Triage with clinician decision logs.',
      descBn: 'ঝুঁকি, স্ক্রীনিং ও ট্রায়াজের সমন্বিত ফলাফল এবং চিকিৎসকের পর্যালোচনা।',
    },
    {
      value: 'risk_estimation' as const,
      labelEn: 'Lung Cancer Risk Estimation Report',
      labelBn: 'ফুসফুস ক্যান্সার ঝুঁকি প্রাক্কলন প্রতিবেদন',
      descEn: 'Dedicated PLCOm2012 risk probabilities and contributing factors.',
      descBn: 'অনুমোদিত মডেল দ্বারা গণনাকৃত দীর্ঘমেয়াদী ঝুঁকি ফলাফল।',
    },
    {
      value: 'screening_eligibility' as const,
      labelEn: 'Screening Eligibility (LDCT) Report',
      labelBn: 'স্ক্রীনিং যোগ্যতা (LDCT) মূল্যায়ন প্রতিবেদন',
      descEn: 'USPSTF 2021 criteria-by-criteria evaluation for low-dose CT.',
      descBn: 'প্রমিত স্ক্রীনিং নির্দেশিকা মোতাবেক যোগ্যতা ও মানদণ্ড বিশ্লেষণ।',
    },
    {
      value: 'symptom_triage' as const,
      labelEn: 'Symptom-Based Triage & Red-Flag Report',
      labelBn: 'লক্ষণভিত্তিক ট্রায়াজ ও লাল-পতাকা সতর্কতা প্রতিবেদন',
      descEn: 'NICE NG12 urgent escalation and alarm symptoms analysis.',
      descBn: 'জরুরি লাল-পতাকা লক্ষণ এবং দ্রুত রেফারেল সময়সীমা নির্দেশনা।',
    },
    {
      value: 'referral_followup' as const,
      labelEn: 'Healthcare Referral & Follow-up Report',
      labelBn: 'স্বাস্থ্যসেবা রেফারেল ও ফলো-আপ সারসংক্ষেপ প্রতিবেদন',
      descEn: 'Specialist consultation coordination and longitudinal schedule.',
      descBn: 'বিশেষায়িত রেফারেল পরামর্শ ও ফলো-আপ সূচি বিবরণী।',
    },
    {
      value: 'consolidated_history' as const,
      labelEn: 'Consolidated Longitudinal History',
      labelBn: 'ধারাবাহিক মূল্যায়ন ইতিহাস ও রেকর্ড',
      descEn: 'Chronological timeline across all prior assessments and triage events.',
      descBn: 'সমস্ত পূর্ববর্তী স্ক্রীনিং ও ট্রায়াজ ইভেন্টের কালানুক্রমিক সারসংক্ষেপ।',
    },
  ]

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={locale === 'bn' ? 'নতুন ক্লিনিক্যাল প্রতিবেদন তৈরি করুন' : 'Generate Clinical Report'}
      description={
        locale === 'bn'
          ? `${patientName}-এর জন্য অনুমোদিত রেকর্ড থেকে নতুন প্রতিবেদন তৈরি`
          : `Generate an audited, structured document for ${patientName}`
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Report Type Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            {locale === 'bn' ? 'প্রতিবেদনের প্রকার নির্বাচন করুন:' : 'Select Report Type:'}
          </label>
          <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
            {reportTypes.map((t) => (
              <label
                key={t.value}
                className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  reportType === t.value
                    ? 'border-teal-600 bg-teal-50/40 text-teal-900 font-medium'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <input
                  type="radio"
                  name="reportType"
                  value={t.value}
                  checked={reportType === t.value}
                  onChange={() => setReportType(t.value)}
                  className="mt-0.5 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <div className="text-foreground font-semibold">
                    {locale === 'bn' ? t.labelBn : t.labelEn}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {locale === 'bn' ? t.descBn : t.descEn}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-semibold text-foreground">
            {locale === 'bn' ? 'প্রতিবেদনের ভাষা:' : 'Document Language:'}
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="radio"
                name="reportLanguage"
                value="en"
                checked={reportLanguage === 'en'}
                onChange={() => setReportLanguage('en')}
                className="text-teal-600"
              />
              <span>English</span>
            </label>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="radio"
                name="reportLanguage"
                value="bn"
                checked={reportLanguage === 'bn'}
                onChange={() => setReportLanguage('bn')}
                className="text-teal-600"
              />
              <span className="font-semibold text-teal-800">বাংলা (Bangla)</span>
            </label>
          </div>
        </div>

        {/* Optional Custom Notes */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-semibold text-foreground">
            {locale === 'bn' ? 'ক্লিনিক্যাল মন্তব্য বা নির্দেশনা (ঐচ্ছিক):' : 'Clinician Notes & Directives (Optional):'}
          </label>
          <textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            rows={2}
            placeholder={
              locale === 'bn'
                ? 'অনকোলজি সমন্বয়, এক্স-রে পরামর্শ বা ফলো-আপ নির্দেশনা লিখুন...'
                : 'Enter specialist recommendations or clinical context...'
            }
            className="w-full text-xs p-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>

        {/* Clinical Disclaimer Note */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-md p-2.5 text-[11px] text-amber-800 flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
          <span>
            {locale === 'bn'
              ? 'লুনজেন্ট রিপোর্টিং ইঞ্জিন কোনো গণনা পরিবর্তন করে না; এটি কেবল যাচাইকৃত এন্ট্রি থেকে অপরিবর্তনীয় নথি প্রস্তুত করে।'
              : 'The reporting engine preserves verified source records without recalculating clinical outcomes.'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            {locale === 'bn' ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="text-xs gap-1.5 bg-teal-700 hover:bg-teal-800 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {locale === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating...'}
              </>
            ) : (
              <>
                <FilePlus2 className="h-3.5 w-3.5" />
                {locale === 'bn' ? 'প্রতিবেদন প্রস্তুত করুন' : 'Generate Report'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
