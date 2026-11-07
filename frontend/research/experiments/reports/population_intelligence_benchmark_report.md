# Phase 2.8: Population-Level Intelligence Benchmark Report

**Status:** Completed & Governed  
**Date:** November 6, 2026  
**Governance Boundary:** Research Sandbox & Public Health Analytics. Non-diagnostic.

## 1. Executive Summary

This benchmark evaluated population risk-factor distributions, 95% Wilson confidence intervals, co-occurrence odds ratios, and privacy-preserving k-anonymity suppression effectiveness across the Lungent clinical cohort ($N = 5,000$).

## 2. Population Risk-Factor Prevalences

| Factor Code | Factor Name | Sample Count | Prevalence (%) | 95% Wilson CI |
|:---|:---|:---:|:---:|:---:|
| RF_CIGARETTE_SMOKING | Current Cigarette Smoking | 1,920 | 38.4% | [37.06%, 39.76%] |
| RF_BIDI_SMOKING | Hand-Rolled Bidi Smoking | 1,140 | 22.8% | [21.66%, 23.98%] |
| RF_SMOKELESS_TOBACCO | Smokeless Tobacco (Zarda/Gul) | 1,475 | 29.5% | [28.25%, 30.78%] |
| RF_BIOMASS_CHULA_COOKING | Household Biomass Smoke | 2,710 | 54.2% | [52.82%, 55.58%] |
| RF_OCCUPATIONAL_DUST | Occupational Respirable Dust | 730 | 14.6% | [13.65%, 15.61%] |
| RF_SECONDHAND_SMOKE | Secondhand Smoke Exposure | 2,155 | 43.1% | [41.73%, 44.48%] |
| RF_PRIOR_TB | Prior Tuberculosis History | 590 | 11.8% | [10.93%, 12.72%] |
| RF_CHRONIC_COPD | Diagnosed COPD | 810 | 16.2% | [15.2%, 17.25%] |

## 3. Top Co-Occurring Risk Factors & Odds Ratios

| Co-Occurring Pair | Joint Count | Joint Rate (%) | Odds Ratio |
|:---|:---:|:---:|:---:|
| Bidi Smoking + Biomass Chula | 869 | 17.38% | 3.53x |
| Cigarettes + Diagnosed COPD | 640 | 12.8% | 8.56x |

## 4. Privacy-Preserving k-Anonymity Verification (k = 5)

- **Threshold Enforced:** $k \ge 5$.
- **Cell Suppression Rule:** All sub-cells with $1 \le c < 5$ are masked with `< 5 [SUPPRESSED]`.
- **Zero Preservation:** Cell counts of zero are preserved as non-identifying.
- **Complementary Suppression:** Marginal cells protected against subtraction disclosure.

## 5. Clinical Safety & Governance Conclusions

1. **Non-Representativeness:** The Lungent cohort is a clinically ascertained convenience sample and must NOT be equated with Bangladesh's national population census.
2. **Non-Causal Associations:** Observed correlations describe public health patterns, not proven biological causation.
3. **No Disease Burden Equivalence:** User volume in a district does NOT equal true underlying cancer prevalence.
4. **Clinical Independence:** Population statistics must never alter individual risk classifications or suppress red-flag triage.
