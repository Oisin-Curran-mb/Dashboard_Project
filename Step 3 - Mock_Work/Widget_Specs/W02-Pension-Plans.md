# W02 — Pension Plans

**Module:** Finance  
**Status:** 🔵 Improvement needed  
**Research doc:** [02 - Pension Plans.md](../../Step 1 - Dashboard Research/02 - Pension Plans.md)
**General rules:** [General Widget Design Rules.md](General%20Widget%20Design%20Rules.md)

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

---

## 2026-07-27 — Final COMPLETE, tagged v2.0, Jo design

The Final Check tab's Final build of this widget is complete and signed off by the project owner. Version badge set to v2.0 (`FC_VERSION[2]`); title badges: "Final" and "Jo design". The Final renders by default; the earlier A/B/C options stay reachable from the section's design-option switch. Summary of what shipped:

**Composition (per the confirmed composition sheet):** ported from Jo Lopez's Widget Container Demo pension design (its pen block, rebuilt as the additive penF/PENF_ block beside `WRENDER[2]` in `Dashboard Widget Mockups.html`; the A/B/C branches are untouched): the KPI headline (total annual contribution plus an appointee-count badge with a plain-language tooltip), the district filter chip, her sortable plan table (colour-dot rows, share bars at Explore and a quiet share percent at Detail, "Total annual contribution (N appointees)" footer, her sort rules: plan ascending on first click, appointee count and annual amount descending first, amount descending as the default), her donut pie by plan type promoted to a top-level view (centre total, legend with money and percent, every slice's legend entry drillable), her drill modal (Appointee / Church organisation / District / Annual amount, footer count and total, and its own Export to Excel button), her two-export contract (the widget's 3-dot menu exports the on-screen plan summary as CSV/Excel/PDF; the modal exports the appointee detail; both are honest stubs with toast feedback here, neither fakes a download), her "No active pension appointments" empty state with the Pension Billing guidance, and her accessibility layer (sr-only text per row, bar and slice; a listbox district popover; aria-pressed view toggles; role="dialog" modal). **NEW in this build:** a Grouped Bar by District view, built in her visual language (warm-neutral tracks, her amethyst plan ramp so the same plan keeps the same colour across table dots, pie slices and bars, values as text and sr-only): district groups along the x-axis, one bar per plan in each group, a group total under each district, and each bar drilling to that plan AND that district.

**Owner decisions layered on Jo's design (v2 deltas):** Table is the default view — an owner choice over the doc's earlier Pie default (and over Jo's own chart-first arrangement); a 3-view model (Table / Pie by Plan Type / Grouped Bar by District), with Explore showing ONE view under a 3-way toggle and Detail showing her synced two panels (the table always on the left, the active chart on the right under a 2-way Pie / By district toggle, both panels always reflecting the same district filter and sort); Glance is her KPI card (money, appointee pill, "contributed a year across N plans, district scope" caption, compact empty variant); three sizes only per Rule 12, named Glance / Explore / Detail, no Small — the A/B/C design options keep their old sizes, and the fc-fmode sizing guard was made generic (any widget whose Final Check state is on option F) with W01's behaviour unchanged; the district chip is the ONLY fetch trigger (~800ms skeleton with a spinner riding in the chip; sort, view switches and the drill are instant client re-renders); and deliberately NO Time Window Module for this widget — it is a snapshot of the pension appointments active today, not a time series, so there is no window or interval to pick.

**Data correction found during the build:** Jo's source comment (and the build brief) quote a 55,212.43 total for her five plans, but her plan totals (24,000.00 + 7,532.56 + 7,037.31 + 6,682.56 + 3,000.00) sum to 48,252.43 — which is what her own demo renders and what this build renders. The 55,212.43 is an arithmetic slip in her comment, not in the data; the widget computes every total from the appointee rows, never from a hardcoded figure, so the on-screen number is the reconciled one. (The PENF_ data constants — 10 appointees, 5 plans, 3 districts — live beside `WRENDER[2]`, deliberately not in MOCK_DATA, so `mock-data.master.js` needs no re-sync.)

**Verification:** 175-assertion per-widget Node DOM-shim driver, browser-faithful CSS parse check (0 dropped rules), click-path test green, final-check-rules.py 0 HIGH, and this widget's old F4 accessibility finding fixed (values as text/sr-only, listbox popover, aria-pressed toggles, role="dialog" modal). `FC_VERSION[2]` = 2.0.

**Still open (unchanged, tracked in the Step 4 doc's Sign-off Readiness):** the genuine drill-through link to the underlying Pension Billing source page still has no target page/URL — the Final's drill modal remains an in-widget view change, not a page link, exactly as before.
