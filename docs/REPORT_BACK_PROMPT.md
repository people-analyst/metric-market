# Report-Back Prompt for Kanbai Metric Market Work

**Use this prompt** with your local agent (or paste into a chat) to get a concise status report, completed items, open items, and next steps. The agent should read `docs/KANBAI_METRIC_MARKET_STATUS.md` and optionally run verification, then respond in the structure below.

---

## Prompt (copy below)

```
You are reporting back on the Kanbai Metric Market card work. Do the following:

1. Read docs/KANBAI_METRIC_MARKET_STATUS.md (and optionally docs/REFRESH_POLICY_FOR_SPOKE_INTEGRATIONS.md, docs/BUNDLE_CREATION_API_SCHEMA.md, docs/COMPONENT_EXPORT_API.md for detail).

2. Produce a short report with these four sections:

   **STATUS SUMMARY**
   - One paragraph: how many cards completed, how many open, and overall state (e.g. "Kanbai Metric Market work is substantially complete; 24 cards done, 3 open with notes, 2 planned/larger project.")

   **COMPLETED ITEMS**
   - Bullet list of completed card numbers and titles (e.g. "#50 Dev Ops dashboard + 6h push", "#62 RangeBuilderChangeEvent publisher", …). Optionally one line per item on where it lives (file or endpoint).

   **OPEN ITEMS WITH NOTES**
   - For each open item: card number, title, and why it’s open (e.g. blocked on Segmentation Studio, deferred as large project, or planned for later with AnyComp).

   **WHAT THE LOCAL AGENT SHOULD DO TO CLOSE OUT**
   - Numbered list of concrete actions: e.g. (1) Run npm run dev and smoke-test the verification checklist in KANBAI_METRIC_MARKET_STATUS.md, (2) Optionally mark completed cards Done in Kanbai if applicable, (3) Run npm run db:push if fresh deploy, (4) Do not start #105 until segment dimensions are available; treat #5 and #45 as backlog unless prioritized.

3. If the app is runnable, optionally run the Verification Checklist from KANBAI_METRIC_MARKET_STATUS.md and add a short "Verification" subsection: which checks passed or failed (with status code or error if relevant).

4. Keep the report to one page or so; use the status doc as source of truth and do not duplicate long tables.
```

---

## Example output shape (for reference)

- **STATUS SUMMARY:** 1 short paragraph.
- **COMPLETED ITEMS:** ~24 bullets (card # + title, optional location).
- **OPEN ITEMS WITH NOTES:** 3 bullets with card #, title, and note.
- **WHAT THE LOCAL AGENT SHOULD DO TO CLOSE OUT:** 4–5 numbered steps.
- **Verification (optional):** 1 short paragraph or bullet list (passed/failed).

Use this prompt whenever you need a consistent status report or handoff for the Kanbai Metric Market work.
