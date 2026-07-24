# Skill: verify-mock-designs

## Purpose

Checks whether a widget's design options (or every widget's) actually hold up — against `check-rules.py`'s automated build-rule checks, a judgment pass for the rules that script can't automate, whether each option still matches what it was documented to be, and whether the data it needs actually exists. Second skill in the pipeline: `Create Mock Designs` builds options, this one checks them, and calls `Fix Mock Designs` to resolve what it finds. Read-only against the actual build — it never edits `Dashboard Widget Mockups.html`, `mock-data.master.js`, or any `Widget_Specs` file, so it's safe to run freely.

## How it works

- **Two scopes:** one widget (`--widget N` on `check-rules.py`, plus that widget alone for every other step) or the whole file (every widget with real content, one widget's worth of subagent work run in parallel for speed).
- **Step 2 — automated:** runs `Step 3 - Mock_Work/check-rules.py` — the exact same file `widget-final-check-audit` uses, not a copy — for T1/T4/T6/T9. Reads the full printed output, not just the exit code (which only reflects HIGH severity).
- **Step 3 — judgment pass:** T2 (fill, don't pin), T3 (frozen paths — does each option really have its own render branch), T5 (axis/value match), T8 (whitespace ladder). These require actually reading the render logic and data, not a regex.
- **Step 4 — concept-match:** reads the widget's `Widget_Specs/WNN-Name.md` most recent dated entry and confirms what's actually built matches what it says it should be.
- **Step 5 — data completeness:** confirms every displayed field exists in the live `MOCK_DATA` block (not the mirror) and cross-checks the `Data and Build Readiness - Developer Punch List.md` for known gaps — flags a design that quietly treats an unconfirmed field as settled fact.
- **Step 6 — integrity:** confirms the Final Check tab markup wasn't touched (and reports, without blocking on it, whether it shows a "Final design — locked" badge), and that `mock-data.master.js` still matches the live HTML exactly.
- **Step 7 — output and loop control (chaining added 2026-07-23):** everything found goes into one file, `Step 3 - Mock_Work/Verify Findings.md` — completely overwritten every run. As of the chained pipeline this file is **never deleted**, even when clean (it just says so) — it's meant to always show the last thing that actually happened, since the loop below runs with less direct supervision than a single manual check. If something's found and fewer than 3 `fix-mock-designs` attempts have happened yet this cycle, it calls Fix and re-checks from scratch (Step 2 onward) — a real loop, not a one-shot handoff. If issues remain after the 3rd fix attempt (the 4th check in the cycle), it stops calling Fix and reports directly to the user instead of looping further.

## Design rule checks added 2026-07-23

Alongside T2/T3/T5/T8, this skill now also checks (only for widgets whose Widget_Specs entry says they were built under the new rules — not retroactively expected of older widgets like W06 or W10):

- **Rule 8 — per-option filter independence.** Changing a filter on one option shouldn't change what the other two options show.
- **Rule 9 — mandatory sizes.** KPI/Medium/Large must all render something real for every option; a missing Small must be stated as a flagged, unconfirmed proposal in the Widget_Specs entry, not a silent gap.
- **Rule 11 — speculative data stays in the document.** Any proposed field/breakdown that isn't confirmed real must be flagged only in the Widget_Specs entry — if it shows up as a badge, disclaimer, or placeholder inside the live mockup itself, that's a finding.

## Known limits

- No fix logic of its own — it calls `fix-mock-designs` to do the repairing, capped at 3 attempts per cycle, and reports to the user rather than looping indefinitely if that's not enough.
- T9 and T6 in `check-rules.py` are pattern-matches, not structural checks, and can both over- and under-fire — this skill passes that caveat through rather than treating every automated hit as gospel.
- Whole-page mode's subagent fan-out depends on the invoking session having its own subagent tool available.

## Verified

Tested 2026-07-23 in single-widget mode against W10 (Loans With Balance Due), which already had real content from Create Mock Designs' dry run. Found genuine, non-trivial issues check-rules.py alone couldn't have caught: Options B and C's Small-size view toggle is a dead control (returns before checking `view`), and Option B's Widget_Specs write-up omits the "Status field unconfirmed" caveat that Options A and C both carry forward. Wrote a full report to `Verify Findings.md`; nothing was left behind that it shouldn't have been.

## How to run it

Ask in plain language, e.g.:
- "Verify W10's designs."
- "Check Bank Balances' design options."
- "Run a full verify pass on all the mockups."

## Files

- `SKILL.md` — the full instructions.
- `verify-mock-designs.skill` — packaged, installable copy.
