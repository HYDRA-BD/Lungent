'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Building2,
  Send,
  UserCheck,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { RadioGroup } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { useLanguage } from '@/i18n'
import {
  searchBeforeRegisterAction,
  registerPatientAction,
} from '@/modules/patients/actions'
import { maskPhoneNumber } from '@/modules/patients/patient-id'
import type {
  Patient,
  PatientGender,
  CreatePatientInput,
} from '@/modules/patients/types'
import { createPatientSchema } from '@/modules/patients/validation'
import { cn } from '@/lib/utils'

export function RegisterClient() {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.patients

  // Step 1: Search Verification / Identity Match check
  // Step 2: Patient Registration Form
  // Step 3: Success Confirmation with assigned Patient ID
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)

  // Step 1 State: Search Before Register inputs
  const [checkName, setCheckName] = useState('')
  const [checkPhone, setCheckPhone] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<{
    hasPotentialMatches: boolean
    exactMatchFound: boolean
    potentialMatches: {
      patient: Patient
      matchScore: number
      matchReasons: string[]
    }[]
  } | null>(null)

  // Step 2 State: Registration Form
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [approximateAge, setApproximateAge] = useState<number | ''>('')
  const [gender, setGender] = useState<PatientGender>('unspecified')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [nidNumber, setNidNumber] = useState('')
  const [addressDivision, setAddressDivision] = useState('Dhaka')
  const [addressDistrict, setAddressDistrict] = useState('')
  const [addressUpazila, setAddressUpazila] = useState('')
  const [addressDetails, setAddressDetails] = useState('')
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('')
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'bn'>('bn')
  const [verificationSource, setVerificationSource] = useState<
    'community_intake' | 'clinical_registration' | 'national_id_card' | 'self_reported'
  >('community_intake')

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null)
  const [copiedId, setCopiedId] = useState(false)

  // Worker Navigation
  const workerNav = [
    {
      label: isBn ? 'ফিল্ড স্ক্রীনিং সারি' : 'Field Screening Queue',
      href: '/healthcare-worker',
      icon: <Users className="size-4" />,
      badge: 8,
    },
    {
      label: dict.nav.patientRegistry || 'Patient Registry',
      href: '/healthcare-worker/patients',
      icon: <Search className="size-4" />,
    },
    {
      label: dict.nav.duplicateReview || 'Duplicate Review',
      href: '/healthcare-worker/patients/duplicates',
      icon: <Copy className="size-4" />,
      badge: 2,
    },
    {
      label: isBn ? 'সক্রিয় রেফারেলসমূহ' : 'Active Referrals',
      href: '/healthcare-worker/referrals',
      icon: <Send className="size-4" />,
      badge: 3,
    },
    {
      label: isBn ? 'ক্লিনিক ও হাসপাতাল তালিকা' : 'Clinic Facility Directory',
      href: '/healthcare-worker/facilities',
      icon: <Building2 className="size-4" />,
    },
  ]

  // Execute Search-Before-Registration
  const handleCheckExisting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkName.trim() && !checkPhone.trim()) {
      setFormErrors({ check: isBn ? 'অনুসন্ধানের জন্য রোগীর নাম বা মোবাইল নম্বর প্রদান করুন' : 'Please provide patient name or phone number to check existing records' })
      return
    }

    setFormErrors({})
    setIsChecking(true)

    try {
      const res = await searchBeforeRegisterAction({
        fullName: checkName.trim(),
        phoneNumber: checkPhone.trim(),
      })

      if (res.success && res.data) {
        setCheckResult(res.data)
        if (!res.data.hasPotentialMatches) {
          // No matches: pre-fill form and advance to Step 2
          setFullName(checkName.trim())
          setPhoneNumber(checkPhone.trim())
          setCurrentStep(2)
        }
      } else {
        // Fallback: advance to form
        setFullName(checkName.trim())
        setPhoneNumber(checkPhone.trim())
        setCurrentStep(2)
      }
    } catch {
      setFullName(checkName.trim())
      setPhoneNumber(checkPhone.trim())
      setCurrentStep(2)
    } finally {
      setIsChecking(false)
    }
  }

  // User confirmed potential matches are distinct
  const handleProceedToRegistrationForm = () => {
    setFullName(checkName.trim())
    setPhoneNumber(checkPhone.trim())
    setCurrentStep(2)
  }

  // Handle final registration submission
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    const payload: CreatePatientInput = {
      fullName: fullName.trim(),
      dateOfBirth: dateOfBirth || null,
      approximateAge: typeof approximateAge === 'number' ? approximateAge : null,
      gender,
      phoneNumber: phoneNumber.trim() || null,
      email: email.trim() || null,
      nidNumber: nidNumber.trim() || null,
      addressDivision,
      addressDistrict: addressDistrict.trim() || null,
      addressUpazila: addressUpazila.trim() || null,
      addressDetails: addressDetails.trim() || null,
      emergencyContactName: emergencyContactName.trim() || null,
      emergencyContactPhone: emergencyContactPhone.trim() || null,
      emergencyContactRelation: emergencyContactRelation.trim() || null,
      preferredLanguage,
      verificationSource,
      primaryFacilityId: 'facility-dhaka-central',
    }

    const validation = createPatientSchema.safeParse(payload)
    if (!validation.success) {
      const errors: Record<string, string> = {}
      for (const issue of validation.error.issues) {
        const path = issue.path[0] as string
        errors[path] = issue.message
      }
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      const res = await registerPatientAction(payload)
      if (res.success && res.data) {
        setRegisteredPatient(res.data.patient)
        setCurrentStep(3)
      } else {
        setFormErrors({ submit: res.error || 'Registration failed' })
      }
    } catch (err) {
      setFormErrors({
        submit: err instanceof Error ? err.message : 'Network error during registration',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyAssignedId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
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
        {/* Page Header */}
        <PageHeader
          title={t.registration.title}
          description={t.registration.subtitle}
          actions={
            <Link
              href="/healthcare-worker/patients"
              className={buttonVariants({ variant: 'outline', size: 'sm', className: 'text-xs' })}
            >
              <ArrowLeft className="size-3.5 mr-1.5" />
              <span>{t.profile.backToRegistry}</span>
            </Link>
          }
        />

        {/* STEP 1: Mandatory Search-Before-Registration Step */}
        {currentStep === 1 && (
          <Card className="border-border/80 shadow-xs animate-in fade-in duration-150">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {t.searchBeforeRegister.stepIndicator}
                </span>
                <Badge variant="outline" className="text-xs">
                  {isBn ? 'বাধ্যতামূলক অনুসন্ধান' : 'Mandatory Protocol'}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                {t.searchBeforeRegister.title}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t.searchBeforeRegister.subtitle}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleCheckExisting} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="check-name" className="text-xs font-medium">
                      {t.registration.fullNameLabel} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="check-name"
                      type="text"
                      placeholder={t.registration.fullNamePlaceholder}
                      value={checkName}
                      onChange={(e) => setCheckName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="check-phone" className="text-xs font-medium">
                      {t.registration.phoneLabel}
                    </Label>
                    <Input
                      id="check-phone"
                      type="text"
                      placeholder={t.registration.phonePlaceholder}
                      value={checkPhone}
                      onChange={(e) => setCheckPhone(e.target.value)}
                    />
                  </div>
                </div>

                {formErrors.check && (
                  <p className="text-xs text-destructive font-medium">{formErrors.check}</p>
                )}

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isChecking} className="font-semibold text-xs h-9">
                    <Search className="size-3.5 mr-1.5" />
                    <span>{isChecking ? (isBn ? 'যাচাই করা হচ্ছে...' : 'Checking...') : t.searchBeforeRegister.searchPrompt}</span>
                  </Button>
                </div>
              </form>

              {/* Potential Duplicate Matches Review Area */}
              {checkResult && checkResult.hasPotentialMatches && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                      {t.searchBeforeRegister.potentialMatchesFound.replace(
                        '{count}',
                        checkResult.potentialMatches.length.toString()
                      )}
                    </h3>
                  </div>

                  {checkResult.exactMatchFound && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                      {t.searchBeforeRegister.exactMatchAlert}
                    </p>
                  )}

                  {/* Candidate List */}
                  <div className="space-y-3 pt-1">
                    {checkResult.potentialMatches.map(({ patient, matchScore, matchReasons }) => (
                      <div
                        key={patient.id}
                        className="rounded-lg border border-border bg-card p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-primary">
                              {patient.patientId}
                            </span>
                            <span className="font-semibold text-xs sm:text-sm text-foreground">
                              {patient.fullName}
                            </span>
                            <Badge
                              variant="default"
                              className={cn(
                                'text-[10px] px-1.5 py-0',
                                matchScore >= 95
                                  ? 'bg-rose-500 text-white'
                                  : matchScore >= 75
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-muted text-muted-foreground'
                              )}
                            >
                              {matchScore}% {isBn ? 'ম্যাচ' : 'Match'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {patient.approximateAge || '—'} {isBn ? 'বছর' : 'yrs'} •{' '}
                            <span className="capitalize">{patient.gender}</span> •{' '}
                            {maskPhoneNumber(patient.phoneNumber)} • {patient.addressDivision || '—'}
                          </p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {matchReasons.map((reason, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>

                        <Link
                          href={`/healthcare-worker/patients/${patient.id}`}
                          className={buttonVariants({ variant: 'default', size: 'sm', className: 'text-xs shrink-0 font-medium' })}
                        >
                          <UserCheck className="size-3.5 mr-1.5" />
                          <span>{t.searchBeforeRegister.selectExistingBtn}</span>
                        </Link>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-amber-500/20 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleProceedToRegistrationForm}
                      className="text-xs"
                    >
                      <span>{t.searchBeforeRegister.dismissAndProceedBtn}</span>
                      <ArrowRight className="size-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Registration Form */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmitRegistration} className="space-y-6 animate-in fade-in duration-150">
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {t.registration.stepIndicator}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-muted-foreground"
                  >
                    <ArrowLeft className="size-3 mr-1" />
                    <span>{isBn ? 'পূর্ববর্তী ধাপে ফিরুন' : 'Back to Search Check'}</span>
                  </Button>
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  {t.registration.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* 1. Personal Demographics */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
                    {t.registration.personalInfoSection}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-fullname" className="text-xs font-medium">
                        {t.registration.fullNameLabel} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="reg-fullname"
                        type="text"
                        placeholder={t.registration.fullNamePlaceholder}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        error={formErrors.fullName}
                      />
                      {formErrors.fullName && (
                        <p className="text-xs text-destructive">{formErrors.fullName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-age" className="text-xs font-medium">
                        {t.registration.ageLabel} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="reg-age"
                        type="number"
                        min="1"
                        max="120"
                        placeholder={t.registration.agePlaceholder}
                        value={approximateAge}
                        onChange={(e) =>
                          setApproximateAge(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        error={formErrors.approximateAge}
                      />
                      {formErrors.approximateAge && (
                        <p className="text-xs text-destructive">{formErrors.approximateAge}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-dob" className="text-xs font-medium">
                        {t.registration.dobLabel}
                      </Label>
                      <Input
                        id="reg-dob"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">
                        {t.registration.genderLabel} <span className="text-destructive">*</span>
                      </Label>
                      <RadioGroup
                        name="reg-gender"
                        value={gender}
                        onChange={(val) => setGender(val as PatientGender)}
                        orientation="horizontal"
                        options={[
                          { value: 'male', label: t.registration.genderMale },
                          { value: 'female', label: t.registration.genderFemale },
                          { value: 'other', label: t.registration.genderOther },
                          { value: 'unspecified', label: t.registration.genderUnspecified },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Contact & Identity Information */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
                    {t.registration.contactSection}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-phone" className="text-xs font-medium">
                        {t.registration.phoneLabel}
                      </Label>
                      <Input
                        id="reg-phone"
                        type="text"
                        placeholder={t.registration.phonePlaceholder}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        error={formErrors.phoneNumber}
                      />
                      {formErrors.phoneNumber && (
                        <p className="text-xs text-destructive">{formErrors.phoneNumber}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-xs font-medium">
                        {t.registration.emailLabel}
                      </Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder={t.registration.emailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-nid" className="text-xs font-medium">
                      {t.registration.nidLabel}
                    </Label>
                    <Input
                      id="reg-nid"
                      type="text"
                      placeholder={t.registration.nidPlaceholder}
                      value={nidNumber}
                      onChange={(e) => setNidNumber(e.target.value)}
                      error={formErrors.nidNumber}
                    />
                    <p className="text-[11px] text-muted-foreground">{t.registration.nidNotice}</p>
                    {formErrors.nidNumber && (
                      <p className="text-xs text-destructive">{formErrors.nidNumber}</p>
                    )}
                  </div>
                </div>

                {/* 3. Geographic Location */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
                    {t.registration.geographicSection}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-division" className="text-xs font-medium">
                        {t.registration.divisionLabel}
                      </Label>
                      <Select
                        id="reg-division"
                        value={addressDivision}
                        onChange={(e) => setAddressDivision(e.target.value)}
                        options={[
                          { value: 'Dhaka', label: 'Dhaka' },
                          { value: 'Chattogram', label: 'Chattogram' },
                          { value: 'Rajshahi', label: 'Rajshahi' },
                          { value: 'Khulna', label: 'Khulna' },
                          { value: 'Barishal', label: 'Barishal' },
                          { value: 'Sylhet', label: 'Sylhet' },
                          { value: 'Rangpur', label: 'Rangpur' },
                          { value: 'Mymensingh', label: 'Mymensingh' },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-district" className="text-xs font-medium">
                        {t.registration.districtLabel}
                      </Label>
                      <Input
                        id="reg-district"
                        type="text"
                        placeholder={t.registration.districtPlaceholder}
                        value={addressDistrict}
                        onChange={(e) => setAddressDistrict(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-upazila" className="text-xs font-medium">
                        {t.registration.upazilaLabel}
                      </Label>
                      <Input
                        id="reg-upazila"
                        type="text"
                        placeholder={t.registration.upazilaPlaceholder}
                        value={addressUpazila}
                        onChange={(e) => setAddressUpazila(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-details" className="text-xs font-medium">
                      {t.registration.addressDetailsLabel}
                    </Label>
                    <Input
                      id="reg-details"
                      type="text"
                      placeholder={t.registration.addressDetailsPlaceholder}
                      value={addressDetails}
                      onChange={(e) => setAddressDetails(e.target.value)}
                    />
                  </div>
                </div>

                {/* 4. Emergency Contact */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
                    {t.registration.emergencySection}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-em-name" className="text-xs font-medium">
                        {t.registration.emergencyNameLabel}
                      </Label>
                      <Input
                        id="reg-em-name"
                        type="text"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-em-phone" className="text-xs font-medium">
                        {t.registration.emergencyPhoneLabel}
                      </Label>
                      <Input
                        id="reg-em-phone"
                        type="text"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-em-rel" className="text-xs font-medium">
                        {t.registration.emergencyRelationLabel}
                      </Label>
                      <Input
                        id="reg-em-rel"
                        type="text"
                        placeholder={t.registration.emergencyRelationPlaceholder}
                        value={emergencyContactRelation}
                        onChange={(e) => setEmergencyContactRelation(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Intake Preferences & Source */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
                    {t.registration.intakeSection}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-lang" className="text-xs font-medium">
                        {t.registration.languageLabel}
                      </Label>
                      <Select
                        id="reg-lang"
                        value={preferredLanguage}
                        onChange={(e) => setPreferredLanguage(e.target.value as 'en' | 'bn')}
                        options={[
                          { value: 'bn', label: t.registration.languageBn },
                          { value: 'en', label: t.registration.languageEn },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-source" className="text-xs font-medium">
                        {t.registration.sourceLabel}
                      </Label>
                      <Select
                        id="reg-source"
                        value={verificationSource}
                        onChange={(e) =>
                          setVerificationSource(
                            e.target.value as
                              | 'community_intake'
                              | 'clinical_registration'
                              | 'national_id_card'
                              | 'self_reported'
                          )
                        }
                        options={[
                          { value: 'community_intake', label: t.registration.sourceCommunity },
                          { value: 'clinical_registration', label: t.registration.sourceClinical },
                          { value: 'national_id_card', label: t.registration.sourceNid },
                          { value: 'self_reported', label: t.registration.sourceSelf },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {formErrors.submit && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-medium">
                    {formErrors.submit}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between pt-2 border-t border-border/80">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="size-4 mr-2" />
                  <span>{t.registration.cancelBtn}</span>
                </Button>

                <Button type="submit" disabled={isSubmitting} className="font-semibold">
                  <UserPlus className="size-4 mr-2" />
                  <span>
                    {isSubmitting
                      ? (isBn ? 'নিবন্ধন করা হচ্ছে...' : 'Registering...')
                      : t.registration.submitBtn}
                  </span>
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}

        {/* STEP 3: Success Confirmation */}
        {currentStep === 3 && registeredPatient && (
          <Card className="border-border/80 shadow-sm animate-in fade-in duration-200">
            <CardHeader className="text-center space-y-2 pb-2">
              <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-6" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                {t.registration.successTitle}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t.registration.assignedIdText}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
              {/* Assigned Patient ID Box */}
              <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 text-center space-y-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t.profile.patientIdBadge}
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-wider text-primary">
                  {registeredPatient.patientId}
                </div>
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyAssignedId(registeredPatient.patientId)}
                    className="text-xs"
                  >
                    {copiedId ? (
                      <>
                        <Check className="size-3.5 mr-1.5 text-emerald-600" />
                        <span>{t.profile.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 mr-1.5" />
                        <span>{t.profile.copyId}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Patient Snapshot */}
              <div className="rounded-xl border border-muted bg-muted/20 p-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">{t.registration.fullNameLabel}:</span>
                  <span className="font-semibold text-foreground">{registeredPatient.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">{t.registration.ageLabel}:</span>
                  <span className="font-semibold text-foreground">
                    {registeredPatient.approximateAge || '—'} {isBn ? 'বছর' : 'years'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">{t.registration.phoneLabel}:</span>
                  <span className="font-semibold text-foreground font-mono">
                    {maskPhoneNumber(registeredPatient.phoneNumber)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">{t.registration.divisionLabel}:</span>
                  <span className="font-semibold text-foreground">{registeredPatient.addressDivision || '—'}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/healthcare-worker/patients/${registeredPatient.id}`}
                className={buttonVariants({ variant: 'default', size: 'default', className: 'w-full sm:w-auto font-semibold' })}
              >
                <span>{t.registration.successCtaProfile}</span>
                <ArrowRight className="size-4 ml-2" />
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setCheckName('')
                  setCheckPhone('')
                  setCheckResult(null)
                  setRegisteredPatient(null)
                  setCurrentStep(1)
                }}
                className="w-full sm:w-auto text-xs"
              >
                <span>{t.registration.successCtaNew}</span>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
