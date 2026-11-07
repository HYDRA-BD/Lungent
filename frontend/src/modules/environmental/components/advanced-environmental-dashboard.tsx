'use client'

import React, { useState, useTransition } from 'react'
import {
  Layers,
  Calendar,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Info,
  RefreshCw,
  Shield,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type {
  EnvironmentalContextSummary,
  HistoricalExposureSummaryReport,
  LongTermEnvironmentalTrendAnalysis,
  GeographicHotspotSummary,
  EnvironmentalRiskFactorDefinition,
} from '../types'
import type { MultiProviderComparisonResult } from '../providers/multi-provider-aggregator'
import {
  compareEnvironmentalProvidersAction,
  getHistoricalExposureSummaryAction,
  getLongTermTrendAnalysisAction,
  getBangladeshHotspotsAction,
  getEnvironmentalRiskFactorsAction,
} from '../actions'

interface AdvancedEnvironmentalDashboardProps {
  initialSummary: EnvironmentalContextSummary
  initialHistoricalReport?: HistoricalExposureSummaryReport
  initialTrendAnalysis?: LongTermEnvironmentalTrendAnalysis
  initialHotspots?: GeographicHotspotSummary[]
  initialRiskFactors?: EnvironmentalRiskFactorDefinition[]
  className?: string
}

export function AdvancedEnvironmentalDashboard({
  initialSummary,
  initialHistoricalReport,
  initialTrendAnalysis,
  initialHotspots = [],
  initialRiskFactors = [],
  className = '',
}: AdvancedEnvironmentalDashboardProps) {
  const [activeTab, setActiveTab] = useState<'providers' | 'historical' | 'trends' | 'hotspots' | 'risk_factors'>('providers')
  const [isPending, startTransition] = useTransition()

  // State
  const [summary] = useState<EnvironmentalContextSummary>(initialSummary)
  const [comparisonResult, setComparisonResult] = useState<MultiProviderComparisonResult | null>(null)
  const [historicalReport, setHistoricalReport] = useState<HistoricalExposureSummaryReport | undefined>(initialHistoricalReport)
  const [trendAnalysis, setTrendAnalysis] = useState<LongTermEnvironmentalTrendAnalysis | undefined>(initialTrendAnalysis)
  const [hotspots, setHotspots] = useState<GeographicHotspotSummary[]>(initialHotspots)
  const [riskFactors, setRiskFactors] = useState<EnvironmentalRiskFactorDefinition[]>(initialRiskFactors)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // Load Comparison
  const handleLoadComparison = () => {
    startTransition(async () => {
      setStatusMessage(null)
      const res = await compareEnvironmentalProvidersAction({
        division: summary.division,
        district: summary.district,
        upazila: summary.upazila || undefined,
      })
      if (res.success && res.data) {
        setComparisonResult(res.data)
        setStatusMessage('Multi-provider telemetry synchronized.')
      } else {
        setStatusMessage('Unable to complete multi-provider query.')
      }
    })
  }

  // Load Historical Summary
  const handleLoadHistorical = () => {
    startTransition(async () => {
      setStatusMessage(null)
      const res = await getHistoricalExposureSummaryAction({
        division: summary.division,
        district: summary.district,
        upazila: summary.upazila || undefined,
      })
      if (res.success && res.data) {
        setHistoricalReport(res.data)
      }
    })
  }

  // Load Trends
  const handleLoadTrends = () => {
    startTransition(async () => {
      setStatusMessage(null)
      const res = await getLongTermTrendAnalysisAction({
        division: summary.division,
        district: summary.district,
        upazila: summary.upazila || undefined,
      })
      if (res.success && res.data) {
        setTrendAnalysis(res.data)
      }
    })
  }

  // Load Hotspots
  const handleLoadHotspots = () => {
    startTransition(async () => {
      const res = await getBangladeshHotspotsAction()
      if (res.success && res.data) {
        setHotspots(res.data)
      }
    })
  }

  // Load Risk Factors
  const handleLoadRiskFactors = () => {
    startTransition(async () => {
      const res = await getEnvironmentalRiskFactorsAction()
      if (res.success && res.data) {
        setRiskFactors(res.data)
      }
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Clinical Non-Diagnostic Safety Alert */}
      <Alert variant="default" className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="font-semibold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
          Mandatory Clinical Safety Guardrail (Phase 2.7)
        </AlertTitle>
        <AlertDescription className="text-xs mt-1 leading-relaxed">
          Ambient air quality and historical environmental trends provide macro-environmental context. They do <strong>NOT</strong> quantify an individual patient&apos;s cumulative biological dose, diagnose respiratory malignancy, alter clinical risk estimation, or override urgent symptom triage.
        </AlertDescription>
      </Alert>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <Button
          size="sm"
          variant={activeTab === 'providers' ? 'default' : 'outline'}
          onClick={() => setActiveTab('providers')}
          className="gap-2"
        >
          <Layers className="h-4 w-4" />
          Multi-Provider Comparison
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'historical' ? 'default' : 'outline'}
          onClick={() => {
            setActiveTab('historical')
            if (!historicalReport) handleLoadHistorical()
          }}
          className="gap-2"
        >
          <Calendar className="h-4 w-4" />
          Historical Exposure (2021-2026)
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'trends' ? 'default' : 'outline'}
          onClick={() => {
            setActiveTab('trends')
            if (!trendAnalysis) handleLoadTrends()
          }}
          className="gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Long-Term Trends
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'hotspots' ? 'default' : 'outline'}
          onClick={() => {
            setActiveTab('hotspots')
            if (hotspots.length === 0) handleLoadHotspots()
          }}
          className="gap-2"
        >
          <MapPin className="h-4 w-4" />
          Regional Hotspots
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'risk_factors' ? 'default' : 'outline'}
          onClick={() => {
            setActiveTab('risk_factors')
            if (riskFactors.length === 0) handleLoadRiskFactors()
          }}
          className="gap-2"
        >
          <Shield className="h-4 w-4" />
          Environmental Risk Factors (IARC)
        </Button>
      </div>

      {statusMessage && (
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-primary" />
          {statusMessage}
        </div>
      )}

      {/* 1. Multi-Provider Comparison Tab */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold">Real-Time Multi-Provider Telemetry</h3>
              <p className="text-xs text-muted-foreground">
                Location: {summary.district}, {summary.division}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleLoadComparison} disabled={isPending} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
              Synchronize All Providers
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Open-Meteo */}
            <Card className="border border-border/80">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="text-[10px]">Model &amp; Forecast</Badge>
                  <Badge variant="secondary" className="text-[10px]">CAMS / NOAA</Badge>
                </div>
                <CardTitle className="text-sm font-semibold mt-2">Open-Meteo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">PM2.5:</span>{' '}
                  <span className="font-semibold">{summary.pollutants.pm25?.value || 'N/A'} µg/m³</span>
                </div>
                <div>
                  <span className="text-muted-foreground">US AQI:</span>{' '}
                  <span className="font-semibold">{summary.aqi.value}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Resolution:</span>{' '}
                  <span>11km Assimilation Grid</span>
                </div>
              </CardContent>
            </Card>

            {/* US Embassy Dhaka */}
            <Card className="border border-border/80">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="default" className="text-[10px] bg-emerald-600">Gold Standard</Badge>
                  <Badge variant="outline" className="text-[10px]">FEM BAM-1020</Badge>
                </div>
                <CardTitle className="text-sm font-semibold mt-2">U.S. Embassy Ground Station</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Method:</span>{' '}
                  <span className="font-semibold">Beta Attenuation Monitor</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Station:</span>{' '}
                  <span>Madani Ave, Baridhara, Dhaka</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{' '}
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Direct In-Situ</span>
                </div>
              </CardContent>
            </Card>

            {/* Copernicus Satellite Reanalysis */}
            <Card className="border border-border/80">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="text-[10px]">Reanalysis</Badge>
                  <Badge variant="outline" className="text-[10px]">ERA5 / EAC4</Badge>
                </div>
                <CardTitle className="text-sm font-semibold mt-2">Copernicus Reanalysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Sensors:</span>{' '}
                  <span>Sentinel-5P, MODIS, VIIRS</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Historical Depth:</span>{' '}
                  <span className="font-semibold">2021-2026 Continuous</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Coverage:</span>{' '}
                  <span>All 64 Bangladesh Districts</span>
                </div>
              </CardContent>
            </Card>

            {/* Bangladesh DoE CASE Network */}
            <Card className="border border-border/80">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="text-[10px]">Governmental</Badge>
                  <Badge variant="secondary" className="text-[10px]">DoE Network</Badge>
                </div>
                <CardTitle className="text-sm font-semibold mt-2">Bangladesh DoE CASE</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Network:</span>{' '}
                  <span>CAMS 1-11 Municipal Stations</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Authority:</span>{' '}
                  <span>Ministry of Environment</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Standards:</span>{' '}
                  <span>NAAQS Bangladesh 2022</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {comparisonResult && (
            <Card className="bg-muted/40">
              <CardContent className="pt-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Composite Multi-Provider Average:</span>
                  <span className="font-bold text-sm">{comparisonResult.compositeAveragePm25} µg/m³ (AQI {comparisonResult.compositeAverageAqi})</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Max Inter-Provider Variance:</span>
                  <span>{comparisonResult.maxPm25Variance} µg/m³</span>
                </div>
                {comparisonResult.isHighDiscordance && (
                  <div className="text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1.5 mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    High multi-provider discordance detected. Ground sensor takes precedence.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 2. Historical Exposure Tab */}
      {activeTab === 'historical' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold">Multi-Year Historical Exposure Summary (2021-2026)</h3>
              <p className="text-xs text-muted-foreground">
                Historical Reanalysis for {summary.district}, {summary.division}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleLoadHistorical} disabled={isPending} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
              Refresh Snapshots
            </Button>
          </div>

          {historicalReport ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-primary">{historicalReport.baselineAverages.avgPm25} µg/m³</div>
                    <div className="text-xs text-muted-foreground mt-1">5-Year Baseline Average PM2.5</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">{historicalReport.elevatedExposureDaysCount}</div>
                    <div className="text-xs text-muted-foreground mt-1">Elevated Days (PM2.5 &gt; 150)</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600">{(historicalReport.periodCoverage.dataCompletenessRatio * 100).toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground mt-1">Data Completeness Ratio</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold">{historicalReport.baselineAverages.maxRecordedPm25} µg/m³</div>
                    <div className="text-xs text-muted-foreground mt-1">Peak Historical Reading</div>
                  </CardContent>
                </Card>
              </div>

              {/* Seasonal Profiles */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Bangladesh Climatic Seasonal Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-950/20">
                      <div className="font-semibold text-red-800 dark:text-red-300">Winter Dry Season (Nov - Feb)</div>
                      <div className="text-lg font-bold mt-1">{historicalReport.seasonalProfiles.winter_dry?.avgPm25 || 'N/A'} µg/m³</div>
                      <div className="text-muted-foreground mt-1">Thermal inversion peak; heavy brick kiln combustion</div>
                    </div>
                    <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                      <div className="font-semibold text-amber-800 dark:text-amber-300">Pre-Monsoon Season (Mar - May)</div>
                      <div className="text-lg font-bold mt-1">{historicalReport.seasonalProfiles.pre_monsoon?.avgPm25 || 'N/A'} µg/m³</div>
                      <div className="text-muted-foreground mt-1">Dust storms (Kalbaishakhi) and road resuspension</div>
                    </div>
                    <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
                      <div className="font-semibold text-emerald-800 dark:text-emerald-300">Monsoon Season (Jun - Oct)</div>
                      <div className="text-lg font-bold mt-1">{historicalReport.seasonalProfiles.monsoon?.avgPm25 || 'N/A'} µg/m³</div>
                      <div className="text-muted-foreground mt-1">Heavy precipitation atmospheric washout</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground">
              Click &apos;Refresh Snapshots&apos; to load multi-year historical data.
            </div>
          )}
        </div>
      )}

      {/* 3. Long-Term Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold">Long-Term Longitudinal Trends</h3>
              <p className="text-xs text-muted-foreground">
                OLS &amp; Theil-Sen Seasonal Decomposition (2021-2026)
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleLoadTrends} disabled={isPending} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
              Recompute Trends
            </Button>
          </div>

          {trendAnalysis ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4 text-xs space-y-1">
                    <span className="text-muted-foreground">Trend Direction:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={trendAnalysis.trendDirection === 'increasing' ? 'destructive' : trendAnalysis.trendDirection === 'decreasing' ? 'success' : 'secondary'}>
                        {trendAnalysis.trendDirection.toUpperCase()}
                      </Badge>
                      <span className="font-semibold">{trendAnalysis.annualDeltaPm25PerYear} µg/m³/year</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-xs space-y-1">
                    <span className="text-muted-foreground">Overall 5-Year Change:</span>
                    <div className="text-lg font-bold mt-1">
                      {trendAnalysis.overallPercentageChange > 0 ? `+${trendAnalysis.overallPercentageChange}%` : `${trendAnalysis.overallPercentageChange}%`}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-xs space-y-1">
                    <span className="text-muted-foreground">Average Seasonal Amplitude:</span>
                    <div className="text-lg font-bold mt-1">
                      {trendAnalysis.seasonalAmplitudeAvg} µg/m³
                    </div>
                    <div className="text-[10px] text-muted-foreground">Winter peak vs. Monsoon trough delta</div>
                  </CardContent>
                </Card>
              </div>

              {/* Annual Series Table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">5-Year Historical Series</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="border-b text-muted-foreground">
                        <tr>
                          <th className="py-2">Year</th>
                          <th className="py-2">Annual Avg PM2.5</th>
                          <th className="py-2">Winter Peak</th>
                          <th className="py-2">Monsoon Trough</th>
                          <th className="py-2">Annual AQI</th>
                          <th className="py-2">Completeness</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {trendAnalysis.yearlySeries.map((s) => (
                          <tr key={s.year}>
                            <td className="py-2 font-medium">{s.year}</td>
                            <td className="py-2 font-semibold text-primary">{s.annualAvgPm25} µg/m³</td>
                            <td className="py-2 text-red-600">{s.winterAvgPm25} µg/m³</td>
                            <td className="py-2 text-emerald-600">{s.monsoonAvgPm25} µg/m³</td>
                            <td className="py-2">{s.annualAvgAqi}</td>
                            <td className="py-2">{(s.completenessRatio * 100).toFixed(0)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground">
              Click &apos;Recompute Trends&apos; to load trend analytics.
            </div>
          )}
        </div>
      )}

      {/* 4. Regional Hotspots Tab */}
      {activeTab === 'hotspots' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold">Bangladesh Environmental Hotspots</h3>
              <p className="text-xs text-muted-foreground">
                Curated Regional Severity Tiers &amp; Primary Emission Profiles
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleLoadHotspots} disabled={isPending} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
              Refresh Hotspots
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotspots.map((h) => (
              <Card key={`${h.division}-${h.district}`} className="border">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-sm font-semibold">{h.district}</CardTitle>
                      <div className="text-[11px] text-muted-foreground">{h.division} Division</div>
                    </div>
                    <Badge variant={h.hotspotSeverityTier === 'extreme' ? 'destructive' : h.hotspotSeverityTier === 'high' ? 'warning' : 'secondary'} className="text-[10px]">
                      {h.hotspotSeverityTier.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Baseline:</span>
                    <span className="font-semibold">{h.annualAvgPm25} µg/m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dry Season Peak:</span>
                    <span className="font-bold text-red-600">{h.peakSeasonAvgPm25} µg/m³</span>
                  </div>
                  <div className="text-muted-foreground text-[11px] pt-1 border-t">
                    <div className="font-medium text-foreground mb-1">Key Factors:</div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {h.primaryContributingFactors.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 5. Environmental Risk Factors Tab */}
      {activeTab === 'risk_factors' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold">Curated Environmental Risk Factors</h3>
              <p className="text-xs text-muted-foreground">
                International Agency for Research on Cancer (IARC) Carcinogenicity Evidence
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleLoadRiskFactors} disabled={isPending} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
              Reload Factors
            </Button>
          </div>

          <div className="space-y-3">
            {riskFactors.map((rf) => (
              <Card key={rf.profileCode} className="border">
                <CardContent className="pt-4 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-sm">{rf.titleEn}</span>
                      <span className="text-muted-foreground ml-2">({rf.titleBn})</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary">
                      {rf.iarcClassification}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Biological Mechanism:</strong> {rf.biologicalMechanism}
                  </p>
                  <div className="text-[11px] text-muted-foreground pt-1 flex justify-between border-t border-border/50">
                    <span><strong>Methodology:</strong> {rf.measurementMethodology}</span>
                    <span className="italic">{rf.scientificReference}</span>
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
