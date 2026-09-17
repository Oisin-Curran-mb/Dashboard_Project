# W10 — Loans With Balance Due

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W10-Loans-With-Balance-Due.md](../Step%203%20-%20Mock_Work/Widget_Specs/W10-Loans-With-Balance-Due.md)
**Data source & formulas:** [Step 1 - Dashboard Research/10 - Loans With Balance Due.md](../Step 1 - Dashboard Research/10%20-%20Loans%20With%20Balance%20Due.md)
**Confluence dossier:** [Loans With Balance Due (Confluence pull 2026-07-27).html](../Step%206%20-%20Sign%20off%20document/Loans%20With%20Balance%20Due/Loans%20With%20Balance%20Due%20%28Confluence%20pull%202026-07-27%29.html) (Confluence page 7372046373, Part A/B/C, 14 sections). No `Reconciliation - Loans With Balance Due.md` exists yet, so none of Jo's flags in it have an Accepted / Rejected / Disputed status recorded.
**[v3.1 — 2026-08-30, owner report: "the smaller screen is missing the toggle for the pie chart"] Explore gains a Table / Pie toggle, and the range ladder is always shown in full.** Two misses on v3.0. (1) **The 61-90 range was invisible:** both the pie legend and the Explore chip row listed only ranges holding a balance, so the band added by the C1 fix vanished and the ladder looked incomplete. Legend and chips now walk the full ladder in order, a range with no balance rendering as a muted, inert row reading $0. Arcs are still drawn only for ranges that hold a balance, because a zero slice has no geometry, and an empty range is deliberately **not** a filter control since it could only ever produce an empty table. (2) **Explore had no route to the pie at all:** v3.0 gave Explore the chip filter and left the pie at Detail only. Explore now carries a **Table / Pie** segment in the header's existing toggle slot, Table default, the chip filter riding with the table view while the pie carries its own filter in its legend. Detail still has no toggle, because it shows both at once. Also corrected: a v3.0 driver assertion demanded empty ranges be *absent* from the pie, which contradicted this fix; it now asserts they carry no arc instead. `FC_VERSION[10]` = 3.1.

**[v3.0 — 2026-08-30, per direct instruction] Aging panel replaced by a time-range PIE; table is flat; Days past due column removed.** The right-hand "Aging and risk" panel is gone, replaced by a donut of balance by time range whose legend rows **are** the table filter; at Explore the same filter appears as a chip row (6 columns cannot hold a legible pie beside a table). The table is **one flat list**: band group headers and per-band subtotals removed, the bands being a filter now rather than a grouping. **Days past due** is removed as a column, **Last payment** kept with its dormancy flag, and the default sort moved from `days-desc` to `amt-desc` since the old default sorted on a column that no longer exists. **The drill modal is untouched** per instruction and still reports days past due. `loanFAgingPanel` and `loanFDaysCell` stay defined but uncalled (rollback pattern). **Item C1 fixed:** the ladder skipped 61-89, so those loans fell through to the `hi:Infinity` band and would have been labelled "90+ days"; a **61-90 days** band closes it. ⚠️ Correction to an earlier description: this was latent in code, NOT visible on screen, because the mock data holds no loan between 61 and 89 days (values are 6, 22, 44, 58, 95, 145). **Gate:** Sign-off rows 1 and 5 waived by the owner for this build only; both stay open and blocking. Feargal's **B3 remains HELD pending C2** and this build does not pre-empt it. Verified: 68-assertion driver 0 failures (including an 11-value bucket regression test), chart-fill-check clean across five container widths, split-selector and scope guards clean. `FC_VERSION[10]` = 3.0.

**[2026-08-25, Feargal call] ⚠️ HELD, NOT BUILT: remove date-based and past-due calculation. This contradicts the built Final, so it needs a deliberate go-ahead.**

**What Feargal said.** The loan-entry process **does not provide start and end dates**, and these loans function more like **assistance or charitable loans**. So date-based and past-due calculations should be removed, and the view should retain **amount due, last payment, loan type**, and only aging that real data actually supports. He agreed the reduced view is sufficient because the feature is not heavily used.

**Why it is held rather than done.** The `loanF` Final (v2.0, 2026-08-11, driver-verified) is built **around** aging: four bands in severity order, an aging-band table filter, days-past-due per loan, a dormancy flag for no payment in over 90 days, a portfolio-risk read and a most-overdue collections list. Removing date logic removes most of the widget's structure. That is a rebuild, not an edit, and it deserves a composition conversation rather than being inferred from meeting notes.

**Why it is probably right anyway.** Two independent sources now agree. Ben Lane (13.07.2026): "we give them a loan, but we don't really expect them to pay it back... we just want to know what the balance is", and "it's more of a donation than a loan". Feargal has now confirmed the same thing from the **data** side, which is the stronger claim: not that the aging is unhelpful, but that the dates it rests on **do not exist**. If that holds, the current aging bands are computed from assumed dates, which would make them fabricated rather than merely unnecessary.

**Also relevant, already on file:** this widget's own build notes record that Jo's bands (Current / 1-30 / 31-60 / 90+) differ from the Step 4 doc's (Current 0-29 / 30-59 / 60-89 / 90+), and that the aging totals require the legacy oldest-first payment allocation to be rebuilt server-side. If the dates are not real, that whole thread becomes moot.

**Next step:** confirm with Feargal, then rebuild as a simple balance view. Tracked as item C2 in `Step 2 - Feedback/Feargal Call - Action List (2026-08-25).md`.

**Last verified against build:** the build is now **Final v3.1** (`FC_VERSION[10]` = 3.1). The v3.1 changelog records browser verification of the new toggle and the full ladder, and an amended empty-range pie assertion, but **does not state a driver assertion count or a pass/fail total for v3.1** [TO CONFIRM - owner], so no v3.1 verification figures are claimed here. Previous, fully recorded: 2026-08-30 via build-final-widget driver + final-check-rules.py (**Final v3.0**: 68-assertion Node DOM-shim driver, 0 failures; chart-fill-check.js measured clean at five container widths; 2 HIGH gate findings waived by the owner for that build only). Before that: 2026-08-11 (Final v2.0, 1-to-1 Jo copy, 17-assertion driver)

> **Final Design as built 2026-08-11 (v2.0), superseded by the v3.0 and v3.1 banners above.** Kept for the record; where this paragraph and those banners disagree, the banners describe what is actually built. The v2.0 Final was a 1-to-1 copy of Jo Lopez's Widget Container Demo Loans With Balance Due widget, built into the Final Check tab as `opt==='F'` in `WRENDER[10]` (prefix `loanF`), per direct owner instruction. It renders at three sizes only, in Jo's model and order **Glance / Explore / Detail** (Rule 12, no Small): Glance = a total-balance-due card with a past-due pill and a compact amethyst aging bar; Explore = the loan-type-filtered header plus the loans table grouped into aging bands with subtotals; Detail = that table alongside an aging-and-risk side panel (clickable aging bands that filter the table, a portfolio-risk read, and a most-overdue collections list). KPI headline is **Total Balance Due**. Filter is Loan Type only. The loan-detail drill modal, the aging-band hover card, and the empty/loading states are all Jo's, ported verbatim. Full composition mapping, driver results, and backend caveats: Widget_Specs/W10-Loans-With-Balance-Due.md, "2026-08-11 FINAL build" entry. The older Small/Medium/Large/KPI size model and the Balance Bars vs Summary Table view split below are superseded by this build and kept in Design History at the end of this doc.

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

**[2026-08-11] Loan-detail drill modal data (confirmed in code).** The built Final's loan-detail popup (Jo's, ported 1-to-1) is fully backed by real tables in the MBAccounting `LN` (Loans) module. There is no drill in the widget today, so this modal is a NEW query, but every field it needs already exists:

| Modal field | Source | Notes | Evidence |
|---|---|---|---|
| Loan summary (account, name, type, balance, rate, schedule, dates) | `LNLoan` (`AccountNumber`, `Name`, `TypeID` → `LNType`, `TotalAmount`, `InvoicedPrincipal`/`InvoicedInterest`, `PaidPrincipal`/`PaidInterest`, `InterestRate`, `PaymentAmount`, `PaymentsPerYear`, `NumberPayments`, `FirstPaymentDate`, `InceptionDate`, `BalloonDate`) | Rich summary all present on one row | [CODE — LNLoan] |
| Borrower | `LNLoan.PersonID` (int) → `CorePerson` | The borrower is a **person** record (like the remittance pledge name), so a person name | [CODE — LNLoan.PersonID → CorePerson] |
| Payment history (the list in the modal) | `LNPayment`, one row per payment on the loan (`LoanID`) | `PaymentDate` (Date), `CheckNumber` (Reference); the amount is a **composed breakdown** = `Principal` + `Interest` + `LateFee` (+ `AdditionalPrincipal`/`AdditionalDraw`, − `Adjustment`), not a single column; count only `Posted = true AND VoidJournalID IS NULL` (same consistency filter as remittance) | [CODE — LNPayment] |
| Balance / days past due | `LNInvoice` (+ `LNInvoicePost`) netted against `LNPayment` | Scheduled principal/interest per invoice vs payments; the aging bucketing needs the oldest-first allocation (see the LIFO decision above / the Modern-API gap) | [CODE — LNInvoice/LNInvoicePost] |

So the drill popup's information is real, not invented: summary from `LNLoan`, payment history from `LNPayment`, balance/aging from `LNInvoice`. Two things for the dev: the per-payment amount is a composed figure (decide whether to show the total or the Principal/Interest/LateFee breakdown), and posted/non-void filtering applies.

## Widget States

| State | Behaviour |
|---|---|
| No module rights / entitlement | *Not yet specified; needs a pass.* Nothing in the sources covers Loan Processing entitlement behaviour. |
| Empty (org has no loans with a balance due) | Only loans that have at least one invoice and a remaining balance due appear [DOC - Step 1 research]. **As built** (`loanFEmpty`): Explore and Detail render a "Nothing outstanding" state with a `task_alt` icon and the sub line that no loans currently carry a balance; Glance renders "All settled" with a `check_circle` icon in place of the headline figure [BUILD]. |
| Partial (some loan types or fields missing) | *Not yet specified; needs a pass.* |
| Loading | **As built** (`loanFSkeleton`): the header block renders in its loading mode above a five row skeleton table of shimmer bars, so the chrome stays in place while the rows resolve [BUILD]. |
| Error / API failure | *Not yet specified; needs a pass.* |
| Stale data | Refresh icon present at every size (see Refresh). Balance due is an as-of-today snapshot. Whether there is a "data as of" signal: *Not yet specified; needs a pass.* |

## Interaction Spec

This widget is read-only in both views. No approve/edit style actions are documented in any source, so no confirmation/success/failure/undo flows apply unless the drill-through below turns into one when its target is confirmed.

| Interaction | Behaviour | Evidence |
|---|---|---|
| Account name click (table) | Account names in the table appear as links; it is not yet confirmed where these navigate to (see Drill-Through) | [DOC - Step 1 research] |
| Loan-detail drill modal (built Final) **[2026-08-11]** | Clicking a loan opens a loan-detail modal: loan summary + per-loan payment history + Open loan / Record a contact actions. The modal's data is confirmed real (summary `LNLoan`, payment history `LNPayment`, balance/aging `LNInvoice`; see Data Contract). The "Open loan" out-destination is still a stub pending a confirmed target | [BUILD]; data [CODE — LN module]; out-destination [TO CONFIRM] |
| Chart hover (legacy pie) | Hovering over a pie segment shows the balance for that age bucket | [DOC - Step 1 research] |
| Bar hover (View 1, Balance Bars) | *Not yet specified; needs a pass.* The legacy pie hover above is the only documented hover behaviour | |
| Row click beyond the account-name link | *Not yet specified; needs a pass.* | |
| Table / Pie segment | Explore only, in the header's existing toggle slot, Table default (v3.1). Detail shows the table and the donut together and carries no toggle; Glance has no controls. The chip filter rides with the table view, the pie carrying its own filter in its legend (see Size behaviour) | [BUILD] |
| Keyboard/focus behaviour for links, view switch, filters | *Not yet specified; needs a pass.* | |

## Filters
| Filter | Values |
|--------|--------|
| Loan Type | All Types · dynamic list |
| Status | **Not built.** Proposed as All · Active · In Arrears, but no explicit active/arrears field exists in the source data, so it was never implemented: the built Final has no Status filter (`LOANF_STATE` carries loan type, sort, range and view only). Overdue-ness today is derived from the aging ranges alone. Stays open and blocking as Sign-off Readiness row 1, pending backend confirmation that a backing field exists. |

No Fiscal Year filter — loan balance due is an as-of-today snapshot.

**As built, the Loan Type filter drives everything, not just the table.** `loanFBuckets` derives the range breakdown from `loanFFiltered(w)`, so the time-range pie, the Explore chip counts, the header total, the past-due pill and the Glance aging bar all re-read against the selected loan type. The legacy behaviour (filter narrows the table only, chart keeps showing all loan types) is **not** carried forward: it is the filter-affects-table-only antipattern Jo's dossier flags at 11.3 and asks to be fixed consistently across Loans, Deposit Accounts and Accounts Payable.

**Aging range ladder as built (v3.0, C1 fix):** Current (not yet due) · 1-30 days · 31-60 days · 61-90 days · 90+ days, five ranges in severity order (`LOANF_BUCKETS`). "Current" means not yet due (`hi:0`), not 0-29 days. The 61-90 range was added by the C1 fix to close a gap where loans between 61 and 89 days fell through to the `hi:Infinity` band and would have been labelled "90+ days". The legend and the Explore chip row walk the full ladder in order, a range holding no balance rendering as a muted, inert row reading $0; arcs are drawn only for ranges that hold a balance. This supersedes the earlier four band proposal of Current (0-29) / 30-59 / 60-89 / 90+, which was never built (the old legacy labels "60" and "Over 60" were the thing that proposal set out to fix, and the built ladder fixes it differently).

Open filter items mined from the Step 3 spec [DOC - Step 3 spec], both carried into Sign-off Readiness below:
- "**Fiscal Year filter — dropped, flagged as a question for the dev team** (same resolution as W05 Receivable Invoices Outstanding): loan balance due is an as-of-today snapshot with no fiscal-year dimension in the old design. **Raise with backend/dev:** is a fiscal-year-scoped filter on loan origination date worth adding later?"
- "**KPI size (3-dot menu):** No time filter exists for this widget (Fiscal Year was dropped) — same exception as W05. KPI size shows Loan Type only, or no filter at all — flag for the wider Hard Rules review."

## Data Table Sort
**As built: user-sortable.** The Explore/Detail table header carries sort buttons on **Account / Borrower / Last payment / Amount due**, and the default is **Amount due descending** (`LOANF_STATE.loanSort = 'amt-desc'`). The default moved off `days-desc` at v3.0 because Days past due is no longer a column, so a user could neither see nor reverse that sort.

*Superseded:* the earlier design specified a fixed Name-then-Account-Number order, not user-changeable.

Trimmed-view rule: Small shows the top 3 loans and Medium the top 5 (see Size behaviour). No source states which measure ranks that top N; the fixed Name-then-Account-Number order is a whole-table sort, and an alphabetical top N would not be a meaningful trim. *Not yet specified; flagged in Sign-off Readiness.*

## Drill-Through
**Existing link, target unconfirmed:** account names are already clickable in the table, but the destination isn't confirmed. Treat as an existing feature needing its target confirmed, not a new feature to design.

## Refresh
Standalone icon, present at every size including KPI.

---

## Views (Switch View) — superseded, kept for the record

**Not what is built.** The Balance Bars / Summary Table split below is not in the built Final. The only view switch that exists is the **Table / Pie** segment added at Explore in v3.1 (Table default); Detail shows table and pie together and carries no toggle. The two views below are retained as history only.

### View 1 — Balance Bars *(default)*
Horizontal bar per loan, showing outstanding balance — length makes relative balances immediately comparable.

### View 2 — Summary Table
Loan Name · Type · Original · Balance Due · Status · Next Payment, totals row. Sort per Data Table Sort above.

### Size behaviour (current, Rule 12 — Glance / Explore / Detail, no Small)
| Size | Behaviour |
|------|-----------|
| **Glance** (Jo's KPI tier) | Total Balance Due headline with a past-due / All current pill and a compact amethyst aging bar. No filter, download, or switch. |
| **Explore** (Jo's `wide`) | Loan-type filter chip; total + past-due pill + one context line; a **Table / Pie** segment in the header toggle slot, Table default (v3.1). *Table view:* a time-range chip row (the full ladder, ranges holding no loans shown muted and inert) filtering **one flat** loans table with a cross-footed total and sortable columns (Account / Borrower / Last payment / Amount due). *Pie view:* the same balance-by-time-range donut used at Detail, carrying its own filter in its legend. No band grouping, no per-band subtotals, no Days past due column. |
| **Detail** (Jo's `xwide`) | The flat loans table alongside a "Balance by time range" donut whose legend rows **are** the table filter. No view toggle at Detail, since both are shown at once. The former aging-and-risk side panel (clickable aging bands, Portfolio risk read, Most overdue borrowers collections list) is gone as of v3.0; `loanFAgingPanel` stays defined but unreachable as a one-line rollback. |

The old Small / Medium / Large / KPI table is in Design History below.

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
| 3 | Drill-through: the in-widget loan-detail modal's DATA is now confirmed available in code (`LNLoan` + `LNPayment` + `LNInvoice`, see Data Contract 2026-08-11) so the popup itself is buildable; what remains unconfirmed is the drill-OUT destination for the "Open loan" / clickable account name (a stub today), an existing feature needing its target confirmed, not a new feature to design | Field / navigation | Not yet assigned | Not stated |
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
A: Yes, confirmed as a mislabeling that should be corrected. — *The built ladder fixes it: the legacy "60" and "Over 60" labels are gone, replaced by Current (not yet due) / 1-30 / 31-60 / 61-90 / 90+ days (see "Aging range ladder as built" under Filters above). This answer confirms the correction was right, not a new requirement. Note the built ladder is not the four band relabel this doc originally proposed.*

**Important, not yet reflected in the design above:** Ben's fuller answer on the aging question suggests HQs don't actually expect these loans to be repaid on a schedule at all — "we give them a loan, but we don't really expect them to pay it back... we just want to know what the balance of the loan is" — described in the interview as functioning more like a donation than a loan. This may mean the **Status: All · Active · In Arrears** filter (flagged above as "unconfirmed — no explicit active/arrears field found") is modelling a distinction that doesn't really matter to users, since nobody appears to be tracking these as overdue in practice. Worth confirming directly before investing more design/dev effort in the arrears concept.

---

# Design History (superseded — kept for the record)

## Size model and view split before the 2026-08-11 Final build
Superseded by the 1-to-1 Jo Final (Glance / Explore / Detail, Rule 12) described in the Final Design (current) banner at the top. Kept verbatim for the record.

**Old size behaviour:**

| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Active view, top 3 loans, no Switch View |
| **Medium (2×2)** | Active view, top 5 loans + type labels; Switch View available |
| **Large (4×4)** | Active view, all loans + status badges + totals row; Switch View available |
| **KPI (1×0.5)** | Headline: **Total Balance Due ($)**, across all loans. No download, no switch. |
| **Expanded** | Active view, full detail, all filters live in the modal |

**Old view split (Switch View):** the earlier design offered View 1 Balance Bars (default) and View 2 Summary Table (Loan Name / Type / Original / Balance Due / Status / Next Payment). Jo's shipped Final has no Balance Bars vs Summary Table toggle: her loans table (grouped into aging bands, with the aging-and-risk panel appearing at Detail) is the single hero read across sizes, and the aging bands themselves double as the table filter. The Summary Table's Original, Status and Next Payment columns are not carried in Jo's build (Status has no confirmed backing field; Original and Next Payment have no documented source field — see Data Contract). The KPI headline Total Balance Due is unchanged and carried into the Glance tier.
