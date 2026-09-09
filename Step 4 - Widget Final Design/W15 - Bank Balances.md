# W15 — Bank Balances

**Module:** Finance
**Status:** 🟢 Final design — locked · **FINAL REBUILT 2026-09-04 per direct instruction ("change the design to Jo's, dont copy it but take what is in it and try to copy it for Bank Balances W15"). Behaviour comes from `W15 - Bank Balances - BUILD REQUIREMENTS (handoff).md` and nothing else; the design language is re-implemented from Jo Lopez's bank block as the additive `bkf`/`BKF_` branch (`opt==='F'`) in `WRENDER[15]`, with Final the default render. The 2026-08-30 v2.0 build described previously here (a verbatim 1-to-1 port, prefix bankF) was discarded by owner instruction on 2026-09-03. Build-side gap: the build carries no `FC_VERSION[15]` entry, so the `fc-version-15` badge renders empty; the bkF block's dated comments ("Rebuilt 2026-09-04") are its only version record.**
**Full history / rejected ideas:** [Widget_Specs/W15-Bank-Balances.md](../Step%203%20-%20Mock_Work/Widget_Specs/W15-Bank-Balances.md)
**Data source & formulas:** [Step 1 - Dashboard Research/15 - Bank Balances.md](../Step 1 - Dashboard Research/15%20-%20Bank%20Balances.md)
**Confluence dossier:** none yet
**Last verified against build:** 2026-09-07 via widget-final-check-audit (unattended). Current build (rebuilt 2026-09-04): two All Accounts presentations only, Balance Table (default) and Balance Bar Chart; **Account Cards was removed by owner instruction on 2026-09-04**, and the download control was removed the same day, so this widget has no download at any size. Server-side paging, ordering and aggregation via the `bkfServerQuery` stand-in (Previous page / Next page, page size 12, 52 mock accounts); totals are computed over the full set so turning the page never moves the total. An overdrawn count chip and filter was added 2026-09-04 per direct instruction. Not carried over from the discarded port: sortable columns, Load more paging, the search box, the per-account drill overlay, the per-bar hover card, and all client-side sort/slice/totals. Verified per the Step 3 changelog (2026-09-04 entry): DOM-shim driver `w15-bkf-final.driver.js` 215 assertions 0 failures, proved by mutation testing; `final-check-rules.py --widget 15` 1 HIGH (the waived Sign-off row 3), 3 MED, 1 LOW, F2 pass. ⚠️ Fine visual spacing, the account-picker popover position, and the Explore-width ellipsis are not machine-verified. Previous: 2026-08-30 via build-final-widget driver + final-check-rules.py (**Final v2.0, since discarded 2026-09-03**: 185-assertion Node DOM-shim driver, 0 failures, plus computed-style checks in a real browser). **1-to-1 port of Jo's bank block**: both scopes (All Accounts and Single Account), her balance table with Load more paging, her diverging balance bars with a zero axis and overdrawn handling, the 7-row activity table, the 4-category activity bars with her hover card, the Table/Bars toggle at Explore with Detail showing both columns, the account listbox, the overdrawn filter chip, her drill overlay and skeleton, and her 26 accounts with values unchanged. **This resolves the review-list item recording Single Account mode as NOT BUILT** (Jo built it; the port brings it), and answers the reconciliation-badge item by omission, since she surfaces none. **Three knowing deviations, all forced rather than chosen:** an empty-data guard (her block has none, the Final rule requires one), a working search box (she renders the input but carries no handler, so verbatim it would be a dead control; it filters the table only), and a fallback for `--wn-500`, which is **undefined in her file as well as ours**, leaving her balance-bar zero axis invisible in her own build (a defect worth telling her about). **Gate:** Sign-off Readiness row 3 (the Modern API's single-account endpoint returns only a summary balance, no 7-row breakdown and no by-account bars) was explicitly WAIVED as Rule 11 forward design; the row stays open as a named backend ask. ⚠️ Fine visual spacing and the listbox popover position are not machine-verified.

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
| Paged All Accounts endpoint (2026-09-04 build) | `GET /api/dashboard/bank-balances/accounts?page={n}&pageSize={N}&sortBy={key}&sortDir={asc\|desc}` returning `{rows, totalCount, totals, pageIndex, pageCount}` | Modelled by `bkfServerQuery`: whitelisted sortBy, unique id tiebreaker, clamped page index, aggregates over the full set (the total never moves when the page turns). The overdrawn filter and count ride the same request. This endpoint exists nowhere in the Modern API yet and no Step 5 spec exists for W15. | [BUILD] / [TO CONFIRM — dev: endpoint to be scoped] |
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
| Empty (org has no active bank accounts) | The build renders a clean empty state whose sub line says the treatment is unspecified: the gap is named on screen rather than resolved, and the real treatment is still Design and owner's to settle. Related known rule: the "All Bank Accounts" option only appears if more than one active account exists [DOC — Step 1 research]; what a zero-account org sees is undefined. |
| Partial (some data missing) | An account that has never been reconciled uses its opening balance as the beginning balance [DOC — Step 1 research]. The old pie chart excluded negative-balance accounts [DOC — Step 1 research]; the equivalent rule for the new views is *not yet specified*. |
| Loading | *Not yet specified*. |
| Error / API failure | *Not yet specified*. |
| Stale data | Balances are a running tally of unreconciled items since the last reconciliation [DOC — Step 1 research]; no visible Last Reconciled date or badge exists today (open item, see Sign-off Readiness). Refresh preserves the current Account selection. |

## Interaction Spec

- **Account dropdown:** selecting a specific account switches the entire widget into Single Account mode (see Views). This is a mode switch, not a row filter: the two views are completely different, and it changes the entire layout and chart type [DOC — Step 1 research].
- **Hover:** in the old design, hovering over a pie or bar segment shows the value for that segment [DOC — Step 1 research]. In the 2026-09-04 build there is no per-bar hover card (Jo's was deliberately dropped): every chart value exists as text in the DOM beside its bar, repeated for screen readers, never hover only.
- **Click** on a bar, card, or table row: *Not yet specified*. (No drill-down or navigation away from the dashboard observed in the old design [DOC — Step 1 research].)
- **Keyboard / focus behaviour** for the Account filter, Switch View, and chart elements: *Not yet specified*.

## Filters
| Filter | Values |
|--------|--------|
| Account | All Bank Accounts (default) · dynamic list of active bank accounts |
| Overdrawn only *(added 2026-09-04 per direct instruction)* | A red chip on the filter line reads how many active accounts are overdrawn; pressing it filters the list to just those. The filter is a request parameter, not a browser operation: the count is taken over the whole active set (never the filtered set, never the page), while totals, page count and rows follow the filtered population. The chip appears only when at least one account is actually overdrawn, clears on switch to Single Account mode, and is absent at Glance. |

**Open item, not decided:** the old design calculates balances *using* unreconciled transactions internally, but never shows a visible "Last Reconciled" date or status badge. Should this become a real visible field? Raise with experts/dev.

## Data Table Sort
All Accounts mode: fixed alphabetical by Account Name. Single Account mode: fixed structural row order (Beginning Balance → Deposits → Voids → Checks → Withdrawals → EFT → Ending Balance) — not a sortable list.

**Paging rule (2026-09-04 rebuild, supersedes the old trimmed-view rule):** no trimming happens at any size; the account list is server-paged (Previous page / Next page, page size 12) in fixed alphabetical order by account name with a unique id tiebreaker, the sort key whitelisted server-side. Ordering is not user-changeable; sortable columns are open item 7, an owner decision, deliberately left unbuilt (the discarded port had them, contradicting this doc and the Step 3 spec). Open item 4 (a meaningful top-N, should any trimmed view ever return) stays recorded [TO CONFIRM — owner TBD].

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
Jo's diverging bar: one horizontal row per account against a visible zero axis, magnitude growing right when in credit and left when overdrawn. Scaled to the full account set (server totals carry maxEnding/minEnding), so a bar's length does not change when the page turns.

### View 3 — Account Cards: REMOVED by owner instruction on 2026-09-04
Cut from the build; there are two presentations, not three. Both remaining views read the same server response, so neither can show accounts the other does not. Recorded here so the earlier three-view plan is not treated as current.

### Size behaviour (rebuilt 2026-09-04: Rule 12's Glance / Explore / Detail model; there is no Small)
| Size | Behaviour |
|------|-----------|
| **Glance** | One figure: **Total Balance across all bank accounts**, always the All Accounts aggregate regardless of any Account selection made at a larger size. No controls, no view switch, no overdrawn chip. Refresh only, from the shared card chrome. |
| **Explore** | Live Account control; the active presentation, server-paged (Previous page / Next page, page size 12) with the combined total. Switch View available (All Accounts mode only). Single Account: full 7-row table. |
| **Detail** | Same structure with more room. Its one substantive addition: the 4-category activity chart in Single Account mode (Deposits, Voids, Checks, Withdrawals; EFT is not one of the four, and beginning/ending balances are not activity). Detail does not pair presentations. |
| **Expanded** | Full detail for whichever mode/view is active, all filters live in the modal |

*Scale note:* organizations can have up to 50 bank accounts, sometimes more [SME: Ben Lane, 13.07.2026; see Interview Q&A below]. The build answers this with server-side paging, ordering and aggregation (52 mock accounts, five pages at page size 12): no trimming happens, the full set is paged, and aggregates are computed over the whole set so turning the page never moves the total. The old overflow question is thereby answered in the build; open item 2 stays recorded until the owner confirms the paged pattern against Ben Lane's "top 3-5 plus view-all" suggestion.

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
| 6 | Negative-balance accounts: old pie chart excluded them; the build shows them on the correct side of the zero axis with one muted line naming the gap, but the rule itself is undefined | design | TBD | No |
| 7 | Sortable balance columns: left deliberately unbuilt (the discarded port had them, contradicting the fixed alphabetical order); the server sort-key whitelist is enforced anyway so granting it later is a request parameter | product decision | Owner | No |
| 8 | Loading treatment: unspecified in every source and not invented; paging is now a server round trip so this widget needs one more than most | design | Design + owner | No |
| 9 | Cash runway / days-of-cash indicator (echoes Jo's dossier gap 10.4, available vs total cash) | product decision | Owner + SME | No |
| 10 | An unreconciled-item count on the account rows | product decision | Owner + SME | No |

This doc has 10 open items; it is not sign-off-ready until this table is empty or every row is explicitly accepted as a known risk. (Rows 7-10 were added 2026-09-07: the 2026-09-04 build and its requirements handoff reference open items 1-10, while this table previously stopped at 6.)

## Fine-Tuning Notes
- If reconciliation status is later confirmed buildable: green = reconciled, amber = pending, red = overdue

## Sign-off Input (Jo) — added 2026-09-07, all statuses Unreviewed

Source: `Step 6 - Sign off document/Bank Balances/Bank Balances (Confluence pull 2026-07-27).html`. **No reconciliation file exists for this widget**, so no finding has an owner-assigned status; every row below is Unreviewed until the owner accepts, rejects or disputes it. Both positions are recorded where sources differ; neither is treated as the correction of the other.

| Jo's finding (dossier, 2026-07-27) | This doc / the build | Status |
|---|---|---|
| Currency/date localisation defect: pound sign shown for a US org on Bank Balances [LIVE, 23 Jul 2026] | "Rounding / currency / locale rules: *Not yet specified*"; the build formats en-US dollars | Unreviewed |
| Distinguish available/unrestricted cash from the raw bank total (gap 10.4, "Do now (framing) + data question"; needs fund data) | Open item 9 (cash runway) is the nearest recorded item; no available-vs-total framing exists in doc or build | Unreviewed |
| Multiple widget instances + saved default account (gap 10.5; SME wants several copies, one per account) | Not recorded anywhere in this doc; depends on the shell | Unreviewed |
| Label the unreconciled-only basis; optional all-items view | Overlaps open item 1 (Last Reconciled visibility); all-items view not recorded | Unreviewed |
| Values readable as text, not hover/colour-only; overdrawn obvious everywhere | The 2026-09-04 build satisfies both (values as text in the DOM; Overdrawn word + glyph + pill) | Unreviewed (likely satisfiable as built) |
| SME attribution: the dossier names the 13 Jul 2026 SME as "Marvin"; this project's Step 2 records name Ben Lane for the same date | Both names stay recorded; whoever holds the interview recording settles it | Unreviewed |

---

## Interview Q&A (Ben Lane, 13.07.2026)

Source: [Ben Lane Interview - Tagged Q&A by Widget (2026-07-13).md](../Step%202%20-%20Feedback/Ben%20Lane%20Interview%20-%20Tagged%20Q%26A%20by%20Widget%20%282026-07-13%29.md). Full detail and transcript quotes in [UX Specialist Questions - Master Tracker.md](../Step%202%20-%20Feedback/UX%20Specialist%20Questions%20-%20Master%20Tracker.md), Q17, Q34.

**Q: How many bank accounts does a typical organization have — is 3 realistic, or could there be many more?**
A: Up to 50, sometimes more. 3 is unrealistically low. *(Also tagged to W07 — Deposit Accounts; the question wasn't fully separated from deposit-account count in the interview.)* — *Relevant to the "All Accounts" table/bar/card views above: design for dozens of accounts, not a handful.*

**Q: What's the intended difference between Deposit Accounts and Bank Balances?**
A: Bank Balances = the actual cash balance in an organization's bank account, used for reconciling transactions. Deposit Accounts = HQs managing investments from individuals/entities, like an investment company. Genuinely distinct — keep separate. — *Confirms the decision already reflected in these being two separate widgets/files (this one and W07).*

**General context (not tied to this widget specifically):** in the interview, "bank account management... live bank balances" was named as the single most commonly-used widget on the whole dashboard, and scored a clear 5/5 on importance — "a very common one because it does show them their bank balances." Reconciliation status, still an open item above, was not mentioned as something users check regularly for this widget either.
