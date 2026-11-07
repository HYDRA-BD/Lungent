"""
Phase 2.8: Population-Level Intelligence — Pytest Test Suite

Verifies:
1. Wilson score confidence interval computation.
2. Risk factor prevalence distribution bounds.
3. Co-occurrence odds ratio calculations.
4. Privacy-preserving k-anonymity cell suppression.
5. Benchmark summary JSON artifact structure and governance invariants.
"""

import json
import os
import pytest
from research.experiments.population.population_intelligence_benchmarks import (
    wilson_score_interval,
    evaluate_cohort_risk_factors,
    evaluate_co_occurrence,
    evaluate_k_anonymity_suppression,
)


def test_wilson_score_interval_bounds():
    """Verify Wilson score confidence interval bounds are mathematically valid."""
    low, high = wilson_score_interval(1920, 5000, 0.95)
    assert 35.0 < low < 38.4
    assert 38.4 < high < 42.0

    # Edge cases
    zero_low, zero_high = wilson_score_interval(0, 100)
    assert zero_low == 0.0


def test_cohort_risk_factors_prevalence():
    """Verify prevalence percentages and counts across core risk factors."""
    results = evaluate_cohort_risk_factors(5000)
    assert len(results) == 8

    cig = next(r for r in results if r["factor_code"] == "RF_CIGARETTE_SMOKING")
    assert cig["prevalence_pct"] == 38.4
    assert cig["ci_95_lower"] < 38.4 < cig["ci_95_upper"]

    biomass = next(r for r in results if r["factor_code"] == "RF_BIOMASS_CHULA_COOKING")
    assert biomass["prevalence_pct"] > 50.0


def test_co_occurrence_odds_ratios():
    """Verify co-occurrence pairs and odds ratio calculations."""
    pairs = evaluate_co_occurrence(5000)
    assert len(pairs) == 2

    bidi_biomass = next(p for p in pairs if "Bidi" in p["pair_name"])
    assert bidi_biomass["odds_ratio"] > 2.0
    assert bidi_biomass["joint_pct"] > 15.0


def test_k_anonymity_suppression_logic():
    """Verify cells below k=5 are strictly suppressed while 0 and >=5 pass."""
    suppressions = evaluate_k_anonymity_suppression(5)
    for s in suppressions:
        if s["raw_count"] in [1, 2, 4]:
            assert s["is_suppressed"] is True
            assert "[SUPPRESSED]" in s["display_value"]
        elif s["raw_count"] in [0, 5, 8, 25, 120]:
            assert s["is_suppressed"] is False
            assert str(s["raw_count"]) == s["display_value"]


def test_population_summary_json_artifact():
    """Verify generated JSON artifact has all required clinical governance and safety assertions."""
    artifact_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "population",
        "artifacts",
        "population_intelligence_summary.json",
    )
    assert os.path.exists(artifact_path), f"Artifact missing at {artifact_path}"

    with open(artifact_path, "r") as f:
        data = json.load(f)

    assert data["milestone"] == "Phase 2.8: Population-Level Intelligence"
    assert data["cohort_analyzed"]["sample_size"] == 5000
    assert data["cohort_analyzed"]["sampling_methodology"] == "clinical_convenience_sample"

    safety = data["clinical_safety_assertions"]
    assert safety["non_causal_enforced"] is True
    assert safety["individual_risk_score_modification_blocked"] is True
    assert safety["triage_suppression_blocked"] is True
    assert safety["convenience_sample_caveat_enforced"] is True

