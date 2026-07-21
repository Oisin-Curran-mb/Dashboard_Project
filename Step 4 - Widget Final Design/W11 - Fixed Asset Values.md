# W11 — Fixed Asset Values

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W11-Fixed-Asset-Values.md](../Step%203%20-%20Mock_Work/Widget_Specs/W11-Fixed-Asset-Values.md)
**Data source & formulas:** [Step 1 - Dashboard Research/11 - Fixed Asset Values.md](../Step 1 - Dashboard Research/11%20-%20Fixed%20Asset%20Values.md)

## Purpose
Shows the financial values of the organisation's fixed assets, broken down by a chosen grouping. Users control how assets are grouped, which specific group to look at, and which of five financial measures to focus on.

## How Other Companies Fulfil This Purpose
- Fixed-asset dashboards commonly use **pie charts by class/category** alongside a **full lifecycle table** (Beginning Amount, Acquisitions, Depreciation, Disposals, Net Book Value), with filters by year/class/location ([SlideTeam](https://www.slideteam.net/blog/must-have-fixed-assets-dashboard-templates-with-examples-and-samples), [GlobalData365](https://globaldata365.com/fixed-assets-dashboard/)).
- Pie/donut charts are only recommended for **small category counts** — this widget's own Group By options range from low-cardinality (Class) to high-cardinality (Room, Asset Account), so no single chart type is right for every Group By selection.

**Net assessment:** this is a case where the right view genuinely depends on which Group By is active, so **keeping both a bar and a donut view as peers (rather than picking one)** is the standard-supported answer, not a compromise.

## Filters
| Filter | Values |
|--------|--------|
| Group By | Class · Building · Room · Asset Account · Accumulated Depreciation Account · Expense Account |
| Specific Group | Dynamic — depends on Group By |
| Financial Measure | Capitalized Value · Cost · Depreciable Value · Accumulated Depreciation · Net Value |

All three selections persist per user across sessions. This widget has no time-based filter at all — the KPI tile ignores Group By/Specific Group/Financial Measure entirely and always shows one fixed figure (see Size behaviour).

## Data Table Sort
Proposed default: Tag # ascending. **Not explicitly confirmed in the old design — flag for confirmation before build.**

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

## What Got Cut (and why)
- **"Dominant group + % of measure" as a KPI headline** — dropped in favour of **Total Net Value**, which two of the three original concepts already agreed on independently; consistent with the pattern used across the rest of the dashboard.
- **Invented "Depreciation Method" filter (Straight Line/Declining Balance)** — already cut earlier in this project; nothing in the real data supports it.

## Fine-Tuning Notes
- The selected Financial Measure's column/bar is always visually distinguished as the "lead" figure
- Group By dimensions with many values (Room, Asset Account) should default to the Bar view rather than Donut, per the reasoning above
