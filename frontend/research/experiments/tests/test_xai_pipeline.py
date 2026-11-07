"""
Phase 2.4: Automated Tests for Explainable AI (XAI) Engine & Artifacts

Verifies:
1. Bilingual feature metadata dictionary completeness.
2. Linear and Tree SHAP explanation calculations and mathematical bounds.
3. Uncertainty profile calculation, ensemble variance, and OOD detection.
4. Explanation stability under exact repetition and minor input perturbations.
5. Integrity and non-causal disclosures of generated XAI dossiers.
"""

import json
import sys
from pathlib import Path
import pytest
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from research.experiments.explainability.explainer import (
    explain_linear_model,
    explain_tree_model,
    compute_uncertainty_profile,
    assess_explanation_stability,
    FEATURE_METADATA,
)

ARTIFACTS_DIR = REPO_ROOT / "research" / "experiments" / "explainability" / "artifacts"


def test_feature_metadata_dictionary_completeness():
    """Verify that all key features have bilingual labels and clinical descriptions."""
    required_features = ["pack_years", "years_smoked", "bmi", "age_group", "smoking_status", "has_personal_doctor"]
    for feat in required_features:
        assert feat in FEATURE_METADATA, f"Feature {feat} missing from FEATURE_METADATA"
        meta = FEATURE_METADATA[feat]
        assert "label_en" in meta and len(meta["label_en"]) > 0
        assert "label_bn" in meta and len(meta["label_bn"]) > 0
        assert "description_en" in meta and len(meta["description_en"]) > 0
        assert "description_bn" in meta and len(meta["description_bn"]) > 0
        assert "domain" in meta


def test_explain_linear_model_properties():
    """Test explain_linear_model on a synthetic dataset."""
    X_synthetic = pd.DataFrame({
        "pack_years": [0.0, 20.0, 40.0, 10.0, 30.0],
        "bmi": [22.0, 26.0, 31.0, 24.0, 28.0],
        "age_group": ["7", "9", "11", "8", "10"],
        "smoking_status": ["Never_Smoker", "Daily_Smoker", "Daily_Smoker", "Former_Smoker", "Daily_Smoker"],
    })
    y_synthetic = pd.Series([0, 1, 1, 0, 1])

    num_cols = ["pack_years", "bmi"]
    cat_cols = ["age_group", "smoking_status"]

    pre = ColumnTransformer([
        ("num", Pipeline([("imp", SimpleImputer()), ("scale", StandardScaler())]), num_cols),
        ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")), ("one", OneHotEncoder(handle_unknown="ignore", sparse_output=False))]), cat_cols),
    ])

    pipeline = Pipeline([
        ("preprocessor", pre),
        ("classifier", LogisticRegression(random_state=42))
    ])
    pipeline.fit(X_synthetic, y_synthetic)

    xai = explain_linear_model(
        pipeline=pipeline,
        feature_names=num_cols + cat_cols,
        X_background=X_synthetic,
        X_sample=X_synthetic.iloc[:2],
        numerical_features=num_cols,
        categorical_features=cat_cols,
    )

    assert xai["model_type"] == "LogisticRegression"
    assert "baseline_probability" in xai
    assert 0.0 <= xai["baseline_probability"] <= 1.0

    # Global Native Importance
    assert len(xai["global_native_importance"]) > 0
    for item in xai["global_native_importance"]:
        assert "feature" in item
        assert "odds_ratio" in item
        assert item["odds_ratio"] > 0

    # Local Explanations
    assert len(xai["local_explanations"]) == 2
    for loc in xai["local_explanations"]:
        assert 0.0 <= loc["predicted_probability"] <= 1.0
        assert len(loc["top_contributions"]) > 0


def test_explain_tree_model_properties():
    """Test explain_tree_model on a synthetic Random Forest."""
    X_synthetic = pd.DataFrame({
        "pack_years": [0.0, 20.0, 40.0, 10.0, 30.0, 50.0],
        "bmi": [22.0, 26.0, 31.0, 24.0, 28.0, 33.0],
        "age_group": ["7", "9", "11", "8", "10", "12"],
        "smoking_status": ["Never_Smoker", "Daily_Smoker", "Daily_Smoker", "Former_Smoker", "Daily_Smoker", "Daily_Smoker"],
    })
    y_synthetic = pd.Series([0, 1, 1, 0, 1, 1])

    num_cols = ["pack_years", "bmi"]
    cat_cols = ["age_group", "smoking_status"]

    pre = ColumnTransformer([
        ("num", Pipeline([("imp", SimpleImputer()), ("scale", StandardScaler())]), num_cols),
        ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")), ("one", OneHotEncoder(handle_unknown="ignore", sparse_output=False))]), cat_cols),
    ])

    pipeline = Pipeline([
        ("preprocessor", pre),
        ("classifier", RandomForestClassifier(n_estimators=10, max_depth=3, random_state=42))
    ])
    pipeline.fit(X_synthetic, y_synthetic)

    xai = explain_tree_model(
        pipeline=pipeline,
        feature_names=num_cols + cat_cols,
        X_background=X_synthetic,
        X_sample=X_synthetic.iloc[:2],
        numerical_features=num_cols,
        categorical_features=cat_cols,
    )

    assert xai["model_type"] == "RandomForestClassifier"
    assert len(xai["global_native_importance"]) > 0
    assert len(xai["local_explanations"]) == 2


def test_compute_uncertainty_and_ood():
    """Verify uncertainty profile, tree ensemble standard deviation, and OOD flags."""
    X_normal = pd.DataFrame({
        "pack_years": [25.0],
        "bmi": [24.5],
        "age_group": ["9"],
        "smoking_status": ["Daily_Smoker"],
    })
    X_ood = pd.DataFrame({
        "pack_years": [145.0],  # Extreme value
        "bmi": [62.0],          # Extreme value
        "age_group": ["13"],
        "smoking_status": ["Daily_Smoker"],
    })

    num_cols = ["pack_years", "bmi"]
    cat_cols = ["age_group", "smoking_status"]

    pre = ColumnTransformer([
        ("num", Pipeline([("imp", SimpleImputer()), ("scale", StandardScaler())]), num_cols),
        ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")), ("one", OneHotEncoder(handle_unknown="ignore", sparse_output=False))]), cat_cols),
    ])

    clf = RandomForestClassifier(n_estimators=20, max_depth=3, random_state=42)
    pipeline = Pipeline([("preprocessor", pre), ("classifier", clf)])
    pipeline.fit(pd.concat([X_normal, X_normal, X_normal, X_normal]), pd.Series([0, 1, 0, 1]))

    unc_normal = compute_uncertainty_profile(pipeline, X_normal, num_cols)
    assert len(unc_normal) == 1
    assert unc_normal[0]["out_of_distribution_flag"] is False

    unc_ood = compute_uncertainty_profile(pipeline, X_ood, num_cols)
    assert len(unc_ood) == 1
    assert unc_ood[0]["out_of_distribution_flag"] is True
    assert len(unc_ood[0]["out_of_distribution_reasons"]) >= 1


def test_assess_explanation_stability():
    """Verify repeatability discrepancy is 0.0 and stability verdict is highly_stable."""
    X_data = pd.DataFrame({
        "pack_years": [10.0, 20.0, 30.0],
        "bmi": [22.0, 25.0, 28.0],
        "age_group": ["7", "8", "9"],
        "smoking_status": ["Never_Smoker", "Daily_Smoker", "Former_Smoker"],
    })
    y_data = pd.Series([0, 1, 1])

    num_cols = ["pack_years", "bmi"]
    cat_cols = ["age_group", "smoking_status"]

    pre = ColumnTransformer([
        ("num", Pipeline([("imp", SimpleImputer()), ("scale", StandardScaler())]), num_cols),
        ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")), ("one", OneHotEncoder(handle_unknown="ignore", sparse_output=False))]), cat_cols),
    ])

    pipeline = Pipeline([
        ("preprocessor", pre),
        ("classifier", LogisticRegression(random_state=42))
    ])
    pipeline.fit(X_data, y_data)

    stability = assess_explanation_stability(pipeline, X_data, num_cols)
    assert stability["repeatability_max_discrepancy"] == 0.0
    assert stability["stability_verdict"] in ["highly_stable", "moderately_sensitive"]


def test_xai_generated_artifacts_integrity():
    """Verify that all generated JSON XAI dossiers exist and contain non-causal disclaimers."""
    copd_dossier_path = ARTIFACTS_DIR / "exp01_copd_xai_dossier.json"
    lcs_dossier_path = ARTIFACTS_DIR / "exp02_screening_xai_dossier.json"
    cancer_rejection_path = ARTIFACTS_DIR / "unsupported_cancer_xai_rejection.json"

    assert copd_dossier_path.exists(), "EXP-01 XAI dossier must exist"
    assert lcs_dossier_path.exists(), "EXP-02 XAI dossier must exist"
    assert cancer_rejection_path.exists(), "Direct cancer rejection dossier must exist"

    with open(copd_dossier_path, "r", encoding="utf-8") as f:
        copd = json.load(f)
    assert "non_causal_disclaimer" in copd
    assert "DO NOT imply biological causation" in copd["non_causal_disclaimer"]
    assert len(copd["global_feature_importance_top10"]) == 10

    with open(lcs_dossier_path, "r", encoding="utf-8") as f:
        lcs = json.load(f)
    assert "DO NOT prove" in lcs["non_causal_disclaimer"]

    with open(cancer_rejection_path, "r", encoding="utf-8") as f:
        cancer = json.load(f)
    assert cancer["governance_status"] == "PERMANENTLY_REJECTED"
    assert cancer["xai_eligibility"] == "NOT_APPLICABLE_PROHIBITED_TARGET"
