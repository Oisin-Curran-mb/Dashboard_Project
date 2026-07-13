# Purpose Document: Deposit Accounts

> This is a **Purpose document** — Step 1 in the dashboard project lifecycle. Its job is to capture what currently exists, so that Feedback, Design, and Development can be based on documented reality rather than assumptions. It is written for all readers, not just technical ones.

**Date:** 2026-07-06
**Investigated by:** Oisin / Claude
**Module / Area of the system:** Deposits On Hand

---

## 1. Purpose
To show the current balances of all active deposit accounts, grouped by account type. It gives staff a snapshot of how much is held across different account categories as of today.

> **Note on naming:** The chart is titled "Deposit Accounts" on the dashboard, but the breadcrumb and underlying module are labelled "Deposits On Hand." These refer to the same thing.

## 2. Where the Data Comes From
This widget pulls from the Deposits On Hand module. It includes only active accounts, and the ending balance for each account is calculated as of today's date. Accounts are ordered by name and then by inception date.

The list of account types in the filter dropdown is also pulled from the same module.

**Database tables used:**

| Table Name | What it holds |
|---|---|
| DH_Account | Deposit account records — name, inception date, account number, and active status |
| DH_Type | Account type categories, used to populate the filter dropdown |
| DH_Transaction | Individual transactions per account, summed to derive the ending balance |

**Confirmed correct** against the legacy `DepositAccounts : DataPanelControl` class (`/DepositsOnHand`) — verified via `Widget_Comparison_Classic.html`, 2026-07-08. Scope note: this widget is scoped by **Bank Account** (`X-BankAccountID`, via the `DH_Type.BankAccountID` chain), not by Company like most other Finance widgets — worth calling out for the rebuild.

**Formulas / calculation logic (from Classic Widget Comparison):**
- **Account list:** `DH_Account WHERE Active = true AND DH_Type.BankAccountID = ctx`, `ORDER BY Name, THEN InceptionDate`
- **Ending balance per account** = `SUM(DH_Transaction.Amount) WHERE AccountID = account AND TransactionDate <= today`
- **Chart grouping:** all accounts scoped by BankAccountID, joined to `DH_Type` for the type name, `GROUP BY TypeID`, `SUM(balance per account)` — always **all** types regardless of the table's dropdown filter (matches Section 5)
- ⚠️ **Known Modern API gap:** the legacy balance calc uses a custom computed property (`DHAccount.CalcBalance()`) that may apply additional adjustments beyond a simple transaction sum. The Modern API's straightforward `SUM(DH_Transaction) WHERE TransactionDate <= today` may not be a byte-for-byte match — worth verifying balances tie out before relying on this in the rebuild.

## 3. What It's Telling Us
A side-by-side view of a table and a pie chart. The table lists individual deposit accounts with their current ending balance. The pie chart groups those balances by account type, giving a higher-level view of how the total is distributed.

The total row at the bottom of the table shows the number of accounts and the combined balance.

## 4. How It's Displayed
- **Left:** A table listing each active deposit account — name, inception date, account number, and ending balance — with a totals row at the bottom
- **Right:** A pie chart titled "By Account Type" — one segment per account type, showing the combined balance for all accounts of that type
- Hovering over a pie segment shows the balance for that account type

## 5. Filters & Controls
- **Account type dropdown** (top left) — defaults to "Show All"; filters the **table only**. The pie chart is not affected by this filter — it always shows all account types regardless of what is selected.
- **Refresh** — clears cached data and reloads all accounts, the table, and the chart

## 6. How It Connects to Other Parts of the Dashboard
- The dropdown filter only affects the table — the pie chart always shows the full picture across all account types
- Hovering over a pie segment reveals the balance for that type
- No drill-down available — clicking a row or chart segment does not open further detail

## 7. Open Questions
- The filter affecting the table but not the chart may be confusing for users — worth raising in the Feedback step.

