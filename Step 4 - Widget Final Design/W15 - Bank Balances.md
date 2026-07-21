# W15 — Bank Balances

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W15-Bank-Balances.md](../Step%203%20-%20Mock_Work/Widget_Specs/W15-Bank-Balances.md)
**Data source & formulas:** [Step 1 - Dashboard Research/15 - Bank Balances.md](../Step 1 - Dashboard Research/15%20-%20Bank%20Balances.md)

## Purpose
Shows current balances across all bank accounts, and lets users drill into a single account to see a breakdown of activity (deposits, checks, withdrawals, and other transactions) since the last bank reconciliation.

## How Other Companies Fulfil This Purpose
- Bank-balance widgets should show real-time balances with clear cash-flow context; for nonprofits specifically, sources emphasise highlighting how much unrestricted cash is available and how long it will last — a "runway" framing ([Hiline](https://www.hiline.co/ledger/blog/nonprofits/nonprofit-financial-dashboard)).

**Net assessment:** the All Accounts comparison views below (table/bar/cards) are all standard, interchangeable presentations for this kind of data. The Single Account 7-row breakdown is a legacy-specific feature with no direct competitor confirmation either way — its value rests on user need, not competitive benchmarking, and it's kept because it's the widget's most-used old-design behaviour ("the most significant view-switching behaviour of any widget on the dashboard").

## Filters
| Filter | Values |
|--------|--------|
| Account | All Bank Accounts (default) · dynamic list of active bank accounts |

**Open item, not decided:** the old design calculates balances *using* unreconciled transactions internally, but never shows a visible "Last Reconciled" date or status badge. Should this become a real visible field? Raise with experts/dev.

## Data Table Sort
All Accounts mode: fixed alphabetical by Account Name. Single Account mode: fixed structural row order (Beginning Balance → Deposits → Voids → Checks → Withdrawals → EFT → Ending Balance) — not a sortable list.

## Drill-Through
No separate page link — Single Account mode already is this widget's drill-in mechanism.

## Refresh
Standalone icon, present at every size including KPI. Preserves the current Account selection.

---

## Views (Switch View)

Selecting a specific account in the Account filter switches the **entire widget** into Single Account mode — the same 7-row breakdown + 4-category bar chart regardless of which All Accounts view is active below. This mode-switch is orthogonal to the Switch View control.

### View 1 — Balance Table *(default, All Accounts mode)*
Account · Balance, totals row. Closest to old design.

### View 2 — Balance Bar Chart *(All Accounts mode)*
Vertical bar per account — visual comparison, spot large vs. small accounts instantly.

### View 3 — Account Cards *(All Accounts mode)*
Card per account — name, balance. Compact, easy to scan.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | All Accounts: active view, 2-3 accounts. Single Account: Ending Balance + one headline activity figure only (full 7-row table doesn't fit). No Switch View. |
| **Medium (2×2)** | All Accounts: active view, 3-4 accounts. Single Account: full 7-row table. Switch View available (All Accounts mode only). |
| **Large (4×4)** | All Accounts: active view, all accounts + totals row. Single Account: full 7-row table + 4-category bar chart. Switch View available (All Accounts mode only). |
| **KPI (1×0.5)** | Headline: **Total Balance across all bank accounts** — the All Accounts aggregate, regardless of any Account selection. No download, no switch. |
| **Expanded** | Full detail for whichever mode/view is active, all filters live in the modal |

---

## What Got Cut (and why)
- **Reconciliation status badges (green/amber/red) on the All Accounts views** — not cut, but not yet confirmed either; kept as an open item above since reconciliation is a genuinely real backend concept here (unlike W07), pending expert/dev input on whether to surface it visibly.
- **Invented "Show" filter (Balance+Reconciliation / Balance Only / Reconciliation Only)** — cut; didn't correspond to anything in the old design. The real toggle is the Account dropdown's mode switch.

## Fine-Tuning Notes
- If reconciliation status is later confirmed buildable: green = reconciled, amber = pending, red = overdue

---

## Interview Q&A (Ben Lane, 13.07.2026)

Source: [Ben Lane Interview - Tagged Q&A by Widget (2026-07-13).md](../Step%202%20-%20Feedback/Ben%20Lane%20Interview%20-%20Tagged%20Q%26A%20by%20Widget%20%282026-07-13%29.md). Full detail and transcript quotes in [UX Specialist Questions - Master Tracker.md](../Step%202%20-%20Feedback/UX%20Specialist%20Questions%20-%20Master%20Tracker.md), Q17, Q34.

**Q: How many bank accounts does a typical organization have — is 3 realistic, or could there be many more?**
A: Up to 50, sometimes more. 3 is unrealistically low. *(Also tagged to W07 — Deposit Accounts; the question wasn't fully separated from deposit-account count in the interview.)* — *Relevant to the "All Accounts" table/bar/card views above: design for dozens of accounts, not a handful.*

**Q: What's the intended difference between Deposit Accounts and Bank Balances?**
A: Bank Balances = the actual cash balance in an organization's bank account, used for reconciling transactions. Deposit Accounts = HQs managing investments from individuals/entities, like an investment company. Genuinely distinct — keep separate. — *Confirms the decision already reflected in these being two separate widgets/files (this one and W07).*

**General context (not tied to this widget specifically):** in the interview, "bank account management... live bank balances" was named as the single most commonly-used widget on the whole dashboard, and scored a clear 5/5 on importance — "a very common one because it does show them their bank balances." Reconciliation status, still an open item above, was not mentioned as something users check regularly for this widget either.
