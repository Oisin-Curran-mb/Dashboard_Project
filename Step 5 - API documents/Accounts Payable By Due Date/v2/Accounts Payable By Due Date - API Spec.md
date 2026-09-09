# Accounts Payable By Due Date - API Spec

**Status: Done - awaiting sign-off (drafting complete, owner review pending)**

---

## Overview (required)

The widget answers one question: how much does the organisation owe its suppliers, and when does that cash have to go out? Finance staff read the horizon-scoped total payable and the overdue figure at a glance, then work an aging-banded list of outstanding invoices (Overdue / Due this week / Due this month / Due later) to prioritise payments; the Detail tier adds a cash-requirements breakdown and a top-vendors-owed rollup. The widget is read-only: it presents and filters payables, it does not pay, schedule or post anything.

This contract defines **four APIs**: a bounded aging summary fired on render (the Glance tier fires this alone), a paginated invoice list, a due-date facet lookup fired when the due-date popover opens, and a bounded top-vendors rollup fired at the Detail tier. The justification lives in the API inventory.

**The single load-bearing open fact:** every aging band in this contract is computed from `AP_Invoice.DueDate` relative to the as-of date. The sign-off dossier explicitly asks to *"Confirm aging basis is due date (not invoice date)"* and that confirmation has never been made against the real API or data [DOC - Confluence dossier 7371554882, section 10]. Until it is, every band boundary, the overdue figure, and the horizon rule are all conditional. See Still needs sign-off, item 1.

---

## Design → API coverage (required)

| Design element | Type | API | Field(s) | Provenance |
|---|---|---|---|---|
| Glance: "Accounts payable" scope chip | state | none | none - static label, client-side | n/a [BUILD] |
| Glance / header: total payable | KPI | API 1 | `totalDue` | DERIVED [DOC - Step 1 research] |
| Glance / header: overdue pill (amount, invoice count) | KPI | API 1 | `overdueTotal`, `overdueCount` | DERIVED [BUILD] |
| Glance / header: "Nothing overdue" positive pill | state | API 1 | `overdueTotal` = 0 | DERIVED [BUILD] |
| Due-date filter chip label | filter | API 2 | request params `band` / `dueDate`; label is client state | n/a [BUILD] |
| Due-date horizon chip | filter | APIs 1-4 | request param `horizonDays` | n/a [BUILD] |
| Table column: Vendor | table column | API 2 | `rows[].vendor` | STORED [DOC - Step 1 research] |
| Table column: Invoice | table column | API 2 | `rows[].invoiceNumber` | STORED [DOC - Widget_Comparison_Classic.html] |
| Table column: Due date (date line) | table column | API 2 | `rows[].dueDate` | STORED [DOC - Step 1 research] |
| Table column: Due date (days line: "Overdue by N days" / "Due today" / "Due in N days") | table column | API 2 | `rows[].daysFromDue` - client formats the words | DERIVED [BUILD] |
| Table: aging-band grouped subheaders (band name, invoice count, subtotal) | table grouping | API 2 | `rows[].band`, `bandSubtotals[]` | DERIVED [BUILD] |
| Table footer: selection label, invoice count, selection total | total | API 2 | `totalCount`, `totalAmount` | DERIVED [BUILD] |
| Table: sortable headers (Vendor / Invoice / Due date / Amount) | interaction | API 2 | request params `sortBy`, `sortDir` | n/a [BUILD] |
| Table: vendor search input (appears past 6 rows) | filter | API 2 | request param `vendorSearch` | n/a [BUILD] |
| Table column: Amount | table column | API 2 | `rows[].amountDue` | DERIVED [DOC - Step 1 research] |
| Detail panel: "All due dates" selector row (count, grand total) | drill / filter | API 1 | `invoiceCount`, `totalDue` | DERIVED [BUILD] |
| Detail panel: four cash-requirement band rows (count, share of total, amount, disabled when empty) | drill / filter | API 1 | `bands[].band`, `bands[].total`, `bands[].count` - share % is client-side | DERIVED [BUILD] |
| Detail panel: Top vendors owed (vendor, invoice count, overdue amount, total) | table | API 4 | `vendors[].vendor`, `vendors[].count`, `vendors[].overdueTotal`, `vendors[].total` | DERIVED [BUILD] |
| Due-date popover: "All due dates" entry with grand total | filter option | API 1 | `totalDue` | DERIVED [BUILD] |
| Due-date popover: "By aging" entries (only non-empty bands; count, amount, Overdue tag) | filter option | API 1 | `bands[]` - non-empty selection and the Overdue tag are client-side | DERIVED [BUILD] |
| Due-date popover: "By specific date" entries (date, days label, count, per-date total, Overdue tag) | filter option | API 3 | `dates[].dueDate`, `dates[].daysFromDue`, `dates[].count`, `dates[].total` | DERIVED [BUILD] |
| Due-date popover: search input (appears past 8 distinct dates) | filter | API 3 | none - client-side view over the `dates[]` response | n/a [BUILD] |
| Horizon popover options | filter option | none | none - STATIC enum, client-side | n/a [BUILD] |
| Empty state ("Nothing outstanding") | state | API 1 | `invoiceCount` = 0 | DERIVED [BUILD] |
| Loading skeleton on a due-filter or horizon change | state | none | client-side while APIs 1-4 are in flight | n/a [BUILD] |
| Currency symbol on every amount | formatting | API 1 | `currencyCode` | UNVERIFIED (backend team) [LIVE 23 Jul 2026 - renders GBP regardless of org, a known localisation defect] |

Every response field in the schemas below appears in a row above. The share-of-total percentages, day-count wording, mini-bar magnitudes and band presentation order are client-side derivations and appear in Where computation lives.

---

## Tables (required)

| Table / repository | Fields and members used |
|---|---|
| `AP_Invoice` | invoice id, vendor link, `DueDate`, `Posted`, `AllPaid`, invoice number |
| `AP_InvoiceDetail` | `Amount`, `Discount`, `Status` (line payment status; `U` unpaid, `X` partial) |
| `AP_Vendor` | vendor name (display name column), linked from each invoice |

No new tables and no schema changes are needed: this contract is new queries and new aggregations against the three existing tables above. The aging bands, the horizon rule, the pagination/sort contract, the due-date facet totals and the vendor rollup are all new *queries*, not new *storage*.

Core formulas, quotable in isolation:

- **Qualifying invoices:** `Posted = true AND DueDate != null AND AllPaid = false`. Fully paid invoices never appear [DOC - Step 1 research, confirmed against the legacy `AccountsPayableByDueDate : DataPanelControl` class via Widget_Comparison_Classic.html].
- **AmountDue per invoice:** `SUM(AP_InvoiceDetail.Amount - AP_InvoiceDetail.Discount) WHERE Status IN ('U','X')`; invoices whose resulting AmountDue = 0 are excluded [DOC - Step 1 research; Widget_Comparison_Classic.html records the Modern API matching this logic].
- **Aging band of an invoice:** let `d` = whole days from the as-of date to `DueDate`. `d < 0` → `overdue`; `0 <= d <= 7` → `week`; `8 <= d <= 30` → `month`; `d >= 31` → `later` [BUILD - the built band math, adopted as the locked design]. **The basis (due date, not invoice date) is unconfirmed against the real data - Still needs sign-off, item 1.**
- **Horizon rule:** with `horizonDays = N`, the working set is `WHERE d < 0 OR d <= N`. Overdue invoices are always included regardless of horizon [BUILD].
- **Filter applied to every read:** the qualifying-invoices predicate plus the horizon rule. The `band` / `dueDate` selection then narrows API 2 only; APIs 1, 3 and 4 are horizon-scoped but never due-selection-scoped, because the header KPI, the popover option totals and the cash panel always describe the whole horizon-scoped set [BUILD].

---

## Old vs. new (required)

| | Old (live today) | New (needed) |
|---|---|---|
| Endpoints | `GET .../accounts-payable-by-due-date/filters` (due-date list), `.../grid?dueDateFilter=` (whole row set, `InvoiceCount` + `TotalAmount`), `.../chart` (per-date sums, absolute values) [DOC - Widget_Comparison_Classic.html] | Four endpoints per the inventory. The grid read gains pagination, server sort, horizon, band filtering and vendor search (`NEW` reshaping of an existing read). The chart endpoint is dropped: the design has no chart. |
| Aging bands | None. The old widget filters by exact due date only | `NEW` - band assignment, band aggregates and band subtotals, all server-side |
| Horizon scoping | None | `NEW` - `horizonDays` param on every read, overdue always included |
| Summary aggregates | `InvoiceCount` + `TotalAmount` on the grid response only | `NEW` - a dedicated bounded summary (API 1) carrying overdue figures and band aggregates, so Glance never pays for rows |
| Due-date filter options | Flat `{Value, Label, IsDefault}` list, "Total" first, first real date auto-selected [DOC - Widget_Comparison_Classic.html] | Reshaped (`NEW` fields on an existing read): per-date totals, counts and signed day offsets; default selection is "All due dates", not the earliest date |
| Vendor rollup | None | `NEW` - top-N vendors by amount owed with per-vendor overdue exposure (API 4) |
| Pagination / sort | None - the grid returns every row; the legacy filter is an in-memory rebind | `NEW` - `page`/`pageSize`/`sortBy`/`sortDir` with full-set aggregates |
| Module access | Metadata only, **not enforced**: any authenticated user can call the endpoints regardless of AP licence [DOC - Step 1 research, Modern API gap] | `NEW` - server-side entitlement enforcement is required before release (Still needs sign-off, item 5) |
| Currency | Renders GBP regardless of org [LIVE 23 Jul 2026] | `NEW` - `currencyCode` follows the organisation; the defect is fixed server-side |

---

## API inventory (required)

| API | Purpose | Trigger (when it fires) | Cardinality | R/W | Cache posture | Split trigger |
|---|---|---|---|---|---|---|
| API 1 - Aging summary | Total payable, overdue figures, four band aggregates, as-of anchor, currency | Widget render (every tier), horizon change, refresh | Bounded: 4 bands + scalars | R | LIVE per request (matches the Modern API's no-server-cache posture) | Cardinality gap: a bounded summary must never pay for an unbounded row list. Glance fires this alone |
| API 2 - Invoice list | The outstanding-invoice rows, paginated, sorted, searched, with full-set aggregates | Explore/Detail render, due-filter change, horizon change, sort change, vendor search, page turn, refresh | Unbounded row list | R | LIVE per request | Cardinality gap vs API 1; grain gap: per-invoice rows vs aggregate snapshot |
| API 3 - Due-date facet | Distinct due dates in the horizon-scoped set with per-date totals, counts and day offsets, feeding the popover's "By specific date" section | Due-date popover open; horizon change while the popover is open | One row per distinct due date | R | LIVE per request | Trigger gap: fired on a user action (opening the popover), never on render. Lifetime gap from API 2: an option list, not row data |
| API 4 - Top vendors owed | Per-vendor rollup: total owed, invoice count, overdue exposure, capped at `limit` | Detail tier render, horizon change at Detail, refresh at Detail | Bounded: `limit` rows (default 5) | R | LIVE per request | Conditional weight: only the Detail tier needs it; grain gap: per-vendor rollup vs per-invoice rows |

Merges considered and closed: APIs 1 and 2 stay separate because Glance must render from aggregates alone (cardinality gap), and they share the `asOf` anchor so the header total and the table rows cannot straddle a write. API 4 stays out of API 1 because two of three tiers never render it (conditional weight). API 3 stays out of API 1 because its row count is not bounded by definition and it is only needed when the popover opens (trigger gap); the popover's "By aging" section is fed from API 1, which the client already holds.

There is no write in this contract. The pay/schedule action question is a recorded dispute, not a specced surface - see Still needs sign-off, item 2.

---

## Call sequence (required)

| Interaction | Calls fired | Notes |
|---|---|---|
| Initial widget load - Glance | API 1 | Aggregates only; no rows are ever fetched at Glance |
| Initial widget load - Explore | API 1 + API 2 | Both pass the same `asOf` once API 1 returns it (API 1 first, API 2 anchored to its `asOf`); the header total and the table describe the same snapshot |
| Initial widget load - Detail | API 1 + API 2 + API 4 | All three share the `asOf` anchor |
| Open due-date popover | API 3 | "All due dates" and "By aging" sections render from the held API 1 response; API 3 fills "By specific date" |
| Change due filter (band or specific date) | API 2 | API 1 is not refired: the header KPI and cash panel are horizon-scoped, not due-selection-scoped |
| Change horizon | API 1 + API 2 (+ API 4 at Detail; + API 3 if the popover is open) | The client re-validates the current due selection against the new response and snaps it to "All due dates" if it is now empty or invalid; the snap is client-side, no extra call |
| Change sort | API 2 | Server-side sort; page resets to 1 |
| Vendor search (type in the table search box) | API 2 (debounced) | Server-side: the row set is paginated, so a client row filter would search one page, not the data |
| Search within the due-date popover | none | Client-side view over the held API 3 response |
| Page turn | API 2 | Aggregates do not change: they span the full filtered set |
| Select a cash-panel band row | API 2 | Identical to a due-filter change; the panel itself re-renders from the held API 1 response |
| Refresh | API 1 + API 2 (+ API 4 at Detail) | Preserves the current due selection and horizon [DOC - Step 1 research]; a fresh `asOf` is taken from the new API 1 response |
| Submit action | none | No write exists in this contract |

---

## Filter architecture (required)

| Filter | Option source | Cardinality | Execution | Aggregate effect | Cascade | "All" wire form | Round trips |
|---|---|---|---|---|---|---|---|
| Due date (chip + popover: All / band / specific date) | STATIC bands (`overdue`, `week`, `month`, `later`) + LOOKUP API 3 for specific dates | 4 bands + one option per distinct due date; distinct-date ceiling [TO CONFIRM - backend team] | SERVER - `band` or `dueDate` param on API 2 | Yes: `totalCount`, `totalAmount`, `bandSubtotals` recompute over the selection. No: API 1 figures, which are horizon-scoped by design | Options depend on the horizon: API 3 takes `horizonDays` | Omit both `band` and `dueDate` | 1 (API 2) |
| Due-date horizon (All outstanding / next 7 / 30 / 60 / 90 days) | STATIC enum | 5 | SERVER - `horizonDays` on APIs 1-4 | Yes: every figure in the widget recomputes | Parent of the due-date filter and of API 3's option list | Omit `horizonDays` | 2 at Explore (APIs 1+2), 3 at Detail (+ API 4), +1 if the popover is open (API 3) |
| Vendor search (table input) | free text | n/a | SERVER - `vendorSearch` on API 2. The set is paginated, so Framework 1 condition 1 fails for a client filter: the client holds one page, not the full set | Yes: `totalCount`, `totalAmount` and `bandSubtotals` recompute over the matching set, so the footer and the band subheaders describe what the user sees | None | Omit `vendorSearch` | 1 (API 2, debounced) |
| Due-date popover search | DERIVED from the API 3 response | One entry per distinct date already held | CLIENT - all three conditions hold: the full option set is present in the held API 3 response, it is bounded by the distinct-date ceiling (conditional on that ceiling being confirmed; see Volume), and it changes no server-computed aggregate (it narrows the visible option list only) | No | Depends on API 3, which depends on the horizon | n/a (empty search box) | 0 |

**Combination semantics:** AND, narrowing, across horizon + due selection + vendor search. No OR pairs; no mutually exclusive UI pairs other than the wire-level rule below.

**Conflict rule:** `band` and `dueDate` are mutually exclusive on API 2; a request carrying both is rejected with HTTP 400 and error code `AP_FILTER_CONFLICT`. An unrecognised `band` value or a non-positive / non-whitelisted `horizonDays` is rejected the same way (`AP_BAD_PARAM`). A syntactically valid `dueDate` that simply matches nothing in the horizon-scoped set is **not** an error: it returns a well-formed zero response (empty `rows`, `totalCount` 0, `totalAmount` 0, all four `bandSubtotals` present with zero totals), because the client's snap rule can race a data change.

**Cascade invalidation:** when the horizon changes, the client re-validates the held due selection: a band selection whose band is now empty, or a specific date no longer present in the new facet, snaps back to "All due dates" before API 2 is called. The server does not enforce the snap; it serves the zero response above if a stale value arrives.

**Lookup endpoints:** the specific-date option list is API 3 in this contract (it replaces the existing `/filters` endpoint's role). The band options and horizon options are static enums and need no lookup.

---

## Volume and performance (required)

| Dataset | Typical rows | Worst realistic rows (basis) | Row width | Payload at worst | Verdict | Server cost model | Cache posture |
|---|---|---|---|---|---|---|---|
| API 1 summary | 4 band rows + 6 scalars | 4 band rows - bounded by definition (the band set is fixed) | ~5 fields, ~80 bytes/band | ~1 KB | BOUNDED | Single indexed scan over qualifying invoices joined to detail lines, CASE-banded aggregation; one aggregate join, no per-row subquery | LIVE per request |
| API 2 invoice rows | 12 [BUILD - demo dataset, a typical-case figure only] | [TO CONFIRM - backend team]: no citable ceiling exists for outstanding AP invoices at a large org, and the demo size is not a basis | 7 fields, ~150 bytes/row | ~30 KB per 200-row page | MUST PAGINATE | Indexed scan with the qualifying predicate + horizon window, one aggregate join to detail lines for AmountDue, ORDER BY + OFFSET/FETCH; aggregates are one extra grouped pass over the same filtered set | LIVE per request |
| API 3 due-date facet | 7 distinct dates [BUILD - demo dataset] | [TO CONFIRM - backend team]: distinct due dates among outstanding invoices; plausibly low hundreds at worst but uncited | 4 fields, ~60 bytes/row | ~12 KB at 200 dates | BOUNDED - conditional on the ceiling above; if it exceeds roughly 200 the facet gains a server-side `search` param and this verdict is re-issued | GROUP BY DueDate over the horizon-scoped set; single grouped scan | LIVE per request |
| API 4 top vendors | 5 rows | `limit` rows - bounded by definition (server caps at `limit`, maximum 20) | 4 fields, ~90 bytes/row | ~2 KB | BOUNDED | GROUP BY vendor over the full horizon-scoped set, ORDER BY total DESC, TOP `limit`; the grouping pass spans every qualifying invoice regardless of `limit` | LIVE per request |

There is no time series in this contract, so no N x M product arises.

The built Final holds its whole 12-invoice dataset in the browser and therefore sorts, groups, searches and totals instantly client-side. That is a property of the fixture, not the contract: with no citable ceiling on outstanding invoices, the row list must paginate, and the hard rule follows - sort, vendor search, band grouping subtotals and every total are server-side.

### Pagination contract

- **Params:** `page` (1-based, default 1), `pageSize` (default 50, maximum 200 - both defaulted here and awaiting owner confirmation, Still needs sign-off item 9).
- **What paginates:** `rows[]` on API 2. Nothing else paginates.
- **What does not:** `totalCount`, `totalAmount` and `bandSubtotals[]` on API 2 compute over the **full filtered set** (horizon + due selection + vendor search), never the page. API 1's figures span the full horizon-scoped set. Switching pages changes no total, no band subtotal, no KPI and no cash-panel figure.
- **Sort params:** `sortBy` whitelist `vendor` | `invoiceNumber` | `dueDate` | `amountDue`; `sortDir` `asc` | `desc`. Default `dueDate asc`.
- **Deterministic total order:** the requested sort, then `amountDue DESC` for equal due dates (the design's stated tie rule), then `invoiceId ASC` as the unique tiebreaker on every sort. Pagination is therefore stable under any sort.
- **`totalCount`** is returned alongside every page, with `page` and `pageSize` echoed.
- **Past the last page:** empty `rows`, correct `totalCount`, correct `totalAmount` and `bandSubtotals`, HTTP 200 - not an error.

---

## Where computation lives (required)

| Value | Server or client | Basis | Why |
|---|---|---|---|
| Qualifying-invoice set and AmountDue per invoice | SERVER | Detail lines are never transmitted | The client never sees `AP_InvoiceDetail` |
| Total payable (`totalDue`) | SERVER | Spans the full horizon-scoped set | The client holds at most one page |
| Overdue total and count | SERVER | Same | Same |
| Band assignment per invoice (`band`) | SERVER | The banding rule is the contract's core business rule and must be identical everywhere it appears | One implementation; the aging basis gate (sign-off item 1) lives server-side only |
| Band aggregates (API 1 `bands[]`) and band subtotals (API 2 `bandSubtotals[]`) | SERVER | Span the full filtered set | Paginated set |
| Selection total and count (API 2 `totalAmount`, `totalCount`) | SERVER | Full filtered set | Paginated set |
| `daysFromDue` (signed integer, negative = overdue) | SERVER | Pre-signed delta; the client formats words, never does date math | The as-of date and its timezone live server-side |
| "Overdue by N days" / "Due today" / "Due in N days" wording | CLIENT | Pure formatting over `daysFromDue` | Presentation |
| Cash-panel share of total (band total / `totalDue`) | CLIENT | Pure arithmetic over two values in the held API 1 response | When `totalDue` = 0 the client renders the empty state and never divides; a band with `count` 0 renders as a disabled "nothing due" row. No server-computed percentage exists in this contract, so no server division-by-zero rule is needed; this client rule is the zero rule |
| Mini-bar magnitudes and top-vendor share bars | CLIENT | Presentation over served totals | Presentation |
| Sort order of `rows[]` | SERVER | Paginated set | Hard rule |
| Band presentation order (Overdue, then week, month, later) and hiding empty bands in the popover/table | CLIENT | The server always returns all four bands including zeros; display order and empty-band presentation are presentation | Server data stays presentation-neutral; the empty-band treatment can change without an API change |
| Overdue tags in the popover and panel | CLIENT | `daysFromDue < 0` / band id = `overdue` over served fields | Pure derivation |
| Vendor rollup ranking (top N by total) | SERVER | Spans every qualifying invoice, not a page | The client cannot rank what it does not hold |
| Currency symbol placement | CLIENT | Formats `currencyCode` | Presentation; the code itself is served (sign-off item 6) |

Deltas: none exist in this contract beyond `daysFromDue`, which is returned pre-signed. Presentation thresholds: none are pending approval; the band boundaries are the locked design rule stated in Tables.

---

## API 1: Aging summary (required)

### Endpoint

```
GET /api/dashboard/accounts-payable-by-due-date/summary
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `horizonDays` | int | no | 7, 30, 60, 90 | omitted = all outstanding | Scopes the working set to invoices due within N days of the as-of date; overdue invoices are always included |
| `asOf` | ISO 8601 timestamp | no | any past-or-present timestamp the server accepts | omitted = now | Snapshot anchor; echoed in the response. On first call the client omits it and adopts the echoed value for companion calls |

Context header: see Auth and scoping.

### Example requests

```
GET /api/dashboard/accounts-payable-by-due-date/summary
GET /api/dashboard/accounts-payable-by-due-date/summary?horizonDays=7   (with the horizon filter applied)
```

No URL encoding is needed for any parameter of this API.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | string (ISO 8601) | NEW - server clock at evaluation [BUILD models a fixed anchor] | Snapshot anchor; the date part, in the org timezone, is "today" for all band math. Timezone rule [TO CONFIRM - backend team] |
| `currencyCode` | string | UNVERIFIED (backend team) - the org's currency; renders GBP regardless of org today [LIVE 23 Jul 2026] | ISO 4217 code the client formats every amount with |
| `totalDue` | number | DERIVED - SUM(AmountDue) over the horizon-scoped qualifying set [DOC - Step 1 research] | Total payable |
| `invoiceCount` | number | DERIVED - COUNT over the same set [DOC - Widget_Comparison_Classic.html: the grid returns InvoiceCount today] | Feeds the "All due dates" row and the empty state |
| `overdueTotal` | number | DERIVED - SUM(AmountDue) WHERE daysFromDue < 0 [BUILD] | The overdue pill |
| `overdueCount` | number | DERIVED - COUNT WHERE daysFromDue < 0 [BUILD] | The pill's count detail |
| `bands[]` | array (always all 4) | DERIVED [BUILD] | One entry per aging band, zeros included |
| `bands[].band` | string | DERIVED - band rule in Tables; basis unconfirmed [TO CONFIRM - backend team, sign-off item 1] | `overdue` \| `week` \| `month` \| `later` |
| `bands[].total` | number | DERIVED - SUM(AmountDue) within the band [BUILD] | Band amount |
| `bands[].count` | number | DERIVED - COUNT within the band [BUILD] | Band invoice count |

### Example response

```json
{
  "asOf": "2026-07-23T14:00:00Z",
  "currencyCode": "USD",
  "totalDue": 35711.25,
  "invoiceCount": 12,
  "overdueTotal": 7670.50,
  "overdueCount": 3,
  "bands": [
    { "band": "overdue", "total": 7670.50,  "count": 3 },
    { "band": "week",    "total": 3720.75,  "count": 3 },
    { "band": "month",   "total": 13100.00, "count": 3 },
    { "band": "later",   "total": 11220.00, "count": 3 }
  ]
}
```

The example values reproduce the build's demo dataset, anchored at its fixture date of 2026-07-23. Reconciliation: band totals 7670.50 + 3720.75 + 13100.00 + 11220.00 = 35711.25 = `totalDue`; band counts 3 + 3 + 3 + 3 = 12 = `invoiceCount`; `overdueTotal` equals the `overdue` band total and `overdueCount` its count. With `horizonDays=7` the same dataset returns `totalDue` 7670.50 + 3720.75 = 11391.25 and `invoiceCount` 6, with the `month` and `later` bands present at zero.

### State contracts

| State | Response |
|---|---|
| Empty (no qualifying invoices) | HTTP 200: `totalDue` 0, `invoiceCount` 0, `overdueTotal` 0, `overdueCount` 0, all four bands present with zero totals and counts. This funds the "Nothing outstanding" state |
| Partial (invoices exist but none inside the horizon) | HTTP 200: overdue figures may be non-zero (overdue is always included); non-overdue bands zero. A legitimate data condition, not an error |
| Not-yet-existing entity | n/a - the read is org-scoped, not entity-keyed |
| Permission denied | HTTP 403 with error code `AP_NO_ACCESS`; no figures leak. Widget presentation for this state is an open product decision (sign-off item 5) |
| Upstream unavailable | HTTP 503 with a retryable error envelope; the client shows the error-with-retry state, never a blank that reads as "nothing owed" |

---

## API 2: Invoice list (required)

### Endpoint

```
GET /api/dashboard/accounts-payable-by-due-date/invoices
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `horizonDays` | int | no | 7, 30, 60, 90 | omitted = all outstanding | Same rule as API 1 |
| `band` | string | no | `overdue`, `week`, `month`, `later` | omitted = no band filter | Narrows rows to one aging band. Mutually exclusive with `dueDate` |
| `dueDate` | string (ISO 8601 date) | no | any date | omitted = no date filter | Narrows rows to one exact due date. Mutually exclusive with `band` |
| `vendorSearch` | string | no | free text, max 100 chars | omitted = no search | Case-insensitive substring match on vendor name; URL-encode it (spaces, ampersands and punctuation occur in real vendor names) |
| `sortBy` | string | no | `vendor`, `invoiceNumber`, `dueDate`, `amountDue` | `dueDate` | Whitelisted sort key |
| `sortDir` | string | no | `asc`, `desc` | `asc` | Sort direction |
| `page` | int | no | >= 1 | 1 | 1-based page number |
| `pageSize` | int | no | 1-200 | 50 | Rows per page; maximum 200 |
| `asOf` | ISO 8601 timestamp | no | as API 1 | omitted = now | Pass API 1's echoed `asOf` so the header and the rows describe one snapshot |

### Example requests

```
GET /api/dashboard/accounts-payable-by-due-date/invoices?page=1&pageSize=50
GET /api/dashboard/accounts-payable-by-due-date/invoices?horizonDays=30&band=overdue&sortBy=amountDue&sortDir=desc&page=1&pageSize=50   (with filters applied)
GET /api/dashboard/accounts-payable-by-due-date/invoices?vendorSearch=Guardian%20Insurance&page=1&pageSize=50   (vendor search, URL-encoded)
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | string (ISO 8601) | NEW - echoed anchor | Same anchor semantics as API 1 |
| `rows[]` | array | DERIVED - container; provenance carried by its child fields | One entry per invoice on the requested page, in the deterministic order stated in the pagination contract |
| `rows[].invoiceId` | string (guid) | STORED AP_Invoice id column [DOC - Widget_Comparison_Classic.html: the Modern grid row carries InvoiceId today] | Stable row identity and the unique sort tiebreaker |
| `rows[].vendor` | string | STORED AP_Vendor display-name column via the invoice's vendor link [DOC - Step 1 research; exact column name unconfirmed] | Vendor column |
| `rows[].invoiceNumber` | string | STORED AP_Invoice invoice number [DOC - Widget_Comparison_Classic.html] | Invoice column |
| `rows[].dueDate` | string (ISO 8601 date) | STORED AP_Invoice.DueDate [DOC - Step 1 research] | Due date column, date line |
| `rows[].daysFromDue` | number | DERIVED - whole days from the as-of date to DueDate, pre-signed (negative = overdue) [BUILD] | Feeds the days line and the overdue emphasis |
| `rows[].band` | string | DERIVED - band rule in Tables [BUILD]; basis gate applies (sign-off item 1) | Funds the grouped subheaders without client date math |
| `rows[].amountDue` | number | DERIVED - SUM(AP_InvoiceDetail.Amount - Discount) WHERE Status IN ('U','X') [DOC - Step 1 research] | Amount column; signed (a net credit position within a qualifying invoice stays signed, edge case 8) |
| `bandSubtotals[]` | array (always all 4) | DERIVED - over the full filtered set [BUILD shows per-band subheader subtotals] | Grouped-view subheaders; zeros included |
| `bandSubtotals[].band` | string | DERIVED - as above | Band id |
| `bandSubtotals[].total` | number | DERIVED - as above | Band subtotal over the full filtered set |
| `bandSubtotals[].count` | number | DERIVED - as above | Band count over the full filtered set |
| `totalAmount` | number | DERIVED - SUM(AmountDue) over the full filtered set, never the page [DOC - the existing grid returns TotalAmount today] | Footer total |
| `totalCount` | number | DERIVED - COUNT over the full filtered set [DOC - the existing grid returns InvoiceCount today] | Footer count and pager arithmetic |
| `page` | int | NEW - echo | Requested page |
| `pageSize` | int | NEW - echo | Requested page size |

### Example response

```json
{
  "asOf": "2026-07-23T14:00:00Z",
  "rows": [
    { "invoiceId": "9f1e6a2b-0000-0000-0000-000000000001", "vendor": "Staples",           "invoiceNumber": "INV-0003", "dueDate": "2026-07-10", "daysFromDue": -13, "band": "overdue", "amountDue": 5555.00 },
    { "invoiceId": "9f1e6a2b-0000-0000-0000-000000000002", "vendor": "Grainger Supply",   "invoiceNumber": "INV-2201", "dueDate": "2026-07-18", "daysFromDue": -5,  "band": "overdue", "amountDue": 1240.50 },
    { "invoiceId": "9f1e6a2b-0000-0000-0000-000000000003", "vendor": "City Water & Power","invoiceNumber": "INV-2202", "dueDate": "2026-07-18", "daysFromDue": -5,  "band": "overdue", "amountDue": 875.00 }
  ],
  "bandSubtotals": [
    { "band": "overdue", "total": 7670.50, "count": 3 },
    { "band": "week",    "total": 0,       "count": 0 },
    { "band": "month",   "total": 0,       "count": 0 },
    { "band": "later",   "total": 0,       "count": 0 }
  ],
  "totalAmount": 7670.50,
  "totalCount": 3,
  "page": 1,
  "pageSize": 50
}
```

This is the `band=overdue` call against the demo dataset. Reconciliation: row amounts 5555.00 + 1240.50 + 875.00 = 7670.50 = `totalAmount` = the `overdue` subtotal, and it matches API 1's `overdueTotal` and `bands[overdue].total` for the same `asOf` and horizon; `totalCount` 3 matches API 1's `overdueCount`. Row order shows the default sort: due date ascending, the 2026-07-18 tie broken by larger amount first, `invoiceId` as the final tiebreaker.

### State contracts

| State | Response |
|---|---|
| Empty (filter combination matches nothing, including a stale `dueDate` after a horizon change) | HTTP 200: `rows` empty, `totalCount` 0, `totalAmount` 0, all four `bandSubtotals` present at zero |
| Partial (horizon excludes some invoices) | HTTP 200: normal shape over the horizon-scoped set; overdue rows always included |
| Not-yet-existing entity | n/a - org-scoped read |
| Permission denied | HTTP 403, `AP_NO_ACCESS`, no rows leak |
| Upstream unavailable | HTTP 503, retryable envelope; client keeps the last-good table and shows the error state |

---

## API 3: Due-date facet (required)

### Endpoint

```
GET /api/dashboard/accounts-payable-by-due-date/due-dates
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `horizonDays` | int | no | 7, 30, 60, 90 | omitted = all outstanding | Same rule as API 1; the facet lists only dates inside the horizon-scoped set |
| `asOf` | ISO 8601 timestamp | no | as API 1 | omitted = now | Pass API 1's echoed anchor so the facet totals reconcile with the held summary |

### Example requests

```
GET /api/dashboard/accounts-payable-by-due-date/due-dates
GET /api/dashboard/accounts-payable-by-due-date/due-dates?horizonDays=30   (with the horizon applied)
```

No URL encoding is needed for any parameter of this API.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | string (ISO 8601) | NEW - echoed anchor | As API 1 |
| `dates[]` | array, earliest first | DERIVED - container; provenance carried by its child fields | One entry per distinct due date in the horizon-scoped qualifying set [DOC - Step 1 research: dates are real invoice due dates, never user-configured] |
| `dates[].dueDate` | string (ISO 8601 date) | STORED AP_Invoice.DueDate (distinct) [DOC - Step 1 research] | The option's date |
| `dates[].daysFromDue` | number | DERIVED - pre-signed day offset [BUILD] | Feeds the option's days label and Overdue tag |
| `dates[].total` | number | DERIVED - SUM(AmountDue) for the date [BUILD shows per-date totals] | The option's amount |
| `dates[].count` | number | DERIVED - COUNT for the date [BUILD] | The option's invoice count |

### Example response

```json
{
  "asOf": "2026-07-23T14:00:00Z",
  "dates": [
    { "dueDate": "2026-07-10", "daysFromDue": -13, "total": 5555.00,  "count": 1 },
    { "dueDate": "2026-07-18", "daysFromDue": -5,  "total": 2115.50,  "count": 2 },
    { "dueDate": "2026-07-25", "daysFromDue": 2,   "total": 3720.75,  "count": 3 },
    { "dueDate": "2026-08-01", "daysFromDue": 9,   "total": 11650.00, "count": 2 },
    { "dueDate": "2026-08-15", "daysFromDue": 23,  "total": 1450.00,  "count": 1 },
    { "dueDate": "2026-09-01", "daysFromDue": 40,  "total": 9120.00,  "count": 2 },
    { "dueDate": "2026-09-30", "daysFromDue": 69,  "total": 2100.00,  "count": 1 }
  ]
}
```

Reconciliation: per-date totals 5555.00 + 2115.50 + 3720.75 + 11650.00 + 1450.00 + 9120.00 + 2100.00 = 35711.25, matching API 1's `totalDue`; counts 1 + 2 + 3 + 2 + 1 + 2 + 1 = 12, matching `invoiceCount`, for the same `asOf` and horizon.

### State contracts

| State | Response |
|---|---|
| Empty (no qualifying invoices in the horizon) | HTTP 200: `dates` empty |
| Partial | HTTP 200: only dates inside the horizon-scoped set appear; overdue dates always appear |
| Not-yet-existing entity | n/a - org-scoped read |
| Permission denied | HTTP 403, `AP_NO_ACCESS` |
| Upstream unavailable | HTTP 503, retryable envelope; the popover shows a retry state, not an empty option list |

---

## API 4: Top vendors owed (required)

### Endpoint

```
GET /api/dashboard/accounts-payable-by-due-date/vendors/top
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `horizonDays` | int | no | 7, 30, 60, 90 | omitted = all outstanding | Same rule as API 1 |
| `limit` | int | no | 1-20 | 5 | Number of vendors returned, ranked by total owed descending |
| `asOf` | ISO 8601 timestamp | no | as API 1 | omitted = now | Shared anchor |

### Example requests

```
GET /api/dashboard/accounts-payable-by-due-date/vendors/top
GET /api/dashboard/accounts-payable-by-due-date/vendors/top?horizonDays=30&limit=5   (with the horizon applied)
```

No URL encoding is needed for any parameter of this API.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | string (ISO 8601) | NEW - echoed anchor | As API 1 |
| `vendors[]` | array, total owed descending, vendor name as the deterministic tiebreaker for equal totals | DERIVED - container; provenance carried by its child fields | Top `limit` vendors over the full horizon-scoped set |
| `vendors[].vendor` | string | STORED AP_Vendor display-name column [DOC - Step 1 research; exact column name unconfirmed] | Vendor name |
| `vendors[].total` | number | DERIVED - SUM(AmountDue) per vendor [BUILD] | Amount owed |
| `vendors[].count` | number | DERIVED - COUNT per vendor [BUILD] | Invoice count |
| `vendors[].overdueTotal` | number | DERIVED - SUM(AmountDue) per vendor WHERE daysFromDue < 0 [BUILD] | The vendor's overdue exposure; zero when nothing is overdue |

### Example response

```json
{
  "asOf": "2026-07-23T14:00:00Z",
  "vendors": [
    { "vendor": "Guardian Insurance",    "total": 16800.00, "count": 2, "overdueTotal": 0 },
    { "vendor": "Staples",               "total": 5555.00,  "count": 1, "overdueTotal": 5555.00 },
    { "vendor": "Faithful Cleaning Co.", "total": 4200.00,  "count": 2, "overdueTotal": 0 },
    { "vendor": "Summit HVAC Services",  "total": 3250.00,  "count": 1, "overdueTotal": 0 },
    { "vendor": "Grainger Supply",       "total": 2220.50,  "count": 2, "overdueTotal": 1240.50 }
  ]
}
```

Reconciliation: the five returned totals 16800.00 + 5555.00 + 4200.00 + 3250.00 + 2220.50 = 32025.50; the four vendors below the cut (City Water & Power 875.00, Cornerstone Landscaping 1450.00, Harmony Music Licensing 720.00, Lakeside Print & Mail 640.75) sum to 3685.75, and 32025.50 + 3685.75 = 35711.25 = API 1's `totalDue` for the same `asOf` and horizon. A top-N list deliberately does not sum to the grand total; the client must never present it as one.

### State contracts

| State | Response |
|---|---|
| Empty | HTTP 200: `vendors` empty |
| Partial (fewer vendors than `limit`) | HTTP 200: as many entries as exist, no padding |
| Not-yet-existing entity | n/a - org-scoped read |
| Permission denied | HTTP 403, `AP_NO_ACCESS` |
| Upstream unavailable | HTTP 503, retryable envelope |

---

## Auth and scoping (required)

- **Company / tenant scoping:** every query is scoped to the caller's organisation context. The existing Modern API handler for this widget (`ApByDueDateHandlers.cs`) is recorded as taking an `X-BankAccountID` header into `ContextParams.BankAccountId` [DOC - Widget_Comparison_Classic.html], which is a surprising context key for an AP read (sibling widgets use `X-Company-ID`). Which header this contract's four endpoints must take is [TO CONFIRM - backend team]; the requirement that every query is tenant-scoped is not conditional.
- **Permission right:** the legacy widget enforces Inquiry access on `/AccountsPayable` (`SecurityAccessType.Inquiry`) [DOC - Widget_Comparison_Classic.html]. The equivalent right must gate all four reads. There is no write in this contract, so no write right is defined.
- **Enforcement gap:** the Modern API's module access for this widget is metadata-only and **not enforced** - any authenticated user can call the existing endpoints regardless of AP licence [DOC - Step 1 research]. Server-side enforcement is `NEW`, required work for all four endpoints before release (Still needs sign-off, item 5).
- **What a user without the right sees:** undecided - hidden widget vs explicit no-access state is an open product decision [TO CONFIRM - Oisin Curran, flagged in the dossier]. The API side is decided: HTTP 403, `AP_NO_ACCESS`, no data in the body.

---

## Edge cases (required)

1. **Empty results:** any filter combination matching nothing returns the well-formed zero shapes in the state contracts, HTTP 200, never an error.
2. **Missing comparison baseline:** n/a - no comparison or delta-versus-prior exists in this contract.
3. **Invoice due exactly on the as-of date:** `daysFromDue` = 0, band `week`, not overdue. The overdue predicate is strictly `daysFromDue < 0`.
4. **Division by zero:** the only percentage anywhere is the client-side cash-panel share; when `totalDue` is 0 the client renders the empty state and never divides.
5. **Pagination past the end:** empty `rows`, correct `totalCount`, correct aggregates, HTTP 200.
6. **Conflicting params:** `band` + `dueDate` together → HTTP 400 `AP_FILTER_CONFLICT`. A stale but well-formed `dueDate` → the zero response, not an error.
7. **Invoice created mid-session:** two calls anchored to the same `asOf` exclude it consistently; it appears after the next refresh takes a fresh anchor. Whether the backend can evaluate reads at a supplied `asOf` (versus treating it as echo-only, with drift accepted between calls made milliseconds apart) is [TO CONFIRM - backend team].
8. **Negative line amounts (credits):** `amountDue` is signed. An invoice whose lines net to a negative AmountDue stays in the set (only exact zero is excluded); the legacy chart's absolute-value treatment does not apply to any figure in this contract, so totals are true net obligations.
9. **Invoice fully paid between anchor and render:** the `Posted`/`AllPaid` predicate is evaluated at query time; the shared `asOf` keeps the summary and the rows on one snapshot per the anchor semantics in item 7.
10. **Unknown `band` value or out-of-whitelist `horizonDays` / `pageSize` / `sortBy`:** HTTP 400 `AP_BAD_PARAM`, naming the offending parameter.
11. **Vendor search matching nothing:** the zero response; `bandSubtotals` all present at zero so the grouped view collapses cleanly.
12. **Two filters with overlapping value spaces:** a `band` selection under a horizon that empties that band is legitimate and returns the zero response; the client-side snap rule normally prevents the call, but the server never treats it as an error.
13. **Invoices with no due date:** excluded by the qualifying predicate (`DueDate != null`); they are invisible to every figure, so a blank due date never behaves as a wildcard.

---

## Not in scope (required)

- **Any write:** pay, schedule payment, create check, post to GL. The widget is a read-only overview; the actionability question is recorded as a dispute in Still needs sign-off, item 2. Separate action widgets for those tasks are assigned outside this project's queue.
- **Any chart endpoint:** the design has no chart; the existing `/chart` endpoint is not part of this contract. A date-ordered chart is an unreviewed dossier proposal (sign-off item 3).
- **Drill-through to the AP module:** not built; open with experts/dev (sign-off item 8). If adopted later it is a client-side deep link and needs no new API, but the target URL pattern would need verification.
- **A vendor filter chip:** the design uses the table search instead; `vendorSearch` covers it.
- **Export / download:** not in the design.
- **Unification with the `ap-ar-aging` Phase 2 widget:** its bucket boundaries (Current/1-30/31-60/61-90/91+) differ from this widget's due-date-relative bands; reconciling the two is a recorded future question, not part of this contract [DOC - Widget_Comparison_New_Widgets.html via the Step 3 spec].
- **Bank Balances pairing ("can we cover it?"):** an unreviewed dossier proposal (sign-off item 4); no cross-widget field is specced.
- **Data-freshness display:** `asOf` is served, but a "data as of" UI treatment is unspecified in the design; nothing further is specced here (sign-off item 7).

---

## Still needs sign-off (required)

1. **Aging basis: due date vs invoice date - the top open item, load-bearing for every band.** The contract computes every band, the overdue figures and the horizon rule from `AP_Invoice.DueDate`. The dossier's states-and-constraints table instructs *"Confirm aging basis is due date (not invoice date). Label it."* [DOC - Confluence dossier 7371554882, section 10] and this has never been confirmed against the real API or data. **Who decides:** backend team, with Feargal Phelan for the product reading. **Blocked until then:** final band queries; a basis change re-derives `band`, `bands[]`, `bandSubtotals[]`, `overdueTotal`, `overdueCount`, `daysFromDue` and the horizon rule - effectively the whole contract's aggregation layer.
2. **Actionability - recorded dispute, no side picked.** Claim A: make the widget payable-actionable (select invoices, pay / schedule / one-step check, following the Payroll STO inline-action pattern) - the SME's core reason AP invoices are underused and the dossier's highest-value change [SME Marvin 13 Jul 2026; DOC - dossier 11.2, gaps table "Phase (SME top ask)"]. Claim B: the widget stays a focused due-date and aging overview and must not grow into a container for payment functions; separate action widgets (assigned to Aditya, outside this project) carry those tasks [DOC - Step 4 doc, Feargal call note dated 2026-08-25]. This contract specs the built read-only behaviour; a future write surface (payment initiation, scheduling, check creation) hangs entirely on this decision. **Who decides:** Feargal Phelan with the project owner. **Blocked until then:** any write API for this widget.
3. **Dossier 11.3 / 11.4 (date-ordered chart; chart-table sync fixed consistently across AP / Deposit Accounts / Loans) - Unreviewed.** No status has been assigned. The built design has no chart, so nothing built is affected, but no chart endpoint can be specced or refused until the owner assigns a status. **Who decides:** project owner (status call). **Blocked until then:** any chart/timeline endpoint.
4. **Dossier 11.6 (pair with Bank Balances for a coverage read) - Unreviewed.** Same treatment: no cross-widget contract is specced or excluded on merit until a status is assigned. **Who decides:** project owner. **Blocked until then:** any coverage/cash-pairing field.
5. **Entitlement enforcement.** Module access is metadata-only and not enforced in the Modern API; server-side enforcement is required before release, and the no-rights widget presentation (hidden vs explicit no-access) is undecided [TO CONFIRM - Oisin Curran for the presentation; backend team for enforcement]. **Blocked until then:** release, and the permission-denied row of every state contract stays provisional.
6. **Currency localisation.** Amounts render GBP regardless of org [LIVE 23 Jul 2026]; `currencyCode` is UNVERIFIED and the fix is backend work. **Who decides/confirms:** backend team. **Blocked until then:** the `currencyCode` field's provenance.
7. **Data freshness.** Cache posture is specced LIVE per request to match the existing Modern API behaviour, and `asOf` semantics (echo-only vs evaluable snapshot, org timezone for "today") are unconfirmed [TO CONFIRM - backend team]. **Blocked until then:** edge cases 7 and 9 stay provisional.
8. **Drill-through to the AP module** - open with experts/dev; nothing built, nothing specced. **Who decides:** experts/dev with the project owner.
9. **Defaults taken in this draft needing owner confirmation:** `pageSize` default 50 / max 200; API 4 `limit` default 5 / max 20; the API 3 BOUNDED verdict conditional on the distinct-date ceiling; worst-case volume ceilings [TO CONFIRM - backend team]. **Who decides:** project owner / backend team. **Blocked until then:** nothing - the defaults are usable, but they are defaults, not decisions.
10. **Tenant context header** - `X-BankAccountID` is recorded for the existing AP handler where sibling widgets use `X-Company-ID` [DOC - Widget_Comparison_Classic.html]; which one this contract takes is [TO CONFIRM - backend team]. **Blocked until then:** the header line in Auth and scoping.
11. **Aging-label carryover check.** A mislabeling bug ("Over 60" actually meaning 90+ days) confirmed for another widget may or may not apply to shared aging-label code; this widget's band labels are new and due-date-relative, so exposure is unconfirmed either way [DOC - Step 4 doc, Sign-off Readiness row 2]. **Who decides:** no owner is named yet; the project owner assigns one. **Blocked until then:** nothing in this contract; check before reusing any shared band-label source.
12. **Div-based table accessibility parity** (whether the hero table must carry `role=table` semantics) is [TO CONFIRM - Oisin Curran]. A frontend concern recorded here only because the dossier's accessibility item names it; no API field depends on it.
