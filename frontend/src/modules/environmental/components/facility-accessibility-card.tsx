'use client'

import React from 'react'
import { Building2, Navigation, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { FacilityAccessibilityContext } from '../types'

interface FacilityAccessibilityCardProps {
  context: FacilityAccessibilityContext
  className?: string
}

export function FacilityAccessibilityCard({ context, className = '' }: FacilityAccessibilityCardProps) {
  return (
    <Card className={`border border-border ${className}`} data-testid="facility-accessibility-card">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Healthcare Accessibility & Clinical Capabilities
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Service reach for {context.patientDivision} Division
                {context.patientDistrict && `, ${context.patientDistrict} District`}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {context.nearbyFacilities.length} Regional Facilities
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="space-y-3">
          {context.nearbyFacilities.map((fac) => (
            <div
              key={fac.id}
              className="p-3.5 rounded-lg border border-border/80 bg-muted/10 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground">{fac.name}</span>
                    {fac.isDirectlyInZone && (
                      <Badge variant="success" className="text-[10px] py-0 px-1.5">
                        Local District Zone
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {fac.facilityType} • {fac.district}, {fac.division}
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  {fac.facilityCode}
                </span>
              </div>

              {/* Capability Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
                    fac.capabilities.hasLowDoseCT
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-muted text-muted-foreground border-border/60 opacity-60'
                  }`}
                >
                  {fac.capabilities.hasLowDoseCT ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  Low-Dose CT (LDCT)
                </span>

                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
                    fac.capabilities.hasDiagnosticCT
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-muted text-muted-foreground border-border/60 opacity-60'
                  }`}
                >
                  {fac.capabilities.hasDiagnosticCT ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  Diagnostic CT
                </span>

                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
                    fac.capabilities.hasSpirometry
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-muted text-muted-foreground border-border/60 opacity-60'
                  }`}
                >
                  {fac.capabilities.hasSpirometry ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  Spirometry
                </span>

                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
                    fac.capabilities.hasGeneXpert
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-muted text-muted-foreground border-border/60 opacity-60'
                  }`}
                >
                  {fac.capabilities.hasGeneXpert ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  GeneXpert (TB)
                </span>

                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
                    fac.capabilities.hasThoracicSurgery
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-muted text-muted-foreground border-border/60 opacity-60'
                  }`}
                >
                  {fac.capabilities.hasThoracicSurgery ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  Thoracic Surgery
                </span>
              </div>

              {/* Caveats */}
              {fac.accessibilityCaveats.length > 0 && (
                <div className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded border border-border/40 space-y-1">
                  {fac.accessibilityCaveats.map((c, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Global Accessibility Note */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-muted-foreground">
          <Navigation className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <p>{context.clinicalContextNote}</p>
        </div>
      </CardContent>
    </Card>
  )
}

