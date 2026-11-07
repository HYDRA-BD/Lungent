"""
Phase 2.12: International Expansion — Pytest Test Suite

Verifies:
1. Multi-country configuration registry scaling and ISO standard code validation.
2. Clinical guideline governance gating and zero unauthorized execution leakage.
3. Sovereign privacy and cross-border data transfer controls.
4. Generalized geographic hierarchy traversal latency.
5. Environmental observation normalization and AQI accuracy across providers.
6. 12-step phased international rollout framework and country readiness gating.
7. International summary artifact schema completeness.
"""

import os
import json
import sys
import pytest

# Ensure repo root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from research.experiments.international.international_expansion_benchmarks import (
    evaluate_country_registry_scaling,
    evaluate_clinical_guideline_governance_gating,
    evaluate_cross_border_privacy_safeguards,
    evaluate_geographic_hierarchy_traversal,
    evaluate_environmental_provider_normalization,
    evaluate_12_step_international_rollout,
    run_all_international_benchmarks,
)


def test_country_registry_scaling():
    """Verify registry lookup throughput, latency bounds, and ISO code validation."""
    res = evaluate_country_registry_scaling(1000)
    assert res["num_lookups_executed"] == 1000
    assert res["mean_latency_per_lookup_us"] < 200.0  # < 0.2 ms
    assert res["iso_validation_accuracy_pct"] == 100.0
    assert res["valid_country_lookups"] > 0
    assert res["invalid_or_unknown_lookups"] > 0


def test_clinical_guideline_governance_gating():
    """Verify strict Clinical Governance Invariant: 0% unauthorized execution leakage."""
    res = evaluate_clinical_guideline_governance_gating(500)
    assert res["total_guideline_checks"] == 500
    assert res["authorized_clinical_executions"] == 250
    assert res["blocked_unapproved_executions"] == 250
    assert res["unauthorized_leakage_rate_pct"] == 0.0
    assert res["clinical_governance_invariant_satisfied"] is True


def test_cross_border_privacy_safeguards():
    """Verify sovereign privacy safeguards and cross-border transfer controls."""
    res = evaluate_cross_border_privacy_safeguards(400)
    assert res["total_transfer_requests"] == 400
    assert res["domestic_authorizations"] == 100
    assert res["cross_border_blocked"] == 200
    assert res["cross_border_authorizations"] == 100
    assert res["sovereignty_enforcement_accuracy_pct"] == 100.0
    assert res["patient_consent_gate_accuracy_pct"] == 100.0


def test_geographic_hierarchy_traversal():
    """Verify generalized geographic administrative hierarchy tree traversal latency."""
    res = evaluate_geographic_hierarchy_traversal(1000)
    assert res["total_traversals_executed"] == 1000
    assert res["mean_traversal_latency_us"] < 200.0
    assert res["max_hierarchy_depth"] == 3
    assert res["hierarchy_traversal_success_pct"] == 100.0


def test_environmental_provider_normalization():
    """Verify multi-provider normalization and US EPA AQI calculation accuracy."""
    res = evaluate_environmental_provider_normalization(500)
    assert res["readings_normalized"] == 500
    assert res["providers_tested"] == 3
    assert res["aqi_calculation_accuracy_pct"] == 100.0
    assert res["multi_provider_interoperability_verified"] is True


def test_12_step_international_rollout():
    """Verify 12-step rollout milestone framework and country readiness gating."""
    res = evaluate_12_step_international_rollout()
    assert res["total_rollout_steps"] == 12
    # Bangladesh: 100% complete, authorized
    assert res["bangladesh_completed_steps"] == 12
    assert res["bangladesh_readiness_pct"] == 100.0
    assert res["bangladesh_deployment_authorized"] is True
    # Malaysia (Synthetic): 33.3% complete, deployment blocked
    assert res["malaysia_completed_steps"] == 4
    assert res["malaysia_readiness_pct"] == 33.3
    assert res["malaysia_deployment_authorized"] is False
    assert res["premature_deployment_gate_enforced"] is True


def test_international_artifacts_integrity():
    """Verify generated international summary JSON artifact schema completeness."""
    summary = run_all_international_benchmarks()
    assert "benchmark_timestamp" in summary
    assert "Phase 2.12" in summary["phase"]
    assert "country_registry" in summary
    assert "clinical_guideline_governance" in summary
    assert "privacy_and_cross_border" in summary
    assert "geographic_hierarchy" in summary
    assert "environmental_providers" in summary
    assert "phased_rollout" in summary

    artifact_path = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "../international/artifacts/international_summary.json"
        )
    )
    assert os.path.exists(artifact_path)
    with open(artifact_path, "r", encoding="utf-8") as f:
        loaded = json.load(f)
    assert loaded["clinical_guideline_governance"]["clinical_governance_invariant_satisfied"] is True

