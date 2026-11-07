'use client'

import React, { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Dialog } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { UserCheck, FileLock2 } from 'lucide-react'
import { useLanguage } from '@/i18n'
import type { PrivacySubjectRequest, PrivacyRequestStatus } from '../types'
import { reviewPrivacyRequestAction } from '../actions'

interface PrivacyRequestsTableProps {
  requests: PrivacySubjectRequest[]
  onRefresh?: () => void
}

export function PrivacyRequestsTable({
  requests,
  onRefresh,
}: PrivacyRequestsTableProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.securityCompliance

  const [selectedRequest, setSelectedRequest] = useState<PrivacySubjectRequest | null>(null)
  const [targetStatus, setTargetStatus] = useState<PrivacyRequestStatus>('approved_fulfilled')
  const [reviewNotes, setReviewNotes] = useState('')
  const [applyHold, setApplyHold] = useState(false)
  const [holdReason, setHoldReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const openReviewModal = (req: PrivacySubjectRequest) => {
    setSelectedRequest(req)
    setTargetStatus(req.status === 'submitted' ? 'under_review' : 'approved_fulfilled')
    setReviewNotes(req.reviewNotes || '')
    setApplyHold(req.retentionHoldApplied)
    setHoldReason(req.retentionHoldReason || '')
    setDialogOpen(true)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return

    setIsSubmitting(true)
    const effectiveStatus: PrivacyRequestStatus =
      applyHold && targetStatus === 'approved_fulfilled'
        ? 'partially_fulfilled_with_retention_hold'
        : targetStatus

    const res = await reviewPrivacyRequestAction(
      selectedRequest.id,
      effectiveStatus,
      reviewNotes.trim() || 'Privacy request review documented in accordance with data subject rights policy.',
      applyHold,
      applyHold ? holdReason.trim() || 'Statutory retention hold applied under BMDC Section 4.' : undefined
    )
    setIsSubmitting(false)

    if (res.success) {
      setDialogOpen(false)
      onRefresh?.()
    }
  }

  const getStatusBadge = (status: PrivacyRequestStatus) => {
    switch (status) {
      case 'approved_fulfilled':
        return <Badge variant="success">{isBn ? 'সম্পন্ন ও অনুমোদিত' : 'Approved & Fulfilled'}</Badge>
      case 'partially_fulfilled_with_retention_hold':
        return (
          <Badge variant="warning" className="gap-1">
            <FileLock2 className="size-3" />
            {isBn ? 'স্থগিতাদেশসহ আংশিক সম্পন্ন' : 'Retention Hold Applied'}
          </Badge>
        )
      case 'under_review':
        return <Badge variant="info">{isBn ? 'পর্যালোচনাধীন' : 'Under Review'}</Badge>
      case 'rejected':
        return <Badge variant="destructive">{isBn ? 'প্রত্যাখ্যাত' : 'Rejected'}</Badge>
      default:
        return <Badge variant="secondary">{isBn ? 'দাখিলকৃত' : 'Submitted'}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'access_export':
        return isBn ? 'তথ্য প্রাপ্তি ও এক্সপোর্ট' : 'Data Access & Export'
      case 'correction':
        return isBn ? 'তথ্য সংশোধন' : 'Rectification / Correction'
      case 'erasure_restriction':
        return isBn ? 'মুছে ফেলা / সীমাবদ্ধকরণ' : 'Erasure / Restriction'
      case 'consent_withdrawal':
        return isBn ? 'সম্মতি প্রত্যাহার' : 'Consent Withdrawal'
      case 'processing_objection':
        return isBn ? 'প্রক্রিয়াকরণে আপত্তি' : 'Objection to Processing'
      default:
        return type
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="size-5 text-purple-600" />
                {t.tabs.privacy} ({requests.length})
              </CardTitle>
              <CardDescription>
                {isBn
                  ? 'রোগীর ব্যক্তিগত তথ্য অ্যাক্সেস, সংশোধন, এক্সপোর্ট ও অপসারণ আবেদনের বৈধ প্রক্রিয়া ব্যবস্থাপনা।'
                  : 'Management of patient data subject rights: access, correction, export, and lawful erasure workflows.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? 'আবেদন নং' : 'Request #'}</TableHead>
                  <TableHead>{t.requestType}</TableHead>
                  <TableHead>{isBn ? 'রোগী আইডি' : 'Patient ID'}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{isBn ? 'আবেদনের বিবরণ ও পর্যালোচনা' : 'Details & Statutory Review'}</TableHead>
                  <TableHead className="text-right">{isBn ? 'পদক্ষেপ' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {req.requestNumber}
                      <span className="block font-normal text-[11px] text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-slate-800 bg-slate-100 dark:bg-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-full">
                        {getTypeLabel(req.requestType)}
                      </span>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {req.patientId.slice(0, 8)}...
                    </TableCell>

                    <TableCell>{getStatusBadge(req.status)}</TableCell>

                    <TableCell className="text-xs max-w-[320px]">
                      <p className="text-foreground line-clamp-2">{req.requestDetails}</p>
                      {req.retentionHoldApplied && (
                        <div className="mt-1 p-1.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[11px]">
                          <strong>{isBn ? 'সংবিধিবদ্ধ স্থগিতাদেশ: ' : 'Statutory Hold: '}</strong>
                          {req.retentionHoldReason}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReviewModal(req)}
                      >
                        {t.reviewRequest}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={`${t.reviewModalTitle}: ${selectedRequest?.requestNumber || ''}`}
        size="md"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="req-status">{t.status}</Label>
            <Select
              id="req-status"
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as PrivacyRequestStatus)}
              options={[
                { value: 'under_review', label: isBn ? 'পর্যালোচনাধীন' : 'Under Review' },
                { value: 'approved_fulfilled', label: isBn ? 'অনুমোদন ও সম্পন্ন' : 'Approve & Fulfill' },
                { value: 'rejected', label: isBn ? 'প্রত্যাখ্যান' : 'Reject' },
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-notes">{isBn ? 'পর্যালোচনা পর্যবেক্ষণ ও নোট' : 'Reviewer Assessment & Actions'}</Label>
            <Textarea
              id="review-notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              placeholder={
                isBn
                  ? 'আইনি যাচাই, ডেটা এক্সপোর্ট স্থিতি বা প্রত্যাখ্যানের কারণ নথিভুক্ত করুন...'
                  : 'Document identity verification, data delivery method, or rejection justification...'
              }
            />
          </div>

          {/* Retention Hold Safeguard */}
          <div className="rounded-lg border border-amber-200 bg-amber-50/70 dark:bg-amber-950/30 p-3 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Checkbox
                id="apply-hold"
                checked={applyHold}
                onChange={(e) => setApplyHold(e.target.checked)}
              />
              <Label htmlFor="apply-hold" className="font-semibold text-amber-900 dark:text-amber-200 cursor-pointer">
                {t.retentionHoldCheckbox}
              </Label>
            </div>
            <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-tight">
              {t.retentionHoldNotice}
            </p>

            {applyHold && (
              <div className="pt-2 space-y-1">
                <Label htmlFor="hold-reason" className="text-amber-900 dark:text-amber-200">
                  {t.holdReasonLabel}
                </Label>
                <Textarea
                  id="hold-reason"
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  rows={2}
                  placeholder="e.g. Mandatory 10-year preservation under BMDC Code of Ethics Section 4."
                  className="text-xs bg-background"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              {t.cancel}
            </Button>
            <Button type="submit" variant="default" disabled={isSubmitting}>
              {isSubmitting ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : t.saveChanges}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
