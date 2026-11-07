#!/usr/bin/env bash
set -e
echo "=== Lungent Backend ==="
echo "Installing dependencies..."
pip install -r requirements.txt
echo "Starting FastAPI..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
