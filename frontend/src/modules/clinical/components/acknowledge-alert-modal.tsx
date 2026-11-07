'use client'

import React, { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/i18n'
import { acknowledgeClinicalAlertAction } from '@/modules/clinical/actions'
import type { ClinicalAlertItem } from '@/modules/clinical/types'

interface AcknowledgeAlertModalProps {
  isOpen: boolean
  onClose: () => void
  alert: ClinicalAlertItem
  onSuccess?: (alert: ClinicalAlertItem) => void
}

export function AcknowledgeAlertModal({
  isOpen,
  onClose,
  alert,
  onSuccess,
}: AcknowledgeAlertModalProps) {
  const { locale, dict } = useLanguage()
  const isBn = locale === 'bn'
  const alT = dict.clinicalWorkspace.alerts

  const [notes, setNotes] = useState('')
  const [markResolved, setMarkResolved] = useState(alert.status === 'acknowledged')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await acknowledgeClinicalAlertAction({
        alertId: alert.id,
        resolutionNotes: notes.trim() || undefined,
        markResolved,
      })

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update alert status')
      }

      onSuccess?.(result.data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the alert.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSeverityBadgeVariant = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'warning'
      case 'moderate':
        return 'default'
      default:
        return 'outline'
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
          <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{alT.acknowledgeModalTitle}</h2>
            <p className="text-xs text-muted-foreground">
              {isBn ? `রোগী: ${alert.patientName || 'Patient'}` : `Patient: ${alert.patientName || 'Patient'}`}
            </p>
          </div>
        </div>

        {/* Alert Information Summary */}
        <div className="my-4 rounded-lg border border-border bg-muted/40 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant={getSeverityBadgeVariant(alert.severity)}>
              {alert.severity.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">{alert.alertType}</span>
          </div>
          <h3 className="font-semibold text-foreground">
            {isBn && alert.titleBn ? alert.titleBn : alert.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isBn && alert.descriptionBn ? alert.descriptionBn : alert.description}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">
              {alT.resolutionNotesLabel}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={alT.resolutionNotesPlaceholder}
              className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
            <input
              type="checkbox"
              checked={markResolved}
              onChange={(e) => setMarkResolved(e.target.checked)}
              className="size-4 rounded border-input text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-foreground">
              {alT.markResolvedCheckbox}
            </span>
          </label>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {isBn ? 'আপডেট হচ্ছে...' : 'Updating...'}
                </>
              ) : markResolved ? (
                <>
                  <CheckCircle2 className="size-4" />
                  {alT.resolveBtn}
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" />
                  {alT.confirmAction}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
