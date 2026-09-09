# W15 Bank Balances: build requirements

> **Amended 2026-09-04, after the rebuild was reviewed.** Two requirements below were retired by owner instruction once the built widget was seen, and the build is now the correct reference for them:
> 1. **Section 6 listed three All Accounts presentations. Account Cards is removed.** Two remain, Balance Table (the default) and Balance Bar Chart. Note that this retires the presentation the market research most directly supported: cards or tiles are the dominant pattern across QuickBooks Online, Xero and Mercury, and that finding is what removed the legacy pie. The pie is still not coming back, so the widget now offers a table and a bar chart, neither of which market research singled out. Recorded as a consequence, not an objection.
> 2. **Section 9 required a download at Explore and Detail. The download is removed entirely.** There is now no download at any size. The requirement's substance goes with it: no full-precision export, and no route to the figures beyond what is on screen. Anyone later re-reading W11's settled convention, which does call for a download icon, should know this widget was deliberately excepted from it rather than accidentally missing it.
>
> 3. **An overdrawn count and filter is ADDED**, reversing the section 11 entry that recorded it as deliberately not rebuilt. Owner instruction: *"add the overdrawn with the red marking. that filter to just overdrawn accounts"*. It is Jo's idea, returning by request. Section 4's control list therefore gains a fourth entry, and section 5 governs it: **the filter is a request parameter, not a browser operation.** Three rules follow from that and are not optional. The count is over the **whole active set**, never the filtered set and never the page, because it must not move when the filter turns on or the page turns. The **totals, the page count and the row set all follow the filtered population**, so the totals row and the header must stop saying "all accounts" while the filter is on. And **Glance still carries no chip and no count**, because section 8 gives Glance no controls.
>    Two build choices inside it, neither settled by any source: the chip renders **only when at least one account is actually overdrawn**, since a red "0 overdrawn" would be a permanent alarm about nothing and a dead control besides; and the filter is **cleared when the widget switches to Single Account mode**, where it has no meaning. Both are open to correction.
>    Note also that red is now used in exactly one place in this widget. Styling Reference 8.2 still keeps red off the bars, so an overdrawn bar is carried by its side of the zero axis, a glyph and the word Overdrawn. A status chip is not a bar.
>
> Everything else in this document still stands, including section 5's server-side paging and section 7's fixed alphabetical order.

Handoff for a from-scratch build of this widget's Final. Written 2026-09-03.

**This document contains no styling.** No colours, no sizes, no spacing, no class names, no layout. It states only what the widget must show, what the user can do, and what happens. How it looks is not decided here.

Sources: `Step 4 - Widget Final Design/W15 - Bank Balances.md`, `Step 1 - Dashboard Research/15 - Bank Balances.md`, `Step 3 - Mock_Work/Widget_Specs/W15-Bank-Balances.md`, `Step 2 - Feedback/Market Research/W15 - Bank Balances.md`, the Ben Lane interview of 13.07.2026, `Data and Build Readiness - Developer Punch List.md`, and the legacy `BankBalances : DataPanelControl` (`/BankAccountManagement`) surface recorded in `Step 5 - API documents/Widget_Comparison_Classic.html`.

**Why this rebuild exists.** The Final being replaced was a deliberate 1-to-1 port of Jo Lopez's bank block, built 2026-08-30 on the instruction "copy over 1 to 1 while fitting her style, Jo's version as it just better." That port is being discarded by owner instruction on 2026-09-03. Nothing in it is a requirement here. Where this document and that build disagree, this document wins, and section 11 records what the port did so no behaviour is lost by accident rather than by choice.

---

## 1. What the widget is for

Show the current cash balance of every active bank account, and let the user drill into one account to see what has moved through it since the last bank reconciliation.

In the Ben Lane interview this was named the single most commonly used widget on the whole dashboard, scored 5 out of 5 for importance. It is worth building carefully.

It is **view only**. No writes, no approvals, no navigation away from the dashboard. The legacy widget had none and none is being added.

---

## 2. The data

All values are currency amounts. Scope is company-scoped to the current context.

| Value | Source | How it is derived |
|---|---|---|
| Account list | `BR_BankAccount` | `WHERE Active = true` |
| Ending balance per account | `BR_Item` + `BR_Reconcile` | `SUM(BR_Item.Amount) WHERE ReconcileID = null`, added to the beginning balance |
| Beginning balance per account | `BR_Reconcile` | The most recent reconciliation's `EndingBalance`, ordered by `ReconcileEndingDate` descending. If the account has never been reconciled, its `OpeningBalance` instead |
| Transaction activity | `BR_Item` | Individual transactions typed `d`/`v`/`c`/`w`/`e` for Deposit, Void, Check, Withdrawal, EFT. Only rows where `ReconcileID = null` count |
| Total balance across all accounts | derived | The sum of every active account's ending balance |

**Four data rules that are easy to get wrong:**

1. **Only unreconciled items count.** Anything that has already been through a reconciliation is not counted again. This is core to the widget's design, a running tally since the last reconciliation, and Step 1 explicitly records it as intended behaviour rather than an oversight.
2. **The beginning balance has two possible origins.** Last reconciliation's ending balance, or the account's opening balance if it has never been reconciled. A build must not assume every account has a reconciliation history.
3. **Ending equals beginning plus all activity.** The five activity types are added to the beginning balance, not substituted for it.
4. **Checks and Withdrawals are stored negative.** They are multiplied by -1 **for chart display only**, so activity bars read as positive magnitudes. The stored sign is what arithmetic uses. A build that flips the sign in the data rather than at the point of display will compute the wrong ending balance.

---

## 3. The two modes

This widget's defining behaviour, and the thing most likely to be got wrong. Step 1 calls it "the most significant view-switching behaviour of any widget on the dashboard."

**Mode is set by the Account selection, and it is a mode switch, not a row filter.** The two modes show different data, in a different shape. Selecting one account does not narrow a list; it replaces what the widget is showing.

### All Accounts mode, the default

Every active bank account with its ending balance, plus a combined total.

### Single Account mode

One account's activity breakdown since its last reconciliation, in a **fixed seven-row order** that must not be reordered or sorted:

1. Beginning Balance
2. Deposits
3. Voids
4. Checks
5. Withdrawals
6. EFT
7. Ending Balance

This is a structural breakdown, not a record list. There is **no totals row**, because Ending Balance already is the total.

Alongside it, **four activity categories** are shown as a comparison: Deposits, Voids, Checks, Withdrawals. EFT is not among the four, and Beginning and Ending are not activity. Per rule 4 in section 2, all four read as positive magnitudes.

**The "All Bank Accounts" option only appears when more than one active account exists.** With a single account, there is nothing to aggregate.

---

## 4. The controls

| Control | Values |
|---|---|
| Account | All Bank Accounts (default, when more than one exists), then the list of active accounts |
| Switch View | The All Accounts presentations in section 6. **All Accounts mode only** |
| Refresh | Present at every size. Reloads the data and **preserves the current Account selection** |

The Switch View control applies only to All Accounts mode. Single Account mode has one presentation, so offering a view switch there would be a dead control.

There is **no time filter of any kind**: no fiscal year, no date range, no period. The period is implicitly "since the last reconciliation," and it is not user-selectable.

---

## 5. Volume, and what it forces

**Organisations have up to 50 bank accounts, sometimes more.** Ben Lane, 13.07.2026: "Up to 50, sometimes more. 3 is unrealistically low. Design for dozens of accounts, not a handful."

This is a requirement, not background. It means:

- The account list is a **paginated dataset**, and the build must be exercised against enough accounts to force paging rather than a volume that fits on one page.
- **The framework rule for paginated datasets applies: paging, ordering and aggregation happen server-side, not in the browser.** The client sends the page it wants and renders the response. It does not receive the whole account list and cut it up locally.
- **The combined total is computed over the full account set, not over the visible page.** A total that changes when the user turns the page is wrong. This is the single most likely defect in this widget.
- The ordering must be **deterministic and end in a unique tiebreaker**, so that paging can neither repeat an account nor skip one.
- The Account selector itself must stay usable at that volume.

---

## 6. The All Accounts presentations

Three peer presentations of the same accounts and balances, switchable in All Accounts mode. All three show the same population; none may show accounts the others do not.

### Balance Table, the default

Account name and balance, with the combined total. Closest to the legacy design.

### Balance Bar Chart

One bar per account, for comparing accounts at a glance.

### Account Cards

One card per account, name and balance. The market research found this to be the dominant pattern across QuickBooks Online, Xero and Mercury, and found **no competitor anywhere using a pie or donut for cross-account comparison**, so the legacy pie is not carried forward as a presentation.

---

## 7. Ordering

**All Accounts mode: fixed alphabetical by account name, and not user-changeable.** This is what both the Step 4 and Step 3 docs specify.

Note the tension, and do not resolve it by choosing: the replaced Jo port made the balance table **sortable by column**, which contradicts the docs. Whether W15 gains sortable columns the way W11 did is an owner decision, recorded as open item 7 in section 10. Build the documented fixed order and leave the question visible.

**Single Account mode: the fixed seven-row structural order in section 3.** Never sortable.

If sorting is later granted, section 5 applies to it: the ordering is a server request parameter, not a browser operation.

---

## 8. The three sizes

Rule 12 applies: three sizes, Glance, Explore and Detail, in that order. There is no Small.

The size table in the Step 4 doc predates Rule 12 and is written in Small / Medium / Large / KPI terms. It is mapped here, and the mapping is the requirement.

### Glance

- Shows one figure: **Total Balance across all bank accounts.**
- **This figure is always the All Accounts aggregate, regardless of any Account selection** made at a larger size. A build that makes it follow the Account selector is wrong.
- No controls, no view switch, no download.
- Refresh is present.

### Explore

- The Account control is live.
- All Accounts mode: the active presentation across all accounts, paginated per section 5, with the combined total.
- Single Account mode: the full seven-row breakdown.
- Switch View is available in All Accounts mode only.
- Download is available, per section 9.

### Detail

- The Account control is live.
- All Accounts mode: the active presentation, paginated per section 5, with the combined total.
- Single Account mode: the seven-row breakdown **plus** the four activity categories.
- Switch View is available in All Accounts mode only.
- Download is available, per section 9.

**Detail differs from Explore in the room it has, not in its structure.** The one substantive addition is the four activity categories in Single Account mode. Do not pair presentations that do not fit; W11's Final had exactly that requirement retired after review because the pairing did not fit the space.

---

## 9. Download

Available at Explore and Detail, not at Glance.

- It carries the **full unshortened figures**, not any shortened display values.
- In All Accounts mode it carries **every account, not just the visible page.** A download that stops at the current page is wrong.
- In Single Account mode it carries the seven-row breakdown for the selected account.

Whether figures are shortened on screen at all is a display decision and is not settled here. If they are, every figure must carry its exact value both on hover and to assistive technology, and no separate rounded dataset may be created; the shortening happens at the point of display from the same underlying values.

---

## 10. States

Most of these are unspecified in every source. A build must not invent behaviour for them; it must render something obvious and leave the gap visible.

| State | Requirement |
|---|---|
| No module rights | **Unspecified.** Nothing in any source covers Bank Account Management entitlement |
| No active bank accounts at all | **Unspecified.** The related known rule is that "All Bank Accounts" only appears when more than one account exists; what a zero-account organisation sees is undefined |
| An account with a negative balance | The legacy pie chart **excluded** negative-balance accounts from the chart. The equivalent rule for the bar chart and the cards is **unspecified**. Negative accounts must still appear in the table |
| An account never reconciled | Uses its opening balance as the beginning balance. This is defined, and is not an error state |
| Single Account mode against the current Modern API | The endpoint returns **only a summary balance**. No seven-row breakdown and no activity-category data exist. See open item 3; this is the widget's largest gap |
| Loading | **Unspecified.** Note that paging and any future sort are server round-trips per section 5, so this widget needs a loading treatment more than most. It still must not be invented here |
| Error or API failure | **Unspecified** |
| Stale data, "data as of" | **Unspecified.** Refresh exists, but no freshness signal is defined, and no visible Last Reconciled date or badge exists today |

---

## 11. What the replaced build did, recorded so nothing is lost by accident

The discarded Final was Jo's block. These are the behaviours it carried that this document does **not** require. Each is listed so that dropping it is a decision, not an oversight. None of them is a requirement, and a rebuild that reproduces them is not following this document.

| The port had | Status here |
|---|---|
| A sortable balance table | Contradicts section 7. Open item 7 |
| "Load more" paging | Replaced by section 5's server-paged model |
| An overdrawn filter chip, and an overdrawn count on the Glance figure | Not in any source document. Not required. Related to the undefined negative-balance rule |
| A search box over the account table | Not in any source document. Was a knowing deviation in the port, added only because Jo rendered a dead input. Not required |
| A drill overlay per account | No source defines drill content. Section 1 says view only, and Step 4 says Single Account mode already is this widget's drill-in mechanism |
| A per-account hover card on the activity bars | Hover shows the value for the hovered element, per section 12. Anything richer is unspecified |
| Client-side sort, slice and totals | Explicitly disallowed by section 5 |
| No download at all | Section 9 requires one |

---

## 12. Accessibility requirements

These are project baseline commitments for this widget, and none has been verified against any build:

- Colour is never the only signal. Negative or overdrawn balances, and any status treatment, must carry a text or shape signal too.
- Chart values exist as **text in the DOM**, either visible or screen-reader-only. Hover-only values are not acceptable. Hover shows the value for the hovered element, which is what the legacy widget did, but hover is never the only route to it.
- Table semantics are real, using `th` and `scope`. This applies to both the account table and the seven-row breakdown.
- The Account control, the view switch, the pager and the tables are all reachable and operable by keyboard.
- Because the Account control changes the entire widget rather than filtering a list, the mode change must be announced, not left as a silent replacement.

---

## 13. Facts that are not settled

A build must not resolve any of these by choosing. Render what is defined, and leave these visible as gaps.

| # | Open item | Who settles it |
|---|---|---|
| 1 | Last Reconciled visibility. The legacy design calculates balances using unreconciled transactions but never shows a Last Reconciled date or status badge. Should it become a visible field, and what exactly would it mean | Experts and dev |
| 2 | The size behaviour against real volume. Ben Lane's "top 3 to 5 plus view all" pattern for orgs with up to 50 accounts does not match the locked size table. Step 4 marks this "resolve before build" and it is still open | Design |
| 3 | **The Modern API gap.** The single-account endpoint returns only a summary balance. There is no seven-row breakdown and no activity-category data. Section 3 is the widget's more detailed mode and the backend cannot serve it today. Previously waived by the owner as Rule 11 forward design, with the row left open as a named backend ask | Backend team |
| 4 | Which accounts show when the list is trimmed. Alphabetical order gives the first accounts by name, which is not a meaningful "top" | Design |
| 5 | The Glance figure always showing the All Accounts aggregate regardless of Account selection. Flagged for confirmation, the same exception as W05, W10 and W11 | Owner |
| 6 | Negative-balance accounts in the bar chart and the cards. The legacy rule covers only the pie, which is not being carried forward | Design |
| 7 | Whether the account table gains sortable columns, against the docs' fixed alphabetical order. The replaced port had them. If granted, the sort is a server request parameter | Owner |
| 8 | The unspecified states in section 10, the loading treatment above all, since paging is now a round trip | Design and owner |
| 9 | Whether a cash runway or days-of-cash indicator belongs here. Well supported by market research and shipped by Mercury and Geckoboard, but no burn-rate or runway calculation is defined anywhere in this project | Owner and SME |
| 10 | Whether an unreconciled-item count belongs on the account rows, the lighter-weight alternative to a full reconciliation status. Xero does this; QuickBooks Online, Ramp and Mercury all keep it off the balance view | Owner |

**Item 3 deserves emphasis.** One of this widget's two modes cannot be served by the target API at all. A build renders it as forward design or not at all, and either way the gap is the owner's call, not the build's.

---

## 14. What must not be added

The following have all been explicitly cut, were never supported, or have no basis in the data. A build must not reintroduce them:

- **A pie or donut of balance distribution across accounts.** The legacy chart. Market research found no competitor using one for this, and cards or bars are the market default. The three presentations in section 6 replace it.
- **A "Show" filter** such as Balance plus Reconciliation, Balance Only, Reconciliation Only. Invented earlier in this project and cut; it corresponded to nothing in the legacy design.
- **Reconciliation status badges.** Not cut, but not confirmed either. They stay an open item, not a build decision. Do not ship them on a guess.
- **Any time or fiscal-year filter.** There is no time dimension on this widget.
- **Any drill-through or navigation away.** Single Account mode is the drill-in.
- **Any write, approval or status action.**
- **Any sign flip in the data.** The display-only rule in section 2 is not an invitation to store positive magnitudes.
