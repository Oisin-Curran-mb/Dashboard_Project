# W15 — Bank Balances

**Module:** Finance  
**Status:** ✅ Minor tweaks  
**Research doc:** [15 - Bank Balances.md](../../Step 1 - Dashboard Research/15 - Bank Balances.md)
**General rules:** [General Widget Design Rules.md](General%20Widget%20Design%20Rules.md)

## Purpose
Shows current balances across all bank accounts, and lets users drill into a single account to see a breakdown of activity (deposits, checks, withdrawals, and other transactions) since the last bank reconciliation.

---

## Purpose & Competitive Fit Check (Phase 1)
**Industry standard:** bank-balance widgets should show real-time balances with clear cash-flow context; for nonprofits specifically, sources emphasize highlighting how much unrestricted cash is available and how long it will last — a "runway" framing ([Hiline](https://www.hiline.co/ledger/blog/nonprofits/nonprofit-financial-dashboard)). Notably, this exact cash + runway framing reappears in the new Phase 2 `kpi-cards` API widget (see "Possible Future Widgets" in `General Widget Design Rules.md`) — worth cross-referencing there rather than duplicating the concept here.

**Fit-check:** all three options (Table, Bar, Cards) are standard, interchangeable presentations for multi-account balance comparison. The Single Account 7-row breakdown (preserved this session) is a reasonable but old-design-specific drill-in that no competitor research directly confirms or contradicts — it's a legacy feature rather than a documented industry pattern, so its retention should rest on user value (already argued in this file) rather than competitive benchmarking.

---

## ⚠️ Major gap found and resolved this session

Old design's defining behaviour: selecting a specific account switches the **entire widget** from "All Accounts" (table + pie, balances only) to a completely different "Single Account" view — a 7-row breakdown table (Beginning Balance, Deposits, Voids, Checks, Withdrawals, EFT, Ending Balance) plus a 4-category bar chart (Deposits/Voids/Checks/Withdrawals, sign-flipped to positive bars for readability). This is explicitly called out as "the most significant view-switching behaviour of any widget on the dashboard." The earlier draft's three options (Table/Bar/Cards) only covered the All-Accounts balance view and dropped this entirely.

**Decided: preserve the Single Account breakdown view.** All three options below now have two modes, matching old design:
- **All Accounts mode** (default) — each option's own visual style for comparing balances across accounts.
- **Single Account mode** (when the Account filter narrows to one account) — the 7-row activity breakdown + bar chart, same for all three options (this part of the old design isn't option-specific, so it doesn't need three different visual treatments).

**Also noted (matches W07's earlier finding):** this widget and W07 Deposit Accounts were flagged in the original draft as "similar — consider differentiating more clearly." Now that W07 has been corrected to drop reconciliation entirely (it has no basis in `DHAccount`), the two widgets are naturally distinct: W07 is deposit-type account balances by category, W15 is bank account balances with the single-account transaction breakdown. No further differentiation needed.

## Filter Options
| Filter | Values |
|--------|--------|
| Account | All Bank Accounts *(default)* · dynamic list of active bank accounts |

**Reconciliation status display — flagged as a question for experts/dev, not decided this session.** The old design calculates balances *using* unreconciled transactions (a backend detail — beginning balance = last reconciliation's ending balance, or an opening balance if never reconciled) but never actually shows a "Last Reconciled" date or a coloured status badge as a visible field. Kept in the spec below since reconciliation is a genuinely real concept here (unlike W07), but **raise with experts/dev**: should this become a real visible field, and if so, what does "Last Reconciled" mean precisely (date of last completed reconciliation)?

**"Show" filter — dropped.** The invented Balance+Reconciliation/Balance Only/Reconciliation Only toggle doesn't correspond to anything in the old design; the real toggle is the Account dropdown switching between All Accounts and Single Account modes, not a column-visibility filter.

**KPI size (3-dot menu):** No time-based filter exists for this widget. **Decided:** the KPI tile always shows the All Accounts aggregate (Total Balance across all bank accounts), regardless of any Account selection made at larger sizes — flag for confirmation, same kind of exception as W05/W10/W11.

## Data Table Sort
- **All Accounts mode:** fixed alphabetical by Account Name. Not user-changeable.
- **Single Account mode:** fixed row order (Beginning Balance → Deposits → Voids → Checks → Withdrawals → EFT → Ending Balance) — this is a structural breakdown, not a sortable record list.

## Drill-Through
No separate page link — the Single Account mode already is this widget's drill-in mechanism, matching old design (no further drill-down or navigation away observed).

## Refresh
Standalone icon on the card (not a 3-dot menu item), present at every size including KPI. Preserves the current Account selection on refresh, matching old design.

---

## Option A — Balance + Reconciliation Table *(Keep/Refresh)*

**Chart (All Accounts mode):** Table — Account · Balance *(· Last Reconciled · Status, pending the flag above)*  
**Chart (Single Account mode):** 7-row breakdown table, matching old design exactly  
**Views available:** Table (default) · Cards · Bar  
**Improvement note:** Most complete view; reconciliation status alongside balance in one scan (once confirmed).

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | All Accounts: 2 rows, balance only. Single Account: Ending Balance + one headline activity figure only (full 7-row table doesn't fit at this size). |
| **Medium (2×2)** | All Accounts: 4 rows, full columns. Single Account: full 7-row table. |
| **Large (4×4)** | All Accounts: all accounts + totals row + reconciliation detail. Single Account: full 7-row table + the 4-category bar chart, table toggle. |
| **KPI (1×0.5)** | Headline: **Total Balance across all bank accounts** (All Accounts aggregate, regardless of Account selection — see note above). No download, no switch. |
| **Expanded** | Same as Large for whichever mode is active, all filters live inside the modal |

---

## Option B — Balance Bar Chart *(Improve)*

**Chart (All Accounts mode):** Vertical bar per account showing current balance  
**Chart (Single Account mode):** the same 7-row breakdown table + 4-category bar chart as Option A (not option-specific — see note above)  
**Views available:** Bar (default) · Table  
**Improvement note:** Visual comparison of account balances; spot large vs small accounts instantly.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | All Accounts: 3 bars, no labels. Single Account: Ending Balance + one headline activity figure only. |
| **Medium (2×2)** | All Accounts: all bars + balance labels. Single Account: full 7-row table. |
| **Large (4×4)** | All Accounts: all bars + reconciliation colour overlay (pending flag above) + table toggle. Single Account: full 7-row table + 4-category bar chart, table toggle. |
| **KPI (1×0.5)** | Headline: **Total Balance across all bank accounts**, same as Option A. No download, no switch. |
| **Expanded** | Same as Large for whichever mode is active, all filters live inside the modal |

---

## Option C — Account Cards *(Keep/Refresh)*

**Chart (All Accounts mode):** Card per account — name, balance, status badge (pending flag above)  
**Chart (Single Account mode):** the same 7-row breakdown table + 4-category bar chart as Options A/B (not option-specific)  
**Views available:** Cards (default) · Table  
**Improvement note:** Compact card layout easy to scan quickly.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | All Accounts: 2 cards. Single Account: Ending Balance + one headline activity figure only. |
| **Medium (2×2)** | All Accounts: 3 cards. Single Account: full 7-row table. |
| **Large (4×4)** | All Accounts: all accounts + total balance footer. Single Account: full 7-row table + 4-category bar chart, table toggle. |
| **KPI (1×0.5)** | Headline: **Total Balance across all bank accounts**, same as Options A/B. No download, no switch. |
| **Expanded** | Same as Large for whichever mode is active, all filters live inside the modal |

---

## Fine-Tuning Notes
- Reconciliation status badges (pending confirmation above): green = reconciled, amber = pending, red = overdue
- ~~Show filter changes which columns are visible, not which accounts appear~~ — dropped along with the invented "Show" filter; see note above.
- ~~W15 and W07 (Deposit Accounts) are similar — consider differentiating them more clearly~~ — resolved: W07's reconciliation framing was dropped as a mismatch, so the two widgets are now naturally distinct.

---

## 2026-07-23 — Create Mock Designs run (fragment/assembler flow): 3 options rebuilt

Built with the revised Create pipeline (isolated fragment files + `assemble-mock-widget.py`). Real `series[15]` is a per-account list: `accts:[{n,bal,s,sc,ico,d}]` (name, balance, status text, status colour, icon, reconciled-date note). Prior entries above unchanged.

### Option A — Balance Cards *(Keep/Refresh — Restyled Original)*
Each account as a card: icon, name, last-reconciled note, balance and a colour-coded reconciliation status chip. Legacy account list restyled; Table view alternate.

### Option B — Reconciliation Overview *(Improve — Competitor Match)*
A **Reconciled vs Pending total strip** above per-account balance bars coloured by reconciliation status; Table view alternate. **Rule 10 second dimension: the reconciled/pending split** — how much cash is confirmed versus still unreconciled, using the `s` status field a plain balance list ignores. Deliberately not "just another bar chart of balance."

### Option C — Balance Composition *(Redesign — Maximum Freedom)*
Reframes around where the cash sits: each account's **share of total balance** as a proportion bar (bar length = % of total, per Rule T5), with status; Table view adds a % of Total column. **Rule 10 second dimension: each account's percentage of the whole.**

### Rules 8/9
Per-option filter scoping via `fk=wid+'-'+opt` (Account filter read via `fv(fk,…)`); shared branches extended to include `wid===15` (4/5/6/9/10/11/13 intact). KPI = Total Balance across all accounts (fixed, filter-independent). KPI/Medium/Large render for all three; **Small retained for all three** (no no-Small exception for W15); each option's view toggle checks `view` before rendering, so it's live at every size (no dead control). KPI size button added to all three cards.

### Rule 11 — data caveats (documented here, not shown on-screen)
Reconciliation status (`s`) drives Option B's split and the status chips; the underlying reconciled/unreconciled figures come from the mock data — confirm backend availability of a per-account reconciliation status/date at finalisation. Not surfaced as a caveat on the mockup.

### Where written
`Dashboard Widget Mockups.html` — `WRENDER[15]` (scaffold + 3 branches), `MOCK_DATA.options[15]`, the three `opt-15-*` cards, shared filter branches. `mock-data.master.js` re-synced for `options[15]` (`series[15]` unchanged). Final Check tab `#fc-widget-15` not edited (known shared-render carryover). Built via `_build/W15/` fragments + `assemble-mock-widget.py`.

---

## 2026-08-30 — FINAL build (bankF), 1-to-1 copy of Jo Lopez's Bank Balances

**The instruction.** "Bank Balances, copy over 1 to 1 while fitting her style, Jo's version, as it just better."

**Build gate.** `final-check-rules.py --widget 15` reports **1 HIGH**: Sign-off Readiness row 3, the Modern API's single-account endpoint returns only a summary balance, with no 7-row breakdown and no by-account bar chart. Jo's design is built on exactly that breakdown, so the port renders the thing the backend cannot yet serve. The owner **explicitly waived it as Rule 11 forward design**: the mockup renders as if real, the caveat lives here and in the Step 4 doc, and row 3 stays open as a named backend ask. There is no Step 6 reconciliation file, only the 2026-07-27 Confluence pull.

**Two open review items, settled by the port** (the pattern used for W16 on 2026-08-19, owner-confirmed):
- *"Single Account mode isn't built"* — **RESOLVED.** Jo built it (`bankSingleView` / `bankSingleTable` / `bankSingleFull`) and the port brings it whole. The review list called it "the most significant view-switching behaviour of any widget on the dashboard"; it now exists.
- *Reconciliation status badges* — **answered by omission.** Jo does not surface them anywhere in her bank block, so the Final ships without. The expert/dev question stays open but stops blocking.

### What came across, and from where

Every component is Jo's, ported verbatim and renamed `bank*`/`BANK_*` → `bankF*`/`BANKF_*`. Source: her Widget Container Demo `bank` block, extracted to scratch first (25 functions, 3.9KB of data, 104 CSS rules, 10 delegated actions) and inventoried before a line was written.

| Component | Source |
|---|---|
| Both scopes: All Accounts and Single Account | Jo `bankContent` / `bankSelected` |
| Glance | Jo `bankGlance`, both variants (selected account and all-accounts with the overdrawn drill) |
| Balance table, sortable, Load more paging | Jo `bankAllTable` |
| Diverging balance bars with a zero axis and overdrawn handling | Jo `bankAllBars` |
| 7-row activity table (Beginning, Deposits, Voids, Checks, Withdrawals, EFT, Ending) | Jo `bankSingleTable` |
| 4-category activity bars with her hover card | Jo `bankBars` + `bankShowBpop` |
| Table / Bars toggle at Explore; Detail shows both columns and no toggle | Jo `bankViewToggle` + `bankHeaderBlock` |
| Account listbox chip, overdrawn filter chip | Jo `bankAcctChip` / `bankOdChip` |
| Drill overlay | Jo `bankDrillModalHTML` |
| Skeleton, negative-money glyph, account values | Jo `bankSkeleton`, `bankMoney`, `BANK_ACCOUNTS` (26 accounts, values unchanged) |

Shell-contract adaptations only: `ICON`/`fmtAxis`/`money`/`find`/`render`/`modal`/`timers`/`pop` become `bankFIcon`/`bankFAxis`/`bankFMoney`/`BANKF_STATE`/`bankFRerender`/`BANKF_MODAL`/`BANKF_TIMER`/`BANKF_POP`; `data-action="bank-*"` becomes `data-bankf="*"` gated to `.bankf-root`; tiers map k/xk → Glance, s/m → Explore, l/x → Detail per Rule 12.

### Three knowing deviations, none of them taste

1. **An empty-data guard.** Jo's bank block has none. This project's Final rule requires one the driver can assert, so `bankFEmpty` exists, written in the shared state-block language.
2. **A working search box.** Jo renders the input but her block carries no handler, so ported verbatim it would be a dead control. Wired to filter the **table only**, leaving the bars, the KPI and the all-accounts total untouched.
3. **`--wn-500` fallback.** Her balance-bar zero axis uses `var(--wn-500)`, and **that token is undefined in her file as well as ours**, so the zero line renders invisible in her own build. A fallback was supplied because the zero axis is what makes a diverging bar readable. **This is a defect in Jo's original and worth telling her.**

### The CSS scoping problem, and what it cost

This is the part worth reading. **This file declares its design tokens and its component classes per widget root, not globally.** Getting that wrong took four passes, and only the browser ever caught it:

1. **Pass A** — a grep-based analysis found 34 shared-looking classes (`vtoggle`, `scroll`, `wt-head`, `dep-total`, `kpi-row`, `metric-value` and so on) that needed declaring under `.bankf-root`, filled by copying from donor roots.
2. **Pass tokens** — the browser then showed `--red-100` computing to near-black. Cause: **every token is declared per root** (`.depf-root` 67, `.prf-root` 66, `.penf-root` 59...). `.bankf-root` had none, so *every token the port referenced resolved to empty*. It looked plausible only because properties fell back to inherited values. A first fix scanned only the tokens the bankF section referenced (26) and was still short, because global-looking rules reference tokens too; replaced with the full 57-token union.
3. **Pass A2** — the account chip was still rendering as a default browser button. `.filter-chip`, `.iconbtn`, `.mi`, `.modal-h/.modal-b/.modal-title`, `.bgt-pop-*` are **also** per-root; my first pass had wrongly classified them as global. Also found: `.wt-type` never came across at all, because the extraction from Jo's file took only rules mentioning `bank-`.
4. **Pass A3** — the browser then showed table rows stacking vertically. `.wt-row` had no rule reaching us: only `.bankf-root .wt-row .lr-main` (an ancestor context) and `.wt-row.wt-head` (a compound). **Two successive versions of my own check were fooled by those.** The correct test is whether the class sits in the selector's **final compound**, i.e. whether it is what the rule actually styles.

**The lesson, recorded because it has now cost time on W06, W10 and W15:** grepping for "is there a rule mentioning this class" cannot tell you whether the rule **reaches** your element. Only computed style can. The 185-assertion driver passed green through every one of the four failures above, because the markup was always correct and only the cascade was missing.

### Verification

- **Static gate**: 1 HIGH (the waived row 3), 8 MED, 1 LOW, F2 `node --check` pass.
- **DOM-shim driver** `/tmp/w15_driver.js`: **185 assertions, 0 failures.** All 30 ported functions present; every account keeps Jo's 6-value activity array; all three tiers plus the hidden mid slot render with the right `data-tier`; both scopes render in both views; the overdrawn count matches the data and the filter switches the total label; the Single Account 7-row table renders every movement row and foots to an ending balance; the activity bars carry all four categories and Jo's hover payload; Detail shows both columns with no toggle; **ending balance equals the sum of each account's six values for all 26 accounts**, and the total equals the sum of endings; the negative-money glyph is Jo's; both deviations behave (empty state at two tiers, search keeps matches and drops non-matches without changing the total label); the drill overlay is a real dialog titled with the account; ten delegated handlers each do their job; the listbox offers every account plus All; **30 classes are asserted as declared under `.bankf-root`**; and an em-dash sweep across 81 scope × view × size combinations.
- **Browser, computed styles**: tokens resolve (`--red-100 #b03a3a`, `--wn-400 #d4cfc8`), overdrawn amounts compute red `rgb(176,58,58)`, the zero axis is visible, `.wt-row` computes `flex`, the chip carries a token border rather than a browser default, and the Table/Bars segment is styled.
- **CSS guards**: `css-split-selector-check.py` clean, `css-scope-matrix.py` reports no missing `.bankf-root` declarations.
- **No cross-widget damage**: W02 (23), W04 (160), W06 (78), W10 (106) drivers all still green.

⚠️ **Not machine-verified**: fine visual spacing, and the account-listbox popover position.

**Also noticed, not acted on:** `.purf-root` (W13) has **no token block** and renders alone, unlike `.gpf-root` which survives by rendering inside `remf-root`. That may mean W13 has the same silent token problem. Not touched, since it is outside this build.


---

## 2026-09-04: Final rebuilt from the requirements handoff, in Jo's design language

**Why.** The 2026-08-30 Final recorded above was a deliberate verbatim 1-to-1 port of Jo Lopez's bank block. The owner discarded it on 2026-09-03. The instruction for this rebuild was different in kind: "change the design to Jo's, dont copy it but take what is in it and try to copy it for Bank Balances W15." So behaviour comes from `W15 - Bank Balances - BUILD REQUIREMENTS (handoff).md` and nothing else, and Jo's design language is re-implemented against those requirements rather than transplanted. Prefix `bkf` / `BKF_`, CSS root `.bankf-root` (the root name is kept; the JS prefix is deliberately fresh so any surviving residue of the discarded port is obvious). An interrupted earlier attempt at this rebuild had left a partial `.bkf-root` / `bkf` draft in the file that stopped mid-way through the renderers, with no Single Account mode, no Glance, no entry point and no handlers, and with an explicitly non-Jo native-table design; it has been replaced wholesale.

### The composition sheet: every component, and its source

| Component | Source | How it was adapted |
|---|---|---|
| Header grid | Jo's `.dep-hd` two-row grid, `display:contents` children, `.dep-hd-toggle`, `.dep-hd-num>*:first-child`, `.bank-hd-left` single-cell toolbar group | Her values; `row-gap` 14 to 10 and padding `14px 16px 16px` to `12px 16px 12px`, because the W11 download row sits directly beneath and her spacing plus that row pushed the table too far down |
| KPI figure and context line | Jo's `.metric-value`, `.dep-hd-kpigrp`, `.bank-numwrap`, `.bank-ctx` | Verbatim values |
| Overdrawn treatments | Jo's `.bank-pill.warn` (header) and `.bank-tag-over` (row) | Verbatim values. Both are required by handoff section 12: colour is never the only signal |
| Account control | Jo's `.filter-chip` plus `.bank-acct-chip`, `.fc-label` | Chip trio restated for our own handler attribute `data-bkf` per Styling Reference 9.1 |
| Switch View | Jo's `.vtoggle` / `.vt` / `.vt.on` | Verbatim values. Three presentations; All Accounts mode only, per handoff section 4 |
| Icon buttons | Jo's `.iconbtn` family | Verbatim values. Download and both pager buttons |
| Balance Table | Jo's `.wt-row` / `.wt-head` / `.lr-main` / `.wt-c2` / `.bank-bal` / `.dep-total` values on a NATIVE `<table>` | See "the native table decision" below |
| Balance Bar Chart | Jo's `.bank-hb` diverging bar with a zero axis, her grid columns and track | Three changes: the axis is given a declared colour, the negative fill stays on the amethyst ramp, and the rows are not sorted. See below |
| Account Cards | Composed from Jo's card vocabulary: `.dep-col` frame, `.dep-col-h` label treatment, `.tr-val` display figure | She has no card presentation for bank, so this is assembled from her parts rather than invented |
| Seven-row breakdown | Jo's statement framing: her `.bank-anchor` muted Beginning Balance and her `.dep-total` closing treatment | Hers puts the ending figure in a `.dep-total` outside the table, which would be an eighth row; here it is row 7 inside the table with the same treatment, so the table has exactly the seven rows handoff section 3 names, and no totals row |
| Four activity categories | Jo's `.bank-cols` vertical column chart, taken whole: 40px y axis, `.bank-canvas` bottom rule and dashed mid gridline, `.bank-col` hover band, 56%-wide bar capped at 46px, `.bank-xaxrow` label plus value under each column | Money out moves from her `--red-100` to `--am-700`; her per-column hover popover is dropped |
| Account picker | Jo's `.pop` styling, `.mi` / `.mi-nm` / `.mi-gap` / `.cap` / `.sep` / `.menu-scroll`, and her `.bank-mi-bal` trailing balance | Verbatim values, minus her search input |
| Empty state | Jo's `.state` / `.state-title` / `.state-sub` and her `[data-kind="empty"]` icon colour | Verbatim values; the copy names the gap rather than inventing a treatment |
| Negative money glyph | Jo's U+2212 MINUS SIGN, `−$` | Taken as-is |
| Server paging model, ordering, aggregation | Handoff section 5 | Not from Jo at all; she pages client-side |
| Table view is the default; download is an icon only in the right-hand corner in its own slim row; filters and chips on one line; no footnote panel, no gap-notes panel, no "SELECTED" text | **Carried over from W11's settled UI decisions (2026-09-03)**, not from W15's own sources | Applied as-is |

### Jo's behaviour deliberately NOT rebuilt (handoff section 11)

Sortable balance columns (contradicts section 7's fixed alphabetical order; sortable columns stay open item 7, an owner decision, and are left unbuilt), "Load more" paging (replaced by a server-paged Previous page / Next page control), the overdrawn filter chip and the overdrawn count on the Glance figure (no source document), the search box over the account table (no source document; it existed in the port only because she renders an input with no handler), the per-account drill overlay (section 1 is view only and Single Account mode already is the drill-in), the per-bar hover card (unspecified, and section 12 is satisfied by the value being text in the DOM), and client-side sort, slice and totals. The driver asserts the absence of every one of these. Where a visual pattern was inseparable from a dropped behaviour, the visual was taken and the behaviour dropped: her diverging bar keeps its shape but not its sort, and her account picker keeps its row design but not its search.

### The native table decision, recorded so nobody "fixes" it

Handoff section 12 requires real table semantics, `th` with `scope`, on both the account table and the seven-row breakdown. Styling Reference 7.1 records that this file styles tables as flex `.wt-row` stacks with ARIA roles, and that native `<table>` is "the fuller fix" that only makes sense if the whole file moves together. The role approach cannot meet this requirement: everything here is set through `innerHTML`, and per the HTML Standard a `th`, `td` or `tr` start tag in the "in body" insertion mode is a parse error and is ignored, so a `<th scope="col">` inside a `<div role="row">` vanishes and only its text survives, taking the cell class with it. So both tables are real tables carrying Jo's class names and her values. The one adaptation: `.wt-row` is a `<tr>` and therefore does not take her `display:flex`, because that would strip the table roles browsers derive from table display; `table-layout:fixed` supplies the column widths her flex-basis values used to, and the padding, borders, sticky positions and backgrounds sit on the cells rather than the row (sticky on a `<tr>` is not honoured in every engine). **Caveat: the parser claim is derived from the specification, not verified in a browser in this session.** A full `<table>` inside a `<div>` is unambiguously valid, which is the direction that matters for this build.

### Two places where this project's convention beat Jo's, and one real defect in hers

1. **`data-tier` chart sizing is mandatory here** (Styling Reference 8.1). Her whole file carries two `data-tier` occurrences, so her charts take whatever flex gives them. Both charts here are tier sized, on the root and on the chart container.
2. **Styling Reference 8.2 keeps red off bars and arcs**, reserving it for variance text and pills. Her `.bank-hb-fill.neg` and her `.bank-col.out .bank-bar` are `--red-100`. Here both stay on the amethyst ramp (`--am-500` in, `--am-700` out), and the negative signal is carried by position relative to the zero axis, her `.bank-hb-warn` glyph, the word Overdrawn, and a legend that states in words which side means what.
3. **A real defect in her original.** Her `.bank-hb-zero` reads `var(--wn-500)`, and `--wn-500` is declared nowhere in her file. An undefined `var()` is valid CSS that silently drops its own declaration, so **the zero axis of her diverging balance bar has no background and is invisible in her own build.** This one uses `--wn-750` (`#87827b`, warm-neutral-750, a verified Pathway primitive) and widens it to 1.5px so it reads as an axis rather than a seam. `--wn-500` is not declared here either, deliberately: it is not a value the Styling Reference verifies, so inventing one would have been worse than picking a declared step.

### The Final Check card chrome, which was the defect that forced this rebuild

W15's `fc-widget-15` section had **never been converted to F mode at all**. It carried zero `#fc-widget-15.fc-fmode` rules while every other Final carries 8 or 9, zero two-span `fc-szhd` size headings, and no occurrence of the words Glance, Explore or Detail, so its card kept rendering the four-size A/B/C ladder no matter what the renderer produced, and its visible copy still claimed Single Account mode "isn't built". The card block is rebuilt on W16's structural template: a design-option switch defaulting to Final (v2), the two-span `.fc-szhd-abc` / `.fc-szhd-f` pattern throughout (28 occurrences, matching W10, W11 and W16 exactly), all nine `#fc-widget-15.fc-fmode` rules copied verbatim from W10 including `.opt.sz-l{grid-column:1/-1}`, and rewritten Purpose, Sources and Logic sections. `fcInitState(15,'A')` is back to `'F'` and `WRENDER[15]` dispatches `opt==='F'` to `bkfRender`.

### RULE 11 CAVEAT, which must not reach the screen

**The Modern API cannot serve Single Account mode at all.** Its single-account endpoint returns only a summary balance: there is no seven-row breakdown and no activity-category data anywhere in the backend today. This is open item 3 in the handoff and the widget's largest gap. The owner previously waived it explicitly as Rule 11 forward design, so Single Account mode is built here **as if the data were real**, and this caveat lives in this write-up and in the build report only. It is deliberately not rendered on screen. It stays a named backend ask, and it is the reason the static gate still reports one HIGH (Sign-off Readiness row 3).

### Recorded gaps, and who settles each

| Gap | Rendered as | Who settles it |
|---|---|---|
| Negative-balance accounts in the bar chart and the cards (open item 6) | Shown on the correct side of the zero axis, with one muted line naming the gap, appearing only on a page that actually contains one | Design |
| A zero-account organisation (section 10) | A clean empty state whose sub line says the treatment is unspecified | Design and owner |
| **The loading treatment (open item 8)** | **Nothing. Not built and not invented.** Paging is now a server round trip so this widget needs one more than most, but no source defines any loading behaviour. Jo's `.bank-skel` shimmer styling was available and was deliberately not borrowed, because borrowing it would have meant inventing the behaviour to hang it on | Design and owner |
| No module rights, error or API failure, freshness or "data as of" (section 10) | Nothing built | Design and owner |
| Last Reconciled visibility (open item 1) | Nothing built | Experts and dev |
| Size behaviour against real volume (open item 2) | Nothing built; the locked size table is followed | Design |
| Which accounts show when a list is trimmed (open item 4) | Nothing built; no trimming happens, the full set is paged | Design |
| The Glance aggregate-regardless exception (open item 5) | Built as specified, and named in the card copy as flagged for confirmation | Owner |
| Sortable columns (open item 7) | Nothing built; the whitelist is enforced so that granting it later is a server parameter | Owner |
| Cash runway or days of cash (open item 9) | Nothing built | Owner and SME |
| An unreconciled-item count on the rows (open item 10) | Nothing built | Owner and SME |

### Mock data

About 50 accounts (52) in standalone `BKF_ACCOUNTS` next to `WRENDER[15]`, **not** `MOCK_DATA` entries, so `mock-data.master.js` needs no re-sync; `MOCK_DATA.series[15]` was verified byte-identical before and after, and the master mirror already matches it. The array is deliberately not in name order, so that the ordering assertions cannot pass without the ordering code running. Ending balance is derived (`beg + dep + vd + chk + wdr + eft`) and never stored, so nothing can drift. Checks and Withdrawals are stored negative; the magnitude is taken only at the point of chart display. Four accounts end overdrawn and three have never been reconciled, so both beginning-balance origins and the negative path are genuinely exercised.

### Verification

- `node --check` on both inline `<script>` blocks: pass. CSS brace balance 2860/2860, and a JS-in-CSS scan of the generated stylesheet found nothing.
- `css-token-resolve-check.py`: `.bankf-root` 25 tokens used, all 25 declared, 42 declared in total. The only FAIL in the file is the pre-existing `.arf-root` missing `--brand-300`, which is not this widget's and was not touched.
- `css-split-selector-check.py`: clean. `css-scope-matrix.py`: 16 candidates, byte-identical to the pre-edit baseline, none of them `bankf` (that script's root list does not include `bankf`, so it does not check this widget; the driver's own per-root reachability check covers it instead).
- `final-check-rules.py --widget 15`: 1 HIGH (the waived Sign-off Readiness row 3, above), 3 MED, 1 LOW, F2 pass. The 3 MED are all F7 em-dash hits outside the F build: two are the `.fc-szhd-abc` A/B/C size headings, whose wording every other Final preserves verbatim by the Rule 12 convention, and one is inside the pre-existing option-A branch. W15's 3 MED is the lowest of the built Finals (W10 5, W11 7, W16 9).
- **DOM-shim driver `w15-bkf-final.driver.js`: 215 assertions, 0 failures.** It extracts the bkF JS block, the `.bankf-root` stylesheet and the `fc-widget-15` markup verbatim from the live file on every run; nothing is inlined, and it takes an optional path argument only so the extraction itself can be proved. **Proved live by mutation testing:** seven deliberate defects were introduced into copies of the build (the totals row reducing over the page it was handed, the unique tiebreaker removed, the zero axis pointed back at the undeclared `--wn-500`, an em dash in a rendered string, the Detail full-width `grid-column:1/-1` rule deleted, the sort whitelist bypassed, and the bar-chart values reduced to hover only) and the driver failed on every one, then passed again on the untouched file.
- The single-account-organisation rule (section 3) is covered against a one-row subset of the existing mock set, so nothing is invented for it. **A judgement call is recorded there:** section 3 says only that the "All Bank Accounts" *option* does not appear with one account; it does not say which mode the widget is then in. This build stays in All Accounts mode with the chip reading "The only active account", the picker offering no aggregate, and no pager. If the owner wants a single-account organisation to open directly in Single Account mode instead, that is a one-line change to `bkfIsAllMode`.
- No cross-widget damage: `final-check-rules.py` output is byte-identical before and after for W01, W05, W06, W09, W10, W11, W16 and W17; every `WRENDER[N]` body except 15 is byte-identical; the giant single-line Dashboard-tab markup block is byte-identical by SHA; the region diff against the pre-edit snapshot shows exactly five changed regions, all intended.

⚠️ **Not machine-verified, and not provable here:** fine visual spacing, the account-picker popover position, whether the account-name column avoids the ellipsis at Explore's real 592px, and the parser claim behind the native-table decision. Those need a browser. `chart-fill-check.js` was not run for the same reason.
