/**
 * Backend API client for Lungent V2.0
 * Connects to the FastAPI backend at http://localhost:8000
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:8000'

export interface PatientInput {
  age: number
  bmi: number
  pack_years: number
  resp_burden: boolean
  chronic_burden: boolean
  low_access: boolean
  sex: number
  state: string
  patient_id?: string
  packs_per_day?: number
  years_smoked?: number
  asthma?: boolean
  copd?: boolean
  heart_attack?: boolean
  chd?: boolean
  stroke?: boolean
  diabetes?: boolean
}

export interface ShapItem {
  feature: string
  label: string
  value?: number
  shap_value?: number
  impact?: number
  raw_value?: string
  direction: 'increases' | 'decreases' | 'risk' | 'protective' | 'neutral'
  magnitude?: 'low' | 'medium' | 'high'
}

export interface PredictionResult {
  tier: 'REFER' | 'REVIEW' | 'RULE-OUT'
  risk_score: number
  risk_percent?: number
  recommendation: string
  confidence_tier?: string
  ci_lower?: number
  ci_upper?: number
  contributing_factors?: Array<string | [string, string]>
  shap_items: ShapItem[]
  uncertainty_flag?: boolean
  uncertainty_high?: boolean
  uncertainty_score?: number
  equity_override?: boolean
  equity_guard_triggered?: boolean
  access_flag?: boolean
  t_out?: number
  t_in?: number
}

export interface AQIData {
  aqi_5yr: number | null
  pm25_5yr: number | null
  aqi_category: number | null
}

export interface AnalyzeResponse {
  prediction: PredictionResult
  guidelines: Array<{ text: string; page: number; score?: number }>
  summary: string
  aqi: AQIData
  patient: Record<string, unknown>
}

export async function analyzePatient(input: PatientInput): Promise<AnalyzeResponse> {
  const response = await fetch(`${BACKEND_URL}/api/analyze?include_summary=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, include_summary: true }),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail ?? `HTTP ${response.status}`)
  }
  return response.json()
}

export async function downloadReport(input: PatientInput): Promise<Blob> {
  const response = await fetch(`${BACKEND_URL}/api/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(`Report generation failed: HTTP ${response.status}`)
  }
  return response.blob()
}

export async function checkBackendHealth(): Promise<{ status: string; aqi_states_cached: number }> {
  const response = await fetch(`${BACKEND_URL}/health`, { cache: 'no-store' })
  if (!response.ok) throw new Error('Backend unreachable')
  return response.json()
}

export async function getStates(): Promise<Array<{ name: string; aqi_5yr: number | null; pm25_5yr: number | null }>> {
  const response = await fetch(`${BACKEND_URL}/api/states`)
  if (!response.ok) return []
  return response.json()
}
