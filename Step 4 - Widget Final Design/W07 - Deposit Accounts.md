# W07 — Deposits On Hand (formerly Deposit Accounts)

**Module:** Finance
**Status:** 🟢 Final design — locked (built 2026-07-30, Jo design, tagged v2.0 in the build). Locked-doc rule: the body below describes only the current final design. Superseded design thinking is not deleted, it is dated and moved to the "Design History (superseded)" section at the end of this doc. Naming: management renamed this widget from "Deposit Accounts" to "Deposits On Hand"; the rename is adopted in the built Final (titled "Deposits on Hand"), while the project-wide rename across other files (Step docs, the tracker, file names) is a separate pass, still pending. This file keeps its old name (W07 - Deposit Accounts.md) until that pass runs.
**Full history / rejected ideas:** [Widget_Specs/W07-Deposit-Accounts.md](../Step%203%20-%20Mock_Work/Widget_Specs/W07-Deposit-Accounts.md)
**Data source & formulas:** [Step 1 - Dashboard Research/07 - Deposit Accounts.md](../Step 1 - Dashboard Research/07%20-%20Deposit%20Accounts.md)
**Confluence dossier:** [Step 6 - Sign off document/Deposit On Hand (Deposit Accounts)/Deposits On Hand (Confluence pull 2026-07-27).html](../Step%206%20-%20Sign%20off%20document/Deposit%20On%20Hand%20%28Deposit%20Accounts%29/Deposits%20On%20Hand%20%28Confluence%20pull%202026-07-27%29.html) (management sign-off dossier; 13 Jul 2026 live audit, 14-gap list, top-10 insights, L1/L2/L3 design direction). No reconciliation file exists yet.
**Last verified against build:** 2026-07-30 via build-final-widget (Final, Jo design: the per-widget Node DOM-shim driver grew 111 -> 119 -> 145 assertions across the four owner changes, 0 failures + final-check-rules.py 0 HIGH + browser-faithful CSS parse, 0 dropped rules). Previous: not yet audited.

**Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a named written source · `[TO CONFIRM]` assumed, with a named owner to confirm. Conflicting evidence coexists; neither side wins by default.

---

# Final Design (current)

Everything in this part describes what actually shipped: Jo Lopez's "Deposits on Hand" widget carried into the Final Check tab as a one-to-one base (the additive `depF` block), plus four owner-directed changes on top of it. Anything the project considered earlier, tested, or dropped lives in Design History at the end.

## Purpose
Shows the current balances of the organisation's deposit accounts, grouped by account type, so staff can see at a glance how much is held across account categories as of today, and now (via the KPI delta, Compare To, and the Trend view) whether balances are moving, not just where they stand. A deposit account is money the organisation holds on behalf of others (depositors, such as congregations or individuals whose funds it manages and pays interest on), which makes this a small portfolio view over depositor money, a different thing from operational cash (that is W15 Bank Balances) [DOC — Step 1 research] [DOC — Step 6 dossier]. The data shapes (account balances by type, ending balance as of a date) match the legacy widget's documented behaviour [DOC — Step 1 research].

## How Other Companies Fulfil This Purpose
- Bank/deposit-account balance widgets are typically simple: name and balance, grouped by type, shown in real time ([Coupler.io](https://blog.coupler.io/financial-dashboards/), [Golimelight](https://www.golimelight.com/blog/financial-dashboards-for-nonprofits)). No source reviewed treats reconciliation status as a standard feature of this specific widget type; that concept belongs on a bank-reconciliation-specific screen (closer to W15 Bank Balances), not a simple balance-by-type widget. [RESEARCH]
- Period-over-period cash trend tracking (month/quarter/year-over-year) is a standard treasury/liquidity dashboard pattern. "Treasury / Liquidity" is a recognised finance-dashboard archetype, with a cash-flow trend chart showing net change over time so decision-makers can spot shifts ([UseDataBrain](https://www.usedatabrain.com/blog/financial-dashboard-examples), [HighRadius](https://www.highradius.com/resources/Blog/cash-flow-tracking-dashboard/)). Balance-sheet dashboards in banking also commonly plot balances over time per account/category rather than as a single snapshot ([BoldBI](https://www.boldbi.com/dashboard-examples/finance/balance-sheet-analysis/)). [RESEARCH]
- The management dossier's own benchmark (Xero, QuickBooks Online, Aplos, Sage Intacct, AccuFund, Realm/ACS, Grain Ledger) sets the bar at balance plus status plus one-click action into a live screen; it also notes these drill-downs work because a live screen already sits behind the card, which this module does not have today [DOC — Step 6 dossier].

**Net assessment:** reconciliation does not belong on this widget (that finding stands, and is confirmed by direct user testimony, see Interview Q&A). A trend/comparison view is genuinely supported by both the standard and the underlying data, so it is a real part of the Final (KPI delta, Compare To, and the Trend view), not a single-snapshot widget.

## Data Contract
What the widget consumes. Source tables and formulas come from the Step 1 research doc, confirmed correct against the legacy `DepositAccounts : DataPanelControl` class (`/DepositsOnHand`), verified via `Widget_Comparison_Classic.html`, 2026-07-08 [DOC — Step 1 research].

| Field / value shown | Source table / endpoint | Formula (if computed) | Evidence |
|---|---|---|---|
| Account list | `DH_Account` (name, inception date, account number, active status); scoped by Bank Account, not by Company | `DH_Account WHERE Active = true AND DH_Type.BankAccountID = ctx`, `ORDER BY Name, THEN InceptionDate` | [DOC — Step 1 research] |
| Ending balance (per account) | `DH_Transaction` | `SUM(DH_Transaction.Amount) WHERE AccountID = account AND TransactionDate <= asOfDate` (asOfDate defaults to today) | [DOC — Step 1 research] |
| Account type (grouping / breakdown) | `DH_Type` (type categories; also populates the scope filter) | Accounts joined to `DH_Type` for the type name, `GROUP BY TypeID`, `SUM(balance per account)` | [DOC — Step 1 research] |
| Account-type filter list | `DH_Type` / `DHTypeRepository` | Type list scoped to the bank account, with an all-accounts option | [DOC — Step 1 research] [DOC — Step 6 dossier] |
| KPI headline (total balance) + delta | Derived | Sum of balances across the full (unpaginated) filtered set; delta computed against the Compare To baseline | [BUILD] |
| Compare To baseline (per option) | Derived from balances as of a prior point / window | Previous week / month / period / quarter / fiscal year / calendar year (period = fiscal period, per-org fiscal calendar, Time Window Module ordering) | [BUILD] |
| Trend series | Derived | Balance over time; the mock interpolates points between each period's start/end balance rather than querying that many real points | [BUILD] / [TO CONFIRM — dev] |

- **Structure (three levels):** Group -> Account Type -> Account. Type is the portfolio dimension (interest settings live at type level, and this is what the breakdown groups on); account is the depositor dimension (one depositor's balance) [DOC — Step 6 dossier].
- **Scope note:** this widget is scoped by Bank Account (`X-BankAccountID`, via the `DH_Type.BankAccountID` chain), not by Company like most other Finance widgets [DOC — Step 1 research].
- **Favourability / direction:** the KPI delta pill is green when the balance improved against the Compare To baseline, red when it declined; colour is paired with the sign/value, never the only cue [BUILD].
- **Freshness:** balances are an as-of-date snapshot, default today [DOC — Step 1 research]. The dossier flags that today's "Last refreshed" link doubles as the refresh button and lags filter re-renders (gap #6); a separated "Data as of" stamp is not yet specified [DOC — Step 6 dossier].
- **Known Modern API gap:** the legacy balance calc uses a custom computed property (`DHAccount.CalcBalance()`) that may apply adjustments beyond a plain transaction sum, so the Modern API's straightforward `SUM(DH_Transaction) WHERE TransactionDate <= today` may not be a byte-for-byte match; balances should be verified to tie out before relying on this in the rebuild [DOC — Step 1 research]. Tracked in Sign-off Readiness.
- **Historical-balances gate:** the snapshot (as-of-date) spans are cheap because the existing calculation already produces an as-of-today balance. The Trend and Compare To spans assume the data layer can reconstruct period-end balances from the deposit transaction history; the module has no history surface today, so that is a data-model check to confirm with engineering [DOC — Step 6 dossier]. Tracked in Sign-off Readiness.

## Widget States
| State | Behaviour |
|---|---|
| No module rights / entitlement | *Not yet specified.* Dossier states 1 and 2 (org lacks the module; user has no rights) are marked "to confirm" there: how entitlement is detected and whether widget visibility respects module rights today are open [DOC — Step 6 dossier]. |
| Empty (org has no deposit accounts) | The Final renders an empty state rather than a broken chart; every total is computed from the account rows, never hardcoded. [BUILD] Dossier state 3 (spec agreed) asks for a purposeful empty state that names the module plus a rights-gated "+ Add Account" action; that fuller spec is not yet in the build. |
| Filter matches none (a scoped type has no accounts) | The Final shows an empty result for that scope. [BUILD] Dossier state 4 (spec agreed) asks for explicit zeros (# Accounts: 0, balance 0.00) with a "Show all" action; parity with that spec is not yet verified. |
| Loading | The Final ships a loading state. [BUILD] Dossier state 5 (proposed): a skeleton in the final layout, no layout shift, no spinners over stale numbers. |
| Error / API failure | The Final ships an error state. [BUILD] Dossier state 6 (proposed): clear message plus Retry, never stale figures without a "data as of" stamp (a wrong balance is worse than none for regulated figures). |

## Interaction Spec
- **Account-scope filter chip:** a single scope control (All Accounts / an account type / an individual account, searchable). It drives every view the same way; there is no per-size or per-view divergence. [BUILD]
- **Compare To:** selects the baseline the current balance is measured against for the delta, and the overlaid line in Trend. The scale is Previous week / month / period / quarter / fiscal year / calendar year; the **"period" option (fiscal period) sits between month and quarter** and computes a real intermediate delta (owner change 4). [BUILD]
- **Three views (Switch View):** Table (default), Distribution (donut), Trend (multi-line). [BUILD]
- **Scope-dependent breakdown (owner change 2):** at All Accounts the Distribution/Trend breakdown toggle offers only Total / By Account Type (the standalone all-accounts "By Account" option is removed). When the scope is a single account type, the toggle offers Total / By Account, showing that type's own accounts. [BUILD]
- **Click drills, does not expand (owner change 3):** clicking an account-TYPE series (a donut slice or a trend line) sets the top-left scope filter to that type and switches the breakdown to By Account. Clicking an individual ACCOUNT series is inert. There is no click-to-expand / focus / drill-modal on the charts (that older behaviour is removed). [BUILD]
- **Table row -> detail modal (preserved):** clicking a table row opens Jo's account/type detail modal. This is a row click, not a chart click, and is unaffected by owner change 3. [BUILD]
- **Table pagination (owner change 1):** 50 accounts per page with a pager; the mock dataset is 125 accounts to demonstrate it. Pagination is display-only: the KPI total and the subtotals compute over the full filtered set. Grand total $106,726,837 across 125 accounts. [BUILD]
- **Table search/sort:** the table is client-side sortable and has a live search box. [BUILD]

## Filters
| Filter | Values |
|--------|--------|
| Account scope | All Accounts (default) · account type · individual account (searchable) |
| Compare To | Previous week · month · period (fiscal period) · quarter · fiscal year · calendar year |

The scope chip narrows every view the same way (Table, Distribution, Trend, and the KPI headline all read from the same filtered account set). Compare To drives every delta shown by the widget (the KPI delta pill and the Trend overlay). The dossier's proposed MVP compare-to set was previous week / month / quarter / fiscal year / calendar year; the Final adds a fiscal-**period** option between month and quarter (owner change 4). [BUILD] [DOC — Step 6 dossier]

## Data Table Sort
The Final ships Jo's sortable table with a live search box (client-side, instant, never a fetch). The legacy fixed sort (Name, then Inception Date, not user-changeable) is superseded; see Design History. [BUILD]

## Drill-Through
- **In-widget:** clicking a table row opens the account/type detail modal (preserved). Clicking a chart account-TYPE series re-scopes the widget to that type and switches the breakdown to By Account; clicking an individual account series is inert. [BUILD]
- **Out to the module: open item, not decided.** The dossier's live audit found the Deposits On Hand module has no read layer to land on (no View menu, no live activity table, no interest history, no list of closed accounts); a real drill-through would require building that destination (the dossier's L3 inquiry surface), not wiring a link, with an interim option of deep links to Account Information and pre-filtered reports labelled honestly ("Opens in Reports") [DOC — Step 6 dossier]. Tracked in Sign-off Readiness.

## Refresh
Standalone icon, present at every size including Glance. What refresh does in the new design (spinner, timestamp, full re-fetch) and whether a separate "Data as of" stamp is added (dossier gap #6): *Not yet specified*. Legacy behaviour: clears cached data and reloads all accounts, the table, and the chart [DOC — Step 1 research].

## Views (Switch View) and sizing
The Final carries Jo's "Deposits on Hand" widget one-to-one: the three views (Table default, Distribution donut, Trend multi-line), the KPI headline (total balance + delta pill + Compare To + a scrubbable sparkline), the account-scope filter chip, the sortable/searchable table, the empty/loading/error states, and her account/type detail modal, plus the four owner changes above. [BUILD]

**Size behaviour:** three sizes only, per General Widget Design Rules Rule 12: **Glance / Explore / Detail**, no Small. Jo's widget uniquely ships FOUR tiers (kpi / wide / large / xwide); mapped to the project's three via the `fc-fmode` mechanism as **Glance = kpi, Explore = wide, Detail = xwide**. Her middle **`large` tier is dropped** (not rendered), an owner decision. Glance is the KPI headline + sparkline; Explore and Detail render the three views and the paginated table. [BUILD]

## Accessibility
- **Values exist as text:** the KPI headline, the delta pill, each Distribution/Trend series, and every table cell carry their values as DOM text (never hover-only). This directly answers the dossier's gap #5 (the legacy pie was hover-only and was the only place type totals existed). [BUILD]
- **Detail modal:** the account/type detail modal is a labelled dialog; keyboard-reachable and closable. [BUILD]
- **Colour is never the sole signal:** the delta pill's green (improved) / red (declined) is paired with the sign and the value. [BUILD]
- **Keyboard:** the scope chip, Compare To, Switch View, the pager, and table sort/search are keyboard-reachable. [BUILD]
- The dossier's WCAG findings on the legacy widget (gap #10 three separate tables with no header association; gap #11 unlabelled filter dropdown) are recorded as sign-off input; single-semantic-table and labelled-control parity is not separately verified against the build here [DOC — Step 6 dossier].

## What Got Cut (and why)
- **Small size**, cut per General Widget Design Rules Rule 12. The Final ships three sizes (Glance / Explore / Detail).
- **Jo's `large` tier**, dropped in the four-tier-to-three-size mapping (owner decision); Jo's kpi / wide / xwide map to Glance / Explore / Detail, and the middle `large` layout is not rendered.
- **The click-to-expand / focus / drill-modal on the charts**, replaced by the click-to-drill behaviour (a type-series click re-scopes and switches to By Account; an account-series click is inert). [BUILD]
- **The standalone all-accounts "By Account" breakdown**, removed: at All Accounts the breakdown is Total / By Account Type only; By Account appears only once a single type is in scope (owner change 2). [BUILD]
- **The earlier reconciliation-based concepts** (Balance Cards with reconciliation badges, Vertical Bar with reconciliation indicators, Summary Table with Last Reconciled/Status) were cut long before the Final; the real data has no reconciliation concept, and both competitor research and direct user testimony confirm reconciliation does not belong on this widget. Full detail in Design History.

## Sign-off Readiness
| # | Open item | Type | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | **Drill-through target:** no read layer exists in the Deposits On Hand module to drill out to; a real out-of-widget drill needs the destination built (dossier L3 inquiry surface) or interim deep links to Account Information / pre-filtered reports [DOC — Step 6 dossier]. | Product / dev | TBD | No (in-widget modal + re-scope ship regardless) |
| 2 | **Historical period-end balances for Trend / Compare To:** data-layer gate. Snapshot as-of-date spans are cheap; the trend/compare spans depend on reconstructing period-end balances from transaction history, which the module has no surface for today [DOC — Step 6 dossier]. | Field / data model | Backend/dev | No (mock interpolates) |
| 3 | **Modern API balance gap:** `DHAccount.CalcBalance()` may apply adjustments beyond a plain `SUM(DH_Transaction)`; balances must be verified to tie out [DOC — Step 1 research]. | Field / math | Backend/dev | No |
| 4 | **Declining-account flag:** the pre-Final concept had a ▼▼▼ "3+ consecutive month decline" badge on the Table; the built Final's carrying of it is unreviewed, and the 3-month threshold still needs sign-off. | Product decision | SME/dev | No |
| 5 | **Project-wide rename pending:** the widget is renamed "Deposits On Hand" and adopted in the Final, but the rename across other Step docs, file names, and the tracker is a separate pass not yet run [DOC — Step 6 dossier]. | Housekeeping | Project | No |
| 6 | **Interest / status signal (dossier gap #3):** interest-due / unposted-interest status is not surfaced (data lives only in the reports app); whether to add a status badge is open [DOC — Step 6 dossier]. | Product / data | TBD | No |
| 7 | **"Data as of" stamp vs Refresh (dossier gap #6):** separating a live "data as of" stamp from the Refresh action is not yet specified [DOC — Step 6 dossier]. | Field | TBD | No |
| 8 | **Org-locale formatting (dossier gap #12):** currency/date must format from the organisation's locale (the audit saw £ and dd/mm/yyyy on a US product); root cause to confirm with engineering [DOC — Step 6 dossier]. | Field / bug | Backend/dev | No |
| 9 | **Same-named accounts (dossier gap #14):** two accounts can share a name and differ only by account number; any list/drill must keep them unambiguous. The table keeps account-level detail; the account-number disambiguator must be preserved [DOC — Step 6 dossier]. | Constraint | Design/dev | No |

This doc is not sign-off-ready until this table is empty or every open row is explicitly accepted as a known risk.

## Sign-off Input (dossier)
The management sign-off dossier (Confluence pull 2026-07-27; 13 Jul 2026 live audit on asmdev) carries a 14-gap audit, top-10 insights, and an L1/L2/L3 design direction. Its relevant findings, each with a status (Accepted / Rejected / Disputed / Unreviewed) and whether the built Final already addresses it. There is no reconciliation file yet; nothing here has been reconciled into Steps 1 to 5.

| # | Dossier finding | Status | Notes |
|---|---|---|---|
| Gap 1 | Filter changes the table but not the pie; the panels visibly disagree. | **Addressed** | The Final uses one scope state driving all views; there is no always-all-types pie. |
| Gap 2 | No drill-down, and no destination exists in the module. | **Unreviewed (partly addressed)** | The Final adds an in-widget row modal and click-to-re-scope; a drill-OUT to a live module screen still has no destination. See Sign-off Readiness #1. |
| Gap 3 | No status signal (interest due, unposted interest); data lives only in reports. | **Unreviewed** | Not in the build; needs the data layer. Sign-off Readiness #6. |
| Gap 4 | Balances have no comparison (delta, trend). | **Addressed** | The KPI delta pill + Compare To + the Trend view now provide delta and trend. This is the gap the build most directly resolves. |
| Gap 5 | Pie values are hover-only; the pie is the only place type totals exist. | **Addressed** | Distribution and the table surface values as DOM text; accessibility is values-as-text. |
| Gap 6 | "Last refreshed" timestamp is the refresh button and lags re-renders. | **Unreviewed** | Refresh is a standalone icon in the build; a separated "Data as of" stamp is not specified. Sign-off Readiness #7. |
| Gap 7 | No search in the grid. | **Addressed** | The table has a live search box. |
| Gap 8 | No Type column; the Show All list mixes accounts across types; columns need re-ranking. | **Unreviewed** | The scope chip + By Account Type breakdown answer the portfolio-mix reading; whether the flat table gains a Type column / column re-rank is not settled. |
| Gap 9 | Widget says "Deposit Accounts", module says "Deposits On Hand", sibling says "Bank Balances". | **Accepted (adopted)** | The Final is titled "Deposits on Hand". The project-wide rename is still pending (Sign-off Readiness #5). |
| Gap 10 | Grid is three separate HTML tables with no header association (WCAG 1.3.1). | **Unreviewed** | The build surfaces values as text; single-semantic-table parity is not separately verified here. |
| Gap 11 | Filter dropdown has no accessible/visible label (WCAG 4.1.2 / 3.3.2). | **Unreviewed** | Labelled-control parity not separately verified against the build. |
| Gap 12 | Currency/dates follow client/server culture (saw £ and dd/mm on a US product). | **Unreviewed** | Org-locale formatting; engineering root-cause open. Sign-off Readiness #8. |
| Gap 13 | Weak empty states (blank totals, no recovery, a 0.00 balance still draws a full pie). | **Unreviewed (partly addressed)** | The Final ships empty/error states; parity with the dossier's fuller spec (explicit zeros, "Show all" / "+ Add Account" actions) is not verified. |
| Gap 14 | Same-named accounts distinguished only by account number; do not drop the number. | **Unreviewed** | Constraint to honour; the table keeps account-level detail. Sign-off Readiness #9. |
| Design direction | Dashboard grain should be the account TYPE (type summary at L2, account grid at L3). | **Disputed / Unreviewed** | The Final keeps Jo's account-level table plus a By Account Type breakdown, rather than reducing the widget to a type-only grain; the dossier's grain recommendation is not adopted as stated. |
| Compare-to set (7.1) | Proposed MVP: previous week / month / quarter / fiscal year / calendar year. | **Accepted and extended** | The Final adds a fiscal-**period** option between month and quarter (owner change 4). |

## Interview Q&A (Ben Lane, 13.07.2026)
Still-current SME evidence that grounds the Final (not superseded). Source: [Ben Lane Interview - Tagged Q&A by Widget (2026-07-13).md](../Step%202%20-%20Feedback/Ben%20Lane%20Interview%20-%20Tagged%20Q%26A%20by%20Widget%20%282026-07-13%29.md); full detail in [UX Specialist Questions - Master Tracker.md](../Step%202%20-%20Feedback/UX%20Specialist%20Questions%20-%20Master%20Tracker.md), Q17, Q18, Q34.

**Q: How many bank accounts does a typical organization have, is 3 realistic or could there be many more?**
A: Up to 50, sometimes more; 3 is unrealistically low. *(Also tagged to W15 Bank Balances.)* Supports designing for dozens (and, per the dossier, hundreds to thousands of depositor accounts), not a handful; the Final's 125-account pagination demo reflects this. [SME]

**Q: Is reconciliation status something users check regularly on this widget, or is the balance the primary thing?**
A: Balance is the primary thing; reconciliation status is secondary. Directly confirms the "reconciliation does not belong on this widget" finding on top of the competitor research. [SME]

**Q: What is the intended difference between Deposit Accounts and Bank Balances?**
A: Deposit Accounts = HQs managing investments from individuals/entities, like an investment company. Bank Balances = the actual cash balance used for reconciling transactions. Genuinely distinct, keep separate. Confirms these being two separate widgets/files. [SME]

**General context (not tied to this widget specifically):** Deposit Accounts is one of the lowest-usage widgets on the dashboard, "rarely used, mainly by HQs managing investments, serving less than 1% of users", a niche use case, not a usability failure. [SME]

## Fine-Tuning Notes
- KPI delta / Compare To badge colour: green = improved vs the comparison point, red = declined.
- **2026-07-30: Built as the Final, Jo design.** Jo Lopez's "Deposits on Hand" widget ported one-to-one (the `depF` block): three views (Table default, Distribution donut, Trend multi-line), the KPI headline (total balance + delta pill + Compare To + scrubbable sparkline), the account-scope chip (All Accounts / type / individual, searchable), the sortable/searchable table, empty/loading/error states, and the account/type detail modal. **Plus four owner-directed changes:** (1) **table pagination** 50/page with a pager, mock dataset expanded to 125 accounts, KPI total and subtotals over the full set (pagination display-only), grand total $106,726,837; (2) **scope-dependent breakdown**: All Accounts offers Total / By Account Type only (the standalone all-accounts By Account option removed), a single type in scope offers Total / By Account; (3) **click drills, does not expand**: a type-series click (donut slice or trend line) re-scopes to that type and switches to By Account, an account-series click is inert, the old click-to-expand/drill-modal on charts removed, the table-row modal preserved; (4) **Compare To gained a "period" (fiscal period) option** between month and quarter, so the scale is Previous week / month / period / quarter / fiscal year / calendar year (per-org fiscal calendar, Time Window Module ordering), computing a real intermediate delta. Sizes Glance / Explore / Detail, no Small, per Rule 12: Jo's four tiers (kpi/wide/large/xwide) mapped to three (Glance=kpi, Explore=wide, Detail=xwide), her `large` tier dropped. Titled "Deposits on Hand" per the management rename. Tagged v2.0 with "Final" and "Jo design" title badges (`FC_VERSION[7]`). Verification: the per-widget Node DOM-shim driver grew 111 -> 119 -> 145 assertions (0 failures) across the four changes, browser-faithful CSS parse 0 dropped rules, final-check-rules.py 0 HIGH, W01-W06 Final regressions intact, Dashboard tab byte-identical. Full detail in the 2026-07-30 Widget_Specs completion entry.

---

# Design History (superseded, kept for the record)

> Everything below is superseded by the Final Design above. It is kept, dated, and moved here (never deleted) so the reasoning is traceable without cluttering the live spec. Read top-down as a timeline: what existed, what the project designed and tested before the built Final, and what got dropped.

## Original / legacy behaviour (what existed before any redesign)
Sourced from the Step 1 research doc, confirmed against the legacy `DepositAccounts : DataPanelControl` class.
- **Layout:** a table on the left (one row per active deposit account: Name, Inception Date, Account Number, Ending Balance, with a totals row showing the account count and combined balance) beside a pie chart on the right titled "By Account Type" (one segment per account type, combined balance per type).
- **Hover:** hovering a pie segment showed the balance for that account type; pie values existed only on hover.
- **Filter:** an Account Type dropdown (default "Show All") narrowed the **table only**; the pie always showed **all** account types regardless of the filter. This quirk was flagged as possibly confusing but kept, because filtering the pie to a single type would collapse it to one slice.
- **Sort:** fixed by Name, then Inception Date; not user-changeable.
- **Drill:** none; clicking a row or a pie segment did not open further detail.
- **Refresh:** a standalone icon that cleared cached data and reloaded all accounts, the table, and the chart.
- **Data / scope:** `DH_Account` / `DH_Type` / `DH_Transaction`; only active accounts; ending balance as of today; scoped by Bank Account (`X-BankAccountID`).

## Project's earlier reconciliation-based concepts (pre-rebuild), superseded
The first Step 3 spec built three options entirely around a "reconciliation status" that the real data (`DHAccount` / `DHTypeRepository`) never had (no reconciliation concept whatsoever, just name, inception date, account number, balance, grouped by type). A major mismatch was recorded, likely written with a different widget (W15 Bank Balances) in mind; the baseline (table + pie, matching the old design) was decided to ship if nothing else was approved, and A/B/C were held as speculative concepts pending design-expert and dev sign-off.
- **Option A, Balance Cards:** a card per account with a reconciliation-status badge; views Cards / Table / Vertical bars.
- **Option B, Vertical Bar Chart:** a bar per account with reconciliation-status indicators at Large; views Bar / Table.
- **Option C, Summary Table:** Account / Balance / Last Reconciled / Status; views Table / Cards.
- **Cut entirely** (and still closed): the real data has no reconciliation concept, competitor research found no support for adding one to this widget type, and the Ben Lane interview confirmed balance is primary and reconciliation secondary. The proposed badge colours (green = reconciled, amber = pending, red = overdue) and the dropped invented "Display" filter go with them.

## Pre-Final Table/Distribution/Trend concept (2026-07-09 rebuild and iterations to 2026-07-13), superseded by the built Final
On 2026-07-09 the doc was rebuilt to a colleague's Table/Distribution/Trend design with period comparison added, per direct instruction, replacing the old 4-account reconciliation render. This was the pre-Final concept; the built Final (2026-07-30) ships Jo Lopez's actual "Deposits on Hand" widget one-to-one plus the four owner changes, superseding the concept below. Kept for the record:

**Three views as the concept specified them:**
- **View 1, Table (default):** Name / Inception Date / Account Number / Ending Balance, totals row at Large/Expanded, with a **% Change** column shown whenever Compare To was not "None". A **declining-account flag** lived here: a ▼▼▼ "3+ consecutive month decline" badge next to the account's name.
- **View 2, Distribution:** a donut with the combined total in its centre. Reworked 2026-07-10 so grouping followed the Account Type filter itself (All Accounts grouped By Type, a fund-level view; picking one type drilled into that type's own accounts), rather than a separate By type / Top accounts toggle (that toggle was cut 2026-07-09) and rather than the old pie's "always all types" rule.
- **View 3, Trend:** simplified 2026-07-12 to plot whatever the Account Type filter resolved to, with no in-card type toggle. All Accounts = one aggregate daily line for the month; a specific type = that type's own daily line, in a colour fixed per type (Checking / Savings / Certificate of Deposit / Restricted Funds / Grant Funds each always the same colour, "group account types to one set of colour"). One month at daily granularity (~30 points, per the 2026-07-11 fix), X-axis = days of the month, Y-axis = dollar balance. Compare To overlaid the same scope from a comparable prior month (1 or 12 months back), as a dashed line plotted **day-aligned** (Day 1 vs Day 1, Day 15 vs Day 15), not a single point-in-time delta.

**Data feasibility note (mockup):** the real data has no daily-balance concept any more than a 12-month history; Ending Balance is `SUM(DH_Transaction.Amount WHERE AccountID = account AND TransactionDate <= asOfDate)`, so daily figures are technically obtainable at a different query cadence, but the mock derived its ~30 daily points by **interpolating between each month's own start/end balance** (the same simplification used for W01's Weekly view) rather than querying 30 real daily figures. Whether daily-grain queries are cheap enough to run live was flagged for dev.

**Concept filter model (superseded by the Final's scope chip + six-option Compare To):**
- Account Type narrowed both Table and Distribution (2026-07-09), then every size the same way (2026-07-13: "it's supposed to be all the same component, just different filter applied, take from Large if there's a difference"), fixing a KPI/Small mismatch where those pinned to an unfiltered all-accounts total.
- Compare To was simplified 2026-07-13 to only **Last Month** (default) and **Last Year**, with "Last Quarter" and "None" removed, so a comparison always showed. It lived in the 3-dot "Change filters" menu at every size including KPI, deliberately not an inline dropdown. (The Final replaced this two-option set with the six-option Previous week / month / period / quarter / fiscal year / calendar year scale.)
- Large/Expanded showed Account Type and Compare To as inline dropdowns at the top of the card (reusing W01's `inlineFilters()` row), dropping the filter-tag chip row at that size to avoid showing the two filters twice (added 2026-07-09, repositioned 2026-07-11).
- Account Type mock data was diversified 2026-07-13 ("only ever two type accounts are showing", read as a bug): added Petty Cash Checking (Checking) and Grant Reserve 2024 (Grant Funds), giving 12 accounts across 5 real types (3/2/2/2/3 per type). Total balance across all accounts was **$7,451,630** (Checking $1,496,103, Savings $1,507,585, Certificate of Deposit $1,350,138, Restricted Funds $879,738, Grant Funds $2,218,066). (The Final's mock is a different, larger 125-account set totalling $106,726,837.)
- Mock data was made more dramatic 2026-07-13 ("last month was low, this month money coming in is more significant"): this month's ending balance raised on 8 of the 10 accounts, keeping the two already-declining ones (Building Fund Restricted, State Grant Q3) flat, so the All Accounts daily Trend showed a muted last month then a sharp climb.

**Old four-tier size behaviour (before the Final's three-size mapping):**

| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Table only: up to 3 accounts (filtered by Account Type), Name + Balance + % Change; filter-tag chips shown (2026-07-13 fix); Distribution/Trend not offered; no Switch View. |
| **Medium (2×2)** | Table: 5 accounts + % Change. Distribution: smaller donut. Trend: same one-month/daily window, smaller chart. Switch View available. |
| **Large (4×4)** | Table: all accounts + totals row. Distribution: full-size donut + legend. Trend: one-month/daily, day-aligned compare line. Account Type + Compare To as inline dropdowns at the top (in place of the chip row). Switch View available. |
| **KPI (1×0.5)** | Headline: total balance for the current Account Type filter (changed 2026-07-13 from "always all accounts"), a line-sparkline tile with a ▲/▼ delta vs Compare To; title reflected the active filter on the Final Check page only. 3-dot menu: Compare To only, no download; Switch chart type present. |
| **Expanded** | All three views via Switch View, all filters live in the modal. |

**Old bug fixes and known limitations from the concept (kept for the record):**
- Fixed (2026-07-09): the 3-dot "Widget size" trim never showed/hid the Switch chart type section for any widget except W01 (the trim only looked for a wrapper class only W01 had); fixed generically by finding the section by its label text.
- Fixed (2026-07-09): the KPI and Small slots had no Switch chart type section at all, so resizing them larger could never reveal Distribution/Trend; the same section was added, hidden by default and revealed on resize.
- Fixed (2026-07-10, real bug): the Trend chart rendered completely blank because it used W01's `fillMode`/`flex:1` sizing, which only works because W01's card body has a `display:flex` rule no other widget has, so the mount point collapsed to zero height; switched to a fixed pixel height.
- Known limitation, flagged not fixed (2026-07-09 and 2026-07-13): the real Dashboard tab's own Switch View menu for this widget still showed the old two-item "Account Cards / Table" list, and the KPI/Small titles stayed static "Total Balance" text there, because that markup lives inside the gallery's single giant HTML line that could not be safely read or edited that session (a direct read errors out at over 50,000 tokens); Final Check reflected the full rebuild, the live gallery needed a manual follow-up pass, same bucket as W02's earlier Small-size dropdown gap.

## Baseline decision context (Step 3, before the rebuild)
Before any of the above, the Step 3 spec (status "Minor tweaks") had corrected the earlier draft's "reconciliation status" framing as not matching this widget's real data, established the industry-typical shape (table + pie, no reconciliation), and left drill-through as an open question for design experts / dev (no drill-down exists in the old design; whether to add a link out to the Deposits On Hand module was deferred). The KPI size showed no time-based filter (no time dimension existed), with a headline of total balance across all active deposit accounts.

## Superseded by
The built Final, Jo design, 2026-07-30 (see Final Design above). Tagged v2.0 with "Final" and "Jo design" badges in the Final Check tab, titled "Deposits on Hand" per the management rename.
