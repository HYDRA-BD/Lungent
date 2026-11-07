# Experimental AI/ML Model Development Workspace

**Project:** Lungent — Intelligent Lung Health Assessment  
**Phase:** 2 — Advanced Intelligence & Expansion  
**Milestone:** 2.2 — Experimental AI/ML Model Development  

---

## 1. Scope & Research Governance

> [!WARNING]
> **Strict Research Separation:**
> Models and pipelines in this directory are strictly experimental research artifacts.
> - **NO** model developed here is permitted for clinical diagnosis, patient risk calculation, screening eligibility, or symptom triage.
> - **NO** connection exists between this experimental workspace and Lungent's production clinical backend.
> - Direct supervised lung cancer prediction on BRFSS was evaluated in Phase 2.1 and **rejected as scientifically unsupported** due to lack of a core diagnosis label and severe survivorship bias in optional modules.

---

## 2. Completed Experiments

1. **EXP-01: Chronic Obstructive Pulmonary Disease (COPD) Phenotype Prediction**
   - **Target:** `CHCCOPD3` (Binary: 1=COPD, 0=No COPD)
   - **Sample:** $N = 407,858$ adults (Class Balance: $8.2\%$ positive)
   - **Algorithms:** Logistic Regression, Decision Tree, Random Forest, HistGradientBoosting
2. **EXP-02: USPSTF Lung Cancer Screening Non-Adherence Propensity**
   - **Target:** `_LCSREC == 2` (Binary: 1=Unscreened, 0=Screened in past year)
   - **Sample:** $N = 51,453$ high-risk eligible adults (Class Balance: $90.65\%$ unscreened)
   - **Algorithms:** Logistic Regression, Random Forest, HistGradientBoosting

---

## 3. Directory Layout

```text
research/experiments/
├── configs/              # Experiment configuration definitions
├── pipelines/            # Reusable, leakage-safe data transformation pipelines
├── scripts/              # Training, hyperparameter tuning, and evaluation scripts
├── artifacts/            # Model parameters, evaluation metrics, and metadata (JSON)
├── reports/              # Model comparison tables and fairness findings
├── tests/                # Automated pytest unit tests for ML pipelines
└── README.md
```

