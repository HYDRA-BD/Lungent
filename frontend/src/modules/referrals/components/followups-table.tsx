'use client'

import React, { useState } from 'react'
import {
  CalendarCheck,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  RotateCcw,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScheduleFollowUpModal } from './schedule-followup-modal'
import { RecordOutcomeModal } from './record-outcome-modal'
import type {
  PatientFollowUpItem,
  PatientFollowUpStatus,
  FollowUpPurpose,
} from '../types'

export interface FollowUpsTableProps {
  initialFollowUps: PatientFollowUpItem[]
  onRefresh?: () => void
  userRole?: 'clinician' | 'healthcare_worker' | 'admin'
}

export function FollowUpsTable({
  initialFollowUps,
  onRefresh,
}: FollowUpsTableProps) {
  const [followUps, setFollowUps] = useState<PatientFollowUpItem[]>(initialFollowUps)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [outcomeFollowUp, setOutcomeFollowUp] = useState<PatientFollowUpItem | null>(null)
  const [rescheduleFollowUp, setRescheduleFollowUp] = useState<PatientFollowUpItem | null>(null)

  const handleUpdated = (updated: PatientFollowUpItem) => {
    setFollowUps((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    )
    if (onRefresh) onRefresh()
  }

  const filteredFollowUps = followUps.filter((fu) => {
    const matchesSearch =
      searchQuery === '' ||
      fu.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fu.patientCanonicalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fu.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fu.referralCanonicalId && fu.referralCanonicalId.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus =
      statusFilter === 'all' || fu.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getPurposeLabel = (purpose: FollowUpPurpose) => {
    switch (purpose) {
      case 'post_imaging_review':
        return 'Post-Imaging Review (LDCT)'
      case 'treatment_monitoring':
        return 'Treatment Monitoring'
      case 'symptom_reassessment':
        return 'Symptom Reassessment'
      case 'specialist_consultation':
        return 'Specialist Pulmonology'
      case 'smoking_cessation':
        return 'Smoking Cessation Counseling'
      case 'routine_check':
        return 'Routine Surveillance'
      default:
        return purpose
    }
  }

  const getStatusBadge = (status: PatientFollowUpStatus) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" className="text-xs flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        )
      case 'overdue':
        return (
          <Badge variant="destructive" className="text-xs flex items-center gap-1 animate-pulse">
            <AlertTriangle className="h-3 w-3" />
            Overdue
          </Badge>
        )
      case 'scheduled':
        return (
          <Badge variant="info" className="text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Scheduled
          </Badge>
        )
      case 'rescheduled':
        return (
          <Badge variant="warning" className="text-xs flex items-center gap-1">
            <RotateCcw className="h-3 w-3" />
            Rescheduled
          </Badge>
        )
      case 'missed':
        return (
          <Badge variant="destructive" className="text-xs flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Did Not Attend
          </Badge>
        )
      case 'cancelled':
        return <Badge variant="secondary" className="text-xs">Cancelled</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Patient Name, ID, or Purpose..."
            className="pl-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Follow-Up Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="overdue">Overdue</option>
          <option value="rescheduled">Rescheduled</option>
          <option value="completed">Completed</option>
          <option value="missed">Missed (DNA)</option>
        </select>
      </div>

      {/* Follow-Ups List */}
      {filteredFollowUps.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center space-y-2">
            <CalendarCheck className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-semibold text-foreground">No follow-ups found</h3>
            <p className="text-xs text-muted-foreground">
              No patient appointments match the selected search or status criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredFollowUps.map((fu) => (
            <Card
              key={fu.id}
              className={`border transition-all hover:border-primary/40 ${
                fu.status === 'overdue'
                  ? 'border-red-500/50 bg-red-500/[0.03]'
                  : fu.status === 'completed'
                  ? 'border-border/60 opacity-90'
                  : 'border-border'
              }`}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {getPurposeLabel(fu.purpose)}
                      </span>
                      {getStatusBadge(fu.status)}
                      {fu.referralCanonicalId && (
                        <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                          Linked: {fu.referralCanonicalId}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-foreground">
                        {fu.patientName}{' '}
                        <span className="text-xs font-mono font-normal text-muted-foreground">
                          ({fu.patientCanonicalId})
                        </span>
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span className="font-medium text-foreground">
                          {fu.scheduledDate} {fu.scheduledTime ? `at ${fu.scheduledTime}` : ''}
                        </span>
                        <span>• Responsible: {fu.responsibleProviderName}</span>
                      </div>
                    </div>

                    {fu.instructions && (
                      <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border/50">
                        <strong>Instructions:</strong> {fu.instructions}
                      </p>
                    )}

                    {fu.outcomeNotes && (
                      <div className="text-xs bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 p-2 rounded border border-emerald-500/20">
                        <strong>Clinical Outcome:</strong> {fu.outcomeNotes}
                      </div>
                    )}

                    {fu.rescheduledReason && (
                      <div className="text-xs text-amber-800 dark:text-amber-200 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                        <strong>Rescheduled from {fu.rescheduledFromDate}:</strong> {fu.rescheduledReason}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {fu.status !== 'completed' && (
                    <div className="flex md:flex-col items-center gap-2 shrink-0 self-end md:self-start">
                      <Button
                        variant="default"
                        size="sm"
                        className="text-xs gap-1.5 w-full justify-center"
                        onClick={() => setOutcomeFollowUp(fu)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Record Outcome
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5 w-full justify-center"
                        onClick={() => setRescheduleFollowUp(fu)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reschedule
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Record Outcome Modal */}
      <RecordOutcomeModal
        followUp={outcomeFollowUp}
        isOpen={!!outcomeFollowUp}
        onClose={() => setOutcomeFollowUp(null)}
        onSuccess={handleUpdated}
      />

      {/* Reschedule Modal */}
      <ScheduleFollowUpModal
        existingFollowUp={rescheduleFollowUp}
        isOpen={!!rescheduleFollowUp}
        onClose={() => setRescheduleFollowUp(null)}
        onSuccess={handleUpdated}
      />
    </div>
  )
}
