'use client'

import React, { useState, useEffect, useTransition, useMemo, useCallback } from 'react'
import {
  Building2,
  Search,
  ShieldCheck,
  ShieldAlert,
  Scan,
  AlertCircle,
  Table as TableIcon,
  Map as MapIcon,
  Users,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { StatCard } from '@/components/ui/stat-card'
import { InteractiveSpatialMap } from './interactive-spatial-map'
import { FacilitySpatialDetails } from './facility-spatial-details'
import { CoverageAnalysisGrid } from './coverage-analysis-grid'
import { BANGLADESH_DIVISIONS_DATA } from '../boundaries-data'
import { BANGLADESH_DISTRICT_CENTROIDS } from '@/modules/environmental/coordinates'
import {
  getSpatialMapDataAction,
  getDistrictCoverageAction,
  getPatientDistributionAction,
} from '../actions'
import type {
  FacilityMapMarker,
  MapActiveLayer,
  DistrictCoverageSummary,
  SpatialSearchFilter,
  PatientGeographicDistribution,
} from '../types'

interface SpatialIntelligenceDashboardProps {
  initialMarkers?: FacilityMapMarker[]
  initialCoverage?: DistrictCoverageSummary[]
  initialDistribution?: PatientGeographicDistribution[]
  isBn?: boolean
}

export function SpatialIntelligenceDashboard({
  initialMarkers = [],
  initialCoverage = [],
  initialDistribution = [],
  isBn = false,
}: SpatialIntelligenceDashboardProps) {
  const [markers, setMarkers] = useState<FacilityMapMarker[]>(initialMarkers)
  const [coverageSummaries, setCoverageSummaries] = useState<DistrictCoverageSummary[]>(initialCoverage)
  const [patientDistribution, setPatientDistribution] = useState<PatientGeographicDistribution[]>(initialDistribution)
  const [selectedMarker, setSelectedMarker] = useState<FacilityMapMarker | null>(null)
  const [activeLayer, setActiveLayer] = useState<MapActiveLayer>('facilities')
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map')
  const [, startTransition] = useTransition()

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDivision, setSelectedDivision] = useState('all')
  const [selectedDistrict, setSelectedDistrict] = useState('all')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified'>('all')
  const [radiusKm, setRadiusKm] = useState<number>(0)

  // Load initial data on mount if not provided
  useEffect(() => {
    if (initialMarkers.length === 0) {
      startTransition(async () => {
        const [markersRes, coverageRes, distRes] = await Promise.all([
          getSpatialMapDataAction(),
          getDistrictCoverageAction(),
          getPatientDistributionAction(),
        ])
        if (markersRes.success) setMarkers(markersRes.markers)
        if (coverageRes.success) setCoverageSummaries(coverageRes.summaries)
        if (distRes.success) setPatientDistribution(distRes.distribution)
      })
    }
  }, [initialMarkers.length])

  // Filter application
  const handleApplyFilters = useCallback(() => {
    startTransition(async () => {
      const filters: SpatialSearchFilter = {
        query: searchQuery || undefined,
        division: selectedDivision !== 'all' ? selectedDivision : undefined,
        district: selectedDistrict !== 'all' ? selectedDistrict : undefined,
        serviceCapability:
          serviceFilter !== 'all'
            ? (serviceFilter as SpatialSearchFilter['serviceCapability'])
            : undefined,
        verificationStatus: verificationFilter,
      }

      // If radius filter is active, use Dhaka or selected division centroid
      if (radiusKm > 0) {
        const centroid =
          selectedDivision !== 'all' && BANGLADESH_DIVISIONS_DATA[selectedDivision.toLowerCase()]
            ? BANGLADESH_DIVISIONS_DATA[selectedDivision.toLowerCase()].centroid
            : { latitude: 23.8103, longitude: 90.4125 }
        filters.centerCoordinates = centroid
        filters.radiusKm = radiusKm
      }

      const res = await getSpatialMapDataAction(filters)
      if (res.success) {
        setMarkers(res.markers)
      }
    })
  }, [searchQuery, selectedDivision, selectedDistrict, serviceFilter, verificationFilter, radiusKm])

  // Trigger filter when dropdowns change
  useEffect(() => {
    handleApplyFilters()
  }, [handleApplyFilters])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedDivision('all')
    setSelectedDistrict('all')
    setServiceFilter('all')
    setVerificationFilter('all')
    setRadiusKm(0)
    startTransition(async () => {
      const res = await getSpatialMapDataAction()
      if (res.success) setMarkers(res.markers)
    })
  }

  // Districts for current division
  const availableDistricts = useMemo(() => {
    if (selectedDivision === 'all') {
      return Object.keys(BANGLADESH_DISTRICT_CENTROIDS).map(
        (d) => d.charAt(0).toUpperCase() + d.slice(1)
      )
    }
    // Filter districts in division
    return Object.keys(BANGLADESH_DISTRICT_CENTROIDS)
      .filter((d) => d.toLowerCase().includes(selectedDivision.toLowerCase().slice(0, 4)))
      .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
  }, [selectedDivision])

  // Statistics
  const totalFacilitiesCount = markers.length
  const verifiedCount = markers.filter((m) => m.verificationStatus === 'verified').length
  const ldctScreeningCount = markers.filter((m) => m.hasLdctScreening).length
  const districtsWithLdct = coverageSummaries.filter((s) => s.hasLdctScreening).length
  const totalDistrictsCount = coverageSummaries.length || 64
  const gapDistrictsCount = totalDistrictsCount - districtsWithLdct

  return (
    <div className="space-y-6" data-testid="spatial-intelligence-dashboard">
      {/* 1. Mandatory Clinical & Spatial Safety Notice */}
      <div
        className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-primary flex items-start gap-3 shadow-sm"
        role="alert"
        data-testid="spatial-clinical-notice"
      >
        <AlertCircle className="size-5 shrink-0 text-primary mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-sm">
            {isBn
              ? 'ক্লিনিক্যাল সিদ্ধান্ত-সহায়তা ও স্থানিক তথ্য সুরক্ষা নীতি'
              : 'Clinical Decision-Support & Spatial Intelligence Boundary Notice'}
          </h4>
          <p className="text-muted-foreground leading-relaxed">
            {isBn
              ? 'ভৌগোলিক বিশ্লেষণ শুধুমাত্র স্বাস্থ্যসেবা কেন্দ্রের বিস্তার ও অপারেশনাল রেফারাল তথ্য প্রদান করে। এটি রোগীর ব্যক্তিগত ক্যান্সার ঝুঁকি, ক্লিনিক্যাল মূল্যায়ন, বা চিকিৎসা নির্ধারণ করতে পারে না। রোগীর সঠিক আবাসন গোপনীয়তা নিশ্চিত করতে ব্যক্তিগত অবস্থান প্রশাসনিক জেলা পর্যায়ে সমন্বিত করা হয়েছে।'
              : 'Geographical analysis provides contextual operational insight and facility discovery. It MUST NOT independently calculate clinical cancer risk, screening eligibility, or diagnostic determinations. Patient residences are strictly protected and aggregated to administrative district levels.'}
          </p>
        </div>
      </div>

      {/* 2. Top Spatial KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title={isBn ? 'মানচিত্রস্থ কেন্দ্রসমূহ' : 'Mapped Facilities'}
          value={totalFacilitiesCount}
          description={
            isBn
              ? `${verifiedCount} টি যাচাইকৃত সক্রিয় কেন্দ্র`
              : `${verifiedCount} verified operational`
          }
          icon={<Building2 className="size-4" />}
        />
        <StatCard
          title={isBn ? 'যাচাইকৃত LDCT স্ক্রিনিং' : 'Verified LDCT Centers'}
          value={ldctScreeningCount}
          description={
            isBn ? 'স্বীকৃত লো-ডোজ সিটি স্ক্যানার' : 'Accredited low-dose CT units'
          }
          icon={<Scan className="size-4" />}
        />
        <StatCard
          title={isBn ? 'স্ক্রিনিং সুবিধাপ্রাপ্ত জেলা' : 'Districts with LDCT'}
          value={districtsWithLdct}
          description={
            isBn ? `মোট ${totalDistrictsCount} জেলার মধ্যে` : `Out of ${totalDistrictsCount} districts`
          }
          icon={<ShieldCheck className="size-4" />}
        />
        <StatCard
          title={isBn ? 'স্ক্রিনিং শূন্যতা / সম্ভাব্য অভাব' : 'Screening Gap Areas'}
          value={gapDistrictsCount}
          description={
            isBn ? 'স্থানীয় LDCT স্ক্যানার অনুপস্থিত' : 'Districts lacking local LDCT'
          }
          icon={<ShieldAlert className="size-4 text-destructive" />}
        />
      </div>

      {/* 3. Filter Bar & View Toggle */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Query Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              placeholder={
                isBn
                  ? 'কেন্দ্রের নাম, আইডি (FAC-...) বা ঠিকানা...'
                  : 'Search facility name, canonical ID, or address...'
              }
              className="pl-9 h-9 text-xs"
              data-testid="spatial-search-input"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
            <Button
              size="sm"
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              className="h-7 text-xs px-3"
              onClick={() => setViewMode('map')}
              data-testid="view-toggle-map"
            >
              <MapIcon className="size-3.5 mr-1" />
              {isBn ? 'মানচিত্র দর্শন' : 'Map View'}
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              className="h-7 text-xs px-3"
              onClick={() => setViewMode('table')}
              data-testid="view-toggle-table"
            >
              <TableIcon className="size-3.5 mr-1" />
              {isBn ? 'কভারেজ টেবিল' : 'Coverage Table'}
            </Button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-border/60">
          {/* Division Filter */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              {isBn ? 'প্রশাসনিক বিভাগ' : 'Division'}
            </label>
            <Select
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value)
                setSelectedDistrict('all')
              }}
              className="h-8 text-xs"
              data-testid="filter-division-select"
            >
              <option value="all">{isBn ? 'সকল বিভাগ' : 'All Divisions'}</option>
              {Object.values(BANGLADESH_DIVISIONS_DATA).map((div) => (
                <option key={div.id} value={div.name}>
                  {isBn ? div.nameBn : div.name}
                </option>
              ))}
            </Select>
          </div>

          {/* District Filter */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              {isBn ? 'জেলা' : 'District'}
            </label>
            <Select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="h-8 text-xs"
              data-testid="filter-district-select"
            >
              <option value="all">{isBn ? 'সকল জেলা' : 'All Districts'}</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>

          {/* Service Capability Filter */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              {isBn ? 'ডায়াগনস্টিক সক্ষমতা' : 'Capability'}
            </label>
            <Select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="h-8 text-xs"
              data-testid="filter-service-select"
            >
              <option value="all">{isBn ? 'সকল সেবা' : 'All Services'}</option>
              <option value="ldct_screening">{isBn ? 'LDCT ফুসফুস স্ক্রিনিং' : 'LDCT Lung Screening'}</option>
              <option value="genexpert_tb">{isBn ? 'জিনএক্সপার্ট (যক্ষ্মা)' : 'GeneXpert (TB)'}</option>
              <option value="diagnostic_ct">{isBn ? 'ডায়াগনস্টিক সিটি স্ক্যান' : 'Diagnostic CT'}</option>
              <option value="spirometry">{isBn ? 'স্পাইরোমেট্রি (PFT)' : 'Spirometry'}</option>
              <option value="thoracic_surgery">{isBn ? 'থোরাসিক সার্জারি' : 'Thoracic Surgery'}</option>
            </Select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              {isBn ? 'যাচাইকরণ স্থিতি' : 'Verification'}
            </label>
            <Select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value as 'all' | 'verified')}
              className="h-8 text-xs"
              data-testid="filter-verification-select"
            >
              <option value="all">{isBn ? 'সকল কেন্দ্র' : 'All Facilities'}</option>
              <option value="verified">{isBn ? 'শুধু যাচাইকৃত' : 'Verified Only'}</option>
            </Select>
          </div>

          {/* Proximity Radius Slider */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              {isBn ? `দূরত্ব ব্যাসার্ধ (${radiusKm > 0 ? `${radiusKm}km` : 'সকল'})` : `Radius (${radiusKm > 0 ? `${radiusKm} km` : 'Off'})`}
            </label>
            <Select
              value={radiusKm.toString()}
              onChange={(e) => setRadiusKm(parseInt(e.target.value, 10))}
              className="h-8 text-xs"
              data-testid="filter-radius-select"
            >
              <option value="0">{isBn ? 'সীমা বন্ধ (সম্পূর্ণ মানচিত্র)' : 'Unlimited (All)'}</option>
              <option value="25">≤ 25 km</option>
              <option value="50">≤ 50 km</option>
              <option value="100">≤ 100 km</option>
            </Select>
          </div>

          {/* Reset Filters CTA */}
          <div className="flex items-end">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-full text-xs"
              onClick={handleResetFilters}
              data-testid="filter-reset-btn"
            >
              <RotateCcw className="size-3.5 mr-1" />
              {isBn ? 'ফিল্টার মুছুন' : 'Reset'}
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Main Explorer Canvas (Map or Table) */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Interactive Map (2 Columns on Large Screens) */}
          <div className="lg:col-span-2">
            <InteractiveSpatialMap
              markers={markers}
              selectedMarkerId={selectedMarker?.id}
              onSelectMarker={setSelectedMarker}
              activeLayer={activeLayer}
              onChangeLayer={setActiveLayer}
              coverageSummaries={coverageSummaries}
              selectedDivision={selectedDivision}
              onSelectDivision={(div) => setSelectedDivision(div)}
              isBn={isBn}
            />
          </div>

          {/* Facility Details Sidebar Drawer */}
          <div className="lg:col-span-1 h-[540px] md:h-[620px]">
            <FacilitySpatialDetails
              facility={selectedMarker}
              onClose={() => setSelectedMarker(null)}
              isBn={isBn}
            />
          </div>
        </div>
      ) : (
        /* Accessible Table Alternative View */
        <CoverageAnalysisGrid summaries={coverageSummaries} isBn={isBn} />
      )}

      {/* 5. Patient Geographic Distribution (Privacy-Preserving Aggregated Overview) */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3" data-testid="patient-density-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">
              {isBn ? 'রোগী জনসংখ্যার প্রশাসনিক বিস্তার' : 'Aggregated Patient Population Distribution'}
            </h3>
          </div>
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            {isBn ? 'গোপনীয়তা-সুরক্ষিত সমন্বিত তথ্য' : 'Privacy-Protected Aggregate'}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          {isBn
            ? 'রোগীদের বাসস্থান জেলা পর্যায়ে সমন্বিত করা হয়েছে। রোগীদের সুনির্দিষ্ট আবাসিক স্থানাঙ্ক কখনও মানচিত্রে প্রকাশিত হয় না।'
            : 'Patient residences are aggregated to administrative districts to maintain healthcare confidentiality. Exact residential GPS coordinates are strictly suppressed.'}
        </p>

        {/* Aggregated Density Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2">
          {patientDistribution.map((item) => (
            <div
              key={`${item.division}-${item.district}`}
              className="p-2.5 rounded-lg border border-border bg-muted/20 flex flex-col"
              data-testid={`patient-dist-${item.district}`}
            >
              <div className="text-xs font-semibold text-foreground truncate">{item.district}</div>
              <div className="text-[11px] text-muted-foreground">{item.division}</div>
              <div className="text-base font-bold text-primary mt-1">
                {item.aggregatedPatientCount}{' '}
                <span className="text-[10px] font-normal text-muted-foreground">
                  {isBn ? 'জন রোগী' : 'patients'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
