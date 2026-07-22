# Skill: widget-market-research

## Purpose

Fills out a widget's `Step 2 - Feedback/Market Research/WNN - Name.md` file with real competitor/industry research — how other companies present this kind of information, visuals and layout included — following `Market Research/TEMPLATE.md`'s exact shape. A project-specific stand-in for the general-purpose `deep-research` skill, which can't actually run here: it depends on a `Workflow` tool this environment doesn't have. This skill reproduces the same Scope → Search → Fetch → Verify → Synthesize idea using `Agent` subagents and `WebSearch` instead.

## How it works

- **Scope:** picks a small number of real search angles for the specific widget's domain — not a fixed count padded to hit a number.
- **Search:** spawns one `Agent` subagent per angle, in parallel, each told to actually fetch real source pages and return concrete visual/layout claims with source + link + date, not generic dashboard advice.
- **Verify:** no automated 3-vote system (that's the one real gap vs. `deep-research`) — instead, a manual cross-check: a claim needs **2 independent URLs** to be marked a confirmed pattern; a claim from only one URL stays flagged as single-source, lower-confidence, not rounded up.
- **Synthesize:** writes the result straight into the widget's Market Research file per `TEMPLATE.md`, with every finding's URL(s) cited inline **and** repeated in the Sources list at the bottom — the two must always agree on what was actually used. Updates that widget's row in `Market Research/00 - INDEX.md`'s status table.

## Known limits

- No automated adversarial fact-checking — confidence levels are a manual read, not a statistical guarantee.
- Costs more time/tokens than a single search — meant for a widget about to get real design attention, not a reflex run across all 16 widgets at once.

## How to run it

Ask in plain language, e.g.:
- "Run market research on W15."
- "Look into what other companies do for Bank Balances."
- "Fill in the Market Research file for Purchasing Management."

## Files

- `SKILL.md` — the full instructions.
