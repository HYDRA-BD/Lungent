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
import { Clock, AlertCircle, CheckCircle, CalendarDays } from 'lucide-react'
import { useLanguage } from '@/i18n'
import type { PeriodicReviewItem } from '../types'
import { recordReviewOutcomeAction } from '../actions'

interface PeriodicReviewScheduleCardProps {
  schedule: PeriodicReviewItem[]
  onRefresh?: () => void
}

export function PeriodicReviewScheduleCard({
  schedule,
  onRefresh,
}: PeriodicReviewScheduleCardProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.clinicalGovernance

  const [selectedItem, setSelectedItem] = useState<PeriodicReviewItem | null>(null)
  const [outcome, setOutcome] = useState<'continued_use' | 'revision_required' | 'suspended' | 'deprecated'>('continued_use')
  const [reviewNotes, setReviewNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const openReviewModal = (item: PeriodicReviewItem) => {
    setSelectedItem(item)
    setOutcome('continued_use')
    setReviewNotes('')
    setDialogOpen(true)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    setIsSubmitting(true)
    const res = await recordReviewOutcomeAction(
      selectedItem.versionId,
      outcome,
      reviewNotes.trim() || 'Periodic annual reassessment completed with CAB consensus.'
    )
    setIsSubmitting(false)

    if (res.success) {
      setDialogOpen(false)
      onRefresh?.()
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5 text-indigo-600" />
                {t.periodicReviews}
              </CardTitle>
              <CardDescription>
                {isBn
                  ? 'ক্লিনিক্যাল পদ্ধতির নিয়মিত ১২-মাস পর্যায়ক্রমিক মূল্যায়ন ও সময়সীমা ব্যবস্থাপনা।'
                  : 'Scheduled reassessment cadence ensuring clinical guidelines and risk models are periodically re-evaluated.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? 'পদ্ধতি ও ভার্সন' : 'Methodology & Version'}</TableHead>
                  <TableHead>{isBn ? 'পর্যালোচনা চক্র' : 'Cycle'}</TableHead>
                  <TableHead>{isBn ? 'সর্বশেষ মূল্যায়ন' : 'Last Reassessed'}</TableHead>
                  <TableHead>{isBn ? 'পরবর্তী পর্যালোচনার তারিখ' : 'Next Due Date'}</TableHead>
                  <TableHead>{isBn ? 'সময়সীমার স্থিতি' : 'Due Status'}</TableHead>
                  <TableHead className="text-right">{isBn ? 'পদক্ষেপ' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.map((item) => (
                  <TableRow key={item.versionId}>
                    <TableCell className="font-medium">
                      <div className="font-semibold text-foreground">{item.methodologyName}</div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {item.methodologyCode} ({item.versionString})
                      </span>
                    </TableCell>

                    <TableCell className="text-xs">
                      {item.reviewCycleMonths} {isBn ? 'মাসিক' : 'months'}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {item.lastReviewedAt ? new Date(item.lastReviewedAt).toLocaleDateString() : 'N/A'}
                    </TableCell>

                    <TableCell className="font-medium text-xs">
                      {item.nextReviewDueDate}
                    </TableCell>

                    <TableCell>
                      {item.isOverdue ? (
                        <Badge variant="destructive" size="sm" className="gap-1">
                          <AlertCircle className="size-3" />
                          {Math.abs(item.daysRemainingOrOverdue)} {t.daysOverdue}
                        </Badge>
                      ) : item.daysRemainingOrOverdue <= 60 ? (
                        <Badge variant="warning" size="sm" className="gap-1">
                          <Clock className="size-3" />
                          {item.daysRemainingOrOverdue} {t.daysRemaining}
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm" className="gap-1">
                          <CheckCircle className="size-3" />
                          {t.compliant}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<CalendarDays className="size-3.5" />}
                        onClick={() => openReviewModal(item)}
                      >
                        {isBn ? 'মূল্যায়ন রেকর্ড' : 'Record Review'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Outcome Modal */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={`${isBn ? 'পর্যায়ক্রমিক পর্যালোচনা ফলাফল:' : 'Record Periodic Review:'} ${selectedItem?.methodologyName || ''}`}
        size="md"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="review-outcome">{isBn ? 'পর্যালোচনা সিদ্ধান্ত' : 'CAB Review Determination'}</Label>
            <Select
              id="review-outcome"
              value={outcome}
              onChange={(e) =>
                setOutcome(
                  e.target.value as 'continued_use' | 'revision_required' | 'suspended' | 'deprecated'
                )
              }
              options={[
                { value: 'continued_use', label: isBn ? 'ব্যবহার অব্যাহত রাখার অনুমোদন' : 'Approve Continued Use (Extend 12M)' },
                { value: 'revision_required', label: isBn ? 'সংশোধন ও পুনরায় মূল্যায়ন প্রয়োজন' : 'Revision Required (Flag for Review)' },
                { value: 'suspended', label: isBn ? 'সাময়িক স্থগিতাদেশ' : 'Temporarily Suspend Methodology' },
                { value: 'deprecated', label: isBn ? 'অপ্রচলিত ঘোষণা' : 'Deprecate Methodology' },
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-notes">{isBn ? 'পর্যালোচনা পর্যবেক্ষণ ও সভার মন্তব্য' : 'Review Notes & Evidence Evaluation'}</Label>
            <Textarea
              id="review-notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              placeholder={
                isBn
                  ? 'গবেষণা সাহিত্যের সাম্প্রতিক তথ্য, জনসংখ্যাতাত্ত্বিক প্রযোজ্যতা ও বোর্ডের সিদ্ধান্ত নথিভুক্ত করুন...'
                  : 'Document updated clinical literature findings, local performance data, and CAB justification...'
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" variant="default" disabled={isSubmitting}>
              {isSubmitting ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : t.confirmOutcome}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}

