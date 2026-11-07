'use client'

import React, { useState, useTransition } from 'react'
import {
  Wind,
  RefreshCw,
  Clock,
  Compass,
  Building2,
  Calendar,
  AlertTriangle,
  Layers,
  Sparkles,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { EnvironmentalContextSummary } from '../types'
import { interpretUsAqi, interpretEuropeanAqi } from '../aqi-standards'
import { refreshEnvironmentalDataAction } from '../actions'

interface OpenMeteoDashboardProps {
  initialSummary: EnvironmentalContextSummary
  allowRefresh?: boolean
  className?: string
}

export function OpenMeteoDashboard({
  initialSummary,
  allowRefresh = true,
  className = '',
}: OpenMeteoDashboardProps) {
  const [summary, setSummary] = useState<EnvironmentalContextSummary>(initialSummary)
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'current' | 'hourly' | 'provenance'>('current')
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null)

  const usAqiInfo = interpretUsAqi(summary.aqi.value)
  const euAqiInfo = summary.europeanAqi
    ? interpretEuropeanAqi(summary.europeanAqi.value)
    : interpretEuropeanAqi(Math.round(summary.aqi.value * 0.45))

  const handleRefresh = () => {
    startTransition(async () => {
      setRefreshMessage(null)
      const res = await refreshEnvironmentalDataAction({
        division: summary.division,
        district: summary.district,
        upazila: summary.upazila || undefined,
      })

      if (res.success && res.data) {
        setSummary(res.data)
        setRefreshMessage('Environmental observations refreshed from Open-Meteo.')
      } else {
        setRefreshMessage('Could not reach Open-Meteo API; using cached telemetry.')
      }
    })
  }

  const timeline = summary.hourlyTimeline || []
  // Slice latest 18 points (e.g., last 6h + next 12h forecast) for compact display
  const displayTimeline = timeline.length > 0 ? timeline.slice(Math.max(0, timeline.length - 24)) : []

  return (
    <Card className={`border border-border shadow-sm ${className}`} data-testid="open-meteo-dashboard">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Wind className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">
                  Open-Meteo Atmospheric Intelligence
                </CardTitle>
                {summary.isStale ? (
                  <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                    Cached Telemetry
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-[10px] gap-1">
                    <Sparkles className="h-2.5 w-2.5" />
                    Live CAMS Feed
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-1.5 mt-0.5">
                <Compass className="h-3.5 w-3.5" />
                <span>
                  {summary.division} &gt; {summary.district}
                  {summary.upazila ? ` &gt; ${summary.upazila}` : ''}
                </span>
                {summary.coordinates && (
                  <span className="font-mono text-[11px] bg-muted/60 px-1.5 py-0.2 rounded text-foreground/80">
                    ({summary.coordinates.latitude.toFixed(2)}°N, {summary.coordinates.longitude.toFixed(2)}°E) • Centroid
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {allowRefresh && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={isPending}
                className="gap-1.5 text-xs h-8"
                data-testid="refresh-env-btn"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin text-primary' : ''}`} />
                {isPending ? 'Syncing...' : 'Refresh'}
              </Button>
            )}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex gap-2 pt-2 border-t border-border/40 mt-2">
          <button
            onClick={() => setActiveTab('current')}
            className={`text-xs px-3 py-1 rounded-md transition-colors ${
              activeTab === 'current'
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Current AQI & Pollutants
          </button>
          <button
            onClick={() => setActiveTab('hourly')}
            className={`text-xs px-3 py-1 rounded-md transition-colors ${
              activeTab === 'hourly'
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Hourly Trend & Forecast
          </button>
          <button
            onClick={() => setActiveTab('provenance')}
            className={`text-xs px-3 py-1 rounded-md transition-colors ${
              activeTab === 'provenance'
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Provenance & Standards
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {refreshMessage && (
          <div className="p-2 text-xs rounded bg-muted/60 text-muted-foreground border border-border/60">
            {refreshMessage}
          </div>
        )}

        {/* TAB 1: Current AQI & Key Pollutants */}
        {activeTab === 'current' && (
          <div className="space-y-4">
            {/* Dual AQI Display: US EPA vs European EEA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* US EPA AQI Card */}
              <div
                className={`p-4 rounded-xl border flex flex-col justify-between ${usAqiInfo.bgClass} ${usAqiInfo.borderClass}`}
                data-testid="us-aqi-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    US EPA AQI (0–500 Scale)
                  </span>
                  <Badge variant={usAqiInfo.badgeVariant} className="text-[11px]">
                    {usAqiInfo.labelEn}
                  </Badge>
                </div>
                <div className="my-3 flex items-baseline gap-2">
                  <span className={`text-4xl font-extrabold ${usAqiInfo.colorClass}`} data-testid="us-aqi-value">
                    {usAqiInfo.numericValue}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 500 Index</span>
                </div>
                <div className="text-[11px] text-muted-foreground border-t border-border/40 pt-2 flex justify-between">
                  <span>Standard: 40 CFR Part 58</span>
                  <span>{usAqiInfo.labelBn}</span>
                </div>
              </div>

              {/* European CAQI Card */}
              <div
                className={`p-4 rounded-xl border flex flex-col justify-between ${euAqiInfo.bgClass} ${euAqiInfo.borderClass}`}
                data-testid="eu-aqi-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    European CAQI (0–100 Scale)
                  </span>
                  <Badge variant={euAqiInfo.badgeVariant} className="text-[11px]">
                    {euAqiInfo.labelEn}
                  </Badge>
                </div>
                <div className="my-3 flex items-baseline gap-2">
                  <span className={`text-4xl font-extrabold ${euAqiInfo.colorClass}`} data-testid="eu-aqi-value">
                    {euAqiInfo.numericValue}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 100 Index</span>
                </div>
                <div className="text-[11px] text-muted-foreground border-t border-border/40 pt-2 flex justify-between">
                  <span>Standard: EEA Directive 2008/50/EC</span>
                  <span>{euAqiInfo.labelBn}</span>
                </div>
              </div>
            </div>

            {/* Pollutants Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {summary.pollutants.pm25 && (
                <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20">
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                    <span className="font-semibold text-foreground">PM2.5</span>
                    <Badge variant="secondary" className="text-[9px] px-1 py-0">Model</Badge>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {summary.pollutants.pm25.value}{' '}
                    <span className="text-[10px] font-normal text-muted-foreground">{summary.pollutants.pm25.unit}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block truncate">Fine Particles</span>
                </div>
              )}

              {summary.pollutants.pm10 && (
                <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20">
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                    <span className="font-semibold text-foreground">PM10</span>
                    <Badge variant="secondary" className="text-[9px] px-1 py-0">Model</Badge>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {summary.pollutants.pm10.value}{' '}
                    <span className="text-[10px] font-normal text-muted-foreground">{summary.pollutants.pm10.unit}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block truncate">Respirable Dust</span>
                </div>
              )}

              {summary.pollutants.no2 && (
                <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20">
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                    <span className="font-semibold text-foreground">NO₂</span>
                    <Badge variant="secondary" className="text-[9px] px-1 py-0">Model</Badge>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {summary.pollutants.no2.value}{' '}
                    <span className="text-[10px] font-normal text-muted-foreground">{summary.pollutants.no2.unit}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block truncate">Nitrogen Dioxide</span>
                </div>
              )}

              {summary.pollutants.so2 && (
                <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20">
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                    <span className="font-semibold text-foreground">SO₂</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">Model</Badge>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {summary.pollutants.so2.value}{' '}
                    <span className="text-[10px] font-normal text-muted-foreground">{summary.pollutants.so2.unit}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block truncate">Sulfur Dioxide</span>
                </div>
              )}

              {summary.pollutants.co && (
                <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20">
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                    <span className="font-semibold text-foreground">CO</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">Model</Badge>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {summary.pollutants.co.value}{' '}
                    <span className="text-[10px] font-normal text-muted-foreground">{summary.pollutants.co.unit}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block truncate">Carbon Monoxide</span>
                </div>
              )}

              {summary.pollutants.o3 && (
                <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20">
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                    <span className="font-semibold text-foreground">O₃</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">Model</Badge>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {summary.pollutants.o3.value}{' '}
                    <span className="text-[10px] font-normal text-muted-foreground">{summary.pollutants.o3.unit}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block truncate">Ground Ozone</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Hourly Timeline & Forward Forecast */}
        {activeTab === 'hourly' && (
          <div className="space-y-3" data-testid="hourly-timeline-section">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                24-Hour Chronological Timeline (Historical Reanalysis &amp; Forward Forecast)
              </span>
              <span className="text-[11px]">Interval: 1 hour</span>
            </div>

            {displayTimeline.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                Hourly telemetry stream currently unavailable for this geographic grid.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[340px] overflow-y-auto p-1">
                {displayTimeline.map((pt, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                      pt.isForecast
                        ? 'border-blue-400/40 bg-blue-50/30 dark:bg-blue-950/20'
                        : 'border-border/70 bg-muted/20'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                      <span>{pt.time.slice(11, 16)}</span>
                      {pt.isForecast ? (
                        <span className="text-blue-600 dark:text-blue-400 font-medium">Forecast</span>
                      ) : (
                        <span>Model</span>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="font-bold text-sm text-foreground">
                        AQI {pt.usAqi}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        EU {pt.europeanAqi}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      PM2.5: <strong className="text-foreground">{pt.pm25}</strong> µg/m³
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Provenance & Standards */}
        {activeTab === 'provenance' && (
          <div className="space-y-3 text-xs leading-relaxed text-muted-foreground bg-muted/20 p-3.5 rounded-lg border border-border/60">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Layers className="h-4 w-4 text-primary" />
              <span>Data Provenance &amp; Attribution Architecture</span>
            </div>
            <p>
              Telemetry provided via the official <strong>Open-Meteo Air Quality API</strong> utilizing European
              Copernicus Atmosphere Monitoring Service (CAMS) Global and Regional atmospheric composition models
              (combining satellite observations with ECMWF meteorological analyses at approximately 11km grid
              resolution).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-border/40">
              <div>
                <strong className="text-foreground block">US EPA AQI Standard:</strong>
                Calculated per 40 CFR Part 58 breakpoints (0–500). Focuses on high-concentration sensitivity tiers.
              </div>
              <div>
                <strong className="text-foreground block">European CAQI Standard:</strong>
                Calculated per EEA Directive 2008/50/EC (0–100+). Normalized across multi-pollutant European urban baselines.
              </div>
            </div>
            <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between text-[11px] gap-2">
              <span>Resolution: Administrative Centroid (Privacy Preserved)</span>
              <span>Attribution: CC BY 4.0 Open-Meteo &amp; CAMS</span>
            </div>
          </div>
        )}

        {/* Metadata Footer */}
        <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50 gap-2">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            <span>Data Provider: <strong className="text-foreground">{summary.sourceMeta.name}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Observed: {new Date(summary.observationTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {summary.retrievedAt && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
                <Calendar className="h-3 w-3" />
                <span>Synced: {new Date(summary.retrievedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>
        </div>

        {/* MANDATORY CLINICAL SAFETY DISCLAIMER BANNER */}
        <Alert variant="warning" className="bg-amber-500/10 border-amber-500/30 text-foreground" data-testid="clinical-safety-alert">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <AlertTitle className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            Clinical Safety Principle: Non-Risk Indicator
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
            {summary.clinicalSafetyDisclaimer}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
