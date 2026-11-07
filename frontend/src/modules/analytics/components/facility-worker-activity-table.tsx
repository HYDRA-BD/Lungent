'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import type { FacilityStatisticsSummary, HealthcareWorkerStatisticsSummary } from '../types'
import { useLanguage } from '@/i18n'
import { Building2, Users, CheckCircle, Clock } from 'lucide-react'

export interface FacilityWorkerActivityTableProps {
  facilities: FacilityStatisticsSummary
  workers: HealthcareWorkerStatisticsSummary
}

export function FacilityWorkerActivityTable({
  facilities,
  workers,
}: FacilityWorkerActivityTableProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  return (
    <div className="space-y-4">
      {/* 1. Worker Outreach Summary Banner (Strictly Non-Punitive) */}
      <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <Users className="size-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">
                  {isBn ? 'কমিউনিটি স্বাস্থ্যকর্মীদের অপারেশনাল সেবাকর্ম' : 'Community Healthcare Worker Field Outreach'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {isBn
                    ? 'তৃণমূল পর্যায়ে রোগী নিবন্ধন ও স্বাস্থ্য তথ্য সংগ্রহের সার্বিক তথ্য (কাজের মান বা র্যাঙ্কিং নয়)।'
                    : 'Aggregated community outreach volume (operational volume only; NOT individual quality scoring or ranking).'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-center">
              <div>
                <span className="text-xs text-muted-foreground block">
                  {isBn ? 'সক্রিয় কর্মী' : 'Active CHWs'}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {workers.activeWorkers} / {workers.totalWorkers}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  {isBn ? 'রোগী নিবন্ধন' : 'Onboarded'}
                </span>
                <span className="text-lg font-bold text-primary">
                  {workers.patientsOnboarded}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  {isBn ? 'সম্পন্ন ফাইল' : 'Completed'}
                </span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {workers.healthRecordsCompleted}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Facility Activity Breakdown Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              <CardTitle className="text-base">
                {isBn ? 'স্বাস্থ্যকেন্দ্রভিত্তিক কার্যক্রম ও স্থিতি' : 'Facility Activity & Verification Status'}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm">
                {facilities.verifiedFacilities} {isBn ? 'যাচাইকৃত' : 'Verified'}
              </Badge>
              <Badge variant="secondary" size="sm">
                {facilities.activeFacilities} {isBn ? 'সক্রিয়' : 'Active'}
              </Badge>
            </div>
          </div>
          <CardDescription>
            {isBn
              ? 'নিবন্ধন প্রমাণ করে না যে কেন্দ্রটি স্বয়ংক্রিয়ভাবে চালু আছে; কেবলমাত্র যাচাইকৃত কেন্দ্রসমূহ সেবা প্রদানে সক্ষম।'
              : 'Registration alone does not prove operational capability; verified centers actively deliver clinical triage and intake.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? 'স্বাস্থ্যকেন্দ্র' : 'Healthcare Facility'}</TableHead>
                  <TableHead>{isBn ? 'বিভাগ' : 'Division'}</TableHead>
                  <TableHead>{isBn ? 'যাচাই স্থিতি' : 'Verification'}</TableHead>
                  <TableHead className="text-right">{isBn ? 'নিবন্ধিত রোগী' : 'Patients'}</TableHead>
                  <TableHead className="text-right">{isBn ? 'মূল্যায়ন' : 'Assessments'}</TableHead>
                  <TableHead className="text-right">{isBn ? 'অপেক্ষমাণ' : 'Pending'}</TableHead>
                  <TableHead className="text-right">{isBn ? 'রেফারেল' : 'Referrals'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facilities.facilities.slice(0, 6).map((fac) => (
                  <TableRow key={fac.facilityId}>
                    <TableCell className="font-medium text-foreground">
                      <div>
                        {isBn && fac.facilityNameBn ? fac.facilityNameBn : fac.facilityName}
                        <span className="text-xs text-muted-foreground block font-mono">
                          {fac.facilityId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" size="sm">
                        {fac.division}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {fac.isVerified ? (
                        <Badge variant="success" size="sm" className="flex items-center gap-1 w-fit">
                          <CheckCircle className="size-3" />
                          {isBn ? 'যাচাইকৃত' : 'Verified'}
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm" className="flex items-center gap-1 w-fit">
                          <Clock className="size-3" />
                          {isBn ? 'অপেক্ষমাণ' : 'Pending'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {fac.patientRegistrations}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {fac.assessmentsConducted}
                    </TableCell>
                    <TableCell className="text-right">
                      {fac.pendingReviews > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          {fac.pendingReviews}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {fac.referralsInitiated}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

