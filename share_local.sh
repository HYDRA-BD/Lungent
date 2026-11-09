#!/usr/bin/env bash
# ==============================================================================
# share_local.sh — Lungent Local Deployment & Internet Sharing Tunnel
# Optimized for macOS (Apple Silicon M-Series / M4) & Linux
# ==============================================================================

set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "========================================================================"
echo "   🫁 LUNGENT V2.0 — LOCAL HOST & INTERNET TUNNELING ORCHESTRATOR       "
echo "   Tailored for Apple Silicon M4 / macOS / Linux                        "
echo "========================================================================"
echo -e "${NC}"

# 1. Resolve Project Root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "$SCRIPT_DIR/backend" ] && [ -d "$SCRIPT_DIR/frontend" ]; then
    BASE_DIR="$SCRIPT_DIR"
elif [ -d "$SCRIPT_DIR/Lungent V2.0" ]; then
    BASE_DIR="$SCRIPT_DIR/Lungent V2.0"
else
    echo -e "${RED}Error: Could not locate backend and frontend directories.${NC}"
    exit 1
fi

BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/frontend"

# 2. Check Prerequisites
echo -e "${YELLOW}[1/5] Checking System Prerequisites...${NC}"

if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js v18+ (https://nodejs.org).${NC}"
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}Error: npm is not installed.${NC}"
    exit 1
fi

PYTHON_CMD=""
if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
else
    echo -e "${RED}Error: Python 3 is not installed. Please install Python 3.10+ (brew install python).${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v)${NC}"
echo -e "${GREEN}✓ npm $(npm -v)${NC}"
echo -e "${GREEN}✓ Python $($PYTHON_CMD --version)${NC}"

# 3. Cleanup Trap
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping all services and tunnels...${NC}"
    if [ -n "${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "${FRONTEND_PID:-}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    if [ -n "${BACKEND_TUNNEL_PID:-}" ] && kill -0 "$BACKEND_TUNNEL_PID" 2>/dev/null; then
        kill "$BACKEND_TUNNEL_PID" 2>/dev/null || true
    fi
    if [ -n "${FRONTEND_TUNNEL_PID:-}" ] && kill -0 "$FRONTEND_TUNNEL_PID" 2>/dev/null; then
        kill "$FRONTEND_TUNNEL_PID" 2>/dev/null || true
    fi
    rm -f /tmp/lungent_tunnel_backend.log /tmp/lungent_tunnel_frontend.log
    echo -e "${GREEN}Shutdown complete.${NC}"
    exit 0
}
trap cleanup EXIT INT TERM

# 4. Start FastAPI Backend (Port 8000)
echo ""
echo -e "${YELLOW}[2/5] Starting FastAPI Backend on http://localhost:8000...${NC}"
cd "$BACKEND_DIR"

export PYTHONUNBUFFERED=1
export DISABLE_RAG=1

# Check if venv exists, otherwise create or use python env
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment in backend/.venv..."
    $PYTHON_CMD -m venv .venv
fi

# Activate venv
source .venv/bin/activate

# Install / update backend dependencies
echo "Verifying backend dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt || true

# Start uvicorn with Mac M4 single worker + concurrency 100
echo -e "${CYAN}Launching Uvicorn server (--workers 1 --limit-concurrency 100)...${NC}"
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1 --limit-concurrency 100 > /tmp/lungent_backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend health
echo "Awaiting backend readiness..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is live and healthy at http://localhost:8000${NC}"
        break
    fi
    sleep 1
    if [ "$i" -eq 30 ]; then
        echo -e "${RED}Backend failed to start in 30 seconds. Check /tmp/lungent_backend.log:${NC}"
        tail -n 20 /tmp/lungent_backend.log
        exit 1
    fi
done

# 5. Start Next.js Frontend (Port 3000)
echo ""
echo -e "${YELLOW}[3/5] Starting Next.js Frontend on http://localhost:3000...${NC}"
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install --silent
fi

npm run dev -- -p 3000 > /tmp/lungent_frontend.log 2>&1 &
FRONTEND_PID=$!

echo "Awaiting frontend compilation..."
for i in {1..40}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Frontend is live at http://localhost:3000${NC}"
        break
    fi
    sleep 1
    if [ "$i" -eq 40 ]; then
        echo -e "${RED}Frontend failed to respond in 40 seconds. Check /tmp/lungent_frontend.log:${NC}"
        tail -n 20 /tmp/lungent_frontend.log
        exit 1
    fi
done

# 6. Expose Localhost to the Internet via Localtunnel
echo ""
echo -e "${YELLOW}[4/5] Establishing Public Internet Tunnels (localtunnel)...${NC}"
rm -f /tmp/lungent_tunnel_backend.log /tmp/lungent_tunnel_frontend.log

# Start backend tunnel on 8000
npx --yes localtunnel --port 8000 > /tmp/lungent_tunnel_backend.log 2>&1 &
BACKEND_TUNNEL_PID=$!

# Start frontend tunnel on 3000
npx --yes localtunnel --port 3000 > /tmp/lungent_tunnel_frontend.log 2>&1 &
FRONTEND_TUNNEL_PID=$!

# Wait for URLs to be generated
BACKEND_URL=""
FRONTEND_URL=""

for i in {1..20}; do
    if [ -z "$BACKEND_URL" ] && grep -q "url is:" /tmp/lungent_tunnel_backend.log 2>/dev/null; then
        BACKEND_URL=$(grep "url is:" /tmp/lungent_tunnel_backend.log | awk '{print $NF}')
    fi
    if [ -z "$FRONTEND_URL" ] && grep -q "url is:" /tmp/lungent_tunnel_frontend.log 2>/dev/null; then
        FRONTEND_URL=$(grep "url is:" /tmp/lungent_tunnel_frontend.log | awk '{print $NF}')
    fi
    if [ -n "$BACKEND_URL" ] && [ -n "$FRONTEND_URL" ]; then
        break
    fi
    sleep 1
done

# 7. Print Shareable Output & Next Steps
echo ""
echo -e "${GREEN}${BOLD}========================================================================${NC}"
echo -e "${GREEN}${BOLD}   🚀 LUNGENT IS LIVE & READY TO SHARE!                                ${NC}"
echo -e "${GREEN}${BOLD}========================================================================${NC}"
echo ""
echo -e "${BOLD}Local URLs:${NC}"
echo -e "  • Frontend:  ${CYAN}http://localhost:3000${NC}"
echo -e "  • Backend:   ${CYAN}http://localhost:8000${NC}"
echo -e "  • API Docs:  ${CYAN}http://localhost:8000/docs${NC}"
echo ""
echo -e "${BOLD}Public Shareable URLs (Share these with external testers):${NC}"
if [ -n "$FRONTEND_URL" ]; then
    echo -e "  • 🌐 Frontend (Web App):  ${GREEN}${BOLD}$FRONTEND_URL${NC}"
else
    echo -e "  • 🌐 Frontend:  ${YELLOW}Pending / run 'npx localtunnel --port 3000' in another tab${NC}"
fi

if [ -n "$BACKEND_URL" ]; then
    echo -e "  • ⚙️  Backend (FastAPI):  ${CYAN}$BACKEND_URL${NC}"
else
    echo -e "  • ⚙️  Backend:   ${YELLOW}Pending / run 'npx localtunnel --port 8000' in another tab${NC}"
fi

echo ""
echo -e "${YELLOW}${BOLD}⚠️  CRITICAL CONFIGURATION NOTICE FOR SHAREABLE TESTING:${NC}"
echo -e "When external users test the assessment form via the public frontend URL,"
echo -e "ensure your frontend communicates with the public backend tunnel:"
if [ -n "$BACKEND_URL" ]; then
    echo -e "  Update ${BOLD}$FRONTEND_DIR/.env.local${NC} with:"
    echo -e "  ${CYAN}NEXT_PUBLIC_API_URL=$BACKEND_URL${NC}"
fi
echo ""
echo -e "${BOLD}Press [Ctrl + C] anytime to gracefully terminate the servers and tunnels.${NC}"
echo ""

# Keep alive
wait
