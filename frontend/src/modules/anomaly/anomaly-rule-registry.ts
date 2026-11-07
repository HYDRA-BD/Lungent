/**
 * Phase 2.5: Authoritative Anomaly Detection Rule Registry
 *
 * Catalogs all formal rules, clinical rationales, expected reference bounds,
 * severity classifications, and bilingual message templates.
 */

import type {
  AnomalyCategory,
  AnomalySeverity,
  AnomalySubtype,
  DetectionMethodology,
} from './types'

export interface AnomalyRuleDefinition {
  ruleId: string
  version: string
  category: AnomalyCategory
  subtype: AnomalySubtype
  defaultSeverity: AnomalySeverity
  methodology: DetectionMethodology
  assignedRole: 'clinician' | 'healthcare_worker' | 'administrator'
  titleEn: string
  titleBn: string
  descriptionEn: string
  descriptionBn: string
  clinicalRationaleEn: string
  clinicalRationaleBn: string
}

export const ANOMALY_RULE_REGISTRY: Record<string, AnomalyRuleDefinition> = {
  // --------------------------------------------------------------------------
  // PATIENT DATA RULES
  // --------------------------------------------------------------------------
  'RULE-PAT-001': {
    ruleId: 'RULE-PAT-001',
    version: '1.0.0',
    category: 'patient_data',
    subtype: 'demographic_conflict',
    defaultSeverity: 'high',
    methodology: 'deterministic_rule',
    assignedRole: 'healthcare_worker',
    titleEn: 'Future Date of Birth or Implausible Age',
    titleBn: 'ভবিষ্যতের জন্মতারিখ বা অগ্রহণযোগ্য বয়স',
    descriptionEn: 'Recorded date of birth is in the future or age exceeds human biological threshold (> 125 years).',
    descriptionBn: 'রেকর্ডকৃত জন্মতারিখ ভবিষ্যতে অথবা বয়স মানবজীবনের গ্রহণযোগ্য সীমা (> ১২৫ বছর) অতিক্রম করেছে।',
    clinicalRationaleEn: 'Data-entry error in patient date of birth directly invalidates age-stratified lung cancer risk calculations.',
    clinicalRationaleBn: 'জন্মতারিখের ইনপুট ত্রুটি বয়স-ভিত্তিক ফুসফুসের ক্যান্সার ঝুঁকি গণনাকে সরাসরি বিকৃত করে।',
  },
  'RULE-PAT-002': {
    ruleId: 'RULE-PAT-002',
    version: '1.0.0',
    category: 'patient_data',
    subtype: 'implausible_physical_measurement',
    defaultSeverity: 'high',
    methodology: 'deterministic_rule',
    assignedRole: 'clinician',
    titleEn: 'BMI and Height/Weight Mathematical Discordance',
    titleBn: 'বিএমআই এবং উচ্চতা/ওজনের গাণিতিক অমিল',
    descriptionEn: 'Recorded Body Mass Index (BMI) disagrees with calculated weight / (height)^2 by more than 1.5 kg/m².',
    descriptionBn: 'রেকর্ডকৃত বিএমআই এবং উচ্চতা/ওজন হতে গণনাকৃত মানের মধ্যে ১.৫ কেজি/মি² এর বেশি অমিল রয়েছে।',
    clinicalRationaleEn: 'Physiological formula violations distort PLCOm2012 risk predictions where BMI is an inverse continuous predictor.',
    clinicalRationaleBn: 'শারীরবৃত্তীয় সূত্রের অমিল পিএলসিওএম২০১২ ঝুঁকি গণনাকে বিভ্রান্ত করে যেখানে বিএমআই একটি বিপরীতমুখী সূচক।',
  },
  'RULE-PAT-003': {
    ruleId: 'RULE-PAT-003',
    version: '1.0.0',
    category: 'patient_data',
    subtype: 'implausible_physical_measurement',
    defaultSeverity: 'critical',
    methodology: 'deterministic_rule',
    assignedRole: 'clinician',
    titleEn: 'Biologically Incompatible Blood Pressure or Vital Signs',
    titleBn: 'শারীরবৃত্তীয়ভাবে অসম্ভব রক্তচাপ বা ভাইটাল সাইন',
    descriptionEn: 'Systolic blood pressure is recorded as less than or equal to diastolic blood pressure, or pulse/SpO2 outside physiological limits.',
    descriptionBn: 'সিস্টোলিক রক্তচাপ ডায়াস্টোলিক রক্তচাপের সমান বা কম, অথবা পালস/SpO2 অস্বাভাবিক সীমার বাইরে।',
    clinicalRationaleEn: 'Systolic BP must strictly exceed diastolic BP; invalid vital signs pose severe clinical safety risks.',
    clinicalRationaleBn: 'সিস্টোলিক চাপ অবশ্যই ডায়াস্টোলিকের চেয়ে বেশি হতে হবে; ভুল ভাইটাল সাইন মারাত্মক চিকিৎসা ঝুঁকি সৃষ্টি করে।',
  },
  'RULE-PAT-004': {
    ruleId: 'RULE-PAT-004',
    version: '1.0.0',
    category: 'patient_data',
    subtype: 'unusual_tobacco_history',
    defaultSeverity: 'high',
    methodology: 'deterministic_rule',
    assignedRole: 'healthcare_worker',
    titleEn: 'Contradictory Tobacco Exposure Duration or Quantities',
    titleBn: 'ধূমপানের সময়কাল বা পরিমাণের স্ববিরোধী তথ্য',
    descriptionEn: 'Years smoked exceeds patient age, pack-years mismatch daily count, or never-smoker has positive pack-years.',
    descriptionBn: 'ধূমপানের সময়কাল রোগীর বয়সের বেশি, প্যাক-বছরের গণনায় গরমিল, অথবা অধূমপায়ীর ক্ষেত্রে প্যাক-বছর যুক্ত।',
    clinicalRationaleEn: 'Tobacco exposure is the single strongest determinant of screening eligibility and risk estimation.',
    clinicalRationaleBn: 'তামাকের সংস্পর্শ স্ক্রিনিং যোগ্যতা এবং ঝুঁকি নির্ধারণের প্রধান নিয়ামক।',
  },
  'RULE-PAT-005': {
    ruleId: 'RULE-PAT-005',
    version: '1.0.0',
    category: 'patient_data',
    subtype: 'longitudinal_drift',
    defaultSeverity: 'medium',
    methodology: 'statistical_mad',
    assignedRole: 'clinician',
    titleEn: 'Rapid Adult Longitudinal Measurement Shift',
    titleBn: 'প্রাপ্তবয়স্ক রোগীর পরিমাপে অস্বাভাবিক পরিবর্তন',
    descriptionEn: 'Adult height decreased by > 15 cm or weight shifted by > 30 kg within 30 days without clinical documentation.',
    descriptionBn: '৩০ দিনের মধ্যে প্রাপ্তবয়স্কের উচ্চতা ১৫ সেমি হ্রাস বা ওজন ৩০ কেজির বেশি হ্রাস/বৃদ্ধি পেয়েছে।',
    clinicalRationaleEn: 'Extreme adult height drops suggest recording in inches rather than centimeters, or significant data entry errors.',
    clinicalRationaleBn: 'উচ্চতার অস্বাভাবিক পতন সেন্টিমিটারের পরিবর্তে ইঞ্চিতে লেখার ত্রুটি বা তথ্য বিভ্রাট নির্দেশ করে।',
  },
  'RULE-PAT-006': {
    ruleId: 'RULE-PAT-006',
    version: '1.0.0',
    category: 'patient_data',
    subtype: 'inconsistent_medical_history',
    defaultSeverity: 'high',
    methodology: 'deterministic_rule',
    assignedRole: 'clinician',
    titleEn: 'Diagnosis Preceding Patient Date of Birth',
    titleBn: 'রোগীর জন্মের পূর্ববর্তী রোগ নির্ণয় তারিখ',
    descriptionEn: 'A chronic medical condition is recorded with a diagnosis year prior to the patient birth year.',
    descriptionBn: 'রোগীর জন্মসালের পূর্বে কোনো ক্রনিক রোগ নির্ণয় হওয়ার তারিখ রেকর্ড করা হয়েছে।',
    clinicalRationaleEn: 'Impossible chronological sequence indicates flawed medical records.',
    clinicalRationaleBn: 'কালানুক্রমিক অসঙ্গতি চিকিৎসা তথ্যের ভুল বা বিকৃতি নির্দেশ করে।',
  },

  // --------------------------------------------------------------------------
  // ASSESSMENT INCONSISTENCY RULES
  // --------------------------------------------------------------------------
  'RULE-ASM-001': {
    ruleId: 'RULE-ASM-001',
    version: '1.0.0',
    category: 'assessment_inconsistency',
    subtype: 'profile_assessment_mismatch',
    defaultSeverity: 'high',
    methodology: 'deterministic_rule',
    assignedRole: 'clinician',
    titleEn: 'Patient Baseline Profile vs. Assessment Conflict',
    titleBn: 'রোগীর প্রোফাইল ও মূল্যায়ন তথ্যের গরমিল',
    descriptionEn: 'Patient profile records lifetime never-smoker, but intake assessment records heavy active smoker with > 20 pack-years.',
    descriptionBn: 'প্রোফাইলে অধূমপায়ী লেখা কিন্তু নতুন মূল্যায়নে ২০+ প্যাক-বছর ভারী ধূমপায়ী হিসেবে উল্লেখ রয়েছে।',
    clinicalRationaleEn: 'Cross-form discordance jeopardizes clinical triage accuracy and screening recommendations.',
    clinicalRationaleBn: 'ফর্মের মধ্যকার বৈপরীত্য স্ক্রিনিং সুপারিশ এবং ট্রায়াজের নির্ভুলতাকে ঝুঁকিতে ফেলে।',
  },
  'RULE-ASM-002': {
    ruleId: 'RULE-ASM-002',
    version: '1.0.0',
    category: 'assessment_inconsistency',
    subtype: 'contradictory_responses',
    defaultSeverity: 'critical',
    methodology: 'deterministic_rule',
    assignedRole: 'clinician',
    titleEn: 'Contradictory Symptom Checklist vs. Narrative Responses',
    titleBn: 'উপসর্গ তালিকা ও বর্ণনামূলক উত্তরের অসঙ্গতি',
    descriptionEn: 'Respondent checked "No respiratory symptoms", yet reported persistent hemoptysis or severe cough in subsequent questions.',
    descriptionBn: 'উপসর্গ তালিকায় "কোনো লক্ষণ নেই" নির্বাচন করা হলেও পরবর্তী প্রশ্নে রক্তকাশির মতো বিপজ্জনক লক্ষণ চিহ্নিত হয়েছে।',
    clinicalRationaleEn: 'Safety Invariant: High-risk symptoms must never be missed due to contradiction; requires urgent review.',
    clinicalRationaleBn: 'নিরাপত্তা নীতি: অসঙ্গতির কারণে উচ্চ-ঝুঁকিপূর্ণ উপসর্গ কোনোভাবেই উপেক্ষা করা যাবে না।',
  },
  'RULE-ASM-003': {
    ruleId: 'RULE-ASM-003',
    version: '1.0.0',
    category: 'assessment_inconsistency',
    subtype: 'submission_burst',
    defaultSeverity: 'medium',
    methodology: 'rolling_zscore',
    assignedRole: 'administrator',
    titleEn: 'Rapid Duplicate Submission Burst for Same Patient',
    titleBn: 'একই রোগীর দ্রুত একাধিক মূল্যায়ন জমা প্রদান',
    descriptionEn: 'More than 3 assessment forms submitted for the same patient identity within a 5-minute interval.',
    descriptionBn: 'একই রোগীর জন্য ৫ মিনিটের মধ্যে ৩টির বেশি মূল্যায়ন ফর্ম সাবমিট করা হয়েছে।',
    clinicalRationaleEn: 'Indicates client double-submission, synchronization loop, or automated bot interaction.',
    clinicalRationaleBn: 'এটি ডাবল-সাবমিশন, সিঙ্ক্রোনাইজেশন লুপ বা স্বয়ংক্রিয় ত্রুটি নির্দেশ করে।',
  },
  'RULE-ASM-004': {
    ruleId: 'RULE-ASM-004',
    version: '1.0.0',
    category: 'assessment_inconsistency',
    subtype: 'abrupt_consecutive_shift',
    defaultSeverity: 'high',
    methodology: 'statistical_iqr',
    assignedRole: 'clinician',
    titleEn: 'Unexplained Collapse of Cumulative Smoking Pack-Years',
    titleBn: 'ধূমপানের প্যাক-বছরের অযৌক্তিক হ্রাস',
    descriptionEn: 'Cumulative pack-years dropped from 35 to 5 across consecutive assessments without documented correction.',
    descriptionBn: 'ধারাবাহিক মূল্যায়নে কোনো কারণ উল্লেখ ছাড়াই প্যাক-বছর ৩৫ থেকে কমে ৫ এ নেমে এসেছে।',
    clinicalRationaleEn: 'Pack-years is a cumulative lifetime quantity that can never naturally decrease over chronological time.',
    clinicalRationaleBn: 'প্যাক-বছর হলো সারাজীবনের মোট সঞ্চিত পরিমাণ যা সময়ের সাথে স্বাভাবিকভাবে কখনোই কমতে পারে না।',
  },

  // --------------------------------------------------------------------------
  // DATA QUALITY RULES
  // --------------------------------------------------------------------------
  'RULE-DQ-001': {
    ruleId: 'RULE-DQ-001',
    version: '1.0.0',
    category: 'data_quality',
    subtype: 'missing_critical_fields',
    defaultSeverity: 'medium',
    methodology: 'deterministic_rule',
    assignedRole: 'healthcare_worker',
    titleEn: 'Incomplete Assessment Input Requiring Imputation',
    titleBn: 'মূল্যায়নে প্রয়োজনীয় তথ্যের অনুপস্থিতি',
    descriptionEn: 'Critical clinical predictor fields (e.g. smoking duration, age, general health) are null or unrecorded.',
    descriptionBn: 'গুরুত্বপূর্ণ ক্লিনিকাল ক্ষেত্র (যেমন ধূমপানের সময়, বয়স, সাধারণ স্বাস্থ্য) খালি বা অনির্দিষ্ট রাখা হয়েছে।',
    clinicalRationaleEn: 'Missing clinical covariates force fallback to imputation, reducing risk prediction certainty.',
    clinicalRationaleBn: 'অনুপস্থিত তথ্যের কারণে অনুমানের উপর নির্ভর করতে হয়, যা ঝুঁকির পূর্বাভাসের নির্ভরযোগ্যতা কমায়।',
  },
  'RULE-DQ-002': {
    ruleId: 'RULE-DQ-002',
    version: '1.0.0',
    category: 'data_quality',
    subtype: 'stale_data',
    defaultSeverity: 'low',
    methodology: 'deterministic_rule',
    assignedRole: 'administrator',
    titleEn: 'Stale Environmental or Offline Synchronized Cache',
    titleBn: 'মেয়াদোত্তীর্ণ পরিবেশ বা অফলাইন সংরক্ষিত তথ্য',
    descriptionEn: 'Cached environmental intelligence or pending offline queue items exceed operational retention limits (> 30 days).',
    descriptionBn: 'পরিবেশগত তথ্য বা অপেক্ষমান অফলাইন কিউয়ের তথ্য গ্রহণযোগ্য সময়সীমা (> ৩০ দিন) অতিক্রম করেছে।',
    clinicalRationaleEn: 'Outdated air quality observations should not be used for current real-time environmental context.',
    clinicalRationaleBn: 'পুরোনো বায়ুর মান বর্তমান তাৎক্ষণিক পরিবেশগত মূল্যায়নে ব্যবহার করা অনুচিত।',
  },

  // --------------------------------------------------------------------------
  // ENVIRONMENTAL RULES
  // --------------------------------------------------------------------------
  'RULE-ENV-001': {
    ruleId: 'RULE-ENV-001',
    version: '1.0.0',
    category: 'environmental',
    subtype: 'unphysical_pollutant_reading',
    defaultSeverity: 'high',
    methodology: 'deterministic_rule',
    assignedRole: 'administrator',
    titleEn: 'Unphysical Environmental Pollutant Concentration',
    titleBn: 'অবাস্তব পরিবেশগত দূষণমাত্রা রিডিং',
    descriptionEn: 'Air quality monitor reported negative PM2.5/PM10 or values exceeding physical atmospheric limits (> 1000 µg/m³).',
    descriptionBn: 'বায়ুমান মনিটরে ঋণাত্মক PM2.5/PM10 বা বায়ুমণ্ডলীয় সীমার অতিরিক্ত রিডিং (> ১০০০ µg/m³) দেখা গেছে।',
    clinicalRationaleEn: 'Sensor optical chamber fault or corrupted API payload.',
    clinicalRationaleBn: 'সেন্সরের যান্ত্রিক ত্রুটি বা এপিআই ডেটা করাপশন।',
  },
  'RULE-ENV-002': {
    ruleId: 'RULE-ENV-002',
    version: '1.0.0',
    category: 'environmental',
    subtype: 'sensor_stuck_constant',
    defaultSeverity: 'medium',
    methodology: 'statistical_mad',
    assignedRole: 'administrator',
    titleEn: 'Sensor Flatline / Stuck Output Constant',
    titleBn: 'সেন্সর ফ্ল্যাটলাইন বা অপরিবর্তিত ধ্রুবক মান',
    descriptionEn: 'Continuous environmental sensor recorded identical decimal readings across 12 consecutive hourly intervals.',
    descriptionBn: 'টানা ১২ ঘণ্টা ধরে সেন্সরে হুবহু একই দশমিক মান রেকর্ড হয়েছে, যা স্বাভাবিক বায়ুর তারতম্যের সাথে অসঙ্গতিপূর্ণ।',
    clinicalRationaleEn: 'Atmospheric PM2.5 continuously fluctuates; zero variance indicates frozen telemetry or unrefreshed cache.',
    clinicalRationaleBn: 'বায়ুর মান সবসময় পরিবর্তনশীল; শূন্য বৈচিত্র্য সংকেতের অচল অবস্থা নির্দেশ করে।',
  },
  'RULE-ENV-003': {
    ruleId: 'RULE-ENV-003',
    version: '1.0.0',
    category: 'environmental',
    subtype: 'sudden_extreme_spike',
    defaultSeverity: 'high',
    methodology: 'statistical_mad',
    assignedRole: 'administrator',
    titleEn: 'Sudden Unexplained Environmental Rate-of-Change Spike',
    titleBn: 'পরিবেশ দূষণমাত্রায় হঠাৎ চরম মাত্রার উল্লম্ফন',
    descriptionEn: 'Hourly PM2.5 shifted by > 250 µg/m³ in 1 hour without documented wildfire, industrial event, or sandstorm.',
    descriptionBn: '১ ঘণ্টার ব্যবধানে PM2.5 এর মান ২৫০ µg/m³ এর বেশি পরিবর্তিত হয়েছে।',
    clinicalRationaleEn: 'Abrupt jumps may represent localized sensor dust contamination rather than ambient district exposure.',
    clinicalRationaleBn: 'হঠাৎ অস্বাভাবিক পরিবর্তন সেন্সরে ময়লা জমার কারণে হতে পারে।',
  },

  // --------------------------------------------------------------------------
  // OPERATIONAL RULES
  // --------------------------------------------------------------------------
  'RULE-OPS-001': {
    ruleId: 'RULE-OPS-001',
    version: '1.0.0',
    category: 'operational',
    subtype: 'submission_volume_spike_or_drop',
    defaultSeverity: 'high',
    methodology: 'rolling_zscore',
    assignedRole: 'administrator',
    titleEn: 'Operational Assessment Submission Volume Anomaly',
    titleBn: 'কার্যক্রমের মূল্যায়ন জমার হারে অস্বাভাবিক বিচ্যুতি',
    descriptionEn: 'Daily facility assessment volume deviated from 7-day rolling baseline by > 3.5 standard deviations or 0 on active weekday.',
    descriptionBn: 'দৈনিক মূল্যায়ন সংখ্যা বিগত ৭ দিনের গড়ের চেয়ে ৩.৫ গুণ স্ট্যান্ডার্ড ডেভিয়েশন বেশি বা কর্মদিবসে শূন্য।',
    clinicalRationaleEn: 'Detects network outages, field worker device failures, or unexpected load spikes.',
    clinicalRationaleBn: 'নেটওয়ার্ক বিভ্রাট, ফিল্ড কর্মীদের ডিভাইসের সমস্যা বা হঠাৎ কাজের অস্বাভাবিক চাপ শনাক্ত করে।',
  },
  'RULE-OPS-002': {
    ruleId: 'RULE-OPS-002',
    version: '1.0.0',
    category: 'operational',
    subtype: 'high_notification_failure_rate',
    defaultSeverity: 'high',
    methodology: 'deterministic_rule',
    assignedRole: 'administrator',
    titleEn: 'Critical Notification Delivery Failure Burst',
    titleBn: 'নোটিফিকেশন বা এসএমএস ডেলিভারিতে মাত্রাতিরিক্ত ব্যর্থতা',
    descriptionEn: 'SMS or WhatsApp alert delivery failure rate exceeded 20% over a 24-hour observation window.',
    descriptionBn: '২৪ ঘণ্টায় এসএমএস বা সতর্কবার্তা পৌঁছাতে ব্যর্থতার হার ২০% অতিক্রম করেছে।',
    clinicalRationaleEn: 'Patient safety risk: Critical clinical referral alerts and follow-up reminders failing to reach recipients.',
    clinicalRationaleBn: 'রোগীর নিরাপত্তা ঝুঁকি: জরুরি রেফারেল বা ফলো-আপ বার্তা রোগীদের কাছে পৌঁছাচ্ছে না।',
  },
  'RULE-OPS-003': {
    ruleId: 'RULE-OPS-003',
    version: '1.0.0',
    category: 'operational',
    subtype: 'referral_bottleneck',
    defaultSeverity: 'high',
    methodology: 'deterministic_rule',
    assignedRole: 'administrator',
    titleEn: 'Urgent Clinical Referral Bottleneck Exceeding SLA',
    titleBn: 'জরুরি ক্লিনিকাল রেফারেল অনুমোদনে বিলম্ব',
    descriptionEn: 'Urgent referral case remained pending without intake or clinician review for more than 14 days.',
    descriptionBn: 'জরুরি রেফারেল কেস ১৪ দিনের বেশি সময় ধরে পর্যালোচনা বা চিকিৎসকের গ্রহণ ব্যতীত অপেক্ষমান রয়েছে।',
    clinicalRationaleEn: 'Violates cancer diagnostic pathways where prompt specialist consultation is critical.',
    clinicalRationaleBn: 'ক্যান্সার নির্ণয়ের জরুরি সময়সীমা লঙ্ঘন করে যেখানে দ্রুত বিশেষজ্ঞের পরামর্শ অত্যন্ত জরুরি।',
  },
}

export function getAnomalyRule(ruleId: string): AnomalyRuleDefinition | undefined {
  return ANOMALY_RULE_REGISTRY[ruleId]
}

export function getAllAnomalyRules(): AnomalyRuleDefinition[] {
  return Object.values(ANOMALY_RULE_REGISTRY)
}

export function getAnomalyRulesByCategory(category: AnomalyCategory): AnomalyRuleDefinition[] {
  return Object.values(ANOMALY_RULE_REGISTRY).filter((r) => r.category === category)
}

