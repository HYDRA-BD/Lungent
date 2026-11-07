/**
 * Phase 1.17: Geographical Intelligence and Spatial Analysis Types
 *
 * Clinical Decision Support & Spatial Context
 * Important: Spatial analysis provides operational coverage insights and environmental context.
 * It NEVER independently calculates clinical cancer risk, screening eligibility, or diagnosis.
 */

import type { FacilityStatus } from '@/types/database'

export interface GeoCoordinates {
  latitude: number
  longitude: number
  elevation?: number | null
}

export interface GeoBoundingBox {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

/**
 * Standard Spatial Distance Calculation Result (Haversine Spherical)
 */
export interface SpatialDistanceResult {
  distanceKm: number
  calculationMethod: 'haversine_great_circle'
  earthRadiusKm: number
  /**
   * MANDATORY GEOGRAPHIC CAVEAT:
   * Straight-line geodesic distance does NOT reflect actual road travel distance,
   * river ferry crossings, traffic congestion, or transit travel times.
   */
  disclaimer: string
}

/**
 * Marker representation of a registered healthcare facility for interactive spatial mapping
 */
export interface FacilityMapMarker {
  id: string
  facilityId: string // Canonical FAC-YYYY-XXXXXX
  name: string
  nameBn: string
  facilityTypeId: string
  facilityTypeName: string
  ownershipCategoryId: string
  ownershipCategoryName: string
  status: FacilityStatus
  verificationStatus: 'verified' | 'pending_verification' | 'unverified' | 'rejected'
  latitude: number
  longitude: number
  countryCode: string
  division: string
  district: string
  upazila: string
  addressLine: string
  contactPhone?: string | null
  contactEmail?: string | null
  // Diagnostic and clinical service capabilities
  services: string[]
  hasLdctScreening: boolean
  hasDiagnosticCt: boolean
  hasSpirometry: boolean
  hasGeneXpert: boolean
  hasThoracicSurgery: boolean
  operationalCapacity?: {
    totalBeds?: number
    ldctScanners?: number
    spirometryStations?: number
  }
}

/**
 * Spatial query filters
 */
export interface SpatialSearchFilter {
  query?: string
  division?: string
  district?: string
  upazila?: string
  facilityTypeId?: string
  ownershipCategoryId?: string
  serviceCapability?: 'ldct_screening' | 'diagnostic_ct' | 'spirometry' | 'genexpert_tb' | 'thoracic_surgery'
  verificationStatus?: 'verified' | 'all'
  centerCoordinates?: GeoCoordinates
  radiusKm?: number
}

/**
 * Coverage analysis tier for an administrative area
 */
export type CoverageTier = 
  | 'adequate_imaging'         // Has verified LDCT + CT + Spirometry
  | 'basic_imaging_only'       // Has CT or X-ray but no verified LDCT
  | 'primary_care_only'        // Only community/primary clinic, no advanced imaging
  | 'no_registered_facility'   // Zero registered facilities in this district
  | 'data_pending'             // Survey data in progress

/**
 * Detailed district diagnostic coverage and gap summary
 */
export interface DistrictCoverageSummary {
  countryCode: string
  division: string
  district: string
  districtBn: string
  centroid: GeoCoordinates
  totalFacilities: number
  verifiedFacilities: number
  hasLdctScreening: boolean
  ldctFacilityCount: number
  hasDiagnosticCt: boolean
  hasSpirometry: boolean
  hasGeneXpert: boolean
  hasThoracicSurgery: boolean
  nearestLdctFacility?: {
    facilityId: string
    name: string
    nameBn: string
    district: string
    distanceKm: number
  } | null
  nearestGeneXpertFacility?: {
    facilityId: string
    name: string
    nameBn: string
    district: string
    distanceKm: number
  } | null
  coverageTier: CoverageTier
  coverageNotes?: string
  // Associated environmental intelligence snapshot from Phase 1.16
  environmentalSnapshot?: {
    usAqi: number
    usAqiCategory: string
    europeanAqi: number
    europeanAqiCategory: string
    pm25: number
    observationTimestamp: string
  } | null
}

/**
 * Overall Underserved Areas Analysis Report
 */
export interface UnderservedAreasReport {
  totalDistrictsAnalyzed: number
  districtsWithLdct: number
  districtsLackingLdct: number
  districtsWithGeneXpert: number
  districtsLackingGeneXpert: number
  districtsWithZeroFacilities: number
  coverageSummaries: DistrictCoverageSummary[]
  analysisTimestamp: string
  /**
   * MANDATORY METHODOLOGICAL LIMITATION NOTICE:
   * Diagnostic coverage tiering is based solely on registered and verified healthcare facility
   * records within Lungent. It does NOT assert definitive regional epidemiology, population health
   * coverage percentage, or road transit accessibility without verified road network graphs.
   */
  methodologyDisclaimer: string
}

/**
 * Privacy-Preserving Aggregated Patient Geographic Distribution
 * Enforces healthcare privacy by strictly suppressing individual pinpoint coordinates.
 */
export interface PatientGeographicDistribution {
  division: string
  district: string
  aggregatedPatientCount: number
  isPrivacyAggregated: true
  /**
   * PRIVACY NOTICE:
   * Individual patient residences are strictly protected. Data is aggregated to administrative
   * district boundaries; high-precision residential coordinates are never displayed.
   */
  privacyNotice: string
}

/**
 * Supported Interactive Map Layers
 */
export type MapActiveLayer = 
  | 'facilities'           // Registered healthcare facilities markers & services
  | 'environmental_aqi'    // Ambient atmospheric AQI overlay (US & European standards)
  | 'diagnostic_coverage'  // District coverage gap choropleth (LDCT, CT, GeneXpert)

/**
 * Division Boundary Vector Feature (Simplified WGS84 Mercator projection)
 */
export interface AdministrativeBoundaryFeature {
  id: string
  name: string
  nameBn: string
  centroid: GeoCoordinates
  svgPath: string
  bbox: GeoBoundingBox
}
