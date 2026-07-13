# Purpose Document: Loans With Balance Due

> This is a **Purpose document** — Step 1 in the dashboard project lifecycle. Its job is to capture what currently exists, so that Feedback, Design, and Development can be based on documented reality rather than assumptions. It is written for all readers, not just technical ones.

**Date:** 2026-07-06
**Investigated by:** Oisin / Claude
**Module / Area of the system:** Loan Processing

---

## 1. Purpose
To show all loans that currently have an outstanding balance, along with how overdue each one is. It gives staff a quick view of who owes money, when they last made a payment, and how the overall loan book is ageing.

## 2. Where the Data Comes From
This widget pulls from the Loan Processing module. It only shows loans that have at least one invoice and a remaining balance due. The amount due per loan is calculated as the total of principal and interest on invoices, minus all payments that have already been posted.

The loan types available in the filter dropdown are set up by the organisation — they are not a fixed list. Whatever loan types have been created in the system will appear here.

**Database tables used:**

| Table Name | What it holds |
|---|---|
| LN_Loan | Individual loan records, scoped by Bank Account |
| LN_InvoicePost | Invoice/posting records associated with each loan, including invoice date |
| LN_Type | Loan type categories, used to populate the filter dropdown |

**Confirmed correct** against the legacy `LoansWithBalanceDue : DataPanelControl` class (`/LoanProcessing`) — verified via `Widget_Comparison_Classic.html`, 2026-07-08.

**Formulas / calculation logic (from Classic Widget Comparison):**
- **Loan/table filter:** `AmountDue > 0`, `ORDER BY Name, AccountNumber`
- **AmountDue** = `SUM(Principal + Interest)` across a loan's invoices, minus posted payments
- **Aging chart — LIFO calculation (important, and the source of the "60"/"Over 60" labelling confusion noted in Section 4):** each loan starts with 4 age buckets populated by invoice age (Current/30/60/Over 60). Each **posted payment is then subtracted starting from the oldest bucket (index 3, "Over 60") working backward toward the newest (index 0, "Current")** — i.e. payments pay off the oldest debt first. If a bucket goes negative, the overflow amount carries into the next (newer) bucket. This Last-In-First-Out payment application is why the buckets don't simply equal "sum of unpaid invoices in that age range."
- ⚠️ **Critical Modern API gap:** the Modern API does **not** replicate the LIFO payment-application logic at all — it just buckets invoices by raw age (`today − InvoiceDate`) with no payment subtraction. **The aging totals shown by a Modern API build of this widget will not match the legacy numbers.** This is the single most consequential data-accuracy gap found in the whole comparison exercise — flag prominently before this widget is rebuilt, since the aging chart is the whole point of the widget.

## 3. What It's Telling Us
A side-by-side view of a table and a pie chart. The table lists each loan with an outstanding balance, showing the account number, name, date of last payment, and amount currently due. The pie chart groups those loans by how overdue they are.

The total row at the bottom shows the number of loans and the combined amount due.

## 4. How It's Displayed
- **Left:** A table listing each loan with a balance — account number, name, last payment date, and amount due — sorted by name then account number, with a totals row at the bottom
- **Right:** A pie chart titled "By Age" — grouping the total outstanding balance into four age buckets based on how overdue each invoice is:
  - **Current** — less than 30 days overdue
  - **30** — 30 to 59 days overdue
  - **60** — 60 to 89 days overdue
  - **Over 60** — 90 days or more overdue

> **Note on the aging labels:** The bucket labelled "60" covers 60–89 days, and "Over 60" actually means 90 days or more. The labels may be misleading — worth raising in the Feedback step.

## 5. Filters & Controls
- **Select dropdown** (top left) — defaults to "Show All"; filters the **table only** by loan type. The loan types available depend on what has been set up in the system — they are organisation-defined, not fixed.
- The pie chart is **not affected** by this filter — it always shows all loans regardless of type
- **Refresh** — reloads the data

## 6. How It Connects to Other Parts of the Dashboard
- The filter only affects the table — the pie chart always shows the full picture across all loan types (same behaviour as Deposit Accounts)
- Account names in the table appear as links — it is not yet confirmed where these navigate to
- Hovering over a pie segment shows the balance for that age bucket

## 7. Open Questions
- Where do the account name links in the table navigate to?

