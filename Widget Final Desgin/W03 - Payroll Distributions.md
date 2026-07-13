# W03 — Payroll Distributions

**Module:** Payroll
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W03-Payroll-Distributions.md](../Mock_work/Widget_Specs/W03-Payroll-Distributions.md)
**Data source & formulas:** [Dashboard_Research/03 - Payroll Distributions.md](../Dashboard_Research/03%20-%20Payroll%20Distributions.md)

## Purpose
Shows a breakdown of payroll amounts by compensation type across a chosen date range, helping users understand how total payroll spend is distributed across categories such as salary, benefits, and allowances.

## How Other Companies Fulfil This Purpose
- **Pie/donut breakdowns work only up to ~4-5 categories**; beyond that, bar charts are the recommended switch, since comparing bar length is easier than comparing pie slices ([The Bricks](https://www.thebricks.com/resources/guide-how-to-make-a-budget-pie-chart-in-excel)) — this is why **both a Bar and a Donut view are kept as peers** rather than picking one: the right default depends on how many compensation categories a given organisation actually has.
- Payroll dashboards specifically are recommended to pair a category breakdown with a **trend/comparison view over time**, not just a static snapshot ([Acciyo](https://www.acciyo.com/payroll-dashboard-examples-key-metrics-and-visuals/)) — this is the direct justification for keeping the **Period Comparison view** as a full peer, not a lesser third option.

**Net assessment:** the three-view structure (snapshot bar, snapshot donut, trend comparison) covers everything the sources recommend for this exact use case.

## Filters
| Filter | Values |
|--------|--------|
| Pay Period | Last 7 Days · Last 30 Days · Custom (reveals Beginning/Ending date fields) |
| Department | All Departments · Finance · Admin · Ministry · Facilities |

Both rolling presets are calculated from today's date. **Department field needs backend confirmation** — the underlying `PRHistory`/`PRHistoryCompensation` tables don't show an obvious department field in the research; open item, not a design gap. KPI size shows Pay Period only.

## Data Table Sort
Fixed alphabetical by Department (all-departments view) or Category (single-department view), with a user toggle to switch to Amount descending — the Payroll/HR domain default.

## Drill-Through
**New feature**, not present in the old design: a link out to the full Payroll History module, filtered to the same date range.

## Refresh
Standalone icon, present at every size including KPI.

---

## Views (Switch View)

### View 1 — Horizontal Bars *(default)*
One bar per compensation category. Scales cleanly regardless of category count.

### View 2 — Donut
Same data as a proportional donut — cleaner than bars when an organisation has few categories.

### View 3 — Period Comparison
Side-by-side bars, current vs. prior period per category, with % change indicators. The trend view — answers "is this drifting?" rather than "what does today look like?"

### View 4 — Data Table
Sort per Data Table Sort above.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Active view, top 3 categories only, no Switch View |
| **Medium (2×2)** | Active view, top 5 categories; Switch View available |
| **Large (4×4)** | Active view, all categories + totals; Switch View available |
| **KPI (1×0.5)** | Headline: **Total Payroll Amount** for the selected period. Pay Period filter only. No download, no switch. |
| **Expanded** | Active view, full detail, all filters live in the modal |

---

## What Got Cut (and why)
- **"Top category by amount" and "category with biggest % change" as KPI headlines** — both dropped in favour of a single **Total Payroll Amount** figure, for consistency with the rest of the dashboard's KPI pattern. Both original options also carried a "may need additional interaction beyond a static number, TBD" flag — a sign they weren't fully ready for a locked KPI tile anyway.

## Fine-Tuning Notes
- Department filter narrows all views to that department's payroll only
- Period Comparison view shows delta % next to each bar pair at Large size
