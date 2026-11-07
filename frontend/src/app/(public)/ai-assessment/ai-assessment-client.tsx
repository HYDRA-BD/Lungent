'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowUp,
  Brain,
  CheckCircle2,
  Download,
  FileText,
  HeartPulse,
  Info,
  Loader2,
  MapPin,
  RefreshCw,
  Scale,
  Shield,
  ShieldAlert,
  Stethoscope,
  User,
  Wind,
} from 'lucide-react'
import { analyzePatient, downloadReport, type AnalyzeResponse, type PatientInput } from '@/lib/backend-api'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'
import { SectionContainer } from '@/components/layouts/section-container'

// ── Types ────────────────────────────────────────────────────────────
interface FormData {
  age: number
  sex: number
  weightKg: number
  heightCm: number
  bmi: number
  packYears: number
  packsPerDay: number
  yearsSmoked: number
  respBurden: boolean
  asthma: boolean
  copd: boolean
  chronicBurden: boolean
  heartAttack: boolean
  chd: boolean
  stroke: boolean
  diabetes: boolean
  lowAccess: boolean
  state: string
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina',
  'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
]

const TIER_CONFIG = {
  'REFER': {
    label: 'HIGH RISK — REFER',
    sublabel: 'Immediate LDCT evaluation recommended',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900/60',
    icon: ShieldAlert,
    barColor: 'bg-red-500',
  },
  'REVIEW': {
    label: 'MODERATE RISK — REVIEW',
    sublabel: 'Clinical shared decision-making advised',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-900/60',
    icon: AlertTriangle,
    barColor: 'bg-amber-500',
  },
  'RULE-OUT': {
    label: 'LOW RISK — RULE-OUT',
    sublabel: 'Routine primary care monitoring',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900/60',
    icon: CheckCircle2,
    barColor: 'bg-emerald-500',
  },
}

function RiskGauge({ score, tier }: { score: number; tier: string }) {
  const pct = Math.min(100, Math.max(0, score * 100))
  const cfg = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] ?? TIER_CONFIG['REVIEW']
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Risk Score</span>
        <span className={`font-bold text-sm ${cfg.color}`}>{(score * 100).toFixed(2)}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${cfg.barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Lower Risk</span>
        <span>Higher Risk</span>
      </div>
    </div>
  )
}

function ShapChart({ items }: { items: Array<{ feature: string; label: string; value?: number; shap_value?: number; impact?: number; direction: string }> }) {
  if (!items?.length) return null
  const getItemVal = (i: { value?: number; shap_value?: number; impact?: number }) =>
    typeof i.value === 'number' ? i.value : typeof i.shap_value === 'number' ? i.shap_value : (i.impact ?? 0)
  const max = Math.max(...items.map(i => Math.abs(getItemVal(i))), 0.001)
  return (
    <div className="space-y-2">
      {items.slice(0, 7).map((item, i) => {
        const val = getItemVal(item)
        const pct = (Math.abs(val) / max) * 100
        const isIncrease = item.direction === 'increases' || item.direction === 'risk' || val > 0
        return (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-32 truncate text-muted-foreground shrink-0 text-right">{item.label || item.feature}</span>
            <div className="flex-1 relative h-5 flex items-center">
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${isIncrease ? 'bg-red-400' : 'bg-emerald-400'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <span className={`w-12 text-right font-medium shrink-0 ${isIncrease ? 'text-red-600' : 'text-emerald-600'}`}>
              {isIncrease ? '+' : '−'}{(Math.abs(val) * 100).toFixed(1)}%
            </span>
          </div>
        )
      })}
      <p className="text-[10px] text-muted-foreground pt-1">
        Red bars increase risk contribution · Green bars decrease risk contribution
      </p>
    </div>
  )
}

export function AIAssessmentClient() {
  // Unit Toggles State
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm')

  // Controlled input states for real-time conversion & direct typing
  const [weightInput, setWeightInput] = useState<number | string>(75)
  const [heightCmInput, setHeightCmInput] = useState<number | string>(172)
  const [heightFeetInput, setHeightFeetInput] = useState<number | string>(5)
  const [heightInchesInput, setHeightInchesInput] = useState<number | string>(8)

  const [form, setForm] = useState<FormData>({
    age: 55,
    sex: 1,
    weightKg: 75.0,
    heightCm: 172,
    bmi: 25.4,
    packYears: 20,
    packsPerDay: 1,
    yearsSmoked: 20,
    respBurden: false,
    asthma: false,
    copd: false,
    chronicBurden: false,
    heartAttack: false,
    chd: false,
    stroke: false,
    diabetes: false,
    lowAccess: false,
    state: 'Ohio',
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  // Smooth scroll down to result when ready
  useEffect(() => {
    if (result && resultRef.current) {
      const timer = setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [result])

  // 1. Dynamic Metric Conversions for Weight & Height
  const currentWeightKg = useMemo(() => {
    const raw = typeof weightInput === 'number' ? weightInput : parseFloat(String(weightInput))
    const val = isNaN(raw) ? 0 : raw
    if (weightUnit === 'lbs') {
      return val * 0.45359237
    }
    return val
  }, [weightInput, weightUnit])

  const currentHeightM = useMemo(() => {
    if (heightUnit === 'ft') {
      const rawFt = typeof heightFeetInput === 'number' ? heightFeetInput : parseFloat(String(heightFeetInput))
      const rawIn = typeof heightInchesInput === 'number' ? heightInchesInput : parseFloat(String(heightInchesInput))
      const ft = isNaN(rawFt) ? 0 : rawFt
      const inch = isNaN(rawIn) ? 0 : rawIn
      const totalInches = ft * 12 + inch
      return (totalInches * 2.54) / 100
    }
    const rawCm = typeof heightCmInput === 'number' ? heightCmInput : parseFloat(String(heightCmInput))
    const cm = isNaN(rawCm) ? 0 : rawCm
    return cm / 100
  }, [heightCmInput, heightFeetInput, heightInchesInput, heightUnit])

  // 2. Real-Time Dynamic BMI: BMI = Weight (kg) / (Height (m))^2
  const calculatedBmi = useMemo(() => {
    if (currentWeightKg <= 0 || currentHeightM <= 0) return 25.0
    const rawBmi = currentWeightKg / (currentHeightM * currentHeightM)
    return Math.round(rawBmi * 10) / 10
  }, [currentWeightKg, currentHeightM])

  // 3. Real-Time Dynamic Pack-Years: Pack-Years = Packs per day * Years smoked
  const calculatedPackYears = useMemo(() => {
    const ppd = Math.max(0, form.packsPerDay || 0)
    const yrs = Math.max(0, form.yearsSmoked || 0)
    return Math.round(ppd * yrs * 10) / 10
  }, [form.packsPerDay, form.yearsSmoked])

  // Synchronize dynamic calculations into form state
  useEffect(() => {
    setForm(prev => {
      const newWeightKg = Math.round(currentWeightKg * 10) / 10
      const newHeightCm = Math.round(currentHeightM * 100)
      if (
        prev.weightKg === newWeightKg &&
        prev.heightCm === newHeightCm &&
        prev.bmi === calculatedBmi &&
        prev.packYears === calculatedPackYears
      ) {
        return prev
      }
      return {
        ...prev,
        weightKg: newWeightKg,
        heightCm: newHeightCm,
        bmi: calculatedBmi,
        packYears: calculatedPackYears,
      }
    })
  }, [currentWeightKg, currentHeightM, calculatedBmi, calculatedPackYears])

  // Unit switch handlers with instant value conversion
  function handleWeightUnitChange(newUnit: 'kg' | 'lbs') {
    if (newUnit === weightUnit) return
    const raw = typeof weightInput === 'number' ? weightInput : parseFloat(String(weightInput))
    const currentNum = isNaN(raw) ? 75 : raw
    if (newUnit === 'lbs') {
      const inLbs = Math.round(currentNum * 2.2046226 * 10) / 10
      setWeightInput(inLbs)
    } else {
      const inKg = Math.round((currentNum / 2.2046226) * 10) / 10
      setWeightInput(inKg)
    }
    setWeightUnit(newUnit)
  }

  function handleHeightUnitChange(newUnit: 'cm' | 'ft') {
    if (newUnit === heightUnit) return
    if (newUnit === 'ft') {
      const rawCm = typeof heightCmInput === 'number' ? heightCmInput : parseFloat(String(heightCmInput))
      const cm = isNaN(rawCm) ? 172 : rawCm
      const totalInches = Math.round(cm / 2.54)
      setHeightFeetInput(Math.floor(totalInches / 12))
      setHeightInchesInput(totalInches % 12)
    } else {
      const rawFt = typeof heightFeetInput === 'number' ? heightFeetInput : parseFloat(String(heightFeetInput))
      const rawIn = typeof heightInchesInput === 'number' ? heightInchesInput : parseFloat(String(heightInchesInput))
      const ft = isNaN(rawFt) ? 5 : rawFt
      const inch = isNaN(rawIn) ? 8 : rawIn
      const cm = Math.round((ft * 12 + inch) * 2.54)
      setHeightCmInput(cm)
    }
    setHeightUnit(newUnit)
  }

  // BMI Category & Visual Positioning (15 to 40 Scale)
  const bmiCategory = useMemo(() => {
    if (calculatedBmi < 18.5) {
      return {
        label: 'Underweight',
        range: '< 18.5',
        color: 'text-sky-600 dark:text-sky-400',
        badgeBg: 'bg-sky-50 dark:bg-sky-950/50 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300',
        dotColor: 'bg-sky-500 ring-sky-300',
      }
    }
    if (calculatedBmi <= 24.9) {
      return {
        label: 'Normal Weight',
        range: '18.5 – 24.9',
        color: 'text-teal-600 dark:text-teal-400',
        badgeBg: 'bg-teal-50 dark:bg-teal-950/50 border-teal-300 dark:border-teal-800 text-teal-700 dark:text-teal-300',
        dotColor: 'bg-teal-500 ring-teal-300',
      }
    }
    if (calculatedBmi <= 29.9) {
      return {
        label: 'Overweight',
        range: '25.0 – 29.9',
        color: 'text-amber-600 dark:text-amber-400',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300',
        dotColor: 'bg-amber-500 ring-amber-300',
      }
    }
    return {
      label: 'Obese',
      range: '≥ 30.0',
      color: 'text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300',
      dotColor: 'bg-rose-500 ring-rose-300',
    }
  }, [calculatedBmi])

  const bmiPercent = Math.min(Math.max(((calculatedBmi - 15) / (40 - 15)) * 100, 0), 100)

  // Pack-Years Category & Visual Positioning (0 to 60 Scale)
  const isHighRiskSmoker = calculatedPackYears >= 20
  const packYearsPercent = Math.min(Math.max((calculatedPackYears / 60) * 100, 0), 100)

  function update<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    const input: PatientInput = {
      age: form.age,
      sex: form.sex,
      bmi: form.bmi,
      pack_years: form.packYears,
      packs_per_day: form.packsPerDay,
      years_smoked: form.yearsSmoked,
      resp_burden: form.respBurden || form.asthma || form.copd,
      asthma: form.asthma,
      copd: form.copd,
      chronic_burden: form.chronicBurden || form.heartAttack || form.chd || form.stroke || form.diabetes,
      heart_attack: form.heartAttack,
      chd: form.chd,
      stroke: form.stroke,
      diabetes: form.diabetes,
      low_access: form.lowAccess,
      state: form.state,
    }
    try {
      const res = await analyzePatient(input)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assessment failed. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownloadReport() {
    if (!result) return
    setDownloading(true)
    try {
      const input: PatientInput = {
        age: form.age,
        sex: form.sex,
        bmi: form.bmi,
        pack_years: form.packYears,
        packs_per_day: form.packsPerDay,
        years_smoked: form.yearsSmoked,
        resp_burden: form.respBurden || form.asthma || form.copd,
        asthma: form.asthma,
        copd: form.copd,
        chronic_burden: form.chronicBurden || form.heartAttack || form.chd || form.stroke || form.diabetes,
        heart_attack: form.heartAttack,
        chd: form.chd,
        stroke: form.stroke,
        diabetes: form.diabetes,
        low_access: form.lowAccess,
        state: form.state,
      }
      const blob = await downloadReport(input)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Lungent_Clinical_Report_${Date.now()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError('PDF download failed: ' + (e instanceof Error ? e.message : 'Unknown error'))
    } finally {
      setDownloading(false)
    }
  }

  const tierCfg = result ? (TIER_CONFIG[result.prediction.tier as keyof typeof TIER_CONFIG] ?? TIER_CONFIG['REVIEW']) : null
  const TierIcon = tierCfg?.icon ?? Shield

  return (
    <div className="relative flex min-h-screen flex-col bg-background selection:bg-primary/20">
      {/* Ambient Respiration & Floating Glow (Pulmonary AI Aesthetic) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[680px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-teal-400/15 dark:bg-teal-500/10 blur-3xl animate-lung-breathe" />
        <div
          className="absolute top-28 right-1/4 w-80 h-80 rounded-full bg-sky-400/15 dark:bg-sky-500/10 blur-3xl animate-lung-breathe"
          style={{ animationDelay: '3.5s' }}
        />
      </div>

      <Header />
      <main className="flex-1 py-12 sm:py-16">
        <SectionContainer size="lg">

          {/* Page Header */}
          <div className="mb-10 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="size-3.5" /> Back to Home
              </Link>
            </motion.div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4.5">
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45 }}
                className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs"
              >
                <Brain className="size-7" />
              </motion.div>

              <div className="space-y-1">
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary border border-primary/20 mb-1"
                >
                  <Activity className="size-3.5 animate-pulse" />
                  <span>Clinical Decision Support Engine</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground font-sans leading-[1.12]"
                >
                  AI Risk <span className="bg-gradient-to-r from-primary via-teal-600 to-sky-600 bg-clip-text text-transparent">Assessment</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.16 }}
                  className="text-base sm:text-lg text-slate-600 dark:text-slate-300"
                >
                  Calibrated Clinical Decision Support · Multi-Factor Non-Imaging Risk Stratification
                </motion.p>
              </div>
            </div>
          </div>

          {/* Warning Banner (Yellow) — Positioned directly after Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="max-w-3xl mx-auto rounded-2xl border border-amber-300/80 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-5 flex gap-3.5 shadow-xs mb-8"
          >
            <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm sm:text-[15px] text-amber-900 dark:text-amber-200 leading-relaxed">
              <strong>Research Tool — Not Medical Diagnosis.</strong> This AI assessment uses an interpretable ensemble model for educational risk stratification. It cannot confirm or exclude lung cancer. All results must be reviewed by a qualified healthcare professional before clinical decisions are made.
            </p>
          </motion.div>

          {/* Continuous Vertically Stacked Form */}
          <div className="max-w-3xl mx-auto space-y-8">

            {/* SECTION 1: Patient Demographics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.45 }}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-xs"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <User className="size-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Patient Demographics</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Age, biological sex, height, weight, and baseline body mass metrics.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Age */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Age (years)</label>
                  <input
                    type="number"
                    min={18}
                    max={120}
                    value={form.age}
                    onChange={e => update('age', +e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3.5 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>

                {/* Biological Sex */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Biological Sex</label>
                  <select
                    value={form.sex}
                    onChange={e => update('sex', +e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3.5 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  >
                    <option value={1}>Male</option>
                    <option value={2}>Female</option>
                  </select>
                </div>

                {/* Weight Input with Unit Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">Weight</label>
                    <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => handleWeightUnitChange('kg')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${weightUnit === 'kg' ? 'bg-white dark:bg-slate-700 text-foreground shadow-xs' : 'text-slate-500 hover:text-foreground'}`}
                      >
                        kg
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWeightUnitChange('lbs')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${weightUnit === 'lbs' ? 'bg-white dark:bg-slate-700 text-foreground shadow-xs' : 'text-slate-500 hover:text-foreground'}`}
                      >
                        lbs
                      </button>
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step={0.5}
                      min={20}
                      max={500}
                      value={weightInput}
                      onChange={e => setWeightInput(e.target.value)}
                      className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3.5 py-2 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                    <span className="absolute right-3.5 text-xs font-bold text-slate-400 uppercase pointer-events-none">
                      {weightUnit}
                    </span>
                  </div>
                </div>

                {/* Height Input with Unit Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">Height</label>
                    <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => handleHeightUnitChange('cm')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${heightUnit === 'cm' ? 'bg-white dark:bg-slate-700 text-foreground shadow-xs' : 'text-slate-500 hover:text-foreground'}`}
                      >
                        cm
                      </button>
                      <button
                        type="button"
                        onClick={() => handleHeightUnitChange('ft')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${heightUnit === 'ft' ? 'bg-white dark:bg-slate-700 text-foreground shadow-xs' : 'text-slate-500 hover:text-foreground'}`}
                      >
                        ft / in
                      </button>
                    </div>
                  </div>

                  {heightUnit === 'cm' ? (
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={50}
                        max={250}
                        value={heightCmInput}
                        onChange={e => setHeightCmInput(e.target.value)}
                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3.5 py-2 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                      />
                      <span className="absolute right-3.5 text-xs font-bold text-slate-400 uppercase pointer-events-none">
                        cm
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          min={2}
                          max={8}
                          value={heightFeetInput}
                          onChange={e => setHeightFeetInput(e.target.value)}
                          className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3.5 py-2 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        />
                        <span className="absolute right-3 text-xs font-bold text-slate-400 pointer-events-none">
                          ft
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          min={0}
                          max={11}
                          value={heightInchesInput}
                          onChange={e => setHeightInchesInput(e.target.value)}
                          className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3.5 py-2 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        />
                        <span className="absolute right-3 text-xs font-bold text-slate-400 pointer-events-none">
                          in
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Computed BMI Display — PURELY READ-ONLY VISUALIZER */}
                <div className="sm:col-span-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Scale className="size-4.5 text-primary" />
                      <span className="text-sm font-bold text-foreground">Calculated Body Mass Index (BMI)</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300">
                        Read-Only
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${bmiCategory.badgeBg}`}>
                        {bmiCategory.label}
                      </span>
                      <span className="text-2xl font-black text-foreground">
                        {calculatedBmi.toFixed(1)}{' '}
                        <span className="text-sm font-semibold text-muted-foreground">kg/m²</span>
                      </span>
                    </div>
                  </div>

                  {/* Read-Only Visual Indicator Bar (Non-interactive) */}
                  <div className="space-y-2 pointer-events-none select-none" aria-hidden="true">
                    <div className="relative w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="absolute inset-0 flex w-full h-full">
                        {/* Underweight: 15 to 18.5 -> 14% */}
                        <div style={{ width: '14%' }} className="bg-sky-400/80" />
                        {/* Normal: 18.5 to 25 -> 26% */}
                        <div style={{ width: '26%' }} className="bg-teal-500/85" />
                        {/* Overweight: 25 to 30 -> 20% */}
                        <div style={{ width: '20%' }} className="bg-amber-400/85" />
                        {/* Obese: 30 to 40+ -> 40% */}
                        <div style={{ width: '40%' }} className="bg-rose-500/85" />
                      </div>
                    </div>

                    {/* Indicator Dot */}
                    <div className="relative w-full h-5">
                      <div
                        className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-300 ease-out"
                        style={{ left: `${bmiPercent}%` }}
                      >
                        <div className={`size-4.5 rounded-full border-2 border-white dark:border-slate-900 shadow-md ${bmiCategory.dotColor} ring-2`} />
                      </div>
                    </div>

                    {/* Scale Legend */}
                    <div className="grid grid-cols-4 text-center text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 pt-0.5">
                      <span className={calculatedBmi < 18.5 ? 'font-bold text-sky-600 dark:text-sky-400' : ''}>Underweight (&lt;18.5)</span>
                      <span className={calculatedBmi >= 18.5 && calculatedBmi <= 24.9 ? 'font-bold text-teal-600 dark:text-teal-400' : ''}>Normal (18.5–24.9)</span>
                      <span className={calculatedBmi >= 25 && calculatedBmi <= 29.9 ? 'font-bold text-amber-600 dark:text-amber-400' : ''}>Overweight (25–29.9)</span>
                      <span className={calculatedBmi >= 30 ? 'font-bold text-rose-600 dark:text-rose-400' : ''}>Obese (&ge;30)</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* SECTION 2: Smoking History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.45 }}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-xs"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Wind className="size-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Smoking History</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Cumulative tobacco inhalation, packs per day, and smoking duration.</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Packs per day & Years smoked inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Packs per day</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.25}
                      value={form.packsPerDay}
                      onChange={e => update('packsPerDay', Math.max(0, +e.target.value))}
                      className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3.5 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Years smoked</label>
                    <input
                      type="number"
                      min={0}
                      max={80}
                      value={form.yearsSmoked}
                      onChange={e => update('yearsSmoked', Math.max(0, +e.target.value))}
                      className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3.5 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                  </div>
                </div>

                {/* Computed Pack-Years Display — PURELY READ-ONLY VISUALIZER */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Wind className="size-4.5 text-primary" />
                        <span className="text-sm font-bold text-foreground">Cumulative Exposure (Pack-Years)</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300">
                          Read-Only
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground pt-1">
                        Dynamic formula: ({form.packsPerDay} packs/day) × ({form.yearsSmoked} years) = {calculatedPackYears.toFixed(1)} pack-years
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${isHighRiskSmoker ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300' : 'bg-teal-50 dark:bg-teal-950/50 border-teal-300 dark:border-teal-800 text-teal-700 dark:text-teal-300'}`}>
                        {isHighRiskSmoker ? 'High Risk (≥ 20 py)' : 'Below Threshold (< 20 py)'}
                      </span>
                      <span className={`text-2xl font-black ${isHighRiskSmoker ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
                        {calculatedPackYears.toFixed(1)} <span className="text-sm font-semibold text-muted-foreground">py</span>
                      </span>
                    </div>
                  </div>

                  {/* Read-Only Visual Indicator Bar (Non-interactive) */}
                  <div className="space-y-2 pointer-events-none select-none" aria-hidden="true">
                    <div className="relative w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      {/* Sub-threshold & High-Risk Zones */}
                      <div className="absolute inset-0 flex w-full h-full">
                        <div style={{ width: '33.33%' }} className="bg-teal-500/20 dark:bg-teal-900/30" />
                        <div style={{ width: '66.67%' }} className="bg-rose-500/20 dark:bg-rose-900/30" />
                      </div>
                      {/* Active Progress Fill */}
                      <div
                        className={`h-full transition-all duration-300 ease-out ${isHighRiskSmoker ? 'bg-gradient-to-r from-amber-500 to-rose-600' : 'bg-teal-500'}`}
                        style={{ width: `${packYearsPercent}%` }}
                      />
                    </div>

                    {/* Indicator Dot & 20 py Threshold Tick */}
                    <div className="relative w-full h-5">
                      <div className="absolute top-0 -translate-x-1/2 flex flex-col items-center" style={{ left: '33.33%' }}>
                        <div className="w-0.5 h-3 bg-slate-400 dark:bg-slate-500" />
                      </div>

                      <div
                        className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-300 ease-out"
                        style={{ left: `${packYearsPercent}%` }}
                      >
                        <div className={`size-4.5 rounded-full border-2 border-white dark:border-slate-900 shadow-md ${isHighRiskSmoker ? 'bg-rose-600 ring-2 ring-rose-300' : 'bg-teal-500 ring-2 ring-teal-300'}`} />
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex justify-between text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 pt-0.5">
                      <span>0 py (Never Smoked)</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">20 py (USPSTF Screening Threshold)</span>
                      <span>40 py</span>
                      <span>60+ py</span>
                    </div>
                  </div>

                  {/* Dynamic USPSTF Status Banner */}
                  <div className={`rounded-xl border p-4 text-sm font-medium ${isHighRiskSmoker ? 'border-amber-300 bg-amber-50/80 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300'}`}>
                    {isHighRiskSmoker
                      ? '⚠️ USPSTF High-Risk Screening Threshold Met (≥ 20 pack-years) — Clinical LDCT evaluation recommended.'
                      : `Current exposure: ${calculatedPackYears.toFixed(1)} pack-years — below the 20 pack-year LDCT screening threshold.`}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* SECTION 3: Comorbidities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.45 }}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-xs"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <HeartPulse className="size-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Comorbidities &amp; Clinical History</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Respiratory, cardiovascular, metabolic conditions, and health equity access.</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <p className="text-sm font-semibold text-foreground">Select all clinical diagnoses that apply:</p>
                {[
                  { key: 'asthma', label: 'Asthma (Diagnosed by a physician)' },
                  { key: 'copd', label: 'COPD / Chronic Bronchitis / Emphysema' },
                  { key: 'heartAttack', label: 'Heart Attack (Myocardial Infarction)' },
                  { key: 'chd', label: 'Coronary Heart Disease (CHD) / Angina' },
                  { key: 'stroke', label: 'Cerebrovascular Accident (Stroke)' },
                  { key: 'diabetes', label: 'Diabetes Mellitus (Type 1 or Type 2)' },
                  { key: 'lowAccess', label: 'Limited healthcare access / rural geographic health desert' },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={form[key as keyof FormData] as boolean}
                      onChange={e => update(key as keyof FormData, e.target.checked as FormData[keyof FormData])}
                      className="rounded-md accent-primary size-5"
                    />
                    <span className="text-sm sm:text-base font-medium text-foreground">{label}</span>
                  </label>
                ))}
              </div>
            </motion.div>

            {/* SECTION 4: Location & Environmental Exposure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.45 }}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-xs"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Location &amp; Environmental Exposure</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">State-level longitudinal ambient air quality (AQI) and PM2.5 exposure.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">US State (for 5-year AQI &amp; PM2.5 environmental data)</label>
                  <select
                    value={form.state}
                    onChange={e => update('state', e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3.5 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  >
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 pt-1">
                    <Wind className="size-4 text-sky-500" />
                    <span>5-year ambient AQI and PM2.5 data integrated from EPA / Open-Meteo cache</span>
                  </p>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-2">
                  <p className="text-sm font-bold text-primary flex items-center gap-2">
                    <Info className="size-4" /> About the Pre-Screening Assessment Engine
                  </p>
                  <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                    <li>• Calibrated 9-model gradient-boosted decision ensemble (XGBoost, LightGBM, CatBoost)</li>
                    <li>• Game-theoretic feature attribution (Tree-SHAP) for transparent clinical explainability</li>
                    <li>• Multi-factor clinical risk scoring beyond rigid smoking-only criteria</li>
                    <li>• Aligned with USPSTF 2021 and NCCN preventive screening guidelines</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Error Banner if API Fails */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/40 p-5 text-sm text-red-800 dark:text-red-200 font-medium"
              >
                <strong>Error:</strong> {error}
              </motion.div>
            )}

            {/* FINAL FULL-WIDTH "RUN AI ASSESSMENT" BUTTON */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="pt-2"
            >
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-md hover:bg-primary/95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-6 animate-spin" />
                    <span>Running AI Stratification Models...</span>
                  </>
                ) : (
                  <>
                    <Activity className="size-6" />
                    <span>Run AI Assessment</span>
                  </>
                )}
              </button>
            </motion.div>

            {/* RESULT SECTION (Appears below the button after running assessment) */}
            <div ref={resultRef} className="pt-2">
              <AnimatePresence>
                {result && tierCfg && (
                  <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="space-y-6 pt-4"
                  >
                    {/* Triage Badge Card */}
                    <div className={`rounded-3xl border ${tierCfg.border} ${tierCfg.bg} p-7 sm:p-8 shadow-sm`}>
                      <div className="flex items-start gap-5">
                        <div className={`size-14 rounded-2xl flex items-center justify-center ${tierCfg.bg} border ${tierCfg.border} shrink-0`}>
                          <TierIcon className={`size-8 ${tierCfg.color}`} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className={`text-2xl sm:text-3xl font-black tracking-tight ${tierCfg.color}`}>
                            {result.prediction.tier}
                          </div>
                          <p className="text-base sm:text-lg font-bold text-foreground">{tierCfg.sublabel}</p>
                          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">{result.prediction.recommendation}</p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <RiskGauge score={result.prediction.risk_score} tier={result.prediction.tier} />
                      </div>
                      {result.prediction.uncertainty_flag && (
                        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-sm text-amber-900 dark:text-amber-200 font-medium">
                          ⚠️ High inter-model uncertainty detected — clinical review strongly recommended
                        </div>
                      )}
                      {result.prediction.equity_override && (
                        <div className="mt-3 rounded-xl border border-sky-300 bg-sky-50 dark:bg-sky-950/40 px-4 py-3 text-sm text-sky-900 dark:text-sky-200 font-medium">
                          🛡️ Equity override applied — sensitivity floor constraint enforced for this demographic
                        </div>
                      )}
                    </div>

                    {/* Two-column: SHAP + AQI */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* SHAP Feature Attribution */}
                      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3.5 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2.5">
                          <Brain className="size-5 text-primary" />
                          <h3 className="text-base sm:text-lg font-bold">Feature Attribution (Tree-SHAP)</h3>
                        </div>
                        <ShapChart items={result.prediction.shap_items ?? []} />
                        {(!result.prediction.shap_items?.length) && (
                          <p className="text-sm text-muted-foreground">SHAP factor data calculated from gradient-boosted trees.</p>
                        )}
                      </div>

                      {/* AQI Card */}
                      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3.5 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2.5">
                          <Wind className="size-5 text-sky-500" />
                          <h3 className="text-base sm:text-lg font-bold">Environmental Exposure ({form.state})</h3>
                        </div>
                        {result.aqi.aqi_5yr !== null ? (
                          <div className="space-y-3.5">
                            <div className="rounded-xl border border-border bg-muted/50 p-4 flex justify-between items-center">
                              <span className="text-sm font-semibold text-muted-foreground">5-Year Avg AQI</span>
                              <span className="text-2xl font-black text-foreground">{result.aqi.aqi_5yr?.toFixed(1)}</span>
                            </div>
                            <div className="rounded-xl border border-border bg-muted/50 p-4 flex justify-between items-center">
                              <span className="text-sm font-semibold text-muted-foreground">5-Year PM2.5 (μg/m³)</span>
                              <span className="text-2xl font-black text-foreground">{result.aqi.pm25_5yr?.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Source: Historical Air Quality Observation API</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">AQI data not available for this region.</p>
                        )}
                      </div>
                    </div>

                    {/* Clinical Summary */}
                    {result.summary && (
                      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2.5">
                          <Stethoscope className="size-5 text-primary" />
                          <h3 className="text-base sm:text-lg font-bold">AI Clinical Summary</h3>
                        </div>
                        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">{result.summary}</p>
                        <p className="text-xs text-muted-foreground pt-1">Generated by clinical decision support engine</p>
                      </div>
                    )}

                    {/* Guidelines */}
                    {result.guidelines?.length > 0 && (
                      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3.5 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2.5">
                          <FileText className="size-5 text-primary" />
                          <h3 className="text-base sm:text-lg font-bold">Relevant USPSTF Guidelines</h3>
                        </div>
                        <div className="space-y-2.5">
                          {result.guidelines.map((g, i) => (
                            <div key={i} className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                              <span className="font-bold text-foreground">p.{g.page}: </span>{g.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Report Download Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <button
                        type="button"
                        onClick={handleDownloadReport}
                        disabled={downloading}
                        className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl border border-primary/20 bg-primary px-6 py-4 text-base font-bold text-primary-foreground hover:bg-primary/95 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md hover:shadow-primary/25 disabled:opacity-60 cursor-pointer"
                      >
                        {downloading ? <Loader2 className="size-5 animate-spin" /> : <Download className="size-5" />}
                        Download Clinical PDF Report
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-4 text-base font-semibold hover:bg-muted hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                      >
                        <ArrowUp className="size-5" /> Back to Top
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setResult(null)
                          setError(null)
                          setWeightUnit('kg')
                          setHeightUnit('cm')
                          setWeightInput(75)
                          setHeightCmInput(172)
                          setHeightFeetInput(5)
                          setHeightInchesInput(8)
                          setForm({
                            age: 55,
                            sex: 1,
                            weightKg: 75.0,
                            heightCm: 172,
                            bmi: 25.4,
                            packYears: 20,
                            packsPerDay: 1,
                            yearsSmoked: 20,
                            respBurden: false,
                            asthma: false,
                            copd: false,
                            chronicBurden: false,
                            heartAttack: false,
                            chd: false,
                            stroke: false,
                            diabetes: false,
                            lowAccess: false,
                            state: 'Ohio',
                          })
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-4 text-base font-semibold hover:bg-muted hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                      >
                        <RefreshCw className="size-5" /> Reset Form
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </SectionContainer>
      </main>
      <Footer />
    </div>
  )
}
