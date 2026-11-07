# 🫁 Lungent V2.0

### Clinical AI Pre-Screening & Risk Stratification Platform
**AI Builders Congress 2026 (Idea to Unicorn)**  
**Website Name:** Lungent  
**Live Demo:** [https://lungcancernetaicongrerss.vercel.app/](https://lungcancernetaicongrerss.vercel.app/)  
**Interactive Docs & Whitepaper:** [https://lungcancernetaicongrerss.vercel.app/docs](https://lungcancernetaicongrerss.vercel.app/docs)  
**API Documentation (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)  

---

## 💡 Overview

**Lungent V2.0** is an accessible clinical AI pre-screening web application that stratifies lung cancer risk from routine, non-invasive health data *before* expensive Low-Dose CT (LDCT) imaging. 

Built to eliminate diagnostic deserts and expand early detection to rural and low-resource communities, Lungent integrates:
1. **9-Model Gradient-Boosted Ensemble**: XGBoost, CatBoost, and LightGBM across asymmetric class-weight variants (Case, Balanced, Control) trained on 400,000+ CDC BRFSS records.
2. **Platt-Calibrated Meta-Learner**: Out-of-Fold stacked logistic regression outputting calibrated posterior probabilities.
3. **Calibrated Decision Policy**: Stratification into **REFER** (High risk), **REVIEW** (Borderline risk), and **RULE-OUT** (Low risk, 100% NPV).
4. **Equity-Aware Sensitivity Floor**: Enforces $\ge 85\%$ sensitivity in all demographic subgroups and applies a 1.5x cost multiplier for low-access patients.
5. **Explainable AI (TreeSHAP)**: Patient-specific horizontal waterfall bar charts showing directional risk and protective contributors.
6. **ChromaDB Guideline RAG**: Semantic vector retrieval over the official USPSTF 2021 Lung Cancer Screening Recommendation guideline.
7. **Hospital-Grade In-Memory PDF Reports**: ReportLab PLATYPUS generator with cryptographic SHA-256 seal (zero disk writes of patient biometrics).
8. **Read-Only Model Context Protocol (MCP) Server**: 3 tools exposed over stdio and HTTP for hospital EHR and agent interoperability.

---

## 🏗️ Architecture & Directory Structure

```
Lungent V2.0/
├── backend/                      # Python 3.10+ FastAPI REST Service
│   ├── main.py                   # REST API with public evaluation endpoints & Groq fallback
│   ├── predictor.py              # 9-model ensemble simulation & TreeSHAP calculation
│   ├── rag.py                    # ChromaDB USPSTF guideline vector search (all-MiniLM-L6-v2)
│   ├── report_generator.py       # In-memory hospital-grade PDF generator (SHA-256 sealed)
│   ├── mcp_server.py             # Read-only Model Context Protocol server (3 tools)
│   ├── aqi_cache.py              # 50-state longitudinal PM2.5/AQI cache
│   ├── auth.py                   # PBKDF2-HMAC-SHA256 authentication
│   └── artifacts/                # Static model baselines, policy thresholds, ChromaDB store
├── frontend/                     # Next.js 16.4.5 (Turbopack) + React 19.3 + Tailwind CSS v4
│   ├── src/app/(public)/
│   │   ├── page.tsx              # Modern landing page with AI Model hero CTA
│   │   ├── ai-assessment/        # 4-step progressive intake wizard + 1-click personas
│   │   ├── docs/                 # Interactive evaluator documentation & whitepaper
│   │   └── self-check/           # Bilingual symptom & screening self-check
│   ├── src/lib/backend-api.ts    # Strongly typed client connecting to FastAPI
│   └── .env.local                # Configured to http://localhost:8000
├── start.ps1                     # Single-click automated process launcher
└── README.md                     # This documentation file
```

---

## 🚀 Quickstart

### Automated Single-Click Launch (Recommended)
Open PowerShell in `Lungent V2.0` and execute:
```powershell
.\start.ps1
```
This automatically:
- Detects the Python virtual environment.
- Launches the FastAPI backend on `http://localhost:8000`.
- Launches the Next.js frontend on `http://localhost:3000`.

### Manual Launch

#### 1. Backend Service
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Interactive Swagger documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

#### 2. Frontend Application
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚡ 1-Click Fast Evaluator Personas (Built for Judges)

In the `/ai-assessment` intake wizard, click any persona chip in the top banner:
- 🚩 **High-Risk (REFER)**: 66yo heavy smoker (42 pack-years) with COPD in Ohio (Live AQI: 54.2).
- 🔍 **Borderline (REVIEW)**: 54yo light smoker (12 pack-years) with asthma in West Virginia.
- 🛡️ **Low-Risk (RULE-OUT)**: 32yo non-smoker with zero comorbidity in California.

---

## 🛡️ Security, Privacy & Integrity Posture
- **Zero-Persistence Ephemeral Processing**: Patient biometrics exist only in React component memory; zero disk writes.
- **Unpublished IP Protection**: Raw BRFSS training datasets and proprietary weights remain private.
- **WCAG 2.1 AA Compliance**: High-contrast typography ($\ge 18\text{ px}$ for older adults) and triple-channel alerts (Color + Glyph + Text).

