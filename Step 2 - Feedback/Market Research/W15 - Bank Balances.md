# Market Research: Bank Balances

> Step 2 — Feedback / Market Research. Captures how other companies present this kind of information — visuals, layout, framing — so a widget's design options can be checked against real precedent (or an honest "no direct precedent found") before Step 3 locks in Options A/B/C.

**Widget:** W15 — Bank Balances
**Module:** Finance
**Researched:** 2026-07-21
**Status:** ✅ Researched — via the `widget-market-research` skill (parallel-agent research pass, manual cross-check in place of automated verification — see that skill's "Why this exists" note on its limits vs. the general-purpose `deep-research` pipeline)

## What This Widget Shows Today

Per `Step 1 - Dashboard Research/15 - Bank Balances.md`: current balances across all bank accounts (All Accounts view — table + pie chart + totals row), with drill-down into a single account for a 7-row activity breakdown (Beginning Balance, Deposits, Voids, Checks, Withdrawals, EFT, Ending Balance) since the last reconciliation, plus a 4-category bar chart.

## Data Used

Legacy tables cover everything the current design needs: `BR_BankAccount`, `BR_Item` (typed transactions, unreconciled only), `BR_Reconcile`. Per `Step 3 - Mock_Work/Data and Build Readiness - Developer Punch List.md`'s `## W15` section: Account filter, All-Accounts views, and the KPI total are ✅ available on the Modern API today. Single Account mode (the 7-row breakdown + bar chart) is a 🔴 major gap — the Modern API's single-account endpoint returns only a summary balance, no breakdown or activity-chart endpoint exists yet. Reconciliation status display is a 🔴 open question, not decided either way. Nothing found in this research pass changes either of those two flags — they're still the real constraint on what's actually buildable.

## Competitor / Industry Findings

**Multi-account overview: cards/tiles beat a single table+chart, but a prominent combined total is also common.**
QuickBooks Online's Banking Center shows one tile per connected account (institution name, bank balance, QuickBooks/register balance) — no combined total on the tile row (Fit Small Business, fitsmallbusiness.com/quickbooks-bank-feeds, undated). Xero mirrors this with one dashboard widget per account (Statement Balance, Balance in Xero, count of unreconciled lines) (Xero Central, undated). Mercury instead leads with one combined balance across every account, with a toggle into a balance graph (Mercury Support, "Understanding your Mercury balances," undated). MIP Fund Accounting doesn't itemize by bank account at all on its dashboard — cash is one aggregate "Year to Date Cash Balance" KPI tile (MIP documentation, documentation.mip.com/MIPModern, undated). **Confidence: confirmed pattern** (2+ independent sources on tiles/cards; 2+ independent sources — Mercury, MIP — on a combined total being a legitimate alternative/addition, not a replacement).

**No competitor found using a pie chart for multi-account balance distribution.**
None of QuickBooks, Xero, Mercury, MIP, or Sage Intacct's documented multi-account views use a pie/donut chart for account-to-account balance comparison. MIP and Sage Intacct do use donut charts, but for fund/program/expense-designation breakdowns within an account, not across accounts. **Confidence: single-source gap, not a confirmed prohibition** — absence of evidence isn't strong evidence against it, but it means the current pie chart has no positive precedent either.

**Single-account view: a ledger/table is the dominant pattern, often paired with a chart above it, not a fixed chart alone.**
QuickBooks splits single-account activity into a 3-tab ledger workflow (For Review / Categorized / Excluded), not a chart (Fit Small Business, undated). Xero's reconciliation screen is a side-by-side statement-line-to-ledger match (Fit Small Business, published 2024-09-05). Mercury's Transactions page combines two charts (a cashflow graph and a top-5 inflow/outflow breakdown) sitting above a filterable, sortable transaction table (Mercury blog, "Getting the most out of our updated Transactions page," 2025-07-29). **Confidence: confirmed pattern** (3 independent sources) — our existing 7-row breakdown + bar chart combo is structurally consistent with this, but the fixed, non-filterable shape is more rigid than any of the three competitors' versions.

**Reconciliation status is commonly shown as a lightweight signal alongside balance, not a badge.**
Xero shows a live count of unreconciled statement lines per account; QuickBooks' bank-vs-register balance gap functions as an implicit unreconciled-items signal. Neither uses a green/amber/red badge. **Confidence: confirmed pattern across 2 sources** — directly relevant to this project's own open question ("whether to surface a 'Last Reconciled' date/badge," per `PROJECT INDEX.md`'s W15 unresolved-questions list) — the competitor pattern leans toward a small at-a-glance count/gap, not a status badge.

**Cash runway / days-of-cash framing is a stronger, multi-source pattern than the single Hiline citation previously on file suggested.**
Beyond Hiline, two nonprofit-finance advisory sources (WhippleWood CPAs, 2026-04-14; Strategic Nonprofit Finance blog, undated) independently name "Days Cash on Hand" as a top board-level metric, in explicit runway language. Mercury's own Insights page implements runway as a real UI metric: available balance ÷ average monthly burn rate, suppressed when cashflow is positive (Mercury Support, undated). Aplos — a nonprofit-specific competitor — has a screenshotted "cash runway" chart in its own academy content (aplos.com/academy/board-ready-reforecast-nonprofits, 2026-06-02), though that's marketing content rather than confirmed core-product documentation. Geckoboard, a general BI tool, ships "Cash Runway" as a selectable KPI tile (geckoboard.com, undated). **Confidence: the underlying advice is now a confirmed multi-source pattern; the "runway as a real, named UI element" claim is confirmed in a mainstream neobank (Mercury) and suggestively true in a nonprofit-specific tool (Aplos), but not confirmed in Sage Intacct, MIP, or QuickBooks Nonprofit** — don't round this up to "every nonprofit tool has this," but it's real enough to take seriously.

**One caution found, not a recommendation:** Xero shipped a 6-month per-account balance history chart on its old homepage and removed it (shrunk to 1 month) in a redesign specifically to simplify the page, per user complaints on Xero's own product-ideas forum (productideas.xero.com, admin response 2026-01-24). **Confidence: single source** — worth knowing as a counter-signal before assuming "add more historical charts" is automatically an improvement.

## Visual Options (aim for 3)

1. **Combined Total callout on the All Accounts view.** Add a prominent combined-balance figure (not just the existing totals row inside the table) above or beside the account table — matching the Mercury/MIP pattern of leading with one aggregate number rather than only per-account tiles. Based on: Mercury + MIP findings above. Data needed: ✅ available today — the total is already computed for the existing totals row, this is a display change, not a new query.

2. **Cash runway / days-of-cash indicator.** Add a secondary metric under the combined total — "X days of cash at current spend" or similar — computed from available balance and recent transaction burn rate, adapted for a nonprofit audience per the Hiline/WhippleWood/Strategic Nonprofit Finance framing and validated as a real, buildable UI pattern by Mercury and Geckoboard. Based on: the runway findings above (now multi-source, not single-source). Data needed: 🟡 needs new query/logic — the raw transaction data to compute a burn rate exists in `BR_Item`, but no burn-rate or runway calculation is defined anywhere in this project's current data/API docs; this would need to be scoped and built, not assumed free.

3. **Filterable single-account ledger, layered on the existing breakdown.** Keep the current 7-row breakdown + bar chart, but add basic filter/grouping controls (by date range or transaction type) on top of it, matching the QuickBooks/Xero/Mercury pattern of pairing a chart with an interactive, filterable ledger rather than a fixed view. Based on: the single-account findings above (3-source confirmed pattern). Data needed: 🔴 not available on the Modern API yet, and this option makes the gap worse, not better — the Modern API doesn't yet support the 7-row breakdown at all (per the Punch List), so adding filtering on top of it is a second-order ask that depends on the first gap closing.

## Net Assessment

**Mixed — the core two-view structure (All Accounts + Single Account drill-down) is broadly consistent with how competitors split this problem, but two specific parts of the current design have weak or no competitor support, and one clear opportunity emerged that goes beyond just confirming what's already built.** The pie chart for multi-account balance distribution has no positive precedent in anything found this pass — worth a second look, not because it's wrong, but because nothing validates it either. The fixed, non-filterable single-account breakdown is structurally on-pattern (chart + breakdown) but more rigid than every competitor example found. Most notably, the runway/days-of-cash framing — previously resting on one thin Hiline citation — is now a genuinely stronger, multi-source finding (confirmed in nonprofit financial advice, a mainstream neobank's real UI, and a general BI tool) and is worth serious consideration as a new addition, not just decoration, especially given this widget's own confirmed status as one of the two most-used widgets on the whole dashboard.

## Sources

- Fit Small Business, "How To Manage QuickBooks Online Bank Feeds," fitsmallbusiness.com/quickbooks-bank-feeds — undated
- Intuit, "Use the cash flow planner in QuickBooks Online," quickbooks.intuit.com/learn-support/en-us/help-article/budget-forecast-reports/use-cash-flow-planner-quickbooks-online/L2l59mIqe_US_en_US — undated
- Xero Central, "Why are the Statement Balance and Balance in Xero different?" central.xero.com — undated
- Fit Small Business, "How to Add & Reconcile Your Bank Accounts in Xero," fitsmallbusiness.com/connect-and-reconcile-bank-account-xero — 2024-09-05
- Xero Product Ideas, "Homepage - Bank balance widget chart," productideas.xero.com/forums/966063-new-homepage/suggestions/50815280-homepage-bank-balance-widget-chart — posted 2025-12-17, admin response 2026-01-24
- Aplos Help, "Recording and Reconciling Transactions," help.aplos.com/hc/en-us/articles/30707972679949 — undated
- Aplos, "Nonprofit Reporting Software," aplos.com/nonprofit-reporting-software — undated
- Aplos Glossary, "Unrestricted Fund in Nonprofit Fund Accounting," aplos.com/glossary/unrestricted-fund — undated
- Aplos Academy, "The Board-Ready Reforecast," aplos.com/academy/board-ready-reforecast-nonprofits — 2026-06-02
- MIP documentation, "Dashboard," documentation.mip.com/MIPModern/Content/MAD/Dashboard.htm — undated
- Sage Intacct Help Center, "Dashboards for nonprofit compliance," intacct.com — last modified 2026-07-16
- One Abacus Advisory, "Sage Intacct Nonprofit Financial Dashboards — Complete Guide," oneabacusadvisory.com/feeds/blog/sage-intacct-nonprofit-dashboard — 2026-05-11
- Mercury Support, "Understanding your Mercury balances," support.mercury.com — undated
- Mercury Support, "Viewing all Mercury accounts," support.mercury.com — screenshot dated 2026-04
- SaaSFrame, "Mercury Dashboard UI Design," saasframe.io/examples/mercury-dashboard — added 2023-04-27
- Mercury Blog, "Getting the most out of our updated Transactions page," mercury.com/blog/updated-transactions-page — 2025-07-29
- Mercury Support, "Insights page overview," support.mercury.com — undated
- Ramp, "Business Banking," ramp.com/business-banking — undated, APY figures dated 2026-07-02
- Ramp, "Expense Management," ramp.com/expense-management — undated
- WhippleWood CPAs, "8 Financial Ratios for Nonprofit Boards," whipplewood.com/insights/nonprofit-financial-ratios — published 2026-04-14, updated 2026-05-19
- Strategic Nonprofit Finance, "The Six Metrics Every Nonprofit Board Should Know," strategicnonprofitfinance.com — undated
- Geckoboard, "Cash Runway" KPI page and Cash Flow Dashboard example, geckoboard.com — undated
- Hiline, nonprofit financial dashboard blog post, hiline.co/ledger/blog/nonprofits/nonprofit-financial-dashboard — pre-existing citation, not newly verified this pass

## Note on Existing Content Elsewhere

The prior thin research (the single Hiline citation) still lives in `Step 3 - Mock_Work/Widget_Specs/W15-Bank-Balances.md` and `Step 4 - Widget Final Design/W15 - Bank Balances.md` under `## How Other Companies Fulfil This Purpose` / `## Purpose & Competitive Fit Check`. This file now has substantially more research than either of those — whether to update those two sections to point here, replace their content, or leave them as a shorter summary that references this file is still an open decision, not made as part of this research pass.
