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
| Endpoint | `GET /api/dashboard/payroll-distributions/data?startDate&endDate` — one call, one shared date range | Same idea, but `startDate`+`period` instead of raw `startDate`+`endDate`, plus an entirely new per-distribution period mode |
| Rows | Flat list, one row per `Distribution` `Name`, current period only | Same flat list, likely — "Department" may just be this same field relabeled (see Tables above) |
| Comparison | None | Each row needs a **prior period** amount alongside current |
| Time filter | One period for the whole widget | Optionally a **different period per distribution/department** — real feature, confirmed via the filter screen |
| Sort | Fixed, alphabetical by Name | Alphabetical (default) or Amount descending — user-toggled |

## Request params

The time filter has two real modes, confirmed against the actual filter screen: one shared period for the whole widget (what's live today), or a separate period **per department/distribution**. These need different params.

**Shared mode (default) — one period for everything:**

| Param | Type | Required | Default | Notes |
|---|---|---|---|---|
| `startDate` | date | yes | — | |
| `period` | enum | yes | `Weekly` | `Weekly`, `Bi-Weekly`, `Monthly`, `Custom` — end date is derived from `startDate` + period length, except `Custom` |
| `endDate` | date | only if `period=Custom` | — | |
| `recurring` | bool | no | `false` | See open question below — unclear if this affects the query at all |
| `distribution` | string | no | *(all)* | Filters to one distribution/department. Values come from whatever distributions the org actually has — not a fixed list |
| `sort` | enum | no | `alphabetical` | `alphabetical`, `amount` |

**Per-distribution mode — each distribution gets its own period:**

| Param | Type | Notes |
|---|---|---|
| `periodMode` | `perDistribution` | Switches to this mode |
| `periods` | array | One entry per distribution: `{distribution, startDate, period, recurring}` — same fields as shared mode, just repeated per distribution |

**Prior period is not a separate param, either mode.** Server computes it as the immediately preceding period of equal length to whichever period applies to that row (shared, or that row's own per-distribution period). Confirm this definition of "prior period" — flagged below.

Example requests:
```
GET /api/dashboard/payroll-distributions/data?startDate=2026-07-14&period=Weekly
GET /api/dashboard/payroll-distributions/data?startDate=2026-07-14&period=Weekly&distribution=Finance&sort=amount

POST /api/dashboard/payroll-distributions/data
{
  "periodMode": "perDistribution",
  "periods": [
    { "distribution": "Facilities", "startDate": "2026-07-14", "period": "Weekly", "recurring": false },
    { "distribution": "Finance",    "startDate": "2026-07-14", "period": "Weekly", "recurring": true }
  ]
}
```

## Response shape

**Shared mode** — one period applies to everything, shown once at the top:

```json
{
  "period": { "range": "Jul 14–20, 2026", "recurring": false },
  "total": { "current": 154200, "prior": 148900, "diffAmount": 5300, "diffPct": 4 },
  "rows": [
    { "label": "Finance", "current": 44680, "prior": 43060, "diffAmount": 1620, "diffPct": 4 }
  ]
}
```

**Per-distribution mode** — no shared top-level period; each row carries its own:

```json
{
  "total": { "current": 154200, "prior": 148900, "diffAmount": 5300, "diffPct": 4 },
  "rows": [
    {
      "label": "Finance",
      "current": 44680,
      "prior": 43060,
      "diffAmount": 1620,
      "diffPct": 4,
      "period": { "range": "Jul 14–20, 2026", "recurring": true }
    }
  ]
}
```

`rows[].label` is a distribution/department name if `distribution` isn't set to one specific value, matching whatever the org's real `Distribution` names are (e.g. "Administration Staff") — not necessarily a fixed department list.

- `diffAmount`/`diffPct` are pre-computed server-side, same as the rest of these specs — never raw current/prior for the client to subtract.
- `total` is always the sum across every row in the current filtered scope, current and prior both — even in per-distribution mode, where each row's current/prior comes from a different date range.

## Sort

Default alphabetical by `label`. `sort=amount` switches to amount descending. Two states only — not open column sorting.

## Drill-through

New — a link out to the Payroll History module, filtered to the same date range. This is a plain link built from `startDate`/`endDate` on the frontend, not a new API call — no transaction-level detail endpoint is needed here.

## Edge cases to confirm

1. **No payroll runs in range** — empty `rows[]` and zeroed `total`, or an explicit empty/error response?
2. **Division by zero in `diffPct`** — a distribution with `prior: 0`. Return `null` instead of a percent?
3. **New distribution with no prior period** — one that exists this period but didn't last period. Row still appears with `prior: 0`?
4. **`endDate` before `startDate`** (Custom period only) — reject with an error, or silently swap?
5. **Per-distribution mode, one distribution missing from `periods[]`** — falls back to the shared default period, or excluded from the response entirely?
6. **Recurring, then the period is manually changed** — does turning `recurring` on for one distribution silently override a period another user set manually, or do they conflict?

## Not in scope

No per-employee or per-transaction breakdown — rows are grouped by distribution only, never down to an individual paycheck.

## Still needs sign-off

- Is `Distribution` always department-shaped, or does it vary by org (see Tables above)?
- What does `recurring` actually change server-side — does it affect which records are queried (e.g. "always this week" vs. a fixed pinned date), or is it purely a saved UI preference that doesn't touch the data endpoint at all?
- "Prior period" definition — immediately preceding period of equal length, as assumed above, or something else (e.g. same period last year)?
