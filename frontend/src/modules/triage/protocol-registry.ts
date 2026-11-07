/**
 * Phase 1.14: Symptom-Based Clinical Triage Engine - Protocol Registry
 * 
 * Strict Clinical Governance:
 * No international or draft protocol is formally gazetted for autonomous clinical triage
 * in Bangladesh without formal Clinical Advisory Board approval.
 * In `clinical_production` mode, protocols with `approvedForBangladesh: false` pause determination.
 */

import type {
  SymptomTriageProtocolItem,
  SymptomTriageProtocolVersionItem,
} from './types'

export class SymptomTriageProtocolRegistry {
  private static protocols: Map<string, SymptomTriageProtocolItem> = new Map()
  private static protocolVersions: Map<string, SymptomTriageProtocolVersionItem[]> = new Map()

  static {
    // 1. NICE NG12 Suspected Cancer: Recognition and Referral (2015, updated 2023)
    const niceNg12: SymptomTriageProtocolItem = {
      id: 'proto-nice-ng12-2023',
      protocolCode: 'NICE-NG12-2023',
      name: 'NICE NG12 Suspected Cancer: Lung and Pleural Cancers Recognition & Referral',
      issuingOrganization: 'National Institute for Health and Care Excellence (NICE), United Kingdom',
      officialSourceUrl: 'https://www.nice.org.uk/guidance/ng12',
      publicationReference:
        'National Institute for Health and Care Excellence. Suspected cancer: recognition and referral (NICE guideline NG12). Section 1.2: Lung and pleural cancers. London: NICE; 2015 (last updated October 2023).',
      jurisdiction: 'United Kingdom / International Reference',
      intendedPopulation:
        'Individuals aged ≥40 years presenting with unexplained respiratory or constitutional symptoms in primary healthcare or community settings.',
      publicationDate: '2023-10-01',
      lastUpdatedDate: '2023-10-01',
      lifecycleStatus: 'under_validation',
      approvalAuthority: 'Clinical Advisory Board for Pulmonary Oncology & Triage',
      approvedForBangladesh: false,
      approvedAt: null,
      reviewDate: '2026-12-01T00:00:00Z',
      knownLimitations:
        'Developed for the UK National Health Service 2-week-wait (2WW) diagnostic pathway; requires calibration for Bangladesh high-prevalence pulmonary tuberculosis and biomass exposure context.',
      isActive: true,
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
    }
    this.protocols.set(niceNg12.id, niceNg12)

    this.protocolVersions.set(niceNg12.id, [
      {
        id: 'ver-nice-ng12-2023-v1',
        protocolId: niceNg12.id,
        versionTag: '2023.1-update',
        specificationReference: 'NICE NG12 (2023) Section 1.2',
        criteriaDefinitions: [
          {
            key: 'emergency_stridor_svco_massive_hemoptysis',
            label: 'Emergency Airway or Vascular Compromise',
            category: 'emergency',
            ruleDescription:
              'Presence of acute stridor, massive hemoptysis, or superior vena cava obstruction signs (facial edema, distended neck veins).',
            requiredConditionExpression: 'stridor == present OR hemoptysis.isMassive == true OR svco == present',
            isRedFlag: true,
          },
          {
            key: 'urgent_hemoptysis_age_40',
            label: 'Unexplained Hemoptysis in Patients Aged ≥40',
            category: 'urgent',
            ruleDescription:
              'Patient aged ≥40 years presenting with unexplained coughing of blood (hemoptysis).',
            requiredConditionExpression: 'age >= 40 AND hemoptysis == present',
            isRedFlag: true,
          },
          {
            key: 'urgent_constitutional_syndrome_smoker',
            label: 'Unexplained Weight Loss or Appetite Loss in Smoker/Exposed (Age ≥40)',
            category: 'urgent',
            ruleDescription:
              'Unexplained weight loss (>10%) or appetite loss combined with cough, fatigue, or dyspnea in an individual aged ≥40 with smoking history.',
            requiredConditionExpression:
              'age >= 40 AND (is_smoker OR has_biomass) AND (weight_loss == present OR appetite_loss == present) AND (cough == present OR fatigue == present OR dyspnea == present)',
            isRedFlag: true,
          },
          {
            key: 'urgent_persistent_cough_smoker_40',
            label: 'Persistent or Changing Cough (>3 Weeks) in Smoker (Age ≥40)',
            category: 'urgent',
            ruleDescription:
              'New, worsening, or persistent cough lasting >3 weeks in an individual aged ≥40 with a smoking history.',
            requiredConditionExpression: 'age >= 40 AND is_smoker AND (cough.duration >= 3 OR cough_changes == present)',
            isRedFlag: false,
          },
          {
            key: 'urgent_hoarseness_lymphadenopathy_clubbing',
            label: 'Persistent Hoarseness, Cervical Lymphadenopathy, or Finger Clubbing',
            category: 'urgent',
            ruleDescription:
              'Persistent hoarseness (>3 weeks), enlarged supraclavicular/cervical lymph nodes, or new finger clubbing.',
            requiredConditionExpression:
              'hoarseness.duration >= 3 OR cervical_lymphadenopathy == present OR finger_clubbing == present',
            isRedFlag: true,
          },
          {
            key: 'prompt_persistent_cough_non_smoker',
            label: 'Persistent Cough (>3 Weeks) in Non-Smoker without Red Flags',
            category: 'prompt',
            ruleDescription:
              'Unexplained persistent cough lasting >3 weeks in a non-smoker without constitutional red flags.',
            requiredConditionExpression: 'cough.duration >= 3 AND is_non_smoker AND red_flags == false',
            isRedFlag: false,
          },
        ],
        lifecycleStatus: 'under_validation',
        effectiveDate: '2023-10-01T00:00:00Z',
        changelog: 'Formal NICE NG12 criteria specification with urgent 2-week referral recommendations.',
        createdAt: '2026-01-15T00:00:00Z',
      },
    ])

    // 2. NIDCH Bangladesh Consensus Pilot Respiratory Triage Protocol (Draft 2026)
    const nidchTriage: SymptomTriageProtocolItem = {
      id: 'proto-nidch-triage-2026',
      protocolCode: 'NIDCH-TRIAGE-2026',
      name: 'NIDCH Bangladesh Consensus Pilot Respiratory Triage & Suspected Malignancy Protocol (Draft)',
      issuingOrganization:
        'National Institute of Diseases of the Chest and Hospital (NIDCH) & Bangladesh Lung Foundation (BLF)',
      officialSourceUrl: 'https://nidch.gov.bd/guidelines/pilot-respiratory-triage-2026',
      publicationReference:
        'NIDCH Clinical Advisory Panel. Bangladesh Consensus Protocol for Symptom-Based Respiratory Triage and Suspected Malignancy Referral in Resource-Constrained Settings. Dhaka: NIDCH Pilot Working Group; 2026.',
      jurisdiction: 'Bangladesh',
      intendedPopulation:
        'Adults aged ≥35 presenting with acute or chronic respiratory complaints in community, upazila, district, and tertiary hospitals in Bangladesh.',
      publicationDate: '2026-02-01',
      lastUpdatedDate: '2026-02-01',
      lifecycleStatus: 'under_validation',
      approvalAuthority: 'Directorate General of Health Services (DGHS) & NIDCH Clinical Board',
      approvedForBangladesh: false,
      approvedAt: null,
      reviewDate: '2026-12-15T00:00:00Z',
      knownLimitations:
        'Currently in prospective multicenter clinical validation; mandates simultaneous GeneXpert/AFB evaluation to distinguish tuberculosis from pulmonary neoplasm; requires secondary/tertiary referral facility access.',
      isActive: true,
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z',
    }
    this.protocols.set(nidchTriage.id, nidchTriage)

    this.protocolVersions.set(nidchTriage.id, [
      {
        id: 'ver-nidch-triage-2026-v1',
        protocolId: nidchTriage.id,
        versionTag: '2026.1-pilot',
        specificationReference: 'NIDCH Pilot Working Group Specification (Draft Feb 2026)',
        criteriaDefinitions: [
          {
            key: 'nidch_emergency_massive_hemoptysis_stridor',
            label: 'Emergency Hemoptysis or Acute Airway Obstruction',
            category: 'emergency',
            ruleDescription: 'Massive hemoptysis (>100mL in 24h) or acute stridor requiring immediate resuscitation.',
            requiredConditionExpression: 'hemoptysis.isMassive == true OR stridor == present',
            isRedFlag: true,
          },
          {
            key: 'nidch_urgent_hemoptysis_biomass_smoker',
            label: 'Hemoptysis with Smoking or ≥15y Biomass Exposure (Age ≥35)',
            category: 'urgent',
            ruleDescription: 'Any hemoptysis in patients aged ≥35 with history of tobacco or chronic biomass smoke.',
            requiredConditionExpression: 'age >= 35 AND hemoptysis == present AND (is_smoker OR has_biomass)',
            isRedFlag: true,
          },
          {
            key: 'nidch_urgent_constitutional_tb_differential',
            label: 'Constitutional Syndrome Requiring TB vs Neoplasm Differential',
            category: 'urgent',
            ruleDescription:
              'Unexplained weight loss (>10%) + persistent cough >3 weeks in high-risk patient; mandates GeneXpert and contrast CT.',
            requiredConditionExpression: 'age >= 35 AND weight_loss == present AND cough.duration >= 3',
            isRedFlag: true,
          },
          {
            key: 'nidch_prompt_recurrent_infection_unresolved_cough',
            label: 'Recurrent Respiratory Infection or Unresolving Cough (>3 Weeks)',
            category: 'prompt',
            ruleDescription: 'Recurrent pneumonia or cough persisting >3 weeks despite conventional antibiotic course.',
            requiredConditionExpression: 'cough.duration >= 3 OR recurrentChestInfections == present',
            isRedFlag: false,
          },
        ],
        lifecycleStatus: 'under_validation',
        effectiveDate: '2026-02-01T00:00:00Z',
        changelog: 'Bangladesh-specific consensus criteria incorporating biomass exposure and TB differential.',
        createdAt: '2026-01-15T00:00:00Z',
      },
    ])

    // 3. WHO LMIC Acute & Chronic Respiratory Triage Protocol (2024)
    const whoLmic: SymptomTriageProtocolItem = {
      id: 'proto-who-lmic-2024',
      protocolCode: 'WHO-LMIC-2024',
      name: 'WHO Integrated Respiratory Disease Management in LMICs (Triage Protocol)',
      issuingOrganization: 'World Health Organization (WHO)',
      officialSourceUrl: 'https://who.int/publications/i/item/9789240082345',
      publicationReference:
        'World Health Organization. Operational guidance on respiratory symptom triage and early diagnostic escalation in resource-constrained health systems. Geneva: WHO; 2024.',
      jurisdiction: 'Global / LMIC Reference',
      intendedPopulation:
        'Adults presenting with acute or chronic respiratory signs in low- and middle-income country community settings.',
      publicationDate: '2024-05-15',
      lastUpdatedDate: '2024-05-15',
      lifecycleStatus: 'under_validation',
      approvalAuthority: 'WHO Expert Committee & National DGHS Review',
      approvedForBangladesh: false,
      approvedAt: null,
      reviewDate: '2026-11-30T00:00:00Z',
      knownLimitations: 'Broad public health syndromic triage; lacks specific thoracic oncology diagnostic specificity.',
      isActive: true,
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2024-05-15T00:00:00Z',
    }
    this.protocols.set(whoLmic.id, whoLmic)

    this.protocolVersions.set(whoLmic.id, [
      {
        id: 'ver-who-lmic-2024-v1',
        protocolId: whoLmic.id,
        versionTag: '2024.1-global',
        specificationReference: 'WHO LMIC Operational Guidance (2024)',
        criteriaDefinitions: [
          {
            key: 'who_emergency_respiratory_failure',
            label: 'Emergency Severe Respiratory Distress or Stridor',
            category: 'emergency',
            ruleDescription: 'Acute severe dyspnea, cyanosis, or stridor.',
            requiredConditionExpression: 'dyspnea.severity == life_threatening OR stridor == present',
            isRedFlag: true,
          },
          {
            key: 'who_urgent_chronic_cough_hemoptysis',
            label: 'Chronic Cough with Hemoptysis or Severe Wasting',
            category: 'urgent',
            ruleDescription: 'Cough lasting >3 weeks with hemoptysis or severe unexplained weight loss.',
            requiredConditionExpression: 'cough.duration >= 3 AND (hemoptysis == present OR weight_loss == present)',
            isRedFlag: true,
          },
        ],
        lifecycleStatus: 'under_validation',
        effectiveDate: '2024-05-15T00:00:00Z',
        changelog: 'Initial WHO syndromic respiratory triage version for resource-constrained primary clinics.',
        createdAt: '2026-01-15T00:00:00Z',
      },
    ])
  }

  static getAllProtocols(): SymptomTriageProtocolItem[] {
    return Array.from(this.protocols.values())
  }

  static getProtocolById(id: string): SymptomTriageProtocolItem | null {
    return this.protocols.get(id) || null
  }

  static getProtocolByCode(code: string): SymptomTriageProtocolItem | null {
    for (const proto of this.protocols.values()) {
      if (proto.protocolCode.toUpperCase() === code.toUpperCase()) {
        return proto
      }
    }
    return null
  }

  static getLatestVersion(protocolId: string): SymptomTriageProtocolVersionItem | null {
    const versions = this.protocolVersions.get(protocolId)
    if (!versions || versions.length === 0) return null
    return versions[versions.length - 1]
  }

  static getAllVersions(protocolId: string): SymptomTriageProtocolVersionItem[] {
    return this.protocolVersions.get(protocolId) || []
  }
}
