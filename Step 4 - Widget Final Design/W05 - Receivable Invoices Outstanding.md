# W05 — Receivable Invoices Outstanding

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W05-Receivable-Invoices-Outstanding.md](../Step%203%20-%20Mock_Work/Widget_Specs/W05-Receivable-Invoices-Outstanding.md)
**Data source & formulas:** [Step 1 - Dashboard Research/05 - Receivable Invoices Outstanding.md](../Step 1 - Dashboard Research/05%20-%20Receivable%20Invoices%20Outstanding.md)

## Purpose
Shows how much money is currently owed to the organisation in unpaid invoices and how long those invoices have been outstanding, so staff can prioritise which outstanding amounts need attention first.

## How Other Companies Fulfil This Purpose
- AR aging dashboards commonly combine a **bar or donut chart** for the aging-bucket breakdown with a **sortable, full-detail table** — a pie chart as the *sole* view is explicitly called out as the wrong choice for aging data ([Vertaccount](https://www.vertaccount.com/blog/best-accounts-receivable-dashboard-examples-templates-for-2026/), [Coupler.io](https://www.coupler.io/dashboard-examples/accounts-receivable-dashboard)) — this directly confirms the old design's pie chart was a real defect, already fixed here.
- **KPI snapshot tiles above the aging breakdown** (Total Outstanding, Overdue, Current, Oldest Invoice) is a directly recommended combination.

**Net assessment:** the design already matches the standard closely — the main risk this widget carried (a pie chart on aging data) has already been removed.

## Filters
| Filter | Values |
|--------|--------|
| Age Band | All Ages · Current (0-30) · 31-60 · 61-90 · 91-120 · 121+ |
| Revenue Center | All Revenue Centers · Church · Insurance Billing · Pension Billing · School |
| Source | All Sources · Insurance Billing · Pension Billing |

No Fiscal Year filter — aging is an as-of-today snapshot with no fiscal-year dimension in the old design. KPI size shows no filter at all (no time dimension exists to fall back to).

## Data Table Sort
Age-band summary: fixed sort by age band ascending, matching bucket severity order. Full invoice-level table: click-to-sort on any column (Invoice #, Customer, Amount, Age, Due Date).

## Drill-Through
No separate page link for the widget as a whole — Revenue Center/Source data spans multiple originating modules, so there's no single unambiguous source page to link to. The in-page detail panel (bucket → invoice list → expandable Details/Attachments/Note/Payments tabs, Export, Close) remains this widget's primary answer to the requirement.

**Targeted exception, added this round:** the Bill-To field and the Attachments/Note/Payments tabs specifically get a **"View full invoice" link** per invoice, out to the real AR invoice record, instead of trying to reproduce that data inside the widget. Bill-To is a confirmed empty-field bug in the Modern API today, and the Attachments/Note/Payments data sources aren't yet verified — rather than wait on a bug fix or build new endpoints just to duplicate data that already displays correctly elsewhere, the widget points straight to the source for those specific pieces. The Details tab (line items) and the rest of the panel (Customer, Invoice #, Due Date, Days Past Due, Outstanding) stay in-page as before, since those are already confirmed working.

## Refresh
Standalone icon, present at every size including KPI.

---

## Views (Switch View)

### View 1 — KPI Tiles + Aging Bars *(default)*
Four headline tiles (Total Outstanding, Overdue, Current, Oldest Invoice) above the 5-bucket aging bar chart.

### View 2 — Aging Table
Invoice # · Customer · Amount · Age · Due Date, click-to-sort on any column.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 2 KPI tiles only (most critical), no Switch View |
| **Medium (2×2)** | 4 KPI tiles + small bar; Switch View available |
| **Large (4×4)** | 4 KPI tiles + full aging bars (5 buckets); Switch View available |
| **KPI (1×0.5)** | Headline: **Total Outstanding ($)**. No filter, no download, no switch. |
| **Expanded** | Active view, full detail, no filters to move into the modal (Revenue Center/Source stay in the overflow menu) |

---

## What Got Cut (and why)
- **Plain aging bar chart (no KPI tiles)** — removed before this pass; judged too similar to the KPI+Bars view, which does the same job better.
- **"Under review" KPI status** — resolved here: **Total Outstanding ($)** is now the locked KPI headline, since it's the clearest single figure and consistent with the pattern used across the rest of the dashboard.

## Fine-Tuning Notes
- Age Band filter highlights the matching bar in the Aging Bars view
- Invoices in the 121+ bucket always shown in red; 91-120 in amber
