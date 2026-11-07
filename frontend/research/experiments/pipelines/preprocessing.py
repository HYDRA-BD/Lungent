"""
Phase 2.2: Reusable Feature Engineering & Preprocessing Pipelines

Provides leakage-free Scikit-Learn transformers for:
- EXP-01: Chronic Obstructive Pulmonary Disease (COPD) Cohort
- EXP-02: USPSTF Lung Cancer Screening Non-Adherence Cohort
"""

from pathlib import Path
from typing import Tuple, List, Dict, Any
import pyreadstat
import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

# =============================================================================
# 1. EXP-01: COPD PHENOTYPE FEATURE DEFINITIONS
# =============================================================================

COPD_NUMERICAL_FEATURES: List[str] = [
    "pack_years",
    "years_smoked",
    "bmi",
    "physical_illness_days",
    "mental_illness_days",
]

COPD_CATEGORICAL_FEATURES: List[str] = [
    "age_group",
    "sex",
    "race_ethnicity",
    "education_level",
    "income_category",
    "employment_status",
    "smoking_status",
    "asthma_history",
    "general_health",
]

COPD_RAW_COLS: List[str] = [
    "_STATE", "_AGEG5YR", "SEXVAR", "_RACE1", "EDUCA", "_INCOMG1", "EMPLOY1",
    "_SMOKER3", "SMOKE100", "_PACKYRS", "_YRSSMOK",
    "CHCCOPD3", "ASTHMA3", "GENHLTH", "PHYSHLTH", "MENTHLTH", "_BMI5", "_LLCPWT"
]

# =============================================================================
# 2. EXP-02: SCREENING NON-ADHERENCE FEATURE DEFINITIONS
# =============================================================================

LCS_NUMERICAL_FEATURES: List[str] = [
    "pack_years",
    "years_smoked",
    "years_quit",
    "bmi",
]

LCS_CATEGORICAL_FEATURES: List[str] = [
    "age_group",
    "sex",
    "race_ethnicity",
    "education_level",
    "income_category",
    "employment_status",
    "smoking_group",
    "has_personal_doctor",
    "cost_prevented_doctor_visit",
    "annual_routine_checkup",
    "has_health_insurance",
    "general_health",
]

LCS_RAW_COLS: List[str] = [
    "_STATE", "_AGEG5YR", "SEXVAR", "_RACE1", "EDUCA", "_INCOMG1", "EMPLOY1",
    "_PACKYRS", "_YRSSMOK", "_YRSQUIT", "_SMOKGRP",
    "PERSDOC3", "MEDCOST1", "CHECKUP1", "PRIMINSR", "_HLTHPLN",
    "CHCCOPD3", "GENHLTH", "_BMI5", "_LCSREC", "_LLCPWT"
]


def build_preprocessor(numerical_features: List[str], categorical_features: List[str]) -> ColumnTransformer:
    """
    Constructs a leakage-safe ColumnTransformer.
    - Numerical: median imputation + standard scaling.
    - Categorical: most frequent imputation + OneHotEncoding with unseen category handling.
    """
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, numerical_features),
            ("cat", cat_pipeline, categorical_features),
        ],
        remainder="drop"
    )

    return preprocessor


def load_copd_cohort(xpt_path: Path) -> Tuple[pd.DataFrame, pd.Series, np.ndarray, pd.DataFrame]:
    """
    Extracts and cleans the analytical cohort for EXP-01 (COPD Phenotype).
    Returns: (X, y, weights, raw_subgroups_for_fairness)
    """
    df, _ = pyreadstat.read_xport(str(xpt_path), encoding="latin1", usecols=COPD_RAW_COLS)

    # Filter to valid binary target (CHCCOPD3: 1=Yes, 2=No)
    df = df[df["CHCCOPD3"].isin([1, 2])].copy()
    y = (df["CHCCOPD3"] == 1).astype(int)

    # Clean pack_years and years_smoked: non-smokers or NaN assigned 0.0
    pack_years = df["_PACKYRS"].copy()
    pack_years = np.where((pack_years.isna()) | (pack_years < 0), 0.0, pack_years)
    pack_years = np.clip(pack_years, 0.0, 150.0)

    years_smoked = df["_YRSSMOK"].copy()
    years_smoked = np.where((years_smoked.isna()) | (years_smoked < 0), 0.0, years_smoked)
    years_smoked = np.clip(years_smoked, 0.0, 80.0)

    # Clean BMI (two implied decimals: e.g. 2500 -> 25.0)
    bmi = df["_BMI5"].copy() / 100.0
    bmi = np.where((bmi < 12.0) | (bmi > 70.0), np.nan, bmi)

    # Clean Physical/Mental Health days (88=None -> 0 days; 77/99 -> NaN)
    phys = df["PHYSHLTH"].copy()
    phys = np.where(phys == 88, 0.0, np.where(phys.isin([77, 99]), np.nan, phys))
    ment = df["MENTHLTH"].copy()
    ment = np.where(ment == 88, 0.0, np.where(ment.isin([77, 99]), np.nan, ment))

    # Clean Categorical features (converting special refusal codes to 'Unknown/Refused')
    age_group = df["_AGEG5YR"].replace({14: np.nan}).astype(str)
    sex = df["SEXVAR"].map({1: "Male", 2: "Female"}).fillna("Unknown")
    
    race_map = {
        1: "White", 2: "Black", 3: "American_Indian_Alaska_Native",
        4: "Asian", 5: "Pacific_Islander", 6: "Other_Race",
        7: "Multiracial", 8: "Hispanic", 9: "Unknown"
    }
    race = df["_RACE1"].map(race_map).fillna("Unknown")

    smk_map = {1: "Daily_Smoker", 2: "Some_Day_Smoker", 3: "Former_Smoker", 4: "Never_Smoker", 9: "Refused"}
    smoking = df["_SMOKER3"].map(smk_map).fillna("Unknown")

    asthma = df["ASTHMA3"].map({1: "Yes", 2: "No"}).fillna("Unknown")
    gen_hlth = df["GENHLTH"].replace({7: np.nan, 9: np.nan}).astype(str)
    education = df["EDUCA"].replace({9: np.nan}).astype(str)
    income = df["_INCOMG1"].replace({9: np.nan}).astype(str)
    employment = df["EMPLOY1"].replace({9: np.nan}).astype(str)

    X = pd.DataFrame({
        "pack_years": pack_years,
        "years_smoked": years_smoked,
        "bmi": bmi,
        "physical_illness_days": phys,
        "mental_illness_days": ment,
        "age_group": age_group,
        "sex": sex,
        "race_ethnicity": race,
        "education_level": education,
        "income_category": income,
        "employment_status": employment,
        "smoking_status": smoking,
        "asthma_history": asthma,
        "general_health": gen_hlth,
    }, index=df.index)

    subgroups = pd.DataFrame({
        "age_group": age_group,
        "sex": sex,
        "race_ethnicity": race,
    }, index=df.index)

    weights = df["_LLCPWT"].fillna(1.0).to_numpy()

    return X, y, weights, subgroups


def load_screening_cohort(xpt_path: Path) -> Tuple[pd.DataFrame, pd.Series, np.ndarray, pd.DataFrame]:
    """
    Extracts and cleans the analytical cohort for EXP-02 (Screening Non-Adherence).
    Eligible cohort: Meeting USPSTF criteria (_LCSREC in [1, 2]).
    Target: 1 = Unscreened in past year (_LCSREC == 2), 0 = Screened (_LCSREC == 1).
    Returns: (X, y, weights, raw_subgroups_for_fairness)
    """
    df, _ = pyreadstat.read_xport(str(xpt_path), encoding="latin1", usecols=LCS_RAW_COLS)

    # Filter to USPSTF 2021 eligible cohort
    df = df[df["_LCSREC"].isin([1, 2])].copy()
    # Target: 1 = Non-adherent (unscreened), 0 = Adherent (screened)
    y = (df["_LCSREC"] == 2).astype(int)

    pack_years = np.clip(df["_PACKYRS"].fillna(20.0), 20.0, 150.0)
    years_smoked = np.clip(df["_YRSSMOK"].fillna(20.0), 0.0, 80.0)
    years_quit = np.clip(df["_YRSQUIT"].fillna(0.0), 0.0, 15.0)

    bmi = df["_BMI5"].copy() / 100.0
    bmi = np.where((bmi < 12.0) | (bmi > 70.0), np.nan, bmi)

    age_group = df["_AGEG5YR"].astype(str)
    sex = df["SEXVAR"].map({1: "Male", 2: "Female"}).fillna("Unknown")

    race_map = {
        1: "White", 2: "Black", 3: "American_Indian_Alaska_Native",
        4: "Asian", 5: "Pacific_Islander", 6: "Other_Race",
        7: "Multiracial", 8: "Hispanic", 9: "Unknown"
    }
    race = df["_RACE1"].map(race_map).fillna("Unknown")

    doctor = df["PERSDOC3"].map({1: "Yes_Only_One", 2: "Yes_More_Than_One", 3: "No"}).fillna("Unknown")
    cost_barrier = df["MEDCOST1"].map({1: "Yes_Cost_Barrier", 2: "No_Cost_Barrier"}).fillna("Unknown")
    checkup = df["CHECKUP1"].map({1: "Past_Year", 2: "Past_2_Years", 3: "Past_5_Years", 4: "5+_Years", 8: "Never"}).fillna("Unknown")
    insurance = df["_HLTHPLN"].map({1: "Insured", 2: "Uninsured", 9: "Unknown"}).fillna("Unknown")
    gen_hlth = df["GENHLTH"].replace({7: np.nan, 9: np.nan}).astype(str)
    education = df["EDUCA"].replace({9: np.nan}).astype(str)
    income = df["_INCOMG1"].replace({9: np.nan}).astype(str)
    employment = df["EMPLOY1"].replace({9: np.nan}).astype(str)
    smoking_group = df["_SMOKGRP"].astype(str)

    X = pd.DataFrame({
        "pack_years": pack_years,
        "years_smoked": years_smoked,
        "years_quit": years_quit,
        "bmi": bmi,
        "age_group": age_group,
        "sex": sex,
        "race_ethnicity": race,
        "education_level": education,
        "income_category": income,
        "employment_status": employment,
        "smoking_group": smoking_group,
        "has_personal_doctor": doctor,
        "cost_prevented_doctor_visit": cost_barrier,
        "annual_routine_checkup": checkup,
        "has_health_insurance": insurance,
        "general_health": gen_hlth,
    }, index=df.index)

    subgroups = pd.DataFrame({
        "age_group": age_group,
        "sex": sex,
        "race_ethnicity": race,
        "cost_barrier": cost_barrier,
    }, index=df.index)

    weights = df["_LLCPWT"].fillna(1.0).to_numpy()

    return X, y, weights, subgroups
