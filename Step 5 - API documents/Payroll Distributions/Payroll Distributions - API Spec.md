# Payroll Distributions — API Spec

**Status: DRAFT — not final**

## Overview

The widget shows total cash payroll paid over a chosen time window, grouped by the org's own compensation-distribution labels, in three scopes: all distributions, by pay type, and one distribution. Time selection is a window picker only: a `window` enum (`this_month`, `this_period`, `this_quarter`, `this_year`, `all_time`) plus an always-available custom from/to range and an `asOf` anchor. The window scopes the aggregation and nothing more: there is NO `grain`, NO bucketed series, and NO prior-period comparison anywhere in this contract (sign-off finding F3 explicitly rejected comparison for this widget, so no `prior`/`diffAmount`/`diffPct` fields may be added back).

This spec is deliberately 1-to-1 with the existing payroll-distributions endpoint, following the same minimal philosophy as the Pension Plans spec: the endpoint keeps its path and its flat-rows shape, the only genuinely new data is the pay-type dimension, and everything computable client-side (grand total, per-row percent of total, sorting) stays client-side. The central open question that reopened this spec on 2026-07-21 (is the grouping field a Department dimension or a pay-type Category dimension?) is now resolved with evidence: per `Payroll Distributions - Pay Type Breakdown Analysis (proof).html` (this folder), the grouping is the org-defined distribution labels, AND a full pay-type breakdown is supported by columns that already exist, with no schema changes.

**Zero personal data (owner decision, 2026-07-27).** This contract returns no employee names, no check numbers, no hours, and no rates, at any scope. The breakdown stops at distribution by pay type, amounts only. The deeper per-employee drill remains technically evidenced possible (see the proof file) but is deliberately not part of this contract and is not planned.

## Tables

| Table | Fields used |
|---|---|
| `PR_HistoryCompensation` | `HistoryCompensationID` (row id), `HistoryID` (joins to `PR_History`, the paycheck), `CompensationDistributionID` (joins to `PR_CompensationDistribution.Name`), `Amount` (dollar value of the line), `SubType` (pay-type code 1-10). `Hours`, `Rate`, `PayCycle`, `EmployeeCompensationID`, `WorkersCompID`, `ProjectID` exist on the same rows but are NOT read by this contract (zero personal data, amounts only) |
| `PR_CompensationDistribution` | `Name`: the org-defined distribution label the widget groups by |
| `PR_History` | The check record, used ONLY for filtering: `CheckDate` (the window filter), `CheckType`, `VoidJournalID`. No check numbers or employee links are exposed |

**Resolved (2026-07-21 reopening question closed).** The previous spec flagged that the only confirmed field (`PR_CompensationDistribution.Name` via `CompensationDistributionID`) did not establish whether the widget's grouping was a Department dimension or a pay-type Category dimension. Per `Payroll Distributions - Pay Type Breakdown Analysis (proof).html`, both dimensions exist and both live in `PR_HistoryCompensation`: every compensation line on every paycheck is one row there, carrying the org-defined distribution it belongs to (`CompensationDistributionID`, level 2 of the proof's hierarchy) AND the fixed pay-type code (`SubType`, level 4). There is no separate "Department" dimension to confirm: the widget's distribution grouping IS the org-defined labels, and the pay-type breakdown is a second grouping over the same rows, no schema changes needed. (The proof also evidences deeper per-employee detail on the same rows; this contract deliberately does not use it: zero personal data.)

**Consistency filters (unchanged from today, applied to every scope so all views reconcile):** voided checks excluded (`VoidJournalID IS NULL`), manual checks excluded (`CheckType = 2`), non-cash compensation excluded (benefit items flow through `PR_HistoryNonCash` and are never part of distribution totals). All per the proof file's Additional Findings.

## Old vs. new

| | Old (live today) | New (this contract) |
|---|---|---|
| Endpoint | `GET /api/dashboard/payroll-distributions/data?startDate&endDate`: one call, fixed date range, flat list, one row per distribution name | Same endpoint. `window`/`from`/`to`/`asOf` replace the raw date pair; two scope params (`distributionId`, `byPayType`) added |
| Distribution totals | Already exist: the flat per-distribution rows are what the endpoint returns today | Same rows; each gains `distributionId` (the `CompensationDistributionID` guid) as a stable key, since names are org-editable |
| Pay-type scope | Nothing: `SubType` is an unread column on the same rows | NEW: `byPayType=true` groups the same rows by `SubType` within each distribution, amounts only. SELECT additions on existing rows, no schema change, per `Payroll Distributions - Pay Type Breakdown Analysis (proof).html` |
| Time selection | Raw `startDate`/`endDate` only | `window` enum + custom `from`/`to` (custom range always available, per SME) + `asOf` anchor. Scope-only aggregation: no grain, no buckets |
| Comparison | None | Still none. Sign-off finding F3 rejected prior-period comparison for this widget: no `prior`, `diffAmount`, or `diffPct` fields, ever. Devs must not re-add them |
| Totals and percent of total | Not returned | Still not returned: grand total and per-row percent of total are client-side sums and divisions over the returned rows |
| Sort | Fixed order | Client-side re-order of the returned rows; no sort params |
| Employee/check drill | None | Still none, by owner decision (2026-07-27): zero personal data in this contract. The breakdown stops at distribution by pay type, amounts only. (Deeper detail remains evidenced possible per the proof file, but it is not planned) |

## Endpoint

```
GET /api/dashboard/payroll-distributions/data
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `window` | enum | yes | `this_month` \| `this_period` \| `this_quarter` \| `this_year` \| `all_time` \| `custom` | none | this_month = calendar month containing `asOf`; this_period = the org's current fiscal period containing `asOf`; this_quarter = ROLLING, last 3 months back from `asOf`; this_year = ROLLING, last 12 months back from `asOf`; all_time = no lower bound, everything through `asOf`; custom = the `from`/`to` pair. Note: payroll has no fiscal-period concept in the code (only `CheckDate` and `PayCycle` pay periods), so `this_period` here should be read as the current pay period, not a GL fiscal period, and this needs an SME confirm (code: payroll has no fiscal period, CheckDate/PayCycle only) |
| `from` | date | only when `window=custom` | any valid date | none | Inclusive range start. Custom ranges are always available regardless of the preset list (SME point) |
| `to` | date | only when `window=custom` | any valid date, `>= from` | none | Inclusive range end |
| `asOf` | date | no | any valid date | today (server date) | Anchors the five preset windows; ignored when `window=custom`. A historical `asOf` reproduces a past reading exactly |
| `distributionId` | guid | no | any `distributionId` returned by this endpoint | omitted (all distributions) | Scopes to one distribution |
| `byPayType` | boolean | no | `true` \| `false` | `false` | Groups rows by pay type (`SubType`) within each distribution in scope. Combine with `distributionId` for one distribution's pay-type mix |

The three built scopes map as: all distributions (neither scope param), by pay type (`byPayType=true`), one distribution (`distributionId=...`). Rows are selected by `PR_History.CheckDate` falling inside the resolved window, with the consistency filters above always applied.

### Example requests

```
GET /api/dashboard/payroll-distributions/data?window=this_month
GET /api/dashboard/payroll-distributions/data?window=this_month&distributionId=6f2a9c41-8b3d-4e7a-9c1f-2d5b8e0a3f74&byPayType=true
GET /api/dashboard/payroll-distributions/data?window=custom&from=2025-07-01&to=2026-06-30&byPayType=true
GET /api/dashboard/payroll-distributions/data?window=this_year&asOf=2026-07-27
```

## Validation rules

- Custom is expressed as `window=custom`, not as a silent override: `from` and `to` are required together when `window=custom`, and are rejected (HTTP 400) when present with any other window value. The server never silently ignores a date pair.
- `from <= to` is required; a reversed pair is HTTP 400, never silently swapped.
- `asOf` is ignored when `window=custom` (the pair is absolute); it applies to all five preset windows.
- There is no `grain` parameter and no bucketing parameter of any kind. If a request carries one, it is unknown-parameter noise, not a feature: the response is always one flat aggregation over the whole window.
- An unknown `distributionId` returns an empty list rather than an error (matching the empty-window behaviour); see Still needs sign-off for confirmation.

Error body convention, matching the Budget Compared to Actual spec:

```json
{
  "error": "invalidCustomRange",
  "message": "window=custom requires both from and to, with from <= to"
}
```

## Response schema

The response stays what it is today: a bare flat list, no envelope, no server-computed totals, no timestamps. Grand total is the client-side sum of the returned rows; percent of total is a client-side division; sorting is a client-side re-order. The two row shapes:

### Distribution rows (`byPayType=false`, the default)

| Field | Type | Description |
|---|---|---|
| `distributionId` | guid | `CompensationDistributionID`: the stable key (names are org-editable) and the future drill key |
| `distributionName` | string | `PR_CompensationDistribution.Name`, the org-defined label, resolved at query time |
| `amount` | number | `SUM(Amount)` over the scope's compensation lines in the window |

### Pay-type rows (`byPayType=true`)

| Field | Type | Description |
|---|---|---|
| `distributionId` | guid | As above |
| `distributionName` | string | As above |
| `subType` | int | Pay-type code 1-10 from `PR_HistoryCompensation.SubType` (fixed codes, per the proof file) |
| `subTypeName` | string | Display name for the code. Codes 6-9 are org-configurable labels resolved from `PR_Company` settings at query time; the server resolves them, the client never hardcodes them |
| `amount` | number | `SUM(Amount)` over that pay type's lines within that distribution in the window |

One row per (distribution, pay type) pair that has data; zero rows are never sent. A distribution's pay-type rows always sum exactly to its distribution-scope `amount` for the same window, because both groupings read the same filtered rows (per `Payroll Distributions - Pay Type Breakdown Analysis (proof).html`, levels 2 and 4 are the same table).

### Pay-type code map (`SubType`, per the proof file)

| Code | Name | Notes |
|---|---|---|
| 1 | Regular | Standard hours/pay; salaried workers log standard hours here |
| 2 | OverTime | Beyond the normal week, typically 1.5x |
| 3 | DoubleTime | 2x rate |
| 4 | Holiday | Recognised holidays |
| 5 | Other | Catch-all, hours-based |
| 6 | Vacation | Org-configurable label (e.g. "Annual Leave", "PTO") |
| 7 | Sick | Org-configurable label |
| 8 | Personal | Org-configurable label |
| 9 | Misc. | Org-configurable label |
| 10 | Other Pay | Typically non-hours-based supplementary pay |

`Hours` and `Rate` are never returned by this contract, at any scope, per the owner's zero-personal-data decision (2026-07-27). The pay-type breakdown is amounts only.

## Examples

All figures are mock data shaped like production (the proof file's Administration Staff total of 4,530.63 is reused so the examples and the evidence tell one story). The shapes and the arithmetic reconciliation are the contract, not the amounts.

### Example 1: all distributions, this_month

```
GET /api/dashboard/payroll-distributions/data?window=this_month&asOf=2026-07-27
```

```json
[
  { "distributionId": "1a7c3e59-4b2d-4f8a-9e6c-0d3f5a7b9c1e", "distributionName": "AA Aid", "amount": 560.00 },
  { "distributionId": "6f2a9c41-8b3d-4e7a-9c1f-2d5b8e0a3f74", "distributionName": "Administration Staff", "amount": 4530.63 },
  { "distributionId": "3c5e7a90-1d2f-4b6c-8a4e-9f0b2c4d6e81", "distributionName": "Facilities", "amount": 2118.75 },
  { "distributionId": "8d0f2b46-3a5c-4d7e-b1f9-4c6e8a0b2d53", "distributionName": "Pastoral Staff", "amount": 6240.00 }
]
```

Client-side: grand total 13,449.38 (560.00 + 4,530.63 + 2,118.75 + 6,240.00); Administration Staff's share of total is 4,530.63 / 13,449.38, about 33.7%.

### Example 2: by pay type, one distribution

Same window; the rows sum exactly to Example 1's Administration Staff amount.

```
GET /api/dashboard/payroll-distributions/data?window=this_month&asOf=2026-07-27&distributionId=6f2a9c41-8b3d-4e7a-9c1f-2d5b8e0a3f74&byPayType=true
```

```json
[
  { "distributionId": "6f2a9c41-8b3d-4e7a-9c1f-2d5b8e0a3f74", "distributionName": "Administration Staff", "subType": 1, "subTypeName": "Regular",  "amount": 4199.27 },
  { "distributionId": "6f2a9c41-8b3d-4e7a-9c1f-2d5b8e0a3f74", "distributionName": "Administration Staff", "subType": 2, "subTypeName": "OverTime", "amount": 174.00 },
  { "distributionId": "6f2a9c41-8b3d-4e7a-9c1f-2d5b8e0a3f74", "distributionName": "Administration Staff", "subType": 6, "subTypeName": "Vacation", "amount": 157.36 }
]
```

Reconciliation: 4,199.27 + 174.00 + 157.36 = 4,530.63, matching Example 1's row. Pay types with no lines in the window (Holiday, Sick, etc.) simply have no row.

### Example 3: custom range spanning years, by pay type across all distributions

```
GET /api/dashboard/payroll-distributions/data?window=custom&from=2025-07-01&to=2026-06-30&byPayType=true
```

```json
[
  { "distributionId": "1a7c3e59-4b2d-4f8a-9e6c-0d3f5a7b9c1e", "distributionName": "AA Aid", "subType": 1, "subTypeName": "Regular", "amount": 6720.00 },
  { "distributionId": "6f2a9c41-8b3d-4e7a-9c1f-2d5b8e0a3f74", "distributionName": "Administration Staff", "subType": 1, "subTypeName": "Regular",  "amount": 45600.00 },
  { "distributionId": "6f2a9c41-8b3d-4e7a-9c1f-2d5b8e0a3f74", "distributionName": "Administration Staff", "subType": 2, "subTypeName": "OverTime", "amount": 6487.56 },
  { "distributionId": "6f2a9c41-8b3d-4e7a-9c1f-2d5b8e0a3f74", "distributionName": "Administration Staff", "subType": 6, "subTypeName": "Vacation", "amount": 2280.00 },
  { "distributionId": "3c5e7a90-1d2f-4b6c-8a4e-9f0b2c4d6e81", "distributionName": "Facilities", "subType": 1, "subTypeName": "Regular", "amount": 24150.00 },
  { "distributionId": "3c5e7a90-1d2f-4b6c-8a4e-9f0b2c4d6e81", "distributionName": "Facilities", "subType": 4, "subTypeName": "Holiday", "amount": 1275.00 }
]
```

Client-side regroup by `distributionId`: AA Aid 6,720.00; Administration Staff 54,367.56 (45,600.00 + 6,487.56 + 2,280.00); Facilities 25,425.00 (24,150.00 + 1,275.00). Grand total 86,512.56. The range crosses a calendar-year boundary with no special handling: selection is by `CheckDate` only.

There is no fourth example: no drill endpoint exists in this contract, and no response anywhere carries employee names, check numbers, hours, or rates (owner decision, 2026-07-27).

## Edge cases

1. **Empty window (no payroll runs in range):** empty list, not an error. The frontend renders its empty state from zero rows; the client-side grand total is 0.
2. **Custom range spanning years:** no special handling. Selection is by `CheckDate` inside the inclusive `from`/`to` pair; there is no fiscal-year machinery on this widget (see Example 3).
3. **Distribution renamed by the org:** `distributionName` is resolved from `PR_CompensationDistribution.Name` at query time, so historical rows report under the CURRENT label. `distributionId` is the stable key; the client never keys on the name.
4. **Distribution deleted by the org:** historical `PR_HistoryCompensation` rows still carry the `CompensationDistributionID`. The row must still be returned (the money was really paid); the label behaviour for an orphaned id needs a dev answer (see Still needs sign-off).
5. **PayCycle variations:** employees on different cycles (52, 26, 24, 12 checks per year) contribute different numbers of checks to the same window. Amounts are plain sums of the checks dated inside the window, with no per-cycle normalisation; a window shorter than an employee's cycle can legitimately contain zero of their checks.
6. **Reversed custom pair (`from > to`):** HTTP 400, never silently swapped.
7. **Unknown `distributionId`:** empty list expected (matching the empty-window behaviour) rather than an error; needs confirmation.
8. **Three-paycheck months:** a weekly or bi-weekly cycle gives some calendar months an extra check. The window reports what was actually paid; this is exactly why F3 rejected naive prior-period comparison, and why no comparison fields exist to misread it.

## Not in scope

- **No comparison, ever.** No prior-period figures, no `diffAmount`/`diffPct`, no trend or delta fields. Sign-off finding F3 rejected comparison for this widget; this is a contract boundary, not an omission.
- **No grain and no buckets.** The window is scope-only aggregation: one flat result per request, never a time series.
- **No personal data, anywhere, ever (owner decision, 2026-07-27).** No employee names, no check numbers, no hours, no rates, at any scope. The breakdown stops at distribution by pay type, amounts only. The deeper per-employee drill is evidenced possible (proof file) but is deliberately excluded and not planned.
- **No project or workers'-comp breakdowns.** `ProjectID` and `WorkersCompID` exist on the same rows (per the proof file) but nothing in the built Final needs them.
- **No employee-count field on distribution rows.** The proof file notes it would be a small addition; the built Final does not display it, so it is not specced.
- **No server-side totals, percent-of-total, or sort params.** All client-side over the returned rows.
- **"Make this recurring" and per-distribution period modes** remain mockup-only per Step 4; no backend surface until confirmed real.
- **Link out to Payroll History** stays a frontend-built link from the resolved date range; no API involvement.

## Still needs sign-off

- **RESOLVED, kept for the record: the Department-vs-Category grouping question** (the item that reopened this spec on 2026-07-21) was closed on 2026-07-27 by `Payroll Distributions - Pay Type Breakdown Analysis (proof).html`: the grouping is the org-defined distribution labels in `PR_CompensationDistribution.Name`, and the pay-type dimension is `PR_HistoryCompensation.SubType` on the same rows. No schema change; no separate Department source exists or is needed.
- **CLOSED by F3: prior-period definition.** The old spec's open question about how "prior period" is computed is moot: sign-off finding F3 rejected comparison for this widget outright, so no prior-period semantics exist to define.
- **SubType exposure work confirmation:** backend agreement that mapping `SubType` on the `PR_HistoryCompensation` entity plus the `byPayType` grouping lands as specced: a SELECT-level addition on existing rows, no schema change, per the proof file. (`Hours`/`Rate` are NOT to be mapped for this contract: zero personal data.)
- **Org-configurable pay-type labels (codes 6-9):** confirm the `PR_Company` settings that hold the org's labels can be resolved server-side at query time into `subTypeName`.
- **CLOSED by owner decision (2026-07-27): employee/check drill.** No drill endpoint, no personal data in this contract, breakdown stops at distribution by pay type. Kept for the record: the drill remains evidenced possible with no schema change (proof file, levels 3 and 4) should the decision ever be revisited.
- **Orphaned `CompensationDistributionID` label behaviour:** today the widget inner-joins `PRHistoryCompensation` to `PRCompensationDistribution`, so rows whose distribution was deleted are silently dropped, with no fallback name and no placeholder (confirmed in code: Search() inner join on PRCompensationDistribution). This is a possible silent data-loss point (the money was really paid) to confirm is intended.
- **Unknown `distributionId` behaviour:** confirm empty list, not an error.
- **Window param validation details:** confirm `asOf` bounds (future dates, dates before any payroll data), the exact anchoring of the rolling windows (calendar-month blocks vs day-precise offsets, mirroring the same open item on Budget Compared to Actual), and whether `this_period` should mean the org's fiscal period (as specced, matching the shared picker) or the latest pay period, given `PayCycle` varies per employee.
- **Export endpoints:** no export endpoint exists in the modern API. Decide whether export is client-side generation from the JSON the widget already holds (zero backend work, the Pension Plans default) or a server endpoint.
- **Parallel sign-off-aligned spec:** a second Payroll Distributions API spec exists in `Step 6 - Sign off document/Payroll Distrubution/`, written against the sign-off dossier. It is deliberately untouched by this update; reconciling the two documents into one remains open.
