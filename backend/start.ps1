Write-Host "=== Lungent Backend ===" -ForegroundColor Cyan
Write-Host "Starting FastAPI (Optimized single worker)..." -ForegroundColor Green
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1 --limit-concurrency 100
