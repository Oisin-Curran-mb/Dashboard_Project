# W04 — Remittance Pledges

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W04-Remittance-Pledges.md](../Step%203%20-%20Mock_Work/Widget_Specs/W04-Remittance-Pledges.md)
**Data source & formulas:** [Step 1 - Dashboard Research/04 - Remittance Pledges.md](../Step 1 - Dashboard Research/04%20-%20Remittance%20Pledges.md)

## Purpose
Shows how well the organisation is keeping up with its remittance pledge commitments. For each activity type, users can see what was pledged, how much has been paid, what remains outstanding, and the percentage paid so far.

## How Other Companies Fulfil This Purpose
- **"Pledge vs. Received"** is a named, standard nonprofit fundraising metric, with an established fulfillment-rate formula (Received ÷ Pledged × 100; healthy range 85–95%) ([DonorSearch](https://www.donorsearch.net/resources/nonprofit-fundraising-metrics/)) — this is exactly the metric this widget already tracks as "% Paid," and is the direct justification for making **overall % Paid the KPI headline**.
- The standard visuals for this metric are progress bars, paired bars, or a pie/table — all three of which this widget's original options already were.

**Note:** no dedicated competitor product for denominational apportionment/remittance tracking specifically exists in the market researched — this is a niche church-finance concept, so the benchmark used here is the general nonprofit pledge-tracking pattern rather than a named direct competitor. This widget is already about as well-aligned with that general pattern as it can be.

## Filters
| Filter | Values |
|--------|--------|
| Date Range | Current Month · Last Month · Custom (Beginning/Ending fields) |
| Activity Type | All Activity Types · dynamic list |

**Fiscal Year filter — removed.** Same finding as W02 and W10: no fiscal-year dimension exists anywhere in the old design's data for this widget — kept as a filter option in the earlier draft without real backing, now dropped.

**Two open items, unresolved — needed before build:**
1. Is "Current Month" a rolling 30-day window or the calendar month in progress? Same question for "Last Month."
2. Does "% Paid"/"YTD Expected" always compute against the full fiscal year, or does selecting "Current Month" re-baseline the expectation to that month's pro-rated share? This affects the math behind every percentage shown.

Date Range persists across a page refresh. KPI size shows Fiscal Year only.

## Data Table Sort
Fixed — Sequence number ascending. Not user-changeable.

## Drill-Through
**New feature**, not present in the old design: a link out to the full Remittance module, filtered to the same activity type/date.

## Refresh
Standalone icon, present at every size including KPI.

---

## Views (Switch View)

### View 1 — Progress Bars *(default)*
Horizontal bar per activity type — received portion filled, outstanding empty. The single most common visualisation for this exact metric.

### View 2 — Paired Bars
Side-by-side pledged vs. received bars per activity type — makes the gap itself more visible than the filled-bar version.

### View 3 — Summary Table
Pledged · Received · Outstanding · % per activity type, totals row. Fixed sort: Sequence ascending.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Active view, 2-3 activity types, no Switch View |
| **Medium (2×2)** | Active view, 4-5 activity types; Switch View available |
| **Large (4×4)** | Active view, all activity types, full values + %; Switch View available |
| **KPI (1×0.5)** | Headline: **overall % Paid** (YTD Paid ÷ Annual, across all activity types). No filter (Fiscal Year removed). No download, no switch. |
| **Expanded** | Active view, full detail, all filters live in the modal |

---

## What Got Cut (and why)
- **"Activity type with lowest % Paid" and "Total Outstanding ($)" as KPI headlines** — both dropped in favour of a single **overall % Paid** figure, since that's the named industry benchmark metric (pledge fulfillment rate) rather than an internally invented one — ties the KPI directly to something externally comparable.

## Fine-Tuning Notes
- Activity Type filter highlights the selected activity type's bar across views
- Outstanding amounts always shown in red/amber
