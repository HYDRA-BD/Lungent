'use client'

import React, { useState, useRef, useEffect } from 'react'
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

  // Helper to recompute BMI from kg and cm
  function calcBmi(kg: number, cm: number): number {
    if (!cm || cm <= 0 || !kg || kg <= 0) return 25.0
    const m = cm / 100
    return Math.round((kg / (m * m)) * 10) / 10
  }

  // Handle Weight changes
  function handleWeightChange(val: number, unit: 'kg' | 'lbs') {
    const kg = unit === 'kg' ? val : Math.round((val / 2.20462) * 10) / 10
    const newBmi = calcBmi(kg, form.heightCm)
    setForm(prev => ({ ...prev, weightKg: kg, bmi: newBmi }))
  }

  // Handle Height changes
  function handleHeightCmChange(cm: number) {
    const newBmi = calcBmi(form.weightKg, cm)
    setForm(prev => ({ ...prev, heightCm: cm, bmi: newBmi }))
  }

  function handleHeightFtInChange(feet: number, inches: number) {
    const totalInches = (feet || 0) * 12 + (inches || 0)
    const cm = Math.round(totalInches * 2.54)
    const newBmi = calcBmi(form.weightKg, cm)
    setForm(prev => ({ ...prev, heightCm: cm, bmi: newBmi }))
  }

  // Personas with Height & Weight
  const CLINICAL_PERSONAS = [
    {
      id: 'high-risk',
      label: '🚩 High-Risk (REFER)',
      desc: '66y, 38 pack-yrs, COPD, Ohio (high AQI)',
      data: {
        age: 66,
        sex: 1,
        weightKg: 87.3, // 192.5 lbs
        heightCm: 175,  // 5 ft 9 in
        bmi: 28.5,
        packYears: 38,
        packsPerDay: 1.5,
        yearsSmoked: 25,
        respBurden: true,
        asthma: false,
        copd: true,
        chronicBurden: true,
        heartAttack: true,
        chd: false,
        stroke: false,
        diabetes: false,
        lowAccess: true,
        state: 'Ohio',
      },
    },
    {
      id: 'moderate-risk',
      label: '🔍 Borderline (REVIEW)',
      desc: '52y, 8 pack-yrs, Low-Access Subgroup, West Virginia',
      data: {
        age: 52,
        sex: 2,
        weightKg: 70.6, // 155.6 lbs
        heightCm: 168,  // 5 ft 6 in
        bmi: 25.0,
        packYears: 8,
        packsPerDay: 0.5,
        yearsSmoked: 16,
        respBurden: false,
        asthma: false,
        copd: false,
        chronicBurden: false,
        heartAttack: false,
        chd: false,
        stroke: false,
        diabetes: false,
        lowAccess: true,
        state: 'West Virginia',
      },
    },
    {
      id: 'low-risk',
      label: '🛡️ Low-Risk (RULE-OUT)',
      desc: '32y, 0 pack-yrs, Non-smoker, California',
      data: {
        age: 32,
        sex: 2,
        weightKg: 59.4, // 131 lbs
        heightCm: 165,  // 5 ft 5 in
        bmi: 21.8,
        packYears: 0,
        packsPerDay: 0,
        yearsSmoked: 0,
        respBurden: false,
        asthma: false,
        copd: false,
        chronicBurden: false,
        heartAttack: false,
        chd: false,
        stroke: false,
        diabetes: false,
        lowAccess: false,
        state: 'California',
      },
    },
  ]

  function loadPersona(data: FormData) {
    setForm(data)
  }

  function update<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  // Derived display values for Height & Weight
  const displayWeight = weightUnit === 'kg'
    ? Math.round(form.weightKg * 10) / 10
    : Math.round(form.weightKg * 2.20462 * 10) / 10

  const totalInches = Math.round(form.heightCm / 2.54)
  const displayFeet = Math.floor(totalInches / 12)
  const displayInches = totalInches % 12

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
                        onClick={() => setWeightUnit('kg')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${weightUnit === 'kg' ? 'bg-white dark:bg-slate-700 text-foreground shadow-xs' : 'text-slate-500 hover:text-foreground'}`}
                      >
                        kg
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeightUnit('lbs')}
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
                      min={30}
                      max={300}
                      value={displayWeight}
                      onChange={e => handleWeightChange(+e.target.value, weightUnit)}
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
                        onClick={() => setHeightUnit('cm')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${heightUnit === 'cm' ? 'bg-white dark:bg-slate-700 text-foreground shadow-xs' : 'text-slate-500 hover:text-foreground'}`}
                      >
                        cm
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeightUnit('ft')}
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
                        min={100}
                        max={250}
                        value={form.heightCm}
                        onChange={e => handleHeightCmChange(+e.target.value)}
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
                          min={3}
                          max={7}
                          value={displayFeet}
                          onChange={e => handleHeightFtInChange(+e.target.value, displayInches)}
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
                          value={displayInches}
                          onChange={e => handleHeightFtInChange(displayFeet, +e.target.value)}
                          className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3.5 py-2 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        />
                        <span className="absolute right-3 text-xs font-bold text-slate-400 pointer-events-none">
                          in
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Computed BMI Display */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale className="size-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Calculated Body Mass Index (BMI)</span>
                    </div>
                    <span className="text-lg font-black text-primary">{form.bmi.toFixed(1)} kg/m²</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={10}
                      max={60}
                      step={0.1}
                      value={form.bmi}
                      onChange={e => update('bmi', +e.target.value)}
                      className="flex-1 accent-primary h-2"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground font-medium pt-0.5">
                    <span>Underweight (&lt;18.5)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Normal (18.5–24.9)</span>
                    <span>Overweight (25–29.9)</span>
                    <span>Obese (&ge;30)</span>
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
                {/* Pack-Years Range Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-foreground">Pack-Years (total cumulative exposure)</label>
                    <span className="text-base font-black text-foreground">{form.packYears.toFixed(1)} py</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={120}
                      step={0.5}
                      value={form.packYears}
                      onChange={e => update('packYears', +e.target.value)}
                      className="flex-1 accent-primary h-2"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Formula: (Packs Smoked Per Day) × (Years Smoked). USPSTF screening threshold: ≥ 20 pack-years.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Packs per day</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.25}
                      value={form.packsPerDay}
                      onChange={e => update('packsPerDay', +e.target.value)}
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
                      onChange={e => update('yearsSmoked', +e.target.value)}
                      className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3.5 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                  </div>
                </div>

                {/* USPSTF Criteria Status */}
                <div className={`rounded-xl border p-4 text-sm font-medium ${form.packYears >= 20 ? 'border-amber-300 bg-amber-50/80 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300'}`}>
                  {form.packYears >= 20
                    ? '⚠️ USPSTF High-Risk Screening Threshold Met (≥ 20 pack-years)'
                    : `Current exposure: ${form.packYears.toFixed(1)} pack-years — below the 20 pack-year LDCT threshold.`}
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
