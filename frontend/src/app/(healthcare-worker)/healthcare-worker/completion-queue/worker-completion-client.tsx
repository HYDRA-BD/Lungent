'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  FileCheck2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Search,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/i18n'
import { FacilityContextSwitcher } from '@/modules/healthcare-worker/components/facility-context-switcher'
import { CompletionStatusPill } from '@/modules/healthcare-worker/components/completion-status-pill'
import { getHealthcareWorkerNav } from '@/modules/healthcare-worker/components/worker-navigation'
import type { IncompletePatientQueueItem } from '@/modules/healthcare-worker/types'
import type { Facility } from '@/modules/facilities/types'

interface WorkerCompletionClientProps {
  initialQueue: IncompletePatientQueueItem[]
  facilities: Facility[]
  activeFacilityId: string
}

export function WorkerCompletionClient({
  initialQueue,
  facilities,
  activeFacilityId: defaultFacilityId,
}: WorkerCompletionClientProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const [activeFacilityId, setActiveFacilityId] = useState(defaultFacilityId)
  const [queue] = useState(initialQueue)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLevel, setFilterLevel] = useState<'all' | 'incomplete' | 'partially_complete'>('all')

  const navItems = getHealthcareWorkerNav(isBn, { incomplete: queue.length })

  const filteredQueue = queue.filter((item) => {
    if (filterLevel !== 'all' && item.completionStatus !== filterLevel) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        item.fullName.toLowerCase().includes(q) ||
        item.patientId.toLowerCase().includes(q)
      )
    }
    return true
  })

  const criticalCount = queue.reduce(
    (acc, curr) =>
      acc + (curr.missingSections || []).filter((s) => s.isCritical).length,
    0
  )

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
          title={isBn ? 'তথ্য সম্পূর্ণকরণ সারি' : 'Patient Information Completion Queue'}
          description={
            isBn
              ? 'ভবিষ্যতের ফুসফুসের ক্যান্সার ঝুঁকি বিশ্লেষণ ও স্ক্রিনিং যোগ্যতার জন্য প্রয়োজনীয় অনুপস্থিত ক্লিনিকাল তথ্য পূরণ করুন।'
              : 'Identify and resolve missing clinical factors necessary for accurate risk prediction, screening eligibility, and triage.'
          }
        />

        {/* Operational Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                {isBn ? 'অপূর্ণ স্বাস্থ্য রেকর্ড' : 'Incomplete Health Records'}
              </span>
              <div className="text-2xl font-bold text-foreground mt-1">{queue.length}</div>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FileCheck2 className="size-6" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                {isBn ? 'জরুরি অনুপস্থিত উপাদান' : 'Critical Missing Items'}
              </span>
              <div className="text-2xl font-bold text-destructive mt-1">{criticalCount}</div>
            </div>
            <div className="p-3 rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                {isBn ? 'ন্যূনতম লক্ষ্যমাত্রা' : 'Target Threshold'}
              </span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                80%
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="size-6" />
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'রোগীর নাম বা আইডি খুঁজুন...' : 'Search by name or ID...'}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterLevel('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterLevel === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {isBn ? 'সকল' : 'All'} ({queue.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterLevel('incomplete')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterLevel === 'incomplete'
                  ? 'bg-destructive text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {isBn ? 'অসম্পূর্ণ (<50%)' : 'Incomplete (<50%)'}
            </button>
            <button
              type="button"
              onClick={() => setFilterLevel('partially_complete')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterLevel === 'partially_complete'
                  ? 'bg-amber-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {isBn ? 'আংশিক (50-79%)' : 'Partial (50-79%)'}
            </button>
          </div>
        </div>

        {/* Queue Items */}
        <div className="space-y-4">
          {filteredQueue.length > 0 ? (
            filteredQueue.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-base font-semibold text-foreground">{item.fullName}</h4>
                      <span className="font-mono text-xs font-semibold text-primary">
                        {item.patientId}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.approximateAge ? `${item.approximateAge} yrs` : 'Age N/A'} •{' '}
                      <span className="capitalize">{item.gender}</span> • Phone: {item.phoneNumber || 'N/A'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CompletionStatusPill score={item.completionScore} status={item.completionStatus} />
                    <Link
                      href={`/healthcare-worker/patients/${item.id}/health-record`}
                    >
                      <Button variant="default" size="sm" rightIcon={<ArrowRight className="size-4" />}>
                        {isBn ? 'তথ্য সম্পূর্ণ করুন' : 'Complete Record'}
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{isBn ? 'সম্পূর্ণতার অগ্রগতি' : 'Completeness Progress'}</span>
                    <span className="font-semibold text-foreground">{item.completionScore}% / 100%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.completionScore >= 80
                          ? 'bg-emerald-500'
                          : item.completionScore >= 50
                          ? 'bg-amber-500'
                          : 'bg-destructive'
                      }`}
                      style={{ width: `${item.completionScore}%` }}
                    />
                  </div>
                </div>

                {/* Missing Items Chips */}
                <div>
                  <div className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="size-3.5 text-amber-500" />
                    <span>{isBn ? 'অনুপস্থিত উপাদানসমূহ:' : 'Missing Clinical Factors:'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(item.missingSections || []).map((sec) => (
                      <Link
                        key={sec.key}
                        href={`/healthcare-worker/patients/${item.id}/health-record?tab=${sec.targetTab || 'profile'}`}
                        className="inline-block"
                      >
                        <Badge
                          variant={sec.isCritical ? 'destructive' : 'secondary'}
                          size="sm"
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {sec.isCritical && (
                            <span className="mr-1 text-[10px] font-bold">!</span>
                          )}
                          {isBn ? sec.labelBn : sec.labelEn}
                          <ArrowRight className="size-3 ml-1" />
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
              <CheckCircle2 className="size-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-semibold text-foreground">
                {isBn ? 'সকল রেকর্ড পর্যাপ্ত সম্পূর্ণ!' : 'All patient records meet completion thresholds!'}
              </h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {isBn
                  ? 'এই কেন্দ্রের সকল রোগীর স্বাস্থ্য রেকর্ড ন্যূনতম ৮০% সম্পূর্ণতা মান অতিক্রম করেছে।'
                  : 'Patients in this facility have completed required health records for risk estimation.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
