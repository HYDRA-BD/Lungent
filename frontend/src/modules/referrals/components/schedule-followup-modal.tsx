'use client'

import React, { useState } from 'react'
import {
  CalendarCheck,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { scheduleFollowUpAction, rescheduleFollowUpAction } from '../actions'
import type {
  PatientFollowUpItem,
  FollowUpPurpose,
} from '../types'

export interface ScheduleFollowUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (followUp: PatientFollowUpItem) => void
  // If editing/rescheduling an existing follow-up
  existingFollowUp?: PatientFollowUpItem | null
  // If creating new follow-up
  patientId?: string
  patientName?: string
  patientCanonicalId?: string
  referralId?: string
  referralCanonicalId?: string
}

export function ScheduleFollowUpModal({
  isOpen,
  onClose,
  onSuccess,
  existingFollowUp,
  patientId,
  patientName,
  patientCanonicalId,
  referralId,
  referralCanonicalId,
}: ScheduleFollowUpModalProps) {
  const isRescheduling = !!existingFollowUp

  const [scheduledDate, setScheduledDate] = useState(
    existingFollowUp?.scheduledDate || '2026-11-20'
  )
  const [scheduledTime, setScheduledTime] = useState(existingFollowUp?.scheduledTime || '10:00 AM')
  const [purpose, setPurpose] = useState<FollowUpPurpose>(
    existingFollowUp?.purpose || 'post_imaging_review'
  )
  const [instructions, setInstructions] = useState(existingFollowUp?.instructions || '')
  const [rescheduleReason, setRescheduleReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const activePatientName = existingFollowUp?.patientName || patientName || 'Patient'
  const activeCanonicalId = existingFollowUp?.patientCanonicalId || patientCanonicalId || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!scheduledDate) {
      setErrorMessage('Please select a valid scheduled follow-up date.')
      return
    }

    if (isRescheduling && !rescheduleReason.trim()) {
      setErrorMessage('A documented reason is mandatory when rescheduling a follow-up appointment.')
      return
    }

    setIsSubmitting(true)
    try {
      if (isRescheduling && existingFollowUp) {
        const result = await rescheduleFollowUpAction({
          followUpId: existingFollowUp.id,
          newDate: scheduledDate,
          newTime: scheduledTime || undefined,
          reason: rescheduleReason.trim(),
        })

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to reschedule follow-up')
        }

        onSuccess(result.data)
      } else {
        if (!patientId || !patientName || !patientCanonicalId) {
          throw new Error('Patient details are required to schedule a follow-up.')
        }

        const result = await scheduleFollowUpAction({
          patientId,
          patientCanonicalId,
          patientName,
          referralId: referralId || undefined,
          referralCanonicalId: referralCanonicalId || undefined,
          scheduledDate,
          scheduledTime: scheduledTime || undefined,
          purpose,
          instructions: instructions.trim() || undefined,
        })

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to schedule follow-up')
        }

        onSuccess(result.data)
      }
      onClose()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred while saving follow-up')
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
              <CalendarCheck className="h-5 w-5 text-primary" />
              {isRescheduling ? 'Reschedule Patient Follow-Up' : 'Plan Longitudinal Follow-Up'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Patient: <span className="font-semibold text-foreground">{activePatientName}</span>{' '}
              {activeCanonicalId && <span className="font-mono">({activeCanonicalId})</span>}
            </p>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Follow-up Purpose */}
          {!isRescheduling && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Follow-Up Purpose *</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as FollowUpPurpose)}
              >
                <option value="post_imaging_review">Post-Imaging Review (LDCT / Chest X-Ray)</option>
                <option value="treatment_monitoring">Treatment Monitoring & Care Response</option>
                <option value="symptom_reassessment">Symptom Reassessment (Persistent Symptoms)</option>
                <option value="specialist_consultation">Specialist Pulmonology Follow-Up</option>
                <option value="smoking_cessation">Smoking Cessation Counseling & Support</option>
                <option value="routine_check">Routine Surveillance & Health Check</option>
              </select>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Scheduled Date *</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Preferred Time</Label>
              <Input
                placeholder="e.g. 10:30 AM"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          {/* Mandatory Reschedule Justification */}
          {isRescheduling && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Reason for Rescheduling (Mandatory) *
              </Label>
              <Textarea
                rows={2}
                placeholder="Document clinical or logistical justification for rescheduling..."
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                required
              />
            </div>
          )}

          {/* Instructions */}
          {!isRescheduling && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Clinical & Patient Preparation Instructions</Label>
              <Textarea
                rows={2}
                placeholder="e.g. Follow-up after completing 2-week course of antibiotics; bring repeated chest radiograph."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
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
                  Saving...
                </>
              ) : isRescheduling ? (
                'Reschedule Follow-Up'
              ) : (
                'Schedule Follow-Up'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
