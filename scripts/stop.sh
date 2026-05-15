#!/bin/bash
# Mission Control stop script

PROJECT_DIR="$HOME/.openclaw/workspace/mission-control-clem"
PID_DIR="$PROJECT_DIR/pids"

echo "Stopping Mission Control..."

for pidfile in next.pid cloudflared.pid gateway-tunnel.pid; do
  if [ -f "$PID_DIR/$pidfile" ]; then
    PID=$(cat "$PID_DIR/$pidfile")
    kill "$PID" 2>/dev/null && echo "Stopped $pidfile (PID: $PID)" || echo "$pidfile already stopped"
    rm -f "$PID_DIR/$pidfile"
  fi
done

# Also kill any leftover processes
lsof -ti:3000 2>/dev/null | xargs kill 2>/dev/null || true
pkill -f "cloudflared tunnel" 2>/dev/null || true

rm -f "$PID_DIR/dashboard-url.txt" "$PID_DIR/gateway-url.txt"

echo "Mission Control stopped."