import crypto from 'crypto'
import { PatientService } from '@/modules/patients/service'
import { HealthRecordService } from '@/modules/health-records/service'
import type {
  PreparedRiskInput,
  DerivedRiskVariables,
  InputValidationIssue,
} from './types'

export class InputPreparerService {
  /**
   * Prepares and validates structured clinical inputs for a patient
   */
  static async prepareAndValidatePatientInput(patientId: string): Promise<PreparedRiskInput> {
    const patient = await PatientService.getPatientById(patientId)
    if (!patient) {
      throw new Error(`Patient with ID ${patientId} not found`)
    }

    let healthRecord = await HealthRecordService.getComprehensiveHealthRecord(patientId)
    if (!healthRecord) {
      healthRecord = {
        patientId,
        medicalConditions: [],
        medications: [],
        allergies: [],
        smokingHistory: null,
        environmentalExposures: [],
        familyHistory: [],
        lifestyle: null,
        measurements: [],
        symptoms: [],
        reviews: [],
        lastUpdated: new Date().toISOString(),
      }
    }

    const issues: InputValidationIssue[] = []

    // 1. Demographics
    const currentYear = 2026
    let age = patient.approximateAge || 0
    if (patient.dateOfBirth) {
      const birthYear = parseInt(patient.dateOfBirth.slice(0, 4), 10)
      if (!isNaN(birthYear) && birthYear > 1900 && birthYear <= currentYear) {
        age = currentYear - birthYear
      }
    }

    if (age <= 0) {
      issues.push({
        field: 'demographics.age',
        type: 'missing',
        message: 'Patient age or valid date of birth is missing',
        severity: 'blocking',
      })
    } else if (age < 18) {
      issues.push({
        field: 'demographics.age',
        type: 'implausible',
        message: 'Patient is under 18 years of age; adult lung cancer risk models are not validated for pediatric populations',
        severity: 'blocking',
      })
    } else if (age > 105) {
      issues.push({
        field: 'demographics.age',
        type: 'implausible',
        message: 'Patient age exceeds validated demographic threshold (>105)',
        severity: 'warning',
      })
    }

    // 2. Smoking and Tobacco History
    const smoking = healthRecord.smokingHistory
    const status = smoking?.smokingStatus || 'unknown'
    let cpd = smoking?.cigarettesPerDay || 0
    const bpd = smoking?.bidisPerDay || 0
    let yearsSmoked = smoking?.yearsSmoked || 0
    let packYears = smoking?.calculatedPackYears || 0
    let yearsSinceQuit: number | null = null

    if (!smoking) {
      issues.push({
        field: 'smokingHistory',
        type: 'missing',
        message: 'Complete smoking history record is missing from patient profile',
        severity: 'blocking',
      })
    } else {
      if (status === 'unknown') {
        issues.push({
          field: 'smokingHistory.status',
          type: 'missing',
          message: 'Smoking status is unspecified or unknown',
          severity: 'blocking',
        })
      }

      // Calculate cessation interval if former smoker
      if (status === 'former') {
        if (smoking.quitDate) {
          const quitYear = parseInt(smoking.quitDate.slice(0, 4), 10)
          if (!isNaN(quitYear)) {
            yearsSinceQuit = Math.max(0, currentYear - quitYear)
          }
        } else if (smoking.ageQuit && smoking.ageQuit > 0 && age > 0) {
          yearsSinceQuit = Math.max(0, age - smoking.ageQuit)
        }

        if (yearsSinceQuit === null) {
          issues.push({
            field: 'smokingHistory.yearsSinceQuit',
            type: 'missing',
            message: 'Former smoker requires cessation year or age at quit for risk calculation',
            severity: 'blocking',
          })
        }
      }

      // Check logical consistency
      if (status === 'never') {
        if (cpd > 0 || bpd > 0 || yearsSmoked > 0) {
          issues.push({
            field: 'smokingHistory',
            type: 'conflicting',
            message: 'Never-smoker status contradicts recorded daily cigarettes/bidis or smoking duration',
            severity: 'blocking',
          })
          cpd = 0
          yearsSmoked = 0
          packYears = 0
        }
      }

      if (status === 'current' || status === 'former') {
        if (packYears <= 0 && cpd > 0 && yearsSmoked > 0) {
          // Transparent standard pack-years: (cigarettesPerDay / 20) * yearsSmoked
          packYears = Math.round(((cpd + bpd * 0.5) / 20) * yearsSmoked * 10) / 10
        }
      }
    }

    // 3. Medical Conditions
    const conditions = healthRecord.medicalConditions
    const hasCopd = conditions.some(
      (c) =>
        c.conditionName.toLowerCase().includes('copd') ||
        c.conditionName.toLowerCase().includes('emphysema') ||
        c.conditionName.toLowerCase().includes('chronic bronchitis')
    )
    const hasPriorMalignancy = conditions.some(
      (c) =>
        c.conditionCategory === 'oncological' ||
        c.conditionName.toLowerCase().includes('cancer') ||
        c.conditionName.toLowerCase().includes('carcinoma')
    )

    // 4. Family History
    const family = healthRecord.familyHistory
    const hasFamilyLungCancer = family.some(
      (f) =>
        f.conditionType === 'lung_cancer' ||
        (f.conditionType === 'other_cancer' &&
          (f.specificCancerType?.toLowerCase().includes('lung') ||
            f.notes?.toLowerCase().includes('lung')))
    )

    // 5. Environmental & Occupational Exposures
    const exposures = healthRecord.environmentalExposures
    const biomassExposure = exposures.find((e) => e.exposureCategory === 'indoor_biomass')
    const hasBiomassCookingFuel = !!biomassExposure
    const biomassDuration = biomassExposure?.durationYears || null

    const occupationalItems = exposures.filter(
      (e) => e.exposureCategory === 'occupational' || e.exposureCategory === 'other'
    )
    const hasOccupationalCarcinogens = occupationalItems.length > 0
    const occupationalTypes = occupationalItems.map((o) => o.exposureType)

    // 6. BMI from measurements
    let bmi: number | null = null
    const bmiMeasurement = healthRecord.measurements.find((m) => m.measurementType === 'bmi')
    if (bmiMeasurement) {
      bmi = bmiMeasurement.numericValue
    } else {
      const weight = healthRecord.measurements.find((m) => m.measurementType === 'weight')
      const height = healthRecord.measurements.find((m) => m.measurementType === 'height')
      if (weight && height && height.numericValue > 0) {
        const heightMeters = height.numericValue > 3 ? height.numericValue / 100 : height.numericValue
        bmi = Math.round((weight.numericValue / (heightMeters * heightMeters)) * 10) / 10
      }
    }

    const isCurrentSmoker = status === 'current'
    const isFormerSmoker = status === 'former'
    const isNeverSmoker = status === 'never'

    const derived: DerivedRiskVariables = {
      age,
      packYears,
      yearsSmoked,
      quitYearsAgo: yearsSinceQuit,
      isCurrentSmoker,
      isFormerSmoker,
      isNeverSmoker,
      cigarettesPerDay: cpd,
      bmi,
      hasCopdOrEmphysema: hasCopd,
      hasPriorCancer: hasPriorMalignancy,
      hasFamilyLungCancer,
      hasBiomassExposure: hasBiomassCookingFuel,
      hasOccupationalExposure: hasOccupationalCarcinogens,
    }

    // Provenance mapping
    const provenance: Record<string, { source: string; verified: boolean; timestamp: string }> = {
      demographics: {
        source: patient.createdBy?.startsWith('usr-worker') ? 'worker_collected' : 'patient_reported',
        verified: patient.verificationStatus === 'verified',
        timestamp: patient.createdAt,
      },
      smokingHistory: {
        source: smoking?.dataSource || 'patient_reported',
        verified: smoking?.verificationStatus === 'verified',
        timestamp: smoking?.updatedAt || smoking?.createdAt || patient.createdAt,
      },
      medicalHistory: {
        source: conditions[0]?.dataSource || 'patient_reported',
        verified: conditions.some((c) => c.verificationStatus === 'verified'),
        timestamp: conditions[0]?.updatedAt || patient.createdAt,
      },
      exposures: {
        source: exposures[0]?.dataSource || 'worker_collected',
        verified: exposures.some((e) => e.verificationStatus === 'verified'),
        timestamp: exposures[0]?.updatedAt || patient.createdAt,
      },
    }

    // Compute deterministic SHA-256 snapshot hash
    const hashPayload = JSON.stringify({
      patientId: patient.id,
      canonicalId: patient.patientId,
      age,
      gender: patient.gender,
      derived,
    })
    const snapshotHash = crypto.createHash('sha256').update(hashPayload).digest('hex')

    const hasBlockingIssues = issues.some((i) => i.severity === 'blocking')

    return {
      patientId: patient.id,
      patientCanonicalId: patient.patientId,
      patientName: patient.fullName,
      demographics: {
        age,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
      },
      smokingHistory: {
        status,
        cigarettesPerDay: cpd,
        bidisPerDay: bpd,
        yearsSmoked,
        ageStarted: smoking?.ageStarted || null,
        ageQuit: smoking?.ageQuit || null,
        packYears,
        yearsSinceQuit,
      },
      medicalHistory: {
        hasCopd,
        hasPriorMalignancy,
        hasFamilyLungCancer,
        conditionsSummary: conditions.map((c) => c.conditionName),
      },
      environmentalAndOccupational: {
        hasBiomassCookingFuel,
        biomassDurationYears: biomassDuration,
        hasOccupationalCarcinogens,
        occupationalTypes,
      },
      derived,
      provenance,
      validation: {
        isValid: !hasBlockingIssues,
        hasBlockingIssues,
        issues,
      },
      snapshotHash,
    }
  }
}
