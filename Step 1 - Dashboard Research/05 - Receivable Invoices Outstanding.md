# Purpose Document: Receivable Invoices Outstanding

> This is a **Purpose document** — Step 1 in the dashboard project lifecycle. Its job is to capture what currently exists, so that Feedback, Design, and Development can be based on documented reality rather than assumptions. It is written for all readers, not just technical ones.

**Date:** 2026-07-06
**Investigated by:** Oisin / Claude
**Module / Area of the system:** Accounts Receivable

---

## 1. Purpose
To show how much money is currently owed to the organisation in unpaid invoices, and how long those invoices have been outstanding. Grouping by age (how overdue each invoice is) helps staff prioritise which outstanding amounts need attention first.

## 2. Where the Data Comes From
This widget pulls from the Accounts Receivable module. It only includes invoices that have been formally posted and have an outstanding balance remaining after any payments, discounts, or write-offs have been applied. Voided invoices are excluded.

Each invoice is assigned to an age bucket based on how many days past its due date it currently is.

**Database tables used:**

| Table Name | What it holds |
|---|---|
| ARInvoice | Individual accounts receivable invoices, including posted status, amounts, and due dates |
| ARInvoiceDetail | The individual line items within each invoice |
| ARRevenueCenterRepository / ARSourceRepository | Dynamically supply the Revenue Center and Source dropdown lists — **answers Open Question 3: both filter lists are dynamically populated from the data, not fixed** |

**Confirmed correct** against the legacy `ReceivableInvoices : DataPanelControl` class (`/AccountsReceivable`) — verified via `Widget_Comparison_Classic.html`, 2026-07-08.

**Formulas / calculation logic (from Classic Widget Comparison):**
- **Invoice filter:** `Posted = true AND UndoJournalID = null AND Outstanding != 0`
- **Outstanding** = `TotalAmount + SalesTax − Payments − Discounts − WriteOffs`
- **Age bucket assignment:** `Age = Today − DueDate` (in days) → Current (<31), 31–60, 61–90, 91–120, 121+
- Filters (Revenue Center, Source) are combinable and both narrow table + chart together
- ⚠️ **Known Modern API gap:** `BillToDisplay` (the "Bill To" customer name in the detail panel) is always empty in the Modern API — not yet resolved. Worth flagging so it isn't carried forward broken in the redesign.

## 3. What It's Telling Us
Outstanding invoices are grouped into five age buckets based on how overdue they are:

- **Current** — not yet overdue (0–30 days)
- **31–60 days** — overdue by one to two months
- **61–90 days** — overdue by two to three months
- **91–120 days** — overdue by three to four months
- **121 & over** — overdue by more than four months

The table shows the total outstanding amount in each bucket, and the pie chart ("Invoice Aging") shows the same breakdown visually. A totals row at the bottom shows the full outstanding balance across all buckets.

## 4. How It's Displayed
- **Left:** A table with one row per age bucket and a highlighted totals row at the bottom
- **Right:** A pie chart titled "Invoice Aging" — one segment per age bucket
- Hovering over a pie segment shows the outstanding amount for that bucket
- Both the table and chart reflect the same filtered data

## 5. Filters & Controls
- **Revenue Center dropdown** — defaults to "All Revenue Centers"; narrows results to invoices belonging to a specific revenue centre (e.g. Church, Insurance Billing, Pension Billing, School)
- **Source dropdown** — defaults to "All Sources"; narrows results by the source the invoice originated from (e.g. Insurance Billing, Pension Billing)
- Both filters affect both the table and the pie chart simultaneously
- Filter selections are preserved when the page is refreshed
- **Refresh** — clears cached data and reloads with the current filter settings

## 6. How It Connects to Other Parts of the Dashboard
- Hovering over a pie segment reveals the amount for that bucket
- Clicking an age bucket row that has a value greater than zero opens a detail panel (Panel 1) titled "Receivable Invoices Outstanding – Detail", showing individual invoices within that bucket. Rows with a zero balance are not clickable.
- The detail panel shows: Customer name, Bill To (if different from the customer), Due Date, Invoice number, Days Past Due, and Outstanding amount
- Each row in the detail panel has an expand arrow — expanding a row reveals four tabs of further detail:
  - **Details** — the individual line items within that invoice (item name and amount)
  - **Attachments** — any files attached to the invoice
  - **Note** — any notes recorded against the invoice
  - **Payments** — payment history recorded against the invoice
- An Export to Excel and a Close button are available in the detail panel header
- _Whether this chart responds to any filters applied elsewhere on the dashboard is not yet confirmed — needs investigation_

## 7. Open Questions
- ✅ Drill-down confirmed — clicking a bucket row with a value greater than zero opens the detail panel successfully.
- Does this widget respond to any global filters applied across the whole dashboard?
- Are the Revenue Center and Source filter options dynamically populated from the data, or are they a fixed list?

