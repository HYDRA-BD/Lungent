'use client'

import React, { useState } from 'react'
import {
  Share2,
  Building2,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  User,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ReferralStatusModal } from './referral-status-modal'
import { ScheduleFollowUpModal } from './schedule-followup-modal'
import type {
  HealthcareReferralItem,
  ReferralPriority,
  ReferralLifecycleStatus,
} from '../types'

export interface ReferralsTableProps {
  initialReferrals: HealthcareReferralItem[]
  onRefresh?: () => void
  userRole?: 'clinician' | 'healthcare_worker' | 'admin'
}

export function ReferralsTable({
  initialReferrals,
  onRefresh,
}: ReferralsTableProps) {
  const [referrals, setReferrals] = useState<HealthcareReferralItem[]>(initialReferrals)
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeModalReferral, setActiveModalReferral] = useState<HealthcareReferralItem | null>(null)
  const [followUpReferral, setFollowUpReferral] = useState<HealthcareReferralItem | null>(null)

  const handleStatusUpdated = (updated: HealthcareReferralItem) => {
    setReferrals((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    )
    if (onRefresh) onRefresh()
  }

  const filteredReferrals = referrals.filter((ref) => {
    const matchesSearch =
      searchQuery === '' ||
      ref.referralId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.patientCanonicalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.destinationFacilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.reason.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPriority =
      priorityFilter === 'all' || ref.priority === priorityFilter

    const matchesStatus =
      statusFilter === 'all' || ref.status === statusFilter

    return matchesSearch && matchesPriority && matchesStatus
  })

  const getPriorityBadge = (priority: ReferralPriority) => {
    switch (priority) {
      case 'urgent_2ww':
        return (
          <Badge variant="destructive" className="font-semibold text-xs animate-pulse">
            Urgent 2WW
          </Badge>
        )
      case 'priority':
        return (
          <Badge variant="warning" className="font-semibold text-xs">
            Priority
          </Badge>
        )
      case 'routine':
        return (
          <Badge variant="info" className="font-semibold text-xs">
            Routine
          </Badge>
        )
      case 'elective':
        return (
          <Badge variant="outline" className="font-semibold text-xs text-muted-foreground">
            Elective
          </Badge>
        )
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const getStatusBadge = (status: ReferralLifecycleStatus) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" className="text-xs flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        )
      case 'in_progress':
        return (
          <Badge variant="info" className="text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        )
      case 'scheduled':
        return (
          <Badge variant="outline" className="text-xs border-primary text-primary font-medium flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Scheduled
          </Badge>
        )
      case 'accepted':
        return (
          <Badge variant="info" className="text-xs">
            Accepted
          </Badge>
        )
      case 'submitted':
        return (
          <Badge variant="warning" className="text-xs">
            Submitted
          </Badge>
        )
      case 'rejected':
      case 'cancelled':
        return (
          <Badge variant="destructive" className="text-xs flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {status.toUpperCase()}
          </Badge>
        )
      case 'closed':
        return <Badge variant="secondary" className="text-xs">Closed</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Referral ID, Patient Name, ID, or Destination..."
            className="pl-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            className="h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="urgent_2ww">Urgent 2WW</option>
            <option value="priority">Priority</option>
            <option value="routine">Routine</option>
            <option value="elective">Elective</option>
          </select>

          <select
            className="h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="accepted">Accepted</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Referrals List */}
      {filteredReferrals.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center space-y-2">
            <Share2 className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-semibold text-foreground">No referrals match your filters</h3>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search criteria or priority filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReferrals.map((ref) => (
            <Card
              key={ref.id}
              className={`border transition-all hover:border-primary/40 ${
                ref.priority === 'urgent_2ww'
                  ? 'border-red-500/40 bg-red-500/[0.02]'
                  : 'border-border'
              }`}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: ID, Patient, Reason, Destination */}
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">
                        {ref.referralId}
                      </span>
                      {getPriorityBadge(ref.priority)}
                      {getStatusBadge(ref.status)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(ref.referralDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-foreground">
                        {ref.patientName}{' '}
                        <span className="text-xs font-mono font-normal text-muted-foreground">
                          ({ref.patientCanonicalId})
                        </span>
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        <strong className="text-foreground">Indication:</strong> {ref.reason}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-border/60">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">
                          {ref.destinationFacilityName}
                          {ref.destinationDepartment ? ` (${ref.destinationDepartment})` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          Referred by: {ref.referringProviderName} ({ref.referringFacilityName})
                        </span>
                      </div>
                    </div>

                    {/* Appointment Notice if Scheduled */}
                    {ref.status === 'scheduled' && ref.appointmentDate && (
                      <div className="bg-primary/5 border border-primary/20 rounded p-2 text-xs flex items-center justify-between">
                        <span className="text-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          Appointment: {new Date(ref.appointmentDate).toLocaleString()}
                        </span>
                        {ref.appointmentLocation && (
                          <span className="text-muted-foreground truncate max-w-xs">
                            {ref.appointmentLocation}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex md:flex-col items-center gap-2 shrink-0 self-end md:self-start">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5 w-full justify-center"
                      onClick={() => setActiveModalReferral(ref)}
                    >
                      Manage Status
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs gap-1.5 w-full justify-center"
                      onClick={() => setFollowUpReferral(ref)}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      Plan Follow-Up
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Referral Status Transition Modal */}
      <ReferralStatusModal
        referral={activeModalReferral}
        isOpen={!!activeModalReferral}
        onClose={() => setActiveModalReferral(null)}
        onSuccess={handleStatusUpdated}
      />

      {/* Plan Follow-Up Modal */}
      {followUpReferral && (
        <ScheduleFollowUpModal
          isOpen={!!followUpReferral}
          onClose={() => setFollowUpReferral(null)}
          onSuccess={() => {
            if (onRefresh) onRefresh()
          }}
          patientId={followUpReferral.patientId}
          patientName={followUpReferral.patientName}
          patientCanonicalId={followUpReferral.patientCanonicalId}
          referralId={followUpReferral.id}
          referralCanonicalId={followUpReferral.referralId}
        />
      )}
    </div>
  )
}
