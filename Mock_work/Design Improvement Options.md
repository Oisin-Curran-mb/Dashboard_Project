# Dashboard Widget Design Improvement Options

> **Document type:** Step 2 input — Design direction suggestions  
> **Feeds into:** Step 3 (Design) of the re-platform lifecycle  
> **Based on:** Purpose documents 01–17 in this folder  
> **Investigated by:** Oisin / Claude

Each section below identifies what could be improved about the current widget and offers concrete design options. Where a widget works well and just needs a visual refresh, the suggestion is kept brief. Where the interaction model or information architecture has problems, more detail is given.

---

## How to Read This Document

- **Keep / Refresh** — widget is fundamentally sound; update the visual style only  
- **Improve** — widget works but has a specific problem worth fixing  
- **Redesign** — the current approach has meaningful UX issues or better patterns exist

---

## 1. Budget Compared to Actual
> See: [01 - Budget Compared to Actual.md](../Dashboard Research/01%20-%20Budget%20Compared%20to%20Actual.md)

**Status:** Needs light review — Keep / Refresh

The side-by-side bar and line chart approach is standard and understood. The core improvement is surfacing the _gap_ more clearly rather than asking the user to visually compare two bars.

### Option A — Add a variance row / third bar
Add a third bar or line representing the variance (actual minus budget) per period — positive in green, negative in red. This is the pattern used by Bold BI's Budget vs Actual dashboard and Coefficient's QuickBooks templates. Users see the gap directly rather than inferring it.

### Option B — KPI summary header
Add three summary cards above the charts: **Total Budget**, **Total Actual**, and **Variance (%)** for the current YTD position. Answers "are we over or under?" in under a second without reading the chart.

### Option C — Waterfall chart (higher effort)
Replace the period bar chart with a waterfall/bridge chart that shows where budget was gained or lost period by period. More meaningful for finance teams reviewing year-end. Higher design and development cost — only worth doing if the audience regularly does variance analysis.

**Recommended starting point:** Option A + B together, applied to the existing chart layout.

**References:**
- [Budget vs Actual Dashboard — Bold BI](https://samples.boldbi.com/solutions/finance/budget-vs-actual-dashboard)
- [QuickBooks Budget vs Actual template — Coefficient](https://coefficient.io/templates/quickbooks-budget-vs-actual-report)

---

## 2. Pension Plans
> See: [02 - Pension Plans.md](../Dashboard Research/02%20-%20Pension%20Plans.md)

**Status:** Ready to re-design — Improve

The pie chart works for up to five plan types, but becomes cluttered as plans increase.

### Option A — Stacked bar chart by district
Replace the pie with a stacked horizontal bar chart where each bar is a district and each segment is a plan type. This makes the district filter interactive and visual rather than a dropdown — and lets users compare across districts at a glance.

### Option B — Keep pie but add a total KPI card
A simple improvement: add a single card at the top showing **Total Annual Contribution** and **Number of Active Plans**. Gives immediate context before the user looks at the chart breakdown.

**References:**
- [Pensions Dashboard — PayCaptain](https://www.paycaptain.com/features/pensions-dashboard)
- [Mercer Defined Benefit Plan Dashboard](https://www.mercer.com/en-us/solutions/retirement/defined-benefit-pensions/plan-dashboard/)

---

## 3. Payroll Distributions
> See: [03 - Payroll Distributions.md](../Dashboard Research/03%20-%20Payroll%20Distributions.md)

**Status:** Needs light review — Keep / Refresh

This widget is clear and well-structured. Two small visual improvements are worth considering.

### Option A — Donut chart instead of full pie
Replace the pie with a donut and place the **total payroll amount** in the centre. The user gets the breakdown and the total in one glance without needing to find the totals row in the table.

### Option B — Horizontal bar chart sorted by value
A sorted horizontal bar chart (largest to smallest) is easier to read when there are many compensation categories. Avoids thin pie slices for small categories.

**References:**
- [Payroll Dashboard designs — Dribbble](https://dribbble.com/search/payroll-ui-design)

---

## 4. Remittance Pledges
> See: [04 - Remittance Pledges.md](../Dashboard Research/04%20-%20Remittance%20Pledges.md)

**Status:** Needs light review — Improve

The table is functional but the current default (today's date, showing no data) creates an immediate poor first impression.

### Option A — Inline progress bars in the % Paid column
Replace the raw percentage text with a visual progress bar in the % Paid column. Red for behind pace, green for on track. This lets a supervisor scan the table in seconds without reading numbers.

### Option B — On-track / behind indicator
Add a calculated column or icon: compare % Paid against % of year elapsed. If the pledge is behind pace, show a red indicator; if on track or ahead, show green. This is the insight the user actually needs — not just the raw % paid.

### Option C — Fix the default date (low effort, high impact)
Rather than defaulting to today, default to the start of the current fiscal year or the most recent period end. This is the most impactful single change — users currently see an empty table every time they open the widget.

---

## 5. Receivable Invoices Outstanding
> See: [05 - Receivable Invoices Outstanding.md](../Dashboard Research/05%20-%20Receivable%20Invoices%20Outstanding.md)

**Status:** Needs significant review — Redesign

This is one of the most data-rich widgets and the current design underserves it.

### Option A — Horizontal stacked bar as the primary visual
Replace the pie chart with a single horizontal stacked bar showing the five aging buckets in order (Current → 121+). This is the industry standard pattern for AR aging (used by Power BI AR dashboards, Coupler.io, and most BI tools). Colour progresses from green (current) to red (most overdue). The total outstanding is immediately legible from the bar length, and the aging spread is clear from the segment sizes.

### Option B — Add a DSO (Days Sales Outstanding) KPI card
Add a single headline metric above the chart: **Days Sales Outstanding**. This is the number every AR manager tracks. It provides instant context for whether the aging profile is improving or worsening over time. Virtually every modern AR dashboard (QuickBooks, Xero, Power BI) surfaces this prominently.

### Option C — Risk classification per customer in the drill-down
In the detail panel, add a risk column (Low / Medium / High) based on how many days overdue each invoice is. Accounts over 90 days are automatically flagged High. This helps collections staff triage faster without reading individual day counts.

**Recommended:** Option A + Option B are both straightforward to implement and together bring this widget in line with industry standards.

**References:**
- [AR Dashboard Examples — Coupler.io](https://www.coupler.io/dashboard-examples/accounts-receivable-dashboard)
- [AR Aging Dashboard — VertAccount](https://www.vertaccount.com/blog/best-accounts-receivable-dashboard-examples-templates-for-2026/)
- [Accounts Receivable Dashboard — Power BI](https://globaldata365.com/accounts-receivable-dashboard/)

---

## 6. Insurance Billing Plans
> See: [06 - Insurance Billing Plans.md](../Dashboard Research/06%20-%20Insurance%20Billing%20Plans.md)

**Status:** Needs light review — Keep / Refresh

This widget is clean and clear. One targeted improvement:

### Option A — Donut chart with total enrollment in the centre
Replace the pie with a donut. Put **Total Enrolled** in the centre. Keeps the breakdown visual while adding an immediately readable headline number. Plans with zero enrollment should remain in the table but visually distinguished (greyed out row).

---

## 7. Deposit Accounts
> See: [07 - Deposit Accounts.md](../Dashboard Research/07%20-%20Deposit%20Accounts.md)

**Status:** Ready to re-design — Improve

The primary UX issue here is already documented: **the filter only affects the table, not the pie chart**. This is the most important thing to fix before any visual improvements.

### Option A — Make the filter affect both table and chart (critical fix)
The account type filter should update both the table and the pie chart. Showing a filtered table alongside an unfiltered chart implies the data is inconsistent — confusing for users. This pattern appears in three widgets (Deposit Accounts, Loans, AP by Due Date) and should be addressed consistently across all three.

### Option B — Replace pie with mini account cards
Instead of a single pie chart, show each deposit account as its own small balance card. Cards are grouped by account type. Selecting an account type collapses all other groups. This is closer to how Xero displays bank accounts — each account has its own tile.

### Option C — Resolve the naming inconsistency
Decide whether the widget is called "Deposit Accounts" or "Deposits On Hand" and use it consistently in the widget title, breadcrumb, and module navigation. This is a minor fix but matters for a consistent redesign.

---

## 8. My Status
> See: [08 - My Status.md](../Dashboard Research/08%20-%20My%20Status.md)

**Status:** Needs significant review — Redesign

This widget has the highest potential for a meaningful redesign. The current two-column table presents 21 possible queries as a flat list — functional, but it misses an opportunity to create a genuinely useful personal command centre.

### Option A — KPI card grid (recommended)
Replace the table with a grid of cards — one per selected query. Each card shows:
- An icon representing the category (Finance, HR, Payroll, etc.)
- The query name
- The current count in large text
- A colour indicator (grey for zero, amber for low count, red for high count)

Cards with a count of zero are still shown but visually de-emphasised. This mirrors how modern HR and finance dashboards (TeamHub, Staffbase HR Widgets) surface personalised counts. The user scans cards at a glance rather than reading a list.

### Option B — Grouped by category with counts
Group the 21 queries into logical categories (e.g. Finance, HR, Payroll, Purchasing) and show them as collapsible sections. Category headers show a total count for that group. The user can collapse categories that are not relevant to their role.

### Option C — Surface the non-zero items first
The simplest improvement: sort the query list so that items with a non-zero count always appear at the top, with a visual separator from the zero-count items. Currently zero and non-zero rows are mixed, so the user must scan the whole list every time.

**Recommended:** Option C is low effort and immediately useful. Option A is the full redesign.

**References:**
- [HR Dashboard with widgets — TeamHub Figma](https://www.figma.com/community/file/1552262349953288359/teamhub-hr-team-management-admin-dashboard-ui-design)
- [Overview of HR Widgets — Staffbase](https://support.staffbase.com/hc/en-us/articles/27956507092114-Overview-of-HR-Widgets)

---

## 9. Payroll Scheduled Time Off
> See: [09 - Payroll Scheduled Time Off.md](../Dashboard Research/09%20-%20Payroll%20Scheduled%20Time%20Off.md)

**Status:** Needs significant review — Redesign

This is the most interaction-heavy widget on the dashboard (the only one with inline approval actions) and the 3-level expandable table is hard to scan at scale. Modern leave management tools have moved well beyond this pattern.

### Option A — Calendar view (recommended for visibility)
Display time-off requests on a monthly calendar grid. Each employee's approved/pending days appear as colour-coded blocks (pending = amber, approved = green). Supervisors can see at a glance which dates are heavily requested and which employees have multiple requests in the same period. Clicking a block opens the approval action. This is the pattern used by most modern HR tools (BambooHR, Rippling, Personio).

### Option B — Kanban-style approval board
Two columns: **Pending Approval** and **Approved**. Each request is a card showing employee name, dates, type, and duration. Supervisors drag a card from Pending to Approved, or click to reject. This makes the action model (approve / reject) the primary interaction rather than navigating through a three-level list.

### Option C — Keep the table, improve the header summary
If a full redesign is not in scope, a lower-effort improvement: add a summary bar at the top of the widget showing **X pending requests** / **X approved** / **X employees affected** for the current filter. This gives supervisors immediate context before they drill into the list. Add colour-coded status pills (replacing text) for faster scanning.

**Recommended:** Option A gives the most meaningful improvement. Option C is the minimal viable improvement if Option A is out of scope.

**References:**
- [HR Management Dashboard — TeamHub Figma](https://www.figma.com/community/file/1552262349953288359/teamhub-hr-team-management-admin-dashboard-ui-design)
- [HR Payroll Management Dashboard — Behance](https://www.behance.net/gallery/221873503/HR-Payroll-Management-Dashboard-UI-Design)
- [Free Payroll Dashboard — Figma Community](https://www.figma.com/community/file/1356263393257478402/free-payroll-dashboard)

---

## 10. Loans With Balance Due
> See: [10 - Loans With Balance Due.md](../Dashboard Research/10%20-%20Loans%20With%20Balance%20Due.md)

**Status:** Ready to re-design — Improve

Two clear problems to fix before any visual work.

### Fix 1 — Correct the aging labels (critical, low effort)
The bucket labelled "Over 60" actually means 90+ days overdue. This is factually misleading. Fix the labels to accurately describe the ranges: **Current (0–29)**, **30–59 days**, **60–89 days**, **90+ days**. This is a text change but matters for users making collection decisions.

### Fix 2 — Apply the filter to both table and chart
Same problem as Deposit Accounts. The loan type filter should affect the pie chart as well as the table.

### Option A — Bar chart instead of pie for aging
A horizontal bar chart (one bar per aging bucket, ordered from current to most overdue) is easier to compare than pie segments when the distribution is uneven. The bar length makes it immediately obvious how much of the book is in each bucket.

---

## 11. Fixed Asset Values
> See: [11 - Fixed Asset Values.md](../Dashboard Research/11%20-%20Fixed%20Asset%20Values.md)

**Status:** Needs significant review — Redesign

Three cascaded dropdowns is the most complex filter setup on the dashboard. The interaction model is technically functional but the cognitive load is high.

### Option A — Replace pie chart with treemap
A treemap is a much better visualisation for asset group breakdowns — the relative size of each group is immediately visible without needing to compare pie slice angles. Groups are labelled with name and value. Clicking a group filters the table to that group. This pattern is used in most modern fixed asset management dashboards.

### Option B — Add headline KPI cards
Add three summary cards above the charts: **Total Cost**, **Net Book Value**, and **Total Accumulated Depreciation**. These are the three numbers any asset manager wants to see first. Currently the user must manually sum the table to find them.

### Option C — Simplify the filter panel
The three cascaded dropdowns could be presented as a single filter panel (slide-out or collapsible) with clear labels. The current stacked dropdown approach is not obvious to a new user. Labelling the dependency clearly ("First choose how to group, then pick a group, then pick what to measure") reduces confusion.

**Recommended:** Option B is low effort and high value. Option A is the most impactful visual improvement.

**References:**
- [Fixed Assets Dashboard — GlobalData365 Power BI](https://globaldata365.com/fixed-assets-dashboard/)
- [Fixed Asset Management Software overview — BlueTally](https://bluetally.com/blog/best-fixed-asset-management-software)

---

## 12. None (Empty Slot)
> See: [12 - None.md](../Dashboard Research/12%20-%20None.md)

**Recommendation: Remove this option from the new dashboard.**

A blank widget slot provides no value to the user. In a redesigned dashboard, empty slots should either be hidden automatically (the layout adjusts) or show an **Add Widget** prompt. The "None" option exists because the current system requires all widget positions to be filled — a constraint the redesign should not carry forward.

---

## 13. Purchasing Management
> See: [13 - Purchasing Management.md](../Dashboard Research/13%20-%20Purchasing%20Management.md)

**Status:** Needs significant review — Redesign

The current design shows a table and an encumbrance chart. The table is useful; the encumbrance chart is useful; but the approval workflow is buried in the filter dropdown and the relationship between the two panels is not obvious.

### Option A — Approval pipeline summary cards
Add a row of summary cards above the table: **Awaiting My Approval**, **Submitted by Me**, **All Pending**, **Approved**. Each card shows the count for that status. Clicking a card filters the table — replacing the current status dropdown. This mirrors the pattern used by modern procurement tools (Uizard PO templates, Appsmith order dashboards) where the status breakdown is the primary navigation, not a secondary filter.

### Option B — Separate encumbrance chart from the approval table
The encumbrance chart (committed budget by period) serves a different audience than the approval queue (what needs signing off). Consider making these two separate widgets — one for approvers, one for budget managers. Combined, they serve neither role optimally.

### Option C — Flag urgent items visually
Highlight rows where the order has been waiting for approval for more than X days. A simple colour or icon indicator tells the approver which items are most overdue without them having to check dates manually.

**References:**
- [Purchase Order Management App — Uizard template](https://uizard.io/templates/web-app-templates/purchase-order-management-system-web-app/)
- [Customer Order Dashboard — Appsmith](https://www.appsmith.com/use-case/customer-order-dashboard)

---

## 14. Main Content Tasks
> See: [14 - Main Content Tasks.md](../Dashboard Research/14%20-%20Main%20Content%20Tasks.md)

**Status:** Needs light review — Improve

The icon tile grid is a standard and well-understood navigation pattern. The main limitation is that it is entirely system-controlled with no user customisation.

### Option A — Allow users to pin their own shortcuts
Let users choose which tasks appear in their tile grid (from a library of permitted tasks), similar to how Xero lets users add/remove widgets from their homepage. System defaults can still be set by an administrator as a starting point.

### Option B — Add brief description text to each tile
The current tiles show icon + label only. Adding a one-line description under the label (e.g. "Add a new payroll run") reduces the need for users to guess what each tile does. More useful for less-experienced users.

---

## 15. Bank Balances
> See: [15 - Bank Balances.md](../Dashboard Research/15%20-%20Bank%20Balances.md)

**Status:** Ready to re-design — Redesign

The dropdown that switches the entire widget layout is the core UX problem here. It is not obvious to users that selecting one account completely changes the view. Xero solves this problem well.

### Option A — Individual account cards (recommended)
Show each bank account as its own card tile, displaying: account name, current balance, and a reconciliation status indicator (e.g. "3 unreconciled items"). Clicking a card expands it to show the activity breakdown (the 7-row table currently shown in single-account view). This is exactly the pattern Xero uses for bank accounts on their dashboard — each account is its own discrete widget, not a mode of a single widget.

### Option B — Tabbed layout instead of dropdown switching
Keep the single widget but replace the dropdown with tabs — one tab for "All Accounts" and one per individual account. Tabs make it clear to the user that switching changes the entire view, rather than a dropdown which implies a filter.

### Option C — Add reconciliation status indicator
Regardless of layout choice, add a clear indicator showing how many unreconciled items exist per account. Currently the user has no way to know this at a glance — they have to switch into each account to find out.

**References:**
- [Xero Dashboard bank account widgets — Xero Central](https://central.xero.com/s/article/Your-Xero-dashboard)
- [Xero Dashboard deep dive — Alpha Partners](https://www.alphapartners.co/blog/xero-dashboard-deep-dive-2025-widgets-shortcuts-customisation)

---

## 16. Accounts Payable By Due Date
> See: [16 - Accounts Payable By Due Date.md](../Dashboard Research/16%20-%20Accounts%20Payable%20By%20Due%20Date.md)

**Status:** Ready to re-design — Improve

Same filter-applies-to-table-only pattern as widgets 7 and 10. Two specific fixes needed before any visual work.

### Fix 1 — Pie chart labels should show dates, not amounts
The current pie labels show the amount owed per due date. Users see numbers but cannot tell which date each segment represents without hovering. The label should show the due date (e.g. "15 Jul") with the amount visible on hover.

### Fix 2 — Apply filter to both chart and table
The due date filter should update the pie chart to highlight the selected date segment — same principle as the fix needed in widgets 7 and 10.

### Option A — Timeline / grouped view
Group outstanding invoices into: **Overdue**, **Due This Week**, **Due This Month**, **Due Later**. Each group is a collapsible section in the table and a segment in the chart. This is the pattern QuickBooks Online uses for Bills to Pay — far more actionable than grouping by exact due date, which can produce dozens of dropdown options.

### Option B — Heat map by vendor
Show a table of vendors with a heat map column showing total AP balance. Vendors with the largest outstanding balance are most visible. Useful for cash flow planning.

**References:**
- [QuickBooks Online AP Dashboard — Coefficient](https://coefficient.io/dashboard-examples/qbo-accounts-payable-dashboard)
- [Looker Studio AP Dashboard for QuickBooks — Coupler.io](https://www.coupler.io/marketing-dashboards/looker-studio-quickbooks-accounts-payable-dashboard)

---

## 17. Gifts Pledges
> See: [17 - Gifts Pledges.md](../Dashboard Research/17%20-%20Gifts%20Pledges.md)

**Status:** Needs light review — Keep / Refresh

This widget is straightforward. Two small improvements worth noting.

### Option A — Progress bars in the Received column
Replace the raw "Received" and "Percent Due" text with an inline progress bar per pledge purpose. Green for on track or ahead, amber for slightly behind, red for significantly behind. The supervisor can scan the whole table in seconds.

### Option B — Headline total card
Add a single KPI card at the top: **Total Pledged vs Total Received** with an overall percentage. Answers the single most-asked question without reading the full table.

### Note on consistency with Remittance Pledges
The date filter behaviour differs between this widget (date persists on refresh) and Remittance Pledges (date resets on refresh). These two widgets are conceptually very similar — their date handling should be made consistent in the redesign. Confirm with the team which behaviour is correct and apply it to both.

---

## Summary — Quick Reference

| # | Widget | Effort | Primary Recommendation |
|---|--------|--------|----------------------|
| 1 | Budget Compared to Actual | Low | Add variance bar + KPI header cards |
| 2 | Pension Plans | Low | Stacked bar by district or donut with total |
| 3 | Payroll Distributions | Low | Donut chart with total in centre |
| 4 | Remittance Pledges | Low | Fix default date; add on-track indicator |
| 5 | Receivable Invoices Outstanding | Medium | Horizontal stacked aging bar + DSO KPI card |
| 6 | Insurance Billing Plans | Low | Donut with total enrollment in centre |
| 7 | Deposit Accounts | Medium | Fix filter to affect both table and chart |
| 8 | My Status | High | KPI card grid replacing the flat table |
| 9 | Payroll Scheduled Time Off | High | Calendar view or Kanban approval board |
| 10 | Loans With Balance Due | Low | Fix misleading aging labels; fix filter split |
| 11 | Fixed Asset Values | Medium | Add KPI header cards; treemap instead of pie |
| 12 | None (Empty Slot) | — | Remove from new dashboard |
| 13 | Purchasing Management | Medium | Status summary cards replacing status dropdown |
| 14 | Main Content Tasks | Low | Allow user-configurable shortcuts |
| 15 | Bank Balances | Medium | Individual account cards (Xero pattern) |
| 16 | Accounts Payable By Due Date | Medium | Fix pie labels; group by Overdue/This Week/Later |
| 17 | Gifts Pledges | Low | Progress bars + headline total card |

---

*Prepared as input for Step 3 (Design) of the dashboard re-platform lifecycle.*
