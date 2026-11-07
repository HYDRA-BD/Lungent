'use client'

import React, { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useLanguage } from '@/i18n'
import type {
  ScreeningGuidelineItem,
  ScreeningEligibilityRecord,
  RiskExecutionMode,
} from '../types'
import { getAvailableGuidelinesAction, evaluateScreeningEligibilityAction } from '../actions'
import { ScreeningResultView } from './screening-result-view'

interface ScreeningEvaluationDialogProps {
  patientId: string
  patientName?: string
  facilityId?: string
  onComplete?: (record: ScreeningEligibilityRecord) => void
  trigger?: React.ReactNode
}

export function ScreeningEvaluationDialog({
  patientId,
  patientName,
  facilityId = 'fac-001',
  onComplete,
  trigger,
}: ScreeningEvaluationDialogProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.screeningEligibility

  const [open, setOpen] = useState(false)
  const [guidelines, setGuidelines] = useState<ScreeningGuidelineItem[]>([])
  const [selectedGuidelineId, setSelectedGuidelineId] = useState<string>('gl-uspstf-2021')
  const [executionMode, setExecutionMode] = useState<RiskExecutionMode>('clinical_production')
  const [loading, setLoading] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScreeningEligibilityRecord | null>(null)

  const handleOpenModal = () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setOpen(true)
  }

  useEffect(() => {
    let cancelled = false
    async function loadGuidelines() {
      if (!open) return
      try {
        const res = await getAvailableGuidelinesAction()
        if (cancelled) return
        if (res.success && res.data) {
          setGuidelines(res.data)
          if (res.data.length > 0 && !selectedGuidelineId) {
            setSelectedGuidelineId(res.data[0].id)
          }
        } else {
          setError(res.error || 'Failed to load screening guidelines')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load screening guidelines')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (open) {
      loadGuidelines()
    }
    return () => {
      cancelled = true
    }
  }, [open, selectedGuidelineId])

  const selectedGuideline = guidelines.find((g) => g.id === selectedGuidelineId)

  const handleExecute = async () => {
    setEvaluating(true)
    setError(null)
    try {
      const res = await evaluateScreeningEligibilityAction({
        patientId,
        guidelineId: selectedGuidelineId,
        executionMode,
        facilityId,
      })

      if (res.success && res.data) {
        setResult(res.data)
        onComplete?.(res.data)
      } else {
        setError(res.error || 'Evaluation failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown evaluation error')
    } finally {
      setEvaluating(false)
    }
  }

  const dialogFooter = (
    <div className="flex items-center justify-end gap-2 w-full">
      <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
        {t.execution.cancel}
      </Button>
      {!result ? (
        <Button
          size="sm"
          onClick={handleExecute}
          disabled={evaluating || !selectedGuidelineId}
        >
          {evaluating ? t.execution.evaluating : t.execution.confirm}
        </Button>
      ) : (
        <Button onClick={() => setResult(null)} variant="outline" size="sm">
          {t.execution.recalculate}
        </Button>
      )}
    </div>
  )

  return (
    <>
      <div onClick={handleOpenModal} className="inline-block">
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {t.execution.evaluateBtn}
          </Button>
        )}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t.title}
        description={patientName ? `${isBn ? 'রোগী:' : 'Patient:'} ${patientName}` : t.subtitle}
        size="xl"
        footer={dialogFooter}
      >
        <div className="max-h-[70vh] overflow-y-auto px-1">
          {result ? (
            <div className="space-y-4 py-2">
              <ScreeningResultView record={result} />
            </div>
          ) : (
            <div className="space-y-5 py-2">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Execution Mode Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  {t.execution.modeLabel}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExecutionMode('clinical_production')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      executionMode === 'clinical_production'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">
                        {t.execution.clinicalProduction}
                      </span>
                      <Badge variant={executionMode === 'clinical_production' ? 'default' : 'outline'} className="text-[10px]">
                        {isBn ? 'ক্লিনিক্যাল' : 'Clinical'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {isBn
                        ? 'ক্লিনিক্যাল পরিচালনাধীন। অননুমোদিত নির্দেশিকার ক্ষেত্রে মূল্যায়ন বিরতি কার্যকর হবে।'
                        : 'Subject to strict clinical governance. Unapproved guidelines will be safely paused.'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExecutionMode('research_simulation')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      executionMode === 'research_simulation'
                        ? 'border-purple-500 bg-purple-500/5 ring-1 ring-purple-500'
                        : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">
                        {t.execution.researchSimulation}
                      </span>
                      <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-300">
                        {isBn ? 'গবেষণা' : 'Research'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {isBn
                        ? 'গবেষণা ও যাচাইকরণ মোড। মানদণ্ড যাচাই করে তবে চিকিৎসায় ব্যবহার নিষেধ।'
                        : 'Evaluates criteria deterministically with non-clinical research watermark.'}
                    </p>
                  </button>
                </div>
              </div>

              {/* Guideline Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  {t.execution.guidelineLabel}
                </label>
                <div className="space-y-2">
                  {loading ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      {isBn ? 'নির্দেশিকা লোড হচ্ছে...' : 'Loading guidelines...'}
                    </div>
                  ) : (
                    guidelines.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => setSelectedGuidelineId(g.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedGuidelineId === g.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground">{g.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {g.guidelineCode}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">
                              {g.screeningIntervalMonths}m Interval
                            </span>
                            {g.approvedForBangladesh ? (
                              <Badge variant="default" className="text-[10px] bg-emerald-600">
                                {t.badges.clinicalApproved}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                                {t.badges.unapproved}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                          {g.intendedPopulation}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Live Governance Safety Warning when executing clinical mode with unapproved guideline */}
              {executionMode === 'clinical_production' && selectedGuideline && !selectedGuideline.approvedForBangladesh && (
                <Alert variant="warning" className="text-xs">
                  <AlertTitle className="font-semibold text-amber-900 dark:text-amber-200">
                    {t.governanceNoticeTitle}
                  </AlertTitle>
                  <AlertDescription className="text-amber-800 dark:text-amber-300 text-[11px] mt-1">
                    {isBn
                      ? `বিজ্ঞপ্তি: "${selectedGuideline.name}" নির্দেশিকাটি বাংলাদেশে ক্লিনিক্যাল ব্যবহারে অনুমোদিত নয়। প্রোডাকশন মোডে মূল্যায়ন চালালে ইঞ্জিনটি কোনো সুপারিশ বা পরীক্ষা তৈরি না করে ক্লিনিক্যাল সুরক্ষা বিরতি (Safety Pause) প্রদান করবে।`
                      : `Notice: "${selectedGuideline.name}" is not approved for routine clinical deployment in Bangladesh. Clinical production execution will safely pause calculation and will NOT fabricate an unapproved screening recommendation or imaging order.`}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </Dialog>
    </>
  )
}

