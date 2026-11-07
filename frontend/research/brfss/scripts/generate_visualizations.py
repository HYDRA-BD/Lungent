#!/usr/bin/env python3
"""
Phase 2.1: BRFSS 2022 Research Visualizations Generator

Produces publication-grade plots saved to research/brfss/visualizations/:
1. fig1_smoking_status_distribution.png
2. fig2_copd_prevalence_by_smoking.png
3. fig3_pack_years_distribution.png
4. fig4_lcs_screening_adherence.png
5. fig5_missingness_landscape.png
"""

from pathlib import Path
import json
import pyreadstat
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg") # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
VIZ_DIR = BASE_DIR / "visualizations"
VIZ_DIR.mkdir(parents=True, exist_ok=True)

XPT_PATH = DATA_RAW_DIR / "LLCP2022.XPT"

# Configure theme
sns.set_theme(style="whitegrid", font="sans-serif")
plt.rcParams["font.size"] = 10
plt.rcParams["axes.titlesize"] = 12
plt.rcParams["axes.labelsize"] = 11

def generate_visualizations():
    print(f"[INFO] Generating research figures in {VIZ_DIR}...")
    
    # Load statistical summary
    with open(PROCESSED_DIR / "statistical_analysis_summary.json", "r") as f:
        stats_summary = json.load(f)

    # -------------------------------------------------------------------------
    # FIGURE 1: Smoking Status Distribution (Sample vs Weighted Population)
    # -------------------------------------------------------------------------
    smk_data = stats_summary["smoking_status_distribution"]
    categories = [d["category"].replace("Current smoker - ", "") for d in smk_data if "Refused" not in d["category"]]
    unw_pcts = [d["sample_unweighted_pct"] for d in smk_data if "Refused" not in d["category"]]
    w_pcts = [d["population_weighted_pct"] for d in smk_data if "Refused" not in d["category"]]

    x = np.arange(len(categories))
    width = 0.35

    fig, ax = plt.subplots(figsize=(8, 4.5), dpi=300)
    bars1 = ax.bar(x - width/2, unw_pcts, width, label="Unweighted Sample (N=445K)", color="#3b82f6", alpha=0.9)
    bars2 = ax.bar(x + width/2, w_pcts, width, label="Survey-Weighted Population", color="#10b981", alpha=0.9)

    ax.set_ylabel("Prevalence (%)")
    ax.set_title("Figure 1: Adult Smoking Status Distribution — BRFSS 2022\n(Unweighted Sample vs. Survey-Weighted US Population)")
    ax.set_xticks(x)
    ax.set_xticklabels(categories)
    ax.legend(frameon=True)
    ax.set_ylim(0, 70)

    for bar in bars1:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 1, f"{yval:.1f}%", ha="center", va="bottom", fontsize=8)
    for bar in bars2:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 1, f"{yval:.1f}%", ha="center", va="bottom", fontsize=8)

    plt.tight_layout()
    fig1_path = VIZ_DIR / "fig1_smoking_status_distribution.png"
    plt.savefig(fig1_path)
    plt.close()
    print(f"[SUCCESS] Saved {fig1_path.name}")

    # -------------------------------------------------------------------------
    # FIGURE 2: COPD Prevalence by Smoking Status
    # -------------------------------------------------------------------------
    copd_data = stats_summary["copd_association"]["prevalence_by_group"]
    groups = [d["smoking_status"] for d in copd_data]
    copd_w_pcts = [d["weighted_prevalence_pct"] for d in copd_data]

    fig, ax = plt.subplots(figsize=(7, 4.5), dpi=300)
    colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"]
    bars = ax.bar(groups, copd_w_pcts, color=colors, width=0.55, edgecolor="#1e293b", linewidth=0.8)

    ax.set_ylabel("Weighted COPD Prevalence (%)")
    ax.set_title("Figure 2: Self-Reported COPD Prevalence by Smoking Category\n(BRFSS 2022 Complex Survey Weighted, p < 0.0001)")
    ax.set_ylim(0, 25)

    for bar in bars:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 0.6, f"{yval:.2f}%", ha="center", va="bottom", fontweight="bold", fontsize=9)

    ax.axhline(3.01, color="#22c55e", linestyle="--", alpha=0.7, label="Baseline Never-Smoker Risk (3.01%)")
    ax.legend(loc="upper right", frameon=True)

    plt.tight_layout()
    fig2_path = VIZ_DIR / "fig2_copd_prevalence_by_smoking.png"
    plt.savefig(fig2_path)
    plt.close()
    print(f"[SUCCESS] Saved {fig2_path.name}")

    # -------------------------------------------------------------------------
    # FIGURE 3: Cumulative Pack-Years Exposure Distribution
    # -------------------------------------------------------------------------
    print("[INFO] Generating Pack-Years distribution plot...")
    df_py, _ = pyreadstat.read_xport(str(XPT_PATH), encoding="latin1", usecols=["_PACKYRS", "_LLCPWT"])
    df_py = df_py[df_py["_PACKYRS"].notna() & (df_py["_PACKYRS"] > 0) & (df_py["_PACKYRS"] <= 120)]

    fig, ax = plt.subplots(figsize=(8, 4.5), dpi=300)
    sns.histplot(
        data=df_py,
        x="_PACKYRS",
        weights="_LLCPWT",
        bins=30,
        kde=True,
        color="#0284c7",
        edgecolor="white",
        ax=ax
    )

    ax.axvline(20.0, color="#dc2626", linestyle="-.", linewidth=2, label="USPSTF 2021 Screening Threshold (20 Pack-Years)")
    ax.axvline(12.0, color="#0f172a", linestyle=":", linewidth=1.5, label="Weighted Population Median (12.0 Pack-Years)")

    ax.set_xlabel("Cumulative Pack-Years of Smoking")
    ax.set_ylabel("Weighted Population Frequency Density")
    ax.set_title("Figure 3: Population Distribution of Cumulative Pack-Years Among Smokers\n(BRFSS 2022, N=138,200 Weighted Sample)")
    ax.legend(loc="upper right", frameon=True)

    plt.tight_layout()
    fig3_path = VIZ_DIR / "fig3_pack_years_distribution.png"
    plt.savefig(fig3_path)
    plt.close()
    print(f"[SUCCESS] Saved {fig3_path.name}")

    # -------------------------------------------------------------------------
    # FIGURE 4: USPSTF Lung Cancer Screening Adherence Donut Chart
    # -------------------------------------------------------------------------
    adh = stats_summary["screening_adherence"]
    labels_pie = [
        f"Screened in Past Year\n(9.35% / ~2.18M)",
        f"Unscreened Eligible Cohort\n(90.65% / ~21.18M)"
    ]
    sizes = [adh["weighted_adherence_pct"], 100.0 - adh["weighted_adherence_pct"]]
    colors_pie = ["#059669", "#dc2626"]
    explode = (0.08, 0)

    fig, ax = plt.subplots(figsize=(6, 5), dpi=300)
    wedges, texts, autotexts = ax.pie(
        sizes,
        explode=explode,
        labels=labels_pie,
        colors=colors_pie,
        autopct="%1.1f%%",
        startangle=140,
        textprops=dict(color="#0f172a", fontsize=9, fontweight="medium"),
        pctdistance=0.75
    )
    for at in autotexts:
        at.set_color("white")
        at.set_fontweight("bold")

    # Center circle for donut
    centre_circle = plt.Circle((0, 0), 0.55, fc="white")
    ax.add_artist(centre_circle)
    ax.text(0, 0, f"Total Eligible\n~23.4 Million\nUS Adults", ha="center", va="center", fontsize=8.5, fontweight="bold", color="#334155")

    ax.set_title("Figure 4: Annual Lung Cancer Screening Receipt (LDCT)\nAmong Adults Meeting USPSTF 2021 Criteria (BRFSS 2022)")
    plt.tight_layout()
    fig4_path = VIZ_DIR / "fig4_lcs_screening_adherence.png"
    plt.savefig(fig4_path)
    plt.close()
    print(f"[SUCCESS] Saved {fig4_path.name}")

    # -------------------------------------------------------------------------
    # FIGURE 5: Missingness Landscape across Research Domains
    # -------------------------------------------------------------------------
    with open(PROCESSED_DIR / "missingness_report.json", "r") as f:
        miss_data = json.load(f)

    # Pick representative variables
    rep_vars = [
        ("_STATE", "State ID (Core)"),
        ("_AGEG5YR", "Age Group (Core)"),
        ("SEXVAR", "Sex (Core)"),
        ("_SMOKER3", "Smoking Status (Core)"),
        ("CHCCOPD3", "COPD Status (Core)"),
        ("ASTHMA3", "Asthma Status (Core)"),
        ("_BMI5", "BMI Value (Core)"),
        ("_PACKYRS", "Pack-Years (Skip Routing)"),
        ("_LCSREC", "LCS Recommended (Skip Routing)"),
        ("LCSSCNCR", "LCS CT Scan (Skip Routing)"),
        ("COPDCOGH", "Chronic Cough (State Module)"),
        ("CNCRTYP2", "Cancer Type (Survivor Module)")
    ]

    var_dict_map = {d["variable"]: d for d in miss_data}
    chart_rows = []
    for var, label in rep_vars:
        if var in var_dict_map:
            d = var_dict_map[var]
            valid_pct = d["effective_analytic_valid_pct"]
            dk_pct = d["dont_know_pct"]
            ref_pct = d["refused_pct"]
            blank_pct = d["system_blank_pct"]
            chart_rows.append({
                "label": f"{var} ({label})",
                "Valid Responses": valid_pct,
                "Don't Know / Refused": dk_pct + ref_pct,
                "System Blank / Skip": blank_pct
            })

    df_chart = pd.DataFrame(chart_rows).set_index("label")

    fig, ax = plt.subplots(figsize=(9, 6), dpi=300)
    df_chart.plot(
        kind="barh",
        stacked=True,
        color=["#10b981", "#f59e0b", "#94a3b8"],
        edgecolor="#334155",
        linewidth=0.5,
        ax=ax
    )

    ax.set_xlabel("Percentage of Total Observations (N = 445,132)")
    ax.set_ylabel("")
    ax.set_title("Figure 5: Data Completeness & Missingness Typology in BRFSS 2022\n(Distinguishing Core Variables, Skip Patterns, and Optional Modules)")
    ax.legend(loc="lower right", frameon=True)
    ax.invert_yaxis()
    ax.set_xlim(0, 100)

    plt.tight_layout()
    fig5_path = VIZ_DIR / "fig5_missingness_landscape.png"
    plt.savefig(fig5_path)
    plt.close()
    print(f"[SUCCESS] Saved {fig5_path.name}")

if __name__ == "__main__":
    generate_visualizations()

