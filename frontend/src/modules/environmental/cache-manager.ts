import type { EnvironmentalContextSummary } from './types'

interface CacheEntry {
  data: EnvironmentalContextSummary
  cachedAt: number
  expiresAt: number
}

export class EnvironmentalCacheManager {
  private static cache = new Map<string, CacheEntry>()
  private static inFlightRequests = new Map<string, Promise<EnvironmentalContextSummary>>()
  private static defaultTtlMs = 45 * 60 * 1000 // 45 minutes

  /**
   * Generates a normalized cache key from geographic query
   */
  static getCacheKey(countryCode: string, division: string, district: string): string {
    return `${countryCode.trim().toUpperCase()}:${division.trim().toLowerCase()}:${district.trim().toLowerCase()}`
  }

  /**
   * Retrieves fresh cached data if within TTL
   */
  static get(countryCode: string, division: string, district: string): EnvironmentalContextSummary | null {
    const key = this.getCacheKey(countryCode, division, district)
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now > entry.expiresAt) {
      // Stale
      return null
    }

    return {
      ...entry.data,
      isStale: false,
    }
  }

  /**
   * Retrieves stale cached data for offline fallback / network outage resilience
   */
  static getStale(countryCode: string, division: string, district: string): EnvironmentalContextSummary | null {
    const key = this.getCacheKey(countryCode, division, district)
    const entry = this.cache.get(key)
    if (!entry) return null

    return {
      ...entry.data,
      isStale: true,
    }
  }

  /**
   * Saves summary into cache with TTL
   */
  static set(
    countryCode: string,
    division: string,
    district: string,
    data: EnvironmentalContextSummary,
    ttlMs: number = this.defaultTtlMs
  ): void {
    const key = this.getCacheKey(countryCode, division, district)
    const now = Date.now()
    this.cache.set(key, {
      data,
      cachedAt: now,
      expiresAt: now + ttlMs,
    })
  }

  /**
   * Invalidates cached entry (e.g., on manual user refresh)
   */
  static invalidate(countryCode: string, division: string, district: string): void {
    const key = this.getCacheKey(countryCode, division, district)
    this.cache.delete(key)
  }

  /**
   * Clears entire cache (used in tests)
   */
  static clear(): void {
    this.cache.clear()
    this.inFlightRequests.clear()
  }

  /**
   * Deduplicates concurrent in-flight requests for identical geographic queries
   */
  static async deduplicate(
    countryCode: string,
    division: string,
    district: string,
    fetcher: () => Promise<EnvironmentalContextSummary>
  ): Promise<EnvironmentalContextSummary> {
    const key = this.getCacheKey(countryCode, division, district)

    // Check fresh cache first
    const cached = this.get(countryCode, division, district)
    if (cached) return cached

    // Check if identical request is already in-flight
    const existing = this.inFlightRequests.get(key)
    if (existing) {
      return existing
    }

    // Launch request and register in map
    const promise = (async () => {
      try {
        const result = await fetcher()
        this.set(countryCode, division, district, result)
        return result
      } finally {
        this.inFlightRequests.delete(key)
      }
    })()

    this.inFlightRequests.set(key, promise)
    return promise
  }
}
