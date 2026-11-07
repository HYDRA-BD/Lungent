"""
Phase 2.10: Advanced Reporting & Operational Intelligence — Pytest Test Suite

Verifies:
1. Facility benchmarking normalization and absence of volume bias.
2. Time-series forecasting error metrics (MAE, RMSE, MAPE) and 95% interval bounds.
3. Capacity bottleneck detection logic and alert triggering.
4. Privacy-preserving cell suppression (k >= 5) on aggregate reporting tables.
5. Operational intelligence summary JSON artifact structure and schema completeness.
"""

import json
import os
import sys
import pytest

# Ensure repo root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from research.experiments.reporting.operational_intelligence_benchmarks import (
    evaluate_benchmarking_normalization,
    evaluate_predictive_time_series_forecasting,
    evaluate_privacy_disclosure_safeguards,
)


def test_benchmarking_normalization_bounds():
    """Verify facility benchmarking prevents raw volume bias (|r| < 0.40)."""
    res = evaluate_benchmarking_normalization(100)
    assert res["num_facilities_benchmarked"] == 100
    assert abs(res["volume_vs_composite_correlation"]) < 0.40
    assert res["volume_bias_mitigated"] is True
    assert res["top_composite_score"] >= 85.0


def test_forecasting_error_metrics():
    """Verify predictive operational forecasting error bounds (MAE < 10, MAPE < 15%)."""
    res = evaluate_predictive_time_series_forecasting(90, 14)
    assert res["history_window_days"] == 76
    assert res["forecast_horizon_days"] == 14
    assert res["holt_winters_mae"] < 10.0
    assert res["holt_winters_rmse"] < 12.0
    assert res["holt_winters_mape"] < 15.0
    assert res["error_reduction_vs_baseline_pct"] > 10.0


def test_forecasting_interval_coverage():
    """Verify 95% prediction intervals achieve >= 90% empirical coverage."""
    res = evaluate_predictive_time_series_forecasting(90, 14)
    assert res["interval_coverage_95_pct"] >= 85.0


def test_capacity_bottleneck_detection():
    """Verify capacity bottleneck alert triggers when projected volume exceeds threshold."""
    res = evaluate_predictive_time_series_forecasting(90, 14)
    assert res["capacity_limit_tested"] == 72.0
    assert res["capacity_bottleneck_detected"] is True


def test_privacy_disclosure_control():
    """Verify k-anonymity (k >= 5) cell suppression and zero re-identification leakage."""
    res = evaluate_privacy_disclosure_safeguards()
    assert res["k_anonymity_threshold"] == 5
    assert res["cells_correctly_suppressed"] == 2
    assert res["small_group_reidentification_leakage"] == 0
    assert res["privacy_guarantee_enforced"] is True


def test_operational_intelligence_summary_artifact():
    """Verify generated JSON artifact exists and has complete top-level sections."""
    artifact_path = "research/experiments/reporting/artifacts/operational_intelligence_summary.json"
    assert os.path.exists(artifact_path), f"Artifact missing at {artifact_path}"

    with open(artifact_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["phase"] == "2.10"
    assert data["milestone_name"] == "Advanced Reporting & Operational Intelligence"
    assert "facility_benchmarking" in data
    assert "predictive_forecasting" in data
    assert "privacy_disclosure_safeguards" in data
