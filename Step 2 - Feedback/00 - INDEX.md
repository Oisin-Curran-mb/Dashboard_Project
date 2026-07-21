# Step 2 — Feedback: Folder Index

> **Read this file first.** Its job is to explain what this folder is, what every file does, how they connect to the rest of the project, and the rules to follow when adding, renaming, or auditing files here — for a human picking this up cold, or an AI working across files.

## What this folder is

This is **Step 2** in the dashboard re-platform pipeline: raw and semi-processed feedback — SME interviews, backend data-accuracy questions, UX/usage questions, and outside review documents — collected during discovery.

Unlike Step 1 (`Step 1 - Dashboard Research/`, frozen once correct) and the Widget Final Design docs (the one living doc, must always match reality), this folder is a **working layer**. Some files here are trackers meant to keep growing and getting pruned (open questions), some are one-time frozen transcripts (interviews), and some are explicitly allowed to go stale until someone has time to refresh them. That mix is intentional — don't try to force everything in this folder into one lifecycle.

## Files in this folder

| File | Type | Job |
|---|---|---|
| `00 - INDEX.md` | Index | This file. |
| `Backend SME Questions - How the Numbers Come About.md` | Live tracker | Questions for a technical/data SME (someone who knows the database and legacy calculation logic) — about whether the numbers are right, complete, and calculated correctly. Not a UX document. |
| `UX Specialist Questions - Master Tracker.md` | Live tracker | Questions for the usage/UX side — how widgets are actually used. Should ideally only carry questions that are still open; once a question is asked and answered, the answer belongs in an interview doc or a shareable Q&A doc, not left cluttering this tracker (flagged by the user as a cleanup still to do). |
| `Ben Lane Interview - Tagged Q&A by Widget (2026-07-13).md` | Frozen transcript extract | One specific interview's Q&A, tagged per widget (W01, W07, W10, etc.), feeding the "Interview Q&A" sections in `Step 4 - Widget Final Design/`. A new interview gets its **own** file — never appended to this one. |
| `Widget Usage Ranking and Default Dashboard Shortlist.docx` | Derived analysis | A deeper dive pulled from the Ben Lane interview — which widgets are used most/least, candidate default-dashboard shortlist. Structure/next-step still undecided. |
| `Given to all menbers of the team..xlsx` | ⚠️ Stale shareable doc | General Q&A doc meant to be shareable with the wider team. **Stale — last synced 2026-07-13.** Needs a refresh pass before it's shared again. Filename/typo kept as-is at the user's choice — don't "fix" it without asking. |
| `W03 Payroll Distributions - DR Comparison.md` | One-off comparison | Compares an external consultant's audit doc (DR) against our own W03 design decisions. Specific to W03, not a reusable template. Explicitly left messy for now — user has deferred cleanup. |
| `Interviews Transcripts/` | Subfolder | Raw interview transcripts as they come in. |

## Step 2 tracker status

`Dashboard Tracker.xlsx`'s "Step 2 - Feedback" column shows **Complete for all 17 widgets** (synced 2026-07-20, project owner's own edit treated as source of truth for this column). This folder didn't have a per-widget status table before — adding one here so it exists going forward if the tracker ever stops being uniform:

| # | Widget | Step 2 (tracker) |
|---|---|---|
| 01 | Budget Compared to Actual | ✅ Complete |
| 02 | Pension Plans | ✅ Complete |
| 03 | Payroll Distributions | ✅ Complete |
| 04 | Remittance Pledges | ✅ Complete |
| 05 | Receivable Invoices Outstanding | ✅ Complete |
| 06 | Insurance Billing Plans | ✅ Complete |
| 07 | Deposit Accounts | ✅ Complete |
| 08 | My Status | ✅ Complete |
| 09 | Payroll Scheduled Time Off | ✅ Complete |
| 10 | Loans With Balance Due | ✅ Complete |
| 11 | Fixed Asset Values | ✅ Complete |
| 12 | *(Empty Slot)* | ✅ Complete |
| 13 | Purchasing Management | ✅ Complete |
| 14 | Main Content Tasks | ✅ Complete |
| 15 | Bank Balances | ✅ Complete |
| 16 | Accounts Payable By Due Date | ✅ Complete |
| 17 | Gifts Pledges | ✅ Complete |

This tracker status reflects what the project owner marked in the spreadsheet, not an independent audit of whether every widget's feedback tracker rows are actually resolved — the open reconciliation item above (two trackers with open questions still in them) is still real even though the tracker marks this step Complete.

## Where this feeds into (the chain)

```
Step 2 — Feedback (this folder)     ← raw/semi-processed input, some live, some frozen, some stale
        │
        └── cited by → Step 4 - Widget Final Design/WNN - Name.md
                         "Interview Q&A" section, linked via Source: + Q-numbers
                         (e.g. Q17, Q34 → UX Specialist Questions - Master Tracker.md)
```

**Open reconciliation item:** `PROJECT INDEX.md` (currently frozen/not being edited) already defines "Step 2" as Design Improvement Options, not this folder. This folder was named Step 2 at the user's direct instruction. These two "Step 2"s need to be reconciled once `PROJECT INDEX.md` is rewritten — don't silently pick one.

## Rules for future AI passes (naming, structure, editing)

1. **Never rename or restructure a file unilaterally.** Always propose exactly 3 candidate names plus an explicit "keep current name" option, and wait for the human to pick one before touching anything. This applies to every file and folder, not just this one.
2. **Never delete a file** unless the human has explicitly authorized deleting that specific file, by name, in that request. Default mode is audit, not cleanup.
3. **Naming convention used in this project:** Title Case with spaces, `" - "` (space-hyphen-space) as the separator between a label and its qualifier, no periods except the file extension. Widget files are prefixed `WNN - Name` to match their number in the Widget Table (Step 1). Interview transcripts follow `YYYY-MM-DD - [Name] SME Interview - [Topic].ext`.
4. **New backend/data-accuracy questions** go in `Backend SME Questions - How the Numbers Come About.md`, not mixed into the UX tracker.
5. **New usage/UX questions** go in `UX Specialist Questions - Master Tracker.md`. Once answered and incorporated elsewhere, remove or archive the entry rather than leaving answered questions in a tracker meant to show what's still open.
6. **New interviews** get their own file in `Interviews Transcripts/`, never appended to an existing interview doc. If the interview needs a widget-tagged Q&A extract (like the Ben Lane one), that extract is a separate file in this folder, one per interview.
7. **Cross-references should cite by Q-number** (Q1, Q2, …) against `UX Specialist Questions - Master Tracker.md`, so links in `Step 4 - Widget Final Design/` survive if wording changes later — don't quote question text directly as the anchor.
8. **Flag staleness in this index, not just in the filename.** If a file's contents fall behind reality (like the team-shareable xlsx), mark it here with ⚠️ and the last-synced date; whoever refreshes it should update this table.
9. **Any new file added to this folder must get a one-line entry added to the table above** before the work is considered done. Don't leave new files undocumented.
10. **This folder is not frozen and not the single source of truth** — unlike Step 1 and Widget Final Design. It's fine for a doc here to become superseded by later work, but superseded docs should be flagged (see rule 8), not silently left inconsistent with what's actually built.
