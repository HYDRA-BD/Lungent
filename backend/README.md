---
title: Lungent Backend
emoji: 🫁
colorFrom: teal
colorTo: blue
sdk: docker
pinned: false
app_port: 7860
---

# 🫁 Lungent V2.0 — Clinical AI Pre-Screening API

Lungent is an evidence-based clinical AI pre-screening and risk stratification system built for the **AI Builders Congress 2026**. It stratifies population-level lung cancer risk using non-imaging biometric, demographic, clinical, and 5-year ambient particulate (AQI/PM2.5) exposure data.

This Space hosts the containerized FastAPI backend on **Hugging Face Spaces CPU Basic (16 GB RAM / 2 vCPU)**.

---

## 🚀 Live API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | Liveness and model loading status | No |
| `GET` | `/api/health` | Comprehensive diagnostics and system info | No |
| `POST` | `/api/predict` | Fast risk score and 3-tier triage estimation | No (Public Demo) |
| `POST` | `/api/analyze` | Unified prediction + guidelines + summary | No (Public Demo) |
| `POST` | `/api/report` | Generates a binary PDF clinical lab report | No (Public Demo) |
| `GET` | `/api/states` | 5-year historical AQI/PM2.5 per US state | No |
| `GET` | `/docs` | Interactive Swagger UI API documentation | No |

---

## 🛠 Local Docker Testing

To test this container locally before pushing to Hugging Face:

```bash
# Build the Docker image
docker build -t lungent-backend .

# Run container mapping port 7860
docker run -p 7860:7860 lungent-backend

# Check health endpoint
curl http://localhost:7860/health
```

---

## 🔗 Connecting to Next.js Frontend

In your Next.js application (`frontend/.env.local` or Vercel Environment Variables):

```ini
NEXT_PUBLIC_API_URL=https://<your-hf-username>-<space-name>.hf.space
```

> **Note:** Ensure your Hugging Face Space visibility is set to **Public** in Space Settings so external clients can query the API without bearer tokens.

