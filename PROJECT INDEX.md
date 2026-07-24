# Shelby Financials Dashboard Re-platform — Project Index

> **Read this file first, then follow the links.** This file doesn't duplicate what's in each Step folder's own `00 - INDEX.md` — it ties them together: where every widget currently sits across the pipeline, what's still genuinely unresolved for each one, the real current folder structure, and where a new document belongs. Rewritten from scratch on 2026-07-20 — the previous version had been stale since 2026-07-07 and is not carried forward in any way; nothing below should be assumed to match anything from that old version.

**Keep this file current.** Every time a widget's status changes in any Step folder, or a folder gets renamed/added, this file should be updated in the same pass — that's the whole point of rewriting it now instead of letting it go stale again.

## What to work on next (priority)

Pulled from `Dashboard Tracker.xlsx`'s actual Priority column (F, on the "Dashboard Tracker" sheet) — a straight 1–17 rank, 1 = work on first. (An earlier draft of this table used P0–P3 priority buckets from a project-level screenshot you shared; those buckets don't exist in the live spreadsheet, which only has the 1–17 rank below, so this table now matches the real file instead.) Every widget in the project is listed here — a widget with no priority set in the tracker would show `N/A` rather than being dropped, and a widget is still listed even if its Step 4 link doesn't resolve (that hasn't happened for any row below, but the table is built to degrade that way rather than silently omit a row).

| Priority rank | # | Widget | Step 4 design status (tracker) |
|---|---|---|---|
| 1 | 01 | Budget Compared to Actual | ✅ [Complete](Step%204%20-%20Widget%20Final%20Design/W01%20-%20Budget%20Compared%20to%20Actual.md) |
| 2 | 02 | Pension Plans | ✅ [Complete](Step%204%20-%20Widget%20Final%20Design/W02%20-%20Pension%20Plans.md) |
| 3 | 03 | Payroll Distributions | ✅ [Complete](Step%204%20-%20Widget%20Final%20Design/W03%20-%20Payroll%20Distributions.md) |
| 4 | 04 | Remittance Pledges | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W04%20-%20Remittance%20Pledges.md) |
| 5 | 05 | Receivable Invoices Outstanding | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W05%20-%20Receivable%20Invoices%20Outstanding.md) |
| 6 | 06 | Insurance Billing Plans | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W06%20-%20Insurance%20Billing%20Plans.md) |
| 7 | 07 | Deposit Accounts | ✅ [Complete](Step%204%20-%20Widget%20Final%20Design/W07%20-%20Deposit%20Accounts.md) |
| 8 | 08 | My Status | ⚪ Not started (no Step 4 file exists) |
| 9 | 09 | Payroll Scheduled Time Off | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W09%20-%20Payroll%20Scheduled%20Time%20Off.md) |
| 10 | 10 | Loans With Balance Due | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W10%20-%20Loans%20With%20Balance%20Due.md) |
| 11 | 11 | Fixed Asset Values | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W11%20-%20Fixed%20Asset%20Values.md) |
| 12 | 13 | Purchasing Management | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W13%20-%20Purchasing%20Management.md) |
| 13 | 14 | Main Content Tasks | ⚪ Not started (no Step 4 file exists) |
| 14 | 15 | Bank Balances | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W15%20-%20Bank%20Balances.md) |
| 15 | 16 | Accounts Payable By Due Date | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W16%20-%20Accounts%20Payable%20By%20Due%20Date.md) |
| 16 | 17 | Gifts Pledges | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W17%20-%20Gifts%20Pledges.md) |
| 17 | 12 | *(Empty Slot)* | ➖ N/A — no widget assigned to this slot |

The tracker's own widget names matched Step 1's Widget Table exactly on every row (no naming mismatches — the "Deposits on Hand" mismatch noted in an earlier draft came from misreading a screenshot, not the real file's "Deposit Accounts" row).

This "Step 4 design status" column is pulled directly from `Dashboard Tracker.xlsx`'s Step 4 column, which you edited by hand on 2026-07-20 — it no longer reflects an independent audit of each Step 4 file's actual content, only what the tracker says. Links are kept for navigation even on "Not started" rows since a Step 4 file exists for most of them; the tracker's status is the number that counts here, not the file's presence.

## The pipeline, in order

| Step | Folder | What lives there | Status of the folder itself |
|---|---|---|---|
| 1 | [`Step 1 - Dashboard Research/`](Step%201%20-%20Dashboard%20Research/00%20-%20INDEX.md) | One frozen "what exists today" doc per widget (`01 - Name.md` … `17 - Name.md`), all following `TEMPLATE.md`'s 7-section shape. Real current tables/fields, current UI behavior, current pain points. **Frozen once correct** — never edited for redesign reasons. |
| 2 | [`Step 2 - Feedback/`](Step%202%20-%20Feedback/00%20-%20INDEX.md) | Raw and semi-processed discovery input: backend/data-accuracy questions, UX/usage questions, interview transcripts and their widget-tagged extracts, one-off comparison docs. A working layer — some files live, some frozen, some allowed to go stale until refreshed. |
| 3 | [`Step 3 - Mock_Work/`](Step%203%20-%20Mock_Work/00%20-%20INDEX.md) | The actual coded prototype (`Dashboard Widget Mockups.html`, the one real build) plus `Widget_Specs/` (the living per-widget idea file — options considered, including rejected ones) and `Desgin/pathway-ds-main/` (the Pathway design system components/tokens — read `pathway-for-claude.md` before editing any markup here). Expected to be the messiest folder; that's fine. As of 2026-07-23, `Create Mock Designs`, `Verify Mock Designs`, and `Fix Mock Designs` all write here directly and are chained together (Create hands off to Verify; Verify calls Fix up to 3 times per cycle if needed) — see that folder's own `00 - INDEX.md` for exactly what each one touches. |
| 4 | [`Step 4 - Widget Final Design/`](Step%204%20-%20Widget%20Final%20Design/00%20-%20INDEX.md) | The ONE living doc per widget that's reached design lock — must always match what's actually built in Step 3's HTML. A widget only leaves "in progress" once it's been checked against the real build (via the `widget-final-check-audit` skill), not just because its own header says "locked." |
| 5 | [`Step 5 - API documents/`](Step%205%20-%20API%20documents/00%20-%20INDEX.md) | The backend-facing spec per widget (tables, request params, response shapes, edge cases) — for developers and Confluence. A widget only becomes eligible here once it's ✅ Done in Step 4, not before. `Widget_Comparison_Classic.html`/`Widget_Comparison_New_Widgets.html` here are a fixed, read-only historical baseline — never edited. |
| 6 | [`Step 6 - Sign off document/`](Step%206%20-%20Sign%20off%20document/00%20-%20INDEX.md) | **New, 2026-07-21.** Management's own sign-off documents, exported from Confluence — **never edited by anyone working in this project.** Corresponds to `Dashboard Tracker.xlsx`'s Step 6 — Design Sign Off column (the tracker's actual last step). Contains management's own independent research and findings, which can and do diverge from what Steps 3–4 assumed. Mainly affects Step 5, since that's where backend assumptions get written down concretely — see that folder's own index for two live examples already found. |

**Where to add a new document:** if it's about what exists in the live system today, it goes in Step 1. If it's a question, interview, or piece of outside feedback, it goes in Step 2. If it's prototyping/coded-build work or an evolving per-widget idea file, it goes in Step 3. If it's the single current statement of a widget's locked design, it goes in Step 4 — there should only ever be one such file per widget. If it's backend/API-facing and the widget is already Done in Step 4, it goes in Step 5. If it's a management-authored sign-off export, it goes in Step 6 and is never edited — this project doesn't originate those documents, it only reads them. If you're not sure which, it's almost always Step 2 (raw input) or Step 3 (still-evolving work) — Step 1 and Step 4 are the two folders meant to stay settled once correct, and Step 6 is never anyone's to edit at all.

**Resolved naming collision:** an earlier version of this file called `Design Improvement Options.md` "Step 2." That file lives in `Step 3 - Mock_Work/` — **superseded as of 2026-07-23** (see the banner at the top of the file itself; `Widget_Specs/` and the live HTML are the current source now, not this file) — and the folder actually named `Step 2 - Feedback/` is the real Step 2. This file defers entirely to the real current folder names — there is no other "Step 2" anywhere in this project.

**New, 2026-07-21 — `Step 2 - Feedback/Market Research/`:** a dedicated folder, one file per widget (`WNN - Name.md`), for competitor/market research — how other companies present this kind of information, visuals and information included. This was added per direct instruction after a check for W15 Bank Balances confirmed its competitor research (a Hiline nonprofit-dashboard "runway" framing citation) already existed, but only inside `Step 3 - Mock_Work/Widget_Specs/W15-Bank-Balances.md` and `Step 4 - Widget Final Design/W15 - Bank Balances.md`'s `## How Other Companies Fulfil This Purpose` sections — split across two folders with no single home, and easy to lose track of in a future restructure. **As of 2026-07-21 this folder is structure only** — the 16 files (widget 12 excluded) are empty placeholders with a naming/cross-reference skeleton, not yet populated with real research. Populating them — and deciding whether to move, copy, or just link back to the existing Step 3/4 sections — is an explicit next step, not done in this pass. See `Step 2 - Feedback/Market Research/00 - INDEX.md` for per-widget status.

**`Dashboard Tracker.xlsx`** (project root) tracks per-widget progress separately from this doc set. Its "Step 3 / Step 4 / Step 5 / Step 6" columns are named to match this table's Step 3 - Mock_Work, Step 4 - Widget Final Design, Step 5 - API documents, and (as of 2026-07-21) Step 6 - Sign off document (Step 1 - Purpose and Step 2 - Feedback already matched and were left as-is). **Correction, 2026-07-21: an earlier version of this file called the tracker's Step 6 column "Test & Doc" with no corresponding folder — that was checked directly against the live spreadsheet and was wrong. The real header is "Step 6 Design Sign Off," and it now has a corresponding folder.** The tracker enforces a hard gate in its legend: a widget's Step 3 must be Complete before Step 4 starts, and Step 4 must be Complete before Step 5 starts — matching Step 5's own index rule that a widget only becomes eligible there once ✅ Done in Step 4. No equivalent gate is defined yet for Step 6 — it's new enough that the process for reconciling it against Steps 3–5 hasn't been built, per direct instruction that this is coming as a skill update next.

Its Step 4 and Step 5 columns were synced on 2026-07-20 to match `Step 4 - Widget Final Design/00 - INDEX.md` and `Step 5 - API documents/00 - INDEX.md` exactly (Pension Plans/Payroll Distributions/Deposit Accounts Complete in Step 4, Payroll Distributions Complete in Step 5, Deposit Accounts In Progress in Step 5, the empty widget-12 slot marked N/A in both). Its Step 2 and Step 3 columns were **not** touched — no per-widget status table exists anywhere in the project for Feedback or Mock_Work completion, so setting those columns to anything would be a guess rather than a synced fact; they're left at their prior values until such a source exists.

**Standing rule: whenever the tracker's Step columns are noticed to disagree with the real status in those Step folders' own `00 - INDEX.md`, fix the tracker in the same pass you notice it** — don't leave known staleness sitting there for a future pass.

**One-time exception, 2026-07-20:** the project owner hand-edited `Dashboard Tracker.xlsx` directly and asked that, just this once, the tracker's values flow *into* every Step index instead of the other direction — so every Step 1–5 index now carries a tracker-sourced status (added where none existed, added as a separate "Tracker status" column where an audit-verified status already existed, per each index's own note). This was a one-time sync, not a reversal of the standing rule above — the next time a mismatch is noticed, the tracker gets corrected to match the indexes again, not the other way round.

## Current folder structure

```
For Dashboard/
├── PROJECT INDEX.md                        ← this file
├── Dashboard Tracker.xlsx                   ← standalone tracker spreadsheet, not part of the Step pipeline
├── Git_Commands/
│   └── update-github.bat                    ← local git push helper script
├── Step 1 - Dashboard Research/
│   ├── 00 - INDEX.md
│   ├── TEMPLATE.md
│   └── 01 - Budget Compared to Actual.md … 17 - Gifts Pledges.md   (17 files, frozen)
├── Step 2 - Feedback/
│   ├── 00 - INDEX.md
│   ├── Backend SME Questions - How the Numbers Come About.md       (covers W01/W02/W03/W07 only)
│   ├── UX Specialist Questions - Master Tracker.md
│   ├── Ben Lane Interview - Tagged Q&A by Widget (2026-07-13).md
│   ├── Widget Usage Ranking and Default Dashboard Shortlist.docx
│   ├── Given to all menbers of the team..xlsx                      (⚠️ stale, last synced 2026-07-13)
│   ├── W03 Payroll Distributions - DR Comparison.md
│   ├── Interviews Transcripts/
│   │   └── 2026-07-13 - Ben Lane SME Interview - Widget Usage (Most vs Least Used).docx
│   └── Market Research/                      ← NEW, 2026-07-21 — structure only, no content yet (see below)
│       ├── 00 - INDEX.md
│       └── W01 - Budget Compared to Actual.md … W17 - Gifts Pledges.md   (16 files, W12 excluded)
├── Step 3 - Mock_Work/
│   ├── 00 - INDEX.md
│   ├── Dashboard Widget Mockups.html         ← the one real build (★ MASTER ★)
│   ├── mock-data.master.js                   ← readable mirror of the live data block, not authoritative
│   ├── mock-data.v1.js, mock_data_new.v1.js, extracted_check.v2.js, render-logic.v1.js   ← historical snapshots only
│   ├── check-rules.py                        ← whole-file, or --widget N scoped (added 2026-07-23); see this folder's 00 - INDEX.md
│   ├── Verify Findings.md                    ← written by Verify Mock Designs; overwritten each run, never deleted (persists even when clean)
│   ├── Data and Build Readiness - Developer Punch List.md
│   ├── Design Improvement Options.md          ← superseded 2026-07-23, see banner in the file
│   ├── Final Check - Items Needing Your Review.md
│   ├── Widget_Specs/
│   │   ├── 00 - Index.md
│   │   ├── General Widget Design Rules.md
│   │   └── W01-Budget-Compared-to-Actual.md … W17-Gifts-Pledges.md   (17 files, living)
│   └── Desgin/pathway-ds-main/                ← Pathway design system (vendored, read-only reference)
├── Step 4 - Widget Final Design/
│   ├── 00 - INDEX.md
│   └── W01 - Budget Compared to Actual.md … W17 - Gifts Pledges.md   (14 files — W08, W12, W14 don't exist yet)
├── Step 5 - API documents/
│   ├── 00 - INDEX.md
│   ├── How to Write a Widget API Spec.md
│   ├── Widget_Comparison_Classic.html          ← read-only historical baseline
│   ├── Widget_Comparison_New_Widgets.html      ← read-only historical baseline
│   ├── Budget Compared to Actual/Budget Compared to Actual - API Spec.md + ...(Confluence).html   (🟡 draft, needs review)
│   ├── Payroll Distributions/Payroll Distributions - API Spec.md + ...(Confluence).html   (🟡 draft, needs review — reopened 2026-07-21)
│   └── Deposit Accounts/Deposit Accounts - API Spec.md + ...(Confluence).html   (🟡 draft, needs review)
└── Step 6 - Sign off document/                 ← NEW, 2026-07-21 — management's own exports, never edited
    ├── 00 - INDEX.md
    ├── Payroll Distrubution/Payroll+Distributions.doc          (sic — filename/folder kept exactly as exported)
    └── Deposit On Hand (Deposit Accounts)/Deposits+On+Hand.doc
```

## Widget pipeline position

**Step 3/4/5 status columns below are synced from `Dashboard Tracker.xlsx` (you edited it directly; treated as the source of truth for this sync, 2026-07-20) — not from re-deriving status against the actual files.** Links to Step 3 spec files and Step 4/5 docs are kept for navigation even where the tracker says "Not started," since the file itself existing doesn't mean the tracker considers that stage done.

| # | Widget | Module | Step 1 | Step 2 feedback? | Step 3 spec | Step 3 Mock_Work | Step 4 design | Step 5 API spec |
|---|---|---|---|---|---|---|---|---|
| 01 | Budget Compared to Actual | Finance | ✅ | ✅ Backend SME | [spec](Step%203%20-%20Mock_Work/Widget_Specs/W01-Budget-Compared-to-Actual.md) | ✅ Complete | ✅ [Complete](Step%204%20-%20Widget%20Final%20Design/W01%20-%20Budget%20Compared%20to%20Actual.md) | 🔵 [In progress](Step%205%20-%20API%20documents/Budget%20Compared%20to%20Actual/Budget%20Compared%20to%20Actual%20-%20API%20Spec.md) |
| 02 | Pension Plans | Finance | ✅ | ✅ Backend SME | [spec](Step%203%20-%20Mock_Work/Widget_Specs/W02-Pension-Plans.md) | ✅ Complete | ✅ [Complete](Step%204%20-%20Widget%20Final%20Design/W02%20-%20Pension%20Plans.md) | ⚪ Not started |
| 03 | Payroll Distributions | Payroll | ✅ | ✅ Backend SME, Ben Lane, DR Comparison | [spec](Step%203%20-%20Mock_Work/Widget_Specs/W03-Payroll-Distributions.md) | ✅ Complete | ✅ [Complete](Step%204%20-%20Widget%20Final%20Design/W03%20-%20Payroll%20Distributions.md) | 🟡 [Draft — reopened](Step%205%20-%20API%20documents/Payroll%20Distributions/Payroll%20Distributions%20-%20API%20Spec.md) |
| 04 | Remittance Pledges | Finance | ✅ | ✅ UX tracker | [spec](Step%203%20-%20Mock_Work/Widget_Specs/W04-Remittance-Pledges.md) | 🔵 In progress | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W04%20-%20Remittance%20Pledges.md) | ⚪ Not started |
| 05 | Receivable Invoices Outstanding | Finance | ✅ | ✅ UX tracker | [spec](Step%203%20-%20Mock_Work/Widget_Specs/W05-Receivable-Invoices-Outstanding.md) | 🔵 In progress | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W05%20-%20Receivable%20Invoices%20Outstanding.md) | ⚪ Not started |
| 06 | Insurance Billing Plans | HR | ✅ | ✅ UX tracker | [spec](Step%203%20-%20Mock_Work/Widget_Specs/W06-Insurance-Billing-Plans.md) | 🔵 In progress | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W06%20-%20Insurance%20Billing%20Plans.md) | ⚪ Not started |
| 07 | Deposit Accounts | Finance | ✅ | ✅ Backend SME, Ben Lane | [spec](Step%203%20-%20Mock_Work/Widget_Specs/W07-Deposit-Accounts.md) | ✅ Complete | ✅ [Complete](Step%204%20-%20Widget%20Final%20Design/W07%20-%20Deposit%20Accounts.md) | 🔵 [In progress](Step%205%20-%20API%20documents/Deposit%20Accounts/Deposit%20Accounts%20-%20API%20Spec.md) |
| 08 | My Status | Other | ✅ | — none found | [spec — ⏸️ deferred](Step%203%20-%20Mock_Work/Widget_Specs/W08-My-Status.md) | ⚪ Not started | ⚪ Not started — deferred | ⚪ Not started |
| 09 | Payroll Scheduled Time Off | Payroll | ✅ | ✅ UX tracker | [spec](Step%203%20-%20Mock_Work/Widget_Specs/W09-Payroll-Scheduled-Time-Off.md) | 🔵 In progress | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W09%20-%20Payroll%20Scheduled%20Time%20Off.md) | ⚪ Not started |
| 10 | Loans With Balance Due | Finance | ✅ | ✅ Ben Lane | [spec](Step%203%20-%20Mock_Work/Widget_Specs/W10-Loans-With-Balance-Due.md) | 🔵 In progress | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W10%20-%20Loans%20With%20Balance%20Due.md) | ⚪ Not started |
| 11 | Fixed Asset Values | Finance | ✅ | ✅ UX tracker | [spec](Step%203%20-%20Mock_Work/Widget_Specs/W11-Fixed-Asset-Values.md) | 🔵 In progress | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W11%20-%20Fixed%20Asset%20Values.md) | ⚪ Not started |
| 12 | *(Empty Slot)* | Other | ✅ | — N/A | [spec — removed slot](Step%203%20-%20Mock_Work/Widget_Specs/W12-None.md) | ⚪ Not started | ➖ N/A | ➖ N/A |
| 13 | Purchasing Management | Finance | ✅ | ✅ UX tracker | [spec](Step%203%20-%20Mock_Work/Widget_Specs/W13-Purchasing-Management.md) | 🔵 In progress | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W13%20-%20Purchasing%20Management.md) | ⚪ Not started |
| 14 | Main Content Tasks | Other | ✅ | ✅ Ben Lane, UX tracker | [spec](Step%203%20-%20Mock_Work/Widget_Specs/W14-Main-Content-Tasks.md) | 🔵 In progress | ⚪ Not started (no Step 4 file exists) | ⚪ Not started |
| 15 | Bank Balances | Finance | ✅ | ✅ Ben Lane | [spec](Step%203%20-%20Mock_Work/Widget_Specs/W15-Bank-Balances.md) | 🔵 In progress | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W15%20-%20Bank%20Balances.md) | ⚪ Not started |
| 16 | Accounts Payable By Due Date | Finance | ✅ | ⚠️ indirect only | [spec](Step%203%20-%20Mock_Work/Widget_Specs/W16-Accounts-Payable-By-Due-Date.md) | 🔵 In progress | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W16%20-%20Accounts%20Payable%20By%20Due%20Date.md) | ⚪ Not started |
| 17 | Gifts & Pledges | Finance | ✅ | ✅ UX tracker | [spec](Step%203%20-%20Mock_Work/Widget_Specs/W17-Gifts-Pledges.md) | 🔵 In progress | ⚪ [Not started](Step%204%20-%20Widget%20Final%20Design/W17%20-%20Gifts%20Pledges.md) | ⚪ Not started |

**Status keys** — Step 1 and Step 2 are ✅ for all 17 widgets (both Complete in the tracker). Step 3/4/5 emoji: ✅ Complete, 🔵 In progress, ⚪ Not started, ➖ N/A (empty slot, no widget to track) — all three columns pulled directly from `Dashboard Tracker.xlsx`'s Step 3/4/5 columns. "⏸️ deferred" on the Step 3 spec link means the spec file itself says not to build against it yet — that's separate from the tracker status. "Step 2 feedback?" only reflects the three cross-widget tracker docs (Backend SME Questions, UX Specialist Tracker, Ben Lane Interview) — a widget can still have relevant Step 2 content even if unchecked here (e.g. W03 has its own dedicated `DR Comparison.md`).

**Step 6 isn't a column in this table yet** (added too recently to restructure this table in the same pass) — but two widgets already have a real Step 6 document: **W03 Payroll Distributions** and **W07 Deposit Accounts** (renamed by management to "Deposits On Hand," rename not yet executed across this project), both in [`Step 6 - Sign off document/`](Step%206%20-%20Sign%20off%20document/00%20-%20INDEX.md). W03 now also has a `Reconciliation - Payroll Distributions.md` there, naming four real contradictions between management's review and Steps 3–5 (including why W03's Step 5 spec was just reopened to draft) — found but not yet fixed in Steps 1–5's actual content.

## Unresolved questions per widget

Compiled from Step 2 trackers, Step 3 specs' open items, and Step 4 designs' own flagged gaps — not from casual re-reading, but not exhaustive either. Treat this as a starting point for a conversation, not a final audit; several of these are marked "possibly still open" where the source was ambiguous.

**W01 — Budget Compared to Actual** *(✅ Step 4 done, 2026-07-21 — see that doc's Fine-Tuning Notes for full history)*
- Resolved: drill-through cut (GL target page/URL doesn't exist and won't be built); fiscal year confirmed to vary per org, not a global constant (Backend SME Q2); Line Description closed as same mechanism as Special Report Title, with stronger evidence it maps to the existing Special Report Line endpoint; Waterfall view formally cut from the design (not enough time to consider further, not a quality rejection).
- Whether "original budget only" should ever allow a formally re-approved mid-year revision — unanswered (Backend SME Q1).
- Quarterly grouping's alignment to fiscal-year vs. calendar quarters isn't explicitly confirmed (Backend SME Q3).
- Weekly Period View is kept "pending developer feasibility confirmation" — no confirmed weekly GL grain exists today (Backend SME Q4).
- Consolidated/master-company rollup: fix is agreed in principle, exact join/aggregation logic still open (Backend SME Q5).
- Step 5 spec (draft, needs review) flags Custom Report/Special Report Line as the top sign-off risk — it's fully customer-configured, so the change needs to keep working after the fix.

**W02 — Pension Plans**
- Drill-through to the Pension Billing source page has no target URL yet.
- Found via code-level audit, not written into any spec doc: the "Plan Type" grouping (Defined Benefit/Contribution/403(b)) has no backing field in either the legacy system or the modern API, and the modern API's Grid/Chart endpoints only return one district at a time — no aggregate "all districts" shape exists yet.

**W03 — Payroll Distributions**
- Department field still needs backend confirmation against `PRHistory`/`PRHistoryCompensation`.
- Data Table's Amount-descending sort toggle is designed but not actually built yet.
- Drill-through target ("Payroll History module") page isn't confirmed.
- The pay-type/earnings-code breakdown (Regular, Vacation, OverTime, etc.) has no backing field in the legacy system, the modern API, or its own API spec — flagged repeatedly, never resolved.
- Step 5 spec (now approved) still carries three open sign-off items: whether `Distribution` is always department-shaped or varies by org, what `recurring` actually changes server-side, and the assumed definition of "prior period."

**W04 — Remittance Pledges**
- Whether "Current Month"/"Last Month" means a rolling 30-day window or the calendar month — explicitly unresolved, needed before build.
- Whether percentage fields re-baseline for "Current Month" or always compute against the full fiscal year — same unresolved flag.
- The functional difference between this widget and W17 (Gifts & Pledges) is still not confirmed.

**W05 — Receivable Invoices Outstanding**
- Whether a fiscal-year-scoped filter on invoice posting date is worth adding — flagged for the dev team, not revisited since.
- The Attachments/Note/Payments data sources behind the "View full invoice" drill-through aren't yet verified.
- Whether the AR aging bands (0-30/31-60/61-90/90+) match how users actually think about overdue invoices — unanswered.
- Whether users care more about invoice count or dollar amount overdue — possibly still open.

**W06 — Insurance Billing Plans**
- Whether Employer Contribution ($), Monthly Amount ($), and Status could become future columns/filters — explicitly out of scope for now, not answered.
- KPI-size filter behavior (Plan Type only, or no filter at all) is still hedged, not decided either way.
- What question a user is actually trying to answer here, whether the core comparison is across plan types/employees/time, and whether individual employee names should ever surface — all explicitly listed as still fully open.

**W07 — Deposit Accounts**
- Drill-through to the "Deposits On Hand" module is an open item, needs expert/dev input.
- Declining-account threshold (3 consecutive months) is called "pending sign-off" in the doc — but the mockup already ships that exact number live, so this needs an explicit yes/no, not just a doc fix.
- Step 5 spec (still draft) has two structural open questions: one endpoint vs. a split endpoint for balance/history, and whether daily history figures get pre-computed on a schedule or computed live per request — plus whether to keep both `Last Month` and `Last Year` as compare options.

**W08 — My Status** *(deferred)*
- Core model: keep the old up-to-21-query picker, redesign to a unified Item Type/Priority/KPI-tile schema, or a hybrid — unresolved, blocking any further work.
- Whether the mixed panel-vs-navigate row behavior should be preserved.
- How Small/Medium sizes should pick which queries to show when not all fit.

**W09 — Payroll Scheduled Time Off**
- KPI tile's dual-figure display (Pending Approvals + Out today/this week) still needs a fit test at 1×0.5 size; no fallback confirmed as final.
- Whether users want a full calendar view vs. a simple upcoming-absences list — posed, not answered.
- Whether the widget should show all staff or scope to the logged-in user's department — possibly still open.

**W10 — Loans With Balance Due**
- Status field (Active/In Arrears) has no confirmed backing field in the source data.
- The "clickable account name" drill-through has an unconfirmed destination.
- A fiscal-year-scoped filter on loan origination date is still an open ask to backend/dev.
- Most significant: Ben Lane's fuller interview answer suggests these HQ-to-church loans function more like donations, not scheduled repayments — which may mean the Active/In Arrears distinction doesn't matter to users at all. Explicitly flagged as "not yet reflected in the design" and worth confirming before more design/dev effort goes in.

**W11 — Fixed Asset Values**
- Data Table Sort default (Tag # ascending) is proposed only, not confirmed against the old design.
- Whether the widget's purpose is tracking total value vs. flagging assets needing attention (fully depreciated, due for replacement) — unanswered.
- Whether a depreciation-over-time curve should be visible, or current book value alone is enough — unanswered.

**W12 — *(Empty Slot)*** — nothing to resolve; no widget assigned.

**W13 — Purchasing Management**
- Department, Year, and an "Overdue" flag/date field are all still unconfirmed as real fields on purchasing records — flagged twice, not resolved either time.
- Data Table Sort default (Date Issued, most recent first) is proposed only.
- Whether POs should be groupable by department or vendor, beyond status, is listed as still fully open.

**W14 — Main Content Tasks** *(no longer deferred — being worked on, 2026-07-21)*
- Core question tentatively resolved: real feedback (Ben Lane interview + UX Tracker Q32–Q33) points to neither keeping the old design as-is nor rebuilding it as a personalized to-do list, but enhancing the existing nav-shortcut mechanism (module-labelled tiles, blended with the user's own saved shortcuts). Still needs the project owner's explicit sign-off to be considered fully resolved.
- Large size built in Step 3's Final Check tab; Small/Medium are only a provisional reduced version, not yet designed.
- Whether "Fixed" mode (pinning the widget to one module regardless of page) needs a small backend/state change, or is purely client-side widget state — still open.

**W15 — Bank Balances**
- Whether to surface a "Last Reconciled" date/badge is an open item — old design tracks it internally but never displays it, and no decision has been made either way.
- Possibly still open: Ben Lane's recommended "top 3–5 plus view-all" pattern for orgs with up to 50 accounts doesn't clearly match the locked size table (2–3 at Small, all at Large, no explicit "view all" link) — worth double-checking this was actually built as intended.

**W16 — Accounts Payable By Due Date**
- Drill-through to the full AP module is still "leaning yes, pending expert/dev confirmation" — not actually decided.
- Possibly still open, and only indirectly tagged: a mislabeling bug ("Over 60" actually meaning 90+ days) confirmed for W10 may also apply here — never confirmed per-widget.

**W17 — Gifts & Pledges**
- How Pledge Due/% Due should compute under the new Current Month/Year-to-Date presets (vs. Campaign Total) isn't fully specified — needs a product/dev decision before build.
- A distinct fundraising "Goal" field (vs. Pledge Total) was deliberately kept out of the locked design pending resolution — still unresolved.
- The functional difference between this widget and W04 (Remittance Pledges) still hasn't been confirmed.

## Non-widget items

- **`Dashboard Tracker.xlsx`** — a standalone tracker spreadsheet at the project root, outside the Step pipeline. Its Step 3/4/5 column headers and its Step3→4→5 completion gate are described under "The pipeline, in order" above; its per-widget priority rank feeds "What to work on next" above. Its own Complete/In Progress/Not Started values per widget aren't reconciled with this file's status tables yet.
- **`Dashboard Update Log.md`** — generated and updated by the `dashboard-tracker-keeper` skill each time it's run. Records what's drifted between this file, `Dashboard Tracker.xlsx`, and the Step 1-5 indexes (positively or negatively), plus a persistent list of open items that only clears when explicitly closed. Don't hand-edit it — it's fully regenerated on each run.
- **`Git_Commands/update-github.bat`** — a local git push helper script, unrelated to widget documentation.
- **`.git/`** — version control metadata, not a content folder.
