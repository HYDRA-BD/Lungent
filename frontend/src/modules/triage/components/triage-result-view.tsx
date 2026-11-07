'use client'

/**
 * Phase 1.14: Symptom-Based Clinical Triage Engine - Result View Component
 */

import React from 'react'
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  HelpCircle,
  Hash,
  AlertOctagon,
  ArrowRight,
  Info,
  Calendar,
} from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SymptomTriageDeterminationRecord } from '../types'

interface TriageResultViewProps {
  record: SymptomTriageDeterminationRecord
}

export function TriageResultView({ record }: TriageResultViewProps) {
  const isSimulation = record.executionMode === 'research_simulation'
  const isGovernancePaused = record.executionStatus === 'protocol_not_approved'
  const exp = record.clinicalExplanation

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'emergency_escalation':
        return (
          <Badge variant="destructive" className="text-sm px-3 py-1 gap-1.5 font-bold uppercase tracking-wider animate-pulse">
            <AlertOctagon className="h-4 w-4" />
            Emergency Escalation (Immediate / Same Day)
          </Badge>
        )
      case 'urgent_assessment':
        return (
          <Badge className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-3 py-1 gap-1.5 font-bold uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4" />
            Urgent Diagnostic Assessment (≤14 Days)
          </Badge>
        )
      case 'prompt_review':
        return (
          <Badge variant="default" className="text-sm px-3 py-1 gap-1.5 font-bold uppercase tracking-wider">
            <Clock className="h-4 w-4" />
            Prompt Outpatient Review (≤28 Days)
          </Badge>
        )
      case 'routine_review':
        return (
          <Badge variant="success" className="text-sm px-3 py-1 gap-1.5 font-bold uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4" />
            Routine Primary Care Review
          </Badge>
        )
      case 'protocol_not_approved':
        return (
          <Badge variant="destructive" className="text-sm px-3 py-1 gap-1.5 font-bold uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4" />
            Triage Paused by Clinical Governance
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-sm px-3 py-1 gap-1.5 font-bold uppercase tracking-wider">
            <HelpCircle className="h-4 w-4" />
            Incomplete Triage Data
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Mandatory Clinical Governance Pause Banner */}
      {isGovernancePaused && (
        <Alert variant="destructive" className="border-2 border-destructive/50 bg-destructive/10">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          <AlertTitle className="text-base font-bold text-destructive">
            Clinical Governance Safety Notice: Triage Determination Paused
          </AlertTitle>
          <AlertDescription className="text-sm mt-1 leading-relaxed text-foreground/90">
            {record.governanceNotice}
          </AlertDescription>
        </Alert>
      )}

      {/* 2. Research Simulation Watermark */}
      {isSimulation && (
        <Alert className="border-amber-400 bg-amber-500/10 text-amber-950 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-sm font-bold">Research Simulation Execution</AlertTitle>
          <AlertDescription className="text-xs mt-1 leading-relaxed">
            {record.governanceNotice}
          </AlertDescription>
        </Alert>
      )}

      {/* 3. Emergency / Urgent Warning Alert */}
      {exp.emergencyWarningNotice && (
        <Alert variant="destructive" className="border-destructive bg-destructive/15">
          <AlertOctagon className="h-5 w-5 text-destructive animate-bounce" />
          <AlertTitle className="text-base font-bold text-destructive">
            Critical Clinical Warning
          </AlertTitle>
          <AlertDescription className="text-sm mt-1 font-medium leading-relaxed text-foreground">
            {exp.emergencyWarningNotice}
          </AlertDescription>
        </Alert>
      )}

      {/* 4. Primary Triage Determination Summary Card */}
      <Card className="border-border">
        <CardHeader className="bg-muted/15 border-b border-border pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                  {record.protocolCode} ({record.protocolVersion})
                </span>
                <Badge variant={isSimulation ? 'secondary' : 'default'} className="text-[11px]">
                  {record.executionMode === 'clinical_production'
                    ? 'Clinical Production Mode'
                    : 'Research Simulation Mode'}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                {record.protocolName}
              </CardTitle>
            </div>
            <div className="shrink-0 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Evaluated: {record.evaluatedAt.slice(0, 10)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Assigned Clinical Urgency Tier
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {getUrgencyBadge(record.urgencyLevel)}
              {record.recommendedTimeframeDays !== null && (
                <span className="text-xs text-muted-foreground font-medium">
                  Recommended Evaluation Window: ≤{record.recommendedTimeframeDays} days
                </span>
              )}
            </div>
          </div>

          {/* Recommended Escalation Pathway */}
          {record.recommendedEscalationPathway && (
            <div className="p-3.5 rounded-lg border border-primary/20 bg-primary/5 space-y-1">
              <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="h-3.5 w-3.5" />
                Recommended Escalation Pathway
              </span>
              <p className="text-sm font-semibold text-foreground leading-relaxed">
                {record.recommendedEscalationPathway}
              </p>
            </div>
          )}

          {/* Triggering Symptoms Summary */}
          {exp.triggeringSymptomsSummary && exp.triggeringSymptomsSummary.length > 0 && (
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Triggering Reported Symptoms & Signs
              </span>
              <div className="flex flex-wrap gap-2">
                {exp.triggeringSymptomsSummary.map((sym, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20"
                  >
                    • {sym}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Criterion-Level Guideline Breakdown */}
      {exp.criteriaBreakdown && exp.criteriaBreakdown.length > 0 && (
        <Card className="border-border">
          <CardHeader className="p-4 pb-2 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Criterion-Level Protocol Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Triage Criterion</th>
                  <th className="py-2.5 px-3 font-semibold">Patient Value / Finding</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Clinical Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exp.criteriaBreakdown.map((crit, idx) => (
                  <tr key={idx} className={crit.status === 'met' && crit.isRedFlag ? 'bg-destructive/5' : 'hover:bg-muted/10'}>
                    <td className="py-2.5 px-3 font-semibold text-foreground max-w-[200px]">
                      <div className="flex items-center gap-1.5">
                        {crit.isRedFlag && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0">
                            RED FLAG
                          </Badge>
                        )}
                        <span>{crit.criterionLabel}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                        {crit.criterionRuleDescription}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-foreground/90 whitespace-nowrap">
                      {crit.patientActualValue}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {crit.status === 'met' ? (
                        <Badge variant={crit.isRedFlag ? 'destructive' : 'default'} className="text-[10px]">
                          Criterion Met
                        </Badge>
                      ) : crit.status === 'missing' ? (
                        <Badge variant="warning" className="text-[10px]">
                          Data Missing
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          Criterion Unmet
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground leading-relaxed max-w-[320px]">
                      {crit.clinicalExplanation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 6. Clinical Considerations & Non-Diagnostic Guidance */}
      <Card className="border-border">
        <CardHeader className="p-4 pb-2 border-b border-border">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Clinical Considerations & Shared Decision-Making
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2 text-xs text-muted-foreground leading-relaxed">
          <ul className="list-disc list-inside space-y-1.5">
            {exp.clinicalConsiderations.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 7. What This Result Means & What It Does NOT Mean */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
              What This Determination Means
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-muted-foreground leading-relaxed">
            <p>{exp.whatThisMeans}</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold text-destructive flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              What This Determination Does NOT Mean
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-muted-foreground leading-relaxed space-y-1">
            <ul className="list-none space-y-1">
              {record.disclaimers.split('\n').map((line, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-destructive font-bold">✕</span>
                  <span>{line.replace(/^[0-9]+\.\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 8. Tamper-Evident Input Snapshot */}
      <div className="rounded-lg border border-border bg-muted/20 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Hash className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">Tamper-Evident Input Snapshot</span>
          <span className="font-mono text-[11px]">SHA-256: {record.inputSnapshotHash.slice(0, 16)}...</span>
        </div>
        <div className="text-[11px] text-muted-foreground">
          Patient: <strong className="text-foreground">{record.patientName}</strong> ({record.patientCanonicalId})
        </div>
      </div>
    </div>
  )
}
