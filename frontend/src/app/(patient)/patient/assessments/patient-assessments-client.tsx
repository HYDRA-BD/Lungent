'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ClipboardList,
  Flame,
  History,
  ShieldAlert,
  ShieldCheck,
  Activity,
  FolderSync,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { getPatientNav } from '@/components/layouts/patient-nav'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useLanguage } from '@/i18n'
import { startAssessmentAction } from '@/modules/patient-portal/actions'
import { TriageEvaluationDialog } from '@/modules/triage/components'
import { OfflineDraftManager } from '@/components/shared/offline-draft-manager'
import { saveDraft } from '@/modules/offline/indexeddb'
import type { Patient } from '@/modules/patients/types'
import type { PatientAssessmentItem } from '@/modules/patient-portal/types'
import type { AssessmentType } from '@/types/database'

interface PatientAssessmentsClientProps {
  patient: Patient
  initialAssessments: PatientAssessmentItem[]
}

export function PatientAssessmentsClient({
  patient,
  initialAssessments,
}: PatientAssessmentsClientProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.patientPortal.assessments

  const [assessments, setAssessments] = useState<PatientAssessmentItem[]>(initialAssessments)
  const [startOpen, setStartOpen] = useState(false)
  const [offlineManagerOpen, setOfflineManagerOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<AssessmentType>('lung_cancer_risk')
  const [consentChecked, setConsentChecked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleStartAssessment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consentChecked) {
      setErrorMsg('You must review and accept the assessment information and consent notice.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await startAssessmentAction(patient.id, {
        assessmentType: selectedType,
        consentGiven: true,
      })
      if (res.success && res.data) {
        setAssessments((prev) => [res.data, ...prev])
        setStartOpen(false)
        setConsentChecked(false)
      } else {
        // Fallback: save local offline draft
        const draftId = `draft_${patient.id}_${selectedType}_${Date.now()}`
        await saveDraft({
          draftId,
          clientOperationId: `op_${draftId}`,
          formType: 'patient_assessment',
          userId: patient.associatedUserProfileId || patient.id,
          patientId: patient.id,
          assessmentType: selectedType,
          data: { consentGiven: true, initiatedOffline: true },
          baseVersion: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncStatus: 'saved_locally',
          syncAttempts: 0,
        })
        setStartOpen(false)
        setConsentChecked(false)
        setOfflineManagerOpen(true)
      }
    } catch {
      // Network interruption fallback: save local offline draft
      const draftId = `draft_${patient.id}_${selectedType}_${Date.now()}`
      await saveDraft({
        draftId,
        clientOperationId: `op_${draftId}`,
        formType: 'patient_assessment',
        userId: patient.associatedUserProfileId || patient.id,
        patientId: patient.id,
        assessmentType: selectedType,
        data: { consentGiven: true, initiatedOffline: true },
        baseVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'saved_locally',
        syncAttempts: 0,
      })
      setStartOpen(false)
      setConsentChecked(false)
      setOfflineManagerOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const patientNav = getPatientNav(dict, '/patient/assessments')

  return (
    <DashboardLayout
      workspaceName={isBn ? 'রোগী স্বাস্থ্য পোর্টাল' : 'Patient Health Portal'}
      workspaceBadge={<Badge variant="outline" className="text-primary border-primary/30 text-xs">{patient.patientId}</Badge>}
      userName={patient.fullName}
      userRole={isBn ? 'নিবন্ধিত রোগী' : 'Registered Patient'}
      navItems={patientNav}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <PageHeader
          title={t.title}
          description={t.subtitle}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOfflineManagerOpen(true)}
                className="text-xs font-medium"
              >
                <FolderSync className="size-3.5 mr-1.5" />
                <span>{isBn ? 'অফলাইন ড্রাফট' : 'Offline Drafts'}</span>
              </Button>
              <Link
                href="/patient/assessments/history"
                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'text-xs' })}
              >
                <History className="size-3.5 mr-1.5" />
                <span>{t.historyTitle}</span>
              </Link>
              <Button
                variant="default"
                size="sm"
                onClick={() => setStartOpen(true)}
                className="text-xs font-semibold"
              >
                <ClipboardList className="size-3.5 mr-1.5" />
                <span>{t.startNewBtn}</span>
              </Button>
            </div>
          }
        />

        {/* Clinical Interpretation Safety Disclaimer */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
          <ShieldAlert className="size-4 text-primary shrink-0 mt-0.5" />
          <p>{t.clinicalSafetyNotice}</p>
        </div>

        {/* Core Assessment Modules Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Module 1: Risk Estimation */}
          <Card className="rounded-2xl border-gray-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs backdrop-blur-sm flex flex-col justify-between p-1">
            <CardHeader className="pb-2">
              <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-1">
                <Flame className="size-5" />
              </div>
              <CardTitle className="text-base font-bold">{t.riskModule}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs flex-1 flex flex-col justify-between">
              <p className="text-muted-foreground leading-relaxed text-sm">{t.riskModuleDesc}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedType('lung_cancer_risk')
                  setStartOpen(true)
                }}
                className="w-full text-xs font-semibold rounded-xl h-9 hover:border-primary/40 hover:bg-primary/5"
              >
                <span>Initiate Risk Survey</span>
                <ArrowRight className="size-3.5 ml-1.5" />
              </Button>
            </CardContent>
          </Card>

          {/* Module 2: Screening Eligibility */}
          <Card className="rounded-2xl border-gray-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs backdrop-blur-sm flex flex-col justify-between p-1">
            <CardHeader className="pb-2">
              <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-1">
                <ShieldCheck className="size-5" />
              </div>
              <CardTitle className="text-base font-bold">{t.screeningModule}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs flex-1 flex flex-col justify-between">
              <p className="text-muted-foreground leading-relaxed text-sm">{t.screeningModuleDesc}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedType('screening_eligibility')
                  setStartOpen(true)
                }}
                className="w-full text-xs font-semibold rounded-xl h-9 hover:border-primary/40 hover:bg-primary/5"
              >
                <span>Check Eligibility</span>
                <ArrowRight className="size-3.5 ml-1.5" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Existing Assessments List */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-foreground">Recent Assessments</h2>
          {assessments.length > 0 ? (
            <div className="space-y-3">
              {assessments.map((item) => (
                <Card key={item.id} className="border-border/80 shadow-xs">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground capitalize">
                          {item.assessmentType.replace(/_/g, ' ')}
                        </span>
                        <Badge
                          variant={item.status === 'reviewed' ? 'default' : item.status === 'submitted' ? 'secondary' : 'outline'}
                          className="text-[10px] capitalize"
                        >
                          {item.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{item.summary}</p>
                      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground pt-1">
                        <span>Initiated: {new Date(item.initiatedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Methodology: {item.methodologyVersion || 'v1.0'}</span>
                        {item.reviewingClinicianName && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                              Reviewed by {item.reviewingClinicianName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/patient/assessments/${item.id}`}
                      className={buttonVariants({ variant: 'outline', size: 'sm', className: 'shrink-0 text-xs' })}
                    >
                      <span>{t.viewResult}</span>
                      <ArrowRight className="size-3 ml-1" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border/80 text-center py-8 text-xs text-muted-foreground italic">
              No assessments initiated yet. Choose an assessment module above to begin.
            </Card>
          )}
        </div>

        {/* Start Assessment Dialog */}
        <Dialog
          open={startOpen}
          onClose={() => setStartOpen(false)}
          title={t.startNewBtn}
          size="md"
        >
          <form onSubmit={handleStartAssessment} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-2.5 rounded-lg border border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-200">
                {errorMsg}
              </div>
            )}

            <div>
              <Label htmlFor="asmt-type">Assessment Module</Label>
              <Select
                id="asmt-type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as AssessmentType)}
                options={[
                  { value: 'lung_cancer_risk', label: 'Lung Cancer Risk Estimation' },
                  { value: 'screening_eligibility', label: 'Screening Eligibility Evaluation' },
                  { value: 'comprehensive_intake', label: 'Comprehensive Clinical Intake' },
                ]}
              />
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2 text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground block">Clinical Disclaimer & Purpose:</span>
              <p>
                This assessment collects relevant pulmonary, tobacco, and exposure factors to support informed healthcare discussions. It is not an automated diagnostic engine.
              </p>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="asmt-consent"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
              />
              <Label htmlFor="asmt-consent" className="cursor-pointer leading-tight">
                I understand this assessment is for clinical decision support and does not replace medical consultation with a pulmonologist.
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setStartOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                Begin Assessment
              </Button>
            </div>
          </form>
        </Dialog>
        <OfflineDraftManager
          isOpen={offlineManagerOpen}
          onClose={() => setOfflineManagerOpen(false)}
          userId={patient.associatedUserProfileId || patient.id}
        />
      </div>
    </DashboardLayout>
  )
}
