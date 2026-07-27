# W15 — Bank Balances

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W15-Bank-Balances.md](../Step%203%20-%20Mock_Work/Widget_Specs/W15-Bank-Balances.md)
**Data source & formulas:** [Step 1 - Dashboard Research/15 - Bank Balances.md](../Step 1 - Dashboard Research/15%20-%20Bank%20Balances.md)
**Confluence dossier:** none yet
**Last verified against build:** not yet audited

**Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a written source document (named) · `[TO CONFIRM]` assumed, with the owner who can confirm. Claims with no mark are template boilerplate only. Conflicting evidence coexists: if two sources disagree, both claims stay recorded, each with its own mark, until someone with backend access settles it.

## Purpose
Shows current balances across all bank accounts, and lets users drill into a single account to see a breakdown of activity (deposits, checks, withdrawals, and other transactions) since the last bank reconciliation.

## How Other Companies Fulfil This Purpose
- Bank-balance widgets should show real-time balances with clear cash-flow context; for nonprofits specifically, sources emphasise highlighting how much unrestricted cash is available and how long it will last — a "runway" framing ([Hiline](https://www.hiline.co/ledger/blog/nonprofits/nonprofit-financial-dashboard)).

**Net assessment:** the All Accounts comparison views below (table/bar/cards) are all standard, interchangeable presentations for this kind of data. The Single Account 7-row breakdown is a legacy-specific feature with no direct competitor confirmation either way — its value rests on user need, not competitive benchmarking, and it's kept because it's the widget's most-used old-design behaviour ("the most significant view-switching behaviour of any widget on the dashboard").

## Data Contract

All rows are drawn from the Step 1 research doc unless marked otherwise. Legacy source class: `BankBalances : DataPanelControl` (`/BankAccountManagement`), confirmed via `Widget_Comparison_Classic.html`, 2026-07-08.

| Field / value shown | Source table / endpoint | Formula / logic | Evidence |
|---|---|---|---|
| Account list (All Accounts mode) | `BR_BankAccount` | `WHERE Active = true`, company-scoped; "All Bank Accounts" option only shown if more than one active account exists. | [DOC — Step 1 research] |
| Ending Balance per account (All Accounts) | `BR_Item` + `BR_Reconcile` | `SUM(BR_Item.Amount) WHERE ReconcileID = null` added to the last reconciliation's ending balance (or the account's opening balance if never reconciled). | [DOC — Step 1 research] |
| Transactions counted | `BR_Item` | Individual bank transactions, typed d/v/c/w/e (Deposit/Void/Check/Withdrawal/EFT); only rows where `ReconcileID = null` (unreconciled) count. | [DOC — Step 1 research] |
| Single Account 7-row breakdown | `BR_Reconcile` + `BR_Item` | Beginning = last `BR_Reconcile.EndingBalance` (ordered by `ReconcileEndingDate` desc) or `OpeningBalance`; then unreconciled `BR_Item` rows grouped by type code and added: Deposits (d), Voids (v), Checks (c), Withdrawals (w), EFT (e); Ending = Beginning + all activity. | [DOC — Step 1 research]. ⚠️ See Modern API gap below: this cannot currently be served by the Modern API. |
| 4-category activity bar chart (Single Account) | display rule | Checks and Withdrawals are multiplied by −1 specifically for the bar chart display, so all four activity bars read as positive magnitudes. | [DOC — Step 1 research] |
| KPI headline: Total Balance across all bank accounts | derived | The All Accounts aggregate: sum of every active account's ending balance, regardless of any Account selection. | [DOC — Step 1 research, derived]. The always-aggregate rule is a design decision the Step 3 spec flags for confirmation (same kind of exception as W05/W10/W11); see Sign-off Readiness. |
| Negative-balance accounts | legacy display rule | The old design's pie chart excluded accounts with a negative balance from the chart. Handling in the new Bar Chart and Cards views is undefined. | [DOC — Step 1 research] / [TO CONFIRM — owner TBD] |
| Last Reconciled date / status badge | `BR_Reconcile` (the concept is real) | Whether to surface it visibly at all is the open item in Filters below. If the answer is no: All Accounts views show name + balance only, as specced. | [TO CONFIRM — owner TBD, raise with experts/dev] |

⚠️ **Significant Modern API gap** [DOC — Step 1 research]: the Modern API's single-account endpoint returns only a **summary balance** — it does **not** reproduce the 7-row Beginning/Deposits/Voids/Checks/Withdrawals/EFT/Ending breakdown, and there is **no bar-chart-by-activity-type endpoint at all**. This means Single Account view cannot currently be built the same way on the Modern API — flagged prominently, since it's arguably the more detailed of the widget's two views. See Sign-off Readiness.

- **Favourability/direction logic:** none defined for balances themselves. If reconciliation status badges are later confirmed buildable: green = reconciled, amber = pending, red = overdue (see Fine-Tuning Notes).
- **Rounding / currency / locale rules:** *Not yet specified*.
- **"Data as of" freshness:** balances are calculated based on unreconciled transactions only; items already through a bank reconciliation are not included again. The beginning balance for each account is either the ending balance from the last reconciliation, or an opening balance if the account has never been reconciled. This is core to the widget's design (a running tally since the last reconciliation), not an oversight [DOC — Step 1 research]. No visible "Last Reconciled" or "data as of" stamp exists today (open item).

## Widget States

| State | Behaviour |
|---|---|
| No module rights / entitlement | *Not yet specified*. |
| Empty (org has no active bank accounts) | *Not yet specified*. Related known rule: the "All Bank Accounts" option only appears if more than one active account exists [DOC — Step 1 research]; what a zero-account org sees is undefined. |
| Partial (some data missing) | An account that has never been reconciled uses its opening balance as the beginning balance [DOC — Step 1 research]. The old pie chart excluded negative-balance accounts [DOC — Step 1 research]; the equivalent rule for the new views is *not yet specified*. |
| Loading | *Not yet specified*. |
| Error / API failure | *Not yet specified*. |
| Stale data | Balances are a running tally of unreconciled items since the last reconciliation [DOC — Step 1 research]; no visible Last Reconciled date or badge exists today (open item, see Sign-off Readiness). Refresh preserves the current Account selection. |

## Interaction Spec

- **Account dropdown:** selecting a specific account switches the entire widget into Single Account mode (see Views). This is a mode switch, not a row filter: the two views are completely different, and it changes the entire layout and chart type [DOC — Step 1 research].
- **Hover:** in the old design, hovering over a pie or bar segment shows the value for that segment [DOC — Step 1 research]. Tooltip content for the new Table / Bar Chart / Cards views is *not yet specified*.
- **Click** on a bar, card, or table row: *Not yet specified*. (No drill-down or navigation away from the dashboard observed in the old design [DOC — Step 1 research].)
- **Keyboard / focus behaviour** for the Account filter, Switch View, and chart elements: *Not yet specified*.

## Filters
| Filter | Values |
|--------|--------|
| Account | All Bank Accounts (default) · dynamic list of active bank accounts |

**Open item, not decided:** the old design calculates balances *using* unreconciled transactions internally, but never shows a visible "Last Reconciled" date or status badge. Should this become a real visible field? Raise with experts/dev.

## Data Table Sort
All Accounts mode: fixed alphabetical by Account Name. Single Account mode: fixed structural row order (Beginning Balance → Deposits → Voids → Checks → Withdrawals → EFT → Ending Balance) — not a sortable list.

**Trimmed-view rule:** at Small, 2-3 accounts show; at Medium, 3-4. Which accounts make the cut is not stated: the fixed sort is alphabetical by Account Name, so a literal reading gives the first accounts alphabetically rather than the largest balances, and an alphabetical top-N is not a meaningful "top" [TO CONFIRM — owner TBD]. This interacts with the up-to-50-accounts interview finding; see Sign-off Readiness.

## Drill-Through
No separate page link — Single Account mode already is this widget's drill-in mechanism.

## Refresh
Standalone icon, present at every size including KPI. Preserves the current Account selection.

What refresh does: reloads the data, preserving the current dropdown selection [DOC — Step 1 research]. Whether it shows a spinner, updates a timestamp, or performs a full re-fetch is *not yet specified*.

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

*Scale note:* organizations can have up to 50 bank accounts, sometimes more [SME — Ben Lane, 13.07.2026; see Interview Q&A below]. Overflow behaviour at that volume (scroll, pagination, or a "view all" link) is *not yet specified* beyond "all accounts" at Large; see Sign-off Readiness.

## Accessibility

- Colour is never the only signal: if the green/amber/red reconciliation badges are confirmed, each must be paired with a text label, not colour alone. *Not yet reviewed against the build.*
- Chart values (bar heights, card balances, pie segments) exist as text in the DOM (sr-only or visible table), not hover-only. *Not yet reviewed against the build.*
- Table semantics are real (`th`/scope), and interactive controls (Account filter, Switch View) are reachable by keyboard. *Not yet reviewed against the build.*

---

## What Got Cut (and why)
- **Reconciliation status badges (green/amber/red) on the All Accounts views** — not cut, but not yet confirmed either; kept as an open item above since reconciliation is a genuinely real backend concept here (unlike W07), pending expert/dev input on whether to surface it visibly.
- **Invented "Show" filter (Balance+Reconciliation / Balance Only / Reconciliation Only)** — cut; didn't correspond to anything in the old design. The real toggle is the Account dropdown's mode switch. *(Decision recorded in the Step 3 spec [DOC — Widget_Specs/W15-Bank-Balances.md].)*

## Sign-off Readiness

| # | Open item | Type | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | Last Reconciled visibility: "the old design calculates balances *using* unreconciled transactions internally, but never shows a visible 'Last Reconciled' date or status badge. Should this become a real visible field? Raise with experts/dev." | product decision | experts/dev | No |
| 2 | Size-table mismatch with interview evidence: Ben Lane's recommended "top 3–5 plus view-all" pattern for orgs with up to 50 accounts "doesn't clearly match the locked size table (2–3 at Small, all at Large, no explicit 'view all' link)" [DOC — PROJECT INDEX; SME — Ben Lane, 13.07.2026, "Up to 50, sometimes more. 3 is unrealistically low... design for dozens of accounts, not a handful"]. Both the locked table and the interview finding stay recorded until resolved. | design | TBD | No, but resolve before build |
| 3 | Modern API gap: the single-account endpoint returns only a summary balance; no 7-row breakdown and no bar-chart-by-activity-type endpoint exists. "Single Account view cannot currently be built the same way on the Modern API." | backend | dev | **Yes**, for Single Account mode |
| 4 | Trimmed-view top-N rule: which 2-3 accounts show at Small (first alphabetically vs largest balances) is unstated | design | TBD | No |
| 5 | KPI always showing the All Accounts aggregate regardless of Account selection: the Step 3 spec says "flag for confirmation, same kind of exception as W05/W10/W11" | product decision | TBD | No |
| 6 | Negative-balance accounts: old pie chart excluded them; behaviour in the new Bar Chart and Cards views is undefined | design | TBD | No |

This doc has 6 open items; it is not sign-off-ready until this table is empty or every row is explicitly accepted as a known risk.

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
