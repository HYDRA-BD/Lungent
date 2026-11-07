'use client'

import React, { useState, useTransition } from 'react'
import {
  BarChart3,
  TrendingUp,
  Building2,
  MapPin,
  Download,
  AlertTriangle,
  Award,
  FileSpreadsheet,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type {
  FacilityBenchmarkComparison,
  OperationalForecastResult,
  InstitutionalReportRecord,
  GeographicOperationalSummary,
  FacilityTier,
} from '../types'
import {
  benchmarkFacilitiesAction,
  generateOperationalForecastAction,
  exportCustomReportAction,
} from '../actions'

interface OperationalIntelligenceDashboardProps {
  initialReport: InstitutionalReportRecord
  initialBenchmarks: FacilityBenchmarkComparison
  initialForecast: OperationalForecastResult
  initialGeographicSummaries: GeographicOperationalSummary[]
  className?: string
}

export function OperationalIntelligenceDashboard({
  initialReport,
  initialBenchmarks,
  initialForecast,
  initialGeographicSummaries,
  className = '',
}: OperationalIntelligenceDashboardProps) {
  const [report] = useState<InstitutionalReportRecord>(initialReport)
  const [benchmarks, setBenchmarks] = useState<FacilityBenchmarkComparison>(initialBenchmarks)
  const [forecast, setForecast] = useState<OperationalForecastResult>(initialForecast)
  const [geographicSummaries] = useState<GeographicOperationalSummary[]>(initialGeographicSummaries)
  const [activeTab, setActiveTab] = useState<'benchmarking' | 'forecasting' | 'geographic' | 'custom_export'>('benchmarking')
  const [selectedTier, setSelectedTier] = useState<FacilityTier>('district_hospital')
  const [forecastHorizon, setForecastHorizon] = useState<number>(14)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleBenchmarkTierChange = (tier: FacilityTier) => {
    setSelectedTier(tier)
    startTransition(async () => {
      // Re-benchmark against the selected tier
      const rawCohort = report.utilizationSummaries.map(u => ({
        facilityId: u.facilityId,
        facilityName: u.facilityName,
        facilityTier: u.facilityTier,
        division: u.division,
        assessmentsInitiated: Math.round(u.totalAssessmentsConducted * 1.1),
        assessmentsCompleted: u.totalAssessmentsConducted,
        meanProcessingTimeHours: 18.5,
        meanReviewTurnaroundHours: u.meanReviewTurnaroundHours,
        referralsInitiated: u.referralsInitiated,
        referralsCompleted: u.referralsCompleted,
        activeWorkersCount: u.activeHealthcareWorkers,
        dataCompletenessPct: u.dataCompletenessPct,
      }))

      const res = await benchmarkFacilitiesAction(rawCohort, tier)
      if (res.success && res.data) {
        setBenchmarks(res.data)
        setStatusMessage(`Peer benchmark updated for tier: ${tier.replace(/_/g, ' ')}.`)
      }
    })
  }

  const handleForecastHorizonChange = (days: number) => {
    setForecastHorizon(days)
    startTransition(async () => {
      const mockHistory = [
        { date: '2026-10-01', value: 45 },
        { date: '2026-10-05', value: 52 },
        { date: '2026-10-10', value: 58 },
        { date: '2026-10-15', value: 64 },
        { date: '2026-10-20', value: 71 },
        { date: '2026-10-25', value: 78 },
        { date: '2026-10-30', value: 85 },
      ]

      const res = await generateOperationalForecastAction(mockHistory, {
        targetMetric: 'assessment_volume',
        forecastHorizonDays: days,
        operationalCapacityLimit: 90,
      })

      if (res.success && res.data) {
        setForecast(res.data)
        setStatusMessage(`Forecast recalculated for ${days}-day horizon with error bounds.`)
      }
    })
  }

  const handleExportCSV = () => {
    startTransition(async () => {
      const res = await exportCustomReportAction(
        {
          title: report.title,
          reportCategory: 'facility_utilization',
          selectedMetrics: ['assessments', 'turnaround', 'referrals', 'data_quality'],
          startDate: report.reportingPeriodStart,
          endDate: report.reportingPeriodEnd,
          exportFormat: 'csv',
          includeBilingualLabels: true,
        },
        report.utilizationSummaries
      )

      if (res.success && res.data) {
        const blob = new Blob([res.data.content], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', res.data.fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setStatusMessage(`CSV report successfully generated & downloaded (${res.data.fileName}). SHA-256: ${res.data.sha256Digest.substring(0, 16)}...`)
      } else {
        setStatusMessage('Failed to export CSV report.')
      }
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Clinical Governance & Operational Intelligence Notice */}
      <Alert variant="default" className="border-indigo-200 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100">
        <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <AlertTitle className="font-semibold text-xs uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
          Operational Intelligence &amp; Non-Diagnostic Invariant Notice (Phase 2.10)
        </AlertTitle>
        <AlertDescription className="text-xs mt-1 leading-relaxed space-y-1">
          <p>
            <strong>English:</strong> Institutional benchmarking and predictive operational forecasts are designed strictly for administrative planning, healthcare worker staffing, and facility resource allocation. They do <em>NOT</em> evaluate clinician competence, nor do they influence individual patient triage, cancer risk estimation, or screening eligibility.
          </p>
          <p className="text-[11px] text-indigo-800 dark:text-indigo-300">
            <strong>বাংলা (Bengali):</strong> প্রাতিষ্ঠানিক নির্দেশনা: স্বাস্থ্যসেবা কেন্দ্রের কার্যক্ষমতা মূল্যায়ন ও ভবিষ্যৎ কর্মপ্রবাহের পূর্বাভাস কেবল প্রশাসনিক পরিকল্পনা এবং সম্পদ ব্যবস্থাপনার জন্য তৈরি। এগুলো কোনো একক চিকিৎসকের মূল্যায়ন বা রোগীর ক্লিনিক্যাল স্ক্রিনিং ও ঝুঁকি নির্ণয়ে সরাসরি প্রভাব ফেলবে না।
          </p>
        </AlertDescription>
      </Alert>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab('benchmarking')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'benchmarking'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Award className="h-4 w-4" />
          Facility Benchmarking
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('forecasting')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'forecasting'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Predictive Analytics &amp; Bottlenecks
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('geographic')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'geographic'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MapPin className="h-4 w-4" />
          Geographic Intelligence
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('custom_export')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'custom_export'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Download className="h-4 w-4" />
          Custom Report Export
        </button>
      </div>

      {statusMessage && (
        <Alert variant="default" className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs">{statusMessage}</AlertDescription>
        </Alert>
      )}

      {/* Tab 1: Facility Benchmarking */}
      {activeTab === 'benchmarking' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-lg">
            <div className="text-xs">
              <span className="font-semibold block text-sm">Tier-Normalized Operational Comparison</span>
              <span className="text-muted-foreground">
                Comparing facilities within the same structural tier to avoid volume bias.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Filter Peer Tier:</span>
              <select
                value={selectedTier}
                onChange={e => handleBenchmarkTierChange(e.target.value as FacilityTier)}
                className="text-xs border rounded p-1.5 bg-background font-medium"
              >
                <option value="national_specialized">National Specialized</option>
                <option value="tertiary_medical_college">Tertiary Medical College</option>
                <option value="district_hospital">District Hospital</option>
                <option value="upazila_health_complex">Upazila Health Complex</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-4 text-center">
                <span className="text-xs text-muted-foreground">Tier Avg Completion</span>
                <p className="text-xl font-bold font-mono text-emerald-600">
                  {(benchmarks.tierAverageCompletionRate * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <span className="text-xs text-muted-foreground">Tier Avg Turnaround</span>
                <p className="text-xl font-bold font-mono">
                  {benchmarks.tierAverageTurnaroundHours} hrs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <span className="text-xs text-muted-foreground">Tier Avg Referral Res.</span>
                <p className="text-xl font-bold font-mono text-cyan-600">
                  {(benchmarks.tierAverageReferralRate * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <span className="text-xs text-muted-foreground">Tier Composite Index</span>
                <p className="text-xl font-bold font-mono text-indigo-600">
                  {benchmarks.tierAverageOperationalIndex} / 100
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Facility Peer Performance Ranks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 px-3">Rank</th>
                      <th className="py-2 px-3">Facility</th>
                      <th className="py-2 px-3">Division</th>
                      <th className="py-2 px-3 text-right">Completion Rate</th>
                      <th className="py-2 px-3 text-right">Review Turnaround</th>
                      <th className="py-2 px-3 text-right">Referral Res.</th>
                      <th className="py-2 px-3 text-right">Data Quality</th>
                      <th className="py-2 px-3 text-right">Composite Score</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benchmarks.facilities.map(f => (
                      <tr key={f.facilityId} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-3 font-mono font-bold">#{f.relativeRankInTier}</td>
                        <td className="py-2 px-3 font-semibold">{f.facilityName}</td>
                        <td className="py-2 px-3 text-muted-foreground">{f.division}</td>
                        <td className="py-2 px-3 text-right font-mono">
                          {(f.assessmentCompletionRate * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 text-right font-mono">{f.meanReviewTurnaroundHours}h</td>
                        <td className="py-2 px-3 text-right font-mono">
                          {(f.referralCompletionRate * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 text-right font-mono">{f.dataCompletenessPct}%</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-primary">
                          {f.compositeOperationalIndex}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <Badge
                            variant={
                              f.operationalStatus === 'high_performing'
                                ? 'default'
                                : f.operationalStatus === 'nominal'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                            className="text-[10px]"
                          >
                            {f.operationalStatus.replace(/_/g, ' ')}
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

      {/* Tab 2: Predictive Operational Analytics */}
      {activeTab === 'forecasting' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-lg">
            <div>
              <span className="font-semibold block text-sm">Predictive Time-Series Operational Analytics</span>
              <span className="text-xs text-muted-foreground">
                Model: Holt-Winters Exponential Smoothing with 95% Confidence Bounds.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Forecast Horizon:</span>
              <select
                value={forecastHorizon}
                onChange={e => handleForecastHorizonChange(Number(e.target.value))}
                className="text-xs border rounded p-1.5 bg-background font-medium"
              >
                <option value={7}>7 Days Ahead</option>
                <option value={14}>14 Days Ahead</option>
                <option value={30}>30 Days Ahead</option>
              </select>
            </div>
          </div>

          {forecast.capacityBottleneckDetected && forecast.bottleneckDetails && (
            <Alert variant="destructive" className="border-rose-300 bg-rose-50 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <AlertTitle className="text-xs font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                Impending Capacity Bottleneck Detected
              </AlertTitle>
              <AlertDescription className="text-xs mt-1 leading-relaxed">
                Projected peak volume of <strong>{forecast.bottleneckDetails.projectedPeakValue} assessments</strong> on{' '}
                <strong>{forecast.bottleneckDetails.projectedPeakDate}</strong> exceeds operational limit (
                {forecast.bottleneckDetails.operationalCapacityLimit}) by{' '}
                <strong>+{forecast.bottleneckDetails.excessCapacityPct}%</strong>.
                <p className="mt-1 font-medium text-rose-900 dark:text-rose-200">
                  Recommended Action: {forecast.bottleneckDetails.recommendedMitigation}
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-4 text-center">
                <span className="text-xs text-muted-foreground">Mean Absolute Error (MAE)</span>
                <p className="text-xl font-bold font-mono">{forecast.errorMetrics.meanAbsoluteError}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <span className="text-xs text-muted-foreground">Root Mean Sq Error (RMSE)</span>
                <p className="text-xl font-bold font-mono">{forecast.errorMetrics.rootMeanSquaredError}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <span className="text-xs text-muted-foreground">Mean Abs Pct Error (MAPE)</span>
                <p className="text-xl font-bold font-mono">{forecast.errorMetrics.meanAbsolutePercentageError}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Projected Daily Workload Timeline ({forecast.forecastPoints.length} Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3 text-right">Projected Volume</th>
                      <th className="py-2 px-3 text-right">Lower Bound (95%)</th>
                      <th className="py-2 px-3 text-right">Upper Bound (95%)</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.forecastPoints.map(p => {
                      const isHigh = p.projectedValue > 90
                      return (
                        <tr key={p.date} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 px-3 font-mono">{p.date}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{p.projectedValue}</td>
                          <td className="py-2 px-3 text-right font-mono text-muted-foreground">{p.lowerBound95}</td>
                          <td className="py-2 px-3 text-right font-mono text-muted-foreground">{p.upperBound95}</td>
                          <td className="py-2 px-3 text-center">
                            <Badge variant={isHigh ? 'destructive' : 'outline'} className="text-[10px]">
                              {isHigh ? 'High Strain' : 'Normal'}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Geographic Intelligence */}
      {activeTab === 'geographic' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Bangladesh Geographic Intelligence &amp; Healthcare Accessibility
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Regional assessment activity, screening eligibility rates, and ambient PM2.5 environmental context across 8 administrative divisions.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 px-3">Division</th>
                    <th className="py-2 px-3 text-right">Districts</th>
                    <th className="py-2 px-3 text-right">Registered Patients</th>
                    <th className="py-2 px-3 text-right">Assessments</th>
                    <th className="py-2 px-3 text-right">Facilities</th>
                    <th className="py-2 px-3 text-right">Mean PM2.5</th>
                    <th className="py-2 px-3 text-right">Eligibility Rate</th>
                    <th className="py-2 px-3 text-right">Referral Res.</th>
                  </tr>
                </thead>
                <tbody>
                  {geographicSummaries.map(g => (
                    <tr key={g.division} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-3 font-semibold">
                        {g.division} <span className="font-normal text-muted-foreground">({g.divisionBn})</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono">{g.districtCount}</td>
                      <td className="py-2 px-3 text-right font-mono font-medium">
                        {g.isSuppressedForPrivacy ? '< 5' : g.totalRegisteredPatients.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {g.isSuppressedForPrivacy ? '< 5' : g.totalAssessments.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">{g.activeFacilities}</td>
                      <td className="py-2 px-3 text-right font-mono text-amber-600 font-medium">
                        {g.meanPm25Exposure} µg/m³
                      </td>
                      <td className="py-2 px-3 text-right font-mono">{g.screeningEligibilityRatePct}%</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-600 font-medium">
                        {g.referralResolutionRatePct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Custom Report Export */}
      {activeTab === 'custom_export' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              Custom Report Generator &amp; Exporter
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Generate audited, cryptographic institutional reports in standardized CSV or print-ready format.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/40 p-4 rounded-lg space-y-3">
              <div className="text-xs space-y-1">
                <span className="font-semibold block text-sm">{report.title}</span>
                <span className="text-muted-foreground block">
                  Reference: <code className="font-mono">{report.reportReference}</code>
                </span>
                <span className="text-muted-foreground block">
                  Included Facilities: <strong>{report.utilizationSummaries.length}</strong> | Period:{' '}
                  <strong>{report.reportingPeriodStart} to {report.reportingPeriodEnd}</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs"
                  disabled={isPending}
                  onClick={handleExportCSV}
                >
                  <Download className={`h-3.5 w-3.5 mr-1.5 ${isPending ? 'animate-spin' : ''}`} />
                  Download CSV Dataset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
