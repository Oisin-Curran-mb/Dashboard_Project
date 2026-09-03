# Loans With Balance Due - API Spec

**Status: DRAFT - not final**

---

## Overview

This widget answers one question for a lending organisation: which loans still owe money, how much in total, and how far behind each one is. A loan administrator reads the total, sees how much of it is past due, picks a time range to work, and opens a loan to check its payment history before chasing the borrower.

This contract defines **four APIs**: a bounded portfolio summary fired on render, a paginated loan list fired alongside it at the two larger tiers, a rarely-changing loan-type lookup, and a per-loan detail read fired only when the user opens a loan. The justification for each split is in the API Inventory below.

Two things a developer must read before building anything aging-derived. First, the summary's time ranges depend on a server-side oldest-first payment allocation that does not exist today: the existing chart read buckets invoices by raw age with no payment subtraction, and it returns different numbers. Second, the loan type filter narrows **every** figure in the widget, not just the loan list, so the summary read takes the type param too.

---

## Design → API coverage

Every element the widget renders, mapped to what feeds it.

| Design element | Type | API | Field(s) | Provenance |
|---|---|---|---|---|
| Total Balance Due headline, Glance tier | KPI | API 1 | `totalAmountDue` | DERIVED sum of per-loan amountDue over the filtered set [CODE - legacy AmountDue>0 grid] |
| "owed across N loans with a balance" caption | KPI sub-line | API 1 | `loanCount` | DERIVED count over the filtered set [BUILD] |
| Past due pill: amount, loan count, percent | KPI state | API 1 | `pastDueAmount`, `pastDueCount`, `pastDuePct` | NEW, depends on the allocation [DOC - Step 1 research] |
| "All current" pill, non-default state | KPI state | API 1 | `pastDueAmount` = 0 selects it, client-side | NEW [BUILD] |
| Stacked severity bar, one segment per range holding a balance | chart series | API 1 | `ranges[].amountDue`, `ranges[].sharePct`, `ranges[].severity` | NEW [BUILD] |
| Most-overdue call: the most severe range that holds a balance | KPI read | API 1 | `worstRangeKey` | NEW [BUILD] |
| Screen-reader ladder text, all five ranges with amounts | accessibility text | API 1 | `ranges[].label`, `ranges[].amountDue` | NEW [BUILD] |
| "All settled" state at Glance | state | API 1 | `loanCount` = 0 selects it, client-side | DERIVED [BUILD] |
| "Nothing outstanding" state at Explore and Detail | state | API 1 | `loanCount` = 0 selects it, client-side | DERIVED [BUILD] |
| Loan type filter control | filter | API 3 | `loanTypes[].loanTypeId`, `loanTypes[].name` | STORED LNType.Name [CODE - LNTypeRepository.GetAll().OrderBy(Name)] |
| Selected loan type echoed back for the chart-empty line | filter echo | API 1 | `loanTypeId`, `loanTypeName` | STORED LNType.Name [CODE] |
| Total Balance Due figure in the header | KPI | API 1 | `totalAmountDue` | DERIVED [CODE] |
| Context line: past due amount and percent, of which 90+ | KPI read | API 1 | `pastDueAmount`, `pastDuePct`, `ninetyPlusAmount` | NEW [BUILD] |
| "Nothing past due" alternative context line | state | API 1 | `pastDueAmount` = 0 selects it, client-side | NEW [BUILD] |
| Table / Pie segment | view toggle | none, client-side only | both views read responses the client already holds | [BUILD] |
| Loading state while a loan-type change resolves | state | API 1 + API 2 | in-flight, no field | [BUILD] |
| Refresh control | action | API 1 + API 2 | re-fires both with a fresh `asOf` | [BUILD] |
| Account column | table column | API 2 | `rows[].accountNumber` | STORED LNLoan.AccountNumber [CODE] |
| Borrower column | table column | API 2 | `rows[].borrowerName` | STORED LNLoan.Name [CODE - legacy grid Borrower Name column] |
| Loan type sub-line under the borrower | table column | API 2 | `rows[].loanTypeName` | STORED LNType.Name [CODE] |
| Last payment column | table column | API 2 | `rows[].lastPaymentDate` | DERIVED MAX(LNPayment.PaymentDate) WHERE Posted AND VoidJournalID IS NULL [CODE - LNPayment] |
| Dormancy flag on the Last payment cell | table indicator | API 2 | `asOf` minus `rows[].lastPaymentDate`, client-side band | DERIVED, threshold unapproved [BUILD] |
| Amount due column | table column | API 2 | `rows[].amountDue` | DERIVED SUM(Principal + Interest) minus posted payments [CODE] |
| Sort controls on Account, Borrower, Last payment, Amount due | table control | API 2 | `sortBy`, `sortDir` | STORED, server-ordered [BUILD] |
| Table footer label, "All loans (N)" or "<range> (N loans)" | table total | API 2 | `totalCount`, `rangeKey` | DERIVED over the full filtered set [BUILD] |
| Table footer amount | table total | API 2 | `filteredTotal` | DERIVED over the full filtered set [BUILD] |
| "No loans match this selection" zero line | state | API 2 | `totalCount` = 0 selects it, client-side | DERIVED [BUILD] |
| Row click opens the loan | drill | API 4 | `rows[].loanId` | STORED LNLoan.LoanID [CODE] |
| Time range chip row, full ladder in severity order | filter | API 1 | `ranges[].key`, `ranges[].label`, `ranges[].loanCount` | NEW [BUILD] |
| Zero-balance range chip rendered inert | non-default state | API 1 | `ranges[].loanCount` = 0 makes it inert, client-side | NEW [BUILD] |
| Donut arcs, one per range holding a balance | chart series | API 1 | `ranges[].amountDue`, `ranges[].sharePct` | NEW [BUILD] |
| Donut centre figure | chart label | API 1 | `totalAmountDue` | DERIVED [BUILD] |
| Donut legend rows: label, amount, share | chart legend | API 1 | `ranges[].label`, `ranges[].amountDue`, `ranges[].sharePct`, `ranges[].loanCount` | NEW [BUILD] |
| Zero-balance legend row reading $0, inert | non-default state | API 1 | `ranges[].amountDue` = 0 and `ranges[].loanCount` = 0 | NEW [BUILD] |
| Selected-range note above the table | state | API 2 | `rangeKey` echo | NEW [BUILD] |
| Chart empty state, "nothing outstanding to chart for <type>" | state | API 1 | `totalAmountDue` = 0 plus `loanTypeName` | NEW [BUILD] |
| Drill: Account | drill field | API 4 | `accountNumber` | STORED LNLoan.AccountNumber [CODE] |
| Drill: Loan type | drill field | API 4 | `loanTypeName` | STORED LNType.Name [CODE] |
| Drill: Original amount | drill field | API 4 | `originalAmount` | STORED LNLoan.TotalAmount [CODE - LNLoan] |
| Drill: Amount due | drill field | API 4 | `amountDue` | DERIVED [CODE] |
| Drill: Aging range | drill field | API 4 | `rangeKey`, `rangeLabel` | NEW [BUILD] |
| Drill: Days past due | drill field | API 4 | `daysPastDue` | NEW [BUILD] |
| Drill: Next payment due | drill field | API 4 | `nextPaymentDueDate` | UNVERIFIED (Feargal Phelan) [TO CONFIRM] |
| Drill: Last payment plus days since | drill field | API 4 | `lastPaymentDate`, days-since computed client-side from `asOf` | DERIVED [CODE - LNPayment] |
| Drill: dormancy note | drill state | API 4 | `asOf` minus `lastPaymentDate`, client-side band | DERIVED, threshold unapproved [BUILD] |
| Drill: payment history rows, date and reference and amount | drill table | API 4 | `payments[].paymentDate`, `payments[].reference`, `payments[].amount` | STORED LNPayment plus DERIVED composed amount [CODE - LNPayment] |
| Drill: "no payments recorded yet" state | drill state | API 4 | `payments` empty selects it, client-side | DERIVED [BUILD] |
| Drill: "Open loan" action | action | none, no confirmed destination, see Not in scope | UNVERIFIED (owner not yet named) [TO CONFIRM] |
| Drill: "Record a contact" action | action | none, no write endpoint in this contract, see Not in scope | NEW, not built [BUILD] |
| Drill: "Export to Excel" action | action | none, no export endpoint exists, see Not in scope | NEW, not built [CODE - no modern export endpoint found] |
| Drill: Close | action | none, client-side only | [BUILD] |
| Currency of every amount on screen | formatting | API 1, 2, 4 | `currency` | UNVERIFIED (Feargal Phelan) [DOC - Step 6 dossier, section 10] |
| Snapshot stamp shared by the header and the table | consistency | API 1, 2, 3, 4 | `asOf` | DERIVED request anchor [BUILD] |

No design element is unfunded. Three actions are deliberately unfunded and each is listed in Not in scope with what happens instead.

---

## Tables

| Table / repository | Fields and members used |
|---|---|
| `LNLoan` | `LoanID`, `AccountNumber`, `Name`, `TypeID`, `PersonID`, `TotalAmount`, `NumberPayments`, `PaymentsPerYear` |
| `LNType` (`LNTypeRepository`) | `TypeID`, `Name` |
| `LNInvoice`, `LNInvoicePost` | scheduled principal and interest per invoice, invoice date, invoice due date |
| `LNPayment` | `LoanID`, `PaymentDate`, `CheckNumber`, `Principal`, `Interest`, `LateFee`, `AdditionalPrincipal`, `AdditionalDraw`, `Adjustment`, `Posted`, `VoidJournalID` |
| `CorePerson` | reachable from `LNLoan.PersonID`, not read by this contract, see Not in scope |

**No new tables and no schema changes.** Every read is a new query over existing tables, plus one new server-side calculation (the oldest-first payment allocation). The Step 1 research names these tables in their underscored forms, `LN_Loan` / `LN_InvoicePost` / `LN_Type`; they are the same tables as the entity-class names used above.

Core formulas, each quotable on its own:

- **Inclusion.** A loan appears only if it has at least one invoice and a remaining balance: `amountDue > 0`. [CODE - legacy grid applies `AmountDue > 0`]
- **Amount due, per loan.** `amountDue = SUM(LNInvoice.Principal + LNInvoice.Interest) across the loan's invoices, minus all posted payments`. [DOC - Step 1 research; CODE - legacy grid]
- **Payment consistency filter, applied to every payment read.** `LNPayment.Posted = true AND LNPayment.VoidJournalID IS NULL`. A voided payment must not move an amount due, a last-payment date, or a range assignment. [CODE - LNPayment]
- **Payment amount, per payment.** `Principal + Interest + LateFee + AdditionalPrincipal + AdditionalDraw - Adjustment`. There is no single amount column on `LNPayment`; this is a composed figure and it can be negative when an adjustment exceeds the rest. [CODE - LNPayment]
- **Last payment date, per loan.** `MAX(LNPayment.PaymentDate)` under the consistency filter, `null` when the loan has no qualifying payment. [CODE - LNPayment]
- **Oldest-first payment allocation.** Each loan's invoices are bucketed by age, then each posted payment is subtracted starting from the oldest bucket and working toward the newest, overflow carrying into the next newer bucket. This is why a range total is not "the sum of unpaid invoices in that age range". [DOC - Step 1 research, quoting the legacy calculation] Not implemented on the modern side: `NEW`.
- **Range assignment, per loan.** A loan sits in exactly one range: the most severe range that still holds any of its remaining balance after the allocation, and its whole `amountDue` counts toward that range. `daysPastDue` is the signed day count against the due date of the oldest invoice still holding balance, negative when nothing is yet due. `NEW` [BUILD]
- **Range boundaries.** `daysPastDue <= 0` is Current, `1` to `30` is 1-30 days, `31` to `60` is 31-60 days, `61` to `90` is 61-90 days, `91` and above is 90+ days. The ladder is exhaustive and non-overlapping, so range amounts sum exactly to the total and range loan counts sum exactly to the loan count. `NEW` [BUILD]
- **Scoping.** Every read is scoped by the `X-BankAccountID` context header. The loan-type lookup is additionally scoped `WHERE TenantID = ctx`. [CODE - legacy scopes loans by Bank Account; the lookup is tenant-scoped]

---

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Chart scope | The By Age chart ignores the loan-type filter. An interaction test held the chart fingerprint fixed while the loan-type filter emptied the table. [LIVE - beta1, 23 Jul 2026] | The summary read takes `loanTypeId`, so the ranges, the total, the past-due read and the Glance bar all narrow with the table. `NEW` |
| Aging ladder | Four buckets labelled Current / 30 / 60 / Over 60, where "Current" is under 30 days and "Over 60" actually means 90 or more. [LIVE - beta1, 23 Jul 2026] | Five ranges returned by the server in severity order with explicit boundaries: Current (nothing yet due), 1-30, 31-60, 61-90, 90+. All five are always returned, including at zero. `NEW` |
| Aging arithmetic | Legacy applies the oldest-first allocation per bucket. The modern chart read buckets invoices by raw age with no payment subtraction, so its totals differ from legacy. [DOC - Step 1 research, comparison extract] | The allocation is replicated server-side, and each loan is assigned one range. `NEW` |
| Aging grain | Legacy splits one loan's balance across several buckets. | One range per loan, whole balance counted there, so the ranges partition the loans and the loan counts are well defined. `NEW`, and a genuine departure from legacy arithmetic, see Still needs sign-off |
| Row set | Whole grid returned, fixed `ORDER BY Name, AccountNumber`. [CODE] | Paginated with `page` and `pageSize`, `sortBy` and `sortDir` from a whitelist, default amount due descending, `loanId` as the unique tiebreaker. `NEW` |
| Row fields | `{LoanId, AccountNumber, Name, TypeId, LastPayment, AmountDue}`. [CODE - modern grid read] | Adds `loanTypeName`, `daysPastDue` and `rangeKey`. Partly `NEW` |
| Summary figures | None. The panel has no KPI. [LIVE - beta1, 23 Jul 2026] | `totalAmountDue`, `loanCount`, `pastDueAmount`, `pastDueCount`, `pastDuePct`, `ninetyPlusAmount`, `ninetyPlusPct`, `worstRangeKey`. `NEW` |
| Per-loan drill | None. Account names are links with no confirmed destination. [DOC - Step 1 research, open question] | A loan detail read with payment history, over existing tables. `NEW` |
| Currency | Renders as a pound sign regardless of the organisation, a localisation defect. [LIVE - beta1, 23 Jul 2026] | An ISO currency code in every response, formatting done client-side. `UNVERIFIED (Feargal Phelan)` |
| Snapshot consistency | None. | A shared `asOf` anchor echoed by every read, so the header total and the table footer cannot straddle a write. `NEW` |
| Cache posture | File-backed loan records; refresh deletes the cached records. [CODE - legacy caching] | Both data reads are live per request and anchored on `asOf`. The loan-type lookup is TTL cached. `NEW` |
| Status, Active or In Arrears | Not present. | Still not present. No backing field is confirmed, so no field and no filter are specced. See Still needs sign-off |
| Excel export | Legacy panels export in-page. No modern export endpoint exists. [CODE - no `[ApiController]` export endpoint found] | Not in this contract. |

---

## API inventory

| API | Purpose | Trigger (when it fires) | Cardinality | R/W | Cache posture | Split trigger |
|---|---|---|---|---|---|---|
| **API 1** portfolio summary | Total, loan count, past-due read, 90+ read, the five-range ladder, the most severe range holding a balance | Widget render at every tier, and on a loan-type change | Bounded: one object plus exactly five range entries | R | LIVE per request, anchored on `asOf` | Cardinality gap: a bounded aggregate must not pay for an unbounded row list. Trigger gap: the Glance tier fires this and nothing else |
| **API 2** loan list | One page of loans with a balance, plus the full-filtered-set total and count behind the footer | Render at Explore and Detail, on a loan-type change, on a range selection, on a sort change, on a page change | Unbounded, paginated | R | LIVE per request, anchored on `asOf` | Cardinality gap and conditional weight: the row set has no cited ceiling, and the Glance tier never needs a single row |
| **API 3** loan-type lookup | The loan-type option list, "Show All" prepended | Once per widget mount, or from a shared cache | Bounded, organisation-defined, 4 entries live | R | TTL, 15 minutes | Lifetime gap: an organisation's loan types change on a scale of months while the balances change continuously, and the list is shared with any other loan surface |
| **API 4** loan detail | One loan's summary, aging read and payment history | Only when the user opens a loan | Bounded per loan | R | LIVE per request, anchored on `asOf` | Trigger gap, grain gap and conditional weight: per-entity detail keyed by id, fetched on an interaction that has not happened at render |

Pairs considered and closed:

- **API 1 and API 2 kept separate.** They always fire together at Explore and Detail, which is the usual reason to combine, but they fail the other two conditions of that counter-pressure: at the Glance tier only API 1 fires, and API 2 paginates while API 1 must span the entire filtered set. Merging them would ship the whole aggregate with every page and ship rows to a tier that renders none. The consistency risk that merging would have solved is closed instead by the shared `asOf` anchor.
- **API 4 kept separate from API 2, and never called per row.** A per-entity read keyed by `loanId` is legitimate for a drill the user opens. It is not how the table is populated; calling it per row would be an N+1.
- **Payment history kept inside API 4 rather than split out.** Both halves always fire together when the modal opens, both are cheap, and the history is bounded per loan by the stored schedule length. A fifth endpoint would add a round trip and buy nothing.

---

## Call sequence

| Interaction | Calls fired | Notes |
|---|---|---|
| Initial widget load, Glance tier | API 3, API 1 | API 3 may be served from cache. API 1 returns `asOf`; nothing else is needed at this tier |
| Initial widget load, Explore or Detail tier | API 3, API 1, API 2 | API 1 first, so its `asOf` can be passed to API 2. Both then describe the same snapshot, which is what keeps the header total and the table footer in agreement |
| Change filter *Loan type* | API 1, then API 2 | The range selection resets to all ranges, so `rangeKey` is dropped. Page resets to 1. A fresh `asOf` is taken from API 1 and passed to API 2 |
| Change filter *Time range* (chip row or donut legend) | API 2 only | The range selection narrows the loan list. It deliberately does not re-fire API 1: the donut is the control being selected from, so it must keep showing every range or there is nothing to return to |
| Switch view, Table or Pie | none | Both views read the API 1 and API 2 responses the client already holds |
| Change sort | API 2 only | `sortBy` and `sortDir` change, page resets to 1, `asOf` is unchanged |
| Change page | API 2 only | `asOf` is unchanged, so paging cannot shift the population under the user |
| Open drill (row click) | API 4 | Called with the row's `loanId` and the same `asOf` |
| Submit action | none | This contract is read-only. "Record a contact", "Open loan" and "Export to Excel" have no endpoint, see Not in scope |
| Refresh | API 1, then API 2 | A new `asOf` is taken from API 1. API 3 is not re-fetched unless its TTL has expired |

**Shared snapshot anchor.** API 1's `asOf` is the anchor for the whole widget. The client sends it to API 2 and API 4 and every response echoes it. Without it the header total and the table footer can straddle a write and disagree on screen.

---

## Filter architecture

| Filter | Option source | Cardinality | Execution | Aggregate effect | Cascade | "All" wire form | Round trips |
|---|---|---|---|---|---|---|---|
| Loan type | `LOOKUP` API 3, backed by `LNType` via `LNTypeRepository.GetAll().OrderBy(Name)` | Organisation-defined. 4 entries live including "Show All" [LIVE - beta1, 23 Jul 2026]. Expected well under 20, so a plain list; if any organisation exceeds roughly 200 this becomes a searchable server-side lookup | `SERVER`, param `loanTypeId` on API 1 and API 2 | Yes. It changes `totalAmountDue`, `loanCount`, every past-due and 90+ figure, `worstRangeKey`, every `ranges[]` entry and API 2's `filteredTotal` | No. Its option list depends on nothing else | Omit the param. No sentinel guid, because an omitted param and an explicit "all" guid produce different cache keys for the same query | 2: API 1 then API 2 |
| Time range | `DERIVED` from API 1's `ranges[]`, which the server always returns as exactly five entries in severity order | 5, fixed by the ladder the server owns | `SERVER`, param `rangeKey` on API 2 | Yes for API 2's `filteredTotal` and `totalCount`, which is why it cannot be a client-side view over a page. No for anything on API 1, deliberately | Yes. The valid `rangeKey` values are whatever API 1 returned for the current loan type | Omit the param, which means every range | 1: API 2 |
| Table or Pie view | Client state only, not a data filter | 2 | `CLIENT`. All three of Framework 1's conditions hold: both views read responses the client already holds, the set is bounded by definition at two views, and no server-computed aggregate changes | No | No | Not applicable, no param | 0 |

**Combination semantics.** AND, and narrowing. `loanTypeId` and `rangeKey` intersect. There is no OR pair and no mutually exclusive pair.

**Conflict rule.** The two data params cannot contradict each other, because a range is not owned by a type, but three cases need a stated resolution:

- An unknown `loanTypeId`, one not in the current tenant's `LNType` set, is a client error and returns `400 unknown_loan_type`. It is a lookup value, so an unknown one means the client is out of step with API 3, not that the data is empty.
- An unknown `rangeKey`, one outside the five the server owns, returns `400 unknown_range`.
- A `sortBy` outside the whitelist returns `400 unknown_sort_field`. It is never silently ignored, because silently falling back to the default sort makes a paginated list skip and duplicate rows without telling anyone.

**Overlapping value spaces.** A valid pair can legitimately match nothing: a loan type all of whose loans are current, combined with the 90+ range, matches no rows. That is a well-formed zero response, never an error. See the state contracts under API 2.

**Blank filter values.** A loan whose `LNLoan.TypeID` is null is included when `loanTypeId` is omitted and excluded by any specified `loanTypeId`. A blank never behaves as a wildcard.

**Cascade invalidation.** A `rangeKey` that was valid before a loan-type change stays a valid key, but the range may now hold nothing. The client clears the range selection to "every range" whenever the loan type changes, so the user is never left looking at an empty table they cannot explain. The server accepts the stale key regardless and returns an empty page.

---

## Volume and performance

| Dataset | Typical rows | Worst realistic rows (basis) | Row width | Payload at worst | Verdict | Server cost model | Cache posture |
|---|---|---|---|---|---|---|---|
| API 1 portfolio summary | 1 object plus 5 range entries | 5 range entries, fixed by the ladder the server owns [BUILD] | 12 summary fields, 6 fields per range entry | Under 2 KB | `BOUNDED` | Single indexed scan of loans in scope, then one allocation pass per loan over that loan's invoices and posted payments. Multiplier: loans in scope × (invoices + payments) per loan | LIVE per request, `asOf` is request time |
| API 2 loan list | 3 loans, 54,897.96 total [LIVE - beta1, 23 Jul 2026]. Build fixture holds 9 loans [BUILD] | No cited ceiling exists for how many loans a lending organisation carries. `[TO CONFIRM - Feargal Phelan]` | 9 fields, roughly 220 bytes per row | Not computable until the ceiling is confirmed, which is itself the reason this paginates | `MUST PAGINATE` | Single indexed scan filtered by bank account and type, plus the same per-loan allocation pass to resolve `daysPastDue` and `rangeKey`. Multiplier: page size × (invoices + payments) per loan for the page, plus a full-set pass for `filteredTotal` and `totalCount` | LIVE per request, anchored on the `asOf` the client passes |
| API 3 loan-type lookup | 4 entries including "Show All" [LIVE - beta1, 23 Jul 2026] | Organisation-defined and unbounded in principle, expected under 20 given the live count `[TO CONFIRM - Feargal Phelan]` | 2 fields, roughly 60 bytes per row | Under 2 KB | `BOUNDED` | Single indexed scan of `LNType` filtered by tenant | TTL, 15 minutes |
| API 4 loan detail | 1 loan plus 2 payments [BUILD] | 1 loan plus roughly 400 payment rows, bounded by the stored schedule length `LNLoan.NumberPayments` plus unscheduled payments [CODE - LNLoan.NumberPayments, PaymentsPerYear] | 14 loan fields, 3 fields per payment | Under 40 KB | `BOUNDED` | Single indexed scan of `LNPayment` and `LNInvoice` by `LoanID`, plus one allocation pass for that loan. No multiplier over other loans | LIVE per request, anchored on `asOf` |

**Why API 2 paginates rather than staying bounded.** The build sorts, ranks, filters and totals the whole loan list in the browser instantly, and that is a property of a nine-row fixture, not evidence about the contract. The row set is "every loan with a remaining balance in one bank account", which is bounded only by how much an organisation has lent. The live figure of 3 loans measures a Tier C, low-adoption widget, not a ceiling: it says few organisations use the panel, not that the ones that do have few loans. With no cited ceiling, the set is not provably bounded, so it paginates and every operation over it moves to the server.

**No time series.** This widget renders no series over periods, so there is no entities × points product to compute. Every figure is an as-of-today snapshot.

### Pagination contract

- **Params.** `page`, 1-based, default `1`. `pageSize`, default `50`, maximum `200`. A `pageSize` above the maximum is clamped to the maximum and echoed back, not rejected.
- **What paginates.** `rows[]` on API 2, and nothing else.
- **What does not.** `totalCount` and `filteredTotal` on API 2 compute over the **full filtered set**, never the page. Every figure on API 1, including `totalAmountDue`, `loanCount`, the past-due and 90+ reads, `worstRangeKey` and all five `ranges[]` entries, computes over the full filtered set and is unaffected by paging entirely. Switching pages changes no total, no chart, no chip count and no KPI.
- **Sort params.** `sortBy` whitelisted to `accountNumber`, `borrowerName`, `lastPaymentDate`, `amountDue`. `sortDir` is `asc` or `desc`. Default `sortBy=amountDue`, `sortDir=desc`. The client's initial direction when a user first selects a column is ascending for `borrowerName` and `lastPaymentDate` and descending for `accountNumber` and `amountDue`; the server honours whatever it is sent.
- **Deterministic total order.** Every sort ends in `loanId` ascending as the unique tiebreaker. Without it, paging over a non-unique key such as `lastPaymentDate` duplicates and skips rows across pages.
- **Null ordering.** `lastPaymentDate` is null on a loan with no qualifying payment. Nulls sort last in both directions, so a loan that has never paid does not masquerade as the most recent payer.
- **`totalCount`** is returned alongside every page, so the client renders a pager without a second call.
- **Past the last page.** `rows` is an empty array, `totalCount` and `filteredTotal` are still correct, `page` echoes what was asked. It is not an error.

---

## Where computation lives

| Value | Server or client | Basis | Why |
|---|---|---|---|
| `totalAmountDue` | SERVER | Full filtered set of loans | Spans rows the client does not hold once the list paginates |
| `loanCount` | SERVER | Full filtered set | Same reason |
| `pastDueAmount`, `pastDueCount` | SERVER | Post-allocation range assignment across the full filtered set | Needs the allocation and the whole set |
| `pastDuePct` | SERVER | `pastDueAmount / totalAmountDue`, rounded to a whole percent | Denominator spans the full set. **Division by zero: returns `0`, never null and never omitted** |
| `ninetyPlusAmount` | SERVER | The 90+ range total over the full filtered set | Needs the allocation |
| Share of the balance in the 90+ range | CLIENT if ever needed | `ninetyPlusAmount / totalAmountDue` | Not returned. Nothing on screen renders a 90+ percentage: the context line pairs the 90+ **amount** with the overall past-due percentage. A field no element consumes is not in the contract |
| `ranges[].amountDue`, `ranges[].loanCount` | SERVER | Allocation then range assignment over the full filtered set | Cannot be derived from a page |
| `ranges[].sharePct` | SERVER | `ranges[].amountDue / totalAmountDue`, whole percent. **Division by zero returns `0`** | One rule, stated once, rather than each consumer improvising. Rounding means the five shares need not sum to exactly 100, so the client must never re-derive the total from the shares |
| `ranges[].severity` | SERVER | The ladder's own rank, 0 for Current through 4 for 90+ | The server owns the ladder, so the client never hardcodes its order or membership |
| `worstRangeKey` | SERVER | The highest `severity` whose `amountDue` is above zero, null when nothing is outstanding | Needs the full set |
| `filteredTotal`, `totalCount` (API 2) | SERVER | Full filtered set, never the page | The table footer is an aggregate. Summing the visible rows would be wrong the moment there is a second page |
| Row order | SERVER | `sortBy`, `sortDir`, `loanId` tiebreaker | A paginated set can only be ordered server-side |
| `daysPastDue`, `rangeKey` per loan | SERVER | Allocation against invoice due dates | Needs invoice and payment data the client never receives |
| `payments[].amount` | SERVER | `Principal + Interest + LateFee + AdditionalPrincipal + AdditionalDraw - Adjustment`, returned pre-signed | The client formats and never composes or sign-checks. There is no single amount column to return instead |
| Glance stacked bar segment proportions | CLIENT | `ranges[].sharePct` already in the response | Pure arithmetic over values present |
| Donut arc lengths and legend shares | CLIENT | `ranges[].sharePct` already in the response | Same |
| Past-due pill versus "All current" pill | CLIENT | `pastDueAmount > 0` | A branch over a value present, not a computation |
| "All settled" and "Nothing outstanding" states | CLIENT | `loanCount == 0` | Same |
| "No loans match this selection" line | CLIENT | `totalCount == 0` | Same |
| Days since last payment, drill modal | CLIENT | `asOf` minus `lastPaymentDate` | Pure date arithmetic over two values present |
| Dormancy flag, table cell and drill note | CLIENT | `asOf` minus `lastPaymentDate` exceeds 90 days | A presentation band. **The 90-day threshold is not an approved business rule**; it is what the build uses and it is an open item, not a silent default. See Still needs sign-off |
| Severity ordering to colour ramp, and the red or amber treatment of the most severe ranges | CLIENT | `ranges[].severity` | Presentation banding. The API returns ranks and raw numbers; it returns no colours and no risk labels |
| "Not yet due" versus "N days past due" wording | CLIENT | Sign of `daysPastDue` | A label over a pre-signed value |
| Currency and number formatting | CLIENT | `currency` code plus the user's locale | The server returns decimal amounts and an ISO code, never a formatted string. This is what fixes the localisation defect in the live panel |

No delta or comparison figure exists in this widget, so there is no signed-delta field to return. Where one is added later it comes back pre-signed.

---

## API 1: portfolio summary

### Endpoint

```
GET /api/dashboard/loans-with-balance-due/summary
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `loanTypeId` | guid | No | Any `LNType.TypeID` in the tenant's set | Omitted, meaning every loan type | Narrows every figure in the response to one loan type |
| `asOf` | ISO 8601 datetime | No | Any instant not in the future | Omitted, meaning request time | The snapshot anchor. Omitted on the first call of a render or a refresh, so the server sets it and the client reuses it for the other reads |

Context header: `X-BankAccountID`, required on every request. See Auth and scoping.

### Example requests

```
GET /api/dashboard/loans-with-balance-due/summary
GET /api/dashboard/loans-with-balance-due/summary?loanTypeId=6b1f0c92-4d3a-4a17-9f21-3c8de5a10b44&asOf=2026-07-24T00%3A00%3A00Z
```

The second call is the "Church - Special" loan type with an explicit anchor. The colon characters in the `asOf` value are percent-encoded.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | ISO 8601 datetime | DERIVED request anchor [BUILD] | The snapshot this response describes. Echoed by every other read |
| `currency` | string, ISO 4217 | UNVERIFIED (Feargal Phelan) [DOC - Step 6 dossier, section 10] | The organisation's currency code. The backing organisation setting is not confirmed in code |
| `loanTypeId` | guid or null | STORED LNType.TypeID [CODE] | The applied filter, null when every type is included |
| `loanTypeName` | string | STORED LNType.Name [CODE] | Display name of the applied filter, or the "every loan type" label. Consumed by the chart-empty line |
| `totalAmountDue` | decimal(2) | DERIVED SUM(per-loan amountDue) over the filtered set [CODE] | The headline. Also the donut's centre figure |
| `loanCount` | int | DERIVED COUNT over the filtered set [CODE] | Loans with a remaining balance |
| `pastDueAmount` | decimal(2) | NEW, requires the allocation [DOC - Step 1 research] | Balance on loans whose `daysPastDue` is above zero |
| `pastDueCount` | int | NEW, requires the allocation [DOC - Step 1 research] | Count of those loans |
| `pastDuePct` | int | DERIVED pastDueAmount / totalAmountDue, whole percent, 0 when the denominator is 0 [BUILD] | Share of the balance that is past due |
| `ninetyPlusAmount` | decimal(2) | NEW, requires the allocation [DOC - Step 1 research] | Balance in the 90+ range |
| `worstRangeKey` | string or null | DERIVED highest severity with amountDue above zero [BUILD] | Drives the Glance most-overdue call. Null when nothing is outstanding |
| `ranges[]` | array | NEW [BUILD] | Exactly five entries, always, in severity order, including entries at zero |
| `ranges[].key` | string | NEW [BUILD] | Stable identifier: `current`, `d1to30`, `d31to60`, `d61to90`, `over90`. This is the value the client sends as `rangeKey` |
| `ranges[].label` | string | NEW [BUILD] | Display label: Current, 1-30 days, 31-60 days, 61-90 days, 90+ days |
| `ranges[].severity` | int | NEW [BUILD] | 0 through 4, ascending with severity. The client renders in this order and never hardcodes the ladder |
| `ranges[].amountDue` | decimal(2) | NEW, requires the allocation [DOC - Step 1 research] | Balance assigned to this range, 0.00 when the range holds nothing |
| `ranges[].loanCount` | int | NEW, requires the allocation [DOC - Step 1 research] | Loans assigned to this range. 0 makes the chip and legend row inert client-side |
| `ranges[].sharePct` | int | DERIVED amountDue / totalAmountDue, whole percent, 0 when the denominator is 0 [BUILD] | Share of the balance in this range |

### Example response

```json
{
  "asOf": "2026-07-24T00:00:00Z",
  "currency": "USD",
  "loanTypeId": null,
  "loanTypeName": "All loan types",
  "totalAmountDue": 112037.96,
  "loanCount": 9,
  "pastDueAmount": 58147.96,
  "pastDueCount": 6,
  "pastDuePct": 52,
  "ninetyPlusAmount": 38940.13,
  "worstRangeKey": "over90",
  "ranges": [
    { "key": "current", "label": "Current",    "severity": 0, "amountDue": 53890.00, "loanCount": 3, "sharePct": 48 },
    { "key": "d1to30",  "label": "1-30 days",  "severity": 1, "amountDue": 8386.86,  "loanCount": 2, "sharePct": 7 },
    { "key": "d31to60", "label": "31-60 days", "severity": 2, "amountDue": 10820.97, "loanCount": 2, "sharePct": 10 },
    { "key": "d61to90", "label": "61-90 days", "severity": 3, "amountDue": 0.00,     "loanCount": 0, "sharePct": 0 },
    { "key": "over90",  "label": "90+ days",   "severity": 4, "amountDue": 38940.13, "loanCount": 2, "sharePct": 35 }
  ]
}
```

Reconciliation, ranges to total: 53,890.00 + 8,386.86 + 10,820.97 + 0.00 + 38,940.13 = 112,037.96, which is `totalAmountDue`.

Reconciliation, range loan counts to total: 3 + 2 + 2 + 0 + 2 = 9, which is `loanCount`.

Reconciliation, past due is every range above Current: 8,386.86 + 10,820.97 + 0.00 + 38,940.13 = 58,147.96, which is `pastDueAmount`; and 2 + 2 + 0 + 2 = 6, which is `pastDueCount`.

Reconciliation, shares: 48 + 7 + 10 + 0 + 35 = 100. Whole-percent rounding means this will not always land on exactly 100, so the client renders shares and never re-derives the total from them.

`ninetyPlusAmount` of 38,940.13 is the `over90` entry's `amountDue`, and `totalAmountDue` of 112,037.96 must equal API 2's `filteredTotal` when API 2 is called with the same `loanTypeId`, no `rangeKey` and the same `asOf`.

The same call filtered to the "Church - Special" loan type returns `totalAmountDue` 32,436.86 across 4 loans, with ranges 0.00 + 8,386.86 + 9,800.00 + 0.00 + 14,250.00 = 32,436.86 and counts 0 + 2 + 1 + 0 + 1 = 4. This is the reconciliation that proves the loan type narrows the ranges and not only the table.

### State contracts

| State | Response |
|---|---|
| Empty (no loans have a balance) | `200`. `totalAmountDue` 0.00, `loanCount` 0, every past-due and 90+ figure 0, `worstRangeKey` null, and all five `ranges[]` entries present with `amountDue` 0.00 and `loanCount` 0. Never an empty `ranges` array, because the client renders the ladder from this field |
| Empty for the selected type only | Identical shape, with `loanTypeId` and `loanTypeName` echoing the applied filter so the client can say which type has nothing outstanding |
| Partial (some loans have invoices whose allocation cannot be resolved) | `200`. The resolvable loans are included. Any loan whose aging cannot be resolved is counted in `totalAmountDue` and `loanCount` but assigned to no range, and the response carries `ranges[]` sums below `totalAmountDue`. This is the one case where the range sums do not cross-foot to the total, and the client must not infer the total from the ranges |
| Not-yet-existing entity (a loan opened after `asOf`) | Excluded. The read is anchored, so a loan that did not exist at `asOf` contributes nothing |
| Permission denied | `403` with `{"error":"forbidden"}`. No partial payload |
| Upstream unavailable | `503` with `{"error":"upstream_unavailable"}` and a `Retry-After` header. Never a zero-valued payload, because zero outstanding and "we could not ask" must not look the same on screen |

---

## API 2: loan list

### Endpoint

```
GET /api/dashboard/loans-with-balance-due/loans
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `loanTypeId` | guid | No | Any `LNType.TypeID` in the tenant's set | Omitted, meaning every loan type | Narrows the rows, `totalCount` and `filteredTotal` |
| `rangeKey` | string | No | `current`, `d1to30`, `d31to60`, `d61to90`, `over90` | Omitted, meaning every range | Narrows the rows to loans assigned to one range |
| `sortBy` | string | No | `accountNumber`, `borrowerName`, `lastPaymentDate`, `amountDue` | `amountDue` | Sort column. Anything outside the whitelist is rejected |
| `sortDir` | string | No | `asc`, `desc` | `desc` | Sort direction |
| `page` | int | No | 1 and above | `1` | 1-based page number |
| `pageSize` | int | No | 1 to 200 | `50` | Rows per page. Above 200 is clamped to 200 and echoed |
| `asOf` | ISO 8601 datetime | No | Any instant not in the future | Omitted, meaning request time | The anchor taken from API 1, so the footer and the header describe one snapshot |

Context header: `X-BankAccountID`, required on every request.

### Example requests

```
GET /api/dashboard/loans-with-balance-due/loans?asOf=2026-07-24T00%3A00%3A00Z
GET /api/dashboard/loans-with-balance-due/loans?loanTypeId=6b1f0c92-4d3a-4a17-9f21-3c8de5a10b44&rangeKey=over90&sortBy=lastPaymentDate&sortDir=asc&page=1&pageSize=50&asOf=2026-07-24T00%3A00%3A00Z
```

The first is the default call: every type, every range, amount due descending. The second is the "Church - Special" type narrowed to the 90+ range and sorted by oldest payment first. Colons in `asOf` are percent-encoded.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | ISO 8601 datetime | DERIVED request anchor [BUILD] | Echo of the anchor this page was read at |
| `currency` | string, ISO 4217 | UNVERIFIED (Feargal Phelan) [DOC - Step 6 dossier, section 10] | The organisation's currency code |
| `loanTypeId` | guid or null | STORED LNType.TypeID [CODE] | Echo of the applied type filter |
| `rangeKey` | string or null | NEW [BUILD] | Echo of the applied range filter. Drives the footer label and the selected-range note |
| `page` | int | DERIVED request echo [BUILD] | 1-based page number returned |
| `pageSize` | int | DERIVED request echo [BUILD] | Rows per page actually applied, after clamping |
| `totalCount` | int | DERIVED COUNT over the full filtered set [BUILD] | Loans matching the filters, not the page. Drives both the pager and the footer's loan count |
| `filteredTotal` | decimal(2) | DERIVED SUM over the full filtered set [BUILD] | The footer amount. Computed over every matching loan, never over the page |
| `sortBy` | string | DERIVED request echo [BUILD] | Sort column applied |
| `sortDir` | string | DERIVED request echo [BUILD] | Sort direction applied |
| `rows[]` | array | STORED, see per-field rows [CODE] | One page of loans |
| `rows[].loanId` | guid | STORED LNLoan.LoanID [CODE] | The drill key, and the unique sort tiebreaker |
| `rows[].accountNumber` | string | STORED LNLoan.AccountNumber [CODE] | Account column |
| `rows[].borrowerName` | string | STORED LNLoan.Name [CODE - legacy grid Borrower Name column] | Borrower column |
| `rows[].loanTypeId` | guid or null | STORED LNLoan.TypeID [CODE] | Null on a loan with no type assigned |
| `rows[].loanTypeName` | string or null | STORED LNType.Name via LNLoan.TypeID [CODE] | The sub-line under the borrower. Null when the loan has no type |
| `rows[].lastPaymentDate` | date or null | DERIVED MAX(LNPayment.PaymentDate) WHERE Posted AND VoidJournalID IS NULL [CODE - LNPayment] | Last payment column. Null when the loan has never had a qualifying payment |
| `rows[].amountDue` | decimal(2) | DERIVED SUM(Principal + Interest) minus posted payments [CODE] | Amount due column |
| `rows[].daysPastDue` | int | NEW, requires the allocation [DOC - Step 1 research] | Signed. Negative or zero means nothing is yet due |
| `rows[].rangeKey` | string | NEW, requires the allocation [DOC - Step 1 research] | The one range this loan is assigned to |

### Example response

```json
{
  "asOf": "2026-07-24T00:00:00Z",
  "currency": "USD",
  "loanTypeId": null,
  "rangeKey": null,
  "page": 1,
  "pageSize": 50,
  "totalCount": 9,
  "filteredTotal": 112037.96,
  "sortBy": "amountDue",
  "sortDir": "desc",
  "rows": [
    { "loanId": "1a4c7e10-0b21-4d55-8f3e-90ab11c20001", "accountNumber": "LN-1042", "borrowerName": "Grace Fellowship",          "loanTypeId": "2c7d5f31-9a04-4b18-8e62-11de44a90002", "loanTypeName": "Church Expansion", "lastPaymentDate": "2026-07-08", "amountDue": 28450.00, "daysPastDue": -8,  "rangeKey": "current" },
    { "loanId": "1a4c7e10-0b21-4d55-8f3e-90ab11c20002", "accountNumber": "LN-1017", "borrowerName": "New Life Center",           "loanTypeId": "2c7d5f31-9a04-4b18-8e62-11de44a90002", "loanTypeName": "Church Expansion", "lastPaymentDate": "2026-07-10", "amountDue": 24800.00, "daysPastDue": -12, "rangeKey": "current" },
    { "loanId": "1a4c7e10-0b21-4d55-8f3e-90ab11c20003", "accountNumber": "LN-1301", "borrowerName": "Third Presbyterian Church", "loanTypeId": "2c7d5f31-9a04-4b18-8e62-11de44a90002", "loanTypeName": "Church Expansion", "lastPaymentDate": "2026-03-18", "amountDue": 24690.13, "daysPastDue": 95,  "rangeKey": "over90" },
    { "loanId": "1a4c7e10-0b21-4d55-8f3e-90ab11c20004", "accountNumber": "LN-1099", "borrowerName": "Cornerstone Academy",       "loanTypeId": "6b1f0c92-4d3a-4a17-9f21-3c8de5a10b44", "loanTypeName": "Church - Special", "lastPaymentDate": "2026-01-30", "amountDue": 14250.00, "daysPastDue": 145, "rangeKey": "over90" },
    { "loanId": "1a4c7e10-0b21-4d55-8f3e-90ab11c20005", "accountNumber": "LN-1150", "borrowerName": "St. Mark Parish",           "loanTypeId": "6b1f0c92-4d3a-4a17-9f21-3c8de5a10b44", "loanTypeName": "Church - Special", "lastPaymentDate": "2026-04-15", "amountDue": 9800.00,  "daysPastDue": 58,  "rangeKey": "d31to60" },
    { "loanId": "1a4c7e10-0b21-4d55-8f3e-90ab11c20006", "accountNumber": "LN-1205", "borrowerName": "Trinity Chapel",            "loanTypeId": "6b1f0c92-4d3a-4a17-9f21-3c8de5a10b44", "loanTypeName": "Church - Special", "lastPaymentDate": "2026-05-28", "amountDue": 8200.00,  "daysPastDue": 22,  "rangeKey": "d1to30" },
    { "loanId": "1a4c7e10-0b21-4d55-8f3e-90ab11c20007", "accountNumber": "LN-2044", "borrowerName": "Stephen Ho",                "loanTypeId": "9e30a8b7-51cc-4f79-b0a4-77fe22b30003", "loanTypeName": "Individual",       "lastPaymentDate": "2026-05-02", "amountDue": 1020.97,  "daysPastDue": 44,  "rangeKey": "d31to60" },
    { "loanId": "1a4c7e10-0b21-4d55-8f3e-90ab11c20008", "accountNumber": "LN-2231", "borrowerName": "Maria Alvarez",             "loanTypeId": "9e30a8b7-51cc-4f79-b0a4-77fe22b30003", "loanTypeName": "Individual",       "lastPaymentDate": "2026-07-02", "amountDue": 640.00,   "daysPastDue": -6,  "rangeKey": "current" },
    { "loanId": "1a4c7e10-0b21-4d55-8f3e-90ab11c20009", "accountNumber": "LN-1188", "borrowerName": "First Baptist Church",      "loanTypeId": "6b1f0c92-4d3a-4a17-9f21-3c8de5a10b44", "loanTypeName": "Church - Special", "lastPaymentDate": "2026-06-30", "amountDue": 186.86,   "daysPastDue": 6,   "rangeKey": "d1to30" }
  ]
}
```

Reconciliation, rows to `filteredTotal`: 28,450.00 + 24,800.00 + 24,690.13 + 14,250.00 + 9,800.00 + 8,200.00 + 1,020.97 + 640.00 + 186.86 = 112,037.96, which is `filteredTotal` and matches API 1's `totalAmountDue` at the same `asOf`. The rows happen to sum to the footer here only because all nine fit on one page; the footer figure comes from the full filtered set and the client must never sum the page to produce it.

Reconciliation, the same call with `loanTypeId` set to Church - Special and `rangeKey` set to `over90` returns one row: `totalCount` 1 and `filteredTotal` 14,250.00, which must equal API 1's `ranges[]` entry for `over90` under that same loan type, where 14,250.00 + 0.00 = 14,250.00.

### State contracts

| State | Response |
|---|---|
| Empty (no loans match the filters) | `200`. `rows` empty, `totalCount` 0, `filteredTotal` 0.00, filters echoed. A type and range pair matching nothing is this state, not an error |
| Partial (a loan's aging cannot be resolved) | `200`. The loan is returned with `amountDue` populated and `daysPastDue` and `rangeKey` null. It is counted in `totalCount` and `filteredTotal`. A null `rangeKey` row is excluded by any specified `rangeKey`, and included when the param is omitted |
| Not-yet-existing entity (a loan opened after `asOf`) | Excluded, because the read is anchored |
| Page past the last page | `200`. `rows` empty, `totalCount` and `filteredTotal` still correct, `page` echoing what was asked. Not an error |
| Permission denied | `403` with `{"error":"forbidden"}` |
| Upstream unavailable | `503` with `{"error":"upstream_unavailable"}` and a `Retry-After` header. Never an empty `rows` array with a zero total, which would read as "nothing outstanding" |

---

## API 3: loan-type lookup

### Endpoint

```
GET /api/dashboard/loans-with-balance-due/filters
```

This is the endpoint that exists today. The contract below is what it must return; the only change from the live behaviour is the explicit null identifier on the "Show All" entry and the `asOf` stamp.

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| (none) | n/a | n/a | n/a | n/a | The list is fully determined by the tenant and bank-account context. No filter cascades into it |

Context header: `X-BankAccountID`, required. The list itself is filtered `WHERE TenantID = ctx`, which is a different scoping key from the loan reads. See Auth and scoping.

### Example requests

```
GET /api/dashboard/loans-with-balance-due/filters
GET /api/dashboard/loans-with-balance-due/filters        (identical; the response is TTL-cached for 15 minutes and may be shared with any other loan surface)
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | ISO 8601 datetime | DERIVED request anchor [BUILD] | When the list was read. Not the anchor for the data reads |
| `loanTypes[]` | array | STORED LNType [CODE - LNTypeRepository.GetAll().OrderBy(Name)] | Ordered by name, with the "Show All" entry prepended |
| `loanTypes[].loanTypeId` | guid or null | STORED LNType.TypeID [CODE] | Null on the "Show All" entry. Selecting that entry means the client omits `loanTypeId` on the data reads |
| `loanTypes[].name` | string | STORED LNType.Name [CODE] | Display name |

### Example response

```json
{
  "asOf": "2026-07-24T00:00:00Z",
  "loanTypes": [
    { "loanTypeId": null,                                   "name": "Show All" },
    { "loanTypeId": "6b1f0c92-4d3a-4a17-9f21-3c8de5a10b44", "name": "Church - Special" },
    { "loanTypeId": "2c7d5f31-9a04-4b18-8e62-11de44a90002", "name": "Church Expansion" },
    { "loanTypeId": "9e30a8b7-51cc-4f79-b0a4-77fe22b30003", "name": "Individual" }
  ]
}
```

Reconciliation: 1 + 3 = 4 entries, being the prepended "Show All" plus the three loan types the live environment carries, and every non-null identifier here is a valid `loanTypeId` on API 1 and API 2.

### State contracts

| State | Response |
|---|---|
| Empty (the organisation has defined no loan types) | `200` with `loanTypes` holding the single "Show All" entry. The filter control renders and is inert, rather than vanishing |
| Partial | Not applicable. The list is either read in full or the read fails |
| Not-yet-existing entity (a type created after the cached read) | Absent until the TTL expires. A `loanTypeId` the client has not seen is never invented, and an unknown one sent to a data read returns `400 unknown_loan_type` |
| Permission denied | `403` with `{"error":"forbidden"}` |
| Upstream unavailable | `503` with `{"error":"upstream_unavailable"}`. The widget renders with the filter control disabled and still fires API 1 unfiltered, because the summary does not depend on this list |

---

## API 4: loan detail

### Endpoint

```
GET /api/dashboard/loans-with-balance-due/loans/{loanId}
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `loanId` | guid, path segment | Yes | An `LNLoan.LoanID` in scope for the context bank account | None | The loan to read |
| `asOf` | ISO 8601 datetime | No | Any instant not in the future | Omitted, meaning request time | The same anchor the table page was read at, so the modal's amount due matches the row the user clicked |

Context header: `X-BankAccountID`, required.

### Example requests

```
GET /api/dashboard/loans-with-balance-due/loans/1a4c7e10-0b21-4d55-8f3e-90ab11c20001?asOf=2026-07-24T00%3A00%3A00Z
GET /api/dashboard/loans-with-balance-due/loans/1a4c7e10-0b21-4d55-8f3e-90ab11c20004
```

The first is the anchored call the widget makes on a row click. The second omits the anchor and reads at request time, which is what a deep link into the modal does.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | ISO 8601 datetime | DERIVED request anchor [BUILD] | The snapshot this loan is described at |
| `currency` | string, ISO 4217 | UNVERIFIED (Feargal Phelan) [DOC - Step 6 dossier, section 10] | The organisation's currency code |
| `loanId` | guid | STORED LNLoan.LoanID [CODE] | Echo of the requested loan |
| `accountNumber` | string | STORED LNLoan.AccountNumber [CODE] | Account row in the modal |
| `borrowerName` | string | STORED LNLoan.Name [CODE - legacy grid Borrower Name column] | Shown beside the modal title |
| `loanTypeId` | guid or null | STORED LNLoan.TypeID [CODE] | Null when the loan has no type assigned |
| `loanTypeName` | string or null | STORED LNType.Name via LNLoan.TypeID [CODE] | Loan type row |
| `originalAmount` | decimal(2) | STORED LNLoan.TotalAmount [CODE - LNLoan] | Original amount row |
| `amountDue` | decimal(2) | DERIVED SUM(Principal + Interest) minus posted payments [CODE] | Amount due row. Must equal the clicked row's `amountDue` at the same `asOf` |
| `rangeKey` | string or null | NEW, requires the allocation [DOC - Step 1 research] | The loan's assigned range, null when the aging cannot be resolved |
| `rangeLabel` | string or null | NEW [BUILD] | Display label for that range, so the modal does not re-derive it from the ladder |
| `daysPastDue` | int or null | NEW, requires the allocation [DOC - Step 1 research] | Signed. Negative or zero means nothing is yet due |
| `nextPaymentDueDate` | date or null | UNVERIFIED (Feargal Phelan) [TO CONFIRM] | Due date of the loan's earliest unpaid invoice. No confirmed due-date column has been traced on `LNInvoice`, so this field is not on the same footing as the stored fields beside it |
| `lastPaymentDate` | date or null | DERIVED MAX(LNPayment.PaymentDate) WHERE Posted AND VoidJournalID IS NULL [CODE - LNPayment] | Last payment row. The client derives "days ago" and the dormancy note from this and `asOf` |
| `payments[]` | array | STORED LNPayment [CODE] | Qualifying payments, most recent first |
| `payments[].paymentDate` | date | STORED LNPayment.PaymentDate [CODE] | Date column in the payment history |
| `payments[].reference` | string or null | STORED LNPayment.CheckNumber [CODE] | Cheque number or reference string. This is a reference, not a payment-method enum; no method enum is confirmed in the data |
| `payments[].amount` | decimal(2) | DERIVED Principal + Interest + LateFee + AdditionalPrincipal + AdditionalDraw - Adjustment, returned pre-signed [CODE - LNPayment] | Amount column. Can be negative when an adjustment exceeds the rest |

### Example response

```json
{
  "asOf": "2026-07-24T00:00:00Z",
  "currency": "USD",
  "loanId": "1a4c7e10-0b21-4d55-8f3e-90ab11c20001",
  "accountNumber": "LN-1042",
  "borrowerName": "Grace Fellowship",
  "loanTypeId": "2c7d5f31-9a04-4b18-8e62-11de44a90002",
  "loanTypeName": "Church Expansion",
  "originalAmount": 150000.00,
  "amountDue": 28450.00,
  "rangeKey": "current",
  "rangeLabel": "Current",
  "daysPastDue": -8,
  "nextPaymentDueDate": "2026-08-01",
  "lastPaymentDate": "2026-07-08",
  "payments": [
    { "paymentDate": "2026-07-08", "reference": "ACH",         "amount": 2100.00 },
    { "paymentDate": "2026-06-08", "reference": "Check #2093", "amount": 2100.00 }
  ]
}
```

Reconciliation, payment history: 2,100.00 + 2,100.00 = 4,200.00 of qualifying payments shown, and `lastPaymentDate` of 2026-07-08 is the maximum `paymentDate` in the array. `amountDue` of 28,450.00 is not derivable from this array: it is invoiced principal and interest minus **all** posted payments including any that predate the returned history, so a developer must not try to cross-foot the two.

`amountDue` of 28,450.00 must equal the `rows[].amountDue` for the same `loanId` on API 2 at the same `asOf`, and `rangeKey` must equal that row's `rangeKey`.

### State contracts

| State | Response |
|---|---|
| Empty (the loan has no qualifying payments) | `200` with `payments` as an empty array and `lastPaymentDate` null. The modal renders its own "no payments recorded yet" state |
| Partial (the loan's aging cannot be resolved) | `200` with `rangeKey`, `rangeLabel` and `daysPastDue` all null. The modal omits the aging and days rows rather than showing a zero |
| Not-yet-existing entity (the loan was opened after `asOf`) | `404` with `{"error":"not_found"}`. An anchored read must not describe a loan that did not exist at the anchor |
| Unknown or out-of-scope `loanId` | `404` with `{"error":"not_found"}`. Out of scope for the context bank account is indistinguishable from not existing, deliberately, so the response does not leak the existence of another account's loan |
| Permission denied | `403` with `{"error":"forbidden"}` |
| Upstream unavailable | `503` with `{"error":"upstream_unavailable"}` and a `Retry-After` header |

---

## Auth and scoping

- **Company and tenant scoping.** Every request carries the `X-BankAccountID` context header, and every query is scoped by it. The legacy panel scopes loans by bank account, so this is the same population, not a widened one. The loan-type lookup is scoped `WHERE TenantID = ctx` instead, which is a **different key**: a bank-account context and a tenant context are not the same scope, and the mismatch is recorded in Still needs sign-off rather than resolved here.
- **Permission right required to read.** `/LoanProcessing` at Inquiry level. This is the panel's declared access route, and the legacy gate enforces exactly this pattern: the widget is only offered in the picker when the user is allowed, and if it is already placed its body renders hidden. [CODE - AccessUri `/LoanProcessing`; gate confirmed in `DataPanelControl.cs`] The modern registration labels the module "Loans" while the legacy access route is `/LoanProcessing`; the **access route is what gates**, not the module label.
- **Write right.** None. This contract defines no write. "Record a contact" would need one and has no endpoint here.
- **What a user without the right sees.** `403` from all four endpoints, and the widget is not offered in the picker at all, matching the legacy gate. Whether an already-placed widget disappears silently or shows an explicit no-access message is a product decision and is in Still needs sign-off with a named owner.
- **What a user with read but not write sees.** The full widget. Every read here is available to an Inquiry-level user and nothing on screen depends on a write right.

---

## Edge cases

1. **No loans with a balance anywhere.** API 1 returns zeroes with all five ranges present; API 2 returns an empty page with `filteredTotal` 0.00. The widget shows its settled state rather than an empty chart.
2. **A loan type with no outstanding loans.** Same zero shape, with the type echoed so the client can name it.
3. **A range holding nothing is selected anyway.** The client makes zero-count ranges inert, so this should not arise, but a directly constructed request returns an empty page with the correct `totalCount` of 0, not an error.
4. **A loan at exactly 90 days past due** is assigned to `d61to90`, not `over90`. The `over90` range starts at 91. The label reads "90+ days"; the boundary is the number, not the label.
5. **A loan at exactly 0 days** is Current. Due today is not yet past due.
6. **A loan invoiced far in advance,** with a large negative `daysPastDue`, is still Current. There is no "future" range.
7. **A loan that has never had a payment.** `lastPaymentDate` null, `payments` empty. No dormancy flag is shown, because dormancy measures elapsed time since a payment and there is no baseline. Nulls sort last on `lastPaymentDate` in both directions.
8. **A loan whose only payments are voided.** The consistency filter drops them, so it behaves exactly as case 7. A voided payment must never set a last-payment date.
9. **A loan with no type assigned.** Included when `loanTypeId` is omitted, excluded by any specified value, `loanTypeName` null. A blank type is never a wildcard.
10. **Division by zero.** Every server-computed percentage returns `0` when `totalAmountDue` is zero. This applies to `pastDuePct` and every `ranges[].sharePct`.
11. **Whole-percent rounding.** The five `sharePct` values need not sum to exactly 100. The client renders them and never reconstitutes the total from them.
12. **Pagination past the end.** Empty `rows`, correct `totalCount` and `filteredTotal`, `page` echoed. Not an error.
13. **`pageSize` above the maximum.** Clamped to 200 and echoed in the response, so the pager stays correct. Not an error.
14. **Contradicting params.** An unknown `loanTypeId`, an unknown `rangeKey` or a `sortBy` outside the whitelist each return a `400` with the named error. Silent fallback is never used, because a silently substituted sort makes a paginated list skip and duplicate rows.
15. **A valid pair matching nothing.** A loan type whose loans are all current, combined with `rangeKey=over90`, is a legitimate empty result.
16. **A loan opened mid-snapshot.** A loan created after `asOf` is absent from both reads and returns `404` from the drill, so the header, the table and the modal cannot disagree about whether it exists.
17. **A loan paid off mid-session.** The shared `asOf` keeps it visible in the table and readable in the drill for the life of the snapshot. It disappears on the next refresh, which is when both reads re-anchor together.
18. **A stale snapshot when the user drills.** The modal is read at the table's `asOf`, so its amount due matches the row that was clicked even if a payment posted in between. A refresh is the only thing that moves the anchor.
19. **A negative composed payment amount,** where `Adjustment` exceeds principal plus interest plus fees, is returned signed and rendered as a negative. It is not clamped to zero and it is not dropped.
20. **A loan whose balance survives allocation across several invoice ages.** It is assigned one range, the most severe holding balance, and its whole `amountDue` counts there. This is a departure from the legacy per-bucket split and it is in Still needs sign-off.
21. **A very long payment history.** Bounded by the stored schedule length, so the array is returned whole. If a loan is ever found to exceed a few hundred qualifying payments, the array gains a cap and a count field; that is not needed at the confirmed bound.
22. **The organisation currency cannot be resolved.** `currency` is never null. The tenant default is returned and the unresolved organisation setting is an open item, not a null on the wire.

---

## Not in scope

- **A Status filter, and any Active or In Arrears field.** No backing field is confirmed in the source data, so nothing is specced. Overdue-ness is available only through the range ladder. Blocking, see Still needs sign-off.
- **A Fiscal Year filter.** Balance due is an as-of-today snapshot with no fiscal-year dimension. A fiscal-year-scoped filter on loan origination date is a future ask, not part of this contract.
- **A Portfolio at Risk metric.** The contract returns the past-due and 90+ reads the widget renders. PAR is a further metric with its own definition and is not returned.
- **A portfolio-risk block or a most-overdue borrower list as separate reads.** Nothing on screen consumes them, so no endpoint funds them. The figures they would need are already in API 1.
- **Days past due as a table column.** The field is on the row, because the range filter and the drill need it, but no table column consumes it. It is not removed from the row, because the drill and the range assignment both read it.
- **Per-range subtotals inside the table.** The table is one flat list; the range breakdown is stated once, by API 1's `ranges[]`.
- **A borrower person record.** `LNLoan.PersonID` reaches `CorePerson`, so a person name is available, but nothing on screen consumes one separately from `LNLoan.Name`, so no person field is returned.
- **A payment-method enum.** `payments[].reference` carries the cheque number or reference string. No method enum is confirmed in the data, so none is invented.
- **An Excel export endpoint.** No modern export endpoint exists. The export control in the drill has no backing call and does nothing until one is built.
- **A "Record a contact" write.** This contract is read-only. The control has no endpoint and no destination.
- **An "Open loan" navigation target.** The destination is unconfirmed, so there is nothing to call and nothing to link to.
- **Trimmed top-3 and top-5 loan lists.** The two larger tiers render the paginated list and the smallest renders no rows at all, so no ranked-subset read is needed.
- **A user preference store for the selected loan type, range or sort.** Selections live for the session only. The legacy per-user preference store is not read or written by this contract.

---

## Still needs sign-off

1. **The oldest-first payment allocation does not exist server-side. BLOCKING.** Every aging-derived figure in this contract depends on it: `ranges[]` in full, `pastDueAmount`, `pastDueCount`, `pastDuePct`, `ninetyPlusAmount`, `worstRangeKey`, per-loan `daysPastDue` and `rangeKey`, and the `rangeKey` filter itself. The existing chart read buckets invoices by raw invoice age with no payment subtraction, and **a raw-age implementation returns different numbers from the legacy panel**, which is the whole point of the widget. Decided by: backend team, owner not yet named. Blocked until then: the range ladder, the donut, the chip row, the past-due pill, the 90+ read, the range filter and the drill's aging rows. The total balance due, the loan count and the loan list are **not** blocked; they rest on the confirmed amount-due formula.
2. **One range per loan versus the legacy per-bucket split. BLOCKING anything aging-derived.** This contract assigns each loan exactly one range and counts its whole balance there, because the widget filters loans by range, counts loans per range and shows one aging value per loan in the drill. Legacy distributes a single loan's balance across several buckets, so **even once the allocation is replicated, the donut will not equal the legacy pie**. Decided by: Oisin Curran with the backend team. Blocked until then: whether `ranges[].amountDue` is a loan-level or an invoice-level figure, which changes the cross-footing rule between API 1 and API 2.
3. **The Status field, Active or In Arrears, has no confirmed backing field. BLOCKING.** No explicit status field has been found in the source data. Nothing is built and nothing is specced. Decided by: backend team, owner not yet named. Blocked until then: any status filter, any status field on a row, and any status badge.
4. **Whether loan start and end dates exist at all.** The loan-entry process may not capture them, in which case date-based and past-due calculation would come out entirely and these loans would be treated as balances rather than schedules. [SME - Feargal Phelan, 25 Aug 2026] The design this contract describes is confirmed and is specced as it stands. Decided by: Feargal Phelan. If it resolves against the dates, the whole range ladder drops, taking `ranges[]`, the `rangeKey` param, `daysPastDue`, `worstRangeKey`, the past-due and 90+ reads and API 4's aging rows with it.
5. **Every sign-off dossier flag is unreviewed.** The widget has no `Reconciliation - Loans With Balance Due.md`, so no flag carries an Accepted, Rejected or Disputed status. The flags that touch a data shape, each needing a status before the part it touches is built:
   - **Ladder shape.** The dossier asks for four accurately labelled buckets, Current / 1-30 / 31-60 / 90+, rendered as an ordered bar. The server in this contract owns a five-range ladder that adds 61-90 and treats Current as "nothing yet due" rather than "under 30 days". The two do not agree on the ladder, and the ladder is a response shape.
   - **Portfolio at Risk.** The dossier asks for a PAR metric alongside past due and 90+. This contract returns no PAR field and no PAR definition.
   - **Organisation currency.** The dossier records the live panel rendering a pound sign regardless of the organisation. `currency` closes it on the wire, but which organisation setting holds the code is not traced in code.
   - **A "data as of" stamp.** The dossier asks for one beside the refresh control. `asOf` exists on the wire; whether it is shown to the user is undecided.
   Decided by: Oisin Curran, to assign a status to each.
6. **The dormancy threshold of 90 days is not an approved business rule.** It is a client-side presentation band over `lastPaymentDate` and `asOf`, and it drives an indicator on the table and a note in the drill. Decided by: Oisin Curran with Feargal Phelan. Blocked until then: nothing on the wire, but the threshold must not be treated as settled.
7. **The worst-realistic loan volume has no cited basis.** The live environment shows 3 loans and the dossier records low adoption, neither of which is a ceiling. Decided by: Feargal Phelan. Blocked until then: the `pageSize` maximum of 200 and the cost model's multiplier are provisional, and the pagination verdict stands precisely because the ceiling is unknown.
8. **The scoping key mismatch.** The loan reads are scoped by `X-BankAccountID` and the loan-type lookup by `TenantID`. If an organisation has several bank accounts running loans, the lookup can offer a type that has no loans in the current bank account. Decided by: backend team, owner not yet named. Blocked until then: whether the lookup should take the bank-account context too.
9. **Entitlement behaviour for an already-placed widget.** A user without `/LoanProcessing` Inquiry gets `403` from every endpoint and the widget is not offered in the picker. Whether an already-placed instance disappears or shows an explicit no-access message is undecided. Decided by: Oisin Curran.
10. **The "Open loan" destination.** The account name is already a link in the live panel and its destination has never been confirmed. Decided by: owner not yet named. Blocked until then: the control stays inert.
11. **Whether "Record a contact" becomes a real write.** It needs a contact-log destination and a write endpoint, neither of which exists. Decided by: owner not yet named.
12. **Whether an export endpoint gets built.** No modern export endpoint exists anywhere in the codebase; legacy panels export in-page. Decided by: product, owner not yet named. Blocked until then: the drill's export control does nothing.
13. **The nextPaymentDueDate source.** No due-date column has been traced on `LNInvoice`, so the field is `UNVERIFIED` and must not be built against an assumed column. Decided by: Feargal Phelan.

This list is deliberately long. Items 1, 2 and 3 are the ones that stop work: everything the widget says about aging rests on backend work that does not exist yet.
