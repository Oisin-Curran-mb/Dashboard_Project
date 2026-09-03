# Deposit Accounts - API Spec

**Status: DRAFT - not final**

> Naming: the widget is titled **Deposits on Hand**. The modern API key, this folder and every path below use `deposit-accounts` [CODE, Widget_Comparison_Classic.html].

## Overview

The widget shows the balances the organisation holds in deposit accounts (depositor money it manages, distinct from operational cash), grouped by account type, as of a chosen date, with a comparison against a prior point and a balance-over-time view. Staff use it to see where depositor money sits, whether it is moving, and to inspect any one account. The scope is a single bank account context, and depositor accounts run to the hundreds or thousands at large organisations, so the account list is a paginated server read and every figure on screen is a server aggregate over the full scoped set, never over a visible page.

This contract defines four APIs: a scope lookup that feeds the searchable All Accounts / type / account filter (API 1), a bounded balances summary fired on render and on every scope or comparison change (API 2), a paginated, server-sorted, server-searched account row list for the table (API 3), and a balance series read for the sparkline and the Trend view (API 4). The justification for exactly four lives in the API inventory. There are no writes.

## Design → API coverage

| Design element | Type | API | Field(s) | Provenance |
|---|---|---|---|---|
| Glance headline balance (also the Explore/Detail header figure) | KPI | API 2 | `total.balance` | DERIVED `SUM(DH_Transaction.Amount WHERE TransactionDate <= asOfDate)` per account, summed over the scoped set [CODE, Widget_Comparison_Classic.html] |
| Delta pill beside the headline (signed percent, up/down direction) | KPI | API 2 | `total.diffPct`, `total.diffAmount` (the sign drives the direction cue) | NEW (no endpoint returns a non-today balance); formula in Tables [BUILD] |
| Compare To control ("vs week / month / period / quarter / fiscal year / calendar year") | filter | none (static enum) | `compareTo` param, echoed in API 2 and API 4 responses | STATIC enum [BUILD]; fiscal period ordering per the Time Window Module [DOC, Step 4] |
| Glance sparkline of the total over the chosen window, with the point-by-point readout | chart series | API 4 | `points`, `series[].values` at `groupBy=total` | NEW (no historical endpoint exists today) [BUILD] |
| Scope chip label (All Accounts / Account Type: X / Account: Y) | filter | API 1 | client filter state, labels from `types[].name` / `accounts[].name` | STORED DH_Type.Name, DH_Account.Name [CODE] |
| Scope popover options (All Accounts, type list, account list, with search) | filter | API 1 | `types[]`, `accounts[]` (each row `accountId`, `name`, `accountNumber`, `typeId`, `typeName`) | STORED DH_Type / DH_Account [CODE]; search is a server param because the account set is unbounded |
| Scope popover result-count disclosure when matches exceed the returned page | filter | API 1 | `totalAccountMatches` | NEW (the lookup today returns types only) [CODE, Widget_Comparison_Classic.html] |
| View toggle (Table / Distribution / Trend at Explore; Balances / Trend at Detail) | view toggle | none | none needed: client view state; see Call sequence for which switches fetch | client state [BUILD] |
| Table Name column with the account number under the name | table column | API 3 | `rows[].name`, `rows[].accountNumber` | STORED DH_Account.Name, DH_Account.AccountNumber [CODE]; the number is mandatory because names are not unique [DOC, Step 6 dossier gap 14] |
| Table Type badge column | table column | API 3 | `rows[].typeName`, `rows[].typeId` | STORED DH_Type.Name / DH_Type.TypeID via DH_Account.TypeID [CODE] |
| Table Trend column (signed percent change across the selected window) | table column | API 3 | `rows[].windowChangePct` | NEW; formula in Tables; pre-signed, null when the baseline balance is zero [BUILD] |
| Table Balance column | table column | API 3 | `rows[].balance` | DERIVED, same balance formula per account [CODE] |
| Table sort (all four columns; default Balance descending) | interaction | API 3 | `sortBy`, `sortDir` params | contract (the table paginates, so sort is server-side) [BUILD default] |
| Table Total row | table column | API 3 | `totalBalance` (full scoped set, never the page, and deliberately ignoring `q`) | NEW aggregate [BUILD] |
| Pager ("Showing X to Y of Z accounts", "Page N of M") | interaction | API 3 | `totalCount`, `page`, `pageSize` echo | contract [BUILD] |
| Table search box | filter | API 3 | `q` param | contract (the table paginates, so search is server-side; see Still needs sign-off item 10) |
| Distribution donut slices and legend rows (name and amount as text) | chart series | API 2 | `groups[]` (each `kind`, `id`, `name`, `balance`, `accountNumber` for account-kind rows) | DERIVED per-type or per-account balance aggregates [CODE formula, BUILD shape] |
| Distribution legend percent per slice, and the Others bucket | chart series | none | client derivation: share = group `balance` over `total.balance`; Others = `total.balance` minus the sum of returned groups | DERIVED client [BUILD] |
| Donut centre total | chart series | API 2 | `total.balance` (client-formatted) | DERIVED [BUILD] |
| Breakdown toggle (Total / By Account Type at All Accounts; Total / By Account at a type) | view toggle | API 4 | `groupBy` param on the series read; the donut side is a client view over held `groups[]` and `total` | contract [BUILD] |
| Trend multi-line chart, x-axis point labels, legend rows with last values | chart series | API 4 | `points`, `series[]` (each `kind`, `id`, `name`, `accountNumber`, `values`) | NEW (no historical endpoint exists today) [BUILD] |
| Chart drill: a type slice or type line click re-scopes the widget to that type and switches the breakdown to By Account; account-series clicks and the Others bucket are inert | drill | none new | a normal re-request with `accountTypeId` set; no drill endpoint | contract [BUILD] |
| Table row (account name) click opens the account detail modal (that account's Trend / Table) | drill | API 4 | `accountId`-scoped series; the modal's other figures are the already-held API 3 row | contract [BUILD] |
| KPI card title reflecting the active scope | state | none | client filter state | client state [BUILD] |
| Empty state ("No deposit accounts", with the Add account prompt) | state | API 2 | `accountCount` = 0 at All Accounts scope is the trigger | contract [BUILD] |
| Filter-matches-none state (a scoped type with no accounts) | state | API 2 + API 3 | well-formed zero shapes (`total.balance` 0, `groups` empty, `rows` empty, `totalCount` 0) | contract [BUILD; DOC, Step 6 dossier state 4] |
| Loading and error states, with Retry | state | none | client transitions; Retry re-fires the failed call | client state [BUILD] |
| Add account action (opens a prompt pointing to the module's New deposit account form) | action | none | navigation intent only; no dashboard write | client [BUILD] |
| Refresh control | action | all four | re-fires the active calls with a fresh `asOfDate` anchor | contract [DOC, Step 1 research: legacy refresh clears cache and reloads] |

## Tables

| Table / repository | Fields and members used |
|---|---|
| `DH_Account` | `AccountId`, `AccountNumber`, `Name`, `TypeID`, `Active`: the account rows, identity, and the active predicate [CODE, Widget_Comparison_Classic.html] |
| `DH_Type` | `TypeID`, `Name`, `BankAccountID`: the type dimension, the type lookup, and the bank-account scope chain [CODE, Widget_Comparison_Classic.html] |
| `DH_Transaction` | `AccountID`, `TransactionDate`, `Amount`: every balance at every date is a sum over these rows [CODE, Widget_Comparison_Classic.html] |

No new tables and no schema changes are needed: the contract is new queries against existing tables. The new query shapes are the comparison-date balance, the point-in-time series reconstruction, the paginated/sorted/searched row read, and the account typeahead.

Core formulas and always-applied filters, each quotable in isolation:

- **Balance of an account as of a date:** `SUM(DH_Transaction.Amount) WHERE AccountID = account AND TransactionDate <= asOfDate`. [CODE, Widget_Comparison_Classic.html] Caveat: the legacy widget computes balances through `DHAccount.CalcBalance()`, which may apply adjustments beyond this plain sum; balances must be verified to tie out before build (Still needs sign-off item 5). [DOC, Step 1 - Dashboard Research/07 - Deposit Accounts.md]
- **Active filter, applied to every read of account rows:** `DH_Account.Active = true`. [CODE, Widget_Comparison_Classic.html]
- **Bank-account scoping, applied to every query:** accounts are in scope when their type's `DH_Type.BankAccountID` equals the `X-BankAccountID` context header. This widget is scoped by bank account, not by company. [CODE, Widget_Comparison_Classic.html]
- **Baseline date:** the as-of date one `compareTo` unit before `asOfDate`, on the organisation's fiscal calendar for `period`, `quarter` and `fiscalYear` (Time Window Module). The exact anchor rule per unit is [TO CONFIRM] (dev team + Oisin Curran); see Still needs sign-off item 8.
- **`comparisonBalance`:** the same balance formula evaluated at the baseline date.
- **`diffAmount` = `balance - comparisonBalance`**, pre-signed. **`diffPct` = `diffAmount / comparisonBalance * 100`**, one decimal, pre-signed, `null` when `comparisonBalance` is zero.
- **`windowChangePct` (per account):** the same `diffPct` formula per account: that account's balance against its own baseline-date balance, pre-signed, `null` when the baseline balance is zero. The series window starts at the baseline date, so the KPI delta, the table Trend column and the series endpoints agree by construction.

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Endpoints | Three reads: `GET /api/dashboard/deposit-accounts/filters` (type list, "Show All" prepended server-side), `GET .../grid?accountTypeId={guid}` (all account rows, unpaginated), `GET .../chart` (per-type sums, always all types, ignoring the filter) [CODE, Widget_Comparison_Classic.html] | Four reads (this contract). The grid read is reshaped into API 3 (paginated, sorted, searched); the chart read's aggregation moves into API 2 and respects the scope; the filters read is reshaped into API 1 (types plus account typeahead) |
| Balance | Today only, single point per account (`EndingBalance`) [CODE] | DERIVED at any `asOfDate`, plus a NEW baseline-date balance behind every comparison field |
| Comparison / delta | None [CODE] | NEW: `comparisonBalance`, `diffAmount`, `diffPct` at total level; `windowChangePct` per account row. All pre-signed server-side |
| History / series | None; no endpoint returns more than one point in time [CODE] | NEW capability: API 4 reconstructs point-in-time balances per total / type / account from `DH_Transaction` |
| Pagination, sort, search | None; the grid returns every account, ordered Name then InceptionDate, fixed [CODE] | NEW: `page`/`pageSize`, `sortBy`/`sortDir` (whitelist, unique tiebreaker), `q`, `totalCount`, `totalBalance` over the full scoped set |
| Account lookup | Type list only; account-level scoping does not exist [CODE] | NEW: server-side account typeahead in API 1 (`q`, `limit`, `totalAccountMatches`), because the account set is unbounded |
| Type breakdown vs the filter | The chart always shows all types regardless of the dropdown [CODE] | The distribution respects the scope: one scope state drives every view [BUILD] |
| Snapshot anchor | None | NEW: `asOfDate` accepted by and echoed from every API, so the summary, rows and series reconcile |

## API inventory

| API | Purpose | Trigger (when it fires) | Cardinality | R/W | Cache posture | Split trigger |
|---|---|---|---|---|---|---|
| API 1: Scope lookup | The scope popover: type list plus server-searched account matches | Popover open, and each (debounced) search keystroke | Types: 12 in the demo set [BUILD], org-configured, ceiling [TO CONFIRM] (Marvin); accounts capped at `limit` per response | R | LIVE (cheap capped read; types change rarely but the account list changes on every account add) | Trigger gap (fires on popover interaction, never on render) and lifetime gap versus the balance reads |
| API 2: Balances summary | The bounded aggregates behind the KPI, delta, donut and empty-state trigger | Widget render, every scope change, every Compare To change, Refresh | 1 total + at most max(type count, `maxGroups`) group rows | R | LIVE per request | Cardinality gap: the bounded summary must never pay for the unbounded row list |
| API 3: Account rows | The paginated table: rows, full-set total, match count | Table/Balances view render, page turn, sort, search, and every scope or Compare To change while a table is visible | One page (`pageSize` rows, default 50); underlying set hundreds to thousands [DOC, Step 6 dossier] | R | LIVE per request | Cardinality gap from API 2; trigger gap (never fetched for Glance or a chart-only view) |
| API 4: Balance series | Point-in-time balance series for the sparkline and the Trend view | Glance render, Trend view render, breakdown change, and every scope or Compare To change while either is visible | Series count × points: 1 × M at total grain, T types × M at type grain, A accounts × M at account grain (M is 8 to 12) | R | LIVE per request (standing ruling: series are computed on demand; precompute only if performance forces it) | Grain gap (time series versus snapshot) and conditional weight (heavy reconstruction only some views need) |

Merges considered, closed: API 2 and API 3 fire together whenever a table is visible and could be one response, but they are kept separate because Glance and the chart-only views must never pay for a row page, and a page turn must never re-pay for the aggregates: the cardinality and trigger gaps both fire. API 4's total-grain series could ride inside API 2 for Glance, but the series is the single most expensive read in the contract (M point reconstructions per entity) and the Table and Distribution views never need it: conditional weight keeps it out. API 1 stays separate from API 2 because it serves interaction, not render, and its account search is its own query shape.

## Call sequence

| Interaction | Calls fired | Notes |
|---|---|---|
| Initial load, Glance | API 2 + API 4 (`groupBy=total`) | API 2's `asOfDate` echo is the anchor; the client passes the same `asOfDate` to API 4 |
| Initial load, Explore (Table default) | API 2 + API 3 | Same shared `asOfDate` anchor across both |
| Initial load, Detail (Balances: table beside donut) | API 2 + API 3 | The donut renders from API 2 `groups[]`; no extra call |
| Change scope (chip: All Accounts / a type / an account) | API 2 + the active view's data call (API 3 for Table/Balances, API 4 for Trend or Glance; none extra for Distribution) | `page` resets to 1; a fresh `asOfDate` anchor is taken from API 2 |
| Change Compare To | Same set as a scope change | Every comparison-derived field and the series window change |
| Open the scope popover / type in its search | API 1 (per debounced keystroke) | `q` searches account names, account numbers and type names server-side |
| Switch view Table ↔ Distribution | none | Distribution renders from held API 2 `groups[]` and `total` |
| Switch view to Trend | API 4 with the current `groupBy` | Held responses stay valid; the series is fetched on demand |
| Breakdown toggle (Total ↔ By Account Type / By Account) on Trend | API 4 with the new `groupBy` | On the donut the same toggle is a client re-render over held data |
| Chart drill (click a type slice / type line) | Same as a scope change to that type | The client sets `accountTypeId` and the breakdown to By Account; account-series clicks and Others are inert, no call |
| Table sort, page turn, search input | API 3 only | Aggregates and charts do not change: `totalBalance` and API 2 figures span the full scoped set regardless of page, sort or `q` |
| Open account detail modal (table row name click) | API 4 (`accountId`, `groupBy=total`) | The modal's balance, type and window-change figures are the already-held API 3 row |
| Add account (empty state) | none | Client prompt; navigation to the module form is outside this contract |
| Retry (error state) | The failed call again | Client keeps the last good `asOfDate` anchor if any |
| Refresh | The active view's calls, without an `asOfDate` param | The server anchors to today and the client adopts the new echoed `asOfDate` |

Consistency across calls: `asOfDate` is the shared snapshot anchor. API 2 (or the first call of a load) echoes the date it evaluated at; the client passes that date to every companion call so the table total, donut, KPI and series final point are computed over the same as-of date. The anchor is date-grain: two calls anchored to the same date can still straddle a same-day posting, because balances include rows with `TransactionDate` equal to the anchor date. That residual intraday drift is accepted; Refresh is the recovery.

## Filter architecture

| Filter | Option source | Cardinality | Execution | Aggregate effect | Cascade | "All" wire form | Round trips |
|---|---|---|---|---|---|---|---|
| Account scope (All Accounts / type / account) | LOOKUP: API 1 | Types: 12 [BUILD], ceiling [TO CONFIRM] (Marvin); accounts: hundreds to thousands [DOC, Step 6 dossier], so the account list is a searchable server-side lookup | SERVER: `accountTypeId` or `accountId` on APIs 2, 3, 4 | Yes: every total, group, row set and series re-scopes | None: the popover always offers the full scope space (types and accounts are not narrowed by the current selection) | Omit both scope params [CODE precedent: the grid read omits `accountTypeId` for all] | API 2 + the active view's data call (1 to 2) |
| Compare To | STATIC enum: `week`, `month`, `period`, `quarter`, `fiscalYear`, `calendarYear` | 6, fixed [BUILD] | SERVER: `compareTo` on APIs 2, 3, 4 | Yes: `comparisonBalance`, `diffAmount`, `diffPct`, every `windowChangePct`, and the series window | None | Not applicable: there is no "All"; the default is `quarter` [BUILD] | API 2 + the active view's data call (1 to 2) |
| Table search box | Free text | Unbounded input | SERVER: `q` on API 3. The table paginates, so search must span the full scoped set server-side | On `rows` and `totalCount` only. `totalBalance` deliberately ignores `q`: the Total row is the scope total, and the search is a locate aid, not a scope change [BUILD semantics] | None | Omit `q` | 1 (API 3 only) |
| Legend find (Distribution / Trend legends) | Free text, same input control | Over the held groups or series | CLIENT: the full set is already present in the held response, it is bounded (type count at type grain, `maxGroups` at account grain), and hiding legend rows changes no server-computed aggregate: all three Framework 1 conditions hold | No | None | Empty input shows all | 0 |

- **Combination semantics:** all filters combine with AND and narrow. Scope and Compare To are independent; `q` further narrows API 3's rows within the scope.
- **Conflict rule:** `accountId` and `accountTypeId` sent together is rejected with a named 400 error `scope_conflict`; the two params are mutually exclusive by contract. A `groupBy` invalid for the scope (`type` outside All Accounts, `account` outside a single-type scope) is rejected with a named 400 error `invalid_groupBy`. Nothing is left undefined.
- **Blank values:** every active account has a `TypeID` (the type join is the scope chain), so there is no blank-type population for "All" to include or a type value to exclude. An account with no transactions is a legitimate zero-balance row, included in every scope it belongs to; a zero balance never drops a row.
- **Overlapping value spaces:** API 1's `q` matches account names, account numbers and type names at once, so one query can legitimately match a type and no account, or the reverse; each list simply renders its own matches, and no combination is an error.
- **Cascade invalidation:** there is no cascading lookup. A stale scope value (an account or type deactivated since the popover was fetched) yields a well-formed empty response; the client refetches API 1 and resets the scope to All Accounts.
- **Empty-result semantics:** any valid scope matching nothing returns well-formed zeros (see each API's State contracts), never an error.

## Volume and performance

| Dataset | Typical rows | Worst realistic rows (basis) | Row width | Payload at worst | Verdict | Server cost model | Cache posture |
|---|---|---|---|---|---|---|---|
| API 1 lookup response | 12 types + a handful of account matches [BUILD: 12 types, 125 accounts] | Types ceiling [TO CONFIRM] (Marvin); account matches capped at `limit` (default 50) regardless of the underlying set (hundreds to thousands [DOC, Step 6 dossier]) | 5 fields, ~120 bytes per account row | ~10 KB at the cap | BOUNDED (server-capped search page) | Single indexed scan of `DH_Type` + name/number-filtered scan of `DH_Account`, both bank-account scoped | LIVE |
| API 2 summary | 12 type groups [BUILD] | Type count [TO CONFIRM] (Marvin) at All Accounts; at a type scope, at most `maxGroups` (14) account groups | 5 fields, ~110 bytes per group | A few KB at any plausible type count | MUST AGGREGATE SERVER-SIDE (the client never holds the account rows behind the total or the ranking) | One pass over active scoped accounts joining `DH_Transaction`, two windowed SUM reconstructions per account (asOfDate + baseline date), grouped and ranked | LIVE |
| API 3 account rows | 125 accounts in the demo set [BUILD], one 50-row page per response | Hundreds to thousands of depositor accounts [DOC, Step 6 dossier]; exact ceiling [TO CONFIRM] (Marvin) | 7 fields, ~200 bytes per row | ~10 KB per 50-row page; `totalCount` bounds the pager, not the payload | MUST PAGINATE | Full-set pass for `totalBalance`/`totalCount` plus two windowed SUM reconstructions per returned row (balance + baseline for `windowChangePct`); sort on the computed columns happens before the page slice | LIVE |
| API 4 series | Total grain: 1 × M (M = 8 to 12 points) [BUILD]; type grain: 12 × M ≈ 108 values [BUILD] | Account grain is N accounts in the scoped type × M points, per request. N per type is [TO CONFIRM] (Marvin); at 500 accounts and M = 12 that is 6,000 point reconstructions in one request. Pagination does not reduce it: type- and total-grain series sum over every account in scope, not a visible page | 1 number per point + ~80 bytes of series identity | Tens of KB at type grain; account grain scales with N × M | Total and type grain: BOUNDED (config-defined dimensions). Account grain: BOUNDED only conditionally on the [TO CONFIRM] per-type ceiling; if that ceiling is materially large this flips to MUST AGGREGATE SERVER-SIDE with a capped top-N contract, which must be written before build (Still needs sign-off item 7) | N entities × M points, each point one windowed SUM over `DH_Transaction`; this is the contract's heaviest read and the reason it is its own API | LIVE (standing ruling: computed on demand; precompute later only if performance forces it) |

Series windows per `compareTo` [BUILD; production grain to confirm, Still needs sign-off item 9]: `week` = 8 daily points; `month`, `period`, `quarter` = 9 weekly points; `fiscalYear` = 12 fiscal-period points; `calendarYear` = 12 monthly points. The N × M product at account grain is stated above and in the API 4 section.

### Pagination contract

API 3 paginates; nothing else does.

- **Params:** `page` (1-based, default 1), `pageSize` (default 50 [BUILD, owner-accepted]; maximum [TO CONFIRM] (Oisin Curran), and the server must enforce one so an unbounded `pageSize` cannot re-create the problem pagination solves).
- **What paginates:** exactly the `rows[]` array.
- **What does not:** `totalBalance` and `totalCount` compute over the full scoped set (`totalCount` over the `q`-matched set), and every API 2 aggregate and API 4 series spans the full scoped set. Switching pages changes no total, donut, KPI or trend line.
- **Sort params:** `sortBy` whitelist `name`, `typeName`, `windowChangePct`, `balance`; `sortDir` `asc` or `desc`. Default `balance` `desc` [BUILD].
- **Deterministic total order:** every sort ends in `accountId` ascending as the unique tiebreaker, so page boundaries are stable across requests.
- **`totalCount`** is returned alongside every page, with the `page`/`pageSize` echo, so the client renders the pager without a second call.
- **Past the last page:** empty `rows[]`, correct `totalCount` and `totalBalance`, not an error.

## Where computation lives

| Value | Server or client | Basis | Why |
|---|---|---|---|
| Per-account balance | SERVER | Windowed SUM over `DH_Transaction` | Spans rows the client never holds |
| Total balance (KPI, donut centre, table Total row) | SERVER | Aggregate over the full scoped set | The row list is paginated; a client sum would cover one page |
| `comparisonBalance`, `diffAmount`, `diffPct` | SERVER | Baseline-date reconstruction | Spans data the client never holds; deltas are returned pre-signed so the client formats and never does math or sign-checking |
| Division-by-zero rule | SERVER | `diffPct` and `windowChangePct` are `null` when their baseline balance is zero; never `0`, never omitted | One explicit rule, owned by the divider |
| Per-account `windowChangePct` (table Trend column) | SERVER | Same formula per account | Sortable server-side, so it must be computed server-side |
| Group balances (per type / top accounts) | SERVER | GROUP BY over the scoped set | Same |
| Top-accounts ranking at a type scope (`maxGroups`) | SERVER | ORDER BY balance descending over all accounts in the type | The client cannot rank a set it holds one page of |
| Donut share percentages | CLIENT | Group `balance` over held `total.balance` | Pure arithmetic over held values; the zero-total case renders the empty state, so no division occurs |
| Others bucket value | CLIENT | `total.balance` minus the sum of returned groups | Pure arithmetic over held values |
| Series points | SERVER | One windowed SUM per entity per point | Spans full transaction history |
| Sparkline readout values and the delta pill direction | CLIENT | Held series values; the pill direction is the sign of held `diffAmount` | Presentation over held, pre-signed values; the up/down cue is always paired with the signed number, never a lone signal |
| Slice-count trimming below `maxGroups` and legend find | CLIENT | Held bounded groups/series | View logic over a held bounded set |
| Page count (Page N of M) | CLIENT | `ceil(totalCount / pageSize)` | Pure arithmetic over returned values |
| Presentation thresholds | CLIENT | The only band in the design is the sign of a delta | No numeric threshold exists in the design; the declining-account flag is unfunded and open (Still needs sign-off item 4), not silently defaulted |

## API 1: Scope lookup

### Endpoint

```
GET /api/dashboard/deposit-accounts/scope-options
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `q` | string | no | free text | omitted (no text filter) | Case-insensitive contains-match against type names, account names and account numbers |
| `limit` | int | no | 1 to the server maximum ([TO CONFIRM] (Oisin Curran)) | 50 | Caps the `accounts[]` list; `types[]` is never capped (bounded by config) |

Context header: `X-BankAccountID` (see Auth and scoping).

### Example requests

```
GET /api/dashboard/deposit-accounts/scope-options
GET /api/dashboard/deposit-accounts/scope-options?q=res&limit=50
```

Nothing here needs URL-encoding beyond normal query encoding of `q` (spaces and punctuation in search text must be percent-encoded).

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `types[]` | array | DERIVED container (see child rows) | Every type in the bank-account scope, ordered by name, filtered by `q` when present |
| `types[].typeId` | guid | STORED DH_Type.TypeID [CODE] | Type identity |
| `types[].name` | string | STORED DH_Type.Name [CODE] | Type display name |
| `accounts[]` | array | DERIVED container (see child rows) | Active accounts matching `q`, ordered by name then `accountId`, capped at `limit` |
| `accounts[].accountId` | guid | STORED DH_Account.AccountId [CODE] | Account identity |
| `accounts[].name` | string | STORED DH_Account.Name [CODE] | Account name; not unique, so never an identity |
| `accounts[].accountNumber` | string | STORED DH_Account.AccountNumber [CODE] | Full account number; the client decides its display treatment |
| `accounts[].typeId` | guid | STORED DH_Account.TypeID [CODE] | The account's type |
| `accounts[].typeName` | string | STORED DH_Type.Name [CODE] | Denormalised for the popover's type badge |
| `totalAccountMatches` | int | NEW (COUNT over the matched set) | How many accounts matched `q` before the `limit` cap, so the client can disclose truncation |

### Example response

```json
{
  "types": [
    { "typeId": "7d3f0a52-1c9e-4b8a-9f21-3e5d8c440a11", "name": "Restricted Funds" }
  ],
  "accounts": [
    { "accountId": "b4a1f6c2-9d0e-4f7b-8a35-6c2e9d114b02", "name": "Memorial", "accountNumber": "0044171234", "typeId": "7d3f0a52-1c9e-4b8a-9f21-3e5d8c440a11", "typeName": "Restricted Funds" },
    { "accountId": "c9e2d7a4-3b1f-4c6d-9e58-7f3a1b225c13", "name": "Capital", "accountNumber": "0044175610", "typeId": "2a6b9e17-5d4c-4a3f-8b62-9c1d7e330f24", "typeName": "Operating Reserve" }
  ],
  "totalAccountMatches": 2
}
```

Reconciliation: 2 account rows returned and `totalAccountMatches` is 2, so 2 + 0 = 2 matches are shown and none are truncated.

### State contracts

| State | Response |
|---|---|
| Empty (no rows match `q`) | `types: []`, `accounts: []`, `totalAccountMatches: 0`; the popover renders its no-matches message |
| Partial (more matches than `limit`) | `accounts[]` holds the first `limit` matches; `totalAccountMatches` carries the full count |
| Not-yet-existing entity (org has no deposit accounts) | `types[]` still lists configured types; `accounts: []`, `totalAccountMatches: 0` |
| Permission denied | 403 with a machine-readable error code; widget-level behaviour is undecided (Still needs sign-off item 6) |
| Upstream unavailable | 5xx with a machine-readable error code; the client shows the error state with Retry |

## API 2: Balances summary

### Endpoint

```
GET /api/dashboard/deposit-accounts/summary
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `accountTypeId` | guid | no | a `typeId` from API 1 | omitted (all accounts) | Scopes to one type; mutually exclusive with `accountId` |
| `accountId` | guid | no | an `accountId` from API 1 or API 3 | omitted | Scopes to one account; mutually exclusive with `accountTypeId` |
| `compareTo` | enum | no | `week`, `month`, `period`, `quarter`, `fiscalYear`, `calendarYear` | `quarter` | Comparison unit; `period` is a fiscal period on the org fiscal calendar, ordered between month and quarter |
| `asOfDate` | date | no | any date not after today | today | Snapshot anchor; a future date is rejected with a named 400 error `invalid_asOfDate` |
| `maxGroups` | int | no | 1 to 14 | 14 | Applies only at a single-type scope: caps the ranked account groups returned [BUILD: no view renders more than 14 slices] |

Context header: `X-BankAccountID`.

### Example requests

```
GET /api/dashboard/deposit-accounts/summary?compareTo=quarter
GET /api/dashboard/deposit-accounts/summary?accountTypeId=7d3f0a52-1c9e-4b8a-9f21-3e5d8c440a11&compareTo=quarter&asOfDate=2026-09-02
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOfDate` | date | DERIVED echo of the request | The snapshot date the balances were evaluated at; the anchor the client passes to APIs 3 and 4 |
| `compareTo` | enum | DERIVED echo of the request | The comparison unit applied |
| `scope` | object | DERIVED container (see child rows) | Echo of the applied scope |
| `scope.accountTypeId` | guid or null | DERIVED echo of the request | Applied type scope, `null` at All Accounts |
| `scope.accountId` | guid or null | DERIVED echo of the request | Applied account scope |
| `total` | object | DERIVED container (see child rows) | The scoped aggregate |
| `total.balance` | number | DERIVED windowed SUM over `DH_Transaction` per account, summed over scope [CODE] | The headline figure |
| `total.comparisonBalance` | number or null | NEW baseline-date reconstruction | Balance as of the baseline date; `null` when no transaction history reaches the baseline date |
| `total.diffAmount` | number or null | NEW, `balance - comparisonBalance`, pre-signed | `null` when `comparisonBalance` is `null` |
| `total.diffPct` | number or null | NEW, `diffAmount / comparisonBalance * 100`, pre-signed, one decimal | `null` when `comparisonBalance` is zero or `null` |
| `accountCount` | int | DERIVED COUNT of active accounts in scope | The empty-state trigger: 0 at All Accounts means the org has no deposit accounts |
| `groups[]` | array | DERIVED container (see child rows) | At All Accounts: one row per type with at least one active account. At a type scope: the top `maxGroups` accounts by balance descending. At an account scope: empty |
| `groups[].kind` | enum | NEW: `type` or `account` | Which dimension the row is |
| `groups[].id` | guid | STORED DH_Type.TypeID or DH_Account.AccountId [CODE] | Group identity; the chart drill sends it back as `accountTypeId` |
| `groups[].name` | string | STORED DH_Type.Name or DH_Account.Name [CODE] | Display name |
| `groups[].accountNumber` | string or null | STORED DH_Account.AccountNumber [CODE] | Present on account-kind rows for disambiguation; `null` on type-kind rows |
| `groups[].balance` | number | DERIVED, same balance formula grouped [CODE] | The slice value; the client derives shares and the Others bucket from these plus `total.balance` |

### Example response

All Accounts, `compareTo=quarter` (a three-type example org):

```json
{
  "asOfDate": "2026-09-02",
  "compareTo": "quarter",
  "scope": { "accountTypeId": null, "accountId": null },
  "total": { "balance": 3602980, "comparisonBalance": 3344120, "diffAmount": 258860, "diffPct": 7.7 },
  "accountCount": 37,
  "groups": [
    { "kind": "type", "id": "5f2e8b31-4a7d-4c9e-8d16-2b9f6a558e01", "name": "Checking", "accountNumber": null, "balance": 1412500 },
    { "kind": "type", "id": "8c4d1f72-6e3a-4b5c-9a28-4d7e2c669f12", "name": "Savings", "accountNumber": null, "balance": 986300 },
    { "kind": "type", "id": "7d3f0a52-1c9e-4b8a-9f21-3e5d8c440a11", "name": "Restricted Funds", "accountNumber": null, "balance": 1204180 }
  ]
}
```

Reconciliation: the type groups sum to the total, 1,412,500 + 986,300 + 1,204,180 = 3,602,980; and the comparison plus the pre-signed diff rebuilds the balance, 3,344,120 + 258,860 = 3,602,980. `total.balance` here must equal API 3's `totalBalance` and API 4's final total-grain series value for the same scope and `asOfDate`.

Single-type scope (Restricted Funds), showing account-kind groups:

```json
{
  "asOfDate": "2026-09-02",
  "compareTo": "quarter",
  "scope": { "accountTypeId": "7d3f0a52-1c9e-4b8a-9f21-3e5d8c440a11", "accountId": null },
  "total": { "balance": 1204180, "comparisonBalance": 1168400, "diffAmount": 35780, "diffPct": 3.1 },
  "accountCount": 16,
  "groups": [
    { "kind": "account", "id": "b4a1f6c2-9d0e-4f7b-8a35-6c2e9d114b02", "name": "Memorial", "accountNumber": "0044171234", "balance": 402300 },
    { "kind": "account", "id": "e1c8a5d3-7f2b-4e9a-b647-8a4c3d771e25", "name": "Capital", "accountNumber": "0044178842", "balance": 318750 },
    { "kind": "account", "id": "f6b3d9e4-2a8c-4d1f-9c53-5e9b4f882d36", "name": "Benevolence", "accountNumber": "0044172219", "balance": 296880 }
  ]
}
```

Reconciliation: the client's Others bucket is the total minus the returned groups, and 402,300 + 318,750 + 296,880 + 186,250 = 1,204,180; and 1,168,400 + 35,780 = 1,204,180.

### State contracts

| State | Response |
|---|---|
| Empty (org has no deposit accounts) | `accountCount: 0`, `total.balance: 0`, comparison fields `null`, `groups: []`; at All Accounts the client renders the "No deposit accounts" state |
| Empty (a scoped type or account matches no active accounts) | Same zero shape with the scope echoed; the client renders the filter-matches-none state, not an error |
| Partial (history does not reach the baseline date) | `total.balance` valid; `comparisonBalance`, `diffAmount`, `diffPct` all `null`; the client renders the balance without a delta pill |
| Permission denied | 403 with a machine-readable error code; widget-level behaviour undecided (Still needs sign-off item 6) |
| Upstream unavailable | 5xx with a machine-readable error code; the client shows the error state with Retry |

## API 3: Account rows

### Endpoint

```
GET /api/dashboard/deposit-accounts/accounts
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `accountTypeId` | guid | no | a `typeId` from API 1 | omitted (all accounts) | Mutually exclusive with `accountId` |
| `accountId` | guid | no | an `accountId` | omitted | Scopes the table to one account (the detail modal's table) |
| `compareTo` | enum | no | `week`, `month`, `period`, `quarter`, `fiscalYear`, `calendarYear` | `quarter` | Drives every row's `windowChangePct` |
| `asOfDate` | date | no | any date not after today | today | The anchor echoed by API 2; a future date is rejected with `invalid_asOfDate` |
| `q` | string | no | free text | omitted (no search) | Server-side contains-match on account name; narrows `rows[]` and `totalCount`, never `totalBalance` |
| `sortBy` | enum | no | `name`, `typeName`, `windowChangePct`, `balance` | `balance` | Whitelisted sortable fields |
| `sortDir` | enum | no | `asc`, `desc` | `desc` | Sort direction; the total order always ends in `accountId` ascending as the unique tiebreaker |
| `page` | int | no | 1 or greater | 1 | 1-based page index |
| `pageSize` | int | no | 1 to the server maximum ([TO CONFIRM] (Oisin Curran)) | 50 | Rows per page [BUILD, owner-accepted] |

Context header: `X-BankAccountID`.

### Example requests

```
GET /api/dashboard/deposit-accounts/accounts?compareTo=quarter&page=1&pageSize=50
GET /api/dashboard/deposit-accounts/accounts?accountTypeId=7d3f0a52-1c9e-4b8a-9f21-3e5d8c440a11&compareTo=quarter&q=mem&sortBy=name&sortDir=asc&page=1&pageSize=50&asOfDate=2026-09-02
```

`q` values must be percent-encoded.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOfDate` | date | DERIVED echo of the request | The snapshot date applied |
| `page` | int | DERIVED echo of the request | The page returned |
| `pageSize` | int | DERIVED echo of the request | The page size applied |
| `totalCount` | int | NEW COUNT over the scoped, `q`-matched set | Feeds the pager ("of Z accounts", "Page N of M") |
| `totalBalance` | number | NEW aggregate over the full scoped set, ignoring `q` and paging | The table Total row; must equal API 2 `total.balance` for the same scope and `asOfDate` |
| `rows[]` | array | DERIVED container (see child rows) | One page of accounts, sorted then sliced |
| `rows[].accountId` | guid | STORED DH_Account.AccountId [CODE] | Identity and the sort tiebreaker |
| `rows[].name` | string | STORED DH_Account.Name [CODE] | Account name; not unique |
| `rows[].accountNumber` | string | STORED DH_Account.AccountNumber [CODE] | Always present: same-named accounts differ only by number [DOC, Step 6 dossier gap 14] |
| `rows[].typeId` | guid | STORED DH_Account.TypeID [CODE] | The account's type |
| `rows[].typeName` | string | STORED DH_Type.Name [CODE] | The Type badge text |
| `rows[].balance` | number | DERIVED windowed SUM as of `asOfDate` [CODE] | The Balance column |
| `rows[].windowChangePct` | number or null | NEW, per-account `diffPct` over the `compareTo` window, pre-signed, one decimal | The Trend column; `null` when the account's baseline balance is zero |

### Example response

```json
{
  "asOfDate": "2026-09-02",
  "page": 1,
  "pageSize": 50,
  "totalCount": 37,
  "totalBalance": 3602980,
  "rows": [
    { "accountId": "a7e4c2b9-1f6d-4a3e-8c25-9b5f7d663a47", "name": "General", "accountNumber": "0044177734", "typeId": "5f2e8b31-4a7d-4c9e-8d16-2b9f6a558e01", "typeName": "Checking", "balance": 412500, "windowChangePct": 4.2 },
    { "accountId": "b4a1f6c2-9d0e-4f7b-8a35-6c2e9d114b02", "name": "Memorial", "accountNumber": "0044171234", "typeId": "7d3f0a52-1c9e-4b8a-9f21-3e5d8c440a11", "typeName": "Restricted Funds", "balance": 402300, "windowChangePct": -2.8 }
  ]
}
```

Reconciliation: the two excerpt rows sum to 412,500 + 402,300 = 814,800, a page slice, never the total; `totalBalance` 3,602,980 must equal API 2's `total.balance` 3,602,980 for the same scope and `asOfDate`, and `totalCount` 37 spans the full matched set, not the page.

### State contracts

| State | Response |
|---|---|
| Empty (scope or `q` matches nothing) | `rows: []`, `totalCount: 0`; `totalBalance` still carries the scope total (0 when the scope itself is empty) |
| Partial (history does not reach the baseline date for some accounts) | Those rows carry `windowChangePct: null`; `balance` stays valid |
| Not-yet-existing entity (unknown or out-of-scope `accountId` / `accountTypeId`) | Well-formed empty shape (`rows: []`, `totalCount: 0`, `totalBalance: 0`); the client resets to All Accounts and refetches API 1 |
| Permission denied | 403 with a machine-readable error code; widget-level behaviour undecided (Still needs sign-off item 6) |
| Upstream unavailable | 5xx with a machine-readable error code; the client shows the error state with Retry |

## API 4: Balance series

### Endpoint

```
GET /api/dashboard/deposit-accounts/series
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `accountTypeId` | guid | no | a `typeId` from API 1 | omitted (all accounts) | Mutually exclusive with `accountId` |
| `accountId` | guid | no | an `accountId` | omitted | Scopes the series to one account (the sparkline in the detail modal) |
| `compareTo` | enum | no | `week`, `month`, `period`, `quarter`, `fiscalYear`, `calendarYear` | `quarter` | Sets the window, grain and point count (see Volume and performance) |
| `groupBy` | enum | no | `total`, `type`, `account` | `total` | `type` is valid only at All Accounts; `account` only at a single-type scope; anything else is rejected with `invalid_groupBy` |
| `asOfDate` | date | no | any date not after today | today | The window ends here; a future date is rejected with `invalid_asOfDate` |

Context header: `X-BankAccountID`.

### Example requests

```
GET /api/dashboard/deposit-accounts/series?compareTo=week&groupBy=total&asOfDate=2026-09-02
GET /api/dashboard/deposit-accounts/series?accountTypeId=7d3f0a52-1c9e-4b8a-9f21-3e5d8c440a11&compareTo=quarter&groupBy=account&asOfDate=2026-09-02
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOfDate` | date | DERIVED echo of the request | The window end |
| `compareTo` | enum | DERIVED echo of the request | The window applied |
| `groupBy` | enum | DERIVED echo of the request | The grain returned |
| `points[]` | array | NEW: the as-of date of each point, first = the baseline date, last = `asOfDate` | The x-axis; point count follows `compareTo` (8 daily, 9 weekly, 12 period, 12 monthly) |
| `series[]` | array | DERIVED container (see child rows) | One entry at `total`; one per type at `type`; one per account in the scoped type at `account` |
| `series[].kind` | enum | NEW: `total`, `type` or `account` | Which dimension the line is |
| `series[].id` | guid or null | STORED DH_Type.TypeID / DH_Account.AccountId [CODE]; `null` for the total line | The chart drill sends a type line's `id` back as `accountTypeId` |
| `series[].name` | string | STORED names [CODE]; "All Accounts" for the total line | Legend text |
| `series[].accountNumber` | string or null | STORED DH_Account.AccountNumber [CODE] | Present on account-kind series; `null` otherwise |
| `series[].values[]` | array of numbers | NEW: the balance formula evaluated at each point date | One value per entry of `points[]`; the final value equals that entity's current balance for the same `asOfDate` |

### Example response

All Accounts, `compareTo=week`, `groupBy=total` (8 daily points):

```json
{
  "asOfDate": "2026-09-02",
  "compareTo": "week",
  "groupBy": "total",
  "points": ["2026-08-26", "2026-08-27", "2026-08-28", "2026-08-29", "2026-08-30", "2026-08-31", "2026-09-01", "2026-09-02"],
  "series": [
    { "kind": "total", "id": null, "name": "All Accounts", "accountNumber": null, "values": [3571200, 3566900, 3580450, 3575300, 3588100, 3594700, 3599850, 3602980] }
  ]
}
```

Reconciliation: the first value is the week baseline balance and the last rebuilds from it, 3,571,200 + 31,780 = 3,602,980, where 31,780 is the week-window `diffAmount` API 2 returns for `compareTo=week`; the final value 3,602,980 must equal API 2's `total.balance` and API 3's `totalBalance` for the same scope and `asOfDate`.

### State contracts

| State | Response |
|---|---|
| Empty (scope matches no active accounts) | `points[]` populated for the window; `series: []` |
| Partial (an entity's history starts inside the window) | Points before its first transaction are `0` (the sum over no rows); the series is never truncated or padded with `null` |
| Not-yet-existing entity (unknown or out-of-scope id) | `series: []` with `points[]` populated; the client resets to All Accounts |
| Permission denied | 403 with a machine-readable error code; widget-level behaviour undecided (Still needs sign-off item 6) |
| Upstream unavailable | 5xx with a machine-readable error code; the client shows the error state with Retry |

## Auth and scoping

- **Context scoping:** every request carries the `X-BankAccountID` header, and every query is scoped through `DH_Type.BankAccountID` to that bank account. This widget is bank-account scoped, not company scoped like most Finance widgets [CODE, Widget_Comparison_Classic.html].
- **Permission right:** the module right that gates these reads is [TO CONFIRM] (Oisin Curran); the sign-off dossier marks entitlement detection and rights-based widget visibility as unconfirmed for this module [DOC, Step 6 dossier states 1 and 2].
- **What a user without the right sees:** undecided, a product decision (hidden widget, empty widget, or an explanatory state); until decided, the APIs return 403 with a machine-readable code and no data. Tracked in Still needs sign-off item 6.
- **Writes:** none in this contract, so no write permission applies. The empty state's Add account action is navigation intent toward the module's own form, which enforces its own rights.

## Edge cases

1. A scoped type with no active accounts returns well-formed zeros everywhere (API 2 zero shape, API 3 `rows: []` with `totalCount: 0`, API 4 `series: []`), never an error.
2. `comparisonBalance` of zero makes `diffPct` `null`; a zero per-account baseline makes that row's `windowChangePct` `null`. The client renders no delta rather than a percent.
3. An account younger than the comparison window has a baseline balance of `0` (the sum over no rows), so its `windowChangePct` is `null`; its series points before inception are `0`.
4. A deactivated account (`Active = false`) is excluded from every read at request time, including historical series aggregation, so a type or total series recomputes history over the currently active set and can differ from what the same window showed while the account was active. This is the formula's behaviour, stated so nobody assumes point-in-time membership.
5. A `page` past the last page returns empty `rows[]` with correct `totalCount` and `totalBalance`, not an error.
6. `accountId` and `accountTypeId` together: rejected, named 400 error `scope_conflict`. Neither param silently wins.
7. An unknown `accountId` or `accountTypeId`, or one belonging to another bank-account context, returns the well-formed empty shape; the client resets the scope to All Accounts and refetches API 1.
8. Two accounts sharing a name are distinguished by `accountId` and `accountNumber`, both always present on every account row in every API [DOC, Step 6 dossier gap 14].
9. A `q` matching nothing returns `rows: []`, `totalCount: 0`, and the unchanged scope `totalBalance`: an empty search result under a real total is correct, because `q` is a locate aid, not a scope change.
10. A negative balance (transactions summing below zero) is returned as-is at every level; how the distribution treats a negative group is undecided and tracked in Still needs sign-off item 11.
11. A future `asOfDate` is rejected with the named 400 error `invalid_asOfDate`; a past `asOfDate` is legitimate and evaluates every formula at that date.
12. Same-date drift: two calls anchored to the same `asOfDate` can straddle a posting dated that same day. Accepted at date grain; Refresh re-anchors.

## Not in scope

- **Transaction-level detail.** Nothing here exposes which `DH_Transaction` rows compose a balance or a series point.
- **Drill-out to a module screen.** The module has no read layer to land on [DOC, Step 6 dossier]; the in-widget re-scope and the account detail modal are the whole drill surface, and no navigation endpoint exists in this contract.
- **Writes.** The Add account action is navigation intent only; account creation belongs to the Deposits module's own form and rights.
- **Export.** The design has no export action, so no export endpoint exists here.
- **Reconciliation status.** The data has no reconciliation concept [DOC, Step 1 research], and balance is the primary read [SME, Ben Lane, 2026-07-13]; reconciliation belongs to bank-reconciliation screens, not this widget.
- **Interest / unposted-interest status.** That data lives only in the reports application today [DOC, Step 6 dossier gap 3]; no field here carries it, pending the sign-off decision.
- **Inception date.** Stored on `DH_Account` but consumed by nothing in the design, so no API returns it.
- **User preference persistence.** Scope, Compare To, view and sort choices are client-managed; no server preference store exists in the modern API [CODE, Widget_Comparison_Classic.html].
- **Locale formatting.** Currency and date rendering from the organisation's locale is a client concern; the APIs return raw numbers and ISO dates [DOC, Step 6 dossier gap 12 is a client-side defect investigation].

## Still needs sign-off

1. **Disputed - dashboard grain (dossier design direction).** The dossier holds that the dashboard grain should be the account TYPE, with a type summary at its L2 and the account grid only at L3, backed by its live audit and benchmark review [DOC, Step 6 dossier, live audit 2026-07-13]. The built Final keeps the account-level table alongside a By Account Type breakdown, backed by the build and the SME evidence that account-level balance is the primary read [BUILD; SME, Ben Lane, 2026-07-13]. Both positions stand with their evidence; this contract funds the built Final's surface and picks no side. If the dossier direction is adopted, API 3's account rows and API 4's account grain leave the dashboard contract and survive only behind a drill. Decider: Oisin Curran with management sign-off. Blocked: nothing in the build, but the shape of APIs 3 and 4 is at stake.
2. **Trend overlay: the Step 4 doc and the build disagree.** The Step 4 doc states Compare To drives "the overlaid line in Trend" [DOC, Step 4 - Widget Final Design/W07, Interaction Spec and Filters]; the built Final's Trend renders current-window series only, with no comparison overlay anywhere in its chart data [BUILD, depFTrend]. This contract funds no overlay; if the doc's sentence is the intent, API 4 gains a per-series comparison values array and the point count doubles. Decider: Oisin Curran. Blocked: the overlay element only.
3. **Unreviewed dossier findings need statuses** (gaps 2, 3, 6, 8, 10, 11, 12, 13, 14). The ones touching this contract: gap 3 would add an interest-status field that has no data surface today; gap 6's data-freshness ask is partly answered by the `asOfDate` echo on every response, but the visible stamp and Refresh behaviour are undecided; gap 13's empty-state copy parity is a client concern over the zero shapes specced here; gap 14 is honoured (`accountNumber` on every account row). Decider: Oisin Curran. Blocked: only the parts each finding touches.
4. **Declining-account flag** (three or more consecutive periods down): not in the built Final and not funded here; adopting it adds a per-account server flag and needs the threshold approved. Decider: SME + Oisin Curran.
5. **Balance tie-out.** Whether `DHAccount.CalcBalance()` applies adjustments beyond the plain transaction sum, so the widget and the module never disagree. [TO CONFIRM] (backend dev team). Blocked: trusting every balance figure in this contract.
6. **Entitlement.** The permission right's name, and what a user without it sees. [TO CONFIRM] (Oisin Curran). Blocked: the permission-denied rows of every state contract.
7. **Volume ceilings.** Total active depositor accounts, the largest single type's account count, and the type count at the largest org. [TO CONFIRM] (Marvin). Blocked: API 4's account-grain verdict; if the per-type ceiling is materially large, the account-grain series needs a capped top-N contract written before build.
8. **Baseline date rule.** The exact Time Window Module anchor per `compareTo` unit (fiscal period and quarter boundaries; same-date-prior versus period-end). [TO CONFIRM] (dev team + Oisin Curran). Blocked: implementing `comparisonBalance` and the series window start.
9. **Series grain and point counts.** The 8-daily / 9-weekly / 12-period / 12-monthly windows are the build's shape [BUILD]; confirm them as the production contract or set different grains. [TO CONFIRM] (dev team).
10. **Server-side table search.** The table paginates, so this contract makes `q` span the full scoped set server-side; the built Final's search box narrows only the rows on the visible page. The contract's behaviour is the framework verdict, and it is a visible change from the build. Decider: Oisin Curran.
11. **Distribution treatment of negative balances**, and the `pageSize` / `limit` maximums. Decider: Oisin Curran with the dev team.
