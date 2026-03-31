#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/frappe/frappe-bench/apps/aau_university/AAU-16.24"
LOG_FILE="/home/frappe/frappe-bench/logs/aau_frontend_3000.log"
NODE_BIN="/home/frappe/.nvm/versions/node/v20.19.0/bin/node"
NEXT_BIN="$APP_DIR/node_modules/next/dist/bin/next"

cd "$APP_DIR"
mkdir -p /home/frappe/frappe-bench/logs

while true; do
  if ss -ltn | grep -q ':3000 '; then
    sleep 3
    continue
  fi

  "$NODE_BIN" "$NEXT_BIN" dev -H 127.0.0.1 -p 3000 >> "$LOG_FILE" 2>&1 || true
  sleep 2
done
