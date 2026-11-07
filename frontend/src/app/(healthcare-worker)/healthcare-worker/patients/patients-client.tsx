'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  UserPlus,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/i18n'
import { searchPatientsAction } from '@/modules/patients/actions'
import { maskPhoneNumber } from '@/modules/patients/patient-id'
import type { Patient } from '@/modules/patients/types'
import { getHealthcareWorkerNav } from '@/modules/healthcare-worker/components/worker-navigation'
import { CompletionStatusPill } from '@/modules/healthcare-worker/components/completion-status-pill'

// Demonstration baseline patient records for immediate exploration and offline resilience
const DEMO_PATIENTS: Patient[] = [
  {
    id: '11111111-1111-4111-a111-111111111111',
    patientId: 'LGT-2026-8K2M7P',
    fullName: 'Md. Rafiqul Islam',
    dateOfBirth: '1968-04-12',
    approximateAge: 58,
    gender: 'male',
    phoneNumber: '01712345678',
    phoneNumberNormalized: '01712345678',
    email: 'rafiqul.islam@example.com',
    nidNumber: '•••• •••• 5678',
    nidHash: null,
    addressDivision: 'Dhaka',
    addressDistrict: 'Dhaka',
    addressUpazila: 'Mirpur',
    addressDetails: 'Section 10, Block C',
    emergencyContactName: 'Fatema Islam',
    emergencyContactPhone: '01799887766',
    emergencyContactRelation: 'Spouse',
    preferredLanguage: 'bn',
    verificationStatus: 'verified',
    verifiedBy: 'Dr. Farhana Ahmed',
    verifiedAt: '2026-11-01T10:00:00Z',
    verificationSource: 'national_id_card',
    accountAssociationStatus: 'linked',
    associatedUserProfileId: 'user-rafiqul',
    associatedAt: '2026-11-01T10:05:00Z',
    createdBy: 'staff-chw-01',
    primaryFacilityId: 'facility-dhaka-central',
    status: 'active',
    mergedIntoPatientId: null,
    createdAt: '2026-11-01T09:30:00Z',
    updatedAt: '2026-11-01T10:05:00Z',
  },
  {
    id: '22222222-2222-4222-a222-222222222222',
    patientId: 'LGT-2026-3N9P4X',
    fullName: 'Nasima Begum',
    dateOfBirth: null,
    approximateAge: 49,
    gender: 'female',
    phoneNumber: '01898765432',
    phoneNumberNormalized: '01898765432',
    email: null,
    nidNumber: null,
    nidHash: null,
    addressDivision: 'Chattogram',
    addressDistrict: 'Chattogram',
    addressUpazila: 'Hathazari',
    addressDetails: 'Village: Mirzapur',
    emergencyContactName: 'Anwar Hossain',
    emergencyContactPhone: '01811223344',
    emergencyContactRelation: 'Brother',
    preferredLanguage: 'bn',
    verificationStatus: 'partially_verified',
    verifiedBy: null,
    verifiedAt: null,
    verificationSource: 'community_intake',
    accountAssociationStatus: 'unlinked',
    associatedUserProfileId: null,
    associatedAt: null,
    createdBy: 'staff-chw-02',
    primaryFacilityId: 'facility-chattogram-gen',
    status: 'active',
    mergedIntoPatientId: null,
    createdAt: '2026-11-02T11:15:00Z',
    updatedAt: '2026-11-02T11:15:00Z',
  },
  {
    id: '33333333-3333-4333-a333-333333333333',
    patientId: 'LGT-2026-5W7Q1L',
    fullName: 'Kamal Hossain',
    dateOfBirth: '1964-08-20',
    approximateAge: 62,
    gender: 'male',
    phoneNumber: '01712345678', // Same phone as Rafiqul for duplicate identification testing
    phoneNumberNormalized: '01712345678',
    email: null,
    nidNumber: null,
    nidHash: null,
    addressDivision: 'Dhaka',
    addressDistrict: 'Gazipur',
    addressUpazila: 'Tongi',
    addressDetails: 'Station Road',
    emergencyContactName: 'Bilkis Begum',
    emergencyContactPhone: '01755443322',
    emergencyContactRelation: 'Spouse',
    preferredLanguage: 'bn',
    verificationStatus: 'unverified',
    verifiedBy: null,
    verifiedAt: null,
    verificationSource: 'self_reported',
    accountAssociationStatus: 'unlinked',
    associatedUserProfileId: null,
    associatedAt: null,
    createdBy: 'staff-chw-01',
    primaryFacilityId: 'facility-dhaka-central',
    status: 'active',
    mergedIntoPatientId: null,
    createdAt: '2026-11-03T14:20:00Z',
    updatedAt: '2026-11-03T14:20:00Z',
  },
  {
    id: '44444444-4444-4444-a444-444444444444',
    patientId: 'LGT-2026-2Y4T9R',
    fullName: 'Salma Khatun',
    dateOfBirth: '1984-01-15',
    approximateAge: 42,
    gender: 'female',
    phoneNumber: '01911223344',
    phoneNumberNormalized: '01911223344',
    email: 'salma.khatun@example.com',
    nidNumber: '•••• •••• 9988',
    nidHash: null,
    addressDivision: 'Rajshahi',
    addressDistrict: 'Rajshahi',
    addressUpazila: 'Paba',
    addressDetails: 'Ward 2',
    emergencyContactName: 'Tariqul Islam',
    emergencyContactPhone: '01988776655',
    emergencyContactRelation: 'Son',
    preferredLanguage: 'en',
    verificationStatus: 'verified',
    verifiedBy: 'Dr. Farhana Ahmed',
    verifiedAt: '2026-11-04T09:00:00Z',
    verificationSource: 'national_id_card',
    accountAssociationStatus: 'linked',
    associatedUserProfileId: 'user-salma',
    associatedAt: '2026-11-04T09:10:00Z',
    createdBy: 'staff-chw-03',
    primaryFacilityId: 'facility-rajshahi-div',
    status: 'active',
    mergedIntoPatientId: null,
    createdAt: '2026-11-04T08:45:00Z',
    updatedAt: '2026-11-04T09:10:00Z',
  },
]

export function PatientsClient() {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.patients

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDivision, setSelectedDivision] = useState('')
  const [patients, setPatients] = useState<Patient[]>(DEMO_PATIENTS)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  // Navigation Items for Healthcare Worker Workspace
  const workerNav = getHealthcareWorkerNav(isBn)

  // Filter patients based on query and division
  const filteredPatients = patients.filter((p) => {
    const matchesQuery =
      searchQuery.trim() === '' ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (p.phoneNumber && p.phoneNumber.includes(searchQuery.trim()))

    const matchesDivision =
      selectedDivision === '' ||
      (p.addressDivision && p.addressDivision.toLowerCase() === selectedDivision.toLowerCase())

    return matchesQuery && matchesDivision
  })

  const handleCopyId = (patientId: string) => {
    navigator.clipboard.writeText(patientId)
    setCopiedId(patientId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    try {
      const res = await searchPatientsAction({
        query: searchQuery,
        division: selectedDivision || undefined,
      })
      if (res.success && res.data && res.data.patients.length > 0) {
        setPatients(res.data.patients)
      } else {
        // Retain DEMO_PATIENTS filtered client-side if DB empty
        setPatients(DEMO_PATIENTS)
      }
    } catch {
      setPatients(DEMO_PATIENTS)
    } finally {
      setIsSearching(false)
    }
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedDivision('')
    setPatients(DEMO_PATIENTS)
  }

  return (
    <DashboardLayout
      workspaceName={isBn ? 'কমিউনিটি স্বাস্থ্যকর্মী ওয়ার্কস্পেস' : 'Community Health Worker Workspace'}
      workspaceBadge={<Badge variant="secondary" size="sm">{isBn ? 'ঢাকা দক্ষিণ বিভাগ' : 'Dhaka South Division'}</Badge>}
      userName="Tania Akhter"
      userRole={isBn ? 'কমিউনিটি স্বাস্থ্য বিশেষজ্ঞ' : 'Community Health Specialist (CHW)'}
      navItems={workerNav}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title={t.registry.title}
          description={t.registry.subtitle}
          actions={
            <div className="flex items-center gap-2.5">
              <Link
                href="/healthcare-worker/patients/duplicates"
                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'text-xs' })}
              >
                <Copy className="size-3.5 mr-1.5" />
                <span>{t.registry.duplicateReviewBtn.replace('{count}', '2')}</span>
              </Link>
              <Link
                href="/healthcare-worker/patients/register"
                className={buttonVariants({ variant: 'default', size: 'sm', className: 'text-xs' })}
              >
                <UserPlus className="size-3.5 mr-1.5" />
                <span>{t.registry.newRegistrationBtn}</span>
              </Link>
            </div>
          }
        />

        {/* Mandatory Search-Before-Registration Banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3 shadow-xs">
          <ShieldAlert className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-sm font-semibold text-foreground">
              {isBn
                ? 'দ্বৈত রেকর্ড প্রতিরোধ নীতি — নিবন্ধনের পূর্বে অনুসন্ধান'
                : 'Duplicate Prevention Protocol — Mandatory Search Verification'}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.search.mandatorySearchNotice}
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t.search.placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs sm:text-sm"
                />
              </div>

              <div className="w-full sm:w-48 shrink-0">
                <Select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  placeholder={t.search.filterDivision}
                  options={[
                    { value: '', label: t.search.filterDivision },
                    { value: 'Dhaka', label: 'Dhaka' },
                    { value: 'Chattogram', label: 'Chattogram' },
                    { value: 'Rajshahi', label: 'Rajshahi' },
                    { value: 'Khulna', label: 'Khulna' },
                    { value: 'Barishal', label: 'Barishal' },
                    { value: 'Sylhet', label: 'Sylhet' },
                    { value: 'Rangpur', label: 'Rangpur' },
                    { value: 'Mymensingh', label: 'Mymensingh' },
                  ]}
                  className="h-9 text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Button type="submit" size="sm" disabled={isSearching} className="h-9 px-4 text-xs font-semibold">
                  <Search className="size-3.5 mr-1.5" />
                  <span>{t.search.searchBtn}</span>
                </Button>
                {(searchQuery || selectedDivision) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="size-3.5 mr-1" />
                    <span>{t.search.clearBtn}</span>
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Directory Table */}
        <Card className="border-border/80 shadow-xs overflow-hidden">
          <CardHeader className="p-4 sm:p-5 border-b border-border/80 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                {t.search.title}
              </CardTitle>
              <CardDescription className="text-xs">
                {t.registry.totalPatientsBadge.replace('{count}', filteredPatients.length.toString())}
              </CardDescription>
            </div>

            <Link
              href="/healthcare-worker/patients/register"
              className={buttonVariants({ variant: 'default', size: 'sm', className: 'text-xs' })}
            >
              <UserPlus className="size-3.5 mr-1.5" />
              <span>{t.registry.newRegistrationBtn}</span>
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            {filteredPatients.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 text-xs">
                      <TableHead className="font-semibold">{t.search.patientIdCol}</TableHead>
                      <TableHead className="font-semibold">{t.search.nameCol}</TableHead>
                      <TableHead className="font-semibold">{t.search.demographicsCol}</TableHead>
                      <TableHead className="font-semibold">{t.search.phoneCol}</TableHead>
                      <TableHead className="font-semibold">{isBn ? 'রেকর্ড সম্পূর্ণতা' : 'Completeness'}</TableHead>
                      <TableHead className="font-semibold">{t.search.verificationCol}</TableHead>
                      <TableHead className="text-right font-semibold">{t.search.actionsCol}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => {
                      const isCopied = copiedId === patient.patientId
                      return (
                        <TableRow key={patient.id} className="hover:bg-muted/30 transition-colors">
                          {/* Lungent Patient ID Badge */}
                          <TableCell className="font-mono text-xs font-bold text-primary whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <span>{patient.patientId}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyId(patient.patientId)}
                                title={t.profile.copyId}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {isCopied ? (
                                  <Check className="size-3 text-emerald-600" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </button>
                            </div>
                          </TableCell>

                          {/* Full Name */}
                          <TableCell className="font-medium text-xs sm:text-sm text-foreground whitespace-nowrap">
                            <Link
                              href={`/healthcare-worker/patients/${patient.id}`}
                              className="hover:underline hover:text-primary transition-colors"
                            >
                              {patient.fullName}
                            </Link>
                          </TableCell>

                          {/* Demographics */}
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {patient.approximateAge || (patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : '—')}{' '}
                            {isBn ? 'বছর' : 'yrs'} •{' '}
                            <span className="capitalize">{patient.gender}</span>
                          </TableCell>

                          {/* Phone Number (Masked for privacy) */}
                          <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                            {maskPhoneNumber(patient.phoneNumber)}
                          </TableCell>

                          {/* Completeness Pill */}
                          <TableCell className="whitespace-nowrap">
                            <CompletionStatusPill
                              score={patient.verificationStatus === 'verified' ? 85 : 45}
                              status={patient.verificationStatus === 'verified' ? 'complete' : 'partially_complete'}
                              patientId={patient.id}
                            />
                          </TableCell>

                          {/* Verification Status Badge */}
                          <TableCell className="whitespace-nowrap">
                            {patient.verificationStatus === 'verified' ? (
                              <Badge variant="default" className="bg-emerald-600 text-white text-[10px] px-2 py-0.5">
                                <ShieldCheck className="size-3 mr-1" />
                                <span>{t.profile.verifiedBadge}</span>
                              </Badge>
                            ) : patient.verificationStatus === 'partially_verified' ? (
                              <Badge variant="default" className="bg-amber-500 text-white text-[10px] px-2 py-0.5">
                                <span>{t.profile.partiallyVerifiedBadge}</span>
                              </Badge>
                            ) : (
                              <Badge variant="default" className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5">
                                <span>{t.profile.unverifiedBadge}</span>
                              </Badge>
                            )}
                          </TableCell>

                          {/* Action Button */}
                          <TableCell className="text-right whitespace-nowrap">
                            <Link
                              href={`/healthcare-worker/patients/${patient.id}`}
                              className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'text-xs h-8 text-primary hover:text-primary' })}
                            >
                              <span>{t.search.viewProfileBtn}</span>
                              <ArrowRight className="size-3.5 ml-1" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 px-4 space-y-4">
                <div className="size-12 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                  <Search className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t.search.noResultsTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {t.search.noResultsDesc}
                  </p>
                </div>
                <Link
                  href="/healthcare-worker/patients/register"
                  className={buttonVariants({ variant: 'default', size: 'sm', className: 'text-xs font-semibold' })}
                >
                  <UserPlus className="size-3.5 mr-1.5" />
                  <span>{t.search.registerCta}</span>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
