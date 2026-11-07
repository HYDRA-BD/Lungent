# LUNGENT V2.0 — BUGS, MISMATCHES & DEFECT LOG
**Audit Standard:** Comprehensive Failure-Mode & Quality Assurance Audit  
**System Target:** Lungent V2.0 Full-Stack Application  
**Last Updated:** November 7, 2026  
**Defect Summary:** 6 Discovered | 6 Remediated | 0 Open Critical/High

---

## 1. Master Defect Table

| ID | Category | Description | Severity | Root Cause | Fix | Status |
|:---|:---|:---|:---:|:---|:---|:---:|
| **BUG-001** | Frontend/Backend Contract | SHAP waterfall chart rendering `NaN%` bar width and monotone rose coloring for all feature impacts. | **P1 (High)** | Key name divergence: `backend/predictor.py` produced `{feature, shap_value, direction}` while `ai-assessment-client.tsx` looked for `item.value` and `item.direction === 'increases'`. | Added `value` alias in backend `shap_items` dictionary; made frontend `ShapChart` tolerate both `shap_value` and `value`, and check `direction === 'risk' \|\| direction === 'increases' \|\| val > 0`. | **VERIFIED FIXED** |
| **BUG-002** | Clinical Validation & Logic | Borderline Evaluator Persona preset triggered `REFER` status ($P = 0.01132$) rather than the intended `REVIEW` status ($0.000301 \le P < 0.006265$). | **P1 (High)** | Persona preset parameters had 14 pack-years and heavy respiratory risk, elevating calibrated Platt probability above the rule-in threshold $t_{\text{in}} = 0.006265$. | Recalibrated Borderline Persona preset to: Age 52, 8 pack-years, Female, former smoker, rural county, West Virginia ($P = 0.003475$), placing it squarely within the `REVIEW` decision zone. | **VERIFIED FIXED** |
| **BUG-003** | Branding & Provenance | Backend OpenAPI title and root endpoint returned legacy name "LungCancer.NET Clinical API". | **P2 (Medium)** | Residual branding string in `backend/main.py` metadata configuration. | Updated FastAPI `title` and root dictionary to `"Lungent V2.0 Clinical Decision Support API"`. | **VERIFIED FIXED** |
| **BUG-004** | API Payload Synchronization | Clinical narrative AI summary generation was omitted on certain client request paths. | **P2 (Medium)** | Request payload omitted query parameter `include_summary=true`, and backend default was implicitly false in earlier schema version. | Set `include_summary: bool = True` as default in `PatientInput` pydantic model in `backend/main.py` and appended explicit query param in `frontend/src/lib/backend-api.ts`. | **VERIFIED FIXED** |
| **BUG-005** | Health Check Introspection | Health check verification command failed with `AttributeError: module 'main' has no attribute 'health'`. | **P3 (Low)** | Test script assumed endpoint function name was `main.health()`, whereas FastAPI routes are explicitly split into `health_simple()` and `health_detailed()`. | Updated test runner commands to target `main.health_simple()` and verified HTTP response format `{'status': 'ok'}`. | **VERIFIED FIXED** |
| **BUG-006** | Turbopack Build / Hermetic Sandbox | Next.js dev server crashed on startup with `Error: Could not find the Next.js package (next/package.json)`. | **P1 (High)** | Next.js 16 Turbopack enforces strict hermetic filesystem root boundaries. `node_modules` was a Windows directory junction pointing to `Lungent_Hackathon_Edition\frontend\node_modules`, causing Turbopack to reject external paths. | Removed junction link, executed native `pnpm install` in `Lungent V2.0/frontend`, and verified `next build` passes across all 74 routes. | **VERIFIED FIXED** |

---

## 2. Granular Root Cause Analysis & Verification

### BUG-001: SHAP Visualization Key Divergence
- **File Affected:**
  - `Lungent V2.0/backend/predictor.py` (Line 230–248)
  - `Lungent V2.0/frontend/src/app/(public)/ai-assessment/ai-assessment-client.tsx` (Line 160–210)
- **Problem Statement:** The explainability dashboard is a key requirement of the AI Detail Usage criteria. In early testing, the SHAP waterfall bars were collapsing to 0px or displaying `NaN%`, preventing clinicians from visually auditing feature attribution.
- **Verification Evidence:**
  Executed inference on test vector:
  ```json
  "shap_items": [
    {"feature": "smoking_pack_years", "shap_value": 0.142, "value": 0.142, "direction": "risk", "impact": "increases_risk"},
    {"feature": "copd", "shap_value": 0.088, "value": 0.088, "direction": "risk", "impact": "increases_risk"},
    {"feature": "physical_activity", "shap_value": -0.045, "value": -0.045, "direction": "protective", "impact": "decreases_risk"}
  ]
  ```
  Result: Risk factors render in vibrant rose (`#f43f5e`), protective factors render in clinical teal (`#0d9488`), bar widths scale correctly from 0% to 100% relative to maximum absolute SHAP impact.

---

### BUG-002: Borderline Evaluator Persona Misclassification
- **File Affected:**
  - `Lungent V2.0/frontend/src/app/(public)/ai-assessment/ai-assessment-client.tsx` (Line 80–110)
- **Problem Statement:** The tri-tier threshold system is the scientific cornerstone of Lungent V2.0 ($t_{\text{out}} = 0.000301$, $t_{\text{in}} = 0.006265$). If the Borderline preset button triggers `REFER`, judges cannot evaluate the intermediate `REVIEW` shared decision-making workflow.
- **Verification Evidence:**
  Loaded Borderline preset in clinical interface:
  - Input: Age 52, 8 pack-years, Female, Former Smoker, WV.
  - Calculated Probability: **0.003475** (0.35%)
  - Condition: $0.000301 \le 0.003475 < 0.006265$ $\rightarrow$ **TIER: REVIEW**
  - Clinical Action: Amber badge displayed with recommendations for shared decision-making and longitudinal symptom surveillance.

---

### BUG-003 & BUG-004: Brand & Summary Parameter Synchronization
- **Files Affected:**
  - `Lungent V2.0/backend/main.py`
  - `Lungent V2.0/frontend/src/lib/backend-api.ts`
- **Verification Evidence:**
  Executed curl test to `/api/health` and `/api/analyze`:
  - Brand response: `"service": "Lungent V2.0 Clinical Decision Support API"`
  - Summary response: Clinical summary object populated with structured sections: Executive Summary, Primary Drivers, and Guideline-Directed Action.

---

## 3. Residual Edge Cases & Monitoring

No open defects remain in the core clinical inference path. The following operational items are logged for ongoing monitoring:
1. **Network Connectivity Fallback:** In the event of an external network failure preventing connection to the EPA AirNow live API, `backend/predictor.py` seamlessly falls back to the embedded 50-state historical ambient air quality database without throwing an uncaught exception.
2. **Local Vector Database Persistence:** ChromaDB embeddings in `backend/rag_store/` operate in read-only local mode; no external cloud vector dependency is required for the application to function.

