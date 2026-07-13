# Purpose Document: Budget Compared to Actual

> This is a **Purpose document** — Step 1 in the dashboard project lifecycle. Its job is to capture what currently exists, so that Feedback, Design, and Development can be based on documented reality rather than assumptions. It is written for all readers, not just technical ones.

**Date:** 2026-07-06
**Investigated by:** Oisin / Claude
**Module / Area of the system:** General Ledger

---

## 1. Purpose
To show how the organisation's actual income or spending compares to what was budgeted, across each period of the financial year. It helps users quickly see where they are ahead of or behind their financial plan — both month by month and as a running total for the year.

## 2. Where the Data Comes From
This chart pulls from two places in the General Ledger (the system that records all financial transactions):

- **Actual figures** — the real amounts that have been posted to the accounts (confirmed, recorded transactions)
- **Budget figures** — the original planned amounts set at the start of the financial year. Only the original budget is used — any mid-year budget adjustments are intentionally left out, so the comparison is always against the plan as it was first agreed

The user can configure the chart to show one of three things: all income accounts, all expense accounts, or a specific custom grouping of accounts. That choice is saved per user, so the chart remembers your preference next time.

When viewing a consolidated organisation (one that rolls up multiple entities), the chart combines figures from all child accounts automatically.

**Database tables used:**

| Table Name | What it holds |
|---|---|
| GLSummary | Posted actual transaction totals per account and period |
| GLBudgetDetail | Original budget amounts per account and period |
| GLPeriod | Fiscal periods for the year, excluding any period named "Audit" |
| GLAccount | Accounts filtered to StatementType Income ("I") or Expense ("E") |
| SSUserTenantPreferenceRepository | Each user's saved chart configuration (which account view they last selected) — key: `UserPreferences.WidgetBudgetComparedToActual` |

**Confirmed correct** against the legacy `BudgetComparedToActual : DataPanelControl` class (`/GeneralLedger`) — verified via `Widget_Comparison_Classic.html`, 2026-07-08.

**Formulas / calculation logic (from Classic Widget Comparison):**
- **Actual** = `SUM(GLSummary.Amount)` per period, × sign multiplier
- **Budget** = `SUM(GLBudgetDetail.Budget)` per period, × sign multiplier, **where `RevisionStartingPeriodID = null`** — this is what "only the original budget is used" means technically: any budget revision row has a non-null `RevisionStartingPeriodID` and is excluded
- **Sign multiplier:** Income accounts × −1, Expense accounts × +1. When the account grouping is a Special Report Line, the line's own `ReverseSign` flag is used instead
- **YTD (right chart):** running cumulative sum — `ActualYTD[i] = Actual[0..i].Sum()`, same pattern for `BudgetYTD`
- **Periods included:** `GLPeriod` rows for the year, `ORDER BY Period`, excluding any period named `"Audit"`
- **Special Report Line grouping:** resolved via `ReportHelpers.SpecialReportAccounts(selectedLine, year, ctx)` — matches accounts whose `AccountNumber` falls within the report line's configured low/high range
- **Consolidated organisations:** child-account figures are combined by joining `GLAccount` via `MasterAccountID` (the mechanism behind "combines figures from all child accounts automatically" in Section 1)

## 3. What It's Telling Us
Two charts sit side by side, both covering the full financial year (July to June):

- **Left chart** — how actual figures compare to the budget for each individual period. At a glance you can see which months hit the target and which fell short.
- **Right chart** — the same comparison but as a running year-to-date total. This shows whether the gap between actual and budget is growing or shrinking over the course of the year.

## 4. How It's Displayed
- **Left:** A bar chart with two bars per month — one for actual (orange), one for budget (purple)
- **Right:** A line chart with two lines — actual year-to-date (orange) and budget year-to-date (yellow), with markers at each data point
- The horizontal axis shows financial periods from July to June, excluding any audit period
- The vertical scales differ between the two charts — the right chart is much larger as it shows cumulative totals

## 5. Filters & Controls
- **Account selection** — a settings panel lets the user choose whether to view income accounts, expense accounts, or a specific report grouping. The third option opens two further dropdowns to narrow down to a specific section of the accounts. This setting is saved and remembered per user.
- **Refresh** — reloads the chart with the latest data
- **Export to Excel** — downloads a spreadsheet with the period-by-period and year-to-date figures for both actual and budget
- **Collapse** — minimises the chart widget on the dashboard

## 6. How It Connects to Other Parts of the Dashboard
- Saving a new account selection triggers an automatic data refresh — both charts update together
- The chart type selector (the dropdown at the top of the widget) can replace this chart entirely with a different dashboard widget
- _Whether this chart responds to any filters applied elsewhere on the dashboard is not yet confirmed — needs investigation_

## 7. Open Questions
- Does this chart respond to any global filters applied across the whole dashboard?
- Is the July–June financial year fixed, or can it be configured differently per organisation?
- What exactly is called when the Refresh button is pressed?

