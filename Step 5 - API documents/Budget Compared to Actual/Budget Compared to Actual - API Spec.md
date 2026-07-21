# Budget Compared to Actual — API Spec

**Status: DRAFT — not final**

## Tables

| Table | Fields used |
|---|---|
| `GLSummary` | Posted actual amounts per account and period |
| `GLBudgetDetail` | Budget amounts per account and period, `RevisionStartingPeriodID` |
| `GLPeriod` | Period, YearID — fiscal periods for the year, excluding any period named `"Audit"` |
| `GLAccount` | AccountNumber, StatementType (`I`/`E`), `MasterAccountID` |
| `GLSpecialReport` | Report titles (the "Special Report Title" dropdown) |
| `GL_SpecialReportLine` | LineNumber, Name/description, low/high `AccountNumber` range — the "Special Report Line" dropdown within a selected report |

No new tables. Everything below is new queries and new response fields against the same tables the legacy and modern widgets already use.

**Correction — "Line Description" is the existing Special Report Line dropdown, not an unconfirmed field.** `Step 4`'s design doc originally left "Line Description" open with a guess that it might be a fixed, hard-coded list. It isn't — the legacy widget's Special Report Filter UI is two dropdowns (Special Report Title, then Special Report Line *within* that report, ordered by `LineNumber`), and the modern API already has a matching endpoint (`GET /special-report-lines?specialReportId={guid}`, returns `List<DropDownItem>`). "Line Description" is this second dropdown's label text — a real, already-built field, not a separate open question.

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Endpoint | `GET /api/dashboard/budget-vs-actual/data?accountType={0\|1\|2}&specialReportLineId={guid}` returns `List<BudgetVsActualPeriodDto>` — no variance, no totals | Same endpoint, response extended with pre-computed per-period variance and a top-level `total` object for the fiscal year |
| Master company (consolidated) | **Broken.** Modern API returns an empty list for `CompanyNumber=0`. Legacy joined child accounts via `GLAccount.MasterAccountID` | **Must fix** — reinstate the `MasterAccountID` join so consolidated orgs return combined figures, matching legacy |
| User preference persistence | Legacy saved each user's last Account Type + Special Report Line via `SSUserTenantPreferenceRepository` (`UserPreferences.WidgetBudgetComparedToActual`) | Not implemented in the modern API — client currently manages this state itself. Flagged below, not silently accepted |
| Excel/CSV export | Legacy generated XLSX directly in a button handler (`buttonExportToExcel_Click`) | No export endpoint exists yet. The redesigned widget's menu already includes "Download as Excel"/"Download as CSV" at every size except KPI — flagged below |
| Period grain | Monthly only (one row per `GLPeriod`) | Monthly unchanged; Quarterly is a client-side sum of 3 consecutive monthly rows — no new endpoint or param needed. Weekly has no day-level GL grain anywhere today — see "Still needs sign-off" |
| Variance | Not returned — legacy and modern both leave `Actual - Budget` for the caller to compute | Server pre-computes `variance`/`variancePercent` per period, plus once more for the fiscal-year `total`, matching the pre-computed-diff pattern used in every other spec in this folder |

## Request params

| Param | Type | Required | Default | Notes |
|---|---|---|---|---|
| `accountType` | enum `0\|1\|2` | yes | — | `0` = Income Accounts, `1` = Expense Accounts, `2` = Special Report Line (the redesign's "Custom Report") |
| `specialReportLineId` | guid | only if `accountType=2` | — | One Special Report Line, from `GET /special-report-lines?specialReportId={guid}` |

Fiscal year is chosen via the existing `X-Year-ID` header (set from the Fiscal Year filter — FY 2026/FY 2025/FY 2024), and company via `X-Company-ID` — neither is a new param. **Being able to change Fiscal Year in the filter is the only actual new function here**, and it's a per-request choice, not a global account-wide setting — one request still returns exactly one year's data. This is not a comparison feature like Deposit Accounts' `compareTo`; it never returns two years side by side.

Example requests:
```
GET /api/dashboard/budget-vs-actual/data?accountType=0
GET /api/dashboard/budget-vs-actual/data?accountType=2&specialReportLineId=3fa85f64-5717-4562-b3fc-2c963f66afa6
```

## Response shape

```json
{
  "accountType": 0,
  "total": {
    "budget": 248000,
    "actual": 245800,
    "variance": -2200,
    "variancePercent": -1
  },
  "periods": [
    {
      "periodId": 101,
      "period": "Jul",
      "displayValue": "Jul 2025",
      "actual": 79500,
      "budget": 82000,
      "variance": -2500,
      "variancePercent": -3
    },
    {
      "periodId": 102,
      "period": "Aug",
      "displayValue": "Aug 2025",
      "actual": 85100,
      "budget": 82000,
      "variance": 3100,
      "variancePercent": 4
    },
    {
      "periodId": 103,
      "period": "Sep",
      "displayValue": "Sep 2025",
      "actual": 81200,
      "budget": 84000,
      "variance": -2800,
      "variancePercent": -3
    }
  ]
}
```

- `total` comes first — it's the fiscal-year-to-date sum of `actual`/`budget`/`variance` across every period in `periods[]`, placed at the top so the KPI header strip (YTD Budget, YTD Actual, Variance, % Used) reads one object without waiting on the array.
- Each period only carries that period's own `actual`/`budget`/`variance`/`variancePercent` — no running/YTD fields per row. Anything cumulative lives in `total` only.
- `variance` = `actual - budget` (already sign-adjusted per the existing Income ×−1 / Expense ×+1 / Special-Report-Line `ReverseSign` convention, which is unchanged and confirmed correct). Positive doesn't always mean "favourable" — that flip is Account-Type-dependent and is a frontend colour decision, not something this endpoint decides.
- `variancePercent` = `variance` as a rounded percent of the matching `budget` (per-period against that period's `budget`; for `total` against the summed `budget`).

## Sort

Fixed — `periods[]` in `GLPeriod` order (chronological, "Audit" excluded). Not user-sortable, matches the Finance-domain default.

## Edge cases to confirm

1. **Empty year** — a fiscal year with no `GLBudgetDetail` rows at all (never budgeted). Empty `periods[]` and a zeroed `total`, or an explicit error?
2. **Division by zero in `variancePercent`** — a period with `budget: 0`. Return `null` instead of a percent, consistent with how the other specs in this folder handle it.
3. **Special Report Line with no accounts in range** — a `GL_SpecialReportLine` whose low/high `AccountNumber` range matches nothing this year. Empty `periods[]`, or an error?
4. **Master company with zero child accounts** — a consolidated company with no linked entities yet. Same shape as a normal empty result, or distinguishable somehow?
5. **`specialReportLineId` provided without `accountType=2`** — conflicting params. Ignore `specialReportLineId`, or reject the request?

## Not in scope

- **Weekly-grain data** — not being built against real data right now; see "Still needs sign-off."
- No per-transaction or per-account breakdown — this stays at period-level aggregation only, same as today.

## Still needs sign-off

- **Custom Report (Special Report Line) is the one to worry about most.** Every value here is customer-configured — each org defines its own Special Reports and Special Report Lines, with its own low/high `AccountNumber` ranges — so there's no single fixed shape to test against. The new `variance`/`total` fields and the master-company fix below both need explicit testing against real customer-configured reports, not just verified against the fixed Income/Expense paths.
- **Master company (`CompanyNumber=0`) rollup** — confirmed broken (returns empty today). Needs the `MasterAccountID` join reinstated; exact dedupe/aggregation logic across child accounts still needs a dev answer.
- **Weekly Period View** — no confirmed day-level GL transaction grain exists in `GLSummary`/`GLBudgetDetail` today. This needs a real feasibility answer, not just a confirmation — there's no partial support to build on.
- **Excel/CSV export endpoint** — the redesigned widget's menu already assumes this exists (Download as Excel/CSV, every size except KPI). No backend endpoint has been built. Needs a decision on whether/when to build it before this ships.
- **User preference persistence** — legacy remembered each user's last Account Type + Special Report Line. Decide whether the modern API should regain this (new preference-storage work) or whether client-managed state is acceptable permanently.
- **Fiscal year varying by organisation** — confirm the existing `X-Year-ID`/`X-Company-ID` header scoping (`GLPeriod` is per-company, per-year, not a hardcoded calendar range) already returns correct data for orgs whose fiscal year isn't July–June. Not a new feature to build, just needs a straight yes/no from backend.
