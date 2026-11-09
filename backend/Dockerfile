# ==============================================================================
# Dockerfile for Lungent V2.0 Clinical AI Backend
# Target: Hugging Face Spaces (CPU Basic: 16 GB RAM / 2 vCPU)
# Port: 7860
# ==============================================================================

FROM python:3.11-slim

# Prevent Python from writing .pyc files & enable unbuffered stdout/stderr logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies (build-essential, libgomp1 for LightGBM/XGBoost OpenMP support, curl for health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces requirement: run as non-root user with UID 1000
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Copy dependency manifest and install with --no-cache-dir
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code and artifacts
COPY --chown=user . .

# Expose default routing port
EXPOSE 7860

# Start Uvicorn with 1 worker and 10 concurrency limit to stay under 512MB RAM
ENV PORT=7860
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860} --workers 1 --limit-concurrency 10"]

