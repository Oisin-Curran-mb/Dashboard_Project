# W11 — Fixed Asset Values

**Module:** Finance
**Status:** 🟢 Final design, locked and BUILT: the faF Final in the Final Check tab, rebuilt from scratch 2026-09-03
**Full history / rejected ideas:** [Widget_Specs/W11-Fixed-Asset-Values.md](../Step%203%20-%20Mock_Work/Widget_Specs/W11-Fixed-Asset-Values.md)
**Build requirements handoff:** [Step 3 - Mock_Work/W11 - Fixed Asset Values - BUILD REQUIREMENTS (handoff).md](../Step%203%20-%20Mock_Work/W11%20-%20Fixed%20Asset%20Values%20-%20BUILD%20REQUIREMENTS%20(handoff).md) (written 2026-09-03; amended 2026-09-03 after build review)
**Data source & formulas:** [Step 1 - Dashboard Research/11 - Fixed Asset Values.md](../Step 1 - Dashboard Research/11%20-%20Fixed%20Asset%20Values.md)
**Confluence dossier:** Jo's sign-off dossier exists: `Step 6 - Sign off document/Fixed Assets Values/Fixed Assets Values (Confluence pull 2026-07-27).html` (Part A/B/C, 14 sections). See Sign-off Input (Jo) below. The earlier "none yet" on this line was wrong.

**Resolved 2026-09-07 (hold lifted by owner instruction).** This doc previously carried a recorded contradiction: the Status line said "🟢 Final design — locked" while a 2026-08-25 Feargal-call note said "this widget is still undesigned". On 2026-08-30 the owner explicitly chose to leave that contradiction standing; on 2026-09-07 the owner lifted that hold for this doc only. The resolution: the widget IS now designed and built. Historical note kept for the record: **[2026-08-25, Feargal call]** no design decision was made on that call and the widget was undesigned at that date; the Final was subsequently built (2026-08-30 port, deleted; 2026-09-03 from-scratch rebuild, current). `PROJECT INDEX.md` and `Dashboard Tracker.xlsx` were not touched and may still show older statuses.

**Last verified against build:** 2026-09-07 via widget-final-check-audit (unattended)

> **Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a written source document (name it) · `[TO CONFIRM]` assumed, with the named owner who can confirm. Claims with no mark are template boilerplate only.

## Build record (what the Final actually is)

- **2026-08-30:** Final v2.0 to v2.2 was Jo's Fixed Asset Values build ported 1-to-1 (owner instruction "copy Jo's 1 to 1"), 12-asset register, size-driven composition, no view switch. [DOC - Widget_Specs v2.2 entry: driver 78 checks 0 failures, static gate 0 HIGH]
- **2026-09-03:** that port was DELETED by owner instruction after six restyling passes never looked right (cause recorded in `Widget Styling Reference.md`). [BUILD - Logic panel note]
- **2026-09-03:** the current Final was rebuilt from scratch against the BUILD REQUIREMENTS handoff doc, reusing nothing from the deleted port: not its data, not its layout, not its logic. It is `faF`/`FAF_`-prefixed, additive, with A/B/C untouched, and it is the current option (`fcInitState(11,'F')`, switcher restored). [BUILD]
- The Step 3 Widget_Specs history ends at the 2026-08-30 v2.2 entry and does not yet record the 2026-09-03 rebuild.

## Purpose
Shows the financial values of the organisation's fixed assets, broken down by a chosen grouping. Users control how assets are grouped, which specific group to look at, and which of five financial measures to focus on.

Evidence note: the grouping dimensions, the five financial measures, and the three-dropdown control model are all documented in the Step 1 research and confirmed against the legacy build [DOC - Step 1 research]. Whether the widget's purpose is tracking total value or flagging assets that need attention is itself still an open question (see Sign-off Readiness).

## How Other Companies Fulfil This Purpose
- Fixed-asset dashboards commonly use **pie charts by class/category** alongside a **full lifecycle table** (Beginning Amount, Acquisitions, Depreciation, Disposals, Net Book Value), with filters by year/class/location ([SlideTeam](https://www.slideteam.net/blog/must-have-fixed-assets-dashboard-templates-with-examples-and-samples), [GlobalData365](https://globaldata365.com/fixed-assets-dashboard/)).
- Pie/donut charts are only recommended for **small category counts** — this widget's own Group By options range from low-cardinality (Class) to high-cardinality (Room, Asset Account), so no single chart type is right for every Group By selection.

**Net assessment (historical):** the research supported keeping both a bar and a donut view as peers. **Superseded in the build:** on 2026-09-03 the owner removed the Group Bars view entirely, so the shipped Final carries two views, Donut and Asset Detail Table. The research reasoning stands as the record of why bars were originally included.

## Data Contract

All rows below are sourced from the Step 1 research doc, which was itself confirmed correct against the legacy `FixedAssets : DataPanelControl` class (`/FixedAssets`) via `Widget_Comparison_Classic.html`, 2026-07-08.

| Field / value shown | Source table / endpoint | Formula / logic | Evidence |
|---|---|---|---|
| Asset rows (Tag #, Name, groupings) | `FA_Asset` | Individual asset records: tag number, name, capitalized value, cost, class/building/room/account groupings. Scope: `FA_Asset WHERE CompanyID = ctx`, then grouped by whichever of Class/Building/Room/AssetAccount/AccumDepAccount/ExpenseAccount was selected | [DOC - Step 1 research] |
| Capitalized Value | `FA_Asset` | Direct field, not derived | [DOC - Step 1 research] |
| Cost | `FA_Asset` | Direct field, not derived | [DOC - Step 1 research] |
| Depreciable Value | Derived | `Cost − SalvageValue` (computed, not a stored field) | [DOC - Step 1 research] |
| Accumulated Depreciation | `FA_AssetDepreciation` (book depreciation records per asset, excluding tax depreciation) | `SUM(FA_AssetDepreciation.Depreciation) WHERE !Tax`, grouped by AssetID | [DOC - Step 1 research] |
| Net Value | Derived | `DepreciableValue − Accumulated Depreciation`. Step 1 records this as a correction to its own earlier description ("Cost minus Accumulated Depreciation"): the actual base is Depreciable Value (Cost minus Salvage Value), not Cost directly. The build implements exactly this (`fafValue`) [BUILD] | [DOC - Step 1 research] |
| Chart data (donut) | Derived | All group items, excluding any group where the selected Financial Measure totals to 0. The excluded groups are named in a visible note beneath the chart; a zero-value group still appears in the asset table [BUILD] | [DOC - Step 1 research] |
| "not assigned" group | Derived | Items not assigned to a group appear as "not assigned", a real selectable group, sorted last in the group list [BUILD] | [DOC - Step 1 research] |
| Asset table rows, sort, paging | New endpoint, not yet scoped: the build mocks `GET /api/dashboard/fixed-assets/grid?valueType={dim}&valueId={group}&sortBy={key}&sortDir={asc|desc}&page={n}&pageSize=10` returning `{rows, totalCount, totals, pageIndex, pageCount}` | Sort and paging are SERVER work, not client operations (owner instruction 2026-09-03). The client renders one page; the totals row totals the whole filtered group, never the visible page. `sortBy` must be whitelisted server-side and the order must end in a unique tiebreaker (tag) | [BUILD] · endpoint [TO CONFIRM - backend team] |
| Saved filter preferences | `SSUserTenantPreferenceRepository` (key: `UserPreferences.WidgetFixedAssets`) | Group By / Specific Group / Financial Measure selections saved per user, remembered across sessions | [DOC - Step 1 research] |
| KPI headline: **Total Net Value** | Derived | Across all fixed assets, org-wide, fixed regardless of any filter selection. The build sums Net Value over the whole register (`fafOrgNetTotal`) and shows the asset count beside it. The org-wide summation itself is not spelled out in any source | [DOC - Step 1 research] for Net Value; org-wide summation [TO CONFIRM - owner TBD] |

- **Favourability/direction logic:** none documented. This widget has no red/green good-vs-bad convention in any source.
- **Rounding/currency/locale:** values are currency amounts, shortened in the front end for display ($1.2M style); the full unshortened figure is carried in `title` and `aria-label` on every shortened figure, and the download carries full precision [BUILD]. Locale rules not specified in any source.
- **"Data as of" freshness behaviour:** not specified in any source.

**Rule 11 data caveat (applies to every claim about the data model above and to the register the build renders):** the Final's asset register (sample records `FA-1001` to `FA-1901`, covering six classes, buildings, rooms, and all five measures) is **illustrative mock data**, authored for the 2026-09-03 rebuild; the deleted 2026-08-30 port used Jo's 12-asset register, equally illustrative. **Nothing has ever been verified against Shelby's real fixed-asset tables.** Backend feasibility of six groupable dimensions, a dependent Specific Group list, and five distinct money measures per asset **remains unconfirmed** and belongs on the developer punch list, not in this doc's claims. The register deliberately carries NO values for the three account dimensions (Asset Account, Accumulated Depreciation Account, Expense Account): those return an empty list on the target Modern API today, and inventing account codes would make three dead selections look like they work.

**Known Modern API gaps** [DOC - Step 1 research]: only Class/Building/Room groupings are actually implemented for the "Specific Group" dropdown; selecting Asset Account, Accumulated Depreciation Account, or Expense Account as the Group By returns an **empty list** (unimplemented switch case). The build marks those three "not on API" in the Group By menu and renders an explicit "No groups returned" placeholder frame rather than a plausible-looking figure [BUILD]. Also, the three dropdown selections aren't persisted server-side in the Modern API (client-managed only). Both gaps appear in Sign-off Readiness below.

## Widget States

| State | Behaviour |
|---|---|
| No module rights / entitlement | *Not specified in any source.* The build renders a generic "State not specified" frame for it (reachable via `FAF_STATE.state='unspecified'`); nothing has been designed [BUILD]. |
| Empty (org has no fixed assets) | The build renders a "No fixed assets" empty state (with a compact Glance variant); the wording is build-invented pending a decision [BUILD]. |
| Partial (some groups or measures empty) | Groups with a zero value for the selected measure are excluded from the chart and named in a visible note beneath it; they still appear in the asset table [BUILD, per Step 1 rule]. |
| Unimplemented Group By dimension | The three account dimensions render an explicit "No groups returned for [dimension]" placeholder with the three filter chips still live, so the user can pick a dimension that works [BUILD]. What the real product should do remains an open item. |
| Loading | *Not specified in any source.* Covered by the same "State not specified" frame [BUILD]. |
| Error / API failure | *Not specified in any source.* Same frame [BUILD]. |
| Stale data | Refresh icon present at every size (see Refresh). No "data as of" signal is defined anywhere. |

## Interaction Spec

This widget is view-only: no drill-down or navigation away was observed in the legacy build [DOC - Step 1 research], and the build deliberately has no handler for a table row, an arc, or a bar. No confirmation/success/failure/undo flows apply.

| Interaction | Behaviour | Evidence |
|---|---|---|
| Group By change | Resets the Specific Group selection (it cannot carry a value that does not exist in the new dimension) and returns the table to page 1 | [DOC - Step 1 research] · [BUILD] |
| Any dropdown change | Table and chart update together; both read the same state, so neither can show a population the other does not | [DOC - Step 1 research] · [BUILD] |
| Financial Measure change | Re-plots the donut. In the Asset Detail view the measure chip is hidden (all five measures are visible as columns, so the control would do nothing there); the selection persists and takes effect when the donut is shown. Owner instruction 2026-09-03 | [BUILD] |
| Column sort (all 7 columns: Tag #, Name, five measures) | A server request, not a client operation. Money columns open descending on first click, text columns ascending; re-click flips. Sorting returns to page 1. `aria-sort` reflects the real state | [BUILD, owner instruction 2026-09-03] |
| Paging (Previous / Next) | 10 rows per page, server-shaped query; page index clamped so a shrinking set cannot strand the view. Totals row and donut never page | [BUILD, owner instruction 2026-09-03] |
| Donut hover | Each arc and legend row carries a `title` with group name, measure, exact value, percent share, and asset count | [BUILD] |
| Click on donut segments or table rows | None, deliberately: view-only | [DOC - Step 1 research] · [BUILD] |
| Download | Icon-only button in its own slim row at Explore and Detail; carries full unshortened figures for every measure | [BUILD, owner instruction 2026-09-03] |
| Keyboard | Filter chips and sort controls are real buttons; popovers are `role="listbox"` and Escape closes them. A full keyboard/focus pass has not been run | [BUILD] · pass [TO CONFIRM - design] |

## Filters
| Filter | Values |
|--------|--------|
| Group By | Class · Building · Room · Asset Account · Accumulated Depreciation Account · Expense Account (the last three marked "not on API" in the menu) |
| Specific Group | Dynamic — depends on Group By; "not assigned" listed last |
| Financial Measure | Capitalized Value · Cost · Depreciable Value · Accumulated Depreciation · Net Value. **Chip shown only in the Donut view** (owner instruction 2026-09-03): the table shows all five measures as columns, so the control belongs to the view that plots exactly one |

All three selections persist per user across sessions (design commitment; the mockup holds them as widget state per Rule 11, and the Modern API does not persist them server-side, see Sign-off Readiness). This widget has no time-based filter at all — the KPI tile ignores Group By/Specific Group/Financial Measure entirely and always shows one fixed figure (see Size behaviour). The build's header is one row: the chips on the left, the view toggle and Download on the right; the explanatory context line was removed 2026-09-03 by owner instruction.

## Data Table Sort
Default: Tag # ascending, as built. **The default is still an unconfirmed decision: it was never confirmed against the old design** (Sign-off Readiness row 1). All seven columns are sortable; sort is a server request parameter, not a browser operation, and the order always ends in the unique tag tiebreaker so paging cannot show or skip a row [BUILD, owner instruction 2026-09-03].

Trimming is superseded: under the Final there is no Small size (Rule 12) and the table **pages** (10 rows per page, server-side) instead of trimming, at every size it appears at. The old "top 3 groups at Small" rule applies only to the superseded A/B/C options.

## Drill-Through
None — matches old design (view-only, no drill-down).

## Refresh
Standalone icon, present at every size including Glance.

---

## Views (Switch View)

Two views, switchable at Explore and Detail via a segmented control in the widget's own header (not the card menu, whose generic "Switch chart type" block is hidden in F mode).

### View 1: Asset Detail Table *(default on load, as built)*
Individual assets within the selected Specific Group: Tag # · Name · all five financial measures in fixed canonical order · totals row (asset count + column total per measure, totalling the whole filtered group). **Changed 2026-09-03 by owner instruction:** the selected measure is no longer promoted to the front or marked as the lead column; all five measures are peers here, because a hidden control (the measure chip is not shown in this view) must not silently reorder columns. Rows with zero Net Value carry a muted marker.

### View 2: Donut by Group
The selected Financial Measure split across the groups of the chosen dimension, largest share darkest on the amethyst ramp, legend with name, shortened value and percent per group, centre total. Zero-total groups excluded and named in a note below.

### ~~View 3: Group Bars~~ **Removed 2026-09-03 by owner instruction.** The handoff doc's section 6 listed three views; the amendment retires Group Bars, and the donut plus the table are the shipped pair. `fafBars` was deleted, not left uncalled.

**[TO CONFIRM - owner] Default view discrepancy:** the amended handoff doc and the build's own comment say "the Donut is the default", but the build initialises `FAF_STATE.view` to `'assets'`, so the widget actually opens on the Asset Detail Table. One of the two is wrong; this doc records the built behaviour.

### Size behaviour (Rule 12: Glance / Explore / Detail; there is no Small under the Final)
| Size | Behaviour |
|------|-----------|
| **Glance** (Jo's KPI size) | One figure: **Total Net Value across all fixed assets, org-wide**, plus an asset-count pill. Ignores all three selections. No controls, no view switch, no download; refresh present. |
| **Explore** | All three controls live; the active view across all groups in the selected dimension; view toggle and Download available. |
| **Detail** | Same as Explore with more room: renders exactly ONE view at full width. **Changed 2026-09-03 by owner instruction:** the handoff originally asked for the active view PLUS the asset table side by side at Detail; the pair did not fit, so the requirement was retired rather than worked around. |
| **Expanded / legacy Large** | Maps to Detail (`sz` 'l'/'x' render the xwide tier). The hidden Small slot safe-falls-back to Explore. |

---

## Accessibility

Project baseline commitments, now largely implemented in the build (not yet verified with AT):
- Colour is never the only signal: every donut arc and legend row carries its group name and value as text in the DOM; the zero-value note is text; the table's zero-Net marker is not colour-only [BUILD].
- Chart values exist as text (legend + per-arc `title` + donut `role="img"` with a summary `aria-label`), not hover-only [BUILD].
- Table semantics are real: `role="table"` with `aria-rowcount`/`aria-colcount`, three rowgroups, `columnheader`/`cell`/`rowheader` roles, live `aria-sort` on every sortable column, and exact figures in `aria-label` wherever the display figure is shortened [BUILD].
- Popovers are `role="listbox"` with `aria-selected`; Escape closes them; controls are real buttons. A full keyboard/focus and screen-reader pass has not been run [TO CONFIRM - design].

## What Got Cut (and why)
- **"Dominant group + % of measure" as a KPI headline** — dropped in favour of **Total Net Value**, which two of the three original concepts already agreed on independently; consistent with the pattern used across the rest of the dashboard.
- **Invented "Depreciation Method" filter (Straight Line/Declining Balance)** — already cut earlier in this project; nothing in the real data supports it. **Confirmed still absent in the current build, 2026-09-07 audit:** no such filter, and no hardcoded multiplier, anywhere in the faF code.
- **Group Bars view**: removed 2026-09-03 by owner instruction; donut and asset table remain.
- **Lead-measure column promotion/marking in the table**: removed 2026-09-03 by owner instruction (fixed canonical column order; see View 1).
- **Header context line and shortened-figures footnote**: removed 2026-09-03 by owner instruction; the information lives in `title`/`aria-label` and the Download tooltip instead.
- **On-screen gap notes / open-items panel**: removed from every size 2026-09-03 by owner instruction. Removing them settled nothing: the open items remain tracked in the handoff doc's section 9 and this doc's Sign-off Readiness table.
- **Any time or fiscal-year filter**: never existed on this widget; still none.

## Sign-off Input (Jo)

Jo's sign-off dossier (`Step 6 - Sign off document/Fixed Assets Values/`, Confluence pull 2026-07-27, live re-verified beta1 23 Jul 2026) predates both Finals. No reconciliation file exists and none of her flags has an owner-assigned status yet: **every row below is Unreviewed** (accept / reject / dispute is the owner's call; recorded here so the doc carries her input, per project rule that her findings are attributed external input, never auto-corrections).

| # | Jo's flag / gap (her dossier) | What this design/build does today | Status |
|---|---|---|---|
| J1 | Glance KPI showing cost / accum deprec / NBV / % depreciated | Glance shows one figure, Total Net Value + asset count | Unreviewed |
| J2 | Per-group cost/accum-deprec/NBV comparison; bar over pie | Bars were removed 2026-09-03; donut + table shipped | Unreviewed |
| J3 | % depreciated for replacement planning | Not in the design; related to open question Q28 (depreciation curve) | Unreviewed |
| J4 | Remove "None" grouping option (shows nothing in legacy) | The build has a real, selectable "not assigned" group instead; whether that answers her flag is not decided | Unreviewed |
| J5 | Fix £ hardcoded currency (localisation defect, verified live) | Build renders $; real localisation behaviour unspecified | Unreviewed |
| J6 | Values as text; positive empty state; preserve sync + grouping | Largely present in the build (text values, empty states, synced controls) | Unreviewed |
| J7 | Her open questions: exact backing fixed-asset tables; useful-life / acquisition-date data availability; entitlement/empty behaviour; Specific Group selector not surfaced that pass | Overlap with this doc's Sign-off Readiness rows 2, 3, 8 | Unreviewed |

## Sign-off Readiness

| # | Open item | Type | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | Data Table Sort default (Tag # ascending) is proposed only: never confirmed against the old design. The build defaults to it and flags it | Field / product decision | Not yet assigned | Not stated (the doc's own wording says confirm before build) |
| 2 | Purpose question, posed and not answered: "Is this widget used to track the total value of assets, or to flag assets that need attention (e.g. fully depreciated, due for replacement)?" [DOC - UX Specialist Questions Master Tracker, Q27; also listed as open in PROJECT INDEX] | Product decision | Not yet assigned | Not stated |
| 3 | Depreciation curve question, posed and not answered: "Should the depreciation curve (value over time) be visible on this widget, or is the current book value all that's needed at a glance?" [DOC - UX Specialist Questions Master Tracker, Q28; also listed as open in PROJECT INDEX] | Product decision | Not yet assigned | Not stated |
| 4 | Modern API: only Class/Building/Room are implemented for the Specific Group dropdown; Asset Account, Accumulated Depreciation Account, and Expense Account return an empty list (unimplemented switch case), while this design offers all six (the build marks the three "not on API" and renders a placeholder) | Field / API | Backend team (not yet named) | Step 1 flags it as worth flagging before rebuild [DOC - Step 1 research] |
| 5 | Modern API: the three dropdown selections aren't persisted server-side (client-managed only), while this design commits to per-user persistence across sessions | API | Backend team (not yet named) | Step 1 flags it as worth flagging before rebuild [DOC - Step 1 research] |
| 6 | KPI math: the org-wide Total Net Value summation is not spelled out in any source (see Data Contract [TO CONFIRM]) | Math | Not yet assigned | Not stated |
| 7 | ~~How the Asset Detail Table view trims at Small size~~ Superseded 2026-09-03: no Small exists under the Final and the table pages server-side instead of trimming. Kept for the record | Spec gap (closed by supersession) | Design (this doc) | No |
| 8 | Widget States: no-rights, loading, error, and stale behaviours are still undesigned (the build renders explicit placeholder frames, which are stand-ins, not designs); empty-state wording is build-invented | Spec gap | Design (this doc) | Not stated |
| 9 | Interaction Spec: a full keyboard/focus and screen-reader pass has not been run | Spec gap | Design (this doc) | Not stated |
| 10 | Default view: amended handoff says Donut is default; the build opens on Asset Detail Table (`view:'assets'`). Which is intended? | Product decision | Owner | No, but the doc and build cannot both be right |
| 11 | The paged, server-sorted grid endpoint the build mocks (`GET /api/dashboard/fixed-assets/grid`, sort whitelist, totals over the whole filtered group) exists nowhere: not in legacy, not in the Modern API, not in any Step 5 spec (W11 has no API spec folder yet). Genuinely new, unscoped backend work | API (new) | Backend team (not yet named) | Not stated |

This doc has 10 open rows (row 7 closed by supersession); it is not sign-off-ready until this table is empty or every row is explicitly accepted as a known risk. Jo's 7 Unreviewed rows above additionally need statuses.

## Fine-Tuning Notes
- ~~The selected Financial Measure's column/bar is always visually distinguished as the "lead" figure~~ superseded 2026-09-03 by owner instruction: the table uses a fixed canonical column order with no lead marking; only the donut reads the measure selection.
- ~~Group By dimensions with many values (Room, Asset Account) should default to the Bar view rather than Donut~~ moot since 2026-09-03: the Bar view is removed. High-cardinality dimensions render in the donut or the table; whether the donut copes with very high cardinality on real data is untested (mock register only).
- First click on a money column sorts descending ("which is largest" is the useful question of a value column); text columns sort ascending first [BUILD].
