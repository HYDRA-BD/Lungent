/**
 * Phase 1.19: Notification Templates & Localization Registry
 *
 * Implements bilingual templates (English & Bangla) for In-App, SMS, and Email.
 * Enforces sanitization and non-diagnostic privacy principles.
 */

import type {
  NotificationEventType,
  NotificationCategory,
  NotificationPriority,
  NotificationChannel,
} from './types'

export interface NotificationTemplateDefinition {
  eventType: NotificationEventType
  category: NotificationCategory
  defaultPriority: NotificationPriority
  defaultChannels: NotificationChannel[]
  actionUrlPath: (variables: Record<string, string>) => string
  en: {
    title: string
    body: string
    smsBody: string
    emailSubject: string
    emailHtml: string
  }
  bn: {
    title: string
    body: string
    smsBody: string
    emailSubject: string
    emailHtml: string
  }
}

// HTML sanitizer stripping dangerous elements/attributes while preserving benign text formatting
export function sanitizeHtml(str: string): string {
  let clean = str.replace(/<(script|iframe|object|embed)[\s\S]*?<\/\1>/gi, '')
  clean = clean.replace(/<(script|iframe|object|embed)[^>]*\/?>/gi, '')
  clean = clean.replace(/href\s*=\s*['"]?javascript:[^'">\s]*['"]?/gi, 'href="#"')
  clean = clean.replace(/\son[a-zA-Z]+\s*=\s*['"][^'"]*['"]/gi, '')
  return clean
}

export function interpolateTemplate(
  templateStr: string,
  variables: Record<string, string | number | boolean | null | undefined> = {},
  isHtml = false
): string {
  return templateStr.replace(/\{{1,2}\s*([a-zA-Z0-9_]+)\s*\}{1,2}/g, (_, key) => {
    const rawValue = variables[key]
    if (rawValue === undefined || rawValue === null) return ''
    const str = String(rawValue)
    return isHtml ? sanitizeHtml(str) : str
  })
}

export const NOTIFICATION_TEMPLATES: Record<NotificationEventType, NotificationTemplateDefinition> = {
  // 1. Account: Registration
  account_registered: {
    eventType: 'account_registered',
    category: 'account',
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'email'],
    actionUrlPath: () => '/profile',
    en: {
      title: 'Welcome to Lungent',
      body: 'Your account has been created successfully. Complete your profile to access personalized health assessments.',
      smsBody: 'Welcome to Lungent! Your account has been registered. Sign in at lungent.com/login to view your profile.',
      emailSubject: 'Welcome to Lungent — Account Registered',
      emailHtml: '<p>Dear {{recipientName}},</p><p>Welcome to <strong>Lungent</strong>. Your account has been registered successfully.</p><p>Please sign in to complete your profile and manage assessments securely.</p>',
    },
    bn: {
      title: 'লুনজেন্টে স্বাগতম',
      body: 'আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। স্বাস্থ্য মূল্যায়নে অংশ নিতে আপনার প্রোফাইল সম্পূর্ণ করুন।',
      smsBody: 'লুনজেন্টে স্বাগতম! আপনার অ্যাকাউন্ট নিবন্ধিত হয়েছে। lungent.com/login-এ সাইন ইন করুন।',
      emailSubject: 'লুনজেন্টে স্বাগতম — অ্যাকাউন্ট নিবন্ধন সম্পন্ন',
      emailHtml: '<p>সুপ্রিয় {{recipientName}},</p><p><strong>লুনজেন্ট</strong>-এ আপনাকে স্বাগতম। আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।</p><p>আপনার প্রোফাইল সম্পন্ন করতে অনুগ্রহ করে সাইন ইন করুন।</p>',
    },
  },

  // 2. Account: Password Reset
  password_reset_requested: {
    eventType: 'password_reset_requested',
    category: 'account',
    defaultPriority: 'urgent',
    defaultChannels: ['email', 'in_app'],
    actionUrlPath: () => '/reset-password',
    en: {
      title: 'Password Reset Requested',
      body: 'A password reset request was initiated for your account. If this was not you, please secure your account immediately.',
      smsBody: 'Lungent security alert: Password reset requested. If this was not you, contact support immediately.',
      emailSubject: 'Lungent — Password Reset Verification',
      emailHtml: '<p>A password reset request was submitted for your Lungent account.</p><p>If you requested this, click below to proceed with setting a new password.</p>',
    },
    bn: {
      title: 'পাসওয়ার্ড রিসেটের অনুরোধ',
      body: 'আপনার অ্যাকাউন্টের জন্য পাসওয়ার্ড রিসেটের অনুরোধ করা হয়েছে। এটি আপনি না করে থাকলে অবিলম্বে অ্যাকাউন্ট সুরক্ষিত করুন।',
      smsBody: 'লুনজেন্ট সুরক্ষা সতর্কতা: পাসওয়ার্ড রিসেটের অনুরোধ করা হয়েছে। এটি আপনি না হলে জরুরি সহায়তা নিন।',
      emailSubject: 'লুনজেন্ট — পাসওয়ার্ড রিসেট যাচাইকরণ',
      emailHtml: '<p>আপনার লুনজেন্ট অ্যাকাউন্টের জন্য পাসওয়ার্ড রিসেটের আবেদন করা হয়েছে।</p><p>আপনি করে থাকলে নিচের লিংকে ক্লিক করে নতুন পাসওয়ার্ড নির্ধারণ করুন।</p>',
    },
  },

  // 3. Account: Profile Updated
  profile_updated: {
    eventType: 'profile_updated',
    category: 'account',
    defaultPriority: 'low',
    defaultChannels: ['in_app'],
    actionUrlPath: () => '/profile',
    en: {
      title: 'Profile Updated',
      body: 'Your personal information and contact details have been successfully updated.',
      smsBody: 'Lungent: Your account profile has been updated.',
      emailSubject: 'Lungent — Account Profile Updated',
      emailHtml: '<p>Your account profile information has been updated successfully.</p>',
    },
    bn: {
      title: 'প্রোফাইল আপডেট হয়েছে',
      body: 'আপনার ব্যক্তিগত তথ্য ও যোগাযোগের বিবরণ সফলভাবে আপডেট করা হয়েছে।',
      smsBody: 'লুনজেন্ট: আপনার অ্যাকাউন্ট প্রোফাইল আপডেট হয়েছে।',
      emailSubject: 'লুনজেন্ট — অ্যাকাউন্ট প্রোফাইল আপডেট সম্পন্ন',
      emailHtml: '<p>আপনার অ্যাকাউন্টের প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে।</p>',
    },
  },

  // 4. Account: Consent Updated
  consent_updated: {
    eventType: 'consent_updated',
    category: 'account',
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'email'],
    actionUrlPath: () => '/patient/privacy',
    en: {
      title: 'Privacy & Consent Preferences Updated',
      body: 'Your consent settings have been modified. You can review your permissions at any time.',
      smsBody: 'Lungent: Your privacy and consent preferences have been updated.',
      emailSubject: 'Lungent — Consent Preferences Updated',
      emailHtml: '<p>Your consent preferences have been updated in accordance with healthcare privacy standards.</p>',
    },
    bn: {
      title: 'সম্মতি ও গোপনীয়তা সেটিংস আপডেট হয়েছে',
      body: 'আপনার সম্মতি সেটিংস পরিবর্তিত হয়েছে। আপনি যেকোনো সময় আপনার অনুমতি পর্যালোচনা করতে পারেন।',
      smsBody: 'লুনজেন্ট: আপনার সম্মতি সেটিংস পরিবর্তিত হয়েছে।',
      emailSubject: 'লুনজেন্ট — সম্মতি সেটিংস আপডেট',
      emailHtml: '<p>স্বাস্থ্যসেবার গোপনীয়তা নীতি অনুযায়ী আপনার সম্মতির রেকর্ড আপডেট হয়েছে।</p>',
    },
  },

  // 5. Assessment: Submitted
  assessment_submitted: {
    eventType: 'assessment_submitted',
    category: 'assessment',
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'sms'],
    actionUrlPath: (vars) => vars.assessmentId ? `/patient/assessments/${vars.assessmentId}` : '/patient/assessments',
    en: {
      title: 'Lung Health Assessment Submitted',
      body: 'Your assessment {{assessmentId}} has been received and queued for automated preliminary screening verification.',
      smsBody: 'Lungent: Assessment {{assessmentId}} received. View status at lungent.com/patient/assessments.',
      emailSubject: 'Lungent — Assessment {{assessmentId}} Submitted',
      emailHtml: '<p>Dear {{recipientName}},</p><p>Your lung health assessment (ID: <strong>{{assessmentId}}</strong>) has been submitted successfully.</p><p>Sign in to monitor verification progress.</p>',
    },
    bn: {
      title: 'ফুসফুস স্বাস্থ্য মূল্যায়ন জমা হয়েছে',
      body: 'আপনার মূল্যায়ন {{assessmentId}} সফলভাবে গৃহীত হয়েছে এবং প্রাথমিক স্ক্রীনিং যাচাইয়ের জন্য অপেক্ষারত।',
      smsBody: 'লুনজেন্ট: আপনার মূল্যায়ন {{assessmentId}} গৃহীত হয়েছে। অগ্রগতি দেখতে lungent.com/patient/assessments-এ যান।',
      emailSubject: 'লুনজেন্ট — মূল্যায়ন {{assessmentId}} জমা সম্পন্ন',
      emailHtml: '<p>সুপ্রিয় {{recipientName}},</p><p>আপনার ফুসফুসের মূল্যায়ন (আইডি: <strong>{{assessmentId}}</strong>) সফলভাবে জমা হয়েছে।</p>',
    },
  },

  // 6. Assessment: Processing
  assessment_processing: {
    eventType: 'assessment_processing',
    category: 'assessment',
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
    actionUrlPath: (vars) => vars.assessmentId ? `/patient/assessments/${vars.assessmentId}` : '/patient/assessments',
    en: {
      title: 'Assessment Under Clinical Review',
      body: 'Assessment {{assessmentId}} is being evaluated by authorized respiratory decision-support algorithms.',
      smsBody: 'Lungent: Assessment {{assessmentId}} is being processed.',
      emailSubject: 'Lungent — Assessment Processing Status',
      emailHtml: '<p>Assessment {{assessmentId}} is currently being processed by clinical assessment algorithms.</p>',
    },
    bn: {
      title: 'মূল্যায়ন পর্যালোচিত হচ্ছে',
      body: 'মূল্যায়ন {{assessmentId}} বর্তমানে ক্লিনিক্যাল সাপোর্ট সিস্টেম দ্বারা পর্যালোচিত হচ্ছে।',
      smsBody: 'লুনজেন্ট: মূল্যায়ন {{assessmentId}} পর্যালোচিত হচ্ছে।',
      emailSubject: 'লুনজেন্ট — মূল্যায়ন প্রক্রিয়াকরণ স্ট্যাটাস',
      emailHtml: '<p>মূল্যায়ন {{assessmentId}} বর্তমানে পর্যালোচিত হচ্ছে।</p>',
    },
  },

  // 7. Assessment: Requires Info
  assessment_requires_info: {
    eventType: 'assessment_requires_info',
    category: 'assessment',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'sms', 'email'],
    actionUrlPath: (vars) => vars.assessmentId ? `/patient/assessments/${vars.assessmentId}` : '/patient/assessments',
    en: {
      title: 'Additional Information Required',
      body: 'Assessment {{assessmentId}} requires clarification regarding smoking history or exposure duration.',
      smsBody: 'Lungent: Additional info needed for assessment {{assessmentId}}. Sign in to complete details.',
      emailSubject: 'Lungent — Action Required: Clarification for Assessment {{assessmentId}}',
      emailHtml: '<p>Additional health exposure details are required to complete your clinical assessment evaluation.</p>',
    },
    bn: {
      title: 'অতিরিক্ত তথ্য প্রয়োজন',
      body: 'মূল্যায়ন {{assessmentId}} সম্পন্ন করতে ধূমপান বা ধোঁয়ার সংস্পর্শের মেয়াদ সম্পর্কে অতিরিক্ত তথ্য প্রয়োজন।',
      smsBody: 'লুনজেন্ট: মূল্যায়ন {{assessmentId}}-এর জন্য অতিরিক্ত তথ্য প্রয়োজন। অনুগ্রহ করে সাইন ইন করুন।',
      emailSubject: 'লুনজেন্ট — মনোযোগ প্রয়োজন: মূল্যায়ন {{assessmentId}}',
      emailHtml: '<p>আপনার স্বাস্থ্য মূল্যায়ন সম্পন্ন করতে কিছু অতিরিক্ত তথ্যের প্রয়োজন রয়েছে।</p>',
    },
  },

  // 8. Assessment: Results Available
  assessment_results_available: {
    eventType: 'assessment_results_available',
    category: 'assessment',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'sms', 'email'],
    actionUrlPath: (vars) => vars.assessmentId ? `/patient/assessments/${vars.assessmentId}` : '/patient/assessments',
    en: {
      title: 'Assessment Review Summary Available',
      body: 'Your clinical review summary for assessment {{assessmentId}} is now ready for secure review.',
      smsBody: 'Lungent: Your assessment summary {{assessmentId}} is ready. Sign in securely to view report.',
      emailSubject: 'Lungent — Assessment Summary Ready for Review',
      emailHtml: '<p>Dear {{recipientName}},</p><p>Your assessment evaluation has been completed. Sign in to your patient portal to review personalized preventive recommendations.</p><p><em>Notice: This assessment coordinates preventive screening and does not constitute a diagnosis of lung cancer.</em></p>',
    },
    bn: {
      title: 'মূল্যায়ন পর্যালোচনার ফলাফল প্রস্তুত',
      body: 'আপনার মূল্যায়ন {{assessmentId}}-এর ক্লিনিক্যাল পর্যালোচনা প্রস্তুত। সুরক্ষিতভাবে ফলাফল দেখুন।',
      smsBody: 'লুনজেন্ট: আপনার মূল্যায়ন {{assessmentId}}-এর ফলাফল প্রস্তুত। lungent.com-এ সাইন ইন করে দেখুন।',
      emailSubject: 'লুনজেন্ট — মূল্যায়ন পর্যালোচনার সারসংক্ষেপ প্রস্তুত',
      emailHtml: '<p>সুপ্রিয় {{recipientName}},</p><p>আপনার মূল্যায়ন সম্পন্ন হয়েছে। পোর্টাল থেকে ফলাফল ও প্রতিরোধমূলক পরামর্শ দেখুন।</p><p><em>সতর্কতা: এটি স্ক্রীনিং সমন্বয়ের জন্য এবং ফুসফুসের ক্যান্সারের নিশ্চিত নির্ণয় নয়।</em></p>',
    },
  },

  // 9. Assessment: Review Completed
  assessment_review_completed: {
    eventType: 'assessment_review_completed',
    category: 'assessment',
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'email'],
    actionUrlPath: (vars) => vars.assessmentId ? `/patient/assessments/${vars.assessmentId}` : '/patient/assessments',
    en: {
      title: 'Clinician Review Completed',
      body: 'Dr. {{clinicianName}} has finalized their clinical observations and recommendations for assessment {{assessmentId}}.',
      smsBody: 'Lungent: Clinician review completed for {{assessmentId}}.',
      emailSubject: 'Lungent — Clinician Review Completed',
      emailHtml: '<p>Your attending clinician has completed their review of assessment {{assessmentId}}.</p>',
    },
    bn: {
      title: 'চিকিৎসক পর্যালোচনা সম্পন্ন',
      body: 'ডা. {{clinicianName}} আপনার মূল্যায়ন {{assessmentId}}-এর ক্লিনিক্যাল পর্যবেক্ষণ ও পরামর্শ চূড়ান্ত করেছেন।',
      smsBody: 'লুনজেন্ট: আপনার মূল্যায়নের চিকিৎসক পর্যালোচনা সম্পন্ন হয়েছে।',
      emailSubject: 'লুনজেন্ট — চিকিৎসক পর্যালোচনা সম্পন্ন',
      emailHtml: '<p>আপনার দায়িত্বপ্রাপ্ত চিকিৎসক মূল্যায়ন পর্যালোচনা সম্পন্ন করেছেন।</p>',
    },
  },

  // 10. Clinical Review: Awaiting Review
  assessment_awaiting_review: {
    eventType: 'assessment_awaiting_review',
    category: 'clinical_review',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'email'],
    actionUrlPath: (vars) => vars.assessmentId ? `/clinical/assessments?id=${vars.assessmentId}` : '/clinical/assessments',
    en: {
      title: 'New Assessment Awaiting Review',
      body: 'Patient {{patientName}} ({{patientCanonicalId}}) has submitted an assessment requiring clinician evaluation.',
      smsBody: 'Lungent Clinical: Assessment awaiting review for patient {{patientCanonicalId}}.',
      emailSubject: 'Clinical Alert — Assessment Awaiting Review ({{patientCanonicalId}})',
      emailHtml: '<p>Patient <strong>{{patientName}}</strong> ({{patientCanonicalId}}) has an assessment awaiting review.</p>',
    },
    bn: {
      title: 'নতুন অ্যাসেসমেন্ট পর্যালোচনার অপেক্ষায়',
      body: 'রোগী {{patientName}} ({{patientCanonicalId}})-এর একটি নতুন অ্যাসেসমেন্ট পর্যালোচনার জন্য প্রস্তুত।',
      smsBody: 'লুনজেন্ট ক্লিনিক্যাল: রোগী {{patientCanonicalId}}-এর অ্যাসেসমেন্ট পর্যালোচনার অপেক্ষায়।',
      emailSubject: 'ক্লিনিক্যাল সতর্কতা — অ্যাসেসমেন্ট পর্যালোচনার অপেক্ষায় ({{patientCanonicalId}})',
      emailHtml: '<p>রোগী <strong>{{patientName}}</strong> ({{patientCanonicalId}})-এর অ্যাসেসমেন্ট পর্যালোচনার জন্য জমা হয়েছে।</p>',
    },
  },

  // 11. Clinical Review: Assigned
  patient_assessment_assigned: {
    eventType: 'patient_assessment_assigned',
    category: 'clinical_review',
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'email'],
    actionUrlPath: (vars) => vars.patientId ? `/clinical/patients/${vars.patientId}` : '/clinical/patients',
    en: {
      title: 'Patient Assigned to Your Care Schedule',
      body: 'Patient {{patientName}} ({{patientCanonicalId}}) has been assigned to your clinical review queue at {{facilityName}}.',
      smsBody: 'Lungent: Patient {{patientCanonicalId}} assigned to your clinical care list.',
      emailSubject: 'Clinical Assignment — Patient {{patientCanonicalId}}',
      emailHtml: '<p>Patient {{patientName}} ({{patientCanonicalId}}) is assigned to your clinical queue.</p>',
    },
    bn: {
      title: 'রোগী আপনার সেবার তালিকায় যুক্ত হয়েছে',
      body: 'রোগী {{patientName}} ({{patientCanonicalId}}) আপনার ক্লিনিক্যাল পর্যালোচনা তালিকায় যুক্ত করা হয়েছে।',
      smsBody: 'লুনজেন্ট: রোগী {{patientCanonicalId}} আপনার তালিকায় যুক্ত হয়েছে।',
      emailSubject: 'ক্লিনিক্যাল দায়িত্ব — রোগী {{patientCanonicalId}}',
      emailHtml: '<p>রোগী {{patientName}} ({{patientCanonicalId}}) আপনার সেবার তালিকায় যুক্ত করা হয়েছে।</p>',
    },
  },

  // 12. Clinical Review: Pending
  clinical_review_pending: {
    eventType: 'clinical_review_pending',
    category: 'clinical_review',
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
    actionUrlPath: () => '/clinical/assessments',
    en: {
      title: 'Pending Clinical Reviews',
      body: 'You have {{count}} pending assessments requiring clinical review and sign-off.',
      smsBody: 'Lungent: You have pending clinical reviews.',
      emailSubject: 'Clinical Workspace — Pending Reviews Reminder',
      emailHtml: '<p>Reminder: There are pending reviews in your clinical workspace.</p>',
    },
    bn: {
      title: 'বকেয়া ক্লিনিক্যাল পর্যালোচনা',
      body: 'আপনার ক্লিনিক্যাল ওয়ার্কস্পেসে {{count}}টি অ্যাসেসমেন্ট পর্যালোচনার অপেক্ষায় রয়েছে।',
      smsBody: 'লুনজেন্ট: আপনার পর্যালোচনার অপেক্ষায় থাকা অ্যাসেসমেন্ট রয়েছে।',
      emailSubject: 'ক্লিনিক্যাল ওয়ার্কস্পেস — বকেয়া পর্যালোচনার অনুস্মারক',
      emailHtml: '<p>অনুস্মারক: আপনার ওয়ার্কস্পেসে বকেয়া পর্যালোচনা রয়েছে।</p>',
    },
  },

  // 13. Clinical Review: Completed
  clinical_review_completed: {
    eventType: 'clinical_review_completed',
    category: 'clinical_review',
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
    actionUrlPath: (vars) => vars.patientId ? `/clinical/patients/${vars.patientId}` : '/clinical/patients',
    en: {
      title: 'Clinical Review Finalized',
      body: 'Review completed for patient {{patientCanonicalId}}.',
      smsBody: 'Lungent: Review finalized for patient {{patientCanonicalId}}.',
      emailSubject: 'Clinical Workspace — Review Finalized',
      emailHtml: '<p>Review finalized for patient {{patientCanonicalId}}.</p>',
    },
    bn: {
      title: 'ক্লিনিক্যাল পর্যালোচনা চূড়ান্ত হয়েছে',
      body: 'রোগী {{patientCanonicalId}}-এর পর্যালোচনা চূড়ান্ত করা হয়েছে।',
      smsBody: 'লুনজেন্ট: রোগী {{patientCanonicalId}}-এর পর্যালোচনা সম্পন্ন।',
      emailSubject: 'ক্লিনিক্যাল ওয়ার্কস্পেস — পর্যালোচনা চূড়ান্ত',
      emailHtml: '<p>পর্যালোচনা চূড়ান্ত সম্পন্ন হয়েছে।</p>',
    },
  },

  // 14. Clinical Review: Alert Generated
  clinical_alert_generated: {
    eventType: 'clinical_alert_generated',
    category: 'clinical_review',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'email'],
    actionUrlPath: () => '/clinical/alerts',
    en: {
      title: 'Clinical Alert: {{alertTitle}}',
      body: 'Alert generated for patient {{patientCanonicalId}}: {{alertSeverity}} priority.',
      smsBody: 'Lungent Clinical: {{alertSeverity}} alert for patient {{patientCanonicalId}}.',
      emailSubject: 'Clinical Alert — {{alertSeverity}} ({{patientCanonicalId}})',
      emailHtml: '<p>A clinical alert has been generated for patient {{patientCanonicalId}}.</p>',
    },
    bn: {
      title: 'ক্লিনিক্যাল সতর্কতা: {{alertTitle}}',
      body: 'রোগী {{patientCanonicalId}}-এর জন্য সতর্কতা জারি করা হয়েছে: {{alertSeverity}} অগ্রাধিকার।',
      smsBody: 'লুনজেন্ট ক্লিনিক্যাল: রোগী {{patientCanonicalId}}-এর জন্য সতর্কতা।',
      emailSubject: 'ক্লিনিক্যাল সতর্কতা — {{alertSeverity}} ({{patientCanonicalId}})',
      emailHtml: '<p>রোগী {{patientCanonicalId}}-এর জন্য সতর্কতা জারি করা হয়েছে।</p>',
    },
  },

  // 15. Referral: Assigned
  referral_assigned: {
    eventType: 'referral_assigned',
    category: 'referral',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'sms', 'email'],
    actionUrlPath: (vars) => vars.referralId ? `/clinical/referrals` : '/patient/referrals',
    en: {
      title: 'Specialist Referral Created ({{referralId}})',
      body: 'Referral submitted to {{destinationFacilityName}}. Priority: {{priority}}.',
      smsBody: 'Lungent: Specialist referral {{referralId}} to {{destinationFacilityName}} created. Details in portal.',
      emailSubject: 'Lungent — Specialist Referral ({{referralId}})',
      emailHtml: '<p>Specialist referral {{referralId}} has been created for {{destinationFacilityName}}.</p><p><em>This coordinates specialist care and does not constitute a confirmed diagnosis of lung cancer.</em></p>',
    },
    bn: {
      title: 'বিশেষজ্ঞ রেফারেল তৈরি হয়েছে ({{referralId}})',
      body: '{{destinationFacilityName}}-এ রেফারেল পাঠানো হয়েছে। অগ্রাধিকার: {{priority}}।',
      smsBody: 'লুনজেন্ট: রেফারেল {{referralId}} ({{destinationFacilityName}}) তৈরি হয়েছে। বিস্তারিত পোর্টালে দেখুন।',
      emailSubject: 'লুনজেন্ট — বিশেষজ্ঞ রেফারেল ({{referralId}})',
      emailHtml: '<p>{{destinationFacilityName}}-এ বিশেষজ্ঞ রেফারেল {{referralId}} তৈরি হয়েছে।</p><p><em>এটি বিশেষজ্ঞ সেবার জন্য এবং ফুসফুসের ক্যান্সারের নিশ্চিত নির্ণয় নয়।</em></p>',
    },
  },

  // 16. Referral: Submitted
  referral_submitted: {
    eventType: 'referral_submitted',
    category: 'referral',
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
    actionUrlPath: () => '/clinical/referrals',
    en: {
      title: 'Referral Submitted for Intake',
      body: 'Referral {{referralId}} submitted to {{destinationFacilityName}}.',
      smsBody: 'Lungent: Referral {{referralId}} submitted.',
      emailSubject: 'Lungent — Referral Submitted',
      emailHtml: '<p>Referral {{referralId}} submitted to {{destinationFacilityName}}.</p>',
    },
    bn: {
      title: 'রেফারেল দাখিল করা হয়েছে',
      body: 'রেফারেল {{referralId}} সফলভাবে দাখিল করা হয়েছে।',
      smsBody: 'লুনজেন্ট: রেফারেল {{referralId}} দাখিল হয়েছে।',
      emailSubject: 'লুনজেন্ট — রেফারেল দাখিল',
      emailHtml: '<p>রেফারেল দাখিল সম্পন্ন হয়েছে।</p>',
    },
  },

  // 17. Referral: Accepted
  referral_accepted: {
    eventType: 'referral_accepted',
    category: 'referral',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'sms', 'email'],
    actionUrlPath: () => '/patient/referrals',
    en: {
      title: 'Referral Accepted by Destination Facility',
      body: '{{destinationFacilityName}} has accepted referral {{referralId}}. Scheduling is in progress.',
      smsBody: 'Lungent: Referral {{referralId}} accepted by {{destinationFacilityName}}.',
      emailSubject: 'Lungent — Referral Accepted',
      emailHtml: '<p>Your referral {{referralId}} has been accepted by {{destinationFacilityName}}.</p>',
    },
    bn: {
      title: 'গন্তব্য হাসপাতাল রেফারেল গ্রহণ করেছে',
      body: '{{destinationFacilityName}} রেফারেল {{referralId}} গ্রহণ করেছে। শিডিউল প্রক্রিয়াধীন।',
      smsBody: 'লুনজেন্ট: রেফারেল {{referralId}} গৃহীত হয়েছে।',
      emailSubject: 'লুনজেন্ট — রেফারেল গ্রহণ',
      emailHtml: '<p>রেফারেল গৃহীত হয়েছে।</p>',
    },
  },

  // 18. Referral: Rejected
  referral_rejected: {
    eventType: 'referral_rejected',
    category: 'referral',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'email'],
    actionUrlPath: () => '/clinical/referrals',
    en: {
      title: 'Referral Redirected / Declined',
      body: 'Referral {{referralId}} could not be accepted by {{destinationFacilityName}}. Reason documented in portal.',
      smsBody: 'Lungent: Referral {{referralId}} update available in portal.',
      emailSubject: 'Lungent Clinical — Referral Status Update',
      emailHtml: '<p>Referral {{referralId}} was not accepted by {{destinationFacilityName}}. Alternative routing required.</p>',
    },
    bn: {
      title: 'রেফারেল প্রত্যাখ্যাত / পুনঃনির্দেশিত',
      body: '{{destinationFacilityName}} রেফারেল {{referralId}} গ্রহণ করতে পারেনি। কারণ পোর্টালে দেখুন।',
      smsBody: 'লুনজেন্ট: রেফারেল {{referralId}} সংক্রান্ত আপডেট পোর্টালে দেখুন।',
      emailSubject: 'লুনজেন্ট ক্লিনিক্যাল — রেফারেল স্ট্যাটাস আপডেট',
      emailHtml: '<p>রেফারেল গ্রহণ করা যায়নি। বিকল্প ব্যবস্থা প্রয়োজন।</p>',
    },
  },

  // 19. Referral: Scheduled
  referral_scheduled: {
    eventType: 'referral_scheduled',
    category: 'referral',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'sms', 'email'],
    actionUrlPath: () => '/patient/referrals',
    en: {
      title: 'Specialist Consultation Scheduled',
      body: 'Appointment confirmed for {{appointmentDate}} at {{destinationFacilityName}} ({{appointmentLocation}}).',
      smsBody: 'Lungent: Appointment scheduled on {{appointmentDate}} at {{destinationFacilityName}}. Location: {{appointmentLocation}}.',
      emailSubject: 'Lungent — Specialist Appointment Confirmed',
      emailHtml: '<p>Your specialist consultation is scheduled for <strong>{{appointmentDate}}</strong> at <strong>{{destinationFacilityName}}</strong>.</p><p>Location: {{appointmentLocation}}</p><p>Instructions: {{instructions}}</p>',
    },
    bn: {
      title: 'বিশেষজ্ঞ পরামর্শের সময় নির্ধারিত হয়েছে',
      body: '{{destinationFacilityName}} ({{appointmentLocation}})-এ {{appointmentDate}} তারিখে অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে।',
      smsBody: 'লুনজেন্ট: {{destinationFacilityName}}-এ {{appointmentDate}} তারিখে আপনার অ্যাপয়েন্টমেন্ট নির্ধারিত হয়েছে।',
      emailSubject: 'লুনজেন্ট — বিশেষজ্ঞ পরামর্শের সময়সূচি নিশ্চিত',
      emailHtml: '<p>আপনার অ্যাপয়েন্টমেন্ট <strong>{{appointmentDate}}</strong> তারিখে <strong>{{destinationFacilityName}}</strong>-এ নির্ধারিত হয়েছে।</p>',
    },
  },

  // 20. Referral: Status Changed
  referral_status_changed: {
    eventType: 'referral_status_changed',
    category: 'referral',
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
    actionUrlPath: () => '/patient/referrals',
    en: {
      title: 'Referral Status Updated',
      body: 'Referral {{referralId}} status transitioned to {{status}}.',
      smsBody: 'Lungent: Referral {{referralId}} status updated.',
      emailSubject: 'Lungent — Referral Status Updated',
      emailHtml: '<p>Referral {{referralId}} status is now {{status}}.</p>',
    },
    bn: {
      title: 'রেফারেলের অবস্থা পরিবর্তিত হয়েছে',
      body: 'রেফারেল {{referralId}}-এর বর্তমান অবস্থা: {{status}}।',
      smsBody: 'লুনজেন্ট: রেফারেল {{referralId}}-এর অবস্থা পরিবর্তিত হয়েছে।',
      emailSubject: 'লুনজেন্ট — রেফারেল অবস্থা আপডেট',
      emailHtml: '<p>রেফারেলের নতুন স্ট্যাটাস: {{status}}।</p>',
    },
  },

  // 21. Referral: Completed
  referral_completed: {
    eventType: 'referral_completed',
    category: 'referral',
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'email'],
    actionUrlPath: () => '/patient/referrals',
    en: {
      title: 'Specialist Referral Evaluation Completed',
      body: 'Specialist consultation for {{referralId}} has been finalized and outcome recorded.',
      smsBody: 'Lungent: Specialist evaluation completed for {{referralId}}.',
      emailSubject: 'Lungent — Specialist Evaluation Completed',
      emailHtml: '<p>Specialist consultation completed for referral {{referralId}}.</p>',
    },
    bn: {
      title: 'বিশেষজ্ঞ রেফারেল মূল্যায়ন সম্পন্ন',
      body: 'রেফারেল {{referralId}}-এর বিশেষজ্ঞ পরামর্শ সম্পন্ন হয়েছে এবং ফলাফল নথিভুক্ত করা হয়েছে।',
      smsBody: 'লুনজেন্ট: রেফারেল {{referralId}}-এর বিশেষজ্ঞ মূল্যায়ন সম্পন্ন।',
      emailSubject: 'লুনজেন্ট — বিশেষজ্ঞ মূল্যায়ন সম্পন্ন',
      emailHtml: '<p>বিশেষজ্ঞ পরামর্শ সম্পন্ন হয়েছে।</p>',
    },
  },

  // 22. Follow-up: Scheduled
  followup_scheduled: {
    eventType: 'followup_scheduled',
    category: 'follow_up',
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'sms', 'email'],
    actionUrlPath: () => '/patient/referrals',
    en: {
      title: 'Follow-up Consultation Planned',
      body: 'Follow-up appointment booked for {{scheduledDate}} ({{purpose}}).',
      smsBody: 'Lungent: Follow-up booked for {{scheduledDate}}. Details in portal.',
      emailSubject: 'Lungent — Follow-up Consultation Scheduled',
      emailHtml: '<p>Your follow-up is scheduled for <strong>{{scheduledDate}}</strong>.</p><p>Purpose: {{purpose}}</p>',
    },
    bn: {
      title: 'ফলো-আপ অ্যাপয়েন্টমেন্ট নির্ধারিত হয়েছে',
      body: '{{scheduledDate}} তারিখে ফলো-আপ অ্যাপয়েন্টমেন্ট ({{purpose}}) নির্ধারণ করা হয়েছে।',
      smsBody: 'লুনজেন্ট: {{scheduledDate}} তারিখে ফলো-আপ নির্ধারিত হয়েছে।',
      emailSubject: 'লুনজেন্ট — ফলো-আপ নির্ধারিত',
      emailHtml: '<p>আপনার ফলো-আপ <strong>{{scheduledDate}}</strong> তারিখে নির্ধারিত হয়েছে।</p>',
    },
  },

  // 23. Follow-up: Reminder (48-72h prior)
  followup_reminder: {
    eventType: 'followup_reminder',
    category: 'follow_up',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'sms', 'email'],
    actionUrlPath: () => '/patient/referrals',
    en: {
      title: 'Upcoming Follow-up Appointment Reminder',
      body: 'Reminder: Your follow-up appointment is scheduled for {{scheduledDate}} at {{facilityName}}.',
      smsBody: 'Lungent Reminder: Follow-up appointment on {{scheduledDate}} at {{facilityName}}. Please arrive on time.',
      emailSubject: 'Lungent Reminder — Follow-up Appointment on {{scheduledDate}}',
      emailHtml: '<p>Dear {{recipientName}},</p><p>This is a reminder for your upcoming follow-up on <strong>{{scheduledDate}}</strong> at <strong>{{facilityName}}</strong>.</p><p>Instructions: {{instructions}}</p>',
    },
    bn: {
      title: 'আসন্ন ফলো-আপ অ্যাপয়েন্টমেন্টের অনুস্মারক',
      body: 'অনুস্মারক: {{facilityName}}-এ {{scheduledDate}} তারিখে আপনার ফলো-আপ অ্যাপয়েন্টমেন্ট রয়েছে।',
      smsBody: 'লুনজেন্ট অনুস্মারক: {{scheduledDate}} তারিখে {{facilityName}}-এ ফলো-আপ। সময়মতো উপস্থিত থাকুন।',
      emailSubject: 'লুনজেন্ট অনুস্মারক — {{scheduledDate}} তারিখে ফলো-আপ অ্যাপয়েন্টমেন্ট',
      emailHtml: '<p>সুপ্রিয় {{recipientName}},</p><p><strong>{{facilityName}}</strong>-এ <strong>{{scheduledDate}}</strong> তারিখে আপনার ফলো-আপ নির্ধারিত রয়েছে।</p>',
    },
  },

  // 24. Follow-up: Rescheduled
  followup_rescheduled: {
    eventType: 'followup_rescheduled',
    category: 'follow_up',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'sms', 'email'],
    actionUrlPath: () => '/patient/referrals',
    en: {
      title: 'Follow-up Appointment Rescheduled',
      body: 'Your follow-up appointment has been moved to {{newDate}}. Reason: {{reason}}.',
      smsBody: 'Lungent: Your follow-up has been rescheduled to {{newDate}}.',
      emailSubject: 'Lungent — Follow-up Rescheduled to {{newDate}}',
      emailHtml: '<p>Your follow-up has been rescheduled to <strong>{{newDate}}</strong>.</p><p>Reason: {{reason}}</p>',
    },
    bn: {
      title: 'ফলো-আপ অ্যাপয়েন্টমেন্ট পুনঃনির্ধারিত হয়েছে',
      body: 'আপনার ফলো-আপ অ্যাপয়েন্টমেন্ট {{newDate}} তারিখে পরিবর্তন করা হয়েছে। কারণ: {{reason}}।',
      smsBody: 'লুনজেন্ট: ফলো-আপের নতুন তারিখ {{newDate}}।',
      emailSubject: 'লুনজেন্ট — ফলো-আপের সময় পুনঃনির্ধারিত',
      emailHtml: '<p>ফলো-আপ অ্যাপয়েন্টমেন্ট <strong>{{newDate}}</strong> তারিখে স্থানান্তর করা হয়েছে।</p>',
    },
  },

  // 25. Follow-up: Cancelled
  followup_cancelled: {
    eventType: 'followup_cancelled',
    category: 'follow_up',
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'email'],
    actionUrlPath: () => '/patient/referrals',
    en: {
      title: 'Follow-up Appointment Cancelled',
      body: 'Your appointment on {{scheduledDate}} was cancelled. Contact your clinic to reschedule if needed.',
      smsBody: 'Lungent: Follow-up on {{scheduledDate}} has been cancelled.',
      emailSubject: 'Lungent — Follow-up Cancelled',
      emailHtml: '<p>Your follow-up appointment on {{scheduledDate}} was cancelled.</p>',
    },
    bn: {
      title: 'ফলো-আপ অ্যাপয়েন্টমেন্ট বাতিল হয়েছে',
      body: '{{scheduledDate}} তারিখের অ্যাপয়েন্টমেন্টটি বাতিল করা হয়েছে। প্রয়োজনে পুনরায় যোগাযোগ করুন।',
      smsBody: 'লুনজেন্ট: {{scheduledDate}} তারিখের ফলো-আপ বাতিল করা হয়েছে।',
      emailSubject: 'লুনজেন্ট — ফলো-আপ বাতিল',
      emailHtml: '<p>ফলো-আপ অ্যাপয়েন্টমেন্ট বাতিল করা হয়েছে।</p>',
    },
  },

  // 26. Follow-up: Overdue
  followup_overdue: {
    eventType: 'followup_overdue',
    category: 'follow_up',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'sms', 'email'],
    actionUrlPath: (vars) => vars.role === 'clinician' ? '/clinical/referrals' : '/patient/referrals',
    en: {
      title: 'Overdue Follow-up Alert',
      body: 'Follow-up appointment for {{patientName}} originally scheduled for {{scheduledDate}} is overdue.',
      smsBody: 'Lungent Notice: Scheduled follow-up was due on {{scheduledDate}}. Please contact clinic to re-book.',
      emailSubject: 'Lungent — Overdue Follow-up Notice',
      emailHtml: '<p>A scheduled follow-up due on {{scheduledDate}} has passed without documented completion. Please sign in to re-coordinate care.</p>',
    },
    bn: {
      title: 'বকেয়া ফলো-আপ সতর্কতা',
      body: '{{patientName}}-এর {{scheduledDate}} তারিখে নির্ধারিত ফলো-আপটি বকেয়া রয়েছে।',
      smsBody: 'লুনজেন্ট নোটিশ: {{scheduledDate}} তারিখের ফলো-আপটি সম্পন্ন হয়নি। ক্লিনিকে যোগাযোগ করুন।',
      emailSubject: 'লুনজেন্ট — বকেয়া ফলো-আপ বিজ্ঞপ্তি',
      emailHtml: '<p>নির্ধারিত ফলো-আপের সময় অতিক্রান্ত হয়েছে। পুনরায় সময় নির্ধারণ করতে যোগাযোগ করুন।</p>',
    },
  },

  // 27. Follow-up: Missed
  followup_missed: {
    eventType: 'followup_missed',
    category: 'follow_up',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'sms', 'email'],
    actionUrlPath: () => '/patient/referrals',
    en: {
      title: 'Missed Appointment Notification',
      body: 'Our records indicate you were unable to attend your scheduled follow-up on {{scheduledDate}}.',
      smsBody: 'Lungent: You missed your appointment on {{scheduledDate}}. Contact clinic to reschedule.',
      emailSubject: 'Lungent — Missed Follow-up Appointment',
      emailHtml: '<p>You missed your appointment on {{scheduledDate}}. Continuity of care is important; please re-book at your earliest convenience.</p>',
    },
    bn: {
      title: 'অনুপস্থিত ফলো-আপ বিজ্ঞপ্তি',
      body: 'আমাদের রেকর্ডে দেখা যাচ্ছে আপনি {{scheduledDate}} তারিখের ফলো-আপে উপস্থিত হতে পারেননি।',
      smsBody: 'লুনজেন্ট: {{scheduledDate}} তারিখে আপনি উপস্থিত হতে পারেননি। নতুন সময় নিতে যোগাযোগ করুন।',
      emailSubject: 'লুনজেন্ট — অনুপস্থিত ফলো-আপ বিজ্ঞপ্তি',
      emailHtml: '<p>ধারাবাহিক স্বাস্থ্যসেবার স্বার্থে অনুগ্রহ করে দ্রুত নতুন সময় নির্ধারণ করুন।</p>',
    },
  },

  // 28. Follow-up: Completed
  followup_completed: {
    eventType: 'followup_completed',
    category: 'follow_up',
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
    actionUrlPath: () => '/patient/referrals',
    en: {
      title: 'Follow-up Consultation Completed',
      body: 'Outcome notes documented for follow-up on {{scheduledDate}}.',
      smsBody: 'Lungent: Follow-up completed.',
      emailSubject: 'Lungent — Follow-up Completed',
      emailHtml: '<p>Outcome notes documented for follow-up on {{scheduledDate}}.</p>',
    },
    bn: {
      title: 'ফলো-আপ পরামর্শ সম্পন্ন',
      body: '{{scheduledDate}} তারিখের ফলো-আপের ফলাফল নথিভুক্ত করা হয়েছে।',
      smsBody: 'লুনজেন্ট: ফলো-আপ সম্পন্ন।',
      emailSubject: 'লুনজেন্ট — ফলো-আপ সম্পন্ন',
      emailHtml: '<p>ফলো-আপ ফলাফল নথিভুক্ত হয়েছে।</p>',
    },
  },

  // 29. Healthcare Worker: New Assignment
  worker_new_assignment: {
    eventType: 'worker_new_assignment',
    category: 'healthcare_worker',
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'sms'],
    actionUrlPath: () => '/healthcare-worker/patients',
    en: {
      title: 'New Patient Intake Assigned',
      body: 'Patient {{patientName}} ({{patientCanonicalId}}) has been assigned to your community outreach queue.',
      smsBody: 'Lungent Field: New patient {{patientCanonicalId}} assigned to your queue.',
      emailSubject: 'Field Task — New Patient Assigned',
      emailHtml: '<p>Patient {{patientName}} ({{patientCanonicalId}}) assigned to your field list.</p>',
    },
    bn: {
      title: 'নতুন রোগী দায়িত্বে যুক্ত হয়েছে',
      body: 'রোগী {{patientName}} ({{patientCanonicalId}}) আপনার ফিল্ড তালিকায় যুক্ত করা হয়েছে।',
      smsBody: 'লুনজেন্ট ফিল্ড: নতুন রোগী {{patientCanonicalId}} যুক্ত হয়েছে।',
      emailSubject: 'ফিল্ড টাস্ক — নতুন রোগী বরাদ্দ',
      emailHtml: '<p>রোগী {{patientName}} আপনার তালিকায় যুক্ত হয়েছে।</p>',
    },
  },

  // 30. Healthcare Worker: Pending Tasks
  worker_pending_tasks: {
    eventType: 'worker_pending_tasks',
    category: 'healthcare_worker',
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
    actionUrlPath: () => '/healthcare-worker/tasks',
    en: {
      title: 'Pending Community Outreach Tasks',
      body: 'You have {{taskCount}} pending field tasks and data completion requirements.',
      smsBody: 'Lungent: You have pending field tasks.',
      emailSubject: 'Healthcare Worker — Task Summary',
      emailHtml: '<p>You have {{taskCount}} pending field tasks.</p>',
    },
    bn: {
      title: 'বকেয়া ফিল্ড টাস্কসমূহ',
      body: 'আপনার ফিল্ড তালিকায় {{taskCount}}টি বকেয়া টাস্ক রয়েছে।',
      smsBody: 'লুনজেন্ট: আপনার বকেয়া টাস্ক রয়েছে।',
      emailSubject: 'স্বাস্থ্যকর্মী — টাস্ক সারসংক্ষেপ',
      emailHtml: '<p>আপনার {{taskCount}}টি বকেয়া টাস্ক রয়েছে।</p>',
    },
  },

  // 31. Healthcare Worker: Review Outstanding
  worker_review_outstanding: {
    eventType: 'worker_review_outstanding',
    category: 'healthcare_worker',
    defaultPriority: 'high',
    defaultChannels: ['in_app'],
    actionUrlPath: () => '/healthcare-worker/completion-queue',
    en: {
      title: 'Incomplete Patient Intakes in Queue',
      body: '{{count}} patient questionnaires require completion before clinical screening evaluation.',
      smsBody: 'Lungent: Incomplete intakes require attention in completion queue.',
      emailSubject: 'Field Outreach — Incomplete Intakes Queue',
      emailHtml: '<p>Incomplete questionnaires require completion.</p>',
    },
    bn: {
      title: 'অসম্পূর্ণ রোগী তথ্যের তালিকা',
      body: 'ক্লিনিক্যাল মূল্যায়নের জন্য {{count}}টি অসম্পূর্ণ তথ্য পূরণ করা আবশ্যক।',
      smsBody: 'লুনজেন্ট: অসম্পূর্ণ তথ্য পূরণ করুন।',
      emailSubject: 'ফিল্ড আউটরিচ — অসম্পূর্ণ তালিকা',
      emailHtml: '<p>অসম্পূর্ণ তথ্য পূরণ প্রয়োজন।</p>',
    },
  },

  // 32. Healthcare Worker: Facility Alert
  worker_facility_alert: {
    eventType: 'worker_facility_alert',
    category: 'healthcare_worker',
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
    actionUrlPath: () => '/healthcare-worker',
    en: {
      title: 'Facility Operational Update: {{facilityName}}',
      body: '{{message}}',
      smsBody: 'Lungent Facility Update: {{message}}',
      emailSubject: 'Facility Update — {{facilityName}}',
      emailHtml: '<p>{{message}}</p>',
    },
    bn: {
      title: 'স্বাস্থ্যসেবা কেন্দ্র আপডেট: {{facilityName}}',
      body: '{{message}}',
      smsBody: 'লুনজেন্ট কেন্দ্র আপডেট: {{message}}',
      emailSubject: 'কেন্দ্র আপডেট — {{facilityName}}',
      emailHtml: '<p>{{message}}</p>',
    },
  },

  // 33. Urgent Workflow: Escalation
  urgent_clinical_escalation: {
    eventType: 'urgent_clinical_escalation',
    category: 'urgent_workflow',
    defaultPriority: 'urgent',
    defaultChannels: ['in_app', 'sms', 'email'],
    actionUrlPath: (vars) => vars.patientId ? `/clinical/patients/${vars.patientId}` : '/clinical/alerts',
    en: {
      title: 'CRITICAL CLINICAL ESCALATION: {{reason}}',
      body: 'Urgent red-flag symptom reported for patient {{patientCanonicalId}}. Immediate clinical triage protocol required.',
      smsBody: 'URGENT LUNGENT ALERT: Patient {{patientCanonicalId}} flagged for acute clinical escalation. Check clinical workspace.',
      emailSubject: 'URGENT CLINICAL ESCALATION — Patient {{patientCanonicalId}}',
      emailHtml: '<p style="color:red; font-weight:bold;">URGENT CLINICAL ESCALATION ALERT</p><p>Patient {{patientName}} ({{patientCanonicalId}}) has been flagged for acute clinical evaluation: <strong>{{reason}}</strong>.</p><p>Immediate review required in clinical workspace. Acknowledgement mandatory.</p>',
    },
    bn: {
      title: 'জরুরি ক্লিনিক্যাল এসকেলেশন: {{reason}}',
      body: 'রোগী {{patientCanonicalId}}-এর জন্য জরুরি রেড-ফ্ল্যাগ লক্ষণ চিহ্নিত হয়েছে। অবিলম্বে ট্রায়াজ পর্যালোচনা আবশ্যক।',
      smsBody: 'জরুরি লুনজেন্ট সতর্কতা: রোগী {{patientCanonicalId}}-এর জন্য জরুরি পর্যালোচনা প্রয়োজন। ক্লিনিক্যাল ওয়ার্কস্পেস দেখুন।',
      emailSubject: 'জরুরি ক্লিনিক্যাল সতর্কতা — রোগী {{patientCanonicalId}}',
      emailHtml: '<p style="color:red; font-weight:bold;">জরুরি ক্লিনিক্যাল এসকেলেশন সতর্কতা</p><p>রোগী {{patientName}} ({{patientCanonicalId}})-এর জরুরি লক্ষণ চিহ্নিত হয়েছে: <strong>{{reason}}</strong>।</p><p>অবিলম্বে পর্যালোচনা ও স্বীকৃতি আবশ্যক।</p>',
    },
  },

  // 34. Urgent Workflow: Red Flag Alert
  urgent_red_flag_alert: {
    eventType: 'urgent_red_flag_alert',
    category: 'urgent_workflow',
    defaultPriority: 'urgent',
    defaultChannels: ['in_app', 'sms', 'email'],
    actionUrlPath: () => '/clinical/alerts',
    en: {
      title: 'Red-Flag Symptom Alert: Hemoptysis / Acute Stridor',
      body: 'Patient {{patientCanonicalId}} reported red-flag symptom. Clinical priority: Urgent 2-Week-Wait pathway.',
      smsBody: 'URGENT: Red-flag symptom alert for patient {{patientCanonicalId}}. Review clinical alert immediately.',
      emailSubject: 'RED-FLAG CLINICAL ALERT — Patient {{patientCanonicalId}}',
      emailHtml: '<p style="color:red; font-weight:bold;">RED-FLAG CLINICAL ALERT</p><p>Patient {{patientCanonicalId}} has reported acute red-flag symptoms. Urgent 2-Week-Wait referral track advised.</p>',
    },
    bn: {
      title: 'রেড-ফ্ল্যাগ উপসর্গ সতর্কতা: রক্তকাশি / শ্বাসকষ্ট',
      body: 'রোগী {{patientCanonicalId}}-এর রেড-ফ্ল্যাগ উপসর্গ চিহ্নিত। ক্লিনিক্যাল অগ্রাধিকার: জরুরি ২-সপ্তাহ ট্র্যাক।',
      smsBody: 'জরুরি: রোগী {{patientCanonicalId}}-এর জন্য রেড-ফ্ল্যাগ সতর্কতা। অবিলম্বে দেখুন।',
      emailSubject: 'রেড-ফ্ল্যাগ ক্লিনিক্যাল সতর্কতা — রোগী {{patientCanonicalId}}',
      emailHtml: '<p style="color:red; font-weight:bold;">রেড-ফ্ল্যাগ ক্লিনিক্যাল সতর্কতা</p><p>রোগী {{patientCanonicalId}}-এর জরুরি উপসর্গ চিহ্নিত। অবিলম্বে ২-সপ্তাহ ট্র্যাক অনুসরণ করুন।</p>',
    },
  },
}
