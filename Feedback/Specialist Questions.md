# Dashboard Specialist Questions

These questions are for someone who uses or supports Shelby Financials day-to-day. I've been building visual mockups of the dashboard and hit a number of points where I genuinely didn't know the right answer — not a design question, but a "what does the user actually need here?" question. Your answers will shape the final designs.

For each widget, there's a short context note, then the questions. Leave your answer underneath each one.

**Update (13.07.2026):** A first subject-matter expert interview with Ben Lane has been completed. Where it directly or indirectly touches a question below, that's noted inline as "Question and answer from Ben Lane (13.07.2026)." Many questions are still open — the interview didn't cover every widget, and some answers are inferred context rather than direct confirmation.

---

## Widget 1 — Budget Compared to Actual

Context: Shows actual vs budgeted GL amounts by fiscal period. Currently a side-by-side bar chart with a running YTD line.

**Q1.** When a finance user looks at this widget, are they more interested in the individual periods (e.g. "how did March go?") or the year-to-date running total (e.g. "where are we overall this year?")? Or both equally?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Ben's session pointed to **YTD first, with a period toggle** — YTD is the primary lens, but users need to be able to drop into individual periods too. Not "both equally": YTD leads, period is secondary.
> 
> **Full transcript, confirmed with a number:** "Users are more interested in the year-to-date total, with about 60% preferring it over individual periods. Some users do look at both, but YTD is more common."

**Q2.** The current design shows two bars per period (budget and actual). Would it be more useful to show a third bar or line for the *variance* (i.e. the gap — how much over or under)? Or does showing both bars already make that obvious enough?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Not answered directly, but related: Ben flagged a need for a clear **remaining-budget view / percentage alert** on this widget. That supports adding a variance/remaining element (ideally as a %) rather than relying on the two bars alone to make the gap obvious.
> 
> **Full transcript, now a direct yes:** "Yes, a variance line would add value as many clients focus on understanding how much budget remains. Subtracting actual expenditures from the budget helps them see the available budget, making it a crucial feature for users."

**Q3.** The widget has a filter to switch between income accounts, expense accounts, or a custom report grouping. Is that filter used often, or do most users just leave it on one setting?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** "Most users tend to leave the filter on the income setting, although it is more beneficial to use it based on expenses. The availability of a special report option to customize the view is considered very helpful." So: mostly left on one setting (income), even though expense is arguably more useful — worth considering whether income should stay the default.

**Q54 (new, added after reviewing the full transcript).** Who typically uses this widget, and at what organizational level — a single church or someone overseeing multiple churches?

> **Question and answer from Ben Lane (13.07.2026):** "I think it'd be whoever the supervisor is of the bookkeeper, whether it's the treasurer, the finance committee chair, or the church administrator." Asked directly whether that's someone overseeing multiple churches or a single church: "No, I think it'd be... a single church." So: treasurer, finance committee chair, or church administrator, at the single-church level — not a district/multi-church role.
> 
> **Also relevant:** current usage of this specific widget is low ("It's not used a lot now"), but Ben expects that to change a lot with more flexibility (the YTD/period toggle, the variance/remaining-budget line, per Q1/Q2) — because "the vast majority of our clients use budgets." So: low engagement with the *current* widget, but very high underlying relevance — this is a redesign-upside case, not a niche one.

---

## Widget 2 — Pension Plans

Context: Shows pension contribution amounts by plan type, with a filter for church district. Currently a pie chart and summary table.

**Q4.** Who typically uses this widget — someone managing a single church, or someone overseeing multiple churches across a district?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Not answered directly, but context: Pension is called out as a **low-usage, HQ/Methodist-conference-specific** widget rather than something typical single-church users rely on. Suggests this is mainly a district/HQ oversight tool.
> 
> **⚠️ Correction (after reviewing the full transcript, 13.07.2026):** The "single church — treasurer, finance committee chair, or church administrator" quote previously shown here was **misattributed**. In the actual recording, Ben gives that answer right after the Budget Compared to Actual filter/variance discussion, and it's explicitly about *that* widget, not Pension — see the new question added to Widget 1 above. Ben was never asked, and never directly answered, who specifically uses Pension Plans by persona. The only confirmed fact is adoption breadth: it's used specifically by Methodist conferences, ~5% of clients. Whether that's a single-church treasurer or a conference-level admin within those clients remains genuinely unanswered — worth asking directly in a follow-up.

**Q5.** The pie chart shows a split between plan types. Is comparing plan types the main thing users want to see? Or is it more about tracking whether contributions are on schedule?

> Your answer:

**Q6.** The district filter is prominent in the current design. How often does a user need to compare across districts vs. just view their own?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Same context as Q4 — Pension is HQ/conference-specific and flagged as low-usage/deprioritize-candidate, so the district filter likely matters mainly to that small HQ audience, not typical single-church users.

---

## Widget 3 — Payroll Distributions

Context: Shows payroll cost broken down by category (net pay, tax, benefits, etc.).

**Q7.** Is this widget mainly used to review the most recent payroll run, or to compare this period against previous periods?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Not answered directly, but payroll is discussed in **action/task terms** (running payroll for weekly/biweekly/monthly pay groups) rather than in terms of comparing to previous periods — suggests the emphasis is on the current/upcoming run, not historical comparison.

**Q8.** Would it help to see this as a percentage breakdown (e.g. "net pay is 82% of total payroll cost") rather than just dollar amounts? Or are the raw numbers more useful?

> Your answer:

---

## Widget 4 — Remittance Pledges

Context: Tracks pledge progress — how much has been received vs how much is outstanding. Has a date filter.

**Q9.** The date filter on this widget currently resets to today on every page refresh. Widget 17 (Gifts Pledges) is very similar but persists the last filter used. Which behaviour is actually correct — reset or persist? Or should they both work the same way?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Not answered directly, but a general theme from the session: users expect **saved/persisted filter preferences** (saved report views, scheduled exports) rather than resets. That leans toward Widget 17's persist behavior being the more correct pattern — but Ben didn't address these two widgets by name.
> 
> **New finding (full transcript, 13.07.2026):** Ben grouped Remittance Pledges together with Insurance/Pension when listing headquarters-specific widgets — "the remittance and insurance, that is also related specifically to headquarters." So this widget is **not a typical single-church widget**; it's tied to HQ/conference-level operations, similar to Deposit Accounts, Loan Processing, and Pension/Insurance. Correction to earlier framing: I'd previously assumed this was fairly universal to church finance — that's not supported by what Ben actually said.

**Q10.** "Remittance Pledges" vs "Gifts Pledges" — these two widgets look almost identical to me. What's the actual difference between them? Who are they for?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Not answered directly as a comparison, but Ben described Gifts similarly to Remittance — tied to "a headquarters project or a nonprofit organization" — and said it "would be used a lot more if... people were using that module more." So both appear to be HQ/nonprofit-oriented rather than typical single-church tools; the specific distinction between the two still hasn't been confirmed.

---

## Widget 5 — Receivable Invoices Outstanding

Context: Tracks overdue invoices by how old they are (AR aging). The current version uses a pie chart which I think is the wrong choice here.

**Q11.** When someone looks at outstanding invoices, is the main concern *how many* are overdue, or *how much money* is overdue? Or both?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Not answered directly, but relevant context: "Receivable invoices, that's used a lot for the people that are... for those that are using accounts receivable." So — like Purchasing Management — usage is **adoption-gated**: heavy use among clients who've turned AR on, not a given for everyone. Correction to earlier framing: I'd previously treated AR as one of the "daily-use" widgets everyone touches — Ben's actual wording makes it conditional on adoption, not universal.

**Q12.** AR aging is typically shown in bands (0–30 days, 31–60 days, 61–90 days, 90+ days). Does that structure make sense for this product, or do users think about overdue invoices differently?

> Your answer:

**Q13.** Would it be useful to click on an age band and drill through to see the actual invoices? Or is this widget just meant to give a summary number?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Directly supported: Ben confirmed dashboards need **drill-through from widget lines to transaction detail** (click a line → open the related module/report), plus quick links into approval workflows. So yes — clicking an age band to see the underlying invoices fits the intended direction.

---

## Widget 6 — Insurance Billing Plans

Context: I found this one the hardest to understand. I believe it shows which staff members are enrolled in which insurance plan and what the billing amounts are — but I'm not fully sure.

**Q14.** Can you describe in one or two sentences what a user is trying to find out when they open this widget? What question does it answer?

> Your answer:

**Q15.** Is the main comparison here across plan types (e.g. PPO vs HSA vs HMO), across employees, or across time periods?

> Your answer:

**Q16.** Should this widget show individual employee names, or is it always shown as aggregated plan-level numbers?

> Your answer:

---

## Widget 7 — Deposit Accounts

Context: Shows bank account balances and whether each account is reconciled. I designed it as a card per account.

**Q17.** How many bank accounts does a typical church organisation have? I assumed three (checking, savings, investment) — is that realistic, or could there be many more?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Directly supported: "Deposit Accounts" in Ben's framing refers to **investment-style accounts**, used by a small subset of clients (HQs/Methodist conferences) — not the typical 3-account checking/savings setup. It's called out as a candidate to deprioritize for the general dashboard.
> 
> **Full transcript, direct number:** "A typical organization can have up to 50 bank accounts, with some having over 50. Therefore, 3 accounts might be less realistic for the average setup." Assuming 3 is too low — design should handle dozens of accounts, not a small fixed set.

**Q18.** Is the reconciliation status (reconciled / not reconciled) something users check regularly on this widget, or is the balance the primary thing?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Not answered directly for this widget, but related: for **Bank Account Management / live balances** (Widget 15), Ben said balance-checking is the top-priority, frequent behavior — reconciliation status wasn't mentioned as something users check as often.
> 
> **Full transcript, now directly answered for this widget:** "Users primarily focus on the balance rather than the reconciliation status. The balance is the key metric they check, especially in the context of deposit accounts." Confirmed — balance leads, reconciliation is secondary.

---

## Widget 8 — My Status

Context: A personal queue showing tasks and approvals waiting on the logged-in user. I wasn't sure exactly what types of items appear here.

**Q19.** What kinds of things appear in this widget? For example — invoice approvals, payroll sign-offs, purchase order approvals? Is it a mix, or usually one type?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Directly supported: items should be **action-oriented and tied to a specific module** — e.g. click-to-enter AP, run payroll, enter contributions — not generic "enter transactions." Scope should include both standard system tasks and user-saved custom task shortcuts.

**Q20.** Are these items genuinely urgent (things that block other people) or more like a to-do list the user works through at their own pace?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Not answered explicitly, but the framing throughout was "action-first" / click-to-task rather than a passive report — implies these are things users act on, not just browse. Urgency vs. self-paced to-do wasn't directly addressed.

**Q21.** Should overdue items look visually different from items that are just pending? Currently I've shown them in red — does that match how urgency is communicated elsewhere in Shelby?

> Your answer:

---

## Widget 9 — Payroll Scheduled Time Off

Context: Shows upcoming staff leave. I built this as a monthly calendar view, but I wasn't sure if that's the most useful format.

**Q22.** Does a payroll user care about a full calendar view, or would a simple list of upcoming absences (next 2–4 weeks) be more useful?

> Your answer:

**Q23.** Is the primary use case here "checking who's off before running payroll" or "planning coverage / resourcing"? That changes what the widget should emphasise.

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Directly supported: payroll's primary framing was **admins running payroll for pay groups** (weekly/biweekly/monthly) with pay-group and date filters — consistent with "checking who's off before running payroll" over long-range planning.

**Q24.** Should this widget show all staff, or just staff that are relevant to the logged-in user (e.g. their department)?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Not answered directly, but payroll filters were discussed in terms of **pay groups**, not departments — so segmentation by pay group may be more relevant than by department, though this wasn't stated explicitly for this widget.

---

## Widget 10 — Loans With Balance Due

Context: Shows active loans and remaining balances. I wasn't sure what kind of loans these are in a church context.

**Q25.** What types of loans appear here? For example — property mortgages, equipment leases, vehicle loans, internal fund loans? Knowing this changes how I'd display them.

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** "In a church context, the loans that typically appear are those provided by headquarters, such as a Methodist Conference, to churches. These loans are primarily for needs such as building repairs, like a new roof, rather than going to a bank." So: internal fund loans from HQ/conference to individual churches, not bank mortgages, equipment leases, or vehicle loans.
> 
> **New context (full transcript, 13.07.2026):** Ben added something worth knowing for the redesign — HQs typically don't expect these loans to be repaid on a schedule: "we give them a loan, but we don't really expect them to pay it back... we just want to know what the balance of the loan is." Feargal's read on it: "it's more of a donation than a loan," which Ben agreed with. That's likely why nobody is watching the age of these balances closely (see Q53's aging-label bug) — the term/due-date side of this widget may matter far less than the balance itself.

**Q26.** Is the most important number the remaining balance, the monthly payment, or how much of the loan term is left?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** "The key number is the remaining balance." Direct answer — lead with remaining balance, not payment or term remaining.

---

## Widget 11 — Fixed Asset Values

Context: Asset register showing current value and depreciation. I built a bar chart showing asset categories with a depreciation schedule.

**Q27.** Is this widget used to track the total value of assets, or to flag assets that need attention (e.g. fully depreciated, due for replacement)?

> Your answer:

**Q28.** Should the depreciation curve (value over time) be visible on this widget, or is the current book value all that's needed at a glance?

> Your answer:

---

## Widget 12 — Empty Slot

Context: Widget 12 is currently a blank placeholder with no content. I've recommended removing it.

**Q29.** Is there anything planned for this slot, or is it safe to remove it from the dashboard layout?

> Your answer:

---

## Widget 13 — Purchasing Management

Context: Shows purchase orders by status (pending, approved, overdue) and total spend. I wasn't sure whether status or spend is the primary focus.

**Q30.** When a user opens this widget, what's the first thing they want to know — how many POs are outstanding, or how much money is tied up in pending orders?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Directly supported: Purchasing Management's value was described as **highlighting pending approvals/tasks** — suggesting the first thing users want is what's outstanding/needs action, not the dollar total, though both matter.
> 
> **New context (full transcript, 13.07.2026):** This is one of only two widgets Ben singled out as something people actually stop and engage with, rather than just pass through: "I'm not sure that unless it's the purchasing management or maybe the payroll one, they're taking a look at [it]." Most other module home pages, in his words, people are "just passing through... they're not stopping there." Worth weighting Purchasing Management's design quality accordingly — it's already earning attention that most widgets aren't.

**Q31.** The current design groups POs by status. Would it also be useful to see them grouped by department or by vendor?

> Your answer:

---

## Widget 14 — Main Content Tasks (Quick Actions)

Context: A set of shortcut buttons for common actions — things like "New Invoice", "Run Payroll", "Add Expense". I built 6 buttons.

**Q32.** What are the 4–6 actions that finance users perform most frequently? The current design has: New Invoice, Run Payroll, Add Expense, Reconcile, New PO, and a greyed-out "+ Add Task". Is that the right set?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Directly supported, and changes the current button set: Ben named **enter AP/invoices, run payroll, enter contributions** as the core direct actions admins want. "Enter contributions" isn't in the current 6-button mockup (New Invoice, Run Payroll, Add Expense, Reconcile, New PO, +Add Task) — worth reconsidering.
> 
> **Full transcript, MVP dashboard framing:** "The 'standard accounting home dashboard' should include functional widgets that allow quick access to common tasks such as writing an AP check, running payroll, and entering contribution checks... a consolidated view of tasks, combining standard and user-saved tasks, would be beneficial. Widgets for viewing bank account balances, budget comparisons, and alerts for budget usage would also be essential." So the concrete top set is: write an AP check, run payroll, enter a contribution check — plus a consolidated (standard + custom) task list, not a fixed 6-button grid.
> 
> **New context (full transcript, 13.07.2026) — this widget is already a strong performer:** Ben explicitly said "main content [is] used a lot... there are some people actually moving that up higher than the graphs." So Main Content Tasks isn't just a good idea for the redesign — it's already outperforming the chart widgets today. Worth protecting/building on rather than treating as unproven.

**Q33.** Should these quick actions be the same for every user, or should they change based on the user's role (e.g. a payroll admin sees different shortcuts than an accounts payable clerk)?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Directly supported: scope should allow **both standard system tasks and user-saved custom shortcuts**, with each task identifying its target module. This leans toward personalization/customization rather than a fixed role-based set.

---

## Widget 15 — Bank Balances

Context: Very similar to Widget 7 (Deposit Accounts) — shows checking, savings, and investment account balances with reconciliation status. I hit a technical issue here that caused it to be the most complex widget in the build.

**Q34.** This widget and Widget 7 (Deposit Accounts) look almost identical to me. What's the intended difference between them?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Directly answered: **Bank Balances = live/operating account balances** — top priority, checked frequently by most users. **Deposit Accounts = investment-style accounts** — low-usage, HQ/Methodist-conference-specific. That's the real distinction between the two widgets.
> 
> **Full transcript, exact quote:** "Deposit Accounts are used when organizations, like HQs, manage investments from individuals or entities, similar to an investment company managing funds. Bank Balances, on the other hand, refer to the actual cash balance in an organization's bank account used for reconciling transactions. These serve distinct purposes and should remain separate." Confirmed: keep them as two separate widgets, don't merge.

**Q35.** If a church has many accounts, should this widget show all of them and let the user scroll, or just show a top 3–5 with a "view all" link?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Not asked directly for this widget, but relevant: organizations can have **up to 50 bank accounts** (see Q17). At that scale, a long scroll isn't practical — this supports a top-3–5-plus-"view all" pattern over listing everything inline.

---

## Widget 16 — Accounts Payable By Due Date

Context: AP aging — what the organisation owes and when it's due. The current version has a pie chart where the labels show dollar amounts instead of dates, which is clearly a bug.

**Q36.** Aside from fixing the label bug, should this widget primarily show *when* bills are due (a timeline view) or *how much* is owed by age band?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Not answered directly, but relevant context: AP is flagged as **underused because many small clients want a one-step quick-check rather than a two-step invoice→pay workflow**. Suggests this widget should support a fast "what's owed" check over a detailed timeline-driven flow.
> 
> **Important clarification (full transcript, 13.07.2026):** AP as a *module* is still core — Ben named it directly alongside GL and Bank Account Management as the base package ("the focus ones would obviously be General Ledger, Accounts Payable, Bank Account Management—which is the base package"). It's specifically the two-step *invoice-then-pay-later* workflow that's bypassed by smaller clients in favor of one-step quick checks — not AP as a whole. Worth designing this widget around "what's owed and needs processing" rather than assuming AP itself is unimportant.

**Q37.** Is it important to see individual vendors and their overdue amounts, or is an aggregated view (total overdue by age) enough for this widget?

> Your answer:
> 
> **New context (full transcript, 13.07.2026) — a role split worth designing for:** Ben described two distinct roles interacting with AP: the person **entering** invoices (just needs to get them in) versus the person **approving** them, who needs more — "they're going to be approving, reviewing the receipts or the attachments and notes... we're looking at whether the person has budget left." So an approver likely needs more detail (vendor, amount, remaining budget, attachments) than a pure summary view — the entry role probably doesn't need this widget's detail at all.

---

## Widget 17 — Gifts Pledges

Context: Tracks donor pledge progress by giving category (e.g. Building Fund, Youth Ministry). Similar to Widget 4.

**Q38.** See Q10 above — can you clarify the difference between this and Remittance Pledges?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** See the correction on Q10 — Ben described Gifts as tied to "a headquarters project or a nonprofit organization," the same framing as Remittance Pledges. The exact functional difference between the two still hasn't been confirmed; both read as HQ/nonprofit-oriented rather than typical single-church tools.

**Q39.** Should progress bars (showing % received vs pledged) be the main visual here, or would a simple table of amounts work better?

> Your answer:

---

## General Questions

**Q40.** Several widgets have date filters. Should they all default to the current fiscal period, the current calendar month, or today's date? Is there a standard across Shelby?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Not answered directly, but the general expectation raised was **saved/persisted filter preferences** (saved views, scheduled exports) rather than resetting — leans toward persisting the user's last filter as the standard, though no fiscal-period-specific default was mentioned.

**Q41.** When a widget has no data for the selected period (e.g. no invoices, no time-off requests), what should it show? An empty state message, last known data, or something else?

> Your answer:

**Q42.** Are there any widgets on the current dashboard that users regularly complain about or ignore entirely? That would help prioritise what to fix first.

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Directly answered: **Accounts Payable (invoice workflow)** is underused/complained about because the two-step invoice→pay flow doesn't match how many small clients actually work. **Deposit Accounts, Loan Processing, Fixed Assets, and Pension/Insurance** were all called out as low-usage, HQ-only widgets.
> 
> **Full transcript, with an importance score:** Asked to score every widget 1–5, Ben gave clear 5s to **Bank account management** (live balances) and **Payroll distribution**. Clear 1s/2s: **Deposit accounts** (<1% of users, mostly HQs), **Loan processing** (rarely used, mostly HQs), **Pension and insurance billing** (Methodist-conference-specific, ~5% of clients). He was explicit that low usage on these three is a **niche-need issue, not a usability failure** — so redesigning them isn't the priority; sequencing/visibility on the dashboard is.

**Q43.** Is there anything on the current dashboard that users love and would not want changed — even just the concept, not the visual?

> Your answer:
> 
> **Question and answer from Ben Lane (13.07.2026):** Not answered as "loved," but validated as high-value and worth keeping conceptually: **Bank Account Management/live balances** (checked constantly) and **Purchasing Management** (valued by clients who've adopted it, for surfacing pending approvals).

---

## New Questions Surfaced in the Interview (Not in the Original List)

These weren't on the original list — Ben was asked broader, cross-widget questions during the session that this project didn't originally plan for. Adding them here in the same Q&A format so they're not lost in a summary paragraph.

**Q44.** Across all 17 widgets, which ones do users open most often today, and who's opening them — which persona?

> **Question and answer from Ben Lane (13.07.2026):** "The most commonly used widgets include bank account management for live bank balances and payroll distributions. These are frequently accessed by administrators or supervisors, often in roles such as church treasurers or finance committee chairs. The focus is typically on high-traffic widgets that support everyday financial operations, aligning with the needs of users managing multiple tasks across small to medium churches."

**Q45.** Which widgets are barely used or ignored — and for each one, is that because they serve a narrow specialist case, because something about how they work today makes people avoid them, or something else?

> **Question and answer from Ben Lane (13.07.2026):** Three widgets called out as barely used: **Deposit Accounts** (rarely used, mainly HQs managing investments, <1% of users), **Loan Processing** (used minimally, mostly by HQs like Methodist Conferences), and **Pension and Insurance Billing** (Methodist-conference-specific, ~5% of clients). Ben was explicit that "the low usage of these widgets is largely due to their specialized functions rather than usability failures" — i.e. niche need, not a design/usability problem. (Related to Q42, but broader — Q42 focused on complaints, this covers all 17.)

**Q46.** If you scored every widget 1–5 on importance, which are clear 5s, and which are clear 1s or 2s?

> **Question and answer from Ben Lane (13.07.2026):** Clear 5s: **Bank account management** (frequently used for live bank balances) and **Payroll distribution** (highly valued by clients). Clear 1s/2s: **Deposit accounts** (<1% of users, primarily HQs), **Loan processing** (rarely used, primarily HQs), **Pension and insurance billing** (Methodist-conference-specific, ~5% of users).

**Q47.** If we built one generic "standard accounting home dashboard" as the default for a brand-new user, which widgets would be on it, and why those specifically?

> **Question and answer from Ben Lane (13.07.2026):** "The 'standard accounting home dashboard' should include functional widgets that allow quick access to common tasks such as writing an AP check, running payroll, and entering contribution checks... Additionally, a consolidated view of tasks, combining standard and user-saved tasks, would be beneficial. Widgets for viewing bank account balances, budget comparisons, and alerts for budget usage would also be essential... These selections cater to administrators or supervisors who need a quick overview and easy access to frequent functions without navigating complex menus."

**Q48.** Would that standard dashboard look the same for every accounting persona, or would some need a different default set?

> **Question and answer from Ben Lane (13.07.2026):** "The standard dashboard would not be the same for every accounting persona. Different personas, such as administrators, supervisors, or specific organizational roles, may require different default sets of widgets tailored to their tasks and responsibilities... The ability to customize and add or remove widgets is essential to cater to these varied needs."

**Q49.** When someone switches companies, should every widget update to the new company automatically, or would some widgets reasonably stay pinned to a different one?

> **Question and answer from Ben Lane (13.07.2026):** "Most users prefer that when they switch companies, all widgets update to reflect the new company automatically. However, there are some large organizations that might benefit from having the ability to pin specific widgets to different companies. Despite this, the majority would likely favor a global switch affecting all widgets."

**Q50.** Is there a real need or use case to switch companies individually per widget on the same dashboard, or is switching always all-or-nothing?

> **Question and answer from Ben Lane (13.07.2026):** "The majority of users prefer a global context switch where the entire dashboard reflects the selected company. However, there are specific cases, such as large headquarters with multiple companies, where individual widget context switching might be beneficial. Despite this, the general preference remains for a single, unified company view across the dashboard."

**Q51.** Do bank account and fiscal period switching behave the same way as company switching, or are there cases where a widget needs its own setting independent of the rest of the dashboard?

> **Question and answer from Ben Lane (13.07.2026):** "Most users prefer a global context switch that affects the entire dashboard, similar to company switching. However, there are instances, especially with larger organizations, where having per-widget context settings would be beneficial. This allows for viewing multiple accounts or periods independently within the same dashboard, catering to specific needs of larger entities with complex structures. Yet, the majority of users would likely prefer a straightforward, unified approach."

**Q52.** If per-widget context switching existed, who would use it and for what task — or is a single global switch genuinely enough?

> **Question and answer from Ben Lane (13.07.2026):** "Per-widget context switching might be beneficial for larger organizations, such as headquarters with multiple companies, where tasks involve managing shared resources across entities. However, for the majority of users, a single global switch would suffice, as they typically operate within a single company context."
> 
> **Concrete example (full transcript, 13.07.2026):** Ben gave a real case — the Diocese of Toledo, which has multiple companies that share some of the same bank accounts across companies. That cross-company sharing is the actual scenario where per-widget switching would help. But even for them: "the majority of times, they would be looking at it as company-specific." So this is a narrow, real, but genuinely minority need.

**Q53.** (Bug, surfaced during the interview, not previously logged) Aging labels currently show "Over 60" but actually mean 90+ days — should that be fixed in the redesign?

> **Question and answer from Ben Lane (13.07.2026):** "Yes, the mislabeling should be corrected to accurately reflect the intended 90+ days." Note: this came up in the loans/aging part of the discussion — not yet confirmed which widget(s) carry this exact label. Check Widget 5 (Receivable Invoices Outstanding), Widget 10 (Loans With Balance Due), and Widget 16 (Accounts Payable By Due Date) for the same "Over 60" mislabeling when reviewing mockups — this is separate from the dollar-amount-instead-of-date bug already noted on Widget 16.

**Q55 (new, added after reviewing the full transcript).** Is there a meaningful difference in how the dashboard is actually used between bigger organizations and small churches?

> **Question and answer from Ben Lane (13.07.2026):** Yes, and it's a significant caveat on all the usage data above. Ben described two distinct customer types: "the big clients, like the HQs and the big churches, that have multiple people that are in the system and they're accessing it well and they're benefiting from it," versus "the biggest sales we're having now, percentage-wise... these small churches that run 100 or 200, and there's one person that's doing everything and they're overwhelmed. So they're not getting the benefit from those widgets because they're just flying right past them, going to where they're actually putting in the transactions." He also noted supervisors often don't even have system logins — they just get reports out of it, partly because clients don't want to pay for extra user seats. **Implication:** for most of today's actual customer base (the small-church segment, which is the growth segment), nobody is deeply engaging with widgets at all — they skip straight to data entry. Today's "usage" rankings mostly reflect the smaller HQ/big-church segment that has multiple named users.

**Q56 (new, added after reviewing the full transcript).** Which modules make up the "core" of the product that Ben considers the main focus, independent of individual widget usage?

> **Question and answer from Ben Lane (13.07.2026):** "The focus ones would obviously be General Ledger, Accounts Payable, Bank Account Management — which is the base package — add Payroll, add Accounts Receivable, and then add Purchasing Management. So those would be the ones that would be the main focus." Note this list includes AP and AR even though both have adoption/workflow caveats elsewhere (AP's invoice-then-pay flow is bypassed by small clients; AR usage is adoption-gated) — Ben still considers both core modules, just modules where the *current* widget doesn't yet reflect how people actually work.

---

## Additional context from interview (not tied to a specific question)

- **Saved report views and scheduled emailing are already being built by ValueLabs Development** (per Feargal) — the dashboard should be designed to surface those saved reports and attach them to widgets, rather than duplicating that work.
- **Drill-through and click-to-task are the two big structural asks** — from any widget line to transaction detail, and from any task item straight into the relevant module (AP, AR, PO approvals, payroll, contributions). Confirmed again with a concrete example in the full transcript: Ben described clicking into an individual bank account ("Checking 05") to see its own detail as "a feature that is loved by our clients" on the reporting side, and wants the same on the dashboard.
- **Most module home pages get passed through, not lingered on** — "the majority of people are just passing through that main page of each module, they're not stopping there." Purchasing Management (and possibly Payroll) are the exceptions Ben called out as things people actually stop and look at.

**Corrections made after reviewing the full transcript (13.07.2026), superseding earlier notes above:** the Pension Plans persona quote (Q4) was misattributed and has been corrected/moved to a new Q54 under Budget Compared to Actual; Remittance Pledges and Gifts Pledges (Q9/Q10/Q38/Q39) are HQ/nonprofit-specific, not typical single-church tools, correcting an earlier assumption that they were fairly universal; Accounts Receivable (Q11) usage is adoption-gated like Purchasing Management, not a given "daily-use" widget for everyone.

**Still fully open, not touched in either interview pass:** Widgets 6 (Insurance Billing Plans — Q14/Q15/Q16), 12 (Empty Slot — Q29), the exact functional difference between Gifts Pledges and Remittance Pledges (Q10/Q38 — both are now known to be HQ/nonprofit-oriented, but not how they differ from each other), the AR aging band structure (Q12), individual-vendor amount display on AP (Q37 — the entry-vs-approval role split is now known, but not whether vendor-level detail belongs in this widget), grouping POs by department/vendor (Q31), empty states (Q41), and fiscal-period-specific date-filter defaults (Q40 — persisted filters are the general expectation, but no fiscal-period-specific default was confirmed).

---

*Questions prepared by Oisin Curran — July 2026. Based on investigation and mockup work in the For Dashboard project folder.*