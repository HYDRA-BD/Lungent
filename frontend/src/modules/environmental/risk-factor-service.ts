import type { EnvironmentalRiskFactorDefinition } from './types'

export const MANDATORY_RISK_FACTOR_DISCLAIMER =
  'Environmental and occupational factors represent contextual epidemiological risk indicators and mechanistic biological plausibility. ' +
  'They do NOT independently establish an individual patient\'s lung cancer diagnosis, do NOT calculate a personal probability of malignancy, ' +
  'and must NEVER be used to suppress or override urgent clinical red-flag symptom triage (e.g. hemoptysis, stridor).'

export const CURATED_ENVIRONMENTAL_RISK_FACTORS: EnvironmentalRiskFactorDefinition[] = [
  {
    profileCode: 'RISK-ENV-PM25',
    titleEn: 'Ambient Fine Particulate Matter (PM2.5)',
    titleBn: 'পরিবেষ্টিত সূক্ষ্ম ভাসমান কণা (PM2.5)',
    category: 'ambient_particulate',
    iarcClassification: 'IARC Group 1 — Carcinogenic to humans',
    scientificReference: 'IARC Monographs on the Evaluation of Carcinogenic Risks to Humans, Vol 109 (2016)',
    measurementMethodology: 'Continuous Beta Attenuation Monitoring (BAM-1020) & Satellite Optical Depth Inversion',
    biologicalMechanism:
      'Inhaled particles <2.5 µm penetrate into terminal bronchioles and alveoli, triggering chronic pulmonary inflammation, ' +
      'reactive oxygen species (ROS) formation, DNA adduct generation, and EGFR/KRAS pathway activation.',
    clinicalDisclaimer: MANDATORY_RISK_FACTOR_DISCLAIMER,
    isActive: true,
  },
  {
    profileCode: 'RISK-ENV-BIOMASS',
    titleEn: 'Household Biomass Combustion Smoke (Traditional Chula)',
    titleBn: 'গৃহস্থালির বায়োমাস রান্নার ধোঁয়া (ঐতিহ্যবাহী চুলা)',
    category: 'indoor_biomass',
    iarcClassification: 'IARC Group 2A — Probably carcinogenic to humans (Biomass wood/agricultural residue combustion)',
    scientificReference: 'WHO Guidelines for Indoor Air Quality: Household Fuel Combustion (2014); Lancet Global Health (2021)',
    measurementMethodology: 'Self-reported household stove typology, daily cooking duration, kitchen ventilation status',
    biologicalMechanism:
      'Incomplete combustion of dried dung, jute sticks, and wood releases concentrated polycyclic aromatic hydrocarbons (PAHs), ' +
      'benzo[a]pyrene, formaldehyde, and carbon monoxide in enclosed, poorly-ventilated rural kitchens.',
    clinicalDisclaimer: MANDATORY_RISK_FACTOR_DISCLAIMER,
    isActive: true,
  },
  {
    profileCode: 'RISK-ENV-TRAP',
    titleEn: 'Traffic-Related Air Pollution & Diesel Engine Exhaust',
    titleBn: 'যানবাহন ও ডিজেল নির্গমন সম্পর্কিত বায়ু দূষণ',
    category: 'traffic_proximity',
    iarcClassification: 'IARC Group 1 — Carcinogenic to humans (Diesel engine exhaust)',
    scientificReference: 'IARC Monograph 105 (2012); Health Effects Institute (HEI) Special Report 23 (2022)',
    measurementMethodology: 'Roadway proximity buffer (<100m arterial road), traffic density metrics, elemental carbon proxy',
    biologicalMechanism:
      'Diesel exhaust particles contain adsorbed nitro-PAHs and volatile organic compounds that induce chromosomal aberrations ' +
      'and oxidative stress in human bronchial epithelial cells.',
    clinicalDisclaimer: MANDATORY_RISK_FACTOR_DISCLAIMER,
    isActive: true,
  },
  {
    profileCode: 'RISK-ENV-BRICK',
    titleEn: 'Fixed Chimney Brick Kiln (FCBK) & Coal Point Sources',
    titleBn: 'ইটভাটা ও কয়লা ভিত্তিক শিল্প নির্গমন',
    category: 'industrial_point_source',
    iarcClassification: 'IARC Group 1 / High-Toxicity Industrial Aerosol',
    scientificReference: 'World Bank Air Quality in Bangladesh (2019); Clean Air and Sustainable Environment (CASE) Reports',
    measurementMethodology: 'Geographic proximity (<3km buffer to active brick kiln cluster) and seasonal winter wind vector analysis',
    biologicalMechanism:
      'Low-efficiency sub-bituminous coal combustion emits heavy metal-laden fly ash, sulfur dioxide, and respirable black carbon.',
    clinicalDisclaimer: MANDATORY_RISK_FACTOR_DISCLAIMER,
    isActive: true,
  },
  {
    profileCode: 'RISK-ENV-OCCUPATIONAL-DUST',
    titleEn: 'Occupational Respirable Dusts (Silica, Shipbreaking, Asbestos)',
    titleBn: 'পেশাগত ধূলিকণা ও রাসায়নিক এক্সপোজার (সিলিকা, জাহাজ ভাঙা, অ্যাসবেস্টস)',
    category: 'occupational_dust',
    iarcClassification: 'IARC Group 1 — Carcinogenic to humans (Crystalline silica quartz, Asbestos all forms)',
    scientificReference: 'IARC Monograph 100C (2012); ILO/WHO Occupational Health Safety Standards',
    measurementMethodology: 'Occupational questionnaire, industry classification, employment duration (years), personal PPE use',
    biologicalMechanism:
      'Inhaled crystalline silica particles cause alveolar macrophage cytotoxicity, progressive silicotic granulomas, ' +
      'and persistent fibroproliferative stimulation promoting neoplastic transformation.',
    clinicalDisclaimer: MANDATORY_RISK_FACTOR_DISCLAIMER,
    isActive: true,
  },
]

export class EnvironmentalRiskFactorService {
  public static getAllRiskFactors(): EnvironmentalRiskFactorDefinition[] {
    return CURATED_ENVIRONMENTAL_RISK_FACTORS.filter((f) => f.isActive)
  }

  public static getRiskFactorByCode(code: string): EnvironmentalRiskFactorDefinition | undefined {
    return CURATED_ENVIRONMENTAL_RISK_FACTORS.find((f) => f.profileCode === code)
  }

  public static getRiskFactorsByCategory(
    category: EnvironmentalRiskFactorDefinition['category']
  ): EnvironmentalRiskFactorDefinition[] {
    return CURATED_ENVIRONMENTAL_RISK_FACTORS.filter((f) => f.category === category && f.isActive)
  }
}

