'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  AlertTriangle,
  Stethoscope,
  ExternalLink,
  Calendar,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
import { searchClinicalPatientsAction } from '@/modules/clinical/actions'
import type { ClinicalPatientSummary } from '@/modules/clinical/types'
import type { ClinicalReviewStatus } from '@/types/database'

interface ClinicalPatientsClientProps {
  initialData: {
    patients: ClinicalPatientSummary[]
    total: number
    page: number
    limit: number
  }
}

export function ClinicalPatientsClient({ initialData }: ClinicalPatientsClientProps) {
  const { locale, dict } = useLanguage()
  const isBn = locale === 'bn'
  const pT = dict.clinicalWorkspace.patients

  const [patients, setPatients] = useState<ClinicalPatientSummary[]>(initialData.patients)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [onlyAlerts, setOnlyAlerts] = useState(false)
  const [isPending, startTransition] = useTransition()

  const navItems = getClinicalNav(isBn)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery, selectedStatus, onlyAlerts)
  }

  const performSearch = (query: string, status: string, hasAlerts: boolean) => {
    startTransition(async () => {
      const res = await searchClinicalPatientsAction({
        query: query.trim() || undefined,
        reviewStatus: status !== 'all' ? (status as ClinicalReviewStatus) : undefined,
        hasAlerts: hasAlerts || undefined,
        limit: 50,
      })
      if (res.success && res.data) {
        setPatients(res.data.patients)
      }
    })
  }

  const getStatusBadgeVariant = (status: ClinicalReviewStatus) => {
    switch (status) {
      case 'reviewed':
      case 'closed':
        return 'success'
      case 'under_review':
        return 'warning'
      case 'info_required':
        return 'destructive'
      default:
        return 'default'
    }
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
        <PageHeader
          title={pT.title}
          description={pT.subtitle}
        />

        {/* Filter & Search Bar */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={pT.searchPlaceholder}
                  className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value)
                    performSearch(searchQuery, e.target.value, onlyAlerts)
                  }}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">{pT.filterAllStatuses}</option>
                  <option value="pending_review">{pT.status.pending_review}</option>
                  <option value="under_review">{pT.status.under_review}</option>
                  <option value="info_required">{pT.status.info_required}</option>
                  <option value="reviewed">{pT.status.reviewed}</option>
                  <option value="closed">{pT.status.closed}</option>
                </select>

                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={onlyAlerts}
                    onChange={(e) => {
                      setOnlyAlerts(e.target.checked)
                      performSearch(searchQuery, selectedStatus, e.target.checked)
                    }}
                    className="size-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span>{pT.filterCriticalOnly}</span>
                </label>

                <Button type="submit" size="sm" disabled={isPending} className="gap-2">
                  <Filter className="size-4" />
                  {isBn ? 'ফিল্টার' : 'Filter'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Patients Data Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-base font-semibold">
              {isBn ? `রোগীর তালিকা (${patients.length})` : `Patients Roster (${patients.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{pT.table.patient}</TableHead>
                  <TableHead>{pT.table.facility}</TableHead>
                  <TableHead>{pT.table.reviewStatus}</TableHead>
                  <TableHead>{pT.table.alerts}</TableHead>
                  <TableHead>{pT.table.lastAssessment}</TableHead>
                  <TableHead>{pT.table.nextFollowUp}</TableHead>
                  <TableHead className="text-right">{pT.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                      {pT.noPatients}
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-semibold text-foreground">{p.fullName}</div>
                        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                          <span>{p.canonicalId}</span>
                          <span>•</span>
                          <span>
                            {p.age}y / {p.gender}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{p.primaryPhone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-foreground">{p.facilityName}</div>
                        <div className="text-xs text-muted-foreground">{p.facilityDistrict}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(p.reviewStatus)}>
                          {pT.status[p.reviewStatus] || p.reviewStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {p.activeAlertsCount > 0 ? (
                          <Badge
                            variant={p.hasCriticalAlert ? 'destructive' : 'warning'}
                            className="gap-1 font-semibold"
                          >
                            <AlertTriangle className="size-3" />
                            {p.activeAlertsCount} {p.hasCriticalAlert ? 'CRITICAL' : 'Alert'}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {p.lastAssessmentType ? (
                          <div>
                            <div className="text-xs font-medium text-foreground">
                              {p.lastAssessmentType.replace(/_/g, ' ')}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {p.lastAssessmentDate ? p.lastAssessmentDate.slice(0, 10) : '—'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {p.nextFollowUpDate ? (
                          <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                            <Calendar className="size-3 text-primary" />
                            {p.nextFollowUpDate}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/clinical/patients/${p.id}/review`}>
                            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
                              <Stethoscope className="size-3" />
                              {pT.table.startReview}
                            </Button>
                          </Link>
                          <Link href={`/clinical/patients/${p.id}`}>
                            <Button size="sm" variant="default" className="h-8 gap-1 text-xs">
                              {pT.table.viewProfile}
                              <ExternalLink className="size-3" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
