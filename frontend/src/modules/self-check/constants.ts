export const SELF_CHECK_METHODOLOGY = {
  version: '1.0.0-pilot',
  approvalStatus: 'Educational Pilot Implementation — Pending Formal Clinical Prospective Trial',
  primaryGuidelines: [
    'U.S. Preventive Services Task Force (USPSTF 2021) Screening for Lung Cancer: Recommended annual screening with low-dose CT in adults aged 50 to 80 years who have a 20 pack-year smoking history and currently smoke or have quit within the past 15 years.',
    'PLCOm2012 Model Variables Adaptation: Incorporates age, smoking intensity/duration, family history, chronic lung disease, and regional biomass fuel combustion exposure.',
    'National Institute for Health and Care Excellence (NICE NG12) Suspected Cancer: Recognition and Referral Guidelines for persistent cough, hemoptysis, and constitutional symptoms.',
  ],
  intendedPopulation:
    'Adults aged 18 and older residing in Bangladesh or South Asian diaspora seeking introductory pulmonary risk awareness.',
  limitations: [
    'Not a diagnostic device or radiological investigation.',
    'Cannot detect asymptomatic nodules without Low-Dose CT imaging.',
    'Self-reported environmental exposure is qualitative and does not replace ambient sensor measurements.',
    'Symptom assessment is introductory and requires professional clinical auscultation and history taking.',
  ],
} as const
