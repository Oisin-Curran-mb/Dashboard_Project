# W16 — Accounts Payable by Due Date

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W16-Accounts-Payable-By-Due-Date.md](../Step%203%20-%20Mock_Work/Widget_Specs/W16-Accounts-Payable-By-Due-Date.md)
**Data source & formulas:** [Step 1 - Dashboard Research/16 - Accounts Payable By Due Date.md](../Step 1 - Dashboard Research/16%20-%20Accounts%20Payable%20By%20Due%20Date.md)

## Purpose
Shows outstanding payables grouped by due date so finance staff can prioritise which vendors to pay and when, helping prevent late payments and manage cash outflow timing.

## How Other Companies Fulfil This Purpose
- AP aging is standard practice with **30-day-increment buckets** (Current/1-30/31-60/61-90/91+) and stacked-bar or column-by-age visualisations, plus a **by-vendor or by-account pie** as a secondary cut ([NetSuite](https://www.netsuite.com/portal/resource/articles/accounting/accounts-payable-AP-dashboard.shtml), [Coefficient](https://coefficient.io/dashboard-examples/accounts-payable-ap-aging-report)).
- Clicking an aging bucket to reorder/filter a detail table is a standard interaction.

**Net assessment:** the urgency-bucket cards, donut, and table below match the standard directly. One improvement idea surfaced by the research — reorienting the donut to a by-vendor cut instead of by-date — was considered but not adopted here, since it would add a new dimension beyond what any of the original concepts modelled; flagged below as a future idea rather than folded in now.

## Filters
| Filter | Values |
|--------|--------|
| Due Date | All · Overdue Now · Due This Week · Due This Month |
| Vendor | All Vendors · dynamic list |

Filtering narrows the **table only**; the donut always shows **all** due dates regardless of the filter (matches old design). Pie/donut labels show the due date, with amount as a secondary/tooltip detail. KPI size shows Due Date only.

## Data Table Sort
Fixed — Due Date ascending, then Vendor alphabetical within the same date. Not user-changeable.

## Drill-Through
**Leaning yes, pending expert/dev confirmation:** a link out to the full Accounts Payable module (filtered to the same due date/vendor) would be a meaningful improvement over view-only behaviour. Raise with experts/dev before building.

## Refresh
Standalone icon, present at every size including KPI. Preserves the current Due Date selection.

---

## Views (Switch View)

### View 1 — Due Date Cards *(default)*
Cards grouped by urgency — Overdue · Due This Week · Due This Month. Immediately actionable.

### View 2 — Aging Donut
Donut showing AP balance split by due-date band. Proportion of overdue vs. upcoming payables visible at a glance.

### View 3 — AP Table
Vendor · Invoice # · Amount · Due Date · Status. Complete list for payment processing.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Active view, 3 cards/rows, no Switch View |
| **Medium (2×2)** | Active view, 5 cards/rows + total AP; Switch View available |
| **Large (4×4)** | Active view, all invoices + totals row; Switch View available |
| **KPI (1×0.5)** | Headline: **Total AP Outstanding ($)**, across all due dates. No download, no switch. |
| **Expanded** | Active view, full detail, all filters live in the modal |

---

## What Got Cut (and why)
- **Donut reoriented to a by-vendor cut** — considered per the competitor research, but not adopted in this lock; it would introduce a new grouping dimension beyond what any original concept modelled. Worth raising as a future enhancement, not built into this version.

## Fine-Tuning Notes
- Overdue items always red regardless of filter selection
- Due Date filter filters all views independently
- Total AP Outstanding shown as the KPI headline and as a header figure on all views at Large size
