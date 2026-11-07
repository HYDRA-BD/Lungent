'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Clock,
  User,
  Activity,
  FileCheck2,
  FileEdit,
  ShieldCheck,
  CalendarCheck,
  ExternalLink,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/i18n'
import { getClinicalNav } from '@/modules/clinical/components/clinical-navigation'
import type { ClinicalActivityItem } from '@/modules/clinical/types'

interface ClinicalActivityClientProps {
  initialActivities: ClinicalActivityItem[]
}

export function ClinicalActivityClient({ initialActivities }: ClinicalActivityClientProps) {
  const { locale, dict } = useLanguage()
  const isBn = locale === 'bn'
  const acT = dict.clinicalWorkspace.activity

  const [activities] = useState<ClinicalActivityItem[]>(initialActivities)
  const navItems = getClinicalNav(isBn)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'decision_documented':
        return <FileCheck2 className="size-4 text-emerald-600" />
      case 'decision_amended':
        return <FileEdit className="size-4 text-amber-600" />
      case 'alert_acknowledged':
      case 'alert_resolved':
        return <ShieldCheck className="size-4 text-indigo-600" />
      case 'followup_created':
      case 'followup_updated':
        return <CalendarCheck className="size-4 text-teal-600" />
      default:
        return <Activity className="size-4 text-primary" />
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
          title={acT.title}
          description={acT.subtitle}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {isBn ? `ক্লিনিক্যাল কার্যকলাপ অডিট ট্রেইল (${activities.length})` : `Audit History Stream (${activities.length})`}
            </CardTitle>
            <CardDescription>
              {isBn
                ? 'অনুমোদিত চিকিৎসকদের সমস্ত পর্যালোচনা, সিদ্ধান্ত ও সতর্কতার অপরিবর্তনীয় কালানুক্রমিক বিবরণ।'
                : 'Immutable, tamper-evident chronological trail of clinician actions and audit records.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {acT.noActivities}
              </div>
            ) : (
              <div className="relative space-y-4 border-l-2 border-border pl-6 ml-3">
                {activities.map((act) => (
                  <div key={act.id} className="relative group">
                    <div className="absolute -left-[31px] top-1 flex size-6 items-center justify-center rounded-full border border-border bg-card shadow-xs">
                      {getActivityIcon(act.activityType)}
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4 shadow-xs space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="outline" className="text-xs uppercase font-mono">
                          {act.activityType.replace(/_/g, ' ')}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          <span>{new Date(act.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      <p className="text-sm font-medium text-foreground">
                        {isBn && act.summaryBn ? act.summaryBn : act.summary}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="size-3.5" />
                          <span>{act.clinicianName || 'Clinician'}</span>
                          {act.patientName && (
                            <>
                              <span>•</span>
                              <span>
                                Patient: <strong>{act.patientName}</strong> ({act.patientCanonicalId})
                              </span>
                            </>
                          )}
                        </div>

                        {act.patientId && (
                          <Link href={`/clinical/patients/${act.patientId}`}>
                            <Button size="sm" variant="ghost" className="h-6 text-xs gap-1 px-2">
                              {isBn ? 'প্রোফাইল' : 'Profile'}
                              <ExternalLink className="size-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
