import type {
  GeographicHotspotSummary,
  SpatialInterpolationEstimate,
  SpatialModelingMethod,
} from '../types'
import { resolveCentroidCoordinates } from '../coordinates'

export const SPATIAL_MODELING_DISCLAIMER =
  'Spatial interpolation represents a mathematical estimation based on reference monitoring stations and satellite reanalysis. ' +
  'Local microclimates, indoor air quality, proximity to unmeasured point sources (e.g. brick kilns, biomass combustion), ' +
  'and street-level traffic density may vary significantly from regional interpolated estimates.'

interface ReferenceStationPoint {
  stationCode: string
  stationName: string
  division: string
  district: string
  latitude: number
  longitude: number
  currentPm25: number
  stationType: 'reference_bam1020' | 'government_cams' | 'calibrated_sensor'
}

export const BANGLADESH_REFERENCE_STATIONS: ReferenceStationPoint[] = [
  {
    stationCode: 'STN-DHK-01',
    stationName: 'US Embassy BAM-1020 Dhaka',
    division: 'Dhaka',
    district: 'Dhaka',
    latitude: 23.797,
    longitude: 90.423,
    currentPm25: 142.0,
    stationType: 'reference_bam1020',
  },
  {
    stationCode: 'STN-DHK-02',
    stationName: 'DoE CAMS-1 Farmgate Dhaka',
    division: 'Dhaka',
    district: 'Dhaka',
    latitude: 23.758,
    longitude: 90.389,
    currentPm25: 138.0,
    stationType: 'government_cams',
  },
  {
    stationCode: 'STN-CTG-01',
    stationName: 'DoE CAMS-3 Agrabad Chattogram',
    division: 'Chattogram',
    district: 'Chattogram',
    latitude: 22.325,
    longitude: 91.815,
    currentPm25: 82.0,
    stationType: 'government_cams',
  },
  {
    stationCode: 'STN-RAJ-01',
    stationName: 'DoE CAMS-5 Sapura Rajshahi',
    division: 'Rajshahi',
    district: 'Rajshahi',
    latitude: 24.382,
    longitude: 88.601,
    currentPm25: 76.5,
    stationType: 'government_cams',
  },
  {
    stationCode: 'STN-KHU-01',
    stationName: 'DoE CAMS-6 Boyra Khulna',
    division: 'Khulna',
    district: 'Khulna',
    latitude: 22.845,
    longitude: 89.540,
    currentPm25: 69.0,
    stationType: 'government_cams',
  },
  {
    stationCode: 'STN-SYL-01',
    stationName: 'DoE CAMS-7 SUST Campus Sylhet',
    division: 'Sylhet',
    district: 'Sylhet',
    latitude: 24.918,
    longitude: 91.831,
    currentPm25: 32.5,
    stationType: 'government_cams',
  },
  {
    stationCode: 'STN-BAR-01',
    stationName: 'DoE CAMS-8 Divisional Office Barishal',
    division: 'Barishal',
    district: 'Barishal',
    latitude: 22.701,
    longitude: 90.353,
    currentPm25: 58.0,
    stationType: 'government_cams',
  },
  {
    stationCode: 'STN-RNG-01',
    stationName: 'DoE CAMS-9 Collectorate Field Rangpur',
    division: 'Rangpur',
    district: 'Rangpur',
    latitude: 25.753,
    longitude: 89.244,
    currentPm25: 74.0,
    stationType: 'government_cams',
  },
  {
    stationCode: 'STN-MYM-01',
    stationName: 'DoE CAMS-10 Town Hall Mymensingh',
    division: 'Mymensingh',
    district: 'Mymensingh',
    latitude: 24.753,
    longitude: 90.407,
    currentPm25: 88.0,
    stationType: 'government_cams',
  },
]

export class GeographicEnvironmentalModelService {
  /**
   * Calculates Haversine distance in kilometers between two geographic coordinates
   */
  public static calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371 // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Number((R * c).toFixed(2))
  }

  /**
   * Performs Inverse Distance Weighting (IDW) spatial interpolation
   */
  public static interpolateSpatialPm25(
    targetLat: number,
    targetLon: number,
    division: string,
    district: string,
    power = 2.0
  ): SpatialInterpolationEstimate {
    let minDistance = Infinity

    let weightSum = 0
    let weightedPm25Sum = 0

    for (const stn of BANGLADESH_REFERENCE_STATIONS) {
      const dist = this.calculateDistanceKm(targetLat, targetLon, stn.latitude, stn.longitude)

      if (dist < minDistance) {
        minDistance = dist
      }

      // If exactly coincident with a monitoring station (within 200m)
      if (dist < 0.2) {
        const aqi = Math.round(stn.currentPm25 * 1.55)
        return {
          targetLatitude: targetLat,
          targetLongitude: targetLon,
          division,
          district,
          estimatedPm25: stn.currentPm25,
          estimatedAqi: aqi,
          interpolationMethod: 'ground_station_direct',
          uncertaintyMarginPm25: 5.0,
          confidenceInterval95: [
            Math.max(0, stn.currentPm25 - 5.0),
            stn.currentPm25 + 5.0,
          ],
          contributingStationsCount: 1,
          distanceToNearestStationKm: dist,
          spatialDisclaimer: SPATIAL_MODELING_DISCLAIMER,
        }
      }

      const weight = 1 / Math.pow(dist, power)
      weightSum += weight
      weightedPm25Sum += weight * stn.currentPm25
    }

    const estimatedPm25 = Number((weightedPm25Sum / weightSum).toFixed(1))
    const estimatedAqi = Math.round(estimatedPm25 * 1.55)

    // Uncertainty increases with distance to nearest monitoring station
    // Baseline uncertainty ±10 µg/m³, plus 0.1 µg/m³ per km distance beyond 20km
    const extraMargin = minDistance > 20 ? (minDistance - 20) * 0.15 : 0
    const uncertaintyMargin = Number((10.0 + extraMargin).toFixed(1))

    const method: SpatialModelingMethod = 'idw_interpolation'

    return {
      targetLatitude: targetLat,
      targetLongitude: targetLon,
      division,
      district,
      estimatedPm25,
      estimatedAqi,
      interpolationMethod: method,
      uncertaintyMarginPm25: uncertaintyMargin,
      confidenceInterval95: [
        Math.max(0, Number((estimatedPm25 - uncertaintyMargin).toFixed(1))),
        Number((estimatedPm25 + uncertaintyMargin).toFixed(1)),
      ],
      contributingStationsCount: BANGLADESH_REFERENCE_STATIONS.length,
      distanceToNearestStationKm: minDistance,
      spatialDisclaimer: SPATIAL_MODELING_DISCLAIMER,
    }
  }

  /**
   * Retrieves environmental hotspots across Bangladesh
   */
  public static getBangladeshHotspots(): GeographicHotspotSummary[] {
    return [
      {
        division: 'Dhaka',
        district: 'Dhaka',
        centroidLatitude: 23.8103,
        centroidLongitude: 90.4125,
        annualAvgPm25: 114.2,
        peakSeasonAvgPm25: 185.0,
        hotspotSeverityTier: 'extreme',
        primaryContributingFactors: [
          'High density of peripheral fixed-chimney brick kilns (FCBK)',
          'Dense urban vehicular emissions & idling congestion',
          'Winter thermal temperature inversion traps ground particulate layer',
        ],
        nearestMonitoringStation: {
          stationName: 'US Embassy BAM-1020 / DoE CAMS-1 Farmgate',
          distanceKm: 2.1,
          stationType: 'Reference BAM-1020',
        },
        dataConfidenceScore: 0.98,
      },
      {
        division: 'Dhaka',
        district: 'Narayanganj',
        centroidLatitude: 23.6238,
        centroidLongitude: 90.5000,
        annualAvgPm25: 118.5,
        peakSeasonAvgPm25: 192.0,
        hotspotSeverityTier: 'extreme',
        primaryContributingFactors: [
          'Textile dyeing, re-rolling steel mills, and river cement grinding hubs',
          'Dense cluster of coal-fired brick kilns along the Shitalakshya River',
        ],
        nearestMonitoringStation: {
          stationName: 'DoE CAMS-1 Farmgate',
          distanceKm: 18.5,
          stationType: 'Government CAMS',
        },
        dataConfidenceScore: 0.91,
      },
      {
        division: 'Dhaka',
        district: 'Gazipur',
        centroidLatitude: 23.9999,
        centroidLongitude: 90.4203,
        annualAvgPm25: 108.0,
        peakSeasonAvgPm25: 178.0,
        hotspotSeverityTier: 'extreme',
        primaryContributingFactors: [
          'Heavy industrial apparel manufacturing & heavy truck transport corridors',
          'Concentration of brick fields along the Turag basin',
        ],
        nearestMonitoringStation: {
          stationName: 'US Embassy BAM-1020',
          distanceKm: 22.4,
          stationType: 'Reference BAM-1020',
        },
        dataConfidenceScore: 0.89,
      },
      {
        division: 'Chattogram',
        district: 'Chattogram',
        centroidLatitude: 22.3569,
        centroidLongitude: 91.7832,
        annualAvgPm25: 78.4,
        peakSeasonAvgPm25: 132.0,
        hotspotSeverityTier: 'high',
        primaryContributingFactors: [
          'Seaport logistics, heavy diesel freight, and shipbreaking scrap processing',
          'Industrial manufacturing corridor in Sitakunda-Agrabad',
        ],
        nearestMonitoringStation: {
          stationName: 'DoE CAMS-3 Agrabad',
          distanceKm: 3.5,
          stationType: 'Government CAMS',
        },
        dataConfidenceScore: 0.94,
      },
      {
        division: 'Rajshahi',
        district: 'Rajshahi',
        centroidLatitude: 24.3745,
        centroidLongitude: 88.6042,
        annualAvgPm25: 82.1,
        peakSeasonAvgPm25: 138.0,
        hotspotSeverityTier: 'high',
        primaryContributingFactors: [
          'Transboundary Indo-Gangetic Plain aerosol drift during dry winter',
          'Local agricultural biomass burning & roadside dust resuspension',
        ],
        nearestMonitoringStation: {
          stationName: 'DoE CAMS-5 Sapura',
          distanceKm: 1.8,
          stationType: 'Government CAMS',
        },
        dataConfidenceScore: 0.95,
      },
      {
        division: 'Khulna',
        district: 'Khulna',
        centroidLatitude: 22.8456,
        centroidLongitude: 89.5403,
        annualAvgPm25: 68.5,
        peakSeasonAvgPm25: 115.0,
        hotspotSeverityTier: 'moderate',
        primaryContributingFactors: [
          'Jute and paper mills along the Rupsha river',
          'Fossil fuel combustion from regional transport',
        ],
        nearestMonitoringStation: {
          stationName: 'DoE CAMS-6 Boyra',
          distanceKm: 2.2,
          stationType: 'Government CAMS',
        },
        dataConfidenceScore: 0.92,
      },
      {
        division: 'Sylhet',
        district: 'Sylhet',
        centroidLatitude: 24.8949,
        centroidLongitude: 91.8687,
        annualAvgPm25: 36.2,
        peakSeasonAvgPm25: 64.0,
        hotspotSeverityTier: 'low',
        primaryContributingFactors: [
          'Substantially lower industrial density and high annual monsoon precipitation',
          'Surrounded by tea garden foliage providing particulate interception',
        ],
        nearestMonitoringStation: {
          stationName: 'DoE CAMS-7 SUST Campus',
          distanceKm: 4.1,
          stationType: 'Government CAMS',
        },
        dataConfidenceScore: 0.96,
      },
    ]
  }

  /**
   * Resolves district interpolation estimate using district centroid
   */
  public static interpolateDistrictEstimate(
    division: string,
    district: string
  ): SpatialInterpolationEstimate {
    const coords = resolveCentroidCoordinates(division, district, 'BD')
    return this.interpolateSpatialPm25(coords.latitude, coords.longitude, division, district)
  }
}
