'use client'

import React, { useState, useTransition, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  Lock,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/i18n'
import { updateFacilityAction } from '@/modules/facilities/actions'
import {
  BANGLADESH_DIVISIONS,
  getDistrictsForDivision,
  getUpazilasForDistrict,
} from '@/modules/facilities/geographic-data'
import type { HealthcareFacility } from '@/modules/facilities/types'

const adminNav = [
  { label: 'System Overview', href: '/admin', icon: <Server className="size-4" /> },
  { label: 'Facility Registry', href: '/admin/facilities', icon: <Building2 className="size-4" /> },
  { label: 'User & Role Access', href: '/admin/users', icon: <Users className="size-4" /> },
  { label: 'Audit & Governance Logs', href: '/admin/audit', icon: <FileText className="size-4" /> },
  { label: 'Security & Parameters', href: '/admin/security', icon: <Settings className="size-4" /> },
]

interface FacilityEditClientProps {
  facility: HealthcareFacility
}

export function FacilityEditClient({ facility }: FacilityEditClientProps) {
  const { dict: t, locale } = useLanguage()
  const isBn = locale === 'bn'
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form Fields initialized from current facility record
  const [name, setName] = useState(facility.name)
  const [nameBn, setNameBn] = useState(facility.nameBn || '')
  const [facilityTypeId, setFacilityTypeId] = useState(facility.facilityTypeId)
  const [ownershipCategoryId, setOwnershipCategoryId] = useState(facility.ownershipCategoryId)
  const [groupId, setGroupId] = useState(facility.groupId || '')

  // Cascading Geographic Selectors
  const [division, setDivision] = useState(facility.division)
  const [district, setDistrict] = useState(facility.district)
  const [upazila, setUpazila] = useState(facility.upazila)
  const [unionMunicipality, setUnionMunicipality] = useState(facility.unionMunicipality || '')
  const [ward, setWard] = useState(facility.ward || '')
  const [addressLine, setAddressLine] = useState(facility.addressLine)
  const [latitude, setLatitude] = useState<string>(
    facility.latitude !== null && facility.latitude !== undefined ? facility.latitude.toString() : ''
  )
  const [longitude, setLongitude] = useState<string>(
    facility.longitude !== null && facility.longitude !== undefined ? facility.longitude.toString() : ''
  )

  // Contacts
  const [contactPhone, setContactPhone] = useState(facility.contactPhone || '')
  const [contactEmail, setContactEmail] = useState(facility.contactEmail || '')
  const [contactPersonName, setContactPersonName] = useState(facility.contactPersonName || '')
  const [contactPersonRole, setContactPersonRole] = useState(facility.contactPersonRole || '')
  const [websiteUrl, setWebsiteUrl] = useState(facility.websiteUrl || '')

  // Operational Capacity
  const [totalBeds, setTotalBeds] = useState(
    (facility.operationalCapacity?.totalBeds ?? 0).toString()
  )
  const [icuBeds, setIcuBeds] = useState(
    (facility.operationalCapacity?.icuBeds ?? 0).toString()
  )
  const [ldctScanners, setLdctScanners] = useState(
    (facility.operationalCapacity?.ldctScanners ?? 0).toString()
  )
  const [spirometryStations, setSpirometryStations] = useState(
    (facility.operationalCapacity?.spirometryStations ?? 0).toString()
  )

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState(false)

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
      const res = await updateFacilityAction(facility.id, {
        name: name.trim(),
        nameBn: nameBn.trim() || undefined,
        facilityTypeId,
        ownershipCategoryId,
        groupId: groupId.trim() || null,
        division,
        district,
        upazila,
        unionMunicipality: unionMunicipality.trim() || null,
        ward: ward.trim() || null,
        addressLine: addressLine.trim(),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim() || null,
        contactPersonName: contactPersonName.trim() || null,
        contactPersonRole: contactPersonRole.trim() || null,
        websiteUrl: websiteUrl.trim() || null,
        operationalCapacity: {
          totalBeds: parseInt(totalBeds, 10) || 0,
          icuBeds: parseInt(icuBeds, 10) || 0,
          ldctScanners: parseInt(ldctScanners, 10) || 0,
          spirometryStations: parseInt(spirometryStations, 10) || 0,
        },
      })

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update facility')
        return
      }

      setSuccessNotice(true)
      setTimeout(() => {
        router.push(`/admin/facilities/${facility.id}`)
      }, 1200)
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
            href={`/admin/facilities/${facility.id}`}
            className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'gap-1.5' })}
          >
            <ArrowLeft className="size-4" />
            <span>{isBn ? 'প্রোফাইলে ফিরে যান' : 'Back to Facility Profile'}</span>
          </Link>
        </div>

        <PageHeader
          title={t.facilities.edit.title}
          description={t.facilities.edit.subtitle.replace('{name}', facility.name)}
        />

        {/* Permanent ID security notice */}
        <div className="p-3 bg-muted/60 border border-border rounded-xl text-xs text-muted-foreground flex items-center gap-2">
          <Lock className="size-4 text-primary shrink-0" />
          <span>
            {t.facilities.edit.permanentIdNotice.replace('{id}', facility.facilityId)}
          </span>
        </div>

        {successNotice && (
          <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-success flex items-center gap-3">
            <CheckCircle2 className="size-5 shrink-0" />
            <span className="text-sm font-medium">{t.facilities.edit.successNotice}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Facility Identity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                {t.facilities.register.basicSection}
              </CardTitle>
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
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {t.facilities.register.nameBnLabel}
                  </label>
                  <Input
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
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

          {/* Section 2: Geographic Catchment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                {t.facilities.register.geoSection}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {t.facilities.register.wardLabel}
                  </label>
                  <Input
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
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
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {t.facilities.register.personRoleLabel}
                  </label>
                  <Input
                    value={contactPersonRole}
                    onChange={(e) => setContactPersonRole(e.target.value)}
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

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href={`/admin/facilities/${facility.id}`}
              className={buttonVariants({ variant: 'outline', size: 'default' })}
            >
              {t.facilities.edit.cancelBtn}
            </Link>
            <Button type="submit" variant="default" size="default" disabled={isPending}>
              {isPending ? 'Saving...' : t.facilities.edit.saveBtn}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
