# W10 — Loans With Balance Due

**Module:** Finance  
**Status:** 🔵 Improvement needed  
**Research doc:** [10 - Loans With Balance Due.md](../../Step 1 - Dashboard Research/10 - Loans With Balance Due.md)
**General rules:** [General Widget Design Rules.md](General%20Widget%20Design%20Rules.md)

## Purpose
Shows all outstanding loans with remaining balances, their types, and current repayment status. Helps finance staff monitor loan obligations and flag any in arrears.

---

## Purpose & Competitive Fit Check (Phase 1)
**Industry standard:** loan aging dashboards use bar charts by age bucket, with delinquency KPIs and colour-coded severity (green = healthy, red = default risk); a balance-vs-count toggle is also a commonly cited feature ([FasterCapital](https://fastercapital.com/content/Loan-Data-Visualization--How-to-Use-Charts-and-Dashboards-to-Communicate-Your-Loan-Performance-Insights.html)).

**Fit-check:** Option A (Balance Bars) matches the standard bar-by-loan approach directly, and Option C (Summary Table) is the standard detail companion. Option B (Balance Cards) is less standard for this data type — card layouts are more common for benefits/status widgets than for financial loan-aging data, where sources consistently point to bars/tables rather than cards. Worth weighting B as the weakest of the three going into Phase 2, unless there's a strong reason to keep a card view.

---

## Filter Options
| Filter | Values |
|--------|--------|
| Loan Type | All Types · *(dynamic — organisation-defined loan types from `LNTypeRepository`, not a fixed list; Property/Vehicle/Equipment above are illustrative examples)* |
| Status | All · Active · In Arrears — **kept, but flagged as unconfirmed:** `LNLoan` has no explicit active/arrears field in the Purpose doc; overdue-ness today is only derived from the aging buckets. Needs backend confirmation before build. |

**Fiscal Year filter — dropped, flagged as a question for the dev team** (same resolution as W05 Receivable Invoices Outstanding): loan balance due is an as-of-today snapshot with no fiscal-year dimension in the old design. **Raise with backend/dev:** is a fiscal-year-scoped filter on loan origination date worth adding later?

**Filter scope — kept intentionally quirky, matching old design (same as W07 Deposit Accounts):** the Loan Type filter narrows the **table only**. The pie chart always shows **all** loan types regardless of the filter — the old research explicitly notes this is "the same behaviour as Deposit Accounts." Fixing it would collapse the pie chart to a single slice when one type is selected. Keep as-is.

**Aging bucket labels — fixed:** the old design's labels were misleading ("60" actually meant 60–89 days; "Over 60" actually meant 90+ days — flagged in the original research for the Feedback step). Renamed here to **Current (0–29) · 30–59 · 60–89 · 90+** for clarity.

**KPI size (3-dot menu):** No time filter exists for this widget (Fiscal Year was dropped) — same exception as W05. KPI size shows Loan Type only, or no filter at all — flag for the wider Hard Rules review.

## Data Table Sort
Fixed — Name, then Account Number (matches old design). Not user-changeable.

## Drill-Through
**Open item, not "no drill-through":** the old design already shows account names as clickable links in the table, but the research confirms the destination is unknown ("not yet confirmed where these navigate to"). Treat as an existing link needing its target confirmed — same status as W01's GL link — not a new feature to design from scratch.

## Refresh
Standalone icon on the card (not a 3-dot menu item), present at every size including KPI.

---

> **Note added (2026-07-23, Fix Mock Designs dry-run):** the three sections immediately below (Option A —
> Balance Bars, Option B — Balance Cards, Option C — Summary Table, including their per-size behaviour
> tables) describe the **original, pre-2026-07-23 baseline design**. They were superseded in full by the
> "2026-07-23 — Options A/B/C replaced" entry further down this file, which is the current live build in
> `Dashboard Widget Mockups.html`. Kept here for history — not deleted — but a reader skimming only this
> section would get a wrong picture of what's actually live today; see the dated entry below instead.

## Option A — Balance Bars *(Improve)*

**Chart:** Horizontal bar per loan showing outstanding balance  
**Views available:** Bar (default) · Cards · Table  
**Improvement note:** Length of bar makes relative balances immediately comparable.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Top 3 loans, balance only |
| **Medium (2×2)** | Top 5 loans + loan type labels |
| **Large (4×4)** | All loans + status badges + table toggle (fixed sort: Name, then Account Number) |
| **KPI (1×0.5)** | Headline: **loan with the highest balance due** (e.g. "Fellowship Hall Loan: $84,200"). No download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Option B — Balance Cards *(Keep/Refresh)*

**Chart:** Card per loan — name, type, balance, status badge  
**Views available:** Cards (default) · Table  
**Improvement note:** Good for a quick individual loan health check.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 2 cards |
| **Medium (2×2)** | 3-4 cards |
| **Large (4×4)** | All loans + totals footer (fixed sort: Name, then Account Number) |
| **KPI (1×0.5)** | Headline: **count of loans 90+ days overdue** (worst aging bucket — or "In Arrears" count, pending Status field confirmation above). No download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Option C — Summary Table *(Keep/Refresh)*

**Chart:** Table — Loan Name · Type · Original · Balance Due · Status · Next Payment  
**Views available:** Table (default) · Bar  
**Improvement note:** Full detail, best for financial reporting.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 3 rows (fixed sort: Name, then Account Number), rows scroll internally, header fixed |
| **Medium (2×2)** | 5 rows, same sort/scroll pattern |
| **Large (4×4)** | All rows + totals row, same sort/scroll pattern |
| **KPI (1×0.5)** | Headline: **Total Balance Due** ($), across all loans. No download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Fine-Tuning Notes
- In Arrears loans (or 90+ day bucket, pending Status field confirmation) should always be shown in red/amber regardless of view
- Status filter should change which loans appear, not just highlight them — pending confirmation the field exists (see Filter Options above)

---

## 2026-07-23 — Options A/B/C replaced (Step 3 Mock_Work dry-run, "Create Mock Designs" skill)

Dry-run test of a draft skill for this exact pipeline stage. No Agent/Task subagent tool was available in
this session, so all three designs below were drafted sequentially by one agent rather than in parallel —
noted here since the skill's intended workflow is 3 parallel subagents, one per design. Replaces the prior
Options A (Loan Cards), B (Balance Bars), C (Loan Table) in `Dashboard Widget Mockups.html`'s Design Options
section and `WRENDER[10]`'s A/B/C branches in place — the KPI-size branch (Total Balance Due, shared across
all three) was not touched.

Inputs used: `Step 1 - Dashboard Research/10 - Loans With Balance Due.md` (frozen legacy baseline),
`Step 2 - Feedback/Market Research/W10 - Loans With Balance Due.md`, `Step 2 - Feedback/Ben Lane Interview -
Tagged Q&A by Widget (2026-07-13).md` (W10's tagged section), this file's prior Options A–C, and
`Data and Build Readiness - Developer Punch List.md`'s W10 section. `Step 4 - Widget Final Design/W10...md`
and `Design Improvement Options.md` were deliberately not read, per the skill's instructions.

### Option A — Balance Table + Type Mix *(Improve)*
**Driver: Ben Lane's interview feedback for this widget.** Restyles the Step 1 legacy shape (table + a
secondary chart) with the current design system, sorted by loan name (fixed sort, per this doc's own spec
above). The legacy "By Age" pie is swapped for a Balance-by-Loan-Type donut, and the Rate/Payment columns are
dropped — both changes driven directly by Ben Lane's answer that for these HQ-to-church loans "the key focus
is on the remaining balance... not necessarily monthly payments or aging labels." The swap to Type (rather
than dropping the secondary chart outright) also respects the Punch List: Loan Type is ✅ available, while
per-loan aging-bucket data is 🔴 unconfirmed/being rebuilt server-side. No Status filter changes — the
existing `s`/`sc` fields are shown exactly as before, same unconfirmed caveat as ever.

### Option B — Snapshot Tiles + Status Table *(Redesign)*
**Driver: Market Research — LoanPro's "Dashboards" + "Delinquency Report" findings.** The strongest
newly-confirmed pattern in the Market Research pass was LoanPro's at-a-glance summary card (Amount Past Due /
Principal Balance-style tiles) sitting above a categorized, table-first delinquency view, plus its per-loan
stoplight indicator. This option borrows that pattern — not LoanPro's literal look — using Pathway's own chip
and tile styling: a small KPI strip (Total Due / Active count / In Arrears count) above a table whose Status
column is a coloured pill rather than plain text, with a Snapshot Cards alternate view. Of the two real
"Visual Options" the Market Research file lists (5-band aging; per-row status chip), this is closest to the
second, combined with the confirmed "at-a-glance summary" finding — and, per the tie-break rule, it's also the
one closer to the widget's current build (same fields, same table/cards structure, no new bucket count).
**Caveat added (2026-07-23, Fix Mock Designs dry-run):** the Active/In Arrears counts in the KPI strip and the
Status pill column rely on the `s`/`sc` fields exactly as before — same unconfirmed caveat as ever (Punch
List: no explicit active/arrears field, today's "arrears" concept is only derived from aging buckets). This
paragraph originally omitted that caveat while Options A and C above both carried it forward; the field itself
hasn't been re-checked or newly confirmed — this is a documentation correction only, not a data/build change.

### Option C — Repayment Progress by Type *(Redesign)*
**Driver: purpose-driven, no direct citation.** Reframes the widget around progress toward payoff instead of
lateness: a % Repaid progress bar per loan (bar length and printed label both the repayment %, remaining
balance shown as a subordinate line beneath, per the design rules' T5), colour-coded by loan type rather than
status, with a portfolio Type-mix breakdown at Small and a Table alternate at all sizes. This was the freest
interpretation of "who owes what and how healthy is the loan book" — it also happens to sidestep the
Punch List's still-unconfirmed Status/aging fields entirely, and is compatible with (though not directly
citing) Ben Lane's point that these loans read more like grants than commercial debt, but that compatibility
wasn't the deciding factor in choosing it.

### Not carried forward
The Market Research file's third item ("revisit whether 'In Arrears' is the right framing at all") was
explicitly logged there as a scope question, not a visual option — so it isn't represented as a fourth design
here. Options B and C above reduce reliance on that framing in different ways (a derived stand-in chip vs.
dropping it entirely), but the open question itself is still unresolved and belongs with product, not with
this mock pass.

---

## 2026-07-23 — Findings resolved (Step 3 Mock_Work dry-run, "Fix Mock Designs" skill)

Resolves items 1, 2, and 3 from `Verify Findings.md`'s W10 run (same date). This entry documents the fix; it
does not replace or edit the 2026-07-23 "Options A/B/C replaced" entry above — that entry's design text is
unchanged except for the one caveat addition to Option B noted below.

**What was wrong:**
1. **Option C — Table alternate dead at Small size (MED-HIGH).** `WRENDER[10]`'s `opt==='C'` branch returned
   the Small-size type-mix breakdown unconditionally, before ever checking `view`. Selecting "Switch chart
   type → Table" at Small had no visible effect — the breakdown always showed instead. This directly
   contradicted this file's own claim above that Option C has a "Table alternate at all sizes."
2. **Option B — Cards/Table toggle dead at Small size (MED).** Same bug pattern: `opt==='B'`'s Small branch
   returned the compact 3-item dot-list unconditionally, before checking `view`. The Snapshot Cards/Status
   Table toggle was a no-op at Small.
3. **Option B's description missing the Status-unconfirmed caveat (MED).** This entry's Option B paragraph
   above described the Active/In Arrears KPI counts and Status pill column without noting that the underlying
   `s`/`sc` fields are unconfirmed against a real backend field (per `Data and Build Readiness - Developer
   Punch List.md`'s W10 entry: "Status filter (Active/In Arrears) — 🔴 Missing/unconfirmed"). Options A and C's
   paragraphs both carried that caveat forward; Option B's did not.

**What was changed:**
- `Dashboard Widget Mockups.html`, `WRENDER[10]` — Options B and C's Small-size (`sz==='s'`) branches were
  restructured so the `view` check happens first, exactly matching the pattern Option A already used
  correctly at every size (check `view`, then handle size within the branch that applies). No other size
  branch, no other option, no other widget's `WRENDER` function, and no Final Check markup (`#page-final-check`,
  `id="fc-widget-10"`) was touched. Verified with `check-rules.py --widget 10` (0 HIGH/MED/LOW, exit 0) and a
  Node syntax check of the extracted script block.
- This file — added a caveat sentence to Option B's 2026-07-23 paragraph above (marked "Caveat added
  2026-07-23") disclosing the Status field's unconfirmed status. This is a documentation correction only —
  it does not change any data, filter behaviour, or claim the field is now confirmed. The Punch List entry
  itself was re-checked (not just taken on the prior finding's word) and still reads "🔴 Missing/unconfirmed"
  as of this date.
- This file — added a note above the pre-2026-07-23 "Option A — Balance Bars / Option B — Balance Cards /
  Option C — Summary Table" sections (resolves the informational item 4) clarifying that those sections and
  their per-size tables describe the superseded baseline design, not the current live build. The original
  text of those sections was not deleted or rewritten.
- `mock-data.master.js` — checked, not touched. Nothing about `MOCK_DATA` values changes for any of the three
  fixes above (logic/documentation only), so no re-sync was needed.

**Not touched:** the Final Check tab for W10 (item 5) and its "Final design — locked" badge — informational
only per the originating findings, left exactly as-is.

---

## 2026-07-23 refresh — Options A/B/C rebuilt in place under Rules 8-11 (Step 3 Mock_Work, "Create Mock Designs" skill)

Live batch run (explicit permission granted). Treated as a REFRESH of the earlier 2026-07-23 dry-run: the
three options were rebuilt cleanly in `Dashboard Widget Mockups.html` (`WRENDER[10]` + the widget-10 Design
Options card markup + the `MOCK_DATA.options[10]` comment) and replaced in place. Additive doc entry — the
prior 2026-07-23 entries above are unchanged. Inputs re-read this pass: Step 1 Purpose doc, Step 2 Market
Research (`W10 - Loans With Balance Due.md`), Ben Lane Tagged Q&A (W10 section), the Developer Punch List's
W10 section, and this file's own history. Step 4 and `Design Improvement Options.md` deliberately not read.

The three concepts carried the same names/shape as the dry-run (they were already a good fit); the substance
of this refresh is the Rules 8-11 compliance rebuild, not a change of concept.

### Option A — Balance Table + Type Mix *(D1 Restyled Original)*
**Driver: Ben Lane interview.** Restyles the legacy table + secondary-chart shape with the current design
system, table fixed-sorted by loan name. The legacy age-based pie is swapped for a **Balance-by-Loan-Type
donut** — driven by Ben Lane's answer that for these HQ-to-church loans the key number is the remaining
balance, "not necessarily monthly payments or aging labels," and by the Punch List's per-loan aging-bucket
gap (🔴 must-fix, being rebuilt server-side). **Rule 10 second dimension: loan Type** (confirmed field), via
the donut. Views: Balance Table (default) / By Loan Type (donut).

### Option B — Snapshot Tiles + Status Table *(D2 Competitor Match)*
**Driver: Market Research — LoanPro "Dashboards" + "Delinquency Report" pattern.** An at-a-glance summary
strip (Total Due / Active count / In Arrears count) above a table whose Status column is a coloured pill,
with a Snapshot Cards alternate view — Pathway's own chips/tiles, not LoanPro's literal look. Tie-break toward
current: same fields/structure as the existing build. **Rule 10 second dimension: loan Type column
(confirmed) plus delinquency Status** (the competitor's delinquency-category axis). Views: Status Table
(default) / Snapshot Cards.

### Option C — Repayment Progress by Type *(D3 Maximum Freedom)*
**Driver: purpose-driven, no tie-break.** Reframes the widget around progress toward payoff instead of
lateness: a **% Repaid** progress bar per loan (bar length and printed label both the repayment %, remaining
balance shown subordinate beneath — Rule T5), colour-coded by loan type, with a portfolio Type-mix breakdown
at Small and a Table alternate at all sizes. **Rule 10 second dimension: the real `orig` (original loan
amount) field** — present in `MOCK_DATA.series[10]` but surfaced by no other option — drives % Repaid =
(orig − bal) / orig; loan Type provides the colour dimension. Sidesteps the unconfirmed Status/aging fields
entirely.

### Rule notes
- **Rule 8 (per-option filter scoping):** `WRENDER[10]` now uses `var fk=wid+'-'+opt;` and reads
  `fv(fk,'Loan Type')` / `fv(fk,'Status')` / `ftags(fk)` / `yrData(...,fk)` instead of the shared `fv(wid,…)`.
  The three Design-Options cards call `openFilter(10,event,'A'/'B'/'C')`, and the shared `_renderFltBody` /
  `applyFilter` branch conditions were extended with `||wid===10` / `||_filterWid===10` (leaving the existing
  4/5/6/9 entries intact). Each option's filters no longer leak into the other two.
- **Rule 9 (baseline sizes):** KPI (shared Total Balance Due, frozen path), Medium, and Large all render real
  content for all three options; **Small is retained for all three** (no Small omission proposed). Each card's
  size menu now includes a KPI button alongside Small/Medium/Large.
- **Rule 10:** see each option above — B and C both break the data down by a genuine second dimension (Type +
  Status; and original-amount-driven repayment %) rather than just changing chart type on the balance figure.
- **Rule 11 (unconfirmed fields render clean, caveat lives here only):** the **Status: Active / In Arrears**
  concept used by Option B's KPI-strip counts and its Status pill column, and by Option A's Status column, is
  **not a confirmed backend field** — per the Developer Punch List, "Status filter (Active/In Arrears) — 🔴
  Missing/unconfirmed; no explicit field — today's 'arrears' concept is only derived from aging buckets,"
  which are themselves a 🔴 must-fix (the Modern API does not replicate the legacy oldest-first payment
  allocation). It renders as clean, real-looking UI in the mockup with **no badge, TBD, or disclaimer on
  screen** — this note is the only place the uncertainty is recorded. Option C deliberately avoids the field
  altogether. Loan Type, balance due, original amount, and the KPI Total Balance Due are all ✅ available.

### Self-check
`python3 check-rules.py "Dashboard Widget Mockups.html" --widget 10` → **0 HIGH, 0 MED, 0 LOW (exit 0)**.
Node `--check` of the extracted script blocks passed. Only `WRENDER[10]` was changed (no other widget's
WRENDER touched); the 4/5/6/9 filter branches are intact. Subordinate caption colours were set to `#666`
(not `#888`/`#aaa`) to stay clear of the Rule T6 contrast bar. **Final Check tab (`id="fc-widget-10"`,
`#fc-opt-10-*`) and its "Final design — locked" badge were not touched** — reported only, per instruction.
No `MOCK_DATA.series[10]` values changed, so `mock-data.master.js` needed no re-sync (verified it still
carries the W10 series).
