# Step 4 — Widget Final Design — Index

> **Read this file first.** This folder holds the ONE living design doc per widget — the doc that's supposed to always match what's actually built, after it's gone through `Step 1 - Dashboard Research/` (baseline), `Step 2 - Feedback/` (interviews/questions), and `Step 3 - Mock_Work/` (spec drafting + coded prototype). Renamed from `Widget Final Desgin` on 2026-07-20 — fixing the typo and bringing it in line with the project's Step-N naming (`Step 2 - Feedback`, `Step 3 - Mock_Work`, now `Step 4 - Widget Final Design`). All project-wide references to the old name were updated at the same time; `PROJECT INDEX.md` was left untouched since it's already flagged stale and frozen pending its own rewrite.

---

## What should be in each widget's file

**Upgraded template adopted 2026-07-27** — the full section-by-section definition lives in [`TEMPLATE PROPOSAL - Upgraded Widget Doc.md`](TEMPLATE%20PROPOSAL%20-%20Upgraded%20Widget%20Doc.md) in this folder; read that file when starting or reviewing a doc. Twelve docs were restructured to it on 2026-07-27 (W01/W02 additive-only since they're audit-verified; W04, W05, W06, W09, W10, W11, W13, W15, W16, W17 fully; W03/W07 deliberately left alone — they've reached Step 6 and are considered finished). Section order:

| Section | What goes here |
|---|---|
| Header block | `**Module:**`, `**Status:**`, `**Full history / rejected ideas:**` (link to `Step 3 - Mock_Work/Widget_Specs/WNN-Name.md`), `**Data source & formulas:**` (link to `Step 1 - Dashboard Research/NN - Name.md`), `**Confluence dossier:**` (link or "none yet"), `**Last verified against build:**` (date + how, or "not yet audited" — never hand-set without running the audit) |
| Evidence key | One line defining the marks: `[LIVE]` `[SME]` `[RESEARCH]` `[BUILD]` `[DOC]` `[TO CONFIRM]`. Conflicting evidence coexists, each with its own mark — neither side wins by default |
| `## Purpose` | One paragraph, current framing; data-shape assertions carry evidence marks |
| `## How Other Companies Fulfil This Purpose` *(optional)* | Only if outside research backs a specific choice — name the products |
| `## Data Contract` | Field → source table/endpoint → formula → evidence mark. Headline math, favourability logic, rounding/locale, freshness. Unconfirmed fields are `[TO CONFIRM]`, with a stated fallback if the answer is no |
| `## Widget States` | Full table, every row: no rights, empty, partial, loading, error, stale. "*Not yet specified*" is an honest row value; a missing row is not |
| `## Interaction Spec` | Per view: hover content, click behaviour, keyboard/focus; full flow for action widgets (confirm/success/failure/undo) |
| `## Filters` | Table of filter name → values/defaults |
| `## Data Table Sort` | Fixed order, user-toggle, and the trimmed-view rule (what "top N" is sorted by) |
| `## Drill-Through` | New/kept/open, plus the verified target or the explicit finding that none exists |
| `## Refresh` | Where the icon lives, at which sizes, and what refresh actually does |
| `## Views (Switch View)` | Every view as a subsection + Size behaviour table, plus overflow/truncation rules at real data volumes |
| `## Accessibility` | Three minimum commitments: colour never the only signal; values in the DOM, not hover-only; real table semantics + keyboard reachability |
| `## What Got Cut (and why)` | Dropped ideas, with evidence marks and owners on rejections/deferrals |
| `## Sign-off Input (Jo)` *(only when a Step 6 dossier exists)* | Her flags, one row each, statused Accepted / Rejected / Disputed — her findings never overwrite the body; Disputed keeps both sides' evidence until settled |
| `## Sign-off Readiness` | Self-audit table of every open item (type, owner, blocks build?). A doc isn't sign-off-ready until this table is empty or every row is an accepted risk |
| `## Fine-Tuning Notes` | Dated changelog entries, verbatim, especially "per direct instruction" — the strongest signal of the most recent real decision |

**One caution:** almost every file in this folder currently says `**Status:** 🟢 Final design — locked` in its own header — that line is not a reliable signal on its own (it's been true even for widgets later found to be stale against the real build). Treat the status column in this index as the one to trust, not the line inside each file. As of the 2026-07-27 upgrade, each doc's own `## Sign-off Readiness` table is the second signal to check: a "locked" header with open rows in that table is not actually sign-off-ready.

**Locked-doc rule (added 2026-07-27; structure refined 2026-07-28, per direct instruction):** a locked doc may only be changed by **version-tagged updates** recording a built Final's changes (no untagged edits, ever), and **nothing is ever deleted**. The refined structure keeps the live spec readable:

- The doc splits into two parts: a **`# Final Design (current)`** part at the top whose body describes ONLY the current shipped design, and a **`# Design History (superseded — kept for the record)`** part at the very end.
- When a version-tagged update supersedes earlier content, that earlier content is **moved into the dated Design History section**, not left interleaved in the live body. Each history entry is dated and reads as a timeline (what existed → what was designed and tested → what was dropped → superseded by the Final).
- Do not interleave `[v2]` blocks over kept `(v1, superseded)` blocks inside the live sections (the earlier, now-retired mechanic). The live section shows the current design cleanly; its superseded predecessor lives in Design History.

W05 is the reference example of this refined structure (2026-07-28). W01–W04 were tagged under the earlier interleaved mechanic and can be restructured to match when next touched; they are not wrong, just the older shape. (Owner reviewed both 2026-07-28 and finds the interleaved W01–W04 style readable, so those stay as-is; W05 keeps the two-part structure.)

**Built Finals (updated 2026-08-04):** W01, W02, W03, W04, W05, W06, and W07 all have built Final versions in `Step 3 - Mock_Work/Dashboard Widget Mockups.html`'s Final Check tab (Jo-design, tagged v2.0), each verified via the `build-final-widget` verify phase (`final-check-rules.py` + a per-widget Node DOM-shim driver), and each doc here carries a version-tagged update recording that build. **As of 2026-08-04 all seven are Complete through Step 5** across every index and `Dashboard Tracker.xlsx`; the Status and Tracker-status columns below now read ✅ Done / ✅ Complete for W01-W07 (W06 was the last to flip, once its Final was built and its Step 4 doc tagged). The earlier "tracker pending re-sync" caveat no longer applies to these seven rows.

---

## Widget status

**Two status columns below track different things.** "Status" is this folder's own audit-verified judgment (has the doc been checked against the real build via `widget-final-check-audit`?). "Tracker status" is pulled directly from `Dashboard Tracker.xlsx`'s Step 4 column, which the project owner edited by hand on 2026-07-20 — treated as the source of truth for that column, not re-derived from the audit. They can legitimately disagree (e.g. a file can exist and be under active work — "Status: 🔵 In progress" — while the tracker currently reads "Not started" because it hasn't been picked up as a priority yet). Don't collapse them into one column.

| # | Widget | Module | File | Status | Tracker status |
|---|--------|--------|------|--------|--------|
| 01 | Budget Compared to Actual | Finance | [W01](W01%20-%20Budget%20Compared%20to%20Actual.md) | ✅ Done | ✅ Complete |
| 02 | Pension Plans | Finance | [W02](W02%20-%20Pension%20Plans.md) | ✅ Done | ✅ Complete |
| 03 | Payroll Distributions | Payroll | [W03](W03%20-%20Payroll%20Distributions.md) | ✅ Done | ✅ Complete |
| 04 | Remittance Pledges | Finance | [W04](W04%20-%20Remittance%20Pledges.md) | ✅ Done | ✅ Complete |
| 05 | Receivable Invoices Outstanding | Finance | [W05](W05%20-%20Receivable%20Invoices%20Outstanding.md) | ✅ Done | ✅ Complete |
| 06 | Insurance Billing Plans | HR | [W06](W06%20-%20Insurance%20Billing%20Plans.md) | ✅ Done | ✅ Complete |
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
