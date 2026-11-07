"""
Phase 2.3: Master Clinical Validation Execution Script

Orchestrates the entire Phase 2.3 validation protocol:
1. Executes Bangladesh Evidence Gap Assessment (`bangladesh_gap_assessment.py`)
2. Executes EXP-01 COPD Independent Validation (`validate_copd_model.py`)
3. Executes EXP-02 Screening Validation (`validate_screening_model.py`)
4. Executes Direct Cancer Rejection Record (`validate_direct_cancer_rejection.py`)
"""

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from research.experiments.validation.bangladesh_gap_assessment import build_bangladesh_evidence_gap_dossier
from research.experiments.validation.validate_direct_cancer_rejection import main as run_direct_rejection
from research.experiments.validation.validate_screening_model import main as run_screening_val
from research.experiments.validation.validate_copd_model import main as run_copd_val


def main():
    print("=" * 80)
    print("PHASE 2.3: CLINICAL MODEL VALIDATION MASTER SUITE")
    print("=" * 80)

    print("\n>>> STEP 1: AUDITING BANGLADESH EXTERNAL GENERALIZABILITY & EVIDENCE GAPS")
    build_bangladesh_evidence_gap_dossier()

    print("\n>>> STEP 2: AUDITING DIRECT SUPERVISED LUNG CANCER DIAGNOSIS TARGET")
    run_direct_rejection()

    print("\n>>> STEP 3: INDEPENDENT VALIDATION OF EXP-01 COPD PHENOTYPE MODEL")
    run_copd_val()

    print("\n>>> STEP 4: CLINICAL VALIDATION OF EXP-02 SCREENING NON-ADHERENCE MODEL")
    run_screening_val()

    print("\n" + "=" * 80)
    print("PHASE 2.3 VALIDATION SUITE COMPLETED SUCCESSFULLY.")
    print("=" * 80)


if __name__ == "__main__":
    main()

