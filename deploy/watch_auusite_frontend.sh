#!/usr/bin/env bash
set -euo pipefail
if ss -ltn | grep -q ':3000 '; then
  exit 0
fi
/home/frappe/frappe-bench/apps/aau_university/AAU-16.24/deploy/start_auusite_frontend.sh
