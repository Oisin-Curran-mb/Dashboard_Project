# Receivable Invoices Outstanding (W05) — API Spec Decisions Log

Dated record of decisions, superseded thinking and change history for this widget's API spec. Kept **outside** the spec so the spec itself stays a present-tense contract. The spec may state an outcome here as fact; it never narrates the decision.

---

## 2026-08-30 — V2 spec written against build v2.3

A V2 spec was written into `v2/`, replacing nothing: the V1 spec stays in place, frozen, at the folder root.

**Build-vs-doc conflict gate tripped on two material conflicts, both ruled by the owner.**

1. **Aging bands — six, not five.** Build v2.3 (`ARF_BUCKETS`) carries six bands: Current (not yet due), 1-30, 31-60, 61-90, 91-120, 121+. The Step 4 doc still describes five and records the band change as *"HELD… Not changed pending confirmation (action list item C1)"* from the 2026-08-25 Feargal call. **Owner ruling: the build is right, spec six bands.** The 1-30 band is what closes the gap Feargal raised, and it is a precondition for the overdue figure. Consequence: the Step 4 doc is now stale on band count and needs updating; the hold should be formally lifted with Feargal.

2. **Drill modal scope.** The Step 4 doc records from the same call that the widget *"is a navigation and prioritisation tool, not a replacement transaction screen"* and should open the existing invoice screen, and the doc itself flags that the v2.0 modal *"reproduces a good deal of the transaction screen."* Build v2.3 still has the full modal. **Owner ruling: spec the build as-is.** Consequence recorded in the spec's sign-off list: if this later resolves toward navigate-out, API 4 (invoice detail) and API 5 (the Confirm write) are both dropped and API 3 becomes a list of deep links. This is the contract's largest scope risk.

**Other drift found between the V1 spec and build v2.3:**

- V1 spec's worked examples use 8 invoices totalling $33,530. The build's dataset is now **23 invoices totalling $84,570**, with 20 overdue totalling $78,390. All V2 examples use the real current figures.
- The build's own prose block still says `FC_VERSION[5] = 2.0` while `FC_VERSION` actually reads `5:'2.3'`. The narrative in the Step 3 section was not updated across v2.1–v2.3.
- **Overdue definition fixed in build v2.1.** A code comment records that it was `days > 30`, which excluded every invoice 1-30 days past due from the headline overdue figure *while also labelling them "Current"*. It is now `days > 0`. The V1 spec has no overdue concept at all.
- **Customers view added** (v2.1): per-customer rollup carrying total, invoice count, worst band and `oldest` days-past-due, sortable on three keys with a reciprocal tiebreaker, paginated at 7 rows (`ARF_CUST_PAGE`). Absent from the V1 spec entirely.
- **Line items gained `qty` and `unit`.** V1 spec had description and amount only.
- Row drawer gained **"Open invoice"** (opens the existing invoice screen) and **"Record a follow-up"** actions. The first is the navigate-out behaviour Feargal asked for and it already exists in the build; the second is unwired and is listed out of scope.

**Architectural conclusion recorded during the V2 pass.** The built Final treats the Customers view, its sort and its pagination as instant client-side operations, which is only viable because the demo dataset is 23 rows held entirely in the browser. At real volume the client holds at most one page and can therefore neither rank customers, nor sort that ranking, nor total it. All three move server-side — this is why the V2 spec has an API 2 that the V1 spec did not, and why API 2 and API 3 both carry `sortBy`/`sortDir`/`page`/`pageSize` with full-set aggregates.

**Open items carried forward from V1, still open:** the Attachments / Note / Payments sources for the per-invoice detail (only line items are confirmed against `ARInvoiceDetail`); and the Confirm create-vs-stage, full-vs-partial-amount product nuance.

**Open items newly raised by V2:** worst-case row ceilings for the customer rollup and the invoice list (the build's 23 invoices are a demo figure and not a basis for a ceiling); and band-boundary reconciliation against any shared `ap-ar-aging` surface.

---

## History harvested out of the V1 spec

Recorded here so the V2 contract does not have to carry it.

- The V1 spec's status line read `Status: Complete at Step 5 — awaiting management sign-off`, with a parenthetical noting *"DRAFT header removed 2026-08-19, owner decision: status now matches the index."*
- V1 was written 2026-07-28 against the then-built Final, structured as three APIs: the aging summary with `invoiceCount` as its one new field; the pop-up bucket list plus the project's first mutation; and the per-invoice drill-in detail.
- The move-to-unposted mechanism was traced in the MBAccounting codebase and recorded in `Move to Unposted Transactions - Logic Notes.md` (section 9). That trace still stands and V2 reuses its findings: the `ARPayment` / `ARPaymentDetail` / `ProcessPayments` path, the `PaymentProcessing` right, the `Outstanding != 0` eligibility guard, and `ARCompany.InterfaceGL` gating GL journal detail on post.
- V1 recorded that there is no explicit "invoice already has an unposted payment" lock; the guard is the eligibility filter plus a cap limiting the applied amount to the invoice's Outstanding. V2 expresses this as the `asOf` staleness guard plus the per-invoice `rejected[]` list.
