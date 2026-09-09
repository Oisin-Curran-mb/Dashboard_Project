# Budget Compared to Actual - API Spec

**Status: Done - awaiting sign-off (drafting complete, owner review pending)**

## Overview

The widget answers one question: is the organisation's income or spending ahead of or behind its budget, for a chosen scope, over a chosen slice of time? The scope is Income accounts, Expense accounts, or one Special Report Line; time selection follows the Time Window Module contract (`window` + `grain` + `asOf`), whose authority for all time logic is `Step 3 - Mock_Work/Widget_Specs/Time Window Module.md`. The headline is the signed dollar variance over the window's posted buckets, with a percent of budget as support; favourability direction flips by account type and is a client presentation over the returned sign.

This contract defines three APIs: a bounded data read fired on render and on every scope, window, grain, or asOf change (API 1); and two rarely-changing special-report lookups fired only when the report dialog opens (API 2 report list, API 3 lines within a report). The justification lives in the API inventory below. No API writes anything.

## Design → API coverage (required)

| Design element | Type | API | Field(s) | Provenance |
|---|---|---|---|---|
| Headline signed dollar variance | KPI | API 1 | `total.variance` | DERIVED server-side, pre-signed |
| Headline quiet percent of budget | KPI | API 1 | `total.variancePercent` | DERIVED server-side, null when budget is 0 |
| Favourability pill (Favourable / Unfavourable / neutral over-under for a mixed line) | state | API 1 | `total.variance`, `lineType`, `accountType` | Client derivation: sign of the returned variance, direction flipped by account type |
| Headline explanation text behind the info control | state | API 1 | `total.budget`, `total.actual` | Client-composed sentence over returned figures |
| Scope switch (Income accounts / Expense accounts / Special report) | filter | API 1 | `accountType` | Request param, echoed |
| Special-report context line under the headline | state | API 2, API 3 | `reports[].name`, `lines[].name` | Client echo of the applied selection |
| Window picker (five windows) | filter | API 1 | `window` | Request param, echoed |
| Grain toggle with unavailable grains disabled | filter | API 1 | `grain` | Request param, echoed; availability matrix client-side, validation server-side |
| Bar view, budget and actual series per bucket | chart series | API 1 | `buckets[].budget`, `buckets[].actual` | DERIVED sums, see Tables |
| Signed per-bucket variance row under the bars | chart series | API 1 | `buckets[].budget`, `buckets[].actual` | Client subtraction of two returned values |
| Bucket axis labels | chart | API 1 | `buckets[].start`, `buckets[].end` | Client formats by grain |
| Bar and line point readout card (Budget, Actual, Variance, partial note) | state | API 1 | `buckets[].budget`, `buckets[].actual`, `buckets[].partial` | Client render of returned bucket |
| Line view trend, and its fewer-than-two-points guard | chart series / state | API 1 | `buckets[]` | Client; guard is a rule over the returned array length |
| Table view rows (Period / Budget / Actual / Variance) | table column | API 1 | `buckets[].start`, `buckets[].end`, `buckets[].budget`, `buckets[].actual` | Client; per-row variance is client arithmetic |
| Table sorting on every header | interaction | API 1 | `buckets[]` | Client, over a bounded set (31 rows maximum) |
| "Total, posted so far" footer | KPI | API 1 | `buckets[].budget`, `buckets[].actual` | Client sum over posted buckets; must reconcile with `total` |
| Partial bucket marker | state | API 1 | `buckets[].partial` | Server flag; the client cannot know posting state |
| No-budget empty state with its set-up action | state | API 1 | `buckets[].budget` | Client rule: no bucket has budget greater than 0 |
| Sub-period budget basis caption | state | API 1 | `budgetDerived` | Server reports how sub-period budgets were produced |
| Report dropdown in the special-report dialog (name plus line count) | filter | API 2 | `reports[].id`, `reports[].name`, `reports[].lineCount` | See API 2 schema |
| Line dropdown in the special-report dialog (name plus account-type tag, and the preview sentence) | filter | API 3 | `lines[].id`, `lines[].name`, `lines[].type` | See API 3 schema |
| Apply gating and dialog prefill | interaction | none | Client-side dialog state only, no field | Client |
| Two independent panels at the Detail tier, each with its own grain | view | API 1 | One API 1 call per panel grain, shared `asOf` | Same schema per call |
| Glance caption naming the window | state | API 1 | `window` | Client label from the echo |
| Loading skeleton | state | none | Client-side presentation only, no field | Client |
| Refresh control | action | API 1 | Re-fires the active API 1 call(s) with a fresh `asOf`; same fields as initial load | n/a |

Every response field below appears in at least one row above; the request echoes (`asOf`, `generatedAt`) exist for reconciliation and caching, not for display.

## Tables (required)

| Table / repository | Fields and members used |
|---|---|
| `GLSummary` | `Amount` (posted actuals per account and period) |
| `GLBudgetDetail` | `Budget` per account and period; original-budget filter via `GLBudget.RevisionStartingPeriodID` |
| `GLPeriod` | `Period`, `YearID`; periods named `"Audit"` excluded |
| `GLYear` | `BeginDate`, `CompanyID` (per-company fiscal calendars) |
| `GLAccount` | `AccountNumber`, `StatementType` (`I` / `E`), `MasterAccountID` |
| `GLSpecialReport` | `SpecialReportID`, `Name`, `CompanyID`, `HasLines` |
| `GLSpecialReportLine` | `SpecialReportLineID`, `SpecialReportID`, `LineNumber`, `Name`, `ReverseSign`, low/high `AccountNumber` range |
| `GLJournalDetail` | `DetailDate`, `Amount` (transaction grain, the only source for day and week actuals) |
| `SSUserTenantPreferenceRepository` | Legacy per-user preference store (`UserPreferences.WidgetBudgetComparedToActual`); not used by this contract, see Still needs sign-off |

No new tables and no schema changes are needed. Month, period, quarter, and year buckets are new queries against the same tables the legacy and modern widgets already read. Day and week buckets are genuinely new backend work against `GLJournalDetail`, because `GLSummary` is period grain and `GLBudgetDetail` holds nothing below period grain.

Core formulas and standing filters, each quotable in isolation:

- **Actual** = `SUM(GLSummary.Amount)` per bucket, times the sign multiplier. [CODE, `BudgetComparedToActual.ascx.cs` LoadRecords, via `Widget_Comparison_Classic.html`]
- **Budget** = `SUM(GLBudgetDetail.Budget)` per bucket, times the sign multiplier, where `GLBudget.RevisionStartingPeriodID` is null. Only the original budget is ever compared; revision rows are excluded. [CODE, LoadRecords]
- **Sign multiplier**: Income accounts times -1, Expense accounts times +1; a Special Report Line uses its own `ReverseSign` flag instead. Amounts arrive already sign-adjusted; the client never sign-corrects. [CODE, confirmed matching in both codebases per `Widget_Comparison_Classic.html`]
- **Periods included**: `GLPeriod` rows for the fiscal year(s) the window touches, ordered by `Period`, excluding any period named `"Audit"`. [CODE]
- **Special Report Line account set**: accounts whose `AccountNumber` falls within the line's configured low/high range (`ReportHelpers.SpecialReportAccounts`). [CODE]
- **Master-company rollup**: when `CompanyNumber` is 0, child accounts join via `GLAccount.MasterAccountID`. Present in legacy; the modern data endpoint returns an empty list for master companies today and must reinstate this join. [CODE, LoadRecords; the modern gap is recorded in `Widget_Comparison_Classic.html`]
- **Day and week actuals**: `GLJournalDetail.DetailDate` is `date NOT NULL` with `Amount`, so transaction-level day/week actuals are available; no code does this today. [CODE, `Pending Questions - Codebase Findings` Q2]
- **Cross-fiscal-year budgets**: no existing code fetches budget rows across two fiscal years; the rolling windows require it. NEW. [CODE, Q3]
- **Fiscal calendars are per company**: `GLYear.BeginDate` sets each org's year start; never assume a July or January boundary. [CODE, Q4]

## Old vs. new (required)

| | Old (live today) | New (needed) |
|---|---|---|
| Data endpoint | `GET /api/dashboard/budget-vs-actual/data?accountType={0\|1\|2}&specialReportLineId={guid}` returns `List<BudgetVsActualPeriodDto>` `{PeriodId, Period, DisplayValue, Actual, Budget, ActualYTD, BudgetYTD}`: monthly rows for one fiscal year | Same path; adds `window`, `grain`, `asOf`; response becomes `total` plus `buckets[]`. NEW query shape over existing tables |
| Fiscal year selection | `X-Year-ID` header required | Header dropped; the fiscal year(s) derive from `window` + `asOf` + the org's own `GLPeriod` calendar. NEW derivation |
| Rolling windows | None; every read is single-fiscal-year | `this_quarter` and `this_year` roll back from `asOf` and can cross the fiscal-year seam; budget lookup spans two fiscal years in one request. NEW |
| Sub-period grains | None; `GLSummary` is period grain | Day and week actuals from `GLJournalDetail`; sub-period budgets DERIVED, reported via `budgetDerived`. NEW backend work |
| Window totals and variance | None; `ActualYTD` / `BudgetYTD` cumulative columns, variance left to the caller | `total` object (`budget`, `actual`, `variance`, `variancePercent`) computed over posted buckets. NEW, DERIVED |
| Cumulative series | `ActualYTD` / `BudgetYTD` returned on every row | Dropped: no view in the design consumes a cumulative series |
| Report list | `GET /api/dashboard/budget-vs-actual/filters` returns `BudgetVsActualFiltersDto {SpecialReports: List<DropDownItem>}` | Same endpoint, plus `lineCount` per report. NEW field |
| Line list | `GET /api/dashboard/budget-vs-actual/special-report-lines?specialReportId={guid}` returns `List<DropDownItem>` ordered by `LineNumber` | Same endpoint, plus `type` per line (income / expense / mixed, classified from the line's account range). NEW, DERIVED |
| Master company | Modern returns an empty list for `CompanyNumber=0`; legacy joins `MasterAccountID` | Must fix: reinstate the join so consolidated orgs return combined figures. Restores existing legacy behaviour, STORED reads |
| Preference persistence | Legacy saves each user's scope per company; modern does not | Not in this contract; client-managed state, listed in Still needs sign-off |
| Excel export | Legacy generates XLSX in-page; modern has no endpoint | Not in this contract; the built design has no export control |

## API inventory (required)

| API | Purpose | Trigger (when it fires) | Cardinality | R/W | Cache posture | Split trigger |
|---|---|---|---|---|---|---|
| API 1: budget-vs-actual data | Buckets plus window totals for one scope, window, grain, asOf | Widget render; every scope, window, grain, or asOf change; special-report Apply; refresh; one call per panel at the Detail tier | 1 to 31 buckets plus one `total` object | R | LIVE per request | Baseline data read; grain gap and trigger gap against the two lookups |
| API 2: special report list | Report names for step one of the report dialog | Dialog open | Customer-created list, ceiling [TO CONFIRM] (Feargal) | R | TTL, minutes-scale; changes rarely | Lifetime gap (rarely-changing lookup vs live data) and trigger gap (fires on dialog open, never on render) |
| API 3: special report lines | Lines within one chosen report, for step two of the dialog | Report chosen in the dialog; dialog open when a report is already applied (prefill) | 2 to 4 per report [BUILD]; ceiling [TO CONFIRM] (Feargal) | R | TTL, minutes-scale | Cascade lookup: takes `specialReportId` as a param; lifetime gap and trigger gap |

Considered and settled: API 2 and API 3 stay separate rather than merging into one nested payload because API 3 is a cascade keyed by the chosen report and API 2 must render before any report is chosen; both already exist as separate endpoints, and merging would fetch every org report's lines for a dialog that usually needs one report's. API 1 stays one endpoint across all windows and grains (the Time Window Module contract) because every combination returns the same bucket shape; splitting per grain would multiply endpoints with no cardinality, lifetime, or grain gap between them.

## Call sequence (required)

| Interaction | Calls fired | Notes |
|---|---|---|
| Initial widget load | API 1 | Defaults: `accountType=0`, `window=this_fiscal_year`, `grain` omitted (server resolves month), `asOf` omitted (today) |
| Change scope to Income or Expense | API 1 | One round trip |
| Open the special-report dialog | API 2; plus API 3 when a report is already applied | Prefill; no data call yet |
| Change the report inside the dialog | API 3 | Pending line selection cleared client-side |
| Apply the special report | API 1 with `accountType=2` and `specialReportLineId` | Apply is disabled until both report and line are chosen, so an incomplete pair can never reach the wire |
| Change window | API 1 | An invalid grain snaps client-side to the new window's smallest available grain before the call |
| Change grain | API 1 | Window unchanged |
| Switch view (Bar / Line / Table) | none | Client re-render over the held response |
| Sort the table | none | Client re-order of the held buckets |
| Change one panel's grain at the Detail tier | API 1 for that panel only | The two panels share scope, window, and `asOf`; each holds its own grain's response |
| Refresh | API 1 (both panel calls at the Detail tier) | Fresh `asOf` |

Shared snapshot anchor: at the Detail tier the two panel calls pass the same `asOf` and both responses echo it. The echoes matching is the consistency proof; on a mismatch the client re-issues both calls. A single-panel tier needs no anchor beyond its own echo.

## Filter architecture (required)

| Filter | Option source | Cardinality | Execution | Aggregate effect | Cascade | "All" wire form | Round trips |
|---|---|---|---|---|---|---|---|
| Scope | STATIC enum: `0` Income accounts, `1` Expense accounts, `2` Special report line | 3 | SERVER `accountType` | Yes: every figure re-queries | Choosing Special report requires the report-then-line dialog before any data call | No "All" state exists; the scope is always exactly one of the three | 1 (API 1) |
| Report name (dialog step one) | LOOKUP API 2: `GLSpecialReport` where `HasLines` is true, ordered by `Name` | Customer-created; [TO CONFIRM] (Feargal) | SERVER, indirectly: only the resulting `specialReportLineId` is ever a data param | Yes, once applied | Line list depends on it; changing the report clears the pending line, never keeps a stale one | n/a: there is no all-reports data read | 1 (API 3 when it changes) |
| Report line (dialog step two) | LOOKUP API 3: `GLSpecialReportLine` within the chosen report, ordered by `LineNumber` | 2 to 4 per report [BUILD]; ceiling [TO CONFIRM] (Feargal) | SERVER `specialReportLineId` | Yes | Depends on report name (see above) | n/a: a line is mandatory when the scope is Special report | 1 (API 1 on Apply) |
| Window | STATIC enum: `this_month`, `this_period`, `this_quarter`, `this_year`, `this_fiscal_year` | 5 | SERVER `window` | Yes: `total` recomputes over the new window | Constrains grain availability (the 2-to-31 law) | n/a: a window is always selected; the default is `this_fiscal_year` | 1 (API 1) |
| Grain | STATIC enum: `day`, `week`, `month`, `period`, `quarter`, `year`, gated per window by the availability matrix | 6 | SERVER `grain` | Yes: sub-period grains change the budget basis (`budgetDerived`) | Depends on window; an omitted grain resolves server-side to the window's smallest available grain | Omitting the param is the only "default" form; there is no all-grains read | 1 (API 1) |
| View (Bar / Line / Table) | STATIC: bar, line, table | 3 | CLIENT: the full set is already present in the held response, provably bounded at 31 buckets by the availability law, and switching it changes no server-computed aggregate | No | No | n/a | 0 |
| Table sort | STATIC: four columns, two directions | 8 | CLIENT: same three conditions; a re-order of at most 31 held rows touching no aggregate | No | No | n/a | 0 |

- **Combination semantics:** AND across all filters; exactly one scope, one window, one grain per call. No pair is OR and no pair is mutually exclusive beyond the availability matrix.
- **Conflict rules:** `specialReportLineId` present with `accountType` 0 or 1, or `accountType=2` with no `specialReportLineId`, is rejected with HTTP 400 `invalidParams`; nothing is silently ignored and no param takes precedence. A grain invalid for the window is rejected with HTTP 400 `invalidGrain` listing `allowedGrains`; the server never substitutes a grain silently.
- **Cascade invalidation:** the line list is keyed by `specialReportId`; when the report changes, the pending line is cleared to unselected and Apply stays disabled until a new line is chosen.
- **Empty results:** a valid combination matching nothing (for example a line whose account range holds no accounts) returns a well-formed zero response, not an error: `buckets[]` present with `budget` 0 or null and `actual` null, `total.actual` 0, `total.variance` and `total.variancePercent` null.
- **Blank values:** no filterable field is free-text or nullable here, so no blank-row wildcard rule is needed; scope, window, and grain are always exactly one enum value each.
- **Lookup endpoints:** both lookups are the pre-existing filters and special-report-lines endpoints, extended with one field each (see Old vs. new); they appear in the API inventory as API 2 and API 3.

## Volume and performance (required)

| Dataset | Typical rows | Worst realistic rows (basis) | Row width | Payload at worst | Verdict | Server cost model | Cache posture |
|---|---|---|---|---|---|---|---|
| API 1 `buckets[]` | 12 (month grain on the fiscal-year window) [BUILD] | 31: the 2-to-31 availability law caps every window and grain pairing; day grain on a 31-day month is the ceiling [DOC, Time Window Module] | 5 fields, about 90 bytes | About 3 KB | BOUNDED | Month and coarser: indexed aggregate over `GLSummary` joined to `GLPeriod`, one or two fiscal years of budget rows. Day and week: a transaction scan over `GLJournalDetail` rows inside the window across the scoped accounts; the multiplier is journal lines in window, not buckets | LIVE per request |
| API 2 reports | Single digits at the demo org [BUILD] | [TO CONFIRM] (Feargal): customer-created, no ceiling known | 3 fields, about 60 bytes | Unknown until the ceiling is confirmed | BOUNDED, assumed; flips to a searchable server-side lookup if the confirmed ceiling passes about 200 | Single indexed scan of `GLSpecialReport` by `CompanyID`, `HasLines` true | TTL, minutes-scale |
| API 3 lines in one report | 2 to 4 [BUILD] | [TO CONFIRM] (Feargal) | 3 fields, about 60 bytes | Small | BOUNDED, assumed, same condition as API 2 | Indexed scan by `SpecialReportID`, plus one classification pass over `GLAccount.StatementType` in each line's range to derive `type` | TTL, minutes-scale |

The bucket series is one entity (the scope aggregate) by up to 31 points, so the N by M product is at most 1 by 31 per request; there is no per-entity series and no fan-out. The build re-renders grain changes instantly because the mock holds synthetic daily data client-side; that is a fixture property. In production a grain change is a server re-query, because sub-period actuals are transaction-level queries and sub-period budgets are a server derivation, and this contract says so plainly rather than mirroring the build.

### Pagination contract

Nothing paginates: every dataset verdict above is BOUNDED, so no pagination, server-side sort, or `totalCount` machinery applies to this contract.

## Where computation lives (required)

| Value | Server or client | Basis | Why |
|---|---|---|---|
| Sign normalisation (Income times -1, Expense times +1, `ReverseSign` on a special line) | Server | Existing convention [CODE] | The client never sign-corrects raw GL amounts |
| Bucketing to the requested grain, including quarter and year rollups keyed to each month's own fiscal year | Server | `buckets[]` | Needs the org's `GLPeriod` calendar and cross-year keys the client does not hold |
| `total.budget` and `total.actual` over posted buckets | Server | `total` | One authority for the headline; the posted-only basis is a rule, not client improvisation |
| `total.variance` | Server | Pre-signed delta, `total.actual - total.budget` | Returned signed; the client formats and never subtracts across the wire |
| `total.variancePercent` | Server | Null when `total.budget` is 0 | The divider owns the division-by-zero rule: null, never 0 or an error |
| Per-bucket variance | Client | `buckets[].budget`, `buckets[].actual` | Pure arithmetic over two values in the same returned object |
| Favourability direction (over budget reads favourable on income, unfavourable on expense; a mixed line is neutral) | Client | `accountType`, `lineType` | Presentation banding over the returned sign; the flip is a display rule |
| "Total, posted so far" footer | Client | Posted buckets | The full bounded set is present; must equal `total` when the grain covers the window |
| Table sort order | Client | Bounded set, 31 rows maximum | No aggregate is affected |
| Grain availability matrix | Client and server, duplicated | The 2-to-31 law [DOC, Time Window Module] | Client disables, server rejects; the two rules must never disagree |
| `partial` flag | Server | Window edges plus posting state | The client cannot know posting state |
| Sub-period budget figures (pace line or proration) | Server | `budgetDerived` | The derivation choice is server work and is reported honestly in the response |
| No-budget state trigger | Client | Every bucket's `budget` is 0 or null | A rule over the held set |
| Trend guard (fewer than two points) | Client | `buckets[]` length | Presentation rule |

Deltas come back pre-signed. The only server-computed percentage is `total.variancePercent`, and its division-by-zero rule is stated above. No numeric presentation threshold exists beyond the sign of the variance, so nothing is waiting on a threshold approval.

## API 1: budget-vs-actual data (required)

### Endpoint

```
GET /api/dashboard/budget-vs-actual/data
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `accountType` | int enum | yes | `0` \| `1` \| `2` | none | `0` Income accounts, `1` Expense accounts, `2` Special report line |
| `specialReportLineId` | guid | only when `accountType=2` | any line id from API 3 | none | The one Special Report Line to read; forbidden with `accountType` 0 or 1 |
| `window` | string enum | yes | `this_month` \| `this_period` \| `this_quarter` \| `this_year` \| `this_fiscal_year` | none | `this_quarter` and `this_year` are rolling, anchored to `asOf`; the others are the current calendar month, current fiscal period, and fiscal year to date |
| `grain` | string enum | no | `day` \| `week` \| `month` \| `period` \| `quarter` \| `year` | the window's smallest available grain | Validated per window by the 2-to-31 rule with the module's two summary exceptions; invalid combinations are rejected, never substituted |
| `asOf` | date | no | any valid date | today, server date | Anchors the rolling windows and the posted-total basis; a historical `asOf` reproduces that past report exactly |

The company context header is `X-Company-ID` (see Auth and scoping). There is no fiscal-year header: the server derives the fiscal year(s) from `window` + `asOf` + the org's own `GLPeriod` calendar.

The omitted-grain default is a contract rule, not a convenience: the server resolves it to the window's smallest available grain (day, day, week, month, month for the five windows in order), and the client's snap-on-window-change behaviour assumes exactly this rule, so the two must never disagree. [DOC, Time Window Module]

### Example requests

```
GET /api/dashboard/budget-vs-actual/data?accountType=0&window=this_fiscal_year&grain=month&asOf=2026-09-02
GET /api/dashboard/budget-vs-actual/data?accountType=2&specialReportLineId=3fa85f64-5717-4562-b3fc-2c963f66afa6&window=this_month&grain=week&asOf=2026-08-31
```

Guids and dates contain no characters needing URL encoding; if a future param ever does, encode it.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `accountType` | int | DERIVED, request echo [BUILD] | Echo of the request |
| `window` | string | DERIVED, request echo [BUILD] | Echo of the resolved window |
| `grain` | string | DERIVED, server-resolved echo [DOC, Time Window Module] | The resolved grain, meaningful when the request omitted it |
| `asOf` | date | DERIVED, server-resolved echo [DOC, Time Window Module] | The resolved anchor; the Detail tier's consistency proof |
| `generatedAt` | datetime, UTC | NEW server stamp [DOC, template convention] | Generation time |
| `budgetDerived` | string | NEW [DOC, Time Window Module] | Present only when `grain` is `day` or `week`: `"paceLine"` (recommended), `"prorated"`, or `"native"`. How sub-period budget figures were produced |
| `lineType` | string | NEW, DERIVED: all accounts in the line's range `StatementType=I` is `"income"`, all `E` is `"expense"`, otherwise `"mixed"` [CODE, `GLAccount.StatementType`] | Present only when `accountType=2`; drives the favourability flip and the neutral treatment of mixed lines |
| `total` | object | DERIVED, see leaves | Window totals over posted buckets only |
| `total.budget` | number | DERIVED: `SUM(GLBudgetDetail.Budget)` over buckets with posted actuals, original rows only, sign-adjusted [CODE formulas; posted-only basis per the built Final] | The budget the posted actuals are compared against; at sub-period grains with `budgetDerived: "paceLine"` it is the budget pace at `asOf` |
| `total.actual` | number | DERIVED: `SUM(GLSummary.Amount)` over posted buckets, sign-adjusted [CODE] | Sum of posted actuals in the window |
| `total.variance` | number or null | NEW, DERIVED: `total.actual - total.budget`, signed [BUILD headline formula] | Null when no bucket has posted actuals |
| `total.variancePercent` | number or null | NEW, DERIVED: `total.variance / total.budget * 100`, one decimal [BUILD] | Null when `total.budget` is 0 or `total.variance` is null |
| `buckets[]` | array | DERIVED, see leaves | Always chronological; one entry per grain unit in the window |
| `buckets[].start` | date | DERIVED from `GLPeriod` boundaries or calendar math per grain [CODE, `GLPeriod`] | Inclusive range start |
| `buckets[].end` | date | DERIVED, as above | Inclusive range end |
| `buckets[].budget` | number | DERIVED: `SUM(GLBudgetDetail.Budget)` per bucket at period grain and coarser [CODE]; NEW derivation per `budgetDerived` at day and week | The bucket's budget figure |
| `buckets[].actual` | number or null | DERIVED: `SUM(GLSummary.Amount)` per bucket [CODE]; NEW at day and week via `GLJournalDetail` [CODE, Q2] | Null for unposted buckets, never 0: null means nothing posted yet |
| `buckets[].partial` | boolean | NEW flag: bucket cut by a window edge, or in progress at `asOf` | The client marks these visually |

### Example response

Fiscal-year window at month grain for a calendar-aligned org; fiscal calendars vary per org, so buckets always follow the org's own `GLPeriod` calendar. The two unposted months carry null actuals and sit outside `total`.

```json
{
  "accountType": 0,
  "window": "this_fiscal_year",
  "grain": "month",
  "asOf": "2026-09-02",
  "generatedAt": "2026-09-02T09:00:00Z",
  "total": {
    "budget": 312000,
    "actual": 317900,
    "variance": 5900,
    "variancePercent": 1.9
  },
  "buckets": [
    { "start": "2026-01-01", "end": "2026-01-31", "budget": 42000, "actual": 44200, "partial": false },
    { "start": "2026-02-01", "end": "2026-02-28", "budget": 42000, "actual": 40100, "partial": false },
    { "start": "2026-03-01", "end": "2026-03-31", "budget": 44000, "actual": 47300, "partial": false },
    { "start": "2026-04-01", "end": "2026-04-30", "budget": 44000, "actual": 41800, "partial": false },
    { "start": "2026-05-01", "end": "2026-05-31", "budget": 46000, "actual": 48900, "partial": false },
    { "start": "2026-06-01", "end": "2026-06-30", "budget": 46000, "actual": 43500, "partial": false },
    { "start": "2026-07-01", "end": "2026-07-31", "budget": 48000, "actual": 52100, "partial": false },
    { "start": "2026-08-01", "end": "2026-08-31", "budget": 48000, "actual": null, "partial": false },
    { "start": "2026-09-01", "end": "2026-09-30", "budget": 50000, "actual": null, "partial": true }
  ]
}
```

Reconciliation: posted budgets 42000 + 42000 + 44000 + 44000 + 46000 + 46000 + 48000 = 312000, matching `total.budget`; posted actuals 44200 + 40100 + 47300 + 41800 + 48900 + 43500 + 52100 = 317900, matching `total.actual`; and 312000 + 5900 = 317900, so `total.variance` is 5900 and `total.variancePercent` is 1.9 (5900 over 312000, one decimal). The August and September budgets (48000 and 50000) are deliberately outside `total`, which is the posted-only basis the headline and the posted-so-far footer both use.

A second shape, showing the conditional fields: a special report line (expense) on the month window at week grain, `asOf` at month end. `budgetDerived` reports the pace-line basis and `lineType` drives the favourability flip.

```json
{
  "accountType": 2,
  "window": "this_month",
  "grain": "week",
  "asOf": "2026-08-31",
  "generatedAt": "2026-08-31T18:00:00Z",
  "budgetDerived": "paceLine",
  "lineType": "expense",
  "total": {
    "budget": 28000,
    "actual": 27600,
    "variance": -400,
    "variancePercent": -1.4
  },
  "buckets": [
    { "start": "2026-08-01", "end": "2026-08-02", "budget": 1806, "actual": 1750, "partial": true },
    { "start": "2026-08-03", "end": "2026-08-09", "budget": 6323, "actual": 6100, "partial": false },
    { "start": "2026-08-10", "end": "2026-08-16", "budget": 6323, "actual": 6420, "partial": false },
    { "start": "2026-08-17", "end": "2026-08-23", "budget": 6323, "actual": 6180, "partial": false },
    { "start": "2026-08-24", "end": "2026-08-30", "budget": 6322, "actual": 6300, "partial": false },
    { "start": "2026-08-31", "end": "2026-08-31", "budget": 903, "actual": 850, "partial": true }
  ]
}
```

Reconciliation: week budgets 1806 + 6323 + 6323 + 6323 + 6322 + 903 = 28000, matching `total.budget`; week actuals 1750 + 6100 + 6420 + 6180 + 6300 + 850 = 27600, matching `total.actual`; and 27600 + 400 = 28000, so `total.variance` is -400 (actual minus budget, signed) and `total.variancePercent` is -1.4. On an expense line the client reads -400 as under budget and therefore favourable; the server never bakes favourability into the sign.

### State contracts

| State | Response |
|---|---|
| Empty (scope matches no data) | 200 with `buckets[]` for the window, every `actual` null, `total.actual` 0, `total.variance` and `total.variancePercent` null. Not an error |
| No budget entered | 200 with real actuals and `budget` 0 (or null where genuinely absent) on every bucket; never a fabricated figure that reads as fully over budget. The client renders its set-up state from this |
| Partial (window extends past posted data) | 200; unposted buckets carry `actual` null, in-progress buckets carry `partial` true, `total` spans posted buckets only |
| Not-yet-existing entity (window predates the org's GL data) | 200 with whatever `GLPeriod` rows exist; a window touching no periods returns an empty `buckets[]` and a null-variance `total` |
| Permission denied | 403 with an error body; final user-facing treatment is a product decision, see Still needs sign-off |
| Upstream unavailable | 503 with an error body; the client keeps the last held response and its `generatedAt` stamp |

## API 2: special report list (required)

### Endpoint

```
GET /api/dashboard/budget-vs-actual/filters
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| (none) | n/a | n/a | n/a | n/a | The list is scoped entirely by the `X-Company-ID` header |

### Example requests

```
GET /api/dashboard/budget-vs-actual/filters
GET /api/dashboard/budget-vs-actual/filters   (identical call after a report is created; TTL cache refreshes)
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `reports[]` | array | STORED source, see leaves | Reports with `HasLines` true, ordered by `Name` [CODE] |
| `reports[].id` | guid | STORED `GLSpecialReport.SpecialReportID` [CODE] | Report id |
| `reports[].name` | string | STORED `GLSpecialReport.Name` [CODE] | Customer-created report title |
| `reports[].lineCount` | int | NEW, DERIVED: `COUNT(GLSpecialReportLine)` per report | Shown beside the report name in the dialog |

### Example response

```json
{
  "reports": [
    { "id": "8c1f7a20-33e2-4b7e-9f5a-1a2b3c4d5e6f", "name": "Building & Facilities", "lineCount": 3 },
    { "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "name": "Statement of Activities", "lineCount": 4 }
  ]
}
```

Reconciliation: 2 report rows returned; each row's `lineCount` must equal the row count API 3 returns for that report id, so 3 + 4 = 7 lines exist across the two reports and API 3 must account for exactly 7 across both ids.

### State contracts

| State | Response |
|---|---|
| Empty (org has no special reports) | 200 with `reports: []`; the dialog renders with an empty report dropdown, not an error |
| Partial | n/a: the list has no partial condition |
| Not-yet-existing entity | n/a: the list is company-scoped only |
| Permission denied | 403; the Special report scope is additionally gated, see Auth and scoping |
| Upstream unavailable | 503; the dialog shows a retry state |

## API 3: special report lines (required)

### Endpoint

```
GET /api/dashboard/budget-vs-actual/special-report-lines
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `specialReportId` | guid | yes | any report id from API 2 | none | The report whose lines to list; unknown ids return a 404-style error |

### Example requests

```
GET /api/dashboard/budget-vs-actual/special-report-lines?specialReportId=3fa85f64-5717-4562-b3fc-2c963f66afa6
GET /api/dashboard/budget-vs-actual/special-report-lines?specialReportId=8c1f7a20-33e2-4b7e-9f5a-1a2b3c4d5e6f
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `lines[]` | array | STORED source, see leaves | Lines within the report, ordered by `LineNumber` [CODE] |
| `lines[].id` | guid | STORED `GLSpecialReportLine.SpecialReportLineID` [CODE] | Line id; the value API 1 takes as `specialReportLineId` |
| `lines[].name` | string | STORED `GLSpecialReportLine.Name` [CODE] | Customer-created line description |
| `lines[].type` | string | NEW, DERIVED: classified from `GLAccount.StatementType` over the line's low/high `AccountNumber` range; all `I` is `"income"`, all `E` is `"expense"`, otherwise `"mixed"` [CODE for the range mechanism] | Drives the dialog's type tag, the preview sentence, and the favourability flip before Apply |

### Example response

```json
{
  "lines": [
    { "id": "b2a4c6d8-1111-4222-8333-944455566677", "name": "Contributions & offerings", "type": "income" },
    { "id": "c3b5d7e9-2222-4333-8444-a55566677788", "name": "Salaries & wages", "type": "expense" },
    { "id": "d4c6e8f0-3333-4444-8555-b66677788899", "name": "Net change in assets", "type": "mixed" }
  ]
}
```

Reconciliation: 1 + 1 + 1 = 3 lines returned for this report, and the matching API 2 row's `lineCount` for this report id must also read 3 whenever the two responses are compared.

### State contracts

| State | Response |
|---|---|
| Empty (report has no lines) | 200 with `lines: []`; reports with `HasLines` false never appear in API 2, so this arises only from concurrent edits |
| Partial | n/a |
| Not-yet-existing entity (unknown or deleted `specialReportId`) | 404-style error naming the id, `unknownSpecialReport`; not an empty list, so a stale saved id is distinguishable from a genuinely empty report |
| Permission denied | 403, same gate as API 2 |
| Upstream unavailable | 503; the dialog shows a retry state |

## Auth and scoping (required)

- **Company / tenant scoping:** every request carries `X-Company-ID` and every query is scoped by it. The legacy `X-Year-ID` header is not part of this contract; fiscal years derive from `window` + `asOf` + `GLPeriod`.
- **Permission right, read:** the legacy widget is gated by the `/GeneralLedger` uri at Inquiry level, and the Special report scope is additionally gated by `/GeneralLedger/Reports/SpecialReports` at Inquiry [CODE, `Widget_Comparison_Classic.html`]. This contract carries both: API 1 with `accountType` 0 or 1 needs the General Ledger right; `accountType=2`, API 2, and API 3 also need the Special Reports right. The modern permission mapping is [TO CONFIRM] (Feargal).
- **Write:** none exists in this contract.
- **A user without the General Ledger right:** the legacy dashboard hides the widget entirely. Whether the replatform hides it, shows an empty card, or shows an error is a product decision, listed in Still needs sign-off. A user with the GL right but not the Special Reports right sees the Income and Expense scopes only.

## Edge cases (required)

1. Valid scope matching no data: well-formed zero response per the state contract, never an error.
2. No budget entered anywhere in the window: honest `budget` 0 or null with real actuals; the API must never fabricate a comparison.
3. Unposted buckets: `actual` null, never 0; `total` sums posted buckets only.
4. `asOf` in a prior fiscal year: windows, fiscal-year resolution, and the posted basis all compute from `asOf`, reproducing the past report exactly.
5. `asOf` in the future, or before any GL data exists: validation semantics undecided, see Still needs sign-off; recommended is HTTP 400 `invalidAsOf`.
6. Rolling window crossing the fiscal-year seam: budget lookup spans two fiscal years in one request; quarter and year buckets key each month to its own fiscal year; the seam is per org, never a fixed month.
7. Master company (`CompanyNumber` 0): combined child figures via the `MasterAccountID` join; a consolidated org with no linked children returns the normal empty shape.
8. Special report line deleted between requests: API 1 returns a 404-style `unknownSpecialReportLine` error naming the id; never a silent empty payload, so a stale saved selection is distinguishable from an empty line.
9. Line whose account range matches no accounts: well-formed zero response, not an error.
10. Conflicting params (`specialReportLineId` with `accountType` 0 or 1; `accountType=2` without a line id): HTTP 400 `invalidParams`; no precedence, no silent ignoring.
11. `total.budget` 0 with posted actuals: `total.variancePercent` null; the variance dollar figure still returns.
12. Periods named `"Audit"`: excluded from every bucketing and every window.
13. Orgs with 13 or more periods, or non-month periods: period grain follows the org's real `GLPeriod` rows, so bucket counts can exceed 12; behaviour of the availability matrix on such calendars is [TO CONFIRM] (Feargal).
14. Entity created mid-window: buckets before the first `GLPeriod` row simply do not exist; the response starts at the org's first real period.

## Not in scope (required)

- Drill-through to GL account or transaction detail: not built anywhere in the design; there is no target page. Account-level drilldown may be revisited during UAT as a later phase.
- An Excel or CSV export endpoint: the built design has no export control. The legacy in-page export is not carried; building a modern equivalent is a separate decision.
- Per-user preference persistence: scope and line selection are client-managed state in this contract; regaining server persistence is listed in Still needs sign-off as a product decision.
- Per-account or per-transaction rows: bucket aggregates only, even where day and week actuals query transactions underneath.
- Revised budgets: the comparison is always against the original budget (`RevisionStartingPeriodID` null), by design; no revised-budget view exists.
- Budget setup: the empty state's action navigates to the General Ledger module; no write belongs to this contract.
- A cumulative (year-to-date running) series: the legacy `ActualYTD` and `BudgetYTD` columns have no consumer in this design and are not returned.

## Still needs sign-off (required)

1. **Day and week actuals posture.** The data exists at transaction grain (`GLJournalDetail.DetailDate` [CODE]); undecided is live transaction querying vs a day-grain rollup, and its cost at scale. Decider: Feargal / dev team. Blocks: shipping the day and week grains.
2. **Sub-period budget derivation.** `"paceLine"` (recommended) vs `"prorated"` vs `"native"`; the response reports the choice via `budgetDerived`. Decider: dev team. Blocks: day and week budget figures and the `total.budget` basis at those grains.
3. **Master-company aggregation detail.** The `MasterAccountID` join is an agreed must-fix; the exact dedupe and aggregation rule across child accounts needs a dev answer. Decider: dev team. Blocks: consolidated orgs.
4. **Which line kinds API 3 offers.** Whether subtotal, heading, computed, or balance-sheet lines appear in the dropdown, and whether balance-sheet lines carry budgets at all (an open dossier question). Decider: Oisin Curran plus dev. Blocks: the API 3 filter rule and the mixed-line guardrail wording.
5. **Unentitled-user treatment.** Hidden widget vs empty card vs error, for a user without the General Ledger right. Decider: Oisin Curran. Blocks: the final permission-denied state contract.
6. **User preference persistence.** Legacy remembered each user's scope per company; decide whether the modern API regains this or client-managed state is permanent. Decider: Oisin Curran. Blocks nothing in this contract; changes a future one.
7. **Rounding, currency, and locale rules.** Amounts here are plain numbers; display formatting rules are unspecified and a known dossier flag touches localisation defects. Decider: Oisin Curran. Blocks: response formatting guidance only.
8. **`asOf` validation semantics.** Calendar-month blocks vs day-precise offsets for the rolling walk-back; future dates; dates before any GL data. Decider: dev team. Blocks: rolling-window edge behaviour.
9. **Volume ceilings for special reports and lines.** [TO CONFIRM] (Feargal). Conditions the two assumed BOUNDED verdicts and the plain-dropdown treatment of both lookups.
10. **Dossier findings F1 to F9 are all Unreviewed.** No reconciliation file exists for this widget and no finding has been assigned a status, so none is honoured or overruled here. The ones touching this contract's data shapes: F3 (week grain, item 1 above), F7 (surfacing the original-budget-only basis to users), F8 (localisation, item 7), F9 (Selected-scope guardrails, item 4). Decider: Oisin Curran assigns statuses; the spec picks no side.
11. **Line Description source, formal closure.** The question is answered in code: the line dropdown is `GLSpecialReportLine.Name`, a customer-created list managed in the Special Reports module, and the owner has ruled it closed. Listed only so the still-open review checkbox can be formally ticked. Decider: Oisin Curran.
