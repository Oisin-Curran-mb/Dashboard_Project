# W02 — Pension Plans

**Module:** Finance  
**Status:** 🔵 Improvement needed  
**Research doc:** [02 - Pension Plans.md](../../Dashboard Research/02 - Pension Plans.md)

## Purpose
Gives a clear overview of how much is being contributed annually across each pension plan type, with the ability to filter by church district. Lets users drill into individual appointees per plan.

---

## Purpose & Competitive Fit Check (Phase 1)
**Industry standard:** no named competitor product specifically benchmarks pension-contribution-by-district reporting — pension analytics (DOL bulletins, CalPERS) typically use bar charts to compare plan types over time ([U.S. DOL](https://www.dol.gov/agencies/odg/visualization-gallery/ebsa-private-pension-plans)). The closer general pattern is standard benefits-dashboard practice: grouped/stacked bar for cross-category comparison, donut for proportional split, table for reporting — the same three-way pattern used across most of these widgets.

**Fit-check:** Option A (grouped bar by district, coloured by plan type) is the strongest match — it's the only option that captures both dimensions the Purpose describes (district × plan type). Option B (donut by plan type) drops the district dimension entirely, answering a narrower question than the widget's stated purpose. Option C (table) is the standard reporting fallback. Because this is a genuinely two-dimensional dataset and only Option A represents both dimensions, A is the strongest default-view candidate for Phase 2, with B better positioned as a secondary "plan-type only" view.

---

## Filter Options
| Filter | Values |
|--------|--------|
| Church District | All Districts · Central · North · South · East · West |
| Plan Type | All Plans · Defined Benefit · Defined Contribution · 403(b) |
| Fiscal Year *(renamed from "Year")* | FY 2026 · FY 2025 · FY 2024 |

No Period View filter — contributions are annual figures with no sub-year breakdown in the source data (`PBAppointmentPlan`), so Monthly/Quarterly/Weekly don't apply to this widget. This is a deliberate exception, not an oversight — see Hard Rules doc, "Items intentionally decided per-widget."

**KPI size (3-dot menu):** Fiscal Year only — Church District and Plan Type are dropped, per Hard Rule 1's default.

## Data Table Sort
Fixed — sorted by Church District, districts in alphabetical order (not user-changeable). Applies to Option C's Summary Table, the table-toggle view in Options A/B, and the appointee drill-down list.

## Drill-Through
The old design's click-to-open appointee panel is **a view change within the same page, not a link to a source-data page** — it does not satisfy the drill-through requirement on its own and is kept as-is for in-widget detail. A genuine link to the underlying Pension Billing source page is confirmed needed but **has no target page/URL yet** — open item, same status as W01's GL link.

## Refresh
Standalone icon on the card (not a 3-dot menu item), present at every size including KPI.

---

## Option A — Grouped Bar by District *(Redesign)*

**Chart:** Grouped/stacked bar — bars per district, coloured by plan type  
**Views available:** Bar (default) · Stacked · Table  
**Improvement note:** Correct for comparing across districts.  
**Reference:** [Mercer Plan Dashboard](https://www.mercer.com/en-us/solutions/retirement/defined-benefit-pensions/plan-dashboard/)

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 3 districts shown, stacked bars, no legend |
| **Medium (2×2)** | All districts, grouped bars, legend |
| **Large (4×4)** | All districts, grouped bars, legend, table toggle (fixed sort: District, alphabetical) |
| **KPI (1×0.5)** | Headline number: **top district by cost** (e.g. "North: $48k"), Fiscal Year filter only, no download, no switch |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Option B — Pie by Plan Type *(Keep/Refresh)*

**Chart:** Donut/pie showing plan type proportion  
**Views available:** Donut (default) · Table  
**Improvement note:** Right chart when the question is proportional split across plan types.  
**Reference:** [PayCaptain Pensions](https://www.paycaptain.com/features/pensions-dashboard)

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Donut only, no legend |
| **Medium (2×2)** | Donut + legend beside it |
| **Large (4×4)** | Donut + legend + total contribution figure + table toggle (fixed sort: District, alphabetical) |
| **KPI (1×0.5)** | Headline number: **dominant plan type + its % of total** (e.g. "Defined Benefit: 42%"), Fiscal Year filter only, no download, no switch |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Option C — Summary Table *(Improve)*

**Chart:** Table with totals per district and per plan type  
**Views available:** Table (default) · Bar  
**Improvement note:** Best for reporting and export.  
**Reference:** [Mercer Plan Dashboard](https://www.mercer.com/en-us/solutions/retirement/defined-benefit-pensions/plan-dashboard/)

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 3-row summary (fixed sort: District, alphabetical), rows scroll internally, header fixed — card itself never scrolls |
| **Medium (2×2)** | 5-row table, same sort/scroll pattern |
| **Large (4×4)** | Full table, all districts + totals row, same sort/scroll pattern |
| **KPI (1×0.5)** | Headline number: **Total Annual Contribution** ($), Fiscal Year filter only, no download, no switch |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Fine-Tuning Notes
- Plan type filter on Option B changes the donut slice focus
- District filter should rerender bars/table without page reload
- "Donut" view label in UI should read "Donut Chart" not just "Donut"
