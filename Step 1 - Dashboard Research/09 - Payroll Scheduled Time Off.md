# Purpose Document: Payroll Scheduled Time Off

> This is a **Purpose document** — Step 1 in the dashboard project lifecycle. Its job is to capture what currently exists, so that Feedback, Design, and Development can be based on documented reality rather than assumptions. It is written for all readers, not just technical ones.

**Date:** 2026-07-06
**Investigated by:** Oisin / Claude
**Module / Area of the system:** Payroll

---

## 1. Purpose
To give supervisors a view of all scheduled time-off requests across their departments, organised by department and employee. Supervisors can see whether requests are pending or approved, and can approve or reject them directly from this widget without navigating elsewhere in the system.

## 2. Where the Data Comes From
This widget pulls from the Payroll module, specifically the time-off records for employees within departments the logged-in user is authorised to approve. Each supervisor only sees the departments they are responsible for — they cannot see other departments.

The year and view filter selections are saved per user and remembered across sessions.

**Database tables used:**

| Table Name | What it holds |
|---|---|
| PR_EmployeeOffSchedule | The individual scheduled time-off entries per employee — **answers Open Question 1**, confirmed via Classic Widget Comparison |
| PREmployeeTimeOffApprovals | Records of which departments each supervisor is authorised to approve |
| SSUserTenantPreference (key: `PayrollScheduledTimeOffFilters`) | Each user's saved filter preferences (year and view selections) |

**Confirmed correct** against the legacy `PayrollScheduledTimeOff : DataPanelControl` class (`/Payroll/EmployeeInformation/SecureTimeOffHoursTab`) — verified via `Widget_Comparison_Classic.html`, 2026-07-08. One addition: renamed column labels (Vacation, Sick, etc.) come specifically from `PRCompany` custom name fields (e.g. `VacationLongName`).

**Formulas / calculation logic (from Classic Widget Comparison):**
- **Row filter:** `PR_EmployeeOffSchedule WHERE CompanyID = ctx AND OffDate.Year = selectedYear`
- **View filter:** Show All → no extra filter; Show Pending → `ApprovedDate = null`; Show Approved → `ApprovedDate != null`
- **Authorization:** results are further restricted to employees whose `HomeDepartmentID` appears in the logged-in user's `PREmployeeTimeOffApprovals.HomeDepartmentIDs`
- **Grouping:** `GROUP BY HomeDepartment`, then `GROUP BY EmployeeID` within each department (in-memory grouping after the initial query)
- ⚠️ **Known Modern API gaps:** the approval-authority filter is **not implemented** (the Modern API returns all company schedules, not just the ones the logged-in user is authorised to approve); the inline approval action endpoint is **not implemented**; and custom column names from `PRCompany` are **not implemented** (static labels only). All three are meaningful regressions to flag before this widget is rebuilt, since Section 6 above describes approval actions as the widget's headline feature.

## 3. What It's Telling Us
A three-level expandable list showing time-off requests organised by department, then by employee, then by individual day. At each level the approval status is visible, giving supervisors a full picture of what is pending and what has already been approved.

## 4. How It's Displayed
- **Table only** — no chart
- Three expandable levels:
  - **Level 1 — Department:** collapsed by default into a group heading; all rows are expanded on first load
  - **Level 2 — Employee:** shows the employee name and an overall approval status checkbox for bulk approving all their records at once
  - **Level 3 — Daily detail:** shows each individual time-off day with date, day of week, hours broken down by type (Vacation, Sick, Personal, Misc.), and approval status. Status shows as either "Pending" or "Approved by: [name] [date]"
- The hours column labels (Vacation, Sick, Personal, Misc.) can be renamed per organisation; some columns may be hidden if not used

## 5. Filters & Controls
- **Calendar Year dropdown** — shows only years that have time-off records; defaults to the most recent year. The years available are not a fixed sequential list — only years with data appear.
- **View dropdown** — filters what is shown:
  - **Show All** — all requests regardless of status
  - **Show Pending** — only requests not yet approved
  - **Show Approved** — only approved requests
- Both filter selections are saved per user and remembered across sessions
- **Refresh** — reloads the data

## 6. How It Connects to Other Parts of the Dashboard
- The approval checkboxes are interactive — this widget is not view-only. Checking the box at the employee level bulk-approves all records for that employee; checking an individual day's box approves just that record. Unchecking reverses the approval.
- This is the only dashboard widget that allows the user to take action (approve/reject) directly without navigating elsewhere
- _No navigation away from the dashboard observed for this widget_

## 7. Open Questions
- What is the exact database table holding the individual time-off records?

