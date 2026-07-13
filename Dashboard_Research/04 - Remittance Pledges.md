# Purpose Document: Remittance Pledges

> This is a **Purpose document** — Step 1 in the dashboard project lifecycle. Its job is to capture what currently exists, so that Feedback, Design, and Development can be based on documented reality rather than assumptions. It is written for all readers, not just technical ones.

**Date:** 2026-07-06
**Investigated by:** Oisin / Claude
**Module / Area of the system:** Remittance

---

## 1. Purpose
To show how well the organisation is keeping up with its remittance pledge commitments — the regular financial obligations sent to a conference or denominational body. For each activity type, users can see what was pledged for the year, how much was expected by a given date, how much has actually been paid, what remains outstanding, and the percentage paid so far.

## 2. Where the Data Comes From
This chart pulls from the Remittance module, which tracks pledge obligations and payment history by activity type. The data is scoped to the current organisation and filtered by the "Receipts Thru" date the user selects — only payments recorded up to that date are counted.

The "Percent of year completed" figure shown above the table is not pulled from a database — it is calculated on the fly based on how many days have passed in the calendar year up to the selected date.

**Database tables used:**

| Table Name | What it holds |
|---|---|
| RM_Activity | Remittance activity type records, scoped by CompanyID (`RMActivityRepository` is the legacy repository class that queries this table, not a table itself — corrected here) |
| RM_PledgeDetail | Annual pledge amount per activity (only rows where the parent `RM_Pledge.Active = true` count) |
| RM_History / RM_HistoryDetail / RM_HistoryBatch | Payment history — a payment counts only if its batch is Posted, the journal isn't voided, and its check date is on or before the selected "Receipts Thru" date |

**Confirmed correct** against the legacy `RMPledges : DataPanelControl` class (`/Remittance`) — verified via `Widget_Comparison_Classic.html`, 2026-07-08. Cache note not previously documented: legacy uses a file-backed cache (`RMWidgetRecord`) that's invalidated when the company changes.

**Formulas / calculation logic (from Classic Widget Comparison):**
- **Percent of year completed** = `(DateReceiptsThru.DayOfYear − Jan1.DayOfYear + 1) / 365` — confirms Section 2's "calculated on the fly," and answers Open Question 3: it's a **calendar year** calculation (Jan 1 based), not fiscal year
- **Annual (pledged)** = `SUM(RM_PledgeDetail.Pledge)` `GROUP BY ActivityID`, where the parent pledge is Active
- **YTD Paid (received)** = `SUM(RM_HistoryDetail.Amount)` `GROUP BY ActivityID`, for history rows where `Batch.Posted = true AND VoidJournalID = null AND CheckDate <= ReceiptsThru`
- **YTD Expected** = `Annual × PercentOfYear` (derived, not stored)
- **Outstanding** = `Annual − YTD Paid`
- **% Paid** = `YTD Paid / Annual`

## 3. What It's Telling Us
A table showing each remittance activity type as a row, with the following columns:

- **Seq.** — the order in which activities are displayed
- **Activity** — the name of the remittance obligation (e.g. an apportionment or mission fund)
- **Annual** — the total amount pledged for the full year
- **YTD Expected** — how much should have been paid by the selected date, based on the proportion of the year elapsed
- **YTD Paid** — how much has actually been received up to the selected date
- **Outstanding** — the amount still owed for the full year
- **% Paid** — the percentage of the annual pledge that has been paid so far

A totals row at the bottom sums each column across all activities.

## 4. How It's Displayed
- **Table only** — there is no chart or graph for this widget
- Rows are ordered by sequence number
- A totals row is shown at the bottom

## 5. Filters & Controls
- **Date Receipts Thru** — a date picker that controls which payments are counted. Defaults to today, but the user can change it. The chosen date is remembered when the page is refreshed — it does not reset back to today.
- A "Percent of year completed" figure is shown alongside the date, giving context for how far through the year the selected date falls
- **Refresh** — reloads the data using the currently selected date

## 6. How It Connects to Other Parts of the Dashboard
- No drill-down or interactive elements — the table is view-only
- _Whether this chart responds to any filters applied elsewhere on the dashboard is not yet confirmed — needs investigation_

## 7. Open Questions
- Does this widget respond to any global filters applied across the whole dashboard?
- The date defaults to today but needs to be changed to show historical data — is this the intended behaviour, or should it default to something more useful?
- Is the "% of year completed" figure based on a calendar year (Jan–Dec) or the organisation's fiscal year?

