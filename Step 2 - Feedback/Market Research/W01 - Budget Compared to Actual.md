# Market Research: Budget Compared to Actual

> Step 2 — Feedback / Market Research. Captures how other companies present this kind of information — visuals, layout, framing — so a widget's design options can be checked against real precedent (or an honest "no direct precedent found") before Step 3 locks in Options A/B/C.

**Widget:** W01 — Budget Compared to Actual
**Module:** General Ledger
**Researched:** 2026-07-22
**Status:** ✅ Researched — via the `widget-market-research` skill (parallel-agent research pass, manual cross-check in place of automated verification)

## What This Widget Shows Today

Per `Step 1 - Dashboard Research/01 - Budget Compared to Actual.md`: two side-by-side charts — a grouped bar chart (Actual vs. Budget per fiscal period) and a YTD running-total line chart — for income, expense, or a custom account grouping, comparing against the *original* budget only (mid-year revisions deliberately excluded), with automatic rollup for consolidated multi-entity organisations. **Note:** already Step 4 — locked (`Step 4 - Widget Final Design/W01 - Budget Compared to Actual.md`) — Variance Bar (grouped bar) is the default view, with a KPI header strip and a data table; a Waterfall alternate was designed but cut for time on 2026-07-21, not on merit.

## Data Used

`GLSummary`, `GLBudgetDetail`, `GLPeriod`, `GLAccount`, `SSUserTenantPreferenceRepository` (per Step 1). Per `Step 3 - Mock_Work/Data and Build Readiness - Developer Punch List.md`'s `## W01` section: Account Type filter ✅ available; Special Report Title / Line Description (Custom Report dependents) 🟡 needs new query/logic (though a correction note suggests Line Description maps to an already-built endpoint); Fiscal Year ✅; Period View Monthly ✅, Quarterly 🟡 needs grouping logic, Weekly 🔴 missing (kept in design pending feasibility, not dropped); Variance Bar / Data Table / KPI header ✅ all available; Waterfall view ➖ N/A, formally cut; Drill-through to GL ➖ N/A, decided cut (no target page); **Consolidated/master company rollup 🔴 decided — must-fix before launch** — the Modern API currently returns an empty list for master companies (CompanyNumber=0), a real regression from confirmed legacy behaviour.

## Competitor / Industry Findings

**Already on file, carried forward from Step 3/4 rather than re-derived:**
- A grouped bar chart (Budget vs Actual per period) is the standard first view for this comparison, and a waterfall/bridge chart is specifically recommended for showing how period variances build to a year-end total across "a small number of categories, like a 6- or 12-month series" — a close match to this widget's ~12 periods. *Sources: [Zebra BI](https://zebrabi.com/power-bi-waterfall-charts-explained/); [Domo](https://www.domo.com/learn/charts/waterfall-charts).*
- KPI cards summarising variance are recommended as a layer on top of the chart, not a competing view. *Source: [VeloraAI](https://veloraailabs.com/blog/budget-vs-actual-variance-analysis-excel).*

**New this pass:**
- **Single vendor, well-documented** — MIP Fund Accounting explicitly treats "original" and "revised" budget as distinct, simultaneously-trackable versions, with dedicated revision worksheets and audit trails. *Sources: [MIP — Budget Management](https://www.mip.com/product/budget-management/); [MIP blog — Nonprofit Budget Creation and Support Software](https://www.mip.com/blog/nonprofit-budget-creation-and-support-software/) (updated 2024-05-22); [MIP blog — The Power of MIP's Budget Module](https://www.mip.com/blog/the-power-of-mip-fund-accountings-budget-module/).* This is single-vendor across 3 pages, not independently corroborated by a second vendor — but it's the closest real precedent found for why "original budget only" is a meaningful, deliberate distinction rather than an arbitrary simplification: Aplos tracks budget revisions but doesn't show original-vs-revised side by side, and ACS/Realm's Statement of Activities has no version concept at all. *Counter-example source: [ACS/Realm help](https://help.acst.com).*
- **Confirmed pattern (Sage Intacct's own docs + 2 independent third-party analyses)** — consolidated/multi-entity rollups are shown as the *same* chart with combined totals plus a zoom/drill-down into per-entity figures, not a separate chart type. *Sources: [Sage Intacct — multi-entity](https://www.sage.com); [Rand Group — Sage Intacct reporting tools](https://randgroup.com) (2026-01-06, updated 2026-04-22); [Centage — Multi-Entity Consolidation for Sage Intacct Users](https://centage.com/blog/sage-intacct-multi-entity-consolidation) (2026-06-11).* This validates showing one combined figure for consolidated companies (as intended) rather than a different visualization — but it also means the punch-list's must-fix bug (empty results for master companies) blocks reaching even this baseline, before any enhancement is considered.
- **Single source, strong direct match** — Bold BI's own "Budget vs Actual Dashboard" template combines KPI cards, column (bar) charts, variance drilldowns, and a grid/table view — close to an exact match for this widget's locked shape. *Source: [Bold BI — Budget vs Actual Dashboard](https://boldbi.com/dashboard-examples/finance/budget-vs-actual-dashboard/) (2025-12-12, updated 2026-05-02).*
- **Single source, dissenting view — worth flagging, not acting on** — Microsoft's own Power BI/Fabric design lead argues grouped bar charts are *not* the most effective choice for budget-vs-actual because bars can't easily be colour-coded by above/below-budget status, recommending bullet or gauge charts instead. *Source: [Microsoft Fabric Community — Actual vs. Budget: Which visualization is most effective?](https://community.fabric.microsoft.com) (2017-01-19, Miranda Li).* A real, credible counter-signal, but outweighed by the multiple sources (Zebra BI, Bold BI, ClearPoint) favouring grouped bar — not a reason to revisit the locked default.
- **Single source, medium confidence** — ClearPoint Strategy's Budget vs. Actual template pairs a bar/line combo chart with gauge charts and drill-down detail, reinforcing the general KPI + chart + drill-down combination even though the exact chart mix differs. *Source: [ClearPoint Strategy](https://clearpointstrategy.com/dashboards/budget-vs-actual-dashboard).*

## Visual Options (aim for 3)

1. **Label the KPI header/chart explicitly as "Original Budget"** to make the intentional exclusion of revisions visible to users, mirroring MIP's practice of naming budget versions explicitly rather than leaving "budget" ambiguous. Based on: the MIP finding above. Data needed: ✅ available today — display-only change, no new query.
2. **Considered and not recommended:** a bullet or gauge chart per period, per Microsoft's dissenting view. Flagged because it's a real, credible source — but it's single-sourced and runs against three other sources favouring grouped bar for this exact use case, so it doesn't outweigh the locked default. Data needed: ✅ available today if ever revisited, since it would use the same Actual/Budget/Variance figures already computed.
3. **Once the consolidated-rollup bug is fixed, add a zoom/drill-down from the combined total into per-entity figures**, matching Sage Intacct's pattern, rather than only ever showing one combined number. Based on: the Sage Intacct/Centage/Rand Group finding. Data needed: 🔴 blocked — this is an enhancement on top of a feature that doesn't work at all yet per the punch list's must-fix flag; not buildable until that's resolved.

## Net Assessment

**Supports**, with one new consideration and one dissenting view surfaced. The locked KPI-header + grouped-bar + table design is now corroborated by more sources than the original Step 3 citations (Bold BI and ClearPoint both add close matches). The MIP finding validates that "original budget only" is a real, meaningful distinction in nonprofit accounting practice, not an arbitrary simplification worth reconsidering. The Microsoft/Power BI dissent on grouped bar charts is worth being aware of but doesn't outweigh the multi-source support for the current approach. Most concretely: the consolidated-rollup research reinforces that the punch list's must-fix bug (empty results for master companies) isn't just a data gap — it blocks this widget from reaching even baseline parity with how every mainstream/nonprofit competitor researched handles multi-entity rollups, let alone matching their drill-down enhancement.

## Sources

- [Zebra BI — Power BI Waterfall Charts Explained](https://zebrabi.com/power-bi-waterfall-charts-explained/)
- [Domo — Waterfall Charts](https://www.domo.com/learn/charts/waterfall-charts)
- [VeloraAI — Budget vs Actual Variance Analysis Excel](https://veloraailabs.com/blog/budget-vs-actual-variance-analysis-excel)
- [MIP — Budget Management](https://www.mip.com/product/budget-management/)
- [MIP blog — Nonprofit Budget Creation and Support Software](https://www.mip.com/blog/nonprofit-budget-creation-and-support-software/)
- [MIP blog — The Power of MIP Fund Accounting's Budget Module](https://www.mip.com/blog/the-power-of-mip-fund-accountings-budget-module/)
- [ACS/Realm help center](https://help.acst.com)
- [Sage Intacct — multi-entity](https://www.sage.com)
- [Rand Group — Sage Intacct reporting tools](https://randgroup.com)
- [Centage — Multi-Entity Consolidation for Sage Intacct Users](https://centage.com/blog/sage-intacct-multi-entity-consolidation)
- [Bold BI — Budget vs Actual Dashboard](https://boldbi.com/dashboard-examples/finance/budget-vs-actual-dashboard/)
- [Microsoft Fabric Community — Actual vs. Budget: Which visualization is most effective?](https://community.fabric.microsoft.com)
- [ClearPoint Strategy — Budget vs. Actual Dashboard](https://clearpointstrategy.com/dashboards/budget-vs-actual-dashboard)

## Note on Existing Content Elsewhere

`Step 3 - Mock_Work/Widget_Specs/W01-Budget-Compared-to-Actual.md` and `Step 4 - Widget Final Design/W01 - Budget Compared to Actual.md` both still carry their own `## Purpose & Competitive Fit Check` / `## How Other Companies Fulfil This Purpose` sections (Zebra BI, Domo, VeloraAI). Nothing there has been moved or deleted — this file cites the same sources and adds substantially more on top. Whether to update those two sections to point here is still an open decision.
