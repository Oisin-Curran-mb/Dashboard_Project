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
