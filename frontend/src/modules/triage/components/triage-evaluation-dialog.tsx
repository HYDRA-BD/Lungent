'use client'

/**
 * Phase 1.14: Symptom Triage Evaluation Dialog Component
 */

import React, { useState, useEffect } from 'react'
import {
  Stethoscope,
  ShieldAlert,
  FlaskConical,
  Activity,
} from 'lucide-react'
import { useLanguage } from '@/i18n'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SymptomQuestionnaire } from './symptom-questionnaire'
import { TriageResultView } from './triage-result-view'
import {
  getAvailableTriageProtocolsAction,
  evaluateSymptomTriageAction,
} from '../actions'
import type {
  SymptomTriageProtocolItem,
  SymptomTriageDeterminationRecord,
  PatientSymptomIntakePayload,
} from '../types'

interface TriageEvaluationDialogProps {
  patientId: string
  patientName?: string
  facilityId?: string
  trigger?: React.ReactNode
  triggerLabel?: string
  triggerVariant?: 'default' | 'outline' | 'secondary'
  triggerSize?: 'sm' | 'default' | 'lg'
  onComplete?: (record: SymptomTriageDeterminationRecord) => void
}

export function TriageEvaluationDialog({
  patientId,
  patientName,
  facilityId,
  trigger,
  triggerLabel,
  triggerVariant = 'outline',
  triggerSize = 'sm',
  onComplete,
}: TriageEvaluationDialogProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const [open, setOpen] = useState(false)
  const [protocols, setProtocols] = useState<SymptomTriageProtocolItem[]>([])
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>('proto-nice-ng12-2023')
  const [executionMode, setExecutionMode] = useState<'clinical_production' | 'research_simulation'>('clinical_production')
  const [evaluating, setEvaluating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SymptomTriageDeterminationRecord | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadProtocols() {
      try {
        const res = await getAvailableTriageProtocolsAction()
        if (res.success && res.data) {
          if (!cancelled) {
            setProtocols(res.data)
            if (res.data.length > 0 && !selectedProtocolId) {
              setSelectedProtocolId(res.data[0].id)
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load protocols')
        }
      }
    }

    if (open) {
      loadProtocols()
    }
    return () => {
      cancelled = true
    }
  }, [open, selectedProtocolId])

  const selectedProtocol = protocols.find((p) => p.id === selectedProtocolId)

  const handleSymptomSubmit = async (symptomsPayload: PatientSymptomIntakePayload) => {
    setEvaluating(true)
    setError(null)
    try {
      const res = await evaluateSymptomTriageAction({
        patientId,
        symptomsPayload,
        protocolId: selectedProtocolId,
        executionMode,
        facilityId,
        provenance: 'clinician_verified',
      })

      if (res.success && res.data) {
        setResult(res.data)
        onComplete?.(res.data)
      } else {
        setError(res.error || 'Evaluation failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during triage evaluation')
    } finally {
      setEvaluating(false)
    }
  }

  const dialogFooter = (
    <div className="flex items-center justify-between w-full">
      <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
        {isBn ? 'বন্ধ করুন' : 'Close'}
      </Button>
      {result && (
        <Button onClick={() => setResult(null)} variant="outline" size="sm">
          {isBn ? 'নতুন মূল্যায়ন চালান' : 'Run Another Evaluation'}
        </Button>
      )}
    </div>
  )

  return (
    <>
      <div onClick={() => setOpen(true)} className="inline-block">
        {trigger || (
          <Button variant={triggerVariant} size={triggerSize} className="gap-2">
            <Activity className="size-4 text-primary" />
            {triggerLabel || (isBn ? 'লক্ষণভিত্তিক ট্রায়াজ চালান' : 'Evaluate Symptom Triage')}
          </Button>
        )}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={isBn ? 'লক্ষণভিত্তিক ক্লিনিক্যাল ট্রায়াজ ইঞ্জিন' : 'Symptom-Based Clinical Triage Engine'}
        description={patientName ? `${isBn ? 'রোগী:' : 'Patient:'} ${patientName}` : undefined}
        size="xl"
        footer={dialogFooter}
      >
        <div className="max-h-[75vh] overflow-y-auto px-1 py-2 space-y-5">
          {result ? (
            <TriageResultView record={result} />
          ) : (
            <div className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Execution Mode Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  {isBn ? 'মূল্যায়ন মোড নির্বাচন' : 'Evaluation Mode'}
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
                      <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <Stethoscope className="h-3.5 w-3.5 text-primary" />
                        Clinical Production Mode
                      </span>
                      <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                        Standard
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Governed operational care. Enforces Clinical Governance safety gate; unapproved protocols pause evaluation.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExecutionMode('research_simulation')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      executionMode === 'research_simulation'
                        ? 'border-amber-500 bg-amber-50/20 ring-1 ring-amber-500'
                        : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <FlaskConical className="h-3.5 w-3.5 text-amber-600" />
                        Research Simulation Mode
                      </span>
                      <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        Investigational
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Simulate algorithmic criteria for research, validation, or clinical study under strict research watermarks.
                    </p>
                  </button>
                </div>
              </div>

              {/* Protocol Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  {isBn ? 'ক্লিনিক্যাল ট্রায়াজ প্রোটোকল' : 'Clinical Triage Protocol'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {protocols.map((proto) => (
                    <button
                      key={proto.id}
                      type="button"
                      onClick={() => setSelectedProtocolId(proto.id)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        selectedProtocolId === proto.id
                          ? 'border-primary bg-primary/5 font-semibold text-foreground'
                          : 'border-border text-muted-foreground hover:bg-muted/20'
                      }`}
                    >
                      <div className="font-bold text-foreground">{proto.protocolCode}</div>
                      <div className="text-[11px] truncate mt-0.5">{proto.name}</div>
                    </button>
                  ))}
                </div>

                {selectedProtocol && !selectedProtocol.approvedForBangladesh && executionMode === 'clinical_production' && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg border border-amber-300 bg-amber-50/80 text-amber-900 text-xs dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                    <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Notice: <strong>{selectedProtocol.protocolCode}</strong> is not approved for routine clinical deployment in Bangladesh. Production evaluation will pause to uphold clinical safety. Switch to <em>Research Simulation Mode</em> to inspect criteria calculations.
                    </span>
                  </div>
                )}
              </div>

              {/* Questionnaire */}
              <div className="pt-2 border-t border-border">
                <SymptomQuestionnaire
                  onSubmit={handleSymptomSubmit}
                  isSubmitting={evaluating}
                  patientName={patientName}
                />
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </>
  )
}
