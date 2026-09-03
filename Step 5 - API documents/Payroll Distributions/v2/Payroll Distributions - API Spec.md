# Payroll Distributions - API Spec

**Status: DRAFT - not final**

## Overview

The widget answers one question: where did payroll go for the chosen time span? It shows total cash payroll paid over a selected window, grouped by the org's own compensation-distribution labels, filterable by a single pay type, viewable as a sortable table or a donut chart, with a nested in-widget drill from a distribution to the employees paid in it and from an employee to that person's pay types. Access to the employee level is limited to users with payroll permission; everyone else sees distribution and pay-type totals only.

This contract defines four APIs: a distribution lookup fired once for the filter chip (API 1), a bounded summary read at distribution-by-pay-type grain fired on render and on every period change (API 2), a paginated, permission-gated employee list fired when a distribution is drilled into (API 3), and a server-side export that streams a file over the full filtered set (API 4). The pay-type filter and every view, sort and rollup of the summary run client-side over API 2's bounded rows; everything touching the employee list runs server-side because that list paginates.

## Design → API coverage

| Design element | Type | API | Field(s) | Provenance |
|---|---|---|---|---|
| Glance headline (total payroll paid) | KPI | API 2 | client sum of `rows[].amount` | DERIVED client [BUILD] |
| Header total + context line | KPI / state | API 2 (API 3 when a distribution is drilled) | client sum of `rows[].amount`; drill scope uses `totalAmount` | DERIVED client [BUILD] |
| Period chip (presets + custom dates) | filter | API 2, 3, 4 | `window.from`, `window.to` echo the resolved span | DERIVED server [BUILD] |
| Distribution chip option list | filter | API 1 | `distributions[].distributionId`, `distributions[].name` | STORED [CODE] |
| Pay type chip option list | filter | API 2 | derived client-side from `rows[].subType`, `rows[].subTypeName` where amount > 0 | STORED + DERIVED client [BUILD] |
| Table: Distribution column | table column | API 2 | `rows[].distributionName` | STORED [CODE] |
| Table: Amount column | table column | API 2 | client rollup of `rows[].amount` by distribution | DERIVED client [BUILD] |
| Table: % of total column | table column | API 2 | client division, distribution amount over grand total | DERIVED client [BUILD] |
| Table sort headers (Distribution / Amount) | interaction | API 2 | client re-order of the bounded row set | DERIVED client [BUILD] |
| Donut chart (arcs, legend, center total) | chart series | API 2 | `rows[].distributionName`, client rollups of `rows[].amount` | DERIVED client [BUILD] |
| Drill: employee rows (name, total pay) | drill | API 3 | `employees[].employeeName`, `employees[].totalAmount` | UNVERIFIED columns, see schema [DOC] |
| Drill: row identity / expand key | drill | API 3 | `employees[].employeeId` | UNVERIFIED, see schema [DOC] |
| Drill: employee pay-type leaf (name, share of pay, amount) | drill | API 3 | `employees[].payTypes[]` (`subType`, `subTypeName`, `amount`); share is a client division | STORED + DERIVED [CODE] [DOC] |
| Drill caption (employee count, distribution total) | state | API 3 | `totalCount`, `totalAmount` | DERIVED server [BUILD] |
| Drill sort headers (Employee / Total pay) | interaction | API 3 | `sortBy` + `sortDir` params (paginated list, server sort) | DERIVED server |
| Pay-type fallback table (viewer without payroll permission picks a distribution) | state | API 2 | client filter of `rows[]` to that `distributionId` | DERIVED client [BUILD] |
| Empty state: "No payroll runs in this range" | state | API 2 | empty `rows[]` | DERIVED client [BUILD] |
| Empty state: "Nothing matches these filters" | state | API 2 / API 3 | zero client-filtered rows, or empty `employees[]` with `totalCount` 0 | DERIVED client [BUILD] |
| Export to Excel button (caption row) and card-menu CSV / Excel / PDF exports | action | API 4 | file stream, no JSON fields | NEW |
| Refresh | action | API 2 (+ API 3 for any open drill) | same fields, fresh `asOf` | DERIVED [BUILD] |

Every response field below appears in a row above or in the ignore set of request echoes (`asOf`, `page`, `pageSize`). The drill's share-of-pay bars and the % of total column are client-side derivations and appear in *Where computation lives*.

## Tables

| Table / repository | Fields and members used |
|---|---|
| `PR_HistoryCompensation` | `HistoryCompensationID` (row id), `HistoryID` (joins to `PR_History`), `CompensationDistributionID` (joins to `PR_CompensationDistribution`), `Amount`, `SubType` (pay-type code 1-10). `Hours`, `Rate`, `PayCycle`, `EmployeeCompensationID`, `WorkersCompID`, `ProjectID` exist on the same rows and are NOT read by this contract |
| `PR_CompensationDistribution` | `CompensationDistributionID`, `Name` (the org-defined distribution label) |
| `PR_History` | `CheckDate` (window filter), `CheckType`, `VoidJournalID`, `CompanyID` (scoping), and its link to the employee record for API 3 |
| `PR_Employee` | The person behind each check, for API 3 only: key column and display-name column [TO CONFIRM] (backend dev; the join itself is evidenced in the Pay Type Breakdown Analysis proof file) |
| `PR_Company` | Org-configured pay-type labels for SubType 6-9 (`VacationLongName`/`VacationShortName`, `SickLongName`/`SickShortName`, `PersonalLongName`/`PersonalShortName`, `MiscLongName`/`MiscShortName`), resolved server-side |

No new tables and no schema changes: everything in this contract is new queries against existing tables and columns, per the Pay Type Breakdown Analysis proof file in this widget's folder.

Core formulas and filters, quotable in isolation:

- **Row filter on every read:** `PR_History WHERE CompanyID = ctx AND CheckDate BETWEEN from AND to AND VoidJournalID IS NULL AND CheckType <> 2`. [CODE] (legacy `PayrollDistributions.Search()`, mirrored by the modern data endpoint per `Widget_Comparison_Classic.html`)
- **Summary grain:** `SUM(PR_HistoryCompensation.Amount) GROUP BY CompensationDistributionID, SubType` over the filtered checks. The distribution grouping is the live query today [CODE]; adding `SubType` to the GROUP BY is a query change over the same rows, no schema change [DOC] (proof file, levels 2 and 4 are the same table).
- **Employee grain (API 3):** the same filtered rows for one `CompensationDistributionID`, grouped by employee, with a nested `SUM(Amount) GROUP BY SubType` per employee. NEW query; the joins are evidenced [DOC] (proof file, level 3).
- **Pay-type display names:** codes 1-5 and 10 are fixed; codes 6-9 resolve server-side from `PR_Company` via `PRHistoryCompensation.GetSubTypeName` / `GetSubTypeNameLong`. [CODE] (`Shelby.Data\EntityClassExtensions\PRHistoryCompensation.cs`)
- **Non-cash compensation is excluded** everywhere: benefit items flow through `PR_HistoryNonCash` and never enter distribution totals. [DOC] (proof file, Additional Findings)

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Data endpoint | `GET /api/dashboard/payroll-distributions/data?startDate&endDate` returns a bare flat list `{Name, Amount}`, one row per distribution [CODE] | Same path. `window`/`from`/`to`/`asOf` replace the raw date pair; the response gains an envelope (`asOf` + resolved `window` + `rows[]`) and the rows move to distribution-by-pay-type grain with `distributionId` and `subType`/`subTypeName` added. Re-shaped read over existing columns (STORED + DERIVED) |
| Stable row key | None: rows carry only the org-editable `Name` | `distributionId` (`CompensationDistributionID`) exposed on every row. STORED, new exposure |
| Pay-type dimension | `SubType` is an unread column on the same rows | Read and grouped. STORED, query change only |
| Filter option list | None (no filter exists) | NEW `filters` endpoint returning the org's distribution list, matching the `/filters` pattern the other dashboard widgets already use [CODE] |
| Employee drill | None | NEW paginated endpoint, one distribution's employees with per-employee pay-type rollups, permission-gated |
| Export | Legacy exported Excel in-page; the modern API has no export endpoint [CODE] | NEW export endpoint streaming CSV / Excel / PDF over the full filtered set |
| Sort | Fixed `ORDER BY Name` [CODE] | Distribution table: client-side re-order (bounded set). Employee list: server-side `sortBy`/`sortDir` (paginated set). NEW params on API 3 only |
| Comparison | None | Still none. Sign-off finding F3 rejected prior-period comparison for this widget: no `prior`, `diffAmount` or `diffPct` fields exist anywhere in this contract |

## API inventory

| API | Purpose | Trigger (when it fires) | Cardinality | R/W | Cache posture | Split trigger |
|---|---|---|---|---|---|---|
| API 1: distribution filter options | Option list for the Distribution chip | Widget render, once per session | One row per org distribution, [TO CONFIRM] ceiling (Feargal) | R | TTL (dev to set; staleness shows only as a just-added distribution missing until refresh) | Lifetime gap: a rarely-changing lookup vs live payroll data; also the codebase's established `/filters` pattern |
| API 2: distribution summary | Distribution-by-pay-type amounts for the window; feeds every non-drill element | Render, period change, refresh | Bounded: distributions x at most 10 SubType codes | R | LIVE per request (the legacy widget is explicitly uncached [CODE]) | Base read. Cardinality gap vs API 3: the summary must never pay for the employee list |
| API 3: employees in a distribution | Paginated employee rows with per-employee pay-type rollups | User expands a distribution row or picks one on the Distribution chip (payroll-permission holders only) | Unbounded page stream, [TO CONFIRM] worst case (Feargal) | R | LIVE per request | Trigger gap (fires on drill, not render) + cardinality gap (unbounded list) + conditional weight (permission-gated, most sessions never fire it) |
| API 4: export | Streams CSV / Excel / PDF of what the filters resolve to, over the full filtered set | User clicks Export to Excel or a card-menu export item | One file | R | LIVE per request | Trigger gap + conditional weight: a heavy file build on explicit user action only. Server-side because the client never holds the full employee set once API 3 paginates |

Merges considered and closed: API 1 and API 2 always fire together on first render and could be one call, but the lookup is shared-shape, cacheable and org-stable while the data is live, so the lifetime gap wins and they stay separate. API 3 is not a variant of API 2 because a summary consumer must never pay for employee rows it cannot see without the payroll right.

## Call sequence

| Interaction | Calls fired | Notes |
|---|---|---|
| Initial widget load | API 1 + API 2 | Fired together; API 2's echoed `asOf` becomes the anchor the client passes to every later call in this view |
| Change Period (preset or custom dates) | API 2; plus API 3 for any open drill | Same `asOf` anchor; both calls carry the identical window params so the drill total still cross-foots to its summary row |
| Change Distribution chip to one distribution | API 3 (payroll-permission holders); no call otherwise | Without the right, the client filters API 2's rows to that distribution's pay types. Open drill carets are cleared on any filter change |
| Change Distribution chip back to All | none | Client re-render over API 2's rows, already held |
| Change Pay type chip | none | Client re-aggregation of API 2's rows; open drills are closed, so no API 3 refetch. The next drill open carries `ptSubType` |
| Switch view (Table / Chart) | none | Client re-render of the same rows |
| Expand a distribution row (nested drill) | API 3, page 1 | Permission-gated; an unauthorised viewer's rows are inert and no call path exists |
| Expand an employee row | none | That person's `payTypes[]` is already in the API 3 row |
| Sort the employee list / change its page | API 3 | `sortBy`/`sortDir`/`page`: server-side, the list paginates |
| Sort the distribution table | none | Client re-order of the bounded summary rows |
| Export | API 4 | Carries the same window, distribution and pay-type params the view resolves to, plus `format` |
| Refresh | API 2 with a fresh `asOf`; plus API 3 for any open drill | The new echoed `asOf` replaces the anchor everywhere at once, so the header and an open drill can never straddle a payroll posting |

Shared snapshot anchor: API 2 and API 3 must reconcile on screen (a distribution's summary amount vs the sum of its employees). Both take `asOf`, both echo it, and the client passes API 2's echoed value to every API 3 and API 4 call rendered beside it.

## Filter architecture

| Filter | Option source | Cardinality | Execution | Aggregate effect | Cascade | "All" wire form | Round trips |
|---|---|---|---|---|---|---|---|
| Period | STATIC enum: `this_month`, `this_period`, `this_quarter`, `this_year`, `all_time`, plus `custom` with `from`/`to` dates | 6 | SERVER: `window` (+ `from`/`to` when custom, `asOf` anchor) | Yes: every figure on screen | No | None: a window is always sent; `all_time` is the no-lower-bound value | 1 (API 2), +1 per open drill (API 3) |
| Distribution | LOOKUP: API 1 (`PR_CompensationDistribution` for the company) | Demo dataset 8; real ceiling [TO CONFIRM] (Feargal) | SERVER for one distribution: `distributionId` path param on API 3. CLIENT for All: the full summary set is already present in API 2's response and bounded (see Volume) | One distribution: yes, the header total becomes API 3's `totalAmount`. Back to All: no, API 2 carries no server-computed aggregates to disagree with | No: the option list does not depend on other filters and may include distributions with no data in the window (selecting one yields a well-formed empty drill) | Omit `distributionId` entirely; the summary is always the full set | 1 (API 3) into a distribution; 0 back to All |
| Pay type | DERIVED from API 2's response: only `subType` values with amount > 0 in the window are offered | At most 10, fixed by definition (SubType codes 1-10) | CLIENT over API 2: full set already present, bounded by definition at 10 codes per distribution, and no server-computed aggregate is affected because API 2 returns no totals. SERVER on API 3: `ptSubType`, because that list paginates | Summary view: no server aggregate exists to change. Drill: yes, `totalAmount`/`totalCount` recompute server-side under the filter | Yes, on Period: the option list is re-derived from each new API 2 response, so a stale selection can survive a period change; the client resets a selection whose `subType` vanishes from the new response to All | Omit `ptSubType` | 0 (open drills are closed on change; the next drill open carries the param) |

- **Combination semantics:** AND, narrowing, across all three filters. No pair is OR and none are mutually exclusive.
- **Conflict rule:** a `distributionId` that does not belong to the company returns HTTP 404 with the error body below, never another company's data. `ptSubType` outside 1-10 is HTTP 400. `window=custom` requires both `from` and `to`; a date pair sent with any other window value is HTTP 400 (never silently ignored); `from` greater than `to` is HTTP 400, never silently swapped.
- **Overlapping value spaces:** a valid Distribution + Pay type pair can legitimately match nothing (a distribution that never pays that type in the window). That is a well-formed empty result (`employees` empty, `totalCount` 0, `totalAmount` 0), not an error; the client renders its "Nothing matches these filters" state.
- **Blank values:** `CompensationDistributionID` rows whose distribution record was deleted are dropped by the inner join today [CODE], so "All distributions" does not include them; that silent drop is flagged in *Still needs sign-off*, not silently accepted. Whether `SubType` can be null or zero on real rows is [TO CONFIRM] (backend dev); if it can, such lines must be returned under an explicit "Unclassified" code, never treated as matching a specific pay-type filter.
- **Cascade invalidation:** only the Pay type list cascades (from the Period, via the response). Rule above: a selection absent from the new response resets to All client-side.

Error body convention, matching the Budget Compared to Actual spec:

```json
{
  "error": "invalidCustomRange",
  "message": "window=custom requires both from and to, with from <= to"
}
```

## Volume and performance

| Dataset | Typical rows | Worst realistic rows (basis) | Row width | Payload at worst | Verdict | Server cost model | Cache posture |
|---|---|---|---|---|---|---|---|
| API 1 distribution list | 8 (build demo dataset) | [TO CONFIRM] (Feargal): an org-defined lookup; the legacy widget loads the full set today with no cap [CODE] | 2 fields, ~80 B | Tens of KB at most | BOUNDED | Single indexed scan of `PR_CompensationDistribution` by `CompanyID` | TTL (dev to set); the response `asOf` is not carried here, staleness only delays a new label |
| API 2 summary rows | ~40 (build demo dataset: 8 distributions x 4-6 pay types each) | Distribution ceiling [TO CONFIRM] (Feargal) x at most 10 SubType codes, fixed by definition; at 100 distributions that is 1,000 rows | 5 fields, ~120 B | ~120 KB at 1,000 rows | BOUNDED | One scan of `PR_HistoryCompensation` joined to `PR_History` filtered by `CompanyID` + `CheckDate` range, GROUP BY distribution + SubType | LIVE per request, matching the legacy widget's explicit no-caching behaviour [CODE] |
| API 3 employee page | 3-7 employees per distribution (build demo dataset, a fixture property, not a ceiling) | [TO CONFIRM] (Feargal): all employees paid in one distribution in the window at the largest org | ~5 fields + up to 10 nested pay-type rows, ~400 B | ~80 KB per page at the 200 maximum | MUST PAGINATE | Same filtered scan restricted to one `CompensationDistributionID`, GROUP BY employee with a nested SubType rollup; one query, no per-row subqueries | LIVE per request |
| API 4 export | One file over the current scope | The full filtered set behind the current view, unpaginated; same [TO CONFIRM] ceilings as above | n/a (file) | File download, streamed | MUST AGGREGATE SERVER-SIDE | The API 2 or API 3 query without pagination, plus file rendering; PDF rendering is the heavy path and is priced by the dev team | LIVE per request |

The built Final performs every drill, sort and rollup instantly client-side because its demo dataset is small and its employee rows are generated in the page; that is a property of the fixture. The pay-type axis is bounded by definition (10 codes) so it stays client-side; the employee axis is bounded only by org size, so it moves to the server, and this contract says so instead of mirroring the mock.

### Pagination contract

Applies to API 3's `employees[]` array; nothing else paginates.

- **Params:** `page` (1-based, default 1) and `pageSize` (default 50, maximum 200; requests above the maximum are clamped, not errored).
- **What paginates:** exactly the `employees[]` array.
- **What does not:** `totalAmount` and `totalCount` compute over the full filtered set, never the page. Switching pages changes no total, no caption figure, no chart and no header number.
- **Sort params:** `sortBy` whitelist is `totalAmount` and `employeeName`; `sortDir` is `asc` or `desc`; default `totalAmount` + `desc`, matching the built table's default order.
- **Deterministic total order:** every sort ends in `employeeId` ascending as the unique tiebreaker, so pages never skip or duplicate an employee.
- **`totalCount`** is returned beside every page, with `page` and `pageSize` echoed.
- **Past the last page:** empty `employees[]`, correct `totalCount` and `totalAmount`, HTTP 200, not an error.

## Where computation lives

| Value | Server or client | Basis | Why |
|---|---|---|---|
| Grand total (header, Glance, donut center) | Client | Sum over API 2 `rows[].amount` | Pure arithmetic over a bounded set the client fully holds |
| Per-distribution amount (table rows, donut arcs) | Client | Rollup of API 2 rows by `distributionId` | Same bounded set |
| % of total per distribution row and donut legend share | Client | Distribution amount over grand total | Pure division over values already present; a zero grand total renders as 0 (the empty state shows instead, since zero rows are never sent) |
| Pay-type filter application on the summary | Client | Restrict the rollups to one `subType` | Bounded by definition (10 codes); no server aggregate exists to disagree with |
| Pay-type option list | Client | Distinct `subType` with amount > 0 in API 2's rows | Derivation from the held response |
| Distribution table sort | Client | Re-order of the bounded rows | Full set present |
| Drill `totalAmount` and `totalCount` | Server | Full filtered employee set | The client only ever holds one page |
| Employee list order | Server | `sortBy`/`sortDir` + `employeeId` tiebreaker | Paginated set; client-side sort of a page would be a defect |
| Employee share-of-pay per pay-type leaf | Client | `payTypes[].amount` over that employee's `totalAmount` | Both values sit in the same row; a zero denominator renders 0 |
| Captions and context line text | Client | String assembly from held values | Presentation |
| Window resolution (preset to concrete dates) | Server | `window` + `asOf` to `window.from`/`window.to` | One authority for what "this_quarter" means; the client renders the echo |
| Deltas / comparison values | Neither server nor client | None exist | Sign-off finding F3 rejected comparison for this widget |

No API in this contract returns a server-computed percentage, so no server division-by-zero rule is needed; every percentage is a client division with a stated render-0 rule. No deltas exist to pre-sign. No presentation thresholds exist awaiting approval.

## API 1: distribution filter options

### Endpoint

```
GET /api/dashboard/payroll-distributions/filters
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| (none) | - | - | - | - | The list is scoped entirely by the company context header |

Company scoping: the `X-Company-ID` header, as on every dashboard endpoint.

### Example requests

```
GET /api/dashboard/payroll-distributions/filters
GET /api/dashboard/payroll-distributions/filters   (identical; there is nothing to vary but the company header)
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `distributions[]` | array | STORED `PR_CompensationDistribution` [CODE] | One entry per distribution defined by the org, name-ascending |
| `distributions[].distributionId` | guid | STORED `PR_CompensationDistribution.CompensationDistributionID` [CODE] | Stable key; the drill and export param |
| `distributions[].name` | string | STORED `PR_CompensationDistribution.Name` [CODE] | Org-defined free-text label (live-verified examples: "AA Aid", "Administration Staff") |

### Example response

```json
{
  "distributions": [
    { "distributionId": "1a7c3e59-4b2d-4f8a-9e6c-0d3f5a7b9c1e", "name": "AA Aid" },
    { "distributionId": "6f2a9c41-8b3d-4e7a-9c1f-2d5b8e0a3f74", "name": "Administration Staff" },
    { "distributionId": "3c5e7a90-1d2f-4b6c-8a4e-9f0b2c4d6e81", "name": "Facilities" },
    { "distributionId": "8d0f2b46-3a5c-4d7e-b1f9-4c6e8a0b2d53", "name": "Pastoral Staff" }
  ]
}
```

The list carries no figures, so there is no arithmetic to prove; the ids here are the same ids used in the API 2 and API 3 examples below.

### State contracts

| State | Response |
|---|---|
| Empty (org has no distributions) | `{ "distributions": [] }`, HTTP 200; the chip renders with only "All distributions" |
| Partial | Not applicable: the list has no time dimension |
| Not-yet-existing entity | Not applicable: no id is passed in |
| Permission denied | HTTP 403 with the error body convention; the widget itself is not offered to users without the payroll module read right |
| Upstream unavailable | HTTP 503 with the error body convention; the client keeps the last-rendered list and shows its error banner |

## API 2: distribution summary

### Endpoint

```
GET /api/dashboard/payroll-distributions/data
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `window` | enum | yes | `this_month`, `this_period`, `this_quarter`, `this_year`, `all_time`, `custom` | none; the built default selection is `this_month` | `this_month` = calendar month containing `asOf`, to `asOf`. `this_period` = the org's current fiscal period, [TO CONFIRM] (Feargal; payroll has no fiscal-period concept in code, only `CheckDate` [CODE]). `this_quarter` = rolling, the 3 months back from `asOf`. `this_year` = rolling, the 12 months back from `asOf`. `all_time` = no lower bound, everything through `asOf`. `custom` = the `from`/`to` pair |
| `from` | date | only when `window=custom` | any valid date | none | Inclusive range start; rejected with HTTP 400 when sent with any other window |
| `to` | date | only when `window=custom` | any valid date, `>= from` | none | Inclusive range end; same rejection rule |
| `asOf` | date | no | any valid date | today (server date) | Anchors the five preset windows and is echoed back; ignored when `window=custom`. A historical `asOf` reproduces a past reading exactly |

Company scoping: the `X-Company-ID` header. Row selection is `PR_History.CheckDate` inside the resolved window, with the consistency filters in *Tables* always applied.

### Example requests

```
GET /api/dashboard/payroll-distributions/data?window=this_month&asOf=2026-07-27
GET /api/dashboard/payroll-distributions/data?window=custom&from=2025-07-01&to=2026-06-30
```

No URL-encoding is needed: every value is an enum token, a date, or a guid.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | date | DERIVED (request echo, server-defaulted) | The anchor this response was computed at; the client passes it to API 3 and API 4 |
| `window` | object | DERIVED (server window resolution) | The concrete span the enum resolved to |
| `window.from` | date | DERIVED as above | Inclusive resolved start |
| `window.to` | date | DERIVED as above | Inclusive resolved end |
| `rows[]` | array | DERIVED (container; provenance sits on its child rows) | One row per distribution + pay type pair with a non-zero sum; zero rows are never sent |
| `rows[].distributionId` | guid | STORED `PR_HistoryCompensation.CompensationDistributionID` [CODE] | Stable key; names are org-editable |
| `rows[].distributionName` | string | STORED `PR_CompensationDistribution.Name` [CODE] | Resolved at query time, so history reports under the current label |
| `rows[].subType` | int | STORED `PR_HistoryCompensation.SubType` [CODE] | Pay-type code 1-10 |
| `rows[].subTypeName` | string | DERIVED server, `GetSubTypeNameLong` over `PR_Company` labels [CODE] | Display name; codes 6-9 are org-configured, the client never hardcodes them |
| `rows[].amount` | number | DERIVED `SUM(PR_HistoryCompensation.Amount)` [CODE] | Sum for that distribution + pay type in the window |

### Example response

```json
{
  "asOf": "2026-07-27",
  "window": { "from": "2026-07-01", "to": "2026-07-27" },
  "rows": [
    { "distributionId": "1a7c3e59-4b2d-4f8a-9e6c-0d3f5a7b9c1e", "distributionName": "AA Aid", "subType": 1, "subTypeName": "Regular", "amount": 560.00 },
    { "distributionId": "6f2a9c41-8b3d-4e7a-9c1f-2d5b8e0a3f74", "distributionName": "Administration Staff", "subType": 1, "subTypeName": "Regular", "amount": 4199.27 },
    { "distributionId": "6f2a9c41-8b3d-4e7a-9c1f-2d5b8e0a3f74", "distributionName": "Administration Staff", "subType": 2, "subTypeName": "OverTime", "amount": 174.00 },
    { "distributionId": "6f2a9c41-8b3d-4e7a-9c1f-2d5b8e0a3f74", "distributionName": "Administration Staff", "subType": 6, "subTypeName": "Vacation", "amount": 157.36 },
    { "distributionId": "3c5e7a90-1d2f-4b6c-8a4e-9f0b2c4d6e81", "distributionName": "Facilities", "subType": 1, "subTypeName": "Regular", "amount": 1843.75 },
    { "distributionId": "3c5e7a90-1d2f-4b6c-8a4e-9f0b2c4d6e81", "distributionName": "Facilities", "subType": 2, "subTypeName": "OverTime", "amount": 275.00 }
  ]
}
```

Reconciliation: 4,199.27 + 174.00 + 157.36 = 4,530.63 (the Administration Staff distribution total the client rolls up, matching the proof file's live figure) and 1,843.75 + 275.00 = 2,118.75 (Facilities); grand total 560.00 + 4,530.63 + 2,118.75 = 7,209.38, the header, Glance and donut-center number.

### State contracts

| State | Response |
|---|---|
| Empty (no checks in the window) | `{ "asOf": ..., "window": ..., "rows": [] }`, HTTP 200; the client renders "No payroll runs in this range" with the chips still live |
| Partial (window extends past the data) | Normal response over whatever checks exist; no flag, by design: a short history is not an error |
| Not-yet-existing entity | Not applicable: no id is passed in |
| Permission denied | HTTP 403 with the error body convention; the widget is not offered to users without the payroll module read right, so this only arises on a revoked session |
| Upstream unavailable | HTTP 503 with the error body convention; the client shows its error banner and keeps the chips live |

## API 3: employees in a distribution

### Endpoint

```
GET /api/dashboard/payroll-distributions/{distributionId}/employees
```

Requires the payroll permission right (see *Auth and scoping*). This endpoint is the production replacement for the mock's in-page employee generation: the built drill derives employees deterministically from totals because a fixture has no people in it; production reads the real rows this response defines.

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `window` | enum | yes | as API 2 | none; the client passes its current period selection | Identical semantics and validation to API 2 |
| `from` | date | only when `window=custom` | any valid date | none | As API 2 |
| `to` | date | only when `window=custom` | any valid date, `>= from` | none | As API 2 |
| `asOf` | date | no | any valid date | today (server date) | The client passes API 2's echoed value so the two responses cannot straddle a posting |
| `ptSubType` | int | no | 1-10 | omitted (all pay types) | Restricts the nested `payTypes[]` rows and every total to one pay type; employees with nothing left are excluded |
| `page` | int | no | `>= 1` | 1 | 1-based page over `employees[]` |
| `pageSize` | int | no | 1-200 | 50 | Clamped at 200 |
| `sortBy` | enum | no | `totalAmount`, `employeeName` | `totalAmount` | Whitelisted sort field; always tiebroken by `employeeId` ascending |
| `sortDir` | enum | no | `asc`, `desc` | `desc` | Applies to `sortBy` |

Company scoping: the `X-Company-ID` header. The `{distributionId}` path segment must belong to that company or the call is HTTP 404.

### Example requests

```
GET /api/dashboard/payroll-distributions/6f2a9c41-8b3d-4e7a-9c1f-2d5b8e0a3f74/employees?window=this_month&asOf=2026-07-27&page=1&pageSize=50&sortBy=totalAmount&sortDir=desc
GET /api/dashboard/payroll-distributions/6f2a9c41-8b3d-4e7a-9c1f-2d5b8e0a3f74/employees?window=this_month&asOf=2026-07-27&ptSubType=2
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | date | DERIVED (request echo) | Must equal the API 2 echo rendered beside it |
| `window` | object | DERIVED (server window resolution) | As API 2 |
| `window.from` | date | DERIVED as above | Inclusive resolved start |
| `window.to` | date | DERIVED as above | Inclusive resolved end |
| `distributionId` | guid | STORED `PR_CompensationDistribution.CompensationDistributionID` [CODE] | Echo of the path segment |
| `distributionName` | string | STORED `PR_CompensationDistribution.Name` [CODE] | Current label |
| `totalAmount` | number | DERIVED `SUM(Amount)` over the FULL filtered employee set [DOC] | Never the page. Cross-foots to the client rollup of API 2's rows for this distribution under the same window, pay-type filter and `asOf` |
| `totalCount` | int | DERIVED count over the full filtered set | Employee count for the caption and the pager |
| `page` | int | DERIVED (request echo) | 1-based |
| `pageSize` | int | DERIVED (request echo, clamped) | Effective page size |
| `employees[]` | array | DERIVED (container; provenance sits on its child rows) | One page of employees, ordered per `sortBy`/`sortDir` + `employeeId` |
| `employees[].employeeId` | guid | UNVERIFIED (backend dev to confirm the `PR_Employee` key column) [DOC] | Stable row key and pagination tiebreaker |
| `employees[].employeeName` | string | UNVERIFIED (backend dev to confirm the display-name column behind the proof file's `PR_Employee` join) [DOC] | Last-comma-first display name |
| `employees[].totalAmount` | number | DERIVED `SUM(Amount)` for that employee in this distribution and window [DOC] | Under `ptSubType`, only that pay type's lines are summed |
| `employees[].payTypes[]` | array | DERIVED (container; provenance sits on its child rows) | That person's pay-type rollup; at most 10 entries, filtered by `ptSubType` when sent |
| `employees[].payTypes[].subType` | int | STORED `PR_HistoryCompensation.SubType` [CODE] | Pay-type code |
| `employees[].payTypes[].subTypeName` | string | DERIVED server, `GetSubTypeNameLong` [CODE] | Display name, org labels resolved |
| `employees[].payTypes[].amount` | number | DERIVED `SUM(Amount)` [DOC] | Sums exactly to the employee's `totalAmount` |

### Example response

```json
{
  "asOf": "2026-07-27",
  "window": { "from": "2026-07-01", "to": "2026-07-27" },
  "distributionId": "6f2a9c41-8b3d-4e7a-9c1f-2d5b8e0a3f74",
  "distributionName": "Administration Staff",
  "totalAmount": 4530.63,
  "totalCount": 3,
  "page": 1,
  "pageSize": 50,
  "employees": [
    {
      "employeeId": "9b1e5d73-2c4a-4f6b-8d0e-1a3c5e7f9b2d",
      "employeeName": "Aarons, Mike",
      "totalAmount": 2084.00,
      "payTypes": [
        { "subType": 1, "subTypeName": "Regular", "amount": 1984.00 },
        { "subType": 6, "subTypeName": "Vacation", "amount": 100.00 }
      ]
    },
    {
      "employeeId": "4e8a2c60-7d1f-4b3e-9a5c-6f0d2b4e8a1c",
      "employeeName": "Smith, Jane",
      "totalAmount": 1501.00,
      "payTypes": [
        { "subType": 1, "subTypeName": "Regular", "amount": 1327.00 },
        { "subType": 2, "subTypeName": "OverTime", "amount": 174.00 }
      ]
    },
    {
      "employeeId": "7c3f9e15-8b2d-4a6c-b0e4-2d5f7a9c1e3b",
      "employeeName": "Brown, Tom",
      "totalAmount": 945.63,
      "payTypes": [
        { "subType": 1, "subTypeName": "Regular", "amount": 888.27 },
        { "subType": 6, "subTypeName": "Vacation", "amount": 57.36 }
      ]
    }
  ]
}
```

Reconciliation: 2,084.00 + 1,501.00 + 945.63 = 4,530.63, so the employees sum to `totalAmount`, which itself matches API 2's Administration Staff rows for the same window and `asOf`: 4,199.27 + 174.00 + 157.36 = 4,530.63. Per pay type across employees: 1,984.00 + 1,327.00 + 888.27 = 4,199.27 (Regular) and 100.00 + 57.36 = 157.36 (Vacation), each matching its API 2 row; OverTime is Smith's single 174.00 line, matching its API 2 row.

The second example request (`ptSubType=2`) returns only Smith, Jane with `totalAmount` 174.00, one `payTypes[]` entry (OverTime, 174.00), `totalCount` 1, and the same window echo: a pay-type filter changes amounts and membership everywhere, server-side, because this list paginates.

### State contracts

| State | Response |
|---|---|
| Empty (no employee paid in this distribution in the window, or none left under `ptSubType`) | `employees` empty, `totalCount` 0, `totalAmount` 0, HTTP 200; the client renders "Nothing matches these filters" naming the combination |
| Partial (window extends past the data) | Normal response over the checks that exist |
| Not-yet-existing entity (unknown or foreign `distributionId`) | HTTP 404 with the error body convention; the client treats it as a vanished drill and returns to All distributions |
| Permission denied (no payroll permission right) | HTTP 403 with the error body convention. The client never calls this endpoint for such users: distribution rows render inert with no drill affordance, and a chosen distribution falls back to its pay-type rows from API 2 |
| Upstream unavailable | HTTP 503 with the error body convention; the drill panel shows the error, the summary above it stays rendered |

## API 4: export

### Endpoint

```
GET /api/dashboard/payroll-distributions/export
```

Streams a file (`Content-Disposition: attachment`); there is no JSON response schema. The file's rows are whatever the parameters resolve to, over the FULL filtered set, never a page: with no `distributionId`, one row per distribution with its pay-type amounts; with a `distributionId` and the payroll permission right, that distribution's employees with their pay-type rollups (the API 3 set, unpaginated); with a `distributionId` and no payroll right, that distribution's pay-type totals only. The served scope is decided server-side from the caller's rights, so a crafted request cannot widen it.

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `format` | enum | no | `csv`, `xlsx`, `pdf` | `xlsx` | The caption-row button sends `xlsx`; the card-menu items send their own format |
| `window` | enum | yes | as API 2 | none; the client passes its current period selection | Identical semantics and validation to API 2 |
| `from` | date | only when `window=custom` | any valid date | none | As API 2 |
| `to` | date | only when `window=custom` | any valid date, `>= from` | none | As API 2 |
| `asOf` | date | no | any valid date | today (server date) | The client passes API 2's echoed value so the file matches the screen |
| `distributionId` | guid | no | a company distribution id | omitted (all distributions) | Scopes the file as described above |
| `ptSubType` | int | no | 1-10 | omitted (all pay types) | Restricts the file's pay-type columns and totals |

Company scoping: the `X-Company-ID` header.

### Example requests

```
GET /api/dashboard/payroll-distributions/export?format=xlsx&window=this_month&asOf=2026-07-27
GET /api/dashboard/payroll-distributions/export?format=csv&window=this_month&asOf=2026-07-27&distributionId=6f2a9c41-8b3d-4e7a-9c1f-2d5b8e0a3f74&ptSubType=2
```

### Response schema

No JSON schema: the response is a file stream. Column content mirrors the API 2 and API 3 schemas above, with the same provenance; the file carries the resolved window and `asOf` in its header rows so a saved file is self-describing.

### State contracts

| State | Response |
|---|---|
| Empty (nothing matches) | A valid file with header rows and zero data rows, HTTP 200 |
| Partial | A valid file over the checks that exist |
| Not-yet-existing entity (unknown `distributionId`) | HTTP 404 with the error body convention, no file |
| Permission denied | Never a 403 for the totals scope (any widget viewer may export what they can see); an employee-scope request without the payroll right is served the pay-type-totals file for that distribution instead, mirroring what that viewer's screen shows |
| Upstream unavailable | HTTP 503 with the error body convention, no partial file |

## Auth and scoping

- **Company / tenant scoping:** every endpoint reads the `X-Company-ID` context header, and every query is scoped by `CompanyID` under it. [CODE] (the modern dashboard convention per `Widget_Comparison_Classic.html`)
- **Widget read right:** the legacy widget is gated by the `/Payroll` access URI at Inquiry level [CODE]; the modern equivalent right for APIs 1, 2 and 4 is [TO CONFIRM] (backend dev). A user without it does not see the widget at all (the legacy pattern hides ungated widgets from the picker and hides the body if placed [CODE]).
- **Employee-level right (APIs 3, and API 4's employee scope):** access to per-person pay is limited to users with payroll permission [SME] (Feargal, 2026-08-25 call). The exact right name / URI and level are [TO CONFIRM] (Feargal + backend dev). A reader without it gets HTTP 403 from API 3, never sees a drill affordance, and their exports contain totals only.
- **No writes:** every API in this contract is read-only; there is no write right to define.

## Edge cases

1. **Empty window:** zero checks in range returns an empty `rows[]` (API 2) with HTTP 200; the client's grand total is 0 and the empty state renders with the chips live.
2. **Filter pair matching nothing:** a distribution that never pays the filtered pay type in the window is a well-formed zero response, not an error (see Filter architecture).
3. **Distribution renamed:** `distributionName` resolves at query time, so history reports under the current label; clients key on `distributionId` only.
4. **Distribution deleted:** today's inner join silently drops those compensation rows [CODE]; the money was really paid, so this is an open sign-off item, not a specced behaviour.
5. **Pay types with no lines:** no row is sent (API 2) and no `payTypes[]` entry appears (API 3); the client never renders zero-amount pay-type rows.
6. **Three-paycheck months:** weekly and bi-weekly cycles give some calendar months an extra check; the window reports what was actually paid, and no comparison field exists to misread it (F3).
7. **Custom range spanning years:** no special handling; selection is by `CheckDate` inside the inclusive pair.
8. **Reversed custom pair:** HTTP 400, never silently swapped.
9. **Unknown or foreign `distributionId`:** HTTP 404 on APIs 3 and 4 (the id is the resource); the summary never takes one.
10. **Invalid `ptSubType`:** outside 1-10 is HTTP 400.
11. **Page past the end:** empty `employees[]` with correct `totalCount` and `totalAmount`, HTTP 200.
12. **Employee paid in several distributions:** they appear in each distribution's API 3 list with only that distribution's lines; the same person's rows in two drills do not sum to their org-wide pay, by design.
13. **Employee hired or terminated mid-window:** no special handling; their checks dated inside the window are simply present.
14. **Null or zero `SubType` on real rows:** [TO CONFIRM] (backend dev); if possible, such lines return under an explicit "Unclassified" code rather than vanishing or matching a filter.
15. **Stale `asOf` after a payroll posting:** a refresh fetches API 2 with a fresh `asOf` and re-anchors any open drill; two calls rendered together always carry the same `asOf`, so a posting between them cannot produce a header that disagrees with its drill.

## Not in scope

- **No comparison, ever.** No prior-period figures, no `prior`, `diffAmount` or `diffPct` fields, no trend or delta elements. Sign-off finding F3 rejected comparison for this widget; the built Final contains no comparison view and this contract is a boundary, not an omission. If comparison is ever revisited, F3's own condition applies: the three-paycheck-month effect makes equal-basis alignment mandatory.
- **No grain and no buckets.** The window is scope-only aggregation: one flat result per request, never a time series.
- **No hours and no rates.** `Hours` and `Rate` are evidenced available on the same rows (proof file) but the built design displays amounts only, so they are not returned anywhere.
- **No per-check detail.** API 3 aggregates per employee over the window; check dates, check numbers and per-check lines are not returned.
- **No flat cross-org employee list.** Employees are reachable only through their own distribution; the build deliberately removed the route to an org-wide per-person list and this contract does not recreate it.
- **No link out to the Payroll History module.** The drill stays inside the widget (sign-off finding F8's recommendation, which the built design follows); no deep-link contract is needed.
- **No Department dimension.** No department field exists on or via `PR_History`/`PR_HistoryCompensation` [CODE]; the grouping is the org-defined distribution labels.
- **No project or workers-comp breakdowns.** `ProjectID` and `WorkersCompID` exist on the rows; nothing in the built Final needs them.
- **No recurring-schedule flags or per-distribution period modes.** Cut from the design (sign-off finding F2, aligned); no backend surface.
- **No per-user preference persistence.** The widget's filter state is session-local; nothing here writes `SSUserTenantPreference`.
- **No server-computed totals or percentages on the summary.** Grand total, per-distribution rollups and shares are client arithmetic over API 2's bounded rows.

## Still needs sign-off

- **`this_period` semantics.** Payroll has no fiscal-period concept in code (only `CheckDate`) [CODE], while the shared window picker treats `this_period` as the org's fiscal period. Decide: resolve it from the GL fiscal calendar, or drop the preset for this widget. Who: Feargal + the project owner. Blocked: the server's window-resolution rule for that one preset; the other five are fully specified.
- **Payroll permission right, exact name and level.** Feargal stated the employee level is restricted to users with payroll permission [SME]; the concrete right / URI / access level for APIs 3 and 4's employee scope is unconfirmed. Who: Feargal + backend dev. Blocked: the auth gate wiring on API 3 and API 4's scope resolution; the shapes themselves are settled.
- **`PR_Employee` key and display-name columns.** The employee join is evidenced (proof file) but the exact columns behind `employeeId` and `employeeName` are unconfirmed. Who: backend dev. Blocked: two schema cells marked UNVERIFIED; nothing structural.
- **Distribution count ceiling.** The volume verdicts assume a config-lookup-sized distribution list; the realistic ceiling at the largest org is uncited. Who: Feargal. Blocked: confirmation of API 2's BOUNDED verdict; if orgs run to thousands of distributions, API 2 needs a pagination pass.
- **Worst-case employees per distribution.** Uncited; drives API 3's `pageSize` tuning and the export's cost envelope. Who: Feargal. Blocked: nothing structural (the endpoint paginates regardless).
- **Orphaned `CompensationDistributionID` rows.** Today's inner join silently drops compensation lines whose distribution was deleted [CODE]; the money was really paid. Confirm intended, or return them under a placeholder label. Who: project owner + backend dev. Blocked: the "All distributions" total's completeness guarantee.
- **Null / zero `SubType` on real rows.** Whether the column is guaranteed 1-10; drives edge case 14. Who: backend dev. Blocked: the "Unclassified" fallback's necessity.
- **PDF export rendering.** CSV and Excel are flat row dumps; PDF needs layout work whose cost only the dev team can price. Decide whether PDF ships in the first cut or the menu item is dropped until it does. Who: dev team lead. Blocked: API 4's `format=pdf` value only.
- **Reconciliation file statuses.** The Step 6 reconciliation file still lists findings 2 (F3, comparison), 3 (F8, in-widget drill) and 4 (F6, amount-descending default) as open items; the built design and this contract match all three findings' outcomes. Who: project owner, to update the statuses in `Step 6 - Sign off document/Payroll Distrubution/Reconciliation - Payroll Distributions.md`. Blocked: nothing in this contract; the flag is so the dossier and the contract cannot be read as disagreeing.
- **Parallel sign-off-aligned spec.** A second Payroll Distributions API spec exists in the widget's Step 6 folder, written against the sign-off dossier before the current build existed. Decide whether it is retired or reconciled into this contract. Who: project owner. Blocked: nothing in this contract; the flag prevents two contracts circulating.
