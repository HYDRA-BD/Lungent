/**
 * Phase 1.22: Base Report Template & Print Stylesheet
 *
 * Provides standardized document skeleton, header, footer,
 * typography (Hind Siliguri for Bangla), canonical ID safeguarding,
 * and clinical safety non-diagnostic caveats.
 */

import type { ReportMetadata } from '../types'
import { preserveCanonicalIdentifier, formatDate } from '@/i18n/formatters'

export interface BaseTemplateProps {
  meta: ReportMetadata
  title: string
  subtitle?: string
  reportTypeBadge: string
  children: string
}

export function renderBaseDocument(props: BaseTemplateProps): string {
  const isBn = props.meta.language === 'bn'
  const lang = isBn ? 'bn' : 'en'

  const nonDiagnosticNotice = isBn
    ? 'ক্লিনিক্যাল সুরক্ষা ও আইনগত সতর্কতা: লুনজেন্ট প্ল্যাটফর্মের এই মূল্যায়ন প্রতিবেদনটি কেবল প্রাথমিক স্বাস্থ্য ঝুঁকি স্ক্রীনিং ও সিদ্ধান্ত গ্রহণের সহায়তার উদ্দেশ্যে প্রণীত। এটি কোনোভাবেই ফুসফুসের ক্যান্সারের নিশ্চিত বা চূড়ান্ত চিকিৎসা নির্ণয় (Definitive Medical Diagnosis) নয়। যেকোনো সিদ্ধান্ত চিকিৎসকের প্রত্যক্ষ তত্ত্বাবধানে গ্রহণীয়।'
    : 'Clinical Governance & Safety Notice: This evaluation summary coordinates preventive care and specialist assessment. It does NOT constitute a definitive medical diagnosis of lung cancer. All clinical determinations must be made by an authorized physician.'

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${props.title} — ${preserveCanonicalIdentifier(props.meta.reportReference)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 18mm 14mm 20mm 14mm;
      @bottom-right {
        content: counter(page);
        font-family: ${isBn ? "'Hind Siliguri', sans-serif" : "'Inter', sans-serif"};
        font-size: 9pt;
        color: #64748b;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: ${isBn ? "'Hind Siliguri', -apple-system, sans-serif" : "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"};
      color: #0f172a;
      line-height: ${isBn ? '1.75' : '1.55'};
      font-size: 10pt;
      margin: 0;
      padding: 24px;
      background: #ffffff;
    }

    .report-container {
      max-width: 820px;
      margin: 0 auto;
    }

    .report-header {
      border-bottom: 2px solid #0f766e;
      padding-bottom: 14px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .brand-title {
      font-size: 18pt;
      font-weight: 700;
      color: #0f766e;
      letter-spacing: -0.02em;
    }

    .brand-tagline {
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 2px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .doc-title {
      font-size: 14pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 8px;
    }

    .doc-subtitle {
      font-size: 9.5pt;
      color: #475569;
      margin-top: 2px;
    }

    .header-meta {
      text-align: right;
      font-size: 8.5pt;
      color: #475569;
      line-height: 1.4;
    }

    .badge-report-type {
      display: inline-block;
      padding: 3px 8px;
      background: #ccfbf1;
      color: #0f766e;
      border-radius: 4px;
      font-weight: 700;
      font-size: 8pt;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .patient-banner {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px 14px;
      margin-bottom: 20px;
      font-size: 9pt;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-size: 7.5pt;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
      letter-spacing: 0.04em;
    }

    .meta-value {
      font-weight: 600;
      color: #1e293b;
      margin-top: 2px;
    }

    .canonical-id {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 700;
      color: #0f766e;
    }

    .section-heading {
      font-size: 11pt;
      font-weight: 700;
      color: #0f766e;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 18px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }

    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 8.5pt;
    }

    .badge-urgent { background: #fee2e2; color: #991b1b; border: 1px solid #f87171; }
    .badge-warning { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
    .badge-info { background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; }
    .badge-success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .badge-neutral { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }

    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 16px 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }

    table.data-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    table.data-table td {
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }

    table.data-table tr:nth-child(even) td {
      background: #fafafa;
    }

    .card-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px 14px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }

    .alert-box {
      border-radius: 6px;
      padding: 12px 14px;
      margin: 14px 0;
      font-size: 8.5pt;
      line-height: 1.5;
      page-break-inside: avoid;
    }

    .alert-danger {
      background: #fff1f2;
      border-left: 4px solid #e11d48;
      color: #881337;
    }

    .alert-warning {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      color: #78350f;
    }

    .alert-info {
      background: #f0f9ff;
      border-left: 4px solid #0284c7;
      color: #0c4a6e;
    }

    .disclaimer-box {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-radius: 6px;
      padding: 10px 12px;
      margin-top: 22px;
      font-size: 8pt;
      color: #78350f;
      page-break-inside: avoid;
    }

    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-top: 36px;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }

    .sig-block {
      border-top: 1px dashed #94a3b8;
      padding-top: 8px;
      text-align: center;
      color: #334155;
    }

    .report-footer {
      margin-top: 32px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 7.5pt;
      color: #94a3b8;
      page-break-inside: avoid;
    }

    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      a {
        text-decoration: none;
        color: inherit;
      }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <!-- Header -->
    <header class="report-header">
      <div>
        <div class="brand-title">LUNGENT</div>
        <div class="brand-tagline">${isBn ? 'বুদ্ধিমান ফুসফুস স্বাস্থ্য প্ল্যাটফর্ম' : 'Intelligent Lung Health Assessment'}</div>
        <div class="doc-title">${props.title}</div>
        ${props.subtitle ? `<div class="doc-subtitle">${props.subtitle}</div>` : ''}
      </div>
      <div class="header-meta">
        <span class="badge-report-type">${props.reportTypeBadge}</span>
        <div><strong>${isBn ? 'রিপোর্ট কোড' : 'Report ID'}:</strong> <span class="canonical-id">${preserveCanonicalIdentifier(props.meta.reportReference)}</span></div>
        <div><strong>${isBn ? 'তারিখ' : 'Generated'}:</strong> ${formatDate(props.meta.generatedAt, props.meta.language)}</div>
        <div><strong>${isBn ? 'ভাষা' : 'Language'}:</strong> ${isBn ? 'বাংলা (Bangla)' : 'English'}</div>
        ${props.meta.facilityName ? `<div><strong>${isBn ? 'স্বাস্থ্যকেন্দ্র' : 'Facility'}:</strong> ${props.meta.facilityName}</div>` : ''}
      </div>
    </header>

    <!-- Patient Banner -->
    <div class="patient-banner">
      <div class="meta-item">
        <span class="meta-label">${isBn ? 'রোগীর পূর্ণ নাম' : 'Patient Full Name'}</span>
        <span class="meta-value">${props.meta.patientName}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">${isBn ? 'লুনজেন্ট পেশেন্ট আইডি' : 'Lungent Patient ID'}</span>
        <span class="meta-value canonical-id">${preserveCanonicalIdentifier(props.meta.patientCanonicalId || props.meta.patientId)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">${isBn ? 'বয়স ও লিঙ্গ' : 'Age & Gender'}</span>
        <span class="meta-value">${props.meta.patientAge} ${isBn ? 'বছর' : 'years'}, ${props.meta.patientGender}</span>
      </div>
    </div>

    <!-- Main Content Area -->
    <main>
      ${props.children}
    </main>

    <!-- Governance Disclaimer -->
    <div class="disclaimer-box">
      <strong>${isBn ? 'ক্লিনিক্যাল নির্দেশনা ও সতর্কতা:' : 'Clinical Governance Notice:'}</strong> ${nonDiagnosticNotice}
    </div>

    <!-- Signatures -->
    <div class="signature-grid">
      <div class="sig-block">
        ${isBn ? 'রোগী / অভিভাবকের স্বাক্ষর বা টিপসহি' : 'Patient / Legal Guardian Signature'}<br>
        <span style="font-size: 7.5pt; color: #64748b;">${isBn ? 'তারিখ:' : 'Date:'} ____________________</span>
      </div>
      <div class="sig-block">
        <strong>${props.meta.reviewingClinicianName || (isBn ? 'দায়িত্বপ্রাপ্ত চিকিৎসক' : 'Reviewing Clinician')}</strong><br>
        <span style="font-size: 7.5pt; color: #64748b;">
          ${props.meta.reviewingClinicianLicense ? `BMDC No: ${props.meta.reviewingClinicianLicense} | ` : ''}
          ${isBn ? 'স্বাক্ষর ও সিল' : 'Signature & Seal'}
        </span>
      </div>
    </div>

    <!-- Footer -->
    <footer class="report-footer">
      <div>Lungent Clinical CDSS &bull; Version ${props.meta.templateVersion} &bull; ${preserveCanonicalIdentifier(props.meta.reportReference)}</div>
      <div>${isBn ? 'অনুমোদিত ক্লিনিক্যাল প্রোটোকল অনুযায়ী প্রস্তুতকৃত' : 'Generated in compliance with approved clinical guidelines'}</div>
    </footer>
  </div>
</body>
</html>`
}
