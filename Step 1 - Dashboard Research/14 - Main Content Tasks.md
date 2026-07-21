# Purpose Document: Main Content Tasks

> This is a **Purpose document** — Step 1 in the dashboard project lifecycle. Its job is to capture what currently exists, so that Feedback, Design, and Development can be based on documented reality rather than assumptions. It is written for all readers, not just technical ones.

**Date:** 2026-07-06
**Investigated by:** Oisin / Claude
**Module / Area of the system:** Any — context-aware across the application

---

## 1. Purpose
To provide a set of quick-access links to common tasks relevant to the current **module and page**. It acts as a shortcut panel, letting users jump directly to frequently used areas of the system without navigating through menus. Many of these links point to a place where the user can **add or input data** (e.g. writing a check, entering a transaction), not just to a read-only page — this is a task-shortcut panel, not a general navigation menu.

## 2. Where the Data Comes From
The links shown are not user-configured — they are determined automatically by the system based on the current page being viewed and the user's access permissions. Only tasks the user has permission to access are shown; tasks they cannot access are hidden entirely (not greyed out).

Up to 8 links can appear at a time.

**Database tables used:**

| Table Name | What it holds |
|---|---|
| SS_ScreenSectionTask | The list of tasks associated with each page and section of the application, including their icons and navigation targets (table name corrected from "SSScreenSectionTask" — verified via Classic Widget Comparison) |

**Confirmed correct** against the legacy `MainContentTasks : DataPanelControl` class — verified via `Widget_Comparison_Classic.html`, 2026-07-08.

**Formulas / calculation logic (from Classic Widget Comparison):**
- **Legacy query:** `SSScreenSectionTaskRepository.GetByPageAndSection(currentUri, ScreenSection.MainContentArea)` — the current page URL and section are the actual lookup key, confirming Section 2's "determined automatically by the current page"
- **Access filtering:** each returned row carries an `AllowAccess` flag computed from the user's permissions; rows failing that check are excluded — **partially answers Open Question 1: it's entirely system/permission-controlled, no admin configuration UI exists in the legacy system**
- **Special case:** in the Statistics module, one specific task (NavigationPageID 642) is excluded if the organisation doesn't hold a Remittance license — an example of licensing, not just page-context, affecting what's shown
- ⚠️ **Known Modern API gap, relevant to Open Question 2:** the Modern API does not query `SS_ScreenSectionTask` at all — it returns a **hardcoded list of up to 8 tasks per module name** (a switch statement covering 15+ modules, e.g. "accountspayable" through "statistics", with a default 8-task fallback). There is **no `AllowAccess` permission filtering** in the Modern API version. If this widget is retained as-is (rather than replaced/removed per Open Question 2), the rebuild needs to decide whether to reinstate DB-driven, permission-filtered tasks or keep the simpler hardcoded-per-module approach.

## 3. What It's Telling Us
A set of labelled icon links — each one a shortcut to a specific action or page within the system. The links shown will differ depending on **which module and page** the dashboard is being viewed from, and depending on what each user has permission to do. This is the one widget on the dashboard whose entire content set changes with context — every other widget shows the same kind of content everywhere; this one doesn't.

## 4. How It's Displayed
- A grid of up to 8 tiles, each showing an icon and a label
- No chart, no table, no filters, no refresh button
- Purely navigational — each tile is a link

## 5. Filters & Controls
None — there is no way to configure or filter this widget. The content is determined automatically by the system.

## 6. How It Connects to Other Parts of the Dashboard
- Each tile navigates away from the dashboard to the relevant page in the application
- The tiles shown change depending on the page context — this widget behaves differently from all other widgets in that its content is not fixed

## 7. Open Questions
- Is there any way for an administrator to configure which tasks appear here, or is it entirely controlled by the system?
- In the new dashboard, should this widget be retained as-is, replaced with something user-configurable, or removed?

## 8. Real Task Lists by Module (confirmed 2026-07-21)

The actual task set shown per module, as it exists today — direct confirmation of Section 1/3's "content changes by module and page" and "these are add/input-data shortcuts" claims. Kept in plain `Label — URL` form per module so it can be used directly as real mock data in `Step 3 - Mock_Work` later, without re-transcribing.

**Home** *(renamed from "Main," 2026-07-21, per direct instruction — "more correct naming." Going-forward naming only, same caveat as the Fixed Assets "Selections and Listings (Records)" rename below — not a claim that the legacy system itself already calls this module "Home.")*
- Enter Manual Journal — https://beta1.accounting.myamplify.io/GeneralLedger/UnpostedJournals/Update
- Manage Unposted Journals — https://beta1.accounting.myamplify.io/GeneralLedger/UnpostedJournals
- Manage Bank Statements — https://beta1.accounting.myamplify.io/BankAccountManagement/ReconcileBankStatement
- View All Items — https://beta1.accounting.myamplify.io/BankAccountManagement/AllItems
- Modify Vendor Information — https://beta1.accounting.myamplify.io/AccountsPayable/VendorInformation
- Enter Transaction — https://beta1.accounting.myamplify.io/AccountsPayable/Transactions/Update
- Modify Employee Information — https://beta1.accounting.myamplify.io/Payroll/EmployeeInformation
- View Earnings Inquiry — https://beta1.accounting.myamplify.io/Payroll/EarningsInquiry

**Accounts Payable**
- Modify Vendor Information — https://beta1.accounting.myamplify.io/AccountsPayable/VendorInformation
- Enter Transaction — https://beta1.accounting.myamplify.io/AccountsPayable/Transactions/Update
- Enter Credit Card Transaction — https://beta1.accounting.myamplify.io/AccountsPayable/CreditCard/Transactions/Update
- Enter Recurring Payment — https://beta1.accounting.myamplify.io/AccountsPayable/RecurringPayments/Update
- Manage Unposted Transactions — https://beta1.accounting.myamplify.io/AccountsPayable/Transactions
- Manage Unposted Credit Card Transactions — https://beta1.accounting.myamplify.io/AccountsPayable/CreditCard/Transactions
- Manage Recurring Payments — https://beta1.accounting.myamplify.io/AccountsPayable/RecurringPayments
- Manage Payment Processing — https://beta1.accounting.myamplify.io/AccountsPayable/PaymentProcessing

**Accounts Receivable**
- Modify Customer Information — https://beta1.accounting.myamplify.io/AccountsReceivable/CustomerInformation
- Manage Recurring Charges — https://beta1.accounting.myamplify.io/AccountsReceivable/RecurringCharges
- Enter Invoice — https://beta1.accounting.myamplify.io/AccountsReceivable/UnpostedInvoices/Update
- Enter Payment — https://beta1.accounting.myamplify.io/AccountsReceivable/PaymentProcessing/Update
- Manage Unposted Invoices — https://beta1.accounting.myamplify.io/AccountsReceivable/UnpostedInvoices
- Manage Payment Processing — https://beta1.accounting.myamplify.io/AccountsReceivable/PaymentProcessing
- Enter Recurring Charge — https://beta1.accounting.myamplify.io/AccountsReceivable/RecurringCharges/Update
- View Transaction Inquiry — https://beta1.accounting.myamplify.io/AccountsReceivable/TransactionInquiry

**Bank Account Management**
- Enter Transaction — https://beta1.accounting.myamplify.io/BankAccountManagement/Transactions/Update
- Manage Unposted Transactions — https://beta1.accounting.myamplify.io/BankAccountManagement/Transactions
- Manage Bank Statements — https://beta1.accounting.myamplify.io/BankAccountManagement/ReconcileBankStatement
- View All Items — https://beta1.accounting.myamplify.io/BankAccountManagement/AllItems

**Fixed Assets**
- Modify Asset Information — https://beta1.accounting.myamplify.io/FixedAssets/AssetInformation
- Modify Control Table Information — https://beta1.accounting.myamplify.io/FixedAssets/ControlTableInformation
- Manage Calculate Depreciation — https://beta1.accounting.myamplify.io/FixedAssets/CalculateDepreciation
- Manage Inventories — https://beta1.accounting.myamplify.io/FixedAssets/Inventories
- Selections and Listings (Records) — https://beta1.accounting.myamplify.io/Records/Reports/SelectionsAndListings
- Selections and Listings — https://beta1.accounting.myamplify.io/FixedAssets/Reports/SelectionsAndListings

**Resolved 2026-07-21, per direct instruction:** the old UI genuinely has two tasks with the identical label "Selections and Listings" here — one is the general Records-module report (`/Records/Reports/...`), the other is Fixed Assets' own version (`/FixedAssets/Reports/...`). Going forward, the Records one is relabelled **"Selections and Listings (Records)"** to disambiguate; the Fixed-Assets-specific one keeps the plain name. This is a naming change for the new dashboard, not a correction to what the old UI actually shows.

**General Ledger**
- Modify Budget Information — https://beta1.accounting.myamplify.io/GeneralLedger/BudgetInformation
- Enter Manual Journal — https://beta1.accounting.myamplify.io/GeneralLedger/UnpostedJournals/Update
- Enter Recurring Journal — https://beta1.accounting.myamplify.io/GeneralLedger/RecurringJournals/Update
- Manage Unposted Journals — https://beta1.accounting.myamplify.io/GeneralLedger/UnpostedJournals
- Manage Recurring Journals — https://beta1.accounting.myamplify.io/GeneralLedger/RecurringJournals
- View Posted Journals — https://beta1.accounting.myamplify.io/GeneralLedger/PostedJournals

**Payroll Distributions**
- Modify Employee Information — https://beta1.accounting.myamplify.io/Payroll/EmployeeInformation
- Enter Manual Check — https://beta1.accounting.myamplify.io/Payroll/ManualChecks/Update
- Enter Employees To Pay — https://beta1.accounting.myamplify.io/Payroll/PayrollProcessing/EmployeesToPay
- Manage Manual Checks — https://beta1.accounting.myamplify.io/Payroll/ManualChecks
- Manage Payroll Processing — https://beta1.accounting.myamplify.io/Payroll/PayrollProcessing
- View Earnings Inquiry — https://beta1.accounting.myamplify.io/Payroll/EarningsInquiry

**Purchasing Management**
- Modify Company Information — https://beta1.accounting.myamplify.io/PurchasingManagement/CompanyInformation
- Modify Approval Paths — https://beta1.accounting.myamplify.io/PurchasingManagement/ApprovalPaths
- Enter Request — https://beta1.accounting.myamplify.io/PurchasingManagement/Requests/Update
- Manage Requests — https://beta1.accounting.myamplify.io/PurchasingManagement/Requests

**Donors And Gifts**
- Manage Pledges — https://beta1.accounting.myamplify.io/DonorsAndGifts/Pledges
- Manage Unposted Gifts — https://beta1.accounting.myamplify.io/DonorsAndGifts/UnpostedGifts
- View Posted Gifts — https://beta1.accounting.myamplify.io/DonorsAndGifts/ViewPostedGifts
- Manage Online Gifts — https://beta1.accounting.myamplify.io/DonorsAndGifts/OnlineGifts

**Deposits On Hand**
- Modify Group Information — https://beta1.accounting.myamplify.io/DepositsOnHand/GroupInformation
- Modify Account Type Information — https://beta1.accounting.myamplify.io/DepositsOnHand/AccountTypeInformation
- Modify Account Information — https://beta1.accounting.myamplify.io/DepositsOnHand/AccountInformation
- Enter Transaction — https://beta1.accounting.myamplify.io/DepositsOnHand/Transactions/Update
- Manage Unposted Transactions — https://beta1.accounting.myamplify.io/DepositsOnHand/Transactions/Update

**Confirmed 2026-07-21, per direct instruction:** unlike every other module's equivalent pair, "Enter Transaction" and "Manage Unposted Transactions" here genuinely share the same URL in the old UI — not a copy/paste duplicate. Kept exactly as-is.

**Loans With Balance Due**
- Preferences — https://beta1.accounting.myamplify.io/LoanProcessing/Preferences
- Account Type Information — https://beta1.accounting.myamplify.io/LoanProcessing/AccountTypeInformation
- Loan Information — https://beta1.accounting.myamplify.io/LoanProcessing/LoanInformation
- Enter Payment — https://beta1.accounting.myamplify.io/LoanProcessing/PaymentProcessing/Update
- Payment Processing — https://beta1.accounting.myamplify.io/LoanProcessing/PaymentProcessing

**Insurance Billing Plans**
- Post to Accounts Receivable — https://beta1.accounting.myamplify.io/InsuranceBilling/PostToAccountsReceivable
- Modify Employer Information — https://beta1.accounting.myamplify.io/InsuranceBilling/EmployerInformation
- Modify Preferences — https://beta1.accounting.myamplify.io/InsuranceBilling/Preferences
- Modify Employee Information — https://beta1.accounting.myamplify.io/InsuranceBilling/EmployeeInformation
- Modify Plan Information — https://beta1.accounting.myamplify.io/InsuranceBilling/PlanInformation

**Pension Plans**
- Appointee Information — https://beta1.accounting.myamplify.io/PensionBilling/AppointeeInformation
- Post To Accounts Receivable — https://beta1.accounting.myamplify.io/PensionBilling/PostToAccountsReceivable

**Remittance Pledges**
- Enter Remittance — https://beta1.accounting.myamplify.io/Remittance/UnpostedRemittances/Update
- Manage Unposted Remittances — https://beta1.accounting.myamplify.io/Remittance/UnpostedRemittances
- Modify Church Information — https://beta1.accounting.myamplify.io/Remittance/ChurchInformation
- Modify Activity Information — https://beta1.accounting.myamplify.io/Remittance/ActivityInformation
- Manage Pledges — https://beta1.accounting.myamplify.io/Remittance/Pledges
- Import Pledges — https://beta1.accounting.myamplify.io/Remittance/ImportPledges
- Export Pledges — https://beta1.accounting.myamplify.io/Remittance/Export

**Records**
- None — no tasks configured for this module.

