"""
Phase 2.1: Automated Unit & Pipeline Verification Tests for BRFSS Research

Tests:
1. Dataset Provenance & File Integrity
2. Variable Dictionary Completeness & Schema
3. Skip Pattern & Structural Missingness Invariants
4. Survey Weight Mathematical Properties
5. Lung Cancer Research Suitability Constraints
6. Bangladesh External Validity Flags
"""

import json
from pathlib import Path
import pytest
import pyreadstat
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
DATA_RAW_DIR = BASE_DIR / "data" / "raw"
XPT_PATH = DATA_RAW_DIR / "LLCP2022.XPT"


def test_dataset_provenance_and_profile():
    """Verify official CDC 2022 dataset profile and file characteristics."""
    profile_path = PROCESSED_DIR / "dataset_profile.json"
    assert profile_path.exists(), "dataset_profile.json must exist"

    with open(profile_path, "r") as f:
        profile = json.load(f)

    assert profile["survey_year"] == 2022
    assert profile["total_observations"] == 445132
    assert profile["total_variables"] == 328
    assert profile["survey_design_variables"]["final_weight_variable"] == "_LLCPWT"
    assert profile["survey_design_variables"]["stratification_variable"] == "_STSTR"
    assert profile["survey_design_variables"]["primary_sampling_unit"] == "_PSU"
    assert profile["weighted_population_represented"] > 250_000_000


def test_variable_dictionary_schema():
    """Verify that variable dictionary is generated and contains required metadata fields."""
    dict_path = PROCESSED_DIR / "variable_dictionary.json"
    assert dict_path.exists(), "variable_dictionary.json must exist"

    with open(dict_path, "r") as f:
        var_dict = json.load(f)

    assert len(var_dict) == 328
    
    var_names = {v["variable_name"] for v in var_dict}
    required_vars = ["_STATE", "_LLCPWT", "_SMOKER3", "CHCCOPD3", "ASTHMA3", "_PACKYRS", "CNCRTYP2", "_LCSREC"]
    for rv in required_vars:
        assert rv in var_names, f"Required variable {rv} must be in variable dictionary"

    for entry in var_dict:
        assert "variable_name" in entry
        assert "variable_label" in entry
        assert "data_type" in entry
        assert "missing_value_codes" in entry


def test_skip_pattern_invariants():
    """Verify that skip pattern routing logic holds true in data."""
    skip_path = PROCESSED_DIR / "skip_patterns_analysis.json"
    assert skip_path.exists(), "skip_patterns_analysis.json must exist"

    with open(skip_path, "r") as f:
        skips = json.load(f)

    # Tobacco skip rule conformance
    assert skips["tobacco_skip_rule"]["structural_blank_conformance_pct"] >= 99.99
    # Lung cancer survivors count in Module 9
    assert skips["cancer_survivorship_routing"]["lung_cancer_cases_identified"] == 451


def test_survey_weights_properties():
    """Verify mathematical properties of CDC final survey weights (_LLCPWT)."""
    df, _ = pyreadstat.read_xport(str(XPT_PATH), encoding="latin1", usecols=["_LLCPWT", "_STATE"])
    
    weights = df["_LLCPWT"]
    assert weights.isna().sum() == 0, "Final survey weights must not contain NaNs"
    assert (weights <= 0).sum() == 0, "All survey weights must be strictly positive"
    
    pop_sum = weights.sum()
    # US adult population in 2022 was approx 255-270 million
    assert 250_000_000 <= pop_sum <= 280_000_000, f"Expected US population sum, got {pop_sum}"


def test_lung_cancer_suitability_constraints():
    """Enforce invariant: BRFSS is marked UNSUITABLE for direct supervised lung cancer prediction."""
    suit_path = PROCESSED_DIR / "suitability_matrix.json"
    assert suit_path.exists(), "suitability_matrix.json must exist"

    with open(suit_path, "r") as f:
        matrix = json.load(f)

    matrix_map = {m["research_objective"]: m for m in matrix}
    
    # 1. Direct lung cancer diagnosis prediction MUST be flagged UNSUITABLE
    pred_obj = matrix_map["Direct Supervised Lung Cancer Diagnosis / Prediction"]
    assert pred_obj["suitability"] == "UNSUITABLE"
    assert "survivorship bias" in pred_obj["limitations"].lower()

    # 2. Tobacco exposure modeling MUST be HIGH
    tob_obj = matrix_map["Tobacco & Smoking Exposure Modeling"]
    assert tob_obj["suitability"] == "HIGH"

    # 3. Screening adherence MUST be VERY HIGH
    lcs_obj = matrix_map["USPSTF 2021 Lung Cancer Screening Adherence"]
    assert lcs_obj["suitability"] == "VERY HIGH"

    # 4. Bangladesh applicability MUST be flagged UNSUITABLE WITHOUT ADAPTATION
    bd_obj = matrix_map["Direct Generalization to Bangladesh Population"]
    assert "UNSUITABLE" in bd_obj["suitability"]


def test_statistical_summary_integrity():
    """Verify integrity of statistical analysis and hypothesis register."""
    summary_path = PROCESSED_DIR / "statistical_analysis_summary.json"
    assert summary_path.exists(), "statistical_analysis_summary.json must exist"

    with open(summary_path, "r") as f:
        res = json.load(f)

    assert res["dataset_sample_size"] == 445132
    assert len(res["research_hypotheses"]) >= 4
    
    # Verify COPD association
    assert res["copd_association"]["chi_square_statistic"] > 10000
    assert res["copd_association"]["p_value"] < 0.0001

    # Verify Screening adherence (< 15%)
    assert res["screening_adherence"]["weighted_adherence_pct"] < 15.0

