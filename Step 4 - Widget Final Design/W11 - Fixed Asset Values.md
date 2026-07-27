# W11 — Fixed Asset Values

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W11-Fixed-Asset-Values.md](../Step%203%20-%20Mock_Work/Widget_Specs/W11-Fixed-Asset-Values.md)
**Data source & formulas:** [Step 1 - Dashboard Research/11 - Fixed Asset Values.md](../Step 1 - Dashboard Research/11%20-%20Fixed%20Asset%20Values.md)
**Confluence dossier:** none yet
**Last verified against build:** not yet audited

> **Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a written source document (name it) · `[TO CONFIRM]` assumed, with the named owner who can confirm. Claims with no mark are template boilerplate only.

## Purpose
Shows the financial values of the organisation's fixed assets, broken down by a chosen grouping. Users control how assets are grouped, which specific group to look at, and which of five financial measures to focus on.

Evidence note: the grouping dimensions, the five financial measures, and the three-dropdown control model are all documented in the Step 1 research and confirmed against the legacy build [DOC - Step 1 research]. Whether the widget's purpose is tracking total value or flagging assets that need attention is itself still an open question (see Sign-off Readiness).

## How Other Companies Fulfil This Purpose
- Fixed-asset dashboards commonly use **pie charts by class/category** alongside a **full lifecycle table** (Beginning Amount, Acquisitions, Depreciation, Disposals, Net Book Value), with filters by year/class/location ([SlideTeam](https://www.slideteam.net/blog/must-have-fixed-assets-dashboard-templates-with-examples-and-samples), [GlobalData365](https://globaldata365.com/fixed-assets-dashboard/)).
- Pie/donut charts are only recommended for **small category counts** — this widget's own Group By options range from low-cardinality (Class) to high-cardinality (Room, Asset Account), so no single chart type is right for every Group By selection.

**Net assessment:** this is a case where the right view genuinely depends on which Group By is active, so **keeping both a bar and a donut view as peers (rather than picking one)** is the standard-supported answer, not a compromise.

## Data Contract

All rows below are sourced from the Step 1 research doc, which was itself confirmed correct against the legacy `FixedAssets : DataPanelControl` class (`/FixedAssets`) via `Widget_Comparison_Classic.html`, 2026-07-08.

| Field / value shown | Source table / endpoint | Formula / logic | Evidence |
|---|---|---|---|
| Asset rows (Tag #, Name, groupings) | `FA_Asset` | Individual asset records: tag number, name, capitalized value, cost, class/building/room/account groupings. Scope: `FA_Asset WHERE CompanyID = ctx`, then grouped by whichever of Class/Building/Room/AssetAccount/AccumDepAccount/ExpenseAccount was selected | [DOC - Step 1 research] |
| Capitalized Value | `FA_Asset` | Direct field, not derived | [DOC - Step 1 research] |
| Cost | `FA_Asset` | Direct field, not derived | [DOC - Step 1 research] |
| Depreciable Value | Derived | `Cost − SalvageValue` (computed, not a stored field) | [DOC - Step 1 research] |
| Accumulated Depreciation | `FA_AssetDepreciation` (book depreciation records per asset, excluding tax depreciation) | `SUM(FA_AssetDepreciation.Depreciation) WHERE !Tax`, grouped by AssetID | [DOC - Step 1 research] |
| Net Value | Derived | `DepreciableValue − Accumulated Depreciation`. Step 1 records this as a correction to its own earlier description ("Cost minus Accumulated Depreciation"): the actual base is Depreciable Value (Cost minus Salvage Value), not Cost directly | [DOC - Step 1 research] |
| Chart data (all views) | Derived | All group items, filtered to exclude any group where the selected Dollar Type (Financial Measure) totals to 0 | [DOC - Step 1 research] |
| "not assigned" group | Derived | Items not assigned to a group appear as "not assigned" | [DOC - Step 1 research] |
| Saved filter preferences | `SSUserTenantPreferenceRepository` (key: `UserPreferences.WidgetFixedAssets`) | Group By / Specific Group / Financial Measure selections saved per user, remembered across sessions | [DOC - Step 1 research] |
| KPI headline: **Total Net Value** | Derived | Across all fixed assets, org-wide, fixed regardless of any filter selection (this design's decision, see Size behaviour). The per-asset Net Value formula is documented above; the org-wide summation itself is not spelled out in any source | [DOC - Step 1 research] for Net Value; org-wide summation [TO CONFIRM - owner TBD] |

- **Favourability/direction logic:** none documented. This widget has no red/green good-vs-bad convention in any source.
- **Rounding/currency/locale:** values are currency amounts. Rounding rules not specified in any source.
- **"Data as of" freshness behaviour:** not specified in any source.

**Known Modern API gaps** [DOC - Step 1 research]: only Class/Building/Room groupings are actually implemented for the "Specific Group" dropdown; selecting Asset Account, Accumulated Depreciation Account, or Expense Account as the Group By returns an **empty list** (unimplemented switch case) — the grid/chart then filter to nothing. Also, the three dropdown selections aren't persisted server-side in the Modern API (client-managed only). Step 1 flags both as worth flagging before rebuild. This design offers all six Group By options and commits to per-user persistence, so both gaps appear in Sign-off Readiness below.

## Widget States

| State | Behaviour |
|---|---|
| No module rights / entitlement | *Not yet specified; needs a pass.* Nothing in the sources covers Fixed Assets entitlement behaviour. |
| Empty (org has no fixed assets) | *Not yet specified; needs a pass.* |
| Partial (some groups or measures empty) | Groups with a zero value for the selected measure are excluded from the chart [DOC - Step 1 research]. Also, on the current Modern API, selecting one of the three unimplemented Group By dimensions returns an empty list and the grid/chart filter to nothing [DOC - Step 1 research]; what the widget should render in that case: *Not yet specified; needs a pass.* |
| Loading | *Not yet specified; needs a pass.* |
| Error / API failure | *Not yet specified; needs a pass.* |
| Stale data | Refresh icon present at every size (see Refresh). Whether there is a "data as of" signal: *Not yet specified; needs a pass.* |

## Interaction Spec

This widget is view-only: no drill-down or navigation away was observed in the legacy build [DOC - Step 1 research], and no user actions beyond the filter dropdowns and view switch are documented, so no confirmation/success/failure/undo flows apply.

| Interaction | Behaviour | Evidence |
|---|---|---|
| Group By change | Changing Group By also resets the Specific Group dropdown | [DOC - Step 1 research] |
| Any dropdown change | Both table and chart update when the dropdowns are changed | [DOC - Step 1 research] |
| Chart hover (legacy pie) | Hovering over a pie segment shows the value for that group | [DOC - Step 1 research] |
| Bar/donut hover (Views 1 and 2) | *Not yet specified; needs a pass.* The legacy pie hover above is the only documented hover behaviour | |
| Click on bars, donut segments, or table rows | *Not yet specified; needs a pass.* (Legacy widget was view-only) | |
| Switch View toggle | Available at Medium and Large; not at Small or KPI (see Size behaviour) | |
| Keyboard/focus behaviour for the three dropdowns, view switch, and table | *Not yet specified; needs a pass.* | |

## Filters
| Filter | Values |
|--------|--------|
| Group By | Class · Building · Room · Asset Account · Accumulated Depreciation Account · Expense Account |
| Specific Group | Dynamic — depends on Group By |
| Financial Measure | Capitalized Value · Cost · Depreciable Value · Accumulated Depreciation · Net Value |

All three selections persist per user across sessions. This widget has no time-based filter at all — the KPI tile ignores Group By/Specific Group/Financial Measure entirely and always shows one fixed figure (see Size behaviour).

## Data Table Sort
Proposed default: Tag # ascending. **Not explicitly confirmed in the old design — flag for confirmation before build.**

Trimmed-view rule: Small shows the top 3 groups by the selected Financial Measure (see Size behaviour), so the ranking measure for the chart views is specified. For the Asset Detail Table view, the Step 3 spec showed 3 rows at Small using the fixed Tag # ascending sort [DOC - Step 3 spec], but that sort is itself proposed-only (see above), and this doc's own Small row reads "top 3 groups by selected measure", which is chart-view language. How the table view trims at Small: flagged in Sign-off Readiness.

## Drill-Through
None — matches old design (view-only, no drill-down).

## Refresh
Standalone icon, present at every size including KPI.

---

## Views (Switch View)

### View 1 — Group Bars *(default)*
Horizontal bar per group (within the selected Group By dimension), showing the selected Financial Measure. Scales cleanly to any Group By, including high-cardinality ones like Room.

### View 2 — Donut by Group
Same data as a donut — best specifically when Group By is set to a low-cardinality dimension like Class, matching the old design's original chart most closely.

### View 3 — Asset Detail Table
Individual assets within the selected Specific Group — Tag # · Name · all 5 financial measures (selected measure's column shown first), totals row.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Active view, top 3 groups by selected measure, no Switch View |
| **Medium (2×2)** | Active view, all groups within the selected Group By; Switch View available |
| **Large (4×4)** | Active view + individual-asset table for the selected Specific Group; Switch View available |
| **KPI (1×0.5)** | Headline: **Total Net Value** across all fixed assets, org-wide — fixed regardless of any filter selection. No download, no switch. |
| **Expanded** | Active view, full detail, all three filters live in the modal |

---

## Accessibility

Required (project baseline commitments, stated per widget):
- Colour is never the only signal: donut segments and group bars need paired text labels, and the "lead" visual distinction of the selected Financial Measure (see Fine-Tuning Notes) must not rely on colour alone. *Not yet reviewed against the build.*
- Chart values exist as text in the DOM (sr-only or visible table), not hover-only; this applies to the Group Bars and Donut views' values. *Not yet reviewed against the build.*
- Table semantics are real (`th`/scope), and interactive controls (the three dropdowns, view switch) are reachable by keyboard. *Not yet reviewed against the build.*

## What Got Cut (and why)
- **"Dominant group + % of measure" as a KPI headline** — dropped in favour of **Total Net Value**, which two of the three original concepts already agreed on independently; consistent with the pattern used across the rest of the dashboard.
- **Invented "Depreciation Method" filter (Straight Line/Declining Balance)** — already cut earlier in this project; nothing in the real data supports it.

## Sign-off Readiness

| # | Open item | Type | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | Data Table Sort default (Tag # ascending) is proposed only: "Not explicitly confirmed in the old design — flag for confirmation before build." | Field / product decision | Not yet assigned | Not stated (the doc's own wording says confirm before build) |
| 2 | Purpose question, posed and not answered: "Is this widget used to track the total value of assets, or to flag assets that need attention (e.g. fully depreciated, due for replacement)?" [DOC - UX Specialist Questions Master Tracker, Q27; also listed as open in PROJECT INDEX] | Product decision | Not yet assigned | Not stated |
| 3 | Depreciation curve question, posed and not answered: "Should the depreciation curve (value over time) be visible on this widget, or is the current book value all that's needed at a glance?" [DOC - UX Specialist Questions Master Tracker, Q28; also listed as open in PROJECT INDEX] | Product decision | Not yet assigned | Not stated |
| 4 | Modern API: only Class/Building/Room are implemented for the Specific Group dropdown; Asset Account, Accumulated Depreciation Account, and Expense Account return an empty list (unimplemented switch case), while this design offers all six Group By options | Field / API | Backend team (not yet named) | Step 1 flags it as worth flagging before rebuild [DOC - Step 1 research] |
| 5 | Modern API: the three dropdown selections aren't persisted server-side (client-managed only), while this design commits to per-user persistence across sessions | API | Backend team (not yet named) | Step 1 flags it as worth flagging before rebuild [DOC - Step 1 research] |
| 6 | KPI math: the org-wide Total Net Value summation is not spelled out in any source (see Data Contract [TO CONFIRM]) | Math | Not yet assigned | Not stated |
| 7 | How the Asset Detail Table view trims at Small size (see Data Table Sort trimmed-view rule) | Spec gap | Design (this doc) | Not stated |
| 8 | Widget States: no-rights, empty, loading, error, and stale rows are unspecified, and the render for an unimplemented Group By returning an empty list is unspecified | Spec gap | Design (this doc) | Not stated |
| 9 | Interaction Spec: bar/donut hover content, click behaviour, and keyboard rows are unspecified | Spec gap | Design (this doc) | Not stated |

This doc has 9 open items; it is not sign-off-ready until this table is empty or every row is explicitly accepted as a known risk.

## Fine-Tuning Notes
- The selected Financial Measure's column/bar is always visually distinguished as the "lead" figure
- Group By dimensions with many values (Room, Asset Account) should default to the Bar view rather than Donut, per the reasoning above
