# Dashboard Widget Redesign — Hard Rules

> **Document type:** Global governance — applies to every widget and every version across the whole redesign, not just Budget Compared to Actual.
> **Status:** Locked before individual version refinement begins. Any version design (this widget or any of the other 16) must comply with these rules; if a version conflicts with a rule, the rule wins and the version needs to change.
> **Investigated by:** Oisin / Claude

These are mapped against the current mockup (`Mock work/Dashboard Widget Mockups.html`) so it's clear exactly what changes.

---

## Rule 1 — KPI card chrome is reduced, not a mini version of the others

A KPI-sized card shows only: the information card itself (number, label, trend) and a 3-dot menu. Inside that 3-dot menu:

| Menu item | KPI size | Other sizes (S / M / L / Expanded) |
|---|---|---|
| Filter | **Time only** (e.g. Fiscal Year) | Full filter set for that widget (e.g. Account Type, Fiscal Year, Period View) |
| Download as Excel / CSV | **Removed** | Present |
| Switch chart/view type | **Removed** — a KPI has one view | Present where a size has more than one view |
| Widget size | **Present** | Present |
| Fullscreen | **Present** — opens the finalised Expanded/full-screen design | Present |

Currently every size's 3-dot menu is identical (Download Excel, Download CSV, Change filters, Switch chart type, Widget size) — this rule means the KPI size needs its own trimmed-down menu, not a reuse of the Small/Medium/Large one.

**Resolved default:** "filter by time" on the KPI card means **Fiscal Year** by default. This can be overridden per widget where Fiscal Year isn't the right time dimension for that widget's KPI — decided widget by widget, not forced universally.

---

## Rule 2 — Nothing scrolls except the full-screen pop-up (tables are the one exception)

- Small, Medium, Large, and KPI cards must **never** scroll internally. Content has to be capped/fit to a fixed height at that size (this already matches the existing `capN`-style period-capping pattern — e.g. Small shows 4 periods, Medium 6 — that capping logic is the *right* way to satisfy this rule, and should be applied consistently everywhere, not just where it happens to exist today).
- Only the **Expanded pop-up** is allowed to scroll if its content overflows.
- **Tables are the one exception at any size.** The table itself never causes the surrounding widget to scroll — but the rows inside the table can scroll in their own fixed-height region, with the header staying in place. This is already how the Large-size table works today (`tblScroll`: sticky header + a fixed-height, internally-scrolling body) — that exact pattern needs to be the standard for every table, at every size, not just Large.

---

## Rule 3 — Card footer text is removed; the Eye's header becomes the widget name

- The explanatory text currently shown at the bottom of every option card (the rationale sentence plus the reference link — `opt-imp` / `opt-ins` in the current build, e.g. *"Show bars + variance row..."*) is removed from the visible card.
- The Eye (👁, `visibility` icon) popover's **body text stays exactly the same** — it keeps showing the widget's purpose text, unchanged.
- The **only** change allowed to the Eye: its header currently reads the generic label "Widget Purpose" — this changes to the actual widget's name (for this widget, "Budget Compared to Actual"). No other change to the Eye is permitted.
- **Resolved:** since the Eye is locked to that one header change and nothing else, the removed footer/option-rationale text (`opt-imp`/`opt-ins`) is **not** relocated into the Eye. It is dropped from the live product entirely and exists only in design documentation (docs like this one).

---

## Rule 6 — Fixed grid sizes, universal across every widget

Every widget's size is a fixed grid footprint. This is locked for all 17 widgets, not just this one:

| Size | Grid footprint |
|---|---|
| Small | 1 × 1 |
| Medium | 2 × 2 |
| Large | 4 × 4 |
| **KPI** | Same width as Small (1 wide), **half the height** (1 × 0.5) |
| Main dashboard body/page | 4 × 8 — expands downward when content needs it, but should stay as tight as possible otherwise |
| Expanded (full-screen pop-up) | **Unchanged** — stays exactly as currently built; that size is already working well |

**Not every widget has to offer every size.** The footprints above are fixed *when a size is offered*, but a widget can skip a size that genuinely doesn't fit its content — confirmed examples so far:
- **W09 Payroll Scheduled Time Off** — no Small size; its approval workflow (3-level expand) and calendar view both need more room than a 1×1 tile can give.
- **W13 Purchasing Management** — no Small size, for any of its three options (Kanban/Donut/Table); a Kanban with 3 columns, a donut with legend, and a PO table all need more room than 1×1 gives.

Confirm this per widget as it's reached, rather than assuming all five sizes always apply.

---

## Rule 4 — Selected view/chart option greys out; the alternative stays clickable

Where a size offers more than one chart or table view (e.g. Version A's Bar Chart / Data Table toggle, Version B's KPI + Bars / Bars Only toggle, Version C's Waterfall / Data Table toggle), the option that's currently active should render greyed-out and non-clickable — it's already selected, so it can't be clicked again. The other option(s) in that same toggle stay clickable so the user can switch. Today both options in these toggles are always fully clickable regardless of which is active.

---

## Rule 5 — Every filter, size, and view change is scoped to one widget/version — never global

Changing a filter, switching a widget's size, or changing its chart/table view must only ever affect that one widget instance. It must never cascade to any other widget on the dashboard. This needs to hold at the state-management level (each widget instance owns its own filter/size/view state, never shared or global) — not just visually.

---

## Rule 7 — Refresh is a standalone icon, present at every size including KPI

Refresh is **not** a 3-dot menu item — it's its own always-visible icon on the widget card, separate from the overflow menu described in Rule 1. Unlike Download and Switch (which are removed at KPI size), Refresh is present at every size: Small, Medium, Large, KPI, and Expanded. This matches the old design, where Refresh was already a standalone control on every widget, and it carries forward unchanged.

---

## Items intentionally decided per-widget, not as a global rule

These three points from the original 9-point requirements list are **deliberately not** standardized here — each is resolved individually as its widget comes up in the spec pass, and the reasoning should be recorded in that widget's own Version Concepts / Widget Spec doc:

- **Data Table sort behaviour** — no single universal default, but domain-level patterns have emerged:
  - **Finance widgets** whose tables are organised around account numbers/periods (e.g. W01 Budget Compared to Actual, W02 Pension Plans) default to a **fixed alphabetical/chronological sort, not user-changeable** — Period ascending for period-based tables, District/name alphabetical for grouping-based tables.
  - **Payroll/HR widgets** (e.g. W03 Payroll Distributions) default to **fixed alphabetical (by department, then by category within a department)**, but with a **user-facing toggle to switch to Amount-descending** — i.e. not fully fixed like Finance, and not fully open column-sort either. Confirm this pattern holds as more Payroll/HR widgets are reached; don't assume it's identical to W03 without checking.
- **Weekly period view** — Monthly/Quarterly are the confirmed baseline everywhere. A Weekly option is only added at Large/Expanded, and only where a widget's underlying source data genuinely supports a weekly grain (e.g. transaction-level widgets) — evaluated as an edge case widget by widget, not assumed absent or present by default.
- **Drill-through to source data** — no universal "every widget gets a link" or "no widget gets a link" rule. Several widgets already have a natural target in the old design (e.g. AR/AP invoice detail, PO edit screen, My Status queries) — carry those forward; evaluate new ones case by case for the rest.

---

## Summary Table

| Rule | One-line summary |
|---|---|
| 1 | KPI menu = Time filter + Widget size + Fullscreen only. No downloads, no view switch. |
| 2 | No size scrolls except the Expanded pop-up; tables scroll internally (rows only, header fixed) at every size. |
| 3 | Remove card footer rationale text; Eye body stays the same; Eye header becomes the widget's name. |
| 4 | Active view/chart toggle option is greyed out and disabled; the alternative stays clickable. |
| 5 | All filter/size/view state is per-widget-instance — never global or shared. |
| 6 | Fixed grid: Small 1×1, Medium 2×2, Large 4×4, KPI 1×0.5, Page 4×8 (grows down only), Expanded unchanged. |
| 7 | Refresh is a standalone icon (not a menu item), present at every size including KPI. |
