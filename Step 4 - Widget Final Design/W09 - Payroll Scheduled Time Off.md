# W09 — Payroll Scheduled Time Off

**Module:** Payroll
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W09-Payroll-Scheduled-Time-Off.md](../Step%203%20-%20Mock_Work/Widget_Specs/W09-Payroll-Scheduled-Time-Off.md)
**Data source & formulas:** [Step 1 - Dashboard Research/09 - Payroll Scheduled Time Off.md](../Step 1 - Dashboard Research/09%20-%20Payroll%20Scheduled%20Time%20Off.md)
**Confluence dossier:** none yet
**Last verified against build:** not yet audited

> **Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a written source document (name it) · `[TO CONFIRM]` assumed, with the named owner who can confirm. Claims with no mark are template boilerplate only.

## Purpose
Gives supervisors a view of all scheduled time-off requests across their departments, organised by department and employee, with the ability to approve or reject requests directly from the widget.

## How Other Companies Fulfil This Purpose
- Leave-management dashboards should surface leave balances, pending requests, and a **calendar view** for planning ([Synergy Codes](https://sub.synergycodes.com/our-work/leave-management-dashboard-for-hr-department-purposes/)).
- **One-click approve/reject**, including bulk actions, is called out as the core manager interaction for this exact workflow ([Factorial](https://help.factorialhr.com/en_US/absences-approvals/how-to-create-time-off-approval-systems)).

**Net assessment:** the two views below map directly onto the two standard leave-management treatments. This also confirms a decision already made earlier in this project: an earlier draft had dropped the approval workflow in favour of read-only views, which the standard shows would have been a real regression, not just a deviation from the old design.

## Data Contract

All rows below are sourced from the Step 1 research doc, which was itself confirmed correct against the legacy `PayrollScheduledTimeOff : DataPanelControl` class (`/Payroll/EmployeeInformation/SecureTimeOffHoursTab`) via `Widget_Comparison_Classic.html`, 2026-07-08.

| Field / value shown | Source table / endpoint | Formula / logic | Evidence |
|---|---|---|---|
| Time-off entries (day rows) | `PR_EmployeeOffSchedule` | Row filter: `PR_EmployeeOffSchedule WHERE CompanyID = ctx AND OffDate.Year = selectedYear` | [DOC — Step 1 research] |
| Approval status per record | `PR_EmployeeOffSchedule.ApprovedDate` | Show Pending → `ApprovedDate = null`; Show Approved → `ApprovedDate != null`; Show All → no extra filter. Status displays as "Pending" or "Approved by: [name] [date]" | [DOC — Step 1 research] |
| Supervisor department scoping | `PREmployeeTimeOffApprovals` | Results are restricted to employees whose `HomeDepartmentID` appears in the logged-in user's `PREmployeeTimeOffApprovals.HomeDepartmentIDs`. Each supervisor only sees the departments they are responsible for | [DOC — Step 1 research] |
| Department → Employee grouping | Derived | `GROUP BY HomeDepartment`, then `GROUP BY EmployeeID` within each department (in-memory grouping after the initial query) | [DOC — Step 1 research] |
| Hours by leave type (Vacation, Sick, Personal, Misc.) | `PR_EmployeeOffSchedule`; column labels from `PRCompany` custom name fields (e.g. `VacationLongName`) | Labels can be renamed per organisation; some columns may be hidden if not used | [DOC — Step 1 research] |
| Saved filter preferences | `SSUserTenantPreference` (key: `PayrollScheduledTimeOffFilters`) | Calendar Year and View selections saved per user, remembered across sessions | [DOC — Step 1 research] |
| KPI headline: **Pending Approvals** count | Derived from `ApprovedDate = null` within the supervisor's authorised departments | Exact counting unit (individual day records vs whole requests) and year scope are not stated in any source | [TO CONFIRM - owner not yet assigned] |
| KPI secondary: **Out today/this week** | No documented source or formula in the Step 1 research or Step 3 spec | | [TO CONFIRM - owner not yet assigned] |

- **Favourability/direction logic:** none. This widget has no red/green good-vs-bad convention; colour coding is by leave type (org-configured colours, see Fine-Tuning Notes).
- **Rounding/currency/locale:** values are hours, not currency. Rounding rules not specified in any source.
- **"Data as of" freshness behaviour:** not specified in any source.

**Known Modern API gaps** [DOC — Step 1 research]: the approval-authority filter is **not implemented** (the Modern API returns all company schedules, not just the ones the logged-in user is authorised to approve); the inline approval action endpoint is **not implemented**; and custom column names from `PRCompany` are **not implemented** (static labels only). Step 1 flags all three as meaningful regressions to flag before this widget is rebuilt, since approval actions are the widget's headline feature. All three appear in Sign-off Readiness below.

## Widget States

| State | Behaviour |
|---|---|
| No module rights / entitlement | Supervisor authorisation scoping is documented (see Data Contract: each supervisor only sees the departments they are responsible for [DOC — Step 1 research]). What renders for a user with no Payroll rights or no approval authority at all: *Not yet specified — needs a pass.* |
| Empty (org has no time-off records) | The Calendar Year dropdown only shows years that have time-off records [DOC — Step 1 research]. What the widget itself renders when no records exist: *Not yet specified — needs a pass.* |
| Partial (some departments/types missing) | *Not yet specified — needs a pass.* |
| Loading | *Not yet specified — needs a pass.* |
| Error / API failure | *Not yet specified — needs a pass.* |
| Stale data | Refresh icon present at every size (see Refresh). Whether there is a "data as of" signal: *Not yet specified — needs a pass.* |

## Interaction Spec

The approve/reject flow is this widget's core action and its reason for existing. Documented behaviour, from the legacy build the design preserves:

| Interaction | Behaviour | Evidence |
|---|---|---|
| Employee-level checkbox | Checking the box at the employee level bulk-approves all records for that employee | [DOC — Step 1 research] |
| Day-level checkbox | Checking an individual day's box approves just that record | [DOC — Step 1 research] |
| Unchecking either checkbox | Unchecking reverses the approval | [DOC — Step 1 research] |
| Status display | Shows as either "Pending" or "Approved by: [name] [date]" | [DOC — Step 1 research] |
| Expand/collapse | 3-level list, Department → Employee → Day; collapse defaults per size (see Size behaviour table) | [DOC — Step 1 research] |
| Where approve/reject is live | Medium, Large, and Expanded (same approve/reject interactivity in the modal, per the Size behaviour table below) | |
| Calendar view hover (Large) | "Hover for details" per the Size behaviour table; tooltip content: *Not yet specified — needs a pass.* | |
| Confirmation prompt before approve/reject | *Not yet specified — needs a pass.* | |
| Success feedback after an approval | *Not yet specified — needs a pass.* | |
| Failure handling (API error during approve/reject) | *Not yet specified — needs a pass.* | |
| Undo beyond unchecking | Unchecking reverses the approval [DOC — Step 1 research]. Anything further (bulk undo, time limits, audit trail): *Not yet specified — needs a pass.* | |
| Keyboard/focus behaviour for checkboxes and expand/collapse | *Not yet specified — needs a pass.* | |

## Filters
| Filter | Values |
|--------|--------|
| Calendar Year | Dynamic — only years with time-off records appear; defaults to most recent |
| View | Show All · Show Pending · Show Approved |
| Leave Type | Dynamic — org-configured leave-type labels |
| Department | Only shown if a supervisor is authorised for more than one department |

Calendar Year and View persist per user across sessions. KPI size shows Calendar Year only.

## Data Table Sort
Fixed — Department alphabetical, then Employee alphabetical, then Day chronological. Not user-changeable — predictable order matters more than flexible sorting for an approval workflow.

Trimmed-view rule: this widget has no "top N" trimmed size. There is no Small size (see Refresh note), and Medium collapses departments rather than truncating the list (see Size behaviour), so no top-N ranking rule is needed.

## Drill-Through
No separate external link needed — the Confirmation Dashboard view's entire purpose *is* the drill-in.

## Refresh
Standalone icon, present at every size including KPI.

**No Small size for this widget** — the approval workflow and calendar view both need more room than a 1×1 tile can give. Only KPI, Medium, and Large apply.

---

## Views (Switch View)

Two views, serving genuinely different purposes on the same underlying data — not just different chart types on the same story.

### View 1 — Confirmation Dashboard *(default)*
3-level expandable list — Department → Employee → Day — with inline approve/reject: bulk-approve at employee level, per-day approve/unapprove. This is the widget's core interaction and its reason for existing, so it leads.

### View 2 — Leave Calendar
Mini calendar grid showing leave days marked per employee — the planning/roster view, for when the question is "who's out when," not "what needs my approval."

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Medium (2×2)** | Confirmation: departments collapsed by default, fixed-height scrolling once expanded. Calendar: 2-week view with employee initials. Switch View available. |
| **Large (4×4)** | Confirmation: all levels expanded on load, fixed-height scrolling for day detail. Calendar: month view, full names, hover for details. Switch View available. |
| **KPI (1×0.5)** | Headline: **Pending Approvals** count, with **Out today/this week** as a secondary figure — needs a fit test at this size; fall back to Pending Approvals alone if it doesn't fit cleanly. |
| **Expanded** | Full detail for whichever view is active, all filters live in the modal, same approve/reject interactivity |

*(No Small size — see note above.)*

---

## Accessibility

Required (project baseline, not yet verified for this widget):
- Colour is never the only signal: the leave-type colour coding needs a paired text label or icon, and any status colour needs a sign/label pairing. *Not yet reviewed against the build.*
- Chart values exist as text in the DOM (sr-only or visible table), not hover-only; this applies to the Leave Calendar's marked days and hover details. *Not yet reviewed against the build.*
- Table semantics are real (`th`/scope), and interactive controls (the approve/reject checkboxes, expand/collapse, view switch) are reachable by keyboard. *Not yet reviewed against the build.*

## What Got Cut (and why)
- **A third "Department Summary Bars" option** — dropped earlier in this project; it was read-only and didn't serve either of the two real purposes (planning or approving) as well as the two kept views.

## Sign-off Readiness

| # | Open item | Type | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | KPI dual figure (Pending Approvals + Out today/this week) needs a fit test at 1×0.5; fall back to Pending Approvals alone if it doesn't fit cleanly (see Size behaviour) | Product decision (layout fit) | Not yet assigned | No (fallback already defined) |
| 2 | KPI headline math: exact counting unit for Pending Approvals, year scope, and the source/formula for the Out today/this week secondary figure are all undocumented (see Data Contract [TO CONFIRM] rows) | Math | Not yet assigned | Not stated in any source |
| 3 | Modern API: the approval-authority filter is not implemented (returns all company schedules, not just the ones the logged-in user is authorised to approve) | Field / API | Backend team (not yet named) | Step 1 flags it as a meaningful regression to flag before this widget is rebuilt [DOC — Step 1 research] |
| 4 | Modern API: the inline approval action endpoint is not implemented | API | Backend team (not yet named) | Step 1 flags it as a meaningful regression before rebuild; approval actions are the widget's headline feature [DOC — Step 1 research] |
| 5 | Modern API: custom column names from `PRCompany` are not implemented (static labels only) | Field | Backend team (not yet named) | Step 1 flags it as a meaningful regression before rebuild [DOC — Step 1 research] |
| 6 | Widget States: empty, partial, loading, error, and stale rows are unspecified | Spec gap | Design (this doc) | Not stated |
| 7 | Interaction Spec: confirmation, success, failure, undo-beyond-uncheck, tooltip content, and keyboard rows are unspecified | Spec gap | Design (this doc) | Not stated |
| 8 | Calendar vs. list: "Whether users want a full calendar view vs. a simple upcoming-absences list — posed, not answered" [DOC - PROJECT INDEX open questions]. The underlying question: "Does a payroll user care about a full calendar view, or would a simple list of upcoming absences (next 2–4 weeks) be more useful?" [DOC - UX Specialist Questions Master Tracker, Q22; no answer recorded] | Product decision | Not yet assigned | Not stated |
| 9 | Scope: "Whether the widget should show all staff or scope to the logged-in user's department — possibly still open" [DOC - PROJECT INDEX open questions; UX Specialist Questions Master Tracker, Q24]. Ben Lane's Q24 note: not answered directly, but payroll filters were discussed in terms of pay groups, not departments, so segmentation by pay group may be more relevant than by department, though this wasn't stated explicitly for this widget [SME - Ben Lane, 13.07.2026]. The current design scopes to the supervisor's authorised departments (see Data Contract) | Product decision | Not yet assigned | Not stated |

This doc has 9 open items; it is not sign-off-ready until this table is empty or every row is explicitly accepted as a known risk.

## Fine-Tuning Notes
- Leave type uses consistent colour coding across both views (org-configured colours, not fixed)
- Department filter, where shown, narrows both views consistently
