# W05 — Receivable Invoices Outstanding

**Module:** Finance  
**Status:** 🔴 Critical fix needed  
**Research doc:** [05 - Receivable Invoices Outstanding.md](../../Step 1 - Dashboard Research/05 - Receivable Invoices Outstanding.md)
**General rules:** [General Widget Design Rules.md](General%20Widget%20Design%20Rules.md)

## Purpose
Shows how much money is currently owed to the organisation in unpaid invoices and how long those invoices have been outstanding. Grouping by age helps staff prioritise which outstanding amounts need attention first.

---

## Purpose & Competitive Fit Check (Phase 1)
**Industry standard:** AR aging dashboards commonly combine a bar or donut chart for the aging-bucket breakdown with a sortable, full-detail table — a pie chart as the *sole* view is explicitly called out as the wrong choice for aging data ([Vertaccount](https://www.vertaccount.com/blog/best-accounts-receivable-dashboard-examples-templates-for-2026/), [Coupler.io](https://www.coupler.io/dashboard-examples/accounts-receivable-dashboard)) — which matches this file's own note that the old pie-chart design was wrong and neither remaining option uses pie as primary.

**Fit-check:** Option B (KPI + Aging Bars) matches the recommended "KPI snapshot + aging bars" combination directly and is the stronger of the two remaining options. Option C (Aging Table with click-to-sort) matches the standard detailed/sortable-table companion view. Both are well-aligned with the standard; removing the old plain-bar Option A was the right call.

---

## Filter Options
| Filter | Values |
|--------|--------|
| Age Band | All Ages · Current (0-30) · 31-60 days · 61-90 days · 91-120 days · 121+ days *(restored to the real 5-bucket structure from `ARInvoice` — the earlier draft's 4-band version merged 91-120 and 121+, losing exactly the distinction that matters most for collections prioritisation)* |
| Revenue Center *(replaces invented "Account" filter)* | All Revenue Centers · Church · Insurance Billing · Pension Billing · School |
| Source *(replaces invented "Account" filter)* | All Sources · Insurance Billing · Pension Billing |

**Corrected from earlier draft:** the "Account" filter (All Accounts/Main Account/Secondary Account) didn't match anything in the real data — replaced with the two filters that actually exist and work today (Revenue Center, Source), both confirmed in the Purpose doc.

**Fiscal Year filter — dropped, but flagged as a question for the dev team:** aging is inherently an as-of-today snapshot with no fiscal-year dimension in the old design. Dropped from this spec, but **raise with backend/dev**: is a fiscal-year-scoped filter on invoice *posting* date (not a change to the aging math itself) something worth adding later?

**KPI size (3-dot menu):** No time filter exists for this widget (Fiscal Year was dropped) — KPI size shows no filter at all, just Widget size + Fullscreen, per Hard Rule 1's "time filter" default not applying here. Flag this as an exception to confirm with the wider Hard Rules review.

## Data Table Sort
- **Age-band summary table** (bucket totals — used in Option B's table toggle): fixed sort by age band ascending (Current → 121+), matching bucket severity order. Not user-changeable.
- **Option C's full invoice-level table**: click-to-sort on any column (Invoice #, Customer, Amount, Age, Due Date) — this was the option's own explicit design intent ("sortable columns"), kept as designed.

## Drill-Through
**No separate page link** — decided against, because there's no single unambiguous source page to link to (Revenue Center/Source data spans multiple originating modules — Church, Insurance Billing, Pension Billing, School — so "which table/page" isn't well-defined). The existing rich in-page detail panel (bucket → invoice list → expandable Details/Attachments/Note/Payments tabs, Export, Close) is kept exactly as-is and stands as this widget's answer to the requirement.

## Refresh
Standalone icon on the card (not a 3-dot menu item), present at every size including KPI.

## Related New Widget (Phase 2 API, no legacy equivalent) — informational, from `Widget_Comparison_New_Widgets.html`
The Modern API defines an **`ap-ar-aging`** widget that explicitly combines this widget's AR side with W16's AP side into one unified cross-module view: *"NEW — legacy had AP by Due Date and AR Invoices Outstanding separately."*
- **Endpoint:** `GET /api/dashboard/ap-ar-aging`
- **Shape:** `{ApAging[5], ArAging[5], ApTotalOutstanding, ArTotalOutstanding}` — 5 buckets each: Current / 1-30 / 31-60 / 61-90 / 91+ (buckets 61-90 and 91+ highlighted)
- **AR side logic:** `AR_Invoice WHERE CompanyID=ctx AND Posted AND !voided`; `Outstanding = TotalAmount+SalesTax-Payments-Discounts-WriteOffs` — same formula already documented in the research doc, computed in SQL here rather than in a separate extension method
- **Note:** this new widget uses a slightly different bucket boundary (1-30/31-60/61-90/91+) than W05's own 5 buckets (Current/31-60/61-90/91-120/121+) — worth reconciling if both are ever shown side by side
- **Not yet covered:** filters, sizes, and chart/table options for this widget are not specced — starting point only, likely a candidate for a new cross-module widget (e.g. W18) rather than a modification of W05 itself

---

## Option A — Aging Bar Chart — **REMOVED**

Removed after this session's review: Option A (plain aging bar chart) and Option B (KPI tiles + aging bars) were judged too similar, and B does the job better on its own. This widget now has **two** live options (B and C), not three — don't force a third option back in without a genuinely distinct new concept.

---

## Option B — KPI + Aging Bars *(Improve)*

**Chart:** KPI tiles (Total Outstanding, Overdue, Current, Oldest Invoice) above aging bars  
**Views available:** Bar (default) · Table  
**Improvement note:** Headline numbers first, then the breakdown.  
**Reference:** [QuickBooks AR Report](https://quickbooks.intuit.com/learn-support/en-us/accounts-receivable/accounts-receivable-aging-report/)

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small** | 2 KPI tiles only |
| **Medium** | 4 KPI tiles + small bar |
| **Large** | 4 KPI tiles + full aging bars (5 buckets) + table toggle (fixed sort: age band ascending) |
| **KPI (1×0.5)** | **Under review — not finalized.** Candidate headline: Total Outstanding ($), but the 4-tile set (Total Outstanding, Overdue, Current, Oldest Invoice) needs more thought on which single figure best represents the widget at this size before locking it in. No filter, no download, no switch in the meantime. |
| **Expanded** | Same as Large, no filters to move into the modal (Revenue Center/Source stay in the overflow menu as today) |

---

## Option C — Aging Table *(Keep/Refresh)*

**Chart:** Table — Invoice # · Customer · Amount · Age · Due Date  
**Views available:** Table (default) · Bar  
**Improvement note:** Full invoice list with sortable columns.  
**Reference:** [Xero AR Aging](https://www.xero.com/uk/guides/accounts-receivable-aging-report/)

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 3 rows, rows scroll internally, header fixed — card itself never scrolls |
| **Medium (2×2)** | 5 rows, same sort/scroll pattern |
| **Large (4×4)** | Full list, totals per age band (all 5 buckets), same sort/scroll pattern, click-to-sort on any column |
| **KPI (1×0.5)** | **Under review — not finalized**, same as Option B's note above. Candidate: Total Outstanding ($), or count of invoices 121+ days overdue. |
| **Expanded** | Same as Large, no filters to move into the modal |

---

## Fine-Tuning Notes
- Age Band filter should highlight the matching bar in Option B
- Invoices in the 121+ bucket should always show in red; 91-120 in amber
- Critical issue from original research: the old widget used a pie chart, which is wrong for aging data — neither remaining option (B or C) uses pie for its primary view
- Option A (plain aging bar chart) was removed this session — see note above Option B

---

## 2026-07-23 — `create-mock-designs` rebuild under Rules 8-11 (additive; nothing above edited)

Ran the `create-mock-designs` skill against W05 as part of the approved batch. The three live options in `Dashboard Widget Mockups.html` (the DESIGN OPTIONS cards + `WRENDER[5]`) were rebuilt into the standard three-design set. Everything above this entry is prior history and was left untouched; this is a new record of what was built, not a revision of the earlier Option A/B/C discussion.

### The three designs

- **Design 1 — Option A — Restyled Original.** The legacy two-panel layout (aging table + an "Invoice Aging" donut) restyled with Pathway. **Primary field:** `v` (outstanding amount) per age band. Small collapses to a headline Total + donut; Medium is donut-over-table; Large is table beside a full donut. This is the closest thing to what the widget does today, kept deliberately conservative — the only editorial tweak is dropping the pie-as-sole-view (the donut is now a companion to the table, matching the Vertaccount/Coupler.io "chart bolted onto a table, never chart-alone for aging" finding), plus the interview-adjacent 121+/91-120 red/amber colour coding.
- **Design 2 — Option B — Competitor Match.** KPI tiles (Total Outstanding, Overdue, Current, 121+ days) above aging bars — the QuickBooks / Coupler.io "KPI snapshot + aging bars" pattern, which the Market Research file confirms is the near-universal AR-aging layout. **Rule 10 second dimension:** an on-screen **By Amount / By Count** toggle (Rule 4 active-greys-out behaviour) that re-scales the bars off the invoice-count field `n` instead of the dollar amount `v` — directly answering the Punch List's "count vs dollar amount" open question by letting the user see both, rather than picking one. Tie-break toward current was not needed; this pattern is unambiguously the competitor match.
- **Design 3 — Option C — Maximum Freedom (Collections Priority).** Reframes the widget around *what to chase first* rather than a neutral breakdown: an oldest-first priority callout at the top (the highest-severity non-empty band, its amount, invoice count, and average invoice size), then per-band rows sorted severity-descending (121+ → Current). **Rule 10 second dimension:** **average invoice size** (`v / n`) shown per band and as a totals figure — a genuinely new derived cut (a small number of large old invoices vs. many small ones is a different collections problem), not just a re-chart of the same single metric. KPI headline for this option is the 121+ overdue figure rather than total outstanding, matching its collections-priority purpose.

### Rule notes

- **Rule 8 (per-option filter scoping):** implemented. `WRENDER[5]` uses `var fk=wid+'-'+opt;` and reads/writes via `fv(fk,…)` / `ftags(fk)`, so WS['5-A'] / WS['5-B'] / WS['5-C'] are three independent filter states — changing Age Band / Revenue Center / Source on one option's card no longer moves the other two. The three DESIGN OPTIONS cards call `openFilter(5,event,'A'|'B'|'C')`; the shared `openFilter` / `_renderFltBody` / `applyFilter` were extended only by adding `wid===5` / `_filterWid===5` to the existing narrow `wid===6||wid===4` (and `_filterWid===6||_filterWid===4`) branches. The shared `gs()` / `fv()` / `ftags()` signatures were not touched, and the existing widget-4 and widget-6 branches were left intact.
- **Rule 9 (mandatory sizes):** every option renders real content at **KPI, Medium, and Large**. Small is also implemented for all three (A: Total + donut; B: two KPI tiles; C: priority callout + total) — no size was dropped, so there is no omission to flag for confirmation.
- **Rule 10 (deeper B/C):** satisfied without gratuitously forcing a second dimension — B uses the invoice-count field (`n`) via the Amount/Count toggle, C uses average invoice size (`v/n`). Both are real fields/derivations already present in `MOCK_DATA.series[5]`, not invented.
- **Rule 11 (speculative fields flagged in doc only, never in the mockup):** the mockup renders the per-band **invoice count** (`n`) and the derived **average invoice size** (`v/n`) as if fully real, with no on-screen caveat. Data-confidence note: the Developer Punch List's W05 section confirms Age Band / Revenue Center / Source filters, the KPI-tiles/aging-bars/aging-table views, and Total Outstanding as available, but does **not** explicitly list a per-band invoice-count aggregate. Risk is low — the legacy detail panel already enumerates individual invoices within each bucket, so a count is derivable rather than a new data source — but **the per-band count and the average-invoice-size derived from it are proposed and should be confirmed with the dev team** before this design is finalized. This caveat lives here only, per Rule 11.

### 4-vs-5 aging-band decision

**Decision: the full 5-band structure was restored and is what renders.** `MOCK_DATA.series[5]` carries all five real buckets (Current / 31-60 / 61-90 / 91-120 / 121+) with both `v` and `n` per band, and `WRENDER[5]` renders all five at Medium and Large across every option (Small caps to 3 rows and Option C's Medium caps to 4 — display caps per Rule 2, not a reduction of the underlying data). The earlier 4-band mock data (which merged 91-120 and 121+) was the discrepancy called out in this doc's Filter Options note; merging those two loses exactly the distinction that matters most for collections prioritisation. The 5-band structure is confirmed by the Step 1 legacy baseline, the Market Research file (5-band aging is near-universal across QuickBooks/Xero/Sage Intacct/FreshBooks and nonprofit MIP), and the Punch List (Age Band filter available), so the band structure itself carries **no** Rule 11 caveat. The embedded `MOCK_DATA` block is the live source; the `mock-data.master.js` mirror was re-synced to match (both now hold the identical 5-band + `n` data).

### Self-check result

`python3 check-rules.py "Dashboard Widget Mockups.html" --widget 5` → **0 HIGH, 0 MED, 0 LOW** (exit 0). Both inline `<script>` blocks pass `node --check`. The Final Check tab (`id="fc-widget-5"`) was not touched and still shows its "Final design — locked (see note)" badge; no other widget's `WRENDER` was modified.
