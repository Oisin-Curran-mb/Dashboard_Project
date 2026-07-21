# Purpose Document: Bank Balances

> This is a **Purpose document** — Step 1 in the dashboard project lifecycle. Its job is to capture what currently exists, so that Feedback, Design, and Development can be based on documented reality rather than assumptions. It is written for all readers, not just technical ones.

**Date:** 2026-07-06
**Investigated by:** Oisin / Claude
**Module / Area of the system:** Bank Account Management

---

## 1. Purpose
To show the current balances across all bank accounts, and to allow users to drill into a single account to see a breakdown of activity — deposits, checks, withdrawals, and other transactions — since the last bank reconciliation.

## 2. Where the Data Comes From
This widget pulls from the Bank Account Management module. Balances are calculated based on unreconciled transactions only — items that have already been through a bank reconciliation are not included again. The beginning balance for each account is either the ending balance from the last reconciliation, or an opening balance if the account has never been reconciled.

**Database tables used:**

| Table Name | What it holds |
|---|---|
| BR_BankAccount | Active bank account records — **answers Open Question 1**, confirmed via Classic Widget Comparison |
| BR_Item | Individual bank transactions, typed d/v/c/w/e (Deposit/Void/Check/Withdrawal/EFT); only rows where `ReconcileID = null` (unreconciled) count |
| BR_Reconcile | Reconciliation history — the most recent one's ending balance is the "beginning balance" for the next period |

**Confirmed correct** against the legacy `BankBalances : DataPanelControl` class (`/BankAccountManagement`) — verified via `Widget_Comparison_Classic.html`, 2026-07-08. Confirms Open Question 2's premise: yes, only unreconciled items are shown, and this is core to the widget's design (a running tally since the last reconciliation), not an oversight — worth clarifying in the UI per that question, but not a bug.

**Formulas / calculation logic (from Classic Widget Comparison):**
- **Account list (All Accounts mode):** `BR_BankAccount WHERE Active = true`, company-scoped; "All Bank Accounts" option only shown if more than one active account exists
- **Ending Balance (All Accounts):** `SUM(BR_Item.Amount) WHERE ReconcileID = null` added to the last reconciliation's ending balance (or the account's opening balance if never reconciled)
- **Single Account 7-row breakdown:** Beginning = last `BR_Reconcile.EndingBalance` (ordered by `ReconcileEndingDate` desc) or `OpeningBalance`; then unreconciled `BR_Item` rows are grouped by type code and added: Deposits (d), Voids (v), Checks (c), Withdrawals (w), EFT (e); Ending = Beginning + all activity
- **Chart sign flip:** Checks and Withdrawals are multiplied by −1 specifically for the bar chart display, so all four activity bars read as positive magnitudes
- ⚠️ **Significant Modern API gap:** the Modern API's single-account endpoint returns only a **summary balance** — it does **not** reproduce the 7-row Beginning/Deposits/Voids/Checks/Withdrawals/EFT/Ending breakdown, and there is **no bar-chart-by-activity-type endpoint at all**. This means Single Account view (Section 3 above) cannot currently be built the same way on the Modern API — flag this prominently, since it's arguably the more detailed of the widget's two views.

## 3. What It's Telling Us
This widget has two distinct views depending on what is selected in the dropdown:

**All Accounts view** (default):
- A table listing each active bank account with its current ending balance
- A pie chart showing the balance distribution across all accounts (accounts with a negative balance are excluded from the chart)
- A totals row showing the combined balance across all accounts

**Single Account view** (when one account is selected):
- A 7-row breakdown table showing: Beginning Balance, Deposits, Voids, Checks, Withdrawals, EFT, and Ending Balance
- A bar chart showing four of those activity types (Deposits, Voids, Checks, Withdrawals) as positive bars for easy comparison

## 4. How It's Displayed
**All Accounts:**
- Table with account names and ending balances; totals row at the bottom
- Pie chart titled "All Bank Accounts"

**Single Account:**
- Fixed 7-row table with the activity breakdown; no totals row
- Bar chart titled with the selected account name, showing four activity categories
- Checks and Withdrawals are stored as negative figures in the system but are displayed as positive bars in the chart for readability

## 5. Filters & Controls
- **Account dropdown** — defaults to "All Bank Accounts" if more than one account exists; selecting a specific account switches to the single account view. The two views are completely different — it is not just a filter, it changes the entire layout and chart type.
- **Refresh** — reloads the data, preserving the current dropdown selection

## 6. How It Connects to Other Parts of the Dashboard
- Selecting an account from the dropdown switches the entire widget to a different view — this is the most significant view-switching behaviour of any widget on the dashboard
- Hovering over a pie or bar segment shows the value for that segment
- No drill-down or navigation away from the dashboard observed

## 7. Open Questions
- What are the exact database tables used for bank account records and transaction data?
- The widget shows unreconciled items only — should this be made clearer to users, or should there be an option to view all items?

