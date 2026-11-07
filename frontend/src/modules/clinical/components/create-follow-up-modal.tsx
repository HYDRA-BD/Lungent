'use client'

import React, { useState } from 'react'
import {
  CalendarCheck,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/i18n'
import { createFollowUpPlanAction } from '@/modules/clinical/actions'
import type { ClinicalFollowUpPlanItem } from '@/modules/clinical/types'

interface CreateFollowUpModalProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName: string
  clinicalReviewId?: string
  onSuccess?: (plan: ClinicalFollowUpPlanItem) => void
}

export function CreateFollowUpModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  clinicalReviewId,
  onSuccess,
}: CreateFollowUpModalProps) {
  const { locale, dict } = useLanguage()
  const isBn = locale === 'bn'
  const fT = dict.clinicalWorkspace.followUps

  const [date, setDate] = useState('2026-12-05')
  const [instructions, setInstructions] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (instructions.trim().length < 5) {
      setError(
        isBn
          ? 'ফলো-আপের নির্দেশনা বিস্তারিতভাবে উল্লেখ করুন (ন্যূনতম ৫ অক্ষর)।'
          : 'Please provide detailed follow-up instructions (minimum 5 characters).'
      )
      return
    }

    if (!date) {
      setError(isBn ? 'পর্যালোচনার তারিখ নির্বাচন করুন।' : 'Please select a recommended review date.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createFollowUpPlanAction({
        patientId,
        clinicalReviewId,
        recommendedReviewDate: date,
        instructions: instructions.trim(),
        notes: notes.trim() || undefined,
      })

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to schedule follow-up plan')
      }

      onSuccess?.(result.data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the follow-up plan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarCheck className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{fT.modalTitle}</h2>
            <p className="text-xs text-muted-foreground">
              {isBn ? `রোগী: ${patientName}` : `Patient: ${patientName}`}
            </p>
          </div>
        </div>

        {error && (
          <div className="my-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">
              {fT.dateLabel} <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              {fT.instructionsLabel} <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={fT.instructionsPlaceholder}
              className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              {fT.notesLabel}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={fT.notesPlaceholder}
              className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}
                </>
              ) : (
                <>
                  <CalendarCheck className="size-4" />
                  {fT.saveBtn}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
