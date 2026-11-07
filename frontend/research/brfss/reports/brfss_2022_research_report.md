# Comprehensive BRFSS 2022 Research & Statistical Analysis Report

**Project:** Lungent — Intelligent Lung Health Assessment  
**Phase:** 2 — Advanced Intelligence & Expansion  
**Milestone:** 2.1 — BRFSS Research & Data Analysis  
**Analytic Dataset:** CDC Behavioral Risk Factor Surveillance System (BRFSS) 2022 Annual Public Use File  
**Author:** Lead Epidemiologist & Quantitative Healthcare ML Researcher  
**Status:** Completed  
**Date:** November 2026  

---

## 1. Executive Summary

This research study conducts an in-depth exploratory analysis, variable inventory, missingness audit, complex survey-weighted statistical investigation, and clinical suitability assessment of the US Centers for Disease Control and Prevention (CDC) **Behavioral Risk Factor Surveillance System (BRFSS) 2022** dataset ($N = 445,132$ respondents, representing $264,789,594$ non-institutionalized US adults across 54 states and territories).

### Core Research Findings & Epidemiological Invariants:
1. **Critical Lung Cancer Research Suitability Assessment:**
   - The BRFSS core questionnaire **does NOT contain a dedicated, confirmed lung cancer diagnosis outcome**. The core cancer variables distinguish only skin cancer (`CHCSCNC1`) from general other cancers (`CHCOCNC1`).
   - The optional Cancer Survivorship Module 9 queries specific cancer type (`CNCRTYP2`), where Code 14 denotes Lung Cancer. However, this module was administered only in participating states to self-reported cancer survivors, yielding only **$n = 451$ lung cancer survivors ($0.10\%$ of total sample; $94.9\%$ missingness)**.
   - **Conclusion on Predictive Modeling:** The BRFSS dataset is **strictly UNSUITABLE** for training supervised predictive models for lung cancer diagnosis or clinical risk prediction due to severe survivorship bias (aggressive fatal cases excluded), massive structural missingness, and absence of histological confirmation.
2. **Empirical Utility for Tobacco & Comorbidity Modeling:**
   - BRFSS 2022 is an exceptional resource for **population-level tobacco exposure modeling** (`_PACKYRS`, `_YRSSMOK`, `_PACKDAY`, `_YRSQUIT`, `_SMOKGRP`), with continuous pack-years quantified for $n = 138,200$ individuals (weighted mean: $19.14 \pm 21.42$, weighted median: $12.0$).
   - **34.76%** ($n = 55,078$) of smokers meet or exceed the $\ge 20$ pack-year USPSTF 2021 screening threshold.
3. **Chronic Respiratory Disease Associations:**
   - Weighted self-reported COPD prevalence (`CHCCOPD3`) scales monotonically with tobacco exposure:
     - Daily Smokers: **19.84%** ($n = 8,224$)
     - Some-Day Smokers: **13.12%** ($n = 2,105$)
     - Former Smokers: **11.14%** ($n = 14,336$)
     - Never Smokers: **3.01%** ($n = 8,444$)
     - Association is statistically robust ($\chi^2 = 21,881.86, \text{df} = 3, p < 10^{-300}$).
   - In survey-weighted multivariable logistic regression, every 10 pack-years of tobacco exposure confers an adjusted Odds Ratio for COPD of **1.336** ($95\%\text{ CI: } 1.336 - 1.337, p < 0.0001$), independent of age and sex.
4. **Profound Lung Cancer Screening Under-Utilization Gap:**
   - In Core Section 13, among $n = 51,453$ individuals meeting USPSTF 2021 lung cancer screening criteria (`_LCSREC`), **only 9.35%** (weighted, $n = 4,943$) received an annual screening chest CT scan (`LCSSCNCR`), leaving **90.65%** ($n = 46,510$, representing over 21 million high-risk individuals) unscreened.
5. **Bangladesh External Validity Boundary:**
   - BRFSS is sampled exclusively from US telephone respondents. It lacks coverage of hand-rolled *bidis*, high-tar non-filtered tobacco, indoor biomass fuel cooking smoke, ambient South Asian $\text{PM}_{2.5}$ exposure, and local healthcare financing models. BRFSS statistical distributions **cannot be transferred directly to Bangladesh** without independent local calibration.

---

## 2. Dataset Identification & Provenance

| Parameter | Specification |
| :--- | :--- |
| **Official Name** | Behavioral Risk Factor Surveillance System (BRFSS) 2022 Public Use Data File |
| **Publishing Organization** | Centers for Disease Control and Prevention (CDC), NCCDPHP |
| **Survey Year** | 2022 (Data collected January 2022 – January 2023; Released October 2023) |
| **Primary Archive** | `LLCP2022XPT.zip` (SHA-256: `b6319c949b7289f8020fc903c3c2d38fe7e0b28ad703dcd81547f5cd0c0dcfeb`) |
| **Extracted File** | `LLCP2022.XPT` (SAS Transport V5 Format; SHA-256: `a65fc471134c04c136294055a9b0d2b1ecd1dec54b7675d1b8408a784e6e8ba4`) |
| **File Size** | 1,160,060,640 bytes (1,106.32 MB uncompressed; 80.69 MB compressed) |
| **Sample Size (N)** | 445,132 individual respondents |
| **Variable Count** | 328 variables |
| **Geographic Scope** | All 50 US States, District of Columbia, Guam, Puerto Rico, US Virgin Islands (54 jurisdictions) |
| **Primary Sampling Units** | 26,152 PSUs (`_PSU`) |
| **Sampling Strata** | 2,263 Strata (`_STSTR`) |
| **Final Weight Variable** | `_LLCPWT` (Weighted population representation: $264,789,594$ US adults) |

---

## 3. BRFSS Survey Methodology & Complex Sampling Design

BRFSS is a continuous, state-based, random-digit-dialed (RDD) telephone survey monitoring health-related risk behaviors, chronic health conditions, and preventive service use among non-institutionalized US civilian adults aged 18 years and older.

### 3.1 Dual-Frame Sampling
- **Landline Frame:** Disproportionate stratified sampling (DSS) dividing telephone numbers into high-density and medium-density blocks.
- **Cellular Phone Frame:** Random digit dialing from dedicated cellular 1,000-blocks. One adult is interviewed per cellular contact.
- In 2022, cellular phone interviews accounted for the majority of completed interviews, correcting for historical landline-only coverage bias among younger and lower-income demographics.

### 3.2 Post-Stratification Weighting (`_LLCPWT`)
- Raw sample frequencies **do not** reflect national or state population prevalence due to unequal selection probabilities, non-response, and telephone non-coverage.
- The CDC applies an advanced iterative proportional fitting ("raking") algorithm across:
  - Age group by biological sex
  - Race and ethnicity categories
  - Educational attainment
  - Marital status
  - Home ownership
  - Telephone ownership category
- **Statistical Rule:** All population inferences and epidemiological estimates must use `_LLCPWT` and account for complex clustering (`_PSU`) and stratification (`_STSTR`).

---

## 4. Research-Relevant Feature Inventory & Data Profiling

The dataset's 328 variables were categorized into 6 functional research domains in [`research/brfss/data/processed/features_inventory.json`](file:///Users/kazi/Projects/Lungent/research/brfss/data/processed/features_inventory.json):

```
+---------------------------------------------------------------------------------------+
| BRFSS 2022 Core Research Domains (445,132 Rows x 328 Columns)                        |
+---------------------------------------------------------------------------------------+
|  Demographics (13 vars)   --> _STATE, _AGEG5YR, SEXVAR, _RACE1, EDUCA, _INCOMG1       |
|  Tobacco Exposure (17)    --> SMOKE100, SMOKDAY2, _SMOKER3, _PACKYRS, _YRSSMOK        |
|  Respiratory & Health (21)--> CHCCOPD3, ASTHMA3, COPDCOGH, COPDFLEM, _BMI5, GENHLTH   |
|  Cancer Variables (8)     --> CHCSCNC1, CHCOCNC1, CNCRTYP2, CSRVTRT3                 |
|  Screening Receipt (9)    --> LCSSCNCR, _LCSREC, LCSTSC1, LCSCTWHN, PERSDOC3          |
|  Survey Design (9)        --> _STSTR, _PSU, _LLCPWT, FMONTH, SEQNO                   |
+---------------------------------------------------------------------------------------+
```

### Table 1: Key Research Variables Profile

| Variable | CDC Label | Domain | Non-Null (N) | Non-Null (%) | Analytic Coding / Interpretation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `_LLCPWT` | Final weight: landline and cell | Survey Design | 445,132 | 100.0% | Continuous positive survey weight ($\sum w = 264.8\text{M}$) |
| `_STATE` | State FIPS Code | Demographics | 445,132 | 100.0% | 54 geographic jurisdictions |
| `_AGEG5YR` | Fourteen-level age category | Demographics | 445,132 | 100.0% | 1=18-24 ... 13=80+, 14=Missing |
| `SEXVAR` | Sex of Respondent | Demographics | 445,132 | 100.0% | 1=Male (48.4%), 2=Female (51.6%) |
| `_RACE1` | Computed Race-Ethnicity | Demographics | 445,132 | 100.0% | 1=White, 2=Black, 3=AI/AN, 4=Asian, 8=Hispanic |
| `_SMOKER3` | Computed Smoking Status | Tobacco | 445,132 | 100.0% | 1=Daily (8.1%), 2=Some days (3.5%), 3=Former (21.9%), 4=Never (57.1%) |
| `_PACKYRS` | Years smoked packs per day | Tobacco | 142,865 | 32.1% | Continuous pack-years (Median: 12.0, IQR: 21.0) |
| `_YRSSMOK` | Number of years smoked | Tobacco | 142,865 | 32.1% | Duration of regular smoking (years) |
| `_YRSQUIT` | Years since quit smoking | Tobacco | 101,472 | 22.8% | Cessation interval (years) |
| `CHCCOPD3` | Ever told had C.O.P.D. | Respiratory | 445,130 | 100.0% | 1=Yes (8.0% weighted), 2=No (92.0%) |
| `ASTHMA3` | Ever told had asthma | Respiratory | 445,130 | 100.0% | 1=Yes (14.2% weighted), 2=No (85.8%) |
| `_BMI5` | Computed Body Mass Index | Health Status | 409,240 | 91.9% | Continuous BMI with 2 implied decimals |
| `_LCSREC` | Lung cancer screening status | Screening | 51,453 | 11.6% | 1=Met USPSTF & Screened (9.35%), 2=Unscreened (90.65%) |
| `LCSSCNCR` | CT scan for lung cancer | Screening | 165,575 | 37.2% | 1=Yes, 2=No (Chest CT scan in past year) |
| `CNCRTYP2` | Type of cancer | Cancer | 22,544 | 5.1% | 14=Lung ($n=451$), 5=Breast ($n=2,908$), 20=Prostate ($n=1,826$) |

---

## 5. Lung Cancer Research Suitability Assessment

A core objective of Milestone 2.1 is evaluating whether BRFSS can meaningfully support Lungent's lung cancer predictive modeling or clinical risk estimation.

### Table 2: Research Suitability Matrix

| Research Objective | Required Information | Available Variables | Suitability | Methodological Justification & Limitations |
| :--- | :--- | :--- | :--- | :--- |
| **Tobacco Exposure Modeling** | Lifetime pack-years, intensity, duration, cessation | `_PACKYRS`, `_YRSSMOK`, `_PACKDAY`, `_YRSQUIT`, `_SMOKGRP` | **HIGH** | Robust continuous variables; enables population distribution benchmarking for Lungent's pack-year calculators. Self-report recall bias. |
| **USPSTF Screening Adherence** | LDCT scan receipt in USPSTF 2021 eligible cohort | `_LCSREC`, `LCSSCNCR`, `_SMOKGRP` | **VERY HIGH** | Explicit computed guideline variable for 50-80yo cohort with 20+ pack-years. Uncovers massive real-world under-screening. |
| **Respiratory Comorbidities** | COPD, Emphysema, Asthma, chronic cough/phlegm | `CHCCOPD3`, `ASTHMA3`, `COPDCOGH`, `COPDFLEM` | **HIGH** | 100% core coverage for COPD and Asthma. Symptoms module is state-optional. Lacks spirometry validation. |
| **Supervised Lung Cancer Prediction** | Confirmed incident/prevalent lung cancer diagnosis label | `CNCRTYP2` (Code 14 = Lung, $N = 451$ out of 445K) | **UNSUITABLE** | **CRITICAL LIMITATION:** Core BRFSS does not separate lung cancer. Optional Module 9 captures only 451 survivors ($0.10\%$). Severe survivorship bias excludes non-survivors. Cannot serve as machine learning ground truth. |
| **Direct Application to Bangladesh** | Representative South Asian exposures and genetics | None (US civilian adults only) | **UNSUITABLE** | **EXTERNAL VALIDITY BARRIER:** US demographics cannot be transferred directly to Bangladesh. Omits bidi smoking, biomass fuel cooking smoke, and local health financing. |

---

## 6. Missing Data & Questionnaire Skip Routing Analysis

Missingness in BRFSS is structured and largely driven by questionnaire routing rather than random attrition:

### 6.1 Typology of Non-Response
1. **Core Universal Variables (<1% Missing):** `_STATE` (0%), `SEXVAR` (0%), `_AGEG5YR` (0%), `SMOKE100` (0.01%), `CHCCOPD3` (0.01%).
2. **Structural Skips (Questionnaire Logic):**
   - `SMOKDAY2` (Current smoking frequency) is only asked if `SMOKE100 == 1` (smoked 100+ cigarettes). For the 245,955 never-smokers, `SMOKDAY2` is blank in **100.0%** ($n = 245,954$) of records, exactly conforming to protocol.
   - `_PACKYRS` is blank for $67.9\%$ of respondents because Section 13 is only administered to individuals routed into the screening/tobacco questionnaire.
3. **Refused (`9/99/999`) and Don't Know (`7/77/777`):**
   - Income (`_INCOMG1`): $16.7\%$ refused or don't know.
   - Physical Health Days (`PHYSHLTH`): $2.2\%$ don't know, $0.8\%$ refused.
4. **State-Optional Modules:**
   - Cancer Survivorship (`CNCRTYP2`): $94.9\%$ blank due to non-adoption by non-participating states and non-cancer status.

---

## 7. Statistical & Survey-Weighted Analysis

### 7.1 Adult Smoking Prevalence in the US (2022)
- **Never Smokers:** $57.07\%$ weighted ($n = 245,955$)
- **Former Smokers:** $21.87\%$ weighted ($n = 113,774$)
- **Daily Smokers:** $8.09\%$ weighted ($n = 36,003$)
- **Some-Day Smokers:** $3.54\%$ weighted ($n = 13,938$)
- **Unclassified / Refused:** $9.44\%$ weighted ($n = 35,462$)

### 7.2 Cumulative Tobacco Dose Distribution (`_PACKYRS`)
- Among $n = 138,200$ respondents with valid tobacco exposure history:
  - **Weighted Mean:** $19.14$ pack-years ($\text{SD} = 21.42$)
  - **Weighted Median:** $12.00$ pack-years
  - **25th Percentile:** $5.00$ pack-years
  - **75th Percentile:** $26.00$ pack-years
  - **90th Percentile:** $46.00$ pack-years
  - **High-Exposure Cohort ($\ge 20$ Pack-Years):** **34.76%** of smoking respondents ($n = 55,078$) satisfy the USPSTF cumulative exposure threshold.

### 7.3 Chronic Obstructive Pulmonary Disease (COPD) Gradients
Cross-tabulation of smoking status against self-reported COPD (`CHCCOPD3`) demonstrated a stark gradient:
- Daily Smokers: **19.84%** weighted prevalence ($n = 8,224 / 35,719$)
- Some-Day Smokers: **13.12%** weighted prevalence ($n = 2,105 / 13,831$)
- Former Smokers: **11.14%** weighted prevalence ($n = 14,336 / 113,227$)
- Never Smokers: **3.01%** weighted prevalence ($n = 8,444 / 245,071$)
- **Statistical Significance:** Pearson $\chi^2 = 21,881.86, \text{df} = 3, p < 10^{-300}$.

### 7.4 Survey-Weighted Multivariable Logistic Regression
Modeling the odds of self-reported COPD as a function of cumulative pack-years, chronological age, and biological sex:

$$\operatorname{logit}(P(\text{COPD})) = \beta_0 + \beta_1 \left(\frac{\text{Pack-Years}}{10}\right) + \beta_2 (\text{Age Group}) + \beta_3 (\text{Female})$$

| Covariate | Adjusted Odds Ratio (aOR) | 95% Confidence Interval | $z$-statistic | $p$-value |
| :--- | :--- | :--- | :--- | :--- |
| **Pack-Years (per 10 years)** | **1.336** | **1.336 – 1.337** | 214.2 | $< 0.0001$ |
| **Age Category (per 5y bracket)** | **1.130** | **1.130 – 1.131** | 105.8 | $< 0.0001$ |
| **Biological Sex (Female vs Male)** | **1.729** | **1.727 – 1.732** | 188.5 | $< 0.0001$ |

*Interpretation:* Each 10-pack-year increment in tobacco consumption increases the odds of diagnosed COPD by **33.6%**, independent of age and sex.

---

## 8. Research Hypotheses Register

The statistical findings yield four formal, testable hypotheses for subsequent research phases:

1. **HYP-01 (Tobacco Dose-Response & Comorbidity):**
   - *Hypothesis:* Cumulative tobacco exposure measured in pack-years exhibits a monotonic, supra-linear association with obstructive airway disease across populations.
   - *Testable Prediction:* Bangladesh cohorts will demonstrate a left-shifted dose-response curve, where equivalent airway obstruction occurs at lower pack-years due to unfiltered bidi smoking.
2. **HYP-02 (Screening Implementation Gap):**
   - *Hypothesis:* Fewer than 15% of asymptomatic individuals meeting clinical guidelines for lung cancer screening receive annual LDCT scans.
   - *Empirical Basis:* BRFSS 2022 confirms **9.35%** adherence. In Bangladesh, where CT access is concentrated in divisional centers, adherence is projected to be $< 2\%$.
3. **HYP-03 (Persistent Comorbidity Post-Cessation):**
   - *Hypothesis:* Former smokers retain significantly elevated respiratory morbidity ($> 3.5\times$ never-smokers) even decades after quitting, validating Lungent's clinical invariant that former smoking status must never suppress symptom triage.
4. **HYP-04 (Biomass Fuel Exposure Disparity in Non-Smoking Females):**
   - *Hypothesis:* In South Asian populations exposed to unvented indoor biomass fuel (wood/dung/chula), non-smoking females experience chronic respiratory symptoms at rates comparable to moderate tobacco smokers.

---

## 9. Bangladesh Applicability & External Validity Analysis

| Dimension | US Population (BRFSS 2022) | Bangladesh Context (Lungent Focus) | Research Implication |
| :--- | :--- | :--- | :--- |
| **Tobacco Modality** | Commercial manufactured filtered cigarettes, e-cigarettes | Hand-rolled *bidis*, non-filtered commercial cigarettes, *hookah*, smokeless (*zarda*, *gul*) | Bidi deliver higher tar, nicotine, and carbon monoxide per gram of tobacco. US pack-year conversions must be calibrated. |
| **Cooking & Indoor Air** | Electricity, natural gas ($> 95\%$) | Biomass fuels (wood, dry leaves, cow dung) in traditional *chulas* in $> 65\%$ rural homes | Heavy indoor particulate pollution causes non-tobacco chronic obstructive lung disease in women. |
| **Ambient Air Quality** | US EPA median $\text{PM}_{2.5} < 12\,\mu\text{g/m}^3$ | Bangladesh winter $\text{PM}_{2.5} > 150-250\,\mu\text{g/m}^3$ (hazardous) | Chronic high ambient exposure accelerates background airway damage. |
| **Healthcare Financing** | Medicare, Medicaid, private health insurance ($> 90\%$ insured) | $> 65\%$ out-of-pocket health expenditures; no universal insurance | Financial toxicity prevents voluntary asymptomatic LDCT screening; triage must be symptom- and risk-stratified. |
| **Diagnostic Infrastructure**| High-density CT availability across community hospitals | Concentrated in tertiary medical colleges and private divisional centers | Triage must route patients to verified facilities with demonstrated scanner capabilities. |

---

## 10. Recommendations for Subsequent Phase 2 Milestones

1. **Phase 2.2 (Experimental AI/ML Model Development):**
   - **Do NOT attempt supervised lung cancer prediction using BRFSS.**
   - Focus experimental ML on:
     a) Tobacco consumption progression and pack-year trajectory estimation.
     b) Multi-comorbidity risk clustering (COPD, diabetes, hypertension, cardiovascular).
     c) Screening non-adherence risk propensity modeling.
2. **Supplementary Dataset Acquisition:**
   - Ingest dedicated lung cancer screening and diagnostic registries (such as the National Lung Screening Trial [NLST] or PLCO trial datasets) where biopsy-proven histological cancer diagnoses are recorded.
3. **Bangladesh Calibration Data:**
   - Incorporate the Bangladesh Demographic and Health Survey (BDHS) and Global Adult Tobacco Survey (GATS Bangladesh) for national tobacco prevalence and biomass fuel exposure benchmarks.

---

## 11. Official Document References

1. Centers for Disease Control and Prevention (CDC). *2022 Behavioral Risk Factor Surveillance System Questionnaire*. Atlanta, GA: US Department of Health and Human Services, CDC; 2022.
2. Centers for Disease Control and Prevention (CDC). *BRFSS 2022 Survey Data Codebook (`codebook22_llcp-v2-508`)*. Atlanta, GA: CDC; 2023.
3. Centers for Disease Control and Prevention (CDC). *Overview of the 2022 BRFSS (`Overview_2022-508.pdf`)*. Atlanta, GA: CDC; 2023.
4. US Preventive Services Task Force (USPSTF). Screening for Lung Cancer: US Preventive Services Task Force Recommendation Statement. *JAMA*. 2021;325(10):962–970.

