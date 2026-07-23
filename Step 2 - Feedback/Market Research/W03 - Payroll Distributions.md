# Market Research: Payroll Distributions

> Step 2 — Feedback / Market Research. Captures how other companies present this kind of information — visuals, layout, framing — so a widget's design options can be checked against real precedent (or an honest "no direct precedent found") before Step 3 locks in Options A/B/C.

**Widget:** W03 — Payroll Distributions
**Module:** Payroll
**Researched:** 2026-07-22
**Status:** ✅ Researched — via the `widget-market-research` skill (parallel-agent research pass, manual cross-check in place of automated verification)

## What This Widget Shows Today

Per `Step 1 - Dashboard Research/03 - Payroll Distributions.md`: a table + pie chart ("By Distributions") breaking down total payroll amount by compensation type (salary, hourly, benefits, allowances) over a user-selected date range, queried fresh every load with no caching, no drill-down. **Note:** already Step 4 — locked (`Step 4 - Widget Final Design/W03 - Payroll Distributions.md`) — keeps three peer views (Horizontal Bars, Donut, Period Comparison) rather than picking one default, since the right chart depends on how many compensation categories a given org has.

## Data Used

`PRHistory`, `PRHistoryCompensation` (per Step 1) — confirmed no caching, fresh query every load. Per `Step 3 - Mock_Work/Data and Build Readiness - Developer Punch List.md`'s `## W03` section: Pay Period ✅ available; Recurring flag 🟡 UI only, no backend scheduling logic yet; Department filter 🔴 missing/unconfirmed (no department field confirmed on the payroll tables); Bars/Donut/Table/Pie views ✅ available; Period Comparison 🟡 needs new query (no new data, just a doubled aggregation + delta calc); KPI Total Payroll Amount ✅ available; drill-through to Payroll History 🔴 missing; pay-type breakdown when drilled into a department 🔴 missing/unconfirmed (likely needs a different field/table not yet identified).

## Competitor / Industry Findings

**Already on file, carried forward from Step 3/4 rather than re-derived:**
- Pie/donut breakdowns work only up to about 4–5 categories, beyond which bar charts are preferred. *Source: [The Bricks](https://www.thebricks.com/resources/guide-how-to-make-a-budget-pie-chart-in-excel).*
- Payroll dashboards specifically should pair a category breakdown with a trend/comparison view over time, not just a static snapshot. *Source: [Acciyo](https://www.acciyo.com/payroll-dashboard-examples-key-metrics-and-visuals/).*

**New this pass — an honest gap, not a missed search:**
- **Confirmed gap (multiple sources checked, all absent)** — no nonprofit/church-specific payroll tool researched documents a chart (pie, donut, or bar) for compensation-type breakdown. Gusto's ~20 standard reports (payroll journal, benefits deductions, custom "break down by" reports) are entirely table/export-based, with zero chart language. *Sources: [Gusto support — reports](https://support.gusto.com/article/101334493100000); [Gusto — Insights & Reporting](https://gusto.com/product/hr/insights-reporting).* Church-vertical tools (IconCMO, PowerChurch) describe only standard financial statements, no chart/graph language at all. *Source: [IconCMO — Church Payroll](https://www.iconsystemsinc.com/church-payroll).*
- **Confirmed gap** — no platform researched (Gusto, ADP, Paychex, Rippling, QuickBooks Payroll — 5 platforms) documents a named "period vs. prior period" payroll-cost comparison feature. Rippling's generic rolling-period report filters are the closest analog, but that's a general custom-report capability, not a payroll-specific comparison view. *Sources: [Rippling — HR Metrics & Reporting](https://www.rippling.com/hr-metrics-reporting); [Rippling blog — Custom Reports](https://www.rippling.com/blog/unify-and-level-up-your-workforce-analytics-with-ripplings-new-custom-reports) (2025-03-12); [Paychex — HR Analytics](https://www.paychex.com/human-resources/hr-analytics); QuickBooks Payroll Summary reports (Intuit help center).*
- **Single vendor, generic capability** — Rippling offers donut and bar chart icons as a way to turn *any* report into a visualization, including a "Workforce Costs" category, but this is a general capability, not a payroll-specific default. *Source: [Rippling — HR Metrics & Reporting](https://www.rippling.com/hr-metrics-reporting).* ADP's "Workforce Costs" themed dashboard exists as a confirmed primary-sourced feature, but the specific chart types it uses are only weakly sourced. *Source: [ADP — People Analytics powered by ADP DataCloud](https://apps.adp.com/en-US/apps/14829/people-analytics-powered-by-adp-datacloud/features).*

## Visual Options (aim for 3)

1. **Keep the Bars/Donut peer-view structure as-is** — no new conflicting signal found this pass, and nonprofit-specific tools offer no chart precedent at all to weigh against The Bricks' category-count guidance already on file. Based on: the confirmed gap findings above (absence, not contradiction). Data needed: ✅ already available and already locked.
2. **Keep the Period Comparison view, and consider flagging it to product/marketing as a genuine differentiator** — this pass specifically checked five mainstream platforms and multiple church-specific tools and found this feature nowhere else, named or unnamed. Based on: the confirmed-gap finding above. Data needed: 🟡 already flagged on the punch list as needing new query logic (doubled aggregation + delta), no new data required.
3. **Not a visual option, a data question:** the "pay-type breakdown when drilled into a department" gap remains unresolved, and no competitor precedent exists for a drill-down at that granularity either — none of the platforms researched break payroll cost down to that level. This stays a build-risk item for a developer to resolve against the schema, not something this research pass can settle.

## Net Assessment

**Supports, with a notable added finding.** Nothing in this pass conflicts with the locked three-view design — if anything, the near-total absence of comparable chart-based compensation breakdowns or period-comparison features across both nonprofit-specific (Gusto, IconCMO, PowerChurch) and mainstream (ADP, Paychex, Rippling, QuickBooks) payroll platforms suggests this widget already exceeds typical payroll-dashboard practice, echoing the same "no direct precedent, ahead of the market" pattern already documented for W05's tabbed invoice drill-down. Worth naming explicitly rather than treating the lack of a competitor match as a research dead end.

## Sources

- [The Bricks — How to Make a Budget Pie Chart in Excel](https://www.thebricks.com/resources/guide-how-to-make-a-budget-pie-chart-in-excel)
- [Acciyo — Payroll Dashboard Examples, Key Metrics and Visuals](https://www.acciyo.com/payroll-dashboard-examples-key-metrics-and-visuals/)
- [Gusto support — Reports](https://support.gusto.com/article/101334493100000)
- [Gusto — Insights & Reporting](https://gusto.com/product/hr/insights-reporting)
- [IconCMO — Church Payroll](https://www.iconsystemsinc.com/church-payroll)
- [Rippling — HR Metrics & Reporting](https://www.rippling.com/hr-metrics-reporting)
- [Rippling blog — Unify and Level Up Your Workforce Analytics](https://www.rippling.com/blog/unify-and-level-up-your-workforce-analytics-with-ripplings-new-custom-reports)
- [Paychex — HR Analytics](https://www.paychex.com/human-resources/hr-analytics)
- [ADP — People Analytics powered by ADP DataCloud](https://apps.adp.com/en-US/apps/14829/people-analytics-powered-by-adp-datacloud/features)

## Note on Existing Content Elsewhere

`Step 3 - Mock_Work/Widget_Specs/W03-Payroll-Distributions.md` and `Step 4 - Widget Final Design/W03 - Payroll Distributions.md` both still carry their own `## Purpose & Competitive Fit Check` / `## How Other Companies Fulfil This Purpose` sections (The Bricks, Acciyo). Nothing there has been moved or deleted — this file cites the same sources and adds substantially more on top. Whether to update those two sections to point here is still an open decision.
