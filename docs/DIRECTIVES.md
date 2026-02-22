# Directives — Hub contract (Metric Market spoke)

**Single source of truth:** Hub repo → `docs/DIRECTIVES_SYSTEM.md` (and `HANDOFF_DIRECTIVES_AND_CARDS.md` links to it). This file is a short in-repo reference and copy-paste block for agents.

---

## Contract summary

1. **Env:** Set `HUB_URL` (Hub base URL) and `HUB_API_KEY` (this app’s API key from the Hub registry). Optional: `HUB_APP_SLUG` (default `metric-market`).

2. **Fetch:** Call the Hub (not our own server):
   - `GET {HUB_URL}/api/hub/app/{our-slug}/directives?status=pending`
   - Header: `X-API-Key: {HUB_API_KEY}`

3. **Complete:** After handling each directive, update the Hub:
   - `PATCH {HUB_URL}/api/hub/app/{our-slug}/directives/{directiveId}`
   - Body: `{ "status": "completed", "response": "..." }`
   - Or POST `.../directives/{id}/complete` if the Hub supports it.

4. **Optional:** Expose `POST /api/hub/process-directives` (or `npm run directives`) that fetches from Hub, runs our handler, then PATCHes/complete back.  
   **Metric Market:** Already has `POST /api/hub/process-directives` and Hub SDK polling; handler: `server/directiveHandler.ts`.

---

## Copy-paste block for agents

Use this when aligning this app to the directive contract (e.g. after "Hub returned 502" or "Hub not configured"):

```
Our app reported "Hub returned 502" or "Hub not configured" when checking directives. Do the following so the directive system works:

1. **Env:** Set HUB_URL (Hub base URL) and HUB_API_KEY (this app's API key from the Hub registry). If we use HUB_PAT_TOKEN for the same value, set that.

2. **Fetch:** Call the Hub (not our own server): GET {HUB_URL}/api/hub/app/{our-slug}/directives?status=pending with header X-API-Key: {HUB_API_KEY}. Use our app's slug from the Hub registry (metric-market unless HUB_APP_SLUG is set).

3. **Complete:** After handling each directive, update the Hub: PATCH {HUB_URL}/api/hub/app/{our-slug}/directives/{directiveId} with body { "status": "completed", "response": "..." } or POST .../directives/{id}/complete.

4. **Optional:** Expose POST /api/hub/process-directives (or keep npm run directives) that fetches from Hub, runs our handler, then PATCHes/complete back.

Full contract and troubleshooting: docs/DIRECTIVES_SYSTEM.md in the Hub repo (or ask for the file contents). HANDOFF_DIRECTIVES_AND_CARDS.md links to it.
```

---

## Troubleshooting (quick ref)

| Situation | Action |
|-----------|--------|
| 502 when fetching | Hub was down or threw; now returns 500 + JSON. Check Hub is up and HUB_URL correct; retry; if 500, check Hub logs. |
| 503 / "Hub not configured" | Set HUB_URL and HUB_API_KEY in this app's environment. Get key from Hub Registry. |
| Fetches but never completes | After running the handler, call Hub to update: PATCH status "completed" (or POST …/complete). |
| 401 | Invalid/missing API key. Use app key from Hub Registry; header X-API-Key. |

---

**Last updated:** 2026-02-22
