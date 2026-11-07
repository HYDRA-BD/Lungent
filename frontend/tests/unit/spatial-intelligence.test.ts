import { describe, it, expect } from 'vitest'
import {
  calculateHaversineDistance,
  isWithinRadius,
  validateCoordinates,
  projectCoordinatesToSvg,
  EARTH_RADIUS_KM,
  MANDATORY_DISTANCE_DISCLAIMER,
  BANGLADESH_BOUNDS,
  BANGLADESH_DIVISIONS_DATA,
  BANGLADESH_DIVISION_BOUNDARIES,
  SpatialIntelligenceService,
  METHODOLOGY_LIMITATION_NOTICE,
} from '@/modules/spatial'

describe('Phase 1.17: Spatial Intelligence & Geographical Analysis', () => {
  describe('1. Coordinate Validation & Bounding Box Checks', () => {
    it('should validate coordinates within Bangladesh bounds correctly', () => {
      // Dhaka
      const dhaka = validateCoordinates(23.8103, 90.4125, 'BD')
      expect(dhaka.isValid).toBe(true)

      // Chattogram
      const ctg = validateCoordinates(22.3569, 91.7832, 'BD')
      expect(ctg.isValid).toBe(true)

      // Cox's Bazar (southern coast)
      const cxb = validateCoordinates(21.4272, 92.0058, 'BD')
      expect(cxb.isValid).toBe(true)

      // Tetulia, Panchagarh (northern tip)
      const tetulia = validateCoordinates(26.4952, 88.5583, 'BD')
      expect(tetulia.isValid).toBe(true)
    })

    it('should reject coordinates outside Bangladesh bounds when countryCode is BD', () => {
      // London, UK
      const london = validateCoordinates(51.5074, -0.1278, 'BD')
      expect(london.isValid).toBe(false)
      expect(london.error).toContain('outside the geographical bounding box of Bangladesh')

      // New Delhi, India (outside Bangladesh bounds)
      const delhi = validateCoordinates(28.6139, 77.209, 'BD')
      expect(delhi.isValid).toBe(false)
    })

    it('should reject non-numeric or invalid range coordinates', () => {
      expect(validateCoordinates(95, 90).isValid).toBe(false)
      expect(validateCoordinates(-95, 90).isValid).toBe(false)
      expect(validateCoordinates(23.8, 195).isValid).toBe(false)
      expect(validateCoordinates(NaN, 90).isValid).toBe(false)
    })
  })

  describe('2. Spherical Distance Calculation (Haversine Formula)', () => {
    it('should calculate zero distance for identical coordinates', () => {
      const result = calculateHaversineDistance(23.8103, 90.4125, 23.8103, 90.4125)
      expect(result.distanceKm).toBe(0)
      expect(result.calculationMethod).toBe('haversine_great_circle')
      expect(result.earthRadiusKm).toBe(EARTH_RADIUS_KM)
      expect(result.disclaimer).toBe(MANDATORY_DISTANCE_DISCLAIMER)
    })

    it('should calculate accurate geodesic distance between known benchmark cities', () => {
      // Dhaka (23.8103, 90.4125) to Chattogram (22.3569, 91.7832) is ~214 km straight line
      const result = calculateHaversineDistance(23.8103, 90.4125, 22.3569, 91.7832)
      expect(result.distanceKm).toBeGreaterThan(200)
      expect(result.distanceKm).toBeLessThan(230)
      expect(result.distanceKm).toBe(214)
    })

    it('should evaluate isWithinRadius correctly', () => {
      const dhakaLat = 23.8103
      const dhakaLon = 90.4125

      // Mirpur to Mohakhali is ~5 km
      expect(isWithinRadius(dhakaLat, dhakaLon, 23.7778, 90.4056, 10)).toBe(true)

      // Dhaka to Chattogram is ~214 km
      expect(isWithinRadius(dhakaLat, dhakaLon, 22.3569, 91.7832, 50)).toBe(false)
      expect(isWithinRadius(dhakaLat, dhakaLon, 22.3569, 91.7832, 250)).toBe(true)
    })

    it('should project coordinates into 0-100% SVG viewport cleanly', () => {
      const dhakaSvg = projectCoordinatesToSvg(23.8103, 90.4125, BANGLADESH_BOUNDS, 5)
      expect(dhakaSvg.x).toBeGreaterThan(0)
      expect(dhakaSvg.x).toBeLessThan(100)
      expect(dhakaSvg.y).toBeGreaterThan(0)
      expect(dhakaSvg.y).toBeLessThan(100)
    })
  })

  describe('3. Administrative Boundaries & Division Geometry', () => {
    it('should contain all 8 administrative divisions of Bangladesh with valid metadata', () => {
      const divisions = Object.keys(BANGLADESH_DIVISIONS_DATA)
      expect(divisions).toHaveLength(8)
      expect(divisions).toContain('dhaka')
      expect(divisions).toContain('chattogram')
      expect(divisions).toContain('rajshahi')
      expect(divisions).toContain('khulna')
      expect(divisions).toContain('sylhet')
      expect(divisions).toContain('rangpur')
      expect(divisions).toContain('barishal')
      expect(divisions).toContain('mymensingh')

      for (const div of Object.values(BANGLADESH_DIVISIONS_DATA)) {
        expect(div.centroid.latitude).toBeGreaterThan(20)
        expect(div.centroid.latitude).toBeLessThan(27)
        expect(div.centroid.longitude).toBeGreaterThan(88)
        expect(div.centroid.longitude).toBeLessThan(93)
        expect(div.nameBn).toBeDefined()
        expect(div.districtsCount).toBeGreaterThan(0)
      }
    })

    it('should provide valid SVG boundary paths for all 8 divisions', () => {
      expect(BANGLADESH_DIVISION_BOUNDARIES).toHaveLength(8)
      for (const feat of BANGLADESH_DIVISION_BOUNDARIES) {
        expect(feat.svgPath.startsWith('M ')).toBe(true)
        expect(feat.svgPath.endsWith('Z')).toBe(true)
        expect(feat.bbox.minLat).toBeLessThan(feat.bbox.maxLat)
      }
    })
  })

  describe('4. Facility Mapping Markers & Spatial Filtering', () => {
    it('should retrieve facility map markers with diagnostic capability flags', async () => {
      const markers = await SpatialIntelligenceService.getFacilityMapMarkers()
      expect(markers.length).toBeGreaterThan(0)

      const dcpi = markers.find((m) => m.facilityId.includes('DCPI') || m.name.includes('Dhaka Central'))
      expect(dcpi).toBeDefined()
      expect(dcpi?.hasLdctScreening).toBe(true)
      expect(dcpi?.hasSpirometry).toBe(true)
      expect(dcpi?.division).toBe('Dhaka')

      const cmch = markers.find((m) => m.facilityId.includes('CTG001'))
      expect(cmch).toBeDefined()
      expect(cmch?.hasGeneXpert).toBe(true)
      expect(cmch?.hasThoracicSurgery).toBe(true)
      expect(cmch?.division).toBe('Chattogram')
    })

    it('should filter facilities by division and service capability', async () => {
      // Filter by Chattogram division
      const ctgMarkers = await SpatialIntelligenceService.getFacilityMapMarkers({ division: 'Chattogram' })
      expect(ctgMarkers.length).toBeGreaterThan(0)
      for (const m of ctgMarkers) {
        expect(m.division).toBe('Chattogram')
      }

      // Filter by LDCT screening capability
      const ldctMarkers = await SpatialIntelligenceService.getFacilityMapMarkers({
        serviceCapability: 'ldct_screening',
      })
      for (const m of ldctMarkers) {
        expect(m.hasLdctScreening).toBe(true)
      }
    })

    it('should execute radius searches and return sorted distances', async () => {
      const dhakaLat = 23.8103
      const dhakaLon = 90.4125

      const results = await SpatialIntelligenceService.searchFacilitiesByRadius(dhakaLat, dhakaLon, 25)
      expect(results.length).toBeGreaterThan(0)

      // Results must be sorted ascending by distance
      for (let i = 1; i < results.length; i++) {
        expect(results[i].distanceResult.distanceKm).toBeGreaterThanOrEqual(results[i - 1].distanceResult.distanceKm)
      }

      // All distances within 25 km
      for (const r of results) {
        expect(r.distanceResult.distanceKm).toBeLessThanOrEqual(25)
      }
    })
  })

  describe('5. District Diagnostic Coverage & Underserved Analysis', () => {
    it('should analyze diagnostic coverage across districts and identify coverage gaps', async () => {
      const summaries = await SpatialIntelligenceService.getDistrictCoverageAnalysis()
      expect(summaries.length).toBeGreaterThan(0)

      // Dhaka district should have adequate imaging
      const dhakaSummary = summaries.find((s) => s.district.toLowerCase() === 'dhaka')
      expect(dhakaSummary).toBeDefined()
      expect(dhakaSummary?.hasLdctScreening).toBe(true)
      expect(dhakaSummary?.coverageTier).toBe('adequate_imaging')

      // A district without LDCT should have a calculated distance to nearest verified LDCT
      const gapDistrict = summaries.find((s) => !s.hasLdctScreening)
      if (gapDistrict) {
        expect(gapDistrict.nearestLdctFacility).toBeDefined()
        expect(gapDistrict.nearestLdctFacility?.distanceKm).toBeGreaterThan(0)
        expect(gapDistrict.coverageNotes).toContain('Nearest verified scanner is')
      }
    })

    it('should produce an Underserved Areas Report with methodology limitation notice', async () => {
      const report = await SpatialIntelligenceService.getUnderservedAreasReport()
      expect(report.totalDistrictsAnalyzed).toBeGreaterThan(0)
      expect(report.districtsWithLdct).toBeGreaterThan(0)
      expect(report.districtsLackingLdct).toBeGreaterThan(0)
      expect(report.methodologyDisclaimer).toBe(METHODOLOGY_LIMITATION_NOTICE)
    })
  })

  describe('6. Patient Geographic Privacy Preservation', () => {
    it('should aggregate patient distribution at district level without exposing pinpoint coordinates', async () => {
      const distribution = await SpatialIntelligenceService.getPatientGeographicDistribution()
      expect(distribution.length).toBeGreaterThan(0)

      for (const item of distribution) {
        expect(item.district).toBeDefined()
        expect(item.aggregatedPatientCount).toBeGreaterThan(0)
        expect(item.isPrivacyAggregated).toBe(true)
        expect(item.privacyNotice).toContain('precise residential coordinates are strictly suppressed')

        // Must NOT expose latitude, longitude, address, or patient names
        expect((item as unknown as Record<string, unknown>).latitude).toBeUndefined()
        expect((item as unknown as Record<string, unknown>).longitude).toBeUndefined()
        expect((item as unknown as Record<string, unknown>).patientName).toBeUndefined()
        expect((item as unknown as Record<string, unknown>).patientId).toBeUndefined()
      }
    })
  })
})
