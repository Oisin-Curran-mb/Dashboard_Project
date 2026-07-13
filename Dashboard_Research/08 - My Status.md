# Purpose Document: My Status

> This is a **Purpose document** — Step 1 in the dashboard project lifecycle. Its job is to capture what currently exists, so that Feedback, Design, and Development can be based on documented reality rather than assumptions. It is written for all readers, not just technical ones.

**Date:** 2026-07-06
**Investigated by:** Oisin / Claude
**Module / Area of the system:** Any — this widget spans multiple modules

---

## 1. Purpose
A personalised summary panel that shows the user a count of records that are relevant to them across different areas of the system. Each user chooses which items they want to track, so the widget looks different for each person. It is designed to surface things that need attention — unposted entries, pending approvals, upcoming reviews, and similar.

## 2. Where the Data Comes From
Each row in the widget is a query — a question asked of the system, such as "how many unposted journal entries are there?" The widget runs all of the user's selected queries and shows the result count for each one.

Only queries that the user has permission to access are available to them. The user's saved selection is stored as a preference and remembered across sessions.

**How the legacy system actually finds the 21 queries (mechanism, confirmed via Classic Widget Comparison):** the legacy code doesn't hardcode a list — it uses .NET reflection at runtime (`Reflection.GetTypesByInterface(typeof(IMyStatusQueries))`) to discover every class in the loaded assemblies that implements the `IMyStatusQueries` interface. Each of those 21 classes provides its own `GetCount()`, `GetUrl()`, `GetData()`, an `AccessUrl`, and column names. The widget then filters that full list down to only the queries the current user is allowed to see, via `ShelbyContext.Current.Allowed(query.AccessUrl, SecurityAccessType.Inquiry)`.

**Database tables used:**

| Table Name | What it holds |
|---|---|
| SSUserTenantPreference | The list of query keys each user has chosen to display, saved as a comma-separated preference string |
| _(varies per query — 5 of 21 confirmed so far)_ | See table below; the remaining 16 queries still need individual investigation |

**Confirmed table sources for 5 of the 21 queries (from Classic Widget Comparison — partially answers Open Question 1):**

| Query | Table / condition |
|---|---|
| Unpaid Accounts Payable by Due Date | `AP_Invoice WHERE !AllPaid AND Posted AND BankAccountID = ctx`, count |
| (AR equivalent, not in the 21-item list above but present in Modern API) | `AR_Invoice WHERE Posted = true AND UndoJournalID = null AND Outstanding != 0 AND CompanyID = ctx`, count |
| Purchasing Requests Needing My Approval / Next | `PO_Order WHERE Status = 0`, count |
| Scheduled Time Off | `PR_EmployeeOffSchedule WHERE ApprovedDate = null AND CompanyID = ctx`, count |
| Loans with balance due *(legacy-only; not present in the widget's own 21-item list but exists as a Modern API query)* | `LN_Loan WHERE BankAccountID = ctx`, count |

**⚠️ Major Modern API gap — relevant to the rebuild, not the legacy behaviour described above:** the Modern API does **not** reimplement the reflection-based discovery at all. It hardcodes just 5 query keys (`UnpaidAPInvoices`, `Outstanding[AR_Invoice]`, `OpenPORequests`, `PendingTimeOffRequests`, `LoansWithBalanceDue`) instead of the legacy's full 21. It also has no per-query access-control filtering (any authenticated user sees all 5), and the "save selected queries" endpoint is a stub that returns success but doesn't actually persist anything. This is the single biggest legacy-vs-Modern-API functionality gap found across all 17 widgets — flag prominently for product/dev before this widget is rebuilt.

## 3. What It's Telling Us
A simple two-column table: the name of each tracked query, and the number of records currently matching it. At a glance, a user can see which areas of the system have items waiting for their attention. Rows showing zero have nothing to action; rows with a count indicate something to review.

## 4. How It's Displayed
- **Table only** — two columns: Query name and record count
- No chart
- Rows with a count may show additional icons indicating whether clicking will open a detail view or navigate elsewhere in the system
- When empty (no queries selected), the widget shows "No records to display"

## 5. Filters & Controls
- **Select button** (top right) — opens a configuration panel where the user can choose which queries to display. Available queries are shown on the left; selected queries are on the right. Changes are saved and persist across sessions.
- There is no date or type filter — each query has its own built-in logic for what it counts

**Full list of available queries:**
- Purchasing Requests Needing My Approval Next
- Employees Needing Review Now
- Active Employee Time Clock Info
- Employee Birthdays Next Month
- Purchasing Requests Needing My Approval
- Unpaid Accounts Payable by Due Date
- Employees Needing Review Within Next Month
- My Unposted Bank Transactions
- Employee Overtime Hours Last Payroll
- My Unposted Journal Entries
- My Unposted Credit Card Transactions
- AP Recurring Dollars By Due Date
- Employee Birthdays Next Week
- My Unposted AP Transactions
- Employee Birthdays This Month
- My Unposted Payroll Manual Checks
- General Ledger Accounts Added Within Last 30 Days
- Scheduled Time Off
- Check Register Summary
- Unposted Journal Entries
- Check Register Detail

## 6. How It Connects to Other Parts of the Dashboard
This widget behaves differently from all others — clicking a row does one of two things depending on the query:

- **Opens a detail panel** within the widget (e.g. Check Register Summary) — shows the full list of records behind the count, with columns auto-generated based on the data. An Export to Excel and Close button are available.
- **Navigates away** to a dedicated page elsewhere in the system (e.g. Unposted Journal Entries takes the user directly to the General Ledger / Unposted Journals page with its own filters). This is effectively a shortcut link from the dashboard into the relevant part of the application.

Rows with a count of zero are not clickable.

## 7. Open Questions
- For each of the 21 available queries listed above, which database tables does it touch? This needs to be investigated so the data sources for this widget can be fully documented.
- For queries that navigate away from the dashboard, is there a way to return directly to the dashboard, or does the user need to navigate back manually?

