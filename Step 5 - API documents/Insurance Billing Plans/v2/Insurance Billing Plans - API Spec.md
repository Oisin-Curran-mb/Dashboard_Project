# Insurance Billing Plans - API Spec

**Status: Done - awaiting sign-off (drafting complete, owner review pending)**

---

## Overview

The widget answers two questions for a benefits or HQ billing administrator: how many people are enrolled in each insurance plan (employees and their dependents together), and what that enrolment costs per plan and per insurance type. A single insurance-type filter narrows the whole widget; a grouped type-to-plan table and a proportional enrolment chart both read from the same data. The widget is read-only: nothing writes back.

This contract defines **two APIs**: a rarely-changing insurance-type lookup that feeds the filter control (the existing filters endpoint, reused unchanged), and one bounded data read that returns the full nested dataset (types, plans, enrolled counts, costs, subtotals and the grand total) on render and again on every filter change. The justification lives in the API inventory below.

There is no time axis. Enrolment is a live count computed at request time (`COUNT(IBEmployeePlan)` plus `COUNT(IBEmployeeDependent)` per plan), not a stored snapshot [CODE 2026-07-30], so this contract has no window, grain or asOf machinery. There is also no enrolment status: no active/inactive, pending, COBRA or approval field exists on plan enrolment anywhere in the real IB module [CODE 2026-07-30], so no status field or status filter appears here.

---

## Design → API coverage

Every element of the built Final, mapped to what feeds it.

| Design element | Type | API | Field(s) | Provenance |
|---|---|---|---|---|
| Glance KPI: total enrolled | KPI | API 2 | `total.enrolled` | DERIVED (sum of plan counts) [CODE] |
| Glance plan-count pill | KPI | API 2 | count of entries across `types[].plans[]` (client arithmetic) | DERIVED client [BUILD] |
| Glance caption ("employees and dependents", current type) | state text | none (static client copy plus the client's current filter value) | none | [BUILD] |
| Type parent row: insurance type name | table column | API 2 | `types[].typeName` | STORED `IBType.Name` [CODE] |
| Type parent row: plan-count tag | table column | API 2 | length of `types[].plans[]` (client arithmetic) | DERIVED client [BUILD] |
| Type parent row: Enrolled subtotal | table column | API 2 | `types[].enrolled` | DERIVED (sum of its plans) [CODE] |
| Type parent row: Cost subtotal | table column | API 2 | `types[].cost` | DERIVED (sum of its plans) / NEW |
| Plan child row: plan name | table column | API 2 | `plans[].planName` | STORED `IBPlan.Name` [CODE] |
| Plan child row: Enrolled | table column | API 2 | `plans[].enrolled` | DERIVED (live count) [CODE] |
| Plan child row: Cost | table column | API 2 | `plans[].cost` | NEW (see Tables) |
| Share of total column (type and plan rows) | table column | none (client derivation over API 2) | row `enrolled` divided by `total.enrolled` | DERIVED client [BUILD] |
| Zero-enrolment row marker | table state | API 2 | `plans[].enrolled` equal to 0 | DERIVED client [BUILD] |
| Footer total row: enrolled and cost | grand total | API 2 | `total.enrolled`, `total.cost` | DERIVED (sums) [CODE] |
| Insurance type filter chip and its option list | filter | API 1 | `typeId`, `name` | STORED `IBType` [CODE] |
| Table / Pie segment control | view toggle | none (client view state only) | none | [BUILD] |
| Initial view, sort and expansion state | client state | none (no server default) | Table view, enrolled descending, all type groups collapsed | [BUILD] |
| Chart segments (one per plan with at least one enrolment) | chart series | API 2 | `plans[].planName`, `plans[].enrolled` (client keeps rows with `enrolled` above 0) | DERIVED client [BUILD] |
| Chart centre figure (charted total) | chart | API 2 | client sum of charted `plans[].enrolled` | DERIVED client [BUILD] |
| Chart legend rows (plan, count, percent) | chart | API 2 | `plans[].planName`, `plans[].enrolled`, client percent | DERIVED client [BUILD] |
| Uncharted-plans note | state | API 2 | client count of `plans[].enrolled` equal to 0 | DERIVED client [BUILD] |
| Chart-empty state (no plan chartable for the filter) | state | API 2 | absence of any `plans[].enrolled` above 0 | DERIVED client [BUILD] |
| Expand / collapse of a type group | interaction | none (client state over API 2 rows) | keyed by `types[].typeId` | [BUILD] |
| Column sort (plan name ascending, enrolled descending, either direction on click) | interaction | none (client re-order of API 2 rows) | none | [BUILD] |
| Row identity keys | plumbing | API 2 | `plans[].planId`, `types[].typeId` | STORED `IBPlan.PlanID`, `IBType.TypeID` [CODE] |
| Empty state ("No insurance plans yet") | state | API 2 | empty `types[]` with zero `total` | [BUILD] |
| Loading skeleton | state | none (client, while API 2 is in flight) | none | [BUILD] |
| Refresh control | action | API 1 + API 2 refired | none | [BUILD] |

Nothing on screen is unfunded; every response field below appears in at least one row above.

---

## Tables

| Table / repository | Fields and members used |
|---|---|
| `IBType` | `TypeID`, `Name`, `Active`: the insurance-type categories. Source of the filter option list (API 1) and of each `types[]` entry (API 2); `Active` filtered |
| `IBPlan` | `PlanID`, `Name`, `TypeID`, `Active`: the plan rows; `TypeID` is the existing link that places each plan under its type; `Active` filtered |
| `IBEmployeePlan` | `PlanID`, `Rate`, `RateIndividual`, `PreTax`, `EmployerBilled`, `TypeElectionID`, `UseNonStandardRate`: employee enrolment rows, counted into `enrolled` and summed into `cost` |
| `IBEmployeeDependent` | `PlanID`: dependent enrolment rows, counted into `enrolled` |
| `IBPlanRate` | `PlanID`, `TypeElectionID`, `Rate`, `RateIndividual`, `Starting`: the standard rate by plan plus coverage tier, used for an enrolment's rate when it does not carry a non-standard rate |
| `IBTypeElection` | Coverage tier (Employee / Family / Waived and so on). Part of the real hierarchy and of the rate lookup, but not surfaced by this contract |

No new tables and no schema changes are needed: the contract is new queries against existing tables. `enrolled` is the existing live read; `cost` is a new SUM over columns that already exist.

Core formulas, quotable in isolation:

- **Enrolled per plan** = `COUNT(IBEmployeePlan WHERE PlanID = plan) + COUNT(IBEmployeeDependent WHERE PlanID = plan)`, a live count computed at request time. [CODE 2026-07-30]
- **Cost per plan** is the total premium: the SUM, over the plan's enrolments, of the enrolment rate, where the rate is `IBEmployeePlan.Rate` when `UseNonStandardRate` is set on that enrolment, and otherwise the standard `IBPlanRate.Rate` for the plan plus the enrolment's coverage tier (`TypeElectionID`). The employer share (`Rate` minus `RateIndividual`) and the employee share (`RateIndividual`) are derivable from the same rows if product wants a split later; `EmployerBilled` and `PreTax` are flags on the row. [CODE - `IBEmployeeRepository`, `IBPlanRate`] Whether dependent enrolment rows contribute rate rows to this SUM is under sign-off (see Still needs sign-off item 2).
- **Type subtotal** = SUM of its plans' `enrolled` / `cost`; **grand total** = SUM of the type subtotals. Both server-computed in API 2.

Filters applied to every read: company scoping on every query (see Auth and scoping); `IBType.Active` and `IBPlan.Active` filter types and plans out of both responses. [CODE 2026-07-30]

---

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Enrolled per plan | Legacy `InsuranceBillingPlans : DataPanelControl` (`/InsuranceBilling`) and the modern `GET /api/dashboard/insurance-billing-plans/grid` both return `NumberEnrolled` per plan: `COUNT(IB_EmployeePlan)` plus `COUNT(IB_EmployeeDependent)`, a live count [DOC - Widget_Comparison_Classic] | Same figure, unchanged: `enrolled` in API 2. Re-shaped read, not new data (DERIVED) |
| Cost per plan | Not returned anywhere today | `cost` (NEW): per-plan SUM of the enrolment rate (see Tables). The one genuinely new backend field in this contract |
| Type-to-plan grouping and subtotals | The modern grid returns flat rows `{PlanId, Name, TypeName, NumberEnrolled}`; no subtotals, no grand total on the wire | API 2 returns one nested structure: `types[]` each carrying subtotals and its `plans[]`, plus the grand `total` (DERIVED, server-assembled) |
| Type filter list | `GET /api/dashboard/insurance-billing-plans/filters` returns the type list from `IB_Type WHERE CompanyID = ctx` with an "All Types" (`Guid.Empty`) entry prepended [DOC - Widget_Comparison_Classic] | Reused unchanged (API 1). The client maps the `Guid.Empty` entry to omitting `typeId` on API 2 |
| Chart data | `GET /api/dashboard/insurance-billing-plans/chart` returns `{Name, NumberEnrolled}` per plan | Not called. The chart renders client-side from the same API 2 rows the table uses, so table and chart can never disagree |
| Status / pending / COBRA | None in the real module | Still none. No status field exists on enrolment; none is added |
| Drill / mutation | No drill-down; read-only | Unchanged: read-only, no drill, no write |

---

## API inventory

| API | Purpose | Trigger (when it fires) | Cardinality | R/W | Cache posture | Split trigger |
|---|---|---|---|---|---|---|
| API 1: type filter lookup | Options for the insurance-type filter chip | Widget render; refresh | One row per active insurance type (single digits typical) | R | Cacheable, rarely changes (TTL acceptable) | Lifetime gap: a rarely-changing lookup vs a live count. Also pre-existing: this endpoint already exists and is reused unchanged |
| API 2: plans data read | The full widget dataset: nested types and plans with enrolled, cost, subtotals and grand total | Widget render; every type-filter change; refresh | One row per active plan of the company (single digits typical) | R | LIVE per request (enrolment is a live count) | Lifetime gap from API 1; this is the only data read |

Merging API 1 into API 2 was considered and rejected: a filtered API 2 response (one type) cannot carry the full option list the chip must always show, and the lookup's cache lifetime differs from a live count. Splitting API 2 further (summary vs rows, or table vs chart) was considered and rejected: the whole dataset is one bounded response, the chart consumes the same rows as the table, and a split would force two calls that must reconcile with no gain.

There is no shared `asOf` anchor and none is needed: the two calls carry no figures that must reconcile with each other (the option list is names, the data read is counts), and drift between them is acceptable and self-healing (see Edge cases 10).

---

## Call sequence

| Interaction | Calls fired | Notes |
|---|---|---|
| Initial widget load | API 1 + API 2 (in parallel) | API 2 with `typeId` omitted (all types), or with a restored selection if the platform restores one |
| Change filter: insurance type | API 2 only, with `typeId` (or omitted for the all-types entry) | One round trip; the option list does not refetch |
| Switch view (Table / Pie segment) | none | Instant client re-render over data already held |
| Expand / collapse a type group | none | Client state over API 2 rows |
| Sort a column | none | Client re-order of API 2 rows |
| Open drill / expand row detail | none | No drill exists in this design |
| Submit action | none | Read-only widget; there is no write |
| Refresh | API 1 + API 2 | Both refired with the current `typeId` |

Every API in the inventory appears above. No two calls must reconcile numerically on screen, so no shared asOf anchor is defined.

---

## Filter architecture

| Filter | Option source | Cardinality | Execution | Aggregate effect | Cascade | "All" wire form | Round trips |
|---|---|---|---|---|---|---|---|
| Insurance type | LOOKUP: API 1 (existing filters endpoint over `IBType`) | 4 types in the demo dataset [BUILD] and 4 live-verified on beta1 [DOC - dossier]; worst realistic count [TO CONFIRM - Marvin] | SERVER: `typeId` param on API 2; every filter change re-queries | Yes: `types[]`, every subtotal and the grand `total` are recomputed server-side for the filtered population | None (single filter) | Omit `typeId`. The option list's `Guid.Empty` "All Types" entry is a sentinel the client maps to omission | 1 (API 2 only) |

- **Why server-side:** Framework 1 condition 2 fails for a client-side verdict. The set the filter operates on (all plans of the company) is bounded only by org configuration, and no maximum has a citable basis yet, so the filter is a server param and the server recomputes every aggregate per call. This also keeps condition 3 trivially satisfied: rows and totals in one response always describe the same population.
- **Combination semantics:** there is exactly one filter; nothing combines.
- **Conflict rule:** a `typeId` that is unknown, inactive, or belongs to another company returns the well-formed zero response (empty `types[]`, zero `total`), never an error. With a single optional param no precedence question arises.
- **Blank handling:** every plan reaches the response through its `IBPlan.TypeID` link; omitting `typeId` includes every active type's plans. Whether orphaned plans (a `TypeID` that resolves to no active type) exist in production is [TO CONFIRM - Oisin Curran] (see Edge cases 9); a blank link must not behave as a wildcard.
- **Cascade invalidation:** not applicable; there is no dependent filter.
- **Empty result:** a legitimate filter value with no enrolments is a normal response with zero counts, not an error (see State contracts).

---

## Volume and performance

| Dataset | Typical rows | Worst realistic rows (basis) | Row width | Payload at worst | Verdict | Server cost model | Cache posture |
|---|---|---|---|---|---|---|---|
| API 1 option list | 4 types [BUILD demo; live beta1 capture in the dossier] | [TO CONFIRM - Marvin] | 2 fields, ~60 bytes | A few KB at any plausible ceiling | BOUNDED | Single indexed scan of `IBType` by company | Rarely changes; TTL acceptable; refetched on render and refresh |
| API 2 nested dataset | 5 plans across 4 types [BUILD demo] | [TO CONFIRM - Marvin] | ~5 fields, ~120 bytes per plan row plus ~4 per type wrapper | Tens of KB at any plausible ceiling | BOUNDED | One grouped aggregate pass: COUNT over `IBEmployeePlan` and `IBEmployeeDependent` grouped by `PlanID`, plus one SUM of the per-enrolment rate with the `IBPlanRate` fallback join. The multiplier is the company's enrolment row count, scanned once per request, never per-plan subqueries. Worst realistic enrolment row count [TO CONFIRM - Marvin] | LIVE per request: enrolment is a live count [CODE], so no precompute and no snapshot staleness |

The BOUNDED verdicts rest on the plan catalogue being org configuration (an organisation offers a fixed handful of plans), not on the demo dataset's size; the demo figures are typical-case only. The [TO CONFIRM] ceilings condition the verdicts: if Marvin's numbers come back large, API 2's verdict must be revisited before build.

The client-side sort, grouping, chart derivation and Share arithmetic are all views over one complete response the client holds in full, change no server-computed aggregate, and are legitimate for a BOUNDED set.

### Pagination contract

Nothing paginates: both responses are bounded and returned whole, so there are no page, pageSize, sortBy or totalCount params anywhere in this contract.

---

## Where computation lives

| Value | Server or client | Basis | Why |
|---|---|---|---|
| `enrolled` per plan | SERVER | COUNT + COUNT live at request time [CODE] | Spans enrolment rows the client never receives |
| `cost` per plan | SERVER | SUM of per-enrolment rate with standard-rate fallback [CODE] | Spans enrolment and rate rows the client never receives |
| Type subtotals (`types[].enrolled`, `types[].cost`) | SERVER | Sum of the type's plans | One authoritative computation; rows and subtotals always describe the same population |
| Grand `total.enrolled`, `total.cost` | SERVER | Sum of the subtotals | Same as above; the footer and Glance KPI read it directly |
| Share of total percent (type and plan rows) | CLIENT | row `enrolled` divided by `total.enrolled` from the same response, rounded to a whole percent | Pure arithmetic over two values already present. Division-by-zero rule: when `total.enrolled` is zero the client renders 0%, never null or an error |
| Chart segment fractions and legend percents | CLIENT | row `enrolled` divided by the charted total (sum of rows with `enrolled` above 0) | Pure arithmetic over the same response; the charted total equals the table's total whenever no zero-enrolment plan exists, and the note explains the difference when one does |
| Zero-enrolment exclusion from the chart, and the uncharted-plans note count | CLIENT | count of rows with `enrolled` equal to 0 | Presentation rule over data in hand |
| Plan-count figures (Glance pill, per-type tag) | CLIENT | array lengths | Counting rows already held |
| Sort order (plan name or enrolled, either direction; zero-enrolment rows always last) | CLIENT | re-order of the full response | The full set is in hand; sort changes no aggregate |
| Type group ordering (by subtotal, descending) | CLIENT | `types[].enrolled` | Same |
| Empty / loading / chart-empty states | CLIENT | response shape | Presentation |

No server-computed percentage exists in this contract, so the only division-by-zero rule is the client Share rule above (zero denominator renders 0%). There are no deltas and no comparison baselines. No presentation threshold exists in this design (enrolment counts are neutral; there is no banding).

---

## API 1: Insurance-type filter lookup

### Endpoint

```
GET /api/dashboard/insurance-billing-plans/filters
```

This endpoint exists today [DOC - Widget_Comparison_Classic] and is reused unchanged. It returns the company's insurance types with an "All Types" (`Guid.Empty`) entry prepended by the server.

### Parameters

None beyond the company context header (see Auth and scoping). There is nothing to filter a filter list by.

### Example requests

```
GET /api/dashboard/insurance-billing-plans/filters
```

One form only; the endpoint takes no query parameters, so no second variant exists. Nothing needs URL encoding.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `typeId` | guid | STORED `IBType.TypeID` [CODE] | The type's id; `Guid.Empty` marks the server-prepended "All Types" sentinel entry |
| `name` | string | STORED `IBType.Name` [CODE] | The type's display name, org-configured |

The response is a JSON array of these entries, active types only, ordered by name, sentinel first. The exact wire property names of the existing `DropDownItem` DTO are UNVERIFIED (Oisin Curran); the logical fields above are the contract.

### Example response

```json
[
  { "typeId": "00000000-0000-0000-0000-000000000000", "name": "All Types" },
  { "typeId": "3b2d5f70-9c1e-4a3b-8d7f-2e4c6b8d0f21", "name": "Dental" },
  { "typeId": "2a1c4e6f-8b0d-4f2a-9c6e-1d3b5a7c9e10", "name": "Medical" },
  { "typeId": "5d4f7192-1e30-4c5d-af91-4a6e8d0f2143", "name": "Property" },
  { "typeId": "4c3e6081-0d2f-4b4c-9e80-3f5d7c9e1032", "name": "Vision" }
]
```

Reconciliation: the four real entries carry the same `typeId` values as the four `types[]` entries in the API 2 example below, and the sentinel entry maps to omitting `typeId` there; no figure in this response sums to anything.

### State contracts

| State | Response |
|---|---|
| Empty (org has no active types) | `[ { "typeId": "00000000-0000-0000-0000-000000000000", "name": "All Types" } ]`, the sentinel alone; the client still renders the chip |
| Partial | Not applicable: there is no requested span to be partial over |
| Not-yet-existing entity | Not applicable: the call takes no entity id |
| Permission denied | HTTP 403; the widget is not shown to unentitled users (see Auth and scoping), so the client never renders a denied body. Response body shape [TO CONFIRM - Oisin Curran] |
| Upstream unavailable | HTTP 5xx; client error presentation is not yet designed [TO CONFIRM - Product] |

---

## API 2: Plans data read

### Endpoint

```
GET /api/dashboard/insurance-billing-plans/data
```

One bounded read returning the full nested dataset for the current filter: a grand `total`, then `types[]`, each type carrying its name, its subtotals, and its `plans[]`.

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `typeId` | guid | No | Any active `IBType.TypeID` of the company | Omitted (all types) | Narrows the response to one insurance type; every subtotal and the grand `total` are recomputed for the filtered population. Unknown, inactive or foreign values return the zero response, not an error |

The company context header applies to every call (see Auth and scoping).

### Example requests

```
GET /api/dashboard/insurance-billing-plans/data
GET /api/dashboard/insurance-billing-plans/data?typeId=2a1c4e6f-8b0d-4f2a-9c6e-1d3b5a7c9e10   (Medical only)
```

A guid needs no URL encoding; nothing else appears on the query string.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `total` | object | DERIVED (sum of the `types[]` subtotals) [CODE basis] | Grand total for the filtered population: `{ enrolled, cost }` |
| `total.enrolled` | int | DERIVED: sum of `types[].enrolled` [CODE] | Grand-total enrolment; the Share denominator and the Glance KPI |
| `total.cost` | number | NEW: sum of `types[].cost` | Grand-total cost; plain decimal, no currency formatting |
| `types[]` | array | STORED `IBType` rows (Active, company-scoped) [CODE] | One entry per active insurance type in scope; empty when nothing is in scope |
| `types[].typeId` | guid | STORED `IBType.TypeID` [CODE] | The type's id; expand-state and row key |
| `types[].typeName` | string | STORED `IBType.Name` [CODE] | The type's display name |
| `types[].enrolled` | int | DERIVED: sum of its plans' `enrolled` [CODE] | The type's subtotal enrolment |
| `types[].cost` | number | NEW: sum of its plans' `cost` | The type's subtotal cost |
| `types[].plans[]` | array | STORED `IBPlan` rows (Active) [CODE] | The plans under this type; empty array when the type has no active plans |
| `plans[].planId` | guid | STORED `IBPlan.PlanID` [CODE] | The plan's id; the row key |
| `plans[].planName` | string | STORED `IBPlan.Name` [CODE] | The plan's display name, org-configured, not an enum |
| `plans[].enrolled` | int | DERIVED: `COUNT(IBEmployeePlan) + COUNT(IBEmployeeDependent)` for the plan [CODE] | The existing live count, employees plus dependents |
| `plans[].cost` | number | NEW: SUM of the per-enrolment rate (see Tables) [CODE for derivability] | The one new backend field. Plain decimal, no currency formatting. The dependent-row question in Still needs sign-off item 2 conditions the final SUM |

### Example response

Mock figures shaped like the built Final's demo dataset [BUILD]; the shapes and the reconciliation are the contract, not the amounts.

```json
{
  "total": { "enrolled": 349, "cost": 95367 },
  "types": [
    {
      "typeId": "2a1c4e6f-8b0d-4f2a-9c6e-1d3b5a7c9e10",
      "typeName": "Medical",
      "enrolled": 182,
      "cost": 91080,
      "plans": [
        { "planId": "a1000000-0000-4000-8000-000000000001", "planName": "Medical Base",   "enrolled": 128, "cost": 57600 },
        { "planId": "a1000000-0000-4000-8000-000000000002", "planName": "Medical Buy Up", "enrolled": 54,  "cost": 33480 }
      ]
    },
    {
      "typeId": "3b2d5f70-9c1e-4a3b-8d7f-2e4c6b8d0f21",
      "typeName": "Dental",
      "enrolled": 96,
      "cost": 3648,
      "plans": [
        { "planId": "a1000000-0000-4000-8000-000000000003", "planName": "Delta Dental", "enrolled": 96, "cost": 3648 }
      ]
    },
    {
      "typeId": "4c3e6081-0d2f-4b4c-9e80-3f5d7c9e1032",
      "typeName": "Vision",
      "enrolled": 71,
      "cost": 639,
      "plans": [
        { "planId": "a1000000-0000-4000-8000-000000000004", "planName": "Vision", "enrolled": 71, "cost": 639 }
      ]
    },
    {
      "typeId": "5d4f7192-1e30-4c5d-af91-4a6e8d0f2143",
      "typeName": "Property",
      "enrolled": 0,
      "cost": 0,
      "plans": [
        { "planId": "a1000000-0000-4000-8000-000000000005", "planName": "Building", "enrolled": 0, "cost": 0 }
      ]
    }
  ]
}
```

Reconciliation: plan enrolled 128 + 54 + 96 + 71 + 0 = 349 = `total.enrolled`; type enrolled subtotals 182 + 96 + 71 + 0 = 349; plan cost 57600 + 33480 + 3648 + 639 + 0 = 95367 = `total.cost`; type cost subtotals 91080 + 3648 + 639 + 0 = 95367; within Medical, 128 + 54 = 182 and 57600 + 33480 = 91080. The four `types[].typeId` values match the four real entries in the API 1 example. Client Share over this response: Medical 52%, Medical Base 37%, Medical Buy Up 15%, Delta Dental 28%, Vision 20%, Building 0% (each row's `enrolled` divided by 349).

### State contracts

| State | Response |
|---|---|
| Empty (org has no plans or enrolments) | `{ "total": { "enrolled": 0, "cost": 0 }, "types": [] }`; the client renders its empty state. Not an error |
| Empty for the filter (valid `typeId`, nothing enrolled) | The type's entry with its plans at zero, or an empty `types[]` if the type has no active plans; `total` zero. Not an error |
| Partial | Not applicable: there is no requested span to be partial over; enrolment is a point-in-time live count |
| Not-yet-existing entity (unknown / inactive / foreign `typeId`) | The zero response: `{ "total": { "enrolled": 0, "cost": 0 }, "types": [] }`. Not an error |
| Permission denied | HTTP 403; the widget is not shown to unentitled users, so the client never renders a denied body. Response body shape [TO CONFIRM - Oisin Curran] |
| Upstream unavailable | HTTP 5xx; client error presentation is not yet designed [TO CONFIRM - Product] |

---

## Auth and scoping

- **Company / tenant scoping:** both endpoints take the `X-Company-ID` context header [DOC - Widget_Comparison_Classic], and every query is scoped by it: types, plans, enrolments and rates are all read for that company only.
- **Permission right to read:** the legacy widget is gated on the Inquiry right for its access URI `/InsuranceBilling`, enforced by the shared dashboard-control gate, which hides the widget body and omits the widget from the picker for unentitled users [DOC - Widget_Comparison_Classic; Pending Questions - Codebase Findings 2026-07-30, `DataPanelControl.cs`]. The right protecting these two REST endpoints is UNVERIFIED (Oisin Curran).
- **Write right:** none needed; this contract has no write.
- **What a user without the right sees:** defaulted to the widget being hidden entirely, matching the legacy gate. Confirming that presentation for the new dashboard is a product decision [TO CONFIRM - Product] (Still needs sign-off item 5).

---

## Edge cases

1. **Zero-enrolment plan:** returned inside its type with `enrolled` 0 and `cost` 0, never omitted. The client lists it, keeps it out of the chart, and counts it into the uncharted-plans note. Its type still appears with a correct subtotal.
2. **Type with no active plans:** still returned in `types[]` with an empty `plans[]` and zero subtotals. Selecting it in the filter is legitimate and yields the near-empty response, not an error.
3. **Inactive type or plan:** filtered out of both responses by the `Active` flags; an inactive type's plans never appear under any filter value.
4. **Org with no insurance data at all:** API 1 returns the sentinel alone; API 2 returns the zero response; the client renders its empty state.
5. **Unknown, inactive or foreign-company `typeId`:** the zero response, never an error, and never another company's data (the company scope applies before the type match).
6. **Every plan under the filter has zero enrolment:** a normal response; the table lists zero rows, the chart has nothing chartable, and the chart-empty state is a client presentation over this data.
7. **Filtered totals:** `total` and every subtotal always describe the same filtered population as the rows in the same response, so Share and the footer always reconcile within one response by construction. How the client labels a filtered footer is a presentation concern outside this contract.
8. **Count basis vs cost basis:** `enrolled` counts employee and dependent rows; the rate columns behind `cost` sit on `IBEmployeePlan`. A plan's headcount and the row set behind its cost can therefore differ legitimately. Definitional remainder under Still needs sign-off item 2, not a bug.
9. **Orphaned plan (TypeID resolving to no active type):** whether such rows exist in production is [TO CONFIRM - Oisin Curran]. If they exist, the contract needs a stated home for them (an "Unassigned" wrapper or exclusion, decided then); they must not silently vanish from totals while appearing in a count elsewhere.
10. **Drift between the two calls:** a type created, renamed or deactivated between API 1 and API 2 can leave the option list and the dataset momentarily out of step. Selecting a type absent from the data yields the zero response, and the next render or refresh heals the list. No shared asOf anchor is needed because no figure must reconcile across the two calls.
11. **Concurrent enrolment changes:** two API 2 calls straddling an enrolment write can return different counts. That is the nature of a live count; within any single response the arithmetic is consistent.

---

## Not in scope

- **No write.** Read-only widget: no confirm, no move, no mutation of any kind.
- **No status / pending / COBRA / approval field or filter.** No such concept exists on plan enrolment in the real IB module [CODE 2026-07-30]; none is added. Recorded so nobody specs one to fill the gap.
- **No coverage-tier breakdown.** The real hierarchy has a third level (`IBTypeElection`); this contract stops at type-to-plan. Surfacing tiers is a possible future enhancement, not this contract.
- **No employee-vs-dependent split.** The design shows one bundled count. The split is derivable from the same two COUNTs with no schema work if the owner adopts the dossier's suggestion later; it would add fields, so it is a contract change, not a client tweak.
- **No participation rate.** No eligible-population denominator exists in the module; this would be NEW backend work and is not in the design.
- **No drill to enrollees and no individual names.** The widget never surfaces a person, matching the legacy behaviour and the locked design.
- **No export.** The design carries no export control.
- **The existing grid and chart endpoints** (`.../grid`, `.../chart`) are not part of this contract; nothing in this widget's design calls them. They remain live for anything else that uses them.
- **Last-selected-type persistence.** The legacy widget stores the last `TypeID` per widget and restores it on refresh (`IBDataPanelRecord.TypeID`) [DOC - Widget_Comparison_Classic]. Whether and where the new dashboard persists per-widget filter state is a platform concern, not a field in these responses [TO CONFIRM - Product].
- **No time window machinery.** No `window`, `grain` or `asOf` params: enrolment is a live count at request time.

---

## Still needs sign-off

1. **Sign-off dossier findings are all unstatused.** The widget's dossier exists but no reconciliation file assigns Accepted / Rejected / Disputed statuses. The flags that would touch this contract if accepted: employee-vs-dependent split, participation rate, a drill to enrollees (sibling parity with Pension Plans), and a data-as-of stamp. Who decides: the project owner statuses each finding. Blocked until then: nothing in the current contract; adopting any of them adds fields or endpoints.
2. **Dependent rows in `cost`.** Whether dependent enrolments contribute rate rows to the cost SUM. `cost` is the total premium (settled; see Tables), but `Rate` sits on `IBEmployeePlan` while `enrolled` includes `IBEmployeeDependent` rows, and the treatment of any dependent-carried premium needs the final word. Who decides: backend dev with the SME. Blocked until then: the final cost query (the field, its name and its meaning are stable either way).
3. **Explore default view.** Whether the chart becomes the default view at the mid tier has not been put to the owner; the table is the default in this contract's call-sequence assumptions. Who decides: the project owner. Blocked until then: nothing in the contract (pure client view state); recorded so the default is not flipped silently.
4. **Fetch posture.** This contract makes the type filter a server param with a re-query per change, because no plan-volume bound has a citable basis (Filter architecture). An owner instruction on record for the earlier contract chose a fetch-once shape with a client-side filter instead. Who decides: the project owner rules which posture stands. Blocked until then: nothing (the response shape is identical either way); a fetch-once ruling would remove the `typeId` param and make API 1 derivable from API 2's unfiltered response.
5. **Entitlement presentation and the modern permission right.** What an unentitled user sees in the new dashboard (defaulted here to hidden, matching legacy), and which right protects the two REST endpoints. Who decides: Product (presentation) and Oisin Curran (the right, from code). Blocked until then: the Auth section's final wording and the 403 state-contract rows.
6. **Volume ceilings.** Worst realistic counts for types, plans and enrolment rows at a large organisation. Who decides: Marvin. Blocked until then: the BOUNDED verdicts stand on org-configuration reasoning alone; large numbers would reopen them.
