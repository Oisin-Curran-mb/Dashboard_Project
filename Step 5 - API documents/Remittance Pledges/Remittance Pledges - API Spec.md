# Remittance Pledges — API Spec

**Status: DRAFT — not final**

## Overview

The Remittance Pledges widget shows how well an organisation is keeping up with its remittance pledge commitments. It needs two backend calls:

1. **Dashboard API** (what the widget shows on screen): one call returning a per-activity pacing summary (pledged, expected, paid, outstanding, percent paid) for every active pledge at a chosen date.
2. **Activity Payment History API** (the "more information" popup): one call for a single activity returning its summary tiles plus the individual receipts (date, reference, amount, status) that make up its paid figure.

Both are read-only. Time selection everywhere is a single date, `receiptsThrough`: a payment counts only if its check date is on or before that date, and pacing is measured up to that same date. A historical `receiptsThrough` reproduces a past reading exactly. There is no month preset, no fiscal-year filter, and no activity-type filter on either contract.

Every field below is classified as **stored** (read from a named column) or **derived** (computed, not stored). The column mappings were confirmed against the code (LLBLGen `[Column(...)]` entity mappings plus the `RMActivityRepository`/`RMHistoryDetailRepository` queries); the two companion documents in this folder hold the line-by-line provenance.

## Data model (both APIs)

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

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `receiptsThrough` | date | no | today (server date) | Payment cutoff and pacing anchor. Payments with a check date on or before this count toward paid; expected is paced to this date. The two frontend presets (Today, End of last month) resolve to a concrete date on the client before the call |

### Response schema

A flat list, one row per active pledge activity, no envelope. Grand totals are client-side sums.

| Field | Stored / Derived | Source or formula |
|---|---|---|
| `activityId` | stored | `RM_Activity.ActivityID` |
| `activityName` | stored | `RM_Activity.Name` |
| `sequence` | stored | `RM_Activity.Sequence` |
| `pledged` | stored (aggregate) | `SUM(RM_PledgeDetail.Pledge)` grouped by `ActivityID` |
| `paid` | stored (conditional aggregate) | `SUM(RM_HistoryDetail.Amount)` where `RM_HistoryBatch.Posted = 1` AND `RM_History.VoidJournalID IS NULL` AND `RM_History.CheckDate <= receiptsThrough` |
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

### Example (receiptsThrough 2026-07-31)

```
GET /api/dashboard/remittance-pledges/data?receiptsThrough=2026-07-31
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

### API 1 edge cases

1. **No pledge set** (activity exists, no active pledge amount): `pledged = 0`, `pctPaid = null`, `daysAhead = null`; frontend renders a neutral "No pledge" row. Payments recorded against it still appear in `paid` at the grand-total level.
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

## Not in scope

- **No personal or payer data.** Neither API returns donor, member, church, or payer identity. The receipts list is date, reference, amount, and status only.
- **No comparison or prior period,** no month presets, no fiscal-year filter, no activity-type filter. The one time control is `receiptsThrough`.

## Still needs sign-off

- **Expected pacing definition.** The pacing figure (`expected`, `daysAhead`, the status pill, the "% of term elapsed" and "days behind" text) is **derived, not stored**. It is currently defined as linear-by-days over each pledge's own term. Two open points: (a) linear-by-days vs stepped-by-payment-schedule using `RM_Pledge.Frequency`/`Duration` (a stepped curve steps up on each scheduled payment date rather than accruing continuously); and (b) whether the org's configured schedule in `RM_PledgePercent` (`Percent` by `StartDate`) should drive expected instead of a computed proportion. `RM_PledgePercent` is the only stored pacing schedule in the system and is not read by the widget today. Confirm which definition is intended; the data supports any of the three.
- **"Current status" of an activity.** Two different meanings exist: the payment-level status per receipt (Posted / Online / Voided / Unposted, stored via the batch/void flags) which API 2 returns, and the pacing status (on track / behind / paid-in-full) which is derived. Neither is a single stored "activity status" column.
- **`receiptsThrough` default.** Confirm the server default is today and that the End of last month preset resolves on the client.
- **Export.** No export endpoint exists in the modern API. Decide client-side generation vs a server endpoint.
- **Active-pledge inclusion at a date.** The live filter is `BeginDate <= receiptsThrough AND EndDate >= receiptsThrough` with NO `Active`-flag check, and it EXCLUDES pledges whose term has already ended even if they still owe (confirmed in `RMActivityRepository.GetWidgetData`). On an outstanding/pacing widget an ended-but-unpaid pledge silently drops off; confirm with SME whether that is intended.
