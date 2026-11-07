# Lungent V2.0 - Automated Multi-Process Launcher
# Launches FastAPI backend on port 8000 and Next.js frontend on port 3000

$root = $PSScriptRoot
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   🫁 Launching Lungent V2.0 (Clinical AI Pre-Screening)   " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Detect Python venv
$python = "python"
if (Test-Path "$root\..\LungCancer.NET\.venv\Scripts\python.exe") {
    $python = "$root\..\LungCancer.NET\.venv\Scripts\python.exe"
    Write-Host "[Launcher] Using virtual environment: $python" -ForegroundColor Yellow
}

# 2. Start FastAPI Backend in background job
Write-Host "[Launcher] Starting FastAPI backend on http://localhost:8000 (Swagger docs at /docs)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; & '$python' -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 2

# 3. Start Next.js Frontend
Write-Host "[Launcher] Starting Next.js 16 frontend on http://localhost:3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; pnpm run dev"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Lungent V2.0 is starting up!                           " -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000                        " -ForegroundColor White
Write-Host "   Backend API Docs: http://localhost:8000/docs           " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

