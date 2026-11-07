'use client'

/**
 * Phase 2.5: Anomaly Detail & Resolution Workflow Modal
 */

import React, { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  UserCheck,
} from 'lucide-react'
import type { AnomalyRecord, AnomalyStatus, ResolutionOutcome } from '../types'

export interface AnomalyDetailModalProps {
  anomaly: AnomalyRecord
  locale?: 'en' | 'bn'
  onClose: () => void
  onUpdateStatus: (newStatus: AnomalyStatus, notes?: string) => Promise<void>
  onResolve: (outcome: ResolutionOutcome, notes: string) => Promise<void>
  onDismiss: (reason: string) => Promise<void>
  onEscalate: (reason: string) => Promise<void>
}

export function AnomalyDetailModal({
  anomaly,
  locale = 'en',
  onClose,
  onUpdateStatus,
  onResolve,
  onDismiss,
  onEscalate,
}: AnomalyDetailModalProps) {
  const [resolutionOutcome, setResolutionOutcome] = useState<ResolutionOutcome>('data_corrected')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const isBn = locale === 'bn'

  const handleResolve = async () => {
    if (!notes.trim()) {
      setActionError(isBn ? 'অনুগ্রহ করে সমাধানের বিবরণ লিখুন।' : 'Please provide resolution notes.')
      return
    }
    setIsSubmitting(true)
    setActionError(null)
    try {
      await onResolve(resolutionOutcome, notes)
      onClose()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDismiss = async () => {
    if (!notes.trim()) {
      setActionError(isBn ? 'বাতিলের কারণ উল্লেখ করুন।' : 'Please specify dismissal reason.')
      return
    }
    setIsSubmitting(true)
    setActionError(null)
    try {
      await onDismiss(notes)
      onClose()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEscalate = async () => {
    setIsSubmitting(true)
    setActionError(null)
    try {
      await onEscalate(notes || 'Escalated from review modal')
      onClose()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-sky-400">{anomaly.anomalyNumber}</span>
              <span
                className={`rounded-sm px-2 py-0.5 text-xs font-semibold uppercase ${
                  anomaly.severity === 'critical'
                    ? 'bg-rose-500/20 text-rose-400'
                    : anomaly.severity === 'high'
                    ? 'bg-amber-500/20 text-amber-400'
                    : anomaly.severity === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-slate-500/20 text-slate-400'
                }`}
              >
                {anomaly.severity}
              </span>
              <span className="rounded-sm bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                {anomaly.status}
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold">
              {isBn ? anomaly.titleBn : anomaly.titleEn}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Safety Invariant Notice */}
        <div className="my-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            {isBn
              ? 'নিরাপত্তা নীতি: এই অসঙ্গতি কোনো চিকিৎসা রোগ নির্ণয় নয় এবং এটি ক্লিনিকাল ঝুঁকি স্কোর পরিবর্তন করবে না।'
              : 'Clinical Safety Notice: Anomaly detection is non-diagnostic and does not alter clinical risk scores or suppress urgent triage.'}
          </span>
        </div>

        {/* Body Description */}
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-slate-300">
              {isBn ? anomaly.descriptionBn : anomaly.descriptionEn}
            </p>
          </div>

          {/* Trigger Details */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-800/50 p-3">
            <div>
              <span className="text-xs font-medium text-slate-400">
                {isBn ? 'পর্যবেক্ষিত মান (Observed)' : 'Observed Value'}
              </span>
              <pre className="mt-1 overflow-x-auto text-xs text-rose-300">
                {JSON.stringify(anomaly.observedValue, null, 2)}
              </pre>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400">
                {isBn ? 'প্রত্যাশিত রেফারেন্স সীমা' : 'Expected Reference'}
              </span>
              <pre className="mt-1 overflow-x-auto text-xs text-emerald-300">
                {JSON.stringify(anomaly.expectedReference, null, 2)}
              </pre>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-300">{isBn ? 'ক্যাটাগরি:' : 'Category:'}</span>{' '}
              {anomaly.category}
            </div>
            <div>
              <span className="font-semibold text-slate-300">{isBn ? 'পদ্ধতি:' : 'Methodology:'}</span>{' '}
              {anomaly.detectionMethodology}
            </div>
            {anomaly.ruleId && (
              <div>
                <span className="font-semibold text-slate-300">{isBn ? 'রুল আইডি:' : 'Rule ID:'}</span>{' '}
                {anomaly.ruleId} (v{anomaly.ruleVersion})
              </div>
            )}
          </div>

          {/* Review & Resolution Section */}
          {anomaly.status !== 'resolved' && anomaly.status !== 'dismissed' ? (
            <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/80 p-4">
              <h3 className="text-sm font-semibold text-slate-200">
                {isBn ? 'পর্যালোচনা ও সমাধান কার্যক্রম' : 'Review & Resolution Workflow'}
              </h3>

              {actionError && (
                <div className="mt-2 text-xs text-rose-400">{actionError}</div>
              )}

              <div className="mt-3 space-y-3">
                {anomaly.status === 'detected' && (
                  <button
                    onClick={() => onUpdateStatus('under_review', 'Review initiated')}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {isBn ? 'পর্যালোচনা শুরু করুন' : 'Mark Under Review'}
                  </button>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    {isBn ? 'সমাধান ফলাফল' : 'Resolution Outcome'}
                  </label>
                  <select
                    value={resolutionOutcome}
                    onChange={(e) => setResolutionOutcome(e.target.value as ResolutionOutcome)}
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-xs text-slate-200"
                  >
                    <option value="data_corrected">
                      {isBn ? 'তথ্য সংশোধন সম্পন্ন (Data Corrected)' : 'Data Corrected'}
                    </option>
                    <option value="false_positive_clinical_variation">
                      {isBn ? 'প্রাকৃতিক ক্লিনিকাল ভিন্নতা (Clinical Variation)' : 'False Positive / Genuine Clinical Variation'}
                    </option>
                    <option value="sensor_recalibrated">
                      {isBn ? 'সেন্সর পুনরায় ক্যালিব্রেট করা হয়েছে' : 'Sensor Recalibrated'}
                    </option>
                    <option value="system_bug_logged">
                      {isBn ? 'সিস্টেম বাগ রিপোর্ট করা হয়েছে' : 'System Bug Logged'}
                    </option>
                    <option value="acknowledged_acceptable_deviation">
                      {isBn ? 'গ্রহণযোগ্য বিচ্যুতি হিসেবে স্বীকৃত' : 'Acknowledged Acceptable Deviation'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    {isBn ? 'মন্তব্য ও পর্যালোচনা নোট' : 'Review & Resolution Notes'}
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      isBn
                        ? 'সংশোধনের বিবরণ বা পর্যালোচনার কারণ লিখুন...'
                        : 'Explain the resolution or rationale for dismissal...'
                    }
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-xs text-slate-200 placeholder-slate-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={handleResolve}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {isBn ? 'সমাধান নিশ্চিত করুন' : 'Resolve Anomaly'}
                  </button>

                  <button
                    onClick={handleDismiss}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 rounded-md bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-600 disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    {isBn ? 'বাতিল করুন (Dismiss)' : 'Dismiss'}
                  </button>

                  <button
                    onClick={handleEscalate}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 rounded-md bg-rose-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500 disabled:opacity-50"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {isBn ? 'উর্ধ্বতন বরাবরে প্রেরণ' : 'Escalate to Director'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-3 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-medium text-emerald-400">
                <UserCheck className="h-4 w-4" />
                <span>
                  {anomaly.status === 'resolved'
                    ? isBn
                      ? 'এই অসঙ্গতিটি সমাধান করা হয়েছে'
                      : 'This anomaly has been resolved.'
                    : isBn
                    ? 'এই অসঙ্গতিটি বাতিল করা হয়েছে'
                    : 'This anomaly was dismissed.'}
                </span>
              </div>
              {anomaly.resolutionNotes && (
                <p className="mt-1 text-slate-400">&ldquo;{anomaly.resolutionNotes}&rdquo;</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
