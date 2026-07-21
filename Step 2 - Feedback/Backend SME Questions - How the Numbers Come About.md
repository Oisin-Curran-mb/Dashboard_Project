# Data & Calculation Questions — How the Numbers Come About

These are for a **technical/data subject-matter expert** — someone who knows the Shelby Financials database and the legacy widget calculation logic, not a UX/usage interview. That's a separate document: see `UX Specialist Questions - Master Tracker.md` for the Ben Lane interview on how widgets are actually *used*. This one is about whether the numbers themselves are right, complete, and calculated the way we think they are.

It covers the four widgets currently tagged "Ready to be reviewed by Jo" in the mockup: **W01 Budget Compared to Actual, W02 Pension Plans, W03 Payroll Distributions, W07 Deposit Accounts.** Each section gives the confirmed data source/formula (from the Purpose docs and Classic Widget Comparison verification) so the expert has context, then lists what's still unconfirmed or genuinely uncertain. Leave an answer under each question.

---

## Widget 1 — Budget Compared to Actual

**Confirmed data source:** `GLSummary` (actual, `SUM(Amount)` per period × sign multiplier) vs. `GLBudgetDetail` (budget, `SUM(Budget)` per period × sign multiplier, **only rows where `RevisionStartingPeriodID = null`**). Periods from `GLPeriod`, excluding any period named "Audit." Sign multiplier: Income × −1, Expense × +1, except Special Report Lines use their own `ReverseSign` flag. Consolidated orgs combine child accounts via `GLAccount.MasterAccountID`.

**Q1.** "Only the original budget is used" — confirmed as `RevisionStartingPeriodID = null`. Is that definitely the right rule for every client, or are there cases where a mid-year budget revision *should* be reflected in this comparison (e.g. a formally re-approved budget, not just an ad-hoc adjustment)?

> Your answer:

**Q2.** The financial year is fixed July–June in the current design. Is that a global constant, or can an organisation run a different fiscal year? If it can vary, where is that setting stored?

> Your answer:

**Q3.** Quarterly Period View needs new grouping logic — periods aren't natively stored as quarters. When we build that, should quarters align to the fiscal year (Q1 = Jul–Sep) or the calendar year (Q1 = Jan–Mar)?

> Your answer:

**Q4.** Weekly Period View is flagged as having no confirmed weekly transaction grain in GL data — GL is period-based. Does a "weekly" breakdown of budget-vs-actual even make sense for this data, or is that request based on a misunderstanding of how GL data is grained? If it is possible, where would the weekly detail come from?

> Your answer:

**Q5.** Consolidated/master company rollup: the Modern API currently returns an empty list for master companies (`CompanyNumber = 0`), but the legacy behaviour combined child-account figures via `MasterAccountID`. Confirmed this needs reinstating — what's the correct join/aggregation to bring that back exactly as it worked before?

> Your answer:

**Q6.** Special Report Title (the dependent dropdown when Account Type = Custom Report) — is that list of titles something the customer creates themselves elsewhere (like a saved-report name), meaning we need a new endpoint to list *their* saved titles? Or is there already a way to pull that list that we're missing?

> Your answer:

**Q7.** Line Description (the other Custom Report dependent field) — same question as above, but this one's a bigger unknown: is it customer-created the same way, or a fixed/hard-coded list we're expected to maintain ourselves? This changes the build approach, so it needs a clear answer either way.

> Your answer:

---

## Widget 2 — Pension Plans

**Confirmed data source:** `PB_Appointment` (Active flag, DateStart, DateEnd) joined to `PB_AppointmentPlan` (AnnualPlanAmount, PlanID/Name). Active filter = `Active = true AND DateStart <= today AND (DateEnd = null OR DateEnd >= today)` — a point-in-time snapshot, not scoped to any year. District list from `PB_ControlTable WHERE Type = District`.

**Q8.** "Annual contribution amount" — is `AnnualPlanAmount` the *rate currently in effect* for that appointment (i.e. what they're committed to pay annually going forward), or an *actual year-to-date total* of what's been contributed so far? This matters a lot for how the number should be labelled and whether "Total Annual Contribution" is even the right framing.

> Your answer:

**Q9.** Since this is a pure "active as of today" snapshot with no year dimension, is there ever a legitimate need to see a *past* year's pension contribution picture (e.g. for an audit or year-end report), or is "as of today" genuinely the only view anyone needs?

> Your answer:

**Q10.** The drill-down "Charge" field (appointee's assigned minister/charge name) returns an empty string in the Modern API today. What's the correct source field or join to populate this, and is it realistic to fix before this widget ships?

> Your answer:

**Q11.** Drill-through to the Pension Billing module — what's the actual target page/URL this should deep-link to, ideally landing on the same district/plan context the user was already looking at?

> Your answer:

---

## Widget 3 — Payroll Distributions

**Confirmed data source:** `PRHistory` (CheckDate, CheckType, VoidJournalID) joined to `PRHistoryCompensation` (CompensationDistributionID/Name, Amount). Row filter: `CheckDate BETWEEN beginDate AND endDate AND VoidJournalID = null AND CheckType != 2`. Amount = `SUM(PRHistoryCompensation.Amount) GROUP BY CompensationDistributionID, Name`. No caching — fresh query every load.

**Q12.** `CheckType != 2` excludes one internal check type. Is Type 2 the *only* internal/non-payment check type that should be excluded, or are there others we should also be filtering out?

> Your answer:

**Q13.** Neither `PRHistory` nor `PRHistoryCompensation` shows an obvious department field in the research. Is there any way — a join, a related table, a tag on the check — to break a payroll run down by department in the real data? The redesign now offers a Department filter and a per-department view; if there's genuinely no department field, that filter can't go live as designed.

> Your answer:

**Q13b (added 2026-07-16).** Drilling into a specific department now needs to show a pay-*type* breakdown — Regular, Vacation, OverTime, Sick, Double Time, Personal, Holiday, Misc, Other — instead of the paycheck-stub-style Net Pay/Fed Tax/Benefits/State Tax/Retirement/Overtime it showed before. The confirmed formula (`SUM(PRHistoryCompensation.Amount) GROUP BY CompensationDistributionID, Name`) groups by compensation distribution, which doesn't obviously map to a pay-type/earnings code. Is there a pay-type or earnings-code dimension somewhere — on `PRHistoryCompensation` itself, a related detail table, or something tied to the pay group — that this breakdown should actually be pulling from?

> Your answer:

**Q14.** The redesign adds a current-vs-prior-period comparison (e.g. "this Bi-Weekly period vs. the one before it"). Does the real system have any existing concept of "the prior pay run" to compare against, or would this always mean calculating a second date range and re-running the same aggregation query twice?

> Your answer:

**Q15.** The redesign introduces a "Pay Date" concept — the date payroll is actually issued — as the anchor a period counts backward from. Does the real payroll system already expose a distinct "Pay Date" per run (separate from `CheckDate`), or would Pay Date need to be derived from the most recent `CheckDate` in `PRHistory`?

> Your answer:

**Q16.** Monthly period is currently a flat 30-day lookback in the mockup, not a calendar-month subtraction. Does the real system pay monthly employees on a true calendar-month cycle (e.g. always the last business day of the month), which would make a calendar-month calculation more accurate than a flat 30 days?

> Your answer:

**Q17.** "Make this recurring" is a UI setting only right now — there's no backend concept behind it yet. Is there an existing scheduling/recurrence concept anywhere in the payroll module we should be hooking into, or would this need to be built from scratch?

> Your answer:

**Q18.** Drill-through to the Payroll History module — what's the actual target page, and can it be filtered to the same date range/department the widget was showing?

> Your answer:

---

## Widget 7 — Deposit Accounts

**Confirmed data source:** `DH_Account` (Active, InceptionDate) filtered by `DH_Type.BankAccountID`, joined to `DH_Transaction` for balances. Ending balance = `SUM(DH_Transaction.Amount) WHERE TransactionDate <= today`. Scoped by **Bank Account**, not Company — different from most other Finance widgets.

**Q19.** This widget is scoped by Bank Account rather than Company like most other Finance widgets. If a user has switched Company context elsewhere on the dashboard, will this widget silently show data for the wrong scope, or does Bank Account already imply a specific Company unambiguously? Worth confirming this won't look like a bug to someone used to every other widget being Company-scoped.

> Your answer:

**Q20.** The legacy balance calculation uses a custom computed property, `DHAccount.CalcBalance()`, which may apply adjustments beyond a plain transaction sum. What does `CalcBalance()` actually do differently from `SUM(DH_Transaction.Amount) WHERE TransactionDate <= today`? We need to know before trusting the simpler Modern API sum as a like-for-like replacement.

> Your answer:

**Q21.** The pie chart always shows *all* account types regardless of the table's dropdown filter — confirmed as existing/intentional behaviour, not a bug. Should that stay true in the rebuild, or is this actually worth reconsidering (the original Purpose doc's own Open Questions flags this as potentially confusing)?

> Your answer:

**Q22.** For the new Compare To filter (Last Month/Quarter/Last Year) — does the same balance formula reliably work for a *past* as-of date, or does `DH_Transaction` have any data quality issues (backdated entries, corrections) that would make a historical "as of" balance less trustworthy than today's?

> Your answer:

**Q23.** For the new 12-month Balance Trend view — how far back does `DH_Transaction` history actually go, on average, and does that vary a lot by organisation? A short history would make the trend chart look broken or misleadingly flat for newer accounts.

> Your answer:

**Q24.** For the "declining account" flag (balance fallen for 3+ consecutive months) — is three consecutive down-months a meaningful threshold in practice, or does someone who actually manages these accounts have a better sense of what should trigger a flag?

> Your answer:

---

## General / Cross-Widget Questions

**Q25.** W03's Purpose doc explicitly confirms "no caching — fresh query every time." Is that true across all four of these widgets, or do any of them cache results in a way that could show stale numbers if data changed since the last refresh?

> Your answer:

**Q26.** W01 explicitly rolls up child-company figures for consolidated organisations. Do W02, W03, or W07 have any similar multi-entity/consolidation behaviour we should know about, or are they always scoped to a single company?

> Your answer:

**Q27.** Are dollar amounts ever rounded at the row level before totals are computed (as opposed to rounding only the final displayed total)? If individual rows round independently, a table's displayed total can end up a cent or two off from summing the displayed rows — worth knowing if that's expected behaviour or something to guard against.

> Your answer:

---

*Questions prepared by Oisin Curran — July 2026, based on the Purpose docs in `Step 1 - Dashboard Research/`, the locked design docs in `Step 4 - Widget Final Design/`, and the Developer Punch List in `Step 3 - Mock_Work/`.*
