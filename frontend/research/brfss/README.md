# Behavioral Risk Factor Surveillance System (BRFSS) Research Workspace

**Project:** Lungent — Intelligent Lung Health Assessment  
**Phase:** 2 — Advanced Intelligence & Expansion  
**Milestone:** 2.1 — BRFSS Research & Data Analysis  
**Environment:** Python 3.11 Virtual Environment (`research/brfss/venv`)  

---

## 1. Purpose & Scope

This research workspace provides reproducible exploratory analysis, data profiling, missingness analysis, survey-weighted descriptive statistics, and hypothesis formulation based on the US CDC Behavioral Risk Factor Surveillance System (BRFSS) 2022 dataset (`LLCP2022.XPT`).

> [!IMPORTANT]
> **Research-Only Scope:**
> All code and analyses in this module are strictly exploratory research. No predictive models are trained, no clinical claims are made, and no code from this directory is integrated into Lungent's production clinical decision workflows.

---

## 2. Directory Layout

```text
research/brfss/
├── data/
│   ├── raw/             # Raw CDC archives and .XPT files (git-ignored)
│   ├── interim/         # Extracted parquet and cached subsets (git-ignored)
│   └── processed/       # Summary statistics, variable dictionaries, profiles
├── scripts/             # Reproducible data acquisition, profiling, and analysis scripts
├── tests/               # Automated unit tests for research data loaders and weights
├── visualizations/      # Distribution plots, correlation heatmaps, missingness charts
├── documentation/       # Official CDC codebooks, variable definitions, survey methodology
└── README.md            # Research workspace documentation
```

---

## 3. Data Provenance & Official Source

- **Survey Year:** 2022 (Annual Public Use Data File)
- **Publishing Authority:** Centers for Disease Control and Prevention (CDC), US Department of Health and Human Services (HHS).
- **Primary Data File:** `LLCP2022XPT.zip` (SHA-256 verified) containing `LLCP2022.XPT` (~1.2 GB uncompressed SAS Transport format).
- **Core Population:** US civilian non-institutionalized adult population ($N = 445,132$ respondents across 50 states, DC, and 3 territories).
- **Complex Survey Parameters:** Strata (`_STSTR`), Primary Sampling Unit (`_PSU`), and Sample Weight (`_LLCPWT`).

