# Market Research: Fixed Asset Values

> Step 2 — Feedback / Market Research. Captures how other companies present this kind of information — visuals, layout, framing — so a widget's design options can be checked against real precedent (or an honest "no direct precedent found") before Step 3 locks in Options A/B/C.

**Widget:** W11 — Fixed Asset Values
**Module:** Fixed Assets
**Researched:** 2026-07-22
**Status:** ✅ Researched — via the `widget-market-research` skill (parallel-agent research pass, manual cross-check in place of automated verification)

## What This Widget Shows Today

Per `Step 1 - Dashboard Research/11 - Fixed Asset Values.md`: a table + pie chart of fixed asset financial values (Capitalized Value, Cost, Depreciable Value, Accumulated Depreciation, Net Value), grouped by a user-chosen dimension — Class, Building, Room, Asset Account, Accumulated Depreciation Account, or Expense Account. **Note:** already Step 4 — locked (`Step 4 - Widget Final Design/W11 - Fixed Asset Values.md`) — keeps bar and donut as peer views (not one default), since the right chart genuinely depends on whether the active Group By is low-cardinality (Class) or high-cardinality (Room). Flagged ⚠️ high-risk per the punch list.

## Data Used

`FA_Asset`, `FA_AssetDepreciation`, `SSUserTenantPreferenceRepository` (per Step 1). Per `Step 3 - Mock_Work/Data and Build Readiness - Developer Punch List.md`'s `## W11` section: Group By Class/Building/Room ✅ available; **Group By Asset Account / Accumulated Depreciation Account / Expense Account 🔴 major gap** — confirmed unimplemented, the Modern API returns an empty list for these 3 of 6 options; Specific Group cascading dropdown 🟡 works for the 3 available dimensions, broken for the other 3; Financial Measure (5 measures) across all views ✅ available for the working dimensions; KPI Total Net Value ✅ available; Data Table Sort by Tag # 🟡 proposed default, not yet confirmed against the old design.

## Competitor / Industry Findings

**Already on file, carried forward from Step 3/4 rather than re-derived:**
- Fixed-asset dashboards commonly use pie charts by class/category alongside a full lifecycle table, with filters by year/class/location; pie/donut is only recommended for small category counts. *Sources: [SlideTeam](https://www.slideteam.net/blog/must-have-fixed-assets-dashboard-templates-with-examples-and-samples); [GlobalData365](https://globaldata365.com/fixed-assets-dashboard/).*

**New this pass:**
- **Confirmed pattern (Sage Intacct)** — assets are tied to standard GL dimensions (Location, Department, Class, Project), so fixed-asset values can be sliced by location/department the same way any GL data can — real precedent for the "Asset Account / Accumulated Depreciation Account / Expense Account" style of grouping this widget also offers (and where the Modern API currently has its gap). *Sources: [Sage Intacct — Fixed Assets overview](https://www.intacct.com/ia/docs/en_US/help_action/FixedAssets/fa-overview.htm) (modified May 21, 2026); [CLA — Sage Intacct Dimension Groups](https://www.claconnect.com/en/resources/blogs/sage/sage-intacct-reports-dimension-groups-and-dimension-structures).* Sage Intacct's dimension-grouping happens via report/dashboard filters generally, not one widget with a user toggle between grouping fields the way this widget does — the mechanism differs, but the underlying idea (GL-account-style dimensions as a legitimate grouping axis) is validated.
- **Single vendor, tabular only** — MIP Fund Accounting's Fixed Assets module supports optional Designation Codes for location/valuation tagging, but its reports (Asset Transfer Register, Depreciation Calculation, Summary Asset Ledger) are entirely tabular — no chart or pie visualization documented anywhere. *Sources: [MIP — Fixed Assets](https://www.mip.com/product/fixed-assets/); [MIP Classic — FA documentation](https://documentation.mip.com/MIPClassic/content/Reference/FA_Fixed_Assets.htm).*
- **Honest gap, genuinely novel combination** — no product researched (Sage Intacct, MIP, Aplos, ACS Technologies/Realm) combines Building/Room-style physical location grouping with financial/depreciation values in one widget. Building/Room grouping exists only in adjacent facility/physical-inventory tools (eSPACE, InventoryQuick), which track location, not depreciated financial value — a different product category entirely from accounting fixed-asset modules. *Sources: [Aplos — Fixed Assets](https://www.aplos.com/academy/nonprofit/nonprofit-accounting/fixed-assets-and-fixed-asset-tracking/); [ACS Technologies — Fixed Assets](https://www.acstechnologies.com/acs/church-accounting-software/acs-fixed-assets/).*
- **Confirmed pattern (2+ independent BI/UX sources)** — the cardinality threshold behind the locked bar/donut peer-view decision is well-documented industry guidance: pie/donut degrades past roughly 5–7 categories, bar charts scale to dozens. *Sources: [GoodData](https://www.gooddata.ai/blog/how-to-choose-the-best-chart-type-to-visualize-your-data/); [Atlassian — Pie Chart vs Bar Chart](https://www.atlassian.com/data/charts/how-to-choose-pie-chart-vs-bar-chart); [evechart.com](https://evechart.com/blog/how_many_categories_are_ideal_for_a_pie_chart/).*
- **Confirmed pattern (2+ independent sources) — manual toggle, not automatic switching, is the real-world norm.** Neither Power BI nor Tableau auto-detects category count to switch chart types; both require a manual, one-click user action to change chart type or "swap sheets." *Sources: [The Data School — Switching Chart Type on Power BI](https://www.thedataschool.co.uk/jules-claeys/switching-chart-type-on-power-bi/); [The Data School — Switching Between Charts on Tableau](https://www.thedataschool.co.uk/tristan-kelly/how-to-switch-between-multiple-charts-with-the-same-parameters/).* This directly validates the locked design's manual bar/donut toggle over any automatic-switching alternative — nothing found suggests auto-switching would be an improvement.

## Visual Options (aim for 3)

1. **No change to the bar/donut peer-view toggle** — now doubly validated: both the underlying cardinality threshold (GoodData, Atlassian, evechart) and the choice to make it a manual toggle rather than an automatic switch (Power BI, Tableau precedent) are confirmed by fresh, independent sources beyond the original two citations. Data needed: ✅ already available and already locked.
2. **When fixing the Asset Account / Accumulated Depreciation Account / Expense Account gap, consider modelling them as standard GL-style dimensions** (as Sage Intacct does), rather than asset-specific one-off groupings — this may simplify the backend fix. Based on: the Sage Intacct finding. Data needed: 🔴 already flagged as a major gap; this is context for *how* to fix it, not a new ask.
3. **Not an actionable option, just context:** no competitor combines physical Building/Room grouping with financial depreciation values — this widget appears to be filling a genuine market gap here, similar to the pattern already seen with W03 and W05, rather than falling short of an established standard.

## Net Assessment

**Supports strongly.** The design's own reasoning about cardinality-driven chart choice is now validated by fresh, independent sources well beyond the original two citations, and the choice to keep bar/donut as a manual toggle (rather than attempting an automatic switch) matches documented practice in mainstream BI tools. The most interesting finding is a genuine market gap, not a design risk: no competitor — nonprofit or mainstream — combines Building/Room-style location grouping with financial/depreciation values the way this widget does; that combination exists only across two entirely separate product categories elsewhere (facility/inventory tools vs. accounting fixed-asset modules). This isn't evidence of a design problem — it suggests the widget may be ahead of what's commonly available in the market.

## Sources

- [SlideTeam — Fixed Assets Dashboard Templates](https://www.slideteam.net/blog/must-have-fixed-assets-dashboard-templates-with-examples-and-samples)
- [GlobalData365 — Fixed Assets Dashboard](https://globaldata365.com/fixed-assets-dashboard/)
- [Sage Intacct — Fixed Assets Overview](https://www.intacct.com/ia/docs/en_US/help_action/FixedAssets/fa-overview.htm)
- [CLA — Sage Intacct Reports, Dimension Groups and Dimension Structures](https://www.claconnect.com/en/resources/blogs/sage/sage-intacct-reports-dimension-groups-and-dimension-structures)
- [MIP — Fixed Assets](https://www.mip.com/product/fixed-assets/)
- [MIP Classic — Fixed Assets Documentation](https://documentation.mip.com/MIPClassic/content/Reference/FA_Fixed_Assets.htm)
- [Aplos — Fixed Assets and Fixed Asset Tracking](https://www.aplos.com/academy/nonprofit/nonprofit-accounting/fixed-assets-and-fixed-asset-tracking/)
- [ACS Technologies — ACS Fixed Assets](https://www.acstechnologies.com/acs/church-accounting-software/acs-fixed-assets/)
- [GoodData — How to Choose the Best Chart Type](https://www.gooddata.ai/blog/how-to-choose-the-best-chart-type-to-visualize-your-data/)
- [Atlassian — Pie Chart vs Bar Chart](https://www.atlassian.com/data/charts/how-to-choose-pie-chart-vs-bar-chart)
- [evechart.com — How Many Categories Are Ideal for a Pie Chart](https://evechart.com/blog/how_many_categories_are_ideal_for_a_pie_chart/)
- [The Data School — Switching Chart Type on Power BI](https://www.thedataschool.co.uk/jules-claeys/switching-chart-type-on-power-bi/)
- [The Data School — Switching Between Charts on Tableau](https://www.thedataschool.co.uk/tristan-kelly/how-to-switch-between-multiple-charts-with-the-same-parameters/)

## Note on Existing Content Elsewhere

`Step 3 - Mock_Work/Widget_Specs/W11-Fixed-Asset-Values.md` and `Step 4 - Widget Final Design/W11 - Fixed Asset Values.md` both still carry their own `## Purpose & Competitive Fit Check` / `## How Other Companies Fulfil This Purpose` sections (SlideTeam, GlobalData365). Nothing there has been moved or deleted — this file cites the same sources and adds substantially more on top. Whether to update those two sections to point here is still an open decision.
