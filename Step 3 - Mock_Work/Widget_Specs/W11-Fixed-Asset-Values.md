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
