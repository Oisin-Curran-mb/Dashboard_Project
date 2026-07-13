# Purpose Document: Payroll Distributions

> This is a **Purpose document** — Step 1 in the dashboard project lifecycle. Its job is to capture what currently exists, so that Feedback, Design, and Development can be based on documented reality rather than assumptions. It is written for all readers, not just technical ones.

**Date:** 2026-07-06
**Investigated by:** Oisin / Claude
**Module / Area of the system:** Payroll

---

## 1. Purpose
To show a breakdown of payroll amounts by compensation type across a chosen date range. It helps users understand how total payroll spend is distributed across different pay categories — for example, salary, hourly, benefits, and allowances — for any period they choose to look at.

## 2. Where the Data Comes From
This chart pulls from payroll history records — the log of processed payroll runs and the individual compensation line items within each run. It totals up the amount per compensation type for any checks issued within the selected date range.

Voided checks are excluded, as are certain internal check types, so the figures reflect only real, valid payroll payments.

There is no stored/cached version of this data — every time the chart loads or refreshes, it queries the live payroll records fresh.

**Database tables used:**

| Table Name | What it holds |
|---|---|
| PRHistory | Payroll run records — each processed payroll, including check date and check type |
| PRHistoryCompensation | The individual compensation line items within each payroll run, including category and amount |

**Confirmed correct** against the legacy `PayrollDistributions : DataPanelControl` class (`/Payroll`) — verified via `Widget_Comparison_Classic.html`, 2026-07-08. No caching confirmed ("no caching — fresh query each time" in the legacy code comments).

**Formulas / calculation logic (from Classic Widget Comparison):**
- **Row filter:** `PRHistory WHERE CompanyID = ctx AND CheckDate BETWEEN beginDate AND endDate AND VoidJournalID = null AND CheckType != 2` (CheckType 2 = the excluded internal check type)
- **Amount per category** = `SUM(PRHistoryCompensation.Amount)`, `GROUP BY CompensationDistributionID, Name`
- **Sort:** `ORDER BY Name` (alphabetical) — matches Section 5's data table default
- Both dates are **required** inputs (no partial range) — beginning defaults to 1 Jan current year, ending to today

## 3. What It's Telling Us
A side-by-side view of a table and a pie chart, both showing the same breakdown: how total payroll spend across the selected date range is split across each compensation category. The total number of distributions and the overall amount are shown at the bottom of the table.

Hovering over a segment of the pie chart shows the exact amount for that category.

## 4. How It's Displayed
- **Left:** A table listing each compensation category alongside its total amount for the period, with a total row at the bottom showing the count of categories and the overall sum
- **Right:** A pie chart titled "By Distributions" — one segment per compensation category, labelled with the category name
- Both the table and chart show the same data and cover the same date range

## 5. Filters & Controls
- **Beginning date** — date picker, defaults to 1 January of the current year
- **Ending date** — date picker, defaults to today
- Both dates can be changed by the user; changing either and refreshing updates both the table and chart
- **Refresh** — reruns the query with the current date range selected

## 6. How It Connects to Other Parts of the Dashboard
- No drill-down available — clicking a row or chart segment does not open further detail
- Hovering over a pie segment reveals the amount for that category
- _Whether this chart responds to any filters applied elsewhere on the dashboard is not yet confirmed — needs investigation_

## 7. Open Questions
- Does this chart respond to any global filters applied across the whole dashboard?
- Is the chart type (pie vs. bar) fixed, or does it switch based on something?
- Can the date range be saved as a preference, or does it always reset to the default on page load?

