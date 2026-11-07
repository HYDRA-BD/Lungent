"""
Phase 2.7: Advanced Environmental Intelligence — Pytest Test Suite

Verifies:
1. Spatial interpolation IDW calculation and bounds.
2. Seasonal decomposition dynamics (thermal inversion vs monsoon washout).
3. Historical data completeness integrity (zero-substitution blocking).
4. Benchmark summary JSON artifact structure and non-causal safety flags.
"""

import json
import os
import pytest
from research.experiments.environmental.environmental_modeling_benchmarks import (
    haversine_km,
    evaluate_idw_loocv,
    evaluate_seasonal_variance,
    evaluate_historical_completeness,
)


def test_haversine_distance_accuracy():
    """Verify Haversine formula distance computation between Bangladesh coordinates."""
    # Dhaka to Chattogram
    d = haversine_km(23.8103, 90.4125, 22.3569, 91.7832)
    assert 200.0 < d < 235.0

    # Same location distance is zero
    assert haversine_km(23.8103, 90.4125, 23.8103, 90.4125) == 0.0


def test_idw_loocv_error_bounds():
    """Verify IDW LOOCV errors are bounded and reasonable across reference stations."""
    results, mae, rmse = evaluate_idw_loocv()
    assert len(results) == 9
    assert mae < 35.0  # MAE should be well within regional particulate variation
    assert rmse < 45.0
    for r in results:
        assert r["pred_pm25"] > 0
        assert r["abs_error"] >= 0


def test_seasonal_decomposition_dynamics():
    """Verify winter thermal inversion peak and monsoon washout dynamics."""
    seasonal_data, amplitude = evaluate_seasonal_variance()
    assert len(seasonal_data) == 3
    assert amplitude > 50.0  # Significant winter vs monsoon contrast

    winter = next(s for s in seasonal_data if s["season"] == "winter_dry")
    monsoon = next(s for s in seasonal_data if s["season"] == "monsoon")
    pre_monsoon = next(s for s in seasonal_data if s["season"] == "pre_monsoon")

    assert winter["seasonal_pm25"] > pre_monsoon["seasonal_pm25"] > monsoon["seasonal_pm25"]
    assert winter["thermal_inversion"] is True
    assert monsoon["thermal_inversion"] is False


def test_historical_completeness_and_zero_blocking():
    """Verify historical completeness calculation and zero-substitution invariant."""
    stats = evaluate_historical_completeness()
    assert stats["completeness_ratio"] > 0.90
    assert stats["missing_hours"] > 0
    assert stats["zero_substitution_blocked"] is True


def test_environmental_summary_json_artifact():
    """Verify generated JSON artifact has all required governance and safety metadata."""
    artifact_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "environmental",
        "artifacts",
        "environmental_modeling_summary.json",
    )
    assert os.path.exists(artifact_path), f"Artifact missing at {artifact_path}"

    with open(artifact_path, "r") as f:
        data = json.load(f)

    assert data["milestone"] == "Phase 2.7: Advanced Environmental Intelligence"
    safety = data["clinical_safety_assertions"]
    assert safety["non_causal_disclosure_enforced"] is True
    assert safety["direct_cancer_risk_scoring_blocked"] is True
    assert safety["symptom_triage_override_blocked"] is True
    assert safety["zero_pollution_missingness_assumption_blocked"] is True

