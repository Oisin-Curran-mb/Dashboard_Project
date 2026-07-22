# W03 — Payroll Distributions

**Module:** Payroll  
**Status:** ✅ Minor tweaks  
**Research doc:** [03 - Payroll Distributions.md](../../Step 1 - Dashboard Research/03 - Payroll Distributions.md)
**General rules:** [General Widget Design Rules.md](General%20Widget%20Design%20Rules.md)

## Purpose
Shows a breakdown of payroll amounts by compensation type across a chosen date range. Helps users understand how total payroll spend is distributed across different pay categories such as salary, benefits, and allowances.

---

## Purpose & Competitive Fit Check (Phase 1)
**Industry standard:** pie/donut for expense breakdown works only up to about 4–5 categories, beyond which bar charts are preferred since comparing bar lengths is easier than comparing pie slices ([The Bricks](https://www.thebricks.com/resources/guide-how-to-make-a-budget-pie-chart-in-excel)); payroll dashboards specifically are recommended to pair a category breakdown with a trend/comparison view over time, not just a static snapshot ([Acciyo](https://www.acciyo.com/payroll-dashboard-examples-key-metrics-and-visuals/)).

**Fit-check:** Option A (Horizontal Bars) and Option B (Donut) both match standard practice — the deciding factor is simply how many compensation categories a typical org has (donut is fine if usually ≤5, bar should win if regularly more). Option C (Period Comparison, current vs prior period per category) most directly matches the sources' recommendation to add a trend view rather than a static one — arguably the most valuable of the three for spotting cost drift, and worth weighting equally with A/B in Phase 2 rather than as a lesser third option.

---

## Filter Options
| Filter | Values |
|--------|--------|
| Pay Period | Weekly · Bi-Weekly · Monthly · **Custom** *(reveals two date fields — Beginning/Ending — to the right of the filter for user-entered dates)* |

**No Department filter.** This widget always shows the full org's Distribution breakdown (pay-type categories — Regular, Vacation, OverTime, etc.); there is no way to narrow it to one department. See "Tried and rejected" below for why.

**KPI size (3-dot menu):** Time filter only (per Hard Rule 1) — there is no other filter to drop at KPI size now.

## Data Table Sort
- Fixed default sort by Distribution (pay-type category), alphabetical.
- User can toggle the sort to Amount (descending) via a sort control — this is a two-state alphabetical/amount toggle, not open column-by-column sorting.

## Drill-Through
**NEW FEATURE — not present in the old design** (the Purpose doc confirms no drill-down exists today). Add a link from the widget out to the full Payroll History module, filtered to the same date range. Flagged clearly as new so it isn't mistaken for carrying forward existing behaviour.

## Refresh
Standalone icon on the card (not a 3-dot menu item), present at every size including KPI.

## Related New Widget (Phase 2 API, no legacy equivalent) — informational, from `Widget_Comparison_New_Widgets.html`
The Modern API defines a **`payroll-pct-of-budget`** widget in the Payroll domain — a single-purpose health check rather than a breakdown like W03, but worth cross-referencing since it's in the same module.
- **Endpoint:** `GET /api/dashboard/payroll-pct-of-budget`
- **Shape:** `{PayrollYtd, TotalExpenseBudget, PayrollPercent, ThresholdPercent(60%), IsExceedingThreshold, Note}`
- **Logic:** `PayrollYtd = SUM(PR_HistoryCompensation)` for the fiscal year (non-void, non-correction); `TotalExpenseBudget = SUM(GL_BudgetDetail)` for Expense accounts, original budget only; flags true if payroll exceeds 60% of the total expense budget.
- **Not yet covered:** no filters, sizes, or chart/table options specced — likely candidate as a KPI-style tile (e.g. a new W03 option, or its own widget) rather than a full multi-size widget; starting point only.

---

## Option A — Horizontal Bars *(Keep/Refresh)*

**Chart:** Horizontal bar per compensation category  
**Views available:** Bar (default) · Table  
**Improvement note:** Clear proportional comparison across categories.  
**Reference:** [Figma Payroll Dashboard](https://www.figma.com/community/file/1356263393257478402/free-payroll-dashboard)

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Top 3 categories only |
| **Medium (2×2)** | Top 5 categories |
| **Large (4×4)** | All categories + totals + table toggle (sort per Data Table Sort above) |
| **KPI (1×0.5)** | Headline number: **top compensation category by amount** (e.g. "Salary: $84,200"). Pay Period filter only, no download, no switch. **Flagged:** may need additional interaction beyond a static number (exact behaviour TBD) — follow up before build. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Option B — Donut Chart *(Keep/Refresh)*

**Chart:** Donut showing payroll cost split; centre label shows total  
**Views available:** Donut (default) · Table  
**Improvement note:** Best when the question is "what proportion is salary vs benefits?"  
**Reference:** [Behance Payroll UI](https://www.behance.net/gallery/221873503/HR-Payroll-Management-Dashboard-UI-Design)

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Donut only, no labels |
| **Medium (2×2)** | Donut + legend + centre total |
| **Large (4×4)** | Donut + legend + centre total + table toggle (sort per Data Table Sort above) |
| **KPI (1×0.5)** | Headline number: **Total Payroll Amount** for the selected period. Pay Period filter only, no download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Option C — Period Comparison *(Improve)*

**Chart:** Side-by-side bars — current vs prior period per category  
**Views available:** Bar (default) · Table  
**Improvement note:** Tracks cost trends; makes month-on-month change visible at a glance.  
**Reference:** [ADP Workforce Analytics](https://www.adp.com/what-we-offer/workforce-analytics.aspx)

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 3 categories, no labels |
| **Medium (2×2)** | 5 categories, period labels |
| **Large (4×4)** | All categories, legend, % change indicators, table toggle (sort per Data Table Sort above) |
| **KPI (1×0.5)** | Headline number: **category with the biggest % change vs prior period** (e.g. "Overtime: +18%"). Pay Period filter only, no download, no switch. **Flagged:** may need additional interaction beyond a static number (exact behaviour TBD) — follow up before build. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

#### Tried and rejected — Department filter, per-department rollup, and "Separate By Department" (2026-07-21, design call with Jo)

A Department filter (All Departments · Finance · Admin · Ministry · Facilities) was built and shipped in the Final Check mock — a redesign addition on top of the legacy design, which never had a department filter at all. With it: "All Departments" showed one row per department (each bar stacked by its own Distribution composition), drilling into one department showed that department's own Distribution breakdown instead, and a "Set Pay Period separately per department" checkbox let each department run on its own Start Date/Period/Recurring rather than one shared Pay Date.

**Rejected on review.** Per direct instruction, this was "kind of already a bit of a miss match" — the Department field was never confirmed to exist on the real `PRHistory`/`PRHistoryCompensation` tables (an open question this decision now closes, rather than resolves), and it added a whole extra navigation layer on top of what this widget is actually built to show: a breakdown by Distribution. Jo's call: cut it entirely, not rework it — this widget goes back to always showing the Distribution breakdown directly, matching the legacy design's own scope, while keeping every other improvement from this redesign (Bar default, Pie/Table peers, Pay-Date anchoring, recurring flag, current-vs-prior comparison). Kept here as history per the project's rule against deleting rejected ideas outright.

Removed from `Dashboard Widget Mockups.html`: the Department filter entry in `MOCK_DATA.filters[3]`; the Finance/Admin/Ministry/Facilities buckets in `MOCK_DATA.series[3]` (only 'All Departments' remains, as the sole bucket, kept as an internal key name only); the department-rollup branch, `catBreakdown`, and `hbarStacked()` stacked-bar rendering in `WRENDER[3]`; the `deptName` parameter on `w3PeriodRange()`; and the "Set Pay Period separately per department" checkbox and its per-department Start Date/Period/Recurring fields in `_renderFltBody()`.

#### Also raised, and also dropped for now — a deeper Distribution breakdown (2026-07-21, design call with Jo)

Per direct instruction: "the break down of Distributions would be amazing improvement but concept of how it should work is not clear currently." The idea — drilling into a single Distribution (e.g. "Regular") to see some further level of detail beneath it — isn't built anywhere in this mock and wasn't started as part of this pass; there's no clear concept yet of what that further detail would even be (per-employee amounts? per-pay-run history? something else?), so nothing here was designed or coded toward it.

**Not dropped outright — deferred to a dev question.** Per direct instruction, this is worth raising as an open question to the developer in **Step 5's API topic**, in a later pass: specifically, whether the backend can identify a real data link that would support drilling from a Distribution into further detail. If it can't, the idea is fully dropped rather than half-built on a guess. This is explicitly a separate, later pass, not part of this mock_work-only review — nothing has been changed in `Step 5 - API documents` yet.

## Fine-Tuning Notes
- Period Comparison (C) should show delta % next to each bar pair at Large size
- **2026-07-21 (design call with Jo):** the Department filter, its per-department rollup, and "Separate By Department" are cut — see "Tried and rejected" above for the full history. This widget always shows the org-wide Distribution breakdown now, matching the legacy design's scope; no other change to Options A/B/C. A deeper "breakdown of Distributions" idea was also raised and also dropped for now — see "Also raised, and also dropped for now" above — with a forward-pointer to raise it as a dev question in Step 5's API topic in a later pass.
