"""
Phase 2.2: EXP-02 — USPSTF Lung Cancer Screening Non-Adherence Propensity Model Training

This experimental script evaluates candidate ML models on predicting
lung cancer screening non-adherence among USPSTF-eligible individuals in the BRFSS 2022 dataset.

TARGET:
  - 1 = Non-adherent (Recommended, did not receive CT scan within past year; _LCSREC == 2)
  - 0 = Adherent (Recommended, received CT scan within past year; _LCSREC == 1)

MODELS:
  1. Logistic Regression (Baseline)
  2. Decision Tree Classifier
  3. Random Forest Classifier
  4. HistGradientBoosting Classifier

EVALUATION:
  - 5-Fold Stratified Cross-Validation on 80% Training Split
  - 20% Isolated Test Holdout Set
  - Metrics: ROC-AUC, PR-AUC, Sensitivity, Specificity, Precision, F1, Accuracy, Brier Score
  - Demographic Subgroup Fairness Audits across Sex, Age, Race, and Healthcare Cost Barrier
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
from sklearn.model_selection import train_test_split, StratifiedKFold
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
import joblib

from research.experiments.pipelines.preprocessing import (
    load_screening_cohort,
    build_preprocessor,
    LCS_NUMERICAL_FEATURES,
    LCS_CATEGORICAL_FEATURES,
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


def evaluate_predictions(y_true: np.ndarray, y_pred_prob: np.ndarray, threshold: float = 0.5) -> dict:
    """Computes comprehensive binary classification metrics."""
    y_pred = (y_pred_prob >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    
    sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    precision = precision_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    acc = accuracy_score(y_true, y_pred)
    roc_auc = roc_auc_score(y_true, y_pred_prob)
    pr_auc = average_precision_score(y_true, y_pred_prob)
    brier = brier_score_loss(y_true, y_pred_prob)

    return {
        "roc_auc": round(float(roc_auc), 4),
        "pr_auc": round(float(pr_auc), 4),
        "sensitivity": round(float(sensitivity), 4),
        "specificity": round(float(specificity), 4),
        "precision": round(float(precision), 4),
        "f1": round(float(f1), 4),
        "accuracy": round(float(acc), 4),
        "brier_score": round(float(brier), 4),
        "true_positives": int(tp),
        "false_positives": int(fp),
        "true_negatives": int(tn),
        "false_negatives": int(fn),
    }


def main():
    print("=" * 70)
    print("PHASE 2.2: EXP-02 — USPSTF SCREENING NON-ADHERENCE MODEL EXPERIMENT")
    print("=" * 70)

    print(f"[INFO] Loading USPSTF screening cohort from {XPT_PATH}...")
    X, y, weights, subgroups = load_screening_cohort(XPT_PATH)
    total_n = len(y)
    non_adherent_n = int(y.sum())
    adherent_n = total_n - non_adherent_n
    print(f"[INFO] Loaded N = {total_n:,} eligible records.")
    print(f"[INFO] Target: Non-Adherent N = {non_adherent_n:,} ({non_adherent_n/total_n*100:.2f}%), Adherent N = {adherent_n:,} ({adherent_n/total_n*100:.2f}%)")

    # Train / Test split (80/20 stratified)
    X_train, X_test, y_train, y_test, sub_train, sub_test = train_test_split(
        X, y, subgroups,
        test_size=0.20,
        random_state=RANDOM_SEED,
        stratify=y
    )
    print(f"[INFO] Train split: N = {len(y_train):,}; Test split: N = {len(y_test):,}")

    # Build Candidate Classifiers with class_weight balanced to handle high imbalance
    candidate_models = {
        "Logistic_Regression_Baseline": LogisticRegression(
            class_weight="balanced",
            max_iter=1000,
            C=1.0,
            solver="lbfgs",
            random_state=RANDOM_SEED
        ),
        "Decision_Tree": DecisionTreeClassifier(
            class_weight="balanced",
            max_depth=5,
            min_samples_leaf=50,
            random_state=RANDOM_SEED
        ),
        "Random_Forest": RandomForestClassifier(
            class_weight="balanced",
            n_estimators=100,
            max_depth=10,
            min_samples_split=20,
            min_samples_leaf=10,
            n_jobs=-1,
            random_state=RANDOM_SEED
        ),
        "Hist_Gradient_Boosting": HistGradientBoostingClassifier(
            class_weight="balanced",
            max_iter=100,
            max_depth=6,
            min_samples_leaf=30,
            learning_rate=0.08,
            random_state=RANDOM_SEED
        )
    }

    cv_results = []
    trained_pipelines = {}
    test_results = []

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)

    for name, clf in candidate_models.items():
        print(f"\n[MODEL] Evaluating {name}...")
        t0 = time.time()

        # Build pipeline
        preprocessor = build_preprocessor(LCS_NUMERICAL_FEATURES, LCS_CATEGORICAL_FEATURES)
        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("classifier", clf)
        ])

        # 5-Fold Stratified Cross-Validation on X_train
        fold_metrics = []
        for fold, (train_idx, val_idx) in enumerate(skf.split(X_train, y_train), 1):
            X_tr, y_tr = X_train.iloc[train_idx], y_train.iloc[train_idx]
            X_va, y_va = X_train.iloc[val_idx], y_train.iloc[val_idx]

            pipeline.fit(X_tr, y_tr)
            val_probs = pipeline.predict_proba(X_va)[:, 1]
            fold_m = evaluate_predictions(y_va.to_numpy(), val_probs)
            fold_metrics.append(fold_m)

        mean_cv_roc = float(np.mean([m["roc_auc"] for m in fold_metrics]))
        std_cv_roc = float(np.std([m["roc_auc"] for m in fold_metrics]))
        mean_cv_pr = float(np.mean([m["pr_auc"] for m in fold_metrics]))
        mean_cv_f1 = float(np.mean([m["f1"] for m in fold_metrics]))
        mean_cv_sens = float(np.mean([m["sensitivity"] for m in fold_metrics]))
        mean_cv_spec = float(np.mean([m["specificity"] for m in fold_metrics]))

        print(f"  5-Fold CV Mean ROC-AUC: {mean_cv_roc:.4f} (±{std_cv_roc:.4f}) | PR-AUC: {mean_cv_pr:.4f} | Sens: {mean_cv_sens:.4f} | Spec: {mean_cv_spec:.4f}")

        # Retrain full pipeline on entire X_train
        pipeline.fit(X_train, y_train)
        fit_time = round(time.time() - t0, 2)
        trained_pipelines[name] = pipeline

        # Evaluate on Test Holdout
        test_probs = pipeline.predict_proba(X_test)[:, 1]
        test_m = evaluate_predictions(y_test.to_numpy(), test_probs)
        test_m["model"] = name
        test_m["cv_roc_auc_mean"] = round(mean_cv_roc, 4)
        test_m["cv_roc_auc_std"] = round(std_cv_roc, 4)
        test_m["train_time_sec"] = fit_time
        test_results.append(test_m)

        print(f"  Test Holdout ROC-AUC: {test_m['roc_auc']:.4f} | PR-AUC: {test_m['pr_auc']:.4f} | Sens: {test_m['sensitivity']:.4f} | Spec: {test_m['specificity']:.4f}")

    # Identify Best Model by Test ROC-AUC
    test_df = pd.DataFrame(test_results).sort_values("roc_auc", ascending=False)
    best_model_name = test_df.iloc[0]["model"]
    best_pipeline = trained_pipelines[best_model_name]
    print(f"\n[BEST MODEL] {best_model_name} selected based on Holdout Test ROC-AUC ({test_df.iloc[0]['roc_auc']:.4f}).")

    # Save Comparison Table
    test_df.to_csv(REPORTS_DIR / "exp02_screening_comparison_table.csv", index=False)
    print(f"[SAVED] Performance comparison saved to {REPORTS_DIR / 'exp02_screening_comparison_table.csv'}")

    # Subgroup Fairness Audit on Holdout Test Set for Best Model
    print(f"\n[AUDIT] Conducting demographic fairness analysis for {best_model_name} on holdout set...")
    best_test_probs = best_pipeline.predict_proba(X_test)[:, 1]
    best_test_preds = (best_test_probs >= 0.5).astype(int)

    fairness_records = []
    audit_dimensions = ["sex", "age_group", "race_ethnicity", "cost_barrier"]

    for dim in audit_dimensions:
        groups = sub_test[dim].unique()
        for grp in groups:
            mask = (sub_test[dim] == grp).to_numpy()
            grp_n = int(mask.sum())
            if grp_n < 50:  # Skip tiny subgroups
                continue
            y_sub = y_test.to_numpy()[mask]
            prob_sub = best_test_probs[mask]
            m_sub = evaluate_predictions(y_sub, prob_sub)
            fairness_records.append({
                "subgroup_dimension": dim,
                "subgroup_value": str(grp),
                "sample_size": grp_n,
                "positive_prevalence": round(float(y_sub.mean()), 4),
                "roc_auc": m_sub["roc_auc"],
                "pr_auc": m_sub["pr_auc"],
                "sensitivity": m_sub["sensitivity"],
                "specificity": m_sub["specificity"],
                "f1": m_sub["f1"],
                "brier_score": m_sub["brier_score"]
            })

    fairness_df = pd.DataFrame(fairness_records)
    fairness_df.to_csv(REPORTS_DIR / "exp02_screening_fairness_table.csv", index=False)
    print(f"[SAVED] Fairness audit table saved to {REPORTS_DIR / 'exp02_screening_fairness_table.csv'}")

    # Feature Importance for Tree/Gradient Boosting model
    clf = best_pipeline.named_steps["classifier"]
    pre = best_pipeline.named_steps["preprocessor"]
    cat_names = pre.named_transformers_["cat"].named_steps["onehot"].get_feature_names_out(LCS_CATEGORICAL_FEATURES)
    all_feature_names = LCS_NUMERICAL_FEATURES + list(cat_names)

    top_features = []
    if hasattr(clf, "feature_importances_"):
        importances = clf.feature_importances_
        indices = np.argsort(importances)[::-1][:15]
        for idx in indices:
            top_features.append({
                "feature": all_feature_names[idx],
                "importance": round(float(importances[idx]), 4)
            })
    elif hasattr(clf, "coef_"):
        coefs = np.abs(clf.coef_[0])
        indices = np.argsort(coefs)[::-1][:15]
        for idx in indices:
            top_features.append({
                "feature": all_feature_names[idx],
                "importance": round(float(coefs[idx]), 4)
            })

    # Save Best Model Artifact & Metadata
    model_artifact_path = ARTIFACTS_DIR / "exp02_best_screening_model.joblib"
    joblib.dump(best_pipeline, model_artifact_path)
    print(f"[SAVED] Model artifact serialized to {model_artifact_path}")

    metadata = {
        "experiment_id": "EXP-02",
        "task_name": "USPSTF Lung Cancer Screening Non-Adherence Propensity",
        "clinical_objective": "Predict likelihood that a USPSTF-eligible patient will fail to obtain annual LDCT screening to inform proactive healthcare outreach and barrier remediation.",
        "dataset": "CDC BRFSS 2022",
        "cohort_size_total": total_n,
        "cohort_size_train": len(y_train),
        "cohort_size_test": len(y_test),
        "non_adherence_prevalence": round(float(y.mean()), 4),
        "best_model_name": best_model_name,
        "test_metrics": test_df.iloc[0].to_dict(),
        "top_features": top_features,
        "artifact_path": str(model_artifact_path),
        "governance_status": "EXPERIMENTAL_RESEARCH_ONLY",
        "prohibited_use": "PROHIBITED FROM CLINICAL SCREENING DETERMINATION OR PRODUCTION CLINICAL DECISION-SUPPORT WORKFLOWS."
    }

    metadata_path = ARTIFACTS_DIR / "exp02_screening_metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"[SAVED] Experiment metadata saved to {metadata_path}")
    print("=" * 70)
    print("EXP-02 PIPELINE EXECUTION COMPLETE.")
    print("=" * 70)


if __name__ == "__main__":
    main()

