# Pension Plans — API Spec

**Status: DRAFT — not final**

## Overview

The widget is a snapshot of the conference's annual clergy-pension obligation: every ACTIVE pension appointment (person active, plan started, not yet ended), summed per plan, filterable by church district. This spec is deliberately 1-to-1 with the existing pension-plans endpoints; the only new field is `AppointeeCount` on the grid rows. The four endpoints that exist today (filters, grid, chart, details) keep their exact shapes and paths. The table, pie, grouped bar, KPI headline, share-of-total, and every total the widget shows are computed client-side from the grid data; nothing else is asked of the backend.

**There is no time axis.** Contributions are annual figures attached to appointments that are active as of today; the source data has no sub-year breakdown and no year scoping. This spec therefore has none of the Time Window Module machinery: no `window`, no `grain`, no `asOf`. Do not copy those parameters over from the Budget Compared to Actual spec; they do not exist here.

Grouping is by PLAN (PlanID plus its display name, e.g. UMPIP, CRSP-DC, CPP): plan names are org-configured strings, not a fixed enum. There is no "Defined Benefit / Defined Contribution / 403(b)" category field anywhere in either codebase (see Not in scope).

## Tables

| Table | Fields used |
|---|---|
| `PB_Appointment` | `Active`, `DateStart`, `DateEnd`, `DistrictID`: the active-appointment predicate and the district scope |
| `PB_AppointmentPlan` | `AppointmentPlanID`, `PlanID`, plan `Name`, `AnnualPlanAmount`: the rows being grouped and summed |
| `PB_ControlTable` | Districts (`Type=0`, `CompanyID`): the district dropdown |
| `PBCharge` | The appointee's church/organisation name for drill rows (via `CorePerson` name; returns an empty string today, a pre-existing defect) |

No new tables and no new queries are needed. The one addition, `AppointeeCount`, is a `COUNT(*)` over the exact same rows the grid endpoint already groups and sums: `[PB_Appointment] WHERE Active=1 AND DateStart<=today AND (DateEnd IS NULL OR DateEnd>=today)` joined to `[PB_AppointmentPlan]`, grouped by `PlanID`+`Name`, `SUM(AnnualPlanAmount)`. That also answers the sign-off dossier's open question ("are appointee counts available?"): yes, no new data required beyond adding the count to the SELECT.

The one genuinely absent piece of data is a plan CATEGORY. The old design's "Plan Type" grouping (Defined Benefit / Defined Contribution / 403(b)) has no backing field in the legacy tables or the modern API; the built Final groups by plan name instead, so nothing in this contract needs it.

## Old vs. new

| | Old (live today) | New (this contract) |
|---|---|---|
| Grid endpoint | `GET /api/dashboard/pension-plans/grid?districtId={guid}` returns `List<PensionPlanGridRowDto>` `{PlanId, Name, Amount}` | Same endpoint, same shape, plus ONE new field: `AppointeeCount` (int) on each row, giving `{PlanId, Name, Amount, AppointeeCount}`. This is the only new data in this spec |
| Chart endpoint | `GET /api/dashboard/pension-plans/chart?districtId={guid}` returns `List<PensionPlanChartItemDto>` `{Name, Amount}` | Unchanged. The widget renders the pie and the bars from the grid data client-side, so it does not depend on this endpoint gaining counts |
| All-districts scope | Prior audit finding: Grid/Chart return ONE district at a time with no aggregate all-districts shape. The comparison doc's data panel reads "optional WHERE DistrictID", which conflicts; unresolved | Preferred path: if the "optional WHERE" reading is correct, calling grid WITHOUT `districtId` already returns the all-districts aggregate (needs a one-line dev confirmation). Guaranteed fallback: the client calls grid once per district from the filters list and merges; zero backend work, and the call count is bounded by the org's district count (small) |
| Appointee counts | Amounts only, in both codebases | `AppointeeCount` on grid rows, a `COUNT(*)` over the same rows already being summed |
| District x plan matrix (grouped bar) | Nothing: legacy pie and the modern chart endpoint are plan-only, one district at a time | NO new endpoint. The client assembles the matrix from the same per-district grid calls used for the all-districts fallback; results are cacheable for the life of the widget load |
| Appointee drill | Exists: `GET /api/dashboard/pension-plans/{planId}/details?districtId={guid}` returns `List<PensionPlanDetailDto>` `{AppointmentPlanId, Appointee, Charge, AnnualAmount, DistrictId}`. `Charge` (the church/organisation, via `PBCharge` CorePerson name) returns an empty string today. Legacy drill grid was Appointee / Charge / Annual Amount / District | Same endpoint, same shape, unchanged. District names are resolved client-side from the filters list; the footer total is a client-side sum of the rows. The only backend item is fixing the pre-existing `Charge` empty-string defect, which currently leaves the drill's Church/organisation column blank |
| Totals and KPI | No total objects anywhere | Still none. The KPI headline (total annual contribution, active appointee count) and every table total are client-side sums of the grid rows |
| Active-appointment predicate | `Active=true AND DateStart<=today AND (DateEnd=null OR DateEnd>=today)`, identical in legacy and modern (confirmed matching in the comparison doc) | Unchanged. It IS the definition of the snapshot |
| Time axis | None. The legacy widget was always an as-of-today snapshot | Still none. No Time Window Module params, ever, on this widget |
| Export | Legacy generated Excel in the detail view only, and exported appointee detail even from the main view (a scope mismatch flagged in the live audit). The modern API has no export endpoints | Undecided; see Still needs sign-off. Client-side generation from the JSON the widget already holds is the zero-backend option |
| District preference | Legacy saved the user's last `DistrictID` | Not in the modern API; client-managed unless decided otherwise, see Still needs sign-off |

## Endpoints

All endpoints are `GET`, company-scoped, and belong to the Pension Billing module (module field `PensionBenefits`, legacy `/PensionBilling`). All four exist today; none are added, renamed, or reshaped.

### District filter list (exists today, unchanged)

```
GET /api/dashboard/pension-plans/filters
```

No parameters beyond company context. Returns the district dropdown list (`[PB_ControlTable] WHERE Type=0 AND CompanyID=ctx`) with "All Districts" prepended, as built. This list is also the client's key for resolving `DistrictId` guids to display names in the drill and the grouped bar.

### Grid (exists today; the one changed endpoint)

```
GET /api/dashboard/pension-plans/grid?districtId={guid}
```

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `districtId` | guid | no | any district id from the filters endpoint | omitted | Narrows the snapshot to one district. Whether omitting it returns the all-districts aggregate is the open "optional WHERE" question (see Still needs sign-off); if it does not, the client assembles all-districts by fan-out (below) |

The single dataset behind the whole widget. Each row gains `AppointeeCount` (int), a `COUNT(*)` over the same active-appointment rows already being summed into `Amount`. The table, pie, grouped bar, KPI, and share-of-total all render from this data client-side.

**All-districts and the grouped bar (client-side assembly).** If omitting `districtId` does not return the aggregate, the client calls this endpoint once per district from the filters list and merges by `PlanId`. The same per-district responses ARE the district x plan matrix for the grouped bar, so no extra endpoint is needed either way. The call count is bounded by the org's district count (districts are few) and the responses are cacheable for the widget load.

### Chart (exists today, unchanged)

```
GET /api/dashboard/pension-plans/chart?districtId={guid}
```

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `districtId` | guid | no | any district id from the filters endpoint | omitted | Same scoping behaviour as grid |

Returns `List<PensionPlanChartItemDto>` `{Name, Amount}`. Amounts-only and unchanged: the widget takes its chart counts from the grid data, so this endpoint needs nothing.

### Appointee detail drill (exists today, unchanged)

```
GET /api/dashboard/pension-plans/{planId}/details?districtId={guid}
```

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `planId` | guid | yes (path) | any `PlanId` returned by grid | none | The plan being drilled |
| `districtId` | guid | no | any district id from the filters endpoint | omitted | Carries the widget's active district filter into the drill, matching the live behaviour |

Shape unchanged. The drill's district column resolves `DistrictId` to a name client-side via the filters list; the footer total is a client-side sum of `AnnualAmount`. The `Charge` field returns an empty string today (pre-existing defect, see Still needs sign-off).

### Example requests

```
GET /api/dashboard/pension-plans/filters
GET /api/dashboard/pension-plans/grid
GET /api/dashboard/pension-plans/grid?districtId=3b8f2d6c-9a1e-4f7b-8d2c-5e9a3c7f1b42
GET /api/dashboard/pension-plans/a1f3c5e7-2b4d-4f6a-8c9e-0d1f2a3b4c5d/details?districtId=7d9e4c1a-2b5f-4e8a-9c3d-1f6b8a2e4d70
```

## Validation rules

No new parameters means no new validation. The existing endpoints' behaviour stands unchanged:

- `districtId` and `planId` values are always taken from the API's own prior responses (the filters list and the grid rows), so the widget never fabricates an id. Whatever the existing endpoints do today with an unknown or foreign guid is unchanged by this spec.
- The one behaviour that needs a written answer is what grid and chart return when `districtId` is OMITTED: the all-districts aggregate (the "optional WHERE DistrictID" reading) or an error/empty result. See Still needs sign-off; the client fan-out fallback works either way.
- There are no time parameters to validate: `window`, `grain`, and `asOf` do not exist on this widget.

## Response schema

All four endpoints return their existing DTOs. Field names below are the DTO property names as they exist in the modern codebase.

### Grid: `List<PensionPlanGridRowDto>`

| Field | Type | Description |
|---|---|---|
| `PlanId` | guid | The plan's id (`PB_AppointmentPlan.PlanID` grouping key); the drill key |
| `Name` | string | The plan's display name; org-configured data, not an enum |
| `Amount` | number | `SUM(AnnualPlanAmount)` over the scope's active appointments on this plan |
| `AppointeeCount` | int | **NEW, the only addition in this spec.** `COUNT(*)` over the exact same rows summed into `Amount` |

### Chart: `List<PensionPlanChartItemDto>` (unchanged)

| Field | Type | Description |
|---|---|---|
| `Name` | string | The plan's display name |
| `Amount` | number | Same aggregation as the grid's `Amount` |

### Details: `List<PensionPlanDetailDto>` (unchanged)

| Field | Type | Description |
|---|---|---|
| `AppointmentPlanId` | guid | `PB_AppointmentPlan.AppointmentPlanID`, the row's stable key |
| `Appointee` | string | The appointee's (clergy) display name |
| `Charge` | string | The church/organisation the appointee is charged to (via `PBCharge` CorePerson name). Returns an empty string today: a pre-existing defect, not a schema change. Once fixed, the same field carries the name |
| `AnnualAmount` | number | The appointment's `AnnualPlanAmount` |
| `DistrictId` | guid | The appointment's district; the client resolves the display name from the filters list |

Notes:

- Amounts are plain decimal numbers, no currency formatting; currency symbol and locale are client concerns (the live audit's pound-sign-on-US-data defect is a frontend localisation bug, not an API field).
- There are no envelope objects, no echo headers, no `generatedAt` stamps, and no server-computed totals anywhere: the responses are the bare lists the endpoints return today.
- Share of total is a client division; totals are client sums; the district x plan matrix is a client merge. All of it derives from grid rows.

## Examples

All figures below are MOCK data shaped like production: the Final build's dataset of 10 appointees across 3 districts and 5 plans, totalling 48,252.43. They are not live-verified production values; the shapes and the arithmetic reconciliation are the contract, not the amounts.

### Example 1: grid, all districts (the default view)

Assuming the "optional WHERE" reading is confirmed, omitting `districtId` returns the aggregate. Amounts sum to 48,252.43 and counts to 10; the KPI headline is the client-side sum of exactly these rows.

```
GET /api/dashboard/pension-plans/grid
```

```json
[
  { "PlanId": "a1f3c5e7-2b4d-4f6a-8c9e-0d1f2a3b4c5d", "Name": "Employee Before Tax-UMPIP", "Amount": 24000.00, "AppointeeCount": 3 },
  { "PlanId": "b2e4d6f8-3c5a-4a7b-9d0e-1f2a3b4c5d6e", "Name": "CRSP-DB-%", "Amount": 7532.56, "AppointeeCount": 2 },
  { "PlanId": "c3d5e7f9-4b6a-4b8c-a0e1-2f3a4b5c6d7e", "Name": "CRSP-DC", "Amount": 7037.31, "AppointeeCount": 2 },
  { "PlanId": "d4c6f8a0-5e7b-4c9d-b1f2-3a4b5c6d7e8f", "Name": "CPP", "Amount": 6682.56, "AppointeeCount": 2 },
  { "PlanId": "e5b7a9c1-6f8d-4dea-82e3-4b5c6d7e8f90", "Name": "Flat CRSP-DB", "Amount": 3000.00, "AppointeeCount": 1 }
]
```

If the confirmation comes back negative, the client produces this identical dataset by merging the three per-district responses in Example 2 (same rows, keyed by `PlanId`, amounts and counts added).

### Example 2: per-district grid calls and the client-assembled matrix (grouped bar)

Three calls, one per district from the filters list. District totals (22,873.84 + 12,859.94 + 12,518.65) sum to the all-districts 48,252.43, appointee counts (4 + 3 + 3) to 10, and each plan's cells sum to its Example 1 row (e.g. CRSP-DC: 3,518.66 + 3,518.65 = 7,037.31). A plan with no active appointee in a district simply has no row there; the client renders those cells as zero-height bars.

```
GET /api/dashboard/pension-plans/grid?districtId=7d9e4c1a-2b5f-4e8a-9c3d-1f6b8a2e4d70
```

```json
[
  { "PlanId": "a1f3c5e7-2b4d-4f6a-8c9e-0d1f2a3b4c5d", "Name": "Employee Before Tax-UMPIP", "Amount": 12000.00, "AppointeeCount": 1 },
  { "PlanId": "b2e4d6f8-3c5a-4a7b-9d0e-1f2a3b4c5d6e", "Name": "CRSP-DB-%", "Amount": 4532.56, "AppointeeCount": 1 },
  { "PlanId": "d4c6f8a0-5e7b-4c9d-b1f2-3a4b5c6d7e8f", "Name": "CPP", "Amount": 3341.28, "AppointeeCount": 1 },
  { "PlanId": "e5b7a9c1-6f8d-4dea-82e3-4b5c6d7e8f90", "Name": "Flat CRSP-DB", "Amount": 3000.00, "AppointeeCount": 1 }
]
```

```
GET /api/dashboard/pension-plans/grid?districtId=3b8f2d6c-9a1e-4f7b-8d2c-5e9a3c7f1b42
```

```json
[
  { "PlanId": "a1f3c5e7-2b4d-4f6a-8c9e-0d1f2a3b4c5d", "Name": "Employee Before Tax-UMPIP", "Amount": 6000.00, "AppointeeCount": 1 },
  { "PlanId": "c3d5e7f9-4b6a-4b8c-a0e1-2f3a4b5c6d7e", "Name": "CRSP-DC", "Amount": 3518.66, "AppointeeCount": 1 },
  { "PlanId": "d4c6f8a0-5e7b-4c9d-b1f2-3a4b5c6d7e8f", "Name": "CPP", "Amount": 3341.28, "AppointeeCount": 1 }
]
```

```
GET /api/dashboard/pension-plans/grid?districtId=9c4a7e2f-1d6b-4a9e-b3f8-2c5d7e9a4f16
```

```json
[
  { "PlanId": "a1f3c5e7-2b4d-4f6a-8c9e-0d1f2a3b4c5d", "Name": "Employee Before Tax-UMPIP", "Amount": 6000.00, "AppointeeCount": 1 },
  { "PlanId": "b2e4d6f8-3c5a-4a7b-9d0e-1f2a3b4c5d6e", "Name": "CRSP-DB-%", "Amount": 3000.00, "AppointeeCount": 1 },
  { "PlanId": "c3d5e7f9-4b6a-4b8c-a0e1-2f3a4b5c6d7e", "Name": "CRSP-DC", "Amount": 3518.65, "AppointeeCount": 1 }
]
```

The widget merges those responses into the structure below. This is CLIENT-ASSEMBLED, NOT AN API RESPONSE; it is shown only so frontend and backend agree on what the merge produces. District names come from the filters list, totals are client sums.

```json
{
  "clientAssembled": true,
  "districts": [
    {
      "districtId": "7d9e4c1a-2b5f-4e8a-9c3d-1f6b8a2e4d70",
      "name": "District 1",
      "totalAmount": 22873.84,
      "totalAppointees": 4,
      "cells": [
        { "planId": "a1f3c5e7-2b4d-4f6a-8c9e-0d1f2a3b4c5d", "amount": 12000.00, "appointeeCount": 1 },
        { "planId": "b2e4d6f8-3c5a-4a7b-9d0e-1f2a3b4c5d6e", "amount": 4532.56, "appointeeCount": 1 },
        { "planId": "d4c6f8a0-5e7b-4c9d-b1f2-3a4b5c6d7e8f", "amount": 3341.28, "appointeeCount": 1 },
        { "planId": "e5b7a9c1-6f8d-4dea-82e3-4b5c6d7e8f90", "amount": 3000.00, "appointeeCount": 1 }
      ]
    },
    {
      "districtId": "3b8f2d6c-9a1e-4f7b-8d2c-5e9a3c7f1b42",
      "name": "District 2",
      "totalAmount": 12859.94,
      "totalAppointees": 3,
      "cells": [
        { "planId": "a1f3c5e7-2b4d-4f6a-8c9e-0d1f2a3b4c5d", "amount": 6000.00, "appointeeCount": 1 },
        { "planId": "c3d5e7f9-4b6a-4b8c-a0e1-2f3a4b5c6d7e", "amount": 3518.66, "appointeeCount": 1 },
        { "planId": "d4c6f8a0-5e7b-4c9d-b1f2-3a4b5c6d7e8f", "amount": 3341.28, "appointeeCount": 1 }
      ]
    },
    {
      "districtId": "9c4a7e2f-1d6b-4a9e-b3f8-2c5d7e9a4f16",
      "name": "District 3",
      "totalAmount": 12518.65,
      "totalAppointees": 3,
      "cells": [
        { "planId": "a1f3c5e7-2b4d-4f6a-8c9e-0d1f2a3b4c5d", "amount": 6000.00, "appointeeCount": 1 },
        { "planId": "b2e4d6f8-3c5a-4a7b-9d0e-1f2a3b4c5d6e", "amount": 3000.00, "appointeeCount": 1 },
        { "planId": "c3d5e7f9-4b6a-4b8c-a0e1-2f3a4b5c6d7e", "amount": 3518.65, "appointeeCount": 1 }
      ]
    }
  ]
}
```

### Example 3: appointee detail drill (UMPIP, all districts), unchanged shape

The existing response, exactly as it comes back today: a bare list, no envelope, no total. The client sums `AnnualAmount` for the footer (12,000.00 + 6,000.00 + 6,000.00 = 24,000.00, matching Example 1's UMPIP row) and resolves each `DistrictId` to a name via the filters list. `Charge` is shown as it actually returns today, an empty string: the pre-existing defect that leaves the Church/organisation column blank until fixed (see Still needs sign-off).

```
GET /api/dashboard/pension-plans/a1f3c5e7-2b4d-4f6a-8c9e-0d1f2a3b4c5d/details
```

```json
[
  { "AppointmentPlanId": "f6a8b0c2-7e9d-4eab-93f4-5c6d7e8f9a01", "Appointee": "Rev. Jonathan Pierce", "Charge": "", "AnnualAmount": 12000.00, "DistrictId": "7d9e4c1a-2b5f-4e8a-9c3d-1f6b8a2e4d70" },
  { "AppointmentPlanId": "a7b9c1d3-8f0e-4fbc-a4f5-6d7e8f9a0b12", "Appointee": "Rev. Naomi Adler", "Charge": "", "AnnualAmount": 6000.00, "DistrictId": "3b8f2d6c-9a1e-4f7b-8d2c-5e9a3c7f1b42" },
  { "AppointmentPlanId": "b8c0d2e4-9a1f-4acd-b5f6-7e8f9a0b1c23", "Appointee": "Rev. Caleb Monroe", "Charge": "", "AnnualAmount": 6000.00, "DistrictId": "9c4a7e2f-1d6b-4a9e-b3f8-2c5d7e9a4f16" }
]
```

## Snapshot semantics (no time axis)

- The snapshot is defined entirely by the active-appointment predicate evaluated at request time: `Active=true AND DateStart<=today AND (DateEnd=null OR DateEnd>=today)`, both boundary dates inclusive. This is the existing predicate, confirmed identical in legacy and modern; every endpoint applies it, unchanged.
- "Data as of" is simply the request moment; the existing responses carry no server timestamp and this spec does not add one. Refresh is a plain re-request.
- There is no `asOf` and no historical reproduction: yesterday's snapshot is not reconstructable from this API, by design.
- When the client assembles all-districts by fan-out, the per-district calls happen close together but are not a single transaction; an appointment changing mid-fan-out could skew a total by one row. Accepted as a snapshot-widget non-issue, noted so nobody discovers it later.

## Sorting and aggregation boundaries

- Response ordering is whatever the existing endpoints return today; it is not part of this contract. The widget's sort orders (amount descending in the table, appointee name ascending in the drill) are client-side re-orders of the returned arrays.
- Share of total is a client division; the KPI headline and all table/footer totals are client sums; the district x plan matrix is a client merge keyed by `PlanId`. No share, percentage, or total fields are returned by any endpoint.
- The fan-out for all-districts and the grouped bar is bounded by the org's district count (from the filters endpoint) and the responses are cacheable for the life of the widget load: one set of grid calls feeds the table, pie, bars, and KPI.
- Amounts must be exact decimals end to end (money types, not floats), and the client must sum them with decimal-safe arithmetic: the dataset deliberately contains a cent split (3,518.66 + 3,518.65 = 7,037.31) that float arithmetic gets wrong.

## Edge cases

1. **Org with no active appointments:** grid returns an empty list; the frontend renders its purposeful empty state from zero rows. Not an error.
2. **District with no active appointments:** empty grid list for that district; in the client-assembled matrix the district still appears (it came from the filters list) with zero-height bars.
3. **Plan active in some districts only:** that district's grid response simply has no row for the plan; the client merge fills the cell as zero. Zero-filled rows are never sent.
4. **Known `planId`, empty scope on details:** a valid plan whose requested district has no active appointees returns an empty list, not an error, matching today's behaviour.
5. **Partial fan-out failure:** if one per-district grid call fails during the all-districts merge, the client must not silently render a partial total; it shows the widget's error/retry state instead. Entirely a client rule; no backend change.
6. **Boundary dates:** an appointment starting today or ending today is ACTIVE (both comparisons inclusive, matching the existing predicate exactly).
7. **`Charge` empty string:** until the pre-existing `PBCharge` defect is fixed, `Charge` comes back `""` and the drill's Church/organisation column renders blank. The client treats `""` as "not available" for display; no schema change is involved.
8. **Duplicate plan display names:** grid rows are keyed by `PlanId`; two distinct plans with the same display name stay separate rows. The client merge for the matrix MUST key on `PlanId`, never `Name`, for exactly this reason.
9. **No module rights:** what the API returns for a user without the Pension Billing module (`PensionBenefits`) is the existing endpoints' current behaviour; whether that is an explicit 403 or an empty 200 needs confirmation (see Still needs sign-off).
10. **District deleted between requests:** districts are customer-configured (`PB_ControlTable`), so a remembered `districtId` can stop existing; the client refetches filters and drops the stale selection. Server behaviour for the stale guid is today's behaviour, unchanged.

## Not in scope

- **No new endpoints, envelopes, or server-computed fields.** No aggregate endpoint, no matrix endpoint, no total objects, no echo headers, no timestamps. The contract is the four existing endpoints plus one integer field.
- **No Time Window Module.** No `window`, `grain`, or `asOf` parameters, no buckets, no partial flags. This is stated as scope, not an omission: the widget is a snapshot.
- **No billing/payment status.** The sign-off dossier floats connecting the obligation to whether it is being billed/paid (remittance/billing); that is a phased, cross-widget idea, not part of this contract.
- **No plan-type categorisation.** No Defined Benefit / Defined Contribution / 403(b) field exists to expose; grouping is by plan name only. If that grouping ever returns, it is new schema, not a new query.
- **Export file generation is not specced here.** The export row sets are defined by the grid and details data the widget already holds; whether files are generated client-side or server-side is an open decision, see Still needs sign-off.
- **The Pension Billing deep link** (a real page link out of the widget) is frontend navigation with no confirmed target page; tracked in Still needs sign-off, nothing for this API.
- **Currency and locale formatting.** The API returns plain numbers; the live audit's pound-symbol-on-US-data defect is a client localisation bug, listed here so nobody specs a currency field to fix it.

## Still needs sign-off

- **All-districts behaviour of grid/chart when `districtId` is omitted.** The two prior claims conflict: the audit found the endpoints return one district at a time with no aggregate shape, while the comparison doc's data panel reads "optional WHERE DistrictID=ctx", which could mean all-districts-when-omitted. One line from a backend dev settles it. If omitted-means-aggregate is confirmed, the widget's default view is a single call; if not, the client fan-out fallback in this spec covers it with zero backend work. Nothing is blocked either way.
- **`AppointeeCount` on the grid rows: the one change in this spec.** A `COUNT(*)` added to the SELECT the grid endpoint already runs, surfacing as one new int per row. Needs backend agreement that the field lands on `PensionPlanGridRowDto`.
- **`Charge` empty-string fix: a pre-existing defect, not new data.** The details endpoint's `Charge` field (church/organisation via `PBCharge` CorePerson name) returns `""` today, leaving the drill's Church/organisation column blank. The fix is populating the existing field; no schema change.
- **Export decision.** The built Final assumes an active-view export (CSV/Excel/PDF) and an appointee-detail export from the drill. No export endpoints exist in the modern API, and legacy only ever generated Excel of the appointee detail (even from the main view, the scope mismatch flagged in the live audit). Decide whether files are generated client-side from the JSON the widget already holds (zero backend work) or server-side (new endpoints).
- **District preference persistence.** Legacy saved each user's last `DistrictID`; the modern API has no equivalent. Decide whether that returns (new preference-storage work) or client-managed state is acceptable permanently, mirroring the same open question on Budget Compared to Actual.
- **Entitlement behaviour.** The sign-off dossier flags "no Pension Billing module / no rights" as hidden-or-explicit-no-access to confirm. Confirm what the existing endpoints return for an unentitled user (explicit 403 recommended over an empty 200 that reads as "no pension data") and that the module check is `PensionBenefits`.
- **Drill-through/deep-link target to the Pension Billing module.** Confirmed needed in Step 4, still has no target page/URL; open item carried from the design doc (its Sign-off Readiness table, item 1). Frontend navigation only; nothing for this API.
