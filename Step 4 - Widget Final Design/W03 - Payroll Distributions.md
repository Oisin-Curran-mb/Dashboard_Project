**[v2.6, 2026-08-30, owner instructions] The standalone Employees view described in the v2.1 block below is CUT. The employee level is now nested inside the table, and Pay type is its own filter chip.** Five build tags landed after v2.1, v2.2 to v2.6 in `FC_VERSION[3]`:

- **v2.2, nested drill replaces the Employees view.** The view toggle is back to Jo's two segments, Table and Chart. A distribution row in the Table view expands to the employees paid in it, and each employee expands again to that person's pay types, so pay types are the LEAF ONLY and are reached through a person. This replaces the old "pick a distribution on the scope chip, see its pay types" table level. `prFEmpTable` and `prFAllEmployees` are gone (the latter deliberately, so a flat cross-org list of per-person pay has no route), replaced by `prFEmpBlock` plus `prFDistBlock` composed into `prFTableHTML`. `PRF_STATE` gains `prDistOpen`, and collapsing a distribution clears the `prEmpOpen` keys inside it. A stale `emp` view state falls back to the table. **The permission gate moved from the toggle segment onto the rows themselves**, where the sensitive data now sits: without `PRF_PAYROLL_PERM` a distribution row renders inert (no caret, no `role="button"`, no handler path) and the table degrades to the plain distribution totals it has always shown. This reorders Feargal's 2026-08-25 chain (he described distribution, then pay types, then employee, then breakdown) by direct owner decision, so pay types appear once, under the person they were paid to.
- **v2.3, Pay type became its own top-level filter and the export was consolidated to one.** See the Filters and Views v2.3 blocks below.
- **v2.4 to v2.6, export presentation only.** A single **Export to Excel** button (`btn naked sm`, leading download icon) sits at the right-hand end of the one caption row below the filter chips, rendered through `prFCapRow` so every data-bearing state carries exactly one export; it is suppressed in the empty state and at Glance. v2.5 made its styling byte-identical to W02's appointee-modal export (class list identical; per the build's own change record only the action data attribute and the title differ, as they do on every export button in this build), and v2.6 copied the `.btn` family into `.prf-root`, which is the styling the button had been missing.

*(v2.1, superseded in part by the v2.6 block above, kept for history:)*

**[v2.1 — 2026-08-25, Feargal call] Employee level added, permission-gated.** Feargal asked for the full chain: distribution group to pay types to an individual employee to that employee's pay breakdown, with export, and stated access is limited to users with payroll permission. Built as an **Employees** view; each employee row expands to their own pay breakdown by pay type, with export at both the list and the individual level. **`PRF_PAYROLL_PERM`** (default true) gates it at four points: the toggle segment, the view dispatch, every handler, and `prFEmpTable` itself, so an unauthorised viewer has no route to per-person pay and sees no dead control.

**Data note (Rule 11).** The mock had no employee data at all, only distribution x pay-type totals. Employees are therefore **generated deterministically** from those totals (seeded per distribution, 3 to 7 people, stable across re-renders) and allocated **in cents** with the remainder walked back onto real rows, so every employee's pay type sums **exactly** to the distribution x pay-type figure. The reconciliation is real; the individual names and headcounts are illustrative until the API exposes employee-level rows. Verified: 93-assertion driver, 0 failures, including cents-exact reconciliation for every distribution x pay type and the permission gate proven from all four directions.

**Terminology confirmed in the same call:** a distribution (or staff) group is an organisational grouping; a pay type is a component of pay such as regular, overtime, housing allowance or vacation.

# W03 — Payroll Distributions

**Module:** Payroll
**Status:** 🟢 Final design — locked · **v2 (2026-07-27): built Final, Jo design, tagged v2.0 in the build.** · **[v2.6, 2026-08-30] the build is now tagged `FC_VERSION[3]` = 2.6** (v2.1 employee level 2026-08-25, then v2.2 to v2.6 on 2026-08-30). Locked-doc rule: only version-tagged updates (v2, v3...) may modify this doc.
**Full history / rejected ideas:** [Widget_Specs/W03-Payroll-Distributions.md](../Step%203%20-%20Mock_Work/Widget_Specs/W03-Payroll-Distributions.md)
**Data source & formulas:** [Step 1 - Dashboard Research/03 - Payroll Distributions.md](../Step 1 - Dashboard Research/03%20-%20Payroll%20Distributions.md)
**Last verified against build:** 2026-09-02 via widget-final-check-audit (unattended continuation) against `FC_VERSION[3]` = 2.6, completing the 2026-08-30 pass that was interrupted before it could stamp this line. Every v2.2 to v2.6 claim added by that pass was re-verified by reading the build: `PRF_STATE` defaults (`range:'TM'`, `view:'table'`, `prDist:'all'`, `prPT:'all'`, `prSort:'amt-desc'`), the two-segment Table/Chart toggle with the stale `emp` state falling back to Table, the row-level `PRF_PAYROLL_PERM` gate, `prFCapRow` carrying the single `btn naked sm` Export to Excel button, the `.prf-root .btn` family added in v2.6, the two distinct no-data states, and the removed v2.0 scope-chip identifiers (`prFEmpTable`, `prFAllEmployees`, `prFPTFlat`, `prFPTTotals`, `prFDistBadge`, `prFScopeLabel`, `prFScopeMeta`, `prFScopeChip`, `pr-distcol`/`pr-dbadge` CSS), which survive only in tombstone comments. Previous: 2026-08-25 via build-final-widget (v2.1: 93-assertion Node DOM-shim driver, 0 failures); 2026-07-27 via build-final-widget (Final v2.0, Jo design: 213-assertion Node driver, 0 failures, final-check-rules.py 0 HIGH, browser-faithful CSS parse with 0 dropped rules).

> **[v2 — 2026-07-27]** NOTE: this doc still uses the pre-2026-07-27 template. It was deliberately skipped in the template upgrade pass (treated as Step 6-finished); the template upgrade is pending as its own later pass. Every v2 addition below follows the locked-doc rule as-is: version-tagged blocks only, nothing deleted, and superseded passages keep the original text underneath.

## Purpose

> **[v2 — 2026-07-27]** The built Final is Jo Lopez's payroll widget, ported wholesale into the Final Check tab with exactly one change (the period presets, see the Filters v2 block). On the pay-type list below: the pay-type breakdown is now evidenced as fully supported by the database, see `Step 5 - API documents/Payroll Distributions/Payroll Distributions - Pay Type Breakdown Analysis (proof).html`. Per that analysis, this Purpose's original fixed pay-type list framing is real: it matches the fixed `PR_HistoryCompensation.SubType` codes (1 to 10: Regular, OverTime, DoubleTime, Holiday, Other, Vacation, Sick, Personal, Misc., Other Pay). The labels the widget actually groups by, however, are org-defined distribution names from `PR_CompensationDistribution.Name`. Both levels are real (level 2: org-defined distributions; level 4: fixed SubType pay types), so the sign-off finding against this list is resolved with evidence rather than one side being wrong; see the reconciliation file's finding 1. The purpose statement below is otherwise unchanged.
Shows a breakdown of payroll amounts already paid out across a chosen date range, broken down by pay-type category (Regular, Vacation, OverTime, Sick, Double Time, Personal, Holiday, Misc, Other) — a post-payroll check of what went out, not a projection of what's owed.

## How Other Companies Fulfil This Purpose
- **Pie/donut breakdowns work only up to ~4-5 categories**; beyond that, bar charts are the recommended switch, since comparing bar length is easier than comparing pie slices ([The Bricks](https://www.thebricks.com/resources/guide-how-to-make-a-budget-pie-chart-in-excel)) — this is why **both a Bar and a Donut view are kept as peers** rather than picking one: the right default depends on how many compensation categories a given organisation actually has.
- Payroll dashboards specifically are recommended to pair a category breakdown with a **trend/comparison view over time**, not just a static snapshot ([Acciyo](https://www.acciyo.com/payroll-dashboard-examples-key-metrics-and-visuals/)) — this is the direct justification for keeping the **Period Comparison view** as a full peer, not a lesser third option.

**Net assessment:** the three-view structure (snapshot bar, snapshot donut, trend comparison) covers everything the sources recommend for this exact use case.

## Filters

> **[v2.6, 2026-08-30] Superseded again: the Final now has THREE filter chips, not one.** Per v2.3, the filter row is **Period / Distribution / Pay type**. The old single scope chip (All distributions / By pay type / a specific distribution) is split into two independent chips, so `PRF_STATE.prScope` is replaced by `prDist` and `prPT` and the two combine freely; the owner's stated use case, the total for overtime compared across distributions, is Distribution: All plus Pay type: Overtime, which yields one comparable row per distribution. Pay type filters AMOUNTS everywhere (distribution totals, employee totals, the pay-type leaf) but deliberately NOT the allocation, so a person's Regular Pay figure never moves because Overtime was filtered and the cents-exact reconciliation survives. Changing either chip clears `prDistOpen` and `prEmpOpen` so no caret survives pointing at a row the filter no longer lists. The Pay type popover offers only pay types that actually paid out in the selected period, so no option can empty the table, and a filter pair that legitimately matches nothing gets its own "Nothing matches these filters" state naming the combination, distinct from the "No payroll runs in this range" state. The period control below is unchanged.
>
> *(v2 filter description, superseded above, kept for history:)*
>
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

> **[v2.6, 2026-09-02, audit continuation] Superseded by the built Final since v2.0.** The build uses Jo's sortable column headers with amount descending as the default (`PRF_STATE.prSort` starts at `'amt-desc'`); text columns sort ascending on first click and every click flips the active column. There is no fixed alphabetical rule and no separate sort toggle control. The v2.0 pass superseded the Filters and Views sections but never marked this one; this note only records what is built. Reconciliation finding 4 (Jo's flag F6, amount sort for trimmed top-N subsets) keeps its own status in the reconciliation file and is not settled here.

*(v1, superseded by the note above, kept for history:)*

Fixed alphabetical by Department (all-departments view) or Category (single-department view), with a user toggle to switch to Amount descending — the Payroll/HR domain default.

## Drill-Through

> **[v2.6, 2026-09-02, audit continuation] Superseded by the built Final.** No link out to the Payroll History module exists in the build at any Final version through v2.6. Drilling is in widget: the v2.0 in-place scope drill, replaced since v2.2 by the nested table drill (distribution to its employees to that person's pay types). Whether an external drill route should still exist is reconciliation finding 3 (Jo's flag F8, in-widget overlay rather than a link out), which keeps its own status in the reconciliation file; this note only records what is built and does not settle that finding.

*(v1, superseded by the note above, kept for history:)*

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
>   - **[v2.6, 2026-08-30] Superseded: the "By pay type" GROUPING is dropped as redundant** now that Pay type is its own independent filter chip (v2.3); `prFPTFlat`, `prFPTTotals`, `prFDistBadge`, `prFScopeLabel`, `prFScopeMeta` and `prFScopeChip` are removed with it, along with the `pr-distcol` / `pr-dbadge` CSS, while `PRF_DIST_COLORS` and `.pr-dot` stay for the distribution popover and the donut. `prFSortRows` loses its `dist` and `pt` sort keys. In place of that grouping, the table now carries a **nested drill**: a distribution row expands to the employees paid in it, and each employee expands to that person's pay types (v2.2), so pay types are the leaf and are reached through a person. The drill is still in place, still not a modal and not a page jump, and the context line under the total now names only the filters actually narrowing the figure rather than restating the defaults.
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
- **[v2.6, 2026-08-30] Build state as at this doc pass, `FC_VERSION[3]` = 2.6.** The rendered Final is: three filter chips (Period / Distribution / Pay type), a two-segment view toggle labelled **Table** and **Chart** (the Chart segment is the blue-ramp donut; "Chart" is the on-screen label, "Donut" is the description used elsewhere in this doc), one nested Table drill of distribution to employees to that employee's pay types, one **Export to Excel** button on the caption row below the chips, Detail still rendering table and donut side by side with the toggle hidden, and two distinct no-data states ("No payroll runs in this range" and "Nothing matches these filters"). `PRF_STATE` defaults are `range:'TM'`, `view:'table'`, `prDist:'all'`, `prPT:'all'`, `prSort:'amt-desc'`. The v2.2 to v2.6 change record lives in the `FC_VERSION[3]` comment in `Dashboard Widget Mockups.html`; note the Final Check tab's own Logic prose and `Widget_Specs/W03-Payroll-Distributions.md` both still stop at the 2026-07-27 v2.0 build and have not been extended for v2.1 to v2.6.
