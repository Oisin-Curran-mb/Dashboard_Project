# W03 — Payroll Distributions

**Module:** Payroll
**Status:** 🟢 Final design — locked · **v2 (2026-07-27): built Final, Jo design, tagged v2.0 in the build.** Locked-doc rule: only version-tagged updates (v2, v3...) may modify this doc.
**Full history / rejected ideas:** [Widget_Specs/W03-Payroll-Distributions.md](../Step%203%20-%20Mock_Work/Widget_Specs/W03-Payroll-Distributions.md)
**Data source & formulas:** [Step 1 - Dashboard Research/03 - Payroll Distributions.md](../Step 1 - Dashboard Research/03%20-%20Payroll%20Distributions.md)

> **[v2 — 2026-07-27]** NOTE: this doc still uses the pre-2026-07-27 template. It was deliberately skipped in the template upgrade pass (treated as Step 6-finished); the template upgrade is pending as its own later pass. Every v2 addition below follows the locked-doc rule as-is: version-tagged blocks only, nothing deleted, and superseded passages keep the original text underneath.

## Purpose

> **[v2 — 2026-07-27]** The built Final is Jo Lopez's payroll widget, ported wholesale into the Final Check tab with exactly one change (the period presets, see the Filters v2 block). On the pay-type list below: the pay-type breakdown is now evidenced as fully supported by the database, see `Step 5 - API documents/Payroll Distributions/Payroll Distributions - Pay Type Breakdown Analysis (proof).html`. Per that analysis, this Purpose's original fixed pay-type list framing is real: it matches the fixed `PR_HistoryCompensation.SubType` codes (1 to 10: Regular, OverTime, DoubleTime, Holiday, Other, Vacation, Sick, Personal, Misc., Other Pay). The labels the widget actually groups by, however, are org-defined distribution names from `PR_CompensationDistribution.Name`. Both levels are real (level 2: org-defined distributions; level 4: fixed SubType pay types), so the sign-off finding against this list is resolved with evidence rather than one side being wrong; see the reconciliation file's finding 1. The purpose statement below is otherwise unchanged.
Shows a breakdown of payroll amounts already paid out across a chosen date range, broken down by pay-type category (Regular, Vacation, OverTime, Sick, Double Time, Personal, Holiday, Misc, Other) — a post-payroll check of what went out, not a projection of what's owed.

## How Other Companies Fulfil This Purpose
- **Pie/donut breakdowns work only up to ~4-5 categories**; beyond that, bar charts are the recommended switch, since comparing bar length is easier than comparing pie slices ([The Bricks](https://www.thebricks.com/resources/guide-how-to-make-a-budget-pie-chart-in-excel)) — this is why **both a Bar and a Donut view are kept as peers** rather than picking one: the right default depends on how many compensation categories a given organisation actually has.
- Payroll dashboards specifically are recommended to pair a category breakdown with a **trend/comparison view over time**, not just a static snapshot ([Acciyo](https://www.acciyo.com/payroll-dashboard-examples-key-metrics-and-visuals/)) — this is the direct justification for keeping the **Period Comparison view** as a full peer, not a lesser third option.

**Net assessment:** the three-view structure (snapshot bar, snapshot donut, trend comparison) covers everything the sources recommend for this exact use case.

## Filters

> **[v2 — 2026-07-27] This section is superseded by the built Final, Jo design.** The Final's only filter is the time window control:
> - **Period presets (the one change from Jo's design):** This month (default) / This period / This quarter / This year / All time. This year is the rolling last 12 months back from the as-of date, per the Time Window Module's window definition; All time removes the date bound entirely. This year and All time were added the same day, per direct instruction, after the initial three-preset version.
> - **Custom dates kept:** Jo's Custom From/To date row is kept and stays first in the control, including its focus-restore behaviour, per Jo's rule and the supporting SME point on custom date ranges.
> - **Scope-only window selection:** NO grain/interval toggle (the widget adopts the Time Window Module's window definitions only, not the full module contract) and NO prior-period comparison, per sign-off flag F3.
> - **Gone from the v1 table below:** the Department filter (cut 2026-07-21, see the Widget_Specs history), Pay Date anchoring, "Make this recurring", and per-department scheduling; none of these exist in the Final.
> - Every preset maps to its own distinct API parameter. In the mock, This month and This period coincide because the mock's fiscal calendar equals calendar months.

*(v1, superseded by the v2 block above — kept for history:)*

| Filter | Values |
|--------|--------|
| Pay Period | Weekly · Bi-Weekly · Monthly · Custom, anchored to a Pay Date field, with "Make this recurring" and "Set Pay Period separately per department" checkboxes |
| Department | All Departments · Finance · Admin · Ministry · Facilities |

Weekly/Bi-Weekly/Monthly presets are anchored to the selected Pay Date, not to today's date. "Make this recurring" and per-department scheduling are mockup-only for now — not wired to any real scheduling logic. **Department field needs backend confirmation** — the underlying `PRHistory`/`PRHistoryCompensation` tables don't show an obvious department field in the research; open item, not a design gap. KPI size shows Pay Period only.

## Data Table Sort
Fixed alphabetical by Department (all-departments view) or Category (single-department view), with a user toggle to switch to Amount descending — the Payroll/HR domain default.

## Drill-Through
**New feature**, not present in the old design: a link out to the full Payroll History module, filtered to the same date range.

## Refresh
Standalone icon, present at every size including KPI.

---

## Views (Switch View)

> **[v2 — 2026-07-27] This section is superseded by the built Final, Jo design.** The Final's view and scope model:
> - **Table (default):** Jo's table, sortable in every scope.
> - **Donut:** her blue-ramp donut with legend hover sync (hovering a legend entry highlights its slice, and the reverse).
> - **Detail shows both:** at Detail the table and the donut render together as two panels and the view toggle is hidden; below Detail one view shows at a time under the toggle.
> - **Scope system (replaces the v1 per-size top-N trims):** All distributions / By pay type, plus drilling into a single distribution in place with a context line stating what is being viewed; the table stays sortable in every scope, and the drill is not a modal and not a page jump.
> - **No comparison anywhere:** the v1 ▲/▼ % change badge below is not in the Final; sign-off flag F3 rejected current-vs-prior comparison for this widget and the Final respects that.
> - **No fetch:** presets, custom dates, scope, view, sort and drill are all instant client-side recomputes.
> - The empty state keeps its toolbar visible; exports are honest stubs with toast feedback.
> - Three sizes only, per General Widget Design Rules Rule 12; Small is cut in the Final (see What Got Cut). The A/B/C design options keep their old sizes.

*(v1, superseded by the v2 block above — kept for history:)*

### View 1 — Horizontal Bars *(default)*
One bar per compensation category, with per-department stacked segments and a shared legend (added 2026-07-16) when "All Departments" is selected. Scales cleanly regardless of category count.

### View 2 — Pie
Same data as a proportional pie — cleaner than bars when an organisation has few categories.

Period Comparison is no longer a separate view — current-vs-prior comparison is now shown via a ▲/▼ % change badge on every row, in every view (Bar, Pie, Table), so it doesn't need its own peer view anymore.

### View 4 — Data Table
Sort per Data Table Sort above.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Active view, top 3 categories only; Switch View available (added 2026-07-10, per direct instruction) |
| **Medium (2×2)** | Active view, top 5 categories; Switch View available |
| **Large (4×4)** | Active view, all categories + totals; Switch View available |
| **KPI (1×0.5)** | Headline: **Total Payroll Amount** for the selected period. Pay Period filter only. No download, no switch. |
| **Expanded** | Active view, full detail, all filters live in the modal |

---

## What Got Cut (and why)
- **[v2 — 2026-07-27] Small size, cut in the Final build per General Widget Design Rules Rule 12.** The Final ships three sizes; the mock's A/B/C design options keep their old sizes.
- **[v2 — 2026-07-27] All comparison features, cut per sign-off flag F3.** The ▲/▼ % change badge (and every other current-vs-prior element) is not in the Final; F3 rejected comparison for this widget and that rejection is respected, not worked around.
- **[v2 — 2026-07-27] Nothing lasting cut from the preset row.** For the record, the Final period preset set is: This month (default) / This period / This quarter / This year (rolling 12 months, Time Window Module definition) / All time, with Jo's Custom From/To date row kept first.
- **"Top category by amount" and "category with biggest % change" as KPI headlines** — both dropped in favour of a single **Total Payroll Amount** figure, for consistency with the rest of the dashboard's KPI pattern. Both original options also carried a "may need additional interaction beyond a static number, TBD" flag — a sign they weren't fully ready for a locked KPI tile anyway.

## Fine-Tuning Notes
- Department filter narrows all views to that department's payroll only
- Period Comparison view shows delta % next to each bar pair at Large size
- **[v2 — 2026-07-27] Built as the Final, Jo design:** Jo Lopez's payroll widget ported wholesale into the Final Check tab (the additive prF block beside `WRENDER[3]`; the A/B/C branches untouched, the Dashboard tab byte-identical), tagged v2.0 (`FC_VERSION[3]`) with "Final" and "Jo design" title badges. The one change from her design is the period preset row (see the Filters v2 block). Verification: 213 assertions in the per-widget Node DOM-shim driver, including 3-timezone runs and the focus-restore click path; browser-faithful CSS parse check with 0 dropped rules; final-check-rules.py 0 HIGH; W01 and W02 regression drivers green. Full detail (composition, owner decisions, mock data notes): see the 2026-07-27 "Final COMPLETE, tagged v2.0, Jo design" entry in [Widget_Specs/W03-Payroll-Distributions.md](../Step%203%20-%20Mock_Work/Widget_Specs/W03-Payroll-Distributions.md). Same day, the pay-type breakdown was evidenced as fully supported by the database with no schema changes: see `Step 5 - API documents/Payroll Distributions/Payroll Distributions - Pay Type Breakdown Analysis (proof).html` and the resolved finding 1 in the Step 6 reconciliation file.
