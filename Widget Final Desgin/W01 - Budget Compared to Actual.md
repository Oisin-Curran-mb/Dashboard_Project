# W01 — Budget Compared to Actual

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W01-Budget-Compared-to-Actual.md](../Mock_work/Widget_Specs/W01-Budget-Compared-to-Actual.md)
**Data source & formulas:** [Dashboard_Research/01 - Budget Compared to Actual.md](../Dashboard_Research/01%20-%20Budget%20Compared%20to%20Actual.md)

## Purpose
Shows how the organisation's actual income or spending compares to what was budgeted, across each period of the financial year — both period-by-period and as a running year-to-date total — so users can quickly see where they're ahead of or behind plan.

## How Other Companies Fulfil This Purpose
Budget-vs-actual reporting is one of the most standardised chart problems in financial dashboards, so this widget's design leans directly on established practice rather than inventing a new pattern:

- A **grouped bar chart** (Budget vs Actual side by side, per period) is the standard first view for this exact comparison ([Zebra BI](https://zebrabi.com/power-bi-waterfall-charts-explained/)) — this is why **Variance Bar is the default view** here.
- A **waterfall/bridge chart** is specifically recommended when the goal is to show how period-by-period variances build up to a year-end total, and is called out as the right chart "for a small number of categories, like a 6- or 12-month series" ([Domo](https://www.domo.com/learn/charts/waterfall-charts)) — a near-exact match for this widget's ~12 fiscal periods, which is why **Waterfall is kept as a full alternate view**, not cut.
- **KPI cards summarising current variance and variance percentage** are recommended as a layer on top of the chart, not a competing chart type in their own right ([VeloraAI](https://veloraailabs.com/blog/budget-vs-actual-variance-analysis-excel)) — this is the direct justification for the **KPI header strip** design decision above: the research treats it as a permanent overlay, not a third switchable view, which is why the earlier draft's "KPI + Bars / Bars Only" toggle was cut (see "What Got Cut" below).
- **Conditional colour** (green = favourable, red = unfavourable) is the universal convention for variance reporting across every source reviewed — carried straight into the Fine-Tuning Notes below.

**Net assessment:** this widget's final shape — one primary comparison chart, one bridge/cumulative alternate, a persistent KPI layer, and colour-coded variance — matches or exceeds what's typically shipped in commercial budget-vs-actual dashboards. Nothing here is a novel risk; the design choices are traceable to a specific, named best practice rather than internal preference.

## Filters
| Filter | Values |
|--------|--------|
| Account Type | Income Accounts · Expense Accounts · Custom Report |
| Fiscal Year | FY 2026 · FY 2025 · FY 2024 |
| Period View | Monthly · Quarterly · Weekly (Large/Expanded only) — **kept in the design pending developer feasibility confirmation**; no confirmed weekly transaction grain in GL data today, so this needs a dev call before build, not a design change. **Added to the mock 2026-07-09** — Weekly was previously missing from the selectable option list entirely; it's now selectable, restricted to Large/Expanded as designed. |

**Dependent fields — added this round, restored from the legacy design:** the legacy widget's "Selected Accounts" option (equivalent to **Custom Report** here) reveals two additional dropdowns once selected — **Special Report Title** and **Line Description** — missed in the original consolidation pass. Restored in the mockup: choosing Custom Report now shows both fields inline (Large) and in the filter modal (every other size).

**Open question — needs confirmation before build:** Special Report Title is confirmed to be a list the customer creates elsewhere (the Special Reports module). **Line Description's source is not confirmed** — it may be user-created the same way (elsewhere, per customer), or it may be a fixed/hard-coded list maintained by us. This changes whether it needs its own data source/endpoint or can ship as a static list — needs a dev/data answer before build. Mock option lists are in place in the meantime for visual purposes only.

KPI size shows Fiscal Year only, no download, no view switch.

**Consolidated/master company rollup:** when viewing a consolidated organisation, this widget must combine figures from all child accounts automatically, matching legacy behaviour exactly. **Decided: reinstate this** — the Modern API currently returns an empty result for master companies (CompanyNumber=0), which is a regression, not an acceptable simplification. This is a must-fix, not an open question.

## Data Table Sort
Fixed chronological — Period ascending. Not user-sortable (Finance-domain default).

## Drill-Through
Links out to the underlying GL data. **Target page/URL not yet available** — open item, not a design gap.

## Refresh
Standalone icon, present at every size including KPI.

---

## Views (Switch View)

One widget, three views reachable through the elevated Switch View control — all reading the same underlying dataset, swapped for different questions rather than competing as separate designs.

**KPI header strip** (Medium, Large, Expanded only): YTD Budget · YTD Actual · Variance · % Used, shown above whichever view is active below. Not a separate view — a persistent layer on top of all three.

### View 1 — Variance Bar *(default)*
Grouped bar chart (Budget vs Actual per period) with a variance row beneath. Answers "how did each period do?"

### View 2 — Waterfall
Cumulative variance waterfall — each period stacks on the last. Answers "how did we get to where we are now?" — the board-level / bridge-chart version of the same data.

### View 3 — Data Table
Period · Budget · Actual · Variance · Cumulative Variance. Fixed sort: Period ascending. The reporting/export view.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Variance Bar only, 4 periods, no variance row, no legend, no KPI strip, no Switch View (too small to offer alternatives) |
| **Medium (2×2)** | KPI strip (Variance ($) and % Used only — trimmed pair, not all 4) + 6 periods of the active view; Switch View available |
| **Large (4×4)** | Full KPI strip (all 4 figures) + up to 12 periods of the active view; Switch View available; Period View includes Weekly |
| **KPI (1×0.5)** | Headline: **Variance ($)**, colour-coded green/red, with a trend sparkline. Fiscal Year filter only. No download, no switch. **Card title also shows the active Account Type/Fiscal Year filters** (added 2026-07-09), formatted "Variance — [Account Type], [Fiscal Year]" — see Fine-Tuning Notes. |
| **Expanded** | Full KPI strip + full 12-period active view, Switch View available, Weekly available, all filters live in the modal |

**Small's card title also shows the active filters** (added 2026-07-09), same "Variance — [Account Type], [Fiscal Year]" format as the KPI card, using the same underlying function.

---

## What Got Cut (and why)
- **Dual-figure KPI ("YTD Actual + YTD Budget" shown together)** — dropped in favour of a single Variance ($) headline at KPI size. Competitor research consistently points to variance as the one number that matters most at a glance; showing two raw totals side by side needed a fit-test that a single clear figure doesn't.
- **"KPI + Bars / Bars Only" toggle** — the KPI tiles are no longer a switchable alternative to the bar chart; they're a permanent header strip shown above whichever view is active, since the research treats KPI cards as a layer on top of a chart, not a competing view.
- **% Used as its own KPI headline** — folded into the persistent KPI strip at Medium/Large/Expanded instead of being a third competing KPI-size option.

## Fine-Tuning Notes
- View toggle persists per widget instance, not shared globally
- Variance colours: green = favourable (under budget on expenses / over on income), red = unfavourable
- **Added (2026-07-09):** KPI and Small card titles now read "Variance — [Account Type], [Fiscal Year]" (e.g. "Variance — Income Accounts, FY 2026"), always showing both, since neither filter has an "all" state to collapse (unlike W02's District/Plan Type). Built on the same reusable `fcKpiFilterHeadline()` function introduced for W02, extended to support more than one card size per widget.
- **Added, then fixed same day (2026-07-09):** hovering a bar in the KPI tile's trend sparkline shows that period's label and its variance amount (e.g. "Jan: +$4k"). First attempt used an SVG `<title>` child element, which didn't reliably trigger — switched to a `title` attribute instead, the same mechanism already used for the grouped-bar hovers elsewhere. Also corrected to show a dollar amount (matching the data-type fix below), not a percentage.
- **Added, then fixed same day (2026-07-09):** hovering the YTD Budget/YTD Actual/Variance/% Used labels in the KPI header strip (Medium/Large) shows a short definition, styled to match the existing Purpose popover. Centering the bubble on the trigger clipped it at the card's left edge for the left-column labels (YTD Budget, Variance) — now anchored to the trigger's own left/right edge instead, so it always grows into the card. '% Used' and Variance's wording was also rewritten to drop the "YTD" shorthand from the explanation text itself (checked against how budgeting sources plainly explain a %-of-budget figure).
- **Fixed (2026-07-09):** Quarterly previously always showed exactly 3 quarters, computed from a single representative month rather than an actual rollup — a full 12-month fiscal year (FY2025, FY2024) only ever showed Q1-Q3. Quarterly now groups every 3 months into a real quarter, correctly producing Q1-Q4 for a complete year.
- **Fixed (2026-07-09):** FY2026 (the in-progress year) was simply missing its current month — it only had Jan-Jun, so Quarterly could never produce more than Q1+Q2, and the "average" math being used at the time was also only valid under the old (wrong) %-of-budget reading. A partial 'Jul' month was added (Budget stays a normal full-month figure; Actual is deliberately low, since the month/quarter just started) and the quarter rollup now **sums** months instead of averaging them, since Budget/Actual are real dollar figures per period, not percentages (see the data-type fix below). This gives a real, honestly-low Q3 instead of none.
- **Fixed, real data bug (2026-07-09):** Budget/Actual per period were dollar amounts (in $k) that the table, bar chart, and axis labels all mislabeled and displayed as a percentage ("78%" instead of "$78k") — confirmed by checking that the monthly figures summed close to the widget's own $-formatted YTD totals. Every table, chart tooltip, and axis title across all three views now shows dollar amounts; Variance specifically shows both a $ amount and a % of that period's budget, since Variance is the one figure that legitimately works either way. Recomputing exact sums also surfaced and fixed two smaller pre-existing data bugs: FY2026's totals didn't quite match its own periods for any of the three Account Types (now corrected), and Custom Report's FY2025/FY2024 totals were each exactly $100k too high (a data-entry error, unrelated to tonight's fix, found while re-verifying).
- **Fixed, real colour-logic bug (2026-07-09):** this doc has always said "green = favourable (under budget on expenses / over on income)," but the KPI total, table rows, and Option B's bar chart never actually implemented that flip — they coloured green whenever Actual ≥ Budget regardless of Account Type, which is backwards for Expense Accounts/Custom Report (spending MORE than budgeted was shown as green). Now correctly flips for Expense Accounts/Custom Report at every level (KPI headline, per-period table rows, cumulative variance, and the Option B bar chart), matching the rule this doc already stated.

---

## Interview Q&A (Ben Lane, 13.07.2026)

Source: [Question and answer from Ben Lann (13.07.2026).md](../Feedback/Question%20and%20answer%20from%20Ben%20Lann%20%2813.07.2026%29.md). Full detail and transcript quotes in [Specialist Questions.md](../Feedback/Specialist%20Questions.md), Q1–Q3 and Q54.

**Q: Are users more interested in individual periods or the year-to-date total, or both equally?**
A: Year-to-date, by about 60/40 over individual periods. Some look at both. — *Confirms YTD as the default lens; supports the Variance Bar default view and KPI strip design above.*

**Q: Would a variance bar/line add value beyond showing budget and actual side by side?**
A: Yes — many clients mainly want to know how much budget remains (budget minus actual). — *Directly supports the KPI header strip / Variance($) design decision above.*

**Q: Is the income/expense/custom-grouping filter used often, or do most people leave it on one setting?**
A: Most leave it on Income, even though Expense is arguably more useful. The Custom Report option is considered very helpful. — *No design change implied; confirms Income as a reasonable default.*

**Q: Who typically uses this widget — someone managing a single church, or someone overseeing multiple churches across a district?**
A: A single church — treasurer, finance committee chair, or church administrator. Not primarily a multi-church/district tool. *(Note: this answer was originally misfiled against Pension Plans in the short-summary export; the full transcript confirms it belongs here.)*
