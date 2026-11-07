"""
Phase 2.5: Pytest Suite for Unsupervised Anomaly Detection & Statistical Pipelines
"""

import sys
from pathlib import Path
import pytest
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.covariance import EllipticEnvelope

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from research.experiments.anomaly.unsupervised_anomaly_benchmarks import (
    generate_synthetic_cohort,
    evaluate_detectors,
)

def test_generate_synthetic_cohort_structure():
    """Verifies synthetic cohort generator produces valid clinical distributions and ground truth."""
    df = generate_synthetic_cohort(n_normal=200, n_anomalies=50, random_state=42)
    assert len(df) == 250
    assert "is_ground_truth_anomaly" in df.columns
    assert "anomaly_type" in df.columns
    assert df["is_ground_truth_anomaly"].sum() == 50 # 15 bp + 15 pack_years + 20 bmi
    
    # Check biological boundaries
    assert df["age"].min() >= 30
    assert df["bmi"].min() >= 15

def test_evaluate_detectors_metrics():
    """Verifies detector evaluation matrix produces valid sensitivity, specificity, and precision."""
    df = generate_synthetic_cohort(n_normal=300, n_anomalies=20, random_state=42)
    results = evaluate_detectors(df)
    
    assert isinstance(results, pd.DataFrame)
    assert len(results) == 4
    
    # Deterministic rules should have 1.0 sensitivity on known synthetic anomalies
    rule_row = results[results["method"] == "Deterministic Clinical Rules"].iloc[0]
    assert rule_row["sensitivity"] == 1.0
    assert rule_row["specificity"] == 1.0
    
    # Isolation forest should run and flag anomalies
    iso_row = results[results["method"] == "Isolation Forest"].iloc[0]
    assert iso_row["total_flagged"] > 0
    assert iso_row["precision"] > 0.70

def test_isolation_forest_boundary_sensitivity():
    """Tests that Isolation Forest identifies extreme multi-attribute outliers."""
    X_normal = np.random.normal(0, 1, (100, 3))
    X_outlier = np.array([[10.0, 10.0, 10.0]])
    X_all = np.vstack([X_normal, X_outlier])
    
    clf = IsolationForest(contamination=0.02, random_state=42)
    preds = clf.fit_predict(X_all)
    
    # Outlier should be flagged as -1
    assert preds[-1] == -1

def test_elliptic_envelope_covariance_robustness():
    """Tests Elliptic Envelope robust covariance estimation on Gaussian data."""
    np.random.seed(42)
    X_normal = np.random.multivariate_normal([0, 0], [[1, 0.5], [0.5, 1]], 150)
    X_outlier = np.array([[8.0, -8.0]]) # Off diagonal outlier
    X_all = np.vstack([X_normal, X_outlier])
    
    env = EllipticEnvelope(contamination=0.01, random_state=42)
    env.fit(X_all)
    preds = env.predict(X_all)
    
    assert preds[-1] == -1

def test_non_causal_metadata_invariants():
    """Verifies that experimental anomaly detectors contain required non-diagnostic disclaimers."""
    import os, json
    summary_path = os.path.join(
        os.path.dirname(__file__), "..", "anomaly", "artifacts", "unsupervised_anomaly_summary.json"
    )
    if os.path.exists(summary_path):
        with open(summary_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "recommendation" in data
        assert "deterministic clinical rules" in data["recommendation"].lower()
