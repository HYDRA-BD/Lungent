'use client'

/**
 * Phase 1.14: Structured Symptom Assessment Questionnaire Component
 * Supports Patient Self-Reporting and Healthcare Worker-Assisted Data Collection.
 */

import React, { useState } from 'react'
import {
  AlertTriangle,
  Stethoscope,
  Activity,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
} from 'lucide-react'
import { useLanguage } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PatientSymptomIntakePayload, SymptomPresenceStatus } from '../types'

interface SymptomQuestionnaireProps {
  initialPayload?: Partial<PatientSymptomIntakePayload>
  onSubmit: (payload: PatientSymptomIntakePayload) => void
  isSubmitting?: boolean
  isHealthcareWorker?: boolean
  patientName?: string
}

export function SymptomQuestionnaire({
  initialPayload = {},
  onSubmit,
  isSubmitting = false,
  patientName,
}: SymptomQuestionnaireProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Section 1: Respiratory
  const [coughStatus, setCoughStatus] = useState<SymptomPresenceStatus>(initialPayload.cough?.status || 'not_reported')
  const [coughDuration, setCoughDuration] = useState<number>(initialPayload.cough?.durationWeeks || 0)
  const [coughChanges, setCoughChanges] = useState<boolean>(initialPayload.coughChanges?.status === 'present')
  const [hemoptysisStatus, setHemoptysisStatus] = useState<SymptomPresenceStatus>(initialPayload.hemoptysis?.status || 'not_reported')
  const [hemoptysisMassive, setHemoptysisMassive] = useState<boolean>(initialPayload.hemoptysis?.isMassive || false)
  const [hemoptysisDuration, setHemoptysisDuration] = useState<number>(initialPayload.hemoptysis?.durationWeeks || 0)
  const [dyspneaStatus, setDyspneaStatus] = useState<SymptomPresenceStatus>(initialPayload.dyspnea?.status || 'not_reported')
  const [dyspneamMRC, setDyspneamMRC] = useState<number>(initialPayload.dyspnea?.mMRCGrade || 0)
  const [stridorStatus, setStridorStatus] = useState<SymptomPresenceStatus>(initialPayload.stridor?.status || 'absent')
  const [hoarsenessStatus, setHoarsenessStatus] = useState<SymptomPresenceStatus>(initialPayload.hoarseness?.status || 'absent')
  const [hoarsenessDuration, setHoarsenessDuration] = useState<number>(initialPayload.hoarseness?.durationWeeks || 0)

  // Section 2: Constitutional
  const [weightLossStatus, setWeightLossStatus] = useState<SymptomPresenceStatus>(initialPayload.unexplainedWeightLoss?.status || 'not_reported')
  const [weightLossPct, setWeightLossPct] = useState<number>(initialPayload.unexplainedWeightLoss?.percentageLoss || 0)
  const [appetiteLossStatus, setAppetiteLossStatus] = useState<SymptomPresenceStatus>(initialPayload.appetiteLoss?.status || 'absent')
  const [fatigueStatus, setFatigueStatus] = useState<SymptomPresenceStatus>(initialPayload.fatigue?.status || 'absent')
  const [nightSweatsStatus] = useState<SymptomPresenceStatus>(initialPayload.nightSweats?.status || 'absent')

  // Section 3: Physical signs (especially for HW / clinician)
  const [lymphadenopathyStatus, setLymphadenopathyStatus] = useState<SymptomPresenceStatus>(initialPayload.cervicalLymphadenopathy?.status || 'absent')
  const [clubbingStatus, setClubbingStatus] = useState<SymptomPresenceStatus>(initialPayload.fingerClubbing?.status || 'absent')
  const [svcoStatus, setSvcoStatus] = useState<SymptomPresenceStatus>(initialPayload.svcoSigns?.status || 'absent')

  const handleFinish = () => {
    const payload: PatientSymptomIntakePayload = {
      cough: {
        status: coughStatus,
        durationWeeks: coughDuration,
        isPersistent: coughDuration >= 3,
      },
      coughChanges: {
        status: coughChanges ? 'present' : 'absent',
      },
      hemoptysis: {
        status: hemoptysisStatus,
        durationWeeks: hemoptysisDuration,
        isMassive: hemoptysisMassive,
      },
      dyspnea: {
        status: dyspneaStatus,
        mMRCGrade: dyspneamMRC,
      },
      stridor: {
        status: stridorStatus,
      },
      hoarseness: {
        status: hoarsenessStatus,
        durationWeeks: hoarsenessDuration,
      },
      unexplainedWeightLoss: {
        status: weightLossStatus,
        percentageLoss: weightLossPct,
      },
      appetiteLoss: {
        status: appetiteLossStatus,
      },
      fatigue: {
        status: fatigueStatus,
      },
      nightSweats: {
        status: nightSweatsStatus,
      },
      cervicalLymphadenopathy: {
        status: lymphadenopathyStatus,
      },
      fingerClubbing: {
        status: clubbingStatus,
      },
      svcoSigns: {
        status: svcoStatus,
      },
    }

    onSubmit(payload)
  }

  return (
    <div className="space-y-6">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Badge variant={step === 1 ? 'default' : 'outline'} className="size-6 rounded-full p-0 flex items-center justify-center text-xs">
            1
          </Badge>
          <span className={`text-xs font-semibold ${step === 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
            {isBn ? 'শ্বাসতন্ত্রের লক্ষণ' : 'Respiratory Symptoms'}
          </span>
          <ChevronRight className="size-3 text-muted-foreground" />

          <Badge variant={step === 2 ? 'default' : 'outline'} className="size-6 rounded-full p-0 flex items-center justify-center text-xs">
            2
          </Badge>
          <span className={`text-xs font-semibold ${step === 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
            {isBn ? 'শারীরিক ও অন্যান্য লক্ষণ' : 'Constitutional Symptoms'}
          </span>
          <ChevronRight className="size-3 text-muted-foreground" />

          <Badge variant={step === 3 ? 'default' : 'outline'} className="size-6 rounded-full p-0 flex items-center justify-center text-xs">
            3
          </Badge>
          <span className={`text-xs font-semibold ${step === 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
            {isBn ? 'পর্যালোচনা ও নিশ্চিতকরণ' : 'Review & Submit'}
          </span>
        </div>

        {patientName && (
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {isBn ? 'রোগী:' : 'Patient:'} <strong className="text-foreground">{patientName}</strong>
          </span>
        )}
      </div>

      {/* STEP 1: Respiratory Symptoms */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="rounded-lg border border-border bg-muted/10 p-3 text-xs text-muted-foreground leading-relaxed">
            <Info className="size-4 inline text-primary mr-1 -mt-0.5" />
            {isBn
              ? 'অনুগ্রহ করে গত কয়েক সপ্তাহে অনুভূত সকল শ্বাসতন্ত্রের লক্ষণ সঠিকভাবে চিহ্নিত করুন। উত্তর না দেওয়া থাকলে তা অনুপস্থিত বিবেচনা করা হবে না।'
              : 'Please accurately record all respiratory symptoms. Unanswered questions are preserved as unverified rather than assumed negative.'}
          </div>

          {/* Hemoptysis Question (Red Flag) */}
          <Card className={`border ${hemoptysisStatus === 'present' ? 'border-destructive/60 bg-destructive/5' : 'border-border'}`}>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertTriangle className="size-4 text-destructive" />
                  {isBn ? '১. কাশিতে রক্ত বা রক্তমিশ্রিত কফ (Hemoptysis)' : '1. Coughing up Blood (Hemoptysis)'}
                </CardTitle>
                <Badge variant="destructive" className="text-[10px]">RED FLAG</Badge>
              </div>
              <CardDescription className="text-xs">
                {isBn ? 'কাশির সাথে তাজা রক্ত বা লালচে কফ নির্গত হয় কি না।' : 'Coughing up fresh blood, blood clots, or blood-streaked sputum.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {(['present', 'absent', 'unknown'] as SymptomPresenceStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setHemoptysisStatus(st)}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      hemoptysisStatus === st
                        ? st === 'present'
                          ? 'border-destructive bg-destructive text-destructive-foreground'
                          : 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card hover:bg-muted/40'
                    }`}
                  >
                    {st === 'present' ? (isBn ? 'হ্যাঁ (উপস্থিত)' : 'Yes (Present)') : st === 'absent' ? (isBn ? 'না (অনুপস্থিত)' : 'No (Absent)') : (isBn ? 'অজানা / নিশ্চিত নয়' : 'Unknown')}
                  </button>
                ))}
              </div>

              {hemoptysisStatus === 'present' && (
                <div className="space-y-3 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">
                      {isBn ? 'রক্তের পরিমাণ অনেক বেশি (>১০০ মিলি)?' : 'Massive blood loss (>100 mL in 24 hours)?'}
                    </label>
                    <input
                      type="checkbox"
                      checked={hemoptysisMassive}
                      onChange={(e) => setHemoptysisMassive(e.target.checked)}
                      className="size-4 rounded text-destructive focus:ring-destructive"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      {isBn ? 'কত সপ্তাহ ধরে চলছে?' : 'Duration in weeks:'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={52}
                      value={hemoptysisDuration}
                      onChange={(e) => setHemoptysisDuration(Number(e.target.value))}
                      className="w-32 rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cough Question */}
          <Card className="border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">
                {isBn ? '২. দীর্ঘস্থায়ী কাশি (Persistent Cough)' : '2. Persistent or Changing Cough'}
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn ? 'নতুন বা পূর্বে থাকা কাশির কোনো তীব্রতা বা পরিবর্তন।' : 'A new continuous cough or a noticeable change in an existing chronic smoker cough.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {(['present', 'absent', 'unknown'] as SymptomPresenceStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setCoughStatus(st)}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      coughStatus === st
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card hover:bg-muted/40'
                    }`}
                  >
                    {st === 'present' ? (isBn ? 'হ্যাঁ (কাশি আছে)' : 'Yes (Present)') : st === 'absent' ? (isBn ? 'না' : 'No') : (isBn ? 'অজানা' : 'Unknown')}
                  </button>
                ))}
              </div>

              {coughStatus === 'present' && (
                <div className="space-y-3 pt-2 border-t border-border/60">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      {isBn ? 'কাশির স্থায়িত্ব (সপ্তাহ):' : 'Duration of cough (weeks):'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={104}
                      value={coughDuration}
                      onChange={(e) => setCoughDuration(Number(e.target.value))}
                      className="w-32 rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                    />
                    {coughDuration >= 3 && (
                      <span className="text-[11px] text-amber-600 block mt-1">
                        ⚠️ {isBn ? '৩ সপ্তাহের বেশি স্থায়ী কাশি প্রোটোকল অনুযায়ী পর্যালোচনার যোগ্য।' : 'Cough >3 weeks meets clinical triage threshold.'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="coughChangesCheck"
                      checked={coughChanges}
                      onChange={(e) => setCoughChanges(e.target.checked)}
                      className="size-4 rounded text-primary focus:ring-primary"
                    />
                    <label htmlFor="coughChangesCheck" className="text-xs text-foreground cursor-pointer">
                      {isBn ? 'পূর্বের কাশির বৈশিষ্ট্যে উল্লেখযোগ্য পরিবর্তন এসেছে' : 'Noticeable change in sound, character, or timing of cough'}
                    </label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shortness of Breath (Dyspnea) */}
          <Card className="border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">
                {isBn ? '৩. শ্বাসকষ্ট (Shortness of Breath)' : '3. Shortness of Breath (Dyspnea)'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {(['present', 'absent', 'unknown'] as SymptomPresenceStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setDyspneaStatus(st)}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      dyspneaStatus === st
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card hover:bg-muted/40'
                    }`}
                  >
                    {st === 'present' ? (isBn ? 'হ্যাঁ' : 'Yes') : st === 'absent' ? (isBn ? 'না' : 'No') : (isBn ? 'অজানা' : 'Unknown')}
                  </button>
                ))}
              </div>

              {dyspneaStatus === 'present' && (
                <div className="pt-2 border-t border-border/60">
                  <label className="text-xs font-medium text-foreground block mb-1">
                    {isBn ? 'শ্বাসকষ্টের তীব্রতা (mMRC স্কেল ০-৪):' : 'mMRC Dyspnea Grade (0 to 4):'}
                  </label>
                  <select
                    value={dyspneamMRC}
                    onChange={(e) => setDyspneamMRC(Number(e.target.value))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                  >
                    <option value={0}>Grade 0: Only with strenuous exercise</option>
                    <option value={1}>Grade 1: When hurrying on level ground or slight hill</option>
                    <option value={2}>Grade 2: Walks slower than contemporaries or stops for breath</option>
                    <option value={3}>Grade 3: Stops for breath after walking ~100 meters</option>
                    <option value={4}>Grade 4: Too breathless to leave house or breathless dressing</option>
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Airway Stridor & Hoarseness */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>{isBn ? '৪. স্ট্রাইডোর (উচ্চমাত্রার শব্দ)' : '4. Stridor (Wheezing on Inhaling)'}</span>
                  <Badge variant="destructive" className="text-[9px]">EMERGENCY</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStridorStatus('present')}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-medium ${stridorStatus === 'present' ? 'border-destructive bg-destructive text-destructive-foreground' : 'border-border'}`}
                  >
                    {isBn ? 'উপস্থিত' : 'Present'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStridorStatus('absent')}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-medium ${stridorStatus === 'absent' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}
                  >
                    {isBn ? 'অনুপস্থিত' : 'Absent'}
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold">
                  {isBn ? '৫. কণ্ঠস্বরের স্থায়ী পরিবর্তন (Hoarseness)' : '5. Persistent Hoarseness'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setHoarsenessStatus('present')}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-medium ${hoarsenessStatus === 'present' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}
                  >
                    {isBn ? 'উপস্থিত' : 'Present'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setHoarsenessStatus('absent')}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-medium ${hoarsenessStatus === 'absent' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}
                  >
                    {isBn ? 'অনুপস্থিত' : 'Absent'}
                  </button>
                </div>
                {hoarsenessStatus === 'present' && (
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-0.5">Duration (weeks):</label>
                    <input
                      type="number"
                      min={0}
                      value={hoarsenessDuration}
                      onChange={(e) => setHoarsenessDuration(Number(e.target.value))}
                      className="w-full rounded border border-input bg-background px-2 py-1 text-xs"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={() => setStep(2)} className="gap-2">
              {isBn ? 'পরবর্তী ধাপ' : 'Next Step: Constitutional Symptoms'}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Constitutional Symptoms & Physical Findings */}
      {step === 2 && (
        <div className="space-y-5">
          {/* Unexplained Weight Loss */}
          <Card className={`border ${weightLossStatus === 'present' ? 'border-destructive/60 bg-destructive/5' : 'border-border'}`}>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertTriangle className="size-4 text-destructive" />
                  {isBn ? '১. অকারণ দ্রুত ওজন হ্রাস (Unexplained Weight Loss)' : '1. Unexplained Weight Loss'}
                </CardTitle>
                <Badge variant="destructive" className="text-[10px]">RED FLAG</Badge>
              </div>
              <CardDescription className="text-xs">
                {isBn ? 'ডায়েট বা ইচ্ছাকৃত চেষ্টা ব্যতীত গত ৩-৬ মাসে শরীরের উল্লেখযোগ্য ওজন হ্রাস।' : 'Significant body weight drop (>10%) without intentional dieting in past 3–6 months.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {(['present', 'absent', 'unknown'] as SymptomPresenceStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setWeightLossStatus(st)}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      weightLossStatus === st
                        ? st === 'present'
                          ? 'border-destructive bg-destructive text-destructive-foreground'
                          : 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card hover:bg-muted/40'
                    }`}
                  >
                    {st === 'present' ? (isBn ? 'হ্যাঁ (ওজন কমেছে)' : 'Yes') : st === 'absent' ? (isBn ? 'না' : 'No') : (isBn ? 'অজানা' : 'Unknown')}
                  </button>
                ))}
              </div>

              {weightLossStatus === 'present' && (
                <div className="pt-2 border-t border-border/60">
                  <label className="text-xs font-medium text-foreground block mb-1">
                    {isBn ? 'আনুমানিক শতকরা কত শতাংশ ওজন কমেছে?' : 'Estimated percentage of weight lost (%):'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={weightLossPct}
                    onChange={(e) => setWeightLossPct(Number(e.target.value))}
                    className="w-32 rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                  />
                  <span className="text-[11px] text-muted-foreground block mt-1">
                    {isBn ? '১০% বা তার বেশি ওজন হ্রাস ক্লিনিক্যাল নির্দেশিকা অনুসারে উচ্চ ঝুঁকির লক্ষণ।' : '≥10% loss is a primary constitutional malignancy red-flag.'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appetite Loss & Fatigue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold">
                  {isBn ? '২. ক্ষুধামন্দা (Reduced Appetite)' : '2. Reduced Appetite / Anorexia'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAppetiteLossStatus('present')}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-medium ${appetiteLossStatus === 'present' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}
                  >
                    {isBn ? 'উপস্থিত' : 'Present'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppetiteLossStatus('absent')}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-medium ${appetiteLossStatus === 'absent' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}
                  >
                    {isBn ? 'অনুপস্থিত' : 'Absent'}
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold">
                  {isBn ? '৩. স্থায়ী ক্লান্তি (Persistent Fatigue)' : '3. Persistent Severe Fatigue'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFatigueStatus('present')}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-medium ${fatigueStatus === 'present' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}
                  >
                    {isBn ? 'উপস্থিত' : 'Present'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFatigueStatus('absent')}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-medium ${fatigueStatus === 'absent' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}
                  >
                    {isBn ? 'অনুপস্থিত' : 'Absent'}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Objective Clinical Examination Findings */}
          <Card className="border-border">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Stethoscope className="size-4 text-primary" />
                {isBn ? '৪. শারীরিক পর্যবেক্ষণ ও লক্ষণ (Physical Findings)' : '4. Physical Examination Signs'}
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn ? 'স্বাস্থ্যকর্মী বা চিকিৎসকের দ্বারা চিহ্নিত লক্ষণসমূহ।' : 'Signs observed by healthcare worker or reported during clinical evaluation.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-border p-3 space-y-1">
                  <span className="text-xs font-semibold block">{isBn ? 'গলার লসিকা গ্রন্থি স্ফীতি' : 'Cervical Lymph Nodes'}</span>
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setLymphadenopathyStatus('present')}
                      className={`flex-1 py-1 px-2 rounded border text-[11px] font-medium ${lymphadenopathyStatus === 'present' ? 'border-destructive bg-destructive text-destructive-foreground' : 'border-border'}`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setLymphadenopathyStatus('absent')}
                      className={`flex-1 py-1 px-2 rounded border text-[11px] font-medium ${lymphadenopathyStatus === 'absent' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}
                    >
                      Absent
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-3 space-y-1">
                  <span className="text-xs font-semibold block">{isBn ? 'আঙুলের ক্লাব বা ফোলা' : 'Digital Clubbing'}</span>
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setClubbingStatus('present')}
                      className={`flex-1 py-1 px-2 rounded border text-[11px] font-medium ${clubbingStatus === 'present' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setClubbingStatus('absent')}
                      className={`flex-1 py-1 px-2 rounded border text-[11px] font-medium ${clubbingStatus === 'absent' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}
                    >
                      Absent
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-3 space-y-1">
                  <span className="text-xs font-semibold block">{isBn ? 'মুখমণ্ডল স্ফীতি (SVCO)' : 'SVCO Signs'}</span>
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setSvcoStatus('present')}
                      className={`flex-1 py-1 px-2 rounded border text-[11px] font-medium ${svcoStatus === 'present' ? 'border-destructive bg-destructive text-destructive-foreground' : 'border-border'}`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setSvcoStatus('absent')}
                      className={`flex-1 py-1 px-2 rounded border text-[11px] font-medium ${svcoStatus === 'absent' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
              <ChevronLeft className="size-4" />
              {isBn ? 'পূর্ববর্তী' : 'Back'}
            </Button>
            <Button onClick={() => setStep(3)} className="gap-2">
              {isBn ? 'পর্যালোচনা' : 'Review Summary'}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Submit */}
      {step === 3 && (
        <div className="space-y-5">
          <Card className="border-border">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CheckCircle2 className="size-5 text-teal-600" />
                {isBn ? 'লক্ষণ সংক্ষেপ পর্যালোচনা' : 'Symptom Intake Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2.5 rounded border border-border bg-muted/20">
                  <span className="font-semibold text-foreground block">Hemoptysis (Coughing blood):</span>
                  <span className={hemoptysisStatus === 'present' ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                    {hemoptysisStatus.toUpperCase()} {hemoptysisStatus === 'present' ? `(${hemoptysisDuration} wks${hemoptysisMassive ? ', Massive' : ''})` : ''}
                  </span>
                </div>

                <div className="p-2.5 rounded border border-border bg-muted/20">
                  <span className="font-semibold text-foreground block">Persistent Cough:</span>
                  <span className={coughDuration >= 3 ? 'text-amber-600 font-bold' : 'text-muted-foreground'}>
                    {coughStatus.toUpperCase()} ({coughDuration} weeks, Changes: {coughChanges ? 'Yes' : 'No'})
                  </span>
                </div>

                <div className="p-2.5 rounded border border-border bg-muted/20">
                  <span className="font-semibold text-foreground block">Unexplained Weight Loss:</span>
                  <span className={weightLossStatus === 'present' ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                    {weightLossStatus.toUpperCase()} {weightLossStatus === 'present' ? `(${weightLossPct}% drop)` : ''}
                  </span>
                </div>

                <div className="p-2.5 rounded border border-border bg-muted/20">
                  <span className="font-semibold text-foreground block">Dyspnea / Stridor:</span>
                  <span className="text-muted-foreground">
                    Dyspnea: {dyspneaStatus} (mMRC: {dyspneamMRC}), Stridor: {stridorStatus}
                  </span>
                </div>
              </div>

              {/* Clinical Disclaimers */}
              <div className="rounded-lg border border-amber-300 bg-amber-50/70 p-3 text-amber-900 text-[11px] leading-relaxed dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                <span className="font-bold block mb-1">
                  ⚠️ {isBn ? 'ক্লিনিক্যাল নোটিশ ও সুরক্ষা শর্তাবলী:' : 'Clinical Governance Notice:'}
                </span>
                {isBn
                  ? 'এই লক্ষণভিত্তিক ট্রায়াজ কোনো ক্যান্সার রোগ নির্ণয় নয়। এটি শুধুমাত্র জরুরি শারীরিক অবস্থা বা চিকিৎসকের বিশেষ মনোযোগের প্রয়োজনীয়তা নির্ধারণের জন্য পরিচালিত হয়।'
                  : 'Symptom-based triage is NOT a cancer diagnosis. It operates solely to identify red-flag conditions requiring prompt or emergency clinical attention.'}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2" disabled={isSubmitting}>
              <ChevronLeft className="size-4" />
              {isBn ? 'পরিবর্তন করুন' : 'Edit Responses'}
            </Button>
            <Button onClick={handleFinish} disabled={isSubmitting} className="gap-2">
              <Activity className="size-4" />
              {isSubmitting
                ? isBn ? 'মূল্যায়ন করা হচ্ছে...' : 'Evaluating Triage...'
                : isBn ? 'ট্রায়াজ মূল্যায়ন সম্পাদন করুন' : 'Execute Symptom Triage'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
