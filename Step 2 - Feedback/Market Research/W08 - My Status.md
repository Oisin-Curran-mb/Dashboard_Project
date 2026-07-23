# Market Research: My Status

> Step 2 — Feedback / Market Research. Captures how other companies present this kind of information — visuals, layout, framing — so a widget's design options can be checked against real precedent (or an honest "no direct precedent found") before Step 3 locks in Options A/B/C.

**Widget:** W08 — My Status
**Module:** Other (spans multiple modules)
**Researched:** 2026-07-22
**Status:** ✅ Researched — via the `widget-market-research` skill (parallel-agent research pass, manual cross-check in place of automated verification)

## What This Widget Shows Today

Per `Step 1 - Dashboard Research/08 - My Status.md`: a personalized action-item panel. Each user picks from ~21 available "queries" (e.g. "My Unposted Journal Entries," "Purchasing Requests Needing My Approval," "Employee Birthdays This Month"); the widget shows a simple two-column table — query name and current record count — filtered to only the queries the user has permission to see. Clicking a row either opens an in-widget detail panel or navigates elsewhere in the app. No chart, ever. **Note:** unlike every other widget researched so far, this one is Step 3 — **deferred** (skipped for this pass, revisit later) and has no Step 4 Final Design doc yet — there's no locked design to check this research against, only the Step 1 Purpose doc's own findings.

## Data Used

`SSUserTenantPreference` (the user's saved query selection) plus a different table per query — only 5 of the 21 legacy queries have confirmed table sources so far (per Step 1). **No entry exists yet in `Step 3 - Mock_Work/Data and Build Readiness - Developer Punch List.md`** — this widget hasn't been added to that list, consistent with its deferred status. The Step 1 doc itself already documents the single biggest legacy-vs-Modern-API gap found across all 17 widgets: the Modern API hardcodes only 5 of the legacy's 21 query types (via reflection-based discovery), has **no permission-based filtering at all** (any authenticated user sees all 5 regardless of access rights), and the "save selected queries" endpoint is a non-functional stub that returns success without persisting anything.

## Competitor / Industry Findings

**No existing citations to build on** — this widget has no Step 3/4 doc with prior research, unlike every other widget covered so far. Everything below is new.

- **Confirmed pattern (no chart, anywhere)** — every "action item" widget researched across four different platforms uses a plain name + count + click-through list, never a chart. *Sources: NetSuite Reminders (below), [Bill.com Approvals](https://help.bill.com/direct/s/article/000004427), [QuickBooks Online Tasks widget](https://quickbooks.intuit.com/learn-support/en-uk/other-questions/customise-tasks-widget-on-homepage/00/1428826), [Sage Intacct dashboard components](https://www.intacct.com/ia/docs/en_US/help_action/Reporting/Dashboards/Define_content/edit-component-properties.htm).* This directly validates this widget's simple table-only display — there's no competitor precedent suggesting a chart would be an improvement here.
- **Confirmed pattern, near-exact match** — NetSuite's "Reminders" portlet is the closest precedent found anywhere in this project for this widget's actual mechanism: users drag items from an ~80-entry System-Defined Reminders catalog (Bills to Pay, Employees with an Upcoming Birthday, Purchase Requests to Approve, etc.) into a personal selection, can reorder them, promote favourites to a bolded "Headline" position, toggle "Show reminders with zero results," and even add fully custom reminders built on their own saved searches — an open-ended plugin model much like this widget's 21 reflection-discovered queries. *Sources: [NetSuite — Setting Up Reminders](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N581945.html); [NetSuite — System-Defined Reminders Table](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N582302.html)* — two independent pages within Oracle's own docs corroborating the same mechanism. **Confidence: confirmed pattern.**
- **Contrast cases, single-sourced each** — Bill.com's Approvals view is a fixed system view, not user-selectable per category. QuickBooks Online's Tasks widget is system-defined with no per-category customization. Sage Intacct's Approvals dashboard component is admin-configured per dashboard, not end-user pick-your-query. None of these three match this widget's genuinely open-ended, user-driven customization — NetSuite is the outlier that does.
- **Confirmed pattern (3 independent platforms) — permission-scoped rendering is standard, not optional.** Sage Intacct checks permission at both the dashboard level and the individual-component level, computing "effective permissions" as a superset across all of a user's roles, live at render time — a component with insufficient permission shows blank or errors rather than rendering. *Source: [Sage Intacct — Dashboard Permissions](https://www.intacct.com/ia/docs/en_US/help_action/Reporting/Dashboards/dashboard-permissions.htm) (modified Jul 2, 2026).* NetSuite ties dashboards and KPI portlets to Role + Center type, with a separate permission gating who can even personalize which components. *Source: NetSuite role-based dashboards (consultant secondary source, single-sourced on its own — but corroborating the same general pattern Sage Intacct documents directly).* Salesforce evaluates Lightning component visibility live per user against Custom Permissions/Profile — hiding a component entirely if the check fails, not just visually. *Source: [Salesforce — Selectively Show Components Using Custom Permissions](https://admin.salesforce.com/blog) (2021-11-02, updated 2025-04-18).* **Confidence: confirmed pattern** — both what-options-exist and whether-data-renders are checked live per user across all three platforms, not a static global list.

## Visual Options (aim for 3)

1. **Keep the table-only, name+count+click-through display** — validated as the universal pattern for this widget category across every platform researched; no chart adds value here. Based on: the "no chart, anywhere" finding. Data needed: ✅ already how it works today.
2. **User-customizable selection from a large catalog** (matching the legacy's reflection-discovered 21 queries) is a real, working pattern — NetSuite's Reminders portlet proves it out in production, including zero-result toggling and custom saved-search-based reminders. Based on: the NetSuite finding. Data needed: 🔴 blocked — even reaching parity with the *current* legacy behaviour is blocked, since the Modern API's "save selected queries" endpoint is a non-functional stub; NetSuite's fuller model is further out still.
3. **Permission-scoped rendering** (both which queries are offered and whether their counts actually render) checked live per user. Based on: the Sage Intacct/NetSuite/Salesforce finding. Data needed: 🔴 major gap — the Modern API currently has zero permission filtering, which this research confirms is a real regression from baseline industry practice, not just from this project's own legacy system.

## Net Assessment

**No design change indicated, but this research substantially raises the stakes on the widget's known gaps.** The visual simplicity (table, no chart) is now fully validated — nothing found suggests adding a chart would help. The real value of this pass is grounding two already-flagged Modern API gaps in real competitor precedent rather than internal judgment alone: permission-scoped rendering is confirmed standard practice across three independent, unrelated platforms (Sage Intacct, NetSuite, Salesforce), which makes the current zero-permission-filtering behaviour a clearer regression than "the legacy system used to do this" alone would suggest. NetSuite's Reminders portlet is also the single closest precedent found anywhere in this project for an open-ended, user-customizable action-item widget, and is worth keeping as a reference point whenever this widget comes off deferred status.

## Sources

- [NetSuite — Setting Up Reminders](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N581945.html)
- [NetSuite — System-Defined Reminders Table](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N582302.html)
- [Bill.com — Manage Approvals from the Approvals Page](https://help.bill.com/direct/s/article/000004427)
- [QuickBooks Community — Customise Tasks Widget on Homepage](https://quickbooks.intuit.com/learn-support/en-uk/other-questions/customise-tasks-widget-on-homepage/00/1428826)
- [Sage Intacct — Edit Dashboard Component Properties](https://www.intacct.com/ia/docs/en_US/help_action/Reporting/Dashboards/Define_content/edit-component-properties.htm)
- [Sage Intacct — Dashboard Permissions](https://www.intacct.com/ia/docs/en_US/help_action/Reporting/Dashboards/dashboard-permissions.htm)
- [Salesforce — Selectively Show Components to Users Using Custom Permissions](https://admin.salesforce.com/blog)

## Note on Existing Content Elsewhere

No `## How Other Companies Fulfil This Purpose` section exists yet in `Step 3 - Mock_Work/Widget_Specs/W08-My-Status.md` (the widget is marked deferred there), and there is no `Step 4 - Widget Final Design/W08...` file at all. This is the first competitive research this widget has received. When it comes off deferred status, the Step 3 spec should link back to this file rather than starting from scratch.
