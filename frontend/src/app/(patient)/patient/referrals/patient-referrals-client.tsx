'use client'

import React from 'react'
import {
  Share2,
  Building2,
  UserCheck,
  Calendar,
  Phone,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  Info,
} from 'lucide-react'
import { useLanguage } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { HealthcareReferralItem, PatientFollowUpItem } from '@/modules/referrals/types'

interface PatientReferralsClientProps {
  referrals: HealthcareReferralItem[]
  followUps?: PatientFollowUpItem[]
}

export function PatientReferralsClient({ referrals, followUps = [] }: PatientReferralsClientProps) {
  const { dict } = useLanguage()
  const pt = dict.patientPortal

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </Badge>
        )
      case 'in_progress':
        return (
          <Badge variant="info" className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            In Progress
          </Badge>
        )
      case 'scheduled':
        return (
          <Badge variant="outline" className="border-primary text-primary flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Scheduled
          </Badge>
        )
      case 'submitted':
      case 'pending':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Pending Coordination
          </Badge>
        )
      case 'cancelled':
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {pt.referrals.title}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm max-w-3xl">
          {pt.referrals.subtitle}
        </p>
      </div>

      {/* Patient Reassurance & Clinical Safety Disclaimer */}
      <Alert className="border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-100">
        <Info className="h-5 w-5 text-primary shrink-0" />
        <div className="space-y-1">
          <AlertTitle className="text-sm font-semibold">Important Clinical Reassurance</AlertTitle>
          <AlertDescription className="text-xs leading-relaxed">
            A healthcare referral or follow-up recommendation coordinates specialist evaluation, further chest diagnostics, or preventive checkups. <strong>It does NOT mean you have lung cancer.</strong> Our team arranges these evaluations to ensure your respiratory health is safeguarded early and thoroughly.
          </AlertDescription>
        </div>
      </Alert>

      {/* Scheduled Follow-ups section if any */}
      {followUps.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Scheduled Follow-Up Consultations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {followUps.map((fu) => (
              <Card key={fu.id} className="border-border">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {fu.purpose.replace(/_/g, ' ')}
                    </span>
                    <Badge variant={fu.status === 'completed' ? 'success' : fu.status === 'overdue' ? 'destructive' : 'info'}>
                      {fu.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    {fu.scheduledDate} {fu.scheduledTime ? `at ${fu.scheduledTime}` : ''}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Facility: <span className="text-foreground">{fu.facilityName}</span> • Responsible: {fu.responsibleProviderName}
                  </p>
                  {fu.instructions && (
                    <p className="text-xs bg-muted/30 p-2 rounded border border-border/50 text-muted-foreground">
                      <strong>Instructions:</strong> {fu.instructions}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Referrals List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
          <Share2 className="h-5 w-5 text-primary" />
          Specialist Hospital Referrals
        </h2>

        {referrals.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-12 text-center space-y-3">
              <Share2 className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="text-base font-semibold text-foreground">
                {pt.referrals.noReferrals}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                If an attending clinician recommends specialist care or advanced low-dose CT imaging, your referral details and progress will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {referrals.map((ref) => (
              <Card key={ref.id} className="border-border overflow-hidden">
                <CardHeader className="bg-muted/15 border-b border-border pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        Referral ID: {ref.referralId || ref.id}
                      </span>
                      <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                        <Building2 className="h-5 w-5 text-primary" />
                        {ref.destinationFacilityName}
                      </CardTitle>
                      {ref.destinationDepartment && (
                        <p className="text-xs text-muted-foreground">
                          Department: {ref.destinationDepartment}
                        </p>
                      )}
                    </div>
                    <div>{getStatusBadge(ref.status)}</div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Reason for Referral */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {pt.referrals.reason}
                    </span>
                    <p className="text-base font-medium text-foreground">
                      {ref.reason}
                    </p>
                  </div>

                  {/* Grid Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4 text-primary" />
                        {pt.referrals.referringClinician}
                      </span>
                      <p className="text-sm font-semibold text-foreground">
                        {ref.referringProviderName || 'Authorized Clinician'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {ref.referringFacilityName}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary" />
                        Appointment / Date
                      </span>
                      <p className="text-sm font-semibold text-foreground">
                        {ref.appointmentDate
                          ? new Date(ref.appointmentDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Awaiting scheduling'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Referred: {new Date(ref.referralDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-primary" />
                        {pt.referrals.contact}
                      </span>
                      <p className="text-sm font-semibold text-foreground">
                        {ref.contactPhone || 'Contact Desk'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ref.appointmentLocation || 'Facility Reception'}
                      </p>
                    </div>
                  </div>

                  {/* Instructions Box */}
                  {ref.instructions && (
                    <div className="p-4 rounded-lg border border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/20 space-y-1">
                      <span className="text-xs font-semibold text-teal-900 dark:text-teal-200 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                        {pt.referrals.instructions}
                      </span>
                      <p className="text-sm text-teal-950 dark:text-teal-100 font-medium leading-relaxed">
                        {ref.instructions}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
