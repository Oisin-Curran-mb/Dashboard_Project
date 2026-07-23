# Market Research: Payroll Scheduled Time Off

> Step 2 — Feedback / Market Research. Captures how other companies present this kind of information — visuals, layout, framing — so a widget's design options can be checked against real precedent (or an honest "no direct precedent found") before Step 3 locks in Options A/B/C.

**Widget:** W09 — Payroll Scheduled Time Off
**Module:** Payroll
**Researched:** 2026-07-22
**Status:** ✅ Researched — via the `widget-market-research` skill (parallel-agent research pass, manual cross-check in place of automated verification)

## What This Widget Shows Today

Per `Step 1 - Dashboard Research/09 - Payroll Scheduled Time Off.md`: a 3-level expandable list (Department > Employee > Daily detail) of time-off requests for departments the logged-in supervisor is authorised to approve, with inline bulk-approve/reject checkboxes at the employee and day level. **Note:** already Step 4 — locked (`Step 4 - Widget Final Design/W09 - Payroll Scheduled Time Off.md`) — keeps Leave Calendar and Confirmation Dashboard as the two views, deliberately restoring the approval workflow after an earlier draft had dropped it in favour of read-only views. Per the punch list, this is flagged ⚠️ **highest-risk widget** in the whole project.

## Data Used

`PR_EmployeeOffSchedule`, `PREmployeeTimeOffApprovals` (authorisation records — which departments each supervisor can approve), `SSUserTenantPreference` (per Step 1). Per `Step 3 - Mock_Work/Data and Build Readiness - Developer Punch List.md`'s `## W09` section: Calendar Year/View/Leave Type/Department filters ✅ available; Leave Calendar view ✅ available (read-only rendering of confirmed data); **Confirmation Dashboard view — inline approve/reject 🔴 major gap** — not implemented in the Modern API at all, despite being the widget's whole reason for existing per its own Purpose statement; **approval-authority scoping 🔴 major gap** — the Modern API returns all company schedules, not filtered to the logged-in supervisor's authorised departments, a real data-exposure issue, not just a missing convenience; custom column labels (Vacation/Sick/etc., renamable per org) 🔴 missing — static labels only, `PRCompany` custom names not implemented; KPI (Pending Approvals + Out today/this week) 🟡 needs new query.

## Competitor / Industry Findings

**Already on file, carried forward from Step 3/4 rather than re-derived:**
- Leave-management dashboards should surface leave balances, pending requests, and a calendar view for planning, with one-click approve/reject (including bulk actions) as the core manager interaction. *Sources: [Synergy Codes](https://sub.synergycodes.com/our-work/leave-management-dashboard-for-hr-department-purposes/); [Factorial](https://help.factorialhr.com/en_US/absences-approvals/how-to-create-time-off-approval-systems).* Already confirmed a real project decision: an earlier draft had dropped the approval workflow for read-only views, which this standard shows would have been a genuine regression.

**New this pass:**
- **Honest gap, largely negative evidence** — nonprofit/church-specific tools don't really compete here. MinistryPlatform and Planning Center are volunteer/congregation management systems, not payroll/HR software, with no time-off approval feature found. Aplos doesn't build its own time-off UI at all — it partners with Gusto for payroll/HR, so any approval workflow a church using Aplos sees is Gusto's. *Sources: [MinistryPlatform](https://www.acstechnologies.com/ministryplatform); [Planning Center](https://support.planningcenteronline.com); [Aplos — Tracking Payroll](https://help.aplos.com).* General HR platforms are the right comparison group here, not nonprofit-specific ones.
- **Confirmed pattern (structural difference, not a contradiction)** — general HR platforms use flat, filtered lists rather than a nested department > employee > day tree. Gusto's "Manage Requests" is a single flat queue with status tabs and one-at-a-time approve/decline. Rippling's approvals view is a flat list with an expand arrow for detail and a separate Calendar view offering Bulk Approve, scoped by permission profile to a manager's department. *Sources: [Gusto — Manage Requests](https://support.gusto.com/article/101980064100000); [Rippling — Approvals](https://finni.help.usepylon.com/articles/1634595385).* No competitor found matches this widget's specific 3-level nesting — that's a genuine design choice without a direct precedent either way, not something contradicted by what's out there.
- **Confirmed pattern (4 independent platforms) — approval-authority scoping is a data-model feature everywhere it's done well, not a UI filter.** Workday scopes via Supervisory Organizations, with security roles assigned to positions in the hierarchy and approval chains that walk up it automatically. Rippling separates "Scope" (a reporting line or department, tied to first-class Manager/Direct Reports employee attributes) from "Access" (what can be done). Gusto ties visibility to an assigned-manager field on the employee record. BambooHR defines a distinct "Manager access level" derived from the org chart's manager-assignment field. *Sources: [Workday role-based security overview](https://elevate.umd.edu/learning-training/functional-overviews/your-role-workday-role-based-security-101); [Rippling — Permissions](https://www.rippling.com/platform/permissions); [Gusto — Manage Requests](https://support.gusto.com/article/101980064100000); [BambooHR — Access Levels](https://www.bamboohr.com/blog/access-levels-bamboohr).* This is strong, multi-source confirmation that treating scoping as a data-model object (which this project already has in `PREmployeeTimeOffApprovals`) — not an ad hoc filter — is the real industry standard, directly reinforcing the punch list's framing of this gap as a genuine data-exposure issue.

## Visual Options (aim for 3)

1. **No change to the Leave Calendar / Confirmation Dashboard structure** — well supported by Synergy Codes/Factorial, and this pass found no competitor with a stronger alternative to displace it. Data needed: ✅ Leave Calendar available today; Confirmation Dashboard's approve/reject blocked on the major gap below.
2. **When the Modern API rebuild happens, model approval-authority scoping as a first-class data-model relationship** (mirroring Workday's Supervisory Organization / Rippling's Manager-Direct Reports attributes), reusing the legacy's own `PREmployeeTimeOffApprovals` table rather than reintroducing it as a query-time filter. Based on: the 4-platform scoping finding. Data needed: 🔴 major gap already flagged — this finding is about *how* to fix it correctly, not a new ask.
3. **Considered, not recommended:** flattening the 3-level nested tree toward Rippling's flat-list-plus-expand-arrow-plus-bulk-approve pattern. Flagged because no competitor validates the deeper nesting specifically — but nothing found contradicts it either, so this stays a "worth knowing," not a "worth changing," finding. Data needed: N/A — a layout question, not a data question.

## Net Assessment

**Supports, with substantially reinforced urgency on the highest-priority gap.** The two-view Calendar + Confirmation Dashboard design remains well-supported by the existing citations. The most valuable finding this pass is the approval-authority-scoping research: four independent, unrelated platforms (Workday, Rippling, Gusto, BambooHR) all implement manager-scoped visibility as a genuine data-model feature, not a UI filter — this substantially strengthens the case that the Modern API's current behaviour (returning all company schedules to any user) is a real defect against established practice, not just an internal preference, and it points toward reusing the legacy's own authorisation table as the fix rather than building a new filter layer.

## Sources

- [Synergy Codes — Leave Management Dashboard](https://sub.synergycodes.com/our-work/leave-management-dashboard-for-hr-department-purposes/)
- [Factorial — Time Off Approval Systems](https://help.factorialhr.com/en_US/absences-approvals/how-to-create-time-off-approval-systems)
- [MinistryPlatform](https://www.acstechnologies.com/ministryplatform)
- [Planning Center](https://support.planningcenteronline.com)
- [Aplos — Tracking Payroll](https://help.aplos.com)
- [Gusto — Manage Requests](https://support.gusto.com/article/101980064100000)
- [Rippling — Approvals](https://finni.help.usepylon.com/articles/1634595385)
- [Rippling — Permissions](https://www.rippling.com/platform/permissions)
- [BambooHR — Access Levels in BambooHR](https://www.bamboohr.com/blog/access-levels-bamboohr)
- [Workday — Role-Based Security Overview](https://elevate.umd.edu/learning-training/functional-overviews/your-role-workday-role-based-security-101)

## Note on Existing Content Elsewhere

`Step 3 - Mock_Work/Widget_Specs/W09-Payroll-Scheduled-Time-Off.md` and `Step 4 - Widget Final Design/W09 - Payroll Scheduled Time Off.md` both still carry their own `## Purpose & Competitive Fit Check` / `## How Other Companies Fulfil This Purpose` sections (Synergy Codes, Factorial). Nothing there has been moved or deleted — this file cites the same sources and adds substantially more on top, especially on the scoping gap. Whether to update those two sections to point here is still an open decision.
