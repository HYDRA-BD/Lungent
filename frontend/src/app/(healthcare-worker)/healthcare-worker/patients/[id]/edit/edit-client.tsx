'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  Search,
  UserPlus,
  Copy,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Building2,
  Send,
  Save,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useLanguage } from '@/i18n'
import { updatePatientAction } from '@/modules/patients/actions'
import { updatePatientSchema } from '@/modules/patients/validation'
import type { Patient, PatientGender, UpdatePatientInput } from '@/modules/patients/types'

const BD_DIVISIONS = [
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
]

interface EditPatientClientProps {
  initialPatient: Patient
}

export function EditPatientClient({ initialPatient }: EditPatientClientProps) {
  const router = useRouter()
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.patients

  const [patient] = useState<Patient>(initialPatient)
  const [formData, setFormData] = useState<UpdatePatientInput>({
    fullName: patient.fullName || '',
    dateOfBirth: patient.dateOfBirth || '',
    approximateAge: patient.approximateAge || undefined,
    gender: patient.gender || 'unspecified',
    phoneNumber: patient.phoneNumber || '',
    email: patient.email || '',
    addressDivision: patient.addressDivision || '',
    addressDistrict: patient.addressDistrict || '',
    addressUpazila: patient.addressUpazila || '',
    addressDetails: patient.addressDetails || '',
    emergencyContactName: patient.emergencyContactName || '',
    emergencyContactPhone: patient.emergencyContactPhone || '',
    emergencyContactRelation: patient.emergencyContactRelation || '',
    preferredLanguage: patient.preferredLanguage || 'en',
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const workerNav = [
    {
      label: dict.nav.communityHealth || 'Overview',
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
      label: dict.nav.registerPatient || 'New Registration',
      href: '/healthcare-worker/patients/register',
      icon: <UserPlus className="size-4" />,
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

  const handleChange = (field: keyof UpdatePatientInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage(null)

    // Zod validation
    const validation = updatePatientSchema.safeParse(formData)
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
      const res = await updatePatientAction(patient.id, formData)
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: t.edit.successNotice,
        })
        setTimeout(() => {
          router.push(`/healthcare-worker/patients/${patient.id}`)
        }, 1200)
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Failed to update patient identity',
        })
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Network error during identity update',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const subtitle = t.edit.subtitle.replace('{id}', patient.patientId)

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
          title={t.edit.title}
          description={subtitle}
          actions={
            <Link
              href={`/healthcare-worker/patients/${patient.id}`}
              className={buttonVariants({ variant: 'outline', size: 'sm', className: 'text-xs' })}
            >
              <ArrowLeft className="size-3.5 mr-1" />
              {t.profile.title}
            </Link>
          }
        />

        {/* Permanent Patient ID Security Banner */}
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Lock className="size-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {t.profile.patientIdBadge}
              </span>
              <span className="font-mono text-sm font-bold text-foreground bg-background px-2 py-0.5 rounded border border-border">
                {patient.patientId}
              </span>
              <Badge variant="outline" size="sm" className="text-muted-foreground border-dashed">
                {isBn ? 'স্থায়ী আইডি (অপরিবর্তনযোগ্য)' : 'Permanent & Immutable'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {t.edit.permanentIdNotice}
            </p>
          </div>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 ${
              statusMessage.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                : 'border-destructive/30 bg-destructive/10 text-destructive'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="size-4 shrink-0" />
            ) : (
              <AlertTriangle className="size-4 shrink-0" />
            )}
            <span className="text-xs font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Core Demographics */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-semibold">
                {t.registration.personalInfoSection}
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn ? 'রোগীর মৌলিক পরিচিতি ও বয়স সংক্রান্ত তথ্য' : 'Core personal identifiers and age'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs">
                  {t.registration.fullNameLabel} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName || ''}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder={t.registration.fullNamePlaceholder}
                  required
                />
                {formErrors.fullName && (
                  <p className="text-[11px] text-destructive">{formErrors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dateOfBirth" className="text-xs">
                    {t.registration.dobLabel}
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value || null)}
                  />
                  {formErrors.dateOfBirth && (
                    <p className="text-[11px] text-destructive">{formErrors.dateOfBirth}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="approximateAge" className="text-xs">
                    {t.registration.ageLabel}
                  </Label>
                  <Input
                    id="approximateAge"
                    type="number"
                    min={1}
                    max={120}
                    value={formData.approximateAge ?? ''}
                    onChange={(e) =>
                      handleChange(
                        'approximateAge',
                        e.target.value ? parseInt(e.target.value, 10) : null
                      )
                    }
                    placeholder="e.g. 52"
                  />
                  {formErrors.approximateAge && (
                    <p className="text-[11px] text-destructive">{formErrors.approximateAge}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs">
                    {t.registration.genderLabel}
                  </Label>
                  <Select
                    id="gender"
                    value={formData.gender || 'unspecified'}
                    onChange={(e) => handleChange('gender', e.target.value as PatientGender)}
                  >
                    <option value="male">{t.registration.genderMale}</option>
                    <option value="female">{t.registration.genderFemale}</option>
                    <option value="other">{t.registration.genderOther}</option>
                    <option value="unspecified">{t.registration.genderUnspecified}</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Contact Information */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-semibold">
                {t.registration.contactSection}
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn ? 'সক্রিয় মোবাইল নম্বর এবং ইমেইল ঠিকানা' : 'Active phone number and email address'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phoneNumber" className="text-xs">
                    {t.registration.phoneLabel}
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber || ''}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    placeholder={t.registration.phonePlaceholder}
                  />
                  {formErrors.phoneNumber && (
                    <p className="text-[11px] text-destructive">{formErrors.phoneNumber}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">
                    {t.registration.emailLabel}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder={t.registration.emailPlaceholder}
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-destructive">{formErrors.email}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Residential Address */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-semibold">
                {t.registration.geographicSection}
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn ? 'প্রশাসনিক বিভাগ ও আঞ্চলিক ঠিকানা' : 'Administrative division and residential location'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="division" className="text-xs">
                    {t.registration.divisionLabel}
                  </Label>
                  <Select
                    id="division"
                    value={formData.addressDivision || ''}
                    onChange={(e) => handleChange('addressDivision', e.target.value)}
                  >
                    <option value="">{t.registration.divisionPlaceholder}</option>
                    {BD_DIVISIONS.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="district" className="text-xs">
                    {t.registration.districtLabel}
                  </Label>
                  <Input
                    id="district"
                    value={formData.addressDistrict || ''}
                    onChange={(e) => handleChange('addressDistrict', e.target.value)}
                    placeholder={t.registration.districtPlaceholder}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="upazila" className="text-xs">
                    {t.registration.upazilaLabel}
                  </Label>
                  <Input
                    id="upazila"
                    value={formData.addressUpazila || ''}
                    onChange={(e) => handleChange('addressUpazila', e.target.value)}
                    placeholder={t.registration.upazilaPlaceholder}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addressDetails" className="text-xs">
                  {t.registration.addressDetailsLabel}
                </Label>
                <Input
                  id="addressDetails"
                  value={formData.addressDetails || ''}
                  onChange={(e) => handleChange('addressDetails', e.target.value)}
                  placeholder={t.registration.addressDetailsPlaceholder}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Emergency Contact & Preferences */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-semibold">
                {t.registration.emergencySection}
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn ? 'জরুরি যোগাযোগ ব্যক্তি এবং যোগাযোগের ভাষা' : 'Emergency family contact and language preference'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="emergencyName" className="text-xs">
                    {t.registration.emergencyNameLabel}
                  </Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContactName || ''}
                    onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="emergencyPhone" className="text-xs">
                    {t.registration.emergencyPhoneLabel}
                  </Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyContactPhone || ''}
                    onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="emergencyRelation" className="text-xs">
                    {t.registration.emergencyRelationLabel}
                  </Label>
                  <Input
                    id="emergencyRelation"
                    value={formData.emergencyContactRelation || ''}
                    onChange={(e) => handleChange('emergencyContactRelation', e.target.value)}
                    placeholder={t.registration.emergencyRelationPlaceholder}
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="preferredLanguage" className="text-xs">
                  {t.registration.languageLabel}
                </Label>
                <Select
                  id="preferredLanguage"
                  value={formData.preferredLanguage || 'en'}
                  onChange={(e) => handleChange('preferredLanguage', e.target.value as 'en' | 'bn')}
                >
                  <option value="en">{t.registration.languageEn}</option>
                  <option value="bn">{t.registration.languageBn}</option>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/40 flex justify-between gap-3">
              <Link
                href={`/healthcare-worker/patients/${patient.id}`}
                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'text-xs' })}
              >
                {t.edit.cancelBtn}
              </Link>
              <Button
                type="submit"
                variant="default"
                size="sm"
                className="text-xs"
                disabled={isSubmitting}
              >
                <Save className="size-3.5 mr-1" />
                {isSubmitting
                  ? (isBn ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...')
                  : t.edit.saveBtn}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
