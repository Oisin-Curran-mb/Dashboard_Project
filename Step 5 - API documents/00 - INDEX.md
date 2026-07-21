# Step 5 — API Documents — Index

> **Read this file first.** This folder is where a widget's backend needs get properly specified, once its design is finished. Renamed from `API documents` on 2026-07-20 to bring it in line with the project's Step-N naming (`Step 2 - Feedback`, `Step 3 - Mock_Work`, `Step 4 - Widget Final Design`, now `Step 5 - API documents`). All project references to the old name were updated at the same time.

## Where this fits in the pipeline

**A widget only starts here once it's marked ✅ Done in `Step 4 - Widget Final Design/00 - INDEX.md`.** Being "in progress" or "close to done" in Step 4 is not enough — an API spec is the next step after a widget's design is finished and confirmed against the real build, not a prerequisite for reaching that point. So the widgets eligible for a spec in this folder grow as Step 4's Done list grows.

## Reference docs (read-only — do not edit)

- **`Widget_Comparison_Classic.html`** and **`Widget_Comparison_New_Widgets.html`** — these exist purely as a historical comparison of what used to be there (the legacy ASP.NET codebase and tables) against the modern API already built to replace it, per widget. They are not living documents and are not meant to be updated as new specs get written — they're the fixed baseline every new spec should check against, not a target to keep in sync.
- **`How to Write a Widget API Spec.md`** — the process to follow for every new spec: find the real existing API first (in the two comparison docs above), list tables, show old vs. new, define request params and a full real JSON response example, edge cases, open items, and scope boundaries. API only — no frontend concerns (sizes, colors, chart types) belong here.

## Widget specs

| Widget | Step 4 status | Folder | Spec status |
|---|---|---|---|
| Budget Compared to Actual (W01) | ✅ Done | [Budget Compared to Actual](Budget%20Compared%20to%20Actual/) | 🟡 Draft — needs review |
| Pension Plans (W02) | ✅ Done | *(none yet)* | ⚪ Not started — eligible now, no spec written yet |
| Payroll Distributions (W03) | ✅ Done | [Payroll Distributions](Payroll%20Distributions/) | 🟡 Draft — needs review (reopened 2026-07-21, see note below) |
| Deposit Accounts (W07) | ✅ Done | [Deposit Accounts](Deposit%20Accounts/) | 🟡 Draft — needs review |

All other widgets (W04–W06, W09–W17) aren't eligible yet — none are marked Done in Step 4.

## Step 5 tracker status — all 17 widgets

`Dashboard Tracker.xlsx`'s "Step 5 - API documents" column — synced 2026-07-20, then re-synced 2026-07-21 to reflect W01's new draft spec (now "In progress," matching W07's row). Remaining 13 "not eligible" widgets are listed too so the full 17 are covered in one place:

| # | Widget | Step 5 (tracker) |
|---|---|---|
| 01 | Budget Compared to Actual | 🔵 In progress |
| 02 | Pension Plans | ⚪ Not started |
| 03 | Payroll Distributions | ✅ Complete |
| 04 | Remittance Pledges | ⚪ Not started |
| 05 | Receivable Invoices Outstanding | ⚪ Not started |
| 06 | Insurance Billing Plans | ⚪ Not started |
| 07 | Deposit Accounts | 🔵 In progress |
| 08 | My Status | ⚪ Not started |
| 09 | Payroll Scheduled Time Off | ⚪ Not started |
| 10 | Loans With Balance Due | ⚪ Not started |
| 11 | Fixed Asset Values | ⚪ Not started |
| 12 | *(Empty Slot)* | ➖ N/A |
| 13 | Purchasing Management | ⚪ Not started |
| 14 | Main Content Tasks | ⚪ Not started |
| 15 | Bank Balances | ⚪ Not started |
| 16 | Accounts Payable By Due Date | ⚪ Not started |
| 17 | Gifts Pledges | ⚪ Not started |

### Spec status key

| Badge | Meaning |
|-------|---------|
| ✅ Approved | Sent out and done — the file's own `Status: DRAFT — not final` line has been removed per the process doc's own rule (mark draft while in progress, remove the line once approved — never version-numbered copies). |
| 🟡 Draft — needs review | File exists, still carries `Status: DRAFT — not final`, awaiting review. |
| ⚪ Not started | Widget is eligible (Done in Step 4) but no `Step 5 - API documents/<Widget Name>/` folder exists yet. |

## Open gap

**Pension Plans (W02) is Done in Step 4 but has no spec here yet.** Per the rule above, it's eligible to start now — this is the next one to write, following `How to Write a Widget API Spec.md` and using `Widget_Comparison_Classic.html`'s `pp1` entry as the baseline (`PensionPlans` legacy class, `pension-plans` modern API). Flagging rather than starting it, since writing the actual spec is real technical work, not folder upkeep.

## Known open item — resolved by reopening the spec (2026-07-21)

The previous version of the Payroll Distributions spec never addressed the pay-type/earnings-code breakdown (Regular, Vacation, OverTime, Sick, Double Time, Personal, Holiday, Misc, Other) that the widget's build and final design doc both need — it wasn't in the Tables section, the old-vs-new table, or the sign-off list, despite the spec being marked done. Per direct instruction, the whole spec was rewritten in place (same file, no version-numbered copy) to name this gap directly: the only field either codebase actually returns (`PR_HistoryCompensation.Name`, via `CompensationDistributionID`) doesn't confirm whether it's the Department dimension, the pay-type Category dimension, or something else entirely — see the new spec's "Flag" under Tables and its "Still needs sign-off" list. The all-departments view is fully specified and buildable; the single-department Category view is explicitly flagged as not buildable until that's resolved. Status reverted to 🟡 Draft — needs review, since a spec that names a real unresolved architecture question can't honestly stay marked done.
