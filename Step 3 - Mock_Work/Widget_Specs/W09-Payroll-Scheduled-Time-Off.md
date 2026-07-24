# W09 — Payroll Scheduled Time Off

**Module:** Payroll  
**Status:** ✅ Minor tweaks  
**Research doc:** [09 - Payroll Scheduled Time Off.md](../../Step 1 - Dashboard Research/09 - Payroll Scheduled Time Off.md)
**General rules:** [General Widget Design Rules.md](General%20Widget%20Design%20Rules.md)

## Purpose
Gives supervisors a view of all scheduled time-off requests across their departments, organised by department and employee, with the ability to approve or reject requests directly. *(Corrected — the earlier draft dropped the approval workflow entirely; see note below.)*

---

## Purpose & Competitive Fit Check (Phase 1)
**Industry standard:** leave-management dashboards should surface leave balances, pending requests, and a calendar view, with one-click approve/reject as the core manager interaction ([Synergy Codes](https://sub.synergycodes.com/our-work/leave-management-dashboard-for-hr-department-purposes/), [Factorial](https://help.factorialhr.com/en_US/absences-approvals/how-to-create-time-off-approval-systems)).

**Fit-check:** the two current options map directly onto the two standard leave-management views — Option A (Leave Calendar) matches the recommended calendar visualisation for planning, and Option B (Confirmation Dashboard) matches the recommended one-click approve/reject workflow closely, including bulk actions. The decision already made in this file to restore the approval workflow (rather than the earlier read-only draft) is strongly supported by the standard — a read-only version would have been a regression against typical leave-management UX, not just against the old design.

---

## ⚠️ Major mismatch found and resolved this session

The old design's defining feature is a 3-level expandable list (Department → Employee → Day) with inline approve/reject — bulk-approve at employee level, per-day approve/unapprove — and it's explicitly the **only** dashboard widget where users take direct action. The earlier draft's three options (Leave List, Department Bars, Calendar) were all read-only, dropping that capability entirely.

**Resolved this session:**
- This widget has **two** options, not three. Option C (Department Summary Bars) is dropped.
- **Option A — Leave Calendar**, kept from the old Option C concept.
- **Option B — Confirmation Dashboard**, rebuilt around the old approval workflow: a drill-in view for reviewing and confirming (approving/rejecting) time-off requests, preserving the 3-level expand + checkbox behaviour.
- **No Small size for this widget.** Only KPI, Medium, and Large apply — this is the first confirmed example of a widget where Small isn't offered (the approval workflow and calendar view both need more room than a 1×1 tile can give).

## Filter Options
| Filter | Values |
|--------|--------|
| Calendar Year | Dynamic — only years that have time-off records appear (matches old design); defaults to the most recent year |
| View | Show All · Show Pending · Show Approved (matches old design — this is the filter the earlier draft dropped entirely) |
| Leave Type | Dynamic — populated from the organisation's configured leave-type labels (Vacation/Sick/Personal/Misc. by default, but renamable and some hidden per org) |
| Department | Only shown/useful if a supervisor is authorised for more than one department; otherwise redundant since supervisors already only see their own departments |

Both Calendar Year and View are saved per user and persist across sessions, matching old design.

**KPI size (3-dot menu):** Calendar Year only (time filter default), no View/Leave Type/Department at this size.

## Data Table Sort
Fixed — Department alphabetical, then Employee alphabetical within department, then Day chronological within employee. Not user-changeable — matches the natural structure of the approval workflow, where predictable order matters more than flexible sorting.

## Drill-Through
No separate external link — Option B's entire purpose *is* the drill-in confirmation view (Department → Employee → Day), so it already satisfies this requirement internally rather than via a page link out.

## Refresh
Standalone icon on the card (not a 3-dot menu item), present at every size including KPI.

---

## Option A — Leave Calendar *(Redesign)*

**Chart:** Mini calendar grid showing leave days marked per employee  
**Views available:** Calendar (default) · List  
**Improvement note:** Visual week-by-week view — ideal for planning rosters.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Medium (2×2)** | 2-week view with employee initials |
| **Large (4×4)** | Month view, full names, hover for details |
| **KPI (1×0.5)** | Headline: **Pending Approvals** count, with **Out today/this week** as a secondary figure — two numbers in one tile, needs a fit test at 1×0.5 (same pattern as W01 Version A's dual-figure KPI); fall back to just Pending Approvals if it doesn't fit cleanly. |
| **Expanded** | Month view, all filters live inside the modal |

*(No Small size — see note above.)*

---

## Option B — Confirmation Dashboard *(Redesign — preserves old approval workflow)*

**Chart:** 3-level expandable list — Department → Employee → Day — matching the old design exactly: employee-level bulk-approve checkbox, per-day approve/unapprove checkbox, status shown as "Pending" or "Approved by: [name] [date]"  
**Views available:** Expandable list only (no chart/table toggle — the expand/collapse structure *is* the view)  
**Improvement note:** This is the widget's core interaction; visual polish only, not a structural redesign.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Medium (2×2)** | Departments collapsed by default; expanding one shows its employees (collapsed); a fixed-height, internally-scrolling region once expanded (Hard Rule 2 table exception) |
| **Large (4×4)** | All levels expanded by default on load (matches old design), fixed-height scrolling region for the day-level detail |
| **KPI (1×0.5)** | Same as Option A's KPI — Pending Approvals + Out today/this week |
| **Expanded** | Full 3-level view, all filters live inside the modal, same approve/reject interactivity |

*(No Small size — see note above.)*

---

## Fine-Tuning Notes
- Leave type should use consistent colour coding across both options (colours per org-configured type, not a fixed green/amber/blue — labels themselves are renamable per org)
- Department filter (where shown) should narrow both options consistently

---

## 2026-07-23 — Create Mock Designs run (Rules 8-11): 3 options rebuilt

Built via the Create step of the 3-skill pipeline. Options A/B/C in `Dashboard Widget Mockups.html` and `WRENDER[9]` replaced in place; per-option filter scoping added. Prior entries above are unchanged (additive history).

### Option A — Approval Workflow *(Keep/Refresh — Restyled Original)*
Legacy approval/calendar screen restyled with Pathway. Default view is a per-request **approval list**: colour-coded leave-type bar, employee, dept · type, date range, and a **Pending/Approved status chip**, with a "N pending of M requests" header. A **Calendar** alternate view (colour-coded month grid) is offered via the on-menu view switch. No competitor citation — faithful restyle.

### Option B — Approval Queue *(Improve — Competitor Match)*
Matches the Gusto "Manage Requests" / Rippling **pending-first queue** pattern (Market Research confirmed): requests sorted Pending-first, each pending row showing an inline approve (`check_circle`) / decline (`cancel`) affordance; a Table alternate view. **Rule 10 second dimension:** a **days-by-type composition strip** above the list, aggregating `days` by leave `type` (Annual/Sick/Personal) across the current selection — a real second breakdown, not a restyle of the same list.

### Option C — Coverage Breakdown *(Redesign — Maximum Freedom)*
Reframes the widget around **coverage risk**: per-department **horizontal stacked bars of leave DAYS by type**, showing where cover is thin, plus a Table view of the same **department × leave-type × days** cross-tab. **Rule 10 second dimension:** the dept × type × days aggregation. Purpose-driven, no citation.

### Rule 8 — per-option filter scoping
`WRENDER[9]` uses `var fk=wid+'-'+opt` and reads all filters via `fv(fk,…)` / `ftags(fk)`, so 9-A / 9-B / 9-C keep independent filter state. The shared `_renderFltBody` / `applyFilter` scoping conditions were extended to include `wid===9` alongside the existing 4/5/6 (those left intact); `openFilter` needed no change (it already captures `opt`). Dashboard cards call `openFilter(9,event,'A'|'B'|'C')`.

### Rule 9 — sizes, and the no-Small exception
KPI, Medium, and Large all render real content for all three options. **Small is intentionally absent** for W09 — the pre-existing confirmed exception (General Widget Design Rules, Rule 6: the approval workflow / calendar need more room than 1×1). The Dashboard cards offer Medium / Large / KPI size buttons only (no Small button), and each card now defaults to Medium rather than Small. This is a documented exception, not a silent omission.

### KPI headline
KPI size shows the live **Pending Approvals count** (from the `st` field). `kpiTimeFilter[9]` is set to `Calendar Year` so the KPI-size filter modal has a valid time filter rather than showing the "No filters" toast.

### Rule 11 — data caveats (documented here, not shown on-screen)
This build surfaces approval **status** (`st`: Pending/Approved) — a field added to `MOCK_DATA.series[9]` this pass (every leave row now carries `st`; a realistic ~30% Pending mix). **Backend availability of an approval-status field, and especially an approve/reject action + status endpoint, is an open gap** (Modern API per the Developer Punch List does not implement inline approve/reject or a per-request status). Also unconfirmed and noted for finalisation: approval-authority department scoping (the Modern API returns all company schedules, not just those the viewer can approve) and custom org-defined leave-type labels (static Annual/Sick/Personal used). None of these are marked on the mockup itself — the cards render as if real; this note is the record for whoever finalises the design.

### Where written
`Dashboard Widget Mockups.html` — `MOCK_DATA.options[9]` (titles/subs/imp/citations), the three Option A/B/C cards' markup (titles, per-option filter calls, view-switch labels, size buttons), `WRENDER[9]` (all three branches + KPI), `MOCK_DATA.series[9]` (added `st` per leave row), `MOCK_DATA.kpiTimeFilter[9]`, and the shared filter-scoping branches (extended to include 9). `mock-data.master.js` re-synced for `options[9]` and `series[9]`. **Final Check tab `#fc-widget-9` was not edited** — it still shows its "Final design — locked" badge and its old "Month Calendar / Upcoming List / Department View" chrome; because it renders live through this same `WRENDER[9]`, it now shows the new render under stale labels (the known, already-documented shared-render carryover — to be reconciled separately, out of scope for this skill).
