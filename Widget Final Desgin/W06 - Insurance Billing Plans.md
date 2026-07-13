# W06 — Insurance Billing Plans

**Module:** HR
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W06-Insurance-Billing-Plans.md](../Mock_work/Widget_Specs/W06-Insurance-Billing-Plans.md)
**Data source & formulas:** [Dashboard_Research/06 - Insurance Billing Plans.md](../Dashboard_Research/06%20-%20Insurance%20Billing%20Plans.md)

## Purpose
Shows how many people are enrolled in each insurance plan, with the option to filter by insurance type, giving staff a quick overview of insurance plan uptake across the organisation.

## How Other Companies Fulfil This Purpose
- Benefits dashboards typically use **bar charts** to compare plan enrollment across categories, with **donut** for proportional split, drawn from ADP/Gusto-style benefits platforms ([Milliman](https://www.milliman.com/en/insight/how-enrollment-insights-can-drive-eb-plan-design), [Gusto](https://support.gusto.com/article/112462198100000/Gusto-benefits-dashboard)).

**Net assessment:** this is a single-dimension dataset (enrollment count per plan), so both standard visualisations apply cleanly with no missing dimension — the design matches what's typically shipped in commercial benefits platforms.

## Filters
| Filter | Values |
|--------|--------|
| Plan Type | All Plans · dynamic list |

**Status filter dropped** — the real data only supports Plan and Enrolled count; there's no active/inactive field today. KPI size shows Plan Type only (or no filter, if judged too heavy for KPI chrome).

## Data Table Sort
Fixed alphabetical by Plan name, with a user toggle to switch to Enrolled-count descending — the Payroll/HR domain default.

## Drill-Through
None — matches the old design, and avoids surfacing individual employee/dependent names at the dashboard level.

## Refresh
Standalone icon, present at every size including KPI.

---

## Views (Switch View)

### View 1 — Horizontal Bar by Plan *(default)*
One bar per plan, showing enrolment count. Scales cleanly regardless of how many plans an organisation has configured.

### View 2 — Donut by Plan
Proportional enrolment split — best when an organisation has a small, stable number of plans.

### View 3 — Summary Table
Plan · Enrolled · % of Total. Sort per Data Table Sort above.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Active view, top 3 plans, no Switch View |
| **Medium (2×2)** | Active view, top 5 plans; Switch View available |
| **Large (4×4)** | Active view, all plans + total enrolment count; Switch View available |
| **KPI (1×0.5)** | Headline: **Total Enrollment** (count, across all plans). No download, no switch. |
| **Expanded** | Active view, full detail, all filters live in the modal |

---

## What Got Cut (and why)
- **"Plan with highest enrollment" and "dominant plan + % of total" as KPI headlines** — both dropped in favour of a single **Total Enrollment** figure, for consistency with the rest of the dashboard's KPI pattern; the view-specific insights remain visible at Medium/Large size.
- **Active/Inactive status column** — already dropped before this pass; not backed by real data today.

## Fine-Tuning Notes
- If a specific plan named "COBRA" exists in an organisation's data, it should be visually distinct (e.g. amber) — plan names are org-defined, not a fixed rule about a specific plan
