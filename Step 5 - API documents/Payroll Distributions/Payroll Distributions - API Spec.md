# Payroll Distributions — API Spec

**Status: DRAFT — not final** *(restructured 2026-07-23, per direct instruction, into two releases. Version 1 is the distribution-level view that is buildable today and matches the locked design. Version 2 is a planned second-round improvement — the pay-type composition drill-down — added here so its data source and shape are documented now, even though it is **not** part of the current locked design. The old "pay-type breakdown has no confirmed data source" flag is now resolved; see Version 2.)*

## How to read this spec

This widget is documented as two releases:

- **Version 1 — first release.** What actually gets built now: total payroll paid over a period, broken down by distribution name (the org's own compensation-distribution labels), with period control, an optional department scoping filter, prior-period comparison, and a link out to Payroll History. Buildable today on the two tables the current API already queries.
- **Version 2 — planned improvement (round two).** A drill-down *inside* a distribution that shows what **pay types** make up that number — Regular, Overtime, Holiday, Vacation, Sick, etc. — as aggregated totals, so a user can answer "is overtime creeping up?" or "why did this go up this period?". This is **not** in the Version 1 build or the locked Step 4 design. It is documented here because its data source is now confirmed (see the Pay Type Breakdown analysis, July 2026).

---

# Version 1 — First Release (buildable today)

## Tables

| Table | Fields used |
|---|---|
| `PR_History` | (via `PREmployee`) CompanyID, CheckDate, CheckType, VoidJournalID |
| `PR_HistoryCompensation` | CompensationDistributionID, Name, Amount |

No new tables are needed for Version 1 — it is the same two tables the current API already queries.

## Old vs. new

| | Old (live today) | New (Version 1) |
|---|---|---|
| Endpoint | `GET /api/dashboard/payroll-distributions/data?startDate&endDate` — one call, fixed date range | Same shape, but `startDate`+`period` (Weekly/Bi-Weekly/Monthly/Custom) instead of raw `startDate`/`endDate` |
| Rows | Flat list, one row per Distribution Name, current period only | Same — one row per Distribution Name. Optionally scoped to one department (see Department filter) |
| Comparison | None | Every row carries current + prior period amounts, with `diffAmount`/`diffPct` pre-computed, shown as a ▲/▼ badge per Step 4's Fine-Tuning Notes |
| Department filter | None | "All Departments" (default) or one specific value — narrows which distributions are included |
| Sort | Fixed alphabetical by Name | Alphabetical (default) or Amount descending — user-toggled |

**Cut from this version, and why:** the previous spec fully specified a "per-distribution period mode" (each distribution running its own date range) plus a `recurring` flag. Step 4's own Filters section calls both of those mockup-only — "not wired to any real scheduling logic" — so Version 1 doesn't build API surface for a frontend feature that isn't confirmed real yet. If Step 4 later confirms either one, that's a real addition to make then.

## Request params

One shared period for the whole widget:

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

`diffAmount`/`diffPct` are pre-computed server-side, same convention as the rest of this project's specs — never raw current/prior for the client to subtract. `total` is the sum across every row in the current filtered scope, current and prior both.

## Sort

Default alphabetical by `label`. `sort=amount` switches to amount descending. Two states only — not open column sorting.

## Drill-through

A link out to the Payroll History module, filtered to the same date range. Plain link built from `startDate`/`endDate` on the frontend, not a new API call — no transaction-level detail endpoint needed for Version 1.

## Edge cases to confirm

1. **No payroll runs in range** — empty `rows[]` and zeroed `total`, or an explicit empty/error response?
2. **Division by zero in `diffPct`** — a department with `prior: 0`. Return `null` instead of a percent?
3. **New department/distribution with no prior period** — exists this period but didn't last period. Row still appears with `prior: 0`?
4. **`endDate` before `startDate`** (Custom period only) — reject with an error, or silently swap?
5. **`department` value that doesn't match any real Distribution name for that org** — empty result, or an error?

## Not in scope for Version 1

- No pay-type composition (Regular/Overtime/Vacation/etc.) — that is Version 2 below.
- No per-employee or per-transaction breakdown — rows are grouped by distribution name, never down to an individual paycheck or a named person.
- "Make this recurring" and setting the Pay Period separately per department — Step 4 marks both mockup-only; no backend work until they're confirmed real.

---

# Version 2 — Planned Improvement (round two, not in the locked design)

**Scope of this improvement:** when a user clicks a distribution row, drill *into* it and show the **pay-type composition** of that distribution's total — Regular vs Overtime vs Holiday vs Vacation vs Sick, etc. — as aggregated totals (hours and amount per pay type). The purpose is diagnostic: seeing the *mix* is what tells a user whether overtime is climbing, or why a number moved period-over-period.

**Deliberately excluded from this improvement:**

- **No employee names.** The breakdown is by pay type, not by person.
- **No individual check / transaction detail.** Rows are pay-type totals within the distribution, never a per-paycheck list.

This keeps the improvement free of PII and consistent with Version 1's grouping approach — one more level of *category* depth, not a jump to transaction data.

## Data source — now confirmed

The old flag ("pay-type breakdown has no confirmed data source") is **resolved.** Per the Pay Type Breakdown analysis (July 2026), the pay-type data already lives in the same table Version 1 already reads — `PR_HistoryCompensation`. Each row in that table is one compensation line on one paycheck and already carries the pay type, hours, and rate. The current widget simply ignores those columns.

| Table | Fields used (new for V2) | What it gives |
|---|---|---|
| `PR_HistoryCompensation` | `SubType` | The pay-type code (1–10) — Regular, Overtime, etc. This is the field that answers "what kind of pay was this?" |
| `PR_HistoryCompensation` | `Hours` | Hours for that pay type within the distribution (aggregated) |
| `PR_HistoryCompensation` | `Rate` | Pay rate — informational; not required for the composition view |

**No schema changes are needed** — the data exists today; it is an API + UI exposure task, not a data-model change.

## Pay-type codes — `SubType` field

| Code | Pay type | Notes |
|---|---|---|
| 1 | Regular | Standard hours/pay |
| 2 | OverTime | Beyond normal week, typically 1.5× |
| 3 | DoubleTime | 2× rate |
| 4 | Holiday | Recognised holidays |
| 5 | Other | Catch-all, hours-based |
| 6 | Vacation | **Org-configurable label** |
| 7 | Sick | **Org-configurable label** |
| 8 | Personal | **Org-configurable label** |
| 9 | Misc. | **Org-configurable label** |
| 10 | Other Pay | Typically non-hours-based supplementary pay |

**Label caveat:** SubTypes 6–9 do not have fixed names — each org sets its own labels in `PR_Company` settings (e.g. "Vacation" may be "Annual Leave" or "PTO"). The API must resolve these names from company config at query time, rather than hardcoding them. This is the same variable-label rule that already applies to distribution names.

## Proposed endpoint and response shape (V2)

Triggered when a user drills into one distribution. Aggregated by pay type — no `employees` array, no check rows.

```
GET /api/dashboard/payroll-distributions/breakdown
    ?distributionName=Administration+Staff&startDate=2026-07-14&period=Weekly
```

```json
{
  "period": { "range": "Jul 14–20, 2026" },
  "distributionName": "Administration Staff",
  "total": { "current": 4530.63, "prior": 4200.00, "diffAmount": 330.63, "diffPct": 8 },
  "payTypes": [
    { "label": "Regular",  "subType": 1, "hours": 120.0, "current": 3800.00, "prior": 3700.00, "diffAmount": 100.00, "diffPct": 3 },
    { "label": "Overtime", "subType": 2, "hours": 12.0,  "current": 540.63,  "prior": 300.00,  "diffAmount": 240.63, "diffPct": 80 },
    { "label": "Vacation", "subType": 6, "hours": 8.0,   "current": 190.00,  "prior": 200.00,  "diffAmount": -10.00, "diffPct": -5 }
  ]
}
```

The Overtime row in this example (+80%) is exactly the kind of movement this view is meant to surface at a glance. `diffAmount`/`diffPct` follow the same server-side pre-computed convention as Version 1.

## Consistency filters carried over from Version 1

So the pay-type totals reconcile exactly to the Version 1 distribution total:

- **Voided checks excluded** (`VoidJournalID IS NULL`) — same as today.
- **Manual checks excluded** (`CheckType = 2`) — same as today.
- **Non-cash compensation excluded** — benefit items (health contributions, car allowances, etc.) flow through a separate table (`PR_HistoryNonCash`) and are not part of the distribution totals, so they do not appear here either.

## What would need to be built (V2)

No database changes. Work is API + UI only:

| Component | Change | Complexity |
|---|---|---|
| Modern API — entity | Map `SubType`, `Hours`, `Rate` on `PR_HistoryCompensation` (already mapped for `Amount`) | Low |
| Modern API — DTO | New `PayrollDistributionBreakdownDto` — pay-type rows only, no employee nesting | Low |
| Modern API — service | `GetPayrollDistributionBreakdownAsync(distributionName, startDate, period)` — group by `SubType`, resolve labels from company config | Medium |
| Modern API — controller | New endpoint `GET /api/dashboard/payroll-distributions/breakdown` | Low |
| UI — drill-in | Clickable distribution rows open an in-widget panel showing the pay-type composition | Medium |

## Not in scope even for Version 2

- Per-employee and per-check detail (names, check numbers) — explicitly excluded per instruction.
- Project-level and Workers'-Comp breakdowns — `ProjectID` and `WorkersCompID` exist on the line but are out of scope unless a future need arises.
- Implied hourly rate for salaried staff — `Rate` holds a per-period salary for salaried workers, not an hourly figure; deriving an hourly rate is a calculation, not a stored value, and isn't part of this composition view.

---

## Still needs sign-off

- **~~Where does pay-type data come from~~ — RESOLVED.** Confirmed as `PR_HistoryCompensation.SubType` (+ `Hours`/`Rate`) via the Pay Type Breakdown analysis (July 2026). No schema work needed. Carried here only to close the item.
- **Is "Department" the same field as "Distribution"** — today's one confirmed grouping field — or a genuinely separate concept that would need its own confirmed source (e.g. `PREmployee`'s own department field, unconfirmed and unchecked in this pass)? Affects the Version 1 `department` filter.
- **"Prior period" definition** — immediately preceding period of equal length, as assumed above, or something else (e.g. same period last year)? Applies to both versions.
- **Org-configurable pay-type label resolution (V2)** — confirm the `PR_Company` settings that map SubTypes 6–9 to org labels can be read at query time.
