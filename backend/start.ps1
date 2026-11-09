Write-Host "=== Lungent Backend (Render 512MB RAM Optimized) ===" -ForegroundColor Cyan
Write-Host "Starting FastAPI (1 worker, concurrency 10)..." -ForegroundColor Green
$PORT = if ($env:PORT) { $env:PORT } else { "8000" }
uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1 --limit-concurrency 10
