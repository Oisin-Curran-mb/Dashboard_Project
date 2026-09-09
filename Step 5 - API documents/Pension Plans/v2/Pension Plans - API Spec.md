# Pension Plans - API Spec

**Status: Done - awaiting sign-off (drafting complete, owner review pending)**

## Overview

The widget answers one question: what is the conference's annual clergy-pension obligation right now, split by pension plan, narrowable to one church district, with a drill into the individual appointees on any plan. The data is a snapshot of the pension appointments active today (person active, plan started, not yet ended); there is no time axis, no window, no grain anywhere in this contract.

This contract defines three APIs: a district lookup read once per widget lifetime (API 1), a bounded summary read fired on render and on every district change that carries both the per-plan rollup and the per-district cells behind it (API 2), and a per-plan appointee detail read fired only when the user opens the drill (API 3). The justification for exactly three lives in the API inventory. Every total, share and count on screen is client arithmetic over the summary response; the server returns aggregates and rows, never grand totals.

## Design → API coverage

| Design element | Type | API | Field(s) | Provenance |
|---|---|---|---|---|
| Headline total annual contribution (Glance figure, Explore/Detail header, table footer, pie centre) | KPI | API 2 | client sum of `amount` across `plans[]` | DERIVED client [BUILD] |
| Appointee-count badge beside the headline | KPI | API 2 | client sum of `appointeeCount` across `plans[]` | NEW (count is not returned by any endpoint today) [BUILD] |
| Glance caption "contributed a year across N plans, [district scope]" | KPI | API 2 | client count of `plans[]` rows; scope label is client filter state | DERIVED client [BUILD] |
| District filter chip and its listbox popover options | filter | API 1 | `districtId`, `name` | STORED PB_ControlTable [CODE, Widget_Comparison_Classic.html] |
| View toggle (Table / Pie / By district at Explore; two-way Pie / By district at Detail) | view toggle | none | none needed: pure client view state over the held API 2 response; no fetch on toggle | client state [BUILD] |
| Table rows: plan name per row | table column | API 2 | `planId`, `name` | STORED [CODE, Widget_Comparison_Classic.html] |
| Table Share bar (Explore) / share percent (Detail) | table column | API 2 | client division: row `amount` over the client total | DERIVED client [BUILD] |
| Table Appointees column | table column | API 2 | `appointeeCount` | NEW [BUILD] |
| Table Annual amount column, default sort amount descending | table column | API 2 | `amount`; sort is a client re-order | DERIVED SUM(AnnualPlanAmount) [CODE] |
| Pie slices, centre total, legend money and percent per plan | chart series | API 2 | `amount`, `name`; percent is a client division | DERIVED [BUILD] |
| By district view: one group per district, one bar per plan, per-bar amount and appointee text, group totals | chart series | API 2 + API 1 | `districts[].districtId`, `districts[].amount`, `districts[].appointeeCount`; group labels resolved via API 1 `name`; group totals are client sums | DERIVED / NEW (per-district cells and counts are a new response shape) [BUILD] |
| Drill modal columns: Appointee, Church / organisation, District, Annual amount | drill | API 3 | `Appointee`, `Charge`, `DistrictId`, `AnnualAmount` | STORED [CODE, Widget_Comparison_Classic.html]; `Charge` returns an empty string today, a pre-existing defect |
| Drill modal District column display names | drill | API 3 + API 1 | `DistrictId` resolved client-side against API 1 `districtId` / `name` | DERIVED client |
| Drill modal row identity (list keying) | drill | API 3 | `AppointmentPlanId` | STORED PB_AppointmentPlan.AppointmentPlanID [CODE] |
| Drill modal footer: appointee count and total | drill | API 3 | client count of rows and client sum of `AnnualAmount` | DERIVED client [BUILD] |
| Widget menu export of the plan summary; modal Export to Excel of the appointee detail | action | undecided | the row sets are exactly the API 2 and API 3 responses the client already holds; whether files are generated client-side or server-side is in Still needs sign-off | UNVERIFIED (Oisin Curran) |
| Empty state ("No active pension appointments", with a compact Glance variant) | state | API 2 | an empty `plans[]` array is the trigger; no dedicated field | contract [BUILD] |
| Loading state (skeleton on district change) | state | none | none needed: client transition while API 2 is in flight | client state [BUILD] |
| Refresh control | action | API 2 | plain re-request of API 2 with the current `districtId`; API 1 re-fetches only when its cache expires | contract [BUILD] |
| Stale view-state normalisation (an unknown stored view value renders the Table) | state | none | none needed: client state normalisation, no data involved | client state [BUILD] |

## Tables

| Table / repository | Fields and members used |
|---|---|
| `PB_Appointment` | `Active`, `DateStart`, `DateEnd`, `DistrictID`: the active-appointment predicate and the district scope [CODE, Widget_Comparison_Classic.html] |
| `PB_AppointmentPlan` | `AppointmentPlanID`, `PlanID`, plan `Name`, `AnnualPlanAmount`: the rows grouped, summed and counted [CODE, Widget_Comparison_Classic.html] |
| `PB_ControlTable` | District rows (`Type=0`, `CompanyID`): the district lookup [CODE, Widget_Comparison_Classic.html] |
| `PBCharge` | The appointee's church/organisation name for drill rows (resolved via the CorePerson name; returns an empty string today, a pre-existing defect) [CODE, Widget_Comparison_Classic.html] |

No new tables and no schema changes are needed: the contract is new queries against existing tables. API 2 is one new query shape (the same rows the legacy grid already reads, grouped by plan and by plan-plus-district in a single read, with a `COUNT(*)` added). API 1 and API 3 are the existing reads.

Core formulas and always-applied filters, each quotable in isolation:

- **Active-appointment predicate, applied to every read of appointment rows:** `Active = true AND DateStart <= today AND (DateEnd IS NULL OR DateEnd >= today)`. Both boundary comparisons are inclusive. Confirmed identical in legacy and modern code. [CODE, Widget_Comparison_Classic.html]
- **Amount per plan:** `SUM(PB_AppointmentPlan.AnnualPlanAmount)` grouped by `PlanID` and `Name`, over active appointments in scope. [CODE, Widget_Comparison_Classic.html]
- **Appointee count per plan:** `COUNT(*)` over the exact same rows summed into the amount. Counts are plan-assignment rows, not distinct persons: a person on two plans counts once per plan. [BUILD, matching the built Final's row-based counting; distinct-person counting is in Still needs sign-off]
- **Per-district cell:** the same SUM and COUNT additionally grouped by `PB_Appointment.DistrictID`. [DOC, Step 1 - Dashboard Research/02 - Pension Plans.md]
- **District scoping:** the district filter is applied only when a district is chosen (`if districtID != Guid.Empty` in the legacy source); with no district the query has no district WHERE at all, so rows with a null `DistrictID` are included under "All Districts" and excluded by any specific district value. A blank district never behaves as a wildcard. [CODE, Pending Questions - Codebase Findings, PensionPlans.ascx.cs gridPlans_NeedDataSource lines 116-121 and Details lines 60-63]
- **District lookup:** `PB_ControlTable WHERE Type = 0 AND CompanyID = ctx`. [CODE, Widget_Comparison_Classic.html]

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Summary read | `GET /api/dashboard/pension-plans/grid?districtId={guid}` returns `List<PensionPlanGridRowDto>` `{PlanId, Name, Amount}`: plan rollup only, one scope per call, no counts, no district cells [CODE] | **NEW**: API 2 (`/summary`) returns the plan rollup plus `appointeeCount` per plan plus the per-district cells in one response, so one consistent read funds the table, pie, By district view and KPI. Same tables, one new query shape |
| Chart read | `GET /api/dashboard/pension-plans/chart?districtId={guid}` returns `{Name, Amount}` [CODE] | Not called by this widget: every view renders from the API 2 response. The endpoint is out of this contract (see Not in scope) |
| Appointee counts | Amounts only, in both codebases [CODE] | **NEW**: `appointeeCount` per plan and per district cell, a `COUNT(*)` over rows already being summed |
| District x plan matrix (By district view) | Nothing returns it; per-district amounts exist only as separate one-district grid calls [CODE] | **DERIVED, reshaped**: `districts[]` cells inside each API 2 plan row; the aggregation exists today, the shape is new |
| Appointee drill | `GET /api/dashboard/pension-plans/{planId}/details?districtId={guid}` returns `List<PensionPlanDetailDto>` `{AppointmentPlanId, Appointee, Charge, AnnualAmount, DistrictId}` [CODE] | Unchanged shape (API 3). The one backend item is populating `Charge`, which returns an empty string today: a pre-existing defect fix, not new schema |
| District lookup | `GET /api/dashboard/pension-plans/filters`, server prepends an "All Districts" entry [CODE] | Same read; the response carries real district rows only and the client renders the "All Districts" option. "All" is expressed on the wire by omitting `districtId` |
| Totals and KPI | No total objects anywhere [CODE] | Still none: every total, share and count on screen is a client sum or division over the API 2 response |
| District preference | Legacy saves the user's last `DistrictID` per user [CODE, Widget_Comparison_Classic.html] | Not in the modern API; client-managed unless decided otherwise (Still needs sign-off) |
| Export | Legacy generates Excel of the appointee detail only, via `Page.ExportToExcel` [CODE, PensionPlans.buttonExportExcel_Click]; no modern export endpoints exist | Undecided: client-side generation from held JSON versus new server endpoints (Still needs sign-off). **UNVERIFIED** either way |

## API inventory

| API | Purpose | Trigger (when it fires) | Cardinality | R/W | Cache posture | Split trigger |
|---|---|---|---|---|---|---|
| API 1: District lookup | The district filter options, and the id-to-name map for drill rows and By district group labels | Widget render, once; re-fetched only on cache expiry | 3 rows live [LIVE 2026-07-23, beta1 dossier]; ceiling [TO CONFIRM] (Marvin) | R | TTL (org-configured control list; 1 hour suggested, dev team to set) | Lifetime gap: rarely-changing config versus live data |
| API 2: Pension summary | The single dataset behind every view: per-plan rollup with counts, plus per-district cells | Widget render, and every district change (the widget's only filter fetch); Refresh re-fires it | Bounded: plans x districts, both org-configured (5 plans x 3 districts live [LIVE 2026-07-23, beta1 dossier]) | R | LIVE per request | Base read; separate from API 1 by lifetime gap and from API 3 by trigger and grain gap |
| API 3: Appointee detail | The drill modal rows for one plan, optionally scoped to one district | Only when the user opens the drill (table row, pie legend entry, or a By district bar) | Active appointments on one plan; typical single digits [BUILD]; ceiling [TO CONFIRM] (Marvin) | R | LIVE per request | Trigger gap (fires on click, never on render) and grain gap (per-entity rows versus aggregates) |

Merges considered, closed: API 1 and API 2 always fire together at first render and could be one call, but they are kept separate because the lookup is shared-lifetime config cacheable across renders while the summary is live, and the popover, drill and By district labels all reuse the lookup without re-paying for data. A per-district fan-out over the existing grid endpoint could assemble API 2's matrix with zero backend work; it is rejected because N near-simultaneous calls can straddle a write and disagree with their own merged total, a partial fan-out failure has no clean rendering, and the call count is bounded only by an unconfirmed org config value.

## Call sequence

| Interaction | Calls fired | Notes |
|---|---|---|
| Initial widget load | API 1 + API 2 (parallel) | API 2 without `districtId` = All Districts. Every size (Glance, Explore, Detail) renders from the same response |
| Change district (the chip) | API 2 with `districtId` | The widget's only filter fetch; the client shows its loading transition while in flight. API 1 is not re-fired |
| Switch view (Table / Pie / By district) or change sort | none | Client re-render over the held API 2 response |
| Open drill (table row or pie legend entry) | API 3 with `planId` and the widget's current `districtId` | The active district filter carries into the drill |
| Open drill from a By district bar | API 3 with `planId` and that bar's own `districtId` | The bar drills to that plan AND that district, regardless of the widget filter |
| Close drill | none | Client only |
| Submit action (summary export, detail export) | none today | Export generation is undecided (Still needs sign-off); the row sets are the held API 2 / API 3 responses |
| Refresh | API 2 (current `districtId`); API 1 only if its TTL expired | A plain re-request; there is no server-side cache to invalidate |

Consistency across calls: there is no shared asOf anchor in this contract. API 2 and API 3 evaluate the active-appointment predicate at their own request moments, so a drill opened while an appointment changes can disagree with the summary row by one appointee. Accepted: the widget is an as-of-now snapshot, the drill is a fresh read by design, and the existing endpoints carry no snapshot reproduction to anchor to. The dossier's request for a visible "data as of" signal is in Still needs sign-off.

## Filter architecture

| Filter | Option source | Cardinality | Execution | Aggregate effect | Cascade | "All" wire form | Round trips |
|---|---|---|---|---|---|---|---|
| District (chip + listbox popover) | LOOKUP: API 1 (`PB_ControlTable WHERE Type=0`) | 3 live [LIVE 2026-07-23, beta1 dossier]; org-configured, ceiling [TO CONFIRM] (Marvin) | SERVER: `districtId` on API 2, carried onto API 3 | Yes: every amount, count, share and cell re-scopes | None (single filter) | Omit the param entirely; the server applies the district WHERE only when a district is sent [CODE, Pending Questions - Codebase Findings] | 1 (one API 2 call per change) |

- **Combination semantics:** the widget has exactly one filter. The only combining that occurs is on API 3, where `planId` AND `districtId` narrow together (AND semantics, both narrowing).
- **Conflict rule:** a `planId` and `districtId` pair that matches no active appointment is a legitimate scope, not an error: API 3 returns an empty list and the modal renders its own empty message. An unknown or stale `districtId` (a district deleted since the lookup was fetched) matches no rows and yields a well-formed empty summary (`plans: []`), never an error; the client then refetches API 1 and clears the stale selection to All Districts.
- **Blank values:** appointment rows with a null `DistrictID` are included under "All Districts" (no WHERE is applied) and excluded by any specific district value. A blank never behaves as a wildcard. Whether null-district rows exist in production data is [TO CONFIRM] (Oisin Curran).
- **Cascade invalidation:** not applicable; there is no dependent filter.
- **Empty-result semantics:** any valid scope that matches nothing returns `{ "plans": [] }` on API 2 and `[]` on API 3; the client renders the purposeful empty state. Field-by-field zero shapes are in each API's State contracts.
- **Lookup endpoint:** the LOOKUP source is API 1 in this contract's own inventory, not an external shared endpoint.

## Volume and performance

| Dataset | Typical rows | Worst realistic rows (basis) | Row width | Payload at worst | Verdict | Server cost model | Cache posture |
|---|---|---|---|---|---|---|---|
| API 1 districts | 3 [LIVE 2026-07-23, beta1 dossier] | [TO CONFIRM] (Marvin): org-configured control list, expected small | 2 fields, ~80 bytes | A few KB even at an implausible hundred districts | BOUNDED (config-defined lookup) | Single indexed scan of `PB_ControlTable` by CompanyID + Type | TTL |
| API 2 summary | 5 plan rows x 3 district cells [LIVE 2026-07-23, beta1 dossier; the built Final's dataset matches] | [TO CONFIRM] (Marvin): plans and districts are both org-configured dimensions, so the row count is plans x districts, not per-appointment | ~4 fields per plan + 3 per cell, ~350 bytes per plan row | Tens of KB at any plausible config | BOUNDED (aggregate over config-defined dimensions, never per-appointment rows) | Single indexed scan of active `PB_Appointment` join `PB_AppointmentPlan`, one GROUP BY plan + district; rollup derived from the same pass | LIVE |
| API 3 details | 1-3 rows per plan [BUILD: 10 appointees across 5 plans] | [TO CONFIRM] (Marvin): active appointments on the largest plan at the largest conference. The build's 10 rows are a demo figure, not a ceiling | 5 fields, ~150 bytes | ~150 KB even at 1,000 rows, but that figure is unconfirmed | BOUNDED, conditional on the [TO CONFIRM] ceiling: treated as a bounded roster (active clergy assignments, not transactions). If Marvin's confirmed ceiling is materially above ~1,000 rows this verdict flips and API 3 must gain the full server-side paging contract before build | Single indexed scan filtered by plan (+ district), join to the charge name | LIVE |

There is no time series anywhere in this contract, so there is no N x M entities-times-points product to compute.

### Pagination contract

Nothing in this contract paginates: all three datasets are bounded reads (API 3 conditionally, per the [TO CONFIRM] above), so there are no page, pageSize, sortBy, sortDir or totalCount parameters. If API 3's confirmed ceiling forces MUST PAGINATE, this section must be written before build.

## Where computation lives

| Value | Server or client | Basis | Why |
|---|---|---|---|
| Plan amount (`amount`) | SERVER | SUM over appointment rows the client never holds | Framework rule: spans data not transmitted |
| Plan appointee count (`appointeeCount`) | SERVER | COUNT over the same rows | Same |
| Per-district cell amount and count | SERVER | Same aggregation grouped by district | Same |
| Headline total annual contribution | CLIENT | Sum of `plans[].amount`, all present and bounded | Pure arithmetic over held values; the table footer, pie centre and Glance figure agree by construction because they sum the same rows |
| Total appointee count (badge, table footer) | CLIENT | Sum of `plans[].appointeeCount` | Same |
| Plan count (caption) | CLIENT | Length of `plans[]` | Same |
| Share percent per plan (table share column, pie legend) | CLIENT | Row `amount` divided by the client total | Pure arithmetic. Division-by-zero rule: a zero or empty total renders the empty state, and any share computed against a non-positive total displays as 0%, never NaN or an error |
| By district group totals | CLIENT | Sum of that district's cells | Pure arithmetic over held values |
| Table sort order | CLIENT | Re-order of the bounded plan rows | Bounded set fully held |
| Drill footer count and total | CLIENT | Count and sum of the API 3 rows | Bounded set fully held |
| District display names (drill column, group labels) | CLIENT | Join `DistrictId` to the API 1 list | Both lists held |
| Presentation (plan dot ramp, share bar rendering, empty/loading visuals) | CLIENT | Client presentation over raw numbers | The API returns raw numbers only; no thresholds exist on this widget, so there is no unapproved-threshold open item |

There are no server-computed percentages and no deltas anywhere in this contract, so no server division-by-zero rule and no pre-signing rule is needed; the client's zero rule is stated above. Client arithmetic must be decimal-safe: the summary legitimately carries cent splits (3,518.66 + 3,518.65 = 7,037.31) that binary floating point mis-sums. [BUILD] + [DOC, Step 4 - Widget Final Design/W02 - Pension Plans.md]

## API 1: District lookup

### Endpoint

```
GET /api/dashboard/pension-plans/filters
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| (none) | n/a | n/a | n/a | n/a | No query parameters; company context comes from the `X-Company-ID` header (see Auth and scoping) |

### Example requests

```
GET /api/dashboard/pension-plans/filters
GET /api/dashboard/pension-plans/filters   (identical after a district change; the client re-uses its cached copy instead)
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `districts[]` | array | DERIVED container; provenance sits on its nested fields | One entry per district configured for the company; real districts only, no "All Districts" row (the client renders that option) |
| `districts[].districtId` | guid | STORED PB_ControlTable key [CODE, Widget_Comparison_Classic.html; exact column name UNVERIFIED (Oisin Curran)] | The value sent back as `districtId` on API 2 and API 3 |
| `districts[].name` | string | STORED PB_ControlTable district name [CODE, Widget_Comparison_Classic.html; exact column name UNVERIFIED (Oisin Curran)] | Display name for the popover, drill District column and By district group labels |

### Example response

```json
{
  "districts": [
    { "districtId": "7d9e4c1a-2b5f-4e8a-9c3d-1f6b8a2e4d70", "name": "District 1" },
    { "districtId": "3b8f2d6c-9a1e-4f7b-8d2c-5e9a3c7f1b42", "name": "District 2" },
    { "districtId": "9c4a7e2f-1d6b-4a9e-b3f8-2c5d7e9a4f16", "name": "District 3" }
  ]
}
```

Reconciliation: 3 rows, matching the 3 district groups in API 2's all-districts example below; every `districtId` appearing in an API 2 cell or an API 3 row resolves against this list.

### State contracts

| State | Response |
|---|---|
| Empty (no districts configured) | `{ "districts": [] }`; the chip renders with only the "All Districts" option |
| Partial | Not applicable: no time span exists to be partial over |
| Not-yet-existing entity | Not applicable: the call takes no entity id |
| Permission denied | Same behaviour as the other two APIs; the single answer is [TO CONFIRM] (Oisin Curran), see Auth and scoping |
| Upstream unavailable | Standard 5xx; the client shows its error state and does not render a partial widget |

## API 2: Pension summary

### Endpoint

```
GET /api/dashboard/pension-plans/summary?districtId={guid}
```

The single dataset behind the table, pie, By district view, KPI headline and every total. Replaces the widget's use of the existing grid endpoint (see Old vs. new).

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `districtId` | guid | no | any `districtId` from API 1 | omitted (= All Districts) | Scopes every amount, count and cell to one district. Omitting the parameter applies no district WHERE at all, so null-district rows are included [CODE, Pending Questions - Codebase Findings] |

### Example requests

```
GET /api/dashboard/pension-plans/summary
GET /api/dashboard/pension-plans/summary?districtId=3b8f2d6c-9a1e-4f7b-8d2c-5e9a3c7f1b42
```

No URL encoding is needed: the only parameter is a guid.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `plans[]` | array | DERIVED container; provenance sits on its nested fields | One entry per plan with at least one active appointment in scope; plans with none are omitted, never zero-filled |
| `plans[].planId` | guid | STORED PB_AppointmentPlan.PlanID [CODE, Widget_Comparison_Classic.html] | Grouping key and the drill key for API 3 |
| `plans[].name` | string | STORED PB_AppointmentPlan Name [CODE, Widget_Comparison_Classic.html] | Org-configured display name (e.g. CRSP-DC, CPP); data, not an enum |
| `plans[].amount` | number | DERIVED SUM(PB_AppointmentPlan.AnnualPlanAmount) over active appointments in scope [CODE, Widget_Comparison_Classic.html] | Annual contribution for the plan; plain decimal, no currency formatting |
| `plans[].appointeeCount` | int | NEW: COUNT(*) over the exact same rows summed into `amount` [BUILD requires it; no endpoint returns counts today per Widget_Comparison_Classic.html] | Plan-assignment rows, not distinct persons |
| `plans[].districts[]` | array | DERIVED container; provenance sits on its nested fields | The plan's per-district cells; only districts where this plan has active appointments appear. Scoped calls return the one matching cell |
| `plans[].districts[].districtId` | guid | STORED PB_Appointment.DistrictID [CODE, Widget_Comparison_Classic.html] | Resolved to a name via API 1 |
| `plans[].districts[].amount` | number | DERIVED: the same SUM additionally grouped by district [DOC, Step 1 research doc formulas; the shape is NEW] | Cell amount for the By district view |
| `plans[].districts[].appointeeCount` | int | NEW: the same COUNT additionally grouped by district | Cell count, surfaced as text on each bar |

### Example response

All-districts call. Figures are the built Final's demo dataset, shaped like production; the shapes and the reconciliation are the contract, not the amounts. [BUILD]

```json
{
  "plans": [
    { "planId": "a1f3c5e7-2b4d-4f6a-8c9e-0d1f2a3b4c5d", "name": "Employee Before Tax-UMPIP", "amount": 24000.00, "appointeeCount": 3,
      "districts": [
        { "districtId": "7d9e4c1a-2b5f-4e8a-9c3d-1f6b8a2e4d70", "amount": 12000.00, "appointeeCount": 1 },
        { "districtId": "3b8f2d6c-9a1e-4f7b-8d2c-5e9a3c7f1b42", "amount": 6000.00, "appointeeCount": 1 },
        { "districtId": "9c4a7e2f-1d6b-4a9e-b3f8-2c5d7e9a4f16", "amount": 6000.00, "appointeeCount": 1 }
      ] },
    { "planId": "b2e4d6f8-3c5a-4a7b-9d0e-1f2a3b4c5d6e", "name": "CRSP-DB-%", "amount": 7532.56, "appointeeCount": 2,
      "districts": [
        { "districtId": "7d9e4c1a-2b5f-4e8a-9c3d-1f6b8a2e4d70", "amount": 4532.56, "appointeeCount": 1 },
        { "districtId": "9c4a7e2f-1d6b-4a9e-b3f8-2c5d7e9a4f16", "amount": 3000.00, "appointeeCount": 1 }
      ] },
    { "planId": "c3d5e7f9-4b6a-4b8c-a0e1-2f3a4b5c6d7e", "name": "CRSP-DC", "amount": 7037.31, "appointeeCount": 2,
      "districts": [
        { "districtId": "3b8f2d6c-9a1e-4f7b-8d2c-5e9a3c7f1b42", "amount": 3518.66, "appointeeCount": 1 },
        { "districtId": "9c4a7e2f-1d6b-4a9e-b3f8-2c5d7e9a4f16", "amount": 3518.65, "appointeeCount": 1 }
      ] },
    { "planId": "d4c6f8a0-5e7b-4c9d-b1f2-3a4b5c6d7e8f", "name": "CPP", "amount": 6682.56, "appointeeCount": 2,
      "districts": [
        { "districtId": "7d9e4c1a-2b5f-4e8a-9c3d-1f6b8a2e4d70", "amount": 3341.28, "appointeeCount": 1 },
        { "districtId": "3b8f2d6c-9a1e-4f7b-8d2c-5e9a3c7f1b42", "amount": 3341.28, "appointeeCount": 1 }
      ] },
    { "planId": "e5b7a9c1-6f8d-4dea-82e3-4b5c6d7e8f90", "name": "Flat CRSP-DB", "amount": 3000.00, "appointeeCount": 1,
      "districts": [
        { "districtId": "7d9e4c1a-2b5f-4e8a-9c3d-1f6b8a2e4d70", "amount": 3000.00, "appointeeCount": 1 }
      ] }
  ]
}
```

Reconciliation: plan amounts 24000.00 + 7532.56 + 7037.31 + 6682.56 + 3000.00 = 48252.43, which is the client's headline total; appointee counts 3 + 2 + 2 + 2 + 1 = 10, the badge figure; each plan's cells sum to its own row (CRSP-DC: 3518.66 + 3518.65 = 7037.31, the deliberate cent split); the By district group totals 22873.84 + 12859.94 + 12518.65 = 48252.43 reconcile to the same headline; and API 3's UMPIP example below sums to this response's UMPIP row.

District-scoped call (`districtId` = District 2):

```json
{
  "plans": [
    { "planId": "a1f3c5e7-2b4d-4f6a-8c9e-0d1f2a3b4c5d", "name": "Employee Before Tax-UMPIP", "amount": 6000.00, "appointeeCount": 1,
      "districts": [ { "districtId": "3b8f2d6c-9a1e-4f7b-8d2c-5e9a3c7f1b42", "amount": 6000.00, "appointeeCount": 1 } ] },
    { "planId": "c3d5e7f9-4b6a-4b8c-a0e1-2f3a4b5c6d7e", "name": "CRSP-DC", "amount": 3518.66, "appointeeCount": 1,
      "districts": [ { "districtId": "3b8f2d6c-9a1e-4f7b-8d2c-5e9a3c7f1b42", "amount": 3518.66, "appointeeCount": 1 } ] },
    { "planId": "d4c6f8a0-5e7b-4c9d-b1f2-3a4b5c6d7e8f", "name": "CPP", "amount": 3341.28, "appointeeCount": 1,
      "districts": [ { "districtId": "3b8f2d6c-9a1e-4f7b-8d2c-5e9a3c7f1b42", "amount": 3341.28, "appointeeCount": 1 } ] }
  ]
}
```

Reconciliation: 6000.00 + 3518.66 + 3341.28 = 12859.94, the District 2 group total in the all-districts example; counts 1 + 1 + 1 = 3.

### State contracts

| State | Response |
|---|---|
| Empty (no active appointments in scope) | `{ "plans": [] }`, HTTP 200; the client renders "No active pension appointments" (with the compact Glance variant). Never an error |
| Partial | Not applicable: no time span exists to be partial over; a scope is either matched or empty |
| Not-yet-existing entity | An unknown or deleted `districtId` matches no rows and returns `{ "plans": [] }`; the client refetches API 1 and resets to All Districts |
| Permission denied | [TO CONFIRM] (Oisin Curran): explicit 403 recommended over an empty 200 that reads as "no pension data"; see Auth and scoping |
| Upstream unavailable | Standard 5xx; the client shows its error state, never a partial or stale render |

## API 3: Appointee detail

### Endpoint

```
GET /api/dashboard/pension-plans/{planId}/details?districtId={guid}
```

The existing details endpoint, shape unchanged. [CODE, Widget_Comparison_Classic.html]

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `planId` | guid | yes (path) | any `planId` from an API 2 response | none | The plan being drilled |
| `districtId` | guid | no | any `districtId` from API 1 | omitted (= all districts) | The widget's active filter carries in here; a By district bar sends its own district instead |

### Example requests

```
GET /api/dashboard/pension-plans/a1f3c5e7-2b4d-4f6a-8c9e-0d1f2a3b4c5d/details
GET /api/dashboard/pension-plans/a1f3c5e7-2b4d-4f6a-8c9e-0d1f2a3b4c5d/details?districtId=7d9e4c1a-2b5f-4e8a-9c3d-1f6b8a2e4d70
```

### Response schema

The existing `List<PensionPlanDetailDto>`, property names as they exist in the modern codebase. [CODE, Widget_Comparison_Classic.html]

| Field | Type | Provenance | Description |
|---|---|---|---|
| `AppointmentPlanId` | guid | STORED PB_AppointmentPlan.AppointmentPlanID [CODE] | The row's stable key; used for list keying, not displayed |
| `Appointee` | string | STORED via the appointment's person record [CODE] | The appointee's display name |
| `Charge` | string | STORED via PBCharge CorePerson name [CODE]; returns an empty string today, a pre-existing defect | The church/organisation column; the client treats `""` as not available until the defect is fixed |
| `AnnualAmount` | number | STORED PB_AppointmentPlan.AnnualPlanAmount [CODE] | The appointment's annual contribution |
| `DistrictId` | guid | STORED PB_Appointment.DistrictID [CODE] | Resolved to a display name client-side via API 1 |

### Example response

UMPIP, all districts. `Charge` is shown as it actually returns today. [CODE, Widget_Comparison_Classic.html]

```json
[
  { "AppointmentPlanId": "f6a8b0c2-7e9d-4eab-93f4-5c6d7e8f9a01", "Appointee": "Rev. Jonathan Pierce", "Charge": "", "AnnualAmount": 12000.00, "DistrictId": "7d9e4c1a-2b5f-4e8a-9c3d-1f6b8a2e4d70" },
  { "AppointmentPlanId": "a7b9c1d3-8f0e-4fbc-a4f5-6d7e8f9a0b12", "Appointee": "Rev. Naomi Adler", "Charge": "", "AnnualAmount": 6000.00, "DistrictId": "3b8f2d6c-9a1e-4f7b-8d2c-5e9a3c7f1b42" },
  { "AppointmentPlanId": "b8c0d2e4-9a1f-4acd-b5f6-7e8f9a0b1c23", "Appointee": "Rev. Caleb Monroe", "Charge": "", "AnnualAmount": 6000.00, "DistrictId": "9c4a7e2f-1d6b-4a9e-b3f8-2c5d7e9a4f16" }
]
```

Reconciliation: the client footer sums 12000.00 + 6000.00 + 6000.00 = 24000.00 across 3 rows, matching API 2's UMPIP row (`amount` 24000.00, `appointeeCount` 3).

### State contracts

| State | Response |
|---|---|
| Empty (valid plan, no active appointees in the requested scope) | `[]`, HTTP 200; the modal renders its "No appointees on this plan" message. Never an error |
| Partial | Not applicable: no time span exists to be partial over |
| Not-yet-existing entity (unknown `planId`) | `[]`, matching today's behaviour; the client only ever sends ids taken from API 2 responses, so this arises only from a stale drill |
| Permission denied | [TO CONFIRM] (Oisin Curran), same single answer as the other APIs; see Auth and scoping |
| Upstream unavailable | Standard 5xx; the modal shows an error state rather than an empty roster |

## Auth and scoping

- **Company / tenant scoping:** every call carries the `X-Company-ID` context header, and every query is scoped by it. [CODE, Widget_Comparison_Classic.html]
- **Permission right:** the gate is the `/PensionBilling` **Inquiry** right, not a right named after the modern module field `PensionBenefits`. In the legacy product the widget is omitted from the picker and its body is hidden for an unentitled user. [CODE, Pending Questions - Codebase Findings, DataPanelControl.cs lines 154-165 and 185-192]
- **Unentitled behaviour in the modern API:** [TO CONFIRM] (Oisin Curran, product decision). Recommendation carried in Still needs sign-off: an explicit 403 on all three APIs, so an entitlement problem never renders as "no pension data".
- **Writes:** there are none; the whole contract is read-only, so no separate write right exists.

## Edge cases

1. **Org with no active appointments:** API 2 returns `{ "plans": [] }`; the empty state renders. Not an error.
2. **District with no active appointments:** the scoped API 2 call returns `{ "plans": [] }`; same empty state, scoped caption.
3. **Plan active in only some districts:** the plan row's `districts[]` simply lacks the other cells; the client renders missing cells as absent bars, and zero-filled cells are never sent.
4. **Boundary dates:** an appointment starting today or ending today is ACTIVE; both comparisons in the predicate are inclusive. [CODE, Widget_Comparison_Classic.html]
5. **Null `DistrictID` on an appointment:** included under All Districts (no WHERE applied), excluded by every specific district. Such a row is drillable only at the All Districts scope, where its drill row's `DistrictId` resolves to no API 1 entry and displays as blank. Existence in production data is [TO CONFIRM] (Oisin Curran).
6. **Duplicate plan display names:** rows are keyed by `planId`; two plans sharing a display name stay separate rows in every view, and the client must never merge by `name`.
7. **Appointee on two plans:** counts are plan-assignment rows, so the person appears once per plan and the badge total counts them twice. Matches the built Final's counting; the distinct-person question is in Still needs sign-off.
8. **Cent splits:** amounts are exact decimals end to end (money types, never floats), and client sums must be decimal-safe (3,518.66 + 3,518.65 = 7,037.31).
9. **Unknown or stale `districtId` / `planId`:** empty result, never an error; the client refetches API 1 and drops a stale district selection.
10. **Drill straddling a write:** API 3 re-evaluates the predicate at its own request moment, so its rows can differ from the summary by an appointment changed in between; accepted for a snapshot widget, stated in Call sequence.
11. **`Charge` empty string:** until the pre-existing PBCharge defect is fixed, `Charge` is `""` and the Church / organisation column renders as not available; no schema change is involved.

## Not in scope

- **The existing chart endpoint** (`/api/dashboard/pension-plans/chart`): this widget never calls it; every view renders from API 2. Whether it is retired product-wide is a backend housekeeping decision outside this contract.
- **The existing grid endpoint** as this widget's read: replaced by API 2 for this widget. Other consumers, if any, are unaffected by this contract.
- **No Time Window Module:** no `window`, `grain` or `asOf` parameters, no buckets, no partial flags. Stated as scope, not an omission: the widget is an as-of-now snapshot.
- **No plan-type categorisation:** no Defined Benefit / Defined Contribution / 403(b) field exists in either codebase; grouping is by org-configured plan, and a category dimension would be new schema, not a new query.
- **No billing/payment status:** connecting the obligation to whether it is billed and paid is a cross-widget idea from the dossier, not part of this contract.
- **Export file generation:** the exported row sets are defined by the API 2 and API 3 responses; whether files are generated client-side or by new server endpoints is undecided (Still needs sign-off).
- **The Pension Billing deep link:** confirmed needed, still has no target page; frontend navigation with nothing for this API.
- **Currency and locale formatting:** the API returns plain numbers; the live-audit pound-symbol-on-US-data defect is client localisation, listed so nobody specs a currency field to fix it.
- **No server-side totals, envelopes or timestamps:** totals are client sums by design; a response timestamp is an open dossier ask, not a granted field.

## Still needs sign-off

Sign-off dossier status: the widget's Step 6 dossier (Confluence page 7371030531) has no reconciliation file, so **every dossier finding is Unreviewed**; none has been Accepted, Rejected or Disputed. Per the sign-off rules this blocks final approval of the parts they touch. The items below name what is undecided, who decides, and what is blocked.

1. **Dossier statuses (Unreviewed):** the flags touching this contract are the "data as of" timestamp ask, the export-scope fix, the entitlement/empty behaviour question, and the billing/payment phase idea. Decider: Oisin Curran. Blocked: removing this spec's DRAFT status.
2. **Worst realistic volumes:** ceilings for districts per org, plans per org, and active appointments on the largest plan. Decider/source: Marvin (SME). Blocked: confirming the three BOUNDED verdicts; if the API 3 ceiling is materially above ~1,000 rows, API 3 must gain the full pagination contract before build.
3. **Unentitled behaviour:** explicit 403 (recommended) versus empty 200 versus hidden widget, one consistent answer across all three APIs. Decider: Oisin Curran with the dev team. Blocked: the Permission denied row of every State contract.
4. **Export generation:** client-side files from held JSON (zero backend) versus new server export endpoints. Decider: Oisin Curran with the dev team. Blocked: both export actions remain stubs.
5. **`Charge` defect fix:** populating the existing field (via the PBCharge CorePerson name) so the drill's Church / organisation column stops rendering blank. Decider: backend team scheduling. Blocked: nothing in this contract; the field is already in the shape.
6. **District preference persistence:** legacy saves the user's last district per user; the modern API has no equivalent. Decider: Oisin Curran. Blocked: nothing; client-managed state is the working assumption.
7. **Appointee count basis:** plan-assignment rows (as specced, matching the build) versus distinct persons. Decider: Oisin Curran. Blocked: nothing; the specced basis ships unless overruled.
8. **"Data as of" signal:** whether responses gain a server timestamp and the widget surfaces it beside Refresh. Decider: Oisin Curran. Blocked: nothing; the contract currently defines no timestamp field.
9. **Pension Billing deep-link target:** carried from the design doc's open item; needs a page/URL. Decider: Oisin Curran with product. Blocked: frontend navigation only; nothing in this API.
