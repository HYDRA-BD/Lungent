'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Dna,
  FileCheck2,
  FilePlus2,
  Flame,
  Heart,
  History,
  Layers,
  Pill,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Thermometer,
  Users,
  Wind,
  XCircle,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/i18n'
import { calculatePackYears, calculateBmi } from '@/modules/health-records/calculations'
import {
  addMedicalConditionAction,
  addMedicationAction,
  addAllergyAction,
  saveSmokingHistoryAction,
  addEnvironmentalExposureAction,
  addFamilyHistoryAction,
  saveLifestyleAction,
  recordMeasurementAction,
  recordSymptomAction,
  submitClinicianReviewAction,
  getPointInTimeSnapshotAction,
} from '@/modules/health-records/actions'
import type { Patient } from '@/modules/patients/types'
import type { ComprehensivePatientHealthRecord } from '@/modules/health-records/types'
import type {
  AllergenType,
  AllergySeverity,
  AlcoholConsumptionStatus,
  ConditionCategory,
  ConditionClinicalStatus,
  CookingFuelType,
  ExposureCategory,
  ExposureIntensity,
  FamilyConditionType,
  FamilyRelationship,
  HealthRecordDataSource,
  HealthRecordVerificationStatus,
  HealthReviewDecision,
  MeasurementContext,
  MeasurementType,
  MedicationType,
  PhysicalActivityLevel,
  SecondhandSmokeContext,
  SmokingStatus,
  SymptomName,
  SymptomProgression,
  SymptomSeverity,
  TobaccoType,
} from '@/types/database'

interface HealthRecordClientProps {
  patient: Patient
  initialRecord: ComprehensivePatientHealthRecord
}

export function HealthRecordClient({ patient, initialRecord }: HealthRecordClientProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.healthRecords

  const [record, setRecord] = useState<ComprehensivePatientHealthRecord>(initialRecord)
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [isSnapshotMode, setIsSnapshotMode] = useState(false)
  const [snapshotTimestamp, setSnapshotTimestamp] = useState<string>('')
  const [snapshotLoading, setSnapshotLoading] = useState(false)

  // Dialog States
  const [conditionDialogOpen, setConditionDialogOpen] = useState(false)
  const [medicationDialogOpen, setMedicationDialogOpen] = useState(false)
  const [allergyDialogOpen, setAllergyDialogOpen] = useState(false)
  const [smokingDialogOpen, setSmokingDialogOpen] = useState(false)
  const [exposureDialogOpen, setExposureDialogOpen] = useState(false)
  const [familyDialogOpen, setFamilyDialogOpen] = useState(false)
  const [lifestyleDialogOpen, setLifestyleDialogOpen] = useState(false)
  const [measurementDialogOpen, setMeasurementDialogOpen] = useState(false)
  const [symptomDialogOpen, setSymptomDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [snapshotDialogOpen, setSnapshotDialogOpen] = useState(false)

  // Status & Submit Feedback
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // Form states
  const [conditionForm, setConditionForm] = useState({
    conditionName: '',
    conditionCode: '',
    conditionCategory: 'respiratory' as ConditionCategory,
    clinicalStatus: 'active' as ConditionClinicalStatus,
    onsetDate: '',
    approximateOnsetAge: '',
    isPrimaryRespiratory: true,
    treatmentSummary: '',
    hospitalizationHistory: '',
    notes: '',
  })

  const [medicationForm, setMedicationForm] = useState({
    medicationName: '',
    medicationType: 'respiratory_inhaler' as MedicationType,
    dosageInstructions: '',
    prescribingSource: '',
    startDate: '',
    endDate: '',
    isCurrent: true,
    notes: '',
  })

  const [allergyForm, setAllergyForm] = useState({
    allergenType: 'medication' as AllergenType,
    allergenName: '',
    reactionDescription: '',
    severity: 'mild' as AllergySeverity,
    notes: '',
  })

  const [smokingForm, setSmokingForm] = useState({
    smokingStatus: (record.smokingHistory?.smokingStatus || 'never') as SmokingStatus,
    tobaccoType: (record.smokingHistory?.tobaccoType || 'cigarettes') as TobaccoType,
    cigarettesPerDay: record.smokingHistory?.cigarettesPerDay?.toString() || '',
    bidisPerDay: record.smokingHistory?.bidisPerDay?.toString() || '',
    yearsSmoked: record.smokingHistory?.yearsSmoked?.toString() || '',
    ageStarted: record.smokingHistory?.ageStarted?.toString() || '',
    ageQuit: record.smokingHistory?.ageQuit?.toString() || '',
    quitDate: record.smokingHistory?.quitDate || '',
    secondhandSmokeExposure: record.smokingHistory?.secondhandSmokeExposure || false,
    secondhandSmokeContext: (record.smokingHistory?.secondhandSmokeContext || 'none') as SecondhandSmokeContext,
    otherTobaccoDetails: record.smokingHistory?.otherTobaccoDetails || '',
    notes: record.smokingHistory?.notes || '',
  })

  const [exposureForm, setExposureForm] = useState({
    exposureCategory: 'occupational' as ExposureCategory,
    exposureType: '',
    cookingFuelType: '' as CookingFuelType | '',
    durationYears: '',
    intensity: 'moderate' as ExposureIntensity,
    isCurrent: false,
    startYear: '',
    endYear: '',
    contextDetails: '',
    notes: '',
  })

  const [familyForm, setFamilyForm] = useState({
    relationship: 'parent' as FamilyRelationship,
    conditionType: 'lung_cancer' as FamilyConditionType,
    specificCancerType: '',
    ageAtDiagnosis: '',
    notes: '',
  })

  const [lifestyleForm, setLifestyleForm] = useState({
    physicalActivityLevel: (record.lifestyle?.physicalActivityLevel || 'moderate') as PhysicalActivityLevel,
    dietaryNotes: record.lifestyle?.dietaryNotes || '',
    alcoholConsumptionStatus: (record.lifestyle?.alcoholConsumptionStatus || 'never') as AlcoholConsumptionStatus,
    householdSmokersCount: record.lifestyle?.householdSmokersCount?.toString() || '0',
    notes: record.lifestyle?.notes || '',
  })

  const [measurementForm, setMeasurementForm] = useState({
    measurementType: 'blood_pressure_combined' as MeasurementType,
    numericValue: '',
    unit: 'mmHg',
    secondaryValue: '',
    measurementContext: 'clinic_intake' as MeasurementContext,
    notes: '',
  })

  const [symptomForm, setSymptomForm] = useState({
    symptomName: 'cough' as SymptomName,
    isPresent: true,
    onsetDate: '',
    durationWeeks: '',
    progression: 'stable' as SymptomProgression,
    severity: 'moderate' as SymptomSeverity,
    clinicalObservationType: 'healthcare_worker_entered',
    notes: '',
  })

  const [reviewForm, setReviewForm] = useState({
    categoryReviewed: 'all',
    targetRecordId: '',
    reviewDecision: 'verified' as HealthReviewDecision,
    clinicalRationale: '',
  })

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setActionError(msg)
      setActionSuccess(null)
    } else {
      setActionSuccess(msg)
      setActionError(null)
    }
    setTimeout(() => {
      setActionError(null)
      setActionSuccess(null)
    }, 4000)
  }

  // Quick stats calculations
  const latestHeight = record.measurements.find((m) => m.measurementType === 'height')
  const latestWeight = record.measurements.find((m) => m.measurementType === 'weight')
  const latestBmi = record.measurements.find((m) => m.measurementType === 'bmi')
  const latestBp = record.measurements.find(
    (m) => m.measurementType === 'blood_pressure_combined' || m.measurementType === 'blood_pressure_systolic'
  )
  const activeConditionsCount = record.medicalConditions.filter((c) => c.clinicalStatus === 'active').length
  const hasNoKnownAllergies = record.allergies.some((a) => a.allergenType === 'no_known_allergies')

  // Real-time Pack-Year calculation preview
  const livePackYearResult = calculatePackYears({
    cigarettesPerDay: smokingForm.cigarettesPerDay ? Number(smokingForm.cigarettesPerDay) : null,
    bidisPerDay: smokingForm.bidisPerDay ? Number(smokingForm.bidisPerDay) : null,
    yearsSmoked: smokingForm.yearsSmoked ? Number(smokingForm.yearsSmoked) : null,
  })

  // Real-time BMI calculation preview
  const liveBmiResult = calculateBmi({
    heightCm: latestHeight?.numericValue || null,
    weightKg: latestWeight?.numericValue || null,
  })

  // Handlers for Form Submissions
  const handleAddCondition = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const res = await addMedicalConditionAction(patient.id, {
        conditionName: conditionForm.conditionName,
        conditionCode: conditionForm.conditionCode || null,
        conditionCategory: conditionForm.conditionCategory,
        clinicalStatus: conditionForm.clinicalStatus,
        onsetDate: conditionForm.onsetDate || null,
        approximateOnsetAge: conditionForm.approximateOnsetAge ? Number(conditionForm.approximateOnsetAge) : null,
        isPrimaryRespiratory: conditionForm.isPrimaryRespiratory,
        treatmentSummary: conditionForm.treatmentSummary || null,
        hospitalizationHistory: conditionForm.hospitalizationHistory || null,
        notes: conditionForm.notes || null,
      })
      if (res.success && res.data) {
        setRecord((prev) => ({
          ...prev,
          medicalConditions: [res.data, ...prev.medicalConditions],
          lastUpdated: new Date().toISOString(),
        }))
        setConditionDialogOpen(false)
        setConditionForm({
          conditionName: '',
          conditionCode: '',
          conditionCategory: 'respiratory',
          clinicalStatus: 'active',
          onsetDate: '',
          approximateOnsetAge: '',
          isPrimaryRespiratory: true,
          treatmentSummary: '',
          hospitalizationHistory: '',
          notes: '',
        })
        showNotification(t.dialogs.success)
      } else {
        showNotification(res.error || 'Failed to add condition', true)
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Error adding condition', true)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const res = await addMedicationAction(patient.id, {
        medicationName: medicationForm.medicationName,
        medicationType: medicationForm.medicationType,
        dosageInstructions: medicationForm.dosageInstructions || null,
        prescribingSource: medicationForm.prescribingSource || null,
        startDate: medicationForm.startDate || null,
        endDate: medicationForm.endDate || null,
        isCurrent: medicationForm.isCurrent,
        notes: medicationForm.notes || null,
      })
      if (res.success && res.data) {
        setRecord((prev) => ({
          ...prev,
          medications: [res.data, ...prev.medications],
          lastUpdated: new Date().toISOString(),
        }))
        setMedicationDialogOpen(false)
        setMedicationForm({
          medicationName: '',
          medicationType: 'respiratory_inhaler',
          dosageInstructions: '',
          prescribingSource: '',
          startDate: '',
          endDate: '',
          isCurrent: true,
          notes: '',
        })
        showNotification(t.dialogs.success)
      } else {
        showNotification(res.error || 'Failed to add medication', true)
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Error adding medication', true)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const res = await addAllergyAction(patient.id, {
        allergenType: allergyForm.allergenType,
        allergenName: allergyForm.allergenName,
        reactionDescription: allergyForm.reactionDescription || null,
        severity: allergyForm.severity,
        notes: allergyForm.notes || null,
      })
      if (res.success && res.data) {
        setRecord((prev) => ({
          ...prev,
          allergies: [res.data, ...prev.allergies],
          lastUpdated: new Date().toISOString(),
        }))
        setAllergyDialogOpen(false)
        setAllergyForm({
          allergenType: 'medication',
          allergenName: '',
          reactionDescription: '',
          severity: 'mild',
          notes: '',
        })
        showNotification(t.dialogs.success)
      } else {
        showNotification(res.error || 'Failed to record allergy', true)
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Error recording allergy', true)
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmNoKnownAllergies = async () => {
    setActionLoading(true)
    try {
      const res = await addAllergyAction(patient.id, {
        allergenType: 'no_known_allergies',
        allergenName: 'No Known Drug or Environmental Allergies',
        severity: 'unknown',
        reactionDescription: 'No adverse hypersensitivity or drug allergy reported by patient.',
      })
      if (res.success && res.data) {
        setRecord((prev) => ({
          ...prev,
          allergies: [res.data, ...prev.allergies.filter((a) => a.allergenType !== 'no_known_allergies')],
          lastUpdated: new Date().toISOString(),
        }))
        showNotification(t.dialogs.success)
      } else {
        showNotification(res.error || 'Failed to confirm no allergies', true)
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Error confirming allergies', true)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveSmoking = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const res = await saveSmokingHistoryAction(patient.id, {
        smokingStatus: smokingForm.smokingStatus,
        tobaccoType: smokingForm.tobaccoType,
        cigarettesPerDay: smokingForm.cigarettesPerDay ? Number(smokingForm.cigarettesPerDay) : null,
        bidisPerDay: smokingForm.bidisPerDay ? Number(smokingForm.bidisPerDay) : null,
        yearsSmoked: smokingForm.yearsSmoked ? Number(smokingForm.yearsSmoked) : null,
        ageStarted: smokingForm.ageStarted ? Number(smokingForm.ageStarted) : null,
        ageQuit: smokingForm.ageQuit ? Number(smokingForm.ageQuit) : null,
        quitDate: smokingForm.quitDate || null,
        secondhandSmokeExposure: smokingForm.secondhandSmokeExposure,
        secondhandSmokeContext: smokingForm.secondhandSmokeContext,
        otherTobaccoDetails: smokingForm.otherTobaccoDetails || null,
        notes: smokingForm.notes || null,
      })
      if (res.success && res.data) {
        setRecord((prev) => ({
          ...prev,
          smokingHistory: res.data,
          lastUpdated: new Date().toISOString(),
        }))
        setSmokingDialogOpen(false)
        showNotification(t.dialogs.success)
      } else {
        showNotification(res.error || 'Failed to update smoking history', true)
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Error saving smoking history', true)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddExposure = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const res = await addEnvironmentalExposureAction(patient.id, {
        exposureCategory: exposureForm.exposureCategory,
        exposureType: exposureForm.exposureType,
        cookingFuelType: exposureForm.cookingFuelType || null,
        durationYears: exposureForm.durationYears ? Number(exposureForm.durationYears) : null,
        intensity: exposureForm.intensity,
        isCurrent: exposureForm.isCurrent,
        startYear: exposureForm.startYear ? Number(exposureForm.startYear) : null,
        endYear: exposureForm.endYear ? Number(exposureForm.endYear) : null,
        contextDetails: exposureForm.contextDetails || null,
        notes: exposureForm.notes || null,
      })
      if (res.success && res.data) {
        setRecord((prev) => ({
          ...prev,
          environmentalExposures: [res.data, ...prev.environmentalExposures],
          lastUpdated: new Date().toISOString(),
        }))
        setExposureDialogOpen(false)
        setExposureForm({
          exposureCategory: 'occupational',
          exposureType: '',
          cookingFuelType: '',
          durationYears: '',
          intensity: 'moderate',
          isCurrent: false,
          startYear: '',
          endYear: '',
          contextDetails: '',
          notes: '',
        })
        showNotification(t.dialogs.success)
      } else {
        showNotification(res.error || 'Failed to add exposure', true)
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Error adding exposure', true)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const res = await addFamilyHistoryAction(patient.id, {
        relationship: familyForm.relationship,
        conditionType: familyForm.conditionType,
        specificCancerType: familyForm.specificCancerType || null,
        ageAtDiagnosis: familyForm.ageAtDiagnosis ? Number(familyForm.ageAtDiagnosis) : null,
        notes: familyForm.notes || null,
      })
      if (res.success && res.data) {
        setRecord((prev) => ({
          ...prev,
          familyHistory: [res.data, ...prev.familyHistory],
          lastUpdated: new Date().toISOString(),
        }))
        setFamilyDialogOpen(false)
        setFamilyForm({
          relationship: 'parent',
          conditionType: 'lung_cancer',
          specificCancerType: '',
          ageAtDiagnosis: '',
          notes: '',
        })
        showNotification(t.dialogs.success)
      } else {
        showNotification(res.error || 'Failed to add family history', true)
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Error adding family history', true)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveLifestyle = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const res = await saveLifestyleAction(patient.id, {
        physicalActivityLevel: lifestyleForm.physicalActivityLevel,
        dietaryNotes: lifestyleForm.dietaryNotes || null,
        alcoholConsumptionStatus: lifestyleForm.alcoholConsumptionStatus,
        householdSmokersCount: lifestyleForm.householdSmokersCount ? Number(lifestyleForm.householdSmokersCount) : 0,
        notes: lifestyleForm.notes || null,
      })
      if (res.success && res.data) {
        setRecord((prev) => ({
          ...prev,
          lifestyle: res.data,
          lastUpdated: new Date().toISOString(),
        }))
        setLifestyleDialogOpen(false)
        showNotification(t.dialogs.success)
      } else {
        showNotification(res.error || 'Failed to update lifestyle', true)
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Error updating lifestyle', true)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRecordMeasurement = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const res = await recordMeasurementAction(patient.id, {
        measurementType: measurementForm.measurementType,
        numericValue: Number(measurementForm.numericValue),
        unit: measurementForm.unit,
        secondaryValue: measurementForm.secondaryValue ? Number(measurementForm.secondaryValue) : null,
        measurementContext: measurementForm.measurementContext,
        notes: measurementForm.notes || null,
      })
      if (res.success && res.data) {
        setRecord((prev) => ({
          ...prev,
          measurements: [res.data, ...prev.measurements],
          lastUpdated: new Date().toISOString(),
        }))
        setMeasurementDialogOpen(false)
        setMeasurementForm({
          measurementType: 'blood_pressure_combined',
          numericValue: '',
          unit: 'mmHg',
          secondaryValue: '',
          measurementContext: 'clinic_intake',
          notes: '',
        })
        showNotification(t.dialogs.success)
      } else {
        showNotification(res.error || 'Failed to record measurement', true)
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Error recording measurement', true)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRecordSymptom = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const res = await recordSymptomAction(patient.id, {
        symptomName: symptomForm.symptomName,
        isPresent: symptomForm.isPresent,
        onsetDate: symptomForm.onsetDate || null,
        durationWeeks: symptomForm.durationWeeks ? Number(symptomForm.durationWeeks) : null,
        progression: symptomForm.progression,
        severity: symptomForm.severity,
        clinicalObservationType: symptomForm.clinicalObservationType,
        notes: symptomForm.notes || null,
      })
      if (res.success && res.data) {
        setRecord((prev) => ({
          ...prev,
          symptoms: [res.data, ...prev.symptoms],
          lastUpdated: new Date().toISOString(),
        }))
        setSymptomDialogOpen(false)
        setSymptomForm({
          symptomName: 'cough',
          isPresent: true,
          onsetDate: '',
          durationWeeks: '',
          progression: 'stable',
          severity: 'moderate',
          clinicalObservationType: 'healthcare_worker_entered',
          notes: '',
        })
        showNotification(t.dialogs.success)
      } else {
        showNotification(res.error || 'Failed to record symptom', true)
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Error recording symptom', true)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const res = await submitClinicianReviewAction(patient.id, {
        categoryReviewed: reviewForm.categoryReviewed,
        targetRecordId: reviewForm.targetRecordId || null,
        reviewDecision: reviewForm.reviewDecision,
        clinicalRationale: reviewForm.clinicalRationale,
      })
      if (res.success && res.data) {
        setRecord((prev) => ({
          ...prev,
          reviews: [res.data, ...prev.reviews],
          lastUpdated: new Date().toISOString(),
        }))
        setReviewDialogOpen(false)
        setReviewForm({
          categoryReviewed: 'all',
          targetRecordId: '',
          reviewDecision: 'verified',
          clinicalRationale: '',
        })
        showNotification(t.dialogs.success)
      } else {
        showNotification(res.error || 'Failed to submit review', true)
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Error submitting review', true)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReconstructSnapshot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!snapshotTimestamp) return
    setSnapshotLoading(true)
    try {
      const res = await getPointInTimeSnapshotAction(patient.id, snapshotTimestamp)
      if (res.success && res.data) {
        setRecord(res.data)
        setIsSnapshotMode(true)
        setSnapshotDialogOpen(false)
        showNotification(`Historical snapshot reconstructed for ${snapshotTimestamp}`)
      } else {
        showNotification(res.error || 'Snapshot reconstruction failed', true)
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Snapshot failed', true)
    } finally {
      setSnapshotLoading(false)
    }
  }

  const handleReturnToCurrent = () => {
    setRecord(initialRecord)
    setIsSnapshotMode(false)
    setSnapshotTimestamp('')
    showNotification('Returned to current health record')
  }

  const workerNav = [
    {
      href: '/healthcare-worker/patients',
      label: dict.nav.patientRegistry || 'Patient Registry',
      icon: <Users className="size-4" />,
    },
    {
      href: '/healthcare-worker/register',
      label: dict.nav.registerPatient || 'Register Patient',
      icon: <FilePlus2 className="size-4" />,
    },
    {
      href: '/healthcare-worker/duplicates',
      label: dict.nav.duplicateReview || 'Duplicate Queue',
      icon: <Layers className="size-4" />,
    },
  ]

  // Provenance Badge Component
  const renderProvenance = (prov: {
    dataSource: HealthRecordDataSource
    verificationStatus: HealthRecordVerificationStatus
    verifiedBy?: string | null
    verifiedAt?: string | null
    facilityId?: string | null
  }) => {
    const isVerified = prov.verificationStatus === 'verified'
    const isPending = prov.verificationStatus === 'pending_verification'
    const isRejected = prov.verificationStatus === 'rejected'

    return (
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground pt-1.5 border-t border-border/50">
        <span className="font-semibold">{t.provenance.sourceLabel}:</span>
        <span className="capitalize">{t.provenance[prov.dataSource] || prov.dataSource.replace(/_/g, ' ')}</span>
        <span>•</span>
        <span className="font-semibold">{t.provenance.verificationLabel}:</span>
        {isVerified && (
          <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0 text-[10px]">
            <ShieldCheck className="size-2.5 mr-1" />
            {t.provenance.verified}
          </Badge>
        )}
        {isPending && (
          <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 px-1.5 py-0 text-[10px]">
            <Clock className="size-2.5 mr-1" />
            {t.provenance.pending_verification}
          </Badge>
        )}
        {isRejected && (
          <Badge variant="outline" className="text-red-700 bg-red-50 border-red-300 dark:bg-red-950/40 dark:text-red-300 px-1.5 py-0 text-[10px]">
            <XCircle className="size-2.5 mr-1" />
            {t.provenance.rejected}
          </Badge>
        )}
        {!isVerified && !isPending && !isRejected && (
          <Badge variant="outline" className="text-muted-foreground px-1.5 py-0 text-[10px]">
            {t.provenance.unverified}
          </Badge>
        )}
        {prov.verifiedAt && (
          <>
            <span>•</span>
            <span>{new Date(prov.verifiedAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')}</span>
          </>
        )}
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: t.tabs.overview, icon: Activity },
    { id: 'conditions', label: `${t.tabs.conditions} (${record.medicalConditions.length})`, icon: Stethoscope },
    { id: 'medications', label: `${t.tabs.medications} (${record.medications.length})`, icon: Pill },
    { id: 'allergies', label: `${t.tabs.allergies} (${record.allergies.length})`, icon: AlertCircle },
    { id: 'smoking', label: t.tabs.smoking, icon: Flame },
    { id: 'exposures', label: `${t.tabs.exposures} (${record.environmentalExposures.length})`, icon: Wind },
    { id: 'family', label: `${t.tabs.family} (${record.familyHistory.length})`, icon: Dna },
    { id: 'lifestyle', label: t.tabs.lifestyle, icon: Heart },
    { id: 'measurements', label: `${t.tabs.measurements} (${record.measurements.length})`, icon: Thermometer },
    { id: 'symptoms', label: `${t.tabs.symptoms} (${record.symptoms.length})`, icon: Activity },
    { id: 'reviews', label: `${t.tabs.reviews} (${record.reviews.length})`, icon: FileCheck2 },
  ]

  return (
    <DashboardLayout
      workspaceName={isBn ? 'কমিউনিটি স্বাস্থ্যকর্মী ওয়ার্কস্পেস' : 'Community Health Worker Workspace'}
      workspaceBadge={<Badge variant="secondary" size="sm">{isBn ? 'ঢাকা দক্ষিণ বিভাগ' : 'Dhaka South Division'}</Badge>}
      userName="Tania Akhter"
      userRole={isBn ? 'কমিউনিটি স্বাস্থ্য বিশেষজ্ঞ' : 'Community Health Specialist (CHW)'}
      navItems={workerNav}
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href={`/healthcare-worker/patients/${patient.id}`}
              className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'text-xs text-muted-foreground -ml-2 mb-1' })}
            >
              <ArrowLeft className="size-3.5 mr-1" />
              <span>{t.backToProfile}</span>
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {t.title}
              </h1>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 font-bold">
                {patient.patientId}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">
                — {patient.fullName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t.subtitle}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSnapshotDialogOpen(true)}
              className="text-xs"
            >
              <History className="size-3.5 mr-1.5" />
              <span>{t.snapshot.button}</span>
            </Button>
            {!isSnapshotMode && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setReviewDialogOpen(true)}
                className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <ShieldCheck className="size-3.5 mr-1.5" />
                <span>{t.sections.reviews.addBtn}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Snapshot Notification Banner if active */}
        {isSnapshotMode && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2.5">
              <History className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs sm:text-sm font-semibold">
                {t.snapshot.viewingBanner.replace('{timestamp}', new Date(snapshotTimestamp).toLocaleString(isBn ? 'bn-BD' : 'en-US'))}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReturnToCurrent}
              className="text-xs border-amber-500/40 text-amber-900 dark:text-amber-100 hover:bg-amber-500/20"
            >
              {t.snapshot.returnCurrentBtn}
            </Button>
          </div>
        )}

        {/* Action feedback banners */}
        {actionSuccess && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 flex items-center gap-2 text-red-800 dark:text-red-200 text-xs">
            <AlertCircle className="size-4 shrink-0 text-red-600" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Clinical Safety Disclaimer Banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex items-start gap-3 text-xs text-muted-foreground">
          <ShieldAlert className="size-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t.clinicalNotice}
          </p>
        </div>

        {/* Quick Stats Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Pack-Years Card */}
          <Card className="border-border/80 shadow-xs p-3 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold">{t.quickStats.packYears}</span>
              <Flame className="size-3.5 text-amber-500" />
            </div>
            <p className="text-lg font-black text-foreground">
              {record.smokingHistory?.calculatedPackYears !== null && record.smokingHistory?.calculatedPackYears !== undefined
                ? `${record.smokingHistory.calculatedPackYears}`
                : record.smokingHistory?.smokingStatus === 'never'
                ? '0.0'
                : '—'}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {record.smokingHistory?.smokingStatus
                ? record.smokingHistory.smokingStatus.replace('_', ' ')
                : 'Unrecorded'}
            </p>
          </Card>

          {/* BMI Card */}
          <Card className="border-border/80 shadow-xs p-3 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold">{t.quickStats.bmi}</span>
              <Scale className="size-3.5 text-blue-500" />
            </div>
            <p className="text-lg font-black text-foreground">
              {latestBmi ? `${latestBmi.numericValue} kg/m²` : liveBmiResult.bmi ? `${liveBmiResult.bmi} kg/m²` : '—'}
            </p>
            <p className="text-[10px] text-muted-foreground capitalize">
              {liveBmiResult.category || (latestBmi ? 'Recorded' : 'Requires Ht/Wt')}
            </p>
          </Card>

          {/* Blood Pressure Card */}
          <Card className="border-border/80 shadow-xs p-3 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold">{t.quickStats.bloodPressure}</span>
              <Heart className="size-3.5 text-rose-500" />
            </div>
            <p className="text-lg font-black text-foreground truncate">
              {latestBp
                ? `${latestBp.numericValue}${latestBp.secondaryValue ? `/${latestBp.secondaryValue}` : ''} ${latestBp.unit}`
                : '—'}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {latestBp?.measuredAt
                ? new Date(latestBp.measuredAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')
                : 'Not measured'}
            </p>
          </Card>

          {/* Allergies Card */}
          <Card className="border-border/80 shadow-xs p-3 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold">{t.quickStats.allergiesCount}</span>
              <AlertCircle className="size-3.5 text-orange-500" />
            </div>
            <p className="text-lg font-black text-foreground">
              {hasNoKnownAllergies
                ? '0 (NKDA)'
                : `${record.allergies.filter((a) => a.isActive).length}`}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {hasNoKnownAllergies ? 'No known allergies' : 'Active alerts'}
            </p>
          </Card>

          {/* Active Conditions Card */}
          <Card className="border-border/80 shadow-xs p-3 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold">{t.quickStats.conditionsCount}</span>
              <Stethoscope className="size-3.5 text-indigo-500" />
            </div>
            <p className="text-lg font-black text-foreground">
              {activeConditionsCount}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {record.medicalConditions.length} total history
            </p>
          </Card>

          {/* Verification Status Card */}
          <Card className="border-border/80 shadow-xs p-3 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold">{t.quickStats.verificationStatus}</span>
              <ShieldCheck className="size-3.5 text-emerald-500" />
            </div>
            <div className="pt-0.5">
              {record.reviews.length > 0 ? (
                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] px-1.5 py-0 font-bold">
                  {t.provenance.verified}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground text-[10px] px-1.5 py-0">
                  {t.provenance.unverified}
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {record.reviews.length} reviews ledger
            </p>
          </Card>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border/80 scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <Icon className="size-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab 1: Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Transparent Calculation Callouts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tobacco Pack-Years Callout */}
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Flame className="size-4 text-amber-500" />
                      {t.sections.smoking.title}
                    </CardTitle>
                    {!isSnapshotMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSmokingDialogOpen(true)}
                        className="text-xs h-7 text-amber-700 dark:text-amber-400"
                      >
                        {t.sections.smoking.updateBtn}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {record.smokingHistory ? (
                    <>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">{t.sections.smoking.status}:</span>
                        <span className="font-semibold capitalize">{record.smokingHistory.smokingStatus.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">{t.sections.smoking.type}:</span>
                        <span className="font-semibold capitalize">{record.smokingHistory.tobaccoType}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">{t.sections.smoking.cigsPerDay} / {t.sections.smoking.bidisPerDay}:</span>
                        <span className="font-semibold">
                          {record.smokingHistory.cigarettesPerDay ?? 0} cigs, {record.smokingHistory.bidisPerDay ?? 0} bidis
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">{t.sections.smoking.yearsSmoked}:</span>
                        <span className="font-semibold">{record.smokingHistory.yearsSmoked ?? '—'} years</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-900 dark:text-amber-200">
                            {t.sections.smoking.packYears}: {record.smokingHistory.calculatedPackYears ?? 'N/A'}
                          </span>
                          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                            {record.smokingHistory.packYearsCalculationMethod || '((cigs+bidis)/20)*years'}
                          </span>
                        </div>
                      </div>
                      {renderProvenance(record.smokingHistory)}
                    </>
                  ) : (
                    <p className="text-muted-foreground italic py-3">{t.sections.smoking.empty}</p>
                  )}
                </CardContent>
              </Card>

              {/* Body Measurements & BMI Callout */}
              <Card className="border-blue-500/30 bg-blue-500/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Scale className="size-4 text-blue-500" />
                      {t.sections.measurements.title}
                    </CardTitle>
                    {!isSnapshotMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMeasurementDialogOpen(true)}
                        className="text-xs h-7 text-blue-700 dark:text-blue-400"
                      >
                        {t.sections.measurements.addBtn}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-background border border-border/60">
                      <span className="text-[11px] text-muted-foreground">Height</span>
                      <p className="font-bold text-sm">{latestHeight ? `${latestHeight.numericValue} cm` : 'Not recorded'}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background border border-border/60">
                      <span className="text-[11px] text-muted-foreground">Weight</span>
                      <p className="font-bold text-sm">{latestWeight ? `${latestWeight.numericValue} kg` : 'Not recorded'}</p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 dark:text-blue-200">
                        BMI: {latestBmi ? `${latestBmi.numericValue} kg/m²` : liveBmiResult.bmi ? `${liveBmiResult.bmi} kg/m²` : 'N/A'}
                      </span>
                      <span className="text-[10px] text-blue-700 dark:text-blue-400 font-mono">
                        weight_kg / (height_m ^ 2)
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Category: {liveBmiResult.category ? liveBmiResult.category.toUpperCase() : 'Requires both height and weight'}
                    </p>
                  </div>
                  {latestBmi && renderProvenance(latestBmi)}
                </CardContent>
              </Card>
            </div>

            {/* Active Respiratory Conditions & Symptoms Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Conditions Summary */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Stethoscope className="size-4 text-primary" />
                      {t.sections.conditions.title}
                    </CardTitle>
                    {!isSnapshotMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConditionDialogOpen(true)}
                        className="text-xs h-7 text-primary"
                      >
                        {t.sections.conditions.addBtn}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {record.medicalConditions.length > 0 ? (
                    record.medicalConditions.slice(0, 3).map((c) => (
                      <div key={c.id} className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">{c.conditionName}</span>
                          <Badge variant={c.clinicalStatus === 'active' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0">
                            {c.clinicalStatus}
                          </Badge>
                        </div>
                        {c.treatmentSummary && (
                          <p className="text-muted-foreground text-[11px]">Tx: {c.treatmentSummary}</p>
                        )}
                        {renderProvenance(c)}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">{t.sections.conditions.empty}</p>
                  )}
                </CardContent>
              </Card>

              {/* Symptoms Summary */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Activity className="size-4 text-primary" />
                      {t.sections.symptoms.title}
                    </CardTitle>
                    {!isSnapshotMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSymptomDialogOpen(true)}
                        className="text-xs h-7 text-primary"
                      >
                        {t.sections.symptoms.addBtn}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {record.symptoms.length > 0 ? (
                    record.symptoms.slice(0, 3).map((s) => (
                      <div key={s.id} className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground capitalize">
                            {s.symptomName.replace(/_/g, ' ')}
                          </span>
                          <Badge variant={s.isPresent ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0">
                            {s.isPresent ? t.sections.symptoms.present : t.sections.symptoms.absent}
                          </Badge>
                        </div>
                        {s.notes && <p className="text-muted-foreground text-[11px]">{s.notes}</p>}
                        {renderProvenance(s)}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">{t.sections.symptoms.empty}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Medical Conditions */}
        {activeTab === 'conditions' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Stethoscope className="size-4 text-primary" />
                  {t.sections.conditions.title}
                </CardTitle>
                {!isSnapshotMode && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setConditionDialogOpen(true)}
                    className="text-xs"
                  >
                    <FilePlus2 className="size-3.5 mr-1" />
                    <span>{t.sections.conditions.addBtn}</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {record.medicalConditions.length > 0 ? (
                record.medicalConditions.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{item.conditionName}</span>
                        {item.conditionCode && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {item.conditionCode}
                          </span>
                        )}
                        {item.isPrimaryRespiratory && (
                          <Badge variant="outline" className="text-primary border-primary/40 text-[10px] px-1.5 py-0">
                            {t.sections.conditions.primaryRespiratory}
                          </Badge>
                        )}
                      </div>
                      <Badge
                        variant={item.clinicalStatus === 'active' ? 'destructive' : 'secondary'}
                        className="text-[10px] capitalize"
                      >
                        {item.clinicalStatus}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-muted-foreground">
                      <div>
                        <span className="font-semibold">{t.sections.conditions.category}: </span>
                        <span className="capitalize">{item.conditionCategory}</span>
                      </div>
                      <div>
                        <span className="font-semibold">{t.sections.conditions.onsetDate}: </span>
                        <span>{item.onsetDate || (item.approximateOnsetAge ? `Age ${item.approximateOnsetAge}` : '—')}</span>
                      </div>
                      <div>
                        <span className="font-semibold">{t.sections.conditions.hospitalizations}: </span>
                        <span>{item.hospitalizationHistory || 'None'}</span>
                      </div>
                    </div>

                    {item.treatmentSummary && (
                      <div className="text-muted-foreground">
                        <span className="font-semibold text-foreground">{t.sections.conditions.treatment}: </span>
                        <span>{item.treatmentSummary}</span>
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-muted-foreground italic">
                        <span>Notes: </span>
                        <span>{item.notes}</span>
                      </div>
                    )}
                    {renderProvenance(item)}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic py-6 text-center">{t.sections.conditions.empty}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 3: Medications */}
        {activeTab === 'medications' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Pill className="size-4 text-primary" />
                  {t.sections.medications.title}
                </CardTitle>
                {!isSnapshotMode && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setMedicationDialogOpen(true)}
                    className="text-xs"
                  >
                    <FilePlus2 className="size-3.5 mr-1" />
                    <span>{t.sections.medications.addBtn}</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {record.medications.length > 0 ? (
                record.medications.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{item.medicationName}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {item.medicationType.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <Badge variant={item.isCurrent ? 'default' : 'secondary'} className="text-[10px]">
                        {item.isCurrent ? t.sections.medications.currentStatus : 'Past / Discontinued'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                      <div>
                        <span className="font-semibold text-foreground">{t.sections.medications.dosage}: </span>
                        <span>{item.dosageInstructions || 'As directed'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">{t.sections.medications.source}: </span>
                        <span>{item.prescribingSource || 'Unspecified'}</span>
                      </div>
                    </div>
                    {renderProvenance(item)}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic py-6 text-center">{t.sections.medications.empty}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 4: Allergies */}
        {activeTab === 'allergies' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <AlertCircle className="size-4 text-primary" />
                  {t.sections.allergies.title}
                </CardTitle>
                {!isSnapshotMode && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleConfirmNoKnownAllergies}
                      className="text-xs"
                      disabled={actionLoading}
                    >
                      <Check className="size-3.5 mr-1" />
                      <span>{t.sections.allergies.markNoKnown}</span>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setAllergyDialogOpen(true)}
                      className="text-xs"
                    >
                      <FilePlus2 className="size-3.5 mr-1" />
                      <span>{t.sections.allergies.addBtn}</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {hasNoKnownAllergies && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                  <p className="font-semibold">
                    {t.sections.allergies.noKnownAllergiesAlert}
                  </p>
                </div>
              )}

              {record.allergies.length > 0 ? (
                record.allergies
                  .filter((a) => a.allergenType !== 'no_known_allergies')
                  .map((item) => (
                    <div key={item.id} className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{item.allergenName}</span>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {item.allergenType}
                          </Badge>
                        </div>
                        <Badge
                          variant={item.severity === 'severe' || item.severity === 'anaphylaxis' ? 'destructive' : 'secondary'}
                          className="text-[10px] capitalize"
                        >
                          Severity: {item.severity}
                        </Badge>
                      </div>

                      {item.reactionDescription && (
                        <div className="text-muted-foreground">
                          <span className="font-semibold text-foreground">{t.sections.allergies.reaction}: </span>
                          <span>{item.reactionDescription}</span>
                        </div>
                      )}
                      {renderProvenance(item)}
                    </div>
                  ))
              ) : (
                !hasNoKnownAllergies && (
                  <p className="text-xs text-muted-foreground italic py-6 text-center">{t.sections.allergies.empty}</p>
                )
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 5: Smoking & Tobacco */}
        {activeTab === 'smoking' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Flame className="size-4 text-amber-500" />
                  {t.sections.smoking.title}
                </CardTitle>
                {!isSnapshotMode && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setSmokingDialogOpen(true)}
                    className="text-xs"
                  >
                    <span>{t.sections.smoking.updateBtn}</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {record.smokingHistory ? (
                <div className="space-y-4 text-xs">
                  {record.smokingHistory.smokingStatus === 'never' ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex items-center gap-3">
                      <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                      <p className="font-semibold">{t.sections.smoking.neverSmokerNotice}</p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-amber-900 dark:text-amber-100">
                          {t.sections.smoking.packYears}: {record.smokingHistory.calculatedPackYears ?? 'N/A'} Pack-Years
                        </span>
                        <span className="text-xs font-mono bg-background px-2 py-0.5 rounded border border-amber-500/30 text-amber-800 dark:text-amber-300">
                          Formula: {record.smokingHistory.packYearsCalculationMethod}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Transparent Pack-Year Formula: (cigarettes_per_day + bidis_per_day) / 20 * years_smoked. Incomplete data is not calculated.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-muted-foreground">{t.sections.smoking.status}</span>
                      <p className="font-bold text-foreground capitalize mt-0.5">{record.smokingHistory.smokingStatus.replace('_', ' ')}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-muted-foreground">{t.sections.smoking.type}</span>
                      <p className="font-bold text-foreground capitalize mt-0.5">{record.smokingHistory.tobaccoType}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-muted-foreground">{t.sections.smoking.yearsSmoked}</span>
                      <p className="font-bold text-foreground mt-0.5">{record.smokingHistory.yearsSmoked ?? '—'} years</p>
                    </div>
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-muted-foreground">{t.sections.smoking.cigsPerDay}</span>
                      <p className="font-bold text-foreground mt-0.5">{record.smokingHistory.cigarettesPerDay ?? 0}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-muted-foreground">{t.sections.smoking.bidisPerDay}</span>
                      <p className="font-bold text-foreground mt-0.5">{record.smokingHistory.bidisPerDay ?? 0}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-muted-foreground">{t.sections.smoking.quitDate}</span>
                      <p className="font-bold text-foreground mt-0.5">{record.smokingHistory.quitDate || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-border/60 space-y-1">
                    <span className="font-semibold text-foreground">{t.sections.smoking.secondhand}: </span>
                    <span className="text-muted-foreground">
                      {record.smokingHistory.secondhandSmokeExposure
                        ? `Yes (Context: ${record.smokingHistory.secondhandSmokeContext || 'unspecified'})`
                        : 'No regular exposure reported'}
                    </span>
                  </div>

                  {record.smokingHistory.otherTobaccoDetails && (
                    <div className="p-3 rounded-lg border border-border/60 space-y-1">
                      <span className="font-semibold text-foreground">{t.sections.smoking.details}: </span>
                      <span className="text-muted-foreground">{record.smokingHistory.otherTobaccoDetails}</span>
                    </div>
                  )}

                  {renderProvenance(record.smokingHistory)}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-6 text-center">{t.sections.smoking.empty}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 6: Environmental Exposures */}
        {activeTab === 'exposures' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Wind className="size-4 text-primary" />
                  {t.sections.exposures.title}
                </CardTitle>
                {!isSnapshotMode && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setExposureDialogOpen(true)}
                    className="text-xs"
                  >
                    <FilePlus2 className="size-3.5 mr-1" />
                    <span>{t.sections.exposures.addBtn}</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {record.environmentalExposures.length > 0 ? (
                record.environmentalExposures.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{item.exposureType}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {item.exposureCategory.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        Intensity: {item.intensity}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-muted-foreground">
                      <div>
                        <span className="font-semibold text-foreground">{t.sections.exposures.duration}: </span>
                        <span>{item.durationYears ? `${item.durationYears} years` : '—'}</span>
                      </div>
                      {item.cookingFuelType && (
                        <div>
                          <span className="font-semibold text-foreground">{t.sections.exposures.cookingFuel}: </span>
                          <span className="capitalize">{item.cookingFuelType.replace(/_/g, ' ')}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-foreground">{t.sections.exposures.currentlyExposed}: </span>
                        <span>{item.isCurrent ? 'Yes' : 'Past exposure'}</span>
                      </div>
                    </div>

                    {item.contextDetails && (
                      <div className="text-muted-foreground">
                        <span className="font-semibold text-foreground">{t.sections.exposures.details}: </span>
                        <span>{item.contextDetails}</span>
                      </div>
                    )}
                    {renderProvenance(item)}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic py-6 text-center">{t.sections.exposures.empty}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 7: Family History */}
        {activeTab === 'family' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Dna className="size-4 text-primary" />
                  {t.sections.family.title}
                </CardTitle>
                {!isSnapshotMode && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setFamilyDialogOpen(true)}
                    className="text-xs"
                  >
                    <FilePlus2 className="size-3.5 mr-1" />
                    <span>{t.sections.family.addBtn}</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {record.familyHistory.length > 0 ? (
                record.familyHistory.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground capitalize">
                          {item.relationship}
                        </span>
                        <Badge
                          variant={item.conditionType === 'lung_cancer' ? 'destructive' : 'secondary'}
                          className="text-[10px] capitalize"
                        >
                          {item.conditionType.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      {item.ageAtDiagnosis && (
                        <span className="text-muted-foreground">
                          {t.sections.family.ageDiagnosis}: Age {item.ageAtDiagnosis}
                        </span>
                      )}
                    </div>

                    {item.specificCancerType && (
                      <div className="text-muted-foreground">
                        <span className="font-semibold text-foreground">{t.sections.family.cancerType}: </span>
                        <span>{item.specificCancerType}</span>
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-muted-foreground italic">
                        <span>Notes: </span>
                        <span>{item.notes}</span>
                      </div>
                    )}
                    {renderProvenance(item)}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic py-6 text-center">{t.sections.family.empty}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 8: Lifestyle */}
        {activeTab === 'lifestyle' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Heart className="size-4 text-primary" />
                  {t.sections.lifestyle.title}
                </CardTitle>
                {!isSnapshotMode && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setLifestyleDialogOpen(true)}
                    className="text-xs"
                  >
                    <span>{t.sections.lifestyle.updateBtn}</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              {record.lifestyle ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-muted-foreground">{t.sections.lifestyle.activity}</span>
                      <p className="font-bold text-foreground capitalize mt-0.5">{record.lifestyle.physicalActivityLevel}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-muted-foreground">{t.sections.lifestyle.alcohol}</span>
                      <p className="font-bold text-foreground capitalize mt-0.5">{record.lifestyle.alcoholConsumptionStatus}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-muted-foreground">{t.sections.lifestyle.householdSmokers}</span>
                      <p className="font-bold text-foreground mt-0.5">{record.lifestyle.householdSmokersCount ?? 0} persons</p>
                    </div>
                  </div>

                  {record.lifestyle.dietaryNotes && (
                    <div className="p-3 rounded-lg border border-border/60 space-y-1">
                      <span className="font-semibold text-foreground">{t.sections.lifestyle.diet}: </span>
                      <span className="text-muted-foreground">{record.lifestyle.dietaryNotes}</span>
                    </div>
                  )}
                  {renderProvenance(record.lifestyle)}
                </>
              ) : (
                <p className="text-xs text-muted-foreground italic py-6 text-center">{t.sections.lifestyle.empty}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 9: Measurements */}
        {activeTab === 'measurements' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Thermometer className="size-4 text-primary" />
                  {t.sections.measurements.title}
                </CardTitle>
                {!isSnapshotMode && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setMeasurementDialogOpen(true)}
                    className="text-xs"
                  >
                    <FilePlus2 className="size-3.5 mr-1" />
                    <span>{t.sections.measurements.addBtn}</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {record.measurements.length > 0 ? (
                record.measurements.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground capitalize">
                          {item.measurementType.replace(/_/g, ' ')}
                        </span>
                        {item.isCalculated && (
                          <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] px-1.5 py-0">
                            Derived: {item.calculationFormula || 'Formula'}
                          </Badge>
                        )}
                      </div>
                      <span className="font-extrabold text-base text-foreground">
                        {item.numericValue}
                        {item.secondaryValue ? `/${item.secondaryValue}` : ''} {item.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>Context: {item.measurementContext?.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span>{new Date(item.measuredAt).toLocaleString(isBn ? 'bn-BD' : 'en-US')}</span>
                    </div>

                    {item.notes && <p className="text-muted-foreground italic">{item.notes}</p>}
                    {renderProvenance(item)}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic py-6 text-center">{t.sections.measurements.empty}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 10: Symptoms */}
        {activeTab === 'symptoms' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="size-4 text-primary" />
                  {t.sections.symptoms.title}
                </CardTitle>
                {!isSnapshotMode && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setSymptomDialogOpen(true)}
                    className="text-xs"
                  >
                    <FilePlus2 className="size-3.5 mr-1" />
                    <span>{t.sections.symptoms.addBtn}</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {record.symptoms.length > 0 ? (
                record.symptoms.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground capitalize">
                          {item.symptomName.replace(/_/g, ' ')}
                        </span>
                        <Badge
                          variant={item.isPresent ? 'destructive' : 'secondary'}
                          className="text-[10px]"
                        >
                          {item.isPresent ? t.sections.symptoms.present : t.sections.symptoms.absent}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        Severity: {item.severity} • {item.progression}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                      <div>
                        <span className="font-semibold text-foreground">{t.sections.symptoms.duration}: </span>
                        <span>{item.durationWeeks ? `${item.durationWeeks} weeks` : '—'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">{t.sections.symptoms.onset}: </span>
                        <span>{item.onsetDate || 'Not specified'}</span>
                      </div>
                    </div>

                    {item.notes && <p className="text-muted-foreground italic">{item.notes}</p>}
                    {renderProvenance(item)}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic py-6 text-center">{t.sections.symptoms.empty}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 11: Clinician Review Ledger */}
        {activeTab === 'reviews' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileCheck2 className="size-4 text-emerald-600" />
                  {t.sections.reviews.title}
                </CardTitle>
                {!isSnapshotMode && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setReviewDialogOpen(true)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <ShieldCheck className="size-3.5 mr-1" />
                    <span>{t.sections.reviews.addBtn}</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {record.reviews.length > 0 ? (
                record.reviews.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-emerald-600" />
                        <span className="font-bold text-sm text-foreground">
                          {item.reviewerName || 'Reviewing Clinician'}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          ({item.reviewerRole || 'clinician'})
                        </span>
                      </div>
                      <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold capitalize">
                        {item.reviewDecision.replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    <div className="p-3 rounded-lg bg-background border border-border/60">
                      <span className="font-semibold text-foreground">{t.sections.reviews.rationale}:</span>
                      <p className="mt-1 text-muted-foreground leading-relaxed">{item.clinicalRationale}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span>Category: {item.categoryReviewed.replace(/_/g, ' ')}</span>
                      <span>{new Date(item.reviewedAt).toLocaleString(isBn ? 'bn-BD' : 'en-US')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic py-6 text-center">{t.sections.reviews.empty}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* =========================================================================
            MODAL DIALOGS FOR ADDING / UPDATING ITEMS
           ========================================================================= */}

        {/* 1. Add Condition Dialog */}
        <Dialog
          open={conditionDialogOpen}
          onClose={() => setConditionDialogOpen(false)}
          title={t.sections.conditions.addBtn}
          size="lg"
        >
          <form onSubmit={handleAddCondition} className="space-y-4 text-xs">
            <div>
              <Label htmlFor="cond-name">{t.sections.conditions.conditionName} *</Label>
              <Input
                id="cond-name"
                value={conditionForm.conditionName}
                onChange={(e) => setConditionForm((f) => ({ ...f, conditionName: e.target.value }))}
                placeholder="e.g. Chronic Bronchitis, Prior Tuberculosis"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cond-cat">{t.sections.conditions.category}</Label>
                <Select
                  id="cond-cat"
                  value={conditionForm.conditionCategory}
                  onChange={(e) => setConditionForm((f) => ({ ...f, conditionCategory: e.target.value as ConditionCategory }))}
                  options={[
                    { value: 'respiratory', label: 'Respiratory' },
                    { value: 'oncological', label: 'Oncological' },
                    { value: 'cardiovascular', label: 'Cardiovascular' },
                    { value: 'surgical', label: 'Surgical' },
                    { value: 'infectious', label: 'Infectious' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="cond-stat">{t.sections.conditions.status}</Label>
                <Select
                  id="cond-stat"
                  value={conditionForm.clinicalStatus}
                  onChange={(e) => setConditionForm((f) => ({ ...f, clinicalStatus: e.target.value as ConditionClinicalStatus }))}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'resolved', label: 'Resolved' },
                    { value: 'in_remission', label: 'In Remission' },
                    { value: 'unknown', label: 'Unknown' },
                  ]}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cond-onset">{t.sections.conditions.onsetDate}</Label>
                <Input
                  id="cond-onset"
                  value={conditionForm.onsetDate}
                  onChange={(e) => setConditionForm((f) => ({ ...f, onsetDate: e.target.value }))}
                  placeholder="YYYY-MM-DD or Year (e.g. 2018)"
                />
              </div>
              <div>
                <Label htmlFor="cond-age">Approximate Age at Onset</Label>
                <Input
                  id="cond-age"
                  type="number"
                  value={conditionForm.approximateOnsetAge}
                  onChange={(e) => setConditionForm((f) => ({ ...f, approximateOnsetAge: e.target.value }))}
                  placeholder="e.g. 45"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="cond-tx">{t.sections.conditions.treatment}</Label>
              <Input
                id="cond-tx"
                value={conditionForm.treatmentSummary}
                onChange={(e) => setConditionForm((f) => ({ ...f, treatmentSummary: e.target.value }))}
                placeholder="e.g. Inhaled corticosteroid, completed 6m DOTS"
              />
            </div>
            <div>
              <Label htmlFor="cond-notes">{t.sections.conditions.notes}</Label>
              <Textarea
                id="cond-notes"
                value={conditionForm.notes}
                onChange={(e) => setConditionForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Clinical observations or findings"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setConditionDialogOpen(false)}>
                {t.dialogs.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={actionLoading}>
                {t.dialogs.save}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* 2. Add Medication Dialog */}
        <Dialog
          open={medicationDialogOpen}
          onClose={() => setMedicationDialogOpen(false)}
          title={t.sections.medications.addBtn}
          size="lg"
        >
          <form onSubmit={handleAddMedication} className="space-y-4 text-xs">
            <div>
              <Label htmlFor="med-name">{t.sections.medications.name} *</Label>
              <Input
                id="med-name"
                value={medicationForm.medicationName}
                onChange={(e) => setMedicationForm((f) => ({ ...f, medicationName: e.target.value }))}
                placeholder="e.g. Salbutamol, Tiotropium"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="med-type">{t.sections.medications.type}</Label>
                <Select
                  id="med-type"
                  value={medicationForm.medicationType}
                  onChange={(e) => setMedicationForm((f) => ({ ...f, medicationType: e.target.value as MedicationType }))}
                  options={[
                    { value: 'respiratory_inhaler', label: 'Respiratory Inhaler' },
                    { value: 'bronchodilator', label: 'Bronchodilator' },
                    { value: 'oral_steroid', label: 'Oral Steroid' },
                    { value: 'cancer_therapy', label: 'Cancer Therapy' },
                    { value: 'antibiotic', label: 'Antibiotic' },
                    { value: 'tuberculosis_regimen', label: 'Tuberculosis Regimen' },
                    { value: 'cardiovascular', label: 'Cardiovascular' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="med-source">{t.sections.medications.source}</Label>
                <Input
                  id="med-source"
                  value={medicationForm.prescribingSource}
                  onChange={(e) => setMedicationForm((f) => ({ ...f, prescribingSource: e.target.value }))}
                  placeholder="e.g. NIDCH Outpatient"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="med-dosage">{t.sections.medications.dosage}</Label>
              <Input
                id="med-dosage"
                value={medicationForm.dosageInstructions}
                onChange={(e) => setMedicationForm((f) => ({ ...f, dosageInstructions: e.target.value }))}
                placeholder="e.g. 2 puffs twice daily"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setMedicationDialogOpen(false)}>
                {t.dialogs.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={actionLoading}>
                {t.dialogs.save}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* 3. Add Allergy Dialog */}
        <Dialog
          open={allergyDialogOpen}
          onClose={() => setAllergyDialogOpen(false)}
          title={t.sections.allergies.addBtn}
          size="md"
        >
          <form onSubmit={handleAddAllergy} className="space-y-4 text-xs">
            <div>
              <Label htmlFor="alg-type">{t.sections.allergies.allergenType}</Label>
              <Select
                id="alg-type"
                value={allergyForm.allergenType}
                onChange={(e) => setAllergyForm((f) => ({ ...f, allergenType: e.target.value as AllergenType }))}
                options={[
                  { value: 'medication', label: 'Medication' },
                  { value: 'environmental', label: 'Environmental / Dust' },
                  { value: 'food', label: 'Food' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </div>
            <div>
              <Label htmlFor="alg-name">{t.sections.allergies.allergenName} *</Label>
              <Input
                id="alg-name"
                value={allergyForm.allergenName}
                onChange={(e) => setAllergyForm((f) => ({ ...f, allergenName: e.target.value }))}
                placeholder="e.g. Penicillin, Aspirin, Pollen"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="alg-sev">{t.sections.allergies.severity}</Label>
                <Select
                  id="alg-sev"
                  value={allergyForm.severity}
                  onChange={(e) => setAllergyForm((f) => ({ ...f, severity: e.target.value as AllergySeverity }))}
                  options={[
                    { value: 'mild', label: 'Mild' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'severe', label: 'Severe' },
                    { value: 'anaphylaxis', label: 'Anaphylaxis' },
                    { value: 'unknown', label: 'Unknown' },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="alg-rx">{t.sections.allergies.reaction}</Label>
                <Input
                  id="alg-rx"
                  value={allergyForm.reactionDescription}
                  onChange={(e) => setAllergyForm((f) => ({ ...f, reactionDescription: e.target.value }))}
                  placeholder="e.g. Rash, Bronchospasm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAllergyDialogOpen(false)}>
                {t.dialogs.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={actionLoading}>
                {t.dialogs.save}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* 4. Update Smoking History Dialog with Live Pack-Year Preview */}
        <Dialog
          open={smokingDialogOpen}
          onClose={() => setSmokingDialogOpen(false)}
          title={t.sections.smoking.title}
          size="lg"
        >
          <form onSubmit={handleSaveSmoking} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="smk-stat">{t.sections.smoking.status}</Label>
                <Select
                  id="smk-stat"
                  value={smokingForm.smokingStatus}
                  onChange={(e) => setSmokingForm((f) => ({ ...f, smokingStatus: e.target.value as SmokingStatus }))}
                  options={[
                    { value: 'never', label: 'Never Smoker' },
                    { value: 'current', label: 'Current Smoker' },
                    { value: 'former', label: 'Former Smoker' },
                    { value: 'unknown_unreported', label: 'Unknown / Unreported' },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="smk-type">{t.sections.smoking.type}</Label>
                <Select
                  id="smk-type"
                  value={smokingForm.tobaccoType}
                  onChange={(e) => setSmokingForm((f) => ({ ...f, tobaccoType: e.target.value as TobaccoType }))}
                  options={[
                    { value: 'cigarettes', label: 'Manufactured Cigarettes' },
                    { value: 'bidi', label: 'Bidis' },
                    { value: 'mixed', label: 'Mixed (Cigarettes & Bidis)' },
                    { value: 'hookah', label: 'Hookah' },
                    { value: 'smokeless_zarda_gul', label: 'Smokeless (Zarda, Gul, Sadapata)' },
                    { value: 'none', label: 'None' },
                  ]}
                />
              </div>
            </div>

            {smokingForm.smokingStatus !== 'never' && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="smk-cigs">{t.sections.smoking.cigsPerDay}</Label>
                    <Input
                      id="smk-cigs"
                      type="number"
                      min="0"
                      value={smokingForm.cigarettesPerDay}
                      onChange={(e) => setSmokingForm((f) => ({ ...f, cigarettesPerDay: e.target.value }))}
                      placeholder="e.g. 15"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smk-bidis">{t.sections.smoking.bidisPerDay}</Label>
                    <Input
                      id="smk-bidis"
                      type="number"
                      min="0"
                      value={smokingForm.bidisPerDay}
                      onChange={(e) => setSmokingForm((f) => ({ ...f, bidisPerDay: e.target.value }))}
                      placeholder="e.g. 0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smk-years">{t.sections.smoking.yearsSmoked}</Label>
                    <Input
                      id="smk-years"
                      type="number"
                      min="0"
                      value={smokingForm.yearsSmoked}
                      onChange={(e) => setSmokingForm((f) => ({ ...f, yearsSmoked: e.target.value }))}
                      placeholder="e.g. 20"
                    />
                  </div>
                </div>

                {/* Real-time Pack-Year Preview Box */}
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 dark:text-amber-100">
                      Live Pack-Years: {livePackYearResult.packYears !== null ? `${livePackYearResult.packYears} Pack-Years` : 'Data Incomplete'}
                    </span>
                    <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400">
                      ((cigs + bidis) / 20) * years
                    </span>
                  </div>
                  {livePackYearResult.notes && (
                    <p className="text-[10px] text-muted-foreground">{livePackYearResult.notes}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="smk-started">{t.sections.smoking.ageStarted}</Label>
                    <Input
                      id="smk-started"
                      type="number"
                      value={smokingForm.ageStarted}
                      onChange={(e) => setSmokingForm((f) => ({ ...f, ageStarted: e.target.value }))}
                      placeholder="e.g. 18"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smk-quit">{t.sections.smoking.ageQuit}</Label>
                    <Input
                      id="smk-quit"
                      type="number"
                      value={smokingForm.ageQuit}
                      onChange={(e) => setSmokingForm((f) => ({ ...f, ageQuit: e.target.value }))}
                      placeholder="e.g. 45"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smk-quitdate">{t.sections.smoking.quitDate}</Label>
                    <Input
                      id="smk-quitdate"
                      value={smokingForm.quitDate}
                      onChange={(e) => setSmokingForm((f) => ({ ...f, quitDate: e.target.value }))}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="smk-shcontext">{t.sections.smoking.secondhandContext}</Label>
                <Select
                  id="smk-shcontext"
                  value={smokingForm.secondhandSmokeContext}
                  onChange={(e) =>
                    setSmokingForm((f) => ({
                      ...f,
                      secondhandSmokeContext: e.target.value as SecondhandSmokeContext,
                      secondhandSmokeExposure: e.target.value !== 'none',
                    }))
                  }
                  options={[
                    { value: 'none', label: 'None' },
                    { value: 'household', label: 'Household' },
                    { value: 'workplace', label: 'Workplace' },
                    { value: 'both', label: 'Both Household & Workplace' },
                    { value: 'unknown', label: 'Unknown' },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="smk-details">{t.sections.smoking.details}</Label>
                <Input
                  id="smk-details"
                  value={smokingForm.otherTobaccoDetails}
                  onChange={(e) => setSmokingForm((f) => ({ ...f, otherTobaccoDetails: e.target.value }))}
                  placeholder="e.g. Zarda with betel leaf daily"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSmokingDialogOpen(false)}>
                {t.dialogs.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={actionLoading}>
                {t.dialogs.save}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* 5. Add Exposure Dialog */}
        <Dialog
          open={exposureDialogOpen}
          onClose={() => setExposureDialogOpen(false)}
          title={t.sections.exposures.addBtn}
          size="lg"
        >
          <form onSubmit={handleAddExposure} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="exp-cat">{t.sections.exposures.category}</Label>
                <Select
                  id="exp-cat"
                  value={exposureForm.exposureCategory}
                  onChange={(e) => setExposureForm((f) => ({ ...f, exposureCategory: e.target.value as ExposureCategory }))}
                  options={[
                    { value: 'occupational', label: 'Occupational' },
                    { value: 'indoor_biomass', label: 'Indoor Cooking / Biomass' },
                    { value: 'outdoor_air_pollution', label: 'Outdoor Air Pollution' },
                    { value: 'secondhand_smoke', label: 'Secondhand Smoke' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="exp-int">{t.sections.exposures.intensity}</Label>
                <Select
                  id="exp-int"
                  value={exposureForm.intensity}
                  onChange={(e) => setExposureForm((f) => ({ ...f, intensity: e.target.value as ExposureIntensity }))}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'high', label: 'High' },
                    { value: 'unknown', label: 'Unknown' },
                  ]}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="exp-type">{t.sections.exposures.type} *</Label>
              <Input
                id="exp-type"
                value={exposureForm.exposureType}
                onChange={(e) => setExposureForm((f) => ({ ...f, exposureType: e.target.value }))}
                placeholder="e.g. Asbestos, Biomass Chula, Textile Dust, Shipbreaking"
                required
              />
            </div>
            {exposureForm.exposureCategory === 'indoor_biomass' && (
              <div>
                <Label htmlFor="exp-fuel">{t.sections.exposures.cookingFuel}</Label>
                <Select
                  id="exp-fuel"
                  value={exposureForm.cookingFuelType}
                  onChange={(e) => setExposureForm((f) => ({ ...f, cookingFuelType: e.target.value as CookingFuelType }))}
                  options={[
                    { value: 'biomass_wood_dung', label: 'Traditional Biomass (Wood, Leaves, Dung)' },
                    { value: 'kerosene', label: 'Kerosene' },
                    { value: 'coal', label: 'Coal' },
                    { value: 'clean_lpg_electric', label: 'Clean Fuel (LPG / Electric)' },
                    { value: 'mixed', label: 'Mixed' },
                  ]}
                />
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="exp-dur">{t.sections.exposures.duration}</Label>
                <Input
                  id="exp-dur"
                  type="number"
                  value={exposureForm.durationYears}
                  onChange={(e) => setExposureForm((f) => ({ ...f, durationYears: e.target.value }))}
                  placeholder="e.g. 15"
                />
              </div>
              <div>
                <Label htmlFor="exp-start">Start Year</Label>
                <Input
                  id="exp-start"
                  type="number"
                  value={exposureForm.startYear}
                  onChange={(e) => setExposureForm((f) => ({ ...f, startYear: e.target.value }))}
                  placeholder="e.g. 1995"
                />
              </div>
              <div>
                <Label htmlFor="exp-end">End Year</Label>
                <Input
                  id="exp-end"
                  type="number"
                  value={exposureForm.endYear}
                  onChange={(e) => setExposureForm((f) => ({ ...f, endYear: e.target.value }))}
                  placeholder="e.g. 2015"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="exp-details">{t.sections.exposures.details}</Label>
              <Textarea
                id="exp-details"
                value={exposureForm.contextDetails}
                onChange={(e) => setExposureForm((f) => ({ ...f, contextDetails: e.target.value }))}
                placeholder="Work conditions, protective equipment, kitchen chimney status"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setExposureDialogOpen(false)}>
                {t.dialogs.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={actionLoading}>
                {t.dialogs.save}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* 6. Add Family History Dialog */}
        <Dialog
          open={familyDialogOpen}
          onClose={() => setFamilyDialogOpen(false)}
          title={t.sections.family.addBtn}
          size="md"
        >
          <form onSubmit={handleAddFamily} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fam-rel">{t.sections.family.relationship}</Label>
                <Select
                  id="fam-rel"
                  value={familyForm.relationship}
                  onChange={(e) => setFamilyForm((f) => ({ ...f, relationship: e.target.value as FamilyRelationship }))}
                  options={[
                    { value: 'parent', label: 'Parent (Father/Mother)' },
                    { value: 'sibling', label: 'Sibling (Brother/Sister)' },
                    { value: 'child', label: 'Child (Son/Daughter)' },
                    { value: 'grandparent', label: 'Grandparent' },
                    { value: 'uncle_aunt', label: 'Uncle / Aunt' },
                    { value: 'other', label: 'Other Relative' },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="fam-cond">{t.sections.family.condition}</Label>
                <Select
                  id="fam-cond"
                  value={familyForm.conditionType}
                  onChange={(e) => setFamilyForm((f) => ({ ...f, conditionType: e.target.value as FamilyConditionType }))}
                  options={[
                    { value: 'lung_cancer', label: 'Lung Cancer' },
                    { value: 'other_cancer', label: 'Other Cancer' },
                    { value: 'copd_respiratory', label: 'COPD / Chronic Respiratory' },
                    { value: 'cardiovascular', label: 'Cardiovascular' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fam-cancertype">{t.sections.family.cancerType}</Label>
              <Input
                id="fam-cancertype"
                value={familyForm.specificCancerType}
                onChange={(e) => setFamilyForm((f) => ({ ...f, specificCancerType: e.target.value }))}
                placeholder="e.g. Small cell lung cancer, Adenocarcinoma"
              />
            </div>
            <div>
              <Label htmlFor="fam-age">{t.sections.family.ageDiagnosis}</Label>
              <Input
                id="fam-age"
                type="number"
                value={familyForm.ageAtDiagnosis}
                onChange={(e) => setFamilyForm((f) => ({ ...f, ageAtDiagnosis: e.target.value }))}
                placeholder="e.g. 58"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setFamilyDialogOpen(false)}>
                {t.dialogs.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={actionLoading}>
                {t.dialogs.save}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* 7. Update Lifestyle Dialog */}
        <Dialog
          open={lifestyleDialogOpen}
          onClose={() => setLifestyleDialogOpen(false)}
          title={t.sections.lifestyle.title}
          size="md"
        >
          <form onSubmit={handleSaveLifestyle} className="space-y-4 text-xs">
            <div>
              <Label htmlFor="lst-act">{t.sections.lifestyle.activity}</Label>
              <Select
                id="lst-act"
                value={lifestyleForm.physicalActivityLevel}
                onChange={(e) => setLifestyleForm((f) => ({ ...f, physicalActivityLevel: e.target.value as PhysicalActivityLevel }))}
                options={[
                  { value: 'sedentary', label: 'Sedentary (Little or no activity)' },
                  { value: 'light', label: 'Light (Short walks, light housework)' },
                  { value: 'moderate', label: 'Moderate (Active labor, regular brisk walking)' },
                  { value: 'active', label: 'Very Active (Heavy manual work/exercise)' },
                  { value: 'unknown', label: 'Unknown' },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="lst-alc">{t.sections.lifestyle.alcohol}</Label>
                <Select
                  id="lst-alc"
                  value={lifestyleForm.alcoholConsumptionStatus}
                  onChange={(e) => setLifestyleForm((f) => ({ ...f, alcoholConsumptionStatus: e.target.value as AlcoholConsumptionStatus }))}
                  options={[
                    { value: 'never', label: 'Never' },
                    { value: 'former', label: 'Former' },
                    { value: 'occasional', label: 'Occasional' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'heavy', label: 'Heavy' },
                    { value: 'unknown', label: 'Unknown' },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="lst-hhsmk">{t.sections.lifestyle.householdSmokers}</Label>
                <Input
                  id="lst-hhsmk"
                  type="number"
                  min="0"
                  value={lifestyleForm.householdSmokersCount}
                  onChange={(e) => setLifestyleForm((f) => ({ ...f, householdSmokersCount: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lst-diet">{t.sections.lifestyle.diet}</Label>
              <Textarea
                id="lst-diet"
                value={lifestyleForm.dietaryNotes}
                onChange={(e) => setLifestyleForm((f) => ({ ...f, dietaryNotes: e.target.value }))}
                placeholder="Dietary habits, fruit/vegetable intake"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setLifestyleDialogOpen(false)}>
                {t.dialogs.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={actionLoading}>
                {t.dialogs.save}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* 8. Record Measurement Dialog */}
        <Dialog
          open={measurementDialogOpen}
          onClose={() => setMeasurementDialogOpen(false)}
          title={t.sections.measurements.addBtn}
          size="md"
        >
          <form onSubmit={handleRecordMeasurement} className="space-y-4 text-xs">
            <div>
              <Label htmlFor="msr-type">{t.sections.measurements.type}</Label>
              <Select
                id="msr-type"
                value={measurementForm.measurementType}
                onChange={(e) => {
                  const val = e.target.value as MeasurementType
                  let unit = 'mmHg'
                  if (val === 'height') unit = 'cm'
                  else if (val === 'weight') unit = 'kg'
                  else if (val === 'heart_rate') unit = 'bpm'
                  else if (val === 'oxygen_saturation') unit = '%'
                  else if (val === 'respiratory_rate') unit = 'breaths/min'
                  setMeasurementForm((f) => ({ ...f, measurementType: val, unit }))
                }}
                options={[
                  { value: 'blood_pressure_combined', label: 'Blood Pressure (Systolic / Diastolic)' },
                  { value: 'height', label: 'Height (cm)' },
                  { value: 'weight', label: 'Weight (kg)' },
                  { value: 'heart_rate', label: 'Heart Rate (bpm)' },
                  { value: 'oxygen_saturation', label: 'Oxygen Saturation SpO2 (%)' },
                  { value: 'respiratory_rate', label: 'Respiratory Rate (breaths/min)' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="msr-val">
                  {measurementForm.measurementType === 'blood_pressure_combined' ? 'Systolic (mmHg)' : 'Value'} *
                </Label>
                <Input
                  id="msr-val"
                  type="number"
                  step="any"
                  value={measurementForm.numericValue}
                  onChange={(e) => setMeasurementForm((f) => ({ ...f, numericValue: e.target.value }))}
                  required
                />
              </div>
              {measurementForm.measurementType === 'blood_pressure_combined' ? (
                <div>
                  <Label htmlFor="msr-sec">Diastolic (mmHg) *</Label>
                  <Input
                    id="msr-sec"
                    type="number"
                    step="any"
                    value={measurementForm.secondaryValue}
                    onChange={(e) => setMeasurementForm((f) => ({ ...f, secondaryValue: e.target.value }))}
                    required
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="msr-unit">{t.sections.measurements.unit}</Label>
                  <Input
                    id="msr-unit"
                    value={measurementForm.unit}
                    onChange={(e) => setMeasurementForm((f) => ({ ...f, unit: e.target.value }))}
                    required
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="msr-context">{t.sections.measurements.context}</Label>
              <Select
                id="msr-context"
                value={measurementForm.measurementContext}
                onChange={(e) => setMeasurementForm((f) => ({ ...f, measurementContext: e.target.value as MeasurementContext }))}
                options={[
                  { value: 'clinic_intake', label: 'Clinic Intake' },
                  { value: 'community_camp', label: 'Community Screening Camp' },
                  { value: 'hospital_bedside', label: 'Hospital Bedside' },
                  { value: 'self_reported', label: 'Self-Reported' },
                ]}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setMeasurementDialogOpen(false)}>
                {t.dialogs.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={actionLoading}>
                {t.dialogs.save}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* 9. Record Symptom Dialog */}
        <Dialog
          open={symptomDialogOpen}
          onClose={() => setSymptomDialogOpen(false)}
          title={t.sections.symptoms.addBtn}
          size="md"
        >
          <form onSubmit={handleRecordSymptom} className="space-y-4 text-xs">
            <div>
              <Label htmlFor="sym-name">{t.sections.symptoms.name}</Label>
              <Select
                id="sym-name"
                value={symptomForm.symptomName}
                onChange={(e) => setSymptomForm((f) => ({ ...f, symptomName: e.target.value as SymptomName }))}
                options={[
                  { value: 'cough', label: 'Persistent Cough' },
                  { value: 'cough_with_hemoptysis', label: 'Cough with Hemoptysis (Blood in Sputum)' },
                  { value: 'dyspnea_breathlessness', label: 'Dyspnea / Shortness of Breath' },
                  { value: 'chest_pain', label: 'Chest Pain or Discomfort' },
                  { value: 'unexplained_weight_loss', label: 'Unexplained Weight Loss' },
                  { value: 'persistent_hoarseness', label: 'Persistent Hoarseness of Voice' },
                  { value: 'wheezing', label: 'Wheezing / Stridor' },
                  { value: 'fatigue', label: 'Unexplained Chronic Fatigue' },
                  { value: 'fever_night_sweats', label: 'Unexplained Fever / Night Sweats' },
                  { value: 'other', label: 'Other Symptom' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sym-pres">{t.sections.symptoms.presence}</Label>
                <Select
                  id="sym-pres"
                  value={symptomForm.isPresent ? 'yes' : 'no'}
                  onChange={(e) => setSymptomForm((f) => ({ ...f, isPresent: e.target.value === 'yes' }))}
                  options={[
                    { value: 'yes', label: 'Present / Confirmed' },
                    { value: 'no', label: 'Explicitly Denied by Patient' },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="sym-dur">{t.sections.symptoms.duration}</Label>
                <Input
                  id="sym-dur"
                  type="number"
                  value={symptomForm.durationWeeks}
                  onChange={(e) => setSymptomForm((f) => ({ ...f, durationWeeks: e.target.value }))}
                  placeholder="e.g. 6"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sym-prog">{t.sections.symptoms.progression}</Label>
                <Select
                  id="sym-prog"
                  value={symptomForm.progression}
                  onChange={(e) => setSymptomForm((f) => ({ ...f, progression: e.target.value as SymptomProgression }))}
                  options={[
                    { value: 'stable', label: 'Stable' },
                    { value: 'worsening', label: 'Worsening' },
                    { value: 'improving', label: 'Improving' },
                    { value: 'fluctuating', label: 'Fluctuating' },
                    { value: 'unknown', label: 'Unknown' },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="sym-sev">{t.sections.symptoms.severity}</Label>
                <Select
                  id="sym-sev"
                  value={symptomForm.severity}
                  onChange={(e) => setSymptomForm((f) => ({ ...f, severity: e.target.value as SymptomSeverity }))}
                  options={[
                    { value: 'mild', label: 'Mild' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'severe', label: 'Severe' },
                    { value: 'acute_critical', label: 'Acute / Critical' },
                  ]}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sym-notes">Observations / Details</Label>
              <Textarea
                id="sym-notes"
                value={symptomForm.notes}
                onChange={(e) => setSymptomForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Productive vs dry, triggers, severity context"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSymptomDialogOpen(false)}>
                {t.dialogs.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={actionLoading}>
                {t.dialogs.save}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* 10. Clinician Review & Verification Dialog */}
        <Dialog
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          title={t.sections.reviews.addBtn}
          size="lg"
        >
          <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rev-cat">{t.sections.reviews.category}</Label>
                <Select
                  id="rev-cat"
                  value={reviewForm.categoryReviewed}
                  onChange={(e) => setReviewForm((f) => ({ ...f, categoryReviewed: e.target.value }))}
                  options={[
                    { value: 'all', label: 'Entire Record (All Categories)' },
                    { value: 'medical_history', label: 'Medical Conditions History' },
                    { value: 'medications', label: 'Medications & Treatments' },
                    { value: 'allergies', label: 'Allergies & Sensitivities' },
                    { value: 'smoking_history', label: 'Smoking & Tobacco History' },
                    { value: 'environmental_exposures', label: 'Environmental Exposures' },
                    { value: 'family_history', label: 'Family History' },
                    { value: 'measurements', label: 'Vitals & Measurements' },
                    { value: 'symptoms', label: 'Symptoms & Observations' },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="rev-dec">{t.sections.reviews.decision}</Label>
                <Select
                  id="rev-dec"
                  value={reviewForm.reviewDecision}
                  onChange={(e) => setReviewForm((f) => ({ ...f, reviewDecision: e.target.value as HealthReviewDecision }))}
                  options={[
                    { value: 'verified', label: t.sections.reviews.verifiedDecision },
                    { value: 'amended_verified', label: t.sections.reviews.amendedDecision },
                    { value: 'rejected_unreliable', label: t.sections.reviews.rejectedDecision },
                    { value: 'requires_followup', label: t.sections.reviews.followupDecision },
                  ]}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="rev-rationale">{t.sections.reviews.rationale} * (min 5 characters)</Label>
              <Textarea
                id="rev-rationale"
                value={reviewForm.clinicalRationale}
                onChange={(e) => setReviewForm((f) => ({ ...f, clinicalRationale: e.target.value }))}
                placeholder="Document clinical assessment, verified sources, physical examination correlation, and recommendations"
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setReviewDialogOpen(false)}>
                {t.dialogs.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {t.dialogs.submit}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* 11. Point-in-Time Snapshot Dialog */}
        <Dialog
          open={snapshotDialogOpen}
          onClose={() => setSnapshotDialogOpen(false)}
          title={t.snapshot.title}
          size="md"
        >
          <form onSubmit={handleReconstructSnapshot} className="space-y-4 text-xs">
            <p className="text-muted-foreground leading-relaxed">
              {t.snapshot.description}
            </p>

            <div>
              <Label htmlFor="snap-time">{t.snapshot.selectDate} (ISO or Date string) *</Label>
              <Input
                id="snap-time"
                value={snapshotTimestamp}
                onChange={(e) => setSnapshotTimestamp(e.target.value)}
                placeholder="e.g. 2026-03-01T12:00:00Z"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSnapshotDialogOpen(false)}>
                {t.dialogs.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={snapshotLoading}>
                {t.snapshot.reconstructBtn}
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
