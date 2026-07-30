# Time Window Module

**REUSABLE MODULE.** This is a standalone, widget-agnostic spec, intended to be adopted by other time-series widgets in the future (per direct instruction, 2026-07-27). It is not a W01 document; W01 is simply the first implementation.

**Reference implementation:** first implemented in W01 - Budget Compared to Actual, Final (v2), tweak round 2, 2026-07-27, in `Step 3 - Mock_Work/Dashboard Widget Mockups.html` (the `bgtF` block's TIME WINDOW MODULE section).

---

## Purpose

One shared time filter for any time-series widget. Every widget that shows values over time gets the same two controls with the same behaviour:

- **Window** (span): the slice of time being shown.
- **Interval** (grain): what each bar, point, or table row represents.

The two constrain each other by one universal rule (below), so a customer learns the control once and it behaves identically on every widget that adopts it.

## The five windows

Shown in the picker in this order, smallest first:

| # | Window | Definition |
|---|---|---|
| 1 | **This month** | The current calendar month. |
| 2 | **This period** | The current fiscal period. |
| 3 | **This quarter** | ROLLING: the last 3 months back from the as-of date. Not the calendar or fiscal quarter containing today. |
| 4 | **This year** | ROLLING: the last 12 months back from the as-of date. Not the calendar or fiscal year containing today. |
| 5 | **This fiscal year** | Fiscal year to date. |

**Rolling semantics and the as-of anchor.** The two rolling windows (This quarter, This year) are anchored to an **as-of date**, normally today; the server should accept it as a parameter (see API guidance) so a report can be pinned to a past date. Rolling windows are indifferent to fiscal boundaries: they may cross a fiscal-year boundary, and when they do the budget lookup spans two fiscal years.

## Interval availability: the 2-31 points rule

An interval is available for a window when it yields **2 to 31 data points** for that window, **plus one owner exception: Month is allowed on the month and period windows as a single-pair summary** (one budget/actual pair for the whole window).

The rule is evaluated for the window at its full extent, so availability does not flicker as a window fills in. That gives this availability matrix:

| Window | Day | Week | Month | Period | Quarter | Year |
|---|---|---|---|---|---|---|
| This month | yes (up to 31) | yes (4-6) | yes (exception: single pair) | no | no | no |
| This period | yes (up to 31) | yes (4-6) | yes (exception: single pair) | no | no | no |
| This quarter (rolling 3) | no (about 92) | yes (about 14) | yes (3) | yes (3) | no (1) | no (1) |
| This year (rolling 12) | no (365) | no (up to 53) | yes (12) | yes (12) | yes (up to 5) | yes (2, crosses the FY boundary) |
| This fiscal year | no | no (a full year runs to 53 weeks) | yes (up to 12) | yes (up to 12) | yes (up to 4) | yes (year-to-date single pair, same summary reasoning as the Month exception) |

Notes on the two judgment cells: Week is off both year windows because a full year runs past 31 weeks; Year on the fiscal-year window is a single-pair year-to-date summary (the same reasoning as the Month exception), while Year on the rolling year is a genuine 2-point series because that window crosses the fiscal-year boundary.

## The default rule: smallest available interval (API contract requirement)

**Every window's default interval is its SMALLEST available interval.** For the five windows above, in order: Day, Day, Week, Month, Month.

This is stated as a requirement of the module contract, not a styling choice: any client, and the API documentation derived from this module, must treat "default grain = smallest available grain for the requested window" as normative. Servers validating a request with no grain supplied should resolve it by this rule.

## The toggle ordering law

The interval toggle always shows **D W M P Q Y** in that fixed order: smallest first, and **period before quarter**. Unavailable letters render greyed and disabled (visible but unclickable), exactly like the reference implementation's constrain behaviour. The order never reshuffles per window; only the enabled set changes.

## Constrain / snap behaviour

- Changing the **window** re-evaluates availability. If the currently selected interval is not available in the new window, it **snaps to the new window's default (the smallest available)**. A still-valid interval is kept unchanged.
- Changing the **interval** never changes the window.
- A view that needs at least two points (a trend line) falls back to a bar/summary view when the current window and interval produce a single point (the two single-pair summary cells above), rather than rendering an empty chart.

## API guidance

**One endpoint** serves every window and grain:

```
GET .../budget-vs-actual?window={month|period|quarter|year|fiscalYear}
                        &grain={day|week|month|period|quarter|year}
                        &asOf={date}
```

- `window` + `grain` + `asOf` are the module's three parameters. `asOf` defaults to today and anchors the two rolling windows; passing a historical `asOf` reproduces a past report exactly.
- **Server-side validation:** the server validates the window/grain combination by the same 2-31 points rule (with the same two summary exceptions) and rejects invalid combinations; it must not silently substitute. If `grain` is omitted, the server resolves it by the smallest-available-default rule above.
- **Response shape:** an array of buckets plus a generation stamp.

```json
{
  "buckets": [
    { "start": "2026-07-01", "end": "2026-07-05", "budget": 7742, "actual": 8355, "partial": true }
  ],
  "generatedAt": "2026-07-27T00:00:00Z",
  "budgetDerived": "paceLine"
}
```

  - `start` / `end`: the bucket's inclusive date range.
  - `budget` / `actual`: the bucket's figures; `actual` is `null` for unposted buckets (never zero).
  - `partial`: true when the bucket is not fully inside the window (a rolling window's edge quarter/year, a first/last week cut by the window) or not fully posted. Clients flag partial buckets visually.
- **`budgetDerived` flag** (required at sub-period grains): tells the client how sub-period budget figures were produced. Options: `"paceLine"` (recommended), `"prorated"`, or `"native"` (a budget actually entered at that grain). **The recommendation is a budget PACE LINE at sub-period grains** (a cumulative expected-spend line the actual bars are read against), not evenly prorated per-bucket budget bars: an even proration invents a daily/weekly budget nobody entered and makes ordinary calendar lumpiness (payroll days, gift Sundays) read as variance. The W01 mock uses proration for bar/table display purely as a display simplification; that caveat lives here and in the widget docs, not in the UI.
- **Rolling windows cross fiscal-year boundaries:** the budget lookup must span two fiscal years in one request (e.g. a rolling year of Aug 2025 through Jul 2026 needs FY2025 and FY2026 budgets). Bucket grouping by fiscal quarter/year must likewise key on each month's own FY.
- **Sub-period actuals are new backend work:** GLSummary is period-grain, so Day and Week actuals cannot come from it; they require transaction-level querying (or a new day-grain rollup). This is an open backend item wherever this module is adopted, tracked per widget in that widget's Step 4 Sign-off Readiness table.

## Adoption notes

- The window picker and interval toggle should be presented together (they constrain each other).
- Captions and footers follow the selected window's plain name ("vs. budget, This year"; totals over the window's posted buckets only).
- First implemented in W01 Final (v2), 2026-07-27. Widgets adopting this module later should reference this file rather than restating the rules.
