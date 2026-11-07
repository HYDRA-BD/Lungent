'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  Search,
  FileCheck2,
  Stethoscope,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { useLanguage } from '@/i18n'
import { getClinicalNav } from '@/modules/clinical/components/clinical-navigation'
import { RiskExecutionDialog } from '@/modules/risk-estimation/components'
import { ScreeningEvaluationDialog } from '@/modules/screening/components'
import { TriageEvaluationDialog } from '@/modules/triage/components'
import type { AssessmentReviewSummary } from '@/modules/clinical/types'

interface ClinicalAssessmentsClientProps {
  initialAssessments: AssessmentReviewSummary[]
}

export function ClinicalAssessmentsClient({ initialAssessments }: ClinicalAssessmentsClientProps) {
  const { locale, dict } = useLanguage()
  const isBn = locale === 'bn'
  const asT = dict.clinicalWorkspace.assessments

  const [assessments] = useState<AssessmentReviewSummary[]>(initialAssessments)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const navItems = getClinicalNav(isBn)

  const filteredAssessments = assessments.filter((asm) => {
    if (selectedCategory !== 'all' && asm.assessmentType !== selectedCategory) {
      return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesName = asm.patientName.toLowerCase().includes(q)
      const matchesId = asm.patientCanonicalId.toLowerCase().includes(q)
      if (!matchesName && !matchesId) return false
    }
    return true
  })

  return (
    <DashboardLayout
      workspaceName={isBn ? 'ক্লিনিক্যাল সিদ্ধান্ত সহায়তা ওয়ার্কস্পেস' : 'Clinical Decision Support Workspace'}
      workspaceBadge={
        <Badge variant="default" size="sm">
          {isBn ? 'পালমোনোলজি ও অনকোলজি প্যানেল' : 'Pulmonology & Oncology Panel'}
        </Badge>
      }
      userName="Prof. Dr. Farhana Ahmed"
      userRole={isBn ? 'সিনিয়র কনসালটেন্ট পালমোনোলজিস্ট' : 'Senior Consultant Pulmonologist'}
      navItems={navItems}
    >
      <div className="space-y-6">
        <PageHeader
          title={asT.title}
          description={asT.subtitle}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <RiskExecutionDialog
                patientId={assessments[0]?.patientId || '11111111-1111-4111-a111-111111111111'}
                patientName={assessments[0]?.patientName || (isBn ? 'রফিকুল ইসলাম' : 'Rafiqul Islam')}
              />
              <ScreeningEvaluationDialog
                patientId={assessments[0]?.patientId || '11111111-1111-4111-a111-111111111111'}
                patientName={assessments[0]?.patientName || (isBn ? 'রফিকুল ইসলাম' : 'Rafiqul Islam')}
              />
              <TriageEvaluationDialog
                patientId={assessments[0]?.patientId || '11111111-1111-4111-a111-111111111111'}
                patientName={assessments[0]?.patientName || (isBn ? 'রফিকুল ইসলাম' : 'Rafiqul Islam')}
              />
            </div>
          }
        />

        {/* Prominent Mandatory Non-Diagnostic Governance Notice */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50/80 p-4 text-amber-900 shadow-xs dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold">{isBn ? 'ক্লিনিক্যাল দায়িত্ব ও শাসন নীতি: ' : 'Clinical Governance Notice: '}</span>
            {asT.governanceNotice}
          </div>
        </div>

        {/* Filter Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isBn ? 'রোগীর নাম বা আইডি খুঁজুন...' : 'Search by patient name or ID...'}
                  className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">{isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
                  <option value="lung_cancer_risk">
                    {isBn ? '১. ফুসফুস ক্যান্সার ঝুঁকি' : '1. Lung Cancer Risk Estimation'}
                  </option>
                  <option value="screening_eligibility">
                    {isBn ? '২. এলডিসিটি স্ক্রিনিং যোগ্যতা' : '2. LDCT Screening Eligibility'}
                  </option>
                  <option value="symptom_triage">
                    {isBn ? '৩. লক্ষণভিত্তিক ট্রায়াজ' : '3. Symptom-Based Clinical Triage'}
                  </option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {isBn ? `অপেক্ষমাণ ও পর্যালোচিত তালিকা (${filteredAssessments.length})` : `Assessment Queue (${filteredAssessments.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{asT.table.patient}</TableHead>
                  <TableHead>{asT.table.type}</TableHead>
                  <TableHead>{asT.table.score}</TableHead>
                  <TableHead>{asT.table.status}</TableHead>
                  <TableHead>{asT.table.decision}</TableHead>
                  <TableHead>{asT.table.date}</TableHead>
                  <TableHead className="text-right">{asT.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                      {asT.noAssessments}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssessments.map((asm) => (
                    <TableRow key={asm.id}>
                      <TableCell>
                        <div className="font-semibold text-foreground">{asm.patientName}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {asm.patientCanonicalId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {asm.assessmentType.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground text-sm">
                          {asm.algorithmicCategory}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                          {asm.riskSummary}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            asm.clinicalReviewStatus === 'reviewed'
                              ? 'success'
                              : asm.clinicalReviewStatus === 'under_review'
                              ? 'warning'
                              : 'default'
                          }
                          className="text-xs"
                        >
                          {asm.clinicalReviewStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {asm.hasClinicianDecision ? (
                          <Badge variant="success" className="gap-1 text-xs">
                            <FileCheck2 className="size-3" />
                            {asm.clinicianDecisionType?.replace(/_/g, ' ') || 'Finalized'}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">
                            {isBn ? 'সিদ্ধান্ত বাকি' : 'Decision Pending'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {asm.submittedAt ? asm.submittedAt.slice(0, 10) : asm.initiatedAt.slice(0, 10)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/clinical/patients/${asm.patientId}`}>
                          <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
                            <Stethoscope className="size-3" />
                            {isBn ? 'পর্যালোচনা' : 'Review'}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
