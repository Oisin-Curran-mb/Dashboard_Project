# Step 4 — Widget Final Design — Index

> **Read this file first.** This folder holds the ONE living design doc per widget — the doc that's supposed to always match what's actually built, after it's gone through `Step 1 - Dashboard Research/` (baseline), `Step 2 - Feedback/` (interviews/questions), and `Step 3 - Mock_Work/` (spec drafting + coded prototype). Renamed from `Widget Final Desgin` on 2026-07-20 — fixing the typo and bringing it in line with the project's Step-N naming (`Step 2 - Feedback`, `Step 3 - Mock_Work`, now `Step 4 - Widget Final Design`). All project-wide references to the old name were updated at the same time; `PROJECT INDEX.md` was left untouched since it's already flagged stale and frozen pending its own rewrite.

---

## What should be in each widget's file

Every `WNN - Name.md` file in this folder follows the same shape. Use this as the template when starting a new one, and as the checklist when reviewing an existing one:

| Section | What goes here |
|---|---|
| Header block | `**Module:**`, `**Status:**`, `**Full history / rejected ideas:**` (link to the matching `Step 3 - Mock_Work/Widget_Specs/WNN-Name.md`), `**Data source & formulas:**` (link to the matching `Step 1 - Dashboard Research/NN - Name.md`) |
| `## Purpose` | One paragraph: what the widget shows and why, in current, correct framing — not the original research framing if it's since been corrected (see W03's Purpose history for an example of this drifting and getting caught) |
| `## How Other Companies Fulfil This Purpose` *(optional)* | Only if outside research backs a specific design choice (e.g. why two views are kept as peers) |
| `## Filters` | Table of filter name → values/defaults, plus any footnote on open items (e.g. fields needing backend confirmation) |
| `## Data Table Sort` | The fixed sort order and whether there's a user-toggle |
| `## Drill-Through` | Whether it's a new feature, kept from the old design, or still an open item with no target page/URL |
| `## Refresh` | Where the refresh icon lives and at which sizes |
| `## Views (Switch View)` | Every switchable view as its own subsection, plus a **Size behaviour** table (Small/Medium/Large/KPI/Expanded) |
| `## What Got Cut (and why)` | Anything considered and dropped, so nobody re-proposes it without knowing it was already decided against |
| `## Fine-Tuning Notes` | Dated changelog entries, especially anything marked "per direct instruction" — these are the strongest signal of the most recent real decision |

**One caution:** almost every file in this folder currently says `**Status:** 🟢 Final design — locked` in its own header — that line is not a reliable signal on its own (it's been true even for widgets later found to be stale against the real build). Treat the status column in this index as the one to trust, not the line inside each file.

---

## Widget status

**Two status columns below track different things.** "Status" is this folder's own audit-verified judgment (has the doc been checked against the real build via `widget-final-check-audit`?). "Tracker status" is pulled directly from `Dashboard Tracker.xlsx`'s Step 4 column, which the project owner edited by hand on 2026-07-20 — treated as the source of truth for that column, not re-derived from the audit. They can legitimately disagree (e.g. a file can exist and be under active work — "Status: 🔵 In progress" — while the tracker currently reads "Not started" because it hasn't been picked up as a priority yet). Don't collapse them into one column.

| # | Widget | Module | File | Status | Tracker status |
|---|--------|--------|------|--------|--------|
| 01 | Budget Compared to Actual | Finance | [W01](W01%20-%20Budget%20Compared%20to%20Actual.md) | ✅ Done | ✅ Complete |
| 02 | Pension Plans | Finance | [W02](W02%20-%20Pension%20Plans.md) | ✅ Done | ✅ Complete |
| 03 | Payroll Distributions | Payroll | [W03](W03%20-%20Payroll%20Distributions.md) | ✅ Done | ✅ Complete |
| 04 | Remittance Pledges | Finance | [W04](W04%20-%20Remittance%20Pledges.md) | 🔵 In progress | ⚪ Not started |
| 05 | Receivable Invoices Outstanding | Finance | [W05](W05%20-%20Receivable%20Invoices%20Outstanding.md) | 🔵 In progress | ⚪ Not started |
| 06 | Insurance Billing Plans | HR | [W06](W06%20-%20Insurance%20Billing%20Plans.md) | 🔵 In progress | ⚪ Not started |
| 07 | Deposit Accounts | Finance | [W07](W07%20-%20Deposit%20Accounts.md) | ✅ Done | ✅ Complete |
| 08 | My Status | Other | — (no file yet) | ⚪ Not started — deferred | ⚪ Not started |
| 09 | Payroll Scheduled Time Off | Payroll | [W09](W09%20-%20Payroll%20Scheduled%20Time%20Off.md) | 🔵 In progress | ⚪ Not started |
| 10 | Loans With Balance Due | Finance | [W10](W10%20-%20Loans%20With%20Balance%20Due.md) | 🔵 In progress | ⚪ Not started |
| 11 | Fixed Asset Values | Finance | [W11](W11%20-%20Fixed%20Asset%20Values.md) | 🔵 In progress | ⚪ Not started |
| 12 | *(Empty Slot)* | Other | — | N/A — no widget assigned to this slot | ➖ N/A |
| 13 | Purchasing Management | Finance | [W13](W13%20-%20Purchasing%20Management.md) | 🔵 In progress | ⚪ Not started |
| 14 | Main Content Tasks | Other | — (no file yet) | ⚪ Not started (no longer deferred — 🔵 In progress at Step 3, not eligible for Step 4 yet) | ⚪ Not started |
| 15 | Bank Balances | Finance | [W15](W15%20-%20Bank%20Balances.md) | 🔵 In progress | ⚪ Not started |
| 16 | Accounts Payable By Due Date | Finance | [W16](W16%20-%20Accounts%20Payable%20By%20Due%20Date.md) | 🔵 In progress | ⚪ Not started |
| 17 | Gifts & Pledges | Finance | [W17](W17%20-%20Gifts%20Pledges.md) | 🔵 In progress | ⚪ Not started |

### Status key

| Badge | Meaning |
|-------|---------|
| ✅ Done | Verified against the actual build (`Dashboard Widget Mockups.html` Final Check tab) via the `widget-final-check-audit` skill — the doc and the build agree, and any drift found has been resolved or explicitly logged. |
| 🟡 Close to done | The design work is essentially finished, but hasn't been through a final check yet — flagged by the project owner as needing a pass before it counts as done. |
| 🔵 In progress | A file exists here and the widget's design work is underway, but it hasn't been checked against the real build yet — its own "locked" language shouldn't be trusted until it has. |
| ⚪ Not started | No file exists yet. My Status is deferred in `Widget_Specs/` pending a product decision; Main Content Tasks is no longer deferred (🔵 In progress at Step 3, confirmed design + Large-size build) but hasn't reached Step 4 yet. |
| N/A | Not a real widget — an empty catalog slot. |

---

## Context for next sessions

- W02, W03, W07, and now W01 (confirmed 2026-07-21) are the only widgets confirmed done, via a 3-way audit (this folder vs. `Widget_Specs/` vs. the HTML's Final Check tab) using the `widget-final-check-audit` skill. W03's doc was found stale in six places and has since been corrected using that same skill's diff-review flow. W01's audit found the Waterfall view was designed and coded but never wired into the live Switch Chart Type menu — resolved by cutting Waterfall from the doc (not enough time to build it in, per direct instruction) rather than building it. The other 10 in-progress files haven't been through this check yet, so treat their current text as unverified, not necessarily wrong.
- Don't reclassify a 🔵 file as ✅ just because its own header says "locked" — that language has been unreliable across this whole folder. Run the audit skill against the real build first.
- If a new widget's file is added here (W08 or W14, once their product decisions land), give it the same header/section template above and add a row to this table — don't let the table drift the way the old `Widget_Specs/00 - Index.md` status column did.
