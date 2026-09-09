# Bank Balances - API Spec

**Status: Done - awaiting sign-off (drafting complete, owner review pending)**

---

## Overview

This widget shows the current cash position across every active bank account, and lets a user drill into one account to see how its balance moved since its last bank reconciliation: beginning balance, the five activity types (Deposits, Voids, Checks, Withdrawals, EFT), and the ending balance. Balances are a running tally of unreconciled items on top of the last reconciliation, which is the widget's core design, not a staleness bug.

This contract defines **three APIs**: a paginated, server-sorted, server-aggregated account list fired on render (Glance reads only its aggregates), a single-account activity breakdown fired when the user selects one account, and an account picker lookup fired when the user opens the Account control. The justification for each split is in the API inventory below.

Two facts shape this contract. First, **the paginated accounts endpoint exists nowhere in the Modern API today**: the existing `GET /api/dashboard/bank-balances/all` returns the whole set unpaged with no totals block, no paging, no sort contract and no overdrawn filter, so API 1 is central NEW backend work, not a reshaping of an existing read. Second, the Modern API's single-account endpoint returns only a summary balance, with no per-type breakdown and no activity data of any kind, so API 2 is entirely NEW as well; it is specced as forward design under the standing waiver and remains this widget's largest backend ask.

## Design → API coverage

| Design element | Type | API | Field(s) | Provenance |
|---|---|---|---|---|
| Total Balance figure (Glance, and All Accounts header) | KPI | API 1 | `totals.ending`, `totalCount` | DERIVED, full filtered set [BUILD] |
| Overdrawn pill on the total | State | none (client-side) | `totals.ending` < 0 | DERIVED client [BUILD] |
| Account control label and picker rows | Filter | API 3 | `accounts[].accountId`, `accounts[].name`, `accounts[].endingBalance` | STORED + DERIVED [CODE] |
| "All Bank Accounts" picker option and its combined figure | Filter | API 3 | `combinedTotal`, `totalCount` | DERIVED [CODE] |
| All-option visibility (only when more than one active account) | State | API 3 | `totalCount` | DERIVED client rule over served count [DOC - Step 1 research] |
| Overdrawn chip count | KPI | API 1 | `overdrawnCount` | DERIVED, whole active set [BUILD] |
| Overdrawn-only filter | Filter | API 1 | `overdrawnOnly` param, echoed | NEW param [BUILD] |
| Balance Table rows (Account, Balance) | Table column | API 1 | `rows[].accountId`, `rows[].name`, `rows[].endingBalance` | STORED + DERIVED [CODE] |
| Overdrawn tag on a table row / bar | State | none (client-side) | `rows[].endingBalance` < 0 | DERIVED client [BUILD] |
| Totals row under the table | Total | API 1 | `totals.ending` | DERIVED, full filtered set [BUILD] |
| Balance Bar Chart bars and their shared scale | Chart series | API 1 | `rows[].endingBalance`, `totals.maxEnding`, `totals.minEnding` | DERIVED [BUILD] |
| Switch View (Table / Bars) | View toggle | none (client-side) | same held API 1 response | client view [BUILD] |
| Pager (Previous / Next, "13 to 24 of 52") | Control | API 1 | `page`, `pageSize`, `pageCount`, `totalCount` | DERIVED [BUILD] |
| Single Account mode header (name, ending balance) | KPI | API 2 | `name`, `endingBalance` | STORED + DERIVED [CODE] |
| Seven-row breakdown table | Table column | API 2 | `beginningBalance`, `deposits`, `voids`, `checks`, `withdrawals`, `eft`, `endingBalance` | DERIVED + NEW, see API 2 schema [DOC - Step 1 research] |
| Beginning-balance source note (reconciliation vs opening balance) | State | API 2 | `beginningFromReconciliation` | DERIVED [DOC - Step 1 research] |
| Four-category activity chart (Detail, Single Account) | Chart series | API 2 | `deposits`, `voids`, `checks`, `withdrawals` (magnitudes taken client-side) | NEW fields, client display transform [BUILD] |
| Empty state (no active accounts) | State | API 1 / API 3 | `totalCount` = 0, empty `rows` / `accounts` | contract state [BUILD] |
| Refresh | Action | API 1 or API 2 (whichever mode is active) | re-fires the current read, selection preserved | [DOC - Step 1 research] |
| Data freshness stamp | State | all | `asOf` | DERIVED, server clock, informational |

Every response field below appears in a row above. The build computes `totals.beginning`, `totals.negativeCount` and `totals.neverReconciledCount` in its server stand-in but no rendered element consumes them, so they are not in this contract.

## Tables

| Table / repository | Fields and members used |
|---|---|
| `BR_BankAccount` | `BankAccountID`, `Name`, `Active`, `OpeningBalance`, GL scoping chain (`GLAccountID` up to `GLYear.CompanyID`) |
| `BR_Reconcile` | `BankAccountID`, `EndingBalance`, `ReconcileEndingDate` |
| `BR_Item` | `BankAccountID`, `Amount`, `Type` (codes d / v / c / w / e), `ReconcileID` |

**No new tables and no schema changes are needed.** Everything here is new queries against existing tables; the NEW work is the endpoints, their aggregation and their paging, not storage.

Core formulas and filters applied to every read, each quotable in isolation:

- **Ending balance per account** = the most recent `BR_Reconcile.EndingBalance` (by `ReconcileEndingDate` descending), or `BR_BankAccount.OpeningBalance` if the account has never been reconciled, **plus** `SUM(BR_Item.Amount) WHERE ReconcileID IS NULL` for that account. [CODE - Widget_Comparison_Classic.html, Modern API bank-balances handler: `Ending = reconcileMap[id] or OpeningBalance + unreconciledMap[id] or 0`]
- **Activity per type** = `SUM(BR_Item.Amount) WHERE ReconcileID IS NULL AND Type = '<code>'`, codes d Deposits, v Voids, c Checks, w Withdrawals, e EFT. Checks and Withdrawals are stored negative; the stored sign is what all arithmetic uses. [DOC - Step 1 research] [CODE - legacy `BankBalances : DataPanelControl`]
- **Ending balance in the breakdown** = beginning balance plus all five activity sums. There is no separate stored balance; nothing can drift. [DOC - Step 1 research]
- **Overdrawn** = ending balance strictly less than zero. [BUILD]
- **Every read is scoped** `BR_BankAccount.Active = true` and company-scoped via the `BRBankAccount.GLAccount.GLDepartment...GLYear.CompanyID` join chain against the `X-Company-ID` context. [CODE - Widget_Comparison_Classic.html]

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Account list read | `GET /api/dashboard/bank-balances/all` returns the whole set unpaged: `{GridRows[], ChartItems[]}`, `GridRow {BankAccountId, Name, EndingBalance, Active}` | **NEW** - API 1: paginated, server-sorted, whitelisted-sort, overdrawn-filterable read with full-set totals, `maxEnding`/`minEnding`, `overdrawnCount` and `totalCount`. Exists in no Modern API document |
| Chart data | `ChartItems {Name, Amount}`, positive balances only (the legacy pie excluded negatives) | Dropped. Both presentations read API 1's rows; negative balances are served like any other row and the client renders them against the zero axis |
| Single account read | `GET /api/dashboard/bank-balances/{bankAccountId:guid}` returns a summary balance only | **NEW** - API 2: the seven-line breakdown (beginning, five activity type sums, ending) plus `beginningFromReconciliation`. No per-type data exists in the Modern API today |
| Filter list | `GET /api/dashboard/bank-balances/filters` returns `List<DropDownItem>`, Active only, "All Bank Accounts" (Guid.Empty) prepended when more than one exists | **NEW (reshaped)** - API 3: same query base, response gains `endingBalance` per account, `combinedTotal` and `totalCount`; the All option becomes a client rule over `totalCount` rather than a server-injected sentinel row |
| Aggregation | None. The client is handed every row | Server computes all totals, the overdrawn count and the bar-scale extremes over the full filtered set |

## API inventory

| API | Purpose | Trigger (when it fires) | Cardinality | R/W | Cache posture | Split trigger |
|---|---|---|---|---|---|---|
| API 1 - Accounts page | One page of account balances plus full-set aggregates | Widget render (all tiers), page turn, overdrawn toggle, refresh in All Accounts mode | One page (max `pageSize` rows) + one totals block | R | LIVE per request (balances move with every posting) | Cardinality gap vs API 2 (unbounded list vs one entity); trigger gap vs API 3 |
| API 2 - Account activity breakdown | The seven-line movement summary for one account | User selects a single account; refresh in Single Account mode | Exactly 7 values, bounded by definition | R | LIVE per request | Grain gap (per-entity detail vs list); trigger gap (fires only on selection) |
| API 3 - Account picker lookup | Every active account with name and ending balance, plus the combined total | User opens the Account control | Full active set, narrow rows | R | LIVE per request; a short TTL is acceptable because the picker is advisory (see asOf note) | Trigger gap (fires on open, not on render); conditional weight (the full set is only needed when the picker opens) |

Merges considered and closed: the full-set totals, the overdrawn count and the bar-scale extremes ride **inside** API 1 rather than a separate summary endpoint, because the chip, the totals row and the rows must reconcile on one screen from one response - splitting them invites a straddled write. The picker was considered as "API 1 with a huge pageSize" and kept separate: the picker needs the whole set regardless of the overdrawn filter, needs only two display fields per row, and must not inherit `pageSize`'s maximum. There is no write anywhere in this widget.

## Call sequence

| Interaction | Calls fired | Notes |
|---|---|---|
| Initial widget load (Glance) | API 1, `page=1`, `pageSize=1` | Glance reads `totals.ending` and `totalCount` only; the aggregate always spans all accounts, never any selection made at a larger tier |
| Initial widget load (Explore / Detail, All Accounts) | API 1, `page=1`, defaults | Rows, totals, chip count and pager all come from this one response |
| Open the Account control | API 3 | Full active set with balances; the All option renders only when `totalCount` > 1 |
| Select a single account | API 2 with that `accountId` | Mode switch, not a row filter: API 1's list state (page, overdrawn filter) is abandoned; overdrawn filter is cleared client-side |
| Select "All Bank Accounts" | API 1, `page=1`, defaults | Returns to All Accounts mode at page 1 |
| Toggle Overdrawn only | API 1 with `overdrawnOnly=true` (or the param omitted to clear), `page=1` | Aggregates follow the filtered population; `overdrawnCount` never does |
| Change page (Previous / Next) | API 1 with the new `page` | Nothing else changes; totals must not move |
| Switch view (Table / Bars) | none | Client re-renders the held API 1 response; both presentations read the same rows and totals |
| Open drill / expand row | none | No row, bar or card is interactive; Single Account mode is the drill-in and rides the Account control |
| Submit action | none | This widget has no write |
| Refresh | API 1 or API 2, whichever mode is active | Account selection, view, page and filter preserved client-side |

Consistency across calls: every response carries `asOf`, the server's generation timestamp. It is **informational, not a request parameter** - point-in-time balance reconstruction does not exist in this data model, so two calls made across a posting may differ. Each single response is internally consistent (rows, totals and counts computed in one scan). The one cross-API pairing on screen - a picker balance from API 3 beside a breakdown from API 2 - treats API 2 as authoritative and the picker figure as advisory; drift between them is accepted and bounded by the two `asOf` values.

## Filter architecture

| Filter | Option source | Cardinality | Execution | Aggregate effect | Cascade | "All" wire form | Round trips |
|---|---|---|---|---|---|---|---|
| Account | LOOKUP - API 3 | About 50 active accounts, sometimes more [SME - Ben Lane, 13.07.2026]; no hard ceiling | SERVER - a mode switch, not a row param: a single selection fires API 2 with `accountId` in the path; All Accounts fires API 1 | Yes - it swaps the entire dataset and shape | Its own option list is refreshed on every open (API 3), so it cannot go stale | "All Bank Accounts" = call API 1; no account param exists on API 1 at all | 1 |
| Overdrawn only | DERIVED from the API 1 response (`overdrawnCount` > 0 shows the chip) | 2 (on / off) | SERVER - `overdrawnOnly=true` on API 1, applied before ordering, aggregation and the page cut | Yes - `rows`, `totalCount`, `totals` and `pageCount` follow the filtered population; `overdrawnCount` alone always spans the whole active set | Cleared client-side when the Account control switches to a single account, where it has no meaning | Omit the param (equivalently `false`) | 1 |
| Switch View (Table / Bars) | STATIC: `table`, `bars` | 2 | CLIENT - a view over the held API 1 response. Framework 1 conditions: the set is already present (the served page plus full-set totals), it is provably bounded (at most `pageSize` rows, a served cap), and no server-computed aggregate changes (both views read the same `totals`) | No | None | Not a data parameter | 0 |

- **Combination semantics:** AND-narrowing does not arise, because the two data filters are mutually exclusive by design: Overdrawn only exists only in All Accounts mode, and selecting an account leaves it.
- **Conflict rule:** API 2 defines no `overdrawnOnly` parameter, so an overdrawn-filtered single account is unrepresentable on the wire; an unknown parameter on either API is ignored, never an error. A stale `page` against a shrunk set is clamped (see the pagination contract). An `accountId` that is not an active account of the company returns 404 from API 2 and the client falls back to All Accounts mode.
- **Empty-result semantics:** `overdrawnOnly=true` when nothing is overdrawn (possible in the race between the chip rendering and the click) returns a well-formed zero: `rows: []`, `totalCount: 0`, `totals.ending: 0`, `totals.maxEnding: 0`, `totals.minEnding: 0`, `pageCount: 1`, `page: 1` - never an error.
- **Blank-value rule:** no filter operates on a nullable field. `endingBalance` is always computed (it degrades to `OpeningBalance + 0` for a never-reconciled, no-activity account), so the overdrawn test always has a number to compare and a blank can never behave as a wildcard.

## Volume and performance

| Dataset | Typical rows | Worst realistic rows (basis) | Row width | Payload at worst | Verdict | Server cost model | Cache posture |
|---|---|---|---|---|---|---|---|
| API 1 account rows | 52 [BUILD - demo fixture, five pages at page size 12] | 50+, no hard ceiling [SME - Ben Lane, 13.07.2026: "Up to 50, sometimes more. 3 is unrealistically low"]; exact ceiling [TO CONFIRM - backend team] | 3 fields, ~90 bytes | One page: at most `pageSize` rows, ~9 KB at the maximum | MUST PAGINATE | Full-set aggregate per request: one scan of active accounts joined to two grouped subqueries (latest reconcile per account, unreconciled `SUM(BR_Item.Amount)` per account - the existing Modern handler's exact pattern), because totals, extremes and the overdrawn count span every account even when one page is served | LIVE per request |
| API 2 breakdown | 7 values, always | 7, bounded by definition (five fixed type codes plus two boundary balances) [DOC - Step 1 research] | 10 fields, ~250 bytes total | ~250 bytes | BOUNDED | One reconcile lookup plus one grouped sum over that account's unreconciled `BR_Item` rows | LIVE per request |
| API 3 picker lookup | 52 [BUILD - demo fixture] | Same population as API 1: 50+, ceiling [TO CONFIRM - backend team] | 3 fields, ~70 bytes | ~3.5 KB at 50 accounts; ~35 KB at 500 | BOUNDED, conditional on the ceiling: the picker cannot page by design (it is the control that chooses an account), so if the confirmed ceiling is large this endpoint becomes a server-searched typeahead instead - an owner decision recorded in Still needs sign-off | Full-set scan, same two grouped subqueries as API 1 | LIVE per request (short TTL acceptable; the figure is advisory) |

There is no time series anywhere in this widget, so no N × M product arises.

### Pagination contract

Applies to API 1 only. APIs 2 and 3 do not paginate.

- **Params:** `page` (1-based, default 1), `pageSize` (default **12**, maximum **100**). The default is the built page size; the maximum is this contract's decision and is listed for owner confirmation in Still needs sign-off.
- **What paginates:** the `rows` array, and nothing else.
- **What does not:** `totals.ending`, `totals.maxEnding`, `totals.minEnding`, `totalCount` and `overdrawnCount` are each computed over the **full filtered set** (and `overdrawnCount` over the full *active* set, ignoring the filter). Turning the page changes no total, no chart scale, no chip count and no KPI. A bar's length must not change when the page turns, which is exactly what `maxEnding`/`minEnding` exist to guarantee.
- **Sort params:** `sortBy` with a whitelisted field list of exactly **one member, `name`** - ordering is fixed alphabetical by design and is not user-changeable; that is a stated decision (the user loses column sorting, held as an open owner item), not an omission. `sortDir` (`asc` default, `desc` accepted). An unknown `sortBy` falls back to `name asc` and the response echoes what was actually applied; the key is never interpolated into an ORDER BY unchecked.
- **Deterministic total order:** `name`, then `BankAccountID` as the unique tiebreaker, so two accounts with the same name can never swap, repeat or vanish across pages.
- **`totalCount`** is returned in every response alongside `page`, `pageSize` and `pageCount`, so the client renders the pager without a second call.
- **Past the last page:** the server clamps. A `page` beyond the end (or below 1, or non-numeric) is served as the nearest valid page, with the clamped `page` echoed so the client renders what it was actually given, with correct `totalCount` and aggregates - never an error. This matters because the overdrawn filter can shrink `pageCount` under a stale page index.

## Where computation lives

| Value | Server or client | Basis | Why |
|---|---|---|---|
| Ending balance per account | SERVER | Last reconcile ending (or opening balance) + unreconciled sum | Needs `BR_Reconcile` and `BR_Item`, which the client never holds |
| `totals.ending` (Total Balance KPI and totals row) | SERVER | SUM of ending balances over the full filtered set | Spans accounts outside the served page |
| `overdrawnCount` (chip) | SERVER | COUNT of active accounts with ending balance < 0, whole active set, filter ignored | Must not move when the filter turns on or the page turns |
| `totals.maxEnding` / `totals.minEnding` (bar scale) | SERVER | MAX/MIN of ending balance over the full filtered set, each clamped so zero is always inside the range | The bar chart scales to the full set, not the page |
| Overdrawn flag on a row, pill on the total | CLIENT | `endingBalance < 0` on values already in the response | Pure comparison over present values |
| Breakdown line values (beginning, five types, ending) | SERVER | The core formulas in Tables | Needs row-level `BR_Item` data |
| `beginningFromReconciliation` | SERVER | EXISTS(`BR_Reconcile` row for the account) | Same query already touches the table |
| Activity-chart magnitudes (Checks, Withdrawals shown positive) | CLIENT | `abs()` over served signed values | Display transform only; the stored sign is authoritative and the server must never pre-flip it |
| Activity-chart scale (largest magnitude) | CLIENT | max of four served values | Four values, all present |
| Bar lengths (both charts) | CLIENT | value / scale extreme | Arithmetic over present values. Division-by-zero rule: when the scale denominator is zero (every balance exactly zero, or all four activity values zero) the client renders zero-length bars and no division is attempted; no divided value is ever null |
| Server-computed percentages | SERVER (none exist) | - | No percentage, ratio or pre-signed delta is served anywhere in this contract, so no server division-by-zero rule is needed; deltas do not arise |
| Sort order | SERVER | `name asc`, `BankAccountID` tiebreaker | The set is paginated, so client sort is a defect |
| Pager label ("13 to 24 of 52") | CLIENT | `page`, `pageSize`, `totalCount` | Arithmetic over present values |
| All-option visibility | CLIENT | API 3 `totalCount > 1` | Served count; rule from the legacy design |
| Overdrawn chip visibility | CLIENT | `overdrawnCount > 0` | Served count; a permanent zero-alarm chip is a design decision already taken |

Presentation thresholds: none exist beyond "less than zero is overdrawn", which is a definition, not a tunable band.

## API 1: Accounts page

### Endpoint

```
GET /api/dashboard/bank-balances/accounts
```

**NEW.** No Modern API document describes this endpoint; the nearest existing read (`/bank-balances/all`) is unpaged, unaggregated and unfiltered. This endpoint is the widget's central new backend work.

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `page` | int | no | 1 or greater; out-of-range values are clamped | 1 | 1-based page of account rows |
| `pageSize` | int | no | 1 to 100 | 12 | Rows per page. Maximum pending owner confirmation |
| `sortBy` | string | no | whitelist: `name` | `name` | Unknown values fall back to `name`; the applied key is echoed |
| `sortDir` | string | no | `asc`, `desc` | `asc` | Direction of the whitelisted sort |
| `overdrawnOnly` | bool | no | `true`, `false` | `false` (omit) | Restricts rows, totals and counts to accounts with a negative ending balance; `overdrawnCount` ignores it |

Context header: `X-Company-ID`, required on every call, scopes every query (see Auth and scoping).

### Example requests

```
GET /api/dashboard/bank-balances/accounts?page=1
GET /api/dashboard/bank-balances/accounts?page=1&pageSize=12&sortBy=name&sortDir=asc&overdrawnOnly=true
```

No parameter value here needs URL-encoding; all are ASCII tokens.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `rows` | array | DERIVED container of the row fields below [BUILD] | The requested page only, already ordered by the server |
| `rows[].accountId` | guid | STORED `BR_BankAccount.BankAccountID` [CODE] | Unique account id, the sort tiebreaker |
| `rows[].name` | string | STORED `BR_BankAccount.Name` [CODE] | Account name, the sort key |
| `rows[].endingBalance` | decimal | DERIVED lastReconcile.EndingBalance or OpeningBalance + SUM(unreconciled `BR_Item.Amount`) [CODE] | Current running balance; negative means overdrawn |
| `totalCount` | int | DERIVED COUNT over the full filtered set [BUILD] | Size of the whole filtered set, never the page |
| `totals` | object | DERIVED container of the aggregates below [BUILD] | Aggregates over the full filtered set |
| `totals.ending` | decimal | DERIVED SUM(endingBalance) over the full filtered set [BUILD] | The Total Balance figure; also the totals row |
| `totals.maxEnding` | decimal | DERIVED MAX(endingBalance, 0) over the full filtered set [BUILD] | Upper bar-scale extreme; never below zero so the zero axis stays in range |
| `totals.minEnding` | decimal | DERIVED MIN(endingBalance, 0) over the full filtered set [BUILD] | Lower bar-scale extreme; never above zero |
| `overdrawnCount` | int | DERIVED COUNT(endingBalance < 0) over the whole active set, filter ignored [BUILD] | The chip's number; states how many overdrawn accounts exist |
| `overdrawnOnly` | bool | DERIVED echo of the applied filter [BUILD] | So the client never guesses whether its rows are filtered |
| `page` | int | DERIVED echo, clamped [BUILD] | The page actually served |
| `pageSize` | int | DERIVED echo [BUILD] | The page size actually applied |
| `pageCount` | int | DERIVED ceil(totalCount / pageSize), minimum 1 [BUILD] | Pages in the filtered set |
| `sortBy` | string | DERIVED echo of the applied whitelisted key [BUILD] | What the server actually sorted by |
| `sortDir` | string | DERIVED echo [BUILD] | Applied direction |
| `asOf` | datetime | DERIVED server clock at generation | Informational freshness stamp |

### Example response

A five-account organization, one page:

```json
{
  "rows": [
    { "accountId": "6f1d2a3b-4c5d-4e6f-8a9b-0c1d2e3f4a5b", "name": "Building Fund Money Market", "endingBalance": 88409.45 },
    { "accountId": "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e", "name": "Missions Fund Checking", "endingBalance": 15230.10 },
    { "accountId": "9e8d7c6b-5a4f-4e3d-8c2b-1a0f9e8d7c6b", "name": "Operating Checking, Main", "endingBalance": 268990.00 },
    { "accountId": "4a5b6c7d-8e9f-4a1b-8c2d-3e4f5a6b7c8d", "name": "Payroll Clearing", "endingBalance": 42610.25 },
    { "accountId": "1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f", "name": "Youth Ministry Checking", "endingBalance": -3120.80 }
  ],
  "totalCount": 5,
  "totals": { "ending": 412119.00, "maxEnding": 268990.00, "minEnding": -3120.80 },
  "overdrawnCount": 1,
  "overdrawnOnly": false,
  "page": 1,
  "pageSize": 12,
  "pageCount": 1,
  "sortBy": "name",
  "sortDir": "asc",
  "asOf": "2026-09-07T14:12:05Z"
}
```

Reconciliation: the four in-credit balances sum as 268990.00 + 88409.45 + 15230.10 + 42610.25 = 415239.80, and the overdrawn account nets it down, 3120.80 + 412119.00 = 415239.80, so `totals.ending` 412119.00 equals the sum of every row's `endingBalance`; `overdrawnCount` 1 matches the one negative row; `totalCount` 5 matches the row population; `maxEnding` and `minEnding` are the largest and smallest row balances. `totals.ending` must equal API 3's `combinedTotal` for the same population.

With `overdrawnOnly=true` on the same organization: `rows` holds only Youth Ministry Checking, `totalCount` 1, `totals.ending` -3120.80 (the overdrawn subtotal, reconciling as 3120.80 + 0.00 = 3120.80 in magnitude against the single row), `totals.maxEnding` 0, `totals.minEnding` -3120.80, `overdrawnCount` still 1, `overdrawnOnly` true, `pageCount` 1.

### State contracts

| State | Response |
|---|---|
| Empty (no active accounts) | 200: `rows: []`, `totalCount: 0`, `totals` all zero, `overdrawnCount: 0`, `pageCount: 1`, `page: 1`. The on-screen empty-state copy is an open design item; the shape is not |
| Empty by filter (`overdrawnOnly=true`, none overdrawn) | 200: same well-formed zero, except `overdrawnOnly: true` and `overdrawnCount` reporting the true active-set count (0 in this state) |
| Partial | Does not arise: there is no requested span; an account with no unreconciled items simply contributes its reconciled (or opening) balance |
| Not-yet-existing entity | Does not arise: this endpoint takes no entity id |
| Permission denied | 403 with an empty body; the widget-level treatment is an open product decision |
| Upstream unavailable | 503; the client shows its error state (treatment unspecified, an open design item) and never fabricates zeros |

## API 2: Account activity breakdown

### Endpoint

```
GET /api/dashboard/bank-balances/accounts/{accountId}/activity
```

**NEW - the widget's largest backend ask.** The existing single-account read returns only a summary balance; no per-type breakdown and no activity-category data exist anywhere in the Modern API. This endpoint is specced as forward design under the standing waiver of that gap, and Single Account mode cannot ship until it exists. The legacy codebase computes exactly these values in-memory, so the logic has a reference implementation.

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `accountId` | guid (path) | yes | An active account of the company | none | The account to break down. Unknown, inactive or out-of-company ids return 404 |

Context header: `X-Company-ID`, required.

No paging, no sort, no filter: the seven-line order is structural and fixed, and the period is implicitly "since the last reconciliation" - there is deliberately no date parameter of any kind.

### Example requests

```
GET /api/dashboard/bank-balances/accounts/9e8d7c6b-5a4f-4e3d-8c2b-1a0f9e8d7c6b/activity
GET /api/dashboard/bank-balances/accounts/1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f/activity
```

Both calls take the same shape; there is no filtered variant because the endpoint has no filters.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `accountId` | guid | STORED `BR_BankAccount.BankAccountID` [CODE] | Echo of the path id |
| `name` | string | STORED `BR_BankAccount.Name` [CODE] | For the mode header |
| `beginningBalance` | decimal | DERIVED last `BR_Reconcile.EndingBalance` by `ReconcileEndingDate` desc, else `BR_BankAccount.OpeningBalance` [DOC - Step 1 research] [CODE] | Line 1 of the breakdown |
| `beginningFromReconciliation` | bool | DERIVED EXISTS(`BR_Reconcile` for the account) [DOC - Step 1 research] | Feeds the beginning-balance source note; `false` is defined behaviour, not an error |
| `deposits` | decimal | NEW - SUM(`BR_Item.Amount`) WHERE `ReconcileID IS NULL` AND `Type='d'` [DOC - Step 1 research] [CODE - legacy] | Stored-sign sum, normally positive |
| `voids` | decimal | NEW - same, `Type='v'` [DOC - Step 1 research] [CODE - legacy] | Stored-sign sum |
| `checks` | decimal | NEW - same, `Type='c'` [DOC - Step 1 research] [CODE - legacy] | **Served with its stored negative sign.** The client takes magnitudes for the activity chart; the server must never pre-flip |
| `withdrawals` | decimal | NEW - same, `Type='w'` [DOC - Step 1 research] [CODE - legacy] | Served with its stored negative sign, as above |
| `eft` | decimal | NEW - same, `Type='e'` [DOC - Step 1 research] [CODE - legacy] | Either sign occurs in real data |
| `endingBalance` | decimal | DERIVED beginningBalance + deposits + voids + checks + withdrawals + eft [DOC - Step 1 research] | Line 7; also the account's figure in API 1 and API 3, and it must equal them at the same data state |
| `asOf` | datetime | DERIVED server clock at generation | Informational freshness stamp |

### Example response

```json
{
  "accountId": "9e8d7c6b-5a4f-4e3d-8c2b-1a0f9e8d7c6b",
  "name": "Operating Checking, Main",
  "beginningBalance": 412870.55,
  "beginningFromReconciliation": true,
  "deposits": 186240.00,
  "voids": 2140.00,
  "checks": -142380.25,
  "withdrawals": -31500.00,
  "eft": -58120.40,
  "endingBalance": 369249.90,
  "asOf": "2026-09-07T14:12:09Z"
}
```

Reconciliation: money in sums as 412870.55 + 186240.00 + 2140.00 = 601250.55, money out as 142380.25 + 31500.00 + 58120.40 = 232000.65, and 232000.65 + 369249.90 = 601250.55, so `endingBalance` 369249.90 equals beginning plus all five stored-sign activity values; it is the same figure API 1 serves as this account's `endingBalance` and API 3 serves in the picker, at the same data state.

### State contracts

| State | Response |
|---|---|
| Empty (no unreconciled items) | 200: all five activity fields `0`, `endingBalance` equal to `beginningBalance`. A legitimate quiet account, not an error |
| Partial (never reconciled) | 200: `beginningFromReconciliation: false`, `beginningBalance` = the opening balance. Defined behaviour |
| Not-yet-existing entity (unknown, inactive, or another company's id) | 404 with an empty body; the client falls back to All Accounts mode |
| Permission denied | 403, as API 1 |
| Upstream unavailable | 503, as API 1 |

## API 3: Account picker lookup

### Endpoint

```
GET /api/dashboard/bank-balances/accounts/lookup
```

**NEW (reshaped).** The existing `/bank-balances/filters` read proves the query base (active accounts, company-scoped, name-ordered), but its `DropDownItem` shape carries no balances and injects the All option as a sentinel row. This endpoint serves the same population with `endingBalance` per account plus the combined total, and leaves the All option to the client.

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| none | - | - | - | - | The lookup takes no parameters beyond the context header; it always returns the full active set, unfiltered, in the canonical order |

Context header: `X-Company-ID`, required.

### Example requests

```
GET /api/dashboard/bank-balances/accounts/lookup
GET /api/dashboard/bank-balances/accounts/lookup
```

The second call is identical by design - there is no filtered form of this request.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `accounts` | array | DERIVED container of the row fields below [BUILD] | Every active account, ordered by `name` then `BankAccountID`, the same total order as API 1 so the picker and the table can never disagree about the alphabet |
| `accounts[].accountId` | guid | STORED `BR_BankAccount.BankAccountID` [CODE] | Selection value; feeds API 2's path |
| `accounts[].name` | string | STORED `BR_BankAccount.Name` [CODE] | Row label |
| `accounts[].endingBalance` | decimal | DERIVED, same formula as API 1 [CODE] | Trailing figure per picker row; advisory (see the asOf note) |
| `combinedTotal` | decimal | DERIVED SUM(endingBalance) over all active accounts [BUILD] | The All Bank Accounts option's trailing figure |
| `totalCount` | int | DERIVED COUNT of active accounts [BUILD] | Drives the All-option visibility rule (shown only when greater than 1) |
| `asOf` | datetime | DERIVED server clock at generation | Informational freshness stamp |

### Example response

```json
{
  "accounts": [
    { "accountId": "6f1d2a3b-4c5d-4e6f-8a9b-0c1d2e3f4a5b", "name": "Building Fund Money Market", "endingBalance": 88409.45 },
    { "accountId": "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e", "name": "Missions Fund Checking", "endingBalance": 15230.10 },
    { "accountId": "9e8d7c6b-5a4f-4e3d-8c2b-1a0f9e8d7c6b", "name": "Operating Checking, Main", "endingBalance": 268990.00 },
    { "accountId": "4a5b6c7d-8e9f-4a1b-8c2d-3e4f5a6b7c8d", "name": "Payroll Clearing", "endingBalance": 42610.25 },
    { "accountId": "1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f", "name": "Youth Ministry Checking", "endingBalance": -3120.80 }
  ],
  "combinedTotal": 412119.00,
  "totalCount": 5,
  "asOf": "2026-09-07T14:12:07Z"
}
```

Reconciliation: 268990.00 + 88409.45 + 15230.10 + 42610.25 = 415239.80 in credit and 3120.80 + 412119.00 = 415239.80 nets the overdrawn account off, so `combinedTotal` 412119.00 equals the sum of every account's `endingBalance` and matches API 1's unfiltered `totals.ending` at the same data state.

### State contracts

| State | Response |
|---|---|
| Empty (no active accounts) | 200: `accounts: []`, `combinedTotal: 0`, `totalCount: 0` |
| Partial | Does not arise: the lookup has no requested span |
| Not-yet-existing entity | Does not arise: no entity id is taken |
| Permission denied | 403, as API 1 |
| Upstream unavailable | 503, as API 1 |

## Auth and scoping

- **Company / tenant scoping:** every call carries `X-Company-ID`, and every query is scoped through the `BRBankAccount.GLAccount.GLDepartment...GLYear.CompanyID` join chain [CODE - Widget_Comparison_Classic.html]. An `accountId` outside the scoped company is indistinguishable from an unknown id: 404.
- **Permission right:** read-only throughout; there is no write. The legacy widget was gated by its `AccessUri /BankAccountManagement`; the Modern API's module field for this widget is `BankAccountMgmt` (a known naming inconsistency with the legacy string) [CODE]. The exact Modern permission right for these three reads is [TO CONFIRM - backend team / dev].
- **A user without the right** sees: undecided. Hidden widget vs empty widget vs error card is a product decision, listed in Still needs sign-off; the APIs' side is fixed here as 403 with an empty body either way.

## Edge cases

1. **Zero active accounts:** every API returns its well-formed empty shape; the on-screen copy is an open design item, the shapes are not.
2. **Exactly one active account:** API 3 returns `totalCount: 1`; the client hides the All option and treats All Accounts mode as the single account's aggregate view. Server behaviour is unchanged.
3. **Account with no unreconciled items:** API 2 returns five zeros and `endingBalance` equal to `beginningBalance`; API 1 serves the reconciled balance. Quiet, not broken.
4. **Never-reconciled account:** `beginningFromReconciliation: false`, opening balance used. Defined behaviour throughout, never an error.
5. **`overdrawnOnly=true` with nothing overdrawn:** well-formed zero response (the chip is hidden at zero, but a click can race a data change).
6. **Unknown / stale `accountId` on API 2:** 404; the client falls back to All Accounts mode rather than rendering an empty Single Account view.
7. **Page past the end, or below 1, or non-numeric:** clamped to the nearest valid page and echoed; correct `totalCount` and aggregates.
8. **Unknown `sortBy`:** falls back to `name asc`, echoed; never interpolated into the query.
9. **Duplicate account names:** the `BankAccountID` tiebreaker keeps the total order deterministic, so paging never repeats or skips an account.
10. **Every balance exactly zero:** `maxEnding` and `minEnding` both 0; the client's bar-scale denominator is zero and it renders zero-length bars without dividing (the stated zero rule).
11. **Negative combined total:** legitimate; Glance shows the negative figure and the client applies its overdrawn treatment to the total itself.
12. **EFT sign:** `eft` occurs with either sign in real data; nothing may assume it is money out.
13. **Account deactivated between calls:** the picker or list may briefly name an account API 2 then 404s on; the fallback in edge case 6 covers it, and the differing `asOf` stamps make the drift diagnosable.
14. **Voids:** stored positive (money returning); they are additive activity like deposits, not a subtraction.

## Not in scope

- **Download / export:** this widget has no download at any size; nothing replaces it.
- **Search** over accounts: not built, no endpoint; the picker scrolls the full set instead.
- **Sortable balance columns:** ordering is fixed alphabetical; the `sortBy` whitelist is enforced anyway, so granting sort later is a whitelist extension plus a UI change, with no new endpoint.
- **Per-account drill overlay or navigation away from the dashboard:** Single Account mode is the drill-in; rows, bars and chart columns are not interactive.
- **Account Cards presentation:** not part of the design; the two presentations both read API 1.
- **Reconciliation status badges / a visible Last Reconciled date:** open product item; if approved later it adds a field (for example `lastReconciledDate`) to API 1 rows and API 2 - not specced here.
- **Cash runway / available-vs-unrestricted cash split:** needs fund-level data this contract does not carry; recorded as an open dossier question, not specced.
- **Unreconciled item count per account:** open product item, not specced.
- **A time or date filter:** the period is structurally "since the last reconciliation" and is not user-selectable.
- **Historical / point-in-time balances:** `asOf` is an echo, never a request parameter; no reconstruction exists in the data model.
- **Multiple widget instances with a saved default account:** a dashboard-shell concern, outside this contract.
- **Writes:** none. Reconciliation itself belongs to the Bank Account Management module, not this widget.
- **The legacy pie's positive-only chart shape:** not reproduced; negative balances are served like any other row.

## Still needs sign-off

1. **API 2 does not exist in any form (the waived gap).** The Modern API's single-account read returns a summary balance only; the seven-line breakdown and activity categories are a named backend ask. Decides: backend team / dev. Blocks: Single Account mode entirely. Status: the gap was explicitly waived as forward design for the build; the backend work itself remains open and this contract is its definition.
2. **API 1 is central NEW work.** The paginated, aggregated, overdrawn-filterable accounts endpoint appears in no Modern API document. Decides: backend team. Blocks: the whole All Accounts surface (which is also the Glance figure).
3. **Paged-full-set design vs the SME's "top 3-5 plus view-all" preference.** The interview recommendation of a small ranked list with a view-all escape differs from the built paged full set this contract funds [SME - Ben Lane, 13.07.2026]. Decides: owner with Design. Blocks: nothing in the contract - the paged design strictly supersets the data a top-N would need, but a top-N-by-balance variant would want `sortBy` extended beyond `name`.
4. **SME attribution conflict.** The Step 6 dossier names the 13 Jul 2026 SME as "Marvin"; this project's Step 2 records record Ben Lane for the same interview. Both stay recorded; whoever holds the recording settles it. Decides: owner. Blocks: nothing technical; it decides who confirms items 3 and 7.
5. **`pageSize` maximum (100) and the 1-based `page` naming** are this contract's decisions, made to complete the pagination contract. Decides: owner + backend. Blocks: nothing; either is a one-line change.
6. **API 3 volume posture.** The picker deliberately serves the full set; if the confirmed account ceiling is far above 50, this endpoint becomes a server-searched typeahead instead. Decides: backend team with the owner, on the confirmed ceiling [TO CONFIRM - backend team]. Blocks: API 3's final shape only.
7. **Worst-realistic account ceiling.** "Up to 50, sometimes more" is the only citable figure [SME - Ben Lane, 13.07.2026]; no hard maximum exists. Decides: backend team (a live query settles it). Blocks: the BOUNDED verdict on API 3 and the `pageSize` maximum.
8. **Currency / locale formatting rules - Unreviewed dossier finding.** The dossier records a live localisation defect (a pound sign shown for a US organization on this widget [LIVE, 23 Jul 2026]); this project records no locale rule at all and the build formats US dollars. The API side is settled (raw decimals, no formatting on the wire), but whether a currency or locale indicator must be served is unresolved. Decides: owner (the finding is Unreviewed; no reconciliation file exists for this widget). Blocks: nothing on the wire today.
9. **Available/unrestricted cash vs raw bank total - Unreviewed dossier finding, flagged "Do now" by its author.** Distinguishing available from total cash needs fund data this contract does not carry. Both positions stand: the dossier urges the framing now; the project's design carries no such field. Decides: owner + SME. Blocks: nothing specced; if accepted it is a new field or endpoint.
10. **Remaining Unreviewed dossier findings** (multiple widget instances with a saved default account; labelling the unreconciled-only basis with an optional all-items view; values readable as text with overdrawn obvious everywhere - the last likely satisfied as built). No reconciliation file exists, so none has an owner status. Decides: owner. Blocks: the parts each touches, none of which required inventing contract fields.
11. **Negative balances in the bar presentation.** The legacy rule (pie excluded them) covered only a chart that is not carried forward; the served data includes them and the design renders them left of the zero axis with the gap named on screen. Decides: Design + owner (not yet named). Blocks: nothing on the wire - the rows are served either way.
12. **Glance always showing the all-accounts aggregate regardless of selection.** The same exception pattern as other widgets; flagged for owner confirmation. Blocks: nothing; API 1 already ignores account selection by construction.
13. **Last Reconciled visibility** (a visible date or status). Decides: experts/dev with the owner. Blocks: nothing; adds fields if approved.
14. **Permission right and the no-right treatment.** The exact Modern right for these reads, and whether a user without it sees a hidden widget, an empty widget or an error card [TO CONFIRM - backend team / dev; product side owner]. Blocks: the 403 handling's on-screen half.
15. **Loading and error treatments** are unspecified in every source and deliberately not invented; paging makes every page turn a round trip, so this widget needs a loading treatment more than most. Decides: Design + owner. Blocks: nothing on the wire.
