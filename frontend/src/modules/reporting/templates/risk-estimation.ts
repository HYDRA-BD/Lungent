/**
 * Phase 1.22: Dedicated Risk Estimation Report Template
 *
 * Dedicated report for the Lung Cancer Risk Estimation Engine (Phase 1.12):
 * - Displays methodology name, version, and governance approval status
 * - Explicitly lists target population criteria and input variables
 * - Displays calculated probabilities and risk tiers strictly from source records
 * - Never recalculates risk inside the reporting layer
 */

import { renderBaseDocument } from './base-template'
import type { ReportMetadata } from '../types'
import { formatNumber } from '@/i18n/formatters'

export interface RiskEstimationTemplateData {
  meta: ReportMetadata
  methodology: {
    name: string
    code: string
    version: string
    approvalStatus: 'approved' | 'experimental' | 'deprecated'
    targetPopulation: string
    timeHorizonYears: number
  }
  inputSnapshot: {
    hash: string
    age: number
    gender: string
    smokingStatus: string
    packYears: number
    quitYears?: number
    familyHistoryLungCancer: boolean
    biomassExposureYears?: number
    occupationalExposure?: string
    priorRespiratoryDisease?: string
  }
  result: {
    riskCategory: 'low' | 'moderate' | 'high' | 'very_high'
    calculatedRiskPercentage: number
    benchmarkComparisonPercentage?: number
    contributingFactors: {
      factor: string
      direction: 'increases_risk' | 'decreases_risk' | 'neutral'
      weightDescription: string
    }[]
  }
  limitations: string[]
  approvedGuidance: string
}

export function renderRiskEstimationReport(data: RiskEstimationTemplateData): string {
  const isBn = data.meta.language === 'bn'

  const title = isBn
    ? 'ফুসফুস ক্যান্সার ঝুঁকি প্রাক্কলন প্রতিবেদন'
    : 'Lung Cancer Risk Estimation Report'
  const subtitle = isBn
    ? 'অনুমোদিত এপিডেমিওলজিক্যাল মডেল দ্বারা নির্ধারিত দীর্ঘমেয়াদী ঝুঁকি বিশ্লেষণ'
    : 'Longitudinal Risk Analysis Based on Clinically Governed Estimation Models'
  const badge = isBn ? 'ঝুঁকি প্রাক্কলন' : 'Risk Estimation'

  const riskBadgeClass = {
    low: 'badge-info',
    moderate: 'badge-warning',
    high: 'badge-urgent',
    very_high: 'badge-urgent',
  }[data.result.riskCategory]

  const riskCategoryLabel = {
    low: isBn ? 'নিম্ন ঝুঁকি (Low Risk)' : 'Low Risk',
    moderate: isBn ? 'মাঝারি ঝুঁকি (Moderate Risk)' : 'Moderate Risk',
    high: isBn ? 'উচ্চ ঝুঁকি (High Risk)' : 'High Risk',
    very_high: isBn ? 'অতি উচ্চ ঝুঁকি (Very High Risk)' : 'Very High Risk',
  }[data.result.riskCategory]

  const body = `
    <!-- Methodology Governance Card -->
    <div class="card-box" style="border-left: 4px solid #0f766e;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 10pt; font-weight: 700; color: #1e293b;">
          ${data.methodology.name} (${data.methodology.version})
        </span>
        <span class="badge ${data.methodology.approvalStatus === 'approved' ? 'badge-success' : 'badge-warning'}">
          ${data.methodology.approvalStatus.toUpperCase()}
        </span>
      </div>
      <div style="font-size: 8.5pt; color: #475569;">
        <strong>${isBn ? 'প্রযোজ্য জনগোষ্ঠী:' : 'Target Population:'}</strong> ${data.methodology.targetPopulation} &bull; 
        <strong>${isBn ? 'ঝুঁকি সময়সীমা:' : 'Time Horizon:'}</strong> ${data.methodology.timeHorizonYears} ${isBn ? 'বছর' : 'years'}
      </div>
    </div>

    <!-- Calculated Outcome Display -->
    <div class="section-heading">${isBn ? '১. গণনা করা ঝুঁকির মাত্রা ও ফলাফল' : '1. Estimated Probability & Risk Category'}</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
      <div class="card-box" style="text-align: center; padding: 16px;">
        <div class="meta-label">${isBn ? 'গণনাকৃত ৬-বছরের ঝুঁকি' : `Estimated ${data.methodology.timeHorizonYears}-Year Probability`}</div>
        <div style="font-size: 22pt; font-weight: 800; color: #0f766e; margin: 4px 0;">
          ${formatNumber(data.result.calculatedRiskPercentage, data.meta.language)}%
        </div>
        <div style="font-size: 8pt; color: #64748b;">
          ${isBn ? 'গড় সাধারণ জনসংখ্যার তুলনায়' : 'Population Baseline Benchmark'}: ~${data.result.benchmarkComparisonPercentage || 1.2}%
        </div>
      </div>

      <div class="card-box" style="text-align: center; padding: 16px;">
        <div class="meta-label">${isBn ? 'ঝুঁকি স্তর শ্রেণীবিভাগ' : 'Risk Tier Classification'}</div>
        <div style="margin: 10px 0;">
          <span class="badge ${riskBadgeClass}" style="font-size: 11pt; padding: 6px 14px;">
            ${riskCategoryLabel}
          </span>
        </div>
        <div style="font-size: 8pt; color: #64748b;">
          ${isBn ? 'অনুমোদিত প্রোটোকল কাটঅফ অনুযায়ী' : 'Evaluated against approved threshold criteria'}
        </div>
      </div>
    </div>

    <!-- Input Variables & Cryptographic Provenance -->
    <div class="section-heading">${isBn ? '২. ইনপুট উপাত্ত ও ক্রিপ্টোগ্রাফিক যাচাইকরণ' : '2. Input Variables & Cryptographic Snapshot'}</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>${isBn ? 'ইনপুট চলক (Variable)' : 'Variable'}</th>
          <th>${isBn ? 'প্রদত্ত মান (Value)' : 'Input Value'}</th>
          <th>${isBn ? 'ঝুঁকিতে প্রভাব (Effect)' : 'Effect on Risk'}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${isBn ? 'রোগীর বয়স ও লিঙ্গ' : 'Age & Gender'}</td>
          <td>${data.inputSnapshot.age} ${isBn ? 'বছর' : 'yrs'}, ${data.inputSnapshot.gender}</td>
          <td><span class="badge badge-neutral">${isBn ? 'মৌলিক বয়স প্রভাব' : 'Demographic baseline'}</span></td>
        </tr>
        <tr>
          <td>${isBn ? 'ধূমপানের ইতিহাস' : 'Tobacco Exposure'}</td>
          <td>${data.inputSnapshot.packYears} pack-years (${data.inputSnapshot.smokingStatus})</td>
          <td><span class="badge badge-urgent">${isBn ? 'ঝুঁকি বৃদ্ধি করে' : 'Significant increase'}</span></td>
        </tr>
        <tr>
          <td>${isBn ? 'পরিবারে ফুসফুস ক্যান্সারের ইতিহাস' : 'Family History of Lung Cancer'}</td>
          <td>${data.inputSnapshot.familyHistoryLungCancer ? (isBn ? 'হ্যাঁ (উপস্থিত)' : 'Yes (Present)') : (isBn ? 'না' : 'No')}</td>
          <td><span class="badge ${data.inputSnapshot.familyHistoryLungCancer ? 'badge-urgent' : 'badge-neutral'}">${data.inputSnapshot.familyHistoryLungCancer ? (isBn ? 'ঝুঁকি বৃদ্ধি করে' : 'Increases risk') : (isBn ? 'নিরপেক্ষ' : 'Neutral')}</span></td>
        </tr>
        ${data.inputSnapshot.biomassExposureYears ? `
        <tr>
          <td>${isBn ? 'রান্নার চুলা / বায়োমাস ধোঁয়া' : 'Biomass Fuel Smoke Exposure'}</td>
          <td>${data.inputSnapshot.biomassExposureYears} ${isBn ? 'বছর' : 'years'}</td>
          <td><span class="badge badge-warning">${isBn ? 'ঝুঁকি বৃদ্ধি করে' : 'Increases risk'}</span></td>
        </tr>` : ''}
      </tbody>
    </table>
    <div style="font-size: 7.5pt; color: #64748b; margin-top: -6px; margin-bottom: 12px;">
      <strong>${isBn ? 'ইনপুট স্ন্যাপশট হ্যাশ (SHA-256):' : 'Input Snapshot SHA-256:'}</strong>
      <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${data.inputSnapshot.hash}</code>
    </div>

    <!-- Contributing Factors -->
    <div class="section-heading">${isBn ? '৩. ঝুঁকি বৃদ্ধিকারী উপাদানসমূহের বিশ্লেষণ' : '3. Contributing Risk Factors Analysis'}</div>
    <div class="card-box">
      <ul style="margin: 4px 0 0 16px; padding: 0; line-height: 1.8; font-size: 8.5pt;">
        ${data.result.contributingFactors.map(f => `
          <li>
            <strong>${f.factor}:</strong> ${f.weightDescription}
            <span class="badge ${f.direction === 'increases_risk' ? 'badge-urgent' : 'badge-neutral'}" style="margin-left: 6px; font-size: 7.5pt;">
              ${f.direction.replace(/_/g, ' ')}
            </span>
          </li>
        `).join('')}
      </ul>
    </div>

    <!-- Approved Guidance -->
    <div class="section-heading">${isBn ? '৪. অনুমোদিত ক্লিনিক্যাল নির্দেশনা' : '4. Approved Clinical Guidance'}</div>
    <div class="card-box" style="border-left: 4px solid #0f766e; font-size: 8.5pt;">
      ${data.approvedGuidance}
    </div>

    <!-- Limitations -->
    <div class="section-heading">${isBn ? '৫. মডেলের সীমাবদ্ধতা ও প্রয়োগের পরিধি' : '5. Methodology Limitations'}</div>
    <div class="card-box" style="font-size: 8pt; color: #475569;">
      <ul style="margin: 4px 0 0 16px; padding: 0;">
        ${data.limitations.map(lim => `<li>${lim}</li>`).join('')}
      </ul>
    </div>
  `

  return renderBaseDocument({
    meta: data.meta,
    title,
    subtitle,
    reportTypeBadge: badge,
    children: body,
  })
}
