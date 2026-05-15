#!/bin/bash
# Mission Control startup script
# Starts: Next.js production server, Cloudflare dashboard tunnel, Cloudflare Gateway tunnel

set -e

PROJECT_DIR="$HOME/.openclaw/workspace/mission-control-clem"
LOG_DIR="$PROJECT_DIR/logs"
PID_DIR="$PROJECT_DIR/pids"

mkdir -p "$LOG_DIR" "$PID_DIR"

# Kill existing processes
if [ -f "$PID_DIR/next.pid" ]; then
  kill "$(cat "$PID_DIR/next.pid")" 2>/dev/null || true
  rm -f "$PID_DIR/next.pid"
fi
if [ -f "$PID_DIR/cloudflared.pid" ]; then
  kill "$(cat "$PID_DIR/cloudflared.pid")" 2>/dev/null || true
  rm -f "$PID_DIR/cloudflared.pid"
fi
if [ -f "$PID_DIR/gateway-tunnel.pid" ]; then
  kill "$(cat "$PID_DIR/gateway-tunnel.pid")" 2>/dev/null || true
  rm -f "$PID_DIR/gateway-tunnel.pid"
fi
lsof -ti:3000 2>/dev/null | xargs kill 2>/dev/null || true

sleep 1

# 1. Start Next.js production server
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

# 2. Start Cloudflare Tunnel for Dashboard (port 3000)
nohup /opt/homebrew/bin/cloudflared tunnel --url http://localhost:3000 > "$LOG_DIR/cloudflared-stdout.log" 2> "$LOG_DIR/cloudflared-stderr.log" &
echo $! > "$PID_DIR/cloudflared.pid"
echo "Dashboard tunnel started (PID: $(cat "$PID_DIR/cloudflared.pid"))"

# 3. Start Cloudflare Tunnel for Gateway (port 18789)
nohup /opt/homebrew/bin/cloudflared tunnel --url http://127.0.0.1:18789 > "$LOG_DIR/gateway-tunnel-stdout.log" 2> "$LOG_DIR/gateway-tunnel-stderr.log" &
echo $! > "$PID_DIR/gateway-tunnel.pid"
echo "Gateway tunnel started (PID: $(cat "$PID_DIR/gateway-tunnel.pid"))"

# Wait for tunnel URLs
sleep 8
DASHBOARD_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG_DIR/cloudflared-stderr.log" 2>/dev/null | head -1)
GATEWAY_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG_DIR/gateway-tunnel-stderr.log" 2>/dev/null | head -1)

echo ""
echo "========================================="
echo "  Mission Control is LIVE!"
echo "  Local:    http://localhost:3000"
echo "  Dashboard: $DASHBOARD_URL"
echo "  Gateway:  $GATEWAY_URL"
echo "========================================="
echo ""

# Save URLs for other tools
echo "$DASHBOARD_URL" > "$PID_DIR/dashboard-url.txt"
echo "$GATEWAY_URL" > "$PID_DIR/gateway-url.txt"

# Update .env.local with Gateway URL for local server
if [ -n "$GATEWAY_URL" ]; then
  TOKEN=$(python3 -c "import json; c=json.load(open('$HOME/.openclaw/openclaw.json')); print(c['gateway']['auth']['token'])")
  # Update OPENCLAW_GATEWAY_HOST in .env.local
  sed -i.bak "s|^OPENCLAW_GATEWAY_HOST=.*|OPENCLAW_GATEWAY_HOST=${GATEWAY_URL#https://}|" "$PROJECT_DIR/.env.local" 2>/dev/null || true
  echo "Updated .env.local with Gateway URL: ${GATEWAY_URL#https://}"
fi