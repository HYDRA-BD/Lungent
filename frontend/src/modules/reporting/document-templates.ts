/**
 * Phase 1.20: Standardized Localized Document Templates
 *
 * Provides printable and downloadable clinical document structures in English and Bangla.
 * Implements clean print stylesheets, Bangla font rendering, canonical ID preservation,
 * and mandatory non-diagnostic disclaimers.
 */

import type { SupportedLocale } from '@/i18n/config'
import {
  formatDate,
  formatPackYears,
  preserveCanonicalIdentifier,
} from '@/i18n/formatters'
import { getClinicalTerm } from '@/i18n/clinical-terminology'

export interface ClinicalReportDocumentProps {
  reportId: string
  patientId: string
  patientName: string
  patientAge: number
  patientGender: string
  smokingPackYears: number
  riskCategory: 'low' | 'moderate' | 'high' | 'very_high'
  screeningEligibility: 'eligible' | 'ineligible' | 'requires_review'
  concerningSymptoms?: string[]
  assignedFacilityName: string
  clinicianName?: string
  clinicianLicenseNumber?: string
  generatedAt: string
  methodologyVersion: string
  locale: SupportedLocale
}

export interface ReferralLetterDocumentProps {
  referralId: string
  patientId: string
  patientName: string
  patientAge: number
  referringFacilityName: string
  destinationFacilityName: string
  clinicalIndication: string
  priority: 'routine' | 'urgent_2ww'
  recommendedDate: string
  specialistInstructions?: string
  referringClinicianName: string
  generatedAt: string
  locale: SupportedLocale
}

export interface FollowUpPlanDocumentProps {
  followUpId: string
  patientId: string
  patientName: string
  purpose: string
  scheduledDate: string
  facilityName: string
  instructions?: string
  generatedAt: string
  locale: SupportedLocale
}

/**
 * Generates an accessible, printable HTML string for a Patient Clinical Risk Assessment Report.
 */
export function generateAssessmentReportHtml(props: ClinicalReportDocumentProps): string {
  const isBn = props.locale === 'bn'
  const lang = isBn ? 'bn' : 'en'

  const title = isBn
    ? 'ফুসফুস স্বাস্থ্য মূল্যায়ন ও প্রাথমিক ঝুঁকি সারসংক্ষেপ'
    : 'Lung Health Assessment & Baseline Clinical Risk Summary'

  const nonDiagnosticNotice = isBn
    ? 'ক্লিনিক্যাল সুরক্ষা বিজ্ঞপ্তি: এই সারসংক্ষেপটি কেবল প্রাথমিক পর্যবেক্ষণ ও ক্লিনিক্যাল সিদ্ধান্ত গ্রহণের সহায়তার জন্য। এটি কোনোভাবেই ফুসফুসের ক্যান্সারের নিশ্চিত রোগ নির্ণয় নয়।'
    : 'Clinical Safety Notice: This assessment summary coordinates care and specialist evaluation. It does NOT constitute a confirmed medical diagnosis of lung cancer.'

  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — ${preserveCanonicalIdentifier(props.patientId)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
    body {
      font-family: ${isBn ? "'Hind Siliguri', sans-serif" : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"};
      color: #1e293b;
      line-height: ${isBn ? '1.7' : '1.5'};
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
    }
    .header { border-bottom: 2px solid #0f766e; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 24px; font-weight: 700; color: #0f766e; }
    .title { font-size: 18px; font-weight: 600; margin-top: 4px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; background: #f8fafc; padding: 16px; border-radius: 8px; font-size: 14px; }
    .section-title { font-size: 16px; font-weight: 700; color: #0f766e; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 13px; }
    .badge-urgent { background: #fee2e2; color: #991b1b; }
    .badge-routine { background: #e0f2fe; color: #0369a1; }
    .disclaimer { background: #fef3c7; border-left: 4px solid #d97706; padding: 12px; border-radius: 4px; font-size: 13px; color: #92400e; margin-top: 24px; }
    .signature-area { margin-top: 48px; display: flex; justify-content: space-between; font-size: 13px; }
    .sig-line { border-top: 1px dashed #64748b; width: 220px; padding-top: 6px; text-align: center; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">Lungent — Intelligent Lung Health Assessment</div>
    <div class="title">${title}</div>
    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
      ${isBn ? 'রিপোর্ট কোড' : 'Report Reference'}: <strong>${preserveCanonicalIdentifier(props.reportId)}</strong> | 
      ${isBn ? 'তারিখ' : 'Date'}: ${formatDate(props.generatedAt, props.locale)} | 
      ${isBn ? 'সংস্করণ' : 'Methodology'}: ${props.methodologyVersion}
    </div>
  </div>

  <div class="meta-grid">
    <div><strong>${isBn ? 'রোগীর সনাক্তকারী আইডি' : 'Patient Identifier'}:</strong> ${preserveCanonicalIdentifier(props.patientId)}</div>
    <div><strong>${isBn ? 'পূর্ণ নাম' : 'Full Name'}:</strong> ${props.patientName}</div>
    <div><strong>${isBn ? 'বয়স ও লিঙ্গ' : 'Age & Gender'}:</strong> ${props.patientAge} ${isBn ? 'বছর' : 'years'}, ${props.patientGender}</div>
    <div><strong>${isBn ? 'ধূমপানের মাত্রা' : 'Cumulative Tobacco Exposure'}:</strong> ${formatPackYears(props.smokingPackYears, props.locale)}</div>
    <div><strong>${isBn ? 'চিকিৎসা কেন্দ্র' : 'Healthcare Facility'}:</strong> ${props.assignedFacilityName}</div>
    <div><strong>${isBn ? 'তত্ত্বাবধায়ক চিকিৎসক' : 'Reviewing Clinician'}:</strong> ${props.clinicianName || (isBn ? 'পর্যালোচনার অপেক্ষায়' : 'Pending Review')}</div>
  </div>

  <div class="section-title">${isBn ? 'ঝুঁকি মূল্যায়ন ও স্ক্রীনিং ফলাফল' : 'Clinical Risk & Screening Status'}</div>
  <p>
    <strong>${getClinicalTerm('risk_estimation', 'clinician', props.locale)}:</strong>
    <span class="badge ${props.riskCategory === 'high' || props.riskCategory === 'very_high' ? 'badge-urgent' : 'badge-routine'}">
      ${props.riskCategory.toUpperCase()}
    </span>
  </p>
  <p>
    <strong>${getClinicalTerm('screening_eligibility', 'clinician', props.locale)}:</strong>
    <span class="badge ${props.screeningEligibility === 'eligible' ? 'badge-routine' : 'badge-urgent'}">
      ${props.screeningEligibility === 'eligible' ? (isBn ? 'যোগ্য (বাৎসরিক LDCT নির্দেশিত)' : 'Eligible for Annual LDCT') : (isBn ? 'স্ক্রীনিং অনুপযুক্ত' : 'Ineligible')}
    </span>
  </p>

  ${
    props.concerningSymptoms && props.concerningSymptoms.length > 0
      ? `
  <div class="section-title">${isBn ? 'চিহ্নিত উদ্বেগজনক লক্ষণসমূহ' : 'Identified Concerning Symptoms'}</div>
  <ul>
    ${props.concerningSymptoms.map((s) => `<li>${s}</li>`).join('')}
  </ul>
  `
      : ''
  }

  <div class="disclaimer">
    <strong>${isBn ? 'ক্লিনিক্যাল নির্দেশনা:' : 'Clinical Governance Notice:'}</strong> ${nonDiagnosticNotice}
  </div>

  <div class="signature-area">
    <div class="sig-line">
      ${isBn ? 'রোগীর স্বাক্ষর / টিপসহি' : 'Patient / Guardian Signature'}
    </div>
    <div class="sig-line">
      ${props.clinicianName || (isBn ? 'অনুমোদিত চিকিৎসক' : 'Authorized Clinician')}<br>
      <small>${props.clinicianLicenseNumber ? `BMDC: ${props.clinicianLicenseNumber}` : ''}</small>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generates an accessible, printable HTML string for a Specialist Referral Consultation Letter.
 */
export function generateReferralLetterHtml(props: ReferralLetterDocumentProps): string {
  const isBn = props.locale === 'bn'
  const lang = isBn ? 'bn' : 'en'

  const title = isBn
    ? 'বিশেষজ্ঞ পালমোনোলজি ও অনকোলজি পরামর্শ রেফারেল পত্র'
    : 'Specialist Pulmonary & Oncology Consultation Referral Letter'

  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — ${preserveCanonicalIdentifier(props.referralId)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
    body {
      font-family: ${isBn ? "'Hind Siliguri', sans-serif" : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"};
      color: #1e293b;
      line-height: ${isBn ? '1.7' : '1.5'};
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
    }
    .header { border-bottom: 2px solid #0f766e; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: 700; color: #0f766e; }
    .badge-urgent { background: #fee2e2; color: #991b1b; padding: 4px 10px; font-weight: bold; border-radius: 4px; }
    .badge-routine { background: #e0f2fe; color: #0369a1; padding: 4px 10px; font-weight: bold; border-radius: 4px; }
    .disclaimer { background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 12px; color: #475569; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">Lungent Referral Network</div>
    <div style="font-size: 18px; font-weight: 600; margin-top: 4px;">${title}</div>
    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
      ${isBn ? 'রেফারেল কোড' : 'Referral ID'}: <strong>${preserveCanonicalIdentifier(props.referralId)}</strong> | 
      ${isBn ? 'তারিখ' : 'Date'}: ${formatDate(props.generatedAt, props.locale)}
    </div>
  </div>

  <p>
    <strong>${isBn ? 'অগ্রাধিকার স্তর' : 'Priority Pathway'}:</strong>
    <span class="${props.priority === 'urgent_2ww' ? 'badge-urgent' : 'badge-routine'}">
      ${props.priority === 'urgent_2ww' ? (isBn ? 'জরুরি ২-সপ্তাহ ফাস্ট-ট্র্যাক' : 'URGENT 2-WEEK WAIT') : (isBn ? 'নিয়মিত পরামর্শ' : 'ROUTINE')}
    </span>
  </p>

  <p><strong>${isBn ? 'প্রেরণকারী কেন্দ্র' : 'Referring Facility'}:</strong> ${props.referringFacilityName}</p>
  <p><strong>${isBn ? 'গন্তব্য বিশেষায়িত হাসপাতাল' : 'Destination Facility'}:</strong> ${props.destinationFacilityName}</p>
  <p><strong>${isBn ? 'রোগীর নাম ও আইডি' : 'Patient Name & ID'}:</strong> ${props.patientName} (${preserveCanonicalIdentifier(props.patientId)})</p>
  <p><strong>${isBn ? 'প্রস্তাবিত সাক্ষাতের তারিখ' : 'Recommended Consultation Date'}:</strong> ${formatDate(props.recommendedDate, props.locale)}</p>

  <div style="margin-top: 20px;">
    <strong>${isBn ? 'ক্লিনিক্যাল কারণ ও ইঙ্গিত' : 'Clinical Indication / Reason for Referral'}:</strong>
    <p style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
      ${props.clinicalIndication}
    </p>
  </div>

  ${
    props.specialistInstructions
      ? `
  <div style="margin-top: 16px;">
    <strong>${isBn ? 'রোগীর জন্য বিশেষ প্রস্তুতি ও নির্দেশনা' : 'Specialist Instructions for Patient'}:</strong>
    <p style="background: #f0fdf4; padding: 12px; border-radius: 6px; border: 1px solid #bbf7d0;">
      ${props.specialistInstructions}
    </p>
  </div>
  `
      : ''
  }

  <div class="disclaimer">
    ${isBn
      ? 'ক্লিনিক্যাল নিশ্চয়তা: এই রেফারেল পত্রটি বিশেষজ্ঞ চিকিৎসার সমন্বয় সাধনের উদ্দেশ্যে প্রেরিত। এটি চূড়ান্ত ফুসফুসের ক্যান্সার নির্ণয় নয়।'
      : 'Clinical Assurance: This referral letter coordinates clinical care and specialist evaluation. It does NOT constitute a confirmed medical diagnosis of lung cancer.'}
  </div>

  <div style="margin-top: 48px; text-align: right;">
    <div style="border-top: 1px dashed #64748b; display: inline-block; width: 240px; padding-top: 6px; text-align: center;">
      ${props.referringClinicianName}<br>
      <small>${isBn ? 'রেফারকারী চিকিৎসক' : 'Referring Clinician'}</small>
    </div>
  </div>
</body>
</html>
  `.trim()
}
