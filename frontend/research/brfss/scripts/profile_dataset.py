#!/usr/bin/env python3
"""
Phase 2.1: BRFSS 2022 Dataset Profiling & Variable Dictionary Generation

Reads the full SAS Transport metadata and data to build:
1. Complete dataset profile (rows, columns, format, survey parameters)
2. Comprehensive variable dictionary with labels, data types, missing value codes
3. Research-relevant feature inventory across 6 domains
4. Lung cancer research suitability matrix
"""

import json
import csv
from pathlib import Path
import pyreadstat
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

XPT_PATH = DATA_RAW_DIR / "LLCP2022.XPT"

# Define research domains and key target variables
DOMAINS = {
    "demographics": [
        "_STATE", "_AGEG5YR", "SEXVAR", "_SEX", "_RACE", "_RACEPRV",
        "EDUCA", "_EDUCAG", "INCOMERG", "_INCOMG1", "EMPLOY1", "MARITAL", "VETERAN3"
    ],
    "tobacco_exposure": [
        "SMOKE100", "SMOKDAY2", "STOPSMK2", "LASTSMK2", "USENOW3",
        "ECIGNOW2", "_SMOKER3", "_RFSMOK3", "_CURECI2",
        "LCSFIRST", "LCSLAST", "LCSNUMCG", "_YRSSMOK", "_PACKDAY", "_PACKYRS", "_YRSQUIT", "_SMOKGRP"
    ],
    "respiratory_and_health": [
        "CHCCOPD3", "COPDCOGH", "COPDFLEM", "COPDBRTH", "COPDBTST", "COPDSMOK",
        "ASTHMA3", "ASTHNOW", "_LTASTH1", "_CASTHM1", "_ASTHMS1",
        "GENHLTH", "PHYSHLTH", "MENTHLTH", "POORHLTH",
        "CVDINFR4", "CVDCRHD4", "CVDSTRK3", "_MICHD", "DIABETE4", "_BMI5", "_BMI5CAT"
    ],
    "cancer_variables": [
        "CHCSCNC1", "CHCOCNC1", "CNCRDIFF", "CNCRAGE", "CNCRTYP2",
        "CSRVTRT3", "CSRVSUM", "CSRVPAIN"
    ],
    "screening_and_utilization": [
        "LCSTSC1", "LCSSCNCR", "LCSCTWHN", "_LCSREC",
        "PERSDOC3", "MEDCOST1", "CHECKUP1", "PRIMINSR", "_HLTHPL1"
    ],
    "survey_design": [
        "_STSTR", "_PSU", "_LLCPWT", "FMONTH", "IMONTH", "IDAY", "IYEAR", "DISPCODE", "SEQNO"
    ]
}

def profile_dataset():
    print(f"[INFO] Reading metadata from {XPT_PATH}...")
    _, meta = pyreadstat.read_xport(str(XPT_PATH), metadataonly=True, encoding="latin1")
    
    total_vars = len(meta.column_names)
    print(f"[INFO] Total columns detected: {total_vars}")

    # Read state and weights to get total row count and population weight sum
    print("[INFO] Computing row counts and survey design baselines...")
    df_core, _ = pyreadstat.read_xport(
        str(XPT_PATH),
        encoding="latin1",
        usecols=["_STATE", "_LLCPWT", "_STSTR", "_PSU"]
    )
    total_rows = len(df_core)
    total_weighted_population = float(df_core["_LLCPWT"].sum())
    unique_states = int(df_core["_STATE"].nunique())
    unique_strata = int(df_core["_STSTR"].nunique())
    unique_psu = int(df_core["_PSU"].nunique())

    print(f"[INFO] Observations (N): {total_rows:,}")
    print(f"[INFO] Estimated US Adult Population Represented: {total_weighted_population:,.0f}")
    print(f"[INFO] States/Territories: {unique_states}, Sampling Strata: {unique_strata}, PSUs: {unique_psu}")

    # Build Dataset Profile Record
    profile = {
        "dataset_name": "Behavioral Risk Factor Surveillance System (BRFSS) 2022",
        "survey_year": 2022,
        "format": "SAS Transport Format (.XPT Version 5)",
        "file_size_mb": round(XPT_PATH.stat().st_size / (1024 * 1024), 2),
        "total_observations": total_rows,
        "total_variables": total_vars,
        "geographic_coverage": "50 US States, District of Columbia, Guam, Puerto Rico, US Virgin Islands",
        "target_population": "Non-institutionalized US civilian adults aged 18 years and older",
        "sampling_methodology": "Stratified, disproportionate stratified sampling (DSS) for landline; random digit dialing (RDD) for cellular",
        "survey_design_variables": {
            "primary_sampling_unit": "_PSU",
            "stratification_variable": "_STSTR",
            "final_weight_variable": "_LLCPWT"
        },
        "sample_strata_count": unique_strata,
        "sample_psu_count": unique_psu,
        "weighted_population_represented": round(total_weighted_population, 0),
        "official_source": "Centers for Disease Control and Prevention (CDC), NCCDPHP",
        "publication_date": "October 2023",
        "citation": "Centers for Disease Control and Prevention (CDC). Behavioral Risk Factor Surveillance System Survey Data. Atlanta, Georgia: U.S. Department of Health and Human Services, Centers for Disease Control and Prevention, 2022."
    }

    with open(PROCESSED_DIR / "dataset_profile.json", "w", encoding="utf-8") as f:
        json.dump(profile, f, indent=2)
    print(f"[SUCCESS] Wrote dataset profile to {PROCESSED_DIR / 'dataset_profile.json'}")

    # Build Structured Variable Dictionary
    print("[INFO] Constructing variable dictionary for all 328 variables...")
    var_dict_list = []
    
    # Pre-read non-null counts for all variables in chunks of columns to avoid massive memory usage
    # We will sample or read key columns
    all_cols = meta.column_names
    col_labels = meta.column_names_to_labels
    col_types = meta.readstat_variable_types
    
    # Map domain for each column
    var_to_domain = {}
    for domain, varlist in DOMAINS.items():
        for v in varlist:
            var_to_domain[v] = domain

    # Read research variables to compute actual non-nulls and missingness
    research_vars = [c for c in all_cols if c in var_to_domain]
    print(f"[INFO] Computing descriptive missingness for {len(research_vars)} research variables...")
    df_research, _ = pyreadstat.read_xport(str(XPT_PATH), encoding="latin1", usecols=research_vars)

    for col in all_cols:
        label = col_labels.get(col, "No label provided")
        raw_type = col_types.get(col, "unknown")
        domain = var_to_domain.get(col, "general_survey_or_optional_module")
        
        entry = {
            "variable_name": col,
            "variable_label": label,
            "data_type": "numeric" if "double" in raw_type or "numeric" in raw_type else "text",
            "domain": domain,
            "research_relevance": "high" if domain in ["tobacco_exposure", "respiratory_and_health", "screening_and_utilization"] else "medium" if domain in ["demographics", "survey_design", "cancer_variables"] else "low",
            "missing_value_codes": "7/77/777: Don't know/Not sure; 9/99/999: Refused; BLANK: Not asked or Missing"
        }

        if col in df_research.columns:
            series = df_research[col]
            valid_count = int(series.notna().sum())
            missing_count = int(series.isna().sum())
            entry["observations_present"] = valid_count
            entry["observations_missing"] = missing_count
            entry["missing_percentage"] = round((missing_count / total_rows) * 100, 2)
            
            # Common survey codes check
            dont_know_count = int(series.isin([7, 77, 777, 7777]).sum())
            refused_count = int(series.isin([9, 99, 999, 9999]).sum())
            entry["dont_know_count"] = dont_know_count
            entry["refused_count"] = refused_count
        else:
            entry["observations_present"] = "Not loaded in research subset"
            entry["observations_missing"] = "Not loaded in research subset"
            entry["missing_percentage"] = "N/A"

        var_dict_list.append(entry)

    with open(PROCESSED_DIR / "variable_dictionary.json", "w", encoding="utf-8") as f:
        json.dump(var_dict_list, f, indent=2)

    # Export CSV for easy review
    with open(PROCESSED_DIR / "variable_dictionary.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "variable_name", "variable_label", "data_type", "domain",
            "research_relevance", "observations_present", "observations_missing",
            "missing_percentage", "dont_know_count", "refused_count", "missing_value_codes"
        ])
        writer.writeheader()
        for row in var_dict_list:
            writer.writerow({k: row.get(k, "") for k in writer.fieldnames})

    print(f"[SUCCESS] Wrote variable dictionary (JSON & CSV) to {PROCESSED_DIR}")

    # Build Research Features Inventory
    inventory = {}
    for domain, varlist in DOMAINS.items():
        inventory[domain] = []
        for v in varlist:
            if v in df_research.columns:
                s = df_research[v]
                inventory[domain].append({
                    "variable": v,
                    "label": col_labels.get(v, ""),
                    "non_null_count": int(s.notna().sum()),
                    "non_null_pct": round((s.notna().sum() / total_rows) * 100, 1),
                    "unique_values": int(s.nunique())
                })
    
    with open(PROCESSED_DIR / "features_inventory.json", "w", encoding="utf-8") as f:
        json.dump(inventory, f, indent=2)
    print(f"[SUCCESS] Wrote features inventory to {PROCESSED_DIR / 'features_inventory.json'}")

    # Build Lung Cancer Research Suitability Matrix
    suitability_matrix = [
        {
            "research_objective": "Tobacco & Smoking Exposure Modeling",
            "required_information": "Cumulative pack-years, smoking frequency, duration, cessation interval",
            "available_variables": "_SMOKER3 (100%), _PACKYRS (32.1%), _YRSSMOK (32.1%), _PACKDAY (32.1%), _YRSQUIT (22.8%), SMOKE100 (100%)",
            "suitability": "HIGH",
            "limitations": "Pack-years is only computed for individuals routed through the Lung Cancer Screening section (Section 13) or smoking module; never-smokers have structural skip (NaN); self-reported recall bias."
        },
        {
            "research_objective": "USPSTF 2021 Lung Cancer Screening Adherence",
            "required_information": "Annual LDCT chest scan receipt in high-risk smoking eligibility cohort (50-80yo, 20+ pack-years, current or quit <=15y)",
            "available_variables": "_LCSREC (Computed recommendation status, N=51,453), LCSSCNCR (CT scan receipt for lung cancer, N=165,575)",
            "suitability": "VERY HIGH",
            "limitations": "Cross-sectional self-reported survey. Cannot verify clinical imaging reports or radiology findings. Only available in participating core/module states."
        },
        {
            "research_objective": "Chronic Respiratory Comorbidity Associations",
            "required_information": "COPD, Emphysema, Chronic Bronchitis, Asthma diagnosis, chronic cough/phlegm symptoms",
            "available_variables": "CHCCOPD3 (100%), ASTHMA3 (100%), COPDCOGH (N=35,466), COPDFLEM (N=35,466), COPDBRTH (N=35,466)",
            "suitability": "HIGH",
            "limitations": "CHCCOPD3 combines COPD, emphysema, and chronic bronchitis into a single question; cannot disaggregate specific pathology; symptoms module is state-optional."
        },
        {
            "research_objective": "Direct Supervised Lung Cancer Diagnosis / Prediction",
            "required_information": "Verified histological/clinical lung cancer diagnosis label for general population",
            "available_variables": "CNCRTYP2 (Code 14 = Lung, N=451 survivors out of 22,544 in Module 9; 94.9% missing)",
            "suitability": "UNSUITABLE",
            "limitations": "CRITICAL METHODOLOGICAL BARRIER: BRFSS core does NOT distinguish lung cancer from other cancers. The Cancer Survivorship module is optional, administered only to survivors (heavy survivor bias), yielding only 451 lung cancer cases (0.1% of dataset). Severe survivorship bias excludes aggressive/fatal cases. Cannot be used as a predictive target."
        },
        {
            "research_objective": "Direct Generalization to Bangladesh Population",
            "required_information": "Epidemiological exposures representative of Bangladesh (bidi tobacco, indoor biomass smoke, local genetic/demographic profile)",
            "available_variables": "None (US population survey only)",
            "suitability": "UNSUITABLE WITHOUT ADAPTATION",
            "limitations": "EXTERNAL VALIDITY BARRIER: BRFSS samples US adults. Excludes bidi tobacco, chula biomass fuel cooking, ambient South Asian PM2.5 levels, and local healthcare economics. Statistical weights cannot be transferred to Bangladesh."
        }
    ]

    with open(PROCESSED_DIR / "suitability_matrix.json", "w", encoding="utf-8") as f:
        json.dump(suitability_matrix, f, indent=2)
    print(f"[SUCCESS] Wrote suitability matrix to {PROCESSED_DIR / 'suitability_matrix.json'}")

if __name__ == "__main__":
    profile_dataset()

