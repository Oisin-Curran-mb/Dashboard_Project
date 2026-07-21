# Purpose Document: Accounts Payable By Due Date

> This is a **Purpose document** — Step 1 in the dashboard project lifecycle. Its job is to capture what currently exists, so that Feedback, Design, and Development can be based on documented reality rather than assumptions. It is written for all readers, not just technical ones.

**Date:** 2026-07-06
**Investigated by:** Oisin / Claude
**Module / Area of the system:** Accounts Payable

---

## 1. Purpose
To show all outstanding unpaid supplier invoices grouped by the date they are due. It helps staff see what needs to be paid and when, giving a clear picture of upcoming payment obligations.

## 2. Where the Data Comes From
This widget pulls from the Accounts Payable module. It only includes invoices that have been formally posted, have a due date, and still have an outstanding balance — fully paid invoices are excluded.

The dates shown in the dropdown are not user-configured — they are the actual due dates of real invoices in the system. As new invoices are entered and given due dates, those dates automatically appear as options.

**Database tables used:**

| Table Name | What it holds |
|---|---|
| AP_Invoice | Accounts payable invoice records — vendor, due date, posted status, and payment status |
| AP_InvoiceDetail | The individual line items within each invoice, including amounts, discounts, and payment status |
| AP_Vendor | Vendor records linked to each invoice |

**Confirmed correct** against the legacy `AccountsPayableByDueDate : DataPanelControl` class (`/AccountsPayable`) — verified via `Widget_Comparison_Classic.html`, 2026-07-08.

**Formulas / calculation logic (from Classic Widget Comparison):**
- **Invoice filter:** `Posted = true AND DueDate != null AND AllPaid = false`
- **AmountDue per invoice** = `SUM(AP_InvoiceDetail.Amount − Discount) WHERE Status IN ('U','X')` (Unpaid/partial); invoices whose resulting AmountDue = 0 are excluded
- **Due Date dropdown:** distinct due dates from qualifying invoices, "Total" prepended, first real date auto-selected
- **Chart:** `GROUP BY DueDate`, `SUM(AmountDue)` using absolute value — all dates always shown, matching Section 5
- ⚠️ **Known Modern API gap:** the widget's module access is metadata-only in the Modern API and **not actually enforced** — any authenticated user can call the endpoint regardless of whether their organisation has an Accounts Payable license. Worth flagging as a security gap for the rebuild, separate from the pie-chart-labelling question in Open Questions below.

## 3. What It's Telling Us
A table of outstanding invoices filtered to a selected due date, alongside a pie chart showing the total amount due across all due dates. The pie chart segments are labelled with the amount owed per date, making it easy to see which dates carry the heaviest payment burden.

The total row at the bottom of the table shows the invoice count and combined amount for the selected view.

## 4. How It's Displayed
- **Left:** A table showing vendor name, invoice number, and amount due for the selected date (or all dates if "Total" is selected), with a totals row at the bottom
- **Right:** A pie chart titled "By Due Date" — one segment per due date, labelled with the amount due on that date. The chart always shows all due dates regardless of what is selected in the dropdown.
- Hovering over a pie segment shows the due date and amount

## 5. Filters & Controls
- **Due date dropdown** — lists all distinct due dates pulled from actual invoices in the system, sorted from earliest to latest. Defaults to the earliest due date. "Total" is prepended as an option to show all invoices at once.
- Changing the date filters the **table only** — the pie chart always shows all dates
- **Refresh** — reloads the data, preserving the current date selection

## 6. How It Connects to Other Parts of the Dashboard
- The dropdown filter only affects the table — the pie chart always shows the full picture across all due dates (same pattern as Deposit Accounts and Loans With Balance Due)
- No drill-down or navigation away from the dashboard observed

## 7. Open Questions
- The pie chart labels show amounts rather than dates — is this the intended behaviour, or should the labels show the due date for clarity?

