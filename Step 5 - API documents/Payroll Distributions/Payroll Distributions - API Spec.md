# Payroll Distributions — API Spec

**Status: DRAFT — not final** *(reopened 2026-07-21, per direct instruction, replacing the prior approved version — the rewrite surfaces a real, previously-flagged gap this spec can no longer skip past; see "Flag" under Tables)*

## Tables

| Table | Fields used |
|---|---|
| `PR_History` | (via `PREmployee`) CompanyID, CheckDate, CheckType, VoidJournalID |
| `PR_HistoryCompensation` | CompensationDistributionID, Name, Amount |

No new tables are needed for the all-departments view below — it's the same two tables the current API already queries.

**Flag — the pay-type/Category breakdown has no confirmed data source.** Step 4's design needs two different levels: an all-departments view (rows = department/distribution names, e.g. "Finance," "Administration Staff") and, per its own Data Table Sort section ("Fixed alphabetical by Department (all-departments view) or Category (single-department view)"), a single-department view where rows switch to pay-type **Category** instead — matching the Purpose section's specific list (Regular, Vacation, OverTime, Sick, Double Time, Personal, Holiday, Misc, Other). The only field either codebase actually returns today is `PR_HistoryCompensation.Name` (labelled "Compensation Distribution Name" in the legacy grid, confirmed via `Widget_Comparison_Classic.html`'s `wc-impl-pd1`/`wc-data-pd1` panels) — one dimension, not two. Nothing in that comparison confirms a second field carrying pay-type/earnings-code data. **This is the same gap the last review flagged as never addressed in the previous version of this spec** — it wasn't in the Tables section, the old-vs-new table, or the sign-off list there either. This version names it up front instead of letting it stay implicit.

This spec fully covers the all-departments view, which is buildable today. The single-department Category view is flagged everywhere it applies below and should not be treated as buildable until someone confirms where that data actually comes from.

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Endpoint | `GET /api/dashboard/payroll-distributions/data?startDate&endDate` — one call, fixed date range | Same shape, but `startDate`+`period` (Weekly/Bi-Weekly/Monthly/Custom) instead of raw `startDate`/`endDate` |
| Rows | Flat list, one row per Distribution Name, current period only | Same, when the Department filter is "All Departments." When one department is selected, Step 4 expects rows to switch to pay-type Category instead — **not buildable as specified today**, see Flag above |
| Comparison | None | Every row needs current + prior period amounts, with `diffAmount`/`diffPct` pre-computed, shown as a ▲/▼ badge in every view per Step 4's Fine-Tuning Notes |
| Department filter | None | "All Departments" (default) or one specific value — see Flag above for what selecting one specific value actually returns |
| Sort | Fixed alphabetical by Name | Alphabetical (default, by whichever label is showing) or Amount descending — user-toggled |

**Cut from this version, and why:** the previous spec fully specified a "per-distribution period mode" (each department/distribution running its own date range) plus a `recurring` flag. Step 4's own Filters section calls both of those mockup-only — "not wired to any real scheduling logic" — so this version doesn't build API surface for a frontend feature that isn't confirmed real yet. If Step 4 later confirms either one, that's a real addition to make then, not something to speculatively support now.

## Request params

One shared period for the whole widget — the only mode Step 4 actually confirms as real:

| Param | Type | Required | Default | Notes |
|---|---|---|---|---|
| `startDate` | date | yes | — | |
| `period` | enum | yes | `Weekly` | `Weekly`, `Bi-Weekly`, `Monthly`, `Custom` — end date is derived from `startDate` + period length, except `Custom` |
| `endDate` | date | only if `period=Custom` | — | |
| `department` | string | no | *(all)* | Filters to one department/distribution value. Values come from whatever `Distribution` names the org actually has today — **not** the fixed five-item list in Step 4's Filters table (All Departments · Finance · Admin · Ministry · Facilities), which would need to become dynamic per org rather than staying hardcoded |
| `sort` | enum | no | `alphabetical` | `alphabetical`, `amount` |

Example requests:
```
GET /api/dashboard/payroll-distributions/data?startDate=2026-07-14&period=Weekly
GET /api/dashboard/payroll-distributions/data?startDate=2026-07-14&period=Weekly&department=Finance&sort=amount
```

**Prior period is not a separate param.** Server computes it as the immediately preceding period of equal length. This definition is assumed, not confirmed — see sign-off list.

## Response shape

**All-departments view — fully supported today:**

```json
{
  "period": { "range": "Jul 14–20, 2026" },
  "total": { "current": 154200, "prior": 148900, "diffAmount": 5300, "diffPct": 4 },
  "rows": [
    { "label": "Finance", "current": 44680, "prior": 43060, "diffAmount": 1620, "diffPct": 4 },
    { "label": "Administration Staff", "current": 38950, "prior": 40100, "diffAmount": -1150, "diffPct": -3 },
    { "label": "Facilities", "current": 21300, "prior": 19800, "diffAmount": 1500, "diffPct": 8 }
  ]
}
```

**Single-department Category view — illustrative shape only, not confirmed buildable (see Flag under Tables):**

```json
{
  "period": { "range": "Jul 14–20, 2026" },
  "department": "Finance",
  "total": { "current": 44680, "prior": 43060, "diffAmount": 1620, "diffPct": 4 },
  "rows": [
    { "label": "Regular", "current": 32000, "prior": 31500, "diffAmount": 500, "diffPct": 2 },
    { "label": "Overtime", "current": 4200, "prior": 3900, "diffAmount": 300, "diffPct": 8 },
    { "label": "Vacation", "current": 2600, "prior": 2500, "diffAmount": 100, "diffPct": 4 }
  ]
}
```
No field on `PR_HistoryCompensation` is confirmed to actually carry "Regular"/"Overtime"-style labels — don't build against this shape until that's confirmed.

`diffAmount`/`diffPct` are pre-computed server-side, same convention as the rest of this project's specs — never raw current/prior for the client to subtract. `total` is the sum across every row in the current filtered scope, current and prior both.

## Sort

Default alphabetical by `label`. `sort=amount` switches to amount descending. Two states only — not open column sorting.

## Drill-through

New — a link out to the Payroll History module, filtered to the same date range. Plain link built from `startDate`/`endDate` on the frontend, not a new API call — no transaction-level detail endpoint needed.

## Edge cases to confirm

1. **No payroll runs in range** — empty `rows[]` and zeroed `total`, or an explicit empty/error response?
2. **Division by zero in `diffPct`** — a department with `prior: 0`. Return `null` instead of a percent?
3. **New department/distribution with no prior period** — exists this period but didn't last period. Row still appears with `prior: 0`?
4. **`endDate` before `startDate`** (Custom period only) — reject with an error, or silently swap?
5. **`department` value that doesn't match any real Distribution name for that org** — empty result, or an error?

## Not in scope

- No per-employee or per-transaction breakdown — rows are grouped by department/distribution (or Category, once confirmed), never down to an individual paycheck.
- "Make this recurring" and setting the Pay Period separately per department — Step 4 marks both mockup-only; no backend work is specified here until they're confirmed real.
- The single-department Category view — not buildable until its data source is confirmed, see Flag under Tables.

## Still needs sign-off

- **Where does pay-type/Category data (Regular, Vacation, OverTime, Sick, Double Time, Personal, Holiday, Misc, Other) actually come from** — is there a field on `PR_HistoryCompensation` beyond `CompensationDistributionID`/`Name` that wasn't caught in this comparison, or does this need new schema/data work entirely? This is the single biggest open item, carried forward from the last review and now named directly instead of left implicit.
- **Is "Department" the same field as "Distribution"** — today's one confirmed grouping field — or a genuinely separate concept that would need its own confirmed source (e.g. from `PREmployee`'s own department field, unconfirmed and unchecked in this pass)?
- **"Prior period" definition** — immediately preceding period of equal length, as assumed above, or something else (e.g. same period last year)?
