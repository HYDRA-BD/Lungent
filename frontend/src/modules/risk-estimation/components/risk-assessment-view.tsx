'use client'

import React from 'react'
import type { RiskAssessmentRecord } from '../types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useLanguage } from '@/i18n'

interface RiskAssessmentViewProps {
  assessment: RiskAssessmentRecord
  compact?: boolean
  showProvenance?: boolean
}

export function RiskAssessmentView({
  assessment,
  compact = false,
  showProvenance = true,
}: RiskAssessmentViewProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.riskEstimation

  const isPaused = assessment.executionStatus === 'methodology_not_approved'
  const isResearch = assessment.isResearchExecution || assessment.executionMode === 'research_simulation'
  const isCompleted = assessment.executionStatus === 'completed'

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

      {/* 2. CORE ASSESSMENT SUMMARY CARD */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                  {assessment.methodologyVersion}
                </span>
                <Badge variant={isPaused ? 'secondary' : isResearch ? 'outline' : 'default'}>
                  {assessment.executionMode === 'clinical_production'
                    ? t.execution.clinicalProduction
                    : t.execution.researchSimulation}
                </Badge>
                {assessment.isClinicallyApproved ? (
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
                {assessment.methodologyName}
              </CardTitle>
            </div>

            <div className="text-right text-xs text-muted-foreground">
              <span>{isBn ? 'সম্পাদনের তারিখ:' : 'Executed:'}</span>{' '}
              <span className="font-medium text-foreground">
                {new Date(assessment.executedAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
                  dateStyle: 'medium',
                })}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* PRIMARY METRICS OR GOVERNANCE PAUSE */}
          {isPaused ? (
            <div className="rounded-lg border border-dashed border-amber-300 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 p-6 text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 mb-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-base font-semibold text-foreground">
                {t.results.governancePaused}
              </h4>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                {t.results.noApprovedModel}
              </p>
              <div className="pt-3">
                <span className="inline-block text-[11px] font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded">
                  Refusal Code: METHODOLOGY_NOT_APPROVED_FOR_BANGLADESH
                </span>
              </div>
            </div>
          ) : isCompleted && assessment.estimatedRiskPercentage !== null ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                <span className="text-xs font-medium text-muted-foreground block mb-1">
                  {t.results.estimatedRisk}
                </span>
                <span className="text-3xl font-extrabold tracking-tight text-primary">
                  {assessment.estimatedRiskPercentage.toFixed(1)}%
                </span>
                <span className="text-[11px] text-muted-foreground block mt-1">
                  {isBn ? `${assessment.timeHorizonYears} বছরের প্রক্ষেপিত ঝুঁকি` : `Projected ${assessment.timeHorizonYears}-Year Risk`}
                </span>
              </div>

              <div className="rounded-xl border border-border p-4 text-center bg-card">
                <span className="text-xs font-medium text-muted-foreground block mb-1">
                  {t.results.uncertaintyInterval}
                </span>
                <span className="text-xl font-bold tracking-tight text-foreground">
                  {assessment.uncertaintyRange
                    ? `[${assessment.uncertaintyRange.lowerBound.toFixed(1)}% – ${assessment.uncertaintyRange.upperBound.toFixed(1)}%]`
                    : '—'}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-1">
                  {isBn ? 'পরিসংখ্যানগত আস্থা সীমা' : 'Statistical Confidence Bounds'}
                </span>
              </div>

              <div className="rounded-xl border border-border p-4 text-center bg-card">
                <span className="text-xs font-medium text-muted-foreground block mb-1">
                  {t.results.riskTier}
                </span>
                <div className="mt-1">
                  <Badge
                    variant={
                      assessment.riskCategory === 'high' || assessment.riskCategory === 'elevated'
                        ? 'destructive'
                        : assessment.riskCategory === 'moderate'
                        ? 'secondary'
                        : 'outline'
                    }
                    className="text-sm px-3 py-1 font-semibold uppercase"
                  >
                    {assessment.riskCategory || 'Assessed'}
                  </Badge>
                </div>
                <span className="text-[11px] text-muted-foreground block mt-2">
                  {isBn ? 'স্তরিত ঝুঁকি শ্রেণি' : 'Stratified Cohort Group'}
                </span>
              </div>
            </div>
          ) : null}

          {/* 3. CONTRIBUTING FACTORS BREAKDOWN */}
          {assessment.explanation && assessment.explanation.contributingFactors.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {t.results.factorAttributions}
              </h4>

              <div className="rounded-lg border border-border divide-y divide-border/60 overflow-hidden text-xs">
                {assessment.explanation.contributingFactors.map((factor, idx) => (
                  <div key={idx} className="p-3 flex items-start justify-between gap-4 bg-card hover:bg-muted/30">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{factor.factorLabel}</span>
                        <span className="text-muted-foreground font-mono text-[11px]">
                          ({factor.valueDisplay})
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px]">{factor.clinicalExplanation}</p>
                    </div>

                    <div className="shrink-0">
                      {factor.direction === 'increases_risk' && (
                        <span className="inline-flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded text-[11px]">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          {t.results.factorIncreasing}
                        </span>
                      )}
                      {factor.direction === 'decreases_risk' && (
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-[11px]">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          {t.results.factorDecreasing}
                        </span>
                      )}
                      {factor.direction === 'neutral' && (
                        <span className="inline-flex items-center gap-1 font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded text-[11px]">
                          {t.results.factorNeutral}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. MISSING DATA IMPACT */}
          {assessment.explanation && assessment.explanation.missingFactorsImpact && (
            <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200">
              <span className="font-semibold block mb-1">{t.results.missingDataNotice}:</span>
              <p>{assessment.explanation.missingFactorsImpact}</p>
            </div>
          )}

          {/* 5. CLINICAL DECISION SUPPORT SAFETY DISCLAIMERS */}
          {!compact && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t.disclaimer.whatThisMeansTitle}
                </h5>
                <ul className="text-xs space-y-1.5 text-blue-800 dark:text-blue-300">
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{assessment.explanation?.whatThisMeans || t.subtitle}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>
                      {isBn
                        ? 'লক্ষণহীন প্রতিরোধমূলক অ্যাসেসমেন্ট হিসেবে ভবিষ্যৎ স্বাস্থ্য ঝুঁকি বিবেচনায় সাহায্য করে।'
                        : 'Intended to inform asymptomatic preventive screening discussions with qualified clinicians.'}
                    </span>
                  </li>
                </ul>
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
                    <span>{t.disclaimer.lowRiskNotZero}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-500 mt-0.5">✕</span>
                    <span>{t.disclaimer.symptomsPrecedence}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-500 mt-0.5">✕</span>
                    <span>{t.disclaimer.screeningSeparate}</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* 6. PROVENANCE & INPUT SNAPSHOT */}
          {showProvenance && assessment.inputSnapshot && (
            <div className="pt-4 border-t border-border/60 text-xs text-muted-foreground space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {t.provenance.inputSnapshot}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  SHA-256: {assessment.inputSnapshot.snapshotHash.substring(0, 16)}...
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded bg-muted/40 text-[11px]">
                <div>
                  <span className="text-muted-foreground block">{t.provenance.packYears}</span>
                  <span className="font-semibold text-foreground">
                    {assessment.inputSnapshot.derived.packYears.toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t.provenance.yearsSmoked}</span>
                  <span className="font-semibold text-foreground">
                    {assessment.inputSnapshot.derived.yearsSmoked}{' '}
                    {isBn ? 'বছর' : 'yrs'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t.provenance.bmi}</span>
                  <span className="font-semibold text-foreground">
                    {assessment.inputSnapshot.derived.bmi?.toFixed(1) || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{isBn ? 'বায়োমাস এক্সপোজার' : 'Biomass Smoke'}</span>
                  <span className="font-semibold text-foreground">
                    {assessment.inputSnapshot.environmentalAndOccupational.hasBiomassCookingFuel
                      ? isBn ? 'হ্যাঁ' : 'Present'
                      : isBn ? 'না' : 'None'}
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
