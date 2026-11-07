'use client'

import React, { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useLanguage } from '@/i18n'
import type { RiskMethodologyItem, RiskAssessmentRecord, RiskExecutionMode } from '../types'
import { getAvailableMethodologiesAction, executeRiskEstimationAction } from '../actions'
import { RiskAssessmentView } from './risk-assessment-view'

interface RiskExecutionDialogProps {
  patientId: string
  patientName?: string
  facilityId?: string
  onComplete?: (record: RiskAssessmentRecord) => void
  trigger?: React.ReactNode
}

export function RiskExecutionDialog({
  patientId,
  patientName,
  facilityId = 'fac-001',
  onComplete,
  trigger,
}: RiskExecutionDialogProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.riskEstimation

  const [open, setOpen] = useState(false)
  const [methodologies, setMethodologies] = useState<RiskMethodologyItem[]>([])
  const [selectedMethodologyId, setSelectedMethodologyId] = useState<string>('plcom2012')
  const [executionMode, setExecutionMode] = useState<RiskExecutionMode>('clinical_production')
  const [loading, setLoading] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RiskAssessmentRecord | null>(null)

  const handleOpenModal = () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setOpen(true)
  }

  useEffect(() => {
    let cancelled = false
    async function loadMethodologies() {
      if (!open) return
      try {
        const res = await getAvailableMethodologiesAction()
        if (cancelled) return
        if (res.success && res.data) {
          setMethodologies(res.data)
          if (res.data.length > 0 && !selectedMethodologyId) {
            setSelectedMethodologyId(res.data[0].id)
          }
        } else {
          setError(res.error || 'Failed to load methodologies')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load methodologies')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (open) {
      loadMethodologies()
    }
    return () => {
      cancelled = true
    }
  }, [open, selectedMethodologyId])

  const selectedMethodology = methodologies.find((m) => m.id === selectedMethodologyId)

  const handleExecute = async () => {
    setExecuting(true)
    setError(null)
    try {
      const res = await executeRiskEstimationAction({
        patientId,
        methodologyId: selectedMethodologyId,
        executionMode,
        facilityId,
      })

      if (res.success && res.data) {
        setResult(res.data)
        onComplete?.(res.data)
      } else {
        setError(res.error || 'Execution failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown execution error')
    } finally {
      setExecuting(false)
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
          disabled={executing || !selectedMethodologyId}
        >
          {executing ? t.execution.calculating : t.execution.confirmExecution}
        </Button>
      ) : (
        <Button onClick={() => setResult(null)} variant="outline" size="sm">
          {isBn ? 'নতুন অ্যাসেসমেন্ট চালান' : 'Run Another Calculation'}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {t.execution.runCalculation}
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
              <RiskAssessmentView assessment={result} />
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
                  {t.execution.executionMode}
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
                        ? 'ক্লিনিক্যাল প্রটোকল অনুসারে পরিচালিত। অনুমোদনহীন হলে স্কোর প্রদর্শন স্থগিত থাকবে।'
                        : 'Subject to strict clinical governance. Unapproved models will be safely paused.'}
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
                        ? 'গবেষণা ও যাচাইকরণ মোড। গাণিতিক ফলাফল প্রদান করে, চিকিৎসায় ব্যবহার নিষেধ।'
                        : 'Computes empirical mathematical score with non-clinical research watermark.'}
                    </p>
                  </button>
                </div>
              </div>

              {/* Methodology Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  {t.execution.methodology}
                </label>
                <div className="space-y-2">
                  {loading ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      {isBn ? 'পদ্ধতি তালিকা লোড হচ্ছে...' : 'Loading methodologies...'}
                    </div>
                  ) : (
                    methodologies.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMethodologyId(m.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedMethodologyId === m.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground">{m.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {m.code}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground capitalize">{m.calculationType}</span>
                            {m.approvedForBangladesh ? (
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
                          {m.outputDefinition}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Live Governance Safety Warning when executing clinical mode with unapproved model */}
              {executionMode === 'clinical_production' && selectedMethodology && !selectedMethodology.approvedForBangladesh && (
                <Alert variant="warning" className="text-xs">
                  <AlertTitle className="font-semibold text-amber-900 dark:text-amber-200">
                    {t.governanceNoticeTitle}
                  </AlertTitle>
                  <AlertDescription className="text-amber-800 dark:text-amber-300 text-[11px] mt-1">
                    {isBn
                      ? `বিজ্ঞপ্তি: "${selectedMethodology.name}" মডেলটি বাংলাদেশে ক্লিনিক্যাল ব্যবহারে অনুমোদিত নয়। প্রোডাকশন মোডে অ্যাসেসমেন্ট চালালে ইঞ্জিনটি কোনো স্কোর তৈরি না করে ক্লিনিক্যাল সুরক্ষা বিরতি (Safety Pause) প্রদান করবে।`
                      : `Notice: "${selectedMethodology.name}" is not approved for routine clinical deployment in Bangladesh. Clinical production execution will safely pause calculation and will NOT fabricate an unapproved score.`}
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
