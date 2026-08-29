# Remittance Pledges — API Spec

**Status: DRAFT — not final** *(reopened 2026-08-24: the v3.0/v3.1/v3.2 widget rebuild changed the time-selection contract, added two response fields and added a third API. It was "Complete at Step 5 — awaiting management sign-off" from 2026-08-19; that applied to the v2.x design and no longer describes this document.)*

## Overview

The Remittance Pledges widget shows which remittance pledges are **not arriving as expected**, and by how much. (Goal-progress framing belongs to W17 Gifts & Pledges; see "Why v3 changed this spec" below.) It needs three backend calls:

1. **Dashboard API** (what the widget shows on screen): one call returning a per-activity pacing summary (pledged, expected, paid, outstanding, percent paid) for every active pledge at a chosen date.
2. **Activity Payment History API** (the "more information" popup): one call for a single activity returning its summary tiles plus the individual receipts (date, reference, amount, status) that make up its paid figure.
3. **Pledge Payment Schedule API** (added by v3.1, see below): one call for a single pledge returning its instalment schedule and which scheduled payments were received, part-received or **skipped**.

All three are read-only. **Time selection changed in v3.2 (2026-08-24) from a single date to a date RANGE** — see "Why v3 changed this spec" immediately below for the reason and the exact consequences. There is still no month preset, no fiscal-year filter, and no activity-type filter on any contract.

---

## Why v3 changed this spec (2026-08-24)

This spec was written against the v2.x design. Three things happened on 2026-08-24 that change the backend contract, and a developer reading the sections below needs the reason as much as the shape.

**Driver 1 — the two widgets were splitting the same data two ways.** W04 Remittance Pledges and W17 Gifts & Pledges read near-identical data and had drifted into looking like the same widget. The project owner separated them by **role**: W04 now answers *"which pledges are not arriving as expected, and by how much"*; W17 answers *"how are we tracking against goal"*. Consequences for this API are mostly **absence** of new work — the exception framing (grouping rows into behind / on track / no-pledge, ranking by shortfall, headlining the money short) is all computable from fields this contract already returns. **No new field is needed for the repositioning itself.** One thing does need saying out loud, because a naive implementation gets it wrong: see "Aggregate shortfall" below.

**Driver 2 — an SME correction to what the date control means.** Edward Eoff, 2026-08-10 (recorded in `Step 2 - Feedback/Edward Eoff Interview - Tagged Q&A by Widget (2026-08-10).md`, Tag: W04). Two findings bear directly on this contract:

- The legacy "Date Receipts Through" is not an open-ended cutoff. Verified live during the call: it is **1 January of that year through the selected date** — "it's just assuming a 1/1 to 8/1 date range." So the single-date model in the v2 spec was already an incomplete description of the real behaviour.
- The window does **two jobs**, not one: it selects **which pledges are in scope** ("the pledge is what dictates which activities display") and it bounds **which receipts count**. Edward's preferred enhancement was to let the user set both ends explicitly: "that way they're just in full control over it. And that way we don't have to assume anything or look at anything."
- **Terminology instruction, unprompted:** never label this control "fiscal". "That makes people think about their general Ledger fiscal years. And this has nothing to do with the general Ledger fiscal year." Use *pledge year to date* or *calendar year to date*.

**Driver 3 — the owner asked for skipped-payment visibility.** Clicking a pledge should show that donor's own history: what they pledged, what they paid, and *which scheduled payment they missed*. That is a genuinely new capability and gets its own API below.

### The one trap: do NOT window-bound `paid`

The frontend build made this mistake first and it is worth recording so the backend does not repeat it. Scoping `paid` to the window while `expected` stayed cumulative to the pledge's own `BeginDate` made every pledge read as catastrophically behind under a short window (a $37,085 shortfall against $13,090 for the same data on a year window). That is a false reading, not an insight, because it compares a windowed numerator against a cumulative denominator.

**Rule for this contract: pacing is inherently cumulative.** `expected`, `paid`, `outstanding`, `pctPaid` and `daysAhead` are all measured from each pledge's `BeginDate` to `rangeEnd` and **ignore `rangeStart` entirely**. `rangeStart` affects exactly two things: the new `windowPaid` field, and which pledges are in scope. Keeping those separate is what makes the range's two jobs coexist without corrupting the maths.

### Aggregate shortfall: sum per row, never net

The widget's headline figure is the behind-pace shortfall in money. If the API ever offers a grand-total shortfall, it must be **the sum of per-row positive shortfalls**, `SUM(GREATEST(0, expected - paid))`, not `GREATEST(0, SUM(expected) - SUM(paid))`. The netted version lets a pledge running ahead mask one running behind, which defeats the entire purpose of an exception widget. On the seeded reference data the two differ: $8,268 summed per row versus a smaller netted figure. The frontend computes this itself today, so this is guidance for any future server-side total, not a required field.

## Data model (all three APIs)

Every field in this spec is classified as **stored** (read from a named column) or **derived** (computed, not stored). The column mappings were confirmed against the code (LLBLGen `[Column(...)]` entity mappings plus the `RMActivityRepository`/`RMHistoryDetailRepository` queries); the two companion documents in this folder hold the line-by-line provenance.

| Table | Fields used | Notes |
|---|---|---|
| `RM_Activity` | `ActivityID` (stable key), `Name` (label), `Sequence` (row order), `CompanyID` (scope) | Names are org-editable, so `ActivityID` is the key, not the name |
| `RM_Pledge` | `PledgeID`, `ActivityID`, `BeginDate` (date NOT NULL), `EndDate` (date NOT NULL), `Frequency` (payments/year: 2,4,6,12,24,26,52), `Duration` (payment periods in term) | The pledge term. Default term is `BeginDate` to `BeginDate + 1 year - 1 day`, but any `EndDate` can be set (e.g. a multi-year campaign) |
| `RM_PledgeDetail` | `Pledge` (money) | `SUM(RM_PledgeDetail.Pledge)` grouped by `ActivityID` is the activity's total pledged |
| `RM_HistoryBatch` | `Posted` (bit), `Online` (bit), `CompanyID` | A receipt counts toward paid only when `Posted = 1`. `Online` marks online/ACH-style batches |
| `RM_History` | `HistoryID`, `HistoryBatchID`, `ChurchID`, `CheckDate` (date), `CheckNumber` (nvarchar(15), free text), `Amount` (whole-check total), `VoidJournalID` (null = live, set = reversed), `Note`, `TransactionNumber` | Receipt header. `CheckDate`, `CheckNumber` and the void/batch flags drive the popup |
| `RM_HistoryDetail` | `HistoryDetailID`, `HistoryID`, `ActivityID`, `Amount` (money) | The **per-activity** portion of a receipt. This is the amount that is summed and listed, NOT `RM_History.Amount` (the whole check) |
| `RM_PledgePercent` | `ActivityID`, `Percent` (real), `StartDate` (date) | A per-activity, per-date **scheduled** expected-percentage, configured under Remittance -> Company Preferences -> Pledge Percent Grid. It is the only stored pacing schedule in the system. **Not used by the widget today** (see Still needs sign-off) |

**Freshness / scoping note.** The current read is company-scoped and backed by a file cache (`RMWidgetRecord`) invalidated on a company change. Any implementation must keep that company-change invalidation so a switch never serves another company's figures.

---

# API 1: Dashboard (widget summary)

Returns one row per active pledge activity for the company, paced to `receiptsThrough`. This is everything the widget renders on the dashboard card.

```
GET /api/dashboard/remittance-pledges/data
```

### Parameters

**[v3.2 — 2026-08-24] `receiptsThrough` is replaced by a two-ended range.** Reason: driver 2 above. The old single parameter is kept as a documented alias for one release so existing callers do not break.

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `rangeEnd` | date | no | today (server date) | **The pacing anchor** — exactly what `receiptsThrough` was. Payments with a check date on or before this count toward `paid`; `expected` is paced to this date. Every pacing figure is driven by this and this alone |
| `rangeStart` | date | no | 1 January of `rangeEnd`'s calendar year | **The window opener.** Does NOT affect pacing. Two effects only: (1) it lower-bounds the new `windowPaid` field, and (2) it decides which pledges are in scope, via the overlap rule below. The default reproduces the legacy behaviour Edward verified live (1 Jan through the selected date), so omitting it gives today's numbers |
| `receiptsThrough` | date | no | — | **Deprecated alias.** If supplied, treat as `rangeEnd` with `rangeStart` defaulting as above. Log and remove once callers have migrated |

**Never surface this control to a user as "fiscal" anything** (SME instruction, Edward Eoff 2026-08-10). Acceptable labels: "pledge year to date", "calendar year to date", or plain from/to dates.

#### Pledge-in-scope rule (new, v3.2)

A pledge is in scope when **its own term overlaps the window**:

```
BeginDate <= rangeEnd  AND  EndDate >= rangeStart
```

This replaces the v2 filter `BeginDate <= receiptsThrough AND EndDate >= receiptsThrough`, which tested a single instant and is why an ended-but-unpaid pledge silently dropped off (previously flagged in Still needs sign-off, and **now partly resolved**: with a range, a pledge that ended inside the window stays visible). It implements Edward's "the pledge is what dictates which activities display".

An activity that fails this rule but still has receipts inside the window is a **receipts-only row** — see the new `hasPledgeInRange` field and the API 1 edge cases.

### Response schema

A flat list, one row per active pledge activity, no envelope. Grand totals are client-side sums.

| Field | Stored / Derived | Source or formula |
|---|---|---|
| `activityId` | stored | `RM_Activity.ActivityID` |
| `activityName` | stored | `RM_Activity.Name` |
| `sequence` | stored | `RM_Activity.Sequence` |
| `pledged` | stored (aggregate) | `SUM(RM_PledgeDetail.Pledge)` grouped by `ActivityID` |
| `paid` | stored (conditional aggregate) | `SUM(RM_HistoryDetail.Amount)` where `RM_HistoryBatch.Posted = 1` AND `RM_History.VoidJournalID IS NULL` AND `RM_History.CheckDate <= rangeEnd`. **Cumulative — no lower bound. Do not apply `rangeStart` here** (see "the one trap" above) |
| `windowPaid` | stored (conditional aggregate) | **[v3.2 — new]** Same predicate as `paid` plus `RM_History.CheckDate >= rangeStart`. The "receipts that arrived inside the selected window" figure — the second of the range's two jobs. Always `<= paid` |
| `hasPledgeInRange` | derived (boolean) | **[v3.2 — new]** True when the activity has at least one pledge whose term overlaps the window (`BeginDate <= rangeEnd AND EndDate >= rangeStart`). When false, the frontend suppresses all pacing for that row and shows it as receipts-only; `pledged`, `expected`, `outstanding`, `pctPaid` and `daysAhead` should all be returned as `0`/`null` accordingly |
| `beginDate` | stored | `RM_Pledge.BeginDate` |
| `endDate` | stored | `RM_Pledge.EndDate` |
| `expected` | derived | per-term pacing formula below |
| `outstanding` | derived | `max(0, pledged - paid)` |
| `pctPaid` | derived | `paid / pledged` (null when `pledged = 0`) |
| `termDays` | derived | `endDate - beginDate` in days |
| `daysElapsed` | derived | `clamp(receiptsThrough - beginDate, 0, termDays)` |
| `daysAhead` | derived | `(paid / pledged) * termDays - daysElapsed` (null when `pledged = 0`) |

### The pacing calculation (derived, not stored)

```
termDays    = EndDate - BeginDate                       (days)
daysElapsed = clamp(receiptsThrough - BeginDate, 0, termDays)
expected    = pledged * daysElapsed / termDays
outstanding = max(0, pledged - paid)
pctPaid     = paid / pledged                            (null when pledged = 0)
daysAhead   = (paid / pledged) * termDays - daysElapsed
```

Properties, all from one formula with no special cases:

- **Mid-term start:** paces from the pledge's own `BeginDate`, a fraction of its own term, never of the calendar year.
- **Multi-year term:** a 3-year campaign uses `termDays` of about 1095, so one year in reads about one third expected.
- **Before the term** (`receiptsThrough < BeginDate`): `daysElapsed = 0`, so `expected = 0`.
- **After the term** (`receiptsThrough > EndDate`): `daysElapsed` clamps to `termDays`, so `expected = pledged` (100%).

`daysAhead` is returned raw. The status band the widget colours by (dark green "30+ days ahead", green "On track", amber "About a month behind", red "60+ days behind", plus paid-in-full and no-pledge) is a **frontend** concern applied to `daysAhead` at thresholds +30, -30, -60. The API does not return a band string.

### Example (rangeEnd 2026-07-31, rangeStart defaulting to 2026-01-01)

```
GET /api/dashboard/remittance-pledges/data?rangeStart=2026-01-01&rangeEnd=2026-07-31
```

```json
[
  { "activityId": "a1e0c7d2-1111-4a01-9f01-0b1c2d3e4f01", "activityName": "General Fund Apportionment", "sequence": 1, "pledged": 24000, "expected": 13912, "paid": 7200,  "outstanding": 16800, "pctPaid": 0.300, "beginDate": "2026-01-01", "endDate": "2026-12-31", "termDays": 364,  "daysElapsed": 211, "daysAhead": -101.8 },
  { "activityId": "a1e0c7d2-4444-4a04-9f04-0b1c2d3e4f04", "activityName": "Outreach and Benevolence",   "sequence": 4, "pledged": 9000,  "expected": 5217,  "paid": 6300,  "outstanding": 2700,  "pctPaid": 0.700, "beginDate": "2026-01-01", "endDate": "2026-12-31", "termDays": 364,  "daysElapsed": 211, "daysAhead": 43.8 },
  { "activityId": "a1e0c7d2-5555-4a05-9f05-0b1c2d3e4f05", "activityName": "Capital Campaign Pledge",     "sequence": 5, "pledged": 30000, "expected": 10822, "paid": 11000, "outstanding": 19000, "pctPaid": 0.367, "beginDate": "2025-07-01", "endDate": "2028-06-30", "termDays": 1095, "daysElapsed": 395, "daysAhead": 6.5 },
  { "activityId": "a1e0c7d2-6666-4a06-9f06-0b1c2d3e4f06", "activityName": "Youth Ministry Fund",         "sequence": 6, "pledged": 0,     "expected": 0,     "paid": 500,   "outstanding": 0,     "pctPaid": null,  "beginDate": "2026-01-01", "endDate": "2026-12-31", "termDays": 364,  "daysElapsed": 211, "daysAhead": null }
]
```

Row check (General Fund Apportionment): `expected = 24000 * 211 / 364 = 13912`; `daysAhead = (7200 / 24000) * 364 - 211 = 109.2 - 211 = -101.8`, which the frontend bands "60+ days behind". Mock amounts illustrate the shapes and the reconciling arithmetic; the amounts are not the contract.

### What the frontend derives, so the API does not have to

Recorded so nobody builds these server-side by mistake. All three are computed from fields above:

- **Row grouping** (Behind pace / On track / No pledge in this range). Behind when `expected - paid > 0` and `hasPledgeInRange`; on track when `paid >= expected`; no-pledge when `hasPledgeInRange` is false. Same rule the aggregate `status` already used.
- **Status bands** (30+ days ahead / On track / About a month behind / 60+ days behind) applied to raw `daysAhead` at +30, -30, -60. Unchanged from v2.
- **Ordering** — worst shortfall first inside the behind group.

### API 1 edge cases

1. **No pledge set** (activity exists, no active pledge amount): `pledged = 0`, `pctPaid = null`, `daysAhead = null`; frontend renders a neutral "No pledge" row. Payments recorded against it still appear in `paid` at the grand-total level.
1b. **[v3.2 — NEW, and this one needs a new query path] Receipts inside the window but no pledge overlapping it.** `hasPledgeInRange = false`, all pacing fields null/zero, `windowPaid` populated. **This is not currently possible.** Edward Eoff tested it live on 2026-08-10 — entering and posting a receipt against no pledge — and reported: the widget "is not going to show anything at all unless [a] pledge exists", because `paid` is reached by walking each in-scope pledge's linked receipts (`RMActivityRepository.GetWidgetData`). Serving receipts *without* a pledge join is therefore a **new API capability, not a query tweak**: the activity list would need to be the union of (activities with an in-scope pledge) and (activities with a posted, non-void receipt inside the window). Tracked as a blocking open item.
2. **Voided or unposted payments:** excluded from `paid` (`Posted = 1 AND VoidJournalID IS NULL`).
3. **Company change:** the `RMWidgetRecord` cache is invalidated so figures never carry across a company switch.
4. **Ended-but-unpaid pledges:** see Still needs sign-off, item on active-pledge inclusion.

---

# API 2: Activity Payment History (the "more information" popup)

Opened from a dashboard row, this returns everything the popup shows for one activity: the summary tiles at the top, plus the individual receipts that make up the paid figure.

```
GET /api/dashboard/remittance-pledges/activity/{activityId}/payments
```

### Parameters

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `activityId` | guid (path) | yes | | `RM_Activity.ActivityID` |
| `receiptsThrough` | date (query) | no | today | Same cutoff and pacing anchor as API 1; the receipt list and paid figure include only checks dated on or before this |

### Response schema

```json
{
  "activityId": "a1e0c7d2-1111-4a01-9f01-0b1c2d3e4f01",
  "activityName": "General Fund Apportionment",
  "pledged": 24000,
  "expected": 13912,
  "paid": 7200,
  "outstanding": 16800,
  "pctPaid": 0.300,
  "beginDate": "2026-01-01",
  "endDate": "2026-12-31",
  "termDays": 364,
  "daysElapsed": 211,
  "daysAhead": -101.8,
  "receiptsThrough": "2026-07-31",
  "receiptCount": 3,
  "receipts": [
    { "date": "2026-03-16", "reference": "ACH",        "amount": 2400, "status": "Posted" },
    { "date": "2026-02-15", "reference": "Check 4118", "amount": 2400, "status": "Posted" },
    { "date": "2026-01-15", "reference": "Check 4102", "amount": 2400, "status": "Posted" }
  ]
}
```

### Field sources (popup)

Summary block (top tiles), same values and same stored/derived split as an API 1 row:

| Field | Stored / Derived | Source or formula |
|---|---|---|
| `activityName` | stored | `RM_Activity.Name` |
| `pledged` ("Total pledge") | stored (aggregate) | `SUM(RM_PledgeDetail.Pledge)` |
| `paid` ("Paid to date") | stored (conditional aggregate) | `SUM(RM_HistoryDetail.Amount)` where posted, non-void, `CheckDate <= receiptsThrough` |
| `beginDate` / `endDate` ("Pledge term") | stored | `RM_Pledge.BeginDate` / `RM_Pledge.EndDate` |
| `expected` ("Expected by now") | derived | pacing formula (API 1) |
| `outstanding` | derived | `max(0, pledged - paid)` |
| `pctPaid` ("% Paid") | derived | `paid / pledged` |
| `daysAhead` and the status pill / "days behind" narrative | derived | from `daysAhead`; the pill text and the "N days behind / $X behind pace" sentence are computed on the client and are not stored anywhere |
| `receiptCount` ("3 receipts") | derived | count of the qualifying `receipts` rows |

Receipts list: one row per `RM_HistoryDetail` for the activity, joined to its `RM_History` and `RM_HistoryBatch`:

| Field | Stored / Derived | Source |
|---|---|---|
| `date` | stored | `RM_History.CheckDate` |
| `reference` | stored | `RM_History.CheckNumber` (free text, nvarchar(15); real values include a check number, "ONLINE", or any string. There is no enumerated type. The "ACH" and "Check 4118" values in the mock are illustrative strings) |
| `amount` | stored | `RM_HistoryDetail.Amount` (the per-activity portion, NOT `RM_History.Amount` which is the whole check) |
| `status` | derived from stored flags | `RM_History.VoidJournalID IS NOT NULL` -> "Voided"; else `RM_HistoryBatch.Posted = 1` -> "Posted"; else `RM_HistoryBatch.Online = 1` -> "Online (pending)"; else "Unposted" |

### Reference SQL

The drill-down is one `RM_HistoryDetail` row per payment, joined to its header and batch. There is already an inquiry method for this shape in the code (`RMHistoryDetailRepository.GetAllForInquiry`), which filters to posted, non-void detail rows for an activity and orders by `CheckDate`.

Receipts list (all statuses, for the popup):

```sql
SELECT
    h.CheckDate    AS [Date],
    h.CheckNumber  AS [Reference],
    hd.Amount      AS [Amount],
    CASE
        WHEN h.VoidJournalID IS NOT NULL THEN 'Voided'
        WHEN b.Posted = 1                THEN 'Posted'
        WHEN b.Online = 1                THEN 'Online (pending)'
        ELSE 'Unposted'
    END            AS [Status]
FROM RM_HistoryDetail hd
JOIN RM_History      h ON h.HistoryID      = hd.HistoryID
JOIN RM_HistoryBatch b ON b.HistoryBatchID = h.HistoryBatchID
WHERE hd.ActivityID = @ActivityID
  AND b.CompanyID   = @CompanyID
  AND (@ReceiptsThru IS NULL OR h.CheckDate <= @ReceiptsThru)
ORDER BY h.CheckDate DESC, hd.HistoryDetailID;
```

Paid-to-date total (the subset that counts toward `paid`, matching API 1):

```sql
SELECT ISNULL(SUM(hd.Amount), 0) AS Paid
FROM RM_HistoryDetail hd
JOIN RM_History      h ON h.HistoryID      = hd.HistoryID
JOIN RM_HistoryBatch b ON b.HistoryBatchID = h.HistoryBatchID
WHERE hd.ActivityID = @ActivityID
  AND b.CompanyID   = @CompanyID
  AND b.Posted      = 1
  AND h.VoidJournalID IS NULL
  AND h.CheckDate  <= @ReceiptsThru;
```

### API 2 edge cases

1. **No receipts yet:** `receipts` is empty, `receiptCount = 0`, `paid = 0`. The popup shows the summary tiles with an empty list.
2. **A voided or online (not-yet-posted) receipt:** it appears in `receipts` with `status` "Voided" / "Online (pending)" so the reviewer sees it, but it does NOT count toward `paid` (only Posted + non-void do). This is the one place the list total and `paid` can differ; keep the list showing all statuses and `paid` counting only the posted, non-void ones.
3. **Whole-check split across activities:** one `RM_History` (check) can have several `RM_HistoryDetail` rows for different activities. The popup lists only the detail rows for this activity, so a receipt's listed `amount` is the portion applied here, which can be less than the check's total (`RM_History.Amount`).
4. **`receiptsThrough` earlier than a payment:** payments dated after it drop out of both `receipts` and `paid`, and `expected` re-paces to the earlier date, exactly like API 1.

---

# API 3: Pledge Payment Schedule (new, v3.1 — the skipped-payment drill)

**Why this exists (driver 3).** The widget's third drill level answers, for one donor's pledge: what did they commit to, which scheduled payments arrived, and **which one did they skip**. On an exception widget that is the payload — a shortfall figure tells you *that* someone is behind, this tells you *when they stopped paying*.

```
GET /api/dashboard/remittance-pledges/pledge/{pledgeId}/schedule
```

### Parameters

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `pledgeId` | guid (path) | yes | — | `RM_Pledge.PledgeID` |
| `rangeEnd` | date | no | today | The as-of date. An instalment due on or before this and still unfunded is **missed**; after it, **not due yet** |

### Response schema

| Field | Stored / Derived | Source or formula |
|---|---|---|
| `pledgeId` | stored | `RM_Pledge.PledgeID` |
| `payerName` | stored | `CorePerson.DisplayNameLastFirst` via `RM_History.ChurchID` (the legacy screen's "Name" column) |
| `pledged` | stored | that pledge's `RM_PledgeDetail.Pledge` |
| `beginDate` / `endDate` | stored | `RM_Pledge.BeginDate` / `EndDate` |
| `frequency` | stored | `RM_Pledge.Frequency` (payments per year: 2, 4, 6, 12, 24, 26, 52) |
| `duration` | stored | `RM_Pledge.Duration` (payment periods in the term) |
| `paid` | stored (conditional aggregate) | that pledge's linked receipts, same posted/non-void predicate as API 1, `CheckDate <= rangeEnd` |
| `instalments[]` | **derived** | one row per scheduled payment, see the algorithm below |
| `instalments[].dueDate` | derived | `BeginDate + (n * 12 / frequency)` months, clamped to `endDate` |
| `instalments[].amountDue` | derived | `pledged / duration` (last instalment absorbs the rounding remainder) |
| `instalments[].amountApplied` | derived | oldest-first allocation of `paid`, see below |
| `instalments[].status` | derived | `paid` / `part` / `missed` / `upcoming` |
| `firstMissedDate` | derived | earliest `dueDate` with status `missed`, null if none |
| `missedCount`, `missedAmount` | derived | count and value of missed plus the unfunded portion of any `part` |

### The allocation algorithm (this is the whole feature)

```
n            = duration                       (number of instalments)
amountDue[i] = pledged / n                    (last absorbs the remainder)
dueDate[i]   = BeginDate + i * (12 / frequency) months, clamped to EndDate

remaining = paid
for i in 0..n-1:
    applied[i] = min(amountDue[i], remaining)
    remaining -= applied[i]
    status[i] = applied[i] >= amountDue[i]        -> "paid"
              : applied[i] > 0                    -> "part"
              : dueDate[i] <= rangeEnd            -> "missed"
              : otherwise                         -> "upcoming"
```

**Receipts are applied OLDEST FIRST.** That is what makes a gap legible: the earliest unfunded instalment is the skipped payment, and everything after it is unfunded too. A property worth asserting in tests — no funded instalment may ever appear *after* an unfunded due one.

### Example

```
GET /api/dashboard/remittance-pledges/pledge/8f3.../schedule?rangeEnd=2026-07-31
```

Pledge of $683 over Mar 2025 to Feb 2026, monthly, $238 received:

| Due date | Amount due | Received | Status |
|---|---|---|---|
| 2025-03-01 … 2025-06-01 | $57 each | $57 each | paid |
| 2025-07-01 | $57 | $10 | part |
| 2025-08-01 | $57 | — | **missed** |
| 2025-09-01 … 2026-02-01 | $57 each | — | **missed** / upcoming |

`firstMissedDate = 2025-08-01`, `missedCount = 7`, `missedAmount = $445`. Amounts illustrate the shape and the reconciling arithmetic; they are not the contract.

### This makes an existing open item load-bearing

The v2 spec already flagged an open question: is `expected` **linear-by-days** (as built) or **stepped by `Frequency`/`Duration`**, and should the org's stored `RM_PledgePercent` schedule drive it instead?

That was optional while nothing consumed a schedule. **It is not optional now.** A skipped payment only exists if there are discrete scheduled payments to skip, so API 3 needs the stepped model. Two consequences:

1. If the answer is "stepped", then API 1's `expected` and API 3's schedule should be derived from the **same** definition, or the activity row and the drill will disagree with each other. That is the failure mode the frontend already hit once (the drill reconciling to a different anchor than its parent row).
2. If the org has configured `RM_PledgePercent`, that stored schedule should almost certainly win over a computed one — it is the only stored pacing schedule in the system, and it is currently read by nothing.

### API 3 edge cases

1. **`duration` or `frequency` missing/zero:** fall back to a single instalment for the full pledge due at `endDate`. Do not divide by zero.
2. **Over-received pledge** (`paid > pledged`): every instalment is `paid`, the surplus is not allocated anywhere. The frontend shows it as paid in full.
3. **Term ended, still unpaid:** every instalment is due, so the unfunded ones are all `missed` — which is the case an outstanding widget most needs to show, and the one the v2 single-instant pledge filter used to hide.
4. **Per-pledge receipt dates.** The schedule above needs each pledge's own receipts. API 2 currently returns receipts at **activity** level. Either API 2 gains a `pledgeId` on each receipt row, or API 3 returns its own receipt list. Flagged below.

## Not in scope

- **No personal or payer data.** Neither API returns donor, member, church, or payer identity. The receipts list is date, reference, amount, and status only.
- **No comparison or prior period,** no month presets, no fiscal-year filter, no activity-type filter. **[v3.2]** The one time control is now the `rangeStart`/`rangeEnd` pair, and it must never be labelled "fiscal".
- **[v3.2] No server-side grouping, banding or ordering.** The behind/on-track/no-pledge split, the day-based status bands and the worst-first ordering are all frontend concerns computed from the returned numbers.

## Still needs sign-off

### Added by v3.0–v3.2 (2026-08-24)

- **[BLOCKING for that mode] Receipts-only rows need a new query path.** Serving an activity that has receipts inside the window but no overlapping pledge is not possible today — Edward Eoff verified live on 2026-08-10 that the widget shows nothing without a pledge, because `paid` is reached by walking each pledge's linked receipts. This needs the activity list to become a union of pledge-backed and receipt-backed activities. Until it exists, `hasPledgeInRange` will always be true and the receipts-only mode is forward design. **Owner decision pending:** accept as a known risk and ship the mode as design intent, or drop the mode and match today's backend exactly.
- **Stepped vs linear `expected`, now load-bearing rather than academic.** See "This makes an existing open item load-bearing" under API 3. API 1 and API 3 must share one definition or the drill will contradict its parent row.
- **Per-pledge receipt rows.** API 3's schedule needs receipts attributable to a single pledge. Today API 2 returns them at activity level. Decide: add `pledgeId` to API 2's receipt rows, or give API 3 its own list.
- **Per-pledge `Frequency`/`Duration` confirmation.** The schedule assumes each pledge carries its own frequency and instalment count. `RM_Pledge` has both columns, but the frontend mock currently derives frequency from the *activity*, and per-pledge instalment counts have not been confirmed for **remittance** pledges (they are confirmed for GF pledges via `GFPledge.PledgeDue`). Confirm before the instalment dates shown to users are treated as real rather than illustrative.
- **Pledge volume.** Edward warned one activity may carry roughly **500 to 800 pledges**, so any pledge-list response needs paging (the frontend pages at 20). ⚠️ That figure is reconstructed from a garbled transcript line ("508 hundred") and should be confirmed with him before it is used to size anything.
- **Server-side grand totals, if ever added:** a total shortfall must be `SUM(GREATEST(0, expected - paid))`, never the netted form. See "Aggregate shortfall" in the v3 section.

### Carried from v2 (still open)

- **Expected pacing definition.** The pacing figure (`expected`, `daysAhead`, the status pill, the "% of term elapsed" and "days behind" text) is **derived, not stored**. It is currently defined as linear-by-days over each pledge's own term. Two open points: (a) linear-by-days vs stepped-by-payment-schedule using `RM_Pledge.Frequency`/`Duration` (a stepped curve steps up on each scheduled payment date rather than accruing continuously); and (b) whether the org's configured schedule in `RM_PledgePercent` (`Percent` by `StartDate`) should drive expected instead of a computed proportion. `RM_PledgePercent` is the only stored pacing schedule in the system and is not read by the widget today. Confirm which definition is intended; the data supports any of the three.
- **"Current status" of an activity.** Two different meanings exist: the payment-level status per receipt (Posted / Online / Voided / Unposted, stored via the batch/void flags) which API 2 returns, and the pacing status (on track / behind / paid-in-full) which is derived. Neither is a single stored "activity status" column.
- **`receiptsThrough` default.** Confirm the server default is today and that the End of last month preset resolves on the client.
- **Export.** No export endpoint exists in the modern API. Decide client-side generation vs a server endpoint.
- **Active-pledge inclusion at a date.** The live filter is `BeginDate <= receiptsThrough AND EndDate >= receiptsThrough` with NO `Active`-flag check, and it EXCLUDES pledges whose term has already ended even if they still owe (confirmed in `RMActivityRepository.GetWidgetData`). On an outstanding/pacing widget an ended-but-unpaid pledge silently drops off; confirm with SME whether that is intended. **[v3.2 — partly addressed]** The new overlap rule (`BeginDate <= rangeEnd AND EndDate >= rangeStart`) keeps a pledge visible if its term ended anywhere inside the window, so the drop-off is narrower than it was. A pledge that ended *before* `rangeStart` and still owes is still excluded, so the underlying SME question stands.
- **`receiptsThrough` deprecation window.** How long the alias stays before removal, and whether any caller outside this widget uses it.
