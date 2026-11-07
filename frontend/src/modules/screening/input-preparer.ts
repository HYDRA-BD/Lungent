import { createHash } from 'crypto'
import { PatientService } from '@/modules/patients/service'
import { HealthRecordService } from '@/modules/health-records/service'
import type {
  PreparedScreeningInput,
  ScreeningDerivedVariables,
  ScreeningValidationIssue,
} from './types'

export class ScreeningInputPreparerService {
  /**
   * Prepares and validates structured patient inputs for screening eligibility
   */
  static async preparePatientInput(patientId: string): Promise<PreparedScreeningInput> {
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

    const issues: ScreeningValidationIssue[] = []
    const currentYear = new Date().getFullYear()

    // 1. Demographics
    let age = patient.approximateAge || 0
    if (patient.dateOfBirth) {
      const birthYear = parseInt(patient.dateOfBirth.slice(0, 4), 10)
      if (!isNaN(birthYear)) {
        age = currentYear - birthYear
      }
    }

    if (age <= 0) {
      issues.push({
        field: 'demographics.age',
        type: 'missing',
        message: 'Patient chronological age or date of birth is missing',
        severity: 'blocking',
      })
    }

    // 2. Smoking History & Pack-Years
    const smoking = healthRecord.smokingHistory
    const status = smoking?.smokingStatus || 'unknown_unreported'
    let cpd = smoking?.cigarettesPerDay || 0
    const bpd = smoking?.bidisPerDay || 0
    let yearsSmoked = smoking?.yearsSmoked || 0
    let packYears = smoking?.calculatedPackYears || 0
    let yearsSinceQuit: number | null = null

    if (!smoking) {
      issues.push({
        field: 'smokingHistory',
        type: 'missing',
        message: 'Smoking history record is missing from patient health file',
        severity: 'blocking',
      })
    } else {
      if (status === 'unknown_unreported') {
        issues.push({
          field: 'smokingHistory.status',
          type: 'missing',
          message: 'Smoking status is recorded as unknown or unreported',
          severity: 'blocking',
        })
      }

      // Cessation window for former smokers
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
            message: 'Former smoker requires quit year or age at quit to evaluate cessation window',
            severity: 'blocking',
          })
        }
      }

      // Logical consistency
      if (status === 'never') {
        if (cpd > 0 || bpd > 0 || yearsSmoked > 0) {
          issues.push({
            field: 'smokingHistory',
            type: 'conflicting',
            message: 'Never-smoker status contradicts non-zero cigarettes or smoking duration',
            severity: 'blocking',
          })
          cpd = 0
          yearsSmoked = 0
          packYears = 0
        }
      }

      if (status === 'current' || status === 'former') {
        if (packYears <= 0 && cpd > 0 && yearsSmoked > 0) {
          packYears = Math.round(((cpd + bpd * 0.5) / 20) * yearsSmoked * 10) / 10
        }
      }
    }

    const isCurrentSmoker = status === 'current'
    const isFormerSmoker = status === 'former'
    const isNeverSmoker = status === 'never'

    // 3. Clinical Symptoms Evaluation (Crucial Safety Rule)
    const activeSymptoms = healthRecord.symptoms.filter((s) => s.isActive)
    const redFlagSymptomKeys = ['hemoptysis', 'unexplained_weight_loss', 'stridor', 'severe_dyspnea']
    const concerningSymptomsList: string[] = []

    for (const sym of activeSymptoms) {
      const symNameLower = sym.symptomName.toLowerCase()
      if (
        redFlagSymptomKeys.some((k) => symNameLower.includes(k.replace(/_/g, ' '))) ||
        symNameLower.includes('blood') ||
        symNameLower.includes('coughing blood') ||
        symNameLower.includes('weight loss')
      ) {
        concerningSymptomsList.push(sym.symptomName)
      }
    }

    const hasActiveConcerningSymptoms = concerningSymptomsList.length > 0

    // 4. Medical Conditions, Prior Lung Malignancy & Contraindications
    const conditions = healthRecord.medicalConditions.filter((c) => c.clinicalStatus === 'active')
    const contraindicationsList: string[] = []
    let hasPriorLungMalignancy = false

    for (const c of healthRecord.medicalConditions) {
      const cName = c.conditionName.toLowerCase()
      if (cName.includes('lung cancer') || cName.includes('bronchogenic carcinoma')) {
        hasPriorLungMalignancy = true
      }
      if (
        cName.includes('end-stage') ||
        cName.includes('severe heart failure') ||
        cName.includes('oxygen-dependent')
      ) {
        contraindicationsList.push(c.conditionName)
      }
    }

    const hasCurativeSurgeryContraindications = contraindicationsList.length > 0

    const derived: ScreeningDerivedVariables = {
      age,
      isCurrentSmoker,
      isFormerSmoker,
      isNeverSmoker,
      packYears,
      yearsSmoked,
      yearsSinceQuit,
      hasActiveConcerningSymptoms,
      concerningSymptomsList,
      hasCurativeSurgeryContraindications,
      contraindicationsList,
      hasPriorLungMalignancy,
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
      symptoms: {
        source: activeSymptoms[0]?.dataSource || 'patient_reported',
        verified: activeSymptoms.some((s) => s.verificationStatus === 'verified'),
        timestamp: activeSymptoms[0]?.updatedAt || patient.createdAt,
      },
      conditions: {
        source: conditions[0]?.dataSource || 'patient_reported',
        verified: conditions.some((c) => c.verificationStatus === 'verified'),
        timestamp: conditions[0]?.updatedAt || patient.createdAt,
      },
    }

    // Deterministic SHA-256 snapshot hash
    const hashPayload = JSON.stringify({
      patientId: patient.id,
      age,
      gender: patient.gender,
      smokingStatus: status,
      cpd,
      bpd,
      yearsSmoked,
      packYears,
      yearsSinceQuit,
      hasActiveConcerningSymptoms,
      concerningSymptomsList,
      hasCurativeSurgeryContraindications,
      hasPriorLungMalignancy,
    })
    const snapshotHash = createHash('sha256').update(hashPayload).digest('hex')

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
        packYears,
        yearsSinceQuit,
        quitDate: smoking?.quitDate || null,
      },
      clinicalStatus: {
        hasActiveSymptoms: activeSymptoms.length > 0,
        activeSymptoms: activeSymptoms.map((s) => s.symptomName),
        hasPriorLungCancer: hasPriorLungMalignancy,
        hasLimitedLifeExpectancy: hasCurativeSurgeryContraindications,
        lifeExpectancyNotes: contraindicationsList.join(', ') || null,
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
