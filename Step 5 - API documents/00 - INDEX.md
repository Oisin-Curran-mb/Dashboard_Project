# Step 5 — API Documents — Index

> **Read this file first.** This folder is where a widget's backend needs get properly specified, once its design is finished. Renamed from `API documents` on 2026-07-20 to bring it in line with the project's Step-N naming (`Step 2 - Feedback`, `Step 3 - Mock_Work`, `Step 4 - Widget Final Design`, now `Step 5 - API documents`). All project references to the old name were updated at the same time.

## Where this fits in the pipeline

**A widget only starts here once it's marked ✅ Done in `Step 4 - Widget Final Design/00 - INDEX.md`.** Being "in progress" or "close to done" in Step 4 is not enough — an API spec is the next step after a widget's design is finished and confirmed against the real build, not a prerequisite for reaching that point. So the widgets eligible for a spec in this folder grow as Step 4's Done list grows.

**Sign-off findings check (added 2026-07-27):** before writing or updating any spec here, check the widget's `Step 6 - Sign off document/` subfolder — as of 2026-07-27 every widget has a pulled Confluence dossier there, and some have reconciliation files. Findings carry a status: **Accepted** ones must be honoured in the spec (don't spec fields for a feature that was accepted as rejected); **Rejected** ones are noted and ignored; **Disputed** ones (both sides hold evidence, e.g. W03's pay-type list) go into the spec's "Still needs sign-off" section with both claims cited — the spec never picks a side; **Unreviewed** ones need the project owner's status call before speccing the part they touch. The `widget-api-spec-writer` skill encodes this. W03's reopening (see bottom of this file) is the precedent: a sign-off finding invalidating a spec assumption is exactly what this check exists to catch early.

## Reference docs (read-only — do not edit)

- **`Widget_Comparison_Classic.html`** and **`Widget_Comparison_New_Widgets.html`** — these exist purely as a historical comparison of what used to be there (the legacy ASP.NET codebase and tables) against the modern API already built to replace it, per widget. They are not living documents and are not meant to be updated as new specs get written — they're the fixed baseline every new spec should check against, not a target to keep in sync.
- **`How to Write a Widget API Spec.md`** — the process to follow for every new spec: find the real existing API first (in the two comparison docs above), list tables, show old vs. new, define request params and a full real JSON response example, edge cases, open items, and scope boundaries. API only — no frontend concerns (sizes, colors, chart types) belong here.

## Widget specs

| Widget | Step 4 status | Folder | Spec status |
|---|---|---|---|
| Budget Compared to Actual (W01) | ✅ Done | [Budget Compared to Actual](Budget%20Compared%20to%20Actual/) | 🟡 Draft — needs review — rewritten 2026-07-27 as a clean dev handoff (Time Window Module contract: window/grain/asOf, bucket response, validation matrix); Confluence HTML regenerated |
| Pension Plans (W02) | ✅ Done | [Pension Plans](Pension%20Plans/) | 🟡 Draft — needs review — written 2026-07-27, revised same day to a strict 1-to-1 contract with the existing pension-plans endpoints; only new field: AppointeeCount on grid rows (plus the pre-existing Charge bug fix); grouped-bar matrix and all-districts scope assembled client-side |
| Payroll Distributions (W03) | ✅ Done | [Payroll Distributions](Payroll%20Distributions/) | 🟡 Draft — needs review — updated 2026-07-27 for the built Final (window/custom-range params; pay-type breakdown feasibility RESOLVED with evidence, see the Pay Type Breakdown Analysis proof file in the folder; no comparison fields per sign-off F3; **zero personal data by owner decision**: amounts only, no hours/rates/names/check numbers, breakdown stops at distribution × pay type) |
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

**Resolved 2026-07-27 — Pension Plans (W02) spec written.** This section previously flagged W02 as Done in Step 4 with no spec here; that spec now exists at [Pension Plans/Pension Plans - API Spec.md](Pension%20Plans/Pension%20Plans%20-%20API%20Spec.md) (🟡 Draft — needs review), written against `Widget_Comparison_Classic.html`'s `pp1` baseline (`PensionPlans` legacy class, `pension-plans` modern API) and the built Final. No other eligible widget is missing a spec: all four Step 4 ✅ Done widgets (W01, W02, W03, W07) now have draft specs in this folder. Note: the tracker-status table above still shows W02 as ⚪ Not started from the last `Dashboard Tracker.xlsx` sync (2026-07-21) — it should read 🔵 In progress at the next tracker re-sync, matching W01/W07's draft-spec convention.

## Known open item — resolved by reopening the spec (2026-07-21)

The previous version of the Payroll Distributions spec never addressed the pay-type/earnings-code breakdown (Regular, Vacation, OverTime, Sick, Double Time, Personal, Holiday, Misc, Other) that the widget's build and final design doc both need — it wasn't in the Tables section, the old-vs-new table, or the sign-off list, despite the spec being marked done. Per direct instruction, the whole spec was rewritten in place (same file, no version-numbered copy) to name this gap directly: the only field either codebase actually returns (`PR_HistoryCompensation.Name`, via `CompensationDistributionID`) doesn't confirm whether it's the Department dimension, the pay-type Category dimension, or something else entirely — see the new spec's "Flag" under Tables and its "Still needs sign-off" list. The all-departments view is fully specified and buildable; the single-department Category view is explicitly flagged as not buildable until that's resolved. Status reverted to 🟡 Draft — needs review, since a spec that names a real unresolved architecture question can't honestly stay marked done. **Update 2026-07-27:** that unresolved question is now closed with evidence — the Pay Type Breakdown Analysis proof file in the widget's folder confirms the grouping is the org-defined distribution labels (`PR_CompensationDistribution.Name`) and that a full pay-type breakdown is supported by existing `PR_HistoryCompensation` columns (`SubType`/`Hours`/`Rate`), no schema changes; the spec was updated the same day.
