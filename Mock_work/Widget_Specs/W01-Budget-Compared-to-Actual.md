# W01 — Budget Compared to Actual

**Module:** Finance  
**Status:** ✅ Minor tweaks  
**Research doc:** [01 - Budget Compared to Actual.md](../../Dashboard Research/01 - Budget Compared to Actual.md)

## Purpose
Shows how the organisation's actual income or spending compares to what was budgeted across each period of the financial year. Helps users quickly see where they are ahead of or behind their financial plan — both month by month and as a running total.

---

## Purpose & Competitive Fit Check (Phase 1)
**Industry standard for budget-vs-actual reporting:** a grouped bar chart (Budget vs Actual side by side) is the standard for period-by-period comparison; KPI cards are recommended as a headline layer; and a waterfall/bridge chart is specifically recommended when showing how period variances build to a year-end total, for "a small number of categories, like a 6- or 12-month series" — which matches this widget's period count almost exactly ([Zebra BI](https://zebrabi.com/power-bi-waterfall-charts-explained/), [Domo](https://www.domo.com/learn/charts/waterfall-charts)). Conditional colour (green = favourable, red = unfavourable) is the universal convention ([VeloraAI](https://veloraailabs.com/blog/budget-vs-actual-variance-analysis-excel)).

**How the 3 existing options measure up:** unusually, all three are independently standard practice for this exact data, not one strong option and two weak ones — Option A (Variance Bar) is the textbook grouped-bar-plus-variance-row approach; Option B (KPI Cards + Bars) matches the "KPI layer on top of a chart" pattern the sources describe, though note they frame it as a layer, not a competing alternative; Option C (Waterfall) matches the bridge-chart recommendation almost exactly given the ~12-period count. The harder Phase 2 question for this widget isn't "which one wins" — it's whether the KPI-card layer gets pulled out and applied on top of whichever chart wins, rather than staying a separate competing option.

---

## Filter Options
| Filter | Values |
|--------|--------|
| Account Type | Income Accounts · Expense Accounts · Custom Report |
| Fiscal Year | FY 2026 · FY 2025 · FY 2024 |
| Period View | Monthly · Quarterly · **Weekly (Large/Expanded only)** |

## Data Table Sort
Fixed chronological — Period ascending, not user-sortable. This is the Finance/account-number-table default (see Hard Rules doc); HR/Payroll widgets get their own default when reached.

## Drill-Through
Confirmed this widget will link out to the underlying GL data — **target page/URL not yet available**. Open item, not a "no drill-through" decision; add the real link once provided.

## Refresh
Standalone icon on the card (not a 3-dot menu item), present at every size including KPI.

## Related New Widget (Phase 2 API, no legacy equivalent) — informational, from `Widget_Comparison_New_Widgets.html`
The Modern API defines a **`budget-vs-actual-summary`** widget that the comparison file explicitly calls out as related to this one: *"Legacy had BudgetComparedToActual (period-by-period). This is a NEW grouped summary view."* It is a separate widget key, not a replacement for W01 — flagging here for awareness in case it should become an additional Option/size variant or a standalone W18 in a future phase.
- **Endpoint:** `GET /api/dashboard/budget-vs-actual-summary?groupBy={department|fund}&accountType={0|1|2}&specialReportLineId={guid}`
- **Shape:** `{Groups:[{GroupId,GroupName,GroupType,Budget,Actual,Variance,VariancePercent,IsOverspent}], TotalBudget, TotalActual, TotalVariance}`
- **Key difference from W01:** groups by **Department or Fund** rather than by Period — a cross-section view rather than a time-series view. Ordered overspent-first, then by variance descending.
- **Not yet covered:** filters, sizes, and chart/table options for this widget are not specced anywhere — this is a starting point only, per the source comparison file.

---

## Option A — Variance Bar *(Keep/Refresh)*

**Chart:** Grouped bar chart (Budget vs Actual per period) + variance row  
**Views available:** Bar (default) · Table  
**Improvement note:** Show bars + variance row. Green/red variance row beneath bars answers "by how much?" without arithmetic.  
**Reference:** [Bold BI Budget vs Actual](https://samples.boldbi.com/solutions/finance/budget-vs-actual-dashboard)

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 4 periods shown, bars only, no variance row, no legend |
| **Medium (2×2)** | 6 periods shown, variance row visible beneath bars, legend, table toggle introduced |
| **Large (4×4)** | All periods (up to 12), variance row, legend, table toggle (fixed sort: Period ascending), Period View includes Weekly |
| **KPI (1×0.5)** | Headline: **YTD Actual + YTD Budget** shown together as two figures in one tile — needs a fit test; fall back to a single combined figure if it doesn't fit. Fiscal Year filter only, no download, no switch. |
| **Expanded** | Full-year bars + variance row/legend, table toggle, Weekly available, all three filters live inside the modal |

---

## Option B — KPI Cards + Bars *(Improve)*

**Chart:** 4 KPI headline tiles (YTD Budget, YTD Actual, Variance, % Used) above a grouped bar chart  
**Views available:** Bar (default) · Table  
**Improvement note:** Lead with 4 headline KPI tiles above bars. Users get the answer before they read the chart.  
**Reference:** [QuickBooks Budget Report](https://coefficient.io/templates/quickbooks-budget-vs-actual-report)

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | One KPI number only — Variance ($). Bars dropped entirely at this size. |
| **Medium (2×2)** | Try to fit all 4 KPI tiles (YTD Budget, YTD Actual, Variance, % Used) above a short bar list — needs a fit test; trim tiles if too tight. Switch introduced: KPI + Bars / Bars Only. |
| **Large (4×4)** | All 4 KPI tiles + full list of horizontal bars, one per period. KPI + Bars / Bars Only switch. No Data Table view in this option (see Fine-Tuning Notes). |
| **KPI (1×0.5)** | Headline: **Variance ($)** — e.g. "+$12k" — colour-coded green/red, with a trend sparkline across recent periods. Fiscal Year filter only, no download, no switch. |
| **Expanded** | All 4 KPI tiles + full horizontal bar list (or table), all three filters live inside the modal |

---

## Option C — Waterfall Chart *(Redesign)*

**Chart:** Cumulative variance waterfall — each period stacks on the last  
**Views available:** Waterfall (default) · Table  
**Improvement note:** Shows drift clearly for board-level review.  
**Reference:** [Google Looker Waterfall](https://cloud.google.com/looker/docs/best-practices/how-to-create-waterfall-charts)

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Compact step chart: "Base" segment + 3 variance steps, colour-coded green/red, minimal axis-context labelling instead of a caption |
| **Medium (2×2)** | Step chart with 5 variance steps + "Cumulative variance waterfall" caption, table toggle introduced: Waterfall / Data Table |
| **Large (4×4)** | Full-year waterfall (all periods), or the table (Period / Budget / Actual / Cumulative Variance — fixed, no longer missing), fixed sort: Period ascending, Period View includes Weekly |
| **KPI (1×0.5)** | Headline: **% Used** — deliberately different from Version B's Variance($). Paired with a tiny inline step sparkline. Fiscal Year filter only, no download, no switch. |
| **Expanded** | Full 12-period waterfall, each step clickable/hoverable, fixed table with cumulative variance column, Weekly available, all three filters live inside the modal |

---

## Fine-Tuning Notes
- All three options share the same filter set
- View toggle (bar ↔ table) should persist per option, not shared across A/B/C
- Variance colours: green = positive (under budget on expenses / over on income), red = negative
- See `Widget_Concepts/01 - Budget Compared to Actual - Version Concepts.md` and `02 - ... Widget Spec (Build).md` for full design rationale and API contract details behind this widget's decisions
