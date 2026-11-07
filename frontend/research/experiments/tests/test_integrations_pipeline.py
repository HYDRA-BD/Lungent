"""
Phase 2.9: Advanced Healthcare Integrations — Pytest Test Suite

Verifies:
1. HL7 FHIR R4 transformation throughput, latency, and resource generation.
2. HL7 v2.5.1 ORU^R01 parser throughput and field extraction fidelity.
3. DICOM Part 10 CT metadata parsing and LDCT protocol validation.
4. Master Patient Index (MPI) matching precision, recall, and UUID preservation.
5. Non-diagnostic safety invariant and consent gate guardrail integrity.
6. Interoperability summary JSON artifact structure and schema conformance.
"""

import json
import os
import sys
import pytest

# Ensure repo root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from research.experiments.integrations.healthcare_interoperability_benchmarks import (
    evaluate_fhir_transformation_benchmarks,
    evaluate_hl7_v2_parsing_benchmarks,
    evaluate_dicom_ldct_validation,
    evaluate_mpi_matching_benchmarks,
    evaluate_clinical_safety_and_consent_benchmarks,
    compute_deterministic_hash,
)


def test_fhir_transformation_benchmarks():
    """Verify FHIR R4 transformation generation, throughput, and latency bounds."""
    res = evaluate_fhir_transformation_benchmarks(1000)
    assert res["num_records"] == 1000
    assert res["total_resources_generated"] == 3000
    assert res["resource_throughput_per_sec"] > 500.0
    assert res["mean_latency_per_resource_ms"] < 2.0
    assert res["conformance_rate_pct"] == 100.0


def test_hl7_v2_parsing_benchmarks():
    """Verify HL7 v2.5.1 parsing throughput, observation extraction, and accuracy."""
    res = evaluate_hl7_v2_parsing_benchmarks(500)
    assert res["num_messages_parsed"] == 500
    assert res["total_observations_extracted"] == 1000
    assert res["messages_per_sec"] > 250.0
    assert res["extraction_accuracy_pct"] == 100.0


def test_dicom_ldct_validation():
    """Verify DICOM CT radiation dose classification against ACR/NLST threshold."""
    res = evaluate_dicom_ldct_validation(500)
    assert res["num_series_analyzed"] == 500
    assert res["ctdivol_threshold_mgy"] == 3.0
    assert res["classified_ldct_count"] > 0
    assert res["classified_standard_ct_count"] > 0
    assert res["classification_accuracy_pct"] == 100.0


def test_mpi_matching_benchmarks():
    """Verify Master Patient Index (MPI) precision and sovereign UUID preservation."""
    res = evaluate_mpi_matching_benchmarks(500)
    assert res["total_queries_evaluated"] == 500
    assert res["deterministic_exact_matches"] > 0
    assert res["matching_precision_pct"] >= 95.0
    assert res["identifier_isolation_enforced"] is True
    assert res["uuid_preservation_integrity_pct"] == 100.0


def test_clinical_safety_and_consent_guardrails():
    """Verify non-diagnostic invariant (0% autonomous alteration) and 100% consent blocking."""
    res = evaluate_clinical_safety_and_consent_benchmarks()

    safety = res["non_diagnostic_safety_invariant"]
    assert safety["unreviewed_record_autonomous_risk_alteration_allowed"] is False
    assert safety["autonomous_alteration_leakage_rate_pct"] == 0.0
    assert safety["mandatory_clinician_justification_enforced"] is True
    assert safety["reconciliation_audit_log_completeness_pct"] == 100.0

    consent = res["consent_gate_guardrail"]
    assert consent["blocking_rate_pct"] == 100.0
    assert consent["unauthorized_data_leakage_count"] == 0
    assert consent["required_consent_code"] == "CONSENT-DATA-EXCHANGE-2026"


def test_deterministic_hash_integrity():
    """Verify SHA-256 payload hashing produces stable deterministic digest."""
    h1 = compute_deterministic_hash("Sample clinical test payload 2026")
    h2 = compute_deterministic_hash("Sample clinical test payload 2026")
    h3 = compute_deterministic_hash("Different payload")

    assert h1 == h2
    assert h1 != h3
    assert h1.startswith("sha256-")
    assert len(h1) == 71  # "sha256-" + 64 hex characters


def test_interoperability_summary_artifact_exists():
    """Verify generated JSON artifact exists and has complete top-level sections."""
    artifact_path = "research/experiments/integrations/artifacts/interoperability_summary.json"
    assert os.path.exists(artifact_path), f"Artifact missing at {artifact_path}"

    with open(artifact_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["phase"] == "2.9"
    assert data["milestone_name"] == "Advanced Healthcare Integrations"
    assert "fhir_r4_benchmarks" in data
    assert "hl7_v2_benchmarks" in data
    assert "dicom_ct_benchmarks" in data
    assert "mpi_matching_benchmarks" in data
    assert "clinical_safety_and_consent" in data
