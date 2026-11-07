'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Copy,
  Check,
  Edit3,
  Printer,
  ShieldCheck,
  ArrowLeft,
  Building2,
  UserCheck,
  Calendar,
  Phone,
  MapPin,
  Clock,
  HeartHandshake,
  AlertTriangle,
  Activity,
  Stethoscope,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/i18n'
import { verifyPatientAction, linkAccountAction } from '@/modules/patients/actions'
import { maskPhoneNumber } from '@/modules/patients/patient-id'
import type { Patient, PatientVerificationStatus } from '@/modules/patients/types'
import { getHealthcareWorkerNav } from '@/modules/healthcare-worker/components/worker-navigation'
import { InitiateAssessmentModal } from '@/modules/healthcare-worker/components/initiate-assessment-modal'

interface PatientProfileClientProps {
  initialPatient: Patient
}

export function PatientProfileClient({ initialPatient }: PatientProfileClientProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.patients

  const [patient, setPatient] = useState<Patient>(initialPatient)
  const [copiedId, setCopiedId] = useState(false)

  // Verification Dialog State
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [newVerifyStatus, setNewVerifyStatus] = useState<PatientVerificationStatus>(
    patient.verificationStatus
  )
  const [verifySource, setVerifySource] = useState(patient.verificationSource || 'national_id_card')
  const [isVerifying, setIsVerifying] = useState(false)

  // Account Link Dialog State
  const [linkOpen, setLinkOpen] = useState(false)
  const [userProfileIdInput, setUserProfileIdInput] = useState('')
  const [isLinking, setIsLinking] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)

  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false)
  const workerNav = getHealthcareWorkerNav(isBn)

  const handleCopyId = () => {
    navigator.clipboard.writeText(patient.patientId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleUpdateVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    try {
      const res = await verifyPatientAction(patient.id, newVerifyStatus, verifySource)
      if (res.success && res.data) {
        setPatient(res.data)
        setVerifyOpen(false)
      }
    } catch {
      // optimistic update for preview
      setPatient((prev) => ({
        ...prev,
        verificationStatus: newVerifyStatus,
        verificationSource: verifySource,
      }))
      setVerifyOpen(false)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfileIdInput.trim()) {
      setLinkError('Please enter a user profile ID')
      return
    }

    setIsLinking(true)
    setLinkError(null)

    try {
      const res = await linkAccountAction({
        patientId: patient.id,
        userProfileId: userProfileIdInput.trim(),
        verificationMethod: 'admin_link',
      })
      if (res.success && res.data) {
        setPatient(res.data)
        setLinkOpen(false)
      } else {
        setLinkError(res.error || 'Failed to link account')
      }
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'Linking failed')
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <DashboardLayout
      workspaceName={isBn ? 'কমিউনিটি স্বাস্থ্যকর্মী ওয়ার্কস্পেস' : 'Community Health Worker Workspace'}
      workspaceBadge={<Badge variant="secondary" size="sm">{isBn ? 'ঢাকা দক্ষিণ বিভাগ' : 'Dhaka South Division'}</Badge>}
      userName="Tania Akhter"
      userRole={isBn ? 'কমিউনিটি স্বাস্থ্য বিশেষজ্ঞ' : 'Community Health Specialist (CHW)'}
      navItems={workerNav}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Top Action Bar */}
        <div className="print:hidden flex items-center justify-between">
          <Link
            href="/healthcare-worker/patients"
            className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'text-xs text-muted-foreground' })}
          >
            <ArrowLeft className="size-3.5 mr-1" />
            <span>{t.profile.backToRegistry}</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsAssessmentModalOpen(true)}
              className="text-xs"
            >
              <Activity className="size-3.5 mr-1.5" />
              <span>{isBn ? 'মূল্যায়ন শুরু' : 'Start Assessment'}</span>
            </Button>
            <Link
              href={`/healthcare-worker/patients/${patient.id}/health-record`}
              className={buttonVariants({ variant: 'outline', size: 'sm', className: 'text-xs text-primary border-primary/30 hover:bg-primary/5' })}
            >
              <Activity className="size-3.5 mr-1.5" />
              <span>{isBn ? 'স্বাস্থ্য রেকর্ড' : 'Health Record'}</span>
            </Link>
            <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs">
              <Printer className="size-3.5 mr-1.5" />
              <span>{t.profile.printCardBtn}</span>
            </Button>
            <Link
              href={`/healthcare-worker/patients/${patient.id}/edit`}
              className={buttonVariants({ variant: 'default', size: 'sm', className: 'text-xs' })}
            >
              <Edit3 className="size-3.5 mr-1.5" />
              <span>{t.profile.editBtn}</span>
            </Link>
          </div>
        </div>

        {/* Merged Record Warning Banner */}
        {patient.status === 'merged' && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="size-5 shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">
              {t.profile.mergedNotice.replace('{id}', patient.mergedIntoPatientId || 'surviving record')}
            </p>
          </div>
        )}

        {/* 1. Primary Patient ID Card */}
        <Card className="border-border/80 shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 sm:p-6 border-b border-border/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {t.profile.patientIdBadge}
                  </span>
                  <div className="flex items-center gap-1 bg-background border border-primary/30 px-2.5 py-0.5 rounded-full">
                    <span className="font-mono text-xs sm:text-sm font-extrabold text-primary">
                      {patient.patientId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                      title={t.profile.copyId}
                    >
                      {copiedId ? (
                        <Check className="size-3 text-emerald-600" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {patient.fullName}
                </h1>

                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="size-3.5" />
                  <span>
                    {isBn ? 'নিবন্ধন তারিখ' : 'Registered'}:{' '}
                    {new Date(patient.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </p>
              </div>

              {/* Badges & Verification Action */}
              <div className="flex flex-col sm:items-end gap-2">
                <div className="flex flex-wrap gap-2">
                  {patient.verificationStatus === 'verified' ? (
                    <Badge variant="default" className="bg-emerald-600 text-white text-xs px-2.5 py-0.5">
                      <ShieldCheck className="size-3.5 mr-1" />
                      <span>{t.profile.verifiedBadge}</span>
                    </Badge>
                  ) : patient.verificationStatus === 'partially_verified' ? (
                    <Badge variant="default" className="bg-amber-500 text-white text-xs px-2.5 py-0.5">
                      <span>{t.profile.partiallyVerifiedBadge}</span>
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-muted text-muted-foreground text-xs px-2.5 py-0.5">
                      <span>{t.profile.unverifiedBadge}</span>
                    </Badge>
                  )}

                  {patient.accountAssociationStatus === 'linked' ? (
                    <Badge variant="outline" className="text-xs text-primary border-primary/30">
                      <UserCheck className="size-3.5 mr-1" />
                      <span>{t.profile.accountLinkedBadge}</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      <span>{t.profile.accountUnlinkedBadge}</span>
                    </Badge>
                  )}
                </div>

                <div className="print:hidden flex items-center gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVerifyOpen(true)}
                    className="text-xs h-7 text-primary hover:text-primary"
                  >
                    <ShieldCheck className="size-3 mr-1" />
                    <span>{t.profile.verifyBtn}</span>
                  </Button>
                  {patient.accountAssociationStatus !== 'linked' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLinkOpen(true)}
                      className="text-xs h-7 text-muted-foreground hover:text-foreground"
                    >
                      <UserCheck className="size-3 mr-1" />
                      <span>{t.profile.linkAccountBtn}</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Phase 1.7: Longitudinal Health Information Callout Card */}
        <Card className="border-primary/40 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Stethoscope className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm sm:text-base">
                {dict.healthRecords?.title || 'Patient Health Record & Clinical Profile'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {dict.healthRecords?.subtitle || 'Medical conditions, medications, smoking pack-years, vitals, and clinician ledger.'}
              </p>
            </div>
          </div>
          <Link
            href={`/healthcare-worker/patients/${patient.id}/health-record`}
            className={buttonVariants({ variant: 'default', size: 'sm', className: 'font-semibold shrink-0 text-xs' })}
          >
            <Activity className="size-3.5 mr-1.5" />
            <span>{isBn ? 'সম্পূর্ণ স্বাস্থ্য রেকর্ড দেখুন' : 'View Full Health Record'}</span>
          </Link>
        </Card>

        {/* 2. Demographic & Medical Snapshot Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Demographics Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                {t.profile.demographicsCard}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">{t.registration.ageLabel}:</span>
                <span className="font-semibold text-foreground">
                  {patient.approximateAge || (patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : '—')}{' '}
                  {isBn ? 'বছর' : 'years'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">{t.registration.dobLabel}:</span>
                <span className="font-semibold text-foreground">{patient.dateOfBirth || t.profile.notProvided}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">{t.registration.genderLabel}:</span>
                <span className="font-semibold text-foreground capitalize">{patient.gender}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">{t.registration.languageLabel}:</span>
                <span className="font-semibold text-foreground">
                  {patient.preferredLanguage === 'bn' ? 'বাংলা (Bangla)' : 'English'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Phone className="size-4 text-primary" />
                {t.profile.contactCard}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">{t.registration.phoneLabel}:</span>
                <span className="font-semibold font-mono text-foreground">
                  {maskPhoneNumber(patient.phoneNumber)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">{t.registration.emailLabel}:</span>
                <span className="font-semibold text-foreground">{patient.email || t.profile.notProvided}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">{t.registration.nidLabel}:</span>
                <span className="font-semibold font-mono text-foreground">
                  {patient.nidNumber || t.profile.notProvided}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Address & Emergency Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Residential Address Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                {t.profile.addressCard}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">{t.registration.divisionLabel}:</span>
                <span className="font-semibold text-foreground">{patient.addressDivision || t.profile.notProvided}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">{t.registration.districtLabel}:</span>
                <span className="font-semibold text-foreground">{patient.addressDistrict || t.profile.notProvided}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">{t.registration.upazilaLabel}:</span>
                <span className="font-semibold text-foreground">{patient.addressUpazila || t.profile.notProvided}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">{t.registration.addressDetailsLabel}:</span>
                <span className="font-semibold text-foreground">{patient.addressDetails || t.profile.notProvided}</span>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <HeartHandshake className="size-4 text-primary" />
                {t.profile.emergencyCard}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">{t.registration.emergencyNameLabel}:</span>
                <span className="font-semibold text-foreground">
                  {patient.emergencyContactName || t.profile.notProvided}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">{t.registration.emergencyPhoneLabel}:</span>
                <span className="font-semibold font-mono text-foreground">
                  {patient.emergencyContactPhone ? maskPhoneNumber(patient.emergencyContactPhone) : t.profile.notProvided}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">{t.registration.emergencyRelationLabel}:</span>
                <span className="font-semibold text-foreground">
                  {patient.emergencyContactRelation || t.profile.notProvided}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. Facility Relationships Card */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              {t.profile.facilityCard}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    {patient.primaryFacilityId === 'facility-dhaka-central'
                      ? 'National Institute of Diseases of the Chest & Hospital (NIDCH)'
                      : patient.primaryFacilityId}
                  </span>
                  <Badge variant="default" className="text-[10px] px-2 py-0 bg-primary text-primary-foreground">
                    {t.profile.facilityPrimary}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Mohakhali, Dhaka • Active Patient Registry Membership
                </p>
              </div>
              <span className="text-xs text-muted-foreground font-mono">Consented</span>
            </div>
          </CardContent>
        </Card>

        {/* 5. Identity Audit Trail */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              {t.profile.auditCard}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3 flex items-start justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground">patient.created</span>
                  <p className="text-[11px] text-muted-foreground">
                    Identity record initialized with Lungent Patient ID: {patient.patientId}
                  </p>
                </div>
                <span className="text-muted-foreground font-mono text-[11px]">
                  {new Date(patient.createdAt).toLocaleDateString()}
                </span>
              </div>

              {patient.verificationStatus !== 'unverified' && (
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 flex items-start justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">patient.verified</span>
                    <p className="text-[11px] text-muted-foreground">
                      Verification source: {patient.verificationSource || 'national_id_card'}
                    </p>
                  </div>
                  <span className="text-muted-foreground font-mono text-[11px]">
                    {patient.verifiedAt ? new Date(patient.verifiedAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verify Dialog */}
      <Dialog
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        title={t.profile.verifyBtn}
        description={isBn ? 'রোগীর পরিচয় নথিপত্র অনুযায়ী যাচাই করুন' : 'Update verified status based on identity documentation.'}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setVerifyOpen(false)}>
              {t.registration.cancelBtn}
            </Button>
            <Button size="sm" onClick={handleUpdateVerification} disabled={isVerifying}>
              {isVerifying ? 'Saving...' : 'Save Verification'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Verification Status</Label>
            <Select
              value={newVerifyStatus}
              onChange={(e) => setNewVerifyStatus(e.target.value as PatientVerificationStatus)}
              options={[
                { value: 'verified', label: 'Verified (Official Document Match)' },
                { value: 'partially_verified', label: 'Partially Verified (Attested by Worker)' },
                { value: 'unverified', label: 'Unverified (Self-Reported Only)' },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Verification Documentation Source</Label>
            <Select
              value={verifySource}
              onChange={(e) => setVerifySource(e.target.value)}
              options={[
                { value: 'national_id_card', label: 'National ID Card (NID)' },
                { value: 'birth_registration_cert', label: 'Birth Registration Certificate' },
                { value: 'community_intake', label: 'Community Health Worker In-Person Attestation' },
                { value: 'clinical_registration', label: 'Hospital Registration Record' },
              ]}
            />
          </div>
        </div>
      </Dialog>

      {/* Account Link Dialog */}
      <Dialog
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        title={t.accountLink.title}
        description={t.accountLink.subtitle}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setLinkOpen(false)}>
              {t.registration.cancelBtn}
            </Button>
            <Button size="sm" onClick={handleLinkAccount} disabled={isLinking}>
              {isLinking ? 'Linking...' : t.accountLink.linkBtn}
            </Button>
          </>
        }
      >
        <div className="space-y-3 py-2">
          <Label className="text-xs font-medium">{t.accountLink.userProfileIdLabel}</Label>
          <Input
            placeholder={t.accountLink.userProfileIdPlaceholder}
            value={userProfileIdInput}
            onChange={(e) => setUserProfileIdInput(e.target.value)}
          />
          {linkError && <p className="text-xs text-destructive">{linkError}</p>}
        </div>
      </Dialog>

      <InitiateAssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        initialPatientId={patient.id}
        patients={[patient]}
      />
    </DashboardLayout>
  )
}
