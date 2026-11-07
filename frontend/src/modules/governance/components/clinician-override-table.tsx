'use client'

import React, { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { ShieldAlert, ArrowRight, UserCheck } from 'lucide-react'
import { useLanguage } from '@/i18n'
import type { ClinicianOverrideRecord } from '../types'

interface ClinicianOverrideTableProps {
  overrides: ClinicianOverrideRecord[]
}

export function ClinicianOverrideTable({ overrides }: ClinicianOverrideTableProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.clinicalGovernance

  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('all')

  const filteredOverrides = overrides.filter((ovr) => {
    if (selectedSubsystem !== 'all' && ovr.engineSubsystem !== selectedSubsystem) {
      return false
    }
    return true
  })

  const getSubsystemLabel = (subsystem: string) => {
    switch (subsystem) {
      case 'symptom_triage':
        return t.filterTriage
      case 'screening_eligibility':
        return t.filterScreening
      case 'risk_estimation':
        return t.filterRisk
      case 'clinical_decision_support':
        return t.filterCdss
      default:
        return subsystem
    }
  }

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'clinical_contraindication':
        return isBn ? 'ক্লিনিক্যাল প্রতিনির্দেশ' : 'Clinical Contraindication'
      case 'patient_preference':
        return isBn ? 'রোগীর পছন্দ ও সম্মতি' : 'Patient Preference'
      case 'comorbidity_precaution':
        return isBn ? 'সহবর্তী রোগের সতর্কতা' : 'Comorbidity Precaution'
      case 'diagnostic_discordance':
        return isBn ? 'উপসর্গ-ল্যাব অসামঞ্জস্য' : 'Diagnostic Discordance'
      case 'expert_judgment':
        return isBn ? 'বিশেষজ্ঞ বিবেচনা' : 'Expert Clinical Judgment'
      default:
        return isBn ? 'অন্যান্য ক্লিনিক্যাল কারণ' : 'Other'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-amber-600" />
              {t.clinicianOverrides} ({filteredOverrides.length})
            </CardTitle>
            <CardDescription>
              {isBn
                ? 'সিডিএসএস স্বয়ংক্রিয় সুপারিশের বিপরীতে চিকিৎসকের গৃহীত সিদ্ধান্তের বাধ্যতামূলক অডিট রেকর্ড।'
                : 'Auditable records of clinician decisions differing from automated CDSS outputs, preserved without mutating original results.'}
            </CardDescription>
          </div>

          <div className="w-full sm:w-56">
            <Select
              value={selectedSubsystem}
              onChange={(e) => setSelectedSubsystem(e.target.value)}
              options={[
                { value: 'all', label: t.filterAll },
                { value: 'symptom_triage', label: t.filterTriage },
                { value: 'screening_eligibility', label: t.filterScreening },
                { value: 'risk_estimation', label: t.filterRisk },
                { value: 'clinical_decision_support', label: t.filterCdss },
              ]}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredOverrides.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {isBn
              ? 'নির্বাচিত ফিল্টারে কোনো ওভাররাইড রেকর্ড পাওয়া যায়নি।'
              : 'No clinician override records match the selected filter.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? 'অ্যাসেসমেন্ট ও সাবসিস্টেম' : 'Assessment & Subsystem'}</TableHead>
                  <TableHead>{t.originalOutcome}</TableHead>
                  <TableHead>{t.overriddenOutcome}</TableHead>
                  <TableHead>{isBn ? 'কারণ ও যৌক্তিকতা' : 'Reason & Rationale'}</TableHead>
                  <TableHead>{isBn ? 'চিকিৎসক' : 'Clinician'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOverrides.map((ovr) => (
                  <TableRow key={ovr.id}>
                    <TableCell className="font-medium">
                      <div className="font-mono text-xs font-semibold">{ovr.assessmentId}</div>
                      <span className="text-xs text-muted-foreground">{getSubsystemLabel(ovr.engineSubsystem)}</span>
                    </TableCell>

                    <TableCell className="max-w-[160px]">
                      <div className="rounded bg-muted/60 p-1.5 font-mono text-[11px] text-muted-foreground truncate">
                        {JSON.stringify(ovr.automatedResult)}
                      </div>
                    </TableCell>

                    <TableCell className="max-w-[160px]">
                      <div className="rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 p-1.5 font-mono text-[11px] text-indigo-900 dark:text-indigo-200 truncate flex items-center gap-1">
                        <ArrowRight className="size-3 shrink-0 text-indigo-500" />
                        <span className="truncate">{JSON.stringify(ovr.overriddenResult)}</span>
                      </div>
                    </TableCell>

                    <TableCell className="max-w-[280px]">
                      <Badge variant="outline" size="sm" className="mb-1">
                        {getReasonLabel(ovr.overrideReasonCategory)}
                      </Badge>
                      <p className="text-xs text-foreground italic line-clamp-2">
                        &quot;{ovr.overrideRationale}&quot;
                      </p>
                    </TableCell>

                    <TableCell className="text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <UserCheck className="size-3.5 text-blue-600" />
                        {ovr.clinicianName}
                      </div>
                      <span className="text-muted-foreground text-[11px]">
                        {new Date(ovr.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

