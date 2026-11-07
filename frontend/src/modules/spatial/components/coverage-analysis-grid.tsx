'use client'

import React, { useState, useMemo } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Scan,
  Info,
} from 'lucide-react'
import { METHODOLOGY_LIMITATION_NOTICE } from '../boundaries-data'
import type { DistrictCoverageSummary, CoverageTier } from '../types'

interface CoverageAnalysisGridProps {
  summaries: DistrictCoverageSummary[]
  isBn?: boolean
}

export function CoverageAnalysisGrid({
  summaries,
  isBn = false,
}: CoverageAnalysisGridProps) {
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('all')

  const filteredSummaries = useMemo(() => {
    return summaries.filter((item) => {
      if (tierFilter !== 'all' && item.coverageTier !== tierFilter) {
        return false
      }
      if (search) {
        const q = search.toLowerCase().trim()
        const match =
          item.district.toLowerCase().includes(q) ||
          item.division.toLowerCase().includes(q) ||
          (item.nearestLdctFacility?.name.toLowerCase().includes(q) ?? false)
        if (!match) return false
      }
      return true
    })
  }, [summaries, search, tierFilter])

  const renderTierBadge = (tier: CoverageTier) => {
    switch (tier) {
      case 'adequate_imaging':
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px]">
            <ShieldCheck className="size-3 mr-1" />
            {isBn ? 'পর্যাপ্ত ইমেজিং' : 'Adequate Imaging'}
          </Badge>
        )
      case 'basic_imaging_only':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 text-[10px]">
            <Scan className="size-3 mr-1" />
            {isBn ? 'বেসিক সিটি (LDCT নেই)' : 'Basic CT (No LDCT)'}
          </Badge>
        )
      case 'primary_care_only':
        return (
          <Badge variant="secondary" className="text-[10px]">
            {isBn ? 'শুধু প্রাথমিক সেবা' : 'Primary Care Only'}
          </Badge>
        )
      case 'no_registered_facility':
        return (
          <Badge variant="destructive" className="text-[10px]">
            <ShieldAlert className="size-3 mr-1" />
            {isBn ? 'তালিকাভুক্ত কেন্দ্র নেই' : 'No Facility in Registry'}
          </Badge>
        )
      default:
        return <Badge variant="outline">{tier}</Badge>
    }
  }

  return (
    <div className="space-y-4" data-testid="coverage-analysis-grid">
      {/* Search and Tier Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isBn ? 'জেলা বা বিভাগ দিয়ে খুঁজুন...' : 'Search by district or division...'}
            className="pl-9 h-9 text-xs"
            data-testid="coverage-search-input"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {isBn ? 'কভারেজ স্তর:' : 'Coverage Tier:'}
          </span>
          <Select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="h-9 text-xs w-[180px]"
            data-testid="coverage-tier-select"
          >
            <option value="all">{isBn ? 'সকল স্তর' : 'All Tiers'}</option>
            <option value="adequate_imaging">{isBn ? 'পর্যাপ্ত ইমেজিং (LDCT সহ)' : 'Adequate Imaging (LDCT)'}</option>
            <option value="basic_imaging_only">{isBn ? 'বেসিক সিটি (LDCT নেই)' : 'Basic CT (No LDCT)'}</option>
            <option value="primary_care_only">{isBn ? 'শুধু প্রাথমিক সেবা' : 'Primary Care Only'}</option>
            <option value="no_registered_facility">{isBn ? 'কোনো কেন্দ্র নেই' : 'No Facility in Registry'}</option>
          </Select>
        </div>
      </div>

      {/* Accessible Table */}
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">{isBn ? 'জেলা ও বিভাগ' : 'District & Division'}</TableHead>
              <TableHead className="text-xs">{isBn ? 'কেন্দ্রের সংখ্যা' : 'Facilities'}</TableHead>
              <TableHead className="text-xs">{isBn ? 'LDCT ফুসফুস স্ক্রিনিং' : 'LDCT Lung Screening'}</TableHead>
              <TableHead className="text-xs">{isBn ? 'জিনএক্সপার্ট (যক্ষ্মা)' : 'GeneXpert (TB)'}</TableHead>
              <TableHead className="text-xs">{isBn ? 'নিকটবর্তী যাচাইকৃত LDCT' : 'Nearest Verified LDCT'}</TableHead>
              <TableHead className="text-xs">{isBn ? 'কভারেজ বিশ্লেষণ' : 'Coverage Tier'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSummaries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                  {isBn ? 'কোনো জেলার তথ্য পাওয়া যায়নি।' : 'No district coverage data found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredSummaries.map((item) => (
                <TableRow key={`${item.division}-${item.district}`} data-testid={`district-row-${item.district}`}>
                  <TableCell className="font-medium text-xs">
                    <div className="text-foreground">{item.district}</div>
                    <div className="text-[11px] text-muted-foreground">{item.division}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="font-semibold">{item.totalFacilities}</span>{' '}
                    <span className="text-muted-foreground text-[11px]">
                      ({item.verifiedFacilities} {isBn ? 'যাচাইকৃত' : 'verified'})
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {item.hasLdctScreening ? (
                      <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400 text-[10px]">
                        <Scan className="size-3 mr-1" />
                        {item.ldctFacilityCount} {isBn ? 'টি স্ক্যানার' : 'Scanner(s)'}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">{isBn ? 'অনুপস্থিত' : 'Not Present'}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {item.hasGeneXpert ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                        ✓ {isBn ? 'উপলব্ধ' : 'Available'}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">{isBn ? 'অনুপস্থিত' : 'Not Present'}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {item.hasLdctScreening ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                        {isBn ? 'স্থানীয় জেলায় উপস্থিত' : 'Local in district'}
                      </span>
                    ) : item.nearestLdctFacility ? (
                      <div className="text-[11px]">
                        <span className="font-bold text-foreground">{item.nearestLdctFacility.distanceKm} km</span>{' '}
                        <span className="text-muted-foreground">
                          ({item.nearestLdctFacility.name}, {item.nearestLdctFacility.district})
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{renderTierBadge(item.coverageTier)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mandatory Methodological Notice */}
      <div className="p-3 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground flex items-start gap-2">
        <Info className="size-4 shrink-0 text-primary mt-0.5" />
        <div className="leading-relaxed text-[11px]">
          <strong>{isBn ? 'পদ্ধতিগত সীমাবদ্ধতা:' : 'Methodological Limitation Notice:'}</strong>{' '}
          {METHODOLOGY_LIMITATION_NOTICE}
        </div>
      </div>
    </div>
  )
}
