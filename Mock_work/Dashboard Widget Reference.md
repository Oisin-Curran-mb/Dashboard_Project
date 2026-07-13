# Dashboard Widget Reference

> This document covers all 17 available dashboard widgets. Widget Name and Screenshot columns are to be completed by the team. The Accounting Home Default Widget column is left blank pending sign-off from leadership.

## Status Key

| Status | Meaning |
|---|---|
| 🟢 Needs light review | Widget purpose and display are sound. Minimal user interaction. Work needed is primarily a visual UI update. |
| 🔵 Ready to re-design | Widget works but has design inconsistencies or UX issues that require rethinking — not just a skin change. |
| 🔴 Needs significant review | Complex widget with date/number filters, drill-downs, or large selection options. Requires careful design consideration. |

---

## Widget Table

| # | Widget Name | Screenshot | Widget Description & Use | Content Type | Status | Data it Pulls From | Accounting Home Default Widget |
|---|---|---|---|---|---|---|---|
| 1 | Budget Compared to Actual | | Compares actual vs budgeted GL amounts by fiscal period. Shows period-by-period bars and a running year-to-date line chart. User can configure to show income accounts, expense accounts, or a custom report line grouping. | Table, Graph | 🟢 Needs light review | GLSummary, GLBudgetDetail, SSUserTenantPreferenceRepository | |
| 2 | Pension Plans | | Shows annual pension plan contribution amounts by plan type, filterable by church district. Includes a pie chart and summary table. | Table, Graph | 🔵 Ready to re-design | PBAppointmentPlan, PBControlTable | |
| 3 | Payroll Distributions | | Shows payroll compensation totals by distribution category for a user-selected date range. Includes a pie chart and summary table. | Table, Graph | 🟢 Needs light review | PRHistory, PRHistoryCompensation | |
| 4 | Remittance Pledges | | Shows remittance pledge progress by activity type up to a selected date. Columns show annual amount, YTD expected, YTD paid, outstanding, and % paid. | Table | 🟢 Needs light review | RMActivityRepository | |
| 5 | Receivable Invoices Outstanding | | Shows outstanding AR invoices grouped into 5 aging buckets (Current through 121+ days). Clicking a bucket with a value drills into individual invoice detail, with expandable rows for line items, attachments, notes, and payments. | Table, Graph | 🔴 Needs significant review | ARInvoice, ARInvoiceDetail, APVendor | |
| 6 | Insurance Billing Plans | | Shows the number of employees and dependents enrolled per insurance plan, filterable by insurance type. Includes a pie chart and summary table. | Table, Graph | 🟢 Needs light review | IBPlan, IBType, IBEmployeePlans, IBEmployeeDependents | |
| 7 | Deposit Accounts | | Shows current ending balances for all active deposit accounts grouped by account type. The account type filter affects the table only — the pie chart always shows all types. | Table, Graph | 🔵 Ready to re-design | DHAccount, DHTypeRepository | |
| 8 | My Status | | A user-configurable panel showing live record counts for up to 21 selectable system queries. Rows with a count can either drill into a detail panel or navigate directly to a page elsewhere in the system. | Table | 🔴 Needs significant review | UserPreferences.MyStatus; varies per query | |
| 9 | Payroll Scheduled Time Off | | Shows scheduled employee time-off requests organised by department and employee, with an inline approval workflow. Supervisors can approve or reject individual days or bulk-approve all records for an employee. | Table | 🔴 Needs significant review | PREmployeeTimeOffApprovals, PayrollScheduledTimeOffFilters | |
| 10 | Loans With Balance Due | | Shows outstanding loan balances by loan type, with an aging pie chart. The loan type filter affects the table only — the chart always shows all loans. | Table, Graph | 🔵 Ready to re-design | LNLoan, LNInvoice, LNTypeRepository | |
| 11 | Fixed Asset Values | | Shows fixed asset financial values across 5 measures (Capitalized, Cost, Depreciable, Accumulated Depreciation, Net). Three cascaded dropdowns control grouping, specific group, and which financial measure to display. | Table, Graph | 🔴 Needs significant review | Fixed asset tables — TBC | |
| 12 | None | | An empty widget slot. Selecting this option renders a blank panel with no content. | — | 🟢 Needs light review | None | |
| 13 | Purchasing Management | | Shows purchase order requests filtered by approval status and approval path, with an encumbrance bar chart by GL period. The edit icon navigates to the full purchase order record for editing. | Table, Graph | 🔴 Needs significant review | Purchase order tables — TBC | |
| 14 | Main Content Tasks | | Displays up to 8 quick-access navigation links to common tasks for the current page. Content is determined automatically by the system based on page context and user permissions. | Table | 🟢 Needs light review | SSScreenSectionTask | |
| 15 | Bank Balances | | Shows bank account ending balances. Selecting a single account switches the entire widget to a transaction activity breakdown (Deposits, Voids, Checks, Withdrawals, EFT). | Table, Graph | 🔵 Ready to re-design | Bank account and transaction tables — TBC | |
| 16 | Accounts Payable By Due Date | | Shows outstanding AP invoices grouped by due date. The dates in the filter come directly from invoices in the system. The date filter affects the table only — the pie chart always shows all due dates. | Table, Graph | 🔵 Ready to re-design | APInvoice, APInvoiceDetail, APVendor | |
| 17 | Gifts Pledges | | Shows gift pledge progress by purpose up to a selected date. Columns show pledge total, amount due, received, due remaining, and percent due. | Table | 🟢 Needs light review | GFPledge | |

