# W11 Fixed Asset Values: build requirements

> **Amended 2026-09-03, after the build was reviewed.** Three requirements below were retired by owner instruction once the built widget was seen, and the build is now the correct reference for them:
> 1. **Section 6 listed three views. Group Bars is removed.** Two views remain, Donut and Asset Detail, and the Donut is the default.
> 2. **Section 5 asked for the active view PLUS the asset table at Detail. That pairing is removed** because it did not fit. Detail renders exactly one view at full width and differs from Explore only in the room it has.
> 3. **The shortened-figures explanatory footnote is removed.** The behaviour is unchanged: every figure still carries its exact value in both `title` and `aria-label`, and Download still states that it carries full precision.
>
> Everything else in this document still stands.

Handoff for a from-scratch build of this widget's Final. Written 2026-09-03.

**This document contains no styling.** No colours, no sizes, no spacing, no class names, no layout. It states only what the widget must show, what the user can do, and what happens. How it looks is not decided here.

Sources: `Step 4 - Widget Final Design/W11 - Fixed Asset Values.md`, `Step 1 - Dashboard Research/11 - Fixed Asset Values.md`, and the legacy `FixedAssetValues : DataPanelControl` surface recorded in `Step 5 - API documents/Widget_Comparison_Classic.html`.

---

## 1. What the widget is for

Show the financial value of the organisation's fixed assets, broken down by a grouping the user chooses. The user controls three things: how assets are grouped, which specific group to look at, and which of five financial measures to value them by.

It is **view only**. No drill-through, no navigation away, no writes, no approvals. The legacy widget had none and none is being added.

---

## 2. The data

All values are currency amounts. Scope is `FA_Asset WHERE CompanyID = ctx`.

| Value | Source | How it is derived |
|---|---|---|
| Asset identity | `FA_Asset` | Tag number and name |
| Groupings | `FA_Asset` | Class, Building, Room, Asset Account, Accumulated Depreciation Account, Expense Account |
| Capitalized Value | `FA_Asset` | Direct field, not derived |
| Cost | `FA_Asset` | Direct field, not derived |
| Depreciable Value | derived | `Cost - SalvageValue` |
| Accumulated Depreciation | `FA_AssetDepreciation` | `SUM(Depreciation) WHERE !Tax`, grouped by AssetID. Book depreciation only; tax depreciation is excluded |
| Net Value | derived | `DepreciableValue - AccumulatedDepreciation` |

**Two data rules that are easy to get wrong:**

1. **Net Value is not Cost minus Accumulated Depreciation.** The base is Depreciable Value, which is already Cost minus Salvage Value. Step 1 records this as a correction to its own earlier wording, so any build that uses Cost as the base is wrong.
2. **Accumulated Depreciation excludes tax depreciation.** The `!Tax` condition is part of the definition, not an optimisation.

**Assets with no group** appear under a group named "not assigned". This is a real group, not an error state, and it must be selectable.

---

## 3. The controls

Three selections, and no others. There is **no time filter of any kind** on this widget: no fiscal year, no date range, no period. Values are current book values.

| Control | Values |
|---|---|
| Group By | Class, Building, Room, Asset Account, Accumulated Depreciation Account, Expense Account |
| Specific Group | Dynamic: the groups that exist within the selected Group By, plus "not assigned" where applicable |
| Financial Measure | Capitalized Value, Cost, Depreciable Value, Accumulated Depreciation, Net Value |

**All three selections persist per user across sessions.** Legacy stores them in `SSUserTenantPreferenceRepository` under the key `UserPreferences.WidgetFixedAssets`.

---

## 4. Behaviour

| Interaction | What must happen |
|---|---|
| Change Group By | The Specific Group selection **resets**. It cannot carry a value that does not exist in the new dimension |
| Change any of the three | Both the table and the chart update together. Neither may show a population the other does not |
| Change Financial Measure | The selected measure becomes the one the chart plots and the one the table leads with. All five measures stay visible in the table |
| Hover a chart element | The value for that group is shown |
| Refresh | Present at every size, including the smallest |
| Anything else | Nothing. No row click, no segment click, no drill, no export beyond the download in section 6 |

**Chart population rule:** the chart plots all groups in the selected dimension, **excluding any group whose selected measure totals zero**. The table is not filtered this way; a zero-value group still appears in the table. A build must not quietly apply the chart's exclusion to the table.

---

## 5. The three sizes

Rule 12 applies: three sizes, Glance, Explore and Detail, in that order. There is no Small.

### Glance

- Shows one figure: **Total Net Value across all fixed assets, organisation wide.**
- **This figure ignores all three selections.** It is not filtered by Group By, Specific Group or Financial Measure. It is always Net Value and always org-wide. A build that makes it follow the measure selector is wrong.
- No controls. No view switch. No download.
- Refresh is present.

### Explore

- The three controls are all live.
- Shows the **active view** across **all groups** within the selected Group By dimension.
- The view switch is available.
- Download is available (section 6).

### Detail

- The three controls are all live.
- Shows the **active view**, plus the **individual-asset table for the selected Specific Group**.
- The view switch is available.
- Download is available (section 6).

---

## 6. The views

Three views, switchable at Explore and Detail.

### Group Bars

One bar per group within the selected Group By, valued by the selected Financial Measure. This is the view that must cope with high-cardinality dimensions such as Room, where there may be many groups.

### Donut by Group

The same data as a donut. Suited to low-cardinality dimensions such as Class. This is the view closest to the legacy widget's original chart.

### Asset Detail Table

Individual assets within the selected Specific Group.

- Columns: **Tag #**, **Name**, and **all five financial measures**.
- The selected measure's column comes **first** among the measures and is identifiable as the lead figure.
- A **totals row** showing the asset count and the column total for every measure.

**Numbers in the table.** Figures are shortened for display, and the shortening happens in the front end from the same underlying values. The full unshortened figure must be available on hover and to assistive technology. No separate rounded dataset is created.

**Download.** Available at Explore and Detail, and it carries the **full unshortened figures** for every measure, not the shortened display values. A visible note tells the user the displayed figures are shortened and where to get the full ones.

**Sort.** Proposed default is Tag # ascending. **This is not confirmed.** The legacy default was never recorded, so a build must either use Tag # ascending and flag it, or carry whatever the owner rules. See section 9.

---

## 7. States

Most of these are unspecified in every source. A build must not invent behaviour for them; it must render something obvious and leave the gap visible.

| State | Requirement |
|---|---|
| No module rights | **Unspecified.** Nothing in any source covers Fixed Assets entitlement |
| No fixed assets at all | **Unspecified.** Needs a decision |
| A group with zero value for the selected measure | Excluded from the chart. Still present in the table |
| An unimplemented Group By dimension | On the current Modern API, Asset Account, Accumulated Depreciation Account and Expense Account return an empty list, so both table and chart have nothing to show. **What the widget renders here is unspecified** and is the most likely state a user actually hits, because three of the six options are affected |
| Loading | **Unspecified** |
| Error or API failure | **Unspecified** |
| Stale data, "data as of" | **Unspecified.** Refresh exists but no freshness signal is defined |

---

## 8. Accessibility requirements

These are project baseline commitments for this widget, and none has been verified against a build:

- Colour is never the only signal. The bars and donut segments carry paired text labels, and the lead-measure distinction must not be carried by colour alone.
- Chart values exist as **text in the DOM**, either visible or screen-reader-only. Hover-only values are not acceptable.
- Table semantics are real, using `th` and `scope`.
- All three dropdowns, the view switch and the table are reachable and operable by keyboard.

---

## 9. Facts that are not settled

A build must not resolve any of these by choosing. Render what is defined, and leave these visible as gaps.

| # | Open item | Who settles it |
|---|---|---|
| 1 | Table sort default. Tag # ascending is proposed only and was never confirmed against the legacy design | Owner |
| 2 | Whether the widget is for tracking total asset value or for flagging assets needing attention, such as fully depreciated or due for replacement. Posed to the UX specialist, unanswered | Owner and SME |
| 3 | Whether a depreciation curve, value over time, belongs on this widget, or whether current book value is all that is needed. Posed, unanswered | Owner and SME |
| 4 | Modern API implements Specific Group for **Class, Building and Room only**. Asset Account, Accumulated Depreciation Account and Expense Account hit an unimplemented switch case and return an empty list. This design offers all six | Backend team |
| 5 | Modern API does not persist the three selections server-side; it is client-managed only. This design commits to per-user persistence across sessions | Backend team |
| 6 | The organisation-wide Total Net Value summation for the Glance figure is not spelled out in any source | Owner |
| 7 | How the asset table trims at the smallest size it appears at | Design |
| 8 | The unspecified states in section 7 | Design and owner |
| 9 | Hover content, click behaviour and keyboard behaviour for the bars and donut | Design |

**Item 4 deserves emphasis.** Half the Group By options do not work on the target API today. A build that offers all six without acknowledging this produces three dead selections.

---

## 10. What must not be added

The following have all been explicitly cut or were never supported, and a build must not reintroduce them:

- **A Depreciation Method filter** such as Straight Line versus Declining Balance. Invented earlier in this project, cut, and nothing in the real data supports it. An earlier build had it applying a hardcoded multiplier to Net Value and annual depreciation.
- **A "dominant group and percentage of measure" KPI headline.** Cut in favour of Total Net Value.
- **Any time or fiscal-year filter.** There is no time dimension on this widget.
- **Any drill-through, row click, segment click or navigation away.** The widget is view-only.
- **Any write, approval or status action.**
