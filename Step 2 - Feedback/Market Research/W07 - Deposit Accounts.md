# Market Research: Deposit Accounts

> Step 2 — Feedback / Market Research. Captures how other companies present this kind of information — visuals, layout, framing — so a widget's design options can be checked against real precedent (or an honest "no direct precedent found") before Step 3 locks in Options A/B/C.

**Widget:** W07 — Deposit Accounts
**Module:** Deposits On Hand
**Researched:** 2026-07-22
**Status:** ✅ Researched — via the `widget-market-research` skill (parallel-agent research pass, manual cross-check in place of automated verification)

## What This Widget Shows Today

Per `Step 1 - Dashboard Research/07 - Deposit Accounts.md`: a table + pie chart ("By Account Type") showing current balances of active deposit accounts as of today, scoped by Bank Account (not Company, unlike most other Finance widgets). **Note:** already Step 4 — locked (`Step 4 - Widget Final Design/W07 - Deposit Accounts.md`), rebuilt 2026-07-09 to add a Compare-To filter and a 12-month Balance Trend view on top of the original table + pie.

## Data Used

`DH_Account`, `DH_Type`, `DH_Transaction` (per Step 1). **Known Modern API gap:** the legacy balance calc uses a custom `CalcBalance()` property that may apply adjustments beyond a simple transaction sum — not yet confirmed to tie out byte-for-byte with the Modern API's plain `SUM(DH_Transaction)`. Per `Step 3 - Mock_Work/Data and Build Readiness - Developer Punch List.md`'s `## W07` section: Account Type filter ✅, Balance Table + Pie ✅, KPI Total Balance ✅; Compare To filter (Last Month/Quarter/LY) 🟡 needs new query (same formula, different as-of-date, confirmed feasible); Balance Trend view (12-month line) 🟡 needs new query (a new monthly-snapshot query, plus needs confirming how far back `DH_Transaction` history actually goes per organisation); declining-account flag 🟡 needs new logic derived from the trend data, no new data required; balance-calc match vs. legacy 🟡 still needs verification.

## Competitor / Industry Findings

**Already on file, carried forward from Step 3/4 rather than re-derived:**
- Bank/deposit-account balance widgets are typically simple — name and balance, grouped by type, shown in real time; no source reviewed treats reconciliation status as standard for this specific widget type. *Sources: [Coupler.io](https://blog.coupler.io/financial-dashboards/); [Golimelight](https://www.golimelight.com/blog/financial-dashboards-for-nonprofits).*
- Period-over-period cash trend tracking is a standard treasury/liquidity dashboard archetype, and balance-sheet dashboards commonly plot balances over time per account/category rather than as a single snapshot. *Sources: [UseDataBrain](https://www.usedatabrain.com/blog/financial-dashboard-examples); [HighRadius](https://www.highradius.com/resources/Blog/cash-flow-tracking-dashboard/); [Bold BI](https://www.boldbi.com/dashboard-examples/finance/balance-sheet-analysis/).*

**New this pass — a citation fix and a reinforced finding:**
- **Citation correction, moderate confidence** — the existing design doc asserts "declining-balance/liquidity-risk alerting on a trend is a recognised banking dashboard feature" without a source. This pass found a real product doing exactly that — **Trovata**, a treasury/cash-visibility platform, explicitly separates "Cash Insights" (AI-surfaced patterns, anomalies, and *trends* across balances) from "Cash Positioning" (a distinct module for simple threshold-based low-balance alerts) — two named, currently-marketed modules. *Sources: [Trovata — Cash](https://trovata.io/trovata-cash); [Trovata Glossary — Cash Positioning](https://help-center.trovata.io/en/articles/6798175-trovata-glossary).* By contrast, **Ramp Treasury**'s alerting is confirmed purely threshold-based, supporting the "distinct from simple threshold alerts" half of the original claim as a real contrast, not just an assumption. *Source: [Ramp — Low Balance Notifications](https://support.ramp.com/hc/en-us/articles/36256537043731).* **However**, "declining-balance alert" isn't an established, formally-named industry category the way "low-balance alert" is — no standards body or analyst firm defines it that way. Recommend softening the design doc's wording from "a recognised banking dashboard feature" to "a pattern found in modern treasury/cash-visibility tools like Trovata, distinct from simple threshold alerts common in consumer/SMB banking apps."
- **Reinforced, not contradicted** — no competitor found (including Trovata, which keeps "Balances" and "Reconciliation" as two separate modules) combines reconciliation status with a balance-by-type view. This adds a second, independent confirmation to the existing "reconciliation doesn't belong here" finding.

## Visual Options (aim for 3)

1. **Fix the citation, not the design** — update the existing design-doc language on declining-balance alerting to cite Trovata specifically and soften "recognised banking dashboard feature" to an accurate description of a real but not formally standardized pattern. Based on: the Trovata/Ramp findings above. Data needed: N/A — documentation accuracy only, no design or data change.
2. **No change to the Trend/Compare-To addition** — already well supported by five sources total now (the four already on file, plus Trovata as a concrete named example of the underlying pattern). Data needed: 🟡 as already flagged on the punch list — new query logic, not new data.
3. **No change on reconciliation** — now confirmed absent from balance-by-type views in a second, more specific competitor (Trovata) beyond the original general sources. Data needed: N/A — this is a "don't build" finding, reinforced.

## Net Assessment

**Supports, plus a citation fix.** The 2026-07-09 rebuild's Trend/Compare-To addition holds up well and is now backed by a concrete named product (Trovata) rather than only general treasury-archetype sources. The one actionable finding is correcting an uncited claim in the existing design doc — the underlying idea was directionally right, just not sourced accurately as written. Nothing here changes the decision to keep reconciliation status off this widget; if anything, it's now confirmed by a second, more specific example.

## Sources

- [Coupler.io — Financial Dashboards](https://blog.coupler.io/financial-dashboards/)
- [Golimelight — Financial Dashboards for Nonprofits](https://www.golimelight.com/blog/financial-dashboards-for-nonprofits)
- [UseDataBrain — Financial Dashboard Examples](https://www.usedatabrain.com/blog/financial-dashboard-examples)
- [HighRadius — Cash Flow Tracking Dashboard](https://www.highradius.com/resources/Blog/cash-flow-tracking-dashboard/)
- [Bold BI — Balance Sheet Analysis](https://www.boldbi.com/dashboard-examples/finance/balance-sheet-analysis/)
- [Trovata — Cash](https://trovata.io/trovata-cash)
- [Trovata Glossary — Cash Positioning](https://help-center.trovata.io/en/articles/6798175-trovata-glossary)
- [Ramp — Low Balance Notifications](https://support.ramp.com/hc/en-us/articles/36256537043731)

## Note on Existing Content Elsewhere

`Step 3 - Mock_Work/Widget_Specs/W07-Deposit-Accounts.md` and `Step 4 - Widget Final Design/W07 - Deposit Accounts.md` both still carry their own `## Purpose & Competitive Fit Check` / `## How Other Companies Fulfil This Purpose` sections, including the uncited declining-balance-alert claim this pass tracked down a real source for. Nothing there has been moved or deleted — this file cites the same sources plus the new Trovata/Ramp citations. Whether to update those two sections (including swapping in the corrected citation) is still an open decision.
