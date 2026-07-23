# Market Research: Insurance Billing Plans

> Step 2 — Feedback / Market Research. Captures how other companies present this kind of information — visuals, layout, framing — so a widget's design options can be checked against real precedent (or an honest "no direct precedent found") before Step 3 locks in Options A/B/C.

**Widget:** W06 — Insurance Billing Plans
**Module:** Insurance Billing
**Researched:** 2026-07-22
**Status:** ✅ Researched — via the `widget-market-research` skill (parallel-agent research pass, manual cross-check in place of automated verification)

## What This Widget Shows Today

Per `Step 1 - Dashboard Research/06 - Insurance Billing Plans.md`: a table + pie chart showing live enrollment count (employees + dependents) per insurance plan, filterable by insurance type (Dental, Medical, Property, Vision). **Note:** already Step 4 — locked (`Step 4 - Widget Final Design/W06 - Insurance Billing Plans.md`) — Horizontal Bar / Donut / Table kept as peer views, since this is a single-dimension dataset with no missing dimension to resolve.

## Data Used

`IB_Plan`, `IB_Type`, `IB_EmployeePlan`, `IB_EmployeeDependent` (per Step 1) — enrollment count is computed live at query time, not a stored snapshot. Per `Step 3 - Mock_Work/Data and Build Readiness - Developer Punch List.md`'s `## W06` section: Plan Type filter ✅ available, Horizontal Bar/Donut/Table views ✅ available, KPI Total Enrollment ✅ available — **everything on this widget is fully available**, flagged as the lowest-risk widget in the whole project and a good candidate for an early/quick build.

## Competitor / Industry Findings

**Already on file, carried forward from Step 3/4 rather than re-derived:**
- Benefits dashboards typically use bar charts to compare plan enrollment across categories, with donut for proportional split, drawn from ADP/Gusto-style benefits platforms. *Sources: [Milliman](https://www.milliman.com/en/insight/how-enrollment-insights-can-drive-eb-plan-design); [Gusto — Benefits Dashboard](https://support.gusto.com/article/112462198100000/Gusto-benefits-dashboard).* **Confidence: confirmed pattern (2 independent sources)** — already the basis for keeping Bar and Donut as peer views.

**New this pass:**
- **Honest gap** — no nonprofit/church-specific platform researched (GuideStone, Church Pension Group, Presbyterian Board of Pensions, ACS Technologies/Realm, MIP Fund Accounting) documents an enrollment-count-by-plan chart. These are transactional/eligibility-workflow systems, not analytics dashboards, for this specific metric. *Sources: [GuideStone](https://www.guidestone.org); [Presbyterian Board of Pensions — Benefits Connect](https://pensions.org/what-we-offer/employer-guidance/benefits-connect-employer); [MIP — Nonprofit Reporting Software](https://www.mip.com/product/nonprofit-reporting-software).* Don't treat this as supporting evidence either way — it's a genuine gap in the nonprofit-specific market, not a signal against the current design.
- **Single source, corroborates the metric not the chart type** — Businessolver's current "Benefits Participation & Premium Cost Analytics Dashboard" shows participation trends across plans, demographics, and coverage levels, confirming plan-level enrollment analytics is now a real, current mainstream feature. *Source: [Businessolver — New Dashboard](https://www.businessolver.com/news/new-businessolver-dashboard) (2025-12-18).* ADP's "Benefit Plan Summary" and "Employee & Dependent Enrollments" reports similarly confirm the metric matters industry-wide. *Source: [ADP Workforce Now](https://apps.adp.com).* Neither source confirms bar/donut specifically as the chart type — only Gusto does that explicitly, so the chart-type confidence stays at the original 2-source level, not upgraded by these two.

## Visual Options (aim for 3)

1. **No change** — Bar/Donut/Table peer views remain the best-supported, lowest-risk choice; nothing found this pass conflicts with the existing Milliman/Gusto basis. Data needed: ✅ already available and already locked.
2. **Considered, not currently actionable:** an enrollment-trend-over-time view, echoing Businessolver's "participation trends" framing. Flagged as an internal idea prompted by a single new source, not a confirmed pattern. Data needed: 🔴 not available today — enrollment is a live COUNT at query time with no historical snapshot table identified in Step 1; this would need new data capture, not just new query logic.
3. **No change to scope** — this remains correctly flagged as the lowest-risk widget in the project; this research pass found nothing to add complexity or urgency here.

## Net Assessment

**Supports.** This is the most straightforward widget researched in this project — a single-dimension dataset with a design that already matches the standard cleanly, confirmed by two independent sources (Milliman, Gusto) with no conflicting signal found anywhere in this pass, mainstream or nonprofit. The nonprofit-specific angle turned up no chart precedent at all, but that's an honest market gap, not evidence against the current design. Nothing here changes the "lowest-risk, quick build" read already on file.

## Sources

- [Milliman — How Enrollment Insights Can Drive EB Plan Design](https://www.milliman.com/en/insight/how-enrollment-insights-can-drive-eb-plan-design)
- [Gusto — Benefits Dashboard](https://support.gusto.com/article/112462198100000/Gusto-benefits-dashboard)
- [GuideStone](https://www.guidestone.org)
- [Presbyterian Board of Pensions — Benefits Connect](https://pensions.org/what-we-offer/employer-guidance/benefits-connect-employer)
- [MIP — Nonprofit Reporting Software](https://www.mip.com/product/nonprofit-reporting-software)
- [Businessolver — New Businessolver Dashboard](https://www.businessolver.com/news/new-businessolver-dashboard)
- [ADP Workforce Now](https://apps.adp.com)

## Note on Existing Content Elsewhere

`Step 3 - Mock_Work/Widget_Specs/W06-Insurance-Billing-Plans.md` and `Step 4 - Widget Final Design/W06 - Insurance Billing Plans.md` both still carry their own `## Purpose & Competitive Fit Check` / `## How Other Companies Fulfil This Purpose` sections (Milliman, Gusto). Nothing there has been moved or deleted — this file cites the same sources and adds a bit more on top. Whether to update those two sections to point here is still an open decision.
