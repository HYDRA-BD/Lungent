'use client'

import React, { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { useLanguage } from '@/i18n'
import { transitionLifecycleAction } from '../actions'
import type { ClinicalMethodologyVersion, GovernanceLifecycleStatus } from '../types'

interface MethodologyApprovalDialogProps {
  open: boolean
  onClose: () => void
  version: ClinicalMethodologyVersion | null
  methodologyName: string
  onSuccess?: () => void
}

export function MethodologyApprovalDialog({
  open,
  onClose,
  version,
  methodologyName,
  onSuccess,
}: MethodologyApprovalDialogProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.clinicalGovernance

  const [targetStatus, setTargetStatus] = useState<GovernanceLifecycleStatus>('approved')
  const [justification, setJustification] = useState('')
  const [meetingReference, setMeetingReference] = useState('CAB-2026-Q1')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!version) return null

  // Determine available target transitions based on current status
  const current = version.status
  const allowedOptions: { value: GovernanceLifecycleStatus; label: string }[] = []

  if (current === 'draft') {
    allowedOptions.push(
      { value: 'submitted_for_review', label: isBn ? 'পর্যালোচনার জন্য দাখিল' : 'Submit for Review' },
      { value: 'rejected', label: isBn ? 'প্রত্যাখ্যান' : 'Reject' }
    )
  } else if (current === 'submitted_for_review') {
    allowedOptions.push(
      { value: 'under_clinical_review', label: isBn ? 'ক্লিনিক্যাল পর্যালোচনা শুরু' : 'Begin Clinical Review' },
      { value: 'draft', label: isBn ? 'খসড়ায় ফেরত' : 'Return to Draft' }
    )
  } else if (current === 'under_clinical_review') {
    allowedOptions.push(
      { value: 'awaiting_formal_approval', label: isBn ? 'আনুষ্ঠানিক অনুমোদনের জন্য অপেক্ষমাণ' : 'Awaiting Formal Approval' },
      { value: 'revisions_requested', label: isBn ? 'সংশোধন অনুরোধ' : 'Request Revisions' },
      { value: 'rejected', label: isBn ? 'প্রত্যাখ্যান' : 'Reject' }
    )
  } else if (current === 'awaiting_formal_approval') {
    allowedOptions.push(
      { value: 'approved', label: isBn ? 'আনুষ্ঠানিকভাবে অনুমোদন' : 'Formally Approve' },
      { value: 'revisions_requested', label: isBn ? 'সংশোধন অনুরোধ' : 'Request Revisions' },
      { value: 'rejected', label: isBn ? 'প্রত্যাখ্যান' : 'Reject' }
    )
  } else if (current === 'approved') {
    allowedOptions.push(
      { value: 'active', label: isBn ? 'সক্রিয় করুন (উৎপাদন সেবা)' : 'Activate in Production' },
      { value: 'suspended', label: isBn ? 'স্থগিত করুন' : 'Suspend' },
      { value: 'deprecated', label: isBn ? 'অপ্রচলিত করুন' : 'Deprecate' }
    )
  } else if (current === 'active') {
    allowedOptions.push(
      { value: 'suspended', label: isBn ? 'সাময়িক স্থগিত' : 'Temporarily Suspend' },
      { value: 'deprecated', label: isBn ? 'অপ্রচলিত ঘোষণা' : 'Deprecate' }
    )
  } else if (current === 'suspended') {
    allowedOptions.push(
      { value: 'active', label: isBn ? 'পুনরায় সক্রিয়' : 'Reactivate' },
      { value: 'deprecated', label: isBn ? 'অপ্রচলিত ঘোষণা' : 'Deprecate' }
    )
  }

  const selectedTarget = allowedOptions.find((o) => o.value === targetStatus)
    ? targetStatus
    : allowedOptions[0]?.value || 'approved'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!justification.trim() || justification.trim().length < 8) {
      setError(
        isBn
          ? 'ক্লিনিক্যাল যৌক্তিকতা অবশ্যই কমপক্ষে ৮ অক্ষরের হতে হবে।'
          : 'Clinical justification must be at least 8 characters long.'
      )
      return
    }

    setIsSubmitting(true)
    setError(null)

    const res = await transitionLifecycleAction(
      version.id,
      selectedTarget,
      justification.trim(),
      meetingReference.trim() || undefined
    )

    setIsSubmitting(false)

    if (res.success) {
      onSuccess?.()
      onClose()
    } else {
      setError(res.error || 'Failed to update methodology lifecycle')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${t.transitionModalTitle}: ${methodologyName}`}
      description={
        isBn
          ? `বর্তমান অবস্থা: ${version.status} (সংস্করণ: ${version.versionString} / SemVer: ${version.semver})`
          : `Current Status: ${version.status} (Version: ${version.versionString} / SemVer: ${version.semver})`
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <Alert variant="destructive" title={isBn ? 'ত্রুটি' : 'Error'}>
            {error}
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="target-status">{isBn ? 'লক্ষ্য অবস্থা নির্বাচন করুন' : 'Select Target Status'}</Label>
          <Select
            id="target-status"
            value={selectedTarget}
            onChange={(e) => setTargetStatus(e.target.value as GovernanceLifecycleStatus)}
            options={allowedOptions.map((o) => ({ value: o.value, label: o.label }))}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="meeting-ref">{isBn ? 'সিএবি সভার রেফারেন্স নম্বর' : 'CAB Meeting Reference'}</Label>
          <Input
            id="meeting-ref"
            value={meetingReference}
            onChange={(e) => setMeetingReference(e.target.value)}
            placeholder="e.g. CAB-2026-Q1"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="justification">{t.approvalNotesLabel} *</Label>
          <Textarea
            id="justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={3}
            placeholder={
              isBn
                ? 'অনুমোদন বা পরিবর্তনের পেছনে ক্লিনিক্যাল যৌক্তিকতা এবং সিএবি সিদ্ধান্ত বিস্তারিত লিখুন...'
                : 'Enter clinical justification, evidentiary citations, and board consensus notes...'
            }
          />
        </div>

        <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200">
          <p className="font-semibold">{t.nonDiagnosticNotice}</p>
          <p className="mt-1">{t.safetyHaltNotice}</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {isBn ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button type="submit" variant="default" disabled={isSubmitting || allowedOptions.length === 0}>
            {isSubmitting ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : t.executeTransition}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

