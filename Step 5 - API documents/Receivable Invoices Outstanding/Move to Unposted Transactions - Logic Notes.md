# Receivable Invoices Outstanding — "Move to Unposted Transactions" Logic Notes

**Status: WORKING NOTES — not the API spec.** This is a pre-spec logic-capture doc for the Confirm action added to the W05 detail modal (select invoices, Confirm, intended action: move to unposted transactions). It exists because that action is a real posting-workflow that reaches into other parts of the legacy system, and the API spec will need a lot of that logic pinned down first. It separates what is confirmed from what still needs a dev or SME answer, and it does not state any accounting rule as fact that has not been verified against the real system. Written 2026-07-28.

## 1. The interaction being specified (from the built Final)

In the W05 Final, the aging table drills into a per-bucket detail modal ("Receivable Invoices Outstanding: Detail", columns Customer / Bill To / Due Date / Invoice # / Days Past Due / Outstanding, footer "N invoices / total", Export to Excel, Close). The owner-added enhancement:

- A checkbox on each invoice row (row-level only, no select-all).
- A "Confirm" button beside Close, always enabled.
- On Confirm, an inline note appears reading "Move to unposted transactions" plus a muted "(N invoices selected)".

That inline note is a **developer-intent signal**, not finished copy or a finished workflow. It says: the invoices the user ticked are meant to be moved into the system's unposted-transactions queue so processing can begin. This doc is where that intent gets turned into concrete backend questions.

## 1b. Decision update (2026-08-05, owner)

Confirm does **not** stage the invoices to an entry screen. It **creates** the transaction through a process that reaches into the posting subsystem, and the underlying capability already exists in the code (Payment Processing / ARPayment is the likely mechanism). What still has to be added is that process wiring, and the exact target queue / transaction type is not specifiable yet, so the widget keeps only the intent label and models no transaction type. The questions below stay open for the dev/SME to pin the exact type and destination queue.

## 2. What "unposted transactions" means in this system (grounded)

This is not a new concept invented for the widget. The posting lifecycle is already all over the legacy system:

- A transaction is **entered** (created), sits as **unposted** (recorded but not yet committed to the general ledger), and is later **posted** (committed). Posting is the deliberate accounting step that makes an entry final and ledger-affecting.
- Each module keeps its own unposted queue. The W08 (My Status) research lists these as real, user-trackable queues: **Unposted Journal Entries** (General Ledger / Unposted Journals page), **Unposted Bank Transactions**, **Unposted Credit Card Transactions**, **Unposted AP Transactions**, **Unposted Payroll Manual Checks** (source: `Step 1 - Dashboard Research/08 - My Status.md`).
- These queues have dedicated pages elsewhere in the app. W08 documents that clicking "Unposted Journal Entries" navigates the user to the GL / Unposted Journals page with its own filters. So "the unposted transactions area" is a real destination, per-module, not a concept this widget owns.
- W14 (Main Content Tasks) also references Unposted repeatedly as a cross-module concern (source: `Step 1 - Dashboard Research/14 - Main Content Tasks.md`).

**What this means for AR specifically, and the first open question:** the W05 widget only shows invoices where `Posted = true AND UndoJournalID = null AND Outstanding != 0` (confirmed, section 3). Those invoices are ALREADY posted. So "move to unposted transactions" cannot mean un-posting the invoice itself in the naive sense. It most likely means: selecting outstanding posted invoices spawns a NEW transaction (for example a receipt/payment against them, a write-off, or an adjustment) that is created in an unposted state and lands in the relevant module's unposted queue for review before it too is posted. The exact transaction type is **not confirmed** and is the central thing the dev/SME must define (section 5, Q1).

## 3. W05's confirmed data facts (from Step 1 + the Classic comparison)

Verified against the legacy `ReceivableInvoices : DataPanelControl` (`/AccountsReceivable`) via `Widget_Comparison_Classic.html`, 2026-07-08:

- Tables: `ARInvoice` (posted status, amounts, due dates), `ARInvoiceDetail` (line items), `ARRevenueCenterRepository` / `ARSourceRepository` (dynamic filter lists).
- Invoice filter: `Posted = true AND UndoJournalID = null AND Outstanding != 0`.
- Outstanding = `TotalAmount + SalesTax − Payments − Discounts − WriteOffs`.
- Age bucket: `Age = Today − DueDate` in days → Current (<31) / 31-60 / 61-90 / 91-120 / 121+.
- Known Modern API gap: `BillToDisplay` (the "Bill To" name in the detail panel) returns empty today. Pre-existing, unresolved.
- The legacy detail panel already enumerates individual invoices per bucket (Customer / Bill-To / Invoice# / Due Date / Days Past Due / Outstanding) with Excel export. The checkboxes attach to those existing rows.

`UndoJournalID` is worth noting: its presence on the AR filter shows AR invoices are tied to journal records, and an invoice with a non-null `UndoJournalID` is one that has been reversed. This is the same journal/posting machinery the unposted queues live in.

## 4. The cross-page logic the action reaches into (what the API doc must map)

The Confirm action is not self-contained inside the AR widget. Moving invoices to unposted transactions touches the posting subsystem that other pages own. The API doc will need to establish:

- **Which unposted queue** the created transactions land in (AR-side receipt/adjustment queue, or the GL Unposted Journals queue, or both via a journal). W08 shows these are distinct, module-specific queues.
- **What a created transaction record needs** to be valid and postable later (the fields a receipt/write-off/adjustment requires: amount, date, revenue center, source, GL accounts, reference back to the ARInvoice, batch/journal id, created-by, created-date).
- **How the existing "post" step works** on those other pages, since whatever this action creates has to be consumable by the same posting engine (so the created records are not orphans a human cannot action).
- **Reversibility**: an unposted transaction can normally be edited or deleted before posting. Confirm here should produce records that behave the same way, not a committed change.

None of the exact mechanics above are confirmed from the sources in hand. They are the map of where to look, not answers.

## 5. The big shift for the API spec: this is a WRITE action

Every widget spec written so far in this project (W01-W04, W07) is READ-only: the widget requests data and renders it. **This is the first widget whose design includes a mutation** (create unposted transactions from a user selection). That changes the shape of the spec substantially and raises questions no prior spec had to:

- **Q1 (the central one): what transaction type does Confirm create?** A receipt/payment against the selected invoices? A write-off? A generic adjustment? A batch queued for a specific process? This is an accounting/product decision (SME) as much as a dev one, and everything else depends on it.
- **Q2: which unposted queue / endpoint** receives the created records, and does one Confirm create one batch or N individual transactions (one per selected invoice)?
- **Q3: request shape** — the action endpoint takes the selected invoice ids (and probably a company/context id, and possibly amounts if partial). Confirm whether the amount moved is always the full Outstanding or can be partial.
- **Q4: validation** — what stops an invoice being moved twice, or moved while another unposted transaction already references it (idempotency / double-processing guard)? What permission is required (the legacy "post" right, or a different one)?
- **Q5: response** — what does the action return (the created batch/transaction ids, a link to the unposted queue page so the user can go finish the posting, a success/partial-failure list if some invoices could not be moved)?
- **Q6: reversibility and audit** — created-by/created-date, and confirmation that the records are editable/deletable while unposted (nothing is committed to the ledger by Confirm itself).
- **Q7: concurrency** — two users selecting overlapping invoices; the aging figures are an as-of-today snapshot, so the widget's view may be stale by the time Confirm runs.
- **Q8: the read side is unchanged** — the aging display keeps its existing read-only contract (section 3). Only the Confirm action is new. The spec should keep the two clearly separated.

## 6. Questions to put to the dev and the SME

Framed so a developer can trace the codebase (the way the Payroll pay-type breakdown was answered), and the SME can settle the accounting intent.

**For the dev (codebase trace):**
1. When a user today creates a receipt/payment/write-off/adjustment against a posted AR invoice, which table(s) and which unposted queue does that land in, and what is the create call? (This is almost certainly the exact mechanism Confirm should reuse.)
2. What is the postable-transaction record shape for that queue (required fields, references back to `ARInvoice`, batch/journal linkage)?
3. Is there an existing service/endpoint that creates these unposted records, or would this be new backend work? (Mirror of the payroll finding: is the data/machinery already there?)
4. What permission gates creating and posting these transactions?
5. How does the system prevent the same invoice being processed twice?

**For the SME / product (accounting intent):**
1. What does "process these outstanding invoices" actually mean to a bookkeeper here — recording receipts, writing off, sending to collections, something else? (Defines Q1 above.)
2. Full Outstanding only, or partial amounts?
3. After Confirm, should the user be taken to the unposted queue page to finish posting, or does Confirm hand off silently?

## 7. What NOT to do in the spec until the above is answered

- Do not invent the transaction type or the created-record shape. Write the read side (the aging display) as a clean contract now; hold the write side as a clearly-marked open action pending Q1-Q5.
- Do not describe Confirm as committing anything to the ledger. Its whole point is the opposite: it stages unposted records for human review and a later, separate post step.
- Keep the "Move to unposted transactions" wording flagged as dev-intent, not final UI copy.

## 8. Confirmed from the codebase (MBAccounting, traced 2026-07-28)

Five scoped traces through the real solution. Legacy is ASP.NET Web Forms; the modern rewrite is .NET + React and is not yet built for this widget.

1. **The widget is display-only.** `Shelby.Web.Financials/DataPanelControls/ReceivableInvoicesOutstanding.ascx.cs` renders the aging grid + drill-down (its detail control is reused from `GeneralLedger.PostedJournals`) + Excel export, and has no create/post/receipt action. So Confirm is genuinely NEW capability, not an existing widget action. The filter and Outstanding formula match the docs exactly (`Posted && UndoJournalID==null && Outstanding!=0`).

2. **The unposted-to-posted machinery already exists and is reusable.** `ARInvoiceRepository` exposes `FinalizePost(blobID, datePosting)`; posting validates the fiscal year first (`CheckTransactionsAgainstCurrentYear`), optionally writes GL journal details when the company has `ARCompany.InterfaceGL` on, and has an `Undo` flow (so unposted records are reversible). This is not new infrastructure to build.

3. **The "select records, then act" pattern is already how the legacy system works.** Posting reads the chosen records from a user preference `UserPreferences.ARInvoicesFilters` -> `"SelectedIDs"` (a comma-separated GUID list). The widget's row-checkbox selection maps directly onto this existing mechanism.

4. **Two AR flows are the real candidates for "process," and which one settles Q1:**
   - `AccountsReceivable/UnpostedInvoices/` (Default, Update, Preview, Post, Undo, Import) is the unposted-INVOICE queue, i.e. invoices not yet posted. The W05 widget shows invoices that are already posted, so this queue is likely NOT the destination for them.
   - `AccountsReceivable/PaymentProcessing/` (Default, Preview, ProcessPayments, Update) is how an already-posted OUTSTANDING invoice actually gets worked: by recording a payment/receipt against it, which itself enters an unposted state and is then posted. This is the more likely meaning of "process these outstanding invoices," and it reuses the same select-post-undo machinery above.
   - So Q1 is now a narrow SME choice (record receipts via PaymentProcessing vs. some other AR action), NOT an open infrastructure question: whichever it is, the create/select/post/undo/GL-interface plumbing already exists.

5. **Modern side is greenfield.** No `receivable-invoices` modern API key or AR React/controller code was found for this widget, consistent with only some widgets being rewritten so far. The read contract and the Confirm action both get built fresh on the modern .NET + React stack, reusing the legacy repository logic as the reference behaviour.

**Net for the API spec:** the read side is fully specifiable now. The write action is a thin new endpoint over existing repository behaviour (select by ids -> create unposted payment/receipt records -> later Post, with Undo for reversal, GL interface conditional on `ARCompany.InterfaceGL`). The one thing still needing an SME word is Q1's exact transaction type (PaymentProcessing receipt is the strong candidate); everything the doc listed as "new backend work" in section 5 is actually reuse of shipped machinery.

## 9. Correction (2026-07-28): the action is payment processing, not invoice-unposting

An earlier reading of these notes framed Confirm as moving invoices "to unposted transactions." A closer codebase trace (owner-prompted) corrects that. The accurate model:

- **The widget's invoices are posted and awaiting payment, not unposted invoices.** They come from `ARInvoice` with `Posted = true AND UndoJournalID = null AND Outstanding != 0`. The `AccountsReceivable/UnpostedInvoices/` module is a separate pre-posting queue for invoices not yet posted and is NOT the source of, or destination for, this widget's invoices.
- **What gets created/queued is a PAYMENT, and the payment is the unposted transaction.** Confirmed in `Shelby.Repository/EntityRepositories/AR/ARPaymentRepository.cs`: a payment is an `ARPayment` (has a `Posted` flag, false then true) whose `ARPaymentDetail` rows each apply to a specific `ARInvoice` (revenue center / source come from that invoice). Unposted payments (`Posted = false`) are listed in the Payment Processing screen (`GetAllCurrentContextByFilters(posted:false, ...)`), selected by a `SelectedIDs` (PaymentID) preference, and posted by `ARPaymentRepository.ProcessPayments(blobID, postingDate)` (fiscal-year checked, GL interface gated on `ARCompany.InterfaceGL`, unapplied cash handled).
- **The paid lifecycle:** posting a payment reduces the invoice's Outstanding (the Outstanding formula subtracts Payments). When Outstanding reaches 0 the invoice is fully paid and drops out of this widget. So the widget's job is the "awaiting payment" end of the flow; Payment Processing carries it to "paid."
- **So the Confirm action's real intent** is: for the selected outstanding invoices, create or queue unposted payments in the Payment Processing queue, to be processed to paid. The dev-intent label "Move to unposted transactions" is accurate only in the sense that the created PAYMENT is an unposted transaction; it is not the invoice being unposted.

**The one remaining SME nuance (revised Q1):** does Confirm create the `ARPayment` / `ARPaymentDetail` records outright (and if so, full Outstanding or a partial amount?), or does it stage the selected invoices into the existing payment-entry screen for a person to key the payment? Both feed the same `ARPayment` + Payment Processing machinery; the choice is a product/SME call, not new infrastructure.

## Sources
- `Step 1 - Dashboard Research/05 - Receivable Invoices Outstanding.md` (W05 purpose, tables, filter, formula, Bill-To gap).
- `Step 1 - Dashboard Research/08 - My Status.md` (the unposted queues: Journal Entries, Bank, Credit Card, AP, Payroll Manual Checks; the GL Unposted Journals destination page).
- `Step 1 - Dashboard Research/14 - Main Content Tasks.md` (Unposted as a cross-module concern).
- `Step 5 - API documents/Widget_Comparison_Classic.html` (legacy `ReceivableInvoices` panel: filter, formula, drill columns, caching).
- The built W05 Final in `Step 3 - Mock_Work/Dashboard Widget Mockups.html` (the checkbox + Confirm + inline-note interaction).
