#!/usr/bin/env bash
set -e
echo "=== Lungent Backend ==="
echo "Starting FastAPI (Render-optimized single worker)..."
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1 --limit-concurrency 100
