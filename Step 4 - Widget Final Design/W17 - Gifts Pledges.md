# W17 — Gifts & Pledges

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W17-Gifts-Pledges.md](../Step%203%20-%20Mock_Work/Widget_Specs/W17-Gifts-Pledges.md)
**Data source & formulas:** [Step 1 - Dashboard Research/17 - Gifts Pledges.md](../Step 1 - Dashboard Research/17%20-%20Gifts%20Pledges.md)

## Purpose
Tracks gift and pledge campaigns — showing how much has been given, how much is still outstanding, and overall campaign progress — helping leadership and fundraising staff monitor giving health across active campaigns.

## How Other Companies Fulfil This Purpose
- Same named metric as W04: **"Pledge vs. Received"** with an established fulfillment-rate formula, typically shown as progress bars, paired bars, or a pie/table ([Fanruan](https://www.fanruan.com/en/blog/fundraising-dashboard), [DonorSearch](https://www.donorsearch.net/resources/dashboards-chart-progress-measure-performance-on-one-screen/)) — this is the direct justification for the KPI headline and the three views below.
- Nonprofit fundraising dashboards commonly track a **campaign goal** explicitly, distinct from the pledge total. The old design here has no such separate field — that's a real, named gap against standard practice, not a chart-type issue. It's noted as an open opportunity (see Widget_Specs history for detail) rather than built into this lock, since it isn't backed by real data today.

**Net assessment:** the chart/view choices already match standard practice well. The more valuable finding from competitor research isn't about visualisation — it's that a Goal field is standard elsewhere and missing here; flagged as a future data question, not resolved in this design.

## Filters
| Filter | Values |
|--------|--------|
| Campaign (Pledge Purpose) | All Campaigns · dynamic list |
| Date Range | Current Month · Year to Date · Campaign Total |

No Fiscal Year filter — old design has no fiscal-year dimension for this widget. **Open item, needs product/dev decision before build:** how Pledge Due and % Due are computed for Current Month/Year to Date vs. Campaign Total — see Widget_Specs history for the full math question. KPI size shows Date Range only.

## Data Table Sort
Fixed — Campaign (Pledge Purpose) name, alphabetical. Not user-changeable.

## Drill-Through
None — matches old design. Flag if a link to the Donors and Gifts module is wanted later.

## Refresh
Standalone icon, present at every size including KPI.

---

## Views (Switch View)

### View 1 — Campaign Progress Bars *(default)*
Horizontal progress bar per campaign — gifts received vs. Pledge Total. The single most common visualisation for this metric.

### View 2 — Donut by Campaign
Proportion of total giving per campaign — useful for showing which campaign is driving the most giving.

### View 3 — Summary Table
Campaign · Pledge Total · Received · Due Remaining · % Due, totals row.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Active view, 2-3 campaigns, no Switch View |
| **Medium (2×2)** | Active view, 4-5 campaigns; Switch View available |
| **Large (4×4)** | Active view, all campaigns, full values + %; Switch View available |
| **KPI (1×0.5)** | Headline: **overall % Due** (Received ÷ Due, across all campaigns). No download, no switch. |
| **Expanded** | Active view, full detail, all filters live in the modal |

---

## What Got Cut (and why)
- **"Campaign furthest behind pace" and "Total Giving Received" as KPI headlines** — both dropped in favour of a single **overall % Due**, since that's the named industry benchmark (pledge fulfillment rate) rather than an internally invented figure — mirrors the same decision made for W04.
- **Goal/Spent tracking** — not built into this design; the old data has no separate Goal field distinct from Pledge Total, so this stays out of the locked design until that's resolved as a data question (see Widget_Specs history).

## Fine-Tuning Notes
- Campaigns exceeding their Pledge Total shown in green with a "✓ Goal Met" badge
- Due Remaining amounts in amber/red (can be negative if ahead of schedule)
- Campaign filter highlights the selected campaign across all views
