# Lungent Hackathon Edition — Backend Architecture

> **Project:** Lungent_Hackathon_Edition  
> **Event:** AI Builders Congress 2026  
> **Stack:** FastAPI · XGBoost / CatBoost / LightGBM ensemble · ChromaDB RAG · Ollama + Groq LLM · ReportLab PDF

---

## Overview

The backend is a FastAPI application that wraps a multi-model ML ensemble for lung cancer pre-screening risk stratification. It enriches predictions with:

- **RAG guidelines** via ChromaDB + sentence-transformers
- **AI clinical summaries** via Ollama (local) or Groq API (cloud fallback)
- **AQI environmental context** pre-cached for all US states
- **PDF clinical reports** via ReportLab

For the hackathon demo **all clinical endpoints are public** (no Bearer token required).

---

## Endpoint Reference

### Public (no auth)

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Simple liveness check |
| `GET`  | `/api/health` | Detailed health: model, AQI, RAG, Ollama, Groq, version |
| `GET`  | `/api/states` | All US states with 5-year AQI data |
| `GET`  | `/api/aqi/{state}` | AQI data for a specific state |
| `POST` | `/api/predict` | ML risk prediction only |
| `POST` | `/api/analyze` | Full pipeline: predict + RAG + AI summary |
| `POST` | `/api/analyze/public` | Alias for `/api/analyze` |
| `POST` | `/api/report` | Generate PDF clinical report |

### Auth-required

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/signup` | Register new user |
| `POST` | `/auth/login` | Login, receive JWT |
| `GET`  | `/auth/me` | Current user info |
| `POST` | `/api/guidelines` | RAG-only guideline search |

---

## Architecture Diagram

```
Frontend / Demo UI
        │
        ▼
  FastAPI (main.py)
  ┌─────────────────────────────────────────────────────────┐
  │  /api/analyze ──► predictor.py  (XGB + CAT + LGB + RF) │
  │                        │                                │
  │                   aqi_cache.py  (US AQI enrichment)     │
  │                        │                                │
  │               rag.py + ChromaDB  (guideline search)     │
  │                        │                                │
  │          Ollama (local) ──► Groq API (fallback)         │
  │                        │                                │
  │          report_generator.py  (ReportLab PDF)           │
  └─────────────────────────────────────────────────────────┘
```

---

## Module Descriptions

| File | Role |
|------|------|
| `main.py` | FastAPI app, endpoint routing, Groq fallback logic |
| `predictor.py` | Loads ensemble models, produces tier + SHAP explanations |
| `rag.py` | ChromaDB vector store for USPSTF / NCCN guideline chunks |
| `aqi_cache.py` | Pre-cached 5-year EPA AQI averages for all US states |
| `report_generator.py` | ReportLab PDF builder for clinical reports |
| `auth.py` | SQLite-backed JWT auth (optional for demo use) |
| `mcp_server.py` | MCP (Model Context Protocol) agent server |
| `clinical_agent.py` | Agentic reasoning layer over predictor + RAG |

---

## LLM Fallback Chain

```
Request for clinical summary
        │
        ▼
  Ollama  ──► success? → return summary
        │
        ▼ (failed / unavailable)
  Groq API  ──► success? → return summary  (requires GROQ_API_KEY env var)
        │
        ▼ (failed / no API key)
  Static template fallback  → always returns something
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `qwen2.5:3b` | Model to use with Ollama |
| `GROQ_API_KEY` | _(empty)_ | Groq API key — enables cloud LLM fallback |
| `GROQ_MODEL` | `llama3-8b-8192` | Groq model name |
| `DISABLE_RAG` | `0` | Set to `1` to skip ChromaDB entirely |

---

## Running Locally

### Windows (PowerShell)
```powershell
.\start.ps1
```

### Linux / macOS
```bash
chmod +x start.sh
./start.sh
```

### Manual
```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Swagger UI: http://localhost:8000/docs  
Health check: http://localhost:8000/api/health

---

## Risk Tiers

| Tier | Meaning | Action |
|------|---------|--------|
| `Tier 1 — Routine` | Low risk | Annual wellness |
| `Tier 2 — Elevated` | Moderate risk | 6-month follow-up |
| `Tier 3 — High` | High risk | Refer for LDCT |
| `Tier 4 — Critical` | Very high risk | Urgent specialist referral |

---

## Notes for Judges

- The model ensemble was trained on BRFSS + SEER population data with cross-validated calibration.
- SHAP values are computed per-prediction for full explainability.
- AQI enrichment adds an environmental risk dimension not present in standard screening tools.
- All endpoints return JSON (except `/api/report` which returns `application/pdf`).
- The Groq fallback ensures AI summaries work even without a local GPU.
