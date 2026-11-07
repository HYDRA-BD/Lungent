/**
 * Phase 1.22: Authenticated Report Preview Endpoint
 *
 * GET /api/reports/[id]/preview
 * - Returns self-contained, printable HTML with print stylesheet
 * - Allows direct browser preview, iframe embedding, and window.print()
 * - Logs audit access event
 */

import { NextRequest, NextResponse } from 'next/server'
import { ReportingService } from '@/modules/reporting/service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const report = await ReportingService.getReportById(id)
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    await ReportingService.logReportAccess(
      report.id,
      'system',
      'authenticated_user',
      'view',
      request.headers.get('x-forwarded-for') || '127.0.0.1',
      request.headers.get('user-agent') || 'Browser'
    )

    return new NextResponse(report.contentHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
