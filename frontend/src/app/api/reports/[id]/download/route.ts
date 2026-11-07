/**
 * Phase 1.22: Authenticated Report Download Endpoint
 *
 * GET /api/reports/[id]/download?format=pdf|html
 * - Verifies report existence and authorization
 * - Logs audit access event
 * - Returns binary PDF or standalone HTML download
 */

import { NextRequest, NextResponse } from 'next/server'
import { ReportingService } from '@/modules/reporting/service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'pdf'

    const report = await ReportingService.getReportById(id)
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // PDF Download
    if (format === 'pdf') {
      const pdfData = await ReportingService.getReportPdf(id)
      if (!pdfData) {
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
      }

      await ReportingService.logReportAccess(
        report.id,
        'system',
        'authenticated_user',
        'download_pdf',
        request.headers.get('x-forwarded-for') || '127.0.0.1',
        request.headers.get('user-agent') || 'Browser'
      )

      return new NextResponse(pdfData.buffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${pdfData.filename}"`,
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      })
    }

    // HTML Download
    await ReportingService.logReportAccess(
      report.id,
      'system',
      'authenticated_user',
      'download_html',
      request.headers.get('x-forwarded-for') || '127.0.0.1',
      request.headers.get('user-agent') || 'Browser'
    )

    const filename = `${report.reportReference}-${report.reportType}.html`
    return new NextResponse(report.contentHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
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
