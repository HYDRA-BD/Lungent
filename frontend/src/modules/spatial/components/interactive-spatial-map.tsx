'use client'

import React, { useState, useMemo } from 'react'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Building2,
  Wind,
  ShieldAlert,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BANGLADESH_DIVISION_BOUNDARIES, BANGLADESH_DIVISIONS_DATA } from '../boundaries-data'
import { projectCoordinatesToSvg, BANGLADESH_BOUNDS } from '../distance'
import type { FacilityMapMarker, MapActiveLayer, DistrictCoverageSummary } from '../types'

interface InteractiveSpatialMapProps {
  markers: FacilityMapMarker[]
  selectedMarkerId?: string | null
  onSelectMarker: (marker: FacilityMapMarker | null) => void
  activeLayer: MapActiveLayer
  onChangeLayer: (layer: MapActiveLayer) => void
  coverageSummaries?: DistrictCoverageSummary[]
  selectedDivision?: string
  onSelectDivision?: (division: string) => void
  isBn?: boolean
}

export function InteractiveSpatialMap({
  markers,
  selectedMarkerId,
  onSelectMarker,
  activeLayer,
  onChangeLayer,
  coverageSummaries = [],
  selectedDivision = 'all',
  onSelectDivision,
  isBn = false,
}: InteractiveSpatialMapProps) {
  // Zoom and Pan state
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [hoveredDivision, setHoveredDivision] = useState<string | null>(null)
  const [hoveredMarker, setHoveredMarker] = useState<(FacilityMapMarker & { svgX: number; svgY: number }) | null>(null)

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.35, 2.8))
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.35, 0.8))
  const handleResetView = () => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
    if (onSelectDivision) onSelectDivision('all')
  }

  // Projected markers onto 0-100 viewBox
  const projectedMarkers = useMemo(() => {
    return markers.map((m) => {
      const svgCoords = projectCoordinatesToSvg(m.latitude, m.longitude, BANGLADESH_BOUNDS, 8)
      return {
        ...m,
        svgX: svgCoords.x,
        svgY: svgCoords.y,
      }
    })
  }, [markers])

  // Coverage color helper
  const getCoverageFill = (divisionName: string) => {
    if (activeLayer !== 'diagnostic_coverage') return null
    const distSummaries = coverageSummaries.filter(
      (s) => s.division.toLowerCase() === divisionName.toLowerCase()
    )
    if (distSummaries.length === 0) return 'rgba(148, 163, 184, 0.25)' // slate
    const hasAnyLdct = distSummaries.some((s) => s.hasLdctScreening)
    if (hasAnyLdct) return 'rgba(34, 197, 94, 0.25)' // green
    const hasAnyCt = distSummaries.some((s) => s.hasDiagnosticCt)
    if (hasAnyCt) return 'rgba(234, 179, 8, 0.25)' // amber
    return 'rgba(239, 68, 68, 0.25)' // red / gap
  }

  return (
    <div
      className="relative w-full h-[540px] md:h-[620px] rounded-xl border border-border bg-slate-950/40 dark:bg-slate-950/80 overflow-hidden flex flex-col select-none"
      data-testid="interactive-spatial-map"
      role="region"
      aria-label={isBn ? 'ইন্টারেক্টিভ ভৌগোলিক মানচিত্র' : 'Interactive Geographic Map'}
    >
      {/* Top Map Controls Bar */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 bg-background/90 backdrop-blur-md p-1.5 rounded-lg border border-border shadow-md">
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
          <Layers className="size-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground mr-1">
            {isBn ? 'লেয়ার:' : 'Layer:'}
          </span>
          <Button
            size="sm"
            variant={activeLayer === 'facilities' ? 'default' : 'ghost'}
            className="h-7 text-xs px-2.5"
            onClick={() => onChangeLayer('facilities')}
            data-testid="layer-btn-facilities"
          >
            <Building2 className="size-3.5 mr-1" />
            {isBn ? 'স্বাস্থ্যসেবা কেন্দ্র' : 'Facilities'}
          </Button>
          <Button
            size="sm"
            variant={activeLayer === 'environmental_aqi' ? 'default' : 'ghost'}
            className="h-7 text-xs px-2.5"
            onClick={() => onChangeLayer('environmental_aqi')}
            data-testid="layer-btn-aqi"
          >
            <Wind className="size-3.5 mr-1" />
            {isBn ? 'বায়ুর মান (AQI)' : 'Ambient AQI'}
          </Button>
          <Button
            size="sm"
            variant={activeLayer === 'diagnostic_coverage' ? 'default' : 'ghost'}
            className="h-7 text-xs px-2.5"
            onClick={() => onChangeLayer('diagnostic_coverage')}
            data-testid="layer-btn-coverage"
          >
            <ShieldAlert className="size-3.5 mr-1" />
            {isBn ? 'ডায়াগনস্টিক কভারেজ' : 'Coverage Gaps'}
          </Button>
        </div>

        {/* Division Indicator */}
        {selectedDivision && selectedDivision !== 'all' && (
          <Badge variant="secondary" className="text-xs font-medium">
            {isBn ? 'বিভাগ:' : 'Division:'} {selectedDivision}
          </Badge>
        )}
      </div>

      {/* Floating Zoom & Pan Navigation Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-background/90 backdrop-blur-md p-1.5 rounded-lg border border-border shadow-md">
        <Button
          size="icon"
          variant="ghost"
          className="size-7"
          onClick={handleZoomIn}
          title={isBn ? 'জুম ইন' : 'Zoom In'}
          data-testid="map-zoom-in"
        >
          <ZoomIn className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-7"
          onClick={handleZoomOut}
          title={isBn ? 'জুম আউট' : 'Zoom Out'}
          data-testid="map-zoom-out"
        >
          <ZoomOut className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-7"
          onClick={handleResetView}
          title={isBn ? 'রিসেট' : 'Reset View'}
          data-testid="map-reset-view"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>

      {/* Main SVG Vector Canvas */}
      <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          }}
        >
          {/* Subtle Grid Lines for Spatial Coordinate Context */}
          <defs>
            <pattern id="spatialGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.1"
                className="text-muted-foreground/15"
              />
            </pattern>
            {/* Pulsing Radial Gradient for AQI Telemetry Nodes */}
            <radialGradient id="aqiPulseModerate" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ca8a04" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ca8a04" stopOpacity="0.05" />
            </radialGradient>
            <radialGradient id="aqiPulseUnhealthy" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.05" />
            </radialGradient>
          </defs>

          <rect width="100" height="100" fill="url(#spatialGrid)" />

          {/* Bay of Bengal Spatial Waters Watermark */}
          <text
            x="70"
            y="98"
            className="text-[2.2px] font-semibold fill-muted-foreground/30 uppercase tracking-widest pointer-events-none"
          >
            Bay of Bengal (বঙ্গোপসাগর)
          </text>

          {/* 1. Administrative Division Boundary Polygons */}
          <g id="division-boundaries">
            {BANGLADESH_DIVISION_BOUNDARIES.map((div) => {
              const isSelected = selectedDivision.toLowerCase() === div.name.toLowerCase()
              const isHovered = hoveredDivision === div.id
              const customCoverageFill = getCoverageFill(div.name)

              return (
                <path
                  key={div.id}
                  d={div.svgPath}
                  className={`transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'stroke-primary stroke-[0.8] fill-primary/20'
                      : isHovered
                      ? 'stroke-primary/70 stroke-[0.5] fill-primary/10'
                      : 'stroke-border/80 stroke-[0.35] fill-card/50'
                  }`}
                  style={{
                    fill: customCoverageFill || undefined,
                  }}
                  onMouseEnter={() => setHoveredDivision(div.id)}
                  onMouseLeave={() => setHoveredDivision(null)}
                  onClick={() => onSelectDivision && onSelectDivision(div.name)}
                  data-testid={`division-path-${div.id}`}
                >
                  <title>
                    {div.name} Division ({div.nameBn})
                  </title>
                </path>
              )
            })}
          </g>

          {/* Division Name Labels */}
          <g id="division-labels" className="pointer-events-none">
            {Object.values(BANGLADESH_DIVISIONS_DATA).map((div) => {
              const coords = projectCoordinatesToSvg(
                div.centroid.latitude,
                div.centroid.longitude,
                BANGLADESH_BOUNDS,
                8
              )
              return (
                <text
                  key={div.id}
                  x={coords.x}
                  y={coords.y - 1.5}
                  textAnchor="middle"
                  className="text-[2px] font-bold fill-foreground/70 drop-shadow-sm pointer-events-none"
                >
                  {isBn ? div.nameBn : div.name}
                </text>
              )
            })}
          </g>

          {/* 2. Environmental AQI Heat Overlay Layer */}
          {activeLayer === 'environmental_aqi' && (
            <g id="aqi-telemetry-layer" className="transition-opacity duration-300">
              {Object.values(BANGLADESH_DIVISIONS_DATA).map((div) => {
                const coords = projectCoordinatesToSvg(
                  div.centroid.latitude,
                  div.centroid.longitude,
                  BANGLADESH_BOUNDS,
                  8
                )
                // Simulated or cached telemetry AQI value (Dhaka highest ~182, Sylhet lowest ~65)
                const mockAqi = div.id === 'dhaka' ? 182 : div.id === 'chattogram' ? 142 : div.id === 'sylhet' ? 65 : 120
                const isHigh = mockAqi > 150
                const circleColor = isHigh ? '#dc2626' : '#ca8a04'

                return (
                  <g key={`aqi-node-${div.id}`} className="cursor-pointer">
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r="4.5"
                      fill={isHigh ? 'url(#aqiPulseUnhealthy)' : 'url(#aqiPulseModerate)'}
                      className="animate-pulse"
                    />
                    <circle cx={coords.x} cy={coords.y} r="1.8" fill={circleColor} />
                    <text
                      x={coords.x}
                      y={coords.y + 0.6}
                      textAnchor="middle"
                      className="text-[1.3px] font-extrabold fill-white pointer-events-none"
                    >
                      {mockAqi}
                    </text>
                    <text
                      x={coords.x}
                      y={coords.y + 3.2}
                      textAnchor="middle"
                      className="text-[1.2px] font-semibold fill-foreground/90 pointer-events-none"
                    >
                      AQI {mockAqi}
                    </text>
                  </g>
                )
              })}
            </g>
          )}

          {/* 3. Healthcare Facilities Marker Layer */}
          {activeLayer === 'facilities' && (
            <g id="facilities-markers">
              {projectedMarkers.map((marker) => {
                const isSelected = selectedMarkerId === marker.id
                const isHovered = hoveredMarker?.id === marker.id

                // Marker color: Specialized/Tertiary = blue, Community = emerald, Diagnostic = purple
                const markerColor = marker.hasLdctScreening
                  ? '#3b82f6' // Blue for LDCT Lung screening capable
                  : marker.facilityTypeId === 'community_clinic'
                  ? '#10b981' // Green for community
                  : '#8b5cf6' // Purple for general

                return (
                  <g
                    key={marker.id}
                    transform={`translate(${marker.svgX}, ${marker.svgY})`}
                    className="cursor-pointer transition-transform duration-150"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectMarker(marker)
                    }}
                    onMouseEnter={() => setHoveredMarker(marker)}
                    onMouseLeave={() => setHoveredMarker(null)}
                    data-testid={`facility-marker-${marker.facilityId}`}
                  >
                    {/* Pulsing halo if selected */}
                    {isSelected && (
                      <circle
                        cx="0"
                        cy="0"
                        r="3.2"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="0.4"
                        className="animate-ping"
                      />
                    )}

                    {/* Marker Outer Circle */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected || isHovered ? '2.2' : '1.6'}
                      fill={markerColor}
                      stroke="#ffffff"
                      strokeWidth="0.3"
                      className="shadow-sm drop-shadow"
                    />

                    {/* LDCT Scanner capability dot indicator */}
                    {marker.hasLdctScreening && (
                      <circle cx="0.9" cy="-0.9" r="0.6" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.15" />
                    )}
                  </g>
                )
              })}
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredMarker && activeLayer === 'facilities' && (
          <div
            className="absolute z-30 pointer-events-none bg-popover/95 backdrop-blur-md p-2.5 rounded-lg border border-border shadow-xl text-xs max-w-[240px]"
            style={{
              left: `${hoveredMarker.svgX}%`,
              top: `${hoveredMarker.svgY}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <div className="font-semibold text-foreground truncate">{hoveredMarker.name}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {hoveredMarker.district}, {hoveredMarker.division}
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {hoveredMarker.hasLdctScreening && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-500 text-amber-600 dark:text-amber-400">
                  LDCT
                </Badge>
              )}
              {hoveredMarker.hasGeneXpert && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 border-emerald-500 text-emerald-600 dark:text-emerald-400">
                  GeneXpert (TB)
                </Badge>
              )}
              {hoveredMarker.hasThoracicSurgery && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 border-blue-500 text-blue-600 dark:text-blue-400">
                  Thoracic Surgery
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 bg-background/90 backdrop-blur-md px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {activeLayer === 'facilities' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-blue-500 inline-block" />
                <span className="text-[11px]">
                  {isBn ? 'LDCT ফুসফুস স্ক্রিনিং কেন্দ্র' : 'LDCT Lung Screening Center'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-[11px]">
                  {isBn ? 'কমিউনিটি স্বাস্থ্য কেন্দ্র' : 'Community Clinic'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-purple-500 inline-block" />
                <span className="text-[11px]">
                  {isBn ? 'সাধারণ ও ডায়াগনস্টিক হাসপাতাল' : 'General / Diagnostic Hospital'}
                </span>
              </div>
            </>
          )}

          {activeLayer === 'environmental_aqi' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-red-600 inline-block" />
                <span className="text-[11px]">{isBn ? 'অস্বাস্থ্যকর (AQI > 150)' : 'Unhealthy (AQI > 150)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="text-[11px]">{isBn ? 'সহনীয় (AQI 51–100)' : 'Moderate (AQI 51–100)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-600 inline-block" />
                <span className="text-[11px]">{isBn ? 'ভালো (AQI 0–50)' : 'Good (AQI 0–50)'}</span>
              </div>
            </>
          )}

          {activeLayer === 'diagnostic_coverage' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-green-500/50 inline-block border border-green-600" />
                <span className="text-[11px]">{isBn ? 'যাচাইকৃত LDCT স্ক্রিনিং উপস্থিত' : 'Verified LDCT Present'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-amber-500/50 inline-block border border-amber-600" />
                <span className="text-[11px]">{isBn ? 'বেসিক সিটি উপস্থিত, LDCT নেই' : 'Standard CT, No LDCT'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-red-500/50 inline-block border border-red-600" />
                <span className="text-[11px]">{isBn ? 'কোনো স্ক্যানার নেই / সম্ভাব্য শূন্যতা' : 'No Scanner / Gap Area'}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/80">
          <Info className="size-3" />
          <span>WGS84 • EPSG:4326</span>
        </div>
      </div>
    </div>
  )
}
