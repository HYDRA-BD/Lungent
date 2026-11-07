'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  UserPlus,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  GitMerge,
  XCircle,
  CheckCircle2,
  Building2,
  Send,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/i18n'
import { reviewDuplicateAction, mergePatientsAction } from '@/modules/patients/actions'
import { maskPhoneNumber } from '@/modules/patients/patient-id'
import type { DuplicateCandidate } from '@/modules/patients/types'

interface DuplicatesClientProps {
  initialCandidates: DuplicateCandidate[]
}

export function DuplicatesClient({ initialCandidates }: DuplicatesClientProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.patients

  const [candidates, setCandidates] = useState<DuplicateCandidate[]>(initialCandidates)
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved' | 'merged'>('pending')
  const [justifications, setJustifications] = useState<Record<string, string>>({})
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({})
  const [actionSuccesses, setActionSuccesses] = useState<Record<string, string>>({})
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Merge Confirmation Modal State
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false)
  const [targetCandidate, setTargetCandidate] = useState<DuplicateCandidate | null>(null)
  const [mergeJustification, setMergeJustification] = useState('')
  const [isMerging, setIsMerging] = useState(false)

  const workerNav = [
    {
      label: dict.nav.communityHealth || 'Overview',
      href: '/healthcare-worker',
      icon: <Users className="size-4" />,
      badge: 8,
    },
    {
      label: dict.nav.patientRegistry || 'Patient Registry',
      href: '/healthcare-worker/patients',
      icon: <Search className="size-4" />,
    },
    {
      label: dict.nav.registerPatient || 'New Registration',
      href: '/healthcare-worker/patients/register',
      icon: <UserPlus className="size-4" />,
    },
    {
      label: dict.nav.duplicateReview || 'Duplicate Review',
      href: '/healthcare-worker/patients/duplicates',
      icon: <Copy className="size-4" />,
      badge: candidates.filter((c) => c.status === 'pending_review').length,
    },
    {
      label: isBn ? 'সক্রিয় রেফারেলসমূহ' : 'Active Referrals',
      href: '/healthcare-worker/referrals',
      icon: <Send className="size-4" />,
      badge: 3,
    },
    {
      label: isBn ? 'ক্লিনিক ও হাসপাতাল তালিকা' : 'Clinic Facility Directory',
      href: '/healthcare-worker/facilities',
      icon: <Building2 className="size-4" />,
    },
  ]

  const pendingList = candidates.filter((c) => c.status === 'pending_review')
  const resolvedList = candidates.filter(
    (c) => c.status === 'dismissed_distinct_patients' || c.status === 'confirmed_duplicate'
  )
  const mergedList = candidates.filter((c) => c.status === 'merged')

  const currentList =
    activeTab === 'pending'
      ? pendingList
      : activeTab === 'resolved'
        ? resolvedList
        : mergedList

  const handleJustificationChange = (candidateId: string, value: string) => {
    setJustifications((prev) => ({ ...prev, [candidateId]: value }))
    if (actionErrors[candidateId]) {
      setActionErrors((prev) => {
        const next = { ...prev }
        delete next[candidateId]
        return next
      })
    }
  }

  // Handle Review (Dismiss or Confirm)
  const handleReview = async (
    candidate: DuplicateCandidate,
    decision: 'dismissed_distinct' | 'confirmed_duplicate'
  ) => {
    const justification = (justifications[candidate.id] || '').trim()
    if (justification.length < 10) {
      setActionErrors((prev) => ({
        ...prev,
        [candidate.id]: isBn
          ? 'পর্যালোচনা সম্পন্ন করতে কমপক্ষে ১০ অক্ষরের কারণ লিপিবদ্ধ করুন।'
          : 'Please provide at least 10 characters explaining your clinical/administrative reasoning.',
      }))
      return
    }

    setProcessingId(candidate.id)
    setActionErrors((prev) => {
      const next = { ...prev }
      delete next[candidate.id]
      return next
    })

    try {
      const res = await reviewDuplicateAction({
        candidateId: candidate.id,
        decision,
        justification,
      })

      if (res.success) {
        setActionSuccesses((prev) => ({
          ...prev,
          [candidate.id]:
            decision === 'dismissed_distinct'
              ? isBn
                ? 'সফলভাবে পৃথক রোগী হিসেবে চিহ্নিত ও বাতিল করা হয়েছে।'
                : 'Dismissed as distinct patients.'
              : isBn
                ? 'ডুপ্লিকেট রোগী রেকর্ড হিসেবে নিশ্চিত করা হয়েছে।'
                : 'Confirmed duplicate record.',
        }))

        // Update local state
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidate.id
              ? {
                  ...c,
                  status:
                    decision === 'dismissed_distinct'
                      ? 'dismissed_distinct_patients'
                      : 'confirmed_duplicate',
                }
              : c
          )
        )
      } else {
        setActionErrors((prev) => ({
          ...prev,
          [candidate.id]: res.error || 'Review failed',
        }))
      }
    } catch (err) {
      setActionErrors((prev) => ({
        ...prev,
        [candidate.id]: err instanceof Error ? err.message : 'Error recording review',
      }))
    } finally {
      setProcessingId(null)
    }
  }

  // Open Controlled Merge Modal
  const openMergeModal = (candidate: DuplicateCandidate) => {
    setTargetCandidate(candidate)
    setMergeJustification(
      justifications[candidate.id] ||
        (isBn
          ? 'নিয়ন্ত্রিত একীভূতকরণ: উভয় রেকর্ড একই ব্যক্তির এবং তথ্য যাচাই করে একটি স্থায়ী রেকর্ডে একীভূত করা হয়েছে।'
          : 'Controlled merge: both records represent the same patient; consolidating into surviving primary identity.')
    )
    setMergeDialogOpen(true)
  }

  // Execute Controlled Merge
  const handleExecuteMerge = async () => {
    if (!targetCandidate || !targetCandidate.primaryPatient || !targetCandidate.candidatePatient) {
      return
    }

    if (mergeJustification.trim().length < 10) {
      alert(
        isBn
          ? 'একীভূতকরণের জন্য কমপক্ষে ১০ অক্ষরের কারণ উল্লেখ আবশ্যক।'
          : 'Merge justification must be at least 10 characters.'
      )
      return
    }

    setIsMerging(true)

    try {
      const res = await mergePatientsAction({
        survivingPatientId: targetCandidate.primaryPatient.id,
        retiredPatientId: targetCandidate.candidatePatient.id,
        reason: mergeJustification.trim(),
      })

      if (res.success) {
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === targetCandidate.id
              ? {
                  ...c,
                  status: 'merged',
                }
              : c
          )
        )
        setMergeDialogOpen(false)
        setTargetCandidate(null)
        setActiveTab('merged')
      } else {
        alert(res.error || 'Failed to execute merge operation')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Network error during merge')
    } finally {
      setIsMerging(false)
    }
  }

  return (
    <DashboardLayout
      workspaceName={isBn ? 'কমিউনিটি স্বাস্থ্যকর্মী ওয়ার্কস্পেস' : 'Community Health Worker Workspace'}
      workspaceBadge={<Badge variant="secondary" size="sm">{isBn ? 'ঢাকা দক্ষিণ বিভাগ' : 'Dhaka South Division'}</Badge>}
      userName="Tania Akhter"
      userRole={isBn ? 'কমিউনিটি স্বাস্থ্য বিশেষজ্ঞ' : 'Community Health Specialist (CHW)'}
      navItems={workerNav}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <PageHeader
          title={t.duplicates.title}
          description={t.duplicates.subtitle}
          actions={
            <Link
              href="/healthcare-worker/patients"
              className={buttonVariants({ variant: 'outline', size: 'sm', className: 'text-xs' })}
            >
              <Users className="size-3.5 mr-1" />
              {t.profile.backToRegistry}
            </Link>
          }
        />

        {/* Tab Controls */}
        <div className="flex border-b border-border/60 gap-2 pb-px overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pending'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>
              {t.duplicates.pendingTab.replace('{count}', String(pendingList.length))}
            </span>
            {pendingList.length > 0 && (
              <Badge variant="destructive" size="sm" className="px-1.5 py-0 text-[10px]">
                {pendingList.length}
              </Badge>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('resolved')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'resolved'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>
              {t.duplicates.reviewedTab.replace('{count}', String(resolvedList.length))}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('merged')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'merged'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>
              {t.duplicates.mergedTab.replace('{count}', String(mergedList.length))}
            </span>
          </button>
        </div>

        {/* Empty State */}
        {currentList.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/50 space-y-3">
            <div className="size-12 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
              <ShieldCheck className="size-6 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {t.duplicates.noDuplicatesTitle}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {t.duplicates.noDuplicatesDesc}
            </p>
          </div>
        )}

        {/* Candidate List */}
        <div className="space-y-6">
          {currentList.map((cand) => {
            const primary = cand.primaryPatient
            const secondary = cand.candidatePatient
            const isPending = cand.status === 'pending_review'
            const score = cand.matchScore
            const scoreVariant =
              score >= 90 ? 'destructive' : score >= 75 ? 'outline' : 'secondary'

            return (
              <Card key={cand.id} className="overflow-hidden border-border/80">
                {/* Header Banner */}
                <CardHeader className="bg-muted/30 pb-3 pt-3.5 border-b border-border/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={scoreVariant} size="sm" className="font-semibold text-xs">
                        {t.duplicates.matchScore.replace('{score}', String(score))}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {cand.matchType === 'exact'
                          ? (isBn ? 'সরাসরি নিখুঁত ম্যাচ' : 'Exact Collision Match')
                          : cand.matchType === 'high_probability'
                            ? (isBn ? 'উচ্চ সম্ভাব্য ডুপ্লিকেট' : 'High Probability Match')
                            : (isBn ? 'মাঝারি সম্ভাব্য ডুপ্লিকেট' : 'Moderate Match')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="size-3.5" />
                      <span>{new Date(cand.createdAt).toLocaleDateString()}</span>
                      <Badge variant="outline" size="sm" className="text-[10px] uppercase">
                        {cand.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>

                  {/* Match Criteria Reasons */}
                  {cand.matchReasons && cand.matchReasons.length > 0 && (
                    <div className="pt-2 text-xs space-y-1">
                      <span className="font-medium text-foreground text-[11px]">
                        {t.duplicates.matchReasons}
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-[11px]">
                        {cand.matchReasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardHeader>

                {/* Comparison Grid */}
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Primary Record */}
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          {t.duplicates.primaryHeader}
                        </span>
                        {primary && (
                          <Link
                            href={`/healthcare-worker/patients/${primary.id}`}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <span>{primary.patientId}</span>
                            <ExternalLink className="size-3" />
                          </Link>
                        )}
                      </div>

                      {primary ? (
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase">
                              {t.registration.fullNameLabel}
                            </span>
                            <span className="font-semibold text-foreground text-sm">
                              {primary.fullName}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40">
                            <div>
                              <span className="text-muted-foreground block text-[10px] uppercase">
                                {t.registration.dobLabel} / {t.registration.ageLabel}
                              </span>
                              <span className="text-foreground">
                                {primary.dateOfBirth || `${primary.approximateAge || '—'} yrs`}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[10px] uppercase">
                                {t.registration.genderLabel}
                              </span>
                              <span className="capitalize text-foreground">{primary.gender}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40">
                            <div>
                              <span className="text-muted-foreground block text-[10px] uppercase">
                                {t.registration.phoneLabel}
                              </span>
                              <span className="text-foreground">
                                {maskPhoneNumber(primary.phoneNumber)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[10px] uppercase">
                                {t.registration.divisionLabel}
                              </span>
                              <span className="text-foreground">
                                {primary.addressDivision || '—'}
                              </span>
                            </div>
                          </div>

                          <div className="pt-1 border-t border-border/40 flex items-center justify-between">
                            <span className="text-muted-foreground text-[10px] uppercase">
                              {isBn ? 'যাচাই অবস্থা' : 'Verification'}
                            </span>
                            <Badge
                              variant={primary.verificationStatus === 'verified' ? 'default' : 'outline'}
                              size="sm"
                              className="text-[10px]"
                            >
                              {primary.verificationStatus}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Record details unavailable</p>
                      )}
                    </div>

                    {/* Suspected Candidate Record */}
                    <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                          {t.duplicates.candidateHeader}
                        </span>
                        {secondary && (
                          <Link
                            href={`/healthcare-worker/patients/${secondary.id}`}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                          >
                            <span>{secondary.patientId}</span>
                            <ExternalLink className="size-3" />
                          </Link>
                        )}
                      </div>

                      {secondary ? (
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase">
                              {t.registration.fullNameLabel}
                            </span>
                            <span className="font-semibold text-foreground text-sm">
                              {secondary.fullName}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40">
                            <div>
                              <span className="text-muted-foreground block text-[10px] uppercase">
                                {t.registration.dobLabel} / {t.registration.ageLabel}
                              </span>
                              <span className="text-foreground">
                                {secondary.dateOfBirth || `${secondary.approximateAge || '—'} yrs`}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[10px] uppercase">
                                {t.registration.genderLabel}
                              </span>
                              <span className="capitalize text-foreground">{secondary.gender}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40">
                            <div>
                              <span className="text-muted-foreground block text-[10px] uppercase">
                                {t.registration.phoneLabel}
                              </span>
                              <span className="text-foreground">
                                {maskPhoneNumber(secondary.phoneNumber)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[10px] uppercase">
                                {t.registration.divisionLabel}
                              </span>
                              <span className="text-foreground">
                                {secondary.addressDivision || '—'}
                              </span>
                            </div>
                          </div>

                          <div className="pt-1 border-t border-border/40 flex items-center justify-between">
                            <span className="text-muted-foreground text-[10px] uppercase">
                              {isBn ? 'যাচাই অবস্থা' : 'Verification'}
                            </span>
                            <Badge
                              variant={secondary.verificationStatus === 'verified' ? 'default' : 'outline'}
                              size="sm"
                              className="text-[10px]"
                            >
                              {secondary.verificationStatus}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Record details unavailable</p>
                      )}
                    </div>
                  </div>

                  {/* Success / Error Message */}
                  {actionSuccesses[cand.id] && (
                    <div className="mt-4 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>{actionSuccesses[cand.id]}</span>
                    </div>
                  )}

                  {actionErrors[cand.id] && (
                    <div className="mt-4 p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                      <AlertTriangle className="size-4 shrink-0" />
                      <span>{actionErrors[cand.id]}</span>
                    </div>
                  )}

                  {/* Justification & Actions if Pending */}
                  {isPending && (
                    <div className="mt-4 pt-4 border-t border-border/60 space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor={`justification-${cand.id}`} className="text-xs">
                          {t.duplicates.justificationPrompt}
                        </Label>
                        <Textarea
                          id={`justification-${cand.id}`}
                          value={justifications[cand.id] || ''}
                          onChange={(e) => handleJustificationChange(cand.id, e.target.value)}
                          placeholder={t.duplicates.justificationPlaceholder}
                          rows={2}
                          className="text-xs resize-none"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-muted-foreground hover:text-foreground"
                          disabled={processingId === cand.id}
                          onClick={() => handleReview(cand, 'dismissed_distinct')}
                        >
                          <XCircle className="size-3.5 mr-1" />
                          {t.duplicates.actionDismiss}
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs"
                          disabled={processingId === cand.id}
                          onClick={() => handleReview(cand, 'confirmed_duplicate')}
                        >
                          <Check className="size-3.5 mr-1" />
                          {t.duplicates.actionConfirm}
                        </Button>

                        <Button
                          variant="default"
                          size="sm"
                          className="text-xs bg-primary"
                          disabled={processingId === cand.id}
                          onClick={() => openMergeModal(cand)}
                        >
                          <GitMerge className="size-3.5 mr-1" />
                          {t.duplicates.actionMerge}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Controlled Merge Confirmation Modal */}
        <Dialog
          open={mergeDialogOpen}
          onClose={() => setMergeDialogOpen(false)}
          title={t.duplicates.mergeDialogTitle}
          description={t.duplicates.mergeDialogWarning}
        >
          <div className="space-y-4 pt-2">
            {targetCandidate && (
              <div className="p-3 rounded-xl border border-border bg-muted/30 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isBn ? 'টিকে থাকা রেকর্ড (Surviving):' : 'Surviving Record:'}
                  </span>
                  <span className="font-semibold text-primary">
                    {targetCandidate.primaryPatient?.patientId} ({targetCandidate.primaryPatient?.fullName})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isBn ? 'অবসরপ্রাপ্ত রেকর্ড (Retired):' : 'Retired Record:'}
                  </span>
                  <span className="font-semibold text-destructive line-through">
                    {targetCandidate.candidatePatient?.patientId} ({targetCandidate.candidatePatient?.fullName})
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                {t.duplicates.justificationPrompt}
              </Label>
              <Textarea
                value={mergeJustification}
                onChange={(e) => setMergeJustification(e.target.value)}
                placeholder={t.duplicates.justificationPlaceholder}
                rows={3}
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setMergeDialogOpen(false)}
                disabled={isMerging}
              >
                {t.registration.cancelBtn}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="text-xs"
                onClick={handleExecuteMerge}
                disabled={isMerging}
              >
                <GitMerge className="size-3.5 mr-1" />
                {isMerging
                  ? (isBn ? 'একীভূত হচ্ছে...' : 'Executing Merge...')
                  : t.duplicates.confirmMergeBtn}
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
