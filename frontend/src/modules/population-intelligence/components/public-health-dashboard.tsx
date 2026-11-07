'use client'

import React, { useState, useTransition } from 'react'
import {
  Users,
  Shield,
  Layers,
  MapPin,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Flame,
  Wind,
  Info,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { PopulationIntelligenceSummary } from '../types'
import { getPopulationSummaryAction } from '../actions'

interface PublicHealthDashboardProps {
  initialSummary: PopulationIntelligenceSummary
  className?: string
}

export function PublicHealthDashboard({
  initialSummary,
  className = '',
}: PublicHealthDashboardProps) {
  const [summary, setSummary] = useState<PopulationIntelligenceSummary>(initialSummary)
  const [activeTab, setActiveTab] = useState<'risk_factors' | 'co_occurrence' | 'geographic' | 'trends' | 'environmental'>('risk_factors')
  const [isPending, startTransition] = useTransition()
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleRefresh = () => {
    startTransition(async () => {
      setStatusMessage(null)
      const res = await getPopulationSummaryAction({
        kThreshold: summary.activePrivacyKThreshold,
      })
      if (res.success && res.data) {
        setSummary(res.data)
        setStatusMessage('Population metrics recalculated with active privacy cell protections.')
      } else {
        setStatusMessage('Failed to refresh population statistics.')
      }
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Clinical Governance & Non-Representativeness Disclaimer Banner */}
      <Alert variant="default" className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="font-semibold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
          Epidemiological Governance &amp; Non-Representativeness Notice (Phase 2.8)
        </AlertTitle>
        <AlertDescription className="text-xs mt-1 leading-relaxed space-y-1">
          <p>{summary.clinicalGovernanceNotices.representativenessCaveatEn}</p>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">{summary.clinicalGovernanceNotices.representativenessCaveatBn}</p>
          <p className="font-medium pt-1 border-t border-amber-200/60 dark:border-amber-800/60">
            {summary.clinicalGovernanceNotices.nonDiagnosticNoticeEn}
          </p>
        </AlertDescription>
      </Alert>

      {/* Cohort Header & Key Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Observed Cohort (N)</div>
              <div className="text-2xl font-bold text-primary">{summary.totalSampleAnalyzed.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Clinical Convenience Sample</div>
            </div>
            <Users className="h-8 w-8 text-primary/30" />
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Privacy Protection</div>
              <div className="text-2xl font-bold text-emerald-600">k &ge; {summary.activePrivacyKThreshold}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Statistical Cell Suppression</div>
            </div>
            <Shield className="h-8 w-8 text-emerald-600/30" />
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Suppressed Cells</div>
              <div className="text-2xl font-bold text-amber-600">{summary.overallSuppressedCellsCount}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Re-identification Safeguards</div>
            </div>
            <Layers className="h-8 w-8 text-amber-600/30" />
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Observation Window</div>
              <div className="text-base font-bold mt-1">{summary.observationPeriod.start.slice(0, 4)} &ndash; {summary.observationPeriod.end.slice(0, 4)}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Bangladesh National Network</div>
            </div>
            <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={isPending} className="p-2">
              <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
            </Button>
          </CardContent>
        </Card>
      </div>

      {statusMessage && (
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-primary" />
          {statusMessage}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <Button
          size="sm"
          variant={activeTab === 'risk_factors' ? 'default' : 'outline'}
          onClick={() => setActiveTab('risk_factors')}
          className="gap-2"
        >
          <Layers className="h-4 w-4" />
          Risk-Factor Prevalences
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'co_occurrence' ? 'default' : 'outline'}
          onClick={() => setActiveTab('co_occurrence')}
          className="gap-2"
        >
          <Flame className="h-4 w-4" />
          Co-Occurrence &amp; Odds
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'geographic' ? 'default' : 'outline'}
          onClick={() => setActiveTab('geographic')}
          className="gap-2"
        >
          <MapPin className="h-4 w-4" />
          Geographic Disparities
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'trends' ? 'default' : 'outline'}
          onClick={() => setActiveTab('trends')}
          className="gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Longitudinal Trends
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'environmental' ? 'default' : 'outline'}
          onClick={() => setActiveTab('environmental')}
          className="gap-2"
        >
          <Wind className="h-4 w-4" />
          Environmental Overlay
        </Button>
      </div>

      {/* 1. Risk-Factor Prevalences Tab */}
      {activeTab === 'risk_factors' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold">Population Risk-Factor Prevalences</h3>
              <p className="text-xs text-muted-foreground">
                Distribution across recorded clinical cohort (N = {summary.totalSampleAnalyzed.toLocaleString()})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.riskFactorPrevalences.map((rf) => (
              <Card key={rf.factorCode} className="border">
                <CardContent className="pt-4 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-sm">{rf.nameEn}</div>
                      <div className="text-[11px] text-muted-foreground">{rf.nameBn}</div>
                    </div>
                    <Badge variant={rf.isSuppressed ? 'secondary' : 'default'} className="text-xs font-mono">
                      {rf.displayPrevalence}
                    </Badge>
                  </div>

                  {/* Prevalence Progress Bar */}
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, rf.prevalencePct)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                    <span>Observed Cases: {rf.isSuppressed ? '< 5 [SUPPRESSED]' : rf.numeratorCount.toLocaleString()}</span>
                    <span>Missingness: {rf.missingnessPct}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 2. Co-Occurrence Pairs Tab */}
      {activeTab === 'co_occurrence' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">Frequently Co-Occurring Risk Factors</h3>
            <p className="text-xs text-muted-foreground">
              Relative odds ratios and joint prevalence across combined exposures
            </p>
          </div>

          <div className="space-y-3">
            {summary.topCoOccurringFactors.map((pair) => (
              <Card key={`${pair.factorA}-${pair.factorB}`} className="border">
                <CardContent className="pt-4 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-sm">{pair.labelEn}</div>
                      <div className="text-[11px] text-muted-foreground">{pair.labelBn}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="font-mono text-xs border-primary/40 text-primary">
                        OR: {pair.relativeOddsRatio.toFixed(2)}x
                      </Badge>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{pair.coOccurrencePct.toFixed(1)}% Joint Rate</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Joint Individuals: {pair.displayJointCount}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 3. Geographic Disparities Tab */}
      {activeTab === 'geographic' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">Regional Geographic Disparities across Bangladesh</h3>
            <p className="text-xs text-muted-foreground">
              Administrative division and district breakdown with sample coverage tiers
            </p>
          </div>

          <Card>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="border-b text-muted-foreground">
                    <tr>
                      <th className="py-2">Division</th>
                      <th className="py-2">District</th>
                      <th className="py-2">Sample (N)</th>
                      <th className="py-2">Smoking %</th>
                      <th className="py-2">Biomass Fuel %</th>
                      <th className="py-2">Ambient PM2.5</th>
                      <th className="py-2">Screening Eligible %</th>
                      <th className="py-2">Urgent Referral %</th>
                      <th className="py-2">Coverage Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {summary.geographicSummary.map((g) => (
                      <tr key={`${g.division}-${g.district}`}>
                        <td className="py-2 font-medium">{g.division}</td>
                        <td className="py-2 font-semibold">{g.district}</td>
                        <td className="py-2 font-mono">{g.displayTotalAssessments}</td>
                        <td className="py-2">{g.isSuppressed ? '[SUPPRESSED]' : `${g.smokingPrevalencePct}%`}</td>
                        <td className="py-2">{g.isSuppressed ? '[SUPPRESSED]' : `${g.biomassPrevalencePct}%`}</td>
                        <td className="py-2 font-mono">{g.ambientPm25Avg} µg/m³</td>
                        <td className="py-2">{g.isSuppressed ? '[SUPPRESSED]' : `${g.screeningEligibilityPct}%`}</td>
                        <td className="py-2 text-red-600 font-medium">{g.isSuppressed ? '[SUPPRESSED]' : `${g.urgentSymptomAlertPct}%`}</td>
                        <td className="py-2">
                          <Badge variant={g.coverageTier === 'robust' ? 'default' : g.coverageTier === 'moderate' ? 'secondary' : 'outline'} className="text-[10px]">
                            {g.coverageTier.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. Longitudinal Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">Longitudinal Population Trends (2025-2026)</h3>
            <p className="text-xs text-muted-foreground">
              Quarterly tracking of smoking prevalence, biomass usage, and platform intake growth
            </p>
          </div>

          <Card>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="border-b text-muted-foreground">
                    <tr>
                      <th className="py-2">Quarter</th>
                      <th className="py-2">Assessments (N)</th>
                      <th className="py-2">Current Smoking %</th>
                      <th className="py-2">Bidi Smoking %</th>
                      <th className="py-2">Biomass Fuel %</th>
                      <th className="py-2">Screening Eligible %</th>
                      <th className="py-2">Urgent Referral %</th>
                      <th className="py-2">Adoption Growth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {summary.longitudinalTrends.map((t) => (
                      <tr key={t.periodLabel}>
                        <td className="py-2 font-semibold">{t.periodLabel}</td>
                        <td className="py-2 font-mono">{t.totalAssessments.toLocaleString()}</td>
                        <td className="py-2 text-primary font-medium">{t.currentSmokerPct.toFixed(1)}%</td>
                        <td className="py-2">{t.bidiSmokerPct.toFixed(1)}%</td>
                        <td className="py-2">{t.biomassCookingPct.toFixed(1)}%</td>
                        <td className="py-2">{t.screeningEligiblePct.toFixed(1)}%</td>
                        <td className="py-2 text-red-600 font-medium">{t.urgentReferralPct.toFixed(1)}%</td>
                        <td className="py-2 text-emerald-600 font-semibold">+{t.platformAdoptionGrowthPct.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 5. Environmental Overlay Tab */}
      {activeTab === 'environmental' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">Environmental Particulate &amp; Respiratory Symptom Overlay</h3>
            <p className="text-xs text-muted-foreground">
              Cross-tabulation of Phase 2.7 ambient PM2.5 hotspots with recorded chronic respiratory symptoms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.environmentalCorrelations.map((e) => (
              <Card key={`${e.division}-${e.district}`} className="border">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-sm font-semibold">{e.district}</CardTitle>
                      <div className="text-[11px] text-muted-foreground">{e.division} Division</div>
                    </div>
                    <Badge variant={e.hotspotSeverity === 'extreme' ? 'destructive' : e.hotspotSeverity === 'high' ? 'warning' : 'secondary'} className="text-[10px]">
                      {e.hotspotSeverity.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ambient PM2.5 Annual Avg:</span>
                    <span className="font-semibold">{e.ambientPm25AnnualAvg} µg/m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Biomass Cooking:</span>
                    <span>{e.recordedBiomassPrevalencePct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chronic Cough/Bronchitis:</span>
                    <span className="font-semibold text-amber-600">{e.chronicRespiratorySymptomPct}%</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground pt-1 border-t">
                    {e.nonCausalNotice}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

