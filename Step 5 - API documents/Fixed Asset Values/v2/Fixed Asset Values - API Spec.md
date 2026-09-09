# Fixed Asset Values - API Spec

**Status: Done - awaiting sign-off (drafting complete, owner review pending)**

---

## Overview

Fixed Asset Values shows the financial values of the organisation's fixed assets, broken down by a user-chosen grouping dimension. The user picks how assets are grouped (Class, Building, Room, or one of three account dimensions), which specific group to inspect, and which of five financial measures to plot; the widget renders either a donut of the selected measure across groups or a paged table of the individual assets inside the selected group. It is view-only: no drill-through, no row or arc click, no write against asset data.

This contract defines **five APIs**: a one-row organisation summary fired at the compact tier, a per-group totals read that feeds both the Specific Group list and the donut, a paginated server-sorted asset grid with full-group totals, and a read/write pair for the persisted filter selections. The count is derived from the decomposition triggers in the API inventory. The grid's pagination, sorting and totals, the summary, the group asset counts, and any Modern API preference persistence are all backend work that does not exist today.

Framework verdicts, stated once and justified in their own sections:

- **Filter execution.** Group By and Specific Group are SERVER params. Financial Measure is the one CLIENT filter, legitimate because the group-totals response carries all five measure totals per group.
- **Volume.** The asset grid is `MUST PAGINATE`; no source states a ceiling on assets per group, so the work is server-side by rule. Group counts per dimension carry a `[TO CONFIRM]` ceiling.
- **Decomposition.** Five APIs, each citing a trigger. One merge was taken: the group name list and the chart totals are a single read, because they must describe the same population.
- **Computation.** Every total, count and derived money value is server-side. The client derives donut shares, the zero-group exclusion, and display shortening, and nothing else.

**Data caveat, applying to every figure in the examples below:** the build's asset register is illustrative mock data. Nothing in it has been verified against Shelby's real fixed-asset tables, and the feasibility of serving six groupable dimensions, a dependent group list, and five money measures per asset is unconfirmed [TO CONFIRM - backend team]. See Still needs sign-off.

---

## Design → API coverage

| Design element | Type | API | Field(s) | Provenance |
|---|---|---|---|---|
| Compact-tier headline figure, Total Net Value org-wide | KPI | API 1 | `totalNetValue` | DERIVED SUM of per-asset Net Value over all `FA_Asset` rows in company scope; the org-wide summation itself is stated in no source [TO CONFIRM - owner] |
| Compact-tier asset-count pill | KPI | API 1 | `assetCount` | DERIVED COUNT of `FA_Asset` in company scope [BUILD] |
| Group By menu, six dimensions | Filter | API 2, API 3 | `valueType` request param, echoed as `valueType`; option list is a client-side static enum of six values | STATIC enum [DOC Widget_Comparison_Classic.html, type-options is a static array today] |
| Specific Group menu, dependent on Group By | Filter | API 2 | `groups[].groupId`, `groups[].name` | STORED distinct group values from `FA_Asset` for the selected dimension; exact grouping columns UNVERIFIED (backend team) |
| Financial Measure menu, five measures | Filter | none (client selection over API 2 data) | client state; option list is a static enum of five values | STATIC enum [DOC Widget_Comparison_Classic.html, dollar-options is a static array today] |
| View toggle, Asset Detail / Donut | View | none | client state, switches which API renders; no field | DERIVED client state [BUILD] |
| Donut arcs and legend rows | Chart series | API 2 | `groups[].capitalizedValue`, `groups[].cost`, `groups[].depreciableValue`, `groups[].accumulatedDepreciation`, `groups[].netValue` (the selected measure is read client-side) | DERIVED per-group SUM of the measure over `FA_Asset` and `FA_AssetDepreciation` [DOC Step 1 research] |
| Donut arc and legend text, per-group asset count | Chart series | API 2 | `groups[].assetCount` | DERIVED per-group COUNT; NEW, no existing response carries a count [BUILD] |
| Donut centre total | KPI | API 2 | client SUM over `groups[]` selected-measure values | DERIVED client arithmetic over held values [BUILD] |
| Zero-group exclusion note under the donut | State | API 2 | client filter over `groups[]` where the selected measure totals zero; excluded names listed | DERIVED client view over held values [BUILD, per Step 1 rule] |
| "not assigned" group, selectable, listed last | Filter value | API 2 | `groups[].groupId` sentinel, `groups[].name` = "not assigned" | DERIVED grouping of blank values [DOC Step 1 research]; sentinel wire form [TO CONFIRM - backend team] |
| Table column Tag # | Table column | API 3 | `rows[].tagNumber` | STORED FA_Asset tag number [DOC Widget_Comparison_Classic.html] |
| Table column Name | Table column | API 3 | `rows[].name` | STORED FA_Asset name [DOC Widget_Comparison_Classic.html] |
| Table columns, five measures in fixed canonical order | Table column | API 3 | `rows[].capitalizedValue`, `rows[].cost`, `rows[].depreciableValue`, `rows[].accumulatedDepreciation`, `rows[].netValue` | STORED and DERIVED, formulas in Tables below [DOC Step 1 research] |
| Totals row, asset count and column total per measure over the whole group | Table row | API 3 | `totals`, `totalCount` | DERIVED SUM and COUNT over the full filtered group, never the page; NEW [BUILD, owner instruction] |
| Column sort, all seven columns | Interaction | API 3 | `sortBy`, `sortDir` request params | NEW, server-side sort does not exist on the current grid endpoint [BUILD] |
| Pager, Previous / Next with row range | Interaction | API 3 | `totalCount`, `pageIndex`, `pageCount` | NEW [BUILD] |
| Zero-Net row marker | State | API 3 | client band over `rows[].netValue` = 0 | DERIVED client presentation [BUILD] |
| Persisted selections across sessions | State | API 4, API 5 | `groupBy`, `groupId`, `measure` | NEW on the Modern API; legacy stores them in `SSUserTenantPreferenceRepository` [DOC Step 1 research] |
| Download at Explore and Detail, full-precision figures | Action | none yet | no field; the scope and mechanism of the download are undecided | Gap, blocking open item, see Still needs sign-off |
| Empty state, org has no assets | State | API 1, API 2, API 3 | zero responses per the State contracts tables | DERIVED [BUILD] |
| Unimplemented-dimension placeholder | State | API 2 | empty `groups[]` array | DERIVED, matches what the Modern API returns today for the three account dimensions [DOC Step 1 research] |
| Refresh icon, every tier | Action | API 1 or API 2 + API 3 | re-fires the calls for the current tier and view; no field | DERIVED client behaviour [BUILD] |

---

## Tables

| Table / repository | Fields and members used |
|---|---|
| `FA_Asset` | Tag number, name, capitalized value, cost, salvage value, CompanyID, and the class / building / room / asset-account / accumulated-depreciation-account / expense-account grouping columns. Exact column names for the grouping columns are UNVERIFIED (backend team) |
| `FA_AssetDepreciation` | AssetID, Depreciation, Tax flag. Book depreciation only; tax depreciation rows are excluded by definition |
| `SSUserTenantPreferenceRepository` | Key `UserPreferences.WidgetFixedAssets`, the legacy store for the three persisted selections |

No new tables and no schema changes are needed: this contract is new queries and new response shapes against existing tables, plus a Modern API path to the existing preference store.

Core formulas, each quotable in isolation:

- **Capitalized Value** and **Cost** are direct fields on `FA_Asset`, not derived. [DOC Step 1 research]
- **Depreciable Value** = `Cost - SalvageValue`, computed, not a stored field. [DOC Step 1 research]
- **Accumulated Depreciation** = `SUM(FA_AssetDepreciation.Depreciation) WHERE NOT Tax`, grouped by AssetID. The NOT-Tax condition is part of the definition, not an optimisation. [DOC Step 1 research]
- **Net Value** = `DepreciableValue - AccumulatedDepreciation`. The base is Depreciable Value, not Cost. A query using Cost as the base is wrong. [DOC Step 1 research, recorded there as a correction to its own earlier wording]
- **Scope filter on every read:** `FA_Asset WHERE CompanyID = ctx`, the company taken from the `X-Company-ID` header. [DOC Widget_Comparison_Classic.html]
- **Blank grouping values:** an asset whose selected grouping column is blank belongs to the "not assigned" group, a real selectable group listed last. A blank never behaves as a wildcard. [DOC Step 1 research]
- **Per-asset salvage value is never served.** The server consumes it inside Depreciable Value; no response in this contract carries it, and no existing endpoint exposes it either. [DOC Widget_Comparison_Classic.html]

---

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Grid read | `GET /api/dashboard/fixed-assets/grid?valueType&valueId&dollarType` returns the full unpaged, unsorted `FixedAssetsGridRowDto` list with no totals | NEW: `page`, `pageSize`, `sortBy`, `sortDir` params; `totalCount`, `totals`, `pageIndex`, `pageCount` in the response |
| Grid measure handling | `dollarType` param; legacy also reordered columns around the selected measure | Param dropped: all five measures are served per row and the table's column order is fixed; the measure selection has no effect on this API (re-shaped existing read) |
| Group list and chart | Two endpoints: `/values` returns `{Id,Name}` pairs; `/chart` returns per-group value fields with zero-total groups excluded server-side | NEW re-shape: one groups read returning every group including zero-total ones, plus `assetCount` per group, so the client can name the excluded groups and show counts |
| Organisation summary | Nothing serves an org-wide Net Value total or asset count | NEW: one-row summary read |
| Preference persistence | Legacy stores the three selections in `SSUserTenantPreferenceRepository`; the Modern API persists nothing, client-managed only | NEW: Modern API read/write pair against the existing store |
| Account dimensions | `GetFixedAssetsValuesAsync()` implements Class/Building/Room only; the three account dimensions return an empty list from an unimplemented switch case | Unchanged in this contract; an empty `groups[]` is the specified response until the backend decision in Still needs sign-off is made |

---

## API inventory

| API | Purpose | Trigger (when it fires) | Cardinality | R/W | Cache posture | Split trigger |
|---|---|---|---|---|---|---|
| API 1 - Organisation summary | Total Net Value and asset count, org-wide, ignoring every selection | Widget render at the compact tier; refresh | 1 row | R | LIVE per request | Grain gap (org snapshot vs per-group vs per-asset) and conditional weight (the wide tiers never need it) |
| API 2 - Group totals | Every group in the selected dimension with its asset count and all five measure totals; feeds the Specific Group menu and the donut | Widget render at Explore/Detail; Group By change; refresh | One row per group in the dimension | R | LIVE per request | Cardinality gap against API 3 (bounded group list vs per-asset rows) |
| API 3 - Asset grid | One page of assets in the selected group, server-sorted, with full-group totals | Asset Detail view render; Specific Group change; sort; page; refresh | Unbounded per-asset rows, paged | R | LIVE per request | Grain gap (per-asset detail vs group totals) and trigger gap (fires only when the table view renders) |
| API 4 - Preferences read | The user's saved Group By / Specific Group / Financial Measure selections | Widget render at Explore/Detail, before API 2 | 1 row | R | LIVE per request | Lifetime gap (changes only when the user changes it) and read vs write |
| API 5 - Preferences write | Persist the three selections | Any of the three selections changes | 1 row | W | Not cached | Read vs write, always separate |

Merges considered, concluded:

- The group **name list** and the group **chart totals** are one API. They always fire together, describe the same population, and splitting them would let the menu and the donut disagree about which groups exist.
- The summary is **not** folded into the groups read: the compact tier must not pay for a per-group breakdown, and the wide tiers do not render the summary figure.
- The grid is **not** folded into the groups read: per-asset rows are unbounded and paged; group totals are not.

---

## Call sequence

| Interaction | Calls fired | Notes |
|---|---|---|
| Initial widget load, compact tier | API 1 | Nothing else; the compact tier has no controls |
| Initial widget load, Explore/Detail | API 4, then API 2 (valueType from the saved selection), then API 3 (the built default view is the Asset Detail table; the default group is the first in API 2's list when no saved group is valid) | The default view is a contested decision, see Still needs sign-off; if Donut wins, the API 3 call drops out of this row |
| Change filter Group By | API 2 with the new `valueType`; API 3 if the table view is active (Specific Group resets to the first group, page 1); API 5 | The old group value cannot exist in the new dimension, so it is cleared, never sent |
| Change filter Specific Group | API 3 with the new `valueId`, page 1, if the table view is active; API 5 | The donut ignores the Specific Group selection; no API 2 call |
| Change filter Financial Measure | API 5 only | The donut re-plots client-side from API 2 data already held; the table serves all five measures so nothing refetches |
| Switch view to Donut | none | API 2 data is already held from load or the last Group By change |
| Switch view to Asset Detail | API 3 | Current group, current sort, page 1 |
| Sort a column | API 3 with the new `sortBy`/`sortDir`, page 1 | Sort is a server request, never a browser operation |
| Page Previous / Next | API 3 with the new `page` | Totals and donut never change with the page |
| Download | none yet | Scope and mechanism undecided, see Still needs sign-off |
| Refresh | Compact tier: API 1. Explore/Detail: API 2, plus API 3 if the table view is active | Re-fires with the current selections |

**Snapshot anchor:** every read response echoes an `asOf` server timestamp. The calls take no shared snapshot param: API 2 and API 3 render one view at a time, and the totals row belongs to API 3 alone, so a write landing between two calls can only make the group list and the grid drift until the next interaction refetches. That drift is accepted; the refresh control is the recovery. Any figure that must reconcile on one screen comes from a single call.

---

## Filter architecture

| Filter | Option source | Cardinality | Execution | Aggregate effect | Cascade | "All" wire form | Round trips |
|---|---|---|---|---|---|---|---|
| Group By | STATIC enum: Class, Building, Room, Asset Account, Accumulated Depreciation Account, Expense Account (the last three return no groups on the Modern API today) | 6, fixed | SERVER, param `valueType` on API 2 and API 3 | Yes: every group total, grid row set and grid total changes | Resets Specific Group; its option list is rebuilt from API 2 | No "All": a dimension is always selected; the param is always sent | 1 (API 2) or 2 (plus API 3 in table view), plus the API 5 write |
| Specific Group | LOOKUP: `groups[]` from API 2, dependent on Group By | Varies by dimension; Class is small, Room and the account dimensions have no stated ceiling [TO CONFIRM - backend team] | SERVER, param `valueId` on API 3 | Yes: the grid rows, `totalCount` and `totals` all change. The donut is unaffected, it always spans all groups | Depends on Group By; a value that is stale after a Group By change is cleared client-side and never sent | No "All": the table always shows exactly one group; the param is always sent | 1 (API 3), plus the API 5 write |
| Financial Measure | STATIC enum: Capitalized Value, Cost, Depreciable Value, Accumulated Depreciation, Net Value | 5, fixed | CLIENT: the full set it operates on (all five totals per group) is already present in the API 2 response, that set is bounded by the group count of the dimension, and re-plotting changes no server-computed aggregate because all five are served | No server aggregate changes; the donut re-plots from held values | None | No "All": one measure is always selected | 0, plus the API 5 write |

- **Combination semantics:** AND, narrowing, in a fixed hierarchy: `valueType` chooses the dimension, `valueId` chooses one group inside it, and the measure selects among values already returned. No pair is OR and no pair is mutually exclusive.
- **Conflict rule:** a `valueId` that does not identify a group within the requested `valueType` (a stale saved preference, a group deleted mid-session) is not an error: API 3 returns a well-formed zero response, `totalCount` 0, every `totals` member 0, empty `rows`. The client then falls back to the first group in API 2's list. A syntactically invalid `valueType` or a non-whitelisted `sortBy` is rejected with HTTP 400 and a named error code, because those are client defects, not data states.
- **Empty-result semantics:** a valid combination matching nothing returns the well-formed zero shape above, never an error.
- **Cascade invalidation:** Specific Group's options depend on Group By. On a Group By change the client clears the group selection and selects the first group of the new list; the stale value is never sent to the server.
- **Blank values:** assets with a blank grouping column fall into the "not assigned" group. Selecting "not assigned" returns exactly those assets; selecting any named group excludes them. A blank is never a wildcard.
- **Lookup endpoint:** the Specific Group lookup is API 2 in this contract, not a separate endpoint. The two static enums ship in the client; the existing type-options and dollar-options endpoints are declared out of contract as pre-existing and unused.

---

## Volume and performance

| Dataset | Typical rows | Worst realistic rows (basis) | Row width | Payload at worst | Verdict | Server cost model | Cache posture |
|---|---|---|---|---|---|---|---|
| API 1 summary | 1 | 1 (fixed shape by definition) | 3 fields, ~60 bytes | Under 1 KB | BOUNDED | One aggregate scan of `FA_Asset` in company scope, joined to a grouped SUM over `FA_AssetDepreciation` | LIVE |
| API 2 groups | 3 to 8 per dimension in the demo register, a typical figure only | No stated ceiling for Room or the account dimensions [TO CONFIRM - backend team] | 8 fields, ~180 bytes | ~18 KB at 100 groups | BOUNDED by the distinct-group count of one dimension, subject to the [TO CONFIRM] ceiling; if a dimension proves unbounded this read moves to a paged or top-N shape | One grouped scan of `FA_Asset` in company scope joined to per-asset depreciation SUMs, G groups out of N assets | LIVE |
| API 3 grid rows | 5 to 20 per group in the demo register, a typical figure only | No source states assets-per-group at a large org [TO CONFIRM - backend team] | 8 fields, ~200 bytes | One page: ~20 KB at the maximum `pageSize` | MUST PAGINATE | Filtered indexed scan of `FA_Asset` for one group, ORDER BY a whitelisted column, offset-fetch for the page, plus one aggregate pass over the same filtered set for `totals` and `totalCount`. The per-asset Accumulated Depreciation is a grouped join to `FA_AssetDepreciation`, N-assets-in-group multiplier | LIVE |
| API 4 / API 5 preferences | 1 | 1 (one row per user per company by definition) | 3 fields, ~80 bytes | Under 1 KB | BOUNDED | Single keyed read or upsert against the preference store | LIVE |

No dataset here is a time series; there is no N × M product to state, and no time axis anywhere in the widget.

The build's register is small enough that every operation looks instant client-side. That is a property of the fixture. The set of assets in a group is bounded only by how many assets an organisation owns, which is exactly the kind of bound Framework 2 rejects, so the grid's sort, paging and totals are server work by rule, not by choice.

### Pagination contract

- **Params:** `page`, 1-based; `pageSize` default 10 [BUILD, owner instruction], maximum 100 (contract rule so the param cannot re-create the unbounded fetch).
- **What paginates:** `rows[]` in API 3, and nothing else anywhere in the contract.
- **What does not:** `totals` (all five measures) and `totalCount` compute over the **full filtered set**, never the page. The donut (API 2) never pages at all. Switching pages changes no total, no chart, no KPI.
- **Sort params:** `sortBy` whitelist: `tagNumber`, `name`, `capitalizedValue`, `cost`, `depreciableValue`, `accumulatedDepreciation`, `netValue`. `sortDir`: `asc` or `desc`. A non-whitelisted `sortBy` is HTTP 400.
- **Deterministic total order:** every sort ends `... , tagNumber ASC, assetId ASC`. `assetId` is the unique tiebreaker; tag-number uniqueness is not guaranteed by any source [TO CONFIRM - backend team], so the id terminates the order regardless.
- **`totalCount`** is returned alongside every page, with `pageIndex` and `pageCount`, so the client renders the pager without a second call.
- **Past the last page:** a `page` value beyond the end is clamped to the last page; the response carries the served `pageIndex`, correct `totalCount`, correct `totals`, and is never an error. A shrinking result set therefore cannot strand the client on an empty page.

---

## Where computation lives

| Value | Server or client | Basis | Why |
|---|---|---|---|
| Org-wide Total Net Value | Server | API 1 | Spans every asset; the client never holds them all |
| Org-wide asset count | Server | API 1 | Same population |
| Per-group measure totals, all five | Server | API 2 | Span whole groups; the client holds no asset rows outside the current grid page |
| Per-group asset count | Server | API 2 | Same |
| Group list ordering, alphabetical with "not assigned" last | Server | API 2 | One ordering shared by every consumer, so the menu and the donut cannot disagree |
| Per-row Depreciable Value, Accumulated Depreciation, Net Value | Server | API 3 | Defined formulas over stored data the client does not hold (salvage value and depreciation rows are never transmitted) |
| Grid totals row, five sums and the asset count | Server | API 3 | Computed over the full filtered group; a page-local total would be a wrong number on screen |
| Grid sort order | Server | API 3 | The client holds one page and cannot order a set it does not have |
| Pager arithmetic, "x to y of z" | Client | `pageIndex`, `totalCount` | Pure arithmetic over values in the response |
| Donut share per group | Client | API 2 | Pure arithmetic over held per-group totals. No percentage is server-computed in this contract, so no server division-by-zero rule is needed; when the charted total is zero the client renders the empty-chart state and divides by nothing, and a null never enters the math |
| Donut centre total | Client | API 2 | SUM over held values; equals the sum over all groups because excluded groups total zero |
| Zero-group exclusion and the note naming them | Client | API 2 | A view over the full held group set; the excluded names stay in the DOM as text |
| Arc ordering, largest share first, and the amethyst ramp assignment | Client | API 2 | Presentation over a held bounded set |
| Zero-Net row marker | Client | API 3 | Presentation band over `rows[].netValue` = 0; the threshold is exact zero, not a configurable band, so nothing awaits approval |
| Display shortening to $1.2M style, with the exact figure in `title` and `aria-label` | Client | any response | Presentation; the wire always carries full precision |

No deltas exist anywhere in this widget: it has no comparison, trend or time axis, so nothing is pre-signed because nothing is a delta.

---

## API 1: Organisation summary

### Endpoint

```
GET /api/dashboard/fixed-assets/summary
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| none | - | - | - | - | The summary takes no parameters; it ignores every widget selection by design |

Context header: `X-Company-ID`, required on every call in this contract; scopes every query to `FA_Asset.CompanyID`.

### Example requests

```
GET /api/dashboard/fixed-assets/summary
GET /api/dashboard/fixed-assets/summary   (identical after any filter change: the summary never varies with selections)
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `totalNetValue` | number | DERIVED SUM over all assets of `(Cost - SalvageValue) - BookAccumulatedDepreciation`; the org-wide summation is stated in no source [TO CONFIRM - owner] | Total Net Value across all fixed assets, org-wide, full precision |
| `assetCount` | integer | DERIVED COUNT of `FA_Asset` in company scope [BUILD] | Number of asset records behind the figure |
| `asOf` | string (ISO 8601) | NEW server timestamp | When the server computed the figure |

### Example response

```json
{
  "totalNetValue": 5634400.00,
  "assetCount": 25,
  "asOf": "2026-09-07T14:05:00Z"
}
```

Reconciliation: 5000000 + 380000 + 250000 + 4400 = 5634400, so `totalNetValue` equals the sum of API 2's per-group `netValue` over any single dimension, and 8 + 13 + 3 + 1 = 25 asset counts likewise; the two APIs must agree when no write lands between them.

### State contracts

| State | Response |
|---|---|
| Empty (org has no fixed assets) | `{"totalNetValue": 0, "assetCount": 0, "asOf": "..."}`, HTTP 200 |
| Partial | Not applicable: there is no requested span; the read is a point-in-time snapshot |
| Not-yet-existing entity | Not applicable: no entity id is requested |
| Permission denied | HTTP 403 with the standard dashboard error body; what the widget renders is undesigned, see Still needs sign-off |
| Upstream unavailable | HTTP 503 with the standard dashboard error body; the widget's error frame is undesigned, see Still needs sign-off |

---

## API 2: Group totals

### Endpoint

```
GET /api/dashboard/fixed-assets/groups
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `valueType` | string | yes | `Class`, `Building`, `Room`, `AssetAccount`, `AccumDepAccount`, `ExpenseAccount` | none, always sent | The grouping dimension. The three account values return an empty `groups` array on the Modern API today |

Context header: `X-Company-ID`, as API 1.

### Example requests

```
GET /api/dashboard/fixed-assets/groups?valueType=Class
GET /api/dashboard/fixed-assets/groups?valueType=Room   (a higher-cardinality dimension, same shape)
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `valueType` | string | DERIVED echo of the request param | The dimension this list describes |
| `groups[]` | array | DERIVED grouping of `FA_Asset` by the selected dimension, ordered alphabetically with "not assigned" last | Every group in the dimension, including groups whose totals are zero |
| `groups[].groupId` | string (guid) | STORED group identity; the exact source column per dimension is UNVERIFIED (backend team), and the sentinel for "not assigned" is [TO CONFIRM - backend team] | Identity the client sends back as `valueId` |
| `groups[].name` | string | STORED group display name; source per dimension UNVERIFIED (backend team) | Display name; `"not assigned"` for the blank group |
| `groups[].assetCount` | integer | DERIVED per-group COUNT; NEW [BUILD] | Assets in the group |
| `groups[].capitalizedValue` | number | DERIVED SUM(`FA_Asset` capitalized value) per group [DOC Step 1 research] | Group total, full precision |
| `groups[].cost` | number | DERIVED SUM(`FA_Asset` cost) per group [DOC Step 1 research] | Group total |
| `groups[].depreciableValue` | number | DERIVED SUM(`Cost - SalvageValue`) per group [DOC Step 1 research] | Group total |
| `groups[].accumulatedDepreciation` | number | DERIVED SUM(`FA_AssetDepreciation.Depreciation` WHERE NOT Tax) per group [DOC Step 1 research] | Group total, book depreciation only |
| `groups[].netValue` | number | DERIVED `depreciableValue - accumulatedDepreciation` per group [DOC Step 1 research] | Group total |
| `asOf` | string (ISO 8601) | NEW server timestamp | When the server computed the list |

### Example response

```json
{
  "valueType": "Class",
  "groups": [
    { "groupId": "6f1d2a30-9c1e-4b7a-8f21-0a1b2c3d4e01", "name": "Audio Visual", "assetCount": 13, "capitalizedValue": 741601.00, "cost": 762100.00, "depreciableValue": 742635.00, "accumulatedDepreciation": 362635.00, "netValue": 380000.00 },
    { "groupId": "6f1d2a30-9c1e-4b7a-8f21-0a1b2c3d4e02", "name": "Buildings", "assetCount": 8, "capitalizedValue": 9100000.00, "cost": 9447400.00, "depreciableValue": 9174600.00, "accumulatedDepreciation": 4174600.00, "netValue": 5000000.00 },
    { "groupId": "6f1d2a30-9c1e-4b7a-8f21-0a1b2c3d4e03", "name": "Vehicles", "assetCount": 3, "capitalizedValue": 387331.00, "cost": 401950.00, "depreciableValue": 384145.00, "accumulatedDepreciation": 134145.00, "netValue": 250000.00 },
    { "groupId": "00000000-0000-0000-0000-000000000000", "name": "not assigned", "assetCount": 1, "capitalizedValue": 5400.00, "cost": 5600.00, "depreciableValue": 5600.00, "accumulatedDepreciation": 1200.00, "netValue": 4400.00 }
  ],
  "asOf": "2026-09-07T14:05:00Z"
}
```

Reconciliation: netValue 380000 + 5000000 + 250000 + 4400 = 5634400 matches API 1's `totalNetValue`, and assetCount 13 + 8 + 3 + 1 = 25 matches API 1's `assetCount`; within each group, depreciableValue minus accumulatedDepreciation equals netValue, for Vehicles 250000 from 384145 and 134145.

### State contracts

| State | Response |
|---|---|
| Empty (org has no fixed assets) | `{"valueType": "Class", "groups": [], "asOf": "..."}`, HTTP 200; the client renders the no-assets state |
| Unimplemented dimension (the three account values today) | Same empty-array shape, HTTP 200; the client renders the "No groups returned" placeholder and keeps the filter controls live |
| Partial (some groups total zero for a measure) | Zero-total groups are present in `groups[]` with their real zeroes; the client excludes them from the chart and names them in the note |
| Permission denied | HTTP 403, standard error body; widget rendering undesigned, see Still needs sign-off |
| Upstream unavailable | HTTP 503, standard error body |

---

## API 3: Asset grid

### Endpoint

```
GET /api/dashboard/fixed-assets/grid
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `valueType` | string | yes | as API 2 | none, always sent | The grouping dimension |
| `valueId` | string (guid) | yes | a `groupId` from API 2 for the same `valueType` | none, always sent | The specific group whose assets are listed |
| `sortBy` | string | no | `tagNumber`, `name`, `capitalizedValue`, `cost`, `depreciableValue`, `accumulatedDepreciation`, `netValue` | `tagNumber` | Whitelisted sort column; anything else is HTTP 400. The default is a proposed decision, see Still needs sign-off |
| `sortDir` | string | no | `asc`, `desc` | `asc` | Sort direction; the order always ends `tagNumber ASC, assetId ASC` as tiebreakers |
| `page` | integer | no | 1 or greater | 1 | 1-based page; values past the end are clamped to the last page |
| `pageSize` | integer | no | 1 to 100 | 10 | Rows per page; the maximum is a hard cap |

Context header: `X-Company-ID`, as API 1.

### Example requests

```
GET /api/dashboard/fixed-assets/grid?valueType=Class&valueId=6f1d2a30-9c1e-4b7a-8f21-0a1b2c3d4e03
GET /api/dashboard/fixed-assets/grid?valueType=Class&valueId=6f1d2a30-9c1e-4b7a-8f21-0a1b2c3d4e03&sortBy=netValue&sortDir=desc&page=1&pageSize=10
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `rows[]` | array | DERIVED: the requested page only, already ordered by the server | At most `pageSize` assets |
| `rows[].assetId` | string (guid) | STORED `FA_Asset` identity [DOC Widget_Comparison_Classic.html] | Unique asset id; the final sort tiebreaker |
| `rows[].tagNumber` | string | STORED `FA_Asset` tag number [DOC Widget_Comparison_Classic.html] | Tag # column |
| `rows[].name` | string | STORED `FA_Asset` name [DOC Widget_Comparison_Classic.html] | Name column |
| `rows[].capitalizedValue` | number | STORED `FA_Asset` capitalized value [DOC Step 1 research] | Full precision |
| `rows[].cost` | number | STORED `FA_Asset` cost [DOC Step 1 research] | Full precision |
| `rows[].depreciableValue` | number | DERIVED `Cost - SalvageValue`, computed server-side [DOC Step 1 research] | Salvage value itself is never served |
| `rows[].accumulatedDepreciation` | number | DERIVED SUM(`FA_AssetDepreciation.Depreciation` WHERE NOT Tax) for the asset [DOC Step 1 research] | Book depreciation only |
| `rows[].netValue` | number | DERIVED `depreciableValue - accumulatedDepreciation` [DOC Step 1 research] | Basis for the zero-Net row marker |
| `totalCount` | integer | DERIVED COUNT over the whole filtered group; NEW [BUILD] | Size of the full set, not the page |
| `totals` | object | DERIVED; NEW [BUILD, owner instruction] | Per-measure totals over the whole filtered group, never the page |
| `totals.capitalizedValue` | number | DERIVED SUM over the full filtered set | Totals-row cell |
| `totals.cost` | number | DERIVED SUM over the full filtered set | Totals-row cell |
| `totals.depreciableValue` | number | DERIVED SUM over the full filtered set | Totals-row cell |
| `totals.accumulatedDepreciation` | number | DERIVED SUM over the full filtered set | Totals-row cell |
| `totals.netValue` | number | DERIVED SUM over the full filtered set | Totals-row cell |
| `pageIndex` | integer | NEW: the clamped page actually served, 1-based | Echo for the pager |
| `pageCount` | integer | NEW: `ceil(totalCount / pageSize)`, minimum 1 | Pager bound |
| `asOf` | string (ISO 8601) | NEW server timestamp | When the server ran the query |

### Example response

```json
{
  "rows": [
    { "assetId": "9a0b1c2d-0001-4a4a-9b9b-111111111111", "tagNumber": "FA-1021", "name": "Passenger Van", "capitalizedValue": 120000.00, "cost": 125000.00, "depreciableValue": 121000.00, "accumulatedDepreciation": 21000.00, "netValue": 100000.00 },
    { "assetId": "9a0b1c2d-0002-4a4a-9b9b-222222222222", "tagNumber": "FA-1023", "name": "Maintenance Truck", "capitalizedValue": 140000.00, "cost": 145000.00, "depreciableValue": 141500.00, "accumulatedDepreciation": 51500.00, "netValue": 90000.00 },
    { "assetId": "9a0b1c2d-0003-4a4a-9b9b-333333333333", "tagNumber": "FA-1025", "name": "Minibus", "capitalizedValue": 127331.00, "cost": 131950.00, "depreciableValue": 121645.00, "accumulatedDepreciation": 61645.00, "netValue": 60000.00 }
  ],
  "totalCount": 3,
  "totals": {
    "capitalizedValue": 387331.00,
    "cost": 401950.00,
    "depreciableValue": 384145.00,
    "accumulatedDepreciation": 134145.00,
    "netValue": 250000.00
  },
  "pageIndex": 1,
  "pageCount": 1,
  "asOf": "2026-09-07T14:05:00Z"
}
```

Reconciliation: netValue 100000 + 90000 + 60000 = 250000 equals `totals.netValue`, cost 125000 + 145000 + 131950 = 401950 equals `totals.cost`, and capitalizedValue 120000 + 140000 + 127331 = 387331 equals `totals.capitalizedValue`; this group fits one page so the page sums to the totals, but on a multi-page group the totals still cover the full filtered set while `rows` holds one page. `totals.netValue` and `totalCount` here match API 2's Vehicles group figures.

### State contracts

| State | Response |
|---|---|
| Empty (the group has no assets, or `valueId` is stale for the `valueType`) | `rows` empty, `totalCount` 0, every `totals` member 0, `pageIndex` 1, `pageCount` 1, HTTP 200 |
| Partial | Not applicable: no requested span exists; the read is a point-in-time snapshot of one group |
| Not-yet-existing entity (unknown `valueId`) | Same well-formed zero shape as Empty, HTTP 200; a stale saved preference is an everyday state, not a fault |
| Permission denied | HTTP 403, standard error body; widget rendering undesigned, see Still needs sign-off |
| Upstream unavailable | HTTP 503, standard error body |

---

## API 4: Preferences read

### Endpoint

```
GET /api/dashboard/fixed-assets/preferences
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| none | - | - | - | - | The user and company come from the auth context and the `X-Company-ID` header |

### Example requests

```
GET /api/dashboard/fixed-assets/preferences
GET /api/dashboard/fixed-assets/preferences   (identical on every load; there is no variant call)
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `groupBy` | string | NEW read of `SSUserTenantPreferenceRepository` key `UserPreferences.WidgetFixedAssets`; the Modern API has no preference read today [DOC Step 1 research], and whether a shared dashboard preference service should carry this instead is [TO CONFIRM - backend team] | Saved Group By dimension, or `Class` when nothing is saved |
| `groupId` | string (guid) or null | NEW, same store | Saved Specific Group; null when nothing is saved, and the client falls back to the first group in API 2's list |
| `measure` | string | NEW, same store | Saved Financial Measure, or `NetValue` when nothing is saved |

### Example response

```json
{
  "groupBy": "Class",
  "groupId": "6f1d2a30-9c1e-4b7a-8f21-0a1b2c3d4e03",
  "measure": "NetValue"
}
```

There is no arithmetic to prove in this response; the three values are opaque selections echoed from the store.

### State contracts

| State | Response |
|---|---|
| Empty (nothing saved yet, first use) | `{"groupBy": "Class", "groupId": null, "measure": "NetValue"}`, HTTP 200; the defaults are the built defaults |
| Partial (a saved `groupId` is stale for the saved `groupBy`) | Returned as stored; API 3's zero-shape conflict rule and the client fallback handle it |
| Not-yet-existing entity | Not applicable: the resource always exists conceptually, empty means defaults |
| Permission denied | HTTP 403; a user who can see the widget can always read their own preferences, so this arises only with no widget access at all |
| Upstream unavailable | HTTP 503, standard error body |

---

## API 5: Preferences write

### Endpoint

```
PUT /api/dashboard/fixed-assets/preferences
```

### Parameters

Body, JSON, all three members required so the stored state is always complete:

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `groupBy` | string | yes | the six dimension values, as API 2's `valueType` | none, always sent | Dimension to save |
| `groupId` | string (guid) or null | yes | a `groupId` from API 2, or null | none, always sent | Group to save; null means "first group of the dimension" |
| `measure` | string | yes | `CapitalizedValue`, `Cost`, `DepreciableValue`, `AccumulatedDepreciation`, `NetValue` | none, always sent | Measure to save |

### Example requests

```
PUT /api/dashboard/fixed-assets/preferences   body: {"groupBy": "Building", "groupId": null, "measure": "Cost"}
PUT /api/dashboard/fixed-assets/preferences   body: {"groupBy": "Class", "groupId": "6f1d2a30-9c1e-4b7a-8f21-0a1b2c3d4e03", "measure": "NetValue"}
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `groupBy` | string | NEW upsert into the same store as API 4 | Echo of the saved state |
| `groupId` | string (guid) or null | NEW, same store | Echo |
| `measure` | string | NEW, same store | Echo |

### Example response

```json
{
  "groupBy": "Class",
  "groupId": "6f1d2a30-9c1e-4b7a-8f21-0a1b2c3d4e03",
  "measure": "NetValue"
}
```

There is no arithmetic to prove in this response; the write echoes the state it stored. The write is idempotent by construction: it stores desired state, so repeating it is harmless.

### State contracts

| State | Response |
|---|---|
| Empty | Not applicable: the body is always complete; a missing member is HTTP 400 with a named validation error |
| Partial | Not applicable, as above |
| Not-yet-existing entity | First write creates the row; same 200 echo |
| Permission denied | HTTP 403; a read-only dashboard user can still save view preferences unless the platform rules otherwise [TO CONFIRM - backend team] |
| Upstream unavailable | HTTP 503; the client keeps its in-memory selections for the session and retries on the next change |

---

## Auth and scoping

- **Company / tenant scoping:** every call carries the `X-Company-ID` header, and every query is scoped `FA_Asset.CompanyID = ctx` [DOC Widget_Comparison_Classic.html]. The preference store is additionally scoped to the authenticated user, per company, matching the legacy per-company key behaviour.
- **Permission right:** the legacy widget is gated by the Fixed Assets module entitlement behind `AccessUri /FixedAssets`. The exact Modern API right name is UNVERIFIED (backend team) [TO CONFIRM - backend team].
- **What a user without the right sees:** undesigned. The build renders an explicit unspecified-state frame, which is a stand-in, not a design. This is a product decision listed in Still needs sign-off. There is no separate write right: APIs 1 to 4 are reads, and API 5 writes only the user's own view preferences.

---

## Edge cases

1. Org has no fixed assets: API 1 returns zeroes, API 2 returns an empty `groups[]`, API 3 the zero shape; all HTTP 200.
2. Unimplemented dimension selected (the three account values today): API 2 returns an empty `groups[]`; the client renders the placeholder and keeps the controls live so the user can pick a working dimension.
3. Stale or unknown `valueId` (saved preference, or a group deleted mid-session): API 3 returns the well-formed zero shape; the client falls back to the first group.
4. Page past the end, including a set that shrank between calls: clamped to the last page, correct `totalCount` and `totals`, never an error.
5. Non-whitelisted `sortBy`, unknown `valueType`, or `pageSize` outside 1 to 100: HTTP 400 with a named validation error; these are client defects, not data states.
6. Duplicate tag numbers: permitted until proven otherwise [TO CONFIRM - backend team]; the sort order ends in `assetId`, so paging is deterministic regardless.
7. Negative values (salvage above cost, or depreciation exceeding depreciable value): served as real signed numbers; the client plots donut shares by absolute value and shows signed figures in text [BUILD]. No source states whether the data allows this [TO CONFIRM - backend team].
8. Every group totals zero for the selected measure: the donut renders its empty-chart state client-side; API 2's response is unchanged, all groups present with zeroes.
9. Asset with a blank grouping value: belongs to "not assigned", which is returned as a real group, listed last; a blank never widens any selection.
10. Assets acquired or disposed mid-session: no time axis exists, so each call simply reflects the store at its `asOf`; the accepted drift between API 2 and API 3 is recovered by the next interaction or refresh.

---

## Not in scope

- Any write against asset data: the widget is view-only; the only write is the user's own view preferences.
- Drill-through, row click, arc click, or navigation away: none exists in the design.
- Any time, fiscal-year or date-range filter: the figures are current book values; no time axis exists anywhere in the widget.
- A depreciation schedule or value-over-time series: open product question, not in this contract.
- A percent-depreciated measure or replacement-planning signal: raised in the sign-off dossier, unreviewed, not in this contract.
- A Depreciation Method filter: nothing in the real data supports it.
- A server-side export endpoint: the download's scope and mechanism are undecided; when decided, an export API gets added to this contract rather than being improvised client-side.
- The existing type-options and dollar-options endpoints: pre-existing static arrays, unused by this contract; the two enums ship in the client.
- Currency and locale formatting rules: the wire carries plain numbers; localisation behaviour is unspecified in every source and is tracked in the sign-off dossier items.

---

## Still needs sign-off

1. **Default view.** The amended build-requirements handoff says the Donut is the default; the built Final opens on the Asset Detail table. This contract specs the built behaviour, so the initial Explore/Detail load fires API 3. Decider: owner. Blocked until then: the initial-load call sequence; if Donut wins, the API 3 call drops from initial load.
2. **The paged, server-sorted, totalled grid contract is new backend work, unscoped.** Today's grid endpoint returns the full unpaged list with no totals; nothing anywhere serves `totalCount`, `totals`, sort params or paging, and no per-asset salvage value is exposed (nor needed, since the server computes Depreciable Value). Decider: backend team, not yet named. Blocked: API 3 build estimation.
3. **Backend feasibility of the whole read model.** Six groupable dimensions, a dependent group list, and five money measures per asset have never been verified against Shelby's real fixed-asset tables; every register figure in this spec's examples is illustrative mock data. Decider: backend team. Blocked: confidence in APIs 2 and 3 beyond their shapes.
4. **The three account dimensions.** `GetFixedAssetsValuesAsync()` returns an empty list for AssetAccount, AccumDepAccount and ExpenseAccount. Either the backend implements them or the product drops them from the menu. Deciders: backend team and owner. Blocked: whether API 2's enum keeps six values.
5. **Preference persistence mechanism.** The Modern API persists nothing today; this contract's APIs 4 and 5 assume a widget-scoped pair against the legacy store. A shared dashboard preference service may be the right home instead. Decider: backend team. Blocked: APIs 4 and 5 routing, not their payload shape.
6. **Org-wide Total Net Value summation.** No source spells out the compact-tier figure's math; this contract states SUM of per-asset Net Value over company scope as the natural reading. Decider: owner. Blocked: API 1 sign-off.
7. **Default sort, Tag # ascending.** Proposed, never confirmed against the old design. Decider: owner. Blocked: the `sortBy` default only.
8. **Undesigned widget states.** No-rights, loading, error and stale behaviours have no design; the 403/503 rows above state wire shapes only. Decider: design. Blocked: client rendering, not the API shapes.
9. **Download scope and mechanism.** The control exists at Explore and Detail and carries full-precision figures, but whether it exports the page, the group or the whole register, and whether server-side, is undecided. Decider: owner. Blocked: a possible sixth API.
10. **Volume ceilings.** Groups per dimension and assets per group have no cited worst-case anywhere. Decider: backend team, via a live query. Blocked: the BOUNDED verdict on API 2 (a truly unbounded dimension would force a top-N or paged shape).
11. **Sign-off dossier flags, all Unreviewed.** Jo's dossier raises seven flags with no owner-assigned status: a richer compact-tier figure set, per-group comparison and chart-form preference, a percent-depreciated measure, the fate of the legacy "None" grouping option versus the built "not assigned" group, a hardcoded-currency localisation defect verified live, values-as-text and empty-state expectations, and open questions on backing tables and useful-life data. Decider: owner assigns Accepted / Rejected / Disputed per flag. Blocked: the parts each flag touches, most directly API 1's field set and API 2's group naming.
12. **Widget purpose and depreciation-curve questions.** Whether the widget tracks total value or flags assets needing attention, and whether a value-over-time curve belongs on it, are open product questions. Decider: product. Blocked: nothing in this contract, but an attention-flagging answer would add fields to API 3.
