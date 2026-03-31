#!/usr/bin/env bash
set -euo pipefail
APP_DIR="/home/frappe/frappe-bench/apps/aau_university/AAU-16.24"
LOG_FILE="/home/frappe/frappe-bench/logs/aau_frontend_3000.log"
SUPERVISOR="$APP_DIR/deploy/run_auusite_frontend_supervisor.sh"
cd "$APP_DIR"
mkdir -p /home/frappe/frappe-bench/logs
if pgrep -f "$SUPERVISOR" >/dev/null 2>&1; then
  exit 0
fi
nohup "$SUPERVISOR" >> "$LOG_FILE" 2>&1 &
disown || true
