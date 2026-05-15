#!/bin/bash
# Mission Control stop script

PROJECT_DIR="$HOME/.openclaw/workspace/mission-control-clem"
PID_DIR="$PROJECT_DIR/pids"

echo "Stopping Mission Control..."

# Kill Next.js
if [ -f "$PID_DIR/next.pid" ]; then
  PID=$(cat "$PID_DIR/next.pid")
  kill "$PID" 2>/dev/null && echo "Next.js stopped (PID: $PID)" || echo "Next.js already stopped"
  rm -f "$PID_DIR/next.pid"
fi

# Kill Cloudflare Tunnel
if [ -f "$PID_DIR/cloudflared.pid" ]; then
  PID=$(cat "$PID_DIR/cloudflared.pid")
  kill "$PID" 2>/dev/null && echo "Cloudflare Tunnel stopped (PID: $PID)" || echo "Cloudflare Tunnel already stopped"
  rm -f "$PID_DIR/cloudflared.pid"
fi

# Also kill any leftover processes on port 3000
lsof -ti:3000 2>/dev/null | xargs kill 2>/dev/null || true
pkill -f "cloudflared tunnel" 2>/dev/null || true

rm -f "$PID_DIR/tunnel-url.txt"

echo "Mission Control stopped."