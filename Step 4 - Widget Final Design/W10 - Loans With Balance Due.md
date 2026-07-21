# W10 — Loans With Balance Due

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W10-Loans-With-Balance-Due.md](../Step%203%20-%20Mock_Work/Widget_Specs/W10-Loans-With-Balance-Due.md)
**Data source & formulas:** [Step 1 - Dashboard Research/10 - Loans With Balance Due.md](../Step 1 - Dashboard Research/10%20-%20Loans%20With%20Balance%20Due.md)

## Purpose
Shows all outstanding loans with remaining balances, their types, and current repayment status, helping finance staff monitor loan obligations and flag any in arrears.

## How Other Companies Fulfil This Purpose
- Loan aging dashboards use **bar charts by age bucket**, with delinquency KPIs and colour-coded severity (green = healthy, red = default risk) ([FasterCapital](https://fastercapital.com/content/Loan-Data-Visualization--How-to-Use-Charts-and-Dashboards-to-Communicate-Your-Loan-Performance-Insights.html)).
- **Card-style layouts are not a pattern found for loan-aging data** in the sources reviewed — cards show up for benefits/status widgets, not financial aging data, where bars and tables are consistently preferred.

**Net assessment:** the design below (bars + table) matches the standard directly; the one option not carried forward (cards) wasn't supported by the research either.

## Filters
| Filter | Values |
|--------|--------|
| Loan Type | All Types · dynamic list |
| Status | All · Active · In Arrears — **flagged as unconfirmed**: no explicit active/arrears field found in the source data; overdue-ness today is only derived from aging buckets. Needs backend confirmation before build. |

No Fiscal Year filter — loan balance due is an as-of-today snapshot. The Loan Type filter narrows the **table only**; the pie/bar chart always shows all loan types (matches old design).

**Aging bucket labels fixed for clarity:** Current (0–29) · 30–59 · 60–89 · 90+ (the old labels "60" and "Over 60" were misleading).

**Decided:** the aging bucket calculation must replicate the legacy system's oldest-first payment allocation (payments clear the oldest overdue bucket before rolling into newer ones), not the Modern API's simpler current bucketing. This isn't carrying forward a legacy quirk — it's confirmed as the actual industry standard for both AR and loan-servicing payment application ([LegalClarity](https://legalclarity.org/how-to-prepare-an-accounts-receivable-schedule/), [Bill.com](https://www.bill.com/blog/accounts-receivable-best-practices), [Sallie Mae](https://www.salliemae.com/student-loans/manage-your-private-student-loan/understand-student-loan-payments/apply-and-allocate-your-student-loan-payments/)), so the Modern API's current approach is the one that's out of step, not the old design. Everything else already confirmed as available on the Modern API side (filters API, grid/chart endpoints, the KPI headline below) stays as designed — this is a targeted fix to one calculation, not a rebuild of the widget.

## Data Table Sort
Fixed — Name, then Account Number. Not user-changeable.

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

## What Got Cut (and why)
- **Balance Cards option** — dropped. Card layouts aren't a standard pattern for loan-aging financial data anywhere in the competitor research; bars and tables are consistently preferred for this data type.
- **"Count of loans 90+ days overdue" as the KPI headline** — dropped along with the Cards option it belonged to, in favour of **Total Balance Due ($)** for consistency with the rest of the dashboard. The "In Arrears" concept still shows as a status badge in both remaining views regardless.

## Fine-Tuning Notes
- In Arrears loans (or the 90+ day bucket, pending Status field confirmation) always shown in red/amber regardless of view

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
