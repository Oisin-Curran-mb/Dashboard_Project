# API Spec Quality Rubric

> Written **before** any V2 spec was drafted, so the V2 output cannot be tuned to the scoring. Used to score any Step 5 spec, V1 or V2, on the same scale.

Six dimensions, 0–5 each, 30 total. Every score must cite specific evidence from the document being scored — a line, a table, a missing section. A score with no citation is not a score.

## Scale

| Score | Meaning |
|---|---|
| 0 | Absent. The document does not address this at all. |
| 1 | Mentioned in passing, no substance a developer could act on. |
| 2 | Partially addressed, with material gaps or inconsistency between instances. |
| 3 | Addressed adequately; a developer could proceed with questions. |
| 4 | Addressed well and consistently; few questions remain. |
| 5 | Complete and self-evidencing; a developer could build without coming back. |

## D1 — Data-source completeness and provenance

Are all tables, columns and formulas named, and can a reader tell verified fact from assumption?

- 5: every response field carries a provenance class (`STORED`/`DERIVED`/`NEW`/`UNVERIFIED`) and an evidence tag; formulas quotable in isolation; no unverified field presented as authoritative.
- 3: tables and formulas named, verification status stated in prose but not per field.
- 1: tables listed, no distinction between confirmed and assumed.

## D2 — Filter logic

Is each filter's execution decided, justified, and safe?

- 5: per-filter option source, cardinality, server-vs-client execution with justification, aggregate effect, cascade behaviour, "All" wire form, round-trip cost; plus combination semantics and a conflict rule.
- 3: filters exist as documented params with types and defaults; execution location implied but not stated; no conflict rule.
- 1: filters appear only as parameter names.

**Automatic cap at 2** if any filter operates client-side over a set with no stated bound, or if a client-side filter changes a server-computed aggregate — that produces a wrong number on screen.

## D3 — Volume, pagination and where work happens

Does the spec reason about data size, and does size drive the contract?

- 5: per-dataset row counts with cited basis, row width, payload estimate, an explicit verdict, a named server cost model, and a cache posture; where anything paginates, the full pagination contract is present — `sortBy`/`sortDir`, deterministic tiebreaker, `totalCount`, `pageSize` default and max, full-set aggregates, past-the-end behaviour.
- 3: pagination present and mostly correct, but volume is asserted rather than evidenced, or sort/tiebreaker is missing.
- 1: volume mentioned only as an open question.
- 0: no consideration of data size.

**Automatic cap at 2** if a dataset paginates while sort, filter or aggregation is left client-side.

## D4 — API decomposition

Is the endpoint count derived from stated reasons, and is it resolved?

- 5: an API inventory where every API cites a split trigger, plus a call-sequence table mapping every interaction to the calls it fires; a shared snapshot anchor where two calls must reconcile.
- 3: multiple APIs described and individually sensible, but the reason for the split is implicit and no call sequence exists.
- 1: one undifferentiated endpoint list.

**Automatic cap at 2** if the decomposition is left as an unresolved Option A / Option B — that is the question the spec exists to answer.

## D5 — Design coverage

Does everything on screen have a data source, and does every field have a consumer?

- 5: an explicit coverage matrix; every KPI, series, column, filter, view, drill, action and state mapped to an API and field; no orphan fields; gaps named as blocking items.
- 3: coverage inferable by reading the whole document and cross-checking by hand.
- 1: fields documented with no reference to what consumes them.

## D6 — Contract discipline

Is the document a present-tense contract a developer can read straight through?

- 5: no dates, no change narration, no version numbers, no option archaeology; state contracts for empty/partial/permission-denied/unavailable; auth and scoping stated; edge cases one line each; open items each naming what is undecided, who decides, and what is blocked.
- 3: readable and well organised, but carries some history or omits state contracts / auth.
- 1: the reader must work out which sentences are still true.

**Automatic cap at 3** if a dated changelog note appears in the status line or a section narrates its own revision history.

## Reporting

Score each dimension with its evidence, give the total out of 30, and state the caps that fired. Report the `spec_lint.py` HIGH/MED/LOW counts alongside — the linter is a floor, not the rubric: a spec can pass the linter and still score badly on D2–D4, which is the whole reason the rubric is judged separately.
