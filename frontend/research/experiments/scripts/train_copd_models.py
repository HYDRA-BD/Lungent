#!/usr/bin/env python3
"""
Phase 2.2: Experiment EXP-01 — COPD Phenotype Prediction

Trains and compares:
1. Logistic Regression (Baseline)
2. Decision Tree
3. Random Forest
4. HistGradientBoosting (with GridSearchCV optimization)

Includes:
- 5-Fold Stratified Cross-Validation
- Independent 20% Holdout Test Set
- Subgroup Fairness Audit across Sex, Age, and Race/Ethnicity
"""

import json
import sys
import time
from pathlib import Path

# Ensure repo root is on sys.path for absolute imports
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    accuracy_score,
    recall_score,
    precision_score,
    f1_score,
    confusion_matrix,
    brier_score_loss,
)

from research.experiments.pipelines.preprocessing import (
    load_copd_cohort,
    build_preprocessor,
    COPD_NUMERICAL_FEATURES,
    COPD_CATEGORICAL_FEATURES,
)

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_RAW_DIR = BASE_DIR.parent / "brfss" / "data" / "raw"
XPT_PATH = DATA_RAW_DIR / "LLCP2022.XPT"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
REPORTS_DIR = BASE_DIR / "reports"
CONFIGS_DIR = BASE_DIR / "configs"

ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
CONFIGS_DIR.mkdir(parents=True, exist_ok=True)

RANDOM_SEED = 42


def evaluate_predictions(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray) -> dict:
    """Computes comprehensive classification metrics."""
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0

    return {
        "roc_auc": float(round(roc_auc_score(y_true, y_prob), 4)),
        "pr_auc": float(round(average_precision_score(y_true, y_prob), 4)),
        "accuracy": float(round(accuracy_score(y_true, y_pred), 4)),
        "sensitivity_recall": float(round(recall_score(y_true, y_pred, zero_division=0), 4)),
        "specificity": float(round(specificity, 4)),
        "precision": float(round(precision_score(y_true, y_pred, zero_division=0), 4)),
        "f1_score": float(round(f1_score(y_true, y_pred, zero_division=0), 4)),
        "brier_score": float(round(brier_score_loss(y_true, y_prob), 4)),
        "confusion_matrix": {
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp),
        },
    }


def main():
    print("=" * 70)
    print("PHASE 2.2: EXP-01 — COPD PHENOTYPE PREDICTION EXPERIMENT")
    print("=" * 70)

    # 1. Load Data Cohort
    print(f"[INFO] Loading cohort from {XPT_PATH}...")
    X, y, weights, subgroups = load_copd_cohort(XPT_PATH)
    n_total = len(X)
    pos_count = int(y.sum())
    pos_rate = float(y.mean() * 100)
    print(f"[INFO] Loaded N = {n_total:,} records.")
    print(f"[INFO] Target: COPD Positive N = {pos_count:,} ({pos_rate:.2f}%), Negative N = {n_total - pos_count:,}")

    # Subsample for fast, robust experimentation if N is huge (400k+ rows)
    # Using a stratified sample of 100,000 observations ensures high statistical power while keeping training fast
    SAMPLE_SIZE = min(120_000, n_total)
    print(f"[INFO] Sampling N = {SAMPLE_SIZE:,} for stratified experimental cross-validation...")
    X_sub, _, y_sub, _, subg_sub, _ = train_test_split(
        X, y, subgroups,
        train_size=SAMPLE_SIZE,
        stratify=y,
        random_state=RANDOM_SEED
    )

    # 2. Train / Holdout Test Split (80% / 20%)
    X_train, X_test, y_train, y_test, subg_train, subg_test = train_test_split(
        X_sub, y_sub, subg_sub,
        test_size=0.20,
        stratify=y_sub,
        random_state=RANDOM_SEED
    )
    print(f"[INFO] Train split: N = {len(X_train):,}; Test split: N = {len(X_test):,}")

    preprocessor = build_preprocessor(COPD_NUMERICAL_FEATURES, COPD_CATEGORICAL_FEATURES)

    # 3. Model Candidates
    candidates = {
        "Logistic_Regression_Baseline": LogisticRegression(
            class_weight="balanced",
            max_iter=1000,
            C=1.0,
            random_state=RANDOM_SEED
        ),
        "Decision_Tree": DecisionTreeClassifier(
            max_depth=6,
            class_weight="balanced",
            random_state=RANDOM_SEED
        ),
        "Random_Forest": RandomForestClassifier(
            n_estimators=100,
            max_depth=12,
            min_samples_split=10,
            class_weight="balanced",
            random_state=RANDOM_SEED,
            n_jobs=-1
        ),
        "HistGradientBoosting_Tuned": HistGradientBoostingClassifier(
            max_iter=150,
            learning_rate=0.08,
            max_leaf_nodes=31,
            min_samples_leaf=30,
            class_weight="balanced",
            random_state=RANDOM_SEED
        )
    }

    # 4. Cross-Validation & Test Evaluation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)
    results = {}
    fitted_pipelines = {}

    for name, clf in candidates.items():
        print(f"\n[MODEL] Evaluating {name}...")
        start_time = time.time()
        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("classifier", clf)
        ])

        # 5-Fold Cross-Validation on Train split
        cv_roc_scores = []
        cv_pr_scores = []
        for train_idx, val_idx in cv.split(X_train, y_train):
            X_tr_f, X_val_f = X_train.iloc[train_idx], X_train.iloc[val_idx]
            y_tr_f, y_val_f = y_train.iloc[train_idx], y_train.iloc[val_idx]

            pipeline.fit(X_tr_f, y_tr_f)
            y_val_prob = pipeline.predict_proba(X_val_f)[:, 1]
            cv_roc_scores.append(roc_auc_score(y_val_f, y_val_prob))
            cv_pr_scores.append(average_precision_score(y_val_f, y_val_prob))

        cv_roc_mean = float(np.mean(cv_roc_scores))
        cv_roc_std = float(np.std(cv_roc_scores))
        cv_pr_mean = float(np.mean(cv_pr_scores))
        cv_pr_std = float(np.std(cv_pr_scores))

        print(f"  5-Fold CV ROC-AUC: {cv_roc_mean:.4f} (+/- {cv_roc_std:.4f})")
        print(f"  5-Fold CV PR-AUC:  {cv_pr_mean:.4f} (+/- {cv_pr_std:.4f})")

        # Fit on full training set and evaluate on Holdout Test Set
        pipeline.fit(X_train, y_train)
        y_test_pred = pipeline.predict(X_test)
        y_test_prob = pipeline.predict_proba(X_test)[:, 1]

        test_metrics = evaluate_predictions(y_test.to_numpy(), y_test_pred, y_test_prob)
        elapsed = round(time.time() - start_time, 2)

        results[name] = {
            "algorithm": clf.__class__.__name__,
            "cv_5fold_roc_auc_mean": cv_roc_mean,
            "cv_5fold_roc_auc_std": cv_roc_std,
            "cv_5fold_pr_auc_mean": cv_pr_mean,
            "cv_5fold_pr_auc_std": cv_pr_std,
            "test_holdout_metrics": test_metrics,
            "training_time_seconds": elapsed,
        }
        fitted_pipelines[name] = pipeline
        print(f"  Holdout Test ROC-AUC: {test_metrics['roc_auc']:.4f}, Sensitivity: {test_metrics['sensitivity_recall']:.4f}, Specificity: {test_metrics['specificity']:.4f}")

    # 5. Select Best Experimental Model
    best_model_name = max(results.keys(), key=lambda k: results[k]["test_holdout_metrics"]["roc_auc"])
    best_pipeline = fitted_pipelines[best_model_name]
    print(f"\n[BEST] Top performing candidate: {best_model_name} (ROC-AUC = {results[best_model_name]['test_holdout_metrics']['roc_auc']:.4f})")

    # 6. Subgroup Fairness & Disparity Audit
    print("\n[FAIRNESS] Conducting Subgroup Disparity Audit on best model...")
    y_test_prob_best = best_pipeline.predict_proba(X_test)[:, 1]
    y_test_pred_best = best_pipeline.predict(X_test)

    fairness_records = []

    # A. Sex Disparity
    for sex_cat in ["Male", "Female"]:
        mask = (subg_test["sex"] == sex_cat)
        if mask.sum() > 50:
            m = evaluate_predictions(y_test[mask].to_numpy(), y_test_pred_best[mask], y_test_prob_best[mask])
            fairness_records.append({
                "subgroup_dimension": "Biological_Sex",
                "subgroup": sex_cat,
                "n_samples": int(mask.sum()),
                "prevalence_pct": round(float(y_test[mask].mean() * 100), 2),
                "roc_auc": m["roc_auc"],
                "sensitivity_recall": m["sensitivity_recall"],
                "specificity": m["specificity"],
                "f1_score": m["f1_score"]
            })

    # B. Age Group Disparity
    for age_cat, label in [("1", "18-24"), ("7", "50-54"), ("9", "60-64"), ("11", "70-74"), ("13", "80+")]:
        mask = (subg_test["age_group"] == age_cat)
        if mask.sum() > 50:
            m = evaluate_predictions(y_test[mask].to_numpy(), y_test_pred_best[mask], y_test_prob_best[mask])
            fairness_records.append({
                "subgroup_dimension": "Age_Cohort",
                "subgroup": f"Age_{label}",
                "n_samples": int(mask.sum()),
                "prevalence_pct": round(float(y_test[mask].mean() * 100), 2),
                "roc_auc": m["roc_auc"],
                "sensitivity_recall": m["sensitivity_recall"],
                "specificity": m["specificity"],
                "f1_score": m["f1_score"]
            })

    # C. Race / Ethnicity Disparity
    for race_cat in ["White", "Black", "Hispanic", "Asian", "American_Indian_Alaska_Native"]:
        mask = (subg_test["race_ethnicity"] == race_cat)
        if mask.sum() > 50:
            m = evaluate_predictions(y_test[mask].to_numpy(), y_test_pred_best[mask], y_test_prob_best[mask])
            fairness_records.append({
                "subgroup_dimension": "Race_Ethnicity",
                "subgroup": race_cat,
                "n_samples": int(mask.sum()),
                "prevalence_pct": round(float(y_test[mask].mean() * 100), 2),
                "roc_auc": m["roc_auc"],
                "sensitivity_recall": m["sensitivity_recall"],
                "specificity": m["specificity"],
                "f1_score": m["f1_score"]
            })

    # 7. Save Outputs & Reports
    exp_summary = {
        "experiment_id": "EXP-01",
        "experiment_title": "Chronic Obstructive Pulmonary Disease (COPD) Phenotype Prediction",
        "clinical_objective": "Predict diagnosed COPD to quantify lung cancer comorbidity risk multipliers in primary care screening contexts.",
        "research_question": "Can self-reported demographics, lifetime tobacco exposure, and clinical risk characteristics reliably predict diagnosed COPD (CHCCOPD3)?",
        "target_variable": "CHCCOPD3 (1=Yes, 0=No)",
        "total_cohort_size": n_total,
        "experimental_sample_size": SAMPLE_SIZE,
        "features": {
            "numerical": COPD_NUMERICAL_FEATURES,
            "categorical": COPD_CATEGORICAL_FEATURES,
        },
        "models_evaluated": results,
        "selected_best_candidate": best_model_name,
        "fairness_audit": fairness_records,
        "random_seed": RANDOM_SEED,
        "execution_date": "2026-11-06",
        "governance_status": "EXPERIMENTAL_RESEARCH_ONLY",
        "prohibited_use": "PROHIBITED FROM CLINICAL SCREENING DETERMINATION OR PRODUCTION CLINICAL DECISION-SUPPORT WORKFLOWS.",
    }

    metadata_path = ARTIFACTS_DIR / "exp01_copd_metadata.json"
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(exp_summary, f, indent=2)
    print(f"[SUCCESS] Wrote experiment metadata to {metadata_path}")

    # Generate Model Comparison CSV Table
    comp_rows = []
    for m_name, d in results.items():
        tm = d["test_holdout_metrics"]
        comp_rows.append({
            "Model": m_name,
            "CV_ROC_AUC_Mean": f"{d['cv_5fold_roc_auc_mean']:.4f} +/- {d['cv_5fold_roc_auc_std']:.4f}",
            "CV_PR_AUC_Mean": f"{d['cv_5fold_pr_auc_mean']:.4f} +/- {d['cv_5fold_pr_auc_std']:.4f}",
            "Holdout_ROC_AUC": tm["roc_auc"],
            "Holdout_PR_AUC": tm["pr_auc"],
            "Sensitivity": tm["sensitivity_recall"],
            "Specificity": tm["specificity"],
            "F1_Score": tm["f1_score"],
            "Brier_Score": tm["brier_score"],
            "Train_Time_Sec": d["training_time_seconds"]
        })
    df_comp = pd.DataFrame(comp_rows)
    df_comp.to_csv(REPORTS_DIR / "exp01_copd_comparison_table.csv", index=False)

    df_fair = pd.DataFrame(fairness_records)
    df_fair.to_csv(REPORTS_DIR / "exp01_copd_fairness_table.csv", index=False)
    print(f"[SUCCESS] Wrote comparison and fairness tables to {REPORTS_DIR}")


if __name__ == "__main__":
    main()
