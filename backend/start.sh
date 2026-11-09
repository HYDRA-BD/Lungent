#!/usr/bin/env bash
set -e
echo "=== Lungent Backend (Render 512MB RAM Optimized) ==="
PORT="${PORT:-8000}"
echo "Starting Uvicorn on port $PORT (1 worker, limit-concurrency 10)..."
exec uvicorn main:app --host 0.0.0.0 --port "$PORT" --workers 1 --limit-concurrency 10
