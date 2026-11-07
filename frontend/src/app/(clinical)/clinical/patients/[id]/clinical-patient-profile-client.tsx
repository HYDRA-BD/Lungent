'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  User,
  ShieldAlert,
  AlertTriangle,
  Stethoscope,
  CalendarCheck,
  FileText,
  FileEdit,
  History,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Flame,
  Factory,
  Cigarette,
  Share2,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
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
import { RecordDecisionModal } from '@/modules/clinical/components/record-decision-modal'
import { AmendDecisionModal } from '@/modules/clinical/components/amend-decision-modal'
import { CreateFollowUpModal } from '@/modules/clinical/components/create-follow-up-modal'
import { RiskExecutionDialog } from '@/modules/risk-estimation/components'
import { ScreeningEvaluationDialog } from '@/modules/screening/components'
import { TriageEvaluationDialog } from '@/modules/triage/components'
import {
  EnvironmentalContextCard,
  FacilityAccessibilityCard,
  OpenMeteoDashboard,
} from '@/modules/environmental/components'
import { CreateReferralDialog } from '@/modules/referrals/components'
import type {
  EnvironmentalContextSummary,
  FacilityAccessibilityContext,
} from '@/modules/environmental/types'
import type {
  ConsolidatedClinicalProfile,
  ClinicalDecisionItem,
} from '@/modules/clinical/types'

interface ClinicalPatientProfileClientProps {
  profile: ConsolidatedClinicalProfile
  envSummary?: EnvironmentalContextSummary
  facilityAccessibility?: FacilityAccessibilityContext
}

export function ClinicalPatientProfileClient({
  profile: initialProfile,
  envSummary,
  facilityAccessibility,
}: ClinicalPatientProfileClientProps) {
  const { locale, dict } = useLanguage()
  const isBn = locale === 'bn'
  const pT = dict.clinicalWorkspace.profile
  const dT = dict.clinicalWorkspace.decision

  const [profile, setProfile] = useState<ConsolidatedClinicalProfile>(initialProfile)
  const [activeTab, setActiveTab] = useState<'identity' | 'medical' | 'lungHealth' | 'assessments' | 'clinicalHistory'>(
    'lungHealth'
  )
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false)
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false)
  const [decisionToAmend, setDecisionToAmend] = useState<ClinicalDecisionItem | null>(null)

  const navItems = getClinicalNav(isBn)
  const patient = profile.identity.patient
  const latestReview = profile.clinicalHistory.reviews[0]
  const reviewIdForDecision = latestReview ? latestReview.id : `rev-adhoc-${patient.id}`

  const handleDecisionSaved = (newDecision: ClinicalDecisionItem) => {
    setProfile((prev) => ({
      ...prev,
      clinicalHistory: {
        ...prev.clinicalHistory,
        decisions: [newDecision, ...prev.clinicalHistory.decisions],
      },
    }))
  }

  const handleDecisionAmended = (amended: ClinicalDecisionItem) => {
    setProfile((prev) => ({
      ...prev,
      clinicalHistory: {
        ...prev.clinicalHistory,
        decisions: prev.clinicalHistory.decisions.map((d) => (d.id === amended.id ? amended : d)),
      },
    }))
  }

  const renderProvenanceBadge = (source?: string, verified?: boolean) => {
    if (verified || source === 'clinician_verified') {
      return (
        <Badge variant="success" className="text-[10px] gap-1 font-medium">
          <CheckCircle2 className="size-2.5" />
          {pT.verifiedBadge}
        </Badge>
      )
    }
    if (source === 'worker_collected' || source === 'chw_intake') {
      return (
        <Badge variant="default" className="text-[10px] font-medium">
          {pT.workerBadge}
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">
        {pT.patientBadge}
      </Badge>
    )
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
        {/* Navigation Breadcrumb & Back */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/clinical/patients" className="flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            {isBn ? 'রোগী তালিকায় ফিরুন' : 'Back to Patient Directory'}
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-medium text-foreground">{patient.fullName}</span>
        </div>

        {/* Patient Header Summary Card */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <User className="size-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground sm:text-2xl">{patient.fullName}</h1>
                  <Badge variant="outline" className="font-mono text-xs">
                    {patient.patientId}
                  </Badge>
                  {profile.lungHealthAndExposures.hasHemoptysis && (
                    <Badge variant="destructive" className="gap-1 animate-pulse font-semibold text-xs">
                      <AlertTriangle className="size-3" />
                      {isBn ? 'জরুরি হেমোপটিসিস' : 'HEMOPTYSIS ALERT'}
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    {isBn ? 'বয়স / লিঙ্গ: ' : 'Age / Gender: '}
                    <strong className="text-foreground">
                      {patient.approximateAge || 60}y / {patient.gender}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    {isBn ? 'স্বাস্থ্যকেন্দ্র: ' : 'Facility: '}
                    <strong className="text-foreground">{profile.identity.primaryFacilityName}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    {isBn ? 'দায়িত্বপ্রাপ্ত চিকিৎসক: ' : 'Clinician: '}
                    <strong className="text-foreground">{profile.identity.assignedClinicianName}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/clinical/patients/${patient.id}/review`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Stethoscope className="size-4" />
                  {pT.actionReview}
                </Button>
              </Link>
              <Button
                variant="default"
                size="sm"
                className="gap-1.5"
                onClick={() => setIsDecisionModalOpen(true)}
              >
                <FileText className="size-4" />
                {pT.actionRecordDecision}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setIsFollowUpModalOpen(true)}
              >
                <CalendarCheck className="size-4" />
                {pT.actionScheduleFollowUp}
              </Button>
              <CreateReferralDialog
                patientId={patient.id}
                patientName={patient.fullName}
                patientCanonicalId={patient.patientId}
                patientPhone={patient.phoneNumber || undefined}
                defaultPriority={profile.lungHealthAndExposures.hasHemoptysis ? 'urgent_2ww' : 'priority'}
                clinicalReasonHint={
                  profile.lungHealthAndExposures.hasHemoptysis
                    ? 'Urgent 2-Week-Wait evaluation for unexplained hemoptysis'
                    : undefined
                }
                triggerButton={
                  <Button variant="outline" size="sm" className="gap-1.5 border-primary/40 hover:bg-primary/5">
                    <Share2 className="size-4 text-primary" />
                    {isBn ? 'রেফারেল করুন' : 'Create Referral'}
                  </Button>
                }
              />
            </div>
          </div>
        </div>

        {/* Red Flag Warning Banner */}
        {profile.lungHealthAndExposures.hasHemoptysis && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive dark:bg-destructive/15">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div className="text-sm font-medium">
              <span className="font-bold">{isBn ? 'সতর্কতা: ' : 'CRITICAL SAFETY ALERT: '}</span>
              {pT.redFlagWarning}
            </div>
          </div>
        )}

        {/* 5-Section Structured Tabs Navigation */}
        <div className="flex flex-wrap border-b border-border text-sm font-medium">
          <button
            onClick={() => setActiveTab('identity')}
            className={`border-b-2 px-4 py-2.5 transition-colors ${
              activeTab === 'identity'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {pT.tabIdentity}
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            className={`border-b-2 px-4 py-2.5 transition-colors ${
              activeTab === 'medical'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {pT.tabMedical}
          </button>
          <button
            onClick={() => setActiveTab('lungHealth')}
            className={`border-b-2 px-4 py-2.5 transition-colors ${
              activeTab === 'lungHealth'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {pT.tabLungHealth}
          </button>
          <button
            onClick={() => setActiveTab('assessments')}
            className={`border-b-2 px-4 py-2.5 transition-colors ${
              activeTab === 'assessments'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {pT.tabAssessments}
          </button>
          <button
            onClick={() => setActiveTab('clinicalHistory')}
            className={`border-b-2 px-4 py-2.5 transition-colors ${
              activeTab === 'clinicalHistory'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {pT.tabClinicalHistory}
          </button>
        </div>

        {/* Tab A: Patient Identity & Facility Association */}
        {activeTab === 'identity' && (
          <Card>
            <CardHeader>
              <CardTitle>{pT.tabIdentity}</CardTitle>
              <CardDescription>
                {isBn
                  ? 'রোগীর মৌলিক পরিচিতি এবং প্রাতিষ্ঠানিক সংযুক্তি।'
                  : 'Centralized patient demographics and facility association.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">Lungent Patient ID</span>
                <div className="font-mono font-semibold text-foreground">{patient.patientId}</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">{isBn ? 'পূর্ণ নাম' : 'Full Name'}</span>
                <div className="font-semibold text-foreground">{patient.fullName}</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">{isBn ? 'জন্ম তারিখ / বয়স' : 'DOB / Age'}</span>
                <div className="text-sm font-medium text-foreground">
                  {patient.dateOfBirth || '—'} ({patient.approximateAge || 60} yrs)
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">{isBn ? 'লিঙ্গ' : 'Gender'}</span>
                <div className="text-sm font-medium text-foreground capitalize">{patient.gender}</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">{isBn ? 'ফোন নম্বর' : 'Primary Phone'}</span>
                <div className="text-sm font-medium text-foreground">{patient.phoneNumber || '—'}</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">{isBn ? 'জেলা / ঠিকানা' : 'District / Address'}</span>
                <div className="text-sm font-medium text-foreground">
                  {patient.addressDistrict || 'Dhaka'}, {patient.addressUpazila || 'Sadar'}
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">{isBn ? 'প্রাথমিক স্বাস্থ্যকেন্দ্র' : 'Primary Facility'}</span>
                <div className="text-sm font-medium text-foreground">{profile.identity.primaryFacilityName}</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">{isBn ? 'নিবন্ধনের তারিখ' : 'Registered On'}</span>
                <div className="text-sm font-medium text-foreground">{patient.createdAt.slice(0, 10)}</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">{isBn ? 'দায়িত্বপ্রাপ্ত চিকিৎসক' : 'Assigned Clinician'}</span>
                <div className="text-sm font-medium text-foreground">{profile.identity.assignedClinicianName}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab B: Medical History */}
        {activeTab === 'medical' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {isBn ? 'দীর্ঘমেয়াদী রোগ ও চিকিৎসার ইতিহাস' : 'Medical Conditions & Diagnoses'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isBn ? 'রোগের নাম' : 'Condition'}</TableHead>
                      <TableHead>{isBn ? 'ক্যাটাগরি' : 'Category'}</TableHead>
                      <TableHead>{isBn ? 'অবস্থা' : 'Status'}</TableHead>
                      <TableHead>{isBn ? 'চিকিৎসা সারাংশ' : 'Treatment Summary'}</TableHead>
                      <TableHead>{isBn ? 'তথ্যসূত্র' : 'Provenance'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profile.medicalHistory.conditions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-6 text-center text-xs text-muted-foreground">
                          {isBn ? 'কোনো পূর্ববর্তী রোগ লিপিবদ্ধ নেই।' : 'No documented medical conditions.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      profile.medicalHistory.conditions.map((mc) => (
                        <TableRow key={mc.id}>
                          <TableCell className="font-medium text-foreground">
                            {mc.conditionName}
                            {mc.isPrimaryRespiratory && (
                              <Badge variant="outline" className="ml-2 text-[10px]">
                                Respiratory
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs capitalize">{mc.conditionCategory}</TableCell>
                          <TableCell>
                            <Badge variant={mc.clinicalStatus === 'active' ? 'default' : 'outline'} className="text-xs">
                              {mc.clinicalStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{mc.treatmentSummary || '—'}</TableCell>
                          <TableCell>{renderProvenanceBadge(mc.dataSource, mc.verificationStatus === 'verified')}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">{isBn ? 'বর্তমান ঔষধ' : 'Active Medications'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {profile.medicalHistory.medications.length === 0 ? (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      {isBn ? 'কোনো ঔষধ নেই।' : 'No documented medications.'}
                    </div>
                  ) : (
                    profile.medicalHistory.medications.map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                        <div>
                          <div className="text-xs font-semibold text-foreground">{m.medicationName}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {m.dosageInstructions || m.medicationType}
                          </div>
                        </div>
                        {renderProvenanceBadge(m.dataSource, m.verificationStatus === 'verified')}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">{isBn ? 'অ্যালার্জি ও পার্শ্বপ্রতিক্রিয়া' : 'Allergies'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {profile.medicalHistory.allergies.length === 0 ? (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      {isBn ? 'কোনো অ্যালার্জির তথ্য নেই।' : 'No known allergies recorded.'}
                    </div>
                  ) : (
                    profile.medicalHistory.allergies.map((a) => (
                      <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                        <div>
                          <div className="text-xs font-semibold text-foreground">{a.allergenName}</div>
                          <div className="text-[11px] text-muted-foreground">{a.reactionDescription || a.severity}</div>
                        </div>
                        <Badge variant="warning" className="text-[10px]">
                          {a.severity}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab C: Lung Health & Risk-Related Factors */}
        {activeTab === 'lungHealth' && (
          <div className="space-y-6">
            {/* Smoking History Card */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Cigarette className="size-5 text-amber-600" />
                <div>
                  <CardTitle className="text-base font-semibold">
                    {isBn ? 'ধূমপানের ইতিহাস ও প্যাক-ইয়ার্স ক্যালকুলেশন' : 'Tobacco & Smoking History'}
                  </CardTitle>
                  <CardDescription>
                    {isBn
                      ? 'ফুসফুসের ক্যান্সার স্ক্রিনিং ও ঝুঁকি নির্ধারণের প্রধান ভিত্তি।'
                      : 'Critical parameter for lung cancer risk estimation and LDCT eligibility.'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div className="rounded-lg border border-border p-3">
                  <span className="text-xs text-muted-foreground">{isBn ? 'ধূমপানের অবস্থা' : 'Smoking Status'}</span>
                  <div className="font-semibold text-foreground capitalize">
                    {profile.lungHealthAndExposures.smoking?.smokingStatus || 'non_smoker'}
                  </div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <span className="text-xs text-muted-foreground">{isBn ? 'প্রতিদিন সিগারেট/বিড়ি' : 'Quantity / Day'}</span>
                  <div className="font-semibold text-foreground">
                    {profile.lungHealthAndExposures.smoking?.cigarettesPerDay || 0} cigarettes/day
                  </div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <span className="text-xs text-muted-foreground">{isBn ? 'ধূমপানের সময়কাল' : 'Duration'}</span>
                  <div className="font-semibold text-foreground">
                    {profile.lungHealthAndExposures.smoking?.yearsSmoked || 0} years
                  </div>
                </div>
                <div className="rounded-lg border border-amber-300 bg-amber-50/50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                    {pT.packYearsLabel}
                  </span>
                  <div className="text-xl font-bold text-amber-700 dark:text-amber-400">
                    {profile.lungHealthAndExposures.packYearsCalculated} pack-years
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environmental & Occupational Exposures */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Flame className="size-5 text-orange-500" />
                  <CardTitle className="text-base font-semibold">
                    {isBn ? 'বায়োমাস ও গৃহস্থালি ধোঁয়ার সংস্পর্শ' : 'Biomass & Environmental Exposure'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.lungHealthAndExposures.environmentalBiomass.length === 0 ? (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      {isBn ? 'কোনো ক্ষতিকর পরিবেশগত সংস্পর্শ লিপিবদ্ধ নেই।' : 'No environmental exposures recorded.'}
                    </div>
                  ) : (
                    profile.lungHealthAndExposures.environmentalBiomass.map((e) => (
                      <div key={e.id} className="rounded-lg border border-border p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground">{e.exposureType}</span>
                          {renderProvenanceBadge(e.dataSource, e.verificationStatus === 'verified')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {e.cookingFuelType ? `Fuel: ${e.cookingFuelType} • ` : ''}
                          {e.durationYears ? `Duration: ${e.durationYears} yrs • ` : ''}
                          Intensity: {e.intensity}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Factory className="size-5 text-zinc-500" />
                  <CardTitle className="text-base font-semibold">
                    {isBn ? 'পেশাগত ক্ষতিকর উপাদানের সংস্পর্শ' : 'Occupational Hazards'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.lungHealthAndExposures.occupationalExposures.length === 0 ? (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      {isBn ? 'কোনো পেশাগত ক্ষতিকর সংস্পর্শ নেই।' : 'No occupational hazards documented.'}
                    </div>
                  ) : (
                    profile.lungHealthAndExposures.occupationalExposures.map((e) => (
                      <div key={e.id} className="rounded-lg border border-border p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground">{e.exposureType}</span>
                          {renderProvenanceBadge(e.dataSource, e.verificationStatus === 'verified')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {e.contextDetails || 'Industrial/welding/shipyard exposure'}
                          {e.durationYears ? ` • ${e.durationYears} yrs` : ''}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Current Respiratory Symptoms */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {isBn ? 'বর্তমান শ্বাসযন্ত্রীয় উপসর্গ ও তীব্রতা' : 'Respiratory Symptoms & Red Flags'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isBn ? 'উপসর্গ' : 'Symptom'}</TableHead>
                      <TableHead>{isBn ? 'তীব্রতা' : 'Severity'}</TableHead>
                      <TableHead>{isBn ? 'স্থিতিকাল' : 'Duration'}</TableHead>
                      <TableHead>{isBn ? 'মন্তব্য' : 'Notes'}</TableHead>
                      <TableHead>{isBn ? 'তথ্যসূত্র' : 'Provenance'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profile.lungHealthAndExposures.symptoms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-6 text-center text-xs text-muted-foreground">
                          {isBn ? 'কোনো সক্রিয় উপসর্গ লিপিবদ্ধ নেই।' : 'No active respiratory symptoms reported.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      profile.lungHealthAndExposures.symptoms.map((s) => {
                        const isRedFlag =
                          s.symptomName.toLowerCase().includes('hemoptysis') ||
                          s.symptomName.toLowerCase().includes('blood')
                        return (
                          <TableRow key={s.id} className={isRedFlag ? 'bg-destructive/5 font-semibold' : ''}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {isRedFlag && <AlertTriangle className="size-4 text-destructive shrink-0" />}
                                <span className={isRedFlag ? 'text-destructive' : 'text-foreground'}>
                                  {s.symptomName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={isRedFlag ? 'destructive' : 'default'} className="text-xs">
                                {s.severity}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              {s.durationWeeks ? `${s.durationWeeks} weeks` : '—'}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{s.notes || '—'}</TableCell>
                            <TableCell>{renderProvenanceBadge(s.dataSource, s.verificationStatus === 'verified')}</TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Vitals & Measurements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {isBn ? 'শারীরিক পরিমাপ ও পালমোনারি ভাইটালস' : 'Pulmonary Vitals & Measurements'}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {profile.lungHealthAndExposures.vitalsAndMeasurements.length === 0 ? (
                  <div className="col-span-full py-4 text-center text-xs text-muted-foreground">
                    {isBn ? 'কোনো পরিমাপ নেই।' : 'No recorded measurements.'}
                  </div>
                ) : (
                  profile.lungHealthAndExposures.vitalsAndMeasurements.map((m) => (
                    <div key={m.id} className="rounded-lg border border-border p-3">
                      <span className="text-xs text-muted-foreground capitalize">
                        {m.measurementType.replace(/_/g, ' ')}
                      </span>
                      <div className="text-base font-bold text-foreground">
                        {m.numericValue} {m.unit || ''}
                      </div>
                      <div className="mt-1">{renderProvenanceBadge(m.dataSource, m.verificationStatus === 'verified')}</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Open-Meteo Air Quality Intelligence Dashboard (Phase 1.16) */}
            {envSummary && <OpenMeteoDashboard initialSummary={envSummary} />}

            {/* Environmental & Atmospheric Context (Phase 1.15) */}
            {envSummary && <EnvironmentalContextCard summary={envSummary} />}

            {/* Regional Healthcare Accessibility Context (Phase 1.15) */}
            {facilityAccessibility && (
              <FacilityAccessibilityCard context={facilityAccessibility} />
            )}
          </div>
        )}

        {/* Tab D: Assessment History */}
        {activeTab === 'assessments' && (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">{pT.tabAssessments}</CardTitle>
                  <CardDescription>
                    {isBn
                      ? 'পূর্ববর্তী স্বয়ংক্রিয় স্ক্রিনিং ও ঝুঁকি মূল্যায়ন ওয়ার্কফ্লো।'
                      : 'Automated risk stratification, screening eligibility, and triage outputs.'}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <RiskExecutionDialog
                    patientId={profile.identity.patient.id}
                    patientName={profile.identity.patient.fullName}
                  />
                  <ScreeningEvaluationDialog
                    patientId={profile.identity.patient.id}
                    patientName={profile.identity.patient.fullName}
                  />
                  <TriageEvaluationDialog
                    patientId={profile.identity.patient.id}
                    patientName={profile.identity.patient.fullName}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isBn ? 'অ্যাসেসমেন্টের ধরণ' : 'Assessment'}</TableHead>
                    <TableHead>{isBn ? 'অ্যালগরিদমের ফলাফল' : 'Algorithmic Result'}</TableHead>
                    <TableHead>{isBn ? 'বর্তমান অবস্থা' : 'Status'}</TableHead>
                    <TableHead>{isBn ? 'জমার তারিখ' : 'Submission Date'}</TableHead>
                    <TableHead>{isBn ? 'চিকিৎসকের সিদ্ধান্ত' : 'Clinician Review'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profile.assessmentHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                        {isBn ? 'কোনো অ্যাসেসমেন্ট হিস্ট্রি নেই।' : 'No assessment history recorded for this patient.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    profile.assessmentHistory.map((asm) => (
                      <TableRow key={asm.id}>
                        <TableCell className="font-semibold text-foreground">
                          {asm.assessmentType.replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold text-foreground">{asm.algorithmicCategory}</div>
                          <div className="text-xs text-muted-foreground">{asm.riskSummary}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {asm.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {asm.submittedAt ? asm.submittedAt.slice(0, 10) : asm.initiatedAt.slice(0, 10)}
                        </TableCell>
                        <TableCell>
                          {asm.hasClinicianDecision ? (
                            <Badge variant="success" className="text-xs">
                              {asm.clinicianDecisionType?.replace(/_/g, ' ') || 'Decided'}
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="text-xs">
                              {asm.clinicalReviewStatus}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Tab E: Clinical History, Documented Decisions & Amendments */}
        {activeTab === 'clinicalHistory' && (
          <div className="space-y-6">
            {/* Documented Clinical Decisions Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {isBn ? 'অনুমোদিত ক্লিনিক্যাল সিদ্ধান্ত' : 'Documented Clinical Decisions'}
                  </CardTitle>
                  <CardDescription>
                    {isBn
                      ? 'চিকিৎসক কর্তৃক চূড়ান্তকৃত সিদ্ধান্ত ও অপরিবর্তনীয় অডিট সংশোধনের রেকর্ড।'
                      : 'Finalized clinician determinations, reasoning, and immutable amendment history.'}
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setIsDecisionModalOpen(true)} className="gap-1.5">
                  <FileText className="size-4" />
                  {isBn ? 'নতুন সিদ্ধান্ত' : 'Document Decision'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.clinicalHistory.decisions.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {isBn ? 'কোনো ক্লিনিক্যাল সিদ্ধান্ত এখনো লিপিবদ্ধ করা হয়নি।' : 'No clinical decisions documented yet.'}
                  </div>
                ) : (
                  profile.clinicalHistory.decisions.map((dec) => (
                    <div key={dec.id} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-xs font-semibold">
                            {dec.decisionType.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                          <Badge variant={dec.status === 'amended' ? 'warning' : 'outline'} className="text-xs">
                            {dec.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {dec.clinicianName} • {dec.createdAt.slice(0, 10)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() => setDecisionToAmend(dec)}
                          >
                            <FileEdit className="size-3" />
                            {isBn ? 'সংশোধন' : 'Amend'}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-xs font-semibold uppercase text-muted-foreground">
                            {dT.rationaleLabel}:
                          </span>
                          <p className="mt-0.5 text-foreground">{dec.rationale}</p>
                        </div>

                        {dec.disagreementWithAutomatedOutput && (
                          <div className="rounded-lg border border-amber-300 bg-amber-50/70 p-3 text-xs dark:border-amber-900 dark:bg-amber-950/20">
                            <span className="font-semibold text-amber-800 dark:text-amber-300">
                              {dT.disagreementReasonLabel}:{' '}
                            </span>
                            <span className="text-amber-900 dark:text-amber-200">
                              {dec.disagreementReason}
                            </span>
                          </div>
                        )}

                        <div>
                          <span className="text-xs font-semibold uppercase text-muted-foreground">
                            {dT.recommendedStepsLabel}:
                          </span>
                          <p className="mt-0.5 whitespace-pre-line text-foreground">
                            {dec.recommendedNextSteps}
                          </p>
                        </div>

                        {dec.referralTarget && (
                          <div className="text-xs text-muted-foreground">
                            <span className="font-semibold">{dT.referralTargetLabel}: </span>
                            <span className="text-foreground">{dec.referralTarget}</span>
                          </div>
                        )}
                      </div>

                      {/* Display Amendment Log if Present */}
                      {dec.amendments && dec.amendments.length > 0 && (
                        <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            <History className="size-3.5 text-primary" />
                            {isBn ? 'অপরিবর্তনীয় সংশোধন অডিট ট্রেইল' : 'Immutable Amendment Audit Trail'}
                          </div>
                          {dec.amendments.map((amd) => (
                            <div key={amd.id} className="text-xs text-muted-foreground border-l-2 border-primary pl-2 py-0.5">
                              <div>
                                <strong>{amd.clinicianName}</strong> amended on {amd.createdAt.slice(0, 10)}:
                              </div>
                              <div className="italic text-foreground">&ldquo;{amd.amendmentReason}&rdquo;</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Prior Clinical Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {isBn ? 'পূর্বে সম্পন্ন পর্যালোচনা' : 'Prior Clinical Reviews'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.clinicalHistory.reviews.length === 0 ? (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    {isBn ? 'কোনো পর্যালোচনা নেই।' : 'No reviews recorded.'}
                  </div>
                ) : (
                  profile.clinicalHistory.reviews.map((r) => (
                    <div key={r.id} className="rounded-lg border border-border p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {r.reviewType.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{r.createdAt.slice(0, 10)}</span>
                      </div>
                      <p className="text-xs text-foreground font-medium">{r.summary}</p>
                      {r.missingInformationNotes && (
                        <div className="text-[11px] text-amber-700 dark:text-amber-400">
                          <strong>Missing:</strong> {r.missingInformationNotes}
                        </div>
                      )}
                      {r.verifiedInformationNotes && (
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                          <strong>Verified:</strong> {r.verifiedInformationNotes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Follow-Up Plans */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {isBn ? 'ফলো-আপ নজরদারি পরিকল্পনা' : 'Follow-Up Surveillance Plans'}
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => setIsFollowUpModalOpen(true)} className="gap-1.5">
                  <CalendarCheck className="size-4" />
                  {isBn ? 'ফলো-আপ শিডিউল' : 'Schedule'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.clinicalHistory.followUpPlans.length === 0 ? (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    {isBn ? 'কোনো ফলো-আপ নির্ধারিত নেই।' : 'No follow-up plans registered.'}
                  </div>
                ) : (
                  profile.clinicalHistory.followUpPlans.map((fp) => (
                    <div key={fp.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <div className="text-xs font-semibold text-foreground">{fp.instructions}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Review Date: {fp.recommendedReviewDate} {fp.notes ? `• ${fp.notes}` : ''}
                        </div>
                      </div>
                      <Badge variant={fp.status === 'completed' ? 'success' : 'default'} className="text-xs">
                        {fp.status}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Open-Meteo Air Quality Intelligence Dashboard (Phase 1.16) */}
            {envSummary && <OpenMeteoDashboard initialSummary={envSummary} />}

            {/* Environmental & Atmospheric Context (Phase 1.15) */}
            {envSummary && <EnvironmentalContextCard summary={envSummary} />}

            {/* Regional Healthcare Accessibility Context (Phase 1.15) */}
            {facilityAccessibility && (
              <FacilityAccessibilityCard context={facilityAccessibility} />
            )}
          </div>
        )}
      </div>

      {/* Record Decision Modal */}
      {isDecisionModalOpen && (
        <RecordDecisionModal
          isOpen={isDecisionModalOpen}
          onClose={() => setIsDecisionModalOpen(false)}
          clinicalReviewId={reviewIdForDecision}
          patientId={patient.id}
          patientName={patient.fullName}
          onSuccess={handleDecisionSaved}
        />
      )}

      {/* Amend Decision Modal */}
      {decisionToAmend && (
        <AmendDecisionModal
          isOpen={!!decisionToAmend}
          onClose={() => setDecisionToAmend(null)}
          decision={decisionToAmend}
          onSuccess={handleDecisionAmended}
        />
      )}

      {/* Create Follow-Up Modal */}
      {isFollowUpModalOpen && (
        <CreateFollowUpModal
          isOpen={isFollowUpModalOpen}
          onClose={() => setIsFollowUpModalOpen(false)}
          patientId={patient.id}
          patientName={patient.fullName}
          clinicalReviewId={reviewIdForDecision}
          onSuccess={(plan) =>
            setProfile((prev) => ({
              ...prev,
              clinicalHistory: {
                ...prev.clinicalHistory,
                followUpPlans: [plan, ...prev.clinicalHistory.followUpPlans],
              },
            }))
          }
        />
      )}
    </DashboardLayout>
  )
}
