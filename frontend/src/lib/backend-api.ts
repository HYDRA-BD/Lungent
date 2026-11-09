/**
 * Backend API client for Lungent V2.0
 * Connects dynamically to Render Cloud Backend or local development server.
 */

// 150-second default timeout to accommodate Render free-tier cold starts (up to 90s)
export const DEFAULT_API_TIMEOUT_MS = 150000

/**
 * Resolves the backend base URL dynamically from environment variables.
 * Priority: NEXT_PUBLIC_API_URL -> NEXT_PUBLIC_BACKEND_URL -> NEXT_PUBLIC_API_BASE_URL.
 */
export function getBackendUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL

  if (envUrl && envUrl.trim() !== '') {
    // Strip trailing slashes
    return envUrl.trim().replace(/\/+$/, '')
  }

  // If in browser production environment and no env var is provided
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    console.warn(
      '[Lungent API] Warning: NEXT_PUBLIC_API_URL is not set in production. ' +
      'Please configure NEXT_PUBLIC_API_URL in your Vercel Dashboard to your Render backend URL.'
    )
  }

  return 'http://127.0.0.1:8000'
}

/**
 * Safely constructs an API endpoint URL preventing duplicate `/api` path segments.
 */
export function getApiEndpoint(path: string): string {
  const base = getBackendUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  // If base URL already ends with /api and the requested path starts with /api
  if (base.endsWith('/api') && cleanPath.startsWith('/api')) {
    return `${base}${cleanPath.slice(4)}`
  }
  return `${base}${cleanPath}`
}

/**
 * Wrapper around fetch with explicit timeout via AbortController and detailed network error diagnostics.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_API_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        `Backend request timed out after ${timeoutMs / 1000}s. The AI model is taking longer than usual to wake up. Please try again.`
      )
    }

    if (
      err instanceof TypeError &&
      (err.message.includes('fetch') ||
        err.message.includes('NetworkError') ||
        err.message.includes('Failed to fetch'))
    ) {
      let origin = url
      try {
        origin = new URL(url).origin
      } catch {
        // use fallback url string
      }
      throw new Error(
        `Cannot connect to backend at ${origin}. (Network Error / Connection Refused). Please verify FastAPI is running on ${origin} and CORS allows this origin.`
      )
    }

    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

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
  disclaimer?: string
}

export async function analyzePatient(
  input: PatientInput,
  timeoutMs: number = DEFAULT_API_TIMEOUT_MS
): Promise<AnalyzeResponse> {
  const endpoint = getApiEndpoint('/api/analyze?include_summary=true')
  console.log(`[Lungent API] Active Target Endpoint: ${endpoint}`)
  console.log(`[Lungent API] process.env.NEXT_PUBLIC_API_URL:`, process.env.NEXT_PUBLIC_API_URL || '(default: http://127.0.0.1:8000)')
  console.log(`[Lungent API] Request Payload:`, JSON.stringify({ ...input, include_summary: true }, null, 2))

  const response = await fetchWithTimeout(
    endpoint,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ ...input, include_summary: true }),
    },
    timeoutMs
  )

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    let errorDetail = ''
    if (errorBody?.detail) {
      if (Array.isArray(errorBody.detail)) {
        errorDetail = errorBody.detail
          .map((d: any) => `${d.loc ? d.loc.slice(1).join('.') : 'field'}: ${d.msg}`)
          .join('; ')
      } else if (typeof errorBody.detail === 'string') {
        errorDetail = errorBody.detail
      } else {
        errorDetail = JSON.stringify(errorBody.detail)
      }
    }

    if (response.status === 422) {
      throw new Error(`Data validation failed (HTTP 422): ${errorDetail || 'Invalid input schema'}`)
    }

    const errorMsg =
      errorDetail ||
      errorBody?.message ||
      `Backend error HTTP ${response.status}: ${response.statusText || 'Internal Server Error'}`
    throw new Error(errorMsg)
  }

  return response.json()
}

export async function downloadReport(
  input: PatientInput,
  timeoutMs: number = DEFAULT_API_TIMEOUT_MS
): Promise<Blob> {
  const endpoint = getApiEndpoint('/api/report')
  console.log(`[Lungent API] POST (Report) -> ${endpoint}`)

  const response = await fetchWithTimeout(
    endpoint,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
    timeoutMs
  )

  if (!response.ok) {
    throw new Error(`Report generation failed: HTTP ${response.status}`)
  }
  return response.blob()
}

export async function checkBackendHealth(
  timeoutMs: number = 10000
): Promise<{ status: string; aqi_states_cached?: number; version?: string }> {
  const endpoint = getApiEndpoint('/health')
  const response = await fetchWithTimeout(endpoint, { cache: 'no-store' }, timeoutMs)
  if (!response.ok) throw new Error(`Backend health check failed: HTTP ${response.status}`)
  return response.json()
}

export async function getStates(
  timeoutMs: number = 10000
): Promise<Array<{ name: string; aqi_5yr: number | null; pm25_5yr: number | null }>> {
  try {
    const endpoint = getApiEndpoint('/api/states')
    const response = await fetchWithTimeout(endpoint, {}, timeoutMs)
    if (!response.ok) return []
    return response.json()
  } catch {
    return []
  }
}
