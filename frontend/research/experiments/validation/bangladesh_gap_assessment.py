"""
Phase 2.3: Bangladesh Clinical External Generalizability & Evidence Gap Assessment

Systematically audits the epidemiological, clinical, and structural differences between
the US CDC BRFSS development population and Bangladesh clinical reality.
Produces a formal Evidence Gap Dossier for the Clinical Advisory Board.
"""

import json
from pathlib import Path
from typing import Dict, Any, List

EVIDENCE_DIR = Path(__file__).resolve().parent / "evidence"
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)


def build_bangladesh_evidence_gap_dossier() -> Dict[str, Any]:
    """
    Constructs a comprehensive, evidence-based dossier analyzing the generalizability
    of US BRFSS models to Bangladesh clinical practice.
    """
    dimensions: List[Dict[str, Any]] = [
        {
            "dimension": "Tobacco Consumption Typology",
            "us_brfss_context": "Predominantly manufactured commercial filtered cigarettes. Standardized at 20 cigarettes/pack, allowing reliable continuous pack-year calculations.",
            "bangladesh_context": "Extensive consumption of bidi (unfiltered hand-rolled tobacco in tendu leaves) with significantly higher tar (23-38 mg) and carbon monoxide yields per stick. Widespread use of smokeless tobacco (zarda, gul, sada pata, betel quid/paan) used by ~20.6M adults (GATS 2017).",
            "impact_on_model": "Critical distribution shift. Pack-year formula based on 20 commercial cigarettes/day substantially underestimates carcinogenic tar exposure and particulate load from bidis.",
            "transferability_status": "Severe Mismatch"
        },
        {
            "dimension": "Indoor Biomass Combustion (Chula Exposure)",
            "us_brfss_context": "Not measured in BRFSS survey; virtually negligible in civilian US households.",
            "bangladesh_context": "Over 70% of rural and peri-urban households use traditional unvented clay cooking stoves (chula) burning wood, cow dung, and agricultural biomass. Women experience intense daily PM2.5 and polycyclic aromatic hydrocarbon (PAH) inhalation for decades.",
            "impact_on_model": "Major omitted variable bias. COPD and lung cancer risk in non-smoking Bangladeshi women is heavily driven by biomass smoke, an etiology completely absent from US models.",
            "transferability_status": "Completely Omitted"
        },
        {
            "dimension": "Ambient Particulate Air Pollution",
            "us_brfss_context": "US EPA NAAQS annual standard 9.0-12.0 ug/m3. Mean national ambient PM2.5 ~8-10 ug/m3.",
            "bangladesh_context": "Greater Dhaka and Indo-Gangetic plain average annual PM2.5 > 75-100 ug/m3, frequently exceeding 250-400 ug/m3 in winter dry seasons. Represents chronic severe respiratory baseline insult.",
            "impact_on_model": "Baseline population hazard for respiratory obstruction is significantly elevated independent of smoking history.",
            "transferability_status": "Extreme Environmental Shift"
        },
        {
            "dimension": "Respiratory Disease Phenotyping & Spirometry",
            "us_brfss_context": "Self-reported physician diagnosis of COPD/emphysema/bronchitis. Diagnostic spirometry is widely accessible across outpatient pulmonology.",
            "bangladesh_context": "Diagnostic spirometry is scarce outside tertiary centers (e.g., NIDCH, BSMMU, DMCH). High prevalence of post-tuberculosis bronchiectasis and chronic untreated childhood asthma leads to frequent clinical misclassification without pre/post-bronchodilator spirometry.",
            "impact_on_model": "High risk of false-positive COPD predictions on patients whose obstructive deficit is post-tubercular rather than tobacco-induced emphysema.",
            "transferability_status": "Diagnostic Misalignment"
        },
        {
            "dimension": "Lung Cancer Screening Program Infrastructure",
            "us_brfss_context": "Established USPSTF Grade B recommendation for annual LDCT (ages 50-80, >=20 pack-years). Fully reimbursed under Medicare Part B and ACA private insurance.",
            "bangladesh_context": "No organized national lung cancer screening program exists in Bangladesh. Low-dose CT scanners are concentrated in private diagnostic centers and tertiary hospitals. Screening is entirely out-of-pocket (4,000-8,000 BDT), equivalent to 2-4 weeks of average rural household income.",
            "impact_on_model": "EXP-02 screening non-adherence model assumes the presence of a viable screening recommendation pathway. Applying it in Bangladesh where no subsidized screening exists produces clinically nonsensical task alerts.",
            "transferability_status": "Operationally Inapplicable"
        },
        {
            "dimension": "Healthcare Seeking & Diagnostic Presentation",
            "us_brfss_context": "Annual preventive checkups common (>75% report checkup in past year). Early stage asymptomatic detection via incidental nodules or screening.",
            "bangladesh_context": "Symptom-driven presentation. Over 75% of thoracic oncology patients at NICRH present at Stage IIIb or Stage IV with severe constitutional symptoms (hemoptysis, malignant pleural effusion, cachexia). Out-of-pocket health expenditure exceeds 68%.",
            "impact_on_model": "Pre-screening algorithms designed for early detection in primary care fail to address late-stage acute presentation and urgent referral triage realities.",
            "transferability_status": "Major Clinical Divergence"
        }
    ]

    available_bd_datasets = [
        {
            "dataset_name": "Global Adult Tobacco Survey (GATS) Bangladesh 2017",
            "custodian": "BBS / WHO / CDC",
            "sample_size": "12,783 households",
            "suitability_for_model_validation": "UNSUITABLE for individual-level clinical validation. Survey captures aggregate prevalence of smoking and smokeless tobacco, but lacks spirometric lung function, individual continuous pack-years, or clinical oncology outcomes."
        },
        {
            "dataset_name": "WHO STEPS Non-Communicable Disease Risk Factor Survey Bangladesh 2018",
            "custodian": "National Institute of Preventive and Social Medicine (NIPSOM) / DGHS",
            "sample_size": "8,185 adults",
            "suitability_for_model_validation": "UNSUITABLE for LDCT or thoracic oncology validation. Measures blood pressure, fasting glucose, and general behavioral risk, but lacks continuous pack-year history, thoracic CT imaging, or lung cancer incidence."
        },
        {
            "dataset_name": "National Institute of Cancer Research & Hospital (NICRH) Cancer Registry",
            "custodian": "NICRH, Mohakhali, Dhaka",
            "sample_size": "Hospital-based registry (~25,000 new cancer cases/year)",
            "suitability_for_model_validation": "UNSUITABLE for screening or general population risk prediction. Contains only confirmed cancer cases (no non-cancer controls, no healthy screening cohort, severe referral hospital selection bias)."
        }
    ]

    prospective_validation_protocol = {
        "protocol_name": "PROT-BD-VAL-01: Prospective Multicenter Clinical Validation of Thoracic Risk Phenotyping in Bangladesh",
        "partner_institutions": [
            "National Institute of Diseases of the Chest and Hospital (NIDCH), Dhaka",
            "National Institute of Cancer Research & Hospital (NICRH), Dhaka",
            "Bangabandhu Sheikh Mujib Medical University (BSMMU), Department of Pulmonology"
        ],
        "target_cohort": "N = 1,500 prospective adult patients presenting to outpatient respiratory and oncology clinics",
        "mandatory_datapoints": [
            "Daily bidi stick consumption and lifetime bidi duration",
            "Commercial filtered cigarette stick consumption and pack-years",
            "Indoor biomass cooking stove exposure (years and daily hours)",
            "Occupational dust/chemical exposure (shipbreaking, textile, tannery, construction)",
            "Pre- and post-bronchodilator spirometry (FEV1, FVC, FEV1/FVC)",
            "Diagnostic thoracic CT scan reports and histopathological biopsy confirmations where indicated",
            "Socioeconomic indicators and out-of-pocket catastrophic healthcare expenditure metrics"
        ],
        "governance_mandate": "Approval for operational clinical deployment within Lungent in Bangladesh is strictly withheld until PROT-BD-VAL-01 has been executed, analyzed, and approved by the CAB."
    }

    dossier = {
        "dossier_id": "DOSSIER-BD-VAL-GAP-2026.1",
        "title": "Clinical and Epidemiological Evidence Gap Dossier: Non-Transferability of US BRFSS Models to Bangladesh",
        "evaluating_authority": "National Clinical Advisory Board for Thoracic Oncology & Decision Support",
        "status": "VALIDATION_GAP_CONFIRMED",
        "primary_verdict": "Direct transfer of US BRFSS-trained AI/ML models to Bangladesh clinical decision support is scientifically invalid and clinically unsafe without prospective local validation.",
        "comparative_dimensions": dimensions,
        "available_datasets_audited": available_bd_datasets,
        "prospective_validation_protocol": prospective_validation_protocol,
        "governance_recommendation": "Maintain complete operational deactivation of EXP-01 and EXP-02 within Bangladesh clinical portals. Classify EXP-01 as 'REQUIRES_ADDITIONAL_EVIDENCE' (research-only sandbox) and EXP-02 as 'REJECTED_FOR_BANGLADESH_CLINICAL_USE'."
    }

    # Save to evidence directory
    dossier_path = EVIDENCE_DIR / "bangladesh_evidence_gap_dossier.json"
    with open(dossier_path, "w", encoding="utf-8") as f:
        json.dump(dossier, f, indent=2)

    return dossier


if __name__ == "__main__":
    dossier = build_bangladesh_evidence_gap_dossier()
    print(f"[SUCCESS] Generated Bangladesh Evidence Gap Dossier with {len(dossier['comparative_dimensions'])} audited dimensions.")

