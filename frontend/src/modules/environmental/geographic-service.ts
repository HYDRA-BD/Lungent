import { BANGLADESH_GEOGRAPHY } from '@/modules/facilities/geographic-data'
import { createClient } from '@/lib/supabase/server'
import type { GeographicHierarchyNode, PatientLocationHistoryEntry } from './types'
import type { RecordPatientLocationHistoryInput } from './validation'

/**
 * International fallback registry for configurable multi-country expansion
 */
const INTERNATIONAL_REGISTRY: Record<string, {
  countryCode: string
  name: string
  nameBn?: string
  divisions: Record<string, {
    id: string
    name: string
    districts: Record<string, {
      id: string
      name: string
      upazilas: { id: string; name: string }[]
    }>
  }>
}> = {
  US: {
    countryCode: 'US',
    name: 'United States',
    nameBn: 'যুক্তরাষ্ট্র',
    divisions: {
      California: {
        id: 'California',
        name: 'California',
        districts: {
          'Los Angeles County': {
            id: 'Los Angeles County',
            name: 'Los Angeles County',
            upazilas: [
              { id: 'Los Angeles', name: 'Los Angeles' },
              { id: 'Long Beach', name: 'Long Beach' },
              { id: 'Pasadena', name: 'Pasadena' },
            ],
          },
        },
      },
    },
  },
}

export class GeographicIntelligenceService {
  /**
   * Retrieves top-level divisions/states for a given country
   */
  static getDivisions(countryCode = 'BD'): GeographicHierarchyNode[] {
    const normCountry = countryCode.toUpperCase()
    if (normCountry === 'BD') {
      return Object.values(BANGLADESH_GEOGRAPHY.divisions).map((d) => ({
        id: d.id,
        code: `BD-${d.id.toUpperCase()}`,
        name: d.name,
        nameBn: d.nameBn,
        level: 'division',
        countryCode: 'BD',
      }))
    }

    const intl = INTERNATIONAL_REGISTRY[normCountry]
    if (intl) {
      return Object.values(intl.divisions).map((d) => ({
        id: d.id,
        code: `${normCountry}-${d.id.toUpperCase()}`,
        name: d.name,
        level: 'division',
        countryCode: normCountry,
      }))
    }

    return []
  }

  /**
   * Retrieves districts/counties for a given division
   */
  static getDistricts(divisionId: string, countryCode = 'BD'): GeographicHierarchyNode[] {
    const normCountry = countryCode.toUpperCase()
    if (normCountry === 'BD') {
      const division = BANGLADESH_GEOGRAPHY.divisions[divisionId]
      if (!division) return []
      return Object.values(division.districts).map((dist) => ({
        id: dist.id,
        code: `BD-${divisionId.toUpperCase()}-${dist.id.toUpperCase()}`,
        name: dist.name,
        nameBn: dist.nameBn,
        level: 'district',
        parentId: divisionId,
        countryCode: 'BD',
      }))
    }

    const intl = INTERNATIONAL_REGISTRY[normCountry]
    if (intl && intl.divisions[divisionId]) {
      return Object.values(intl.divisions[divisionId].districts).map((dist) => ({
        id: dist.id,
        code: `${normCountry}-${divisionId.toUpperCase()}-${dist.id.toUpperCase()}`,
        name: dist.name,
        level: 'district',
        parentId: divisionId,
        countryCode: normCountry,
      }))
    }

    return []
  }

  /**
   * Retrieves upazilas/municipalities for a given district
   */
  static getUpazilas(divisionId: string, districtId: string, countryCode = 'BD'): GeographicHierarchyNode[] {
    const normCountry = countryCode.toUpperCase()
    if (normCountry === 'BD') {
      const division = BANGLADESH_GEOGRAPHY.divisions[divisionId]
      if (!division) return []
      const district = division.districts[districtId]
      if (!district) return []
      return district.upazilas.map((u) => ({
        id: u.id,
        code: `BD-${districtId.toUpperCase()}-${u.id.toUpperCase()}`,
        name: u.name,
        nameBn: u.nameBn,
        level: 'upazila',
        parentId: districtId,
        countryCode: 'BD',
      }))
    }

    const intl = INTERNATIONAL_REGISTRY[normCountry]
    if (intl && intl.divisions[divisionId] && intl.divisions[divisionId].districts[districtId]) {
      return intl.divisions[divisionId].districts[districtId].upazilas.map((u) => ({
        id: u.id,
        code: `${normCountry}-${districtId.toUpperCase()}-${u.id.toUpperCase()}`,
        name: u.name,
        level: 'upazila',
        parentId: districtId,
        countryCode: normCountry,
      }))
    }

    return []
  }

  /**
   * Validates whether a given administrative tuple exists in the active registry
   */
  static validateLocation(
    division: string,
    district: string,
    upazila?: string | null,
    countryCode = 'BD'
  ): { isValid: boolean; reason?: string } {
    const normCountry = countryCode.toUpperCase()
    if (normCountry === 'BD') {
      const divObj = BANGLADESH_GEOGRAPHY.divisions[division]
      if (!divObj) {
        return { isValid: false, reason: `Unknown division '${division}' in Bangladesh.` }
      }
      const distObj = divObj.districts[district]
      if (!distObj) {
        return { isValid: false, reason: `District '${district}' not found in division '${division}'.` }
      }
      if (upazila) {
        const upazilaFound = distObj.upazilas.some(
          (u) => u.id.toLowerCase() === upazila.toLowerCase() || u.name.toLowerCase() === upazila.toLowerCase()
        )
        if (!upazilaFound) {
          return { isValid: false, reason: `Upazila '${upazila}' not found in district '${district}'.` }
        }
      }
      return { isValid: true }
    }

    const intl = INTERNATIONAL_REGISTRY[normCountry]
    if (intl) {
      const divObj = intl.divisions[division]
      if (!divObj) return { isValid: false, reason: `Unknown administrative region '${division}'.` }
      const distObj = divObj.districts[district]
      if (!distObj) return { isValid: false, reason: `Subdivision '${district}' not found.` }
      return { isValid: true }
    }

    return { isValid: false, reason: `Unsupported country code '${countryCode}'.` }
  }

  /**
   * Searches administrative hierarchy by name in English or Bangla
   */
  static searchHierarchy(term: string, countryCode = 'BD'): GeographicHierarchyNode[] {
    const cleanTerm = term.trim().toLowerCase()
    if (!cleanTerm) return []

    const results: GeographicHierarchyNode[] = []
    const normCountry = countryCode.toUpperCase()

    if (normCountry === 'BD') {
      for (const [divKey, div] of Object.entries(BANGLADESH_GEOGRAPHY.divisions)) {
        if (div.name.toLowerCase().includes(cleanTerm) || div.nameBn.includes(cleanTerm)) {
          results.push({
            id: div.id,
            code: `BD-${div.id.toUpperCase()}`,
            name: div.name,
            nameBn: div.nameBn,
            level: 'division',
            countryCode: 'BD',
          })
        }

        for (const [distKey, dist] of Object.entries(div.districts)) {
          if (dist.name.toLowerCase().includes(cleanTerm) || dist.nameBn.includes(cleanTerm)) {
            results.push({
              id: dist.id,
              code: `BD-${divKey.toUpperCase()}-${distKey.toUpperCase()}`,
              name: dist.name,
              nameBn: dist.nameBn,
              level: 'district',
              parentId: div.id,
              countryCode: 'BD',
            })
          }

          for (const u of dist.upazilas) {
            if (u.name.toLowerCase().includes(cleanTerm) || u.nameBn.includes(cleanTerm)) {
              results.push({
                id: u.id,
                code: `BD-${distKey.toUpperCase()}-${u.id.toUpperCase()}`,
                name: u.name,
                nameBn: u.nameBn,
                level: 'upazila',
                parentId: dist.id,
                countryCode: 'BD',
              })
            }
          }
        }
      }
    }

    return results.slice(0, 20)
  }

  /**
   * Records or updates a patient's residential location in their history
   */
  static async recordPatientLocation(
    input: RecordPatientLocationHistoryInput,
    userId?: string | null
  ): Promise<{ success: boolean; entry?: PatientLocationHistoryEntry; error?: string }> {
    const validation = this.validateLocation(input.division, input.district, input.upazila, input.countryCode)
    if (!validation.isValid) {
      return { success: false, error: validation.reason }
    }

    try {
      const supabase = await createClient()

      // If marked as current, deactivate previous current records
      if (input.isCurrent) {
        await supabase
          .from('patient_geographic_histories')
          .update({ is_current: false })
          .eq('patient_id', input.patientId)
          .eq('is_current', true)
      }

      const { data, error } = await supabase
        .from('patient_geographic_histories')
        .insert({
          patient_id: input.patientId,
          country_code: input.countryCode,
          division: input.division,
          district: input.district,
          upazila: input.upazila || null,
          union_or_ward: input.unionOrWard || null,
          address_line: input.addressLine || null,
          is_current: input.isCurrent,
          duration_years: input.durationYears || null,
          valid_from: input.startDate || new Date().toISOString().slice(0, 10),
          valid_to: input.endDate || null,
          verification_status: input.verificationStatus,
          recorded_by: userId || null,
        })
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        entry: {
          id: data.id,
          patientId: data.patient_id,
          countryCode: data.country_code,
          division: data.division,
          district: data.district,
          upazila: data.upazila,
          unionOrWard: data.union_or_ward,
          addressLine: data.address_line,
          isCurrent: data.is_current,
          durationYears: data.duration_years,
          startDate: data.valid_from,
          endDate: data.valid_to,
          verificationStatus: data.verification_status,
          recordedBy: data.recorded_by,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record location history'
      return { success: false, error: msg }
    }
  }

  /**
   * Retrieves patient geographic residential history
   */
  static async getPatientLocationHistory(patientId: string): Promise<PatientLocationHistoryEntry[]> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('patient_geographic_histories')
        .select('*')
        .eq('patient_id', patientId)
        .order('is_current', { ascending: false })
        .order('created_at', { ascending: false })

      if (error || !data) {
        return []
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data as any[]).map((d) => ({
        id: d.id,
        patientId: d.patient_id,
        geographicEntityId: d.geographic_entity_id,
        countryCode: d.country_code,
        division: d.division,
        district: d.district,
        upazila: d.upazila,
        unionOrWard: d.union_or_ward,
        addressLine: d.address_line,
        isCurrent: d.is_current,
        durationYears: d.duration_years,
        startDate: d.valid_from,
        endDate: d.valid_to,
        verificationStatus: d.verification_status,
        recordedBy: d.recorded_by,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }))
    } catch {
      return []
    }
  }
}
