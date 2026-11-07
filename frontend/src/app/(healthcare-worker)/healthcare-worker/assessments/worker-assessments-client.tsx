'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  PlusCircle,
  ShieldAlert,
  Search,
  FolderSync,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { useLanguage } from '@/i18n'
import { FacilityContextSwitcher } from '@/modules/healthcare-worker/components/facility-context-switcher'
import { InitiateAssessmentModal } from '@/modules/healthcare-worker/components/initiate-assessment-modal'
import { getHealthcareWorkerNav } from '@/modules/healthcare-worker/components/worker-navigation'
import { RiskExecutionDialog } from '@/modules/risk-estimation/components'
import { ScreeningEvaluationDialog } from '@/modules/screening/components'
import { TriageEvaluationDialog } from '@/modules/triage/components'
import { OfflineDraftManager } from '@/components/shared/offline-draft-manager'
import type { PatientAssessmentWorkflowItem } from '@/modules/healthcare-worker/types'
import type { PatientOption } from '@/modules/healthcare-worker/components/initiate-assessment-modal'
import type { Facility } from '@/modules/facilities/types'

interface WorkerAssessmentsClientProps {
  initialAssessments: PatientAssessmentWorkflowItem[]
  patients: PatientOption[]
  facilities: Facility[]
  activeFacilityId: string
}

export function WorkerAssessmentsClient({
  initialAssessments,
  patients,
  facilities,
  activeFacilityId: defaultFacilityId,
}: WorkerAssessmentsClientProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const [activeFacilityId, setActiveFacilityId] = useState(defaultFacilityId)
  const [assessments] = useState(initialAssessments)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOfflineHubOpen, setIsOfflineHubOpen] = useState(false)

  const navItems = getHealthcareWorkerNav(isBn)

  const filteredAssessments = assessments.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false
    if (typeFilter !== 'all' && item.assessmentType !== typeFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        item.patientName.toLowerCase().includes(q) ||
        item.patientCanonicalId.toLowerCase().includes(q) ||
        (item.summary && item.summary.toLowerCase().includes(q))
      )
    }
    return true
  })

  return (
    <DashboardLayout
      workspaceName={isBn ? 'কমিউনিটি স্বাস্থ্যকর্মী ওয়ার্কস্পেস' : 'Healthcare Worker Workspace'}
      workspaceBadge={
        <FacilityContextSwitcher
          activeFacilityId={activeFacilityId}
          facilities={facilities}
          onFacilitySwitched={(newId) => setActiveFacilityId(newId)}
        />
      }
      userName="Tania Akhter"
      userRole={isBn ? 'কমিউনিটি স্বাস্থ্য বিশেষজ্ঞ (CHW)' : 'Community Health Specialist (CHW)'}
      navItems={navItems}
    >
      <div className="space-y-6">
        <PageHeader
          title={isBn ? 'রোগী মূল্যায়ন ওয়ার্কফ্লো' : 'Patient Assessment Workflows'}
          description={
            isBn
              ? 'ফুসফুসের ক্যান্সার ঝুঁকি, স্ক্রিনিং যোগ্যতা ও লক্ষণ ট্রায়াজ তথ্য সংগ্রহ এবং ক্লিনিকাল রিভিউ পর্যবেক্ষণ।'
              : 'Standardized CHW intakes for lung cancer risk estimation, LDCT screening eligibility, and symptom triage.'
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <RiskExecutionDialog
                patientId={patients[0]?.id || '11111111-1111-4111-a111-111111111111'}
                patientName={patients[0]?.fullName || (isBn ? 'রফিকুল ইসলাম' : 'Rafiqul Islam')}
                facilityId={activeFacilityId}
              />
              <ScreeningEvaluationDialog
                patientId={patients[0]?.id || '11111111-1111-4111-a111-111111111111'}
                patientName={patients[0]?.fullName || (isBn ? 'রফিকুল ইসলাম' : 'Rafiqul Islam')}
                facilityId={activeFacilityId}
              />
              <TriageEvaluationDialog
                patientId={patients[0]?.id || '11111111-1111-4111-a111-111111111111'}
                patientName={patients[0]?.fullName || (isBn ? 'রফিকুল ইসলাম' : 'Rafiqul Islam')}
                facilityId={activeFacilityId}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOfflineHubOpen(true)}
                className="text-xs font-medium"
              >
                <FolderSync className="size-3.5 mr-1.5" />
                <span>{isBn ? 'অফলাইন ড্রাফট' : 'Offline Drafts'}</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                leftIcon={<PlusCircle className="size-4" />}
              >
                {isBn ? 'মূল্যায়ন শুরু করুন' : 'Initiate Assessment'}
              </Button>
            </div>
          }
        />

        {/* Clinical Safety Disclaimer */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-3">
          <ShieldAlert className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">
              {isBn
                ? 'গুরুত্বপূর্ণ ক্লিনিকাল নির্দেশনা:'
                : 'Mandatory Clinical Safety Notice:'}
            </span>
            <p>
              {isBn
                ? 'কমিউনিটি স্বাস্থ্যকর্মীদের ইনটেক রোগীর স্বঘোষিত তথ্য ও পরিমাপ একত্রিত করে। চূড়ান্ত ঝুঁকি স্তর নির্ণয়, লো-ডোজ সিটি স্ক্রিনিং প্রেসক্রিপশন বা রেফারেল সিদ্ধান্ত অনুমোদিত রেজিস্টার্ড চিকিৎসকের পর্যালোচনার মাধ্যমে কার্যকর হবে।'
                : 'Community healthcare worker assessment workflows capture patient-reported indicators and physical measurements for clinical decision support. Final risk categorization, screening recommendations, and diagnostic referrals strictly require authorized clinician review.'}
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'রোগীর নাম বা আইডি দিয়ে খুঁজুন...' : 'Search by patient name or ID...'}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label={isBn ? 'ক্যাটাগরি অনুযায়ী ফিল্টার' : 'Filter by category'}
              className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">{isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
              <option value="lung_cancer_risk">
                {isBn ? 'ক্যান্সার ঝুঁকি মূল্যায়ন' : 'Lung Cancer Risk'}
              </option>
              <option value="screening_eligibility">
                {isBn ? 'স্ক্রিনিং যোগ্যতা (LDCT)' : 'Screening Eligibility'}
              </option>
              <option value="symptom_triage">
                {isBn ? 'লক্ষণ ট্রায়াজ' : 'Symptom Triage'}
              </option>
              <option value="comprehensive_intake">
                {isBn ? 'সমন্বিত ইনটেক' : 'Comprehensive Intake'}
              </option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={isBn ? 'স্ট্যাটাস অনুযায়ী ফিল্টার' : 'Filter by status'}
              className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">{isBn ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
              <option value="in_progress">{isBn ? 'চলমান (In Progress)' : 'In Progress'}</option>
              <option value="submitted">{isBn ? 'জমা দেওয়া (Submitted)' : 'Submitted'}</option>
              <option value="awaiting_clinical_review">
                {isBn ? 'রিভিউ অপেক্ষমাণ (Awaiting Review)' : 'Awaiting Review'}
              </option>
              <option value="reviewed">{isBn ? 'পর্যালোচিত (Reviewed)' : 'Reviewed'}</option>
            </select>
          </div>
        </div>

        {/* Assessment Queue Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? 'রোগী ও আইডি' : 'Patient'}</TableHead>
                  <TableHead>{isBn ? 'মূল্যায়ন ক্যাটাগরি' : 'Assessment Category'}</TableHead>
                  <TableHead>{isBn ? 'ওয়ার্কফ্লো অবস্থা' : 'Workflow Status'}</TableHead>
                  <TableHead>{isBn ? 'ক্লিনিকাল রিভিউ' : 'Clinical Review'}</TableHead>
                  <TableHead>{isBn ? 'ক্লিনিকাল সারাংশ' : 'Clinical Summary'}</TableHead>
                  <TableHead className="text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.length > 0 ? (
                  filteredAssessments.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-semibold text-foreground">{item.patientName}</div>
                        <div className="font-mono text-xs text-primary font-medium">
                          {item.patientCanonicalId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" size="sm" className="capitalize">
                          {item.assessmentType.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === 'reviewed'
                              ? 'success'
                              : item.status === 'awaiting_clinical_review'
                              ? 'warning'
                              : 'secondary'
                          }
                          size="sm"
                        >
                          {item.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.isReviewedByClinician
                              ? 'success'
                              : 'outline'
                          }
                          size="sm"
                        >
                          {item.isReviewedByClinician
                            ? isBn
                              ? 'পর্যালোচিত'
                              : 'Reviewed'
                            : isBn
                              ? 'অপেক্ষমাণ'
                              : 'Pending Review'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs text-xs text-muted-foreground truncate">
                        {item.summary || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <Link href={`/healthcare-worker/patients/${item.patientId}`}>
                            <Button variant="ghost" size="xs">
                              {isBn ? 'প্রোফাইল' : 'Profile'}
                            </Button>
                          </Link>
                          <Link href={`/healthcare-worker/patients/${item.patientId}/health-record`}>
                            <Button variant="outline" size="xs">
                              {isBn ? 'রেকর্ড' : 'Record'}
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                      {isBn ? 'কোনো মূল্যায়ন পাওয়া যায়নি।' : 'No assessment workflows match the criteria.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <InitiateAssessmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patients={patients}
        activeFacilityId={activeFacilityId}
        onSuccess={() => {
          // Revalidated
        }}
      />
      <OfflineDraftManager
        isOpen={isOfflineHubOpen}
        onClose={() => setIsOfflineHubOpen(false)}
        userId="worker_session"
      />
    </DashboardLayout>
  )
}
