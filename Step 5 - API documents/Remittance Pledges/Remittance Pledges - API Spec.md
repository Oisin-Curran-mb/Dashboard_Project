# Remittance Pledges — API Spec

**Status: DRAFT — not final**

## Overview

The widget shows how well an organisation is keeping up with its remittance pledge commitments. For each activity it returns what was pledged, what should have been received by a chosen date (Expected), what has actually been paid, what remains outstanding, and the percentage paid, so the frontend can pace every pledge against its own term.

Time selection is a single date: `receiptsThrough`. A payment counts only if its check date is on or before `receiptsThrough`, and Expected is paced up to that same date. `receiptsThrough` is therefore both the payment cutoff and the as-of anchor: a historical `receiptsThrough` reproduces a past reading exactly. There is no month preset, no fiscal-year filter, and no activity-type filter on this contract; the widget shows all active pledges for the company at the selected date.

This spec is deliberately close to the existing remittance endpoint. The endpoint keeps its path and its flat per-activity rows. The one substantive change is a calculation fix, not a data-shape change: Expected is computed from each pledge's own `BeginDate` and `EndDate` rather than from a calendar-year fraction. The dates it needs are already read by the query today (they sit in the WHERE clause that filters active pledges on the selected date), so this is a SELECT-and-compute change with no schema change and no new query.

## Tables

| Table | Fields used |
|---|---|
| `RM_Activity` | `ActivityID` (row id, the stable key), `Name` (activity label), `Sequence` (fixed row order). Scoped by `CompanyID` |
| `RM_Pledge` | `PledgeID`, `ActivityID` (join), `Active` (only active pledges are counted), `BeginDate` (date NOT NULL, term start), `EndDate` (date NOT NULL, term end), `Frequency` (payments per year: one of 2, 4, 6, 12, 24, 26, 52), `Duration` (total payment periods in the term). The default term on creation is `BeginDate` to `BeginDate + 1 year - 1 day`, but the user can set any `EndDate` (for example a 3-year capital campaign), persisted on every save |
| `RM_PledgeDetail` | `Pledge` (the pledged dollar amount). `SUM(RM_PledgeDetail.Pledge)` grouped by `ActivityID`, counting only rows whose parent `RM_Pledge.Active = true`, gives the activity's total pledged |
| `RM_History` / `RM_HistoryDetail` / `RM_HistoryBatch` | Payments. A detail row counts toward Paid only if its batch is Posted (`RM_HistoryBatch.Posted = true`), the journal is not voided (`VoidJournalID IS NULL`), and its check date is on or before `receiptsThrough`. `SUM(RM_HistoryDetail.Amount)` grouped by `ActivityID` gives Paid |

**Freshness note.** The legacy widget backs its read with a file cache (`RMWidgetRecord`) that is invalidated when the active company changes. Any modern implementation should preserve that company-change invalidation so a company switch never serves another company's pledge figures.

## Old vs. new

| | Old (live today) | New (this contract) |
|---|---|---|
| Endpoint | One call keyed to a "Receipts Thru" date, returning flat per-activity rows | Same endpoint, same flat per-activity rows. `receiptsThrough` is the one date parameter |
| Pledged, Paid, Outstanding | Already returned per activity | Unchanged. Each row also carries `activityId` as the stable key, since names are org-editable |
| Header "Percent of year completed" | Hardcoded as `(days since Jan 1) / 365`, a calendar-year fraction unrelated to any pledge term. **Bug** | Removed. There is no single "percent of year" figure; pacing is per pledge (see the formula below) |
| YTD Expected per row | `(Annual / 12) * monthNumberOf(DateReceiptsThru)`, assuming a 12-month Jan to Dec cycle, never reading `BeginDate` or `EndDate`. **Bug** | `Expected = TotalPledge * daysElapsedSinceBeginDate / totalTermDays`, computed on each pledge's own term |
| `BeginDate` / `EndDate` | Already read into the query (WHERE clause that filters active pledges on the date) but never used in the Expected math | Now used in the Expected math. No schema change, no new query: the columns are already selected |
| Comparison / prior period | None | None |

Both legacy behaviours produced the same class of error: a pledge on any term other than a Jan to Dec calendar year was paced against the wrong denominator. A mid-year start read too far ahead, and a multi-year campaign read far behind. The per-term formula corrects both.

## Endpoint

```
GET /api/dashboard/remittance-pledges/data
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `receiptsThrough` | date | no | any valid date | today (server date) | The payment cutoff and the as-of anchor. Payments with a check date on or before this date count toward Paid; Expected is paced up to this date. A historical value reproduces a past reading exactly |

There is no activity-scope parameter: the endpoint returns one row per active pledge activity for the company. There is no separate `asOf`; `receiptsThrough` serves as the anchor. The two frontend presets (Today, End of last month) resolve to a concrete `receiptsThrough` date on the client before the call.

### Example requests

```
GET /api/dashboard/remittance-pledges/data
GET /api/dashboard/remittance-pledges/data?receiptsThrough=2026-07-31
GET /api/dashboard/remittance-pledges/data?receiptsThrough=2026-06-30
```

## The pacing calculation (the correct formula)

For each pledge, with dates read from `RM_Pledge`:

```
termDays    = EndDate - BeginDate                      (in days)
daysElapsed = clamp(receiptsThrough - BeginDate, 0, termDays)
Expected    = TotalPledge * daysElapsed / termDays
Outstanding = max(0, TotalPledge - Paid)
pctPaid     = Paid / TotalPledge                       (null when TotalPledge = 0)
daysAhead   = (Paid / TotalPledge) * termDays - daysElapsed
```

Properties this gives, all handled by the same formula with no special cases in the query:

- **Mid-year start.** A pledge beginning part way through the year paces from its own `BeginDate`, so its Expected is a fraction of its own term, never of the calendar year.
- **Multi-year term.** A 3-year campaign uses `termDays` of roughly 1095, so being one year in reads as roughly one third expected, not one whole year.
- **Before the term starts** (`receiptsThrough < BeginDate`): `daysElapsed = 0`, so `Expected = 0`.
- **After the term ends** (`receiptsThrough > EndDate`): `daysElapsed` clamps to `termDays`, so `Expected = TotalPledge` (100%).

`daysAhead` is the pledge's paid-equivalent days minus its elapsed days: positive means paid ahead of schedule, negative means behind. It is returned as a raw number. The status band the widget colours by (dark green "30+ days ahead", green "On track", amber "About a month behind", red "60+ days behind", plus paid-in-full and no-pledge) is a FRONTEND presentation concern applied to `daysAhead` with thresholds at +30, -30 and -60. The API returns the raw numbers and does not return a band string.

## Response schema

A flat list, one row per active pledge activity, no envelope. Grand totals are client-side sums over the rows.

| Field | Type | Description |
|---|---|---|
| `activityId` | guid | `RM_Activity.ActivityID`, the stable key (names are org-editable) |
| `activityName` | string | `RM_Activity.Name`, resolved at query time |
| `sequence` | int | `RM_Activity.Sequence`, the fixed default row order |
| `pledged` | number | Total pledged for the activity: `SUM(RM_PledgeDetail.Pledge)` over active pledges |
| `expected` | number | Expected to date, per the formula above |
| `paid` | number | `SUM(RM_HistoryDetail.Amount)` for posted, non-void rows with check date on or before `receiptsThrough` |
| `outstanding` | number | `max(0, pledged - paid)` |
| `pctPaid` | number or null | `paid / pledged`, null when `pledged` is 0 |
| `beginDate` | date | `RM_Pledge.BeginDate` |
| `endDate` | date | `RM_Pledge.EndDate` |
| `termDays` | int | `endDate - beginDate` in days |
| `daysElapsed` | int | Clamped elapsed days from `beginDate` to `receiptsThrough` |
| `daysAhead` | number or null | Paid-equivalent days minus elapsed days; null when `pledged` is 0 |

A no-pledge activity (a real activity with no active pledge amount) returns `pledged = 0`, `pctPaid = null`, `daysAhead = null`, and no expected pacing; the frontend renders it as a neutral "No pledge" row.

## Examples

Mock figures shaped like production, anchored to `receiptsThrough=2026-07-31`. The shapes and the reconciling arithmetic are the contract, not the amounts.

### Example 1: all active pledges, receiptsThrough 2026-07-31

```
GET /api/dashboard/remittance-pledges/data?receiptsThrough=2026-07-31
```

```json
[
  { "activityId": "a1e0c7d2-1111-4a01-9f01-0b1c2d3e4f01", "activityName": "General Fund Apportionment", "sequence": 1, "pledged": 24000, "expected": 13912, "paid": 7200,  "outstanding": 16800, "pctPaid": 0.300, "beginDate": "2026-01-01", "endDate": "2026-12-31", "termDays": 364,  "daysElapsed": 211, "daysAhead": -101.8 },
  { "activityId": "a1e0c7d2-2222-4a02-9f02-0b1c2d3e4f02", "activityName": "District Mission Share",     "sequence": 2, "pledged": 6000,  "expected": 3478,  "paid": 6000,  "outstanding": 0,     "pctPaid": 1.000, "beginDate": "2026-01-01", "endDate": "2026-12-31", "termDays": 364,  "daysElapsed": 211, "daysAhead": 153.0 },
  { "activityId": "a1e0c7d2-3333-4a03-9f03-0b1c2d3e4f03", "activityName": "Clergy Pension Assessment",  "sequence": 3, "pledged": 12000, "expected": 6956,  "paid": 5400,  "outstanding": 6600,  "pctPaid": 0.450, "beginDate": "2026-01-01", "endDate": "2026-12-31", "termDays": 364,  "daysElapsed": 211, "daysAhead": -47.2 },
  { "activityId": "a1e0c7d2-4444-4a04-9f04-0b1c2d3e4f04", "activityName": "Outreach and Benevolence",   "sequence": 4, "pledged": 9000,  "expected": 5217,  "paid": 6300,  "outstanding": 2700,  "pctPaid": 0.700, "beginDate": "2026-01-01", "endDate": "2026-12-31", "termDays": 364,  "daysElapsed": 211, "daysAhead": 43.8 },
  { "activityId": "a1e0c7d2-5555-4a05-9f05-0b1c2d3e4f05", "activityName": "Capital Campaign Pledge",     "sequence": 5, "pledged": 30000, "expected": 10822, "paid": 11000, "outstanding": 19000, "pctPaid": 0.367, "beginDate": "2025-07-01", "endDate": "2028-06-30", "termDays": 1095, "daysElapsed": 395, "daysAhead": 6.5 },
  { "activityId": "a1e0c7d2-6666-4a06-9f06-0b1c2d3e4f06", "activityName": "Youth Ministry Fund",         "sequence": 6, "pledged": 0,     "expected": 0,     "paid": 500,   "outstanding": 0,     "pctPaid": null,  "beginDate": "2026-01-01", "endDate": "2026-12-31", "termDays": 364,  "daysElapsed": 211, "daysAhead": null }
]
```

Client-side grand totals: pledged 81,000 (24,000 + 6,000 + 12,000 + 9,000 + 30,000 + 0); expected 40,385 (13,912 + 3,478 + 6,956 + 5,217 + 10,822 + 0); paid 36,400 (7,200 + 6,000 + 5,400 + 6,300 + 11,000 + 500); outstanding 45,100. Overall paid is below overall expected, so the widget reads "behind pace"; overall percentage paid is 36,400 / 81,000, about 45%.

Row check, General Fund Apportionment: Expected = 24,000 * 211 / 364 = 13,912. daysAhead = (7,200 / 24,000) * 364 - 211 = 109.2 - 211 = -101.8, which the frontend bands as "60+ days behind" (red).

### Example 2: the multi-year pledge that reconciles on its own term

The Capital Campaign row from Example 1 is the case the calendar-year bug got wrong. Its own term is 2025-07-01 to 2028-06-30 (1,095 days). As of 2026-07-31, 395 days have elapsed, about 36% of the term:

```json
{
  "activityId": "a1e0c7d2-5555-4a05-9f05-0b1c2d3e4f05",
  "activityName": "Capital Campaign Pledge",
  "pledged": 30000, "paid": 11000,
  "expected": 10822,
  "beginDate": "2025-07-01", "endDate": "2028-06-30",
  "termDays": 1095, "daysElapsed": 395, "daysAhead": 6.5
}
```

- **On its own term (correct):** Expected = 30,000 * 395 / 1095 = 10,822. Paid 11,000 is slightly above expected, so daysAhead = (11,000 / 30,000) * 1095 - 395 = 401.5 - 395 = +6.5. The frontend bands this "On track" (green).
- **On a naive calendar-2026 basis (the old bug):** the widget would have expected 30,000 * 212 / 365 = 17,425 by 31 July, making paid 11,000 look about 6,425 short, roughly 78 days behind, which would have banded "60+ days behind" (red).

Same pledge, same payments, same date: correct math reads on track, the old calendar-year math read far behind. That is the whole point of the fix.

### Example 3: an earlier receiptsThrough re-paces every row

```
GET /api/dashboard/remittance-pledges/data?receiptsThrough=2026-06-30
```

Every row re-paces from the same `BeginDate` anchors and payments dated after 30 June drop out of Paid. Grand expected becomes 35,193 and grand paid becomes 33,100. For example General Fund Apportionment now has 180 elapsed days, so Expected = 24,000 * 180 / 364 = 11,868, and Capital Campaign has 364 elapsed days of its 1,095-day term, so Expected = 30,000 * 364 / 1095 = 9,973. The per-row expected values sum to 11,868 + 2,967 + 5,934 + 4,451 + 9,973 + 0 = 35,193.

## Edge cases

1. **Mid-year start.** A pledge that begins part way through the year paces from its own `BeginDate`; its Expected is a fraction of its own term, not of the calendar year.
2. **Multi-year term.** A campaign spanning several years uses its full `termDays`; being one year into a three-year term reads as roughly one third expected (see Example 2). No calendar-year machinery is involved.
3. **Pledge not yet started** (`receiptsThrough < BeginDate`): `daysElapsed = 0`, `Expected = 0`, `daysAhead` derives from Paid alone (usually 0). The frontend can still show the row.
4. **Pledge already ended** (`receiptsThrough > EndDate`): `daysElapsed` clamps to `termDays`, so `Expected = pledged` (100%). Outstanding then equals whatever was never paid.
5. **No pledge set** (activity exists, no active pledge amount): `pledged = 0`, `pctPaid = null`, `daysAhead = null`; frontend renders a neutral "No pledge" row. Any payments recorded against such an activity still appear in Paid at the grand-total level.
6. **receiptsThrough before the earliest payment or before any BeginDate:** rows still return (the activities and pledges exist); Paid is 0 for pledges with no qualifying payments and Expected is 0 for pledges not yet started.
7. **Voided or unposted payments:** excluded from Paid, matching today's consistency filter (`Posted = true AND VoidJournalID IS NULL`).
8. **Company change:** the `RMWidgetRecord` file cache is invalidated so figures never carry across a company switch.

## Not in scope

- **No personal or payer data on the widget rows.** The per-activity response carries amounts and dates only, no donor, member, or payer identity.
- **Payment history drill (already shown):** the built widget's drill modal lists a pledge's receipts as date and amount with a receipt count through `receiptsThrough`. If a drill endpoint is built, it should return date and amount only, no payer identity. It is a secondary shape, not part of this per-activity contract.
- **No comparison or prior period.** No prior-year, prior-period, or delta fields on this contract.
- **No month presets, no fiscal-year filter, no activity-type filter.** The one filter is `receiptsThrough`.

## Still needs sign-off

- **Linear-by-days vs stepped-by-payment-schedule. DECIDED (2026-08-05, owner): linear-by-days**, as specced and built; the stepped alternative is not pursued (the `Frequency`/`Duration` fields stay available if it is ever revisited). This spec paces Expected linearly by days elapsed. The `RM_Pledge` fields `Frequency` (payments per year) and `Duration` (payment periods in the term) would instead support a stepped expected curve: Expected steps up on each scheduled payment date rather than accruing continuously day by day. The two agree at term boundaries but differ between payment dates (a linear curve can read a pledge as slightly behind on a day when its next scheduled payment is not yet due). Confirm whether the expected curve should be linear by days (as specced and as built) or stepped by the payment schedule using `Frequency` and `Duration`. If stepped, the formula changes to accrue by scheduled periods, still off each pledge's own `BeginDate` and term.
- **`receiptsThrough` default.** Confirm the server default is today's date, and confirm the End of last month preset resolves on the client (as built) rather than the server.
- **Export endpoints.** No export endpoint exists in the modern API. Decide whether export is client-side generation from the JSON the widget already holds or a server endpoint.
- **Active-pledge inclusion at a date.** The real filter is `BeginDate <= receiptsThrough AND EndDate >= receiptsThrough` with NO `Active`-flag check, and it EXCLUDES pledges whose term has already ended even if they still have an outstanding balance (confirmed in code: RMActivityRepository.GetWidgetData, BeginDate<=date && EndDate>=date, no Active check). Logic concern: on an outstanding/pacing widget, an ended-but-unpaid pledge silently drops off, so confirm with SME whether that is intended.
