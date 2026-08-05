# Budget Compared to Actual — API Spec

**Status: DRAFT — not final**

## Overview

The widget compares budgeted amounts against posted actuals for a chosen scope: Income Accounts, Expense Accounts, or a single Special Report Line. Time selection follows the [Time Window Module](../../Step%203%20-%20Mock_Work/Widget_Specs/Time%20Window%20Module.md) contract: a `window` (the slice of time shown), a `grain` (what each bucket represents), and an optional `asOf` anchor date. One endpoint serves every window and grain, returning a chronological array of `{start, end, budget, actual, partial}` buckets plus a pre-computed `total` for the window. The Time Window Module document is the authority for all time logic in this spec.

## Tables

| Table | Fields used |
|---|---|
| `GLSummary` | Posted actual amounts per account and period |
| `GLBudgetDetail` | Budget amounts per account and period, `RevisionStartingPeriodID` |
| `GLPeriod` | Period, YearID, fiscal periods for the year, excluding any period named `"Audit"` |
| `GLAccount` | AccountNumber, StatementType (`I`/`E`), `MasterAccountID` |
| `GLSpecialReport` | Report titles (the "Special Report Title" dropdown) |
| `GL_SpecialReportLine` | LineNumber, Name/description, low/high `AccountNumber` range (the "Special Report Line" dropdown within a selected report) |
| `SSUserTenantPreferenceRepository` | Legacy per-user preference store (`UserPreferences.WidgetBudgetComparedToActual`); see "Still needs sign-off" |

No new tables are needed for month, period, quarter, and year buckets: those are new queries against the same tables the legacy and modern widgets already use. The sub-period grains are different. `GLSummary` is period-grain, so Day and Week ACTUALS cannot come from it: they require transaction-level querying (or a new day-grain rollup), which is genuinely new backend work, not just a new query. `GLBudgetDetail` has no budget rows below period grain either, so sub-period BUDGET figures are derived, never stored (see `budgetDerived` in the Response schema).

**"Line Description" is the existing Special Report Line dropdown, not an unconfirmed field.** The Step 4 design doc originally left "Line Description" open with a guess that it might be a fixed, hard-coded list. It isn't: the legacy widget's Special Report Filter UI is two dropdowns (Special Report Title, then Special Report Line within that report, ordered by `LineNumber`), and the modern API already has a matching endpoint (`GET /special-report-lines?specialReportId={guid}`, returns `List<DropDownItem>`). "Line Description" is this second dropdown's label text: a real, already-built field, not a separate open question. The redesign's special-report modal keeps this exact two-step structure (report, then line), so both dropdown endpoints are unchanged in concept. One addition: the data response for `accountType=2` must now carry the line's own account type as `lineType` (income, expense, or mixed), because the headline flips favourability by line type and renders mixed lines neutral. See Response schema.

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Endpoint | `GET /api/dashboard/budget-vs-actual/data?accountType={0\|1\|2}&specialReportLineId={guid}` returns `List<BudgetVsActualPeriodDto>`, monthly rows only, no variance, no totals | Same endpoint. Adds the Time Window Module params `window`, `grain`, `asOf`; response becomes a `buckets[]` array plus `generatedAt`, a `total` object for the window, `budgetDerived` at sub-period grains, and `lineType` when `accountType=2` |
| Time axis | Monthly only (one row per `GLPeriod`), fiscal year picked via `X-Year-ID` header | Five windows (this_month, this_period, this_quarter, this_year, this_fiscal_year) crossed with six grains (day, week, month, period, quarter, year), validated server-side by the 2-to-31-points rule; the fiscal year is derived from `window` + `asOf` and the org's own fiscal calendar, not from a year header |
| Rolling windows | Nothing ever crossed a fiscal-year boundary | this_quarter (last 3 months from `asOf`) and this_year (last 12 months from `asOf`) are rolling and can cross the FY boundary, so budget lookup must span two fiscal years in one request |
| Sub-period grains | Did not exist | Day and Week actuals are new backend work (transaction-level querying; `GLSummary` is period-grain); sub-period budgets are derived, pace line recommended (see `budgetDerived`) |
| Variance | Not returned: legacy and modern both leave `Actual - Budget` for the caller to compute | `total` carries pre-computed `variance`/`variancePercent` for the window; per-bucket variance is a client subtraction of the returned `budget`/`actual` (no per-bucket variance fields in the response) |
| Master company (consolidated) | **Broken.** Modern API returns an empty list for `CompanyNumber=0`. Legacy joined child accounts via `GLAccount.MasterAccountID` | **Must fix**: reinstate the `MasterAccountID` join so consolidated orgs return combined figures, matching legacy |
| User preference persistence | Legacy saved each user's last Account Type + Special Report Line via `SSUserTenantPreferenceRepository` (`UserPreferences.WidgetBudgetComparedToActual`) | Not implemented in the modern API; the client manages this state, flagged in "Still needs sign-off" |
| Excel/CSV export | Legacy generated XLSX directly in a button handler (`buttonExportToExcel_Click`) | No export endpoint exists yet, flagged in "Still needs sign-off" |

## Endpoint

```
GET /api/dashboard/budget-vs-actual/data
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `accountType` | enum | yes | `0` \| `1` \| `2` | none | `0` = Income Accounts, `1` = Expense Accounts, `2` = Special Report Line |
| `specialReportLineId` | guid | only when `accountType=2` | any line id from `GET /special-report-lines?specialReportId={guid}` | none | One Special Report Line, chosen via the report-then-line flow |
| `window` | enum | yes | `this_month` \| `this_period` \| `this_quarter` \| `this_year` \| `this_fiscal_year` | none | this_month = current calendar month; this_period = current fiscal period; this_quarter = ROLLING, last 3 months back from `asOf`; this_year = ROLLING, last 12 months back from `asOf`; this_fiscal_year = fiscal year to date |
| `grain` | enum | no | `day` \| `week` \| `month` \| `period` \| `quarter` \| `year` | smallest allowed grain for the window | Validated against the window by the 2-to-31-points rule (see Validation rules) |
| `asOf` | date | no | today (server date) | any valid date | Anchors the two rolling windows; passing a historical `asOf` reproduces a past report exactly |

**Default grain is an API contract, not a convenience.** When `grain` is omitted, the server resolves it to the window's SMALLEST allowed grain: Day, Day, Week, Month, Month for the five windows in order (this_month, this_period, this_quarter, this_year, this_fiscal_year). The frontend's snap behaviour (changing window snaps an invalid grain to the new window's default) assumes the server resolves an omitted grain by exactly this rule, so the two must never disagree.

**Headers.** Company is `X-Company-ID`. There is no fiscal-year header: the server derives the fiscal year(s) from `window` + `asOf` and the org's own fiscal calendar (`GLPeriod`). Because the two rolling windows can cross a fiscal-year boundary, one request may need budget rows from two fiscal years.

### Example requests

```
GET /api/dashboard/budget-vs-actual/data?accountType=0&window=this_month
GET /api/dashboard/budget-vs-actual/data?accountType=1&window=this_year&grain=month&asOf=2026-07-27
GET /api/dashboard/budget-vs-actual/data?accountType=2&specialReportLineId=3fa85f64-5717-4562-b3fc-2c963f66afa6&window=this_fiscal_year&grain=month
```

## Validation rules

A grain is valid for a window when it yields 2 to 31 data points at the window's full extent, plus two summary exceptions: Month on this_month and this_period (a single budget/actual pair for the whole window), and Year on this_fiscal_year (a single-pair year-to-date summary).

### Allowed grains per window

| Window | Day | Week | Month | Period | Quarter | Year |
|---|---|---|---|---|---|---|
| this_month | allowed | allowed | allowed (summary exception, single pair) | blocked | blocked | blocked |
| this_period | allowed | allowed | allowed (summary exception, single pair) | blocked | blocked | blocked |
| this_quarter | blocked (about 92 points) | allowed (about 14) | allowed (3) | allowed (3) | blocked (1) | blocked (1) |
| this_year | blocked (365) | blocked (up to 53) | allowed (12) | allowed (12) | allowed (up to 5) | allowed (2, crosses the FY boundary) |
| this_fiscal_year | blocked | blocked (a full year runs to 53 weeks) | allowed (up to 12) | allowed (up to 12) | allowed (up to 4) | allowed (summary exception, year-to-date single pair) |

An invalid combination is rejected with HTTP 400 and an error body listing the allowed grains for that window; the server must never silently substitute a different grain:

```json
{
  "error": "invalidGrain",
  "message": "grain 'day' is not available for window 'this_year'",
  "allowedGrains": ["month", "period", "quarter", "year"]
}
```

## Response schema

| Field | Type | Description |
|---|---|---|
| `accountType` | int | Echo of the request's `accountType` |
| `window` | string | Echo of the resolved window |
| `grain` | string | The resolved grain (the default when the request omitted `grain`) |
| `asOf` | date | The resolved anchor date (today when the request omitted `asOf`) |
| `generatedAt` | datetime (UTC) | Server generation stamp |
| `total` | object | Window totals: `budget`, `actual`, `variance`, `variancePercent`, all pre-computed server-side |
| `total.budget` | number | The window's budget. At sub-period grains with `budgetDerived: "paceLine"` this is the budget-to-date pace at `asOf`, not the full-window budget; at period-and-above grains it sums every bucket's budget |
| `total.actual` | number | Sum of the posted buckets' actuals |
| `total.variance` | number | `total.actual - total.budget`, signed |
| `total.variancePercent` | number | `total.variance` as a rounded percent of `total.budget` |
| `budgetDerived` | string | Present whenever `grain` is `day` or `week`: how sub-period budget figures were produced. Values: `"paceLine"` (recommended), `"prorated"`, `"native"` (a budget actually entered at that grain). The pace line (budget-to-date, a cumulative expected-spend reading) is recommended over even proration because proration invents a daily/weekly budget nobody entered and makes ordinary calendar lumpiness (payroll days, gift Sundays) read as variance |
| `lineType` | string | Present only when `accountType=2`: `"income"`, `"expense"`, or `"mixed"`, the Special Report Line's own account type, derived from the accounts in its low/high `AccountNumber` range (all `StatementType=I` is income, all `E` is expense, otherwise mixed). Required because the headline flips favourability by line type and renders mixed lines neutral |
| `buckets[]` | array | Always chronological. One entry per grain unit in the window |
| `buckets[].start` | date | Bucket's inclusive range start |
| `buckets[].end` | date | Bucket's inclusive range end |
| `buckets[].budget` | number | The bucket's budget figure |
| `buckets[].actual` | number or null | The bucket's posted actual. `null` for unposted buckets, never `0`: a zero would be a fake reading, `null` means nothing posted yet |
| `buckets[].partial` | boolean | `true` on in-progress buckets: the current period/month, first/last weeks cut by the window edge, and a rolling window's edge quarter/year. The frontend flags these visually |

Notes:

- Per-bucket `variance`/`variancePercent` are not returned. The bucket shape is the module's `{start, end, budget, actual, partial}`; the client computes each bucket's variance from the two returned figures. The pre-computed pair lives in `total` only.
- Amounts are already sign-adjusted per the existing Income x -1 / Expense x +1 / Special-Report-Line `ReverseSign` convention, which is unchanged and confirmed correct. Favourability (which sign is "good") remains a client decision, driven by `accountType`/`lineType`.

## Examples

### Example 1: this_fiscal_year, grain=month

This org's fiscal year happens to be calendar-aligned (starts January); fiscal calendars vary per org, so the buckets follow the org's own `GLPeriod` calendar, never a hardcoded January or July. The in-progress month keeps its normal full-month budget with an honestly-low posted actual, and is flagged partial.

```
GET /api/dashboard/budget-vs-actual/data?accountType=0&window=this_fiscal_year&grain=month&asOf=2026-07-27
```

```json
{
  "accountType": 0,
  "window": "this_fiscal_year",
  "grain": "month",
  "asOf": "2026-07-27",
  "generatedAt": "2026-07-27T14:05:00Z",
  "total": {
    "budget": 336000,
    "actual": 341900,
    "variance": 5900,
    "variancePercent": 2
  },
  "buckets": [
    { "start": "2026-01-01", "end": "2026-01-31", "budget": 48000, "actual": 52100, "partial": false },
    { "start": "2026-02-01", "end": "2026-02-28", "budget": 48000, "actual": 46800, "partial": false },
    { "start": "2026-03-01", "end": "2026-03-31", "budget": 48000, "actual": 49500, "partial": false },
    { "start": "2026-04-01", "end": "2026-04-30", "budget": 48000, "actual": 47300, "partial": false },
    { "start": "2026-05-01", "end": "2026-05-31", "budget": 48000, "actual": 50200, "partial": false },
    { "start": "2026-06-01", "end": "2026-06-30", "budget": 48000, "actual": 51641, "partial": false },
    { "start": "2026-07-01", "end": "2026-07-31", "budget": 48000, "actual": 44359, "partial": true }
  ]
}
```

### Example 2: this_month, grain=week, with a partial week

July 2026, `asOf` 2026-07-27. Weeks start Monday; the first and last weeks are cut by the month boundary, so they are partial. The current week has nothing posted yet, so its `actual` is `null`. `total.budget` is the pace at `asOf` (40,259), not the full-month 48,000, because `budgetDerived` is `"paceLine"`.

```
GET /api/dashboard/budget-vs-actual/data?accountType=0&window=this_month&grain=week&asOf=2026-07-27
```

```json
{
  "accountType": 0,
  "window": "this_month",
  "grain": "week",
  "asOf": "2026-07-27",
  "generatedAt": "2026-07-27T14:05:00Z",
  "budgetDerived": "paceLine",
  "total": {
    "budget": 40259,
    "actual": 44359,
    "variance": 4100,
    "variancePercent": 10
  },
  "buckets": [
    { "start": "2026-07-01", "end": "2026-07-05", "budget": 7742, "actual": 8355, "partial": true },
    { "start": "2026-07-06", "end": "2026-07-12", "budget": 10839, "actual": 11600, "partial": false },
    { "start": "2026-07-13", "end": "2026-07-19", "budget": 10839, "actual": 12404, "partial": false },
    { "start": "2026-07-20", "end": "2026-07-26", "budget": 10839, "actual": 12000, "partial": false },
    { "start": "2026-07-27", "end": "2026-07-31", "budget": 7742, "actual": null, "partial": true }
  ]
}
```

### Example 3: invalid window and grain combination

Day grain is blocked on the rolling year (365 points, far past the 31-point ceiling). The server rejects it and lists what is allowed; it never substitutes a grain silently.

```
GET /api/dashboard/budget-vs-actual/data?accountType=1&window=this_year&grain=day
```

HTTP 400:

```json
{
  "error": "invalidGrain",
  "message": "grain 'day' is not available for window 'this_year'",
  "allowedGrains": ["month", "period", "quarter", "year"]
}
```

## Rolling windows and fiscal boundaries

- `this_quarter` is the last 3 months back from `asOf`, and `this_year` is the last 12 months back from `asOf`. Neither is the calendar or fiscal quarter/year containing today.
- Rolling windows are indifferent to fiscal boundaries: when one crosses a fiscal-year boundary, the budget lookup spans two fiscal years in one request (for example, a rolling year of Aug 2025 through Jul 2026 needs FY2025 and FY2026 budgets), and quarter/year bucket grouping keys each month to its own FY.
- Fiscal calendars vary per org: `GLPeriod` is per-company, per-year, not a hardcoded calendar range, so the FY crossing point is per-org, not a fixed June/July seam.
- Windows and fiscal-year resolution are computed from `asOf`, not from today, so a historical `asOf` reproduces that past report exactly.

## Sorting and aggregation boundaries

- `buckets[]` always comes back chronological, with `"Audit"` periods excluded. There are no sort parameters.
- The widget's table sorting (every header sortable) and its "Total, posted so far" footer (a sum over the posted buckets in the window) are client-side operations over the returned array. No footer field and no other server work is needed beyond the chronological bucket order.

## Edge cases

1. **No-budget window:** every bucket's budget is 0 or absent (a window the org never budgeted). Return the buckets honestly, budget `0` (or `null` where genuinely absent) with real actuals, not an error: the frontend renders its "Set up budget" state from this, and the API must never fake a figure that makes an unbudgeted org read as 100% over.
2. **Unposted buckets:** `actual` is `null`, never `0`. `total.actual` sums posted buckets only.
3. **`asOf` in a prior fiscal year:** windows and fiscal-year resolution must be computed from `asOf`, not from today, so a historical `asOf` reproduces that past report exactly.
4. **Rolling window crossing the FY boundary:** budget lookup spans two fiscal years in one request, and quarter/year bucket grouping keys each month to its own FY. The crossing point is per-org (fiscal calendars vary), not a fixed seam.
5. **Master company (consolidated) rollup:** known must-fix. The modern API returns an empty list for `CompanyNumber=0`; the `GLAccount.MasterAccountID` join must be reinstated so consolidated orgs return combined figures, matching legacy. A consolidated company with no linked entities yet should return the same shape as a normal empty result.
6. **Special Report Line deleted or renamed by the customer:** every special-report value is customer-configured, so a saved `specialReportLineId` can stop existing between requests. Needs an explicit behaviour (404-style error vs empty result) rather than a silent empty payload.
7. **Special Report Line with no accounts in range:** a `GL_SpecialReportLine` whose low/high `AccountNumber` range matches nothing in the window. Empty `buckets[]` or honest zero/null buckets, not an error.
8. **`specialReportLineId` provided without `accountType=2`:** conflicting params. Ignore `specialReportLineId`, or reject the request? Needs a dev decision.
9. **Division by zero in `variancePercent`:** `total.budget` of 0. Return `null` instead of a percent, consistent with how the other specs in this folder handle it.

## Not in scope

- The response stays bucket-level aggregation only. Even though sub-period actuals require transaction-level querying under the hood, no per-transaction or per-account rows are ever returned, and there is no drill-through endpoint.
- User preference persistence and Excel/CSV export are carried unchanged from today (client-managed state, no export endpoint); both are tracked in "Still needs sign-off", not silently accepted.

## Still needs sign-off

- **Special Report list endpoint confirmation:** the two-dropdown flow (`GLSpecialReport` titles, then `GET /special-report-lines?specialReportId={guid}`) is already built, but every value is customer-configured (each org defines its own reports, lines, and low/high `AccountNumber` ranges), so the new `total` fields, `lineType`, and the master-company fix all need explicit testing against real customer-configured reports, not just the fixed Income/Expense paths.
- **Master company (`CompanyNumber=0`) rollup fix:** confirmed broken (returns empty today). Needs the `MasterAccountID` join reinstated; exact dedupe/aggregation logic across child accounts still needs a dev answer.
- **Sub-period actuals feasibility:** CONFIRMED feasible. `GLSummary` is period-grain, but `GLJournalDetail` carries a real `DetailDate` (date NOT NULL) plus `Amount`, so Day and Week ACTUALS are available at transaction level (confirmed in code: GLJournalDetail.DetailDate). Only open point is performance: transaction-level querying (or a day-grain rollup) has a cost worth confirming before the day/week grains ship against live data.
- **Pace line vs proration for sub-period budgets:** the recommendation is a budget PACE LINE (budget-to-date), not even proration: proration invents a daily/weekly budget nobody entered and turns ordinary calendar lumpiness (payroll days, gift Sundays) into fake variance. Backend must decide which to implement and report it honestly via `budgetDerived`.
- **Cross-FY budget lookup:** the rolling windows (this_quarter, this_year) can span two fiscal years in one request. Confirm the `GLBudgetDetail` lookup (including `RevisionStartingPeriodID` handling) works across the FY seam, and that quarter/year bucket grouping keys each month to its own FY.
- **Rolling-window `asOf` semantics:** confirm the exact anchoring of "last 3 months / last 12 months back from `asOf`" (calendar-month blocks vs day-precise offsets), and the validation rules for `asOf` itself (future dates, dates before any GL data exist).
- **Per-org fiscal calendars:** confirm the fiscal-year derivation from `window` + `asOf` + `GLPeriod` returns correct data for orgs whose fiscal year isn't July to June (`GLPeriod` is per-company, per-year). Not a new feature to build, just needs a straight yes/no from backend.
- **Excel/CSV export endpoint:** the redesigned widget's menu already assumes this exists (Download as Excel/CSV at every size except KPI). No backend endpoint has been built. Needs a decision on whether/when to build it before this ships.
- **User preference persistence:** legacy remembered each user's last Account Type + Special Report Line (`SSUserTenantPreferenceRepository`). Decide whether the modern API should regain this (new preference-storage work) or whether client-managed state is acceptable permanently.
