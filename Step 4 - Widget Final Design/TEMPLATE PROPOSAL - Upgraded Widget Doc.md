# TEMPLATE PROPOSAL — Upgraded Step 4 Widget Doc

> **Status: PROPOSAL — not adopted.** Drafted 2026-07-27 from the Step 4 / Step 6 audit.
> Nothing in this folder has been changed to match it. If adopted, it replaces the
> section table in `00 - INDEX.md`, and existing files get upgraded as they next
> pass through `widget-final-check-audit` — not in one big pass.
>
> **Where it comes from:** the current Step 4 template (which is good at decision
> logging) plus the six categories the audit found systematically missing, all of
> which Jo's sign-off dossiers (Step 6) already model: widget states, per-claim
> evidence marks, accessibility, interaction behaviour, data grounding, and scale
> rules. W01 and W07 are the closest existing examples; W06 is the counter-example.

---

## Design goals of this template

1. **A Step 4 doc should survive being read by someone with no access to us.** An
   external dev team gets this doc + the built mockup. Anything only in our heads,
   or only discoverable by asking, is a spec gap.
2. **Every claim carries its evidence.** Jo's dossiers mark nearly every line
   VERIFIED LIVE / SME INTERVIEW / DESKTOP RESEARCH / TO CONFIRM. W03's invented
   pay-type list (disproved by her live audit) is what happens without this.
3. **"Locked" is earned, not declared.** The status header stays, but the new
   Sign-off Readiness section makes the doc list its own unresolved items — a doc
   with open TO CONFIRMs cannot read as fully locked.

---

## Section-by-section template

Sections marked **(kept)** are unchanged from the current template. Sections marked
**(NEW)** are the additions. Order matters — it's roughly "what and why" → "how it
behaves" → "what it needs" → "history".

### Header block (kept, extended)

`**Module:**` · `**Status:**` · `**Full history / rejected ideas:**` (link to Step 3
spec) · `**Data source & formulas:**` (link to Step 1 doc) — plus two new lines:

- `**Confluence dossier:**` link to the widget's space-DR page (or "none yet")
- `**Last verified against build:**` date + who/what ran the check (e.g.
  `widget-final-check-audit`, 2026-07-21). Never hand-set without running the check.

### Evidence key (NEW, one line)

Every factual claim below carries one of: `[LIVE]` verified in beta1/test1 on a
stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market
research · `[BUILD]` true of the mockup build · `[DOC]` backed by a written source
document (name it) · `[TO CONFIRM]` assumed, with the named owner who can confirm.
Claims with no mark are template boilerplate only.

**Conflicting evidence coexists — neither side wins by default.** If two sources
disagree (e.g. a live audit on one org vs. a document proving a structure exists),
both claims stay in the doc, each with its own mark and owner, until someone with
backend access settles it. Never delete one side's claim because the other side
wrote theirs later. Example: `Pay-type categories: fixed list exists [DOC — Oisin,
<source>] / observed as org-defined labels on beta1 [LIVE — Jo, 15 Jul]. Disputed —
awaiting backend confirmation.`

### ## Purpose (kept)

One paragraph, current framing. Every data-shape assertion in it gets an evidence
mark. (W03's lesson: "categories are Regular/Vacation/OverTime…" would have been
`[TO CONFIRM]`, and the reconciliation would have been a non-event.)

### ## How Other Companies Fulfil This Purpose (kept, optional)

Only if outside research backs a specific choice. Name the products (Jo names
Xero/QBO/Aplos/Gusto etc. — "competitors do this" without names is filler).

### ## Data Contract (NEW)

The doc's own statement of what the widget consumes — not a link-out. Table:
field/value shown → source table/endpoint → formula if computed → evidence mark.
Include: the headline number's exact math, favourability/direction logic (what
makes a value good/bad), rounding/currency/locale rules, and "data as of"
freshness behaviour. If a field's existence is unconfirmed (W03 Department, W13
Overdue), it appears here as `[TO CONFIRM — owner]`, and the design must say what
happens if the answer is no.

### ## Widget States (NEW — the biggest gap)

A row per state, no exceptions, even if the answer is "impossible, because X":

| State | Behaviour |
|---|---|
| No module rights / entitlement | What renders? Hidden entirely, or locked shell? |
| Empty (org has no data at all) | Icon + one line + real CTA (verified target) |
| Partial (some periods/accounts missing) | e.g. $0-baseline: never compute fake "100% over" |
| Loading | What triggers it (data-fetch only, not client re-renders); skeleton/spinner |
| Error / API failure | Message + retry affordance |
| Stale data | Is there a "data as of" signal? Refresh behaviour |

Jo's dossiers do exactly this, some rows marked SPEC AGREED with exact copy. That's
the standard: real copy, not "TBD".

### ## Interaction Spec (NEW)

Per view: what hover shows (tooltip content, not just "has tooltip"), what click
does on every clickable element, keyboard/focus behaviour for interactive controls.
For action widgets (W09 approve/reject, W13 PO edit): the full flow — confirmation,
success, failure, undo. The test: could a dev build the hover card without opening
the mockup's source? W01's sparkline-tooltip and KPI-popover entries show the level
needed; they just currently live buried in Fine-Tuning Notes.

### ## Filters (kept)

Same table: filter → values/defaults. Open items move to the Data Contract or
Sign-off Readiness sections rather than footnotes, so they can't hide.

### ## Data Table Sort (kept, extended)

Fixed order + user-toggle, **plus the trimmed-view rule**: when a size shows "top
N", state explicitly what N is sorted by (amount-descending, almost always — Jo's
F6 flag: an alphabetical top-3 is meaningless).

### ## Drill-Through (kept, extended)

New/kept/open as today, plus: the verified target (page + URL pattern) `[LIVE]`, or
the explicit finding that no destination exists and detail stays in-widget (Jo's
W07 doc proves the module has no read layer — that's the evidence standard).

### ## Refresh (kept)

Where the icon lives, at which sizes — plus what refresh actually does (spinner?
timestamp update? full re-fetch?).

### ## Views (Switch View) (kept, extended)

Every view as its own subsection + the Size behaviour table, **plus per size**: max
item counts, overflow behaviour at real volumes (50 accounts, not 5), truncation
rules, and which-N tie-breaks. A row like "top 3 plans" is incomplete without "by
what, and what happens to the rest".

### ## Accessibility (NEW)

Minimum three commitments, stated per widget, not globally assumed:
- Colour is never the only signal (the red/green favourability convention needs a
  sign/label pairing — currently unstated in all 14 docs).
- Chart values exist as text in the DOM (sr-only or visible table), not hover-only
  — this is a WCAG failure Jo's audits flag on the live product; don't rebuild it.
- Table semantics are real (`th`/scope), and interactive controls are reachable by
  keyboard.

### ## What Got Cut (and why) (kept, extended)

Same purpose, plus **rejections and deferrals get evidence marks and owners** —
"Comparison badges REJECTED (Jo, sign-off doc §10.3, three-paycheck-month problem)"
prevents a cut feature silently reappearing, which is exactly what happened on W03.

### ## Sign-off Input (Jo) (NEW — only when a Step 6 dossier exists for this widget)

An appendix, never a rewrite. When Jo's sign-off dossier (or its reconciliation
file) flags something about this widget, each flag gets one row here — the body of
this doc stays exactly as its author wrote it:

| Flag | Her finding (one line) | Status | Note |
|---|---|---|---|
| F4 | Categories are org-defined free text, not a fixed pay-type list | **Disputed** | Counter-evidence: <Oisin's document> — both claims recorded in Data Contract |
| F3 | Comparison badges rejected (three-paycheck-month) | Accepted / Rejected / Disputed | ... |

Status vocabulary: **Accepted** (her finding is right — action it as a normal
edit, with evidence mark), **Rejected** (her finding doesn't apply — say why),
**Disputed** (both sides have evidence — record both, name who settles it, change
nothing in the body until settled). This keeps her thinking in the doc without her
findings ever silently overwriting the project's own work — the same
"recorded, not auto-applied" rule Step 6's index already enforces.

### ## Sign-off Readiness (NEW — replaces trusting the "locked" line)

A self-audit table the doc keeps current:

| # | Open item | Type (field / math / product decision) | Owner | Blocks build? |
|---|---|---|---|---|

Plus one line: "This doc has N open items; it is not sign-off-ready until this
table is empty or every row is explicitly accepted as a known risk." A doc whose
header says locked but whose table has rows is telling the truth about itself.

### ## Fine-Tuning Notes (kept)

Dated changelog, unchanged — this is already the strongest part of the current
template. "Per direct instruction" entries remain the highest-authority signal.

---

## Companion doc this template assumes (one-time, not per widget)

**`Widget Chrome - Shared Components.md`** (doesn't exist yet — the single biggest
missing artifact). Defines once: refresh icon behaviour, filter/scope chips, the
3-dot menu, view toggles, skeleton/loading pattern, progress-bar component, drill
modal sizing, "data as of" stamp. Every widget doc then references it instead of
half-defining chrome per widget. This is Jo's "define the shared component
centrally" rule — and it's why her demo widgets stay consistent and ours drift.

## Adoption notes (if accepted)

- W01 and W07 need the least work — mostly relocating interaction facts out of
  Fine-Tuning Notes into the new sections and adding States/Accessibility.
- W06 is the best candidate for a first full trial run (weakest current doc,
  smallest sunk cost).
- The ~25 inline TBDs across the folder all move into their files' Sign-off
  Readiness tables in the same pass — no new investigation required, just honest
  bookkeeping of what's already flagged.
- `00 - INDEX.md`'s "don't trust the locked line" caution can eventually be
  retired: the Sign-off Readiness table makes each doc self-reporting.
