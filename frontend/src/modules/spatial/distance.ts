/**
 * Phase 1.17: Spatial Distance & Coordinate Validation Utilities
 *
 * Implements standard spherical trigonometry (Haversine Great-Circle formula)
 * and bounding box validation for geographic coordinates in WGS84.
 */

import type { SpatialDistanceResult, GeoBoundingBox } from './types'

export const EARTH_RADIUS_KM = 6371.0088

export const MANDATORY_DISTANCE_DISCLAIMER =
  'Straight-line geodesic distance calculated via Haversine spherical formula (WGS84). ' +
  'It does NOT reflect actual road travel distance, river crossings, ferry timetables, ' +
  'traffic congestion, or estimated transit times.'

/**
 * Bangladesh Official Geographic Bounding Box (WGS84)
 * Covers mainland Bangladesh including coastal islands in the Bay of Bengal.
 */
export const BANGLADESH_BOUNDS: GeoBoundingBox = {
  minLat: 20.5,
  maxLat: 26.7,
  minLon: 88.0,
  maxLon: 92.7,
}

/**
 * Validates whether latitude and longitude are valid numbers and inside the expected country bounds.
 */
export function validateCoordinates(
  lat: number,
  lon: number,
  countryCode: string = 'BD'
): { isValid: boolean; error?: string } {
  if (typeof lat !== 'number' || isNaN(lat) || lat < -90 || lat > 90) {
    return { isValid: false, error: 'Latitude must be a valid number between -90 and 90 degrees.' }
  }

  if (typeof lon !== 'number' || isNaN(lon) || lon < -180 || lon > 180) {
    return { isValid: false, error: 'Longitude must be a valid number between -180 and 180 degrees.' }
  }

  if (countryCode.toUpperCase() === 'BD') {
    if (
      lat < BANGLADESH_BOUNDS.minLat ||
      lat > BANGLADESH_BOUNDS.maxLat ||
      lon < BANGLADESH_BOUNDS.minLon ||
      lon > BANGLADESH_BOUNDS.maxLon
    ) {
      return {
        isValid: false,
        error: `Coordinates (${lat}, ${lon}) fall outside the geographical bounding box of Bangladesh (${BANGLADESH_BOUNDS.minLat}°–${BANGLADESH_BOUNDS.maxLat}°N, ${BANGLADESH_BOUNDS.minLon}°–${BANGLADESH_BOUNDS.maxLon}°E).`,
      }
    }
  }

  return { isValid: true }
}

/**
 * Calculates straight-line spherical distance between two points on Earth using the Haversine formula.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): SpatialDistanceResult {
  const toRad = (deg: number) => (deg * Math.PI) / 180.0

  const phi1 = toRad(lat1)
  const phi2 = toRad(lat2)
  const deltaPhi = toRad(lat2 - lat1)
  const deltaLambda = toRad(lon2 - lon1)

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)

  // Safeguard floating point rounding errors beyond 1.0
  const safeA = Math.min(1.0, Math.max(0.0, a))
  const c = 2.0 * Math.atan2(Math.sqrt(safeA), Math.sqrt(1.0 - safeA))
  const distanceKm = Math.round(EARTH_RADIUS_KM * c * 10) / 10

  return {
    distanceKm,
    calculationMethod: 'haversine_great_circle',
    earthRadiusKm: EARTH_RADIUS_KM,
    disclaimer: MANDATORY_DISTANCE_DISCLAIMER,
  }
}

/**
 * Checks if a target location is within a given radial distance from a center point.
 */
export function isWithinRadius(
  centerLat: number,
  centerLon: number,
  targetLat: number,
  targetLon: number,
  radiusKm: number
): boolean {
  if (radiusKm <= 0) return false
  const result = calculateHaversineDistance(centerLat, centerLon, targetLat, targetLon)
  return result.distanceKm <= radiusKm
}

/**
 * Converts geographic coordinates (WGS84) to relative 0–100% SVG coordinates within Bangladesh bounds.
 * Useful for lightweight, zero-dependency, responsive vector map rendering.
 */
export function projectCoordinatesToSvg(
  lat: number,
  lon: number,
  bounds: GeoBoundingBox = BANGLADESH_BOUNDS,
  paddingPercent: number = 5
): { x: number; y: number } {
  // Normalize lon -> X (left to right: minLon -> maxLon)
  const normX = (lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)
  // Normalize lat -> Y (top to bottom: maxLat -> minLat because SVG Y is inverted)
  const normY = (bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)

  // Apply padding
  const scale = 100 - paddingPercent * 2
  const x = paddingPercent + normX * scale
  const y = paddingPercent + normY * scale

  return {
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
  }
}
