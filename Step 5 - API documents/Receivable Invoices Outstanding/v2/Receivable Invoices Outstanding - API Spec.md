# Receivable Invoices Outstanding — API Spec

**Status: Done - awaiting sign-off (drafting complete, owner review pending)**

## Overview

The widget answers one question: how much money is owed to the organisation in posted-but-unpaid invoices, and how badly overdue it is. The user reads the aging shape, switches to a customer ranking to find who is responsible for it, drills into a band or a customer to see the invoices, expands an invoice for its detail, and can select invoices and move them toward payment.

This contract defines **six APIs**. Two are bounded summary reads that serve the widget face; two are paginated list reads behind the drill; one is a per-invoice detail read; one is the single write. A sixth serves the two filter lists. The justification for each split is in the API inventory — the count is derived from the split triggers, not chosen.

The load-bearing conclusion of this spec: **the customer ranking and the invoice lists cannot be assembled in the browser at real volume.** The built Final groups by customer as an instant client-side re-render over a 23-invoice demo dataset. At an organisation with thousands of outstanding invoices the client never holds the rows, so the ranking, its sort and its pagination all move server-side. That is API 2's reason to exist.

## Design → API coverage

| Design element | Type | API | Field(s) | Provenance |
|---|---|---|---|---|
| Total owed headline | KPI | API 1 | `total.outstanding` | DERIVED sum of outstanding over the filtered set `[BUILD]` |
| Invoice count beside the headline | KPI | API 1 | `total.invoiceCount` | DERIVED count over the filtered set `[BUILD]` |
| Overdue / "All current" pill | KPI | API 1 | `overdue.outstanding`, `overdue.invoiceCount` | DERIVED sum and count where `daysPastDue > 0` `[BUILD]` |
| Aging bar, one bar per band | chart series | API 1 | `buckets[].outstanding`, `buckets[].invoiceCount` | DERIVED per-band sum and count `[BUILD]` |
| Band label and its sub-caption | chart series | API 1 | `buckets[].label`, `buckets[].daysFrom`, `buckets[].daysTo` | DERIVED from the band definition `[BUILD]` |
| Band ordering and severity ramp | chart series | API 1 | `buckets[].bucket` | STORED band key, fixed order `[BUILD]` |
| Percent-of-total per band | chart series | — | client-side division of `buckets[].outstanding` by `total.outstanding` | DERIVED client-side `[BUILD]` |
| "No balance in *band*" collapse of empty bands | state | API 1 | `buckets[].outstanding` = 0 | DERIVED client-side test `[BUILD]` |
| Pie view of the same bands | chart series | API 1 | `buckets[]` | same response, client re-render `[BUILD]` |
| Customers view, one row per customer | table column | API 2 | `customers[].customer`, `customers[].outstanding`, `customers[].invoiceCount` | DERIVED rollup over the filtered set `[BUILD]` |
| Customer worst-severity marker | table column | API 2 | `customers[].worstBucket` | DERIVED highest band among the customer's invoices `[BUILD]` |
| Customer age sort key | table column | API 2 | `customers[].oldestDaysPastDue` | DERIVED max `daysPastDue` for the customer `[BUILD]` |
| Customers list sort control (customer / total / oldest) | filter | API 2 | `sortBy`, `sortDir` params | NEW server-side sort `[BUILD]` |
| Customers list pager | filter | API 2 | `pagination.page`, `pagination.pageSize`, `pagination.totalCount` | NEW server-side pagination `[BUILD]` |
| Revenue Center filter chip | filter | API 6 → API 1/2/3 | `revenueCenters[]`; `revenueCenterId` param | STORED `ARRevenueCenterRepository` `[CODE]` |
| Source filter chip | filter | API 6 → API 1/2/3 | `sources[]`; `sourceId` param | STORED `ARSourceRepository` `[CODE]` |
| Aging / Customers group toggle | view toggle | API 1 / API 2 | selects which summary API is called | `[BUILD]` |
| Glance / Explore / Detail tiers | view toggle | — | no API effect; the same responses render at every tier | `[BUILD]` |
| Drill modal heading and band/customer sub-pill | drill | API 3 | `scope.label`, `scope.mode`, `scope.key` | DERIVED echo of the drill scope `[BUILD]` |
| Drill modal invoice list (band or customer) | drill | API 3 | `invoices[]` | STORED `ARInvoice` `[CODE]` |
| Modal columns Customer / Bill To / Due Date / Invoice # / Days Past Due / Outstanding | table column | API 3 | `invoices[].customer`, `.billTo`, `.dueDate`, `.invoiceNumber`, `.daysPastDue`, `.outstanding` | STORED `ARInvoice` `[CODE]`, **except `billTo`**, which is UNVERIFIED: `BillToDisplay` returns empty for every invoice on the Modern API today `[TO CONFIRM — Backend/dev]` |
| Modal footer "N invoices / total" | KPI | API 3 | `totals.invoiceCount`, `totals.outstanding` | DERIVED over the whole scoped set, not the page `[BUILD]` |
| Row expand: Details tab line items | drill | API 4 | `lineItems[]` | STORED `ARInvoiceDetail` `[CODE]` |
| Row expand: Attachments tab | drill | API 4 | `attachments[]` | UNVERIFIED (owner to confirm source) `[TO CONFIRM]` |
| Row expand: Note tab | drill | API 4 | `note` | UNVERIFIED (owner to confirm source) `[TO CONFIRM]` |
| Row expand: Payments tab | drill | API 4 | `payments[]` | UNVERIFIED (owner to confirm source) `[TO CONFIRM]` |
| "Open invoice" action in the row drawer | drill | — | deep link built client-side from `invoiceId`; no endpoint | `[BUILD]` |
| "Record a follow-up" action in the row drawer | action | — | out of contract, see Not in scope | `[BUILD]` |
| Row select checkboxes | action | API 5 | `invoiceIds[]` request field | `[BUILD]` |
| Confirm → move to unposted transactions | action | API 5 | `applied[]`, `rejected[]`, `batchId` | NEW mutation over existing `ARPayment` machinery `[CODE]` |
| Export to Excel | action | — | client-side generation from the response already held | `[BUILD]` |
| "Nothing outstanding" empty state | state | API 1 | all `buckets[].outstanding` = 0 and `total.outstanding` = 0 | DERIVED `[BUILD]` |
| Filter-change skeleton | state | API 1/2 | no field; a request is in flight | `[BUILD]` |

## Tables

| Table / repository | Fields and members used |
|---|---|
| `ARInvoice` | `Posted`, `UndoJournalID`, `TotalAmount`, `SalesTax`, `Payments`, `Discounts`, `WriteOffs` (the Outstanding formula), `DueDate` (banding), customer name, `BillToDisplay`, invoice number |
| `ARInvoiceDetail` | Invoice line items: item name, quantity, unit amount |
| `ARRevenueCenterRepository` | The Revenue Center list, populated from the data rather than a fixed enum |
| `ARSourceRepository` | The Source list, populated from the data rather than a fixed enum |
| `ARPayment` / `ARPaymentDetail` | The write target: a payment carrying a `Posted` flag, whose detail rows each apply to one `ARInvoice` |
| `ARPaymentRepository` | `GetAllCurrentContextByFilters(posted:false, ...)`, selection by `SelectedIDs`, `ProcessPayments(blobID, postingDate)`, `CheckTransactionsAgainstCurrentYear`, unapplied-cash handling |
| `ARCompany` | `InterfaceGL` — gates whether posting the payment writes GL journal detail |

No new tables and no schema change. Everything below is new queries against these tables, plus reuse of the existing AR payment path for the one write.

**Invoice eligibility filter, applied to every read:** `Posted = true AND UndoJournalID IS NULL AND Outstanding <> 0`. Voided invoices are excluded and every invoice the widget shows is already posted. `[CODE]`

**Outstanding:** `Outstanding = TotalAmount + SalesTax - Payments - Discounts - WriteOffs`. `[CODE]`

**Days past due:** `daysPastDue = asOf - DueDate` in whole days. Negative for an invoice not yet due; the response clamps it to a floor of 0 and the client renders "Not due". `[BUILD]`

**Aging bands, six of them:** assigned by `daysPastDue` — Current (`<= 0`, not yet due), 1-30, 31-60, 61-90, 91-120, 121+ (unbounded). Always returned in this order. `[BUILD]`

**Overdue:** `SUM(Outstanding) WHERE daysPastDue > 0`, i.e. every band except Current. `[BUILD]`

**Bill To is a confirmed empty-field gap, not a design choice:** `BillToDisplay` returns empty for **every** invoice on the Modern API today. This is recorded as a known unresolved gap, not as a conditional blank, and no source in this project establishes what the field is supposed to contain when it is populated. Whether the correct behaviour is "populated only when the bill-to party differs from the customer" or "always populated" is **not confirmed** and must not be assumed by the implementation. `[DOC — Step 1 research; Step 4 Sign-off Readiness row 3]` / `[TO CONFIRM — Backend/dev, owner of the Modern API gap]`

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Aging bands | Five: Current (`< 31`), 31-60, 61-90, 91-120, 121+ | **Six**: Current (not yet due), 1-30, 31-60, 61-90, 91-120, 121+. `NEW` band boundaries; the 1-30 band separates "not yet due" from "recently late", which the old Current band conflated |
| Invoice count per band | Not returned | `buckets[].invoiceCount`. `NEW` |
| Overdue figure | Not returned | `overdue.outstanding` / `overdue.invoiceCount` over `daysPastDue > 0`. `NEW` |
| Customer ranking | Does not exist in any form | API 2: per-customer rollup with worst band and oldest age, server-sorted and paginated. `NEW` |
| Invoice list behind a band | Legacy detail panel, unpaginated | API 3: paginated, server-sorted, and reachable by customer as well as by band. `NEW` (pagination and the customer scope) |
| Line item detail | Item name and amount | Adds quantity and unit amount. `NEW` |
| Move invoices toward payment | Manual, in Payment Processing | API 5 stages an unposted payment from the widget. `NEW` mutation over existing machinery |
| Filter lists | Two separate reads | API 6 returns both in one call. `NEW` shape, existing data |

## API inventory

| API | Purpose | Trigger (when it fires) | Cardinality | R/W | Cache posture | Split trigger |
|---|---|---|---|---|---|---|
| API 1 aging summary | Six bands plus total and overdue | Widget render; any filter change | 6 rows, fixed | R | LIVE | cardinality gap — a fixed 6-row summary must never pay for the invoice rows behind it |
| API 2 customer summary | Per-customer rollup, sorted and paged | Customers view selected; its sort or page changes; any filter change while it is active | unbounded, paginated | R | LIVE | conditional weight — only needed while the Customers view is open, and it aggregates over the full filtered set |
| API 3 invoice list | Invoices for one band or one customer | Drill modal opens; its sort or page changes | unbounded, paginated | R | LIVE | trigger gap — fired on user action, never on render |
| API 4 invoice detail | Line items, attachments, note, payments for one invoice | A modal row is expanded | 1 invoice | R | LIVE | grain gap — keyed by a single id, and three of its four sections are unverified sources that must not block the list read |
| API 5 confirm | Stage an unposted payment against selected invoices | Confirm pressed in the modal | 1..N ids | **W** | none | read vs write |
| API 6 filter lists | Revenue Center and Source option lists | Widget first mount | 5 and 3 rows | R | TTL 1 hour | lifetime gap — these change on a different timescale from the data and are shared across widgets |

Two decisions worth recording as conclusions:

- **API 1 and API 2 stay separate** even though both are driven by the same filter state, because the Customers view is one of three views and its payload is unbounded. Combining them would make every widget render pay for a customer ranking most renders never show.
- **API 6 returns both lists in one call** rather than one endpoint per list. They are fetched at the same moment, both tiny, and neither is useful without the other, so the always-together counter-pressure outweighs a split.

## Call sequence

| Interaction | Calls fired | Notes |
|---|---|---|
| Initial widget load | API 6, then API 1 | API 6 populates the chips, API 1 fills the face. Both take the same `asOf` |
| Change Revenue Center chip | API 1, plus API 2 if the Customers view is active | The only filter that triggers a fetch, alongside Source |
| Change Source chip | API 1, plus API 2 if the Customers view is active | Same as above |
| Switch view: Aging → Pie | none | Pure client re-render over the 6 bands already held |
| Switch view: Aging → Customers | API 2 | The build re-renders this client-side over a 23-row demo set; at real volume it is a fetch |
| Change Customers sort | API 2 | Server-side sort; the client cannot reorder a page it only partly holds |
| Change Customers page | API 2 | |
| Open drill (band or customer) | API 3 | `scope.mode` is `bucket` or `customer` |
| Change drill sort or page | API 3 | |
| Expand a modal row | API 4 | One call per expanded invoice, on demand |
| Press Confirm | API 5, then API 1 and API 3 | Re-read after the write so the face and the open modal reflect the new outstanding |
| Refresh | API 1, plus API 2 if active | API 6 is served from cache |

All reads accept and echo a shared `asOf`. The client sends the value API 1 returned to every subsequent read in the same interaction, so the modal's footer total cannot disagree with the band it was opened from.

## Filter architecture

| Filter | Option source | Cardinality | Execution | Aggregate effect | Cascade | "All" wire form | Round trips |
|---|---|---|---|---|---|---|---|
| Revenue Center | `LOOKUP` API 6, from `ARRevenueCenterRepository` | 4 real values in the build (Church, Insurance Billing, Pension Billing, School) plus All; org-defined, so treat as tens | `SERVER` `revenueCenterId` | Yes — changes every total, band and rollup | No | Param omitted | 1, or 2 while Customers is active |
| Source | `LOOKUP` API 6, from `ARSourceRepository` | 2 real values in the build plus All; org-defined, so treat as tens | `SERVER` `sourceId` | Yes — same as above | No | Param omitted | 1, or 2 while Customers is active |
| Aging / Customers group toggle | `STATIC` | 2 | `SERVER` — selects which summary API is called | No, each API totals its own scope | No | n/a | 1 when switching to Customers, 0 returning to Aging if the response is still held |
| Bar / Pie view | `STATIC` | 2 | `CLIENT` — all three Framework 1 conditions hold: the full band set is already in the API 1 response, it is **bounded** at exactly 6 rows by definition, and re-rendering it changes no server-computed aggregate | No | No | n/a | 0 |
| Customers sort | `STATIC` customer, total, oldest × asc, desc | 6 | `SERVER` `sortBy` / `sortDir` | No | No | n/a | 1 |
| Drill list sort | `STATIC` daysPastDue, outstanding, dueDate, customer × asc, desc | 8 | `SERVER` `sortBy` / `sortDir` | No | No | n/a | 1 |

**Combination semantics.** Revenue Center and Source combine with AND and both narrow. There is no OR anywhere in the filter set.

**Conflict rule.** The two filters overlap in their value space — "Insurance Billing" is both a revenue center and a source — so a combination such as Revenue Center = Church with Source = Insurance Billing legitimately matches nothing. That is an empty result, **not** an error: every band returns with zeroes and `total.outstanding` is 0. No param takes precedence over the other, and no combination is rejected.

**Blank source values.** Invoices carry an empty source in the build wherever no source applies. `sourceId` omitted (All) includes those invoices; `sourceId` set to any value excludes them. The API must not treat a blank source as a wildcard match.

**No cascade.** Neither list depends on the other's current value, so neither list is re-fetched when the other filter changes, and no filter value is ever invalidated by a change to the other. If cascading lists are wanted later, that is a change to API 6, not to the reads.

## Volume and performance

| Dataset | Typical rows | Worst realistic rows (basis) | Row width | Payload at worst | Verdict | Server cost model | Cache posture |
|---|---|---|---|---|---|---|---|
| Aging bands (API 1) | 6 | 6 — fixed by the band definition, not by data | 6 fields | under 1 KB | BOUNDED | one indexed scan of eligible invoices with a CASE band assignment; single pass | LIVE |
| Customer rollup (API 2) | 23 in the built Final's dataset | `[TO CONFIRM]` — owner/SME to give a real ceiling for customers with outstanding invoices at a large org; the build's 23 is a demo figure and is not a basis for a ceiling | 6 fields | depends on the ceiling above | MUST PAGINATE | GROUP BY customer over eligible invoices, with MAX(daysPastDue) and MAX(band) per group; one pass plus a sort | LIVE |
| Invoice list per scope (API 3) | 4 in the largest band of the built Final's dataset (121+, 4 invoices, $27,730) | `[TO CONFIRM]` — unbounded in principle; the 121+ band at a large org is the realistic worst case and needs an owner figure | 7 fields | depends on the ceiling above | MUST PAGINATE | indexed scan filtered to one band or one customer, plus a sort | LIVE |
| Invoice detail (API 4) | 1 invoice, 1-4 line items | 1 invoice; line items `[TO CONFIRM]` for a ceiling | nested | small | BOUNDED | keyed read on `ARInvoice` plus a join to `ARInvoiceDetail` | LIVE |
| Filter lists (API 6) | 5 and 3 | tens — org-defined revenue centers and sources | 2 fields | under 1 KB | BOUNDED | two small repository reads | TTL 1 hour |

**The conclusion the build's behaviour hides.** In the built Final, switching to Customers, sorting it, and paging it are all instant client-side operations, because the whole 23-invoice dataset is in the browser. That is a property of a 23-row demo, not of the design. Once the eligible invoice set is unbounded, the client holds at most one page and can therefore neither rank customers, nor sort that ranking, nor total it. All three move to the server, which is why API 2 exists and why API 2 and API 3 both carry sort and pagination params.

### Pagination contract

Applies to API 2 (customers) and API 3 (invoices). API 1, API 4 and API 6 are bounded and take no page params.

- **Params:** `page`, 1-based, default 1. `pageSize`, default 25, **maximum 200**. The widget requests 7 for the Customers view to match its card height; the server honours whatever is asked within the maximum rather than assuming a UI tier.
- **What paginates:** `customers[]` in API 2, `invoices[]` in API 3. Nothing else.
- **What does not paginate:** `total.outstanding` and `total.invoiceCount` in API 2, and `totals.outstanding` and `totals.invoiceCount` in API 3, always compute over the **entire filtered set** for the current scope, never over the current page. So paging the customer list never changes the total owed, and paging the drill list never changes the modal's "N invoices / total" footer.
- **Sort params:** `sortBy` and `sortDir`. API 2 whitelist: `customer`, `total`, `oldest`. API 3 whitelist: `daysPastDue`, `outstanding`, `dueDate`, `customer`. A value outside the whitelist is rejected rather than silently ignored, so a typo cannot quietly reorder a page.
- **Deterministic total order.** Every sort ends in a unique tiebreaker so pages cannot duplicate or skip rows: API 2 sorts by the requested key, then by the reciprocal key (total ties break on oldest, oldest ties break on total, matching the built Final), then by `customerId`. API 3 sorts by the requested key, then by `invoiceId`.
- **`pagination.totalCount`** is returned with every page, so the client renders its pager without a second call.
- **Past the last page:** an empty `customers[]` or `invoices[]`, with `pagination.totalCount` and every aggregate still correct. Not an error.

## Where computation lives

| Value | Server or client | Basis | Why |
|---|---|---|---|
| Band assignment for an invoice | server | `daysPastDue` vs the band boundaries | the client never sees every invoice |
| Band outstanding and invoice count | server | full filtered set | spans rows the client does not hold |
| Total owed and total invoice count | server | full filtered set | same |
| Overdue outstanding and count | server | full filtered set where `daysPastDue > 0` | same |
| Percent of total per band | client | `buckets[].outstanding` ÷ `total.outstanding` | pure arithmetic on values already in the response. When `total.outstanding` is 0 the client renders every band at 0% and does not divide |
| Worst non-empty band | client | last `buckets[]` entry with `outstanding > 0` | the bands are ordered and bounded at 6 |
| Severity colour ramp and band captions | client | `buckets[].bucket` order | presentation over a returned key |
| Empty-band "No balance in *band*" collapse | client | `buckets[].outstanding = 0` | a test on a returned value |
| Customer outstanding and invoice count | server | rollup over full filtered set | the client cannot group rows it does not hold |
| Customer worst band | server | MAX band across the customer's invoices | same |
| Customer oldest days past due | server | MAX `daysPastDue` across the customer's invoices | same |
| Customer ranking order | server | `sortBy` / `sortDir` | a paginated list cannot be ordered client-side |
| Drill list order | server | `sortBy` / `sortDir` | same |
| Modal footer "N invoices / total" | server | full scoped set | must span the whole band or customer, not the page |
| Line item extended amount | server | `quantity × unitAmount`, returned as `amount` | returned pre-computed so the client never re-derives money |
| Export to Excel contents | client | the response already held | no server work; see Not in scope |

**No percentages are returned by any endpoint**, so there is no server-side division and no server division-by-zero case. The one division in the widget is the client's percent-of-total, whose zero rule is stated in the table above. Money is returned as a plain number in the org's currency with no formatting.

## API 1: aging summary

### Endpoint

```
GET /api/dashboard/receivable-invoices/aging
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `revenueCenterId` | guid | no | any `id` from API 6's `revenueCenters[]` | omitted, meaning All | Narrows to one revenue center |
| `sourceId` | guid | no | any `id` from API 6's `sources[]` | omitted, meaning All | Narrows to one source. Excludes invoices with no source |
| `asOf` | date | no | any date not in the future | server date | The date `daysPastDue` is measured against. Echoed back for the client to pass to every other read |

Company context is carried in the `X-Company-ID` header on every call in this contract.

### Example requests

```
GET /api/dashboard/receivable-invoices/aging
GET /api/dashboard/receivable-invoices/aging?revenueCenterId=2f8b1c94-3d5e-4a7f-9b0c-1d2e3f4a5b6c&sourceId=7a3c9e15-4b6d-4f8a-9c1e-2d5b8f0a3e74&asOf=2026-07-23
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | date | DERIVED echo of the request | The date banding was measured against |
| `generatedAt` | datetime UTC | DERIVED server clock | Generation stamp |
| `revenueCenterId` | guid or null | DERIVED echo | `null` when All |
| `sourceId` | guid or null | DERIVED echo | `null` when All |
| `buckets` | array | DERIVED | Always the six bands, in order, including empty ones |
| `buckets[].bucket` | string | DERIVED band key | `current`, `1-30`, `31-60`, `61-90`, `91-120`, `121+` |
| `buckets[].label` | string | DERIVED band definition | Display label for the band |
| `buckets[].daysFrom` | int | DERIVED band definition | Lower bound of the band in days past due; `0` for Current |
| `buckets[].daysTo` | int or null | DERIVED band definition | Upper bound; `null` for the unbounded 121+ band |
| `buckets[].outstanding` | number | DERIVED sum of `ARInvoice` Outstanding in the band | Band total |
| `buckets[].invoiceCount` | int | DERIVED count in the band | Band count |
| `total` | object | DERIVED | Across all six bands, over the full filtered set |
| `total.outstanding` | number | DERIVED sum | Total owed |
| `total.invoiceCount` | int | DERIVED count | Total invoices |
| `overdue` | object | DERIVED | Every band except Current |
| `overdue.outstanding` | number | DERIVED sum where `daysPastDue > 0` | Overdue portion of the total |
| `overdue.invoiceCount` | int | DERIVED count where `daysPastDue > 0` | Overdue invoice count |

### Example response

Figures below are the built Final's full dataset with no filters applied.

```json
{
  "asOf": "2026-07-23",
  "generatedAt": "2026-07-23T09:14:00Z",
  "revenueCenterId": null,
  "sourceId": null,
  "buckets": [
    { "bucket": "current", "label": "Current",     "daysFrom": 0,   "daysTo": 0,    "outstanding": 6180,  "invoiceCount": 3 },
    { "bucket": "1-30",    "label": "1-30 days",   "daysFrom": 1,   "daysTo": 30,   "outstanding": 10410, "invoiceCount": 5 },
    { "bucket": "31-60",   "label": "31-60 days",  "daysFrom": 31,  "daysTo": 60,   "outstanding": 15070, "invoiceCount": 4 },
    { "bucket": "61-90",   "label": "61-90 days",  "daysFrom": 61,  "daysTo": 90,   "outstanding": 14020, "invoiceCount": 4 },
    { "bucket": "91-120",  "label": "91-120 days", "daysFrom": 91,  "daysTo": 120,  "outstanding": 11160, "invoiceCount": 3 },
    { "bucket": "121+",    "label": "121+ days",   "daysFrom": 121, "daysTo": null, "outstanding": 27730, "invoiceCount": 4 }
  ],
  "total":   { "outstanding": 84570, "invoiceCount": 23 },
  "overdue": { "outstanding": 78390, "invoiceCount": 20 }
}
```

Reconciliation: 6180 + 10410 + 15070 + 14020 + 11160 + 27730 = 84570 outstanding, and 3 + 5 + 4 + 4 + 3 + 4 = 23 invoices, both matching `total`. Overdue is the same sums excluding Current: 10410 + 15070 + 14020 + 11160 + 27730 = 78390 and 5 + 4 + 4 + 3 + 4 = 20, matching `overdue`.

### State contracts

| State | Response |
|---|---|
| Empty, no invoice matches the filters | All six bands present with `outstanding` 0 and `invoiceCount` 0; `total` and `overdue` both zeroed. HTTP 200 |
| Nothing outstanding at all | Identical to the above. The client renders "Nothing outstanding" from it; it is not an error |
| Nothing overdue but a balance exists | `overdue` zeroed, `total` non-zero. Drives the "All current" pill |
| Partial, `asOf` earlier than the oldest invoice | Bands computed against that `asOf`; invoices not yet issued are absent, not zero-padded |
| Permission denied | HTTP 403 with no body. The client hides the widget rather than rendering an empty one |
| Upstream unavailable | HTTP 503. The client keeps the last successful response visible and marks it stale |

## API 2: customer summary

### Endpoint

```
GET /api/dashboard/receivable-invoices/customers
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `revenueCenterId` | guid | no | any `id` from API 6's `revenueCenters[]` | omitted, meaning All | Same filter as API 1 |
| `sourceId` | guid | no | any `id` from API 6's `sources[]` | omitted, meaning All | Same filter as API 1 |
| `asOf` | date | no | any date not in the future | server date | Pass the value API 1 returned |
| `sortBy` | enum | no | `customer`, `total`, `oldest` | `total` | Sort key. A value outside the list is rejected |
| `sortDir` | enum | no | `asc`, `desc` | `desc` | Sort direction |
| `page` | int | no | 1 or greater | `1` | 1-based page number |
| `pageSize` | int | no | 1 to 200 | `25` | Rows per page. The widget requests 7 |

### Example requests

```
GET /api/dashboard/receivable-invoices/customers?asOf=2026-07-23&pageSize=7
GET /api/dashboard/receivable-invoices/customers?asOf=2026-07-23&sortBy=oldest&sortDir=desc&page=2&pageSize=7&revenueCenterId=2f8b1c94-3d5e-4a7f-9b0c-1d2e3f4a5b6c
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | date | DERIVED echo | Date banding and ages were measured against |
| `revenueCenterId` | guid or null | DERIVED echo | `null` when All |
| `sourceId` | guid or null | DERIVED echo | `null` when All |
| `sortBy` | string | DERIVED echo | Applied sort key |
| `sortDir` | string | DERIVED echo | Applied direction |
| `pagination` | object | DERIVED | Pager state for `customers[]` only |
| `pagination.page` | int | DERIVED echo | Current page |
| `pagination.pageSize` | int | DERIVED echo | Applied page size |
| `pagination.totalCount` | int | DERIVED count of customers in the full filtered set | Drives the pager without a second call |
| `customers` | array | DERIVED rollup | One row per customer with an eligible invoice, this page only |
| `customers[].customerId` | guid | STORED `ARInvoice` customer key | Stable id, and the final sort tiebreaker |
| `customers[].customer` | string | STORED customer name | Display name |
| `customers[].outstanding` | number | DERIVED sum of the customer's Outstanding | Owed by this customer |
| `customers[].invoiceCount` | int | DERIVED count | Their eligible invoices |
| `customers[].worstBucket` | string | DERIVED MAX band across their invoices | Band key, same vocabulary as API 1 |
| `customers[].oldestDaysPastDue` | int | DERIVED MAX `daysPastDue` across their invoices | 0 when none are past due |
| `total` | object | DERIVED over the full filtered set | Never the page |
| `total.outstanding` | number | DERIVED sum | Matches API 1's `total.outstanding` under the same filters and `asOf` |
| `total.invoiceCount` | int | DERIVED count | Matches API 1's `total.invoiceCount` under the same filters and `asOf` |

### Example response

First page of 7, sorted by amount owed, no filters. The built Final's dataset has one invoice per customer, so every `invoiceCount` here is 1; that is a property of the demo data, not of the contract.

```json
{
  "asOf": "2026-07-23",
  "revenueCenterId": null,
  "sourceId": null,
  "sortBy": "total",
  "sortDir": "desc",
  "pagination": { "page": 1, "pageSize": 7, "totalCount": 23 },
  "customers": [
    { "customerId": "a1c4e7b2-1111-4aaa-9111-0d1e2f3a4b51", "customer": "Cornerstone Academy",       "outstanding": 9650, "invoiceCount": 1, "worstBucket": "121+",   "oldestDaysPastDue": 145 },
    { "customerId": "a1c4e7b2-2222-4aaa-9222-0d1e2f3a4b52", "customer": "Fairhaven School",          "outstanding": 7250, "invoiceCount": 1, "worstBucket": "121+",   "oldestDaysPastDue": 130 },
    { "customerId": "a1c4e7b2-3333-4aaa-9333-0d1e2f3a4b53", "customer": "Brightwater Academy",       "outstanding": 6420, "invoiceCount": 1, "worstBucket": "91-120", "oldestDaysPastDue": 108 },
    { "customerId": "a1c4e7b2-4444-4aaa-9444-0d1e2f3a4b54", "customer": "Legacy Insurance Group",    "outstanding": 6300, "invoiceCount": 1, "worstBucket": "121+",   "oldestDaysPastDue": 144 },
    { "customerId": "a1c4e7b2-5555-4aaa-9555-0d1e2f3a4b55", "customer": "Silverbrook School",        "outstanding": 5880, "invoiceCount": 1, "worstBucket": "61-90",  "oldestDaysPastDue": 74 },
    { "customerId": "a1c4e7b2-6666-4aaa-9666-0d1e2f3a4b56", "customer": "Whitestone Pension Office", "outstanding": 4530, "invoiceCount": 1, "worstBucket": "121+",   "oldestDaysPastDue": 152 },
    { "customerId": "a1c4e7b2-7777-4aaa-9777-0d1e2f3a4b57", "customer": "Grace Fellowship",          "outstanding": 4180, "invoiceCount": 1, "worstBucket": "31-60",  "oldestDaysPastDue": 52 }
  ],
  "total": { "outstanding": 84570, "invoiceCount": 23 }
}
```

Reconciliation: `pagination.totalCount` is 23 customers while `customers[]` holds 7, and `total.outstanding` is 84570 — the full-set figure identical to API 1's, not the page's sum of 9650 + 7250 + 6420 + 6300 + 5880 + 4530 + 4180 = 44210. That difference is the contract working as specified: paging must not move the total.

### State contracts

| State | Response |
|---|---|
| Empty, no invoice matches the filters | `customers[]` empty, `pagination.totalCount` 0, `total` zeroed. HTTP 200 |
| Page past the end | `customers[]` empty, `pagination.totalCount` and `total` still correct. HTTP 200, not an error |
| `sortBy` outside the whitelist | HTTP 400 naming the offending param and the allowed values |
| `pageSize` above the maximum | HTTP 400 naming the maximum. Not silently clamped, so a client bug surfaces |
| Permission denied | HTTP 403 with no body |
| Upstream unavailable | HTTP 503 |

## API 3: invoice list for a band or a customer

### Endpoint

```
GET /api/dashboard/receivable-invoices/invoices
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `scopeMode` | enum | yes | `bucket`, `customer` | none | Which kind of drill this is |
| `scopeKey` | string | yes | a band key when `scopeMode=bucket`; a `customerId` when `scopeMode=customer` | none | URL-encode the `121+` band key as `121%2B` |
| `revenueCenterId` | guid | no | any `id` from API 6's `revenueCenters[]` | omitted, meaning All | The filter active on the widget behind the modal |
| `sourceId` | guid | no | any `id` from API 6's `sources[]` | omitted, meaning All | Same |
| `asOf` | date | no | any date not in the future | server date | Pass the value API 1 returned |
| `sortBy` | enum | no | `daysPastDue`, `outstanding`, `dueDate`, `customer` | `daysPastDue` | Sort key |
| `sortDir` | enum | no | `asc`, `desc` | `desc` | Direction. The built Final opens oldest-first |
| `page` | int | no | 1 or greater | `1` | 1-based page number |
| `pageSize` | int | no | 1 to 200 | `50` | Rows per page |

### Example requests

```
GET /api/dashboard/receivable-invoices/invoices?scopeMode=bucket&scopeKey=121%2B&asOf=2026-07-23
GET /api/dashboard/receivable-invoices/invoices?scopeMode=customer&scopeKey=a1c4e7b2-1111-4aaa-9111-0d1e2f3a4b51&asOf=2026-07-23&sortBy=dueDate&sortDir=asc
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | date | DERIVED echo | Date ages were measured against |
| `scope` | object | DERIVED echo | What this list is scoped to |
| `scope.mode` | string | DERIVED echo | `bucket` or `customer` |
| `scope.key` | string | DERIVED echo | The band key or customer id |
| `scope.label` | string | DERIVED | Band label, or the customer's name. The modal heading |
| `revenueCenterId` | guid or null | DERIVED echo | `null` when All |
| `sourceId` | guid or null | DERIVED echo | `null` when All |
| `sortBy` | string | DERIVED echo | Applied sort key |
| `sortDir` | string | DERIVED echo | Applied direction |
| `pagination` | object | DERIVED | Pager state for `invoices[]` only |
| `pagination.page` | int | DERIVED echo | Current page |
| `pagination.pageSize` | int | DERIVED echo | Applied page size |
| `pagination.totalCount` | int | DERIVED count over the whole scoped set | Drives the pager |
| `invoices` | array | STORED `ARInvoice` | This page of invoice rows |
| `invoices[].invoiceId` | guid | STORED `ARInvoice` key | Key for API 4 and API 5, and the final sort tiebreaker |
| `invoices[].invoiceNumber` | string | STORED `ARInvoice` invoice number | Display number |
| `invoices[].customer` | string | STORED customer name | Customer column |
| `invoices[].billTo` | string | UNVERIFIED — column is `ARInvoice.BillToDisplay`, but it returns empty for every invoice on the Modern API today and the intended populated behaviour is unconfirmed (Backend/dev to confirm) | Rendered as a column in the modal. Treat empty as the current real-world value, not as "same as customer" `[TO CONFIRM — Backend/dev]` |
| `invoices[].dueDate` | date | STORED `ARInvoice.DueDate` | Due Date column |
| `invoices[].daysPastDue` | int | DERIVED `asOf - DueDate`, floored at 0 | 0 renders as "Not due" |
| `invoices[].outstanding` | number | DERIVED the Outstanding formula | Outstanding column |
| `totals` | object | DERIVED over the whole scoped set | The modal footer. Never the page |
| `totals.invoiceCount` | int | DERIVED count | "N invoices" |
| `totals.outstanding` | number | DERIVED sum | Footer amount |

### Example response

The 121+ band, oldest first, no filters.

```json
{
  "asOf": "2026-07-23",
  "scope": { "mode": "bucket", "key": "121+", "label": "121+ days" },
  "revenueCenterId": null,
  "sourceId": null,
  "sortBy": "daysPastDue",
  "sortDir": "desc",
  "pagination": { "page": 1, "pageSize": 50, "totalCount": 4 },
  "invoices": [
    { "invoiceId": "7c2e9a41-0001-4f8a-9c1e-2d6b8f0a3e75", "invoiceNumber": "INV-2874", "customer": "Whitestone Pension Office", "billTo": "",                          "dueDate": "2026-02-22", "daysPastDue": 152, "outstanding": 4530 },
    { "invoiceId": "7c2e9a41-0002-4f8a-9c1e-2d6b8f0a3e76", "invoiceNumber": "INV-2903", "customer": "Cornerstone Academy",       "billTo": "",                          "dueDate": "2026-02-28", "daysPastDue": 145, "outstanding": 9650 },
    { "invoiceId": "7c2e9a41-0003-4f8a-9c1e-2d6b8f0a3e77", "invoiceNumber": "INV-2890", "customer": "Legacy Insurance Group",    "billTo": "Legacy HR Dept",            "dueDate": "2026-03-01", "daysPastDue": 144, "outstanding": 6300 },
    { "invoiceId": "7c2e9a41-0004-4f8a-9c1e-2d6b8f0a3e78", "invoiceNumber": "INV-2932", "customer": "Fairhaven School",          "billTo": "Fairhaven Business Office", "dueDate": "2026-03-16", "daysPastDue": 130, "outstanding": 7250 }
  ],
  "totals": { "invoiceCount": 4, "outstanding": 27730 }
}
```

Reconciliation: 4530 + 9650 + 6300 + 7250 = 27730, matching `totals.outstanding` and matching the `121+` band's `outstanding` in API 1 under the same filters and `asOf`. Two rows carry an empty `billTo` because their bill-to party equals the customer, which is the specified conditional, not missing data.

### State contracts

| State | Response |
|---|---|
| Empty band or customer with no eligible invoices | `invoices[]` empty, `pagination.totalCount` 0, `totals` zeroed. HTTP 200 |
| Page past the end | `invoices[]` empty, `pagination.totalCount` and `totals` still correct |
| Unknown `scopeKey` | HTTP 404 naming the scope, so a stale modal link fails loudly rather than looking empty |
| `scopeMode` and `scopeKey` mismatched, e.g. a band key sent as a customer | HTTP 400 |
| Permission denied | HTTP 403 with no body |
| Upstream unavailable | HTTP 503 |

## API 4: invoice detail

### Endpoint

```
GET /api/dashboard/receivable-invoices/invoices/{invoiceId}
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `invoiceId` | guid, path | yes | an `invoiceId` from API 3's `invoices[]` | none | The invoice to expand |
| `asOf` | date | no | any date not in the future | server date | Only affects `daysPastDue` in the echo |

### Example requests

```
GET /api/dashboard/receivable-invoices/invoices/7c2e9a41-0002-4f8a-9c1e-2d6b8f0a3e76
GET /api/dashboard/receivable-invoices/invoices/7c2e9a41-0002-4f8a-9c1e-2d6b8f0a3e76?asOf=2026-07-23
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `invoiceId` | guid | DERIVED echo | The requested invoice |
| `invoiceNumber` | string | STORED `ARInvoice` invoice number | Modal heading |
| `customer` | string | STORED customer name | Heading |
| `billTo` | string | UNVERIFIED — `ARInvoice.BillToDisplay`, empty for every invoice on the Modern API today; intended populated behaviour unconfirmed (Backend/dev to confirm) | Same field and same caveat as API 3's `invoices[].billTo` |
| `dueDate` | date | STORED `ARInvoice.DueDate` | |
| `daysPastDue` | int | DERIVED `asOf - DueDate`, floored at 0 | |
| `outstanding` | number | DERIVED the Outstanding formula | Must equal the row's `outstanding` in API 3 at the same `asOf` |
| `lineItems` | array | STORED `ARInvoiceDetail` | Details tab |
| `lineItems[].description` | string | STORED item name | |
| `lineItems[].quantity` | number | STORED quantity | |
| `lineItems[].unitAmount` | number | STORED unit amount | |
| `lineItems[].amount` | number | DERIVED `quantity × unitAmount` | Returned pre-computed so the client never re-derives money |
| `attachments` | array | UNVERIFIED — source not confirmed in code (owner to confirm) | Attachments tab. Empty array when the source is unwired |
| `attachments[].attachmentId` | guid | UNVERIFIED (owner to confirm) | |
| `attachments[].name` | string | UNVERIFIED (owner to confirm) | File name |
| `attachments[].sizeBytes` | int | UNVERIFIED (owner to confirm) | Raw bytes; the client formats |
| `note` | string | UNVERIFIED — source not confirmed in code (owner to confirm) | Note tab. Empty string when unwired |
| `payments` | array | UNVERIFIED — source not confirmed in code (owner to confirm) | Payments tab. Empty array when unwired |
| `payments[].paymentDate` | date | UNVERIFIED (owner to confirm) | |
| `payments[].method` | string | UNVERIFIED (owner to confirm) | Method or reference |
| `payments[].amount` | number | UNVERIFIED (owner to confirm) | |

**Only `lineItems` is confirmed.** `attachments`, `note` and `payments` are three separate unverified sources. If any cannot be sourced cleanly, that tab routes to the existing invoice screen via the row drawer's "Open invoice" action rather than the API inventing a field. This is the largest single open item in the contract and it is in the sign-off list.

### Example response

INV-2903, the 121+ row from API 3.

```json
{
  "invoiceId": "7c2e9a41-0002-4f8a-9c1e-2d6b8f0a3e76",
  "invoiceNumber": "INV-2903",
  "customer": "Cornerstone Academy",
  "billTo": "",
  "dueDate": "2026-02-28",
  "daysPastDue": 145,
  "outstanding": 9650,
  "lineItems": [
    { "description": "Annual tuition balance", "quantity": 1, "unitAmount": 8200, "amount": 8200 },
    { "description": "Technology fee",         "quantity": 1, "unitAmount": 900,  "amount": 900 },
    { "description": "Late fee",               "quantity": 1, "unitAmount": 550,  "amount": 550 }
  ],
  "attachments": [
    { "attachmentId": "b3d5f7a9-0001-4c2e-8b6d-1f3a5c7e9b21", "name": "tuition-agreement.pdf", "sizeBytes": 225280 },
    { "attachmentId": "b3d5f7a9-0002-4c2e-8b6d-1f3a5c7e9b22", "name": "reminder-3.pdf",         "sizeBytes": 41984 }
  ],
  "note": "Escalated to collections review. Payment plan proposed.",
  "payments": [
    { "paymentDate": "2026-04-12", "method": "Check #4188", "amount": 0 }
  ]
}
```

Reconciliation: line items 8200 + 900 + 550 = 9650, matching `outstanding` and matching INV-2903's row in API 3. The `payments` entry has a zero amount because nothing has been applied to this invoice — an unapplied record, which is why `outstanding` still equals the full line-item sum.

### State contracts

| State | Response |
|---|---|
| Unknown or no-longer-outstanding `invoiceId` | HTTP 404. Not an empty payload, so a stale modal row fails visibly |
| An unverified section is unwired | That section returns an empty array or empty string; the rest of the payload is unaffected and the call still succeeds |
| All three unverified sections unwired | `lineItems` still returned in full. The client shows only the Details tab and routes the rest to "Open invoice" |
| Permission denied | HTTP 403 with no body |
| Upstream unavailable | HTTP 503 |

## API 5: confirm, move selected invoices to unposted transactions

The only write in this contract. It stages an **unposted payment** and commits nothing to the general ledger. The staged payment stays editable and reversible until a person posts it in Payment Processing. The invoices the widget shows are posted invoices awaiting payment, not records from any unposted-invoice queue.

The machinery already exists and is reused, not built: a payment is an `ARPayment` carrying a `Posted` flag, whose `ARPaymentDetail` rows each apply to one `ARInvoice`. Unposted payments are listed by `ARPaymentRepository.GetAllCurrentContextByFilters(posted:false, ...)`, selected by `SelectedIDs`, and posted by `ProcessPayments(blobID, postingDate)` with `CheckTransactionsAgainstCurrentYear` validation and unapplied-cash handling. GL journal detail is written on post only when `ARCompany.InterfaceGL` is on. Posting reduces Outstanding, and an invoice leaves the widget when Outstanding reaches 0. `[CODE]`

**What is open is not the mechanism but the product nuance:** whether Confirm creates the payment records outright or stages the selected invoices into the payment-entry screen for a person to key, and whether the amount applied is the full Outstanding per invoice or a partial amount. That is in the sign-off list. The request shape below covers the full-amount create case; a partial-amount decision adds a per-invoice amount field and nothing else.

### Endpoint

```
POST /api/dashboard/receivable-invoices/unposted-payments
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `invoiceIds` | guid array, body | yes | 1 to 200 ids from API 3's `invoices[]` | none | The invoices ticked in the modal. Maps onto the legacy `SelectedIDs` |
| `asOf` | date, body | yes | the `asOf` the modal was read at | none | Staleness guard. The server rejects any invoice whose Outstanding changed since |

### Example requests

```
POST /api/dashboard/receivable-invoices/unposted-payments
{ "invoiceIds": ["7c2e9a41-0002-4f8a-9c1e-2d6b8f0a3e76"], "asOf": "2026-07-23" }

POST /api/dashboard/receivable-invoices/unposted-payments
{ "invoiceIds": ["7c2e9a41-0002-4f8a-9c1e-2d6b8f0a3e76", "7c2e9a41-0003-4f8a-9c1e-2d6b8f0a3e77"], "asOf": "2026-07-23" }
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `batchId` | guid | NEW | The staged unposted payment batch, for the Payment Processing link |
| `applied` | array | NEW | The invoices successfully staged |
| `applied[].invoiceId` | guid | DERIVED echo | |
| `applied[].appliedAmount` | number | DERIVED the invoice's Outstanding at commit time | Full Outstanding, pending the partial-amount decision |
| `rejected` | array | NEW | Per-invoice failures. Never an all-or-nothing error |
| `rejected[].invoiceId` | guid | DERIVED echo | |
| `rejected[].reason` | string | NEW | `already_paid`, `outstanding_changed`, `not_found`, `not_eligible` |

The response deliberately reports per invoice rather than failing the whole call, because the modal is an `asOf` snapshot and another user may have paid one of the selected invoices in between.

### Example response

Two invoices submitted, one of which was paid by someone else since the modal was read.

```json
{
  "batchId": "e9f1a3c5-4b6d-4a8e-9c2f-5d7b1e3a9c40",
  "applied": [
    { "invoiceId": "7c2e9a41-0002-4f8a-9c1e-2d6b8f0a3e76", "appliedAmount": 9650 }
  ],
  "rejected": [
    { "invoiceId": "7c2e9a41-0003-4f8a-9c1e-2d6b8f0a3e77", "reason": "outstanding_changed" }
  ]
}
```

Reconciliation: 1 applied + 1 rejected = 2 invoices submitted, and `appliedAmount` 9650 equals INV-2903's `outstanding` in API 3, since the full Outstanding is applied.

### State contracts

| State | Response |
|---|---|
| Every invoice staged | `applied[]` full, `rejected[]` empty, HTTP 200 |
| Every invoice rejected | `applied[]` empty, `rejected[]` full, HTTP 200. The staleness is data, not a fault, and `batchId` is null |
| Empty `invoiceIds` | HTTP 400. The button being always enabled is a build decision; the API still refuses an empty write |
| More than 200 ids | HTTP 400 naming the maximum |
| Permission denied | HTTP 403. Requires the Payment Processing right, which is a different right from the read |
| Upstream unavailable | HTTP 503, nothing staged. The write is atomic per invoice and never half-applies one |

## API 6: filter lists

### Endpoint

```
GET /api/dashboard/receivable-invoices/filters
```

### Parameters

No parameters beyond the company header. Both lists are company-scoped and neither depends on the other.

### Example requests

```
GET /api/dashboard/receivable-invoices/filters
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `revenueCenters` | array | STORED `ARRevenueCenterRepository` | Options for the Revenue Center chip, excluding the All entry which the client adds |
| `revenueCenters[].id` | guid | STORED | Value for the `revenueCenterId` param |
| `revenueCenters[].name` | string | STORED | Display label |
| `sources` | array | STORED `ARSourceRepository` | Options for the Source chip, excluding All |
| `sources[].id` | guid | STORED | Value for the `sourceId` param |
| `sources[].name` | string | STORED | Display label |

### Example response

```json
{
  "revenueCenters": [
    { "id": "2f8b1c94-0001-4a7f-9b0c-1d2e3f4a5b61", "name": "Church" },
    { "id": "2f8b1c94-0002-4a7f-9b0c-1d2e3f4a5b62", "name": "Insurance Billing" },
    { "id": "2f8b1c94-0003-4a7f-9b0c-1d2e3f4a5b63", "name": "Pension Billing" },
    { "id": "2f8b1c94-0004-4a7f-9b0c-1d2e3f4a5b64", "name": "School" }
  ],
  "sources": [
    { "id": "7a3c9e15-0001-4f8a-9c1e-2d5b8f0a3e71", "name": "Insurance Billing" },
    { "id": "7a3c9e15-0002-4f8a-9c1e-2d5b8f0a3e72", "name": "Pension Billing" }
  ]
}
```

Reconciliation: 4 revenue centers + 2 sources = 6 options, matching the built Final's two chip lists once each list's own All entry is excluded.

### State contracts

| State | Response |
|---|---|
| A list is empty for this company | That array is empty. The client renders the chip with All only, and does not hide it |
| Permission denied | HTTP 403 with no body |
| Upstream unavailable | HTTP 503. The client falls back to All on both chips and disables them |

## Auth and scoping

- **Company scoping.** Every call carries `X-Company-ID`, and every query in this contract is scoped by it. No endpoint returns data across companies, and no client-supplied id overrides the header.
- **Read permission right.** The AR receivables read right gates API 1, 2, 3, 4 and 6. Without it every read returns 403 with no body.
- **Write permission right.** API 5 additionally requires the Payment Processing right — a separate right from the read. A user can therefore see the widget and its drill while being unable to Confirm.
- **What a user without the read right sees.** The widget is hidden rather than rendered empty, so an empty aging chart never gets read as "nothing is owed". This is a product decision and it is the one being specified here.
- **What a user with read but not write sees.** The modal renders with the row checkboxes and Confirm suppressed by the client. The API still enforces the right independently and never relies on the client hiding the control.

## Edge cases

1. **Empty band.** A band with no invoices is returned with `outstanding` 0 and `invoiceCount` 0, never omitted, so all six bands are always present in order.
2. **Nothing outstanding at all.** Every band zero, `total` and `overdue` zero. The "Nothing outstanding" state is read from this, not from an error.
3. **Nothing overdue.** `overdue` zeroed while `total` is non-zero, driving the "All current" pill.
4. **Filter combination matching nothing.** Returns a well-formed zero response, since the two filters share a value space and a valid pair can legitimately match no invoice.
5. **Blank source.** An invoice with no source appears only when `sourceId` is omitted; a blank is never treated as matching a specified source.
6. **Invoice not yet due.** `daysPastDue` is floored at 0 rather than returned negative, and the invoice lands in the Current band.
7. **Invoice due exactly today.** `daysPastDue` is 0, so it is Current, not 1-30. The boundary is `> 0` for overdue.
8. **Division by zero in percent-of-total.** `total.outstanding` is 0, so the client renders every band at 0% and performs no division. No endpoint returns a percentage.
9. **`asOf` before an invoice was issued.** The invoice is absent from that response rather than appearing with a zero balance.
10. **Pagination past the end.** Empty rows with `pagination.totalCount` and every aggregate still correct.
11. **Sort key outside the whitelist.** Rejected with 400 rather than silently defaulted, so a client typo cannot quietly reorder a list.
12. **Customer with one invoice not yet due.** `oldestDaysPastDue` is 0 and `worstBucket` is `current`; the row still appears, because it has an outstanding balance.
13. **Invoice paid between the modal read and Confirm.** That id comes back in `rejected[]` with `outstanding_changed`; the rest still stage.
14. **The same invoice submitted twice in one Confirm.** Deduplicated before staging, and reported once.
15. **Invoice with no line items.** `lineItems` is an empty array; `outstanding` is still authoritative and the two are not required to reconcile.
16. **Modal open while a filter changes behind it.** The modal keeps its own `asOf` and scope until closed, so its footer never disagrees with its rows mid-interaction.

## Not in scope

- **Posting the payment.** API 5 stages an unposted payment. The `ProcessPayments` post step and its reversal live on the Payment Processing page, not in this widget.
- **Partial-amount payments**, pending the sign-off decision. The current request shape applies the full Outstanding per invoice.
- **Select-all in the modal.** The built Final has row checkboxes only, deliberately, with no header select-all box.
- **Export to Excel.** Generated client-side from the response already held. No export endpoint, since the client has the rows and the totals it needs.
- **"Record a follow-up".** Present as a button in the row drawer but not wired to anything and not specified here. It needs a product definition before it can have a contract.
- **"Open invoice".** A deep link the client builds from `invoiceId` to the existing invoice screen. No endpoint, and the dashboard does not refresh when the user returns from it.
- **Cross-dashboard global filters.** Whether this widget responds to any dashboard-wide filter is unconfirmed and is not part of this contract.
- **Server-side percentages, colour bands, or sizing.** All client-side over the returned figures.

## Still needs sign-off

- **Attachments, Note and Payments sources for API 4.** Three separate unverified sources; only `lineItems` is confirmed against `ARInvoiceDetail`. **Decides:** owner with a codebase trace. **Blocked until then:** three of the four modal tabs, which otherwise route to "Open invoice".
- **The Confirm nuance: create or stage, full amount or partial.** The mechanism is settled. **Decides:** SME/product. **Blocked until then:** whether API 5's request gains a per-invoice amount field, and whether `applied[].appliedAmount` is ever less than the invoice's Outstanding.
- **Worst-case row ceilings for the customer rollup and the invoice list.** Both are marked `[TO CONFIRM]` in the volume table; the built Final's 23 invoices are a demo figure and not a basis. **Decides:** owner or SME with a live query. **Blocked until then:** nothing in the contract, but the `pageSize` maximum of 200 and the LIVE cache posture are provisional and may need a precomputed rollup instead.
- **The six-band definition.** The build carries six bands and this contract specifies them, per the owner's ruling. The Step 4 doc still records the band change as held pending confirmation from the 2026-08-25 call, and still describes five bands. **Decides:** Feargal, to close the hold formally. **Blocked until then:** nothing in the contract; the Step 4 doc needs updating to match, and this is flagged so a reader of that doc is not confused by the difference.
- **The drill-modal scope question.** The Step 4 doc records that the widget should be a navigation and prioritisation tool that opens the existing invoice screen, rather than reproducing the transaction screen inline. This contract specifies the modal the build actually has, per the owner's ruling. **Decides:** Feargal. **Blocked until then:** nothing, but if it resolves toward navigate-out then **API 4 and API 5 are both dropped** and API 3 becomes a list of deep links. That is the largest single scope risk in this contract and a developer must see it before building either.
- **Band-boundary reconciliation with the shared `ap-ar-aging` surface.** Confirm the six boundaries here match whatever any shared aging endpoint uses, so this widget and that surface cannot disagree at a band edge. **Decides:** backend. **Blocked until then:** nothing, but a mismatch would be a silent reporting discrepancy.
