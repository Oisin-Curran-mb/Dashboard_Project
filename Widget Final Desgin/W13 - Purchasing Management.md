# W13 — Purchasing Management

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W13-Purchasing-Management.md](../Mock_work/Widget_Specs/W13-Purchasing-Management.md)
**Data source & formulas:** [Dashboard_Research/13 - Purchasing Management.md](../Dashboard_Research/13%20-%20Purchasing%20Management.md)

## Purpose
Tracks purchase orders by status — pending approval, approved, and overdue — so finance and procurement staff can manage the PO pipeline without leaving the dashboard.

## How Other Companies Fulfil This Purpose
- Procurement/PO approval workflows are commonly visualised as **Kanban boards** with status columns (Requested → Approved → Ordered → Received), explicitly recommended for approval pipelines with SLA/overdue tracking ([Ramp](https://ramp.com/blog/streamline-procurement-processes-kanban-board), [ProcBay](https://procbay.com/blog/approval-workflow-visualization-optimizing-your-process/)).

**Net assessment:** Kanban is a near-exact match for the industry-standard approach to this problem — strong external confirmation for making it the default view here.

## Filters — decided this round
| Filter | Scope | Values |
|--------|-------|--------|
| PO Status | Global (all views) | **Awaiting my approval next · Awaiting my approval · Unapproved · Approved** — the confirmed real approval-workflow stages, replacing the earlier invented All/Pending Approval/Approved/Overdue set |
| Approval Path | Global (all views) | Dynamic, depends on Status; disabled if only one path exists — matches old design |
| Department | **Table view only** | All Departments · Finance · Admin · Ministry · Facilities · IT — kept, but scoped down: a department breakdown mainly makes sense as a table column/filter, not as a Kanban or Donut dimension |
| Year | **Table view only** | FY 2026 · FY 2025 · FY 2024 — kept specifically for looking up old purchases in the table; not offered as a global filter since it doesn't add value to the live Kanban/Donut views |
| Overdue *(flag, separate from PO Status)* | **Table view only** | Flags POs past an expected turnaround — useful as a table filter/highlight, but doesn't map to a Kanban column since it isn't one of the real approval-workflow stages |

**Still needs backend/data confirmation:** Department and Year as real fields on purchasing records, and an "Overdue" flag/date field to filter on — none are confirmed to exist yet. The decision above is about how these behave *if* they exist, not confirmation that they do.

**No Small size for this widget**, for any view.

## Data Table Sort
Proposed default: Date Issued, most recent first. **Not explicitly confirmed — flag for confirmation before build.**

## Drill-Through
**Already exists, kept as-is:** each row's edit icon navigates to the full PO record (Detail/Approvals/Attachments/Note/Payment Approval tabs) — one of only two dashboard widgets with direct action capability.

## Refresh
Standalone icon, present at every size including KPI.

---

## Views (Switch View)

### View 1 — Kanban *(default)*
Columns — Awaiting my approval next · Awaiting my approval · Unapproved · Approved — with PO cards. Pipeline view makes status progression clear and scannable. No Overdue column — that flag lives in the Table view only (see Filters above).

### View 2 — Status Donut
PO count split by the same four approval stages — a quick proportional view of the backlog.

### View 3 — PO Table
PO # · Vendor · Amount · Department · Status · Date, with Department, Year, and Overdue available as filters/highlights here specifically. Full list for detailed review, export, and historical lookup.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Medium (2×2)** | Kanban: 2 columns visible, top 2 POs each. Donut: + legend + counts. Table: 5 rows. Switch View available. |
| **Large (4×4)** | Kanban: all 4 stage columns, full cards, scrollable. Donut: + legend + total value. Table: all rows (up to 10), totals row, Department/Year/Overdue filters visible. Switch View available. |
| **KPI (1×0.5)** | Small horizontal bar (counts per approval stage) + compact status-count cards — a deliberate exception to the single-number KPI pattern, since this data is inherently multi-category. PO Status filter only, no download, no switch. |
| **Expanded** | Active view, full detail, all filters live in the modal |

*(No Small size — see note above.)*

---

## What Got Cut (and why)
- **Encumbrance chart (budget committed by accounting period)** — dropped earlier in this project; the three status-based views above are the confirmed replacement.

## Fine-Tuning Notes
- Overdue POs always highlighted in red in the Table view (the only view that surfaces this flag)
- PO Status filter hides irrelevant Kanban columns
- Department and Year filters narrow the Table view only, pending confirmation both are real fields
