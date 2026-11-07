/**
 * Phase 2.11: Centralized Subsystem Health & Monitoring Engine
 * Monitors nationwide infrastructure health, subsystem latencies, active incidents,
 * and enforces the Zero-PHI logging invariant across monitoring telemetry.
 */

import type {
  SubsystemType,
  SubsystemHealthStatus,
  SubsystemHealthIndicator,
  ServiceHealthIncidentItem,
} from '../types'

export const NATIONWIDE_SUBSYSTEMS: Array<{
  subsystem: SubsystemType
  nameEn: string
  nameBn: string
  endpoint: string
}> = [
  { subsystem: 'database', nameEn: 'PostgreSQL Database & RLS Pool', nameBn: 'পোস্টগ্রেএসকিউএল ডেটাবেজ ও আরএলএস পুল', endpoint: 'postgres://supabase.internal:5432' },
  { subsystem: 'api_gateway', nameEn: 'Next.js Regional API Gateway', nameBn: 'নেক্সট.জেএস আঞ্চলিক এপিআই গেটওয়ে', endpoint: 'https://api.lungent.health.gov.bd' },
  { subsystem: 'auth_service', nameEn: 'Supabase Auth & Session Verifier', nameBn: 'সুপাবেজ অথ ও সেশন ভেরিফায়ার', endpoint: 'https://auth.lungent.health.gov.bd' },
  { subsystem: 'fhir_gateway', nameEn: 'HL7 FHIR R4 Regional Gateway', nameBn: 'এইচএল৭ ফায়ার আর৪ আঞ্চলিক গেটওয়ে', endpoint: 'https://fhir.lungent.health.gov.bd/r4' },
  { subsystem: 'dicom_pacs_bridge', nameEn: 'DGHS Radiology DICOM/PACS Bridge', nameBn: 'ডিজিএইচএস রেডিওলজি ডাইকম/প্যাক্স ব্রিজ', endpoint: 'dicom-web://pacs.radiology.dghs.gov.bd' },
  { subsystem: 'environmental_feed', nameEn: 'Ambient Air Quality Feed (Open-Meteo)', nameBn: 'পরিবেশগত বায়ুর মান ফিড', endpoint: 'https://air-quality-api.open-meteo.com/v1' },
  { subsystem: 'notification_gateway', nameEn: 'SMS & Email National Dispatcher', nameBn: 'এসএমএস ও ইমেইল জাতীয় প্রেরণ ব্যবস্থা', endpoint: 'https://notify.dghs.gov.bd/gateway' },
]

export class CentralizedMonitoringService {
  private static incidents: ServiceHealthIncidentItem[] = []

  /**
   * Evaluates nationwide system health across all core subsystems
   */
  public static async checkSubsystemHealth(): Promise<{
    nationwideStatus: SubsystemHealthStatus
    subsystems: SubsystemHealthIndicator[]
  }> {
    const indicators: SubsystemHealthIndicator[] = []
    const now = new Date().toISOString()

    for (const sys of NATIONWIDE_SUBSYSTEMS) {
      // Simulated low-latency probe (5ms to 35ms)
      const simulatedLatency = Math.floor(Math.random() * 25) + 12
      const status: SubsystemHealthStatus =
        simulatedLatency < 120 ? 'healthy' : simulatedLatency < 250 ? 'degraded' : 'unavailable'

      indicators.push({
        subsystem: sys.subsystem,
        nameEn: sys.nameEn,
        nameBn: sys.nameBn,
        status,
        latencyMs: simulatedLatency,
        endpoint: sys.endpoint,
        lastCheckedAt: now,
        activeIncidentsCount: 0,
      })
    }

    const hasUnavailable = indicators.some(i => i.status === 'unavailable')
    const hasDegraded = indicators.some(i => i.status === 'degraded')
    const nationwideStatus: SubsystemHealthStatus = hasUnavailable
      ? 'unavailable'
      : hasDegraded
        ? 'degraded'
        : 'healthy'

    return {
      nationwideStatus,
      subsystems: indicators,
    }
  }

  /**
   * Enforces Zero-PHI Invariant on log and incident descriptions
   */
  public static verifyZeroPhiInvariant(text: string): { isCompliant: boolean; flaggedPattern?: string } {
    // 1. Check for unmasked Bangladesh phone numbers (+8801xxxxxxxxx or 01xxxxxxxxx)
    const phoneRegex = /(?:\+8801|01)[3-9]\d{8}\b/
    if (phoneRegex.test(text)) {
      return { isCompliant: false, flaggedPattern: 'DETECTED_UNMASKED_PHONE_NUMBER' }
    }

    // 2. Check for National ID (NID) 10, 13, or 17 digit raw sequences
    const nidRegex = /\b\d{10}\b|\b\d{13}\b|\b\d{17}\b/
    if (nidRegex.test(text)) {
      return { isCompliant: false, flaggedPattern: 'DETECTED_RAW_NATIONAL_ID_DIGITS' }
    }

    return { isCompliant: true }
  }

  /**
   * Records a service health incident while validating Zero-PHI compliance
   */
  public static recordIncident(params: {
    subsystem: SubsystemType
    regionOrFacility: string
    healthStatus: SubsystemHealthStatus
    incidentDescription: string
    latencyMs?: number
  }): ServiceHealthIncidentItem {
    const phiCheck = this.verifyZeroPhiInvariant(params.incidentDescription)
    if (!phiCheck.isCompliant) {
      throw new Error(`Zero-PHI Violation: Incident description contains forbidden sensitive data (${phiCheck.flaggedPattern})`)
    }

    const incident: ServiceHealthIncidentItem = {
      id: `inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      subsystem: params.subsystem,
      regionOrFacility: params.regionOrFacility,
      healthStatus: params.healthStatus,
      incidentDescription: params.incidentDescription,
      latencyMs: params.latencyMs || 0,
      isResolved: false,
      createdAt: new Date().toISOString(),
    }

    this.incidents.unshift(incident)
    return incident
  }

  /**
   * Retrieves logged incidents
   */
  public static getIncidents(limit = 20): ServiceHealthIncidentItem[] {
    return this.incidents.slice(0, limit)
  }
}

