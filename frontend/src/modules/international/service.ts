/**
 * Phase 2.12: International Expansion Service Façade
 * Unified coordinator for multi-country profiles, clinical guideline governance,
 * regulatory compliance, generalized geographic structures, environmental providers,
 * and 12-step international readiness management.
 */

import {
  CountryConfigurationService,
  PRECONFIGURED_COUNTRIES,
} from './services/country-configuration-service'
import {
  CountryClinicalGuidelineService,
  PRECONFIGURED_CLINICAL_GUIDELINES,
} from './services/country-clinical-guideline-service'
import {
  CountryRegulatoryPrivacyService,
  PRECONFIGURED_PRIVACY_PROFILES,
} from './services/country-regulatory-privacy-service'
import {
  InternationalGeographicService,
  SAMPLE_GEOGRAPHIC_NODES,
} from './services/international-geographic-service'
import { InternationalEnvironmentalProviderService } from './services/international-environmental-provider-service'
import {
  CountryOnboardingReadinessService,
  DEFAULT_12_STEP_ROLLOUT_FRAMEWORK,
} from './services/country-onboarding-readiness-service'
import type {
  InternationalCountryProfile,
  CountryStatus,
  CountryClinicalGuideline,
  ClinicalGuidelineEvaluation,
  CountryRegulatoryPrivacyProfile,
  CrossBorderTransferEvaluation,
  CountryGeographicNode,
  EnvironmentalProviderType,
  StandardizedEnvironmentalObservation,
  CountryReadinessStep,
  CountryReadinessScorecard,
} from './types'

export class InternationalExpansionService {
  // 1. Country Configuration
  public getAllCountries(): InternationalCountryProfile[] {
    return CountryConfigurationService.getAllCountries()
  }

  public getCountry(countryCode: string): InternationalCountryProfile | undefined {
    return CountryConfigurationService.getCountryByCode(countryCode)
  }

  public getDefaultCountry(): InternationalCountryProfile {
    return CountryConfigurationService.getDefaultCountry()
  }

  public setCountryStatus(countryCode: string, status: CountryStatus): InternationalCountryProfile {
    return CountryConfigurationService.setCountryStatus(countryCode, status)
  }

  public formatCurrency(amount: number, countryCode: string): string {
    return CountryConfigurationService.formatCurrency(amount, countryCode)
  }

  public formatMeasurement(value: number, unitType: 'distance' | 'weight' | 'volume', countryCode: string): string {
    return CountryConfigurationService.formatMeasurement(value, unitType, countryCode)
  }

  // 2. Clinical Guideline Governance
  public getClinicalGuidelines(countryCode: string): CountryClinicalGuideline[] {
    return CountryClinicalGuidelineService.getGuidelinesForCountry(countryCode)
  }

  public evaluateClinicalExecution(countryCode: string): ClinicalGuidelineEvaluation {
    return CountryClinicalGuidelineService.evaluateClinicalExecutionStatus(countryCode)
  }

  public approveClinicalGuideline(guidelineKey: string, boardReference: string): CountryClinicalGuideline {
    return CountryClinicalGuidelineService.approveGuideline(guidelineKey, boardReference)
  }

  // 3. Regulatory & Privacy Governance
  public getPrivacyProfile(countryCode: string): CountryRegulatoryPrivacyProfile | undefined {
    return CountryRegulatoryPrivacyService.getPrivacyProfile(countryCode)
  }

  public evaluateCrossBorderTransfer(params: {
    requestingCountry: string
    patientOriginCountry: string
    patientId: string
    accessorUserId: string
    accessorRole: string
    jurisdictionLegalBasis: string
    explicitPatientConsentGiven: boolean
  }): CrossBorderTransferEvaluation {
    return CountryRegulatoryPrivacyService.evaluateCrossBorderTransfer(params)
  }

  // 4. Geographic Administration
  public getGeographicNodes(countryCode: string, level?: number): CountryGeographicNode[] {
    if (level !== undefined) {
      return InternationalGeographicService.getNodesByLevel(countryCode, level)
    }
    return InternationalGeographicService.getNodesForCountry(countryCode)
  }

  public getChildGeographicNodes(parentNodeCode: string): CountryGeographicNode[] {
    return InternationalGeographicService.getChildNodes(parentNodeCode)
  }

  // 5. Environmental Provider Abstraction
  public resolveEnvironmentalProvider(countryCode: string): EnvironmentalProviderType {
    return InternationalEnvironmentalProviderService.resolveProviderForCountry(countryCode)
  }

  public normalizeEnvironmentalObservation(params: {
    countryCode: string
    provider: EnvironmentalProviderType
    rawPm25: number
    rawPm10?: number
    rawNo2?: number
    rawSo2?: number
    rawO3?: number
    isSatelliteOrModelled?: boolean
  }): StandardizedEnvironmentalObservation {
    return InternationalEnvironmentalProviderService.normalizeEnvironmentalData(params)
  }

  // 6. International Rollout & Readiness (12-Step Framework)
  public getReadinessSteps(countryCode: string): CountryReadinessStep[] {
    return CountryOnboardingReadinessService.getReadinessSteps(countryCode)
  }

  public evaluateReadinessScorecard(countryCode: string, countryName: string): CountryReadinessScorecard {
    return CountryOnboardingReadinessService.evaluateReadinessScorecard(countryCode, countryName)
  }

  public updateReadinessStep(
    countryCode: string,
    stepNumber: number,
    isCompleted: boolean,
    notes?: string,
    verifiedBy?: string
  ): CountryReadinessStep {
    return CountryOnboardingReadinessService.updateStepStatus(countryCode, stepNumber, isCompleted, notes, verifiedBy)
  }
}

export const defaultInternationalExpansionService = new InternationalExpansionService()

export {
  PRECONFIGURED_COUNTRIES,
  PRECONFIGURED_CLINICAL_GUIDELINES,
  PRECONFIGURED_PRIVACY_PROFILES,
  SAMPLE_GEOGRAPHIC_NODES,
  DEFAULT_12_STEP_ROLLOUT_FRAMEWORK,
}

