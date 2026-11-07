"""
Phase 2.3: Automated Tests for Quantitative Clinical Validation Metrics & Evidence

Verifies:
1. Wilson score confidence interval bounds and mathematical properties.
2. Discrimination metrics consistency, confusion matrix invariants, and Wilson CIs.
3. Probability calibration decile binning, slope, and intercept.
4. Decision Curve Analysis (DCA) net benefit calculations.
5. Bangladesh evidence gap dossier structure and generalizability assertions.
6. Clinical safety invariants on generated validation evidence dossiers.
"""

import json
import sys
from pathlib import Path
import pytest
import numpy as np

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from research.experiments.validation.metrics import (
    wilson_score_interval,
    compute_discrimination_metrics,
    compute_calibration_metrics,
    compute_decision_curve,
)

EVIDENCE_DIR = REPO_ROOT / "research" / "experiments" / "validation" / "evidence"


def test_wilson_score_interval_bounds():
    """Verify Wilson score confidence interval mathematical properties."""
    low, high = wilson_score_interval(50, 100, 0.95)
    assert 0.0 <= low <= 0.5 <= high <= 1.0
    assert round(low, 2) == 0.40
    assert round(high, 2) == 0.60

    # Boundary case: k = 0
    low_0, high_0 = wilson_score_interval(0, 50, 0.95)
    assert low_0 == 0.0
    assert 0.0 < high_0 < 0.10

    # Boundary case: k = n
    low_n, high_n = wilson_score_interval(50, 50, 0.95)
    assert 0.90 < low_n < 1.0
    assert high_n == 1.0


def test_compute_discrimination_metrics():
    """Verify discrimination calculations, confusion matrix invariants, and CI bounds."""
    y_true = np.array([1, 1, 1, 1, 0, 0, 0, 0, 0, 0])
    y_prob = np.array([0.9, 0.8, 0.7, 0.3, 0.6, 0.4, 0.2, 0.1, 0.05, 0.01])

    m = compute_discrimination_metrics(y_true, y_prob, threshold=0.5)

    cm = m["confusion_matrix"]
    assert cm["true_positives"] + cm["false_positives"] + cm["true_negatives"] + cm["false_negatives"] == 10
    assert cm["true_positives"] == 3
    assert cm["false_negatives"] == 1
    assert cm["false_positives"] == 1
    assert cm["true_negatives"] == 5

    assert m["sensitivity"] == 0.75
    assert m["specificity"] == round(5 / 6, 4)
    assert 0.0 <= m["roc_auc"] <= 1.0
    assert 0.0 <= m["pr_auc"] <= 1.0
    assert "confidence_intervals_95" in m
    assert "sensitivity" in m["confidence_intervals_95"]


def test_compute_calibration_metrics():
    """Verify calibration decile binning, calibration slope, and overconfidence flag."""
    rng = np.random.RandomState(42)
    y_prob = rng.uniform(0.01, 0.99, size=500)
    # Perfectly calibrated outcome: y ~ Bernoulli(y_prob)
    y_true = (rng.uniform(0, 1, size=500) < y_prob).astype(int)

    cal = compute_calibration_metrics(y_true, y_prob, n_bins=10)

    assert len(cal["deciles"]) == 10
    total_count = sum(d["count"] for d in cal["deciles"])
    assert total_count == 500
    assert np.isfinite(cal["calibration_slope"])
    assert np.isfinite(cal["calibration_intercept"])
    assert 0.0 <= cal["brier_score"] <= 1.0
    assert cal["overconfidence_assessment"] in ["none", "mild", "moderate", "severe"]


def test_compute_decision_curve_net_benefit():
    """Verify decision curve net benefit calculation across clinical threshold probabilities."""
    y_true = np.array([1, 1, 1, 0, 0, 0, 0, 0, 0, 0])
    y_prob = np.array([0.9, 0.8, 0.6, 0.5, 0.3, 0.2, 0.1, 0.05, 0.02, 0.01])

    dca = compute_decision_curve(y_true, y_prob, thresholds=[0.05, 0.10, 0.20, 0.50])

    assert len(dca) == 4
    for pt_record in dca:
        assert "threshold_probability" in pt_record
        assert "model_net_benefit" in pt_record
        assert "treat_all_net_benefit" in pt_record
        assert pt_record["treat_none_net_benefit"] == 0.0


def test_bangladesh_evidence_gap_dossier():
    """Verify that Bangladesh evidence dossier exists and documents key structural differences."""
    dossier_path = EVIDENCE_DIR / "bangladesh_evidence_gap_dossier.json"
    assert dossier_path.exists(), "Bangladesh evidence gap dossier must exist"

    with open(dossier_path, "r", encoding="utf-8") as f:
        dossier = json.load(f)

    assert dossier["status"] == "VALIDATION_GAP_CONFIRMED"
    assert len(dossier["comparative_dimensions"]) >= 5

    dim_names = [d["dimension"] for d in dossier["comparative_dimensions"]]
    assert any("Tobacco" in d for d in dim_names)
    assert any("Biomass" in d for d in dim_names)
    assert any("Screening" in d for d in dim_names)

    # Audited BD datasets must include GATS and STEPS
    audited_datasets = [d["dataset_name"] for d in dossier["available_datasets_audited"]]
    assert any("GATS" in ds for ds in audited_datasets)
    assert any("STEPS" in ds for ds in audited_datasets)

    # Prospective protocol must be specified
    assert "PROT-BD-VAL-01" in dossier["prospective_validation_protocol"]["protocol_name"]


def test_validation_records_clinical_safety_invariants():
    """Verify that all generated validation records enforce clinical safety and block unapproved activation."""
    validation_files = list(EVIDENCE_DIR.glob("*_record.json"))
    assert len(validation_files) >= 3, "Must have dossiers for EXP-01, EXP-02, and Direct Cancer"

    for file_path in validation_files:
        with open(file_path, "r", encoding="utf-8") as f:
            record = json.load(f)

        assert record["safety_invariants_enforced"] is True
        assert record["operational_activation"]["is_activated"] is False
        assert record["operational_activation"]["activation_blocked_reason"] is not None
        assert "bangladesh_generalizability" in record
        assert record["bangladesh_generalizability"]["dataset_available"] is False
