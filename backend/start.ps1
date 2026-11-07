Write-Host "=== Lungent Backend ===" -ForegroundColor Cyan
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
Write-Host "Starting FastAPI..." -ForegroundColor Green
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
