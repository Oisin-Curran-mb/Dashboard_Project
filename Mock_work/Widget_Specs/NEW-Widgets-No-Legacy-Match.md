# New Widgets — No Match to Any Existing W01–W17 (Phase 2 API, no legacy equivalent)

**Source:** `Widget_Comparison_New_Widgets.html`, added 2026-07-08.
**Status:** Starting point only — not comprehensive, not yet specced with filters/sizes/chart options. These 4 widgets (of the 10 found in the New_Widgets comparison file) don't map to any of the existing 17 Dashboard_Research/Widget_Specs widgets, unlike the other 6 (see cross-references below). They exist only in the Modern API — there is no legacy equivalent to compare against.

**The other 6 new widgets found in the same file were cross-referenced into their closest existing widget instead of listed here:**
- `budget-vs-actual-summary` → see `W01-Budget-Compared-to-Actual.md`
- `payroll-pct-of-budget` → see `W03-Payroll-Distributions.md`
- `ap-ar-aging` → see `W05-Receivable-Invoices-Outstanding.md` and `W16-Accounts-Payable-By-Due-Date.md`
- `actionable-alerts` → see `W08-My-Status.md`
- `campaign-giving-tracker` and `giving-trend` → see `W17-Gifts-Pledges.md`

---

## kpi-cards — Financial Health KPI Row

**Module:** Cross-module
**Endpoint:** `GET /api/dashboard/kpi-cards`
**Shape:** `FinancialKpiCardsDto {ResolvedPeriod, PriorYearPeriod, Income, Expenses, NetIncome, CashPosition}`

4 KPI cards: Total Income, Total Expenses, Net Income, Cash Position. Each card carries the current-period amount, the prior-year same-period amount, variance % and variance amount, and a favorable/unfavorable flag. Cash Position additionally includes a runway estimate and unreconciled-account warnings.

**Logic:**
- Period resolved from `X-Year-ID`/`X-Period-ID` headers, or falls back to the most recent open fiscal year / most recent non-Audit period
- Prior year = the fiscal year immediately before the current one, matched by period ordinal number (not calendar date)
- Cash Position = `SUM(ending balance across all company bank accounts)`, using the same `LastReconcile.EndingBalance + SUM(unreconciled BR_Item)` formula documented in W15
- Runway = current cash ÷ average monthly expenses over the trailing 3 periods
- Unreconciled warning triggers for any account more than 30 days since its last reconciliation

**Why it doesn't map to an existing widget:** this is a top-of-dashboard summary row spanning Income, Expense, Net Income, and Cash — no single one of the 17 existing widgets covers all four together. Closest conceptual overlap is W01 (Budget vs Actual) and W15 (Bank Balances), but this is a distinct cross-cutting KPI strip, not a replacement for either.

---

## fund-balance-overview — Fund Balances by Restriction Type

**Module:** General Ledger
**Endpoint:** `GET /api/dashboard/fund-balance-overview?ytdThroughPeriod={n}&includeFundsWithNoActivity={bool}`
**Shape:** `FundBalanceOverviewDto {Groups:[FundRestrictionGroupDto], TotalYtdIncome, TotalYtdExpenses}`

Groups funds into 3 restriction categories: Unrestricted (U), Net Assets With Donor Restrictions (T), Designated (P). Per fund: FundId, FundNumber, FundName, RestrictionType, YtdIncome, YtdExpenses, YtdNetIncome, AnnualBudget, BudgetUtilisationPct, and a BudgetStatus flag (ok / amber ≥80% / red ≥100%).

**Logic:** `[GL_Account]` grouped by FundID and GAAPRestrictionType; Income = `GLSummary.Amount × -1` for YTD periods; Expenses = `GLSummary.Amount`; Budget = `[GL_BudgetDetail] WHERE RevisionStartingPeriodID=null` for the full year.

**Why it doesn't map to an existing widget:** none of the 17 widgets group by fund/restriction type today — this is a new dimension (fund accounting compliance view) not present anywhere in the legacy dashboard.

---

## restricted-fund-compliance — Restricted/Designated Fund Overspend Alerts

**Module:** General Ledger
**Endpoint:** `GET /api/dashboard/restricted-fund-compliance`
**Shape:** `RestrictedFundComplianceDto {Funds[], BreachCount, AmberCount}`

Only includes funds with GAAPRestrictionType T (Donor Restricted) or P (Designated). `IsBreach = spent > received AND received > 0`. Status: red = breach, amber = SpendPct ≥ 90%, green = ok. Ordered breach-first, then by SpendPct descending.

**Logic:** `[GL_Account] WHERE GAAPRestrictionType IN (T,P)`, grouped by FundID; Received = `SUM(Income accounts × -1)`; Spent = `SUM(Expense accounts)`; SpendPct = `spent / received × 100`.

**Why it doesn't map to an existing widget:** a compliance/breach-detection view for restricted funds — closely related to `fund-balance-overview` above (same GAAPRestrictionType grouping) but no equivalent exists among the 17. Also feeds into `actionable-alerts` (see W08) as one of its 5 alert types (`RestrictedFundBreach`).

---

## expense-breakdown — Expenses by Department, with "Other" Rollup

**Module:** General Ledger
**Endpoint:** `GET /api/dashboard/expense-breakdown?ytdThroughPeriod={n}&otherThresholdPct={decimal}`
**Shape:** `ExpenseBreakdownDto {TotalYtdExpenses, Categories[], Other}` — Category fields: CategoryId, CategoryName, Amount, Percentage, IsOther, SubCategories (if Other)

Departments below the configurable `otherThresholdPct` are rolled up into a single "Other" category (with the rolled-up departments still listed as SubCategories).

**Logic:** Expense accounts → `[GL_Summary]` for YTD periods, grouped by DepartmentID/Name, `SUM(Amount)`; sorted by amount descending; small departments folded into "Other" per the threshold.

**Why it doesn't map to an existing widget:** none of the 17 group General Ledger expenses by department — this is a new breakdown dimension, closest in spirit to W01 (Budget vs Actual) but department-based rather than period-based, and with no budget comparison at all.

---

## Open question for the wider redesign
These 4 widgets are real, working Modern API endpoints with no legacy history and no assigned place in the current 17-widget dashboard layout. Worth raising with product/dev: should any of these become new numbered widgets (W18+) in a future phase, or are they intended as a separate "Financial Health" dashboard/section entirely? Not decided — flagging per the source comparison file's own framing of these as "Phase 2" widgets.
