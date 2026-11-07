'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  ExternalLink,
  Plus,
  Loader2,
  Check,
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
import { updateFollowUpPlanStatusAction } from '@/modules/clinical/actions'
import { CreateFollowUpModal } from '@/modules/clinical/components/create-follow-up-modal'
import type { ClinicalFollowUpPlanItem } from '@/modules/clinical/types'

interface ClinicalFollowUpsClientProps {
  initialFollowUps: ClinicalFollowUpPlanItem[]
}

export function ClinicalFollowUpsClient({ initialFollowUps }: ClinicalFollowUpsClientProps) {
  const { locale, dict } = useLanguage()
  const isBn = locale === 'bn'
  const fT = dict.clinicalWorkspace.followUps

  const [followUps, setFollowUps] = useState<ClinicalFollowUpPlanItem[]>(initialFollowUps)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const navItems = getClinicalNav(isBn, {
    followUps: followUps.filter((f) => f.status === 'planned' || f.status === 'pending').length,
  })

  const handleMarkCompleted = async (id: string) => {
    setUpdatingId(id)
    try {
      const res = await updateFollowUpPlanStatusAction({
        followUpId: id,
        status: 'completed',
        notes: 'Completed in clinician follow-up review session.',
      })
      if (res.success && res.data) {
        setFollowUps((prev) => prev.map((item) => (item.id === id ? res.data! : item)))
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'overdue':
        return 'destructive'
      case 'pending':
        return 'warning'
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
          title={fT.title}
          description={fT.subtitle}
          actions={
            <Button onClick={() => setIsScheduleModalOpen(true)} className="gap-2">
              <Plus className="size-4" />
              {fT.scheduleBtn}
            </Button>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {isBn ? `নির্ধারিত ফলো-আপ পরিকল্পনা (${followUps.length})` : `Active Follow-Up Plans (${followUps.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? 'রোগী' : 'Patient'}</TableHead>
                  <TableHead>{fT.dateLabel}</TableHead>
                  <TableHead>{fT.instructionsLabel}</TableHead>
                  <TableHead>{isBn ? 'অবস্থা' : 'Status'}</TableHead>
                  <TableHead className="text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {followUps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
                      {fT.noFollowUps}
                    </TableCell>
                  </TableRow>
                ) : (
                  followUps.map((fp) => (
                    <TableRow key={fp.id}>
                      <TableCell>
                        <div className="font-semibold text-foreground">{fp.patientName}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {fp.patientCanonicalId}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-medium text-foreground text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-primary" />
                          {fp.recommendedReviewDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-foreground">{fp.instructions}</div>
                        {fp.notes && (
                          <div className="text-xs text-muted-foreground truncate max-w-xs">{fp.notes}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(fp.status)} className="text-xs">
                          {fT.status[fp.status] || fp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {fp.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 text-xs"
                              disabled={updatingId === fp.id}
                              onClick={() => handleMarkCompleted(fp.id)}
                            >
                              {updatingId === fp.id ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Check className="size-3 text-emerald-600" />
                              )}
                              {fT.markCompleted}
                            </Button>
                          )}
                          <Link href={`/clinical/patients/${fp.patientId}`}>
                            <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs">
                              {isBn ? 'প্রোফাইল' : 'Profile'}
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

      {/* Schedule Follow-Up Modal (Defaulted to Rafiqul Islam for quick creation) */}
      {isScheduleModalOpen && (
        <CreateFollowUpModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          patientId="11111111-1111-4111-a111-111111111111"
          patientName="Md. Rafiqul Islam"
          onSuccess={(plan) => setFollowUps((prev) => [plan, ...prev])}
        />
      )}
    </DashboardLayout>
  )
}
