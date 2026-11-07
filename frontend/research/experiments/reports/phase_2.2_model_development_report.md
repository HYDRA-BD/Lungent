# Phase 2.2 — Experimental AI/ML Model Development Report

**Project:** Lungent — Intelligent Lung Health Assessment  
**Phase:** 2 — Advanced Intelligence & Expansion  
**Milestone:** 2.2 of 2.12  
**Status:** Completed & Validated  
**Date:** November 6, 2026  
**Clinical & Research Governance Status:** `EXPERIMENTAL_RESEARCH_ONLY`  
**Deployment Restriction:** Prohibited from clinical screening determinations or production clinical decision-support workflows.

---

## 1. Executive Summary

Phase 2.2 systematically developed, benchmarked, and evaluated experimental machine learning models utilizing the research assets and empirical findings established in Phase 2.1 from the CDC Behavioral Risk Factor Surveillance System (BRFSS 2022, $N = 445,132$).

Following rigorous clinical epidemiological principles, direct supervised prediction of lung cancer diagnosis was **formally rejected** due to the absence of an incidence label in the BRFSS core instrument and severe survivorship bias in the optional cancer module ($n = 451$ survivors, $0.10\%$). Two scientifically sound, clinically valuable prediction tasks were developed:

1. **EXP-01: COPD Phenotype Prediction (`CHCCOPD3`)**
   - **Clinical Rationale:** COPD is an established independent causal multiplier for lung cancer (OR 2.0–3.5). Identifying high-risk respiratory phenotypes informs pre-screening risk stratification.
   - **Evaluated Models:** Logistic Regression Baseline, Decision Tree, Random Forest, HistGradientBoosting.
   - **Selected Model:** **Logistic Regression Baseline** achieved **ROC-AUC = 0.8614** (5-Fold CV Mean: $0.8695 \pm 0.0040$), **PR-AUC = 0.4324**, **Sensitivity = 0.7712**, **Specificity = 0.8020**, with high clinical explainability and low inference latency ($11.1\text{s}$ training time).
   
2. **EXP-02: USPSTF Lung Cancer Screening Non-Adherence Propensity (`_LCSREC == 2`)**
   - **Clinical Rationale:** Implementation science demonstrates that $>90\%$ of eligible high-risk individuals fail to receive annual low-dose computed tomography (LDCT). Predicting non-adherence allows primary care systems to direct proactive outreach and barrier remediation.
   - **Evaluated Models:** Logistic Regression Baseline, Decision Tree, Random Forest, HistGradientBoosting.
   - **Selected Model:** **Random Forest Classifier** achieved **ROC-AUC = 0.9090** (5-Fold CV Mean: $0.9095 \pm 0.0034$), **PR-AUC = 0.9903**, **Sensitivity = 0.7642**, **Specificity = 0.9909**, **Precision = 0.9987**, **F1 = 0.8659**.

Both experimental tracks included demographic fairness audits across biological sex, age categories, racial/ethnic identity, and healthcare cost barriers. Complete software isolation was maintained between the experimental research pipelines (`research/experiments/`) and Lungent's production clinical codebase (`src/`).

---

## 2. Scientific Feasibility & Task Formulations

### 2.1 Rejection of Direct Supervised Lung Cancer Diagnosis
A fundamental objective of clinical AI safety is refusing to fabricate non-existent clinical targets:
- In BRFSS 2022, cancer questions are in the optional cancer module (Module 9), answered by only 10 jurisdictions.
- Only $n = 451$ surviving respondents reported a history of lung cancer ($0.10\%$ of total records).
- Because lung cancer has a 5-year relative survival rate under $25\%$, living respondents in an outpatient telephone survey represent extreme survivorship bias and immortal time bias.
- Attempting to train a supervised model to distinguish $451$ historical survivors from $444,681$ non-cancer respondents would learn outpatient survival characteristics rather than true oncologic risk.

### 2.2 Experiment EXP-01: COPD Phenotype Prediction
- **Target:** `CHCCOPD3` (1 = Diagnosed with COPD/Emphysema/Chronic Bronchitis; 0 = No diagnosis).
- **Cohort Size:** $N = 442,913$ valid respondents ($35,656$ positive cases, $8.05\%$ prevalence).
- **Experimental Sample:** $N = 120,000$ stratified sample ($96,000$ training / validation split; $24,000$ isolated holdout test split).
- **Feature Set:** Numerical ($5$ features: pack-years, years smoked, BMI, physical illness days, mental illness days); Categorical ($9$ features: age group, sex, race/ethnicity, education, income, employment, smoking status, asthma history, general health).

### 2.3 Experiment EXP-02: USPSTF Screening Non-Adherence Propensity
- **Target:** `_LCSREC == 2` ($1 = \text{Recommended for LDCT but did not receive CT scan in past year}$; $0 = \text{Received CT scan in past year}$).
- **Cohort Size:** $N = 51,453$ USPSTF 2021 eligible respondents ($46,510$ non-adherent, $90.39\%$ prevalence; $4,943$ adherent, $9.61\%$).
- **Experimental Sample:** $41,162$ training / validation split ($80\%$); $10,291$ isolated holdout test split ($20\%$).
- **Feature Set:** Numerical ($4$ features: pack-years, years smoked, years quit, BMI); Categorical ($12$ features: age group, sex, race/ethnicity, education, income, employment, smoking group, personal doctor, healthcare cost barrier, routine checkup recency, health insurance coverage, general health).

---

## 3. Preprocessing & Leakage Prevention Architecture

All feature transformations were engineered within Scikit-Learn `ColumnTransformer` and `Pipeline` objects (`research/experiments/pipelines/preprocessing.py`) to guarantee zero data leakage:
- **Numerical Imputation & Scaling:** Median imputation followed by standard scaling (`StandardScaler`), computed strictly on training folds.
- **Categorical Encoding:** Most frequent imputation followed by `OneHotEncoder(handle_unknown="ignore")` to prevent errors from unobserved test levels.
- **Outlier Capping:** Clinically informed clipping on numerical variables (pack-years $\le 150$, years smoked $\le 80$, BMI between $12.0$ and $70.0$).
- **Data Leakage Invariant:** All hyperparameter tuning and cross-validation operations fitted transformations inside the training folds of each split.

---

## 4. Experimental Results & Model Comparisons

### 4.1 EXP-01: COPD Phenotype Prediction

| Model | 5-Fold CV ROC-AUC | 5-Fold CV PR-AUC | Holdout ROC-AUC | Holdout PR-AUC | Sensitivity | Specificity | F1 Score | Brier Score | Training Time |
|---|---|---|---|---|---|---|---|---|---|
| **Logistic Regression Baseline** | **0.8695 ± 0.0040** | 0.4452 ± 0.0077 | **0.8614** | **0.4324** | **0.7712** | **0.8020** | **0.3824** | 0.1440 | 11.1s |
| Decision Tree | 0.8452 ± 0.0024 | 0.3866 ± 0.0060 | 0.8326 | 0.3658 | 0.7681 | 0.7702 | 0.3497 | 0.1536 | 8.1s |
| Random Forest | 0.8687 ± 0.0035 | 0.4464 ± 0.0066 | 0.8593 | 0.4301 | 0.7396 | 0.8268 | 0.3979 | 0.1321 | 23.0s |
| HistGradientBoosting (Tuned) | 0.8711 ± 0.0030 | 0.4548 ± 0.0088 | 0.8611 | 0.4375 | 0.7629 | 0.8002 | 0.3772 | 0.1400 | 52.2s |

**Selection Rationale:** While HistGradientBoosting marginally outperformed on training CV, Logistic Regression matched its holdout discrimination (ROC-AUC $0.8614$ vs $0.8611$), offered superior sensitivity ($0.7712$ vs $0.7629$), and provides linear odds ratios required for clinical explainability.

### 4.2 EXP-02: USPSTF Screening Non-Adherence Propensity

| Model | 5-Fold CV ROC-AUC | 5-Fold CV PR-AUC | Holdout ROC-AUC | Holdout PR-AUC | Sensitivity | Specificity | Precision | F1 Score | Brier Score |
|---|---|---|---|---|---|---|---|---|---|
| **Random Forest Classifier** | **0.9095 ± 0.0034** | **0.9903** | **0.9090** | **0.9903** | **0.7642** | **0.9909** | **0.9987** | **0.8659** | **0.1327** |
| Logistic Regression Baseline | 0.9098 ± 0.0029 | 0.9903 | 0.9085 | 0.9902 | 0.7680 | 0.9869 | 0.9982 | 0.8681 | 0.1356 |
| HistGradientBoosting | 0.9086 ± 0.0031 | 0.9902 | 0.9074 | 0.9901 | 0.7783 | 0.9737 | 0.9964 | 0.8740 | 0.1309 |
| Decision Tree | 0.9034 ± 0.0045 | 0.9871 | 0.9015 | 0.9868 | 0.7644 | 0.9919 | 0.9989 | 0.8660 | 0.1388 |

**Top Predictors of Non-Adherence:**
1. Lack of personal doctor (`PERSDOC3 == No`)
2. Delayed routine checkup recency (`CHECKUP1 == 5+ Years` or `Never`)
3. Healthcare cost barrier (`MEDCOST1 == Yes`)
4. Health insurance coverage gap (`_HLTHPLN == Uninsured`)
5. Former smoker quit duration (`_YRSQUIT`)

---

## 5. Demographic Subgroup Fairness Audits

### 5.1 EXP-01 Subgroup Audit (Holdout Set)
| Dimension | Subgroup | Sample Size ($N$) | Prevalence (%) | ROC-AUC | Sensitivity | Specificity |
|---|---|---|---|---|---|---|
| Biological Sex | Male | 11,290 | 7.29% | 0.8616 | 0.7582 | 0.8229 |
| Biological Sex | Female | 12,710 | 8.73% | 0.8603 | 0.7809 | 0.7831 |
| Race / Ethnicity | White | 17,336 | 8.70% | 0.8690 | 0.7971 | 0.7914 |
| Race / Ethnicity | Black | 1,860 | 8.17% | 0.8099 | 0.7105 | 0.7758 |
| Race / Ethnicity | Hispanic | 2,342 | 4.57% | 0.7986 | **0.4953** | 0.8729 |
| Race / Ethnicity | Asian | 755 | 1.85% | 0.7980 | **0.3571** | 0.9663 |
| Race / Ethnicity | American Indian / Alaska Native | 342 | 13.74% | 0.8542 | **0.8723** | 0.6915 |

**Critical Fairness Finding:** A single uniform decision threshold ($0.50$) produces significant sensitivity disparities in minoritized populations with lower base prevalence (e.g., Hispanic sensitivity $49.5\%$ vs White $79.7\%$). This confirms why raw ML models must not be deployed without clinical calibration and population-specific threshold tuning (Phase 2.3).

### 5.2 EXP-02 Subgroup Audit (Holdout Set)
| Dimension | Subgroup | Sample Size ($N$) | Prevalence (%) | ROC-AUC | Sensitivity | Specificity |
|---|---|---|---|---|---|---|
| Biological Sex | Female | 4,826 | 89.74% | 0.9103 | 0.7650 | 0.9899 |
| Biological Sex | Male | 5,465 | 90.96% | 0.9081 | 0.7636 | 0.9919 |
| Cost Barrier | No Cost Barrier | 9,526 | 90.23% | 0.9085 | 0.7684 | 0.9925 |
| Cost Barrier | Yes Cost Barrier | 740 | 92.16% | 0.9119 | 0.7170 | 0.9655 |
| Race / Ethnicity | White | 8,194 | 89.74% | 0.9056 | 0.7552 | 0.9929 |
| Race / Ethnicity | Black | 742 | 93.80% | 0.9240 | 0.8132 | 0.9783 |
| Race / Ethnicity | Hispanic | 442 | 93.67% | 0.9496 | 0.8454 | 0.9643 |
| Race / Ethnicity | Asian | 96 | 94.79% | 0.9055 | 0.8681 | 1.0000 |

---

## 6. Software Architecture & Clinical Isolation

- **Directory Boundary:** All machine learning code is housed exclusively in `research/experiments/`.
- **Zero Production Contamination:** An automated architectural regression test (`test_production_codebase_isolation`) scanned all TypeScript and TSX files in `src/` to confirm zero imports or references to experimental research code or serialized model files.
- **Model Serialization Governance:** Serialized artifacts (`.joblib`) are excluded from Git via `.gitignore`. Accompanying JSON metadata files explicitly tag `governance_status: "EXPERIMENTAL_RESEARCH_ONLY"` and enforce prohibited clinical use warnings.

---

## 7. Verification & Quality Gates

| Gate | Target | Result | Status |
|---|---|---|---|
| **Python ML Pipelines (Pytest)** | 100% Passing | 6 / 6 tests passing | Passed |
| **Vitest Platform Suite** | 100% Passing | 444 / 444 tests passing | Passed |
| **TypeScript Typecheck** | 0 Errors | 0 errors (`tsc --noEmit`) | Passed |
| **ESLint Static Analysis** | 0 Warnings | 0 warnings (`eslint`) | Passed |
| **Production Isolation Verification** | 0 Leaks | 0 experimental references in `src/` | Passed |

---

## 8. Transition Criteria to Phase 2.3

Phase 2.2 is complete. Progression to **Phase 2.3: Clinical Validation & External Benchmarking** is subject to explicit stakeholder review and approval. Phase 2.3 will address:
1. Clinical calibration curve assessment (Brier calibration and Platt scaling).
2. Subgroup-specific decision threshold optimization to address demographic sensitivity disparities.
3. External benchmarking against established clinical trial cohorts (NLST, NELSON).
4. Formal review by the Clinical Governance Committee before any recommendation logic is refined.

