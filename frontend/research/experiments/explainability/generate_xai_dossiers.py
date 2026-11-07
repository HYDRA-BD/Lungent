"""
Phase 2.4: Master Explainability Dossier Generator

Orchestrates XAI generation across:
1. EXP-01 COPD Phenotype Model (Logistic Regression)
2. EXP-02 Screening Non-Adherence Model (Random Forest)
3. Formal Rejection Record for Direct Cancer Diagnosis Target
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
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from research.experiments.pipelines.preprocessing import (
    load_copd_cohort,
    load_screening_cohort,
    build_preprocessor,
    COPD_NUMERICAL_FEATURES,
    COPD_CATEGORICAL_FEATURES,
    LCS_NUMERICAL_FEATURES,
    LCS_CATEGORICAL_FEATURES,
)
from research.experiments.explainability.explainer import (
    explain_linear_model,
    explain_tree_model,
    compute_uncertainty_profile,
    assess_explanation_stability,
    FEATURE_METADATA,
)

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_RAW_DIR = BASE_DIR.parent / "brfss" / "data" / "raw"
XPT_PATH = DATA_RAW_DIR / "LLCP2022.XPT"
ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
REPORTS_DIR = BASE_DIR / "reports"

ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

RANDOM_SEED = 42


def run_exp01_xai(X_copd: pd.DataFrame, y_copd: pd.Series):
    print("\n" + "=" * 75)
    print(">>> 1. GENERATING XAI DOSSIER FOR EXP-01 (COPD PHENOTYPE)")
    print("=" * 75)

    # Train standard approved Logistic Regression model
    X_train, X_test, y_train, y_test = train_test_split(
        X_copd, y_copd, train_size=96000, random_state=RANDOM_SEED, stratify=y_copd
    )

    preprocessor = build_preprocessor(COPD_NUMERICAL_FEATURES, COPD_CATEGORICAL_FEATURES)
    clf = LogisticRegression(class_weight="balanced", max_iter=1000, C=1.0, solver="lbfgs", random_state=RANDOM_SEED)
    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", clf)
    ])
    pipeline.fit(X_train, y_train)

    # Select representative background sample (N = 300) and 4 local patient profiles
    X_bg = X_train.sample(n=300, random_state=RANDOM_SEED)

    # Clinical illustrative profiles
    profile_indices = [
        X_test[(X_test["smoking_status"] == "Daily_Smoker") & (X_test["pack_years"] > 40) & (y_test == 1)].index[0],
        X_test[(X_test["smoking_status"] == "Former_Smoker") & (X_test["pack_years"] > 20) & (y_test == 1)].index[0],
        X_test[(X_test["smoking_status"] == "Never_Smoker") & (y_test == 0)].index[0],
        X_test[(X_test["asthma_history"] == "Yes") & (y_test == 1)].index[0],
    ]
    profile_labels = [
        "Profile_A_HighRisk_HeavySmoker",
        "Profile_B_ModerateRisk_FormerSmoker",
        "Profile_C_LowRisk_NeverSmoker",
        "Profile_D_AsthmaComorbidity_Smoker",
    ]
    X_samples = X_test.loc[profile_indices].copy()

    # Compute Linear and SHAP Explanations
    xai_results = explain_linear_model(
        pipeline=pipeline,
        feature_names=COPD_NUMERICAL_FEATURES + COPD_CATEGORICAL_FEATURES,
        X_background=X_bg,
        X_sample=X_samples,
        numerical_features=COPD_NUMERICAL_FEATURES,
        categorical_features=COPD_CATEGORICAL_FEATURES,
    )

    # Compute Uncertainty & Confidence Profiles
    uncertainty_results = compute_uncertainty_profile(
        pipeline=pipeline,
        X_sample=X_samples,
        numerical_features=COPD_NUMERICAL_FEATURES,
    )

    # Assess Explanation Stability
    stability_results = assess_explanation_stability(
        pipeline=pipeline,
        X_sample=X_samples,
        numerical_features=COPD_NUMERICAL_FEATURES,
    )

    # Combine Local Explanations with Profiles & Uncertainty
    for idx, label in enumerate(profile_labels):
        xai_results["local_explanations"][idx]["profile_label"] = label
        xai_results["local_explanations"][idx]["uncertainty"] = uncertainty_results[idx]

    # Save Global Feature Importance to CSV
    df_global = pd.DataFrame(xai_results["global_native_importance"])
    df_global.to_csv(REPORTS_DIR / "xai_exp01_copd_global_importance.csv", index=False)

    # Save Local Waterfall Contributions to CSV
    local_rows = []
    for loc in xai_results["local_explanations"]:
        p_name = loc["profile_label"]
        for contrib in loc["top_contributions"]:
            local_rows.append({
                "profile": p_name,
                "predicted_prob": loc["predicted_probability"],
                "feature": contrib["feature"],
                "shap_value": contrib["shap_value"],
                "direction": contrib["direction"],
                "abs_magnitude": contrib["abs_magnitude"],
            })
    df_local = pd.DataFrame(local_rows)
    df_local.to_csv(REPORTS_DIR / "xai_exp01_copd_local_profile_attributions.csv", index=False)

    # Construct Complete JSON Dossier
    dossier = {
        "model_id": "exp01-copd-phenotype",
        "model_name": "COPD Phenotype Predictor (Logistic Regression)",
        "model_version": "1.0.0-exp",
        "governance_status": "EXPERIMENTAL_RESEARCH_ONLY",
        "non_causal_disclaimer": "Feature contributions reflect statistical associations in the US BRFSS cross-sectional survey dataset and DO NOT imply biological causation. Modifying an individual risk factor does not guarantee altered disease trajectory.",
        "baseline_probability": xai_results["baseline_probability"],
        "baseline_log_odds": xai_results["baseline_log_odds"],
        "global_feature_importance_top10": xai_results["global_native_importance"][:10],
        "global_shap_importance_top10": xai_results["global_shap_importance"][:10],
        "local_explanations": xai_results["local_explanations"],
        "stability_audit": stability_results,
        "feature_metadata": {k: v for k, v in FEATURE_METADATA.items() if k in COPD_NUMERICAL_FEATURES or k in COPD_CATEGORICAL_FEATURES},
        "model_limitations": [
            "Trained on US cross-sectional survey data (BRFSS 2022); cannot establish longitudinal incidence.",
            "Lacks bidi smoking and traditional biomass (chula) smoke exposure metrics crucial in Bangladesh.",
            "Sensitivity suppression observed in Asian populations (36.3%) under uncalibrated 0.50 threshold."
        ]
    }

    dossier_path = ARTIFACTS_DIR / "exp01_copd_xai_dossier.json"
    with open(dossier_path, "w", encoding="utf-8") as f:
        json.dump(dossier, f, indent=2)

    print(f"[SUCCESS] Exported EXP-01 XAI Dossier to {dossier_path}")
    return stability_results


def run_exp02_xai(X_lcs: pd.DataFrame, y_lcs: pd.Series):
    print("\n" + "=" * 75)
    print(">>> 2. GENERATING XAI DOSSIER FOR EXP-02 (SCREENING NON-ADHERENCE)")
    print("=" * 75)

    X_train, X_test, y_train, y_test = train_test_split(
        X_lcs, y_lcs, test_size=0.20, random_state=RANDOM_SEED, stratify=y_lcs
    )

    preprocessor = build_preprocessor(LCS_NUMERICAL_FEATURES, LCS_CATEGORICAL_FEATURES)
    clf = RandomForestClassifier(
        class_weight="balanced", n_estimators=100, max_depth=10, min_samples_split=20,
        min_samples_leaf=10, n_jobs=-1, random_state=RANDOM_SEED
    )
    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", clf)
    ])
    pipeline.fit(X_train, y_train)

    X_bg = X_train.sample(n=200, random_state=RANDOM_SEED)

    # Select representative patient profiles
    profile_indices = [
        X_test[(X_test["has_personal_doctor"] == "No") & (X_test["cost_prevented_doctor_visit"] == "Yes_Cost_Barrier")].index[0],
        X_test[(X_test["has_personal_doctor"] == "Yes_Only_One") & (X_test["annual_routine_checkup"] == "Past_Year") & (y_test == 0)].index[0],
        X_test[(X_test["has_health_insurance"] == "Uninsured") & (y_test == 1)].index[0],
        X_test[(X_test["years_quit"] > 10.0) & (y_test == 1)].index[0],
    ]
    profile_labels = [
        "Profile_A_FinancialAndDoctorBarrier_NonAdherent",
        "Profile_B_InsuredRegularCare_Adherent",
        "Profile_C_Uninsured_NonAdherent",
        "Profile_D_FormerSmoker_DelayedCare_NonAdherent",
    ]
    X_samples = X_test.loc[profile_indices].copy()

    # Compute Tree and SHAP Explanations
    xai_results = explain_tree_model(
        pipeline=pipeline,
        feature_names=LCS_NUMERICAL_FEATURES + LCS_CATEGORICAL_FEATURES,
        X_background=X_bg,
        X_sample=X_samples,
        numerical_features=LCS_NUMERICAL_FEATURES,
        categorical_features=LCS_CATEGORICAL_FEATURES,
    )

    # Compute Uncertainty & Confidence Profiles
    uncertainty_results = compute_uncertainty_profile(
        pipeline=pipeline,
        X_sample=X_samples,
        numerical_features=LCS_NUMERICAL_FEATURES,
    )

    # Assess Stability
    stability_results = assess_explanation_stability(
        pipeline=pipeline,
        X_sample=X_samples,
        numerical_features=LCS_NUMERICAL_FEATURES,
    )

    for idx, label in enumerate(profile_labels):
        xai_results["local_explanations"][idx]["profile_label"] = label
        xai_results["local_explanations"][idx]["uncertainty"] = uncertainty_results[idx]

    # Save Global Gini Importance to CSV
    df_global = pd.DataFrame(xai_results["global_native_importance"])
    df_global.to_csv(REPORTS_DIR / "xai_exp02_screening_global_importance.csv", index=False)

    # Save Local Waterfall Contributions to CSV
    local_rows = []
    for loc in xai_results["local_explanations"]:
        p_name = loc["profile_label"]
        for contrib in loc["top_contributions"]:
            local_rows.append({
                "profile": p_name,
                "predicted_prob": loc["predicted_probability"],
                "feature": contrib["feature"],
                "shap_value": contrib["shap_value"],
                "direction": contrib["direction"],
                "abs_magnitude": contrib["abs_magnitude"],
            })
    df_local = pd.DataFrame(local_rows)
    df_local.to_csv(REPORTS_DIR / "xai_exp02_screening_local_profile_attributions.csv", index=False)

    # Construct Complete JSON Dossier
    dossier = {
        "model_id": "exp02-screening-non-adherence",
        "model_name": "USPSTF Screening Non-Adherence Propensity (Random Forest)",
        "model_version": "1.0.0-exp",
        "governance_status": "REJECTED_FOR_BANGLADESH_CLINICAL_USE",
        "non_causal_disclaimer": "Feature attributions describe associations with reported LDCT screening utilization in the US. They DO NOT prove that changing personal doctor access or insurance status causally alters screening uptake in different international healthcare environments.",
        "baseline_probability": xai_results["baseline_probability"],
        "global_feature_importance_top10": xai_results["global_native_importance"][:10],
        "global_shap_importance_top10": xai_results["global_shap_importance"][:10],
        "local_explanations": xai_results["local_explanations"],
        "stability_audit": stability_results,
        "feature_metadata": {k: v for k, v in FEATURE_METADATA.items() if k in LCS_NUMERICAL_FEATURES or k in LCS_CATEGORICAL_FEATURES},
        "model_limitations": [
            "Fundamentally inapplicable to Bangladesh healthcare system due to absence of national LDCT screening program.",
            "Heavy class imbalance (90.4% non-adherent) compresses baseline expectations.",
            "Healthcare access variables reflect US insurance and primary care reimbursement frameworks."
        ]
    }

    dossier_path = ARTIFACTS_DIR / "exp02_screening_xai_dossier.json"
    with open(dossier_path, "w", encoding="utf-8") as f:
        json.dump(dossier, f, indent=2)

    print(f"[SUCCESS] Exported EXP-02 XAI Dossier to {dossier_path}")
    return stability_results


def create_unsupported_rejection_dossier():
    print("\n" + "=" * 75)
    print(">>> 3. DOCUMENTING XAI REJECTION FOR DIRECT LUNG CANCER TARGET")
    print("=" * 75)

    rejection_dossier = {
        "model_id": "direct-lung-cancer-diagnosis",
        "model_name": "Direct Supervised Lung Cancer Diagnosis Target",
        "model_version": "0.0.0-prohibited",
        "governance_status": "PERMANENTLY_REJECTED",
        "xai_eligibility": "NOT_APPLICABLE_PROHIBITED_TARGET",
        "rejection_rationale": "Direct supervised prediction of lung cancer diagnosis was formally rejected in Phase 2.1, Phase 2.2, and Phase 2.3 due to the absence of a core incidence label in BRFSS and extreme survivorship bias in the optional cancer module (<0.10%).",
        "scientific_integrity_rule": "Explainability cannot be computed on a non-existent or methodologically fraudulent model target. Attempting to generate feature attributions for an invalid target would mislead researchers and violate clinical AI safety invariants.",
        "required_clinical_pathway": "Clinical diagnosis of thoracic malignancy requires tissue biopsy histopathology, immunohistochemistry, and radiological TNM staging."
    }

    rejection_path = ARTIFACTS_DIR / "unsupported_cancer_xai_rejection.json"
    with open(rejection_path, "w", encoding="utf-8") as f:
        json.dump(rejection_dossier, f, indent=2)

    print(f"[SUCCESS] Exported Direct Cancer XAI Rejection Record to {rejection_path}")


def main():
    print("=" * 80)
    print("PHASE 2.4: MASTER EXPLAINABILITY (XAI) GENERATION SUITE")
    print("=" * 80)

    print(f"[INFO] Loading COPD cohort from {XPT_PATH}...")
    X_copd, y_copd, _, _ = load_copd_cohort(XPT_PATH)
    stab_copd = run_exp01_xai(X_copd, y_copd)

    print(f"\n[INFO] Loading Screening cohort from {XPT_PATH}...")
    X_lcs, y_lcs, _, _ = load_screening_cohort(XPT_PATH)
    stab_lcs = run_exp02_xai(X_lcs, y_lcs)

    create_unsupported_rejection_dossier()

    # Save consolidated stability and uncertainty audit table
    audit_rows = [
        {"model": "EXP-01_COPD_LogisticRegression", **stab_copd},
        {"model": "EXP-02_Screening_RandomForest", **stab_lcs},
    ]
    df_audit = pd.DataFrame(audit_rows)
    df_audit.to_csv(REPORTS_DIR / "xai_stability_and_uncertainty_audit.csv", index=False)
    print(f"[SUCCESS] Exported consolidated stability audit to {REPORTS_DIR / 'xai_stability_and_uncertainty_audit.csv'}")

    print("\n" + "=" * 80)
    print("PHASE 2.4 XAI GENERATION SUITE COMPLETED SUCCESSFULLY.")
    print("=" * 80)


if __name__ == "__main__":
    main()

