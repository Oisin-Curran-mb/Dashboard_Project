# Purchasing Management - API Spec

**Status: Done - awaiting sign-off (drafting complete, owner review pending)**

---

## Overview

Purchasing Management is the dashboard's purchase-order approval board. It answers three questions: *what purchase requests are waiting, and for how long*, *what state is each request in*, and *what can I do about it from here*. The default view is a board with one column per approval state (Pending, Approved, Rejected), each column oldest-first so the longest-waiting request surfaces at the top; a second Table view lists everything over time, including the Closed and Voided archive. The widget is one of the few action-capable widgets in the set: a user actions a request directly from the board (approve, reject, return to pending, close, void, hold), each action recording a reason note.

This contract defines **seven APIs**: a server-aggregated state-count summary that feeds the compact tier, a bounded per-state board read, a paginated request table, the existing approval-path lookup reused with a reshaped parameter, and three writes - an approval-state transition, a hold toggle, and an invoice payment-approval entry. The count is derived from the decomposition triggers in the API inventory, not chosen. All three writes and two of the read fields are backend work that does not exist today, and the payment-entry write additionally sits under an unresolved dispute (see Still needs sign-off): if the redirect reading is upheld, API 7 is dropped from this contract entirely.

Framework verdicts, stated once and justified in their own sections below:

- **Filter execution.** Every filter executes **SERVER**-side. The table paginates and the board is server-capped per column, so nothing over either set may be filtered client-side.
- **Volume.** The table is `MUST PAGINATE`; the board is `BOUNDED` by construction (a fixed state set times a capped cards-per-state); the summary is `MUST AGGREGATE SERVER-SIDE`. No worst-realistic request count has a documented basis, so the ceilings are `[TO CONFIRM]` against a named owner.
- **Decomposition.** Seven APIs, each citing a trigger. Close and Void were folded into the transition write rather than given their own endpoints, because the build routes them through the same guarded state-change logic as approve and reject.
- **Computation.** Every count, total, sort order and state classification is server-side. The client derives the item-age label and the headline string from values already in the response, and nothing else.

The drill-through is a navigation, not an API: selecting a card or row sends the user to the existing PO record screen at `/PurchasingManagement/Requests/Update/{orderId}` [DOC - Step 1 research; URL pattern seen live, beta1, 2026-08-19]. The record screen's own read and edit surface is out of this contract's scope.

---

## Design → API coverage

| Design element | Type | API | Field(s) | Provenance |
|---|---|---|---|---|
| Headline "N pending approval" (compact tier) | KPI | API 1 | `states[].count` where `states[].state` is `Pending` | DERIVED count of visible Pending requests [BUILD] |
| Three state-count cards (compact tier, Pending first) | KPI | API 1 | `states[]`, `states[].state`, `states[].count` | DERIVED count per state [BUILD] |
| Compact-tier caption "N pending requests, $X outstanding" | KPI | API 1 | `states[].count` (Pending), `pendingOutstandingTotal` | DERIVED SUM(amount) over Pending [BUILD] |
| Board columns, one per approval state | View | API 2 | `columns[]`, `columns[].state` | DERIVED state mapping over `PO_Order.Status` plus the rejection marker [DOC - Step 1 research; BUILD] |
| Column count chip | KPI | API 2 | `columns[].totalCount` | DERIVED count over the full filtered state [BUILD] |
| Board card (request number, vendor, amount) | Card | API 2 | `columns[].cards[]`, `cards[].orderId`, `cards[].poNumber`, `cards[].vendor`, `cards[].amount` | STORED `PO_Order` [DOC - Step 1 research] |
| Item-age label ("waiting N days" / "issued N days ago") | Card | API 2, API 3 | `cards[].issuedDate`, `rows[].issuedDate`, with `asOf` | DERIVED client-side: whole days between `issuedDate` and `asOf` [BUILD] |
| Overdue read on a card / red-flagged table row | State | API 2, API 3 | `cards[].isOverdue`, `rows[].isOverdue` | UNVERIFIED (Feargal Phelan, backend): needs an expected-by date field on purchasing records [TO CONFIRM; Step 4 Sign-off Readiness row 3] |
| Payment sub-state on an Approved card (paid / not paid) | State | API 2, API 3, API 5, API 6, API 7 | `paymentStatus` | NEW: payment approval lives only on the record screen today, no dashboard read exists [TO CONFIRM - Feargal Phelan; Step 4 row 11] |
| Hold sub-state (locked card, lock flag plus reason text) | State | API 2, API 3, API 5, API 6 | `onHold`, `holdReason` | NEW dashboard read; hold itself is real on approval rows [LIVE - Approvals tab screenshot, 2026-08-19; Step 4 row 12] |
| "+N more" link under a trimmed column | Drill | API 2 | `columns[].totalCount` minus rendered card count; no extra field | DERIVED client arithmetic [BUILD] |
| Header caption "# requests: N, total $X" | KPI | API 2, API 3 | `requestCount`, `totalAmount` (board); `totalCount`, `totalAmount` (table) | DERIVED over the full filtered set, never the page [BUILD] |
| Drag to Approved / Rejected / Pending with a reason note | Action | API 5 | `targetState`, `reason` (request); `state` (response) | NEW: no dashboard approve/reject write exists in either codebase [DOC - Step 6 dossier open question; Step 4 row 10] |
| Finish column, Close drop (paid orders only) | Action | API 5 | `targetState: "Closed"`, `reason` | NEW: Closed is manual on the record screen today [LIVE - beta1, 2026-08-19; Step 4 row 13] |
| Finish column, Void drop (unpaid only) | Action | API 5 | `targetState: "Voided"`, `reason` | NEW: Voided is manual on the record screen today [LIVE - beta1, 2026-08-19; Step 4 row 13] |
| Put on hold / Remove hold with a reason | Action | API 6 | `hold`, `reason` (request); `onHold`, `holdReason` (response) | NEW write; mirrors the Approvals tab's Hold checkbox plus Reason [LIVE - screenshot, 2026-08-19; Step 4 row 12] |
| Invoice payment entry and Submit for Approval | Action | API 7 | `invoices[]`, `invoices[].invoiceNumber`, `invoices[].tax`, `invoices[].freight`, `invoices[].other`, `invoices[].distribution`, `distribution.description`, `distribution.project`, `distribution.amount`, `submitForApproval` | NEW and DISPUTED: see Still needs sign-off item 1 before building [TO CONFIRM - Feargal Phelan; Step 4 rows 11-12] |
| PO Status filter (view-aware value list) | Filter | API 2, API 3 | `state` param, echoed per column and row | STATIC enum; the state set is fixed in code, not configurable [DOC - Widget_Comparison_Classic.html code trace] |
| Approval Path filter | Filter | API 4, plus `approvalPathId` param on APIs 1-3 | `paths[]`, `paths[].approvalPathId`, `paths[].name` | STORED `PO_ApprovalPath`, customer-defined data [DOC - Step 1 research] |
| Department filter and Table column | Filter / Table column | API 3 | `department` param, `rows[].department` | UNVERIFIED (Feargal Phelan, backend): no known source field on purchasing records [TO CONFIRM; Step 4 row 1] |
| Year filter (Table only) | Filter | API 3 | `fiscalYear` param, `rows[].fiscalYear` | UNVERIFIED (Feargal Phelan, backend): no known source field [TO CONFIRM; Step 4 row 2] |
| Overdue-only toggle (Table only) | Filter | API 3 | `overdueOnly` param, `rows[].isOverdue` | UNVERIFIED (Feargal Phelan, backend) [TO CONFIRM; Step 4 row 3] |
| Table columns: PO #, Vendor, Amount, Status, Issued | Table column | API 3 | `rows[].poNumber`, `rows[].vendor`, `rows[].amount`, `rows[].state`, `rows[].issuedDate` | STORED `PO_Order`; `state` DERIVED per the mapping in Tables [DOC - Step 1 research] |
| Table totals row (request count plus combined amount) | KPI | API 3 | `totalCount`, `totalAmount` | DERIVED over the full filtered set [BUILD] |
| Table pager and trimmed-view caps | State | API 3 | `page`, `pageSize`, `totalCount`, `sortBy`, `sortDir` | DERIVED [BUILD: trimmed tiers render the first rows of the oldest-first order] |
| Board / Table view toggle | View | none | switches which endpoint is called; no field | DERIVED client state [BUILD] |
| Card / row / edit-icon drill to the PO record | Drill | none (navigation) | `orderId` builds the record-screen URL | STORED `PO_Order` key [DOC - Step 1 research] |
| Empty states (nothing at all / filters match nothing / a state with zero requests) | State | API 1, API 2, API 3 | zero counts, empty `cards[]` and `rows[]`, `requestCount` | DERIVED well-formed zero responses [BUILD] |
| Freshness anchor | State | all | `asOf` | DERIVED server clock, echoed on every response |

Access scoping is not a field: every read is filtered server-side to what the caller may see (administrators all orders, other users only orders on approval paths they are part of) [DOC - Step 1 research]. See Auth and scoping.

---

## Tables

| Table / repository | Fields and members used |
|---|---|
| `PO_Order` | Order key, requisition/order number, vendor, date issued, total/outstanding amount, `Status` (0 Unapproved, 1 Approved, 2 Closed, 3 Voided) [DOC - Step 1 research; LIVE - record-screen Status vocabulary, beta1, 2026-08-19] |
| `PO_ApprovalPath` / `PO_ApprovalUser` | Approval path definitions and path membership; drives both the access scope and the Approval Path lookup [DOC - Step 1 research] |
| `PO_Approval` (approval rows) | Per-approver rows carrying approve/reject state, Reason, Hold checkbox plus its Reason, and updated-by identity [LIVE - Approvals tab screenshot, 2026-08-19]. Exact column names [TO CONFIRM - Feargal Phelan] |
| Payment approval / check issue records | The source of `paymentStatus` (the real paid signal is the check number and date being filled) [LIVE - Payment Approval tab screenshot, 2026-08-19]. Table not identified in any trace [TO CONFIRM - Feargal Phelan] |

No new tables are asserted by this contract. The reads are new queries against existing tables, with two exceptions that may need schema or join work: the `paymentStatus` read (no dashboard-facing source identified) and the three Rule 11 fields (`department`, `fiscalYear`, and the expected-by date behind `isOverdue`), none of which is confirmed to exist on purchasing records.

Core statements a developer should check queries against:

- **State mapping:** `Pending` = `PO_Order.Status = 0` and not rejected; `Approved` = `Status = 1`; `Rejected` = orders carrying a rejection on their approval rows (rejected orders exist in the data but no current widget query returns them); `Closed` = `Status = 2`; `Voided` = `Status = 3`. [DOC - Step 1 research; DOC - Widget_Comparison_Classic.html status logic; the Rejected read is NEW, Step 4 row 9]
- **Access scope on every read:** administrators see all orders; every other user sees only orders on approval paths they are part of. [DOC - Step 1 research]
- **Overdue rule, stated once and owned by the server:** a request is overdue when its expected-by date is before `asOf` and its state is `Pending`. [BUILD; the expected-by field is UNVERIFIED, Step 4 row 3]
- **Oldest-first everywhere:** the default order in the table and inside each board column is date issued ascending, then `orderId` ascending as the unique tiebreaker. [BUILD; owner sort ruling recorded in Step 4]
- **Paid means check-issued:** `paymentStatus = "paid"` must be read from the check having been issued, not from a request-side flag. [LIVE - Payment Approval tab, 2026-08-19]

---

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Status filter | Four personal-queue options (Needs my approval / Waiting for others / All pending / All orders), hardcoded in both codebases, with per-option WHERE logic | STATIC five-state model (Pending / Approved / Rejected / Closed / Voided) plus All; the personal-queue options are not consumed. DERIVED reshaping of existing status logic |
| Rejected orders | Never returned by any widget query | Served as the Rejected state. NEW data change [Step 4 row 9] |
| Closed / Voided orders | Statuses 2 and 3 never selected by the widget's queries | Served to the table as archive states. NEW [Step 4 row 13] |
| Grid read | One unpaginated grid endpoint `GET .../grid?status={int}&approvalPathId={guid}` returning `{OrderId, RequisitionOrOrderNumber, Description, Date, TotalOrOutstanding}` | Split into a summary, a per-state board and a paginated table, all with full-set aggregates. DERIVED reshaping |
| Approval-path lookup | `GET .../approval-paths?status={int}` returning `{ApprovalId, Name}` | Reused with the `state` string parameter in place of the legacy status integer. DERIVED reshaping |
| Writes | None: the dashboard is read-only; all actioning happens on the record screen | Approval-state transition, hold toggle, and (disputed) payment entry. NEW [Step 4 rows 10-13] |
| Payment status | Not served anywhere; payment approval is record-screen-only | `paymentStatus` read field on Approved requests. NEW [Step 4 row 11] |
| Hold | Real on approval rows, not served to the dashboard | `onHold` / `holdReason` read fields plus the hold write. NEW [Step 4 row 12] |
| Encumbrance chart | `GET .../chart` live today | Not consumed. The chart is cut from the design |
| Status-options lookup | `GET .../status-options` returns the static four-option array | Not consumed. The client's state list is a static enum |
| Filter persistence | Legacy saves both filter selections per user across sessions | Not implemented in the Modern API. Requirement stands, mechanism outside this contract [Step 4 row 8; see Not in scope] |

---

## API inventory

| API | Purpose | Trigger (when it fires) | Cardinality | R/W | Cache posture | Split trigger |
|---|---|---|---|---|---|---|
| API 1: request summary | State counts plus pending outstanding total for the compact tier | Compact-tier render; refresh | 3 state rows plus 1 total | R | LIVE per request | Cardinality gap: the compact tier must never pay for card lists |
| API 2: approval board | Per-state card lists, capped per column, with full-set aggregates | Board render; status or path filter change; after any write | 3 columns x `cardsPerState` cap | R | LIVE per request | Grain gap: per-state capped lists vs one flat pageable list; trigger gap vs API 3 (a view the user has not opened) |
| API 3: request table | Paginated, sortable flat list including the archive states | Table view opened; table filter, sort or page change | One page (max 100 rows) plus full-set aggregates | R | LIVE per request | Cardinality gap: unbounded list vs bounded board; carries archive states the board never serves |
| API 4: approval-path lookup | The Approval Path filter's options, scoped to the caller | First render; status filter change (cascade) | Customer-defined path count [TO CONFIRM - Feargal Phelan] | R | TTL 15 min per user+state | Lifetime gap: customer configuration changes rarely; pre-existing endpoint reused |
| API 5: state transition (write) | Approve, reject, return to pending, close or void one request, with a reason | Drop confirmed on a board column or Finish target | 1 request | W | none | Read vs write |
| API 6: hold toggle (write) | Put one request on hold or remove the hold, with a reason | Hold action confirmed | 1 request | W | none | Read vs write; separate from API 5 because hold is orthogonal to state and never changes it |
| API 7: payment approval entry (write) | Enter invoice payment approvals and submit, marking the request paid | Submit for Approval confirmed | 1 request, up to a handful of invoice lines | W | none | Read vs write; DISPUTED - dropped entirely if the redirect ruling lands (Still needs sign-off item 1) |

Merges considered and closed:

- **API 1 into API 2:** rejected. The compact tier fires alone and must not carry card lists; the board response does carry the same aggregates so the two tiers reconcile.
- **Close/Void as their own endpoint:** rejected. The build routes Close and Void through the same guarded state-change logic as approve and reject, so they are `targetState` values on API 5 with server-enforced eligibility, not a second write surface.
- **API 6 into API 5:** rejected. Hold does not change the approval state, and a combined body would allow contradictory intents in one call.

---

## Call sequence

| Interaction | Calls fired | Notes |
|---|---|---|
| Initial widget load (compact tier) | API 1 | One call, aggregates only |
| Initial widget load (mid or large tier, board view) | API 4, then API 2 | Path options first so the filter renders; both reads echo `asOf` |
| Change PO Status filter | API 4, then API 2 or API 3 | Cascade: path options re-derive for the new state; a stale path selection resets to All client-side |
| Change Approval Path filter | API 2 (board) or API 3 (table) | No lookup refetch; options do not depend on the path itself |
| Switch view (board to table, or back) | API 3 or API 2 | The "+N more" link is this same switch to the table |
| Change Department / Year / Overdue-only (table) | API 3 | Table-only params; the board never sends them |
| Change table sort or page | API 3 | `sortBy` / `sortDir` / `page` |
| Open drill (card, row, or edit icon) | none | Navigation to `/PurchasingManagement/Requests/Update/{orderId}` |
| Confirm a drag move (approve / reject / return) | API 5, then API 2 | The refetch shares the write response's `asOf` so the board cannot straddle the write |
| Confirm a Finish drop (Close or Void) | API 5, then API 2 | Same anchor rule |
| Confirm hold / remove hold | API 6, then API 2 or API 3 | Same anchor rule |
| Confirm Submit for Approval (payment entry) | API 7, then API 2 | DISPUTED; if the redirect ruling lands this row becomes a navigation instead |
| Refresh | API 1 (compact) or API 4 + current view's read | Re-runs the current state; a fresh `asOf` is adopted |

Where two calls must reconcile on screen (API 1's counts against API 2's column counts, or a write response against the follow-up read), the shared anchor is `asOf`: the client passes the last anchor it holds and both responses echo the anchor they were computed at.

---

## Filter architecture

| Filter | Option source | Cardinality | Execution | Aggregate effect | Cascade | "All" wire form | Round trips |
|---|---|---|---|---|---|---|---|
| PO Status | STATIC enum: board offers All, Pending, Approved, Rejected; table adds Closed, Voided | 4 (board) / 6 (table) | SERVER: `state` param on APIs 2 and 3 | Yes: every count and total | Drives API 4's option list | Omit the param | 2 (API 4 + the view's read) |
| Approval Path | LOOKUP: API 4, scoped to paths the caller is authorised on | Customer-defined; 4 in the build's dataset [BUILD]; realistic ceiling [TO CONFIRM - Feargal Phelan] | SERVER: `approvalPathId` param on APIs 1, 2, 3 | Yes: every count and total | Options depend on PO Status | Omit the param | 1 |
| Department (table only) | STATIC list in the build; real source [TO CONFIRM - Feargal Phelan, Step 4 row 1] | 5 in the build [BUILD]; unknown for real data | SERVER: `department` param on API 3 | Yes: `totalCount`, `totalAmount` | None | Omit the param | 1 |
| Year (table only) | DERIVED from data (fiscal years present); real source [TO CONFIRM - Feargal Phelan, Step 4 row 2] | Small (a few fiscal years) | SERVER: `fiscalYear` param on API 3 | Yes: `totalCount`, `totalAmount` | None | Omit the param | 1 |
| Overdue only (table only) | STATIC toggle | 2 | SERVER: `overdueOnly` param on API 3 | Yes: `totalCount`, `totalAmount` | None | Omit the param (false) | 1 |

- Every filter is SERVER-side because API 3 paginates and API 2 is column-capped: the client never holds the full set, so no client filter can satisfy Framework 1's first condition.
- **Combination semantics:** AND across all filters, always narrowing. No OR pairs, no mutually exclusive pairs.
- **Conflict rule:** a syntactically valid combination that matches nothing (for example a path that has no orders in the selected state - the two draw on overlapping value spaces) returns a well-formed zero response, not an error. An `approvalPathId` that does not exist in the tenant, or that the caller is not authorised on, is a `400 unknown-approval-path`: unknown ids are faults, empty intersections are data.
- **Cascade invalidation:** when PO Status changes, the client refetches API 4 and, if the selected path is absent from the new option list, resets the selection to All before calling the view's read. The server does not remember filter state.
- **Board state values:** API 2 accepts only `Pending`, `Approved`, `Rejected`. `Closed` or `Voided` on the board endpoint is a `400 invalid-state-for-board`; the client treats an archive state as All when switching back to the board.
- **Blank values are not wildcards:** a row with no department value is included under "All Departments" and excluded by any specific `department` value; the same rule applies to `fiscalYear`. A row with no expected-by date is never overdue and is excluded by `overdueOnly=true`.

---

## Volume and performance

| Dataset | Typical rows | Worst realistic rows (basis) | Row width | Payload at worst | Verdict | Server cost model | Cache posture |
|---|---|---|---|---|---|---|---|
| API 1 summary | 3 state rows + 1 total | Fixed at 3 states by the enum | 2 fields per state row, ~40 bytes | < 1 KB | MUST AGGREGATE SERVER-SIDE | Single grouped scan over the caller's visible orders | LIVE |
| API 2 board | 18 cards total in the build's dataset [BUILD - demo figure, not a ceiling] | 3 states x `cardsPerState` max 100 = 300 cards by construction; underlying per-state counts [TO CONFIRM - Feargal Phelan] | 9 fields, ~220 bytes/card | ~66 KB at the construction cap | BOUNDED (by the cap, not by the data) | One indexed scan per state with TOP-N, plus one grouped count | LIVE |
| API 3 table page | 18 rows in the build's dataset [BUILD - demo figure] | One page, `pageSize` max 100; underlying total [TO CONFIRM - Feargal Phelan] | 11 fields, ~260 bytes/row | ~26 KB per page | MUST PAGINATE | Single indexed scan with ORDER BY + OFFSET, plus one grouped aggregate over the filtered set | LIVE |
| API 4 paths | 4 in the build's dataset [BUILD] | Customer-defined [TO CONFIRM - Feargal Phelan] | 2 fields, ~60 bytes | A few KB | BOUNDED (customer configuration, not transactional data) | One join over `PO_ApprovalPath` / `PO_ApprovalUser` scoped to the caller | TTL 15 min per user+state |

There is no citable ceiling for how many purchase orders a large organisation holds open, which is exactly why the table paginates and the board is capped rather than mirroring the build's load-everything behaviour: the build's 18-request dataset makes every operation feel instant, and that is a property of the fixture, not of the contract. No time series exists in this contract, so there is no N x M product to state.

### Pagination contract

Applies to API 3 (the only `MUST PAGINATE` verdict).

- **Params:** `page` (1-based, default 1), `pageSize` (default 10, **maximum 100**).
- **What paginates:** the `rows[]` array, and nothing else.
- **What does not:** `totalCount` and `totalAmount` compute over the **full filtered set**, never the page. Switching pages changes no total, count, or compact-tier figure.
- **Sort params:** `sortBy` whitelist: `issuedDate` (default), `poNumber`, `vendor`, `amount`, `department`, `state`. `sortDir`: `asc` (default) or `desc`. The default order is the design's aging read: oldest first.
- **Deterministic total order:** every sort ends in `orderId` ascending as the unique tiebreaker, so pages never duplicate or skip rows.
- **`totalCount`** is returned alongside every page.
- **Past the last page:** empty `rows[]`, correct `totalCount` and `totalAmount`, HTTP 200, not an error.

The board (API 2) does not paginate; its columns are capped by `cardsPerState` and each column carries its own `totalCount` so the client can render "+N more" without a second call. Requests beyond the cap are reached through the table.

---

## Where computation lives

| Value | Server or client | Basis | Why |
|---|---|---|---|
| State classification (Pending / Approved / Rejected / Closed / Voided) | Server | `PO_Order.Status` plus the rejection marker [DOC - Step 1 research] | Requires the status and approval rows the client never holds |
| Per-state counts (compact cards, column chips) | Server | Grouped count over the caller's visible orders | Spans the full set, not the shipped cards |
| Pending outstanding total | Server | SUM(amount) over visible Pending requests | Spans the full set |
| Board and table header aggregates (`requestCount` / `totalCount`, `totalAmount`) | Server | SUM/COUNT over the full filtered set | The set is paginated or capped |
| Table totals row | Client formats `totalCount` and `totalAmount` | Values already in the response | Pure formatting |
| Item-age label ("waiting N days") | Client | Whole days between `issuedDate` and `asOf`, both in the response | Pure arithmetic over shipped values |
| Overdue flag | Server (`isOverdue`) | Expected-by date before `asOf` on a Pending request | It is a server filter (`overdueOnly`), so the flag and the filter must share one implementation |
| Sort order (table and within each column) | Server | `issuedDate` asc, `orderId` tiebreaker | Both sets are server-limited |
| "+N more" figure | Client | `columns[].totalCount` minus cards shipped | Pure arithmetic |
| Headline string ("Purchasing: N pending approval") | Client | The Pending `states[].count` | String formatting over a shipped value |
| Hold and payment sub-state presentation | Client | `onHold`, `holdReason`, `paymentStatus` shipped raw | Presentation bands the raw values; every visual state is paired with a text label |
| Action eligibility guards (close needs paid, void needs unpaid, held and terminal requests refuse transitions) | Server, authoritative | The rules in API 5 and API 6 | The client may pre-check to suppress an affordance, but the server enforces on every write |

No API in this contract computes a percentage, so no division-by-zero rule is needed; that is stated deliberately, not omitted. No deltas exist in this contract. No presentation threshold exists beyond the overdue rule stated in Tables.

---

## API 1: request summary

### Endpoint

```
GET /api/dashboard/purchasing-management/summary
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `approvalPathId` | string (guid), query | No | A path the caller is authorised on | omitted = all paths | Narrows every figure to one approval path. The compact tier carries no status filter, so there is no `state` param here [BUILD] |

Context headers: `X-Company-ID`, `X-UserTenant-ID` [DOC - Widget_Comparison_Classic.html, modern purchasing-management identity].

### Example requests

```
GET /api/dashboard/purchasing-management/summary
GET /api/dashboard/purchasing-management/summary?approvalPathId=7f3a9c2e-1b44-4e0a-9c11-2d6f8a5b0e19
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | string (date-time) | DERIVED server clock | The anchor every derived figure was computed at |
| `states[]` | array | DERIVED | Exactly three rows, one per active approval state, in the fixed order Pending, Approved, Rejected |
| `states[].state` | string | DERIVED state mapping (see Tables) [DOC - Step 1 research] | `Pending`, `Approved` or `Rejected` |
| `states[].count` | integer | DERIVED count per state over the caller's visible orders [BUILD] | The compact card figure; the Pending row is also the headline figure |
| `pendingOutstandingTotal` | number | DERIVED SUM(amount) over visible Pending requests [BUILD] | The "$X outstanding" caption figure |

### Example response

```json
{
  "asOf": "2026-08-19T14:05:00Z",
  "states": [
    { "state": "Pending", "count": 10 },
    { "state": "Approved", "count": 6 },
    { "state": "Rejected", "count": 2 }
  ],
  "pendingOutstandingTotal": 7577.50
}
```

Reconciliation: the three state counts sum to the visible active total, 10 + 6 + 2 = 18, which is the same 18 API 2 returns as `requestCount` under the same filters and anchor. `pendingOutstandingTotal` 7577.50 equals the sum of the ten Pending amounts and matches API 3's `totalAmount` for `state=Pending`.

### State contracts

| State | Response |
|---|---|
| Empty (no rows match) | 200 with all three counts 0 and `pendingOutstandingTotal` 0. The client renders the caught-up empty state |
| Partial (data exists for only part of the requested span) | Not applicable: there is no requested span; figures are point-in-time at `asOf` |
| Not-yet-existing entity (predates the requested window) | Not applicable: no entity id and no window |
| Permission denied | 403 when the caller lacks the module read right (right name [TO CONFIRM - Feargal Phelan]); what the tile renders is an open product decision (Still needs sign-off item 12) |
| Upstream unavailable | 503; the client shows the error state, never a zero that reads as "nothing pending" |

---

## API 2: approval board

### Endpoint

```
GET /api/dashboard/purchasing-management/board
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `state` | string, query | No | `Pending`, `Approved`, `Rejected` | omitted = all three | One column instead of three. `Closed` / `Voided` are rejected here: the board is the live approval flow only |
| `approvalPathId` | string (guid), query | No | A path the caller is authorised on | omitted = all paths | Narrows cards and every aggregate |
| `cardsPerState` | integer, query | No | 1 to 100 | 25 | TOP-N cap per column, oldest first. The mid tier requests 2; the large tier the default |

Context headers: `X-Company-ID`, `X-UserTenant-ID`.

### Example requests

```
GET /api/dashboard/purchasing-management/board?cardsPerState=2
GET /api/dashboard/purchasing-management/board?state=Pending&approvalPathId=7f3a9c2e-1b44-4e0a-9c11-2d6f8a5b0e19&cardsPerState=25
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | string (date-time) | DERIVED server clock | Shared anchor; the client derives age labels against it |
| `requestCount` | integer | DERIVED count over the full filtered active set [BUILD] | The header caption's "# requests" figure |
| `totalAmount` | number | DERIVED SUM(amount) over the same set [BUILD] | The header caption's total |
| `columns[]` | array | DERIVED | One entry per requested state, fixed order Pending, Approved, Rejected |
| `columns[].state` | string | DERIVED state mapping [DOC - Step 1 research] | The column's approval state |
| `columns[].totalCount` | integer | DERIVED count over the full filtered state [BUILD] | Column chip figure; also funds "+N more" |
| `columns[].cards[]` | array | DERIVED TOP-N per state, oldest first [BUILD] | Oldest-first TOP-N per column, at most `cardsPerState` entries |
| `columns[].cards[].orderId` | string (guid) | STORED `PO_Order` key [DOC - Step 1 research] | Drill navigation key and write target |
| `columns[].cards[].poNumber` | string | STORED `PO_Order` requisition/order number [DOC - Step 1 research] | The card's reference |
| `columns[].cards[].vendor` | string | STORED `PO_Order` vendor [DOC - Step 1 research] | |
| `columns[].cards[].amount` | number | STORED `PO_Order` total/outstanding amount [DOC - Step 1 research] | |
| `columns[].cards[].issuedDate` | string (date) | STORED `PO_Order` date issued [DOC - Step 1 research] | Feeds the client-side age label |
| `columns[].cards[].isOverdue` | boolean | UNVERIFIED (Feargal Phelan): expected-by date before `asOf` on a Pending request [TO CONFIRM; Step 4 row 3] | Overdue read; always paired with a text label |
| `columns[].cards[].onHold` | boolean | NEW dashboard read; hold is real on approval rows [LIVE - Approvals tab, 2026-08-19; Step 4 row 12] | A held request refuses transitions until the hold is removed |
| `columns[].cards[].holdReason` | string or null | NEW, same source [Step 4 row 12] | The most recent hold reason; null when not held |
| `columns[].cards[].paymentStatus` | string or null | NEW: no dashboard payment read exists today [TO CONFIRM - Feargal Phelan; Step 4 row 11] | `unpaid` or `paid` on Approved requests, null otherwise. Paid means check-issued |

### Example response

`GET .../board?cardsPerState=2` over the build's dataset:

```json
{
  "asOf": "2026-08-19T14:05:00Z",
  "requestCount": 18,
  "totalAmount": 13953.75,
  "columns": [
    {
      "state": "Pending",
      "totalCount": 10,
      "cards": [
        { "orderId": "a1e07c44-5b7f-4f2e-9d31-6c0a8e2b91d0", "poNumber": "PO-2885", "vendor": "Facilities Plus", "amount": 1975.00, "issuedDate": "2026-06-05", "isOverdue": true, "onHold": false, "holdReason": null, "paymentStatus": null },
        { "orderId": "b2f18d55-6c80-4a3f-8e42-7d1b9f3ca2e1", "poNumber": "PO-2888", "vendor": "IT Direct", "amount": 2350.00, "issuedDate": "2026-06-18", "isOverdue": true, "onHold": false, "holdReason": null, "paymentStatus": null }
      ]
    },
    {
      "state": "Approved",
      "totalCount": 6,
      "cards": [
        { "orderId": "c3a29e66-7d91-4b40-9f53-8e2c0a4db3f2", "poNumber": "PO-2610", "vendor": "A-1 Advertising", "amount": 140.00, "issuedDate": "2025-04-04", "isOverdue": false, "onHold": false, "holdReason": null, "paymentStatus": "paid" },
        { "orderId": "d4b30f77-8ea2-4c51-a064-9f3d1b5ec403", "poNumber": "PO-2655", "vendor": "Acme Paper Supply", "amount": 76.25, "issuedDate": "2025-09-15", "isOverdue": false, "onHold": false, "holdReason": null, "paymentStatus": "paid" }
      ]
    },
    {
      "state": "Rejected",
      "totalCount": 2,
      "cards": [
        { "orderId": "e5c41a88-9fb3-4d62-b175-0a4e2c6fd514", "poNumber": "PO-2902", "vendor": "Catering Co.", "amount": 520.00, "issuedDate": "2026-08-06", "isOverdue": false, "onHold": false, "holdReason": null, "paymentStatus": null },
        { "orderId": "f6d52b99-0ac4-4e73-c286-1b5f3d7ae625", "poNumber": "PO-2906", "vendor": "IT Direct", "amount": 3150.00, "issuedDate": "2026-08-15", "isOverdue": false, "onHold": false, "holdReason": null, "paymentStatus": null }
      ]
    }
  ]
}
```

Reconciliation: the column `totalCount` figures sum to the header figure, 10 + 6 + 2 = 18, which is `requestCount` and matches API 1's three counts under the same anchor. `totalAmount` sums the three full state totals, 7577.50 + 2706.25 + 3670.00 = 13953.75. The cards shipped (2 + 2 + 2 = 6) are a TOP-N subset; aggregates never derive from them.

### State contracts

| State | Response |
|---|---|
| Empty (no rows match) | 200, `requestCount` 0, `totalAmount` 0, each requested column present with `totalCount` 0 and empty `cards[]`. A column with zero requests stays present so the client can render its quiet "None waiting" line |
| Partial (data exists for only part of the requested span) | Not applicable: no span; the board is point-in-time at `asOf` |
| Not-yet-existing entity (predates the requested window) | Not applicable: no entity id and no window |
| Permission denied | 403 without the module read right (right name [TO CONFIRM - Feargal Phelan]) |
| Upstream unavailable | 503; the client keeps the last rendered board with its stale `asOf` visible, or shows the error state, never an empty board that reads as caught-up |

---

## API 3: request table

### Endpoint

```
GET /api/dashboard/purchasing-management/requests
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `state` | string, query | No | `Pending`, `Approved`, `Rejected`, `Closed`, `Voided` | omitted = all five | The table's All includes the archive, by design |
| `approvalPathId` | string (guid), query | No | A path the caller is authorised on | omitted = all paths | Narrows rows and both full-set aggregates |
| `department` | string, query | No | A department value present on purchasing records [TO CONFIRM - Feargal Phelan, Step 4 row 1] | omitted = all, including blank | Blank departments are excluded by any specific value |
| `fiscalYear` | string, query | No | A fiscal year, e.g. `FY 2026` [TO CONFIRM - Feargal Phelan, Step 4 row 2] | omitted = all years | Table-only historical lookup window |
| `overdueOnly` | boolean, query | No | `true`, `false` | `false` | `true` keeps only overdue rows per the single overdue rule in Tables [TO CONFIRM - Feargal Phelan, Step 4 row 3] |
| `page` | integer, query | No | >= 1 | 1 | 1-based |
| `pageSize` | integer, query | No | 1 to 100 | 10 | Maximum 100 |
| `sortBy` | string, query | No | `issuedDate`, `poNumber`, `vendor`, `amount`, `department`, `state` | `issuedDate` | Whitelist; anything else is a 400 |
| `sortDir` | string, query | No | `asc`, `desc` | `asc` | Default order is oldest first, the design's aging read |

Context headers: `X-Company-ID`, `X-UserTenant-ID`.

### Example requests

```
GET /api/dashboard/purchasing-management/requests?page=1&pageSize=10
GET /api/dashboard/purchasing-management/requests?state=Pending&department=Facilities&overdueOnly=true&page=1&pageSize=10&sortBy=issuedDate&sortDir=asc
```

No value in the whitelist needs URL-encoding; a real department value containing spaces (for example `Education Ministry` as a path name does) must be URL-encoded by the client.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | string (date-time) | DERIVED server clock | Shared anchor |
| `page` | integer | DERIVED echo | |
| `pageSize` | integer | DERIVED echo | |
| `totalCount` | integer | DERIVED count over the full filtered set [BUILD] | Totals-row count; never the page's row count |
| `totalAmount` | number | DERIVED SUM(amount) over the full filtered set [BUILD] | Totals-row amount |
| `sortBy` | string | DERIVED echo | |
| `sortDir` | string | DERIVED echo | |
| `rows[]` | array | DERIVED one page of the sorted, filtered set [BUILD] | One page, at most `pageSize` entries |
| `rows[].orderId` | string (guid) | STORED `PO_Order` key [DOC - Step 1 research] | Drill navigation key |
| `rows[].poNumber` | string | STORED `PO_Order` requisition/order number [DOC - Step 1 research] | |
| `rows[].vendor` | string | STORED `PO_Order` vendor [DOC - Step 1 research] | |
| `rows[].amount` | number | STORED `PO_Order` total/outstanding amount [DOC - Step 1 research] | |
| `rows[].department` | string or null | UNVERIFIED (Feargal Phelan): no known source field [TO CONFIRM; Step 4 row 1] | Drops from the contract, with its filter and column, if the field is not real |
| `rows[].fiscalYear` | string or null | UNVERIFIED (Feargal Phelan): no known source field [TO CONFIRM; Step 4 row 2] | Same conditional |
| `rows[].state` | string | DERIVED state mapping [DOC - Step 1 research] | One of the five states; the Status column's pill text |
| `rows[].onHold` | boolean | NEW dashboard read [Step 4 row 12] | |
| `rows[].holdReason` | string or null | NEW [Step 4 row 12] | |
| `rows[].paymentStatus` | string or null | NEW [TO CONFIRM - Feargal Phelan; Step 4 row 11] | `unpaid` / `paid` on Approved and Closed requests, null otherwise |
| `rows[].issuedDate` | string (date) | STORED `PO_Order` date issued [DOC - Step 1 research] | The Issued column; feeds the age read |
| `rows[].isOverdue` | boolean | UNVERIFIED (Feargal Phelan) [TO CONFIRM; Step 4 row 3] | Red-flagged row read, always paired with a text flag |

### Example response

`GET .../requests?state=Pending&page=1&pageSize=2`:

```json
{
  "asOf": "2026-08-19T14:05:00Z",
  "page": 1,
  "pageSize": 2,
  "totalCount": 10,
  "totalAmount": 7577.50,
  "sortBy": "issuedDate",
  "sortDir": "asc",
  "rows": [
    { "orderId": "a1e07c44-5b7f-4f2e-9d31-6c0a8e2b91d0", "poNumber": "PO-2885", "vendor": "Facilities Plus", "amount": 1975.00, "department": "Facilities", "fiscalYear": "FY 2026", "state": "Pending", "onHold": false, "holdReason": null, "paymentStatus": null, "issuedDate": "2026-06-05", "isOverdue": true },
    { "orderId": "b2f18d55-6c80-4a3f-8e42-7d1b9f3ca2e1", "poNumber": "PO-2888", "vendor": "IT Direct", "amount": 2350.00, "department": "IT", "fiscalYear": "FY 2026", "state": "Pending", "onHold": false, "holdReason": null, "paymentStatus": null, "issuedDate": "2026-06-18", "isOverdue": true }
  ]
}
```

Reconciliation: `totalCount` 10 and `totalAmount` 7577.50 span the full Pending set, not the two rows shipped, and match API 1's Pending count and `pendingOutstandingTotal` under the same anchor. Across the whole dataset the per-state amounts sum to the unfiltered table total: 7577.50 + 2706.25 + 3670.00 = 13953.75, which is API 2's `totalAmount`.

### State contracts

| State | Response |
|---|---|
| Empty (no rows match) | 200, empty `rows[]`, `totalCount` 0, `totalAmount` 0. The client renders the in-table empty row plus a zero totals row |
| Partial (data exists for only part of the requested span) | Not applicable as a span: `fiscalYear` filtering either matches rows or does not; a year with no rows is the empty case above |
| Not-yet-existing entity (predates the requested window) | Not applicable: no entity id addresses this read |
| Permission denied | 403 without the module read right (right name [TO CONFIRM - Feargal Phelan]) |
| Upstream unavailable | 503; error state, never an empty table that reads as no requests |

---

## API 4: approval-path lookup

### Endpoint

```
GET /api/dashboard/purchasing-management/approval-paths
```

This endpoint exists today with a legacy status integer (`?status={int}`) [DOC - Widget_Comparison_Classic.html]; this contract reuses it with the `state` string of the new model. Results are scoped to paths the caller is authorised on, exactly as today.

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `state` | string, query | No | The five states, per the view's value list | omitted = all states the caller's view serves | The option list is the distinct paths among orders matching this state, so it cascades from the PO Status filter [DOC - Step 1 research] |

Context headers: `X-Company-ID`, `X-UserTenant-ID`.

### Example requests

```
GET /api/dashboard/purchasing-management/approval-paths
GET /api/dashboard/purchasing-management/approval-paths?state=Pending
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `paths[]` | array | DERIVED distinct paths on the caller's visible orders [DOC - Step 1 research] | Distinct paths on the caller's visible orders in the requested state |
| `paths[].approvalPathId` | string (guid) | STORED `PO_ApprovalPath` key (`ApprovalId` in the existing DTO) [DOC - Widget_Comparison_Classic.html] | The `approvalPathId` filter value |
| `paths[].name` | string | STORED `PO_ApprovalPath` name [DOC - Step 1 research] | Customer-defined display name |

### Example response

```json
{
  "paths": [
    { "approvalPathId": "7f3a9c2e-1b44-4e0a-9c11-2d6f8a5b0e19", "name": "Administration" },
    { "approvalPathId": "8a4b0d3f-2c55-4f1b-8d22-3e7a9b6c1f20", "name": "Education Ministry" },
    { "approvalPathId": "9b5c1e40-3d66-4a2c-9e33-4f8b0c7d2a31", "name": "Everyone" },
    { "approvalPathId": "0c6d2f51-4e77-4b3d-af44-5a9c1d8e3b42", "name": "QA Path" }
  ]
}
```

Reconciliation: the four paths are the distinct `path` values across the dataset's 18 orders; a filter over any one of them plus the other three partitions the set, for example Administration's 5 orders plus the other paths' 13 account for every order, 5 + 13 = 18.

### State contracts

| State | Response |
|---|---|
| Empty (no rows match) | 200 with empty `paths[]`. The client renders the filter disabled, exactly as it does when only one path exists |
| Partial (data exists for only part of the requested span) | Not applicable: no span |
| Not-yet-existing entity (predates the requested window) | Not applicable |
| Permission denied | 403 without the module read right |
| Upstream unavailable | 503; the client keeps the previous option list rather than blanking the filter |

---

## API 5: state transition (write)

### Endpoint

```
POST /api/dashboard/purchasing-management/requests/{orderId}/transition
```

No approve/reject/close/void write exists for the dashboard in either codebase today; this is the contract's central NEW backend work [DOC - Step 6 dossier open question "Can approve/reject be done via API?"; Step 4 rows 10 and 13]. On the record screen today, Closed and Voided are manual status edits [LIVE - beta1, 2026-08-19].

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `orderId` | string (guid), path | Yes | A visible `PO_Order` key | none | The request being actioned |
| `targetState` | string, body | Yes | `Pending`, `Approved`, `Rejected`, `Closed`, `Voided` | none | The desired state. Eligibility guards below |
| `reason` | string, body | No (required when `targetState` is `Rejected` or `Voided`) | Up to 2000 characters | empty | The reason note recorded on the request, mirroring the Approvals tab's Reason [LIVE - screenshot, 2026-08-19] |
| `fromState` | string, body | Yes | The state the client last read | none | Concurrency guard: the write is refused if the request has moved since the client read it |

Context headers: `X-Company-ID`, `X-UserTenant-ID`.

Server-enforced guards, in the order checked; each mirrors the build's move logic [BUILD]:

1. A request the caller may not action is refused (403). The exact authority rule - path membership, approver sequence position, or an admin override - is [TO CONFIRM - Feargal Phelan]; see Still needs sign-off item 11.
2. A held request refuses every transition until the hold is removed (409 `on-hold`).
3. `Closed` and `Voided` are terminal: a request already in either state refuses every transition (422 `terminal-state`).
4. `Closed` requires the request to be Approved and paid (422 `close-requires-paid`).
5. `Voided` requires the request not to be paid (422 `void-requires-unpaid`); reversing an issued check is an Accounts Payable flow, not a dashboard action.
6. `targetState` equal to the current state returns 200 unchanged: a same-state drop is a no-op, not an error.

### Example requests

```http
POST /api/dashboard/purchasing-management/requests/b2f18d55-6c80-4a3f-8e42-7d1b9f3ca2e1/transition
{"targetState": "Approved", "reason": "Budget confirmed with Finance", "fromState": "Pending"}

POST /api/dashboard/purchasing-management/requests/c3a29e66-7d91-4b40-9f53-8e2c0a4db3f2/transition
{"targetState": "Closed", "reason": "Order fulfilled and paid", "fromState": "Approved"}
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | string (date-time) | DERIVED server clock after the write | Fresh anchor the client adopts for its follow-up board read |
| `orderId` | string (guid) | STORED `PO_Order` key | The request written |
| `poNumber` | string | STORED `PO_Order` requisition/order number | Lets the client confirm the card it moved |
| `state` | string | DERIVED state mapping after the write | The state after the transition |
| `onHold` | boolean | NEW read [Step 4 row 12] | Unchanged by this write |
| `holdReason` | string or null | NEW [Step 4 row 12] | Unchanged by this write |
| `paymentStatus` | string or null | NEW [Step 4 row 11] | Unchanged by this write |

### Example response

```json
{
  "asOf": "2026-08-19T14:06:12Z",
  "orderId": "b2f18d55-6c80-4a3f-8e42-7d1b9f3ca2e1",
  "poNumber": "PO-2888",
  "state": "Approved",
  "onHold": false,
  "holdReason": null,
  "paymentStatus": "unpaid"
}
```

Reconciliation: one request moved from Pending to Approved, so the follow-up board read shows Pending 9 and Approved 7, and the active total is unchanged, 9 + 7 + 2 = 18, the same `requestCount` as before the write. A transition changes a state, never a row count; a `Closed` or `Voided` result leaves the active board (its column counts drop by one) while the table's archive gains it.

### State contracts

| State | Response |
|---|---|
| Empty (no rows match) | Not applicable: a write names exactly one request; a missing one is the unknown-id case in Edge cases |
| Partial (data exists for only part of the requested span) | Not applicable: no span |
| Not-yet-existing entity (predates the requested window) | 404 `unknown-order` when `orderId` does not exist in the tenant or is not visible to the caller. Existence is not disclosed to unauthorised callers |
| Permission denied | 403 when the caller lacks the write authority for this request (rule [TO CONFIRM - Feargal Phelan]). Distinct from the module-read 403 so the client can suppress action affordances, not the whole widget |
| Upstream unavailable | 503; the client must treat the outcome as unknown, re-read API 2 and re-render before offering the action again |

---

## API 6: hold toggle (write)

### Endpoint

```
POST /api/dashboard/purchasing-management/requests/{orderId}/hold
```

Hold is real in the approval model (a Hold checkbox plus Reason per approval row [LIVE - Approvals tab screenshot, 2026-08-19]) but is not writable from the dashboard today; both directions of this write are NEW [Step 4 row 12]. Whether the payment side has its own separate hold is not visible in any code trace and is [TO CONFIRM - Feargal Phelan].

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `orderId` | string (guid), path | Yes | A visible `PO_Order` key | none | The request being held or released |
| `hold` | boolean, body | Yes | `true`, `false` | none | The desired hold state, so a repeated call is idempotent |
| `reason` | string, body | Yes | Up to 2000 characters | none | Recorded on the request in both directions [BUILD] |

Context headers: `X-Company-ID`, `X-UserTenant-ID`.

Server-enforced guards [BUILD]: `hold: true` is accepted only while the request is in progress - Pending, or Approved and unpaid - never on paid, Rejected, Closed or Voided requests (422 `hold-not-available`). `hold: false` on a request that is not held returns 200 unchanged.

### Example requests

```http
POST /api/dashboard/purchasing-management/requests/a1e07c44-5b7f-4f2e-9d31-6c0a8e2b91d0/hold
{"hold": true, "reason": "Waiting on budget confirmation"}

POST /api/dashboard/purchasing-management/requests/a1e07c44-5b7f-4f2e-9d31-6c0a8e2b91d0/hold
{"hold": false, "reason": "Budget confirmed"}
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | string (date-time) | DERIVED server clock after the write | Fresh anchor |
| `orderId` | string (guid) | STORED `PO_Order` key | |
| `poNumber` | string | STORED `PO_Order` number | |
| `state` | string | DERIVED state mapping | Unchanged by this write |
| `onHold` | boolean | NEW [Step 4 row 12] | The hold state after the write |
| `holdReason` | string or null | NEW [Step 4 row 12] | The reason just recorded, or null after a release |
| `paymentStatus` | string or null | NEW [Step 4 row 11] | Unchanged by this write |

### Example response

```json
{
  "asOf": "2026-08-19T14:07:40Z",
  "orderId": "a1e07c44-5b7f-4f2e-9d31-6c0a8e2b91d0",
  "poNumber": "PO-2885",
  "state": "Pending",
  "onHold": true,
  "holdReason": "Waiting on budget confirmation",
  "paymentStatus": null
}
```

Reconciliation: a hold changes no state and no count; the board's column figures after this write are the same 10 + 6 + 2 = 18 as before it. The held request stays in its column, locked, until a release.

### State contracts

| State | Response |
|---|---|
| Empty (no rows match) | Not applicable: a write names exactly one request |
| Partial (data exists for only part of the requested span) | Not applicable |
| Not-yet-existing entity (predates the requested window) | 404 `unknown-order`, as API 5 |
| Permission denied | 403 under the same write-authority rule as API 5 [TO CONFIRM - Feargal Phelan] |
| Upstream unavailable | 503; outcome unknown, re-read before re-offering |

---

## API 7: payment approval entry (write) - DISPUTED, see Still needs sign-off item 1

### Endpoint

```
POST /api/dashboard/purchasing-management/requests/{orderId}/payment-approvals
```

**Read this first:** whether this endpoint should exist at all is an unresolved dispute. One reading holds that the dashboard should preserve the existing payment functionality and redirect users to the established payment screen; the built Final instead performs the payment entry in place. This section specs what the built Final does, because that is the standing build; if the redirect ruling lands, this API is dropped entirely and the unpaid-card selection becomes a navigation to the record screen's Payment Approval tab. Do not build this endpoint before that ruling.

Grounding in the built behaviour: the entry surface mirrors the record screen's Add Invoice Payment Approval (invoice number, tax, freight, other, per-invoice account distribution, Submit for Approval) [LIVE - beta1 Requests/Update click-through, 2026-08-19]. Payment approval is an invoice-level workflow on its own Payment Approval Path, and no dashboard API serves or writes any of it today [Step 4 rows 11-12].

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `orderId` | string (guid), path | Yes | A visible, Approved, unpaid `PO_Order` key | none | The request being paid |
| `invoices[]` | array, body | Yes | At least one entry | none | The invoice payment approvals being entered |
| `invoices[].invoiceNumber` | string, body | Yes | Non-empty | none | The vendor invoice being approved for payment |
| `invoices[].tax` | number, body | No | >= 0 | 0 | Invoice-level tax amount |
| `invoices[].freight` | number, body | No | >= 0 | 0 | Invoice-level freight amount |
| `invoices[].other` | number, body | No | >= 0 | 0 | Invoice-level other charges |
| `invoices[].distribution` | object, body | Yes | One distribution object per invoice entry | none | The account distribution for this invoice |
| `invoices[].distribution.description` | string, body | No | Free text | empty | Distribution line description |
| `invoices[].distribution.project` | string, body | No | Free text | empty | Project reference on the distribution line |
| `invoices[].distribution.amount` | number, body | Yes | > 0 | none | The distribution amount for this invoice |
| `submitForApproval` | boolean, body | Yes | `true` | none | The build's one-step submit. The real paid signal is the check being issued downstream; see the response note |

Context headers: `X-Company-ID`, `X-UserTenant-ID`.

Server-enforced guards [BUILD]: the request must be Approved and unpaid (422 `not-payable`); a held request refuses payment entry until the hold is removed (409 `on-hold`).

### Example requests

```http
POST /api/dashboard/purchasing-management/requests/17e8ab02-3f9c-4d15-b6a7-c85d20e94f36/payment-approvals
{"invoices": [{"invoiceNumber": "INV-2872", "tax": 0, "freight": 0, "other": 0, "distribution": {"description": "Facility supplies", "project": "", "amount": 890.00}}], "submitForApproval": true}

POST /api/dashboard/purchasing-management/requests/28f9bc13-4a0d-4e26-c7b8-d96e31f05a47/payment-approvals
{"invoices": [{"invoiceNumber": "INV-2879", "tax": 0, "freight": 0, "other": 0, "distribution": {"description": "Workstation order", "project": "IT-26", "amount": 1540.00}}], "submitForApproval": true}
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | string (date-time) | DERIVED server clock after the write | Fresh anchor |
| `orderId` | string (guid) | STORED `PO_Order` key | |
| `poNumber` | string | STORED `PO_Order` number | |
| `state` | string | DERIVED state mapping | Unchanged: payment entry never changes the approval state |
| `paymentStatus` | string | NEW [Step 4 row 11] | The state after the write. The built Final treats submit as one step to `paid`; developers must treat `paid` as check-issued, so if the real workflow inserts a submitted-but-unissued stage, this contract's two-value field is insufficient and comes back to sign-off |

### Example response

```json
{
  "asOf": "2026-08-19T14:09:05Z",
  "orderId": "17e8ab02-3f9c-4d15-b6a7-c85d20e94f36",
  "poNumber": "PO-2872",
  "state": "Approved",
  "paymentStatus": "paid"
}
```

Reconciliation: payment entry changes a sub-state, never a state, so every column count is unchanged, 10 + 6 + 2 = 18; within Approved the paid population rises by one and unpaid falls by one, 5 + 1 = 6, the Approved column total.

### State contracts

| State | Response |
|---|---|
| Empty (no rows match) | Not applicable: a write names exactly one request |
| Partial (data exists for only part of the requested span) | Not applicable |
| Not-yet-existing entity (predates the requested window) | 404 `unknown-order`, as API 5 |
| Permission denied | 403; whether payment entry needs a separate right from approval [TO CONFIRM - Feargal Phelan] |
| Upstream unavailable | 503; outcome unknown, re-read before re-offering |

---

## Auth and scoping

- **Company / tenant scoping:** every call carries `X-Company-ID` and `X-UserTenant-ID`, and every query is scoped by them [DOC - Widget_Comparison_Classic.html, modern purchasing-management identity].
- **Read scope within the module:** administrators see all orders; every other user sees only orders on approval paths they are part of [DOC - Step 1 research]. This scope applies inside every read: counts, totals, cards, rows and path options are all computed over the caller's visible set only. Note one deliberate scope change carried from the design: rejected orders, which no current query returns to anyone, are served under the same visibility rule [Step 4 row 9]. Whether non-admins should see rejected orders on paths they belong to is part of that row's backend confirmation.
- **Permission right to read:** the module read right's exact name is [TO CONFIRM - Feargal Phelan]. What a user without it sees - a hidden tile, an empty tile, or an error - is an open product decision (Still needs sign-off item 12).
- **Permission to write:** the three writes require action authority on the specific request, enforced server-side on every call; a user with read but not write gets 403 from the writes while all reads keep working, and the client uses that distinction to suppress action affordances only. The exact authority rule (path membership, the approver's sequence position, admin override) is [TO CONFIRM - Feargal Phelan]; the design requirement that visible actions respect both the approval path and the viewing user's permissions is recorded but not yet built, so this contract makes the server the authority and leaves affordance-level hints to a later revision (Still needs sign-off item 11).

---

## Edge cases

1. **Org has no purchase requests at all:** every read returns its well-formed zero shape; the client renders the caught-up empty state, not an error.
2. **Filters match nothing** (including a valid path with no orders in the selected state): zero response, not an error; the board keeps its requested columns at `totalCount` 0.
3. **Stale path after a status change:** the client resets a path missing from API 4's refreshed list to All before the next read; a stale `approvalPathId` that still exists but matches nothing is case 2.
4. **Unknown or unauthorised `approvalPathId`:** 400 `unknown-approval-path` on reads.
5. **Blank department or fiscal year on a row:** included under All, excluded by any specific value; a blank is never a wildcard.
6. **No expected-by date on a request:** `isOverdue` is false; `overdueOnly=true` excludes it.
7. **Pagination past the last page:** 200, empty `rows[]`, correct `totalCount` and `totalAmount`.
8. **`sortBy` outside the whitelist, or `Closed`/`Voided` sent to the board endpoint:** 400 with the named error; the client never reaches either through its own controls.
9. **Unknown `orderId` on any write:** 404 `unknown-order`; existence is not disclosed to unauthorised callers.
10. **Transition on a request another user moved first:** `fromState` no longer matches, 409 `state-conflict` with the current state in the body so the client can name who-got-there-first behaviour rather than a generic failure; the client re-reads API 2 with the response's `asOf`.
11. **Transition or payment entry on a held request:** 409 `on-hold` with the hold reason in the body.
12. **Close on an unpaid request, or void on a paid one:** 422 with the named guard error; the eligibility rules live on the server, the client's drop-target hints are presentation only.
13. **Any transition on a Closed or Voided request:** 422 `terminal-state`; both states are final, approvals locked, payment history read-only.
14. **Same-state transition or already-released hold:** 200 unchanged, idempotent no-op.
15. **Two filters intersecting to an empty set while aggregates exist elsewhere:** the zero response's `totalCount`/`totalAmount` are 0 for the filtered population; no aggregate from a wider population is ever returned alongside narrower rows.

---

## Not in scope

- **The PO record screen's read and edit surface** (header form, line items, approvals grid, attachments, notes): the drill navigates to the existing Requests/Update screen, which owns all of it. The build's record-parity popup is a mock stand-in for that navigation, not a second contract.
- **The encumbrance chart and its endpoint:** cut from the design; the existing `chart` endpoint stays live for legacy but is not consumed.
- **The status-options endpoint:** the state list is a static client enum; the endpoint is not consumed.
- **Per-user filter persistence:** the legacy widget saves both filter selections per user; the Modern API does not [Step 4 row 8]. The requirement stands but its mechanism (a shared dashboard preference service versus a per-widget pair) is a platform decision outside this contract; until it lands, filters reset per session.
- **Approval-path ordering and the viewer's own position in it** (which approvals are complete, which await the viewer): a recorded design requirement, not in the built Final, and it will add fields to APIs 2 and 3 when designed (Still needs sign-off item 10).
- **Separating purchase-order approvals from invoice/payment approvals in the filters:** same status - recorded requirement, not built (Still needs sign-off item 10).
- **Export / download:** the built Final has none.
- **A keyboard alternative to drag:** a frontend accessibility gap flagged in Step 4; no API impact.
- **The legacy personal-queue reads** ("awaiting my approval next" and its sequence-chain check): not a column, filter or field in this design. The sequence logic itself still matters to the write-authority rule (Still needs sign-off item 8).

---

## Still needs sign-off

1. **Payment flow: redirect versus in-place entry - Disputed, no side picked.** Claim A: the dashboard should preserve existing payment functionality and may redirect users to the established payment screen; evidence: Feargal Phelan's stated requirement, recorded in the Step 4 doc. Claim B: payment entry belongs in the widget's record popup, entering invoice numbers and submitting marks the request paid; evidence: the built Final's owner-directed behaviour, verified against the live Requests/Update screen [LIVE - beta1, 2026-08-19]. Decider: Feargal Phelan with the project owner (held on action item C3). Blocked until then: building API 7 at all. If Claim A wins, API 7 is dropped from this contract and the unpaid-card selection becomes a navigation.
2. **Voided requests' financial treatment - both sides recorded.** The built Final treats void as a simple terminal status write with a reason. The recorded caution is that the design should avoid assuming what underlying financial reversal process occurs. Decider: Feargal Phelan. Blocked: the `Voided` branch of API 5 beyond the status write; nothing in this contract asserts any reversal behaviour.
3. **Rejected orders served to the dashboard** [Step 4 row 9]: no current query returns them. Decider: Feargal Phelan (backend). Blocked: the Rejected column and state.
4. **The transition write's existence** [Step 4 row 10]: no approve/reject write exists in either codebase; the dossier's own open question. Decider: Feargal Phelan (backend). Blocked: API 5.
5. **`paymentStatus` as a dashboard read** [Step 4 row 11]: no source identified; paid must mean check-issued. Decider: Feargal Phelan (backend). Blocked: the payment sub-state on APIs 2 and 3, and API 7's response.
6. **Hold read and write, and whether the payment side has its own hold** [Step 4 row 12]. Decider: Feargal Phelan (backend). Blocked: `onHold`/`holdReason` and API 6.
7. **Archive serving and the status write** [Step 4 row 13]: the widget's queries never select statuses 2 and 3 today. Decider: Feargal Phelan (backend). Blocked: the table's Closed/Voided values and API 5's Close/Void targets.
8. **The sequence-chain approval logic** [Step 4 row 7]: the Modern API only approximately reimplements the legacy "next approver" check; accepted as a known risk for the mock, but the write-authority rule in APIs 5-7 depends on getting it right. Decider: Feargal Phelan (backend). Blocked: the authority rule's definition, not the endpoint shapes.
9. **Department, Year and Overdue as real fields** [Step 4 rows 1-3]: none is confirmed to exist. Decider: Feargal Phelan (backend), with the project owner on what drops. Blocked: `department`, `fiscalYear`, `isOverdue`, their filters and the Department column; each drops cleanly if not real.
10. **The pending board requirements: approval-path ordering with the viewer's position, permission-aware action affordances, and PO-versus-invoice approval separation.** Recorded design requirements, deliberately not built pending items 1 and 2 above. Decider: project owner (Oisin Curran) with Feargal Phelan. Blocked: nothing in this contract; each will extend APIs 2 and 3 when designed.
11. **The write-authority rule** (who may action which request, and how the approver sequence factors in). Decider: Feargal Phelan (backend). Blocked: the 403 semantics of all three writes.
12. **No-rights behaviour** (hidden tile, empty tile, or error) and the module right's exact name. Decider: project owner (Oisin Curran). Blocked: the permission-denied state contracts' rendering, not their status codes.
13. **Volume ceilings** for open purchase orders and approval paths at a large organisation. Decider: Feargal Phelan (backend). Blocked: confirmation of the `cardsPerState` and `pageSize` caps as adequate.
14. **Dossier finding 11.5, stable-columns half - Unreviewed.** The dossier recommends the table keep one steady column layout across statuses. The built table does use one fixed column set, but the finding has no assigned status, so the column commitment stays provisional. Decider: project owner (Oisin Curran) to status the finding. Blocked: final commitment of the table column list. (The aging half of 11.5 is Accepted and built: age labels, oldest-first.)
15. **Dossier finding 11.6 - Unreviewed.** Chart-values-as-text is moot (the chart is cut); naming the action icons and keyboard operability are frontend concerns with no field impact. Decider: project owner (Oisin Curran) to status the finding. Blocked: nothing in this contract; recorded so the dossier reconciles.

Rejected findings requiring a note: the dossier's "keep the encumbrance chart, two jobs both kept" recommendation was not adopted; the queue-only scope stands and the chart endpoint is out of contract. The dossier's inline approve/reject overlay (11.2) is Accepted in substance: actioning is in-widget, in drag form rather than overlay form, and the open-full-record route is kept.
