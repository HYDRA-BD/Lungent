/**
 * Phase 1.22: Reporting Module
 * Domain: Clinical assessment PDF generation, aggregate epidemiology dashboards, and screening statistics.
 * Enhanced in Phase 1.22 with full centralized reporting architecture, 6 dedicated templates,
 * server-side PDF generator, and access auditing.
 */

export const REPORTING_MODULE = {
  id: 'reporting',
  name: 'Clinical Reporting & Analytical Summaries',
  version: '1.22.0',
  description: 'Centralized bilingual clinical assessment reporting system with dedicated templates, server-side PDF generation, and audit logging.',
} as const

export * from './types'
export * from './service'
export * from './actions'
export * from './pdf-generator'
export * from './data-retriever'
export * from './templates/base-template'
export * from './templates/patient-assessment'
export * from './templates/clinical-assessment'
export * from './templates/risk-estimation'
export * from './templates/screening-eligibility'
export * from './templates/symptom-triage'
export * from './templates/referral-followup'
export * from './templates/consolidated-history'
export * from './components/report-card'
export * from './components/report-viewer-modal'
export * from './components/report-history-table'
export * from './components/generate-report-dialog'
export * from './document-templates'
