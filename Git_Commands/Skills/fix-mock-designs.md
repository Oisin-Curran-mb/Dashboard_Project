# Skill: fix-mock-designs

## Purpose

Resolves specific, already-identified problems with a widget's design options — from `Verify Findings.md` or from direct feedback in chat. Third skill in the pipeline: `Create Mock Designs` builds, `Verify Mock Designs` checks, this one patches exactly what's flagged. Deliberately narrow — it doesn't redesign and doesn't re-derive a concept from Step 1/2 research; if the real need is a new concept, that's `Create Mock Designs`'s job, not this one's.

## How it works

- **Two input sources:** `Step 3 - Mock_Work/Verify Findings.md` if it exists, or a problem described directly in chat. Either is a valid reason to act — a `Verify Findings.md` entry isn't required.
- **Classifies before touching anything:** code/markup bugs (safe to patch), documentation drift (safe to correct, append-only), mirror drift (re-sync to match the HTML), informational-only items (left alone, not every reported thing is a defect) — and, most importantly, **genuinely unresolved product/data questions**. For that last category the fix is disclosure, not invention: if a design's write-up presents an unconfirmed field as settled fact, the fix adds the caveat back — it never decides the field is real just to make the finding go away. This distinction exists because fabricating confirmed-looking certainty about something the backend hasn't actually confirmed is worse than leaving the original gap visible.
- **Same edit discipline as Create Mock Designs:** only the specific option branch/card that's actually broken, never the Final Check tab, never another widget's function.
- **Documents append-only:** a new dated entry in `Widget_Specs/WNN-Name.md` describing what was wrong and what changed — the original design entry is never edited or deleted.
- **Clears what it resolves:** removes fixed items' lines from `Verify Findings.md` (deletes the line, doesn't check it off) — but never deletes the file itself, even if nothing remains in it. That file's lifecycle belongs to `verify-mock-designs`, not this skill.
- **Chaining (added 2026-07-23):** normally invoked by `verify-mock-designs`, up to 3 times per cycle, as part of its own check → fix → re-check loop — not run standalone in the usual case, though it works identically if a user names a problem directly without a `Verify Findings.md` entry behind it.

## Design rule additions (added 2026-07-23)

If a widget's Widget_Specs entry marks it as built under Rules 8/9/11 (`General Widget Design Rules.md`), fixes must preserve those rules rather than undo them as a side effect: keep per-option filter scoping intact (Rule 8), keep KPI/Medium/Large mandatory with any Small omission still stated plainly (Rule 9), and keep any speculative-data caveats in the Widget_Specs fix note rather than letting them leak into the live mockup (Rule 11). Doesn't apply retroactively to widgets built before that date — nothing to preserve there yet.

## Known limits

- Doesn't self-verify — it never re-runs the check itself, on purpose. `verify-mock-designs` always re-checks fresh right after this returns, capped at 3 fix attempts per cycle before it stops and tells the user instead of looping further.
- Won't resolve a finding that's actually a genuine open product question (e.g. "is this field real") — it'll disclose the uncertainty instead of picking an answer, on purpose.

## Verified

Tested 2026-07-23 against W10's real `Verify Findings.md` output (not a synthetic test — these were genuine bugs Verify Mock Designs found). Fixed the Small-size dead-control bug in Options B and C's `WRENDER[10]` branches (confirmed via before/after diff — the fix nests the same pattern Option A already uses correctly), added back the Status-field-unconfirmed caveat to Option B's write-up (confirmed against the Punch List first, not just taken on faith), and appended a dated fix entry to `Widget_Specs` without touching the original design entry. Verified independently: only widget 10's `WRENDER[10]` region changed (all other widgets and the Final Check tab byte-identical to before), `Widget_Specs` diff was 111 insertions and 0 deletions, and `Verify Findings.md` correctly shrank to just the one informational item that was deliberately left unactioned.

## How to run it

Ask in plain language, e.g.:
- "Fix W10's designs."
- "Resolve the verify findings for Bank Balances."
- "Option B's dropdown doesn't work at Small size, can you fix it?"

## Files

- `SKILL.md` — the full instructions.
- `fix-mock-designs.skill` — packaged, installable copy.
