'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Building2,
  Server,
  Users,
  FileText,
  Settings,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Edit,
  Activity,
  History,
  UserPlus,
  Lock,
  MapPin,
  Phone,
  Bed,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { useLanguage } from '@/i18n'
import {
  changeFacilityStatusAction,
  verifyFacilityAction,
  assignStaffAction,
  updateStaffMembershipAction,
} from '@/modules/facilities/actions'
import type {
  HealthcareFacility,
  FacilityServiceMapping,
  FacilityStaffMember,
  FacilityStatusHistoryItem,
  FacilityAuditEventItem,
} from '@/modules/facilities/types'
import type {
  FacilityStatus,
  FacilityVerificationStatus,
  FacilityRole,
  StaffMembershipStatus,
} from '@/types/database'

const adminNav = [
  { label: 'System Overview', href: '/admin', icon: <Server className="size-4" /> },
  { label: 'Facility Registry', href: '/admin/facilities', icon: <Building2 className="size-4" /> },
  { label: 'User & Role Access', href: '/admin/users', icon: <Users className="size-4" /> },
  { label: 'Audit & Governance Logs', href: '/admin/audit', icon: <FileText className="size-4" /> },
  { label: 'Security & Parameters', href: '/admin/security', icon: <Settings className="size-4" /> },
]

interface FacilityDetailClientProps {
  initialFacility: HealthcareFacility
  initialServices: FacilityServiceMapping[]
  initialStaff: FacilityStaffMember[]
  initialHistory: FacilityStatusHistoryItem[]
  initialAuditTrail: FacilityAuditEventItem[]
}

export function FacilityDetailClient({
  initialFacility,
  initialServices,
  initialStaff,
  initialHistory,
  initialAuditTrail,
}: FacilityDetailClientProps) {
  const { dict: t, locale } = useLanguage()
  const isBn = locale === 'bn'

  const [facility, setFacility] = useState<HealthcareFacility>(initialFacility)
  const [services] = useState<FacilityServiceMapping[]>(initialServices)
  const [staff, setStaff] = useState<FacilityStaffMember[]>(initialStaff)
  const [history, setHistory] = useState<FacilityStatusHistoryItem[]>(initialHistory)
  const [auditTrail] = useState<FacilityAuditEventItem[]>(initialAuditTrail)

  const [activeTab, setActiveTab] = useState('overview')
  const [copiedId, setCopiedId] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Modal dialog states
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [targetStatus, setTargetStatus] = useState<FacilityStatus>(facility.status)
  const [statusReason, setStatusReason] = useState('')
  const [statusError, setStatusError] = useState<string | null>(null)

  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)
  const [targetVerificationStatus, setTargetVerificationStatus] =
    useState<FacilityVerificationStatus>(facility.verificationStatus)
  const [verificationSource, setVerificationSource] = useState(
    facility.verificationSource || 'dghs_registry'
  )
  const [verificationNotes, setVerificationNotes] = useState(facility.verificationNotes || '')

  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false)
  const [staffUserId, setStaffUserId] = useState('')
  const [staffFullName, setStaffFullName] = useState('')
  const [staffRole, setStaffRole] = useState<FacilityRole>('clinician')
  const [staffDepartment, setStaffDepartment] = useState('')
  const [staffNotes, setStaffNotes] = useState('')
  const [staffError, setStaffError] = useState<string | null>(null)

  const handleCopyId = () => {
    navigator.clipboard.writeText(facility.facilityId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  // Handle status change
  const handleApplyStatusChange = () => {
    setStatusError(null)
    if (
      (targetStatus === 'suspended' || targetStatus === 'rejected') &&
      (!statusReason || statusReason.trim().length < 10)
    ) {
      setStatusError(
        isBn
          ? 'সাময়িক স্থগিত বা বাতিলের জন্য ন্যূনতম ১০ অক্ষরের সুনির্দিষ্ট কারণ আবশ্যক'
          : 'A specific justification of at least 10 characters is required for suspension or rejection'
      )
      return
    }

    startTransition(async () => {
      const res = await changeFacilityStatusAction(facility.id, {
        status: targetStatus,
        reason: statusReason.trim() || undefined,
      })
      if (res.success && res.data) {
        setFacility(res.data)
        setIsStatusDialogOpen(false)
        setStatusReason('')
        // Append history item
        setHistory((prev) => [
          {
            id: `fsh-${Date.now()}`,
            facilityId: facility.id,
            fromStatus: facility.status,
            toStatus: targetStatus,
            changedBy: 'admin-system',
            changedByName: 'System Administrator',
            reason: statusReason.trim() || null,
            createdAt: '2026-03-01T10:00:00Z',
          },
          ...prev,
        ])
      } else {
        setStatusError(res.error || 'Failed to update status')
      }
    })
  }

  // Handle accreditation verification
  const handleApplyVerification = () => {
    startTransition(async () => {
      const res = await verifyFacilityAction(facility.id, {
        verificationStatus: targetVerificationStatus,
        verificationSource: verificationSource.trim() || 'dghs_registry',
        verificationNotes: verificationNotes.trim() || undefined,
      })
      if (res.success && res.data) {
        setFacility(res.data)
        setIsVerifyDialogOpen(false)
      }
    })
  }

  // Handle staff assignment
  const handleAssignStaff = () => {
    setStaffError(null)
    if (!staffUserId.trim() || !staffFullName.trim()) {
      setStaffError(
        isBn ? 'ব্যবহারকারী আইডি ও নাম আবশ্যক' : 'User account ID and full name are required'
      )
      return
    }

    startTransition(async () => {
      const res = await assignStaffAction(facility.id, {
        userId: staffUserId.trim(),
        fullName: staffFullName.trim(),
        facilityRole: staffRole,
        department: staffDepartment.trim() || undefined,
        approvalNotes: staffNotes.trim() || undefined,
      })
      if (res.success && res.data) {
        setStaff((prev) => [...prev, res.data])
        setIsStaffDialogOpen(false)
        setStaffUserId('')
        setStaffFullName('')
        setStaffDepartment('')
        setStaffNotes('')
      } else {
        setStaffError(res.error || 'Failed to assign staff member')
      }
    })
  }

  // Handle staff status update (revoke, suspend, reactivate)
  const handleUpdateStaffStatus = (membershipId: string, newStatus: StaffMembershipStatus) => {
    startTransition(async () => {
      const res = await updateStaffMembershipAction(facility.id, membershipId, {
        status: newStatus,
      })
      if (res.success && res.data) {
        setStaff((prev) => prev.map((m) => (m.id === membershipId ? res.data : m)))
      }
    })
  }

  const getStatusBadge = (status: HealthcareFacility['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="success" size="default" dot>
            {t.facilities.statuses.active}
          </Badge>
        )
      case 'under_review':
        return (
          <Badge variant="warning" size="default">
            {t.facilities.statuses.under_review}
          </Badge>
        )
      case 'submitted':
        return (
          <Badge variant="warning" size="default">
            {t.facilities.statuses.submitted}
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="default" size="default">
            {t.facilities.statuses.approved}
          </Badge>
        )
      case 'suspended':
        return (
          <Badge variant="destructive" size="default">
            {t.facilities.statuses.suspended}
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" size="default">
            {t.facilities.statuses.rejected}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" size="default">
            {t.facilities.statuses.draft}
          </Badge>
        )
    }
  }

  const getVerificationBadge = (vStatus: HealthcareFacility['verificationStatus']) => {
    switch (vStatus) {
      case 'verified':
        return (
          <Badge variant="success" size="default" className="gap-1.5">
            <ShieldCheck className="size-3.5" />
            {t.facilities.verificationStatuses.verified}
          </Badge>
        )
      case 'pending_verification':
        return (
          <Badge variant="warning" size="default" className="gap-1.5">
            <ShieldAlert className="size-3.5" />
            {t.facilities.verificationStatuses.pending_verification}
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" size="default">
            {t.facilities.verificationStatuses.rejected}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" size="default">
            {t.facilities.verificationStatuses.unverified}
          </Badge>
        )
    }
  }

  return (
    <DashboardLayout
      workspaceName="System Administration & Governance"
      workspaceBadge={<Badge variant="outline" size="sm">SuperAdmin Tier</Badge>}
      userName="System Administrator"
      userRole="Platform Governance Lead"
      navItems={adminNav}
    >
      <div className="space-y-6">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/facilities"
            className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'gap-1.5' })}
          >
            <ArrowLeft className="size-4" />
            <span>{t.facilities.profile.backToDirectory}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/facilities/${facility.id}/edit`}
              className={buttonVariants({ variant: 'outline', size: 'sm', className: 'gap-1.5' })}
            >
              <Edit className="size-3.5" />
              <span>{t.facilities.profile.actions.editFacility}</span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStatusDialogOpen(true)}
              className="gap-1.5"
            >
              <Activity className="size-3.5 text-primary" />
              <span>{t.facilities.profile.actions.changeStatus}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVerifyDialogOpen(true)}
              className="gap-1.5"
            >
              <ShieldCheck className="size-3.5 text-success" />
              <span>{t.facilities.profile.actions.verifyFacility}</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsStaffDialogOpen(true)}
              className="gap-1.5"
            >
              <UserPlus className="size-3.5" />
              <span>{t.facilities.profile.actions.assignStaff}</span>
            </Button>
          </div>
        </div>

        {/* Facility Profile Header Card */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-1 bg-muted rounded-md text-foreground font-semibold flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-primary" />
                  {facility.facilityId}
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                    title={t.facilities.profile.copyId}
                    aria-label={`Copy ${facility.facilityId}`}
                  >
                    {copiedId ? (
                      <Check className="size-3 text-success" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </span>
                {getStatusBadge(facility.status)}
                {getVerificationBadge(facility.verificationStatus)}
              </div>

              <h1 className="text-2xl font-bold text-foreground">
                {isBn && facility.nameBn ? facility.nameBn : facility.name}
              </h1>
              {facility.nameBn && (
                <p className="text-sm text-muted-foreground font-bengali">
                  {isBn ? facility.name : facility.nameBn}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <Badge variant="outline" size="default">
                {t.facilities.types[facility.facilityTypeId as keyof typeof t.facilities.types] ||
                  facility.facilityTypeName ||
                  facility.facilityTypeId}
              </Badge>
              <Badge variant="secondary" size="default">
                {t.facilities.ownership[
                  facility.ownershipCategoryId as keyof typeof t.facilities.ownership
                ] ||
                  facility.ownershipCategoryName ||
                  facility.ownershipCategoryId}
              </Badge>
            </div>
          </div>

          {/* Quick Info Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border text-xs">
            <div>
              <span className="text-muted-foreground block">
                {t.facilities.directory.table.location}
              </span>
              <span className="font-medium text-foreground">
                {facility.upazila}, {facility.district}, {facility.division}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">{t.facilities.register.phoneLabel}</span>
              <span className="font-medium text-foreground">{facility.contactPhone || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">
                {t.facilities.register.totalBedsLabel}
              </span>
              <span className="font-medium text-foreground">
                {facility.operationalCapacity?.totalBeds || 0} Beds (
                {facility.operationalCapacity?.icuBeds || 0} ICU)
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">{t.facilities.register.ldctLabel}</span>
              <span className="font-medium text-foreground">
                {facility.operationalCapacity?.ldctScanners || 0} Scanners
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: 'overview', label: t.facilities.profile.tabs.overview },
            {
              id: 'services',
              label: t.facilities.profile.tabs.services,
              badge: <Badge variant="secondary" size="sm">{services.length}</Badge>,
            },
            {
              id: 'staff',
              label: t.facilities.profile.tabs.staff,
              badge: <Badge variant="secondary" size="sm">{staff.length}</Badge>,
            },
            { id: 'lifecycle', label: t.facilities.profile.tabs.lifecycle },
            { id: 'audit', label: t.facilities.profile.tabs.audit },
          ]}
        />

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity & Network */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  {t.facilities.profile.cards.identity}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Internal UUID</span>
                  <span className="font-mono text-foreground">{facility.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Canonical ID</span>
                  <span className="font-mono font-semibold text-primary">
                    {facility.facilityId}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">{t.facilities.register.typeLabel}</span>
                  <span className="font-medium text-foreground">
                    {t.facilities.types[facility.facilityTypeId as keyof typeof t.facilities.types] ||
                      facility.facilityTypeName}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">
                    {t.facilities.register.ownershipLabel}
                  </span>
                  <span className="font-medium text-foreground">
                    {t.facilities.ownership[
                      facility.ownershipCategoryId as keyof typeof t.facilities.ownership
                    ] || facility.ownershipCategoryName}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">{t.facilities.register.groupLabel}</span>
                  <span className="font-medium text-foreground">
                    {facility.groupName || 'Independent Node (No Network)'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Geographic Catchment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  {t.facilities.profile.cards.location}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">
                    {t.facilities.register.divisionLabel}
                  </span>
                  <span className="font-medium text-foreground">{facility.division}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">
                    {t.facilities.register.districtLabel}
                  </span>
                  <span className="font-medium text-foreground">{facility.district}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">
                    {t.facilities.register.upazilaLabel}
                  </span>
                  <span className="font-medium text-foreground">{facility.upazila}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">{t.facilities.register.addressLabel}</span>
                  <span className="font-medium text-foreground text-right max-w-xs">
                    {facility.addressLine}
                  </span>
                </div>
                {(facility.latitude || facility.longitude) && (
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Coordinates</span>
                    <span className="font-mono text-foreground">
                      {facility.latitude?.toFixed(4)}, {facility.longitude?.toFixed(4)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Official Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Phone className="size-4 text-primary" />
                  {t.facilities.profile.cards.contacts}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">{t.facilities.register.phoneLabel}</span>
                  <span className="font-medium text-foreground">{facility.contactPhone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">{t.facilities.register.emailLabel}</span>
                  <span className="font-medium text-foreground">{facility.contactEmail || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Contact Person</span>
                  <span className="font-medium text-foreground">
                    {facility.contactPersonName || '—'}{' '}
                    {facility.contactPersonRole && `(${facility.contactPersonRole})`}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Website</span>
                  {facility.websiteUrl ? (
                    <a
                      href={facility.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {facility.websiteUrl}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Operational Capacity & Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Bed className="size-4 text-primary" />
                  {t.facilities.profile.cards.capacity}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Total Inpatient Beds</span>
                  <span className="font-semibold text-foreground">
                    {facility.operationalCapacity?.totalBeds || 0}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">ICU Beds</span>
                  <span className="font-semibold text-foreground">
                    {facility.operationalCapacity?.icuBeds || 0}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">LDCT Scanners</span>
                  <span className="font-semibold text-primary">
                    {facility.operationalCapacity?.ldctScanners || 0}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Spirometry / PFT Stations</span>
                  <span className="font-semibold text-foreground">
                    {facility.operationalCapacity?.spirometryStations || 0}
                  </span>
                </div>
                <div className="pt-2">
                  <span className="text-muted-foreground block mb-1">
                    {t.facilities.profile.cards.verification}
                  </span>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border flex items-start gap-2">
                    <ShieldCheck className="size-4 text-success shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-foreground">
                        {facility.verificationNotes || t.facilities.profile.verifiedNotice}
                      </div>
                      {facility.verificationSource && (
                        <div className="text-[10px] text-muted-foreground">
                          Authority: {facility.verificationSource}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: SERVICES & IMAGING */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {t.facilities.services.title}
                </h3>
                <p className="text-xs text-muted-foreground">{t.facilities.services.subtitle}</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-36">{t.facilities.services.table.code}</TableHead>
                    <TableHead>{t.facilities.services.table.name}</TableHead>
                    <TableHead>{t.facilities.services.table.category}</TableHead>
                    <TableHead>{t.facilities.services.table.status}</TableHead>
                    <TableHead>{t.facilities.services.table.verified}</TableHead>
                    <TableHead>{t.facilities.services.table.notes}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((srv) => (
                    <TableRow key={srv.id} className="text-xs">
                      <TableCell className="font-mono font-medium">{srv.serviceId}</TableCell>
                      <TableCell className="font-medium text-foreground">
                        {isBn && srv.serviceNameBn ? srv.serviceNameBn : srv.serviceName}
                      </TableCell>
                      <TableCell className="text-muted-foreground capitalize">
                        {srv.serviceCategory.replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            srv.availabilityStatus === 'available'
                              ? 'success'
                              : srv.availabilityStatus === 'planned'
                                ? 'default'
                                : 'outline'
                          }
                          size="sm"
                        >
                          {srv.availabilityStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {srv.isVerified ? (
                          <span className="text-success inline-flex items-center gap-1 font-medium">
                            <ShieldCheck className="size-3.5" />
                            {t.facilities.services.verifiedService}
                          </span>
                        ) : (
                          <span className="text-muted-foreground inline-flex items-center gap-1">
                            {t.facilities.services.declaredService}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {srv.notes || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* TAB 3: STAFF MEMBERSHIPS */}
        {activeTab === 'staff' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {t.facilities.staff.title}
                </h3>
                <p className="text-xs text-muted-foreground">{t.facilities.staff.subtitle}</p>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsStaffDialogOpen(true)}
                className="gap-1.5"
              >
                <UserPlus className="size-3.5" />
                <span>{t.facilities.staff.assignBtn}</span>
              </Button>
            </div>

            <div className="p-3 bg-muted/60 border border-border rounded-xl text-xs text-muted-foreground flex items-center gap-2">
              <Lock className="size-4 text-primary shrink-0" />
              <span>{t.facilities.staff.multiFacilityNotice}</span>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
              {staff.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  {t.facilities.staff.noStaff}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.facilities.staff.table.name}</TableHead>
                      <TableHead>{t.facilities.staff.table.role}</TableHead>
                      <TableHead>{t.facilities.staff.table.department}</TableHead>
                      <TableHead>{t.facilities.staff.table.status}</TableHead>
                      <TableHead>{t.facilities.staff.table.joinedAt}</TableHead>
                      <TableHead className="text-right">
                        {t.facilities.staff.table.actions}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((m) => (
                      <TableRow key={m.id} className="text-xs">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
                              {m.user?.fullName || m.userId}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {m.userId}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" size="sm">
                            {t.facilities.roles[m.facilityRole as keyof typeof t.facilities.roles] ||
                              m.facilityRole}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {m.department || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              m.status === 'active'
                                ? 'success'
                                : m.status === 'suspended'
                                  ? 'warning'
                                  : 'destructive'
                            }
                            size="sm"
                          >
                            {t.facilities.staffStatuses[
                              m.status as keyof typeof t.facilities.staffStatuses
                            ] || m.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(m.joinedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {m.status === 'active' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStaffStatus(m.id, 'suspended')}
                                disabled={isPending}
                                className="text-[10px] h-7 px-2"
                              >
                                {t.facilities.staff.table.suspend}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStaffStatus(m.id, 'active')}
                                disabled={isPending}
                                className="text-[10px] h-7 px-2"
                              >
                                {t.facilities.staff.table.reactivate}
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleUpdateStaffStatus(m.id, 'revoked')}
                              disabled={isPending}
                              className="text-[10px] h-7 px-2"
                            >
                              {t.facilities.staff.table.revoke}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: LIFECYCLE & APPROVAL */}
        {activeTab === 'lifecycle' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Activity className="size-4 text-primary" />
                    {t.facilities.lifecycle.currentStatus}
                  </CardTitle>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsStatusDialogOpen(true)}
                  >
                    {t.facilities.profile.actions.changeStatus}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  {getStatusBadge(facility.status)}
                  {facility.statusReason && (
                    <span className="text-muted-foreground italic">“{facility.statusReason}”</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <History className="size-4 text-primary" />
                  {t.facilities.lifecycle.statusHistoryTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t.facilities.lifecycle.noHistory}</p>
                ) : (
                  <div className="space-y-4 border-l-2 border-border ml-3 pl-4">
                    {history.map((item) => (
                      <div key={item.id} className="relative space-y-1">
                        <div className="absolute -left-[23px] top-1.5 size-2.5 rounded-full bg-primary" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">
                            {item.fromStatus ? `${item.fromStatus} → ` : ''}
                            <span className="text-primary">{item.toStatus}</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {item.reason && (
                          <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-lg max-w-lg">
                            Reason: {item.reason}
                          </p>
                        )}
                        <div className="text-[10px] text-muted-foreground">
                          Actor: {item.changedByName || item.changedBy}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 5: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Timestamp</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditTrail.map((ev) => (
                  <TableRow key={ev.id} className="text-xs font-mono">
                    <TableCell className="text-muted-foreground">
                      {new Date(ev.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {ev.eventType}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{ev.actorId || 'System'}</TableCell>
                    <TableCell className="text-muted-foreground max-w-md truncate">
                      {JSON.stringify(ev.details || {})}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* DIALOG 1: CHANGE FACILITY STATUS */}
      <Dialog
        open={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        title={t.facilities.lifecycle.dialogTitle}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              {t.facilities.register.cancelBtn}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleApplyStatusChange}
              disabled={isPending}
            >
              {isPending ? 'Saving...' : t.facilities.lifecycle.submitStatusChange}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {statusError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 font-medium">
              {statusError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              {t.facilities.lifecycle.newStatusLabel}
            </label>
            <Select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as FacilityStatus)}
              options={[
                { value: 'active', label: t.facilities.statuses.active },
                { value: 'approved', label: t.facilities.statuses.approved },
                { value: 'under_review', label: t.facilities.statuses.under_review },
                { value: 'submitted', label: t.facilities.statuses.submitted },
                { value: 'suspended', label: t.facilities.statuses.suspended },
                { value: 'inactive', label: t.facilities.statuses.inactive },
                { value: 'rejected', label: t.facilities.statuses.rejected },
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              {t.facilities.lifecycle.reasonLabel}
              {(targetStatus === 'suspended' || targetStatus === 'rejected') && (
                <span className="text-destructive"> * (Mandatory)</span>
              )}
            </label>
            <Textarea
              rows={3}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder={t.facilities.lifecycle.reasonPlaceholder}
            />
            {(targetStatus === 'suspended' || targetStatus === 'rejected') && (
              <p className="text-[11px] text-destructive">
                {t.facilities.lifecycle.reasonRequiredNotice}
              </p>
            )}
          </div>
        </div>
      </Dialog>

      {/* DIALOG 2: RECORD VERIFICATION */}
      <Dialog
        open={isVerifyDialogOpen}
        onClose={() => setIsVerifyDialogOpen(false)}
        title={t.facilities.verificationModal.dialogTitle}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVerifyDialogOpen(false)}
            >
              {t.facilities.register.cancelBtn}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleApplyVerification}
              disabled={isPending}
            >
              {isPending ? 'Saving...' : t.facilities.verificationModal.submitVerify}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              {t.facilities.verificationModal.newStatusLabel}
            </label>
            <Select
              value={targetVerificationStatus}
              onChange={(e) =>
                setTargetVerificationStatus(e.target.value as FacilityVerificationStatus)
              }
              options={[
                { value: 'verified', label: t.facilities.verificationStatuses.verified },
                {
                  value: 'pending_verification',
                  label: t.facilities.verificationStatuses.pending_verification,
                },
                { value: 'unverified', label: t.facilities.verificationStatuses.unverified },
                { value: 'rejected', label: t.facilities.verificationStatuses.rejected },
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              {t.facilities.verificationModal.sourceLabel}
            </label>
            <Select
              value={verificationSource}
              onChange={(e) => setVerificationSource(e.target.value)}
              options={[
                { value: 'dghs_registry', label: 'DGHS National Health Registry' },
                { value: 'bmdc_accreditation', label: 'BMDC Clinical Accreditation' },
                { value: 'mohfw_inspection', label: 'MOHFW On-site Verification' },
                { value: 'independent_audit', label: 'Independent Technical Audit' },
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              {t.facilities.verificationModal.notesLabel}
            </label>
            <Textarea
              rows={3}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder={t.facilities.verificationModal.notesPlaceholder}
            />
          </div>
        </div>
      </Dialog>

      {/* DIALOG 3: ASSIGN STAFF MEMBER */}
      <Dialog
        open={isStaffDialogOpen}
        onClose={() => setIsStaffDialogOpen(false)}
        title={t.facilities.staff.dialogTitle}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStaffDialogOpen(false)}
            >
              {t.facilities.register.cancelBtn}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleAssignStaff}
              disabled={isPending}
            >
              {isPending ? 'Assigning...' : t.facilities.staff.submitAssign}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {staffError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 font-medium">
              {staffError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              {t.facilities.staff.userSearchLabel} *
            </label>
            <Input
              value={staffUserId}
              onChange={(e) => setStaffUserId(e.target.value)}
              placeholder={t.facilities.staff.userSearchPlaceholder}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              {t.facilities.staff.userNameLabel} *
            </label>
            <Input
              value={staffFullName}
              onChange={(e) => setStaffFullName(e.target.value)}
              placeholder="e.g. Dr. Farhana Ahmed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              {t.facilities.staff.roleLabel} *
            </label>
            <Select
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value as FacilityRole)}
              options={[
                { value: 'facility_admin', label: t.facilities.roles.facility_admin },
                { value: 'clinician', label: t.facilities.roles.clinician },
                { value: 'healthcare_worker', label: t.facilities.roles.healthcare_worker },
                { value: 'nurse', label: t.facilities.roles.nurse },
                { value: 'data_entry_clerk', label: t.facilities.roles.data_entry_clerk },
                { value: 'support_staff', label: t.facilities.roles.support_staff },
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              {t.facilities.staff.departmentLabel}
            </label>
            <Input
              value={staffDepartment}
              onChange={(e) => setStaffDepartment(e.target.value)}
              placeholder={t.facilities.staff.departmentPlaceholder}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              {t.facilities.staff.approvalNotesLabel}
            </label>
            <Input
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              placeholder="e.g. Authorized under BMDC registration #12345"
            />
          </div>
        </div>
      </Dialog>
    </DashboardLayout>
  )
}
