# W09 — Payroll Scheduled Time Off

**Module:** Payroll
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W09-Payroll-Scheduled-Time-Off.md](../Mock_work/Widget_Specs/W09-Payroll-Scheduled-Time-Off.md)
**Data source & formulas:** [Dashboard_Research/09 - Payroll Scheduled Time Off.md](../Dashboard_Research/09%20-%20Payroll%20Scheduled%20Time%20Off.md)

## Purpose
Gives supervisors a view of all scheduled time-off requests across their departments, organised by department and employee, with the ability to approve or reject requests directly from the widget.

## How Other Companies Fulfil This Purpose
- Leave-management dashboards should surface leave balances, pending requests, and a **calendar view** for planning ([Synergy Codes](https://sub.synergycodes.com/our-work/leave-management-dashboard-for-hr-department-purposes/)).
- **One-click approve/reject**, including bulk actions, is called out as the core manager interaction for this exact workflow ([Factorial](https://help.factorialhr.com/en_US/absences-approvals/how-to-create-time-off-approval-systems)).

**Net assessment:** the two views below map directly onto the two standard leave-management treatments. This also confirms a decision already made earlier in this project: an earlier draft had dropped the approval workflow in favour of read-only views, which the standard shows would have been a real regression, not just a deviation from the old design.

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

## What Got Cut (and why)
- **A third "Department Summary Bars" option** — dropped earlier in this project; it was read-only and didn't serve either of the two real purposes (planning or approving) as well as the two kept views.

## Fine-Tuning Notes
- Leave type uses consistent colour coding across both views (org-configured colours, not fixed)
- Department filter, where shown, narrows both views consistently
