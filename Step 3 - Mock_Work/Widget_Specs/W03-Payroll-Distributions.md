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
| Pay Period | **Last 7 Days** *(rolling, replaces "Current Period" — proposed label, pending final wording)* · **Last 30 Days** *(rolling, replaces "Last Period" — proposed label)* · **Custom** *(reveals two date fields — Beginning/Ending — to the right of the filter for user-entered dates)* |
| Department | All Departments · Finance · Admin · Ministry · Facilities |

**Note:** Both rolling presets are calculated from today's date (not calendar week/month) — "Last 7 Days" = today minus 7, "Last 30 Days" = today minus 30. Department is kept unchanged per explicit decision, though the original Purpose doc's data-source section doesn't show a department field on `PRHistory`/`PRHistoryCompensation` — flagged for backend to confirm the field exists before build, without revisiting the filter decision itself.

**KPI size (3-dot menu):** Time filter only (per Hard Rule 1) — Department is dropped at KPI size.

## Data Table Sort
- **All Departments view** (grouped by department): fixed default sort by Department, alphabetical.
- **Drilled into a single department** (grouped by category): fixed default sort by Category, alphabetical.
- **Both levels:** user can toggle the sort to Amount (descending) via a sort control — this is a two-state alphabetical/amount toggle, not open column-by-column sorting.

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

## Fine-Tuning Notes
- Department filter narrows all three options to that department's payroll only
- Period Comparison (C) should show delta % next to each bar pair at Large size
