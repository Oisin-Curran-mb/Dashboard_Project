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
