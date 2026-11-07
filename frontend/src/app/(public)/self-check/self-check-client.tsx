'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Printer,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  X,
  Cigarette,
  HeartPulse,
  Activity,
  FileText,
  UserCheck,
  Stethoscope,
  BookOpen,
} from 'lucide-react'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'
import { SectionContainer } from '@/components/layouts/section-container'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup } from '@/components/ui/radio-group'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useLanguage } from '@/i18n'
import { useOfflineForm } from '@/modules/offline/use-offline-form'
import { SyncStatusBadge } from '@/components/shared/sync-status-badge'
import {
  calculatePackYears,
  evaluateSelfCheck,
} from '@/modules/self-check'
import type {
  AgeRange,
  BiologicalSex,
  BangladeshDivision,
  SmokingStatus,
  TobaccoType,
  SecondhandSmokeExposure,
  RespiratoryCondition,
  FamilyHistoryLungCancer,
  CookingFuelType,
  OccupationalHazard,
  SelfReportedAirPollution,
  WarningSymptom,
  SelfCheckResponses,
  SelfCheckResult,
} from '@/modules/self-check'
import {
  acknowledgementSchema,
  demographicsSchema,
  smokingHistorySchema,
  medicalHistorySchema,
  environmentalExposureSchema,
  symptomsSchema,
} from '@/modules/self-check/validation'
import { cn } from '@/lib/utils'

export function SelfCheckClient() {
  const router = useRouter()
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.selfCheck

  const [step, setStep] = useState<number>(0)
  const [confirmExitOpen, setConfirmExitOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<SelfCheckResult | null>(null)

  // Form State
  const [acknowledged, setAcknowledged] = useState(false)
  const [ageRange, setAgeRange] = useState<AgeRange | ''>('')
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex | ''>('')
  const [division, setDivision] = useState<BangladeshDivision | ''>('')

  const [smokingStatus, setSmokingStatus] = useState<SmokingStatus | ''>('')
  const [tobaccoType, setTobaccoType] = useState<TobaccoType | ''>('')
  const [cigarettesPerDay, setCigarettesPerDay] = useState<number | ''>('')
  const [smokingDurationYears, setSmokingDurationYears] = useState<number | ''>('')
  const [quitYearsAgo, setQuitYearsAgo] = useState<number | ''>('')
  const [secondhandSmoke, setSecondhandSmoke] = useState<SecondhandSmokeExposure | ''>('none')

  const [respiratoryConditions, setRespiratoryConditions] = useState<RespiratoryCondition[]>([])
  const [familyLungCancer, setFamilyLungCancer] = useState<FamilyHistoryLungCancer | ''>('')
  const [personalCancerHistory, setPersonalCancerHistory] = useState(false)

  const [cookingFuel, setCookingFuel] = useState<CookingFuelType | ''>('')
  const [biomassExposureYears, setBiomassExposureYears] = useState<number | ''>('')
  const [occupationalHazards, setOccupationalHazards] = useState<OccupationalHazard[]>([])
  const [airPollution, setAirPollution] = useState<SelfReportedAirPollution | ''>('')

  const [symptoms, setSymptoms] = useState<WarningSymptom[]>([])

  // Offline Draft Preservation
  const {
    saveLocalDraft,
    syncStatus,
    lastSavedAt,
    hasRestoredDraft,
    discardDraft,
  } = useOfflineForm<Record<string, unknown>>({
    formType: 'self_check',
    userId: 'anonymous',
    assessmentType: 'self_check',
    customDraftId: 'draft_self_check_anonymous',
    debounceMs: 200,
    onRestore: (saved) => {
      if (typeof saved.step === 'number' && saved.step > 0 && saved.step < 6) {
        setStep(saved.step)
      }
      if (saved.acknowledged) setAcknowledged(Boolean(saved.acknowledged))
      if (saved.ageRange) setAgeRange(saved.ageRange as AgeRange)
      if (saved.biologicalSex) setBiologicalSex(saved.biologicalSex as BiologicalSex)
      if (saved.division) setDivision(saved.division as BangladeshDivision)
      if (saved.smokingStatus) setSmokingStatus(saved.smokingStatus as SmokingStatus)
      if (saved.tobaccoType) setTobaccoType(saved.tobaccoType as TobaccoType)
      if (typeof saved.cigarettesPerDay === 'number') setCigarettesPerDay(saved.cigarettesPerDay)
      if (typeof saved.smokingDurationYears === 'number') setSmokingDurationYears(saved.smokingDurationYears)
      if (typeof saved.quitYearsAgo === 'number') setQuitYearsAgo(saved.quitYearsAgo)
      if (saved.secondhandSmoke) setSecondhandSmoke(saved.secondhandSmoke as SecondhandSmokeExposure)
      if (Array.isArray(saved.respiratoryConditions)) setRespiratoryConditions(saved.respiratoryConditions as RespiratoryCondition[])
      if (saved.familyLungCancer) setFamilyLungCancer(saved.familyLungCancer as FamilyHistoryLungCancer)
      if (typeof saved.personalCancerHistory === 'boolean') setPersonalCancerHistory(saved.personalCancerHistory)
      if (saved.cookingFuel) setCookingFuel(saved.cookingFuel as CookingFuelType)
      if (typeof saved.biomassExposureYears === 'number') setBiomassExposureYears(saved.biomassExposureYears)
      if (Array.isArray(saved.occupationalHazards)) setOccupationalHazards(saved.occupationalHazards as OccupationalHazard[])
      if (saved.airPollution) setAirPollution(saved.airPollution as SelfReportedAirPollution)
      if (Array.isArray(saved.symptoms)) setSymptoms(saved.symptoms as WarningSymptom[])
    },
  })

  // Debounced Auto-Save when fields change
  React.useEffect(() => {
    if (step > 0 && step < 6) {
      saveLocalDraft({
        step,
        acknowledged,
        ageRange,
        biologicalSex,
        division,
        smokingStatus,
        tobaccoType,
        cigarettesPerDay,
        smokingDurationYears,
        quitYearsAgo,
        secondhandSmoke,
        respiratoryConditions,
        familyLungCancer,
        personalCancerHistory,
        cookingFuel,
        biomassExposureYears,
        occupationalHazards,
        airPollution,
        symptoms,
      })
    }
  }, [
    step,
    acknowledged,
    ageRange,
    biologicalSex,
    division,
    smokingStatus,
    tobaccoType,
    cigarettesPerDay,
    smokingDurationYears,
    quitYearsAgo,
    secondhandSmoke,
    respiratoryConditions,
    familyLungCancer,
    personalCancerHistory,
    cookingFuel,
    biomassExposureYears,
    occupationalHazards,
    airPollution,
    symptoms,
    saveLocalDraft,
  ])

  // Live pack-years calculation
  const livePackYears = calculatePackYears(
    (smokingStatus as 'never' | 'former' | 'current') || 'never',
    typeof cigarettesPerDay === 'number' ? cigarettesPerDay : 0,
    typeof smokingDurationYears === 'number' ? smokingDurationYears : 0
  )

  // Step Validation & Navigation
  const handleNext = () => {
    setErrors({})

    if (step === 0) {
      const parsed = acknowledgementSchema.safeParse({ acknowledgedLimitations: acknowledged })
      if (!parsed.success) {
        setErrors({ acknowledgedLimitations: t.steps.intro.requiredError })
        return
      }
      setStep(1)
    } else if (step === 1) {
      const parsed = demographicsSchema.safeParse({
        ageRange,
        biologicalSex,
        division,
      })
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {}
        for (const issue of parsed.error.issues) {
          const path = issue.path[0] as string
          fieldErrors[path] = issue.message
        }
        setErrors(fieldErrors)
        return
      }
      setStep(2)
    } else if (step === 2) {
      const payload: Record<string, unknown> = {
        smokingStatus,
        secondhandSmoke,
      }
      if (smokingStatus === 'current' || smokingStatus === 'former') {
        payload.tobaccoType = tobaccoType
        payload.cigarettesPerDay = typeof cigarettesPerDay === 'number' ? cigarettesPerDay : undefined
        payload.smokingDurationYears =
          typeof smokingDurationYears === 'number' ? smokingDurationYears : undefined
      }
      if (smokingStatus === 'former') {
        payload.quitYearsAgo = typeof quitYearsAgo === 'number' ? quitYearsAgo : undefined
      }

      const parsed = smokingHistorySchema.safeParse(payload)
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {}
        for (const issue of parsed.error.issues) {
          const path = issue.path[0] as string
          fieldErrors[path] = issue.message
        }
        setErrors(fieldErrors)
        return
      }
      setStep(3)
    } else if (step === 3) {
      const parsed = medicalHistorySchema.safeParse({
        respiratoryConditions,
        familyLungCancer,
        personalCancerHistory,
      })
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {}
        for (const issue of parsed.error.issues) {
          const path = issue.path[0] as string
          fieldErrors[path] = issue.message
        }
        setErrors(fieldErrors)
        return
      }
      setStep(4)
    } else if (step === 4) {
      const payload: Record<string, unknown> = {
        cookingFuel,
        occupationalHazards,
        selfReportedAirPollution: airPollution,
      }
      if (cookingFuel === 'biomass_wood_dung') {
        payload.biomassExposureYears =
          typeof biomassExposureYears === 'number' ? biomassExposureYears : undefined
      }

      const parsed = environmentalExposureSchema.safeParse(payload)
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {}
        for (const issue of parsed.error.issues) {
          const path = issue.path[0] as string
          fieldErrors[path] = issue.message
        }
        setErrors(fieldErrors)
        return
      }
      setStep(5)
    } else if (step === 5) {
      const parsed = symptomsSchema.safeParse({ symptoms })
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {}
        for (const issue of parsed.error.issues) {
          const path = issue.path[0] as string
          fieldErrors[path] = issue.message
        }
        setErrors(fieldErrors)
        return
      }

      // Generate results using clinical engine
      const responses: SelfCheckResponses = {
        acknowledgedLimitations: acknowledged,
        ageRange: ageRange as AgeRange,
        biologicalSex: biologicalSex as BiologicalSex,
        division: division as BangladeshDivision,
        smokingStatus: smokingStatus as SmokingStatus,
        tobaccoType: tobaccoType ? (tobaccoType as TobaccoType) : undefined,
        cigarettesPerDay: typeof cigarettesPerDay === 'number' ? cigarettesPerDay : undefined,
        smokingDurationYears:
          typeof smokingDurationYears === 'number' ? smokingDurationYears : undefined,
        quitYearsAgo: typeof quitYearsAgo === 'number' ? quitYearsAgo : undefined,
        secondhandSmoke: secondhandSmoke as SecondhandSmokeExposure,
        respiratoryConditions,
        familyLungCancer: familyLungCancer as FamilyHistoryLungCancer,
        personalCancerHistory,
        cookingFuel: cookingFuel as CookingFuelType,
        biomassExposureYears:
          typeof biomassExposureYears === 'number' ? biomassExposureYears : undefined,
        occupationalHazards,
        selfReportedAirPollution: airPollution as SelfReportedAirPollution,
        symptoms,
      }

      const evaluation = evaluateSelfCheck(responses)
      setResult(evaluation)
      setStep(6)
      discardDraft()
    }
  }

  const handleBack = () => {
    if (step > 0 && step < 6) {
      setStep((prev) => prev - 1)
      setErrors({})
    }
  }

  const handleRetake = () => {
    setStep(1)
    setErrors({})
    setResult(null)
    discardDraft()
  }

  const handlePrint = () => {
    window.print()
  }

  // Symptom selection helper: mutually exclusive with 'none'
  const toggleSymptom = (sym: WarningSymptom) => {
    if (sym === 'none') {
      setSymptoms(['none'])
    } else {
      setSymptoms((prev) => {
        const withoutNone = prev.filter((s) => s !== 'none')
        if (withoutNone.includes(sym)) {
          return withoutNone.filter((s) => s !== sym)
        }
        return [...withoutNone, sym]
      })
    }
  }

  // Condition selection helper: mutually exclusive with 'none'
  const toggleRespiratoryCondition = (cond: RespiratoryCondition) => {
    if (cond === 'none') {
      setRespiratoryConditions(['none'])
    } else {
      setRespiratoryConditions((prev) => {
        const withoutNone = prev.filter((c) => c !== 'none')
        if (withoutNone.includes(cond)) {
          return withoutNone.filter((c) => c !== cond)
        }
        return [...withoutNone, cond]
      })
    }
  }

  // Hazard selection helper: mutually exclusive with 'none'
  const toggleOccupationalHazard = (haz: OccupationalHazard) => {
    if (haz === 'none') {
      setOccupationalHazards(['none'])
    } else {
      setOccupationalHazards((prev) => {
        const withoutNone = prev.filter((h) => h !== 'none')
        if (withoutNone.includes(haz)) {
          return withoutNone.filter((h) => h !== haz)
        }
        return [...withoutNone, haz]
      })
    }
  }

  const toBanglaDigits = (num: number | string) =>
    num.toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])

  const progressPercent = step === 6 ? 100 : Math.round((step / 6) * 100)

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="flex-1 py-8 sm:py-12">
        <SectionContainer size="md">
          {/* Top Bar with Exit and Progress (Hidden on results print) */}
          <div className="print:hidden space-y-4 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
                  <Activity className="size-3.5" aria-hidden="true" />
                  <span>{t.badge}</span>
                </div>
                {step > 0 && step < 6 && (
                  <SyncStatusBadge status={syncStatus} lastSavedAt={lastSavedAt} />
                )}
              </div>

              {step > 0 && step < 6 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmExitOpen(true)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5 mr-1" />
                  <span>{t.buttons.exit}</span>
                </Button>
              )}
            </div>

            {hasRestoredDraft && step > 0 && step < 6 && (
              <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary flex items-center justify-between">
                <span>
                  {isBn
                    ? 'আপনার ডিভাইসে সংরক্ষিত ড্রাফটটি সফলভাবে পুনরুদ্ধার করা হয়েছে।'
                    : 'Restored your previously saved assessment draft on this device.'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    discardDraft()
                    handleRetake()
                  }}
                  className="h-6 text-[11px] text-destructive hover:bg-destructive/10"
                >
                  {isBn ? 'ড্রাফট বাতিল' : 'Discard Draft'}
                </Button>
              </div>
            )}

            {/* Stepper Progress Bar */}
            {step < 6 && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
                  <span>
                    {isBn
                      ? `ধাপ ${toBanglaDigits(step)} / ৫`
                      : `Step ${step} of 5`}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} max={100} className="h-2" />
              </div>
            )}
          </div>

          {/* STEP 0: Introduction & Scope Acknowledgement */}
          {step === 0 && (
            <Card className="border-border/80 shadow-sm animate-in fade-in duration-200">
              <CardHeader className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                  <ShieldAlert className="size-4" />
                  <span>{t.steps.intro.title}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {t.title}
                </h1>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  {t.subtitle}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="rounded-xl border border-muted bg-muted/30 p-4 sm:p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      {t.steps.intro.whatItIsTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed pl-6">
                      {t.steps.intro.whatItIsText}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                      {t.steps.intro.whatItIsNotTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed pl-6">
                      {t.steps.intro.whatItIsNotText}
                    </p>
                  </div>

                  <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 sm:p-3.5">
                    <h3 className="text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                      <ShieldAlert className="size-4 shrink-0" />
                      {t.steps.intro.safetyPriorityTitle}
                    </h3>
                    <p className="text-xs text-rose-600/90 dark:text-rose-400/90 mt-1 leading-relaxed">
                      {t.steps.intro.safetyPriorityText}
                    </p>
                  </div>
                </div>

                {/* Consent Acknowledgement */}
                <div className="pt-2">
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                    <Checkbox
                      id="ack-terms"
                      checked={acknowledged}
                      onChange={(e) => {
                        setAcknowledged(e.target.checked)
                        if (errors.acknowledgedLimitations) {
                          setErrors({})
                        }
                      }}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor="ack-terms"
                      className="text-xs sm:text-sm font-medium leading-relaxed text-foreground cursor-pointer"
                    >
                      {t.steps.intro.acknowledgementLabel}
                    </label>
                  </div>
                  {errors.acknowledgedLimitations && (
                    <p className="text-xs font-medium text-destructive mt-2">
                      {errors.acknowledgedLimitations}
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground/80 leading-relaxed text-center">
                  {t.privacyNotice}
                </p>
              </CardContent>

              <CardFooter className="flex justify-end pt-2">
                <Button
                  size="lg"
                  onClick={handleNext}
                  className="w-full sm:w-auto font-semibold"
                >
                  <span>{t.buttons.next}</span>
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* STEP 1: Basic Demographics */}
          {step === 1 && (
            <Card className="border-border/80 shadow-sm animate-in fade-in duration-200">
              <CardHeader className="space-y-1">
                <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {isBn ? 'ধাপ ১' : 'Step 1'}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {t.steps.demographics.title}
                </h2>
                <CardDescription className="text-sm">
                  {t.steps.demographics.desc}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Age Range */}
                <div className="space-y-2">
                  <Label htmlFor="age-range" className="text-sm font-medium">
                    {t.steps.demographics.ageRangeLabel} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    id="age-range"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value as AgeRange)}
                    placeholder={t.steps.demographics.ageRangePlaceholder}
                    error={errors.ageRange}
                    options={[
                      { value: 'under_40', label: t.steps.demographics.ageUnder40 },
                      { value: '40_49', label: t.steps.demographics.age40_49 },
                      { value: '50_59', label: t.steps.demographics.age50_59 },
                      { value: '60_69', label: t.steps.demographics.age60_69 },
                      { value: '70_and_older', label: t.steps.demographics.age70Plus },
                    ]}
                  />
                  {errors.ageRange && (
                    <p className="text-xs text-destructive">{errors.ageRange}</p>
                  )}
                </div>

                {/* Biological Sex */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t.steps.demographics.sexLabel} <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    name="biological-sex"
                    value={biologicalSex}
                    onChange={(val) => setBiologicalSex(val as BiologicalSex)}
                    orientation="horizontal"
                    error={errors.biologicalSex}
                    options={[
                      { value: 'female', label: t.steps.demographics.sexFemale },
                      { value: 'male', label: t.steps.demographics.sexMale },
                      { value: 'prefer_not_to_say', label: t.steps.demographics.sexPreferNot },
                    ]}
                  />
                  {errors.biologicalSex && (
                    <p className="text-xs text-destructive">{errors.biologicalSex}</p>
                  )}
                </div>

                {/* Location / Division */}
                <div className="space-y-2">
                  <Label htmlFor="division" className="text-sm font-medium">
                    {t.steps.demographics.divisionLabel} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    id="division"
                    value={division}
                    onChange={(e) => setDivision(e.target.value as BangladeshDivision)}
                    placeholder={t.steps.demographics.divisionPlaceholder}
                    error={errors.division}
                    options={[
                      { value: 'dhaka', label: t.steps.demographics.divDhaka },
                      { value: 'chattogram', label: t.steps.demographics.divChattogram },
                      { value: 'rajshahi', label: t.steps.demographics.divRajshahi },
                      { value: 'khulna', label: t.steps.demographics.divKhulna },
                      { value: 'barishal', label: t.steps.demographics.divBarishal },
                      { value: 'sylhet', label: t.steps.demographics.divSylhet },
                      { value: 'rangpur', label: t.steps.demographics.divRangpur },
                      { value: 'mymensingh', label: t.steps.demographics.divMymensingh },
                      { value: 'other', label: t.steps.demographics.divOther },
                    ]}
                  />
                  {errors.division && (
                    <p className="text-xs text-destructive">{errors.division}</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="size-4 mr-2" />
                  <span>{t.buttons.back}</span>
                </Button>
                <Button onClick={handleNext}>
                  <span>{t.buttons.next}</span>
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* STEP 2: Smoking & Tobacco History */}
          {step === 2 && (
            <Card className="border-border/80 shadow-sm animate-in fade-in duration-200">
              <CardHeader className="space-y-1">
                <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {isBn ? 'ধাপ ২' : 'Step 2'}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {t.steps.smoking.title}
                </h2>
                <CardDescription className="text-sm">
                  {t.steps.smoking.desc}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Smoking Status */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t.steps.smoking.statusLabel} <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    name="smoking-status"
                    value={smokingStatus}
                    onChange={(val) => {
                      setSmokingStatus(val as SmokingStatus)
                      if (val === 'never') {
                        setTobaccoType('none')
                        setCigarettesPerDay('')
                        setSmokingDurationYears('')
                        setQuitYearsAgo('')
                      }
                    }}
                    error={errors.smokingStatus}
                    options={[
                      { value: 'never', label: t.steps.smoking.statusNever },
                      { value: 'former', label: t.steps.smoking.statusFormer },
                      { value: 'current', label: t.steps.smoking.statusCurrent },
                    ]}
                  />
                  {errors.smokingStatus && (
                    <p className="text-xs text-destructive">{errors.smokingStatus}</p>
                  )}
                </div>

                {/* Conditional fields for Current/Former Smokers */}
                {(smokingStatus === 'current' || smokingStatus === 'former') && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-5 animate-in fade-in duration-150">
                    {/* Tobacco Type */}
                    <div className="space-y-2">
                      <Label htmlFor="tobacco-type" className="text-sm font-medium">
                        {t.steps.smoking.tobaccoTypeLabel} <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        id="tobacco-type"
                        value={tobaccoType}
                        onChange={(e) => setTobaccoType(e.target.value as TobaccoType)}
                        error={errors.tobaccoType}
                        options={[
                          { value: '', label: isBn ? 'তামাকের ধরন নির্বাচন করুন' : 'Select tobacco type' },
                          { value: 'cigarettes', label: t.steps.smoking.tobaccoCigarettes },
                          { value: 'bidis', label: t.steps.smoking.tobaccoBidis },
                          { value: 'both', label: t.steps.smoking.tobaccoBoth },
                        ]}
                      />
                      {errors.tobaccoType && (
                        <p className="text-xs text-destructive">{errors.tobaccoType}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Daily Count */}
                      <div className="space-y-2">
                        <Label htmlFor="per-day" className="text-sm font-medium">
                          {t.steps.smoking.perDayLabel} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="per-day"
                          type="number"
                          min="1"
                          max="120"
                          placeholder={t.steps.smoking.perDayPlaceholder}
                          value={cigarettesPerDay}
                          onChange={(e) =>
                            setCigarettesPerDay(e.target.value === '' ? '' : Number(e.target.value))
                          }
                          error={errors.cigarettesPerDay}
                        />
                        {errors.cigarettesPerDay && (
                          <p className="text-xs text-destructive">{errors.cigarettesPerDay}</p>
                        )}
                      </div>

                      {/* Smoking Duration Years */}
                      <div className="space-y-2">
                        <Label htmlFor="duration-years" className="text-sm font-medium">
                          {t.steps.smoking.durationYearsLabel} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="duration-years"
                          type="number"
                          min="1"
                          max="80"
                          placeholder={t.steps.smoking.durationYearsPlaceholder}
                          value={smokingDurationYears}
                          onChange={(e) =>
                            setSmokingDurationYears(
                              e.target.value === '' ? '' : Number(e.target.value)
                            )
                          }
                          error={errors.smokingDurationYears}
                        />
                        {errors.smokingDurationYears && (
                          <p className="text-xs text-destructive">
                            {errors.smokingDurationYears}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quit Years Ago (Former Smokers Only) */}
                    {smokingStatus === 'former' && (
                      <div className="space-y-2">
                        <Label htmlFor="quit-years" className="text-sm font-medium">
                          {t.steps.smoking.quitYearsLabel} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="quit-years"
                          type="number"
                          min="0"
                          max="80"
                          placeholder={t.steps.smoking.quitYearsPlaceholder}
                          value={quitYearsAgo}
                          onChange={(e) =>
                            setQuitYearsAgo(e.target.value === '' ? '' : Number(e.target.value))
                          }
                          error={errors.quitYearsAgo}
                        />
                        {errors.quitYearsAgo && (
                          <p className="text-xs text-destructive">{errors.quitYearsAgo}</p>
                        )}
                      </div>
                    )}

                    {/* Live Pack-Years Feedback Banner */}
                    <div className="rounded-lg bg-background border border-border p-3.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs text-muted-foreground">
                          {t.steps.smoking.packYearsCalculated}
                        </span>
                        <p className="text-xs text-muted-foreground/75">
                          {t.steps.smoking.packYearsExplain}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl sm:text-2xl font-extrabold text-primary">
                          {livePackYears}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1.5 font-medium">
                          {t.steps.smoking.packYearsUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Secondhand Smoke */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t.steps.smoking.secondhandSmokeLabel} <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    name="secondhand-smoke"
                    value={secondhandSmoke}
                    onChange={(val) => setSecondhandSmoke(val as SecondhandSmokeExposure)}
                    error={errors.secondhandSmoke}
                    options={[
                      { value: 'none', label: t.steps.smoking.secondhandNone },
                      { value: 'household', label: t.steps.smoking.secondhandHousehold },
                      { value: 'workplace', label: t.steps.smoking.secondhandWorkplace },
                      { value: 'both', label: t.steps.smoking.secondhandBoth },
                    ]}
                  />
                  {errors.secondhandSmoke && (
                    <p className="text-xs text-destructive">{errors.secondhandSmoke}</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="size-4 mr-2" />
                  <span>{t.buttons.back}</span>
                </Button>
                <Button onClick={handleNext}>
                  <span>{t.buttons.next}</span>
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* STEP 3: Respiratory & Medical History */}
          {step === 3 && (
            <Card className="border-border/80 shadow-sm animate-in fade-in duration-200">
              <CardHeader className="space-y-1">
                <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {isBn ? 'ধাপ ৩' : 'Step 3'}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {t.steps.medical.title}
                </h2>
                <CardDescription className="text-sm">
                  {t.steps.medical.desc}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Pre-existing conditions */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    {t.steps.medical.respiratoryConditionsLabel}{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="space-y-2.5">
                    {[
                      { id: 'copd', label: t.steps.medical.condCopd },
                      { id: 'chronic_bronchitis', label: t.steps.medical.condChronicBronchitis },
                      { id: 'emphysema', label: t.steps.medical.condEmphysema },
                      { id: 'asthma', label: t.steps.medical.condAsthma },
                      { id: 'prior_tb', label: t.steps.medical.condPriorTb },
                      { id: 'pulmonary_fibrosis', label: t.steps.medical.condPulmonaryFibrosis },
                      { id: 'none', label: t.steps.medical.condNone },
                    ].map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-xl border transition-colors',
                          respiratoryConditions.includes(item.id as RespiratoryCondition)
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-border/70 hover:bg-muted/40'
                        )}
                      >
                        <Checkbox
                          id={`cond-${item.id}`}
                          checked={respiratoryConditions.includes(item.id as RespiratoryCondition)}
                          onChange={() =>
                            toggleRespiratoryCondition(item.id as RespiratoryCondition)
                          }
                        />
                        <label
                          htmlFor={`cond-${item.id}`}
                          className="text-xs sm:text-sm font-medium text-foreground cursor-pointer flex-1"
                        >
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.respiratoryConditions && (
                    <p className="text-xs text-destructive">{errors.respiratoryConditions}</p>
                  )}
                </div>

                {/* Family History */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t.steps.medical.familyLungCancerLabel}{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    name="family-lung-cancer"
                    value={familyLungCancer}
                    onChange={(val) => setFamilyLungCancer(val as FamilyHistoryLungCancer)}
                    error={errors.familyLungCancer}
                    options={[
                      { value: 'yes_first_degree', label: t.steps.medical.familyFirstDegree },
                      { value: 'yes_second_degree', label: t.steps.medical.familySecondDegree },
                      { value: 'no', label: t.steps.medical.familyNo },
                      { value: 'unknown', label: t.steps.medical.familyUnknown },
                    ]}
                  />
                  {errors.familyLungCancer && (
                    <p className="text-xs text-destructive">{errors.familyLungCancer}</p>
                  )}
                </div>

                {/* Personal Cancer History */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t.steps.medical.personalCancerLabel}
                  </Label>
                  <RadioGroup
                    name="personal-cancer"
                    value={personalCancerHistory ? 'yes' : 'no'}
                    onChange={(val) => setPersonalCancerHistory(val === 'yes')}
                    orientation="horizontal"
                    options={[
                      { value: 'no', label: t.steps.medical.personalCancerNo },
                      { value: 'yes', label: t.steps.medical.personalCancerYes },
                    ]}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="size-4 mr-2" />
                  <span>{t.buttons.back}</span>
                </Button>
                <Button onClick={handleNext}>
                  <span>{t.buttons.next}</span>
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* STEP 4: Environmental & Cooking Exposures */}
          {step === 4 && (
            <Card className="border-border/80 shadow-sm animate-in fade-in duration-200">
              <CardHeader className="space-y-1">
                <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {isBn ? 'ধাপ ৪' : 'Step 4'}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {t.steps.environment.title}
                </h2>
                <CardDescription className="text-sm">
                  {t.steps.environment.desc}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Cooking Fuel */}
                <div className="space-y-2">
                  <Label htmlFor="cooking-fuel" className="text-sm font-medium">
                    {t.steps.environment.cookingFuelLabel}{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    id="cooking-fuel"
                    value={cookingFuel}
                    onChange={(e) => {
                      const val = e.target.value as CookingFuelType
                      setCookingFuel(val)
                      if (val !== 'biomass_wood_dung') {
                        setBiomassExposureYears('')
                      }
                    }}
                    error={errors.cookingFuel}
                    options={[
                      { value: '', label: isBn ? 'জ্বালানির ধরন নির্বাচন করুন' : 'Select cooking fuel' },
                      { value: 'lpg_gas', label: t.steps.environment.fuelLpg },
                      { value: 'electricity', label: t.steps.environment.fuelElectricity },
                      { value: 'biomass_wood_dung', label: t.steps.environment.fuelBiomass },
                      { value: 'kerosene', label: t.steps.environment.fuelKerosene },
                      { value: 'other', label: t.steps.environment.fuelOther },
                    ]}
                  />
                  {errors.cookingFuel && (
                    <p className="text-xs text-destructive">{errors.cookingFuel}</p>
                  )}
                </div>

                {/* Biomass cooking duration */}
                {cookingFuel === 'biomass_wood_dung' && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2 animate-in fade-in duration-150">
                    <Label htmlFor="biomass-years" className="text-sm font-medium text-foreground">
                      {t.steps.environment.biomassYearsLabel}{' '}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="biomass-years"
                      type="number"
                      min="1"
                      max="80"
                      placeholder={t.steps.environment.biomassYearsPlaceholder}
                      value={biomassExposureYears}
                      onChange={(e) =>
                        setBiomassExposureYears(
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      error={errors.biomassExposureYears}
                    />
                    {errors.biomassExposureYears && (
                      <p className="text-xs text-destructive">{errors.biomassExposureYears}</p>
                    )}
                  </div>
                )}

                {/* Occupational Hazards */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    {t.steps.environment.occupationalLabel}{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="space-y-2.5">
                    {[
                      { id: 'silica_dust', label: t.steps.environment.occSilica },
                      { id: 'asbestos', label: t.steps.environment.occAsbestos },
                      { id: 'shipbreaking_welding', label: t.steps.environment.occShipbreaking },
                      { id: 'textile_dyeing_fumes', label: t.steps.environment.occTextile },
                      { id: 'pesticides_agriculture', label: t.steps.environment.occPesticides },
                      { id: 'none', label: t.steps.environment.occNone },
                    ].map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-xl border transition-colors',
                          occupationalHazards.includes(item.id as OccupationalHazard)
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-border/70 hover:bg-muted/40'
                        )}
                      >
                        <Checkbox
                          id={`occ-${item.id}`}
                          checked={occupationalHazards.includes(item.id as OccupationalHazard)}
                          onChange={() =>
                            toggleOccupationalHazard(item.id as OccupationalHazard)
                          }
                        />
                        <label
                          htmlFor={`occ-${item.id}`}
                          className="text-xs sm:text-sm font-medium text-foreground cursor-pointer flex-1"
                        >
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.occupationalHazards && (
                    <p className="text-xs text-destructive">{errors.occupationalHazards}</p>
                  )}
                </div>

                {/* Air Pollution Perception */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t.steps.environment.airPollutionLabel}{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    name="air-pollution"
                    value={airPollution}
                    onChange={(val) => setAirPollution(val as SelfReportedAirPollution)}
                    error={errors.selfReportedAirPollution}
                    options={[
                      { value: 'low', label: t.steps.environment.airLow },
                      { value: 'moderate', label: t.steps.environment.airModerate },
                      { value: 'high_urban', label: t.steps.environment.airHigh },
                    ]}
                  />
                  {errors.selfReportedAirPollution && (
                    <p className="text-xs text-destructive">
                      {errors.selfReportedAirPollution}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="size-4 mr-2" />
                  <span>{t.buttons.back}</span>
                </Button>
                <Button onClick={handleNext}>
                  <span>{t.buttons.next}</span>
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* STEP 5: Symptoms Awareness & Safety Check */}
          {step === 5 && (
            <Card className="border-border/80 shadow-sm animate-in fade-in duration-200">
              <CardHeader className="space-y-1">
                <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5" />
                  <span>{isBn ? 'ধাপ ৫ • লক্ষণ ও সুরক্ষা' : 'Step 5 • Symptoms & Safety'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {t.steps.symptoms.title}
                </h2>
                <CardDescription className="text-sm">
                  {t.steps.symptoms.desc}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Independent safety notice */}
                <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-4 flex items-start gap-3">
                  <AlertTriangle className="size-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 leading-relaxed font-medium">
                    {t.steps.symptoms.safetyAlert}
                  </p>
                </div>

                {/* Symptom Checklist */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    {t.steps.symptoms.symptomsLabel}{' '}
                    <span className="text-destructive">*</span>
                  </Label>

                  <div className="space-y-2.5">
                    {[
                      {
                        id: 'coughing_blood',
                        label: t.steps.symptoms.symptomBlood,
                        isUrgent: true,
                      },
                      {
                        id: 'cough_over_3_weeks',
                        label: t.steps.symptoms.symptomCough3Weeks,
                        isUrgent: true,
                      },
                      {
                        id: 'persistent_chest_pain',
                        label: t.steps.symptoms.symptomChestPain,
                        isUrgent: true,
                      },
                      {
                        id: 'unexplained_weight_loss',
                        label: t.steps.symptoms.symptomWeightLoss,
                        isUrgent: true,
                      },
                      {
                        id: 'severe_breathlessness',
                        label: t.steps.symptoms.symptomBreathlessness,
                        isUrgent: true,
                      },
                      {
                        id: 'hoarseness_unexplained',
                        label: t.steps.symptoms.symptomHoarseness,
                        isUrgent: false,
                      },
                      {
                        id: 'frequent_chest_infections',
                        label: t.steps.symptoms.symptomInfections,
                        isUrgent: false,
                      },
                      {
                        id: 'none',
                        label: t.steps.symptoms.symptomNone,
                        isUrgent: false,
                      },
                    ].map((item) => {
                      const isChecked = symptoms.includes(item.id as WarningSymptom)
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            'flex items-center gap-3 p-3.5 rounded-xl border transition-colors',
                            isChecked
                              ? item.isUrgent
                                ? 'border-rose-500/50 bg-rose-500/10'
                                : 'border-primary/50 bg-primary/10'
                              : 'border-border/70 hover:bg-muted/40'
                          )}
                        >
                          <Checkbox
                            id={`sym-${item.id}`}
                            checked={isChecked}
                            onChange={() => toggleSymptom(item.id as WarningSymptom)}
                          />
                          <label
                            htmlFor={`sym-${item.id}`}
                            className={cn(
                              'text-xs sm:text-sm font-medium cursor-pointer flex-1',
                              item.isUrgent && 'text-rose-700 dark:text-rose-400 font-semibold'
                            )}
                          >
                            {item.label}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                  {errors.symptoms && (
                    <p className="text-xs text-destructive">{errors.symptoms}</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="size-4 mr-2" />
                  <span>{t.buttons.back}</span>
                </Button>
                <Button size="lg" onClick={handleNext} className="font-semibold">
                  <span>{t.buttons.submit}</span>
                  <CheckCircle2 className="size-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* STEP 6: Result Presentation & Clinical Guidance */}
          {step === 6 && result && (
            <div className="space-y-6 animate-in fade-in duration-300 print:space-y-4">
              {/* Results Header */}
              <div className="text-center space-y-2 pb-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary border border-primary/20">
                  <Activity className="size-3.5" />
                  <span>{t.steps.results.title}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {isBn ? 'আপনার ফুসফুস স্বাস্থ্য ফলাফল' : 'Your Lung Health Assessment'}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t.steps.results.subtitle.replace(
                    '{date}',
                    new Date(result.completedAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  )}
                </p>
              </div>

              {/* 1. MANDATORY SYMPTOM SAFETY OVERRIDE BANNER (TOP PRIORITY) */}
              {result.hasUrgentSymptoms ? (
                <div className="rounded-2xl border-2 border-rose-500 bg-rose-500/10 p-5 sm:p-6 shadow-sm space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="size-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                    <div className="space-y-1">
                      <h2 className="text-base sm:text-lg font-bold text-rose-700 dark:text-rose-300">
                        {t.steps.results.urgentBannerTitle}
                      </h2>
                      <p className="text-xs sm:text-sm text-rose-700/90 dark:text-rose-300/90 leading-relaxed">
                        {t.steps.results.urgentBannerText}
                      </p>
                    </div>
                  </div>
                </div>
              ) : result.symptomUrgency === 'non_urgent_symptoms' ? (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 shadow-xs space-y-2">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                        {t.steps.results.nonUrgentBannerTitle}
                      </h2>
                      <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                        {t.steps.results.nonUrgentBannerText}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* 2. Evaluated Risk Profile Card */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t.steps.results.riskProfileHeading}
                    </span>
                    <Badge
                      variant="default"
                      className={cn(
                        'text-xs px-2.5 py-0.5 font-semibold',
                        result.calculatedRiskCategory === 'elevated_screening_candidate'
                          ? 'bg-rose-500 text-white'
                          : result.calculatedRiskCategory === 'moderate_risk_factors'
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600 text-white'
                      )}
                    >
                      {result.calculatedRiskCategory === 'elevated_screening_candidate'
                        ? t.steps.results.elevatedTitle
                        : result.calculatedRiskCategory === 'moderate_risk_factors'
                          ? t.steps.results.moderateTitle
                          : t.steps.results.baselineTitle}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-foreground pt-1">
                    {result.calculatedRiskCategory === 'elevated_screening_candidate'
                      ? t.steps.results.elevatedTitle
                      : result.calculatedRiskCategory === 'moderate_risk_factors'
                        ? t.steps.results.moderateTitle
                        : t.steps.results.baselineTitle}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm leading-relaxed">
                    {result.calculatedRiskCategory === 'elevated_screening_candidate'
                      ? t.steps.results.elevatedDesc
                      : result.calculatedRiskCategory === 'moderate_risk_factors'
                        ? t.steps.results.moderateDesc
                        : t.steps.results.baselineDesc}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-1">
                  {/* Cumulative Smoking Metric */}
                  {result.packYears > 0 && (
                    <div className="rounded-xl bg-muted/40 border border-muted p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Cigarette className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-foreground">
                          {t.steps.results.packYearsSummary.replace(
                            '{value}',
                            result.packYears.toString()
                          )}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {t.steps.smoking.packYearsUnit}
                      </span>
                    </div>
                  )}

                  {/* LDCT Screening Eligibility (USPSTF 2021) */}
                  <div
                    className={cn(
                      'rounded-xl p-4 border space-y-2',
                      result.isScreeningEligibleAgeAndSmoking
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-muted/20 border-border/70'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2">
                        <Stethoscope className="size-4 text-primary shrink-0" />
                        {t.steps.results.screeningSectionTitle}
                      </h3>
                      <Badge
                        variant="default"
                        className={cn(
                          'text-[10px] sm:text-xs',
                          result.isScreeningEligibleAgeAndSmoking
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {result.isScreeningEligibleAgeAndSmoking
                          ? t.steps.results.screeningEligibleBadge
                          : t.steps.results.screeningNotEligibleBadge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {result.isScreeningEligibleAgeAndSmoking
                        ? t.steps.results.screeningEligibleText
                        : t.steps.results.screeningNotEligibleText}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Identified Risk Factors */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    {t.steps.results.identifiedFactorsTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(isBn ? result.identifiedRiskFactorsBn : result.identifiedRiskFactorsEn)
                    .length > 0 ? (
                    <ul className="space-y-2">
                      {(isBn ? result.identifiedRiskFactorsBn : result.identifiedRiskFactorsEn).map(
                        (factor, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground"
                          >
                            <span className="size-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            <span>{factor}</span>
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-xs sm:text-sm text-muted-foreground italic">
                      {t.steps.results.noneIdentified}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* 4. Actionable Next Steps */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                    <HeartPulse className="size-4 text-primary" />
                    {t.steps.results.nextStepsTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {(isBn ? result.recommendedNextStepsBn : result.recommendedNextStepsEn).map(
                      (stepText, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-xs sm:text-sm text-foreground bg-muted/20 p-3 rounded-xl border border-border/50"
                        >
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{stepText}</span>
                        </li>
                      )
                    )}
                  </ol>
                </CardContent>
              </Card>

              {/* 5. Non-Diagnostic Medical Disclaimer */}
              <div className="rounded-xl border border-muted bg-muted/30 p-4 space-y-1.5">
                <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <ShieldAlert className="size-3.5 text-muted-foreground" />
                  {t.steps.results.disclaimerTitle}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isBn ? result.disclaimerBn : result.disclaimerEn}
                </p>
              </div>

              {/* 6. Preservation Note & Interactive Controls */}
              <div className="print:hidden rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t.steps.results.saveHeading}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t.steps.results.saveText}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handlePrint}
                    className="font-medium"
                  >
                    <Printer className="size-4 mr-2" />
                    <span>{t.buttons.print}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetake}
                  >
                    <RotateCcw className="size-4 mr-2" />
                    <span>{t.buttons.retake}</span>
                  </Button>

                  <Link
                    href="/library"
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    <BookOpen className="size-4 mr-2 text-primary" />
                    <span>{t.buttons.exploreLibrary}</span>
                  </Link>

                  <Link
                    href="/register"
                    className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'text-primary' })}
                  >
                    <UserCheck className="size-4 mr-2" />
                    <span>{t.buttons.createAccount}</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </SectionContainer>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>

      {/* Exit Confirmation Dialog */}
      <ConfirmDialog
        open={confirmExitOpen}
        onClose={() => setConfirmExitOpen(false)}
        onConfirm={() => {
          setConfirmExitOpen(false)
          router.push('/')
        }}
        title={t.buttons.exit}
        description={t.buttons.confirmExit}
        confirmText={t.buttons.exit}
        cancelText={t.buttons.stay}
        variant="warning"
      />
    </div>
  )
}
