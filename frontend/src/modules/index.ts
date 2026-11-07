export * from './authentication'
export * from './patients'
export * from './facilities'
export * from './assessments'
export * from './risk-estimation'
export * from './screening'
export * from './triage'
export * from './referrals'
export * from './environmental'
export * from './notifications'
export * from './reporting'
export * from './governance'
export * from './security'
export * from './anomaly'
export * from './clinical-intelligence'
export * from './population-intelligence'
export * from './integrations'
export * from './operational-intelligence'
export * from './expansion'
export * from './international'

export const REGISTERED_MODULES = [
  'authentication',
  'patients',
  'facilities',
  'assessments',
  'risk-estimation',
  'screening',
  'triage',
  'referrals',
  'environmental',
  'notifications',
  'reporting',
  'governance',
  'security',
  'anomaly',
  'clinical-intelligence',
  'population-intelligence',
  'integrations',
  'operational-intelligence',
  'expansion',
  'international',
] as const
