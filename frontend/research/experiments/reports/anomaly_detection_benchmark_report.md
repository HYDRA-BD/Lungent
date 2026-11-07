# Phase 2.5: Unsupervised Anomaly Detection Research & Benchmark Report

**Status:** Completed & Validated
**Date:** November 6, 2026
**Governance Boundary:** Research Sandbox Only. Non-diagnostic.

## 1. Executive Summary

This benchmark investigated the efficacy of unsupervised machine learning (Isolation Forest, Elliptic Envelope, Local Outlier Factor) compared to deterministic clinical rules across multidimensional clinical vectors (Age, Pack-Years, BMI, Systolic BP, Diastolic BP).

## 2. Benchmark Evaluation Matrix

| method                                |   true_positives |   false_positives |   false_negatives |   true_negatives |   sensitivity |   specificity |   precision |   f1_score |   total_flagged |
|:--------------------------------------|-----------------:|------------------:|------------------:|-----------------:|--------------:|--------------:|------------:|-----------:|----------------:|
| Deterministic Clinical Rules          |               50 |                 0 |                 0 |             2000 |          1    |        1      |      1      |     1      |              50 |
| Isolation Forest                      |               44 |                 8 |                 6 |             1992 |          0.88 |        0.996  |      0.8462 |     0.8627 |              52 |
| Robust Covariance (Elliptic Envelope) |               50 |                 2 |                 0 |             1998 |          1    |        0.999  |      0.9615 |     0.9804 |              52 |
| Local Outlier Factor (LOF)            |               15 |                37 |                35 |             1963 |          0.3  |        0.9815 |      0.2885 |     0.2941 |              52 |

## 3. Methodological Conclusions & Architecture Recommendations

1. **Deterministic Rules Excel on Biological Invariants:** Conditions such as Systolic BP <= Diastolic BP or Pack-Years accumulated before birth are definitive mathematical/logical violations. Machine-learning algorithms miss some subtle boundary inversions (e.g., 75/80 mmHg) because both numbers individually look plausible to distance metrics.
2. **False-Positive Risk of Pure Unsupervised ML:** In healthcare, healthy extreme percentiles (e.g. an 82-year-old marathon runner with BMI 19 and 0 pack-years) are flagged by distance-based ML as outliers, producing alert fatigue for clinicians.
3. **Recommended Hybrid Architecture:** Deploy deterministic clinical rules for medical records, patient data, and screening invariants; deploy robust statistical metrics (MAD, Modified Z-score, Rolling Z) for environmental sensor telemetry and platform operational monitoring.
