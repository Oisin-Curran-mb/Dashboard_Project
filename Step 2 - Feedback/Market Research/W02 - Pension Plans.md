# Market Research: Pension Plans

> Step 2 — Feedback / Market Research. Captures how other companies present this kind of information — visuals, layout, framing — so a widget's design options can be checked against real precedent (or an honest "no direct precedent found") before Step 3 locks in Options A/B/C.

**Widget:** W02 — Pension Plans
**Module:** Pension Billing
**Researched:** 2026-07-22
**Status:** ✅ Researched — via the `widget-market-research` skill (parallel-agent research pass, manual cross-check in place of automated verification)

## What This Widget Shows Today

Per `Step 1 - Dashboard Research/02 - Pension Plans.md`: a table + pie chart showing total annual pension contribution grouped by plan type, filterable by church district, with drill-down to individual appointees per plan. **Note:** already Step 4 — locked (`Step 4 - Widget Final Design/W02 - Pension Plans.md`) — the default view was originally changed to Grouped Bar by District, then **reversed back to Pie by Plan Type on direct instruction (2026-07-09)** to match the legacy widget, with Grouped Bar kept as the Switch Chart Type alternate.

## Data Used

`PB_Appointment`, `PB_AppointmentPlan`, `PB_ControlTable` (per Step 1). Per `Step 3 - Mock_Work/Data and Build Readiness - Developer Punch List.md`'s `## W02` section: Church District filter ✅ available; Plan Type filter ✅ resolved/confirmed correct (dynamic list, org-configurable); Fiscal Year filter 🔴 decided — removed (this is a point-in-time "active as of today" snapshot with no year dimension); Grouped Bar/Donut/Table views ✅ available; KPI Total Annual Contribution ✅ available; drill-through to Pension Billing 🔴 missing (no target URL confirmed); appointee drill-down "Charge" field 🔴 known gap (returns empty string in the Modern API today).

## Competitor / Industry Findings

**Already on file, carried forward from Step 3/4 rather than re-derived:**
- No named competitor product specifically benchmarks pension-contribution-by-district reporting; general U.S. Department of Labor pension-plan visualization guidance was the closest loose precedent found previously. *Source: [U.S. DOL](https://www.dol.gov/agencies/odg/visualization-gallery/ebsa-private-pension-plans).*

**New this pass:**
- **Confirmed structural pattern, no visual precedent** — Denominational pension boards genuinely use both dimensions this widget models: plan-type grouping (e.g. the UMC's Wespath administers named, separately-billed plan types — CRSP DB/DC, CPP, UMPIP) and conference/district-level grouping (Wespath's 2024 Annual Report explicitly reports distributions by conference region; individual UMC annual conferences independently administer and bill contributions at the conference level). *Source: [Wespath 2024 Annual Report PDF](https://www.wespath.org/wp-content/uploads/6094.pdf) — p.7, conference-region reporting.* This directly corroborates the "Methodist Conference" reference already found in this project's W10 interview notes — plan-type × district/conference is a real administrative structure, not an invented reporting dimension. **However, no chart-type precedent was found at all** — Wespath and Church Pension Group's own annual reports use narrative stat call-outs and fund-performance text blocks, not pie, donut, or bar charts, for this data. This is a structural validation of *what* the widget tracks, not of *how* it should look.
- **Confirmed pattern, conflicts with the locked pie default** — General HR/benefits platforms show plan-type cost breakdowns as tables, not pie/donut charts, by default. *Sources: [Gusto — Benefits Dashboard](https://support.gusto.com/article/112462198100000); [ADP Workforce Now — Benefits Administration](https://apps.adp.com/en-US/apps/195376/).* Two independent vendors converge on tabular-first, not chart-first.
- **Single source, explicit counter-signal** — one HR-dashboard source explicitly recommends against pie charts for benefits/plan breakdowns, favouring stacked bar instead. *Source: [HR University — 7 Best HR Metrics Dashboard Examples](https://hr.university/analytics/hr-metrics-dashboard) (2026-05-18, updated 2026-06-04).* Notable given the locked design specifically reversed *away* from a bar default *to* pie, on direct instruction rather than research — this finding leans the opposite direction, though it predates and wasn't part of that decision.
- **Confirmed pattern, supports the locked alternate view** — organizational-dimension breakdowns (department/location — the general-software analogue of "district" here) consistently use bar or stacked-bar charts, not pie. *Sources: [Rippling — HR Metrics & Reporting](https://www.rippling.com/hr-metrics-reporting); HR University (above); [MiHCM — HR Analytics Dashboard Best Practices](https://mihcm.com/resources/blog/hr-analytics-dashboard-best-practices-and-examples) (2026-01-26).* This strengthens confidence in keeping Grouped Bar by District as the alternate view, independent of whatever the default view is.
- **Single source, low weight** — Rippling also offers a donut-chart option generically for any report, including benefits, but as a selectable option rather than an enforced default. *Source: [Rippling — HR Metrics & Reporting](https://www.rippling.com/hr-metrics-reporting).*

## Visual Options (aim for 3)

1. **Revisit whether Pie-by-Plan-Type should remain the default view**, given that general benefits-software precedent (Gusto, ADP) leans table-first and one source explicitly advises against pie for this kind of breakdown. This is a genuine tension with the 2026-07-09 "match the legacy widget" decision, which was made on direct instruction rather than research — flagged for a conversation, not decided here. Based on: the Gusto/ADP/HR University findings. Data needed: ✅ available today — same underlying data, a default-view change only.
2. **Keep Grouped Bar by District as the alternate view** — now more strongly supported than before by the org-dimension-uses-bar pattern (Rippling, HR University, MiHCM), independent of what the default view ends up being. Based on: the org-dimension finding above. Data needed: ✅ already available and already locked.
3. **No chart change indicated by denominational precedent specifically** — Wespath and Church Pension Group don't use charts for this data at all, so this widget's dashboard-style visualization already goes beyond what actual pension administrators publicly show. Not an actionable visual option, just context: there's no denominational "gold standard" layout to chase here.

## Net Assessment

**No strong signal either way on the locked default view, but a genuinely new structural finding.** This is the first pass to actually confirm that plan-type × district/conference is a real, independently-documented reporting structure in the denominational pension world (previously "no named competitor" was the honest conclusion) — that's a meaningful upgrade in confidence about *what* this widget tracks. On *how* it displays that data, the picture is mixed: the pie-by-plan-type default was a direct-instruction reversal to match the legacy widget, and general benefits-software precedent found this pass leans away from pie (table-first in Gusto/ADP, explicit anti-pie advice from HR University) — not strong enough to override a direct instruction, but worth surfacing as a real tension rather than treating the legacy-parity reversal as research-validated. The Grouped Bar alternate view is on firmer ground either way, now backed by three independent sources on how organizational dimensions are typically charted.

## Sources

- [U.S. Department of Labor — Private Pension Plans Visualization Gallery](https://www.dol.gov/agencies/odg/visualization-gallery/ebsa-private-pension-plans)
- [Wespath — 2024 Annual Report PDF](https://www.wespath.org/wp-content/uploads/6094.pdf)
- [Gusto — Benefits Dashboard](https://support.gusto.com/article/112462198100000)
- [ADP Workforce Now — Benefits Administration](https://apps.adp.com/en-US/apps/195376/)
- [HR University — 7 Best HR Metrics Dashboard Examples](https://hr.university/analytics/hr-metrics-dashboard)
- [Rippling — HR Metrics & Reporting](https://www.rippling.com/hr-metrics-reporting)
- [MiHCM — HR Analytics Dashboard Best Practices and Examples](https://mihcm.com/resources/blog/hr-analytics-dashboard-best-practices-and-examples)

## Note on Existing Content Elsewhere

`Step 3 - Mock_Work/Widget_Specs/W02-Pension-Plans.md` and `Step 4 - Widget Final Design/W02 - Pension Plans.md` both still carry their own `## Purpose & Competitive Fit Check` / `## How Other Companies Fulfil This Purpose` sections (U.S. DOL, plus the 2026-07-09 direct-instruction reversal note). Nothing there has been moved or deleted — this file cites the same source and adds substantially more on top, including a genuine tension worth a conversation. Whether to update those two sections to point here is still an open decision.
