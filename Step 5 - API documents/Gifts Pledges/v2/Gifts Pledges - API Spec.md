# Gifts Pledges - API Spec

**Status: Done - awaiting sign-off (drafting complete, owner review pending)**

> **Read this first - the three load-bearing facts of this contract.**
> 1. The Modern API's existing gifts-pledges endpoint returns only `{PurposeId, PurposeName, Pledged, Received}` per purpose [DOC - Widget_Comparison_Classic / Step 1 research]. Almost everything else the built Final renders is NEW backend work, called out per field below: per-pledge Pledge Due proration, the per-donor pledge drill, the gift-transaction drill, the campaign Goal, and export.
> 2. **Received basis conflict, unresolved.** This contract specs Received as pledge-linked gift lines only, per the built Final and the standing owner decision. The Modern API's existing DTOs count ALL posted gift detail for the purpose or campaign, including gifts with no pledge link. The two figures differ whenever unpledged one-off gifts exist. See Still needs sign-off, item 1. Nothing that sums Received may be built before that is settled.
> 3. Volume ceilings for campaigns, pledges per campaign, and gifts per pledge are all `[TO CONFIRM - backend team]`. The BOUNDED verdicts below are conditional on them.

---

## Overview

The widget answers two questions per gift and pledge campaign: how is it tracking against its Goal, and how much of what was pledged is still due. Users are stewardship, finance and leadership staff monitoring campaign health; the deep dive reaches the donor pledges behind a campaign and the individual gift transactions applied to each pledge, and the widget's only action is export. This widget owns the GOAL PROGRESS read of the pledge pair; the exception (behind-pace) framing belongs to Remittance Pledges, whose contract is separate.

This contract defines five APIs: a bounded campaign summary read fired on render and on every filter change (API 1), a campaign filter lookup (API 2), a paginated per-campaign donor pledge list fired on row expand and on bar click (API 3), a per-pledge gift transaction read fired on pledge expand (API 4), and a view-scoped server-side export (API 5). The decomposition is derived in the API inventory. All five are reads; there is no write anywhere in this widget, deliberately: export is the widget's only action and additional actions must not be invented without a demonstrated user need [DOC - Step 4, standing constraint].

Terminology: legacy "Pledge Purpose" is the UI's "Campaign". The API keys everything by `purposeId`.

---

## Design → API coverage

| Design element | Type | API | Field(s) | Provenance |
|---|---|---|---|---|
| Glance headline: Total Received | KPI | API 1 | `totals.received` | DERIVED (sum of pledge-linked gift lines) [BUILD][DOC - Step 4] |
| Glance goal read: "of $X goal" + progress percent + progress bar | KPI | API 1 | `totals.goal`, `totals.progressPercent` | NEW (Goal does not exist in legacy GF data) [BUILD][DOC - Step 4] |
| Glance / header status band (thresholds 0.75 and 1.00) | state | API 1 | `totals.progressPercent` | Client-side banding of a served number [BUILD] |
| Header KPI line (Explore/Detail): received + goal pill | KPI | API 1 | `totals.received`, `totals.goal`, `totals.progressPercent` | as above |
| Campaign filter chip + option list | filter | API 2 | `campaigns[].purposeId`, `campaigns[].purposeCode`, `campaigns[].purposeName` | STORED GF_Purpose [DOC - Step 1 research]; code column UNVERIFIED (backend team) |
| Date range chip ("Gifts from X to Y") | filter | none | client-side display state; only `rangeEnd` is sent | [BUILD] - see Filter architecture |
| View toggle: Goal Progress / Summary Table | view | none | client-side view over the API 1 response | [BUILD] |
| Goal Progress bar per campaign (label, percent, fill, caption, badge) | chart series | API 1 | `campaigns[].purposeCode`, `campaigns[].purposeName`, `campaigns[].received`, `campaigns[].goal`, `campaigns[].progressPercent` | mixed - see API 1 schema |
| Goal Progress bar order (closest to goal first) | sort order | none | client-side sort of the bounded API 1 rows by `progressPercent` desc | [BUILD] |
| Goal Progress legend: count per status band | count | API 1 | derived client-side from `campaigns[].progressPercent` over the full returned set | [BUILD] |
| Goal Progress legend: "Remaining to goal overall" | KPI | API 1 | derived client-side: `max(0, totals.goal - totals.received)` | [BUILD] |
| Summary Table columns: Purpose (Campaign), Pledge Total, Pledge Due, Received, Due Remaining, Percent Due | table columns | API 1 | `campaigns[].purposeCode`, `purposeName`, `pledgeTotal`, `pledgeDue`, `received`, `dueRemaining`, `percentDue` | see API 1 schema |
| Summary Table row sub-line: "received of goal (pct)" | table column | API 1 | `campaigns[].received`, `goal`, `progressPercent` | as above |
| Summary Table "Closed" badge | state | API 1 | `campaigns[].isClosed` | NEW (modern campaign model) [BUILD, Rule 11] |
| Summary Table totals row (sums the first four money columns; Percent Due not summed) | grand total | API 1 | `totals.pledgeTotal`, `totals.pledgeDue`, `totals.received`, `totals.dueRemaining` | DERIVED server-side over the full filtered set |
| Summary Table row order | sort order | API 1 | server-returned order, rendered as received | UNVERIFIED (backend team) - see Where computation lives |
| Row expand: donor pledge breakdown (Name, Begin date, End date, Pledge, Received, Due Remaining, Status; row key feeds the pledge expand) | drill | API 3 | `pledges[].pledgeId`, `pledges[].donorName`, `beginDate`, `endDate`, `pledgeAmount`, `received`, `dueRemaining`, `daysAheadBehind` | see API 3 schema |
| Donor breakdown pager (20 per page) | state | API 3 | `totalCount`, `page`, `pageSize` | NEW |
| Donor pledge status chip (paid in full / ahead / on track / behind bands) | state | API 3 | client-side banding of `dueRemaining` + `daysAheadBehind` + `pledgeAmount` | [BUILD] |
| Pledge expand: "Gifts applied to this pledge" (Gift Date, Amount, Reference) + total footer | drill | API 4 | `gifts[].giftDate`, `gifts[].amount`, `gifts[].reference`, `totalReceived`, `giftCount` | see API 4 schema |
| Bar click: top-5 most-behind donors modal (campaign summary cells + top-5 list + "Showing N of M" note) | drill | API 3 | `summary.*`, `pledges[]` (with `behindOnly=true`, `pageSize=5`), `behindCount` | see API 3 schema |
| Modal footer: "Open in Gifts and Pledges" | action | none | navigation stub; no API allocated - see Still needs sign-off, item 6 | [BUILD, Rule 11][TO CONFIRM - Oisin] |
| Header Export (active view) | action | API 5 | file response | NEW |
| Donor-breakdown Export (scoped to one campaign) | action | API 5 | file response with `view=donorPledges&purposeId=` | NEW |
| Empty state (no campaigns) | state | API 1 | empty `campaigns[]`, zero `totals` | see State contracts |
| Loading / skeleton on filter change | state | none | client behaviour while API 1 is in flight | [BUILD] |
| Refresh icon (all tiers) | action | API 1 (+ API 2) | re-fires the current query | [BUILD] |

---

## Tables

| Table / repository | Fields and members used |
|---|---|
| `GF_Purpose` | Purpose (campaign) list: id, code, name, CompanyID, Active [DOC - Step 1 research]; exact code/name column names UNVERIFIED (backend team) |
| `GF_Pledge` | Per-donor pledge rows: PurposeID, amount, begin/end term dates, frequency, installment count, Active. Amount column confirmed as the pledge figure [DOC - Step 1 research]; term/frequency/installment column names UNVERIFIED (backend team) |
| `GF_History` / `GF_HistoryDetail` | Gift lines: Amount, GiftDate, JournalID (posted), UnDoJournalID (void), PurposeID, PledgeID (pledge link) [DOC - Step 1 research]; PledgeID linkage matches the legacy `pledge.GFHistoryDetails` navigation [DOC - Step 4] |
| `GF_Campaign` | The modern campaign Goal model: Goal, HasGoal, IsClosed [DOC - Widget_Comparison_New_Widgets]. How GF_Campaign rows map to GF_Purpose rows is [TO CONFIRM - backend team] - see Still needs sign-off, item 2 |
| `CorePerson` | `DisplayNameLastFirst` for the donor name in the drill [BUILD] |

No new tables. The work is new queries and new server-side computation against existing tables, plus the Goal join above, whose keying is the one open schema question.

Core formulas (the statements a developer checks the query against):

- **Purpose list:** `GF_Purpose WHERE CompanyID = ctx AND Active = true`. [DOC - Step 1 research] Legacy additionally shows only purposes with pledge activity [DOC - Widget_Comparison_Classic]; this contract keeps that rule.
- **Pledge Total (campaign):** `SUM(GF_Pledge.Amount) WHERE PurposeID = purpose AND Active = true`. [DOC - Step 1 research]
- **Received (pledge):** `SUM(GF_HistoryDetail.Amount)` over lines **linked to that pledge** (`PledgeID = pledge`), posted (`JournalID != null`), not voided (`UnDoJournalID = null`), `GiftDate <= rangeEnd`. [DOC - Step 4, owner decision] Unpledged gift lines (`PledgeID = null`) are excluded - the recorded conflict with the Modern API's all-gifts basis is Still needs sign-off, item 1.
- **Received (campaign):** sum of its pledges' Received.
- **Pledge Due (pledge):** full pledge once `rangeEnd >= EndDate`; otherwise per-installment amount times (frequency cycles elapsed from BeginDate to `rangeEnd`, plus one), capped at the installment count. Frequency cycle table: 1 annual, 2 biennial, 4 quarterly, 6 bi-monthly, 12 monthly, 24 semi-monthly, 26 biweekly, 52 weekly. [BUILD][DOC - Step 4] This is installment proration, NOT the linear day fraction Remittance Pledges uses. The cycle count anchors on `rangeEnd`, not on today: the shipped legacy code anchors on today, which is a known defect and must not be replicated [BUILD - gpF code comment].
- **Pledge Due (campaign):** sum of its pledges' Pledge Due.
- **Due Remaining:** `pledgeDue - received`, returned pre-signed; negative means over-received and is favourable. [DOC - Step 4]
- **Percent Due:** `dueRemaining / pledgeDue`, the share still outstanding; `null` when `pledgeDue = 0`. [BUILD][DOC - Step 4 readiness note] The Step 4 doc also still carries an unretired CONFLICT row on this definition - recorded in Still needs sign-off, item 4, not collapsed here.
- **Progress:** `received / goal`; `null` when there is no goal or `goal <= 0`. [BUILD]
- **Filter applied to every read:** company scope (header) and `rangeEnd` as the as-of cutoff for Received and for the Pledge Due proration. [BUILD][DOC - Step 4]

---

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Data endpoint | `GET /api/dashboard/gifts-pledges/data?dateGiftsThru=` returns `List<GiftsPledgesRowDto> {PurposeId, PurposeName, Pledged, Received}` [DOC - Widget_Comparison_Classic] | API 1 replaces it: adds `pledgeDue`, `dueRemaining`, `percentDue`, `goal`, `progressPercent`, `isClosed`, a `totals` block, and a `purposeId` filter param. Everything added is NEW server work |
| Pledge Due / Due Remaining / Percent Due | Not returned by the legacy repository or the Modern API; computed client-side in the legacy widget [DOC - Step 1 research] | NEW: computed server-side per pledge and rolled up, per the formulas above |
| Received basis | Modern DTO sums ALL posted gift detail for the purpose; the parallel campaign DTO's TotalRaised likewise counts all posted gifts [DOC - comparison files] | Changed: pledge-linked lines only. UNRESOLVED conflict - Still needs sign-off, item 1 |
| Goal | No Goal field anywhere in legacy GF data [DOC - Step 1 research] | NEW: Goal/HasGoal/IsClosed served per purpose via the GF_Campaign model; keying [TO CONFIRM - backend team] |
| Donor pledge drill | Does not exist (no drill in the legacy widget) [DOC - Step 1 research] | NEW: API 3, paginated, fixed most-behind-first order, `behindOnly` mode for the top-5 modal |
| Gift transaction drill | Does not exist | NEW: API 4 |
| Export | Does not exist | NEW: API 5, view-scoped server-side file generation |
| Date control | Single `dateGiftsThru`, defaults to today | `rangeEnd` is the same as-of cutoff; the range start is client display state and is not sent (see Filter architecture) |
| Campaign filter | Does not exist | NEW param on API 1 (`purposeId`) plus the API 2 lookup |

---

## API inventory

| API | Purpose | Trigger (when it fires) | Cardinality | R/W | Cache posture | Split trigger |
|---|---|---|---|---|---|---|
| API 1 - Campaign summary | Per-campaign goal + pledge figures and the totals block; feeds Glance, both views, the legend and the totals row | Widget render; campaign or date-range change; refresh | One row per active purpose with pledge activity (bounded, ceiling [TO CONFIRM - backend team]) | R | LIVE per request | Base read |
| API 2 - Campaign lookup | Options for the Campaign filter | Filter popover open (cacheable across opens); refresh | Same purpose set as API 1 | R | TTL 15 min | Lifetime gap: a rarely-changing option list must not be re-paid on every data query, and the filtered API 1 response cannot carry the full option list |
| API 3 - Donor pledge list | Pledges behind one campaign, paced to `rangeEnd`; also serves the top-5 most-behind modal via `behindOnly` | Summary Table row expand; Goal Progress bar click; drill page change | Unbounded per campaign ([TO CONFIRM - backend team]); paginated | R | LIVE per request | Trigger gap (fires on user action, never on render) + cardinality gap (unbounded list must not ride on the bounded summary) |
| API 4 - Pledge gifts | Gift transactions applied to one pledge | Pledge row expand inside the drill | Small per pledge (ceiling [TO CONFIRM - backend team]) | R | LIVE per request | Trigger gap + grain gap (per-entity detail keyed by pledge id) |
| API 5 - Export | Server-generated spreadsheet of the active view's data, or of one campaign's donor pledges | Export button (header or donor breakdown) | One file | R | none (generated per request) | Conditional weight: heavy file generation only on explicit user action |

Merges considered and closed: API 1 and API 2 stay separate (a filtered summary response cannot feed the option list, and their cache lifetimes differ). The top-5 modal does NOT get its own endpoint: it is API 3 with `behindOnly=true&pageSize=5`, because both calls answer the same per-campaign pledge question at the same grain, and the modal's summary cells ride in API 3's `summary` block so the modal can never disagree with the page it opened from. API 4 stays separate from API 3 rather than nesting gifts inside every pledge row: gifts are only needed for the one pledge the user expands, and nesting them would multiply API 3's payload by the gift count for interactions that never happen.

---

## Call sequence

| Interaction | Calls fired | Notes |
|---|---|---|
| Initial widget load | API 1 | `rangeEnd` = today, no `purposeId`. Glance renders from `totals` alone |
| Open Campaign filter | API 2 | Served from TTL cache when warm |
| Change Campaign filter | API 1 | With `purposeId`; expanded rows and drill pages reset client-side |
| Change Date range (preset or custom To) | API 1 | New `rangeEnd`. A custom From changes only the client-side chip; no call unless To also changed |
| Switch view (Goal Progress / Summary Table) | none | Client-side view over the held API 1 response |
| Expand a Summary Table campaign row | API 3 | `page=1&pageSize=20`, same `rangeEnd` as the current API 1 response (the shared asOf anchor) |
| Drill page change | API 3 | Same params, new `page` |
| Expand a pledge row | API 4 | Same `rangeEnd` |
| Click a Goal Progress bar (top-5 modal) | API 3 | `behindOnly=true&page=1&pageSize=5`, same `rangeEnd`; modal renders `summary` + `pledges` + `behindCount` |
| Export (header) | API 5 | `view=goalProgress` or `view=summaryTable`, current `purposeId`/`rangeEnd` |
| Export (donor breakdown) | API 5 | `view=donorPledges&purposeId=`, same `rangeEnd` |
| Refresh | API 1 (+ API 2 if the popover is open) | Re-fires the current query unchanged |

Shared snapshot anchor: `rangeEnd` is the asOf for every call, passed identically and echoed as `asOf` in every response. The client passes the `asOf` echoed by its held API 1 response into APIs 3, 4 and 5, so a drill can never straddle a posting and disagree with the row it expanded from. Residual drift (a gift posted between the two calls, same asOf) is accepted: gift postings are dated, and `GiftDate <= rangeEnd` makes re-reads deterministic for any past date.

---

## Filter architecture

| Filter | Option source | Cardinality | Execution | Aggregate effect | Cascade | "All" wire form | Round trips |
|---|---|---|---|---|---|---|---|
| Campaign | LOOKUP - API 2 (GF_Purpose, Active) | Same as campaign ceiling, [TO CONFIRM - backend team]; if over ~200 the lookup becomes searchable server-side | SERVER - `purposeId` on API 1 | Yes: `totals` recompute over the filtered set | None (options not scoped by date range) | Omit the param | 1 (API 1) |
| Date range preset (This year / Last 30 days / Custom) | STATIC enum | 3 | SERVER - `rangeEnd` on APIs 1, 3, 4, 5 | Yes: Received and Pledge Due both re-anchor | None | n/a (a `rangeEnd` is always sent; default today) | 1 (API 1) |
| Custom From date | client date input, capped at today | n/a | CLIENT - display state only; it changes the chip text and is never sent, because no figure in the design is windowed by the start date [BUILD] | No | None | n/a | 0 |
| View toggle | STATIC enum (2 views) | 2 | CLIENT - both views render from the full API 1 row set already held; the set is bounded (conditional on the campaign ceiling above); no server aggregate changes, since `totals` describes the same filtered set either way | No | None | n/a | 0 |

- **Combination semantics:** AND, narrowing. Campaign and date range apply to every API together.
- **Conflict rule:** a `purposeId` that is not in the caller's active set makes API 1 return a well-formed empty response (empty `campaigns[]`, zero `totals`), not an error - the purpose may legitimately have been deactivated between lookup and query. On APIs 3/4/5 an unknown path or param id is `404`. A malformed `rangeEnd` is `400`. A future `rangeEnd` is accepted and computed literally (the client input caps at today, so it does not arise from this UI).
- **Cascade invalidation:** the Campaign option list does not depend on the date range. If a refreshed API 2 response no longer contains the selected `purposeId`, the client resets the filter to All Campaigns.
- **Empty-result semantics:** any valid filter combination that matches nothing returns the empty-state shape in State contracts - zero response, never an error.
- **Blank-value rule:** a pledge with no purpose link cannot exist (PurposeID is the grouping key); gift lines with `PledgeID = null` are excluded from Received by definition, under every filter value - a blank pledge link never behaves as a wildcard.

---

## Volume and performance

| Dataset | Typical rows | Worst realistic rows (basis) | Row width | Payload at worst | Verdict | Server cost model | Cache posture |
|---|---|---|---|---|---|---|---|
| API 1 `campaigns[]` | 2-6 (live org showed 2 rows [DOC - Step 6 dossier]; build demo seeds 6) | [TO CONFIRM - backend team] - no cited ceiling on active purposes with pledge activity | 12 fields, ~250 bytes | ~25 KB at 100 purposes | BOUNDED, conditional on the ceiling; if purposes can exceed ~500, this becomes MUST PAGINATE and the view toggle moves server-side | N purposes × M pledges per purpose: one indexed pass over GF_Pledge plus an aggregated GF_HistoryDetail join; the proration is arithmetic per pledge row, no per-row subquery | LIVE |
| API 2 `campaigns[]` | 2-6 | same ceiling as above | 4 fields, ~90 bytes | ~9 KB at 100 | BOUNDED, same condition | Single indexed scan of GF_Purpose | TTL 15 min |
| API 3 `pledges[]` (per campaign) | ~45 (build seeds 42-54 per campaign) | [TO CONFIRM - backend team] - a large org's donor count per campaign is unbounded in principle | 8 fields, ~220 bytes | one page ≤ ~22 KB at max pageSize | MUST PAGINATE | Pledge scan for one purpose + aggregated gift-line join, then per-pledge proration; ORDER BY computed `dueRemaining` desc | LIVE |
| API 4 `gifts[]` (per pledge) | 1-5 (build) | ~160 by construction of the term model (up to weekly frequency over a 36-month term), plus extras; hard ceiling [TO CONFIRM - backend team] | 3 fields, ~70 bytes | ~12 KB | BOUNDED, conditional; if real data shows pledges with 1000+ linked lines this paginates | Single indexed scan of GF_HistoryDetail by PledgeID | LIVE |
| API 5 export | n/a | the exported view's dataset (above) | n/a | file | MUST AGGREGATE SERVER-SIDE (the client never holds the rows; the server streams the file) | Reuses API 1 or API 3's query, streamed to a file | none |

The build-volume trap applies to API 3 directly: the mock expands, sorts and pages its donor set instantly because it holds 42-54 seeded rows in the browser. That is a property of the fixture. The production set is bounded only by how many donors pledge, so the list paginates and everything below follows.

### Pagination contract

Applies to API 3 (`pledges[]`); nothing else paginates.

- **Params:** `page` (1-based, default 1), `pageSize` (default 20, maximum 100 - the default matches the built drill; the maximum is a defaulted value awaiting owner confirmation, Still needs sign-off item 9).
- **What paginates:** the `pledges[]` array only.
- **What does not:** `summary` (all campaign-level figures), `totalCount` and `behindCount` all compute over the **full filtered set**, never the page. Switching pages changes no figure outside `pledges[]`.
- **Sort params:** none. `sortBy`/`sortDir` are deliberately not offered: the drill's order is fixed at most-behind-first (`dueRemaining` desc), which is the design's stated reading of the list [BUILD][DOC - Step 4]. What the user loses: they cannot re-sort the drill by name or amount; export (API 5) is the stated path to re-orderable data.
- **Deterministic total order:** `dueRemaining` desc, then `pledgeId` asc as the unique tiebreaker.
- **`totalCount`** returned alongside every page (and `behindCount` for the modal's "Showing N of M" note).
- **Past the last page:** empty `pledges[]`, correct `totalCount`, correct `summary`, HTTP 200.

---

## Where computation lives

| Value | Server or client | Basis | Why |
|---|---|---|---|
| Pledge Due (per pledge and per campaign) | SERVER | Installment proration formula in Tables | Needs every pledge's term, frequency and installment fields; the client never holds the pledge set at summary time |
| Received (per pledge and per campaign) | SERVER | Pledge-linked gift-line sum | Spans gift lines never transmitted |
| Due Remaining | SERVER, pre-signed | `pledgeDue - received` | Delta returned signed; negative is favourable; the client formats, never subtracts |
| Percent Due | SERVER | `dueRemaining / pledgeDue`; returns `null` when `pledgeDue = 0` | Division-by-zero rule owned by the divider; client renders `null` as "n/a" |
| `progressPercent` (per campaign and totals) | SERVER | `received / goal`; returns `null` when there is no goal or `goal <= 0` | Same rule; client renders `null` as "n/a" / "no goal set" |
| `totals` block | SERVER | Sums over the full filtered campaign set | Must match the rows exactly; served in the same response so it cannot straddle a write |
| Remaining to goal overall | CLIENT | `max(0, totals.goal - totals.received)` | Pure arithmetic over two served values; the zero floor is part of the design (an over-goal org shows 0 remaining, not a negative) |
| Goal status band per campaign and overall (thresholds 0.75 and 1.00 of goal) | CLIENT | Bands a served `progressPercent` | Presentation banding; thresholds are locked in the Step 4 design. The Modern API's own ProgressStatus enum is NOT used - see Still needs sign-off, item 3 |
| Legend counts per status band | CLIENT | Count over the full `campaigns[]` set held | Full filtered set is present (BOUNDED); counts never change with client-side bar trimming |
| Goal Progress bar order | CLIENT | Sort held rows by `progressPercent` desc | Bounded set, no aggregate affected |
| Summary Table row order | SERVER | Deterministic order with `purposeId` as final tiebreaker; the exact legacy grid ORDER BY it must reproduce is [TO CONFIRM - backend team] | The client renders rows as received [BUILD] |
| Donor pledge status chip | CLIENT | `pledgeAmount <= 0` is no-pledge; `dueRemaining <= 0` is paid-in-full; otherwise day bands over `daysAheadBehind` (30 or more ahead; within 30 either side; 30-60 behind; over 60 behind) | Bands pure arithmetic over served values |
| `daysAheadBehind` | SERVER, pre-signed | `(received/pledgeAmount - pledgeDue/pledgeAmount) × termDays`; `null` when `pledgeAmount <= 0` | Needs term dates the drill row otherwise would not carry; returned signed so the client never does math |
| Drill sort (most behind first) | SERVER | Pagination contract | The set paginates, so ordering is server-side by rule |
| Gift panel total | SERVER (`totalReceived`) | Sum over the pledge's returned gift lines | Served so the client shows a total that provably matches the pledge row's Received |
| Pager figures | SERVER (`totalCount`, `behindCount`) | Full-set counts | The page alone cannot know them |

Deltas are pre-signed; every server-computed ratio states its zero rule (`null`); the only presentation thresholds in play (0.75 / 1.00 goal bands, and the drill's day bands) are locked in the Step 4 design and are restated here rather than defaulted silently.

---

## API 1: Campaign summary

### Endpoint

```
GET /api/dashboard/gifts-pledges/summary
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `rangeEnd` | date (ISO `yyyy-MM-dd`) | no | any valid date | today | The as-of cutoff: gifts count if `GiftDate <= rangeEnd`; Pledge Due prorates to this date |
| `purposeId` | string (id) | no | an active purpose id | omitted = all campaigns | Narrows every row and the `totals` block to one campaign |

Company scope comes from the `X-Company-ID` context header, as on the existing gifts-pledges endpoint (see Auth and scoping).

### Example requests

```
GET /api/dashboard/gifts-pledges/summary
GET /api/dashboard/gifts-pledges/summary?rangeEnd=2026-08-19&purposeId=YOUTHCMP
```

No URL encoding is needed for these params; ids are opaque tokens and dates are ISO.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | date | DERIVED - echo of the `rangeEnd` param | The anchor every figure is computed to |
| `campaigns` | array | DERIVED - container, judged via its children | One row per active purpose with pledge activity, in the server's deterministic order |
| `campaigns[].purposeId` | string | STORED GF_Purpose id column [DOC - Step 1 research] | Key for APIs 3 and 5 |
| `campaigns[].purposeCode` | string | UNVERIFIED (backend team) - the live grid shows a short code beside the name; its GF_Purpose column is unconfirmed | Display label prefix |
| `campaigns[].purposeName` | string | STORED GF_Purpose name column [DOC - Step 1 research] | Display label |
| `campaigns[].pledgeTotal` | number | DERIVED `SUM(GF_Pledge.Amount)` active pledges for the purpose [DOC - Step 1 research] | Table column |
| `campaigns[].pledgeDue` | number | NEW - server-side installment proration per pledge, summed (formula in Tables) [BUILD][DOC - Step 4] | Table column; exists in no endpoint today |
| `campaigns[].received` | number | DERIVED - pledge-linked posted unvoided gift lines with `GiftDate <= rangeEnd` [DOC - Step 4, owner decision]; basis conflict with the Modern API recorded in Still needs sign-off, item 1 | Table column, Glance KPI |
| `campaigns[].dueRemaining` | number | DERIVED `pledgeDue - received`, pre-signed | Table column; negative is favourable |
| `campaigns[].percentDue` | number or null | DERIVED `dueRemaining / pledgeDue`; `null` when `pledgeDue = 0` | Table column, as a fraction (0.3333 = 33.33%) |
| `campaigns[].goal` | number or null | NEW - GF_Campaign Goal via the purpose mapping [TO CONFIRM - backend team]; `null` when HasGoal is false | Goal read on bars and row sub-line |
| `campaigns[].progressPercent` | number or null | NEW `received / goal`; `null` when no goal | Bar fill, badge banding, row sub-line |
| `campaigns[].isClosed` | boolean | NEW - GF_Campaign IsClosed via the same mapping [TO CONFIRM - backend team] | "Closed" badge |
| `totals` | object | DERIVED - container, judged via its children | Over the full filtered set |
| `totals.pledgeTotal` | number | DERIVED sum of rows | Totals row |
| `totals.pledgeDue` | number | DERIVED sum of rows | Totals row |
| `totals.received` | number | DERIVED sum of rows | Totals row, Glance headline |
| `totals.dueRemaining` | number | DERIVED `totals.pledgeDue - totals.received`, pre-signed | Totals row |
| `totals.goal` | number | DERIVED sum of row goals (rows with `null` goal contribute 0) | Glance goal read |
| `totals.progressPercent` | number or null | DERIVED `totals.received / totals.goal`; `null` when `totals.goal <= 0` | Glance percent and banding |
| `totals.campaignCount` | number | DERIVED count of rows | Totals row lead-in and Glance sr text |

### Example response

```json
{
  "asOf": "2026-08-19",
  "campaigns": [
    { "purposeId": "FRNKSTOK", "purposeCode": "FRNKSTOK", "purposeName": "Stoke Sell", "pledgeTotal": 1200.00, "pledgeDue": 1200.00, "received": 1855.00, "dueRemaining": -655.00, "percentDue": -0.5458, "goal": 1500, "progressPercent": 1.2367, "isClosed": true },
    { "purposeId": "2020PLED", "purposeCode": "2020PLED", "purposeName": "2020 Pledge", "pledgeTotal": 1000.00, "pledgeDue": 1000.00, "received": 96.00, "dueRemaining": 904.00, "percentDue": 0.9040, "goal": 2000, "progressPercent": 0.0480, "isClosed": false },
    { "purposeId": "BLDGFUND", "purposeCode": "BLDGFUND", "purposeName": "Building Fund", "pledgeTotal": 250000.00, "pledgeDue": 210000.00, "received": 205000.00, "dueRemaining": 5000.00, "percentDue": 0.0238, "goal": 240000, "progressPercent": 0.8542, "isClosed": false },
    { "purposeId": "MISSION26", "purposeCode": "MISSION26", "purposeName": "Mission Trip 2026", "pledgeTotal": 40000.00, "pledgeDue": 38000.00, "received": 41000.00, "dueRemaining": -3000.00, "percentDue": -0.0789, "goal": 40000, "progressPercent": 1.0250, "isClosed": false },
    { "purposeId": "YOUTHCMP", "purposeCode": "YOUTHCMP", "purposeName": "Youth Camp", "pledgeTotal": 18000.00, "pledgeDue": 9000.00, "received": 6000.00, "dueRemaining": 3000.00, "percentDue": 0.3333, "goal": 20000, "progressPercent": 0.3000, "isClosed": false },
    { "purposeId": "ORGANRST", "purposeCode": "ORGANRST", "purposeName": "Organ Restoration", "pledgeTotal": 90000.00, "pledgeDue": 81000.00, "received": 72000.00, "dueRemaining": 9000.00, "percentDue": 0.1111, "goal": 96000, "progressPercent": 0.7500, "isClosed": false }
  ],
  "totals": { "pledgeTotal": 400200.00, "pledgeDue": 340200.00, "received": 325951.00, "dueRemaining": 14249.00, "goal": 399500, "progressPercent": 0.8159, "campaignCount": 6 }
}
```

Reconciliation: received 1855 + 96 + 205000 + 41000 + 6000 + 72000 = 325951 (totals.received); pledgeDue 1200 + 1000 + 210000 + 38000 + 9000 + 81000 = 340200 (totals.pledgeDue); totals.received + totals.dueRemaining: 325951 + 14249 = 340200; goal 1500 + 2000 + 240000 + 40000 + 20000 + 96000 = 399500; campaignCount 6 matches the 6 rows. The first two rows match the live product's figures for the same purposes.

### State contracts

| State | Response |
|---|---|
| Empty (no active purposes with pledge activity) | `campaigns: []`, `totals` all zero with `progressPercent: null`, `campaignCount: 0`, HTTP 200 |
| Partial (a campaign has active pledges but no gifts yet) | The row appears with `received: 0`; `percentDue` = 1.0 when due, `null` when `pledgeDue = 0` |
| Not-yet-existing (every pledge term begins after `rangeEnd`) | Rows appear with `pledgeDue: 0`, `received: 0`, `percentDue: null` |
| Permission denied | HTTP 403 with an error body; what the widget then shows is an unresolved product decision (Still needs sign-off, item 5) |
| Upstream unavailable | HTTP 503 with an error body; the client keeps the last good response and shows its retry state |

## API 2: Campaign lookup

### Endpoint

```
GET /api/dashboard/gifts-pledges/campaigns
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| (none beyond the context header) | - | - | - | - | The list is company-scoped and Active-only; it is not scoped by date range |

### Example requests

```
GET /api/dashboard/gifts-pledges/campaigns
GET /api/dashboard/gifts-pledges/campaigns    (identical after a filter change; served from TTL cache)
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `campaigns` | array | DERIVED - container, judged via its children | Active purposes with pledge activity, same order as API 1 |
| `campaigns[].purposeId` | string | STORED GF_Purpose id [DOC - Step 1 research] | Wire value for `purposeId` params |
| `campaigns[].purposeCode` | string | UNVERIFIED (backend team) | Display |
| `campaigns[].purposeName` | string | STORED GF_Purpose name [DOC - Step 1 research] | Display |
| `campaigns[].isClosed` | boolean | NEW - GF_Campaign mapping [TO CONFIRM - backend team] | Lets the picker mark closed campaigns |

### Example response

```json
{
  "campaigns": [
    { "purposeId": "FRNKSTOK", "purposeCode": "FRNKSTOK", "purposeName": "Stoke Sell", "isClosed": true },
    { "purposeId": "2020PLED", "purposeCode": "2020PLED", "purposeName": "2020 Pledge", "isClosed": false },
    { "purposeId": "BLDGFUND", "purposeCode": "BLDGFUND", "purposeName": "Building Fund", "isClosed": false },
    { "purposeId": "MISSION26", "purposeCode": "MISSION26", "purposeName": "Mission Trip 2026", "isClosed": false },
    { "purposeId": "YOUTHCMP", "purposeCode": "YOUTHCMP", "purposeName": "Youth Camp", "isClosed": false },
    { "purposeId": "ORGANRST", "purposeCode": "ORGANRST", "purposeName": "Organ Restoration", "isClosed": false }
  ]
}
```

Reconciliation: 6 options matching API 1's 6 rows; no arithmetic to check in a lookup.

### State contracts

| State | Response |
|---|---|
| Empty | `campaigns: []`, HTTP 200; the client shows only All Campaigns |
| Partial | n/a for a lookup |
| Not-yet-existing entity | n/a |
| Permission denied | HTTP 403, as API 1 |
| Upstream unavailable | HTTP 503; the client keeps the last cached list |

## API 3: Donor pledge list

### Endpoint

```
GET /api/dashboard/gifts-pledges/campaigns/{purposeId}/pledges
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `purposeId` | string (path) | yes | an active purpose id | none | The campaign whose pledges are listed; unknown id is 404 |
| `rangeEnd` | date (ISO) | no | any valid date | today | Same anchor as API 1; the client passes the `asOf` echoed by its held API 1 response |
| `page` | integer | no | >= 1 | 1 | 1-based page |
| `pageSize` | integer | no | 1-100 | 20 | Page length; maximum 100 |
| `behindOnly` | boolean | no | true/false | false | true restricts rows to `dueRemaining > 0` (the top-5 modal calls with `behindOnly=true&pageSize=5`) |

### Example requests

```
GET /api/dashboard/gifts-pledges/campaigns/YOUTHCMP/pledges?rangeEnd=2026-08-19&page=1&pageSize=20
GET /api/dashboard/gifts-pledges/campaigns/YOUTHCMP/pledges?rangeEnd=2026-08-19&behindOnly=true&page=1&pageSize=5
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | date | DERIVED - echo of the `rangeEnd` param | Anchor |
| `purposeId` | string | DERIVED - echo of the path param | Key |
| `summary` | object | DERIVED - container, judged via its children | The campaign's full-set figures, identical in definition to its API 1 row; feeds the modal's summary cells |
| `summary.pledgeTotal` | number | DERIVED as API 1 | Modal cell |
| `summary.pledgeDue` | number | NEW as API 1 | Modal cell |
| `summary.received` | number | DERIVED as API 1 | Modal cell |
| `summary.dueRemaining` | number | DERIVED as API 1, pre-signed | Modal cell |
| `summary.percentDue` | number or null | DERIVED as API 1 | Modal sr text |
| `summary.goal` | number or null | NEW as API 1 | Modal cell |
| `summary.progressPercent` | number or null | NEW as API 1 | Modal cell and badge banding |
| `summary.isClosed` | boolean | NEW as API 1 | Modal badge |
| `pledges` | array | DERIVED - container, judged via its children | One row per donor pledge, most behind first, paginated |
| `pledges[].pledgeId` | string | STORED GF_Pledge id [DOC - Step 1 research] | Key for API 4; sort tiebreaker |
| `pledges[].donorName` | string | STORED CorePerson.DisplayNameLastFirst [BUILD] | Name column, "Last, First" |
| `pledges[].beginDate` | date | UNVERIFIED (backend team) - GF_Pledge term-begin column name unconfirmed | Begin date column |
| `pledges[].endDate` | date | UNVERIFIED (backend team) - term-end column name unconfirmed | End date column |
| `pledges[].pledgeAmount` | number | STORED GF_Pledge.Amount [DOC - Step 1 research] | Pledge column |
| `pledges[].received` | number | DERIVED - this pledge's linked posted unvoided gift lines with `GiftDate <= rangeEnd` [DOC - Step 4] | Received column |
| `pledges[].dueRemaining` | number | NEW - per-pledge proration minus received, pre-signed | Due Remaining column; primary sort key |
| `pledges[].daysAheadBehind` | number or null | NEW - pre-signed pace delta in days (formula in Where computation lives); `null` when `pledgeAmount <= 0` | Status chip banding and day phrase |
| `totalCount` | number | DERIVED full-set count (after `behindOnly` if set) | Pager |
| `behindCount` | number | DERIVED full-set count of `dueRemaining > 0` | Modal note "Showing 5 of N"; served on every call |
| `page` | number | DERIVED - echo of the request param | Pager |
| `pageSize` | number | DERIVED - echo of the request param | Pager |

### Example response

```json
{
  "asOf": "2026-08-19",
  "purposeId": "YOUTHCMP",
  "summary": { "pledgeTotal": 18000.00, "pledgeDue": 9000.00, "received": 6000.00, "dueRemaining": 3000.00, "percentDue": 0.3333, "goal": 20000, "progressPercent": 0.3000, "isClosed": false },
  "pledges": [
    { "pledgeId": "YOUTHCMP-7", "donorName": "Whitfield, Dana", "beginDate": "2025-03-01", "endDate": "2027-02-28", "pledgeAmount": 900.00, "received": 150.00, "dueRemaining": 400.00, "daysAheadBehind": -74 },
    { "pledgeId": "YOUTHCMP-21", "donorName": "Bell, Marcus", "beginDate": "2025-06-01", "endDate": "2026-05-31", "pledgeAmount": 600.00, "received": 120.00, "dueRemaining": 280.00, "daysAheadBehind": -55 }
  ],
  "totalCount": 47,
  "behindCount": 12,
  "page": 1,
  "pageSize": 20
}
```

Reconciliation: `summary.received` + `summary.dueRemaining`: 6000 + 3000 = 9000, which equals `summary.pledgeDue`; `summary` matches API 1's YOUTHCMP row field for field at the same `asOf` (that identity is the contract, and both are computed over the full pledge set, never the page); the two example rows are page 1 of 47, so page rows deliberately do not sum to the summary.

### State contracts

| State | Response |
|---|---|
| Empty (campaign has no pledges) | `pledges: []`, `totalCount: 0`, `behindCount: 0`, `summary` zeros with `percentDue: null`, HTTP 200 |
| Partial (pledges exist, none behind, `behindOnly=true`) | `pledges: []`, `totalCount: 0`, `behindCount: 0`, full `summary`; the modal renders its none-behind message |
| Not-yet-existing (all terms begin after `rangeEnd`) | Rows with `dueRemaining <= 0` and `received: 0`; ordering rule unchanged |
| Permission denied | HTTP 403, as API 1 |
| Upstream unavailable | HTTP 503 |

## API 4: Pledge gifts

### Endpoint

```
GET /api/dashboard/gifts-pledges/pledges/{pledgeId}/gifts
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `pledgeId` | string (path) | yes | a pledge id | none | Unknown id is 404 |
| `rangeEnd` | date (ISO) | no | any valid date | today | Gifts count if `GiftDate <= rangeEnd`; same anchor the drill row used |

### Example requests

```
GET /api/dashboard/gifts-pledges/pledges/YOUTHCMP-7/gifts?rangeEnd=2026-08-19
GET /api/dashboard/gifts-pledges/pledges/YOUTHCMP-7/gifts    (defaults to today)
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | date | DERIVED - echo of the `rangeEnd` param | Anchor |
| `pledgeId` | string | DERIVED - echo of the path param | Key |
| `gifts` | array | DERIVED - container, judged via its children | Linked posted unvoided gift lines dated on or before `rangeEnd`, ascending by `giftDate` then line id |
| `gifts[].giftDate` | date | STORED GF_HistoryDetail GiftDate [DOC - Step 1 research] | Gift Date column |
| `gifts[].amount` | number | STORED GF_HistoryDetail.Amount [DOC - Step 1 research] | Amount column |
| `gifts[].reference` | string | UNVERIFIED (backend team) - the drill shows a payment reference (ACH / check number / EFT id); its source column is unconfirmed | Reference column |
| `totalReceived` | number | DERIVED sum of the returned `gifts[].amount` | Footer total; must equal the drill row's `received` at the same `asOf` |
| `giftCount` | number | DERIVED count of rows | Footer "across N gifts" |

### Example response

```json
{
  "asOf": "2026-08-19",
  "pledgeId": "YOUTHCMP-7",
  "gifts": [
    { "giftDate": "2025-04-12", "amount": 50.00, "reference": "Check #4821" },
    { "giftDate": "2025-07-03", "amount": 40.00, "reference": "ACH" },
    { "giftDate": "2025-11-20", "amount": 60.00, "reference": "EFT 348112" }
  ],
  "totalReceived": 150.00,
  "giftCount": 3
}
```

Reconciliation: 50 + 40 + 60 = 150 (totalReceived), which equals the API 3 example's YOUTHCMP-7 `received` of 150 at the same `asOf`; giftCount 3 matches the 3 rows.

### State contracts

| State | Response |
|---|---|
| Empty (no linked gifts on or before `rangeEnd`) | `gifts: []`, `totalReceived: 0`, `giftCount: 0`, HTTP 200; the client shows its no-gifts-yet message |
| Partial | n/a - a gift line either qualifies or does not |
| Not-yet-existing entity | Unknown `pledgeId` is 404 |
| Permission denied | HTTP 403 |
| Upstream unavailable | HTTP 503 |

## API 5: Export

### Endpoint

```
GET /api/dashboard/gifts-pledges/export
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `view` | string | yes | `goalProgress` · `summaryTable` · `donorPledges` | none | Which dataset the file carries |
| `purposeId` | string | conditional | an active purpose id | omitted | Required when `view=donorPledges` (that export is scoped to one campaign); optional narrowing otherwise. `view=donorPledges` without `purposeId` is 400 |
| `rangeEnd` | date (ISO) | no | any valid date | today | Same anchor as the on-screen data being exported |

### Example requests

```
GET /api/dashboard/gifts-pledges/export?view=summaryTable&rangeEnd=2026-08-19
GET /api/dashboard/gifts-pledges/export?view=donorPledges&purposeId=YOUTHCMP&rangeEnd=2026-08-19
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| (file body) | binary | NEW - server-side file generation reusing API 1's query (`goalProgress`, `summaryTable`) or API 3's full unpaginated set (`donorPledges`) | A spreadsheet file (`Content-Disposition: attachment`); the built control names Excel as the target format, which stands as the default pending owner confirmation |

No JSON example: the response is a file. The `donorPledges` export contains the full pledge set for the campaign, not one page, in the same most-behind-first order.

### State contracts

| State | Response |
|---|---|
| Empty dataset | A well-formed file with headers and no data rows, HTTP 200 |
| Partial | n/a |
| Not-yet-existing entity | Unknown `purposeId` is 404 |
| Permission denied | HTTP 403 |
| Upstream unavailable | HTTP 503 |

---

## Auth and scoping

- **Company / tenant scoping:** every query is scoped by the `X-Company-ID` context header, the same header the existing Modern API gifts-pledges endpoint uses [DOC - Widget_Comparison_Classic]. No response ever mixes companies.
- **Permission right:** the widget is read-only, so one read right covers all five APIs. The exact right, and whether it is the Donors and Gifts module entitlement or a finer grant, is [TO CONFIRM - Feargal Phelan]. There is no write right because there is no write.
- **What a user without the right sees:** unresolved. The dossier asks for hidden-or-explicit-no-access and the question is Unreviewed (Still needs sign-off, item 5). Until ruled, the server behaviour is fixed (403) and only the client treatment is open.
- **Donor names:** API 3 returns donor-identifying data. Whether the drill needs a stricter right than the summary is part of the same entitlement ruling.

---

## Edge cases

1. Over-received pledge or campaign: `dueRemaining` goes negative and `percentDue` goes negative; both are served signed and rendered as favourable. A campaign's `received` can exceed its `pledgeTotal`.
2. No goal (`HasGoal` false or no GF_Campaign mapping): `goal` and `progressPercent` are `null`; the client shows "n/a" / "no goal set" and the no-goal band.
3. `pledgeDue = 0` (all terms begin after `rangeEnd`): `percentDue` is `null`, never a division error.
4. `totals.goal = 0` across the filtered set: `totals.progressPercent` is `null`; Glance shows its no-goal-set headline.
5. A purpose with active pledges and zero gifts: row present, `received: 0`.
6. A purpose with gifts but no active pledge rows: excluded by the purpose-list rule (active purposes with pledge activity); whether such orphaned gift purposes should surface at all is part of the Received-basis ruling (Still needs sign-off, item 1).
7. Gift lines with `PledgeID = null`: excluded from every Received figure by definition; they never leak in under any filter.
8. `rangeEnd` before every pledge term: rows render with zero due and zero received; the drill still lists pledges, all not-yet-due.
9. Pagination past the last page: empty `pledges[]`, correct `totalCount`, `behindCount` and `summary`, HTTP 200.
10. `behindOnly=true` with nothing behind: empty page, `behindCount: 0`, full `summary`; the modal shows its none-behind message.
11. Pledge deleted or purpose deactivated between calls: API 3/4 return 404 for the stale id; API 1 with a stale `purposeId` returns the empty shape; the client resets to All Campaigns when the refreshed lookup lacks the selection.
12. A closed campaign (`isClosed: true`): still returned and still counted in `totals`; the client badges it. Whether closed campaigns should ever be excluded is not in this contract and would be a new param.
13. Duplicate `dueRemaining` values across pledges: the `pledgeId` tiebreaker keeps pages stable, no skipped or duplicated rows.
14. Two pledges from the same donor to the same campaign: two rows, keyed by `pledgeId`; the drill never merges by donor.

---

## Not in scope

- **Any write action.** Export is the widget's only action, a standing design constraint; approve/post/write-off style verbs must not be added without a demonstrated user need.
- **Donut by Campaign view.** Retired from the design; no API serves it and `received` shares need no extra fields.
- **Navigation to the Gifts and Pledges module.** The modal's "Open in Gifts and Pledges" control is a stub with no backend ask; if it ships it is a client-side route, not an API (Still needs sign-off, item 6).
- **Start-date windowing.** The range start is chip display only; no figure is windowed by it. A Remittance-style windowed-receipts figure would be new work and a new field, currently unrequested for this widget.
- **Behind-pace exception framing** (shortfall headline, pace cards): that is the Remittance Pledges contract's territory; this widget owns goal progress.
- **Fiscal year filter.** The widget has no fiscal-year dimension.
- **User-selectable sort** anywhere: summary order is fixed server-side, bar order is a fixed client sort, the drill order is fixed most-behind-first. Export is the path to re-orderable data.
- **A data-freshness timestamp.** Requested in the dossier, Unreviewed, and not yet in the design; if adopted, the `asOf` echo already carries the anchor and a `generatedAt` stamp would be the addition.

---

## Still needs sign-off

1. **Received basis (load-bearing).** Undecided between the built basis (pledge-linked gift lines only, per the standing owner decision recorded in Step 4) and the Modern API's live basis (ALL posted gift detail for the purpose; the parallel campaign DTO's TotalRaised likewise counts all posted gifts) [DOC - both comparison files vs Step 4]. The two disagree whenever unpledged one-off gifts exist. Deciders: project owner (product intent) plus backend team (which query ships). Blocked until then: every `received`, `dueRemaining`, `percentDue`, `progressPercent` and `totals` figure - which is to say API 1, API 3, API 4's totals and API 5.
2. **Goal source and keying.** The Goal lives on the modern `GF_Campaign` model; the widget keys by `GF_Purpose`. Whether campaign rows map 1:1 to purposes, what happens when they do not, and where `isClosed` truly lives are [TO CONFIRM - backend team]. Blocked: `goal`, `progressPercent`, `isClosed` on APIs 1, 2 and 3. The build renders Goal as if real under Rule 11; this spec inherits that posture, not a verified source.
3. **Goal-met status naming.** The Widget_Comparison_New_Widgets doc records the modern ProgressStatus enum's goal-met value as "red (goal met)", while the build and Step 4 treat goal-met as the positive end of the scale [DOC vs BUILD/DOC]. This contract sidesteps the enum by serving raw `progressPercent` and banding client-side, but backend must confirm ProgressStatus is genuinely presentation-only and safe to ignore, or the enum's semantics get imported by accident. Decider: backend team. Blocked: nothing in this contract, provided raw numbers ship.
4. **Percent Due definition, doc-internal inconsistency.** The Step 4 doc simultaneously carries (a) a Data Contract CONFLICT row saying the definition is disputed and blocking, (b) a readiness note declaring it RESOLVED with live numeric proof, and (c) the build computing `dueRemaining / pledgeDue`. This contract follows the build and the live proof; the doc's CONFLICT row is recorded here, not collapsed. Decider: project owner (reconcile the Step 4 doc). Blocked: nothing technically; the doc must stop disagreeing with itself before sign-off.
5. **Dossier findings, all Unreviewed** (no reconciliation file exists for this widget): (a) relabel "% Due" to "% Fulfilled" and lead with fulfillment - the build kept Percent Due; (b) a data-as-of timestamp by the refresh control - not built; (c) the live legacy widget renders a fixed pound-sign currency regardless of org locale, a recorded localisation defect - currency/locale rules for the rebuild are unspecified; (d) entitlement/empty behaviour when the module is not adopted. Decider: project owner to status each (Accepted / Rejected / Disputed). Blocked: final column labels, any freshness stamp, the currency formatting rule, and the no-rights client treatment.
6. **"Open in Gifts and Pledges" vs the export-only constraint.** The modal footer stub predates the export-only ruling and may contradict it [TO CONFIRM - Oisin]. Blocked: nothing in this contract (no API is allocated); the decision only adds or removes a client route.
7. **Legacy grid row order.** The summary must render in the live product's order; the exact ORDER BY is [TO CONFIRM - backend team]. Blocked: the deterministic-order clause of API 1.
8. **Volume ceilings.** Campaigns per org, pledges per campaign, gifts per pledge [TO CONFIRM - backend team]. Blocked: the BOUNDED verdicts on APIs 1, 2 and 4; if campaigns exceed ~500 the summary paginates and the view toggle moves server-side.
9. **`pageSize` maximum of 100 on API 3** is a defaulted value, not an owner decision. Decider: project owner. Blocked: nothing; the default stands until changed.
10. **GF_Pledge term/frequency/installment column names and semantics** behind the Pledge Due proration are unverified in code [TO CONFIRM - backend team]. Blocked: the proration implementation of APIs 1 and 3 (the formula itself is fixed by the design).
