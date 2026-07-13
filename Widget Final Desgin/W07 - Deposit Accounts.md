# W07 — Deposit Accounts

**Module:** Finance
**Status:** 🟢 Final design — locked (rebuilt 2026-07-09 to a colleague's Table/Distribution/Trend design + comparison)
**Full history / rejected ideas:** [Widget_Specs/W07-Deposit-Accounts.md](../Mock_work/Widget_Specs/W07-Deposit-Accounts.md)
**Data source & formulas:** [Dashboard_Research/07 - Deposit Accounts.md](../Dashboard_Research/07%20-%20Deposit%20Accounts.md)

## Purpose
Shows the current balances of all active deposit accounts, grouped by account type, giving staff a snapshot of how much is held across different account categories as of today — now with a % change against a comparison point (last month/quarter/financial year), so staff can also see whether balances are moving, not just where they stand.

## How Other Companies Fulfil This Purpose
Bank/deposit-account balance widgets are typically simple — name and balance, grouped by type, shown in real time ([Coupler.io](https://blog.coupler.io/financial-dashboards/), [Golimelight](https://www.golimelight.com/blog/financial-dashboards-for-nonprofits)). **No source reviewed treats reconciliation status as a standard feature of this specific widget type** — that concept belongs on a bank-reconciliation-specific screen (closer to what W15 Bank Balances covers), not a simple balance-by-type widget.

**Update, following the user's own research:** period-over-period cash trend tracking (month/quarter/year-over-year) is a standard treasury/liquidity dashboard pattern — "Treasury / Liquidity" is listed as one of the standard finance-dashboard archetypes CFOs build, alongside a cash-flow trend chart showing net change over time so decision-makers can spot shifts ([UseDataBrain](https://www.usedatabrain.com/blog/financial-dashboard-examples), [HighRadius](https://www.highradius.com/resources/Blog/cash-flow-tracking-dashboard/)). Balance-sheet dashboards in banking also commonly plot balances over time per account/category rather than as a single snapshot ([BoldBI](https://www.boldbi.com/dashboard-examples/finance/balance-sheet-analysis/)), and declining-balance/liquidity-risk alerting on a trend is a recognised banking dashboard feature, distinct from simple threshold alerts on mobile banking apps.

**Net assessment:** reconciliation still doesn't belong on this widget — that finding stands. But a trend/comparison view is genuinely supported by both the standard *and* the underlying data (see Views below), so it's added as a real second view rather than staying a single-snapshot widget.

## Filters
| Filter | Values |
|--------|--------|
| Account Type | All Types (default) · dynamic list |
| Compare To | Last Month (default) · Last Year |

**Changed (2026-07-09), per direct instruction:** Account Type now narrows **both Table and Distribution** — this reverses the old pie's "always all types" rule.

**Changed again (2026-07-13), per direct instruction** ("it's supposed to be all the same component, just different filter applied — take from Large if there's a difference"): Account Type now narrows **every size the same way** — Table, Distribution, Trend, KPI, and Small all read from the same filtered account list. KPI/Small previously stayed pinned to an unfiltered "all accounts" total while Large filtered normally; that mismatch is what read as broken/inconsistent between card sizes and is now gone.

**Compare To simplified (2026-07-13), per direct instruction** ("the compare function should only be from last month compared to this month and this time to this time last year"): the only two comparisons left are **Last Month** and **Last Year** — "Last Quarter" and "None" are both removed. Last Month is now the default everywhere, so a % Change/delta/comparison line always shows; it's no longer optional. Compare To drives every % change shown by this widget — the Table's % Change column, the KPI's delta badge, and the Trend view's comparison lines. **Lives in the 3-dot "Change filters" menu at every size, including KPI** (per direct instruction, 2026-07-09) — deliberately not an inline dropdown anywhere on the card.

**Account Type data fixed (2026-07-13), per direct instruction** ("only ever two type accounts are showing" — flagged as a bug): every type previously had exactly 2 accounts, a perfectly uniform split that read as fake/broken filtering rather than real data. Added Petty Cash Checking (Checking) and Grant Reserve 2024 (Grant Funds) — Account Type now returns 3/2/2/2/3 accounts depending on which type is selected, not a flat 2 every time. Mock data is now 12 accounts across the same 5 real types.

**Large/Expanded, added 2026-07-09, repositioned 2026-07-11 per direct instruction:** Account Type and Compare To show as inline dropdowns at the very top of the card (reusing the same `inlineFilters()` row W01 already uses for its own filters), on top of the 3-dot menu. At this size the filter-tag chip row is dropped — showing both the chips and the live dropdowns for the same two filters was redundant once the dropdowns moved to the top.

## Data Table Sort
Fixed — Name, then Inception Date. Not user-changeable.

## Drill-Through
**Open item, not decided:** no drill-down exists in the old design (the table already shows account-level detail). Whether to add a link out to the Deposits On Hand module needs expert/dev input before build.

## Refresh
Standalone icon, present at every size including KPI.

---

## Views (Switch View)

**Rebuilt 2026-07-09** to match a colleague's Table/Distribution/Trend design, adopted per direct instruction, with comparison added on top of it.

### View 1 — Table *(default)*
Name · Inception Date · Account Number · Ending Balance, totals row at Large/Expanded. Adds a **% Change** column whenever Compare To isn't "None" — the up/down-vs-comparison-point figure requested on top of the colleague's original table.

### View 2 — Distribution
Donut chart with the combined total shown in its centre. **Reworked 2026-07-10, per direct instruction:** grouping now follows the Account Type filter itself, rather than a separate toggle (the By type/Top accounts toggle from the first pass was already cut on 2026-07-09). "All Accounts" groups **By Type** — a fund-level view of what's doing well or poorly. Picking one specific type drills into **that type's own accounts** — what's inside that fund.

### View 3 — Trend
**Simplified 2026-07-12, per direct instruction.** No in-card toggle — the earlier "All accounts / 2 account types" toggle wasn't working and has been removed entirely. Trend now plots whatever the **Account Type filter** (shown inline at the top of the card) currently resolves to:
- **All Accounts** — one aggregate daily line for this month, across every account.
- **A specific type selected** — that type's own daily line only, in a colour fixed to that type (Checking/Savings/Certificate of Deposit/Restricted Funds/Grant Funds each always render in the same colour — "group account types to one set of colour").

Shows **one month** of data — not 12 — at **daily granularity** (~30 points, per the 2026-07-11 fix), X-axis = days of that month, Y-axis = dollar balance.

**Compare To** overlays the **same scope** (all accounts, or the same type) from a comparable prior month — 1 or 12 months back for Last Month/Last Year (2026-07-13 simplification) — as a second, dashed line plotted **day-aligned** against the current month (Day 1 vs Day 1, Day 15 vs Day 15, etc.), not a single point-in-time delta.

**Declining-account flag** stays on the Table (2026-07-09): the ▼▼▼ "3+ consecutive month decline" badge shows next to the account's name there.

**Data feasibility, mockup note:** the real data has no daily-balance concept any more than it had a 12-month history — Ending Balance is `SUM(DH_Transaction.Amount WHERE AccountID = account AND TransactionDate <= asOfDate)`, evaluated at whatever date you ask for, so daily figures are technically obtainable the same way monthly ones are (just a different query cadence), but this mock derives its ~30 daily points by interpolating between each month's own start/end balance (the same simplification already used for W01's Weekly period view) rather than by asking for 30 real daily figures — worth confirming with dev whether daily-grain queries are cheap enough to run live at this frequency.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Table only: up to 3 accounts (filtered by Account Type, same as every other size), Name + Balance + % Change. Filter-tag chips shown (2026-07-13 fix — previously missing). Distribution/Trend not offered at this size. No Switch View. |
| **Medium (2×2)** | Table: 5 accounts + % Change. Distribution: smaller donut. Trend: same one-month/daily window as Large, driven by the same Account Type filter, smaller chart. Switch View available. |
| **Large (4×4)** | Table: all accounts + totals row. Distribution: full-size donut + legend. Trend: one-month/daily window, plots whatever Account Type resolves to, with a day-aligned compare line. Account Type + Compare To shown as inline dropdowns at the top of the card, in place of the filter-tag chip row, on top of the 3-dot menu. Switch View available. |
| **KPI (1×0.5)** | Headline: **Total balance for the current Account Type filter** (changed 2026-07-13 — was "always all accounts, unaffected by the filter"; now matches every other size), shown as a line-sparkline tile (matching the colleague's KPI reference) with a ▲/▼ delta vs Compare To. Title reflects the active filter (e.g. "Total Balance — Checking") on the Final Check page; the real gallery's KPI title is still static text (known limitation, see Fine-Tuning Notes). 3-dot menu offers Compare To only (trimmed, same mechanism as W01's Fiscal Year), no download. Switch chart type is present in the menu too (2026-07-09 fix, see Fine-Tuning Notes) — resizing this slot larger reveals it. |
| **Expanded** | All three views available via Switch View, all filters live in the modal |

---

## What Got Cut (and why)
- **All three original reconciliation-based concepts (Balance Cards with reconciliation badges, Vertical Bar with reconciliation indicators, Summary Table with Last Reconciled/Status columns)** — cut entirely, and still closed after tonight's rebuild. The old design's real data (`DHAccount`/`DHType`) has no reconciliation concept whatsoever, and the competitor research found no support for adding one to this widget type either.

## Fine-Tuning Notes
- Declining-account threshold (currently proposed at 3 consecutive months) needs sign-off before build
- Compare To badge colour: green = improved vs comparison point, red = declined
- **Rebuilt (2026-07-09):** replaced the old 4-account reconciliation-based render (Cards/Bars/Table, all built around a "Reconciled/Pending" status the real data never had) with the design above, per direct instruction to adopt a colleague's Table/Distribution/Trend concept and add period comparison. Mock data is now 10 accounts across the 5 real account types.
- **Known limitation, flagged not fixed (2026-07-09):** the real Dashboard tab's own Switch View menu for this widget still shows the old two-item "Account Cards / Table" list — that markup lives inside the gallery's single giant HTML line, which couldn't be safely read or edited this session (a direct read of it errors out at over 50,000 tokens for a handful of lines). Final Check reflects the full three-view rebuild; the live gallery's menu needs a manual follow-up pass to add Distribution and Trend there too — same treatment as W02's earlier Small-size dropdown gap.
- **Fixed, real bug found while testing the rebuild (2026-07-09):** resizing a card's Widget size via the 3-dot menu never correctly showed/hid the Switch chart type section for any widget except W01 — the trim logic only ever looked for a wrapper class that only W01's markup has, and silently did nothing for every other widget. Fixed generically (finds the "Switch chart type" section by its label text when the wrapper isn't there), so this now works correctly across the board, not just for W07.
- **Fixed (2026-07-09):** in Final Check, the KPI and Small slots' own dropdowns had no Switch chart type section at all, so resizing either of them larger via its own "Widget size" buttons could never reveal Distribution/Trend, even though the card's content had already grown to a size that should offer them. Added the same Switch chart type section used by the Medium/Large slots to both, correctly hidden by default at KPI/Small and revealed once resized bigger.
- **Distribution simplified (2026-07-09):** dropped the By type/Top accounts toggle added in the first pass — back to one fixed "By type" breakdown, per direct instruction.
- **Distribution filter behaviour reversed (2026-07-09):** now respects the Account Type filter (narrows like Table does) instead of always showing all types like the old pie did — a deliberate, direct-instruction departure from the old design's own rule.
- **Trend reworked (2026-07-09):** replaced the by-individual-account line list with a fixed 12-month window and a 2-account-type picker (see Views above) — per direct instruction, since individual accounts weren't the right comparison unit and the window shouldn't have varied by size.
- **Fixed, real bug (2026-07-10):** the Trend chart rendered completely blank. Root cause: it used the same `fillMode`/`flex:1` sizing approach as W01's charts, but that only works because W01's card body has a special CSS rule (`display:flex`) that no other widget's card body has — so the chart's mount point collapsed to zero height everywhere except W01. Switched to a fixed pixel height instead, which doesn't depend on that CSS rule.
- **Distribution reworked again (2026-07-10), per direct instruction:** grouping now follows the Account Type filter directly — All Accounts groups by type (fund-level), a specific type drills into that type's own accounts (account-level) — rather than always grouping by type regardless of filter.
- **Trend reworked again (2026-07-11), per direct instruction:** replaced the 12-month window with one month at daily granularity, and Compare To now overlays the same account type/total from a comparable prior month (1/3/12 months back), day-aligned against the current month — replacing the earlier version's month-over-month line for a 12-month span.
- **Inline filters repositioned (2026-07-11), per direct instruction:** moved to the very top of the Large/Expanded card (was previously below the filter-tag chip row); the chip row is now dropped at this size to avoid showing the same two filters twice.
- **Trend simplified (2026-07-12), per direct instruction:** removed the "All accounts / 2 account types" in-card toggle entirely — it wasn't working, and duplicated the Account Type filter already shown inline at the top of the card. Trend now just plots whatever that filter currently resolves to, with no separate type-picker UI.
- **Mock data made more dramatic (2026-07-13), per direct instruction ("last month was low, this month money coming in is more significant"):** raised this month's ending balance on 8 of the 10 (at the time) accounts, all except the two already-declining ones (Building Fund Restricted, State Grant Q3), while keeping last month's growth close to flat — the daily Trend line for "All Accounts" now shows a visibly muted last month followed by a sharp climb this month.
- **KPI/Small brought in line with Large (2026-07-13), per direct instruction** ("it's supposed to be all the same component, just different filter/size — take from Large if there's a difference"): KPI and Small both used to compute their totals from the unfiltered account list while Large correctly respected the Account Type filter — that inconsistency is what read as "broken" between card sizes. Both now use the exact same filtered dataset and Compare To calculation as Large; Small also gained the filter-tag chips and a % Change column it was missing, and KPI's title now names the active Account Type filter (Final Check page only — see known limitation below).
- **Compare To simplified (2026-07-13), per direct instruction** ("it should only be from last month compared to this month and this time to this time last year"): removed "Last Quarter" and "None" entirely. Only Last Month and Last Year remain, Last Month is the default, and a comparison now always shows — Table's % Change column, KPI's delta, and Trend's compare line are never optional/blank anymore.
- **Account Type data diversified (2026-07-13), per direct instruction** ("only ever two type accounts are showing" — read as a bug): every type had exactly 2 accounts before, which looked like fake/broken filtering. Added Petty Cash Checking (Checking) and Grant Reserve 2024 (Grant Funds) — mock data is now 12 accounts, 3/2/2/2/3 per type. Total balance across all accounts is now **$7,451,630** (Checking $1,496,103 · Savings $1,507,585 · Certificate of Deposit $1,350,138 · Restricted Funds $879,738 · Grant Funds $2,218,066).
- **Known limitation, flagged not fixed (2026-07-13):** the KPI/Small title's dynamic "— Account Type" suffix only works on this Final Check page (wired through the shared `FC_KPI_HEADLINE` mechanism, Final-Check-only). The real Dashboard tab's KPI/Small titles for this widget live in the same unreadable/uneditable giant HTML line as the Switch View menu gap above, so they'll keep showing static "Total Balance" text there even though the underlying number is correctly filtered — same follow-up bucket.

---

## Interview Q&A (Ben Lane, 13.07.2026)

Source: [Question and answer from Ben Lann (13.07.2026).md](../Feedback/Question%20and%20answer%20from%20Ben%20Lann%20%2813.07.2026%29.md). Full detail and transcript quotes in [Specialist Questions.md](../Feedback/Specialist%20Questions.md), Q17, Q18, Q34.

**Q: How many bank accounts does a typical organization have — is 3 realistic, or could there be many more?**
A: Up to 50, sometimes more. 3 is unrealistically low. *(Also tagged to W15 — Bank Balances; the question wasn't fully separated from general bank-account count in the interview.)* — *Supports this widget's account-count handling being designed for dozens of accounts, not a handful.*

**Q: Is reconciliation status something users check regularly on this widget, or is the balance the primary thing?**
A: Balance is the primary thing users check; reconciliation status is secondary. — *Directly confirms the "How Other Companies Fulfil This Purpose" finding above that reconciliation doesn't belong on this widget type — this is now backed by both competitor research and direct user testimony.*

**Q: What's the intended difference between Deposit Accounts and Bank Balances?**
A: Deposit Accounts = HQs managing investments from individuals/entities, like an investment company. Bank Balances = the actual cash balance used for reconciling transactions. Genuinely distinct — keep separate. — *Confirms the decision already reflected in these being two separate widgets/files (this one and W15).*

**General context (not tied to this widget specifically):** Deposit Accounts is one of the lowest-usage widgets on the dashboard — "rarely used, mainly by HQs managing investments, serving less than 1% of users" — a niche use case, not a usability failure.

