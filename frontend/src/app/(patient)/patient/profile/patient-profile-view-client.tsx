'use client'

import React, { useState } from 'react'
import {
  User,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  Edit3,
  Phone,
  MapPin,
  AlertCircle,
  Lock,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { getPatientNav } from '@/components/layouts/patient-nav'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/i18n'
import { updatePatientProfileAction } from '@/modules/patient-portal/actions'
import type { Patient } from '@/modules/patients/types'

interface PatientProfileViewClientProps {
  initialPatient: Patient
}

export function PatientProfileViewClient({ initialPatient }: PatientProfileViewClientProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.patientPortal.profile

  const [patient, setPatient] = useState<Patient>(initialPatient)
  const [copiedId, setCopiedId] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null)

  const [form, setForm] = useState({
    fullName: patient.fullName,
    dateOfBirth: patient.dateOfBirth || '',
    phoneNumber: patient.phoneNumber || '',
    email: patient.email || '',
    preferredLanguage: (patient.preferredLanguage || 'en') as 'en' | 'bn',
    addressDivision: patient.addressDivision || '',
    addressDistrict: patient.addressDistrict || '',
    addressUpazila: patient.addressUpazila || '',
    addressDetails: patient.addressDetails || '',
    emergencyContactName: patient.emergencyContactName || '',
    emergencyContactPhone: patient.emergencyContactPhone || '',
    emergencyContactRelation: patient.emergencyContactRelation || '',
  })

  const handleCopyId = () => {
    navigator.clipboard.writeText(patient.patientId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFeedback(null)

    try {
      const res = await updatePatientProfileAction(patient.id, form)
      if (res.success && res.data) {
        setPatient(res.data)
        setEditOpen(false)
        setFeedback({ message: t.successUpdate, isError: false })
      } else {
        setFeedback({ message: res.error || 'Failed to update profile', isError: true })
      }
    } catch (err) {
      setFeedback({ message: err instanceof Error ? err.message : 'Error updating profile', isError: true })
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setFeedback(null), 4000)
    }
  }

  const patientNav = getPatientNav(dict, '/patient/profile')

  return (
    <DashboardLayout
      workspaceName={isBn ? 'রোগী স্বাস্থ্য পোর্টাল' : 'Patient Health Portal'}
      workspaceBadge={<Badge variant="outline" className="text-primary border-primary/30 text-xs">{patient.patientId}</Badge>}
      userName={patient.fullName}
      userRole={isBn ? 'নিবন্ধিত রোগী' : 'Registered Patient'}
      navItems={patientNav}
    >
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <PageHeader
          title={t.title}
          description={t.subtitle}
          actions={
            <Button
              variant="default"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="text-xs font-semibold"
            >
              <Edit3 className="size-3.5 mr-1.5" />
              <span>{t.editProfile}</span>
            </Button>
          }
        />

        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              feedback.isError
                ? 'border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-200'
                : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
            }`}
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* 1. Permanent ID Card */}
        <Card className="border-border/80 shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 sm:p-6 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {t.protectedIdNotice}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl sm:text-3xl font-black text-foreground">
                  {patient.patientId}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs bg-background"
                  onClick={handleCopyId}
                >
                  {copiedId ? (
                    <>
                      <Check className="size-3 text-emerald-600 mr-1" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3 mr-1" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                <Lock className="size-3 text-primary" />
                <span>Protected system identifier • Generated upon registration</span>
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground">{t.verificationStatus}:</span>
              {patient.verificationStatus === 'verified' ? (
                <Badge variant="default" className="bg-emerald-600 text-white text-xs px-2.5 py-1">
                  <ShieldCheck className="size-3.5 mr-1" />
                  <span>{t.verified}</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/40 text-xs px-2.5 py-1">
                  <Clock className="size-3.5 mr-1" />
                  <span>{t.unverified}</span>
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* 2. Personal Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Demographic Information Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="size-4 text-primary" />
                <span>Personal Demographics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">{t.fullName}:</span>
                <span className="font-semibold text-foreground">{patient.fullName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">{t.dob}:</span>
                <span className="font-semibold text-foreground">{patient.dateOfBirth || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">{t.approxAge}:</span>
                <span className="font-semibold text-foreground">
                  {patient.approximateAge ? `${patient.approximateAge} years` : '—'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">{t.gender}:</span>
                <span className="font-semibold text-foreground capitalize">{patient.gender}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">{t.preferredLanguage}:</span>
                <span className="font-semibold text-foreground uppercase">{patient.preferredLanguage || 'EN'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Phone className="size-4 text-primary" />
                <span>Contact Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">{t.phone}:</span>
                <span className="font-semibold text-foreground">{patient.phoneNumber || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">{t.email}:</span>
                <span className="font-semibold text-foreground">{patient.email || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Emergency Contact:</span>
                <span className="font-semibold text-foreground">{patient.emergencyContactName || 'None'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Emergency Phone:</span>
                <span className="font-semibold text-foreground">{patient.emergencyContactPhone || '—'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Address Card */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              <span>{t.residentialAddress}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2 pt-2">
            <p className="text-foreground font-semibold">
              {[patient.addressDetails, patient.addressUpazila, patient.addressDistrict, patient.addressDivision]
                .filter(Boolean)
                .join(', ') || 'No address details provided.'}
            </p>
          </CardContent>
        </Card>

        {/* Edit Profile Modal Dialog */}
        <Dialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          title={t.editProfile}
          size="lg"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
              <p className="font-semibold">{t.protectedIdNotice}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="prof-name">{t.fullName} *</Label>
                <Input
                  id="prof-name"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="prof-dob">{t.dob} (YYYY-MM-DD)</Label>
                <Input
                  id="prof-dob"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="prof-phone">{t.phone} *</Label>
                <Input
                  id="prof-phone"
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="prof-email">{t.email}</Label>
                <Input
                  id="prof-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="prof-div">Division</Label>
                <Input
                  id="prof-div"
                  value={form.addressDivision}
                  onChange={(e) => setForm((f) => ({ ...f, addressDivision: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="prof-dist">District</Label>
                <Input
                  id="prof-dist"
                  value={form.addressDistrict}
                  onChange={(e) => setForm((f) => ({ ...f, addressDistrict: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="prof-upazila">Upazila</Label>
                <Input
                  id="prof-upazila"
                  value={form.addressUpazila}
                  onChange={(e) => setForm((f) => ({ ...f, addressUpazila: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="prof-addr">Street / Village / Area</Label>
              <Input
                id="prof-addr"
                value={form.addressDetails}
                onChange={(e) => setForm((f) => ({ ...f, addressDetails: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="prof-emname">Emergency Contact Name</Label>
                <Input
                  id="prof-emname"
                  value={form.emergencyContactName}
                  onChange={(e) => setForm((f) => ({ ...f, emergencyContactName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="prof-emphone">Emergency Contact Phone</Label>
                <Input
                  id="prof-emphone"
                  value={form.emergencyContactPhone}
                  onChange={(e) => setForm((f) => ({ ...f, emergencyContactPhone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="prof-emrel">Relationship</Label>
                <Input
                  id="prof-emrel"
                  value={form.emergencyContactRelation}
                  onChange={(e) => setForm((f) => ({ ...f, emergencyContactRelation: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(false)}>
                {t.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {t.saveChanges}
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
