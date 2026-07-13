# W07 — Deposit Accounts

**Module:** Finance  
**Status:** ✅ Minor tweaks  
**Research doc:** [07 - Deposit Accounts.md](../../Dashboard Research/07 - Deposit Accounts.md)

## Purpose
Shows the current balances of all active deposit accounts, grouped by account type. Gives staff a snapshot of how much is held across different account categories as of today. *(Corrected — the earlier draft's "reconciliation status" framing doesn't match this widget's real data at all; see note below.)*

---

## Purpose & Competitive Fit Check (Phase 1)
**Industry standard:** bank/deposit-account balance widgets are typically simple — name and balance, grouped by type, real-time ([Coupler.io](https://blog.coupler.io/financial-dashboards/), [Golimelight](https://www.golimelight.com/blog/financial-dashboards-for-nonprofits)) — reconciliation status is not a standard feature of this specific widget type in any source found.

**Fit-check:** this reinforces the mismatch finding below on independent grounds — the baseline (table + pie, no reconciliation) is the industry-typical shape for an account-balance widget. Nothing in the competitor research supports adding reconciliation status here either; that concept belongs on a bank-reconciliation-specific screen, closer to what W15 Bank Balances already covers. This adds external confirmation to the existing "keep baseline, treat A/B/C as speculative" decision — no change recommended, but worth citing in the Phase 3 write-up.

---

## ⚠️ Major mismatch found — resolved for now, but needs expert/dev sign-off

The old design's real data (`DHAccount`/`DHTypeRepository`) has **no reconciliation concept whatsoever** — it's just account name, inception date, account number, and balance, grouped by account type. The new spec's three options (A/B/C below) were built entirely around "reconciliation status" (green/amber/red badges, Last Reconciled column) — this looks like it may have been written with a different widget in mind (possibly W15 Bank Balances).

**Decided for this pass:** the baseline widget below matches the **old design exactly** — that's what ships if nothing else is approved. Options A/B/C are kept in this doc as **speculative concepts, not committed specs** — pending two open questions:

- **Question for design experts:** which of these three reconciliation-oriented concepts (if any) would they actually want to pursue over the plain baseline below?
- **Question for the dev team:** if we go ahead with any of A/B/C, can reconciliation status / Last Reconciled data actually be sourced or added to `DHAccount`? Nothing today confirms this field exists or is derivable.

Do not build A/B/C until both questions are answered.

---

## Baseline (matches old design, ships if no concept is approved)

**Chart:** Table + pie chart, side by side, exactly as today.

- **Table:** one row per active deposit account — Name, Inception Date, Account Number, Ending Balance. Totals row at bottom (count of accounts + combined balance). Sort: fixed, by Name then Inception Date (matches old design, not user-changeable).
- **Pie chart ("By Account Type"):** one segment per account type, combined balance per type.

## Filter Options
| Filter | Values |
|--------|--------|
| Account Type | All Types *(default "Show All")* · dynamic list from `DHTypeRepository` |

**Filter scope — kept intentionally quirky, matching old design:** the Account Type filter narrows the **table only**. The pie chart always shows **all** account types regardless of the filter. This was flagged as a possible point of confusion in the original research, but fixing it would collapse the pie chart to a single slice whenever a specific type is filtered — defeating its purpose as a distribution view. **Decided: keep as-is for now.**

**KPI size (3-dot menu):** No time-based filter exists for this widget — KPI size shows no filter, or Account Type only, plus Widget size + Fullscreen. Headline: **Total balance across all active deposit accounts** (matches the old design's table totals row).

## Data Table Sort
Fixed — Name, then Inception Date (matches old design). Not user-changeable.

## Drill-Through
**Open question for design experts/dev team, not decided this session.** No drill-down exists in the old design (the table already shows account-level detail). Whether to add a link out to the Deposits On Hand module is deferred pending expert/dev input — do not build until answered.

## Refresh
Standalone icon on the card (not a 3-dot menu item), present at every size including KPI.

---

## Option A (concept, not committed) — Balance Cards *(Keep/Refresh)*

**Chart:** Card per account showing balance + reconciliation status badge  
**Views available:** Cards (default) · Table · Vertical bars  
**Improvement note:** Quick visual scan of all account positions.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small** | 2 account cards stacked |
| **Medium** | 3-4 account cards in a row |
| **Large** | All accounts + reconciliation status + totals |

---

## Option B (concept, not committed) — Vertical Bar Chart *(Improve)*

**Chart:** Vertical bar per account showing balance  
**Views available:** Bar (default) · Table  
**Improvement note:** Easier to spot the relative size of each account balance.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small** | 3 bars, no labels |
| **Medium** | All bars + balance labels |
| **Large** | All bars + labels + reconciliation status indicators |

---

## Option C (concept, not committed) — Summary Table *(Keep/Refresh)*

**Chart:** Table — Account · Balance · Last Reconciled · Status  
**Views available:** Table (default) · Cards  
**Improvement note:** Full detail view, best for reconciliation review.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small** | 2 rows, scrollable |
| **Medium** | 4 rows, scrollable |
| **Large** | All rows + totals row |

---

## Fine-Tuning Notes (apply only if a concept is later approved)
- If reconciliation status is confirmed buildable, use colour badges: green = reconciled, amber = pending, red = overdue
- ~~Display filter changes what columns/fields appear, not which accounts~~ — dropped along with the invented "Display" filter; the baseline above has no such filter.
