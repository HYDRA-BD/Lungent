'use client'

import React from 'react'
import { Wind, AlertTriangle, Clock, Building2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { EnvironmentalContextSummary } from '../types'

interface EnvironmentalContextCardProps {
  summary: EnvironmentalContextSummary
  className?: string
}

export function EnvironmentalContextCard({ summary, className = '' }: EnvironmentalContextCardProps) {
  const getAqiColorInfo = (aqi: number) => {
    if (aqi <= 50) {
      return {
        label: 'Good (ভালো)',
        color: 'text-emerald-700 dark:text-emerald-300',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        badge: 'success' as const,
      }
    }
    if (aqi <= 100) {
      return {
        label: 'Moderate (সহনীয়)',
        color: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
        badge: 'warning' as const,
      }
    }
    if (aqi <= 150) {
      return {
        label: 'Unhealthy for Sensitive Groups (সংবেদনশীলদের জন্য অস্বাস্থ্যকর)',
        color: 'text-orange-700 dark:text-orange-300',
        bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
        badge: 'warning' as const,
      }
    }
    if (aqi <= 200) {
      return {
        label: 'Unhealthy (অস্বাস্থ্যকর)',
        color: 'text-red-700 dark:text-red-300',
        bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800',
        badge: 'destructive' as const,
      }
    }
    if (aqi <= 300) {
      return {
        label: 'Very Unhealthy (খুব অস্বাস্থ্যকর)',
        color: 'text-purple-700 dark:text-purple-300',
        bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
        badge: 'destructive' as const,
      }
    }
    return {
      label: 'Hazardous (বিপজ্জনক)',
      color: 'text-rose-900 dark:text-rose-200',
      bg: 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800',
      badge: 'destructive' as const,
    }
  }

  const aqiInfo = getAqiColorInfo(summary.aqi.value)

  return (
    <Card className={`border border-border shadow-sm ${className}`} data-testid="environmental-context-card">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Wind className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Ambient Environmental Context
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Location: {summary.division}
                {summary.district && `, ${summary.district}`}
                {summary.upazila && ` (${summary.upazila})`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {summary.europeanAqi && (
              <Badge variant="outline" className="text-xs">
                EU CAQI {summary.europeanAqi.value}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs font-mono">
              {summary.aqi.status.toUpperCase()}
            </Badge>
            <Badge variant={aqiInfo.badge} className="text-xs">
              {aqiInfo.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Main AQI and Pollutants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Large AQI Indicator */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between items-center text-center ${aqiInfo.bg}`}
          >
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Air Quality Index (AQI)
            </span>
            <div className="my-2">
              <span className={`text-4xl font-extrabold ${aqiInfo.color}`} data-testid="aqi-value">
                {summary.aqi.value}
              </span>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">
              DOE CAMS Baseline
            </span>
          </div>

          {/* Key Pollutants */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {summary.pollutants.pm25 && (
              <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20">
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                  <span className="font-semibold text-foreground">PM2.5</span>
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                    {summary.pollutants.pm25.status}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {summary.pollutants.pm25.value}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    {summary.pollutants.pm25.unit}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">Fine Inhalable Particles</span>
              </div>
            )}

            {summary.pollutants.pm10 && (
              <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20">
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                  <span className="font-semibold text-foreground">PM10</span>
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                    {summary.pollutants.pm10.status}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {summary.pollutants.pm10.value}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    {summary.pollutants.pm10.unit}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">Respirable Coarse Dust</span>
              </div>
            )}

            {summary.pollutants.no2 && (
              <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20">
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                  <span className="font-semibold text-foreground">NO₂</span>
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                    {summary.pollutants.no2.status}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {summary.pollutants.no2.value}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    {summary.pollutants.no2.unit}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">Nitrogen Dioxide</span>
              </div>
            )}

            {summary.pollutants.so2 && (
              <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20">
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                  <span className="font-semibold text-foreground">SO₂</span>
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    {summary.pollutants.so2.status}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {summary.pollutants.so2.value}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    {summary.pollutants.so2.unit}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">Sulfur Dioxide</span>
              </div>
            )}

            {summary.pollutants.co && (
              <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20">
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                  <span className="font-semibold text-foreground">CO</span>
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    {summary.pollutants.co.status}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {summary.pollutants.co.value}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    {summary.pollutants.co.unit}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">Carbon Monoxide</span>
              </div>
            )}

            {summary.pollutants.o3 && (
              <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20">
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                  <span className="font-semibold text-foreground">O₃</span>
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    {summary.pollutants.o3.status}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {summary.pollutants.o3.value}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    {summary.pollutants.o3.unit}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">Ground-level Ozone</span>
              </div>
            )}
          </div>
        </div>

        {/* Provenance and Observation Details */}
        <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50 gap-2">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            <span>Source: <strong className="text-foreground">{summary.sourceMeta.name}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Observed: {new Date(summary.observationTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* MANDATORY CLINICAL SAFETY DISCLAIMER BANNER */}
        <Alert variant="warning" className="bg-amber-500/10 border-amber-500/30 text-foreground" data-testid="clinical-safety-alert">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
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
