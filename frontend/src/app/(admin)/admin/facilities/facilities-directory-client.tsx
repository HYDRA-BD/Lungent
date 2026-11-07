'use client'

import React, { useState, useEffect, useTransition, useMemo } from 'react'
import Link from 'next/link'
import {
  Building2,
  Search,
  Plus,
  Server,
  Users,
  FileText,
  Settings,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Bed,
  Scan,
  MapPin,
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
import { StatCard } from '@/components/ui/stat-card'
import { useLanguage } from '@/i18n'
import { searchFacilitiesAction } from '@/modules/facilities/actions'
import { BANGLADESH_DIVISIONS } from '@/modules/facilities/geographic-data'
import type { HealthcareFacility } from '@/modules/facilities/types'

const adminNav = [
  { label: 'System Overview', href: '/admin', icon: <Server className="size-4" /> },
  { label: 'Facility Registry', href: '/admin/facilities', icon: <Building2 className="size-4" /> },
  { label: 'Facility Map', href: '/admin/facilities/map', icon: <MapPin className="size-4" /> },
  { label: 'User & Role Access', href: '/admin/users', icon: <Users className="size-4" /> },
  { label: 'Audit & Governance Logs', href: '/admin/audit', icon: <FileText className="size-4" /> },
  { label: 'Security & Parameters', href: '/admin/security', icon: <Settings className="size-4" /> },
]

export function FacilitiesDirectoryClient() {
  const { dict: t, locale } = useLanguage()
  const isBn = locale === 'bn'

  const [facilities, setFacilities] = useState<HealthcareFacility[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Filter state
  const [query, setQuery] = useState('')
  const [selectedDivision, setSelectedDivision] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  // Fetch facilities
  const fetchFacilities = () => {
    startTransition(async () => {
      const res = await searchFacilitiesAction({
        query: query.trim() || undefined,
        division: selectedDivision || undefined,
        facilityTypeId: selectedType || undefined,
        status: (selectedStatus as HealthcareFacility['status']) || undefined,
        page: 1,
        pageSize: 50,
      })
      if (res.success && res.data) {
        setFacilities(res.data.facilities)
        setTotalCount(res.data.totalCount)
      }
    })
  }

  useEffect(() => {
    fetchFacilities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDivision, selectedType, selectedStatus])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchFacilities()
  }

  const handleResetFilters = () => {
    setQuery('')
    setSelectedDivision('')
    setSelectedType('')
    setSelectedStatus('')
    startTransition(async () => {
      const res = await searchFacilitiesAction({ page: 1, pageSize: 50 })
      if (res.success && res.data) {
        setFacilities(res.data.facilities)
        setTotalCount(res.data.totalCount)
      }
    })
  }

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Aggregate stats
  const stats = useMemo(() => {
    let active = 0
    let underReview = 0
    let totalBeds = 0
    let totalScanners = 0

    for (const f of facilities) {
      if (f.status === 'active') active++
      if (f.status === 'under_review' || f.status === 'submitted') underReview++
      if (f.operationalCapacity?.totalBeds) totalBeds += f.operationalCapacity.totalBeds
      if (f.operationalCapacity?.ldctScanners) totalScanners += f.operationalCapacity.ldctScanners
    }

    return {
      total: totalCount || facilities.length,
      active,
      underReview,
      totalBeds,
      totalScanners,
    }
  }, [facilities, totalCount])

  const getStatusBadge = (status: HealthcareFacility['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="success" size="sm" dot>
            {t.facilities.statuses.active}
          </Badge>
        )
      case 'under_review':
        return (
          <Badge variant="warning" size="sm">
            {t.facilities.statuses.under_review}
          </Badge>
        )
      case 'submitted':
        return (
          <Badge variant="warning" size="sm">
            {t.facilities.statuses.submitted}
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="default" size="sm">
            {t.facilities.statuses.approved}
          </Badge>
        )
      case 'suspended':
        return (
          <Badge variant="destructive" size="sm">
            {t.facilities.statuses.suspended}
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" size="sm">
            {t.facilities.statuses.rejected}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" size="sm">
            {t.facilities.statuses.draft}
          </Badge>
        )
    }
  }

  const getVerificationBadge = (vStatus: HealthcareFacility['verificationStatus']) => {
    switch (vStatus) {
      case 'verified':
        return (
          <Badge variant="success" size="sm" className="gap-1">
            <ShieldCheck className="size-3" />
            {t.facilities.verificationStatuses.verified}
          </Badge>
        )
      case 'pending_verification':
        return (
          <Badge variant="warning" size="sm" className="gap-1">
            <ShieldAlert className="size-3" />
            {t.facilities.verificationStatuses.pending_verification}
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" size="sm">
            {t.facilities.verificationStatuses.rejected}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" size="sm">
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
        <PageHeader
          title={t.facilities.directory.title}
          description={t.facilities.directory.subtitle}
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/admin/facilities/map"
                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'gap-2' })}
                data-testid="interactive-map-btn"
              >
                <MapPin className="size-4 text-primary" />
                {isBn ? 'ইন্টারেক্টিভ মানচিত্র' : 'Interactive Map'}
              </Link>
              <Link
                href="/admin/facilities/register"
                className={buttonVariants({ variant: 'default', size: 'sm', className: 'gap-2' })}
              >
                <Plus className="size-4" />
                {t.facilities.directory.registerBtn}
              </Link>
            </div>
          }
        />

        {/* Aggregate Network Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            title={t.facilities.directory.stats.totalFacilities}
            value={stats.total.toString()}
            icon={<Building2 className="size-4" />}
          />
          <StatCard
            title={t.facilities.directory.stats.activeFacilities}
            value={stats.active.toString()}
            badge={<Badge variant="success" size="sm">{stats.active} live</Badge>}
            icon={<Building2 className="size-4" />}
          />
          <StatCard
            title={t.facilities.directory.stats.underReview}
            value={stats.underReview.toString()}
            badge={<Badge variant="warning" size="sm">Pending</Badge>}
            icon={<ShieldAlert className="size-4" />}
          />
          <StatCard
            title={t.facilities.directory.stats.totalBeds}
            value={stats.totalBeds.toLocaleString()}
            icon={<Bed className="size-4" />}
          />
          <StatCard
            title={t.facilities.directory.stats.ldctScanners}
            value={stats.totalScanners.toString()}
            badge={<Badge variant="outline" size="sm">High-Tech</Badge>}
            icon={<Scan className="size-4" />}
          />
        </div>

        {/* Query & Filter Toolbar */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.facilities.directory.searchPlaceholder}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                options={[
                  { value: '', label: t.facilities.directory.allDivisions },
                  ...BANGLADESH_DIVISIONS.map((d) => ({
                    value: d.name,
                    label: isBn ? d.nameBn : d.name,
                  })),
                ]}
                className="w-40"
              />

              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                options={[
                  { value: '', label: t.facilities.directory.allTypes },
                  { value: 'specialized_hospital', label: t.facilities.types.specialized_hospital },
                  { value: 'public_hospital', label: t.facilities.types.public_hospital },
                  { value: 'private_hospital', label: t.facilities.types.private_hospital },
                  { value: 'specialized_clinic', label: t.facilities.types.specialized_clinic },
                  { value: 'general_clinic', label: t.facilities.types.general_clinic },
                  { value: 'primary_healthcare_facility', label: t.facilities.types.primary_healthcare_facility },
                  { value: 'community_clinic', label: t.facilities.types.community_clinic },
                  { value: 'community_health_programme', label: t.facilities.types.community_health_programme },
                ]}
                className="w-44"
              />

              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                options={[
                  { value: '', label: t.facilities.directory.allStatuses },
                  { value: 'active', label: t.facilities.statuses.active },
                  { value: 'under_review', label: t.facilities.statuses.under_review },
                  { value: 'submitted', label: t.facilities.statuses.submitted },
                  { value: 'approved', label: t.facilities.statuses.approved },
                  { value: 'suspended', label: t.facilities.statuses.suspended },
                  { value: 'rejected', label: t.facilities.statuses.rejected },
                ]}
                className="w-40"
              />

              <Button type="submit" variant="default" size="default" disabled={isPending}>
                <Search className="size-4 mr-1.5" />
                {isBn ? 'অনুসন্ধান' : 'Search'}
              </Button>

              {(query || selectedDivision || selectedType || selectedStatus) && (
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={handleResetFilters}
                  disabled={isPending}
                >
                  <RotateCcw className="size-4 mr-1.5" />
                  {t.facilities.directory.resetFilters}
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Facilities Table */}
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          {facilities.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Building2 className="size-12 mx-auto text-muted-foreground/60" />
              <h3 className="text-lg font-semibold text-foreground">
                {t.facilities.directory.noResultsTitle}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {t.facilities.directory.noResultsDesc}
              </p>
              {(query || selectedDivision || selectedType || selectedStatus) && (
                <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2">
                  {t.facilities.directory.resetFilters}
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-44">{t.facilities.directory.table.id}</TableHead>
                  <TableHead>{t.facilities.directory.table.name}</TableHead>
                  <TableHead>{t.facilities.directory.table.type}</TableHead>
                  <TableHead>{t.facilities.directory.table.location}</TableHead>
                  <TableHead>{t.facilities.directory.table.status}</TableHead>
                  <TableHead>{t.facilities.directory.table.verification}</TableHead>
                  <TableHead className="text-right">{t.facilities.directory.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facilities.map((facility) => {
                  const isCopied = copiedId === facility.facilityId
                  return (
                    <TableRow key={facility.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span>{facility.facilityId}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyId(e, facility.facilityId)}
                            className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title={t.facilities.profile.copyId}
                            aria-label={`Copy ${facility.facilityId}`}
                          >
                            {isCopied ? (
                              <Check className="size-3.5 text-success" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <Link
                            href={`/admin/facilities/${facility.id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors hover:underline"
                          >
                            {isBn && facility.nameBn ? facility.nameBn : facility.name}
                          </Link>
                          {isBn && facility.nameBn && (
                            <span className="text-xs text-muted-foreground">{facility.name}</span>
                          )}
                          {!isBn && facility.nameBn && (
                            <span className="text-xs text-muted-foreground font-bengali">
                              {facility.nameBn}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-foreground">
                            {t.facilities.types[facility.facilityTypeId as keyof typeof t.facilities.types] ||
                              facility.facilityTypeName ||
                              facility.facilityTypeId}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t.facilities.ownership[
                              facility.ownershipCategoryId as keyof typeof t.facilities.ownership
                            ] ||
                              facility.ownershipCategoryName ||
                              facility.ownershipCategoryId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div className="font-medium text-foreground">
                            {facility.upazila}, {facility.district}
                          </div>
                          <div className="text-muted-foreground">{facility.division} Division</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(facility.status)}</TableCell>
                      <TableCell>{getVerificationBadge(facility.verificationStatus)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/facilities/${facility.id}`}
                            className={buttonVariants({
                              variant: 'ghost',
                              size: 'sm',
                              className: 'gap-1 text-xs',
                            })}
                          >
                            <span>{t.facilities.directory.table.viewDetails}</span>
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
