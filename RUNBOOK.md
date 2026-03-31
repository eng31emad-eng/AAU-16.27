# AAU Frontend Runbook

## Development

```bash
cd /home/frappe/frappe-bench/apps/aau_university/AAU-16.24
rm -f .next/dev/lock
npm run dev:hosted
```

- Domain target: `https://auusite.yemenfrappe.com`
- Local health check: `http://127.0.0.1:3000/api/health`

## Production Build

```bash
cd /home/frappe/frappe-bench/apps/aau_university/AAU-16.24
npm install
npm run build
npm run start:hosted
```

## systemd

```bash
sudo cp deploy/systemd/auusite-frontend.service /etc/systemd/system/auusite-frontend.service
sudo systemctl daemon-reload
sudo systemctl enable --now auusite-frontend
sudo systemctl status auusite-frontend --no-pager
```

## nginx

```bash
sudo cp deploy/nginx/auusite.yemenfrappe.com.conf /etc/nginx/conf.d/auusite.yemenfrappe.com.conf
sudo nginx -t
sudo systemctl reload nginx
```

## Verification

```bash
curl -I http://127.0.0.1:3000/api/health
curl -I https://auusite.yemenfrappe.com/api/health
curl -I https://auusite.yemenfrappe.com
```

## Recovery

```bash
sudo systemctl restart auusite-frontend
sudo systemctl status auusite-frontend --no-pager
journalctl -u auusite-frontend -n 100 --no-pager
```

## Smart Chat Alerts

Environment variables (optional):

```bash
SMARTCHAT_ALERT_WEBHOOK_URL=https://your-webhook-endpoint
SMARTCHAT_ALERT_MIN_LEVEL=critical
SMARTCHAT_ALERT_COOLDOWN_MINUTES=60
```

- Alert source file: `data/analytics/smartchat-feedback.jsonl`
- Alert state file: `data/analytics/smartchat-alert-state.json`
- Alert history log: `data/analytics/smartchat-alerts.jsonl`

Manual operations:

```bash
# Check alert configuration/state
curl -s http://127.0.0.1:3000/api/smartchat/alerts

# Trigger one alert evaluation immediately
curl -s -X POST http://127.0.0.1:3000/api/smartchat/alerts
```

## Smart Chat Evaluation

Evaluation dataset:

- `data/eval/smartchat_eval_dataset.json`

Run evaluation against local API:

```bash
npm run dev:hosted
npm run eval:smartchat
```

Optional environment overrides:

```bash
SMARTCHAT_EVAL_ENDPOINT=http://127.0.0.1:3000/api/smartchat
SMARTCHAT_EVAL_DATASET=data/eval/smartchat_eval_dataset.json
SMARTCHAT_EVAL_TIMEOUT_MS=30000
```

Reports output:

- `data/eval/reports/smartchat-eval-<timestamp>.json`

## Smart Chat Performance & Stability (Phase 9)

New server-side resilience controls:

```bash
SMARTCHAT_CACHE_MAX_ITEMS=600
SMARTCHAT_GEMINI_TIMEOUT_MS=15000
SMARTCHAT_CIRCUIT_FAIL_THRESHOLD=4
SMARTCHAT_CIRCUIT_OPEN_MS=90000
```

Behavior:

- Request timeout is enforced for Gemini calls (embedding and generation).
- Circuit breaker opens after consecutive Gemini failures and temporarily serves KB fallback answers.
- In-flight deduplication merges concurrent identical questions into one backend computation.
- Cache cleanup removes expired entries and caps memory footprint by `SMARTCHAT_CACHE_MAX_ITEMS`.
- API now returns structured error hints (`RATE_LIMIT`, `UPSTREAM_TIMEOUT`, `UPSTREAM_UNAVAILABLE`) and `retryAfterSeconds` when relevant.

## Smart Chat Auto Data Refresh (Phase 10)

Environment variables:

```bash
# Optional token to protect reindex endpoint (recommended in production)
SMARTCHAT_REINDEX_TOKEN=change-me

# FAQ source used to rebuild data/faq_index.json
AAU_API_BASE_URL=https://edu.yemenfrappe.com
SMARTCHAT_FAQ_SOURCE_PATH=/api/faqs

# Persistent KB storage on Supabase (recommended for Vercel)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SMARTCHAT_SUPABASE_KB_TABLE=smartchat_kb_index
SMARTCHAT_SUPABASE_KB_ROW_ID=default

# Optional behavior tuning
SMARTCHAT_REINDEX_TIMEOUT_MS=25000
SMARTCHAT_REINDEX_INCLUDE_UNPUBLISHED=0
```

Supabase table bootstrap:

```bash
# Run SQL from:
deploy/sql/smartchat_kb_index.sql
```

Reindex API:

```bash
# Status
curl -s -H "x-smartchat-reindex-token: $SMARTCHAT_REINDEX_TOKEN" \
  http://127.0.0.1:3000/api/smartchat/reindex

# Trigger rebuild
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-smartchat-reindex-token: $SMARTCHAT_REINDEX_TOKEN" \
  -d '{"reason":"manual_run","force":false}' \
  http://127.0.0.1:3000/api/smartchat/reindex
```

Scheduler (cron / systemd timer):

```bash
# Uses scripts/reindex-smartchat.mjs
SMARTCHAT_REINDEX_ENDPOINT=http://127.0.0.1:3000/api/smartchat/reindex \
SMARTCHAT_REINDEX_TOKEN=change-me \
npm run reindex:smartchat
```

- Admin FAQ CRUD now triggers reindex automatically after create/update/delete.
- If content hash did not change, rebuild is skipped (`reason=no_changes`).
- With Supabase vars configured, chat reads/writes KB from Supabase; file fallback is kept for local/dev safety.
