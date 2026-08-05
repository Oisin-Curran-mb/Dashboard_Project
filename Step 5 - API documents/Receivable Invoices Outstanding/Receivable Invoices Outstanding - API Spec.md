# Receivable Invoices Outstanding — API Spec

**Status: DRAFT — not final**

## Overview

The widget shows how much money is currently owed to the organisation in posted-but-unpaid invoices, grouped into five aging buckets by how far past due each invoice is. The built Final drills from the aging summary into a per-bucket invoice list, and from each invoice row into its full line-item detail. It also adds one owner-requested action: ticking invoices in the bucket list and pressing Confirm to process payment against the selected outstanding invoices, moving them toward paid.

This spec is structured as **three APIs**, owner-confirmed:

- **API 1, Widget (aging summary).** The existing aging read, with one addition: an invoice count per bucket alongside the existing per-bucket outstanding dollar total. Read-only.
- **API 2, Pop-up (bucket invoice list + Confirm action).** A read that returns the invoice rows for one selected bucket, and a write that processes payment against the selected invoices (creating or staging an unposted payment). The write is the one open part of this contract (see below). This is the project's first mutation.
- **API 3, Drill-in detail (per invoice).** The deep detail behind a single invoice row's expand arrow: line items, attachments, note, payments. Read-only.

API 1 and API 3 are read-only and fully specifiable now. API 2's read side is specifiable now; its write side (the Confirm action) reuses the AR payment machinery that is confirmed to exist in the codebase (`ARPayment` / Payment Processing / `ProcessPayments`). The mechanism is settled; the one open item is a product nuance (whether Confirm creates the payment outright, full or partial, or stages the invoices into the payment-entry screen). See "Still needs sign-off" and the logic-notes file `Move to Unposted Transactions - Logic Notes.md` (section 9) in this folder.

The write action stages an unposted payment for a later, separate post step in Payment Processing. It does not commit anything to the general ledger by itself. The widget's invoices are posted invoices awaiting payment, NOT records from the AR unposted-invoices queue.

Everything computable client-side stays client-side, per the project's minimal philosophy: percent-of-total per bucket, grand-total aggregation, table sorting, and the pie/stacked-bar chart are all client operations over the returned figures. No server-side percentages or sort parameters.

## Tables

Shared across all three APIs. No new tables are needed; the redesign is new queries against the same tables the legacy `ReceivableInvoices : DataPanelControl` already uses, plus reuse of the existing AR posting repository for the write action.

| Table / repository | Fields and members used |
|---|---|
| `ARInvoice` | `Posted`, `UndoJournalID`, `TotalAmount`, `SalesTax`, `Payments`, `Discounts`, `WriteOffs` (the Outstanding formula), `DueDate` (aging), customer name, `BillToDisplay` (the Bill To name, blank by design when the bill-to party equals the customer, see note), invoice number |
| `ARInvoiceDetail` | Invoice line items: item name and amount (API 3 detail). Confirmed source for line items |
| `ARRevenueCenterRepository` | Supplies the Revenue Center dropdown list, dynamically populated from the data (not a fixed list) |
| `ARSourceRepository` | Supplies the Source dropdown list, dynamically populated from the data (not a fixed list) |
| `ARPayment` / `ARPaymentDetail` | The write action feeds these: a payment (`ARPayment`, with a `Posted` flag) whose `ARPaymentDetail` rows each apply to a specific `ARInvoice`. Unposted payments (`Posted = false`) sit in the Payment Processing queue. |
| `ARPaymentRepository` | The write action reuses this: `GetAllCurrentContextByFilters(posted:false, ...)` (lists unposted payments), select-by-`SelectedIDs` (PaymentID), `ProcessPayments(blobID, postingDate)` (posts them), fiscal-year validation `CheckTransactionsAgainstCurrentYear`, unapplied-cash handling |
| `ARCompany` | `InterfaceGL`: gates whether posting the payment also writes GL journal detail |

**Invoice filter (confirmed, applied to every read):** `Posted = true AND UndoJournalID = null AND Outstanding != 0`. Voided invoices are excluded. Every invoice the widget shows is already posted.

**Outstanding (confirmed):** `Outstanding = TotalAmount + SalesTax - Payments - Discounts - WriteOffs`.

**Aging buckets (confirmed):** `Age = Today - DueDate` in days, assigned to Current (< 31), 31-60, 61-90, 91-120, 121+. The aging read is an as-of-today snapshot.

**Bill To conditional blank (by design).** `BillToDisplay` (the "Bill To" name shown in the pop-up detail list) is blank BY DESIGN, not a bug: the legacy sets it to empty when the bill-to party equals the customer and only populates it when they differ (`CustomerID == BillToCustomerID ? "" : ARCustomerBillTo.CorePerson.LastFirstMiddleNames`) (confirmed in code: ReceivableInvoicesOutstanding.ascx.cs, conditional BillToDisplay). The modern API should replicate that conditional, not "fix" a blank; noted in "Still needs sign-off".

## API 1 - Widget (aging summary)

Returns the five aging buckets, each carrying its outstanding dollar total and its invoice count, plus a grand total. This is the existing aging read with exactly one new field: `invoiceCount` (the "amount of invoices") per bucket and in the total. Everything else is the read that already exists.

### Endpoint

```
GET /api/dashboard/receivable-invoices/aging
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `revenueCenterId` | guid | no | any id from the Revenue Center list (`ARRevenueCenterRepository`) | omitted (All Revenue Centers) | Narrows to one revenue center |
| `sourceId` | guid | no | any id from the Source list (`ARSourceRepository`) | omitted (All Sources) | Narrows to one source. Combinable with `revenueCenterId`; both filters narrow the same result together |

**Headers.** Company is `X-Company-ID`. Both filter dropdowns are dynamically populated from the data via their repositories; the lists themselves are served by companion list endpoints (see "Still needs sign-off").

### Example requests

```
GET /api/dashboard/receivable-invoices/aging
GET /api/dashboard/receivable-invoices/aging?revenueCenterId=2f8b1c94-3d5e-4a7f-9b0c-1d2e3f4a5b6c
GET /api/dashboard/receivable-invoices/aging?revenueCenterId=2f8b1c94-3d5e-4a7f-9b0c-1d2e3f4a5b6c&sourceId=7a3c9e15-4b6d-4f8a-9c1e-2d5b8f0a3e74
```

### Response schema

| Field | Type | Description |
|---|---|---|
| `revenueCenterId` | guid or null | Echo of the applied revenue center filter, `null` when All |
| `sourceId` | guid or null | Echo of the applied source filter, `null` when All |
| `asOfDate` | date | The snapshot date the aging was computed against (`Today` in `Age = Today - DueDate`) |
| `generatedAt` | datetime (UTC) | Server generation stamp |
| `buckets[]` | array | Always the five buckets in aging order, even when a bucket is empty |
| `buckets[].bucket` | string | Bucket key: `current`, `31-60`, `61-90`, `91-120`, `121+` |
| `buckets[].label` | string | Display label: `Current`, `31-60 days`, `61-90 days`, `91-120 days`, `121+ days` |
| `buckets[].outstanding` | number | Sum of `Outstanding` for the invoices in this bucket. The existing per-bucket figure |
| `buckets[].invoiceCount` | int | **New field.** Count of invoices in this bucket. This is the only addition versus the legacy widget |
| `total` | object | Grand total across all buckets |
| `total.outstanding` | number | Sum of every bucket's `outstanding` |
| `total.invoiceCount` | int | Sum of every bucket's `invoiceCount` |

Percent-of-total per bucket is a client-side division of `buckets[].outstanding` by `total.outstanding`; it is not returned.

### Example: all revenue centers, all sources

```
GET /api/dashboard/receivable-invoices/aging
```

```json
{
  "revenueCenterId": null,
  "sourceId": null,
  "asOfDate": "2026-07-30",
  "generatedAt": "2026-07-30T14:05:00Z",
  "buckets": [
    { "bucket": "current", "label": "Current",     "outstanding": 2110,  "invoiceCount": 2 },
    { "bucket": "31-60",   "label": "31-60 days",   "outstanding": 6950,  "invoiceCount": 2 },
    { "bucket": "61-90",   "label": "61-90 days",   "outstanding": 8520,  "invoiceCount": 2 },
    { "bucket": "91-120",  "label": "91-120 days",  "outstanding": 0,     "invoiceCount": 0 },
    { "bucket": "121+",    "label": "121+ days",    "outstanding": 15950, "invoiceCount": 2 }
  ],
  "total": { "outstanding": 33530, "invoiceCount": 8 }
}
```

Reconciliation: 2,110 + 6,950 + 8,520 + 0 + 15,950 = 33,530 outstanding; 2 + 2 + 2 + 0 + 2 = 8 invoices. The 91-120 bucket is genuinely empty and is returned with zero values, not omitted.

## API 2 - Pop-up (bucket invoice list + Confirm action)

Two operations serve the detail modal for a selected bucket. A **read** returns the invoice rows and footer totals shown in the modal. A **write** (the Confirm action) moves the selected invoices to unposted transactions.

### 2a. READ - bucket invoice list

#### Endpoint

```
GET /api/dashboard/receivable-invoices/bucket
```

#### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `bucket` | enum | yes | `current` \| `31-60` \| `61-90` \| `91-120` \| `121+` | none | The aging bucket to expand. URL-encode `121+` as `121%2B` |
| `revenueCenterId` | guid | no | any id from the Revenue Center list | omitted (All) | Same active filter as API 1; the modal reflects the same narrowing as the summary |
| `sourceId` | guid | no | any id from the Source list | omitted (All) | Same active filter as API 1 |

Headers: `X-Company-ID`.

#### Response schema

| Field | Type | Description |
|---|---|---|
| `bucket` | string | Echo of the requested bucket key |
| `label` | string | The bucket's display label |
| `revenueCenterId` | guid or null | Echo of the applied filter |
| `sourceId` | guid or null | Echo of the applied filter |
| `asOfDate` | date | Snapshot date (same basis as API 1) |
| `invoices[]` | array | The invoice rows for this bucket under the active filters |
| `invoices[].invoiceId` | guid | Stable invoice id, the key for API 3 and for the Confirm action |
| `invoices[].customer` | string | Customer name |
| `invoices[].billTo` | string | Bill To name (`ARInvoice.BillToDisplay`). Blank BY DESIGN when the bill-to party equals the customer, populated only when they differ (confirmed in code: ReceivableInvoicesOutstanding.ascx.cs, conditional BillToDisplay); the modern API should replicate that conditional, not "fix" a blank |
| `invoices[].dueDate` | date | Invoice due date |
| `invoices[].invoiceNumber` | string | Invoice number |
| `invoices[].daysPastDue` | int | `Today - DueDate` in days for this invoice |
| `invoices[].outstanding` | number | This invoice's Outstanding, per the confirmed formula |
| `totals` | object | Footer totals for the modal |
| `totals.invoiceCount` | int | Count of rows in `invoices[]`. Matches this bucket's `invoiceCount` from API 1 under the same filters |
| `totals.outstanding` | number | Sum of the rows' `outstanding`. Matches this bucket's `outstanding` from API 1 under the same filters |

#### Example: the 121+ bucket

```
GET /api/dashboard/receivable-invoices/bucket?bucket=121%2B
```

```json
{
  "bucket": "121+",
  "label": "121+ days",
  "revenueCenterId": null,
  "sourceId": null,
  "asOfDate": "2026-07-30",
  "invoices": [
    {
      "invoiceId": "7c2e9a41-3b5d-4f8a-9c1e-2d6b8f0a3e75",
      "customer": "Cornerstone Academy",
      "billTo": "Cornerstone Academy",
      "dueDate": "2026-02-28",
      "invoiceNumber": "INV-2903",
      "daysPastDue": 145,
      "outstanding": 9650
    },
    {
      "invoiceId": "9d4f1b62-5c7e-4a9b-8d2f-3e7c9a1b4f86",
      "customer": "Legacy Insurance Group",
      "billTo": "Legacy HR Dept",
      "dueDate": "2026-03-01",
      "invoiceNumber": "INV-2890",
      "daysPastDue": 144,
      "outstanding": 6300
    }
  ],
  "totals": { "invoiceCount": 2, "outstanding": 15950 }
}
```

Reconciliation: 9,650 + 6,300 = 15,950, matching the 121+ bucket in API 1's `total`. `billTo` is shown populated here as the required end state; it is empty in the modern API today (gap flagged below).

### 2b. WRITE - Confirm (process payment against the selected outstanding invoices)

**This is a mutation, the project's first.** APIs 1 and 3, and the read above, are all read-only; this is the one write in the contract. The widget's invoices are posted and awaiting payment; Confirm takes the invoice ids the user ticked and moves them toward paid by way of the payment lifecycle. The unposted transaction it produces is a **payment**, not an unposted invoice. It stages an unposted payment for a later, separate post step; it does not commit anything to the general ledger by itself, and the unposted payment remains editable and reversible until a human posts it in Payment Processing. (The mock's inline label "Move to unposted transactions" is a dev-intent marker; the unposted transaction it refers to is the payment.)

**What is confirmed from the codebase trace** (see `Move to Unposted Transactions - Logic Notes.md`, section 9): the machinery already exists and is reused, not built new. A payment is an `ARPayment` (with a `Posted` flag, false then true) whose `ARPaymentDetail` rows each apply to a specific `ARInvoice`. Unposted payments (`Posted = false`) are listed in Payment Processing via `ARPaymentRepository.GetAllCurrentContextByFilters(posted:false, ...)`, selected by the `SelectedIDs` (PaymentID) preference (the row-checkbox selection maps onto this pattern), and posted by `ARPaymentRepository.ProcessPayments(blobID, postingDate)` with `CheckTransactionsAgainstCurrentYear` fiscal-year validation and unapplied-cash handling. GL journal detail is written on post only when `ARCompany.InterfaceGL` is enabled. Posting a payment reduces the invoice's Outstanding (the Outstanding formula subtracts Payments); when Outstanding reaches 0 the invoice is fully paid and drops out of the widget.

**What is OPEN (Q1, the one open item).** Not the mechanism (that is the payment / Payment Processing path above), but the product nuance: does Confirm **create** the `ARPayment` / `ARPaymentDetail` records outright (and if so, full Outstanding per invoice or a partial amount?), or does it **stage** the selected invoices into the existing payment-entry screen for a person to key the payment? Both feed the same `ARPayment` + Payment Processing machinery. This is an SME/product call and is deliberately not invented here; the request shape below is what is known, the response and created-record shape are marked pending Q1.

#### Endpoint

```
POST /api/dashboard/receivable-invoices/move-to-unposted
```

#### Request body (known shape)

| Field | Type | Required | Description |
|---|---|---|---|
| `invoiceIds` | guid[] | yes | The invoices the user ticked in the modal. Maps onto the legacy `SelectedIDs` list |
| `companyId` | guid | yes | Company context (also carried in `X-Company-ID`); posting validates fiscal year against this company's calendar |

```json
{
  "invoiceIds": [
    "7c2e9a41-3b5d-4f8a-9c1e-2d6b8f0a3e75",
    "9d4f1b62-5c7e-4a9b-8d2f-3e7c9a1b4f86"
  ],
  "companyId": "5a2c8e13-4d6f-4b9a-a1c3-7e9d2f4b6a80"
}
```

Whether Confirm applies the full Outstanding per invoice or a partial amount (and whether it creates the payment or just stages it for keying) is the open SME nuance above; the request would gain a per-invoice amount field if partial payments are in scope.

#### Response (PENDING Q1, not final)

The response and created-record shape cannot be finalised until the create-vs-stage / amount nuance (Q1) is settled. Once settled, the response is expected to carry the created unposted payment id(s), a link to the Payment Processing queue so the user can finish posting, and a per-invoice applied / could-not-apply list (concurrency: the aging view is an as-of-today snapshot and may be stale by the time Confirm runs). The shape below is illustrative of that intent, not a committed contract:

```json
{
  "status": "PENDING_Q1_PAYMENT_NUANCE",
  "note": "Response and created-record shape are not final until the create-vs-stage and full-vs-partial-amount nuance is confirmed by SME. The mechanism is the ARPayment / Payment Processing path. See 'Still needs sign-off' Q1 and Move to Unposted Transactions - Logic Notes.md section 9."
}
```

## API 3 - Drill-in detail (per invoice)

The deep detail behind a single invoice row's expand arrow. Read-only.

### Endpoint

```
GET /api/dashboard/receivable-invoices/invoice/{invoiceId}
```

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `invoiceId` | guid (path) | yes | The invoice to expand, from `invoices[].invoiceId` in API 2a |

Headers: `X-Company-ID`.

### Response schema

| Field | Type | Description |
|---|---|---|
| `invoiceId` | guid | Echo of the requested invoice |
| `invoiceNumber` | string | Invoice number |
| `customer` | string | Customer name |
| `lineItems[]` | array | The invoice's line items from `ARInvoiceDetail`. Confirmed source |
| `lineItems[].description` | string | Item name |
| `lineItems[].amount` | number | Line amount |
| `attachments[]` | array | Files attached to the invoice. Data source NOT yet verified (see note) |
| `attachments[].name` | string | File name |
| `attachments[].size` | string | Human-readable size |
| `note` | string | Free-text note recorded against the invoice. Data source NOT yet verified |
| `payments[]` | array | Payment history against the invoice. Data source NOT yet verified |
| `payments[].date` | date | Payment date |
| `payments[].method` | string | Payment method / reference |
| `payments[].amount` | number | Payment amount |

**Open note.** Line items are confirmed to come from `ARInvoiceDetail`. The Attachments, Note, and Payments data sources are not yet verified in the codebase. If they cannot be sourced cleanly, the modal should route these tabs to the existing "View full invoice" page rather than the API inventing fields. Flagged in "Still needs sign-off".

### Example: INV-2903 (Cornerstone Academy)

```
GET /api/dashboard/receivable-invoices/invoice/7c2e9a41-3b5d-4f8a-9c1e-2d6b8f0a3e75
```

```json
{
  "invoiceId": "7c2e9a41-3b5d-4f8a-9c1e-2d6b8f0a3e75",
  "invoiceNumber": "INV-2903",
  "customer": "Cornerstone Academy",
  "lineItems": [
    { "description": "Annual tuition balance", "amount": 8200 },
    { "description": "Technology fee", "amount": 900 },
    { "description": "Late fee", "amount": 550 }
  ],
  "attachments": [
    { "name": "tuition-agreement.pdf", "size": "220 KB" },
    { "name": "reminder-3.pdf", "size": "41 KB" }
  ],
  "note": "Escalated to collections review. Payment plan proposed.",
  "payments": []
}
```

Reconciliation: line items 8,200 + 900 + 550 = 9,650, matching INV-2903's `outstanding` in API 2a and its contribution to the 121+ bucket.

## Edge cases

1. **Empty bucket (API 1):** a bucket with no invoices is returned with `outstanding: 0` and `invoiceCount: 0`, never omitted, so the five buckets are always present in order (the 91-120 bucket in the example).
2. **Nothing outstanding at all (API 1):** every bucket zero and `total` zero. The frontend renders its "all settled" state from this; not an error.
3. **Filter combination yields no invoices (API 1 and 2a):** a `revenueCenterId` + `sourceId` pair that matches nothing returns zero buckets/rows honestly, not an error.
4. **Bucket requested that is empty (API 2a):** empty `invoices[]` with `totals` zero. The legacy widget disables clicking a zero-value bucket row; the API still answers cleanly if called.
5. **Bill To blank (API 2a):** `billTo` is blank BY DESIGN when the bill-to party equals the customer and populated only when they differ (confirmed in code: ReceivableInvoicesOutstanding.ascx.cs, conditional BillToDisplay); the modern API should replicate that conditional rather than treat the blank as a defect.
6. **Unknown or non-outstanding `invoiceId` (API 3, 2b):** an id that is no longer outstanding (paid, voided, or reversed since the snapshot) or does not exist. Needs an explicit behaviour (404-style vs empty) rather than a silent empty payload.
7. **Stale snapshot on Confirm (API 2b):** the aging view is as-of-today; an invoice may have been paid or already moved by another user before Confirm runs. The write must guard against double-processing and report per-invoice which ids could not be moved (concurrency, Q7 in the logic notes).
8. **Attachments / Note / Payments unavailable (API 3):** if a source is not yet wired, return an empty array / empty string for that section rather than failing the whole detail call, and route to "View full invoice" as the fallback.

## Not in scope

- **The payment's ledger posting.** Confirm stages an unposted payment only. The later, separate `ProcessPayments` post step (and its reversal) lives on the Payment Processing page, not in this widget's API.
- **Partial-amount payments**, unless the Q1 nuance confirms them. The request shape assumes full Outstanding per invoice.
- **Select-all in the modal.** The built Final has row-level checkboxes only; no bulk select-all is specced.
- **Cross-dashboard global filters.** Whether this widget responds to any dashboard-wide filter is unconfirmed (Step 1 open question) and is not part of this contract.
- **Export.** The legacy detail panel had Export to Excel; no export endpoint exists in the modern API. Treated as client-side generation from data the widget already holds unless a server endpoint is decided (see "Still needs sign-off").
- **Server-side percent-of-total, grand-total aggregation, or sort params.** All client-side over the returned figures.

## Still needs sign-off

- **Q1, the payment create-vs-stage nuance (the one open item).** The mechanism is settled: Confirm feeds the AR payment path (`ARPayment` / `ARPaymentDetail` applied to the invoices, into Payment Processing, posted by `ProcessPayments`). What is open is the product nuance: does Confirm create the payment records outright (full Outstanding, or a partial amount?), or stage the selected invoices into the payment-entry screen for a person to key? This is an SME/product decision, and the API 2b response and created-record shape depend on it. See `Move to Unposted Transactions - Logic Notes.md` (section 9) in this folder.
- **API 2b response and created-record shape.** Cannot be finalised until the Q1 nuance is settled: the created unposted payment id(s), the Payment Processing link returned to the user, and the per-invoice applied / could-not-apply list.
- **Double-processing guard and permission for the write.** There is no explicit "invoice already has an unposted payment" lock: the guard is the `Outstanding != 0` eligibility filter plus a cap that limits the applied amount to the invoice's Outstanding (recomputed from non-void payment details), so the spec should describe that outstanding-based guard rather than promise a duplicate-payment lock. The permission part is answered: posting is gated by the Payment Processing right (confirmed in code: ARPaymentRepository auto-apply, Outstanding filter + min cap; PaymentProcessing right). Q4 in the logic notes.
- **Bill To conditional-blank behaviour.** `ARInvoice.BillToDisplay` is blank BY DESIGN when the bill-to party equals the customer and populated only when they differ (confirmed in code: ReceivableInvoicesOutstanding.ascx.cs, conditional BillToDisplay); the modern API must replicate that conditional behaviour, not "fix" the blank.
- **Attachments / Note / Payments sources (API 3).** Line items from `ARInvoiceDetail` are confirmed; the other three tabs' data sources are not yet verified. Confirm the sources or route those tabs to "View full invoice".
- **Aging-band reconciliation vs the Modern API `ap-ar-aging` boundaries.** Confirm the five bucket boundaries used here (Current < 31 / 31-60 / 61-90 / 91-120 / 121+) match whatever the modern `ap-ar-aging` surface uses, so the widget and any shared aging endpoint do not disagree at the band edges.
- **Revenue Center and Source list endpoints.** The two dropdowns are dynamically populated from `ARRevenueCenterRepository` / `ARSourceRepository`. Confirm the companion list endpoints that feed them (id + display name), since API 1 and 2a take the ids as filter params.
- **Export endpoint.** The legacy detail panel exported to Excel. Decide whether export is client-side generation from the JSON the widget already holds (zero backend work) or a server endpoint.
