"""
Phase 2.11: Regional & Nationwide Expansion — Pytest Test Suite

Verifies:
1. Multi-tier facility onboarding distribution, readiness scores, and DGHS uniqueness.
2. Hub-and-spoke referral pathway routing latency and consent enforcement accuracy.
3. Centralized subsystem monitoring probe throughput and latency SLA compliance.
4. Strict Zero-PHI logging invariant audit (100% sensitivity, 0% leakage).
5. Phased rollout milestone structure and nationwide activation gating logic.
6. Expansion summary artifact integrity and schema completeness.
"""

import os
import json
import sys
import pytest

# Ensure repo root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from research.experiments.expansion.nationwide_expansion_benchmarks import (
    evaluate_facility_onboarding_scaling,
    evaluate_network_referral_routing,
    evaluate_subsystem_health_probes,
    evaluate_zero_phi_invariant_audit,
    evaluate_phased_rollout_milestones,
    run_all_expansion_benchmarks,
)


def test_facility_onboarding_scaling():
    """Verify multi-tier onboarding distribution, readiness scores, and DGHS code collisions."""
    res = evaluate_facility_onboarding_scaling(150)
    assert res["num_facilities_simulated"] == 150
    assert res["mean_readiness_score"] >= 65.0
    assert res["activation_rate_pct"] >= 50.0
    assert res["dghs_collisions_detected"] >= 1
    assert "Dhaka" in res["division_breakdown"]
    assert "national_specialized" in res["tier_breakdown"]


def test_network_referral_routing():
    """Verify sub-millisecond referral routing and strict consent gate verification."""
    res = evaluate_network_referral_routing(500)
    assert res["total_referral_requests"] == 500
    assert res["mean_latency_per_routing_us"] < 500.0  # < 0.5 ms
    assert res["authorized_requests"] > 0
    assert res["denied_requests"] > 0
    assert res["consent_enforcement_accuracy_pct"] == 100.0
    assert res["mean_referral_hops"] >= 1.0
    assert res["max_hops_observed"] <= 3


def test_subsystem_health_probes():
    """Verify centralized subsystem health probe throughput and latency."""
    res = evaluate_subsystem_health_probes(30)
    assert res["nodes_probed"] == 30
    assert res["total_probes_executed"] == 30 * 7
    assert res["probe_throughput_per_sec"] > 500.0
    assert res["mean_subsystem_latency_ms"] < 60.0
    assert res["healthy_subsystem_pct"] >= 90.0


def test_zero_phi_invariant_audit():
    """Verify strict Zero-PHI logging invariant (100% sensitivity, 0% leakage)."""
    res = evaluate_zero_phi_invariant_audit(300)
    assert res["total_logs_audited"] == 300
    assert res["sensitivity_pct"] == 100.0
    assert res["specificity_pct"] == 100.0
    assert res["phi_leakage_rate_pct"] == 0.0
    assert res["zero_phi_invariant_satisfied"] is True


def test_phased_rollout_milestones():
    """Verify 8-step phased rollout milestone framework and deployment gating."""
    res = evaluate_phased_rollout_milestones()
    assert res["total_rollout_steps"] == 8
    assert res["completed_steps"] >= 4
    assert res["milestone_completion_pct"] >= 50.0
    # Currently milestones 6-8 are incomplete, so nationwide rollout should not be authorized
    assert res["current_nationwide_authorized"] is False
    # If all 8 steps were completed and readiness >= 80%, future state would be authorized
    assert res["fully_completed_future_authorized"] is True


def test_expansion_artifacts_integrity():
    """Verify generated expansion summary JSON artifact schema completeness."""
    summary = run_all_expansion_benchmarks()
    assert "benchmark_timestamp" in summary
    assert "Phase 2.11" in summary["phase"]
    assert "facility_onboarding" in summary
    assert "referral_routing" in summary
    assert "subsystem_monitoring" in summary
    assert "zero_phi_audit" in summary
    assert "phased_rollout" in summary

    # Verify file was written and can be read back
    artifact_path = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "../expansion/artifacts/expansion_summary.json"
        )
    )
    assert os.path.exists(artifact_path)
    with open(artifact_path, "r", encoding="utf-8") as f:
        loaded = json.load(f)
    assert loaded["zero_phi_audit"]["zero_phi_invariant_satisfied"] is True

