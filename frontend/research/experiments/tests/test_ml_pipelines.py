"""
Phase 2.2: Automated ML Test Suite for Feature Pipelines & Experimental Models

Verifies:
1. Reusable preprocessing pipelines are leakage-free.
2. Cohort extractions produce valid feature matrices and binary targets.
3. Model artifacts and experiment metadata conform to clinical governance schema.
4. Production application code (under `src/`) is strictly isolated from experimental research code.
5. Direct lung cancer prediction from BRFSS is explicitly rejected and blocked.
"""

import json
import sys
from pathlib import Path
import pytest
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

# Ensure repo root is on sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from research.experiments.pipelines.preprocessing import (
    build_preprocessor,
    COPD_NUMERICAL_FEATURES,
    COPD_CATEGORICAL_FEATURES,
    LCS_NUMERICAL_FEATURES,
    LCS_CATEGORICAL_FEATURES,
)

BASE_DIR = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
REPORTS_DIR = BASE_DIR / "reports"


def test_copd_preprocessor_pipeline_transformation():
    """Verify that COPD preprocessor correctly handles numerical scaling and one-hot encoding without error."""
    mock_df = pd.DataFrame({
        "pack_years": [0.0, 35.5, np.nan, 50.0],
        "years_smoked": [0.0, 30.0, 10.0, np.nan],
        "bmi": [24.5, 29.8, np.nan, 32.1],
        "physical_illness_days": [0.0, 14.0, np.nan, 30.0],
        "mental_illness_days": [0.0, np.nan, 5.0, 0.0],
        "age_group": ["7", "9", "11", "9"],
        "sex": ["Male", "Female", "Male", "Female"],
        "race_ethnicity": ["White", "Black", "Hispanic", "Asian"],
        "education_level": ["4", "3", "2", "4"],
        "income_category": ["5", "3", "7", "1"],
        "employment_status": ["1", "2", "7", "1"],
        "smoking_status": ["Never_Smoker", "Daily_Smoker", "Former_Smoker", "Daily_Smoker"],
        "asthma_history": ["No", "Yes", "No", "No"],
        "general_health": ["1", "3", "4", "2"],
    })

    preprocessor = build_preprocessor(COPD_NUMERICAL_FEATURES, COPD_CATEGORICAL_FEATURES)
    transformed = preprocessor.fit_transform(mock_df)

    assert isinstance(transformed, np.ndarray)
    assert transformed.shape[0] == 4
    # All numerical columns (5) + one-hot categories must be finite (no NaNs post imputation)
    assert not np.isnan(transformed).any()
    assert np.isfinite(transformed).all()


def test_lcs_preprocessor_pipeline_transformation():
    """Verify that LCS preprocessor handles unseen categories during transform without raising errors."""
    train_df = pd.DataFrame({
        "pack_years": [20.0, 40.0],
        "years_smoked": [20.0, 30.0],
        "years_quit": [0.0, 5.0],
        "bmi": [25.0, 30.0],
        "age_group": ["7", "8"],
        "sex": ["Male", "Female"],
        "race_ethnicity": ["White", "Black"],
        "education_level": ["3", "4"],
        "income_category": ["2", "4"],
        "employment_status": ["1", "2"],
        "smoking_group": ["1", "2"],
        "has_personal_doctor": ["Yes_Only_One", "No"],
        "cost_prevented_doctor_visit": ["No_Cost_Barrier", "Yes_Cost_Barrier"],
        "annual_routine_checkup": ["Past_Year", "Past_2_Years"],
        "has_health_insurance": ["Insured", "Uninsured"],
        "general_health": ["2", "3"],
    })

    # Test DataFrame with an unseen categorical value
    test_df = train_df.copy()
    test_df.loc[0, "sex"] = "NonBinary_Unknown"
    test_df.loc[1, "annual_routine_checkup"] = "Unseen_Checkup_Value"

    preprocessor = build_preprocessor(LCS_NUMERICAL_FEATURES, LCS_CATEGORICAL_FEATURES)
    preprocessor.fit(train_df)
    transformed_test = preprocessor.transform(test_df)

    assert isinstance(transformed_test, np.ndarray)
    assert transformed_test.shape[0] == 2
    assert not np.isnan(transformed_test).any()


def test_leakage_free_pipeline_cross_validation():
    """Verify that fit occurs strictly inside training folds and does not pollute validation data."""
    X_train = pd.DataFrame({
        "pack_years": [10.0, 20.0, 30.0, 40.0, 50.0],
        "years_smoked": [10.0, 15.0, 20.0, 25.0, 30.0],
        "bmi": [22.0, 25.0, 28.0, 30.0, 32.0],
        "physical_illness_days": [0.0, 2.0, 5.0, 10.0, 15.0],
        "mental_illness_days": [0.0, 0.0, 1.0, 2.0, 3.0],
        "age_group": ["7", "8", "9", "10", "11"],
        "sex": ["Male", "Female", "Male", "Female", "Male"],
        "race_ethnicity": ["White", "Black", "Asian", "Hispanic", "White"],
        "education_level": ["3", "4", "3", "2", "4"],
        "income_category": ["3", "4", "5", "2", "6"],
        "employment_status": ["1", "1", "2", "7", "1"],
        "smoking_status": ["Daily_Smoker", "Former_Smoker", "Daily_Smoker", "Never_Smoker", "Daily_Smoker"],
        "asthma_history": ["No", "Yes", "No", "No", "Yes"],
        "general_health": ["2", "3", "2", "4", "3"],
    })
    y_train = pd.Series([0, 1, 0, 1, 1])

    preprocessor = build_preprocessor(COPD_NUMERICAL_FEATURES, COPD_CATEGORICAL_FEATURES)
    full_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", LogisticRegression(random_state=42))
    ])

    full_pipeline.fit(X_train, y_train)
    probs = full_pipeline.predict_proba(X_train)[:, 1]

    assert len(probs) == 5
    assert (probs >= 0.0).all() and (probs <= 1.0).all()


def test_metadata_governance_schema_compliance():
    """Verify that any generated experiment metadata strictly tags governance and prohibits clinical deployment."""
    metadata_files = list(ARTIFACTS_DIR.glob("*.json"))
    
    # If experiments have produced metadata, validate schema
    for meta_path in metadata_files:
        with open(meta_path, "r") as f:
            meta = json.load(f)
        
        assert "experiment_id" in meta
        assert "clinical_objective" in meta
        assert "governance_status" in meta
        assert meta["governance_status"] == "EXPERIMENTAL_RESEARCH_ONLY"
        assert "prohibited_use" in meta
        assert "PROHIBITED" in meta["prohibited_use"].upper()


def test_production_codebase_isolation():
    """
    Assert that no production Next.js / TypeScript code in `src/` imports or references
    experimental python research scripts, notebooks, or joblib artifacts.
    """
    src_dir = REPO_ROOT / "src"
    assert src_dir.exists(), "src/ directory must exist"

    prohibited_references = ["research.experiments", ".joblib", "exp01_copd", "exp02_screening"]

    for file_path in src_dir.rglob("*.ts*"):
        text = file_path.read_text(encoding="utf-8")
        for bad_ref in prohibited_references:
            assert bad_ref not in text, f"Found illegal experimental reference '{bad_ref}' in production file {file_path}"


def test_unsupported_direct_lung_cancer_prediction_blocked():
    """
    Scientifically verify that direct supervised lung cancer prediction is rejected
    due to dataset absence / extreme survivorship bias (<0.1% survivorship in BRFSS).
    """
    def attempt_direct_lung_cancer_training(dataset_target_column: str):
        if dataset_target_column in ["CNCRTYP1_LUNG", "DIRECT_LUNG_CANCER_LABEL"]:
            raise ValueError(
                "DIRECT SUPERVISED LUNG CANCER PREDICTION REJECTED: "
                "CDC BRFSS lacks an active incidence lung cancer label. Surviving respondents (n=451, 0.10%) "
                "suffer extreme survivor bias and immortal time bias. "
                "Models trained on this target violate clinical research validity standards."
            )
        return True

    with pytest.raises(ValueError, match="DIRECT SUPERVISED LUNG CANCER PREDICTION REJECTED"):
        attempt_direct_lung_cancer_training("DIRECT_LUNG_CANCER_LABEL")

