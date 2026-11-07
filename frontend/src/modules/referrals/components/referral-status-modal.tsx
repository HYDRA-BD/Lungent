'use client'

import React, { useState } from 'react'
import {
  Calendar,
  AlertCircle,
  Loader2,
  History,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { updateReferralStatusAction } from '../actions'
import type {
  HealthcareReferralItem,
  ReferralLifecycleStatus,
} from '../types'

export interface ReferralStatusModalProps {
  referral: HealthcareReferralItem | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedReferral: HealthcareReferralItem) => void
}

export function ReferralStatusModal({
  referral,
  isOpen,
  onClose,
  onSuccess,
}: ReferralStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ReferralLifecycleStatus>(
    referral?.status || 'submitted'
  )
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [appointmentDate, setAppointmentDate] = useState(
    referral?.appointmentDate ? referral.appointmentDate.split('T')[0] : ''
  )
  const [appointmentLocation, setAppointmentLocation] = useState(
    referral?.appointmentLocation || ''
  )
  const [instructions, setInstructions] = useState(referral?.instructions || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen || !referral) return null

  const isRejectionOrCancellation =
    selectedStatus === 'rejected' || selectedStatus === 'cancelled'
  const isScheduling = selectedStatus === 'scheduled'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (isRejectionOrCancellation && !reason.trim()) {
      setErrorMessage(
        `A documented reason is mandatory when transitioning referral status to ${selectedStatus.toUpperCase()}.`
      )
      return
    }

    if (isScheduling && !appointmentDate) {
      setErrorMessage('Appointment date is required when scheduling a referral consultation.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateReferralStatusAction({
        referralId: referral.id,
        status: selectedStatus,
        reason: reason.trim() || undefined,
        notes: notes.trim() || undefined,
        appointmentDate: isScheduling ? new Date(appointmentDate).toISOString() : undefined,
        appointmentLocation: appointmentLocation.trim() || undefined,
        instructions: instructions.trim() || undefined,
      })

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update referral status')
      }

      onSuccess(result.data)
      onClose()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred while updating status')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
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
            <div className="flex items-center justify-between pr-8">
              <span className="text-xs font-mono font-bold text-muted-foreground">
                {referral.referralId}
              </span>
              <Badge
                variant={
                  referral.priority === 'urgent_2ww'
                    ? 'destructive'
                    : referral.priority === 'priority'
                    ? 'warning'
                    : 'info'
                }
              >
                {referral.priority.toUpperCase()}
              </Badge>
            </div>
            <h2 className="text-lg font-bold text-foreground mt-1">Update Referral Lifecycle Status</h2>
            <p className="text-xs text-muted-foreground">
              Patient: <span className="font-semibold text-foreground">{referral.patientName}</span> ({referral.patientCanonicalId})
            </p>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Current Status and Destination */}
          <div className="bg-muted/40 p-3 rounded-lg border border-border text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Destination Facility:</span>
              <span className="font-medium text-foreground">{referral.destinationFacilityName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clinical Indication:</span>
              <span className="font-medium text-foreground truncate max-w-xs">{referral.reason}</span>
            </div>
          </div>

          {/* Next Status Selector */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">New Lifecycle Status *</Label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ReferralLifecycleStatus)}
            >
              <option value="submitted">Submitted (Awaiting destination intake)</option>
              <option value="accepted">Accepted (Intake approved by destination)</option>
              <option value="scheduled">Scheduled (Appointment confirmed)</option>
              <option value="in_progress">In Progress (Patient undergoing evaluation/imaging)</option>
              <option value="completed">Completed (Evaluation complete & report delivered)</option>
              <option value="rejected">Rejected (Clinical criteria not met / redirect)</option>
              <option value="cancelled">Cancelled (Patient declined or care discontinued)</option>
              <option value="closed">Closed (Administrative case closure)</option>
            </select>
          </div>

          {/* Conditional Fields: Scheduling */}
          {isScheduling && (
            <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-3">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Appointment Coordination Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Appointment Date *</Label>
                  <Input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Room / Wing / Location</Label>
                  <Input
                    placeholder="e.g. Room 204, Pulmonology Wing"
                    value={appointmentLocation}
                    onChange={(e) => setAppointmentLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Preparation & Intake Instructions</Label>
                <Input
                  placeholder="e.g. Bring previous CT disks and fast 6 hours prior"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Conditional Fields: Rejection or Cancellation Reason */}
          {isRejectionOrCancellation && (
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-destructive">
                Documented Justification (Mandatory for {selectedStatus.toUpperCase()}) *
              </Label>
              <Textarea
                rows={2}
                placeholder="State clinical reason for rejection or cancellation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          )}

          {/* General Notes */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Clinical & Administrative Notes</Label>
            <Textarea
              rows={2}
              placeholder="Optional status transition comments or follow-up coordination details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Status History Audit Trail */}
          {referral.statusHistory && referral.statusHistory.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <History className="h-3.5 w-3.5" />
                Immutable Transition History
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {referral.statusHistory.map((hist) => (
                  <div
                    key={hist.id}
                    className="p-2 rounded bg-muted/30 border border-border text-[11px] space-y-0.5"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-semibold text-foreground">
                        {hist.fromStatus} → {hist.toStatus}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(hist.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {hist.reason && (
                      <p className="text-muted-foreground">
                        <strong>Reason:</strong> {hist.reason}
                      </p>
                    )}
                    <p className="text-muted-foreground text-[10px]">
                      By: {hist.changedByName}
                    </p>
                  </div>
                ))}
              </div>
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
                  Updating...
                </>
              ) : (
                'Save Status'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
