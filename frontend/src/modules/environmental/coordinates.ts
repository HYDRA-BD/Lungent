/**
 * Phase 1.16: Geographic Coordinate Resolver & Centroid Directory
 *
 * Privacy-Conscious Spatial Resolution:
 * Maps administrative districts/divisions to authoritative geographic centroids.
 * Never collects, transmits, or stores exact residential pinpoint coordinates.
 */

export interface CentroidCoordinate {
  latitude: number
  longitude: number
  resolution: 'district_centroid' | 'division_centroid' | 'custom'
}

/**
 * Bangladesh Division Centroids (WGS84)
 */
export const DIVISION_CENTROIDS: Record<string, { lat: number; lon: number }> = {
  dhaka: { lat: 23.8103, lon: 90.4125 },
  chattogram: { lat: 22.3569, lon: 91.7832 },
  khulna: { lat: 22.8456, lon: 89.5403 },
  rajshahi: { lat: 24.3745, lon: 88.6042 },
  sylhet: { lat: 24.8949, lon: 91.8687 },
  rangpur: { lat: 25.7439, lon: 89.2752 },
  barishal: { lat: 22.701, lon: 90.3535 },
  mymensingh: { lat: 24.7471, lon: 90.4203 },
}

/**
 * Bangladesh 64 District Centroids (WGS84)
 */
export const BANGLADESH_DISTRICT_CENTROIDS: Record<string, { lat: number; lon: number }> = {
  // Dhaka Division
  dhaka: { lat: 23.8103, lon: 90.4125 },
  gazipur: { lat: 23.9999, lon: 90.4203 },
  narayanganj: { lat: 23.6238, lon: 90.50 },
  tangail: { lat: 24.2513, lon: 89.9167 },
  kishoreganj: { lat: 24.4449, lon: 90.7766 },
  manikganj: { lat: 23.8617, lon: 90.0003 },
  munshiganj: { lat: 23.5422, lon: 90.5305 },
  narsingdi: { lat: 23.9322, lon: 90.7154 },
  faridpur: { lat: 23.6071, lon: 89.8429 },
  gopalganj: { lat: 23.0051, lon: 89.8266 },
  madaripur: { lat: 23.1641, lon: 90.1897 },
  rajbari: { lat: 23.7574, lon: 89.6445 },
  shariatpur: { lat: 23.2423, lon: 90.4348 },

  // Chattogram Division
  chattogram: { lat: 22.3569, lon: 91.7832 },
  'cox\'s bazar': { lat: 21.4272, lon: 92.0058 },
  coxsbazar: { lat: 21.4272, lon: 92.0058 },
  cumilla: { lat: 23.4607, lon: 91.1809 },
  comilla: { lat: 23.4607, lon: 91.1809 },
  feni: { lat: 23.0186, lon: 91.3966 },
  brahmanbaria: { lat: 23.9608, lon: 91.1115 },
  chandpur: { lat: 23.2333, lon: 90.6667 },
  noakhali: { lat: 22.8696, lon: 91.0994 },
  lakshmipur: { lat: 22.9425, lon: 90.8412 },
  rangamati: { lat: 22.6533, lon: 92.1753 },
  khagrachhari: { lat: 23.1193, lon: 91.9847 },
  bandarban: { lat: 22.1953, lon: 92.2184 },

  // Khulna Division
  khulna: { lat: 22.8456, lon: 89.5403 },
  jashore: { lat: 23.1664, lon: 89.2138 },
  jessore: { lat: 23.1664, lon: 89.2138 },
  satkhira: { lat: 22.7185, lon: 89.0705 },
  bagerhat: { lat: 22.6516, lon: 89.7859 },
  kushtia: { lat: 23.9013, lon: 89.1205 },
  chuadanga: { lat: 23.6402, lon: 88.8418 },
  meherpur: { lat: 23.7622, lon: 88.6318 },
  jhenaidah: { lat: 23.545, lon: 89.1526 },
  magura: { lat: 23.4873, lon: 89.4199 },
  narail: { lat: 23.1725, lon: 89.5127 },

  // Rajshahi Division
  rajshahi: { lat: 24.3745, lon: 88.6042 },
  bogura: { lat: 24.8465, lon: 89.3777 },
  bogra: { lat: 24.8465, lon: 89.3777 },
  pabna: { lat: 24.0064, lon: 89.2372 },
  sirajganj: { lat: 24.4534, lon: 89.7007 },
  naogaon: { lat: 24.7936, lon: 88.9318 },
  natore: { lat: 24.4206, lon: 88.9324 },
  joypurhat: { lat: 25.1017, lon: 89.0275 },
  chapainawabganj: { lat: 24.5965, lon: 88.2775 },

  // Sylhet Division
  sylhet: { lat: 24.8949, lon: 91.8687 },
  moulvibazar: { lat: 24.4829, lon: 91.7774 },
  habiganj: { lat: 24.375, lon: 91.4167 },
  sunamganj: { lat: 25.0658, lon: 91.395 },

  // Rangpur Division
  rangpur: { lat: 25.7439, lon: 89.2752 },
  dinajpur: { lat: 25.6217, lon: 88.6355 },
  gaibandha: { lat: 25.3288, lon: 89.5408 },
  kurigram: { lat: 25.8054, lon: 89.6362 },
  lalmonirhat: { lat: 25.9923, lon: 89.2847 },
  nilphamari: { lat: 25.9318, lon: 88.856 },
  panchagarh: { lat: 26.3411, lon: 88.5542 },
  thakurgaon: { lat: 26.0337, lon: 88.4617 },

  // Barishal Division
  barishal: { lat: 22.701, lon: 90.3535 },
  bhola: { lat: 22.6859, lon: 90.6482 },
  jhalokati: { lat: 22.6406, lon: 90.1987 },
  pirojpur: { lat: 22.5841, lon: 89.972 },
  barguna: { lat: 22.0953, lon: 90.1121 },
  patuakhali: { lat: 22.3596, lon: 90.3299 },

  // Mymensingh Division
  mymensingh: { lat: 24.7471, lon: 90.4203 },
  jamalpur: { lat: 24.9375, lon: 89.9378 },
  netrokona: { lat: 24.8709, lon: 90.7279 },
  sherpur: { lat: 25.0205, lon: 90.0153 },
}

/**
 * Resolves geographic location query into WGS84 centroid coordinates
 */
export function resolveCentroidCoordinates(
  division: string,
  district: string,
  countryCode = 'BD'
): CentroidCoordinate {
  const normCountry = countryCode.trim().toUpperCase()

  if (normCountry === 'BD') {
    const distKey = district.trim().toLowerCase().replace(/[-_]/g, ' ')
    if (BANGLADESH_DISTRICT_CENTROIDS[distKey]) {
      const { lat, lon } = BANGLADESH_DISTRICT_CENTROIDS[distKey]
      return { latitude: lat, longitude: lon, resolution: 'district_centroid' }
    }

    const divKey = division.trim().toLowerCase()
    if (DIVISION_CENTROIDS[divKey]) {
      const { lat, lon } = DIVISION_CENTROIDS[divKey]
      return { latitude: lat, longitude: lon, resolution: 'division_centroid' }
    }

    // Default to Dhaka national center
    return { latitude: 23.8103, longitude: 90.4125, resolution: 'division_centroid' }
  }

  // International Fallbacks
  if (normCountry === 'US') {
    return { latitude: 34.0522, longitude: -118.2437, resolution: 'district_centroid' } // Los Angeles
  }

  if (normCountry === 'UK') {
    return { latitude: 51.5074, longitude: -0.1278, resolution: 'district_centroid' } // London
  }

  // Global default
  return { latitude: 23.8103, longitude: 90.4125, resolution: 'division_centroid' }
}
