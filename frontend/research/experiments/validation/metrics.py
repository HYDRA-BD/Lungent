"""
Phase 2.3: Quantitative Clinical Validation Metrics Suite

Provides rigorous, clinically grounded statistical metrics for evaluating AI/ML models:
1. Discrimination: ROC-AUC, PR-AUC, Sensitivity, Specificity, PPV, NPV, F1, Accuracy, Brier score.
2. Confidence Intervals: Wilson score 95% intervals for binomial proportions.
3. Calibration: Decile binning, calibration slope, calibration intercept (calibration-in-the-large),
   and overconfidence/underconfidence quantification.
4. Decision Curve Analysis (DCA): Clinical Net Benefit calculations across decision threshold probabilities.
"""

from typing import Dict, Any, List, Tuple
import numpy as np
from scipy import stats
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    brier_score_loss,
    accuracy_score,
    f1_score,
)
from sklearn.linear_model import LogisticRegression


def wilson_score_interval(k: int, n: int, confidence: float = 0.95) -> Tuple[float, float]:
    """
    Computes Wilson score 95% confidence interval for a proportion k/n.
    Robust for small sample sizes and extreme probabilities near 0 or 1.
    """
    if n == 0:
        return (0.0, 0.0)
    z = stats.norm.ppf(1 - (1 - confidence) / 2)
    p = k / n
    denominator = 1 + z**2 / n
    centre_adjusted_probability = p + z**2 / (2 * n)
    adjusted_std_dev = np.sqrt((p * (1 - p) + z**2 / (4 * n)) / n)
    lower = (centre_adjusted_probability - z * adjusted_std_dev) / denominator
    upper = (centre_adjusted_probability + z * adjusted_std_dev) / denominator
    return (round(float(max(0.0, lower)), 4), round(float(min(1.0, upper)), 4))


def compute_discrimination_metrics(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    threshold: float = 0.5
) -> Dict[str, Any]:
    """
    Computes discrimination and classification performance metrics at a specified decision threshold.
    """
    y_true = np.asarray(y_true).astype(int)
    y_prob = np.asarray(y_prob).astype(float)
    y_pred = (y_prob >= threshold).astype(int)

    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    total = len(y_true)

    sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    ppv = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    npv = tn / (tn + fn) if (tn + fn) > 0 else 0.0
    accuracy = (tp + tn) / total if total > 0 else 0.0
    f1 = 2 * tp / (2 * tp + fp + fn) if (2 * tp + fp + fn) > 0 else 0.0

    roc_auc = float(roc_auc_score(y_true, y_prob)) if len(np.unique(y_true)) > 1 else 0.5
    pr_auc = float(average_precision_score(y_true, y_prob)) if len(np.unique(y_true)) > 1 else 0.0
    brier = float(brier_score_loss(y_true, y_prob))

    # Confidence intervals for key proportions
    sens_ci = wilson_score_interval(tp, tp + fn)
    spec_ci = wilson_score_interval(tn, tn + fp)
    ppv_ci = wilson_score_interval(tp, tp + fp)
    npv_ci = wilson_score_interval(tn, tn + fn)

    return {
        "sample_size": total,
        "prevalence": round(float(y_true.mean()), 4),
        "threshold": threshold,
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "sensitivity": round(float(sensitivity), 4),
        "specificity": round(float(specificity), 4),
        "ppv": round(float(ppv), 4),
        "npv": round(float(npv), 4),
        "accuracy": round(float(accuracy), 4),
        "f1": round(float(f1), 4),
        "brier_score": round(brier, 4),
        "confusion_matrix": {
            "true_positives": int(tp),
            "false_positives": int(fp),
            "true_negatives": int(tn),
            "false_negatives": int(fn),
        },
        "confidence_intervals_95": {
            "sensitivity": sens_ci,
            "specificity": spec_ci,
            "ppv": ppv_ci,
            "npv": npv_ci,
        }
    }


def compute_calibration_metrics(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    n_bins: int = 10
) -> Dict[str, Any]:
    """
    Computes probability calibration metrics:
    - Decile bin observed vs predicted probability
    - Calibration intercept (alpha) and calibration slope (beta) via logistic calibration
    - Overconfidence / underconfidence assessment
    """
    y_true = np.asarray(y_true).astype(int)
    y_prob = np.clip(np.asarray(y_prob).astype(float), 1e-6, 1 - 1e-6)

    # Bin into deciles
    bin_edges = np.linspace(0, 1, n_bins + 1)
    bin_indices = np.digitize(y_prob, bin_edges[1:-1])

    deciles: List[Dict[str, Any]] = []
    for b in range(n_bins):
        mask = bin_indices == b
        count = int(mask.sum())
        if count > 0:
            mean_pred = float(y_prob[mask].mean())
            obs_freq = float(y_true[mask].mean())
        else:
            mean_pred = float((bin_edges[b] + bin_edges[b + 1]) / 2)
            obs_freq = 0.0

        deciles.append({
            "decile": b + 1,
            "mean_predicted_prob": round(mean_pred, 4),
            "observed_frequency": round(obs_freq, 4),
            "count": count,
        })

    # Logistic calibration model: logit(p_observed) ~ alpha + beta * logit(p_predicted)
    logit_probs = np.log(y_prob / (1 - y_prob)).reshape(-1, 1)
    cal_lr = LogisticRegression(solver="lbfgs", C=1e6)
    cal_lr.fit(logit_probs, y_true)

    slope = float(cal_lr.coef_[0][0])
    intercept = float(cal_lr.intercept_[0])
    brier = float(brier_score_loss(y_true, y_prob))

    # Overconfidence / Underconfidence clinical heuristic:
    # slope < 1 indicates predictions are too extreme (overconfident in probability tails)
    # slope > 1 indicates predictions are too conservative (underconfident)
    if slope < 0.80:
        overconfidence = "moderate"
    elif slope < 0.92:
        overconfidence = "mild"
    else:
        overconfidence = "none"

    if slope > 1.20:
        underconfidence = "moderate"
    elif slope > 1.08:
        underconfidence = "mild"
    else:
        underconfidence = "none"

    recalibration_needed = bool(abs(slope - 1.0) > 0.08 or abs(intercept) > 0.15)

    return {
        "calibration_slope": round(slope, 4),
        "calibration_intercept": round(intercept, 4),
        "brier_score": round(brier, 4),
        "deciles": deciles,
        "overconfidence_assessment": overconfidence,
        "underconfidence_assessment": underconfidence,
        "recalibration_recommended": recalibration_needed,
        "recalibration_rationale": (
            f"Observed calibration slope {slope:.3f} and intercept {intercept:.3f}. "
            + ("Recalibration recommended before target population deployment." if recalibration_needed else "Calibration is clinically acceptable in source population.")
        )
    }


def compute_decision_curve(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    thresholds: List[float] = None
) -> List[Dict[str, Any]]:
    """
    Computes Decision Curve Analysis (DCA) Net Benefit across threshold probabilities:
    Net Benefit = (TP / N) - (FP / N) * [p_t / (1 - p_t)]
    """
    y_true = np.asarray(y_true).astype(int)
    y_prob = np.asarray(y_prob).astype(float)
    N = len(y_true)
    prevalence = float(y_true.mean())

    if thresholds is None:
        thresholds = [0.01, 0.02, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50]

    dca_records: List[Dict[str, Any]] = []
    for pt in thresholds:
        if pt >= 1.0 or pt <= 0.0:
            continue
        weight = pt / (1.0 - pt)
        y_pred = (y_prob >= pt).astype(int)
        tp = int(np.sum((y_pred == 1) & (y_true == 1)))
        fp = int(np.sum((y_pred == 1) & (y_true == 0)))

        model_nb = (tp / N) - (fp / N) * weight
        # Treat all strategy: TP = total positive, FP = total negative
        all_nb = prevalence - (1.0 - prevalence) * weight
        none_nb = 0.0

        dca_records.append({
            "threshold_probability": round(pt, 4),
            "model_net_benefit": round(float(model_nb), 4),
            "treat_all_net_benefit": round(float(all_nb), 4),
            "treat_none_net_benefit": 0.0,
        })

    return dca_records

