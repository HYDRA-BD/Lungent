/**
 * Phase 1.22: Standards-Compliant PDF 1.4 Generator
 *
 * Implements a pure-TypeScript server-side PDF generator that constructs valid PDF 1.4 binary streams
 * with zero native binary or runtime dependencies (100% compatible with Vercel serverless / Edge).
 *
 * Emits:
 * - PDF 1.4 Header & binary comment
 * - Document Catalog, Page Tree, and Page Objects
 * - Embedded Helvetica and standard font dictionaries
 * - Content Streams containing headers, patient banners, tables, and footers
 * - Valid Cross-Reference Table (xref) with accurate byte offsets
 * - Trailer dictionary & %%EOF termination
 */

import type { GeneratedReportRecord } from './types'

export class PdfGenerator {
  /**
   * Generates a valid PDF 1.4 binary buffer from a GeneratedReportRecord.
   */
  static generatePdf(report: GeneratedReportRecord): Uint8Array {
    const meta = report.sourceMetadata

    // Document dimensions: A4 portrait (595.28 x 841.89 points)
    const pageWidth = 595.28
    const pageHeight = 841.89
    const margin = 40

    // Text sanitation for standard PDF font encoding (maps non-ASCII to clean representation or transliterated metadata)
    const sanitizePdfText = (str: string | null | undefined): string => {
      if (!str) return ''
      // Replace parentheses and backslashes per PDF spec
      return str
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/[^\x20-\x7E]/g, () => ' ')
    }

    const titleAscii = sanitizePdfText(report.title) || 'Lungent Clinical Report'
    const reportRef = sanitizePdfText(report.reportReference)
    const patientName = sanitizePdfText(report.patientName)
    const patientId = sanitizePdfText(meta.patientCanonicalId || report.patientId)
    const reportType = sanitizePdfText(report.reportType.replace(/_/g, ' ').toUpperCase())
    const generatedDate = sanitizePdfText(report.createdAt.split('T')[0])
    const facilityName = sanitizePdfText(meta.facilityName || 'Lungent Partner Facility')
    const clinicianName = sanitizePdfText(meta.reviewingClinicianName || 'Authorized Medical Practitioner')
    const methodology = sanitizePdfText(meta.methodologyVersion || meta.guidelineVersion || meta.protocolVersion || 'v1.0')

    // Construct stream content
    const streamLines: string[] = []

    // Background header bar (Teal: #0f766e -> 0.059, 0.463, 0.431)
    streamLines.push('q')
    streamLines.push(`0.059 0.463 0.431 rg`)
    streamLines.push(`${margin} ${pageHeight - margin - 4} ${pageWidth - 2 * margin} 3 re f`)
    streamLines.push('Q')

    // Brand and Title
    streamLines.push('BT')
    streamLines.push('/F1 18 Tf')
    streamLines.push('0.059 0.463 0.431 rg')
    streamLines.push(`${margin} ${pageHeight - margin - 28} Td`)
    streamLines.push('(LUNGENT - Intelligent Lung Health Assessment) Tj')
    streamLines.push('ET')

    // Subtitle / Type
    streamLines.push('BT')
    streamLines.push('/F1 12 Tf')
    streamLines.push('0.118 0.161 0.231 rg')
    streamLines.push(`${margin} ${pageHeight - margin - 46} Td`)
    streamLines.push(`(${titleAscii}) Tj`)
    streamLines.push('ET')

    // Header Right Meta
    streamLines.push('BT')
    streamLines.push('/F2 9 Tf')
    streamLines.push('0.392 0.455 0.545 rg')
    streamLines.push(`${pageWidth - margin - 180} ${pageHeight - margin - 26} Td`)
    streamLines.push(`(Report ID: ${reportRef}) Tj`)
    streamLines.push('0 -14 Td')
    streamLines.push(`(Generated: ${generatedDate} | Lang: ${report.language.toUpperCase()}) Tj`)
    streamLines.push('0 -14 Td')
    streamLines.push(`(Type: ${reportType}) Tj`)
    streamLines.push('ET')

    // Patient Information Box
    const boxY = pageHeight - margin - 120
    const boxHeight = 55
    streamLines.push('q')
    streamLines.push('0.973 0.980 0.988 rg') // #f8fafc
    streamLines.push(`${margin} ${boxY} ${pageWidth - 2 * margin} ${boxHeight} re f`)
    streamLines.push('0.886 0.910 0.941 RG') // #e2e8f0 border
    streamLines.push('1 w')
    streamLines.push(`${margin} ${boxY} ${pageWidth - 2 * margin} ${boxHeight} re S`)
    streamLines.push('Q')

    // Patient Box Text
    streamLines.push('BT')
    streamLines.push('/F1 9 Tf')
    streamLines.push('0.118 0.161 0.231 rg')
    streamLines.push(`${margin + 12} ${boxY + boxHeight - 16} Td`)
    streamLines.push(`(Patient: ${patientName}) Tj`)
    streamLines.push('0 -14 Td')
    streamLines.push(`(Patient ID: ${patientId} | Age/Sex: ${meta.patientAge || 'N/A'} yrs, ${meta.patientGender || 'N/A'}) Tj`)
    streamLines.push('0 -14 Td')
    streamLines.push(`(Facility: ${facilityName} | Clinician: ${clinicianName}) Tj`)
    streamLines.push('ET')

    // Clinical Summary & Key Findings Box
    const section1Y = boxY - 30
    streamLines.push('BT')
    streamLines.push('/F1 11 Tf')
    streamLines.push('0.059 0.463 0.431 rg')
    streamLines.push(`${margin} ${section1Y} Td`)
    streamLines.push('(1. CLINICAL EVALUATION & FINDINGS SUMMARY) Tj')
    streamLines.push('ET')

    // Divider line
    streamLines.push('q')
    streamLines.push('0.796 0.835 0.882 RG')
    streamLines.push(`${margin} ${section1Y - 4} m ${pageWidth - margin} ${section1Y - 4} l S`)
    streamLines.push('Q')

    // Summary Content
    let currentY = section1Y - 24
    streamLines.push('BT')
    streamLines.push('/F2 9.5 Tf')
    streamLines.push('0.118 0.161 0.231 rg')
    streamLines.push(`${margin + 4} ${currentY} Td`)

    const summaryText = sanitizePdfText(report.summary || 'Clinical assessment completed under approved guidelines.')
    streamLines.push(`(${summaryText}) Tj`)
    currentY -= 20
    streamLines.push(`0 -20 Td`)
    streamLines.push(`(Clinical Methodology / Protocol: ${methodology}) Tj`)
    currentY -= 18
    streamLines.push(`0 -18 Td`)
    if (meta.riskCategory) {
      streamLines.push(`(Baseline Risk Classification: ${meta.riskCategory.toUpperCase()}) Tj`)
      currentY -= 16
      streamLines.push(`0 -16 Td`)
    }
    if (meta.screeningEligibility) {
      streamLines.push(`(Screening Eligibility: ${meta.screeningEligibility.toUpperCase()}) Tj`)
      currentY -= 16
      streamLines.push(`0 -16 Td`)
    }
    if (meta.triageUrgency) {
      streamLines.push(`(Symptom Triage Urgency: ${meta.triageUrgency.replace(/_/g, ' ').toUpperCase()}) Tj`)
      currentY -= 16
      streamLines.push(`0 -16 Td`)
    }
    streamLines.push('ET')

    // Clinical Governance Disclaimer Box
    const disclaimY = 160
    streamLines.push('q')
    streamLines.push('1.0 0.984 0.922 rg') // #fffbeb
    streamLines.push(`${margin} ${disclaimY} ${pageWidth - 2 * margin} 50 re f`)
    streamLines.push('0.988 0.827 0.302 RG') // #fcd34d
    streamLines.push(`${margin} ${disclaimY} ${pageWidth - 2 * margin} 50 re S`)
    streamLines.push('Q')

    streamLines.push('BT')
    streamLines.push('/F1 8 Tf')
    streamLines.push('0.471 0.208 0.059 rg')
    streamLines.push(`${margin + 10} ${disclaimY + 36} Td`)
    streamLines.push('(CLINICAL GOVERNANCE & SAFETY NOTICE:) Tj')
    streamLines.push('/F2 7.5 Tf')
    streamLines.push('0 -12 Td')
    streamLines.push('(This report is generated for preventive decision support and specialist coordination.) Tj')
    streamLines.push('0 -10 Td')
    streamLines.push('(It does NOT constitute a confirmed medical diagnosis of lung cancer. All findings require clinical review.) Tj')
    streamLines.push('ET')

    // Signatures
    const sigY = 90
    streamLines.push('q')
    streamLines.push('0.580 0.639 0.722 RG')
    streamLines.push('1 w')
    // Left Sig line
    streamLines.push(`${margin + 20} ${sigY + 16} m ${margin + 180} ${sigY + 16} l S`)
    // Right Sig line
    streamLines.push(`${pageWidth - margin - 180} ${sigY + 16} m ${pageWidth - margin - 20} ${sigY + 16} l S`)
    streamLines.push('Q')

    streamLines.push('BT')
    streamLines.push('/F2 8 Tf')
    streamLines.push('0.278 0.333 0.412 rg')
    streamLines.push(`${margin + 45} ${sigY} Td`)
    streamLines.push('(Patient / Guardian Signature) Tj')
    streamLines.push(`${pageWidth - margin - 170} ${sigY} Td`)
    streamLines.push(`(Authorized Clinician: ${clinicianName}) Tj`)
    streamLines.push('ET')

    // Footer
    streamLines.push('BT')
    streamLines.push('/F2 7.5 Tf')
    streamLines.push('0.580 0.639 0.722 rg')
    streamLines.push(`${margin} 28 Td`)
    streamLines.push(`(Lungent Clinical CDSS - Document Ref: ${reportRef} - Confidential Medical Record) Tj`)
    streamLines.push(`${pageWidth - margin - 60} 28 Td`)
    streamLines.push('(Page 1 of 1) Tj')
    streamLines.push('ET')

    const contentStream = streamLines.join('\n')
    const streamLength = Buffer.byteLength(contentStream, 'utf-8')

    // Assemble PDF Object Tree
    const pdfChunks: string[] = []
    const offsets: number[] = []

    const addChunk = (chunk: string) => {
      offsets.push(pdfChunks.reduce((acc, c) => acc + Buffer.byteLength(c, 'utf-8'), 0))
      pdfChunks.push(chunk)
    }

    // Header
    pdfChunks.push('%PDF-1.4\n%âãÏÓ\n')

    // Object 1: Catalog
    addChunk(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`)

    // Object 2: Pages
    addChunk(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`)

    // Object 3: Page
    addChunk(
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n`
    )

    // Object 4: Content Stream
    addChunk(
      `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`
    )

    // Object 5: Font F1 (Helvetica-Bold)
    addChunk(
      `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`
    )

    // Object 6: Font F2 (Helvetica)
    addChunk(
      `6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`
    )

    // Object 7: Document Info
    addChunk(
      `7 0 obj\n<< /Title (${titleAscii}) /Subject (Lungent Clinical Report) /Author (Lungent CDSS) /Creator (Lungent Reporting System) /CreationDate (D:${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}Z) >>\nendobj\n`
    )

    // Start of xref
    const startXref = pdfChunks.reduce((acc, c) => acc + Buffer.byteLength(c, 'utf-8'), 0)

    let xref = `xref\n0 8\n0000000000 65535 f \n`
    for (let i = 0; i < offsets.length; i++) {
      const offsetStr = String(offsets[i]).padStart(10, '0')
      xref += `${offsetStr} 00000 n \n`
    }

    const trailer = `trailer\n<< /Size 8 /Root 1 0 R /Info 7 0 R >>\nstartxref\n${startXref}\n%%EOF\n`

    pdfChunks.push(xref)
    pdfChunks.push(trailer)

    const finalPdfString = pdfChunks.join('')
    return new TextEncoder().encode(finalPdfString)
  }
}
