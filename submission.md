# AI Builders Congress 2026 — Official Submission Document
**Project Name:** Lungent  
**Category:** Idea to Unicorn / Healthcare & Life Sciences AI  
**Repository:** https://github.com/HYDRA-BD/LungCancer.NET  
**Live Production URL:** https://lungentaibc.vercel.app/  
**Interactive Docs & Whitepaper:** https://lungentaibc.vercel.app/docs  
**Live API Swagger Docs:** https://lungcancer-net.onrender.com/docs  

---

# SECTION 1: BASICS

### Project Name
```text
Lungent
```

### Elevator Pitch (≥20 chars)
```text
Accessible AI clinical pre-screening and risk stratification portal detecting lung cancer risk before the CT scan.
```

### Public Summary
```text
Lungent is an AI-powered preliminary lung cancer risk assessment platform. Built on research using non-imaging clinical and behavioral data (CDC BRFSS), it aims to assist underserved populations who face barriers to traditional LDCT screening. Lungent integrates a multi-disciplinary ecosystem with dedicated portals for patients, community health workers, clinicians, and administrators.
```

### Problem Statement
```text
Lung cancer is a leading cause of cancer death, yet approximately 70% of rural and underserved patients never receive LDCT screening. This is rarely because they are low-risk, but because the required medical infrastructure is geographically or financially inaccessible. This leads to late-stage diagnoses and significantly worse survival rates.
```

### Solution Description
```text
Lungent flips the screening funnel. Instead of relying on expensive imaging first, Lungent uses an interpretable, non-imaging ML model to stratify risk from accessible demographic and clinical data. It translates complex probabilities into a 3-tier clinical decision (RULE-OUT, REVIEW, REFER), fast-tracking only high-risk patients for imaging while empowering patients and community health workers with actionable risk awareness.
```

### Submission Track / Domain
- **Primary Domain:** Healthcare / Life Sciences / Clinical Decision Support
- **Challenge Track:** Idea to Unicorn (AI Builders Congress 2026)

---

# SECTION 2: BUILD PROVENANCE & AI ARCHITECTURE

### Data Sources
```text
1. CDC Behavioral Risk Factor Surveillance System (BRFSS): Primary epidemiological survey cohort (>400,000 patient records).
2. EPA & Open-Meteo 5-Year Historical Air Quality Dataset: 50-state longitudinal PM2.5 and AQI cache for ambient environmental inhalation risk.
3. USPSTF 2021 Clinical Recommendations: Embedded into ChromaDB vector database for guideline Retrieval-Augmented Generation (RAG).
```

### AI Models & Algorithmic Stack
```text
1. Proprietary Stacked Gradient-Boosted Ensemble:
   - XGBoost, LightGBM, and CatBoost models trained across asymmetric class-weight regimes (Case-weighted SPW=60, Balanced SPW=30, Control SPW=1) to overcome severe disease prevalence imbalance (~0.085%).
2. Calibrated Meta-Model:
   - Logistic Regression meta-learner with Platt scaling producing well-calibrated posterior probabilities (ROC-AUC: 0.9537, Rule-Out NPV: 100%).
3. Explainable AI (XAI):
   - Game-theoretic TreeSHAP feature attributions generating transparent, patient-specific risk and protective factor waterfall charts for clinical trust.
```

### Responsible AI & Safety Framework
```text
1. Equity-Aware Sensitivity Floor: Enforces a strict minimum sensitivity threshold of 85% across all racial, socio-economic, and rural demographic subgroups. Includes an access-aware cost multiplier (1.5x penalty on false negatives for marginalized patients).
2. Transient In-Memory Processing: Zero patient health information (PHI) or biometrics are saved to disk or persistent databases. Patient inputs are held strictly in ephemeral RAM during inference.
3. Transparency & Disclaimers: Every risk calculation is accompanied by patient-specific SHAP attributions, USPSTF guideline citations, and clear non-diagnostic clinical boundaries.
4. PII Redaction & Cryptographic Audit: Tamper-evident session verification uses salted SHA-256 digital seals on all generated clinical PDF summaries; no plain-text patient identifiers are stored.
```

---

# SECTION 3: MODEL CONTEXT PROTOCOL (MCP) INTEGRATION

### MCP Implementation Details
```text
Server Name: Lungent-MCP-Server
Transport: stdio / Streamable HTTP (FastAPI JSON-RPC compatible)
Source File: backend/mcp_server.py
Description: Clinical decision support Model Context Protocol (MCP) server enabling hospital EHRs, autonomous clinical agents, and diagnostic workflows to query stratification models securely.
```

### Registered MCP Tools (3 Tools):
```json
[
  {
    "name": "predict_lung_cancer_risk",
    "description": "Calculates calibrated lung cancer risk probabilities, 3-tier stratification (RULE-OUT, REVIEW, REFER), and TreeSHAP attributions from non-invasive biometrics and environmental AQI.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "age": { "type": "integer", "description": "Patient age in years" },
        "smoking_pack_years": { "type": "number", "description": "Cumulative smoking pack-years" },
        "bmi": { "type": "number", "description": "Body Mass Index (kg/m^2)" },
        "state": { "type": "string", "description": "US State code for 5-year AQI lookup" },
        "copd": { "type": "boolean", "description": "History of COPD" },
        "asthma": { "type": "boolean", "description": "History of asthma" },
        "chest_pain": { "type": "boolean", "description": "Unexplained chest pain or hemoptysis" }
      },
      "required": ["age", "smoking_pack_years", "bmi", "state"]
    }
  },
  {
    "name": "search_uspstf_guidelines",
    "description": "Performs semantic vector search over the official USPSTF 2021 Lung Cancer Screening recommendations using ChromaDB to retrieve relevant clinical guidance.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "query": { "type": "string", "description": "Clinical question or guideline inquiry" },
        "n_results": { "type": "integer", "default": 3, "description": "Number of evidence passages to return" }
      },
      "required": ["query"]
    }
  },
  {
    "name": "get_clinical_summary",
    "description": "Generates a structured, guideline-grounded clinical narrative synthesizing patient risk tier, SHAP drivers, and recommended next diagnostic actions.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "risk_tier": { "type": "string", "enum": ["RULE-OUT", "REVIEW", "REFER"] },
        "top_features": { "type": "array", "items": { "type": "string" } }
      },
      "required": ["risk_tier"]
    }
  }
]
```

---

# SECTION 4: DEMO LINKS & CREDENTIALS

### Links
- **GitHub Repository:** `https://github.com/HYDRA-BD/LungCancer.NET` (or `https://github.com/HYDRA-BD/Lungent`)
- **Live Demo:** `https://lungentaibc.vercel.app/`
- **Documentation & Whitepaper:** `https://lungentaibc.vercel.app/docs`
- **FastAPI Swagger API Docs:** `https://lungcancer-net.onrender.com/docs`
- **YouTube Video Pitch (≤ 3 Mins):** `[USER MUST UPLOAD AND PASTE LINK HERE]`

### Test Credentials for Judges
```text
Role: Clinician (Full Access: Risk intake, SHAP waterfall, RAG search, cryptographic PDF reports)
Email: smjarifhaidera@gmail.com
Password: qwertyuiop

Public Demo (No login required):
- Direct AI Risk Assessment: https://lungentaibc.vercel.app/ai-assessment
- Interactive Whitepaper & Guidelines: https://lungentaibc.vercel.app/docs
```
