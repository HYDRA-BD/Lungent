'use client'

import React, { useState, useTransition, useMemo } from 'react'
import Link from 'next/link'
import {
  Building2,
  Server,
  Users,
  FileText,
  Settings,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Bed,
  Activity,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/i18n'
import { registerFacilityAction, configureFacilityServicesAction } from '@/modules/facilities/actions'
import {
  BANGLADESH_DIVISIONS,
  getDistrictsForDivision,
  getUpazilasForDistrict,
} from '@/modules/facilities/geographic-data'

const adminNav = [
  { label: 'System Overview', href: '/admin', icon: <Server className="size-4" /> },
  { label: 'Facility Registry', href: '/admin/facilities', icon: <Building2 className="size-4" /> },
  { label: 'User & Role Access', href: '/admin/users', icon: <Users className="size-4" /> },
  { label: 'Audit & Governance Logs', href: '/admin/audit', icon: <FileText className="size-4" /> },
  { label: 'Security & Parameters', href: '/admin/security', icon: <Settings className="size-4" /> },
]

const STANDARD_SERVICES = [
  { id: 'srv-pulmonology', code: 'PULM-CONSULT', name: 'Pulmonology Specialist Consultation' },
  { id: 'srv-ldct', code: 'RAD-LDCT', name: 'Low-Dose CT (LDCT) Lung Cancer Screening' },
  { id: 'srv-pft', code: 'PFT-SPIRO', name: 'Spirometry & Pulmonary Function Testing' },
  { id: 'srv-resp-care', code: 'CLIN-RESP', name: 'Comprehensive Respiratory Care Clinic' },
  { id: 'srv-oncology', code: 'MED-ONC', name: 'Thoracic Medical Oncology Clinic' },
  { id: 'srv-xray', code: 'RAD-CXR', name: 'Digital Chest Radiography (CXR)' },
  { id: 'srv-tobacco', code: 'PREV-CESS', name: 'Tobacco Cessation Support Clinic' },
  { id: 'srv-community', code: 'OUT-COMM', name: 'Community Outreach & Mobile Screening' },
]

export function FacilityRegisterClient() {
  const { dict: t, locale } = useLanguage()
  const isBn = locale === 'bn'
  const [isPending, startTransition] = useTransition()

  // Form Fields
  const [name, setName] = useState('')
  const [nameBn, setNameBn] = useState('')
  const [facilityTypeId, setFacilityTypeId] = useState('specialized_hospital')
  const [ownershipCategoryId, setOwnershipCategoryId] = useState('government')
  const [groupId, setGroupId] = useState('')

  // Cascading Geographic Selectors
  const [division, setDivision] = useState('Dhaka')
  const [district, setDistrict] = useState('Dhaka')
  const [upazila, setUpazila] = useState('Mirpur')
  const [unionMunicipality, setUnionMunicipality] = useState('')
  const [ward, setWard] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [latitude, setLatitude] = useState<string>('')
  const [longitude, setLongitude] = useState<string>('')

  // Contacts
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPersonName, setContactPersonName] = useState('')
  const [contactPersonRole, setContactPersonRole] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')

  // Operational Capacity
  const [totalBeds, setTotalBeds] = useState('100')
  const [icuBeds, setIcuBeds] = useState('10')
  const [ldctScanners, setLdctScanners] = useState('1')
  const [spirometryStations, setSpirometryStations] = useState('2')

  // Selected Services
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'srv-pulmonology',
    'srv-ldct',
    'srv-pft',
    'srv-resp-care',
  ])

  // Form Status & Error
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successFacilityId, setSuccessFacilityId] = useState<string | null>(null)
  const [newInternalId, setNewInternalId] = useState<string | null>(null)

  // Cascading options
  const districtOptions = useMemo(() => {
    return getDistrictsForDivision(division)
  }, [division])

  const upazilaOptions = useMemo(() => {
    return getUpazilasForDistrict(district)
  }, [district])

  const handleDivisionChange = (newDivision: string) => {
    setDivision(newDivision)
    const availableDistricts = getDistrictsForDivision(newDivision)
    const firstDistrict = availableDistricts[0]?.name || ''
    setDistrict(firstDistrict)

    const availableUpazilas = getUpazilasForDistrict(firstDistrict)
    setUpazila(availableUpazilas[0]?.name || '')
  }

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict)
    const availableUpazilas = getUpazilasForDistrict(newDistrict)
    setUpazila(availableUpazilas[0]?.name || '')
  }

  const toggleService = (srvId: string) => {
    setSelectedServices((prev) =>
      prev.includes(srvId) ? prev.filter((id) => id !== srvId) : [...prev, srvId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim()) {
      setErrorMessage(isBn ? 'প্রতিষ্ঠানের নাম আবশ্যক' : 'Facility name is required')
      return
    }

    if (!contactPhone.trim()) {
      setErrorMessage(isBn ? 'যোগাযোগের ফোন নম্বর আবশ্যক' : 'Contact phone number is required')
      return
    }

    if (!addressLine.trim()) {
      setErrorMessage(isBn ? 'সঠিক ঠিকানা প্রদান করুন' : 'Street address is required')
      return
    }

    startTransition(async () => {
      const res = await registerFacilityAction({
        name: name.trim(),
        nameBn: nameBn.trim() || undefined,
        facilityTypeId,
        ownershipCategoryId,
        groupId: groupId.trim() || undefined,
        countryCode: 'BD',
        division,
        district,
        upazila,
        unionMunicipality: unionMunicipality.trim() || undefined,
        ward: ward.trim() || undefined,
        addressLine: addressLine.trim(),
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim() || undefined,
        contactPersonName: contactPersonName.trim() || undefined,
        contactPersonRole: contactPersonRole.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        operationalCapacity: {
          totalBeds: parseInt(totalBeds, 10) || 0,
          icuBeds: parseInt(icuBeds, 10) || 0,
          ldctScanners: parseInt(ldctScanners, 10) || 0,
          spirometryStations: parseInt(spirometryStations, 10) || 0,
        },
      })

      if (!res.success || !res.data) {
        setErrorMessage(res.error || 'Failed to register facility')
        return
      }

      const created = res.data
      setSuccessFacilityId(created.facilityId)
      setNewInternalId(created.id)

      // Automatically map initial selected services
      if (selectedServices.length > 0) {
        await configureFacilityServicesAction(created.id, {
          services: selectedServices.map((sid) => ({
            serviceId: sid,
            availabilityStatus: 'available',
            isVerified: false,
          })),
        })
      }
    })
  }

  return (
    <DashboardLayout
      workspaceName="System Administration & Governance"
      workspaceBadge={<Badge variant="outline" size="sm">SuperAdmin Tier</Badge>}
      userName="System Administrator"
      userRole="Platform Governance Lead"
      navItems={adminNav}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/facilities"
            className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'gap-1.5' })}
          >
            <ArrowLeft className="size-4" />
            <span>{t.facilities.profile.backToDirectory}</span>
          </Link>
        </div>

        <PageHeader
          title={t.facilities.register.title}
          description={t.facilities.register.subtitle}
        />

        {successFacilityId ? (
          <Card className="border-success/30 bg-success/5 shadow-md">
            <CardContent className="p-8 text-center space-y-4">
              <CheckCircle2 className="size-16 mx-auto text-success" />
              <h3 className="text-xl font-bold text-foreground">
                {isBn
                  ? 'স্বাস্থ্যসেবা কেন্দ্র সফলভাবে নিবন্ধিত হয়েছে'
                  : 'Healthcare Facility Registered Successfully'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                {t.facilities.register.successMessage}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg font-mono text-sm font-semibold">
                <span>{t.facilities.profile.facilityIdBadge}:</span>
                <span className="text-primary">{successFacilityId}</span>
              </div>
              <div className="pt-4 flex items-center justify-center gap-3">
                <Link
                  href={`/admin/facilities/${newInternalId || successFacilityId}`}
                  className={buttonVariants({ variant: 'default', size: 'default' })}
                >
                  {isBn ? 'কেন্দ্রের প্রোফাইলে যান' : 'Go to Facility Profile'}
                </Link>
                <Link
                  href="/admin/facilities"
                  className={buttonVariants({ variant: 'outline', size: 'default' })}
                >
                  {t.facilities.profile.backToDirectory}
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
                <AlertCircle className="size-5 shrink-0" />
                <span className="text-sm font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Section 1: Facility Identity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  {t.facilities.register.basicSection}
                </CardTitle>
                <CardDescription>
                  {t.facilities.register.facilityIdNotice}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.nameEnLabel} *
                    </label>
                    <Input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.facilities.register.nameEnPlaceholder}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.nameBnLabel}
                    </label>
                    <Input
                      value={nameBn}
                      onChange={(e) => setNameBn(e.target.value)}
                      placeholder={t.facilities.register.nameBnPlaceholder}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.typeLabel} *
                    </label>
                    <Select
                      value={facilityTypeId}
                      onChange={(e) => setFacilityTypeId(e.target.value)}
                      options={[
                        { value: 'specialized_hospital', label: t.facilities.types.specialized_hospital },
                        { value: 'public_hospital', label: t.facilities.types.public_hospital },
                        { value: 'private_hospital', label: t.facilities.types.private_hospital },
                        { value: 'specialized_clinic', label: t.facilities.types.specialized_clinic },
                        { value: 'general_clinic', label: t.facilities.types.general_clinic },
                        { value: 'primary_healthcare_facility', label: t.facilities.types.primary_healthcare_facility },
                        { value: 'community_clinic', label: t.facilities.types.community_clinic },
                        { value: 'community_health_programme', label: t.facilities.types.community_health_programme },
                        { value: 'other', label: t.facilities.types.other },
                      ]}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.ownershipLabel} *
                    </label>
                    <Select
                      value={ownershipCategoryId}
                      onChange={(e) => setOwnershipCategoryId(e.target.value)}
                      options={[
                        { value: 'government', label: t.facilities.ownership.government },
                        { value: 'private', label: t.facilities.ownership.private },
                        { value: 'ngo', label: t.facilities.ownership.ngo },
                        { value: 'academic_research', label: t.facilities.ownership.academic_research },
                        { value: 'community_based', label: t.facilities.ownership.community_based },
                        { value: 'other', label: t.facilities.ownership.other },
                      ]}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {t.facilities.register.groupLabel}
                  </label>
                  <Select
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    options={[
                      { value: '', label: t.facilities.register.noGroup },
                      {
                        value: '11111111-2222-3333-4444-555555555552',
                        label: 'NIDCH National Pulmonology Network',
                      },
                      {
                        value: '11111111-2222-3333-4444-555555555551',
                        label: 'Directorate General of Health Services (DGHS Network)',
                      },
                      {
                        value: '11111111-2222-3333-4444-555555555553',
                        label: 'Bangladesh Community Respiratory Alliance',
                      },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Bangladesh Geographic Hierarchy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  {t.facilities.register.geoSection}
                </CardTitle>
                <CardDescription>
                  {isBn
                    ? 'প্রশাসনিক বিভাগ, জেলা ও উপজেলার সঠিক হায়ারার্কি নির্বাচন করুন।'
                    : 'Select valid Division, District, and Upazila under Bangladesh administrative structure.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Division */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.divisionLabel} *
                    </label>
                    <Select
                      value={division}
                      onChange={(e) => handleDivisionChange(e.target.value)}
                      options={BANGLADESH_DIVISIONS.map((d) => ({
                        value: d.name,
                        label: isBn ? `${d.nameBn} (${d.name})` : d.name,
                      }))}
                    />
                  </div>

                  {/* District (Cascading) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.districtLabel} *
                    </label>
                    <Select
                      value={district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      options={districtOptions.map((d) => ({
                        value: d.name,
                        label: isBn ? `${d.nameBn} (${d.name})` : d.name,
                      }))}
                    />
                  </div>

                  {/* Upazila (Cascading) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.upazilaLabel} *
                    </label>
                    <Select
                      value={upazila}
                      onChange={(e) => setUpazila(e.target.value)}
                      options={upazilaOptions.map((u) => ({
                        value: u.name,
                        label: isBn ? `${u.nameBn} (${u.name})` : u.name,
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.unionLabel}
                    </label>
                    <Input
                      value={unionMunicipality}
                      onChange={(e) => setUnionMunicipality(e.target.value)}
                      placeholder={t.facilities.register.unionPlaceholder}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.wardLabel}
                    </label>
                    <Input
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      placeholder={t.facilities.register.wardPlaceholder}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {t.facilities.register.addressLabel} *
                  </label>
                  <Input
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder={t.facilities.register.addressPlaceholder}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.latLabel}
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="e.g. 23.8067"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.lngLabel}
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="e.g. 90.3687"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Official Contact & Liaison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Phone className="size-4 text-primary" />
                  {t.facilities.register.contactSection}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.phoneLabel} *
                    </label>
                    <Input
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder={t.facilities.register.phonePlaceholder}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.emailLabel}
                    </label>
                    <Input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder={t.facilities.register.emailPlaceholder}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.personNameLabel}
                    </label>
                    <Input
                      value={contactPersonName}
                      onChange={(e) => setContactPersonName(e.target.value)}
                      placeholder="e.g. Dr. Rafiqul Islam"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.personRoleLabel}
                    </label>
                    <Input
                      value={contactPersonRole}
                      onChange={(e) => setContactPersonRole(e.target.value)}
                      placeholder="e.g. Chief Medical Officer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.websiteLabel}
                    </label>
                    <Input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Operational Capacity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Bed className="size-4 text-primary" />
                  {t.facilities.register.capacitySection}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.totalBedsLabel}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={totalBeds}
                      onChange={(e) => setTotalBeds(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.icuBedsLabel}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={icuBeds}
                      onChange={(e) => setIcuBeds(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.ldctLabel}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={ldctScanners}
                      onChange={(e) => setLdctScanners(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.facilities.register.spirometryLabel}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={spirometryStations}
                      onChange={(e) => setSpirometryStations(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Offered Clinical Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="size-4 text-primary" />
                  {t.facilities.services.title}
                </CardTitle>
                <CardDescription>
                  {t.facilities.services.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STANDARD_SERVICES.map((srv) => {
                    const isChecked = selectedServices.includes(srv.id)
                    return (
                      <button
                        type="button"
                        key={srv.id}
                        onClick={() => toggleService(srv.id)}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                          isChecked
                            ? 'bg-primary/5 border-primary/40'
                            : 'bg-card border-border hover:bg-muted/40'
                        }`}
                      >
                        <div
                          className={`size-4 rounded-md mt-0.5 flex items-center justify-center border text-primary-foreground ${
                            isChecked ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="size-3 text-white" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground">{srv.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{srv.code}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Link
                href="/admin/facilities"
                className={buttonVariants({ variant: 'outline', size: 'default' })}
              >
                {t.facilities.register.cancelBtn}
              </Link>
              <Button type="submit" variant="default" size="default" disabled={isPending}>
                {isPending ? 'Registering...' : t.facilities.register.submitBtn}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  )
}
