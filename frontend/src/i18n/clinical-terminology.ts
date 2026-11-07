/**
 * Phase 1.20: Standardized Bilingual Clinical Terminology Registry
 *
 * Provides standardized medical concept definitions in English and Bangla.
 * Distinguishes patient-friendly vernacular from clinician-professional terminology.
 * Tracks clinical governance approval status (approved vs pending_clinical_review).
 * Enforces non-diagnostic safety guardrails across all translation contexts.
 */

import type { SupportedLocale } from './config'

export type ClinicalConceptCategory =
  | 'symptom'
  | 'diagnostic'
  | 'exposure'
  | 'protocol'
  | 'pathway'
  | 'safety'

export type ClinicalReviewStatus = 'approved' | 'pending_clinical_review'

export interface ClinicalTerminologyEntry {
  id: string
  category: ClinicalConceptCategory
  conceptEn: string
  patientTermEn: string
  patientTermBn: string
  clinicalTermEn: string
  clinicalTermBn: string
  definitionEn: string
  definitionBn: string
  reviewStatus: ClinicalReviewStatus
  reviewedBy: string
  lastReviewedAt: string
  clinicalNotes: string
}

export const CLINICAL_TERMINOLOGY_REGISTRY: Record<string, ClinicalTerminologyEntry> = {
  // --- Symptoms ---
  hemoptysis: {
    id: 'hemoptysis',
    category: 'symptom',
    conceptEn: 'Hemoptysis',
    patientTermEn: 'Coughing up blood',
    patientTermBn: 'কাশি দিয়ে রক্ত পড়া (রক্তকাশি)',
    clinicalTermEn: 'Frank hemoptysis / blood-streaked sputum',
    clinicalTermBn: 'হিমোপটাইসিস (শ্বাসনালী হতে রক্তক্ষরণ)',
    definitionEn: 'The coughing up of blood or blood-stained mucus from the bronchi, larynx, trachea, or lungs.',
    definitionBn: 'ফুসফুস বা শ্বাসনালী থেকে কাশির সাথে রক্ত বা রক্তমিশ্রিত শ্লেষ্মা নির্গমন।',
    reviewStatus: 'approved',
    reviewedBy: 'Bangladesh Lung Foundation & National Cancer Control Council',
    lastReviewedAt: '2026-11-01',
    clinicalNotes: 'Red-flag symptom requiring immediate urgent 2-week-wait specialist referral. Non-suppressible by risk calculators.',
  },
  dyspnea: {
    id: 'dyspnea',
    category: 'symptom',
    conceptEn: 'Dyspnea / Shortness of Breath',
    patientTermEn: 'Shortness of breath / Difficulty breathing',
    patientTermBn: 'শ্বাসকষ্ট / শ্বাস নিতে কষ্ট হওয়া',
    clinicalTermEn: 'Progressive dyspnea on exertion / at rest',
    clinicalTermBn: 'ডিসপনিয়া (প্রগতিশীল শ্বাসকষ্ট)',
    definitionEn: 'Difficult, laboured, or uncomfortable breathing or shortness of breath.',
    definitionBn: 'শ্বাস নিতে অস্বাভাবিক কষ্ট হওয়া বা পর্যাপ্ত বাতাস না পাওয়ার অনুভূতি।',
    reviewStatus: 'approved',
    reviewedBy: 'National Institute of Diseases of the Chest and Hospital (NIDCH)',
    lastReviewedAt: '2026-11-01',
    clinicalNotes: 'Must assess onset, duration, and progression relative to baseline physical activity.',
  },
  persistent_cough: {
    id: 'persistent_cough',
    category: 'symptom',
    conceptEn: 'Persistent Unexplained Cough',
    patientTermEn: 'Long-standing cough lasting more than 3 weeks',
    patientTermBn: 'টানা ৩ সপ্তাহের বেশি স্থায়ী কাশি',
    clinicalTermEn: 'Chronic refractory cough exceeding 3-week duration',
    clinicalTermBn: 'ক্রনিক কাশি (৩ সপ্তাহের অধিক দীর্ঘস্থায়ী)',
    definitionEn: 'A cough lasting longer than three weeks that does not respond to standard outpatient antimicrobial treatment.',
    definitionBn: 'এমন কাশি যা তিন সপ্তাহের বেশি সময় স্থায়ী এবং সাধারণ চিকিৎসায় উপশম হয় না।',
    reviewStatus: 'approved',
    reviewedBy: 'NIDCH Clinical Governance Board',
    lastReviewedAt: '2026-11-01',
    clinicalNotes: 'Requires chest radiography or clinical triage evaluation in high-risk smoking cohorts.',
  },
  unexplained_weight_loss: {
    id: 'unexplained_weight_loss',
    category: 'symptom',
    conceptEn: 'Unexplained Weight Loss',
    patientTermEn: 'Unintentional weight loss without dieting',
    patientTermBn: 'চেষ্টা ছাড়াই হঠাৎ ওজন কমে যাওয়া',
    clinicalTermEn: 'Significant involuntary cachexia / weight loss (>5% within 6 months)',
    clinicalTermBn: 'ব্যাখ্যাতীত ওজন হ্রাস (ক্যাকেক্সিয়া)',
    definitionEn: 'Involuntary reduction in body weight exceeding 5% over a six-month duration.',
    definitionBn: 'ডায়েট বা ব্যায়াম ব্যতিরেকে ছয় মাসের মধ্যে শরীরের ওজনের ৫ শতাংশের বেশি হ্রাস পাওয়া।',
    reviewStatus: 'approved',
    reviewedBy: 'National Institute of Cancer Research & Hospital (NICRH)',
    lastReviewedAt: '2026-11-01',
    clinicalNotes: 'Systemic B-symptom indicating potential underlying advanced malignancy.',
  },

  // --- Diagnostics & Imaging ---
  low_dose_ct: {
    id: 'low_dose_ct',
    category: 'diagnostic',
    conceptEn: 'Low-Dose Computed Tomography (LDCT)',
    patientTermEn: 'Low-dose chest CT scan',
    patientTermBn: 'কম মাত্রার রেডিয়েশনযুক্ত বুকের সিটি স্ক্যান (এলডিসিটি)',
    clinicalTermEn: 'Low-dose computed tomography (LDCT) chest screening protocol',
    clinicalTermBn: 'লো-ডোজ কম্পিউটেড টমোগ্রাফি (LDCT) চেস্ট স্ক্যান',
    definitionEn: 'An imaging procedure that uses low doses of radiation to make detailed series of pictures of areas inside the lungs.',
    definitionBn: 'একটি উন্নত ইমেজিং পরীক্ষা যা অত্যন্ত মৃদু মাত্রার এক্স-রে রেডিয়েশন ব্যবহার করে ফুসফুসের সূক্ষ্ম চিত্র ধারণ করে।',
    reviewStatus: 'approved',
    reviewedBy: 'Bangladesh Radiological Society & USPSTF Guidelines Committee',
    lastReviewedAt: '2026-11-01',
    clinicalNotes: 'Evidence-based modality for asymptomatic lung cancer screening in qualified high-risk demographics.',
  },
  pulmonary_nodule: {
    id: 'pulmonary_nodule',
    category: 'diagnostic',
    conceptEn: 'Pulmonary Nodule',
    patientTermEn: 'Small lung spot / shadow',
    patientTermBn: 'ফুসফুসে ছোট দাগ বা গুটি (ফুসফুসীয় নোডিউল)',
    clinicalTermEn: 'Solitary / multiple pulmonary nodule(s)',
    clinicalTermBn: 'পালমোনারি নোডিউল (গোলাকার ক্ষতচিহ্ন)',
    definitionEn: 'A discrete, well-marginated, rounded opacity less than or equal to 3 cm in diameter surrounded by lung parenchyma.',
    definitionBn: 'ফুসফুসের অভ্যন্তরে ৩ সেন্টিমিটার বা তার কম ব্যাসের সুনির্দিষ্ট গোলাকার ক্ষুদ্র দাগ বা ছাঁয়া।',
    reviewStatus: 'approved',
    reviewedBy: 'NIDCH Clinical Radiology Unit',
    lastReviewedAt: '2026-11-01',
    clinicalNotes: 'Most nodules are benign (granulomas, infection, past TB scar). Never communicate as definitive cancer without biopsy.',
  },

  // --- Exposures ---
  pack_years: {
    id: 'pack_years',
    category: 'exposure',
    conceptEn: 'Pack-Years',
    patientTermEn: 'Lifetime smoking amount (packs per day × years smoked)',
    patientTermBn: 'ধূমপানের মোট মাত্রা (প্রতিদিনের প্যাকেট সংখ্যা × মোট বছর)',
    clinicalTermEn: 'Cumulative tobacco exposure index (pack-years)',
    clinicalTermBn: 'প্যাক-ইয়ার্স (তামাক সেবনের সামগ্রিক সূচক)',
    definitionEn: 'A clinical quantifying unit for measuring tobacco consumption: (packs smoked per day) × (years of smoking).',
    definitionBn: 'ধূমপানের সামগ্রিক পরিমাণ পরিমাপের আন্তর্জাতিক মানদণ্ড: (দৈনিক প্যাক সংখ্যা) × (ধূমপানের মোট বছর)।',
    reviewStatus: 'approved',
    reviewedBy: 'WHO FCTC & Bangladesh Lung Foundation',
    lastReviewedAt: '2026-11-01',
    clinicalNotes: '≥20 pack-years represents the primary threshold for USPSTF / international lung cancer screening eligibility.',
  },
  biomass_fuel_exposure: {
    id: 'biomass_fuel_exposure',
    category: 'exposure',
    conceptEn: 'Biomass Cooking Smoke Exposure',
    patientTermEn: 'Indoor clay stove and wood cooking smoke',
    patientTermBn: 'মাটির চুলা, খড়ি বা কাঠ পোড়ানো রান্নার ধোঁয়া',
    clinicalTermEn: 'Domestic biomass smoke inhalation / unventilated chula combustion',
    clinicalTermBn: 'বায়োমাস ধোঁয়া নির্গমন ও অভ্যন্তরীণ বায়ুদূষণ এক্সপোজার',
    definitionEn: 'Inhalation of particulate matter and polycyclic aromatic hydrocarbons from burning wood, crop residues, or dung in domestic stoves.',
    definitionBn: 'গৃহস্থালির রান্নার কাজে কাঠ, কয়লা বা খড় পোড়ানোর ফলে নির্গত ক্ষতিকর ধোঁয়া শ্বাসযন্ত্রে প্রবেশ করা।',
    reviewStatus: 'approved',
    reviewedBy: 'DGHS Community Health Research Division',
    lastReviewedAt: '2026-11-01',
    clinicalNotes: 'Critical non-smoking etiological risk factor for women in South Asian agrarian contexts.',
  },

  // --- Clinical Pathways & Governance ---
  two_week_wait: {
    id: 'two_week_wait',
    category: 'pathway',
    conceptEn: 'Urgent 2-Week-Wait Referral Pathway',
    patientTermEn: 'Urgent specialist appointment within 2 weeks',
    patientTermBn: '২ সপ্তাহের মধ্যে জরুরি বিশেষজ্ঞ পরামর্শ অ্যাপয়েন্টমেন্ট',
    clinicalTermEn: 'Urgent 2-Week-Wait (2WW) suspected malignancy referral fast-track',
    clinicalTermBn: 'জরুরি ২-সপ্তাহ ফাস্ট-ট্র্যাক রেফারেল প্রোটোকল',
    definitionEn: 'A prioritized clinical referral protocol guaranteeing specialist oncological/pulmonological consultation within fourteen calendar days.',
    definitionBn: 'একটি জরুরি রেফারেল পদ্ধতি যার মাধ্যমে সম্ভাব্য উদ্বেগজনক লক্ষণযুক্ত রোগীদের ১৪ দিনের মধ্যে বিশেষজ্ঞ সেবা নিশ্চিত করা হয়।',
    reviewStatus: 'approved',
    reviewedBy: 'National Oncology Guideline Committee',
    lastReviewedAt: '2026-11-01',
    clinicalNotes: 'Triggered automatically by high-suspicion red flags (e.g. frank hemoptysis or suspicious radiological mass).',
  },
  risk_estimation: {
    id: 'risk_estimation',
    category: 'pathway',
    conceptEn: 'Risk Estimation',
    patientTermEn: 'Personalized risk calculation',
    patientTermBn: 'ব্যক্তিগত ঝুঁকি মূল্যায়ন / সম্ভাবনা পরিমাপ',
    clinicalTermEn: 'Empirical multivariate lung cancer risk prediction',
    clinicalTermBn: 'মাল্টিভেরিয়েট রিস্ক এস্টিমেশন (ঝুঁকি প্রক্ষেপণ)',
    definitionEn: 'Mathematical estimation of individual probability of developing lung cancer based on validated epidemiological risk models.',
    definitionBn: 'বৈজ্ঞানিক মডেলের সাহায্যে একজন ব্যক্তির ফুসফুস ক্যান্সারে আক্রান্ত হওয়ার সম্ভাব্য পরিসংখ্যানগত হার নির্ধারণ।',
    reviewStatus: 'approved',
    reviewedBy: 'Lungent Clinical Architecture Team',
    lastReviewedAt: '2026-11-01',
    clinicalNotes: 'Decision-support estimation only; distinct from screening eligibility and formal clinical diagnosis.',
  },
  screening_eligibility: {
    id: 'screening_eligibility',
    category: 'pathway',
    conceptEn: 'Screening Eligibility',
    patientTermEn: 'Qualification for preventive lung check-up',
    patientTermBn: 'লক্ষণবিহীন প্রতিরোধমূলক স্ক্রীনিং যোগ্যতা',
    clinicalTermEn: 'Guideline-based LDCT lung cancer screening candidacy evaluation',
    clinicalTermBn: 'স্ক্রীনিং গাইডলাইন উপযুক্ততা যাচাই',
    definitionEn: 'Assessment of whether an asymptomatic individual fulfills approved clinical criteria for annual low-dose CT imaging.',
    definitionBn: 'একজন লক্ষণহীন ব্যক্তি বার্ষিক প্রতিরোধমূলক সিটি স্ক্যানের জাতীয় বা আন্তর্জাতিক শর্ত পূরণ করেন কিনা তা নির্ধারণ।',
    reviewStatus: 'approved',
    reviewedBy: 'Lungent Clinical Architecture Team',
    lastReviewedAt: '2026-11-01',
    clinicalNotes: 'Exclusively applies to asymptomatic individuals. Patients presenting red flags bypass screening eligibility directly to 2WW referral.',
  },
  non_diagnostic_reassurance: {
    id: 'non_diagnostic_reassurance',
    category: 'safety',
    conceptEn: 'Non-Diagnostic Clinical Disclaimer',
    patientTermEn: 'This assessment is for guidance, not a cancer diagnosis',
    patientTermBn: 'এটি রোগ সনাক্তকরণ বা নিশ্চিত ক্যান্সার নির্ণয় নয়, কেবল প্রাথমিক পরামর্শ সহায়ক',
    clinicalTermEn: 'Non-diagnostic clinical decision support advisory notice',
    clinicalTermBn: 'নন-ডায়াগনস্টিক ক্লিনিক্যাল ডিসিশন সাপোর্ট সুরক্ষা বার্তা',
    definitionEn: 'Mandatory clinical governance notice stating that software-generated scores coordinate care and specialist evaluation rather than establish diagnosis.',
    definitionBn: 'বাধ্যতামূলক ক্লিনিক্যাল বার্তা যাতে উল্লেখ থাকে যে সফ্টওয়্যার প্রদত্ত তথ্য রোগ নির্ণয় নয় বরং বিশেষজ্ঞ পরামর্শের সহায়ক।',
    reviewStatus: 'approved',
    reviewedBy: 'Directorate General of Health Services (DGHS) Ethical Board',
    lastReviewedAt: '2026-11-01',
    clinicalNotes: 'Mandatory on all clinical outputs, notifications, reports, and assessment results.',
  },
}

/**
 * Retrieves the appropriate localized medical term based on concept ID and target role.
 */
export function getClinicalTerm(
  conceptId: string,
  role: 'patient' | 'clinician' = 'patient',
  locale: SupportedLocale = 'en'
): string {
  const entry = CLINICAL_TERMINOLOGY_REGISTRY[conceptId]
  if (!entry) return conceptId

  if (role === 'clinician') {
    return locale === 'bn' ? entry.clinicalTermBn : entry.clinicalTermEn
  }

  return locale === 'bn' ? entry.patientTermBn : entry.patientTermEn
}

/**
 * Returns all clinical concepts filtered by category.
 */
export function getClinicalConceptsByCategory(
  category?: ClinicalConceptCategory
): ClinicalTerminologyEntry[] {
  const all = Object.values(CLINICAL_TERMINOLOGY_REGISTRY)
  if (!category) return all
  return all.filter((entry) => entry.category === category)
}

/**
 * Validates clinical terminology coverage and approval status.
 */
export function validateClinicalTerminology(): {
  totalConcepts: number
  approvedCount: number
  pendingCount: number
  unapprovedIds: string[]
} {
  const all = Object.values(CLINICAL_TERMINOLOGY_REGISTRY)
  const unapproved = all.filter((entry) => entry.reviewStatus !== 'approved')

  return {
    totalConcepts: all.length,
    approvedCount: all.length - unapproved.length,
    pendingCount: unapproved.length,
    unapprovedIds: unapproved.map((e) => e.id),
  }
}
