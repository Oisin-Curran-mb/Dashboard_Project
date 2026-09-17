# W07 — Deposit Accounts

**Module:** Finance  
**Status:** ✅ Minor tweaks  
**Research doc:** [07 - Deposit Accounts.md](../../Step 1 - Dashboard Research/07 - Deposit Accounts.md)
**General rules:** [General Widget Design Rules.md](General%20Widget%20Design%20Rules.md)

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

---

## 2026-07-30 - Final COMPLETE, tagged v2.0, Jo design (Deposits On Hand)

The Final Check tab's Final build of this widget is complete. Version badge set to v2.0 (`FC_VERSION[7]`); title badges: "Final" and "Jo design"; the widget is titled "Deposits on Hand" (the management rename, see below). The Final renders by default; the earlier design options stay reachable from the section's design-option switch. Summary of what shipped:

**Composition (Jo's design, carried 1-to-1):** the Final is Jo Lopez's "Deposits on Hand" widget carried into the Final Check tab as a one-to-one base (the additive `depF` block beside `WRENDER[7]` in `Dashboard Widget Mockups.html`; the other branches are byte-untouched), PLUS four owner-directed changes (below). Jo's base, carried as-is:
- Three views: Table (default), Distribution (donut), Trend (multi-line).
- A KPI headline: total balance plus a delta pill plus a Compare To control plus a scrubbable sparkline.
- An account-scope filter chip (All Accounts / account types / individual accounts, searchable).
- A sortable table with live search.
- Empty, loading, and error states.
- Her account / type detail modal.
- Accessibility (values as text, keyboard-reachable controls).

**Sizes (Rule 12), four-to-three mapping:** Jo's widget uniquely ships FOUR tiers (kpi / wide / large / xwide). Mapped to the project's THREE sizes: Glance = kpi, Explore = wide, Detail = xwide. Her middle **`large` tier is dropped** (not rendered). Owner decision.

**Owner-directed changes on top of the 1-to-1 (recorded as deviations):**
1. **Table pagination:** 50 accounts per page with a pager. The mock account dataset was expanded to 125 accounts to demonstrate it. The KPI total and the subtotals compute over the FULL set; pagination is display-only. Grand total: $106,726,837 across 125 accounts.
2. **Scope-dependent Distribution and Trend breakdown:** at All Accounts the breakdown toggle offers only Total / By Account Type (the standalone all-accounts "By Account" option is removed); when scoped to a single account type it offers Total / By Account, showing that type's accounts.
3. **Click drills, does not expand:** the old click-to-expand / focus / drill-modal behaviour on Distribution and Trend is removed. Clicking an account-TYPE series (a donut slice or a trend line) sets the top-left scope filter to that type and switches the breakdown to By Account (the before/after the owner demonstrated). Clicking an individual ACCOUNT series is inert. The Table row -> account detail modal is preserved (that is not a chart click).
4. **Compare To gained a "period" option** between month and quarter, so the scale is Previous week / month / period / quarter / fiscal year / calendar year (period = fiscal period, per-org fiscal calendar, Time Window Module ordering). It computes a real intermediate delta.

**The rename (management, Step 6):** management renamed "Deposit Accounts" to "Deposits On Hand" (the term accountants understand, matching the module name; sign-off gap #9: widget said "Deposit Accounts", module says "Deposits On Hand", sibling is "Bank Balances"). The built Final uses "Deposits on Hand". The project-wide rename (file names, other Step docs, the tracker) is a SEPARATE pass and is NOT done here.

**Verification:** the per-widget Node DOM-shim driver grew across the changes (111 -> 119 -> 145 assertions), 0 failures. Browser-faithful CSS parse: 0 dropped rules. `final-check-rules.py`: 0 HIGH. W01-W06 Final regressions intact. Dashboard tab byte-identical before and after. `FC_VERSION[7]` = 2.0.

**Sign-off pointer:** the Step 6 "Deposits On Hand" dossier's findings (the 13 Jul 2026 live audit, the ~14-gap list, the top-10 insights, the rename gap, and the "balances have no comparison / delta / trend" gap) are captured and reconciled in this widget's Step 4 doc under **Sign-off Input (dossier)**. No `Reconciliation - Deposit Accounts` file exists yet.
