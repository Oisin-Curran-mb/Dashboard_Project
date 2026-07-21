# Purpose Document: Purchasing Management

> This is a **Purpose document** — Step 1 in the dashboard project lifecycle. Its job is to capture what currently exists, so that Feedback, Design, and Development can be based on documented reality rather than assumptions. It is written for all readers, not just technical ones.

**Date:** 2026-07-06
**Investigated by:** Oisin / Claude
**Module / Area of the system:** Purchasing Management

---

## 1. Purpose
To give users a view of purchase order requests filtered by where they are in the approval process. It lets staff see what needs their approval, what they have submitted, and what has been approved — and shows the financial commitment (encumbrance) those orders represent across each accounting period.

## 2. Where the Data Comes From
This widget pulls from the Purchasing Management module. What a user can see is controlled by their access level — administrators can see all orders, while other users only see orders on approval paths they are part of. Rejected orders are never shown.

The encumbrance chart shows how much of the budget is committed (but not yet spent) across each accounting period, calculated from the quantities and unit prices of outstanding purchase order lines.

Both filter selections are saved per user and remembered across sessions.

**Database tables used:**

| Table Name | What it holds |
|---|---|
| PO_Order | Purchase order/requisition records — status, vendor, date, total/outstanding amount — **answers Open Question 1**, confirmed via Classic Widget Comparison |
| PO_ApprovalPath / PO_ApprovalUser | Approval path definitions and which users are authorised on which path, used for both the access filter and the Approval Path dropdown |
| PO_OrderDetail | Line items per order — quantity, unit price, dollars applied, and accounting period — source of the encumbrance chart |

**Confirmed correct** against the legacy `PurchasingManagement : DataPanelControl` class (`/PurchasingManagement`) — verified via `Widget_Comparison_Classic.html`, 2026-07-08.

**Formulas / calculation logic (from Classic Widget Comparison):**
- **Status filter logic:**
  - *Awaiting my approval next* (status 0): `PO_Order WHERE Status=0 AND NOT Rejected AND user IN PO_ApprovalPath` AND either no approvals yet and the user is sequence 1, **or** the max approved sequence + 1 equals the user's sequence
  - *Awaiting my approval* (status 1): orders on paths the user submitted/is part of, not yet approved by them
  - *Unapproved* (status 2): all pending orders the user is authorised to see (path member, admin, or override permission)
  - *Approved* (status 3): `PO_Order WHERE Status=1`
- **Approval Path dropdown:** distinct paths from the orders matching the currently selected status, filtered to paths the user is authorised on
- **Encumbrance per period** = `SUM(Quantity × UnitPrice − DollarsApplied)` from `PO_OrderDetail`, `WHERE PeriodID != null`, `GROUP BY GLPeriod` — **this answers Open Question 2: yes, the encumbrance chart is filtered by the same Status and Approval Path selections as the table**, it does not always show all periods
- ⚠️ **Known Modern API gap:** the complex sequence-based "Awaiting my approval next" chain check is only partially/approximately reimplemented in the Modern API — worth re-verifying against the legacy logic above before relying on it in the rebuild. User preference persistence (last-used status + approval path) is also not implemented server-side yet.

## 3. What It's Telling Us
Two views side by side:

- **Left (table):** A list of purchase order requests or approved orders matching the current filter, showing the order or requisition number, vendor, date issued, and outstanding amount. The column labels change depending on which status filter is selected.
- **Right (bar chart):** The total encumbrance — money committed but not yet paid — broken down by accounting period. Only periods with an encumbrance greater than zero are shown.

The total row at the bottom of the table shows the number of requests and the combined outstanding amount.

## 4. How It's Displayed
- **Left:** A scrollable table with a totals row; column headers change based on the status selected (e.g. "Order#" for approved orders, "Requisition#" for pending ones)
- **Right:** A bar chart titled "Encumbrances" — one bar per accounting period, labelled with the period name and year, ordered chronologically
- Hovering over a bar shows the encumbrance amount for that period

## 5. Filters & Controls
Two dropdowns work in sequence:

- **First dropdown — Status:** Filters by where the order is in the approval process:
  - *Awaiting my approval next* — orders where the current user is next to approve
  - *Awaiting my approval* — orders the current user has submitted but no one has approved yet
  - *Unapproved* — all pending orders the user can access
  - *Approved* — orders that have been fully approved
- **Second dropdown — Approval Path:** Narrows results to a specific approval path. This list is populated based on the status selected, so it changes dynamically. Disabled if only one path exists. Defaults to "All approval paths".
- Both selections are saved per user and remembered across sessions
- **Refresh** — reloads the data

## 6. How It Connects to Other Parts of the Dashboard
- Each row in the table has an edit icon — clicking it navigates away from the dashboard to the full purchase order record in the Purchasing Management module, where the user can view and edit full details including tabs for Detail, Approvals, Attachments, Note, and Payment Approval
- This is one of only two dashboard widgets (alongside Payroll Scheduled Time Off) where the user can take action — in this case, navigating directly to edit a record

## 7. Open Questions
- What are the exact database tables used for purchase order records and encumbrance calculations?
- Does the encumbrance chart update when the status or approval path filter changes, or does it always show all periods regardless of filter?

