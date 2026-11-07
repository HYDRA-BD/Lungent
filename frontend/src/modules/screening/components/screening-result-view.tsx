'use client'

import React from 'react'
import type { ScreeningEligibilityRecord } from '../types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useLanguage } from '@/i18n'

interface ScreeningResultViewProps {
  record: ScreeningEligibilityRecord
  compact?: boolean
  showProvenance?: boolean
}

export function ScreeningResultView({
  record,
  compact = false,
  showProvenance = true,
}: ScreeningResultViewProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.screeningEligibility

  const isPaused = record.executionStatus === 'guideline_not_approved'
  const isResearch = record.isResearchExecution || record.executionMode === 'research_simulation'
  const isSymptomatic = record.inputSnapshot?.derived?.hasActiveConcerningSymptoms
  const isEligible = record.eligibilityOutcome === 'eligible'
  const isAdditionalInfo = record.eligibilityOutcome === 'additional_info_required'

  return (
    <div className="space-y-6">
      {/* 1. CLINICAL GOVERNANCE OR RESEARCH BANNER */}
      {isPaused && (
        <Alert variant="warning" className="border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="space-y-1">
              <AlertTitle className="text-sm font-semibold tracking-tight text-amber-900 dark:text-amber-200">
                {t.governanceNoticeTitle}
              </AlertTitle>
              <AlertDescription className="text-xs text-amber-800 dark:text-amber-300">
                {t.governanceNoticePaused}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {isResearch && (
        <Alert className="border-purple-500/40 bg-purple-500/10 text-purple-950 dark:text-purple-100">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            <div className="space-y-1">
              <AlertTitle className="text-sm font-semibold tracking-tight text-purple-900 dark:text-purple-200">
                {isBn ? 'গবেষণা ও যাচাইকরণ সিমুলেশন' : 'Research Simulation Execution'}
              </AlertTitle>
              <AlertDescription className="text-xs text-purple-800 dark:text-purple-300">
                {t.researchModeNotice}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* 2. CRITICAL SYMPTOM TRIAGE DIVERSION ALERT */}
      {isSymptomatic && (
        <Alert variant="destructive" className="border-rose-500/50 bg-rose-500/10 text-rose-950 dark:text-rose-100">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="space-y-1">
              <AlertTitle className="text-sm font-bold tracking-tight text-rose-900 dark:text-rose-200">
                {t.symptomPriorityWarningTitle}
              </AlertTitle>
              <AlertDescription className="text-xs text-rose-800 dark:text-rose-300">
                {t.symptomPriorityWarningDesc}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* 3. MAIN EVALUATION SUMMARY CARD */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                  {record.guidelineCode} ({record.guidelineVersion})
                </span>
                <Badge variant={isPaused ? 'secondary' : isResearch ? 'outline' : 'default'}>
                  {record.executionMode === 'clinical_production'
                    ? t.execution.clinicalProduction
                    : t.execution.researchSimulation}
                </Badge>
                {record.isClinicallyApproved ? (
                  <Badge variant="default" className="bg-emerald-600 text-white">
                    {t.badges.clinicalApproved}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400">
                    {t.badges.unapproved}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg mt-2 font-semibold">
                {record.guidelineName}
              </CardTitle>
            </div>

            <div className="text-right text-xs text-muted-foreground">
              <span>{isBn ? 'মূল্যায়নের তারিখ:' : 'Evaluated:'}</span>{' '}
              <span className="font-medium text-foreground">
                {new Date(record.executedAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
                  dateStyle: 'medium',
                })}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* PRIMARY OUTCOME CALLOUT */}
          {isPaused ? (
            <div className="rounded-lg border border-dashed border-amber-300 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 p-6 text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 mb-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-base font-semibold text-foreground">
                {t.outcomes.guideline_not_approved}
              </h4>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                {record.governanceNotice}
              </p>
              <div className="pt-3">
                <span className="inline-block text-[11px] font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded">
                  Refusal Code: GUIDELINE_NOT_APPROVED_FOR_BANGLADESH
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border p-5 bg-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    {isBn ? 'স্ক্রিনিং মূল্যায়ন ফলাফল' : 'Eligibility Determination'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isEligible ? 'default' : isAdditionalInfo ? 'secondary' : 'outline'}
                      className={`text-sm px-3.5 py-1 font-bold ${
                        isEligible
                          ? 'bg-emerald-600 text-white'
                          : isAdditionalInfo
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {t.outcomes[record.eligibilityOutcome] || record.eligibilityOutcome}
                    </Badge>
                  </div>
                </div>

                {record.recommendedModality && record.recommendedIntervalMonths && (
                  <div className="sm:text-right text-xs text-muted-foreground space-y-0.5">
                    <span className="font-semibold text-foreground block">
                      {record.recommendedModality.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span>
                      {record.recommendedIntervalMonths} {isBn ? 'মাসের স্ক্রিনিং চক্র' : 'Month Surveillance Interval'}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed pt-1">
                {record.clinicalSummary}
              </p>
            </div>
          )}

          {/* 4. CRITERION-LEVEL EVALUATION BREAKDOWN */}
          {record.criteriaEvaluations && record.criteriaEvaluations.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isBn ? 'নির্দেশিকার মানদণ্ডভিত্তিক মূল্যায়ন' : 'Criterion-Level Guideline Breakdown'}
              </h4>

              <div className="rounded-lg border border-border divide-y divide-border/60 overflow-hidden text-xs">
                {record.criteriaEvaluations.map((crit, idx) => (
                  <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 bg-card hover:bg-muted/30">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{crit.criterionLabel}</span>
                        <span className="text-muted-foreground font-mono text-[11px]">
                          ({crit.patientActualValue})
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        {crit.clinicalExplanation}
                      </p>
                    </div>

                    <div className="shrink-0 self-start sm:self-auto">
                      {crit.status === 'met' && (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded text-[11px] border border-emerald-200 dark:border-emerald-800">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {t.criteria.met}
                        </span>
                      )}
                      {crit.status === 'unmet' && (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded text-[11px] border border-rose-200 dark:border-rose-800">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {t.criteria.unmet}
                        </span>
                      )}
                      {crit.status === 'missing' && (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded text-[11px] border border-amber-200 dark:border-amber-800">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                          </svg>
                          {t.criteria.missing}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. CLINICAL CONSIDERATIONS & SHARED DECISION-MAKING */}
          {record.explanation?.clinicalConsiderations && record.explanation.clinicalConsiderations.length > 0 && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2 text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isBn ? 'ক্লিনিক্যাল বিবেচনা ও যৌথ সিদ্ধান্ত গ্রহণ' : 'Clinical Considerations & Shared Decision-Making'}
              </span>
              <ul className="space-y-1.5 text-muted-foreground list-disc list-inside">
                {record.explanation.clinicalConsiderations.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 6. MANDATORY CLINICAL DECISION SUPPORT SAFETY DISCLAIMERS */}
          {!compact && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t.disclaimer.whatThisMeansTitle}
                </h5>
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  {record.explanation?.whatThisMeans || t.subtitle}
                </p>
                {record.explanation?.guidelineCitation && (
                  <p className="text-[11px] text-blue-700/80 dark:text-blue-400/80 italic pt-1 truncate">
                    {record.explanation.guidelineCitation}
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-4 space-y-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  {t.disclaimer.whatThisDoesNotMeanTitle}
                </h5>
                <ul className="text-xs space-y-1.5 text-rose-800 dark:text-rose-300">
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-500 mt-0.5">✕</span>
                    <span className="font-medium">{t.disclaimer.notADiagnosis}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-500 mt-0.5">✕</span>
                    <span>{t.disclaimer.ineligibleNotZeroRisk}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-500 mt-0.5">✕</span>
                    <span>{t.disclaimer.symptomsPrecedence}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-500 mt-0.5">✕</span>
                    <span>{t.disclaimer.clinicalPrerogative}</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* 7. PROVENANCE & SNAPSHOT HASH */}
          {showProvenance && record.inputSnapshot && (
            <div className="pt-4 border-t border-border/60 text-xs text-muted-foreground space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {t.provenance.inputSnapshot}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  SHA-256: {record.inputSnapshotHash.substring(0, 16)}...
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded bg-muted/40 text-[11px]">
                <div>
                  <span className="text-muted-foreground block">{t.provenance.age}</span>
                  <span className="font-semibold text-foreground">
                    {record.inputSnapshot.demographics.age} {isBn ? 'বছর' : 'yrs'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t.provenance.packYears}</span>
                  <span className="font-semibold text-foreground">
                    {record.inputSnapshot.derived.packYears.toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t.provenance.cessation}</span>
                  <span className="font-semibold text-foreground">
                    {record.inputSnapshot.derived.isFormerSmoker
                      ? `${record.inputSnapshot.derived.yearsSinceQuit || '—'} ${isBn ? 'বছর পূর্বে' : 'yrs ago'}`
                      : record.inputSnapshot.derived.isCurrentSmoker
                      ? isBn ? 'সক্রিয় ধূমপায়ী' : 'Active smoker'
                      : isBn ? 'অধূমপায়ী' : 'Never smoked'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t.provenance.symptoms}</span>
                  <span className="font-semibold text-foreground">
                    {record.inputSnapshot.derived.hasActiveConcerningSymptoms
                      ? isBn ? 'লক্ষণযুক্ত' : 'Symptomatic'
                      : isBn ? 'লক্ষণহীন' : 'Asymptomatic'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

