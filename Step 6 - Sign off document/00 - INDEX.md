# Step 6 — Sign off document — Folder Index

> **Read this file first.** This folder is fundamentally different from Steps 1–5: everything else in this project is a living document Claude and Oisin can edit. **Everything in this folder is authored by management, exported from Confluence, and must never be edited, renamed, or restructured by anyone working in this project.** These are the record of what management actually reviewed and signed off on — including their own independent research, findings, and directives, which can and do diverge from what Steps 1–5 assumed or built. Treat every file here as a fixed external input, the same way `Widget_Comparison_Classic.html` is treated as a fixed historical baseline in Step 5 — except these are current and authoritative, not historical.

## What this folder is

Corresponds to `Dashboard Tracker.xlsx`'s own **Step 6 — Design Sign Off** column (column L, the last of the six Step columns, header confirmed directly from the live spreadsheet on 2026-07-21). Added 2026-07-21, per direct instruction — before this, that tracker column had no corresponding folder anywhere in this project (see `PROJECT INDEX.md`'s old, now-corrected note, which mistakenly called it "Step 6 - Test & Doc").

Each widget that reaches this step gets its own subfolder containing a `.doc` file exported from Confluence (technically an MHTML export, not a real binary Word file — readable as HTML/text if you strip the MIME wrapper, but never edit the original). Subfolder and file names are whatever management named them when exporting — including any typos or naming choices that don't match this project's own naming (see "Naming mismatches," below). Don't rename them to match this project's conventions; they aren't this project's files.

## Files currently in this folder

| Widget (this project's name) | Subfolder (as management named it) | File | What's inside (section list) |
|---|---|---|---|
| W03 — Payroll Distributions | `Payroll Distrubution` *(sic — kept as exported, not a typo to fix)* | `Payroll+Distributions.doc` | Part A: What exists today (1–4, incl. a live audit dated 15 Jul 2026); Part B: Users and market (Personas, Jobs to be done, Context scenarios, Competitor benchmark, SME interview — Ben Lane 13 Jul 2026, Pay groups investigation); Part C: Designer brief (The brief, Significant design decisions and trade-offs, **Review of the proposed redesign — Widget Mockups v3, W03**, **Gaps and prioritized improvements**, Open questions and next steps, Sources) |
| W07 — Deposit Accounts | `Deposit On Hand (Deposit Accounts)` | `Deposits+On+Hand.doc` | What Deposits On Hand is, The widget today, The module today (no read layer), Personas, Designer brief, Competitor and analog benchmark, Design direction (three depth levels), **Gaps found in the live audit — 13 Jul 2026**, Top 10 insights, Open questions and next steps, Sources |

No other widgets have a Step 6 document yet.

## Naming mismatches worth knowing about up front

- **Management renamed W07 from "Deposit Accounts" to "Deposits On Hand"** — confirmed 2026-07-21, per direct instruction: this is deliberate, not a leftover legacy-system name. "Deposits On Hand" is the term most accountants understand better, and it matches the module name (their own gap #9: *"Widget says 'Deposit Accounts', module says 'Deposits On Hand', sibling says 'Bank Balances'"*). **The rename itself has not been executed yet** — it would touch `Step 1 - Dashboard Research/07 - Deposit Accounts.md`, `Widget_Specs/W07-Deposit-Accounts.md`, the built widget in `Dashboard Widget Mockups.html`, `Step 4 - Widget Final Design/W07 - Deposit Accounts.md`, the whole `Step 5 - API documents/Deposit Accounts/` folder, the tracker, and `PROJECT INDEX.md` — deliberately deferred to its own pass rather than done as a side effect of this note.
- **The subfolder `Payroll Distrubution` has a typo** in management's own export. Left exactly as exported.

## Why this folder mainly affects Step 5

Per direct instruction: management's sign-off documents contain their own independent research and findings, which can override or contradict what Steps 3–4 assumed — and when that happens, **Step 5's API specs are usually what needs to change**, since Steps 3/4 are frontend-facing design while Step 5 is the one place backend assumptions get written down concretely. Two concrete examples already sitting in these two documents, found while building this index (not yet acted on — see "Not done yet," below):

- **Payroll Distributions, flag F1 and F4** (Section 11 of that doc) directly answer the exact open question this project's `Step 5 - API documents/Payroll Distributions - API Spec.md` just flagged as unresolved: whether the row-grouping field is a real "Department" or a pay-type category. Management's own live audit (Beta1, company "Saint Michael Church") confirms the categories are **org-defined free text** (their example: "AA Aid", "Administration Staff") — not the fixed pay-type list (Regular, Vacation, OverTime, etc.) that Step 4's Purpose section assumed, and not a real department field either. Flag F3 also states outright that the prior-period comparison is **rejected** for this widget — a direct contradiction of Step 4's Fine-Tuning Notes, which describe a ▲/▼ comparison badge as already decided.
- **Deposit Accounts, gap #4**: "Balances have no comparison (delta, trend)" — flagged as a real gap to fix, which is relevant context for `Step 5 - API documents/Deposit Accounts/`'s own open Compare To questions.

## Reconciliation files

Where a widget's Step 6 document has actually been read closely enough to compare against Steps 1–5, the result goes in a `Reconciliation - <Widget Name>.md` file right next to that widget's sign-off export — ours to edit, unlike the `.doc` it sits beside. It records, per finding: what management found, what the chain currently says, the delta, which step(s) need to change, and whether that's been done yet.

| Widget | Reconciliation file | Status |
|---|---|---|
| W03 — Payroll Distributions | [Reconciliation - Payroll Distributions.md](Payroll%20Distrubution/Reconciliation%20-%20Payroll%20Distributions.md) | 4 contradictions found, 1 confirmed-aligned, 0 actioned into Steps 1–5 yet |
| W07 — Deposit Accounts / Deposits On Hand | *(none yet)* | Not started — that document's own gap list (14 items, including the rename) hasn't been compared against Steps 1–5 yet |

## Sign-off-aligned API specs

Where a widget's reconciliation has gone far enough to draft a full API spec built around management's actual requirements — rather than the still-separate, still-draft version in `Step 5 - API documents/` — that spec lives here too, next to the reconciliation file it's built from:

| Widget | File | Relationship to Step 5's own spec |
|---|---|---|
| W03 — Payroll Distributions | [Payroll Distributions - API Spec.md](Payroll%20Distrubution/Payroll%20Distributions%20-%20API%20Spec.md) + matching `.html` | A separate, parallel draft — not a replacement yet. `Step 5 - API documents/Payroll Distributions/`'s own spec still exists and is still 🟡 Draft. Reconciling the two into one is a later step, not done automatically by this one existing. |

## Not done yet — deliberately

Finding and recording a delta (the reconciliation file above) is a different action from actually fixing Steps 1–5 to match. **Nothing in Steps 1–5's actual content has changed because of anything in this folder yet** — the Payroll Distributions reconciliation file names four real contradictions and recommends fixes, but none of those fixes have been applied. Per direct instruction, the process for deciding when/how to actually apply a reconciliation's recommended changes is being built into a skill next — until that exists, treat every "Not yet actioned" status as exactly that, not as done.

## Step 6 tracker status — a discrepancy worth flagging, not yet resolved

`Dashboard Tracker.xlsx`'s Step 6 column currently shows **Payroll Distributions: Complete**, but **Deposit Accounts: Not Started** — even though a sign-off document already exists on disk for Deposit Accounts too. Not correcting this automatically, since it's not yet clear whether "Complete" in this column means "a document exists" or "fully reconciled against Steps 3–5" (Payroll Distributions' document existing clearly didn't mean fully reconciled, per the two examples above) — that definition should get settled as part of the skill work mentioned above, not guessed at here.

## Rules for future AI passes

1. **Never edit, rename, or move any file in this folder or its subfolders.** Not even to fix an obvious typo. These are exports from a system this project doesn't control.
2. **Never assume a `.doc` file is a real binary Word document.** These are Confluence MHTML exports — plain text/HTML under a `.doc` extension. Read-only inspection (e.g. extracting the HTML part to check content) is fine; writing back to the original file is not.
3. **When a new widget's sign-off document is added here, add a row to the table above** — subfolder name and filename exactly as exported, plus a real section-list summary (open and skim it, don't guess from the filename).
4. **Don't reconcile findings into Steps 3/4/5 as a side effect of updating this index or a reconciliation file.** Writing a `Reconciliation - <Widget Name>.md` file is analysis (what's the delta, what should change) — actually editing Step 3/4/5's content is a separate, later action, and comparison-feature-sized findings (see finding #2 in the Payroll Distributions file) need an explicit decision, not a unilateral edit.
5. **Reconciliation files live next to the sign-off doc they're comparing against**, named `Reconciliation - <Widget Name>.md`, inside that widget's subfolder — not inside Step 3, 4, or 5, even when a finding is mostly about one of those steps, since most findings end up touching more than one step at once.
