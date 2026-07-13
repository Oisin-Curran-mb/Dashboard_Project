# Master Dashboard Widget Filter Spec

> **Purpose of this document:** consolidates the per-widget filter/chrome specs (download, chart-type switching, refresh, sizes, sort, account/fiscal-year/period filters, info eye, headers, drill-through) for all 17 dashboard widgets into one file. Built from `Dashboard Research/` (old-design source of truth) cross-referenced against `Mock_work/Widget_Specs/` (new-concept drafts) and `Mock_work/Widget_Concepts/00 - Redesign Hard Rules.md` (global governance).
>
> **This file is the source for an Excel build.** Suggested structure once converted: one sheet for the Widget Index below, one sheet for the Open Items appendix, and one sheet per widget (or one long sheet grouped by widget #) for the detail sections.
>
> **Status:** 15 of 17 widgets fully resolved this pass. W08 (My Status) and W14 (Main Content Tasks) are explicitly deferred — see their sections and the Open Items appendix.
>
> **Footnote (2026-07-09):** W08 and W14 remain intentionally out of scope for the current consolidation/competitor-benchmark phase of work too. Both are old-design widgets whose core model (keep, redesign, or drop) is a product decision, not a dashboard-design or data question — no further time is being spent on them until that decision is made elsewhere. They stay on this list as a reminder that they're still part of the 17, not forgotten.

---

## How to read this document

Each widget section follows the same shape:
- **Purpose** — what the widget is for (from the old-design research, corrected where the new draft mismatched reality)
- **Mismatch/decision notes** — where the new concept draft didn't match the real underlying data or dropped a real feature, and what was decided
- **Filter Options** — the confirmed filter set, with dynamic/illustrative values flagged as such
- **Data Table Sort** — sort behaviour where a table view exists
- **Drill-Through** — whether/where this widget links to source data
- **Refresh** — confirmed universal (see Global Rule 7)
- **Options A/B/C** — the concept variations, each with a Size Behaviour table (Small/Medium/Large/KPI/Expanded, where offered)

Universal defaults that apply to every widget unless a section says otherwise:
- **Refresh** is a standalone icon, present at every size including KPI (Rule 7)
- **Info Eye** (👁) is present on every widget/size; its header is the widget's name, body text is the widget's purpose text, unchanged otherwise (Rule 3)
- **Download** (Excel/CSV) is present at Small/Medium/Large/Expanded, removed at KPI (Rule 1)
- **Chart/view switch** is present wherever a size offers more than one view, removed at KPI (Rule 1); the currently active option greys out and disables itself, the alternative stays clickable (Rule 4)
- **Headers** are added/removed per size following the whitespace escalation ladder (header → filter bar → enlarge chart), not a fixed per-size rule — see `00 - Redesign Hard Rules.md`, Technical Build Rules doc, Rule T8
- **Sizes**, when offered, are fixed grid footprints: Small 1×1, Medium 2×2, Large 4×4, KPI 1×0.5 (same width as Small, half height), Expanded unchanged from today's build (Rule 6). Not every widget offers every size — confirmed exceptions are called out per widget.
- **Filter/size/view state** is scoped to one widget instance, never global (Rule 5)

---

## Widget Index

| # | Widget | Module | Status | Sizes Offered | # Live Options | Key Flag |
|---|---|---|---|---|---|---|
| 01 | Budget Compared to Actual | Finance | ✅ Resolved | S/M/L/KPI/Expanded | 3 (A/B/C) | Drill-through target (GL) not yet available |
| 02 | Pension Plans | Finance | ✅ Resolved | S/M/L/KPI/Expanded | 3 (A/B/C) | Drill-through target (Pension Billing) not yet available |
| 03 | Payroll Distributions | Payroll | ✅ Resolved | S/M/L/KPI/Expanded | 3 (A/B/C) | Department filter field needs backend confirmation |
| 04 | Remittance Pledges | Finance | ✅ Resolved | S/M/L/KPI/Expanded | 3 (A/B/C) | "Campaign" renamed to Activity Type (was a mix-up with W17) |
| 05 | Receivable Invoices Outstanding | Finance | ✅ Resolved | S/M/L/KPI/Expanded | 2 (B/C — A removed) | 5-bucket aging restored; KPI headline still under review |
| 06 | Insurance Billing Plans | HR | ✅ Resolved | S/M/L/KPI/Expanded | 3 (A/B/C) | Status filter dropped — not backed by real data |
| 07 | Deposit Accounts | Finance | ⚠️ Baseline only | S/M/L/KPI/Expanded (baseline) | 0 committed, 3 speculative | Whole reconciliation concept mismatched — needs expert/dev sign-off |
| 08 | My Status | Other | ⏸️ Deferred | — | — | Core model unresolved — 21-query picker vs. unified schema |
| 09 | Payroll Scheduled Time Off | Payroll | ✅ Resolved | M/L/KPI/Expanded (no Small) | 2 (A/B) | Approval workflow restored as Option B |
| 10 | Loans With Balance Due | Finance | ✅ Resolved | S/M/L/KPI/Expanded | 3 (A/B/C) | Status field unconfirmed; account-name link destination unknown |
| 11 | Fixed Asset Values | Finance | ✅ Resolved | S/M/L/KPI/Expanded | 3 (A/B/C) | Restored real 3-dropdown cascading filter system |
| 12 | (Empty Slot) | Other | ✅ Removed | — | — | "None" option removed from the widget selector entirely |
| 13 | Purchasing Management | Finance | ✅ Resolved | M/L/KPI/Expanded (no Small) | 3 (A/B/C) | Encumbrance chart dropped; Kanban confirmed primary |
| 14 | Main Content Tasks | Other | ⏸️ Deferred | — | — | Core model unresolved — nav panel vs. to-do list |
| 15 | Bank Balances | Finance | ✅ Resolved | S/M/L/KPI/Expanded | 3 (A/B/C) | Single Account breakdown view restored across all options |
| 16 | Accounts Payable By Due Date | Finance | ✅ Resolved | S/M/L/KPI/Expanded | 3 (A/B/C) | Drill-through recommended, pending expert/dev confirmation |
| 17 | Gifts Pledges | Finance | ✅ Resolved | S/M/L/KPI/Expanded | 3 (A/B/C) | "Campaign" confirmed correct here (mirror of W04's mix-up) |

---

## Open Items — Questions for Experts / Dev Team

Consolidated from every widget section below. Nothing in this list should be treated as decided — each needs a follow-up conversation before build.

**Global:**
- Confirm the Finance vs. Payroll/HR data-table sort domain patterns hold as more widgets in each domain are built (see Hard Rules doc).
- Confirm Weekly period view is evaluated per-widget on real data support, not assumed present/absent.

**W01 Budget Compared to Actual:**
- Drill-through target (GL account detail page) doesn't exist yet — need the actual link before building.
- Version A's dual-figure KPI tile (YTD Actual + YTD Budget) needs a fit test at 1×0.5.
- Version B's Medium size (all 4 KPI tiles above a bar list) needs a fit test at 2×2.
- Backend needs 3 new endpoints (comparison/kpi-summary/waterfall) — none exist today.
- Weekly Period View data availability at Large/Expanded needs a backend check (GLSummary/GLBudgetDetail post monthly today).

**W02 Pension Plans:**
- Drill-through target (Pension Billing source page) doesn't exist yet.

**W03 Payroll Distributions:**
- Confirm a Department field actually exists on `PRHistory`/`PRHistoryCompensation` before building the Department filter.
- Options A and C's KPI tiles may need interaction beyond a static number — exact behaviour undefined.
- "Last 7 Days" / "Last 30 Days" are proposed labels, pending final wording sign-off.

**W04 Remittance Pledges:**
- Is "Current Month" a rolling 30-day window or the calendar month in progress? Same question for "Last Month."
- Does "% Paid"/"YTD Expected" always compute against the full fiscal year, or re-baseline per selected Date Range?
- New drill-through link to the Remittance module needs to be built (confirmed wanted, not yet existing).

**W05 Receivable Invoices Outstanding:**
- KPI headline for both remaining options (B and C) is still under review — not finalized.
- Raise with dev: is a fiscal-year-scoped filter on invoice posting date worth adding (does not change the aging math itself)?

**W06 Insurance Billing Plans:**
- Could Employer Contribution ($), Monthly Amount ($), and Status be added as future columns/filters? Not in scope now, but a real product question.
- Confirm whether Plan Type is shown or dropped at KPI size (flagged for review).

**W07 Deposit Accounts:**
- **Biggest open item in this document.** Ask design experts which (if any) of the three reconciliation-oriented concepts they want to pursue over the plain baseline.
- Ask dev: can reconciliation status / Last Reconciled data be sourced or added to `DHAccount` at all? Nothing today confirms this.
- Do not build Options A/B/C until both are answered.

**W09 Payroll Scheduled Time Off:**
- KPI dual-figure tile (Pending Approvals + Out today/this week) needs a fit test at 1×0.5, same pattern as W01.

**W10 Loans With Balance Due:**
- Confirm whether `LNLoan` has (or can get) a real Active/In Arrears field — Status filter is currently unconfirmed.
- Raise with dev: fiscal-year-scoped filter on loan origination date?
- Find out where the existing account-name links in the table actually navigate to — old research never confirmed this.

**W11 Fixed Asset Values:**
- Tag # ascending sort is a proposed default, not confirmed in the old design — sign off before build.
- Confirm the KPI tile's fixed "Total Net Value, org-wide" design decision with product (it deliberately ignores the widget's own Group By/Specific Group/Financial Measure filters).

**W13 Purchasing Management:**
- Department, Year, and "Overdue" status are kept in the spec but flagged for backend/data review — none are confirmed against real purchasing data (real filters are Status stages + Approval Path).
- Date Issued descending sort is a proposed default, not confirmed.

**W15 Bank Balances:**
- Ask experts/dev: should Last Reconciled / status become a real visible field, and if so what does "Last Reconciled" mean precisely?
- Confirm the KPI tile's design decision to always show the All-Accounts aggregate regardless of Account selection.

**W16 Accounts Payable By Due Date:**
- Drill-through to the AP module is recommended but not decided — raise with experts/dev.

**W17 Gifts Pledges:**
- Pledge Due/% Due math needs to be redefined for the Current Month/Year to Date presets (old design's schedule-aware math assumed a single as-of date) — flag for product/dev before build.
- KPI headline (overall % Due vs. Total Due Remaining) — whichever tests better, not finalized.

**Deferred entirely (see their sections):**
- **W08 My Status** — core model (21-query picker vs. unified action-item schema vs. hybrid), row-behaviour preservation, and size-capping order are all unresolved.
- **W14 Main Content Tasks** — core model (context-aware nav panel vs. real to-do list) is unresolved.

---

## Governance Reference — Redesign Hard Rules (summary)

Full document: `Mock_work/Widget_Concepts/00 - Redesign Hard Rules.md`. Summary table:

| Rule | One-line summary |
|---|---|
| 1 | KPI menu = Time filter + Widget size + Fullscreen only. No downloads, no view switch. |
| 2 | No size scrolls except the Expanded pop-up; tables scroll internally (rows only, header fixed) at every size. |
| 3 | Remove card footer rationale text; Eye body stays the same; Eye header becomes the widget's name. |
| 4 | Active view/chart toggle option is greyed out and disabled; the alternative stays clickable. |
| 5 | All filter/size/view state is per-widget-instance — never global or shared. |
| 6 | Fixed grid: Small 1×1, Medium 2×2, Large 4×4, KPI 1×0.5, Page 4×8 (grows down only), Expanded unchanged. Not every widget offers every size (W09, W13 confirmed exceptions). |
| 7 | Refresh is a standalone icon (not a menu item), present at every size including KPI. |

Items intentionally decided per-widget rather than as a global rule: Data Table sort behaviour (domain patterns: Finance = fixed alphabetical/chronological; Payroll/HR = fixed alphabetical + amount-toggle), Weekly period view (added only where real data supports it), Drill-through (evaluated case by case).

---

# W01 — Budget Compared to Actual

**Module:** Finance · **Status:** ✅ Minor tweaks · **Research doc:** `Dashboard Research/01 - Budget Compared to Actual.md`

## Purpose
Shows how the organisation's actual income or spending compares to what was budgeted across each period of the financial year. Helps users quickly see where they are ahead of or behind their financial plan — both month by month and as a running total.

## Filter Options
| Filter | Values |
|--------|--------|
| Account Type | Income Accounts · Expense Accounts · Custom Report |
| Fiscal Year | FY 2026 · FY 2025 · FY 2024 |
| Period View | Monthly · Quarterly · **Weekly (Large/Expanded only)** |

## Data Table Sort
Fixed chronological — Period ascending, not user-sortable. Finance/account-number-table default.

## Drill-Through
Confirmed this widget will link out to the underlying GL data — **target page/URL not yet available**. Open item, not a "no drill-through" decision.

## Refresh
Standalone icon, present at every size including KPI.

### Option A — Variance Bar *(Keep/Refresh)*
Grouped bar chart (Budget vs Actual per period) + variance row. Views: Bar (default) · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | 4 periods shown, bars only, no variance row, no legend |
| Medium (2×2) | 6 periods shown, variance row visible beneath bars, legend, table toggle introduced |
| Large (4×4) | All periods (up to 12), variance row, legend, table toggle (fixed sort: Period ascending), Period View includes Weekly |
| KPI (1×0.5) | Headline: **YTD Actual + YTD Budget** together as two figures — needs a fit test; fall back to a single combined figure if it doesn't fit. Fiscal Year filter only. |
| Expanded | Full-year bars + variance row/legend, table toggle, Weekly available, all three filters live inside the modal |

### Option B — KPI Cards + Bars *(Improve)*
4 KPI headline tiles (YTD Budget, YTD Actual, Variance, % Used) above a grouped bar chart. Views: Bar (default) · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | One KPI number only — Variance ($). Bars dropped entirely. |
| Medium (2×2) | Try to fit all 4 KPI tiles above a short bar list — needs a fit test; trim if too tight. Switch introduced: KPI + Bars / Bars Only. |
| Large (4×4) | All 4 KPI tiles + full list of horizontal bars, one per period. No Data Table view in this option. |
| KPI (1×0.5) | Headline: **Variance ($)** — colour-coded green/red, with a trend sparkline. Fiscal Year filter only. |
| Expanded | All 4 KPI tiles + full horizontal bar list (or table), all three filters live inside the modal |

### Option C — Waterfall Chart *(Redesign)*
Cumulative variance waterfall — each period stacks on the last. Views: Waterfall (default) · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | Compact step chart: "Base" segment + 3 variance steps, colour-coded, minimal axis labelling instead of a caption |
| Medium (2×2) | Step chart with 5 variance steps + caption, table toggle introduced |
| Large (4×4) | Full-year waterfall, or table (Period/Budget/Actual/Cumulative Variance — fixed, no longer missing), fixed sort: Period ascending, Weekly available |
| KPI (1×0.5) | Headline: **% Used** — deliberately different from Version B's Variance($). Fiscal Year filter only. |
| Expanded | Full 12-period waterfall, each step clickable/hoverable, fixed table with cumulative variance column, all filters live inside the modal |

**Fine-tuning:** All three options share the same filter set. View toggle persists per option, not shared across A/B/C. Variance colours: green = positive, red = negative. Full design rationale and API contracts: see `Widget_Concepts/01 - ... Version Concepts.md` and `02 - ... Widget Spec (Build).md`.

---

# W02 — Pension Plans

**Module:** Finance · **Status:** 🔵 Improvement needed · **Research doc:** `Dashboard Research/02 - Pension Plans.md`

## Purpose
Gives a clear overview of how much is being contributed annually across each pension plan type, with the ability to filter by church district. Lets users drill into individual appointees per plan.

## Filter Options
| Filter | Values |
|--------|--------|
| Church District | All Districts · Central · North · South · East · West |
| Plan Type | All Plans · Defined Benefit · Defined Contribution · 403(b) |
| Fiscal Year *(renamed from "Year")* | FY 2026 · FY 2025 · FY 2024 |

No Period View filter — contributions are annual figures with no sub-year breakdown in the source data (`PBAppointmentPlan`). KPI size: Fiscal Year only.

## Data Table Sort
Fixed — sorted by Church District, alphabetical. Applies to Option C's table, the table-toggle view in A/B, and the appointee drill-down list.

## Drill-Through
The old design's click-to-open appointee panel is a view change within the same page, not a link to a source-data page — kept as-is for in-widget detail. A genuine link to the Pension Billing source page is confirmed needed but **has no target page/URL yet**.

## Refresh
Standalone icon, present at every size including KPI.

### Option A — Grouped Bar by District *(Redesign)*
Grouped/stacked bar — bars per district, coloured by plan type. Views: Bar (default) · Stacked · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | 3 districts shown, stacked bars, no legend |
| Medium (2×2) | All districts, grouped bars, legend |
| Large (4×4) | All districts, grouped bars, legend, table toggle (fixed sort: District, alphabetical) |
| KPI (1×0.5) | Headline: **top district by cost** (e.g. "North: $48k"). Fiscal Year filter only. |
| Expanded | Same as Large, all filters live inside the modal |

### Option B — Pie by Plan Type *(Keep/Refresh)*
Donut/pie showing plan type proportion. Views: Donut (default) · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | Donut only, no legend |
| Medium (2×2) | Donut + legend beside it |
| Large (4×4) | Donut + legend + total contribution figure + table toggle |
| KPI (1×0.5) | Headline: **dominant plan type + its % of total** (e.g. "Defined Benefit: 42%") |
| Expanded | Same as Large, all filters live inside the modal |

### Option C — Summary Table *(Improve)*
Table with totals per district and per plan type. Views: Table (default) · Bar.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | 3-row summary, rows scroll internally, header fixed |
| Medium (2×2) | 5-row table, same sort/scroll pattern |
| Large (4×4) | Full table, all districts + totals row |
| KPI (1×0.5) | Headline: **Total Annual Contribution** ($) |
| Expanded | Same as Large, all filters live inside the modal |

**Fine-tuning:** Plan type filter on B changes the donut slice focus. District filter rerenders without page reload. "Donut" label should read "Donut Chart."

---

# W03 — Payroll Distributions

**Module:** Payroll · **Status:** ✅ Minor tweaks · **Research doc:** `Dashboard Research/03 - Payroll Distributions.md`

## Purpose
Shows a breakdown of payroll amounts by compensation type across a chosen date range.

## Filter Options
| Filter | Values |
|--------|--------|
| Pay Period | **Last 7 Days** (rolling, proposed label pending sign-off) · **Last 30 Days** (rolling, proposed label) · **Custom** (reveals Beginning/Ending date fields) |
| Department | All Departments · Finance · Admin · Ministry · Facilities |

Both rolling presets calculate from today's date. Department kept per explicit decision, though not confirmed as a real field on `PRHistory`/`PRHistoryCompensation` — flagged for backend. KPI size: time filter only, Department dropped.

## Data Table Sort
All Departments view: fixed by Department, alphabetical. Drilled into a department: fixed by Category, alphabetical. Both levels: user can toggle to Amount descending (two-state toggle, not open column sort).

## Drill-Through
**NEW FEATURE** — no drill-down exists today. Add a link to the full Payroll History module, filtered to the same date range.

## Refresh
Standalone icon, present at every size including KPI.

### Option A — Horizontal Bars *(Keep/Refresh)*
Horizontal bar per compensation category. Views: Bar (default) · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | Top 3 categories only |
| Medium (2×2) | Top 5 categories |
| Large (4×4) | All categories + totals + table toggle |
| KPI (1×0.5) | Headline: **top category by amount** (e.g. "Salary: $84,200"). **Flagged:** may need interaction beyond a static number. |
| Expanded | Same as Large, all filters live inside the modal |

### Option B — Donut Chart *(Keep/Refresh)*
Donut showing payroll cost split; centre label shows total. Views: Donut (default) · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | Donut only, no labels |
| Medium (2×2) | Donut + legend + centre total |
| Large (4×4) | Donut + legend + centre total + table toggle |
| KPI (1×0.5) | Headline: **Total Payroll Amount** for the selected period |
| Expanded | Same as Large, all filters live inside the modal |

### Option C — Period Comparison *(Improve)*
Side-by-side bars — current vs prior period per category. Views: Bar (default) · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | 3 categories, no labels |
| Medium (2×2) | 5 categories, period labels |
| Large (4×4) | All categories, legend, % change indicators, table toggle |
| KPI (1×0.5) | Headline: **category with the biggest % change** (e.g. "Overtime: +18%"). **Flagged:** may need interaction beyond a static number. |
| Expanded | Same as Large, all filters live inside the modal |

**Fine-tuning:** Department filter narrows all three options. Period Comparison shows delta % next to each bar pair at Large.

---

# W04 — Remittance Pledges

**Module:** Finance · **Status:** 🔵 Improvement needed · **Research doc:** `Dashboard Research/04 - Remittance Pledges.md`

## Purpose
Shows how well the organisation is keeping up with its remittance pledge commitments to a conference/denominational body, for each activity type.

## Filter Options
| Filter | Values |
|--------|--------|
| Date Range | Current Month · Last Month · **Custom** (reveals Beginning/Ending date fields) |
| Activity Type *(corrected from "Campaign" — was a mix-up with W17)* | All Activity Types · dynamic from `RMActivityRepository` |
| Fiscal Year | FY 2026 · FY 2025 · FY 2024 |

**Open questions (not decided):** is "Current Month"/"Last Month" rolling or calendar-based? Does % Paid/YTD Expected always compute against the full fiscal year, or re-baseline per Date Range? **Date persistence:** selection must persist across refresh (old design's real behaviour — the "resets on refresh" note in the earlier draft was itself a documentation error). KPI size: Fiscal Year only.

## Data Table Sort
Fixed — Sequence number (Seq.) ascending, matching old design's row order.

## Drill-Through
**NEW FEATURE** — add a link to the full Remittance module, filtered to the same activity type/date.

## Refresh
Standalone icon, present at every size including KPI.

### Option A — Progress Bars *(Keep/Refresh)*
Horizontal progress bar per activity type. Views: Bar (default) · Pie · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | 2 activity types, % label only |
| Medium (2×2) | 4 activity types, received/pledged values |
| Large (4×4) | All activity types, full values + % + table toggle |
| KPI (1×0.5) | Headline: **activity type with lowest % Paid** (biggest shortfall) |
| Expanded | Same as Large, all filters live inside the modal |

### Option B — Paired Bars *(Improve)*
Side-by-side bars (pledged vs received) per activity type. Views: Bar (default) · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | 3 activity types, no legend |
| Medium (2×2) | 5 activity types + legend |
| Large (4×4) | All activity types + legend + outstanding amount labels |
| KPI (1×0.5) | Headline: **Total Outstanding ($)** |
| Expanded | Same as Large, all filters live inside the modal |

### Option C — Summary Table *(Keep/Refresh)*
Table — Pledged/Received/Outstanding/% per activity type. Views: Table (default) · Cards.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | 3 rows, rows scroll internally, header fixed |
| Medium (2×2) | 5 rows, same sort/scroll pattern |
| Large (4×4) | All rows + totals row + % column |
| KPI (1×0.5) | Headline: **overall % Paid** (YTD Paid ÷ Annual) |
| Expanded | Same as Large, all filters live inside the modal |

**Fine-tuning:** Activity Type filter highlights the selected bar. Outstanding amounts always red/amber.

---

# W05 — Receivable Invoices Outstanding

**Module:** Finance · **Status:** 🔴 Critical fix needed · **Research doc:** `Dashboard Research/05 - Receivable Invoices Outstanding.md`

## Purpose
Shows how much is owed in unpaid invoices and how long they've been outstanding, grouped into age buckets.

## Filter Options
| Filter | Values |
|--------|--------|
| Age Band | All Ages · Current (0-30) · 31-60 · 61-90 · 91-120 · 121+ *(restored real 5-bucket structure — the draft's 4-band version merged 91-120 and 121+)* |
| Revenue Center *(replaces invented "Account")* | All Revenue Centers · Church · Insurance Billing · Pension Billing · School |
| Source *(replaces invented "Account")* | All Sources · Insurance Billing · Pension Billing |

Fiscal Year filter dropped (aging is an as-of-today snapshot) — flagged as a dev question re: posting-date scoping. KPI size: no filter at all, just Widget size + Fullscreen (Rule 1 exception).

## Data Table Sort
Age-band summary table: fixed by age band ascending. Option C's full invoice-level table: click-to-sort on any column (per its own design intent).

## Drill-Through
No separate page link — no single unambiguous source page (data spans multiple modules). The existing rich in-page detail panel (bucket → invoice list → Details/Attachments/Note/Payments tabs, Export, Close) stands as this widget's answer.

## Refresh
Standalone icon, present at every size including KPI.

### Option A — **REMOVED**
Judged too similar to Option B (KPI tiles + aging bars); B does the job better alone. This widget has 2 live options, not 3.

### Option B — KPI + Aging Bars *(Improve)*
KPI tiles (Total Outstanding, Overdue, Current, Oldest Invoice) above aging bars. Views: Bar (default) · Table.

| Size | Behaviour |
|------|-----------|
| Small | 2 KPI tiles only |
| Medium | 4 KPI tiles + small bar |
| Large | 4 KPI tiles + full aging bars (5 buckets) + table toggle |
| KPI (1×0.5) | **Under review, not finalized.** Candidate: Total Outstanding ($). |
| Expanded | Same as Large |

### Option C — Aging Table *(Keep/Refresh)*
Table — Invoice #/Customer/Amount/Age/Due Date. Views: Table (default) · Bar.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | 3 rows, rows scroll internally, header fixed |
| Medium (2×2) | 5 rows, same pattern |
| Large (4×4) | Full list, totals per age band (5 buckets), click-to-sort any column |
| KPI (1×0.5) | **Under review**, same as Option B. Candidate: Total Outstanding ($) or count of 121+ invoices. |
| Expanded | Same as Large |

**Fine-tuning:** 121+ bucket always red, 91-120 amber. Old widget's pie chart was wrong for aging data — neither remaining option uses pie.

---

# W06 — Insurance Billing Plans

**Module:** HR · **Status:** 🔵 Improvement needed · **Research doc:** `Dashboard Research/06 - Insurance Billing Plans.md`

## Purpose
Shows how many people (employees + dependents) are enrolled in each insurance plan, filterable by insurance type.

## Filter Options
| Filter | Values |
|--------|--------|
| Plan Type | All Plans · dynamic list (plan/type names are org-entered elsewhere; illustrative values only) |

Status filter dropped — real data only supports Plan + Enrolled count today; open product question re: adding Employer Contribution/Monthly Amount/Status later. KPI size: Plan Type only, or none (flagged for review).

## Data Table Sort
Fixed — alphabetical by Plan name, with a user toggle to Enrolled-count descending. Payroll/HR domain default (matches W03's pattern).

## Drill-Through
No drill-through — matches old design, avoids surfacing individual employee/dependent names at dashboard level.

## Refresh
Standalone icon, present at every size including KPI.

### Option A — Horizontal Bar by Plan *(Keep/Refresh)*
Horizontal bar per plan showing enrolment count. Views: Bar (default) · Pie · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | Top 3 plans |
| Medium (2×2) | Top 5 plans |
| Large (4×4) | All plans + total enrolment + table toggle |
| KPI (1×0.5) | Headline: **plan with highest enrollment** |
| Expanded | Same as Large |

### Option B — Donut by Plan *(Improve)*
Donut showing proportional enrolment split. Views: Donut (default) · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | Donut only |
| Medium (2×2) | Donut + legend |
| Large (4×4) | Donut + legend + enrolment numbers + table toggle |
| KPI (1×0.5) | Headline: **dominant plan + its % of total** |
| Expanded | Same as Large |

### Option C — Summary Table *(Improve)*
Table — Plan/Enrolled/% of Total (*Active/Inactive columns removed — not backed by real data*). Views: Table (default) · Bar.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | 3 rows, rows scroll internally, header fixed |
| Medium (2×2) | 5 rows, same pattern |
| Large (4×4) | Full table + totals row |
| KPI (1×0.5) | Headline: **Total Enrollment** (count) |
| Expanded | Same as Large |

**Fine-tuning:** If a plan literally named "COBRA" exists, distinguish visually — org-dependent, not a fixed rule.

---

# W07 — Deposit Accounts

**Module:** Finance · **Status:** ⚠️ Baseline only — 3 options speculative, pending expert/dev sign-off · **Research doc:** `Dashboard Research/07 - Deposit Accounts.md`

## ⚠️ Major mismatch — unresolved pending expert/dev input
Old design's real data (`DHAccount`/`DHTypeRepository`) has **no reconciliation concept at all** — just name, inception date, account number, balance, grouped by type. The draft's three options were built entirely around reconciliation status (green/amber/red badges, Last Reconciled) — likely written with W15 Bank Balances in mind. **Decided for this pass:** ship the baseline (matches old design exactly); keep A/B/C as speculative concepts pending: (1) which concept design experts actually want, and (2) whether dev can even source/add reconciliation data to `DHAccount`. Do not build A/B/C until both are answered.

## Baseline (ships if no concept is approved)
Table (Name, Inception Date, Account Number, Ending Balance, totals row) + pie chart ("By Account Type"). Sort: fixed, Name then Inception Date.

## Filter Options
| Filter | Values |
|--------|--------|
| Account Type | All Types (default) · dynamic from `DHTypeRepository` |

**Filter scope kept intentionally quirky** (matches old design): narrows the table only; pie chart always shows all types (fixing this would collapse the pie to one slice). KPI size: no filter, or Account Type only. Headline: **Total balance across all active deposit accounts.**

## Data Table Sort
Fixed — Name, then Inception Date.

## Drill-Through
Open question for experts/dev, not decided — no drill-down in old design.

## Refresh
Standalone icon, present at every size including KPI.

### Option A (concept, not committed) — Balance Cards
Card per account + reconciliation badge. Small: 2 cards stacked. Medium: 3-4 cards in a row. Large: all accounts + reconciliation status + totals.

### Option B (concept, not committed) — Vertical Bar Chart
Vertical bar per account. Small: 3 bars, no labels. Medium: all bars + labels. Large: all bars + labels + reconciliation indicators.

### Option C (concept, not committed) — Summary Table
Table — Account/Balance/Last Reconciled/Status. Small: 2 rows. Medium: 4 rows. Large: all rows + totals row.

**Fine-tuning (apply only if a concept is approved):** reconciliation badges green/amber/red.

---

# W08 — My Status ⏸️ DEFERRED

**Module:** Other · **Status:** Deferred, revisit later · **Research doc:** `Dashboard Research/08 - My Status.md`

Old design lets a user pick up to 21 heterogeneous queries (some with due dates, some without; some open a panel, some navigate away) via a Select-button picker. The draft's Item Type/Priority filters and KPI-tile concept assume one uniform action-item schema that doesn't fit most of those queries (e.g. "Employee Birthdays Next Month," "Check Register Summary").

**Unresolved — three open questions:**
1. Core model: keep the old per-user query-picker as-is, redesign around a unified schema, or hybrid?
2. Preserve the existing mixed row behaviour (panel vs. navigate-away) exactly as today?
3. How should Small/Medium sizes decide which selected queries to show first when not all fit?

Do not build against the original draft's Options A/B/C until revisited.

---

# W09 — Payroll Scheduled Time Off

**Module:** Payroll · **Status:** ✅ Minor tweaks (major mismatch resolved) · **Research doc:** `Dashboard Research/09 - Payroll Scheduled Time Off.md`

## Purpose
Gives supervisors a view of scheduled time-off requests by department and employee, with the ability to approve/reject directly.

## ⚠️ Mismatch resolved
Old design's defining feature — a 3-level expandable list (Department → Employee → Day) with inline approve/reject, the *only* widget with direct user action — was dropped entirely in the draft's three read-only options. **Resolved:** this widget now has 2 options, not 3 (Option C dropped). **No Small size, for either option** — first confirmed no-Small example alongside W13.

## Filter Options
| Filter | Values |
|--------|--------|
| Calendar Year | Dynamic — only years with records appear, defaults to most recent |
| View | Show All · Show Pending · Show Approved (the filter the earlier draft dropped) |
| Leave Type | Dynamic — org-configured labels (Vacation/Sick/Personal/Misc. by default, renamable) |
| Department | Only shown if a supervisor covers more than one department |

Calendar Year and View persist per user across sessions. KPI size: Calendar Year only.

## Data Table Sort
Fixed — Department alphabetical, then Employee alphabetical, then Day chronological. Not user-changeable.

## Drill-Through
No external link — Option B's drill-in confirmation view already satisfies this internally.

## Refresh
Standalone icon, present at every size including KPI.

### Option A — Leave Calendar *(Redesign)*
Mini calendar grid showing leave days per employee. Views: Calendar (default) · List. *(No Small size.)*

| Size | Behaviour |
|------|-----------|
| Medium (2×2) | 2-week view with employee initials |
| Large (4×4) | Month view, full names, hover for details |
| KPI (1×0.5) | Headline: **Pending Approvals** count + **Out today/this week** secondary figure — needs a fit test |
| Expanded | Month view, all filters live inside the modal |

### Option B — Confirmation Dashboard *(Redesign — preserves old approval workflow)*
3-level expandable list (Department → Employee → Day), matching old design exactly: bulk-approve checkbox, per-day approve/unapprove, status "Pending"/"Approved by: [name] [date]". Views: expandable list only. *(No Small size.)*

| Size | Behaviour |
|------|-----------|
| Medium (2×2) | Departments collapsed by default; expanding shows employees; fixed-height internally-scrolling region once expanded |
| Large (4×4) | All levels expanded by default, fixed-height scrolling for day-level detail |
| KPI (1×0.5) | Same as Option A's KPI |
| Expanded | Full 3-level view, all filters live inside the modal, same approve/reject interactivity |

**Fine-tuning:** Leave type colour-coding is org-configured, not fixed.

---

# W10 — Loans With Balance Due

**Module:** Finance · **Status:** 🔵 Improvement needed · **Research doc:** `Dashboard Research/10 - Loans With Balance Due.md`

## Purpose
Shows outstanding loans with remaining balances and how overdue each one is.

## Filter Options
| Filter | Values |
|--------|--------|
| Loan Type | All Types · dynamic from `LNTypeRepository` |
| Status | All · Active · In Arrears — **kept, flagged as unconfirmed** (no explicit field in the Purpose doc) |

Fiscal Year dropped, flagged as a dev question (same as W05). Filter scope kept intentionally quirky (table only, chart shows all types — same as W07). Aging bucket labels fixed: **Current (0–29) · 30–59 · 60–89 · 90+** (old labels were misleading). KPI size: Loan Type only, or none.

## Data Table Sort
Fixed — Name, then Account Number.

## Drill-Through
**Open item, not "no drill-through":** account names are already clickable links in the old design, but the destination was never confirmed. Find the target, don't design a new one.

## Refresh
Standalone icon, present at every size including KPI.

### Option A — Balance Bars *(Improve)*
Horizontal bar per loan. Views: Bar (default) · Cards · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | Top 3 loans, balance only |
| Medium (2×2) | Top 5 loans + type labels |
| Large (4×4) | All loans + status badges + table toggle |
| KPI (1×0.5) | Headline: **loan with highest balance due** |
| Expanded | Same as Large |

### Option B — Balance Cards *(Keep/Refresh)*
Card per loan — name, type, balance, status. Views: Cards (default) · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | 2 cards |
| Medium (2×2) | 3-4 cards |
| Large (4×4) | All loans + totals footer |
| KPI (1×0.5) | Headline: **count of loans 90+ days overdue** |
| Expanded | Same as Large |

### Option C — Summary Table *(Keep/Refresh)*
Table — Loan Name/Type/Original/Balance Due/Status/Next Payment. Views: Table (default) · Bar.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | 3 rows, rows scroll internally, header fixed |
| Medium (2×2) | 5 rows, same pattern |
| Large (4×4) | All rows + totals row |
| KPI (1×0.5) | Headline: **Total Balance Due ($)** |
| Expanded | Same as Large |

**Fine-tuning:** 90+ day loans always red/amber. Status filter should actually change which loans appear, pending field confirmation.

---

# W11 — Fixed Asset Values

**Module:** Finance · **Status:** ✅ Minor tweaks (major mismatch resolved) · **Research doc:** `Dashboard Research/11 - Fixed Asset Values.md`

## Purpose
Shows fixed asset financial values, broken down by a chosen grouping; users pick the grouping, the specific group, and which of 5 financial measures to focus on.

## ⚠️ Mismatch resolved
Old design's real complexity is 3 cascading dropdowns, not a single category filter. **Decided:** preserve the full 3-dropdown system; drop the draft's invented "Depreciation Method" filter (not supported by real data). Options A/B/C are now different visual treatments of the same filter system, not different data models.

## Filter Options
| Filter | Values |
|--------|--------|
| Group By | Class · Building · Room · Asset Account · Accumulated Depreciation Account · Expense Account |
| Specific Group | Dynamic — depends on Group By, sourced from the org's own records |
| Financial Measure | Capitalized Value · Cost · Depreciable Value · Accumulated Depreciation · Net Value |

All three persist per user. KPI size: no time filter exists at all — the KPI tile ignores all three filters and always shows one fixed universal figure (flagged design decision, confirm with product).

## Data Table Sort
Fixed — Tag # ascending (proposed default, not explicitly confirmed in old design).

## Drill-Through
No drill-through — matches old design (view-only).

## Refresh
Standalone icon, present at every size including KPI.

### Option A — Group Bars *(renamed from "Category Bars")*
Horizontal bar per group, selected Financial Measure. Views: Bar (default) · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | Top 3 groups by selected measure |
| Medium (2×2) | All groups, single measure |
| Large (4×4) | All groups + individual-asset table for selected Specific Group, table toggle |
| KPI (1×0.5) | Headline: **Total Net Value**, org-wide, fixed regardless of filters |
| Expanded | Same as Large, all three filters live inside the modal |

### Option B — Donut by Group *(matches old design's actual chart)*
Donut showing selected measure's distribution across groups. Views: Donut (default) · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | Donut only |
| Medium (2×2) | Donut + legend |
| Large (4×4) | Donut + legend + individual-asset table, table toggle |
| KPI (1×0.5) | Headline: **dominant group + its % of the measure's total** |
| Expanded | Same as Large |

### Option C — Asset Detail Table *(renamed from "Asset Cards")*
Table only — individual assets in the selected group, all 5 measures, selected measure's column first. Views: Table (default) · Bar.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | 3 rows, rows scroll internally, header fixed |
| Medium (2×2) | 5 rows, same pattern |
| Large (4×4) | Full table for selected group + totals row |
| KPI (1×0.5) | Headline: **Total Net Value**, same fixed figure as Option A |
| Expanded | Same as Large |

**Fine-tuning:** Selected measure's column/bar always visually distinguished as the lead figure.

---

# W12 — (Empty Slot) ✅ REMOVED

**Module:** Other · **Status:** Decided — removed · **Research doc:** `Dashboard Research/12 - None.md`

The "None" option is **removed entirely** from the widget selector. Every slot must have a real widget; layout collapses/reflows instead of showing a blank tile. No 9-point spec applies — this slot no longer exists.

---

# W13 — Purchasing Management

**Module:** Finance · **Status:** 🔵 Improvement needed (major mismatch resolved) · **Research doc:** `Dashboard Research/13 - Purchasing Management.md`

## Purpose
Tracks purchase order requests by approval status, and the encumbrance those orders represent.

## Filter Options — kept as designed, flagged for review
| Filter | Values |
|--------|--------|
| PO Status | All · Pending Approval · Approved · Overdue |
| Department | All Departments · Finance · Admin · Ministry · Facilities · IT |
| Year | FY 2026 · FY 2025 · FY 2024 |

Old design's confirmed real filters are Status (4 approval-workflow stages) + a dynamic Approval Path filter — none of Department/Year/"Overdue" are confirmed against real data. **Decided: keep as designed anyway, flagged for backend/data review.** Encumbrance chart (old design's real chart) is dropped — status-based options are the intended replacement. **No Small size, for any option** (second confirmed example after W09). KPI size is richer than a single number by design: small horizontal bar (counts per status) + compact status cards, PO Status filter only.

## Data Table Sort
Proposed default: fixed by Date Issued, most recent first — flag for confirmation.

## Drill-Through
**Already exists, kept as-is:** each row's edit icon navigates to the full PO record (Detail/Approvals/Attachments/Note/Payment Approval tabs). One of only two widgets with direct action capability (the other: W09).

## Refresh
Standalone icon, present at every size including KPI.

### Option A — Kanban View *(Redesign — confirmed primary/recommended solution)*
Kanban columns (Pending/Approved/Overdue) with PO cards. Views: Kanban (default) · Table. *(No Small size.)*

| Size | Behaviour |
|------|-----------|
| Medium (2×2) | 2 columns visible with top 2 POs each |
| Large (4×4) | All 3 columns, full PO cards, scrollable |
| KPI (1×0.5) | Small horizontal bar (counts per status) + compact status cards |
| Expanded | All 3 columns, full cards, all filters live inside the modal |

### Option B — Status Donut *(Keep/Refresh)*
Donut showing PO count split by status. Views: Donut (default) · Bar · Table. *(No Small size.)*

| Size | Behaviour |
|------|-----------|
| Medium (2×2) | Donut + legend + counts |
| Large (4×4) | Donut + legend + total value + table toggle |
| KPI (1×0.5) | Small horizontal bar + compact status cards |
| Expanded | Same as Large |

### Option C — PO Table *(Keep/Refresh — kept as the alternative, not primary)*
Table — PO #/Vendor/Amount/Department/Status/Date. Views: Table (default) · Kanban. *(No Small size.)*

| Size | Behaviour |
|------|-----------|
| Medium (2×2) | 5 rows, rows scroll internally, header fixed |
| Large (4×4) | All rows (up to 10), totals row |
| KPI (1×0.5) | Small horizontal bar + compact status cards |
| Expanded | Same as Large |

**Fine-tuning:** Overdue POs always red. Department filter narrows the PO list (pending confirmation Department is real).

---

# W14 — Main Content Tasks ⏸️ DEFERRED

**Module:** Other · **Status:** Deferred, revisit later · **Research doc:** `Dashboard Research/14 - Main Content Tasks.md`

Old design's real widget is a context-aware navigation shortcut panel — up to 8 icon+label links, auto-determined by current page + permissions, no filters/refresh/chart. The draft reinvents it as a personalised to-do list with due dates/statuses — a different concept the real data source (`SSScreenSectionTask`, navigation links only) doesn't support.

**Unresolved:** preserve the old nav-panel concept (mostly exempt from the 9-point spec, like W12), or commit to a real to-do list (needs a new backend data model)? Do not build against the original draft's Options A/B/C until revisited.

---

# W15 — Bank Balances

**Module:** Finance · **Status:** ✅ Minor tweaks (major gap resolved) · **Research doc:** `Dashboard Research/15 - Bank Balances.md`

## Purpose
Shows current balances across all bank accounts; drilling into one account shows an activity breakdown since the last reconciliation.

## ⚠️ Gap resolved
Old design's defining behaviour — selecting a specific account switches the *entire widget* to a "Single Account" view (7-row breakdown: Beginning Balance/Deposits/Voids/Checks/Withdrawals/EFT/Ending Balance + a 4-category bar chart) — was dropped entirely in the draft's three balance-only options. **Decided: preserve it.** All three options now have two modes: All Accounts (option-specific visual style) and Single Account (same 7-row breakdown + chart for all three options, not option-specific). Also resolved: W07's reconciliation framing was the source of the "W15 and W07 look similar" confusion flagged in the original draft — now naturally distinct.

## Filter Options
| Filter | Values |
|--------|--------|
| Account | All Bank Accounts (default) · dynamic list of active bank accounts |

Reconciliation status display (Last Reconciled date/badge) flagged as a question for experts/dev — genuinely plausible here (unlike W07) but never shown as a visible field in old design. "Show" filter dropped (invented, doesn't map to anything real). KPI size: always shows the All-Accounts aggregate, regardless of Account selection (flagged design decision).

## Data Table Sort
All Accounts mode: fixed alphabetical by Account Name. Single Account mode: fixed structural row order (Beginning → ... → Ending Balance), not sortable.

## Drill-Through
No separate link — Single Account mode is already this widget's drill-in mechanism.

## Refresh
Standalone icon, present at every size including KPI. Preserves current Account selection.

### Option A — Balance + Reconciliation Table *(Keep/Refresh)*
All Accounts: table (Account/Balance, + Last Reconciled/Status pending flag). Single Account: 7-row breakdown table. Views: Table (default) · Cards · Bar.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | All: 2 rows, balance only. Single: Ending Balance + one headline figure only. |
| Medium (2×2) | All: 4 rows, full columns. Single: full 7-row table. |
| Large (4×4) | All: all accounts + totals + reconciliation detail. Single: full table + 4-category bar chart, table toggle. |
| KPI (1×0.5) | Headline: **Total Balance across all bank accounts** |
| Expanded | Same as Large for whichever mode is active |

### Option B — Balance Bar Chart *(Improve)*
All Accounts: vertical bar per account. Single Account: same 7-row breakdown as Option A. Views: Bar (default) · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | All: 3 bars, no labels. Single: Ending Balance + one headline figure. |
| Medium (2×2) | All: all bars + labels. Single: full 7-row table. |
| Large (4×4) | All: all bars + reconciliation overlay + table toggle. Single: full table + bar chart, table toggle. |
| KPI (1×0.5) | Headline: **Total Balance across all bank accounts** |
| Expanded | Same as Large for whichever mode is active |

### Option C — Account Cards *(Keep/Refresh)*
All Accounts: card per account. Single Account: same 7-row breakdown. Views: Cards (default) · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | All: 2 cards. Single: Ending Balance + one headline figure. |
| Medium (2×2) | All: 3 cards. Single: full 7-row table. |
| Large (4×4) | All: all accounts + total footer. Single: full table + bar chart, table toggle. |
| KPI (1×0.5) | Headline: **Total Balance across all bank accounts** |
| Expanded | Same as Large for whichever mode is active |

**Fine-tuning:** Reconciliation badges (pending confirmation): green/amber/red.

---

# W16 — Accounts Payable By Due Date

**Module:** Finance · **Status:** 🔵 Improvement needed · **Research doc:** `Dashboard Research/16 - Accounts Payable By Due Date.md`

## Purpose
Shows outstanding unpaid supplier invoices grouped by due date.

## Filter Options
| Filter | Values |
|--------|--------|
| Due Date | All · Overdue Now · Due This Week · Due This Month — **confirmed as primary filter**, replacing old design's exact-date dropdown with scannable urgency buckets |
| Vendor | All Vendors · dynamic from `APVendor` (real, confirmed table) |

Filter scope kept intentionally quirky (table only, chart shows all — same pattern as W07/W10). Pie/donut labels fixed to show due date (was amount — old design's own open question, now resolved). KPI size: Due Date only.

## Data Table Sort
Fixed — Due Date ascending, then Vendor alphabetical.

## Drill-Through
**Leaning yes, pending expert/dev confirmation** — a link to the full AP module would be a meaningful improvement over view-only.

## Refresh
Standalone icon, present at every size including KPI. Preserves current Due Date selection.

### Option A — Due Date Cards *(Keep/Refresh)*
Cards grouped by urgency. Views: Cards (default) · Pie · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | 3 cards, amount + urgency badge |
| Medium (2×2) | 5 cards, vendor + amount + due date |
| Large (4×4) | All invoices, grouped by urgency |
| KPI (1×0.5) | Headline: **Total AP Outstanding ($)** |
| Expanded | Same as Large |

### Option B — Aging Donut *(Improve)*
Donut showing AP balance split by due date band. Views: Donut (default) · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | Donut only |
| Medium (2×2) | Donut + legend + total AP |
| Large (4×4) | Donut + legend + breakdown table toggle |
| KPI (1×0.5) | Headline: **Total AP Outstanding ($)** |
| Expanded | Same as Large |

### Option C — AP Table *(Keep/Refresh)*
Table — Vendor/Invoice #/Amount/Due Date/Status. Views: Table (default) · Cards.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | 3 rows, rows scroll internally, header fixed |
| Medium (2×2) | 5 rows, same pattern |
| Large (4×4) | All rows, totals row |
| KPI (1×0.5) | Headline: **Total AP Outstanding ($)** |
| Expanded | Same as Large |

**Fine-tuning:** Overdue items always red. Total AP Outstanding shown as KPI headline and as a header figure on all views at Large.

---

# W17 — Gifts & Pledges

**Module:** Finance · **Status:** 🔵 Improvement needed · **Research doc:** `Dashboard Research/17 - Gifts Pledges.md`

## Purpose
Tracks gift/pledge progress by purpose — how much given, outstanding, and overall progress.

## Terminology note
Old data (`GFPledge`) groups by **Pledge Purpose**; "Campaign" is kept as the friendlier UI label for the same grouping — confirmed correct here (mirror image of W04's mix-up, where these values were mistakenly borrowed). "Goal" renamed to **Pledge Total**; "Outstanding" maps to **Due Remaining**.

## Filter Options
| Filter | Values |
|--------|--------|
| Campaign (Pledge Purpose) | All Campaigns · dynamic from `GFPledge` |
| Date Range | Current Month · Year to Date · Campaign Total — **confirmed as primary filter**, replacing old design's single "Date Gifts Thru" date picker |

Fiscal Year dropped (no dimension in old design, flagged as dev question). **Open product/dev question:** old design's Pledge Due/% Due math depends on a specific as-of date — Campaign Total mode is straightforward (Total vs Received vs Due Remaining), but Current Month/YTD need the due-date math redefined (similar to W04's "% of year completed" logic) — not fully specified yet. KPI size: Date Range only.

## Data Table Sort
Fixed — Campaign (Pledge Purpose) name, alphabetical.

## Drill-Through
No drill-through — matches old design. Flag if a link (e.g. to Donors and Gifts) is wanted later.

## Refresh
Standalone icon, present at every size including KPI.

### Option A — Campaign Progress Bars *(Keep/Refresh)*
Horizontal progress bar per campaign — received vs Pledge Total. Views: Bar (default) · Pie · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | 2 campaigns, % only |
| Medium (2×2) | 4 campaigns, received/Pledge Total values |
| Large (4×4) | All campaigns, full values, % labels, table toggle |
| KPI (1×0.5) | Headline: **campaign furthest behind its pledge pace** (lowest % Due) |
| Expanded | Same as Large |

### Option B — Donut by Campaign *(Improve)*
Donut showing proportion of total giving per campaign. Views: Donut (default) · Table.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | Donut only |
| Medium (2×2) | Donut + legend |
| Large (4×4) | Donut + legend + total giving figure + table toggle |
| KPI (1×0.5) | Headline: **Total Giving Received** |
| Expanded | Same as Large |

### Option C — Summary Table *(Keep/Refresh)*
Table — Campaign/Pledge Total/Received/Due Remaining/% Due. Views: Table (default) · Cards.

| Size | Behaviour |
|------|-----------|
| Small (1×1) | 3 rows, rows scroll internally, header fixed |
| Medium (2×2) | 5 rows, same pattern |
| Large (4×4) | All campaigns + totals row |
| KPI (1×0.5) | Headline: **overall % Due**, or Total Due Remaining ($) — whichever tests better |
| Expanded | Same as Large |

**Fine-tuning:** Campaigns exceeding Pledge Total shown green with "✓ Goal Met" badge. Due Remaining can be negative if ahead of schedule.

---

## End of consolidated spec

15 of 17 widgets resolved (W01–W07, W09–W13, W15–W17; W07 partially, baseline-only). W08 and W14 remain deferred pending core-model decisions. See the Open Items appendix near the top of this document for every flagged question before this moves to build or to the Excel tracker.

