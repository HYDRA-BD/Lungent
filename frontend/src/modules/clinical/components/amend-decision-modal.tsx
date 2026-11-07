'use client'

import React, { useState } from 'react'
import {
  FileEdit,
  AlertTriangle,
  History,
  Loader2,
  X,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/i18n'
import { amendClinicalDecisionAction } from '@/modules/clinical/actions'
import type { ClinicalDecisionItem } from '@/modules/clinical/types'
import type { ClinicalDecisionType } from '@/types/database'

interface AmendDecisionModalProps {
  isOpen: boolean
  onClose: () => void
  decision: ClinicalDecisionItem
  onSuccess?: (decision: ClinicalDecisionItem) => void
}

export function AmendDecisionModal({
  isOpen,
  onClose,
  decision,
  onSuccess,
}: AmendDecisionModalProps) {
  const { locale, dict } = useLanguage()
  const isBn = locale === 'bn'
  const cT = dict.clinicalWorkspace.decision
  const aT = dict.clinicalWorkspace.amendment

  const [amendmentReason, setAmendmentReason] = useState('')
  const [decisionType, setDecisionType] = useState<ClinicalDecisionType>(decision.decisionType)
  const [rationale, setRationale] = useState(decision.rationale)
  const [recommendedSteps, setRecommendedSteps] = useState(decision.recommendedNextSteps)
  const [referralTarget, setReferralTarget] = useState(decision.referralTarget || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (amendmentReason.trim().length < 10) {
      setError(
        isBn
          ? 'সংশোধনের সুনির্দিষ্ট ক্লিনিক্যাল কারণ (ন্যূনতম ১০ অক্ষর) উল্লেখ করা বাধ্যতামূলক।'
          : 'Mandatory clinical justification (minimum 10 characters) is required for amendment.'
      )
      return
    }

    if (rationale.trim().length < 10) {
      setError(
        isBn
          ? 'ক্লিনিক্যাল যুক্তি ন্যূনতম ১০ অক্ষরের হওয়া আবশ্যক।'
          : 'Clinical rationale must be at least 10 characters.'
      )
      return
    }

    setIsSubmitting(true)
    try {
      const result = await amendClinicalDecisionAction({
        decisionId: decision.id,
        amendmentReason: amendmentReason.trim(),
        amendedContent: {
          decisionType,
          rationale: rationale.trim(),
          recommendedNextSteps: recommendedSteps.trim(),
          referralTarget: referralTarget.trim() || null,
        },
      })

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to amend clinical decision')
      }

      onSuccess?.(result.data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while amending the decision.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
            <History className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{aT.modalTitle}</h2>
            <p className="text-sm text-muted-foreground">
              {isBn ? `রোগী: ${decision.patientName || 'Patient'}` : `Patient: ${decision.patientName || 'Patient'}`}
            </p>
          </div>
        </div>

        {/* Immutable Audit Warning */}
        <div className="my-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold">{isBn ? 'অপরিবর্তনীয় অডিট ট্রেইল: ' : 'Audit Integrity: '}</span>
            {aT.warning}
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground">
              {aT.reasonLabel} <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={2}
              value={amendmentReason}
              onChange={(e) => setAmendmentReason(e.target.value)}
              placeholder={aT.reasonPlaceholder}
              className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              {cT.decisionTypeLabel}
            </label>
            <select
              value={decisionType}
              onChange={(e) => setDecisionType(e.target.value as ClinicalDecisionType)}
              className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="screening_recommended">{cT.types.screening_recommended}</option>
              <option value="diagnostic_workup_needed">{cT.types.diagnostic_workup_needed}</option>
              <option value="urgent_specialist_referral">{cT.types.urgent_specialist_referral}</option>
              <option value="routine_follow_up">{cT.types.routine_follow_up}</option>
              <option value="no_immediate_intervention">{cT.types.no_immediate_intervention}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              {cT.rationaleLabel}
            </label>
            <textarea
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              {cT.recommendedStepsLabel}
            </label>
            <textarea
              rows={2}
              value={recommendedSteps}
              onChange={(e) => setRecommendedSteps(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              {cT.referralTargetLabel}
            </label>
            <input
              type="text"
              value={referralTarget}
              onChange={(e) => setReferralTarget(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                  <FileEdit className="size-4" />
                  {aT.submitBtn}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
