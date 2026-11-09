@echo off
setlocal enabledelayedexpansion
title Lungent V2.0 - Local Host & Internet Tunneling

echo ========================================================================
echo    LUNGENT V2.0 - LOCAL HOST & INTERNET TUNNELING ORCHESTRATOR
echo ========================================================================
echo.

set "SCRIPT_DIR=%~dp0"
if exist "%SCRIPT_DIR%backend" (
    set "BASE_DIR=%SCRIPT_DIR%"
) else if exist "%SCRIPT_DIR%Lungent V2.0\backend" (
    set "BASE_DIR=%SCRIPT_DIR%Lungent V2.0"
) else (
    echo [ERROR] Could not find Lungent V2.0 directory containing backend and frontend.
    pause
    exit /b 1
)

set "BACKEND_DIR=%BASE_DIR%\backend"
set "FRONTEND_DIR=%BASE_DIR%\frontend"

echo [1/4] Checking System Prerequisites...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v18+.
    pause
    exit /b 1
)

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed. Please install Python 3.10+.
    pause
    exit /b 1
)

echo [2/4] Starting FastAPI Backend on port 8000 (Optimized single worker)...
cd /d "%BACKEND_DIR%"
set PYTHONUNBUFFERED=1
set DISABLE_RAG=1
start "Lungent Backend (Port 8000)" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1 --limit-concurrency 100"

echo [3/4] Starting Next.js Frontend on port 3000...
cd /d "%FRONTEND_DIR%"
start "Lungent Frontend (Port 3000)" cmd /k "npm run dev -- -p 3000"

echo [4/4] Starting Localtunnel to expose ports to the internet...
start "Backend Tunnel (Port 8000)" cmd /k "npx --yes localtunnel --port 8000"
start "Frontend Tunnel (Port 3000)" cmd /k "npx --yes localtunnel --port 3000"

echo.
echo ========================================================================
echo    SERVICES & TUNNELS LAUNCHED SUCCESSFULLY!
echo ========================================================================
echo.
echo Local URLs:
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:8000
echo   - API Docs: http://localhost:8000/docs
echo.
echo Check the opened tunnel terminal windows for your public URLs.
echo Reminder: In frontend\.env.local, set:
echo   NEXT_PUBLIC_API_URL=https://[YOUR-BACKEND-TUNNEL-URL]
echo.
pause

