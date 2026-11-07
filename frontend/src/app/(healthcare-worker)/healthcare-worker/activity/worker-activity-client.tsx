'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  UserPlus,
  FileCheck2,
  CheckSquare,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/i18n'
import { FacilityContextSwitcher } from '@/modules/healthcare-worker/components/facility-context-switcher'
import { getHealthcareWorkerNav } from '@/modules/healthcare-worker/components/worker-navigation'
import type { WorkerRecentActivity } from '@/modules/healthcare-worker/types'
import type { Facility } from '@/modules/facilities/types'

interface WorkerActivityClientProps {
  initialActivities: WorkerRecentActivity[]
  facilities: Facility[]
  activeFacilityId: string
}

export function WorkerActivityClient({
  initialActivities,
  facilities,
  activeFacilityId: defaultFacilityId,
}: WorkerActivityClientProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const [activeFacilityId, setActiveFacilityId] = useState(defaultFacilityId)
  const [activities] = useState(initialActivities)
  const [typeFilter, setTypeFilter] = useState('all')

  const navItems = getHealthcareWorkerNav(isBn)

  const filteredActivities = activities.filter((act) => {
    if (typeFilter !== 'all' && act.activityType !== typeFilter) return false
    return true
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'patient_registered':
        return <UserPlus className="size-4 text-primary" />
      case 'assessment_initiated':
        return <Activity className="size-4 text-emerald-600 dark:text-emerald-400" />
      case 'health_record_updated':
        return <FileCheck2 className="size-4 text-amber-600 dark:text-amber-400" />
      case 'task_completed':
        return <CheckSquare className="size-4 text-blue-600 dark:text-blue-400" />
      default:
        return <Clock className="size-4 text-muted-foreground" />
    }
  }

  return (
    <DashboardLayout
      workspaceName={isBn ? 'কমিউনিটি স্বাস্থ্যকর্মী ওয়ার্কস্পেস' : 'Healthcare Worker Workspace'}
      workspaceBadge={
        <FacilityContextSwitcher
          activeFacilityId={activeFacilityId}
          facilities={facilities}
          onFacilitySwitched={(newId) => setActiveFacilityId(newId)}
        />
      }
      userName="Tania Akhter"
      userRole={isBn ? 'কমিউনিটি স্বাস্থ্য বিশেষজ্ঞ (CHW)' : 'Community Health Specialist (CHW)'}
      navItems={navItems}
    >
      <div className="space-y-6">
        <PageHeader
          title={isBn ? 'ফিল্ড ও রোগী কার্যক্রম স্ট্রিম' : 'Field Activity Stream'}
          description={
            isBn
              ? 'কমিউনিটি স্বাস্থ্যকর্মী কর্তৃক গৃহীত নিবন্ধন, তথ্য সংগ্রহ ও ক্লিনিকাল মূল্যায়ন কার্যক্রমের সম্পূর্ণ বিবরণ।'
              : 'Chronological timeline of field patient registrations, intake completions, assessments, and operational tasks.'
          }
        />

        {/* Filter */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{isBn ? 'ক্যাটাগরি অনুযায়ী ফিল্টার:' : 'Filter by category:'}</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">{isBn ? 'সকল কার্যক্রম' : 'All Activities'}</option>
              <option value="patient_registered">{isBn ? 'রোগী নিবন্ধন' : 'Patient Registrations'}</option>
              <option value="assessment_initiated">{isBn ? 'মূল্যায়ন শুরু' : 'Assessments Initiated'}</option>
              <option value="health_record_updated">{isBn ? 'স্বাস্থ্য তথ্য আপডেট' : 'Health Records Updated'}</option>
              <option value="task_completed">{isBn ? 'টাস্ক সম্পন্ন' : 'Tasks Completed'}</option>
            </select>
          </div>
          <span className="text-xs text-muted-foreground">
            {filteredActivities.length} {isBn ? 'টি কার্যক্রম' : 'events'}
          </span>
        </div>

        {/* Timeline */}
        <Card>
          <CardContent className="p-6">
            {filteredActivities.length > 0 ? (
              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {filteredActivities.map((act) => (
                  <div key={act.id} className="relative flex items-start gap-4 group">
                    <div className="absolute -left-6 mt-1 size-5 rounded-full border-2 border-background bg-card flex items-center justify-center p-0.5">
                      {getActivityIcon(act.activityType)}
                    </div>

                    <div className="flex-1 bg-muted/30 hover:bg-muted/60 p-4 rounded-2xl border border-border/60 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
                        <span className="text-sm font-semibold text-foreground">
                          {act.summary}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3" />
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <span>{isBn ? 'সম্পাদনকারী:' : 'Actor:'} <strong>{act.metadata?.actorName || 'CHW Tania'}</strong></span>
                        <span>•</span>
                        <Badge variant="secondary" size="sm" className="capitalize">
                          {act.activityType.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      {act.patientId && (
                        <div className="mt-3 pt-2 border-t border-border/50 flex items-center gap-2">
                          <Link
                            href={`/healthcare-worker/patients/${act.patientId}`}
                            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                          >
                            {isBn ? 'রোগীর প্রোফাইল দেখুন' : 'View Patient Record'}
                            <ArrowRight className="size-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-muted-foreground">
                {isBn ? 'কোনো কার্যক্রম পাওয়া যায়নি।' : 'No activity records found.'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
