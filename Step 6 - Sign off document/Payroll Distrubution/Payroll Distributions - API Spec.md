# Payroll Distributions — API Spec (Sign-Off Aligned)

**Status: DRAFT — not final**

> This spec is built from `Payroll+Distributions.doc` (management's sign-off document, this same folder) and `Reconciliation - Payroll Distributions.md` (also this folder), on top of the structure already established in `Step 5 - API documents/Payroll Distributions/Payroll Distributions - API Spec.md`. It states what's needed to satisfy management's sign-off directly — every section below describes a current requirement, not a change from an earlier draft.

## Tables

| Table | Fields used |
|---|---|
| `PR_History` | (via `PREmployee`) CompanyID, CheckDate, CheckType, VoidJournalID |
| `PR_HistoryCompensation` | CompensationDistributionID, Name, Amount |

No new tables. Everything below is served from these same two tables.

**The one real grouping dimension is `PR_HistoryCompensation.Name`.** Confirmed live (Beta1, company "Saint Michael Church"): values are org-defined free text — examples seen include "AA Aid" and "Administration Staff." Whatever an org calls its distributions is exactly what this endpoint returns; there is no fixed category list and no separate department field confirmed anywhere in this data. Treat every `label` in the response below as opaque, org-supplied text.

## Old vs. new

| | Legacy (live today) | Needed |
|---|---|---|
| Endpoint | `GET /api/dashboard/payroll-distributions/data?startDate&endDate` — one call, fixed date range | Same shape, `startDate`+`period` (Weekly, Bi-Weekly, Monthly, Custom) |
| Rows | Flat list, one row per Distribution Name, current period only | Same — one row per Distribution Name, org-defined text, current period |
| Comparison | None | None — this endpoint reports current-period figures only |
| Filter | None | `distribution`, sourced from a real per-org list (see the new lookup endpoint below) — not a fixed set of labels |
| Sort | Fixed alphabetical by Name | Alphabetical by default; amount-descending whenever the caller requests a limited row count (see `limit` below) |
| Drill-through | None | A detail endpoint (see below), to support showing the lines behind a distribution's total inside the widget itself |

## Request params

**Main data endpoint:**

| Param | Type | Required | Default | Notes |
|---|---|---|---|---|
| `startDate` | date | yes | — | |
| `period` | enum | yes | `Weekly` | `Weekly`, `Bi-Weekly`, `Monthly`, `Custom` — end date derived from `startDate` + period length, except `Custom` |
| `endDate` | date | only if `period=Custom` | — | |
| `distribution` | string | no | *(all)* | One value from the org's real distribution names — see the lookup endpoint below for how to populate this as a filter |
| `limit` | integer | no | *(none)* | Caps the row count to the top N by amount. Supplying this switches the default sort to amount-descending (see Sort, below) |
| `sort` | enum | no | see Sort | `alphabetical`, `amount` — explicit value always wins over the `limit`-driven default |

**Distribution list endpoint** (new — populates the filter dynamically instead of a fixed label set):

```
GET /api/dashboard/payroll-distributions/distributions
```

Returns every distribution name the organization actually has on file, so the filter always matches real data rather than a guessed or hardcoded list.

**Detail endpoint** (new — feeds an in-widget overlay, see Drill-through below):

```
GET /api/dashboard/payroll-distributions/detail?distribution={name}&startDate={date}&period={period}
```

Example requests:
```
GET /api/dashboard/payroll-distributions/data?startDate=2026-07-14&period=Weekly
GET /api/dashboard/payroll-distributions/data?startDate=2026-07-14&period=Weekly&distribution=Finance&limit=5
GET /api/dashboard/payroll-distributions/distributions
GET /api/dashboard/payroll-distributions/detail?distribution=Finance&startDate=2026-07-14&period=Weekly
```

## Response shape

**Main data endpoint:**

```json
{
  "period": { "range": "Jul 14–20, 2026" },
  "generatedAt": "2026-07-21T13:40:00Z",
  "total": { "current": 154200 },
  "rows": [
    { "label": "Finance", "current": 44680 },
    { "label": "Administration Staff", "current": 38950 },
    { "label": "AA Aid", "current": 12100 },
    { "label": "Facilities", "current": 21300 }
  ]
}
```

`generatedAt` supports a visible "data as of" freshness indicator on the widget. Amounts are always raw numeric values — currency and date formatting is the frontend's job, using the organization's own locale, never the client device's or server's.

**Distribution list endpoint:**

```json
{ "distributions": ["Finance", "Administration Staff", "AA Aid", "Facilities"] }
```

**Detail endpoint** (working shape — see "Still needs sign-off" for what's unresolved about it):

```json
{
  "distribution": "Finance",
  "period": { "range": "Jul 14–20, 2026" },
  "total": 44680,
  "lines": [
    { "checkDate": "2026-07-15", "amount": 22340 },
    { "checkDate": "2026-07-08", "amount": 22340 }
  ]
}
```

## Sort

Default alphabetical by `label`. If `limit` is supplied, the default becomes amount-descending, so a trimmed view always surfaces the largest distributions rather than an arbitrary alphabetical slice. An explicit `sort` param always takes precedence over either default.

## Drill-through

A focus overlay inside the widget itself, fed by the new detail endpoint above — the destination shows the lines behind a distribution's total for the selected period, without navigating to another module. The existing Earnings Inquiry screen is per-employee, not per-distribution, so it doesn't serve this use case.

## Edge cases to confirm

1. **No payroll runs in range** — empty `rows[]` and a zeroed `total`, or an explicit empty/error response?
2. **`distribution` value that doesn't match any name from the lookup endpoint** — empty result, or an error?
3. **`endDate` before `startDate`** (Custom period only) — reject with an error, or silently swap?
4. **`limit` of 0 or a negative number** — treat as "no limit," or reject as invalid?
5. **Detail endpoint requested for a distribution with no activity in the period** — empty `lines[]` and `total: 0`?
6. **Org with only one distribution name in the lookup endpoint** — does the filter still render, or hide itself when there's nothing to filter?

## Not in scope

- No write/edit operations of any kind — this is a read endpoint set.
- No aggregation across organizations or companies — scoped to the requesting org only, same as every other widget in this project.
- Pay-group scoping is not part of this endpoint. Whether pay group is a real, separate concept from distribution — and how it would relate to this data — depends on a payroll data-model investigation that hasn't happened yet; nothing here should be built assuming that investigation's outcome.

## Still needs sign-off

- **Does a real Department field exist**, separate from Distribution Name — for example, a Home Department field on the employee record that reaches into payroll history? If confirmed, it may become a second, complementary filter dimension alongside `distribution` later. Nothing in this spec currently depends on that being true.
- **What the detail endpoint's line-item shape should actually contain.** The working example above shows check date and amount only; whether it should include any employee-level identifier is a product decision, not an engineering one, given this is regulated payroll data.
- **Entitlement/rights detection** for the widget's loading/empty/error states — not yet answered.
- **Localization root cause** — confirming whether currency/date formatting should key off the organization's own locale setting via a specific field, once engineering identifies where the current mismatch actually comes from.
