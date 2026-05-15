#!/bin/bash
# Mission Control startup script
# Starts: Cloudflare tunnels (dashboard + gateway), then Next.js
# Tunnels must start first so we get URLs before Next.js reads .env.local

set -e

PROJECT_DIR="$HOME/.openclaw/workspace/mission-control-clem"
LOG_DIR="$PROJECT_DIR/logs"
PID_DIR="$PROJECT_DIR/pids"

mkdir -p "$LOG_DIR" "$PID_DIR"

# Kill existing processes
for pidfile in next.pid cloudflared.pid gateway-tunnel.pid; do
  if [ -f "$PID_DIR/$pidfile" ]; then
    kill "$(cat "$PID_DIR/$pidfile")" 2>/dev/null || true
    rm -f "$PID_DIR/$pidfile"
  fi
done
lsof -ti:3000 2>/dev/null | xargs kill 2>/dev/null || true
pkill -f "cloudflared tunnel" 2>/dev/null || true

sleep 1

cd "$PROJECT_DIR"

# 1. Start Cloudflare Tunnel for Dashboard (port 3000)
nohup /opt/homebrew/bin/cloudflared tunnel --url http://localhost:3000 > "$LOG_DIR/cloudflared-stdout.log" 2> "$LOG_DIR/cloudflared-stderr.log" &
echo $! > "$PID_DIR/cloudflared.pid"
echo "Dashboard tunnel started (PID: $(cat "$PID_DIR/cloudflared.pid"))"

# 2. Start Cloudflare Tunnel for Gateway (port 18789)
nohup /opt/homebrew/bin/cloudflared tunnel --url http://127.0.0.1:18789 > "$LOG_DIR/gateway-tunnel-stdout.log" 2> "$LOG_DIR/gateway-tunnel-stderr.log" &
echo $! > "$PID_DIR/gateway-tunnel.pid"
echo "Gateway tunnel started (PID: $(cat "$PID_DIR/gateway-tunnel.pid"))"

# Wait for tunnel URLs
echo "Waiting for tunnel URLs..."
for i in {1..20}; do
  DASHBOARD_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG_DIR/cloudflared-stderr.log" 2>/dev/null | head -1)
  GATEWAY_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG_DIR/gateway-tunnel-stderr.log" 2>/dev/null | head -1)
  if [ -n "$DASHBOARD_URL" ] && [ -n "$GATEWAY_URL" ]; then
    echo "Got tunnel URLs!"
    break
  fi
  sleep 2
done

# Save URLs
echo "$DASHBOARD_URL" > "$PID_DIR/dashboard-url.txt"
echo "$GATEWAY_URL" > "$PID_DIR/gateway-url.txt"

# Update .env.local with Gateway URL BEFORE starting Next.js
if [ -n "$GATEWAY_URL" ]; then
  GW_HOST="${GATEWAY_URL#https://}"
  # Update or add OPENCLAW_GATEWAY_HOST
  if grep -q "^OPENCLAW_GATEWAY_HOST=" "$PROJECT_DIR/.env.local"; then
    sed -i.bak "s|^OPENCLAW_GATEWAY_HOST=.*|OPENCLAW_GATEWAY_HOST=$GW_HOST|" "$PROJECT_DIR/.env.local"
  else
    echo "OPENCLAW_GATEWAY_HOST=$GW_HOST" >> "$PROJECT_DIR/.env.local"
  fi
  echo "Updated .env.local with Gateway host: $GW_HOST"
  
  # Update or add DASHBOARD_URL
  if grep -q "^DASHBOARD_URL=" "$PROJECT_DIR/.env.local"; then
    sed -i.bak2 "s|^DASHBOARD_URL=.*|DASHBOARD_URL=$DASHBOARD_URL|" "$PROJECT_DIR/.env.local"
  else
    echo "DASHBOARD_URL=$DASHBOARD_URL" >> "$PROJECT_DIR/.env.local"
  fi
  echo "Updated .env.local with Dashboard URL: $DASHBOARD_URL"
  
  # Also update or add Gateway token
  TOKEN=$(python3 -c "import json; c=json.load(open('$HOME/.openclaw/openclaw.json')); print(c['gateway']['auth']['token'])" 2>/dev/null || echo "")
  if [ -n "$TOKEN" ]; then
    if grep -q "^OPENCLAW_GATEWAY_TOKEN=" "$PROJECT_DIR/.env.local"; then
      sed -i.bak3 "s|^OPENCLAW_GATEWAY_TOKEN=.*|OPENCLAW_GATEWAY_TOKEN=$TOKEN|" "$PROJECT_DIR/.env.local"
    else
      echo "OPENCLAW_GATEWAY_TOKEN=$TOKEN" >> "$PROJECT_DIR/.env.local"
    fi
  fi
fi

rm -f "$PROJECT_DIR/.env.local.bak" "$PROJECT_DIR/.env.local.bak2" "$PROJECT_DIR/.env.local.bak3"

# 3. Start Next.js production server (reads .env.local at startup)
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

echo ""
echo "========================================="
echo "  Mission Control is LIVE!"
echo "  Local:    http://localhost:3000"
echo "  Dashboard: $DASHBOARD_URL"
echo "  Gateway:  $GATEWAY_URL"
echo "========================================="