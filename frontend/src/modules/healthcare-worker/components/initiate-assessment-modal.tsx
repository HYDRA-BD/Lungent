'use client'

import React, { useState, useTransition } from 'react'
import {
  AlertCircle,
  Loader2,
  Activity,
  ShieldAlert,
  Send,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/i18n'
import { initiateAssessmentAction } from '@/modules/healthcare-worker/actions'
import { saveDraft } from '@/modules/offline/indexeddb'
import type { PatientAssessmentType, WorkerTaskPriority } from '../types'

export interface PatientOption {
  id: string
  fullName: string
  patientId: string
  approximateAge?: number | null
}

interface InitiateAssessmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialPatientId?: string
  patients?: PatientOption[]
  activeFacilityId?: string
}

export function InitiateAssessmentModal({
  isOpen,
  onClose,
  onSuccess,
  initialPatientId,
  patients = [],
  activeFacilityId,
}: InitiateAssessmentModalProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'
  const [isPending, startTransition] = useTransition()

  const [patientId, setPatientId] = useState(initialPatientId || (patients[0]?.id ?? ''))
  const [assessmentType, setAssessmentType] =
    useState<PatientAssessmentType>('lung_cancer_risk')
  const [priority, setPriority] = useState<WorkerTaskPriority>('normal')
  const [notes, setNotes] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে রোগী নির্বাচন করুন' : 'Please select a patient')
      return
    }

    setErrorMsg(null)
    startTransition(async () => {
      try {
        const res = await initiateAssessmentAction(patientId, {
          assessmentType,
          priority: priority === 'urgent' ? 'urgent' : 'routine',
          facilityId: activeFacilityId,
          preliminaryNotes: notes.trim() || undefined,
        })

        if (res.success) {
          if (onSuccess) onSuccess()
          onClose()
        } else {
          // Save local offline draft as fallback
          const draftId = `draft_worker_${patientId}_${assessmentType}_${Date.now()}`
          await saveDraft({
            draftId,
            clientOperationId: `op_${draftId}`,
            formType: 'worker_assessment',
            userId: 'worker_session',
            patientId,
            facilityId: activeFacilityId,
            assessmentType,
            data: { priority, preliminaryNotes: notes.trim() || undefined },
            baseVersion: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            syncStatus: 'saved_locally',
            syncAttempts: 0,
          })
          if (onSuccess) onSuccess()
          onClose()
        }
      } catch {
        // Network interruption fallback: save local offline draft
        const draftId = `draft_worker_${patientId}_${assessmentType}_${Date.now()}`
        await saveDraft({
          draftId,
          clientOperationId: `op_${draftId}`,
          formType: 'worker_assessment',
          userId: 'worker_session',
          patientId,
          facilityId: activeFacilityId,
          assessmentType,
          data: { priority, preliminaryNotes: notes.trim() || undefined },
          baseVersion: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncStatus: 'saved_locally',
          syncAttempts: 0,
        })
        if (onSuccess) onSuccess()
        onClose()
      }
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="initiate-assessment-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Activity className="size-5" />
            </div>
            <div>
              <h3 id="initiate-assessment-title" className="text-base font-semibold text-foreground">
                {isBn
                  ? 'রোগীর মূল্যায়ন প্রক্রিয়া শুরু করুন'
                  : 'Initiate Patient Assessment Workflow'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isBn
                  ? 'স্বাস্থ্যকর্মীর প্রাথমিক তথ্য সংগ্রহ ও ক্লিনিকাল মূল্যায়নের জন্য প্রেরণ'
                  : 'Standardized CHW intake for clinical decision support'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
          <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <span className="font-semibold block">
              {isBn ? 'ক্লিনিকাল নিরাপত্তা বার্তা:' : 'Clinical Safety Notice:'}
            </span>
            {isBn
              ? 'কমিউনিটি স্বাস্থ্যকর্মীর মূল্যায়ন শুধুমাত্র রোগীর বর্ণিত তথ্য সংগ্রহ করে। চূড়ান্ত ঝুঁকি বিশ্লেষণ ও স্ক্রিনিং নির্দেশিকা অনুমোদিত চিকিৎসকের পর্যালোচনার মাধ্যমে সম্পন্ন হবে।'
              : 'CHW assessment aggregates patient-reported factors for clinical decision support. Final risk estimation and screening decisions require clinician review.'}
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {isBn ? 'রোগী নির্বাচন করুন *' : 'Select Patient *'}
            </label>
            {patients.length > 0 ? (
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.patientId}) - {p.approximateAge ? `${p.approximateAge} yrs` : 'Age N/A'}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter Patient UUID or ID"
                required
              />
            )}
          </div>

          {/* Assessment Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {isBn ? 'মূল্যায়ন ক্যাটাগরি *' : 'Assessment Category *'}
            </label>
            <select
              value={assessmentType}
              onChange={(e) => setAssessmentType(e.target.value as PatientAssessmentType)}
              required
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            >
              <option value="lung_cancer_risk">
                {isBn ? '১. ফুসফুসের ক্যান্সার ঝুঁকি মূল্যায়ন' : '1. Lung Cancer Risk Estimation'}
              </option>
              <option value="screening_eligibility">
                {isBn ? '২. লো-ডোজ সিটি (LDCT) স্ক্রিনিং যোগ্যতা' : '2. Low-Dose CT Screening Eligibility'}
              </option>
              <option value="symptom_triage">
                {isBn ? '৩. উপসর্গভিত্তিক ক্লিনিকাল ট্রায়াজ' : '3. Symptom-Based Clinical Triage'}
              </option>
              <option value="comprehensive_intake">
                {isBn ? '৪. সমন্বিত রেসপিরেটরি ইনটেক' : '4. Comprehensive Pulmonary Intake'}
              </option>
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {isBn ? 'অগ্রাধিকার *' : 'Workflow Priority *'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'high', 'urgent'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium capitalize transition-all ${
                    priority === p
                      ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {p === 'normal'
                    ? isBn
                      ? 'সাধারণ (Routine)'
                      : 'Routine'
                    : p === 'high'
                    ? isBn
                      ? 'জরুরি (Expedited)'
                      : 'Expedited'
                    : isBn
                    ? 'অতি-জরুরি (Urgent)'
                    : 'Urgent'}
                </button>
              ))}
            </div>
          </div>

          {/* Field Intake Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {isBn ? 'স্বাস্থ্যকর্মীর প্রাথমিক ফিল্ড নোট' : 'Preliminary CHW Field Notes'}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isBn
                  ? 'রোগীর প্রধান অভিযোগ, ধূমপানের ইতিহাস বা অন্যান্য গুরুত্বপূর্ণ উপসর্গ লিখুন...'
                  : 'Document primary patient-reported complaints, smoke history, or acute symptoms...'
              }
              className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isPending}
              leftIcon={isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            >
              {isPending
                ? isBn
                  ? 'প্রক্রিয়াধীন...'
                  : 'Initiating...'
                : isBn
                ? 'মূল্যায়ন শুরু করুন'
                : 'Initiate Workflow'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
