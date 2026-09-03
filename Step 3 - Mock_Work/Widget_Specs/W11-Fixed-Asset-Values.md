# W11 — Fixed Asset Values

**Module:** Finance  
**Status:** ✅ Minor tweaks  
**Research doc:** [11 - Fixed Asset Values.md](../../Step 1 - Dashboard Research/11 - Fixed Asset Values.md)
**General rules:** [General Widget Design Rules.md](General%20Widget%20Design%20Rules.md)

## Purpose
Shows the financial values of the organisation's fixed assets, broken down by a chosen grouping. Users control how assets are grouped, which specific group to look at in detail, and which of five financial measures to focus on. *(Corrected — the earlier draft collapsed this to a single fixed category + an invented depreciation-method filter; see note below.)*

---

## Purpose & Competitive Fit Check (Phase 1)
**Industry standard:** fixed-asset dashboards commonly use pie charts by class/category alongside a full lifecycle table (Beginning Amount, Acquisitions, Depreciation, Disposals, Net Book Value), with filters by year/class/location ([SlideTeam](https://www.slideteam.net/blog/must-have-fixed-assets-dashboard-templates-with-examples-and-samples), [GlobalData365](https://globaldata365.com/fixed-assets-dashboard/)).

**Fit-check:** the file's own reasoning for Option A (bars instead of pie, because Group By can have many values like Room) is well-supported by the standard, which favours pie only for a *small* category count (Class) — bars scale better for the higher-cardinality dimensions this widget also supports. Option B (Donut, closest to old design) remains the right fit specifically when Group By is a low-cardinality dimension like Class. Option C (Asset Detail Table) matches the standard lifecycle-table companion. This is a case where the right chart genuinely depends on which Group By is active — a strong candidate for Phase 2's "swap between views for different purposes on the same dataset" approach, rather than picking one overall winner.

---

## ⚠️ Major mismatch found and resolved this session

Old design's real complexity is **three cascading dropdowns**, not a single category filter:

1. **Group By** — a fixed set of 6 system-level grouping dimensions: Class, Building, Room, Asset Account, Accumulated Depreciation Account, Expense Account.
2. **Specific Group** — the actual values available here are **fully dynamic**, sourced from whatever the organisation has set up elsewhere in the system for that dimension (e.g. their own list of Buildings, their own Room records, their own Class list — entered on other pages/tables and brought into this widget). Changing Group By resets this dropdown. Unassigned items show as "not assigned."
3. **Financial Measure** — which of 5 figures to lead with: Capitalized Value, Cost, Depreciable Value, Accumulated Depreciation, Net Value. This picks the pie chart's metric *and* the table's lead column.

**Decided this session:** preserve this full 3-dropdown system as the foundation — it's what makes the widget genuinely useful (grouping by Building or Room, not just a fixed Class-style category, and choosing which financial figure matters for the task at hand). The earlier draft's invented **"Depreciation Method" filter (Straight Line/Declining Balance) is dropped** — nothing in the real data supports it; depreciation method isn't a user-facing toggle in the old design, and there's no confirmed field for it.

Options A/B/C below are now different **visual treatments of this same underlying filter system**, not different data models.

## Filter Options
| Filter | Values |
|--------|--------|
| Group By | Class · Building · Room · Asset Account · Accumulated Depreciation Account · Expense Account |
| Specific Group | Dynamic — depends on Group By; values come from the organisation's own records for that dimension |
| Financial Measure | Capitalized Value · Cost · Depreciable Value · Accumulated Depreciation · Net Value |

All three selections are saved per user and persist across sessions, matching old design.

**KPI size (3-dot menu):** This widget has no time-based filter at all (not even in the old design) — the same kind of exception as W05/W10. **Decided:** the KPI tile ignores Group By/Specific Group/Financial Measure entirely and always shows one fixed, universal figure (see each option's KPI row below) — flagging this as a design decision, not a Hard Rule 1 default, since there's no "time" dimension to fall back to.

## Data Table Sort
Fixed — by Tag # ascending (the natural key for an asset register). Not explicitly stated in the old design's Purpose doc, so flagged as a proposed default rather than a confirmed carry-over — confirm before build.

## Drill-Through
No drill-through — matches old design (confirmed view-only, no drill-down or navigation away).

## Refresh
Standalone icon on the card (not a 3-dot menu item), present at every size including KPI.

---

## Option A — Group Bars *(Keep/Refresh, renamed from "Category Bars")*

**Chart:** Horizontal bar per group (within the selected Group By dimension) showing the selected Financial Measure — replaces the old pie chart with bars, better suited to dimensions with many values (e.g. Room, where a pie chart would get crowded)  
**Views available:** Bar (default) · Table  
**Improvement note:** Bars scale better than a pie when Group By is set to something with many values (Room, Asset Account).

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Top 3 groups by the selected Financial Measure |
| **Medium (2×2)** | All groups (within the selected Group By), single measure |
| **Large (4×4)** | All groups + the individual-asset table for the selected Specific Group (Tag #, Name, all 5 measures, selected measure's column shown first), table toggle |
| **KPI (1×0.5)** | Headline: **Total Net Value** across all fixed assets, org-wide — fixed regardless of Group By/Specific Group/Financial Measure selection (see note above). No download, no switch. |
| **Expanded** | Same as Large, all three filters live inside the modal |

---

## Option B — Donut by Group *(Improve, matches old design's actual pie chart)*

**Chart:** Donut showing the selected Financial Measure's distribution across all groups (within the selected Group By dimension) — groups with a zero value for the measure are excluded, matching old design  
**Views available:** Donut (default) · Table  
**Improvement note:** Closest to the original design's actual chart, just restyled as a donut.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Donut only |
| **Medium (2×2)** | Donut + legend |
| **Large (4×4)** | Donut + legend + individual-asset table for the selected Specific Group, table toggle |
| **KPI (1×0.5)** | Headline: **dominant group + its % of the selected Financial Measure's total** (e.g. "Main Campus Building: 61% of Net Value"). No download, no switch. |
| **Expanded** | Same as Large, all three filters live inside the modal |

---

## Option C — Asset Detail Table *(Redesign, renamed from "Asset Cards")*

**Chart:** Table only — individual assets within the selected Specific Group, Tag # · Name · all 5 financial measures (selected measure's column shown first, matching old design), totals row at bottom  
**Views available:** Table (default) · Bar (of the selected group's assets, by the selected measure)  
**Improvement note:** Closest to old design's table half — best for detailed financial review of one specific group at a time.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 3 rows (fixed sort: Tag # ascending), rows scroll internally, header fixed |
| **Medium (2×2)** | 5 rows, same sort/scroll pattern |
| **Large (4×4)** | Full table for the selected Specific Group + totals row, same sort/scroll pattern |
| **KPI (1×0.5)** | Headline: **Total Net Value** across all fixed assets — same fixed figure as Option A's KPI, for consistency across all three options at this size. No download, no switch. |
| **Expanded** | Same as Large, all three filters live inside the modal |

---

## Fine-Tuning Notes
- ~~Depreciation method filter changes the calculated book value for all options~~ — dropped, see note above.
- The selected Financial Measure's column/bar should always be visually distinguished as the "lead" figure (matches old design's "measure's column shown first" behaviour)
- Buildings and Rooms (and other Group By dimensions with many values) should default sensibly when a chart would otherwise be too crowded — carries forward the reasoning that motivated Option A's bar-over-pie choice


---

## 2026-07-23 — Create Mock Designs run (fragment/assembler flow): 3 options rebuilt against real data

Built with the revised Create pipeline — three option renders as isolated fragment files merged by `assemble-mock-widget.py`. **Important correction:** an earlier draft this session was written against a fabricated `groupBy`/`assets` data shape that does **not** exist in the real `MOCK_DATA.series[11]`; Verify caught it (the render would have crashed). This entry documents the corrected build against the **actual** `series[11]`, which is per-**Asset Category** rows with `orig` (original value), `depn` (accumulated depreciation) and `rate` (annual depreciation rate) — no per-asset list, no multi-account grouping. Net Book Value is derived as `orig − depn`; % Depreciated as `depn / orig`. Prior dated entries above are unchanged.

### Option A — Category Value Bars *(Keep/Refresh — Restyled Original)*
One horizontal bar per asset category, length = Net Book Value (`orig − depn`), restyled from the legacy bar treatment. Table view shows Original, Accumulated Depreciation and Net with a totals row. Views: Value Bars (default) / Table.

### Option B — Depreciation Lifecycle *(Improve — Competitor Match)*
A Total Original / Accum. Depreciation / Net summary strip above a per-category lifecycle table that adds **% Depreciated** and annual **Rate** columns; Cards view as the alternate. The class-breakdown-plus-lifecycle-table pattern fixed-asset dashboards standardise on (SlideTeam / GlobalData365). Rule 10 second dimension: the %-depreciated and rate breakdown, which the value-only view doesn't surface. (Small size checks the view before rendering, so the Table/Cards toggle is live at every size — no dead control.)

### Option C — Depreciation Progress *(Redesign — Maximum Freedom)*
Reframes the widget around how far each category has depreciated: a **% Depreciated bar** (`depn/orig`) per category, sorted most-depreciated first, coloured by the category's own colour, with annual rate available in the Table view. A genuinely different lens (progress, not dollar value). Views: Progress Bars (default) / Table.

### Rules 8/9
Per-option filter scoping via `fk=wid+'-'+opt` in `WRENDER[11]`; shared `_renderFltBody`/`applyFilter` branches extended to include `wid===11` (4/5/6/9/10 intact). KPI/Medium/Large render for all three; **Small retained for all three**. KPI = Total Net Book Value across all categories (fixed, filter-independent).

### Rule 11 — data caveats (documented here, not shown on-screen)
The real data supports only Asset Category / Original / Accumulated Depreciation / Rate. The legacy doc's richer filter model (Group By: Asset/Accum-Depn/Expense Account; a cascading Specific Group; a five-measure Financial Measure selector) is **not** backed by the current data and is not offered — "Asset Category" is a flat stand-in, as the pre-existing `filters[11]` comment already flags. A prior invented "Depreciation method" (Straight Line/Declining Balance) filter that multiplied figures by a hardcoded factor was also left out. None of this is surfaced on the mockup; the cards render clean.

### Where written
`Dashboard Widget Mockups.html` — `WRENDER[11]` (scaffold + 3 branches), `MOCK_DATA.options[11]`, the three `opt-11-*` cards, and the shared filter-scoping branches. `mock-data.master.js` re-synced for `options[11]` (`series[11]` unchanged — no fabricated data added). Final Check tab `#fc-widget-11` not edited (known shared-render carryover). Built via `_build/W11/` fragments + `assemble-mock-widget.py`.

---

## 2026-08-30 — build-final-widget run: Final (option F) is Jo's faF build, ported 1-to-1, then made reachable and consistent

Run in four passes: the port itself (v2.0), a reachability fix (also v2.0), the section chrome (v2.1), and two defects the Phase 3 driver found (v2.2). Owner direction for the whole run was **"ok just copy jos 1 to 1 and then leave it like that"** / **"fitting with our current style and setup"**, so this is a port rather than a composition of A/B/C.

### Composition sheet (confirmed by the standing 1-to-1 instruction, not re-litigated)

| Component | Source | Why |
|---|---|---|
| Asset register (12 assets, FA- tag numbers) | Jo's `FA_ASSETS` | Her build is the only source with per-asset records; A/B/C are category-level |
| Group By, 6 dimensions | Jo's `FA_DIMS` | Matches the locked doc's six dimensions exactly |
| Specific Group (dependent field) | Jo's `faGroupOptions` | The doc's dependent-field requirement; repopulates on dimension change |
| Financial Measure, 5 figures | Jo's `FA_MEASURES` | Matches the doc's five money figures exactly |
| Per-asset table | Jo's `faTable` + `faTableAssets` | The doc's View 3, Asset Detail Table |
| Donut | Jo's `faPie` | Shown beside the table at Detail only, as in her build |
| Glance card | Jo's kpi branch | Measure total plus asset count plus dimension context |
| Empty state, loading skeleton | Jo's `faEmptyState`, `faSkeletonBody` | Ported unchanged |
| Filter chips and popovers | Jo's `faChip`, `faControls`, `faOpenPop` | Ported unchanged |
| Size ladder Glance / Explore / Detail | Rule 12 | Her `kpi` / `wide` / `xwide` tiers map straight onto it |
| Wiring only (prefixes, state, handlers) | Ours | `faF`/`FAF_` prefixes, `FAF_STATE` replacing her registry `find(id)`, `FAF_POP`/`FAF_TIMER`, `data-faf` for the delegated handler |
| CSS | Resolved against this file's existing roots | 42 shared families resolved from `.arf-root`/`.prf-root`/`.penf-root` etc., per "fitting with our current style and setup" |
| A/B/C branches | Untouched | Kept for comparison; they still carry the flat Asset Category filter |

### Recorded conflicts

- **Conflict 1** (doc's filter model not built) and **Conflict 2** (Asset Detail Table / View 3 not built) — **closed by the owner 2026-08-30** as resolved by Jo's build. Both ticked in `Final Check - Items Needing Your Review.md` with dated notes.
- **Conflict 3** (Data Table Sort, proposed Tag # ascending) — **left open**. Jo's build does not sort that way and 1-to-1 was the instruction, so adopting the doc's proposal would have meant changing her build on an unconfirmed decision. Recorded in the widget's Logic note as open.

### What v2.1 and v2.2 fixed, and why the port alone was not enough

The port's own 26 checks all passed while the feature was invisible in the browser. Each called `faFRender()` directly in a Node shim; none asked whether the **page** could reach it. It could not: `fcInitState(11,'A')` meant `FC_STATE[11].opt` was never `'F'`, there was no `#fc-optsw-11` switcher, and no `.fc-fmode` block. The lesson recorded for future runs: **verifying the unit is not verifying the feature.** The v2.2 driver's section 0 now executes the real `WRENDER[11]` through the same call shape `fcRenderSlot` uses and asserts the Final is what comes back.

Then, found by that driver:

1. **The section chrome still described the pre-port widget** (v2.1). The blurb told the reader in bold that the doc's filter model "isn't built", and the Logic panel carried both conflicts as open Flags plus an A/B/C description reading as current. All corrected, with the A/B/C text scoped to A/B/C rather than deleted.
2. **A dead control** (v2.1). The "Switch chart type" menu offered Group Bars / Donut by Group / Table and called `fcSetView(11,...)`, but the faF block contains no view state at all: Jo's composition is size-driven. Her build has no bar chart, so the menu is hidden in F mode rather than wired to a view she never drew. A/B/C keep it.
3. **`FAF_STATE` declared four keys nothing reads** (v2.2). It was hand-authored during the port while every access was rewritten by regex, so it declared `faGroupBy`/`faGroup`/`faMeasure`/`faLoading` while all 12 readers read the `faF`-prefixed forms. The widget worked on its fallbacks, so nothing caught it; this driver's own filter assertions failed against it first. Renamed to the names actually read, with a permanent guard (check 7.9) that no declared key is unread.
4. **Rule 12 labels were 1 of 14** (v2.2). The reachability fix wrapped only the KPI heading. W01/W05/W09 carry 11 label pairs, W13 12, W10 14, and W11 carried one, so in F mode three of four cards still said "Small / Medium / Large". The 12 switcher labels and the side-by-side heading now carry the abc/f two-span pattern, copied verbatim from W10. "Small" labels stay bare exactly as W10 leaves them, since that button is hidden in F mode.

### Driver results — `driver-W11-v2.2.js`, 78 checks, 0 failures

- **Reachability**: real routing path returns the Final, switcher present with Final pressed, F-mode CSS present, Small slot hidden, dead menu hidden and scoped to W11 alone.
- **Sizes**: Glance / Explore / Detail all render, all three genuinely distinct, correct tier attributes; Glance is the metric with no table wrapper, Explore is the table alone in `class="single"`, Detail is table plus donut in `class="full"` with two panels. The hidden Small slot still renders safely.
- **Filters**: 6 dimensions each produce a distinct render; 5 measures each produce a distinct render and each label appears in the Glance context line; the Specific Group option list changes with the dimension; narrowing to a real group cuts 12 assets to 3, and that count matches what the filter menu advertises.
- **Asset detail**: 12 per-asset rows, unique `FA-` tags reaching the rendered output, all five measures numeric on every asset, and the measure total equal to the sum of the rows shown.
- **States**: bogus group selection renders a real empty state with no fabricated total and no NaN; loading renders a skeleton.
- **Sweep**: 210 combinations of size x dimension x measure x loading. Zero throws, zero em dashes, zero NaN or undefined leaks.
- **Containment**: no `FA_` globals leaked, no unprefixed `ICON(`/`money(`, every emitted `data-faf` action is one the handler compares against, A/B/C branches intact with the F branch returning before them, one version stamp changed.

Static gate: **0 HIGH**, 4 MED, 1 LOW. The 4 MEDs are em dashes in pre-existing prose: two house-convention headings copied verbatim from W10 ("KPI Card — shown as a header bar", "Customer Research — What We're Working Off") and two dated historical "Fix made —" notes preserved per the locked-doc rule. The LOW (no obvious empty-data guard) is answered by driver checks 4.1 to 4.4.

### Rule 11 — data caveats, and a direct contradiction of this file's 2026-07-23 entry

The 2026-07-23 entry above states that the doc's richer filter model "is **not** backed by the current data and is not offered". **The Final now offers it**, because Jo's build ships its own mock asset register carrying all six dimensions and all five measures. That register is mock data, not proven backend data. So the position has changed in what is *rendered*, not in what is *known*:

- The 12-asset register, its tag numbers, and the Building/Room/Asset Account/Accumulated Depreciation Account/Expense Account values are **illustrative mock data from Jo's build**. Nothing in this run verified them against Shelby's real fixed-asset tables.
- Whether the backend can actually serve six groupable dimensions, a dependent group list, and five distinct money measures per asset **remains unconfirmed** and belongs on the developer punch list, not in this file's claims.
- The mockup renders as if real, per Rule 11; this caveat is the disclosure.
- The previously removed invented "Depreciation method" filter (hardcoded 1.3x/1.4x multiplier) has **not** returned. Jo's build does not have it.

### Status, deliberately not changed

The owner chose **"Leave the status alone"** on 2026-08-30. `PROJECT INDEX.md` (Step 4 "Not started", Step 3 "In progress"), `Dashboard Tracker.xlsx`, and the Step 4 doc's Status line are all untouched. The recorded contradiction in the Step 4 doc, which says "🟢 Final design — locked" and "this widget is still undesigned" in the same file, therefore **remains open by explicit choice**, as does its "Last verified against build" line.

### Where written

`Dashboard Widget Mockups.html` only: the `faF` block and `FAF_*` constants before `WRENDER[11]`, the `if(opt==='F') return faFRender(wid,sz);` branch, the `.faf-root` CSS families, `fcInitState(11,'F')`, `#fc-optsw-11`, the `#fc-widget-11.fc-fmode` rules, and the `#fc-widget-11` section's blurb, Logic panel and size labels. `MOCK_DATA` was **not** touched (the faF data is standalone constants), so `mock-data.master.js` needs no re-sync. A/B/C branches, their cards, and every other widget are unchanged. Scripts: `port-W11.py`, `fix-W11-reach.py`, `apply-W11-v2.1.py`, `apply-W11-v2.2.py`, `driver-W11-v2.2.js`.
