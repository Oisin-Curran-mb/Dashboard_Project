# Step 2 — Feedback / Market Research — Folder Index

> **Read this file first.** New folder, added 2026-07-21 per direct instruction. Its job: hold one file of competitor/market research per widget — how other companies present this kind of information (visuals, layout, framing) — so that research lives in one predictable place instead of being scattered across `Step 3 - Mock_Work/Widget_Specs/` and `Step 4 - Widget Final Design/`, where it's easy to lose track of during a restructure.

## Why this folder exists

Some widgets already carry a `## How Other Companies Fulfil This Purpose` (or `## Purpose & Competitive Fit Check`) section inside their `Widget_Specs/` and/or `Widget Final Design` docs — W15 Bank Balances is one example (its research cites Hiline's nonprofit financial dashboard writeup on "runway" framing). That content isn't lost, but it's split across two different Step folders and easy to overlook when either folder gets restructured. This folder is meant to become the one place this research actually lives, cited by Step 3/4 rather than duplicated across them.

## Current status

**All 16 files were created 2026-07-21 as empty placeholders.** W15 was researched the same day using the `widget-market-research` skill (see below) and is now filled in — the other 15 are still placeholders, pending a decision on when/whether to run the same pass on each. See each file's own "Note on Existing Content Elsewhere" section for what it currently points back to in Step 3/4.

## Template

**`TEMPLATE.md`** defines the shape every widget file follows: What This Widget Shows Today, Data Used (checked against Step 1 and the Developer Punch List, so a proposed visual's feasibility is visible up front), Competitor / Industry Findings (with a confidence read per source — one blog post isn't "industry standard"), Visual Options (aim for 3, traceable to a finding or flagged as internal-idea-only), Net Assessment (supports / conflicts with / no signal on the current design), and Sources. When running the `deep-research` skill against a widget, point it at this file and ask it to fill in that exact shape rather than freeform output — that's what keeps all 16 files consistent as they get researched one at a time.

| # | Widget | File | Status |
|---|--------|------|--------|
| 01 | Budget Compared to Actual | [W01](W01%20-%20Budget%20Compared%20to%20Actual.md) | ⚪ Not yet researched |
| 02 | Pension Plans | [W02](W02%20-%20Pension%20Plans.md) | ⚪ Not yet researched |
| 03 | Payroll Distributions | [W03](W03%20-%20Payroll%20Distributions.md) | ⚪ Not yet researched |
| 04 | Remittance Pledges | [W04](W04%20-%20Remittance%20Pledges.md) | ⚪ Not yet researched |
| 05 | Receivable Invoices Outstanding | [W05](W05%20-%20Receivable%20Invoices%20Outstanding.md) | ⚪ Not yet researched |
| 06 | Insurance Billing Plans | [W06](W06%20-%20Insurance%20Billing%20Plans.md) | ⚪ Not yet researched |
| 07 | Deposit Accounts | [W07](W07%20-%20Deposit%20Accounts.md) | ⚪ Not yet researched |
| 08 | My Status | [W08](W08%20-%20My%20Status.md) | ⚪ Not yet researched |
| 09 | Payroll Scheduled Time Off | [W09](W09%20-%20Payroll%20Scheduled%20Time%20Off.md) | ⚪ Not yet researched |
| 10 | Loans With Balance Due | [W10](W10%20-%20Loans%20With%20Balance%20Due.md) | ⚪ Not yet researched |
| 11 | Fixed Asset Values | [W11](W11%20-%20Fixed%20Asset%20Values.md) | ⚪ Not yet researched |
| 12 | *(Empty Slot)* | — | ➖ N/A — no widget assigned to this slot |
| 13 | Purchasing Management | [W13](W13%20-%20Purchasing%20Management.md) | ⚪ Not yet researched |
| 14 | Main Content Tasks | [W14](W14%20-%20Main%20Content%20Tasks.md) | ⚪ Not yet researched |
| 15 | Bank Balances | [W15](W15%20-%20Bank%20Balances.md) | ✅ Researched (2026-07-21) |
| 16 | Accounts Payable By Due Date | [W16](W16%20-%20Accounts%20Payable%20By%20Due%20Date.md) | ⚪ Not yet researched |
| 17 | Gifts Pledges | [W17](W17%20-%20Gifts%20Pledges.md) | ⚪ Not yet researched |

## Naming convention

`WNN - Name.md`, matching `Step 4 - Widget Final Design/`'s file naming exactly (not Step 1's `NN - Name.md` or Step 3's `WNN-Name.md` with no spaces) — picked so a widget's file name looks the same across every step except Step 1 and Step 3, which already had their own established conventions before this folder existed.

## Rules for future AI passes

1. **Don't populate these files with real research without the project owner's go-ahead first.** This folder was deliberately set up structure-only — content is a separate, explicit next step.
2. **Don't delete or move the existing `## How Other Companies Fulfil This Purpose` sections in `Widget_Specs/` or `Widget Final Design/` docs while populating this folder later**, unless the project owner explicitly says to move (not copy) them — the whole point of this folder existing is to stop content from disappearing during a restructure, so a migration pass needs to be done carefully, not silently.
3. **Widget 12 (Empty Slot) does not get a file here**, matching how every other Step folder treats it.
4. **Update the status column above** the same pass any individual widget file gets real content — don't let this table go stale the way other trackers in this project have.
