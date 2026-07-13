# W02 — Pension Plans

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W02-Pension-Plans.md](../Mock_work/Widget_Specs/W02-Pension-Plans.md)
**Data source & formulas:** [Dashboard_Research/02 - Pension Plans.md](../Dashboard_Research/02%20-%20Pension%20Plans.md)

## Purpose
Gives a clear overview of how much is being contributed annually across each pension plan type, with the ability to filter by church district, and lets users drill into individual appointees per plan.

## How Other Companies Fulfil This Purpose
No named competitor product specifically benchmarks pension-contribution-by-district reporting — this is a narrower, org-specific slice than most commercial benefits dashboards cover. The closest applicable standard comes from general benefits/pension analytics (U.S. Department of Labor pension bulletins) and standard benefits-dashboard practice:

- **Donut/pie for proportional split** is standard when the question narrows to a single dimension (plan type only, ignoring district) — this is now the default view, matching the original legacy widget.
- **Grouped/stacked bar charts** are the standard way to compare a benefit metric across more than one dimension at once (here: district × plan type) ([U.S. DOL](https://www.dol.gov/agencies/odg/visualization-gallery/ebsa-private-pension-plans)) — kept as the Switch Chart Type alternate for when the question is "who costs what" across both dimensions.
- A **summary table** is the universal reporting companion across every benefits-dashboard source reviewed.

**Net assessment:** this widget's design is reasonable and standard for the general pattern, even though no direct named competitor covers this specific district/plan-type combination — there's no evidence a materially better structure exists elsewhere to benchmark against.

**Changed on direct instruction (2026-07-09):** the default view was originally set to Grouped Bar by District (see "Net assessment" language above, superseded). Reversed back to Pie by Plan Type as the default — matching the original legacy widget — with Grouped Bar moved to the Switch Chart Type alternate. See Views and Size behaviour below for the current locked shape.

## Filters
| Filter | Values |
|--------|--------|
| Church District | All Districts · dynamic list |
| Plan Type | All Plans · dynamic list — plan-type names are user-configurable elsewhere in the system, the same pattern used for account types and leave types on other widgets in this project. The specific values (Defined Benefit, 403(b), etc.) are illustrative, not fixed. **Confirmed correct as designed.** |

**Fiscal Year filter — removed.** The underlying data is an "active as of today" snapshot, not year-scoped — adding Fiscal Year would need new date-scoping logic the old design never had, and there's no confirmed need for it. No Period View filter either — contributions are annual figures with no sub-year breakdown in the source data. KPI size shows no time filter (neither Fiscal Year nor Period View apply here).

## Data Table Sort
Fixed — Church District, alphabetical. Not user-changeable.

## Drill-Through
Click-to-open appointee panel is an in-widget view change, not a page link — kept as-is for detail. A genuine link to the Pension Billing source page is confirmed needed but **has no target page/URL yet** — open item.

## Refresh
Standalone icon, present at every size including KPI.

---

## Views (Switch Chart Type)

### View 1 — Pie by Plan Type *(default)*
Proportional split across plan types (Defined Benefit / Defined Contribution / 403(b)), ignoring district — matches the original legacy widget. Shown at every size, including Small.

**When a specific Plan Type is selected**, the pie's slicing dimension switches to **District** instead — since a plan-type breakdown of a single already-selected plan type would just be one 100% slice. It shows that one plan's contribution spread across Central/North/South/East/West. (Fixed 2026-07-09 — previously rendered a useless single slice.)

### View 2 — Grouped Bar by District
Bars per district, coloured by plan type — the two-dimension view, for when the question is "who costs what" across both district and plan type. Stacked at Small (space-constrained), side-by-side at Medium/Large.

**Switch Chart Type is now available at every size, including Small** — reversing the earlier "no Switch View at Small" rule that applied when Grouped Bar was the default.

### Summary Table — no longer a separate switchable view
At Large only, the Summary Table (totals per district and per plan type, fixed sort: District alphabetical) is shown together with whichever chart is active, not as a third competing Switch Chart Type option. Both the chart and the table read the same Church District/Plan Type filters, so they always agree.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Active chart (Pie by default), Switch Chart Type available |
| **Medium (2×2)** | Active chart, all districts/full data, legend; Switch Chart Type available, now including a standalone Data Table option (added 2026-07-09) — selecting it replaces the chart with the table, since Medium doesn't have room for both at once |
| **Large (4×4)** | Active chart + Summary Table shown together, full detail; Switch Chart Type available (chart-type only — Table is not a separate menu item here since it's always shown) |
| **KPI (1×0.5)** | Headline: **Total Annual Contribution ($)**. No filter (Fiscal Year removed, no other time dimension applies). No download, no switch. Card title reflects the active Church District/Plan Type filters (added 2026-07-09): "Overall Contribution" when both are at their "All ..." default, the selected district(s) alone when only District is narrowed, the selected plan type(s) alone when only Plan Type is narrowed, or "[District] by [Plan Type]" when both are. Truncates with "…" and shows the full text on hover if too long for the card. |
| **Expanded** | Active chart + table, full detail, all filters live in the modal |

---

## What Got Cut (and why)
- **"Top district by cost" and "dominant plan type + %" as KPI headlines** — both dropped in favour of a single **Total Annual Contribution** figure. These view-specific insights are still visible once a user opens Medium/Large size and picks a view; they're not right for the single-number KPI tile.

## Fine-Tuning Notes
- District filter rerenders the active view without a page reload
- **Confirmed (2026-07-09):** selecting a specific Church District (Plan Type left at All Plans) narrows the Pie to that district's plan-type breakdown — the mock data keeps a dedicated single-district bucket per district rather than one shared "all districts" bucket, so this direction was verified working, not something that needed fixing.
- **Fixed (2026-07-09):** selecting a specific Plan Type used to render a single 100%-share slice for that one plan — not useful. The pie now slices by **district** instead of plan type whenever a specific Plan Type is selected, showing that one plan's spread across Central/North/South/East/West. Grouped Bar and the Data Table were unaffected — they already broke totals down by district.
