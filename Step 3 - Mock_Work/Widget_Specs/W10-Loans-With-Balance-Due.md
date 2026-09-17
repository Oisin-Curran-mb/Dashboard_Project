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

---

## 2026-08-11 — FINAL build (loanF), 1-to-1 copy of Jo Lopez's Loans With Balance Due

Built with the `build-final-widget` skill, per direct owner instruction ("one to one copy of Jo, like the earlier W05/W06/W07 builds; work autonomously, do not prompt"). Added as a new additive `opt==='F'` branch in `WRENDER[10]` (prefix `loanF`, `LOANF_` data); the A/B/C branches, the Dashboard-tab markup, and every other widget were left untouched. Final (v2) is now the default render for `fc-widget-10`, with A/B/C reachable from the design-option switch. `FC_VERSION[10]` = 2.0.

### 1-to-1 composition, mapped to Jo's `loan` block
Every component is Jo's, ported verbatim and renamed `loan*`/`LOAN_*` → `loanF*`/`LOANF_*`. Source for all rows: Jo's Widget Container Demo `loanContent(w)` and its registry/handlers/CSS.

| Component | Source | Notes |
|---|---|---|
| KPI headline | Jo Glance (`loanGlance`) + Step 4 "Total Balance Due" | Big number = total balance due; matches the locked doc's exact headline. Past-due pill (amount + percent) or an "All current" pill beside it. |
| Glance (KPI tier) | Jo `loanGlance` | Total, past-due badge, compact amethyst stacked aging bar, a "most overdue with a balance" call, sr-only aging sentence. No filter/download/switch (Jo's KPI tier). |
| Explore (her `wide`) | Jo header + `loanTable` | Two-row `dep-hd` header (loan-type chip; total + pill + one context line stating count, past-due amount/percent, and 90+ portion), then the table grouped into aging bands with per-band subtotals and a cross-footed total. |
| Detail (her `xwide`) | Jo `loanFull` | Table on the left, "Aging and risk" side panel on the right: clickable aging bands that filter the table, a Portfolio risk read (Past due, 90+ days with percents), and a Most overdue borrowers collections list. |
| Filter | Jo `loanTypeChip` + `LOAN_TYPES` | Loan type only (All, Church - Special, Church Expansion, Individual). The one and only fetch: 800ms chip spinner + skeleton; sort and band pick are instant. |
| Columns (table) | Jo `loanRowHTML` | Account, Borrower (name + type sub + link), Last payment (with dormancy flag), Days past due, Amount due. |
| Views | Jo's tiers, not a bars/table toggle | Jo has no View 1/View 2 switch. Her "views" are the three size tiers plus the aging-band filter. Carried 1-to-1. |
| Aging treatment | Jo `LOAN_BUCKETS` + `loanBuckets` | Four bands in severity order: Current, 1-30 days, 31-60 days, 90+ days. Amethyst severity ramp (--am-200 → --am-700), no red. Values as text; empty bands drop out of the stack and read "no balance in this band" in the panel. |
| Sort | Jo `loanRows` / `wt-sort` headers | Account / Borrower / Last payment / Days past due / Amount due; days-desc default, text columns asc-first, each click flips the active column. |
| Drill / modal | Jo `loanDetailModalHTML` | Row (or Most-overdue row) opens a loan-detail modal: summary grid (Account, Loan type, Original amount, Amount due, Aging, Days past due, Next payment due, Last payment), a dormancy note, a payment-history table, Open loan + Record a contact next steps, Export to Excel + Close. |
| States | Jo `loanEmpty` / `loanSkeleton` | "Nothing outstanding" empty state (+ compact "All settled" Glance variant), loading skeleton on a loan-type fetch. |
| Tooltips | Jo `loanShowPop` (aging hover) + `data-tip`/`title` | Aging-band hover card (Outstanding / Loans / Share of balance); dormancy and pill tooltips carried as `title`. |
| Accessibility | Jo | sr-only aging sentence, role=button rows, aria-labelled chip with aria-haspopup/aria-expanded, listbox popover, aria-pressed band toggles. |

**Could not copy exactly / knowing deviations:** none in behaviour. The only faithful-to-Jo divergence from the Step 4 doc is the aging-band labels (see caveats). Shell-contract adaptations only: Jo's `render()`/`pop`/`modal`/`find`/`timers`/`setStatus`/`ICON` become `loanFRerender`/`LOANF_POP`/`LOANF_MODAL`/`LOANF_STATE`/`LOANF_TIMER`/`showToast`/`loanFIcon`; delegated clicks use `data-loanf` attributes gated to `.loanf-root`; the modal/popover/hover-card mount on `document.body` carrying `.loanf-root`; sizes map k/xk→Glance, s/m→Explore, l/x→Detail (Rule 12). All rendered strings, values and labels are real text in the DOM.

### Mock data (standalone `LOANF_` constants, not `MOCK_DATA`)
Jo's sample verbatim: nine loans across three types totalling **$112,037.96**. Oldest 90+ band holds Third Presbyterian Church LN-1301 (95 days, $24,690.13) and Cornerstone Academy LN-1099 (145 days, dormant, $14,250.00). Edge datasets carried too: `LOANF_LOANS_CURRENT` (all current) and `LOANF_LOANS_SINGLE` (single band); a `dataset:"none"` path drives the empty state. Because these are standalone constants, `mock-data.master.js` needs **no** re-sync (the A/B/C `MOCK_DATA.series[10]` is untouched).

### Verification
- **Static gate** `final-check-rules.py --widget 10`: `F2` node --check passes; **2 HIGH F9** (the two Sign-off Readiness rows that block build, below) — waived per owner directive to build the 1-to-1 as write-up caveats (Rule 11); **4 MED F7** em dashes, all in pre-existing shared chrome (the widget-title convention "W10 —", the shared "Customer Research —"/"Logic —" section headers present identically in all 17 widgets, the pre-existing A/B/C source name and Logic prose) — none in the loanF branch or the new Final paragraph; **1 LOW F8** empty-guard heuristic (guard exists in `loanFContent`, proven by the driver).
- **DOM-shim driver** `w10_driver.scratch.js` (extracts the loanF data + render fns verbatim from the live file, runs under a DOM shim): **17 PASS, 0 FAIL.** Asserts: non-empty render at Glance/Explore/Detail(l)/Detail(x); loan-type filter changes output; each aging-band toggle (total/cur/b1/b2/b3) changes output; sort toggle changes output; KPI Total Balance Due renders in Glance; all four aging bands render at Detail; the loan-detail drill modal opens (Loan detail + borrower + Payment history) and closes cleanly; empty state renders cleanly at Explore, Glance and via dataset=none; and a no-em-dash sweep across every loan type × band × size plus the modal.

### Backend caveats carried (Rule 11 — rendered as if real, decision lives here, not on screen)
1. **Aging-band labels differ from the Step 4 doc.** Jo labels the four bands Current / 1-30 days / 31-60 days / 90+ days; the Step 4 doc specifies Current (0-29) / 30-59 / 60-89 / 90+. The 1-to-1 build keeps Jo's labels. Reconcile in a later pass.
2. **Aging totals need the legacy oldest-first (LIFO) payment allocation rebuilt server-side** — the Modern API does not replicate it, so a Modern-API build's band totals will not match legacy. Step 1 calls this the single most consequential data-accuracy gap; the Step 4 doc has decided it is a must-fix. (Sign-off Readiness row 5, HIGH F9.)
3. **Status (Active / In Arrears) has no confirmed backing field.** Jo's build does not surface a Status column or filter (overdue-ness reads only from the aging bands), so this Final does not render the unconfirmed Status concept at all. (Sign-off Readiness row 1, HIGH F9.)
4. **Drill-through destination unconfirmed.** The loan-detail modal's "Open loan" action is a stub toast; the real navigation target is not confirmed.
5. **Ben Lane interview (13.07.2026):** these HQ-to-church loans may function more like donations than scheduled repayments, which may make the arrears framing less relevant to users. Recorded, not resolved.

---

## 2026-08-30 v3.0 — per direct instruction: aging panel out, time-range pie in, flat table

**The instruction.** "Remove the aging and make it just a table with a pie chart with the different time ranges already set up, and remove the days past due but you can keep last payment date, and don't change anything with the pop up."

**Build gate.** `final-check-rules.py --widget 10` reports **2 HIGH**: Sign-off Readiness row 1 (Status field has no confirmed backing field) and row 5 (the Modern API cannot replicate legacy oldest-first LIFO payment application, so band totals will not match legacy). The owner **explicitly waived both for this build only**, as a layout and column change that fixes neither. Both stay open and blocking. There is no Step 6 reconciliation file for W10, only the 2026-07-27 Confluence pull, so no Accepted/Disputed findings applied. Feargal's **B3** (remove date logic entirely) remains **HELD pending C2**: this build reduces the aging emphasis without pre-empting that decision, so if C2 confirms, the pie is the next thing to go and the table already stands on its own.

### The tension in the instruction, and how it was resolved

"Remove the aging" and "a pie chart with the different time ranges" pull against each other, because the time ranges **are** the aging. Put to the owner, who chose: keep the ranges as the pie's segments, but **fix the ladder first** so a corrected set is charted rather than the existing broken one.

### Confirmed composition sheet

| Component | Source | Why |
|---|---|---|
| Band ladder, corrected | **Item C1 fix** | See below. Decided before building so the new chart could not inherit a wrong label. |
| Table: one flat list | **Owner decision** | Band group headers and per-band subtotals removed. The pie now carries the range breakdown, so it is stated once rather than twice. |
| Bands as a **filter** | **Owner decision** ("one table but have it as a filter option") | The existing `loanBucket` state and `loan-set-bucket` handler are reused; only the control moved. At Detail the pie's legend rows *are* the filter; at Explore a chip row gives the same filter without a chart. |
| Columns | **Owner decision** | `Days past due` removed. `Last payment` kept, with its dormancy flag. Account, Borrower, Amount due unchanged. |
| Default sort | **New, forced by the column change** | Was `days-desc`, a sort on a column that no longer exists, which the user could neither see nor reverse. Now `amt-desc`. |
| Detail right column | **New** (`loanFBandPie`) | Replaces Jo's "Aging and risk" panel. `loanFAgingPanel` stays defined but unreachable, the gpFDonut rollback pattern. |
| Pie sizing | **W06 v2.4, measured** | Capped legend, donut on flex-basis with `min-width:0` and `max-width:100%`, leftover centred on both axes, flex-wrap for container-driven stacking. Not re-derived: reused because it was measured. |
| Donut/legend CSS under `.loanf-root` | **The W06 lesson** | This file scopes those classes per widget root. W06 shipped its toggle unstyled by forgetting this, so `.loanf-root` declares its own copies. |
| Drill modal | **Untouched, per instruction** | `loanFDetailModalHTML` not edited. It still reports days past due and aging, which is correct: the instruction was explicit. `loanFDaysCell` also stays defined, simply uncalled. |
| Glance tier | **Left alone** | Still shows the compact stacked aging bar. Not asked for, so not changed, but noted: it is the one place the aging framing survives. |

### The C1 fix, and an honest correction to how it was described

The ladder ran `Current (hi:0) / 1-30 (hi:30) / 31-60 (hi:60) / 90+ (hi:Infinity)`. `loanFBucketOf` returns the first band where `days <= hi`, so **any loan between 61 and 89 days fell through to the last band and would have been labelled "90+ days, most overdue"**. A `61-90 days` band (hi:90, sev:3) closes it, and `LOANF_SEV_COLORS` gained a fifth colour.

**Correction for the record:** this was described to the owner as a mislabel visible on screen. It is not. The mock data's day values are **6, 22, 44, 58, 95, 145** — nothing between 61 and 89 — so the fault was **latent in code and never rendered** with this dataset. It would surface on real data. The defect and the fix are both real; the claim that it was currently visible was wrong, and no mock loan was added to make it visible because `LOANF_LOANS` is Jo's verbatim sample and its $112,037.96 total is quoted in the Step 4 doc.

Consequence worth knowing: because no loan occupies 61-90, that band correctly does not appear as a chip or a pie segment today. The fix is proven by the driver, not by the screen.

### Also fixed while in there

The table footer read "All aging bands (9 loans)" — aging language the owner asked to remove, and no longer an accurate description now that the bands are a filter rather than a grouping. It reads "All loans (9)" unfiltered, and names the active range when filtered.

### Verification

- **Static gate**: 2 HIGH (both waived, above), 5 MED, 1 LOW, F2 `node --check` pass.
- **DOM-shim driver** `/tmp/w10_driver.js`: **68 assertions, 0 failures.** Includes an 11-value regression test of `loanFBucketOf` (0, 1, 30, 31, 60, **61, 70, 89, 90**, 91, 145) proving 61-90 no longer reports as 90+; that no `loan-grp` rows and no `loan-c-days` cells remain; that Last payment, Account, Borrower and Amount due are kept; that each band's filter yields exactly that band's row count and the bands partition every loan exactly once; that the legend rows carry the filter and toggle off; that Detail shows the pie and no "Aging and risk", Explore shows chips and no pie; that empty bands are not charted; that the **drill modal still renders with its payment history, export and days-past-due reporting**; and an em-dash sweep across every loan type at every tier.
- **`chart-fill-check.js`** in the browser, Detail tier, containers 1400 → 600: gutters 84/91, 9/16, 68/68, 33/33, 0/0. **No clipping, no truncation, no lopsided gutters, FINDINGS: none.**
- **`css-split-selector-check.py`** clean; `css-scope-matrix.py` reports no missing `.loanf-root` declarations.

⚠️ **Not machine-verified:** the visual balance of the Detail two-column split, and the Glance tier's unchanged aging bar.

### v3.1 — 2026-08-30, same day: two misses the owner caught on v3.0

**Reported:** "the pie chart is missing 60 to 90, and the smaller screen is missing the toggle for the pie chart."

**Miss 1 — the 61-90 range was invisible.** Both `loanFBandPie`'s legend and `loanFBandChips` filtered to ranges holding a balance, so the band added by the C1 fix vanished and the ladder read as four ranges, not five. The v3.0 write-up even rationalised this as correct behaviour, which was the wrong call: a range that is *set up* should be visible whether or not a loan currently occupies it, otherwise the ladder cannot be trusted. Both controls now walk the **full ladder in order**, with an empty range shown as a **muted, inert row reading $0**. Two constraints kept: arcs are still drawn only from ranges with a balance, since a zero slice has no geometry; and an empty range is deliberately **not** a filter control, because the only thing it could do is produce an empty table.

**Miss 2 — Explore had no route to the pie.** v3.0 gave Explore the chip filter and left the pie at Detail, reasoning that 6 columns cannot hold both side by side. That reasoning was sound but the conclusion was not: the answer is a switch, not omission. Explore now carries a **Table / Pie** segment in the header's existing toggle slot, Table default. The chip filter rides with the table view; the pie carries its own filter in its legend, so the two are not duplicated. Detail keeps no toggle, since it shows both at once.

**The per-root CSS trap, checked in advance this time.** `.loanf-root` declared no `.vt` or `.vtoggle` rule, so the new segment would have rendered as unstyled native buttons — precisely the W06 fault from earlier the same day. The `.penf-root` set was copied under `.loanf-root`, the driver now asserts those declarations exist, and the browser confirms the buttons compute `padding: 4px 9px`, `border-radius: 6px`, `cursor: pointer`.

**A driver assertion of mine was wrong and had to be replaced.** v3.0 asserted that empty ranges are *absent* from the pie. That encoded the very behaviour this fix reverses, so it now asserts they carry **no arc** instead. Worth recording: a green driver run is only as good as its assertions, and this one was green while the widget was wrong.

**Verification.** Static gate: 2 HIGH (the two waived rows), unchanged. Driver: **106 assertions, 0 failures**, adding coverage that every configured range appears in both the legend and the chips, that empty ranges are muted and inert while contributing no arc, that 61-90 specifically is present, that Explore carries the toggle and defaults to Table, that switching renders the pie and drops the duplicate chip row, that Detail has no toggle, that `.loanf-root` declares the toggle CSS, and that the legend still filters from the Explore pie view. Browser check: ladder reads Current / 1-30 / 31-60 / **61-90 (0)** / 90+ in both places; toggle renders two styled segments. `css-split-selector-check.py` and `css-scope-matrix.py` clean.
