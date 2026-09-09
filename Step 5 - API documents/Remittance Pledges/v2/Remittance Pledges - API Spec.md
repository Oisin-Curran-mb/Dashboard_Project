# Remittance Pledges - API Spec

**Status: Done - awaiting sign-off (drafting complete, owner review pending)**

## Overview

The widget answers one question: which remittance pledges are not arriving as expected, and by how much. It is the exception side of the pledge pair; goal progress belongs to the Gifts and Pledges widget (W17). The card shows a behind-pace money headline, three pace cards (Behind, On track, Ahead) filtering a flat per-activity table, an alternate pacing-bars read of the same rows, and a drill screen per activity listing the individual donor pledges most behind pace, each of which expands to that donor's own payment schedule with the first skipped payment named. One date-range control scopes everything; its end is the pacing anchor and its start frames the window.

This contract defines four APIs: a bounded per-activity pacing summary fired on render and on every range change (API 1), a paginated per-activity pledge list fired when a drill or the most-behind popup opens (API 2), a per-pledge payment schedule fired when a pledge row expands (API 3), and a server-side export that streams the current pledge view as a file (API 4). Everything the card itself shows runs client-side over API 1's bounded rows; everything under the drill runs server-side because the pledge list paginates.

## Design → API coverage

| Design element | Type | API | Field(s) | Provenance |
|---|---|---|---|---|
| Behind-pace money headline (Glance and header) | KPI | API 1 | client sum of positive per-row `shortfall` | DERIVED client [BUILD] |
| "N of M behind pace" line | KPI sub-line | API 1 | client count of rows with `shortfall` > 0 over rows with `hasPledgeInRange` true | DERIVED client [BUILD] |
| "$X received in this window" note (Glance, caption, sr-text) | KPI note | API 1 | client sum of `windowPaid` | NEW field, summed client-side [BUILD] |
| Pace badge (Behind pace / On track / Paid in full) | state | API 1 | client compare of summed `paid` vs summed `expected` | DERIVED client [BUILD] |
| Receipts window chip ("Receipts from [start] to [end]") | filter echo | API 1 | `rangeStart`, `rangeEnd` (echoed) | DERIVED echo [BUILD] |
| Pace cards Behind / On track / Ahead (count and outstanding money per band) | filter control | API 1 | client banding over `shortfall`, `daysAhead`, `outstanding` | DERIVED client [BUILD] |
| Table column: Activity | table column | API 1 | `activityId`, `activityName`, `sequence` | STORED [CODE] |
| Table column: Pledge | table column | API 1 | `pledged` | STORED aggregate [CODE] |
| Table column: Expected | table column | API 1 | `expected` | DERIVED [BUILD][DOC] |
| Table column: YTD Paid | table column | API 1 | `paid` | STORED conditional aggregate [CODE] |
| Table column: Outstanding | table column | API 1 | `outstanding` | DERIVED [CODE] |
| Table column: % Paid | table column | API 1 | `pctPaid` | DERIVED [CODE] |
| Status chips, bar fill and expected tick (both views) | state | API 1 | client banding over `daysAhead`; tick position from `expected` over `pledged` | DERIVED client [BUILD] |
| Table caption ("Expected and paid are cumulative to [end], measured over each pledge's own term... % of this term elapsed") | caption | API 1 | `rangeEnd` echo, `termDays`, `daysElapsed`, client sum of `windowPaid` | DERIVED [BUILD] |
| "Most behind first" sort control | sort | API 1 | client sort on `daysAhead`, no-pledge rows last | client [BUILD] |
| Receipts-only footer line ("N activities with receipts but no pledge term in this window, $X received") | state | API 1 | rows with `hasPledgeInRange` false; count plus client sum of their `paid` | NEW - blocked, see Still needs sign-off | 
| Total row (spans every activity in scope, including rows a card filter hides) | aggregate | API 1 | client sums of `pledged`, `expected`, `paid`, `outstanding` over all rows | DERIVED client [BUILD] |
| Empty state ("No remittance pledges yet") | state | API 1 | empty `activities[]` | contract (State contracts) |
| Drill summary strip (Total pledge, Expected by now, Paid to date, Outstanding, % Paid, status chip) | drill | API 2 | `summary` block | DERIVED server [BUILD] |
| Drill pledge-term line | drill | API 2 | summary `beginDate`, `endDate` | DERIVED - mixed-term rule open, see Still needs sign-off |
| Drill pace note ("About N days behind schedule, $X behind the expected pace") | drill | API 2 | client from summary `daysAhead`, `expected`, `paid` | DERIVED client [BUILD] |
| Pledge list columns: Name, Begin date, End date, Goal, Paid, Outstanding, pacing status | drill table | API 2 | `pledgeId`, `donorName`, pledge `beginDate`, `endDate`, `goal`, `paid`, `outstanding`; status is client banding over `shortfall`, `daysAhead`, with `expectedByNow` in the sr-text | STORED + DERIVED [CODE][BUILD] |
| Pledge pager ("64 pledges, page 1 of 8") | control | API 2 | `totalCount`, `page`, `pageSize` | DERIVED [BUILD] |
| Most-behind popup list and its note ("Showing the 5 furthest behind of N pledges behind pace") | drill | API 2 | `behindOnly` call; note from `behindPledgeCount` and `totalCount` | DERIVED [BUILD] |
| Payment schedule table (Due date, Amount due, Received, Status) | third drill level | API 3 | `dueDate`, `amountDue`, `amountApplied`, `status` | DERIVED server [BUILD] |
| Schedule header ("pledged $X over [term]", "N of M due payments received", missed flag) | third drill level | API 3 | `donorName`, `goal`, `beginDate`, `endDate`, `paidCount`, `dueCount`, `missedCount`, `missedAmount` | DERIVED server [BUILD] |
| Schedule footer ("First skipped payment: [date]... reconcile to $X received") | third drill level | API 3 | `firstMissedDate`, `paid` | DERIVED server [BUILD] |
| Schedule cadence basis (instalment count and spacing) | third drill level | API 3 | `pledgeId`, `frequency`, `duration` | STORED, semantics UNVERIFIED (dev) - see Still needs sign-off |
| Export to Excel (drill screen and most-behind popup) | action | API 4 | file stream of the current pledge view | NEW |
| Open in Remittance | action | none | client navigation to the Remittance module, no data call | n/a |
| Refresh control | action | API 1 | re-fires the load call with the current range; any open drill re-fires its own calls | n/a |
| View toggle (Table / Pacing bars) | view | none | instant client re-render over `activities[]`, no fetch | client [BUILD] |

## Tables

| Table / repository | Fields and members used |
|---|---|
| `RM_Activity` | `ActivityID` (key), `Name`, `Sequence`, `CompanyID` (scope). Queried via `RMActivityRepository` |
| `RM_Pledge` | `PledgeID`, `ActivityID`, `ChurchID`, `BeginDate` (date NOT NULL), `EndDate` (date NOT NULL), `Frequency` (int NOT NULL), `Duration` (int NOT NULL), `Active` |
| `RM_PledgeDetail` | `Pledge` (money) - the pledged amount |
| `RM_History` | `HistoryID`, `HistoryBatchID`, `ChurchID`, `CheckDate`, `CheckNumber` (nvarchar(15), free text), `Amount` (whole-check total, not used for per-activity sums), `VoidJournalID` |
| `RM_HistoryDetail` | `HistoryDetailID`, `HistoryID`, `ActivityID`, `Amount` (the per-activity portion of a receipt - this is what gets summed) |
| `RM_HistoryBatch` | `Posted`, `Online`, `CompanyID` |
| `RM_Church` | `PersonID` - the join from a pledge's church to its person record |
| `CorePerson` | `DisplayNameLastFirst` - the drill's Name column |
| `RM_PledgePercent` | `ActivityID`, `Percent`, `StartDate` - the org-configured stepped pacing schedule. Read by nothing today; whether it should drive `expected` is open (Still needs sign-off) |

No new tables and no schema changes are needed. The work is new queries and new derived fields over existing tables, plus one query path that does not exist in any form today (the receipts-only union - see Still needs sign-off).

Core formulas, quotable in isolation:

- **Pledge in scope**: `RM_Pledge.BeginDate <= rangeEnd AND RM_Pledge.EndDate >= rangeStart` [BUILD][SME: Edward Eoff, 2026-08-10]. The live code tests a single instant, `BeginDate <= date <= EndDate`, with no `Active` check [CODE: RMActivityRepository.cs:77]; this contract widens it to window overlap so a pledge whose term ended inside the window stays visible.
- **paid** (cumulative): `SUM(RM_HistoryDetail.Amount)` where `RM_HistoryBatch.Posted = 1 AND RM_History.VoidJournalID IS NULL AND RM_History.CheckDate <= rangeEnd` [CODE: RMActivityRepository.cs:83]. **No lower bound. Never apply `rangeStart` to `paid`**: pacing compares a cumulative numerator against a cumulative denominator, and window-bounding the numerator makes every pledge read as catastrophically behind.
- **windowPaid**: the same predicate plus `RM_History.CheckDate >= rangeStart` [BUILD]. Always less than or equal to `paid`.
- **pledged**: `SUM(RM_PledgeDetail.Pledge)` over in-scope pledges, grouped by `ActivityID` [CODE: RMActivityRepository.cs:82].
- **Per-pledge pacing**: `termDays = EndDate - BeginDate`; `daysElapsed = clamp(rangeEnd - BeginDate, 0, termDays)`; `expectedByNow = goal * daysElapsed / termDays` [BUILD][DOC: Dev backend answer in Step 4 W04]. Paces each pledge on its own term, never on the calendar year.
- **Activity expected**: `SUM(expectedByNow)` over the activity's in-scope pledges [BUILD: the drill reconciles cents-exact to the activity row].
- **shortfall**: `MAX(0, expected - paid)`, per row, pre-signed [BUILD].
- **Aggregate shortfall rule**: any total shortfall is `SUM(MAX(0, expected - paid))` per row, never `MAX(0, SUM(expected) - SUM(paid))`. Netting lets a pledge running ahead mask one running behind, which defeats an exception widget [DOC: Step 4 W04].
- **Filters applied to every read**: company scope on every query; receipts count only when posted and non-void.
- **Labelling rule**: the date control is never labelled "fiscal" anything [SME: Edward Eoff, 2026-08-10]. Acceptable: "pledge year to date", "calendar year to date", plain from/to dates.

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Endpoint shape | One control-bound read, `RMActivityRepository.GetWidgetData(dateReceiptsThru)`, returning per-activity aggregate rows (`RMWidgetActivityRecord`) | API 1 re-shaped read over the same tables; APIs 2-4 are new (DERIVED/NEW as marked below) |
| Time selection | Single `Date Receipts Thru` date | `rangeStart`/`rangeEnd` pair; end is the sole pacing anchor, start frames the window (re-shaped read) |
| Expected | `ROUND((Annual / 12) * month, 2)`, a calendar-month step [CODE: RMWidgetActivityRecord.cs:16] | Per-pledge-term sum: `SUM(goal * daysElapsed / termDays)` (DERIVED, formula change) |
| Pledge scope | `BeginDate <= date <= EndDate`, single instant, drops ended-but-unpaid pledges | Window overlap `BeginDate <= rangeEnd AND EndDate >= rangeStart` (query change) |
| Row set | Activities reached only by walking in-scope pledges; an activity with receipts but no pledge shows nothing [SME: Edward Eoff, 2026-08-10, verified live] | Union of pledge-backed and receipt-backed activities (NEW query path - blocked, Still needs sign-off) |
| `windowPaid` | Does not exist | NEW conditional aggregate |
| Per-activity pledge list | Does not exist (grid is per-activity only) | NEW query over existing tables, paginated, server-sorted |
| Donor name on the dashboard | Not surfaced | `CorePerson.DisplayNameLastFirst` via `RM_Pledge.ChurchID` and `RM_Church.PersonID` (NEW read, existing joins) |
| Per-pledge payment schedule | Does not exist | NEW derived schedule with oldest-first allocation (API 3) |
| Export | Does not exist | NEW server-side file endpoint (API 4) |
| Caching | File-backed `RMWidgetRecord`, invalidated on company change | Live per request; company-change isolation must hold |

## API inventory

| API | Purpose | Trigger (when it fires) | Cardinality | R/W | Cache posture | Split trigger |
|---|---|---|---|---|---|---|
| API 1: Activity pacing summary | Everything on the widget card | Render, range change, Refresh | One row per activity in scope (bounded, small) | R | LIVE | Base read; separate from API 2 by cardinality gap (bounded summary vs paginated list) |
| API 2: Activity pledge list | The drill screen and the most-behind popup | Activity click (drill), bars-row click (popup), pager, range change while open | Up to ~800 pledges per activity, paginated | R | LIVE | Trigger gap (fires on click, not render) and cardinality gap |
| API 3: Pledge payment schedule | The third drill level: one donor's instalments | Pledge row expand inside the drill | One pledge, bounded instalment list | R | LIVE | Trigger gap (per-expand) and grain gap (per-entity detail keyed by `pledgeId`) |
| API 4: Pledge list export | File of the current pledge view | Export click in the drill or popup | Full filtered pledge set for one activity | R | Generated per request | Conditional weight (heavy, only sometimes needed) and trigger gap |

Considered and closed: API 2's summary block could have been dropped in favour of reusing the API 1 row, but the drill must reconcile exactly with figures computed over the full pledge set at the moment it opens, so API 2 returns its own full-set summary and the contract states the two must agree for the same range. APIs 2 and 3 stay separate because a schedule per pledge inside the list response would be an N-times-8 payload for an interaction that usually never happens.

## Call sequence

| Interaction | Calls fired | Notes |
|---|---|---|
| Initial widget load | API 1 | Defaults: `rangeEnd` = today, `rangeStart` = 1 January of `rangeEnd`'s year |
| Change receipts window (preset or Custom) | API 1; plus API 2 (and API 3 per open schedule) if a drill is open | The only fetch-triggering filter. The client passes the same `rangeStart`/`rangeEnd` to every call for one screen; that pair is the shared asOf anchor |
| Click a pace card (Behind / On track / Ahead) | none | Client view over API 1 rows already held |
| Sort the activity table / "Most behind first" | none | Client sort over bounded rows |
| Switch view (Table / Pacing bars) | none | Client re-render |
| Open drill (Table view activity click) | API 2 | `page=1`, `pageSize=8`, `behindOnly=false` |
| Open most-behind popup (Pacing bars row click) | API 2 | `behindOnly=true`, `pageSize=5`, `page=1` |
| Page the pledge list | API 2 | Same range and sort, new `page` |
| Expand a pledge row (payment schedule) | API 3 | `rangeEnd` matching the open range |
| Export (drill or popup) | API 4 | Scoped to the activity, range and `behindOnly` state on screen |
| Refresh | API 1; plus API 2 / API 3 re-fired for whatever is open | Same params as the current state |

## Filter architecture

| Filter | Option source | Cardinality | Execution | Aggregate effect | Cascade | "All" wire form | Round trips |
|---|---|---|---|---|---|---|---|
| Receipts window (This year / Last 30 days / Custom From-To) | STATIC presets, resolved to two dates client-side | 3 options; Custom is any date pair | SERVER: `rangeStart`, `rangeEnd` on APIs 1, 2, 4; `rangeEnd` on API 3 | Yes - every figure re-computes | No | Omit both params; server defaults apply (`rangeEnd` = today, `rangeStart` = 1 Jan of `rangeEnd`'s year) | 1 (API 1), plus refetch of any open drill |
| Pace card band (Behind / On track / Ahead / all) | DERIVED from the API 1 response | 4 states | CLIENT - all three conditions hold: the full activity set is in the API 1 response, that set is bounded (see Volume), and no server-computed aggregate is affected because every total the screen shows is client-computed over the full held set (the Total row deliberately spans every activity in scope) | No | No | n/a - never on the wire | 0 |
| `behindOnly` (most-behind popup) | STATIC boolean | 2 | SERVER param on APIs 2 and 4 - the pledge set paginates, so its filters are server-side | Yes - `totalCount` counts the filtered set (`behindPledgeCount` always spans the full in-scope set) | No | `behindOnly=false` or omitted | 1 (API 2) |
| Activity table sort | STATIC column set | 7 sort keys | CLIENT - bounded set fully held, no aggregate effect | No | No | n/a | 0 |

- **Combination semantics**: AND, narrowing. The receipts window scopes which pledges exist; the pace card then filters the paced rows client-side. Receipts-only rows are never filtered by a card; they render as the footer line under every card state.
- **Conflict rule**: `rangeStart > rangeEnd` is rejected with a named validation error (`INVALID_RANGE`), never silently swapped. `behindOnly=true` with `page` past the last page of behind pledges returns an empty page with correct counts, not an error.
- **Empty-result semantics**: a valid range matching no pledges returns a well-formed response with `activities` empty (or containing only receipts-only rows once that path exists), never an error. A pace-card band with no members is a client-side empty view over a healthy response.
- **Cascade invalidation**: none. No filter's option list depends on another filter's value, and there are no lookup endpoints - both filters are static.
- **Blank values**: `BeginDate` and `EndDate` are NOT NULL [CODE: RMPledge.cs:162,242], so no pledge can be term-blank; a pledge with a zero amount is a "no pledge" row, included under every card state's footer treatment only when it also has no in-scope term, and otherwise paced with `pctPaid` null.

## Volume and performance

| Dataset | Typical rows | Worst realistic rows (basis) | Row width | Payload at worst | Verdict | Server cost model | Cache posture |
|---|---|---|---|---|---|---|---|
| API 1 `activities[]` | 6 (build demo dataset) | [TO CONFIRM] (Edward Eoff - activity counts at large conferences; the legacy grid renders the full set unpaginated [CODE: RMPledges.ascx], so the working assumption is a small org-configured list) | 16 fields, ~340 bytes | Small at any plausible count; re-checked when the ceiling is confirmed | BOUNDED | One indexed scan of in-scope pledges grouped by activity, plus the receipts aggregate per activity | LIVE |
| API 2 `pledges[]` | 60-72 per activity (build seed) | 500-800 per activity ([SME: Edward Eoff, 2026-08-10] - reconstructed from a garbled transcript line, [TO CONFIRM] with him before sizing) | 10 fields, ~230 bytes | ~184 KB unpaginated at 800 rows; one 8-row page is ~2 KB | MUST PAGINATE | Per request: compute `expectedByNow` and `shortfall` for ALL of the activity's in-scope pledges (N pledges times one receipts aggregate each), sort, then slice the page. The full-set compute happens even for one page, because the sort key is derived | LIVE |
| API 3 `instalments[]` | 12 (monthly, one-year term) | Bounded by definition: `RM_Pledge.Duration` is the stored instalment count; realistic maximum [TO CONFIRM] (dev - max Duration in production data) | 5 fields, ~90 bytes | A few KB | BOUNDED | One pledge's receipts scan plus an O(Duration) allocation loop | LIVE |
| API 4 export | One activity's filtered pledge set | Same 500-800 basis as API 2 | file | File of up to ~800 rows | MUST AGGREGATE SERVER-SIDE (the file is built where the full set lives) | Same full-set compute as API 2, streamed to a file | Generated per request |

No time series exists in this contract, so there is no N entities times M periods product to state.

### Pagination contract

- **Params**: `page` (1-based, default 1), `pageSize` (default 8, maximum 100).
- **What paginates**: API 2's `pledges[]` only.
- **What does not**: `summary` (pledged, expected, paid, outstanding, pctPaid, daysAhead), `totalCount` and `behindPledgeCount` all compute over the **full filtered set**, never the page. Switching pages changes no total, no card, no KPI and no note.
- **Sort**: deliberately fixed server-side at `shortfall` descending; no `sortBy` / `sortDir` params are exposed. What the user loses: re-ordering the pledge list by name, date or amount. That mirrors the drill's single purpose (most behind first, later pages progressively healthier); if column sorting is ever wanted it becomes a whitelisted `sortBy` here.
- **Deterministic total order**: `shortfall DESC, pledgeId ASC`. The unique `pledgeId` tiebreaker prevents rows duplicating or skipping across pages.
- **`totalCount`** is returned beside every page (it counts the set after `behindOnly`).
- **Past the last page**: empty `pledges[]`, correct `totalCount`, correct `summary`, HTTP 200.

## Where computation lives

| Value | Server or client | Basis | Why |
|---|---|---|---|
| `expectedByNow` per pledge | SERVER | pledge term + rangeEnd | Needs every pledge's dates; drives the server-side sort |
| Activity `expected` | SERVER | sum of per-pledge `expectedByNow` | Spans a set the client does not hold |
| `paid`, `windowPaid`, `pledged`, `outstanding` | SERVER | conditional aggregates | Span receipt rows never transmitted |
| `pctPaid` | SERVER | `paid / pledged` | Returned null when `pledged` is 0 - the division-by-zero rule, applied server-side, one rule for every consumer |
| `daysAhead` | SERVER | `(paid / pledged) * termDays - daysElapsed` | Returned pre-signed; null when `pledged` is 0 |
| `shortfall` per row | SERVER | `MAX(0, expected - paid)` | Pre-signed delta; the client never subtracts |
| Behind-pace headline, "N of M", Total row, window-received note | CLIENT | sums over the full API 1 row set | Pure arithmetic over values already held; the full set is bounded and present |
| Pace-card counts and outstanding-per-band | CLIENT | banding over held rows | Presentation grouping over a bounded set |
| Status bands (Behind is `shortfall > 0`; the day scale is 30 or more days ahead, within 30 days either side on track, 30 to 60 behind, more than 60 behind; paid-in-full and no-pledge special-cased) | CLIENT | `shortfall`, `daysAhead` | Presentation bands are client-side. These thresholds are owner-approved in the locked design [BUILD][DOC: Step 4 W04], not silent defaults. The API returns raw numbers, never a band string |
| Activity table sort orders | CLIENT | held rows | Bounded set |
| Pledge list order | SERVER | `shortfall DESC, pledgeId ASC` | The set paginates |
| Pledge pager arithmetic | CLIENT | `totalCount`, `pageSize` | Pure arithmetic |
| Instalment schedule, statuses, `firstMissedDate`, `missedCount`, `missedAmount`, `paidCount`, `dueCount` | SERVER | oldest-first allocation | Needs per-pledge receipts the client never holds; API 1 and API 3 must derive from one shared pacing definition or the drill contradicts its parent row |
| Pace note and chip wording | CLIENT | returned numbers | Copy is presentation |
| `pace` fraction shown in captions | CLIENT | `daysElapsed / termDays` | Pure arithmetic; 0 when `termDays` is 0 (zero-length terms guard) |

## API 1: Activity pacing summary

### Endpoint

```
GET /api/dashboard/remittance-pledges/data
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `rangeStart` | date (ISO 8601) | no | any date <= `rangeEnd` | 1 January of `rangeEnd`'s calendar year | The window opener. Affects exactly two things: `windowPaid`, and which pledges are in scope via the overlap rule. Never touches pacing |
| `rangeEnd` | date (ISO 8601) | no | any date | today (server date) | The pacing anchor. `paid` counts check dates on or before it; `expected` paces to it |

The company/tenant context travels in the standard request context header, not as a query param; every query is scoped by it (see Auth and scoping).

### Example requests

```
GET /api/dashboard/remittance-pledges/data
GET /api/dashboard/remittance-pledges/data?rangeStart=2026-01-01&rangeEnd=2026-07-31
```

Dates are plain ISO and need no URL encoding.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `rangeStart` | date | DERIVED (echo of the resolved param) [BUILD] | The window start actually applied |
| `rangeEnd` | date | DERIVED (echo) [BUILD] | The pacing anchor actually applied |
| `activities[]` | array | DERIVED container | One row per activity in scope |
| `activities[].activityId` | guid | STORED `RM_Activity.ActivityID` [CODE] | Stable key (names are org-editable) |
| `activities[].activityName` | string | STORED `RM_Activity.Name` [CODE] | Display label |
| `activities[].sequence` | int | STORED `RM_Activity.Sequence` [CODE] | Default row order |
| `activities[].hasPledgeInRange` | bool | DERIVED (overlap rule) [BUILD] | False marks a receipts-only row; all pacing fields are then null/zero. Serving such a row is blocked on the open query-path item (Still needs sign-off) |
| `activities[].pledged` | money | STORED aggregate `SUM(RM_PledgeDetail.Pledge)` [CODE] | Total pledged, in-scope pledges only |
| `activities[].expected` | money | DERIVED `SUM(expectedByNow)` over in-scope pledges [BUILD] | Cumulative to `rangeEnd` |
| `activities[].paid` | money | STORED conditional aggregate [CODE] | Cumulative to `rangeEnd`, no lower bound |
| `activities[].windowPaid` | money | NEW (same predicate plus `CheckDate >= rangeStart`) [BUILD] | Receipts inside the window; always <= `paid` |
| `activities[].outstanding` | money | DERIVED `MAX(0, pledged - paid)` [CODE] | Remaining over the term |
| `activities[].pctPaid` | number or null | DERIVED `paid / pledged`, null when `pledged` = 0 [CODE] | Fraction, not percent |
| `activities[].shortfall` | money | DERIVED `MAX(0, expected - paid)` [BUILD] | Pre-signed; the exception rule (Behind is `shortfall` > 0) |
| `activities[].daysAhead` | number or null | DERIVED `(paid / pledged) * termDays - daysElapsed`, null when `pledged` = 0 [BUILD] | Raw day figure; the client bands it |
| `activities[].beginDate` | date or null | DERIVED `MIN(BeginDate)` over in-scope pledges; null on a receipts-only row | Term line start. Mixed-term display rule is open (Still needs sign-off) |
| `activities[].endDate` | date or null | DERIVED `MAX(EndDate)` over in-scope pledges; null on a receipts-only row | Term line end |
| `activities[].termDays` | int | DERIVED `endDate - beginDate` in days; 0 on a receipts-only row | Caption arithmetic |
| `activities[].daysElapsed` | int | DERIVED `clamp(rangeEnd - beginDate, 0, termDays)` | Caption arithmetic |

### Example response

```json
{
  "rangeStart": "2026-01-01",
  "rangeEnd": "2026-07-31",
  "activities": [
    { "activityId": "a1e0c7d2-1111-4a01-9f01-0b1c2d3e4f01", "activityName": "General Fund Apportionment", "sequence": 1,
      "hasPledgeInRange": true, "pledged": 24000, "expected": 13912, "paid": 7200, "windowPaid": 7200,
      "outstanding": 16800, "pctPaid": 0.3, "shortfall": 6712, "daysAhead": -101.8,
      "beginDate": "2026-01-01", "endDate": "2026-12-31", "termDays": 364, "daysElapsed": 211 },
    { "activityId": "a1e0c7d2-4444-4a04-9f04-0b1c2d3e4f04", "activityName": "Outreach and Benevolence", "sequence": 4,
      "hasPledgeInRange": true, "pledged": 9000, "expected": 5217, "paid": 6300, "windowPaid": 6300,
      "outstanding": 2700, "pctPaid": 0.7, "shortfall": 0, "daysAhead": 43.8,
      "beginDate": "2026-01-01", "endDate": "2026-12-31", "termDays": 364, "daysElapsed": 211 },
    { "activityId": "a1e0c7d2-5555-4a05-9f05-0b1c2d3e4f05", "activityName": "Capital Campaign Pledge", "sequence": 5,
      "hasPledgeInRange": true, "pledged": 30000, "expected": 10822, "paid": 11000, "windowPaid": 4000,
      "outstanding": 19000, "pctPaid": 0.367, "shortfall": 0, "daysAhead": 6.5,
      "beginDate": "2025-07-01", "endDate": "2028-06-30", "termDays": 1095, "daysElapsed": 395 },
    { "activityId": "a1e0c7d2-6666-4a06-9f06-0b1c2d3e4f06", "activityName": "Youth Ministry Fund", "sequence": 6,
      "hasPledgeInRange": false, "pledged": 0, "expected": 0, "paid": 500, "windowPaid": 500,
      "outstanding": 0, "pctPaid": null, "shortfall": 0, "daysAhead": null,
      "beginDate": null, "endDate": null, "termDays": 0, "daysElapsed": 0 }
  ]
}
```

Reconciliation: row 1 reconciles as paid 7200 + shortfall 6712 = 13912 expected. The behind headline reconciles as the per-row positive shortfalls 6712 + 0 + 0 = 6712 (1 of 3 paced activities behind). Client Total row: pledged 24000 + 9000 + 30000 = 63000; expected 13912 + 5217 + 10822 = 29951; paid 7200 + 6300 + 11000 + 500 = 25000; outstanding 16800 + 2700 + 19000 = 38500; window-received note 7200 + 6300 + 4000 + 500 = 18000. The Youth Ministry row is design intent for the receipts-only mode, which is blocked (Still needs sign-off); until that lands, every returned row has `hasPledgeInRange` true.

### State contracts

| State | Response |
|---|---|
| Empty (org has no in-scope pledges and no receipts) | 200, `activities` = `[]`, range echoed. The client renders the empty state |
| Partial (some activities have pledges, others only receipts) | 200; pledge-backed rows normal; receipts-only rows per the blocked design intent above (absent until that path exists) |
| Not-yet-existing (range entirely before any pledge term) | 200, `activities` = `[]` - the overlap rule matches nothing; not an error |
| Permission denied | 403 with a machine-readable code; body carries no figures. What the widget shell renders is an open product decision (Still needs sign-off) |
| Upstream unavailable | 503 with a retryable error envelope; the client keeps the last good render and marks it stale |

## API 2: Activity pledge list

### Endpoint

```
GET /api/dashboard/remittance-pledges/activity/{activityId}/pledges
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `activityId` | guid (path) | yes | an `RM_Activity.ActivityID` in the company | none (required) | The activity being drilled |
| `rangeStart` | date | no | any date <= `rangeEnd` | 1 January of `rangeEnd`'s year | Same role as API 1; must match the values the open card used |
| `rangeEnd` | date | no | any date | today | Pacing anchor |
| `behindOnly` | bool | no | true / false | false | True returns only pledges with `shortfall` > 0 (the most-behind popup) |
| `page` | int | no | >= 1 | 1 | 1-based page |
| `pageSize` | int | no | 1 to 100 | 8 | Page length; 100 is the hard maximum |

### Example requests

```
GET /api/dashboard/remittance-pledges/activity/a1e0c7d2-1111-4a01-9f01-0b1c2d3e4f01/pledges?rangeStart=2026-01-01&rangeEnd=2026-07-31&page=1&pageSize=8
GET /api/dashboard/remittance-pledges/activity/a1e0c7d2-1111-4a01-9f01-0b1c2d3e4f01/pledges?rangeStart=2026-01-01&rangeEnd=2026-07-31&behindOnly=true&pageSize=5
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `activityId` | guid | STORED `RM_Activity.ActivityID` [CODE] | Echo |
| `activityName` | string | STORED `RM_Activity.Name` [CODE] | Drill title |
| `rangeStart` | date | DERIVED (echo) | Anchor echo |
| `rangeEnd` | date | DERIVED (echo) | Anchor echo |
| `page` | int | DERIVED (echo) | Current page |
| `pageSize` | int | DERIVED (echo) | Page length applied |
| `totalCount` | int | DERIVED count over the filtered set [BUILD] | Rows matching `behindOnly`; powers the pager |
| `behindPledgeCount` | int | DERIVED count of `shortfall` > 0 over the FULL in-scope set [BUILD] | Powers the popup note regardless of `behindOnly` |
| `summary` | object | DERIVED container | Full-set aggregates; never affected by paging |
| `summary.pledged` | money | STORED aggregate [CODE] | Must equal the API 1 row for the same range |
| `summary.expected` | money | DERIVED `SUM(expectedByNow)` [BUILD] | Must equal the API 1 row |
| `summary.paid` | money | STORED conditional aggregate [CODE] | Must equal the API 1 row |
| `summary.outstanding` | money | DERIVED `MAX(0, pledged - paid)` [CODE] | Must equal the API 1 row |
| `summary.pctPaid` | number or null | DERIVED, null when `pledged` = 0 [CODE] | Summary strip |
| `summary.daysAhead` | number or null | DERIVED, null when `pledged` = 0 [BUILD] | Status chip and pace note |
| `summary.beginDate` | date or null | DERIVED `MIN(BeginDate)` in scope | Term line (mixed-term rule open) |
| `summary.endDate` | date or null | DERIVED `MAX(EndDate)` in scope | Term line |
| `pledges[]` | array | DERIVED container | The page, sorted `shortfall DESC, pledgeId ASC` |
| `pledges[].pledgeId` | guid | STORED `RM_Pledge.PledgeID` [CODE] | Key; the expand target for API 3 |
| `pledges[].donorName` | string | STORED `CorePerson.DisplayNameLastFirst` via `RM_Pledge.ChurchID` and `RM_Church.PersonID` [CODE: legacy screen's Name column] | "Last, First" person name |
| `pledges[].beginDate` | date | STORED `RM_Pledge.BeginDate` [CODE] | This pledge's own term |
| `pledges[].endDate` | date | STORED `RM_Pledge.EndDate` [CODE] | This pledge's own term |
| `pledges[].goal` | money | STORED `RM_PledgeDetail.Pledge` for this pledge [CODE] | Pledged amount |
| `pledges[].paid` | money | STORED conditional aggregate of this pledge's linked receipts, `CheckDate <= rangeEnd` [CODE predicate; per-pledge attribution UNVERIFIED (dev) - see Still needs sign-off] | Cumulative |
| `pledges[].outstanding` | money | DERIVED `MAX(0, goal - paid)` | Remaining |
| `pledges[].expectedByNow` | money | DERIVED per-pledge pacing formula [BUILD] | On this pledge's own term |
| `pledges[].shortfall` | money | DERIVED `MAX(0, expectedByNow - paid)` [BUILD] | The sort key |
| `pledges[].daysAhead` | number or null | DERIVED, null when `goal` = 0 [BUILD] | Client bands the status |

### Example response

```json
{
  "activityId": "a1e0c7d2-1111-4a01-9f01-0b1c2d3e4f01",
  "activityName": "General Fund Apportionment",
  "rangeStart": "2026-01-01",
  "rangeEnd": "2026-07-31",
  "page": 1,
  "pageSize": 8,
  "totalCount": 64,
  "behindPledgeCount": 38,
  "summary": { "pledged": 24000, "expected": 13912, "paid": 7200, "outstanding": 16800,
               "pctPaid": 0.3, "daysAhead": -101.8, "beginDate": "2026-01-01", "endDate": "2026-12-31" },
  "pledges": [
    { "pledgeId": "8f3b6c1a-0002-4b02-8c02-1d2e3f4a5b02", "donorName": "Bell, Marcus",
      "beginDate": "2026-01-01", "endDate": "2026-12-31", "goal": 900, "paid": 150,
      "outstanding": 750, "expectedByNow": 522, "shortfall": 372, "daysAhead": -150.3 },
    { "pledgeId": "8f3b6c1a-0001-4b01-8c01-1d2e3f4a5b01", "donorName": "Whitfield, Dana",
      "beginDate": "2026-01-01", "endDate": "2026-12-31", "goal": 683, "paid": 238,
      "outstanding": 445, "expectedByNow": 396, "shortfall": 158, "daysAhead": -84.2 }
  ]
}
```

The example page is trimmed to two rows; a real page carries up to `pageSize`. Reconciliation: the second row reconciles as paid 238 + shortfall 158 = 396 expected by now, and outstanding as paid 238 + outstanding 445 = 683 goal. The `summary` block spans the full 64-pledge set, not the page, and must equal the API 1 row for the same `activityId` and range; the pledge goals, paids and outstandings across ALL pages sum to `summary.pledged`, `summary.paid` and `summary.outstanding` respectively.

### State contracts

| State | Response |
|---|---|
| Empty (activity has no in-scope pledges) | 200, `pledges` = `[]`, `totalCount` = 0, `summary` zeros with `pctPaid` and `daysAhead` null |
| `behindOnly=true` and nothing is behind | 200, `pledges` = `[]`, `totalCount` = 0, `behindPledgeCount` = 0; the popup renders its none-behind message |
| Page past the end | 200, `pledges` = `[]`, correct `totalCount` and `summary` |
| Unknown or other-company `activityId` | 404 with a machine-readable code; never another tenant's data |
| Permission denied / upstream unavailable | As API 1 |

## API 3: Pledge payment schedule

### Endpoint

```
GET /api/dashboard/remittance-pledges/pledge/{pledgeId}/schedule
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `pledgeId` | guid (path) | yes | an `RM_Pledge.PledgeID` in the company | none (required) | The pledge being expanded |
| `rangeEnd` | date | no | any date | today | The as-of date. An instalment due on or before it and still unfunded is missed; after it, upcoming |

### Example requests

```
GET /api/dashboard/remittance-pledges/pledge/8f3b6c1a-0001-4b01-8c01-1d2e3f4a5b01/schedule
GET /api/dashboard/remittance-pledges/pledge/8f3b6c1a-0001-4b01-8c01-1d2e3f4a5b01/schedule?rangeEnd=2026-07-31
```

### The allocation algorithm

```
n            = duration                     (instalment count; fallback below when 0)
amountDue[i] = goal / n                     (the last instalment absorbs the rounding remainder)
dueDate[i]   = beginDate + i * (12 / frequency) months, clamped to endDate

remaining = paid
for i in 0..n-1:
    amountApplied[i] = min(amountDue[i], remaining)
    remaining       -= amountApplied[i]
    status[i] = amountApplied[i] >= amountDue[i]   -> "paid"
              : amountApplied[i] > 0               -> "part"
              : dueDate[i] <= rangeEnd             -> "missed"
              : otherwise                          -> "upcoming"
```

Receipts are applied OLDEST FIRST. That is what makes a gap legible: the earliest unfunded instalment is the skipped payment, and everything after it is unfunded too. Invariant worth asserting in tests: no funded instalment ever appears after an unfunded due one. API 1's `expected` and this schedule must derive from one shared pacing definition, or the drill contradicts the row it opened from (the linear-vs-stepped question in Still needs sign-off decides that definition).

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `pledgeId` | guid | STORED `RM_Pledge.PledgeID` [CODE] | Echo |
| `donorName` | string | STORED `CorePerson.DisplayNameLastFirst` [CODE] | Header |
| `goal` | money | STORED `RM_PledgeDetail.Pledge` [CODE] | Header ("pledged $X over...") |
| `beginDate` | date | STORED `RM_Pledge.BeginDate` [CODE] | Term |
| `endDate` | date | STORED `RM_Pledge.EndDate` [CODE] | Term |
| `frequency` | int | STORED `RM_Pledge.Frequency` [CODE] - column confirmed, semantics UNVERIFIED (dev): payments-per-year is the working reading, undocumented in code | Cadence |
| `duration` | int | STORED `RM_Pledge.Duration` [CODE] - column confirmed, semantics UNVERIFIED (dev) | Instalment count |
| `paid` | money | STORED conditional aggregate of this pledge's receipts, `CheckDate <= rangeEnd` [CODE predicate; per-pledge attribution UNVERIFIED (dev)] | The allocated total |
| `rangeEnd` | date | DERIVED (echo) | As-of anchor |
| `paidCount` | int | DERIVED (instalments with status paid) [BUILD] | "N of M due payments received" |
| `dueCount` | int | DERIVED (instalments not upcoming) [BUILD] | The M |
| `missedCount` | int | DERIVED (instalments with status missed) [BUILD] | Missed flag |
| `missedAmount` | money | DERIVED (missed amounts plus the unfunded portion of any part) [BUILD] | Missed flag |
| `firstMissedDate` | date or null | DERIVED (earliest missed due date) [BUILD] | "First skipped payment" |
| `instalments[]` | array | DERIVED container | One row per scheduled payment |
| `instalments[].dueDate` | date | DERIVED (algorithm above) | Schedule column |
| `instalments[].amountDue` | money | DERIVED `goal / duration`, last absorbs remainder | Schedule column |
| `instalments[].amountApplied` | money | DERIVED oldest-first allocation | "Received" column |
| `instalments[].status` | string | DERIVED: `paid` / `part` / `missed` / `upcoming` | Schedule column |

### Example response

Pledge of 683 over 2026-01-01 to 2026-12-31, monthly, 238 received, as of 2026-07-31:

```json
{
  "pledgeId": "8f3b6c1a-0001-4b01-8c01-1d2e3f4a5b01",
  "donorName": "Whitfield, Dana",
  "goal": 683, "beginDate": "2026-01-01", "endDate": "2026-12-31",
  "frequency": 12, "duration": 12, "paid": 238, "rangeEnd": "2026-07-31",
  "paidCount": 4, "dueCount": 7, "missedCount": 2, "missedAmount": 161, "firstMissedDate": "2026-06-01",
  "instalments": [
    { "dueDate": "2026-01-01", "amountDue": 57, "amountApplied": 57, "status": "paid" },
    { "dueDate": "2026-02-01", "amountDue": 57, "amountApplied": 57, "status": "paid" },
    { "dueDate": "2026-03-01", "amountDue": 57, "amountApplied": 57, "status": "paid" },
    { "dueDate": "2026-04-01", "amountDue": 57, "amountApplied": 57, "status": "paid" },
    { "dueDate": "2026-05-01", "amountDue": 57, "amountApplied": 10, "status": "part" },
    { "dueDate": "2026-06-01", "amountDue": 57, "amountApplied": 0, "status": "missed" },
    { "dueDate": "2026-07-01", "amountDue": 57, "amountApplied": 0, "status": "missed" },
    { "dueDate": "2026-08-01", "amountDue": 57, "amountApplied": 0, "status": "upcoming" },
    { "dueDate": "2026-09-01", "amountDue": 57, "amountApplied": 0, "status": "upcoming" },
    { "dueDate": "2026-10-01", "amountDue": 57, "amountApplied": 0, "status": "upcoming" },
    { "dueDate": "2026-11-01", "amountDue": 57, "amountApplied": 0, "status": "upcoming" },
    { "dueDate": "2026-12-01", "amountDue": 56, "amountApplied": 0, "status": "upcoming" }
  ]
}
```

Reconciliation: applied amounts 57 + 57 + 57 + 57 + 10 = 238, matching `paid`. Missed money 57 + 57 + 47 = 161 (two missed instalments plus the unfunded part of May), matching `missedAmount`. Unfunded across the whole schedule 161 + 284 = 445 (missed-plus-part 161 and upcoming 284), matching this pledge's `outstanding` in API 2. Instalment dues 57 + 57 + 57 + 57 + 57 + 57 + 57 + 57 + 57 + 57 + 57 + 56 = 683, matching `goal`.

### State contracts

| State | Response |
|---|---|
| `duration` or `frequency` missing or zero | 200 with a single instalment for the full `goal` due at `endDate` - the stated fallback, never a division by zero |
| No receipts yet | 200; every due instalment is missed, `paid` = 0, `paidCount` = 0 |
| Over-received (`paid` > `goal`) | 200; every instalment paid, the surplus unallocated; the client shows paid in full |
| Term ended, still unpaid | 200; every instalment is due, unfunded ones all missed - the case this widget exists to surface |
| Unknown or other-company `pledgeId` | 404 with a machine-readable code |
| Permission denied / upstream unavailable | As API 1 |

## API 4: Pledge list export

### Endpoint

```
GET /api/dashboard/remittance-pledges/activity/{activityId}/pledges/export
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `activityId` | guid (path) | yes | an `RM_Activity.ActivityID` in the company | none (required) | The activity whose pledge view is exported |
| `rangeStart` | date | no | any date <= `rangeEnd` | 1 January of `rangeEnd`'s year | Same semantics as API 2 |
| `rangeEnd` | date | no | any date | today | Same semantics as API 2 |
| `behindOnly` | bool | no | true / false | false | Matches the view being exported: false from the drill screen, true from the most-behind popup |

### Example requests

```
GET /api/dashboard/remittance-pledges/activity/a1e0c7d2-1111-4a01-9f01-0b1c2d3e4f01/pledges/export?rangeStart=2026-01-01&rangeEnd=2026-07-31
GET /api/dashboard/remittance-pledges/activity/a1e0c7d2-1111-4a01-9f01-0b1c2d3e4f01/pledges/export?rangeStart=2026-01-01&rangeEnd=2026-07-31&behindOnly=true
```

### Response

A spreadsheet file stream (content-disposition attachment), not JSON, so there is no response schema table or example body for this API. Columns match the on-screen pledge list (Name, Begin date, End date, Goal, Paid, Outstanding, pacing status), computed over the **full filtered set** server-side - the client cannot build this file because it only ever holds one page. The export matches the view: same activity, same range, same `behindOnly` state. Whether the popup's export also truncates to the five rows shown, and the exact file format and generation mechanics, are open (Still needs sign-off).

### State contracts

| State | Response |
|---|---|
| Empty filtered set | A valid file with headers and zero data rows |
| Unknown or other-company `activityId` | 404, no file |
| Permission denied / upstream unavailable | As API 1 |

## Auth and scoping

- **Company / tenant scoping**: every query is scoped by the caller's company context, exactly as the live read is (`CompanyID` on `RM_Activity`, `RM_HistoryBatch` and the repository queries [CODE]). A company switch must never serve another company's figures; the legacy build enforces this by invalidating its `RMWidgetRecord` cache on a company change, and the live-per-request posture here must preserve the same isolation. The exact header/claim carrying the company context follows the platform standard [TO CONFIRM: dev].
- **Permission right**: the legacy widget is gated by the `/Remittance` access URI [CODE: RMPledges.ascx.cs:13, `DataPanelUri(... AccessUri = "/Remittance")`]. The equivalent right name in the modern API is [TO CONFIRM: dev]. All four APIs are read-only; there is no write right.
- **Person data**: APIs 2, 3 and 4 return donor display names (`CorePerson.DisplayNameLastFirst`). Whether the same `/Remittance` read right suffices for that, or a separate person-data right applies, is [TO CONFIRM: product + dev].
- **A user without the right**: sees no data from any of these endpoints (403). Whether the widget is hidden, empty, or shows an entitlement message is an open product decision (Still needs sign-off).

## Edge cases

1. **Zero-pledge activity in scope**: `pledged` = 0, `pctPaid` and `daysAhead` null, `shortfall` = 0; the client renders a neutral no-pledge treatment. Never a division by zero - the null rules sit server-side.
2. **Receipts-only activity** (receipts in the window, no overlapping pledge term): design intent is a row with `hasPledgeInRange` false; not servable today because `paid` is reached by walking each in-scope pledge's linked receipts, so the mode is blocked (Still needs sign-off).
3. **Range matching nothing**: well-formed empty response, not an error.
4. **`rangeStart` after `rangeEnd`**: 400 `INVALID_RANGE`.
5. **Range end before a pledge's term**: `daysElapsed` clamps to 0, `expectedByNow` = 0, the pledge is not behind.
6. **Range end after a pledge's term**: `daysElapsed` clamps to `termDays`, `expectedByNow` = `goal`; if unpaid, the full remainder is shortfall - exactly the ended-but-unpaid case the overlap rule keeps visible.
7. **Pledge ended before `rangeStart` and still owing**: excluded by the overlap rule; whether that is intended is an open SME question (Still needs sign-off).
8. **Voided or unposted receipts**: never counted in `paid` or `windowPaid` (`Posted = 1 AND VoidJournalID IS NULL`).
9. **One check split across activities**: sums use `RM_HistoryDetail.Amount` (the per-activity portion), never `RM_History.Amount` (the whole check).
10. **Pagination past the end**: empty page, correct `totalCount` and `summary`, HTTP 200.
11. **Two calls straddling a posting**: the `rangeStart`/`rangeEnd` pair is the shared anchor for date-bounded figures, so drift between API 1 and API 2 for the same range is possible only from a receipt posted mid-session inside the window. Accepted: the drill is the fresher read, and the next range change or Refresh re-aligns the card. No snapshot token is introduced for this.
12. **Unknown ids**: 404 with a machine-readable code, scoped so an id from another company behaves as unknown.
13. **Mixed pledge terms under one activity**: `expected`, `paid` and `shortfall` are well-defined (per-pledge sums); the activity-level `beginDate`/`endDate`/`termDays`/`daysElapsed`/`daysAhead` presentation over mixed terms needs the open display rule (Still needs sign-off).
14. **Duplicate donor names**: names may repeat across and within activities; `pledgeId` is the identity, never the name.

## Not in scope

- **Goal-progress framing** (percent of goal, campaign progress): belongs to the Gifts and Pledges widget (W17), which owns that contract.
- **A per-activity receipts / payment-history list**: not reachable in the design (a preserved rollback path only), so no receipts-list endpoint is in this contract. If that view returns, its list is `RM_HistoryDetail` joined to `RM_History` and `RM_HistoryBatch` via the `GetAllForInquiry` shape, and it would re-open the receipts-only query question.
- **Month presets, a fiscal-year filter, an activity-type filter**: none exist. The one time control is the range pair, and it is never labelled "fiscal".
- **Server-side banding, grouping or band strings**: the API returns raw numbers (`shortfall`, `daysAhead`); status bands, band colours and card grouping are client-side presentation.
- **Server-side grand totals for the card**: the Total row, headline and counts are client sums over API 1's bounded rows. If a server total is ever added, the per-row summed shortfall rule applies.
- **Writes**: nothing here mutates anything. "Open in Remittance" is client navigation.
- **Personal data beyond the donor display name**: no addresses, contact details or giving history outside this widget's pledge figures.

## Still needs sign-off

No adjudicated sign-off findings ledger exists for this widget: the Step 6 dossier is a pre-build designer brief with no Accepted/Rejected/Disputed findings, and there is no reconciliation file. The operative open-items ledger is the Step 4 doc's Sign-off Readiness table; the rows below carry it into this contract.

1. **Receipts-only rows need a query path that does not exist (Step 4 Sign-off Readiness row 7 - OPEN and BLOCKING for that mode).** Edward Eoff verified live [SME: 2026-08-10] that the widget shows nothing without a pledge, because `paid` is reached by walking each in-scope pledge's linked receipts. Serving an activity with receipts but no overlapping pledge needs the activity list to become a union of pledge-backed and receipt-backed activities - a new capability, not a query tweak. **Who decides**: owner (accept-as-risk and build, or drop the mode). **Blocked until then**: returning any row with `hasPledgeInRange` false, the receipts-only footer line, and the Youth-Ministry-style row in API 1's example. Everything else in this contract is unaffected.
2. **Linear-by-days vs stepped expected, load-bearing.** API 3's schedule is stepped by definition; API 1's `expected` is linear-by-days as designed. The two must share one pacing definition or the drill contradicts its parent row. The org-configured `RM_PledgePercent` schedule (the only stored pacing schedule in the system, read by nothing today) is a third candidate. **Who decides**: dev + product. **Blocked**: final wording of the `expected` formula and the schedule's `amountDue` curve.
3. **`Frequency` / `Duration` semantics.** Both columns exist on `RM_Pledge` [CODE], but their meaning (payments-per-year vs period count) is documented nowhere in the entity or widget code. **Who decides**: dev, from data or the maintainers. **Blocked**: API 3's `dueDate` spacing and instalment count being treated as real rather than illustrative.
4. **Per-pledge receipt attribution.** The schedule and `pledges[].paid` need receipts attributable to a single pledge; the existing queries aggregate at activity level. **Who decides**: dev (confirm the join path from `RM_HistoryDetail` through pledge or church to one pledge). **Blocked**: API 2's `paid` per row and API 3's allocation being buildable as specced.
5. **Pledge volume.** The 500-800 pledges-per-activity figure is reconstructed from a garbled transcript line and must be confirmed before it sizes anything. **Who decides**: Edward Eoff. **Blocked**: the API 2 worst-case verdicts staying honest; pagination stands regardless.
6. **Worst realistic activity count.** No cited ceiling exists for API 1's row count. **Who decides**: Edward Eoff (or a live query at a large conference). **Blocked**: the BOUNDED verdict's ceiling; the shape does not change.
7. **Mixed-term activity presentation.** When one activity's pledges carry different terms, the activity-level term line and `daysAhead` need a stated display rule (the MIN/MAX span in this contract is a working definition, not an approved one). **Who decides**: product + dev. **Blocked**: final semantics of `beginDate`, `endDate`, `termDays`, `daysElapsed`, `daysAhead` on APIs 1 and 2.
8. **Permission right and denied-state UX.** The modern right name, whether donor names need a separate right, and what a user without the right sees. **Who decides**: dev (right name), product (UX). **Blocked**: the Auth and scoping [TO CONFIRM]s and the permission-denied state contract.
9. **Export mechanics.** File format, generation path, and whether the popup's export truncates to the five rows shown or carries every behind pledge. **Who decides**: dev + product (the export-matches-the-view contract is the constraint). **Blocked**: API 4's response details; its params are stable.
10. **Ended-before-window unpaid pledges.** The overlap rule still excludes a pledge that ended before `rangeStart` while owing. **Who decides**: SME (Edward Eoff). **Blocked**: nothing in the contract; a widened rule would only change the in-scope predicate.
