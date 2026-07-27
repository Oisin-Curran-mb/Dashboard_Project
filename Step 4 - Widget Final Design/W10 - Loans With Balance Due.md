# W10 — Loans With Balance Due

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W10-Loans-With-Balance-Due.md](../Step%203%20-%20Mock_Work/Widget_Specs/W10-Loans-With-Balance-Due.md)
**Data source & formulas:** [Step 1 - Dashboard Research/10 - Loans With Balance Due.md](../Step 1 - Dashboard Research/10%20-%20Loans%20With%20Balance%20Due.md)
**Confluence dossier:** none yet
**Last verified against build:** not yet audited

> **Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a written source document (name it) · `[TO CONFIRM]` assumed, with the named owner who can confirm. Claims with no mark are template boilerplate only.

## Purpose
Shows all outstanding loans with remaining balances, their types, and current repayment status, helping finance staff monitor loan obligations and flag any in arrears.

Evidence notes: the loans shown, their balances, and their types are backed by the Step 1 research [DOC - Step 1 research]. "Current repayment status" rests on the Status (Active / In Arrears) concept, which has no confirmed backing field in the source data [TO CONFIRM - owner TBD] (see Data Contract). The Ben Lane interview also questions whether the arrears concept matters to users at all (see the Interview Q&A appendix and Sign-off Readiness).

## How Other Companies Fulfil This Purpose
- Loan aging dashboards use **bar charts by age bucket**, with delinquency KPIs and colour-coded severity (green = healthy, red = default risk) ([FasterCapital](https://fastercapital.com/content/Loan-Data-Visualization--How-to-Use-Charts-and-Dashboards-to-Communicate-Your-Loan-Performance-Insights.html)).
- **Card-style layouts are not a pattern found for loan-aging data** in the sources reviewed — cards show up for benefits/status widgets, not financial aging data, where bars and tables are consistently preferred.

**Net assessment:** the design below (bars + table) matches the standard directly; the one option not carried forward (cards) wasn't supported by the research either.

## Data Contract

All rows below are sourced from the Step 1 research doc, which was itself confirmed correct against the legacy `LoansWithBalanceDue : DataPanelControl` class (`/LoanProcessing`) via `Widget_Comparison_Classic.html`, 2026-07-08. The widget only shows loans that have at least one invoice and a remaining balance due [DOC - Step 1 research].

| Field / value shown | Source table / endpoint | Formula / logic | Evidence |
|---|---|---|---|
| Loan rows | `LN_Loan` (individual loan records, scoped by Bank Account) | Loan/table filter: `AmountDue > 0`, `ORDER BY Name, AccountNumber` | [DOC - Step 1 research] |
| Balance Due per loan (AmountDue) | `LN_InvoicePost` (invoice/posting records associated with each loan, including invoice date) | `AmountDue = SUM(Principal + Interest)` across a loan's invoices, minus all payments that have already been posted | [DOC - Step 1 research] |
| Loan Type filter values | `LN_Type` | Loan type categories are set up by the organisation, not a fixed list; whatever loan types have been created in the system will appear | [DOC - Step 1 research] |
| Aging buckets | Derived from invoice ages plus posted payments | See "Aging bucket calculation" below | [DOC - Step 1 research] |
| KPI headline: **Total Balance Due ($)** | Derived | Across all loans; follows from the AmountDue formula above summed over all qualifying loans. The org-wide summation itself is not spelled out in any source | [DOC - Step 1 research] for AmountDue; summation [TO CONFIRM - owner TBD] |
| Status (Active / In Arrears): filter value and status badge in both views | No confirmed source | No explicit active/arrears field found in the source data; overdue-ness today is only derived from the aging buckets | [TO CONFIRM - owner TBD] |
| Original column (Summary Table view) | Not documented | The Step 1 research does not document an original-loan-amount field | [TO CONFIRM - owner TBD] |
| Next Payment column (Summary Table view) | Not documented | Step 1 documents a "date of last payment" column in the legacy table, not a next-payment date | [TO CONFIRM - owner TBD] |
| Date of last payment (legacy table column) | Shown in the legacy table per Step 1; the backing field is not named there | Not carried forward into this design's Summary Table column list | [DOC - Step 1 research] |

**Aging bucket calculation, legacy behaviour** [DOC - Step 1 research], quoted from Step 1: "each loan starts with 4 age buckets populated by invoice age (Current/30/60/Over 60). Each **posted payment is then subtracted starting from the oldest bucket (index 3, 'Over 60') working backward toward the newest (index 0, 'Current')** — i.e. payments pay off the oldest debt first. If a bucket goes negative, the overflow amount carries into the next (newer) bucket. This Last-In-First-Out payment application is why the buckets don't simply equal 'sum of unpaid invoices in that age range.'"

**Decided:** the aging bucket calculation must replicate the legacy system's oldest-first payment allocation (payments clear the oldest overdue bucket before rolling into newer ones), not the Modern API's simpler current bucketing. This isn't carrying forward a legacy quirk — it's confirmed as the actual industry standard for both AR and loan-servicing payment application ([LegalClarity](https://legalclarity.org/how-to-prepare-an-accounts-receivable-schedule/), [Bill.com](https://www.bill.com/blog/accounts-receivable-best-practices), [Sallie Mae](https://www.salliemae.com/student-loans/manage-your-private-student-loan/understand-student-loan-payments/apply-and-allocate-your-student-loan-payments/)), so the Modern API's current approach is the one that's out of step, not the old design. Everything else already confirmed as available on the Modern API side (filters API, grid/chart endpoints, the KPI headline below) stays as designed — this is a targeted fix to one calculation, not a rebuild of the widget.

Terminology note: Step 1 labels the legacy behaviour "Last-In-First-Out" while the decision above calls it "oldest-first payment allocation"; both describe the same mechanics (payments applied to the oldest bucket first), so this is a naming difference between sources, not a data conflict.

**Critical Modern API gap** [DOC - Step 1 research]: the Modern API does **not** replicate the LIFO payment-application logic at all — it just buckets invoices by raw age (`today − InvoiceDate`) with no payment subtraction. **The aging totals shown by a Modern API build of this widget will not match the legacy numbers.** Step 1 calls this the single most consequential data-accuracy gap found in the whole comparison exercise, to flag prominently before this widget is rebuilt, since the aging chart is the whole point of the (legacy) widget. Appears in Sign-off Readiness below.

- **Favourability/direction logic:** In Arrears loans (or the 90+ day bucket, pending Status field confirmation) are always shown in red/amber regardless of view (see Fine-Tuning Notes). No further good-vs-bad convention is documented for this widget.
- **Rounding/currency/locale:** values are currency amounts. Rounding rules not specified in any source.
- **"Data as of" freshness behaviour:** loan balance due is an as-of-today snapshot (see Filters). Whether a "data as of" stamp is shown: not specified in any source.

## Widget States

| State | Behaviour |
|---|---|
| No module rights / entitlement | *Not yet specified; needs a pass.* Nothing in the sources covers Loan Processing entitlement behaviour. |
| Empty (org has no loans with a balance due) | Only loans that have at least one invoice and a remaining balance due appear [DOC - Step 1 research]. What the widget renders when no loans qualify: *Not yet specified; needs a pass.* |
| Partial (some loan types or fields missing) | *Not yet specified; needs a pass.* |
| Loading | *Not yet specified; needs a pass.* |
| Error / API failure | *Not yet specified; needs a pass.* |
| Stale data | Refresh icon present at every size (see Refresh). Balance due is an as-of-today snapshot. Whether there is a "data as of" signal: *Not yet specified; needs a pass.* |

## Interaction Spec

This widget is read-only in both views. No approve/edit style actions are documented in any source, so no confirmation/success/failure/undo flows apply unless the drill-through below turns into one when its target is confirmed.

| Interaction | Behaviour | Evidence |
|---|---|---|
| Account name click (table) | Account names in the table appear as links; it is not yet confirmed where these navigate to (see Drill-Through) | [DOC - Step 1 research] |
| Chart hover (legacy pie) | Hovering over a pie segment shows the balance for that age bucket | [DOC - Step 1 research] |
| Bar hover (View 1, Balance Bars) | *Not yet specified; needs a pass.* The legacy pie hover above is the only documented hover behaviour | |
| Row click beyond the account-name link | *Not yet specified; needs a pass.* | |
| Switch View toggle | Available at Medium and Large; not at Small or KPI (see Size behaviour) | |
| Keyboard/focus behaviour for links, view switch, filters | *Not yet specified; needs a pass.* | |

## Filters
| Filter | Values |
|--------|--------|
| Loan Type | All Types · dynamic list |
| Status | All · Active · In Arrears — **flagged as unconfirmed**: no explicit active/arrears field found in the source data; overdue-ness today is only derived from aging buckets. Needs backend confirmation before build. |

No Fiscal Year filter — loan balance due is an as-of-today snapshot. The Loan Type filter narrows the **table only**; the pie/bar chart always shows all loan types (matches old design).

**Aging bucket labels fixed for clarity:** Current (0–29) · 30–59 · 60–89 · 90+ (the old labels "60" and "Over 60" were misleading).

Open filter items mined from the Step 3 spec [DOC - Step 3 spec], both carried into Sign-off Readiness below:
- "**Fiscal Year filter — dropped, flagged as a question for the dev team** (same resolution as W05 Receivable Invoices Outstanding): loan balance due is an as-of-today snapshot with no fiscal-year dimension in the old design. **Raise with backend/dev:** is a fiscal-year-scoped filter on loan origination date worth adding later?"
- "**KPI size (3-dot menu):** No time filter exists for this widget (Fiscal Year was dropped) — same exception as W05. KPI size shows Loan Type only, or no filter at all — flag for the wider Hard Rules review."

## Data Table Sort
Fixed — Name, then Account Number. Not user-changeable.

Trimmed-view rule: Small shows the top 3 loans and Medium the top 5 (see Size behaviour). No source states which measure ranks that top N; the fixed Name-then-Account-Number order is a whole-table sort, and an alphabetical top N would not be a meaningful trim. *Not yet specified; flagged in Sign-off Readiness.*

## Drill-Through
**Existing link, target unconfirmed:** account names are already clickable in the table, but the destination isn't confirmed. Treat as an existing feature needing its target confirmed, not a new feature to design.

## Refresh
Standalone icon, present at every size including KPI.

---

## Views (Switch View)

### View 1 — Balance Bars *(default)*
Horizontal bar per loan, showing outstanding balance — length makes relative balances immediately comparable.

### View 2 — Summary Table
Loan Name · Type · Original · Balance Due · Status · Next Payment, totals row. Sort per Data Table Sort above.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Active view, top 3 loans, no Switch View |
| **Medium (2×2)** | Active view, top 5 loans + type labels; Switch View available |
| **Large (4×4)** | Active view, all loans + status badges + totals row; Switch View available |
| **KPI (1×0.5)** | Headline: **Total Balance Due ($)**, across all loans. No download, no switch. |
| **Expanded** | Active view, full detail, all filters live in the modal |

---

## Accessibility

Required (project baseline commitments, stated per widget):
- Colour is never the only signal: the red/amber In Arrears treatment must be paired with a text label or icon (the Status badge text may already satisfy this; confirm). *Not yet reviewed against the build.*
- Chart values exist as text in the DOM (sr-only or visible table), not hover-only; this applies to the Balance Bars values and any bucket or total figures. *Not yet reviewed against the build.*
- Table semantics are real (`th`/scope), and interactive controls (account-name links, view switch, filters) are reachable by keyboard. *Not yet reviewed against the build.*

## What Got Cut (and why)
- **Balance Cards option** — dropped. Card layouts aren't a standard pattern for loan-aging financial data anywhere in the competitor research; bars and tables are consistently preferred for this data type.
- **"Count of loans 90+ days overdue" as the KPI headline** — dropped along with the Cards option it belonged to, in favour of **Total Balance Due ($)** for consistency with the rest of the dashboard. The "In Arrears" concept still shows as a status badge in both remaining views regardless.

## Sign-off Readiness

| # | Open item | Type | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | Status field: "flagged as unconfirmed: no explicit active/arrears field found in the source data; overdue-ness today is only derived from aging buckets. Needs backend confirmation before build." (see Filters and Data Contract [TO CONFIRM]) | Field | Backend team (not yet named) | Yes, per this doc's own flag: needs backend confirmation before build |
| 2 | Interview finding (Ben Lane, 13.07.2026): HQs don't actually expect these loans to be repaid on a schedule at all ("we give them a loan, but we don't really expect them to pay it back... we just want to know what the balance of the loan is"), described as functioning more like a donation than a loan. This may mean the Status: All · Active · In Arrears filter is modelling a distinction that doesn't really matter to users, since nobody appears to be tracking these as overdue in practice. "Worth confirming directly before investing more design/dev effort in the arrears concept." (See Interview Q&A appendix, "not yet reflected in the design above") | Product decision | Not yet assigned | Possibly, product decision |
| 3 | Drill-through: account names are already clickable in the table, but the destination isn't confirmed; treat as an existing feature needing its target confirmed, not a new feature to design | Field / navigation | Not yet assigned | Not stated |
| 4 | Fiscal Year filter, dropped from this design: "Raise with backend/dev: is a fiscal-year-scoped filter on loan origination date worth adding later?" [DOC - Step 3 spec] | Product decision | Backend/dev (not yet named) | No (dropped from this design; future ask) |
| 5 | Modern API aging gap: the Modern API does not replicate the legacy oldest-first (LIFO) payment application, so aging totals will not match legacy numbers; this doc has decided the legacy calculation must be replicated (see Data Contract), which makes this a targeted backend fix | Math / API | Backend team (not yet named) | Yes for anything aging-derived (including the arrears colour rule); Step 1 calls it the single most consequential data-accuracy gap in the whole comparison exercise |
| 6 | Where the renamed aging buckets (Current (0–29) · 30–59 · 60–89 · 90+) actually surface in the two kept views is not stated in this doc; today they only drive the derived arrears/90+ colour rule | Spec gap | Design (this doc) | Not stated |
| 7 | Original and Next Payment columns (Summary Table) have no documented source field in the Step 1 research (see Data Contract [TO CONFIRM] rows) | Field | Not yet assigned | Not stated |
| 8 | Trimmed sizes: which measure ranks the top 3 (Small) / top 5 (Medium) loans is unspecified (see Data Table Sort) | Spec gap | Design (this doc) | Not stated |
| 9 | KPI-size filter behaviour: "KPI size shows Loan Type only, or no filter at all — flag for the wider Hard Rules review" [DOC - Step 3 spec] | Product decision | Not yet assigned | No |
| 10 | Widget States: no-rights, empty, partial, loading, error, and stale rows are unspecified | Spec gap | Design (this doc) | Not stated |
| 11 | Interaction Spec: bar hover content, row click, and keyboard rows are unspecified | Spec gap | Design (this doc) | Not stated |

This doc has 11 open items; it is not sign-off-ready until this table is empty or every row is explicitly accepted as a known risk.

## Fine-Tuning Notes
- In Arrears loans (or the 90+ day bucket, pending Status field confirmation) always shown in red/amber regardless of view
- Status filter should change which loans appear, not just highlight them — pending confirmation the field exists [DOC - Step 3 spec, mined from its Fine-Tuning Notes]

---

## Interview Q&A (Ben Lane, 13.07.2026)

Source: [Ben Lane Interview - Tagged Q&A by Widget (2026-07-13).md](../Step%202%20-%20Feedback/Ben%20Lane%20Interview%20-%20Tagged%20Q%26A%20by%20Widget%20%282026-07-13%29.md). Full detail and transcript quotes in [UX Specialist Questions - Master Tracker.md](../Step%202%20-%20Feedback/UX%20Specialist%20Questions%20-%20Master%20Tracker.md), Q25, Q26, Q53.

**Q: What types of loans typically appear here in a church context?**
A: Loans from headquarters (e.g. a Methodist Conference) to individual churches — typically for building repairs like a new roof — not bank mortgages, equipment leases, or vehicle loans. — *Confirms the "Loan Type" filter should be modelled around HQ-to-church internal loans, not third-party bank loan types.*

**Q: Is the key number the remaining balance, the monthly payment, or term remaining?**
A: Remaining balance. — *Confirms Total Balance Due ($) as the right KPI headline — matches the decision already made under "What Got Cut" above.*

**Q: The aging labels currently show "Over 60" but actually mean 90+ days — should that be fixed in the redesign?**
A: Yes, confirmed as a mislabeling that should be corrected. — *This fix is already implemented in this widget's design ("Aging bucket labels fixed for clarity... the old labels '60' and 'Over 60' were misleading" — see Filters above) — this answer confirms that decision was correct, not a new requirement.*

**Important, not yet reflected in the design above:** Ben's fuller answer on the aging question suggests HQs don't actually expect these loans to be repaid on a schedule at all — "we give them a loan, but we don't really expect them to pay it back... we just want to know what the balance of the loan is" — described in the interview as functioning more like a donation than a loan. This may mean the **Status: All · Active · In Arrears** filter (flagged above as "unconfirmed — no explicit active/arrears field found") is modelling a distinction that doesn't really matter to users, since nobody appears to be tracking these as overdue in practice. Worth confirming directly before investing more design/dev effort in the arrears concept.
