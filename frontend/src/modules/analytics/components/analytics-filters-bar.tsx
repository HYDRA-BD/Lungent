'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import type { OperationalAnalyticsFilter, AnalyticsDateRange } from '../types'
import { useLanguage } from '@/i18n'
import { Calendar, BookOpen, RefreshCw } from 'lucide-react'

export interface AnalyticsFiltersBarProps {
  filter: OperationalAnalyticsFilter
  onFilterChange: (newFilter: OperationalAnalyticsFilter) => void
  onOpenDictionary: () => void
  onRefresh: () => void
  isLoading?: boolean
  availableFacilities?: { id: string; name: string }[]
}

export function AnalyticsFiltersBar({
  filter,
  onFilterChange,
  onOpenDictionary,
  onRefresh,
  isLoading,
  availableFacilities = [],
}: AnalyticsFiltersBarProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const dateRanges: { id: AnalyticsDateRange; labelEn: string; labelBn: string }[] = [
    { id: 'today', labelEn: 'Today', labelBn: 'আজ' },
    { id: '7d', labelEn: 'Last 7 Days', labelBn: 'গত ৭ দিন' },
    { id: '30d', labelEn: 'Last 30 Days', labelBn: 'গত ৩০ দিন' },
    { id: '90d', labelEn: 'Last 90 Days', labelBn: 'গত ৯০ দিন' },
    { id: 'all', labelEn: 'All Time', labelBn: 'সর্বকালীন' },
  ]

  const divisions = [
    { id: '', labelEn: 'All Divisions', labelBn: 'সকল বিভাগ' },
    { id: 'Dhaka', labelEn: 'Dhaka', labelBn: 'ঢাকা' },
    { id: 'Chattogram', labelEn: 'Chattogram', labelBn: 'চট্টগ্রাম' },
    { id: 'Rajshahi', labelEn: 'Rajshahi', labelBn: 'রাজশাহী' },
    { id: 'Khulna', labelEn: 'Khulna', labelBn: 'খুলনা' },
    { id: 'Barishal', labelEn: 'Barishal', labelBn: 'বরিশাল' },
    { id: 'Sylhet', labelEn: 'Sylhet', labelBn: 'সিলেট' },
    { id: 'Rangpur', labelEn: 'Rangpur', labelBn: 'রংপুর' },
    { id: 'Mymensingh', labelEn: 'Mymensingh', labelBn: 'ময়মনসিংহ' },
  ]

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card/60 backdrop-blur-xs">
      {/* Date Range Buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
          <Calendar className="size-3.5" />
          {isBn ? 'সময়কাল:' : 'Period:'}
        </span>
        {dateRanges.map((dr) => (
          <button
            key={dr.id}
            type="button"
            onClick={() => onFilterChange({ ...filter, dateRange: dr.id })}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter.dateRange === dr.id
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {isBn ? dr.labelBn : dr.labelEn}
          </button>
        ))}
      </div>

      {/* Select Filters & Actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Facility Filter */}
        <div className="w-44">
          <Select
            value={filter.facilityId || ''}
            onChange={(e) => onFilterChange({ ...filter, facilityId: e.target.value || undefined })}
            options={[
              { value: '', label: isBn ? 'সকল স্বাস্থ্যকেন্দ্র' : 'All Facilities' },
              ...availableFacilities.map((f) => ({ value: f.id, label: f.name })),
            ]}
          />
        </div>

        {/* Division Filter */}
        <div className="w-36">
          <Select
            value={filter.division || ''}
            onChange={(e) => onFilterChange({ ...filter, division: e.target.value || undefined })}
            options={divisions.map((d) => ({
              value: d.id,
              label: isBn ? d.labelBn : d.labelEn,
            }))}
          />
        </div>

        {/* Dictionary Modal Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenDictionary}
          leftIcon={<BookOpen className="size-4" />}
        >
          {isBn ? 'মেট্রিক ডিকশনারি' : 'Metric Catalog'}
        </Button>

        {/* Refresh Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          leftIcon={<RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          {isBn ? 'রিফ্রেশ' : 'Refresh'}
        </Button>
      </div>
    </div>
  )
}
