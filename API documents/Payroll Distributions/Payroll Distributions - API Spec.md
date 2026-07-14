# Payroll Distributions — API Spec

**Status: DRAFT — not final**

## Tables

| Table | Fields used |
|---|---|
| `PR_History` | HistoryID, CompanyID (via PREmployee), CheckDate, CheckType, VoidJournalID |
| `PR_HistoryCompensation` | HistoryID, CompensationDistributionID, Name, Amount |

**Correction: "Department" is likely just `Name` on `PR_HistoryCompensation`, renamed.** The live widget today already shows `CompensationDistributionID`/`Name` values that are department-shaped (e.g. "Administration Staff" — see screenshot), not generic compensation types like "Net Pay". So this is probably not a missing field — it's the existing `Distribution` field, possibly relabeled "Department" in the new UI. Still needs confirmation: is `Distribution` name always org-unit-shaped for every customer, or does it vary (some orgs may set up Distributions as pay-type categories instead of departments)? If it varies, "Department" and "Distribution" may need to stay two separate things rather than one renamed field.

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Endpoint | `GET /api/dashboard/payroll-distributions/data?startDate&endDate` — one call | Same call, extra params (see below) |
| Rows | Flat list, one row per compensation category, current period only | Rows grouped by **department first** (if confirmed), category within a department |
| Comparison | None | Each row needs a **prior period** amount alongside current |
| Sort | Fixed, alphabetical by Name | Alphabetical (default) or Amount descending — user-toggled |

## Request params

| Param | Type | Required | Default | Notes |
|---|---|---|---|---|
| `startDate` | date | yes | — | Existing param, unchanged |
| `endDate` | date | yes | — | Existing param, unchanged |
| `department` | enum | no | `All Departments` | `All Departments`, `Finance`, `Admin`, `Ministry`, `Facilities` — pending the Department confirmation above |
| `sort` | enum | no | `alphabetical` | `alphabetical`, `amount` |

"Last 7 Days" / "Last 30 Days" / "Custom" are resolved to concrete `startDate`/`endDate` before calling the API — the API only ever sees real dates, it doesn't need to know about rolling presets.

**Prior period is not a separate param.** Server computes it automatically as the immediately preceding period of equal length (e.g. `startDate`–`endDate` = Jul 1–14 → prior = Jun 17–30). Confirm this definition of "prior period" is what's wanted — flagged below.

Example requests:
```
GET /api/dashboard/payroll-distributions/data?startDate=2026-07-01&endDate=2026-07-14
GET /api/dashboard/payroll-distributions/data?startDate=2026-07-01&endDate=2026-07-14&department=Finance&sort=amount
```

## Response shape

```json
{
  "total": { "current": 154200, "prior": 148900, "diffAmount": 5300, "diffPct": 4 },
  "rows": [
    {
      "label": "Finance",
      "current": 44680,
      "prior": 43060,
      "diffAmount": 1620,
      "diffPct": 4
    }
  ]
}
```

When `department=All Departments`, each row in `rows[]` is a department (`label` = department name). When a specific department is selected, each row is a compensation category within it (`label` = category name, e.g. "Net Pay", "Fed Tax", "Benefits"). Same shape either way — only what `label` refers to changes.

- `diffAmount`/`diffPct` are pre-computed server-side, same as the rest of these specs — never raw current/prior for the client to subtract.
- `total` is always the sum across every row in the current filtered scope, current and prior both.

## Sort

Default alphabetical by `label`. `sort=amount` switches to amount descending. Two states only — not open column sorting.

## Drill-through

New — a link out to the Payroll History module, filtered to the same date range. This is a plain link built from `startDate`/`endDate` on the frontend, not a new API call — no transaction-level detail endpoint is needed here.

## Edge cases to confirm

1. **No payroll runs in range** — empty `rows[]` and zeroed `total`, or an explicit empty/error response?
2. **Division by zero in `diffPct`** — a category/department with `prior: 0`. Return `null` instead of a percent?
3. **New category with no prior period** — a compensation type that exists this period but didn't exist last period. Row still appears with `prior: 0`?
4. **`endDate` before `startDate`** — reject with an error, or silently swap?
5. **Department filter before the field is confirmed** — what does the API do with `department` today, given the field doesn't exist yet on the source tables?

## Not in scope

No per-employee or per-transaction breakdown — rows are always grouped by department or category, never down to an individual paycheck.

## Still needs sign-off

- Department as a real, queryable field — confirm it exists or where it would come from.
- "Prior period" definition — immediately preceding period of equal length, as assumed above, or something else (e.g. same period last year)?
