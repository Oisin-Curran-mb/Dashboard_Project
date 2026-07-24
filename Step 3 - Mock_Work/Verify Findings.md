# Verify Findings — W17 Gifts & Pledges

**Fix attempts this cycle: 0**

Scope: single-widget (W17). Run date: 2026-07-24. Read-only pass; this file is the only write.
Result: **CLEAN** — no actionable findings. One expected carryover (informational, below).

---

## Step 2 — Automated (check-rules.py --widget 17)
`python3 check-rules.py "Dashboard Widget Mockups.html" --widget 17`
- **No automated findings.** 0 HIGH, 0 MED, 0 LOW (T1/T4/T6/T9 clean).

## Step 3 — Judgment pass

### T2 — Fill, don't pin
Tables use `tblScroll(...tH(sz))` at Large/Expanded and `tbl`/`hbars` at Medium/Small — same fill primitives as the other verified widgets. No pinned/dead-space pattern in code. Pass.

### T3 — Frozen paths / dead controls (CRITICAL — the fix)
Every option's views are reachable at every size, KPI included:
- **KPI (`k`/`xk`)** returns `kpiTileMini(overallPct...)` before the option branches — renders for all 3 (fixed overall % Due). No switch at KPI (by design).
- **Option A**: `view==='pie'` and `view==='table'` checked first, else progress-bar list. Small falls through to capped progress bars; pie + table both reachable at Small. No dead control.
- **Option B**: `view==='table'` checked **before** the `sz==='s'` branch — the previously-dead Small toggle now reaches the table. Default Small = paired-metric hbars. Paired bars + table reachable at every size. **Fix confirmed.**
- **Option C**: `view==='table'` checked first, else gap bars. Both reachable at Small (capN→3). No dead control.

### T5 — Axis / value match
- **Option A** `progBar`: bar width = `pct(received,pledged)` and the printed % is the same value. Matches "% funded". Pass.
- **Option B** paired bars: pledged and received heights both scaled to `maxPv` (shared max) — heights = pledged / received. Pass.
- **Option C** gap bars: `hbar(...,$m(g.gap)+' to go', Math.round(g.gap/maxGap*100)...)` — bar length ∝ **gap**, label = **gap**, NOT pledged/received. Pass.

### T8 — Whitespace ladder
Size branches use header/filter/enlarge primitives consistently (`ftags`, `lOnly`, `mUp`, `capN`). No skipped/over-applied step visible. Pass.

## Rule checks (W17 built under new rules)

- **Rule 8 — filter isolation:** `fk=wid+'-'+opt`; Campaign + Date Range read via `fv(fk,...)`. Both shared filter branches (`_renderFltBody` line 6127 prefill, save-path line 6205) include `wid===17` alongside 4/5/6/9/10/11/13/15/16 — all intact. View state per-opt via `sv(wid,opt)`. Each option's filter change re-renders only its own card. Pass.
- **Rule 9 — mandatory sizes:** KPI, Medium, Large render real content for all 3 options; **Small present and working for all 3**. Pass.
- **Rule 10 — genuine second dimensions:** B = pledged + received absolute values side by side (not just %); C = dollar gap-to-goal ranked largest-first. Both are real added dimensions, not chart-type re-skins of the same %. Pass.
- **Rule 11 — no on-screen speculative data:** No TBD/badge/disclaimer/"multiplier"/"unconfirmed" text in the W17 card markup (line 448) or `WRENDER[17]` (5879–5935). The Date-Range-multiplier and no-separate-Due-field caveats live only in the Widget_Specs entry. Pass.

## Step 4 — Concept match
`Widget_Specs/W17-Gifts-Pledges.md` most recent dated entry (2026-07-23, fragment/assembler flow) describes A "Campaign Progress" (restyled progress bars, pie+table alt), B "Pledged vs Received" (paired bars, table alt, Small toggle fixed), C "Fundraising Gap" (gap sorted largest-first, table adds pledged/received/gap/%funded), KPI = fixed overall % Due, Rule 8 scoping, Small retained for all 3, Rule 11 caveats documented not shown. Build matches the entry exactly.

## Step 5 — Data completeness
`series[17]` items carry all four fields **l/p/r/c** for every campaign (All Campaigns + per-campaign buckets, FY2024–26). Punch List W17 (lines 170–177) flags Date Range filter (🟡 needs re-baselining decision) and Pledge Due/Due Remaining/% Due (🔴 not returned by Modern API today, client-side only). These match the Widget_Specs Rule 11 caveats — flagged, not silently treated as final. Pass.

## Step 6 — Integrity
- `#fc-widget-17` (Final Check tab) **unchanged** — shows old option labels ("Progress Bars / Donut / Table") and an amber **"Final design — locked"** badge. Expected known shared-render carryover; informational only, not a finding.
- `mock-data.master.js` vs live HTML: **options[17] byte-identical**, **series[17] identical**. Mirror in sync.

---

## Actionable items
None.

## Expected carryovers (not actionable)
- `#fc-widget-17` still carries the pre-rebuild labels (Donut etc.) and the locked badge — known shared-render carryover, informational.
