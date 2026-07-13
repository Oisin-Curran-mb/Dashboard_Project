Interview AI Summary — Question &amp; Answer

*Each question below is tagged with the widget it applies to, matching the file names in `Widget Final Desgin`. Questions not tied to a specific widget are tagged General. (Tags added 13.07.2026; escaped markdown from the original export has also been cleaned up here — content is unchanged.)*

---

**Tag: General**

**Across all 17 widgets, which ones do users open most often today, and who's opening them — which persona?** *(Validates: usage/traffic by persona — foundational input for redesign prioritization)*

The most commonly used widgets include bank account management for live bank balances and payroll distributions. These are frequently accessed by administrators or supervisors, often in roles such as church treasurers or finance committee chairs. The focus is typically on high-traffic widgets that support everyday financial operations, aligning with the needs of users managing multiple tasks across small to medium churches.

---

**Tag: General**

**Which widgets are barely used or ignored, and for each one, is that because they serve a narrow specialist case, because something about how they work today makes people avoid them, or anything else?** *(Validates: assumption that low usage = niche need, not a usability failure)*

The widgets that are barely used include:

1. **Deposit Accounts Widget**: This is rarely used, mainly by HQs managing investments, serving less than 1% of users. It caters to a niche use case rather than a usability issue.
2. **Loan Processing Widget**: Used minimally as it deals with providing loans, mostly by HQs like Methodist Conferences. Its low usage is due to its specialized nature.
3. **Pension and Insurance Billing Widgets**: These are specifically for Methodist conferences and used by about 5% of clients. Again, they cater to a specific segment rather than having usability problems.

The low usage of these widgets is largely due to their specialized functions rather than usability failures, indicating a niche need.

---

**Tag: General**

**If you scored every widget 1–5 on importance, which are clear 5s, and which are clear 1s or 2s?** *(Validates: importance ranking to sequence the redesign)*

Widgets scoring a 5 in importance include:

- Bank account management: Frequently used for live bank balances.
- Payroll distribution: Highly valued by clients.

Widgets scoring a 1 or 2 in importance include:

- Deposit accounts: Used by less than 1% of users, primarily by HQs.
- Loan processing: Rarely used, primarily by HQs.
- Pension and insurance billing: Specific to Methodist conferences, used by approximately 5% of users.

---

**Tag: General**

**If we built one generic "standard accounting home dashboard" as the default for a brand-new user, which widgets would be on it, and why those specifically?** *(Validates: hypothesis for the MVP default dashboard composition)*

The "standard accounting home dashboard" should include functional widgets that allow quick access to common tasks such as writing an AP check, running payroll, and entering contribution checks. These tasks should be accessible directly from the dashboard to streamline navigation and enhance user efficiency. Additionally, a consolidated view of tasks, combining standard and user-saved tasks, would be beneficial. Widgets for viewing bank account balances, budget comparisons, and alerts for budget usage would also be essential, as they provide critical financial insights at a glance. These selections cater to administrators or supervisors who need a quick overview and easy access to frequent functions without navigating complex menus.

---

**Tag: General**

**Would that standard dashboard look the same for every accounting persona, or would some need a different default set?** *(Validates: assumption that one default dashboard serves all personas)*

The standard dashboard would not be the same for every accounting persona. Different personas, such as administrators, supervisors, or specific organizational roles, may require different default sets of widgets tailored to their tasks and responsibilities. For instance, an admin might benefit more from a consolidated functional dashboard, whereas a finance committee chair might need specific budget tracking widgets. The ability to customize and add or remove widgets is essential to cater to these varied needs.

---

**Tag: General**

**When someone switches companies, should every widget update to the new company automatically, or would some widgets reasonably stay pinned to a different one?** *(Validates: assumption that a company switch is global and affects all widgets)*

Most users prefer that when they switch companies, all widgets update to reflect the new company automatically. However, there are some large organizations that might benefit from having the ability to pin specific widgets to different companies. Despite this, the majority would likely favor a global switch affecting all widgets.

---

**Tag: General**

**Is there a real need or use case to switch companies individually per widget on the same dashboard, or is switching always all-or-nothing?** *(Validates: edge-case risk for per-widget context switching)*

The majority of users prefer a global context switch where the entire dashboard reflects the selected company. However, there are specific cases, such as large headquarters with multiple companies, where individual widget context switching might be beneficial. Despite this, the general preference remains for a single, unified company view across the dashboard.

---

**Tag: General**

**Do bank account and fiscal period switching behave the same way as company switching, or are there cases where a widget needs its own setting independent of the rest of the dashboard?** *(Validates: scope of per-widget context switching)*

Ben Lane suggests that most users prefer a global context switch that affects the entire dashboard, similar to company switching. However, there are instances, especially with larger organizations, where having per-widget context settings would be beneficial. This allows for viewing multiple accounts or periods independently within the same dashboard, catering to specific needs of larger entities with complex structures. Yet, the majority of users would likely prefer a straightforward, unified approach.

---

**Tag: General**

**If per-widget context switching existed, who would use it and for what task, or is a single global switch genuinely enough?** *(Validates: build/no-build decision on per-widget context controls)*

Per-widget context switching might be beneficial for larger organizations, such as headquarters with multiple companies, where tasks involve managing shared resources across entities. However, for the majority of users, a single global switch would suffice, as they typically operate within a single company context. Therefore, while some larger clients might appreciate per-widget controls, most users would likely find a global switch more practical and straightforward.

---

**Tag: W01 — Budget Compared to Actual**

**Are users more interested in individual periods or the year-to-date total, or both equally?** *(Validates: primary comparison users want)*

Users are more interested in the year-to-date total, with about 60% preferring it over individual periods. Some users do look at both year-to-date and period comparisons, but year-to-date is more commonly used.

---

**Tag: W01 — Budget Compared to Actual**

**Would a variance bar/line add value beyond showing budget and actual side by side?** *(Validates: chart design assumption)*

Yes, a variance line would add value as many clients focus on understanding how much budget remains. Subtracting actual expenditures from the budget helps them see the available budget, making it a crucial feature for users.

---

**Tag: W01 — Budget Compared to Actual**

**Is the income/expense/custom-grouping filter used often, or do most people leave it on one setting?** *(Validates: filter usage frequency)*

Most users tend to leave the filter on the income setting, although it is more beneficial to use it based on expenses. The availability of a special report option to customize the view is considered very helpful.

---

**Tag: W01 — Budget Compared to Actual**

*(Note: in the original short-summary export this answer was misfiled under Pension Plans. The full interview transcript confirms it was asked and answered immediately after the filter question above, about this widget.)*

**Who typically uses this widget: someone managing a single church, or someone overseeing multiple churches across a district?** *(Validates: primary persona for this widget)*

The widget is typically used by someone managing a single church, such as a treasurer, finance committee chair, or church administrator. It is not primarily designed for those overseeing multiple churches across a district.

---

**Tag: W07 — Deposit Accounts / W15 — Bank Balances**

**How many bank accounts does a typical organization have — is 3 realistic, or could there be many more?** *(Validates: assumption behind the UI's account-count handling)*

A typical organization can have up to 50 bank accounts, with some having over 50. Therefore, 3 accounts might be less realistic for the average setup.

---

**Tag: W07 — Deposit Accounts**

**Is reconciliation status something users check regularly on this widget, or is the balance the primary thing?** *(Validates: primary metric to lead with)*

Users primarily focus on the balance rather than the reconciliation status. The balance is the key metric they check, especially in the context of deposit accounts.

---

**Tag: W07 — Deposit Accounts / W15 — Bank Balances**

**What's the intended difference between Deposit Accounts and Bank Balances?** *(Validates: whether these should be merged or stay distinct)*

Deposit Accounts are used when organizations, like HQs, manage investments from individuals or entities, similar to an investment company managing funds. Bank Balances, on the other hand, refer to the actual cash balance in an organization's bank account used for reconciling transactions. These serve distinct purposes and should remain separate.

---

**Tag: W10 — Loans With Balance Due**

**What types of loans typically appear here in a church context?** *(Validates: domain assumption behind display design)*

In a church context, the loans that typically appear are those provided by headquarters, such as a Methodist Conference, to churches. These loans are primarily for needs such as building repairs, like a new roof, rather than going to a bank. The key focus is on the remaining balance of the loan, not necessarily monthly payments or aging labels.

---

**Tag: W10 — Loans With Balance Due**

**Is the key number the remaining balance, the monthly payment, or term remaining?** *(Validates: primary metric to lead with)*

The key number is the remaining balance.

---

**Tag: W10 — Loans With Balance Due**

*(Note: this came up directly in the loans discussion in the full transcript. It may also apply to other aging-band widgets — W05 Receivable Invoices Outstanding and W16 Accounts Payable By Due Date — worth confirming per-widget rather than assuming it's fixed everywhere by this one answer.)*

**The aging labels currently show "Over 60" but actually mean 90+ days — should that be fixed in the redesign?** *(Validates: confirms a mislabeling bug fix)*

Yes, the mislabeling should be corrected to accurately reflect the intended 90+ days.
