"""
Phase 2.3: Scientific Audit and Formal Rejection Record for Direct Supervised Lung Cancer Diagnosis

Produces the formal clinical governance record documenting the scientific rejection
of attempting direct supervised lung cancer diagnosis on cross-sectional survey data (BRFSS).
"""

import json
from pathlib import Path

EVIDENCE_DIR = Path(__file__).resolve().parent / "evidence"
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)


def main():
    record = {
        "id": "ai-val-direct-cancer",
        "model_id": "direct-lung-cancer-diagnosis",
        "model_name": "Direct Supervised Lung Cancer Diagnosis Model Target",
        "model_version": "0.0.0-prohibited",
        "lifecycle_tier": "prohibited",
        "original_experiment_ref": "UNSUPPORTED_DIRECT_LUNG_CANCER_LABEL",
        "development_dataset_ref": "CDC BRFSS 2022 (Rejected Target)",
        "validation_dataset_profile": {
            "id": "ds-rejected-target",
            "name": "Rejected Target Profile",
            "source": "CDC BRFSS 2022",
            "jurisdiction": "United States",
            "collection_methodology": "Self-reported outpatient survey",
            "sample_size": 0,
            "outcome_variable": "CNCRTYP1 == 19 (Historical lung cancer diagnosis among surviving respondents)",
            "population_characteristics": "Outpatient survivors (<0.10% prevalence)",
            "is_independent": False,
            "is_bangladesh_specific": False,
            "is_authorized": False,
            "limitations": [
                "Extreme survivorship bias (lung cancer 5-year survival < 25%)",
                "Immortal time bias",
                "Absence of core incidence label",
                "Lack of tissue histopathology confirmation"
            ]
        },
        "validation_protocol": "PROT-VAL-REJECTED-2026.0: Methodological safety audit.",
        "validation_date": "2026-11-06T09:40:00.000Z",
        "validation_status": "rejected",
        "bangladesh_generalizability": {
            "evaluated": True,
            "dataset_available": False,
            "evidence_gap_summary": "Direct supervised diagnosis from self-reported health survey data is methodologically invalid and prohibited across all jurisdictions.",
            "distribution_shift_identified": True,
            "missing_variables": [
                "Histopathologically confirmed tissue biopsy",
                "Diagnostic thoracic CT / PET-CT imaging",
                "TNM stage classification"
            ],
            "prospective_requirements": "Real-world clinical oncologic diagnosis requires tissue biopsy and histological grading, never retrospective questionnaire inference."
        },
        "cab_review_decision": {
            "decision": "rejected",
            "reviewed_at": "2026-11-06T10:10:00.000Z",
            "reviewed_by_member_id": "cab-mem-001",
            "reviewed_by_member_name": "Prof. Dr. Farhana Ahmed (CAB Chair)",
            "conditions_or_restrictions": [
                "Permanently prohibited. Any attempt to implement or deploy automated direct lung cancer diagnosis violates clinical safety invariants."
            ],
            "clinical_rationale": "Direct supervised lung cancer diagnosis without histological confirmation is methodologically invalid. In BRFSS, living respondents reporting prior lung cancer represent an extreme survivor cohort (<0.10%), not active undiagnosed malignancy. Machine learning models trained on such targets learn outpatient survivorship correlates rather than oncologic etiology."
        },
        "operational_activation": {
            "is_activated": False,
            "activated_at": None,
            "activated_by": None,
            "activation_blocked_reason": "Methodological violation: Direct supervised lung cancer prediction without active incidence biopsy confirmation is prohibited."
        },
        "safety_invariants_enforced": True
    }

    record_path = EVIDENCE_DIR / "direct_lung_cancer_rejection_record.json"
    with open(record_path, "w", encoding="utf-8") as f:
        json.dump(record, f, indent=2)

    print(f"[SUCCESS] Exported Direct Lung Cancer Rejection Dossier to {record_path}")


if __name__ == "__main__":
    main()

