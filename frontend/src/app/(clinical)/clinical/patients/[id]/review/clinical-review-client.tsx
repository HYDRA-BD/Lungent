'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Save,
  FileText,
  AlertTriangle,
  Plus,
  Trash2,
  ArrowLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/i18n'
import { getClinicalNav } from '@/modules/clinical/components/clinical-navigation'
import { recordClinicalReviewAction } from '@/modules/clinical/actions'
import { RecordDecisionModal } from '@/modules/clinical/components/record-decision-modal'
import type {
  ConsolidatedClinicalProfile,
  ClinicalReviewItem,
} from '@/modules/clinical/types'
import type {
  ClinicalReviewStatus,
  ClinicalReviewType,
  ClinicalObservationCategory,
} from '@/types/database'

interface ObservationDraft {
  category: ClinicalObservationCategory
  observationText: string
  clinicalInterpretation?: string
}

interface ClinicalReviewClientProps {
  profile: ConsolidatedClinicalProfile
}

export function ClinicalReviewClient({ profile }: ClinicalReviewClientProps) {
  const router = useRouter()
  const { locale, dict } = useLanguage()
  const isBn = locale === 'bn'
  const rT = dict.clinicalWorkspace.review
  const p = profile.identity.patient

  const [reviewType, setReviewType] = useState<ClinicalReviewType>('comprehensive_intake')
  const [reviewStatus, setReviewStatus] = useState<ClinicalReviewStatus>('reviewed')
  const [summary, setSummary] = useState('')
  const [missingNotes, setMissingNotes] = useState('')
  const [conflictingNotes, setConflictingNotes] = useState('')
  const [verifiedNotes, setVerifiedNotes] = useState('')
  const [requestedInfo, setRequestedInfo] = useState('')
  const [observations, setObservations] = useState<ObservationDraft[]>([
    {
      category: 'pulmonary_vitals',
      observationText: '',
      clinicalInterpretation: '',
    },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successReview, setSuccessReview] = useState<ClinicalReviewItem | null>(null)
  const [openDecisionModal, setOpenDecisionModal] = useState(false)

  const navItems = getClinicalNav(isBn)

  const handleAddObservation = () => {
    setObservations((prev) => [
      ...prev,
      {
        category: 'general',
        observationText: '',
        clinicalInterpretation: '',
      },
    ])
  }

  const handleRemoveObservation = (index: number) => {
    setObservations((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleObservationChange = (
    index: number,
    field: keyof ObservationDraft,
    value: string
  ) => {
    setObservations((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    )
  }

  const handleSaveReview = async (proceedToDecision: boolean = false) => {
    setError(null)
    if (summary.trim().length < 5) {
      setError(
        isBn
          ? 'ক্লিনিক্যাল পর্যালোচনা সারাংশ প্রদান করুন (ন্যূনতম ৫ অক্ষর)।'
          : 'Please provide a clinical review summary (minimum 5 characters).'
      )
      return
    }

    const validObservations = observations.filter((o) => o.observationText.trim().length >= 3)

    setIsSubmitting(true)
    try {
      const result = await recordClinicalReviewAction({
        patientId: p.id,
        facilityId: p.primaryFacilityId,
        reviewType,
        reviewStatus,
        summary: summary.trim(),
        missingInformationNotes: missingNotes.trim() || undefined,
        conflictingInformationNotes: conflictingNotes.trim() || undefined,
        verifiedInformationNotes: verifiedNotes.trim() || undefined,
        requestedInformation: requestedInfo.trim() || undefined,
        observations: validObservations.length > 0 ? validObservations : undefined,
      })

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to record clinical review')
      }

      setSuccessReview(result.data)

      if (proceedToDecision) {
        setOpenDecisionModal(true)
      } else {
        router.push(`/clinical/patients/${p.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving review.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href={`/clinical/patients/${p.id}`} className="flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            {isBn ? 'প্রোফাইলে ফিরুন' : 'Back to Profile'}
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-medium text-foreground">{rT.title}</span>
        </div>

        <PageHeader
          title={rT.title}
          description={rT.subtitle}
        />

        {/* Patient Reference Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2 font-bold text-foreground">
              <span>{p.fullName}</span>
              <span className="font-mono text-xs font-normal text-muted-foreground">({p.patientId})</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {p.approximateAge || 60}y / {p.gender} • {profile.identity.primaryFacilityName}
            </div>
          </div>
          {profile.lungHealthAndExposures.hasHemoptysis && (
            <Badge variant="destructive" className="gap-1 animate-pulse text-xs font-semibold">
              <AlertTriangle className="size-3" />
              {isBn ? 'জরুরি হেমোপটিসিস রিপোর্ট' : 'ACTIVE HEMOPTYSIS REPORTED'}
            </Badge>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Review Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{rT.provenanceHeading}</CardTitle>
              <CardDescription>
                {isBn
                  ? 'রোগীর পর্যালোচনার ধরন ও বর্তমান অনুসন্ধানের অবস্থা নির্ধারণ করুন।'
                  : 'Specify the clinical review category and evaluation status.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground">
                  {isBn ? 'পর্যালোচনার ধরন' : 'Review Type'}
                </label>
                <select
                  value={reviewType}
                  onChange={(e) => setReviewType(e.target.value as ClinicalReviewType)}
                  className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="comprehensive_intake">Comprehensive Intake Review</option>
                  <option value="risk_evaluation">Lung Cancer Risk Evaluation</option>
                  <option value="screening_eligibility">Screening Eligibility Review</option>
                  <option value="symptom_triage">Symptom Triage Escalation</option>
                  <option value="follow_up">Longitudinal Follow-up Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground">
                  {isBn ? 'পর্যালোচনার অবস্থা' : 'Review Status'}
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as ClinicalReviewStatus)}
                  className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="reviewed">Reviewed & Verified</option>
                  <option value="under_review">Under Active Review</option>
                  <option value="info_required">Additional Information Required</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Missing & Conflicting Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                {isBn ? 'তথ্য ঘাটতি ও দ্বন্দ্বমূলক পর্যবেক্ষণ' : 'Clinical Reconciliation & Gap Analysis'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {rT.missingNotesLabel}
                </label>
                <textarea
                  rows={2}
                  value={missingNotes}
                  onChange={(e) => setMissingNotes(e.target.value)}
                  placeholder={rT.missingNotesPlaceholder}
                  className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">
                  {rT.conflictingNotesLabel}
                </label>
                <textarea
                  rows={2}
                  value={conflictingNotes}
                  onChange={(e) => setConflictingNotes(e.target.value)}
                  placeholder={rT.conflictingNotesPlaceholder}
                  className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">
                  {rT.verifiedNotesLabel}
                </label>
                <textarea
                  rows={2}
                  value={verifiedNotes}
                  onChange={(e) => setVerifiedNotes(e.target.value)}
                  placeholder={rT.verifiedNotesPlaceholder}
                  className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">
                  {rT.requestedInfoLabel}
                </label>
                <textarea
                  rows={2}
                  value={requestedInfo}
                  onChange={(e) => setRequestedInfo(e.target.value)}
                  placeholder={rT.requestedInfoPlaceholder}
                  className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Observations & Interpretation */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{rT.observationsHeading}</CardTitle>
                <CardDescription>
                  {isBn
                    ? 'পালমোনারি ভাইটালস, উপসর্গ বা ক্ষতিকর উপাদানের সুনির্দিষ্ট পর্যবেক্ষণ লিপিবদ্ধ করুন।'
                    : 'Document objective pulmonary observations, auscultation findings, or imaging interpretation.'}
                </CardDescription>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={handleAddObservation} className="gap-1.5 text-xs">
                <Plus className="size-3.5" />
                {rT.addObservation}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {observations.map((obs, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <select
                      value={obs.category}
                      onChange={(e) =>
                        handleObservationChange(idx, 'category', e.target.value as ClinicalObservationCategory)
                      }
                      className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="pulmonary_vitals">Pulmonary Vitals & Auscultation</option>
                      <option value="symptom_severity">Symptom Severity & Progression</option>
                      <option value="exposure_risk">Occupational & Biomass Exposure</option>
                      <option value="radiology_finding">Radiology / Imaging Finding</option>
                      <option value="general">General Clinical Observation</option>
                    </select>
                    {observations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveObservation(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={obs.observationText}
                      onChange={(e) => handleObservationChange(idx, 'observationText', e.target.value)}
                      placeholder="Observation details (e.g. Bilateral expiratory wheezing, SpO2 95% on room air)..."
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={obs.clinicalInterpretation || ''}
                      onChange={(e) => handleObservationChange(idx, 'clinicalInterpretation', e.target.value)}
                      placeholder="Clinical interpretation (e.g. Signs consistent with COPD overlap)..."
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Overarching Summary & Submit */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{rT.summaryLabel}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder={rT.summaryPlaceholder}
                className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />

              <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => handleSaveReview(false)}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {rT.saveReview}
                </Button>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSaveReview(true)}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <FileText className="size-4" />
                  )}
                  {rT.saveAndDocumentDecision}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Record Decision Modal if proceeding directly */}
      {openDecisionModal && successReview && (
        <RecordDecisionModal
          isOpen={openDecisionModal}
          onClose={() => {
            setOpenDecisionModal(false)
            router.push(`/clinical/patients/${p.id}`)
          }}
          clinicalReviewId={successReview.id}
          patientId={p.id}
          patientName={p.fullName}
          onSuccess={() => {
            router.push(`/clinical/patients/${p.id}`)
          }}
        />
      )}
    </DashboardLayout>
  )
}
