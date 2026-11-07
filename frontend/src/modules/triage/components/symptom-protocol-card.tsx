'use client'

/**
 * Phase 1.14: Symptom Triage Protocol Card
 */

import React from 'react'
import { FileText, ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SymptomTriageProtocolItem } from '../types'

interface SymptomProtocolCardProps {
  protocol: SymptomTriageProtocolItem
  onSelect?: (protocolId: string) => void
  isSelected?: boolean
}

export function SymptomProtocolCard({ protocol, onSelect, isSelected }: SymptomProtocolCardProps) {
  const getLifecycleBadge = (status: string) => {
    switch (status) {
      case 'approved_for_clinical_use':
        return <Badge variant="success" className="text-xs">Approved for Clinical Use</Badge>
      case 'awaiting_clinical_approval':
        return <Badge variant="warning" className="text-xs">Awaiting Clinical Approval</Badge>
      case 'under_validation':
        return <Badge variant="secondary" className="text-xs">Under Validation</Badge>
      case 'research_only':
        return <Badge variant="outline" className="text-xs">Research Only</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  return (
    <Card
      className={`transition-all border ${
        isSelected
          ? 'border-primary ring-2 ring-primary/20 shadow-sm'
          : 'border-border hover:border-primary/50'
      }`}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-sm bg-muted text-foreground">
              {protocol.protocolCode}
            </span>
            {getLifecycleBadge(protocol.lifecycleStatus)}
          </div>
          {protocol.approvedForBangladesh ? (
            <Badge variant="success" className="text-[11px] gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Clinically Approved (Bangladesh)
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-[11px] gap-1">
              <ShieldAlert className="h-3 w-3" />
              Not Clinically Approved (Bangladesh)
            </Badge>
          )}
        </div>
        <CardTitle className="text-base font-bold text-foreground mt-2">
          {protocol.name}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {protocol.issuingOrganization} • {protocol.jurisdiction}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3 text-xs">
        <p className="text-foreground/90 leading-relaxed">
          <strong className="text-foreground">Intended Population:</strong> {protocol.intendedPopulation}
        </p>

        <div className="rounded-md border border-amber-300 bg-amber-50/60 p-2.5 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
          <span className="font-bold flex items-center gap-1 mb-0.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            Known Limitations & Context:
          </span>
          <span className="leading-relaxed">{protocol.knownLimitations}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border text-[11px] text-muted-foreground">
          <span>Authority: {protocol.approvalAuthority}</span>
          {protocol.officialSourceUrl && (
            <a
              href={protocol.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <FileText className="h-3 w-3" />
              Official Guidelines
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>

        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(protocol.id)}
            className="w-full mt-2 py-1.5 px-3 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
          >
            {isSelected ? 'Selected Protocol' : 'Select Protocol'}
          </button>
        )}
      </CardContent>
    </Card>
  )
}
