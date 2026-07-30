# W02 — Pension Plans

**Module:** Finance
**Status:** 🟢 Final design — locked · **v2 (2026-07-27): built Final, Jo design, tagged v2.0 in the build.** Locked-doc rule: only version-tagged updates (v2, v3...) may modify this doc.
**Full history / rejected ideas:** [Widget_Specs/W02-Pension-Plans.md](../Step%203%20-%20Mock_Work/Widget_Specs/W02-Pension-Plans.md)
**Data source & formulas:** [Step 1 - Dashboard Research/02 - Pension Plans.md](../Step 1 - Dashboard Research/02%20-%20Pension%20Plans.md)
**Confluence dossier:** none yet
**Last verified against build:** 2026-07-27 via build-final-widget (Final, Jo design: 175-assertion Node driver + final-check-rules.py + CSS parse check + click-path test). Previous: 2026-07-20 via widget-final-check-audit (see 00 - INDEX.md)

**Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a named written source · `[TO CONFIRM]` assumed, with a named owner to confirm. Marks appear only on the sections added in the 2026-07-27 template upgrade; pre-existing text is intentionally unmarked.

## Purpose

> **[v2 — 2026-07-27]** The built Final is Jo Lopez's Widget Container Demo pension design (its pen block) with owner deltas layered on top; her sortable plan table is the Final's default Table view. The purpose statement below is unchanged and still holds.

Gives a clear overview of how much is being contributed annually across each pension plan type, with the ability to filter by church district, and lets users drill into individual appointees per plan.

## How Other Companies Fulfil This Purpose
No named competitor product specifically benchmarks pension-contribution-by-district reporting — this is a narrower, org-specific slice than most commercial benefits dashboards cover. The closest applicable standard comes from general benefits/pension analytics (U.S. Department of Labor pension bulletins) and standard benefits-dashboard practice:

- **Donut/pie for proportional split** is standard when the question narrows to a single dimension (plan type only, ignoring district) — this is now the default view, matching the original legacy widget.
- **Grouped/stacked bar charts** are the standard way to compare a benefit metric across more than one dimension at once (here: district × plan type) ([U.S. DOL](https://www.dol.gov/agencies/odg/visualization-gallery/ebsa-private-pension-plans)) — kept as the Switch Chart Type alternate for when the question is "who costs what" across both dimensions.
- A **summary table** is the universal reporting companion across every benefits-dashboard source reviewed.

**Net assessment:** this widget's design is reasonable and standard for the general pattern, even though no direct named competitor covers this specific district/plan-type combination — there's no evidence a materially better structure exists elsewhere to benchmark against.

**Changed on direct instruction (2026-07-09):** the default view was originally set to Grouped Bar by District (see "Net assessment" language above, superseded). Reversed back to Pie by Plan Type as the default — matching the original legacy widget — with Grouped Bar moved to the Switch Chart Type alternate. See Views and Size behaviour below for the current locked shape.

## Data Contract

*(Added 2026-07-27, template upgrade. This section restates and points to facts already recorded elsewhere in this doc; the original sections below remain authoritative and untouched.)*

| Field / value shown | Source | Formula / rule | Evidence |
|---|---|---|---|
| Annual contribution per plan type / district | Linked Step 1 doc (see header, Data source & formulas) | Contributions are annual figures with no sub-year breakdown in the source data (see Filters, Fiscal Year note) | [DOC, this doc] |
| KPI headline | Same dataset | Total Annual Contribution ($) (see Size behaviour, KPI row) | [BUILD] |
| Church District dimension | Dynamic list | "All Districts" plus a dynamic list (see Filters) | [DOC, this doc] |
| Plan Type dimension | Dynamic list | Plan-type names are user-configurable elsewhere in the system; the specific values (Defined Benefit, 403(b), etc.) are illustrative, not fixed; confirmed correct as designed (see Filters) | [DOC, this doc] |
| Data freshness | n/a | The underlying data is an "active as of today" snapshot, not year-scoped (see Filters, Fiscal Year note) | [DOC, this doc] |

Headline number's exact math (how the total is summed across districts/plans): *Not yet specified — needs a pass.*
Rounding, currency, and locale rules: *Not yet specified — needs a pass.*

## Widget States

*(Added 2026-07-27, template upgrade. Rows are filled only where this doc already states the behaviour.)*

| State | Behaviour |
|---|---|
| No module rights / entitlement | *Not yet specified* |
| Empty (org has no data at all) | **[v2 — 2026-07-27]** Jo's "No active pension appointments" empty state: an icon, that one-line message, and guidance pointing the user to the Pension Billing module; the Glance card shows a compact variant of the same message. Every total is computed from the appointee rows (never a hardcoded figure), so an empty dataset renders this state rather than a zero or broken chart. [BUILD] |
| Partial (some districts/plans missing) | *Not yet specified* |
| Loading | **[v2 — 2026-07-27]** Loading skeleton for about 800ms, triggered only by a district change (a spinner also rides in the district chip while it loads); sort, view toggles and the drill are instant client re-renders, never a load. [BUILD] |
| Error / API failure | *Not yet specified* |
| Stale data | The data is an "active as of today" snapshot (see Filters) [DOC, this doc]; refresh icon is present at every size including KPI (see Refresh section) [BUILD]; any "data as of" signal and what refresh actually does: *Not yet specified* |

## Interaction Spec

*(Added 2026-07-27, template upgrade. Pointers only; the original entries remain the source entries.)*

> **[v2 — 2026-07-27] This section is superseded by the built Final, Jo design.** The v2 interactions:
> - **District chip:** opens a listbox popover (see Accessibility); picking a district is the ONLY fetch (about 800ms skeleton, spinner in the chip); everything else is an instant client re-render. The chip's label always shows the current district.
> - **Table headers:** every header sortable. First click: Plan sorts ascending; Appointees and Annual amount sort descending. Clicking again toggles direction; annual amount descending is the default sort.
> - **Drill:** every table row, every pie slice's legend entry, and every grouped bar opens the drill modal: the appointees on that plan (Appointee / Church organisation / District / Annual amount), with a footer count and total. The widget's district filter carries into the drill; a grouped bar drills to that plan AND that district specifically.
> - **Two-export contract (Jo's):** the widget's 3-dot menu exports the on-screen plan summary (CSV / Excel / PDF); the drill modal's own Export to Excel button exports the appointee detail. In the mock both are honest stubs with toast feedback; neither fakes a download.
> - **View toggles:** 3-way Table / Pie / By district at Explore (Table default); 2-way Pie / By district on the Detail right panel. Segments carry aria-pressed and plain-language tooltips; toggling is a client re-render, never a fetch.

*(v1, superseded by the v2 block above — kept for history:)*

- Church District filter change: rerenders the active view without a page reload (see Fine-Tuning Notes, first entry). [BUILD]
- Selecting a specific Plan Type: the pie's slicing dimension switches to District, showing that one plan's spread across districts (see Views, View 1, and Fine-Tuning Notes entry 2026-07-09). [BUILD]
- Click on a plan: opens the appointee panel, an in-widget view change, not a page link (see Drill-Through section). [BUILD]
- KPI card title: reflects the active Church District/Plan Type filters, truncates with "…" and shows the full text on hover if too long for the card (see Size behaviour, KPI row). [BUILD]
- Hover/tooltip content per chart element (pie slices, bars): *Not yet specified — needs a pass.*
- Keyboard / focus behaviour for interactive controls: *Not yet specified — needs a pass.*

## Filters

> **[v2 — 2026-07-27] This section is superseded by the built Final, Jo design.** The Final has exactly one filter control: the **district filter chip** (All Districts plus the dynamic district list), opening a listbox popover. A district change is the ONLY fetch trigger: it shows the loading skeleton with a spinner in the chip for about 800ms; sort, view switches and the drill are instant client re-renders. There are no other filters (the v1 Plan Type filter is not in the Final; the plan-type dimension is read through the views and the drill instead), and deliberately no Time Window Module: this widget is a snapshot of the pension appointments active today, not a time series, so there is no window or interval to pick.

*(v1, superseded by the v2 block above — kept for history:)*

| Filter | Values |
|--------|--------|
| Church District | All Districts · dynamic list |
| Plan Type | All Plans · dynamic list — plan-type names are user-configurable elsewhere in the system, the same pattern used for account types and leave types on other widgets in this project. The specific values (Defined Benefit, 403(b), etc.) are illustrative, not fixed. **Confirmed correct as designed.** |

**Fiscal Year filter — removed.** The underlying data is an "active as of today" snapshot, not year-scoped — adding Fiscal Year would need new date-scoping logic the old design never had, and there's no confirmed need for it. No Period View filter either — contributions are annual figures with no sub-year breakdown in the source data. KPI size shows no time filter (neither Fiscal Year nor Period View apply here).

## Data Table Sort
Fixed — Church District, alphabetical. Not user-changeable.

## Drill-Through
Click-to-open appointee panel is an in-widget view change, not a page link — kept as-is for detail. A genuine link to the Pension Billing source page is confirmed needed but **has no target page/URL yet** — open item.

## Refresh
Standalone icon, present at every size including KPI.

---

## Views (Switch Chart Type)

> **[v2 — 2026-07-27] This section is superseded by the built Final, Jo design.** The Pie default stated below is also superseded, by owner decision: **Table is the default view** in the Final. Three views over the same filtered data:
> - **Table (default):** Jo's sortable plan table: a colour dot and plan name, appointee count, and annual amount per row; share bars at Explore and a quiet share percent at Detail; footer reading "Total annual contribution (N appointees)". Plan sorts ascending on first click, appointee count and annual amount sort descending first; amount descending is the default.
> - **Pie by Plan Type:** Jo's donut, promoted from her chart toggle to a top-level view: centre total, a legend showing each plan's money and percent, every slice's legend entry drillable.
> - **Grouped Bar by District (new):** built in her visual language (warm-neutral tracks, her amethyst plan ramp so the same plan keeps the same colour across table dots, slices and bars; values as text and sr-only). District groups along the x-axis, one bar per plan in each group, a group total under each district; each bar drills to that plan AND that district.
>
> **Explore shows one view at a time** under a 3-way Table / Pie / By district toggle (Table default). **Detail is two synced panels:** the table always on the left, the active chart on the right under a 2-way Pie / By district toggle, both panels always reflecting the same district filter and sort. **Glance** is the KPI card: the total annual contribution, an appointee-count pill with a plain-language tooltip, and a "contributed a year across N plans" caption carrying the district scope; it has a compact empty variant.
>
> **Size behaviour (v2):** three sizes only, per General Widget Design Rules Rule 12 (12-column grid, 48px rows, 16px gaps). Small is removed for the Final; the mock's A/B/C design options keep their old sizes.
>
> | Size | Proportions | Behaviour |
> |---|---|---|
> | **Glance** | 3 columns × 176px | KPI card: money, appointee pill, caption; compact empty variant |
> | **Explore** | 6 columns × 496px | Headline, district chip, one view under the 3-way Table / Pie / By district toggle |
> | **Detail** | 12 columns × 560px | Two synced panels: table left, active chart right under a 2-way Pie / By district toggle |

*(v1, superseded by the v2 block above — kept for history:)*

### View 1 — Pie by Plan Type *(default)*
Proportional split across plan types (Defined Benefit / Defined Contribution / 403(b)), ignoring district — matches the original legacy widget. Shown at every size, including Small.

**When a specific Plan Type is selected**, the pie's slicing dimension switches to **District** instead — since a plan-type breakdown of a single already-selected plan type would just be one 100% slice. It shows that one plan's contribution spread across Central/North/South/East/West. (Fixed 2026-07-09 — previously rendered a useless single slice.)

### View 2 — Grouped Bar by District
Bars per district, coloured by plan type — the two-dimension view, for when the question is "who costs what" across both district and plan type. Stacked at Small (space-constrained), side-by-side at Medium/Large.

**Switch Chart Type is now available at every size, including Small** — reversing the earlier "no Switch View at Small" rule that applied when Grouped Bar was the default.

### Summary Table — no longer a separate switchable view
At Large only, the Summary Table (totals per district and per plan type, fixed sort: District alphabetical) is shown together with whichever chart is active, not as a third competing Switch Chart Type option. Both the chart and the table read the same Church District/Plan Type filters, so they always agree.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Active chart (Pie by default), Switch Chart Type available |
| **Medium (2×2)** | Active chart, all districts/full data, legend; Switch Chart Type available, now including a standalone Data Table option (added 2026-07-09) — selecting it replaces the chart with the table, since Medium doesn't have room for both at once |
| **Large (4×4)** | Active chart + Summary Table shown together, full detail; Switch Chart Type available (chart-type only — Table is not a separate menu item here since it's always shown) |
| **KPI (1×0.5)** | Headline: **Total Annual Contribution ($)**. No filter (Fiscal Year removed, no other time dimension applies). No download, no switch. Card title reflects the active Church District/Plan Type filters (added 2026-07-09): "Overall Contribution" when both are at their "All ..." default, the selected district(s) alone when only District is narrowed, the selected plan type(s) alone when only Plan Type is narrowed, or "[District] by [Plan Type]" when both are. Truncates with "…" and shows the full text on hover if too long for the card. |
| **Expanded** | Active chart + table, full detail, all filters live in the modal |

---

## Accessibility

*(Added 2026-07-27, template upgrade.)*

> **[v2 — 2026-07-27]** Filled by the built Final, Jo design:
> - Chart values exist as text: every table row, pie slice and grouped bar carries an sr-only text equivalent in the DOM; values are never hover-only or colour-only.
> - The district popover is a real listbox (role="listbox" with option semantics), opened from a chip that carries aria-haspopup, aria-expanded, and an aria-label announcing the current district.
> - The view toggles carry aria-pressed; the drill modal uses role="dialog".
> - Colour is never the sole signal: each plan's money value appears as text beside its colour dot, slice or bar, and the same plan keeps the same colour across the table dots, pie slices and bars so the encodings reinforce each other.

*(v1, superseded by the v2 block above — kept for history:)*

- Colour is never the only signal: pie slices and bars are distinguished by colour per plan type/district; an explicit non-colour pairing rule (labels, patterns, or direct value text on the chart) is *Not yet specified — needs a pass.*
- Chart values as text in the DOM: the Summary Table (Large, alongside the chart) and the standalone Data Table option (Medium) expose totals as text [BUILD]; sr-only or text equivalents for the chart views themselves are *Not yet specified — needs a pass.*
- Table semantics (`th`/scope) and keyboard reachability of interactive controls (Switch Chart Type, appointee panel): *Not yet specified — needs a pass.*

## What Got Cut (and why)
- **[v2 — 2026-07-27] Jo's largest-size-only chart toggle arrangement, cut in the Final build.** Her demo kept the table as the body and offered the chart toggle only at its largest size; replaced by the 3-view model (Table / Pie / By district at every size above Glance: a 3-way toggle at Explore, the synced table-plus-chart panels with a 2-way chart toggle at Detail).
- **[v2 — 2026-07-27] Small size, cut in the Final build per General Widget Design Rules Rule 12.** The Final ships three sizes (Glance, Explore, Detail); the mock's A/B/C design options keep their old sizes.
- **"Top district by cost" and "dominant plan type + %" as KPI headlines** — both dropped in favour of a single **Total Annual Contribution** figure. These view-specific insights are still visible once a user opens Medium/Large size and picks a view; they're not right for the single-number KPI tile.

## Sign-off Readiness

*(Added 2026-07-27, template upgrade. Rows are the open/pending items this doc already flags inline; the original inline mentions are untouched and remain authoritative.)*

| # | Open item | Type | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | Drill-through link to the Pension Billing source page: confirmed needed but has no target page/URL yet; flagged inline as an open item (see Drill-Through section) | field / target URL | TBD | Not stated as blocking; the in-widget appointee panel ships as-is while the page link stays open |

**[v2 — 2026-07-27]** Row 1 remains open and is unaffected by the Final build: the Final's drill modal is still an in-widget view change, not a page link, and the Pension Billing target URL is still unprovided.

This doc has 1 open item; it is not sign-off-ready until this table is empty or every row is explicitly accepted as a known risk. (The Plan Type value list is not listed here: this doc records it as "Confirmed correct as designed", see Filters.)

## Fine-Tuning Notes
- District filter rerenders the active view without a page reload
- **Confirmed (2026-07-09):** selecting a specific Church District (Plan Type left at All Plans) narrows the Pie to that district's plan-type breakdown — the mock data keeps a dedicated single-district bucket per district rather than one shared "all districts" bucket, so this direction was verified working, not something that needed fixing.
- **Fixed (2026-07-09):** selecting a specific Plan Type used to render a single 100%-share slice for that one plan — not useful. The pie now slices by **district** instead of plan type whenever a specific Plan Type is selected, showing that one plan's spread across Central/North/South/East/West. Grouped Bar and the Data Table were unaffected — they already broke totals down by district.
- **[v2 — 2026-07-27] Built as the Final, Jo design:** composed from Jo Lopez's Widget Container Demo pension design (its pen block) plus one new view (Grouped Bar by District, in her visual language), with the owner deltas recorded in this doc's v2 blocks; tagged v2.0 in the build with "Final" and "Jo design" title badges. Verification: 175 assertions in the per-widget Node DOM-shim driver, a browser-faithful CSS parse check (0 dropped rules), a green click-path test, final-check-rules.py 0 HIGH, and this widget's old F4 accessibility finding fixed (see the Accessibility v2 block). Data note: Jo's source comment quotes a 55,212.43 total, but her five plan totals sum to 48,252.43, which is what her own demo renders and what the Final renders; the build computes every total from the appointee rows, never from a hardcoded figure. Full detail (composition, owner decisions, the data correction, still-open items): see the 2026-07-27 "Final COMPLETE, tagged v2.0, Jo design" entry in [Widget_Specs/W02-Pension-Plans.md](../Step%203%20-%20Mock_Work/Widget_Specs/W02-Pension-Plans.md).
