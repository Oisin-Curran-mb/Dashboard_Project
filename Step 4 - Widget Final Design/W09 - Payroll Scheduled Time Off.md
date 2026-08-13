# W09 — Payroll Scheduled Time Off

**Module:** Payroll
**Status:** 🟢 Final design — locked (Final built 2026-08-07)
**Full history / rejected ideas:** [Widget_Specs/W09-Payroll-Scheduled-Time-Off.md](../Step%203%20-%20Mock_Work/Widget_Specs/W09-Payroll-Scheduled-Time-Off.md)
**Data source & formulas:** [Step 1 - Dashboard Research/09 - Payroll Scheduled Time Off.md](../Step 1 - Dashboard Research/09%20-%20Payroll%20Scheduled%20Time%20Off.md)
**Confluence dossier:** none yet
**Last verified against build:** 2026-08-08, build-final-widget driver + final-check-rules.py (v2.8, owner change: an **Outstanding** state was introduced. An entry (day-line) is Outstanding when its date is strictly before the current date (the today anchor, Aug 7 2026) AND it is still Pending; approved-past and pending-today-or-future are NOT outstanding. Three placements: (1) calendar Outstanding marker + day cell are RED with day-cell priority Outstanding > Pending > Approved and the state word named in the marker title/sr-label + day aria-label, red = Outstanding added to the status legend; (2) Glance shows a Pending figure and a separate Outstanding figure side by side where Pending EXCLUDES outstanding (the two partition the pending set with no double count), and the old "Out this week" secondary was dropped; (3) the Approval Queue flags outstanding day-lines with a red "Outstanding" tag + accent, still counted in the queue counts this pass (no new filter chip). On top of v2.7's per-day lines, Rejected removed, Department default and leave-type icons removed, and the earlier v2.6 Info coverage-overlap, month-grid calendar, segmented controls and queue Group by). Driver: 107 assertions, all pass. FC_VERSION[9] = 2.8. Open question flagged to owner: whether the queue's Pending filter/counts should also exclude outstanding or gain an Outstanding chip.

> **Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a written source document (name it) · `[TO CONFIRM]` assumed, with the named owner who can confirm. Claims with no mark are template boilerplate only.

# Final Design (current)

*This part describes only the shipped design (Final built 2026-08-07). Anything the build superseded (the earlier Department -> Employee -> Day structure, the old size table, the Calendar Year filter) has been moved to the dated Design History section at the very end of this doc, not deleted.*

## Purpose
Gives supervisors a view of all scheduled time-off requests, grouped by pay group and shown per person, with the ability to approve requests directly from the widget, plus a calendar view of who is out when for planning.

## How Other Companies Fulfil This Purpose
- Leave-management dashboards should surface leave balances, pending requests, and a **calendar view** for planning ([Synergy Codes](https://sub.synergycodes.com/our-work/leave-management-dashboard-for-hr-department-purposes/)).
- **One-click approve/reject**, including bulk actions, is called out as the core manager interaction for this exact workflow ([Factorial](https://help.factorialhr.com/en_US/absences-approvals/how-to-create-time-off-approval-systems)).

**Net assessment:** the two views below map directly onto the two standard leave-management treatments. This also confirms a decision already made earlier in this project: an earlier draft had dropped the approval workflow in favour of read-only views, which the standard shows would have been a real regression, not just a deviation from the old design.

## Data Contract

All rows below are sourced from the Step 1 research doc, which was itself confirmed correct against the legacy `PayrollScheduledTimeOff : DataPanelControl` class (`/Payroll/EmployeeInformation/SecureTimeOffHoursTab`) via `Widget_Comparison_Classic.html`, 2026-07-08.

| Field / value shown | Source table / endpoint | Formula / logic | Evidence |
|---|---|---|---|
| Time-off entries (**one line per day**) | `PR_EmployeeOffSchedule` | Row filter: `PR_EmployeeOffSchedule WHERE CompanyID = ctx AND OffDate.Year = selectedYear`. **Per-day model (v2.7, owner-directed 2026-08-08):** a multi-day request is shown as one line/marker per calendar day, each individually shown, counted and approvable. In the mock this is expanded at render (a `d`/`dEnd` range becomes single-day entries with per-day hours and a unique per-day id); against the backend, `PR_EmployeeOffSchedule` already stores per-`OffDate` day rows, so no schema change is needed for this. | [DOC — Step 1 research] |
| Approval status per record | `PR_EmployeeOffSchedule.ApprovedDate` | Two statuses only (v2.7, owner-directed 2026-08-08): Show Pending → `ApprovedDate = null`; Show Approved → `ApprovedDate != null`; Show All → no extra filter. Status displays as "Pending" or "Approved by: [name] [date]". Approve sets `ApprovedDate`; Undo clears it (unapprove). No Rejected state (removed 2026-08-08; see Design History). | [DOC — Step 1 research] |
| Info panel: per-person year-to-date totals by leave type | Aggregation over `PR_EmployeeOffSchedule` | For the focused person, sum day counts (one per day-line) by leave type across the working year. Feasible but NOT an existing endpoint; scope to the supervisor's authorised groups. Built + driver-verified 2026-08-08. | [TO CONFIRM - new aggregation endpoint; owner-directed 2026-08-08] |
| Info panel: same-dates coverage-overlap list | Aggregation over `PR_EmployeeOffSchedule` | For the focused person, find every OTHER employee whose time-off entry OVERLAPS any of the focused person's own date ranges (two entries overlap when they share the same month + year and their day ranges intersect: `startA <= endB AND startB <= endA`). List each overlapping entry once with that person's name, department, pay group, the overlapping dates and leave type + status, sorted by name then dates; status-agnostic. Feasible but NOT an existing endpoint; scope to the supervisor's authorised groups. Built + driver-verified 2026-08-08 (v2.6). Supersedes the earlier "other-staff-off-this-year totals" list (see Design History). | [TO CONFIRM - new aggregation endpoint; owner-directed 2026-08-08] |
| Supervisor department scoping | `PREmployeeTimeOffApprovals` | Results are restricted to employees whose `HomeDepartmentID` appears in the logged-in user's `PREmployeeTimeOffApprovals.HomeDepartmentIDs`. Each supervisor only sees the departments they are responsible for | [DOC — Step 1 research] |
| Pay Group → Person grouping (Approval Queue) | `PREmployeeCompensationDetail.PayGroup` (smallint: 0 = Normal Payroll, 1 to 5 = A to E); labels from `PRCompany.PayGroupName` | Fixed 5-slot model (A to E) plus Normal Payroll, org-named. Linked to an employee INDIRECTLY through their compensation detail: `PREmployeeOffSchedule` has no pay-group field, so grouping time off by pay group needs a backend join through compensation detail. Precedent for pay-group filtering exists in `PRTimeCardRepository`. Then group by person within each pay group | [TO CONFIRM - indirect join, not a confirmed direct field; owner-directed grouping 2026-08-07] |
| Department → Employee grouping (**default**) | Derived | `GROUP BY HomeDepartment`, then `GROUP BY EmployeeID` within each department (in-memory grouping after the initial query). In the Final this is the DEFAULT grouping for BOTH the Approval Queue and the Leave Calendar (v2.7, owner-directed 2026-08-08); Pay Group (see row above) is the second option in both views | [DOC — Step 1 research] |
| Hours by leave type (Vacation, Sick, Personal, Misc.) | `PR_EmployeeOffSchedule`; column labels from `PRCompany` custom name fields (e.g. `VacationLongName`) | Labels can be renamed per organisation; some columns may be hidden if not used | [DOC — Step 1 research] |
| Saved filter preferences | `SSUserTenantPreference` (key: `PayrollScheduledTimeOffFilters`) | Calendar Year and View selections saved per user, remembered across sessions | [DOC — Step 1 research] |
| Glance figures: **Pending** count and **Outstanding** count | Derived from `ApprovedDate = null` within the supervisor's authorised departments, then split by date against the current date | Counting unit is the **day-line** (per-day model, v2.7). Two mutually exclusive figures (v2.8, owner-directed 2026-08-08): **Outstanding** = pending day-lines dated strictly before today (past-due); **Pending** = pending day-lines dated today or later. Pending EXCLUDES outstanding, so Pending + Outstanding partition the pending set with no double count. The old single "Pending Approvals" headline plus "Out this week" secondary is superseded (see Design History). Year scope not stated in any source; the split needs a reliable current-date reference | [TO CONFIRM - owner not yet assigned] |
| KPI secondary: **Out today/this week** | No documented source or formula in the Step 1 research or Step 3 spec | | [TO CONFIRM - owner not yet assigned] |

- **Favourability/direction logic:** none in the good-vs-bad sense. On the Leave Calendar, colour encodes approval STATUS: Approved green (`#2e7d32`), Pending yellow/amber (`#c77d00`), and (v2.8, owner-directed 2026-08-08) **Outstanding red (`#c0392b`)** for a past-due pending day (still pending AND dated before today). A day cell that mixes statuses takes a priority colour: any Outstanding red, else any Pending yellow, else all-approved green; no-request days stay neutral. Each person marker takes its own entry's state colour, so a mixed past day shows a red Outstanding marker beside a green Approved one inside a red-priority cell. A marker is the person's initials coloured by state (no leave-type icon and no separate status glyph as of v2.7); the state word (Outstanding / Pending / Approved) is carried in the marker title, the sr-only label and the day-cell aria-label. The leave TYPE is shown as a plain text label (in the queue rows, the day detail and the Info panel), never as an icon. Colour is never the only signal in either view (see Accessibility and Fine-Tuning Notes).
- **Rounding/currency/locale:** values are hours, not currency. Rounding rules not specified in any source.
- **"Data as of" freshness behaviour:** not specified in any source.

**Known Modern API gaps** [DOC — Step 1 research]: the approval-authority filter is **not implemented** (the Modern API returns all company schedules, not just the ones the logged-in user is authorised to approve); the inline approval action endpoint is **not implemented**; and custom column names from `PRCompany` are **not implemented** (static labels only). Step 1 flags all three as meaningful regressions to flag before this widget is rebuilt, since approval actions are the widget's headline feature. All three appear in Sign-off Readiness below.

## Widget States

| State | Behaviour |
|---|---|
| Record status (Pending / Approved) | Each day-line is in one of two approval states (v2.7, owner-directed 2026-08-08: Rejected removed). Pending renders an amber "Pending" chip (schedule icon) with an Approve action; Approved renders a green "Approved by [name], [date]" chip (check icon) with an Undo that returns it to Pending. Colour is always paired with an icon and a text label. Built + driver-verified 2026-08-08. |
| Outstanding (past-due pending) | A derived state layered on Pending (v2.8, owner-directed 2026-08-08): a day-line still Pending AND dated strictly before the current date (the today anchor). Approving it clears it (it becomes Approved and is no longer outstanding); it is not a separate stored status. On the Leave Calendar an Outstanding marker and its day cell are RED (priority over yellow Pending and green Approved), with the word "Outstanding" in the marker title/sr-label and the day-cell aria-label. In the Glance it is its own figure beside Pending (and Pending excludes it). In the Approval Queue the outstanding day-line keeps its Pending chip but gains a red "Outstanding" tag + left accent; it still appears under the Pending filter and still counts in the queue counts this pass. Built + driver-verified 2026-08-08. |
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
| Calendar marker + day colour | Colour encodes approval STATE (Approved green, Pending yellow/amber, and Outstanding red as of v2.8; Outstanding = still pending AND dated before today). Each person marker is the person's INITIALS coloured by that person's own state (no leave-type icon, no separate status glyph); the day cell takes a priority colour when a day mixes states, any Outstanding red, else any Pending yellow, else all-approved green, with no-request days neutral, so a mixed day shows differently-coloured initials under the priority-coloured cell (e.g. a past day with a pending and an approved person reads red with a red marker beside a green one). The state word (Outstanding / Pending / Approved) is carried in the marker title + sr-only text and the day-cell aria-label, and the legend documents the colour = status key (green Approved, yellow Pending, red Outstanding), so colour is never the only signal. Built + driver-verified 2026-08-08 (v2.8). | |
| Calendar day detail (click a day or a marker) | Clicking a populated day cell, or a specific marker within it, opens a dialog popover listing each person out that day: name, both Department and Pay Group, leave type (text label, no icon), hours, and status (Pending / "Approved by [name], [date]"). A marker click pre-focuses that person's row. Informational only (a footer hint points to the Approval Queue for approvals). Keyboard reachable (day cells and markers are role=button, tabbable, Enter / Space open); dismissible via a close control, click-away, or Escape. Empty days are not clickable. Built + driver-verified 2026-08-08. | |
| Approval Queue: per-day Approve (built) | Each PENDING day-line shows an Approve button (per-day model, v2.7). Approve sets that day to Approved ("Approved by [name], [date]"). Reject removed 2026-08-08 (see Design History). Built + driver-verified 2026-08-08. | [BUILD; owner-directed 2026-08-08] |
| Approval Queue: person bulk Approve all (N) (built) | Each person row with pending day-lines shows a bulk "Approve all (N)" where N counts pending DAY-lines; it approves all of that person's pending days at once. When none are pending the row reads "All resolved". Reject all removed 2026-08-08 (see Design History). Built + driver-verified 2026-08-08. | [BUILD; owner-directed 2026-08-08] |
| Approval Queue: Undo (built) | An Approved day-line shows an Undo that returns it to Pending. Built + driver-verified 2026-08-08. | [BUILD; owner-directed 2026-08-08] |
| Approval Queue: per-person Info popover (built) | Each person row carries an Info icon opening a dialog popover. Header: the person's name with their own department and pay group beside it. Section (a): that person's time off this year totalled by leave type (day counts), each type shown as text. Section (b): a same-dates coverage-overlap list, who else is off during any of this person's dates (day-level), each with their name, department, pay group, the overlapping dates and leave type + status (all as text); if no one overlaps it reads "No one else is off during these dates." Informational only, keyboard reachable (icon is role=button, tabbable), dismissible via close control, click-away, or Escape. Built + driver-verified 2026-08-08. | [BUILD; owner-directed 2026-08-08] |
| Record status visual treatment (built) | Each status renders as a chip pairing colour with an icon AND a text label, never colour alone: Approved green + check icon, Pending amber + schedule icon (Rejected removed, v2.7). An outstanding (past-due pending) day-line additionally carries a red "Outstanding" tag with an error icon and a red row accent, still paired with its Pending chip (v2.8). Built + driver-verified 2026-08-08. | [BUILD; owner-directed 2026-08-08] |
| Confirmation prompt before approve/reject | *Not yet specified — needs a pass.* | |
| Success feedback after an approval | *Not yet specified — needs a pass.* | |
| Failure handling (API error during approve/reject) | *Not yet specified — needs a pass.* | |
| Undo beyond unchecking | Unchecking reverses the approval [DOC — Step 1 research]. Anything further (bulk undo, time limits, audit trail): *Not yet specified — needs a pass.* | |
| Keyboard/focus behaviour for checkboxes and expand/collapse | *Not yet specified — needs a pass.* | |

## Filters
| Filter | Values | Where |
|--------|--------|-------|
| Status | All · Pending (default) · Approved | Approval Queue, Jo-style segmented toggle (three chips as of v2.7 2026-08-08; Rejected removed) |
| Group by | Department (default) · Pay Group | **Both** the Approval Queue and the Leave Calendar, segmented toggle (Department first + default as of v2.7 2026-08-08) |
| Leave Type | Vacation · Sick · Personal · Misc (org-configured labels, not yet in Modern API) | both views, shown as a plain text label (no icon as of v2.7) |

The Status filter is three segmented chips, All / Pending / Approved, and defaults to Pending (the pending-first queue pattern); Approved shows only approved day-lines, All everything (Rejected removed 2026-08-08, see Design History). Both the Approval Queue's and the Leave Calendar's Group by toggles default to **Department** and list Department before Pay Group, switching between the two (the person stays shown by name under whichever subheading is active). The view toggle, Status filter and Group by toggle all use Jo's segmented `.vtoggle` / `.vt` treatment to match the other Finals. Glance (KPI) size shows no filters, only the Pending and Outstanding figures (v2.8). The old Calendar Year filter was not carried into the Final (see Design History).

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

Two views, serving genuinely different purposes on the same underlying data, not just different chart types on the same story.

### View 1 — Approval Queue *(default)*
A clean row/column list with a Group by toggle: DEPARTMENT (default) or PAY GROUP as subheadings (Department first + default as of v2.7). Under each subheading, each PERSON is shown by name directly (the person is visible, not hidden inside a lower level), with the other dimension shown as a quiet secondary label. Under each person, their time-off **day-lines** (per-day model, v2.7: a multi-day request is one line per calendar day, individually shown, counted and approvable): the day's date, leave type (a plain text label, no icon), hours, and status ("Pending" or "Approved by [name], [date]", each a chip pairing colour with an icon and text). Actions: each person row carries a per-person Info icon opening a coverage popover (that person's time off this year totalled by leave type as text, plus a same-dates coverage-overlap list of who else is off during this person's dates, each with department + pay group); each pending day offers an Approve button; the person-level bulk action is Approve all (N) where N counts pending day-lines; an Undo on any Approved day returns it to Pending. An outstanding (past-due pending) day-line carries a red "Outstanding" tag and a red row accent (v2.8); it still appears under the Pending filter and is still counted in the queue counts this pass (no separate Outstanding chip was added, pending an owner decision, see Sign-off Readiness). An inline three-chip Status filter offers All / Pending (default) / Approved. The view toggle, Group by toggle and Status filter use Jo's segmented toggle styling. This is the widget's core interaction and its reason for existing, so it leads. (Owner-directed 2026-08-07: this grouping -> Person -> day-lines hierarchy supersedes the earlier Department -> Employee -> Day expand/collapse structure, preserved in Design History. Per-day lines, Rejected removal, the three-chip filter and Department-first default are owner-directed 2026-08-08, v2.7.)

### View 2 — Leave Calendar
A genuine month calendar grid showing who is out when. Sunday-to-Saturday weekday column headers, a full weeks x days cell grid computed from the displayed month, adjacent-month days greyed, and today outlined. Prev / next month navigation (chevrons with a month + year label) moves between months and re-renders; a month with no entries renders a clean empty-month state, not a blank or a throw. Each calendar day of a request is marked (per-day model, v2.7). A marker is now the person's **initials** coloured by that person's approval STATE (Approved green, Pending yellow/amber, and **Outstanding red** as of v2.8 for a still-pending day dated before today); there is no leave-type icon and no separate status glyph. The day CELL takes a priority colour when a day mixes states (any Outstanding red, else any Pending yellow, else all-approved green; no-request days stay neutral), so a mixed day shows differently-coloured initials inside the priority-coloured cell (a past day with a pending person reads red; a future pending day reads yellow; an approved-only day reads green). Initials are derived from the name as first-plus-last initial (Dana Whitfield reads "DW"), with a single-name fallback to the first two letters, shown at both Explore and Detail; the full name, leave type, dates, status and group stay in the marker `title` and the sr-only text label, and the day cell names its overall status in its aria-label, so colour is never the only signal. A day with more people than fit shows a "+N" overflow. **Clicking a day (or a specific marker) opens a day-detail popover** listing everyone out that day with name, both Department and Pay Group, leave type (text label, no icon), hours and status; it is informational (approvals stay in the queue), keyboard reachable, and dismissible via close control / click-away / Escape. The legend is a simple status colour key ("Colour = status": green Approved, yellow Pending, red Outstanding as of v2.8, each swatch paired with its status glyph and word); the leave-type icon key is removed (there are no leave icons). The Group by toggle (Department default, or Pay Group) drives the one-line summary, the day-detail grouping and labels, and each marker's group label; it does not drive colour (colour is status). There is no breakdown list below the grid: the grid itself is the view. The planning/roster view, for when the question is "who is out when," not "what needs my approval."

### Size behaviour
*(Rule 12: Glance / Explore / Detail, no Small.)*
| Size | Behaviour |
|------|-----------|
| **Glance** (KPI, 3 col × 176px) | Two figures side by side (v2.8, owner-directed 2026-08-08): a **Pending** count (amber) and a separate **Outstanding** count (red). Pending excludes outstanding (pending dated today or later); Outstanding is past-due pending (dated before today); the two are mutually exclusive. The old "Pending Approvals headline plus Out this week secondary" is superseded, and the "Out this week" figure was dropped so the two priority figures read cleanly at this size (see Design History). No filters at this size. |
| **Explore** (6 col × 496px) | Single active view. Approval Queue: group / person / day-lines, capped to the first several units with a "N more in Detail size" note. Leave Calendar: the full month grid with compact day markers, each the person's initials (up to 2 per day, then "+N"), coloured by status (per marker, with the day cell taking the priority colour); clicking a day or marker opens the day-detail popover. View toggle + the view's Group by / Status controls available. |
| **Detail** (12 col × 560px) | The fuller view. Approval Queue: all groups / people / day-lines. Leave Calendar: the full month grid with larger cells, up to 3 day markers each the person's initials (then "+N"), coloured by status (per marker, with the day cell taking the priority colour), plus the status colour legend; clicking a day or marker opens the day-detail popover. Month navigation, Group by and the day detail work at both sizes. |

*(No Small size, per Rule 12 and the widget's own no-Small exception.)*

---

## Accessibility

Required (project baseline):
- Colour is never the only signal: on the Leave Calendar colour encodes approval STATE (Approved green, Pending yellow/amber, Outstanding red as of v2.8), applied per marker and, by priority (any Outstanding red, else any Pending yellow, else all-approved green; no-request days neutral), to the day cell. Every state colour is paired with a non-colour signal: the state word (Outstanding / Pending / Approved) in each marker's `title` and sr-only label, the overall day state word in the day cell's aria-label ("some outstanding" / "some pending" / "all approved"), and the state words in the legend key. The marker itself is the person's initials (which also identify who). The leave type is carried as a plain text label (in the queue rows, day detail and Info panel), not an icon. In the Approval Queue each status chip carries an icon + colour + text label, and an outstanding row's red "Outstanding" tag carries an error icon and the word "Outstanding". *Verified in the build 2026-08-08 v2.8 (driver asserts the priority rule at both the unit and rendered levels, per-marker state colour, state words present as DOM text, red never appearing without the word "Outstanding", the status colour legend including red, markers carrying zero leave-type icons, and that flipping Group by leaves the day colours unchanged).*
- Day-detail popover is keyboard reachable and dismissible: calendar day cells and markers are `role=button` and tabbable (Enter / Space open the day detail), the popover is `role="dialog" aria-modal`, and it closes via a close control, click-away, or Escape. *Verified in the build 2026-08-08 (driver fires the real delegated click + Escape handlers and asserts open/focus/close).*
- Chart values exist as text in the DOM (sr-only or visible), not hover-only: each calendar day marker carries a screen-reader text label (person, type, dates, status, group) in addition to its `title`, and both Explore and Detail show the person's visible initials as the marker (v2.7). *Verified in the build 2026-08-08. The remaining gap is real `th`/scope table semantics and full keyboard focus order, below.*
- Table semantics are real (`th`/scope), and interactive controls (the approve/reject checkboxes, expand/collapse, view switch) are reachable by keyboard. *Not yet reviewed against the build.*

## What Got Cut (and why)
- **A third "Department Summary Bars" option** — dropped earlier in this project; it was read-only and didn't serve either of the two real purposes (planning or approving) as well as the two kept views.

## Sign-off Readiness

| # | Open item | Type | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | Glance dual figure (Pending + Outstanding, v2.8) needs a fit eyeball at 1×0.5 (two 30px numbers with a divider). The "Out this week" secondary was dropped in v2.8 in favour of the two priority figures | Product decision (layout fit) | Not yet assigned | No (both figures are the priority; layout not machine-verified) |
| 2 | Glance math: exact counting unit and year scope for the Pending / Outstanding split are undocumented (see Data Contract [TO CONFIRM] row); the Outstanding split also assumes a reliable current-date reference | Math | Not yet assigned | Not stated in any source |
| 1b | **NEW open question (v2.8, owner-directed 2026-08-08): queue treatment of Outstanding.** This pass added only a visual red "Outstanding" tag/accent to outstanding rows; the queue's Pending filter still shows them and the header/person pending counts still include them. Decision needed: should the queue's Pending filter and counts also EXCLUDE outstanding (matching the Glance split), or should the queue gain a dedicated Outstanding filter chip? | Product decision | Not yet assigned | No (visual flag shipped; behaviour deliberately unchanged pending decision) |
| 3 | Modern API: the approval-authority filter is not implemented (returns all company schedules, not just the ones the logged-in user is authorised to approve) | Field / API | Backend team (not yet named) | Step 1 flags it as a meaningful regression to flag before this widget is rebuilt [DOC — Step 1 research] |
| 4 | Modern API: the inline approval action endpoint is not implemented | API | Backend team (not yet named) | Step 1 flags it as a meaningful regression before rebuild; approval actions are the widget's headline feature [DOC — Step 1 research] |
| 5 | Modern API: custom column names from `PRCompany` are not implemented (static labels only) | Field | Backend team (not yet named) | Step 1 flags it as a meaningful regression before rebuild [DOC — Step 1 research] |
| 6 | Widget States: empty, partial, loading, error, and stale rows are unspecified | Spec gap | Design (this doc) | Not stated |
| 7 | Interaction Spec: confirmation, success, failure, undo-beyond-uncheck, tooltip content, and keyboard rows are unspecified | Spec gap | Design (this doc) | Not stated |
| 8 | Calendar vs. list: "Whether users want a full calendar view vs. a simple upcoming-absences list — posed, not answered" [DOC - PROJECT INDEX open questions]. The underlying question: "Does a payroll user care about a full calendar view, or would a simple list of upcoming absences (next 2–4 weeks) be more useful?" [DOC - UX Specialist Questions Master Tracker, Q22; no answer recorded] | Product decision | Not yet assigned | Not stated |
| 9 | Scope: "Whether the widget should show all staff or scope to the logged-in user's department — possibly still open" [DOC - PROJECT INDEX open questions; UX Specialist Questions Master Tracker, Q24]. Ben Lane's Q24 note: not answered directly, but payroll filters were discussed in terms of pay groups, not departments, so segmentation by pay group may be more relevant than by department, though this wasn't stated explicitly for this widget [SME - Ben Lane, 13.07.2026]. The current design scopes to the supervisor's authorised departments (see Data Contract) | Product decision | Not yet assigned | Not stated |
| 10 | **RESOLVED by design change (v2.7, owner-directed 2026-08-08): Rejected removed.** This row previously flagged that Rejected was a NEW workflow state needing a new backend field + reject action. The owner removed Rejected entirely on 2026-08-08, so the widget now uses only the existing approve/unapprove (`ApprovedDate` set/null) model and needs no new status field or reject endpoint. No longer an open item; kept for the record. | Field / API | n/a | Closed 2026-08-08 |
| 11 | **Info panel aggregations are not existing endpoints** (owner-directed 2026-08-08). The per-person year-to-date totals by leave type and the same-dates coverage-overlap list are aggregations over `PR_EmployeeOffSchedule` (feasible, should be scoped to the supervisor's authorised groups per row 3), but no such endpoint exists today. The day-count unit used in the build (one per day-line) is a design choice, not a documented formula | API / Math (NEW) | Backend team (not yet named) | New aggregation endpoint required; not implemented today |

This doc has 11 open items (row 10 closed by the v2.7 Rejected removal; row 1b added by the v2.8 Outstanding change); it is not sign-off-ready until this table is empty or every row is explicitly accepted as a known risk.

## Fine-Tuning Notes
- Leave type is shown as a plain text label everywhere (queue rows, day detail, Info panel); there are no leave-type icons as of v2.7. On the Leave Calendar colour encodes approval STATE (Approved green, Pending yellow/amber, Outstanding red as of v2.8), and the marker is the person's initials in that state colour, so a calendar user reads state by colour (backed by the state word in the marker title/label and the day-cell aria-label) and identifies who by the initials. The state colours align with the queue chips and tag (approved green `#2e7d32`, pending amber `#c77d00`, outstanding red `#c0392b`); the pending marker amber is a slightly more legible take on the pending-chip amber, and the outstanding red reuses the same red the queue "Outstanding" tag uses.
- Grouping/filter selections narrow both views consistently

---

# Design History (superseded — kept for the record)

## 2026-08-07 — superseded by the composed Final (Pay Group -> Person Approval Queue + Leave Calendar)

The owner-confirmed composition (2026-08-07) changed the Approval view's structure and the size model. The prior design below is kept for the record; it is no longer the current design.

### Superseded View 1 — Confirmation Dashboard *(was default)*
3-level expandable list, Department -> Employee -> Day, with inline approve/reject: bulk-approve at employee level, per-day approve/unapprove. Replaced by the Approval Queue, which groups by PAY GROUP (not department) and shows each PERSON by name directly, with the same approve interactions reframed to person + per-entry. Reason: Ben Lane's Q24 note (13.07.2026) that payroll filters were discussed in terms of pay groups, not departments, and the owner's direct instruction 2026-08-07 to group by pay group and keep the person visible.

### Superseded Size behaviour (Small/Medium/Large/KPI/Expanded)
| Size | Behaviour |
|------|-----------|
| **Medium (2×2)** | Confirmation: departments collapsed by default, fixed-height scrolling once expanded. Calendar: 2-week view with employee initials. Switch View available. |
| **Large (4×4)** | Confirmation: all levels expanded on load, fixed-height scrolling for day detail. Calendar: month view, full names, hover for details. Switch View available. |
| **KPI (1×0.5)** | Headline: Pending Approvals count, with Out today/this week as a secondary figure; fall back to Pending Approvals alone if it does not fit cleanly. |
| **Expanded** | Full detail for whichever view is active, all filters live in the modal, same approve/reject interactivity |

Replaced by the Rule 12 three-size model (Glance / Explore / Detail, no Small) now documented in the current Size behaviour section.

### Superseded filter — Calendar Year
The prior Filters table carried a Calendar Year filter (dynamic, only years with time-off records, defaulting to most recent) plus a Leave Type filter and a conditional Department filter, with Calendar Year and View persisted per user. The Final does not implement Calendar Year (it shows a single working month for the calendar and the pending queue); the built filters are Status (Approval Queue) and the Department/Pay Group grouping toggle (Leave Calendar). Calendar Year remains a reasonable future addition and can be restored when the widget reaches development.

## 2026-08-08 — superseded by the refine pass (functional month-grid calendar; segmented controls; queue Group by)

The Final built 2026-08-07 rendered the Leave Calendar as a partial grid (leading blanks, a fixed day count, Explore showing only the first two weeks) with a **who-is-out breakdown list below the grid** that the Group by toggle regrouped, and used ad-hoc inline-styled buttons for the view switch and the Pending/All/Approved filter. The refine pass (owner feedback 2026-08-08) superseded all of that:
- The breakdown list was removed; the calendar is now a genuine full month grid (Sun-Sat headers, real weeks x days cells, adjacent months greyed, today marked, prev/next month navigation, clean empty-month state) with per-day leave-type **icon** markers. The Group by toggle now drives the summary line and marker labels instead of a breakdown list.
- The view toggle and Status filter were restyled from inline buttons to Jo's segmented `.vtoggle` / `.vt` pattern.
- A Group by (Pay Group / Department) toggle was added to the Approval Queue (previously Pay Group only).

These are described in the current Final Design body above; this note records what they replaced.

## 2026-08-08 (v2.2) — superseded: calendar colour-by-type and the no-per-day-popover limitation

The first 2026-08-08 refine coloured the calendar markers by LEAVE TYPE and shipped no per-day popover ("up to 2/3 markers then +N, no per-day popover, out of scope for this pass"). The v2.2 calendar refine (owner feedback, same day) supersedes both:
- Marker colour now encodes the active Group by dimension (pay group / department) via a fixed deterministic palette; the leave type is carried by the marker icon glyph + text label. The calendar legend became two parts (a group colour-swatch key plus a leave-type icon key) that switch with the Group by toggle, replacing the single leave-type-colour legend.
- A per-day detail popover was added: clicking a day or a marker opens a dialog listing everyone out that day (name, both groups, type, hours, status), keyboard reachable and dismissible. This removes the earlier "no per-day popover" limitation.

This note records what v2.2 replaced. The colour-by-group calendar scheme that v2.2 introduced was itself later superseded by the v2.5 status-colour scheme (see next).

## 2026-08-08 (v2.5) — superseded: calendar colour-by-GROUP scheme

From v2.2 until v2.5 the Leave Calendar coloured by the active **Group by dimension**: each pay group (Group by = Pay Group) or each department (Group by = Department) got its own stable colour from a fixed deterministic palette (`payFGroupOrder` / `payFGroupColor` / `PAYF_PALETTE`), and the two-part legend carried a group colour-swatch key ("Colour = pay group" / "Colour = department") that switched when the Group by toggle flipped. The leave type was carried by the marker glyph + text label, and (from v2.3) person initials sat beside each marker icon. Flipping Group by recoloured every marker and swapped the legend's group key.

The v2.5 refine (owner feedback 2026-08-08) supersedes this colour language: the calendar now colours by **approval STATUS** (Approved green, Pending amber, Rejected red), with the day cell taking a priority colour (any Pending > else any Rejected > else all-approved; no-request days neutral) and each marker its own entry's status colour plus a paired status glyph. The group colour legend is replaced by a status legend; **initials now carry who-is-who**. Group by is retained but drives grouping and labels only (the queue, the day-detail, the marker's group label), never colour. The `payFGroupColor` / `payFGroupOrder` / `PAYF_PALETTE` helpers remain in the code but no longer feed any calendar colour. The current Final Design body above describes the shipped v2.5 status-colour behaviour; this note records the group-colour scheme it replaced.
## 2026-08-08 (v2.6) — superseded: Info popover lower section "other staff off this year totals"

From v2.4 until v2.6 the Approval Queue's per-person Info popover showed, in its LOWER section, a list of **other staff who had any time off this year** for coverage context: each other person (not the focused one, excluding rejected leave) with their pay group and their **total days off this year**, sorted by days descending (`payFOtherStaffYear`). The header showed only the person's name.

The v2.6 refine (owner feedback 2026-08-08) supersedes that lower list. The owner said the yearly-totals list was not what was wanted; the lower section now shows a **same-dates coverage-overlap list**: who else is off during the SAME dates as this person, computed as every other employee whose entry overlaps any of the focused person's date ranges (same month + year, `startA <= endB AND startB <= endA`), listed once per overlapping entry with that person's name, **department and pay group**, the overlapping dates and leave type + status; an empty result reads "No one else is off during these dates." The focused person's own **department and pay group** were also added to the panel header. The TOP per-leave-type year-totals section is unchanged. The `payFOtherStaffYear` helper was removed and replaced by `payFOverlapStaff` / `payFRangesOverlap` / `payFPersonMeta`. The current Final Design body (Interaction Spec + Data Contract) describes the shipped v2.6 overlap behaviour; this note records the yearly-totals list it replaced.

## 2026-08-08 (v2.7) — superseded: the Rejected workflow, leave-type icon markers, and the 3-colour day-cell priority

The v2.7 owner changes (2026-08-08) applied four things together, superseding parts of the earlier passes. The current Final Design body above describes the shipped v2.7 behaviour; this note records what it replaced.

- **Rejected workflow (superseded).** From v2.4 until v2.7 the Approval Queue carried a third status, **Rejected**: each pending entry had both an Approve and a Reject button; person-level bulk actions were both Approve all (N) and Reject all (N); a rejected entry read "Rejected by [name], [date]" in a red (`#c0392b` / `#fdecea`) chip with a `cancel` icon; the status filter had four chips (All / Pending / Approved / Rejected); Undo reversed either direction; the mock data carried already-Rejected entries; and Sign-off row 10 flagged Rejected as a NEW backend field + reject action. v2.7 removed Rejected entirely from both views: two statuses only (Pending, Approved), a three-chip filter (All / Pending / Approved), Approve-only per day, Approve all (N) only, Undo returns Approved to Pending, no red colour anywhere, and Sign-off row 10 is closed (the existing approve/unapprove model suffices). The `payFRejecterText` helper, the `reject-entry` / `reject-person` handlers and the `.payf-day.st-rejected` CSS were removed.

- **Leave-type icon markers (superseded).** From the v2.1 month-grid rebuild until v2.7 each leave type carried a distinct material-symbols glyph (Vacation `beach_access`, Sick `sick`, Personal `person`, Misc `more_horiz`), shown on the calendar markers and beside the type in the queue rows, day detail and Info panel; the calendar legend had a leave-type icon key; and (from v2.3) the marker showed a type icon plus initials plus a status glyph. v2.7 removed all leave-type icons: the type is a plain text label everywhere, a calendar marker is just the person's initials coloured by status (no type icon, no separate status glyph), and the legend is a status colour key only. `payFTypeColor` / `payFTypeIcon` were removed; `PAYF_LEAVE_TYPES` is kept as the type enumeration only.

- **Three-colour day-cell priority (superseded).** The v2.5 calendar priority was any Pending > else any Rejected (red) > else all-approved (green). With Rejected removed, v2.7's priority is any Pending (yellow) else all-approved (green); no-request days stay neutral; there is no red anywhere.

- **Range rows (superseded by the per-day model).** Earlier passes rendered a multi-day request as a single row with a date range (e.g. "Aug 12 to 14") in the queue and, on the calendar, one entry spanning several days. v2.7 expands each request to one line/marker per calendar day, individually shown, counted and approvable; all counts count day-lines.

- **Pay-Group-first default (superseded).** Earlier passes defaulted the Group by control to Pay Group (with Department the second option). v2.7 makes Department first and the default in both the Approval Queue and the Leave Calendar; Pay Group is the second option.

## 2026-08-08 (v2.8) — superseded: the single "Pending Approvals" Glance headline + "Out this week" secondary

From the 2026-08-07 Final until v2.8 the Glance (KPI) showed a single **Pending Approvals** count as the headline with an **Out this week** figure as a secondary (with an owner-sanctioned fallback to Pending Approvals alone if the two did not fit). The v2.8 owner change (2026-08-08) supersedes that: the Glance now shows two figures side by side, a **Pending** count and a separate **Outstanding** count, where Pending EXCLUDES outstanding (the two partition the pending set), and the **"Out this week" secondary was dropped** so the two priority figures read cleanly at 1×0.5. The `payFOutThisWeek` helper remains in the code but is no longer called. The current Final Design body (Data Contract, Size behaviour) describes the shipped v2.8 two-figure Glance; this note records the single-headline-plus-Out-this-week Glance it replaced. The Outstanding state itself (red calendar marker/cell + priority, queue "Outstanding" tag) is a net-new addition in v2.8 and is documented in the current body, not here.
