'use client'

import React, { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  FileCheck2,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { recordFollowUpOutcomeAction } from '../actions'
import type { PatientFollowUpItem, PatientFollowUpStatus } from '../types'

export interface RecordOutcomeModalProps {
  followUp: PatientFollowUpItem | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedFollowUp: PatientFollowUpItem) => void
}

export function RecordOutcomeModal({
  followUp,
  isOpen,
  onClose,
  onSuccess,
}: RecordOutcomeModalProps) {
  const [status, setStatus] = useState<PatientFollowUpStatus>('completed')
  const [outcomeNotes, setOutcomeNotes] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen || !followUp) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (status === 'completed' && !outcomeNotes.trim()) {
      setErrorMessage('Please document clinical findings or outcome notes for this follow-up.')
      return
    }

    if (status === 'missed' && !reason.trim()) {
      setErrorMessage('Please document why the patient missed the scheduled appointment.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await recordFollowUpOutcomeAction({
        followUpId: followUp.id,
        status,
        outcomeNotes: outcomeNotes.trim() || undefined,
        reason: reason.trim() || undefined,
      })

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to record follow-up outcome')
      }

      onSuccess(result.data)
      onClose()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred while saving outcome')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <FileCheck2 className="h-5 w-5 text-primary" />
              Record Follow-Up Clinical Outcome
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Patient: <span className="font-semibold text-foreground">{followUp.patientName}</span>{' '}
              <span className="font-mono">({followUp.patientCanonicalId})</span>
            </p>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Follow-up Context */}
          <div className="bg-muted/40 p-3 rounded-lg border border-border text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Follow-Up Purpose:</span>
              <span className="font-medium text-foreground capitalize">
                {followUp.purpose.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Original Scheduled Date:</span>
              <span className="font-medium text-foreground">
                {followUp.scheduledDate} {followUp.scheduledTime || ''}
              </span>
            </div>
          </div>

          {/* Outcome Status */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Outcome Status *</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  status === 'completed'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    Completed
                  </span>
                  {status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Consultation conducted or imaging reviewed.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStatus('missed')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  status === 'missed'
                    ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-600 dark:text-amber-400">
                    Did Not Attend (Missed)
                  </span>
                  {status === 'missed' && <XCircle className="h-3.5 w-3.5 text-amber-600" />}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Patient did not appear; outreach contact required.
                </p>
              </button>
            </div>
          </div>

          {/* Clinical Outcome Notes */}
          {status === 'completed' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Clinical Findings & Outcome Summary *</Label>
              <Textarea
                rows={3}
                placeholder="e.g. Reviewed chest CT showing 6mm stable ground-glass nodule (Lung-RADS 2). Recommend surveillance LDCT in 12 months."
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                required
              />
            </div>
          )}

          {/* Reason if Missed */}
          {status === 'missed' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-destructive">
                Documented Reason / Missed Attendance Justification *
              </Label>
              <Textarea
                rows={2}
                placeholder="State reason for missed appointment and planned re-engagement steps..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                'Save Outcome'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
