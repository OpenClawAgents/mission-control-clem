#!/bin/bash
# Mission Control startup script
# Starts Next.js production server and Cloudflare tunnel

set -e

PROJECT_DIR="$HOME/.openclaw/workspace/mission-control-clem"
LOG_DIR="$PROJECT_DIR/logs"
PID_DIR="$PROJECT_DIR/pids"

mkdir -p "$LOG_DIR" "$PID_DIR"

# Kill existing processes
if [ -f "$PID_DIR/next.pid" ]; then
  OLD_PID=$(cat "$PID_DIR/next.pid")
  kill "$OLD_PID" 2>/dev/null || true
  rm -f "$PID_DIR/next.pid"
fi
if [ -f "$PID_DIR/cloudflared.pid" ]; then
  OLD_PID=$(cat "$PID_DIR/cloudflared.pid")
  kill "$OLD_PID" 2>/dev/null || true
  rm -f "$PID_DIR/cloudflared.pid"
fi

# Wait for ports to free
sleep 1

# Start Next.js production server
cd "$PROJECT_DIR"
nohup npx next start -p 3000 > "$LOG_DIR/next-stdout.log" 2> "$LOG_DIR/next-stderr.log" &
echo $! > "$PID_DIR/next.pid"
echo "Next.js started (PID: $(cat "$PID_DIR/next.pid"))"

# Wait for Next.js to be ready
for i in {1..30}; do
  if curl -s -o /dev/null http://localhost:3000 2>/dev/null; then
    echo "Next.js is ready on http://localhost:3000"
    break
  fi
  sleep 1
done

# Start Cloudflare Tunnel
nohup /opt/homebrew/bin/cloudflared tunnel --url http://localhost:3000 > "$LOG_DIR/cloudflared-stdout.log" 2> "$LOG_DIR/cloudflared-stderr.log" &
echo $! > "$PID_DIR/cloudflared.pid"
echo "Cloudflare Tunnel started (PID: $(cat "$PID_DIR/cloudflared.pid"))"

# Wait for tunnel URL to appear
sleep 8
TUNNEL_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG_DIR/cloudflared-stderr.log" 2>/dev/null | head -1)
if [ -n "$TUNNEL_URL" ]; then
  echo ""
  echo "========================================="
  echo "  Mission Control is LIVE!"
  echo "  Local:  http://localhost:3000"
  echo "  Remote: $TUNNEL_URL"
  echo "========================================="
  echo ""
  # Save the URL for other tools to read
  echo "$TUNNEL_URL" > "$PID_DIR/tunnel-url.txt"
else
  echo "Tunnel URL not found yet. Check $LOG_DIR/cloudflared-stderr.log"
fi