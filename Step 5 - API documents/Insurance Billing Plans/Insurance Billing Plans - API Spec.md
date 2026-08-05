# Insurance Billing Plans — API Spec

**Status: DRAFT — not final**

## Overview

The widget is a snapshot of how many people are enrolled in each insurance plan, grouped by insurance type, filterable by a single insurance-type chip. It is read-only: nothing in this widget writes back. This spec is deliberately close to the existing insurance-billing read: the legacy widget already returned a per-plan enrolled count (employees plus dependents) for a pie and a table. The ONE genuinely new field in this contract is `cost` per plan. Everything else the widget shows is either that existing enrolled read or client-side arrangement of data the module already holds.

The Type to Plan grouping is not new data: `IBPlan.TypeID` already links every plan to its insurance type. In this contract the API returns a single nested structure in ONE call: all insurance types at once, each type carrying its own name, its subtotals, and its plans inside it. The type grouping and the type subtotals that the client used to assemble are now server-provided, and the response also carries the grand total. The client still computes only the Share column (enrolled divided by the grand-total enrolled). This is a deliberate owner-requested shape (one call, all information, returned already nested by insurance type) rather than the strict flat-and-client-group minimal pattern used elsewhere in the project. There is no separate types endpoint: the insurance-type list for the filter chip derives from the `types[]` array in this same response.

**There is no time axis.** Enrolment is a live count computed at request time (`COUNT(IBEmployeePlan)` plus `COUNT(IBEmployeeDependent)` for the plan), not a stored point-in-time snapshot. This spec therefore has none of the Time Window Module machinery: no `window`, no `grain`, no `asOf`. Do not copy those parameters over from the Budget Compared to Actual spec; they do not exist here.

**There is no enrolment status.** There is no active/inactive, pending, COBRA, or approval field on plan enrolment anywhere in the real IB module (confirmed in code, 2026-07-30). This is recorded here so nobody adds a status field or a status filter to this contract; the earlier project mock that showed a "pending: COBRA" flag was a design invention with no backing data.

## Tables

| Table | Fields used |
|---|---|
| `IBType` | `TypeID`, `Name`, `Active`: the insurance-type categories (Medical, Dental, Vision, Property). Source of the `types[]` entries (and the filter chip that derives from them) and the `typeName` on each type; `Active` filtered |
| `IBPlan` | `PlanID`, `Name`, `TypeID`, `Active`: the plan rows; `TypeID` is the existing link that places each plan under its type; `Active` filtered |
| `IBEmployeePlan` | `PlanID`, `Rate`, `RateIndividual`, `PreTax`, `EmployerBilled`, `TypeElectionID`, `UseNonStandardRate`: the employee plan-enrolment rows counted into `enrolled` and summed into `cost` |
| `IBEmployeeDependent` | `PlanID`: the dependent enrolment rows, counted into `enrolled` only |
| `IBPlanRate` | `PlanID`, `TypeElectionID`, `Rate`, `RateIndividual`, `Starting`: the standard rate by plan plus coverage tier, used for an enrolment's rate when it does not carry a non-standard rate |
| `IBTypeElection` | Coverage tier (Employee / Family / Waived etc.). Present in the real hierarchy but NOT surfaced by this contract; listed so its role in the rate lookup is clear |

No new tables and no new schema are needed. `enrolled` is the existing live count. `cost` is a new SUM over columns that already exist on `IBEmployeePlan` / `IBPlanRate`; it is a query addition, not stored data. The real module hierarchy is `IBType` (category) to `IBPlan` (via `TypeID`) to `IBTypeElection` (coverage tier); this contract uses the Type to Plan level only.

## Old vs. new

| | Old (live today) | New (this contract) |
|---|---|---|
| Enrolled per plan | Legacy `InsuranceBillingPlans : DataPanelControl` (`/InsuranceBilling`) returned `NumberEnrolled` per plan for a pie plus table: `COUNT(IB_EmployeePlan WHERE PlanID)` plus `COUNT(IB_EmployeeDependent WHERE PlanID)`, a live count | Same figure, unchanged: `enrolled` = `COUNT(IBEmployeePlan)` plus `COUNT(IBEmployeeDependent)` for the plan. This is the existing read |
| Cost per plan | Not returned | `cost` (number), the ONE new field: per-plan `SUM` of the enrolment Rate (see Cost derivation). This is the only genuinely new backend field in this spec |
| Type to Plan grouping | Legacy grouped/filtered by insurance type via the type dropdown; the pie and table were plan-level | Same data, now server-nested. The response is a single `types[]` structure with each type's `plans[]` inside it, so the Type to Plan grouping arrives already assembled rather than being built client-side |
| Type filter list | Legacy type dropdown from `IB_Type WHERE CompanyID = ctx ORDER BY Name`, "All Types" prepended | Same list, now derived client-side from the `types[]` array of the single response (Active only, in the response order). No separate types fetch. "All types" is the client default and shows every type |
| Subtotals / share / totals | Legacy showed a total-enrolled footer row | Server now returns each type's `enrolled`/`cost` subtotals and the grand `total`. The client computes only Share = row `enrolled` / grand-total `enrolled` (works for both a type row and a plan row) |
| Status / pending / COBRA | None in the real module | Still none. No status field exists on enrolment; none is added |
| Drill / mutation | No drill-down; read-only | Unchanged: read-only, no drill, no write action |

## Endpoints

There is ONE endpoint. It is `GET`, company-scoped, and belongs to the Insurance Billing module (`/InsuranceBilling`). It does not write. It returns the full widget dataset in a single call, already nested by insurance type. There is no separate types endpoint.

### The one endpoint: plans (full nested dataset)

```
GET /api/dashboard/insurance-billing/plans
```

No required parameters beyond company context. Returns the grand `total` plus a `types[]` array of every active insurance type, each type carrying its own `typeName`, its `enrolled`/`cost` subtotals, and its `plans[]` inside it. All types and all plans arrive in this one response, so the widget fetches once on load and never re-fetches for a filter change.

**The type filter is client-side.** Because every type and every plan already arrives in this one call, selecting (or clearing) a type in the filter chip is a client-side view over the response, NOT a fetch. The chip simply narrows which `types[]` entries the client renders; the "All types" default renders them all. The Type to Plan expand/collapse and column sort are, as before, instant client interactions and never a fetch.

_Optional narrowing note:_ a server could still accept an optional `typeId` query param to return a single type's slice, but the widget does not need it and does not send it; the primary contract is the parameter-free single call above.

> **Build follow-up (do not edit the build here):** this is a change from the earlier "the type filter is the only fetch" note. The current build refetches on type-change; that behaviour should become a client-side view over the single response. Flagging it here as a build follow-up only.

### Example request

```
GET /api/dashboard/insurance-billing/plans
```

## Cost derivation (the one new field)

`cost` per plan is the per-plan SUM, over that plan's enrolments, of the enrolment Rate:

- For each enrolment on the plan, the rate is `IBEmployeePlan.Rate` when `UseNonStandardRate` is set on that enrolment.
- Otherwise the rate is the standard `IBPlanRate.Rate` for that plan plus the enrolment's coverage tier (`TypeElectionID`).
- `cost` for the plan is the SUM of that per-enrolment rate across the plan's enrolments.

Because the rate varies by coverage tier (Employee, Family, Waived, etc.), the SUM naturally reflects the mix of tiers actually enrolled: a plan skewed toward Family coverage sums higher than the same headcount on Employee-only coverage, with no extra logic. This is derivable with query logic only, no new stored field. `[confirmed in code: IBEmployeePlan.Rate / IBPlanRate]`

Two definitional points sit on top of this derivation and are NOT resolved here (see Still needs sign-off):

1. **Which figure "total cost" means.** `cost` could be the total premium, the EMPLOYER share (`EmployerBilled` and/or `RateIndividual`), or the EMPLOYEE share, and `PreTax` may matter to the reading. The columns to compute any of these live on the same `IBEmployeePlan` / `IBPlanRate` rows, so this is a definition choice, not a data gap. This spec does not invent the answer. Recommended default: `cost` = total premium (SUM of the enrolment `Rate` as above); flag that an employer-versus-employee split is available from the same fields if product wants it.

2. **Count basis versus cost basis differ.** `enrolled` counts employees AND dependents (`IBEmployeePlan` plus `IBEmployeeDependent`), but `Rate` sits on `IBEmployeePlan`, the employee's plan enrolment, not on each dependent. So `enrolled` and `cost` are aggregated over different row sets. Dependents usually carry no separate Rate, because the coverage tier (Employee / Family) already prices family coverage on the employee's enrolment row, which implies `cost` should be `SUM(Rate)` over `IBEmployeePlan` only, while `enrolled` still includes dependents. This is a real definitional point for the dev / SME to confirm, not something this spec settles.

## Response schema

Field names below are the response property names. The response is a single object nested by insurance type: a grand `total`, then a `types[]` array where each type carries its subtotals and its `plans[]`.

### Top level

| Field | Type | Description |
|---|---|---|
| `total` | object | The grand total across every type: `{ enrolled, cost }` |
| `types[]` | array | One entry per active insurance type, each with its subtotals and its plans (below) |

### `total`

| Field | Type | Description |
|---|---|---|
| `enrolled` | int | Grand-total enrolment across all plans of all types |
| `cost` | number | Grand-total cost across all plans of all types |

### `types[]` entry

| Field | Type | Description |
|---|---|---|
| `typeId` | guid | The insurance type's id (`IBType.TypeID`) |
| `typeName` | string | The insurance type's display name (`IBType.Name`), e.g. Medical, Dental, Vision, Property |
| `enrolled` | int | This type's subtotal enrolment (server-provided; sum of its plans' `enrolled`) |
| `cost` | number | This type's subtotal cost (server-provided; sum of its plans' `cost`) |
| `plans[]` | array | The plans under this type (below); an empty array if the type has no active plans |

### `plans[]` entry (inside a type)

| Field | Type | Description |
|---|---|---|
| `planId` | guid | The plan's id (`IBPlan.PlanID`); the row key |
| `planName` | string | The plan's display name (`IBPlan.Name`); org-configured, not an enum |
| `enrolled` | int | The existing live count: `COUNT(IBEmployeePlan)` plus `COUNT(IBEmployeeDependent)` for the plan |
| `cost` | number | **NEW, the only addition in this spec.** Per-plan SUM of the enrolment Rate (see Cost derivation). Plain decimal number, no currency formatting |

Notes:

- There are no envelope objects, no echo headers, and no `generatedAt` stamps. The response is the single nested object above.
- The type list for the filter chip derives from `types[]` (in response order); there is no separate types endpoint.
- Amounts are plain decimal numbers; currency symbol and locale are client concerns.
- Type subtotals and the grand `total` are server-provided. **Share is the only client-side computation:** Share = row `enrolled` divided by `total.enrolled`. It is computable for both a type row (`type.enrolled / total.enrolled`) and a plan row (`plan.enrolled / total.enrolled`).

## Examples

All figures below are MOCK data shaped like the built Final's sample set. They are not live-verified production values; the shapes and the arithmetic reconciliation are the contract, not the amounts. The mock models cost as a representative rate times count for illustration (Rule 11: mock rates illustrative), while the real derivation is the per-enrolment `SUM(Rate)` described in Cost derivation.

### Example: the single nested call

```
GET /api/dashboard/insurance-billing/plans
```

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

Everything the widget needs is in this one response, already nested by type:

- Type subtotals (server-provided): Medical 182 / 91080, Dental 96 / 3648, Vision 71 / 639, Property 0 / 0.
- Grand `total` (server-provided): 349 enrolled / 95367 cost.
- Share (client-side, `enrolled` divided by `total.enrolled` = 349): plan rows Medical Base 37%, Medical Buy Up 15%, Delta Dental 28%, Vision 20%, Building / Property 0%; type rows Medical 52%, Dental 28%, Vision 20%, Property 0%.

The zero-enrolment plan (Building, under Property) is still returned inside its type so it lists with a zero count and 0% share. The type list for the filter chip is read straight from `types[]`; selecting Medical is a client-side view over the Medical entry already present in this response, not a fetch.

Reconciliation: plan costs (57600 + 33480 + 3648 + 639 + 0) sum to the type subtotals (91080 + 3648 + 639 + 0), which sum to `total.cost` 95367; plan enrolled (128 + 54 + 96 + 71 + 0) sum to the type subtotals (182 + 96 + 71 + 0), which sum to `total.enrolled` 349.

## Edge cases

1. **Zero-enrolment plan:** still returned inside its type (e.g. Building, under Property) with `enrolled` 0 and `cost` 0; the client renders it as a row with a zero count and 0% share, never hidden. Its type still appears in `types[]` with a 0 / 0 subtotal.
2. **Type with no plans:** the type still appears in `types[]` (it is Active) with `enrolled`/`cost` of 0 and an empty `plans[]` array. The filter chip can still select it, showing an empty type. Not an error.
3. **Deleted / inactive type or plan:** `IBType.Active` and `IBPlan.Active` filter the response; inactive types are absent from `types[]` and inactive plans are absent from a type's `plans[]`.
4. **Org with no plans or enrolments:** the response has `total` 0 / 0 and an empty `types[]`; the client renders its "No insurance plans yet" empty state. Not an error.
5. **Coverage-tier level:** `IBTypeElection` exists in the real hierarchy but is NOT surfaced by this contract; the nesting is Type to Plan only. Surfacing the tier level is a future enhancement.
6. **Type filter selection:** the filter chip is a client-side view over `types[]` in the single response, never a fetch; the client only ever selects a type already present in the response, so there is no unknown-`typeId` fetch path.
7. **Count basis versus cost basis:** because `enrolled` includes dependents and `Rate` sits on `IBEmployeePlan`, a plan can show a headcount that differs from the number of rate-bearing rows behind its `cost`. This is the definitional point in Cost derivation, flagged for sign-off, not a bug.

## Not in scope

- **No mutation.** This is a read-only widget: no write action, no Confirm, no move, no drill-through that changes anything.
- **No status / pending / COBRA / approval.** No such field exists on plan enrolment in the real IB module; none is added. Recorded so nobody specs a status field or a status filter to fill it.
- **No coverage-tier breakdown.** The Type to Plan to `IBTypeElection` hierarchy has a third (tier) level; this contract stops at Type to Plan. Surfacing the tier is a future enhancement, not this spec.
- **Share stays client-side.** Type subtotals and the grand `total` are server-provided in the nested response, but Share is not: the client computes Share = row `enrolled` / `total.enrolled` for both type rows and plan rows.
- **No Time Window Module.** No `window`, `grain`, or `asOf`; enrolment is a live count at request time.
- **Drill to individual employee or dependent names.** The widget never surfaces individual people; matches legacy behaviour.

## Still needs sign-off

- **"Total cost" definition. DECIDED (2026-08-05, owner + code): `cost` = total premium** (SUM of each enrolment's `Rate`). Confirmed in `IBEmployeeRepository`: each enrolment splits into an employer share (`Rate` minus `RateIndividual`) and an employee share (`RateIndividual`), so an employer-only or employee-only total is derivable from the same fields if product wants it later; `EmployerBilled` and `PreTax` remain flags on the row. Dependents carry their own premium and are counted.
- **Count basis versus cost basis.** Confirm whether dependents contribute to `cost`. Because `Rate` sits on `IBEmployeePlan` and the coverage tier already prices family coverage, the working assumption is `cost` = `SUM(Rate)` over `IBEmployeePlan` only, while `enrolled` continues to include dependents (`IBEmployeePlan` plus `IBEmployeeDependent`). Needs a dev / SME confirmation.
- **Single-call nested shape confirmation.** Confirm the one-call nested response (grand `total`, then `types[]` each with subtotals and `plans[]`, Active only) is acceptable as a deliberate owner-requested shape, given it departs from the project's usual flat-and-client-group minimal pattern. The type filter is now a client-side view over `types[]`, not a fetch; a build follow-up is needed to move the build's fetch-on-type-change to client-side (noted, not edited here).
- **Export.** Whether an export is offered and, if so, whether it is generated client-side from the JSON the widget already holds (zero backend work) or server-side (new endpoint). Undecided.
- **Coverage-tier level as a future enhancement.** Whether to surface the `IBTypeElection` tier as a third nesting level later. Out of scope for this contract; noted so the hierarchy is not forgotten.

## Sign-off findings

W06 has a Confluence dossier in `Step 6 - Sign off document/Insurance Billing Plans/` (page id 7370113044, Part A/B/C, 14 sections), but no reconciliation file exists for it yet, so there are no Accepted / Rejected / Disputed / Unreviewed findings to honour in this spec. If a `Reconciliation - Insurance Billing Plans.md` is written later, its finding statuses should be reflected here.
