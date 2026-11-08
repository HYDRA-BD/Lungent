import { NextResponse } from 'next/server'
import { getBackendUrl } from '@/lib/backend-api'

export async function GET() {
  const backendUrl = getBackendUrl()
  let backendStatus = 'unknown'

  // Proactively ping the Render backend health endpoint to prevent idle sleep
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(`${backendUrl}/health`, {
      signal: controller.signal,
      cache: 'no-store',
    }).catch(() => null)
    clearTimeout(timeoutId)

    if (res && res.ok) {
      backendStatus = 'awake'
    } else {
      backendStatus = 'pinged'
    }
  } catch {
    backendStatus = 'standby'
  }

  return NextResponse.json(
    {
      status: 'ok',
      service: 'lungent-keepalive-ping',
      timestamp: new Date().toISOString(),
      backendUrl,
      backendStatus,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  )
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}

