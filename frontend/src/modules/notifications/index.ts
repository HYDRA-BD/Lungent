/**
 * Notifications Module
 * Phase 1.19: Multi-Channel Alert & Notification Hub
 * Domain: In-app notifications, SMS, email reminders, screening appointments, and clinician alerts.
 */
export const NOTIFICATIONS_MODULE = {
  id: 'notifications',
  name: 'Multi-Channel Alert & Notification Hub',
  version: '1.19.0',
  description: 'Delivers multi-channel in-app, SMS, and email alerts for risk assessments, referrals, follow-ups, and urgent clinical escalations.',
} as const

export * from './types'
export * from './validation'
export * from './templates'
export * from './service'
export * from './actions'
export * from './components'
export * from './providers'
