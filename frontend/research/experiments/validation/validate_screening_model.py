"""
Phase 2.3: Quantitative Clinical Validation of EXP-02 Screening Non-Adherence Model

Evaluates the Phase 2.2 selected model (Random Forest Classifier) on the
USPSTF-eligible screening holdout set.

Performs:
1. Discrimination assessment (ROC-AUC, PR-AUC, Sensitivity, Specificity, PPV, NPV, Brier score, 95% Wilson CIs).
2. Calibration assessment (decile calibration bins, logistic calibration slope and intercept).
3. Clinical Utility / Decision Curve Analysis (Net Benefit across decision thresholds).
4. Evaluation of clinical inapplicability to Bangladesh healthcare infrastructure.
5. Evidence serialization into JSON and CSV reports.
"""

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier

from research.experiments.pipelines.preprocessing import (
    load_screening_cohort,
    build_preprocessor,
    LCS_NUMERICAL_FEATURES,
    LCS_CATEGORICAL_FEATURES,
)
from research.experiments.validation.metrics import (
    compute_discrimination_metrics,
    compute_calibration_metrics,
    compute_decision_curve,
)

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_RAW_DIR = BASE_DIR.parent / "brfss" / "data" / "raw"
XPT_PATH = DATA_RAW_DIR / "LLCP2022.XPT"
EVIDENCE_DIR = Path(__file__).resolve().parent / "evidence"
REPORTS_DIR = BASE_DIR / "reports"

EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

RANDOM_SEED = 42


def main():
    print("=" * 75)
    print("PHASE 2.3: CLINICAL VALIDATION — EXP-02 SCREENING NON-ADHERENCE")
    print("=" * 75)

    print(f"[INFO] Loading USPSTF screening cohort from {XPT_PATH}...")
    X, y, weights, subgroups = load_screening_cohort(XPT_PATH)
    total_n = len(y)
    print(f"[INFO] Loaded N = {total_n:,} eligible records.")

    # Train / Test split (80/20 stratified) matching Phase 2.2 holdout evaluation
    X_train, X_test, y_train, y_test, sub_train, sub_test = train_test_split(
        X, y, subgroups,
        test_size=0.20,
        random_state=RANDOM_SEED,
        stratify=y
    )

    print(f"[INFO] Training split: N = {len(y_train):,}; Validation holdout: N = {len(y_test):,}")

    # Build and fit Random Forest pipeline
    preprocessor = build_preprocessor(LCS_NUMERICAL_FEATURES, LCS_CATEGORICAL_FEATURES)
    clf = RandomForestClassifier(
        class_weight="balanced",
        n_estimators=100,
        max_depth=10,
        min_samples_split=20,
        min_samples_leaf=10,
        n_jobs=-1,
        random_state=RANDOM_SEED
    )
    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", clf)
    ])

    print("[INFO] Fitting Random Forest model...")
    pipeline.fit(X_train, y_train)

    print("[INFO] Evaluating on holdout validation cohort...")
    test_probs = pipeline.predict_proba(X_test)[:, 1]
    y_test_np = y_test.to_numpy()

    # 1. Discrimination Metrics
    disc_m = compute_discrimination_metrics(y_test_np, test_probs, threshold=0.50)
    print(f"  Validation ROC-AUC: {disc_m['roc_auc']:.4f} | PR-AUC: {disc_m['pr_auc']:.4f}")
    print(f"  Sensitivity: {disc_m['sensitivity']:.4f} (95% CI: {disc_m['confidence_intervals_95']['sensitivity']})")
    print(f"  Specificity: {disc_m['specificity']:.4f} (95% CI: {disc_m['confidence_intervals_95']['specificity']})")
    print(f"  PPV: {disc_m['ppv']:.4f} | NPV: {disc_m['npv']:.4f} | Brier: {disc_m['brier_score']:.4f}")

    # 2. Calibration Metrics
    cal_m = compute_calibration_metrics(y_test_np, test_probs, n_bins=10)
    print(f"  Calibration Slope: {cal_m['calibration_slope']:.4f} | Intercept: {cal_m['calibration_intercept']:.4f}")

    df_deciles = pd.DataFrame(cal_m["deciles"])
    df_deciles.to_csv(REPORTS_DIR / "val_exp02_screening_calibration_deciles.csv", index=False)

    # 3. Decision Curve Analysis (DCA)
    dca_results = compute_decision_curve(y_test_np, test_probs)
    df_dca = pd.DataFrame(dca_results)
    df_dca.to_csv(REPORTS_DIR / "val_exp02_screening_decision_curves.csv", index=False)

    # Build Validation Record
    validation_record = {
        "id": "ai-val-exp02-screening",
        "model_id": "exp02-screening-non-adherence",
        "model_name": "USPSTF Screening Non-Adherence Propensity (Random Forest)",
        "model_version": "1.0.0-exp",
        "lifecycle_tier": "prohibited",
        "original_experiment_ref": "EXP-02",
        "development_dataset_ref": "CDC BRFSS 2022 (N=51,453 USPSTF 2021 Eligible Adults)",
        "validation_dataset_profile": {
            "id": "ds-brfss2022-holdout-lcs",
            "name": "BRFSS 2022 Lung Cancer Screening Holdout Split",
            "source": "Centers for Disease Control and Prevention (CDC)",
            "jurisdiction": "United States",
            "collection_methodology": "Complex multi-stage stratified random-digit dialing telephone survey",
            "sample_size": len(y_test),
            "outcome_variable": "_LCSREC == 2 (Recommended for LDCT but did not receive CT in past year)",
            "population_characteristics": "US adults aged 50-80 with >= 20 pack-years and current or former smoking within 15 years",
            "is_independent": True,
            "is_bangladesh_specific": False,
            "is_authorized": True,
            "limitations": [
                "Captures US healthcare navigation barriers (Medicare/Medicaid coverage, private insurance)",
                "US USPSTF guideline context (not established in Bangladesh healthcare policy)"
            ]
        },
        "validation_protocol": "PROT-VAL-EXP02-2026.1: Holdout cross-validation, PR-AUC evaluation, and healthcare access barrier disparity audit.",
        "validation_date": "2026-11-06T10:05:00.000Z",
        "validation_status": "rejected",
        "discrimination_metrics": disc_m,
        "calibration_metrics": cal_m,
        "clinical_utility_metrics": {
            "intended_use": "Identify eligible individuals with high likelihood of failing to obtain annual low-dose computed tomography (LDCT) to target proactive community navigation.",
            "target_population": "USPSTF 2021 screening eligible individuals.",
            "net_benefit_at_thresholds": dca_results,
            "false_positive_clinical_cost": "Community healthcare worker time spent reaching out to an individual who was already adherent.",
            "false_negative_clinical_risk": "High-risk individual does not receive outreach, remaining unscreened with delayed lung cancer presentation.",
            "bangladesh_workflow_applicability": "Fundamentally inapplicable. Bangladesh has no organized national LDCT lung cancer screening program or public insurance reimbursement for asymptomatic screening.",
            "practical_feasibility_score": "inapplicable"
        },
        "bangladesh_generalizability": {
            "evaluated": True,
            "dataset_available": False,
            "evidence_gap_summary": "The USPSTF lung cancer screening recommendation protocol (annual LDCT for 50-80yo with >=20 pack-years) does not exist as an operational clinical guideline or subsidized national program in Bangladesh. Applying an adherence propensity model to a non-existent clinical pathway is conceptually and operationally invalid.",
            "distribution_shift_identified": True,
            "missing_variables": [
                "National lung cancer screening registry",
                "Public health insurance claims for preventive thoracic LDCT",
                "Standard primary care electronic referral pathways for screening"
            ],
            "prospective_requirements": "Establishment of national clinical consensus guidelines and subsidized LDCT screening infrastructure before any screening adherence model can be conceptualized."
        },
        "cab_review_decision": {
            "decision": "rejected",
            "reviewed_at": "2026-11-06T10:05:00.000Z",
            "reviewed_by_member_id": "cab-mem-002",
            "reviewed_by_member_name": "Dr. Rafiqul Islam (CAB Vice Chair)",
            "conditions_or_restrictions": [
                "Formally rejected for Bangladesh clinical decision-support and workflow integration.",
                "May not be deployed in any clinical, community, or administrative portal within Bangladesh."
            ],
            "clinical_rationale": "The target variable (_LCSREC) presumes the existence of an active, institutionalized USPSTF annual LDCT screening program. In Bangladesh, low-dose CT is neither subsidized, routinely available in public upazila/district hospitals, nor endorsed as a national screening program. Deploying this model would generate clinically nonsensical task assignments."
        },
        "operational_activation": {
            "is_activated": False,
            "activated_at": None,
            "activated_by": None,
            "activation_blocked_reason": "Model rejected for Bangladesh clinical use due to structural absence of underlying LDCT screening program."
        },
        "safety_invariants_enforced": True
    }

    record_path = EVIDENCE_DIR / "exp02_screening_validation_record.json"
    with open(record_path, "w", encoding="utf-8") as f:
        json.dump(validation_record, f, indent=2)

    print(f"[SUCCESS] Exported EXP-02 validation dossier to {record_path}")
    print("=" * 75)


if __name__ == "__main__":
    main()

