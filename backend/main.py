"""
main.py — Lungent V2.0 Clinical AI Pre-Screening Backend.

Built for AI Builders Congress 2026.
Key features:
  - /api/predict, /api/analyze, /api/report  → public evaluation endpoints
  - /api/analyze/public                      → alias for quick intake
  - /api/health                              → detailed health-check
  - _generate_clinical_summary()            → Groq fallback when Ollama is down
  - REPORT_CONFIG                           → references Lungent V2.0 Clinical Lab
  - CORS                                    → allow_origins=["*"]

Run:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000

Swagger docs:
    http://localhost:8000/docs
"""
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests
from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.encoders import ENCODERS_BY_TYPE
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field, field_validator

import numpy as np

# Global safeguard: Ensure all NumPy scalar & array types serialize cleanly in FastAPI responses
ENCODERS_BY_TYPE[np.float32] = float
ENCODERS_BY_TYPE[np.float64] = float
ENCODERS_BY_TYPE[np.int32] = int
ENCODERS_BY_TYPE[np.int64] = int
ENCODERS_BY_TYPE[np.ndarray] = lambda x: x.tolist()

from predictor import get_prediction

# Default to lightweight static guidelines to protect against Render 512MB RAM OOM crashes
_DISABLE_RAG = os.environ.get("DISABLE_RAG", "1") == "1"

STATIC_GUIDELINES = [
    {
        "text": "USPSTF 2021 Recommendation: Annual screening for lung cancer with low-dose computed tomography (LDCT) is recommended for adults aged 50 to 80 years who have a 20 pack-year smoking history and currently smoke or have quit within the past 15 years.",
        "page": 1,
        "score": 0.96,
    },
    {
        "text": "Screening Discontinuation: Discontinue screening once a person has not smoked for 15 consecutive years, develops a health condition that substantially limits life expectancy, or is unable/unwilling to undergo curative lung surgery.",
        "page": 2,
        "score": 0.89,
    },
    {
        "text": "Clinical Shared Decision-Making: Counseling should emphasize smoking cessation interventions, the balance of screening benefits versus false-positive risks, and incidental pulmonary nodule follow-up protocols.",
        "page": 3,
        "score": 0.84,
    },
]


def search_guidelines(query, k=3):
    """Lazy wrapper — loads rag.py only when explicitly enabled and falls back to static clinical guidelines."""
    if _DISABLE_RAG:
        return STATIC_GUIDELINES[:max(1, min(k, 10))]
    try:
        from rag import search_guidelines as _rag
        res = _rag(query, k=k)
        if res:
            return res
        return STATIC_GUIDELINES[:max(1, min(k, 10))]
    except Exception as e:
        logger.warning(f"RAG unavailable, using static USPSTF guidelines: {e}")
        return STATIC_GUIDELINES[:max(1, min(k, 10))]


from aqi_cache import _load_cache, get_state_aqi
from report_generator import generate_clinical_report
from auth import (
    create_token, create_user, decode_token, get_user_by_email,
    get_user_by_id, init_db, update_last_login, verify_password,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("lungent.api")

# ── Version ───────────────────────────────────────────────────────
VERSION = "2.0.0-hackathon"

# ── Config ────────────────────────────────────────────────────────
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:3b")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama3-8b-8192")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

ASSETS_DIR = Path(__file__).parent / "assets"
LOGO_PATH = str(ASSETS_DIR / "logo.png")
WATERMARK_PATH = str(ASSETS_DIR / "watermark.png")

REPORT_CONFIG = {
    "team_name": "Team Lungent",
    "institution": "Lungent Clinical AI Lab — AI Builders Congress 2026",
    "department": "Preventive Pulmonology & Population Screening",
    "address": "AI Builders Congress 2026 Showcase",
    "contact": "research@lungent.org",
}

_aqi_cache: dict = {"states": {}, "errors": {}}

# Track whether the predictor loaded successfully
_model_loaded: bool = False


# ── Lifespan ──────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    global _aqi_cache, _model_loaded

    init_db()

    # Seed default user if configured in environment variables
    try:
        admin_email = os.environ.get("ADMIN_SEED_EMAIL")
        admin_pass = os.environ.get("ADMIN_SEED_PASSWORD")
        if admin_email and admin_pass and not get_user_by_email(admin_email):
            admin_name = os.environ.get("ADMIN_SEED_NAME", "Default Clinician")
            create_user(admin_name, admin_email, admin_pass, "clinician")
            logger.info(f"Seeded default user from environment variables: {admin_email}")
    except Exception as e:
        logger.warning(f"User seed failed: {e}")

    # Global Model Loading (Task 1): Preload ML models & meta-model once globally into memory
    try:
        from predictor import load_all_models
        load_all_models()
        _model_loaded = True
        logger.info("ML ensemble models, meta-model, and policy loaded globally into memory")
    except Exception as e:
        logger.warning(f"Predictor global load failed: {e}")

    try:
        _aqi_cache = _load_cache()
        logger.info(f"AQI cache: {len(_aqi_cache.get('states', {}))} states")
    except Exception as e:
        logger.warning(f"AQI cache load failed: {e}")

    yield


# ── App ───────────────────────────────────────────────────────────
app = FastAPI(
    title="Lungent V2.0 Clinical API",
    version=VERSION,
    description=(
        "Clinical pre-screening API — Lungent V2.0, "
        "AI Builders Congress 2026. All prediction endpoints are public for evaluation."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:7860",
        "http://127.0.0.1:7860",
        "https://lungent.vercel.app",
        "https://lungent-webapp.vercel.app",
        "https://hf.space",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)


# ── Pydantic models ───────────────────────────────────────────────
class PatientInput(BaseModel):
    age: int = Field(55, ge=18, le=120)
    bmi: float = Field(25.0, ge=8.0, le=100.0)
    pack_years: float = Field(0.0, ge=0.0, le=300.0)
    resp_burden: bool = False
    chronic_burden: bool = False
    low_access: bool = False
    sex: int = Field(1, ge=1, le=2)
    state: str = ""
    patient_id: str = ""
    packs_per_day: float = 0.0
    years_smoked: float = 0.0
    asthma: bool = False
    copd: bool = False
    heart_attack: bool = False
    chd: bool = False
    stroke: bool = False
    diabetes: bool = False
    height_weight: str = ""
    include_summary: bool = True

    @field_validator("age", mode="before")
    @classmethod
    def sanitize_age(cls, v):
        try:
            val = int(float(v))
            return max(18, min(val, 120))
        except (ValueError, TypeError):
            return 50

    @field_validator("bmi", mode="before")
    @classmethod
    def sanitize_bmi(cls, v):
        try:
            val = float(v)
            return max(8.0, min(val, 100.0))
        except (ValueError, TypeError):
            return 25.0

    @field_validator("pack_years", "packs_per_day", "years_smoked", mode="before")
    @classmethod
    def sanitize_floats(cls, v):
        try:
            val = float(v)
            return max(0.0, min(val, 300.0))
        except (ValueError, TypeError):
            return 0.0

    @field_validator("sex", mode="before")
    @classmethod
    def sanitize_sex(cls, v):
        try:
            val = int(v)
            return 2 if val == 2 else 1
        except (ValueError, TypeError):
            return 1


class SignupInput(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field("clinician")


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class GuidelineQuery(BaseModel):
    query: str = Field(..., min_length=1)
    k: int = Field(3, ge=1, le=10)


# ── Auth dependencies ─────────────────────────────────────────────
def require_auth(creds: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if creds is None:
        raise HTTPException(401, "Missing Authorization header",
                            headers={"WWW-Authenticate": "Bearer"})
    payload = decode_token(creds.credentials)
    if payload is None:
        raise HTTPException(401, "Invalid or expired token",
                            headers={"WWW-Authenticate": "Bearer"})
    return payload


def require_clinician(payload: dict = Depends(require_auth)) -> dict:
    if payload.get("role") != "clinician":
        raise HTTPException(403, "Clinician role required")
    return payload


# ── Helpers ───────────────────────────────────────────────────────
def _build_patient_dict(p: PatientInput) -> dict:
    return {
        "patient_id": p.patient_id or f"P-{int(datetime.now().timestamp()) % 100000:05d}",
        "age": p.age, "sex": p.sex, "state": p.state, "bmi": p.bmi,
        "height_weight": p.height_weight,
        "packs_per_day": p.packs_per_day, "years_smoked": p.years_smoked,
        "pack_years": p.pack_years,
        "asthma": p.asthma, "copd": p.copd, "resp_burden": int(p.resp_burden),
        "heart_attack": p.heart_attack, "chd": p.chd, "stroke": p.stroke,
        "diabetes": p.diabetes, "chronic_burden": int(p.chronic_burden),
        "low_access": p.low_access,
    }


def _get_aqi_for_state(state: str):
    if not state:
        return None, None, None
    data = get_state_aqi(_aqi_cache, state)
    if not data:
        return None, None, None
    aqi, pm25 = data.get("aqi_5yr"), data.get("pm25_5yr")
    cat = None
    if aqi is not None:
        cat = 0 if aqi < 50 else 1 if aqi < 100 else 2 if aqi < 150 else 3 if aqi < 200 else 4
    return aqi, pm25, cat


def _ollama_summary(prompt: str) -> Optional[str]:
    """Call Ollama and return generated text, or None on failure."""
    try:
        r = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.2, "num_predict": 200},
            },
            timeout=3,
        )
        if r.status_code == 200:
            txt = r.json().get("response", "").strip()
            if txt:
                return txt
    except Exception as e:
        logger.warning(f"Ollama summary failed: {e}")
    return None


def _groq_summary(prompt: str) -> Optional[str]:
    """Call Groq API as fallback when Ollama is unavailable."""
    if not GROQ_API_KEY:
        return None
    try:
        r = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are a clinical pulmonologist writing concise chart notes. "
                            "Be objective, factual, and avoid bullet points."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.2,
                "max_tokens": 200,
            },
            timeout=30,
        )
        if r.status_code == 200:
            txt = r.json()["choices"][0]["message"]["content"].strip()
            if txt:
                logger.info("Groq fallback used for clinical summary")
                return txt
    except Exception as e:
        logger.warning(f"Groq summary failed: {e}")
    return None


def _generate_clinical_summary(
    patient: dict, tier: str, recommendation: str, aqi_5yr: Optional[float]
) -> str:
    """Generate a 2-sentence clinical summary. Tries Ollama first, then Groq, then fallback."""
    age = patient.get("age", 50)
    pkyrs = patient.get("pack_years", 0.0)
    resp = "Present" if patient.get("resp_burden") else "Absent"
    chronic = "Present" if patient.get("chronic_burden") else "Absent"
    aqi_val = aqi_5yr if aqi_5yr is not None else "unknown"
    state = patient.get("state", "Unknown")

    fallback = (
        f"Clinical Evaluation: Patient presents with cumulative tobacco exposure of "
        f"{pkyrs:.1f} pack-years and {resp.lower()} respiratory burden. With 5-year "
        f"ambient exposure (AQI {aqi_val}) in {state}, the ensemble stratifies this "
        f"patient into the '{tier}' category. Recommendation: {recommendation}"
    )

    prompt = f"""You are a clinical pulmonologist writing a concise 2-sentence chart note.

- Age: {age} years
- Pack-Years: {pkyrs:.1f}
- Respiratory Burden: {resp}
- Chronic Disease: {chronic}
- Region: {state} (5-yr AQI: {aqi_val})
- Triage: {tier}

Write an objective, factual clinical assessment without bullet points."""

    # 1️⃣ Try Ollama
    result = _ollama_summary(prompt)
    if result:
        return result

    # 2️⃣ Groq fallback
    result = _groq_summary(prompt)
    if result:
        return result

    # 3️⃣ Static fallback
    return fallback


def _check_ollama_status() -> dict:
    """Return a dict with Ollama availability info."""
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if r.status_code == 200:
            models = [m.get("name", "") for m in r.json().get("models", [])]
            model_present = any(OLLAMA_MODEL in m for m in models)
            return {"available": True, "model_present": model_present, "models": models}
    except Exception as e:
        return {"available": False, "error": str(e)}
    return {"available": False, "error": "Unexpected response"}


def _check_rag_available() -> bool:
    if _DISABLE_RAG:
        return False
    try:
        import chromadb  # noqa: F401
        return True
    except Exception:
        return False


# ── Health endpoints ──────────────────────────────────────────────
@app.get("/health")
def health_simple():
    """Quick liveness probe returning {'status': 'ok'} immediately."""
    return {
        "status": "ok",
        "model_loaded": _model_loaded,
        "aqi_states_cached": len(_aqi_cache.get("states", {})),
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/api/health")
def health_detailed():
    """Detailed health check for the hackathon demo dashboard."""
    ollama_status = _check_ollama_status()
    rag_ok = _check_rag_available()

    return {
        "status": "ok",
        "version": VERSION,
        "project": "Lungent_Hackathon_Edition — AI Builders Congress 2026",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": _model_loaded,
        "aqi_states_count": len(_aqi_cache.get("states", {})),
        "rag_available": rag_ok,
        "rag_disabled": _DISABLE_RAG,
        "ollama": {
            "url": OLLAMA_URL,
            "model": OLLAMA_MODEL,
            **ollama_status,
        },
        "groq": {
            "configured": bool(GROQ_API_KEY),
            "model": GROQ_MODEL,
        },
        "cors": "open (allow_origins=[*])",
    }


# ── Auth endpoints ────────────────────────────────────────────────
@app.post("/auth/signup")
def signup(body: SignupInput):
    if body.role not in ("clinician", "auditor"):
        raise HTTPException(400, "role must be 'clinician' or 'auditor'")
    if get_user_by_email(body.email):
        raise HTTPException(409, "Email already registered")
    user_id = create_user(body.name, body.email, body.password, body.role)
    token = create_token(user_id, body.email.lower(), body.role)
    return {
        "token": token,
        "user": {"id": user_id, "name": body.name, "email": body.email.lower(), "role": body.role},
    }


@app.post("/auth/login")
def login(body: LoginInput):
    user = get_user_by_email(body.email)
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    update_last_login(user["id"])
    token = create_token(user["id"], user["email"], user["role"])
    return {
        "token": token,
        "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]},
    }


@app.get("/auth/me")
def me(payload: dict = Depends(require_auth)):
    user = get_user_by_id(int(payload["sub"]))
    if not user:
        raise HTTPException(404, "User not found")
    return {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]}


# ── Data endpoints ────────────────────────────────────────────────
@app.get("/api/states")
def get_states():
    out = []
    for name, data in _aqi_cache.get("states", {}).items():
        aqi = data.get("aqi_5yr")
        out.append({
            "name": name,
            "aqi_5yr": aqi,
            "pm25_5yr": data.get("pm25_5yr"),
            "aqi_category": None if aqi is None else (
                0 if aqi < 50 else 1 if aqi < 100 else 2 if aqi < 150 else 3 if aqi < 200 else 4
            ),
        })
    return sorted(out, key=lambda x: x["name"])


@app.get("/api/aqi/{state}")
def get_aqi(state: str):
    aqi, pm25, cat = _get_aqi_for_state(state)
    if aqi is None:
        raise HTTPException(404, f"No AQI data for state: {state}")
    return {"state": state, "aqi_5yr": aqi, "pm25_5yr": pm25, "aqi_category": cat}


# ── Clinical endpoints (PUBLIC for hackathon demo) ─────────────────
@app.post("/api/predict")
def predict(patient: PatientInput):
    """Predict lung cancer risk — PUBLIC endpoint (no auth required for demo)."""
    patient_dict = _build_patient_dict(patient)
    aqi, pm25, cat = _get_aqi_for_state(patient.state)
    patient_dict["aqi_5yr"] = aqi
    patient_dict["pm25_5yr"] = pm25
    try:
        result = get_prediction(patient_dict)
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(500, f"Prediction failed: {e}")
    return {
        "prediction": result,
        "aqi": {"aqi_5yr": aqi, "pm25_5yr": pm25, "aqi_category": cat},
    }


@app.post("/api/guidelines")
def guidelines(body: GuidelineQuery, payload: dict = Depends(require_auth)):
    """RAG-powered guideline search (auth required)."""
    try:
        results = search_guidelines(body.query, k=body.k)
    except Exception as e:
        logger.exception("RAG failed")
        raise HTTPException(500, f"RAG failed: {e}")
    return {"guidelines": results}


def _run_analyze(patient: PatientInput, include_summary: Optional[bool] = None) -> dict:
    """Shared analysis logic used by /api/analyze and /api/analyze/public."""
    if include_summary is None:
        include_summary = patient.include_summary
    patient_dict = _build_patient_dict(patient)
    aqi, pm25, cat = _get_aqi_for_state(patient.state)
    patient_dict["aqi_5yr"] = aqi
    patient_dict["pm25_5yr"] = pm25

    try:
        prediction = get_prediction(patient_dict)
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(500, f"Prediction failed: {e}")

    tier = prediction["tier"]
    recommendation = prediction["recommendation"]

    query = f"lung cancer screening age {patient.age} pack-years {patient.pack_years:.1f} tier {tier}"
    try:
        guidelines_list = search_guidelines(query, k=3)
    except Exception as e:
        logger.warning(f"RAG failed: {e}")
        guidelines_list = []

    summary_text = ""
    if include_summary:
        summary_text = _generate_clinical_summary(patient_dict, tier, recommendation, aqi)

    return {
        "prediction": prediction,
        "guidelines": guidelines_list,
        "summary": summary_text,
        "aqi": {"aqi_5yr": aqi, "pm25_5yr": pm25, "aqi_category": cat},
        "patient": patient_dict,
    }


@app.post("/api/analyze")
def analyze(patient: PatientInput, include_summary: bool = True):
    """One-shot: predict + guidelines + summary — PUBLIC for hackathon demo."""
    return _run_analyze(patient, include_summary)


@app.post("/api/analyze/public")
def analyze_public(patient: PatientInput, include_summary: bool = True):
    """Explicit public alias for /api/analyze — no auth required."""
    return _run_analyze(patient, include_summary)


@app.post("/api/report")
def report(patient: PatientInput):
    """Generate PDF clinical report — PUBLIC for hackathon demo."""
    patient_dict = _build_patient_dict(patient)
    aqi, pm25, cat = _get_aqi_for_state(patient.state)
    patient_dict["aqi_5yr"] = aqi
    patient_dict["pm25_5yr"] = pm25

    try:
        prediction = get_prediction(patient_dict)
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(500, f"Prediction failed: {e}")

    query = f"lung cancer screening age {patient.age} pack-years {patient.pack_years:.1f} tier {prediction['tier']}"
    try:
        guidelines_list = search_guidelines(query, k=3)
    except Exception:
        guidelines_list = []

    summary_text = _generate_clinical_summary(
        patient_dict, prediction["tier"], prediction["recommendation"], aqi
    )

    try:
        pdf_bytes = generate_clinical_report(
            patient=patient_dict,
            input_data={"AQI_5YR": aqi, "PM25_5YR": pm25, "AQI_CATEGORY": cat},
            tier=prediction["tier"],
            recommendation=prediction["recommendation"],
            risk_score=prediction["risk_score"],
            contributing_factors=prediction.get("contributing_factors", []),
            guidelines=guidelines_list,
            ai_summary=summary_text,
            team_info=REPORT_CONFIG,
            ci_lower=prediction.get("ci_lower"),
            ci_upper=prediction.get("ci_upper"),
            shap_items=prediction.get("shap_items", []),
            is_deidentified=False,
            logo_path=LOGO_PATH if os.path.exists(LOGO_PATH) else None,
            watermark_path=WATERMARK_PATH if os.path.exists(WATERMARK_PATH) else None,
        )
    except Exception as e:
        logger.exception("PDF generation failed")
        raise HTTPException(500, f"PDF generation failed: {e}")

    filename = f"Lungent_{patient_dict['patient_id']}_{datetime.now():%Y%m%d_%H%M}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
